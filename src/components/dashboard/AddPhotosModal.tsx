"use client";

import posthog from "posthog-js";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  FileImage,
  Loader2,
  Search,
  Upload,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/context/ToastContext";
import { buildAssignments, formatFileSize } from "@/lib/utils/assignments";
import { getRecipients, type Recipient } from "@/lib/api/recipients";
import { requestPhotoUploadUrls, createPhotosBatch } from "@/lib/api/photos";
import {
  requestDocUploadUrls,
  createDocumentsBatch,
} from "@/lib/api/documents";
import {
  createVideoUploadUrl,
  createAudioUploadUrl,
  confirmAudioUpload,
} from "@/lib/api/messages";

interface AddPhotosModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after files are successfully uploaded + recorded on the backend. */
  onCreated?: () => void;
  /** Skip this onboarding step without uploading. */
  onSkip?: () => void;
  /** 'photo' (default) or 'document' — switches accepted types, limits, and endpoints. */
  kind?: "photo" | "document";
  title?: string;
  subtitle?: string;
  /** Onboarding mode: 1-file limit, audio/video → video message, Skip button. */
  isOnboarding?: boolean;
  /** Read-only view of already-uploaded photos (no dropzone/recipients, no upload). */
  readOnly?: boolean;
  /** Signed URLs of existing photos to show in read-only mode. */
  initialPhotos?: string[];
  /** If set, photos are uploaded into this folder. */
  folderId?: string;
}

const GROUP_OPTIONS = [
  "Assign Later",
  "All Recipients",
  "All Family",
  "All Friends",
  "All Others",
  "Release Manager",
];

const DOC_CATEGORIES = [
  { value: "legal", label: "Legal" },
  { value: "financial", label: "Financial" },
  { value: "insurance", label: "Insurance" },
  { value: "property", label: "Property" },
  { value: "digital_accounts", label: "Digital" },
  { value: "other", label: "Other" },
];

const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp,image/heic";
const DOC_ACCEPT = ".pdf,.docx,.doc,.jpg,.jpeg,.png,.heic";
const ONBOARDING_ACCEPT =
  ".pdf,.docx,.doc,.jpg,.jpeg,.png,.heic,video/*,audio/*";
const MAX_FILES = 10;
const PHOTO_MAX_BYTES = 10 * 1024 * 1024;
const DOC_MAX_BYTES = 25 * 1024 * 1024;

const isMediaFile = (f: File) =>
  f.type.startsWith("audio/") || f.type.startsWith("video/");

function deriveDocFileType(mimeType: string): string {
  const map: Record<string, string> = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "application/msword": "doc",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/heic": "heic",
  };
  return map[mimeType] || "pdf";
}

function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

export default function AddPhotosModal({
  open,
  onClose,
  onCreated,
  onSkip,
  kind = "photo",
  title = "Add Photos",
  subtitle = "Upload your most cherished photos — moments you want your family to see and keep forever. They'll be safely stored and shared when your Tether is released.",
  isOnboarding = false,
  readOnly = false,
  initialPhotos = [],
  folderId,
}: AddPhotosModalProps) {
  const { showToast } = useToast();
  const isDoc = kind === "document";
  const maxBytes = isDoc ? DOC_MAX_BYTES : PHOTO_MAX_BYTES;
  const sizeLabel = isDoc ? "25 MB" : "10 MB";
  const noun = isDoc ? "document" : "photo";

  const [files, setFiles] = useState<File[]>([]);
  const [photoTitle, setPhotoTitle] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedIndividuals, setSelectedIndividuals] = useState<string[]>([]);
  const [showIndividuals, setShowIndividuals] = useState(true);
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Object URLs for image previews (null for non-image files). Revoked when the
  // selection changes or the modal unmounts.
  const previews = useMemo(
    () =>
      files.map((f) =>
        f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
      ),
    [files],
  );
  useEffect(() => {
    return () => {
      previews.forEach((u) => u && URL.revokeObjectURL(u));
    };
  }, [previews]);

  // Reset the form ONLY when the modal transitions to open — never on a
  // re-render or after an upload error, so the user's selection is preserved.
  useEffect(() => {
    if (!open) return;
    setFiles([]);
    setPhotoTitle("");
    setCategory("");
    setNotes("");
    setSelectedGroups([]);
    setSelectedIndividuals([]);
    setShowIndividuals(true);
    setSearch("");
    setErrors([]);
    setUploading(false);
    setProgress({ current: 0, total: 0 });
  }, [open]);

  // Load real recipients for the "Search by name…" picker.
  useEffect(() => {
    if (!open || readOnly) return;
    let active = true;
    (async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
      try {
        const data = await getRecipients(token);
        if (active) setRecipients(data);
      } catch {
        /* non-fatal — picker stays empty */
      }
    })();
    return () => {
      active = false;
    };
  }, [open]);

  // Escape-to-close + scroll lock.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  // Assign Later, groups, and individuals are mutually exclusive modes.
  const toggleGroup = (g: string) => {
    if (g === "Assign Later") {
      // Assign Later stands alone — selecting it clears everything else.
      setSelectedIndividuals([]);
      setSelectedGroups((prev) =>
        prev.includes("Assign Later") ? [] : ["Assign Later"],
      );
      return;
    }
    // Selecting a real group clears individuals and Assign Later.
    setSelectedIndividuals([]);
    setSelectedGroups((prev) => {
      const withoutLater = prev.filter((x) => x !== "Assign Later");
      return withoutLater.includes(g)
        ? withoutLater.filter((x) => x !== g)
        : [...withoutLater, g];
    });
  };

  const toggleIndividual = (id: string) => {
    // Selecting an individual clears all groups (including Assign Later).
    setSelectedGroups([]);
    setSelectedIndividuals((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const mergeFiles = (incoming: File[]) => {
    const errs: string[] = [];
    const maxAllowed = isOnboarding ? 1 : MAX_FILES;
    setFiles((prev) => {
      const seen = new Set(
        prev.map((f) => `${f.name}::${f.size}::${f.lastModified}`),
      );
      const next = isOnboarding ? [] : [...prev]; // onboarding: always replace with new selection
      for (const f of incoming) {
        const key = `${f.name}::${f.size}::${f.lastModified}`;
        if (seen.has(key) && !isOnboarding) continue;
        // In onboarding, allow audio/video without size check (backend limits apply)
        if (!isMediaFile(f) && f.size > maxBytes) {
          errs.push(`${f.name} exceeds ${sizeLabel} limit`);
          continue;
        }
        if (next.length >= maxAllowed) {
          if (isOnboarding)
            errs.push("Only 1 file can be uploaded in this step");
          else
            errs.push(
              `Maximum ${MAX_FILES} ${isDoc ? "documents" : "photos"} per upload`,
            );
          break;
        }
        seen.add(key);
        next.push(f);
      }
      return next;
    });
    setErrors(errs);
  };

  const handlePickFiles = () => fileInputRef.current?.click();
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list) return;
    mergeFiles(Array.from(list));
    e.target.value = "";
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const list = e.dataTransfer.files;
    if (!list) return;
    mergeFiles(Array.from(list));
  };
  const removeFile = (idx: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleMediaAsMessage = async (file: File, token: string) => {
    const assignments = [{ scope: "assign_later" as const }];
    if (file.type.startsWith("video/")) {
      const { uploadUrl } = await createVideoUploadUrl(token, {
        title: "untitled",
        assignments,
      });
      const res = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!res.ok) throw new Error("Video upload failed. Please try again.");
    } else {
      const { signedUploadUrl, messageId } = await createAudioUploadUrl(token, {
        title: "untitled",
        assignments,
        fileType: file.type,
      });
      const res = await fetch(signedUploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!res.ok) throw new Error("Audio upload failed. Please try again.");
      await confirmAudioUpload(token, messageId, {
        durationSeconds: 0,
        fileSizeBytes: file.size,
      });
    }
  };

  const handleUpload = async () => {
    if (uploading) return;
    setErrors([]);
    if (files.length === 0) {
      setErrors([`Please select at least one ${noun} to upload.`]);
      return;
    }
    if (isDoc && !category) {
      setErrors(["Please select a category."]);
      return;
    }

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      showToast("Your session has expired. Please sign in again.", "error");
      return;
    }

    // In onboarding mode, route audio/video to message creation.
    if (isOnboarding && files.length > 0 && isMediaFile(files[0])) {
      setUploading(true);
      try {
        await handleMediaAsMessage(files[0], token);
        showToast("File saved as a message", "success");
        onCreated?.();
        onClose();
      } catch (error) {
        showToast(
          error instanceof Error ? error.message : "Upload failed",
          "error",
        );
      } finally {
        setUploading(false);
      }
      return;
    }

    setUploading(true);
    setProgress({ current: 0, total: files.length });

    try {
      const reqFiles = files.map((f) => ({
        fileName: f.name,
        fileType: f.type,
        fileSizeBytes: f.size,
      }));

      // Step 1 — signed upload URLs.
      const uploadUrls = isDoc
        ? await requestDocUploadUrls(token, reqFiles)
        : await requestPhotoUploadUrls(token, reqFiles);

      // Step 2 — upload each file directly to Supabase Storage.
      const results = await Promise.allSettled(
        uploadUrls.map(async (urlInfo) => {
          const file = files[urlInfo.fileIndex];
          const response = await fetch(urlInfo.signedUploadUrl, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type },
          });
          if (!response.ok) throw new Error(`Upload failed for ${file.name}`);
          let dims = { width: 0, height: 0 };
          if (!isDoc) dims = await getImageDimensions(file);
          setProgress((prev) => ({ ...prev, current: prev.current + 1 }));
          return { urlInfo, file, dims };
        }),
      );

      const succeeded = results.flatMap((r) =>
        r.status === "fulfilled" ? [r.value] : [],
      );
      const failed = results.filter((r) => r.status === "rejected");

      if (succeeded.length === 0) {
        throw new Error("All uploads failed. Please try again.");
      }

      const assignments = buildAssignments(selectedGroups, selectedIndividuals);

      // Step 3 — create records in the DB.
      if (isDoc) {
        await createDocumentsBatch(token, {
          documents: succeeded.map((s) => ({
            storagePath: s.urlInfo.storagePath,
            originalFilename: s.file.name,
            fileType: deriveDocFileType(s.file.type),
            fileSizeBytes: s.file.size,
            mimeType: s.file.type,
            category,
          })),
          note: notes || undefined,
          assignments,
        });
      } else {
        await createPhotosBatch(token, {
          photos: succeeded.map((s) => ({
            storagePath: s.urlInfo.storagePath,
            fileType: s.file.type.replace("image/", ""),
            fileSizeBytes: s.file.size,
            width: s.dims.width || undefined,
            height: s.dims.height || undefined,
            title:
              photoTitle.trim() ||
              s.file.name.replace(/\.[^.]+$/, "") ||
              undefined,
          })),
          caption: notes || undefined,
          folderId: folderId || undefined,
          assignments,
        });
      }

      if (isDoc) {
        posthog.capture("documents_uploaded", { count: succeeded.length });
      } else {
        posthog.capture("photos_uploaded", { count: succeeded.length });
      }
      showToast(
        `${succeeded.length} ${noun}${succeeded.length > 1 ? "s" : ""} uploaded`,
        "success",
      );
      if (failed.length > 0) {
        showToast(
          `${failed.length} file${failed.length > 1 ? "s" : ""} failed to upload`,
          "error",
        );
      }
      onCreated?.();
      onClose();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Upload failed",
        "error",
      );
    } finally {
      setUploading(false);
    }
  };

  const filteredIndividuals = recipients.filter((i) =>
    i.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={
          isOnboarding ? ONBOARDING_ACCEPT : isDoc ? DOC_ACCEPT : PHOTO_ACCEPT
        }
        multiple={!isOnboarding}
        onChange={handleFilesChange}
        className="hidden"
      />
      <div
        className="flex min-h-full items-center justify-center px-2 sm:px-4 py-4 sm:py-10"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="relative bg-white w-full"
          style={{
            maxWidth: 448,
            borderRadius: 10,
            boxShadow:
              "0px 8px 10px -6px rgba(0,0,0,0.1), 0px 20px 25px -5px rgba(0,0,0,0.1)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute cursor-pointer top-5 right-5 sm:top-[22px] sm:right-6"
            style={{ width: 22, height: 22, opacity: 0.7, borderRadius: 2.74 }}
          >
            <X className="w-[22px] h-[22px] text-[#0A0A0A]" strokeWidth={2} />
          </button>

          {/* Header */}
          <div className="px-5 sm:px-6 pt-6 sm:pt-[22px] pr-12 sm:pr-14">
            <h2
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: 23,
                lineHeight: "28px",
                color: "#101828",
              }}
            >
              {readOnly ? "Your Photos" : title}
            </h2>
            {!readOnly && subtitle && (
              <p
                className="mt-[7px]"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: "20px",
                  letterSpacing: "-0.15px",
                  color: "#717182",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Body */}
          <div className="flex flex-col gap-5 px-5 sm:px-6 pt-5 pb-5">
            {readOnly ? (
              <ReadOnlyPhotos urls={initialPhotos} />
            ) : (
              <>
                {/* Dropzone */}
                <div className="flex flex-col gap-3">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={handlePickFiles}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handlePickFiles();
                      }
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="w-full flex flex-col items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
                    style={{
                      minHeight: 146,
                      borderRadius: 10,
                      border: "1.25px dashed #D1D5DC",
                      background: "#FFFFFF",
                      padding: "24px",
                    }}
                  >
                    <Upload
                      className="w-12 h-12 text-[#99A1AF]"
                      strokeWidth={1.75}
                    />
                    <span
                      className="mt-3"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                        fontSize: 14,
                        lineHeight: "20px",
                        letterSpacing: "-0.15px",
                        color: "#4A5565",
                      }}
                    >
                      Drop files here or click to browse
                    </span>
                    <span
                      className="mt-1"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                        fontSize: 12,
                        lineHeight: "16px",
                        color: "#99A1AF",
                      }}
                    >
                      {isOnboarding
                        ? "1 file · PDF, DOCX, images, video, or audio"
                        : isDoc
                          ? `Up to ${MAX_FILES} files · ${sizeLabel} each`
                          : "You can select multiple images at once"}
                    </span>
                  </div>

                  {errors.length > 0 && (
                    <div className="flex flex-col gap-1">
                      {errors.map((err, i) => (
                        <p
                          key={i}
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 400,
                            fontSize: 13,
                            lineHeight: "18px",
                            color: "#FB2C36",
                          }}
                        >
                          {err}
                        </p>
                      ))}
                    </div>
                  )}

                  {files.length > 0 && (
                    <div
                      className="flex flex-wrap gap-2 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#D1D5DC] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
                      style={{
                        maxHeight: 180,
                        scrollbarWidth: "thin",
                        scrollbarColor: "#D1D5DC transparent",
                      }}
                    >
                      {files.map((f, idx) => {
                        const preview = previews[idx];
                        return (
                          <div
                            key={`${f.name}-${f.size}-${idx}`}
                            className="relative flex-shrink-0"
                            style={{
                              width: 72,
                              height: 72,
                              borderRadius: 8,
                              overflow: "hidden",
                              border: "1px solid rgba(0,0,0,0.08)",
                              background: "#F9FAFB",
                            }}
                            title={`${f.name} · ${formatFileSize(f.size)}`}
                          >
                            {preview ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={preview}
                                alt={f.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center px-1 gap-1">
                                <FileImage
                                  className="w-5 h-5 text-[#4F46E5]"
                                  strokeWidth={2}
                                />
                                <span
                                  className="truncate w-full text-center"
                                  style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: 9,
                                    lineHeight: "12px",
                                    color: "#717182",
                                  }}
                                >
                                  {f.name}
                                </span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeFile(idx)}
                              aria-label={`Remove ${f.name}`}
                              className="absolute flex items-center justify-center cursor-pointer hover:opacity-90"
                              style={{
                                top: 3,
                                right: 3,
                                width: 18,
                                height: 18,
                                borderRadius: 9999,
                                background: "rgba(0,0,0,0.55)",
                              }}
                            >
                              <X
                                className="w-3 h-3 text-white"
                                strokeWidth={2.5}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Category (documents only) */}
                {isDoc && (
                  <div className="flex flex-col gap-2">
                    <label
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        fontSize: 14,
                        lineHeight: "14px",
                        letterSpacing: "-0.15px",
                        color: "#0A0A0A",
                      }}
                    >
                      Category <span style={{ color: "#FB2C36" }}>*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full focus:outline-none appearance-none cursor-pointer"
                        style={{
                          height: 44,
                          borderRadius: 8,
                          border: "1.25px solid rgba(0,0,0,0.1)",
                          background: "#F3F3F5",
                          padding: "4px 36px 4px 12px",
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 400,
                          fontSize: 14,
                          letterSpacing: "-0.15px",
                          color: category ? "#0A0A0A" : "#717182",
                        }}
                      >
                        <option value="" disabled>
                          Select category
                        </option>
                        {DOC_CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="w-4 h-4 text-[#717182] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        strokeWidth={2}
                      />
                    </div>
                  </div>
                )}

                {/* Title */}
                {!isDoc && (
                  <div className="flex flex-col gap-2">
                    <label
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        fontSize: 14,
                        lineHeight: "14px",
                        letterSpacing: "-0.15px",
                        color: "#0A0A0A",
                      }}
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      value={photoTitle}
                      onChange={(e) => setPhotoTitle(e.target.value)}
                      placeholder="e.g. Family reunion 2024"
                      className="w-full focus:outline-none"
                      style={{
                        height: 44,
                        borderRadius: 8,
                        border: "1.25px solid rgba(0,0,0,0.1)",
                        background: "#F3F3F5",
                        padding: "4px 12px",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                        fontSize: 14,
                        lineHeight: "20px",
                        letterSpacing: "-0.15px",
                        color: "#0A0A0A",
                      }}
                    />
                  </div>
                )}

                {/* Caption */}
                <div className="flex flex-col gap-2">
                  <label
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: 14,
                      lineHeight: "14px",
                      letterSpacing: "-0.15px",
                      color: "#0A0A0A",
                    }}
                  >
                    {isDoc ? "Notes (optional)" : "Caption (optional)"}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional information..."
                    rows={2}
                    className="w-full focus:outline-none resize-none"
                    style={{
                      minHeight: 64,
                      borderRadius: 8,
                      border: "1.25px solid rgba(0,0,0,0.1)",
                      background: "#F3F3F5",
                      padding: "8px 12px",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 400,
                      fontSize: 14,
                      lineHeight: "20px",
                      letterSpacing: "-0.15px",
                      color: "#0A0A0A",
                    }}
                  />
                </div>

                {/* Recipients */}
                <div className="flex flex-col gap-2">
                  <label
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: 14,
                      lineHeight: "14px",
                      color: "#0A0A0A",
                    }}
                  >
                    Recipients
                  </label>

                  <div className="flex flex-col gap-2">
                    {GROUP_OPTIONS.map((g) => {
                      const isAssignLater = g === "Assign Later";
                      const selected = selectedGroups.includes(g);
                      return (
                        <GroupRow
                          key={g}
                          label={g}
                          selected={selected}
                          variant={isAssignLater ? "yellow" : "default"}
                          onToggle={() => toggleGroup(g)}
                        />
                      );
                    })}
                  </div>

                  {/* Show / Hide individuals */}
                  <button
                    type="button"
                    onClick={() => setShowIndividuals((s) => !s)}
                    className="w-full flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 mt-1"
                    style={{
                      height: 36,
                      borderRadius: 8,
                      border: "1.1px solid rgba(0,0,0,0.1)",
                      background: "#FFFFFF",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: 14,
                      lineHeight: "20px",
                      color: "#0A0A0A",
                    }}
                  >
                    {showIndividuals ? (
                      <ChevronUp
                        className="w-4 h-4 text-[#0A0A0A]"
                        strokeWidth={2}
                      />
                    ) : (
                      <ChevronDown
                        className="w-4 h-4 text-[#0A0A0A]"
                        strokeWidth={2}
                      />
                    )}
                    {showIndividuals ? "Hide Individuals" : "Show Individuals"}
                  </button>

                  {/* Individuals search + list */}
                  {showIndividuals && (
                    <div className="flex flex-col gap-2 mt-1">
                      <div
                        className="w-full flex items-center gap-2"
                        style={{
                          height: 36,
                          borderRadius: 8,
                          background: "#F3F3F5",
                          padding: "4px 12px",
                        }}
                      >
                        <Search
                          className="w-4 h-4 text-[#717182] flex-shrink-0"
                          strokeWidth={2}
                        />
                        <input
                          type="text"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search by name..."
                          className="flex-1 bg-transparent outline-none min-w-0"
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 400,
                            fontSize: 14,
                            lineHeight: "20px",
                            color: "#0A0A0A",
                          }}
                        />
                      </div>

                      <div
                        className="flex flex-col gap-2 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#D1D5DC] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
                        style={{
                          maxHeight: 150,
                          borderRadius: 10,
                          border: "1.1px solid rgba(0,0,0,0.1)",
                          background: "#F9FAFB",
                          padding: "8px",
                          scrollbarWidth: "thin",
                          scrollbarColor: "#D1D5DC transparent",
                        }}
                      >
                        {filteredIndividuals.length === 0 ? (
                          <p
                            className="text-center py-4"
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: 13,
                              color: "#717182",
                            }}
                          >
                            {recipients.length === 0
                              ? "No recipients yet."
                              : "No matches."}
                          </p>
                        ) : (
                          filteredIndividuals.map((p) => {
                            const selected = selectedIndividuals.includes(p.id);
                            return (
                              <button
                                type="button"
                                key={p.id}
                                onClick={() => toggleIndividual(p.id)}
                                className="w-full flex items-center gap-2 cursor-pointer"
                                style={{
                                  borderRadius: 8,
                                  background: selected ? "#E0E7FF" : "#FFFFFF",
                                  border: selected
                                    ? "1px solid #4F46E5"
                                    : "1px solid transparent",
                                  padding: "8px",
                                }}
                              >
                                <CheckBox checked={selected} />
                                <div className="flex flex-col items-start flex-1 min-w-0">
                                  <span
                                    className="truncate"
                                    style={{
                                      fontFamily: "Inter, sans-serif",
                                      fontWeight: 500,
                                      fontSize: 14,
                                      lineHeight: "20px",
                                      color: "#0A0A0A",
                                    }}
                                  >
                                    {p.name}
                                  </span>
                                  <span
                                    style={{
                                      fontFamily: "Inter, sans-serif",
                                      fontWeight: 400,
                                      fontSize: 12,
                                      lineHeight: "16px",
                                      color: "#717182",
                                    }}
                                  >
                                    {p.relationship}
                                  </span>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex flex-wrap items-center justify-end gap-3 px-5 sm:px-6 py-[15px]"
            style={{
              background: "#F9FAFB",
              borderTop: "0.8px solid #E5E7EB",
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
            }}
          >
            {readOnly ? (
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer hover:opacity-90"
                style={{
                  height: 36,
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: "#4F46E5",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: "20px",
                  color: "#FFFFFF",
                }}
              >
                Close
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onSkip ?? onClose}
                  disabled={uploading}
                  className="cursor-pointer hover:bg-gray-50 disabled:opacity-60"
                  style={{
                    height: 36,
                    padding: "7.8px 15.8px",
                    borderRadius: 8,
                    border: "1px solid rgba(0,0,0,0.1)",
                    background: "#FFFFFF",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: 13.2,
                    lineHeight: "20px",
                    color: "#0A0A0A",
                  }}
                >
                  {isOnboarding ? "Skip" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading || files.length === 0}
                  className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    height: 36,
                    padding: "8px 16px",
                    borderRadius: 8,
                    background: "#4F46E5",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: "20px",
                    color: "#FFFFFF",
                  }}
                >
                  {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {uploading
                    ? `Uploading…`
                    : isOnboarding
                      ? "Continue →"
                      : "Upload"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------- Sub components ------------------- */

function ReadOnlyPhotos({ urls }: { urls: string[] }) {
  if (urls.length === 0) {
    return (
      <p
        className="text-center py-6"
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 14,
          color: "#717182",
        }}
      >
        No photos uploaded yet.
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-3">
      {urls.map((url, i) => (
        <div
          key={i}
          style={{
            width: 120,
            height: 120,
            borderRadius: 10,
            overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.08)",
            background: "#F9FAFB",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Uploaded photo"
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span
      className="flex items-center justify-center flex-shrink-0"
      style={{
        width: 16,
        height: 16,
        borderRadius: 4,
        background: checked ? "#4F46E5" : "#FFFFFF",
        border: checked ? "1.1px solid #4F46E5" : "1.1px solid rgba(0,0,0,0.1)",
        boxShadow: "0px 1px 2px 0px rgba(0,0,0,0.05)",
      }}
    >
      {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
    </span>
  );
}

function GroupRow({
  label,
  selected,
  variant,
  onToggle,
}: {
  label: string;
  selected: boolean;
  variant: "yellow" | "default";
  onToggle: () => void;
}) {
  let bg = "#F9FAFB";
  let border = "1.1px solid rgba(0,0,0,0.1)";
  let textColor = "#364153";

  if (variant === "yellow") {
    bg = "#FFFBEB";
    border = "1.1px solid #FDEBA2";
    textColor = "#364153";
  }
  if (selected && variant !== "yellow") {
    bg = "#E0E7FF";
    border = "1.1px solid #4F46E5";
    textColor = "#4F46E5";
  }
  if (selected && variant === "yellow") {
    // keep yellow look, just indicate selection through the check
    bg = "#FFFBEB";
    border = "1.1px solid #FDEBA2";
  }

  // Checkbox border for yellow row should pick up theme color
  const ChecboxYellow = () => (
    <span
      className="flex items-center justify-center flex-shrink-0"
      style={{
        width: 16,
        height: 16,
        borderRadius: 4,
        background: selected ? "#4F46E5" : "#FFFFFF",
        border: selected ? "1.1px solid #4F46E5" : "1.1px solid #FDEBA2",
        boxShadow: "0px 1px 2px 0px rgba(0,0,0,0.05)",
      }}
    >
      {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
    </span>
  );

  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center cursor-pointer"
      style={{
        minHeight: 42,
        borderRadius: 10,
        border,
        background: bg,
        padding: "12px",
        gap: 12,
      }}
    >
      {variant === "yellow" ? (
        <ChecboxYellow />
      ) : (
        <CheckBox checked={selected} />
      )}
      <span
        className="text-left flex-1 min-w-0"
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "14px",
          color: textColor,
        }}
      >
        {label}
      </span>
    </button>
  );
}

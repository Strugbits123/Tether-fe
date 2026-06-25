"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  FileText,
  Image,
  Loader2,
  MessageSquare,
  Trash2,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/context/ToastContext";
import AssignRecipientsModal from "@/components/dashboard/AssignRecipientsModal";
import {
  type UnassignedItem,
  type UnassignedResponse,
  getUnassignedContent,
  bulkAssignContent,
  bulkDeleteContent,
  type BulkDeleteResponse,
} from "@/lib/api/content";
import { type Assignment } from "@/lib/api/messages";

/* ─── helpers ─────────────────────────────────────────────── */

async function getToken(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

function toSentenceCase(msg: string) {
  return msg ? msg.charAt(0).toUpperCase() + msg.slice(1) : msg;
}

function errorMessage(e: unknown, fallback: string) {
  return toSentenceCase(e instanceof Error ? e.message : fallback);
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return mins <= 1 ? "just now" : `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs === 1 ? "1 hour ago" : `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return days === 1 ? "1 day ago" : `${days} days ago`;
  const wks = Math.floor(days / 7);
  if (wks < 5) return wks === 1 ? "1 week ago" : `${wks} weeks ago`;
  const mos = Math.floor(days / 30);
  return mos === 1 ? "1 month ago" : `${mos} months ago`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function buildAssignments(groups: string[], individualIds: string[]): Assignment[] {
  const GROUP_MAP: Record<string, Assignment> = {
    "Assign later": { scope: "assign_later" },
    "All Recipients": { scope: "all" },
    "All Family": { scope: "group", groupValue: "family" },
    "All Friends": { scope: "group", groupValue: "friend" },
    "All Others": { scope: "group", groupValue: "other" },
    "Release Manager": { scope: "release_manager" },
  };
  if (groups.includes("Assign later")) return [{ scope: "assign_later" }];
  const result: Assignment[] = [];
  for (const g of groups) {
    if (GROUP_MAP[g]) result.push(GROUP_MAP[g]);
  }
  for (const id of individualIds) {
    result.push({ scope: "individual", recipientId: id });
  }
  return result.length ? result : [{ scope: "assign_later" }];
}

/* ─── type config ─────────────────────────────────────────── */

const TYPE_CONFIG: Record<
  string,
  {
    Icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    badgeBg: string;
    badgeColor: string;
    label: string;
  }
> = {
  message: {
    Icon: MessageSquare,
    iconBg: "#EDE9FE",
    iconColor: "#7C3AED",
    badgeBg: "#EDE9FE",
    badgeColor: "#6D28D9",
    label: "message",
  },
  document: {
    Icon: FileText,
    iconBg: "#D1FAE5",
    iconColor: "#059669",
    badgeBg: "#D1FAE5",
    badgeColor: "#065F46",
    label: "document",
  },
  photo: {
    Icon: Image,
    iconBg: "#FED7AA",
    iconColor: "#EA580C",
    badgeBg: "#FED7AA",
    badgeColor: "#9A3412",
    label: "photo",
  },
  memoir: {
    Icon: BookOpen,
    iconBg: "#CFFAFE",
    iconColor: "#0891B2",
    badgeBg: "#CFFAFE",
    badgeColor: "#0E7490",
    label: "memoir",
  },
};

/* ─── filter tabs ─────────────────────────────────────────── */

const TABS: {
  key: string | undefined;
  label: string;
  countKey: keyof UnassignedResponse["counts"];
}[] = [
  { key: undefined, label: "All", countKey: "total" },
  { key: "message", label: "Messages", countKey: "message" },
  { key: "document", label: "Documents", countKey: "document" },
  { key: "photo", label: "Photos", countKey: "photo" },
  { key: "memoir", label: "Memoir", countKey: "memoir" },
];

/* ─── page ────────────────────────────────────────────────── */

export default function UnassignedPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<UnassignedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [assignTarget, setAssignTarget] = useState<UnassignedItem | null>(null);
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<
    { type: "single"; item: UnassignedItem } | { type: "bulk" } | null
  >(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await getUnassignedContent(token, typeFilter);
      setData(result);
      setSelected(new Set());
    } catch (e) {
      showToast(errorMessage(e, "Failed to load unassigned content"), "error");
    } finally {
      setLoading(false);
    }
  }, [typeFilter, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleItem = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!data) return;
    if (selected.size === data.items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.items.map((i) => `${i.contentType}:${i.id}`)));
    }
  };

  const handleAssignSave = async (groups: string[], individualIds: string[]) => {
    if (!assignTarget) return;
    const token = await getToken();
    if (!token) return;
    const assignments = buildAssignments(groups, individualIds);
    setAssigning(true);
    try {
      await bulkAssignContent(token, {
        items: [{ contentType: assignTarget.contentType, contentId: assignTarget.id }],
        assignments,
      });
      showToast("Recipients assigned", "success");
      setAssignTarget(null);
      loadData();
    } catch (e) {
      showToast(errorMessage(e, "Failed to assign"), "error");
    } finally {
      setAssigning(false);
    }
  };

  const handleBulkAssignSave = async (groups: string[], individualIds: string[]) => {
    const token = await getToken();
    if (!token) return;
    const items = Array.from(selected).map((key) => {
      const idx = key.indexOf(":");
      return { contentType: key.slice(0, idx), contentId: key.slice(idx + 1) };
    });
    const assignments = buildAssignments(groups, individualIds);
    setAssigning(true);
    try {
      await bulkAssignContent(token, { items, assignments });
      showToast(
        `${items.length} item${items.length !== 1 ? "s" : ""} assigned`,
        "success",
      );
      setBulkAssignOpen(false);
      loadData();
    } catch (e) {
      showToast(errorMessage(e, "Failed to assign"), "error");
    } finally {
      setAssigning(false);
    }
  };

  const handleDeleteResult = (result: BulkDeleteResponse) => {
    if (result.skipped.length > 0) {
      showToast(
        `${result.deleted} item${result.deleted !== 1 ? "s" : ""} deleted — ${result.skipped.length} memoir item${result.skipped.length !== 1 ? "s" : ""} could not be deleted yet`,
        "error",
      );
    } else {
      showToast(
        `${result.deleted} item${result.deleted !== 1 ? "s" : ""} deleted`,
        "success",
      );
    }
  };

  const handleDelete = async (item: UnassignedItem) => {
    const token = await getToken();
    if (!token) return;
    try {
      const result = await bulkDeleteContent(token, {
        items: [{ contentType: item.contentType, contentId: item.id }],
      });
      handleDeleteResult(result);
      loadData();
    } catch (e) {
      showToast(errorMessage(e, "Failed to delete"), "error");
    }
  };

  const handleBulkDelete = async () => {
    const token = await getToken();
    if (!token) return;
    const items = Array.from(selected).map((key) => {
      const idx = key.indexOf(":");
      return { contentType: key.slice(0, idx), contentId: key.slice(idx + 1) };
    });
    try {
      const result = await bulkDeleteContent(token, { items });
      handleDeleteResult(result);
      loadData();
    } catch (e) {
      showToast(errorMessage(e, "Failed to delete"), "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === "single") await handleDelete(deleteTarget.item);
      else await handleBulkDelete();
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const total = data?.counts.total ?? 0;
  const allSelected =
    !!data && data.items.length > 0 && selected.size === data.items.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1
          style={{
            fontFamily: '"Instrument Serif", serif',
            fontWeight: 400,
            fontSize: 32,
            lineHeight: "36px",
            color: "#101828",
          }}
        >
          Unassigned Content
        </h1>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: 16,
            lineHeight: "24px",
            letterSpacing: "-0.31px",
            color: "#4A5565",
          }}
        >
          {loading
            ? "Loading…"
            : `${total} item${total !== 1 ? "s" : ""} waiting to be assigned to recipients`}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((tab) => {
          const active = typeFilter === tab.key;
          const count = data?.counts[tab.countKey] ?? 0;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setTypeFilter(tab.key)}
              className="flex items-center gap-1.5 cursor-pointer transition-colors"
              style={{
                minHeight: 36,
                borderRadius: 10,
                background: active ? "#4F39F6" : "#F3F4F6",
                padding: "0 16px",
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: 14,
                color: active ? "#FFFFFF" : "#364153",
              }}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div
          className="flex items-center gap-3 flex-wrap"
          style={{
            borderRadius: 10,
            background: "#EEF2FF",
            border: "1.25px solid #C7D2FE",
            padding: "10px 16px",
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: 14,
              color: "#4338CA",
            }}
          >
            {selected.size} item{selected.size !== 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => setBulkAssignOpen(true)}
              disabled={assigning}
              className="flex items-center gap-2 cursor-pointer hover:opacity-90 disabled:opacity-60"
              style={{
                height: 34,
                padding: "0 14px",
                borderRadius: 8,
                background: "#4F46E5",
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: 13.5,
                color: "#FFFFFF",
              }}
            >
              <UserPlus className="w-4 h-4" strokeWidth={2} />
              Bulk Assign
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget({ type: "bulk" })}
              disabled={assigning}
              className="flex items-center gap-2 cursor-pointer hover:opacity-90 disabled:opacity-60"
              style={{
                height: 34,
                padding: "0 14px",
                borderRadius: 8,
                background: "#FEE2E2",
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: 13.5,
                color: "#C10007",
              }}
            >
              <Trash2 className="w-4 h-4" strokeWidth={2} />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Content list */}
      {loading ? (
        <div
          className="flex flex-col"
          style={{
            borderRadius: 14,
            border: "1.25px solid rgba(0,0,0,0.1)",
            background: "#FFFFFF",
            overflow: "hidden",
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse flex items-center gap-4"
              style={{
                padding: "14px 16px",
                borderBottom: i < 3 ? "1px solid #F3F4F6" : undefined,
              }}
            >
              <div className="w-4 h-4 bg-gray-200 rounded" />
              <div
                className="flex-shrink-0"
                style={{ width: 40, height: 40, borderRadius: 10, background: "#EEF2FF" }}
              />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="h-4 bg-gray-200 rounded w-48" />
                <div className="h-3 bg-gray-100 rounded w-32" />
              </div>
              <div
                className="flex-shrink-0"
                style={{ width: 80, height: 34, borderRadius: 8, background: "#EEF2FF" }}
              />
            </div>
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center text-center gap-3"
          style={{
            borderRadius: 14,
            border: "1.25px dashed rgba(0,0,0,0.12)",
            background: "#FFFFFF",
            padding: "48px 24px",
          }}
        >
          <div
            className="flex items-center justify-center"
            style={{ width: 56, height: 56, borderRadius: 12, background: "#FEF9C3" }}
          >
            <UserCheck className="w-7 h-7" color="#A16207" strokeWidth={2} />
          </div>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 16,
              color: "#101828",
            }}
          >
            All caught up!
          </p>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontSize: 14,
              color: "#4A5565",
            }}
          >
            Every item has been assigned to a recipient.
          </p>
        </div>
      ) : (
        <div
          style={{
            borderRadius: 14,
            border: "1.25px solid rgba(0,0,0,0.1)",
            background: "#FFFFFF",
            overflow: "hidden",
          }}
        >
          {/* Select-all row */}
          <div
            className="flex items-center gap-3"
            style={{
              padding: "10px 16px",
              borderBottom: "1px solid #F3F4F6",
              background: "#FAFAFA",
            }}
          >
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="cursor-pointer"
              style={{ width: 16, height: 16, accentColor: "#4F46E5" }}
            />
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: 13.5,
                color: "#4A5565",
              }}
            >
              Select all ({data.items.length})
            </span>
          </div>

          {/* Item rows */}
          {data.items.map((item, idx) => {
            const key = `${item.contentType}:${item.id}`;
            const cfg = TYPE_CONFIG[item.contentType] ?? TYPE_CONFIG.document;
            const { Icon } = cfg;
            const isLast = idx === data.items.length - 1;

            return (
              <div
                key={key}
                className="flex items-center gap-3"
                style={{
                  padding: "12px 16px",
                  borderBottom: isLast ? undefined : "1px solid #F3F4F6",
                  background: selected.has(key) ? "#F5F3FF" : "#FFFFFF",
                  transition: "background 0.1s",
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.has(key)}
                  onChange={() => toggleItem(key)}
                  className="cursor-pointer flex-shrink-0"
                  style={{ width: 16, height: 16, accentColor: "#4F46E5" }}
                />

                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: 40, height: 40, borderRadius: 10, background: cfg.iconBg }}
                >
                  <Icon className="w-5 h-5" color={cfg.iconColor} strokeWidth={2} />
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="truncate"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 600,
                      fontSize: 15,
                      lineHeight: "22px",
                      color: "#101828",
                    }}
                  >
                    {item.title}
                  </p>
                  <div
                    className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-0.5"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 400,
                      fontSize: 13,
                      color: "#6A7282",
                    }}
                  >
                    <span
                      style={{
                        padding: "1px 8px",
                        borderRadius: 9999,
                        background: cfg.badgeBg,
                        color: cfg.badgeColor,
                        fontWeight: 500,
                        fontSize: 12,
                      }}
                    >
                      {cfg.label}
                    </span>
                    {item.subType && <span>{item.subType}</span>}
                    <span>{formatTimeAgo(item.createdAt)}</span>
                    {item.fileSize != null && (
                      <span>{formatFileSize(item.fileSize)}</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAssignTarget(item)}
                  className="flex items-center gap-1.5 cursor-pointer hover:bg-indigo-50 flex-shrink-0"
                  style={{
                    height: 34,
                    padding: "0 12px",
                    borderRadius: 8,
                    border: "1.25px solid #C7D2FE",
                    background: "#FFFFFF",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: 13.5,
                    color: "#4338CA",
                  }}
                >
                  <UserPlus className="w-3.5 h-3.5" strokeWidth={2} />
                  Assign
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTarget({ type: "single", item })}
                  aria-label="Delete"
                  className="flex items-center justify-center cursor-pointer hover:bg-red-50 flex-shrink-0"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    border: "1.25px solid #FECACA",
                    background: "#FFFFFF",
                  }}
                >
                  <Trash2 className="w-4 h-4 text-[#E7000B]" strokeWidth={2} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Single-item assign modal */}
      <AssignRecipientsModal
        open={!!assignTarget}
        onClose={() => setAssignTarget(null)}
        messageTitle={assignTarget?.title ?? ""}
        onSave={handleAssignSave}
      />

      {/* Bulk assign modal */}
      <AssignRecipientsModal
        open={bulkAssignOpen}
        onClose={() => setBulkAssignOpen(false)}
        messageTitle={`${selected.size} selected item${selected.size !== 1 ? "s" : ""}`}
        onSave={handleBulkAssignSave}
      />

      {/* Delete confirmation */}
      {deleteTarget && (
        <ConfirmDeleteModal
          title={
            deleteTarget.type === "bulk"
              ? `Delete ${selected.size} item${selected.size !== 1 ? "s" : ""}?`
              : "Delete this item?"
          }
          deleting={deleting}
          onCancel={() => (deleting ? undefined : setDeleteTarget(null))}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

/* ─── delete confirmation modal ───────────────────────────── */

function ConfirmDeleteModal({
  title,
  deleting,
  onCancel,
  onConfirm,
}: {
  title: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) onCancel();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onCancel, deleting]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !deleting) onCancel();
      }}
    >
      <div
        className="flex min-h-full items-center justify-center px-2 sm:px-4 py-4 sm:py-10"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !deleting) onCancel();
        }}
      >
        <div
          className="relative bg-white w-full"
          style={{
            maxWidth: 400,
            borderRadius: 10,
            boxShadow:
              "0px 8px 10px -6px rgba(0,0,0,0.1), 0px 20px 25px -5px rgba(0,0,0,0.1)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <div className="flex flex-col gap-5 px-6 py-6">
            <div className="flex flex-col gap-2">
              <h2
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: 18,
                  lineHeight: "28px",
                  letterSpacing: "-0.44px",
                  color: "#101828",
                }}
              >
                {title}
              </h2>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: "20px",
                  letterSpacing: "-0.15px",
                  color: "#717182",
                }}
              >
                This cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={deleting}
                className="cursor-pointer hover:bg-gray-50 disabled:opacity-60"
                style={{
                  height: 36,
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1.25px solid rgba(0,0,0,0.1)",
                  background: "#FFFFFF",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: 14,
                  color: "#0A0A0A",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={deleting}
                className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 disabled:cursor-not-allowed"
                style={{
                  height: 36,
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: "#E7000B",
                  opacity: deleting ? 0.5 : 1,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: 14,
                  color: "#FFFFFF",
                }}
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

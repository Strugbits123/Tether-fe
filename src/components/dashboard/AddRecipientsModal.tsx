"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, ShieldCheck, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ApiError } from "@/lib/api/client";
import { useToast } from "@/lib/context/ToastContext";
import { createRecipient } from "@/lib/api/recipients";
import { toRecipientRelationship } from "@/lib/relationship";

interface AddRecipientsModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after a recipient is successfully created on the backend. */
  onCreated?: () => void;
  /** Skip this onboarding step without saving. */
  onSkip?: () => void;
  /** Onboarding mode: keep modal open after add, show Skip + Continue footer. */
  isOnboarding?: boolean;
  /** Overrides the secondary (left) button label. Defaults to Skip/Cancel. */
  cancelLabel?: string;
  title?: string;
  subtitle?: string | null;
  bottomVariant?: "note" | "guardian";
  /** Override the relationship dropdown choices. Defaults to the full list. */
  relationshipOptions?: string[];
  /** Read-only view of an existing recipient (inputs locked, no Add). */
  readOnly?: boolean;
  /** Values to display in read-only mode. */
  initialData?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    relationship: string;
    note: string;
  } | null;
}

const RELATIONSHIP_OPTIONS = [
  "Family",
  "Spouse",
  "Child",
  "Parent",
  "Sibling",
  "Friend",
  "Colleague",
  "Lawyer",
  "Other",
];

export default function AddRecipientsModal({
  open,
  onClose,
  onCreated,
  onSkip,
  isOnboarding = false,
  cancelLabel,
  title = "Add a Recipient",
  subtitle = "Recipients are the people who will receive access to your messages, photos, and documents when your Tether is released. You can add more in the Access page.",
  bottomVariant = "note",
  relationshipOptions = RELATIONSHIP_OPTIONS,
  readOnly = false,
  initialData,
}: AddRecipientsModalProps) {
  const { showToast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("Family");
  const [note, setNote] = useState("");
  const [isGuardian, setIsGuardian] = useState(false);

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [addedThisSession, setAddedThisSession] = useState(0);

  // Reset the form ONLY when the modal transitions to open — never on a
  // re-render or after an API error, so the user's input is preserved on failure.
  useEffect(() => {
    if (!open) return;
    if (readOnly && initialData) {
      setFirstName(initialData.firstName);
      setLastName(initialData.lastName);
      setEmail(initialData.email);
      setPhone(initialData.phone);
      setRelationship(initialData.relationship);
      setNote(initialData.note);
    } else {
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setRelationship("Family");
      setNote("");
    }
    setIsGuardian(false);
    setFormError(null);
    setEmailError(null);
    setFieldErrors({});
    setLoading(false);
    setAddedThisSession(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "First name is required.";
    if (!lastName.trim()) errs.lastName = "Last name is required.";
    if (!email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Enter a valid email address.";
    }
    if (phone.trim() && !/^\+?[\d\s()\-]{7,20}$/.test(phone.trim())) {
      errs.phone = "Enter a valid phone number.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAdd = async () => {
    setFormError(null);
    setEmailError(null);
    if (!validate()) return;

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      setFormError("Your session has expired. Please sign in again.");
      return;
    }

    setLoading(true);
    try {
      await createRecipient(token, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        relationship: toRecipientRelationship(relationship),
        note: note.trim() || undefined,
      });
      showToast("Recipient added successfully", "success");
      if (isOnboarding) {
        // Keep modal open — let user add more or click Continue.
        setAddedThisSession((n) => n + 1);
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setRelationship("Family");
        setNote("");
        setIsGuardian(false);
        setFormError(null);
        setEmailError(null);
        setFieldErrors({});
      } else {
        onCreated?.();
        onClose();
      }
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 409) {
        setEmailError(
          "A recipient with this email address already exists on your account.",
        );
      } else {
        setFormError(
          error instanceof Error
            ? error.message
            : "Could not add the recipient.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
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
          {/* Close button */}
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
          <div
            className="px-5 sm:px-6 pt-6 sm:pt-[22px] pb-5 pr-12 sm:pr-14"
            style={{ borderBottom: "0.8px solid #E5E7EB" }}
          >
            <h2
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: 23,
                lineHeight: "28px",
                color: "#101828",
              }}
            >
              {readOnly ? "Recipient" : title}
            </h2>
            {(readOnly || subtitle) && (
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
                {readOnly
                  ? "A person who will receive your Tether. Manage recipients on the Access page."
                  : subtitle}
              </p>
            )}
          </div>

          {/* Body */}
          <div className="flex flex-col gap-4 px-5 sm:px-6 py-6">
            {/* First / Last name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First Name" required>
                <TextInput
                  value={firstName}
                  onChange={(v) => {
                    setFirstName(v);
                    if (fieldErrors.firstName)
                      setFieldErrors((p) => ({ ...p, firstName: "" }));
                  }}
                  placeholder="Enter first Name"
                  invalid={!!fieldErrors.firstName}
                  readOnly={readOnly}
                />
                {fieldErrors.firstName && (
                  <FieldError message={fieldErrors.firstName} />
                )}
              </Field>
              <Field label="Last Name" required>
                <TextInput
                  value={lastName}
                  onChange={(v) => {
                    setLastName(v);
                    if (fieldErrors.lastName)
                      setFieldErrors((p) => ({ ...p, lastName: "" }));
                  }}
                  placeholder="Enter last name"
                  invalid={!!fieldErrors.lastName}
                  readOnly={readOnly}
                />
                {fieldErrors.lastName && (
                  <FieldError message={fieldErrors.lastName} />
                )}
              </Field>
            </div>

            {/* Email */}
            <Field label="Email" required>
              <TextInput
                value={email}
                onChange={(v) => {
                  setEmail(v);
                  if (emailError) setEmailError(null);
                  if (fieldErrors.email)
                    setFieldErrors((p) => ({ ...p, email: "" }));
                }}
                placeholder="email@example.com"
                type="email"
                invalid={!!emailError || !!fieldErrors.email}
                readOnly={readOnly}
              />
              {(emailError || fieldErrors.email) && (
                <FieldError message={emailError ?? fieldErrors.email!} />
              )}
            </Field>

            {/* Phone Number — no asterisk */}
            <Field label="Phone Number">
              <TextInput
                value={phone}
                onChange={(v) => {
                  setPhone(v);
                  if (fieldErrors.phone)
                    setFieldErrors((p) => ({ ...p, phone: "" }));
                }}
                placeholder="+1 (555) 123-4567"
                type="tel"
                invalid={!!fieldErrors.phone}
                readOnly={readOnly}
              />
              {fieldErrors.phone && <FieldError message={fieldErrors.phone} />}
            </Field>

            {/* Relationship */}
            <Field label="Relationship" required>
              <RelationshipDropdown
                value={relationship}
                onChange={setRelationship}
                disabled={readOnly}
                options={relationshipOptions}
              />
            </Field>

            {bottomVariant === "note" || readOnly ? (
              /* Note */
              <div className="flex flex-col gap-1">
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
                  Leave a note for the Recipient{" "}
                  <span style={{ color: "#0A0A0A", fontWeight: 500 }}>
                    (Recommended)
                  </span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="short message to the recipient"
                  rows={3}
                  readOnly={readOnly}
                  className="w-full focus:outline-none resize-none"
                  style={{
                    minHeight: 68,
                    borderRadius: 8,
                    border: "1.25px solid rgba(0,0,0,0.1)",
                    background: "#F3F3F5",
                    padding: "12px",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: "20px",
                    letterSpacing: "-0.15px",
                    color: "#0A0A0A",
                    boxShadow: "0px 0px 0px 0.14px rgba(161,161,161,0.025)",
                  }}
                />
              </div>
            ) : (
              <GuardianBox
                checked={isGuardian}
                onToggle={() => setIsGuardian((v) => !v)}
              />
            )}
          </div>

          {/* Footer */}
          <div
            className="flex flex-col gap-2 px-5 sm:px-6 py-[15px]"
            style={{
              background: "#F9FAFB",
              borderTop: "0.8px solid #E5E7EB",
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
            }}
          >
            {formError && <FieldError message={formError} />}
            {isOnboarding && addedThisSession > 0 && (
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  color: "#16A34A",
                  fontWeight: 500,
                }}
              >
                {addedThisSession} recipient{addedThisSession > 1 ? "s" : ""}{" "}
                added ✓
              </p>
            )}
            <div className="flex flex-wrap items-center justify-end gap-3">
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
                    disabled={loading}
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
                    {cancelLabel ?? (isOnboarding ? "Skip" : "Cancel")}
                  </button>
                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 disabled:opacity-80 disabled:cursor-not-allowed"
                    style={{
                      height: 36,
                      padding: "8px 16px",
                      borderRadius: 8,
                      background:
                        isOnboarding && addedThisSession > 0
                          ? "#FFFFFF"
                          : "#4F46E5",
                      border:
                        isOnboarding && addedThisSession > 0
                          ? "1px solid rgba(0,0,0,0.1)"
                          : "none",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: 14,
                      lineHeight: "20px",
                      color:
                        isOnboarding && addedThisSession > 0
                          ? "#0A0A0A"
                          : "#FFFFFF",
                    }}
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading
                      ? "Adding…"
                      : isOnboarding && addedThisSession > 0
                        ? "Add Another"
                        : "Add Recipient"}
                  </button>
                  {isOnboarding && (
                    <button
                      type="button"
                      onClick={() => {
                        onCreated?.();
                        onClose();
                      }}
                      disabled={addedThisSession === 0}
                      className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
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
                      Cancel
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------- Sub components ------------------- */

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-0.5">
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: 14,
            lineHeight: "14px",
            letterSpacing: "-0.15px",
            color: "#0A0A0A",
          }}
        >
          {label}
        </span>
        {required && (
          <span style={{ color: "#FB2C36", fontSize: 14, lineHeight: "14px" }}>
            *
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function GuardianBox({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="flex items-start gap-3"
      style={{
        borderRadius: 10,
        border: "1px solid #E9D4FF",
        background: "#FAF5FF",
        padding: "16px",
        gap: 12,
      }}
    >
      <ShieldCheck
        style={{
          width: 20,
          height: 22,
          color: "#9810FA",
          flexShrink: 0,
          marginTop: 2,
        }}
        strokeWidth={2}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={checked}
        aria-label="Select as Guardian"
        className="flex items-center justify-center flex-shrink-0 cursor-pointer mt-1"
        style={{
          width: 16,
          height: 16,
          borderRadius: 2.5,
          border: checked ? "1px solid #9810FA" : "1px solid #767676",
          background: checked ? "#9810FA" : "#FFFFFF",
        }}
      >
        {checked && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            aria-hidden
          >
            <path
              d="M2 5l2 2 4-4"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      <button
        type="button"
        onClick={onToggle}
        className="flex flex-col flex-1 min-w-0 text-left cursor-pointer"
        style={{ gap: 4 }}
      >
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: 14.9,
            lineHeight: "24px",
            color: "#59168B",
          }}
        >
          Select as Guardian
        </span>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: 13.2,
            lineHeight: "20px",
            color: "#6E11B0",
          }}
        >
          A Guardian acts as a backup Release Manager if your primary Release
          Manager is unavailable. You can add up to 2 Guardians.
        </span>
      </button>
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p
      style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 400,
        fontSize: 13,
        lineHeight: "18px",
        color: "#FB2C36",
      }}
    >
      {message}
    </p>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  invalid,
  readOnly,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  invalid?: boolean;
  readOnly?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className="w-full focus:outline-none"
      style={{
        height: 36,
        borderRadius: 8,
        border: invalid ? "1px solid #FB2C36" : "1px solid rgba(0,0,0,0.1)",
        background: readOnly ? "#ECECEF" : "#F3F3F5",
        padding: "4px 12px",
        fontFamily: "Inter, sans-serif",
        fontWeight: 400,
        fontSize: 14,
        lineHeight: "20px",
        letterSpacing: "-0.15px",
        color: readOnly ? "#4A5565" : "#0A0A0A",
        cursor: readOnly ? "default" : "text",
      }}
    />
  );
}

function RelationshipDropdown({
  value,
  onChange,
  disabled,
  options = RELATIONSHIP_OPTIONS,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  options?: string[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={disabled ? undefined : () => setOpen((o) => !o)}
        disabled={disabled}
        className="w-full flex items-center justify-between focus:outline-none"
        style={{
          height: 41.2,
          borderRadius: 8,
          border: "1px solid #D1D5DC",
          padding: "7.8px 15.8px",
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "20px",
          color: value ? "#101828" : "#717182",
          background: disabled ? "#ECECEF" : "#FFFFFF",
          cursor: disabled ? "default" : "pointer",
        }}
      >
        <span className="truncate">{value || "Select relationship"}</span>
        {open ? (
          <ChevronUp className="w-5 h-5 text-[#717182] flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#717182] flex-shrink-0" />
        )}
      </button>
      {open && (
        <div
          className="absolute z-10 w-full mt-1 overflow-hidden"
          style={{
            background: "#FFFFFF",
            borderRadius: 8,
            border: "1px solid #D1D5DC",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div className="max-h-60 overflow-y-auto">
            {options.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
                className="w-full text-left hover:bg-[#F3F4F6]"
                style={{
                  padding: "8px 16px",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: "20px",
                  color: "#374151",
                }}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

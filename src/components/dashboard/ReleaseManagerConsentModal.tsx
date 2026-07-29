"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";

interface ReleaseManagerConsentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** "Before you continue" legal-notice gate shown before designating or
 *  changing a Release Manager. Confirm stays disabled until the user checks
 *  the acknowledgement box. */
export default function ReleaseManagerConsentModal({
  open,
  onClose,
  onConfirm,
}: ReleaseManagerConsentModalProps) {
  // Gate on `open` out here so the dialog below mounts fresh on every open.
  // That makes `acknowledged` start unchecked each time without an effect
  // resetting it after the fact — a reopened modal can never briefly show the
  // previous session's checked state (and thus an enabled Continue button).
  if (!open) return null;
  return <ConsentDialog onClose={onClose} onConfirm={onConfirm} />;
}

function ConsentDialog({
  onClose,
  onConfirm,
}: Omit<ReleaseManagerConsentModalProps, "open">) {
  const [acknowledged, setAcknowledged] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      // `:not([disabled])` matters here: Continue is disabled until the box is
      // checked, and a disabled button can't take focus — including it would
      // make Tab wrapping jump to an element that never receives focus.
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      previouslyFocused?.focus();
    };
  }, [onClose]);

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
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="relative bg-white w-full"
          style={{
            maxWidth: 480,
            borderRadius: 16,
            boxShadow:
              "0px 8px 10px -6px rgba(0,0,0,0.1), 0px 20px 25px -5px rgba(0,0,0,0.1)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute cursor-pointer top-5 right-5"
            style={{ width: 20, height: 20, opacity: 0.7 }}
          >
            <X className="w-5 h-5 text-[#0A0A0A]" strokeWidth={2} />
          </button>

          <div className="flex flex-col gap-4 px-6 pt-6 pb-6">
            <h2
              id={titleId}
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: 18,
                lineHeight: "26px",
                color: "#101828",
              }}
            >
              Before you continue — important notice
            </h2>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontSize: 14,
                lineHeight: "21px",
                color: "#4A5565",
              }}
            >
              Your Tether Release Manager will be able to access and distribute
              all of your Tether content, including photos, documents, messages,
              and memoir.
            </p>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontSize: 14,
                lineHeight: "21px",
                color: "#4A5565",
              }}
            >
              This isn&apos;t a legal will - your Release Manager has no
              authority over your financial accounts, property, or estate
              without a court appointment.
            </p>

            <label
              className="flex items-start gap-2.5 cursor-pointer"
              style={{
                borderRadius: 10,
                background: "#F9FAFB",
                border: "1px solid #E5E7EB",
                padding: 14,
              }}
            >
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 flex-shrink-0"
                style={{ width: 16, height: 16, accentColor: "#4F46E5" }}
              />
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontSize: 13.5,
                  lineHeight: "19px",
                  color: "#364153",
                }}
              >
                Got it - I understand my Release Manager&apos;s role
              </span>
            </label>
          </div>

          <div
            className="flex items-center justify-end gap-3 px-6 py-4"
            style={{
              background: "#F9FAFB",
              borderTop: "0.8px solid #E5E7EB",
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer hover:bg-gray-50"
              style={{
                height: 36,
                padding: "0 16px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.1)",
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
              disabled={!acknowledged}
              className="cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                height: 36,
                padding: "0 16px",
                borderRadius: 8,
                background: "#4F46E5",
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: 14,
                color: "#FFFFFF",
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

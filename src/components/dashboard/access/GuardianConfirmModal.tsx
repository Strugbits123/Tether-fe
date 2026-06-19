"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, X } from "lucide-react";

interface GuardianConfirmModalProps {
  open: boolean;
  /** Name shown in the confirm button context (optional). */
  onClose: () => void;
  /** Called when the user accepts and clicks Confirm Guardian. */
  onConfirm: () => void;
}

/**
 * "Select as Guardian" confirmation. A Guardian is a backup Release Manager;
 * the user must acknowledge the role before confirming.
 */
export default function GuardianConfirmModal({
  open,
  onClose,
  onConfirm,
}: GuardianConfirmModalProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (open) setAcknowledged(false);
  }, [open]);

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
            maxWidth: 672,
            borderRadius: 10,
            boxShadow:
              "0px 8px 10px -6px rgba(0,0,0,0.1), 0px 20px 25px -5px rgba(0,0,0,0.1)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {/* Header */}
          <div
            className="flex items-start justify-between gap-3 px-5 sm:px-6 py-6"
            style={{ borderBottom: "1.25px solid #E5E7EB" }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <ShieldCheck
                className="flex-shrink-0"
                style={{ width: 24, height: 24, color: "#9810FA" }}
                strokeWidth={2}
              />
              <h2
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: 20,
                  lineHeight: "28px",
                  letterSpacing: "-0.45px",
                  color: "#101828",
                }}
              >
                Select as Guardian
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="cursor-pointer flex-shrink-0"
            >
              <X className="w-6 h-6 text-[#99A1AF]" strokeWidth={2} />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 sm:px-6 py-6 flex flex-col gap-4">
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontSize: 16,
                lineHeight: "26px",
                letterSpacing: "-0.31px",
                color: "#364153",
              }}
            >
              A Guardian is a back up Release Manager if your primary Release
              Manager is unable to act, becomes unresponsive, or steps down from
              the role. Your Guardian will only be contacted if needed — they
              have no access to your account until that happens.
            </p>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontSize: 16,
                lineHeight: "26px",
                letterSpacing: "-0.31px",
                color: "#364153",
              }}
            >
              You can add up to two Guardians. They will be notified of their
              role by email.
            </p>

            <label
              className="flex items-start gap-3 cursor-pointer"
              style={{
                borderRadius: 10,
                border: "1.25px solid #E9D4FF",
                background: "#FAF5FF",
                padding: "16px",
              }}
            >
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="flex-shrink-0 cursor-pointer"
                style={{
                  width: 13,
                  height: 13,
                  marginTop: 4,
                  accentColor: "#9810FA",
                  borderRadius: 2,
                  border: "1px solid #364153",
                }}
              />
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: "20px",
                  letterSpacing: "-0.15px",
                  color: "#364153",
                }}
              >
                I understand that Guardians act as backup Release Managers and
                will only be contacted if my primary Release Manager is
                unavailable.
              </span>
            </label>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-3 px-5 sm:px-6 py-6"
            style={{
              background: "#F9FAFB",
              borderTop: "1.25px solid #E5E7EB",
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer hover:bg-gray-50"
              style={{
                height: 36,
                padding: "8px 16px",
                borderRadius: 8,
                border: "1.25px solid rgba(0,0,0,0.1)",
                background: "#FFFFFF",
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: 14,
                lineHeight: "20px",
                letterSpacing: "-0.15px",
                color: "#0A0A0A",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!acknowledged}
              className="cursor-pointer hover:opacity-90 disabled:cursor-not-allowed"
              style={{
                height: 36,
                padding: "8px 16px",
                borderRadius: 8,
                background: "#9810FA",
                opacity: acknowledged ? 1 : 0.5,
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: 14,
                lineHeight: "20px",
                letterSpacing: "-0.15px",
                color: "#FFFFFF",
              }}
            >
              Confirm Guardian
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

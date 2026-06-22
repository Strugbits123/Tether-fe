"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface LegalNoticeModalProps {
  open: boolean;
  onClose: () => void;
  /** Called when the user accepts the notice and clicks Continue. */
  onContinue: () => void;
}

/**
 * "Before you continue — important notice" gate that precedes the Add Person
 * form. The user must tick the acknowledgement checkbox before Continue is
 * enabled.
 */
export default function LegalNoticeModal({
  open,
  onClose,
  onContinue,
}: LegalNoticeModalProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (open) setAcknowledged(false);
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
              Before you continue — important notice
            </h2>
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
              Designating an Release Manager in Tether is not a substitute for a
              legal will. If you do not have a valid will, your estate will be
              governed by the intestacy laws of your state, which may not reflect
              your wishes. Your Tether Release Manager will be able to access and
              distribute your Tether content, but will have no legal authority
              over your financial accounts, property, or estate without a court
              appointment.
            </p>

            <label
              className="flex items-start gap-3 cursor-pointer"
              style={{
                borderRadius: 10,
                border: "1.25px solid #E5E7EB",
                background: "#F9FAFB",
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
                  accentColor: "#364153",
                  borderRadius: 3,
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
                I understand that my Tether Release Manager designation does not
                replace a legal will and does not confer legal authority over my
                estate.
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
              onClick={onContinue}
              disabled={!acknowledged}
              className="cursor-pointer hover:opacity-90 disabled:cursor-not-allowed"
              style={{
                height: 36,
                padding: "8px 16px",
                borderRadius: 8,
                background: "#4F46E5",
                opacity: acknowledged ? 1 : 0.5,
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: 14,
                lineHeight: "20px",
                letterSpacing: "-0.15px",
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

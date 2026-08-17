"use client";

import { Users, X } from "lucide-react";

interface MessagePlayerHeaderProps {
  type: "audio" | "video";
  messageTitle?: string;
  /** Distinct people this message reaches (+RM). Hidden when undefined. */
  recipientCount?: number;
  onClose: () => void;
}

/**
 * Shared header for the audio + video players:
 *   "AUDIO MESSAGE" (small caps, gray)
 *   <message title, bold>
 *   <recipient icon + count>
 * with a circular close button on the right.
 */
export default function MessagePlayerHeader({
  type,
  messageTitle,
  recipientCount,
  onClose,
}: MessagePlayerHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              color: "#9CA3AF",
            }}
          >
            {type === "audio" ? "AUDIO" : "VIDEO"} MESSAGE
          </p>
          {recipientCount !== undefined && (
            <span
              className="flex items-center gap-1.5"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                fontWeight: 500,
                color: "#6B7280",
              }}
            >
              <Users className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
              {recipientCount} {recipientCount === 1 ? "recipient" : "recipients"}
            </span>
          )}
        </div>
        <h2
          className="mt-1"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 22,
            fontWeight: 700,
            lineHeight: "28px",
            color: "#111827",
            wordBreak: "break-word",
          }}
        >
          {messageTitle || "Your Voice, Preserved"}
        </h2>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-gray-200 transition-colors"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "#F3F4F6",
        }}
      >
        <X className="w-4 h-4 text-gray-500" strokeWidth={2} />
      </button>
    </div>
  );
}

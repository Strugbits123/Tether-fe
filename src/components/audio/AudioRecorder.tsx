"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";
import MessagePlayerHeader from "@/components/messages/MessagePlayerHeader";
import AudioPlayer from "@/components/audio/AudioPlayer";

interface AudioRecorderProps {
  recipientName?: string;
  messageTitle?: string;
  /** Max recording length in seconds. Default 10 minutes. */
  maxSeconds?: number;
  /** Fired when the user accepts the recording (preview → Continue). */
  onComplete: (blob: Blob, durationSeconds: number) => void;
  /** Fired when the user backs out without a recording. */
  onCancel: () => void;
  /** Close (X) button. */
  onClose: () => void;
}

type Phase = "ready" | "recording" | "preview";

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioRecorder({
  recipientName,
  messageTitle,
  maxSeconds = 10 * 60,
  onComplete,
  onCancel,
  onClose,
}: AudioRecorderProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const recordRef = useRef<ReturnType<typeof RecordPlugin.create> | null>(null);
  const timerRef = useRef<number | null>(null);
  const discardingRef = useRef(false);
  const blobRef = useRef<Blob | null>(null);
  const durationRef = useRef(0);
  const elapsedRef = useRef(0);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Build the live recording waveform + mic capture while in the recording phase.
  useEffect(() => {
    if (phase !== "recording" || !containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      height: 72,
      waveColor: "#7C3AED",
      progressColor: "#7C3AED",
      barWidth: 3,
      barGap: 2,
      barRadius: 2,
      cursorWidth: 0,
    });
    const record = ws.registerPlugin(
      RecordPlugin.create({
        scrollingWaveform: true,
        renderRecordedAudio: false,
        mimeType: "audio/webm",
      }),
    );
    wsRef.current = ws;
    recordRef.current = record;

    record.on("record-end", (blob: Blob) => {
      blobRef.current = blob;
      if (discardingRef.current) return;
      durationRef.current = elapsedRef.current;
      setPreviewBlob(blob);
      setPhase("preview");
    });

    record.startRecording().catch(() => {
      setError(
        "Microphone access is required to record audio. Please allow access in your browser settings.",
      );
      setPhase("ready");
    });

    // Elapsed timer + auto-stop at the cap.
    setElapsed(0);
    elapsedRef.current = 0;
    timerRef.current = window.setInterval(() => {
      setElapsed((s) => {
        const next = s + 1;
        elapsedRef.current = next;
        if (next >= maxSeconds) stopRecording();
        return next;
      });
    }, 1000);

    return () => {
      clearTimer();
      try {
        if (record.isRecording()) record.stopRecording();
        record.destroy();
      } catch {
        /* ignore */
      }
      ws.destroy();
      wsRef.current = null;
      recordRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const startRecording = useCallback(() => {
    setError(null);
    discardingRef.current = false;
    blobRef.current = null;
    setPreviewBlob(null);
    setPhase("recording");
  }, []);

  const stopRecording = useCallback(() => {
    clearTimer();
    const record = recordRef.current;
    if (record && record.isRecording()) {
      record.stopRecording(); // record-end → preview
    }
  }, []);

  const cancelRecording = useCallback(() => {
    discardingRef.current = true;
    clearTimer();
    const record = recordRef.current;
    if (record && record.isRecording()) {
      try {
        record.stopRecording();
      } catch {
        /* ignore */
      }
    }
    onCancel();
  }, [onCancel]);

  const reRecord = useCallback(() => {
    blobRef.current = null;
    setPreviewBlob(null);
    setElapsed(0);
    elapsedRef.current = 0;
    setPhase("ready");
  }, []);

  const handleContinue = useCallback(() => {
    if (blobRef.current) onComplete(blobRef.current, durationRef.current);
  }, [onComplete]);

  useEffect(() => () => clearTimer(), []);

  const remaining = Math.max(0, maxSeconds - elapsed);

  return (
    <div
      className="flex flex-col px-6 sm:px-8 pt-6 sm:pt-7 pb-6 sm:pb-7"
      style={{ gap: 24 }}
    >
      <MessagePlayerHeader
        type="audio"
        recipientName={recipientName}
        messageTitle={messageTitle}
        onClose={onClose}
      />

      {phase === "preview" && previewBlob ? (
        <>
          <AudioPlayer audioBlob={previewBlob} categoryLabel="Audio message" />
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={reRecord}
              className="flex-1 flex items-center justify-center cursor-pointer hover:bg-gray-50"
              style={{
                height: 44,
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.1)",
                background: "#FFFFFF",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: 14,
                color: "#0A0A0A",
              }}
            >
              Re-record
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className="flex-1 flex items-center justify-center cursor-pointer hover:opacity-90"
              style={{
                height: 44,
                borderRadius: 8,
                background: "#4F46E5",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: 14,
                color: "#FFFFFF",
              }}
            >
              Continue
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Status + timer */}
          <div className="flex flex-col" style={{ gap: 6 }}>
            <div className="flex items-center" style={{ gap: 8 }}>
              <span
                className={phase === "recording" ? "recording-dot" : ""}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: phase === "recording" ? "#EF4444" : "#D1D5DB",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  color: phase === "recording" ? "#EF4444" : "#9CA3AF",
                }}
              >
                {phase === "recording" ? "RECORDING…" : "READY TO RECORD"}
              </span>
            </div>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 48,
                fontWeight: 700,
                lineHeight: "52px",
                color: "#111827",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatTime(elapsed)}
            </span>
            {phase === "recording" && (
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  fontWeight: 400,
                  color: "#9CA3AF",
                }}
              >
                {formatTime(remaining)} remaining
              </span>
            )}
          </div>

          {/* Waveform area */}
          {phase === "recording" ? (
            <div className="w-full" style={{ minHeight: 72 }}>
              <div
                ref={containerRef}
                className="w-full"
                style={{ minHeight: 72 }}
              />
            </div>
          ) : (
            <div
              className="w-full flex items-center"
              style={{ minHeight: 72, gap: 6, overflow: "hidden" }}
              aria-hidden
            >
              {Array.from({ length: 60 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "#D8D5F0",
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Controls */}
          {phase === "recording" ? (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={cancelRecording}
                className="cursor-pointer hover:bg-gray-50"
                style={{
                  height: 38,
                  padding: "0 18px",
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: "#FFFFFF",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: 14,
                  color: "#374151",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={stopRecording}
                aria-label="Stop recording"
                className="flex items-center justify-center cursor-pointer hover:opacity-90"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "#EF4444",
                  boxShadow: "0 0 0 6px rgba(239,68,68,0.15)",
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 3,
                    background: "#FFFFFF",
                  }}
                />
              </button>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  fontWeight: 400,
                  color: "#6B7280",
                  fontVariantNumeric: "tabular-nums",
                  minWidth: 40,
                  textAlign: "right",
                }}
              >
                {formatTime(elapsed)}
              </span>
            </div>
          ) : (
            <div
              className="flex items-center justify-center"
              style={{ gap: 16 }}
            >
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 15,
                  fontWeight: 400,
                  color: "#6B7280",
                }}
              >
                Tap to start recording
              </span>
              <button
                type="button"
                onClick={startRecording}
                aria-label="Start recording"
                className="flex items-center justify-center cursor-pointer hover:opacity-90"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "#EF4444",
                  boxShadow: "0 0 0 6px rgba(239,68,68,0.15)",
                }}
              >
                <Mic className="w-6 h-6 text-white" strokeWidth={2} />
              </button>
            </div>
          )}

          {phase === "ready" && (
            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-[#4F46E5] hover:underline cursor-pointer self-start"
            >
              ← Back
            </button>
          )}
        </>
      )}

      <style jsx>{`
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
        .recording-dot {
          animation: blink 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

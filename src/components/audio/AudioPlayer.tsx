"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FastForward, Pause, Play, Rewind, Volume2 } from "lucide-react";
import WaveSurfer from "wavesurfer.js";

interface AudioPlayerProps {
  /** Signed/remote URL of the audio. */
  audioUrl?: string;
  /** A recorded blob (preview, before upload). Takes precedence over audioUrl. */
  audioBlob?: Blob;
  /** Small label shown next to the disc, e.g. "Audio message · Personal". */
  categoryLabel?: string;
  autoPlay?: boolean;
}

const SPEEDS = [1, 1.5, 2, 0.5];

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Vinyl-record style player matching the audio message design — purple played
 * waveform over light-gray unplayed bars, red play button + cursor, skip ±15s,
 * speed cycling and a volume slider.
 */
export default function AudioPlayer({
  audioUrl,
  audioBlob,
  categoryLabel = "Audio message",
  autoPlay = false,
}: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [volume, setVolume] = useState(1);
  const [ready, setReady] = useState(false);

  const autoPlayRef = useRef(autoPlay);
  useEffect(() => {
    autoPlayRef.current = autoPlay;
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const objectUrl = audioBlob ? URL.createObjectURL(audioBlob) : undefined;
    const src = objectUrl ?? audioUrl;
    if (!src) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      height: 60,
      waveColor: "#D1D5DB",
      progressColor: "#7C3AED",
      cursorColor: "#7C3AED",
      cursorWidth: 2,
      barWidth: 3,
      barGap: 2,
      barRadius: 2,
      url: src,
      dragToSeek: true,
    });

    ws.on("ready", () => {
      setDuration(ws.getDuration());
      setReady(true);
      if (autoPlayRef.current) ws.play().catch(() => {});
    });
    ws.on("timeupdate", (time: number) => setCurrentTime(time));
    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("finish", () => setIsPlaying(false));

    wsRef.current = ws;

    return () => {
      ws.destroy();
      wsRef.current = null;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl, audioBlob]);

  const togglePlay = useCallback(() => wsRef.current?.playPause(), []);
  const skip = useCallback((sec: number) => wsRef.current?.skip(sec), []);
  const seekTo = useCallback(
    (time: number) => {
      const dur = wsRef.current?.getDuration() ?? 0;
      if (dur > 0) wsRef.current?.seekTo(time / dur);
    },
    []
  );

  const cycleSpeed = useCallback(() => {
    setSpeedIndex((prev) => {
      const next = (prev + 1) % SPEEDS.length;
      wsRef.current?.setPlaybackRate(SPEEDS[next]);
      return next;
    });
  }, []);

  const onVolume = useCallback((v: number) => {
    setVolume(v);
    wsRef.current?.setVolume(v);
  }, []);

  const remaining = Math.max(0, duration - currentTime);
  const seekPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full flex flex-col" style={{ gap: 20 }}>
      {/* Disc + timer */}
      <div className="flex items-center" style={{ gap: 20 }}>
        {/* Vinyl record */}
        <div
          className={`flex-shrink-0 vinyl-disc ${isPlaying ? "vinyl-spin" : ""}`}
          style={{
            position: "relative",
            width: 88,
            height: 88,
            borderRadius: "50%",
            background:
              "conic-gradient(from 0deg, #2e1065 0deg, #4c1d95 30deg, #6d28d9 60deg, #7c3aed 90deg, #a78bfa 110deg, #7c3aed 130deg, #5b21b6 160deg, #3730a3 190deg, #4338ca 220deg, #6d28d9 260deg, #a78bfa 290deg, #6d28d9 320deg, #2e1065 360deg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 12px rgba(109,40,217,0.5)",
          }}
        >
          {/* inner radial overlay for depth */}
          <div
            style={{
              position: "absolute",
              width: 88,
              height: 88,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 38% 38%, rgba(167,139,250,0.35) 0%, transparent 55%), radial-gradient(circle at center, rgba(30,27,75,0.4) 30%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <span
            style={{
              position: "relative",
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#1E1B4B",
              boxShadow: "0 0 0 3px rgba(255,255,255,0.25)",
            }}
          />
        </div>

        <div className="flex flex-col min-w-0" style={{ gap: 2 }}>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              fontWeight: 400,
              color: "#6B7280",
            }}
          >
            {categoryLabel}
          </span>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 40,
              fontWeight: 700,
              lineHeight: "44px",
              color: "#111827",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatTime(currentTime)}
          </span>
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
        </div>
      </div>

      {/* Waveform */}
      <div ref={containerRef} className="w-full" style={{ minHeight: 60 }} />

      {/* Seek bar */}
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.01}
        value={currentTime}
        onChange={(e) => seekTo(Number(e.target.value))}
        disabled={!ready}
        aria-label="Seek"
        className="seek-range w-full"
        style={{
          background: `linear-gradient(to right, #7C3AED ${seekPercent}%, #E5E7EB ${seekPercent}%)`,
          accentColor: "#7C3AED",
        }}
      />

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            fontWeight: 400,
            color: "#6B7280",
            fontVariantNumeric: "tabular-nums",
            minWidth: 84,
          }}
        >
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <div className="flex items-center" style={{ gap: 16 }}>
          <button
            type="button"
            onClick={() => skip(15)}
            disabled={!ready}
            aria-label="Forward 15 seconds"
            className="flex items-center justify-center cursor-pointer hover:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FastForward
              className="w-5 h-5"
              fill="#374151"
              stroke="#374151"
              strokeWidth={1}
            />
          </button>
          <button
            type="button"
            onClick={togglePlay}
            disabled={!ready}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="flex items-center justify-center cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#7C3AED",
              boxShadow: "0 0 16px 2px rgba(124,58,237,0.5)",
            }}
          >
            {isPlaying ? (
              <Pause
                className="w-6 h-6 text-white"
                fill="white"
                strokeWidth={0}
              />
            ) : (
              <Play
                className="w-6 h-6 text-white"
                fill="white"
                strokeWidth={0}
                style={{ marginLeft: 2 }}
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => skip(-15)}
            disabled={!ready}
            aria-label="Back 15 seconds"
            className="flex items-center justify-center cursor-pointer hover:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Rewind
              className="w-5 h-5"
              fill="#374151"
              stroke="#374151"
              strokeWidth={1}
            />
          </button>
          <button
            type="button"
            onClick={cycleSpeed}
            aria-label="Playback speed"
            className="flex items-center justify-center cursor-pointer hover:bg-gray-100"
            style={{
              minWidth: 44,
              height: 32,
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.1)",
              background: "#FFFFFF",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 13,
              color: "#374151",
              padding: "0 8px",
            }}
          >
            {SPEEDS[speedIndex]}x
          </button>
        </div>

        <div className="flex items-center" style={{ gap: 8, minWidth: 84 }}>
          <Volume2
            className="w-4 h-4 text-[#6B7280] flex-shrink-0"
            strokeWidth={2}
          />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => onVolume(Number(e.target.value))}
            aria-label="Volume"
            className="cursor-pointer"
            style={{ width: 72, accentColor: "#7C3AED" }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes vinyl-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .vinyl-spin {
          animation: vinyl-rotate 3s linear infinite;
        }
        .seek-range {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          border-radius: 999px;
          outline: none;
          cursor: pointer;
        }
        .seek-range:disabled {
          cursor: not-allowed;
        }
        .seek-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #7c3aed;
          border: 2px solid #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
          cursor: pointer;
        }
        .seek-range::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #7c3aed;
          border: 2px solid #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

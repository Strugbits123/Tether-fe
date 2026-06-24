"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  FastForward,
  Maximize,
  Pause,
  Play,
  Rewind,
  Volume2,
} from "lucide-react";
import type MuxPlayerElement from "@mux/mux-player";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
});

interface VideoPlayerProps {
  playbackId: string;
  playbackToken: string;
  autoPlay?: boolean;
}

const SPEEDS = [1, 1.5, 2, 0.5];

// Match the audio player's palette: purple progress (#7C3AED), red play
// button + seek handle (#EF4444), neutral-gray transport icons.
const ACCENT = "#7C3AED";
const PLAY_RED = "#EF4444";
const PLAY_GLOW = "0 0 16px 2px rgba(239,68,68,0.5)";
const ICON_GRAY = "#374151";

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Video message player matching the parchment/copper design — the MuxPlayer
 * native UI is hidden and driven via ref, with a custom overlay (HD badge,
 * center play, elapsed/total badge) and the transport controls rendered
 * *outside* the video frame (seek bar, rewind/play/forward, speed, volume,
 * fullscreen).
 */
export default function VideoPlayer({
  playbackId,
  playbackToken,
  autoPlay = false,
}: VideoPlayerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<MuxPlayerElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [volume, setVolume] = useState(1);
  const [ready, setReady] = useState(false);

  // Drive UI state from MuxPlayer's React event props rather than attaching
  // listeners in an effect: the player is dynamically imported, so its ref isn't
  // set on first mount — an effect-attached "play" listener would miss autoPlay
  // and the overlay would wrongly show a paused state while the video plays.
  const syncDuration = useCallback(() => {
    const el = playerRef.current;
    if (el) {
      setDuration(el.duration || 0);
      setReady(true);
    }
  }, []);
  const syncTime = useCallback(() => {
    const el = playerRef.current;
    if (el) setCurrentTime(el.currentTime || 0);
  }, []);
  const syncVolume = useCallback(() => {
    const el = playerRef.current;
    if (el) setVolume(el.muted ? 0 : el.volume);
  }, []);
  const syncRate = useCallback(() => {
    const el = playerRef.current;
    if (!el) return;
    const idx = SPEEDS.indexOf(el.playbackRate);
    if (idx >= 0) setSpeedIndex(idx);
  }, []);

  const togglePlay = useCallback(() => {
    const el = playerRef.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  }, []);

  const skip = useCallback((sec: number) => {
    const el = playerRef.current;
    if (!el) return;
    el.currentTime = Math.max(
      0,
      Math.min(el.duration || 0, el.currentTime + sec)
    );
  }, []);

  const seekTo = useCallback((time: number) => {
    const el = playerRef.current;
    if (el) el.currentTime = time;
  }, []);

  const cycleSpeed = useCallback(() => {
    setSpeedIndex((prev) => {
      const next = (prev + 1) % SPEEDS.length;
      if (playerRef.current) playerRef.current.playbackRate = SPEEDS[next];
      return next;
    });
  }, []);

  const onVolume = useCallback((v: number) => {
    setVolume(v);
    const el = playerRef.current;
    if (el) {
      el.volume = v;
      el.muted = v === 0;
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      rootRef.current?.requestFullscreen().catch(() => {});
    }
  }, []);

  const seekPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div ref={rootRef} className="w-full flex flex-col" style={{ gap: 16 }}>
      {/* Video frame */}
      <div
        className="relative w-full overflow-hidden"
        style={{ borderRadius: 12, background: "#000000", aspectRatio: "16 / 9" }}
      >
        <MuxPlayer
          ref={playerRef}
          playbackId={playbackId}
          tokens={{ playback: playbackToken }}
          autoPlay={autoPlay}
          onLoadedMetadata={syncDuration}
          onDurationChange={syncDuration}
          onTimeUpdate={syncTime}
          onPlay={() => setIsPlaying(true)}
          onPlaying={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onVolumeChange={syncVolume}
          onRateChange={syncRate}
          style={{
            width: "100%",
            height: "100%",
            "--controls": "none",
            "--media-object-fit": "contain",
          }}
        />

        {/* HD badge */}
        <span
          className="absolute"
          style={{
            top: 12,
            left: 12,
            padding: "3px 8px",
            borderRadius: 6,
            background: "rgba(0,0,0,0.45)",
            color: "#FFFFFF",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.5px",
          }}
        >
          HD
        </span>

        {/* Center play/pause */}
        <button
          type="button"
          onClick={togglePlay}
          disabled={!ready}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="absolute left-1/2 top-1/2 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          style={{
            transform: "translate(-50%, -50%)",
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: PLAY_RED,
            boxShadow: PLAY_GLOW,
            opacity: isPlaying ? 0 : 1,
            transition: "opacity 0.2s ease",
            pointerEvents: isPlaying ? "none" : "auto",
          }}
        >
          <Play
            className="w-7 h-7 text-white"
            fill="white"
            strokeWidth={0}
            style={{ marginLeft: 3 }}
          />
        </button>

        {/* Time badge */}
        <span
          className="absolute"
          style={{
            bottom: 12,
            right: 12,
            padding: "3px 10px",
            borderRadius: 6,
            background: "rgba(0,0,0,0.55)",
            color: "#FFFFFF",
            fontSize: 12,
            fontWeight: 500,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      {/* Seek bar (outside the video) */}
      <div className="flex items-center" style={{ gap: 12 }}>
        <span
          style={{
            fontSize: 13,
            color: "#6B7280",
            fontVariantNumeric: "tabular-nums",
            minWidth: 36,
          }}
        >
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.01}
          value={currentTime}
          onChange={(e) => seekTo(Number(e.target.value))}
          disabled={!ready}
          aria-label="Seek"
          className="video-seek flex-1"
          style={{
            background: `linear-gradient(to right, ${ACCENT} ${seekPercent}%, #E5E7EB ${seekPercent}%)`,
          }}
        />
        <span
          className="flex items-center"
          style={{
            gap: 6,
            fontSize: 13,
            color: "#6B7280",
            fontVariantNumeric: "tabular-nums",
            minWidth: 44,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: PLAY_RED,
              display: "inline-block",
            }}
          />
          {formatTime(duration)}
        </span>
      </div>

      {/* Controls (outside the video) */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center" style={{ gap: 16 }}>
          <button
            type="button"
            onClick={() => skip(-15)}
            disabled={!ready}
            aria-label="Back 15 seconds"
            className="flex items-center justify-center cursor-pointer hover:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Rewind
              className="w-5 h-5"
              fill={ICON_GRAY}
              stroke={ICON_GRAY}
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
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: PLAY_RED,
              boxShadow: PLAY_GLOW,
            }}
          >
            {isPlaying ? (
              <Pause
                className="w-5 h-5 text-white"
                fill="white"
                strokeWidth={0}
              />
            ) : (
              <Play
                className="w-5 h-5 text-white"
                fill="white"
                strokeWidth={0}
                style={{ marginLeft: 2 }}
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => skip(15)}
            disabled={!ready}
            aria-label="Forward 15 seconds"
            className="flex items-center justify-center cursor-pointer hover:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FastForward
              className="w-5 h-5"
              fill={ICON_GRAY}
              stroke={ICON_GRAY}
              strokeWidth={1}
            />
          </button>
        </div>

        <div className="flex items-center" style={{ gap: 16 }}>
          <button
            type="button"
            onClick={cycleSpeed}
            aria-label="Playback speed"
            className="flex items-center justify-center cursor-pointer hover:bg-gray-100"
            style={{
              minWidth: 40,
              height: 30,
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.1)",
              background: "#FFFFFF",
              fontWeight: 600,
              fontSize: 13,
              color: ICON_GRAY,
              padding: "0 8px",
            }}
          >
            {SPEEDS[speedIndex]}x
          </button>

          <div className="flex items-center" style={{ gap: 8 }}>
            <Volume2
              className="w-4 h-4 flex-shrink-0"
              style={{ color: "#6B7280" }}
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
              style={{ width: 64, accentColor: ACCENT }}
            />
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Fullscreen"
            className="flex items-center justify-center cursor-pointer hover:opacity-70"
          >
            <Maximize
              className="w-[18px] h-[18px]"
              style={{ color: "#6B7280" }}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>

      <style jsx>{`
        .video-seek {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          border-radius: 999px;
          outline: none;
          cursor: pointer;
        }
        .video-seek:disabled {
          cursor: not-allowed;
        }
        .video-seek::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: ${PLAY_RED};
          border: 2px solid #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
          cursor: pointer;
        }
        .video-seek::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: ${PLAY_RED};
          border: 2px solid #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

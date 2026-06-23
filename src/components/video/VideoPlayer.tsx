"use client";

import dynamic from "next/dynamic";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
});

interface VideoPlayerProps {
  playbackId: string;
  playbackToken: string;
  autoPlay?: boolean;
}

/**
 * Video message player. Uses the same purple/red audio-message theme (NOT the
 * parchment reference) applied to MuxPlayer's controls via its CSS variables.
 */
export default function VideoPlayer({
  playbackId,
  playbackToken,
  autoPlay = false,
}: VideoPlayerProps) {
  return (
    <div
      className="w-full overflow-hidden"
      style={{ borderRadius: 12, background: "#000000" }}
    >
      <MuxPlayer
        playbackId={playbackId}
        tokens={{ playback: playbackToken }}
        autoPlay={autoPlay}
        accentColor="#7C3AED"
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          "--media-accent-color": "#7C3AED",
          "--media-primary-color": "#FFFFFF",
          "--media-secondary-color": "#7C3AED",
          "--media-range-track-background": "rgba(124, 58, 237, 0.25)",
          "--media-range-bar-color": "#7C3AED",
          "--media-range-thumb-background": "#EF4444",
          "--media-control-hover-background": "rgba(124, 58, 237, 0.25)",
        }}
      />
    </div>
  );
}

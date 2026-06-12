import type { SyntheticEvent } from 'react'

/**
 * WebM audio recorded via MediaRecorder (and some streamed sources) report a
 * duration of `Infinity` until the playhead is seeked to the end. That makes the
 * native <audio> control render the scrubber stuck at the end even though
 * playback works fine from start to finish.
 *
 * Attach to the element's `onLoadedMetadata`: when the duration is unknown we
 * seek to a huge time to force the browser to resolve the real duration, then
 * snap back to the start. No-op when the duration is already known.
 */
export function fixAudioDuration(e: SyntheticEvent<HTMLAudioElement>) {
  const audio = e.currentTarget
  if (audio.duration !== Infinity && !Number.isNaN(audio.duration)) return

  const reset = () => {
    audio.removeEventListener('timeupdate', reset)
    if (audio.currentTime > 0) audio.currentTime = 0
  }
  audio.addEventListener('timeupdate', reset)
  // Large enough to land past the end; the browser clamps and computes duration.
  audio.currentTime = 1e101
}

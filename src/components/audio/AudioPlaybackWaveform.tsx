'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import WaveSurfer from 'wavesurfer.js'

interface AudioPlaybackWaveformProps {
  /** Signed/remote URL of the audio. */
  audioUrl?: string
  /** A recorded blob (preview, before upload). Takes precedence over audioUrl. */
  audioBlob?: Blob
  height?: number
  waveColor?: string
  progressColor?: string
  cursorColor?: string
  autoPlay?: boolean
  onReady?: (duration: number) => void
  onTimeUpdate?: (currentTime: number) => void
  onFinish?: () => void
}

function formatTime(sec: number) {
  if (!Number.isFinite(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function AudioPlaybackWaveform({
  audioUrl,
  audioBlob,
  height = 80,
  waveColor = 'rgba(255, 255, 255, 0.3)',
  progressColor = 'rgba(255, 255, 255, 1)',
  cursorColor = 'rgba(255, 255, 255, 0.7)',
  autoPlay = false,
  onReady,
  onTimeUpdate,
  onFinish,
}: AudioPlaybackWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Keep callbacks fresh without re-creating the WaveSurfer instance.
  const cbRef = useRef({ onReady, onTimeUpdate, onFinish, autoPlay })
  useEffect(() => {
    cbRef.current = { onReady, onTimeUpdate, onFinish, autoPlay }
  })

  useEffect(() => {
    if (!containerRef.current) return

    const objectUrl = audioBlob ? URL.createObjectURL(audioBlob) : undefined
    const src = objectUrl ?? audioUrl
    if (!src) return

    const ws = WaveSurfer.create({
      container: containerRef.current,
      height,
      waveColor,
      progressColor,
      cursorColor,
      cursorWidth: 2,
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      url: src,
      dragToSeek: true,
    })

    ws.on('ready', () => {
      const dur = ws.getDuration()
      setDuration(dur)
      cbRef.current.onReady?.(dur)
      if (cbRef.current.autoPlay) ws.play().catch(() => {})
    })
    ws.on('play', () => setIsPlaying(true))
    ws.on('pause', () => setIsPlaying(false))
    ws.on('timeupdate', (time: number) => {
      setCurrentTime(time)
      cbRef.current.onTimeUpdate?.(time)
    })
    ws.on('finish', () => {
      setIsPlaying(false)
      cbRef.current.onFinish?.()
    })

    wsRef.current = ws

    return () => {
      ws.destroy()
      wsRef.current = null
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl, audioBlob])

  const togglePlayPause = useCallback(() => {
    wsRef.current?.playPause()
  }, [])

  return (
    <div className="w-full flex flex-col gap-2">
      <div ref={containerRef} className="w-full" style={{ minHeight: height }} />
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={togglePlayPause}
          className="flex items-center justify-center rounded-full transition-opacity hover:opacity-80 cursor-pointer"
          style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.2)' }}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg width="14" height="16" viewBox="0 0 14 16" fill="white" aria-hidden>
              <rect x="1" y="0" width="4" height="16" rx="1" />
              <rect x="9" y="0" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="16" viewBox="0 0 14 16" fill="white" aria-hidden>
              <path d="M1 1.5v13l12-6.5L1 1.5z" />
            </svg>
          )}
        </button>
        <span
          style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: 13,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}

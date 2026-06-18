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

async function extractPeaks(src: string, numBars = 80): Promise<{ peaks: number[]; duration: number } | null> {
  try {
    const response = await fetch(src)
    const arrayBuffer = await response.arrayBuffer()
    const audioCtx = new AudioContext()
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
    await audioCtx.close()

    const channelData = audioBuffer.getChannelData(0)
    const blockSize = Math.floor(channelData.length / numBars)
    const peaks: number[] = []

    for (let i = 0; i < numBars; i++) {
      let max = 0
      for (let j = 0; j < blockSize; j++) {
        const abs = Math.abs(channelData[i * blockSize + j])
        if (abs > max) max = abs
      }
      peaks.push(max)
    }

    // Normalize
    const maxPeak = Math.max(...peaks) || 1
    return { peaks: peaks.map(p => p / maxPeak), duration: audioBuffer.duration }
  } catch {
    return null
  }
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
  const [isLoading, setIsLoading] = useState(true)

  const cbRef = useRef({ onReady, onTimeUpdate, onFinish, autoPlay })
  useEffect(() => {
    cbRef.current = { onReady, onTimeUpdate, onFinish, autoPlay }
  })

  useEffect(() => {
    if (!containerRef.current) return

    const objectUrl = audioBlob ? URL.createObjectURL(audioBlob) : undefined
    const src = objectUrl ?? audioUrl
    if (!src) return

    let ws: WaveSurfer | null = null
    let cancelled = false

    setIsLoading(true)
    extractPeaks(src).then(peakData => {
      if (cancelled || !containerRef.current) return

      ws = WaveSurfer.create({
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
        // Pre-supply decoded peaks so bars render immediately before play
        ...(peakData ? { peaks: [peakData.peaks], duration: peakData.duration } : {}),
      })

      ws.on('ready', () => {
        if (cancelled) return
        const dur = ws!.getDuration()
        setDuration(dur)
        setIsLoading(false)
        cbRef.current.onReady?.(dur)
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

      if (peakData) setDuration(peakData.duration)
      wsRef.current = ws
    })

    return () => {
      cancelled = true
      ws?.destroy()
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
      <div ref={containerRef} className={`w-full${isLoading ? ' opacity-0' : ''}`} style={{ minHeight: height }} />
      {isLoading && (
        <div className="w-full flex items-center justify-center" style={{ height }}>
          <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-label="Loading">
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      )}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={togglePlayPause}
          disabled={isLoading}
          className="flex items-center justify-center rounded-full transition-opacity hover:opacity-80 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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

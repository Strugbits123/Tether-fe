'use client'

import { useEffect, useRef } from 'react'
import WaveSurfer from 'wavesurfer.js'
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js'

interface AudioRecordingWaveformProps {
  /** When true, the mic is opened and a scrolling waveform records; false stops it. */
  isRecording: boolean
  height?: number
  waveColor?: string
  progressColor?: string
  /** Fired with the captured audio/webm blob once recording stops. */
  onRecordEnd?: (blob: Blob) => void
  /** Fired if the mic can't be accessed. */
  onError?: (err: unknown) => void
}

export default function AudioRecordingWaveform({
  isRecording,
  height = 80,
  waveColor = 'rgba(255, 255, 255, 0.6)',
  progressColor = 'rgba(255, 255, 255, 1)',
  onRecordEnd,
  onError,
}: AudioRecordingWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WaveSurfer | null>(null)
  const recordRef = useRef<ReturnType<typeof RecordPlugin.create> | null>(null)

  // Keep callbacks fresh without re-creating the WaveSurfer instance.
  const cbRef = useRef({ onRecordEnd, onError })
  useEffect(() => {
    cbRef.current = { onRecordEnd, onError }
  })

  useEffect(() => {
    if (!containerRef.current) return

    const ws = WaveSurfer.create({
      container: containerRef.current,
      height,
      waveColor,
      progressColor,
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      cursorWidth: 0,
    })

    const record = ws.registerPlugin(
      RecordPlugin.create({
        scrollingWaveform: true,
        renderRecordedAudio: false,
        mimeType: 'audio/webm',
      }),
    )

    record.on('record-end', (blob: Blob) => {
      cbRef.current.onRecordEnd?.(blob)
    })

    wsRef.current = ws
    recordRef.current = record

    return () => {
      try {
        record.destroy()
      } catch {
        /* ignore */
      }
      ws.destroy()
      wsRef.current = null
      recordRef.current = null
    }
  }, [height, waveColor, progressColor])

  useEffect(() => {
    const record = recordRef.current
    if (!record) return

    if (isRecording) {
      if (!record.isRecording()) {
        record.startRecording().catch((err) => cbRef.current.onError?.(err))
      }
    } else if (record.isRecording()) {
      record.stopRecording()
    }
  }, [isRecording])

  return <div ref={containerRef} className="w-full" style={{ minHeight: height }} />
}

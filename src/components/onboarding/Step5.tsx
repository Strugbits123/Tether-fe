"use client"

import React, { useRef, useState } from 'react'
import { ArrowLeft, FileText, Mic, Video, Upload } from 'lucide-react'

interface Step5Props {
  onNext: () => void
  onBack: () => void
  loading?: boolean
}

const fileTypeCards = [
  {
    icon: FileText,
    label: 'Documents',
    accept: '.pdf,.jpg,.png,.csv,.docx',
    types: 'PDF, JPG, PNG, CSV, DOCX',
  },
  {
    icon: Mic,
    label: 'Audio Files',
    accept: '.mp3,.wav',
    types: 'MP3, WAV',
  },
  {
    icon: Video,
    label: 'Video Files',
    accept: '.mov,.mp4',
    types: 'MOV, MP4',
  },
]

export default function Step5({ onNext, onBack, loading }: Step5Props) {
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const cardInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return
    setFiles(prev => [...prev, ...Array.from(selectedFiles)])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  return (
    <div
      className="w-full flex flex-col items-center px-4 py-8 font-sans"
      style={{
        background: 'linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 50%, #F0FDF4 100%)',
      }}
    >
      <div className="w-full max-w-[768px]">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[#4F46E5] text-[14px] font-medium underline mb-8 cursor-pointer hover:text-[#4338CA] transition-colors"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '20px',
            letterSpacing: '-0.15px',
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Title Section */}
        <div className="text-center mb-8">
          <h1
            className="text-[#111827] mb-3"
            style={{
              fontFamily: 'Instrument Serif, serif',
              fontWeight: 400,
              fontSize: '46px',
              lineHeight: '48px',
              letterSpacing: '0px',
            }}
          >
            Upload your files
          </h1>
          <p
            className="text-[#4A5565]"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '18px',
              lineHeight: '28px',
              letterSpacing: '-0.44px',
            }}
          >
            Keep your important documents secure and accessible
          </p>
        </div>

        {/* File Type Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {fileTypeCards.map((card, i) => {
            const Icon = card.icon
            return (
              <button
                key={card.label}
                onClick={() => cardInputRefs.current[i]?.click()}
                className="flex flex-col items-center justify-center text-center bg-white rounded-[14px] cursor-pointer transition-all hover:border-[#C7D2FE] hover:shadow-sm"
                style={{
                  border: '1.25px solid rgba(0, 0, 0, 0.1)',
                  padding: '24px',
                  minHeight: '165px',
                }}
              >
                <div
                  className="flex items-center justify-center mb-3"
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#E0E7FF',
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: '#4F46E5' }} />
                </div>

                <p
                  className="mb-0.5"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '18px',
                    lineHeight: '27px',
                    letterSpacing: '-0.44px',
                    color: '#101828',
                  }}
                >
                  {card.label}
                </p>

                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: '#4A5565',
                  }}
                >
                  Click to upload
                </p>
              </button>
            )
          })}
        </div>

        {/* Hidden file inputs for cards */}
        {fileTypeCards.map((card, i) => (
          <input
            key={card.label}
            ref={(el) => { cardInputRefs.current[i] = el }}
            type="file"
            accept={card.accept}
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        ))}

        {/* Drop Zone */}
        <div
          ref={dropRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center text-center bg-white rounded-[14px] cursor-pointer transition-all mb-6"
          style={{
            border: `1.25px dashed ${isDragging ? '#4F46E5' : '#D1D5DC'}`,
            padding: '32px',
            minHeight: '197px',
            background: isDragging ? '#F5F3FF' : '#FFFFFF',
          }}
        >
          <div
            className="flex items-center justify-center mb-3"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#E0E7FF',
            }}
          >
            <Upload className="w-8 h-8" style={{ color: '#4F46E5' }} />
          </div>

          <p
            className="mb-1"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '18px',
              lineHeight: '27px',
              letterSpacing: '-0.44px',
              color: '#101828',
            }}
          >
            Drop files here or click to browse
          </p>

          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#4A5565',
            }}
          >
            Supports PDF, JPG, PNG, CSV, DOCX, MOV, MP4, MP3, WAV (Max 10MB)
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.jpg,.png,.csv,.docx,.mov,.mp4,.mp3,.wav"
          onChange={(e) => handleFileSelect(e.target.files)}
        />

        {/* Uploaded Files List */}
        {files.length > 0 && (
          <div className="space-y-2 mb-6">
            {files.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-[#E5E7EB]"
              >
                <span className="text-sm text-[#374151] truncate max-w-[500px]">
                  {file.name}
                </span>
                <span className="text-xs text-[#6A7282] flex-shrink-0 ml-2">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center justify-center text-[#0A0A0A] font-medium rounded-lg transition-all cursor-pointer hover:bg-slate-50"
            style={{
              width: '165px',
              height: '50px',
              background: '#FFFFFF',
              border: '1.25px solid rgba(0, 0, 0, 0.2)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              borderRadius: '8px',
            }}
          >
            Skip for now
          </button>

          <button
            onClick={onNext}
            disabled={loading}
            className="flex items-center justify-center gap-2 text-white font-medium rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              width: '165px',
              height: '50px',
              background: '#4F46E5',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              borderRadius: '8px',
            }}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <>
                <span>Finish Setup</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </>
            )}
          </button>
        </div>

        {/* Helper Text */}
        <p
          className="text-center mt-4"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '20px',
            letterSpacing: '-0.15px',
            color: '#6A7282',
          }}
        >
          All files are encrypted end-to-end
        </p>
      </div>
    </div>
  )
}

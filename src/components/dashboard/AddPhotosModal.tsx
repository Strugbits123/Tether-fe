'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, ChevronUp, FileImage, Search, Upload, X } from 'lucide-react'

interface AddPhotosModalProps {
  open: boolean
  onClose: () => void
  onSave?: (data: PhotosFormData) => void
  title?: string
  subtitle?: string
}

export interface PhotosFormData {
  files: File[]
  notes: string
  recipientGroups: string[]
  selectedIndividuals: string[]
}

const GROUP_OPTIONS = [
  'Assign Later',
  'All Recipients',
  'All Family',
  'All Friends',
  'All Others',
  'Release Manager',
]

interface Individual {
  id: string
  name: string
  relationship: string
}

const INDIVIDUALS: Individual[] = [
  { id: 'i1', name: 'Michael Chen', relationship: 'Family' },
  { id: 'i2', name: 'Emma Rodriguez', relationship: 'Family' },
  { id: 'i3', name: 'David Thompson', relationship: 'Friend' },
  { id: 'i4', name: 'Sophie Martin', relationship: 'Friend' },
  { id: 'i5', name: 'James Wilson', relationship: 'Colleague' },
]

export default function AddPhotosModal({
  open,
  onClose,
  onSave,
  title = 'Add Photos',
  subtitle = "Upload your most cherished photos — moments you want your family to see and keep forever. They'll be safely stored and shared when your Tether is released.",
}: AddPhotosModalProps) {
  const [files, setFiles] = useState<File[]>([])
  const [notes, setNotes] = useState('')
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['All Friends', 'All Others'])
  const [selectedIndividuals, setSelectedIndividuals] = useState<string[]>(['i2'])
  const [showIndividuals, setShowIndividuals] = useState(true)
  const [search, setSearch] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  const toggleGroup = (g: string) =>
    setSelectedGroups((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))

  const toggleIndividual = (id: string) =>
    setSelectedIndividuals((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )

  const mergeFiles = (incoming: File[]) =>
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => `${f.name}::${f.size}::${f.lastModified}`))
      const fresh = incoming.filter(
        (f) => !seen.has(`${f.name}::${f.size}::${f.lastModified}`),
      )
      return [...prev, ...fresh]
    })

  const handlePickFiles = () => fileInputRef.current?.click()
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files
    if (!list) return
    mergeFiles(Array.from(list))
    e.target.value = ''
  }
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const list = e.dataTransfer.files
    if (!list) return
    mergeFiles(Array.from(list))
  }
  const removeFile = (idx: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx))

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleUpload = () => {
    onSave?.({
      files,
      notes,
      recipientGroups: selectedGroups,
      selectedIndividuals,
    })
    onClose()
  }

  const filteredIndividuals = INDIVIDUALS.filter((i) =>
    i.name.toLowerCase().includes(search.trim().toLowerCase()),
  )

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesChange}
        className="hidden"
      />
      <div
        className="flex min-h-full items-center justify-center px-2 sm:px-4 py-4 sm:py-10"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div
          className="relative bg-white w-full"
          style={{
            maxWidth: 448,
            borderRadius: 10,
            boxShadow:
              '0px 8px 10px -6px rgba(0,0,0,0.1), 0px 20px 25px -5px rgba(0,0,0,0.1)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute cursor-pointer top-5 right-5 sm:top-[22px] sm:right-6"
            style={{ width: 22, height: 22, opacity: 0.7, borderRadius: 2.74 }}
          >
            <X className="w-[22px] h-[22px] text-[#0A0A0A]" strokeWidth={2} />
          </button>

          {/* Header */}
          <div className="px-5 sm:px-6 pt-6 sm:pt-[22px] pr-12 sm:pr-14">
            <h2
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 23,
                lineHeight: '28px',
                color: '#101828',
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className="mt-[7px]"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: '20px',
                  letterSpacing: '-0.15px',
                  color: '#717182',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Body */}
          <div className="flex flex-col gap-5 px-5 sm:px-6 pt-5 pb-5">
            {/* Dropzone */}
            <div className="flex flex-col gap-3">
              <div
                role="button"
                tabIndex={0}
                onClick={handlePickFiles}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handlePickFiles()
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="w-full flex flex-col items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
                style={{
                  minHeight: 146,
                  borderRadius: 10,
                  border: '1.25px dashed #D1D5DC',
                  background: '#FFFFFF',
                  padding: '24px',
                }}
              >
                <Upload className="w-12 h-12 text-[#99A1AF]" strokeWidth={1.75} />
                <span
                  className="mt-3"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: '20px',
                    letterSpacing: '-0.15px',
                    color: '#4A5565',
                  }}
                >
                  Drop files here or click to browse
                </span>
                <span
                  className="mt-1"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 12,
                    lineHeight: '16px',
                    color: '#99A1AF',
                  }}
                >
                  You can select multiple images at once
                </span>
              </div>

              {files.length > 0 && (
                <div
                  className="flex flex-col gap-2 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#D1D5DC] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
                  style={{
                    maxHeight: 160,
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#D1D5DC transparent',
                  }}
                >
                  {files.map((f, idx) => (
                    <div
                      key={`${f.name}-${f.size}-${idx}`}
                      className="flex items-center gap-2"
                      style={{
                        borderRadius: 8,
                        border: '1px solid rgba(0,0,0,0.08)',
                        background: '#F9FAFB',
                        padding: '8px 10px',
                      }}
                    >
                      <FileImage className="w-4 h-4 text-[#4F46E5] flex-shrink-0" strokeWidth={2} />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span
                          className="truncate"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: 13,
                            lineHeight: '18px',
                            color: '#0A0A0A',
                          }}
                        >
                          {f.name}
                        </span>
                        <span
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: 12,
                            lineHeight: '16px',
                            color: '#717182',
                          }}
                        >
                          {formatSize(f.size)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        aria-label={`Remove ${f.name}`}
                        className="cursor-pointer text-[#717182] hover:text-[#0A0A0A] flex-shrink-0"
                      >
                        <X className="w-4 h-4" strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-2">
              <label
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '14px',
                  letterSpacing: '-0.15px',
                  color: '#0A0A0A',
                }}
              >
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional information..."
                rows={2}
                className="w-full focus:outline-none resize-none"
                style={{
                  minHeight: 64,
                  borderRadius: 8,
                  border: '1.25px solid rgba(0,0,0,0.1)',
                  background: '#F3F3F5',
                  padding: '8px 12px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: '20px',
                  letterSpacing: '-0.15px',
                  color: '#0A0A0A',
                }}
              />
            </div>

            {/* Recipients */}
            <div className="flex flex-col gap-2">
              <label
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '14px',
                  color: '#0A0A0A',
                }}
              >
                Recipients
              </label>

              <div className="flex flex-col gap-2">
                {GROUP_OPTIONS.map((g) => {
                  const isAssignLater = g === 'Assign Later'
                  const selected = selectedGroups.includes(g)
                  return (
                    <GroupRow
                      key={g}
                      label={g}
                      selected={selected}
                      variant={isAssignLater ? 'yellow' : 'default'}
                      onToggle={() => toggleGroup(g)}
                    />
                  )
                })}
              </div>

              {/* Show / Hide individuals */}
              <button
                type="button"
                onClick={() => setShowIndividuals((s) => !s)}
                className="w-full flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 mt-1"
                style={{
                  height: 36,
                  borderRadius: 8,
                  border: '1.1px solid rgba(0,0,0,0.1)',
                  background: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '20px',
                  color: '#0A0A0A',
                }}
              >
                {showIndividuals ? (
                  <ChevronUp className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2} />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#0A0A0A]" strokeWidth={2} />
                )}
                {showIndividuals ? 'Hide Individuals' : 'Show Individuals'}
              </button>

              {/* Individuals search + list */}
              {showIndividuals && (
                <div className="flex flex-col gap-2 mt-1">
                  <div
                    className="w-full flex items-center gap-2"
                    style={{
                      height: 36,
                      borderRadius: 8,
                      background: '#F3F3F5',
                      padding: '4px 12px',
                    }}
                  >
                    <Search className="w-4 h-4 text-[#717182] flex-shrink-0" strokeWidth={2} />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by name..."
                      className="flex-1 bg-transparent outline-none min-w-0"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: 14,
                        lineHeight: '20px',
                        color: '#0A0A0A',
                      }}
                    />
                  </div>

                  <div
                    className="flex flex-col gap-2 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#D1D5DC] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
                    style={{
                      maxHeight: 150,
                      borderRadius: 10,
                      border: '1.1px solid rgba(0,0,0,0.1)',
                      background: '#F9FAFB',
                      padding: '8px',
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#D1D5DC transparent',
                    }}
                  >
                    {filteredIndividuals.length === 0 ? (
                      <p
                        className="text-center py-4"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 13,
                          color: '#717182',
                        }}
                      >
                        No matches.
                      </p>
                    ) : (
                      filteredIndividuals.map((p) => {
                        const selected = selectedIndividuals.includes(p.id)
                        return (
                          <button
                            type="button"
                            key={p.id}
                            onClick={() => toggleIndividual(p.id)}
                            className="w-full flex items-center gap-2 cursor-pointer"
                            style={{
                              borderRadius: 8,
                              background: selected ? '#E0E7FF' : '#FFFFFF',
                              border: selected ? '1px solid #4F46E5' : '1px solid transparent',
                              padding: '8px',
                            }}
                          >
                            <CheckBox checked={selected} />
                            <div className="flex flex-col items-start flex-1 min-w-0">
                              <span
                                className="truncate"
                                style={{
                                  fontFamily: 'Inter, sans-serif',
                                  fontWeight: 500,
                                  fontSize: 14,
                                  lineHeight: '20px',
                                  color: '#0A0A0A',
                                }}
                              >
                                {p.name}
                              </span>
                              <span
                                style={{
                                  fontFamily: 'Inter, sans-serif',
                                  fontWeight: 400,
                                  fontSize: 12,
                                  lineHeight: '16px',
                                  color: '#717182',
                                }}
                              >
                                {p.relationship}
                              </span>
                            </div>
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex flex-wrap items-center justify-end gap-3 px-5 sm:px-6 py-[15px]"
            style={{
              background: '#F9FAFB',
              borderTop: '0.8px solid #E5E7EB',
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer hover:bg-gray-50"
              style={{
                width: 77.6,
                height: 36,
                padding: '7.8px 15.8px',
                borderRadius: 8,
                border: '1px solid rgba(0,0,0,0.1)',
                background: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 13.2,
                lineHeight: '20px',
                color: '#0A0A0A',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              className="cursor-pointer hover:opacity-90"
              style={{
                height: 36,
                padding: '8px 16px',
                borderRadius: 8,
                background: '#4F46E5',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '20px',
                color: '#FFFFFF',
              }}
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------- Sub components ------------------- */

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span
      className="flex items-center justify-center flex-shrink-0"
      style={{
        width: 16,
        height: 16,
        borderRadius: 4,
        background: checked ? '#4F46E5' : '#FFFFFF',
        border: checked ? '1.1px solid #4F46E5' : '1.1px solid rgba(0,0,0,0.1)',
        boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)',
      }}
    >
      {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
    </span>
  )
}

function GroupRow({
  label,
  selected,
  variant,
  onToggle,
}: {
  label: string
  selected: boolean
  variant: 'yellow' | 'default'
  onToggle: () => void
}) {
  let bg = '#F9FAFB'
  let border = '1.1px solid rgba(0,0,0,0.1)'
  let textColor = '#364153'

  if (variant === 'yellow') {
    bg = '#FFFBEB'
    border = '1.1px solid #FDEBA2'
    textColor = '#364153'
  }
  if (selected && variant !== 'yellow') {
    bg = '#E0E7FF'
    border = '1.1px solid #4F46E5'
    textColor = '#4F46E5'
  }
  if (selected && variant === 'yellow') {
    // keep yellow look, just indicate selection through the check
    bg = '#FFFBEB'
    border = '1.1px solid #FDEBA2'
  }

  // Checkbox border for yellow row should pick up theme color
  const ChecboxYellow = () => (
    <span
      className="flex items-center justify-center flex-shrink-0"
      style={{
        width: 16,
        height: 16,
        borderRadius: 4,
        background: selected ? '#4F46E5' : '#FFFFFF',
        border: selected ? '1.1px solid #4F46E5' : '1.1px solid #FDEBA2',
        boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)',
      }}
    >
      {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
    </span>
  )

  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center cursor-pointer"
      style={{
        minHeight: 42,
        borderRadius: 10,
        border,
        background: bg,
        padding: '12px',
        gap: 12,
      }}
    >
      {variant === 'yellow' ? <ChecboxYellow /> : <CheckBox checked={selected} />}
      <span
        className="text-left flex-1 min-w-0"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '14px',
          color: textColor,
        }}
      >
        {label}
      </span>
    </button>
  )
}

'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, ChevronUp, Search, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getRecipients, type Recipient } from '@/lib/api/recipients'

interface AssignRecipientsModalProps {
  open: boolean
  onClose: () => void
  messageTitle: string
  initialGroups?: string[]
  initialIndividualIds?: string[]
  onSave?: (groups: string[], individualIds: string[]) => void
}

const GROUPS = [
  'All Recipients',
  'All Family',
  'All Friends',
  'All Others',
  'Release Manager',
]

export default function AssignRecipientsModal({
  open,
  onClose,
  messageTitle,
  initialGroups = [],
  initialIndividualIds = [],
  onSave,
}: AssignRecipientsModalProps) {
  const [groups, setGroups] = useState<string[]>(initialGroups)
  const [individualIds, setIndividualIds] = useState<string[]>(initialIndividualIds)
  const [showIndividuals, setShowIndividuals] = useState(false)
  const [search, setSearch] = useState('')
  const [recipients, setRecipients] = useState<Recipient[]>([])

  useEffect(() => {
    if (!open) return
    setGroups(initialGroups)
    setIndividualIds(initialIndividualIds)
    setShowIndividuals(false)
    setSearch('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Load real recipients for the individual picker.
  useEffect(() => {
    if (!open) return
    let active = true
    ;(async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) return
      try {
        const data = await getRecipients(token)
        if (active) setRecipients(data)
      } catch {
        /* non-fatal — picker stays empty */
      }
    })()
    return () => {
      active = false
    }
  }, [open])

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
    setGroups((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))
  const toggleIndividual = (id: string) =>
    setIndividualIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )

  const filtered = recipients.filter((p) =>
    p.name.toLowerCase().includes(search.trim().toLowerCase()),
  )

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
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
            className="absolute cursor-pointer top-5 right-5 sm:top-6 sm:right-6"
            style={{ width: 22, height: 22, opacity: 0.7 }}
          >
            <X className="w-[22px] h-[22px] text-[#0A0A0A]" strokeWidth={2} />
          </button>

          {/* Header */}
          <div className="px-5 sm:px-6 pt-6 pb-4 pr-12 sm:pr-14">
            <h2
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 20,
                lineHeight: '28px',
                letterSpacing: '-0.45px',
                color: '#101828',
              }}
            >
              Assign Recipients
            </h2>
            <p
              className="mt-1"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                color: '#4A5565',
              }}
            >
              {messageTitle}
            </p>
          </div>

          {/* Group rows */}
          <div className="flex flex-col gap-2 px-5 sm:px-6">
            {GROUPS.map((g) => {
              const selected = groups.includes(g)
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGroup(g)}
                  className="w-full flex items-center cursor-pointer"
                  style={{
                    minHeight: 42,
                    borderRadius: 10,
                    border: selected ? '1.1px solid #4F46E5' : '1.1px solid rgba(0,0,0,0.1)',
                    background: selected ? '#E0E7FF' : '#F4F4F4',
                    padding: '12px',
                    gap: 12,
                  }}
                >
                  <CheckBox checked={selected} />
                  <span
                    className="text-left flex-1 min-w-0"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: 14,
                      lineHeight: '14px',
                      color: selected ? '#4F46E5' : '#364153',
                    }}
                  >
                    {g}
                  </span>
                </button>
              )
            })}

            {/* Toggle individuals */}
            <button
              type="button"
              onClick={() => setShowIndividuals((s) => !s)}
              className="w-full flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50"
              style={{
                minHeight: 36,
                borderRadius: 8,
                border: '1.1px solid rgba(0,0,0,0.1)',
                background: '#EEF2FF',
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
              {showIndividuals ? 'Hide Individuals' : 'Select Individuals'}
            </button>

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
                    maxHeight: 160,
                    borderRadius: 10,
                    border: '1.1px solid rgba(0,0,0,0.1)',
                    background: '#F9FAFB',
                    padding: 8,
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#D1D5DC transparent',
                  }}
                >
                  {filtered.length === 0 ? (
                    <p
                      className="text-center py-4"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 13,
                        color: '#717182',
                      }}
                    >
                      {recipients.length === 0 ? 'No recipients yet.' : 'No matches.'}
                    </p>
                  ) : (
                    filtered.map((p) => {
                      const selected = individualIds.includes(p.id)
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
                            padding: 8,
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

          {/* Footer */}
          <div className="flex items-center gap-3 px-5 sm:px-6 py-5 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 flex items-center justify-center cursor-pointer hover:bg-gray-50"
              style={{
                minHeight: 36,
                borderRadius: 8,
                border: '1.25px solid rgba(0,0,0,0.1)',
                background: '#FFFFFF',
                padding: '8px 16px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                color: '#0A0A0A',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onSave?.(groups, individualIds)
                onClose()
              }}
              className="flex-1 flex items-center justify-center cursor-pointer hover:opacity-90"
              style={{
                minHeight: 36,
                borderRadius: 8,
                background: '#4F39F6',
                padding: '8px 16px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                color: '#FFFFFF',
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span
      className="flex items-center justify-center flex-shrink-0"
      style={{
        width: 16,
        height: 16,
        borderRadius: 4,
        background: checked ? '#4F46E5' : '#F9FAFB',
        border: checked ? '1.1px solid #4F46E5' : '1.1px solid rgba(0,0,0,0.1)',
        boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)',
      }}
    >
      {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
    </span>
  )
}

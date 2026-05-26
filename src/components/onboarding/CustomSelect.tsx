"use client"

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface CustomSelectProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder: string
}

export default function CustomSelect({ options, value, onChange, placeholder }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (option: string) => {
    onChange(option)
    setIsOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-sm focus:outline-none transition-all bg-white"
        style={{
          height: '48px',
          borderRadius: '12px',
          border: '1.25px solid #D1D5DC',
          padding: '0 16px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: '14px',
          lineHeight: '20px',
          letterSpacing: '-0.15px',
          color: value ? '#101828' : '#717182',
        }}
      >
        <span className="truncate">{value || placeholder}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-[#717182] flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#717182] flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 overflow-hidden"
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '1.25px solid #D1D5DC',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          }}
        >
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[#F3F4F6]"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '-0.15px',
                  color: '#374151',
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

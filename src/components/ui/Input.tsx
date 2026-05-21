'use client'

import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, disabled, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-[#64748B] uppercase tracking-wide mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={cn(
            'border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm w-full text-[#1E293B]',
            'focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-[#4338CA]',
            'placeholder:text-[#94A3B8]',
            error && 'border-[#DC2626] focus:ring-[#DC2626] focus:border-[#DC2626]',
            disabled && 'bg-[#F1F5F9] cursor-not-allowed opacity-60',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-[#DC2626]">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-xs text-[#64748B]">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input

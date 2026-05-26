'use client'

import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastProps {
  toast: ToastItem
  onDismiss: (id: string) => void
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-[#16A34A]',
    border: 'border-green-600',
  },
  error: {
    icon: XCircle,
    bg: 'bg-[#DC2626]',
    border: 'border-red-700',
  },
  info: {
    icon: Info,
    bg: 'bg-[#4338CA]',
    border: 'border-indigo-700',
  },
}

export default function Toast({ toast, onDismiss }: ToastProps) {
  const config = typeConfig[toast.type]
  const Icon = config.icon

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg text-white shadow-lg min-w-[280px] max-w-sm',
        'animate-toast-enter',
        config.bg
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

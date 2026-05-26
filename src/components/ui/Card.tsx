import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean
}

export default function Card({ className, padding = true, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm',
        padding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

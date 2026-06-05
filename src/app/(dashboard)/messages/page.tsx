'use client'

import { useEffect, useRef, useState } from 'react'
import {
  FileText,
  Mic,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
  Users,
  UserPlus,
  Video,
} from 'lucide-react'
import CreateMessageModal, { type EditableMessage } from '@/components/dashboard/CreateMessageModal'
import AssignRecipientsModal from '@/components/dashboard/AssignRecipientsModal'

type MessageKind = 'audio' | 'video' | 'written'

interface MessageItem {
  id: string
  title: string
  recipientGroup: string
  groups: string[]
  individualIds: string[]
  kind: MessageKind
  duration?: string
  excerpt?: string
  body?: string
  notes?: string
  createdAgo: string
}

const INITIAL_MESSAGES: MessageItem[] = [
  { id: 'm1', title: 'Message to My Kids', recipientGroup: 'Children', groups: ['All Family'], individualIds: [], kind: 'audio', duration: '2:34', createdAgo: '2 minutes ago' },
  { id: 'm2', title: "For My Daughter's Wedding", recipientGroup: 'Sarah C.', groups: [], individualIds: ['p1'], kind: 'video', duration: '3:34', createdAgo: '3 days ago' },
  { id: 'm3', title: 'Words of Wisdom', recipientGroup: 'All Family', groups: ['All Family'], individualIds: [], kind: 'written', excerpt: 'To my beloved family,', body: 'To my beloved family, I want you to know how much I love each of you...', createdAgo: '1 week ago' },
  { id: 'm4', title: "For My Daughter's Wedding", recipientGroup: 'Sarah C.', groups: [], individualIds: ['p1'], kind: 'video', duration: '3:34', createdAgo: '3 days ago' },
  { id: 'm5', title: 'Message to My Kids', recipientGroup: 'Children', groups: ['All Family'], individualIds: [], kind: 'audio', duration: '2:34', createdAgo: '2 minutes ago' },
  { id: 'm6', title: 'Words of Wisdom', recipientGroup: 'All Family', groups: ['All Family'], individualIds: [], kind: 'written', excerpt: 'To my beloved family,', body: 'To my beloved family,', createdAgo: '1 week ago' },
  { id: 'm7', title: 'Message to My Kids', recipientGroup: 'Children', groups: ['All Family'], individualIds: [], kind: 'audio', duration: '2:34', createdAgo: '2 minutes ago' },
  { id: 'm8', title: "For My Daughter's Wedding", recipientGroup: 'Sarah C.', groups: [], individualIds: ['p1'], kind: 'video', duration: '3:34', createdAgo: '3 days ago' },
  { id: 'm9', title: 'Message to My Kids', recipientGroup: 'Children', groups: ['All Family'], individualIds: [], kind: 'audio', duration: '2:34', createdAgo: '2 minutes ago' },
  { id: 'm10', title: 'Words of Wisdom', recipientGroup: 'All Family', groups: ['All Family'], individualIds: [], kind: 'written', excerpt: 'To my beloved family,', body: 'To my beloved family,', createdAgo: '1 week ago' },
]

const FILTERS: { key: 'all' | MessageKind; label: string; icon?: typeof Mic }[] = [
  { key: 'all', label: 'All' },
  { key: 'audio', label: 'Audio', icon: Mic },
  { key: 'video', label: 'Video', icon: Video },
  { key: 'written', label: 'Written', icon: FileText },
]

export default function MessagesPage() {
  const [items, setItems] = useState<MessageItem[]>(INITIAL_MESSAGES)
  const [filter, setFilter] = useState<'all' | MessageKind>('all')

  // Edit modal
  const [editing, setEditing] = useState<MessageItem | null>(null)
  const [creating, setCreating] = useState(false)

  // Assign modal
  const [assigning, setAssigning] = useState<MessageItem | null>(null)

  const visible = items.filter((m) => filter === 'all' || m.kind === filter)

  const handleDelete = (id: string) => setItems((prev) => prev.filter((m) => m.id !== id))

  const handleSaveEdit = (m: EditableMessage) => {
    if (!m.id) return
    setItems((prev) =>
      prev.map((it) =>
        it.id === m.id
          ? {
              ...it,
              title: m.title || it.title,
              kind: m.messageType === 'write' ? 'written' : m.messageType,
              body: m.body ?? it.body,
              notes: m.notes,
              groups: m.audience,
              individualIds: m.selectedIndividualId ? [m.selectedIndividualId] : it.individualIds,
            }
          : it,
      ),
    )
    setEditing(null)
  }

  const handleSaveAssign = (groups: string[], individualIds: string[]) => {
    if (!assigning) return
    setItems((prev) =>
      prev.map((it) =>
        it.id === assigning.id ? { ...it, groups, individualIds } : it,
      ),
    )
    setAssigning(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <h1
            style={{
              fontFamily: '"Instrument Serif", serif',
              fontWeight: 400,
              fontSize: 32,
              lineHeight: '36px',
              color: '#101828',
            }}
          >
            Messages
          </h1>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 16,
              lineHeight: '24px',
              letterSpacing: '-0.31px',
              color: '#4A5565',
            }}
          >
            Share your guidance and love for when it matters most
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90"
          style={{
            width: 150,
            height: 36,
            borderRadius: 8,
            background: '#4F46E5',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '-0.15px',
            color: '#FFFFFF',
          }}
        >
          <Plus className="w-4 h-4" strokeWidth={2.25} />
          New Messages
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const Icon = f.icon
          const active = filter === f.key
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className="flex items-center gap-1.5 cursor-pointer transition-colors"
              style={{
                minHeight: 36,
                borderRadius: 10,
                background: active ? '#4F39F6' : '#F3F4F6',
                padding: '0 16px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                color: active ? '#FFFFFF' : '#364153',
              }}
            >
              {Icon && (
                <Icon
                  className="w-4 h-4"
                  strokeWidth={2}
                  color={active ? '#FFFFFF' : '#364153'}
                />
              )}
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {visible.map((m) => (
          <MessageCard
            key={m.id}
            item={m}
            onEdit={() => setEditing(m)}
            onAssign={() => setAssigning(m)}
            onDelete={() => handleDelete(m.id)}
          />
        ))}
      </div>

      {/* Modals */}
      <CreateMessageModal
        open={creating}
        onClose={() => setCreating(false)}
        headerTitle="New Message"
        headerSubtitle="Create a new message to share with your loved ones"
      />
      <CreateMessageModal
        open={!!editing}
        onClose={() => setEditing(null)}
        headerTitle="Edit Message"
        headerSubtitle={editing?.title ?? ''}
        initialMessage={
          editing
            ? {
                id: editing.id,
                audience: editing.groups,
                selectedIndividualId: editing.individualIds[0],
                messageType:
                  editing.kind === 'written'
                    ? 'write'
                    : editing.kind === 'video'
                    ? 'video'
                    : 'audio',
                title: editing.title,
                notes: editing.notes ?? '',
                body: editing.body ?? '',
              }
            : undefined
        }
        onSave={handleSaveEdit}
      />
      <AssignRecipientsModal
        open={!!assigning}
        onClose={() => setAssigning(null)}
        messageTitle={assigning?.title ?? ''}
        initialGroups={assigning?.groups ?? []}
        initialIndividualIds={assigning?.individualIds ?? []}
        onSave={handleSaveAssign}
      />
    </div>
  )
}

/* ---------------------- Message card ---------------------- */

function MessageCard({
  item,
  onEdit,
  onAssign,
  onDelete,
}: {
  item: MessageItem
  onEdit: () => void
  onAssign: () => void
  onDelete: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [menuOpen])

  const Icon = item.kind === 'audio' ? Mic : item.kind === 'video' ? Video : FileText
  const typeLabel =
    item.kind === 'audio' ? 'Audio message' : item.kind === 'video' ? 'Video message' : 'Written message'

  return (
    <div
      className="relative flex items-start gap-4"
      style={{
        borderRadius: 14,
        border: '1.25px solid rgba(0,0,0,0.1)',
        background: '#FFFFFF',
        padding: 16,
      }}
    >
      {/* Icon tile */}
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 80,
          height: 80,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #E0E7FF 0%, #C6D2FF 100%)',
        }}
      >
        <Icon className="w-8 h-8" color="#4F39F6" strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <h3
          className="truncate pr-10"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: 18,
            lineHeight: '28px',
            letterSpacing: '-0.44px',
            color: '#101828',
          }}
        >
          {item.title}
        </h3>
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-1"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '-0.15px',
            color: '#4A5565',
          }}
        >
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#4A5565]" strokeWidth={2} />
            {item.recipientGroup}
          </span>
          <span aria-hidden>•</span>
          <span>{typeLabel}</span>
          {item.duration && (
            <>
              <span aria-hidden>•</span>
              <span>{item.duration}</span>
            </>
          )}
          {item.excerpt && (
            <>
              <span aria-hidden>•</span>
              <span className="truncate max-w-[200px]">{item.excerpt}</span>
            </>
          )}
        </div>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 12,
            lineHeight: '16px',
            color: '#6A7282',
          }}
        >
          Created {item.createdAgo}
        </p>
      </div>

      {/* Menu trigger */}
      <div ref={menuRef} className="absolute top-3 right-3">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Open actions"
          className="flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
          }}
        >
          <MoreVertical className="w-5 h-5 text-[#364153]" strokeWidth={2} />
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 mt-1 flex flex-col z-10"
            style={{
              width: 192,
              borderRadius: 10,
              border: '1.25px solid #E5E7EB',
              background: '#FFFFFF',
              padding: 5,
              boxShadow:
                '0px 4px 6px -4px rgba(0,0,0,0.1), 0px 10px 15px -3px rgba(0,0,0,0.1)',
            }}
          >
            <MenuItem
              icon={<Pencil className="w-4 h-4 text-[#364153]" strokeWidth={2} />}
              label="Edit message"
              onClick={() => {
                setMenuOpen(false)
                onEdit()
              }}
            />
            <MenuItem
              icon={<UserPlus className="w-4 h-4 text-[#364153]" strokeWidth={2} />}
              label="Assign recipients"
              onClick={() => {
                setMenuOpen(false)
                onAssign()
              }}
            />
            <MenuItem
              icon={<Trash2 className="w-4 h-4 text-[#E7000B]" strokeWidth={2} />}
              label="Delete message"
              danger
              onClick={() => {
                setMenuOpen(false)
                onDelete()
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function MenuItem({
  icon,
  label,
  danger,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  danger?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-md"
      style={{
        padding: '8px 10px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: 14,
        lineHeight: '20px',
        letterSpacing: '-0.15px',
        color: danger ? '#E7000B' : '#364153',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

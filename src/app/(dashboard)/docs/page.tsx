'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Briefcase,
  Clipboard,
  DollarSign,
  Download,
  File as FileIcon,
  FileText,
  Folder,
  Globe,
  Grid3x3,
  Home as HomeIcon,
  Info,
  List,
  Lock,
  Mic,
  MoreHorizontal,
  MoreVertical,
  Pencil,
  Plus,
  Scale,
  Shield,
  Trash2,
  Video,
} from 'lucide-react'
import AddPhotosModal from '@/components/dashboard/AddPhotosModal'

/* ---------------------- Types ---------------------- */

type FileKind = 'document' | 'audio' | 'video' | 'other'
type CategoryKey = 'legal' | 'financial' | 'insurance' | 'property' | 'digital' | 'other'

interface DocItem {
  id: string
  title: string
  kind: FileKind
  category: CategoryKey
  /** Sub-label shown beside the size, e.g. "Legal", "Personal", "Financial" */
  subLabel: string
  size: string
  uploadedAgo: string
  recipients: number
}

/* ---------------------- Static data ---------------------- */

const CATEGORIES: {
  key: CategoryKey
  label: string
  icon: typeof Scale
  bg: string
  color: string
  count: number
  totalDenom?: number
}[] = [
  { key: 'legal',     label: 'Legal',     icon: Scale,     bg: '#D0FAE5', color: '#009966', count: 4 },
  { key: 'financial', label: 'Financial', icon: DollarSign,bg: '#E0E7FF', color: '#4F39F6', count: 4 },
  { key: 'insurance', label: 'Insurance', icon: Shield,    bg: '#FEF9C2', color: '#D08700', count: 4 },
  { key: 'property',  label: 'Property',  icon: HomeIcon,  bg: '#FFEDD4', color: '#F54900', count: 5 },
  { key: 'digital',   label: 'Digital',   icon: Globe,     bg: '#DBEAFE', color: '#155DFC', count: 5 },
  { key: 'other',     label: 'Other',     icon: Clipboard, bg: '#F3E8FF', color: '#9810FA', count: 4, totalDenom: 5 },
]

const CATEGORY_MAP: Record<CategoryKey, { bg: string; color: string; label: string; icon: typeof Scale }> = {
  legal:     { bg: '#D0FAE5', color: '#009966', label: 'Legal',     icon: Scale },
  financial: { bg: '#E0E7FF', color: '#4F39F6', label: 'Financial', icon: DollarSign },
  insurance: { bg: '#FEF9C2', color: '#D08700', label: 'Insurance', icon: Shield },
  property:  { bg: '#FFEDD4', color: '#F54900', label: 'Property',  icon: HomeIcon },
  digital:   { bg: '#DBEAFE', color: '#155DFC', label: 'Digital',   icon: Globe },
  other:     { bg: '#F3E8FF', color: '#9810FA', label: 'Other',     icon: Clipboard },
}

const INITIAL_FILES: DocItem[] = [
  { id: 'f1', title: 'Insurance Policy',   kind: 'document', category: 'legal',     subLabel: 'Legal',     size: '2.4 MB',  uploadedAgo: '5 minutes ago',  recipients: 1 },
  { id: 'f2', title: 'ID Documents',       kind: 'document', category: 'insurance', subLabel: 'Personal',  size: '1.2 MB',  uploadedAgo: '8 minutes ago',  recipients: 6 },
  { id: 'f3', title: 'Will & Testament',   kind: 'document', category: 'other',     subLabel: 'Legal',     size: '3.1 MB',  uploadedAgo: '10 minutes ago', recipients: 7 },
  { id: 'f4', title: 'Bank Statements',    kind: 'document', category: 'financial', subLabel: 'Financial', size: '4.5 MB',  uploadedAgo: '15 minutes ago', recipients: 2 },
  { id: 'f5', title: 'Message to My Kids', kind: 'audio',    category: 'legal',     subLabel: 'Personal',  size: '12.3 MB', uploadedAgo: '2 hours ago',    recipients: 3 },
  { id: 'f6', title: 'Family Stories',     kind: 'audio',    category: 'legal',     subLabel: 'Personal',  size: '8.7 MB',  uploadedAgo: '1 day ago',      recipients: 10 },
  { id: 'f7', title: 'Family Memories',    kind: 'video',    category: 'legal',     subLabel: 'Personal',  size: '24.6 MB', uploadedAgo: '3 days ago',     recipients: 8 },
  { id: 'f8', title: 'Wedding Wishes',     kind: 'video',    category: 'legal',     subLabel: 'Personal',  size: '18.2 MB', uploadedAgo: '1 week ago',     recipients: 5 },
  { id: 'f9', title: 'Personal Notes',     kind: 'other',    category: 'other',     subLabel: 'Personal',  size: '0.8 MB',  uploadedAgo: '2 weeks ago',    recipients: 4 },
]

type FilterKey = 'all' | 'document' | 'audio' | 'video' | 'other'

const FILTER_DEFS: { key: FilterKey; label: string; icon: typeof FileText }[] = [
  { key: 'all',      label: 'All Files',   icon: Folder   },
  { key: 'document', label: 'Documents',   icon: FileText },
  { key: 'audio',    label: 'Audio Files', icon: Mic      },
  { key: 'video',    label: 'Video Files', icon: Video    },
  { key: 'other',    label: 'Other',       icon: FileIcon },
]

/* ---------------------- Page ---------------------- */

export default function DocsPage() {
  const [items, setItems] = useState<DocItem[]>(INITIAL_FILES)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [layout, setLayout] = useState<'list' | 'grid'>('list')

  // Modals
  const [uploading, setUploading] = useState(false)
  const [editing, setEditing] = useState<DocItem | null>(null)

  const visible = items.filter((it) => filter === 'all' || it.kind === filter)

  const handleDelete = (id: string) => setItems((prev) => prev.filter((m) => m.id !== id))

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col" style={{ gap: 3.98 }}>
          <h1
            style={{
              fontFamily: '"Instrument Serif", serif',
              fontWeight: 400,
              fontSize: 32,
              lineHeight: '28px',
              color: '#101828',
            }}
          >
            Docs &amp; Files
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
            Your important documents, secure and organized
          </p>
        </div>

        {/* Layout switch + Upload button */}
        <div className="flex items-center" style={{ gap: 11.99 }}>
          {/* Segmented control */}
          <div
            className="flex items-center"
            style={{
              width: 79.96,
              height: 39.96,
              borderRadius: 10,
              background: '#F3F4F6',
              padding: '3.98px 3.98px 4px 3.98px',
            }}
          >
            <button
              type="button"
              onClick={() => setLayout('list')}
              aria-label="List view"
              className="flex items-center justify-center cursor-pointer"
              style={{
                width: 35.996,
                height: 31.992,
                borderRadius: 8,
                padding: '0 10px',
                background: layout === 'list' ? '#FFFFFF' : 'transparent',
                boxShadow:
                  layout === 'list'
                    ? '0px 1px 2px -1px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.1)'
                    : 'none',
              }}
            >
              <List className="w-4 h-4 text-[#364153]" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => setLayout('grid')}
              aria-label="Grid view"
              className="flex items-center justify-center cursor-pointer"
              style={{
                width: 35.996,
                height: 31.992,
                borderRadius: 8,
                padding: '0 10px',
                background: layout === 'grid' ? '#FFFFFF' : 'transparent',
                boxShadow:
                  layout === 'grid'
                    ? '0px 1px 2px -1px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.1)'
                    : 'none',
              }}
            >
              <Grid3x3 className="w-4 h-4 text-[#364153]" strokeWidth={2} />
            </button>
          </div>

          {/* Upload Files button */}
          <button
            type="button"
            onClick={() => setUploading(true)}
            className="flex items-center justify-center cursor-pointer hover:opacity-90"
            style={{
              width: 137.13,
              height: 35.996,
              borderRadius: 8,
              background: '#4F46E5',
              gap: 5,
              padding: '8.24px 17.57px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#FFFFFF',
            }}
          >
            <Plus className="w-4 h-4" color="#FFFFFF" strokeWidth={2.25} />
            Upload Files
          </button>
        </div>
      </div>

      {/* Legacy Readiness card */}
      <div
        className="flex flex-col"
        style={{
          borderRadius: 14,
          background: '#FFFFFF',
          border: '1.25px solid rgba(0,0,0,0.1)',
          padding: '23.98px 24px 23.98px 23.98px',
          gap: 30,
        }}
      >
        <div className="flex items-center" style={{ gap: 7 }}>
          <h3
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 18,
              lineHeight: '28px',
              letterSpacing: '-0.44px',
              color: '#101828',
            }}
          >
            Legacy Readiness
          </h3>
          <Info className="w-5 h-5" color="#99A1AF" strokeWidth={2} />
        </div>

        <div
          className="grid"
          style={{
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          }}
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            return (
              <div
                key={cat.key}
                className="flex flex-col"
                style={{
                  borderRadius: 14,
                  background: '#FFFFFF',
                  border: '1.25px solid rgba(0,0,0,0.1)',
                  padding: '23.98px 24px 23.98px 23.98px',
                  gap: 16,
                  minHeight: 226,
                }}
              >
                {/* Top: icon + info */}
                <div className="flex items-start justify-between">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 10,
                      background: cat.bg,
                    }}
                  >
                    <Icon className="w-7 h-7" color={cat.color} strokeWidth={2} />
                  </div>
                  <Info className="w-4 h-4" color="#99A1AF" strokeWidth={2} />
                </div>

                {/* Label + sublabel */}
                <div className="flex flex-col">
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: 18,
                      lineHeight: '27px',
                      letterSpacing: '-0.44px',
                      color: '#101828',
                    }}
                  >
                    {cat.label}
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: 14,
                      lineHeight: '20px',
                      letterSpacing: '-0.15px',
                      color: '#4A5565',
                    }}
                  >
                    Documents
                  </p>
                </div>

                {/* Count */}
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    fontSize: 30,
                    lineHeight: '36px',
                    letterSpacing: '0.4px',
                    color: cat.color,
                  }}
                >
                  {cat.count}
                  {cat.totalDenom && (
                    <span style={{ color: '#99A1AF', fontSize: 18 }}> / {cat.totalDenom}</span>
                  )}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filter chips — equal-width columns filling the full row, responsive wrap on narrow screens */}
      <div
        className="grid"
        style={{
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        }}
      >
        {FILTER_DEFS.map((f) => {
          const Icon = f.icon
          const active = filter === f.key
          const count =
            f.key === 'all' ? items.length : items.filter((it) => it.kind === f.key).length
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className="flex flex-col items-center justify-center cursor-pointer transition-colors"
              style={{
                height: 102,
                borderRadius: 14,
                padding: 16,
                gap: 8,
                background: active ? '#EEF2FF' : '#FFFFFF',
                border: active
                  ? '1.25px solid #4F46E5'
                  : '1.25px solid rgba(0,0,0,0.1)',
              }}
            >
              <Icon
                style={{ width: 24, height: 24, flexShrink: 0 }}
                color={active ? '#4F46E5' : '#4A5565'}
                strokeWidth={2}
              />
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '20px',
                  letterSpacing: '-0.15px',
                  textAlign: 'center',
                  color: '#101828',
                }}
              >
                {f.label}
              </p>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 12,
                  lineHeight: '16px',
                  textAlign: 'center',
                  color: '#4A5565',
                }}
              >
                {count} files
              </p>
            </button>
          )
        })}
      </div>

      {/* Content area: list OR grid */}
      {layout === 'list' ? (
        <div
          className="flex flex-col"
          style={{
            borderRadius: 14,
            background: '#FFFFFF',
            border: '1.25px solid rgba(0,0,0,0.1)',
          }}
        >
          {visible.map((item, idx) => (
            <DocRow
              key={item.id}
              item={item}
              isLast={idx === visible.length - 1}
              onEdit={() => setEditing(item)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      ) : (
        <div
          className="grid"
          style={{
            gap: 15,
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          }}
        >
          {visible.map((item) => (
            <DocCard
              key={item.id}
              item={item}
              onEdit={() => setEditing(item)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      )}

      {/* Modals — re-use existing AddPhotosModal */}
      <AddPhotosModal
        open={uploading}
        onClose={() => setUploading(false)}
        title="Upload Document"
        subtitle="Add a new document to your secure vault"
      />
      <AddPhotosModal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit Document"
        subtitle={editing?.title ?? ''}
      />
    </div>
  )
}

/* ---------------------- List row ---------------------- */

function DocRow({
  item,
  isLast,
  onEdit,
  onDelete,
}: {
  item: DocItem
  isLast: boolean
  onEdit: () => void
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

  const cat = CATEGORY_MAP[item.category]
  const KindIcon =
    item.kind === 'audio' ? Mic : item.kind === 'video' ? Video : item.kind === 'other' ? FileIcon : FileText

  return (
    <div
      className="flex flex-wrap items-center"
      style={{
        padding: '16px 16px 16px 16px',
        gap: 16,
        borderBottom: isLast ? 'none' : '1.25px solid rgba(0,0,0,0.1)',
      }}
    >
      {/* Left icon tile — never shrinks */}
      <div
        className="flex items-center justify-center"
        style={{
          width: 47.99,
          height: 47.99,
          borderRadius: 10,
          background: '#E0E7FF',
          flexShrink: 0,
        }}
      >
        <KindIcon style={{ width: 16, height: 16, flexShrink: 0 }} color="#4F46E5" strokeWidth={2} />
      </div>

      {/* Middle content — wraps; no truncation */}
      <div className="flex flex-col gap-1" style={{ flex: '1 1 200px', minWidth: 0 }}>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 16,
              lineHeight: '24px',
              letterSpacing: '-0.31px',
              color: '#101828',
              wordBreak: 'break-word',
            }}
          >
            {item.title}
          </span>
          <CategoryBadge category={item.category} />
        </div>
        <div
          className="flex items-center flex-wrap"
          style={{
            gap: 8,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '-0.15px',
            color: '#4A5565',
          }}
        >
          <span>{cat.label}</span>
          <span aria-hidden>•</span>
          <span>{item.size}</span>
          <span aria-hidden>•</span>
          <span>Uploaded {item.uploadedAgo}</span>
        </div>
      </div>

      {/* Right block (Recipients + View + menu) — wraps as a unit on mobile */}
      <div
        className="flex items-center justify-between sm:justify-end flex-wrap"
        style={{ gap: 12, flexShrink: 0, marginLeft: 'auto' }}
      >
        {/* Recipients */}
        <div className="flex items-center" style={{ gap: 7.99, flexShrink: 0 }}>
          <Lock style={{ width: 16, height: 16, flexShrink: 0 }} color="#4A5565" strokeWidth={2} />
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 14,
              lineHeight: '15.2px',
              color: '#4A5565',
              whiteSpace: 'nowrap',
            }}
          >
            {item.recipients} Recipients
          </span>
        </div>

        {/* View + menu */}
        <div className="flex items-center" style={{ gap: 8, flexShrink: 0 }}>
          <button
            type="button"
            className="flex items-center justify-center cursor-pointer hover:bg-gray-50"
            style={{
              height: 31.99,
              padding: '0 12px',
              borderRadius: 8,
              border: '1.25px solid rgba(0,0,0,0.1)',
              background: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#101828',
              flexShrink: 0,
            }}
          >
            View
          </button>

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Open actions"
              className="flex items-center justify-center cursor-pointer hover:bg-gray-100"
              style={{
                width: 35.99,
                height: 31.99,
                borderRadius: 8,
                padding: '0 10px',
                flexShrink: 0,
              }}
            >
              <MoreHorizontal style={{ width: 16, height: 16, flexShrink: 0 }} color="#0A0A0A" strokeWidth={2} />
            </button>

            {menuOpen && <ActionMenu onEdit={() => { setMenuOpen(false); onEdit() }} onDelete={() => { setMenuOpen(false); onDelete() }} />}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------- Grid card ---------------------- */

function DocCard({
  item,
  onEdit,
  onDelete,
}: {
  item: DocItem
  onEdit: () => void
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

  const KindIcon =
    item.kind === 'audio' ? Mic : item.kind === 'video' ? Video : item.kind === 'other' ? FileIcon : FileText

  return (
    <div
      className="relative flex flex-col"
      style={{
        borderRadius: 13.3,
        background: '#FFFFFF',
        border: '1.19px solid rgba(0,0,0,0.1)',
        padding: 15.2,
        gap: 11.39,
        minHeight: 335,
      }}
    >
      {/* Big icon tile */}
      <div
        className="flex items-center justify-center"
        style={{
          height: 215,
          borderRadius: 9.5,
          background: 'linear-gradient(135deg, #E0E7FF 0%, #C6D2FF 100%)',
        }}
      >
        <KindIcon className="w-12 h-12" color="#4F39F6" strokeWidth={1.75} />
      </div>

      {/* Title + badge */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 16,
            lineHeight: '22.8px',
            letterSpacing: '-0.3px',
            color: '#101828',
            wordBreak: 'break-word',
            flex: '1 1 auto',
            minWidth: 0,
          }}
        >
          {item.title}
        </p>
        <CategoryBadge category={item.category} />
      </div>

      {/* Size */}
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: 12,
          lineHeight: '15.2px',
          color: '#4A5565',
        }}
      >
        {item.size}
      </p>

      {/* Recipients */}
      <div className="flex items-center" style={{ gap: 7.99 }}>
        <Lock className="w-3 h-3" color="#4A5565" strokeWidth={2} />
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 14,
            lineHeight: '15.2px',
            color: '#4A5565',
          }}
        >
          {item.recipients} Recipients
        </span>
      </div>

      {/* Menu trigger */}
      <div ref={menuRef} className="absolute top-3 right-3">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Open actions"
          className="flex items-center justify-center cursor-pointer hover:bg-white/60 backdrop-blur-sm"
          style={{ width: 32, height: 32, borderRadius: 8 }}
        >
          <MoreVertical className="w-4 h-4" color="#0A0A0A" strokeWidth={2} />
        </button>
        {menuOpen && <ActionMenu onEdit={() => { setMenuOpen(false); onEdit() }} onDelete={() => { setMenuOpen(false); onDelete() }} />}
      </div>
    </div>
  )
}

/* ---------------------- Category badge ---------------------- */

function CategoryBadge({ category }: { category: CategoryKey }) {
  const cat = CATEGORY_MAP[category]
  const Icon = cat.icon
  return (
    <span
      className="inline-flex items-center"
      style={{
        height: 22,
        borderRadius: 4,
        padding: '1px 12px',
        gap: 4,
        background: cat.bg,
        color: cat.color,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: 10,
        lineHeight: '20px',
        letterSpacing: '-0.15px',
      }}
    >
      <Icon className="w-2 h-2" color={cat.color} strokeWidth={2.5} />
      {cat.label}
    </span>
  )
}

/* ---------------------- Action dropdown ---------------------- */

function ActionMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div
      className="absolute right-0 mt-1 flex flex-col z-20"
      style={{
        width: 185,
        borderRadius: 10,
        border: '1px solid #E5E7EB',
        background: '#FFFFFF',
        padding: 8,
        gap: 6,
        boxShadow:
          '0px 4px 6px 0px rgba(0,0,0,0.05), 0px 10px 15px -3px rgba(0,0,0,0.1)',
      }}
    >
      <MenuRow
        icon={<Pencil className="w-[18px] h-[18px]" color="#000000" strokeWidth={2} />}
        label="Edit"
        color="#101828"
        onClick={onEdit}
      />
      <MenuRow
        icon={<Download className="w-[18px] h-[18px]" color="#4A5565" strokeWidth={2} />}
        label="Download"
        color="#4A5565"
        onClick={() => {}}
      />
      <MenuRow
        icon={<Trash2 className="w-[18px] h-[18px]" color="#C70036" strokeWidth={2} />}
        label="Delete"
        color="#C70036"
        onClick={onDelete}
      />
    </div>
  )
}

function MenuRow({
  icon,
  label,
  color,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  color: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 cursor-pointer rounded-md hover:bg-[#F3F4F6] transition-colors"
      style={{
        padding: '6px 8px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: 14,
        lineHeight: '14px',
        color,
      }}
    >
      {icon}
      {label}
    </button>
  )
}

/* Briefcase is imported only so the bundler keeps the path stable; not used directly. */
void Briefcase

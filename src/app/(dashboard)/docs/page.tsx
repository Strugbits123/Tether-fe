'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Briefcase,
  Check,
  ChevronDown,
  ChevronUp,
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
  Loader2,
  Lock,
  Mic,
  MoreHorizontal,
  MoreVertical,
  Pencil,
  Plus,
  Scale,
  Search,
  Shield,
  Trash2,
  Upload,
  Users,
  Video,
  X,
} from 'lucide-react'
import AddPhotosModal from '@/components/dashboard/AddPhotosModal'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/context/ToastContext'
import {
  getDocuments,
  getDocumentStats,
  getDocument,
  updateDocument,
  deleteDocument,
  getDocDownloadUrl,
  type Document as ApiDocument,
  type DocumentStats,
  type DocumentDetail,
} from '@/lib/api/documents'
import { formatFileSize, buildAssignments } from '@/lib/utils/assignments'
import { getRecipients, type Recipient } from '@/lib/api/recipients'

/* ---------------------- Types ---------------------- */

type FileKind = 'document' | 'audio' | 'video' | 'other'
type FilterKey = 'all' | 'document' | 'audio' | 'video' | 'other'
type ApiDoc = ApiDocument & { assignmentCount: number }

/* ---------------------- Static data ---------------------- */

const CATEGORIES: {
  key: string
  label: string
  icon: typeof Scale
  bg: string
  color: string
  totalDenom?: number
  apiKey: string
}[] = [
  { key: 'legal',     label: 'Legal',     icon: Scale,      bg: '#D0FAE5', color: '#009966', apiKey: 'legal' },
  { key: 'financial', label: 'Financial', icon: DollarSign, bg: '#E0E7FF', color: '#4F39F6', apiKey: 'financial' },
  { key: 'insurance', label: 'Insurance', icon: Shield,     bg: '#FEF9C2', color: '#D08700', apiKey: 'insurance' },
  { key: 'property',  label: 'Property',  icon: HomeIcon,   bg: '#FFEDD4', color: '#F54900', apiKey: 'property' },
  { key: 'digital',   label: 'Digital',   icon: Globe,      bg: '#DBEAFE', color: '#155DFC', apiKey: 'digital_accounts' },
  { key: 'other',     label: 'Other',     icon: Clipboard,  bg: '#F3E8FF', color: '#9810FA', apiKey: 'other', totalDenom: 5 },
]

const FULL_CATEGORY_MAP: Record<string, { bg: string; color: string; label: string; icon: typeof Scale }> = {
  legal:            { bg: '#D0FAE5', color: '#009966', label: 'Legal',     icon: Scale },
  financial:        { bg: '#E0E7FF', color: '#4F39F6', label: 'Financial', icon: DollarSign },
  insurance:        { bg: '#FEF9C2', color: '#D08700', label: 'Insurance', icon: Shield },
  property:         { bg: '#FFEDD4', color: '#F54900', label: 'Property',  icon: HomeIcon },
  digital:          { bg: '#DBEAFE', color: '#155DFC', label: 'Digital',   icon: Globe },
  digital_accounts: { bg: '#DBEAFE', color: '#155DFC', label: 'Digital',   icon: Globe },
  other:            { bg: '#F3E8FF', color: '#9810FA', label: 'Other',     icon: Clipboard },
  medical:          { bg: '#E0E7FF', color: '#3730A3', label: 'Medical',   icon: Shield },
  personal:         { bg: '#F3E8FF', color: '#6B21A8', label: 'Personal',  icon: Clipboard },
  military:         { bg: '#D1FAE5', color: '#065F46', label: 'Military',  icon: Briefcase },
}

const FILTER_DEFS: {
  key: FilterKey
  label: string
  icon: typeof FileText
  statsKey: keyof DocumentStats['fileTypes']
}[] = [
  { key: 'all',      label: 'All Files',   icon: Folder,   statsKey: 'total' },
  { key: 'document', label: 'Documents',   icon: FileText, statsKey: 'documents' },
  { key: 'audio',    label: 'Audio Files', icon: Mic,      statsKey: 'audio' },
  { key: 'video',    label: 'Video Files', icon: Video,    statsKey: 'video' },
  { key: 'other',    label: 'Other',       icon: FileIcon, statsKey: 'other' },
]

const FILTER_TO_API: Record<FilterKey, string | undefined> = {
  all: undefined,
  document: 'documents',
  audio: 'audio',
  video: 'video',
  other: 'other',
}

const GROUP_OPTIONS = [
  'Assign Later',
  'All Recipients',
  'All Family',
  'All Friends',
  'All Others',
  'Release Manager',
]

const DOC_CATEGORIES = [
  { value: 'legal', label: 'Legal' },
  { value: 'financial', label: 'Financial' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'property', label: 'Property' },
  { value: 'digital_accounts', label: 'Digital' },
  { value: 'other', label: 'Other' },
]

/* ---------------------- Helpers ---------------------- */

async function getToken(): Promise<string | null> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

function fileTypeToKind(fileType: string): FileKind {
  if (['pdf', 'docx', 'doc'].includes(fileType)) return 'document'
  if (['mp3', 'wav', 'aac', 'm4a', 'ogg', 'flac'].includes(fileType)) return 'audio'
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(fileType)) return 'video'
  return 'other'
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function getCategoryMeta(category: string) {
  return FULL_CATEGORY_MAP[category] ?? FULL_CATEGORY_MAP.other
}

function assignmentsToSelections(assignments: DocumentDetail['assignments']): {
  groups: string[]
  individuals: string[]
} {
  const groups: string[] = []
  const individuals: string[] = []
  const SCOPE_TO_GROUP: Record<string, string> = {
    assign_later: 'Assign Later',
    all: 'All Recipients',
    release_manager: 'Release Manager',
  }
  for (const a of assignments) {
    if (SCOPE_TO_GROUP[a.assignment_scope]) {
      groups.push(SCOPE_TO_GROUP[a.assignment_scope])
    } else if (a.assignment_scope === 'group') {
      if (a.group_value === 'family') groups.push('All Family')
      else if (a.group_value === 'friends') groups.push('All Friends')
      else if (a.group_value === 'others') groups.push('All Others')
    } else if (a.assignment_scope === 'individual' && a.recipient_id) {
      individuals.push(a.recipient_id)
    }
  }
  return { groups, individuals }
}

/* ---------------------- Page ---------------------- */

export default function DocsPage() {
  const { showToast } = useToast()
  const [documents, setDocuments] = useState<ApiDoc[]>([])
  const [stats, setStats] = useState<DocumentStats | null>(null)
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined)
  const [layout, setLayout] = useState<'list' | 'grid'>('list')

  // Modals
  const [uploading, setUploading] = useState(false)
  const [viewingDoc, setViewingDoc] = useState<DocumentDetail | null>(null)
  const [editingDoc, setEditingDoc] = useState<DocumentDetail | null>(null)

  const loadStats = async () => {
    const token = await getToken()
    if (!token) return
    try {
      const data = await getDocumentStats(token)
      setStats(data)
    } catch { /* non-critical */ }
  }

  const loadDocuments = async () => {
    const token = await getToken()
    if (!token) return
    setLoadingDocs(true)
    try {
      const data = await getDocuments(token, categoryFilter, FILTER_TO_API[filter])
      setDocuments(data)
    } catch {
      showToast('Failed to load documents', 'error')
    } finally {
      setLoadingDocs(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadStats() }, [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadDocuments() }, [categoryFilter, filter])

  const handleCategoryClick = (apiKey: string) => {
    setCategoryFilter(prev => prev === apiKey ? undefined : apiKey)
  }

  const handleViewDocument = async (docId: string) => {
    const token = await getToken()
    if (!token) return
    try {
      const detail = await getDocument(token, docId)
      setViewingDoc(detail)
    } catch {
      showToast('Failed to load document', 'error')
    }
  }

  const handleDownload = async (docId: string) => {
    const token = await getToken()
    if (!token) return
    try {
      const { downloadUrl, filename } = await getDocDownloadUrl(token, docId)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      showToast('Download failed', 'error')
    }
  }

  const handleDeleteDocument = async (docId: string) => {
    const token = await getToken()
    if (!token) return
    try {
      await deleteDocument(token, docId)
      showToast('Document deleted', 'success')
      loadDocuments()
      loadStats()
    } catch {
      showToast('Failed to delete document', 'error')
    }
  }

  const handleOpenEdit = async (doc: ApiDoc) => {
    const token = await getToken()
    if (!token) return
    try {
      const detail = await getDocument(token, doc.id)
      setEditingDoc(detail)
    } catch {
      showToast('Failed to load document', 'error')
    }
  }

  const handleRefresh = () => {
    loadDocuments()
    loadStats()
  }

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
            const count = stats?.categories[cat.apiKey] ?? 0
            const isActive = categoryFilter === cat.apiKey
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => handleCategoryClick(cat.apiKey)}
                className="flex flex-col text-left cursor-pointer hover:opacity-90 transition-opacity"
                style={{
                  borderRadius: 14,
                  background: '#FFFFFF',
                  border: isActive ? `1.25px solid ${cat.color}` : '1.25px solid rgba(0,0,0,0.1)',
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
                  {count}
                  {cat.totalDenom && (
                    <span style={{ color: '#99A1AF', fontSize: 18 }}> / {cat.totalDenom}</span>
                  )}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Filter chips */}
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
          const count = stats?.fileTypes[f.statsKey] ?? 0
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
      {loadingDocs ? (
        <DocLoadingSkeleton />
      ) : documents.length === 0 ? (
        <DocEmptyState
          hasFilters={filter !== 'all' || !!categoryFilter}
          onClearFilters={() => { setFilter('all'); setCategoryFilter(undefined) }}
          onUpload={() => setUploading(true)}
        />
      ) : layout === 'list' ? (
        <div
          className="flex flex-col"
          style={{
            borderRadius: 14,
            background: '#FFFFFF',
            border: '1.25px solid rgba(0,0,0,0.1)',
          }}
        >
          {documents.map((doc, idx) => (
            <DocRow
              key={doc.id}
              doc={doc}
              isLast={idx === documents.length - 1}
              onView={() => handleViewDocument(doc.id)}
              onEdit={() => handleOpenEdit(doc)}
              onDownload={() => handleDownload(doc.id)}
              onDelete={() => handleDeleteDocument(doc.id)}
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
          {documents.map((doc) => (
            <DocCard
              key={doc.id}
              doc={doc}
              onEdit={() => handleOpenEdit(doc)}
              onDownload={() => handleDownload(doc.id)}
              onDelete={() => handleDeleteDocument(doc.id)}
            />
          ))}
        </div>
      )}

      {/* Upload modal */}
      <AddPhotosModal
        open={uploading}
        onClose={() => setUploading(false)}
        onCreated={handleRefresh}
        kind="document"
        title="Upload Document"
        subtitle="Add a new document to your secure vault"
      />

      {/* Document view modal */}
      {viewingDoc && (
        <DocumentViewModal
          doc={viewingDoc}
          onClose={() => setViewingDoc(null)}
          onDownload={() => handleDownload(viewingDoc.id)}
          onEditRecipients={() => {
            setEditingDoc(viewingDoc)
            setViewingDoc(null)
          }}
        />
      )}

      {/* Edit document modal */}
      {editingDoc && (
        <EditDocumentModal
          doc={editingDoc}
          onClose={() => setEditingDoc(null)}
          onUpdated={handleRefresh}
        />
      )}
    </div>
  )
}

/* ---------------------- Document view modal ---------------------- */

function DocumentViewModal({
  doc,
  onClose,
  onDownload,
  onEditRecipients,
}: {
  doc: DocumentDetail
  onClose: () => void
  onDownload: () => void
  onEditRecipients: () => void
}) {
  const kind = fileTypeToKind(doc.file_type)
  const KindIcon =
    kind === 'audio' ? Mic : kind === 'video' ? Video : kind === 'other' ? FileIcon : FileText
  const cat = getCategoryMeta(doc.category)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const Cell = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex flex-col" style={{ gap: 4 }}>
      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, lineHeight: '18px', color: '#4A5565' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 15, lineHeight: '22px', color: '#101828' }}>
        {children}
      </span>
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="flex min-h-full items-center justify-center px-2 sm:px-4 py-4 sm:py-10"
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <div
          className="relative bg-white w-full"
          style={{
            maxWidth: 560,
            borderRadius: 14,
            boxShadow: '0px 8px 10px -6px rgba(0,0,0,0.1), 0px 20px 25px -5px rgba(0,0,0,0.1)',
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

          <div className="flex flex-col px-6 sm:px-8 pt-6 sm:pt-8 pb-6 sm:pb-8" style={{ gap: 28 }}>
            {/* Header */}
            <div className="flex items-center pr-8" style={{ gap: 16 }}>
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{ width: 56, height: 56, borderRadius: 12, background: '#E0E7FF' }}
              >
                <KindIcon className="w-7 h-7" color="#4F46E5" strokeWidth={1.75} />
              </div>
              <div className="flex flex-col min-w-0" style={{ gap: 2 }}>
                <h2
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: 22,
                    lineHeight: '28px',
                    color: '#101828',
                    wordBreak: 'break-word',
                  }}
                >
                  {doc.title}
                </h2>
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 15,
                    lineHeight: '22px',
                    color: '#6A7282',
                  }}
                >
                  {cat.label}
                </span>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2" style={{ rowGap: 24, columnGap: 16 }}>
              <Cell label="File Size">{formatFileSize(doc.file_size_bytes)}</Cell>
              <Cell label="Uploaded">{formatTimeAgo(doc.created_at)}</Cell>
              <Cell label="File Type">{doc.file_type.toUpperCase()}</Cell>
              <Cell label="Category">{cat.label}</Cell>
              <Cell label="Access">
                <span className="flex items-center" style={{ gap: 6 }}>
                  <Lock className="w-4 h-4 flex-shrink-0" color="#4A5565" strokeWidth={2} />
                  {doc.assignments.length} {doc.assignments.length === 1 ? 'Recipient' : 'Recipients'}
                </span>
              </Cell>
            </div>

            {/* Actions */}
            <div className="flex items-center" style={{ gap: 12 }}>
              <button
                type="button"
                onClick={onDownload}
                className="flex flex-1 items-center justify-center gap-2 cursor-pointer hover:opacity-90"
                style={{
                  height: 44,
                  borderRadius: 8,
                  background: '#4F46E5',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '20px',
                  color: '#FFFFFF',
                }}
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                type="button"
                onClick={onEditRecipients}
                className="flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50"
                style={{
                  height: 44,
                  padding: '0 16px',
                  borderRadius: 8,
                  border: '1px solid rgba(0,0,0,0.1)',
                  background: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '20px',
                  color: '#0A0A0A',
                }}
              >
                <Users className="w-4 h-4" color="#0A0A0A" strokeWidth={2} />
                Edit Recipients
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------- Edit document modal ---------------------- */

function EditDocumentModal({
  doc,
  onClose,
  onUpdated,
}: {
  doc: DocumentDetail
  onClose: () => void
  onUpdated: () => void
}) {
  const { showToast } = useToast()
  const { groups: initGroups, individuals: initIndividuals } = assignmentsToSelections(doc.assignments)

  const [title, setTitle] = useState(doc.title ?? '')
  const [notes, setNotes] = useState(doc.note ?? '')
  const [category, setCategory] = useState(doc.category ?? '')
  const [error, setError] = useState<string | null>(null)
  const [selectedGroups, setSelectedGroups] = useState<string[]>(initGroups)
  const [selectedIndividuals, setSelectedIndividuals] = useState<string[]>(initIndividuals)
  const [showIndividuals, setShowIndividuals] = useState(true)
  const [search, setSearch] = useState('')
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      const token = await getToken()
      if (!token) return
      try {
        const data = await getRecipients(token)
        if (active) setRecipients(data)
      } catch { /* non-fatal */ }
    })()
    return () => { active = false }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const toggleGroup = (g: string) => {
    if (g === 'Assign Later') {
      setSelectedIndividuals([])
      setSelectedGroups(prev => prev.includes('Assign Later') ? [] : ['Assign Later'])
      return
    }
    setSelectedIndividuals([])
    setSelectedGroups(prev => {
      const withoutLater = prev.filter(x => x !== 'Assign Later')
      return withoutLater.includes(g) ? withoutLater.filter(x => x !== g) : [...withoutLater, g]
    })
  }

  const toggleIndividual = (id: string) => {
    setSelectedGroups([])
    setSelectedIndividuals(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleSubmit = async () => {
    const token = await getToken()
    if (!token) return
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    setError(null)
    setUpdating(true)
    try {
      await updateDocument(token, doc.id, {
        title: title.trim(),
        note: notes || undefined,
        category: category || undefined,
        assignments: buildAssignments(selectedGroups, selectedIndividuals),
      })
      showToast('Document updated', 'success')
      onUpdated()
      onClose()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const filteredIndividuals = recipients.filter(r =>
    r.name.toLowerCase().includes(search.trim().toLowerCase()),
  )

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="flex min-h-full items-center justify-center px-2 sm:px-4 py-4 sm:py-10"
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <div
          className="relative bg-white w-full"
          style={{
            maxWidth: 448,
            borderRadius: 10,
            boxShadow: '0px 8px 10px -6px rgba(0,0,0,0.1), 0px 20px 25px -5px rgba(0,0,0,0.1)',
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
              Edit Document
            </h2>
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
              {doc.title}
            </p>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-5 px-5 sm:px-6 pt-5 pb-5">
            {/* Drop zone — file replacement coming soon */}
            <div
              className="w-full flex flex-col items-center justify-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                showToast('File replacement coming soon', 'error')
              }}
              style={{
                minHeight: 100,
                borderRadius: 10,
                border: '1.25px dashed #D1D5DC',
                background: '#FFFFFF',
                padding: '24px',
              }}
            >
              <Upload className="w-8 h-8 text-[#99A1AF]" strokeWidth={1.75} />
              <span
                className="mt-2"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 13,
                  lineHeight: '18px',
                  color: '#99A1AF',
                  textAlign: 'center',
                }}
              >
                File replacement coming soon
              </span>
            </div>

            {/* Title */}
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
                Title <span style={{ color: '#FB2C36' }}>*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); if (error) setError(null) }}
                placeholder="Document title..."
                maxLength={150}
                className="w-full focus:outline-none"
                style={{
                  height: 44,
                  borderRadius: 8,
                  border: '1.25px solid rgba(0,0,0,0.1)',
                  background: '#F3F3F5',
                  padding: '4px 12px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 14,
                  letterSpacing: '-0.15px',
                  color: '#0A0A0A',
                }}
              />
            </div>

            {/* Category */}
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
                Category <span style={{ color: '#FB2C36' }}>*</span>
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full focus:outline-none appearance-none cursor-pointer"
                  style={{
                    height: 44,
                    borderRadius: 8,
                    border: '1.25px solid rgba(0,0,0,0.1)',
                    background: '#F3F3F5',
                    padding: '4px 36px 4px 12px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 14,
                    letterSpacing: '-0.15px',
                    color: category ? '#0A0A0A' : '#717182',
                  }}
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {DOC_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="w-4 h-4 text-[#717182] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  strokeWidth={2}
                />
              </div>
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
                maxLength={300}
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
              <span
                className="self-end"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 12,
                  lineHeight: '16px',
                  color: '#99A1AF',
                }}
              >
                {notes.length}/300
              </span>
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
                    <EditGroupRow
                      key={g}
                      label={g}
                      selected={selected}
                      variant={isAssignLater ? 'yellow' : 'default'}
                      onToggle={() => toggleGroup(g)}
                    />
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => setShowIndividuals(s => !s)}
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
                        style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#717182' }}
                      >
                        {recipients.length === 0 ? 'No recipients yet.' : 'No matches.'}
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
                            <EditCheckBox checked={selected} />
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

          {error && (
            <p
              className="px-5 sm:px-6"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 13,
                lineHeight: '18px',
                color: '#FB2C36',
              }}
            >
              {error}
            </p>
          )}

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
              disabled={updating}
              className="cursor-pointer hover:bg-gray-50 disabled:opacity-60"
              style={{
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
              onClick={handleSubmit}
              disabled={updating}
              className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
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
              {updating && <Loader2 className="w-4 h-4 animate-spin" />}
              {updating ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------- Loading skeleton ---------------------- */

function DocLoadingSkeleton() {
  return (
    <div
      className="flex flex-col"
      style={{
        borderRadius: 14,
        background: '#FFFFFF',
        border: '1.25px solid rgba(0,0,0,0.1)',
      }}
    >
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4"
          style={{
            padding: '16px 16px',
            borderBottom: i < 4 ? '1.25px solid rgba(0,0,0,0.1)' : 'none',
          }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 10, background: '#F3F4F6' }} className="animate-pulse flex-shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <div style={{ height: 16, width: '40%', borderRadius: 4, background: '#F3F4F6' }} className="animate-pulse" />
            <div style={{ height: 13, width: '60%', borderRadius: 4, background: '#F3F4F6' }} className="animate-pulse" />
          </div>
          <div style={{ height: 32, width: 60, borderRadius: 8, background: '#F3F4F6' }} className="animate-pulse" />
        </div>
      ))}
    </div>
  )
}

/* ---------------------- Empty state ---------------------- */

function DocEmptyState({
  hasFilters,
  onClearFilters,
  onUpload,
}: {
  hasFilters: boolean
  onClearFilters: () => void
  onUpload: () => void
}) {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        borderRadius: 14,
        background: '#FFFFFF',
        border: '1.25px solid rgba(0,0,0,0.1)',
        padding: '48px 24px',
        gap: 16,
        minHeight: 200,
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{ width: 56, height: 56, borderRadius: 14, background: '#EEF2FF' }}
      >
        <FileText className="w-7 h-7" color="#4F46E5" strokeWidth={1.75} />
      </div>
      <div className="flex flex-col items-center" style={{ gap: 6 }}>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: 16,
            lineHeight: '24px',
            color: '#101828',
            textAlign: 'center',
          }}
        >
          {hasFilters ? 'No documents match this filter' : 'No documents yet'}
        </p>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 14,
            lineHeight: '20px',
            color: '#4A5565',
            textAlign: 'center',
          }}
        >
          {hasFilters
            ? 'Try a different filter or upload a new document.'
            : 'Upload your first document to get started.'}
        </p>
      </div>
      {hasFilters ? (
        <button
          type="button"
          onClick={onClearFilters}
          className="cursor-pointer hover:bg-gray-50"
          style={{
            height: 36,
            padding: '7.8px 15.8px',
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.1)',
            background: '#FFFFFF',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 14,
            color: '#101828',
          }}
        >
          Clear filters
        </button>
      ) : (
        <button
          type="button"
          onClick={onUpload}
          className="flex items-center justify-center cursor-pointer hover:opacity-90"
          style={{
            height: 36,
            padding: '8px 16px',
            borderRadius: 8,
            background: '#4F46E5',
            gap: 5,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '20px',
            color: '#FFFFFF',
          }}
        >
          <Plus className="w-4 h-4" color="#FFFFFF" strokeWidth={2.25} />
          Upload Files
        </button>
      )}
    </div>
  )
}

/* ---------------------- List row ---------------------- */

function DocRow({
  doc,
  isLast,
  onView,
  onEdit,
  onDownload,
  onDelete,
}: {
  doc: ApiDoc
  isLast: boolean
  onView: () => void
  onEdit: () => void
  onDownload: () => void
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

  const kind = fileTypeToKind(doc.file_type)
  const KindIcon =
    kind === 'audio' ? Mic : kind === 'video' ? Video : kind === 'other' ? FileIcon : FileText
  const cat = getCategoryMeta(doc.category)

  return (
    <div
      className="flex flex-wrap items-center"
      style={{
        padding: '16px 16px 16px 16px',
        gap: 16,
        borderBottom: isLast ? 'none' : '1.25px solid rgba(0,0,0,0.1)',
      }}
    >
      {/* Left icon tile */}
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

      {/* Middle content */}
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
            {doc.title}
          </span>
          <CategoryBadge category={doc.category} />
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
          <span>{formatFileSize(doc.file_size_bytes)}</span>
          <span aria-hidden>•</span>
          <span>Uploaded {formatTimeAgo(doc.created_at)}</span>
        </div>
      </div>

      {/* Right block */}
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
            {doc.assignmentCount} Recipients
          </span>
        </div>

        {/* View + menu */}
        <div className="flex items-center" style={{ gap: 8, flexShrink: 0 }}>
          <button
            type="button"
            onClick={onView}
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

            {menuOpen && (
              <ActionMenu
                onEdit={() => { setMenuOpen(false); onEdit() }}
                onDownload={() => { setMenuOpen(false); onDownload() }}
                onDelete={() => { setMenuOpen(false); onDelete() }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------- Grid card ---------------------- */

function DocCard({
  doc,
  onEdit,
  onDownload,
  onDelete,
}: {
  doc: ApiDoc
  onEdit: () => void
  onDownload: () => void
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

  const kind = fileTypeToKind(doc.file_type)
  const KindIcon =
    kind === 'audio' ? Mic : kind === 'video' ? Video : kind === 'other' ? FileIcon : FileText

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
          {doc.title}
        </p>
        <CategoryBadge category={doc.category} />
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
        {formatFileSize(doc.file_size_bytes)}
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
          {doc.assignmentCount} Recipients
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
        {menuOpen && (
          <ActionMenu
            onEdit={() => { setMenuOpen(false); onEdit() }}
            onDownload={() => { setMenuOpen(false); onDownload() }}
            onDelete={() => { setMenuOpen(false); onDelete() }}
          />
        )}
      </div>
    </div>
  )
}

/* ---------------------- Category badge ---------------------- */

function CategoryBadge({ category }: { category: string }) {
  const cat = getCategoryMeta(category)
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
  onDownload,
  onDelete,
}: {
  onEdit: () => void
  onDownload: () => void
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
        boxShadow: '0px 4px 6px 0px rgba(0,0,0,0.05), 0px 10px 15px -3px rgba(0,0,0,0.1)',
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
        onClick={onDownload}
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

/* ---------------------- Edit modal sub-components ---------------------- */

function EditCheckBox({ checked }: { checked: boolean }) {
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

function EditGroupRow({
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
      <span
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          background: selected ? '#4F46E5' : '#FFFFFF',
          border: selected
            ? '1.1px solid #4F46E5'
            : variant === 'yellow'
            ? '1.1px solid #FDEBA2'
            : '1.1px solid rgba(0,0,0,0.1)',
          boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)',
        }}
      >
        {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </span>
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

'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Folder as FolderIcon,
  FolderPlus,
  Grid3x3,
  Image as ImageIcon,
  List,
  MoreHorizontal,
  MoreVertical,
  Pencil,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import AddPhotosModal from '@/components/dashboard/AddPhotosModal'

/* ---------------------- Types & data ---------------------- */

interface FolderItem {
  id: string
  name: string
  isDefault?: boolean
}

interface PhotoItem {
  id: string
  filename: string
  uploadedAt: string // YYYY-MM-DD
  folderId: string
}

const INITIAL_FOLDERS: FolderItem[] = [
  { id: 'uncategorized', name: 'Uncategorized',     isDefault: true },
  { id: 'family',        name: 'Family Vacations'  },
  { id: 'childhood',     name: 'Childhood Memories'},
  { id: 'wedding',       name: 'Wedding Day'       },
]

const INITIAL_PHOTOS: PhotoItem[] = [
  { id: 'p1', filename: 'uncategorized-1.jpg', uploadedAt: '2024-03-09', folderId: 'uncategorized' },
  { id: 'p2', filename: 'uncategorized-2.jpg', uploadedAt: '2024-03-08', folderId: 'uncategorized' },
  { id: 'p3', filename: 'paris-2023.jpg',      uploadedAt: '2023-07-21', folderId: 'family' },
  { id: 'p4', filename: 'tokyo-cherry.jpg',    uploadedAt: '2023-04-04', folderId: 'family' },
  { id: 'p5', filename: 'beach-day.jpg',       uploadedAt: '2022-08-11', folderId: 'family' },
  { id: 'p6', filename: 'first-bike.jpg',      uploadedAt: '2005-06-14', folderId: 'childhood' },
  { id: 'p7', filename: 'birthday-7.jpg',      uploadedAt: '2007-09-02', folderId: 'childhood' },
  { id: 'p8', filename: 'family-camp.jpg',     uploadedAt: '2008-07-18', folderId: 'childhood' },
  { id: 'p9', filename: 'wedding-day.jpg',     uploadedAt: '2019-05-22', folderId: 'wedding' },
]

/* ---------------------- Page ---------------------- */

export default function PhotosPage() {
  const [folders, setFolders] = useState<FolderItem[]>(INITIAL_FOLDERS)
  const [photos, setPhotos] = useState<PhotoItem[]>(INITIAL_PHOTOS)
  const [activeFolderId, setActiveFolderId] = useState('uncategorized')
  const [search, setSearch] = useState('')
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')

  // Modals
  const [uploading, setUploading] = useState(false)
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [editingFolder, setEditingFolder] = useState<FolderItem | null>(null)
  const [editingPhoto, setEditingPhoto] = useState<PhotoItem | null>(null)

  // Live folder counts from photos state
  const folderCounts: Record<string, number> = {}
  for (const f of folders) folderCounts[f.id] = 0
  for (const p of photos) {
    if (folderCounts[p.folderId] !== undefined) folderCounts[p.folderId]++
  }

  const activeFolder = folders.find((f) => f.id === activeFolderId) ?? folders[0]
  const visiblePhotos = photos
    .filter((p) => p.folderId === activeFolderId)
    .filter((p) =>
      search.trim() ? p.filename.toLowerCase().includes(search.trim().toLowerCase()) : true,
    )

  const handleDeletePhoto = (id: string) =>
    setPhotos((prev) => prev.filter((p) => p.id !== id))

  const handleCreateFolder = (name: string) => {
    if (!name.trim()) return
    setFolders((prev) => [
      ...prev,
      { id: `f-${Date.now()}`, name: name.trim() },
    ])
    setCreatingFolder(false)
  }
  const handleSaveFolder = (id: string, name: string) => {
    if (!name.trim()) return
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, name: name.trim() } : f)))
    setEditingFolder(null)
  }
  const handleDuplicateFolder = (id: string) => {
    const src = folders.find((f) => f.id === id)
    if (!src) return
    setFolders((prev) => [
      ...prev,
      { id: `f-${Date.now()}`, name: `${src.name} (copy)` },
    ])
  }
  const handleDeleteFolder = (id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id))
    if (activeFolderId === id) setActiveFolderId('uncategorized')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
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
          Photos
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
          Upload, organize, and share the memories that matter most with your recipients
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Left actions */}
        <div className="flex items-center" style={{ gap: 11.99 }}>
          <button
            type="button"
            onClick={() => setUploading(true)}
            className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-90"
            style={{
              height: 35.996,
              padding: '8px 16px',
              borderRadius: 8,
              background: '#4F39F6',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#FFFFFF',
              flexShrink: 0,
            }}
          >
            <Upload style={{ width: 16, height: 16, flexShrink: 0 }} color="#FFFFFF" strokeWidth={2} />
            Upload photos
          </button>
          <button
            type="button"
            onClick={() => setCreatingFolder(true)}
            className="flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50"
            style={{
              height: 35.996,
              padding: '8px 16px',
              borderRadius: 8,
              border: '1.25px solid rgba(0,0,0,0.1)',
              background: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#0A0A0A',
              flexShrink: 0,
            }}
          >
            <FolderPlus style={{ width: 16, height: 16, flexShrink: 0 }} color="#0A0A0A" strokeWidth={2} />
            New folder
          </button>
        </div>

        {/* Right: search + layout toggle */}
        <div className="flex items-center" style={{ gap: 8 }}>
          <div
            className="flex items-center gap-2"
            style={{
              width: 256,
              maxWidth: '100%',
              height: 35.996,
              borderRadius: 8,
              background: '#F3F3F5',
              padding: '4px 12px',
            }}
          >
            <Search style={{ width: 16, height: 16, flexShrink: 0 }} color="#717182" strokeWidth={2} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search photos..."
              className="flex-1 bg-transparent outline-none min-w-0"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '14px',
                letterSpacing: '-0.15px',
                color: '#0A0A0A',
              }}
            />
          </div>

          <div
            className="flex items-center"
            style={{
              width: 78.4,
              height: 42.44,
              borderRadius: 10,
              border: '1.25px solid #E5E7EB',
              padding: '4px 3.98px',
              gap: 3.98,
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() => setLayout('grid')}
              aria-label="Grid view"
              className="flex items-center justify-center cursor-pointer"
              style={{
                width: 31.97,
                height: 31.97,
                borderRadius: 4,
                background: layout === 'grid' ? '#F3F4F6' : 'transparent',
              }}
            >
              <Grid3x3 style={{ width: 16, height: 16, flexShrink: 0 }} color="#0A0A0A" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => setLayout('list')}
              aria-label="List view"
              className="flex items-center justify-center cursor-pointer"
              style={{
                width: 31.97,
                height: 31.97,
                borderRadius: 4,
                background: layout === 'list' ? '#F3F4F6' : 'transparent',
              }}
            >
              <List style={{ width: 16, height: 16, flexShrink: 0 }} color="#0A0A0A" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Two-column layout: folders + content */}
      <div className="flex flex-col lg:flex-row" style={{ gap: 23.98 }}>
        {/* Folders sidebar */}
        <aside
          className="flex flex-col flex-shrink-0"
          style={{
            width: '100%',
            maxWidth: 256,
            borderRadius: 14,
            background: '#FFFFFF',
            border: '1.25px solid rgba(0,0,0,0.1)',
            padding: 16,
            gap: 16,
            alignSelf: 'flex-start',
          }}
        >
          <h3
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 18,
              lineHeight: '27px',
              letterSpacing: '-0.44px',
              color: '#101828',
            }}
          >
            Folders
          </h3>

          <div className="flex flex-col" style={{ gap: 3.98 }}>
            {folders.map((f) => (
              <FolderRow
                key={f.id}
                folder={f}
                count={folderCounts[f.id] ?? 0}
                active={activeFolderId === f.id}
                onSelect={() => setActiveFolderId(f.id)}
                onEdit={() => setEditingFolder(f)}
                onDuplicate={() => handleDuplicateFolder(f.id)}
                onDelete={() => handleDeleteFolder(f.id)}
              />
            ))}
          </div>
        </aside>

        {/* Content area */}
        <section
          className="flex flex-col flex-1 min-w-0"
          style={{
            borderRadius: 14,
            background: '#FFFFFF',
            border: '1.25px solid rgba(0,0,0,0.1)',
            padding: '23.98px 24px',
            gap: 39.98,
          }}
        >
          {/* Section header */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h3
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 18,
                lineHeight: '27px',
                letterSpacing: '-0.44px',
                color: '#101828',
                wordBreak: 'break-word',
              }}
            >
              {activeFolder?.name ?? 'Uncategorized'} Photos
            </h3>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                color: '#6A7282',
              }}
            >
              {visiblePhotos.length} photos
            </span>
          </div>

          {/* Photo content */}
          {visiblePhotos.length === 0 ? (
            <div
              className="flex items-center justify-center"
              style={{
                minHeight: 200,
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                color: '#717182',
              }}
            >
              No photos in this folder yet.
            </div>
          ) : layout === 'grid' ? (
            <div
              className="grid"
              style={{
                gap: 16,
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              }}
            >
              {visiblePhotos.map((p) => (
                <PhotoCard
                  key={p.id}
                  photo={p}
                  onEdit={() => setEditingPhoto(p)}
                  onDelete={() => handleDeletePhoto(p.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col" style={{ gap: 7.99 }}>
              {visiblePhotos.map((p) => (
                <PhotoRow
                  key={p.id}
                  photo={p}
                  onEdit={() => setEditingPhoto(p)}
                  onDelete={() => handleDeletePhoto(p.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modals */}
      <AddPhotosModal
        open={uploading}
        onClose={() => setUploading(false)}
        title="Upload Photos"
        subtitle="Add new photos to your secure vault"
      />
      <AddPhotosModal
        open={!!editingPhoto}
        onClose={() => setEditingPhoto(null)}
        title="Edit Photo"
        subtitle={editingPhoto?.filename ?? ''}
      />
      {creatingFolder && (
        <CreateFolderModal
          onClose={() => setCreatingFolder(false)}
          onCreate={handleCreateFolder}
        />
      )}
      {editingFolder && (
        <EditFolderModal
          folder={editingFolder}
          onClose={() => setEditingFolder(null)}
          onSave={(name) => handleSaveFolder(editingFolder.id, name)}
        />
      )}
    </div>
  )
}

/* ---------------------- Folder row ---------------------- */

function FolderRow({
  folder,
  count,
  active,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  folder: FolderItem
  count: number
  active: boolean
  onSelect: () => void
  onEdit: () => void
  onDuplicate: () => void
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

  const Icon = folder.isDefault ? ImageIcon : FolderIcon
  const labelColor = active ? '#432DD7' : '#364153'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      className="w-full flex items-center cursor-pointer transition-colors relative"
      style={{
        height: 35.98,
        borderRadius: 10,
        padding: '8px 11.99px',
        gap: 11.99,
        background: active ? '#EEF2FF' : 'transparent',
      }}
    >
      <Icon
        style={{ width: 16, height: 16, flexShrink: 0 }}
        color={labelColor}
        strokeWidth={2}
      />
      <span
        className="flex-1 text-left min-w-0"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '20px',
          letterSpacing: '-0.15px',
          color: labelColor,
          wordBreak: 'break-word',
        }}
      >
        {folder.name}
      </span>
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 12,
          lineHeight: '16px',
          textAlign: 'center',
          color: '#6A7282',
          flexShrink: 0,
        }}
      >
        {count}
      </span>

      {/* 3-dot menu (only for non-default folders) */}
      {!folder.isDefault && (
        <span
          ref={menuRef}
          className="relative inline-flex items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Folder actions"
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen((o) => !o)
            }}
            className="inline-flex items-center justify-center cursor-pointer hover:bg-gray-100"
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              marginLeft: 4,
              flexShrink: 0,
            }}
          >
            <MoreVertical
              style={{ width: 16, height: 16, flexShrink: 0 }}
              color="#6A7282"
              strokeWidth={2}
            />
          </button>

          {menuOpen && (
            <FolderActionMenu
              onEdit={() => {
                setMenuOpen(false)
                onEdit()
              }}
              onDuplicate={() => {
                setMenuOpen(false)
                onDuplicate()
              }}
              onDelete={() => {
                setMenuOpen(false)
                onDelete()
              }}
            />
          )}
        </span>
      )}
    </div>
  )
}

/* ---------------------- Folder action dropdown ---------------------- */

function FolderActionMenu({
  onEdit,
  onDuplicate,
  onDelete,
}: {
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  return (
    <div
      className="absolute right-0 mt-1 flex flex-col z-30"
      style={{
        top: '100%',
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
        icon={<Pencil style={{ width: 18, height: 18 }} color="#000000" strokeWidth={2} />}
        label="Edit"
        color="#101828"
        onClick={onEdit}
      />
      <MenuRow
        icon={<Copy style={{ width: 18, height: 18 }} color="#4A5565" strokeWidth={2} />}
        label="Duplicate"
        color="#4A5565"
        onClick={onDuplicate}
      />
      <MenuRow
        icon={<Trash2 style={{ width: 18, height: 18 }} color="#C70036" strokeWidth={2} />}
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

/* ---------------------- Photo action dropdown (Edit / Download / Delete) ---------------------- */

function PhotoActionMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div
      className="absolute right-0 mt-1 flex flex-col z-30"
      style={{
        top: '100%',
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
        icon={<Pencil style={{ width: 18, height: 18 }} color="#000000" strokeWidth={2} />}
        label="Edit"
        color="#101828"
        onClick={onEdit}
      />
      <MenuRow
        icon={<Download style={{ width: 18, height: 18 }} color="#4A5565" strokeWidth={2} />}
        label="Download"
        color="#4A5565"
        onClick={() => {}}
      />
      <MenuRow
        icon={<Trash2 style={{ width: 18, height: 18 }} color="#C70036" strokeWidth={2} />}
        label="Delete"
        color="#C70036"
        onClick={onDelete}
      />
    </div>
  )
}

/* ---------------------- Photo grid card ---------------------- */

function PhotoCard({
  photo,
  onEdit,
  onDelete,
}: {
  photo: PhotoItem
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

  return (
    <div className="flex flex-col" style={{ gap: 7.99 }}>
      <div
        className="relative flex items-center justify-center"
        style={{
          aspectRatio: '1 / 1',
          borderRadius: 10,
          border: '1.25px solid #E5E7EB',
          background: 'linear-gradient(135deg, #E0E7FF 0%, #F3E8FF 100%)',
          padding: 1.25,
        }}
      >
        <ImageIcon style={{ width: 48, height: 48, flexShrink: 0 }} color="#A3B3FF" strokeWidth={1.75} />

        {/* 3-dot menu at top-right */}
        <div ref={menuRef} className="absolute top-2 right-2">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Open photo actions"
            className="flex items-center justify-center cursor-pointer hover:bg-white/60 backdrop-blur-sm"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.5)',
            }}
          >
            <MoreVertical style={{ width: 16, height: 16, flexShrink: 0 }} color="#0A0A0A" strokeWidth={2} />
          </button>
          {menuOpen && (
            <PhotoActionMenu
              onEdit={() => {
                setMenuOpen(false)
                onEdit()
              }}
              onDelete={() => {
                setMenuOpen(false)
                onDelete()
              }}
            />
          )}
        </div>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0 flex-1">
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#101828',
              wordBreak: 'break-word',
            }}
          >
            {photo.filename}
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 12,
              lineHeight: '16px',
              color: '#6A7282',
            }}
          >
            {photo.uploadedAt}
          </span>
        </div>
        <button
          type="button"
          aria-label="Download photo"
          className="flex items-center justify-center cursor-pointer hover:bg-gray-100"
          style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0 }}
        >
          <Download style={{ width: 16, height: 16, flexShrink: 0 }} color="#4A5565" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

/* ---------------------- Photo list row ---------------------- */

function PhotoRow({
  photo,
  onEdit,
  onDelete,
}: {
  photo: PhotoItem
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

  return (
    <div
      className="flex items-center"
      style={{
        minHeight: 90.47,
        borderRadius: 10,
        border: '1.25px solid #E5E7EB',
        padding: '12px 11.99px',
        gap: 16,
      }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 63.98,
          height: 63.98,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #E0E7FF 0%, #F3E8FF 100%)',
        }}
      >
        <ImageIcon style={{ width: 24, height: 24, flexShrink: 0 }} color="#A3B3FF" strokeWidth={1.75} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '-0.15px',
            color: '#101828',
            wordBreak: 'break-word',
          }}
        >
          {photo.filename}
        </span>
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 12,
            lineHeight: '16px',
            color: '#6A7282',
          }}
        >
          Uploaded {photo.uploadedAt}
        </span>
      </div>

      <div className="flex items-center" style={{ gap: 7.99, flexShrink: 0 }}>
        <button
          type="button"
          aria-label="Download"
          className="flex items-center justify-center cursor-pointer hover:bg-gray-100"
          style={{
            width: 35.996,
            height: 31.99,
            borderRadius: 8,
            padding: '0 10px',
          }}
        >
          <Download style={{ width: 16, height: 16, flexShrink: 0 }} color="#0A0A0A" strokeWidth={2} />
        </button>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="More actions"
            className="flex items-center justify-center cursor-pointer hover:bg-gray-100"
            style={{
              width: 35.996,
              height: 31.99,
              borderRadius: 8,
              padding: '0 10px',
            }}
          >
            <MoreHorizontal style={{ width: 16, height: 16, flexShrink: 0 }} color="#0A0A0A" strokeWidth={2} />
          </button>
          {menuOpen && (
            <PhotoActionMenu
              onEdit={() => {
                setMenuOpen(false)
                onEdit()
              }}
              onDelete={() => {
                setMenuOpen(false)
                onDelete()
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

/* ====================== MODALS ====================== */

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

/* ---------------------- Create Folder Modal ---------------------- */

function CreateFolderModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (name: string) => void
}) {
  const [name, setName] = useState('')
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['Assign Later'])
  const [selectedIndividuals, setSelectedIndividuals] = useState<string[]>([])
  const [showIndividuals, setShowIndividuals] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
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
  }, [onClose])

  const toggleGroup = (g: string) =>
    setSelectedGroups((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))
  const toggleIndividual = (id: string) =>
    setSelectedIndividuals((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )

  const filteredIndividuals = INDIVIDUALS.filter((i) =>
    i.name.toLowerCase().includes(search.trim().toLowerCase()),
  )

  const canCreate = name.trim().length > 0

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
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-2 gap-4">
            <h2
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 18,
                lineHeight: '28px',
                letterSpacing: '-0.44px',
                color: '#101828',
              }}
            >
              Create New Folder
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="cursor-pointer hover:bg-gray-100 rounded-md flex items-center justify-center"
              style={{ width: 24, height: 24 }}
            >
              <X style={{ width: 20, height: 20 }} color="#0A0A0A" strokeWidth={2} />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-4 px-6 pb-4 pt-2">
            {/* Folder name */}
            <div className="flex flex-col" style={{ gap: 10 }}>
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
                Folder Name <span style={{ color: '#FF0000' }}>*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Folder name here"
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

            {/* Add Recipients */}
            <div className="flex flex-col" style={{ gap: 15 }}>
              <label
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: 16,
                  lineHeight: '28px',
                  letterSpacing: '-0.44px',
                  color: '#101828',
                }}
              >
                Add Recipients
              </label>

              <div className="flex flex-col" style={{ gap: 10 }}>
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

              {/* Select Individuals toggle */}
              <button
                type="button"
                onClick={() => setShowIndividuals((s) => !s)}
                className="w-full flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50"
                style={{
                  height: 36,
                  borderRadius: 8,
                  border: '1.1px solid #4F46E5',
                  background: '#EEF2FF',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '20px',
                  color: '#4F46E5',
                }}
              >
                {showIndividuals ? (
                  <ChevronUp className="w-4 h-4" color="#4F46E5" strokeWidth={2} />
                ) : (
                  <ChevronDown className="w-4 h-4" color="#4F46E5" strokeWidth={2} />
                )}
                Select Individuals
              </button>

              {showIndividuals && (
                <div className="flex flex-col gap-2">
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
                    className="flex flex-col gap-2 overflow-y-auto"
                    style={{
                      maxHeight: 150,
                      borderRadius: 10,
                      border: '1.1px solid rgba(0,0,0,0.1)',
                      background: '#F9FAFB',
                      padding: '8px',
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
          <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer hover:bg-gray-50"
              style={{
                height: 35.996,
                padding: '8px 16px',
                borderRadius: 8,
                border: '1.25px solid rgba(0,0,0,0.1)',
                background: '#FFFFFF',
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
              onClick={() => onCreate(name)}
              disabled={!canCreate}
              className="cursor-pointer hover:opacity-90 disabled:cursor-not-allowed"
              style={{
                height: 35.996,
                padding: '8px 16px',
                borderRadius: 8,
                background: '#4F39F6',
                opacity: canCreate ? 1 : 0.5,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '-0.15px',
                color: '#FFFFFF',
              }}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------- Edit Folder Modal ---------------------- */

function EditFolderModal({
  folder,
  onClose,
  onSave,
}: {
  folder: FolderItem
  onClose: () => void
  onSave: (name: string) => void
}) {
  const [name, setName] = useState(folder.name)

  useEffect(() => {
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
  }, [onClose])

  const canSave = name.trim().length > 0 && name.trim() !== folder.name

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
          <div className="flex flex-col gap-4 px-6 py-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
              <h2
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: 18,
                  lineHeight: '28px',
                  letterSpacing: '-0.44px',
                  color: '#101828',
                }}
              >
                Edit Folder
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="cursor-pointer hover:bg-gray-100 rounded-md flex items-center justify-center"
                style={{ width: 24, height: 24 }}
              >
                <X style={{ width: 20, height: 20 }} color="#0A0A0A" strokeWidth={2} />
              </button>
            </div>

            {/* Input */}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full focus:outline-none"
              style={{
                height: 35.996,
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

            {/* Footer */}
            <div className="flex items-center justify-end" style={{ gap: 11.99 }}>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer hover:bg-gray-50"
                style={{
                  height: 35.996,
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1.25px solid rgba(0,0,0,0.1)',
                  background: '#FFFFFF',
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
                onClick={() => onSave(name)}
                disabled={!canSave}
                className="cursor-pointer hover:opacity-90 disabled:cursor-not-allowed"
                style={{
                  height: 35.996,
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: '#4F39F6',
                  opacity: canSave ? 1 : 0.5,
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
    </div>
  )
}

/* ---------------------- Shared modal sub-components ---------------------- */

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

  const checkbox =
    variant === 'yellow' ? (
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
    ) : (
      <CheckBox checked={selected} />
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
        padding: '12px 11.92px 12px 11.8px',
        gap: 12.08,
      }}
    >
      {checkbox}
      <span
        className="text-left flex-1 min-w-0"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '20px',
          letterSpacing: '-0.15px',
          color: textColor,
          wordBreak: 'break-word',
        }}
      >
        {label}
      </span>
    </button>
  )
}

'use client'

// Recipient portal — Memories. A photo gallery with folder organization and
// memory notes. Grid and list view modes. Static placeholder content for now;
// wires to real data once the recipient-facing endpoints exist.

import { useEffect, useRef, useState } from 'react'
import {
  Download,
  FileText,
  Folder,
  Grid3x3,
  List,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react'

type ViewMode = 'grid' | 'list'

type FolderItem = {
  id: string
  name: string
  isDefault?: boolean
}

type Memory = {
  id: string
  folder: string
  title: string
  note: string
  image: string
}

const MEMORIES: Memory[] = [
  {
    id: '1',
    folder: 'Uncategorized',
    title: 'Summer at the lake house, 2018',
    note: 'This was the summer you learned to swim. You were so proud of yourself, and so was I. We spent every evening on that dock watching the sunset.',
    image: '/images/Dashboard/reciepients/memories/img1.jpg',
  },
  {
    id: '2',
    folder: 'Uncategorized',
    title: 'Your high school graduation',
    note: 'I cried watching you walk across that stage. All those late nights studying, all that hard work — it all led to this moment.',
    image: '/images/Dashboard/reciepients/memories/img2.jpg',
  },
  {
    id: '3',
    folder: 'Uncategorized',
    title: 'Christmas morning, 2015',
    note: 'You were so excited you woke up at 5 AM. I pretended to be annoyed, but I loved every second of it.',
    image: '/images/Dashboard/reciepients/memories/img3.jpg',
  },
  {
    id: '4',
    folder: 'Uncategorized',
    title: 'First day of college',
    note: 'Dropping you off was one of the hardest things I ever did. But watching you walk toward your dorm with such confidence — I knew you were ready.',
    image: '/images/Dashboard/reciepients/memories/img4.jpg',
  },
  {
    id: '5',
    folder: 'Uncategorized',
    title: 'Your 21st birthday dinner',
    note: 'We went to that Italian place you loved. You ordered wine for the first time legally, and we toasted to your future.',
    image: '/images/Dashboard/reciepients/memories/img5.jpg',
  },
  {
    id: '6',
    folder: 'Uncategorized',
    title: 'Thanksgiving 2020',
    note: 'Just the two of us that year because of the pandemic. We made the entire feast together and laughed the whole time.',
    image: '/images/Dashboard/reciepients/memories/img6.jpg',
  },
  {
    id: '7',
    folder: 'Uncategorized',
    title: 'Morning coffee ritual',
    note: 'Every Sunday morning, without fail. Those conversations over coffee were some of my favorite moments.',
    image: '/images/Dashboard/reciepients/memories/img7.jpg',
  },
  {
    id: '8',
    folder: 'Uncategorized',
    title: 'Beach trip, summer 2019',
    note: "You collected shells for hours that day. You still have that jar of shells on your bookshelf, don't you?",
    image: '/images/Dashboard/reciepients/memories/img8.jpg',
  },
  {
    id: '9',
    folder: 'Uncategorized',
    title: 'Your first apartment',
    note: "We painted the living room together. You chose that awful green color, but I didn't say anything — it was your space.",
    image: '/images/Dashboard/reciepients/memories/img9.jpg',
  },
  {
    id: '10',
    folder: 'Family Vacations',
    title: 'Mother-daughter trip to New York',
    note: 'The Broadway shows, the late-night pizza, the way your eyes lit up seeing the city lights for the first time.',
    image: '/images/Dashboard/reciepients/memories/img10.jpg',
  },
  {
    id: '11',
    folder: 'Childhood Memories',
    title: 'Celebrating your promotion',
    note: 'I was so proud when you told me. We celebrated with your favorite dessert and talked about your future.',
    image: '/images/Dashboard/reciepients/memories/img11.jpg',
  },
  {
    id: '12',
    folder: 'Wedding Day',
    title: "Last Mother's Day together",
    note: "This was the last Mother's Day before I got sick. You made me breakfast and we spent the whole day together.",
    image: '/images/Dashboard/reciepients/memories/img12.jpg',
  },
]

const INITIAL_FOLDERS: FolderItem[] = [
  { id: 'uncategorized', name: 'Uncategorized', isDefault: true },
  { id: 'family-vacations', name: 'Family Vacations' },
  { id: 'childhood', name: 'Childhood Memories' },
  { id: 'wedding', name: 'Wedding Day' },
]

function MemoryModal({
  memory,
  open,
  onClose,
}: {
  memory: Memory | null
  open: boolean
  onClose: () => void
}) {
  if (!open || !memory) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white flex flex-col w-full max-w-[683px] p-6 sm:p-9 gap-4 sm:gap-[18.38px]"
        style={{
          borderRadius: '21.34px',
          boxShadow: '0px 38.11px 76.23px -18.29px rgba(0,0,0,0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header row */}
        <div className="flex items-center" style={{ gap: '18.38px' }}>
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: '54.88px',
              height: '54.88px',
              borderRadius: '15.25px',
              background: '#E0E7FF',
              padding: '12.2px',
            }}
          >
            <FileText
              style={{ width: 32, height: 32, color: '#4F39F6' }}
              strokeWidth={2}
            />
          </div>

          <h2
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 26,
              lineHeight: '36.59px',
              letterSpacing: 0,
              color: '#111827',
              margin: 0,
              flex: 1,
            }}
          >
            Memory Note
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
            style={{
              width: 32,
              height: 32,
            }}
          >
            <X
              style={{ width: 16, height: 16, color: '#6A7282' }}
              strokeWidth={2}
            />
          </button>
        </div>

        {/* Note text */}
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 21,
            lineHeight: '36.59px',
            letterSpacing: 0,
            color: '#4B5563',
            margin: 0,
          }}
        >
          {memory.note}
        </p>
      </div>
    </div>
  )
}

/* ---------------------- Folder row with actions ---------------------- */

function FolderRow({
  folder,
  count,
  active,
  onSelect,
  onEdit,
  onDelete,
}: {
  folder: FolderItem
  count: number
  active: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [menuOpen])

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
      className="relative w-full flex items-center justify-between cursor-pointer transition-colors"
      style={{
        gap: 12,
        height: 36,
        padding: '8px 12px',
        borderRadius: 10,
        background: active ? '#EEF2FF' : 'transparent',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Folder
          style={{ width: 16, height: 16, color: labelColor, flexShrink: 0 }}
          strokeWidth={2}
        />
        <span
          className="truncate"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '-0.15px',
            color: labelColor,
          }}
        >
          {folder.name}
        </span>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 12,
            lineHeight: '16px',
            color: '#6A7282',
          }}
        >
          {count}
        </span>

        {/* 3-dot menu — only for non-default folders */}
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
              className="inline-flex items-center justify-center cursor-pointer hover:bg-black/5 rounded-md"
              style={{ width: 22, height: 22, marginLeft: 2 }}
            >
              <MoreVertical
                style={{ width: 16, height: 16, color: '#6A7282' }}
                strokeWidth={2}
              />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 z-30 flex flex-col"
                style={{
                  top: '100%',
                  marginTop: 4,
                  width: 155,
                  borderRadius: 10,
                  border: '1px solid #E5E7EB',
                  background: '#FFFFFF',
                  padding: 8,
                  gap: 4,
                  boxShadow:
                    '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onEdit()
                  }}
                  className="flex items-center gap-2 rounded-md hover:bg-[#F3F4F6] transition-colors cursor-pointer"
                  style={{ padding: '6px 8px' }}
                >
                  <Pencil style={{ width: 16, height: 16, color: '#364153' }} strokeWidth={2} />
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: 14,
                      lineHeight: '20px',
                      letterSpacing: '-0.15px',
                      color: '#364153',
                    }}
                  >
                    Edit
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete()
                  }}
                  className="flex items-center gap-2 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                  style={{ padding: '6px 8px' }}
                >
                  <Trash2 style={{ width: 16, height: 16, color: '#E7000B' }} strokeWidth={2} />
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: 14,
                      lineHeight: '20px',
                      letterSpacing: '-0.15px',
                      color: '#E7000B',
                    }}
                  >
                    Delete
                  </span>
                </button>
              </div>
            )}
          </span>
        )}
      </div>
    </div>
  )
}

/* ---------------------- Folder name modal (create / edit) ---------------------- */

function FolderNameModal({
  mode,
  initialName,
  onClose,
  onSubmit,
}: {
  mode: 'create' | 'edit'
  initialName?: string
  onClose: () => void
  onSubmit: (name: string) => void
}) {
  const [name, setName] = useState(initialName ?? '')

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

  const trimmed = name.trim()
  const canSubmit =
    trimmed.length > 0 && (mode === 'create' || trimmed !== initialName)

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit(trimmed)
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="flex min-h-full items-center justify-center px-4 py-10"
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
                  margin: 0,
                }}
              >
                {mode === 'create' ? 'Create New Folder' : 'Edit Folder'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="cursor-pointer hover:bg-gray-100 rounded-md flex items-center justify-center"
                style={{ width: 24, height: 24 }}
              >
                <X style={{ width: 20, height: 20, color: '#0A0A0A' }} strokeWidth={2} />
              </button>
            </div>

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
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit()
                }}
                placeholder="Folder name here"
                className="w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

            {/* Footer */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer hover:bg-gray-50"
                style={{
                  height: 36,
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
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="cursor-pointer hover:opacity-90 disabled:cursor-not-allowed"
                style={{
                  height: 36,
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: '#4F39F6',
                  opacity: canSubmit ? 1 : 0.5,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '20px',
                  letterSpacing: '-0.15px',
                  color: '#FFFFFF',
                }}
              >
                {mode === 'create' ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

let folderIdCounter = 0

export default function RecipientMemoriesPage() {
  const [folders, setFolders] = useState<FolderItem[]>(INITIAL_FOLDERS)
  const [memories, setMemories] = useState<Memory[]>(MEMORIES)
  const [activeFolderId, setActiveFolderId] = useState('uncategorized')
  const [view, setView] = useState<ViewMode>('grid')
  const [modalMemory, setModalMemory] = useState<Memory | null>(null)

  // Folder modals
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [editingFolder, setEditingFolder] = useState<FolderItem | null>(null)

  const activeFolder =
    folders.find((f) => f.id === activeFolderId) ?? folders[0]
  const visibleMemories = memories.filter((m) => m.folder === activeFolder.name)

  const folderCount = (name: string) =>
    memories.filter((m) => m.folder === name).length

  const handleCreateFolder = (name: string) => {
    folderIdCounter += 1
    const newFolder: FolderItem = {
      id: `folder-${folderIdCounter}-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
    }
    setFolders((prev) => [...prev, newFolder])
    setCreatingFolder(false)
    setActiveFolderId(newFolder.id)
  }

  const handleEditFolder = (name: string) => {
    if (!editingFolder) return
    const oldName = editingFolder.name
    setFolders((prev) =>
      prev.map((f) => (f.id === editingFolder.id ? { ...f, name } : f)),
    )
    // Keep the memories' folder reference in sync with the rename.
    setMemories((prev) =>
      prev.map((m) => (m.folder === oldName ? { ...m, folder: name } : m)),
    )
    setEditingFolder(null)
  }

  const handleDeleteFolder = (folder: FolderItem) => {
    // Move the folder's memories back to Uncategorized, then drop the folder.
    setMemories((prev) =>
      prev.map((m) =>
        m.folder === folder.name ? { ...m, folder: 'Uncategorized' } : m,
      ),
    )
    setFolders((prev) => prev.filter((f) => f.id !== folder.id))
    if (activeFolderId === folder.id) setActiveFolderId('uncategorized')
  }

  return (
    <div className="w-full flex flex-col p-4 sm:p-6 lg:p-8 gap-6 sm:gap-8">
      {/* Header */}
      <div className="flex flex-col" style={{ gap: 8 }}>
        <h1
          style={{
            fontFamily: '"Instrument Serif", serif',
            fontWeight: 400,
            fontSize: 36,
            lineHeight: '54px',
            color: '#111827',
          }}
        >
          Memories
        </h1>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 15,
            lineHeight: '22.5px',
            letterSpacing: '-0.23px',
            color: '#6B7280',
          }}
        >
          {MEMORIES.length} photos left for you
        </p>
      </div>

      {/* Control bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center flex-wrap gap-3">
          <button
            type="button"
            className="flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90"
            style={{
              gap: 8,
              height: 36,
              padding: '0 12px',
              borderRadius: 8,
              background: '#4F39F6',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: '-0.15px',
              color: '#FFFFFF',
            }}
          >
            <Upload style={{ width: 16, height: 16 }} strokeWidth={2} />
            Upload photos
          </button>

          <button
            type="button"
            onClick={() => setCreatingFolder(true)}
            className="flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            style={{
              gap: 8,
              height: 36,
              padding: '0 12px',
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
            <Plus style={{ width: 16, height: 16 }} strokeWidth={2} />
            New folder
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div
            className="relative flex-1 lg:flex-none lg:w-64"
            style={{
              height: 36,
              borderRadius: 8,
              border: '1.25px solid rgba(0,0,0,0.1)',
              background: '#F3F3F5',
            }}
          >
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
              style={{ width: 16, height: 16, color: '#99A1AF' }}
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder="Search photos..."
              className="absolute inset-0 w-full h-full pl-10 pr-3 rounded-lg border-0 text-14 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '100%',
                letterSpacing: '-0.15px',
                color: '#717182',
                background: '#F3F3F5',
              }}
            />
          </div>

          {/* View toggle */}
          <div
            className="flex items-center flex-shrink-0"
            style={{
              gap: 4,
              height: 42,
              padding: '4px 4px',
              borderRadius: 10,
              border: '1.25px solid #E5E7EB',
            }}
          >
            <button
              type="button"
              onClick={() => setView('grid')}
              className="flex items-center justify-center cursor-pointer transition-colors"
              style={{
                width: 32,
                height: 32,
                borderRadius: 4,
                background: view === 'grid' ? '#F3F4F6' : 'transparent',
              }}
            >
              <Grid3x3
                style={{
                  width: 16,
                  height: 16,
                  color: '#101828',
                }}
                strokeWidth={2}
              />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className="flex items-center justify-center cursor-pointer transition-colors"
              style={{
                width: 32,
                height: 32,
                borderRadius: 4,
                background: view === 'list' ? '#F3F4F6' : 'transparent',
              }}
            >
              <List
                style={{
                  width: 16,
                  height: 16,
                  color: '#101828',
                }}
                strokeWidth={2}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main content — two column */}
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* Left: Folders */}
        <div
          className="w-full lg:w-64 flex-shrink-0"
          style={{
            borderRadius: 14,
            border: '1.25px solid rgba(0,0,0,0.1)',
            background: '#FFFFFF',
            padding: 24,
          }}
        >
          <h2
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 18,
              lineHeight: '27px',
              letterSpacing: '-0.44px',
              color: '#101828',
              marginBottom: 24,
              marginTop: 0,
            }}
          >
            Folders
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {folders.map((folder) => (
              <FolderRow
                key={folder.id}
                folder={folder}
                count={folderCount(folder.name)}
                active={activeFolderId === folder.id}
                onSelect={() => setActiveFolderId(folder.id)}
                onEdit={() => setEditingFolder(folder)}
                onDelete={() => handleDeleteFolder(folder)}
              />
            ))}
          </div>
        </div>

        {/* Right: Photos */}
        <div
          className="flex-1 min-w-0 p-4 sm:p-6"
          style={{
            borderRadius: 14,
            border: '1.25px solid rgba(0,0,0,0.1)',
            background: '#FFFFFF',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 18,
                lineHeight: '27px',
                letterSpacing: '-0.44px',
                color: '#101828',
                margin: 0,
              }}
            >
              {activeFolder.name}
            </h2>
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
              {visibleMemories.length} photos
            </span>
          </div>

          {/* Grid view */}
          {view === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {visibleMemories.map((mem) => (
                <div
                  key={mem.id}
                  className="relative group cursor-pointer overflow-hidden"
                  style={{
                    borderRadius: 9,
                    aspectRatio: '1 / 1',
                    background: '#E5E7EB',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mem.image}
                    alt={mem.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Icon overlay */}
                  <button
                    type="button"
                    onClick={() => setModalMemory(mem)}
                    aria-label={`View memory: ${mem.title}`}
                    className="absolute top-2 right-2 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9999,
                      background: '#FFFFFF',
                      boxShadow:
                        '0px 8.62px 12.93px -2.59px rgba(0,0,0,0.1), 0px 3.45px 5.17px -3.45px rgba(0,0,0,0.1)',
                    }}
                  >
                    <FileText
                      style={{ width: 18, height: 18, color: '#5957EC' }}
                      strokeWidth={2}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* List view */}
          {view === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {visibleMemories.map((mem) => (
                <div
                  key={mem.id}
                  className="flex gap-4 sm:gap-6"
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    border: '1.25px solid #E5E7EB',
                    background: '#FFFFFF',
                  }}
                >
                  {/* Thumbnail */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mem.image}
                    alt={mem.title}
                    className="flex-shrink-0"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 10,
                      objectFit: 'cover',
                    }}
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <h3
                      style={{
                        fontFamily: '"Instrument Serif", serif',
                        fontWeight: 400,
                        fontSize: 18,
                        lineHeight: '27px',
                        color: '#111827',
                        margin: 0,
                      }}
                    >
                      {mem.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: '"Instrument Serif", serif',
                        fontWeight: 400,
                        fontSize: 14,
                        lineHeight: '26.6px',
                        color: '#6B7280',
                        margin: 0,
                      }}
                    >
                      {mem.note}
                    </p>
                  </div>

                  {/* Download button */}
                  <button
                    type="button"
                    onClick={() => setModalMemory(mem)}
                    className="flex-shrink-0 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
                  >
                    <Download
                      style={{ width: 20, height: 20, color: '#6B7280' }}
                      strokeWidth={2}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Memory Note Modal */}
      <MemoryModal
        memory={modalMemory}
        open={!!modalMemory}
        onClose={() => setModalMemory(null)}
      />

      {/* Create folder */}
      {creatingFolder && (
        <FolderNameModal
          mode="create"
          onClose={() => setCreatingFolder(false)}
          onSubmit={handleCreateFolder}
        />
      )}

      {/* Edit folder */}
      {editingFolder && (
        <FolderNameModal
          mode="edit"
          initialName={editingFolder.name}
          onClose={() => setEditingFolder(null)}
          onSubmit={handleEditFolder}
        />
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { MessageSquare, FileText, Users, UserCheck, LucideIcon } from 'lucide-react'
import { useAuth } from '@/lib/context/AuthContext'
import { notifyActivityChanged } from '@/lib/activity-helpers'
import CreateMessageModal from './CreateMessageModal'
import AddPhotosModal from './AddPhotosModal'
import AddRecipientsModal from './AddRecipientsModal'

type ActionKey = 'record_message' | 'upload_document' | 'add_recipients'

type Action = {
  key: ActionKey
  icon: LucideIcon
  iconBg: string
  iconColor: string
  title: string
  desc: string
}

const actions: Action[] = [
  {
    key: 'record_message',
    icon: MessageSquare,
    iconBg: '#E0E7FF',
    iconColor: '#4F39F6',
    title: 'Record a Message',
    desc: 'Create video or audio messages',
  },
  {
    key: 'upload_document',
    icon: FileText,
    iconBg: '#DCFCE7',
    iconColor: '#00A63E',
    title: 'Upload Documents',
    desc: 'Add important files to your vault',
  },
  {
    key: 'add_recipients',
    icon: Users,
    iconBg: '#F3E8FF',
    iconColor: '#9810FA',
    title: 'Add Recipients',
    desc: 'Invite people to your Tether',
  },
]

export default function QuickActions() {
  const { refreshProfile } = useAuth()
  const [openAction, setOpenAction] = useState<ActionKey | null>(null)

  const refreshAll = () => {
    refreshProfile()
    notifyActivityChanged()
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Section header */}
      <div className="flex items-center">
        <h3
          className="text-[11.1px] font-semibold uppercase text-[#6A7282] leading-4"
          style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.3px' }}
        >
          Quick Actions
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.title}
              type="button"
              onClick={() => setOpenAction(action.key)}
              className="flex items-center gap-3 rounded-[14px] bg-white p-4 text-left transition-colors hover:bg-gray-50 cursor-pointer"
              style={{ border: '1px solid rgba(0,0,0,0.1)' }}
            >
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
                style={{ background: action.iconBg }}
              >
                <Icon className="w-5 h-5" strokeWidth={2} color={action.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[15px] sm:text-[16.7px] font-semibold text-[#101828] leading-7"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {action.title}
                </p>
                <p
                  className="text-[13px] text-[#4A5565] leading-5"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {action.desc}
                </p>
              </div>
            </button>
          )
        })}

        {/* Highlighted: See Unassigned Content */}
        <button
          type="button"
          className="flex items-center gap-3 rounded-[14px] p-4 text-left transition-colors hover:brightness-95"
          style={{
            background: '#FFFBEB',
            borderTop: '2px solid #FEE685',
            border: '2px solid #FEE685',
          }}
        >
          <div
            className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
            style={{ background: '#FEE685' }}
          >
            <UserCheck className="w-5 h-5" strokeWidth={2} color="#BB4D00" />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-[15px] sm:text-[16.7px] font-semibold text-[#101828] leading-7"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              See Unassigned Content
            </p>
            <p
              className="text-[13px] text-[#4A5565] leading-5"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Review items waiting for recipients
            </p>
          </div>
        </button>
      </div>

      {/* Modals */}
      <CreateMessageModal
        open={openAction === 'record_message'}
        onClose={() => setOpenAction(null)}
        headerTitle="Record New Message"
        headerSubtitle="Create a meaningful message for your loved ones"
      />
      <AddPhotosModal
        open={openAction === 'upload_document'}
        onClose={() => setOpenAction(null)}
        onCreated={refreshAll}
        kind="document"
        title="Upload Document"
        subtitle="Add a new document to your secure vault"
      />
      <AddRecipientsModal
        open={openAction === 'add_recipients'}
        onClose={() => setOpenAction(null)}
        onCreated={refreshAll}
        title="Add Recipients"
        subtitle={null}
        bottomVariant="guardian"
      />
    </div>
  )
}

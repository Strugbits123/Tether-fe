'use client'

import { Bell, Download, HelpCircle, Lock, Shield, Users } from 'lucide-react'
import HelpPage, {
  type Faq,
  type FaqCategory,
  type VideoTutorial,
} from '@/app/(dashboard)/help/page'

// Release Manager portal — Get support. Reuses the shared Help Center page,
// re-themed with the RM portal's accent color, and with RM-specific FAQs and
// tutorials instead of the account-owner's (vault ownership, billing, etc.
// aren't relevant to someone acting as a Release Manager).

const RM_CATEGORIES: FaqCategory[] = [
  { label: 'All Questions', Icon: HelpCircle, color: '#4F46E5', lightBg: '#EEF2FF' },
  { label: 'Being a Release Manager', Icon: Users, color: '#00A63E', lightBg: '#F0FDF4' },
  { label: 'Recipients & Delivery', Icon: Users, color: '#9810FA', lightBg: '#FAF5FF' },
  { label: 'Downloads', Icon: Download, color: '#155DFC', lightBg: '#EFF6FF' },
  { label: 'Notifications', Icon: Bell, color: '#D08700', lightBg: '#FEFCE8' },
  { label: 'Account & Security', Icon: Lock, color: '#E60076', lightBg: '#FDF2F8' },
  { label: 'Legal & Responsibilities', Icon: Shield, color: '#E7000B', lightBg: '#FEF2F2' },
]

const RM_FAQS: Faq[] = [
  {
    question: 'What does a Release Manager do?',
    category: 'Being a Release Manager',
    answer:
      "As a Release Manager, you're responsible for confirming when the account owner's content should be released to their recipients, and overseeing that process from start to finish.",
  },
  {
    question: 'When can I download the account owner’s content?',
    category: 'Downloads',
    answer:
      'Content becomes available to download once a release has actually been initiated. You have no access to the account owner’s messages, documents, or photos before that.',
  },
  {
    question: 'What can I download?',
    category: 'Downloads',
    answer:
      'You can download audio messages, documents, photos, message transcripts, and the life story/memoir as a package. Video messages are viewable in the portal but aren’t included in the download.',
  },
  {
    question: 'How do I see who has received their content?',
    category: 'Recipients & Delivery',
    answer:
      'The Recipients page shows each recipient’s delivery and access status once a release is underway, including whether their notification email bounced.',
  },
  {
    question: 'What happens if a recipient’s delivery email bounces?',
    category: 'Recipients & Delivery',
    answer:
      'You can retry delivery with an updated email address directly from the Recipients page.',
  },
  {
    question: 'What are notifications for?',
    category: 'Notifications',
    answer:
      'Notifications keep you updated on account activity relevant to your role — like invitation confirmations or account owner actions — along with occasional announcements from Tether.',
  },
  {
    question: 'Can I mark notifications as read or unread?',
    category: 'Notifications',
    answer:
      'Yes — use the mail icon next to any notification to toggle its read status. Notifications aren’t deleted, so you can always find them again later.',
  },
  {
    question: 'Can I be a Release Manager for more than one person?',
    category: 'Being a Release Manager',
    answer:
      'Yes. If you’ve been designated by multiple account owners, you can switch between accounts from the account switcher.',
  },
  {
    question: 'Does being a Release Manager give me legal authority over the account owner’s estate?',
    category: 'Legal & Responsibilities',
    answer:
      'No. This role gives you access to release Tether content according to the account owner’s instructions — it doesn’t replace a will or grant legal authority over finances, property, or the estate.',
  },
  {
    question: 'How do I update my profile information?',
    category: 'Account & Security',
    answer:
      'Go to My Profile to view your saved details, and select Edit Profile to make changes.',
  },
  {
    question: 'Is my access to the account owner’s content secure?',
    category: 'Account & Security',
    answer:
      'Yes. All data is encrypted in transit and at rest, and you only gain access to content once a release has been initiated — never before.',
  },
]

const RM_VIDEOS: VideoTutorial[] = [
  {
    duration: '3:10',
    title: 'Getting Started as a Release Manager',
    desc: 'What to expect and how the portal works',
  },
  {
    duration: '2:40',
    title: 'Understanding the Release Process',
    desc: 'What happens when a release is initiated',
  },
  {
    duration: '2:15',
    title: 'Downloading Content',
    desc: 'How to package and download what you need',
  },
]

export default function RmHelpPage() {
  return (
    <HelpPage
      accentColor="#4F46E5"
      accentColorDark="#3730A3"
      categories={RM_CATEGORIES}
      faqs={RM_FAQS}
      videos={RM_VIDEOS}
    />
  )
}

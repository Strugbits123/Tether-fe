import HelpPage from '@/app/(dashboard)/help/page'

// Release Manager portal — Get support. Reuses the shared Help Center page,
// re-themed with the RM portal's accent color instead of the owner
// dashboard's.
export default function RmHelpPage() {
  return <HelpPage accentColor="#4F46E5" accentColorDark="#3730A3" />
}

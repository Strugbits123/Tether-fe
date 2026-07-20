import { redirect } from 'next/navigation'

// Bare /rm redirects to the real overview route — kept for old links/bookmarks
// and as a safe fallback for anything that still points at '/rm'.
export default function RmRedirectPage() {
  redirect('/rm/overview')
}

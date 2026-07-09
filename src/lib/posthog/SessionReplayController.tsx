'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import posthog from 'posthog-js';

// Session replay is opt-IN by route. It runs only on the onboarding flow and
// the dashboard home ("account owner portal") and is stopped everywhere else —
// including any page that can show personal content: the message recorder,
// document vault, memoir editor, photos, and recipient/access management.
// Replay is disabled at init (disable_session_recording), so the default is
// off and these routes explicitly turn it on.
function isReplayAllowed(pathname: string): boolean {
  if (pathname.startsWith('/onboarding')) return true;
  // Dashboard home only — not the nested content routes under it.
  if (pathname === '/dashboard') return true;
  return false;
}

export default function SessionReplayController() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || !posthog.__loaded) return;

    if (isReplayAllowed(pathname)) {
      posthog.startSessionRecording();
    } else {
      posthog.stopSessionRecording();
    }
  }, [pathname]);

  return null;
}

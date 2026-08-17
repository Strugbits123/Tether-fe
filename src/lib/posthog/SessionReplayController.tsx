'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const [ready, setReady] = useState(() => posthog.__loaded ?? false);

  // posthog.init() finishes asynchronously, so on a direct load of an allowed
  // route the SDK may not be ready when this first mounts. Poll until it loads
  // (bounded, so it stops when no key is configured), then let the decision
  // effect below re-run via the `ready` dependency.
  useEffect(() => {
    if (ready) return;
    let attempts = 0;
    const id = window.setInterval(() => {
      if (posthog.__loaded) {
        setReady(true);
        window.clearInterval(id);
      } else if (++attempts >= 25) {
        window.clearInterval(id); // ~5s cap — likely no PostHog key set
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [ready]);

  useEffect(() => {
    if (!pathname || !ready) return;

    if (isReplayAllowed(pathname)) {
      posthog.startSessionRecording();
    } else {
      posthog.stopSessionRecording();
    }
  }, [pathname, ready]);

  return null;
}

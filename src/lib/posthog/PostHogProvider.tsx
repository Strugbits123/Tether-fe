'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import { captureAttribution } from '@/lib/attribution';
import { getEnvironment } from '@/lib/posthog/analytics';

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // First-touch acquisition capture — must run regardless of PostHog config,
    // and before the user can navigate off the landing page.
    captureAttribution();

    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    const backendHost = process.env.NEXT_PUBLIC_API_URL
      ? new URL(process.env.NEXT_PUBLIC_API_URL).hostname
      : 'localhost';

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      capture_pageview: false,
      capture_pageleave: true,
      person_profiles: 'identified_only',
      // Do NOT autostart replay. SessionReplayController starts it only on
      // allowed routes (onboarding/dashboard) and stops it on sensitive pages
      // (recorder, vault, memoir editor), so personal content is never
      // recorded even for a moment on load.
      disable_session_recording: true,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '*',
      },
      tracing_headers: [
        backendHost,
        ...(process.env.NODE_ENV === 'development' ? ['localhost'] : []),
      ].filter(Boolean),
      loaded: (ph) => {
        // Registered super properties ride along on every event; user_id is
        // added on identify (see analytics.identifyUser).
        ph.register({ environment: getEnvironment() });
        if (process.env.NODE_ENV === 'development') ph.debug();
      },
    });
  }, []);

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

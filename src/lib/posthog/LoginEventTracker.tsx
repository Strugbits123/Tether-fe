'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { track } from '@/lib/posthog/analytics';

// Fires user_logged_in for logins that complete on the server /auth/callback
// route (magic link, Google OAuth), which can't call the browser SDK itself.
// The callback appends `?li=<method>`; this reads it once, captures the event,
// then strips the param so a refresh doesn't double-count. Password logins
// fire directly from the sign-in form instead.
export default function LoginEventTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const method = searchParams.get('li');
    if (!method) return;

    track('user_logged_in', { login_method: method });

    const next = new URLSearchParams(searchParams.toString());
    next.delete('li');
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, searchParams, router]);

  return null;
}

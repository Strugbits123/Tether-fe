import posthog from 'posthog-js'
import type { OnboardingState, UserProfile } from '@/lib/api/users'

// Deploy environment, derived from the browser host. Registered as a super
// property so every event (including autocapture + $pageview) carries it, per
// the tracking plan.
export function getEnvironment(): 'production' | 'staging' | 'development' {
  if (typeof window === 'undefined') return 'development'
  const host = window.location.hostname
  if (host === 'jointether.com' || host === 'www.jointether.com') return 'production'
  if (host.startsWith('staging.')) return 'staging'
  return 'development'
}

function activationStatus(
  onboarding: OnboardingState | null,
): 'not_started' | 'in_progress' | 'complete' {
  if (!onboarding) return 'not_started'
  if (onboarding.completed_at) return 'complete'
  const steps: (keyof OnboardingState)[] = [
    'finish_account',
    'add_release_manager',
    'add_recipients',
    'add_photos',
    'create_message',
  ]
  const done = steps.filter((s) => onboarding[s] === true).length
  return done === 0 ? 'not_started' : 'in_progress'
}

/**
 * Identify the current user and set the tracking-plan person properties known
 * to the browser. `user_id` + `environment` are registered as super properties
 * so they ride along on every subsequent event. The backend enriches the
 * remaining person properties (has_recipients, has_release_manager,
 * message_count) on login where the DB counts are available.
 */
export function identifyUser(profile: UserProfile): void {
  if (!posthog.__loaded) return
  posthog.register({ user_id: profile.id, environment: getEnvironment() })
  posthog.identify(profile.id, {
    email: profile.email,
    first_name: profile.first_name ?? null,
    account_status: profile.account_status ?? 'free',
    activation_status: activationStatus(profile.onboarding),
    created_at: (profile.created_at as string | undefined) ?? null,
  })
}

// Clear identity + registered super properties on logout, then re-register the
// environment so pre-login events still carry it.
export function resetIdentity(): void {
  if (!posthog.__loaded) return
  posthog.reset()
  posthog.register({ environment: getEnvironment() })
}

/**
 * Capture a product event. Thin wrapper over posthog.capture that no-ops before
 * the SDK loads (or when the key is unset), so call sites don't each guard.
 * `user_id` + `environment` come from registered super properties.
 */
export function track(event: string, properties?: Record<string, unknown>): void {
  if (!posthog.__loaded) return
  posthog.capture(event, properties)
}

# Tether Web

Next.js frontend for Tether — Digital Legacy Platform

## Tech Stack

- **Next.js 16** (App Router) + React 19 + TypeScript (strict mode)
- **Tailwind CSS v4**
- **Supabase SSR** (`@supabase/ssr`) — auth & storage
- **Mux** (`@mux/mux-player-react`) — video message playback
- **Sentry** (`@sentry/nextjs`) — error monitoring
- **PostHog** (`posthog-js`) — product analytics
- **Stripe** (`@stripe/stripe-js`) — billing
- **Lucide React** (icons)
- **Vercel** (hosting)

The frontend talks to a NestJS REST API. Every response uses one of two envelopes
(`{ success, data }` or `{ success: false, statusCode, message }`) — see
[`API_REFERENCE.md`](./API_REFERENCE.md) for the full contract.

## Prerequisites

- Node.js 20+
- npm
- Access to 1Password Teams vault (Tether)

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/Strugbits123/Tether-fe.git
cd tether-web
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in values from 1Password.

### 4. Run in development

```bash
npm run dev
```

App runs at: http://localhost:3000

## Environment Variables

See `.env.example` for all required variables.

`NEXT_PUBLIC_*` variables are safe for the browser. Never commit `.env.local` to git.

## Branch Strategy

| Branch | Target | Environment |
|--------|--------|-------------|
| `feature/*` | → `develop` (via PR) | — |
| `develop` | → `Tether-Inc/Tether-Front-End` `develop` | Staging |
| `main` | → `Tether-Inc/Tether-Front-End` `main` | Production |

All PRs require CodeRabbit review before merge.

## Deployment

| Environment | Trigger | URL |
|-------------|---------|-----|
| Staging | Auto-deploy on `Tether-Inc/develop` update | https://staging.jointether.com |
| Production | Auto-deploy on `Tether-Inc/main` update | https://jointether.com |

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # signin/signup ([mode]), onboarding, verify-email, update-password
│   ├── (dashboard)/     # Protected pages — dashboard, messages, access
│   └── auth/callback/   # Supabase OAuth callback handler
├── components/
│   ├── ui/              # Reusable UI components
│   ├── dashboard/       # WelcomeBanner, SetupSteps, modals (recipients, RM, photos, message, profile)
│   ├── layout/          # Sidebar, TopBar
│   └── onboarding/      # Onboarding step components (Step1–Step5)
├── lib/
│   ├── supabase/        # Browser and server Supabase clients
│   ├── api/             # Typed API client + per-resource modules
│   │                    #   client, users, recipients, release-managers,
│   │                    #   photos, documents, messages, activity
│   ├── context/         # AuthContext, ToastContext
│   └── utils/           # assignments, retry, audio (duration fix)
└── types/               # Shared TypeScript types
```

## API Integration

- `lib/api/client.ts` is the **single source of truth** for success/failure. It
  unwraps `data` on success and throws a typed `ApiError(statusCode, message)`
  for every failure class (non-2xx, `success: false`, malformed body, network
  error). Call sites surface `error.message` and branch on `error.statusCode`.
- Per-resource modules (`users`, `recipients`, `release-managers`, `photos`,
  `documents`, `messages`, `activity`) wrap the documented endpoints.
- Uploads use signed-URL flows: photos/documents (Supabase Storage) and
  video/audio messages (Mux upload / Supabase + confirm).
- `AuthContext` loads `/users/me` with backoff retry on transient failures and
  exposes the canonical `UserProfile` type.

## Auth Flow

Auth is **Supabase-direct** (the documented `/auth/*` REST routes are not used);
a single `/auth/login` side-call syncs the backend after sign-in.

1. **Sign up** (email/password via `supabase.auth.signUp`):
   - Duplicate email → inline error + "Sign in instead" (no redirect).
   - Unverified → `/verify-email` (never the dashboard).
   - Active session → `/onboarding`.
2. **Email confirmation / magic link / password reset** — all "check your inbox"
   screens have working resend.
3. **Google OAuth** → `/auth/callback` (PKCE code flow).
4. New user → `/onboarding`; returning user → `/dashboard`.

> Note: preventing the same email signing up via both password and Google
> requires Supabase config (enable email confirmations + identity linking) — the
> client guards the password path but can't fully enforce it.

## Onboarding & Dashboard

- **Onboarding** (`Step1–Step5`) creates real resources via the API as you go
  (recipients, release manager, message, document/media upload). Skipping a step
  creates nothing, so its onboarding flag stays incomplete; a step only advances
  after its API call succeeds (errors keep you on the step).
- **Dashboard setup checklist** mirrors onboarding completion (read from
  `/users/me`), refreshed on entry. It hides once every step is complete (fading
  out after a live completion). The welcome banner shows only while onboarding is
  incomplete.

## Sprint Progress

- **Sprint 1** ✅ — Auth, Onboarding, Dashboard shell
- **Sprint 2** ✅ — Messages (text/video/audio), Recipients, Release Manager,
  Photos & Documents, centralized API client
- **Sprint 3–10** — See sprint execution plan

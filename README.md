# Tether Web

Next.js frontend for Tether — Digital Legacy Platform

## Tech Stack

| Layer | Library / Service |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Auth & Storage | Supabase SSR (`@supabase/ssr`) |
| Video playback | Mux (`@mux/mux-player-react`) |
| Audio waveforms | WaveSurfer.js + `@wavesurfer/react` |
| Icons | Lucide React |
| Error monitoring | Sentry (`@sentry/nextjs`) |
| Analytics | PostHog (`posthog-js` + `posthog-js/react`) |
| HTML sanitization | DOMPurify (rich-text rendering) |
| Icons (extra) | React Icons |
| Billing | Stripe (`@stripe/stripe-js`) |
| Hosting | Vercel |

The frontend talks to a NestJS REST API. Every response uses one of two envelopes
(`{ success, data }` or `{ success: false, statusCode, message }`); `src/lib/api/client.ts`
is the single place that unwraps them. The route list and response contract live in the
[API repo README](https://github.com/Strugbits123/Tether-be#api-structure).

## Prerequisites

- Node.js 20+
- npm
- Access to 1Password Teams vault (Tether)

## Local Setup

```bash
git clone https://github.com/Strugbits123/Tether-fe.git
cd tether-web
npm install
cp .env.example .env.local   # fill in values from 1Password
npm run dev                  # http://localhost:3000
```

## Environment Variables

See `.env.example` for all required variables.
`NEXT_PUBLIC_*` variables are safe for the browser. Never commit `.env.local`.

## Branch Strategy

| Branch | Target | Environment |
|---|---|---|
| `feature/*` | → `develop` (via PR) | — |
| `develop` | → `Tether-Inc/Tether-Front-End` `develop` | Staging |
| `main` | → `Tether-Inc/Tether-Front-End` `main` | Production |

All PRs require CodeRabbit review before merge.

## Deployment

| Environment | Trigger | URL |
|---|---|---|
| Staging | Auto-deploy on `Tether-Inc/develop` update | https://staging.jointether.com |
| Production | Auto-deploy on `Tether-Inc/main` update | https://jointether.com |

## Project Structure

```
src/
├── app/
│   ├── (auth)/                  # Unauthenticated routes
│   │   ├── [mode]/              # Sign-in / sign-up (mode param)
│   │   ├── register/            # Registration
│   │   ├── verify-email/        # Email verification prompt
│   │   ├── update-password/     # Password reset
│   │   └── onboarding/          # 5-step onboarding wizard
│   ├── (dashboard)/             # Protected routes — shared sidebar + topbar layout
│   │   ├── dashboard/           # Home: stats, quick actions, activity feed
│   │   ├── messages/            # Messages: create/edit/play audio, video & text
│   │   ├── photos/              # Photos: upload, folders, lightbox, assign
│   │   ├── docs/                # Documents & files: upload, manage, assign
│   │   ├── story/               # Memoir: chapters (new/[id]), preview, settings
│   │   ├── access/              # Recipients & release manager management
│   │   ├── help/                # Feedback / support (bug, feature, general)
│   │   └── unassigned/          # Unassigned content: bulk assign / bulk delete
│   └── auth/callback/           # Supabase OAuth (PKCE) callback handler
├── components/
│   ├── ui/                      # Button, Input, Card, Badge, Spinner, Toast
│   ├── layout/                  # Sidebar, TopBar
│   ├── dashboard/               # Modals and widgets (see below)
│   ├── audio/                   # AudioPlayer, AudioRecorder, waveform components
│   ├── video/                   # VideoPlayer (Mux-backed, custom controls)
│   ├── messages/                # MessagePlayerHeader
│   ├── onboarding/              # Step1–Step5, CustomSelect
│   └── landing/                 # Marketing page sections
├── lib/
│   ├── supabase/                # Browser and server Supabase clients
│   ├── api/                     # Typed API client + per-resource modules (see below)
│   ├── posthog/                 # PostHogProvider + PostHogPageView (manual pageviews)
│   ├── attribution.ts           # First-touch UTM/referrer capture
│   ├── context/                 # AuthContext, ToastContext
│   └── utils/                   # assignments, retry, audio duration helpers
└── types/                       # Shared TypeScript types
```

## Pages

| Route | Description |
|---|---|
| `/` | Marketing landing page |
| `/(auth)/[mode]` | Sign-in / sign-up |
| `/(auth)/verify-email` | Email verification prompt + resend |
| `/(auth)/update-password` | Password reset |
| `/(auth)/onboarding` | 5-step guided onboarding wizard |
| `/(dashboard)/dashboard` | Home — stats, setup checklist, quick actions, activity |
| `/(dashboard)/messages` | Messages list — create, edit, read, play audio/video/text |
| `/(dashboard)/photos` | Photos — upload, folders, lightbox, edit, assign |
| `/(dashboard)/docs` | Documents & files — upload, manage, assign |
| `/(dashboard)/story` | Memoir — chapter list, editor (`new`, `[id]`), `preview`, `settings` |
| `/(dashboard)/access` | Recipients and release manager CRUD |
| `/(dashboard)/help` | Feedback & support — bug report, feature request, general feedback |
| `/(dashboard)/unassigned` | Unassigned content — filter by type, bulk assign/delete (the "Memoir" tab filters the `chapter` content type) |

## API Modules (`src/lib/api`)

| Module | Endpoints covered |
|---|---|
| `client.ts` | Base `request()`, `api.{get,post,patch,delete}`, `ApiError` |
| `users.ts` | `GET /users/me`, profile update |
| `recipients.ts` | `/recipients` CRUD |
| `release-managers.ts` | `/release-managers` CRUD |
| `messages.ts` | `/messages` CRUD, playback tokens, audio signed URLs, status polling |
| `documents.ts` | `/documents` — signed upload URLs, batch create, list, delete |
| `photos.ts` | `/photos` — signed upload URLs, batch create, list, delete |
| `chapters.ts` | `/chapters` — text/voice chapters, autosave, reorder, exhibits, assignments |
| `memoir.ts` | `/memoir` — preview, PDF/text export, per-chapter TTS narration |
| `content.ts` | `GET /content/unassigned`, `POST /content/bulk-assign`, `POST /content/bulk-delete` |
| `activity.ts` | `GET /activity` feed |
| `feedback.ts` | `/feedback` — screenshot upload URL, submit feedback |

`client.ts` is the **single source of truth** for success/failure. It unwraps `data` on
success and throws a typed `ApiError(statusCode, message)` for every failure class
(non-2xx, `success: false`, malformed body, network error). Call sites surface
`error.message` and branch on `error.statusCode`.

## Key Components (`src/components/dashboard`)

| Component | Purpose |
|---|---|
| `CreateMessageModal` | 3-step wizard (type → content → details) for new messages; `EditWizard` for edits |
| `AssignRecipientsModal` | Shared recipient assignment modal (groups + individuals) |
| `AddPhotosModal` | Photo upload with folder support |
| `AddRecipientsModal` | Recipient create/edit form |
| `AddReleaseManagerModal` | Release manager create/edit form |
| `FinishProfileModal` | Profile completion prompt |
| `QuickActions` | Dashboard quick-action cards |
| `SetupSteps` / `OnboardingWidget` | Setup checklist, mirrors onboarding completion |
| `WelcomeBanner` | Shown while onboarding is incomplete |
| `ActivityFeed` / `StatCard` | Dashboard data widgets |

## Auth Flow

Auth is **Supabase-direct** (`/auth/*` REST routes are not used); a single
`/auth/login` side-call syncs the backend after sign-in.

1. **Sign up** (email/password via `supabase.auth.signUp`):
   - Duplicate email → inline error + "Sign in instead".
   - Unverified → `/verify-email`.
   - Active session → `/onboarding`.
2. **Email confirmation / magic link / password reset** — all "check your inbox"
   screens have working resend.
3. **Google OAuth** → `/auth/callback` (PKCE code flow).
4. New user → `/onboarding`; returning user → `/dashboard`.

## Onboarding & Dashboard

- **Onboarding** (`Step1–Step5`) creates real resources via the API as you go
  (recipients, release manager, message, document/media upload). Skipping a step
  creates nothing; a step only advances after its API call succeeds.
- **Dashboard setup checklist** mirrors onboarding completion (read from
  `/users/me`), refreshed on entry. Hides once every step is complete.
- **Unassigned content** — items with only `assign_later` assignments (or none)
  surface on `/unassigned`; per-item and bulk assign/delete supported.

## Message Types

| Type | Recording | Player |
|---|---|---|
| Text | `WriteMessageStep` (contentEditable rich-text editor) | `ReadOnlyMessage` modal |
| Audio | `AudioRecorder` (WaveSurfer + MediaRecorder) | `AudioPlayer` (WaveSurfer, custom controls) |
| Video | `RecordStep` (MediaRecorder) | `VideoPlayer` (Mux, custom controls) |

## Security

- **Content-Security-Policy** (`next.config.ts`) uses explicit allowlists rather
  than a blanket `https:`. `connect-src` is limited to the API origin, Supabase,
  PostHog, Sentry, and Mux; `script-src` drops `'unsafe-eval'` in production and
  keeps it **only in development** (required by React's dev-mode tooling —
  removing it in dev throws an `eval() is not supported` console error). Also
  sets `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, a strict
  `Referrer-Policy`, and a restrictive `Permissions-Policy`. Changes require a
  dev-server restart (headers are computed at startup).
- **Route protection** — the `(dashboard)` group is gated by `middleware.ts`
  using server-validated `supabase.auth.getUser()`.
- **Auth tokens** — held by the Supabase browser client; the API client
  (`client.ts`) attaches `Authorization: Bearer <access_token>` per request.
- **Analytics/replay privacy** — PostHog (`src/lib/posthog/PostHogProvider.tsx`) runs
  with `person_profiles: 'identified_only'`, and session recording masks all inputs
  (`maskAllInputs`) and all text (`maskTextSelector: '*'`), so no user content is
  captured. Pageviews are captured manually (`capture_pageview: false` +
  `PostHogPageView`) so client-side route changes are tracked correctly. PostHog is
  a no-op when `NEXT_PUBLIC_POSTHOG_KEY` is unset (e.g. local dev).

## Sprint Progress

- **Sprint 1** ✅ — Auth, onboarding, dashboard shell
- **Sprint 2** ✅ — Messages (text/video/audio), recipients, release manager, photos & documents, centralised API client
- **Sprint 3** ✅ — Unassigned content page, message read/edit wizard, audio/video player polish, editorial write-message UI
- **Sprint 4** ✅ — Memoir (`/story`): chapter editor, voice chapters, preview, PDF/text export, TTS narration; feedback/help page; PostHog analytics + first-touch attribution
- **Sprint 5–10** — See sprint execution plan

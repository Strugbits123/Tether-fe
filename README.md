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
| Analytics | PostHog (`posthog-js`) |
| Billing | Stripe (`@stripe/stripe-js`) |
| Hosting | Vercel |

The frontend talks to a NestJS REST API. Every response uses one of two envelopes
(`{ success, data }` or `{ success: false, statusCode, message }`) — see
[`API_REFERENCE.md`](./API_REFERENCE.md) for the full contract.

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
│   │   ├── access/              # Recipients & release manager management
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
| `/(dashboard)/access` | Recipients and release manager CRUD |
| `/(dashboard)/unassigned` | Unassigned content — filter by type, bulk assign/delete |

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
| `content.ts` | `GET /content/unassigned`, `POST /content/bulk-assign`, `POST /content/bulk-delete` |
| `activity.ts` | `GET /activity` feed |

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

## Sprint Progress

- **Sprint 1** ✅ — Auth, onboarding, dashboard shell
- **Sprint 2** ✅ — Messages (text/video/audio), recipients, release manager, photos & documents, centralised API client
- **Sprint 3** ✅ — Unassigned content page, message read/edit wizard, audio/video player polish, editorial write-message UI
- **Sprint 4–10** — See sprint execution plan

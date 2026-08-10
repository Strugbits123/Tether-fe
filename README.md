# Tether Web

Next.js frontend for Tether — Digital Legacy Platform

## Tech Stack

| Layer             | Library / Service                                        |
| ----------------- | -------------------------------------------------------- |
| Framework         | Next.js 16 (App Router) + React 19 + TypeScript (strict) |
| Styling           | Tailwind CSS v4                                          |
| Auth & Storage    | Supabase SSR (`@supabase/ssr`)                           |
| Video playback    | Mux (`@mux/mux-player-react`)                            |
| Audio waveforms   | WaveSurfer.js + `@wavesurfer/react`                      |
| Icons             | Lucide React                                             |
| Error monitoring  | Sentry (`@sentry/nextjs`)                                |
| Analytics         | PostHog (`posthog-js` + `posthog-js/react`)              |
| HTML sanitization | DOMPurify (rich-text rendering)                          |
| Icons (extra)     | React Icons                                              |
| Billing           | Stripe (`@stripe/stripe-js`)                             |
| Hosting           | Vercel                                                   |

The frontend talks to a NestJS REST API. Every response uses one of two envelopes
(`{ success, data }` or `{ success: false, statusCode, message }`); `src/lib/api/client.ts`
is the single place that unwraps them.

## Prerequisites

- Node.js 20+
- npm

## Local Setup

```bash
git clone https://github.com/Strugbits123/Tether-fe.git
cd tether-web
npm install
cp .env.example .env.local
npm run dev                  # http://localhost:3000
```

## Environment Variables

See `.env.example` for all required variables.
`NEXT_PUBLIC_*` variables are safe for the browser. Never commit `.env.local`.

## Branch Strategy

| Branch      | Target                                    | Environment |
| ----------- | ----------------------------------------- | ----------- |
| `feature/*` | → `develop` (via PR)                      | —           |
| `develop`   | → `Tether-Inc/Tether-Front-End` `develop` | Staging     |
| `main`      | → `Tether-Inc/Tether-Front-End` `main`    | Production  |

All PRs require CodeRabbit review before merge.

## Deployment

| Environment | Trigger                                    | URL                            |
| ----------- | ------------------------------------------ | ------------------------------ |
| Staging     | Auto-deploy on `Tether-Inc/develop` update | https://staging.jointether.com |
| Production  | Auto-deploy on `Tether-Inc/main` update    | https://jointether.com         |

## Two Portals

The app serves two distinct experiences off the same session, chosen by which
**membership** is active:

- **Owner portal** (`(dashboard)` route group) — the account owner's own vault:
  messages, photos, documents, memoir, recipients, access management.
- **Release Manager portal** (`(rm)` route group, under `/rm/*`) — what a
  designated Release Manager (or Guardian) sees when acting on someone else's
  account: an overview, the release plan, recipient delivery status, a content
  download center, and notifications. A single person can hold both kinds of
  membership (their own owner account, plus RM duty on someone else's), switching
  between them via `/select-account`.

Which portal renders is resolved from `GET /auth/memberships` (see **Auth Flow**
below), not from the route alone — both `(dashboard)/layout.tsx` and
`(rm)/layout.tsx` independently verify the active membership actually matches
their portal before rendering anything, so one can never bleed into the other.

## Project Structure

```text
src/
├── app/
│   ├── (auth)/                     # Unauthenticated routes
│   │   ├── [mode]/                 # Sign-in / sign-up (mode param). Locks the email
│   │   │                            field when arriving via an invite link.
│   │   ├── register/               # Registration
│   │   ├── verify-email/           # Email verification prompt
│   │   ├── update-password/        # Password reset
│   │   └── onboarding/             # 5-step onboarding wizard (owner only)
│   ├── (dashboard)/                # Owner portal — shared sidebar + topbar layout.
│   │   │                            Guarded: renders nothing until the active
│   │   │                            membership is confirmed to be "owner".
│   │   ├── dashboard/              # Home: stats, quick actions, activity feed
│   │   ├── messages/               # Messages: create/edit/play audio, video & text
│   │   ├── photos/                 # Photos: upload, folders, lightbox, assign
│   │   ├── docs/                   # Documents & files: upload, manage, assign
│   │   ├── story/                  # Memoir: chapters (new/[id]), preview, settings
│   │   ├── access/                 # Recipients & release manager management (owner side)
│   │   ├── help/                   # Feedback / support — also reused, re-themed and
│   │   │                            re-contented, by the RM portal's Help page
│   │   └── unassigned/             # Unassigned content: bulk assign / bulk delete
│   ├── (rm)/                       # Release Manager portal — separate layout/sidebar.
│   │   │                            Server component resolves whether the RM has an
│   │   │                            owner account (for the "Create my Tether" promo)
│   │   │                            before first paint; client half re-verifies the
│   │   │                            active membership's portal is "release_manager".
│   │   ├── layout.tsx
│   │   ├── rm-layout-client.tsx
│   │   └── rm/
│   │       ├── overview/           # Dashboard: content stats, recent activity
│   │       ├── profile/            # My Profile — view saved / edit toggle. SMS opt-in,
│   │       │                        Age Group, and Status are hidden (not applicable)
│   │       ├── release-plan/       # The full step 1–5 release flow (live since Sprint 6)
│   │       ├── recipients/         # Recipient delivery/access status once a release exists
│   │       ├── downloads/          # Prepare & download a content package post-release
│   │       │   └── videos/         # Per-video download list. Thumbnails only — deliberately
│   │       │                        not playable, and there is no download-all
│   │       ├── schedule-override/  # Hidden QA page (unlinked). Moves a plan's delivery
│   │       │                        date so post-waiting-period steps can be tested
│   │       │                        without waiting 5 business days. Gated by a
│   │       │                        server-held secret — see Hidden Routes
│   │       ├── notifications/      # Announcements + activity feed; mark read/unread
│   │       │                        (never deleted)
│   │       ├── help/               # RM-specific FAQs/tutorials — not the owner's
│   │       └── create-account/     # Static "Create my Tether" promo (billing wiring TBD);
│   │                                only reachable if the RM has no owner account
│   ├── select-account/              # Multi-membership picker. Auto-redirects straight
│   │                                 into the only membership when there's exactly one —
│   │                                 the list UI only ever renders for 2+ memberships
│   ├── invitations/accept/[token]/  # Invite acceptance landing. Acceptance only fires
│   │                                 on an explicit button click, never as a side effect
│   │                                 of the page loading (the accept endpoint is a POST)
│   └── auth/callback/               # Supabase email-confirmation (token_hash) + OAuth
│                                     (PKCE) callback. Routes invite signups straight to
│                                     /select-account instead of the owner onboarding wizard
├── components/
│   ├── ui/                         # Button, Input, Card, Badge, Spinner, Toast
│   ├── layout/                     # Sidebar, TopBar
│   ├── dashboard/                  # Modals and widgets (see below)
│   ├── release-manager/            # RM portal components (see below)
│   ├── audio/                      # AudioPlayer, AudioRecorder, waveform components
│   ├── video/                      # VideoPlayer (Mux-backed, custom controls)
│   ├── messages/                   # MessagePlayerHeader
│   ├── onboarding/                 # Step1–Step5, CustomSelect
│   └── landing/                    # Marketing page sections
├── lib/
│   ├── supabase/                   # Browser + server Supabase clients; getAccessToken()
│   │                                 — shared token-fetch helper used across RM components
│   ├── api/                        # Typed API client + per-resource modules (see below)
│   ├── posthog/                    # PostHogProvider + PostHogPageView (manual pageviews)
│   ├── attribution.ts              # First-touch UTM/referrer capture
│   ├── relationship.ts             # Relationship label <-> backend enum mapping;
│   │                                 displayRelationship() for capitalized display
│   ├── context/                    # AuthContext (session + membership resolution), ToastContext
│   └── utils/                      # assignments, retry, audio duration helpers
└── types/                          # Shared TypeScript types
```

## Pages

| Route                        | Description                                                                                                   |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `/`                            | Marketing landing page                                                                                         |
| `/(auth)/[mode]`               | Sign-in / sign-up — locks the email field when the URL carries an `invite_token`                               |
| `/(auth)/verify-email`         | Email verification prompt + resend                                                                             |
| `/(auth)/update-password`      | Password reset                                                                                                 |
| `/(auth)/onboarding`            | 5-step guided onboarding wizard (owner only)                                                                    |
| `/(dashboard)/dashboard`        | Owner home — stats, setup checklist, quick actions, activity                                                    |
| `/(dashboard)/messages`         | Messages list — create, edit, read, play audio/video/text                                                      |
| `/(dashboard)/photos`           | Photos — upload, folders, lightbox, edit, assign                                                                |
| `/(dashboard)/docs`             | Documents & files — upload, manage, assign                                                                      |
| `/(dashboard)/story`            | Memoir — chapter list, editor (`new`, `[id]`), `preview`, `settings`                                            |
| `/(dashboard)/access`           | Recipients and release manager CRUD (owner side)                                                                |
| `/(dashboard)/help`             | Feedback & support — bug report, feature request, general feedback                                             |
| `/(dashboard)/unassigned`       | Unassigned content — filter by type, bulk assign/delete (the "Memoir" tab filters the `chapter` content type) |
| `/rm/overview`                  | Release Manager dashboard — content stats, recent activity                                                      |
| `/rm/profile`                   | RM's own profile (view saved / edit toggle)                                                                     |
| `/rm/release-plan`              | Full release flow — initiate, notifications, waiting period, delivery, completion                               |
| `/rm/recipients`                | Recipient delivery/access status                                                                                |
| `/rm/downloads`                 | Prepare and download a released content package (everything except video)                                       |
| `/rm/downloads/videos`          | Per-video download list with thumbnails — not playable, no download-all                                         |
| `/rm/schedule-override`         | **Hidden/unlinked** QA page — change a plan's delivery date (password-gated server-side)                        |
| `/rm/notifications`             | Announcements + activity feed; mark read/unread (never deleted)                                                 |
| `/rm/help`                      | RM-specific Help Center (same shared component as `/help`, re-themed + re-contented)                            |
| `/rm/create-account`            | "Create my Tether" promo — only reachable/visible if the RM has no owner account                                |
| `/select-account`               | Multi-membership picker — skipped automatically when there's only one membership                                |
| `/invitations/accept/[token]`   | Invite acceptance — explicit button click, not an auto-run side effect of the page load                         |

## API Modules (`src/lib/api`)

| Module                | Endpoints covered                                                                                              |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `client.ts`           | Base `request()`, `api.{get,post,patch,delete}`, `ApiError`, `buildAuthHeaders()`                                  |
| `users.ts`            | `GET /users/me`, profile update                                                                                    |
| `recipients.ts`       | `/recipients` CRUD                                                                                                  |
| `release-managers.ts` | `/release-managers` CRUD                                                                                            |
| `messages.ts`         | `/messages` CRUD, playback tokens, audio signed URLs, status polling                                                |
| `documents.ts`        | `/documents` — signed upload URLs, batch create, list, delete                                                       |
| `photos.ts`           | `/photos` — signed upload URLs, batch create, list, delete                                                          |
| `chapters.ts`         | `/chapters` — text/voice chapters, autosave, reorder, exhibits, assignments                                         |
| `memoir.ts`           | `/memoir` — preview, PDF/text export, per-chapter TTS narration                                                     |
| `content.ts`          | `GET /content/unassigned`, `POST /content/bulk-assign`, `POST /content/bulk-delete`                                 |
| `activity.ts`         | `GET /activity` feed                                                                                                |
| `feedback.ts`         | `/feedback` — screenshot upload URL, submit feedback                                                                |
| `access.ts`           | `/access/*` — owner-side recipient/guardian/release-manager management, overview                                   |
| `invitations.ts`      | `/invitations/*` — send/resend/revoke invites, `acceptInvitation` (token-based accept)                              |
| `memberships.ts`      | `/auth/memberships`, `switchContext`, `getActiveContext`, `hasOwnerMembership`                                      |
| `rm.ts`               | `/rm/*` — overview, release-plan (incl. `overrideDeliverySchedule`), recipients, notifications, downloads (incl. `getDownloadableVideos`). Includes raw-`fetch` ZIP/PDF streaming that intentionally bypasses the JSON envelope client, and the one call that needs a custom header |

`client.ts` is the **single source of truth** for success/failure. It unwraps `data` on
success and throws a typed `ApiError(statusCode, message)` for every failure class
(non-2xx, `success: false`, malformed body, network error). Call sites surface
`error.message` and branch on `error.statusCode`. `buildAuthHeaders()` centralizes the
`Authorization` + `X-Account-Context` header logic so raw-`fetch` callers (binary
downloads) never drift from the JSON client's behavior.

## Key Components

**`src/components/dashboard`**

| Component                    | Purpose                                                                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `CreateMessageModal`          | 3-step wizard (type → content → details) for new messages; `EditWizard` for edits                                                            |
| `AssignRecipientsModal`       | Shared recipient assignment modal (groups + individuals)                                                                                     |
| `AddPhotosModal`              | Photo/document upload with folder support; picks a per-file preview icon (image/audio/video/document/other) instead of one generic icon      |
| `AddRecipientsModal`          | Recipient create/edit form — no phone field collected here                                                                                    |
| `AddReleaseManagerModal`      | Release manager create/edit form — no phone field collected here (the RM sets their own from their portal's My Profile)                       |
| `ReleaseManagerConsentModal`  | Legal-notice gate before designating/changing an RM — dialog semantics, focus trap, synchronous reset on reopen                               |
| `FinishProfileModal`          | Shared profile form — modal (onboarding) or `embedded` (owner "Finish Your Profile" / RM "My Profile"); `hideSmsOptIn` / `hideAgeAndStatus` / `onEdit` props tailor it per portal |
| `QuickActions`                | Dashboard quick-action cards, plus "See Unassigned Content" with a live count badge (hidden at 0 and while loading; refetches on `ACTIVITY_REFRESH_EVENT`) |
| `SetupSteps` / `OnboardingWidget` | Setup checklist, mirrors onboarding completion                                                                                           |
| `WelcomeBanner`               | Shown while onboarding is incomplete                                                                                                          |
| `ActivityFeed` / `StatCard`   | Dashboard data widgets                                                                                                                        |

**`src/components/release-manager`**

| Component               | Purpose                                                                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ReleaseManagerSidebar` | RM portal nav — content stats, polled unread-notification badge; "Switch Account" only shown with 2+ memberships; "Create my Tether" only shown with no owner account. "Download everything" is a collapsible group with two children (videos / other content), since the two downloads work differently |
| `RequestGuardianModal`  | Two-step "ask a Guardian to complete the release" flow                                                                                                       |
| `release-plan/*`        | Step1–Step5 views + header/constants for the release-plan flow                                                                                               |

## Auth Flow

Auth primitives (sign up/in, session, email verification) are **Supabase-direct**, but
membership/portal resolution goes through the backend's `/auth/*` REST routes — that's the
only place with service-role access to `account_memberships`. That table's RLS has **no
read policy**, so a frontend Supabase query against it always returns empty, even for the
caller's own rows. (This bit us once — `auth/callback/route.ts` now calls the backend's
`GET /auth/pending-invite-check` instead of querying Supabase directly, for exactly this
reason.)

1. **Sign up** (`POST /auth/signup`, wrapping `supabase.auth.signUp`):
   - Duplicate email → inline error + "Sign in instead".
   - Via an invite link (`?invite_token=...`) → the invited email is prefilled and
     **locked** in the form (tooltip explains why), and the backend skips
     auto-creating an owner self-membership for that signup — they're joining purely
     as RM/Guardian/Recipient, not becoming an account owner.
   - Unverified → `/verify-email`.
2. **Email confirmation / magic link / password reset** (`auth/callback/route.ts`,
   `token_hash` flow) — checks `GET /auth/pending-invite-check` first. If this signup
   came from an invite, redirects straight to `/select-account` instead of the owner
   onboarding wizard. Otherwise: existing owner → `/dashboard` or `/onboarding`
   depending on completion.
3. **Google OAuth** → `/auth/callback` (PKCE `code` flow) — same invite check applies.
4. **Membership resolution** (`AuthContext.resolveMembership`, runs once per session):
   calls `GET /auth/memberships`.
   - Exactly one membership → switches into it directly (`/dashboard` for an owner,
     `/rm/overview` for a Release Manager) — no intermediate picker screen.
   - More than one → `/select-account`, which itself re-checks on load and
     auto-redirects if the count has since dropped to one (e.g. right after an
     invite was just accepted).
   - A stored `active_membership` from a prior session is re-validated
     (`getActiveContext`) rather than trusted blindly. A returning user who
     re-authenticates from `/signin` with a still-valid stored membership is routed
     onward instead of being left stuck on the sign-in page.
5. **Invitation acceptance** (`/invitations/accept/[token]`) — requires an explicit
   "Accept invitation" click. The accept endpoint is a `POST` (it was moved off `GET`
   precisely because it mutates), and acceptance must never fire just because the page
   loaded — link previews and prefetchers would trip it. If not logged in, redirects to
   `/signin` instead of `/signup` when the invited email already belongs to an
   existing user (signing up again would always 409). The accepting user's email is
   verified server-side against the invite before it's honored.
6. **Portal guards** — both `(dashboard)/layout.tsx` and `(rm)/layout.tsx` verify the
   active membership's portal client-side and render **nothing** until confirmed, so
   a Release Manager with no owner account can never even briefly see the owner
   dashboard shell (or vice versa).

## Onboarding & Dashboard

- **Onboarding** (`Step1–Step5`) creates real resources via the API as you go
  (recipients, release manager, message, document/media upload). Skipping a step
  creates nothing; a step only advances after its API call succeeds. Phone number is
  not collected on the release-manager step — the RM sets their own later.
- **Dashboard setup checklist** mirrors onboarding completion (read from
  `/users/me`), refreshed on entry. Hides once every step is complete.
- **Unassigned content** — items with only `assign_later` assignments (or none)
  surface on `/unassigned`; per-item and bulk assign/delete supported.

## Message Types

| Type  | Recording                                             | Player                                      |
| ----- | ------------------------------------------------------ | -------------------------------------------- |
| Text  | `WriteMessageStep` (contentEditable rich-text editor) | `ReadOnlyMessage` modal                      |
| Audio | `AudioRecorder` (WaveSurfer + MediaRecorder)          | `AudioPlayer` (WaveSurfer, custom controls)  |
| Video | `RecordStep` (MediaRecorder, "Record up to 5 minutes") | `VideoPlayer` (Mux, custom controls)        |

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
  using server-validated `supabase.auth.getUser()`, *and* by a client-side
  membership-portal check in its layout (see Auth Flow, step 6). The `(rm)` group
  has the equivalent client-side guard plus a server-side pre-check for the
  "Create my Tether" promo's visibility.
- **Auth tokens** — held by the Supabase browser client; the API client
  (`client.ts`) attaches `Authorization: Bearer <access_token>` per request, plus
  `X-Account-Context: <membership_id>` from `localStorage` so the backend knows
  which membership a multi-account user is currently acting as.
- **Invitation integrity** — accepting an invite while logged in requires the
  authenticated user's email to match the invite's `invite_email`; a mismatch is
  rejected server-side rather than silently letting a signed-in user claim someone
  else's pending invite.
- **Analytics/replay privacy** — PostHog (`src/lib/posthog/PostHogProvider.tsx`) runs
  with `person_profiles: 'identified_only'`, and session recording masks all inputs
  (`maskAllInputs`) and all text (`maskTextSelector: '*'`), so no user content is
  captured. Pageviews are captured manually (`capture_pageview: false` +
  `PostHogPageView`) so client-side route changes are tracked correctly. PostHog is
  a no-op when `NEXT_PUBLIC_POSTHOG_KEY` is unset (e.g. local dev).

## Hidden Routes

`/rm/schedule-override` is deliberately unlinked — no nav entry points at it, and
it's reachable only by typing the URL. **Being hidden is not the security
control.** The gate is a password the page never stores or knows: it is sent as
an `x-release-override-secret` header and compared server-side against
`RELEASE_SCHEDULE_OVERRIDE_SECRET`. On any environment where that variable is
unset the API returns 404, so the page is inert in production. Every successful
override is written to the release activity log.

It exists so the steps after the five-business-day waiting period can be tested
without waiting five real days.

## Build & Deploy Notes

Type checking is **not** part of `next build` (`typescript.ignoreBuildErrors` in
`next.config.ts`). This is not a lowering of standards — the identical
`tsc --noEmit` runs in CI (`.github/workflows/typecheck.yml`) on every push and
PR, so a type error blocks the PR rather than the deploy. If you remove that
workflow, re-enable checking in the config.

`npm run lint` also runs in CI but is **advisory** (`continue-on-error`), because
the repo carries ~43 pre-existing eslint errors that predate the workflow.
Blocking on them would fail every PR for problems it didn't introduce. Clear the
backlog, then make it blocking. Note that Next 16 removed build-time ESLint
entirely — there is no `eslint` key in `NextConfig` and no `next lint` command.

Two hard-won constraints, both of which cost a day each:

- **Do not add `experimental: { cpus, memoryBasedWorkersCount }`.** Those were
  tried to reduce build memory and instead made Turbopack emit **no application
  output** — `.next/static` and `.next/server` both empty — while `next build`
  still exited 0 and printed a full route table. Vercel then hung on "Deploying
  outputs…" and failed with no error, because the build had technically
  succeeded. Measured on an identical commit: 0.9 MB / 0 files with the block,
  49 MB / 1039 without.
- **The Sentry build plugin's `runAfterProductionCompile` hook walks all of
  `.next`** and once ran ~12 minutes before being OOM-killed. The options in
  `sentryBuildOptions` (`widenClientFileUpload: false`, `sourcemaps.disable`,
  `release.create: false`, `telemetry: false`) cut it to ~1.5s. Note that
  `sourcemaps.disable` alone is not enough — in `@sentry/nextjs` 10.60.0 it only
  guards `injectDebugIds`, while `uploadSourcemaps` and `deleteArtifacts` run
  unconditionally. `SENTRY_DISABLE_PLUGIN=1` skips the wrapper entirely as an
  escape hatch; runtime error reporting is unaffected either way, since that
  comes from `instrument.ts` / `sentry.*.config.ts`.

If a deploy builds successfully but then stalls on "Deploying outputs…", check
the build machine size before changing any config — a 4-core/8 GB builder was
the actual cause once, and every config change made to chase it was a red
herring.

## Known Follow-ups

- `/rm/create-account` is a static promo/signup form — billing isn't wired up yet.
- ~43 pre-existing eslint errors (mostly `react-hooks/set-state-in-effect` and
  `no-explicit-any`) keep CI lint advisory rather than blocking.

## Sprint Progress

- **Sprint 1** ✅ — Auth, onboarding, dashboard shell
- **Sprint 2** ✅ — Messages (text/video/audio), recipients, release manager, photos & documents, centralised API client
- **Sprint 3** ✅ — Unassigned content page, message read/edit wizard, audio/video player polish, editorial write-message UI
- **Sprint 4** ✅ — Memoir (`/story`): chapter editor, voice chapters, preview, PDF/text export, TTS narration; feedback/help page; PostHog analytics + first-touch attribution
- **Sprint 5** ✅ — Release Manager portal (`/rm/*`): overview, recipients, notifications, content downloads, RM-specific Help Center; multi-membership auth flow (`/select-account`, `/invitations/accept/[token]`); portal guards on both `(dashboard)` and `(rm)`; invite-signup email locking and redirect fixes
- **Sprint 6** ✅ — Release plan live end to end (`/rm/release-plan` steps 1–5, cancel, guardian escalation, activity log + PDF report); downloads split into a content ZIP and a separate per-video download page (`/rm/downloads/videos`) with a collapsible sidebar group; unassigned-content count badge; hidden `/rm/schedule-override` QA page; `M/D/YYYY` date format across the release module; HEIC upload support; portal-rendered docs tooltip; Guardian cap lowered to 2; favicon; Vercel build fixes (Sentry hook, CI typecheck)
- **Sprint 7–10** — See sprint execution plan

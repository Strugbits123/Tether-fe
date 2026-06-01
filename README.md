# Tether Web

Next.js frontend for Tether — Digital Legacy Platform

## Tech Stack

- **Next.js 16** + TypeScript (strict mode)
- **Tailwind CSS v4**
- **Supabase SSR** (`@supabase/ssr`)
- **Sentry** (`@sentry/nextjs`)
- **Lucide React** (icons)
- **Vercel** (hosting)

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
│   ├── (auth)/          # Auth pages — login, signup, onboarding
│   ├── (dashboard)/     # Protected dashboard pages
│   └── auth/callback/   # Supabase OAuth callback handler
├── components/
│   ├── ui/              # Reusable UI components
│   ├── dashboard/       # Dashboard-specific components
│   ├── layout/          # Sidebar, TopBar
│   └── onboarding/      # Onboarding step components
├── lib/
│   ├── supabase/        # Browser and server Supabase clients
│   ├── api/             # NestJS API client
│   └── context/         # AuthContext, ToastContext
└── types/               # Shared TypeScript types
```

## Auth Flow

1. Signup → `/verify-email` (email confirmation required)
2. Click email link → `/auth/callback` (token_hash flow)
3. New user → `/onboarding`
4. Returning user → `/dashboard`
5. Google OAuth → `/auth/callback` (PKCE code flow)

## Sprint Progress

- **Sprint 1** ✅ — Auth, Onboarding, Dashboard shell
- **Sprint 2** 🔄 — Message Recorder (upcoming)
- **Sprint 3–10** — See sprint execution plan

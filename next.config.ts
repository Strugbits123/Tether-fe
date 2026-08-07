import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  async headers() {
    // In development (and any non-HTTPS backend like the current staging API),
    // the browser must be allowed to reach http://localhost and ws://localhost.
    // In production the API/Supabase are HTTPS, covered by `https:`/`wss:`.
    const isDev = process.env.NODE_ENV !== "production";
    const apiOrigin = process.env.NEXT_PUBLIC_API_URL
      ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
      : "";
    // Explicit allowlist instead of a blanket `https:` — limits where an
    // injected script could exfiltrate tokens to.
    const connectSrc = [
      "'self'",
      // WaveSurfer fetch()es recorded-clip blob: URLs to decode the playback
      // waveform; fetch is governed by connect-src, so blob: must be allowed.
      'blob:',
      apiOrigin,
      "https://*.supabase.co",
      "wss://*.supabase.co",
      "https://*.posthog.com",
      "https://*.i.posthog.com",
      "https://*.sentry.io",
      "https://*.ingest.us.sentry.io",
      "https://*.mux.com",
      ...(isDev ? ["http://localhost:*", "ws://localhost:*"] : []),
    ]
      .filter(Boolean)
      .join(" ");

    // React/Next dev mode requires 'unsafe-eval'; production never uses eval,
    // so it is dropped there.
    const scriptSrc = [
      "'self'",
      "'unsafe-inline'",
      ...(isDev ? ["'unsafe-eval'"] : []),
      "https://*.posthog.com",
      "https://*.i.posthog.com",
      "https://*.sentry.io",
      "https://*.mux.com",
    ].join(" ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Allow same-origin camera/mic so getUserMedia() works for the
          // audio/video recorders; still deny cross-origin (and geolocation).
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // 'unsafe-eval' is dev-only (see scriptSrc). 'unsafe-inline' is
              // still required until Next inline bootstrap scripts move to a
              // nonce-based CSP.
              `script-src ${scriptSrc}`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "media-src 'self' blob: https:",
              "worker-src 'self' blob:",
              `connect-src ${connectSrc}`,
              "font-src 'self' data:",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

// Sentry's build plugin registers a `runAfterProductionCompile` hook that walks
// the whole .next directory. On the 4-core/8GB Vercel builder that step ran for
// ~12 minutes and was then OOM-killed (SIGKILL). The Turbopack compile itself
// finishes in ~60s and a full type check is ~15s, so this hook was the entire
// problem — not TypeScript, which is where the earlier (cached) build happened
// to be standing when the container hit its memory ceiling.
//
// `sourcemaps.disable: true` alone does NOT prevent it. In @sentry/nextjs
// 10.60.0 that flag only guards `injectDebugIds`; `uploadSourcemaps([distDir])`
// and `deleteArtifacts()` are called unconditionally straight after it — see
// build/cjs/config/handleRunAfterProductionCompile.js. The options below cut the
// work that hook actually performs.
//
// SENTRY_DISABLE_PLUGIN=1 skips the wrapper entirely, as an escape hatch for
// unblocking a deploy without a code change. Runtime error reporting is
// unaffected either way — that comes from instrument.ts / sentry.*.config.ts,
// not from this build plugin.
const sentryBuildOptions = {
  org: "tether-inc",
  project: "tether-web",
  silent: true,
  // Was `true`, which widens the set of files the plugin globs and uploads. With
  // source maps disabled there is nothing to widen — it only enlarged the walk.
  widenClientFileUpload: false,
  tunnelRoute: "/monitoring",
  sourcemaps: { disable: true },
  // Both make network calls during the build. Releases aren't consumed anywhere
  // (source maps are off, so there are no artifacts to associate with one), and
  // a slow or unreachable Sentry API stalls the build rather than failing fast.
  release: { create: false },
  telemetry: false,
  webpack: {
    treeshake: { removeDebugLogging: true },
    automaticVercelMonitors: true,
  },
};

export default process.env.SENTRY_DISABLE_PLUGIN === "1"
  ? nextConfig
  : withSentryConfig(nextConfig, sentryBuildOptions);

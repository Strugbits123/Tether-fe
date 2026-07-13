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
      "blob:",
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

export default withSentryConfig(nextConfig, {
  org: "tether-inc",
  project: "tether-web",
  silent: true,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  sourcemaps: { disable: true },
  webpack: {
    treeshake: { removeDebugLogging: true },
    automaticVercelMonitors: true,
  },
});

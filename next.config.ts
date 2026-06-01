import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  org: 'tether-inc',
  project: 'tether-web',
  silent: true,
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
  sourcemaps: { disable: true },
  webpack: {
    treeshake: { removeDebugLogging: true },
    automaticVercelMonitors: true,
  },
})

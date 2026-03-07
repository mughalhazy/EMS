import type { NextConfig } from 'next'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const nextConfig: NextConfig = {
  output: 'standalone',

  // Skip type and lint checks during Docker build — run them in CI separately
  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },

  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${API_URL}/api/v1/:path*`,
      },
    ]
  },

  images: {
    remotePatterns: [],
  },
}

export default nextConfig

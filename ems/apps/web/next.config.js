/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },

  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiUrl}/api/v1/:path*`,
      },
    ]
  },

  images: {
    remotePatterns: [],
  },
}

module.exports = nextConfig

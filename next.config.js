/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  },
  async rewrites() {
    return [
      // Handle API routes except auth and upload
      {
        source: '/api/:path*',
        destination: 'http://localhost:5001/api/:path*',
        has: [
          {
            type: 'header',
            key: 'x-skip-rewrite',
            value: 'true',
          },
        ],
      },
      // Keep these routes handled by Next.js
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      {
        source: '/api/upload',
        destination: '/api/upload',
      },
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      }
    ];
  },
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  // Development-specific options
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Improve HMR in development mode
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300, // Delay before rebuilding
        ignored: ['**/node_modules', '**/.git', '**/dist'],
      };
    }
    return config;
  },
  // Configure static file serving
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
    ],
  },
  // Configure static file serving
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/upload/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Next.js 13+ doesn't require swcMinify option
};

module.exports = nextConfig;
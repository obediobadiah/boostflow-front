/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  },
  async rewrites() {
    return [
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
      {
        source: '/api/upload',
        destination: '/api/upload',
      },
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
  // Next.js 13+ doesn't require swcMinify option
};

module.exports = nextConfig;
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@moimi/core'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd3dbvb22maaxgy.cloudfront.net',
        port: '',
        pathname: '/info-posts/image/**',
      },
    ],
  },
};

export default nextConfig;

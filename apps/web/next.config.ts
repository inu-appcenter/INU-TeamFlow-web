import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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

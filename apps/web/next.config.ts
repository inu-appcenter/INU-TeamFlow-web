import type { NextConfig } from 'next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
      {
        protocol: 'https',
        hostname: 'd3dbvb22maaxgy.cloudfront.net',
        port: '',
        pathname: '/teams/**',
      },
    ],
  },

  // 개발 환경: /api/v1 요청을 백엔드로 프록시
  // localhost와 백엔드 도메인이 서로 다른 사이트라 SameSite=Lax 쿠키(refreshToken)가
  // 막히는 문제를, 같은 출처 요청으로 만들어서 우회
  async rewrites() {
    if (process.env.NODE_ENV !== 'development' || !API_BASE_URL) return [];

    return [
      {
        source: '/api/v1/:path*',
        destination: `${API_BASE_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;

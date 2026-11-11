import { createAxiosInstance } from '@moimi/core/api/createAxiosInstance';
import { setApiClient } from '@moimi/core/api/client';
import { ROUTES } from '@moimi/core/constants/routes';

import { resetAnalyticsIdentity } from '@/lib/analytics';
import { installAnalyticsInterceptors } from '@/lib/analytics/http';

// 개발 환경은 next.config rewrites 프록시를 타도록 같은 출처로 요청
const API_BASE =
  process.env.NODE_ENV === 'development'
    ? ''
    : process.env.NEXT_PUBLIC_API_BASE_URL;

const axiosInstance = createAxiosInstance({
  baseURL: `${API_BASE}/api/v1`,

  tokenStorage: {
    getToken: () => localStorage.getItem('accessToken'),

    setToken: (token) => {
      localStorage.setItem('accessToken', token);
    },

    removeToken: () => {
      resetAnalyticsIdentity();
      localStorage.removeItem('accessToken');
    },
    // refresh token은 HttpOnly 쿠키로 브라우저가 관리 → get/setRefreshToken 없음
  },

  authRedirect: {
    getCurrentPath: () => window.location.pathname,

    redirectToLogin: () => {
      window.location.href = ROUTES.LOGIN;
    },
  },
});

installAnalyticsInterceptors(axiosInstance);
setApiClient(axiosInstance);

export default axiosInstance;

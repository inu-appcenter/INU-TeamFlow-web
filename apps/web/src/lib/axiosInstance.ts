import { createAxiosInstance } from '@moimi/core/api/createAxiosInstance';
import { setApiClient } from '@moimi/core/api/client';
import { ROUTES } from '@moimi/core/constants/routes';

import { resetAnalyticsIdentity } from '@/lib/analytics';
import { installAnalyticsInterceptors } from '@/lib/analytics/http';

const axiosInstance = createAxiosInstance({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1`,

  tokenStorage: {
    getToken: () => localStorage.getItem('accessToken'),

    removeToken: () => {
      resetAnalyticsIdentity();
      localStorage.removeItem('accessToken');
    },
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

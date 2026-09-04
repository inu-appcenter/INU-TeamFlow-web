import { createAxiosInstance } from '@moimi/core/api/createAxiosInstance';
import { setApiClient } from '@moimi/core/api/client';
import { ROUTES } from '@moimi/core/constants/routes';

const axiosInstance = createAxiosInstance({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1`,
  tokenStorage: {
    getToken: () => localStorage.getItem('accessToken'),
    removeToken: () => localStorage.removeItem('accessToken'),
  },
  authRedirect: {
    getCurrentPath: () => window.location.pathname,
    redirectToLogin: () => {
      window.location.href = ROUTES.LOGIN;
    },
  },
});

setApiClient(axiosInstance);

export default axiosInstance;

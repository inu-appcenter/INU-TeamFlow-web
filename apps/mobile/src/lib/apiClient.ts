import { createAxiosInstance } from "@moimi/core/api/createAxiosInstance";
import { setApiClient } from "@moimi/core/api/client";
import { secureTokenStorage } from "./tokenStorage";
import { mobileAuthRedirect } from "./authRedirect";

const axiosInstance = createAxiosInstance({
  baseURL: `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/v1`,
  tokenStorage: secureTokenStorage,
  authRedirect: mobileAuthRedirect,
});

setApiClient(axiosInstance);

export default axiosInstance;

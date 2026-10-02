import { router } from "expo-router";
import type { AuthRedirect } from "@moimi/core/api/createAxiosInstance";
import { ROUTES } from "@moimi/core/constants/routes";

let currentPath = "/";

export const setCurrentPath = (path: string) => {
  currentPath = path;
};

export const mobileAuthRedirect: AuthRedirect = {
  getCurrentPath: () => currentPath,
  redirectToLogin: () => {
    router.replace(ROUTES.LOGIN as never);
  },
};

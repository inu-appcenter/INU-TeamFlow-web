import type { AnalyticsHttpRoute } from "@moimi/core/types/analyticsHttp";

export const ANALYTICS_HTTP_ROUTES: readonly AnalyticsHttpRoute[] = [
  {
    method: "post",
    pattern: /^\/recruitments\/(\d+)\/applications$/,
    operation: "application_submit",
  },
  {
    method: "post",
    pattern: /^\/(recruitments|info-posts)\/(\d+)\/scraps$/,
    operation: "scrap_add",
  },
  {
    method: "delete",
    pattern: /^\/(recruitments|info-posts)\/(\d+)\/scraps$/,
    operation: "scrap_remove",
  },
];

import type { AnalyticsOperation } from "@moimi/core/types/analytics";

export interface AnalyticsHttpRoute {
  method: "post" | "delete";
  pattern: RegExp;

  operation: Extract<
    AnalyticsOperation,
    "application_submit" | "scrap_add" | "scrap_remove"
  >;
}

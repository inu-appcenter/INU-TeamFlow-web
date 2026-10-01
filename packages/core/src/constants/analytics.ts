import type {
  AnalyticsInteractionType,
  AnalyticsOperation,
} from "../types/analytics";

export const ANALYTICS_SCHEMA_VERSION = 1;

export const ANALYTICS_EVENTS = {
  SIGNUP_ENTERED: "signup_entered",
  FEATURE_VIEWED: "feature_viewed",
  POST_VIEWED: "post_viewed",
  POST_SCRAPPED: "post_scrapped",
  SCHOOL_VERIFIED: "school_verified",
  TEAM_CREATED: "team_created",
  TEAM_ACTIVITY_COMPLETED: "team_activity_completed",
  ACTION_ATTEMPTED: "action_attempted",
  ACTION_SUCCEEDED: "action_succeeded",
  ACTION_FAILED: "action_failed",
  ACTION_CANCELLED: "action_cancelled",
} as const;

export const ANALYTICS_OUTCOME_EVENTS = {
  succeeded: ANALYTICS_EVENTS.ACTION_SUCCEEDED,
  failed: ANALYTICS_EVENTS.ACTION_FAILED,
  cancelled: ANALYTICS_EVENTS.ACTION_CANCELLED,
} as const;

export const ANALYTICS_OPERATION_INTERACTIONS = {
  login: "authentication",
  signup: "authentication",
  school_verify: "authentication",

  recruitment_create: "creation",
  recruitment_update: "management",
  recruitment_delete: "management",

  info_post_create: "creation",
  info_post_update: "management",
  info_post_delete: "management",

  application_submit: "participation",
  scrap_add: "participation",
  scrap_remove: "management",

  team_create: "creation",
  notice_create: "creation",
  calendar_create: "creation",
  vote_create: "creation",
  vote_participate: "participation",
  message_send: "participation",
} as const satisfies Record<AnalyticsOperation, AnalyticsInteractionType>;

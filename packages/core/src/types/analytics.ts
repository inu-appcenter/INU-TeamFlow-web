export type AnalyticsFeature =
  | "auth"
  | "recruitment"
  | "info_post"
  | "team"
  | "chat"
  | "notification"
  | "mypage"
  | "other";

export type AnalyticsOperation =
  | "login"
  | "signup"
  | "school_verify"
  | "recruitment_create"
  | "recruitment_update"
  | "recruitment_delete"
  | "info_post_create"
  | "info_post_update"
  | "info_post_delete"
  | "application_submit"
  | "scrap_add"
  | "scrap_remove"
  | "team_create"
  | "notice_create"
  | "calendar_create"
  | "vote_create"
  | "vote_participate"
  | "message_send";

export interface AnalyticsContext {
  feature: AnalyticsFeature;
  post_type?: "recruitment" | "info_post";
  post_id?: string | number;
  category?: string;
  team_id?: string | number;
  activity_type?:
    | "notice_create"
    | "calendar_create"
    | "vote_create"
    | "vote_participate"
    | "message_send";
}

export interface PostContext extends AnalyticsContext {
  post_type: "recruitment" | "info_post";
  post_id: string | number;
  category: string;
}

export interface EventMap {
  post_viewed: PostContext;

  post_scrapped: AnalyticsContext & {
    post_type: "recruitment" | "info_post";
    post_id: string | number;
  };

  school_verified: AnalyticsContext;

  team_created: AnalyticsContext & {
    team_id: string | number;
  };

  team_activity_completed: AnalyticsContext & {
    team_id: string | number;
    activity_type: NonNullable<AnalyticsContext["activity_type"]>;
  };
}

export type FailureKind =
  | "validation"
  | "http"
  | "network"
  | "timeout"
  | "unknown";

export interface FailureDetails {
  kind?: FailureKind;
  reason_code?: string;
  server_error_code?: string;
}

export type AnalyticsOutcome = "succeeded" | "failed" | "cancelled";

export interface AnalyticsAttempt {
  attemptId: string;
  succeed: () => void;
  fail: (error: unknown, details?: FailureDetails) => void;
  cancel: () => void;
}

export interface AnalyticsContext {
  feature: AnalyticsFeature;

  attempt_scope?: "submission" | "api_request" | "message_send";
  auth_flow?: "manual_login" | "signup_auto_login";

  post_type?: "recruitment" | "info_post";
  post_id?: string | number;
  category?: string;
  team_id?: string | number;

  activity_type?:
    | "notice_create"
    | "calendar_create"
    | "vote_create"
    | "vote_participate"
    | "message_send";
}

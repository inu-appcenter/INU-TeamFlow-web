export type AnalyticsFeature =
  | "auth"
  | "recruitment"
  | "info_post"
  | "team"
  | "chat"
  | "notification"
  | "mypage"
  | "other";

export type AnalyticsInteractionType =
  | "view"
  | "creation"
  | "participation"
  | "management"
  | "authentication";

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

  attempt_scope?: "submission" | "api_request" | "message_send";
  auth_flow?: "manual_login" | "signup_auto_login";
  interaction_type?: AnalyticsInteractionType;

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

/** API 성공 후 알게 된 ID 등을 성공 이벤트에 추가한다. */
export type AnalyticsSuccessContext = Partial<
  Pick<
    AnalyticsContext,
    "post_type" | "post_id" | "category" | "team_id" | "activity_type"
  >
>;

export interface PostContext extends AnalyticsContext {
  post_type: "recruitment" | "info_post";
  post_id: string | number;
  category: string;
}

export interface EventMap {
  signup_entered: AnalyticsContext & {
    feature: "auth";
  };

  feature_viewed: AnalyticsContext;

  post_viewed: PostContext;

  post_scrapped: AnalyticsContext & {
    post_type: "recruitment" | "info_post";
    post_id: string | number;
  };

  school_verified: AnalyticsContext & {
    feature: "auth";
  };

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
  succeed: (context?: AnalyticsSuccessContext) => void;
  fail: (error: unknown, details?: FailureDetails) => void;
  cancel: () => void;
}

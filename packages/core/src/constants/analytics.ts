export const ANALYTICS_SCHEMA_VERSION = 1;

export const ANALYTICS_EVENTS = {
  POST_VIEWED: 'post_viewed',
  POST_SCRAPPED: 'post_scrapped',
  TEAM_CREATED: 'team_created',
  TEAM_ACTIVITY_COMPLETED: 'team_activity_completed',
  ACTION_ATTEMPTED: 'action_attempted',
  ACTION_SUCCEEDED: 'action_succeeded',
  ACTION_FAILED: 'action_failed',
  ACTION_CANCELLED: 'action_cancelled',
} as const;

export const ANALYTICS_OUTCOME_EVENTS = {
  succeeded: ANALYTICS_EVENTS.ACTION_SUCCEEDED,
  failed: ANALYTICS_EVENTS.ACTION_FAILED,
  cancelled: ANALYTICS_EVENTS.ACTION_CANCELLED,
} as const;

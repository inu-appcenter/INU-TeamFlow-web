'use client';

export {
  identifyAnalyticsUser,
  resetAnalyticsIdentity,
} from './analytics/client';
export { trackAnalyticsEvent } from './analytics/events';
export { startAnalyticsAttempt } from './analytics/attempt';
export type {
  AnalyticsAttempt,
  AnalyticsContext,
  AnalyticsFeature,
  AnalyticsOperation,
  AnalyticsOutcome,
  EventMap,
  FailureDetails,
  FailureKind,
  PostContext,
} from '@moimi/core/types/analytics';

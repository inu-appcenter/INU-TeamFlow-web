'use client';

import { startAnalyticsAttempt, trackAnalyticsEvent } from '@/lib/analytics';
import {
  identifyAnalyticsUser,
  updateAnalyticsVerification,
} from '@/lib/analytics/client';
import type { UserMeResponse } from '@moimi/core/types/user';

export function useAuthTracking(operation: 'login' | 'school_verify') {
  const start = () =>
    startAnalyticsAttempt(operation, {
      feature: 'auth',
      auth_flow: operation === 'login' ? 'manual_login' : undefined,
      attempt_scope: 'submission',
    });

  const verified = (user: UserMeResponse) => {
    if (!user.isSchoolVerified) return;

    identifyAnalyticsUser(user.userId);
    updateAnalyticsVerification(true);

    trackAnalyticsEvent('school_verified', {
      feature: 'auth',
      interaction_type: 'authentication',
    });
  };

  return { start, verified };
}

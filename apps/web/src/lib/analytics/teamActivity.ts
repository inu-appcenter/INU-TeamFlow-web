'use client';

import { ANALYTICS_OPERATION_INTERACTIONS } from '@moimi/core/constants/analytics';
import type {
  AnalyticsAttempt,
  AnalyticsContext,
  AnalyticsSuccessContext,
  EventMap,
} from '@moimi/core/types/analytics';
import { startAnalyticsAttempt } from './attempt';
import { trackAnalyticsEvent } from './events';

type TeamActivityType = NonNullable<AnalyticsContext['activity_type']>;

interface TeamActivityContext {
  team_id: string | number;
  category?: string;
}

export function startTeamActivityAttempt(
  activityType: TeamActivityType,
  teamContext: TeamActivityContext
): AnalyticsAttempt {
  const context: EventMap['team_activity_completed'] = {
    feature: activityType === 'message_send' ? 'chat' : 'team',
    attempt_scope:
      activityType === 'message_send' ? 'message_send' : 'submission',
    interaction_type: ANALYTICS_OPERATION_INTERACTIONS[activityType],
    team_id: teamContext.team_id,
    category: teamContext.category,
    activity_type: activityType,
  };

  const attempt = startAnalyticsAttempt(activityType, context);
  let finished = false;

  return {
    attemptId: attempt.attemptId,

    succeed: (successContext: AnalyticsSuccessContext = {}) => {
      if (finished) return;
      finished = true;

      const completedContext: EventMap['team_activity_completed'] = {
        ...context,
        ...successContext,
        team_id: successContext.team_id ?? context.team_id,
        activity_type: activityType,
      };

      attempt.succeed({
        ...successContext,
        team_id: completedContext.team_id,
        activity_type: activityType,
      });

      trackAnalyticsEvent('team_activity_completed', completedContext);
    },

    fail: (error, details) => {
      if (finished) return;
      finished = true;

      attempt.fail(error, details);
    },

    cancel: () => {
      if (finished) return;
      finished = true;

      attempt.cancel();
    },
  };
}

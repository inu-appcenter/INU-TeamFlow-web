'use client';

import type {
  AnalyticsInteractionType,
  EventMap,
} from '@moimi/core/types/analytics';
import { capture } from './client';
import { contextProperties } from './properties';

const EVENT_INTERACTIONS = {
  signup_entered: 'view',
  feature_viewed: 'view',
  post_viewed: 'view',
  post_scrapped: 'participation',
  school_verified: 'authentication',
  team_created: 'creation',
  team_activity_completed: 'participation',
} as const satisfies Record<keyof EventMap, AnalyticsInteractionType>;

export function trackAnalyticsEvent<K extends keyof EventMap>(
  event: K,
  context: EventMap[K]
): void {
  capture(event, {
    ...contextProperties(context),
    interaction_type: context.interaction_type ?? EVENT_INTERACTIONS[event],
  });
}

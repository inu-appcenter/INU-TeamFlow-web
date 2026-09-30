'use client';

import type { EventMap } from '@moimi/core/types/analytics';
import { ANALYTICS_EVENTS } from '@moimi/core/constants/analytics';
import { capture } from './client';
import { contextProperties } from './properties';

export function trackAnalyticsEvent<K extends keyof EventMap>(
  event: K,
  context: EventMap[K]
): void {
  capture(event, {
    ...contextProperties(context),
    interaction_type:
      event === ANALYTICS_EVENTS.POST_VIEWED ? 'view' : 'participation',
  });
}

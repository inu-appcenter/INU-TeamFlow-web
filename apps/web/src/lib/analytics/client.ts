'use client';

import posthog from 'posthog-js';
import { ANALYTICS_SCHEMA_VERSION } from '@moimi/core/constants/analytics';
import { clearAnalyticsContextCache } from './httpContext';

export function capture(
  event: string,
  properties: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;
  try {
    posthog.capture(event, {
      analytics_schema_version: ANALYTICS_SCHEMA_VERSION,
      ...properties,
    });
  } catch {}
}

function getIdentifiedId(): string | null {
  try {
    const id: unknown = posthog.get_property('$user_id');
    return typeof id === 'string' || typeof id === 'number' ? String(id) : null;
  } catch {
    return null;
  }
}

/** 비로그인시 익명 방문자 ID를 유지 */
export function resetAnalyticsIdentity(): void {
  clearAnalyticsContextCache();
  try {
    if (getIdentifiedId() !== null) posthog.reset();
  } catch {}
}

/** 새로고침 후에도 SDK에 남아 있는 이전 계정과 현재 계정을 비교한다 */
export function identifyAnalyticsUser(userId: string | number): void {
  if (String(userId).length === 0) return;
  try {
    const nextId = String(userId);
    const previousId = getIdentifiedId();
    if (previousId !== null && previousId !== nextId) posthog.reset();
    posthog.identify(nextId);
  } catch {}
}

export function getActorId(): string | null {
  try {
    return posthog.get_distinct_id() || null;
  } catch {
    return null;
  }
}

export function updateAnalyticsVerification(isVerified: boolean): void {
  try {
    posthog.setPersonProperties({
      is_school_verified: isVerified,
    });
  } catch {}
}

'use client';

import posthog from 'posthog-js';
import { ANALYTICS_SCHEMA_VERSION } from '@moimi/core/constants/analytics';

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
  } catch {
    // 분석 도구 오류로 로그인/작성 등 실제 기능이 실패하면 안 된다.
  }
}

function getIdentifiedId(): string | null {
  try {
    const id: unknown = posthog.get_property('$user_id');
    return typeof id === 'string' || typeof id === 'number' ? String(id) : null;
  } catch {
    return null;
  }
}

/** 이미 비로그인이면 reset하지 않아 익명 방문자 ID를 유지한다. */
export function resetAnalyticsIdentity(): void {
  try {
    if (getIdentifiedId() !== null) posthog.reset();
  } catch {
    // 인증/FCM 정리는 계속 진행한다.
  }
}

/** 새로고침 후에도 SDK에 남아 있는 이전 계정과 현재 계정을 비교한다. */
export function identifyAnalyticsUser(userId: string | number): void {
  if (String(userId).length === 0) return;
  try {
    const nextId = String(userId);
    const previousId = getIdentifiedId();
    if (previousId !== null && previousId !== nextId) posthog.reset();
    posthog.identify(nextId);
  } catch {
    // 분석 실패는 사용자 프로필 로딩 실패가 아니다.
  }
}

export function getActorId(): string | null {
  try {
    return posthog.get_distinct_id() || null;
  } catch {
    return null;
  }
}

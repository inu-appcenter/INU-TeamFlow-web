'use client';

import { isCancel } from 'axios';
import type {
  AnalyticsAttempt,
  AnalyticsContext,
  AnalyticsOperation,
  AnalyticsOutcome,
  FailureDetails,
} from '@moimi/core/types/analytics';
import {
  ANALYTICS_EVENTS,
  ANALYTICS_OUTCOME_EVENTS,
} from '@moimi/core/constants/analytics';
import { capture, getActorId } from './client';
import { contextProperties, failureProperties } from './properties';

let attemptSequence = 0;

/**
 * 사용자 제출/전송 한 번에 하나 생성한다. 자동 재시도에는 재사용한다.
 * API 성공/서버 ACK 직후 succeed(), 최종 실패에 fail()을 호출한다.
 * 후속 refetch, FCM, 화면 이동 실패는 원래 작업의 실패로 기록하지 않는다.
 */
export function startAnalyticsAttempt(
  operation: AnalyticsOperation,
  context: AnalyticsContext
): AnalyticsAttempt {
  const startedAt = Date.now();
  const actorId = getActorId();
  const attemptId =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `${startedAt}-${++attemptSequence}-${Math.random().toString(36).slice(2)}`;
  const initialContext = contextProperties(context);
  let finished = false;

  const base = {
    operation,
    attempt_id: attemptId,
    // 401 처리로 SDK가 reset되어도 시도한 사람을 잃지 않는다.
    // 실패 영향 인원은 이 속성의 고유값을 집계한다.
    actor_id: actorId,
  };

  capture(ANALYTICS_EVENTS.ACTION_ATTEMPTED, { ...initialContext, ...base });

  const finish = (
    outcome: AnalyticsOutcome,
    extra: Record<string, unknown> = {}
  ) => {
    if (finished) return;
    finished = true;
    capture(ANALYTICS_OUTCOME_EVENTS[outcome], {
      ...initialContext,
      ...extra,
      ...base,
      duration_ms: Math.max(0, Date.now() - startedAt),
      interaction_type: outcome === 'succeeded' ? 'participation' : undefined,
    });
  };

  return {
    attemptId,
    succeed: () => finish('succeeded'),
    fail: (error: unknown, details: FailureDetails = {}) => {
      if (isCancel(error)) {
        finish('cancelled');
        return;
      }
      finish('failed', failureProperties(error, details));
    },
    cancel: () => finish('cancelled'),
  };
}

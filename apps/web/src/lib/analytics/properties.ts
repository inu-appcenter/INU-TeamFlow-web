import { isAxiosError } from 'axios';
import type {
  AnalyticsContext,
  FailureDetails,
  FailureKind,
} from '@moimi/core/types/analytics';
import { HttpStatusError } from '@moimi/core/api/errors';

export function contextProperties(
  context: AnalyticsContext
): Record<string, unknown> {
  return {
    feature: context.feature,
    attempt_scope: context.attempt_scope,
    auth_flow: context.auth_flow,
    interaction_type: context.interaction_type,
    post_type: context.post_type,
    post_id: context.post_id == null ? undefined : String(context.post_id),
    post_key:
      context.post_id == null || !context.post_type
        ? undefined
        : `${context.post_type}:${context.post_id}`,
    category: context.category,
    team_id: context.team_id == null ? undefined : String(context.team_id),
    activity_type: context.activity_type,
    chat_room_id:
      context.chat_room_id == null ? undefined : String(context.chat_room_id),
    message_type: context.message_type,
  };
}

export function failureProperties(error: unknown, details: FailureDetails) {
  const axiosError = isAxiosError(error) ? error : null;

  const uploadHttpError = error instanceof HttpStatusError ? error : null;

  const status =
    axiosError?.response?.status ??
    uploadHttpError?.status ??
    details.http_status ??
    null;

  const kind: FailureKind =
    details.kind ??
    (status !== null
      ? 'http'
      : axiosError?.code === 'ECONNABORTED' || axiosError?.code === 'ETIMEDOUT'
        ? 'timeout'
        : axiosError?.code === 'ERR_NETWORK' || axiosError?.request
          ? 'network'
          : 'unknown');

  return {
    failure_kind: kind,
    http_status: status,
    reason_code: details.reason_code ?? kind,
    server_error_code: details.server_error_code,
  };
}

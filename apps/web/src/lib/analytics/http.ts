'use client';

import {
  isAxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

import type {
  AnalyticsAttempt,
  AnalyticsContext,
  AnalyticsOperation,
} from '@moimi/core/types/analytics';

import { ANALYTICS_HTTP_ROUTES } from '@moimi/core/constants/analyticsHttp';

import { startAnalyticsAttempt } from './attempt';
import { trackAnalyticsEvent } from './events';

import { getPostCategory, rememberResponse, safeId } from './httpContext';

interface TrackedRequest {
  attempt: AnalyticsAttempt;
  operation: AnalyticsOperation;

  context: AnalyticsContext & {
    post_type: 'recruitment' | 'info_post';
    post_id: string;
  };
}

const installedClients = new WeakSet<AxiosInstance>();

export function installAnalyticsInterceptors(client: AxiosInstance): void {
  if (installedClients.has(client)) {
    return;
  }

  installedClients.add(client);

  const requests = new WeakMap<InternalAxiosRequestConfig, TrackedRequest>();

  client.interceptors.request.use((config) => {
    try {
      const pathname = new URL(
        config.url ?? '/',
        'https://moimi.invalid'
      ).pathname.replace(/^\/api\/v1(?=\/|$)/, '');

      const route = ANALYTICS_HTTP_ROUTES.find(
        (candidate) =>
          candidate.method === config.method?.toLowerCase() &&
          candidate.pattern.test(pathname)
      );

      if (!route) {
        return config;
      }

      const match = pathname.match(
        /^\/(recruitments|info-posts)\/(\d+)(?:\/|$)/
      );

      if (!match) {
        return config;
      }

      const postId = safeId(match[2]);

      if (!postId) {
        return config;
      }

      const postType =
        match[1] === 'recruitments' ? 'recruitment' : 'info_post';

      const context: TrackedRequest['context'] = {
        feature: postType,
        attempt_scope: 'api_request',
        post_type: postType,
        post_id: postId,
        category: getPostCategory(postType, postId),
      };

      requests.set(config, {
        operation: route.operation,
        context,
        attempt: startAnalyticsAttempt(route.operation, context),
      });
    } catch {
      // 분석 오류가 실제 API 요청을 막지 않게 한다.
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => {
      try {
        // 조회 응답에서는 ID와 카테고리만 기억한다
        rememberResponse(response.data);

        const tracked = requests.get(response.config);

        if (!tracked) {
          return response;
        }

        requests.delete(response.config);
        tracked.attempt.succeed();

        if (tracked.operation === 'scrap_add') {
          trackAnalyticsEvent('post_scrapped', tracked.context);
        }
      } catch {}

      return response;
    },

    (error: unknown) => {
      try {
        if (isAxiosError(error) && error.config) {
          const tracked = requests.get(error.config);

          requests.delete(error.config);
          tracked?.attempt.fail(error);
        }
      } catch {}

      return Promise.reject(error);
    }
  );
}

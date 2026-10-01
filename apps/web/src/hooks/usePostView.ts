'use client';

import { useEffect, useRef } from 'react';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { rememberPostContext } from '@/lib/analytics/httpContext';
import type { PostViewOptions } from '@moimi/core/types/postView';

export function usePostView({
  postType,
  postId,
  category,
  enabled = true,
}: PostViewOptions): void {
  const trackedPostKey = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || postId == null || !category) return;

    rememberPostContext(postType, postId, category);

    const postKey = `${postType}:${postId}`;
    if (trackedPostKey.current === postKey) return;

    trackedPostKey.current = postKey;

    trackAnalyticsEvent('post_viewed', {
      feature: postType,
      post_type: postType,
      post_id: postId,
      category,
    });
  }, [postType, postId, category, enabled]);
}

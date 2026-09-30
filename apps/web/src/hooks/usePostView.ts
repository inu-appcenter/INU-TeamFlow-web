'use client';

import { useEffect, useRef } from 'react';
import { trackAnalyticsEvent } from '@/lib/analytics';

type PostType = 'recruitment' | 'info_post';

interface PostViewOptions {
  postType: PostType;
  postId: number | string | null | undefined;
  category: string | null | undefined;
  enabled?: boolean;
}

export function usePostView({
  postType,
  postId,
  category,
  enabled = true,
}: PostViewOptions): void {
  const trackedPostKey = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || postId == null || !category) return;

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

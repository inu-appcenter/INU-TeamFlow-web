'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import InfoPostForm, {
  type InfoPostFormData,
} from '@/components/infoPost/InfoPostForm';
import { useCreateInfoPost } from '@moimi/core/hooks/useInfoPostQuery';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useSchoolVerificationGuard } from '@moimi/core/hooks/useSchoolVerificationGuard';
import { getCreatedPostId } from '@/lib/analytics/httpContext';
import { startAnalyticsAttempt } from '@/lib/analytics';
import { capture } from '@/lib/analytics/client';
import type { AnalyticsAttempt } from '@moimi/core/types/analytics';
export default function InfoPostCreatePage() {
  const router = useRouter();

  const { mutateAsync: createInfoPost } = useCreateInfoPost();
  const { errorMessage, showErrorMessage } = useErrorToast();
  const { isVerified } = useSchoolVerificationGuard(showErrorMessage);

  useEffect(() => {
    if (isVerified === false) {
      router.replace('/infoPost?error=school-verification-required');
    }
  }, [isVerified, router]);

  const handleSubmit = async (
    form: InfoPostFormData,
    providedAttempt?: AnalyticsAttempt
  ) => {
    const attempt = providedAttempt ?? createSubmissionAttempt(form);

    let createdInfoPost: unknown;

    try {
      createdInfoPost = await createInfoPost({
        category: form.category,
        title: form.title,
        content: form.content,
        imageKeys: form.imageKeys,
      });
    } catch (error) {
      attempt.fail(error);
      throw error;
    }

    const postId = getCreatedPostId('info_post', createdInfoPost);

    attempt.succeed(postId ? { post_id: postId } : undefined);

    capture('info_post_created', {
      feature: 'info_post',
      interaction_type: 'creation',
      post_type: 'info_post',
      post_id: postId,
      post_key: postId ? `info_post:${postId}` : undefined,
      category: form.category,
      image_count: form.imageKeys.length,
      attempt_id: attempt.attemptId,
    });

    router.replace('/infoPost');
  };
  const createSubmissionAttempt = (form: InfoPostFormData) =>
    startAnalyticsAttempt('info_post_create', {
      feature: 'info_post',
      attempt_scope: 'submission',
      post_type: 'info_post',
      category: form.category,
    });
  return (
    <>
      {errorMessage && (
        <div className="animate-modal-pop fixed top-32 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
          {errorMessage}
        </div>
      )}

      <InfoPostForm
        mode="create"
        onSubmit={handleSubmit}
        createAnalyticsAttempt={createSubmissionAttempt}
      />
    </>
  );
}

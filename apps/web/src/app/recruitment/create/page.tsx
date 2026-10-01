'use client';

import RecruitmentForm, {
  type RecruitmentFormData,
} from '@/components/recruitment/RecruitmentForm';
import { useCreateRecruitment } from '@moimi/core/hooks/useRecruitmentQuery';
import { useSchoolVerificationGuard } from '@moimi/core/hooks/useSchoolVerificationGuard';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useErrorToast } from '@/hooks/useErrorToast';
import { getCreatedPostId } from '@/lib/analytics/httpContext';
import { startAnalyticsAttempt } from '@/lib/analytics';
import { capture } from '@/lib/analytics/client';

export default function RecruitmentCreatePage() {
  const router = useRouter();
  const { mutateAsync: createRecruitment } = useCreateRecruitment();
  const { errorMessage, showErrorMessage } = useErrorToast();
  const { isVerified } = useSchoolVerificationGuard(showErrorMessage);

  useEffect(() => {
    if (!isVerified) {
      router.replace('/recruitment?error=school-verification-required');
    }
  }, [isVerified, router]);

  const handleSubmit = async (form: RecruitmentFormData) => {
    const attempt = startAnalyticsAttempt('recruitment_create', {
      feature: 'recruitment',
      attempt_scope: 'submission',
      post_type: 'recruitment',
      category: form.category,
      team_id: form.teamId || undefined,
    });

    if (form.targetMemberCount === '') {
      const error = new Error('모집 인원을 입력해주세요');

      attempt.fail(error, {
        kind: 'validation',
        reason_code: 'REQUIRED_FIELD_MISSING',
      });

      throw error;
    }

    let createdRecruitment: unknown;

    try {
      createdRecruitment = await createRecruitment({
        title: form.title,
        category: form.category,
        description: form.description,
        infoPostId: form.announcementId || undefined,
        teamId: form.teamId || undefined,
        targetMemberCount: form.targetMemberCount,
        endAt: form.endAt,
      });
    } catch (err) {
      attempt.fail(err);
      console.error('모집글 생성 실패', err);
      return;
    }

    const postId = getCreatedPostId('recruitment', createdRecruitment);

    attempt.succeed(postId ? { post_id: postId } : undefined);

    capture('recruitment_created', {
      feature: 'recruitment',
      interaction_type: 'creation',
      post_type: 'recruitment',
      post_id: postId,
      post_key: postId ? `recruitment:${postId}` : undefined,
      category: form.category,
      has_info_post: Boolean(form.announcementId),
      target_member_count: form.targetMemberCount,
      attempt_id: attempt.attemptId,
    });

    router.push('/recruitment');
  };

  return (
    <>
      {errorMessage && (
        <div className="animate-modal-pop fixed top-32 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
          {errorMessage}
        </div>
      )}
      <RecruitmentForm mode="create" onSubmit={handleSubmit} />
    </>
  );
}

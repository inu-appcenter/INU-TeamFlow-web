'use client';

import RecruitmentForm, {
  type RecruitmentFormData,
} from '@/components/recruitment/RecruitmentForm';
import { useRouter, useParams } from 'next/navigation';
import {
  useRecruitmentDetail,
  useUpdateRecruitment,
} from '@moimi/core/hooks/useRecruitmentQuery';
import { startAnalyticsAttempt } from '@/lib/analytics';

export default function RecruitmentEditPage() {
  const router = useRouter();
  const params = useParams();

  const recruitmentId = Number(params.id);

  const { data: detail, isLoading } = useRecruitmentDetail(recruitmentId);

  const { mutateAsync: updateRecruitment } = useUpdateRecruitment();

  const initialData: RecruitmentFormData | null = detail
    ? {
        title: detail.title,
        description: detail.description,
        category: detail.category,
        targetMemberCount: detail.targetMemberCount,
        endAt: detail.endAt.slice(0, 10), // 변경
        announcementId: detail.announcementId
          ? Number(detail.announcementId)
          : undefined,
        teamId: detail.teamId ? Number(detail.teamId) : undefined,
      }
    : null;

  const handleSubmit = async (form: RecruitmentFormData) => {
    const attempt = startAnalyticsAttempt('recruitment_update', {
      feature: 'recruitment',
      attempt_scope: 'submission',
      post_type: 'recruitment',
      post_id: recruitmentId,
      category: detail?.category ?? form.category,
    });

    if (form.targetMemberCount === '') {
      const error = new Error('모집 인원을 입력해주세요');

      attempt.fail(error, {
        kind: 'validation',
        reason_code: 'REQUIRED_FIELD_MISSING',
      });

      throw error;
    }

    try {
      await updateRecruitment({
        recruitmentId,
        body: {
          title: form.title,
          description: form.description,
          targetMemberCount: form.targetMemberCount,
          endAt: form.endAt,
        },
      });
    } catch (err) {
      attempt.fail(err);
      console.error('모집글 수정 실패', err);
      return;
    }

    attempt.succeed();

    router.push(`/recruitment/${recruitmentId}`);
  };

  if (isLoading || !initialData) return null;

  return (
    <RecruitmentForm
      mode="edit"
      initialData={initialData}
      onSubmit={handleSubmit}
    />
  );
}

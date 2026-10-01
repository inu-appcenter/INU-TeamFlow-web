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
import type { AnalyticsAttempt } from '@moimi/core/types/analytics';
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

  const handleSubmit = async (
    form: RecruitmentFormData,
    providedAttempt?: AnalyticsAttempt
  ) => {
    const attempt = providedAttempt ?? createSubmissionAttempt(form);

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
  const createSubmissionAttempt = (form: RecruitmentFormData) =>
    startAnalyticsAttempt('recruitment_update', {
      feature: 'recruitment',
      attempt_scope: 'submission',
      post_type: 'recruitment',
      post_id: recruitmentId,
      category: detail?.category ?? form.category,
    });
  return (
    <RecruitmentForm
      mode="edit"
      initialData={initialData}
      onSubmit={handleSubmit}
      createAnalyticsAttempt={createSubmissionAttempt}
    />
  );
}

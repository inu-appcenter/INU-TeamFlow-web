'use client';

import RecruitmentForm, {
  type RecruitmentFormData,
} from '@/components/recruitment/RecruitmentForm';
import { useCreateRecruitment } from '@/hooks/useRecruitmentQuery';
import { useSchoolVerificationGuard } from '@/hooks/useSchoolVerificationGuard';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useErrorToast } from '@/hooks/useErrorToast';

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
    if (form.targetMemberCount === '') {
      throw new Error('모집 인원을 입력해주세요');
    }
    try {
      await createRecruitment({
        title: form.title,
        category: form.category,
        description: form.description,
        infoPostId: form.announcementId || undefined,
        teamId: form.teamId || undefined,
        targetMemberCount: form.targetMemberCount,
        endAt: form.endAt,
      });

      router.push('/recruitment');
    } catch (err) {
      console.error('모집글 생성 실패', err);
    }
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

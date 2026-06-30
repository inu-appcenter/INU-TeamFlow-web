'use client';

import RecruitmentForm, {
  type RecruitmentFormData,
} from '@/components/recruitment/RecruitmentForm';
import { useCreateRecruitment } from '@/hooks/useRecruitmentQuery';
import { useRouter } from 'next/navigation';

export default function RecruitmentCreatePage() {
  const router = useRouter();

  const { mutateAsync: createRecruitment } = useCreateRecruitment();

  const handleSubmit = async (form: RecruitmentFormData) => {
    if (form.targetMemberCount === '') {
      throw new Error('모집 인원을 입력해주세요');
    }
    try {
      await createRecruitment({
        title: form.title,
        category: form.category,
        description: form.description,
        announcementId: form.announcementId || undefined,
        teamId: form.teamId || undefined,
        targetMemberCount: form.targetMemberCount,
        endAt: form.endAt,
      });

      router.push('/recruitment');
    } catch (err) {
      console.error('모집글 생성 실패', err);
    }
  };

  return <RecruitmentForm mode="create" onSubmit={handleSubmit} />;
}

'use client';

import { useParams, useRouter } from 'next/navigation';

import InfoPostForm, {
  type InfoPostFormData,
} from '@/components/infoPost/InfoPostForm';
import { useInfoPostDetail, useUpdateInfoPost } from '@/hooks/useInfoPostQuery';

export default function InfoPostEditPage() {
  const router = useRouter();
  const params = useParams();

  const infoPostId = Number(params.id);

  const { data: detail, isLoading } = useInfoPostDetail(infoPostId);
  const { mutateAsync: updateInfoPost } = useUpdateInfoPost();

  const initialData: InfoPostFormData | null = detail
    ? {
        category: detail.category,
        title: detail.title,
        content: detail.content,
        imageKeys: [],
      }
    : null;

  const handleSubmit = async (form: InfoPostFormData) => {
    try {
      await updateInfoPost({
        infoPostId,
        body: {
          title: form.title,
          content: form.content,
          imageKeys: [],
        },
      });

      router.push(`/infoPost/${infoPostId}`);
    } catch (error) {
      console.error('정보글 수정 실패', error);
      alert('정보글 수정에 실패했습니다.');
    }
  };

  if (isLoading || !initialData) return null;

  return (
    <InfoPostForm
      mode="edit"
      initialData={initialData}
      onSubmit={handleSubmit}
    />
  );
}

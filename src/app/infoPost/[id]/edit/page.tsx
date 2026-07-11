'use client';

import { useParams, useRouter } from 'next/navigation';

import InfoPostForm, {
  type InfoPostFormData,
} from '@/components/infoPost/InfoPostForm';
import { useInfoPostDetail, useUpdateInfoPost } from '@/hooks/useInfoPostQuery';
import { getImageKeyFromUrl } from '@/utils/image/getImageKeyFromUrl';

export default function InfoPostEditPage() {
  const router = useRouter();
  const params = useParams();

  const infoPostId = Number(params.id);

  const { data: detail, isLoading } = useInfoPostDetail(infoPostId);

  const { mutateAsync: updateInfoPost } = useUpdateInfoPost();

  const currentImage = detail
    ? [...detail.images].sort((a, b) => a.sortOrder - b.sortOrder)[0]
    : undefined;

  const existingImageKey = currentImage
    ? getImageKeyFromUrl(currentImage.imageUrl)
    : null;

  const initialData: InfoPostFormData | null = detail
    ? {
        category: detail.category,
        title: detail.title,
        content: detail.content,
        imageKeys: existingImageKey ? [existingImageKey] : [],
      }
    : null;

  const handleSubmit = async (form: InfoPostFormData) => {
    try {
      await updateInfoPost({
        infoPostId,
        body: {
          title: form.title,
          content: form.content,
          imageKeys: form.imageKeys,
        },
      });

      router.push(`/infoPost/${infoPostId}`);
    } catch (error) {
      console.error('정보글 수정 실패', error);
      throw error;
    }
  };

  if (isLoading || !initialData) {
    return null;
  }

  return (
    <InfoPostForm
      mode="edit"
      initialData={initialData}
      initialImageUrl={currentImage?.imageUrl ?? null}
      onSubmit={handleSubmit}
    />
  );
}

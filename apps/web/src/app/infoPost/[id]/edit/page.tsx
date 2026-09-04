'use client';

import { useParams, useRouter } from 'next/navigation';

import InfoPostForm, {
  type InfoPostFormData,
} from '@/components/infoPost/InfoPostForm';
import { useInfoPostDetail, useUpdateInfoPost } from '@moimi/core/hooks/useInfoPostQuery';
import { getImageKeyFromUrl } from '@/utils/image/getImageKeyFromUrl';

export default function InfoPostEditPage() {
  const router = useRouter();
  const params = useParams();

  const infoPostId = Number(params.id);

  const { data: detail, isLoading } = useInfoPostDetail(infoPostId);
  const { mutateAsync: updateInfoPost } = useUpdateInfoPost();

  const sortedImages = detail
    ? [...detail.images].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  const initialImages = sortedImages
    .map((image) => {
      const imageKey = getImageKeyFromUrl(image.imageUrl);

      if (!imageKey) {
        return null;
      }

      return {
        imageUrl: image.imageUrl,
        imageKey,
      };
    })
    .filter(
      (
        image
      ): image is {
        imageUrl: string;
        imageKey: string;
      } => image !== null
    );

  const hasImageKeyError = sortedImages.length !== initialImages.length;

  const initialData: InfoPostFormData | null = detail
    ? {
        category: detail.category,
        title: detail.title,
        content: detail.content,
        imageKeys: initialImages.map((image) => image.imageKey),
      }
    : null;

  const handleSubmit = async (form: InfoPostFormData) => {
    await updateInfoPost({
      infoPostId,
      body: {
        title: form.title,
        content: form.content,
        imageKeys: form.imageKeys,
      },
    });

    router.push(`/infoPost/${infoPostId}`);
  };

  if (!Number.isFinite(infoPostId) || infoPostId <= 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5]">
        <p className="text-sm font-semibold text-[#2C2C2C]">
          잘못된 정보글 주소입니다.
        </p>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5]">
        <p className="text-sm font-semibold text-[#989898]">
          정보글을 불러오는 중입니다.
        </p>
      </main>
    );
  }

  if (!detail || !initialData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5]">
        <p className="text-sm font-semibold text-[#2C2C2C]">
          존재하지 않는 정보글입니다.
        </p>
      </main>
    );
  }

  if (!detail.isAuthor) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5]">
        <p className="text-sm font-semibold text-[#2C2C2C]">
          정보글을 수정할 권한이 없습니다.
        </p>
      </main>
    );
  }

  if (hasImageKeyError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5]">
        <p className="text-sm font-semibold text-[#2C2C2C]">
          기존 이미지 정보를 불러오지 못했습니다.
        </p>
      </main>
    );
  }

  return (
    <InfoPostForm
      mode="edit"
      initialData={initialData}
      initialImages={initialImages}
      onSubmit={handleSubmit}
    />
  );
}

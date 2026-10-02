// apps/mobile/src/app/infoPost/[infoPostId]/edit.tsx
import { View, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import InfoPostForm, { type InfoPostFormData } from "@/components/InfoPostForm";
import {
  useInfoPostDetail,
  useUpdateInfoPost,
} from "@moimi/core/hooks/useInfoPostQuery";
import { getImageKeyFromUrl } from "@/utils/image/getImageKey";

function CenteredMessage({ text }: { text: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-[#F0F2F5]">
      <Text className="text-[14px] font-semibold text-[#2C2C2C]">{text}</Text>
    </View>
  );
}

export default function InfoPostEditScreen() {
  const { infoPostId } = useLocalSearchParams<{ infoPostId: string }>();
  const infoPostIdNum = Number(infoPostId);

  const { data: detail, isLoading } = useInfoPostDetail(infoPostIdNum);
  const { mutateAsync: updateInfoPost } = useUpdateInfoPost();

  const sortedImages = detail
    ? [...detail.images].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  const initialImages = sortedImages.map((image) => ({
    imageUrl: image.imageUrl,
    imageKey: getImageKeyFromUrl(image.imageUrl),
  }));

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
      infoPostId: infoPostIdNum,
      body: {
        title: form.title,
        content: form.content,
        imageKeys: form.imageKeys,
      },
    });
    router.replace(`/infoPost/${infoPostIdNum}`);
  };

  if (!Number.isFinite(infoPostIdNum) || infoPostIdNum <= 0) {
    return <CenteredMessage text="잘못된 정보글 주소입니다." />;
  }

  if (isLoading) {
    return <CenteredMessage text="정보글을 불러오는 중입니다." />;
  }

  if (!detail || !initialData) {
    return <CenteredMessage text="존재하지 않는 정보글입니다." />;
  }

  if (!detail.isAuthor) {
    return <CenteredMessage text="정보글을 수정할 권한이 없습니다." />;
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

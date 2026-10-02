// apps/mobile/src/app/recruitment/[recruitmentId]/edit.tsx
import { View, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  useRecruitmentDetail,
  useUpdateRecruitment,
} from "@moimi/core/hooks/useRecruitmentQuery";
import RecruitmentForm, {
  type RecruitmentFormData,
} from "@/components/RecruitmentForm";

export default function RecruitmentEditScreen() {
  const { recruitmentId } = useLocalSearchParams<{ recruitmentId: string }>();
  const recruitmentIdNum = Number(recruitmentId);

  const { data: recruitment, isLoading } =
    useRecruitmentDetail(recruitmentIdNum);
  const { mutateAsync: updateRecruitment } = useUpdateRecruitment();

  if (isLoading || !recruitment) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F0F2F5]">
        <Text className="text-[14px] text-[#989898]">불러오는 중...</Text>
      </View>
    );
  }

  const initialData: RecruitmentFormData = {
    title: recruitment.title,
    category: recruitment.category,
    description: recruitment.description,
    // TODO: 실제 필드명이 infoPostId인지 announcementId인지 확인 필요
    announcementId: recruitment.infoPostId
      ? Number(recruitment.infoPostId)
      : undefined,
    announcementTitle: recruitment.infoPostTitle ?? undefined,
    teamId: recruitment.teamId ? Number(recruitment.teamId) : undefined,
    targetMemberCount: recruitment.targetMemberCount,
    endAt: recruitment.endAt.slice(0, 10),
  };

  const handleSubmit = async (form: RecruitmentFormData) => {
    if (form.targetMemberCount === "") return;

    try {
      await updateRecruitment({
        recruitmentId: recruitmentIdNum,
        body: {
          title: form.title,
          description: form.description,
          targetMemberCount: form.targetMemberCount,
          endAt: form.endAt,
        },
      });

      router.replace({
        pathname: "/recruitment/[recruitmentId]",
        params: { recruitmentId: String(recruitmentIdNum) },
      });
    } catch (err) {
      console.log("모집글 수정 실패", err);
    }
  };

  return (
    <RecruitmentForm
      key={recruitment.recruitmentId}
      mode="edit"
      initialData={initialData}
      onSubmit={handleSubmit}
    />
  );
}

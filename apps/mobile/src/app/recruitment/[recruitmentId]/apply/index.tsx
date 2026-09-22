import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import {
  useRecruitmentDetail,
  useApplyRecruitment,
} from "@moimi/core/hooks/useRecruitmentQuery";
import { useMyInfo } from "@moimi/core/hooks/useAuthQuery";
import { useSchoolVerificationGuard } from "@moimi/core/hooks/useSchoolVerificationGuard";
import { categoryColorMap } from "@moimi/core/constants/contentCard";
import { getDepartmentName } from "@/utils/user/getDepartmentName";

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center py-3">
      <Text
        style={{ width: 80 }}
        className="text-[13px] font-medium text-[#989898]"
      >
        {label}
      </Text>
      <View className="flex-1 font-semibold">{children}</View>
    </View>
  );
}

export default function RecruitmentApplyScreen() {
  const { recruitmentId } = useLocalSearchParams<{ recruitmentId: string }>();
  const recruitmentIdNum = Number(recruitmentId);

  const { data: recruitment, isLoading } =
    useRecruitmentDetail(recruitmentIdNum);
  const { data: myInfo } = useMyInfo();
  const applyRecruitmentMutation = useApplyRecruitment();

  const [introduction, setIntroduction] = useState("");

  const { isVerified } = useSchoolVerificationGuard(() => {});

  useEffect(() => {
    if (!isVerified) {
      router.replace({
        pathname: "/recruitment/[recruitmentId]",
        params: {
          recruitmentId: String(recruitmentIdNum),
          error: "school-verification-required",
        },
      });
    }
  }, [isVerified, recruitmentIdNum]);

  if (isLoading || !recruitment) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F0F2F5]">
        <ActivityIndicator color="#989898" />
      </View>
    );
  }

  const headerColor = categoryColorMap[recruitment.category] ?? "#E9E9E9";

  const handleSubmit = async () => {
    if (!introduction.trim()) {
      Alert.alert("알림", "지원서를 작성해주세요.");
      return;
    }

    try {
      await applyRecruitmentMutation.mutateAsync({
        recruitmentId: recruitmentIdNum,
        body: { introduction },
      });
      Alert.alert("완료", "지원이 완료되었습니다.", [
        {
          text: "확인",
          onPress: () => router.replace(`/recruitment/${recruitmentIdNum}`),
        },
      ]);
    } catch {
      Alert.alert("오류", "지원에 실패했습니다.");
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F0F2F5]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        style={{ backgroundColor: headerColor, paddingTop: 60 }}
        className="flex-row items-center justify-between px-5 pb-4"
      >
        <Pressable
          onPress={() => router.back()}
          className="active:scale-90 transition-transform duration-150 ease-out"
        >
          <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 bg-white"
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 py-7">
          <Text className="text-[22px] font-bold text-[#2C2C2C]">
            {recruitment.title}
          </Text>

          <View className="mt-6">
            <InfoRow label="이름">
              <Text className="text-[14px] text-[#2C2C2C]">
                {myInfo?.name ?? "-"}
              </Text>
            </InfoRow>
            <InfoRow label="학과">
              <Text className="text-[14px] text-[#2C2C2C]">
                {myInfo ? getDepartmentName(myInfo.department) : "-"}
              </Text>
            </InfoRow>
            <InfoRow label="학번">
              <Text className="text-[14px] text-[#2C2C2C]">
                {myInfo?.studentNumber ?? "-"}
              </Text>
            </InfoRow>
          </View>

          <View className="mt-6 border-b-[0.5px] border-[#D6DDE5]" />

          <View className="mt-6">
            <Text className="text-[17px] font-semibold text-[#2C2C2C]">
              지원서를 작성해주세요
            </Text>
            <Text className="mt-2 text-[13px] text-[#B0B0B0]">
              Tip. 경험이나 목표를 함께 적으면 더 좋아요.
            </Text>
            <Text className="pl-8 mt-1 text-[13px] text-[#B0B0B0]">
              너무 짧은 지원서는 승인받기 어려울 수 있어요
            </Text>

            <TextInput
              value={introduction}
              onChangeText={setIntroduction}
              multiline
              textAlignVertical="top"
              className="mt-4 h-[220px] rounded-xl border border-[#D6DDE5]/60 bg-[#F6F8FA] p-4 text-[14px] text-[#2C2C2C]"
            />
          </View>

          <View className="mb-4 mt-8 items-center">
            <Pressable
              onPress={handleSubmit}
              disabled={applyRecruitmentMutation.isPending}
              className="rounded-xl  bg-[#5E92F0] px-10 py-3.5 active:opacity-80"
              style={{ opacity: applyRecruitmentMutation.isPending ? 0.6 : 1 }}
            >
              {applyRecruitmentMutation.isPending ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="#fff" />
                  <Text className="text-[15px] font-semibold text-white">
                    지원하기
                  </Text>
                </View>
              ) : (
                <Text className="text-[15px] font-semibold text-white">
                  지원하기
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

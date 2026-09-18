import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Animated,
  Modal,
} from "react-native";
import { useCancelApplication } from "@moimi/core/hooks/useMypagePostQuery";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import {
  useApplicationDetail,
  useUpdateApplicationStatus,
} from "@moimi/core/hooks/useRecruitmentQuery";
import { useCreateDirectChatRoom } from "@moimi/core/hooks/chat/useCreateDirectChatRoom";
import { categoryColorMap } from "@moimi/core/constants/contentCard";
import { getDepartmentName } from "@/utils/user/getDepartmentName";
import { formatDate } from "@/utils/date/formatDate";
import type { ApplicationStatus } from "@moimi/core/types/recruitment";

const statusLabelMap: Record<ApplicationStatus, string> = {
  WAITING: "대기중",
  ACCEPTED: "수락됨",
  DECLINED: "거절됨",
  CANCELLED: "취소됨",
};

const statusColorMap: Record<ApplicationStatus, { bg: string; text: string }> =
  {
    WAITING: { bg: "#E8F1FF", text: "#5E92F0" },
    ACCEPTED: { bg: "#DDF7E5", text: "#2E7845" },
    DECLINED: { bg: "#FFDDDD", text: "#B32424" },
    CANCELLED: { bg: "#EEF1F5", text: "#989898" },
  };

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

export default function MyApplicationDetailScreen() {
  const { applicationId } = useLocalSearchParams<{ applicationId: string }>();
  const applicationIdNum = Number(applicationId);

  const { data: application, isLoading } =
    useApplicationDetail(applicationIdNum);
  const updateApplicationStatus = useUpdateApplicationStatus();
  const createDirectChatRoom = useCreateDirectChatRoom();

  const [toastVisible, setToastVisible] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const cancelApplication = useCancelApplication();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (!toastVisible) return;
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setToastVisible(false));
  }, [toastVisible]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F0F2F5]">
        <ActivityIndicator color="#989898" />
      </View>
    );
  }

  if (!application) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F0F2F5]">
        <Text className="text-[15px] font-semibold text-[#2C2C2C]">
          존재하지 않는 지원서입니다.
        </Text>
      </View>
    );
  }

  const isWaiting = application.applicationStatus === "WAITING";
  const statusColor = statusColorMap[application.applicationStatus];
  const headerColor = categoryColorMap[application.category] ?? "#E9E9E9";

  const handleStartDirectChat = async () => {
    try {
      await createDirectChatRoom.mutateAsync(application.applicantId);
      // TODO: /chat/[roomId] 라우팅 확인되면 여기서 이동
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateStatus = (applicationStatus: "ACCEPTED" | "DECLINED") => {
    if (updateApplicationStatus.isPending) return;
    updateApplicationStatus.mutate(
      { applicationId: applicationIdNum, body: { applicationStatus } },
      {
        onSuccess: () => {
          if (applicationStatus === "ACCEPTED") {
            setToastVisible(true);
          } else {
            router.back();
          }
        },
      }
    );
  };

  const handleCancelApplication = () => {
    if (cancelApplication.isPending) return;
    cancelApplication.mutate(applicationIdNum, {
      onSuccess: () => {
        setShowCancelConfirm(false);
      },
    });
  };

  return (
    <View className="flex-1 bg-[#F0F2F5]">
      <View
        style={{ backgroundColor: headerColor, paddingTop: 60 }}
        className="flex-row items-center justify-between px-5 pb-4"
      >
        <Pressable onPress={() => router.back()} className="active:scale-90">
          <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 bg-white">
        <View className="px-6 py-7">
          <View
            style={{ backgroundColor: statusColor.bg }}
            className="self-start rounded-full px-3 py-1.5"
          >
            <Text
              style={{ color: statusColor.text }}
              className="text-[13px] font-semibold"
            >
              {statusLabelMap[application.applicationStatus]}
            </Text>
          </View>

          <Text className="mt-3 text-[20px] font-semibold text-[#2C2C2C]">
            {application.recruitmentTitle}
          </Text>

          <View className="mt-6">
            <InfoRow label="이름">
              <View className="flex-row items-center gap-3">
                <Text className="text-[14px] text-[#2C2C2C]">
                  {application.applicantName}
                </Text>
                {application.isRecruiter && (
                  <Pressable
                    onPress={handleStartDirectChat}
                    disabled={createDirectChatRoom.isPending}
                    className="rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] px-3 py-1.5 active:opacity-70"
                    style={{
                      opacity: createDirectChatRoom.isPending ? 0.5 : 1,
                    }}
                  >
                    <Text className="text-[11px] text-[#2C2C2C]">1:1 채팅</Text>
                  </Pressable>
                )}
              </View>
            </InfoRow>

            <InfoRow label="학과">
              <Text className="text-[14px] text-[#2C2C2C]">
                {getDepartmentName(application.applicantDepartment)}
              </Text>
            </InfoRow>

            <InfoRow label="학번">
              <Text className="text-[14px] text-[#2C2C2C]">
                {application.applicantStudentNumber}
              </Text>
            </InfoRow>

            <InfoRow label="지원일">
              <Text className="text-[14px] text-[#2C2C2C]">
                {formatDate(application.createdAt)}
              </Text>
            </InfoRow>

            {application.respondedAt && (
              <InfoRow label="응답일">
                <Text className="text-[14px] text-[#2C2C2C]">
                  {formatDate(application.respondedAt)}
                </Text>
              </InfoRow>
            )}
          </View>

          <View className="mt-6 border-b-[0.5px] border-[#D6DDE5]" />

          <View className="mt-6">
            <Text className="text-[14px] leading-6 text-[#2C2C2C]">
              {application.introduction}
            </Text>
          </View>

          <View className="mt-6 border-b-[0.5px] border-[#D6DDE5]" />

          {application.isRecruiter && isWaiting && (
            <View className="mb-4 mt-8 flex-row justify-center gap-4">
              <Pressable
                onPress={() => handleUpdateStatus("DECLINED")}
                disabled={updateApplicationStatus.isPending}
                className="rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-8 py-3 active:opacity-70"
                style={{ opacity: updateApplicationStatus.isPending ? 0.5 : 1 }}
              >
                <Text className="text-[15px] font-semibold text-[#E22222]">
                  거절
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleUpdateStatus("ACCEPTED")}
                disabled={updateApplicationStatus.isPending}
                className="rounded-xl bg-[#5E92F0] px-8 py-3 active:opacity-80"
                style={{ opacity: updateApplicationStatus.isPending ? 0.6 : 1 }}
              >
                <Text className="text-[15px] font-semibold text-white">
                  수락
                </Text>
              </Pressable>
            </View>
          )}

          {!application.isRecruiter && isWaiting && (
            <View className="mb-4 mt-8 flex-row justify-center">
              <Pressable
                onPress={() => setShowCancelConfirm(true)}
                className="rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-10 py-3.5 active:opacity-70"
              >
                <Text className="text-[15px] font-semibold text-[#E22222]">
                  신청 취소
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {toastVisible && (
        <Animated.View
          style={{ opacity: toastOpacity, top: 100 }}
          className="absolute left-6 right-6 items-center rounded-full bg-[#2C2C2C] px-5 py-2.5"
        >
          <Text className="text-[13px] font-semibold text-white">
            {application.applicantName}님이 연결된 팀 멤버로 추가됐어요
          </Text>
        </Animated.View>
      )}

      <Modal
        visible={showCancelConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelConfirm(false)}
      >
        <Pressable
          onPress={() => setShowCancelConfirm(false)}
          className="flex-1 items-center justify-center bg-black/40 px-6"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full max-w-[340px] rounded-3xl bg-white p-6"
          >
            <Text className="text-center text-[19px] font-bold text-[#2C2C2C]">
              신청을 취소할까요?
            </Text>
            <Text className="mt-2 text-center text-[14px] text-[#989898]">
              취소하면 되돌릴 수 없어요.
            </Text>

            <View className="mt-4 flex-row gap-3">
              <Pressable
                onPress={() => setShowCancelConfirm(false)}
                className="flex-1 rounded-xl border border-[#D6DDE5]/60 bg-[#F6F8FA] py-4 transition-transform duration-150 ease-out active:scale-95"
              >
                <Text className="text-center text-[14px] font-semibold text-[#2C2C2C]]">
                  아니오
                </Text>
              </Pressable>

              <Pressable
                onPress={handleCancelApplication}
                disabled={cancelApplication.isPending}
                className="flex-1 rounded-xl bg-[#E22222] py-4 transition-transform duration-150 ease-out  active:scale-95"
              >
                <Text className="text-center text-[14px] font-semibold text-white">
                  {cancelApplication.isPending ? "취소 중..." : "취소하기"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

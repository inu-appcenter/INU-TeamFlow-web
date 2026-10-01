// apps/mobile/src/app/recruitment/[recruitmentId]/apply/applications/index.tsx
import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useRecruitmentApplications } from "@moimi/core/hooks/useRecruitmentQuery";
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
const PAGE_SIZE = 10;
const WINDOW = 5;

function getPageWindow(current: number, totalPages: number) {
  const start = Math.floor((current - 1) / WINDOW) * WINDOW + 1;
  const end = Math.min(start + WINDOW - 1, totalPages);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function RecruitmentApplicationsScreen() {
  const { recruitmentId } = useLocalSearchParams<{ recruitmentId: string }>();
  const recruitmentIdNum = Number(recruitmentId);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useRecruitmentApplications(
    recruitmentIdNum,
    page - 1,
    PAGE_SIZE
  );

  const applications = data?.content ?? [];
  const totalCount = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // 스택에 있는 모집글 상세까지 pop (새 상세 화면을 쌓지 않음)
  // 스택에 상세가 없으면 현재 화면을 상세로 교체
  const goToDetail = () => {
    router.dismissTo(`/recruitment/${recruitmentIdNum}`);
  };

  return (
    <View className="flex-1 bg-[#F0F2F5]">
      <View
        style={{ paddingTop: 60 }}
        className="flex-row items-center gap-4 px-5 pb-4"
      >
        <Pressable
          onPress={goToDetail}
          className="transition-transform duration-150 ease-out active:scale-90"
        >
          <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
        </Pressable>

        <Text className="text-[20px] font-bold text-[#2C2C2C]">
          지원자 목록
        </Text>
      </View>

      <Text className="px-6 pb-3 text-[13px] text-[#2C2C2C]/50">
        총 {totalCount}명 지원
      </Text>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#989898" />
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => String(item.applicationId)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View className="h-2" />}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-[13px] text-[#2C2C2C]/40">
                아직 지원자가 없어요
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const statusColor = statusColorMap[item.applicationStatus];
            return (
              <Pressable
                onPress={() =>
                  router.push(
                    `/recruitment/${recruitmentIdNum}/apply/applications/${item.applicationId}`
                  )
                }
                className="rounded-2xl border border-[#D6DDE5]/40 bg-white p-4 active:opacity-70"
              >
                <View className="flex-row items-center gap-2">
                  <View
                    style={{ backgroundColor: statusColor.bg }}
                    className="rounded-full px-3 py-1.5"
                  >
                    <Text
                      style={{ color: statusColor.text }}
                      className="text-[12px] font-semibold"
                    >
                      {statusLabelMap[item.applicationStatus]}
                    </Text>
                  </View>
                  <Text className="text-[15px] font-bold text-[#2C2C2C]">
                    {item.applicantName}
                  </Text>
                </View>
                <Text
                  numberOfLines={2}
                  className="mt-1.5 text-[13px] text-[#2c2c2c]"
                >
                  {item.introduction}
                </Text>
                <Text className="mt-2 text-[11px] text-[#989898]">
                  {item.createdAt.slice(0, 10)}
                </Text>
              </Pressable>
            );
          }}
          ListFooterComponent={
            totalPages > 1 ? (
              <View className="mt-4 flex-row justify-center gap-1.5">
                {getPageWindow(page, totalPages).map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setPage(p)}
                    className="h-8 w-8 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: p === page ? "#5B5FCF" : "transparent",
                    }}
                  >
                    <Text
                      className="text-[13px] font-medium"
                      style={{ color: p === page ? "#fff" : "#2C2C2C99" }}
                    >
                      {p}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

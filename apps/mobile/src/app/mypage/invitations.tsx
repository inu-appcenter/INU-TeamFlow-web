import { useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  LayoutChangeEvent,
  Animated,
} from "react-native";
import { router } from "expo-router";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { ChevronLeft } from "lucide-react-native";
import {
  useInvitations,
  useUpdateInvitationStatus,
} from "@moimi/core/hooks/useMypageInvitationQuery";
import type {
  InvitationResponse,
  InvitationStatus,
  InvitationTab,
} from "@moimi/core/types/mypageInvitation";
import { categoryColorMap } from "@moimi/core/constants/category";
import { formatDate } from "@/utils/date/formatDate";

const categories: { label: string; value: InvitationTab }[] = [
  { label: "받은 초대", value: "RECEIVED" },
  { label: "보낸 초대", value: "SENT" },
];

const getInvitationStatusLabel = (status: InvitationStatus) => {
  if (status === "WAITING") return "대기중";
  if (status === "ACCEPTED") return "수락됨";
  if (status === "DECLINED") return "거절됨";
  if (status === "CANCELED") return "취소됨";
  return status;
};

const statusStyleMap: Record<InvitationStatus, { bg: string; text: string }> = {
  WAITING: { bg: "#EAF1FE", text: "#5E92F0" },
  ACCEPTED: { bg: "#DDF7E5", text: "#2E7845" },
  DECLINED: { bg: "#FDE8E8", text: "#C0392B" },
  CANCELED: { bg: "#EEF1F5", text: "#989898" },
};

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}.${String(date.getDate()).padStart(2, "0")} ${String(
    date.getHours()
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

/* ---------- 탭 (chat.tsx / mypost.tsx와 동일 패턴, 2개라 flex-1) ---------- */

function CategoryTabs({
  selected,
  onChange,
}: {
  selected: InvitationTab;
  onChange: (v: InvitationTab) => void;
}) {
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const tabLayouts = useRef<Record<string, { x: number; width: number }>>({});
  const springConfig = { damping: 34, stiffness: 450, mass: 1 };

  const handleTabLayout = (value: string) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    tabLayouts.current[value] = { x, width };
    if (value === selected && indicatorWidth.value === 0) {
      indicatorX.value = x;
      indicatorWidth.value = width;
    }
  };

  const handleSelect = (value: InvitationTab) => {
    onChange(value);
    const layout = tabLayouts.current[value];
    if (layout) {
      indicatorX.value = withSpring(layout.x, springConfig);
      indicatorWidth.value = withSpring(layout.width, springConfig);
    }
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    left: indicatorX.value,
    width: indicatorWidth.value,
  }));

  return (
    <View className="relative flex-row border-b-[0.5px] border-[#D6DDE5]">
      {categories.map((category) => {
        const isActive = selected === category.value;
        return (
          <Pressable
            key={category.value}
            onLayout={handleTabLayout(category.value)}
            onPress={() => handleSelect(category.value)}
            className="flex-1 items-center"
            style={{ height: 40 }}
          >
            <Text
              className={`pt-1.5 text-[17px] font-bold ${
                isActive ? "text-[#5E92F0]" : "text-[#CBD2DA]"
              }`}
            >
              {category.label}
            </Text>
          </Pressable>
        );
      })}
      <Reanimated.View
        className="absolute bottom-0 h-0.5 bg-[#5E92F0]"
        style={indicatorStyle}
      />
    </View>
  );
}

/* ---------- 카드 ---------- */

function InvitationCard({
  invitation,
  direction,
  isPending,
  onPress,
  onAccept,
  onReject,
}: {
  invitation: InvitationResponse;
  direction: InvitationTab;
  isPending: boolean;
  onPress: () => void;
  onAccept: () => void;
  onReject: () => void;
}) {
  const color = categoryColorMap[invitation.teamCategory] ?? "#E9E9E9";
  const personLabel = direction === "RECEIVED" ? "보낸 사람" : "받는 사람";
  const personName =
    direction === "RECEIVED" ? invitation.senderName : invitation.receiverName;

  return (
    <Pressable
      onPress={onPress}
      style={{ borderLeftWidth: 12, borderLeftColor: color }}
      className="mb-3 rounded-2xl bg-white p-5 active:bg-[#FAFAFA]"
    >
      <View className="flex-row items-center justify-between">
        <Text
          className="flex-1 text-[17px] font-bold text-[#2C2C2C]"
          numberOfLines={1}
        >
          {invitation.teamName}
        </Text>
        <View
          style={{ backgroundColor: statusStyleMap[invitation.status].bg }}
          className="shrink-0 rounded-full px-3 py-1.5"
        >
          <Text
            style={{ color: statusStyleMap[invitation.status].text }}
            className="text-[12px] font-medium"
          >
            {getInvitationStatusLabel(invitation.status)}
          </Text>
        </View>
      </View>

      <Text className="mt-2 text-[13px] text-[#989898]" numberOfLines={1}>
        {personLabel} : {personName}
      </Text>

      <View className="mt-3 flex-row items-center justify-between">
        <Text className="text-[12px] text-[#989898]">
          {formatDate(invitation.createdAt)}
        </Text>

        {direction === "RECEIVED" && invitation.status === "WAITING" && (
          <View className="flex-row gap-2">
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onAccept();
              }}
              disabled={isPending}
              className="rounded-full bg-[#5E92F0] px-4 py-1.5 active:opacity-80 disabled:opacity-50"
            >
              <Text className="text-[12px] font-semibold text-white">수락</Text>
            </Pressable>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onReject();
              }}
              disabled={isPending}
              className="rounded-full bg-[#EEF1F5] px-4 py-1.5 active:opacity-80 disabled:opacity-50"
            >
              <Text className="text-[12px] font-semibold text-[#646B75]">
                거절
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between gap-4 border-b-[0.5px] border-[#D6DDE5]/60 pb-3">
      <Text className="shrink-0 text-[13px] font-semibold text-[#989898]">
        {label}
      </Text>
      <Text className="flex-1 text-right text-[13px] text-[#2C2C2C]">
        {value}
      </Text>
    </View>
  );
}

/* ---------- 메인 화면 ---------- */

export default function InvitationsScreen() {
  const [selectedCategory, setSelectedCategory] =
    useState<InvitationTab>("RECEIVED");
  const [selectedInvitation, setSelectedInvitation] =
    useState<InvitationResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const {
    data: invitations = [],
    isLoading,
    isError,
  } = useInvitations(selectedCategory);
  const { mutate: updateStatus, isPending } = useUpdateInvitationStatus();

  const sortedInvitations = [...invitations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1800),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setErrorMessage(null));
  };

  const handleCategoryChange = (category: InvitationTab) => {
    setSelectedCategory(category);
    setSelectedInvitation(null);
  };

  const changeInvitationStatus = (
    invitationId: number,
    status: "ACCEPTED" | "DECLINED"
  ) => {
    updateStatus(
      { invitationId, body: { status } },
      {
        onSuccess: (updatedInvitation) => {
          setSelectedInvitation((prev) => {
            if (!prev || prev.invitationId !== invitationId) return prev;
            return updatedInvitation;
          });
        },
        onError: () => {
          showErrorMessage("초대 상태 변경에 실패했습니다");
        },
      }
    );
  };

  return (
    <View className="flex-1 bg-[#F0F2F5]">
      {errorMessage && (
        <View
          pointerEvents="none"
          className="absolute inset-x-0 top-16 z-50 items-center"
        >
          <Animated.View
            style={{ opacity: toastOpacity }}
            className="rounded-xl bg-[#2C2C2C] px-5 py-3"
          >
            <Text className="text-[14px] font-medium text-white">
              {errorMessage}
            </Text>
          </Animated.View>
        </View>
      )}

      <View
        style={{ paddingTop: 60 }}
        className="flex-row items-center gap-3 bg-[#F0F2F5] px-5 pb-4"
      >
        <Pressable onPress={() => router.back()} className="active:opacity-70">
          <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
        </Pressable>
        <Text className="text-[20px] font-bold text-[#2C2C2C]">초대 이력</Text>
      </View>

      <View className="px-4">
        <CategoryTabs
          selected={selectedCategory}
          onChange={handleCategoryChange}
        />
      </View>

      <ScrollView
        className="mt-3 flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View className="h-[250px] items-center justify-center">
            <Text className="text-[14px] text-[#989898]">
              초대 이력을 불러오는 중입니다
            </Text>
          </View>
        ) : isError ? (
          <View className="h-[250px] items-center justify-center">
            <Text className="text-[14px] text-[#989898]">
              초대 이력을 불러오지 못했습니다
            </Text>
          </View>
        ) : sortedInvitations.length === 0 ? (
          <View className="h-[250px] items-center justify-center">
            <Text className="text-[14px] text-[#989898]">
              초대 이력이 없습니다
            </Text>
          </View>
        ) : (
          sortedInvitations.map((invitation) => (
            <InvitationCard
              key={invitation.invitationId}
              invitation={invitation}
              direction={selectedCategory}
              isPending={isPending}
              onPress={() => setSelectedInvitation(invitation)}
              onAccept={() =>
                changeInvitationStatus(invitation.invitationId, "ACCEPTED")
              }
              onReject={() =>
                changeInvitationStatus(invitation.invitationId, "DECLINED")
              }
            />
          ))
        )}
      </ScrollView>

      <Modal
        visible={!!selectedInvitation}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedInvitation(null)}
      >
        <Pressable
          onPress={() => setSelectedInvitation(null)}
          className="flex-1 items-center justify-center bg-black/20 px-5"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full max-w-[420px] rounded-3xl bg-white p-6"
          >
            {selectedInvitation && (
              <>
                <Text className="mb-5 text-[22px] font-bold text-[#2C2C2C]">
                  초대 상세
                </Text>

                <View className="gap-3">
                  <DetailRow
                    label="팀 이름"
                    value={selectedInvitation.teamName}
                  />
                  <DetailRow
                    label="상태"
                    value={getInvitationStatusLabel(selectedInvitation.status)}
                  />
                  <DetailRow
                    label="보낸 사람"
                    value={selectedInvitation.senderName}
                  />
                  <DetailRow
                    label="받는 사람"
                    value={selectedInvitation.receiverName}
                  />
                  <DetailRow
                    label="초대일"
                    value={formatDateTime(selectedInvitation.createdAt)}
                  />
                  <DetailRow
                    label="응답일"
                    value={formatDateTime(selectedInvitation.respondedAt)}
                  />
                </View>

                {selectedCategory === "RECEIVED" &&
                  selectedInvitation.status === "WAITING" && (
                    <View className="mt-6 flex-row gap-2">
                      <Pressable
                        disabled={isPending}
                        onPress={() =>
                          changeInvitationStatus(
                            selectedInvitation.invitationId,
                            "ACCEPTED"
                          )
                        }
                        className="h-12 flex-1 items-center justify-center rounded-2xl bg-[#5E92F0] active:opacity-80 disabled:opacity-50"
                      >
                        <Text className="text-[14px] font-semibold text-white">
                          수락
                        </Text>
                      </Pressable>

                      <Pressable
                        disabled={isPending}
                        onPress={() =>
                          changeInvitationStatus(
                            selectedInvitation.invitationId,
                            "DECLINED"
                          )
                        }
                        className="h-12 flex-1 items-center justify-center rounded-2xl bg-[#EEF1F5] active:opacity-80 disabled:opacity-50"
                      >
                        <Text className="text-[14px] font-semibold text-[#646B75]">
                          거절
                        </Text>
                      </Pressable>
                    </View>
                  )}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

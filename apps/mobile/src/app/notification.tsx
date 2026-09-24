import { useMemo, useRef, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { router } from "expo-router";
import { View, Text, ScrollView, Pressable } from "react-native";
import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react-native";
import Checkbox from "@/components/Checkbox";
import {
  useNotifications,
  useReadNotification,
  useReadNotifications,
  useDeleteNotifications,
} from "@moimi/core/hooks/useNotificationQuery";
import type {
  NotificationFilterType,
  NotificationItem,
  NotificationType,
} from "@moimi/core/types/notification";
import { formatDate } from "@/utils/date/formatDate";

const notificationTabs: { label: string; value: NotificationFilterType }[] = [
  { label: "전체", value: "ALL" },
  { label: "공지사항", value: "NOTICE" },
  { label: "초대", value: "INVITE" },
  { label: "신청", value: "APPLICATION" },
  { label: "일정", value: "CALENDAR" },
  { label: "채팅", value: "CHAT" },
  { label: "신고", value: "REPORT" },
];

const notificationTypeLabel: Record<NotificationType, string> = {
  NOTICE: "공지사항",
  INVITE: "초대",
  APPLICATION: "신청",
  CALENDAR: "일정",
  CHAT: "채팅",
  REPORT: "신고",
};

const notificationTypeStyle: Record<NotificationType, string> = {
  NOTICE: "bg-[#EAF2FF] text-[#5E92F0]",
  INVITE: "bg-[#EEE9FF] text-[#7656D6]",
  APPLICATION: "bg-[#EAF8EF] text-[#3B8A58]",
  CALENDAR: "bg-[#FFF2E6] text-[#C8762D]",
  CHAT: "bg-[#EEF1F5] text-[#5C6670]",
  REPORT: "bg-[#FDEEEE] text-[#E22222]",
};

function NotificationTabs({
  selected,
  onChange,
  disabled,
}: {
  selected: NotificationFilterType;
  onChange: (v: NotificationFilterType) => void;
  disabled?: boolean;
}) {
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const tabLayouts = useRef<Record<string, { x: number; width: number }>>({});

  const springConfig = { damping: 34, stiffness: 450, mass: 1 };

  const handleTabLayout =
    (value: NotificationFilterType) => (e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      tabLayouts.current[value] = { x, width };
      if (value === selected) {
        indicatorX.value = x;
        indicatorWidth.value = width;
      }
    };

  const handleSelect = (value: NotificationFilterType) => {
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
    <View className="relative">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="border-b-[0.5px] border-[#D6DDE5]/60"
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        {notificationTabs.map((tab) => {
          const isActive = selected === tab.value;
          return (
            <Pressable
              key={tab.value}
              onLayout={handleTabLayout(tab.value)}
              onPress={() => handleSelect(tab.value)}
              disabled={disabled}
              className="items-center px-5 pt-2"
              style={{ height: 40 }}
            >
              <Text
                className={`text-[16px] font-bold ${
                  isActive ? "text-[#5E92F0]" : "text-[#CBD2DA]"
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
        <Animated.View
          className="absolute bottom-0 h-0.5 bg-[#5E92F0]"
          style={indicatorStyle}
        />
      </ScrollView>

      <LinearGradient
        colors={["rgba(255,255,255,0)", "rgba(255,255,255,1)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        pointerEvents="none"
        style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 24 }}
      />
    </View>
  );
}

export default function NotificationScreen() {
  const [activeTab, setActiveTab] = useState<NotificationFilterType>("ALL");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 1800);
  };

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useNotifications(activeTab);

  const { mutateAsync: readNotification, isPending: isReadingOne } =
    useReadNotification();
  const { mutateAsync: readNotifications, isPending: isReadingSelected } =
    useReadNotifications();
  const { mutateAsync: deleteNotifications, isPending: isDeletingSelected } =
    useDeleteNotifications();

  const notifications = useMemo(
    () => data?.pages.flatMap((page) => page.notifications) ?? [],
    [data]
  );

  const unreadCount = data?.pages[0]?.unreadCount ?? 0;

  const notificationIds = notifications.map((n) => n.notificationId);

  const isAllSelected =
    notificationIds.length > 0 &&
    notificationIds.every((id) => selectedIds.includes(id));

  const isMutationPending =
    isReadingOne || isReadingSelected || isDeletingSelected;

  const handleTabChange = (tab: NotificationFilterType) => {
    setActiveTab(tab);
    setSelectedIds([]);
  };

  const handleSelectNotification = (notificationId: number) => {
    setSelectedIds((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : notificationIds);
  };

  const handleMarkAsRead = async () => {
    if (selectedIds.length === 0 || isReadingSelected) return;
    try {
      await readNotifications(selectedIds);
      setSelectedIds([]);
    } catch {
      showErrorMessage("알림을 읽음 처리하지 못했습니다.");
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0 || isDeletingSelected) return;
    try {
      await deleteNotifications(selectedIds);
      setSelectedIds([]);
    } catch {
      showErrorMessage("알림을 삭제하지 못했습니다.");
    }
  };

  const handleNotificationPress = async (notification: NotificationItem) => {
    if (isReadingOne) return;
    try {
      if (!notification.isRead) {
        await readNotification(notification.notificationId);
      }
      if (notification.redirectUrl) {
        router.push(notification.redirectUrl as never);
      }
    } catch {
      showErrorMessage("알림을 확인하지 못했습니다.");
    }
  };

  const handleFetchNextPage = async () => {
    if (!hasNextPage || isFetchingNextPage) return;
    try {
      await fetchNextPage();
    } catch {
      showErrorMessage("알림을 추가로 불러오지 못했습니다.");
    }
  };

  return (
    <View className="flex-1 bg-[#F0F2F5]">
      <View
        style={{ paddingTop: 60 }}
        className="flex-row items-center gap-4 bg-white px-5 pb-4"
      >
        <Pressable
          onPress={() => router.back()}
          className="transition-transform duration-150 ease-out active:scale-90 "
        >
          <ChevronLeft size={26} strokeWidth={2.5} color="#2C2C2C" />
        </Pressable>
        <Text className="text-[20px] font-bold text-[#2C2C2C]">알림</Text>
      </View>

      {errorMessage ? (
        <View
          style={{
            position: "absolute",
            top: 120,
            alignSelf: "center",
            zIndex: 50,
          }}
          className="rounded-full bg-[#2C2C2C] px-5 py-2"
        >
          <Text className="text-sm font-semibold text-white">
            {errorMessage}
          </Text>
        </View>
      ) : null}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 40,
        }}
      >
        {unreadCount > 0 && (
          <View className="mb-3 flex-row items-center gap-3 rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#5E92F0]/5 px-5 py-4">
            <Bell size={18} strokeWidth={2.5} color="#5E92F0" />
            <Text className="flex-1 text-[14px] font-semibold text-[#2C2C2C]">
              아직 읽지 않은 알림이{" "}
              <Text className="font-bold text-[#5E92F0]">{unreadCount}건</Text>{" "}
              있어요
            </Text>
          </View>
        )}

        <View className="mb-2 rounded-2xl border-[0.5px] border-[#D6DDE5]/60 bg-white px-3 pt-3">
          <NotificationTabs
            selected={activeTab}
            onChange={handleTabChange}
            disabled={isMutationPending}
          />

          <View className="flex-row flex-wrap items-center gap-2 py-3 px-2">
            <View
              className={
                notifications.length === 0 || isMutationPending
                  ? "opacity-50"
                  : ""
              }
              pointerEvents={
                notifications.length === 0 || isMutationPending
                  ? "none"
                  : "auto"
              }
            >
              <Checkbox
                checked={isAllSelected}
                onChange={handleSelectAll}
                label="전체 선택"
                size="sm"
              />
            </View>

            <Pressable
              onPress={handleMarkAsRead}
              disabled={selectedIds.length === 0 || isReadingSelected}
              className="flex-row ml-2 items-center justify-center gap-1.5 w-[60px] rounded-lg border-[0.5px] border-[#D6DDE5] bg-white py-2 transition-transform duration-150 ease-out active:scale-95 disabled:opacity-40"
            >
              <Check size={14} strokeWidth={2.5} color="#5c5c5c" />
              <Text className="text-[13px] font-medium text-[#5c5c5c]">
                읽음
              </Text>
            </Pressable>

            <Pressable
              onPress={handleDelete}
              disabled={selectedIds.length === 0 || isDeletingSelected}
              className="flex-row items-center justify-center gap-1.5 w-[60px] rounded-lg border-[0.5px] border-[#D6DDE5] bg-white py-2 transition-transform duration-150 ease-out active:scale-95 disabled:opacity-40"
            >
              <Trash2 size={13} strokeWidth={2.5} color="#5c5c5c" />
              <Text className="text-[13px] font-medium text-[#5c5c5c]">
                삭제
              </Text>
            </Pressable>

            {selectedIds.length > 0 && (
              <Text className="ml-auto text-[12px] font-medium text-[#989898]">
                {selectedIds.length}개 선택
              </Text>
            )}
          </View>
        </View>

        {isLoading ? (
          <View className="h-[240px] items-center justify-center rounded-xl border-[0.5px] border-[#D6DDE5]/60 bg-white">
            <Text className="text-[13px] text-[#989898]">불러오는 중...</Text>
          </View>
        ) : isError ? (
          <View className="h-[240px] items-center justify-center rounded-xl border-[0.5px] border-[#D6DDE5]/60 bg-white">
            <Text className="text-[13px] text-[#989898]">
              알림을 불러오지 못했습니다
            </Text>
          </View>
        ) : notifications.length === 0 ? (
          <View className="h-[240px] items-center justify-center rounded-xl border-[0.5px] border-[#D6DDE5]/60 bg-white">
            <Text className="text-[13px] text-[#989898]">알림이 없습니다</Text>
          </View>
        ) : (
          <View className="gap-2">
            {notifications.map((notification) => {
              const isSelected = selectedIds.includes(
                notification.notificationId
              );
              return (
                <View
                  key={notification.notificationId}
                  className={`flex-row items-center gap-3 rounded-xl border-[0.5px] bg-white px-4 py-4 ${
                    notification.isRead
                      ? "border-[#D6DDE5]/60"
                      : "border-l-[7px] border-[#D6DDE5]/60 border-l-[#5E92F0]"
                  }`}
                >
                  <View
                    className={isMutationPending ? "opacity-50" : ""}
                    pointerEvents={isMutationPending ? "none" : "auto"}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() =>
                        handleSelectNotification(notification.notificationId)
                      }
                      size="sm"
                    />
                  </View>

                  <Pressable
                    onPress={() => handleNotificationPress(notification)}
                    disabled={isReadingOne}
                    className="min-w-0 flex-1 flex-row items-center gap-3 active:opacity-60"
                  >
                    <View className="min-w-0 flex-1">
                      <View className="flex-row items-center gap-2">
                        <View
                          className={`shrink-0 rounded-full px-2.5 py-1 ${
                            notificationTypeStyle[notification.type].split(
                              " "
                            )[0]
                          }`}
                        >
                          <Text
                            className={`text-[10px] font-semibold ${
                              notificationTypeStyle[notification.type].split(
                                " "
                              )[1]
                            }`}
                          >
                            {notificationTypeLabel[notification.type]}
                          </Text>
                        </View>

                        <Text
                          numberOfLines={1}
                          className={`flex-1 text-[14px] text-[#2C2C2C] ${
                            notification.isRead ? "font-semibold" : "font-bold"
                          }`}
                        >
                          {notification.title}
                        </Text>
                      </View>

                      <Text
                        numberOfLines={1}
                        className="mt-1 px-1 text-[12px] text-[#989898]"
                      >
                        {notification.content}
                      </Text>

                      <Text className="mt-1 px-1 text-[11px] text-[#b0b0b0]">
                        {formatDate(notification.createdAt)}
                      </Text>
                    </View>
                    {notification.type !== "REPORT" && (
                      <ChevronRight
                        size={20}
                        strokeWidth={2.5}
                        color="#98989899"
                      />
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        {!isLoading && !isError && notifications.length > 0 && hasNextPage && (
          <Pressable
            onPress={handleFetchNextPage}
            disabled={isFetchingNextPage}
            className="mx-auto mt-5 mb-4 items-center justify-center rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-white px-6 py-3 transition-transform duration-150 ease-out active:scale-95 disabled:opacity-50"
          >
            <Text className="text-[13px] font-semibold text-[#5E92F0]">
              {isFetchingNextPage ? "불러오는 중..." : "알림 더 보기"}
            </Text>
          </Pressable>
        )}

        {!isLoading && !isError && notifications.length > 0 && !hasNextPage && (
          <Text className="mt-5 mb-4 text-center text-[13px] text-[#B0B8C1]">
            모든 알림을 확인했어요
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

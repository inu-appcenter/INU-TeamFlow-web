import { useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  LayoutChangeEvent,
} from "react-native";
import { router } from "expo-router";
import { infoPostCategoryFilterOptions } from "@moimi/core/constants/infoPost";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { ChevronLeft, ImageIcon } from "lucide-react-native";
import { useMyInfoPosts } from "@moimi/core/hooks/useInfoPostQuery";
import {
  useMyApplications,
  useMyRecruitments,
  useMyTeamNotices,
} from "@moimi/core/hooks/useMypagePostQuery";
import { categoryMap, categoryColorMap } from "@moimi/core/constants/category";
import { formatDate } from "@/utils/date/formatDate";
import { getDday } from "@/utils/date/getDday";
import type { MyPost, MyPostType } from "@moimi/core/types/mypagePost";
import type { RecruitmentCategory } from "@moimi/core/types/recruitment";
import { getTeamRoleLabel } from "@/utils/user/teamRole";
import { darkenColor } from "@/utils/color/darkenColor";

type TabType = Exclude<MyPostType, "ALL">;

const categories: { label: string; value: TabType }[] = [
  { label: "모집", value: "RECRUITMENT" },
  { label: "정보", value: "INFOPOST" },
  { label: "신청", value: "APPLICATION" },
  { label: "공지", value: "NOTICE" },
];

const applicationStatusLabel: Record<string, string> = {
  WAITING: "대기중",
  ACCEPTED: "수락됨",
  DECLINED: "거절됨",
  CANCELLED: "취소됨",
};

/* ---------- 카테고리 탭 (recruitment/infoPost 목록과 동일 패턴) ---------- */

function CategoryTabs({
  selected,
  onChange,
}: {
  selected: TabType;
  onChange: (v: TabType) => void;
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

  const handleSelect = (value: TabType) => {
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
    <View className="mb-3 relative flex-row border-b-[0.5px] border-[#D6DDE5]">
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
      <Animated.View
        className="absolute bottom-0 h-0.5 bg-[#5E92F0]"
        style={indicatorStyle}
      />
    </View>
  );
}

/* ---------- 카드 ---------- */

function MyPostCard({ post }: { post: MyPost }) {
  if (post.type === "INFOPOST") {
    const categoryLabel =
      infoPostCategoryFilterOptions.find((c) => c.value === post.category)
        ?.label ?? post.category;

    return (
      <Pressable
        onPress={() => router.push(`/infoPost/${post.infoPostId}`)}
        className="mb-3 flex-row gap-3 overflow-hidden rounded-2xl border-[0.5px] border-[#D6DDE5]/60 bg-white p-3 active:opacity-80"
      >
        <View className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F6F8FA]">
          {post.thumbnailUrl ? (
            <Image
              source={{ uri: post.thumbnailUrl }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <ImageIcon size={24} color="#C7CBD1" />
            </View>
          )}
        </View>
        <View className="flex-1 justify-center">
          <Text className="text-[12px] font-medium text-[#5E92F0]">
            {categoryLabel}
          </Text>
          <Text
            numberOfLines={2}
            className="mt-2 text-[14px] font-semibold text-[#2C2C2C]"
          >
            {post.title}
          </Text>
          <Text className="mt-3 text-[11px] text-[#989898]">
            {formatDate(post.createdAt)}
          </Text>
        </View>
      </Pressable>
    );
  }

  if (post.type === "APPLICATION") {
    const color =
      categoryColorMap[post.recruitmentCategory as RecruitmentCategory] ??
      categoryColorMap.ETC;

    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/application/[applicationId]",
            params: { applicationId: String(post.applicationId) },
          })
        }
        style={{ borderLeftWidth: 12, borderLeftColor: color }}
        className="mb-3 rounded-2xl bg-white p-5 active:bg-[#FAFAFA]"
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-[17px] font-bold text-[#2C2C2C]">신청서</Text>
          <Text className="text-[12px] font-medium text-[#5E92F0]">
            {applicationStatusLabel[post.applicationStatus] ??
              post.applicationStatus}
          </Text>
        </View>
        <Text className="mt-2 text-[13px] text-[#989898]" numberOfLines={1}>
          받는 사람 : {post.recruiterName ?? ""}
        </Text>
        <Text className="mt-3 text-[12px] text-[#989898]">
          {formatDate(post.createdAt)}
        </Text>
      </Pressable>
    );
  }

  if (post.type === "NOTICE") {
    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/notice/[noticeId]",
            params: {
              noticeId: String(post.noticeId),
              teamId: String(post.teamId),
            },
          })
        }
        style={{
          borderRadius: 12,
          backgroundColor: "#ffffff",
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderWidth: 0.5,
          borderColor: "rgba(214,221,229,0.4)",
          borderLeftWidth: post.isRead ? 0.5 : 6,
          borderLeftColor: post.isRead ? "rgba(214,221,229,0.4)" : "#5E92F0",
        }}
        className="active:bg-[#FAFAFA] mb-3"
      >
        <View className="flex-row items-center gap-2">
          <Text
            style={{
              backgroundColor: categoryColorMap[post.teamCategory],
              color: darkenColor(categoryColorMap[post.teamCategory], 140),
            }}
            className="shrink-0 overflow-hidden rounded-full px-3 py-1 text-xs font-semibold"
          >
            {post.teamName}
          </Text>
          <View className="flex-1 flex-row items-center gap-1.5">
            <Text
              style={{ flexShrink: 1 }}
              className="text-[16px] font-semibold text-[#2C2C2C]"
              numberOfLines={1}
            >
              {post.title}
            </Text>
            {!post.isRead && (
              <View className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5E92F0]" />
            )}
          </View>
        </View>
        <Text
          className="mt-2 px-0.5 text-[12px] text-[#989898]"
          numberOfLines={1}
        >
          {post.authorName} · {getTeamRoleLabel(post.teamRole)} ·{" "}
          {formatDate(post.createdAt)}
        </Text>
      </Pressable>
    );
  }

  // RECRUITMENT
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(post.endAt);
  endDate.setHours(0, 0, 0, 0);
  const isClosed = endDate < today || !post.isOpened;
  const color =
    categoryColorMap[post.category as RecruitmentCategory] ??
    categoryColorMap.ETC;

  return (
    <Pressable
      onPress={() => router.push(`/recruitment/${post.recruitmentId}`)}
      style={{ borderLeftWidth: 12, borderLeftColor: color }}
      className="mb-3 rounded-2xl bg-white p-5 active:bg-[#FAFAFA]"
    >
      <View className="flex-row items-center gap-2">
        <Text
          style={{ backgroundColor: color, color: darkenColor(color, 140) }}
          className="shrink-0 overflow-hidden rounded-full px-2.5 py-1 text-xs font-semibold text-[#2C2C2C]"
        >
          {categoryMap[post.category as RecruitmentCategory] ?? "기타"}
        </Text>
        <Text
          className="flex-1 text-[17px] font-bold text-[#2C2C2C]"
          numberOfLines={1}
        >
          {post.title}
        </Text>
      </View>

      <View className="mt-6 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-2">
          <Text className="text-[12px] text-[#989898]" numberOfLines={1}>
            기간 {formatDate(post.createdAt)} ~ {formatDate(post.endAt)}
          </Text>
          <Text className="text-[12px] font-medium text-[#5E92F0]">
            {getDday(post.endAt)}
          </Text>
        </View>

        <View
          className={`rounded-full px-3 py-1.5 ${
            isClosed ? "bg-[#EEF1F5]" : "bg-[#DDF7E5]"
          }`}
        >
          <Text
            className={`text-[12px] font-medium ${
              isClosed ? "text-[#989898]" : "text-[#2E7845]"
            }`}
          >
            {isClosed ? "모집마감" : "모집중"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

/* ---------- 메인 화면 ---------- */

export default function MyPostScreen() {
  const [selectedCategory, setSelectedCategory] =
    useState<TabType>("RECRUITMENT");

  const {
    data: recruitments = [],
    isLoading: isRecruitmentsLoading,
    isError: isRecruitmentsError,
  } = useMyRecruitments();

  const {
    data: infoPostsPage,
    isLoading: isInfoPostsLoading,
    isError: isInfoPostsError,
  } = useMyInfoPosts();

  const {
    data: applications = [],
    isLoading: isApplicationsLoading,
    isError: isApplicationsError,
  } = useMyApplications();

  const {
    data: notices = [],
    isLoading: isNoticesLoading,
    isError: isNoticesError,
  } = useMyTeamNotices();

  const infoPosts = infoPostsPage?.content ?? [];

  const myPosts: MyPost[] = [
    ...recruitments.map((r) => ({ ...r, type: "RECRUITMENT" as const })),
    ...infoPosts.map((p) => ({ ...p, type: "INFOPOST" as const })),
    ...applications.map((a) => ({ ...a, type: "APPLICATION" as const })),
    ...notices.map((n) => ({ ...n, type: "NOTICE" as const })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filteredPosts = myPosts.filter(
    (post) => post.type === selectedCategory
  );

  const loadingByTab: Record<TabType, boolean> = {
    RECRUITMENT: isRecruitmentsLoading,
    INFOPOST: isInfoPostsLoading,
    APPLICATION: isApplicationsLoading,
    NOTICE: isNoticesLoading,
  };

  const errorByTab: Record<TabType, boolean> = {
    RECRUITMENT: isRecruitmentsError,
    INFOPOST: isInfoPostsError,
    APPLICATION: isApplicationsError,
    NOTICE: isNoticesError,
  };

  const isLoading = loadingByTab[selectedCategory];
  const isError = errorByTab[selectedCategory];
  const isEmpty = !isLoading && !isError && filteredPosts.length === 0;

  return (
    <View className="flex-1 bg-[#F0F2F5]">
      <View
        style={{ paddingTop: 60 }}
        className="flex-row items-center gap-3 bg-[#F0F2F5] px-5 pb-4"
      >
        <Pressable onPress={() => router.back()} className="active:opacity-70">
          <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
        </Pressable>
        <Text className="text-[20px] font-bold text-[#2C2C2C]">
          내가 작성한 글
        </Text>
      </View>

      <View className="px-4">
        <CategoryTabs
          selected={selectedCategory}
          onChange={setSelectedCategory}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View className="h-[250px] items-center justify-center">
            <ActivityIndicator color="#5E92F0" />
          </View>
        ) : isError ? (
          <View className="h-[250px] items-center justify-center">
            <Text className="text-[14px] text-[#989898]">
              내역을 불러오지 못했어요
            </Text>
          </View>
        ) : isEmpty ? (
          <View className="h-[250px] items-center justify-center">
            <Text className="text-[14px] text-[#989898]">
              작성한 내역이 없어요
            </Text>
          </View>
        ) : (
          filteredPosts.map((post) => (
            <MyPostCard
              key={`${post.type}-${
                post.type === "INFOPOST"
                  ? post.infoPostId
                  : post.type === "APPLICATION"
                  ? post.applicationId
                  : post.type === "NOTICE"
                  ? post.noticeId
                  : post.recruitmentId
              }`}
              post={post}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

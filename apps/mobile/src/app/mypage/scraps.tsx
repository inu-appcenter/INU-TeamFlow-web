import { useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  FlatList,
  ActivityIndicator,
  LayoutChangeEvent,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { ChevronLeft, ImageIcon } from "lucide-react-native";
import {
  useRecruitmentScraps,
  useInfoPostScraps,
} from "@moimi/core/hooks/useScrapQuery";
import {
  statusTextColorMap,
  statusBorderColorMap,
  categoryMap,
  categoryColorMap,
} from "@moimi/core/constants/contentCard";
import { infoPostCategoryFilterOptions } from "@moimi/core/constants/infoPost";
import { darkenColor } from "@/utils/color/darkenColor";
import { getDday } from "@/utils/date/getDday";
import { formatDate } from "@/utils/date/formatDate";
import type { RecruitmentSummaryResponse } from "@moimi/core/types/recruitment";
import type { InfoPostSummaryResponse } from "@moimi/core/types/infoPost";

const ITEMS_PER_PAGE = 10;
type ScrapCategory = "recruitment" | "infoPost";

const categories: { value: ScrapCategory; label: string }[] = [
  { value: "recruitment", label: "모집글" },
  { value: "infoPost", label: "정보글" },
];

/* ---------- 모집글 카드 (recruitment/index.tsx와 동일) ---------- */

function RecruitmentCard({
  recruitment,
}: {
  recruitment: RecruitmentSummaryResponse;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(recruitment.endAt);
  endDate.setHours(0, 0, 0, 0);
  const isClosed = endDate < today || !recruitment.isOpened;
  const status = isClosed ? "CLOSED" : "OPEN";
  const color = categoryColorMap[recruitment.category] ?? categoryColorMap.ETC;

  return (
    <Pressable
      onPress={() => router.push(`/recruitment/${recruitment.recruitmentId}`)}
      style={{ borderLeftWidth: 12, borderLeftColor: color }}
      className="mb-3 rounded-2xl bg-white p-5 active:bg-[#FAFAFA]"
    >
      <View className="flex-row items-center gap-2">
        <Text
          style={{ backgroundColor: color, color: darkenColor(color, 140) }}
          className="shrink-0 overflow-hidden rounded-full px-2.5 py-1 text-xs font-semibold"
        >
          {categoryMap[recruitment.category] ?? "기타"}
        </Text>
        <Text
          className="flex-1 text-[17px] font-bold text-[#2C2C2C]"
          numberOfLines={1}
        >
          {recruitment.title}
        </Text>
      </View>

      <Text
        className={`mt-2 text-[13px] font-medium ${
          recruitment.infoPostTitle ? "text-[#2C2C2C]" : "text-[#B0B0B0]"
        }`}
        numberOfLines={1}
      >
        {recruitment.infoPostTitle || "연결된 정보글이 없습니다"}
      </Text>

      <View className="mt-5 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-2">
          <Text className="text-[12px] text-[#989898]" numberOfLines={1}>
            기간 {formatDate(recruitment.createdAt)} ~{" "}
            {formatDate(recruitment.endAt)}
          </Text>
          <Text className="text-[12px] font-medium text-[#5E92F0]">
            {getDday(recruitment.endAt)}
          </Text>
        </View>

        <View
          style={{ backgroundColor: statusBorderColorMap[status] }}
          className="rounded-full px-3 py-1.5"
        >
          <Text
            style={{ color: statusTextColorMap[status] }}
            className="text-[12px] font-medium"
          >
            {status === "OPEN" ? "모집중" : "모집마감"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

/* ---------- 정보글 카드 (infoPost/index.tsx와 동일) ---------- */

function InfoPostCard({
  item,
  categoryLabelMap,
}: {
  item: InfoPostSummaryResponse;
  categoryLabelMap: Record<string, string>;
}) {
  return (
    <Pressable
      onPress={() => router.push(`/infoPost/${item.infoPostId}`)}
      style={{ width: "48%" }}
      className="mb-4 overflow-hidden rounded-2xl border-[0.5px] border-[#D6DDE5]/60 bg-white active:opacity-80"
    >
      <View style={{ aspectRatio: 4 / 3 }} className="w-full bg-[#F6F8FA]">
        {item.thumbnailUrl ? (
          <Image
            source={{ uri: item.thumbnailUrl }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <ImageIcon size={28} color="#C7CBD1" />
          </View>
        )}
      </View>
      <View className="px-3 py-2.5">
        <Text className="text-[12px] font-medium text-[#5E92F0]">
          {categoryLabelMap[item.category] ?? item.category}
        </Text>
        <Text
          numberOfLines={2}
          className="mt-1 text-[14px] font-semibold text-[#2C2C2C]"
        >
          {item.title}
        </Text>
        <Text className="mt-1.5 text-[11px] text-[#989898]">
          {formatDate(item.createdAt)}
        </Text>
      </View>
    </Pressable>
  );
}

/* ---------- 카테고리 탭 ---------- */

function CategoryTabs({
  selected,
  onChange,
}: {
  selected: ScrapCategory;
  onChange: (v: ScrapCategory) => void;
}) {
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const tabLayouts = useRef<Record<string, { x: number; width: number }>>({});

  const handleTabLayout = (value: ScrapCategory) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    tabLayouts.current[value] = { x, width };
    if (value === selected && indicatorWidth.value === 0) {
      indicatorX.value = x;
      indicatorWidth.value = width;
    }
  };

  const handleSelect = (value: ScrapCategory) => {
    onChange(value);
    const layout = tabLayouts.current[value];
    if (layout) {
      const springConfig = { damping: 34, stiffness: 450, mass: 1 };
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
      <Animated.View
        className="absolute bottom-0 h-0.5 bg-[#5E92F0]"
        style={indicatorStyle}
      />
    </View>
  );
}

/* ---------- 메인 화면 ---------- */

export default function ScrapScreen() {
  const [selectedCategory, setSelectedCategory] =
    useState<ScrapCategory>("recruitment");

  const recruitmentScrapsQuery = useRecruitmentScraps(
    ITEMS_PER_PAGE,
    selectedCategory === "recruitment"
  );
  const infoPostScrapsQuery = useInfoPostScraps(
    ITEMS_PER_PAGE,
    selectedCategory === "infoPost"
  );

  const recruitmentScraps =
    recruitmentScrapsQuery.data?.pages.flatMap((page) => page.content) ?? [];
  const infoPostScraps =
    infoPostScrapsQuery.data?.pages.flatMap((page) => page.content) ?? [];

  const categoryLabelMap = useMemo(
    () =>
      Object.fromEntries(
        infoPostCategoryFilterOptions.map((c) => [c.value, c.label])
      ) as Record<string, string>,
    []
  );

  const isInfoPost = selectedCategory === "infoPost";

  const isLoading = isInfoPost
    ? infoPostScrapsQuery.isLoading
    : recruitmentScrapsQuery.isLoading;
  const isFetchingNextPage = isInfoPost
    ? infoPostScrapsQuery.isFetchingNextPage
    : recruitmentScrapsQuery.isFetchingNextPage;
  const hasNextPage = isInfoPost
    ? infoPostScrapsQuery.hasNextPage
    : recruitmentScrapsQuery.hasNextPage;

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      if (isInfoPost) infoPostScrapsQuery.fetchNextPage();
      else recruitmentScrapsQuery.fetchNextPage();
    }
  };

  const data: (InfoPostSummaryResponse | RecruitmentSummaryResponse)[] =
    isInfoPost ? infoPostScraps : recruitmentScraps;

  return (
    <View className="flex-1 bg-[#F0F2F5]">
      <View
        style={{ paddingTop: 60 }}
        className="flex-row items-center gap-3 bg-[#F0F2F5] px-5 pb-4"
      >
        <Pressable onPress={() => router.back()} className="active:opacity-70">
          <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
        </Pressable>
        <Text className="text-[20px] font-bold text-[#2C2C2C]">스크랩</Text>
      </View>

      <View className="px-4">
        <CategoryTabs
          selected={selectedCategory}
          onChange={setSelectedCategory}
        />
      </View>

      <FlatList<InfoPostSummaryResponse | RecruitmentSummaryResponse>
        key={selectedCategory}
        data={data}
        keyExtractor={(item) =>
          isInfoPost
            ? String((item as InfoPostSummaryResponse).infoPostId)
            : String((item as RecruitmentSummaryResponse).recruitmentId)
        }
        numColumns={isInfoPost ? 2 : 1}
        columnWrapperStyle={
          isInfoPost ? { justifyContent: "space-between" } : undefined
        }
        renderItem={({ item }) =>
          isInfoPost ? (
            <InfoPostCard
              item={item as InfoPostSummaryResponse}
              categoryLabelMap={categoryLabelMap}
            />
          ) : (
            <RecruitmentCard recruitment={item as RecruitmentSummaryResponse} />
          )
        }
        onEndReachedThreshold={0.4}
        onEndReached={handleEndReached}
        ListEmptyComponent={
          isLoading ? (
            <View className="h-[250px] items-center justify-center">
              <ActivityIndicator color="#989898" />
            </View>
          ) : (
            <View className="h-[250px] items-center justify-center">
              <Text className="text-[14px] text-[#989898]">
                {isInfoPost
                  ? "스크랩한 정보글이 없어요"
                  : "스크랩한 모집글이 없어요"}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="items-center py-6">
              <ActivityIndicator size="small" color="#9C9C9C" />
            </View>
          ) : null
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

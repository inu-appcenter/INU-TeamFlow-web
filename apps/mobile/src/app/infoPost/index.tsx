import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  LayoutChangeEvent,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  ImageIcon,
} from "lucide-react-native";
import { useInfoPosts } from "@moimi/core/hooks/useInfoPostQuery";
import { infoPostCategoryFilterOptions } from "@moimi/core/constants/infoPost";
import type {
  GetInfoPostsParams,
  InfoPostCategory,
} from "@moimi/core/types/infoPost";
import { formatDate } from "@/utils/date/formatDate"; // TODO: 아직 없으면 생성 필요

const PAGE_SIZE = 20;
const PAGE_WINDOW_SIZE = 5;

/* ---------- 카드 ---------- */

function InfoPostCard({
  item,
  categoryLabelMap,
}: {
  item: {
    infoPostId: number;
    category: InfoPostCategory;
    title: string;
    createdAt: string;
    thumbnailUrl: string | null;
  };
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

/* ---------- 검색바 ---------- */

function InfoPostSearchBar({
  keyword,
  onKeywordChange,
}: {
  keyword: string;
  onKeywordChange: (v: string) => void;
}) {
  return (
    <View className="mb-3 h-12 flex-row items-center gap-2 rounded-xl border-[0.5px] border-[#D6DDE5]/60 bg-white px-4">
      <Search size={16} color="#B0B0B0" />
      <TextInput
        value={keyword}
        onChangeText={onKeywordChange}
        placeholder="제목으로 검색"
        placeholderTextColor="#B0B0B0"
        className="flex-1 text-[14px] text-[#2C2C2C]"
      />
    </View>
  );
}

/* ---------- 카테고리 탭 (recruitment.tsx와 동일 패턴) ---------- */

function CategoryTabs({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (v: string) => void;
}) {
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const tabLayouts = useRef<Record<string, { x: number; width: number }>>({});

  const springConfig = { damping: 34, stiffness: 450, mass: 1 };

  const handleTabLayout = (value: string) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    tabLayouts.current[value] = { x, width };
    if (value === selected) {
      indicatorX.value = x;
      indicatorWidth.value = width;
    }
  };

  const handleSelect = (value: string) => {
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
    <View className="relative mb-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="border-b-[0.5px] border-[#D6DDE5]"
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        {infoPostCategoryFilterOptions.map((category) => {
          const isActive = selected === category.value;
          return (
            <Pressable
              key={category.value}
              onLayout={handleTabLayout(category.value)}
              onPress={() => handleSelect(category.value)}
              className="items-center px-5 pt-[5px]"
              style={{ height: 40 }}
            >
              <Text
                className={`text-[17px] font-bold ${
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
      </ScrollView>
      <LinearGradient
        colors={["rgba(255,255,255,0)", "rgba(240,242,245,1)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        pointerEvents="none"
        style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 32 }}
      />
    </View>
  );
}

/* ---------- 메인 화면 ---------- */

export default function InfoPostListScreen() {
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const queryParams: GetInfoPostsParams = {
    keyword: debouncedKeyword || undefined,
    category:
      selectedCategory === "ALL"
        ? undefined
        : (selectedCategory as InfoPostCategory),
    page: page - 1,
    size: PAGE_SIZE,
    sort: ["createdAt,DESC"],
  };

  const { data: infoPostData } = useInfoPosts(queryParams);
  const infoPosts = infoPostData?.content ?? [];
  const totalPages = infoPostData?.totalPages ?? 0;
  const currentPage = totalPages === 0 ? 1 : Math.min(page, totalPages);

  const blockStart =
    Math.floor((currentPage - 1) / PAGE_WINDOW_SIZE) * PAGE_WINDOW_SIZE + 1;
  const blockEnd = Math.min(blockStart + PAGE_WINDOW_SIZE - 1, totalPages);
  const visiblePages = Array.from(
    { length: Math.max(blockEnd - blockStart + 1, 0) },
    (_, i) => blockStart + i
  );

  const categoryLabelMap = useMemo(
    () =>
      Object.fromEntries(
        infoPostCategoryFilterOptions.map((c) => [c.value, c.label])
      ) as Record<string, string>,
    []
  );

  return (
    <View className="flex-1 bg-[#F0F2F5]">
      <View className="flex-row items-center justify-between px-4 pb-3 pt-16">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.push(`/`)}
            className="h-9 w-9 items-center justify-center transition-transform duration-150 ease-out active:scale-90"
          >
            <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
          </Pressable>
          <Text className="text-[20px] font-bold text-[#2C2C2C]">정보</Text>
        </View>

        <Pressable
          onPress={() => router.push("/infoPost/create")}
          className="h-9 w-9 items-center justify-center rounded-full bg-[#5E92F0] transition-transform duration-150 ease-out active:scale-95"
        >
          <Plus size={16} strokeWidth={2.5} color="#fff" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <InfoPostSearchBar
          keyword={keyword}
          onKeywordChange={(v) => {
            setKeyword(v);
            setPage(1);
          }}
        />

        <CategoryTabs
          selected={selectedCategory}
          onChange={(v) => {
            setSelectedCategory(v);
            setPage(1);
          }}
        />

        <View className="flex-row flex-wrap justify-between">
          {infoPosts.map((item) => (
            <InfoPostCard
              key={item.infoPostId}
              item={item}
              categoryLabelMap={categoryLabelMap}
            />
          ))}
        </View>

        {infoPosts.length === 0 && (
          <View className="h-[200px] items-center justify-center">
            <Text className="text-[14px] text-[#989898]">
              등록된 정보글이 없습니다
            </Text>
          </View>
        )}

        {totalPages > 0 && (
          <View className="mt-4 flex-row items-center justify-center gap-3 py-4">
            <Pressable
              onPress={() =>
                setPage(Math.max(1, blockStart - PAGE_WINDOW_SIZE))
              }
              disabled={blockStart === 1}
              className="items-center justify-center transition-transform duration-150 ease-out active:scale-90 disabled:opacity-40"
            >
              <ChevronLeft size={20} strokeWidth={2.5} color="#2C2C2C99" />
            </Pressable>

            {visiblePages.map((n) => (
              <Pressable
                key={n}
                onPress={() => setPage(n)}
                className="items-center justify-center px-1 transition-transform duration-150 ease-out active:scale-90"
              >
                <Text
                  className={`text-[15px] font-semibold ${
                    n === currentPage ? "text-[#5E92F0]" : "text-[#2c2c2c]/50"
                  }`}
                >
                  {n}
                </Text>
              </Pressable>
            ))}

            <Pressable
              onPress={() =>
                setPage(Math.min(totalPages, blockStart + PAGE_WINDOW_SIZE))
              }
              disabled={blockEnd === totalPages}
              className="items-center justify-center transition-transform duration-150 ease-out active:scale-90 disabled:opacity-40"
            >
              <ChevronRight size={20} strokeWidth={2.5} color="#2C2C2C99" />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

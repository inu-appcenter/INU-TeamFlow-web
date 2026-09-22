// apps/mobile/src/app/recruitment/index.tsx
import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  LayoutChangeEvent,
  Platform,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Plus,
} from "lucide-react-native";
import { useRecruitments } from "@moimi/core/hooks/useRecruitmentQuery";
import { categoryFilterOptions } from "@moimi/core/constants/category";
import {
  statusTextColorMap,
  statusBorderColorMap,
  categoryMap,
  categoryColorMap,
} from "@moimi/core/constants/contentCard";
import { darkenColor } from "@/utils/color/darkenColor";
import { getDday } from "@/utils/date/getDday";
import { formatDate } from "@/utils/date/formatDate";
import type { RecruitmentSummaryResponse } from "@moimi/core/types/recruitment";

const PAGE_SIZE = 20;
const PAGE_WINDOW_SIZE = 5;

type SearchType = "title" | "infoPostTitle";

const searchFilter: { value: SearchType; label: string }[] = [
  { value: "title", label: "제목" },
  { value: "infoPostTitle", label: "정보글" },
];

const cardStatusMap = {
  ONGOING: "진행중",
  ENDED: "종료",
  OPEN: "모집중",
  CLOSED: "모집마감",
  WAITING: "대기중",
  READ: "읽음",
  UNREAD: "안읽음",
  ACCEPTED: "수락됨",
  DECLINED: "거절됨",
  CANCELLED: "취소됨",
} as const;

/* ---------- 카드 ---------- */

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
            {cardStatusMap[status]}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

/* ---------- 검색바 ---------- */

function SearchBar({
  searchType,
  onSearchTypeChange,
  keyword,
  onKeywordChange,
}: {
  searchType: SearchType;
  onSearchTypeChange: (t: SearchType) => void;
  keyword: string;
  onKeywordChange: (v: string) => void;
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const currentLabel = searchFilter.find((f) => f.value === searchType)?.label;

  return (
    <View className="mb-3">
      <View className="h-12 flex-row items-center overflow-hidden rounded-xl border-[0.5px] border-[#D6DDE5]/60 bg-white">
        {Platform.OS === "android" ? (
          <View
            style={{ width: 100, justifyContent: "center" }}
            className="h-full border-r-[0.5px] border-[#D6DDE5]/60"
          >
            <Picker
              selectedValue={searchType}
              onValueChange={(v) => onSearchTypeChange(v as SearchType)}
              mode="dropdown"
              style={{ height: 80 }}
              dropdownIconColor="#2C2C2C"
            >
              {searchFilter.map((o) => (
                <Picker.Item key={o.value} label={o.label} value={o.value} />
              ))}
            </Picker>
          </View>
        ) : (
          <Pressable
            onPress={() => setIsFilterOpen(true)}
            style={{ width: 75, justifyContent: "center" }}
            className="h-full flex-row items-center gap-1 border-r-[0.5px] border-[#D6DDE5]/60 pl-4 pr-3"
          >
            <Text className="text-[14px] text-[#2C2C2C]">{currentLabel}</Text>
            <ChevronDown size={14} color="#2C2C2C" />
          </Pressable>
        )}

        <View className="flex-1 flex-row items-center gap-2 px-3">
          <Search size={16} color="#B0B0B0" />
          <TextInput
            value={keyword}
            onChangeText={onKeywordChange}
            placeholder="검색어를 입력하세요"
            placeholderTextColor="#B0B0B0"
            className="flex-1 text-[14px] text-[#2C2C2C]"
          />
        </View>
      </View>

      {Platform.OS === "ios" && (
        <Modal
          transparent
          visible={isFilterOpen}
          animationType="slide"
          onRequestClose={() => setIsFilterOpen(false)}
        >
          <Pressable
            onPress={() => setIsFilterOpen(false)}
            className="flex-1 justify-end bg-black/30"
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              className="rounded-t-2xl bg-white pb-8"
            >
              <View className="flex-row justify-end border-b-[0.5px] border-[#D6DDE5] px-4 py-3">
                <Pressable onPress={() => setIsFilterOpen(false)}>
                  <Text className="text-[15px] font-semibold text-[#5E92F0]">
                    완료
                  </Text>
                </Pressable>
              </View>
              <Picker
                selectedValue={searchType}
                onValueChange={(v) => onSearchTypeChange(v as SearchType)}
              >
                {searchFilter.map((o) => (
                  <Picker.Item key={o.value} label={o.label} value={o.value} />
                ))}
              </Picker>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

/* ---------- 카테고리 탭 (team.tsx와 동일 패턴) ---------- */

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
        {categoryFilterOptions.map((category) => {
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

export default function RecruitmentListScreen() {
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("title");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedKeyword(keyword.replace(/\s/g, "")),
      300
    );
    return () => clearTimeout(timer);
  }, [keyword]);

  const { data: recruitmentData } = useRecruitments(
    page - 1,
    PAGE_SIZE,
    debouncedKeyword || undefined
  );
  const recruitments = recruitmentData?.content ?? [];
  const totalPages = recruitmentData?.totalPages ?? 0;
  const currentPage = page;

  const blockStart =
    Math.floor((currentPage - 1) / PAGE_WINDOW_SIZE) * PAGE_WINDOW_SIZE + 1;
  const blockEnd = Math.min(blockStart + PAGE_WINDOW_SIZE - 1, totalPages);
  const visiblePages = Array.from(
    { length: Math.max(blockEnd - blockStart + 1, 0) },
    (_, i) => blockStart + i
  );

  const filtered = recruitments.filter((recruitment) => {
    const title = recruitment.title.replace(/\s/g, "");
    const infoPostTitle = (recruitment.infoPostTitle ?? "").replace(/\s/g, "");

    const matchesCategory =
      selectedCategory === "ALL" || recruitment.category === selectedCategory;
    const matchesKeyword =
      !debouncedKeyword ||
      (searchType === "title"
        ? title.includes(debouncedKeyword)
        : infoPostTitle.includes(debouncedKeyword));

    return matchesCategory && matchesKeyword;
  });

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
          <Text className="text-[20px] font-bold text-[#2C2C2C]">모집</Text>
        </View>

        <Pressable
          onPress={() => router.push("/recruitment/create")}
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
        <SearchBar
          searchType={searchType}
          onSearchTypeChange={(t) => {
            setSearchType(t);
            setPage(1);
          }}
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

        <View>
          {filtered.map((recruitment) => (
            <RecruitmentCard
              key={recruitment.recruitmentId}
              recruitment={recruitment}
            />
          ))}
        </View>

        {filtered.length === 0 && (
          <View className="h-[200px] items-center justify-center">
            <Text className="text-[14px] text-[#989898]">
              모집글이 없습니다
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

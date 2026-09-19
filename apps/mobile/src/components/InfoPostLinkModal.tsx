import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
  type LayoutChangeEvent,
} from "react-native";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ImageIcon,
  X,
} from "lucide-react-native";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useInfoPosts } from "@moimi/core/hooks/useInfoPostQuery";
import { getMyInfoPostScraps } from "@moimi/core/api/scrap";
import type {
  InfoPostSummaryResponse,
  InfoPostCategory,
  GetInfoPostsParams,
} from "@moimi/core/types/infoPost";
import {
  infoPostCategoryFilterOptions,
  infoPostCategoryColorMap,
  infoPostCategoryMap,
} from "@moimi/core/constants/infoPost";
import Checkbox from "@/components/Checkbox";
import { darkenColor } from "@/utils/color/darkenColor";

const PAGE_SIZE = 16;
const PAGE_WINDOW_SIZE = 5;
const LINKABLE_CATEGORIES: InfoPostCategory[] = [
  "CONTEST",
  "CLUB",
  "EXTERNAL_ACTIVITY",
  "INTERN",
];

type InfoPostLinkModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedInfoPostId?: number;
  onSelect: (post: InfoPostSummaryResponse) => void;
};

export default function InfoPostLinkModal({
  visible,
  onClose,
  selectedInfoPostId,
  onSelect,
}: InfoPostLinkModalProps) {
  const linkableOptions = infoPostCategoryFilterOptions.filter((c) =>
    LINKABLE_CATEGORIES.includes(c.value as InfoPostCategory)
  );

  const [category, setCategory] = useState<InfoPostCategory>(
    LINKABLE_CATEGORIES[0]
  );
  const [keywordInput, setKeywordInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [onlyScrapped, setOnlyScrapped] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setSearchKeyword(keywordInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [keywordInput, visible]);

  const handleCategoryChange = (next: InfoPostCategory) => {
    setCategory(next);
    setPage(1);
  };

  const handleToggleOnlyScrapped = (checked: boolean) => {
    setOnlyScrapped(checked);
    setPage(1);
  };

  const queryParams: GetInfoPostsParams = {
    category,
    keyword: searchKeyword || undefined,
    page: page - 1,
    size: PAGE_SIZE,
    sort: ["createdAt,DESC"],
  };

  const { data: categoryPage, isLoading: isCategoryLoading } = useInfoPosts(
    queryParams,
    { enabled: visible && !onlyScrapped }
  );

  const { data: scrapPage, isLoading: isScrapLoading } = useQuery({
    queryKey: ["scraps", "infoPosts", "page", page - 1, PAGE_SIZE],
    queryFn: () => getMyInfoPostScraps(page - 1, PAGE_SIZE),
    enabled: visible && onlyScrapped,
    placeholderData: keepPreviousData,
  });

  const resultPage = onlyScrapped ? scrapPage : categoryPage;
  const isLoading = onlyScrapped ? isScrapLoading : isCategoryLoading;
  const posts: InfoPostSummaryResponse[] = resultPage?.content ?? [];
  const totalPages = resultPage?.totalPages ?? 0;
  const currentPage = totalPages === 0 ? 1 : Math.min(page, totalPages);
  const blockStart =
    Math.floor((currentPage - 1) / PAGE_WINDOW_SIZE) * PAGE_WINDOW_SIZE + 1;
  const blockEnd = Math.min(blockStart + PAGE_WINDOW_SIZE - 1, totalPages);
  const pageNumbers = Array.from(
    { length: blockEnd - blockStart + 1 },
    (_, i) => blockStart + i
  );

  // 탭 슬라이드 인디케이터
  const [tabsWidth, setTabsWidth] = useState(0);
  const indicatorX = useSharedValue(0);
  const tabWidth = tabsWidth / (linkableOptions.length || 1);

  const onTabsLayout = (e: LayoutChangeEvent) => {
    setTabsWidth(e.nativeEvent.layout.width);
  };

  useEffect(() => {
    if (!tabsWidth) return;
    const index = linkableOptions.findIndex((c) => c.value === category);
    indicatorX.value = withSpring(index * tabWidth, {
      damping: 34,
      stiffness: 450,
      mass: 1,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, tabsWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: tabWidth,
  }));

  const handleSelect = (post: InfoPostSummaryResponse) => {
    if (!post.linkable) return;
    onSelect(post);
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end"
      >
        <Pressable onPress={onClose} className="flex-1" />

        <View style={{ height: "88%" }} className="rounded-t-3xl bg-white">
          <View className="flex-row items-center justify-between border-b-[0.5px] border-[#D6DDE5]/40 px-6 pt-2 pb-3">
            <Text className="text-[18px] font-bold text-[#2C2C2C]">
              공고 연결하기
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={18} strokeWidth={2} color={"#b0b0b0"} />
            </Pressable>
          </View>

          {/* 카테고리 탭 */}
          <View
            onLayout={onTabsLayout}
            style={{ opacity: onlyScrapped ? 0.4 : 1 }}
            className="relative flex-row border-b-[0.5px] border-[#D6DDE5]/40"
          >
            {linkableOptions.map((c) => {
              const isActive = !onlyScrapped && category === c.value;
              return (
                <Pressable
                  key={c.value}
                  disabled={onlyScrapped}
                  onPress={() =>
                    handleCategoryChange(c.value as InfoPostCategory)
                  }
                  className="flex-1 items-center py-4"
                >
                  <Text
                    className={`text-[15px] font-bold ${
                      isActive ? "text-[#5E92F0]" : "text-[#CBD2DA]"
                    }`}
                  >
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
            {tabsWidth > 0 && (
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    height: 2,
                    backgroundColor: "#5E92F0",
                  },
                  indicatorStyle,
                ]}
              />
            )}
          </View>

          {/* 검색 + 스크랩 필터 */}
          <View className="flex-row items-center justify-between px-5 py-3">
            <View
              style={{ opacity: onlyScrapped ? 0.4 : 1 }}
              className="h-10 flex-1 flex-row items-center gap-2 rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-3"
            >
              <Search size={16} color="#989898" />
              <TextInput
                value={keywordInput}
                onChangeText={setKeywordInput}
                placeholder="제목을 입력하세요"
                placeholderTextColor="#989898"
                editable={!onlyScrapped}
                className="flex-1 text-[14px] text-[#2C2C2C]"
              />
            </View>
            <View className="ml-3">
              <Checkbox
                checked={onlyScrapped}
                onChange={handleToggleOnlyScrapped}
                label="스크랩한 글만"
                size="sm"
              />
            </View>
          </View>

          {/* 리스트 */}
          <ScrollView
            className="flex-1 px-5"
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {isLoading && (
              <View className="h-[240px] items-center justify-center">
                <Text className="text-[13px] text-[#989898]">
                  불러오는 중입니다
                </Text>
              </View>
            )}

            {!isLoading && posts.length === 0 && (
              <View className="h-[240px] items-center justify-center">
                <Text className="text-[13px] text-[#989898]">
                  {onlyScrapped
                    ? "스크랩한 정보글이 없습니다"
                    : "연결 가능한 공고가 없습니다"}
                </Text>
              </View>
            )}

            {!isLoading && posts.length > 0 && (
              <View className="flex-row flex-wrap justify-between">
                {posts.map((post) => {
                  const isSelected = selectedInfoPostId === post.infoPostId;
                  const isDisabled = !post.linkable;
                  const badgeColor = infoPostCategoryColorMap[post.category];

                  return (
                    <View
                      key={post.infoPostId}
                      style={{
                        width: "48%",
                        marginBottom: 14,
                        borderWidth: 0.5,
                        borderColor: isSelected ? "#5E92F0" : "#D6DDE5",
                        opacity: isDisabled ? 0.5 : 1,
                      }}
                      className="overflow-hidden rounded-2xl"
                    >
                      <View
                        style={{ aspectRatio: 4 / 3 }}
                        className="w-full items-center justify-center bg-[#F6F8FA]"
                      >
                        {post.thumbnailUrl ? (
                          <Image
                            source={{ uri: post.thumbnailUrl }}
                            style={{ width: "100%", height: "100%" }}
                            resizeMode="cover"
                          />
                        ) : (
                          <ImageIcon
                            size={22}
                            color="#B8C0CA"
                            strokeWidth={1.7}
                          />
                        )}
                      </View>

                      <View
                        style={{ minHeight: 135 }}
                        className="justify-between gap-1.5 p-3"
                      >
                        <View className="gap-1">
                          <View
                            style={{
                              backgroundColor: badgeColor,
                              alignSelf: "flex-start",
                            }}
                            className="rounded-full px-2.5 py-1.5"
                          >
                            <Text
                              style={{ color: darkenColor(badgeColor, 140) }}
                              className="text-[11px] font-semibold"
                            >
                              {infoPostCategoryMap[post.category]}
                            </Text>
                          </View>

                          <Text
                            numberOfLines={2}
                            className="text-[14px] font-semibold text-[#2C2C2C]"
                          >
                            {post.title}
                          </Text>

                          <Text className="text-[11px] text-[#989898]">
                            연결된 모집글 {post.recruitmentCount}개
                          </Text>
                        </View>

                        <Pressable
                          onPress={() => handleSelect(post)}
                          disabled={isDisabled}
                          style={{
                            backgroundColor: isDisabled
                              ? "#EEF1F5"
                              : isSelected
                              ? "#EEF1F5"
                              : "#5E92F0",
                          }}
                          className="h-8 items-center justify-center rounded-lg"
                        >
                          <Text
                            style={{
                              color: isDisabled
                                ? "#B0B0B0"
                                : isSelected
                                ? "#5E92F0"
                                : "#FFFFFF",
                            }}
                            className="text-[12px] font-semibold"
                          >
                            {isDisabled
                              ? "연결 불가"
                              : isSelected
                              ? "선택됨"
                              : "공고 선택하기"}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {totalPages > 0 && (
              <View className="mt-2 mb-8 flex-row items-center justify-center gap-3 py-3">
                <Pressable
                  onPress={() =>
                    setPage(Math.max(1, blockStart - PAGE_WINDOW_SIZE))
                  }
                  disabled={blockStart === 1}
                  hitSlop={8}
                  style={{ opacity: blockStart === 1 ? 0.4 : 1 }}
                >
                  <ChevronLeft size={20} strokeWidth={2.5} color="#2C2C2C" />
                </Pressable>

                {pageNumbers.map((n) => (
                  <Pressable key={n} onPress={() => setPage(n)} hitSlop={6}>
                    <Text
                      className={`text-[15px] font-semibold ${
                        currentPage === n
                          ? "text-[#5E92F0]"
                          : "text-[#2C2C2C]/50"
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
                  hitSlop={8}
                  style={{ opacity: blockEnd === totalPages ? 0.4 : 1 }}
                >
                  <ChevronRight size={20} strokeWidth={2.5} color="#2C2C2C" />
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

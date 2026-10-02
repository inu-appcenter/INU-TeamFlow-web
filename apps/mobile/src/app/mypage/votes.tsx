import { useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  LayoutChangeEvent,
} from "react-native";
import { router } from "expo-router";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { ChevronLeft } from "lucide-react-native";
import { useMyVotes } from "@moimi/core/hooks/useMypageVoteQuery";
import type { MyVote, VoteTab } from "@moimi/core/types/mypageVote";
import { categoryColorMap } from "@moimi/core/constants/category";
import { formatDate } from "@/utils/date/formatDate";

const categories: { label: string; value: VoteTab }[] = [
  { label: "전체", value: "ALL" },
  { label: "진행중", value: "ONGOING" },
  { label: "종료", value: "ENDED" },
];

const formatTime = (time: string | null) => {
  if (!time) return "";
  return time.slice(0, 5);
};

/* ---------- 탭 (기존 패턴 재사용) ---------- */

function CategoryTabs({
  selected,
  onChange,
}: {
  selected: VoteTab;
  onChange: (v: VoteTab) => void;
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

  const handleSelect = (value: VoteTab) => {
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

function VoteCard({ vote }: { vote: MyVote }) {
  const color = categoryColorMap[vote.teamCategory] ?? "#E9E9E9";
  const totalCount =
    vote.completedVoterList.length + vote.uncompletedVoterList.length;
  const timeLabel = vote.isAllDay
    ? "하루 종일"
    : `${formatTime(vote.dailyTimeStart)}~${formatTime(vote.dailyTimeEnd)}`;

  return (
    <Pressable
      onPress={() =>
        router.push(`/team/${vote.teamId}/vote/${vote.voteId}` as never)
      }
      style={{ borderLeftWidth: 12, borderLeftColor: color }}
      className="mb-3 rounded-2xl bg-white p-5 active:bg-[#FAFAFA]"
    >
      <View className="flex-row items-center justify-between">
        <Text
          className="flex-1 text-[17px] font-bold text-[#2C2C2C]"
          numberOfLines={1}
        >
          {vote.title}
        </Text>
        <View
          className={`shrink-0 rounded-full px-3 py-1.5 ${
            vote.isOpened ? "bg-[#DDF7E5]" : "bg-[#EEF1F5]"
          }`}
        >
          <Text
            className={`text-[12px] font-medium ${
              vote.isOpened ? "text-[#2E7845]" : "text-[#989898]"
            }`}
          >
            {vote.isOpened ? "진행중" : "종료"}
          </Text>
        </View>
      </View>

      {!!vote.description && (
        <Text className="mt-1.5 text-[13px] text-[#989898]" numberOfLines={1}>
          {vote.description}
        </Text>
      )}

      <View className="mt-4 flex-row items-center gap-3">
        <Text className="text-[12px] text-[#989898]">
          날짜 후보 {vote.dates.length}개
        </Text>
        <Text className="text-[12px] text-[#989898]">{timeLabel}</Text>
      </View>

      <View className="mt-1 flex-row items-center justify-between">
        <Text className="text-[12px] text-[#989898]">
          {formatDate(vote.createdDate)}
        </Text>
        <Text className="text-[12px] font-medium text-[#5E92F0]">
          완료 {vote.completedVoterList.length}/{totalCount}명
        </Text>
      </View>
    </Pressable>
  );
}

/* ---------- 메인 화면 ---------- */

export default function VotesScreen() {
  const [selectedCategory, setSelectedCategory] = useState<VoteTab>("ALL");

  const { data: votes = [], isLoading, isError } = useMyVotes();

  const sortedVotes = [...votes].sort(
    (a, b) =>
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
  );

  const filteredVotes = sortedVotes.filter((vote) => {
    if (selectedCategory === "ALL") return true;
    if (selectedCategory === "ONGOING") return vote.isOpened;
    return !vote.isOpened;
  });

  return (
    <View className="flex-1 bg-[#F0F2F5]">
      <View
        style={{ paddingTop: 60 }}
        className="flex-row items-center gap-3 bg-[#F0F2F5] px-5 pb-4"
      >
        <Pressable onPress={() => router.back()} className="active:opacity-70">
          <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
        </Pressable>
        <Text className="text-[20px] font-bold text-[#2C2C2C]">내 투표</Text>
      </View>

      <View className="px-4">
        <CategoryTabs
          selected={selectedCategory}
          onChange={setSelectedCategory}
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
              투표 내역을 불러오는 중입니다
            </Text>
          </View>
        ) : isError ? (
          <View className="h-[250px] items-center justify-center">
            <Text className="text-[14px] text-[#989898]">
              투표 내역을 불러오지 못했습니다
            </Text>
          </View>
        ) : filteredVotes.length === 0 ? (
          <View className="h-[250px] items-center justify-center">
            <Text className="text-[14px] text-[#989898]">
              투표 내역이 없습니다
            </Text>
          </View>
        ) : (
          filteredVotes.map((vote) => (
            <VoteCard key={vote.voteId} vote={vote} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

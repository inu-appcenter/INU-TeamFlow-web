import { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

import { useTeamDetail } from "@moimi/core/hooks/team/useTeamQuery";
import { useTeamVotes } from "@moimi/core/hooks/useVoteQuery";
import { categoryMap, categoryColorMap } from "@moimi/core/constants/category";

const ITEMS_PER_PAGE = 10;
const PAGE_WINDOW_SIZE = 5;

export default function TeamVoteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const teamId = Number(id);

  const { data: team, isLoading: isTeamLoading } = useTeamDetail(teamId);
  const { data: teamVotes = [], isLoading: isVotesLoading } =
    useTeamVotes(teamId);

  const [errorMessage, setErrorMessage] = useState("");
  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 1800);
  };

  const [page, setPage] = useState(1);

  const sorted = useMemo(
    () =>
      [...teamVotes].sort((a, b) => b.createdDate.localeCompare(a.createdDate)),
    [teamVotes]
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  const blockStart =
    Math.floor((currentPage - 1) / PAGE_WINDOW_SIZE) * PAGE_WINDOW_SIZE + 1;
  const blockEnd = Math.min(blockStart + PAGE_WINDOW_SIZE - 1, totalPages);
  const visiblePages = Array.from(
    { length: blockEnd - blockStart + 1 },
    (_, i) => blockStart + i
  );

  const paged = sorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isTeamLoading || isVotesLoading) return null;

  if (!team) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F0F2F5]">
        <Text className="font-semibold text-[#2C2C2C]">
          존재하지 않는 팀입니다.
        </Text>
      </View>
    );
  }

  const handleVoteClick = (vote: (typeof teamVotes)[number]) => {
    if (!vote.isVoter && !vote.isCreator) {
      showErrorMessage("투표 참여자가 아니에요");
      return;
    }
    router.push(`/team/${teamId}/vote/${vote.voteId}`);
  };

  return (
    <View className="flex-1 bg-white">
      <View
        style={{
          paddingTop: 60,
          backgroundColor: categoryColorMap[team.category] ?? "#E9E9E9",
        }}
        className="flex-row items-center justify-between px-6 pb-4"
      >
        <View className="flex-row items-center gap-4">
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
          </Pressable>
          <Text className="text-[20px] font-bold text-[#2C2C2C]">투표</Text>
        </View>

        <View className="rounded-full bg-white/80 px-5 py-2">
          <Text className="text-[14px] font-semibold text-[#2C2C2C]">
            {categoryMap[team.category]}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {paged.map((vote) => {
          const completed = vote.completedVoterList?.length ?? 0;
          const total =
            (vote.completedVoterList?.length ?? 0) +
            (vote.uncompletedVoterList?.length ?? 0);
          const progress = total === 0 ? 0 : (completed / total) * 100;
          const canAccess = vote.isVoter || vote.isCreator;

          return (
            <Pressable
              key={vote.voteId}
              onPress={() => handleVoteClick(vote)}
              style={{ opacity: canAccess ? 1 : 0.5 }}
              className="border-b-[0.5px] border-[#D6DDE5] py-5 transition-transform duration-150 ease-out active:scale-[0.99]"
            >
              <View className="flex-row justify-start items-center gap-3">
                <Text
                  numberOfLines={1}
                  className="text-[18px] font-semibold text-[#2C2C2C]"
                >
                  {vote.title}
                </Text>
                <View
                  className={`shrink-0 rounded-full px-3 py-1.5 ${
                    vote.isOpened ? "bg-[#E8F1FF]" : "bg-[#EEF1F5]"
                  }`}
                >
                  <Text
                    className={`text-[12px] font-medium ${
                      vote.isOpened ? "text-[#5E92F0]" : "text-[#989898]"
                    }`}
                  >
                    {vote.isOpened ? "진행중" : "마감"}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between gap-3">
                <Text
                  numberOfLines={1}
                  className="mt-1.5 flex-1 text-[13px] text-[#989898]"
                >
                  {vote.description}
                </Text>
                <Text className="mt-1.5 shrink-0 text-[11px] text-[#989898]">
                  {vote.createdDate}
                </Text>
              </View>

              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-[11px] text-[#989898]">
                  참여율 {completed}/{total}
                </Text>
                <Text className="text-[11px] font-medium text-[#5E92F0]">
                  {Math.round(progress)}%
                </Text>
              </View>

              <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E6EAF0]">
                <View
                  className="h-full rounded-full bg-[#5E92F0]"
                  style={{ width: `${progress}%` }}
                />
              </View>
            </Pressable>
          );
        })}

        {paged.length === 0 && (
          <View className="h-[300px] items-center justify-center">
            <Text className="text-[13px] text-[#989898]">
              아직 등록된 투표가 없어요
            </Text>
          </View>
        )}

        {sorted.length > 0 && (
          <View className="flex-row items-center justify-center gap-2 py-6">
            <Pressable
              onPress={() =>
                setPage(Math.max(1, blockStart - PAGE_WINDOW_SIZE))
              }
              disabled={blockStart === 1}
              hitSlop={8}
              style={{ opacity: blockStart === 1 ? 0.4 : 1 }}
              className="items-center justify-center transition-transform duration-150 ease-out active:scale-90"
            >
              <ChevronLeft size={22} strokeWidth={2.5} color="#2c2c2c66" />
            </Pressable>

            {visiblePages.map((n) => (
              <Pressable
                key={n}
                onPress={() => setPage(n)}
                hitSlop={6}
                className="items-center justify-center px-1 transition-transform duration-150 ease-out active:scale-90"
              >
                <Text
                  className={`text-[16px] font-semibold ${
                    currentPage === n ? "text-[#5E92F0]" : "text-[#2c2c2c80]"
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
              className="items-center justify-center transition-transform duration-150 ease-out active:scale-90"
            >
              <ChevronRight size={22} strokeWidth={2.5} color="#2c2c2c66" />
            </Pressable>
          </View>
        )}
      </ScrollView>

      {errorMessage && (
        <View
          style={{ position: "absolute", top: 100, left: 0, right: 0 }}
          className="items-center"
        >
          <View className="rounded-full bg-[#2C2C2C] px-5 py-2">
            <Text className="text-[13px] font-semibold text-white">
              {errorMessage}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

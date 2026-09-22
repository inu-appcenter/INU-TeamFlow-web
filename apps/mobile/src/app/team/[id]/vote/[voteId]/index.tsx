import { useEffect, useState, useRef } from "react";
import { View, Text, Pressable, ScrollView, Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
} from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { categoryMap, categoryColorMap } from "@moimi/core/constants/category";
import { useTeamDetail } from "@moimi/core/hooks/team/useTeamQuery";
import {
  useVoteDetail,
  useVoteSlots,
  useSelectVoteSlots,
  useConfirmVoteResult,
  useDeleteVote,
} from "@moimi/core/hooks/useVoteQuery";
import { getDepartmentName } from "@/utils/user/getDepartmentName";
import VoteForm from "@/components/VoteForm";
import VoteResult from "@/components/VoteResult";

const LABEL_COL_WIDTH = 22;
const DATE_COL_WIDTH = 72;
const COLUMN_GAP = 4;
type ParticipantTab = "completed" | "uncompleted";

export default function VoteDetailScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();
  const { id, voteId: voteIdParam } = useLocalSearchParams<{
    id: string;
    voteId: string;
  }>();
  const teamId = Number(id);
  const voteId = Number(voteIdParam);

  const [isParticipantListOpen, setIsParticipantListOpen] = useState(false);
  const [participantTab, setParticipantTab] =
    useState<ParticipantTab>("completed");
  const [isVoting, setIsVoting] = useState(false);
  const [isSelectingResult, setIsSelectingResult] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [tabLayouts, setTabLayouts] = useState<{
    completed: { x: number; width: number };
    uncompleted: { x: number; width: number };
  }>({
    completed: { x: 0, width: 0 },
    uncompleted: { x: 0, width: 0 },
  });

  const indicatorLeft = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  useEffect(() => {
    const layout = tabLayouts[participantTab];
    if (layout.width > 0) {
      indicatorLeft.value = withTiming(layout.x, { duration: 200 });
      indicatorWidth.value = withTiming(layout.width, { duration: 200 });
    }
  }, [participantTab, tabLayouts]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: indicatorLeft.value,
    width: indicatorWidth.value,
  }));

  const { data: team, isLoading: isTeamLoading } = useTeamDetail(teamId);
  const {
    data: vote,
    isLoading: isVoteLoading,
    refetch: refetchVote,
  } = useVoteDetail(voteId);
  const { data: voteSlots = [] } = useVoteSlots(voteId);
  const { mutateAsync: selectSlots } = useSelectVoteSlots(voteId);
  const { mutateAsync: confirmResult } = useConfirmVoteResult(voteId);
  const { mutate: deleteVoteMutate, isPending: isDeleting } =
    useDeleteVote(teamId);

  if (isTeamLoading || isVoteLoading) return null;

  if (!team || !vote) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F0F2F5]">
        <Text className="font-semibold text-[#2C2C2C]">
          존재하지 않는 투표입니다.
        </Text>
      </View>
    );
  }

  const isAdmin = team.role === "LEADER" || team.role === "MANAGER";
  const canAccess = vote.isVoter || vote.isCreator;

  if (!canAccess) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F0F2F5]">
        <Text className="font-semibold text-[#2C2C2C]">
          참여자만 조회할 수 있는 투표예요
        </Text>
      </View>
    );
  }

  const voteDates = vote.dates ?? [];
  const startHour = Number(vote.dailyTimeStart?.slice(0, 2));
  const endHour = Number(vote.dailyTimeEnd?.slice(0, 2));

  const voteHours = vote.isAllDay
    ? [0]
    : startHour !== undefined &&
      endHour !== undefined &&
      !isNaN(startHour) &&
      !isNaN(endHour)
    ? Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
    : [];

  const participantList =
    participantTab === "completed"
      ? vote.completedVoterList ?? []
      : vote.uncompletedVoterList ?? [];

  const maxParticipantCount = Math.max(
    1,
    ...voteSlots.map((slot) => slot.participantCount)
  );

  const getSlotColor = (participantCount: number) => {
    const ratio = participantCount / maxParticipantCount;
    if (ratio >= 0.8) return "#729BEFCC";
    if (ratio >= 0.5) return "#BBD2FFE6";
    if (ratio > 0) return "#DCE8FFCC";
    return "#F1F4F8";
  };

  const handleDeleteVote = () => {
    if (isDeleting) return;
    deleteVoteMutate(voteId, {
      onSuccess: () => {
        router.back();
      },
    });
  };

  return (
    <View className="flex-1 bg-white">
      {/* 헤더 */}
      <View
        style={{
          paddingTop: 60,
          backgroundColor: categoryColorMap[team.category] ?? "#E9E9E9",
        }}
        className="flex-row items-center justify-between px-6 pb-4"
      >
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
        </Pressable>

        <View className="flex-row items-center gap-3">
          <View className="rounded-full bg-white/80 px-5 py-2">
            <Text className="text-[14px] font-semibold text-[#2C2C2C]">
              {categoryMap[team.category]}
            </Text>
          </View>

          {isAdmin && (
            <Pressable
              onPress={() => setIsMenuOpen((v) => !v)}
              hitSlop={10}
              className="p-1"
            >
              <EllipsisVertical size={20} color="#2C2C2C" />
            </Pressable>
          )}
        </View>
      </View>

      {isVoting ? (
        <ScrollView className="flex-1 px-8 pt-6">
          <Text className="mt-3 text-[22px] font-bold text-[#2C2C2C]">
            {vote.title}
          </Text>
          <Text className="mt-1 text-[16px] font-semibold text-[#989898]">
            가능한 날짜와 시간대를 선택해주세요
          </Text>

          <VoteForm
            voteId={voteId}
            voteDates={voteDates}
            voteHours={voteHours}
            voteSlots={voteSlots}
            isAllDay={vote.isAllDay}
            isOpened={vote.isOpened}
            onSubmit={async (selectedSlotIds) => {
              try {
                await selectSlots({ slotIdList: selectedSlotIds });
                setIsVoting(false);
              } catch (err) {
                console.error("투표 실패", err);
              }
            }}
          />
        </ScrollView>
      ) : isSelectingResult ? (
        <ScrollView className="flex-1 px-8 pt-6">
          <VoteResult
            title={vote.title}
            voteDates={voteDates}
            voteHours={voteHours}
            voteSlots={voteSlots}
            isAllDay={vote.isAllDay}
            onBack={() => setIsSelectingResult(false)}
            onSubmit={async (startAt, endAt) => {
              try {
                await confirmResult({
                  title: vote.title,
                  isAllDay: vote.isAllDay,
                  selectedStartAt:
                    startAt.length === 16 ? `${startAt}:00` : startAt,
                  selectedEndAt: endAt.length === 16 ? `${endAt}:00` : endAt,
                });
                setIsSelectingResult(false);
              } catch (err) {
                console.error("일정 확정 실패", err);
              }
            }}
          />
        </ScrollView>
      ) : (
        <ScrollView ref={scrollRef} className="flex-1">
          <View className="border-b-[0.5px] border-[#D6DDE5]/60 px-8 py-6">
            <Text className="text-[13px] font-bold text-[#989898]">
              일정 정보
            </Text>
            <Text className="mt-3 text-[24px] font-bold text-[#2C2C2C]">
              {vote.title}
            </Text>
            <Text className="mt-1.5 text-[15px] leading-6 text-[#5C5C5C]">
              {vote.description}
            </Text>
            <Text className="mt-2 text-[11px] text-[#B0B0B0]">
              {vote.createdDate}
            </Text>
          </View>

          <View className="px-8 py-6">
            {isParticipantListOpen ? (
              <>
                <Pressable
                  onPress={() => {
                    setIsParticipantListOpen(false);
                    scrollRef.current?.scrollTo({ y: 0, animated: true });
                  }}
                  className="mb-8 flex-row items-center gap-1 -ml-2"
                >
                  <ChevronLeft size={17} strokeWidth={2.5} color="#989898" />
                  <Text className="text-[13px] font-bold text-[#989898]">
                    뒤로가기
                  </Text>
                </Pressable>

                <View className="relative flex-row border-b-[0.5px] border-[#D6DDE5]">
                  <Pressable
                    onLayout={(e) => {
                      const { x, width } = e.nativeEvent.layout;
                      setTabLayouts((prev) => ({
                        ...prev,
                        completed: { x, width },
                      }));
                    }}
                    onPress={() => setParticipantTab("completed")}
                    className="px-6 pb-4"
                  >
                    <Text
                      className={`text-[17px] font-bold ${
                        participantTab === "completed"
                          ? "text-[#5E92F0]"
                          : "text-[#D6DDE5]"
                      }`}
                    >
                      참여자
                    </Text>
                  </Pressable>

                  <Pressable
                    onLayout={(e) => {
                      const { x, width } = e.nativeEvent.layout;
                      setTabLayouts((prev) => ({
                        ...prev,
                        uncompleted: { x, width },
                      }));
                    }}
                    onPress={() => setParticipantTab("uncompleted")}
                    className="px-5 pb-3"
                  >
                    <Text
                      className={`text-[17px] font-bold ${
                        participantTab === "uncompleted"
                          ? "text-[#5E92F0]"
                          : "text-[#D6DDE5]"
                      }`}
                    >
                      미참여자
                    </Text>
                  </Pressable>

                  <Animated.View
                    style={[
                      { position: "absolute", bottom: 0, height: 2 },
                      indicatorStyle,
                    ]}
                    className="bg-[#5E92F0]"
                  />
                </View>

                <View className="mt-6">
                  {participantList.length === 0 ? (
                    <View className="h-20 items-center justify-center">
                      <Text className="text-[13px] font-medium text-[#989898]">
                        {participantTab === "completed"
                          ? "아직 투표에 참여한 사람이 없어요"
                          : "모든 팀원이 투표에 참여했어요"}
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row flex-wrap justify-between gap-y-5">
                      {participantList.map((voter) => (
                        <View
                          key={voter.name}
                          style={{ width: "47%" }}
                          className="flex-row justify-between"
                        >
                          <Text className="text-[14px] font-semibold text-[#2C2C2C]">
                            {voter.name}
                          </Text>
                          <Text className="text-[14px] text-[#989898]">
                            {getDepartmentName(voter.department)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </>
            ) : (
              <>
                <Text className="text-[13px] font-bold text-[#989898]">
                  참여 현황
                </Text>

                <View className="mt-6 flex-row ">
                  {/* 고정 라벨 컬럼 (스크롤 안 됨) */}
                  <View style={{ width: LABEL_COL_WIDTH }} className="pr-2">
                    <View style={{ height: 18 }} />
                    <View style={{ marginTop: 8, gap: 4 }}>
                      {voteHours.map((hour) => (
                        <View
                          key={hour}
                          style={{ height: vote.isAllDay ? 64 : 44 }}
                          className="items-end justify-start pt-0.5"
                        >
                          <Text className="text-[11px] text-[#B0B0B0]">
                            {vote.isAllDay ? "종일" : hour}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 날짜 컬럼만 가로 스크롤 + 가운데 정렬 */}
                  <ScrollView
                    horizontal
                    contentContainerStyle={{
                      flexGrow: 1,
                      justifyContent: "center",
                    }}
                  >
                    <View>
                      <View
                        className="flex-row"
                        style={{ gap: COLUMN_GAP, height: 18 }}
                      >
                        {voteDates.map((date) => (
                          <View
                            key={date}
                            style={{ width: DATE_COL_WIDTH }}
                            className="items-center justify-center"
                          >
                            <Text className="text-[11px] font-medium text-[#5c5c5c]">
                              {Number(date.slice(5, 7))}월{" "}
                              {Number(date.slice(8, 10))}일
                            </Text>
                          </View>
                        ))}
                      </View>

                      <View
                        className="flex-row "
                        style={{ gap: COLUMN_GAP, marginTop: 8 }}
                      >
                        {voteDates.map((date) => (
                          <View
                            key={date}
                            style={{ width: DATE_COL_WIDTH, gap: 4 }}
                          >
                            {voteHours.map((hour) => {
                              const slots = vote.isAllDay
                                ? ["00"]
                                : ["00", "30"];
                              return slots.map((minute) => {
                                const slot = voteSlots.find(
                                  (s) =>
                                    s.date === date &&
                                    Number(s.startAt.slice(0, 2)) === hour &&
                                    s.startAt.slice(3, 5) === minute
                                );

                                return (
                                  <View
                                    key={`${date}-${hour}-${minute}`}
                                    style={{
                                      height: vote.isAllDay ? 64 : 20,
                                      borderRadius: 6,
                                      backgroundColor: slot
                                        ? getSlotColor(slot.participantCount)
                                        : "#F1F4F8",
                                    }}
                                  />
                                );
                              });
                            })}
                          </View>
                        ))}
                      </View>
                    </View>
                  </ScrollView>
                </View>
              </>
            )}
          </View>

          {!isParticipantListOpen && (
            <>
              <View className="mt-4 mb-12 flex-row px-8">
                <Pressable
                  onPress={() => {
                    setIsParticipantListOpen(true);
                    refetchVote();
                    scrollRef.current?.scrollTo({ y: 0, animated: true });
                  }}
                  className="transition-transform duration-150 ease-out active:scale-90 ml-auto flex-row items-center gap-1 rounded-full border-[0.5px] border-[#D6DDE5]/40 bg-[#EEF1F5] py-1.5 pl-4 pr-2"
                >
                  <Text className="text-[13px] font-bold text-[#2c2c2c99]">
                    참여자 목록보기
                  </Text>
                  <ChevronRight size={18} strokeWidth={2.5} color="#2c2c2c99" />
                </Pressable>
              </View>

              <View className="mb-16 items-center gap-4">
                <Pressable
                  onPress={() =>
                    vote.isOpened && vote.isVoter && setIsVoting(true)
                  }
                  disabled={!vote.isOpened || !vote.isVoter}
                  style={{ width: 140 }}
                  className={`flex-1 justify-center items-center rounded-xl h-12 ${
                    vote.isOpened && vote.isVoter
                      ? "bg-[#5E92F0]"
                      : "bg-[#EEF1F5]"
                  }`}
                >
                  <Text
                    className={`text-[15px] font-semibold ${
                      vote.isOpened && vote.isVoter
                        ? "text-white "
                        : "text-[#989898]"
                    }`}
                  >
                    {vote.isOpened
                      ? vote.isVoter
                        ? "투표하기"
                        : "투표 미대상"
                      : "투표 마감"}
                  </Text>
                </Pressable>

                {isAdmin && (
                  <Pressable
                    onPress={() => vote.isOpened && setIsSelectingResult(true)}
                    disabled={!vote.isOpened}
                    style={{ width: 140 }}
                    className={`flex-1 mb-12 justify-center items-center rounded-xl h-12 ${
                      vote.isOpened
                        ? "border-[0.5px] border-[#D6DDE5]/40 bg-[#EEF1F5]"
                        : "bg-[#EEF1F5]"
                    }`}
                  >
                    <Text
                      className={`text-[15px] font-semibold ${
                        vote.isOpened ? "text-[#5E92F0]" : "text-[#989898]"
                      }`}
                    >
                      {vote.isOpened ? "일정 확정하기" : "확정 완료"}
                    </Text>
                  </Pressable>
                )}
              </View>
            </>
          )}
        </ScrollView>
      )}

      {/* 관리자 메뉴 (ellipsis 오버레이) */}
      {isMenuOpen && (
        <>
          <Pressable
            onPress={() => setIsMenuOpen(false)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          <View
            style={{ position: "absolute", top: 90, right: 20 }}
            className="w-[120px] rounded-2xl border-[0.5px] border-[#D6DDE5] bg-white py-1"
          >
            <Pressable
              onPress={() => {
                setIsMenuOpen(false);
                setIsDeleteConfirmOpen(true);
              }}
              disabled={isDeleting}
              className="px-4 py-2.5"
            >
              <Text className="text-[14px] font-semibold text-[#E22222]">
                삭제하기
              </Text>
            </Pressable>
          </View>
        </>
      )}

      {/* 삭제 확인 */}
      <Modal
        transparent
        visible={isDeleteConfirmOpen}
        animationType="fade"
        onRequestClose={() => setIsDeleteConfirmOpen(false)}
      >
        <Pressable
          onPress={() => setIsDeleteConfirmOpen(false)}
          className="flex-1 items-center justify-center bg-black/40 px-6"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full max-w-[340px] rounded-3xl bg-white px-6 py-6"
          >
            <Text className="text-center text-[19px] font-bold text-[#2C2C2C]">
              투표를 삭제할까요?
            </Text>
            <Text className="mt-2 text-center text-[14px] text-[#989898]">
              삭제한 투표는 복구할 수 없어요
            </Text>

            <View className="mt-5 flex-row gap-3">
              <Pressable
                onPress={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 items-center rounded-xl border border-[#D6DDE5]/60 bg-[#F6F8FA] py-4"
              >
                <Text className="text-[14px] font-semibold text-[#2C2C2C]">
                  취소
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setIsDeleteConfirmOpen(false);
                  handleDeleteVote();
                }}
                className="flex-1 items-center rounded-xl bg-[#E22222] py-4"
              >
                <Text className="text-[14px] font-semibold text-white">
                  삭제
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

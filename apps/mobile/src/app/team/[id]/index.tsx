// app/team/[id]/index.tsx
import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  Image,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Menu,
  Pencil,
  Check,
} from "lucide-react-native";
import { useCreateVote } from "@moimi/core/hooks/useVoteQuery";
import { useCreateInvitation } from "@moimi/core/hooks/team/useTeamInvitationQuery";
import {
  useTeamDetail,
  useTeamMembers,
} from "@moimi/core/hooks/team/useTeamQuery";
import VoteAddModal, {
  type EventVoteCreateRequest,
} from "@/components/VoteAddModal";
import { useTeamNotices } from "@moimi/core/hooks/useNoticeQuery";
import { useTeamVotes } from "@moimi/core/hooks/useVoteQuery";
import {
  useCreateTeamEvent,
  useUpdateTeamEvent,
  useDeleteTeamEvent,
} from "@moimi/core/hooks/calendar/useEventQuery";
import { useCalendarGrid } from "@moimi/core/hooks/calendar/useCalendarGrid";
import { useCalendarWeeks } from "@moimi/core/hooks/calendar/useCalendarWeeks";
import { useTeamMonthSchedules } from "@moimi/core/hooks/team/useTeamMonthSchedules";
import { categoryMap, categoryColorMap } from "@moimi/core/constants/category";
import type {
  Schedule,
  RecurrenceEditScope,
  MyEventCreateRequest,
} from "@moimi/core/types/event";
import { formatDateKey, isScheduleOnDate } from "@/utils/date/calendar";
import { formatDate } from "@/utils/date/formatDate";
import { getTeamRoleLabel } from "@/utils/user/teamRole";
import { getDday } from "@/utils/date/getDday";
import MonthGridWithEvents from "@/components/MonthGridWithEvents";
import ScheduleListItem from "@/components/ScheduleListItem";
import CalendarAddModal from "@/components/calendar/CalendarAddModal";
import CalendarEditModal from "@/components/calendar/CalendarEditModal";
import TeamMemberDrawer from "@/components/TeamMemberDrawer";

const days = ["일", "월", "화", "수", "목", "금", "토"];

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row items-start py-1 ">
      <Text style={{ width: 60 }} className="text-[13px] text-[#989898]">
        {label}
      </Text>
      <View className="flex-1">{children}</View>
    </View>
  );
}

export default function TeamDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const teamId = Number(id);
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const [isAddSelectOpen, setIsAddSelectOpen] = useState(false);
  const [isVoteAddOpen, setIsVoteAddOpen] = useState(false);

  const { data: team, isLoading: isTeamLoading } = useTeamDetail(teamId);
  const { data: teamMembers = [] } = useTeamMembers(teamId);
  const { data: teamNoticesAll = [] } = useTeamNotices(teamId);
  const { data: allVotes = [] } = useTeamVotes(teamId);

  const { mutateAsync: createEvent } = useCreateTeamEvent(teamId);
  const { mutateAsync: updateEvent } = useUpdateTeamEvent(teamId);
  const { mutateAsync: deleteEvent } = useDeleteTeamEvent(teamId);
  const { mutateAsync: createInvitation, isPending: isInviting } =
    useCreateInvitation(teamId);
  const { mutateAsync: createVote } = useCreateVote(teamId);

  const [selectedDate, setSelectedDate] = useState(today);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editSchedule, setEditSchedule] = useState<Schedule | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);

  const schedules = useTeamMonthSchedules(teamId, year, month);
  const calendarDates = useCalendarGrid(year, month);
  const weeks = useCalendarWeeks(calendarDates);

  const sortedVotes = [...allVotes].sort((a, b) =>
    b.createdDate.localeCompare(a.createdDate)
  );
  const sortedNotices = [...teamNoticesAll].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
  const teamVotes = sortedVotes.slice(0, 4);
  const teamNotices = sortedNotices.slice(0, 4);

  const [isMemberDrawerOpen, setIsMemberDrawerOpen] = useState(false);

  if (isTeamLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F0F2F5]">
        <Text className="text-[13px] text-[#9C9C9C]">불러오는 중...</Text>
      </View>
    );
  }

  if (!team) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F0F2F5]">
        <Text className="font-semibold text-[#2C2C2C]">
          존재하지 않는 팀입니다.
        </Text>
      </View>
    );
  }

  const selectedDateKey = formatDateKey(selectedDate);
  const selectedSchedules = schedules.filter((schedule) =>
    isScheduleOnDate(schedule, selectedDateKey)
  );
  const dayLabel = days[selectedDate.getDay()];
  const isAdmin = team.role === "LEADER" || team.role === "MANAGER";
  const isLeader = team.role === "LEADER";

  const handlePrevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    setCurrentDate(prev);
    setSelectedDate(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(year, month + 1, 1);
    setCurrentDate(next);
    setSelectedDate(next);
  };

  const handleInvite = async (studentNumber: string) => {
    try {
      await createInvitation({ studentNumber });
    } catch (err) {
      console.error("초대 요청 실패", err);
      throw err;
    }
  };

  const handleToggleSchedule = async (target: Schedule) => {
    try {
      await updateEvent({
        eventId: target.eventId,
        body: {
          title: target.title,
          description: target.description,
          startAt: target.startAt,
          endAt: target.endAt,
          isAllDay: target.isAllDay,
          color: target.color,
          isFinished: !target.isFinished,
          occurrenceAt: target.occurrenceAt ?? target.startAt,
          recurrenceEditScope: "THIS_INSTANCE",
          participants: teamMembers.map((m) => m.teamMemberId),
          ...(target.recurrence && { recurrence: target.recurrence }),
        },
      });
    } catch (err) {
      console.error("일정 완료 토글 실패", err);
    }
  };

  const handleAddSchedule = async (request: MyEventCreateRequest) => {
    try {
      await createEvent({
        title: request.title,
        description: request.description,
        startAt: request.startAt,
        endAt: request.endAt,
        isAllDay: request.isAllDay,
        color: request.color,
        participants: teamMembers.map((m) => m.teamMemberId),
        ...(request.recurrence && { recurrence: request.recurrence }),
      });
    } catch (err) {
      console.error("일정 생성 실패", err);
    }
  };

  const handleCreateVote = async (request: EventVoteCreateRequest) => {
    try {
      await createVote(request);
    } catch (err) {
      console.error("투표 생성 실패", err);
    }
    setIsVoteAddOpen(false);
  };

  const handleEditSchedule = async (
    updated: Schedule,
    scope: RecurrenceEditScope
  ) => {
    try {
      await updateEvent({
        eventId: updated.eventId,
        body: {
          title: updated.title,
          description: updated.description,
          startAt: updated.startAt,
          endAt: updated.endAt,
          isAllDay: updated.isAllDay,
          color: updated.color,
          isFinished: updated.isFinished,
          occurrenceAt: updated.occurrenceAt ?? updated.startAt,
          recurrenceEditScope: scope,
          participants: updated.participants.map((p) => p.teamMemberId),
          ...(updated.recurrence && { recurrence: updated.recurrence }),
        },
      });
    } catch (err) {
      console.error("일정 수정 실패", err);
    }
    setEditSchedule(null);
  };

  const handleDeleteSchedule = async (
    eventId: number,
    scope: RecurrenceEditScope
  ) => {
    try {
      await deleteEvent({
        eventId,
        scope,
        occurrence: editSchedule?.occurrenceAt ?? "",
      });
    } catch (err) {
      console.error("일정 삭제 실패", err);
    }
    setEditSchedule(null);
  };

  const handleLeaveOrDeleteTeam = () => {
    // TODO 2단계: 실제 탈퇴/삭제 API 연결
    console.log(isLeader ? "delete team" : "leave team");
    setIsLeaveConfirmOpen(false);
  };

  return (
    <View className="flex-1 bg-[#ffffff]">
      <View
        style={{
          paddingTop: 60,
          backgroundColor: categoryColorMap[team.category] ?? "#E9E9E9",
        }}
        className="flex-row items-center justify-between px-6 pb-4"
      >
        <Pressable onPress={() => router.push(`/team`)}>
          <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
        </Pressable>

        <View className="rounded-full bg-white/80 px-5 py-2">
          <Text className="text-[14px] font-semibold text-[#2C2C2C]">
            {categoryMap[team.category]}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: 50,
        }}
      >
        <View className="flex-row items-start gap-4">
          <View className="h-[120px] w-[120px] rounded-2xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA]">
            {team.imageUrl && (
              <Image
                source={{ uri: team.imageUrl }}
                className="h-full w-full rounded-2xl"
                resizeMode="cover"
              />
            )}

            {isLeader && (
              <Pressable
                onPress={() => router.push(`/team/${teamId}/edit`)}
                className="absolute bottom-1.5 right-1.5 h-7 w-7 items-center justify-center rounded-full bg-black/30 transition-transform duration-150 ease-out active:scale-90"
              >
                <Pencil size={13} color="#fff" />
              </Pressable>
            )}
          </View>

          <View className="flex-1 justify-center">
            <View className="flex-row items-center justify-between">
              <Text className="text-[18px] font-bold text-[#2C2C2C]">
                {team.name}
              </Text>
              <Pressable
                onPress={() => setIsMemberDrawerOpen(true)}
                className="h-12 w-12 items-center justify-center rounded-full border-[0.5px] border-[#D6DDE5]/40 bg-[#F8F9FB] transition-transform duration-150 ease-out active:scale-95"
              >
                <Menu size={18} color="#2C2C2C" />
              </Pressable>
            </View>
            <Text numberOfLines={2} className="mt-2 text-[13px] text-[#989898]">
              {team.description}
            </Text>
          </View>
        </View>

        {/* <View className="mt-3">
          <InfoRow label="링크">
            <Pressable
              disabled={!team.link}
              onPress={() => team.link && Linking.openURL(team.link)}
            >
              <Text
                numberOfLines={1}
                className={
                  team.link
                    ? "text-[13px] text-[#5E92F0] underline"
                    : "text-[13px] text-[#989898]"
                }
              >
                {team.link || "-"}
              </Text>
            </Pressable>
          </InfoRow>
          <InfoRow label="SNS">
            <Pressable
              disabled={!team.sns}
              onPress={() => team.sns && Linking.openURL(team.sns)}
            >
              <Text
                numberOfLines={1}
                className={
                  team.sns
                    ? "text-[13px] text-[#5E92F0] underline"
                    : "text-[13px] text-[#989898]"
                }
              >
                {team.sns || "-"}
              </Text>
            </Pressable>
          </InfoRow>
        </View> */}

        <View className="mt-6 rounded-2xl bg-[#F8F9FB] px-4 pt-2 pb-2.5">
          <View className="mb-1 flex-row items-center justify-between border-b-[0.5px] border-[#D6DDE5] py-2 pb-2">
            <Text className="text-[18px] font-bold text-[#2C2C2C]">
              {month + 1}월
            </Text>
            <View className="flex-row items-center gap-4">
              {isAdmin && (
                <Pressable
                  onPress={() => setIsAddSelectOpen(true)}
                  className="flex-row items-center gap-1 transition-transform duration-150 ease-out active:scale-95"
                >
                  <Plus size={13} color="#989898" />
                  <Text className="text-[12px] font-medium text-[#989898]">
                    일정 생성
                  </Text>
                </Pressable>
              )}
              <View className="flex-row gap-3">
                <Pressable
                  onPress={handlePrevMonth}
                  className="h-8 w-8 items-center justify-center rounded-full bg-[#EEF1F4] transition-transform duration-150 ease-out active:scale-90"
                >
                  <ChevronLeft size={16} strokeWidth={2.5} color="#2C2C2C66" />
                </Pressable>
                <Pressable
                  onPress={handleNextMonth}
                  className="h-8 w-8 items-center justify-center rounded-full bg-[#EEF1F4] transition-transform duration-150 ease-out active:scale-90"
                >
                  <ChevronRight size={16} strokeWidth={2.5} color="#2C2C2C66" />
                </Pressable>
              </View>
            </View>
          </View>

          <View className="flex-row pb-1 pt-1.5">
            {days.map((day) => (
              <Text
                key={day}
                className="text-center text-[12px] text-[#DEDEDE]"
                style={{ width: `${100 / 7}%` }}
              >
                {day}
              </Text>
            ))}
          </View>

          <MonthGridWithEvents
            year={year}
            month={month}
            weeks={weeks}
            schedules={schedules}
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setIsDetailOpen(true);
            }}
            rowMinHeight={86}
            selectedBackgroundColor="#FFFFFF"
          />
        </View>

        <View className="mt-4 rounded-2xl bg-[#F8F9FB] px-4 pt-5 pb-4">
          <View className="flex-row items-center justify-between border-b-[0.5px] border-[#D6DDE5] pb-3">
            <Text className="text-[17px] font-bold text-[#2C2C2C]">투표</Text>
            <Pressable
              className="transition-transform duration-150 ease-out active:scale-90"
              onPress={() => router.push(`/team/${teamId}/vote`)}
            >
              <ChevronRight size={20} strokeWidth={2.5} color="#2C2C2C" />
            </Pressable>
          </View>

          {teamVotes.length === 0 ? (
            <View className="items-center justify-center pt-10 py-8">
              <Text className="text-[13px] text-[#989898]">
                아직 등록된 투표가 없어요
              </Text>
            </View>
          ) : (
            teamVotes.map((vote) => (
              <Pressable
                key={vote.voteId}
                onPress={() => {
                  router.push(`/team/${teamId}/vote/${vote.voteId}`);
                }}
                className="flex-row items-center justify-between border-b-[0.5px] border-[#D6DDE5] py-4"
              >
                <View className="flex-1">
                  <View className="flex-row justify-start items-center gap-3">
                    <Text
                      numberOfLines={1}
                      className="text-[16px] font-semibold text-[#2C2C2C]"
                    >
                      {vote.title}
                    </Text>
                    <View
                      className={`rounded-full px-3 py-1.5 ${
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
                  <Text
                    numberOfLines={1}
                    className="mt-1.5 text-[13px] text-[#989898]"
                  >
                    {vote.description || "-"}
                  </Text>
                </View>
              </Pressable>
            ))
          )}
        </View>

        <View className="mt-4 rounded-2xl bg-[#F8F9FB] px-4 pt-5 pb-4">
          <View className="flex-row items-center justify-between border-b-[0.5px] border-[#D6DDE5] pb-3">
            <Text className="text-[17px] font-bold text-[#2C2C2C]">
              공지사항
            </Text>
            <Pressable
              className="transition-transform duration-150 ease-out active:scale-90"
              onPress={() => router.push(`/team/${teamId}/notice`)}
            >
              <ChevronRight size={20} strokeWidth={2.5} color="#2C2C2C" />
            </Pressable>
          </View>

          {teamNotices.length === 0 ? (
            <View className="items-center justify-center pt-10 py-8">
              <Text className="text-[13px] text-[#989898]">
                아직 등록된 공지사항이 없어요
              </Text>
            </View>
          ) : (
            teamNotices.map((notice) => (
              <Pressable
                key={notice.noticeId}
                onPress={() =>
                  router.push({
                    pathname: "/notice/[noticeId]",
                    params: {
                      noticeId: String(notice.noticeId),
                      teamId: String(notice.teamId),
                    },
                  })
                }
                className="border-b-[0.5px] border-[#D6DDE5] py-4"
              >
                <Text
                  numberOfLines={1}
                  className="text-[15px] font-semibold text-[#2C2C2C]"
                >
                  {notice.title}
                </Text>
                <View className="mt-1.5 flex-row items-center justify-between">
                  <Text className="text-[12px] text-[#989898]">
                    {notice.authorName} • {getTeamRoleLabel(notice.teamRole)}
                  </Text>
                  <Text className="text-[11px] text-[#989898]">
                    {formatDate(notice.createdAt)}
                  </Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

      {/* 팀 삭제/탈퇴 확인 */}
      <Modal
        transparent
        visible={isLeaveConfirmOpen}
        animationType="fade"
        onRequestClose={() => setIsLeaveConfirmOpen(false)}
      >
        <Pressable
          onPress={() => setIsLeaveConfirmOpen(false)}
          className="flex-1 items-center justify-center bg-black/40 px-6"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full max-w-[340px] rounded-3xl bg-white px-6 py-6"
          >
            <Text className="text-[16px] font-semibold text-[#2C2C2C]">
              {isLeader ? "팀을 삭제할까요?" : "팀에서 탈퇴할까요?"}
            </Text>
            <Text className="mt-2 text-[13px] text-[#989898]">
              {isLeader
                ? "삭제하면 되돌릴 수 없어요."
                : "탈퇴하면 다시 초대받아야 참여할 수 있어요."}
            </Text>

            <View className="mt-6 flex-row gap-3">
              <Pressable
                onPress={() => setIsLeaveConfirmOpen(false)}
                className="flex-1 items-center rounded-xl bg-[#F1F3F6] py-3"
              >
                <Text className="text-[14px] font-medium text-[#2C2C2C]">
                  취소
                </Text>
              </Pressable>
              <Pressable
                onPress={handleLeaveOrDeleteTeam}
                className="flex-1 items-center rounded-xl bg-[#E45B5B] py-3"
              >
                <Text className="text-[14px] font-medium text-white">
                  {isLeader ? "삭제" : "탈퇴"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        visible={isDetailOpen}
        animationType="fade"
        onRequestClose={() => setIsDetailOpen(false)}
      >
        <Pressable
          onPress={() => setIsDetailOpen(false)}
          className="flex-1 items-center justify-center bg-black/20 px-5"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full max-w-[300px] rounded-2xl border-[0.5px] border-[#EDF1F5] bg-white px-6 py-6"
            style={{ height: "50%" }}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-[20px] font-bold text-[#2C2C2C]">
                {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 (
                {dayLabel})
              </Text>
              <Text className="text-[11px] text-[#C8D0D9]">
                {getDday(selectedDate)}
              </Text>
            </View>

            <ScrollView className="flex-1">
              {selectedSchedules.map((schedule) => (
                <ScheduleListItem
                  key={`${schedule.eventId}-${
                    schedule.occurrenceAt ?? schedule.startAt
                  }`}
                  schedule={schedule}
                  showToggle={isAdmin}
                  onClickItem={(s) => {
                    if (!isAdmin) return;
                    setIsDetailOpen(false);
                    setEditSchedule(s);
                  }}
                  onToggle={handleToggleSchedule}
                />
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        visible={isAddSelectOpen}
        animationType="fade"
        onRequestClose={() => setIsAddSelectOpen(false)}
      >
        <Pressable
          onPress={() => setIsAddSelectOpen(false)}
          className="flex-1 items-center justify-center bg-black/20 px-6"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full max-w-[360px] rounded-3xl bg-white p-6"
          >
            <Text className="mb-4 text-center  text-[18px] font-bold text-[#2C2C2C]">
              어떻게 일정을 추가할까요?
            </Text>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  setIsAddSelectOpen(false);
                  setIsAddOpen(true);
                }}
                className="flex-1 items-center justify-center rounded-2xl bg-[#F8F9FB] py-4 transition-transform duration-150 ease-out active:scale-95"
              >
                <View className="mb-2 h-8 w-8 items-center justify-center rounded-full bg-[#EEF1F5]">
                  <Plus size={18} strokeWidth={2.5} color="#5E92F0" />
                </View>
                <Text className="text-[15px] font-bold text-[#2C2C2C]">
                  기본 일정 추가
                </Text>
                <Text className="mt-1 text-center text-[9px] text-[#989898]">
                  일정을 바로 생성할 수 있어요
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setIsAddSelectOpen(false);
                  setIsVoteAddOpen(true);
                }}
                className="flex-1 items-center justify-center rounded-2xl bg-[#F8F9FB] py-4 transition-transform duration-150 ease-out active:scale-95"
              >
                <View className="mb-2 h-8 w-8 items-center justify-center rounded-full bg-[#EEF1F5]">
                  <Check size={18} strokeWidth={2.5} color="#5E92F0" />
                </View>
                <Text className="text-[15px] font-bold text-[#2C2C2C]">
                  일정 투표 생성
                </Text>
                <Text className="mt-1 text-center text-[9px] text-[#989898]">
                  일정을 투표 후 생성할 수 있어요
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {isAdmin && (
        <VoteAddModal
          open={isVoteAddOpen}
          onClose={() => setIsVoteAddOpen(false)}
          onCreate={handleCreateVote}
          members={teamMembers}
        />
      )}

      {isAdmin && (
        <CalendarAddModal
          open={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onAdd={handleAddSchedule}
          selectedDate={selectedDate}
        />
      )}

      {isAdmin && (
        <CalendarEditModal
          open={editSchedule !== null}
          schedule={editSchedule}
          onClose={() => setEditSchedule(null)}
          onEdit={handleEditSchedule}
          onDelete={handleDeleteSchedule}
          teamMembers={teamMembers}
        />
      )}

      <TeamMemberDrawer
        open={isMemberDrawerOpen}
        onClose={() => setIsMemberDrawerOpen(false)}
        teamId={teamId}
        teamMembers={teamMembers}
        isAdmin={isAdmin}
        onInvite={handleInvite}
        isInviting={isInviting}
      />
    </View>
  );
}

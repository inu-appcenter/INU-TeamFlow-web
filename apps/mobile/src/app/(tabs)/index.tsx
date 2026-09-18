import { router } from "expo-router";
import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, Bell } from "lucide-react-native";
import { useMyTeamNotices } from "@moimi/core/hooks/useNoticeQuery";
import { useUnreadCount } from "@moimi/core/hooks/useNotificationQuery";
import { useRecruitments } from "@moimi/core/hooks/useRecruitmentQuery";
import { useInfoPosts } from "@moimi/core/hooks/useInfoPostQuery";
import { useCalendarGrid } from "@moimi/core/hooks/calendar/useCalendarGrid";
import { useMonthSchedules } from "@moimi/core/hooks/calendar/useMonthSchedules";
import { categoryFilterOptions } from "@moimi/core/constants/category";
import { infoPostCategoryFilterOptions } from "@moimi/core/constants/infoPost";
import { formatDateKey, isScheduleOnDate } from "@/utils/date/calendar";
import MonthCalendar from "@/components/MonthCalendar";
import DaySchedulePanel from "@/components/DaySchedulePanel";
import type { TeamNoticeSummary } from "@moimi/core/types/notice";
import type { RecruitmentSummaryResponse } from "@moimi/core/types/recruitment";
import type { InfoPostSummaryResponse } from "@moimi/core/types/infoPost";
import { formatDate } from "@/utils/date/formatDate";
import { getTeamRoleLabel } from "@/utils/user/teamRole";
import { Image } from "react-native";

const LOGO = require("@/assets/images/logo.webp");

function SectionCard({
  title,
  headerRight,
  children,
}: {
  title: string;
  headerRight?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View className=" mb-4 rounded-3xl border-[0.5px] border-[#D6DDE5] bg-white p-5">
      <View className="flex-row items-center justify-between border-b-[0.5px] border-[#D6DDE5] pb-2">
        <Text className="text-[18px] font-bold text-[#2C2C2C]">{title}</Text>
        {headerRight}
      </View>
      <View className="">{children}</View>
    </View>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View className="items-center justify-center py-10">
      <Text className="pt-2 text-[13px] font-medium text-[#989898]">
        {text}
      </Text>
    </View>
  );
}

function NoticeRow({
  notice,
  showDivider,
}: {
  notice: TeamNoticeSummary;
  showDivider: boolean;
}) {
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/notice/[noticeId]",
          params: {
            noticeId: String(notice.noticeId),
            teamId: String(notice.teamId),
          },
        })
      }
      className={`py-4 active:opacity-60 ${
        showDivider ? "border-b-[0.5px] border-[#d6dde5]/60" : ""
      }`}
    >
      <Text
        className={"text-[15px] font-semibold text-[#2C2C2C]"}
        numberOfLines={1}
      >
        [ {notice.teamName} ] {notice.title}
      </Text>

      <Text className="mt-1 text-[12px] text-[#989898]">
        {notice.authorName} · {getTeamRoleLabel(notice.teamRole)} ·{" "}
        {formatDate(notice.createdAt)}
      </Text>
    </Pressable>
  );
}

function RecruitmentRow({
  recruitment,
  categoryLabel,
  showDivider,
}: {
  recruitment: RecruitmentSummaryResponse;
  categoryLabel: string;
  showDivider: boolean;
}) {
  return (
    <Pressable
      onPress={() => router.push(`/recruitment/${recruitment.recruitmentId}`)}
      className={`py-4 active:opacity-60 ${
        showDivider ? "border-b-[0.5px] border-[#d6dde5]/60" : ""
      }`}
    >
      <Text
        className="text-[15px] font-semibold text-[#2C2C2C]"
        numberOfLines={1}
      >
        [ {categoryLabel} ] {recruitment.title}
      </Text>
      <Text
        className={`mt-1 truncate text-[12px] ${
          recruitment.infoPostTitle ? "text-[#2C2C2C]" : "text-[#B0B0B0]"
        }`}
      >
        {recruitment.infoPostTitle || "연결된 정보글이 없습니다"}
      </Text>
    </Pressable>
  );
}

function InfoPostRow({
  infoPost,
  categoryLabel,
  showDivider,
}: {
  infoPost: InfoPostSummaryResponse;
  categoryLabel: string;
  showDivider: boolean;
}) {
  return (
    <Pressable
      onPress={() => router.push(`/infoPost/${infoPost.infoPostId}`)}
      className={`py-4 active:opacity-60 ${
        showDivider ? "border-b-[0.5px] border-[#d6dde5]/60" : ""
      }`}
    >
      <Text
        className="text-[15px] font-semibold text-[#2C2C2C]"
        numberOfLines={1}
      >
        [ {categoryLabel} ] {infoPost.title}
      </Text>
      <Text className="mt-1 truncate text-[12px] text-[#989898]">
        참조 모집글 {infoPost.recruitmentCount ?? 0}개
      </Text>
    </Pressable>
  );
}

export default function MainScreen() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const { data: unreadCount = 0 } = useUnreadCount();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDates = useCalendarGrid(year, month);
  const schedules = useMonthSchedules(year, month);

  const selectedDateKey = formatDateKey(selectedDate);
  const selectedSchedules = schedules.filter((schedule) =>
    isScheduleOnDate(schedule, selectedDateKey)
  );

  const handlePrevMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const { data: myNotices = [] } = useMyTeamNotices();
  const sortedNotices = [...myNotices].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
  const notices = sortedNotices.slice(0, 4);

  const { data: recruitmentData } = useRecruitments(0, 100);
  const recruitments = (recruitmentData?.content ?? []).slice(0, 4);

  const { data: infoPostData } = useInfoPosts({
    page: 0,
    size: 4,
    sort: ["createdAt,DESC"],
  });

  const infoPosts = infoPostData?.content ?? [];

  return (
    <View className="flex-1 bg-[#F0F2F5]">
      <Pressable
        onPress={() => router.push("/notification" as never)}
        className="absolute right-3 top-16 z-50 h-14 w-14 items-center justify-center rounded-full border-[0.5px] border-[#D6DDE5] bg-white transition-transform duration-150 ease-out active:scale-90"
      >
        <Bell size={20} color="#2C2C2C" fill="#2C2C2C" />

        {unreadCount > 0 && (
          <View
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              minWidth: 20,
              height: 20,
              borderRadius: 10,
              paddingHorizontal: 4,
              backgroundColor: "#5E8EEF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{ lineHeight: 12 }}
              className="text-[10px] font-bold text-white"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </View>
        )}
      </Pressable>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 76,
          paddingBottom: 120,
          paddingHorizontal: 10,
        }}
      >
        <Image
          source={LOGO}
          style={{ height: 30, width: 100, marginBottom: 16 }}
          resizeMode="contain"
          className="ml-2 -mt-3"
        />
        <SectionCard
          title={`${month + 1}월`}
          headerRight={
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={handlePrevMonth}
                className="h-8 w-8 items-center justify-center rounded-full bg-[#F6F8FA] transition-transform duration-150 ease-out active:scale-90"
              >
                <ChevronLeft size={16} strokeWidth={2.5} color="#B0B8C1" />
              </Pressable>
              <Pressable
                onPress={handleNextMonth}
                className="h-8 w-8 items-center justify-center rounded-full bg-[#F6F8FA] transition-transform duration-150 ease-out active:scale-90"
              >
                <ChevronRight size={16} strokeWidth={2.5} color="#B0B8C1" />
              </Pressable>
            </View>
          }
        >
          <MonthCalendar
            year={year}
            month={month}
            calendarDates={calendarDates}
            schedules={schedules}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          <DaySchedulePanel
            selectedDate={selectedDate}
            selectedSchedules={selectedSchedules}
          />
        </SectionCard>
        <SectionCard
          title="공지사항"
          headerRight={
            <Pressable
              onPress={() => router.push("/notice")}
              className="pt-1 -mr-3 h-8 w-8 transition-transform duration-150 ease-out active:scale-90 "
            >
              <ChevronRight size={20} strokeWidth={2.5} color="#2c2c2c" />
            </Pressable>
          }
        >
          {notices.length > 0 ? (
            notices.map((notice, index) => (
              <NoticeRow
                key={notice.noticeId}
                notice={notice}
                showDivider={index < notices.length - 1}
              />
            ))
          ) : (
            <EmptyState text="아직 등록된 공지사항이 없어요" />
          )}
        </SectionCard>
        <SectionCard
          title="모집 게시판"
          headerRight={
            <Pressable
              onPress={() => router.push("/recruitment")}
              className="pt-1 -mr-3 h-8 w-8 transition-transform duration-150 ease-out active:scale-90 "
            >
              <ChevronRight size={20} strokeWidth={2.5} color="#2c2c2c" />
            </Pressable>
          }
        >
          {recruitments.length > 0 ? (
            recruitments.map((recruitment, index) => (
              <RecruitmentRow
                key={recruitment.recruitmentId}
                recruitment={recruitment}
                categoryLabel={
                  categoryFilterOptions.find(
                    (c) => c.value === recruitment.category
                  )?.label ?? recruitment.category
                }
                showDivider={index < recruitments.length - 1}
              />
            ))
          ) : (
            <EmptyState text="아직 등록된 모집글이 없어요" />
          )}
        </SectionCard>
        <SectionCard
          title="정보 게시판"
          headerRight={
            <Pressable
              onPress={() => router.push("/infoPost")}
              className="pt-1 -mr-3 h-8 w-8 transition-transform duration-150 ease-out active:scale-90 "
            >
              <ChevronRight size={20} strokeWidth={2.5} color="#2c2c2c" />
            </Pressable>
          }
        >
          {infoPosts.length > 0 ? (
            infoPosts.map((infoPost, index) => (
              <InfoPostRow
                key={infoPost.infoPostId}
                infoPost={infoPost}
                categoryLabel={
                  infoPostCategoryFilterOptions.find(
                    (c) => c.value === infoPost.category
                  )?.label ?? infoPost.category
                }
                showDivider={index < infoPosts.length - 1}
              />
            ))
          ) : (
            <EmptyState text="아직 등록된 정보글이 없어요" />
          )}
        </SectionCard>
      </ScrollView>
    </View>
  );
}

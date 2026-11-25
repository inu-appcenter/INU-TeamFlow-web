// CalendarScreen.tsx
import { memo, startTransition, useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  FlatList,
  useWindowDimensions,
  type ListRenderItem,
} from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useCalendarGrid } from "@moimi/core/hooks/calendar/useCalendarGrid";
import { useMonthSchedules } from "@moimi/core/hooks/calendar/useMonthSchedules";
import { useCalendarEventActions } from "@moimi/core/hooks/calendar/useCalendarEventActions";
import { formatDateKey, isScheduleOnDate } from "@/utils/date/calendar";
import MonthGridWithEvents from "@/components/MonthGridWithEvents";
import ScheduleDetailPanel from "@/components/ScheduleDetailPanel";
import CalendarAddModal from "@/components/calendar/CalendarAddModal";
import CalendarEditModal from "@/components/calendar/CalendarEditModal";
import type { Schedule } from "@moimi/core/types/event";

const days = ["일", "월", "화", "수", "목", "금", "토"];

const SCREEN_PADDING_X = 10; // ScrollView paddingHorizontal과 같은 값
const PAGE_GAP = 16; // 달과 달 사이 간격 (px)
const MONTH_RANGE = 60; // 오늘 기준 앞뒤로 넘길 수 있는 달 수 (5년)
const TITLE_ROW_HEIGHT = 36; // 달 제목 줄 높이 = 화살표 버튼 높이 (h-9)
const TITLE_SHIFT = 24; // 달 제목이 바뀔 때 옆으로 움직이는 거리 (px)
// 선택한 날짜가 없는 달에 넘기는 고정 값 (항상 같은 객체라 memo가 다시 그리기를 건너뜀)
const NO_SELECTED_DATE = new Date(0);

// 연·월 ↔ 일련번호 (2026년 11월 → 2026 * 12 + 10)
const toMonthIndex = (year: number, month: number) => year * 12 + month;
const fromMonthIndex = (index: number) => ({
  year: Math.floor(index / 12),
  month: index % 12,
});

// 달 제목: 스크롤 위치에 맞춰 살짝 밀리며 흐려지고, 다음 달 제목이 살짝 들어오며 진해짐
function MonthTitle({
  monthIndex,
  listIndex,
  scrollX,
  slotWidth,
}: {
  monthIndex: number;
  listIndex: number;
  scrollX: SharedValue<number>;
  slotWidth: number;
}) {
  const { year, month } = fromMonthIndex(monthIndex);
  const isThisYear = year === new Date().getFullYear();

  const style = useAnimatedStyle(() => {
    // 이 제목의 달이 정확히 화면에 있으면 0, 한 장 지나가면 ±1
    const progress = scrollX.get() / slotWidth - listIndex;
    return {
      opacity: interpolate(
        Math.abs(progress),
        [0, 0.5],
        [1, 0],
        Extrapolation.CLAMP
      ),
      transform: [
        {
          translateX: interpolate(
            progress,
            [-1, 0, 1],
            [TITLE_SHIFT, 0, -TITLE_SHIFT],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  return (
    <Animated.Text
      style={[{ position: "absolute", left: 0, paddingLeft: 8 }, style]}
      className="text-[22px] font-bold text-[#2C2C2C]"
    >
      {!isThisYear && `${year}년 `}
      {month + 1}월
    </Animated.Text>
  );
}

// 한 달 카드. 각자 자기 달의 일정을 불러옴
// memo: 다른 달로 넘겨도 이미 그린 카드는 다시 그리지 않음
const CalendarMonthPage = memo(function CalendarMonthPage({
  year,
  month,
  selectedDate,
  onSelectDate,
}: {
  year: number;
  month: number;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}) {
  const calendarDates = useCalendarGrid(year, month);
  const schedules = useMonthSchedules(year, month);

  const weeks = Array.from(
    { length: calendarDates.length / 7 },
    (_, weekIndex) => calendarDates.slice(weekIndex * 7, weekIndex * 7 + 7)
  );

  return (
    <View className="rounded-3xl border-[0.8px] border-[#D6DDE5] bg-white p-3">
      <View className="mb-2 flex-row px-1">
        {days.map((day) => (
          <Text
            key={day}
            className="text-center text-[13px] text-[#D6DDE5]"
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
        onSelectDate={onSelectDate}
        rowMinHeight={120}
      />
    </View>
  );
});

export default function CalendarScreen() {
  const today = new Date();

  // 넘길 수 있는 달 목록: 오늘 기준 앞뒤 MONTH_RANGE개월
  const firstMonthIndexRef = useRef(
    toMonthIndex(today.getFullYear(), today.getMonth()) - MONTH_RANGE
  );
  const firstMonthIndex = firstMonthIndexRef.current;
  const monthIndexes = useRef(
    Array.from({ length: MONTH_RANGE * 2 + 1 }, (_, i) => firstMonthIndex + i)
  ).current;

  // 지금 화면에 보이는 달의 목록 위치 (처음엔 오늘이 있는 달 = 가운데)
  const [pageIndex, setPageIndex] = useState(MONTH_RANGE);
  const pageIndexRef = useRef(MONTH_RANGE);
  const { year, month } = fromMonthIndex(monthIndexes[pageIndex]);

  const [selectedDate, setSelectedDate] = useState(today);
  // 모달에 보여줄 날짜 (바로 반영). selectedDate는 달력 선택 배경용 (뒤늦게 반영돼도 됨)
  const [detailDate, setDetailDate] = useState(today);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 1800);
  };

  // 일정 상세 패널용 (현재 달)
  const schedules = useMonthSchedules(year, month);

  const {
    handleAddSchedule,
    handleEditSchedule,
    handleDeleteSchedule,
    handleToggleSchedule,
  } = useCalendarEventActions();

  const selectedDateKey = formatDateKey(detailDate);
  const selectedSchedules = schedules.filter((schedule) =>
    isScheduleOnDate(schedule, selectedDateKey)
  );
  const dayLabel = days[detailDate.getDay()];

  // ── 가로 페이징 목록 ──
  const { width: windowWidth } = useWindowDimensions();
  const pageWidth = windowWidth - SCREEN_PADDING_X * 2;
  const slotWidth = pageWidth + PAGE_GAP; // 카드 + 간격 = 한 페이지 너비

  const listRef = useRef<FlatList<number>>(null);

  // 스크롤 위치 (제목 애니메이션용). 처음엔 오늘 달 위치에서 시작
  const scrollX = useSharedValue(MONTH_RANGE * slotWidth);
  const lastIndex = useSharedValue(MONTH_RANGE);

  const updatePageIndex = (index: number) => {
    if (index < 0 || index >= monthIndexes.length) return;
    pageIndexRef.current = index;
    setPageIndex(index);
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.set(e.contentOffset.x);
      // 절반 이상 넘어가면 현재 달 변경 (화살표·상세 패널·제목 목록용)
      const index = Math.round(e.contentOffset.x / slotWidth);
      if (index !== lastIndex.get()) {
        lastIndex.set(index);
        scheduleOnRN(updatePageIndex, index);
      }
    },
  });

  // 화살표 버튼
  const pageBy = (direction: 1 | -1) => {
    const nextIndex = pageIndexRef.current + direction;
    if (nextIndex < 0 || nextIndex >= monthIndexes.length) return;
    listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
  };

  const handleSelectDate = useCallback((date: Date) => {
    // 모달을 먼저 띄우고
    setDetailDate(date);
    setIsDetailOpen(true);
    // 달력 선택 배경은 급하지 않은 작업으로 처리 → 모달이 뜨는 걸 막지 않음
    startTransition(() => setSelectedDate(date));
  }, []);

  const renderItem: ListRenderItem<number> = useCallback(
    ({ item }) => {
      const page = fromMonthIndex(item);
      // 선택한 날짜가 있는 달만 selectedDate를 받음 → 날짜를 눌러도 그 달만 다시 그림
      const isSelectedMonth =
        selectedDate.getFullYear() === page.year &&
        selectedDate.getMonth() === page.month;
      return (
        <View style={{ width: slotWidth, paddingHorizontal: PAGE_GAP / 2 }}>
          <CalendarMonthPage
            year={page.year}
            month={page.month}
            selectedDate={isSelectedMonth ? selectedDate : NO_SELECTED_DATE}
            onSelectDate={handleSelectDate}
          />
        </View>
      );
    },
    [slotWidth, selectedDate, handleSelectDate]
  );

  const handleClickScheduleItem = (schedule: Schedule) => {
    if (schedule.teamId) {
      showErrorMessage("팀 일정은 수정할 수 없습니다");
      return;
    }
    setIsDetailOpen(false);
    setEditingSchedule(schedule);
    setIsEditOpen(true);
  };

  const handleToggle = (schedule: Schedule) => {
    if (schedule.teamId) {
      showErrorMessage("팀 일정은 수정할 수 없습니다");
      return;
    }
    handleToggleSchedule(schedule);
  };

  // 제목은 지금 달과 양옆 달만 겹쳐 그림 (스크롤에 따라 하나만 보임)
  const titleListIndexes = [pageIndex - 1, pageIndex, pageIndex + 1].filter(
    (i) => i >= 0 && i < monthIndexes.length
  );

  return (
    <View className="flex-1 bg-[#F0F2F5]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 76,
          paddingBottom: 120,
          paddingHorizontal: SCREEN_PADDING_X,
        }}
      >
        {/* 제목 줄: 제목은 제자리에서 바뀌고, 화살표는 고정 */}
        <View
          style={{ height: TITLE_ROW_HEIGHT }}
          className="mb-3 flex-row items-center justify-between"
        >
          <View
            style={{
              flex: 1,
              height: TITLE_ROW_HEIGHT,
              justifyContent: "center",
            }}
          >
            {titleListIndexes.map((listIndex) => (
              <MonthTitle
                key={monthIndexes[listIndex]}
                monthIndex={monthIndexes[listIndex]}
                listIndex={listIndex}
                scrollX={scrollX}
                slotWidth={slotWidth}
              />
            ))}
          </View>
          <View className="pr-2 flex-row gap-2">
            <Pressable
              onPress={() => pageBy(-1)}
              className="h-9 w-9 items-center justify-center rounded-full bg-white transition-transform duration-150 ease-out active:scale-90"
            >
              <ChevronLeft size={18} strokeWidth={2.5} color="#B0B8C1" />
            </Pressable>
            <Pressable
              onPress={() => pageBy(1)}
              className="h-9 w-9 items-center justify-center rounded-full bg-white  transition-transform duration-150 ease-out active:scale-90"
            >
              <ChevronRight size={18} strokeWidth={2.5} color="#B0B8C1" />
            </Pressable>
          </View>
        </View>

        <Animated.FlatList
          ref={listRef}
          data={monthIndexes}
          keyExtractor={(item) => String(item)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          // 목록 너비 = 한 페이지(카드 + 간격). 왼쪽으로 간격 절반만큼 당겨서 카드를 화면에 맞춤
          style={{ width: slotWidth, marginLeft: -PAGE_GAP / 2 }}
          initialScrollIndex={MONTH_RANGE}
          getItemLayout={(_, index) => ({
            length: slotWidth,
            offset: slotWidth * index,
            index,
          })}
          // 앞뒤 달을 넉넉히 미리 그려 둬서 넘길 때 빈 화면이 안 보이게
          initialNumToRender={3}
          windowSize={5}
          maxToRenderPerBatch={3}
          updateCellsBatchingPeriod={16}
          removeClippedSubviews={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          renderItem={renderItem}
        />
      </ScrollView>

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
            className="relative w-full max-w-[300px] rounded-2xl border-[0.5px] border-[#EDF1F5] bg-white px-6 py-6"
            style={{ height: "50%" }}
          >
            {errorMessage && (
              <View
                style={{
                  position: "absolute",
                  top: -60,
                  alignSelf: "center",
                  zIndex: 50,
                }}
                className="rounded-full bg-[#2C2C2C] px-4 py-2"
              >
                <Text className="text-sm font-semibold text-white">
                  {errorMessage}
                </Text>
              </View>
            )}

            <ScheduleDetailPanel
              selectedDate={detailDate}
              dayLabel={dayLabel}
              schedules={selectedSchedules}
              onClickItem={handleClickScheduleItem}
              onToggle={handleToggle}
              onAddClick={() => {
                setIsDetailOpen(false);
                setIsAddOpen(true);
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <CalendarAddModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddSchedule}
        selectedDate={detailDate}
      />

      <CalendarEditModal
        open={isEditOpen}
        schedule={editingSchedule}
        onClose={() => setIsEditOpen(false)}
        onEdit={handleEditSchedule}
        onDelete={(eventId, scope) =>
          handleDeleteSchedule(
            eventId,
            scope,
            editingSchedule?.occurrenceAt ?? editingSchedule?.startAt ?? ""
          )
        }
        teamMembers={[]}
      />
    </View>
  );
}

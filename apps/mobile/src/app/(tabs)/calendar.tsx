// CalendarScreen.tsx
import { useState } from "react";
import { View, Text, ScrollView, Pressable, Modal } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
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

export default function CalendarScreen() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 1800);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDates = useCalendarGrid(year, month);
  const schedules = useMonthSchedules(year, month);

  const {
    handleAddSchedule,
    handleEditSchedule,
    handleDeleteSchedule,
    handleToggleSchedule,
  } = useCalendarEventActions();

  const weeks = Array.from(
    { length: calendarDates.length / 7 },
    (_, weekIndex) => calendarDates.slice(weekIndex * 7, weekIndex * 7 + 7)
  );

  const selectedDateKey = formatDateKey(selectedDate);
  const selectedSchedules = schedules.filter((schedule) =>
    isScheduleOnDate(schedule, selectedDateKey)
  );
  const dayLabel = days[selectedDate.getDay()];

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

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setIsDetailOpen(true);
  };

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

  return (
    <View className="flex-1 bg-[#F0F2F5]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 76,
          paddingBottom: 120,
          paddingHorizontal: 10,
        }}
      >
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="pl-2 text-[22px] font-bold text-[#2C2C2C]">
            {month + 1}월
          </Text>
          <View className="pr-2 flex-row gap-2">
            <Pressable
              onPress={handlePrevMonth}
              className="h-9 w-9 items-center justify-center rounded-full bg-white transition-transform duration-150 ease-out active:scale-90"
            >
              <ChevronLeft size={18} strokeWidth={2.5} color="#B0B8C1" />
            </Pressable>
            <Pressable
              onPress={handleNextMonth}
              className="h-9 w-9 items-center justify-center rounded-full bg-white  transition-transform duration-150 ease-out active:scale-90"
            >
              <ChevronRight size={18} strokeWidth={2.5} color="#B0B8C1" />
            </Pressable>
          </View>
        </View>

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
            onSelectDate={handleSelectDate}
            rowMinHeight={120}
          />
        </View>
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
              selectedDate={selectedDate}
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
        selectedDate={selectedDate}
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

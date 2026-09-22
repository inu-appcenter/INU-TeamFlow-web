// components/MonthCalendar.tsx
import { View, Text, Pressable } from "react-native";
import { EVENT_COLOR_MAP } from "@moimi/core/constants/scheduleColor";
import { formatDateKey, isScheduleOnDate } from "@/utils/date/calendar";
import type { CalendarDate } from "@/utils/date/calendar";
import type { Schedule } from "@moimi/core/types/event";

const days = ["일", "월", "화", "수", "목", "금", "토"];

type MonthCalendarProps = {
  year: number;
  month: number;
  calendarDates: CalendarDate[];
  schedules: Schedule[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

export default function MonthCalendar({
  year,
  month,
  calendarDates,
  schedules,
  selectedDate,
  onSelectDate,
}: MonthCalendarProps) {
  const today = new Date();

  const weeks = Array.from(
    { length: calendarDates.length / 7 },
    (_, weekIndex) => calendarDates.slice(weekIndex * 7, weekIndex * 7 + 7)
  );

  return (
    <View>
      <View className="flex-row">
        {days.map((day) => (
          <View
            key={day}
            style={{ width: `${100 / 7}%` }}
            className="mt-3 mb-2 items-center"
          >
            <Text className="text-[12px] text-[#B0B8C1]">{day}</Text>
          </View>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} className="flex-row">
          {week.map((item, i) => {
            const cellDate =
              item.type === "prev"
                ? new Date(year, month - 1, item.date)
                : item.type === "next"
                ? new Date(year, month + 1, item.date)
                : new Date(year, month, item.date);

            const dateKey = formatDateKey(cellDate);

            const dateSchedules = schedules
              .filter((schedule) => isScheduleOnDate(schedule, dateKey))
              .slice(0, 3);

            const isCurrentMonth = item.type === "current";

            const isToday =
              today.getFullYear() === cellDate.getFullYear() &&
              today.getMonth() === cellDate.getMonth() &&
              today.getDate() === cellDate.getDate();

            const isSelected =
              selectedDate.getFullYear() === cellDate.getFullYear() &&
              selectedDate.getMonth() === cellDate.getMonth() &&
              selectedDate.getDate() === cellDate.getDate();

            const dayOfWeek = cellDate.getDay();

            return (
              <Pressable
                key={`${item.type}-${weekIndex}-${i}`}
                onPress={() => onSelectDate(cellDate)}
                className="items-center pt-1 transition-transform duration-150 ease-out active:scale-95"
                style={{
                  width: `${100 / 7}%`,
                  height: 56,
                  backgroundColor: isSelected ? "#FAFAFA" : "transparent",
                  borderRadius: isSelected ? 12 : 0,
                }}
              >
                <View
                  className={`h-5 w-5 items-center justify-center rounded-full ${
                    isToday ? "bg-[#5E92F0]" : ""
                  }`}
                >
                  <Text
                    className={`text-[12px] ${
                      !isCurrentMonth
                        ? "text-[#D6DDE5]"
                        : isToday
                        ? "font-semibold text-white"
                        : dayOfWeek === 0
                        ? "text-red-500"
                        : dayOfWeek === 6
                        ? "text-blue-500"
                        : "text-[#2C2C2C]"
                    }`}
                  >
                    {item.date}
                  </Text>
                </View>

                <View className="mt-1 w-full px-1 items-center gap-0.5">
                  {dateSchedules.map((schedule) => (
                    <View
                      key={schedule.eventId}
                      className="h-1.5 w-full rounded-full"
                      style={{
                        backgroundColor: EVENT_COLOR_MAP[schedule.color],
                      }}
                    />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

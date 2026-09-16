import { View, Text, Pressable } from "react-native";
import type { Schedule } from "@moimi/core/types/event";
import type { CalendarDate } from "@/utils/date/calendar";
import { formatDateKey } from "@/utils/date/calendar";
import { assignWeekSlots } from "@/utils/calendar/assignWeekSlots";
import { darkenColor } from "@/utils/color/darkenColor";
import { EVENT_COLOR_MAP } from "@moimi/core/constants/scheduleColor";

const DATE_HEADER_H = 28;
const EVENT_H = 20;
const EVENT_GAP = 4;

type MonthGridWithEventsProps = {
  year: number;
  month: number;
  weeks: CalendarDate[][];
  schedules: Schedule[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  rowMinHeight?: number;
  selectedBackgroundColor?: string;
};

export default function MonthGridWithEvents({
  year,
  month,
  weeks,
  schedules,
  selectedDate,
  onSelectDate,
  rowMinHeight = 90,
  selectedBackgroundColor = "#FAFAFA",
}: MonthGridWithEventsProps) {
  const today = new Date();

  return (
    <View>
      {weeks.map((week, weekIndex) => {
        const weekDateKeys = week.map((item) => {
          const cellDate =
            item.type === "prev"
              ? new Date(year, month - 1, item.date)
              : item.type === "next"
              ? new Date(year, month + 1, item.date)
              : new Date(year, month, item.date);
          return formatDateKey(cellDate);
        });

        const slottedByDate = assignWeekSlots(weekDateKeys, schedules);

        const maxSlot = Math.max(
          0,
          ...Array.from(slottedByDate.values()).flatMap((list) =>
            list.map((s) => (s.slot === -1 ? 0 : s.slot + 1))
          )
        );
        const maxSingle = Math.max(
          0,
          ...Array.from(slottedByDate.values()).map(
            (list) => list.filter((s) => s.slot === -1).length
          )
        );

        const cellMinH =
          DATE_HEADER_H +
          maxSlot * (EVENT_H + EVENT_GAP) +
          maxSingle * (EVENT_H + EVENT_GAP) +
          8;

        return (
          <View
            key={weekIndex}
            className="flex-row"
            style={{ minHeight: Math.max(cellMinH, rowMinHeight) }}
          >
            {week.map((item, i) => {
              const isCurrentMonth = item.type === "current";
              const cellDate =
                item.type === "prev"
                  ? new Date(year, month - 1, item.date)
                  : item.type === "next"
                  ? new Date(year, month + 1, item.date)
                  : new Date(year, month, item.date);

              const dateKey = formatDateKey(cellDate);
              const dateSchedules = slottedByDate.get(dateKey) ?? [];

              const isSunday = cellDate.getDay() === 0;
              const isSaturday = cellDate.getDay() === 6;
              const isToday =
                today.getFullYear() === cellDate.getFullYear() &&
                today.getMonth() === cellDate.getMonth() &&
                today.getDate() === cellDate.getDate();
              const isSelected =
                selectedDate.getFullYear() === cellDate.getFullYear() &&
                selectedDate.getMonth() === cellDate.getMonth() &&
                selectedDate.getDate() === cellDate.getDate();

              let singleIdx = 0;

              return (
                <Pressable
                  key={`${item.type}-${weekIndex}-${i}`}
                  onPress={() => onSelectDate(cellDate)}
                  className="items-center pt-1 pb-2 transition-transform duration-150 active:scale-95"
                  style={{
                    width: `${100 / 7}%`,
                    backgroundColor: isSelected
                      ? selectedBackgroundColor
                      : "transparent",
                    borderRadius: isSelected ? 16 : 0,
                  }}
                >
                  <View
                    className={`h-6 w-6 items-center justify-center rounded-full ${
                      isToday ? "bg-[#5E92F0]" : ""
                    }`}
                  >
                    <Text
                      className={`text-[14px] ${
                        !isCurrentMonth
                          ? "text-[#D6DDE5]"
                          : isToday
                          ? "font-semibold text-white"
                          : isSunday
                          ? "text-red-500"
                          : isSaturday
                          ? "text-blue-500"
                          : "text-[#5C5C5C]"
                      }`}
                    >
                      {item.date}
                    </Text>
                  </View>

                  {dateSchedules.map((schedule) => {
                    const isDone = schedule.isFinished;
                    const startDate = schedule.startAt.slice(0, 10);
                    const endDate = schedule.endAt.slice(0, 10);
                    const isPeriod = startDate !== endDate && schedule.isSingle;
                    const isPeriodStart = isPeriod && dateKey === startDate;
                    const isPeriodEnd = isPeriod && dateKey === endDate;
                    const isPeriodMiddle =
                      isPeriod && dateKey > startDate && dateKey < endDate;

                    let topOffset: number;
                    if (schedule.slot !== -1) {
                      topOffset =
                        DATE_HEADER_H + schedule.slot * (EVENT_H + EVENT_GAP);
                    } else {
                      const maxSlotOnThisDate = dateSchedules
                        .filter((s) => s.slot !== -1)
                        .reduce((max, s) => Math.max(max, s.slot + 1), 0);
                      topOffset =
                        DATE_HEADER_H +
                        maxSlotOnThisDate * (EVENT_H + EVENT_GAP) +
                        singleIdx * (EVENT_H + EVENT_GAP);
                      singleIdx++;
                    }

                    return (
                      <View
                        key={`${schedule.eventId}-${
                          schedule.occurrenceAt ?? schedule.startAt
                        }`}
                        className="absolute h-5 justify-center"
                        style={{
                          top: topOffset,
                          left: isPeriodMiddle || isPeriodEnd ? 0 : 4,
                          right: isPeriodMiddle || isPeriodStart ? 0 : 4,
                          opacity:
                            schedule.teamId && schedule.isParticipant === false
                              ? 0.4
                              : 1,
                          backgroundColor: EVENT_COLOR_MAP[schedule.color],
                          borderLeftWidth: 3,
                          borderLeftColor:
                            isDone || (isPeriod && !isPeriodStart)
                              ? "transparent"
                              : darkenColor(
                                  EVENT_COLOR_MAP[schedule.color],
                                  25
                                ),
                          borderTopLeftRadius:
                            isPeriodMiddle || isPeriodEnd ? 0 : 4,
                          borderBottomLeftRadius:
                            isPeriodMiddle || isPeriodEnd ? 0 : 4,
                          borderTopRightRadius:
                            isPeriodMiddle || isPeriodStart ? 0 : 4,
                          borderBottomRightRadius:
                            isPeriodMiddle || isPeriodStart ? 0 : 4,
                        }}
                      >
                        {!isPeriodMiddle && !isPeriodEnd && (
                          <Text
                            numberOfLines={1}
                            style={{
                              fontSize: 9,
                              fontWeight: "600",
                              paddingLeft: isDone ? 0 : 2,
                              color: isDone
                                ? darkenColor(
                                    EVENT_COLOR_MAP[schedule.color],
                                    70
                                  )
                                : darkenColor(
                                    EVENT_COLOR_MAP[schedule.color],
                                    100
                                  ),
                            }}
                          >
                            {schedule.title}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </Pressable>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

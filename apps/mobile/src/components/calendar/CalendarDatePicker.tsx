// components/calendar/CalendarDatePicker.tsx
import { useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react-native";
import { DAYS } from "@moimi/core/constants/days";
import { formatDateKey } from "@/utils/date/calendar";

type CalendarDatePickerProps = {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  rangeStart?: string;
  rangeEnd?: string;
  minDate?: string;
};

// date: 날짜 선택 / month: 연도·월 선택
type PickerMode = "date" | "month";

const MONTHS = Array.from({ length: 12 }, (_, i) => i);

export default function CalendarDatePicker({
  value,
  onChange,
  placeholder,
  rangeStart,
  rangeEnd,
  minDate,
}: CalendarDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<PickerMode>("date");
  const [currentDate, setCurrentDate] = useState(
    value ? new Date(value) : new Date()
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const dates: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: lastDate }, (_, i) => i + 1),
  ];

  const open = () => {
    setMode("date");
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setMode("date");
  };

  // 화살표: 날짜 화면에서는 한 달, 연·월 화면에서는 한 해 이동
  const goPrev = () =>
    setCurrentDate(
      mode === "date"
        ? new Date(year, month - 1, 1)
        : new Date(year - 1, month, 1)
    );
  const goNext = () =>
    setCurrentDate(
      mode === "date"
        ? new Date(year, month + 1, 1)
        : new Date(year + 1, month, 1)
    );

  return (
    <View className="mb-3">
      <Pressable
        onPress={open}
        className="h-[50px] justify-center rounded-2xl bg-[#F6F8FA] px-6"
      >
        <Text
          className="text-[16px] font-semibold"
          style={{ color: value ? "#2C2C2C" : "#2C2C2C80" }}
        >
          {value || placeholder}
        </Text>
      </Pressable>

      <Modal
        transparent
        visible={isOpen}
        animationType="slide"
        onRequestClose={close}
      >
        <Pressable onPress={close} className="flex-1 justify-end bg-black/30">
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full rounded-t-3xl border-[0.5px] border-[#D6DDE5]/60 bg-[#F8F9FB] p-3 pb-8"
          >
            <View className="mb-2 flex-row items-center justify-between px-2">
              <Pressable
                onPress={() => setMode(mode === "date" ? "month" : "date")}
                hitSlop={8}
                className="flex-row items-center gap-1 py-1 active:opacity-60"
              >
                <Text className="text-[18px] font-bold text-[#2C2C2C]">
                  {mode === "date" ? `${year}년 ${month + 1}월` : `${year}년`}
                </Text>
                <ChevronDown
                  size={18}
                  color="#2C2C2C66"
                  style={{
                    transform: [
                      { rotate: mode === "month" ? "180deg" : "0deg" },
                    ],
                  }}
                />
              </Pressable>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={goPrev}
                  className="h-8 w-8 items-center justify-center rounded-full bg-[#EEF1F5]"
                >
                  <ChevronLeft size={18} color="#2C2C2C66" />
                </Pressable>
                <Pressable
                  onPress={goNext}
                  className="h-8 w-8 items-center justify-center rounded-full bg-[#EEF1F5]"
                >
                  <ChevronRight size={18} color="#2C2C2C66" />
                </Pressable>
              </View>
            </View>

            {mode === "month" ? (
              <View className="flex-row flex-wrap rounded-2xl bg-white px-2 py-3">
                {MONTHS.map((m) => {
                  // 그 달의 마지막 날이 minDate보다 앞이면 고를 수 있는 날이 없음
                  const lastKeyOfMonth = formatDateKey(
                    new Date(year, m + 1, 0)
                  );
                  const isDisabled = !!minDate && lastKeyOfMonth < minDate;
                  const isCurrent = m === month;

                  return (
                    <View
                      key={m}
                      style={{ width: `${100 / 3}%` }}
                      className="items-center py-2"
                    >
                      <Pressable
                        disabled={isDisabled}
                        onPress={() => {
                          setCurrentDate(new Date(year, m, 1));
                          setMode("date");
                        }}
                        className="h-11 w-[80%] items-center justify-center rounded-xl active:opacity-70"
                        style={{
                          backgroundColor: isCurrent
                            ? "#5E92F0"
                            : "transparent",
                        }}
                      >
                        <Text
                          className="text-[15px] font-semibold"
                          style={{
                            color: isDisabled
                              ? "#D6DDE5"
                              : isCurrent
                              ? "#fff"
                              : "#2C2C2C",
                          }}
                        >
                          {m + 1}월
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View className="rounded-2xl bg-white px-2 py-2">
                <View className="mb-3 flex-row">
                  {DAYS.map((day) => (
                    <Text
                      key={day}
                      className="text-center text-[13px] font-medium text-[#D6DDE5]"
                      style={{ width: `${100 / 7}%` }}
                    >
                      {day}
                    </Text>
                  ))}
                </View>

                <View className="flex-row flex-wrap">
                  {dates.map((date, index) => {
                    if (!date) {
                      return (
                        <View
                          key={`empty-${index}`}
                          style={{ width: `${100 / 7}%` }}
                        />
                      );
                    }

                    const cellDate = new Date(year, month, date);
                    const dateKey = formatDateKey(cellDate);
                    const today = new Date();
                    const isToday =
                      today.getFullYear() === cellDate.getFullYear() &&
                      today.getMonth() === cellDate.getMonth() &&
                      today.getDate() === cellDate.getDate();
                    const isSunday = cellDate.getDay() === 0;
                    const isSaturday = cellDate.getDay() === 6;
                    const isSelected = value === dateKey;
                    const isInRange =
                      !!rangeStart &&
                      !!rangeEnd &&
                      dateKey >= rangeStart &&
                      dateKey <= rangeEnd;
                    const isDisabled = !!minDate && dateKey < minDate;

                    return (
                      <View
                        key={date}
                        style={{
                          width: `${100 / 7}%`,
                          alignItems: "center",
                          marginBottom: 10,
                        }}
                      >
                        <Pressable
                          disabled={isDisabled}
                          onPress={() => {
                            onChange(dateKey);
                            close();
                          }}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: isSelected
                              ? "#5E92F0"
                              : isInRange
                              ? "#E8F1FF"
                              : isToday
                              ? "#EEF1F5"
                              : "transparent",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 15,
                              color: isDisabled
                                ? "#D6DDE5"
                                : isSelected
                                ? "#fff"
                                : isInRange
                                ? "#5E92F0"
                                : isSunday
                                ? "#EF4444"
                                : isSaturday
                                ? "#3B82F6"
                                : "#2C2C2C",
                            }}
                            className="font-medium"
                          >
                            {date}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

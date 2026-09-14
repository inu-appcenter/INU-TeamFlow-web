// components/calendar/CalendarDatePicker.tsx
import { useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
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

export default function CalendarDatePicker({
  value,
  onChange,
  placeholder,
  rangeStart,
  rangeEnd,
  minDate,
}: CalendarDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <View className="mb-3">
      <Pressable
        onPress={() => setIsOpen(true)}
        className="h-[55px] justify-center rounded-2xl bg-[#F6F8FA] px-6"
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
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          onPress={() => setIsOpen(false)}
          className="flex-1 justify-end bg-black/30"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full rounded-t-3xl border-[0.5px] border-[#D6DDE5]/60 bg-[#F8F9FB] p-3 pb-8"
          >
            <View className="mb-2 flex-row items-center justify-between px-2">
              <Text className="py-1 text-[18px] font-bold text-[#2C2C2C]">
                {month + 1}월
              </Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setCurrentDate(new Date(year, month - 1, 1))}
                  className="h-8 w-8 items-center justify-center rounded-full bg-[#EEF1F5]"
                >
                  <ChevronLeft size={18} color="#2C2C2C66" />
                </Pressable>
                <Pressable
                  onPress={() => setCurrentDate(new Date(year, month + 1, 1))}
                  className="h-8 w-8 items-center justify-center rounded-full bg-[#EEF1F5]"
                >
                  <ChevronRight size={18} color="#2C2C2C66" />
                </Pressable>
              </View>
            </View>

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
                          setIsOpen(false);
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
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

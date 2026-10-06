import { useState } from "react";
import { View, Text, Pressable, Modal, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

type MinuteInterval = 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;

type TimeRangeInputsProps = {
  startTime: string; // "HH:mm"
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  minuteInterval?: MinuteInterval; // 기본 1분 (캘린더는 그대로)
};

function timeStringToDate(time: string) {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function dateToTimeString(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

// 피커가 interval을 무시하는 환경 대비: 가장 가까운 단위로 반올림
function snapToInterval(time: string, interval: number) {
  if (interval <= 1) return time;
  const [h, m] = time.split(":").map(Number);
  const max = 24 * 60 - interval; // 30분이면 23:30이 최대
  const total = Math.min(Math.round((h * 60 + m) / interval) * interval, max);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(
    total % 60
  ).padStart(2, "0")}`;
}

function formatTimeLabel(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h < 12 ? "오전" : "오후";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${period} ${hour12}:${String(m).padStart(2, "0")}`;
}

function TimeField({
  value,
  onChange,
  minuteInterval = 1,
}: {
  value: string;
  onChange: (v: string) => void;
  minuteInterval?: MinuteInterval;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // 피커에 넘기는 값도 단위에 맞춰둬야 iOS 휠이 어긋나지 않음
  const pickerValue = timeStringToDate(snapToInterval(value, minuteInterval));

  const handleChange = (_: unknown, date?: Date) => {
    if (Platform.OS === "android") setIsOpen(false);
    if (date) onChange(snapToInterval(dateToTimeString(date), minuteInterval));
  };

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        className="h-[50px] flex-1 px-6 justify-center rounded-2xl bg-[#F6F8FA]"
      >
        <Text className="text-[16px] font-semibold text-[#2C2C2C]">
          {formatTimeLabel(value)}
        </Text>
      </Pressable>

      {Platform.OS === "ios" ? (
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
              className="rounded-t-2xl bg-white pb-8"
            >
              <View className="flex-row justify-end border-b-[0.5px] border-[#D6DDE5] px-4 py-3">
                <Pressable onPress={() => setIsOpen(false)}>
                  <Text className="text-[15px] font-semibold text-[#5E92F0]">
                    완료
                  </Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={pickerValue}
                mode="time"
                display="spinner"
                is24Hour={false}
                minuteInterval={minuteInterval}
                onChange={handleChange}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : (
        isOpen && (
          <DateTimePicker
            value={pickerValue}
            mode="time"
            display={minuteInterval > 1 ? "spinner" : "default"}
            is24Hour={false}
            minuteInterval={minuteInterval}
            onChange={handleChange}
          />
        )
      )}
    </>
  );
}

export default function TimeRangeInputs({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  minuteInterval,
}: TimeRangeInputsProps) {
  return (
    <View className="mb-3 flex-row gap-3">
      <TimeField
        value={startTime}
        onChange={onStartTimeChange}
        minuteInterval={minuteInterval}
      />
      <TimeField
        value={endTime}
        onChange={onEndTimeChange}
        minuteInterval={minuteInterval}
      />
    </View>
  );
}

import { useState } from "react";
import { View, Text, Pressable, Modal, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

type TimeRangeInputsProps = {
  startTime: string; // "HH:mm"
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
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

function formatTimeLabel(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h < 12 ? "오전" : "오후";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${period} ${hour12}:${String(m).padStart(2, "0")}`;
}

function TimeField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (_: unknown, date?: Date) => {
    if (Platform.OS === "android") setIsOpen(false);
    if (date) onChange(dateToTimeString(date));
  };

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        className="h-[55px] flex-1 px-6 justify-center rounded-2xl bg-[#F6F8FA]"
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
                value={timeStringToDate(value)}
                mode="time"
                display="spinner"
                is24Hour={false}
                onChange={handleChange}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : (
        isOpen && (
          <DateTimePicker
            value={timeStringToDate(value)}
            mode="time"
            display="default"
            is24Hour={false}
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
}: TimeRangeInputsProps) {
  return (
    <View className="mb-3 flex-row gap-3">
      <TimeField value={startTime} onChange={onStartTimeChange} />
      <TimeField value={endTime} onChange={onEndTimeChange} />
    </View>
  );
}

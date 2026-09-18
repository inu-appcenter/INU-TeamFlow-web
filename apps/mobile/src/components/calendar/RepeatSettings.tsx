import { View, Text, Pressable, Modal, Platform } from "react-native";
import { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { Repeat, ChevronDown } from "lucide-react-native";
import { DAYS } from "@moimi/core/constants/days";

export type RepeatType = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

type RepeatSettingsProps = {
  repeatType: RepeatType;
  onRepeatTypeChange: (type: RepeatType) => void;
  repeatDays: number[];
  onRepeatDaysChange: (days: number[]) => void;
  includeDailyOption?: boolean;
};

const LABELS: Record<RepeatType, string> = {
  DAILY: "매일",
  WEEKLY: "매주",
  MONTHLY: "매월",
  YEARLY: "매년",
};

export default function RepeatSettings({
  repeatType,
  onRepeatTypeChange,
  repeatDays,
  onRepeatDaysChange,
  includeDailyOption = false,
}: RepeatSettingsProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const options: RepeatType[] = includeDailyOption
    ? ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]
    : ["WEEKLY", "MONTHLY", "YEARLY"];

  const toggleDay = (index: number) => {
    onRepeatDaysChange(
      repeatDays.includes(index)
        ? repeatDays.filter((d) => d !== index)
        : [...repeatDays, index]
    );
  };

  return (
    <>
      <View className="mb-3 h-[50px] flex-row items-center justify-between rounded-2xl bg-[#F6F8FA] px-6">
        <View className="flex-row items-center gap-3">
          <Repeat size={18} color="#2C2C2C" />
          <Text className="text-[16px] font-semibold text-[#2C2C2C]">
            반복 유형
          </Text>
        </View>

        {Platform.OS === "android" ? (
          <View style={{ width: 100 }}>
            <Picker
              selectedValue={repeatType}
              onValueChange={(v) => onRepeatTypeChange(v as RepeatType)}
              mode="dropdown"
              style={{ height: 40 }}
              dropdownIconColor="#2C2C2C"
            >
              {options.map((o) => (
                <Picker.Item key={o} label={LABELS[o]} value={o} />
              ))}
            </Picker>
          </View>
        ) : (
          <Pressable
            onPress={() => setIsPickerOpen(true)}
            className="flex-row items-center gap-1"
          >
            <Text className="text-[16px] font-semibold text-[#2C2C2C]">
              {LABELS[repeatType]}
            </Text>
            <ChevronDown size={14} color="#2C2C2C" />
          </Pressable>
        )}
      </View>

      {Platform.OS === "ios" && (
        <Modal
          transparent
          visible={isPickerOpen}
          animationType="slide"
          onRequestClose={() => setIsPickerOpen(false)}
        >
          <Pressable
            onPress={() => setIsPickerOpen(false)}
            className="flex-1 justify-end bg-black/30"
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              className="rounded-t-2xl bg-white pb-8"
            >
              <View className="flex-row justify-end border-b-[0.5px] border-[#D6DDE5] px-4 py-3">
                <Pressable onPress={() => setIsPickerOpen(false)}>
                  <Text className="text-[15px] font-semibold text-[#5E92F0]">
                    완료
                  </Text>
                </Pressable>
              </View>
              <Picker
                selectedValue={repeatType}
                onValueChange={(v) => onRepeatTypeChange(v as RepeatType)}
              >
                {options.map((o) => (
                  <Picker.Item key={o} label={LABELS[o]} value={o} />
                ))}
              </Picker>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {repeatType === "WEEKLY" && (
        <View className="mb-3 flex-row justify-between gap-2">
          {DAYS.map((day, index) => {
            const isSelected = repeatDays.includes(index);
            return (
              <Pressable
                key={day}
                onPress={() => toggleDay(index)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isSelected ? "#5E92F0" : "#F6F8FA",
                }}
                className="transition-transform duration-150 ease-out active:scale-95"
              >
                <Text
                  className="text-[15px] font-semibold"
                  style={{ color: isSelected ? "#fff" : "#2C2C2C" }}
                >
                  {day}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </>
  );
}

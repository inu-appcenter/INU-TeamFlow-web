import { View, Text, Pressable } from "react-native";

type ScheduleType = "NORMAL" | "PERIOD" | "REPEAT";

type ScheduleTypeToggleProps = {
  value: ScheduleType;
  onChange: (type: ScheduleType) => void;
  disabled?: boolean;
};

const LABELS: Record<ScheduleType, string> = {
  NORMAL: "일반",
  PERIOD: "기간",
  REPEAT: "반복",
};

export default function ScheduleTypeToggle({
  value,
  onChange,
  disabled = false,
}: ScheduleTypeToggleProps) {
  return (
    <View className="mb-5 flex-row gap-2">
      {(["NORMAL", "PERIOD", "REPEAT"] as ScheduleType[]).map((type) => {
        const isSelected = value === type;
        return (
          <Pressable
            key={type}
            disabled={disabled}
            onPress={() => onChange(type)}
            style={{
              borderWidth: 0.5,
              borderColor: isSelected ? "#5E92F0" : "#D6DDE566",
              backgroundColor: isSelected ? "#5E92F0" : "#EEF1F5",
              opacity: disabled ? 0.5 : 1,
            }}
            className="rounded-full px-6 py-3"
          >
            <Text
              className="text-[14px] font-semibold"
              style={{ color: isSelected ? "#ffffff" : "#2C2C2C" }}
            >
              {LABELS[type]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

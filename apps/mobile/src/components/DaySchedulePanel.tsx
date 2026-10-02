import { View, Text } from "react-native";
import { EVENT_COLOR_MAP } from "@moimi/core/constants/scheduleColor";
import type { Schedule } from "@moimi/core/types/event";

type DaySchedulePanelProps = {
  selectedDate: Date;
  selectedSchedules: Schedule[];
};

export default function DaySchedulePanel({
  selectedDate,
  selectedSchedules,
}: DaySchedulePanelProps) {
  return (
    <View className="mt-2 rounded-2xl bg-[#F6F8FA] p-4">
      <Text className="mb-3 text-[14px] font-bold text-[#2C2C2C]">
        {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 일정
      </Text>

      {selectedSchedules.length > 0 ? (
        <View className="gap-2">
          {selectedSchedules.map((schedule) => (
            <View key={schedule.eventId} className="rounded-xl bg-white p-3">
              <View className="flex-row items-center gap-2">
                <View
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: EVENT_COLOR_MAP[schedule.color] }}
                />
                <Text
                  className="flex-1 text-[14px] font-semibold text-[#2C2C2C]"
                  numberOfLines={1}
                >
                  {schedule.title}
                </Text>
              </View>
              <Text
                className="mt-1 text-[12px] text-[#989898]"
                numberOfLines={1}
              >
                {schedule.teamName ?? "개인 일정"}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View className="items-center justify-center pb-6 pt-3">
          <Text className="text-[13px] font-medium text-[#989898]">
            일정이 없습니다
          </Text>
        </View>
      )}
    </View>
  );
}

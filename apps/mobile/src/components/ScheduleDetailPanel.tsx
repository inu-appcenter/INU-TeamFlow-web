import { View, Text, Pressable, ScrollView } from "react-native";
import { Plus } from "lucide-react-native";
import type { Schedule } from "@moimi/core/types/event";
import { getDday } from "@/utils/date/getDday";
import ScheduleListItem from "@/components/ScheduleListItem";

type ScheduleDetailPanelProps = {
  selectedDate: Date;
  dayLabel: string;
  schedules: Schedule[];
  onClickItem: (schedule: Schedule) => void;
  onToggle: (schedule: Schedule) => void;
  onAddClick: () => void;
};

export default function ScheduleDetailPanel({
  selectedDate,
  dayLabel,
  schedules,
  onClickItem,
  onToggle,
  onAddClick,
}: ScheduleDetailPanelProps) {
  return (
    <View className="flex-1">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-[18px] font-bold text-[#2C2C2C]">
          {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 ({dayLabel}
          )
        </Text>
        <Text className="text-[12px] text-[#B0B8C1]">
          {getDday(selectedDate)}
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-2">
          {schedules.map((schedule) => (
            <ScheduleListItem
              key={`${schedule.eventId}-${
                schedule.occurrenceAt ?? schedule.startAt
              }`}
              schedule={schedule}
              onClickItem={onClickItem}
              onToggle={onToggle}
            />
          ))}
        </View>
      </ScrollView>

      <Pressable
        onPress={onAddClick}
        className="mt-3 h-[56px] flex-row items-center gap-2 rounded-[10px] bg-[#EEF1F5] px-5 transition-transform duration-150 active:scale-90"
      >
        <Plus size={18} strokeWidth={2.5} color="#2C2C2C99" />
        <Text className="text-[15px] font-semibold text-[#2C2C2C]/60">
          일정 추가
        </Text>
      </Pressable>
    </View>
  );
}

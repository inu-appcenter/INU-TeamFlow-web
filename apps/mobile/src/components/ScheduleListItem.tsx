import { View, Text, Pressable } from "react-native";
import { Check, MoveHorizontal, Repeat } from "lucide-react-native";
import type { Schedule } from "@moimi/core/types/event";
import { EVENT_COLOR_MAP } from "@moimi/core/constants/scheduleColor";
import { formatTime } from "@/utils/date/formatTime";
import { darkenColor } from "@/utils/color/darkenColor";

type ScheduleListItemProps = {
  schedule: Schedule;
  onClickItem: (schedule: Schedule) => void;
  onToggle: (schedule: Schedule) => void;
  showToggle?: boolean;
};

export default function ScheduleListItem({
  schedule,
  onClickItem,
  onToggle,
  showToggle = true,
}: ScheduleListItemProps) {
  const isDone = schedule.isFinished;
  const isPeriod =
    schedule.startAt.slice(0, 10) !== schedule.endAt.slice(0, 10) &&
    schedule.isSingle;

  return (
    <Pressable
      onPress={() => onClickItem(schedule)}
      className="h-[56px] flex-row items-center justify-between rounded-xl px-3 transition-all duration-150 active:scale-95"
      style={{
        backgroundColor: EVENT_COLOR_MAP[schedule.color],
        borderLeftWidth: isDone ? 0 : 5,
        borderLeftColor: darkenColor(EVENT_COLOR_MAP[schedule.color], 25),
        opacity: schedule.teamId && schedule.isParticipant === false ? 0.4 : 1,
      }}
    >
      <View>
        <Text className="text-[14px] font-medium text-[#2c2c2c]">
          {schedule.title}
        </Text>
        <Text className="mt-0.5 text-[10px] text-[#989898]">
          {schedule.teamName ?? "개인 일정"}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        <Text className="text-[10px] text-[#989898]">
          {schedule.isAllDay
            ? "하루 종일"
            : `${formatTime(schedule.startAt)}~${formatTime(schedule.endAt)}`}
        </Text>

        {!schedule.isSingle && <Repeat size={13} color="#989898" />}
        {isPeriod && <MoveHorizontal size={15} color="#989898" />}

        {showToggle && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onToggle(schedule);
            }}
            className="h-5 w-5 items-center justify-center transition-transform duration-150 ease-out active:scale-90"
          >
            {isDone ? (
              <Check
                size={15}
                color={darkenColor(EVENT_COLOR_MAP[schedule.color], 80)}
              />
            ) : (
              <View
                className="h-4 w-4 rounded-full border"
                style={{
                  borderColor: darkenColor(EVENT_COLOR_MAP[schedule.color], 80),
                }}
              />
            )}
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";

type TimeSlot = {
  slotId: number;
  date: string;
  startAt: string;
  endAt: string;
  participantCount: number;
};

type VoteFormProps = {
  voteId: number;
  voteDates: string[];
  voteHours: number[];
  voteSlots: TimeSlot[];
  isAllDay: boolean;
  isOpened: boolean;
  onSubmit?: (selected: number[]) => void;
};

const LABEL_COL_WIDTH = 30;
const DATE_COL_WIDTH = 72;
const COLUMN_GAP = 6;

export default function VoteForm({
  voteId,
  voteDates,
  voteHours,
  voteSlots,
  isAllDay,
  isOpened,
  onSubmit,
}: VoteFormProps) {
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);

  const toggleSlot = (slotId: number) => {
    setSelectedSlots((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId]
    );
  };

  const getSlot = (date: string, hour: number, minute: string) => {
    if (isAllDay) {
      return voteSlots.find((s) => s.date === date);
    }
    return voteSlots.find(
      (s) =>
        s.date === date &&
        Number(s.startAt.slice(0, 2)) === hour &&
        s.startAt.slice(3, 5) === minute
    );
  };

  const canSubmit = selectedSlots.length > 0 && isOpened;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit?.(selectedSlots);
  };

  return (
    <View className="mt-5">
      <View className="flex-row">
        {/* 고정 시간 라벨 */}
        <View style={{ width: LABEL_COL_WIDTH }}>
          <View style={{ height: 20 }} />
          <View style={{ marginTop: 8, gap: 4 }}>
            {voteHours.map((hour) => (
              <View
                key={hour}
                style={{ height: isAllDay ? 64 : 44 }}
                className="items-end justify-start pt-0.5 pr-2"
              >
                <Text className="text-[11px] text-[#B0B0B0]">
                  {isAllDay ? "종일" : hour}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 날짜 컬럼 (가로 스크롤 + 가운데 정렬) */}
        <ScrollView
          horizontal
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        >
          <View>
            <View className="flex-row" style={{ gap: COLUMN_GAP, height: 20 }}>
              {voteDates.map((date) => (
                <View
                  key={date}
                  style={{ width: DATE_COL_WIDTH }}
                  className="items-center justify-center"
                >
                  <Text className="text-[11px] font-semibold text-[#5C5C5C]">
                    {Number(date.slice(5, 7))}월 {Number(date.slice(8, 10))}일
                  </Text>
                </View>
              ))}
            </View>

            <View
              className="flex-row"
              style={{ gap: COLUMN_GAP, marginTop: 8 }}
            >
              {voteDates.map((date) => (
                <View key={date} style={{ width: DATE_COL_WIDTH, gap: 4 }}>
                  {voteHours.map((hour) => {
                    const minutes = isAllDay ? ["00"] : ["00", "30"];
                    return minutes.map((minute) => {
                      const slot = getSlot(date, hour, minute);
                      const isSelected = slot
                        ? selectedSlots.includes(slot.slotId)
                        : false;

                      return (
                        <Pressable
                          key={`${date}-${hour}-${minute}`}
                          onPress={() => slot && toggleSlot(slot.slotId)}
                          className="transition-transform duration-150 ease-out active:scale-90"
                          disabled={!isOpened || !slot}
                          style={{
                            height: isAllDay ? 64 : 20,
                            borderRadius: 6,
                            backgroundColor: isSelected ? "#5E92F0" : "#F1F4F8",
                            opacity: isOpened ? 1 : 0.4,
                          }}
                        />
                      );
                    });
                  })}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      <View className="mt-12 items-center pb-10">
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={{ opacity: canSubmit ? 1 : 0.4, width: 140 }}
          className="rounded-xl justify-center items-center h-12 active:scale-95 bg-[#5E92F0]"
        >
          <Text className="text-[15px] font-semibold text-white">
            투표하기 ({selectedSlots.length})
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

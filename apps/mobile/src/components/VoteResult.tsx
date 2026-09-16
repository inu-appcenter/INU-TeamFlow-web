import { useState } from "react";
import { View, Text, Pressable, ScrollView, Modal } from "react-native";

type VoteSlot = {
  slotId: number;
  date: string;
  startAt: string;
  endAt: string;
  participantCount: number;
};

type VoteResultProps = {
  title: string;
  voteDates: string[];
  voteHours: number[];
  voteSlots: VoteSlot[];
  isAllDay: boolean;
  onBack: () => void;
  onSubmit: (startAt: string, endAt: string) => void;
};

const LABEL_COL_WIDTH = 30;
const DATE_COL_WIDTH = 72;
const COLUMN_GAP = 6;
const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

type SlotPoint = { date: string; hour: number; minute: string };

export default function VoteResult({
  title,
  voteDates,
  voteHours,
  voteSlots,
  isAllDay,
  onSubmit,
}: VoteResultProps) {
  const [selectedStart, setSelectedStart] = useState<SlotPoint | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<SlotPoint | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const maxParticipantCount = Math.max(
    1,
    ...voteSlots.map((slot) => slot.participantCount)
  );

  const getSlotColor = (participantCount: number) => {
    const ratio = participantCount / maxParticipantCount;
    if (ratio >= 0.8) return "#729BEF99";
    if (ratio >= 0.5) return "#BBD2FFB3";
    if (ratio > 0) return "#DCE8FFB3";
    return "#F1F4F8";
  };

  const handleSlotPress = (date: string, hour: number, minute: string) => {
    if (!selectedStart) {
      setSelectedStart({ date, hour, minute });
      setSelectedEnd(null);
      return;
    }

    if (selectedStart && selectedEnd) {
      setSelectedStart({ date, hour, minute });
      setSelectedEnd(null);
      return;
    }

    if (selectedStart.date !== date) {
      setSelectedStart({ date, hour, minute });
      setSelectedEnd(null);
      return;
    }

    if (
      hour < selectedStart.hour ||
      (hour === selectedStart.hour && minute < selectedStart.minute)
    ) {
      setSelectedStart({ date, hour, minute });
      return;
    }

    setSelectedEnd({ date, hour, minute });
  };

  const isInSelectedRange = (date: string, hour: number, minute: string) => {
    if (!selectedStart) return false;

    const toMinutes = (h: number, m: string) => h * 60 + Number(m);
    const current = toMinutes(hour, minute);
    const start = toMinutes(selectedStart.hour, selectedStart.minute);

    if (!selectedEnd) {
      return selectedStart.date === date && current === start;
    }

    const end = toMinutes(selectedEnd.hour, selectedEnd.minute);
    return selectedStart.date === date && current >= start && current <= end;
  };

  const getEndTimeLabel = (end: SlotPoint) => {
    const endMinute = Number(end.minute) + 30;
    const endHour = end.hour + Math.floor(endMinute / 60);
    const endMin = endMinute % 60;
    return `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <View>
      <View className="pb-6">
        <Text className="mt-2 text-[20px] font-bold text-[#2C2C2C]">
          일정 확정
        </Text>
        <Text className="mt-2 text-[16px] font-semibold text-[#989898]">
          일정으로 등록할 날짜와 시간대를 선택해주세요
        </Text>
      </View>

      <Text className="text-[13px] font-bold text-[#989898]">
        날짜 및 시간 선택
      </Text>

      <View className="mt-5 flex-row">
        <View style={{ width: LABEL_COL_WIDTH }}>
          <View style={{ height: 20 }} />
          <View style={{ marginTop: 8, gap: 4 }}>
            {voteHours.map((hour) => (
              <View
                key={hour}
                style={{ height: isAllDay ? 64 : 44 }}
                className="items-end justify-start pt-0.5 pr-2 "
              >
                <Text className="text-[11px] text-[#B0B0B0]">
                  {isAllDay ? "종일" : hour}
                </Text>
              </View>
            ))}
          </View>
        </View>

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
                      const slot = voteSlots.find(
                        (s) =>
                          s.date === date &&
                          Number(s.startAt.slice(0, 2)) === hour &&
                          s.startAt.slice(3, 5) === minute
                      );
                      const isSelected = isInSelectedRange(date, hour, minute);

                      return (
                        <Pressable
                          key={`${date}-${hour}-${minute}`}
                          onPress={() => handleSlotPress(date, hour, minute)}
                          className="transition-transform duration-150 ease-out active:scale-90"
                          style={{
                            height: isAllDay ? 64 : 20,
                            borderRadius: 6,
                            backgroundColor: isSelected
                              ? "#5E92F0"
                              : slot
                              ? getSlotColor(slot.participantCount)
                              : "#F1F4F8",
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

      <View className="mt-8 border-t-[0.5px] border-[#D6DDE5] pt-6">
        <Text className="text-[13px] font-bold text-[#989898]">일정 정보</Text>
        <Text className="mt-3 text-[20px] font-bold text-[#2C2C2C]">
          {title}
        </Text>

        {selectedStart ? (
          <>
            <View className="mt-4 flex-row items-center gap-4 rounded-2xl bg-[#F6F8FA] p-5">
              <Text className="text-[16px] font-bold text-[#2C2C2C]">
                {Number(selectedStart.date.slice(5, 7))}월{" "}
                {Number(selectedStart.date.slice(8, 10))}일 (
                {DAY_LABELS[new Date(selectedStart.date).getDay()]})
              </Text>

              <Text className="text-[14px] font-semibold text-[#2c2c2c]">
                {isAllDay
                  ? "종일"
                  : selectedEnd
                  ? `${String(selectedStart.hour).padStart(2, "0")}:${
                      selectedStart.minute
                    } ~ ${getEndTimeLabel(selectedEnd)}`
                  : `${String(selectedStart.hour).padStart(2, "0")}:${
                      selectedStart.minute
                    } (종료 시간 선택 필요)`}
              </Text>
            </View>

            <View className="mt-8 mb-10 items-center">
              <Pressable
                disabled={!selectedEnd}
                style={{ width: 140 }}
                onPress={() => setIsConfirmModalOpen(true)}
                className={`rounded-xl justify-center items-center h-12 transition-transform duration-150 ease-out active:scale-95 ${
                  selectedEnd ? "bg-[#5E92F0]" : "bg-[#EEF1F5]"
                }`}
              >
                <Text
                  className={`text-[15px] font-semibold ${
                    selectedEnd ? "text-white" : "text-[#989898]"
                  }`}
                >
                  일정 등록하기
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View className="mb-10 h-[100px] items-center justify-center">
            <Text className="text-[14px] font-semibold text-[#989898]">
              시작 시간을 선택해주세요
            </Text>
          </View>
        )}
      </View>

      <Modal
        transparent
        visible={isConfirmModalOpen && !!selectedStart && !!selectedEnd}
        animationType="fade"
        onRequestClose={() => setIsConfirmModalOpen(false)}
      >
        <Pressable
          onPress={() => setIsConfirmModalOpen(false)}
          className="flex-1 items-center justify-center bg-black/40 px-6"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full max-w-[340px] rounded-3xl bg-white px-6 py-6"
          >
            <Text className="text-center text-[18px] font-bold text-[#2C2C2C]">
              일정을 확정하시겠습니까?
            </Text>
            <Text className="mt-2 text-center text-[13px] leading-5 text-[#989898]">
              생성 후에도 일정 수정이 가능해요
            </Text>

            <View className="mt-5 flex-row gap-3">
              <Pressable
                onPress={() => setIsConfirmModalOpen(false)}
                className="flex-1 items-center rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-3"
              >
                <Text className="text-[14px] font-semibold text-[#2c2c2c]">
                  취소
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  if (!selectedStart || !selectedEnd) return;
                  onSubmit(
                    isAllDay
                      ? `${selectedStart.date}T00:00:00`
                      : `${selectedStart.date}T${String(
                          selectedStart.hour
                        ).padStart(2, "0")}:${selectedStart.minute}`,
                    isAllDay
                      ? `${selectedEnd.date}T23:59:00`
                      : `${selectedEnd.date}T${getEndTimeLabel(selectedEnd)}`
                  );
                  setIsConfirmModalOpen(false);
                }}
                className="flex-1 items-center rounded-xl bg-[#5E92F0] py-3"
              >
                <Text className="text-[14px] font-semibold text-white">
                  확정하기
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

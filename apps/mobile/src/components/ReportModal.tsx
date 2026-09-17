import { useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { ChevronDown, Check } from "lucide-react-native";
import {
  REPORT_REASON_LABEL,
  type ReportReason,
  type ReportRequest,
} from "@moimi/core/types/report";

const REASON_OPTIONS = (Object.keys(REPORT_REASON_LABEL) as ReportReason[]).map(
  (value) => ({
    value,
    label: REPORT_REASON_LABEL[value],
  })
);

type ReportModalProps = {
  targetLabel: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: ReportRequest) => void | Promise<void>;
};

export default function ReportModal({
  targetLabel,
  isSubmitting = false,
  onClose,
  onSubmit,
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const [detail, setDetail] = useState("");

  const selectedLabel = reason
    ? REPORT_REASON_LABEL[reason]
    : "신고 유형을 선택해주세요";
  const isSubmitDisabled = !reason || !detail.trim() || isSubmitting;

  const handleSubmit = async () => {
    if (isSubmitDisabled || !reason) return;
    await onSubmit({ reason, detail: detail.trim() });
  };

  // 주의: 여기서 RN <Modal>을 쓰지 않고 절대 위치 오버레이로만 구현했습니다.
  // ChatRoomDrawer의 <Modal> 안에 중첩해서 렌더링되므로, Modal 안에 또 Modal을 넣으면
  // 안 되는 RN 제약(이 세션에서 이미 여러 번 부딪힌 문제) 때문입니다.
  return (
    <Pressable
      onPress={onClose}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 400,
      }}
      className="items-center justify-center bg-black/40 px-4"
    >
      <Pressable
        onPress={(e) => e.stopPropagation()}
        className="w-full max-w-[500px] rounded-3xl bg-white p-6"
      >
        <Text className="text-center text-xl font-bold text-[#2C2C2C]">
          {targetLabel} 신고하기
        </Text>
        <Text className="mt-1 text-center text-sm text-[#989898]">
          신고 사유를 알려주시면 검토 후 조치할게요
        </Text>

        <View className="mt-3">
          <Text className="mb-1 text-xs font-medium text-[#B0B0B0]">
            신고 유형
          </Text>
          <Pressable
            onPress={() => setIsReasonOpen((prev) => !prev)}
            className="h-[42px] flex-row items-center justify-between rounded-xl border-[0.5px] border-[#D6DDE5]/60 bg-[#F6F8FA] px-4"
          >
            <Text
              className={
                reason ? "text-sm text-[#2C2C2C]" : "text-sm text-[#9C9C9C]"
              }
            >
              {selectedLabel}
            </Text>
            <ChevronDown size={16} color="#9C9C9C" />
          </Pressable>

          {isReasonOpen && (
            <View className="mt-1 overflow-hidden rounded-2xl border-[0.5px] border-[#D6DDE5] bg-white p-2 shadow-md">
              {REASON_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    setReason(option.value);
                    setIsReasonOpen(false);
                  }}
                  className={`flex-row items-center justify-between rounded-xl px-4 py-2 ${
                    reason === option.value ? "bg-[#EEF1F5]" : ""
                  }`}
                >
                  <Text className="text-sm text-[#2C2C2C]">{option.label}</Text>
                  {reason === option.value && (
                    <Check size={16} color="#5E92F0" />
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View className="mt-4">
          <Text className="mb-1 text-xs font-medium text-[#B0B0B0]">
            신고 내용
          </Text>
          <TextInput
            value={detail}
            onChangeText={setDetail}
            multiline
            numberOfLines={5}
            placeholder="신고 사유를 자세히 적어주세요"
            placeholderTextColor="#9C9C9C"
            style={{ height: 100, textAlignVertical: "top" }}
            className="rounded-xl border-[0.5px] border-[#D6DDE5]/60 bg-[#F6F8FA] px-4 py-3.5 text-sm text-[#2C2C2C]"
          />
        </View>

        <View className="mt-4 flex-row gap-3">
          <Pressable
            onPress={onClose}
            disabled={isSubmitting}
            className="flex-1 items-center rounded-xl border-[0.5px] border-[#D6DDE5]/60 bg-[#F6F8FA] py-3"
            style={{ opacity: isSubmitting ? 0.5 : 1 }}
          >
            <Text className="text-sm font-semibold text-[#2C2C2C]">취소</Text>
          </Pressable>
          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
            className="flex-1 items-center rounded-xl py-3"
            style={{
              backgroundColor: isSubmitDisabled ? "#EEF1F5" : "#E22222",
            }}
          >
            <Text
              className={`text-sm font-semibold ${
                isSubmitDisabled ? "text-[#9C9C9C]" : "text-white"
              }`}
            >
              {isSubmitting ? "접수 중..." : "신고하기"}
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Pressable>
  );
}

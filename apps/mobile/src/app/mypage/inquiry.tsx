import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  CheckCircle2,
  SquarePen,
  History,
} from "lucide-react-native";
import SelectField from "@/components/SelectField";
import {
  useCreateInquiry,
  useCancelInquiry,
} from "@moimi/core/hooks/useCreateInquiry";
import {
  useMyInquiries,
  useMyInquiryDetail,
} from "@moimi/core/hooks/useMyInquiries";
import {
  INQUIRY_TYPE_LABEL,
  type InquiryType,
} from "@moimi/core/types/inquiry";

const INQUIRY_CATEGORIES: { value: InquiryType; label: string }[] = [
  { value: "ACCOUNT", label: "계정 관련" },
  { value: "BUG", label: "오류 / 버그 신고" },
  { value: "SUGGESTION", label: "기능 제안" },
  { value: "ETC", label: "기타" },
];

const CONTENT_MAX = 1000;
type ViewValue = "MENU" | "CREATE" | "HISTORY";

function InquiryDetailModal({
  inquiryId,
  onClose,
}: {
  inquiryId: number;
  onClose: () => void;
}) {
  const { data: detail, isLoading } = useMyInquiryDetail(inquiryId);
  const { mutate: cancelInquiryMutate, isPending: isCancelling } =
    useCancelInquiry();
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 1800);
  };

  const handleCancel = () => {
    cancelInquiryMutate(inquiryId, {
      onSuccess: () => {
        setIsCancelConfirmOpen(false);
        onClose();
      },
      onError: () => {
        setIsCancelConfirmOpen(false);
        showErrorMessage("문의 취소에 실패했어요");
      },
    });
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/40 px-4"
      >
        {errorMessage ? (
          <View
            style={{
              position: "absolute",
              top: 120,
              alignSelf: "center",
              zIndex: 50,
            }}
            className="rounded-full bg-[#2C2C2C] px-5 py-2"
          >
            <Text className="text-sm font-semibold text-white">
              {errorMessage}
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="max-h-[85%] w-full max-w-[420px] overflow-hidden rounded-3xl bg-white"
        >
          {isLoading || !detail ? (
            <View className="h-[280px] items-center justify-center">
              <ActivityIndicator color="#989898" />
            </View>
          ) : (
            <>
              <View className="flex-row items-center justify-between border-b-[0.5px] border-[#D6DDE5] px-5 py-3">
                <View className="rounded-full bg-[#EEF1F5] px-2.5 py-1.5">
                  <Text className="text-[12px] font-semibold text-[#5E92F0]">
                    {INQUIRY_TYPE_LABEL[detail.type]}
                  </Text>
                </View>
                <View
                  className={`rounded-full px-2.5 py-2 ${
                    detail.status === "PENDING"
                      ? "bg-[#FFDDDD]"
                      : "bg-[#DDF7E5]"
                  }`}
                >
                  <Text
                    className={`text-[11px] font-semibold ${
                      detail.status === "PENDING"
                        ? "text-[#B32424]"
                        : "text-[#2E7845]"
                    }`}
                  >
                    {detail.status === "PENDING" ? "대기중" : "답변완료"}
                  </Text>
                </View>
              </View>

              <ScrollView className="px-6 py-3" style={{ maxHeight: 360 }}>
                <Text className="text-xs text-[#9C9C9C]">
                  {detail.createdAt.slice(0, 10)} 문의
                </Text>

                <View className="mt-2 rounded-xl bg-[#F6F8FA] px-4 py-3">
                  <Text className="text-sm leading-6 text-[#2C2C2C]">
                    {detail.detail}
                  </Text>
                </View>

                <View className="mt-4">
                  <Text className="mb-2 text-xs font-medium text-[#B0B0B0]">
                    답변
                  </Text>
                  {detail.answer ? (
                    <>
                      <View className="rounded-xl bg-[#EEF3FE] px-4 py-3">
                        <Text className="text-sm leading-6 text-[#2C2C2C]">
                          {detail.answer}
                        </Text>
                      </View>
                      {detail.answeredAt && (
                        <Text className="mt-2 text-xs text-[#9C9C9C] mb-0.5">
                          {detail.answeredAt.slice(0, 10)} 답변됨
                        </Text>
                      )}
                    </>
                  ) : (
                    <View className="rounded-xl bg-[#F6F8FA] px-4 py-3 mb-1">
                      <Text className="text-sm text-[#9C9C9C]">
                        아직 답변이 등록되지 않았어요
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>

              <View className="flex-row gap-3 border-t-[0.5px] border-[#D6DDE5] px-6 pb-6 pt-4">
                {detail.status === "PENDING" && (
                  <Pressable
                    onPress={() => setIsCancelConfirmOpen(true)}
                    disabled={isCancelling}
                    className="flex-1 items-center rounded-xl border-[0.5px] border-[#F2C6C6]/40 bg-[#FDEEEE] py-2.5 transition-transform duration-150 ease-out active:scale-95"
                  >
                    <Text className="text-sm font-semibold text-[#E22222]">
                      문의 취소
                    </Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={onClose}
                  className="flex-1 items-center rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] py-2.5 transition-transform duration-150 ease-out active:scale-95"
                >
                  <Text className="text-sm font-semibold text-[#2C2C2C]">
                    닫기
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </Pressable>

        {isCancelConfirmOpen && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              setIsCancelConfirmOpen(false);
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            className="items-center justify-center bg-black/40"
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              className="w-[300px] rounded-3xl bg-white p-4"
            >
              <Text className="text-center text-lg font-bold text-[#2C2C2C]">
                문의를 취소할까요?
              </Text>
              <Text className="mt-2 text-center text-sm text-[#989898]">
                취소한 문의는 다시 볼 수 없어요
              </Text>

              <View className="mt-4 flex-row gap-3">
                <Pressable
                  onPress={() => setIsCancelConfirmOpen(false)}
                  className="flex-1 items-center rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-2 transition-transform duration-150 ease-out active:scale-95"
                >
                  <Text className="font-semibold text-[#2C2C2C]">아니요</Text>
                </Pressable>
                <Pressable
                  onPress={handleCancel}
                  disabled={isCancelling}
                  className="flex-1 items-center rounded-xl bg-[#E22222] py-2.5 transition-transform duration-150 ease-out active:scale-95"
                >
                  <Text className="font-semibold text-white">
                    {isCancelling ? "취소 중..." : "취소하기"}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        )}
      </Pressable>
    </Modal>
  );
}

function InquiryHistoryList() {
  const { data: inquiries, isLoading } = useMyInquiries();
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(
    null
  );

  return (
    <View className="py-2 mt-4">
      {isLoading && (
        <View className="h-[200px] items-center justify-center">
          <ActivityIndicator color="#989898" />
        </View>
      )}

      {!isLoading && inquiries && inquiries.length === 0 && (
        <View className="h-[200px] items-center justify-center">
          <Text className="text-sm text-[#9C9C9C]">
            아직 남긴 문의가 없어요
          </Text>
        </View>
      )}

      {!isLoading && inquiries && inquiries.length > 0 && (
        <View className="overflow-hidden rounded-2xl border-[0.5px] border-[#D6DDE5]/40">
          {inquiries.map((inquiry, index) => (
            <Pressable
              key={inquiry.inquiryId}
              onPress={() => setSelectedInquiryId(inquiry.inquiryId)}
              className={`flex-row items-center justify-between gap-4 bg-[#F6F8FA] px-5 h-[70px] active:opacity-70 ${
                index !== 0 ? "border-t-[0.5px] border-[#D6DDE5]/40" : ""
              }`}
            >
              <View className="min-w-0 flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="shrink-0 text-sm font-semibold text-[#5E92F0]">
                    {INQUIRY_TYPE_LABEL[inquiry.type]}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="flex-1 text-[13px] text-[#2C2C2C]"
                  >
                    {inquiry.detail}
                  </Text>
                </View>
                <Text className="mt-1 text-xs text-[#9C9C9C]">
                  {inquiry.createdAt.slice(0, 10)}
                </Text>
              </View>

              <View
                className={`shrink-0 rounded-full px-2.5 py-2 ${
                  inquiry.status === "PENDING" ? "bg-[#FFDDDD]" : "bg-[#DDF7E5]"
                }`}
              >
                <Text
                  className={`text-[11px] font-semibold ${
                    inquiry.status === "PENDING"
                      ? "text-[#B32424]"
                      : "text-[#2E7845]"
                  }`}
                >
                  {inquiry.status === "PENDING" ? "대기중" : "답변완료"}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {selectedInquiryId !== null && (
        <InquiryDetailModal
          inquiryId={selectedInquiryId}
          onClose={() => setSelectedInquiryId(null)}
        />
      )}
    </View>
  );
}

export default function InquiryScreen() {
  const router = useRouter();
  const { mutate: createInquiry, isPending } = useCreateInquiry();

  const [view, setView] = useState<ViewValue>("MENU");
  const [form, setForm] = useState<{
    category: InquiryType | "";
    content: string;
  }>({
    category: "",
    content: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 1800);
  };

  const categoryOptions = INQUIRY_CATEGORIES.map((c) => ({
    label: c.label,
    value: c.value,
  }));

  const handleSubmit = () => {
    if (!form.category) {
      showErrorMessage("문의 유형을 선택해주세요");
      return;
    }
    if (!form.content.trim()) {
      showErrorMessage("내용을 입력해주세요");
      return;
    }

    createInquiry(
      { type: form.category, detail: form.content },
      {
        onSuccess: () => setIsSubmitted(true),
        onError: () => showErrorMessage("문의 등록에 실패했어요"),
      }
    );
  };

  const handleReset = () => {
    setForm({ category: "", content: "" });
    setIsSubmitted(false);
  };

  const handleBack = () => {
    if (view === "MENU") {
      router.back();
      return;
    }
    setIsSubmitted(false);
    setView("MENU");
  };

  return (
    <View className="flex-1 bg-[#Ffffff]">
      {errorMessage ? (
        <View
          style={{
            position: "absolute",
            top: 120,
            alignSelf: "center",
            zIndex: 50,
          }}
          className="rounded-full bg-[#2C2C2C] px-5 py-2"
        >
          <Text className="text-sm font-semibold text-white">
            {errorMessage}
          </Text>
        </View>
      ) : null}

      <View
        style={{ paddingTop: 60 }}
        className="flex-row items-center gap-3 bg-[#F0F2F5] px-5 pb-4"
      >
        <Pressable onPress={handleBack} className="active:opacity-70">
          <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
        </Pressable>
        <Text className="text-[20px] font-bold text-[#2C2C2C]">
          {view === "HISTORY" ? "문의 내역" : "문의하기"}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {view === "MENU" && (
          <>
            <View className="gap-4">
              <Pressable
                onPress={() => setView("CREATE")}
                className="mt-6 min-h-[75px] flex-row items-center gap-4 rounded-2xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-5 transition-transform duration-150 ease-out active:scale-[0.98]"
              >
                <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F6F8FA]">
                  <SquarePen size={18} strokeWidth={2} color="#5E92F0" />
                </View>
                <Text className="text-[15px] font-medium text-[#2C2C2C]">
                  문의 남기기
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setView("HISTORY")}
                className="min-h-[75px] flex-row items-center gap-4 rounded-2xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-5 transition-transform duration-150 ease-out active:scale-[0.98]"
              >
                <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F6F8FA]">
                  <History size={18} strokeWidth={2} color="#5E92F0" />
                </View>
                <Text className="text-[15px] font-medium text-[#2C2C2C]">
                  문의 내역 보기
                </Text>
              </Pressable>
            </View>
          </>
        )}

        {view === "HISTORY" && <InquiryHistoryList />}

        {view === "CREATE" &&
          (isSubmitted ? (
            <View className="items-center py-20">
              <CheckCircle2 size={48} strokeWidth={1.5} color="#5E92F0" />
              <Text className="mt-5 text-xl font-bold text-[#2C2C2C]">
                문의가 접수됐어요
              </Text>
              <Text className="mt-2 text-center text-[14px] leading-6 text-[#989898]">
                남겨주신 문의는 순서대로 확인 후 답변드릴게요{"\n"}
                답변은 문의 내역에서 확인하실 수 있어요
              </Text>

              <View className="mt-8 flex-row gap-4">
                <Pressable
                  onPress={handleReset}
                  className="flex w-[130px] justify-center rounded-xl border-[0.5px] border-[#D6DDE5]/60 bg-[#F6F8FA] py-3.5 text-center transition-transform duration-150 ease-out active:scale-95"
                >
                  <Text className="text-center font-semibold text-[#2C2C2C]">
                    문의 더 남기기
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setIsSubmitted(false);
                    setView("HISTORY");
                  }}
                  className="flex w-[130px] justify-center rounded-xl bg-[#5E92F0] py-3.5 text-center transition-transform duration-150 ease-out active:scale-95"
                >
                  <Text className="text-center font-semibold text-white">
                    문의 내역 보기
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              <View className="py-2 mt-4">
                <View className="mb-2 flex-row items-center gap-1">
                  <Text className="text-[13px] font-bold tracking-wider text-[#B0B0B0]">
                    문의 유형
                  </Text>
                </View>
                <SelectField
                  value={form.category}
                  onChange={(v) =>
                    setForm((prev) => ({ ...prev, category: v as InquiryType }))
                  }
                  options={categoryOptions}
                  placeholder="유형을 선택해주세요"
                />
              </View>

              <View className="py-2">
                <View className="mb-2 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1">
                    <Text className="text-[13px] font-bold tracking-wider text-[#B0B0B0]">
                      내용
                    </Text>
                  </View>
                  <Text className="text-xs text-[#989898]">
                    {form.content.length}/{CONTENT_MAX}
                  </Text>
                </View>
                <TextInput
                  value={form.content}
                  onChangeText={(text) =>
                    setForm((prev) => ({
                      ...prev,
                      content: text.slice(0, CONTENT_MAX),
                    }))
                  }
                  maxLength={CONTENT_MAX}
                  multiline
                  textAlignVertical="top"
                  placeholder="문의 내용을 자세히 남겨주시면 더 빠르게 도와드릴 수 있어요"
                  placeholderTextColor="#989898"
                  style={{ minHeight: 220 }}
                  className="rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] p-4 text-[#2c2c2c]"
                />
              </View>

              <View className="mt-8 mb-8 items-center">
                <Pressable
                  onPress={handleSubmit}
                  disabled={isPending}
                  style={{ opacity: isPending ? 0.6 : 1 }}
                  className="rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#5E92F0] px-10 py-3.5 transition-transform duration-150 ease-out active:scale-95"
                >
                  <Text className="text-[15px] font-semibold text-white">
                    {isPending ? "등록 중..." : "문의 남기기"}
                  </Text>
                </Pressable>
              </View>
            </>
          ))}
      </ScrollView>
    </View>
  );
}

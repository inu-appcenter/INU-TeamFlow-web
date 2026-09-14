import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Modal,
  Platform,
} from "react-native";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ChevronLeft } from "lucide-react-native";
import { useMyTeams } from "@moimi/core/hooks/team/useTeamQuery";
import {
  categoryMap,
  categoryColorMap,
  DEFAULT_CATEGORY_COLOR,
} from "@moimi/core/constants/category";
import { darkenColor } from "@/utils/color/darkenColor";

export type RecruitmentFormData = {
  title: string;
  category: "CONTEST" | "STUDY" | "CLUB" | "PROJECT" | "ETC";
  description: string;
  announcementId?: number;
  announcementTitle?: string;
  teamId?: number;
  targetMemberCount: number | "";
  endAt: string; // yyyy-mm-dd
};

type RecruitmentFormProps = {
  mode: "create" | "edit";
  initialData?: RecruitmentFormData;
  onSubmit: (data: RecruitmentFormData) => Promise<void>;
  onDelete?: () => void;
};

export default function RecruitmentForm({
  mode,
  initialData,
  onSubmit,
  onDelete,
}: RecruitmentFormProps) {
  const { data: myTeams = [] } = useMyTeams();
  const manageableTeams = myTeams.filter(
    (t) => t.teamRole === "LEADER" || t.teamRole === "MANAGER"
  );

  const [form, setForm] = useState<RecruitmentFormData>(
    initialData ?? {
      title: "",
      category: "ETC",
      description: "",
      announcementId: undefined,
      announcementTitle: undefined,
      teamId: undefined,
      targetMemberCount: "",
      endAt: "",
    }
  );

  const [selectedInfoPostTitle] = useState(
    initialData?.announcementTitle ?? ""
  );
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 1800);
  };

  const currentColor =
    categoryColorMap[form.category] ?? DEFAULT_CATEGORY_COLOR;

  const handleDateChange = (_: unknown, date?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (date)
      setForm((prev) => ({ ...prev, endAt: date.toISOString().slice(0, 10) }));
  };

  const validate = () => {
    if (!form.title.trim()) {
      showErrorMessage("모집글 제목을 입력해주세요");
      return false;
    }
    if (!form.description.trim()) {
      showErrorMessage("상세요강을 입력해주세요");
      return false;
    }
    if (!form.endAt) {
      showErrorMessage("모집 마감일을 입력해주세요");
      return false;
    }
    if (!form.targetMemberCount) {
      showErrorMessage("모집 인원을 입력해주세요");
      return false;
    }
    if (!form.teamId) {
      showErrorMessage("연결할 팀을 선택해주세요");
      return false;
    }
    return true;
  };

  const submit = async () => {
    await onSubmit({
      ...form,
      endAt: new Date(`${form.endAt}T00:00:00`).toISOString(),
    });
  };

  return (
    <View className="flex-1 bg-[#ffffff]">
      {errorMessage && (
        <View
          style={{
            position: "absolute",
            top: 160,
            alignSelf: "center",
            zIndex: 50,
          }}
          className="rounded-full bg-[#2C2C2C] px-5 py-2"
        >
          <Text className="text-sm font-semibold text-white">
            {errorMessage}
          </Text>
        </View>
      )}

      <View
        style={{ backgroundColor: currentColor, paddingTop: 60 }}
        className="px-5 pb-4"
      >
        <Pressable
          onPress={() => router.back()}
          className=" transition-transform duration-150 ease-out active:scale-90"
        >
          <ChevronLeft size={24} strokeWidth={2.5} color="#2C2C2C" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 60,
        }}
      >
        {/* 제목 */}
        <View className="mb-4">
          <Text className="mb-2 text-[13px] font-bold text-[#B0B0B0]">
            제목
          </Text>
          <TextInput
            value={form.title}
            onChangeText={(v) => setForm((p) => ({ ...p, title: v }))}
            className="h-[40px] rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-4 text-[#2C2C2C]"
          />
        </View>

        {/* 공고 연결 (2단계) */}
        <View className="mb-4">
          <View className="mb-2 flex-row items-center gap-1">
            <Text className="text-[13px] font-bold text-[#B0B0B0]">
              모집글 공고
            </Text>
            {mode === "edit" && (
              <Text className="text-[11px] text-[#9a9a9a]">
                (수정할 수 없습니다)
              </Text>
            )}
          </View>
          <View className="flex-row items-center gap-3">
            <View className="h-[40px] flex-1 justify-center rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-4">
              <Text
                className={
                  selectedInfoPostTitle ? "text-[#2C2C2C]" : "text-[#989898]"
                }
              >
                {selectedInfoPostTitle || "연결된 공고가 없습니다"}
              </Text>
            </View>
            <Pressable
              onPress={() => console.log("TODO: 공고 연결하기 모달 (2단계)")}
              disabled={mode === "edit"}
              className={`h-[40px] justify-center rounded-xl px-4 ${
                mode === "edit"
                  ? "bg-[#C7CDD5]/80"
                  : "bg-[#5E92F0] active:scale-95 transition-transform duration-150 ease-out"
              }`}
            >
              <Text className="text-[14px] font-semibold text-white">
                공고 연결하기
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 팀 연결 */}
        <View className="mb-4">
          <View className="mb-2 flex-row items-center gap-1">
            <Text className="text-[13px] font-bold text-[#B0B0B0]">
              모집글 팀
            </Text>
            {mode === "edit" && (
              <Text className="text-[11px] text-[#9a9a9a]">
                (수정할 수 없습니다)
              </Text>
            )}
          </View>
          <View className="flex-row items-center gap-3">
            <View className="h-[40px] flex-1 justify-center rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-4">
              <Text
                className={form.teamId ? "text-[#2C2C2C]" : "text-[#989898]"}
              >
                {myTeams.find((t) => t.teamId === form.teamId)?.name ??
                  "연결된 팀이 없습니다"}
              </Text>
            </View>
            <Pressable
              onPress={() => setIsTeamModalOpen(true)}
              disabled={mode === "edit"}
              className={`h-[40px] justify-center rounded-xl px-4 ${
                mode === "edit"
                  ? "bg-[#C7CDD5]/80"
                  : "bg-[#5E92F0] transition-transform duration-150 ease-out active:scale-95"
              }`}
            >
              <Text className="text-[14px] font-semibold text-white">
                팀 연결하기
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 카테고리 (팀 연결 시 자동 설정, 표시만) */}
        <View className="mb-4">
          <View className="mb-2 flex-row items-center gap-1">
            <Text className="text-[13px] font-bold text-[#B0B0B0]">
              카테고리
            </Text>
            <Text className="text-[11px] text-[#9A9A9A]">
              (팀 연결 시 자동 설정)
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {(Object.keys(categoryMap) as (keyof typeof categoryMap)[]).map(
              (key) => {
                const isSelected = form.category === key;
                const color = categoryColorMap[key];
                return (
                  <View
                    key={key}
                    style={{
                      backgroundColor: color,
                      borderColor: darkenColor(color, 30),
                      borderWidth: 0.5,
                      opacity: isSelected ? 1 : 0.4,
                    }}
                    className="rounded-3xl px-4 py-3"
                  >
                    <Text
                      style={{ color: darkenColor(color, 140) }}
                      className="text-[14px] font-semibold"
                    >
                      {categoryMap[key]}
                    </Text>
                  </View>
                );
              }
            )}
          </View>
        </View>

        {/* 마감일 */}
        <View className="mb-4">
          <Text className="mb-2 text-[13px] font-bold text-[#B0B0B0]">
            마감일
          </Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            className="h-[40px] justify-center rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-4"
          >
            <Text className={form.endAt ? "text-[#2C2C2C]" : "text-[#989898]"}>
              {form.endAt || "마감일을 선택하세요"}
            </Text>
          </Pressable>
        </View>

        {/* 모집 인원 */}
        <View className="mb-4">
          <Text className="mb-2 text-[13px] font-bold text-[#B0B0B0]">
            모집 인원
          </Text>
          <TextInput
            value={String(form.targetMemberCount)}
            onChangeText={(v) =>
              setForm((p) => ({
                ...p,
                targetMemberCount:
                  v === "" ? "" : Number(v.replace(/[^0-9]/g, "")),
              }))
            }
            keyboardType="number-pad"
            className="h-[40px] rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-4 text-[#2C2C2C]"
          />
        </View>

        {/* 상세요강 */}
        <View>
          <Text className="mb-2 text-[13px] font-bold text-[#B0B0B0]">
            상세요강
          </Text>
          <TextInput
            value={form.description}
            onChangeText={(v) => setForm((p) => ({ ...p, description: v }))}
            multiline
            textAlignVertical="top"
            maxLength={500}
            placeholder="ex. 우대사항, 면접 정보 등"
            placeholderTextColor="#B0B0B0"
            style={{ minHeight: 150 }}
            className="rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-4 py-3.5 text-[#2C2C2C]"
          />
          <Text className="mt-1 text-right text-[11px] text-[#B0B0B0]">
            {form.description.length}/500
          </Text>
        </View>

        <View className="mt-6 flex-row justify-center gap-3">
          {mode === "edit" && onDelete && (
            <Pressable
              onPress={onDelete}
              className="rounded-2xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-8 py-3 transition-transform duration-150 ease-out active:scale-95"
            >
              <Text className="text-[15px] font-semibold text-[#E22222]">
                삭제
              </Text>
            </Pressable>
          )}
          <Pressable
            onPress={async () => {
              if (!validate()) return;
              if (mode === "create") {
                setIsConfirmOpen(true);
              } else {
                await submit();
              }
            }}
            className="rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#5E92F0] px-10 py-3.5 transition-transform duration-150 ease-out active:scale-95"
          >
            <Text className="text-[15px] font-semibold text-white">
              {mode === "create" ? "등록" : "수정"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* 팀 선택 모달 */}
      <Modal
        transparent
        visible={isTeamModalOpen}
        animationType="slide"
        onRequestClose={() => setIsTeamModalOpen(false)}
      >
        <Pressable
          onPress={() => setIsTeamModalOpen(false)}
          className="flex-1 justify-end bg-black/30"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ maxHeight: "70%" }}
            className="rounded-t-2xl bg-white pb-8"
          >
            <View className="flex-row items-center justify-between border-b-[0.5px] border-[#D6DDE5] px-5 py-4">
              <Text className="text-[16px] font-bold text-[#2C2C2C]">
                팀 선택
              </Text>
              <Pressable onPress={() => setIsTeamModalOpen(false)}>
                <Text className="text-[14px] font-semibold text-[#5E92F0]">
                  닫기
                </Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
              {manageableTeams.map((team) => {
                const isSelected = form.teamId === team.teamId;
                return (
                  <Pressable
                    key={team.teamId}
                    onPress={() => {
                      setForm((prev) => ({
                        ...prev,
                        teamId: team.teamId,
                        category: team.category,
                      }));
                      setIsTeamModalOpen(false);
                    }}
                    className={`flex-row items-center justify-between px-5 py-3 ${
                      isSelected ? "bg-[#EEF1F5]" : ""
                    }`}
                  >
                    <View>
                      <Text className="text-[15px] font-semibold text-[#2C2C2C]">
                        {team.name}
                      </Text>
                      <Text className="mt-0.5 text-[12px] text-[#989898]">
                        {categoryMap[team.category]}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        borderWidth: 2,
                        borderColor: isSelected ? "#5E92F0" : "#D6DDE5",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isSelected && (
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "#5E92F0",
                          }}
                        />
                      )}
                    </View>
                  </Pressable>
                );
              })}
              {manageableTeams.length === 0 && (
                <Text className="py-8 text-center text-[13px] text-[#989898]">
                  매니저 이상 권한을 가진 팀이 없습니다
                </Text>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 마감일 선택 */}
      {Platform.OS === "ios" ? (
        <Modal
          transparent
          visible={showDatePicker}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <Pressable
            onPress={() => setShowDatePicker(false)}
            className="flex-1 justify-end bg-black/30"
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              className="rounded-t-2xl bg-white pb-8"
            >
              <View className="flex-row justify-end border-b-[0.5px] border-[#D6DDE5] px-4 py-3">
                <Pressable onPress={() => setShowDatePicker(false)}>
                  <Text className="text-[15px] font-semibold text-[#5E92F0]">
                    완료
                  </Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={form.endAt ? new Date(form.endAt) : new Date()}
                mode="date"
                display="spinner"
                minimumDate={new Date()}
                onChange={handleDateChange}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={form.endAt ? new Date(form.endAt) : new Date()}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={handleDateChange}
          />
        )
      )}

      {/* 생성 확인 모달 */}
      {mode === "create" && (
        <Modal
          transparent
          visible={isConfirmOpen}
          animationType="fade"
          onRequestClose={() => setIsConfirmOpen(false)}
        >
          <Pressable
            onPress={() => setIsConfirmOpen(false)}
            className="flex-1 items-center justify-center bg-black/40 px-6"
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              className="w-full max-w-[340px] rounded-3xl bg-white p-6"
            >
              <Text className="text-center text-[19px] font-bold text-[#2C2C2C]">
                모집글을 생성할까요?
              </Text>
              <View className="mt-4 flex-row gap-3">
                <Pressable
                  onPress={() => setIsConfirmOpen(false)}
                  className="flex-1 rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-3 transition-transform duration-150 ease-out active:scale-95"
                >
                  <Text className="text-center text-[14px] font-semibold text-[#2C2C2C]">
                    취소
                  </Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    setIsConfirmOpen(false);
                    await submit();
                  }}
                  className="flex-1 rounded-xl bg-[#5E92F0] py-3 transition-transform duration-150 ease-out active:scale-95"
                >
                  <Text className="text-center text-[14px] font-semibold text-white">
                    생성
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

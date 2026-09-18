import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X, ChevronLeft, ChevronRight } from "lucide-react-native";
import Checkbox from "@/components/Checkbox";
import {
  SCHEDULE_COLORS,
  type ScheduleColor,
} from "@moimi/core/constants/scheduleColor";
import { getDepartmentName } from "@/utils/user/getDepartmentName";
import ColorPicker from "@/components/calendar/ColorPicker";
import AllDayToggle from "@/components/calendar/AllDayToggle";
import TimeRangeInputs from "@/components/calendar/TimeRangeInputs";

export interface EventVoteCreateRequest {
  title: string;
  description: string;
  participants: number[];
  isAllDay: boolean;
  dates: string[];
  dailyTimeStart: string | null;
  dailyTimeEnd: string | null;
}

interface TeamMember {
  teamMemberId: number;
  userId: number;
  username: string;
  teamRole: string;
  department: string;
  userNickname: string;
}

interface VoteAddModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (request: EventVoteCreateRequest) => void;
  members: TeamMember[];
}

const days = ["일", "월", "화", "수", "목", "금", "토"];

const formatDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function VoteAddModal({
  open,
  onClose,
  onCreate,
  members,
}: VoteAddModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    participants: [] as number[],
    isAllDay: false,
    dates: [] as string[],
    dailyTimeStart: "09:00",
    dailyTimeEnd: "18:00",
    color: SCHEDULE_COLORS[0] as ScheduleColor,
  });

  const resetForm = () => {
    setStep(1);
    setErrorMessage("");
    setIsDatePickerOpen(false);
    setSearch("");
    setForm({
      title: "",
      description: "",
      participants: [],
      isAllDay: false,
      dates: [],
      dailyTimeStart: "09:00",
      dailyTimeEnd: "18:00",
      color: SCHEDULE_COLORS[0] as ScheduleColor,
    });
  };

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 1800);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNext = () => {
    if (!form.title.trim()) {
      showErrorMessage("일정 이름을 입력해주세요");
      return;
    }
    if (form.dates.length === 0) {
      showErrorMessage("투표 날짜를 선택해주세요");
      return;
    }
    if (!form.isAllDay && (!form.dailyTimeStart || !form.dailyTimeEnd)) {
      showErrorMessage("투표 시간을 선택해주세요");
      return;
    }
    setStep(2);
  };

  const allSelected =
    members.length > 0 &&
    members.every((m) => form.participants.includes(m.teamMemberId));

  const handleToggleAll = () => {
    setForm((prev) => ({
      ...prev,
      participants: allSelected ? [] : members.map((m) => m.teamMemberId),
    }));
  };

  const filteredMembers = members.filter((m) =>
    m.username?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleParticipant = (teamMemberId: number) => {
    setForm((prev) => ({
      ...prev,
      participants: prev.participants.includes(teamMemberId)
        ? prev.participants.filter((id) => id !== teamMemberId)
        : [...prev.participants, teamMemberId],
    }));
  };

  const selectedMembers = form.participants
    .map((id) => members.find((m) => m.teamMemberId === id))
    .filter((m): m is TeamMember => Boolean(m));

  const submitCreate = () => {
    onCreate({
      title: form.title,
      description: form.description,
      participants: form.participants,
      isAllDay: form.isAllDay,
      dates: form.dates,
      dailyTimeStart: form.isAllDay ? null : form.dailyTimeStart,
      dailyTimeEnd: form.isAllDay ? null : form.dailyTimeEnd,
    });
    setIsConfirmOpen(false);
    handleClose();
  };

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: lastDate }, (_, i) => i + 1),
  ];
  const minDateKey = formatDateKey(new Date());

  return (
    <Modal
      transparent
      visible={open}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-end"
        >
          <Pressable onPress={handleClose} className="flex-1" />
          <View
            style={{ height: "65%" }}
            className="relative rounded-t-3xl border-[0.5px] border-[#D6DDE5]/60 bg-white px-6 pt-10"
          >
            {errorMessage ? (
              <View
                style={{
                  position: "absolute",
                  top: -150,
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

            {step === 1 ? (
              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 24 }}
              >
                <View className="mb-3 flex-row gap-3">
                  <TextInput
                    value={form.title}
                    onChangeText={(v) => {
                      setForm((p) => ({ ...p, title: v }));
                      setErrorMessage("");
                    }}
                    placeholder="일정을 입력해주세요"
                    placeholderTextColor="#2C2C2C80"
                    className="h-[50px] flex-1 rounded-2xl bg-[#F6F8FA] px-6 text-[16px] font-semibold text-[#2C2C2C]"
                  />

                  <ColorPicker
                    value={form.color}
                    onChange={(color) => {
                      setForm((p) => ({ ...p, color }));
                      setErrorMessage("");
                    }}
                  />
                </View>

                <AllDayToggle
                  checked={form.isAllDay}
                  onChange={(checked) => {
                    setForm((p) => ({ ...p, isAllDay: checked }));
                    setErrorMessage("");
                  }}
                />

                <Pressable
                  onPress={() => setIsDatePickerOpen((prev) => !prev)}
                  className="mb-3  h-[50px] justify-center rounded-2xl bg-[#F6F8FA] px-6"
                >
                  <Text
                    className={`text-[16px] font-semibold ${
                      form.dates.length > 0
                        ? "text-[#2C2C2C]"
                        : "text-[#2C2C2C80]"
                    }`}
                  >
                    {form.dates.length > 0
                      ? `${form.dates.length}개의 날짜 선택됨`
                      : "투표 날짜를 선택해주세요"}
                  </Text>
                </Pressable>

                {isDatePickerOpen && (
                  <View className="mb-3 rounded-2xl border-[0.5px] border-[#D6DDE5] bg-[#F8F9FB] p-3">
                    <View className="mb-2 flex-row items-center justify-between px-2">
                      <Text className="text-[16px] font-bold text-[#2C2C2C]">
                        {year}년 {month + 1}월
                      </Text>
                      <View className="flex-row gap-2">
                        <Pressable
                          onPress={() =>
                            setCalendarDate(new Date(year, month - 1, 1))
                          }
                          className="h-7 w-7 items-center justify-center rounded-full bg-[#EEF1F4]"
                        >
                          <ChevronLeft size={16} color="#2C2C2C66" />
                        </Pressable>
                        <Pressable
                          onPress={() =>
                            setCalendarDate(new Date(year, month + 1, 1))
                          }
                          className="h-7 w-7 items-center justify-center rounded-full bg-[#EEF1F4]"
                        >
                          <ChevronRight size={16} color="#2C2C2C66" />
                        </Pressable>
                      </View>
                    </View>

                    <View className="rounded-2xl bg-white px-2 py-2">
                      <View className="mb-3 flex-row">
                        {days.map((day) => (
                          <Text
                            key={day}
                            style={{ width: `${100 / 7}%` }}
                            className="text-center text-[12px] font-medium text-[#D6DDE5]"
                          >
                            {day}
                          </Text>
                        ))}
                      </View>

                      <View className="flex-row flex-wrap">
                        {cells.map((date, index) => {
                          if (!date) {
                            return (
                              <View
                                key={`empty-${index}`}
                                style={{ width: `${100 / 7}%`, height: 32 }}
                              />
                            );
                          }
                          const cellDate = new Date(year, month, date);
                          const dateKey = formatDateKey(cellDate);
                          const isSelected = form.dates.includes(dateKey);
                          const isDisabled = dateKey < minDateKey;
                          const dow = cellDate.getDay();

                          return (
                            <View
                              key={date}
                              style={{ width: `${100 / 7}%`, height: 32 }}
                              className="items-center justify-center"
                            >
                              <Pressable
                                disabled={isDisabled}
                                onPress={() => {
                                  setForm((prev) => ({
                                    ...prev,
                                    dates: isSelected
                                      ? prev.dates.filter((d) => d !== dateKey)
                                      : [...prev.dates, dateKey],
                                  }));
                                  setErrorMessage("");
                                }}
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 14,
                                  alignItems: "center",
                                  justifyContent: "center",
                                  backgroundColor: isSelected
                                    ? "#5E92F0"
                                    : "transparent",
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 14,
                                    color: isDisabled
                                      ? "#D6DDE5"
                                      : isSelected
                                      ? "#fff"
                                      : dow === 0
                                      ? "#EF4444"
                                      : dow === 6
                                      ? "#3B82F6"
                                      : "#2C2C2C",
                                  }}
                                >
                                  {date}
                                </Text>
                              </Pressable>
                            </View>
                          );
                        })}
                      </View>
                    </View>

                    {form.dates.length > 0 && (
                      <View className="mt-3 flex-row flex-wrap gap-2 border-t-[0.5px] border-[#D6DDE5] px-1 pt-3">
                        {[...form.dates].sort().map((date) => (
                          <Pressable
                            key={date}
                            onPress={() =>
                              setForm((prev) => ({
                                ...prev,
                                dates: prev.dates.filter((d) => d !== date),
                              }))
                            }
                            className="flex-row items-center gap-1 rounded-full bg-[#E8F1FF] py-1 pl-3 pr-2"
                          >
                            <Text className="text-[12px] font-medium text-[#5E92F0]">
                              {date}
                            </Text>
                            <X size={12} color="#5E92F0" />
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {!form.isAllDay && (
                  <TimeRangeInputs
                    startTime={form.dailyTimeStart}
                    endTime={form.dailyTimeEnd}
                    onStartTimeChange={(time) => {
                      setForm((p) => ({ ...p, dailyTimeStart: time }));
                      setErrorMessage("");
                    }}
                    onEndTimeChange={(time) => {
                      setForm((p) => ({ ...p, dailyTimeEnd: time }));
                      setErrorMessage("");
                    }}
                  />
                )}

                <TextInput
                  value={form.description}
                  onChangeText={(v) => {
                    setForm((p) => ({ ...p, description: v }));
                    setErrorMessage("");
                  }}
                  placeholder="설명을 입력해주세요"
                  placeholderTextColor="#2C2C2C80"
                  multiline
                  textAlignVertical="top"
                  style={{ height: 110 }}
                  className="w-full rounded-2xl bg-[#F6F8FA] px-6 py-5 text-[16px] font-semibold text-[#2C2C2C]"
                />

                <View className="mb-4 mt-6 flex-row justify-end">
                  <Pressable
                    onPress={handleNext}
                    className="h-11 items-center justify-center rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#EEF1F5] px-8 active:scale-95"
                  >
                    <Text className="text-[14px] font-semibold text-[#2C2C2C]">
                      다음
                    </Text>
                  </Pressable>
                </View>
              </ScrollView>
            ) : (
              <View className="flex-1">
                <View className="mb-3 h-[50px] flex-row items-center justify-between rounded-2xl bg-[#F6F8FA] px-6">
                  <Text className="text-[15px] font-semibold text-[#2C2C2C]">
                    투표에 참여할 인원을 선택해주세요
                  </Text>
                </View>

                {selectedMembers.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ maxHeight: 40, marginBottom: 12 }}
                    contentContainerStyle={{ gap: 8, alignItems: "center" }}
                  >
                    {selectedMembers.map((m) => (
                      <View
                        key={m.teamMemberId}
                        style={{ height: 36 }}
                        className="flex-row items-center gap-2 rounded-full bg-[#F6F8FA] pr-3.5 pl-4"
                      >
                        <Text className="text-[13px] font-medium text-[#2C2C2C]">
                          {m.userNickname}
                        </Text>
                        <Pressable
                          onPress={() => toggleParticipant(m.teamMemberId)}
                        >
                          <X size={13} color="#989898" className="-mr-2" />
                        </Pressable>
                      </View>
                    ))}
                  </ScrollView>
                )}

                <View className="mb-3 flex-row items-center gap-3">
                  <Checkbox
                    checked={allSelected}
                    onChange={handleToggleAll}
                    label="전체선택"
                    size="sm"
                  />
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="이름 검색"
                    placeholderTextColor="#989898"
                    className="h-10 flex-1 rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-white px-3 text-[14px]"
                  />
                </View>

                <ScrollView
                  className="mb-4 flex-1 rounded-2xl bg-[#F6F8FA]"
                  contentContainerStyle={{ padding: 8 }}
                >
                  {filteredMembers.map((member) => {
                    const checked = form.participants.includes(
                      member.teamMemberId
                    );
                    return (
                      <Pressable
                        key={member.teamMemberId}
                        onPress={() => toggleParticipant(member.teamMemberId)}
                        className="mb-1.5 flex-row items-center gap-3 rounded-xl bg-white px-4 py-3"
                      >
                        <Checkbox
                          checked={checked}
                          onChange={() =>
                            toggleParticipant(member.teamMemberId)
                          }
                        />
                        <Text className="flex-1 text-[14px] font-semibold text-[#2C2C2C]">
                          {member.userNickname}
                        </Text>
                        <Text className="text-[12px] text-[#989898]">
                          {getDepartmentName(member.department)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <View className="mb-12 flex-row justify-between">
                  <Pressable
                    onPress={() => setStep(1)}
                    className="h-11 items-center justify-center rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#EEF1F5] px-8 active:scale-95"
                  >
                    <Text className="text-[14px] font-semibold text-[#2C2C2C]">
                      이전
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setIsConfirmOpen(true)}
                    className="h-11 items-center justify-center rounded-xl bg-[#5E92F0] px-8 active:scale-95"
                  >
                    <Text className="text-[14px] font-semibold text-white">
                      등록
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
        {isConfirmOpen && (
          <Pressable
            onPress={() => setIsConfirmOpen(false)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            className="items-center justify-center bg-black/30 px-6"
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              className="w-full max-w-[340px] rounded-2xl bg-white p-6"
            >
              <Text className="text-center text-[18px] font-semibold text-[#2C2C2C]">
                투표를 등록할까요?
              </Text>
              <Text className="mt-1 text-center text-[13px] text-[#989898]">
                선택한 일정으로 팀 투표가 생성됩니다
              </Text>

              <View className="mt-4 gap-2.5">
                <View className="rounded-xl bg-[#F6F8FA] px-4 py-3">
                  <Text className="mb-1 text-[10px] uppercase text-[#B0B0B0]">
                    제목
                  </Text>
                  <Text className="text-[14px] font-medium text-[#2C2C2C]">
                    {form.title}
                  </Text>
                </View>

                <View className="flex-row gap-2.5">
                  <View className="flex-1 rounded-xl bg-[#F6F8FA] px-4 py-3">
                    <Text className="mb-1 text-[10px] uppercase text-[#B0B0B0]">
                      시간
                    </Text>
                    <Text className="text-[14px] font-medium text-[#2C2C2C]">
                      {form.isAllDay
                        ? "종일"
                        : `${form.dailyTimeStart} - ${form.dailyTimeEnd}`}
                    </Text>
                  </View>
                  <View className="flex-1 rounded-xl bg-[#F6F8FA] px-4 py-3">
                    <Text className="mb-1 text-[10px] uppercase text-[#B0B0B0]">
                      참여자
                    </Text>
                    <Text className="text-[14px] font-medium text-[#2C2C2C]">
                      {form.participants.length}명
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mt-4 flex-row gap-2">
                <Pressable
                  onPress={() => setIsConfirmOpen(false)}
                  className="flex-1 items-center rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#EEF1F5] py-4"
                >
                  <Text className="text-[13px] font-semibold text-[#E22222]">
                    취소
                  </Text>
                </Pressable>
                <Pressable
                  onPress={submitCreate}
                  className="flex-[2] items-center rounded-xl bg-[#5E92F0] py-4"
                >
                  <Text className="text-[13px] font-semibold text-white">
                    등록하기
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        )}
      </View>
    </Modal>
  );
}

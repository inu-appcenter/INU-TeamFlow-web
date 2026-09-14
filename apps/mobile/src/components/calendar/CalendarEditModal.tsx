// components/calendar/CalendarEditModal.tsx
import { useState, useEffect } from "react";
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
import { X, Users, ChevronRight } from "lucide-react-native";
import type { ScheduleColor } from "@moimi/core/constants/scheduleColor";
import type {
  Schedule,
  RecurrenceEditScope,
  EventParticipant,
  RecurrenceFreq,
} from "@moimi/core/types/event";
import type { TeamMemberResponse } from "@moimi/core/types/team";
import Checkbox from "@/components/Checkbox";
import CalendarDatePicker from "./CalendarDatePicker";
import ColorPicker from "./ColorPicker";
import ScheduleTypeToggle from "./ScheduleTypeToggle";
import AllDayToggle from "./AllDayToggle";
import RepeatSettings from "./RepeatSettings";
import TimeRangeInputs from "./TimeRangeInputs";
import { getDepartmentName } from "@/utils/user/getDepartmentName";
import {
  DAY_NUMBER_TO_BY_DAY,
  BY_DAY_TO_DAY_NUMBER,
  type ByDay,
} from "@/utils/date/byDay";
import { createDateTime } from "@/utils/date/createDateTime";
import { formatDateKey } from "@/utils/date/calendar";

type ScheduleType = "NORMAL" | "PERIOD" | "REPEAT";

interface CalendarEditModalProps {
  open: boolean;
  schedule: Schedule | null;
  onClose: () => void;
  onEdit: (schedule: Schedule, scope: RecurrenceEditScope) => void;
  onDelete: (eventId: number, scope: RecurrenceEditScope) => void;
  teamMembers?: TeamMemberResponse[];
}

const defaultColor: ScheduleColor = "SUN";

const getInitialScheduleType = (schedule: Schedule | null): ScheduleType => {
  if (!schedule) return "NORMAL";
  const startDate = schedule.startAt.slice(0, 10);
  const endDate = schedule.endAt.slice(0, 10);
  if (!schedule.isSingle && schedule.recurrence) return "REPEAT";
  if (schedule.isSingle && startDate !== endDate) return "PERIOD";
  return "NORMAL";
};

const getInitialForm = (schedule: Schedule | null) => ({
  title: schedule?.title ?? "",
  description: schedule?.description ?? "",
  startDate: schedule?.startAt.slice(0, 10) ?? "",
  endDate:
    schedule?.recurrence?.untilAt?.slice(0, 10) ??
    schedule?.endAt.slice(0, 10) ??
    "",
  startTime: schedule?.startAt.slice(11, 16) ?? "09:00",
  endTime: schedule?.endAt.slice(11, 16) ?? "10:00",
  color: schedule?.color ?? defaultColor,
  isAllDay: schedule?.isAllDay ?? false,
});

const getInitialRepeatDays = (schedule: Schedule | null) => {
  if (schedule?.occurrenceAt && schedule.occurrenceAt !== schedule.startAt) {
    return [new Date(schedule.startAt.slice(0, 10)).getDay()];
  }
  if (schedule?.recurrence?.byDay) {
    return schedule.recurrence.byDay.map(
      (day) => BY_DAY_TO_DAY_NUMBER[day as ByDay]
    );
  }
  if (schedule?.startAt) {
    return [new Date(schedule.startAt.slice(0, 10)).getDay()];
  }
  return [];
};

const isRecurringSchedule = (schedule: Schedule | null) => {
  return !!schedule && !schedule.isSingle && !!schedule.recurrence;
};

export default function CalendarEditModal({
  open,
  schedule,
  onClose,
  onEdit,
  onDelete,
  teamMembers = [],
}: CalendarEditModalProps) {
  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
  const [scopeAction, setScopeAction] = useState<"save" | "delete" | null>(
    null
  );
  const [selectedParticipants, setSelectedParticipants] = useState<
    EventParticipant[]
  >(schedule?.participants ?? []);
  const [isEditingParticipants, setIsEditingParticipants] = useState(false);
  const [participantSearch, setParticipantSearch] = useState("");

  const [scheduleType, setScheduleType] = useState<ScheduleType>(
    getInitialScheduleType(schedule)
  );
  const [repeatType, setRepeatType] = useState<RecurrenceFreq>(
    schedule?.recurrence?.freq ?? "WEEKLY"
  );
  const [repeatDays, setRepeatDays] = useState<number[]>(
    getInitialRepeatDays(schedule)
  );
  const [form, setForm] = useState(getInitialForm(schedule));

  useEffect(() => {
    if (!open) return;
    setScheduleType(getInitialScheduleType(schedule));
    setRepeatType(schedule?.recurrence?.freq ?? "WEEKLY");
    setRepeatDays(getInitialRepeatDays(schedule));
    setForm(getInitialForm(schedule));
    setSelectedParticipants(schedule?.participants ?? []);
    setIsEditingParticipants(false);
    setParticipantSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule, open]);

  const handleClose = () => {
    setIsScopeModalOpen(false);
    setScopeAction(null);
    setIsEditingParticipants(false);
    onClose();
  };

  const toggleParticipant = (member: TeamMemberResponse) => {
    setSelectedParticipants((prev) =>
      prev.some((p) => p.userId === member.userId)
        ? prev.filter((p) => p.userId !== member.userId)
        : [
            ...prev,
            {
              userId: member.userId,
              teamMemberId: member.teamMemberId,
              name: member.userNickname || member.username,
              teamRole: member.teamRole,
            },
          ]
    );
  };

  const allSelected =
    teamMembers.length > 0 &&
    teamMembers.every((m) =>
      selectedParticipants.some((p) => p.userId === m.userId)
    );

  const handleToggleAllParticipants = (checked: boolean) => {
    setSelectedParticipants(
      checked
        ? teamMembers.map((m) => ({
            userId: m.userId,
            teamMemberId: m.teamMemberId,
            name: m.userNickname || m.username,
            teamRole: m.teamRole,
          }))
        : []
    );
  };

  const filteredMembers = teamMembers.filter((m) =>
    (m.userNickname || m.username)
      ?.toLowerCase()
      .includes(participantSearch.toLowerCase())
  );

  const handleScheduleTypeChange = (type: ScheduleType) => {
    setScheduleType(type);
    setForm((prev) => ({
      ...prev,
      endDate: type === "NORMAL" ? prev.startDate : prev.endDate,
      isAllDay: type === "PERIOD",
    }));
    if (type === "REPEAT" && repeatDays.length === 0) {
      setRepeatDays([new Date(form.startDate).getDay()]);
    }
  };

  const handleRepeatDaysChange = (days: number[]) => {
    setRepeatDays(days);
    if (days.length === 1 && form.startDate) {
      const newDay = days[0];
      const current = new Date(form.startDate);
      const diff = newDay - current.getDay();
      const newDate = new Date(current);
      newDate.setDate(current.getDate() + diff);
      setForm((prev) => ({ ...prev, startDate: formatDateKey(newDate) }));
    }
  };

  const commitSave = (scope: RecurrenceEditScope) => {
    if (!schedule) return;

    const isAllDay = scheduleType === "PERIOD" ? true : form.isAllDay;
    const startAt = isAllDay
      ? createDateTime(form.startDate, "00:00")
      : createDateTime(form.startDate, form.startTime);
    const endAt =
      isAllDay && scheduleType === "PERIOD"
        ? createDateTime(form.endDate, "23:59")
        : isAllDay
        ? createDateTime(form.startDate, "23:59")
        : createDateTime(form.startDate, form.endTime);

    const recurrencePayload =
      scheduleType === "REPEAT" && scope !== "THIS_INSTANCE"
        ? {
            freq: repeatType,
            intervalValue: 1,
            byDay:
              repeatType === "WEEKLY"
                ? repeatDays.map((day) => DAY_NUMBER_TO_BY_DAY[day])
                : null,
            byMonthDay:
              repeatType === "MONTHLY"
                ? Number(form.startDate.slice(8, 10))
                : null,
            seriesStartAt: null,
            untilAt: form.endDate
              ? createDateTime(form.endDate, "23:59")
              : null,
            occurrenceCount: null,
          }
        : null;

    onEdit(
      {
        ...schedule,
        title: form.title,
        description: form.description,
        startAt,
        endAt,
        isAllDay,
        color: form.color,
        isSingle: scheduleType !== "REPEAT",
        recurrence: recurrencePayload,
        participants: selectedParticipants,
      },
      scope
    );

    handleClose();
  };

  const handleSave = () => {
    if (!schedule) return;
    if (isRecurringSchedule(schedule)) {
      setScopeAction("save");
      setIsScopeModalOpen(true);
      return;
    }
    commitSave("THIS_INSTANCE");
  };

  const commitDelete = (scope: RecurrenceEditScope) => {
    if (!schedule) return;
    onDelete(schedule.eventId, scope);
    handleClose();
  };

  const handleDelete = () => {
    if (!schedule) return;
    if (isRecurringSchedule(schedule)) {
      setScopeAction("delete");
      setIsScopeModalOpen(true);
      return;
    }
    commitDelete("THIS_INSTANCE");
  };

  const handleScopeSelect = (scope: RecurrenceEditScope) => {
    setIsScopeModalOpen(false);
    if (scopeAction === "delete") commitDelete(scope);
    else if (scopeAction === "save") commitSave(scope);
    setScopeAction(null);
  };

  if (!schedule) return null;

  return (
    <Modal
      transparent
      visible={open}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end"
      >
        <Pressable onPress={handleClose} className="flex-1" />
        <View
          style={{ height: "65%" }}
          className="relative rounded-t-3xl border-[0.5px] border-[#D6DDE5]/60 bg-white px-6 pt-8"
        >
          {isEditingParticipants ? (
            <View className="flex-1 pt-8">
              <View className="mb-3 h-[55px] justify-center rounded-2xl bg-[#F6F8FA] px-6">
                <Text className="text-[16px] font-semibold text-[#2C2C2C]">
                  참여할 인원을 선택해주세요
                </Text>
              </View>

              {selectedParticipants.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-3"
                  contentContainerStyle={{ gap: 8 }}
                >
                  {selectedParticipants.map((p) => (
                    <View
                      key={p.userId}
                      className="flex-row items-center gap-2 rounded-full bg-[#EEF1F5] px-3 py-2"
                    >
                      <Text className="text-[13px] font-medium text-[#2C2C2C]">
                        {p.name}
                      </Text>
                      <Pressable
                        onPress={() =>
                          setSelectedParticipants((prev) =>
                            prev.filter((sp) => sp.userId !== p.userId)
                          )
                        }
                      >
                        <X size={13} color="#989898" />
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              )}

              <View className="mb-3 flex-row items-center gap-3">
                <Checkbox
                  checked={allSelected}
                  onChange={handleToggleAllParticipants}
                  label="전체선택"
                  size="sm"
                />

                <TextInput
                  value={participantSearch}
                  onChangeText={setParticipantSearch}
                  placeholder="이름 검색"
                  placeholderTextColor="#2C2C2C80"
                  className="h-10 flex-1 rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-white px-3 text-[14px]"
                />
              </View>

              <ScrollView
                className="rounded-2xl bg-[#F6F8FA]"
                style={{ maxHeight: 300 }}
              >
                {filteredMembers.map((member) => {
                  const isSelected = selectedParticipants.some(
                    (p) => p.userId === member.userId
                  );
                  return (
                    <Pressable
                      key={member.teamMemberId}
                      onPress={() => toggleParticipant(member)}
                      className="flex-row items-center gap-4 px-6 py-3"
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleParticipant(member)}
                      />
                      <Text
                        className="flex-1 text-[15px] font-semibold text-[#2C2C2C]"
                        numberOfLines={1}
                      >
                        {member.userNickname || member.username}
                      </Text>
                      <Text
                        className="text-[13px] text-[#989898]"
                        numberOfLines={1}
                      >
                        {getDepartmentName(member.department)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View className="mb-4 mt-6 flex-row justify-end">
                <Pressable
                  onPress={() => setIsEditingParticipants(false)}
                  className="h-10 items-center justify-center rounded-xl bg-[#5E92F0] px-6 active:scale-95"
                >
                  <Text className="text-[14px] font-semibold text-white">
                    완료
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
            >
              <View className="mb-3 flex-row gap-3">
                <TextInput
                  value={form.title}
                  onChangeText={(v) => setForm((p) => ({ ...p, title: v }))}
                  placeholder="일정을 입력해주세요"
                  placeholderTextColor="#2C2C2C80"
                  className="h-[55px] flex-1 rounded-2xl bg-[#F6F8FA] px-6 text-[16px] font-semibold text-[#2C2C2C]"
                />
                <ColorPicker
                  value={form.color}
                  onChange={(color) => setForm((p) => ({ ...p, color }))}
                />
              </View>

              <ScheduleTypeToggle
                value={scheduleType}
                onChange={handleScheduleTypeChange}
                disabled
              />

              {scheduleType !== "PERIOD" && (
                <AllDayToggle
                  checked={form.isAllDay}
                  onChange={(checked) =>
                    setForm((p) => ({ ...p, isAllDay: checked }))
                  }
                />
              )}

              {scheduleType === "REPEAT" && (
                <RepeatSettings
                  repeatType={repeatType}
                  onRepeatTypeChange={setRepeatType}
                  repeatDays={repeatDays}
                  onRepeatDaysChange={handleRepeatDaysChange}
                  includeDailyOption
                />
              )}

              <CalendarDatePicker
                value={form.startDate}
                placeholder={
                  scheduleType === "NORMAL"
                    ? "날짜를 선택해주세요"
                    : "시작 날짜를 선택해주세요"
                }
                onChange={(date) =>
                  setForm((prev) => ({
                    ...prev,
                    startDate: date,
                    ...(scheduleType === "NORMAL" && { endDate: date }),
                  }))
                }
              />

              {scheduleType !== "NORMAL" && (
                <CalendarDatePicker
                  value={form.endDate}
                  placeholder={
                    scheduleType === "PERIOD"
                      ? "마지막 날짜를 선택해주세요"
                      : "반복 종료 날짜를 선택해주세요"
                  }
                  onChange={(date) =>
                    setForm((prev) => ({ ...prev, endDate: date }))
                  }
                />
              )}

              {!form.isAllDay && scheduleType !== "PERIOD" && (
                <TimeRangeInputs
                  startTime={form.startTime}
                  endTime={form.endTime}
                  onStartTimeChange={(time) =>
                    setForm((p) => ({ ...p, startTime: time }))
                  }
                  onEndTimeChange={(time) =>
                    setForm((p) => ({ ...p, endTime: time }))
                  }
                />
              )}

              {schedule.teamId && (
                <Pressable
                  onPress={() => setIsEditingParticipants(true)}
                  className="mb-3 h-[55px] flex-row items-center justify-between rounded-2xl bg-[#F6F8FA] px-6 active:scale-95"
                >
                  <View className="flex-row items-center gap-3">
                    <Users size={17} strokeWidth={2.5} color="#2C2C2C" />
                    <Text className="text-[16px] font-semibold text-[#2C2C2C]">
                      참여자 수정
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Text className="text-[15px] text-[#989898]">
                      {selectedParticipants.length}명
                    </Text>
                    <ChevronRight size={20} color="#2C2C2C" />
                  </View>
                </Pressable>
              )}

              <TextInput
                value={form.description}
                onChangeText={(v) => setForm((p) => ({ ...p, description: v }))}
                placeholder="설명을 입력해주세요"
                placeholderTextColor="#2C2C2C80"
                multiline
                textAlignVertical="top"
                style={{ height: 110 }}
                className="w-full rounded-2xl bg-[#F6F8FA] px-6 py-5 text-[16px] font-semibold text-[#2C2C2C]"
              />

              <View className="mb-4 mt-6 flex-row justify-between">
                <Pressable
                  onPress={handleDelete}
                  className="h-11 items-center justify-center rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#EEF1F5] px-8 active:scale-95"
                >
                  <Text className="text-[14px] font-semibold text-[#E22222]">
                    삭제
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleSave}
                  className="h-11 items-center justify-center rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#EEF1F5] px-8 active:scale-95"
                >
                  <Text className="text-[14px] font-semibold text-[#2C2C2C]">
                    저장
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          )}
        </View>

        {isScopeModalOpen && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 100,
            }}
            className="items-center justify-center bg-black/40 px-6"
          >
            <Pressable
              onPress={() => {
                setIsScopeModalOpen(false);
                setScopeAction(null);
              }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
            <View className="w-full max-w-[360px] rounded-2xl bg-white p-6">
              <Text className="text-center text-[15px] font-medium text-[#989898]">
                어떤 범위로 {scopeAction === "delete" ? "삭제" : "수정"}할까요?
              </Text>
              <View className="mt-4 gap-2.5">
                <Pressable
                  onPress={() => handleScopeSelect("THIS_INSTANCE")}
                  className="items-center rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] py-3.5 active:scale-95"
                >
                  <Text className="text-[15px] font-semibold text-[#2C2C2C]">
                    이 일정만
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleScopeSelect("THIS_AND_FOLLOWING")}
                  className="items-center rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] py-3.5 active:scale-95"
                >
                  <Text className="text-[15px] font-semibold text-[#2C2C2C]">
                    이 일정부터 이후 일정 모두
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleScopeSelect("ALL_SERIES")}
                  className="items-center rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] py-3.5 active:scale-95"
                >
                  <Text className="text-[15px] font-semibold text-[#2C2C2C]">
                    전체 반복 일정
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

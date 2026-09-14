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
import {
  SCHEDULE_COLORS,
  type ScheduleColor,
} from "@moimi/core/constants/scheduleColor";
import type {
  Recurrence,
  RecurrenceFreq,
  MyEventCreateRequest,
} from "@moimi/core/types/event";
import { formatDateKey } from "@/utils/date/calendar";
import { createDateTime } from "@/utils/date/createDateTime";
import ColorPicker from "./ColorPicker";
import ScheduleTypeToggle from "./ScheduleTypeToggle";
import AllDayToggle from "./AllDayToggle";
import RepeatSettings from "./RepeatSettings";
import TimeRangeInputs from "./TimeRangeInputs";
import CalendarDatePicker from "./CalendarDatePicker";

type ScheduleType = "NORMAL" | "PERIOD" | "REPEAT";

interface CalendarAddModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (request: MyEventCreateRequest) => void;
  selectedDate: Date;
}

const dayMap = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

export default function CalendarAddModal({
  open,
  onClose,
  onAdd,
  selectedDate,
}: CalendarAddModalProps) {
  const [scheduleType, setScheduleType] = useState<ScheduleType>("NORMAL");
  const [errorMessage, setErrorMessage] = useState("");
  const [repeatType, setRepeatType] = useState<RecurrenceFreq>("WEEKLY");
  const [repeatDays, setRepeatDays] = useState<number[]>([
    selectedDate.getDay(),
  ]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: formatDateKey(selectedDate),
    endDate: formatDateKey(selectedDate),
    startTime: "09:00",
    endTime: "10:00",
    color: SCHEDULE_COLORS[0] as ScheduleColor,
    isAllDay: false,
  });

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 1800);
  };

  const resetForm = () => {
    setScheduleType("NORMAL");
    setRepeatType("WEEKLY");
    setRepeatDays([selectedDate.getDay()]);
    setErrorMessage("");
    setForm({
      title: "",
      description: "",
      startDate: formatDateKey(selectedDate),
      endDate: formatDateKey(selectedDate),
      startTime: "09:00",
      endTime: "10:00",
      color: SCHEDULE_COLORS[0] as ScheduleColor,
      isAllDay: false,
    });
  };

  useEffect(() => {
    if (!open) return;
    setForm((prev) => ({
      ...prev,
      startDate: formatDateKey(selectedDate),
      endDate: formatDateKey(selectedDate),
    }));
    setRepeatDays([selectedDate.getDay()]);
  }, [selectedDate, open]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleScheduleTypeChange = (type: ScheduleType) => {
    setErrorMessage("");
    setScheduleType(type);
    setForm((prev) => ({
      ...prev,
      endDate: type === "NORMAL" ? prev.startDate : prev.endDate,
      isAllDay: type === "PERIOD",
    }));
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      showErrorMessage("일정 제목을 입력해주세요");
      return;
    }
    if (!form.startDate) {
      showErrorMessage("날짜를 선택해주세요");
      return;
    }
    if (scheduleType !== "NORMAL" && !form.endDate) {
      showErrorMessage("날짜를 선택해주세요");
      return;
    }
    if (
      scheduleType === "REPEAT" &&
      repeatType === "WEEKLY" &&
      repeatDays.length === 0
    ) {
      showErrorMessage("반복 요일을 선택해주세요");
      return;
    }

    const isAllDay = scheduleType === "PERIOD" ? true : form.isAllDay;
    const startAt = isAllDay
      ? createDateTime(form.startDate, "00:00")
      : createDateTime(form.startDate, form.startTime);
    const endAt = isAllDay
      ? createDateTime(form.endDate, "23:59")
      : createDateTime(
          scheduleType === "NORMAL" ? form.startDate : form.endDate,
          form.endTime
        );

    const requestBody: MyEventCreateRequest = {
      title: form.title,
      description: form.description,
      startAt,
      endAt,
      isAllDay,
      color: form.color,
      recurrence:
        scheduleType === "REPEAT"
          ? {
              freq: repeatType,
              intervalValue: 1,
              byDay:
                repeatType === "WEEKLY"
                  ? repeatDays.map((d) => dayMap[d])
                  : null,
              byMonthDay:
                repeatType === "MONTHLY"
                  ? Number(form.startDate.slice(8, 10))
                  : null,
              seriesStartAt: startAt,
              untilAt: endAt,
              occurrenceCount: null,
            }
          : undefined,
    };

    onAdd(requestBody);
    handleClose();
  };

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
          className="relative rounded-t-3xl border-[0.5px] border-[#D6DDE5]/60 bg-white px-6 pt-10"
        >
          {errorMessage && (
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
          )}

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
                className="h-[55px] flex-1 rounded-2xl bg-[#F6F8FA] px-6 text-[16px] font-semibold text-[#2C2C2C]"
              />

              <ColorPicker
                value={form.color}
                onChange={(color) => {
                  setForm((p) => ({ ...p, color }));
                  setErrorMessage("");
                }}
              />
            </View>

            <ScheduleTypeToggle
              value={scheduleType}
              onChange={handleScheduleTypeChange}
            />

            {scheduleType !== "PERIOD" && (
              <AllDayToggle
                checked={form.isAllDay}
                onChange={(checked) => {
                  setForm((p) => ({ ...p, isAllDay: checked }));
                  setErrorMessage("");
                }}
              />
            )}

            {scheduleType === "REPEAT" && (
              <RepeatSettings
                repeatType={repeatType}
                onRepeatTypeChange={(t) => {
                  setRepeatType(t);
                  setErrorMessage("");
                }}
                repeatDays={repeatDays}
                onRepeatDaysChange={(days) => {
                  setRepeatDays(days);
                  setErrorMessage("");
                }}
              />
            )}

            <CalendarDatePicker
              value={form.startDate}
              placeholder={
                scheduleType === "NORMAL"
                  ? "날짜를 선택해주세요"
                  : "시작 날짜를 선택해주세요"
              }
              rangeStart={
                scheduleType === "PERIOD" ? form.startDate : undefined
              }
              rangeEnd={scheduleType === "PERIOD" ? form.endDate : undefined}
              onChange={(date) => {
                const nextDay = new Date(date).getDay();
                if (scheduleType === "REPEAT") setRepeatDays([nextDay]);
                setForm((prev) => ({
                  ...prev,
                  startDate: date,
                  ...(scheduleType === "NORMAL" && { endDate: date }),
                  ...(scheduleType === "REPEAT" &&
                    !prev.endDate && { endDate: date }),
                }));
                setErrorMessage("");
              }}
            />

            {scheduleType !== "NORMAL" && (
              <CalendarDatePicker
                value={form.endDate}
                placeholder={
                  scheduleType === "PERIOD"
                    ? "마지막 날짜를 선택해주세요"
                    : "종료 날짜를 선택해주세요"
                }
                rangeStart={
                  scheduleType === "PERIOD" ? form.startDate : undefined
                }
                rangeEnd={scheduleType === "PERIOD" ? form.endDate : undefined}
                minDate={form.startDate}
                onChange={(date) => {
                  setForm((prev) => ({ ...prev, endDate: date }));
                  setErrorMessage("");
                }}
              />
            )}

            {!form.isAllDay && scheduleType !== "PERIOD" && (
              <TimeRangeInputs
                startTime={form.startTime}
                endTime={form.endTime}
                onStartTimeChange={(time) => {
                  setForm((p) => ({ ...p, startTime: time }));
                  setErrorMessage("");
                }}
                onEndTimeChange={(time) => {
                  setForm((p) => ({ ...p, endTime: time }));
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
                onPress={handleSave}
                className="h-11 items-center justify-center rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#EEF1F5] px-8 active:scale-95"
              >
                <Text className="text-[14px] font-semibold text-[#2C2C2C]">
                  저장
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

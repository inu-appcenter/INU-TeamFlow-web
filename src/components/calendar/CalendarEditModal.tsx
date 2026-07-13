'use client';

import type { ScheduleColor } from '@/constants/scheduleColor';
import type { Schedule, RecurrenceEditScope } from '@/types/event';
import { X } from 'lucide-react';
import { useState } from 'react';

import CalendarDatePicker from './CalendarDatePicker';
import ColorPicker from './ColorPicker';
import ScheduleTypeToggle from './ScheduleTypeToggle';
import AllDayToggle from './AllDayToggle';
import RepeatSettings from './RepeatSettings';
import TimeRangeInputs from './TimeRangeInputs';
import {
  DAY_NUMBER_TO_BY_DAY,
  BY_DAY_TO_DAY_NUMBER,
  type ByDay,
} from '@/utils/date/byDay';
import { createDateTime } from '@/utils/date/createDateTime';

type RepeatType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
type ScheduleType = 'NORMAL' | 'PERIOD' | 'REPEAT';

interface CalendarEditModalProps {
  open: boolean;
  schedule: Schedule | null;
  onClose: () => void;
  onEdit: (schedule: Schedule, scope: RecurrenceEditScope) => void;
  onDelete: (eventId: number, scope: RecurrenceEditScope) => void;
}

const defaultColor: ScheduleColor = 'SUN';

const getInitialScheduleType = (schedule: Schedule | null): ScheduleType => {
  if (!schedule) return 'NORMAL';

  const startDate = schedule.startAt.slice(0, 10);
  const endDate = schedule.endAt.slice(0, 10);

  if (!schedule.isSingle && schedule.recurrence) return 'REPEAT';
  if (schedule.isSingle && startDate !== endDate) return 'PERIOD';

  return 'NORMAL';
};

const getInitialForm = (schedule: Schedule | null) => ({
  title: schedule?.title ?? '',
  description: schedule?.description ?? '',
  startDate: schedule?.startAt.slice(0, 10) ?? '',
  endDate:
    schedule?.recurrence?.untilAt?.slice(0, 10) ??
    schedule?.endAt.slice(0, 10) ??
    '',
  startTime: schedule?.startAt.slice(11, 16) ?? '09:00',
  endTime: schedule?.endAt.slice(11, 16) ?? '10:00',
  color: schedule?.color ?? defaultColor,
  isAllDay: schedule?.isAllDay ?? false,
});

const getInitialRepeatDays = (schedule: Schedule | null) => {
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

// 반복 일정인지 여부 (범위 선택 팝업이 필요한지 판단)
const isRecurringSchedule = (schedule: Schedule | null) => {
  return !!schedule && !schedule.isSingle && !!schedule.recurrence;
};

export default function CalendarEditModal({
  open,
  schedule,
  onClose,
  onEdit,
  onDelete,
}: CalendarEditModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // 반복 일정 수정/삭제 시 범위(이 일정만 / 이후 전체 / 전체) 선택 팝업
  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
  const [scopeAction, setScopeAction] = useState<'save' | 'delete' | null>(
    null
  );

  const [scheduleType, setScheduleType] = useState<ScheduleType>(
    getInitialScheduleType(schedule)
  );

  const [repeatType, setRepeatType] = useState<RepeatType>(
    schedule?.recurrence?.freq ?? 'WEEKLY'
  );

  const [repeatDays, setRepeatDays] = useState<number[]>(
    getInitialRepeatDays(schedule)
  );

  const [form, setForm] = useState(getInitialForm(schedule));

  const handleClose = () => {
    setIsClosing(true);

    setTimeout(() => {
      setIsClosing(false);
      setIsDeleteConfirmOpen(false);
      setIsScopeModalOpen(false);
      setScopeAction(null);
      onClose();
    }, 250);
  };

  const handleScheduleTypeChange = (type: ScheduleType) => {
    setScheduleType(type);

    setForm((prev) => ({
      ...prev,
      endDate: type === 'NORMAL' ? prev.startDate : prev.endDate,
      isAllDay: type === 'PERIOD' ? true : false,
    }));

    if (type === 'REPEAT' && repeatDays.length === 0) {
      setRepeatDays([new Date(form.startDate).getDay()]);
    }
  };

  // 실제 저장 처리 (스코프 확정 후 호출)
  const commitSave = (scope: RecurrenceEditScope) => {
    if (!schedule) return;

    const isAllDay = scheduleType === 'PERIOD' ? true : form.isAllDay;

    const startAt = isAllDay
      ? createDateTime(form.startDate, '00:00')
      : createDateTime(form.startDate, form.startTime);

    const endAt =
      isAllDay && scheduleType === 'PERIOD'
        ? createDateTime(form.endDate, '23:59')
        : isAllDay
          ? createDateTime(form.startDate, '23:59')
          : createDateTime(form.startDate, form.endTime);

    // THIS_INSTANCE는 반복 패턴을 바꾸는 요청이 아니므로 recurrence를 보내지 않음
    const recurrencePayload =
      scheduleType === 'REPEAT' && scope !== 'THIS_INSTANCE'
        ? {
            freq: repeatType,
            intervalValue: 1,
            byDay:
              repeatType === 'WEEKLY'
                ? repeatDays.map((day) => DAY_NUMBER_TO_BY_DAY[day] as string)
                : null,
            byMonthDay:
              repeatType === 'MONTHLY'
                ? Number(form.startDate.slice(8, 10))
                : null,
            seriesStartAt: null,
            untilAt: form.endDate
              ? createDateTime(form.endDate, '23:59')
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
        isSingle: scheduleType !== 'REPEAT',
        recurrence: recurrencePayload,
      },
      scope
    );

    handleClose();
  };

  // 저장 버튼: 반복 일정이면 범위 선택 팝업, 아니면 바로 저장
  const handleSave = () => {
    if (!schedule) return;

    if (isRecurringSchedule(schedule)) {
      setScopeAction('save');
      setIsScopeModalOpen(true);
      return;
    }

    commitSave('THIS_INSTANCE');
  };

  // 실제 삭제 처리 (스코프 확정 후 호출)
  const commitDelete = (scope: RecurrenceEditScope) => {
    if (!schedule) return;

    onDelete(schedule.eventId, scope);
    setIsDeleteConfirmOpen(false);
    handleClose();
  };

  // 삭제 확인 팝업에서 최종 확인 시: 반복 일정이면 범위 선택 팝업, 아니면 바로 삭제
  const handleDelete = () => {
    if (!schedule) return;

    if (isRecurringSchedule(schedule)) {
      setIsDeleteConfirmOpen(false);
      setScopeAction('delete');
      setIsScopeModalOpen(true);
      return;
    }

    commitDelete('THIS_INSTANCE');
  };

  const handleScopeSelect = (scope: RecurrenceEditScope) => {
    setIsScopeModalOpen(false);

    if (scopeAction === 'delete') {
      commitDelete(scope);
    } else if (scopeAction === 'save') {
      commitSave(scope);
    }

    setScopeAction(null);
  };

  if (!open || !schedule) return null;

  return (
    <div
      key={schedule.eventId}
      onClick={handleClose}
      className={`fixed inset-0 z-[300] flex items-end justify-center bg-black/10 transition-opacity duration-[250ms] ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative flex h-[80vh] w-full max-w-[700px] flex-col overflow-hidden rounded-t-3xl border-[0.5px] border-[#D6DDE5] bg-white px-10 pt-16 ${
          isClosing ? 'animate-slide-down' : 'animate-slide-up'
        }`}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-6 left-6 text-[#989898]"
        >
          <X size={24} />
        </button>

        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-2">
          <div className="mb-3 flex gap-3">
            <input
              type="text"
              placeholder="일정을 입력해주세요"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="h-[55px] flex-1 rounded-2xl bg-[#F6F8FA] px-6 text-[16px] font-semibold text-[#2C2C2C] transition-all duration-200 outline-none placeholder:font-medium placeholder:text-[#2C2C2C]/50 active:scale-95"
            />

            <ColorPicker
              value={form.color}
              onChange={(color) => setForm((prev) => ({ ...prev, color }))}
            />
          </div>

          <ScheduleTypeToggle
            value={scheduleType}
            onChange={handleScheduleTypeChange}
            disabled
          />
          {scheduleType !== 'PERIOD' && (
            <AllDayToggle
              checked={form.isAllDay}
              onChange={(checked) =>
                setForm((prev) => ({ ...prev, isAllDay: checked }))
              }
            />
          )}

          {scheduleType === 'REPEAT' && (
            <RepeatSettings
              repeatType={repeatType}
              onRepeatTypeChange={setRepeatType}
              repeatDays={repeatDays}
              onRepeatDaysChange={setRepeatDays}
              includeDailyOption
            />
          )}

          <CalendarDatePicker
            value={form.startDate}
            placeholder={
              scheduleType === 'NORMAL'
                ? '날짜를 선택해주세요'
                : '시작 날짜를 선택해주세요'
            }
            onChange={(date) =>
              setForm((prev) => ({
                ...prev,
                startDate: date,
                ...(scheduleType === 'NORMAL' && {
                  endDate: date,
                }),
              }))
            }
          />

          {scheduleType !== 'NORMAL' && (
            <CalendarDatePicker
              value={form.endDate}
              placeholder={
                scheduleType === 'PERIOD'
                  ? '마지막 날짜를 선택해주세요'
                  : '반복 종료 날짜를 선택해주세요'
              }
              onChange={(date) =>
                setForm((prev) => ({
                  ...prev,
                  endDate: date,
                }))
              }
            />
          )}

          {!form.isAllDay && scheduleType !== 'PERIOD' && (
            <TimeRangeInputs
              startTime={form.startTime}
              endTime={form.endTime}
              onStartTimeChange={(time) =>
                setForm((prev) => ({ ...prev, startTime: time }))
              }
              onEndTimeChange={(time) =>
                setForm((prev) => ({ ...prev, endTime: time }))
              }
            />
          )}

          <textarea
            placeholder="설명을 입력해주세요"
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className="h-[110px] w-full resize-none rounded-2xl bg-[#F6F8FA] px-6 py-4 text-[16px] font-semibold text-[#2C2C2C] outline-none placeholder:font-medium placeholder:text-[#2C2C2C]/50"
          />

          <div className="mt-16 mb-10 flex shrink-0 items-center justify-between">
            <button
              type="button"
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="h-10 rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#EEF1F5] px-6 font-semibold text-[#E22222] transition-all duration-150 hover:bg-[#E3E7EC] active:scale-95"
            >
              삭제
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="h-10 rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#EEF1F5] px-6 font-semibold text-[#2C2C2C] transition-all duration-150 hover:bg-[#E3E7EC] active:scale-95"
            >
              저장
            </button>
          </div>
        </div>

        {isDeleteConfirmOpen && (
          <div
            onClick={() => setIsDeleteConfirmOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="animate-modal-pop w-[360px] rounded-3xl bg-white p-6 shadow-xl"
            >
              <h3 className="text-center text-xl font-bold text-[#2C2C2C]">
                일정을 삭제할까요?
              </h3>

              <p className="mt-1 text-center text-[15px] text-[#989898]">
                삭제한 일정은 다시 복구할 수 없어요
              </p>

              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 cursor-pointer rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-2 font-semibold text-[#2C2C2C] transition-all duration-200 active:scale-95"
                >
                  취소
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 cursor-pointer rounded-xl bg-[#E22222] py-3 font-semibold text-white transition-all duration-200 active:scale-95"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}

        {isScopeModalOpen && (
          <div
            onClick={() => {
              setIsScopeModalOpen(false);
              setScopeAction(null);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="animate-modal-pop w-[360px] rounded-2xl bg-white p-6 shadow-xl"
            >
              <p className="text-center text-base font-medium text-[#989898]">
                어떤 범위로 {scopeAction === 'delete' ? '삭제' : '수정'}할까요?
              </p>

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => handleScopeSelect('THIS_INSTANCE')}
                  className="w-full rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] py-3 font-semibold text-[#2C2C2C] transition-all duration-200 hover:bg-[#EEF1F5] active:scale-95"
                >
                  이 일정만
                </button>

                <button
                  type="button"
                  onClick={() => handleScopeSelect('THIS_AND_FOLLOWING')}
                  className="w-full rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] py-3 font-semibold text-[#2C2C2C] transition-all duration-200 hover:bg-[#EEF1F5] active:scale-95"
                >
                  이 일정부터 이후 일정 모두
                </button>

                <button
                  type="button"
                  onClick={() => handleScopeSelect('ALL_SERIES')}
                  className="w-full rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] py-3 font-semibold text-[#2c2c2c] transition-all duration-200 hover:bg-[#EEF1F5] active:scale-95"
                >
                  전체 반복 일정
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

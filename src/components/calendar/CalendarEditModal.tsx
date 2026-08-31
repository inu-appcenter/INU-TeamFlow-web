'use client';

import type { ScheduleColor } from '@/constants/scheduleColor';
import type {
  Schedule,
  RecurrenceEditScope,
  EventParticipant,
} from '@/types/event';
import type { TeamMemberResponse } from '@/types/team';
import { X, Users, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Checkbox from '../common/Checkbox';
import CalendarDatePicker from './CalendarDatePicker';
import ColorPicker from './ColorPicker';
import ScheduleTypeToggle from './ScheduleTypeToggle';
import AllDayToggle from './AllDayToggle';
import RepeatSettings from './RepeatSettings';
import TimeRangeInputs from './TimeRangeInputs';
import { getDepartmentName } from '@/utils/getDepartmentName';
import {
  DAY_NUMBER_TO_BY_DAY,
  BY_DAY_TO_DAY_NUMBER,
  type ByDay,
} from '@/utils/date/byDay';
import { createDateTime } from '@/utils/date/createDateTime';
import { formatDateKey } from '@/utils/date/calendar';

type RepeatType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
type ScheduleType = 'NORMAL' | 'PERIOD' | 'REPEAT';

interface CalendarEditModalProps {
  open: boolean;
  schedule: Schedule | null;
  onClose: () => void;
  onEdit: (schedule: Schedule, scope: RecurrenceEditScope) => void;
  onDelete: (eventId: number, scope: RecurrenceEditScope) => void;
  teamMembers?: TeamMemberResponse[];
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
  // THIS_INSTANCE로 예외 처리된 occurrence는 실제 startAt 요일을 우선 사용
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
  teamMembers = [],
}: CalendarEditModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // 반복 일정 수정/삭제 시 범위(이 일정만 / 이후 전체 / 전체) 선택 팝업
  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
  const [scopeAction, setScopeAction] = useState<'save' | 'delete' | null>(
    null
  );
  const [selectedParticipants, setSelectedParticipants] = useState<
    EventParticipant[]
  >(schedule?.participants ?? []);
  const [isEditingParticipants, setIsEditingParticipants] = useState(false);
  const [participantSearch, setParticipantSearch] = useState('');

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
      setIsEditingParticipants(false);
      onClose();
    }, 250);
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
      endDate: type === 'NORMAL' ? prev.startDate : prev.endDate,
      isAllDay: type === 'PERIOD' ? true : false,
    }));

    if (type === 'REPEAT' && repeatDays.length === 0) {
      setRepeatDays([new Date(form.startDate).getDay()]);
    }
  };

  // 요일 토글 시 단일 occurrence의 날짜도 같은 주의 해당 요일로 이동
  const handleRepeatDaysChange = (days: number[]) => {
    setRepeatDays(days);

    if (days.length === 1 && form.startDate) {
      const newDay = days[0];
      const current = new Date(form.startDate);
      const diff = newDay - current.getDay();

      const newDate = new Date(current);
      newDate.setDate(current.getDate() + diff);

      setForm((prev) => ({
        ...prev,
        startDate: formatDateKey(newDate),
      }));
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
        participants: selectedParticipants,
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

        {isEditingParticipants ? (
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-2">
            <div className="mb-3">
              <div className="flex h-[55px] items-center rounded-2xl bg-[#F6F8FA] px-6">
                <h2 className="text-[16px] font-semibold text-[#2C2C2C]">
                  참여할 인원을 선택해주세요
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-10 gap-3">
              <div className="col-span-6">
                <div className="thin-scrollbar h-[400px] overflow-y-auto rounded-2xl bg-[#F6F8FA] py-4">
                  <div className="mb-3 flex items-center justify-between gap-3 px-6">
                    <Checkbox
                      checked={allSelected}
                      onChange={handleToggleAllParticipants}
                      label="전체선택"
                      size="sm"
                      className="text-sm text-[#989898]"
                    />

                    <input
                      value={participantSearch}
                      onChange={(e) => setParticipantSearch(e.target.value)}
                      placeholder="이름 검색"
                      className="w-[70%] rounded-lg border-[0.5] border-[#D6DDE5]/40 bg-white px-3 py-2 text-sm outline-none"
                    />
                  </div>

                  {filteredMembers.map((member) => (
                    <label
                      key={member.teamMemberId}
                      className="flex cursor-pointer items-center gap-4 rounded-lg px-6 py-2 hover:bg-gray-100"
                    >
                      <Checkbox
                        checked={selectedParticipants.some(
                          (p) => p.userId === member.userId
                        )}
                        size="md"
                        onChange={() => toggleParticipant(member)}
                      />

                      <div className="flex flex-col">
                        <span className="truncate text-base font-semibold text-[#2c2c2c]">
                          {member.userNickname || member.username}
                        </span>
                      </div>

                      <span className="ml-auto truncate pr-2 text-sm text-[#989898]">
                        {getDepartmentName(member.department)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="col-span-4">
                <div className="thin-scrollbar h-[400px] overflow-y-auto rounded-2xl bg-[#F6F8FA] px-6 py-4">
                  <h3 className="mt-2 mb-4 text-base font-semibold text-[#2c2c2c]">
                    선택된 인원 ({selectedParticipants.length})
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    {selectedParticipants.map((p) => (
                      <div
                        key={p.userId}
                        className="flex items-center justify-between rounded-lg bg-white px-3 py-2"
                      >
                        <span className="truncate text-sm font-medium text-[#2c2c2c]">
                          {p.name}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedParticipants((prev) =>
                              prev.filter((sp) => sp.userId !== p.userId)
                            )
                          }
                          className="ml-2 text-[#989898] hover:text-[#2c2c2c]"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 mb-10 flex shrink-0 items-center justify-end">
              <button
                type="button"
                onClick={() => setIsEditingParticipants(false)}
                className="h-10 rounded-xl bg-[#5E92F0] px-6 font-semibold text-white transition-all duration-150 active:scale-95"
              >
                완료
              </button>
            </div>
          </div>
        ) : (
          <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto pb-2">
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
                onRepeatDaysChange={handleRepeatDaysChange}
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

            {schedule.teamId && (
              <button
                type="button"
                onClick={() => setIsEditingParticipants(true)}
                className="mb-3 flex h-[55px] w-full items-center justify-between rounded-2xl bg-[#F6F8FA] px-6 text-left text-[16px] font-semibold text-[#2c2c2c] transition-all duration-200 outline-none active:scale-95"
              >
                <span className="flex items-center gap-3">
                  <Users size={17} strokeWidth={2.5} />
                  참여자 수정
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-[15px] text-[#989898]">
                    {selectedParticipants.length}명
                  </span>
                  <ChevronRight size={22} strokeWidth={2} />
                </span>
              </button>
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

            <div className="mt-6 mb-10 flex shrink-0 items-center justify-between">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="h-10 rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#EEF1F5] px-6 font-semibold text-[#E22222] transition-all duration-150 hover:bg-[#E3E7EC] active:scale-95"
              >
                삭제
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="h-10 rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#EEF1F5] px-6 font-semibold text-[#2C2C2C] transition-all duration-150 hover:bg-[#E3E7EC] active:scale-95"
              >
                저장
              </button>
            </div>
          </div>
        )}

        {isDeleteConfirmOpen && (
          <div
            onClick={() => setIsDeleteConfirmOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="animate-modal-pop w-[360px] rounded-3xl bg-white p-4 shadow-xl"
            >
              <h3 className="text-center text-xl font-bold text-[#2C2C2C]">
                일정을 삭제할까요?
              </h3>

              <p className="mt-2 text-center text-[15px] text-[#989898]">
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
                  className="w-full rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] py-3 font-semibold text-[#2C2C2C] transition-all duration-200 hover:bg-[#EEF1F5] active:scale-95"
                >
                  이 일정만
                </button>

                <button
                  type="button"
                  onClick={() => handleScopeSelect('THIS_AND_FOLLOWING')}
                  className="w-full rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] py-3 font-semibold text-[#2C2C2C] transition-all duration-200 hover:bg-[#EEF1F5] active:scale-95"
                >
                  이 일정부터 이후 일정 모두
                </button>

                <button
                  type="button"
                  onClick={() => handleScopeSelect('ALL_SERIES')}
                  className="w-full rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] py-3 font-semibold text-[#2c2c2c] transition-all duration-200 hover:bg-[#EEF1F5] active:scale-95"
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

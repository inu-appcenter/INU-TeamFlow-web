'use client';

import { scheduleColors, type ScheduleColor } from '@/constants/scheduleColor';
import type { Schedule } from '@/mocks/schedules';
import { Repeat, X } from 'lucide-react';
import { useState } from 'react';

import CalendarDatePicker from './CalendarDatePicker';

type RepeatType = 'WEEKLY' | 'MONTHLY' | 'YEARLY';
type ScheduleType = 'NORMAL' | 'PERIOD' | 'REPEAT';

interface CalendarEditModalProps {
  open: boolean;
  schedule: Schedule | null;
  onClose: () => void;
  onEdit: (schedule: Schedule) => void;
  onDelete: (eventId: number) => void;
}

const days = ['일', '월', '화', '수', '목', '금', '토'];

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
  endDate: schedule?.endAt.slice(0, 10) ?? '',
  startTime: schedule?.startAt.slice(11, 16) ?? '09:00',
  endTime: schedule?.endAt.slice(11, 16) ?? '10:00',
  color: (schedule?.color ?? scheduleColors[0]) as ScheduleColor,
  isAllDay: schedule?.isAllDay ?? false,
});

const getInitialRepeatDays = (schedule: Schedule | null) => {
  if (schedule?.recurrence?.daysOfWeek) {
    return schedule.recurrence.daysOfWeek;
  }

  if (schedule?.startAt) {
    return [new Date(schedule.startAt.slice(0, 10)).getDay()];
  }

  return [];
};

const createDateTime = (date: string, time: string) => {
  return `${date}T${time}`;
};

export default function CalendarEditModal({
  open,
  schedule,
  onClose,
  onEdit,
  onDelete,
}: CalendarEditModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [scheduleType, setScheduleType] = useState<ScheduleType>(
    getInitialScheduleType(schedule)
  );
  const [isColorOpen, setIsColorOpen] = useState(false);

  const [repeatType, setRepeatType] = useState<RepeatType>(
    (schedule?.recurrence?.frequency as RepeatType) ?? 'WEEKLY'
  );
  const [repeatDays, setRepeatDays] = useState<number[]>(
    getInitialRepeatDays(schedule)
  );

  const [form, setForm] = useState(getInitialForm(schedule));

  const handleClose = () => {
    setIsClosing(true);

    setTimeout(() => {
      setIsClosing(false);
      setIsColorOpen(false);
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
  };

  const handleSave = () => {
    if (!schedule) return;

    const isAllDay = scheduleType === 'PERIOD' ? true : form.isAllDay;

    const startAt = isAllDay
      ? createDateTime(form.startDate, '00:00')
      : createDateTime(form.startDate, form.startTime);

    const endAt = isAllDay
      ? createDateTime(form.endDate, '23:59')
      : createDateTime(
          scheduleType === 'NORMAL' ? form.startDate : form.endDate,
          form.endTime
        );

    onEdit({
      ...schedule,
      title: form.title,
      description: form.description,
      startAt,
      endAt,
      isAllDay,
      color: form.color,
      isSingle: scheduleType !== 'REPEAT',
      recurrence:
        scheduleType === 'REPEAT'
          ? {
              frequency: repeatType,
              interval: 1,
              ...(repeatType === 'WEEKLY' && {
                daysOfWeek: repeatDays,
              }),
            }
          : null,
    });

    handleClose();
  };

  const handleDelete = () => {
    if (!schedule) return;

    onDelete(schedule.eventId);
    handleClose();
  };

  if (!open || !schedule) return null;

  return (
    <div
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

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsColorOpen((prev) => !prev)}
                className="flex h-[55px] w-[100px] items-center justify-center gap-2 rounded-2xl bg-[#F6F8FA] text-[16px] font-semibold text-[#2C2C2C] transition-all duration-200 active:scale-90"
              >
                <span
                  className="h-6 w-6 rounded-full"
                  style={{ backgroundColor: form.color }}
                />
                색
              </button>

              {isColorOpen && (
                <div className="absolute top-[62px] right-0 z-20 w-[100px] rounded-2xl border-[0.5px] border-[#D6DDE5] bg-white p-2 shadow-sm">
                  {scheduleColors.map((color) => {
                    const isSelected = form.color === color;

                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            color,
                          }));
                          setIsColorOpen(false);
                        }}
                        className={`flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-[#2C2C2C] transition hover:bg-[#F6F8FA] ${
                          isSelected ? 'bg-[#F6F8FA]' : ''
                        }`}
                      >
                        <span
                          className="h-7 w-full rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mb-5 flex gap-2">
            {(['NORMAL', 'PERIOD', 'REPEAT'] as ScheduleType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleScheduleTypeChange(type)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  scheduleType === type
                    ? 'border-[0.5px] border-[#5E92F0] bg-[#5E92F0] text-white'
                    : 'border-[0.5px] border-[#D6DDE5] bg-[#EEF1F5] text-[#2C2C2C]'
                }`}
              >
                {type === 'NORMAL'
                  ? '일반'
                  : type === 'PERIOD'
                    ? '기간'
                    : '반복'}
              </button>
            ))}
          </div>

          {scheduleType !== 'PERIOD' && (
            <label className="mb-3 flex items-center gap-2">
              <span className="text-[14px] font-medium text-[#2C2C2C]">
                하루종일
              </span>

              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    isAllDay: !prev.isAllDay,
                  }))
                }
                className={`relative h-7 w-12 rounded-full transition-colors duration-300 ease-in-out ${
                  form.isAllDay ? 'bg-[#5E92F0]' : 'bg-[#D6DDE5]'
                }`}
              >
                <span
                  className={`absolute top-1 left-0 h-5 w-5 rounded-full bg-white transition-all duration-300 ease-in-out ${
                    form.isAllDay ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          )}

          {scheduleType === 'REPEAT' && (
            <>
              <div className="mb-3 flex h-[55px] items-center justify-between rounded-2xl bg-[#F6F8FA] px-6 transition-all duration-150 outline-none active:scale-95">
                <span className="flex items-center gap-3 text-[16px] font-semibold text-[#2C2C2C]">
                  <Repeat size={18} /> 반복 유형
                </span>

                <select
                  value={repeatType}
                  onChange={(e) => setRepeatType(e.target.value as RepeatType)}
                  className="bg-transparent text-[16px] font-semibold text-[#2C2C2C] transition-all duration-150 outline-none active:scale-95"
                >
                  <option value="WEEKLY">매주</option>
                  <option value="MONTHLY">매월</option>
                  <option value="YEARLY">매년</option>
                </select>
              </div>

              {repeatType === 'WEEKLY' && (
                <div className="mb-3 flex justify-between gap-2">
                  {days.map((day, index) => {
                    const isSelected = repeatDays.includes(index);

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() =>
                          setRepeatDays((prev) =>
                            prev.includes(index)
                              ? prev.filter((d) => d !== index)
                              : [...prev, index]
                          )
                        }
                        className={`flex h-12 w-12 items-center justify-center rounded-full text-[16px] font-semibold transition-all duration-150 outline-none active:scale-90 sm:h-15 sm:w-15 ${
                          isSelected
                            ? 'bg-[#5E92F0] text-white'
                            : 'bg-[#F6F8FA] text-[#2C2C2C]'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
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
                  : '종료 날짜를 선택해주세요'
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
            <div className="mb-3 flex gap-3">
              <input
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
                className="h-[55px] flex-1 rounded-2xl bg-[#F6F8FA] px-6 text-[16px] font-semibold text-[#2C2C2C] outline-none"
              />

              <input
                type="time"
                value={form.endTime}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    endTime: e.target.value,
                  }))
                }
                className="h-[55px] flex-1 rounded-2xl bg-[#F6F8FA] px-6 text-[16px] font-semibold text-[#2C2C2C] outline-none"
              />
            </div>
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

          <div className="mt-16 flex shrink-0 items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="mb-6 h-10 rounded-2xl border-[0.5px] border-[#D6DDE5] bg-[#EEF1F5] px-6 font-semibold text-[#E22222]"
            >
              삭제
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="mb-6 h-10 rounded-2xl border-[0.5px] border-[#D6DDE5] bg-[#EEF1F5] px-6 font-semibold text-[#2C2C2C]"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

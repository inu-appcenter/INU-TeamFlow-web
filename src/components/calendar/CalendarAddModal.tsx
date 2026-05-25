'use client';

import { scheduleColors, type ScheduleColor } from '@/constants/scheduleColor';
import { Repeat, X } from 'lucide-react';
import { useState } from 'react';

import CalendarDatePicker from './CalendarDatePicker';

type RepeatType = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface CreateEventRequest {
  title: string;
  description: string;

  startAt: string;
  endAt: string;

  isAllDay: boolean;
  color: string;

  recurrence: {
    freq: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    intervalValue: number;
    byDay?: ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN')[];
    byMonthDay?: number;
    seriesStartAt?: string | null;
    untilAt?: string | null;
    occurrenceCount?: number | null;
  } | null;
}

interface CalendarAddModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (request: CreateEventRequest) => void;
  selectedDate: Date;
  isEdit?: boolean;
}

type ScheduleType = 'NORMAL' | 'PERIOD' | 'REPEAT';

const days = ['일', '월', '화', '수', '목', '금', '토'];

const dayMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

const createDateTime = (date: string, time: string) => {
  return `${date}T${time}`;
};

export default function CalendarAddModal({
  open,
  onClose,
  onAdd,
  selectedDate,
  isEdit = false,
}: CalendarAddModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [scheduleType, setScheduleType] = useState<ScheduleType>('NORMAL');
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [repeatType, setRepeatType] = useState<RepeatType>('WEEKLY');
  const [repeatDays, setRepeatDays] = useState<number[]>([
    selectedDate.getDay(),
  ]);

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);

    setTimeout(() => {
      setErrorMessage('');
    }, 1800);
  };

  interface ScheduleForm {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    color: ScheduleColor;
    isAllDay: boolean;
  }

  const [form, setForm] = useState<ScheduleForm>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '10:00',
    color: scheduleColors[0],
    isAllDay: false,
  });

  const resetForm = () => {
    setScheduleType('NORMAL');
    setRepeatType('WEEKLY');
    setRepeatDays([selectedDate.getDay()]);
    setIsColorOpen(false);
    setErrorMessage('');

    setForm({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      startTime: '09:00',
      endTime: '10:00',
      color: scheduleColors[0],
      isAllDay: false,
    });
  };

  const handleClose = () => {
    setIsClosing(true);

    setTimeout(() => {
      setIsClosing(false);
      resetForm();
      onClose();
    }, 250);
  };

  const handleScheduleTypeChange = (type: ScheduleType) => {
    setErrorMessage('');
    setScheduleType(type);

    setForm((prev) => ({
      ...prev,
      endDate: type === 'NORMAL' ? prev.startDate : prev.endDate,
      isAllDay: type === 'PERIOD' ? true : false,
    }));
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      showErrorMessage('일정 제목을 입력해주세요');
      return;
    }

    if (!form.startDate) {
      showErrorMessage('날짜를 선택해주세요');
      return;
    }

    if (scheduleType !== 'NORMAL' && !form.endDate) {
      showErrorMessage('날짜를 선택해주세요');
      return;
    }

    if (scheduleType === 'REPEAT' && repeatType === 'WEEKLY') {
      if (repeatDays.length === 0) {
        showErrorMessage('반복 요일을 선택해주세요');
        return;
      }
    }

    setErrorMessage('');

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

    const requestBody: CreateEventRequest = {
      title: form.title,
      description: form.description,
      startAt,
      endAt,
      isAllDay,
      color: form.color,
      recurrence:
        scheduleType === 'REPEAT'
          ? {
              freq: repeatType,
              intervalValue: 1,
              ...(repeatType === 'WEEKLY' && {
                byDay: repeatDays.map((day) => dayMap[day]),
              }),
              ...(repeatType === 'MONTHLY' && {
                byMonthDay: Number(form.startDate.slice(8, 10)),
              }),
              seriesStartAt: startAt,
              untilAt: endAt,
              occurrenceCount: null,
            }
          : null,
    };

    onAdd(requestBody);
    handleClose();
  };

  if (!open) return null;

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
        {errorMessage && (
          <div className="animate-modal-pop absolute top-125 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white transition">
            {errorMessage}
          </div>
        )}

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
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  title: e.target.value,
                }));
                setErrorMessage('');
              }}
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
                          setErrorMessage('');
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
                onClick={() => {
                  setForm((prev) => ({
                    ...prev,
                    isAllDay: !prev.isAllDay,
                  }));
                  setErrorMessage('');
                }}
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
                  onChange={(e) => {
                    setRepeatType(e.target.value as RepeatType);
                    setErrorMessage('');
                  }}
                  className="active:scale-95bg-transparent text-[16px] font-semibold text-[#2C2C2C] transition-all duration-150 outline-none"
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
                        onClick={() => {
                          setRepeatDays((prev) =>
                            prev.includes(index)
                              ? prev.filter((d) => d !== index)
                              : [...prev, index]
                          );
                          setErrorMessage('');
                        }}
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
            rangeStart={scheduleType === 'PERIOD' ? form.startDate : undefined}
            rangeEnd={scheduleType === 'PERIOD' ? form.endDate : undefined}
            onChange={(date) => {
              setForm((prev) => {
                const nextStartDate = new Date(date);
                const nextDay = nextStartDate.getDay();

                if (scheduleType === 'REPEAT') {
                  setRepeatDays([nextDay]);
                }

                return {
                  ...prev,
                  startDate: date,
                  ...(scheduleType === 'NORMAL' && {
                    endDate: date,
                  }),
                  ...(scheduleType === 'REPEAT' &&
                    !prev.endDate && {
                      endDate: date,
                    }),
                };
              });
              setErrorMessage('');
            }}
          />

          {scheduleType !== 'NORMAL' && (
            <CalendarDatePicker
              value={form.endDate}
              placeholder={
                scheduleType === 'PERIOD'
                  ? '마지막 날짜를 선택해주세요'
                  : '종료 날짜를 선택해주세요'
              }
              rangeStart={
                scheduleType === 'PERIOD' ? form.startDate : undefined
              }
              rangeEnd={scheduleType === 'PERIOD' ? form.endDate : undefined}
              minDate={form.startDate}
              onChange={(date) => {
                setForm((prev) => ({
                  ...prev,
                  endDate: date,
                }));
                setErrorMessage('');
              }}
            />
          )}

          {!form.isAllDay && scheduleType !== 'PERIOD' && (
            <div className="mb-3 flex gap-3">
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => {
                  setForm((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }));
                  setErrorMessage('');
                }}
                className="h-[55px] flex-1 rounded-2xl bg-[#F6F8FA] px-6 text-[16px] font-semibold text-[#2C2C2C] outline-none"
              />

              <input
                type="time"
                value={form.endTime}
                onChange={(e) => {
                  setForm((prev) => ({
                    ...prev,
                    endTime: e.target.value,
                  }));
                  setErrorMessage('');
                }}
                className="h-[55px] flex-1 rounded-2xl bg-[#F6F8FA] px-6 text-[16px] font-semibold text-[#2C2C2C] outline-none"
              />
            </div>
          )}

          <textarea
            placeholder="설명을 입력해주세요"
            value={form.description}
            onChange={(e) => {
              setForm((prev) => ({
                ...prev,
                description: e.target.value,
              }));
              setErrorMessage('');
            }}
            className="h-[110px] w-full resize-none rounded-2xl bg-[#F6F8FA] px-6 py-4 text-[16px] font-semibold text-[#2C2C2C] outline-none placeholder:font-medium placeholder:text-[#2C2C2C]/50"
          />

          <div
            className={`mt-16 flex shrink-0 items-center ${
              isEdit ? 'justify-between' : 'justify-end'
            }`}
          >
            {isEdit && (
              <button
                type="button"
                onClick={handleClose}
                className="mb-6 h-10 rounded-2xl border-[0.5px] border-[#D6DDE5] bg-[#EEF1F5] px-6 font-semibold text-[#E22222]"
              >
                삭제
              </button>
            )}

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

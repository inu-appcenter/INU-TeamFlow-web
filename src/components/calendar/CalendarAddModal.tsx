'use client';

import type { Schedule } from '@/mocks/schedules';
import { X } from 'lucide-react';
import { useState } from 'react';
import { Repeat } from 'lucide-react';

import CalendarDatePicker from './CalendarDatePicker';

interface CalendarAddModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (schedule: Schedule) => void;
  selectedDate: Date;
  isEdit?: boolean;
}

type ScheduleType = 'NORMAL' | 'PERIOD' | 'REPEAT';
type RepeatType = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

const days = ['일', '월', '화', '수', '목', '금', '토'];

const formatDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
};

export default function CalendarAddModal({
  open,
  onClose,
  onAdd,
  selectedDate,
  isEdit = false,
}: CalendarAddModalProps) {
  const selectedDateKey = formatDateKey(selectedDate);

  const [isClosing, setIsClosing] = useState(false);
  const [scheduleType, setScheduleType] = useState<ScheduleType>('NORMAL');

  const [repeatType, setRepeatType] = useState<RepeatType>('WEEKLY');
  const [repeatDays, setRepeatDays] = useState<number[]>([
    selectedDate.getDay(),
  ]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    startAt: `${selectedDateKey}T09:00`,
    endAt: `${selectedDateKey}T10:00`,
    color: '#FFF3B0',
    isAllDay: false,
  });

  const handleClose = () => {
    setIsClosing(true);

    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 250);
  };

  const resetForm = () => {
    setScheduleType('NORMAL');
    setRepeatType('WEEKLY');
    setRepeatDays([selectedDate.getDay()]);

    setForm({
      title: '',
      description: '',
      startAt: `${selectedDateKey}T09:00`,
      endAt: `${selectedDateKey}T10:00`,
      color: '#FFF3B0',
      isAllDay: false,
    });
  };

  const handleSave = () => {
    const newItem: Schedule = {
      eventId: Date.now(),
      teamId: 1,
      teamName: '새 팀',

      title: form.title,
      description: form.description,

      occurrenceAt: form.startAt,
      startAt: form.startAt,
      endAt: form.endAt,

      isAllDay: form.isAllDay,
      color: form.color,

      eventKind: scheduleType === 'REPEAT' ? 'RECURRING' : 'SINGLE',
      status: 'PENDING',
      isException: false,
    };

    onAdd(newItem);
    resetForm();
    handleClose();
  };

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-end justify-center bg-black/10 transition-opacity duration-[250ms] ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        className={`relative flex h-[80vh] w-full max-w-[680px] flex-col overflow-hidden rounded-t-3xl border-[0.5px] border-[#D6DDE5] bg-white px-10 pt-16 pb-6 ${
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
              className="h-[55px] flex-1 rounded-2xl bg-[#F6F8FA] px-6 text-[16px] font-semibold text-[#2C2C2C] outline-none placeholder:font-medium placeholder:text-[#2C2C2C]/50"
            />

            <button
              type="button"
              className="h-[55px] w-[100px] shrink-0 rounded-2xl bg-[#F6F8FA] text-[16px] font-semibold text-[#2C2C2C]"
            >
              색
            </button>
          </div>

          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => setScheduleType('NORMAL')}
              className={`rounded-full px-5 py-2 text-base font-semibold transition ${
                scheduleType === 'NORMAL'
                  ? 'border-[0.5px] border-[#5E92F0] bg-[#5E92F0] text-white'
                  : 'border-[0.5px] border-[#D6DDE5] bg-[#EEF1F5] text-[#2C2C2C]'
              }`}
            >
              일반
            </button>

            <button
              type="button"
              onClick={() => setScheduleType('PERIOD')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                scheduleType === 'PERIOD'
                  ? 'border-[0.5px] border-[#5E92F0] bg-[#5E92F0] text-white'
                  : 'border-[0.5px] border-[#D6DDE5] bg-[#EEF1F5] text-[#2C2C2C]'
              }`}
            >
              기간
            </button>

            <button
              type="button"
              onClick={() => setScheduleType('REPEAT')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                scheduleType === 'REPEAT'
                  ? 'border-[0.5px] border-[#5E92F0] bg-[#5E92F0] text-white'
                  : 'border-[0.5px] border-[#D6DDE5] bg-[#EEF1F5] text-[#2C2C2C]'
              }`}
            >
              반복
            </button>
          </div>

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

          {scheduleType === 'REPEAT' && (
            <>
              <div className="mb-3 flex h-[55px] items-center justify-between rounded-2xl bg-[#F6F8FA] px-6">
                <span className="flex items-center gap-3 text-[16px] font-semibold text-[#2C2C2C]">
                  <Repeat size={18} /> 반복 유형
                </span>

                <select
                  value={repeatType}
                  onChange={(e) => setRepeatType(e.target.value as RepeatType)}
                  className="bg-transparent text-[16px] font-semibold text-[#2C2C2C] outline-none"
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
                        className={`flex h-12 w-12 items-center justify-center rounded-full text-[16px] font-semibold transition sm:h-15 sm:w-15 ${
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
            value={form.startAt.slice(0, 10)}
            placeholder={
              scheduleType === 'REPEAT'
                ? '시작 날짜를 선택해주세요'
                : '날짜를 선택해주세요'
            }
            onChange={(date) =>
              setForm((prev) => ({
                ...prev,
                startAt: `${date}T${prev.startAt.slice(11, 16)}`,
                endAt: `${date}T${prev.endAt.slice(11, 16)}`,
              }))
            }
          />

          {scheduleType === 'REPEAT' && (
            <CalendarDatePicker
              value={form.endAt.slice(0, 10)}
              placeholder="종료 날짜를 선택해주세요"
              onChange={(date) =>
                setForm((prev) => ({
                  ...prev,
                  endAt: `${date}T${prev.endAt.slice(11, 16)}`,
                }))
              }
            />
          )}

          {!form.isAllDay && (
            <div className="mb-3 flex gap-3">
              <input
                type="time"
                value={form.startAt.slice(11, 16)}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    startAt: `${prev.startAt.slice(0, 10)}T${e.target.value}`,
                  }))
                }
                className="h-[55px] flex-1 rounded-2xl bg-[#F6F8FA] px-6 text-[16px] font-semibold text-[#2C2C2C] outline-none"
              />

              <input
                type="time"
                value={form.endAt.slice(11, 16)}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    endAt: `${prev.endAt.slice(0, 10)}T${e.target.value}`,
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

          <div
            className={`mt-6 flex shrink-0 items-center ${
              isEdit ? 'justify-between' : 'justify-end'
            }`}
          >
            {isEdit && (
              <button
                type="button"
                onClick={handleClose}
                className="h-10 rounded-2xl border-[0.5px] border-[#D6DDE5] bg-[#EEF1F5] px-6 font-semibold text-[#E22222]"
              >
                삭제
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              className="h-10 rounded-2xl border-[0.5px] border-[#D6DDE5] bg-[#EEF1F5] px-6 font-semibold text-[#2C2C2C]"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

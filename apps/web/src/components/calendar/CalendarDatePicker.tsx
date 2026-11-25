'use client';

import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { DAYS } from '@moimi/core/constants/days';
import { formatDateKey } from '@/utils/date/calendar';

interface CalendarDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;

  rangeStart?: string;
  rangeEnd?: string;

  minDate?: string;
}

// date: 날짜 선택 / month: 연도·월 선택
type PickerMode = 'date' | 'month';

const MONTHS = Array.from({ length: 12 }, (_, i) => i);

export default function CalendarDatePicker({
  value,
  onChange,
  placeholder,
  rangeStart,
  rangeEnd,
  minDate,
}: CalendarDatePickerProps) {
  const initialDate = value ? new Date(value) : new Date();

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<PickerMode>('date');
  const [currentDate, setCurrentDate] = useState(initialDate);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const dates = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: lastDate }, (_, i) => i + 1),
  ];
  const pickerRef = useRef<HTMLDivElement>(null);

  // 닫을 때마다 다음에 열면 날짜 화면부터 보이도록 초기화
  const close = () => {
    setIsOpen(false);
    setMode('date');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setMode('date');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 화살표: 날짜 화면에서는 한 달, 연·월 화면에서는 한 해 이동
  const goPrev = () =>
    setCurrentDate(
      mode === 'date'
        ? new Date(year, month - 1, 1)
        : new Date(year - 1, month, 1)
    );
  const goNext = () =>
    setCurrentDate(
      mode === 'date'
        ? new Date(year, month + 1, 1)
        : new Date(year + 1, month, 1)
    );

  return (
    <div ref={pickerRef} className="relative mb-3">
      <button
        type="button"
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        className={`h-[55px] w-full rounded-2xl bg-[#F6F8FA] px-6 text-left text-[16px] font-semibold transition-all duration-200 outline-none active:scale-95 ${
          value ? 'text-[#2C2C2C]' : 'text-[#2C2C2C]/50'
        }`}
      >
        {value || placeholder}
      </button>

      {isOpen && (
        <div className="absolute top-[60px] left-0 z-[120] w-full rounded-2xl border-[0.5px] border-[#D6DDE5]/60 bg-[#F8F9FB] p-3">
          <div className="mb-2 flex items-center justify-between px-2">
            <button
              type="button"
              onClick={() => setMode(mode === 'date' ? 'month' : 'date')}
              className="flex items-center gap-1 text-[18px] font-bold text-[#2C2C2C] hover:opacity-70"
            >
              {mode === 'date' ? `${year}년 ${month + 1}월` : `${year}년`}
              <ChevronDown
                size={18}
                className={`text-[#2C2C2C]/40 transition-transform duration-200 ${
                  mode === 'month' ? 'rotate-180' : ''
                }`}
              />
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={goPrev}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EEF1F4] text-[#2c2c2c]/40"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                onClick={goNext}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EEF1F4] text-[#2C2C2C]/40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {mode === 'month' ? (
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white px-2 py-3">
              {MONTHS.map((m) => {
                // 그 달의 마지막 날이 minDate보다 앞이면 고를 수 있는 날이 없음
                const lastKeyOfMonth = formatDateKey(new Date(year, m + 1, 0));
                const isDisabled = !!minDate && lastKeyOfMonth < minDate;
                const isCurrent = m === month;

                return (
                  <button
                    key={m}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      setCurrentDate(new Date(year, m, 1));
                      setMode('date');
                    }}
                    className={`h-11 rounded-xl text-[15px] font-semibold transition-all duration-150 active:scale-95 ${
                      isDisabled
                        ? 'cursor-not-allowed text-[#D6DDE5]'
                        : isCurrent
                          ? 'bg-[#5E92F0] text-white'
                          : 'text-[#2C2C2C] hover:bg-[#EEF1F5]'
                    }`}
                  >
                    {m + 1}월
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-white px-2 py-2">
              <div className="mb-4 grid grid-cols-7 text-center text-[13px] font-medium text-[#D6DDE5]">
                {DAYS.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-3 text-center">
                {dates.map((date, index) => {
                  if (!date) return <div key={`empty-${index}`} />;

                  const cellDate = new Date(year, month, date);
                  const dateKey = formatDateKey(cellDate);

                  const today = new Date();

                  const isToday =
                    today.getFullYear() === cellDate.getFullYear() &&
                    today.getMonth() === cellDate.getMonth() &&
                    today.getDate() === cellDate.getDate();

                  const isSunday = cellDate.getDay() === 0;
                  const isSaturday = cellDate.getDay() === 6;

                  const isSelected = value === dateKey;

                  const isInRange =
                    rangeStart &&
                    rangeEnd &&
                    dateKey >= rangeStart &&
                    dateKey <= rangeEnd;
                  const isDisabled = minDate && dateKey < minDate;
                  return (
                    <button
                      key={date}
                      type="button"
                      onClick={() => {
                        if (isDisabled) return;

                        onChange(dateKey);
                        close();
                      }}
                      className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[18px] transition-all duration-150 active:scale-85 ${
                        isDisabled
                          ? 'cursor-not-allowed text-[#D6DDE5]'
                          : isSelected
                            ? 'bg-[#5E92F0] text-white'
                            : isInRange
                              ? 'bg-[#E8F1FF] text-[#5E92F0]'
                              : isToday
                                ? 'bg-[#EEF1F5] text-[#2C2C2C]'
                                : isSunday
                                  ? 'text-red-500'
                                  : isSaturday
                                    ? 'text-blue-500'
                                    : 'text-[#2C2C2C]'
                      }`}
                    >
                      {date}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

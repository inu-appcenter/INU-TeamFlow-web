'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const days = ['일', '월', '화', '수', '목', '금', '토'];

interface CalendarDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;

  rangeStart?: string;
  rangeEnd?: string;

  minDate?: string;
}

const formatDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
};

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={pickerRef} className="relative mb-3">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`h-[55px] w-full rounded-2xl bg-[#F6F8FA] px-6 text-left text-[16px] font-semibold transition-all duration-200 outline-none active:scale-95 ${
          value ? 'text-[#2C2C2C]' : 'text-[#2C2C2C]/50'
        }`}
      >
        {value || placeholder}
      </button>

      {isOpen && (
        <div className="absolute top-[60px] left-0 z-[120] w-full rounded-2xl border-[0.5px] border-[#D6DDE5] bg-[#F8F9FB] p-3">
          <div className="mb-2 flex items-center justify-between px-2">
            <h3 className="text-[18px] font-bold text-[#2C2C2C]">
              {month + 1}월
            </h3>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EEF1F4] text-[#2c2c2c]/40"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EEF1F4] text-[#2C2C2C]/40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white px-2 py-2">
            <div className="mb-4 grid grid-cols-7 text-center text-[13px] font-medium text-[#D6DDE5]">
              {days.map((day) => (
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
                      setIsOpen(false);
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
        </div>
      )}
    </div>
  );
}

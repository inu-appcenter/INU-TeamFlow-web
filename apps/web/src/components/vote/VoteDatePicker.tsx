'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const days = ['일', '월', '화', '수', '목', '금', '토'];

interface VoteDatePickerProps {
  selectedDates: string[];
  onChange: (dates: string[]) => void;

  minDate?: string;
}

const formatDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
};

export default function VoteDatePicker({
  selectedDates,
  onChange,
  minDate,
}: VoteDatePickerProps) {
  const initialDate =
    selectedDates.length > 0 ? new Date(selectedDates[0]) : new Date();

  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(initialDate);
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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const dates = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: lastDate }, (_, i) => i + 1),
  ];

  return (
    <div ref={pickerRef} className="relative mb-3">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`min-h-[55px] w-full rounded-2xl bg-[#F6F8FA] px-6 py-4 text-left text-[16px] font-semibold transition-all duration-200 outline-none active:scale-95 ${
          selectedDates.length > 0 ? 'text-[#2C2C2C]' : 'text-[#2C2C2C]/50'
        }`}
      >
        {selectedDates.length > 0
          ? `${selectedDates.length}개의 날짜 선택됨`
          : '투표 날짜를 선택해주세요'}
      </button>

      {isOpen && (
        <div className="absolute top-[60px] left-0 z-[120] w-full rounded-2xl border-[0.5px] border-[#D6DDE5] bg-[#F8F9FB] p-3">
          <div className="mb-2 flex items-center justify-between px-2">
            <h3 className="text-[18px] font-bold text-[#2C2C2C]">
              {year}년 {month + 1}월
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

                const isSelected = selectedDates.includes(dateKey);

                const isDisabled = minDate !== undefined && dateKey < minDate;

                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => {
                      if (isDisabled) return;

                      if (isSelected) {
                        onChange(selectedDates.filter((d) => d !== dateKey));
                      } else {
                        onChange([...selectedDates, dateKey]);
                      }
                    }}
                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[18px] transition-all duration-150 active:scale-85 ${
                      isDisabled
                        ? 'cursor-not-allowed text-[#D6DDE5]'
                        : isSelected
                          ? 'bg-[#5E92F0] text-white'
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

            {selectedDates.length > 0 && (
              <div className="mt-2 border-t-[0.2px] border-[#D6DDE5] px-2 pt-2">
                <p className="mb-2 text-xs text-[#989898]">선택된 날짜</p>

                <div className="mb-2 flex flex-wrap gap-2">
                  {selectedDates
                    .slice()
                    .sort()
                    .map((date) => (
                      <button
                        key={date}
                        type="button"
                        onClick={() =>
                          onChange(selectedDates.filter((d) => d !== date))
                        }
                        className="flex items-center gap-1 rounded-full bg-[#E8F1FF] py-1 pr-2 pl-3 text-xs font-medium text-[#5E92F0] transition active:scale-95"
                      >
                        <span>{date}</span>
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

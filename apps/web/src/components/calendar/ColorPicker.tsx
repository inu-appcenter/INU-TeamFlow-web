'use client';

import { useRef, useEffect, useState } from 'react';
import {
  SCHEDULE_COLORS,
  EVENT_COLOR_MAP,
  type ScheduleColor,
} from '@moimi/core/constants/scheduleColor';

type ColorPickerProps = {
  value: ScheduleColor;
  onChange: (color: ScheduleColor) => void;
};

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-[55px] w-[100px] items-center justify-center gap-2 rounded-2xl bg-[#F6F8FA] text-[16px] font-semibold text-[#2C2C2C] transition-all duration-200 active:scale-95"
      >
        <span
          className="h-6 w-6 rounded-full"
          style={{ backgroundColor: EVENT_COLOR_MAP[value] }}
        />
        색
      </button>

      {isOpen && (
        <div className="absolute top-[62px] right-0 z-20 w-[100px] rounded-2xl border-[0.5px] border-[#D6DDE5] bg-white p-2">
          {SCHEDULE_COLORS.map((color) => {
            const isSelected = value === color;
            return (
              <button
                key={color}
                type="button"
                onClick={() => {
                  onChange(color);
                  setIsOpen(false);
                }}
                className={`flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-[#2C2C2C] transition hover:bg-[#F6F8FA] ${
                  isSelected ? 'bg-[#F6F8FA]' : ''
                }`}
              >
                <span
                  className="h-7 w-full rounded-full"
                  style={{ backgroundColor: EVENT_COLOR_MAP[color] }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

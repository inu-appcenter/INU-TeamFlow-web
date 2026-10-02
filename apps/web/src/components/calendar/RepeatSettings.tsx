'use client';

import { Repeat } from 'lucide-react';
import { DAYS } from '@moimi/core/constants/days';

type RepeatType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

type RepeatSettingsProps = {
  repeatType: RepeatType;
  onRepeatTypeChange: (type: RepeatType) => void;
  repeatDays: number[];
  onRepeatDaysChange: (days: number[]) => void;
  includeDailyOption?: boolean; // CalendarEditModal만 '매일' 옵션 있음
};

export default function RepeatSettings({
  repeatType,
  onRepeatTypeChange,
  repeatDays,
  onRepeatDaysChange,
  includeDailyOption = false,
}: RepeatSettingsProps) {
  const toggleDay = (index: number) => {
    onRepeatDaysChange(
      repeatDays.includes(index)
        ? repeatDays.filter((d) => d !== index)
        : [...repeatDays, index]
    );
  };

  return (
    <>
      <div className="mb-3 flex h-[55px] items-center justify-between rounded-2xl bg-[#F6F8FA] px-6 transition-all duration-150 outline-none active:scale-95">
        <span className="flex items-center gap-3 text-[16px] font-semibold text-[#2C2C2C]">
          <Repeat size={18} /> 반복 유형
        </span>

        <select
          value={repeatType}
          onChange={(e) => onRepeatTypeChange(e.target.value as RepeatType)}
          className="bg-transparent text-[16px] font-semibold text-[#2C2C2C] transition-all duration-150 outline-none active:scale-95"
        >
          {includeDailyOption && <option value="DAILY">매일</option>}
          <option value="WEEKLY">매주</option>
          <option value="MONTHLY">매월</option>
          <option value="YEARLY">매년</option>
        </select>
      </div>

      {repeatType === 'WEEKLY' && (
        <div className="mb-3 flex justify-between gap-2">
          {DAYS.map((day, index) => {
            const isSelected = repeatDays.includes(index);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(index)}
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
  );
}

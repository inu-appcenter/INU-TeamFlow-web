'use client';

import { useState } from 'react';

type TimeSlot = {
  slotId: number;
  date: string;
  startAt: string;
  endAt: string;
  participantCount: number;
};

type Props = {
  voteId: number;
  voteDates: string[];
  voteHours: number[];
  voteSlots: TimeSlot[];
  isAllDay: boolean;
  isOpened: boolean;
  onSubmit?: (selected: number[]) => void;
};

export default function VoteForm({
  voteId,
  voteDates,
  voteHours,
  voteSlots,
  isAllDay,
  isOpened,
  onSubmit,
}: Props) {
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);

  const toggleSlot = (slotId: number) => {
    setSelectedSlots((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId]
    );
  };

  const getSlot = (date: string, hour: number, minute: string) => {
    if (isAllDay) {
      return voteSlots.find((s) => s.date === date);
    }
    return voteSlots.find(
      (s) =>
        s.date === date &&
        Number(s.startAt.slice(0, 2)) === hour &&
        s.startAt.slice(3, 5) === minute
    );
  };

  const canSubmit = selectedSlots.length > 0 && isOpened;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit?.(selectedSlots);
    console.log('voteId:', voteId);
    console.log({ slotIdList: selectedSlots });
  };

  return (
    <div className="mt-5 overflow-x-auto">
      <div className="min-w-[450px]">
        {/* 헤더 */}
        <div
          className="grid gap-1 text-center text-xs font-semibold text-[#5C5C5C]"
          style={{
            gridTemplateColumns: `34px repeat(${voteDates.length}, minmax(64px, 1fr))`,
          }}
        >
          <div />
          {voteDates.map((date) => (
            <div key={date}>
              {Number(date.slice(5, 7))}월 {Number(date.slice(8, 10))}일
            </div>
          ))}
        </div>

        {/* 바디 */}
        <div
          className="mt-2 grid gap-1"
          style={{
            gridTemplateColumns: `34px repeat(${voteDates.length}, minmax(64px, 1fr))`,
          }}
        >
          {/* 시간 라벨 */}
          <div className="flex flex-col gap-1">
            {voteHours.map((hour) => (
              <div
                key={hour}
                className={`flex items-start justify-end pt-[1px] pr-1 text-xs text-[#B0B0B0] ${
                  isAllDay ? 'h-16' : 'h-[44px]'
                }`}
              >
                {isAllDay ? '종일' : hour}
              </div>
            ))}
          </div>

          {/* 슬롯 */}
          {voteDates.map((date, dateIndex) => (
            <div key={date} className="flex flex-col gap-1">
              {voteHours.map((hour, hourIndex) => {
                const minutes = isAllDay ? ['00'] : ['00', '30'];

                return minutes.map((minute, minuteIndex) => {
                  const slotId =
                    (dateIndex * voteHours.length + hourIndex) *
                      minutes.length +
                    minuteIndex +
                    1;

                  const isSelected = selectedSlots.includes(slotId);

                  return (
                    <button
                      key={slotId}
                      onClick={() => toggleSlot(slotId)}
                      disabled={!isOpened}
                      className={`cursor-pointer rounded-md transition-all duration-150 ease-in-out ${
                        isAllDay ? 'h-16' : 'h-5'
                      } ${isSelected ? 'bg-[#5E92F0]' : 'bg-[#F1F4F8]'} ${
                        isOpened
                          ? 'active:scale-95 active:opacity-80'
                          : 'cursor-not-allowed opacity-40'
                      }`}
                    />
                  );
                });
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="mt-12 flex">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="mx-auto mb-12 cursor-pointer rounded-xl bg-[#5E92F0] px-8 py-2 text-white transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          투표하기 ({selectedSlots.length})
        </button>
      </div>
    </div>
  );
}

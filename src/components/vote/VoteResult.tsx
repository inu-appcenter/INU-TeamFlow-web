'use client';

import { votes } from '@/mocks/votes';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';

interface VoteSlot {
  voteId: number;
  date: string;
  startAt: string;
  endAt: string;
  participantCount: number;
}

interface VoteResultProps {
  title: string;
  voteDates: string[];
  voteHours: number[];
  voteSlots: VoteSlot[];
  isAllDay: boolean;
  onBack: () => void;
  onSubmit: (startAt: string, endAt: string) => void;
}

export default function VoteResult({
  title,
  voteDates,
  voteHours,
  voteSlots,
  isAllDay,
  onBack,
  onSubmit,
}: VoteResultProps) {
  const [selectedStart, setSelectedStart] = useState<{
    date: string;
    hour: number;
  } | null>(null);

  const [selectedEnd, setSelectedEnd] = useState<{
    date: string;
    hour: number;
  } | null>(null);

  const maxParticipantCount = Math.max(
    1,
    ...voteSlots.map((slot) => slot.participantCount)
  );

  const getSlot = (date: string, hour: number | string) => {
    return voteSlots.find((slot) =>
      isAllDay
        ? slot.date === date
        : slot.date === date && Number(slot.startAt.slice(0, 2)) === hour
    );
  };

  const getSlotColor = (participantCount: number) => {
    const ratio = participantCount / maxParticipantCount;

    if (ratio >= 0.8) return 'bg-[#729BEF]/60';
    if (ratio >= 0.5) return 'bg-[#BBD2FF]/70';
    if (ratio > 0) return 'bg-[#DCE8FF]/70';

    return 'bg-[#F1F4F8]';
  };

  const handleSlotClick = (date: string, hour: number) => {
    // 첫 클릭
    if (!selectedStart) {
      setSelectedStart({ date, hour });
      setSelectedEnd(null);
      return;
    }

    // 시작/종료 모두 선택된 상태 -> 새로 시작
    if (selectedStart && selectedEnd) {
      setSelectedStart({ date, hour });
      setSelectedEnd(null);
      return;
    }

    // 다른 날짜 선택 -> 새로 시작
    if (selectedStart.date !== date) {
      setSelectedStart({ date, hour });
      setSelectedEnd(null);
      return;
    }

    // 시작보다 이전 시간 선택 -> 시작 갱신
    if (hour < selectedStart.hour) {
      setSelectedStart({ date, hour });
      return;
    }

    // 종료 선택
    setSelectedEnd({ date, hour });
  };

  const isInSelectedRange = (date: string, hour: number) => {
    if (!selectedStart) return false;

    // 시작만 선택된 상태
    if (!selectedEnd) {
      return selectedStart.date === date && selectedStart.hour === hour;
    }

    // 시작 ~ 종료 구간
    return (
      selectedStart.date === date &&
      hour >= selectedStart.hour &&
      hour <= selectedEnd.hour
    );
  };

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  return (
    <div className="py-6 pr-12 pl-8 sm:py-8 sm:pr-14 sm:pl-10">
      {/* 뒤로가기 */}
      <button
        onClick={onBack}
        className="mb-4 -ml-1 flex items-center gap-1 text-sm font-bold text-[#989898]"
      >
        <ChevronLeft size={17} strokeWidth={2.5} />
        뒤로가기
      </button>

      {/* 제목 */}
      <div className="pb-6">
        <h2 className="text-[24px] font-bold text-[#2C2C2C]">일정 확정</h2>

        <p className="mt-1 text-[18px] font-semibold text-[#989898]">
          일정으로 등록할 날짜와 시간대를 선택해주세요
        </p>
      </div>

      {/* 시간표 */}
      <p className="text-sm font-bold text-[#989898]">날짜 및 시간 선택</p>

      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[450px]">
          {/* 날짜 헤더 */}
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

          {/* 시간표 */}
          <div
            className="mt-2 grid gap-1"
            style={{
              gridTemplateColumns: `34px repeat(${voteDates.length}, minmax(64px, 1fr))`,
            }}
          >
            {/* 시간 */}
            <div className="flex flex-col gap-1">
              {voteHours.map((hour) => (
                <div
                  key={hour}
                  className={`flex items-center justify-end pr-1 text-xs text-[#B0B0B0] ${
                    isAllDay ? 'h-16' : 'h-5'
                  }`}
                >
                  {isAllDay ? '종일' : hour}
                </div>
              ))}
            </div>

            {/* 슬롯 */}
            {voteDates.map((date) => (
              <div key={date} className="flex flex-col gap-1">
                {voteHours.map((hour) => {
                  const slot = getSlot(date, hour);

                  const isSelected = isInSelectedRange(date, hour);

                  return (
                    <button
                      key={`${date}-${hour}`}
                      onClick={() => handleSlotClick(date, hour)}
                      className={`cursor-pointer rounded-md transition-all duration-200 active:scale-95 active:opacity-80 ${
                        isAllDay ? 'h-16' : 'h-5'
                      } ${
                        isSelected
                          ? 'bg-[#5E92F0]'
                          : slot
                            ? getSlotColor(slot.participantCount)
                            : 'bg-[#F1F4F8]'
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 선택된 일정 */}
      <div className="mt-10 border-t border-[#D6DDE5] pt-6">
        <p className="text-sm font-bold text-[#989898]">일정 정보</p>
        <p className="mt-3 text-xl font-bold text-[#2C2C2C]">{title}</p>

        {selectedStart ? (
          <>
            <div className="mt-4 flex items-center gap-4 rounded-2xl bg-[#F6F8FA] p-6">
              <p className="text-lg font-bold text-[#2C2C2C]">
                {Number(selectedStart.date.slice(5, 7))}월{' '}
                {Number(selectedStart.date.slice(8, 10))}일 (
                {
                  ['일', '월', '화', '수', '목', '금', '토'][
                    new Date(selectedStart.date).getDay()
                  ]
                }
                )
              </p>

              <p className="font-semibold text-[#2c2c2c]">
                {isAllDay
                  ? '종일'
                  : selectedEnd
                    ? `${String(selectedStart.hour).padStart(2, '0')}:00 ~ ${String(selectedEnd.hour + 1).padStart(2, '0')}:00`
                    : `${String(selectedStart.hour).padStart(2, '0')}:00 (종료 시간 선택 필요)`}
              </p>
            </div>

            <div className="mt-8 mb-12 flex">
              <button
                disabled={!selectedEnd}
                onClick={() => setIsConfirmModalOpen(true)}
                className={`mx-auto rounded-xl px-8 py-2 font-semibold transition ${
                  selectedEnd
                    ? 'cursor-pointer bg-[#5E92F0] text-white duration-200 active:scale-95'
                    : 'bg-[#EEF1F5] text-[#989898]'
                }`}
              >
                일정 등록하기
              </button>
            </div>
          </>
        ) : (
          <div className="mb-12 flex h-[100px] flex-col items-center justify-center">
            <p className="text-base font-semibold text-[#989898]">
              시작 시간을 선택해주세요
            </p>
          </div>
        )}
      </div>
      {isConfirmModalOpen && selectedStart && selectedEnd && (
        <div
          onClick={() => setIsConfirmModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-modal-pop w-[360px] rounded-3xl bg-white p-6 shadow-xl"
          >
            <h3 className="text-center text-xl font-bold text-[#2C2C2C]">
              일정을 확정하시겠습니까?
            </h3>

            <p className="mt-2 text-center text-sm leading-6 text-[#989898]">
              생성 후에도 일정 수정이 가능해요
            </p>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 cursor-pointer rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-2 font-semibold text-[#2c2c2c] transition-all duration-200 active:scale-95"
              >
                취소
              </button>

              <button
                onClick={() => {
                  onSubmit(
                    `${selectedStart.date}T${String(selectedStart.hour).padStart(2, '0')}:00`,
                    `${selectedEnd.date}T${String(selectedEnd.hour + 1).padStart(2, '0')}:00`
                  );

                  setIsConfirmModalOpen(false);
                }}
                className="flex-1 cursor-pointer rounded-xl bg-[#5E92F0] py-3 font-semibold text-white transition-all duration-200 active:scale-95"
              >
                확정하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import {
  SCHEDULE_COLORS,
  EVENT_COLOR_MAP,
  type ScheduleColor,
} from '@/constants/scheduleColor';
import { useEffect, useState, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { getDepartmentName } from '@/utils/getDepartmentName';
import Checkbox from '../common/Checkbox';
import VoteDatePicker from '@/components/vote/VoteDatePicker';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

export interface EventVoteCreateRequest {
  title: string;
  description: string;
  participants: number[];
  isAllDay: boolean;
  dates: string[];
  dailyTimeStart: string | null;
  dailyTimeEnd: string | null;
}

interface VoteAddModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (request: EventVoteCreateRequest) => void;

  members: TeamMember[];
}

interface TeamMember {
  teamMemberId: number;
  userId: number;
  username: string;
  teamRole: string;
  department: string;
  userNickname: string;
}

interface VoteScheduleForm {
  title: string;
  description: string;
  participants: number[];
  isAllDay: boolean;
  dates: string[];
  dailyTimeStart: string;
  dailyTimeEnd: string;
  color: ScheduleColor;
}

export default function VoteAddModal({
  open,
  onClose,
  onCreate,
  members,
}: VoteAddModalProps) {
  useLockBodyScroll(open);

  const [isClosing, setIsClosing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isColorOpen, setIsColorOpen] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(e.target as Node)
      ) {
        setIsColorOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [form, setForm] = useState<VoteScheduleForm>({
    title: '',
    description: '',
    participants: [],
    isAllDay: false,
    dates: [],
    dailyTimeStart: '09:00',
    dailyTimeEnd: '18:00',
    color: SCHEDULE_COLORS[0],
  });

  if (!open) return null;

  const resetForm = () => {
    setErrorMessage('');
    setStep(1);

    setForm({
      title: '',
      description: '',
      participants: [],
      isAllDay: false,
      dates: [],
      dailyTimeStart: '09:00',
      dailyTimeEnd: '18:00',
      color: SCHEDULE_COLORS[0],
    });
  };

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);

    setTimeout(() => {
      setErrorMessage('');
    }, 1800);
  };

  const handleClose = () => {
    setIsClosing(true);

    setTimeout(() => {
      setIsClosing(false);
      onClose();
      resetForm();
    }, 250);
  };

  const handleNext = () => {
    if (!form.title.trim()) {
      showErrorMessage('일정 이름을 입력해주세요.');
      return;
    }

    if (form.dates.length === 0) {
      showErrorMessage('투표 날짜를 선택해주세요.');
      return;
    }

    if (!form.isAllDay && (!form.dailyTimeStart || !form.dailyTimeEnd)) {
      showErrorMessage('투표 시간을 선택해주세요.');
      return;
    }

    setStep(2);
  };

  const allSelected =
    members.length > 0 &&
    members.every((m) => form.participants.includes(m.teamMemberId));

  const handleToggleAll = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      participants: checked ? members.map((m) => m.teamMemberId) : [],
    }));
  };

  const filteredMembers = members.filter((m) =>
    m.username?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    setIsConfirmOpen(true);
  };
  const submitCreate = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    onCreate({
      title: form.title,
      description: form.description,
      participants: form.participants,
      isAllDay: form.isAllDay,
      dates: form.dates,
      dailyTimeStart: form.isAllDay ? null : form.dailyTimeStart,
      dailyTimeEnd: form.isAllDay ? null : form.dailyTimeEnd,
    });

    handleClose();
  };

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
        {step === 1 && (
          <>
            <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto pb-20">
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

                <div ref={colorPickerRef} className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsColorOpen((prev) => !prev)}
                    className="flex h-[55px] w-[100px] items-center justify-center gap-2 rounded-2xl bg-[#F6F8FA] text-[16px] font-semibold text-[#2C2C2C] transition-all duration-200 active:scale-90"
                  >
                    <span
                      className="h-6 w-6 rounded-full"
                      style={{ backgroundColor: EVENT_COLOR_MAP[form.color] }}
                    />
                    색
                  </button>

                  {isColorOpen && (
                    <div className="absolute top-[62px] right-0 z-20 w-[100px] rounded-2xl border-[0.5px] border-[#D6DDE5] bg-white p-2 shadow-sm">
                      {SCHEDULE_COLORS.map((color) => {
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
                              style={{
                                backgroundColor: EVENT_COLOR_MAP[color],
                              }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <label className="mb-3 flex items-center gap-2">
                <span className="text-[14px] font-medium text-[#2c2c2c]">
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
              <div className="mt-3">
                <VoteDatePicker
                  selectedDates={form.dates}
                  onChange={(dates) => {
                    setForm((prev) => ({
                      ...prev,

                      dates,
                    }));

                    setErrorMessage('');
                  }}
                  minDate={new Date().toISOString().slice(0, 10)}
                />
              </div>

              {!form.isAllDay && (
                <>
                  <div className="mb-3 flex gap-3">
                    <input
                      type="time"
                      value={form.dailyTimeStart}
                      onChange={(e) => {
                        setForm((prev) => ({
                          ...prev,
                          dailyTimeStart: e.target.value,
                        }));
                        setErrorMessage('');
                      }}
                      className="h-[55px] flex-1 rounded-2xl bg-[#F6F8FA] px-6 text-[16px] font-semibold text-[#2C2C2C] outline-none"
                    />

                    <input
                      type="time"
                      value={form.dailyTimeEnd}
                      onChange={(e) => {
                        setForm((prev) => ({
                          ...prev,
                          dailyTimeEnd: e.target.value,
                        }));
                        setErrorMessage('');
                      }}
                      className="h-[55px] flex-1 rounded-2xl bg-[#F6F8FA] px-6 text-[16px] font-semibold text-[#2C2C2C] outline-none"
                    />
                  </div>
                </>
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
            </div>
          </>
        )}

        {step === 2 && (
          <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
            <div className="mb-3">
              <div className="flex h-[55px] items-center justify-between rounded-2xl bg-[#F6F8FA] px-6 py-4">
                <h2 className="text-[16px] font-semibold text-[#2C2C2C]">
                  투표에 참여할 인원을 선택해주세요
                </h2>
                <button className="shrink-0">
                  <ChevronDown />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-10 gap-3">
              <div className="col-span-6">
                <div className="thin-scrollbar h-[400px] overflow-y-auto rounded-2xl bg-[#F6F8FA] py-4">
                  <div className="mb-3 flex items-center justify-between gap-3 px-6">
                    <Checkbox
                      checked={allSelected}
                      onChange={handleToggleAll}
                      label="전체선택"
                      size="sm"
                      className="text-sm text-[#989898]"
                    />

                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="이름 검색"
                      className="w-[70%] rounded-lg border-[0.5] border-[#D6DDE5] bg-white px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  {filteredMembers.map((member) => (
                    <label
                      key={member.teamMemberId}
                      className="flex cursor-pointer items-center gap-4 rounded-lg px-6 py-2 hover:bg-gray-100"
                    >
                      <Checkbox
                        checked={form.participants.includes(
                          member.teamMemberId
                        )}
                        size="md"
                        onChange={(checked) => {
                          setForm((prev) => ({
                            ...prev,
                            participants: checked
                              ? [...prev.participants, member.teamMemberId]
                              : prev.participants.filter(
                                  (id) => id !== member.teamMemberId
                                ),
                          }));
                        }}
                      />

                      <div className="flex flex-col">
                        <span className="truncate text-base font-semibold text-[#2c2c2c]">
                          {member.userNickname}
                        </span>
                      </div>

                      <span className="ml-auto truncate pr-2 text-sm text-[#989898]">
                        {getDepartmentName(member.department)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="col-span-4">
                <div className="thin-scrollbar h-[400px] overflow-y-auto rounded-2xl bg-[#F6F8FA] px-6 py-4">
                  <h3 className="mt-2 mb-4 text-base font-semibold text-[#2c2c2c]">
                    선택된 인원 ({form.participants.length})
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    {members
                      .filter((member) =>
                        form.participants.includes(member.teamMemberId)
                      )
                      .map((member) => (
                        <div
                          key={member.teamMemberId}
                          className="flex items-center justify-between rounded-lg bg-white px-3 py-2"
                        >
                          <span className="truncate text-sm font-medium text-[#2c2c2c]">
                            {member.userNickname}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                participants: prev.participants.filter(
                                  (id) => id !== member.teamMemberId
                                ),
                              }));
                            }}
                            className="ml-2 text-[#989898] hover:text-[#2c2c2c]"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="relative mt-6 flex shrink-0 justify-end">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="absolute left-0 h-10 rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#EEF1F5] px-6 font-semibold text-[#2C2C2C] transition-all duration-200 active:scale-95"
            >
              이전
            </button>
          )}

          {step === 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="mb-16 h-10 rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#EEF1F5] px-6 font-semibold text-[#2C2C2C] transition-all duration-200 active:scale-95"
            >
              다음
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreate}
              className="mb-16 h-10 rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#5E92F0] px-6 font-semibold text-white transition-all duration-200 active:scale-95"
            >
              등록
            </button>
          )}
        </div>
        {errorMessage && (
          <div className="animate-modal-pop absolute top-125 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white transition">
            {errorMessage}
          </div>
        )}
      </div>
      {isConfirmOpen && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-black/30"
          onClick={() => setIsConfirmOpen(false)}
        >
          <div
            className="w-[400px] overflow-hidden rounded-2xl bg-white shadow-[6px_8px_24px_0px_rgba(149,157,165,0.20)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="px-6 pt-6">
              <div className="mb-1 items-center text-center">
                <h2 className="mb-1 text-[20px] font-semibold text-[#2C2C2C]">
                  투표를 등록할까요?
                </h2>
                <p className="mb-4 text-sm text-[#989898]">
                  선택한 일정으로 팀 투표가 생성됩니다
                </p>
              </div>
            </div>

            {/* 내용 */}
            <div className="flex flex-col gap-2.5 px-6">
              {/* 제목 + 색상 */}
              <div className="rounded-xl bg-[#F6F8FA] p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="mb-0.5 text-[12px] text-[#B0B0B0] uppercase">
                      제목
                    </p>
                    <p className="text-[18px] font-medium text-[#2C2C2C]">
                      {form.title}
                    </p>
                  </div>
                </div>
                {form.description && (
                  <p className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-[#666]">
                    {form.description}
                  </p>
                )}
              </div>

              {/* 날짜 */}
              <div className="rounded-xl bg-[#F6F8FA] px-4 py-3.5">
                <p className="mb-2 text-[12px] text-[#B0B0B0] uppercase">
                  날짜
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {form.dates.slice(0, 5).map((date) => (
                    <span
                      key={date}
                      className="rounded-full border-[0.5] border-[#D6DDE5] bg-white px-3 py-1 text-[13px] font-medium text-[#2C2C2C]"
                    >
                      {date}
                    </span>
                  ))}
                  {form.dates.length > 5 && (
                    <span className="rounded-full border border-[#D6E4FF] bg-[#EEF3FF] px-3 py-1 text-xs font-medium text-[#5E92F0]">
                      + 외 {form.dates.length - 5}개
                    </span>
                  )}
                </div>
              </div>

              {/* 시간 + 참여자 */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl bg-[#F6F8FA] px-4 py-3.5">
                  <div className="mb-1 flex items-center gap-1.5">
                    <svg
                      className="h-3 w-3 text-[#B0B0B0]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path strokeLinecap="round" d="M12 6v6l4 2" />
                    </svg>
                    <p className="text-[12px] text-[#B0B0B0] uppercase">시간</p>
                  </div>
                  <p className="text-[18px] font-medium text-[#2C2C2C]">
                    {form.isAllDay
                      ? '종일'
                      : `${form.dailyTimeStart} - ${form.dailyTimeEnd}`}
                  </p>
                </div>
                <div className="rounded-xl bg-[#F6F8FA] px-4 py-3.5">
                  <div className="mb-1 flex items-center gap-1.5">
                    <svg
                      className="h-3 w-3 text-[#B0B0B0]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                      />
                      <circle cx="9" cy="7" r="4" />
                      <path
                        strokeLinecap="round"
                        d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                      />
                    </svg>
                    <p className="text-[12px] text-[#B0B0B0] uppercase">
                      참여자
                    </p>
                  </div>
                  <p className="text-[18px] font-medium text-[#2C2C2C]">
                    {form.participants.length}명
                  </p>
                </div>
              </div>
            </div>

            {/* 버튼 — 모달 안으로 이동 */}
            <div className="flex gap-2 px-6 py-5">
              <button
                className="flex-1 cursor-pointer rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#EEF1F5] py-2.5 text-sm font-semibold text-[#E22222] transition-all duration-200 active:scale-95"
                onClick={() => setIsConfirmOpen(false)}
              >
                취소
              </button>
              <button
                className="flex-[2] cursor-pointer rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#5E92F0] py-2.5 text-sm font-semibold text-white transition-all duration-200 active:scale-95"
                onClick={() => {
                  setIsConfirmOpen(false);
                  submitCreate();
                }}
              >
                등록하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import Card from '@/components/main/Card';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { useMyTeams } from '@/hooks/useTeamQuery';

import { useRouter } from 'next/navigation';

export type RecruitmentFormData = {
  title: string;
  category: 'CONTEST' | 'STUDY' | 'CLUB' | 'PROJECT' | 'ETC';
  description: string;
  announcementId?: number;
  teamId?: number;
  targetMemberCount: number | '';
  endAt: string;
};

type RecruitmentFormProps = {
  mode: 'create' | 'edit';
  initialData?: RecruitmentFormData;
  onSubmit: (data: RecruitmentFormData) => Promise<void>;
  onDelete?: () => void;
};

const categoryMap: Record<string, string> = {
  CONTEST: '공모전',
  STUDY: '스터디',
  PROJECT: '프로젝트',
  CLUB: '동아리',
  ETC: '기타',
};

const categoryColorMap: Record<string, string> = {
  CONTEST: '#FBE4F8',
  STUDY: '#D8FAD8',
  PROJECT: '#DCEBFF',
  CLUB: '#FFF1CC',
  ETC: '#E9E9E9',
};
const categoryBorderColorMap: Record<string, string> = {
  CONTEST: '#E7A8DF',
  STUDY: '#95D695',
  PROJECT: '#9FC4F7',
  CLUB: '#E8C46A',
  ETC: '#BDBDBD',
};
const DEFAULT_COLOR = '#E9E9E9';

export default function TeamForm({
  mode,
  initialData,
  onSubmit,
  onDelete,
}: RecruitmentFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [form, setForm] = useState<RecruitmentFormData>(
    initialData ?? {
      title: '',
      category: 'ETC',
      description: '',
      announcementId: undefined,
      teamId: undefined,
      targetMemberCount: '',
      endAt: '',
    }
  );

  const { data: myTeams = [] } = useMyTeams();
  const showErrorMessage = (message: string) => {
    setErrorMessage(message);

    setTimeout(() => {
      setErrorMessage('');
    }, 1800);
  };

  const onChange = (key: keyof RecruitmentFormData, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const currentColor = categoryColorMap[form.category] ?? DEFAULT_COLOR;
  const [isTeamSelectOpen, setIsTeamSelectOpen] = useState(false);
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 pt-4 sm:px-6 sm:pt-6">
      <section className="mx-auto mt-8 flex min-h-[calc(100vh-48px)] max-w-[800px] flex-col sm:mt-12 sm:min-h-[calc(100vh-72px)]">
        <Card className="relative flex flex-1 flex-col overflow-hidden rounded-b-none p-0">
          {errorMessage && (
            <div className="animate-modal-pop absolute top-32 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
              {errorMessage}
            </div>
          )}

          {/* 헤더 */}
          <div
            className="flex h-[72px] items-center justify-between px-6"
            style={{ backgroundColor: currentColor }}
          >
            <button
              onClick={() => router.back()}
              className="cursor-pointer text-[#2C2C2C]"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
          </div>

          {/* 본문 */}
          <div className="flex-1 overflow-y-auto px-8 py-8 sm:px-10">
            <div className="mx-auto max-w-[600px]">
              {/* 제목 */}
              <div className="py-2">
                <div className="mb-2 flex items-center gap-1">
                  <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
                    제목
                  </span>
                </div>

                <input
                  value={form.title}
                  onChange={(e) => onChange('title', e.target.value)}
                  className="h-[42px] w-full rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-4 focus:ring-2 focus:ring-[#5E92F0] focus:outline-none"
                />
              </div>

              {/* 공고 연결 */}
              <div className="py-2">
                <div className="mb-2 flex items-center gap-1">
                  <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
                    모집글 공고
                  </span>
                </div>

                <div className="flex items-end gap-3">
                  <input
                    readOnly
                    value={form.announcementId ?? ''}
                    placeholder="연결된 공고가 없습니다"
                    onChange={(e) => onChange('announcementId', e.target.value)}
                    className="h-[42px] flex-1 rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-4 focus:ring-0 focus:outline-none"
                  />

                  <button
                    type="button"
                    className="h-[42px] shrink-0 cursor-pointer rounded-xl bg-[#5E92F0] px-4 text-[15px] text-white"
                  >
                    공고 연결하기
                  </button>
                </div>
              </div>

              {/* 팀 연결 */}
              <div className="py-2">
                <div className="mb-2 flex items-center gap-1">
                  <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
                    모집글 팀
                  </span>
                </div>

                <div className="relative flex items-end gap-3">
                  <input
                    readOnly
                    value={
                      myTeams.find((t) => t.teamId === form.teamId)?.name ?? ''
                    }
                    placeholder="연결된 팀이 없습니다"
                    onChange={(e) => onChange('teamId', e.target.value)}
                    className="h-[42px] flex-1 rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-4 focus:ring-0 focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setIsTeamDropdownOpen((prev) => !prev)}
                    className="h-[42px] shrink-0 cursor-pointer rounded-xl bg-[#5E92F0] px-4 text-[15px] text-white"
                  >
                    팀 연결하기
                  </button>
                  {isTeamDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsTeamDropdownOpen(false)}
                      />
                      <div className="absolute top-[50px] right-[-70px] z-20 w-[260px] rounded-2xl border-[0.5px] border-[#D6DDE5] bg-white p-2 shadow-[6px_6px_24px_0px_rgba(149,157,165,0.20)]">
                        <div className="flex max-h-[240px] flex-col overflow-y-auto">
                          {myTeams.map((team) => (
                            <button
                              key={team.teamId}
                              type="button"
                              onClick={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  teamId: team.teamId,
                                  category: team.category,
                                }));
                                setIsTeamDropdownOpen(false);
                              }}
                              className={`flex items-center justify-between rounded-xl px-4 py-2 text-left transition hover:bg-[#F6F8FA] ${
                                form.teamId === team.teamId
                                  ? 'bg-[#EEF1F5]'
                                  : ''
                              }`}
                            >
                              <div>
                                <p className="font-semibold text-[#2C2C2C]">
                                  {team.name}
                                </p>
                                <p className="text-xs text-[#989898]">
                                  {categoryMap[team.category]} ·{' '}
                                  {team.description}
                                </p>
                              </div>
                              <div
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                                  form.teamId === team.teamId
                                    ? 'border-[#5E92F0]'
                                    : 'border-[#D6DDE5]'
                                }`}
                              >
                                {form.teamId === team.teamId && (
                                  <div className="h-2 w-2 rounded-full bg-[#5E92F0]" />
                                )}
                              </div>
                            </button>
                          ))}

                          {myTeams.length === 0 && (
                            <p className="py-4 text-center text-sm text-[#989898]">
                              소속된 팀이 없습니다
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 카테고리 */}
              <div className="py-2">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-sm font-bold tracking-wide text-[#B0B0B0]">
                    카테고리
                  </span>

                  <span className="text-xs text-[#9A9A9A]">
                    (팀 연결 시 자동 설정)
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {Object.keys(categoryMap).map((key) => {
                    const typedKey = key as keyof typeof categoryMap;
                    const isSelected = form.category === typedKey;

                    return (
                      <button
                        key={key}
                        type="button"
                        disabled
                        className={`rounded-2xl border-[0.5px] px-4 py-2 text-sm transition-all ${
                          isSelected
                            ? 'font-semibold opacity-100'
                            : 'opacity-40'
                        }`}
                        style={{
                          backgroundColor: categoryColorMap[typedKey],
                          borderColor: categoryBorderColorMap[typedKey],
                          cursor: 'not-allowed',
                        }}
                      >
                        {categoryMap[typedKey]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 마감일 */}
              <div className="py-2">
                <div className="mb-2 flex items-center gap-1">
                  <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
                    마감일
                  </span>
                </div>

                <input
                  type="date"
                  value={form.endAt}
                  onChange={(e) => onChange('endAt', e.target.value)}
                  className="h-[42px] w-full rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-4 focus:ring-2 focus:ring-[#5E92F0] focus:outline-none"
                />
              </div>

              {/* 모집 인원 */}
              <div className="py-2">
                <div className="mb-2 flex items-center gap-1">
                  <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
                    모집 인원
                  </span>
                </div>

                <input
                  type="number"
                  value={form.targetMemberCount}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      targetMemberCount:
                        e.target.value === '' ? '' : Number(e.target.value),
                    }))
                  }
                  className="h-[42px] w-full rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-4 focus:ring-2 focus:ring-[#5E92F0] focus:outline-none"
                />
              </div>

              {/* 상세요강 */}
              <div className="py-2">
                <div className="mb-2 flex items-center gap-1">
                  <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
                    상세요강
                  </span>
                </div>

                <textarea
                  value={form.description}
                  onChange={(e) => onChange('description', e.target.value)}
                  maxLength={500}
                  className="min-h-[150px] w-full resize-none rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-4 py-3 focus:ring-2 focus:ring-[#5E92F0] focus:outline-none"
                  placeholder="ex. 우대사항, 면접 정보 등"
                />

                <div className="mt-1 text-right text-xs text-[#B0B0B0]">
                  {form.description.length}/500
                </div>
              </div>

              <div className="mb-8 flex justify-center gap-2">
                {mode === 'edit' && onDelete && (
                  <button
                    onClick={onDelete}
                    className="cursor-pointer rounded-2xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-8 py-2 font-semibold text-[#E22222]"
                  >
                    삭제
                  </button>
                )}

                <button
                  onClick={async () => {
                    if (!form.title.trim()) {
                      showErrorMessage('모집글 제목을 입력해주세요');
                      return;
                    }

                    if (!form.description.trim()) {
                      showErrorMessage('상세요강을 입력해주세요');
                      return;
                    }

                    if (!form.endAt) {
                      showErrorMessage('모집 마감일을 입력해주세요');
                      return;
                    }

                    if (!form.targetMemberCount) {
                      showErrorMessage('모집 인원을 입력해주세요');
                      return;
                    }

                    if (!form.teamId) {
                      showErrorMessage('연결할 팀을 선택해주세요');
                      return;
                    }

                    if (mode === 'create') {
                      setIsConfirmOpen(true);
                    } else {
                      await onSubmit({
                        ...form,
                        endAt: new Date(`${form.endAt}T00:00:00`).toISOString(),
                      });
                    }
                  }}
                  className="cursor-pointer rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#5E92F0] px-8 py-2 font-semibold text-white transition hover:bg-[#5C86EB]"
                >
                  {mode === 'create' ? '등록' : '수정'}
                </button>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {mode === 'create' && isConfirmOpen && (
        <div
          onClick={() => setIsConfirmOpen(false)}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-modal-pop w-[360px] rounded-3xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-center text-xl font-bold">
              모집글을 생성할까요?
            </h2>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-2 font-semibold"
              >
                취소
              </button>

              <button
                onClick={async () => {
                  setIsConfirmOpen(false);
                  await onSubmit({
                    ...form,
                    endAt: new Date(`${form.endAt}T00:00:00`).toISOString(),
                  });
                }}
                className="flex-1 rounded-xl bg-[#5E92F0] py-3 font-semibold text-white"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

'use client';

import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Ellipsis, Pin } from 'lucide-react';
import { useState } from 'react';

import Card from '@/components/main/Card';
import { useTeamDetail } from '@/hooks/useTeamQuery';
import { useTeamNoticeDetail } from '@/hooks/useNoticeQuery';
import { formatDate } from '@/utils/date/formatDate';

const categoryColorMap: Record<string, string> = {
  CONTEST: '#FBE4F8',
  STUDY: '#D8FAD8',
  PROJECT: '#DCEBFF',
  CLUB: '#FFF1CC',
  ETC: '#E9E9E9',
};

const teamRoleMap: Record<string, string> = {
  LEADER: '팀장',
  MANAGER: '관리자',
  MEMBER: '팀원',
};

export default function TeamNoticeDetail() {
  const router = useRouter();
  const params = useParams();

  const teamId = Number(params.id);
  const noticeId = Number(params.noticeId);

  const { data: team } = useTeamDetail(teamId);
  const { data: notice, isLoading } = useTeamNoticeDetail(teamId, noticeId);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (isLoading) return null;

  if (!notice) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5]">
        <p className="text-base font-semibold text-[#2C2C2C] sm:text-lg">
          존재하지 않는 공지입니다.
        </p>
      </main>
    );
  }

  const sortedImages = [...notice.images].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 pt-4 sm:px-6 sm:pt-6">
      <section className="mx-auto mt-8 flex min-h-[calc(100vh-48px)] max-w-[800px] flex-col sm:mt-12 sm:min-h-[calc(100vh-72px)]">
        <Card className="flex flex-1 flex-col overflow-hidden rounded-b-none p-0">
          <div
            className="flex h-16 items-center justify-between px-6 sm:h-18"
            style={{
              backgroundColor: team
                ? (categoryColorMap[team.category] ?? '#E9E9E9')
                : '#E9E9E9',
            }}
          >
            <button
              onClick={() => router.push(`/team/${teamId}/notice`)}
              className="cursor-pointer text-[#2C2C2C]"
            >
              <ChevronLeft
                size={24}
                strokeWidth={2.5}
                className="sm:h-7 sm:w-7"
              />
            </button>

            {notice.isEditable && (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  className="cursor-pointer text-[#2C2C2C]"
                >
                  <Ellipsis size={20} className="sm:h-[22px] sm:w-[22px]" />
                </button>

                {isMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsMenuOpen(false)}
                    />
                    <div className="absolute top-6 right-[-10px] z-20 w-[120px] overflow-hidden rounded-2xl border-[0.5px] border-[#D6DDE5] bg-white py-2">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          router.push(
                            `/team/${teamId}/notice/${noticeId}/edit`
                          );
                        }}
                        className="w-full px-4 py-2 text-left text-sm font-semibold text-[#2C2C2C] transition hover:bg-[#F6F8FA]"
                      >
                        수정하기
                      </button>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          // TODO: 삭제 기능
                        }}
                        className="w-full px-4 py-2 text-left text-sm font-semibold text-[#EF4444] transition hover:bg-[#F6F8FA]"
                      >
                        삭제하기
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="px-8 py-7 sm:px-10 sm:py-10">
            <div className="flex flex-wrap items-center gap-2">
              {notice.isPinned && (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center gap-1 rounded-full bg-[#EEF1FF] text-[15px] font-semibold text-[#5E92F0]">
                  <Pin size={15} strokeWidth={3} />
                </span>
              )}

              <h1 className="text-[24px] font-bold text-[#2C2C2C] sm:text-3xl">
                {notice.title}
              </h1>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-[#EEF1F5]">
                {notice.author.profileUrl && (
                  <img
                    src={notice.author.profileUrl}
                    alt={notice.author.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <p className="text-[13px] text-[#989898] sm:text-[15px]">
                {teamRoleMap[notice.author.teamRole] ?? notice.author.teamRole}{' '}
                · {notice.author.name} · {formatDate(notice.createdAt)}
              </p>
            </div>

            <div className="mt-3 border-b-[0.5px] border-[#D6DDE5]" />

            <section className="mt-4 flex flex-col gap-5 sm:mt-4 sm:gap-6">
              {sortedImages.map((image) => (
                <img
                  key={image.sortOrder}
                  src={image.imageUrl}
                  alt=""
                  className="w-full rounded-xl object-cover"
                />
              ))}

              <p className="text-[14px] leading-7 whitespace-pre-wrap text-[#2C2C2C] sm:text-[15px] sm:leading-8">
                {notice.content}
              </p>
            </section>
          </div>
        </Card>
      </section>
    </main>
  );
}

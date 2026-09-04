'use client';

import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, EllipsisVertical, Pin, X } from 'lucide-react';
import { useState } from 'react';
import NoticeDetailSkeleton from '@/components/skeleton/NoticeDetailSkeleton';
import Card from '@/components/main/Card';
import { useTeamDetail } from '@/hooks/team/useTeamQuery';
import {
  useTeamNoticeDetail,
  useDeleteTeamNotice,
} from '@/hooks/useNoticeQuery';
import { formatDate } from '@/utils/date/formatDate';
import { useSearchParams } from 'next/navigation';

const categoryColorMap: Record<string, string> = {
  CONTEST: '#FBE4F8',
  STUDY: '#D8FAD8',
  PROJECT: '#DCEBFF',
  CLUB: '#FFF1CC',
  ETC: '#E9E9E9',
};

const teamRoleMap: Record<string, string> = {
  LEADER: '팀장',
  MANAGER: '매니저',
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
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const { mutateAsync: deleteNotice } = useDeleteTeamNotice(teamId);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const searchParams = useSearchParams();
  const from = searchParams.get('from');

  if (isLoading) {
    return (
      <NoticeDetailSkeleton
        onBack={() =>
          from === 'home'
            ? router.push('/notice')
            : router.push(`/team/${teamId}/notice`)
        }
      />
    );
  }

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

  const handleDelete = async () => {
    try {
      await deleteNotice(noticeId);
      router.push(`/team/${teamId}/notice`);
    } catch (err) {
      console.error('공지 삭제 실패', err);
    }
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 sm:px-6 sm:pt-6">
      <section className="mx-auto mt-8 flex min-h-[calc(100vh)] max-w-[800px] flex-col sm:mt-12">
        <Card className="flex flex-1 flex-col overflow-hidden rounded-b-none p-0">
          <div
            className="flex h-18 items-center justify-between px-6"
            style={{
              backgroundColor: team
                ? (categoryColorMap[team.category] ?? '#E9E9E9')
                : '#E9E9E9',
            }}
          >
            <button
              onClick={() => {
                if (from === 'home') {
                  router.push('/notice'); // 홈페이지 공지
                } else {
                  router.push(`/team/${teamId}/notice`); // 팀 공지
                }
              }}
              className="cursor-pointer text-[#2C2C2C]"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>

            {notice.isEditable && (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  className="cursor-pointer pt-1 text-[#2C2C2C]"
                >
                  <EllipsisVertical size={20} />
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
                        className="w-full cursor-pointer px-4 py-2 text-left text-sm font-semibold text-[#2C2C2C] transition hover:bg-[#F6F8FA]"
                      >
                        수정하기
                      </button>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsDeleteConfirmOpen(true);
                        }}
                        className="w-full cursor-pointer px-4 py-2 text-left text-sm font-semibold text-[#E22222] transition hover:bg-[#F6F8FA]"
                      >
                        삭제하기
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="px-8 py-7 sm:px-8 sm:py-10">
            <div className="flex flex-wrap items-center gap-2">
              {notice.isPinned && (
                <span className="flex shrink-0 items-center justify-center text-[#5E92F0]">
                  <Pin size={24} strokeWidth={3} />
                </span>
              )}

              <h1 className="text-[24px] font-bold text-[#2C2C2C] sm:text-[26px]">
                {notice.title}
              </h1>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full border-[0.5px] border-[#D6DDE5] bg-[#EEF1F5]">
                  {notice.author.profileUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={notice.author.profileUrl}
                      alt={notice.author.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <p className="text-[13px] text-[#989898] sm:text-[14px]">
                  {notice.author.name} ·{' '}
                  {teamRoleMap[notice.author.teamRole] ??
                    notice.author.teamRole}
                </p>
              </div>
              <p className="text-[13px] text-[#989898] sm:text-[14px]">
                {formatDate(notice.createdAt)}
              </p>
            </div>

            <div className="mt-2 border-b-[0.5px] border-[#D6DDE5]" />

            <section className="mt-4 flex flex-col gap-4">
              {sortedImages.map((image) => (
                <button
                  key={image.sortOrder}
                  type="button"
                  onClick={() => setPreviewImageUrl(image.imageUrl)}
                  className="cursor-zoom-in overflow-hidden rounded-xl"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.imageUrl}
                    alt=""
                    className="max-h-[400px] w-full object-cover transition-transform duration-200 hover:scale-[1.02]"
                  />
                </button>
              ))}

              <p className="text-[14px] leading-7 whitespace-pre-wrap text-[#2C2C2C] sm:text-[15px] sm:leading-8">
                {notice.content}
              </p>
            </section>
          </div>
        </Card>
      </section>

      {/* 이미지 확대 모달 */}
      {previewImageUrl && (
        <div
          onClick={() => setPreviewImageUrl(null)}
          className="fixed inset-0 z-[300] flex cursor-zoom-out items-center justify-center bg-black/80 px-4"
        >
          <button
            type="button"
            onClick={() => setPreviewImageUrl(null)}
            className="absolute top-6 right-6 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X size={22} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewImageUrl}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-full cursor-default rounded-lg object-contain"
          />
        </div>
      )}

      {isDeleteConfirmOpen && (
        <div
          onClick={() => setIsDeleteConfirmOpen(false)}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-modal-pop w-[360px] rounded-3xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-center text-xl font-bold text-[#2C2C2C]">
              공지를 삭제할까요?
            </h2>
            <p className="mt-2 text-center text-[15px] text-[#989898]">
              삭제한 공지는 복구할 수 없어요
            </p>

            <div className="mt-3 flex gap-3">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 cursor-pointer rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-2 font-semibold text-[#2C2C2C] transition-all duration-200 active:scale-95"
              >
                취소
              </button>

              <button
                onClick={async () => {
                  setIsDeleteConfirmOpen(false);
                  await handleDelete();
                }}
                className="flex-1 cursor-pointer rounded-xl bg-[#E22222] py-3 font-semibold text-white transition-all duration-200 active:scale-95"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

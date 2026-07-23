'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import Card from '@/components/main/Card';
import { useDeleteInfoPost, useInfoPostDetail } from '@/hooks/useInfoPostQuery';
import {
  infoPostCategoryColorMap,
  infoPostCategoryMap,
} from '@/constants/infoPost';
import { formatDate } from '@/utils/date/formatDate';

import { ChevronLeft, Ellipsis } from 'lucide-react';
import { useErrorToast } from '@/hooks/useErrorToast';
export default function InfoPostDetailPage() {
  const router = useRouter();
  const params = useParams();

  const infoPostId = Number(params.id);

  const { data: infoPost, isLoading } = useInfoPostDetail(infoPostId);
  const { mutateAsync: deleteInfoPost } = useDeleteInfoPost();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { errorMessage, showErrorMessage } = useErrorToast();
  const handleDelete = async () => {
    const confirmed = window.confirm('정보글을 삭제하시겠습니까?');

    if (!confirmed) return;

    try {
      await deleteInfoPost(infoPostId);
      router.push('/infoPost');
    } catch (error) {
      console.error('정보글 삭제 실패', error);
      showErrorMessage('정보글 삭제에 실패했습니다');
    }
  };

  if (isLoading) return null;

  if (!infoPost) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5]">
        <p className="text-base font-semibold text-[#2C2C2C] sm:text-lg">
          존재하지 않는 정보글입니다
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 sm:px-6 sm:pt-6">
      <section className="mx-auto mt-8 flex min-h-[calc(100vh-48px)] max-w-[800px] flex-col sm:mt-12 sm:min-h-[calc(100vh-72px)]">
        <Card className="flex flex-1 flex-col overflow-hidden rounded-b-none p-0">
          {/* 상단 */}
          {errorMessage && (
            <div className="animate-modal-pop fixed top-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
              {errorMessage}
            </div>
          )}
          <div
            className="flex h-18 items-center justify-between px-6"
            style={{
              backgroundColor: infoPostCategoryColorMap[infoPost.category],
            }}
          >
            <button
              type="button"
              onClick={() => router.push('/infoPost')}
              className="cursor-pointer text-[#2C2C2C]"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>

            {infoPost.isAuthor && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  className="cursor-pointer text-[#2C2C2C]"
                >
                  <Ellipsis size={22} />
                </button>

                {isMenuOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="메뉴 닫기"
                      className="fixed inset-0 z-10"
                      onClick={() => setIsMenuOpen(false)}
                    />

                    <div className="absolute top-7 right-0 z-20 w-[120px] overflow-hidden rounded-2xl border-[0.5px] border-[#D6DDE5] bg-white py-1">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/infoPost/${infoPostId}/edit`)
                        }
                        className="w-full cursor-pointer px-4 py-2 text-left text-sm font-semibold text-[#2C2C2C] transition hover:bg-[#F6F8FA]"
                      >
                        수정하기
                      </button>

                      <button
                        type="button"
                        onClick={handleDelete}
                        className="w-full cursor-pointer px-4 py-2 text-left text-sm font-semibold text-[#2C2C2C] transition hover:bg-[#F6F8FA]"
                      >
                        삭제하기
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 본문 */}
          <div className="px-8 py-7 sm:px-10 sm:py-10">
            <h1 className="text-2xl font-bold text-[#2C2C2C] sm:text-3xl">
              {infoPost.title}
            </h1>

            <div className="mt-6 grid grid-cols-[72px_1fr] gap-y-4 text-sm sm:grid-cols-[90px_1fr] sm:text-[15px]">
              <span className="text-[#989898]">종류</span>
              <span className="text-[#2C2C2C]">
                {infoPostCategoryMap[infoPost.category]}
              </span>

              <span className="text-[#989898]">작성자</span>
              <span className="text-[#2C2C2C]">{infoPost.author.name}</span>

              <span className="text-[#989898]">작성일</span>
              <span className="text-[#2C2C2C]">
                {formatDate(infoPost.createdAt)}
              </span>

              <span className="text-[#989898]">모집글</span>
              <span className="text-[#2C2C2C]">
                연결된 모집글 {infoPost.recruitmentCount}개
              </span>
            </div>

            <div className="mt-8 border-b-[0.5px] border-[#D6DDE5]" />

            <p className="mt-6 text-[15px] leading-8 whitespace-pre-wrap text-[#2C2C2C]">
              {infoPost.content}
            </p>

            {infoPost.images.length > 0 && (
              <div className="mt-8 flex flex-col gap-4">
                {[...infoPost.images]
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((image) => (
                    <img
                      key={`${image.imageUrl}-${image.sortOrder}`}
                      src={image.imageUrl}
                      alt=""
                      className="max-h-[500px] w-full rounded-xl object-contain"
                    />
                  ))}
              </div>
            )}
          </div>
        </Card>
      </section>
    </main>
  );
}

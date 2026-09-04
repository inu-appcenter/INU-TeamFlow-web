'use client';

import Card from '@/components/main/Card';
import { ChevronLeft, Plus, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { useTeamDetail } from '@/hooks/team/useTeamQuery';
import {
  useTeamNoticeDetail,
  useUpdateTeamNotice,
  useGetPresignedUrls,
} from '@/hooks/useNoticeQuery';
import { uploadImageToS3 } from '@/utils/uploadImageToS3';
import { getImageKeyFromUrl } from '@/utils/getImageKey';
import type { TeamNoticeDetail } from '@/types/notice';

const categoryColorMap: Record<string, string> = {
  CONTEST: '#FBE4F8',
  STUDY: '#D8FAD8',
  PROJECT: '#DCEBFF',
  CLUB: '#FFF1CC',
  ETC: '#E9E9E9',
};

const categoryMap: Record<string, string> = {
  CONTEST: '공모전',
  STUDY: '스터디',
  PROJECT: '프로젝트',
  CLUB: '동아리',
  ETC: '기타',
};

type LocalImage = {
  id: string;
  file: File;
  previewUrl: string;
};

type ExistingImage = {
  id: string;
  imageKey: string;
  imageUrl: string;
};

type InputFieldProps = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
};

type TextAreaFieldProps = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  rows?: number;
};

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: InputFieldProps) => (
  <div>
    <div className="mb-2 flex items-center gap-1">
      <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
        {label}
      </span>

      {required && (
        <span className="text-sm font-semibold text-[#FF6B6B]">*</span>
      )}
    </div>

    <input
      className="mb-3 w-full rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-4 py-2 focus:ring-2 focus:ring-[#5E92F0] focus:outline-none"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  </div>
);

const TextAreaField = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  maxLength,
  rows = 4,
}: TextAreaFieldProps) => (
  <div>
    <div className="mb-2 flex items-center gap-1">
      <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
        {label}
      </span>

      {required && (
        <span className="text-sm font-semibold text-[#FF6B6B]">*</span>
      )}
    </div>

    <textarea
      rows={rows}
      className="w-full resize-none rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-4 py-3 focus:ring-2 focus:ring-[#5E92F0] focus:outline-none"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
    />

    {maxLength && (
      <div className="text-right text-xs text-[#B0B0B0]">
        {value.length}/{maxLength}
      </div>
    )}
  </div>
);

// 데이터 로딩 완료 후에만 마운트되는 실제 폼
function NoticeEditForm({
  teamId,
  noticeId,
  notice,
}: {
  teamId: number;
  noticeId: number;
  notice: TeamNoticeDetail;
}) {
  const router = useRouter();
  const { data: team } = useTeamDetail(teamId);
  const { mutateAsync: getPresignedUrls } = useGetPresignedUrls();
  const { mutateAsync: updateNotice } = useUpdateTeamNotice(teamId);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(notice.title);
  const [content, setContent] = useState(notice.content);
  const [isPinned, setIsPinned] = useState(notice.isPinned);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>(
    [...notice.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((img) => ({
        id: `existing-${img.sortOrder}`,
        imageKey: getImageKeyFromUrl(img.imageUrl),
        imageUrl: img.imageUrl,
      }))
  );
  const [newImages, setNewImages] = useState<LocalImage[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentColor = team
    ? (categoryColorMap[team.category] ?? '#E9E9E9')
    : '#E9E9E9';

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);

    setTimeout(() => {
      setErrorMessage('');
    }, 1800);
  };

  const handleSelectImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const newLocalImages: LocalImage[] = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setNewImages((prev) => [...prev, ...newLocalImages]);
    e.target.value = '';
  };

  const handleRemoveExistingImage = (id: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleRemoveNewImage = (id: string) => {
    setNewImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      let uploadedImageKeys: string[] = [];

      if (newImages.length > 0) {
        const presignedList = await getPresignedUrls(
          newImages.map((img) => ({
            fileName: img.file.name,
            contentType: img.file.type,
          }))
        );

        await Promise.all(
          presignedList.map((presigned, i) =>
            uploadImageToS3(presigned.uploadUrl, newImages[i].file)
          )
        );

        uploadedImageKeys = presignedList.map((p) => p.imageKey);
      }

      const imageKeys = [
        ...existingImages.map((img) => img.imageKey),
        ...uploadedImageKeys,
      ];

      await updateNotice({
        noticeId,
        body: {
          title: title.trim(),
          content: content.trim(),
          isPinned,
          imageKeys,
        },
      });

      router.push(`/team/${teamId}/notice/${noticeId}`);
    } catch (err) {
      console.error('공지 수정 실패', err);
      showErrorMessage('공지 수정에 실패했어요');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 sm:px-6 sm:pt-6">
      <section className="mx-auto mt-8 flex min-h-[calc(100vh)] max-w-[800px] flex-col sm:mt-12">
        <Card className="relative flex flex-1 flex-col overflow-hidden rounded-b-none p-0">
          {errorMessage && (
            <div className="animate-modal-pop absolute top-32 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
              {errorMessage}
            </div>
          )}

          <div
            className="flex h-[72px] items-center justify-between px-6"
            style={{ backgroundColor: currentColor }}
          >
            <button
              onClick={() => router.push(`/team/${teamId}/notice/${noticeId}`)}
              className="cursor-pointer text-[#2C2C2C]"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>

            <span className="rounded-full bg-white/80 px-5 py-2 text-sm font-semibold text-[#2C2C2C]">
              {team ? categoryMap[team.category] : '공지 수정'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pt-10 pb-6">
            <div className="mx-auto max-w-[600px]">
              {/* 이미지 */}
              <section className="mb-4">
                <div className="mb-2 text-sm font-bold tracking-wide text-[#B0B0B0]">
                  이미지
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {existingImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative h-[150px] w-[150px] shrink-0 overflow-hidden rounded-2xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA]"
                    >
                      <img
                        src={img.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(img.id)}
                        className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#989898]/50 text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  {newImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative h-[150px] w-[150px] shrink-0 overflow-hidden rounded-2xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA]"
                    >
                      <img
                        src={img.previewUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(img.id)}
                        className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#989898]/50 text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-[150px] w-[150px] shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[#D6DDE5]/60 bg-[#F6F8FA] text-[#9C9C9C] transition hover:bg-[#EEF1F5]"
                  >
                    <Plus size={20} strokeWidth={2.5} />
                    <span className="text-[12px] font-semibold">추가</span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSelectImages}
                  className="hidden"
                />

                <p className="mt-2 flex items-center text-[11px] text-[#b0b0b0]">
                  이미지는 선택 사항이며 여러 장 첨부할 수 있어요
                </p>
              </section>

              {/* 고정 여부 */}
              <section className="mb-4 flex items-center gap-2">
                <div className="text-sm tracking-wide text-[#B0B0B0]">
                  <p className="font-bold">고정 여부</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPinned((prev) => !prev)}
                  className={`relative h-7 w-12 rounded-full transition-colors duration-300 ease-in-out ${
                    isPinned ? 'bg-[#5E92F0]' : 'bg-[#D6DDE5]'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-0 h-5 w-5 rounded-full bg-white transition-all duration-300 ease-in-out ${
                      isPinned ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </section>

              <InputField
                label="제목"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder=""
              />

              <TextAreaField
                label="내용"
                required
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder=""
              />

              <div className="mt-6 mb-16 flex justify-center">
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      if (!title.trim()) {
                        showErrorMessage('제목을 입력해주세요');
                        return;
                      }

                      if (!content.trim()) {
                        showErrorMessage('내용을 입력해주세요');
                        return;
                      }

                      setIsConfirmOpen(true);
                    }}
                    disabled={isSubmitting}
                    className="cursor-pointer rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#5E92F0] px-10 py-2 font-medium text-white disabled:opacity-60"
                  >
                    수정
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {isConfirmOpen && (
        <div
          onClick={() => setIsConfirmOpen(false)}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-modal-pop w-[360px] rounded-3xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-center text-xl font-bold">
              공지를 수정할까요?
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
                  await handleSubmit();
                }}
                className="flex-1 rounded-xl bg-[#5E92F0] py-3 font-semibold text-white"
              >
                수정
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function TeamNoticeEdit() {
  const params = useParams();
  const teamId = Number(params.id);
  const noticeId = Number(params.noticeId);

  const { data: notice, isLoading } = useTeamNoticeDetail(teamId, noticeId);

  if (isLoading) return null;

  if (!notice) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5]">
        <p className="font-semibold text-[#2C2C2C]">
          존재하지 않는 공지입니다.
        </p>
      </main>
    );
  }

  return (
    <NoticeEditForm
      key={notice.noticeId}
      teamId={teamId}
      noticeId={noticeId}
      notice={notice}
    />
  );
}

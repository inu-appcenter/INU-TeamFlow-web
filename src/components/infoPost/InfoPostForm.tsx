'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';

import { ChevronLeft, ImagePlus, LoaderCircle, X } from 'lucide-react';

import Card from '@/components/main/Card';
import {
  categoryColorMap,
  categoryFilterOptions,
  DEFAULT_CATEGORY_COLOR,
} from '@/constants/category';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useUploadInfoPostImages } from '@/hooks/useInfoPostQuery';
import type { InfoPostCategory } from '@/types/infoPost';

export interface InfoPostFormData {
  category: InfoPostCategory;
  title: string;
  content: string;
  imageKeys: string[];
}

interface InfoPostFormProps {
  mode: 'create' | 'edit';
  initialData?: InfoPostFormData;
  initialImageUrl?: string | null;
  onSubmit: (form: InfoPostFormData) => Promise<void>;
  onDelete?: () => void;
}

interface SelectedImage {
  file: File;
  previewUrl: string;
  imageKey?: string;
}

const defaultForm: InfoPostFormData = {
  category: 'CONTEST',
  title: '',
  content: '',
  imageKeys: [],
};

const infoPostCategoryOptions = categoryFilterOptions.filter(
  (category) => category.value !== 'ALL'
);

export default function InfoPostForm({
  mode,
  initialData,
  initialImageUrl,
  onSubmit,
  onDelete,
}: InfoPostFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { errorMessage, showErrorMessage } = useErrorToast();

  const { mutateAsync: uploadImages, isPending: isUploading } =
    useUploadInfoPostImages();

  const [form, setForm] = useState<InfoPostFormData>(
    initialData ?? defaultForm
  );

  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null
  );

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(
    initialImageUrl ?? null
  );
  useEffect(() => {
    setExistingImageUrl(initialImageUrl ?? null);
  }, [initialImageUrl]);
  const isBusy = isSubmitting || isUploading;

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    const previewUrl = selectedImage?.previewUrl;

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [selectedImage?.previewUrl]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = '';

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      showErrorMessage('이미지 파일만 선택할 수 있습니다');
      return;
    }

    setSelectedImage({
      file,
      previewUrl: URL.createObjectURL(file),
    });

    setSelectedImage({
      file,
      previewUrl: URL.createObjectURL(file),
    });

    setExistingImageUrl(null);

    setForm((prev) => ({
      ...prev,
      imageKeys: [],
    }));
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setExistingImageUrl(null);

    setForm((prev) => ({
      ...prev,
      imageKeys: [],
    }));
  };

  const validateForm = () => {
    if (!form.title.trim()) {
      showErrorMessage('정보글 제목을 입력해주세요');
      return false;
    }

    if (!form.content.trim()) {
      showErrorMessage('정보글 내용을 입력해주세요');
      return false;
    }

    return true;
  };

  const submitForm = async () => {
    try {
      setIsSubmitting(true);

      let imageKeys = form.imageKeys.slice(0, 1);

      if (selectedImage) {
        let imageKey = selectedImage.imageKey;

        if (!imageKey) {
          const uploadedImageKeys = await uploadImages([selectedImage.file]);

          imageKey = uploadedImageKeys[0];

          if (!imageKey) {
            throw new Error('업로드된 이미지 키가 없습니다.');
          }

          setSelectedImage((prev) =>
            prev
              ? {
                  ...prev,
                  imageKey,
                }
              : null
          );
        }

        imageKeys = [imageKey];
      }

      await onSubmit({
        ...form,
        title: form.title.trim(),
        content: form.content.trim(),
        imageKeys,
      });
    } catch (error) {
      console.error(
        mode === 'create' ? '정보글 생성 실패' : '정보글 수정 실패',
        error
      );

      showErrorMessage(
        mode === 'create'
          ? '정보글 생성에 실패했습니다'
          : '정보글 수정에 실패했습니다'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitClick = async () => {
    if (!validateForm()) {
      return;
    }

    if (mode === 'create') {
      setIsConfirmOpen(true);
      return;
    }

    await submitForm();
  };

  const handleCreateConfirm = async () => {
    setIsConfirmOpen(false);
    await submitForm();
  };
  const previewImageUrl = selectedImage?.previewUrl ?? existingImageUrl;
  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 sm:px-6 sm:pt-6">
      <section className="mx-auto mt-8 max-w-[800px] sm:mt-12">
        <Card className="relative overflow-hidden p-0">
          {errorMessage && (
            <div className="animate-modal-pop absolute top-32 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
              {errorMessage}
            </div>
          )}

          {/* 상단 헤더 */}
          <div
            className="flex h-[72px] items-center px-6"
            style={{
              backgroundColor:
                categoryColorMap[form.category] ?? DEFAULT_CATEGORY_COLOR,
            }}
          >
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isBusy}
              aria-label="뒤로 가기"
              className="cursor-pointer text-[#2C2C2C] transition-all duration-150 active:scale-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
          </div>

          {/* 작성 영역 */}
          <div className="px-8 py-6 sm:px-10">
            <div className="mx-auto max-w-[600px]">
              {/* 제목 */}
              <div className="py-2">
                <div className="mb-2">
                  <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
                    제목
                  </span>
                </div>

                <input
                  type="text"
                  value={form.title}
                  disabled={isBusy}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                  placeholder="정보글 제목을 입력해주세요"
                  className="h-[42px] w-full rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-4 text-[#2C2C2C] placeholder:text-[#989898] focus:ring-2 focus:ring-[#5E92F0] focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              {/* 카테고리 */}
              <div className="py-2">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
                    카테고리
                  </span>

                  {mode === 'edit' && (
                    <span className="text-xs text-[#9A9A9A]">
                      수정할 수 없습니다
                    </span>
                  )}
                </div>

                <select
                  value={form.category}
                  disabled={mode === 'edit' || isBusy}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      category: event.target.value as InfoPostCategory,
                    }))
                  }
                  className="h-[42px] w-full rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-4 text-[#2C2C2C] focus:ring-2 focus:ring-[#5E92F0] focus:outline-none disabled:cursor-not-allowed disabled:text-[#989898]"
                >
                  {infoPostCategoryOptions.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 이미지 */}
              <div className="py-2">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
                    이미지
                  </span>

                  <span className="text-xs text-[#989898]">선택 사항</span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />

                {previewImageUrl ? (
                  <div>
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA]">
                      <Image
                        src={previewImageUrl}
                        alt={selectedImage?.file.name ?? '기존 정보글 이미지'}
                        fill
                        unoptimized={Boolean(selectedImage)}
                        className="object-cover"
                      />

                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={isBusy}
                        aria-label="선택한 이미지 삭제"
                        className="absolute top-3 right-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-all duration-150 hover:bg-black/70 active:scale-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X size={17} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isBusy}
                      className="mt-2 cursor-pointer text-sm font-semibold text-[#5E92F0] transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      이미지 변경
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isBusy}
                    className="flex h-36 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#B8C0CA] bg-[#F6F8FA] text-[#989898] transition-all duration-150 hover:bg-[#EEF1F5] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ImagePlus size={28} />

                    <span className="text-sm font-semibold">이미지 추가</span>
                  </button>
                )}

                <p className="mt-2 text-xs text-[#989898]">
                  이미지 한 장을 등록할 수 있습니다.
                </p>
              </div>

              {/* 내용 */}
              <div className="py-2">
                <div className="mb-2">
                  <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
                    내용
                  </span>
                </div>

                <textarea
                  value={form.content}
                  disabled={isBusy}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      content: event.target.value,
                    }))
                  }
                  placeholder="공유할 정보를 입력해주세요"
                  className="thin-scrollbar min-h-[280px] w-full resize-none rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-4 py-3 text-[#2C2C2C] placeholder:text-[#989898] focus:ring-2 focus:ring-[#5E92F0] focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              {/* 하단 버튼 */}
              <div className="mt-5 mb-4 flex justify-center gap-2">
                {mode === 'edit' && onDelete && (
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={isBusy}
                    className="cursor-pointer rounded-2xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-8 py-2 font-semibold text-[#E22222] transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    삭제
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSubmitClick}
                  disabled={isBusy}
                  className="cursor-pointer rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#5E92F0] px-8 py-2 font-semibold text-white transition-all duration-150 hover:bg-[#5C86EB] active:scale-95 disabled:cursor-not-allowed disabled:bg-[#B8C8F2]"
                >
                  {isBusy ? (
                    <span className="flex items-center gap-2">
                      <LoaderCircle className="h-4 w-4 animate-spin" />

                      {isUploading ? '이미지 업로드 중' : '처리 중'}
                    </span>
                  ) : mode === 'create' ? (
                    '등록'
                  ) : (
                    '수정'
                  )}
                </button>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 생성 확인 모달 */}
      {mode === 'create' && isConfirmOpen && (
        <div
          onClick={() => setIsConfirmOpen(false)}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 px-4"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="animate-modal-pop w-full max-w-90 rounded-3xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-center text-xl font-bold text-[#2C2C2C]">
              정보글을 생성할까요?
            </h2>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isBusy}
                className="flex-1 cursor-pointer rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-2 font-semibold transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleCreateConfirm}
                disabled={isBusy}
                className="flex-1 cursor-pointer rounded-xl bg-[#5E92F0] py-3 font-semibold text-white transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:bg-[#B8C8F2]"
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

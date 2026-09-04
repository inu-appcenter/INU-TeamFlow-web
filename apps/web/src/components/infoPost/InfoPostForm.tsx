'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';

import { ChevronLeft, ImagePlus, LoaderCircle, X } from 'lucide-react';

import Card from '@/components/main/Card';
import { categoryColorMap } from '@moimi/core/constants/contentCard';
import { infoPostCategoryFilterOptions } from '@moimi/core/constants/infoPost';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useUploadInfoPostImages } from '@moimi/core/hooks/useInfoPostQuery';
import type { InfoPostCategory } from '@moimi/core/types/infoPost';
import { darkenColor } from '@/utils/color/darkenColor';

export interface InfoPostFormData {
  category: InfoPostCategory;
  title: string;
  content: string;
  imageKeys: string[];
}

interface InitialImage {
  imageUrl: string;
  imageKey: string;
}

interface InfoPostFormProps {
  mode: 'create' | 'edit';
  initialData?: InfoPostFormData;
  initialImages?: InitialImage[];
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

const infoPostCategoryOptions = infoPostCategoryFilterOptions.filter(
  (category) => category.value !== 'ALL'
);
const MAX_IMAGE_COUNT = 3;
const EMPTY_INITIAL_IMAGES: InitialImage[] = [];

export default function InfoPostForm({
  mode,
  initialData,
  initialImages = EMPTY_INITIAL_IMAGES,
  onSubmit,
  onDelete,
}: InfoPostFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedImagesRef = useRef<SelectedImage[]>([]);

  const { errorMessage, showErrorMessage } = useErrorToast();

  const { mutateAsync: uploadImages, isPending: isUploading } =
    useUploadInfoPostImages();

  const [form, setForm] = useState<InfoPostFormData>(
    initialData ?? defaultForm
  );

  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);

  const [existingImages, setExistingImages] =
    useState<InitialImage[]>(initialImages);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBusy = isSubmitting || isUploading;
  const totalImageCount = existingImages.length + selectedImages.length;

  // initialData/initialImages는 부모(edit 페이지)에서 비동기로 조회된 뒤
  // 나중에 채워지는 prop이라, 이펙트 대신 "렌더링 중 상태 조정" 패턴으로
  // 동기화합니다. (https://react.dev/learn/you-might-not-need-an-effect)
  const [prevInitialData, setPrevInitialData] = useState(initialData);

  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);

    if (initialData) {
      setForm(initialData);
    }
  }

  const [prevInitialImages, setPrevInitialImages] = useState(initialImages);

  if (mode === 'edit' && initialImages !== prevInitialImages) {
    setPrevInitialImages(initialImages);
    setExistingImages(initialImages);
  }

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(() => {
    return () => {
      selectedImagesRef.current.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });
    };
  }, []);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    event.target.value = '';

    if (files.length === 0) {
      return;
    }

    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length !== files.length) {
      showErrorMessage('이미지 파일만 선택할 수 있습니다');
    }

    const availableCount = MAX_IMAGE_COUNT - totalImageCount;

    if (availableCount <= 0) {
      showErrorMessage('이미지는 최대 3장까지 등록할 수 있습니다');
      return;
    }

    const filesToAdd = imageFiles.slice(0, availableCount);

    if (imageFiles.length > availableCount) {
      showErrorMessage('이미지는 최대 3장까지 등록할 수 있습니다');
    }

    const newImages = filesToAdd.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveExistingImage = (imageKey: string) => {
    setExistingImages((prev) =>
      prev.filter((image) => image.imageKey !== imageKey)
    );
  };

  const handleRemoveSelectedImage = (index: number) => {
    setSelectedImages((prev) => {
      const targetImage = prev[index];

      if (targetImage) {
        URL.revokeObjectURL(targetImage.previewUrl);
      }

      return prev.filter((_, imageIndex) => imageIndex !== index);
    });
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

      const existingImageKeys = existingImages.map((image) => image.imageKey);

      let selectedImageKeys = selectedImages
        .map((image) => image.imageKey)
        .filter((imageKey): imageKey is string => Boolean(imageKey));

      const imagesToUpload = selectedImages.filter((image) => !image.imageKey);

      if (imagesToUpload.length > 0) {
        const uploadedImageKeys = await uploadImages(
          imagesToUpload.map((image) => image.file)
        );

        let uploadedIndex = 0;

        const updatedSelectedImages = selectedImages.map((image) => {
          if (image.imageKey) {
            return image;
          }

          const imageKey = uploadedImageKeys[uploadedIndex];
          uploadedIndex += 1;

          if (!imageKey) {
            throw new Error('업로드된 이미지가 없습니다');
          }

          return {
            ...image,
            imageKey,
          };
        });

        setSelectedImages(updatedSelectedImages);

        selectedImageKeys = updatedSelectedImages.map((image) => {
          if (!image.imageKey) {
            throw new Error('업로드된 이미지가 없습니다');
          }

          return image.imageKey;
        });
      }

      const imageKeys = [...existingImageKeys, ...selectedImageKeys].slice(
        0,
        MAX_IMAGE_COUNT
      );

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

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 sm:px-6 sm:pt-6">
      <section className="mx-auto mt-8 flex min-h-[calc(100vh)] max-w-[800px] flex-col sm:mt-12">
        <Card className="relative flex flex-1 flex-col overflow-hidden rounded-b-none p-0">
          {errorMessage && (
            <div className="animate-modal-pop absolute top-32 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
              {errorMessage}
            </div>
          )}

          {/* 상단 헤더 */}
          <div
            className="flex h-[72px] items-center px-6"
            style={{
              backgroundColor: categoryColorMap[form.category],
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
          <div className="flex-1 overflow-y-auto px-8 py-8 sm:px-10">
            <div className="mx-auto max-w-[600px]">
              {/* 제목 */}
              <div className="py-2">
                <div className="mb-2">
                  <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
                    제목<span className="ml-0.5 text-[#E22222]">*</span>
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
                  className="h-[42px] w-full rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-4 text-[#2C2C2C] placeholder:text-[#989898] focus:ring-2 focus:ring-[#5E92F0] focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              {/* 카테고리 */}
              <div className="py-2">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
                    카테고리<span className="ml-0.5 text-[#E22222]">*</span>
                  </span>

                  {mode === 'edit' && (
                    <span className="text-xs text-[#9A9A9A]">
                      (수정할 수 없습니다)
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {infoPostCategoryOptions.map((category) => {
                    const value = category.value as InfoPostCategory;
                    const isSelected = form.category === value;

                    return (
                      <button
                        key={category.value}
                        type="button"
                        disabled={mode === 'edit' || isBusy}
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            category: value,
                          }))
                        }
                        className={`cursor-pointer rounded-2xl border-[0.5px] px-4 py-2 text-sm transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
                          isSelected
                            ? 'font-semibold opacity-100'
                            : 'border-[#D6DDE5]/40 bg-[#EEF1F5]'
                        }`}
                        style={
                          isSelected
                            ? {
                                backgroundColor: categoryColorMap[value],
                                borderColor: darkenColor(
                                  categoryColorMap[value],
                                  30
                                ),
                                color: darkenColor(
                                  categoryColorMap[value],
                                  140
                                ),
                              }
                            : undefined
                        }
                      >
                        {category.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 이미지 */}
              <div className="py-2">
                <div className="mb-2">
                  <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
                    이미지
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleImageChange}
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {existingImages.map((image) => (
                    <div
                      key={image.imageKey}
                      className="relative aspect-square overflow-hidden rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA]"
                    >
                      <Image
                        src={image.imageUrl}
                        alt="기존 정보글 이미지"
                        fill
                        className="object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveExistingImage(image.imageKey)
                        }
                        disabled={isBusy}
                        aria-label="기존 이미지 삭제"
                        className="absolute top-2 right-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}

                  {selectedImages.map((image, index) => (
                    <div
                      key={image.previewUrl}
                      className="relative aspect-square overflow-hidden rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA]"
                    >
                      <Image
                        src={image.previewUrl}
                        alt={image.file.name}
                        fill
                        unoptimized
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveSelectedImage(index)}
                        disabled={isBusy}
                        aria-label="선택한 이미지 삭제"
                        className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#989898]/50 text-white"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}

                  {totalImageCount < MAX_IMAGE_COUNT && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isBusy}
                      className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-[#D6DDE5]/60 bg-[#F6F8FA] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ImagePlus size={26} className="text-[#9C9C9C]" />
                    </button>
                  )}
                </div>

                <p className="mt-2 text-[10px] text-[#b0b0b0]">
                  이미지 최대 3장 · 현재 {totalImageCount}장
                </p>
              </div>

              {/* 내용 */}
              <div className="py-2">
                <div className="mb-2">
                  <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
                    내용<span className="ml-0.5 text-[#E22222]">*</span>
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
                  className="thin-scrollbar min-h-[280px] w-full resize-none rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-4 py-3 text-[#2C2C2C] placeholder:text-[#989898] focus:ring-2 focus:ring-[#5E92F0] focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              {/* 하단 버튼 */}
              <div className="mt-5 mb-15 flex justify-center gap-2">
                {mode === 'edit' && onDelete && (
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={isBusy}
                    className="cursor-pointer rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-10 py-2 font-medium text-[#E22222] transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    삭제
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    void handleSubmitClick();
                  }}
                  disabled={isBusy}
                  className="cursor-pointer rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#5E92F0] px-10 py-2 font-medium text-white transition-all duration-150 hover:bg-[#5C86EB] active:scale-95 disabled:cursor-not-allowed disabled:bg-[#B8C8F2]"
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
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="animate-modal-pop w-[360px] rounded-3xl bg-white p-6 shadow-xl"
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

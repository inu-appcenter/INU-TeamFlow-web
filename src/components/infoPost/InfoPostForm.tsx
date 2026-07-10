'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import Card from '@/components/main/Card';
import {
  categoryFilterOptions,
  categoryColorMap,
  DEFAULT_CATEGORY_COLOR,
} from '@/constants/category';
import { useErrorToast } from '@/hooks/useErrorToast';
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
  onSubmit: (form: InfoPostFormData) => Promise<void>;
  onDelete?: () => void;
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
  onSubmit,
  onDelete,
}: InfoPostFormProps) {
  const router = useRouter();
  const { errorMessage, showErrorMessage } = useErrorToast();

  const [form, setForm] = useState<InfoPostFormData>(
    initialData ?? defaultForm
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  const handleSubmitClick = async () => {
    if (!form.title.trim()) {
      showErrorMessage('정보글 제목을 입력해주세요');
      return;
    }

    if (!form.content.trim()) {
      showErrorMessage('정보글 내용을 입력해주세요');
      return;
    }

    if (mode === 'create') {
      setIsConfirmOpen(true);
      return;
    }

    await submitForm();
  };

  const submitForm = async () => {
    try {
      setIsSubmitting(true);

      await onSubmit({
        ...form,
        title: form.title.trim(),
        content: form.content.trim(),
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

  const handleCreateConfirm = async () => {
    setIsConfirmOpen(false);
    await submitForm();
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 pt-4 sm:px-6 sm:pt-6">
      <section className="mx-auto mt-8 flex min-h-[calc(100vh-48px)] max-w-[800px] flex-col sm:mt-12 sm:min-h-[calc(100vh-72px)]">
        <Card className="relative flex flex-1 flex-col overflow-hidden rounded-b-none p-0">
          {errorMessage && (
            <div className="animate-modal-pop absolute top-32 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
              {errorMessage}
            </div>
          )}

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
              className="cursor-pointer text-[#2C2C2C] transition-all duration-150 active:scale-90"
              aria-label="뒤로 가기"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-8 sm:px-10">
            <div className="mx-auto max-w-[600px]">
              <div className="py-2">
                <div className="mb-2">
                  <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
                    제목
                  </span>
                </div>

                <input
                  type="text"
                  value={form.title}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                  placeholder="정보글 제목을 입력해주세요"
                  className="h-[42px] w-full rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-4 text-[#2C2C2C] placeholder:text-[#989898] focus:ring-2 focus:ring-[#5E92F0] focus:outline-none disabled:cursor-not-allowed"
                />
              </div>

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
                  disabled={mode === 'edit' || isSubmitting}
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

              <div className="py-2">
                <div className="mb-2">
                  <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
                    내용
                  </span>
                </div>

                <textarea
                  value={form.content}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      content: event.target.value,
                    }))
                  }
                  placeholder="공유할 정보를 입력해주세요"
                  className="thin-scrollbar min-h-[360px] w-full resize-none rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-4 py-3 text-[#2C2C2C] placeholder:text-[#989898] focus:ring-2 focus:ring-[#5E92F0] focus:outline-none disabled:cursor-not-allowed"
                />
              </div>

              <div className="mt-6 mb-8 flex justify-center gap-2">
                {mode === 'edit' && onDelete && (
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={isSubmitting}
                    className="cursor-pointer rounded-2xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-8 py-2 font-semibold text-[#E22222] transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    삭제
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSubmitClick}
                  disabled={isSubmitting}
                  className="cursor-pointer rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#5E92F0] px-8 py-2 font-semibold text-white transition-all duration-150 hover:bg-[#5C86EB] active:scale-95 disabled:cursor-not-allowed disabled:bg-[#B8C8F2]"
                >
                  {isSubmitting
                    ? '처리 중'
                    : mode === 'create'
                      ? '등록'
                      : '수정'}
                </button>
              </div>
            </div>
          </div>
        </Card>
      </section>

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
                disabled={isSubmitting}
                className="flex-1 cursor-pointer rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-2 font-semibold transition-all duration-150 active:scale-95"
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleCreateConfirm}
                disabled={isSubmitting}
                className="flex-1 cursor-pointer rounded-xl bg-[#5E92F0] py-3 font-semibold text-white transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:bg-[#B8C8F2]"
              >
                {isSubmitting ? '생성 중' : '생성'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

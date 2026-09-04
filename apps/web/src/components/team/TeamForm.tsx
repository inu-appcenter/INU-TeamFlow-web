'use client';

import Card from '@/components/main/Card';
import { ChevronLeft, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { getPresignedUrl } from '@moimi/core/api/team';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useRouter } from 'next/navigation';
import {
  categoryMap,
  categoryColorMap,
  DEFAULT_CATEGORY_COLOR,
} from '@moimi/core/constants/category';
import { darkenColor } from '@/utils/color/darkenColor';

export type TeamFormData = {
  name: string;
  category: 'CONTEST' | 'STUDY' | 'CLUB' | 'PROJECT' | 'ETC';
  description: string;
  link: string;
  sns: string;
  imageUrl: string;
};

type TeamFormProps = {
  mode: 'create' | 'edit';
  initialData?: TeamFormData;
  onSubmit: (data: TeamFormData) => Promise<void>;
  onDelete?: () => void;
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
      className="min-h-[90px] w-full resize-none rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-4 py-3 focus:ring-2 focus:ring-[#5E92F0] focus:outline-none"
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

export default function TeamForm({
  mode,
  initialData,
  onSubmit,
  onDelete,
}: TeamFormProps) {
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialData?.imageUrl ?? null
  );
  const { errorMessage, showErrorMessage } = useErrorToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [form, setForm] = useState<TeamFormData>(
    initialData ?? {
      name: '',
      category: 'ETC',
      description: '',
      link: '',
      sns: '',
      imageUrl: '',
    }
  );

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 미리보기
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      // 1. presigned URL 발급
      const { uploadUrl, imageKey } = await getPresignedUrl({
        fileName: file.name,
        contentType: file.type,
      });

      // 2. S3에 직접 업로드
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      // 3. imageKey 저장
      setForm((prev) => ({ ...prev, imageUrl: imageKey }));
    } catch (err) {
      console.error('이미지 업로드 실패', err);
    }
  };

  const onChange = (key: keyof TeamFormData, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const currentColor =
    categoryColorMap[form.category] ?? DEFAULT_CATEGORY_COLOR;

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
              onClick={() => router.back()}
              className="cursor-pointer text-[#2C2C2C]"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>

            <span className="rounded-full bg-white/80 px-5 py-2 text-sm font-semibold text-[#2C2C2C]">
              {categoryMap[form.category]}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pt-10 pb-6">
            <div className="mx-auto max-w-[600px]">
              <section>
                <div className="mb-2 text-sm font-bold tracking-wide text-[#B0B0B0]">
                  팀 이미지
                </div>
                <div className="flex justify-between">
                  <div className="relative">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="mb-2 flex h-[160px] w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#D6DDE5]/60 bg-[#F6F8FA]"
                    >
                      {previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewUrl}
                          alt="팀 이미지"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Upload className="text-[#9C9C9C]" />
                      )}
                    </div>

                    {previewUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();

                          setPreviewUrl(null);

                          setForm((prev) => ({
                            ...prev,
                            imageUrl: '',
                          }));

                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#989898]/50 text-white"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </section>

              <p className="mb-4 flex items-center text-[10px] text-[#b0b0b0]">
                이미지를 선택하지 않으면 기본 이미지가 적용됩니다
              </p>

              <section className="mb-16">
                <div className="mb-2 text-sm font-bold tracking-wide text-[#B0B0B0]">
                  카테고리
                </div>

                <div className="mb-3 flex flex-wrap gap-2.5">
                  {Object.keys(categoryMap).map((key) => {
                    const typedKey = key as keyof typeof categoryMap;

                    const isSelected = form.category === typedKey;

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => onChange('category', typedKey)}
                        className={`cursor-pointer rounded-2xl border-[0.5px] px-4 py-2 text-sm transition-all duration-150 ${
                          isSelected
                            ? 'font-semibold opacity-100'
                            : 'border-[#D6DDE5]/40 bg-[#EEF1F5]'
                        }`}
                        style={
                          isSelected
                            ? {
                                backgroundColor: categoryColorMap[typedKey],
                                borderColor: darkenColor(
                                  categoryColorMap[typedKey],
                                  30
                                ),
                                color: darkenColor(
                                  categoryColorMap[typedKey],
                                  140
                                ),
                              }
                            : undefined
                        }
                      >
                        {categoryMap[typedKey]}
                      </button>
                    );
                  })}
                </div>

                <InputField
                  label="팀 이름"
                  required
                  value={form.name}
                  onChange={(e) => onChange('name', e.target.value)}
                />
                <TextAreaField
                  label="팀 소개"
                  required
                  maxLength={50}
                  value={form.description}
                  onChange={(e) => onChange('description', e.target.value)}
                />
                <InputField
                  label="팀 링크"
                  value={form.link}
                  onChange={(e) => onChange('link', e.target.value)}
                />

                <InputField
                  label="팀 SNS"
                  value={form.sns}
                  onChange={(e) => onChange('sns', e.target.value)}
                />
                <div className="mt-6 flex justify-center">
                  <div className="flex gap-4">
                    {mode === 'edit' && onDelete && (
                      <button
                        onClick={onDelete}
                        className="cursor-pointer rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-10 py-2 font-medium text-[#E22222]"
                      >
                        삭제
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        if (!form.name.trim()) {
                          showErrorMessage('팀 이름을 입력해주세요');
                          return;
                        }

                        if (!form.description.trim()) {
                          showErrorMessage('팀 소개를 입력해주세요');
                          return;
                        }

                        if (mode === 'create') {
                          setIsConfirmOpen(true);
                        } else {
                          await onSubmit(form);
                        }
                      }}
                      className="cursor-pointer rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#5E92F0] px-10 py-2 text-base font-medium text-white"
                    >
                      {mode === 'create' ? '생성' : '수정'}
                    </button>
                  </div>
                </div>
              </section>
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
              새 팀을 생성할까요?
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
                  await onSubmit(form);
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

'use client';

import Card from '@/components/main/Card';
import { ChevronLeft, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

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
      className="mb-3 w-full max-w-[400px] rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-4 py-2 focus:ring-2 focus:ring-[#5E92F0] focus:outline-none"
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
      className="min-h-[90px] w-full max-w-[400px] resize-none rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-4 py-3 focus:ring-2 focus:ring-[#5E92F0] focus:outline-none"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
    />

    {maxLength && (
      <div className="max-w-[400px] text-right text-xs text-[#B0B0B0]">
        {value.length}/{maxLength}
      </div>
    )}
  </div>
);

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
}: TeamFormProps) {
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
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

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);

    setTimeout(() => {
      setErrorMessage('');
    }, 1800);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const url = URL.createObjectURL(file);

    setPreviewUrl(url);

    setForm((prev) => ({
      ...prev,
      imageKey: file.name,
    }));
  };

  const onChange = (key: keyof TeamFormData, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const currentColor = categoryColorMap[form.category] ?? DEFAULT_COLOR;

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

          <div className="flex-1 overflow-y-auto p-6">
            <section className="flex items-start justify-between">
              <div className="relative">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="mb-2 flex h-[160px] w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA]"
                >
                  {previewUrl ? (
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
                        imageKey: '',
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

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />

              <button
                onClick={() => {
                  if (!form.name.trim()) {
                    showErrorMessage('팀 이름을 입력해주세요');
                    return;
                  }

                  if (!form.description.trim()) {
                    showErrorMessage('팀 소개를 입력해주세요');
                    return;
                  }

                  setIsConfirmOpen(true);
                }}
                className="cursor-pointer rounded-2xl border-[0.5px] border-[#D6DDE5] bg-[#5E92F0] px-6 py-2 font-semibold text-white"
              >
                {mode === 'create' ? '생성' : '수정'}
              </button>
            </section>

            <p className="mb-4 text-[10px] text-[#b0b0b0]">
              이미지를 선택하지 않으면 기본 이미지가 적용됩니다
            </p>

            <section className="mb-30">
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
                      className={`cursor-pointer rounded-full border-[0.5px] px-4 py-2 text-sm transition-all duration-150 ${
                        isSelected ? '' : 'border-[#D6DDE5] bg-[#EEF1F5]'
                      }`}
                      style={
                        isSelected
                          ? {
                              backgroundColor: categoryColorMap[typedKey],
                              borderColor: categoryBorderColorMap[typedKey],
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
            </section>
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
              {mode === 'create'
                ? '새 팀을 생성할까요?'
                : '팀 정보를 수정할까요?'}
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
                {mode === 'create' ? '생성' : '수정'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// src/app/mypage/inquiry/page.tsx
'use client';

import Card from '@/components/main/Card';
import { ChevronLeft, CheckCircle2, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useErrorToast } from '@/hooks/useErrorToast';
import { motion, AnimatePresence } from 'motion/react';

const INQUIRY_CATEGORIES = [
  { value: 'SERVICE', label: '서비스 이용' },
  { value: 'BUG', label: '오류 / 버그 신고' },
  { value: 'TEAM', label: '팀 / 모집 관련' },
  { value: 'ACCOUNT', label: '계정 관련' },
  { value: 'ETC', label: '기타' },
] as const;

type CategoryValue = (typeof INQUIRY_CATEGORIES)[number]['value'];

type InquiryFormData = {
  category: CategoryValue | '';
  title: string;
  content: string;
};

const TITLE_MAX = 40;
const CONTENT_MAX = 1000;

export default function InquiryPage() {
  const router = useRouter();
  const { errorMessage, showErrorMessage } = useErrorToast();

  const [form, setForm] = useState<InquiryFormData>({
    category: '',
    title: '',
    content: '',
  });
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const selectedCategory = INQUIRY_CATEGORIES.find(
    (c) => c.value === form.category
  );

  const onChange = (key: keyof InquiryFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.category) {
      showErrorMessage('문의 유형을 선택해주세요');
      return;
    }
    if (!form.title.trim()) {
      showErrorMessage('제목을 입력해주세요');
      return;
    }
    if (!form.content.trim()) {
      showErrorMessage('내용을 입력해주세요');
      return;
    }

    // TODO: 백엔드 연동 시 실제 문의 등록 API 호출로 교체
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setForm({ category: '', title: '', content: '' });
    setIsSubmitted(false);
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

          {/* 헤더 */}
          <div
            className="flex h-[72px] items-center justify-between px-6"
            style={{ backgroundColor: '#E9e9e9' }}
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
              {isSubmitted ? (
                <div className="flex flex-col items-center py-20 text-center">
                  <CheckCircle2
                    size={48}
                    strokeWidth={1.5}
                    className="text-[#5E92F0]"
                  />
                  <h1 className="mt-5 text-xl font-bold text-[#2C2C2C]">
                    문의가 접수됐어요
                  </h1>
                  <p className="mt-2 text-[14px] leading-6 text-[#989898] sm:text-[15px]">
                    남겨주신 문의는 순서대로 확인 후 답변드릴게요.
                    <br />
                    답변은 마이페이지에서 확인하실 수 있어요.
                  </p>

                  <div className="mt-8 flex gap-3">
                    <button
                      onClick={handleReset}
                      className="cursor-pointer rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-6 py-2 font-semibold text-[#2C2C2C]"
                    >
                      문의 더 남기기
                    </button>
                    <button
                      onClick={() => router.push('/mypage')}
                      className="cursor-pointer rounded-xl bg-[#5E92F0] px-6 py-2 font-semibold text-white transition hover:bg-[#5C86EB]"
                    >
                      마이페이지로
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="pt-2 text-[24px] font-bold text-[#2C2C2C] sm:text-3xl">
                    문의하기
                  </h1>
                  <p className="mt-2 mb-6 text-[13px] text-[#989898] sm:text-[15px]">
                    궁금한 점이나 불편했던 점을 남겨주시면 확인 후 답변드릴게요.
                  </p>

                  {/* 문의 유형 */}
                  <div className="relative py-2">
                    <div className="mb-2 flex items-center gap-1">
                      <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
                        문의 유형
                      </span>
                      <span className="text-sm font-semibold text-[#FF6B6B]">
                        *
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsCategoryOpen((prev) => !prev)}
                      className="flex h-[42px] w-full cursor-pointer items-center justify-between rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-4 text-left transition focus:ring-2 focus:ring-[#5E92F0] focus:outline-none"
                    >
                      <span
                        className={
                          selectedCategory ? 'text-[#2C2C2C]' : 'text-[#989898]'
                        }
                      >
                        {selectedCategory
                          ? selectedCategory.label
                          : '유형을 선택해주세요'}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`shrink-0 text-[#989898] transition-transform duration-200 ${
                          isCategoryOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isCategoryOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setIsCategoryOpen(false)}
                        />
                        <AnimatePresence>
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 30,
                            }}
                            className="absolute top-[85px] left-0 z-20 w-full origin-top rounded-2xl border-[0.5px] border-[#D6DDE5] bg-white p-2 shadow-[2px_2px_15px_0px_rgba(149,157,165,0.20)]"
                          >
                            {INQUIRY_CATEGORIES.map((c) => (
                              <button
                                key={c.value}
                                type="button"
                                onClick={() => {
                                  onChange('category', c.value);
                                  setIsCategoryOpen(false);
                                }}
                                className={`flex w-full items-center justify-between rounded-xl px-4 py-2 text-left transition hover:bg-[#F6F8FA] ${
                                  form.category === c.value
                                    ? 'bg-[#EEF1F5]'
                                    : ''
                                }`}
                              >
                                <span className="text-[#2C2C2C]">
                                  {c.label}
                                </span>
                                <div
                                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                                    form.category === c.value
                                      ? 'border-[#5E92F0]'
                                      : 'border-[#D6DDE5]'
                                  }`}
                                >
                                  {form.category === c.value && (
                                    <div className="h-2 w-2 rounded-full bg-[#5E92F0]" />
                                  )}
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        </AnimatePresence>
                      </>
                    )}
                  </div>

                  {/* 제목 */}
                  <div className="py-2">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
                          제목
                        </span>
                        <span className="text-sm font-semibold text-[#FF6B6B]">
                          *
                        </span>
                      </div>
                    </div>
                    <input
                      required
                      value={form.title}
                      onChange={(e) =>
                        onChange('title', e.target.value.slice(0, TITLE_MAX))
                      }
                      placeholder="문의 제목을 입력해주세요"
                      className="h-[42px] w-full rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-4 text-[#2c2c2c] placeholder:text-[#989898] focus:ring-2 focus:ring-[#5E92F0] focus:outline-none"
                    />
                  </div>

                  {/* 내용 */}
                  <div className="py-2">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold tracking-wider text-[#B0B0B0]">
                          내용
                        </span>
                        <span className="text-sm font-semibold text-[#FF6B6B]">
                          *
                        </span>
                      </div>
                    </div>
                    <textarea
                      required
                      value={form.content}
                      onChange={(e) =>
                        onChange(
                          'content',
                          e.target.value.slice(0, CONTENT_MAX)
                        )
                      }
                      maxLength={CONTENT_MAX}
                      placeholder="문의 내용을 자세히 남겨주시면 더 빠르게 도와드릴 수 있어요"
                      className="thin-scrollbar min-h-[220px] w-full resize-none rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-4 py-3 text-[#2c2c2c] placeholder:text-[#989898] focus:ring-2 focus:ring-[#5E92F0] focus:outline-none"
                    />
                  </div>

                  <div className="mt-6 mb-8 flex justify-center">
                    <button
                      onClick={handleSubmit}
                      className="cursor-pointer rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#5E92F0] px-8 py-2 font-semibold text-white transition hover:bg-[#5C86EB]"
                    >
                      문의 남기기
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}

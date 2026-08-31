// src/app/mypage/inquiry/page.tsx
'use client';

import Card from '@/components/main/Card';
import {
  ChevronLeft,
  CheckCircle2,
  ChevronDown,
  SquarePen,
  History,
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useCreateInquiry, useCancelInquiry } from '@/hooks/useCreateInquiry';
import { useMyInquiries, useMyInquiryDetail } from '@/hooks/useMyInquiries';
import { motion, AnimatePresence } from 'motion/react';
import { INQUIRY_TYPE_LABEL, type InquiryType } from '@/types/inquiry';

const INQUIRY_CATEGORIES: { value: InquiryType; label: string }[] = [
  { value: 'ACCOUNT', label: '계정 관련' },
  { value: 'BUG', label: '오류 / 버그 신고' },
  { value: 'SUGGESTION', label: '기능 제안' },
  { value: 'ETC', label: '기타' },
];

type InquiryFormData = {
  category: InquiryType | '';
  content: string;
};

const CONTENT_MAX = 1000;

type ViewValue = 'MENU' | 'CREATE' | 'HISTORY';

// 상세 모달. 답변이 없으면 안내 문구, 있으면 답변 내용을 그대로 보여줌 (읽기 전용).
function InquiryDetailModal({
  inquiryId,
  onClose,
}: {
  inquiryId: number;
  onClose: () => void;
}) {
  const { data: detail, isLoading } = useMyInquiryDetail(inquiryId);
  const { mutate: cancelInquiryMutate, isPending: isCancelling } =
    useCancelInquiry();
  const { errorMessage, showErrorMessage } = useErrorToast();
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  const handleCancel = () => {
    cancelInquiryMutate(inquiryId, {
      onSuccess: () => {
        setIsCancelConfirmOpen(false);
        onClose();
      },
      onError: () => {
        setIsCancelConfirmOpen(false);
        showErrorMessage('문의 취소에 실패했어요');
      },
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4"
    >
      {errorMessage && (
        <div className="animate-modal-pop fixed top-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
          {errorMessage}
        </div>
      )}

      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        className="flex max-h-[85vh] w-full max-w-[520px] flex-col overflow-hidden rounded-3xl bg-white shadow-xl"
      >
        {isLoading || !detail ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-[#9C9C9C]">
            불러오는 중...
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b-[0.5px] border-[#D6DDE5] px-5 py-4">
              <span className="w-fit rounded-full bg-[#EEF1F5] px-2.5 py-1 text-[12px] font-semibold text-[#5E92F0]">
                {INQUIRY_TYPE_LABEL[detail.type]}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  detail.status === 'PENDING'
                    ? 'bg-[#FFDDDD] text-[#B32424]'
                    : 'bg-[#DDF7E5] text-[#2F8F4E]'
                }`}
              >
                {detail.status === 'PENDING' ? '대기중' : '답변완료'}
              </span>
            </div>

            <div className="thin-scrollbar flex-1 overflow-y-auto px-6 py-4">
              <p className="text-xs text-[#9C9C9C]">
                {detail.createdAt.slice(0, 10)} 문의
              </p>

              <p className="mt-3 rounded-xl bg-[#F6F8FA] px-4 py-3 text-sm leading-6 whitespace-pre-wrap text-[#2C2C2C]">
                {detail.detail}
              </p>

              <div className="mt-5">
                <div className="mb-2 text-xs font-medium text-[#B0B0B0]">
                  답변
                </div>
                {detail.answer ? (
                  <>
                    <p className="rounded-xl bg-[#EEF3FE] px-4 py-3 text-sm leading-6 whitespace-pre-wrap text-[#2C2C2C]">
                      {detail.answer}
                    </p>
                    {detail.answeredAt && (
                      <p className="mt-2 text-xs text-[#9C9C9C]">
                        {detail.answeredAt.slice(0, 10)} 답변됨
                      </p>
                    )}
                  </>
                ) : (
                  <p className="rounded-xl bg-[#F6F8FA] px-4 py-3 text-sm text-[#9C9C9C]">
                    아직 답변이 등록되지 않았어요
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 border-t-[0.5px] border-[#D6DDE5] px-6 py-4">
              {detail.status === 'PENDING' && (
                <button
                  onClick={() => setIsCancelConfirmOpen(true)}
                  disabled={isCancelling}
                  className="flex-1 cursor-pointer rounded-xl border-[0.5px] border-[#F2C6C6] bg-[#FDEEEE] py-2.5 text-sm font-semibold text-[#E22222] transition disabled:opacity-50"
                >
                  문의 취소
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 cursor-pointer rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] py-2.5 text-sm font-semibold text-[#2C2C2C]"
              >
                닫기
              </button>
            </div>
          </>
        )}
      </motion.div>

      {isCancelConfirmOpen && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsCancelConfirmOpen(false);
          }}
          className="fixed inset-0 z-[310] flex items-center justify-center bg-black/40"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-modal-pop w-[340px] rounded-3xl bg-white p-4 shadow-xl"
          >
            <h2 className="text-center text-lg font-bold text-[#2C2C2C]">
              문의를 취소할까요?
            </h2>
            <p className="mt-2 text-center text-sm text-[#989898]">
              취소한 문의는 다시 볼 수 없어요
            </p>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setIsCancelConfirmOpen(false)}
                className="flex-1 cursor-pointer rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-2 font-semibold text-[#2C2C2C] transition-all duration-200 active:scale-95"
              >
                아니요
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1 cursor-pointer rounded-xl bg-[#E22222] py-2.5 font-semibold text-white transition-all duration-200 active:scale-95 disabled:opacity-50"
              >
                {isCancelling ? '취소 중...' : '취소하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InquiryHistoryList() {
  const { data: inquiries, isLoading } = useMyInquiries();
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(
    null
  );

  return (
    <div className="py-2">
      {isLoading && (
        <div className="flex h-[200px] items-center justify-center text-sm text-[#9C9C9C]">
          불러오는 중...
        </div>
      )}

      {!isLoading && inquiries && inquiries.length === 0 && (
        <div className="flex h-[200px] flex-col items-center justify-center text-sm text-[#9C9C9C]">
          아직 남긴 문의가 없어요
        </div>
      )}

      {!isLoading && inquiries && inquiries.length > 0 && (
        <div className="overflow-hidden rounded-2xl border-[0.5px] border-[#D6DDE5]/40">
          {inquiries.map((inquiry, index) => (
            <button
              key={inquiry.inquiryId}
              type="button"
              onClick={() => setSelectedInquiryId(inquiry.inquiryId)}
              className={`flex w-full cursor-pointer items-center justify-between gap-4 bg-[#F6F8FA] px-5 py-4 text-left transition ${
                index !== 0 ? 'border-t-[0.5px] border-[#D6DDE5]/40' : ''
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-xs font-semibold text-[#5E92F0]">
                    {INQUIRY_TYPE_LABEL[inquiry.type]}
                  </span>
                  <span className="truncate text-sm text-[#2C2C2C]">
                    {inquiry.detail}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#9C9C9C]">
                  {inquiry.createdAt.slice(0, 10)}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  inquiry.status === 'PENDING'
                    ? 'bg-[#FFDDDD] text-[#B32424]'
                    : 'bg-[#DDF7E5] text-[#2F8F4E]'
                }`}
              >
                {inquiry.status === 'PENDING' ? '대기중' : '답변완료'}
              </span>
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedInquiryId !== null && (
          <InquiryDetailModal
            inquiryId={selectedInquiryId}
            onClose={() => setSelectedInquiryId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function InquiryPage() {
  const router = useRouter();
  const { errorMessage, showErrorMessage } = useErrorToast();
  const { mutate: createInquiry, isPending } = useCreateInquiry();

  const [view, setView] = useState<ViewValue>('MENU');
  const [form, setForm] = useState<InquiryFormData>({
    category: '',
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

  const handleSubmit = () => {
    if (!form.category) {
      showErrorMessage('문의 유형을 선택해주세요');
      return;
    }
    if (!form.content.trim()) {
      showErrorMessage('내용을 입력해주세요');
      return;
    }

    createInquiry(
      { type: form.category, detail: form.content },
      {
        onSuccess: () => setIsSubmitted(true),
        onError: () => showErrorMessage('문의 등록에 실패했어요'),
      }
    );
  };

  const handleReset = () => {
    setForm({ category: '', content: '' });
    setIsSubmitted(false);
  };

  // 문의하기/문의 내역 화면에서 뒤로가기를 누르면 최초 메뉴 화면으로.
  // 메뉴 화면에서 뒤로가기를 누르면 진짜 이전 페이지로.
  const handleBack = () => {
    if (view === 'MENU') {
      router.back();
      return;
    }
    setIsSubmitted(false);
    setView('MENU');
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
              onClick={handleBack}
              className="cursor-pointer text-[#2C2C2C]"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
          </div>

          {/* 본문 */}
          <div className="flex-1 overflow-y-auto px-8 py-8 sm:px-10">
            <div className="mx-auto max-w-[650px]">
              {view === 'MENU' && (
                <>
                  <h1 className="pt-2 text-[24px] font-bold text-[#2C2C2C] sm:text-3xl">
                    문의하기
                  </h1>
                  <p className="mt-2 mb-6 text-[13px] text-[#989898] sm:text-[15px]">
                    궁금한 점이나 불편했던 점을 남겨주시면 확인 후 답변드릴게요.
                  </p>

                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => setView('CREATE')}
                      className="flex min-h-[90px] w-full cursor-pointer items-center gap-4 rounded-2xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-5 text-left transition-all duration-150 hover:bg-[#F6F8FA]/50 active:scale-[0.95]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#5E92F0]">
                        <SquarePen size={18} strokeWidth={2} />
                      </span>

                      <span className="text-[17px] font-medium text-[#2C2C2C]">
                        문의 남기기
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setView('HISTORY')}
                      className="flex min-h-[90px] w-full cursor-pointer items-center gap-4 rounded-2xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-5 text-left transition-all duration-150 hover:bg-[#F6F8FA]/50 active:scale-[0.95]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#5E92F0]">
                        <History size={18} strokeWidth={2} />
                      </span>

                      <span className="text-[17px] font-medium text-[#2C2C2C]">
                        문의 내역 보기
                      </span>
                    </button>
                  </div>
                </>
              )}

              {view === 'HISTORY' && <InquiryHistoryList />}

              {view === 'CREATE' &&
                (isSubmitted ? (
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
                      답변은 문의 내역에서 확인하실 수 있어요.
                    </p>

                    <div className="mt-8 flex gap-3">
                      <button
                        onClick={handleReset}
                        className="cursor-pointer rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-6 py-2 font-semibold text-[#2C2C2C]"
                      >
                        문의 더 남기기
                      </button>
                      <button
                        onClick={() => {
                          setIsSubmitted(false);
                          setView('HISTORY');
                        }}
                        className="cursor-pointer rounded-xl bg-[#5E92F0] px-6 py-2 font-semibold text-white transition hover:bg-[#5C86EB]"
                      >
                        문의 내역 보기
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="pt-2 text-[24px] font-bold text-[#2C2C2C] sm:text-3xl">
                      문의하기
                    </h1>
                    <p className="mt-2 mb-6 text-[13px] text-[#989898] sm:text-[15px]">
                      궁금한 점이나 불편했던 점을 남겨주시면 확인 후
                      답변드릴게요.
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
                        className="flex h-[42px] w-full cursor-pointer items-center justify-between rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-4 text-left transition focus:ring-2 focus:ring-[#5E92F0] focus:outline-none"
                      >
                        <span
                          className={
                            selectedCategory
                              ? 'text-[#2C2C2C]'
                              : 'text-[#989898]'
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
                        <span className="text-xs text-[#989898]">
                          {form.content.length}/{CONTENT_MAX}
                        </span>
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
                        className="thin-scrollbar min-h-[220px] w-full resize-none rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-4 py-3 text-[#2c2c2c] placeholder:text-[#989898] focus:ring-2 focus:ring-[#5E92F0] focus:outline-none"
                      />
                    </div>

                    <div className="mt-6 mb-8 flex justify-center">
                      <button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="cursor-pointer rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#5E92F0] px-8 py-2 font-semibold text-white transition hover:bg-[#5C86EB] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isPending ? '등록 중...' : '문의 남기기'}
                      </button>
                    </div>
                  </>
                ))}
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}

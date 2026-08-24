// src/app/admin/inquiries/page.tsx
'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  X,
} from 'lucide-react';
import Card from '@/components/main/Card';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

// ---- 타입 (백엔드 연동 시 types/admin.ts 같은 곳으로 이동 예정) ----
type InquiryCategory = 'SERVICE' | 'BUG' | 'TEAM' | 'ACCOUNT' | 'ETC';
type InquiryStatus = 'PENDING' | 'ANSWERED';

type AdminInquiry = {
  id: number;
  category: InquiryCategory;
  title: string;
  content: string;
  writerName: string;
  createdAt: string;
  status: InquiryStatus;
  answer?: string;
  answeredAt?: string;
};

const INQUIRY_CATEGORY_MAP: Record<InquiryCategory, string> = {
  SERVICE: '서비스 이용',
  BUG: '오류/버그',
  TEAM: '팀/모집',
  ACCOUNT: '계정',
  ETC: '기타',
};

const STATUS_TABS = [
  { value: 'ALL', label: '전체' },
  { value: 'PENDING', label: '대기중' },
  { value: 'ANSWERED', label: '답변완료' },
] as const;

type StatusTabValue = (typeof STATUS_TABS)[number]['value'];

const PAGE_SIZE = 15;
const PAGE_WINDOW_SIZE = 5;

// ---- 더미 데이터 (백엔드 연동 시 useAdminInquiries 훅으로 교체) ----
const DUMMY_INQUIRIES: AdminInquiry[] = Array.from({ length: 23 }, (_, i) => {
  const categories: InquiryCategory[] = [
    'SERVICE',
    'BUG',
    'TEAM',
    'ACCOUNT',
    'ETC',
  ];
  const isAnswered = i % 3 === 0;
  return {
    id: i + 1,
    category: categories[i % categories.length],
    title: `문의드립니다 - 케이스 ${i + 1}`,
    content:
      '팀 모집글에서 지원자 목록이 제대로 안 보이는 것 같아요. 새로고침해도 동일합니다. 확인 부탁드려요.',
    writerName: `유저${(i % 9) + 1}`,
    createdAt: `2026-08-${String((i % 27) + 1).padStart(2, '0')}`,
    status: isAnswered ? 'ANSWERED' : 'PENDING',
    answer: isAnswered
      ? '확인 후 안내드릴게요. 현재 파악 중입니다.'
      : undefined,
    answeredAt: isAnswered
      ? `2026-08-${String((i % 27) + 2).padStart(2, '0')}`
      : undefined,
  };
});

export default function AdminInquiriesPage() {
  const [statusTab, setStatusTab] = useState<StatusTabValue>('ALL');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState<AdminInquiry | null>(
    null
  );
  const [searchType, setSearchType] = useState<'title' | 'writer'>('title');
  const [replyDraft, setReplyDraft] = useState('');

  useLockBodyScroll(!!selectedInquiry);

  const filtered = useMemo(() => {
    return DUMMY_INQUIRIES.filter((inquiry) => {
      const matchesStatus = statusTab === 'ALL' || inquiry.status === statusTab;
      const trimmedKeyword = keyword.trim();
      const matchesKeyword =
        trimmedKeyword === '' ||
        (searchType === 'title'
          ? inquiry.title.includes(trimmedKeyword)
          : inquiry.writerName.includes(trimmedKeyword));
      return matchesStatus && matchesKeyword;
    });
  }, [statusTab, keyword, searchType]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const currentPage = totalPages === 0 ? 1 : Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const blockStart =
    Math.floor((currentPage - 1) / PAGE_WINDOW_SIZE) * PAGE_WINDOW_SIZE + 1;
  const blockEnd = Math.min(blockStart + PAGE_WINDOW_SIZE - 1, totalPages);
  const visiblePages = Array.from(
    { length: blockEnd - blockStart + 1 },
    (_, i) => blockStart + i
  );

  const pendingCount = DUMMY_INQUIRIES.filter(
    (i) => i.status === 'PENDING'
  ).length;

  const handleOpenInquiry = (inquiry: AdminInquiry) => {
    setSelectedInquiry(inquiry);
    setReplyDraft(inquiry.answer ?? '');
  };

  const handleSubmitReply = () => {
    if (!selectedInquiry || !replyDraft.trim()) return;
    // TODO: 백엔드 연동 시 답변 등록 API 호출로 교체
    setSelectedInquiry(null);
    setReplyDraft('');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#2C2C2C]">문의 관리</h1>
      <p className="mt-1 text-sm text-[#9C9C9C]">
        대기중인 문의 {pendingCount}건이 있어요
      </p>

      <Card className="mt-4 p-0">
        {/* 상태 탭 */}
        <div className="relative flex border-b-[0.5px] border-[#D6DDE5]">
          {STATUS_TABS.map((tab) => {
            const isActive = statusTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setStatusTab(tab.value);
                  setPage(1);
                }}
                className={`relative cursor-pointer px-10 pt-4 pb-3.5 text-base font-semibold transition ${
                  isActive
                    ? 'text-[#5E92F0]'
                    : 'text-[#9C9C9C] hover:text-[#2C2C2C]'
                }`}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="adminInquiryStatusIndicator"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-[#5E92F0]"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* 검색 */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-9 w-full max-w-[400px] flex-1 items-center overflow-hidden rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA]">
            <div className="relative h-full shrink-0">
              <select
                value={searchType}
                onChange={(e) => {
                  setSearchType(e.target.value as 'title' | 'writer');
                  setPage(1);
                }}
                className="h-full appearance-none border-r-[0.5px] border-[#D6DDE5] bg-transparent px-4 pr-8 text-sm text-[#2C2C2C] outline-none"
              >
                <option value="title">제목</option>
                <option value="writer">작성자</option>
              </select>
              <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[#2C2C2C]">
                <ChevronDown size={14} />
              </span>
            </div>

            <div className="flex flex-1 items-center gap-2 px-3">
              <Search size={16} className="shrink-0 text-[#9C9C9C]" />
              <input
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
                placeholder={'검색어를 입력하세요'}
                className="min-w-0 flex-1 bg-transparent text-sm text-[#2C2C2C] outline-none placeholder:text-[#9C9C9C]"
              />
            </div>
          </div>
        </div>

        {/* 목록 헤더 */}
        <div className="grid grid-cols-[100px_1fr_100px_130px_60px] items-center gap-3 border-b-[0.5px] border-[#D6DDE5] px-6 pb-2.5 text-xs font-medium text-[#9C9C9C]">
          <span>유형</span>
          <span>제목</span>
          <span>작성자</span>
          <span>작성일</span>
          <span className="text-center">상태</span>
        </div>

        {/* 목록 */}
        <div>
          {pageItems.length === 0 && (
            <div className="flex h-[200px] items-center justify-center text-sm text-[#9C9C9C]">
              해당하는 문의가 없어요
            </div>
          )}

          {pageItems.map((inquiry) => (
            <button
              key={inquiry.id}
              type="button"
              onClick={() => handleOpenInquiry(inquiry)}
              className="grid w-full cursor-pointer grid-cols-[100px_1fr_100px_130px_60px] items-center gap-3 border-b-[0.5px] border-[#F0F2F5] px-6 py-3.5 text-left transition hover:bg-[#F6F8FA]"
            >
              <span className="w-fit rounded-full bg-[#EEF1F5] px-2.5 py-1 text-[12px] font-semibold text-[#5E92F0]">
                {INQUIRY_CATEGORY_MAP[inquiry.category]}
              </span>
              <span className="truncate text-sm text-[#2C2C2C]">
                {inquiry.title}
              </span>
              <span className="truncate text-sm text-[#6B6B6B]">
                {inquiry.writerName}
              </span>
              <span className="text-sm text-[#9C9C9C]">
                {inquiry.createdAt}
              </span>
              <span className="flex justify-center">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    inquiry.status === 'PENDING'
                      ? 'bg-[#FFDDDD] text-[#B32424]'
                      : 'bg-[#DDF7E5] text-[#2F8F4E]'
                  }`}
                >
                  {inquiry.status === 'PENDING' ? '대기중' : '답변완료'}
                </span>
              </span>
            </button>
          ))}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 0 && (
          <div className="flex items-center justify-center gap-2 border-t-[0.5px] border-[#D6DDE5] py-4">
            <button
              type="button"
              onClick={() =>
                setPage(Math.max(1, blockStart - PAGE_WINDOW_SIZE))
              }
              disabled={blockStart === 1}
              className="flex items-center justify-center text-[#2c2c2c]/40 transition-all duration-150 active:scale-90 disabled:opacity-40"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>

            {visiblePages.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`flex items-center justify-center px-1 text-[15px] font-semibold transition-all duration-150 active:scale-90 ${
                  currentPage === n
                    ? 'text-[#5E92F0]'
                    : 'cursor-pointer text-[#2c2c2c]/50'
                }`}
              >
                {n}
              </button>
            ))}

            <button
              type="button"
              onClick={() =>
                setPage(Math.min(totalPages, blockStart + PAGE_WINDOW_SIZE))
              }
              disabled={blockEnd === totalPages}
              className="flex items-center justify-center text-[#2c2c2c]/40 transition-all duration-150 active:scale-90 disabled:opacity-40"
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </Card>

      {/* 상세 + 답변 모달 */}
      <AnimatePresence>
        {selectedInquiry && (
          <div
            onClick={() => setSelectedInquiry(null)}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              className="flex max-h-[85vh] w-full max-w-[560px] flex-col overflow-hidden rounded-3xl bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b-[0.5px] border-[#D6DDE5] px-5 py-4">
                <span className="w-fit rounded-full bg-[#EEF1F5] px-2.5 py-1 text-[12px] font-semibold text-[#5E92F0]">
                  {INQUIRY_CATEGORY_MAP[selectedInquiry.category]}
                </span>
                {selectedInquiry.status === 'ANSWERED' && (
                  <span className="text-sm font-medium text-[#2F8F4E]">
                    {selectedInquiry.answeredAt} 답변 완료
                  </span>
                )}
              </div>

              <div className="thin-scrollbar flex-1 overflow-y-auto px-6 py-3">
                <h2 className="text-lg font-bold text-[#2C2C2C]">
                  {selectedInquiry.title}
                </h2>
                <div className="mt-1 flex items-center gap-1 text-xs text-[#9C9C9C]">
                  <span>{selectedInquiry.writerName}</span>
                  <span>·</span>
                  <span>{selectedInquiry.createdAt}</span>
                </div>

                <p className="mt-3 rounded-xl bg-[#F6F8FA] px-4 py-3 text-sm leading-6 whitespace-pre-wrap text-[#2C2C2C]">
                  {selectedInquiry.content}
                </p>

                <div className="mt-4">
                  <div className="mb-2 flex items-center gap-1">
                    <span className="text-xs font-medium text-[#B0B0B0]">
                      답변
                    </span>
                  </div>
                  <textarea
                    value={replyDraft}
                    onChange={(e) => setReplyDraft(e.target.value)}
                    rows={6}
                    placeholder="답변 내용을 입력해주세요"
                    className="thin-scrollbar w-full resize-none rounded-xl bg-[#F6F8FA] px-4 py-3 text-sm text-[#2C2C2C] outline-none placeholder:text-[#9C9C9C] focus:ring-2 focus:ring-[#5E92F0]"
                  />
                </div>
              </div>

              <div className="flex gap-3 border-t-[0.5px] border-[#D6DDE5] px-6 py-4">
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="flex-1 cursor-pointer rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#EEF1F5] py-2.5 text-sm font-medium text-[#2C2C2C]"
                >
                  닫기
                </button>
                <button
                  onClick={handleSubmitReply}
                  disabled={!replyDraft.trim()}
                  className={`flex-1 cursor-pointer rounded-xl py-2.5 text-sm font-semibold text-white transition ${
                    !replyDraft.trim()
                      ? 'cursor-not-allowed bg-[#EEF1F5] text-[#9C9C9C]'
                      : 'bg-[#5E92F0] hover:bg-[#5C86EB]'
                  }`}
                >
                  {selectedInquiry.status === 'ANSWERED'
                    ? '답변 수정'
                    : '답변 등록'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

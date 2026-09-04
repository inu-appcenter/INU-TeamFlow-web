'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ChevronDown, Search } from 'lucide-react';
import Card from '@/components/main/Card';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import {
  useAdminInquiries,
  useAdminInquiryDetail,
  useHandleAdminInquiry,
} from '@/hooks/admin/useAdminInquiries';
import {
  INQUIRY_TYPE_LABEL,
  type InquiryHandleRequest,
  type InquiryDetailResponse,
  type InquiryStatus,
} from '@moimi/core/types/inquiry';

type InquirySearchType = 'detail' | 'writer';

const STATUS_TABS = [
  { value: 'ALL', label: '전체' },
  { value: 'PENDING', label: '대기중' },
  { value: 'RESOLVED', label: '답변완료' },
] as const;

type StatusTabValue = (typeof STATUS_TABS)[number]['value'];

const PAGE_SIZE = 15;
const PAGE_WINDOW_SIZE = 5;

// 상세를 불러온 뒤에만 렌더되는 폼. detail이 바뀌면(=다른 문의를 열면)
// 부모에서 key={detail.inquiryId}를 줘서 이 컴포넌트를 통째로 리마운트시킴 ->
// useEffect로 setState 동기화할 필요 없이 useState 초기값으로 바로 세팅됨.
function InquiryAnswerForm({
  detail,
  isSubmitting,
  onSubmit,
  onClose,
}: {
  detail: InquiryDetailResponse;
  isSubmitting: boolean;
  onSubmit: (body: InquiryHandleRequest) => void;
  onClose: () => void;
}) {
  const [answer, setAnswer] = useState(detail.answer ?? '');

  const isSubmitDisabled = isSubmitting || !answer.trim();

  const handleSubmit = () => {
    if (isSubmitDisabled) return;
    onSubmit({ answer });
  };

  return (
    <>
      <div className="flex items-center justify-between border-b-[0.5px] border-[#D6DDE5] px-5 py-4">
        <span className="w-fit rounded-full bg-[#EEF1F5] px-2.5 py-1 text-[12px] font-semibold text-[#5E92F0]">
          {INQUIRY_TYPE_LABEL[detail.type]}
        </span>
        {detail.status === 'RESOLVED' && detail.answeredAt && (
          <span className="text-sm font-medium text-[#2F8F4E]">
            {detail.answeredAt.slice(0, 10)} 답변 완료
          </span>
        )}
      </div>

      <div className="thin-scrollbar flex-1 overflow-y-auto px-6 py-3">
        <div className="flex items-center gap-1 text-xs text-[#9C9C9C]">
          <span>{detail.inquirer.name}</span>
          <span>·</span>
          <span>{detail.createdAt.slice(0, 10)}</span>
        </div>

        <p className="mt-2 rounded-xl bg-[#F6F8FA] px-4 py-3 text-sm leading-6 whitespace-pre-wrap text-[#2C2C2C]">
          {detail.detail}
        </p>

        {detail.status === 'RESOLVED' && detail.answeredBy && (
          <p className="mt-2 text-xs text-[#9C9C9C]">
            {detail.answeredBy.name}님이 답변함
          </p>
        )}

        <div className="mt-4">
          <div className="mb-2 flex items-center gap-1">
            <span className="text-xs font-medium text-[#B0B0B0]">답변</span>
          </div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={6}
            placeholder="답변 내용을 입력해주세요"
            className="thin-scrollbar w-full resize-none rounded-xl bg-[#F6F8FA] px-4 py-3 text-sm text-[#2C2C2C] outline-none placeholder:text-[#9C9C9C] focus:ring-2 focus:ring-[#5E92F0]"
          />
        </div>
      </div>

      <div className="flex gap-3 border-t-[0.5px] border-[#D6DDE5] px-6 py-4">
        <button
          onClick={onClose}
          className="flex-1 cursor-pointer rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#EEF1F5] py-2.5 text-sm font-medium text-[#2C2C2C]"
        >
          닫기
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className={`flex-1 cursor-pointer rounded-xl py-2.5 text-sm text-white transition ${
            isSubmitDisabled
              ? 'cursor-not-allowed bg-[#EEF1F5] text-[#9C9C9C]'
              : 'bg-[#5E92F0] hover:bg-[#5C86EB]'
          }`}
        >
          {isSubmitting
            ? '등록 중...'
            : detail.status === 'RESOLVED'
              ? '답변 수정'
              : '답변 등록'}
        </button>
      </div>
    </>
  );
}

export default function AdminInquiriesPage() {
  const [statusTab, setStatusTab] = useState<StatusTabValue>('ALL');
  const [keyword, setKeyword] = useState('');
  const [searchType, setSearchType] = useState<InquirySearchType>('detail');
  const [page, setPage] = useState(1);
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(
    null
  );

  useLockBodyScroll(!!selectedInquiryId);

  const trimmedKeyword = keyword.trim();
  // NOTE: 백엔드 /admin/inquiries에 keyword 검색 파라미터가 추가되면 이 분기 지우고
  // 항상 서버 페이지네이션(size: PAGE_SIZE)만 쓰도록 바꿔주세요.
  // 그 전까지는 검색어가 있을 때만 크게 받아와서 프론트에서 필터링+페이지네이션함.
  const isSearching = trimmedKeyword.length > 0;

  const { data, isLoading } = useAdminInquiries({
    page: isSearching ? 0 : page - 1, // 백엔드는 0-based, 화면 표시는 1-based
    size: isSearching ? 1000 : PAGE_SIZE,
    status: statusTab === 'ALL' ? undefined : (statusTab as InquiryStatus),
  });

  const { data: detail, isLoading: isDetailLoading } =
    useAdminInquiryDetail(selectedInquiryId);

  const { mutate: submitHandleInquiry, isPending: isSubmitting } =
    useHandleAdminInquiry();

  const inquiriesPage = data?.inquiries;
  const fetchedItems = inquiriesPage?.content ?? [];
  const pendingCount = data?.summary.pending ?? 0;

  const searchFilteredItems = useMemo(() => {
    if (!isSearching) return fetchedItems;
    return fetchedItems.filter((item) =>
      searchType === 'detail'
        ? item.detail.includes(trimmedKeyword)
        : item.authorName.includes(trimmedKeyword)
    );
  }, [fetchedItems, isSearching, searchType, trimmedKeyword]);

  // 검색 중일 땐 위에서 받은 전체 목록을 프론트에서 잘라서 페이지네이션,
  // 검색 중이 아닐 땐 서버가 이미 잘라준 페이지를 그대로 씀.
  const filteredItems = isSearching
    ? searchFilteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : searchFilteredItems;

  const totalPages = isSearching
    ? Math.max(1, Math.ceil(searchFilteredItems.length / PAGE_SIZE))
    : (inquiriesPage?.totalPages ?? 0);

  const blockStart =
    Math.floor((page - 1) / PAGE_WINDOW_SIZE) * PAGE_WINDOW_SIZE + 1;
  const blockEnd = Math.min(blockStart + PAGE_WINDOW_SIZE - 1, totalPages);
  const visiblePages =
    totalPages === 0
      ? []
      : Array.from(
          { length: blockEnd - blockStart + 1 },
          (_, i) => blockStart + i
        );

  const closeModal = () => setSelectedInquiryId(null);

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
                className={`relative cursor-pointer px-10 pt-3.5 pb-3.5 text-[18px] font-semibold transition ${
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
                  setSearchType(e.target.value as InquirySearchType);
                  setPage(1);
                }}
                className="h-full appearance-none border-r-[0.5px] border-[#D6DDE5] bg-transparent px-4 pr-8 text-sm text-[#2C2C2C] outline-none"
              >
                <option value="detail">내용</option>
                <option value="writer">작성자</option>
              </select>
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#2C2C2C]">
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
                placeholder="검색어를 입력하세요"
                className="min-w-0 flex-1 bg-transparent text-sm text-[#2C2C2C] outline-none placeholder:text-[#9C9C9C]"
              />
            </div>
          </div>
        </div>

        {/* 목록 헤더 */}
        <div className="grid grid-cols-[100px_1fr_100px_130px_60px] items-center gap-3 border-b-[0.5px] border-[#D6DDE5] px-6 pb-2.5 text-xs font-medium text-[#9C9C9C]">
          <span>유형</span>
          <span>내용</span>
          <span>작성자</span>
          <span>작성일</span>
          <span className="text-center">상태</span>
        </div>

        {/* 목록 */}
        <div>
          {isLoading && (
            <div className="flex h-[200px] items-center justify-center text-sm text-[#9C9C9C]">
              불러오는 중...
            </div>
          )}

          {!isLoading && filteredItems.length === 0 && (
            <div className="flex h-[200px] items-center justify-center text-sm text-[#9C9C9C]">
              아직 문의 내역이 없어요
            </div>
          )}

          {!isLoading &&
            filteredItems.map((inquiry) => (
              <button
                key={inquiry.inquiryId}
                type="button"
                onClick={() => setSelectedInquiryId(inquiry.inquiryId)}
                className="grid w-full cursor-pointer grid-cols-[100px_1fr_100px_130px_60px] items-center gap-3 border-b-[0.5px] border-[#F0F2F5] px-6 py-3.5 text-left transition hover:bg-[#F6F8FA]"
              >
                <span className="w-fit rounded-full bg-[#EEF1F5] px-2.5 py-1 text-[12px] font-semibold text-[#5E92F0]">
                  {INQUIRY_TYPE_LABEL[inquiry.type]}
                </span>
                <span className="truncate text-sm text-[#2C2C2C]">
                  {inquiry.detail}
                </span>
                <span className="truncate text-sm text-[#6B6B6B]">
                  {inquiry.authorName}
                </span>
                <span className="text-sm text-[#9C9C9C]">
                  {inquiry.createdAt.slice(0, 10)}
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
                  page === n
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
        {selectedInquiryId !== null && (
          <div
            onClick={closeModal}
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
              {isDetailLoading || !detail ? (
                <div className="flex h-[300px] items-center justify-center text-sm text-[#9C9C9C]">
                  불러오는 중...
                </div>
              ) : (
                <InquiryAnswerForm
                  key={detail.inquiryId}
                  detail={detail}
                  isSubmitting={isSubmitting}
                  onClose={closeModal}
                  onSubmit={(body) =>
                    submitHandleInquiry(
                      { inquiryId: detail.inquiryId, body },
                      { onSuccess: closeModal }
                    )
                  }
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// src/app/admin/reports/page.tsx
'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  Check,
} from 'lucide-react';
import Card from '@/components/main/Card';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

// ---- 타입 (백엔드 연동 시 types/admin.ts로 이동 예정) ----
type ReportTargetType = 'RECRUITMENT' | 'INFO_POST' | 'USER';
type ReportReason = 'SPAM' | 'ABUSE' | 'INAPPROPRIATE' | 'FRAUD' | 'ETC';
type ReportStatus = 'PENDING' | 'RESOLVED';

type PostAction = 'NONE' | 'HIDDEN' | 'DELETED';
type AuthorAction =
  | 'NONE'
  | 'WARNING'
  | 'SUSPEND_3D'
  | 'SUSPEND_7D'
  | 'SUSPEND_30D'
  | 'PERMANENT_BAN';

type ReportSearchType = 'target' | 'author' | 'reporter';

type AdminReport = {
  id: number;
  targetType: ReportTargetType;
  targetTitle: string;
  authorName: string;
  reporterName: string;
  reason: ReportReason;
  content: string;
  createdAt: string;
  status: ReportStatus;
  reply?: string;
  sanctionReason?: string;
  postAction: PostAction;
  authorAction: AuthorAction;
};

const TARGET_TYPE_MAP: Record<ReportTargetType, string> = {
  RECRUITMENT: '모집글',
  INFO_POST: '정보글',
  USER: '유저',
};

const REASON_MAP: Record<ReportReason, string> = {
  SPAM: '스팸/광고',
  ABUSE: '욕설/비방',
  INAPPROPRIATE: '부적절한 콘텐츠',
  FRAUD: '사기/허위정보',
  ETC: '기타',
};

const POST_ACTION_OPTIONS: { value: PostAction; label: string }[] = [
  { value: 'NONE', label: '조치 없음' },
  { value: 'HIDDEN', label: '숨김 처리' },
  { value: 'DELETED', label: '삭제' },
];

const AUTHOR_ACTION_OPTIONS: { value: AuthorAction; label: string }[] = [
  { value: 'NONE', label: '조치 없음' },
  { value: 'WARNING', label: '경고' },
  { value: 'SUSPEND_3D', label: '3일 정지' },
  { value: 'SUSPEND_7D', label: '7일 정지' },
  { value: 'SUSPEND_30D', label: '30일 정지' },
  { value: 'PERMANENT_BAN', label: '영구 정지' },
];

const STATUS_TABS = [
  { value: 'ALL', label: '전체' },
  { value: 'PENDING', label: '대기중' },
  { value: 'RESOLVED', label: '처리완료' },
] as const;

type StatusTabValue = (typeof STATUS_TABS)[number]['value'];

const PAGE_SIZE = 8;
const PAGE_WINDOW_SIZE = 5;

// ---- 더미 데이터 (백엔드 연동 시 useAdminReports 훅으로 교체) ----
const DUMMY_REPORTS: AdminReport[] = Array.from({ length: 19 }, (_, i) => {
  const targetTypes: ReportTargetType[] = ['RECRUITMENT', 'INFO_POST', 'USER'];
  const reasons: ReportReason[] = [
    'SPAM',
    'ABUSE',
    'INAPPROPRIATE',
    'FRAUD',
    'ETC',
  ];
  const isResolved = i % 3 === 0;
  return {
    id: i + 1,
    targetType: targetTypes[i % targetTypes.length],
    targetTitle:
      targetTypes[i % targetTypes.length] === 'USER'
        ? `유저${(i % 9) + 1}`
        : `모집글 제목 예시 ${i + 1}`,
    authorName: `작성자`,
    reporterName: `신고자${(i % 7) + 1}`,
    reason: reasons[i % reasons.length],
    content: '허위 정보로 팀원을 모집하고 있어요. 실제 활동 내역과 다릅니다.',
    createdAt: `2026-08-${String((i % 27) + 1).padStart(2, '0')}`,
    status: isResolved ? 'RESOLVED' : 'PENDING',
    reply: isResolved ? '확인 후 조치했습니다. 신고 감사합니다.' : undefined,
    sanctionReason: isResolved
      ? '커뮤니티 이용 규칙 위반으로 조치되었습니다.'
      : undefined,
    postAction: isResolved ? 'HIDDEN' : 'NONE',
    authorAction: isResolved ? 'WARNING' : 'NONE',
  };
});

function ActionDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <div className="mb-2 text-xs font-medium text-[#B0B0B0]">{label}</div>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-[42px] w-full cursor-pointer items-center justify-between rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-4 text-left text-sm text-[#2C2C2C] transition focus:ring-2 focus:ring-[#5E92F0] focus:outline-none"
      >
        {selected?.label}
        <ChevronDown
          size={16}
          className={`shrink-0 text-[#9C9C9C] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute top-[74px] left-0 z-20 w-full origin-top rounded-2xl border-[0.5px] border-[#D6DDE5] bg-white p-2 shadow-[2px_2px_15px_0px_rgba(149,157,165,0.20)]"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-2 text-left text-sm transition hover:bg-[#F6F8FA] ${
                    value === option.value ? 'bg-[#EEF1F5]' : ''
                  }`}
                >
                  <span className="text-[#2C2C2C]">{option.label}</span>
                  {value === option.value && (
                    <Check size={16} className="text-[#5E92F0]" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminReportsPage() {
  const [statusTab, setStatusTab] = useState<StatusTabValue>('ALL');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(
    null
  );
  const [searchType, setSearchType] = useState<ReportSearchType>('target');
  const [replyDraft, setReplyDraft] = useState('');
  const [sanctionReasonDraft, setSanctionReasonDraft] = useState('');
  const [postAction, setPostAction] = useState<PostAction>('NONE');
  const [authorAction, setAuthorAction] = useState<AuthorAction>('NONE');

  useLockBodyScroll(!!selectedReport);

  const filtered = useMemo(() => {
    return DUMMY_REPORTS.filter((report) => {
      const matchesStatus = statusTab === 'ALL' || report.status === statusTab;
      const trimmedKeyword = keyword.trim();
      const matchesKeyword =
        trimmedKeyword === '' ||
        (searchType === 'target'
          ? report.targetTitle.includes(trimmedKeyword)
          : searchType === 'author'
            ? report.authorName.includes(trimmedKeyword)
            : report.reporterName.includes(trimmedKeyword));
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

  const pendingCount = DUMMY_REPORTS.filter(
    (r) => r.status === 'PENDING'
  ).length;

  const handleOpenReport = (report: AdminReport) => {
    setSelectedReport(report);
    setReplyDraft(report.reply ?? '');
    setSanctionReasonDraft(report.sanctionReason ?? '');
    setPostAction(report.postAction);
    setAuthorAction(report.authorAction);
  };

  const hasAction = postAction !== 'NONE' || authorAction !== 'NONE';

  const isSubmitDisabled =
    !replyDraft.trim() || (hasAction && !sanctionReasonDraft.trim());

  const handleResolve = () => {
    if (!selectedReport || isSubmitDisabled) return;
    // TODO: 백엔드 연동 시 신고 처리 API 호출로 교체
    // { reply, sanctionReason, postAction, authorAction } 전달
    setSelectedReport(null);
    setReplyDraft('');
    setSanctionReasonDraft('');
    setPostAction('NONE');
    setAuthorAction('NONE');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#2C2C2C]">신고 관리</h1>
      <p className="mt-1 text-sm text-[#9C9C9C]">
        대기중인 신고 {pendingCount}건이 있어요
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
                    layoutId="adminReportStatusIndicator"
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
                  setSearchType(e.target.value as ReportSearchType);
                  setPage(1);
                }}
                className="h-full appearance-none border-r-[0.5px] border-[#D6DDE5] bg-transparent px-4 pr-8 text-sm text-[#2C2C2C] outline-none"
              >
                <option value="target">대상</option>
                <option value="author">작성자</option>
                <option value="reporter">신고자</option>
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
                placeholder="검색어를 입력하세요"
                className="min-w-0 flex-1 bg-transparent text-sm text-[#2C2C2C] outline-none placeholder:text-[#9C9C9C]"
              />
            </div>
          </div>
        </div>

        {/* 목록 헤더 */}
        <div className="grid grid-cols-[80px_1fr_100px_100px_130px_60px] items-center gap-3 border-b-[0.5px] border-[#D6DDE5] px-6 pb-2.5 text-xs font-medium text-[#9C9C9C]">
          <span>대상</span>
          <span>신고 대상 / 사유</span>
          <span>작성자</span>
          <span>신고자</span>
          <span>신고일</span>
          <span className="text-center">상태</span>
        </div>

        {/* 목록 */}
        <div>
          {pageItems.length === 0 && (
            <div className="flex h-[200px] items-center justify-center text-sm text-[#9C9C9C]">
              해당하는 신고가 없어요
            </div>
          )}

          {pageItems.map((report) => (
            <button
              key={report.id}
              type="button"
              onClick={() => handleOpenReport(report)}
              className="grid w-full cursor-pointer grid-cols-[80px_1fr_100px_101px_130px_60px] items-center gap-3 border-b-[0.5px] border-[#F0F2F5] px-6 py-2 text-left transition hover:bg-[#F6F8FA]"
            >
              <span className="w-fit rounded-full bg-[#EEF1F5] px-2.5 py-1 text-[12px] font-semibold text-[#5E92F0]">
                {TARGET_TYPE_MAP[report.targetType]}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm text-[#2C2C2C]">
                  {report.targetTitle}
                </p>
                <p className="mt-0.5 text-[11px] text-[#B32424]">
                  {REASON_MAP[report.reason]}
                </p>
              </div>
              <span className="truncate text-sm text-[#6B6B6B]">
                {report.authorName}
              </span>
              <span className="truncate text-sm text-[#6B6B6B]">
                {report.reporterName}
              </span>
              <span className="text-sm text-[#9C9C9C]">{report.createdAt}</span>
              <span className="flex justify-center">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    report.status === 'PENDING'
                      ? 'bg-[#FFDDDD] text-[#B32424]'
                      : 'bg-[#DDF7E5] text-[#2F8F4E]'
                  }`}
                >
                  {report.status === 'PENDING' ? '대기중' : '처리완료'}
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

      {/* 상세 + 조치 모달 */}
      <AnimatePresence>
        {selectedReport && (
          <div
            onClick={() => setSelectedReport(null)}
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
                <div className="flex items-center gap-3">
                  <span className="w-fit rounded-full bg-[#EEF1F5] px-2.5 py-1 text-[12px] font-semibold text-[#5E92F0]">
                    {TARGET_TYPE_MAP[selectedReport.targetType]}
                  </span>
                  <span className="text-[13px] font-semibold text-[#B32424]">
                    {REASON_MAP[selectedReport.reason]}
                  </span>
                </div>
                {selectedReport.status === 'RESOLVED' && (
                  <span className="text-sm font-medium text-[#2F8F4E]">
                    처리 완료
                  </span>
                )}
              </div>

              <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-3">
                <h2 className="text-lg font-bold text-[#2C2C2C]">
                  {selectedReport.targetTitle}
                </h2>
                <div className="mt-1 flex items-center gap-1 text-xs text-[#9C9C9C]">
                  <span>작성자 {selectedReport.authorName}</span>
                  <span>·</span>
                  <span>신고자 {selectedReport.reporterName}</span>
                  <span>·</span>
                  <span>{selectedReport.createdAt}</span>
                </div>

                <p className="mt-3 rounded-xl bg-[#F6F8FA] px-4 py-3 text-sm leading-6 whitespace-pre-wrap text-[#2C2C2C]">
                  {selectedReport.content}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <ActionDropdown
                    label="게시물 조치"
                    value={postAction}
                    options={POST_ACTION_OPTIONS}
                    onChange={setPostAction}
                  />
                  <ActionDropdown
                    label="작성자 조치"
                    value={authorAction}
                    options={AUTHOR_ACTION_OPTIONS}
                    onChange={setAuthorAction}
                  />
                </div>

                {hasAction && (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center gap-1.5">
                      <span className="text-xs font-medium text-[#B0B0B0]">
                        제재 사유
                      </span>
                      <span className="text-xs font-semibold text-[#FF6B6B]">
                        *
                      </span>
                      <span className="text-xs text-[#9C9C9C]">
                        (피신고자 {selectedReport.authorName}님에게 전달돼요)
                      </span>
                    </div>
                    <textarea
                      value={sanctionReasonDraft}
                      onChange={(e) => setSanctionReasonDraft(e.target.value)}
                      rows={4}
                      placeholder="어떤 사유로 어떤 조치를 받았는지 안내해주세요"
                      className="thin-scrollbar w-full resize-none rounded-xl bg-[#FDECEC]/40 px-4 py-3 text-sm text-[#2C2C2C] outline-none placeholder:text-[#9C9C9C] focus:ring-2 focus:ring-[#E22222]"
                    />
                  </div>
                )}

                <div className="mt-4">
                  <div className="mb-2 flex items-center gap-1">
                    <span className="text-xs font-medium text-[#B0B0B0]">
                      신고자에게 보낼 답변
                    </span>
                  </div>
                  <textarea
                    value={replyDraft}
                    onChange={(e) => setReplyDraft(e.target.value)}
                    rows={5}
                    placeholder="처리 결과를 안내하는 답변을 입력해주세요"
                    className="thin-scrollbar w-full resize-none rounded-xl bg-[#F6F8FA] px-4 py-3 text-sm text-[#2C2C2C] outline-none placeholder:text-[#9C9C9C] focus:ring-2 focus:ring-[#5E92F0]"
                  />
                </div>
              </div>

              <div className="flex gap-3 border-t-[0.5px] border-[#D6DDE5] px-6 py-4">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="flex-1 cursor-pointer rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#EEF1F5] py-2.5 text-sm font-medium text-[#2C2C2C]"
                >
                  닫기
                </button>
                <button
                  onClick={handleResolve}
                  disabled={isSubmitDisabled}
                  className={`flex-1 cursor-pointer rounded-xl py-2.5 text-sm font-semibold text-white transition ${
                    isSubmitDisabled
                      ? 'cursor-not-allowed bg-[#EEF1F5] text-[#9C9C9C]'
                      : 'bg-[#5E92F0] hover:bg-[#5C86EB]'
                  }`}
                >
                  {selectedReport.status === 'RESOLVED'
                    ? '처리 내용 수정'
                    : '처리 완료'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

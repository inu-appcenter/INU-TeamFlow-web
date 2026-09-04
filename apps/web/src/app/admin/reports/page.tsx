'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Check,
} from 'lucide-react';
import Card from '@/components/main/Card';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import {
  useAdminReports,
  useAdminReportDetail,
  useHandleAdminReport,
} from '@/hooks/admin/useAdminReports';
import {
  REPORT_TARGET_TYPE_LABEL,
  REPORT_REASON_LABEL,
  type PostActionType,
  type UserActionType,
  type ReportHandleRequest,
  type ReportDetailResponse,
  type ReportStatus,
} from '@moimi/core/types/report';

type ReportSearchType = 'target' | 'reporter';

const POST_ACTION_OPTIONS: { value: PostActionType; label: string }[] = [
  { value: 'NONE', label: '조치 없음(허위 신고)' },
  { value: 'DELETE', label: '게시글 강제 삭제' },
];

const USER_ACTION_OPTIONS: { value: UserActionType; label: string }[] = [
  { value: 'NONE', label: '조치 없음(허위 신고)' },
  { value: 'WARN', label: '경고' },
  { value: 'SUSPEND', label: '정지' },
  { value: 'BAN', label: '영구정지' },
];

const STATUS_TABS = [
  { value: 'ALL', label: '전체' },
  { value: 'PENDING', label: '대기중' },
  { value: 'RESOLVED', label: '처리완료' },
] as const;

type StatusTabValue = (typeof STATUS_TABS)[number]['value'];

const PAGE_SIZE = 15;
const PAGE_WINDOW_SIZE = 5;

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

// 상세를 불러온 뒤에만 렌더되는 폼. detail이 바뀌면(=다른 report를 열면)
// 부모에서 key={detail.reportId}를 줘서 이 컴포넌트를 통째로 리마운트시킴 ->
// useEffect로 setState 동기화할 필요 없이 useState 초기값으로 바로 세팅됨.
function ReportActionForm({
  detail,
  isSubmitting,
  onSubmit,
  onClose,
}: {
  detail: ReportDetailResponse;
  isSubmitting: boolean;
  onSubmit: (body: ReportHandleRequest) => void;
  onClose: () => void;
}) {
  const [postAction, setPostAction] = useState<PostActionType>(
    detail.postAction?.action ?? 'NONE'
  );
  const [postActionDetail, setPostActionDetail] = useState(
    detail.postAction?.detail ?? ''
  );
  const [userAction, setUserAction] = useState<UserActionType>(
    detail.userAction?.action ?? 'NONE'
  );
  const [userActionDetail, setUserActionDetail] = useState(
    detail.userAction?.detail ?? ''
  );
  const [durationDays, setDurationDays] = useState(
    detail.userAction?.durationDays
      ? String(detail.userAction.durationDays)
      : ''
  );

  const isSubmitDisabled =
    isSubmitting ||
    !userActionDetail.trim() ||
    (detail.targetType !== 'USER' && !postActionDetail.trim()) ||
    (userAction === 'SUSPEND' && !(Number(durationDays) > 0));

  const handleSubmit = () => {
    if (isSubmitDisabled) return;
    onSubmit({
      postAction:
        detail.targetType === 'USER'
          ? null
          : { action: postAction, detail: postActionDetail },
      userAction: {
        action: userAction,
        detail: userActionDetail,
        ...(userAction === 'SUSPEND'
          ? { durationDays: Number(durationDays) }
          : {}),
      },
    });
  };

  const modalTitle = detail.targetPost?.title ?? detail.targetUser?.name ?? '';

  return (
    <>
      <div className="flex items-center justify-between border-b-[0.5px] border-[#D6DDE5] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="w-fit rounded-full bg-[#EEF1F5] px-2.5 py-1 text-[12px] font-semibold text-[#5E92F0]">
            {REPORT_TARGET_TYPE_LABEL[detail.targetType]}
          </span>
          <span className="text-[13px] font-semibold text-[#B32424]">
            {REPORT_REASON_LABEL[detail.reason]}
          </span>
        </div>
        {detail.status === 'RESOLVED' && (
          <span className="text-sm font-medium text-[#2F8F4E]">처리 완료</span>
        )}
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-3">
        <h2 className="text-lg font-bold text-[#2C2C2C]">{modalTitle}</h2>
        <div className="mt-1 flex items-center gap-1 text-xs text-[#9C9C9C]">
          {detail.targetUser && (
            <>
              <span>대상 {detail.targetUser.name}</span>
              <span>·</span>
            </>
          )}
          <span>신고자 {detail.reporter.name}</span>
          <span>·</span>
          <span>{detail.createdAt.slice(0, 10)}</span>
        </div>

        <p className="mt-2 rounded-xl bg-[#F6F8FA] px-4 py-3 text-sm leading-6 whitespace-pre-wrap text-[#2C2C2C]">
          {detail.detail}
        </p>

        {detail.status === 'RESOLVED' && detail.handledBy && (
          <p className="mt-2 text-xs text-[#9C9C9C]">
            {detail.handledBy.name}님이 {detail.handledAt?.slice(0, 10)}에
            처리함
          </p>
        )}

        <div
          className={`mt-4 grid gap-3 ${
            detail.targetType === 'USER' ? 'grid-cols-1' : 'grid-cols-2'
          }`}
        >
          {detail.targetType !== 'USER' && (
            <ActionDropdown
              label="게시물 조치"
              value={postAction}
              options={POST_ACTION_OPTIONS}
              onChange={setPostAction}
            />
          )}
          <ActionDropdown
            label="대상자 조치"
            value={userAction}
            options={USER_ACTION_OPTIONS}
            onChange={setUserAction}
          />
        </div>

        {userAction === 'SUSPEND' && (
          <div className="mt-3">
            <div className="mb-2 flex items-center gap-1.5">
              <span className="text-xs font-medium text-[#B0B0B0]">
                정지 기간(일)
              </span>
              <span className="text-xs font-semibold text-[#FF6B6B]">*</span>
            </div>
            <input
              type="number"
              min={1}
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              placeholder="예: 7"
              className="h-[42px] w-full rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-4 text-sm text-[#2C2C2C] outline-none placeholder:text-[#9C9C9C] focus:ring-2 focus:ring-[#5E92F0]"
            />
          </div>
        )}

        {detail.targetType !== 'USER' && (
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-1.5">
              <span className="text-xs font-medium text-[#B0B0B0]">
                게시물 조치 사유
              </span>
              <span className="text-xs font-semibold text-[#FF6B6B]">*</span>
            </div>
            <textarea
              value={postActionDetail}
              onChange={(e) => setPostActionDetail(e.target.value)}
              rows={3}
              placeholder="게시물을 어떻게 처리했는지 적어주세요"
              className="thin-scrollbar w-full resize-none rounded-xl bg-[#F6F8FA] px-4 py-3 text-sm text-[#2C2C2C] outline-none placeholder:text-[#9C9C9C] focus:ring-2 focus:ring-[#5E92F0]"
            />
          </div>
        )}

        <div className="mt-4">
          <div className="mb-2 flex items-center gap-1.5">
            <span className="text-xs font-medium text-[#B0B0B0]">
              대상자 조치 사유
            </span>
            <span className="text-xs font-semibold text-[#FF6B6B]">*</span>
            <span className="text-xs text-[#9C9C9C]">
              (대상자 {detail.targetUser?.name}님에게 전달돼요)
            </span>
          </div>
          <textarea
            value={userActionDetail}
            onChange={(e) => setUserActionDetail(e.target.value)}
            rows={4}
            placeholder="어떤 사유로 어떤 조치를 받았는지 안내해주세요"
            className="thin-scrollbar w-full resize-none rounded-xl bg-[#FDECEC]/40 px-4 py-3 text-sm text-[#2C2C2C] outline-none placeholder:text-[#9C9C9C] focus:ring-2 focus:ring-[#E22222]"
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
            ? '처리 중...'
            : detail.status === 'RESOLVED'
              ? '처리 내용 수정'
              : '처리 완료'}
        </button>
      </div>
    </>
  );
}

export default function AdminReportsPage() {
  const [statusTab, setStatusTab] = useState<StatusTabValue>('ALL');
  const [keyword, setKeyword] = useState('');
  const [searchType, setSearchType] = useState<ReportSearchType>('target');
  const [page, setPage] = useState(1);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  useLockBodyScroll(!!selectedReportId);

  const trimmedKeyword = keyword.replace(/\s/g, '');
  // NOTE: 백엔드 /admin/reports에 keyword 검색 파라미터가 추가되면 이 분기 지우고
  // 항상 서버 페이지네이션(size: PAGE_SIZE)만 쓰도록 바꿔주세요.
  // 그 전까지는 검색어가 있을 때만 크게 받아와서 프론트에서 필터링+페이지네이션함.
  const isSearching = trimmedKeyword.length > 0;

  const { data, isLoading } = useAdminReports({
    page: isSearching ? 0 : page - 1, // 백엔드는 0-based, 화면 표시는 1-based
    size: isSearching ? 1000 : PAGE_SIZE,
    status: statusTab === 'ALL' ? undefined : (statusTab as ReportStatus),
  });

  const { data: detail, isLoading: isDetailLoading } =
    useAdminReportDetail(selectedReportId);

  const { mutate: submitHandleReport, isPending: isSubmitting } =
    useHandleAdminReport();

  const reportsPage = data?.reports;
  const fetchedItems = reportsPage?.content ?? [];
  const pendingCount = data?.summary.pending ?? 0;

  const searchFilteredItems = useMemo(() => {
    if (!isSearching) return fetchedItems;
    return fetchedItems.filter((item) => {
      const target = item.targetName.replace(/\s/g, '');
      const reporter = item.reporterName.replace(/\s/g, '');
      return searchType === 'target'
        ? target.includes(trimmedKeyword)
        : reporter.includes(trimmedKeyword);
    });
  }, [fetchedItems, isSearching, searchType, trimmedKeyword]);

  // 검색 중일 땐 위에서 받은 전체 목록을 프론트에서 잘라서 페이지네이션,
  // 검색 중이 아닐 땐 서버가 이미 잘라준 페이지를 그대로 씀.
  const filteredItems = isSearching
    ? searchFilteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : searchFilteredItems;

  const totalPages = isSearching
    ? Math.max(1, Math.ceil(searchFilteredItems.length / PAGE_SIZE))
    : (reportsPage?.totalPages ?? 0);

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

  const closeModal = () => setSelectedReportId(null);

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
                className={`relative cursor-pointer px-10 pt-3.5 pb-3.5 text-[18px] font-semibold transition ${
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
                <option value="reporter">신고자</option>
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
        <div className="grid grid-cols-[80px_1fr_100px_130px_60px] items-center gap-3 border-b-[0.5px] border-[#D6DDE5] px-6 pb-2.5 text-xs font-medium text-[#9C9C9C]">
          <span>대상</span>
          <span>신고 대상 / 사유</span>
          <span>신고자</span>
          <span>신고일</span>
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
              아직 신고 내역이 없어요
            </div>
          )}

          {!isLoading &&
            filteredItems.map((report) => (
              <button
                key={report.reportId}
                type="button"
                onClick={() => setSelectedReportId(report.reportId)}
                className="grid w-full cursor-pointer grid-cols-[80px_1fr_100px_130px_60px] items-center gap-3 border-b-[0.5px] border-[#F0F2F5] px-6 py-2.5 text-left transition hover:bg-[#F6F8FA]"
              >
                <span className="w-fit rounded-full bg-[#EEF1F5] px-2.5 py-1 text-[12px] font-semibold text-[#5E92F0]">
                  {REPORT_TARGET_TYPE_LABEL[report.targetType]}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm text-[#2C2C2C]">
                    {report.targetName}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#B32424]">
                    {REPORT_REASON_LABEL[report.reason]}
                  </p>
                </div>
                <span className="truncate text-sm text-[#6B6B6B]">
                  {report.reporterName}
                </span>
                <span className="text-sm text-[#9C9C9C]">
                  {report.createdAt.slice(0, 10)}
                </span>
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

      {/* 상세 + 조치 모달 */}
      <AnimatePresence>
        {selectedReportId !== null && (
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
                <ReportActionForm
                  key={detail.reportId}
                  detail={detail}
                  isSubmitting={isSubmitting}
                  onClose={closeModal}
                  onSubmit={(body) =>
                    submitHandleReport(
                      { reportId: detail.reportId, body },
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

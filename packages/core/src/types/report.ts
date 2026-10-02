type PageSort = {
  unsorted: boolean;
  sorted: boolean;
  empty: boolean;
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // 0-based 현재 페이지
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  pageable: {
    paged: boolean;
    pageNumber: number;
    pageSize: number;
    unpaged: boolean;
    offset: number;
    sort: PageSort;
  };
  sort: PageSort;
};

export type ActorRef = {
  userId: number;
  name: string;
};

export type ReportTargetType = 'RECRUITMENT_POST' | 'INFO_POST' | 'USER';

export type ReportReason =
  | 'SPAM'
  | 'ABUSE'
  | 'INAPPROPRIATE'
  | 'FRAUD'
  | 'PRIVACY'
  | 'IMPERSONATION'
  | 'ETC';

export type ReportStatus = 'PENDING' | 'RESOLVED';

export type PostActionType = 'NONE' | 'DELETE';
export type UserActionType = 'NONE' | 'WARN' | 'SUSPEND' | 'BAN';

export const REPORT_TARGET_TYPE_LABEL: Record<ReportTargetType, string> = {
  RECRUITMENT_POST: '모집글',
  INFO_POST: '정보글',
  USER: '유저',
};

export const REPORT_REASON_LABEL: Record<ReportReason, string> = {
  SPAM: '스팸/광고/도배',
  ABUSE: '욕설/비방/혐오 표현',
  INAPPROPRIATE: '부적절한 콘텐츠',
  FRAUD: '사기/허위 정보',
  PRIVACY: '개인정보 노출',
  IMPERSONATION: '사칭',
  ETC: '기타',
};

// 신고 등록 (내가 신고할 때)

export type ReportRequest = {
  reason: ReportReason;
  detail: string;
};

export type ReportResponse = {
  reportId: number;
  reason: ReportReason;
  detail: string;
  status: ReportStatus;
  createdAt: string;
};

// 관리자 - 신고 목록/상세

export type ReportSummaryItem = {
  reportId: number;
  reason: ReportReason;
  detail: string;
  targetType: ReportTargetType;
  targetName: string;
  reporterName: string;
  status: ReportStatus;
  createdAt: string;
};

export type ReportSummaryResponse = {
  summary: { total: number; pending: number; resolved: number };
  reports: Page<ReportSummaryItem>;
};

export type PostAction = {
  action: PostActionType;
  detail: string;
};

export type UserAction = {
  action: UserActionType;
  durationDays: number | null; // SUSPEND일 때만 값 있음
  detail: string;
};

export type ReportDetailResponse = {
  reportId: number;
  reason: ReportReason;
  detail: string;
  targetType: ReportTargetType;
  status: ReportStatus;
  reporter: ActorRef;
  targetPost: { postId: number; title: string } | null; // USER 신고면 null
  targetUser: ActorRef | null; // 게시글 신고면 작성자 정보
  postAction: PostAction | null; // PENDING이면 null
  userAction: UserAction | null; // PENDING이면 null
  handledBy: ActorRef | null;
  handledAt: string | null;
  createdAt: string;
};

export type ReportHandleRequest = {
  postAction: { action: PostActionType; detail: string } | null; // USER 신고면 null
  userAction: {
    action: UserActionType;
    durationDays?: number; // action === 'SUSPEND'일 때만 필수
    detail: string;
  };
};

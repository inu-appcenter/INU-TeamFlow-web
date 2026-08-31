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

export type InquiryType = 'ACCOUNT' | 'BUG' | 'SUGGESTION' | 'ETC';
export type InquiryStatus = 'PENDING' | 'RESOLVED';

export const INQUIRY_TYPE_LABEL: Record<InquiryType, string> = {
  ACCOUNT: '계정',
  BUG: '버그',
  SUGGESTION: '기능 제안',
  ETC: '기타',
};

// 사용자 - 문의 등록/조회

export type InquiryRequest = {
  type: InquiryType;
  detail: string; // 최대 1000자
};

export type InquiryResponse = {
  inquiryId: number;
  type: InquiryType;
  detail: string;
  status: InquiryStatus;
  createdAt: string;
};

export type InquiryDetailResponse = {
  inquiryId: number;
  type: InquiryType;
  detail: string;
  status: InquiryStatus;
  inquirer: ActorRef;
  answer: string | null; // PENDING이면 null
  answeredBy: ActorRef | null;
  answeredAt: string | null;
  createdAt: string;
};

// 관리자 - 문의 목록/처리

export type InquirySummaryItem = {
  inquiryId: number;
  type: InquiryType;
  detail: string;
  authorName: string;
  status: InquiryStatus;
  createdAt: string;
};

export type InquirySummaryResponse = {
  summary: { total: number; pending: number; resolved: number };
  inquiries: Page<InquirySummaryItem>;
};

export type InquiryHandleRequest = {
  answer: string;
};

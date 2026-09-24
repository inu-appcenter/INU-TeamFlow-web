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

export type DashboardItemType = "REPORT" | "INQUIRY";

export type DashboardItem = {
  itemType: DashboardItemType;
  refId: number; // reportId 또는 inquiryId
  detail: string;
  status: "PENDING" | "RESOLVED";
  createdAt: string;
};

export type DashboardResponse = {
  summary: { total: number; pending: number; resolved: number };
  items: Page<DashboardItem>;
};

// 정지 계정 ---------------------------------

export type SanctionType = "SUSPEND" | "BAN";

export const SANCTION_TYPE_LABEL: Record<SanctionType, string> = {
  SUSPEND: "정지",
  BAN: "영구정지",
};

export type SuspendedUserItem = {
  userId: number;
  username: string;
  name: string;
  action: SanctionType;
  suspendedUntil: string | null; // BAN이면 null
  reportId: number; // release API에 넘길 값
  reason: string;
  handledBy: string;
  handledAt: string;
};

export type SuspendedUserListResponse = Page<SuspendedUserItem>;

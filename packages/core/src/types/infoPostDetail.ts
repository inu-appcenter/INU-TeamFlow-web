import type { useInfoPostDetail } from "@moimi/core/hooks/useInfoPostQuery";

// 프로젝트에서 실제 사용하는 상세 응답 타입을 그대로 따른다.
export type InfoPostDetailData = NonNullable<
  ReturnType<typeof useInfoPostDetail>["data"]
>;

export interface InfoPostDetailActionsProps {
  infoPost: Pick<
    InfoPostDetailData,
    "infoPostId" | "category" | "isAuthor" | "isScrap"
  >;
  isDeleting: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onBeforeScrap?: () => boolean;
}

export interface InfoPostDetailContentProps {
  infoPost: InfoPostDetailData;
}

import type { categoryColorMap } from "@moimi/core/constants/category";

export interface RecruitmentDetailActionsProps {
  category: keyof typeof categoryColorMap;
  recruitmentId: number;
  isRecruiter: boolean;
  isClosed: boolean;
  isDeleting: boolean;
  isScrap: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onBeforeScrap?: () => boolean;
}

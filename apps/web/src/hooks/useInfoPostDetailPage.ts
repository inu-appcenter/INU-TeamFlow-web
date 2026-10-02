'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useDeleteInfoPost,
  useInfoPostDetail,
} from '@moimi/core/hooks/useInfoPostQuery';
import { useCreateReport } from '@moimi/core/hooks/useCreateReport';
import { useSchoolVerificationGuard } from '@moimi/core/hooks/useSchoolVerificationGuard';
import type { ReportRequest } from '@moimi/core/types/report';
import { useErrorToast } from '@/hooks/useErrorToast';
import { usePostView } from '@/hooks/usePostView';
import { useSafeBack } from '@/hooks/useSafeBack';
import { capture } from '@/lib/analytics/client';
import { startAnalyticsAttempt } from '@/lib/analytics';

export function useInfoPostDetailPage(infoPostId: number) {
  const router = useRouter();
  const safeBack = useSafeBack();
  const { data: infoPost, isLoading } = useInfoPostDetail(infoPostId);
  const { mutateAsync: deleteInfoPost, isPending: isDeleting } =
    useDeleteInfoPost();
  const { mutate: createReport, isPending: isReportSubmitting } =
    useCreateReport();
  const { errorMessage, showErrorMessage } = useErrorToast();
  const { checkVerified } = useSchoolVerificationGuard(showErrorMessage);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // 들어온 곳(홈 / 정보글 목록 / 모집글 / 마이페이지)으로 복귀
  // 새 탭·URL 직접 진입이면 정보글 목록으로
  const goBack = () => safeBack('/infoPost');

  usePostView({
    postType: 'info_post',
    postId: infoPost?.infoPostId,
    category: infoPost?.category,
    enabled:
      !isLoading &&
      Number.isSafeInteger(infoPostId) &&
      infoPostId > 0 &&
      infoPost?.infoPostId === infoPostId,
  });

  const handleDelete = async () => {
    if (isDeleting) return;

    const attempt = startAnalyticsAttempt('info_post_delete', {
      feature: 'info_post',
      attempt_scope: 'submission',
      post_type: 'info_post',
      post_id: infoPostId,
      category: infoPost?.category,
    });

    try {
      await deleteInfoPost(infoPostId);
    } catch (error) {
      attempt.fail(error);
      console.error('정보글 삭제 실패', error);
      showErrorMessage('정보글 삭제에 실패했습니다');
      return;
    }

    attempt.succeed();

    capture('info_post_deleted', {
      feature: 'info_post',
      interaction_type: 'management',
      post_type: 'info_post',
      post_id: String(infoPostId),
      post_key: `info_post:${infoPostId}`,
      category: infoPost?.category,
      attempt_id: attempt.attemptId,
    });

    goBack();
  };

  const handleSubmitReport = ({ reason, detail }: ReportRequest) => {
    createReport(
      {
        target: { type: 'INFO_POST', id: infoPostId },
        body: { reason, detail },
      },
      {
        onSuccess: () => {
          setIsReportModalOpen(false);
          showErrorMessage('신고가 접수되었습니다');
        },
        onError: () => showErrorMessage('신고 접수에 실패했습니다'),
      }
    );
  };

  return {
    infoPost,
    isLoading,
    isDeleting,
    errorMessage,
    isDeleteConfirmOpen,
    isReportModalOpen,
    isReportSubmitting,
    checkVerified,
    goBack,
    editPost: () => router.push(`/infoPost/${infoPostId}/edit`),
    openDeleteConfirm: () => setIsDeleteConfirmOpen(true),
    closeDeleteConfirm: () => setIsDeleteConfirmOpen(false),
    confirmDelete: () => {
      setIsDeleteConfirmOpen(false);
      void handleDelete();
    },
    openReport: () => setIsReportModalOpen(true),
    closeReport: () => {
      if (isReportSubmitting) return;
      setIsReportModalOpen(false);
    },
    handleSubmitReport,
  };
}

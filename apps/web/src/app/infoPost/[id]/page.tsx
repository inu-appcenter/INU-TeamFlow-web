'use client';

import { useParams } from 'next/navigation';
import { AnimatePresence } from 'motion/react';

import Card from '@/components/main/Card';

import ReportModal from '@/components/report/ReportModal';
import PostDeleteConfirmModal from '@/components/common/PostDeleteConfirmModal';
import InfoPostDetailActions from '@/components/infoPost/InfoPostDetailActions';
import InfoPostDetailContent from '@/components/infoPost/InfoPostDetailContent';
import { useInfoPostDetailPage } from '@/hooks/useInfoPostDetailPage';

export default function InfoPostDetailPage() {
  const params = useParams();
  const detail = useInfoPostDetailPage(Number(params.id));
  if (detail.isLoading) return null;

  if (!detail.infoPost) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5]">
        <p className="text-base font-semibold text-[#2C2C2C] sm:text-lg">
          존재하지 않는 정보글입니다
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-3 sm:px-6 sm:pt-6">
      <section className="mx-auto mt-8 flex min-h-[calc(100vh-48px)] max-w-[800px] flex-col sm:mt-12 sm:min-h-[calc(100vh-72px)]">
        <Card className="flex flex-1 flex-col overflow-hidden rounded-b-none p-0">
          {detail.errorMessage && (
            <div className="animate-modal-pop fixed top-32 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
              {detail.errorMessage}
            </div>
          )}
          <InfoPostDetailActions
            infoPost={detail.infoPost}
            isDeleting={detail.isDeleting}
            onBack={detail.goBack}
            onEdit={detail.editPost}
            onDelete={detail.openDeleteConfirm}
            onReport={detail.openReport}
            onBeforeScrap={detail.checkVerified}
          />
          <InfoPostDetailContent infoPost={detail.infoPost} />
        </Card>

        {detail.isDeleteConfirmOpen && (
          <PostDeleteConfirmModal
            postLabel="정보글"
            isPending={detail.isDeleting}
            onClose={detail.closeDeleteConfirm}
            onConfirm={detail.confirmDelete}
          />
        )}

        <AnimatePresence>
          {detail.isReportModalOpen && (
            <ReportModal
              targetLabel="이 정보글"
              isSubmitting={detail.isReportSubmitting}
              onClose={detail.closeReport}
              onSubmit={detail.handleSubmitReport}
            />
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

import BottomNav from '@/components/common/bottom-nav/BottomNav';
import NotificationButton from '@/components/common/notification/NotificationButton';
import ContentCard from '@/components/common/ContentCard';
import Header from '@/components/common/Header';
import { useErrorToast } from '@/hooks/useErrorToast';
import {
  useInvitations,
  useUpdateInvitationStatus,
} from '@/hooks/useMypageInvitationQuery';

import type {
  InvitationResponse,
  InvitationStatus,
  InvitationTab,
} from '@/types/mypageInvitation';

import { formatDate } from '@/utils/date/formatDate';

//이걸 복붙해서 사용해주세요
//DetailTopBar 연결을 위한 입력 공간
//1. 페이지 이름을 입력해주세요
const pageName = '초대 이력';

//2. 글 검색 기능 있어야돼요? 답변은 true와 false로 해주세요
const isSearch = false;

//3. 글 작성 기능 있어야돼요? 답변은 true와 false로 해주세요
const isCreate = false;

//4. 카테고리 기능 있어야돼요? 답변은 true와 false로 해주세요
const isCategory = true;
//카테고리 필터를 입력해주세요

const categories: { label: string; value: InvitationTab }[] = [
  { label: '받은 초대', value: 'RECEIVED' },
  { label: '보낸 초대', value: 'SENT' },
];

const getInvitationCardStatus = (
  status: InvitationStatus
): 'WAITING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' => {
  if (status === 'ACCEPTED') {
    return 'ACCEPTED';
  }

  if (status === 'DECLINED') {
    return 'DECLINED';
  }

  if (status === 'CANCELED') {
    return 'CANCELLED';
  }

  return 'WAITING';
};

const getInvitationStatusLabel = (status: InvitationStatus) => {
  if (status === 'WAITING') return '대기중';
  if (status === 'ACCEPTED') return '수락됨';
  if (status === 'DECLINED') return '거절됨';
  if (status === 'CANCELED') return '취소됨';

  return status;
};

const formatDateTime = (dateString: string | null) => {
  if (!dateString) {
    return '-';
  }

  const date = new Date(dateString);

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
    2,
    '0'
  )}.${String(date.getDate()).padStart(2, '0')} ${String(
    date.getHours()
  ).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export default function InvitationsPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<InvitationTab>('RECEIVED');
  const { errorMessage, showErrorMessage } = useErrorToast();
  const [selectedInvitation, setSelectedInvitation] =
    useState<InvitationResponse | null>(null);

  const {
    data: invitations = [],
    isLoading,
    isError,
  } = useInvitations(selectedCategory);

  const { mutate: updateStatus, isPending } = useUpdateInvitationStatus();

  const sortedInvitations = [...invitations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleCategoryChange = (category: string) => {
    if (category !== 'RECEIVED' && category !== 'SENT') {
      return;
    }

    setSelectedCategory(category);
    setSelectedInvitation(null);
  };

  const changeInvitationStatus = (
    invitationId: number,
    status: 'ACCEPTED' | 'DECLINED'
  ) => {
    updateStatus(
      {
        invitationId,
        body: {
          status,
        },
      },
      {
        onSuccess: (updatedInvitation) => {
          setSelectedInvitation((prev) => {
            if (!prev) return null;

            if (prev.invitationId !== invitationId) {
              return prev;
            }

            return updatedInvitation;
          });
        },
        onError: () => {
          showErrorMessage('초대 상태 변경에 실패했습니다');
        },
      }
    );
  };

  return (
    <main className="min-h-screen px-3 py-6 sm:px-6">
      {errorMessage && (
        <div className="fixed top-5 left-1/2 z-[500] -translate-x-1/2 rounded-xl bg-[#2C2C2C] px-5 py-3 text-[14px] font-medium whitespace-nowrap text-white shadow-lg">
          {errorMessage}
        </div>
      )}

      <div className="mx-auto mb-20 max-w-[1180px]">
        <Header
          pageName={pageName}
          isSearch={isSearch}
          isCreate={isCreate}
          isCategory={isCategory}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {isLoading ? (
            <div className="col-span-full flex h-[250px] items-center justify-center text-sm text-[#989898]">
              초대 이력을 불러오는 중입니다
            </div>
          ) : isError ? (
            <div className="col-span-full flex h-[250px] items-center justify-center text-sm text-[#989898]">
              초대 이력을 불러오지 못했습니다
            </div>
          ) : sortedInvitations.length === 0 ? (
            <div className="col-span-full flex h-[250px] items-center justify-center text-sm text-[#989898]">
              초대 이력이 없습니다
            </div>
          ) : (
            sortedInvitations.map((invitation) => (
              <ContentCard
                key={invitation.invitationId}
                cardType="invitation"
                category={invitation.teamCategory ?? 'ETC'}
                title={invitation.teamName}
                createdAt={formatDate(invitation.createdAt)}
                direction={selectedCategory}
                personName={
                  selectedCategory === 'RECEIVED'
                    ? invitation.senderName
                    : invitation.receiverName
                }
                cardStatus={getInvitationCardStatus(invitation.status)}
                isPending={isPending}
                onClick={() => setSelectedInvitation(invitation)}
                onAccept={() =>
                  changeInvitationStatus(invitation.invitationId, 'ACCEPTED')
                }
                onReject={() =>
                  changeInvitationStatus(invitation.invitationId, 'DECLINED')
                }
              />
            ))
          )}
        </section>

        {selectedInvitation && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 px-5"
            onClick={() => setSelectedInvitation(null)}
          >
            <section
              className="animate-modal-pop w-full max-w-[420px] rounded-3xl bg-white p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-[22px] font-bold text-[#2C2C2C]">
                  초대 상세
                </h2>

                <button
                  type="button"
                  onClick={() => setSelectedInvitation(null)}
                  className="cursor-pointer text-[#B0B8C1]"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <DetailRow
                  label="팀 이름"
                  value={selectedInvitation.teamName}
                />

                <DetailRow
                  label="상태"
                  value={getInvitationStatusLabel(selectedInvitation.status)}
                />

                <DetailRow
                  label="보낸 사람"
                  value={selectedInvitation.senderName}
                />

                <DetailRow
                  label="받는 사람"
                  value={selectedInvitation.receiverName}
                />

                <DetailRow
                  label="초대일"
                  value={formatDateTime(selectedInvitation.createdAt)}
                />

                <DetailRow
                  label="응답일"
                  value={formatDateTime(selectedInvitation.respondedAt)}
                />
              </div>

              {selectedCategory === 'RECEIVED' &&
                selectedInvitation.status === 'WAITING' && (
                  <div className="mt-6 flex gap-2">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        changeInvitationStatus(
                          selectedInvitation.invitationId,
                          'ACCEPTED'
                        )
                      }
                      className="h-12 flex-1 rounded-2xl bg-[#5E92F0] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#B0B8C1]"
                    >
                      수락
                    </button>

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        changeInvitationStatus(
                          selectedInvitation.invitationId,
                          'DECLINED'
                        )
                      }
                      className="h-12 flex-1 rounded-2xl bg-[#EEF1F5] text-sm font-semibold text-[#646B75] disabled:cursor-not-allowed"
                    >
                      거절
                    </button>
                  </div>
                )}
            </section>
          </div>
        )}

        <BottomNav />
      </div>
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[#EDF1F5] pb-3">
      <span className="shrink-0 font-semibold text-[#989898]">{label}</span>

      <span className="text-right text-[#2C2C2C]">{value}</span>
    </div>
  );
}

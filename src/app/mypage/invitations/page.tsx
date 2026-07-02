'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, X } from 'lucide-react';

import BottomNav from '@/components/common/bottom-nav/BottomNav';
import NotificationButton from '@/components/common/notification/NotificationButton';
import {
  useInvitations,
  useUpdateInvitationStatus,
} from '@/hooks/useMypageInvitationQuery';
import type {
  Invitation,
  InvitationStatus,
  InvitationTab,
} from '@/types/mypageInvitation';

const tabs: { label: string; value: InvitationTab }[] = [
  { label: '받은 초대', value: 'RECEIVED' },
  { label: '보낸 초대', value: 'SENT' },
];

const getStatusLabel = (status: InvitationStatus) => {
  if (status === 'WAITING') return '대기';
  if (status === 'ACCEPTED') return '수락';
  if (status === 'REJECTED') return '거절';
  if (status === 'CANCELED') return '취소';
  return status;
};

const getStatusStyle = (status: InvitationStatus) => {
  if (status === 'WAITING') return 'bg-[#FFF6D8] text-[#A57B00]';
  if (status === 'ACCEPTED') return 'bg-[#DDF7E5] text-[#2F8F4E]';
  if (status === 'REJECTED') return 'bg-[#FFE4E7] text-[#D84A5B]';
  return 'bg-[#EEF1F5] text-[#989898]';
};

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return '-';

  const date = new Date(dateString);

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
    2,
    '0'
  )}.${String(date.getDate()).padStart(2, '0')} ${String(
    date.getHours()
  ).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export default function InvitationsPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<InvitationTab>('RECEIVED');
  const [selectedInvitation, setSelectedInvitation] =
    useState<Invitation | null>(null);

  const { data: receivedInvitations = [], isLoading: isReceivedLoading } =
    useInvitations('RECEIVED');
  const { data: sentInvitations = [], isLoading: isSentLoading } =
    useInvitations('SENT');

  const { mutate: updateStatusMutate, isPending: isUpdatePending } =
    useUpdateInvitationStatus();

  const invitations: Invitation[] = [
    ...receivedInvitations.map((invitation) => ({
      ...invitation,
      type: 'RECEIVED' as const,
    })),
    ...sentInvitations.map((invitation) => ({
      ...invitation,
      type: 'SENT' as const,
    })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filteredInvitations = invitations.filter(
    (invitation) => invitation.type === activeTab
  );

  const isLoading = isReceivedLoading || isSentLoading;

  const changeInvitationStatus = (
    invitationId: number,
    status: 'ACCEPTED' | 'REJECTED'
  ) => {
    updateStatusMutate(
      {
        invitationId,
        body: { status },
      },
      {
        onSuccess: (data) => {
          setSelectedInvitation((prev) =>
            prev?.invitationId === invitationId
              ? { ...data, type: 'RECEIVED' }
              : prev
          );
        },
        onError: () => {
          alert('초대 상태 변경에 실패했습니다.');
        },
      }
    );
  };

  const handleAccept = (invitationId: number) => {
    changeInvitationStatus(invitationId, 'ACCEPTED');
  };

  const handleReject = (invitationId: number) => {
    changeInvitationStatus(invitationId, 'REJECTED');
  };

  return (
    <main className="min-h-screen px-3 py-6 pb-28 sm:px-6 sm:pt-10">
      <NotificationButton />

      <header className="mx-auto mt-10 mb-5 flex max-w-[1180px] items-center gap-3 px-1">
        <button
          onClick={() => router.push('/mypage')}
          className="cursor-pointer text-[#2C2C2C] transition-all duration-150 active:scale-90"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>

        <h1 className="text-[26px] font-bold text-[#2C2C2C]">초대 이력</h1>
      </header>

      <section className="mx-auto max-w-[1180px]">
        <section className="animate-modal-pop min-h-[600px] rounded-3xl border-[0.5px] border-[#D6DDE5] bg-white p-5 transition-all duration-200 sm:p-7">
          <div className="mb-6 border-b border-[#EDF1F5] pb-4">
            <div className="flex flex-wrap gap-2 text-[15px] font-semibold">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`rounded-2xl px-4 py-2 transition-all duration-150 active:scale-95 ${
                    activeTab === tab.value
                      ? 'bg-[#5E92F0] text-white shadow-sm'
                      : 'border border-[#D6DDE5] bg-white text-[#2C2C2C]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="thin-scrollbar grid max-h-[500px] gap-4 overflow-y-auto pr-1 lg:grid-cols-2">
            {isLoading ? (
              <div className="col-span-full flex h-[360px] items-center justify-center text-[14px] text-[#B0B8C1]">
                초대 이력을 불러오는 중입니다.
              </div>
            ) : filteredInvitations.length === 0 ? (
              <div className="col-span-full flex h-[360px] items-center justify-center text-[14px] text-[#B0B8C1]">
                초대 이력이 없습니다.
              </div>
            ) : (
              filteredInvitations.map((invitation) => (
                <div
                  key={invitation.invitationId}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedInvitation(invitation)}
                  className="flex min-h-[180px] cursor-pointer flex-col justify-between rounded-3xl bg-[#FAFBFC] p-6 text-left transition-all duration-150 hover:bg-white hover:shadow-sm active:scale-[0.98]"
                >
                  <div>
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <h2 className="line-clamp-2 text-[19px] font-bold text-[#2C2C2C]">
                        {invitation.teamName}
                      </h2>

                      <span
                        className={`shrink-0 rounded-full px-4 py-1.5 text-[12px] font-semibold ${getStatusStyle(
                          invitation.status
                        )}`}
                      >
                        {getStatusLabel(invitation.status)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[14px] text-[#5C5C5C]">
                        {activeTab === 'RECEIVED'
                          ? `보낸 사람 · ${invitation.senderName}`
                          : `받는 사람 · ${invitation.receiverName}`}
                      </p>

                      <p className="text-[13px] text-[#989898]">
                        초대일 {formatDateTime(invitation.createdAt)}
                      </p>
                    </div>
                  </div>

                  {activeTab === 'RECEIVED' &&
                    invitation.status === 'WAITING' && (
                      <div className="mt-6 flex gap-2">
                        <button
                          type="button"
                          disabled={isUpdatePending}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAccept(invitation.invitationId);
                          }}
                          className="h-11 flex-1 rounded-2xl bg-[#5E92F0] text-[13px] font-semibold text-white transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:bg-[#B0B8C1]"
                        >
                          수락
                        </button>

                        <button
                          type="button"
                          disabled={isUpdatePending}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(invitation.invitationId);
                          }}
                          className="h-11 flex-1 rounded-2xl bg-[#EEF1F5] text-[13px] font-semibold text-[#989898] transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:bg-[#D6DDE5]"
                        >
                          거절
                        </button>
                      </div>
                    )}
                </div>
              ))
            )}
          </div>
        </section>
      </section>

      {selectedInvitation && (
        <div
          onClick={() => setSelectedInvitation(null)}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 px-5"
        >
          <section
            onClick={(e) => e.stopPropagation()}
            className="animate-modal-pop w-full max-w-[420px] rounded-3xl bg-white p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[22px] font-bold text-[#2C2C2C]">
                초대 상세
              </h2>

              <button
                onClick={() => setSelectedInvitation(null)}
                className="text-[#B0B8C1] transition-all duration-150 active:scale-90"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-3 text-[14px]">
              <DetailRow label="팀 이름" value={selectedInvitation.teamName} />
              <DetailRow
                label="상태"
                value={getStatusLabel(selectedInvitation.status)}
              />
              <DetailRow
                label="보낸 사람"
                value={selectedInvitation.senderName}
              />
              <DetailRow
                label="받은 사람"
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

            {selectedInvitation.type === 'RECEIVED' &&
              selectedInvitation.status === 'WAITING' && (
                <div className="mt-6 flex gap-2">
                  <button
                    disabled={isUpdatePending}
                    onClick={() =>
                      handleAccept(selectedInvitation.invitationId)
                    }
                    className="h-12 flex-1 rounded-2xl bg-[#5E92F0] text-[14px] font-semibold text-white transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:bg-[#B0B8C1]"
                  >
                    수락
                  </button>

                  <button
                    disabled={isUpdatePending}
                    onClick={() =>
                      handleReject(selectedInvitation.invitationId)
                    }
                    className="h-12 flex-1 rounded-2xl bg-[#EEF1F5] text-[14px] font-semibold text-[#989898] transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:bg-[#D6DDE5]"
                  >
                    거절
                  </button>
                </div>
              )}
          </section>
        </div>
      )}

      <BottomNav />
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
'use client';

import { useState, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { MoreVertical, Camera, Pencil, Plus, Search, X } from 'lucide-react';
import { useCreateDirectChatRoom } from '@/hooks/chat/useCreateDirectChatRoom';
import { useChatRoomMembers } from '@/hooks/chat/useChatRoomMembers';
import { useChatRoomAvailableMembers } from '@/hooks/chat/useChatRoomAvailableMembers';
import { useAddChatRoomMembers } from '@/hooks/chat/useAddChatRoomMembers';
import { useLeaveChatRoom } from '@/hooks/chat/useLeaveChatRoom';
import {
  useUpdateMyChatRoomName,
  useUpdateMyChatRoomImage,
} from '@/hooks/chat/useUpdateMyChatRoomInfo';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useMyInfo } from '@/hooks/useAuthQuery';
import { useCreateReport } from '@/hooks/useCreateReport';
import ReportModal from '@/components/report/ReportModal';
import type { ChatRoomMemberResponse } from '@/types/chat';
import type { ReportRequest } from '@/types/report';
import { getDepartmentName } from '@/utils/getDepartmentName';

type ChatRoomDrawerProps = {
  open: boolean;
  onClose: () => void;
  roomId: number;
  roomType: 'TEAM' | 'DIRECT' | 'GROUP';
  roomName: string;
  roomImageUrl: string | null;
  onInfoUpdated: (next: {
    roomName?: string;
    roomImageUrl?: string | null;
  }) => void;
};

export default function ChatRoomDrawer({
  open,
  onClose,
  roomId,
  roomType,
  roomName,
  roomImageUrl,
  onInfoUpdated,
}: ChatRoomDrawerProps) {
  const router = useRouter();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(roomName);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [showImageOverlay, setShowImageOverlay] = useState(false);
  const [openMemberMenuId, setOpenMemberMenuId] = useState<number | null>(null);
  const [confirmKickTarget, setConfirmKickTarget] =
    useState<ChatRoomMemberResponse | null>(null);
  const [reportTarget, setReportTarget] =
    useState<ChatRoomMemberResponse | null>(null);
  const { mutateAsync: createDirectRoom, isPending: isCreatingRoom } =
    useCreateDirectChatRoom();
  const { mutate: createReport, isPending: isReportSubmitting } =
    useCreateReport();
  const { data: me } = useMyInfo();
  const { data: members, isLoading: isMembersLoading } =
    useChatRoomMembers(roomId);
  const sortedMembers = useMemo(() => {
    if (!members) return members;

    const myUserId = me?.userId;
    const myself = members.filter((m) => m.userId === myUserId);
    const others = members
      .filter((m) => m.userId !== myUserId)
      .sort((a, b) => a.userNickname.localeCompare(b.userNickname, 'ko'));

    return [...myself, ...others];
  }, [members, me?.userId]);

  const { data: availableMembers = [] } = useChatRoomAvailableMembers(
    roomId,
    keyword,
    roomType === 'GROUP'
  );

  const { mutateAsync: addMembers, isPending: isAdding } =
    useAddChatRoomMembers(roomId);
  const { mutate: leaveRoom, isPending: isLeaving } = useLeaveChatRoom();
  const { mutateAsync: updateMyName, isPending: isRenaming } =
    useUpdateMyChatRoomName(roomId);
  const { mutateAsync: updateMyImage, isPending: isUpdatingImage } =
    useUpdateMyChatRoomImage(roomId);

  const { errorMessage, showErrorMessage } = useErrorToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSelect = (userId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
  };

  const handleDirectMessage = async (member: ChatRoomMemberResponse) => {
    setOpenMemberMenuId(null);
    try {
      const room = await createDirectRoom(member.userId);
      onClose();
      router.push(
        `/chat/${room.chatRoomId}?roomName=${encodeURIComponent(room.roomName)}&roomType=${room.chatRoomType}`
      );
    } catch {
      showErrorMessage('채팅방 생성에 실패했어요');
    }
  };

  const handleOpenReport = (member: ChatRoomMemberResponse) => {
    setOpenMemberMenuId(null);
    setReportTarget(member);
  };

  const handleSubmitReport = ({ reason, detail }: ReportRequest) => {
    if (!reportTarget) return;
    createReport(
      {
        target: { type: 'USER', id: reportTarget.userId },
        body: { reason, detail },
      },
      {
        onSuccess: () => {
          setReportTarget(null);
          showErrorMessage('신고가 접수되었습니다');
        },
        onError: () => showErrorMessage('신고 접수에 실패했습니다'),
      }
    );
  };

  const handleImageMenuSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    e.target.value = '';
    setShowImageOverlay(false);

    if (value === 'upload') {
      fileInputRef.current?.click();
    } else if (value === 'reset') {
      handleResetImage();
    }
  };

  const handleAddMembers = async () => {
    if (selectedIds.size === 0) return;
    try {
      await addMembers(Array.from(selectedIds));
      setSelectedIds(new Set());
      setKeyword('');
      setIsInviteOpen(false);
    } catch {
      showErrorMessage('멤버 추가에 실패했어요');
    }
  };

  const handleSaveName = async () => {
    const trimmed = nameDraft.trim();

    if (!trimmed || trimmed === roomName) {
      setIsEditingName(false);
      return;
    }

    try {
      const updatedName = await updateMyName(trimmed);

      onInfoUpdated({
        roomName: updatedName ?? trimmed,
      });

      setIsEditingName(false);
    } catch {
      showErrorMessage('이름 변경에 실패했어요');
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const newUrl = await updateMyImage(file);
      onInfoUpdated({ roomImageUrl: newUrl });
    } catch {
      showErrorMessage('이미지 변경에 실패했어요');
    }
  };

  const handleResetImage = async () => {
    try {
      const newUrl = await updateMyImage(null);
      onInfoUpdated({ roomImageUrl: newUrl });
    } catch {
      showErrorMessage('이미지 초기화에 실패했어요');
    }
  };

  const handleLeave = () => {
    leaveRoom(roomId, {
      onSuccess: () => {
        setConfirmLeave(false);
        onClose();
        router.push('/chat');
      },
      onError: () => {
        showErrorMessage('채팅방 나가기에 실패했어요');
        setConfirmLeave(false);
      },
    });
  };
  useLockBodyScroll(open);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="chat-drawer-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[250] bg-black/20"
        >
          <motion.aside
            onClick={(e) => e.stopPropagation()}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-0 right-0 z-[260] flex h-full w-full max-w-[360px] flex-col bg-white px-4 py-6 shadow-xl"
          >
            {errorMessage && (
              <div className="animate-modal-pop fixed top-32 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
                {errorMessage}
              </div>
            )}

            {/* 스크롤 영역: 이미지/이름 + 멤버 박스 */}
            <div className="thin-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
              {/* 이미지 + 이름 */}
              <div className="mt-2 flex flex-col items-center gap-4">
                <div className="relative">
                  <div
                    className={`group relative h-20 w-20 shrink-0 overflow-hidden bg-[#D6DDE5] ${
                      roomType === 'DIRECT' ? 'rounded-full' : 'rounded-2xl'
                    }`}
                  >
                    {roomImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={roomImageUrl}
                        alt={roomName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-bold text-[#3F4852]">
                        {roomName.slice(0, 1)}
                      </div>
                    )}
                    {roomType === 'GROUP' && (
                      <>
                        <div
                          className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 transition ${
                            showImageOverlay
                              ? 'opacity-100'
                              : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <Camera size={20} className="text-white" />
                        </div>

                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowImageOverlay(true)}
                          className={`absolute inset-0 h-full w-full ${
                            showImageOverlay
                              ? 'hidden'
                              : 'pointer-events-auto cursor-pointer group-hover:pointer-events-none'
                          }`}
                        />

                        <select
                          value=""
                          onChange={handleImageMenuSelect}
                          onBlur={() => setShowImageOverlay(false)}
                          disabled={isUpdatingImage}
                          className={`absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0 group-hover:pointer-events-auto ${
                            showImageOverlay
                              ? 'pointer-events-auto'
                              : 'pointer-events-none'
                          }`}
                        >
                          <option value="" disabled hidden />
                          <option value="upload">사진 선택</option>
                          <option value="reset">기본 이미지 적용</option>
                        </select>
                      </>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUpdatingImage}
                    onChange={handleImageChange}
                  />
                </div>

                {isEditingName ? (
                  <div className="flex w-full items-center gap-2">
                    <input
                      value={nameDraft}
                      onChange={(e) =>
                        setNameDraft(e.target.value.slice(0, 30))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') setIsEditingName(false);
                      }}
                      onBlur={() => setIsEditingName(false)}
                      maxLength={30}
                      autoFocus
                    />
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleSaveName}
                      disabled={isRenaming}
                      className="cursor-pointer rounded-lg bg-[#5E92F0] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      저장
                    </button>
                  </div>
                ) : roomType === 'GROUP' ? (
                  <button
                    onClick={() => {
                      setNameDraft(roomName);
                      setIsEditingName(true);
                    }}
                    className="flex cursor-pointer items-center gap-2 text-base font-bold text-[#2C2C2C]"
                  >
                    {roomName}
                    <Pencil size={14} className="text-[#989898]" />
                  </button>
                ) : (
                  <p className="text-base font-bold text-[#2C2C2C]">
                    {roomName}
                  </p>
                )}
              </div>

              {/* 멤버 박스 */}
              <section className="mt-4 rounded-xl bg-[#F6F8FA] pb-3">
                <p className="px-4 pt-4 pb-2 text-xs font-medium text-[#989898]">
                  대화상대 ({members?.length ?? 0})
                </p>

                {roomType === 'GROUP' && isInviteOpen && (
                  <div className="mx-3 mb-2 flex items-center gap-2 rounded-xl border-[0.5px] border-[#D6DDE5] bg-white px-3 py-2">
                    <Search size={14} className="text-[#989898]" />
                    <input
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="팀원 검색 후 초대"
                      autoFocus
                      className="w-full bg-transparent text-sm outline-none placeholder:text-[#989898]"
                    />
                  </div>
                )}

                {roomType === 'GROUP' && isInviteOpen && keyword && (
                  <div className="thin-scrollbar mx-3 mt-2 mb-2 flex max-h-[160px] flex-col overflow-y-auto rounded-xl border-[0.5px] border-[#D6DDE5] bg-white">
                    {availableMembers.map((user) => {
                      const isSelected = selectedIds.has(user.userId);
                      return (
                        <button
                          key={user.userId}
                          onClick={() => toggleSelect(user.userId)}
                          className={`flex items-center justify-between px-3 py-2 text-left hover:bg-[#F6F8FA] ${
                            isSelected ? 'bg-[#EEF3FE]' : ''
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium text-[#2C2C2C]">
                              {user.name}
                            </p>
                            <p className="text-xs text-[#989898]">
                              {user.studentNumber}
                            </p>
                          </div>
                          {isSelected && (
                            <span className="text-xs font-semibold text-[#5E92F0]">
                              선택됨
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {roomType === 'GROUP' && selectedIds.size > 0 && (
                  <button
                    onClick={handleAddMembers}
                    disabled={isAdding}
                    className="mt-2 w-full cursor-pointer rounded-xl bg-[#5E92F0] py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {selectedIds.size}명 초대하기
                  </button>
                )}

                <div className="flex flex-col px-2">
                  {/* 초대하기 슬롯: 멤버 목록 첫 줄 */}
                  {roomType === 'GROUP' && (
                    <button
                      onClick={() => {
                        setIsInviteOpen((prev) => !prev);
                        if (isInviteOpen) {
                          setKeyword('');
                          setSelectedIds(new Set());
                        }
                      }}
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 text-left hover:bg-[#EEF1F5]"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed border-[#C5CDD6] bg-white">
                        <Plus
                          size={16}
                          className="text-[#5E92F0]"
                          strokeWidth={2.5}
                        />
                      </div>
                      <span className="text-sm font-semibold text-[#5E92F0]">
                        초대하기
                      </span>
                    </button>
                  )}

                  {isMembersLoading && !members ? (
                    <div className="mb-5 flex h-10 items-center justify-center text-sm text-[#9C9C9C]">
                      불러오는 중...
                    </div>
                  ) : (
                    sortedMembers?.map((member) => (
                      <div
                        key={member.userId}
                        className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-[#EEF1F5]"
                      >
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#D6DDE5]">
                          {member.profileImageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={member.profileImageUrl}
                              alt={member.userNickname}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>

                        <div className="flex w-full items-center justify-between">
                          <div className="flex w-53 items-center justify-between">
                            <span className="text-sm font-medium text-[#2C2C2C]">
                              {member.userNickname}
                            </span>
                            <span className="text-xs font-medium text-[#989898]">
                              {getDepartmentName(member.department)}
                            </span>
                          </div>

                          {member.userId === me?.userId ? (
                            <span className="h-6 w-6 rounded-full bg-[#EEF1F5] pt-1 text-center text-[11px] font-semibold text-[#5E92F0]">
                              나
                            </span>
                          ) : (
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setOpenMemberMenuId((prev) =>
                                    prev === member.userId
                                      ? null
                                      : member.userId
                                  )
                                }
                                className="h-6 w-6 cursor-pointer rounded-full p-1 transition duration-200 hover:bg-white"
                              >
                                <MoreVertical
                                  size={16}
                                  className="text-[#989898]"
                                />
                              </button>

                              {openMemberMenuId === member.userId && (
                                <>
                                  <div
                                    onClick={() => setOpenMemberMenuId(null)}
                                    className="fixed inset-0 z-[270]"
                                  />
                                  <div className="absolute top-7 right-0 z-[280] w-[120px] overflow-hidden rounded-xl border-[0.5px] border-[#D6DDE5] bg-white py-1 shadow-md">
                                    <button
                                      onClick={() =>
                                        handleDirectMessage(member)
                                      }
                                      disabled={isCreatingRoom}
                                      className="w-full cursor-pointer px-3 py-2 text-left text-xs text-[#2C2C2C] hover:bg-[#F6F8FA] disabled:opacity-50"
                                    >
                                      1:1 채팅
                                    </button>
                                    <button
                                      onClick={() => handleOpenReport(member)}
                                      disabled={isCreatingRoom}
                                      className="w-full cursor-pointer px-3 py-2 text-left text-xs text-[#e22222] hover:bg-[#FDEEEE] disabled:opacity-50"
                                    >
                                      신고하기
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            {/* 나가기: 항상 하단 고정 */}
            {roomType !== 'TEAM' && (
              <div className="mx-2 mt-3 shrink-0 border-t-[0.5px] border-[#D6DDE5] pt-3">
                <button
                  onClick={() => setConfirmLeave(true)}
                  className="w-full cursor-pointer rounded-xl py-2 text-center text-sm font-semibold text-[#E22222] transition duration-300 hover:bg-[#FDEEEE]"
                >
                  채팅방 나가기
                </button>
              </div>
            )}
          </motion.aside>

          {confirmLeave && (
            <div
              onClick={() => setConfirmLeave(false)}
              className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="animate-modal-pop w-[360px] rounded-3xl bg-white p-6 shadow-xl"
              >
                <h2 className="text-center text-xl font-bold">
                  정말 채팅방을 나가시겠어요?
                </h2>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setConfirmLeave(false)}
                    className="flex-1 rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-2 font-semibold"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleLeave}
                    disabled={isLeaving}
                    className="flex-1 rounded-xl bg-[#E22222] py-3 font-semibold text-white disabled:opacity-50"
                  >
                    나가기
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {reportTarget && (
        <ReportModal
          key={reportTarget.userId}
          targetLabel={`${reportTarget.userNickname}님`}
          isSubmitting={isReportSubmitting}
          onClose={() => {
            if (isReportSubmitting) return;
            setReportTarget(null);
          }}
          onSubmit={handleSubmitReport}
        />
      )}
    </AnimatePresence>
  );
}

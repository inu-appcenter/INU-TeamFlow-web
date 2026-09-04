'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, X, Check, Search } from 'lucide-react';
import { useCreateGroupChatRoom } from '@moimi/core/hooks/chat/useCreateGroupChatRoom';
import { useMyTeams, useTeamMembers } from '@moimi/core/hooks/team/useTeamQuery';
import { getDepartmentName } from '@/utils/getDepartmentName';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { useMyInfo } from '@moimi/core/hooks/useAuthQuery';
import { useCreateDirectChatRoom } from '@moimi/core/hooks/chat/useCreateDirectChatRoom';
import { useErrorToast } from '@/hooks/useErrorToast';
import { getTeamRoleLabel } from '@/utils/teamRole';

type Step = 'team' | 'members' | 'name';

interface Props {
  onClose: () => void;
}

export default function GroupChatCreateModal({ onClose }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('team');
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<number>>(
    new Set()
  );
  const [keyword, setKeyword] = useState('');
  const [roomName, setRoomName] = useState('');

  useLockBodyScroll(true);

  const { data: myTeams, isLoading: isTeamsLoading } = useMyTeams();
  const { data: teamMembers, isLoading: isMembersLoading } = useTeamMembers(
    selectedTeamId ?? 0,
    step === 'members' && !!selectedTeamId
  );
  const { data: me } = useMyInfo();
  const { errorMessage, showErrorMessage } = useErrorToast();

  const filteredMembers = useMemo(() => {
    if (!teamMembers) return [];
    const withoutMe = teamMembers.filter((m) => m.userId !== me?.userId);
    if (!keyword.trim()) return withoutMe;
    return withoutMe.filter((m) =>
      m.userNickname.toLowerCase().includes(keyword.trim().toLowerCase())
    );
  }, [teamMembers, keyword, me?.userId]);

  const isAllSelected =
    filteredMembers.length > 0 &&
    filteredMembers.every((m) => selectedMemberIds.has(m.userId));

  const toggleMember = (userId: number) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (isAllSelected) {
        filteredMembers.forEach((m) => next.delete(m.userId));
      } else {
        filteredMembers.forEach((m) => next.add(m.userId));
      }
      return next;
    });
  };

  const handleSelectTeam = (teamId: number) => {
    setSelectedTeamId(teamId);
    setSelectedMemberIds(new Set());
    setKeyword('');
    setStep('members');
  };

  const handleProceedToName = () => {
    if (selectedMemberIds.size === 0) return;
    setStep('name');
  };

  const { mutateAsync: createGroupRoom, isPending: isCreatingGroup } =
    useCreateGroupChatRoom();
  const { mutateAsync: createDirectRoom, isPending: isCreatingDirect } =
    useCreateDirectChatRoom();

  const isCreating = isCreatingGroup || isCreatingDirect;

  const handleCreate = async () => {
    if (!selectedTeamId || selectedMemberIds.size === 0) return;
    try {
      const memberIds = Array.from(selectedMemberIds);

      const room =
        memberIds.length === 1
          ? await createDirectRoom(memberIds[0])
          : await createGroupRoom({
              teamId: selectedTeamId,
              memberIds,
              roomName: roomName.trim() || null,
            });

      onClose();
      router.push(
        `/chat/${room.chatRoomId}?roomName=${encodeURIComponent(room.roomName)}&roomType=${room.chatRoomType}`
      );
    } catch {
      showErrorMessage('채팅방 생성에 실패했어요');
    }
  };

  const isDirectOnly = selectedMemberIds.size === 1;

  const stepTitle =
    step === 'team'
      ? '채팅 그룹방을 생성할 팀을 선택해주세요'
      : step === 'members'
        ? '초대할 멤버를 선택해주세요'
        : '채팅방 이름을 입력해주세요';

  const handleBack = () => {
    if (step === 'members') setStep('team');
    if (step === 'name') setStep('members');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/20 px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-modal-pop flex max-h-[600px] w-[440px] flex-col rounded-3xl bg-white px-6 py-6 sm:w-[480px]"
      >
        {errorMessage && (
          <div className="animate-modal-pop absolute top-32 left-1/2 z-300 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
            {errorMessage}
          </div>
        )}

        <h2 className="mb-4 flex shrink-0 items-center gap-2 text-xl font-bold text-[#2C2C2C]">
          {step !== 'team' ? (
            <button
              onClick={handleBack}
              className="cursor-pointer text-[#2C2C2C]"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
          ) : (
            <div className="" />
          )}
          {stepTitle}
        </h2>

        {step === 'team' && (
          <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
            {isTeamsLoading ? (
              <p className="pt-4 pb-6 text-center text-sm text-[#9C9C9C]">
                불러오는 중...
              </p>
            ) : myTeams?.length === 0 ? (
              <p className="pt-4 pb-6 text-center text-sm text-[#9C9C9C]">
                소속된 팀이 없어요
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {myTeams?.map((team) => (
                  <li key={team.teamId}>
                    <button
                      type="button"
                      onClick={() => handleSelectTeam(team.teamId)}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-[#F8F9FB] p-3 text-left transition-all duration-150 active:scale-[0.98]"
                    >
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#D6DDE5]">
                        {team.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={team.imageUrl}
                            alt={team.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#3F4852]">
                            {team.name.slice(0, 1)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-bold text-[#2C2C2C]">
                          {team.name}
                        </p>
                        <p className="text-xs text-[#989898]">
                          멤버 {team.memberCount}명
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {step === 'members' && (
          <>
            <div className="mb-2 flex shrink-0 items-center gap-2 rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#F6F8FA] px-3 py-2">
              <Search size={14} className="shrink-0 text-[#989898]" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="이름으로 검색"
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#989898]"
              />
            </div>

            <button
              type="button"
              onClick={toggleSelectAll}
              disabled={filteredMembers.length === 0}
              className="mb-2 flex shrink-0 items-center gap-2 rounded-xl px-2 py-2 text-left transition hover:bg-[#F6F8FA] disabled:opacity-40"
            >
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                  isAllSelected
                    ? 'border-[#5E92F0] bg-[#5E92F0]'
                    : 'border-[#D6DDE5] bg-white'
                }`}
              >
                {isAllSelected && (
                  <Check size={11} className="text-white" strokeWidth={3} />
                )}
              </div>
              <span className="text-sm font-semibold text-[#5E92F0]">
                전체 선택
              </span>
            </button>

            <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
              {isMembersLoading ? (
                <p className="pt-4 pb-6 text-center text-sm text-[#9C9C9C]">
                  불러오는 중...
                </p>
              ) : filteredMembers.length === 0 ? (
                <p className="pt-4 pb-6 text-center text-sm text-[#9C9C9C]">
                  검색 결과가 없어요
                </p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {filteredMembers.map((member) => {
                    const isSelected = selectedMemberIds.has(member.userId);
                    return (
                      <li key={member.teamMemberId}>
                        <button
                          type="button"
                          onClick={() => toggleMember(member.userId)}
                          className={`flex w-full items-center justify-between rounded-2xl p-3 text-left transition-all duration-150 active:scale-[0.98] ${
                            isSelected ? 'bg-[#EEF3FE]' : 'bg-[#F8F9FB]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#D6DDE5] text-sm font-bold text-[#3F4852]">
                              {member.userNickname.slice(0, 1)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                <p className="text-sm font-semibold text-[#2C2C2C]">
                                  {member.userNickname}
                                </p>
                                <span
                                  className={`mx-auto rounded-xl px-2 py-0.5 text-[10px] font-semibold ${
                                    member.teamRole === 'LEADER'
                                      ? 'bg-[#5E92F0] text-white'
                                      : member.teamRole === 'MANAGER'
                                        ? 'bg-[#EEF1F5] px-2 text-[#5E92F0]'
                                        : 'bg-[#EEF1F5] text-[#989898]'
                                  }`}
                                >
                                  {getTeamRoleLabel(member.teamRole)}
                                </span>
                              </div>
                              <p className="mt-0.5 text-xs text-[#989898]">
                                {getDepartmentName(member.department)}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                              isSelected
                                ? 'border-[#5E92F0] bg-[#5E92F0]'
                                : 'border-[#D6DDE5] bg-white'
                            }`}
                          >
                            {isSelected && (
                              <Check
                                size={13}
                                className="text-white"
                                strokeWidth={3}
                              />
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <button
              onClick={handleProceedToName}
              disabled={selectedMemberIds.size === 0}
              className="mt-4 w-full shrink-0 cursor-pointer rounded-xl bg-[#5E92F0] py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
            >
              {selectedMemberIds.size > 0
                ? `${selectedMemberIds.size}명 초대하고 다음`
                : '초대할 멤버를 선택해주세요'}
            </button>
          </>
        )}

        {step === 'name' && (
          <>
            <div className="min-h-0 flex-1">
              {isDirectOnly ? (
                <span className="gap-2 text-center">
                  <p className="mb-1 text-[15px] font-semibold text-[#2c2c2c]">
                    1명과의 채팅은 1:1 채팅방으로 만들어져요
                  </p>
                  <p className="mb-2 text-[14px] text-[#b0b0b0]">
                    이름은 자동으로 설정됩니다
                  </p>
                </span>
              ) : (
                <>
                  <input
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value.slice(0, 30))}
                    placeholder="예: 디자인팀 회의방"
                    maxLength={30}
                    autoFocus
                    className="w-full rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-4 py-3 text-sm font-medium outline-none placeholder:text-[#989898]"
                  />
                  <p className="mt-2 text-xs text-[#989898]">
                    입력하지 않으면 참여자 이름으로 자동 설정됩니다
                  </p>
                </>
              )}
            </div>

            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="mt-4 w-full shrink-0 cursor-pointer rounded-xl bg-[#5E92F0] py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
            >
              채팅방 만들기
            </button>
          </>
        )}
      </div>
    </div>
  );
}

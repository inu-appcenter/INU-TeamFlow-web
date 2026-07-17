'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Search } from 'lucide-react';
import { TeamMemberResponse } from '@/types/team';
import { getDepartmentName } from '@/utils/getDepartmentName';
import { getTeamRoleLabel } from '@/utils/teamRole';
import { formatChatTime } from '@/utils/date/formatChatTime';
import { useMyInfo } from '@/hooks/useAuthQuery';
import { useCreateDirectChatRoom } from '@/hooks/chat/useCreateDirectChatRoom';
import { useTeamChatRoom } from '@/hooks/chat/useTeamChatRoom';

type InviteUser = {
  studentNumber: string;
  name: string;
};

type TeamMemberDrawerProps = {
  open: boolean;
  onClose: () => void;
  teamId: number;
  teamMembers: TeamMemberResponse[];
  isAdmin: boolean;
  keyword: string;
  onKeywordChange: (value: string) => void;
  filteredUsers: InviteUser[];
  onInvite: (studentNumber: string) => void;
  isInviting: boolean;
};

const TABS = [
  { key: 'members', label: '멤버 목록' },
  { key: 'chats', label: '팀 채팅방' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function TeamMemberDrawer({
  open,
  onClose,
  teamId,
  teamMembers,
  isAdmin,
  keyword,
  onKeywordChange,
  filteredUsers,
  onInvite,
  isInviting,
}: TeamMemberDrawerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('members');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const { data: me } = useMyInfo();
  const { mutateAsync: createDirectRoom, isPending: isCreatingRoom } =
    useCreateDirectChatRoom();

  const { data: teamChatRooms, isLoading: isChatRoomsLoading } =
    useTeamChatRoom(teamId);

  const handleAssignManager = (member: TeamMemberResponse) => {
    console.log('매니저 지정', member);
    setOpenMenuId(null);
  };

  const handleTransferLeader = (member: TeamMemberResponse) => {
    console.log('팀장 권한 넘기기', member);
    setOpenMenuId(null);
  };

  const handleKick = (member: TeamMemberResponse) => {
    console.log('추방', member);
    setOpenMenuId(null);
  };

  const handleDirectMessage = async (member: TeamMemberResponse) => {
    setOpenMenuId(null);
    const room = await createDirectRoom(member.userId);
    router.push(
      `/chat/${room.chatRoomId}?roomName=${encodeURIComponent(room.roomName)}&roomType=${room.chatRoomType}`
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="member-drawer-overlay"
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
            className="fixed top-0 right-0 z-[260] flex h-full w-full max-w-[360px] flex-col bg-white px-6 py-6 shadow-xl"
          >
            {/* 탭 */}
            <div className="mt-4 flex shrink-0 border-b-[0.5px] border-[#D6DDE5]">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex-1 cursor-pointer pb-3 text-center text-[16px] font-bold whitespace-nowrap transition ${
                    activeTab === tab.key
                      ? 'text-[#5E92F0]'
                      : 'text-[#CBD2DA] hover:text-[#5E92F0]'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="memberDrawerTabIndicator"
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-[#5E92F0]"
                      transition={{
                        type: 'spring',
                        stiffness: 600,
                        damping: 50,
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* 멤버 목록 탭 */}
            {activeTab === 'members' && (
              <>
                {isAdmin && (
                  <div className="mt-3 flex shrink-0 items-center gap-2 rounded-xl border-[0.5px] border-[#D6DDE5] bg-[#F6F8FA] px-3 py-2">
                    <Search size={14} className="text-[#989898]" />
                    <input
                      value={keyword}
                      onChange={(e) => onKeywordChange(e.target.value)}
                      placeholder="이름 검색 후 초대"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-[#989898]"
                    />
                  </div>
                )}

                {isAdmin && keyword && (
                  <div className="thin-scrollbar mt-2 flex max-h-[180px] shrink-0 flex-col overflow-y-auto rounded-xl border-[0.5px] border-[#D6DDE5]">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.studentNumber}
                        className="flex items-center justify-between px-3 py-2 hover:bg-[#F6F8FA]"
                      >
                        <div className="">
                          <p className="text-sm font-medium text-[#2C2C2C]">
                            {user.name}
                          </p>
                          <p className="text-xs text-[#989898]">
                            {user.studentNumber}
                          </p>
                        </div>
                        <button
                          onClick={() => onInvite(user.studentNumber)}
                          disabled={isInviting}
                          className="cursor-pointer rounded-full bg-[#5E92F0] px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          추가
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="mt-4 shrink-0 text-xs font-medium text-[#989898]">
                  멤버 ({teamMembers.length})
                </p>

                <div className="thin-scrollbar mt-2 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
                  {teamMembers.map((member) => (
                    <div
                      key={member.teamMemberId}
                      className="relative flex items-center justify-between rounded-xl bg-[#F8F9FB] py-2 pr-3 pl-4 text-sm text-[#2C2C2C]"
                    >
                      <div className="flex items-center">
                        <span className="w-20">{member.username}</span>

                        <span className="w-32 truncate text-xs text-[#989898]">
                          {getDepartmentName(member.department)}
                        </span>
                        <span
                          className={`rounded-xl px-3 py-1 text-xs font-semibold ${
                            member.teamRole === 'LEADER'
                              ? 'bg-[#5E92F0] text-white'
                              : member.teamRole === 'MANAGER'
                                ? 'bg-[#EEF1F5] text-[#5E92F0]'
                                : 'bg-[#EEF1F5] text-[#989898]'
                          }`}
                        >
                          {getTeamRoleLabel(member.teamRole)}
                        </span>
                      </div>

                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenMenuId((prev) =>
                              prev === member.teamMemberId
                                ? null
                                : member.teamMemberId
                            )
                          }
                          className="cursor-pointer rounded-full p-1 hover:bg-[#EEF1F5]"
                        >
                          <MoreVertical size={16} className="text-[#989898]" />
                        </button>

                        {openMenuId === member.teamMemberId && (
                          <>
                            <div
                              onClick={() => setOpenMenuId(null)}
                              className="fixed inset-0 z-[270]"
                            />
                            <div className="absolute top-7 right-0 z-[280] w-[140px] overflow-hidden rounded-xl border-[0.5px] border-[#D6DDE5] bg-white py-1">
                              {member.userId !== me?.userId && (
                                <button
                                  onClick={() => handleDirectMessage(member)}
                                  disabled={isCreatingRoom}
                                  className="w-full cursor-pointer px-3 py-2 text-left text-xs text-[#2C2C2C] hover:bg-[#F6F8FA] disabled:opacity-50"
                                >
                                  1:1 채팅
                                </button>
                              )}

                              {isAdmin && (
                                <>
                                  <button
                                    onClick={() => handleAssignManager(member)}
                                    className="w-full cursor-pointer px-3 py-2 text-left text-xs text-[#2C2C2C] hover:bg-[#F6F8FA]"
                                  >
                                    매니저 지정
                                  </button>
                                  <button
                                    onClick={() => handleTransferLeader(member)}
                                    className="w-full cursor-pointer px-3 py-2 text-left text-xs text-[#2C2C2C] hover:bg-[#F6F8FA]"
                                  >
                                    팀장 권한 넘기기
                                  </button>
                                  <button
                                    onClick={() => handleKick(member)}
                                    className="w-full cursor-pointer px-3 py-2 text-left text-xs text-[#E22222] hover:bg-[#FDEEEE]"
                                  >
                                    제거
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 팀 채팅방 탭 */}
            {activeTab === 'chats' && (
              <div className="thin-scrollbar mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
                {isChatRoomsLoading ? (
                  <div className="flex h-[100px] items-center justify-center text-sm text-[#989898]">
                    불러오는 중...
                  </div>
                ) : teamChatRooms && teamChatRooms.length > 0 ? (
                  teamChatRooms.map((room) => (
                    <button
                      key={room.chatRoomId}
                      onClick={() =>
                        router.push(
                          `/chat/${room.chatRoomId}?roomName=${encodeURIComponent(room.roomName)}&roomType=${room.chatRoomType}`
                        )
                      }
                      className="z-50 flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-[#F6F8FB] p-3 text-left transition hover:bg-[#F0F2F5]"
                    >
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#D6DDE5]">
                        {room.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={room.imageUrl}
                            alt={room.roomName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#3F4852]">
                            {room.roomName.slice(0, 1)}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-bold text-[#2C2C2C]">
                            {room.roomName}
                          </p>
                          <span className="shrink-0 text-[11px] text-[#B0B0B0]">
                            {formatChatTime(room.lastMessageAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-xs text-[#989898]">
                            {room.lastMessage ?? '메시지를 보내보세요'}
                          </p>
                          {room.unreadCount > 0 && (
                            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#5E92F0] px-1.5 text-[11px] font-semibold text-white">
                              {room.unreadCount > 99 ? '99+' : room.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex h-[100px] items-center justify-center text-sm text-[#989898]">
                    참여 중인 채팅방이 없어요
                  </div>
                )}
              </div>
            )}

            <div className="mt-3 shrink-0 border-t-[0.5px] border-[#D6DDE5] pt-3">
              <button
                // onClick={handleLeaveTeam}
                className="w-full cursor-pointer rounded-xl py-2 text-center text-sm font-semibold text-[#E22222] transition duration-300 hover:bg-[#FDEEEE]"
              >
                팀 나가기
              </button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

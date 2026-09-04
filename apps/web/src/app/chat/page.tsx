'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import BottomNav from '@/components/common/bottom-nav/BottomNav';
import NotificationButton from '@/components/common/notification/NotificationButton';
import Card from '@/components/main/Card';
import GroupChatCreateModal from '@/components/chat/GroupChatCreateModal';
import { useChatRooms } from '@moimi/core/hooks/chat/useChatRooms';
import { ChatRoomListSkeleton } from '@/components/skeleton/ChatListSkeleton';
import { formatChatTime } from '@/utils/date/formatChatTime';

type ChatTab = 'TEAM' | 'DIRECT';

const TABS: { key: ChatTab; label: string }[] = [
  { key: 'TEAM', label: '팀 채팅' },
  { key: 'DIRECT', label: '1:1 채팅' },
];

export default function ChatListPage() {
  const [activeTab, setActiveTab] = useState<ChatTab>('TEAM');
  const { data: teamRooms = [], isLoading: isTeamLoading } =
    useChatRooms('TEAM');
  const { data: groupRooms = [], isLoading: isGroupLoading } =
    useChatRooms('GROUP');
  const { data: directRooms = [], isLoading: isDirectLoading } =
    useChatRooms('DIRECT');
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const router = useRouter();

  const chatRooms =
    activeTab === 'DIRECT' ? directRooms : [...teamRooms, ...groupRooms];

  const isLoading =
    activeTab === 'DIRECT' ? isDirectLoading : isTeamLoading || isGroupLoading;

  const hasUnread = {
    TEAM:
      [...teamRooms, ...groupRooms].some((room) => room.unreadCount > 0) ??
      false,

    DIRECT: directRooms.some((room) => room.unreadCount > 0) ?? false,
  };

  const visibleRooms = chatRooms.filter((room) => {
    // 팀 채팅은 항상 노출
    if (room.chatRoomType === 'TEAM') {
      return true;
    }
    // 그룹 채팅은 메시지가 있는 경우만 노출
    if (room.chatRoomType === 'GROUP') {
      return !!room.lastMessageAt;
    }
    // 1:1은 그대로
    return true;
  });
  // 최근 메시지 순 정렬 (없는 방은 맨 아래로)
  const filteredRooms = [...visibleRooms].sort((a, b) => {
    if (!a.lastMessageAt && !b.lastMessageAt) return 0;
    if (!a.lastMessageAt) return 1;
    if (!b.lastMessageAt) return -1;

    return (
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  });

  return (
    <main className="h-screen overflow-hidden bg-[#F0F2F5] px-3 pt-4 sm:px-6 sm:pt-6">
      <div className="hidden lg:block">
        <NotificationButton />
      </div>

      <section className="mx-auto mt-8 flex h-[calc(100vh-48px)] min-h-0 max-w-[800px] flex-col sm:mt-12 sm:min-h-[calc(100vh-72px)]">
        <div className="mb-3 flex items-end justify-between pl-4">
          <h1 className="text-2xl font-bold text-[#2C2C2C]">나의 채팅 목록</h1>
          <button
            onClick={() => setIsGroupModalOpen(true)}
            className="z-50 flex cursor-pointer items-center gap-1 rounded-lg bg-[#5E92F0] py-2.5 pr-4 pl-3.5 text-[15px] font-medium text-white transition transition-all duration-150 hover:bg-[#4C82E5] active:scale-90"
          >
            <Plus size={18} strokeWidth={2.5} />
            채팅 생성하기
          </button>
        </div>

        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-none p-5">
          <div className="relative mb-3 flex border-b-[0.5px] border-[#D6DDE5]">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative z-50 flex-1 cursor-pointer pb-4 text-center text-lg font-bold whitespace-nowrap transition sm:text-xl md:pb-4 ${
                  activeTab === tab.key
                    ? 'text-[#5E92F0]'
                    : 'text-[#CBD2DA] hover:text-[#5E92F0]'
                }`}
              >
                <span className="relative inline-flex items-center">
                  {tab.label}
                  {hasUnread[tab.key] && (
                    <span className="absolute -top-0.5 -right-3 h-1.5 w-1.5 rounded-full bg-[#5E92F0]" />
                  )}
                </span>
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="chatTabIndicator"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-[#5E92F0]"
                    transition={{ type: 'spring', stiffness: 600, damping: 50 }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
            {isLoading ? (
              <ChatRoomListSkeleton />
            ) : filteredRooms.length === 0 ? (
              <div className="flex h-50 flex-col items-center justify-center gap-2 text-center">
                <p className="text-sm text-[#9C9C9C]">
                  {activeTab === 'TEAM'
                    ? '아직 팀 채팅방이 없어요'
                    : '아직 1:1 채팅방이 없어요'}
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2 pb-32">
                {filteredRooms.map((room) => (
                  <li key={room.chatRoomId}>
                    <button
                      onClick={() =>
                        router.push(
                          `/chat/${room.chatRoomId}?roomName=${encodeURIComponent(room.roomName)}&roomType=${room.chatRoomType}&roomImageUrl=${encodeURIComponent(room.imageUrl ?? '')}`
                        )
                      }
                      className="z-50 flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-[#F6F8Fb] p-4 text-left transition hover:bg-[#F0F2F5]"
                    >
                      <div
                        className={`relative h-12 w-12 shrink-0 overflow-hidden bg-[#D6DDE5] sm:h-14 sm:w-14 ${
                          room.chatRoomType === 'DIRECT'
                            ? 'rounded-full'
                            : 'rounded-xl'
                        }`}
                      >
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
                          <p className="truncate text-[15px] font-bold text-[#2C2C2C]">
                            {room.roomName}
                          </p>
                          <span className="shrink-0 text-xs text-[#B0B0B0]">
                            {formatChatTime(room.lastMessageAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm text-[#989898]">
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
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </section>

      <BottomNav />
      {isGroupModalOpen && (
        <GroupChatCreateModal onClose={() => setIsGroupModalOpen(false)} />
      )}
    </main>
  );
}

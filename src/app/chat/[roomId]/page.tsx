'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ImagePlus, Send, Menu, ChevronDown } from 'lucide-react';
import { useChatMessageAnchor } from '@/hooks/chat/useChatMessageAnchor';
import { useChatMessageHistory } from '@/hooks/chat/useChatMessageHistory';
import { isEmojiOnlyMessage } from '@/utils/isEmojiOnly';
import {
  formatChatDate,
  isSameDay,
  isSameMinute,
} from '@/utils/date/formatChatDate';
import { useChatRoomMembers } from '@/hooks/chat/useChatRoomMembers';
import NotificationButton from '@/components/common/notification/NotificationButton';
import { formatChatMessageTime } from '@/utils/date/formatChatMessageTime';
import { useChatSocketContext } from '@/contexts/ChatSocketContext';
import { useSendChatMessage } from '@/hooks/chat/useSendChatMessage';
import { useChatMessageSubscription } from '@/hooks/chat/useChatMessageSubscription';
import { useChatReadEventSubscription } from '@/hooks/chat/useChatReadEventSubscription';
import { useMarkRoomRead } from '@/hooks/chat/useMarkRoomRead';
import { useChatImageUpload } from '@/hooks/chat/useChatImageUpload';
import { useMyInfo } from '@/hooks/useAuthQuery';
import type { ChatMessageResponse } from '@/types/chat';
import ChatRoomDrawer from '@/components/chat/ChatRoomDrawer';

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = Number(params.roomId);

  // roomId가 바뀔 때마다(다른 방으로 이동) 이 페이지의 모든 로컬 state/ref를
  // 새로 마운트된 것처럼 초기화하기 위해 key를 준다.
  return <ChatRoomPageInner key={roomId} roomId={roomId} />;
}

function ChatRoomPageInner({ roomId }: { roomId: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: anchor, isLoading } = useChatMessageAnchor(roomId);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [roomInfo, setRoomInfo] = useState<{
    roomName: string;
    roomImageUrl: string | null;
  }>({
    roomName: searchParams.get('roomName') ?? '',
    roomImageUrl: searchParams.get('roomImageUrl') || null,
  });

  const oldestLoadedId = anchor?.messages[0]?.chatMessageId;

  const {
    data: historyPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessageHistory(roomId, oldestLoadedId, !!anchor);

  const allMessages = useMemo<ChatMessageResponse[]>(() => {
    const older = historyPages?.pages.flatMap((p) => p.content) ?? [];
    const merged = [...older, ...(anchor?.messages ?? [])];
    const deduped = Array.from(
      new Map(merged.map((m) => [m.chatMessageId, m])).values()
    );
    return deduped.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [historyPages, anchor?.messages]);

  const { data: me } = useMyInfo();
  const { isConnected } = useChatSocketContext();
  const { sendMessage } = useSendChatMessage(roomId);
  const { mutateAsync: uploadImage, isPending: isUploading } =
    useChatImageUpload();
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // --- 읽음 표시 로직 (요구사항 4단계) ---
  // 2) 새 메시지 소켓 수신 -> anchor 캐시에 append
  useChatMessageSubscription(roomId);
  // 3) 상대방의 읽음 이벤트 소켓 수신 -> readCount/lastReadMessageId 반영
  useChatReadEventSubscription(roomId);
  // 1)/2)/4) 방 진입, 실시간 수신, 화면 이탈/백그라운드 전환 시 내 읽음 상태를 서버로 전송
  const lastMessageId =
    anchor?.messages[anchor.messages.length - 1]?.chatMessageId;
  useMarkRoomRead(roomId, lastMessageId);

  // 방에 "진입한 시점"의 읽음 위치를 고정해서 보여주기 위한 스냅샷.
  // anchor.lastReadMessageId를 그대로 쓰면 내 읽음 처리로 쿼리가 갱신되는 순간
  // 구분선이 화면을 보고 있는 도중에 사라져 버리므로, 진입 시점 값만 한 번 캡처해서
  // 이 화면에 머무는 동안은 고정해둔다. (roomId 변경 시엔 key로 인해 컴포넌트가
  // 통째로 리마운트되므로 별도의 리셋 처리가 필요 없다)
  const [frozenLastReadMessageId, setFrozenLastReadMessageId] = useState<
    number | null
  >(null);
  const hasFrozenReadDividerRef = useRef(false);

  useEffect(() => {
    if (anchor && !hasFrozenReadDividerRef.current) {
      setFrozenLastReadMessageId(anchor.lastReadMessageId);
      hasFrozenReadDividerRef.current = true;
    }
  }, [anchor]);

  // 위로 스크롤 시 이전 메시지 로드
  const prevScrollHeightRef = useRef(0);

  useEffect(() => {
    const container = scrollRef.current;
    const sentinel = topSentinelRef.current;
    if (!container || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          prevScrollHeightRef.current = container.scrollHeight;
          fetchNextPage();
        }
      },
      { root: container, threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 스크롤이 맨 아래에서 떨어지면 "아래로" 버튼 표시
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      setShowScrollToBottom(distanceFromBottom > 200); // 200px 이상 떨어지면 표시
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // 이전 메시지 로드 후 스크롤 위치 보정 (튐 방지)
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || prevScrollHeightRef.current === 0) return;

    const diff = container.scrollHeight - prevScrollHeightRef.current;
    container.scrollTop += diff;
    prevScrollHeightRef.current = 0;
  }, [historyPages]);

  // 최초 진입 시 맨 아래로 스크롤 (한 번만)
  const hasScrolledToBottomRef = useRef(false);

  useEffect(() => {
    if (!isLoading && scrollRef.current && !hasScrolledToBottomRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      hasScrolledToBottomRef.current = true;
    }
  }, [isLoading]);

  // 새 메시지 오면 맨 아래로 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [anchor?.messages.length]);

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage({ messageType: 'TEXT', content: draft });
    setDraft('');
  };

  const handleImageClick = () => fileInputRef.current?.click();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const imageKey = await uploadImage(file);
    sendMessage({ messageType: 'IMAGE', imageKey });
  };

  const roomType =
    (searchParams.get('roomType') as 'TEAM' | 'DIRECT' | 'GROUP') ?? 'TEAM';

  const currentUserId = me?.userId;

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  return (
    <main className="h-screen overflow-hidden bg-[#F0F2F5] px-3 sm:px-6">
      <div className="hidden lg:block">
        <NotificationButton />
      </div>

      <section className="relative mx-auto flex h-full min-h-0 max-w-[800px] flex-1 flex-col bg-white">
        <header className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between bg-white/70 backdrop-blur-sm">
          <div className="flex items-center gap-3 px-6 py-4">
            <button
              onClick={() => router.back()}
              className="cursor-pointer text-[#2c2c2c]"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
            <div
              className={`relative h-10 w-10 shrink-0 overflow-hidden bg-[#D6DDE5] ${
                roomType === 'DIRECT' ? 'rounded-full' : 'rounded-xl'
              }`}
            >
              {roomInfo.roomImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={roomInfo.roomImageUrl}
                  alt={roomInfo.roomName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#3F4852]">
                  {roomInfo.roomName.slice(0, 1)}
                </div>
              )}
            </div>
            <h1 className="truncate text-[20px] font-semibold text-[#2C2C2C]">
              {roomInfo.roomName}
            </h1>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="mr-7 cursor-pointer rounded-full p-2 transition duration-200 active:scale-90"
          >
            <Menu size={22} />
          </button>
        </header>

        <div
          ref={scrollRef}
          className="thin-scrollbar flex-1 overflow-y-auto pt-13 pr-2 pb-4 pl-4"
          style={{ scrollbarGutter: 'stable' }}
        >
          {isLoading || !anchor ? (
            <div className="flex h-full items-center justify-center text-sm text-[#9C9C9C]">
              불러오는 중...
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              <div ref={topSentinelRef} className="h-1" />
              {isFetchingNextPage && (
                <div className="py-2 text-center text-xs text-[#9C9C9C]">
                  불러오는 중...
                </div>
              )}
              {allMessages.map((message, index) => {
                const isMine = message.senderId === currentUserId;
                const prevMessage = allMessages[index - 1];
                const nextMessage = allMessages[index + 1];
                const unreadCount = Math.max(
                  0,
                  message.visibleMemberCount - message.readCount
                );

                const showDateDivider =
                  !prevMessage ||
                  !isSameDay(prevMessage.createdAt, message.createdAt);
                const isSameSenderAsPrev =
                  !showDateDivider &&
                  prevMessage?.messageType !== 'SYSTEM' &&
                  prevMessage?.senderId === message.senderId;

                // 다음 메시지가 같은 사람 + 같은 분(分)이면 지금 메시지엔 시간 숨김
                const showTime =
                  !nextMessage ||
                  nextMessage.senderId !== message.senderId ||
                  !isSameMinute(message.createdAt, nextMessage.createdAt);

                const showReadDivider =
                  frozenLastReadMessageId !== null &&
                  prevMessage?.chatMessageId === frozenLastReadMessageId &&
                  message.chatMessageId !== frozenLastReadMessageId;

                return (
                  <div key={message.chatMessageId}>
                    {showDateDivider && (
                      <div className="my-4 flex items-center justify-center">
                        <span className="rounded-full bg-[#D6DDE5]/30 px-3 py-1 text-xs font-medium text-[#989898]">
                          {formatChatDate(message.createdAt)}
                        </span>
                      </div>
                    )}

                    {message.messageType === 'SYSTEM' ? (
                      <div className="my-2 flex items-center justify-center">
                        <span className="rounded-full bg-[#F6F8FB] px-3 py-1.5 text-xs font-medium text-[#989898]">
                          {message.content}
                        </span>
                      </div>
                    ) : (
                      <>
                        {showReadDivider && (
                          <div className="my-4 flex items-center gap-2">
                            <div className="h-px flex-1 bg-[#D6DDE5]" />
                            <span className="text-xs font-medium text-[#989898]">
                              여기까지 읽음
                            </span>
                            <div className="h-px flex-1 bg-[#D6DDE5]" />
                          </div>
                        )}

                        <div
                          className={`flex items-end gap-2 ${
                            isMine ? 'flex-row-reverse' : 'flex-row'
                          } ${isSameSenderAsPrev ? 'mt-1' : 'mt-4'}`}
                        >
                          {!isMine &&
                            roomType !== 'DIRECT' &&
                            !isSameSenderAsPrev && (
                              <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#D6DDE5]">
                                {message.senderProfileUrl && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={message.senderProfileUrl}
                                    alt={message.senderName}
                                    className="h-full w-full object-cover"
                                  />
                                )}
                              </div>
                            )}

                          {!isMine &&
                            roomType !== 'DIRECT' &&
                            isSameSenderAsPrev && (
                              <div className="w-8 shrink-0" />
                            )}

                          <div
                            className={`flex max-w-[70%] flex-col ${
                              isMine ? 'items-end' : 'items-start'
                            }`}
                          >
                            {!isMine &&
                              roomType !== 'DIRECT' &&
                              !isSameSenderAsPrev && (
                                <span className="mb-1 px-1 text-xs font-medium text-[#989898]">
                                  {message.senderName}
                                </span>
                              )}

                            <div className="flex items-end gap-1">
                              {isMine && (
                                <div className="mb-0.5 flex flex-col items-end">
                                  {unreadCount > 0 && (
                                    <span className="text-[10px] font-medium text-[#5E92F0]">
                                      {unreadCount}
                                    </span>
                                  )}
                                  {showTime && (
                                    <span className="text-[10px] text-[#B0b0b0]">
                                      {formatChatMessageTime(message.createdAt)}
                                    </span>
                                  )}
                                </div>
                              )}

                              {message.messageType === 'IMAGE' &&
                              message.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={message.imageUrl}
                                  alt="전송된 이미지"
                                  className="max-h-64 rounded-2xl object-cover"
                                />
                              ) : message.content &&
                                isEmojiOnlyMessage(message.content) ? (
                                <div className="px-1 py-1 text-[40px] leading-none">
                                  {message.content}
                                </div>
                              ) : (
                                <div
                                  className={`rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed break-words ${
                                    isMine
                                      ? 'rounded-br-sm bg-[#5E92F0] text-white'
                                      : 'rounded-bl-sm bg-[#F6F8FB] text-[#2C2C2C]'
                                  }`}
                                >
                                  {message.content}
                                </div>
                              )}

                              {!isMine && (
                                <div className="mb-0.5 flex flex-col items-start">
                                  {unreadCount > 0 && (
                                    <span className="text-[10px] font-medium text-[#5E92F0]">
                                      {unreadCount}
                                    </span>
                                  )}
                                  {showTime && (
                                    <span className="text-[10px] text-[#B6B6B6]">
                                      {formatChatMessageTime(message.createdAt)}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <AnimatePresence>
            {showScrollToBottom && (
              <motion.button
                onClick={scrollToBottom}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-30 left-1/2 flex h-9 w-9 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-[#989898] shadow-[0_4px_12px_rgba(149,157,165,0.25)] transition hover:bg-[#F6F8FA]"
              >
                <ChevronDown size={20} strokeWidth={2.5} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 bg-[#F6F8FA] px-6 py-4 pb-10">
          <button
            onClick={handleImageClick}
            className="shrink-0 cursor-pointer px-2"
          >
            <ImagePlus size={24} className="text-[#5e92f0]" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />

          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                handleSend();
              }
            }}
            placeholder="메시지를 입력하세요"
            className="flex-1 rounded-full bg-white px-4 py-2.5 text-[15px] placeholder:text-[#b0b0b0] focus:outline-none"
          />

          <button
            onClick={handleSend}
            disabled={!draft.trim() || isUploading || !isConnected}
            className="cursor-pointer px-2 disabled:opacity-30"
          >
            <Send size={22} className="text-[#5E92F0]" />
          </button>
        </div>
        <ChatRoomDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          roomId={roomId}
          roomType={roomType}
          roomName={roomInfo.roomName}
          roomImageUrl={roomInfo.roomImageUrl}
          onInfoUpdated={(next) =>
            setRoomInfo((prev) => ({ ...prev, ...next }))
          }
        />
      </section>
    </main>
  );
}

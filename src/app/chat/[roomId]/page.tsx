'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ImagePlus, Send, Menu } from 'lucide-react';
import { useChatMessageAnchor } from '@/hooks/chat/useChatMessageAnchor';
import { useChatMessageHistory } from '@/hooks/chat/useChatMessageHistory';
import { formatChatDate, isSameDay } from '@/utils/date/formatChatDate';
import NotificationButton from '@/components/common/notification/NotificationButton';
import { formatTime } from '@/utils/date/formatTime';
import { useChatSocketContext } from '@/contexts/ChatSocketContext';
import { useSendChatMessage } from '@/hooks/chat/useSendChatMessage';
import { useChatMessageSubscribe } from '@/hooks/chat/useChatMessageSubscribe';
import { useChatImageUpload } from '@/hooks/chat/useChatImageUpload';
import { useMyInfo } from '@/hooks/useAuthQuery';
import { useMarkChatAsRead } from '@/hooks/chat/useMarkChatAsRead';
import type { ChatMessageResponse } from '@/types/chat';
import ChatRoomDrawer from '@/components/chat/ChatRoomDrawer';

export default function ChatRoomPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = Number(params.roomId);

  const { data: anchor, isLoading } = useChatMessageAnchor(roomId);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [roomInfo, setRoomInfo] = useState({
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
  const { mutate: markAsRead } = useMarkChatAsRead(roomId);

  useChatMessageSubscribe(roomId);

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

  // 읽음 처리
  useEffect(() => {
    if (!anchor?.messages.length) return;
    const lastMessageId =
      anchor.messages[anchor.messages.length - 1].chatMessageId;
    markAsRead(lastMessageId);
  }, [anchor?.messages.length, roomId]);

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
    (searchParams.get('roomType') as 'TEAM' | 'DIRECT') ?? 'TEAM';

  const currentUserId = me?.userId;

  return (
    <main className="h-screen overflow-hidden bg-[#F0F2F5] px-3 sm:px-6">
      <div className="hidden lg:block">
        <NotificationButton />
      </div>

      <section className="mx-auto flex h-full min-h-0 max-w-[800px] flex-1 flex-col bg-white">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3 bg-white px-6 pt-5">
            <button
              onClick={() => router.back()}
              className="cursor-pointer text-[#2c2c2c]"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
            <div
              className={`relative h-10 w-10 shrink-0 overflow-hidden bg-[#D6DDE5] ${
                roomType === 'TEAM' ? 'rounded-xl' : 'rounded-full'
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
            className="mt-5 mr-7 cursor-pointer rounded-full p-2 transition duration-200 hover:bg-[#EEF1F5]"
          >
            <Menu size={22} />
          </button>
        </header>

        <div
          ref={scrollRef}
          className="thin-scrollbar flex-1 overflow-y-auto px-6 py-2"
        >
          {isLoading || !anchor ? (
            <div className="flex h-full items-center justify-center text-sm text-[#9C9C9C]">
              불러오는 중...
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <div ref={topSentinelRef} className="h-1" />
              {isFetchingNextPage && (
                <div className="py-2 text-center text-xs text-[#9C9C9C]">
                  불러오는 중...
                </div>
              )}
              {allMessages.map((message, index) => {
                const isMine = message.senderId === currentUserId;
                const prevMessage = allMessages[index - 1];
                const showDateDivider =
                  !prevMessage ||
                  !isSameDay(prevMessage.createdAt, message.createdAt);
                const isSameSenderAsPrev =
                  !showDateDivider &&
                  prevMessage?.senderId === message.senderId;

                const showReadDivider =
                  anchor.lastReadMessageId !== null &&
                  prevMessage?.chatMessageId === anchor.lastReadMessageId &&
                  message.chatMessageId !== anchor.lastReadMessageId;

                return (
                  <div key={message.chatMessageId}>
                    {showDateDivider && (
                      <div className="my-4 flex items-center justify-center">
                        <span className="rounded-full bg-[#D6DDE5]/30 px-3 py-1 text-xs font-medium text-[#989898]">
                          {formatChatDate(message.createdAt)}
                        </span>
                      </div>
                    )}
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
                        roomType === 'TEAM' &&
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

                      {!isMine && roomType === 'TEAM' && isSameSenderAsPrev && (
                        <div className="w-8 shrink-0" />
                      )}

                      <div
                        className={`flex max-w-[70%] flex-col ${
                          isMine ? 'items-end' : 'items-start'
                        }`}
                      >
                        {!isMine &&
                          roomType === 'TEAM' &&
                          !isSameSenderAsPrev && (
                            <span className="mb-1 px-1 text-xs font-medium text-[#989898]">
                              {message.senderName}
                            </span>
                          )}

                        <div className="flex items-end gap-1">
                          {isMine && (
                            <span className="mb-0.5 text-[10px] text-[#B0b0b0]">
                              {formatTime(message.createdAt)}
                            </span>
                          )}

                          {message.messageType === 'IMAGE' &&
                          message.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={message.imageUrl}
                              alt="전송된 이미지"
                              className="max-h-64 rounded-2xl object-cover"
                            />
                          ) : (
                            <div
                              className={`rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed break-words ${
                                isMine
                                  ? 'rounded-br-sm bg-[#5E92F0] text-white'
                                  : 'rounded-bl-sm bg-[#F6F8FB] text-[#2C2C2C]'
                              }`}
                            >
                              {message.content}
                            </div>
                          )}

                          {!isMine && (
                            <span className="mb-0.5 text-[10px] text-[#B6B6B6]">
                              {formatTime(message.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

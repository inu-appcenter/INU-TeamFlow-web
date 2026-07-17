import type { PresignedUrlRequest, PresignedUrlResponse } from './image';

// ── 공통 enum ──
export type ChatRoomType = 'TEAM' | 'DIRECT';
export type ChatMessageType = 'TEXT' | 'IMAGE';

// ── 채팅방 목록 ──
export interface ChatRoomSummaryResponse {
  chatRoomId: number;
  chatRoomType: ChatRoomType;
  teamId: number | null;
  roomName: string;
  imageUrl: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

// ── 메시지 ──
export interface ChatMessageResponse {
  chatMessageId: number;
  chatRoomId: number;
  senderId: number;
  senderName: string;
  senderProfileUrl: string | null;
  messageType: ChatMessageType;
  content: string | null;
  imageUrl: string | null;
  createdAt: string;
}

// GET /chat-rooms?type=TEAM|DIRECT
export interface ChatRoomListParams {
  type: ChatRoomType;
}

// GET /chat-rooms/{roomId}/messages/initial
export interface ChatMessageAnchorResponse {
  lastReadMessageId: number | null;
  hasMoreBefore: boolean;
  messages: ChatMessageResponse[];
}

// GET /chat-rooms/{roomId}/messages (cursor 히스토리)
export interface ChatMessageHistoryParams {
  cursor?: number;
  size?: number; // 기본 30
}

export interface ChatMessageSliceResponse {
  content: ChatMessageResponse[];
  hasNext: boolean;
}

// POST /chat-rooms/{roomId}/read
export interface ChatReadRequest {
  lastReadMessageId: number;
}
// POST /chat-rooms/direct
export interface DirectChatRoomCreateRequest {
  targetUserId: number;
}

// POST /chat-rooms/images/presigned-url
export type ChatImagePresignedUrlRequest = PresignedUrlRequest;
export type ChatImagePresignedUrlResponse = PresignedUrlResponse;

// STOMP PUB /pub/chat-rooms/{roomId}/messages
export interface ChatMessageSendRequest {
  messageType: ChatMessageType;
  content?: string;
  imageKey?: string;
}

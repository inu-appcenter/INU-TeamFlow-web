import type { PresignedUrlRequest, PresignedUrlResponse } from './image';
import type { TeamRole } from '@/constants/teamEnum';

// ── 공통 enum ──
// GROUP: 팀 멤버 중 골라서 만드는 소분과 채팅방 (팀 생성 시 자동 만들어지는 TEAM 전체방과 구분됨)
export type ChatRoomType = 'TEAM' | 'DIRECT' | 'GROUP';
export type ChatMessageType = 'TEXT' | 'IMAGE' | 'SYSTEM';

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
  // GROUP 채팅방 생성 응답에만 포함 — 멤버들 프로필 이미지 미리보기용 (본인 포함)
  memberProfileUrls?: string[];
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
  readCount: number; // 이 메시지를 읽은 인원 수
  visibleMemberCount: number; // 이 메시지를 볼 수 있는 인원 수
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

// POST /chat-rooms/group — 팀 멤버 선택해서 그룹 채팅방 생성
export interface GroupChatRoomCreateRequest {
  teamId: number;
  roomName?: string | null; // 생략 시 참여자 이름으로 자동 표시
  memberIds: number[]; // 본인은 자동 포함되므로 안 넣어도 됨
  imageKey?: string | null;
}

// POST /chat-rooms/images/presigned-url
export type ChatImagePresignedUrlRequest = PresignedUrlRequest;
export type ChatImagePresignedUrlResponse = PresignedUrlResponse;

// PATCH /chat-rooms/{roomId}/my-name
export interface ChatRoomMyNameUpdateRequest {
  roomName: string | null; // null이면 공유 기본값으로 리셋
}

// PATCH /chat-rooms/{roomId}/my-image
export interface ChatRoomMyImageUpdateRequest {
  imageKey: string | null; // null이면 공유 기본값으로 리셋
}

// STOMP PUB /pub/chat-rooms/{roomId}/messages
export interface ChatMessageSendRequest {
  messageType: ChatMessageType;
  content?: string;
  imageKey?: string;
}

// GET /chat-rooms/{roomId}/members
export interface ChatRoomMemberResponse {
  userId: number;
  username: string; // 로그인 아이디
  userNickname: string; // 실제 이름 (표시용)
  department: string;
  teamRole: TeamRole;
  profileImageUrl: string | null;
}

// POST /chat-rooms/{roomId}/invite — 채팅방에 멤버 초대
export interface ChatRoomInviteRequest {
  memberIds: number[];
}

// DELETE /chat-rooms/{roomId}/members/me — 채팅방 퇴장 (body 없음)

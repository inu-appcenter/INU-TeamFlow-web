import { getApiClient } from './client';

import type {
  ChatRoomSummaryResponse,
  ChatMessageAnchorResponse,
  ChatMessageHistoryParams,
  ChatMessageSliceResponse,
  ChatReadRequest,
  DirectChatRoomCreateRequest,
  ChatImagePresignedUrlRequest,
  ChatImagePresignedUrlResponse,
  ChatRoomListParams,
  GroupChatRoomCreateRequest,
  ChatRoomMyNameUpdateRequest,
  ChatRoomMyImageUpdateRequest,
  ChatRoomMemberResponse,
  ChatRoomInviteRequest,
} from '@moimi/core/types/chat';

// 내 채팅방 목록 조회
export const getChatRooms = async (
  params: ChatRoomListParams
): Promise<ChatRoomSummaryResponse[]> => {
  const { data } = await getApiClient().get('/chat-rooms', { params });
  return data;
};

// 채팅방 최초 진입시 메시지 조회 (안읽음 기준)
export const getChatMessageAnchor = async (
  roomId: number
): Promise<ChatMessageAnchorResponse> => {
  const { data } = await getApiClient().get(
    `/chat-rooms/${roomId}/messages/initial`
  );
  return data;
};

// 채팅 메시지 히스토리 조회 (cursor 기반, 위로 스크롤)
export const getChatMessageHistory = async (
  roomId: number,
  params: ChatMessageHistoryParams
): Promise<ChatMessageSliceResponse> => {
  const { data } = await getApiClient().get(`/chat-rooms/${roomId}/messages`, {
    params,
  });
  return data;
};

// 메시지 읽음 처리
export const markChatRead = async (
  roomId: number,
  body: ChatReadRequest
): Promise<void> => {
  await getApiClient().post(`/chat-rooms/${roomId}/read`, body);
};

// 1:1 채팅방 생성
export const createDirectChatRoom = async (
  body: DirectChatRoomCreateRequest
): Promise<ChatRoomSummaryResponse> => {
  const { data } = await getApiClient().post('/chat-rooms/direct', body);
  return data;
};

// 채팅 이미지 PresignedURL 요청
export const getChatImagePresignedUrl = async (
  body: ChatImagePresignedUrlRequest
): Promise<ChatImagePresignedUrlResponse> => {
  const { data } = await getApiClient().post(
    '/chat-rooms/images/presigned-url',
    body
  );
  return data;
};

// 팀 채팅방 이름 설정
export async function updateMyChatRoomName(
  roomId: number,
  body: ChatRoomMyNameUpdateRequest
) {
  const { data } = await getApiClient().patch(
    `/chat-rooms/${roomId}/my-name`,
    body
  );
  return data;
}

// 팀 채팅방 이미지 설정
export async function updateMyChatRoomImage(
  roomId: number,
  body: ChatRoomMyImageUpdateRequest
) {
  const { data } = await getApiClient().patch(
    `/chat-rooms/${roomId}/my-image`,
    body
  );
  return data;
}

// 팀 멤버 선택해 그룹 채팅방 생성
export const createGroupChatRoom = async (
  body: GroupChatRoomCreateRequest
): Promise<ChatRoomSummaryResponse> => {
  const { data } = await getApiClient().post('/chat-rooms/group', body);
  return data;
};

// 채팅방 현재 멤버 목록 조회
export const getChatRoomMembers = async (
  roomId: number
): Promise<ChatRoomMemberResponse[]> => {
  const { data } = await getApiClient().get(`/chat-rooms/${roomId}/members`);
  return data;
};

// 채팅방에 멤버 초대
export const inviteChatRoomMembers = async (
  roomId: number,
  body: ChatRoomInviteRequest
): Promise<void> => {
  await getApiClient().post(`/chat-rooms/${roomId}/invite`, body);
};

// 채팅방 퇴장
export const leaveChatRoom = async (roomId: number): Promise<void> => {
  await getApiClient().delete(`/chat-rooms/${roomId}/members/me`);
};

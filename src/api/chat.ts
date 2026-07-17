import axiosInstance from '@/lib/axiosInstance';

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
} from '@/types/chat';

// 내 채팅방 목록 조회
export const getChatRooms = async (
  params: ChatRoomListParams
): Promise<ChatRoomSummaryResponse[]> => {
  const { data } = await axiosInstance.get('/chat-rooms', { params });
  return data;
};

// 채팅방 최초 진입시 메시지 조회 (안읽음 기준)
export const getChatMessageAnchor = async (
  roomId: number
): Promise<ChatMessageAnchorResponse> => {
  const { data } = await axiosInstance.get(
    `/chat-rooms/${roomId}/messages/initial`
  );
  return data;
};

// 채팅 메시지 히스토리 조회 (cursor 기반, 위로 스크롤)
export const getChatMessageHistory = async (
  roomId: number,
  params: ChatMessageHistoryParams
): Promise<ChatMessageSliceResponse> => {
  const { data } = await axiosInstance.get(`/chat-rooms/${roomId}/messages`, {
    params,
  });
  return data;
};

// 메시지 읽음 처리
export const markChatRead = async (
  roomId: number,
  body: ChatReadRequest
): Promise<void> => {
  await axiosInstance.post(`/chat-rooms/${roomId}/read`, body);
};

// 1:1 채팅방 생성
export const createDirectChatRoom = async (
  body: DirectChatRoomCreateRequest
): Promise<ChatRoomSummaryResponse> => {
  const { data } = await axiosInstance.post('/chat-rooms/direct', body);
  return data;
};

// 채팅 이미지 PresignedURL 요청
export const getChatImagePresignedUrl = async (
  body: ChatImagePresignedUrlRequest
): Promise<ChatImagePresignedUrlResponse> => {
  const { data } = await axiosInstance.post(
    '/chat-rooms/images/presigned-url',
    body
  );
  return data;
};

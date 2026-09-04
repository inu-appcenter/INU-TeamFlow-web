'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosInstance';
import { uploadImageToS3 } from '@/utils/uploadImageToS3';

/**
 * GROUP 채팅방 개인 커스텀 이름 수정
 * null이면 공유 기본값으로 리셋
 */
export function useUpdateMyChatRoomName(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomName: string | null) => {
      const { data } = await axiosInstance.patch(
        `/chat-rooms/${roomId}/my-name`,
        { roomName }
      );

      return data.roomName as string | null;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });
}

/**
 * GROUP 채팅방 개인 커스텀 이미지 수정
 * null이면 공유 기본값으로 리셋
 */
export function useUpdateMyChatRoomImage(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File | null) => {
      if (file === null) {
        const { data } = await axiosInstance.patch(
          `/chat-rooms/${roomId}/my-image`,
          {
            imageKey: null,
          }
        );

        return data.imageUrl as string | null;
      }

      const { data: presigned } = await axiosInstance.post(
        '/images/presigned-url',
        {
          fileName: file.name,
        }
      );

      await uploadImageToS3(presigned.uploadUrl, file);

      const { data } = await axiosInstance.patch(
        `/chat-rooms/${roomId}/my-image`,
        {
          imageKey: presigned.imageKey,
        }
      );

      return data.imageUrl as string | null;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });
}

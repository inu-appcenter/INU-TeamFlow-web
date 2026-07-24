'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosInstance';
import { uploadImageToS3 } from '@/utils/uploadImageToS3';

export function useUpdateChatRoomName(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomName: string) => {
      await axiosInstance.patch(`/chat-rooms/${roomId}/name`, { roomName });
      return roomName;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });
}

export function useUpdateChatRoomImage(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File | null) => {
      if (file === null) {
        // null 보내면 백엔드가 멤버 프로필 콜라주로 자동 세팅
        const { data } = await axiosInstance.patch(
          `/chat-rooms/${roomId}/image`,
          {
            imageKey: null,
          }
        );
        return data.imageUrl as string;
      }

      const { data: presigned } = await axiosInstance.post(
        '/images/presigned-url',
        {
          fileName: file.name,
        }
      );
      await uploadImageToS3(presigned.uploadUrl, file);

      const { data } = await axiosInstance.patch(
        `/chat-rooms/${roomId}/image`,
        {
          imageKey: presigned.imageKey,
        }
      );
      return data.imageUrl as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });
}

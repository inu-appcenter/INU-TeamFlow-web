"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiClient } from "../../api/client";

/**
 * GROUP 채팅방 개인 커스텀 이름 수정
 * null이면 공유 기본값으로 리셋
 */
export function useUpdateMyChatRoomName(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomName: string | null) => {
      const { data } = await getApiClient().patch(
        `/chat-rooms/${roomId}/my-name`,
        { roomName }
      );

      return data.roomName as string | null;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
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
        const { data } = await getApiClient().patch(
          `/chat-rooms/${roomId}/my-image`,
          {
            imageKey: null,
          }
        );

        return data.imageUrl as string | null;
      }

      const { data: presigned } = await getApiClient().post(
        "/images/presigned-url",
        {
          fileName: file.name,
        }
      );

      // uploadImageToS3(@/utils/uploadImageToS3)도 웹 전용 별칭이라 모바일에서
      // 못 찾아서, presigned URL에 PUT하는 로직을 직접 인라인으로 대체함.
      await fetch(presigned.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const { data } = await getApiClient().patch(
        `/chat-rooms/${roomId}/my-image`,
        {
          imageKey: presigned.imageKey,
        }
      );

      return data.imageUrl as string | null;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
    },
  });
}

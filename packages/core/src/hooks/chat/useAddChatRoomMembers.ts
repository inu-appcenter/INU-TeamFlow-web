"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiClient } from "../../api/client";

export function useAddChatRoomMembers(roomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userIds: number[]) => {
      await getApiClient().post(`/chat-rooms/${roomId}/invite`, {
        memberIds: userIds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatRoomMembers", roomId] });
      queryClient.invalidateQueries({
        queryKey: ["chatRoomAvailableMembers", roomId],
      });
    },
  });
}

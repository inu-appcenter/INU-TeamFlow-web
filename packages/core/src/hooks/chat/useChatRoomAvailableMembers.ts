"use client";

import { useQuery } from "@tanstack/react-query";
import { getApiClient } from "../../api/client";

type AvailableMember = {
  userId: number;
  name: string;
  studentNumber: string;
};

export function useChatRoomAvailableMembers(
  roomId: number,
  keyword: string,
  enabled: boolean
) {
  return useQuery({
    queryKey: ["chatRoomAvailableMembers", roomId, keyword],
    queryFn: async () => {
      const { data } = await getApiClient().get<AvailableMember[]>(
        `/chat-rooms/${roomId}/available-members`,
        { params: { keyword } }
      );
      return data;
    },
    enabled: enabled && !!roomId && keyword.length > 0,
  });
}

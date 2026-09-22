import { useQuery } from "@tanstack/react-query";
import { getChatMessageAnchor } from "@moimi/core/api/chat";

export const useChatMessageAnchor = (roomId: number) => {
  return useQuery({
    queryKey: ["chatMessages", "anchor", roomId],
    queryFn: () => getChatMessageAnchor(roomId),
    enabled: !!roomId,
    // 이후 갱신은 STOMP 구독(setQueryData)으로만 반영, 자동 refetch로 덮어쓰지 않음
    staleTime: Infinity,
  });
};

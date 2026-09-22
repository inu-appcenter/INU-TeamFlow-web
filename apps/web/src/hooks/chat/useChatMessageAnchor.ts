'use client';

import { useQuery } from '@tanstack/react-query';
import { getChatMessageAnchor } from '@moimi/core/api/chat';

export const useChatMessageAnchor = (roomId: number) => {
  return useQuery({
    queryKey: ['chatMessages', 'anchor', roomId],
    queryFn: () => getChatMessageAnchor(roomId),
    enabled: !!roomId,
    // anchor 응답은 "최근 N개 메시지 창"이라, 자동 refetch가 오면 서버 응답으로
    // 통째로 교체되면서 그동안 소켓으로 로컬에 쌓인 메시지 중 이 창 밖으로 밀려난
    // 것들이 사라짐(history 커서는 고정이라 그 구간을 못 채워줌).
    // 최신 메시지는 소켓(useChatMessageSubscription)이 단일 소스로 반영하므로
    // 탭 전환/네트워크 재연결로 인한 백그라운드 refetch를 막는다.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

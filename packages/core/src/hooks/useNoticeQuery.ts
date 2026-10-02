import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiClient } from "../api/client";
import type {
  PresignedUrlRequestItem,
  PresignedUrlResponseItem,
  TeamNoticeCreateRequest,
  TeamNoticeUpdateRequest,
  TeamNoticeDetail,
  TeamNoticeSummary,
} from "@moimi/core/types/notice";
import { mypagePostKeys } from "./useMypagePostQuery";

export function useTeamNoticeDetail(teamId: number, noticeId: number) {
  return useQuery({
    queryKey: ["teamNoticeDetail", teamId, noticeId],
    queryFn: async () => {
      const { data } = await getApiClient().get<TeamNoticeDetail>(
        `/teams/${teamId}/notices/${noticeId}`
      );
      return data;
    },
    enabled: !!teamId && !!noticeId,
  });
}

// presigned url 발급 (여러 장 한번에)
export function useGetPresignedUrls() {
  return useMutation({
    mutationFn: async (items: PresignedUrlRequestItem[]) => {
      const { data } = await getApiClient().post<PresignedUrlResponseItem[]>(
        "/team-notices/images/presigned-url",
        items
      );
      return data;
    },
  });
}

// 공지 작성
export function useCreateTeamNotice(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: TeamNoticeCreateRequest) => {
      const { data } = await getApiClient().post<TeamNoticeDetail>(
        `/teams/${teamId}/notices`,
        body
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamNotices", teamId] });
      // 팀 공지 목록·전체 공지 목록은 useMyTeamNotices 사용
      // 모바일은 back()으로 돌아가면 목록이 재마운트되지 않아 invalidate 필요
      queryClient.invalidateQueries({ queryKey: ["myTeamNotices"] });
      queryClient.invalidateQueries({ queryKey: mypagePostKeys.notices() });
    },
  });
}

// 공지 수정
export function useUpdateTeamNotice(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      noticeId,
      body,
    }: {
      noticeId: number;
      body: TeamNoticeUpdateRequest;
    }) => {
      const { data } = await getApiClient().put<TeamNoticeDetail>(
        `/teams/${teamId}/notices/${noticeId}`,
        body
      );
      return data;
    },
    onSuccess: (_, { noticeId }) => {
      queryClient.invalidateQueries({ queryKey: ["teamNotices", teamId] });
      queryClient.invalidateQueries({ queryKey: ["myTeamNotices"] });
      queryClient.invalidateQueries({ queryKey: mypagePostKeys.notices() });
      queryClient.invalidateQueries({
        queryKey: ["teamNoticeDetail", teamId, noticeId],
      });
    },
  });
}

// 공지 삭제
export function useDeleteTeamNotice(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noticeId: number) => {
      await getApiClient().delete(`/teams/${teamId}/notices/${noticeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamNotices", teamId] });
      queryClient.invalidateQueries({ queryKey: ["myTeamNotices"] });
      queryClient.invalidateQueries({ queryKey: mypagePostKeys.notices() });
    },
  });
}

interface PageResponse<T> {
  content: T[];
}

// 특정 팀 공지 목록
export function useTeamNotices(teamId: number, page = 0, size = 100) {
  return useQuery({
    queryKey: ["teamNotices", teamId, page, size],
    queryFn: async () => {
      const { data } = await getApiClient().get<
        PageResponse<TeamNoticeSummary>
      >(`/teams/${teamId}/notices`, { params: { page, size } });
      return data.content;
    },
    enabled: !!teamId,
  });
}

// 내가 속한 모든 팀 공지 통합 조회
export function useMyTeamNotices(page = 0, size = 100) {
  return useQuery({
    queryKey: ["myTeamNotices", page, size],
    queryFn: async () => {
      const { data } = await getApiClient().get<
        PageResponse<TeamNoticeSummary>
      >("/team-notices/me", { params: { page, size } });
      return data.content;
    },
  });
}

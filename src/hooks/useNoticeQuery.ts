import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axiosInstance';
import type {
  PresignedUrlRequestItem,
  PresignedUrlResponseItem,
  TeamNoticeCreateRequest,
  TeamNoticeDetail,
  TeamNoticeSummary,
} from '@/types/notice';

export function useTeamNoticeDetail(teamId: number, noticeId: number) {
  return useQuery({
    queryKey: ['teamNoticeDetail', teamId, noticeId],
    queryFn: async () => {
      const { data } = await axios.get<TeamNoticeDetail>(
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
      const { data } = await axios.post<PresignedUrlResponseItem[]>(
        '/team-notices/images/presigned-url',
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
      const { data } = await axios.post<TeamNoticeDetail>(
        `/teams/${teamId}/notices`,
        body
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamNotices', teamId] });
    },
  });
}

interface PageResponse<T> {
  content: T[];
  // 필요하면 totalElements, totalPages 등 백엔드 Pageable 응답 형태에 맞춰 추가
}

// 특정 팀 공지 목록
export function useTeamNotices(teamId: number, page = 0, size = 100) {
  return useQuery({
    queryKey: ['teamNotices', teamId, page, size],
    queryFn: async () => {
      const { data } = await axios.get<PageResponse<TeamNoticeSummary>>(
        `/teams/${teamId}/notices`,
        { params: { page, size } }
      );
      return data.content;
    },
    enabled: !!teamId,
  });
}

// 내가 속한 모든 팀 공지 통합 조회
export function useMyTeamNotices(page = 0, size = 100) {
  return useQuery({
    queryKey: ['myTeamNotices', page, size],
    queryFn: async () => {
      const { data } = await axios.get<PageResponse<TeamNoticeSummary>>(
        '/team-notices/me',
        { params: { page, size } }
      );
      return data.content;
    },
  });
}

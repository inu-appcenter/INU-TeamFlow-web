import { getApiClient } from './client';
import type {
  MyApplicationResponse,
  MyRecruitmentResponse,
  MyTeamNoticeResponse,
} from '@moimi/core/types/mypagePost';

interface PageableParams {
  page?: number;
  size?: number;
}

const getList = <T>(data: T[] | { content?: T[] } | T): T[] => {
  if (Array.isArray(data)) return data;
  if (typeof data === 'object' && data !== null && 'content' in data) {
    return data.content ?? [];
  }
  return [data as T];
};

/** GET /recruitments/me */
export const getMyRecruitments = async (
  params: PageableParams = { page: 0, size: 20 }
): Promise<MyRecruitmentResponse[]> => {
  const res = await getApiClient().get('/recruitments/me', { params });
  return getList<MyRecruitmentResponse>(res.data);
};

/** GET /applications/me */
export const getMyApplications = async (
  params: PageableParams = { page: 0, size: 20 }
): Promise<MyApplicationResponse[]> => {
  const res = await getApiClient().get('/applications/me', { params });
  return getList<MyApplicationResponse>(res.data);
};

/** GET /notices/me */
export const getMyTeamNotices = async (
  params: PageableParams = { page: 0, size: 20 }
): Promise<MyTeamNoticeResponse[]> => {
  const res = await getApiClient().get('/notices/me', { params });
  return getList<MyTeamNoticeResponse>(res.data);
};

/** DELETE /applications/{applicationId} */
export const cancelApplication = (applicationId: number): Promise<void> =>
  getApiClient().delete(`/applications/${applicationId}`).then(() => undefined);

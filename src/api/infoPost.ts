import axiosInstance from '@/lib/axiosInstance';

import type { PageResponse } from '@/types/recruitment';
import type {
  GetInfoPostsParams,
  InfoPostCreateRequest,
  InfoPostDetailResponse,
  InfoPostImagePresignedUrlRequest,
  InfoPostImagePresignedUrlResponse,
  InfoPostSummaryResponse,
  InfoPostUpdateRequest,
} from '@/types/infoPost';

interface GetMyInfoPostsParams {
  page?: number;
  size?: number;
  sort?: string[];
}

const getList = <T>(data: T[] | { content?: T[] } | T): T[] => {
  if (Array.isArray(data)) {
    return data;
  }

  if (typeof data === 'object' && data !== null && 'content' in data) {
    return data.content ?? [];
  }

  return [data as T];
};

/** GET /info-posts */
export const getInfoPosts = ({
  category,
  keyword,
  linkable,
  page = 0,
  size = 10,
}: GetInfoPostsParams = {}): Promise<PageResponse<InfoPostSummaryResponse>> =>
  axiosInstance
    .get('/info-posts', {
      params: {
        category,
        keyword: keyword?.trim() || undefined,
        page,
        size,
      },
      paramsSerializer: {
        indexes: null,
      },
    })
    .then((res) => res.data);

/** GET /info-posts/me */
export const getMyInfoPosts = async ({
  page = 0,
  size = 20,
  sort = ['createdAt,DESC'],
}: GetMyInfoPostsParams = {}): Promise<InfoPostSummaryResponse[]> => {
  const res = await axiosInstance.get('/info-posts/me', {
    params: {
      page,
      size,
      sort,
    },
    paramsSerializer: {
      indexes: null,
    },
  });

  return getList<InfoPostSummaryResponse>(res.data);
};

/** GET /info-posts/{infoPostId} */
export const getInfoPostDetail = (
  infoPostId: number
): Promise<InfoPostDetailResponse> =>
  axiosInstance.get(`/info-posts/${infoPostId}`).then((res) => res.data);

/** POST /info-posts */
export const createInfoPost = (
  body: InfoPostCreateRequest
): Promise<InfoPostDetailResponse> =>
  axiosInstance.post('/info-posts', body).then((res) => res.data);

/** PUT /info-posts/{infoPostId} */
export const updateInfoPost = (
  infoPostId: number,
  body: InfoPostUpdateRequest
): Promise<InfoPostDetailResponse> =>
  axiosInstance.put(`/info-posts/${infoPostId}`, body).then((res) => res.data);

/** DELETE /info-posts/{infoPostId} */
export const deleteInfoPost = (infoPostId: number): Promise<void> =>
  axiosInstance.delete(`/info-posts/${infoPostId}`).then((res) => res.data);

/** POST /info-posts/images/presigned-url */
export const getInfoPostImagePresignedUrls = (
  body: InfoPostImagePresignedUrlRequest[]
): Promise<InfoPostImagePresignedUrlResponse[]> =>
  axiosInstance
    .post('/info-posts/images/presigned-url', body)
    .then((res) => res.data);

export const uploadInfoPostImage = async (
  uploadUrl: string,
  file: File
): Promise<void> => {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`이미지 업로드 실패: ${response.status}`);
  }
};

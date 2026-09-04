import { getApiClient } from './client';

import type {
  GetInfoPostsParams,
  InfoPostCreateRequest,
  InfoPostDetailResponse,
  InfoPostImagePresignedUrlRequest,
  InfoPostImagePresignedUrlResponse,
  InfoPostRecruitmentSummary,
  InfoPostSummaryResponse,
  InfoPostUpdateRequest,
  PageResponse,
  PageableParams,
} from '@moimi/core/types/infoPost';

/** GET /info-posts */
export const getInfoPosts = ({
  category,
  type,
  keyword,
  page = 0,
  size = 10,
  sort = ['createdAt,DESC'],
}: GetInfoPostsParams = {}): Promise<PageResponse<InfoPostSummaryResponse>> =>
  getApiClient()
    .get('/info-posts', {
      params: {
        category,
        type,
        keyword: keyword?.trim() || undefined,
        page,
        size,
        sort,
      },
      paramsSerializer: {
        indexes: null,
      },
    })
    .then((res) => res.data);

/** GET /info-posts/me */
export const getMyInfoPosts = ({
  page = 0,
  size = 10,
  sort = ['createdAt,DESC'],
}: PageableParams = {}): Promise<PageResponse<InfoPostSummaryResponse>> =>
  getApiClient()
    .get('/info-posts/me', {
      params: {
        page,
        size,
        sort,
      },
      paramsSerializer: {
        indexes: null,
      },
    })
    .then((res) => res.data);

/** GET /info-posts/{infoPostId} */
export const getInfoPostDetail = (
  infoPostId: number
): Promise<InfoPostDetailResponse> =>
  getApiClient().get(`/info-posts/${infoPostId}`).then((res) => res.data);

/** GET /info-posts/{infoPostId}/recruitments */
export const getRecruitmentsByInfoPost = (
  infoPostId: number,
  { page = 0, size = 10, sort = ['createdAt,DESC'] }: PageableParams = {}
): Promise<PageResponse<InfoPostRecruitmentSummary>> =>
  getApiClient()
    .get(`/info-posts/${infoPostId}/recruitments`, {
      params: {
        page,
        size,
        sort,
      },
      paramsSerializer: {
        indexes: null,
      },
    })
    .then((res) => res.data);

/** POST /info-posts */
export const createInfoPost = (
  body: InfoPostCreateRequest
): Promise<InfoPostDetailResponse> =>
  getApiClient().post('/info-posts', body).then((res) => res.data);

/** PUT /info-posts/{infoPostId} */
export const updateInfoPost = (
  infoPostId: number,
  body: InfoPostUpdateRequest
): Promise<InfoPostDetailResponse> =>
  getApiClient().put(`/info-posts/${infoPostId}`, body).then((res) => res.data);

/** DELETE /info-posts/{infoPostId} */
export const deleteInfoPost = async (infoPostId: number): Promise<void> => {
  await getApiClient().delete(`/info-posts/${infoPostId}`);
};

/** POST /info-posts/images/presigned-url */
export const getInfoPostImagePresignedUrls = (
  body: InfoPostImagePresignedUrlRequest[]
): Promise<InfoPostImagePresignedUrlResponse[]> =>
  getApiClient()
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

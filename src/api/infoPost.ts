import axiosInstance from '@/lib/axiosInstance';

import type { PageResponse } from '@/types/recruitment';
import type {
  GetInfoPostsParams,
  InfoPostCreateRequest,
  InfoPostDetailResponse,
  InfoPostSummaryResponse,
  InfoPostUpdateRequest,
} from '@/types/infoPost';

/** GET /info-posts */
export const getInfoPosts = ({
  category,
  keyword,
  linkable,
  page = 0,
  size = 10,
  sort = ['createdAt,DESC'],
}: GetInfoPostsParams = {}): Promise<PageResponse<InfoPostSummaryResponse>> =>
  axiosInstance
    .get('/info-posts', {
      params: {
        category,
        keyword: keyword?.trim() || undefined,
        linkable,
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

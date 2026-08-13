import axiosInstance from '@/lib/axiosInstance';
import type {
  PageResponse,
  RecruitmentSummaryResponse,
} from '@/types/recruitment';
import type { InfoPostSummaryResponse } from '@/types/infoPost';

type ScrapPageResponse<T> = PageResponse<T> & {
  first: boolean;
  last: boolean;
  numberOfElements: number;
};

/** GET /recruitments/scraps */
export const getMyRecruitmentScraps = (
  page = 0,
  size = 10
): Promise<ScrapPageResponse<RecruitmentSummaryResponse>> =>
  axiosInstance
    .get('/recruitments/scraps', {
      params: {
        page,
        size,
        sort: ['createdAt,DESC'],
      },
    })
    .then((res) => res.data);

/** GET /info-posts/scraps */
export const getMyInfoPostScraps = (
  page = 0,
  size = 10
): Promise<ScrapPageResponse<InfoPostSummaryResponse>> =>
  axiosInstance
    .get('/info-posts/scraps', {
      params: {
        page,
        size,
        sort: ['createdAt,DESC'],
      },
    })
    .then((res) => res.data);

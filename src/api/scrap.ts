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

export type ScrapType = 'infoPost' | 'recruitment';

const scrapPathMap: Record<ScrapType, string> = {
  infoPost: 'info-posts',
  recruitment: 'recruitments',
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

/** POST /{type}/{id}/scraps */
export const scrap = async (type: ScrapType, id: number) => {
  await axiosInstance.post(`/${scrapPathMap[type]}/${id}/scraps`);
};

/** DELETE /{type}/{id}/scraps */
export const unscrap = async (type: ScrapType, id: number) => {
  await axiosInstance.delete(`/${scrapPathMap[type]}/${id}/scraps`);
};

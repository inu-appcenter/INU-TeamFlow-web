import { getApiClient } from './client';
import type {
  RecruitmentSummaryResponse,
  RecruitmentDetailResponse,
  RecruitmentCreateRequest,
  RecruitmentUpdateRequest,
  ApplicationCreateRequest,
  ApplicationSummaryResponse,
  MyApplicationSummaryResponse,
  ApplicationDetailResponse,
  ApplicationStatusUpdateRequest,
  ApplicationStatusResponse,
  PageResponse,
} from '@moimi/core/types/recruitment';

/** GET /recruitments */
export const getRecruitments = (
  page = 0,
  size = 10
): Promise<PageResponse<RecruitmentSummaryResponse>> =>
  getApiClient()
    .get('/recruitments', { params: { page, size } })
    .then((res) => res.data);

/** GET /recruitments/me */
export const getMyRecruitments = (
  page = 0,
  size = 10
): Promise<PageResponse<RecruitmentSummaryResponse>> =>
  getApiClient()
    .get('/recruitments/me', { params: { page, size } })
    .then((res) => res.data);

/** GET /recruitments/{recruitmentId} */
export const getRecruitmentDetail = (
  recruitmentId: number
): Promise<RecruitmentDetailResponse> =>
  getApiClient().get(`/recruitments/${recruitmentId}`).then((res) => res.data);

/** POST /recruitments */
export const createRecruitment = (
  body: RecruitmentCreateRequest
): Promise<RecruitmentDetailResponse> =>
  getApiClient().post('/recruitments', body).then((res) => res.data);

/** PUT /recruitments/{recruitmentId} */
export const updateRecruitment = (
  recruitmentId: number,
  body: RecruitmentUpdateRequest
): Promise<RecruitmentDetailResponse> =>
  getApiClient()
    .put(`/recruitments/${recruitmentId}`, body)
    .then((res) => res.data);

/** DELETE /recruitments/{recruitmentId} */
export const deleteRecruitment = async (recruitmentId: number) => {
  const { data } = await getApiClient().delete(`/recruitments/${recruitmentId}`);
  return data;
};

/** POST /recruitments/{recruitmentId}/applications */
export const applyRecruitment = (
  recruitmentId: number,
  body: ApplicationCreateRequest
): Promise<ApplicationSummaryResponse> =>
  getApiClient()
    .post(`/recruitments/${recruitmentId}/applications`, body)
    .then((res) => res.data);

/** GET /recruitments/{recruitmentId}/applications */
export const getRecruitmentApplications = (
  recruitmentId: number,
  page = 0,
  size = 10
): Promise<PageResponse<ApplicationSummaryResponse>> =>
  getApiClient()
    .get(`/recruitments/${recruitmentId}/applications`, {
      params: { page, size },
    })
    .then((res) => res.data);

/** GET /applications/me */
export const getMyApplications = (
  page = 0,
  size = 10
): Promise<PageResponse<MyApplicationSummaryResponse>> =>
  getApiClient()
    .get('/applications/me', { params: { page, size } })
    .then((res) => res.data);

/** GET /applications/{applicationId} */
export const getApplicationDetail = (
  applicationId: number
): Promise<ApplicationDetailResponse> =>
  getApiClient().get(`/applications/${applicationId}`).then((res) => res.data);

/** PATCH /applications/{applicationId}/status */
export const updateApplicationStatus = (
  applicationId: number,
  body: ApplicationStatusUpdateRequest
): Promise<ApplicationStatusResponse> =>
  getApiClient()
    .patch(`/applications/${applicationId}/status`, body)
    .then((res) => res.data);

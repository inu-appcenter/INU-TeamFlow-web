import axiosInstance from '@/lib/axiosInstance';
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
} from '@/types/recruitment';

/** GET /recruitments */
export const getRecruitments = (
  page = 0,
  size = 10
): Promise<PageResponse<RecruitmentSummaryResponse>> =>
  axiosInstance
    .get('/recruitments', { params: { page, size } })
    .then((res) => res.data);

/** GET /recruitments/me */
export const getMyRecruitments = (
  page = 0,
  size = 10
): Promise<PageResponse<RecruitmentSummaryResponse>> =>
  axiosInstance
    .get('/recruitments/me', { params: { page, size } })
    .then((res) => res.data);

/** GET /recruitments/{recruitmentId} */
export const getRecruitmentDetail = (
  recruitmentId: number
): Promise<RecruitmentDetailResponse> =>
  axiosInstance.get(`/recruitments/${recruitmentId}`).then((res) => res.data);

/** POST /recruitments */
export const createRecruitment = (
  body: RecruitmentCreateRequest
): Promise<RecruitmentDetailResponse> =>
  axiosInstance.post('/recruitments', body).then((res) => res.data);

/** PUT /recruitments/{recruitmentId} */
export const updateRecruitment = (
  recruitmentId: number,
  body: RecruitmentUpdateRequest
): Promise<RecruitmentDetailResponse> =>
  axiosInstance
    .put(`/recruitments/${recruitmentId}`, body)
    .then((res) => res.data);

/** POST /recruitments/{recruitmentId}/applications */
export const applyRecruitment = (
  recruitmentId: number,
  body: ApplicationCreateRequest
): Promise<ApplicationSummaryResponse> =>
  axiosInstance
    .post(`/recruitments/${recruitmentId}/applications`, body)
    .then((res) => res.data);

/** GET /recruitments/{recruitmentId}/applications */
export const getRecruitmentApplications = (
  recruitmentId: number,
  page = 0,
  size = 10
): Promise<PageResponse<ApplicationSummaryResponse>> =>
  axiosInstance
    .get(`/recruitments/${recruitmentId}/applications`, {
      params: { page, size },
    })
    .then((res) => res.data);

/** GET /applications/me */
export const getMyApplications = (
  page = 0,
  size = 10
): Promise<PageResponse<MyApplicationSummaryResponse>> =>
  axiosInstance
    .get('/applications/me', { params: { page, size } })
    .then((res) => res.data);

/** GET /applications/{applicationId} */
export const getApplicationDetail = (
  applicationId: number
): Promise<ApplicationDetailResponse> =>
  axiosInstance.get(`/applications/${applicationId}`).then((res) => res.data);

/** PUT /applications/{applicationId}/status */
export const updateApplicationStatus = (
  applicationId: number,
  body: ApplicationStatusUpdateRequest
): Promise<ApplicationStatusResponse> =>
  axiosInstance
    .put(`/applications/${applicationId}/status`, body)
    .then((res) => res.data);

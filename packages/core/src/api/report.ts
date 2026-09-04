import { getApiClient } from './client';
import type { ReportRequest, ReportResponse } from '@moimi/core/types/report';

export const reportRecruitment = (recruitmentId: number, body: ReportRequest) =>
  getApiClient()
    .post<ReportResponse>(`/recruitments/${recruitmentId}/reports`, body)
    .then((res) => res.data);

export const reportInfoPost = (infoPostId: number, body: ReportRequest) =>
  getApiClient()
    .post<ReportResponse>(`/info-posts/${infoPostId}/reports`, body)
    .then((res) => res.data);

export const reportUser = (userId: number, body: ReportRequest) =>
  getApiClient()
    .post<ReportResponse>(`/users/${userId}/reports`, body)
    .then((res) => res.data);

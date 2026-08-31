import axiosInstance from '@/lib/axiosInstance';
import type { ReportRequest, ReportResponse } from '@/types/report';

export const reportRecruitment = (recruitmentId: number, body: ReportRequest) =>
  axiosInstance
    .post<ReportResponse>(`/recruitments/${recruitmentId}/reports`, body)
    .then((res) => res.data);

export const reportInfoPost = (infoPostId: number, body: ReportRequest) =>
  axiosInstance
    .post<ReportResponse>(`/info-posts/${infoPostId}/reports`, body)
    .then((res) => res.data);

export const reportUser = (userId: number, body: ReportRequest) =>
  axiosInstance
    .post<ReportResponse>(`/users/${userId}/reports`, body)
    .then((res) => res.data);

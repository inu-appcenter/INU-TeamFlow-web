import axiosInstance from '@/lib/axiosInstance';
import type { DashboardResponse } from '@/types/admin';
import type {
  ReportSummaryResponse,
  ReportDetailResponse,
  ReportHandleRequest,
} from '@/types/report';
import type {
  InquirySummaryResponse,
  InquiryDetailResponse,
  InquiryHandleRequest,
} from '@/types/inquiry';

export const getAdminDashboard = (params?: { page?: number; size?: number }) =>
  axiosInstance
    .get<DashboardResponse>('/admin/dashboard', { params })
    .then((res) => res.data);

export const getAdminReports = (params?: {
  page?: number;
  size?: number;
  status?: 'PENDING' | 'RESOLVED';
}) =>
  axiosInstance
    .get<ReportSummaryResponse>('/admin/reports', { params })
    .then((res) => res.data);

export const getAdminReportDetail = (reportId: number) =>
  axiosInstance
    .get<ReportDetailResponse>(`/admin/reports/${reportId}`)
    .then((res) => res.data);

export const handleAdminReport = (
  reportId: number,
  body: ReportHandleRequest
) =>
  axiosInstance
    .patch<void>(`/admin/reports/${reportId}`, body)
    .then((res) => res.data);

export const getAdminInquiries = (params?: {
  page?: number;
  size?: number;
  status?: 'PENDING' | 'RESOLVED';
}) =>
  axiosInstance
    .get<InquirySummaryResponse>('/admin/inquiries', { params })
    .then((res) => res.data);

export const getAdminInquiryDetail = (inquiryId: number) =>
  axiosInstance
    .get<InquiryDetailResponse>(`/admin/inquiries/${inquiryId}`)
    .then((res) => res.data);

export const handleAdminInquiry = (
  inquiryId: number,
  body: InquiryHandleRequest
) =>
  axiosInstance
    .patch<void>(`/admin/inquiries/${inquiryId}`, body)
    .then((res) => res.data);

import { getApiClient } from './client';
import type {
  InquiryRequest,
  InquiryResponse,
  InquiryDetailResponse,
} from '@moimi/core/types/inquiry';

export const createInquiry = (body: InquiryRequest) =>
  getApiClient()
    .post<InquiryResponse>('/inquiries', body)
    .then((res) => res.data);

export const getMyInquiries = () =>
  getApiClient().get<InquiryResponse[]>('/inquiries/me').then((res) => res.data);

export const getMyInquiryDetail = (inquiryId: number) =>
  getApiClient()
    .get<InquiryDetailResponse>(`/inquiries/${inquiryId}`)
    .then((res) => res.data);

export const cancelInquiry = (inquiryId: number) =>
  getApiClient().delete<void>(`/inquiries/${inquiryId}`).then((res) => res.data);

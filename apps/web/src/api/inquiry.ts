import axiosInstance from '@/lib/axiosInstance';
import type {
  InquiryRequest,
  InquiryResponse,
  InquiryDetailResponse,
} from '@/types/inquiry';

export const createInquiry = (body: InquiryRequest) =>
  axiosInstance
    .post<InquiryResponse>('/inquiries', body)
    .then((res) => res.data);

export const getMyInquiries = () =>
  axiosInstance.get<InquiryResponse[]>('/inquiries/me').then((res) => res.data);

export const getMyInquiryDetail = (inquiryId: number) =>
  axiosInstance
    .get<InquiryDetailResponse>(`/inquiries/${inquiryId}`)
    .then((res) => res.data);

export const cancelInquiry = (inquiryId: number) =>
  axiosInstance.delete<void>(`/inquiries/${inquiryId}`).then((res) => res.data);

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminInquiries,
  getAdminInquiryDetail,
  handleAdminInquiry,
} from '@/api/admin';
import type { InquiryHandleRequest, InquiryStatus } from '@/types/inquiry';

export const useAdminInquiries = (params: {
  page: number;
  size?: number;
  status?: InquiryStatus;
}) =>
  useQuery({
    queryKey: ['admin', 'inquiries', params],
    queryFn: () => getAdminInquiries(params),
  });

export const useAdminInquiryDetail = (inquiryId: number | null) =>
  useQuery({
    queryKey: ['admin', 'inquiries', 'detail', inquiryId],
    queryFn: () => getAdminInquiryDetail(inquiryId as number),
    enabled: inquiryId !== null,
  });

export const useHandleAdminInquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      inquiryId,
      body,
    }: {
      inquiryId: number;
      body: InquiryHandleRequest;
    }) => handleAdminInquiry(inquiryId, body),
    onSuccess: (_data, { inquiryId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inquiries'] });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'inquiries', 'detail', inquiryId],
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
};

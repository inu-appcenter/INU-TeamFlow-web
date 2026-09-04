import { useQuery } from '@tanstack/react-query';
import { getMyInquiries, getMyInquiryDetail } from '@/api/inquiry';

export const useMyInquiries = () =>
  useQuery({
    queryKey: ['inquiries', 'me'],
    queryFn: getMyInquiries,
  });

export const useMyInquiryDetail = (inquiryId: number | null) =>
  useQuery({
    queryKey: ['inquiries', 'detail', inquiryId],
    queryFn: () => getMyInquiryDetail(inquiryId as number),
    enabled: inquiryId !== null,
  });

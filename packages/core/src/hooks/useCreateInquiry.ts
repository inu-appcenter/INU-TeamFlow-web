import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createInquiry, cancelInquiry } from '@moimi/core/api/inquiry';
import type { InquiryRequest } from '@moimi/core/types/inquiry';

export const useCreateInquiry = () =>
  useMutation({
    mutationFn: (body: InquiryRequest) => createInquiry(body),
  });

export const useCancelInquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inquiryId: number) => cancelInquiry(inquiryId),
    onSuccess: (_data, inquiryId) => {
      queryClient.invalidateQueries({ queryKey: ['inquiries', 'me'] });
      queryClient.invalidateQueries({
        queryKey: ['inquiries', 'detail', inquiryId],
      });
    },
  });
};

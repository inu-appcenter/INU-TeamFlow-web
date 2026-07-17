import { useMutation } from '@tanstack/react-query';
import { getChatImagePresignedUrl } from '@/api/chat';

export const useChatImagePresignedUrl = () => {
  return useMutation({
    mutationFn: getChatImagePresignedUrl,
  });
};

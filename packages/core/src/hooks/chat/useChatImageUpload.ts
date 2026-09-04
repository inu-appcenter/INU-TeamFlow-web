'use client';

import { useMutation } from '@tanstack/react-query';
import { getChatImagePresignedUrl } from '@moimi/core/api/chat';

export function useChatImageUpload() {
  return useMutation({
    mutationFn: async (file: File) => {
      const { uploadUrl, imageKey } = await getChatImagePresignedUrl({
        fileName: file.name,
        contentType: file.type,
      });

      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      return imageKey;
    },
  });
}

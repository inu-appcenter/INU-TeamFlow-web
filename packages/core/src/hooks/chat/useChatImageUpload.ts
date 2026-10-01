"use client";

import { useMutation } from "@tanstack/react-query";
import { getChatImagePresignedUrl } from "@moimi/core/api/chat";
import type { AnalyticsAttempt } from "@moimi/core/types/analytics";

function observe(callback: () => void): void {
  try {
    callback();
  } catch {}
}

export function useChatImageUpload(createAttempt?: () => AnalyticsAttempt) {
  return useMutation({
    mutationFn: async (file: File) => {
      let attempt: AnalyticsAttempt | undefined;
      let stage: "presigned_url" | "upload" = "presigned_url";

      observe(() => {
        attempt = createAttempt?.();
      });

      try {
        const { uploadUrl, imageKey } = await getChatImagePresignedUrl({
          fileName: file.name,
          contentType: file.type,
        });

        stage = "upload";

        const response = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        observe(() => {
          if (response.ok) {
            attempt?.succeed();
          } else {
            attempt?.fail(null, {
              kind: "http",
              http_status: response.status,
              reason_code: "CHAT_IMAGE_UPLOAD_HTTP_ERROR",
            });
          }
        });

        return imageKey;
      } catch (error) {
        observe(() => {
          attempt?.fail(error, {
            kind: stage === "upload" ? "network" : undefined,
            reason_code:
              stage === "presigned_url"
                ? "CHAT_IMAGE_PRESIGNED_URL_FAILED"
                : "CHAT_IMAGE_UPLOAD_FAILED",
          });
        });

        throw error;
      }
    },
  });
}

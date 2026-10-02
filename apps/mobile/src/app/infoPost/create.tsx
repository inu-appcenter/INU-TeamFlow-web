import { useEffect } from "react";
import { router } from "expo-router";
import InfoPostForm from "@/components/InfoPostForm";
import { useCreateInfoPost } from "@moimi/core/hooks/useInfoPostQuery"; // TODO: 실제 export명 확인 필요
import { useSchoolVerificationGuard } from "@moimi/core/hooks/useSchoolVerificationGuard";

export default function InfoPostCreateScreen() {
  const createInfoPost = useCreateInfoPost();
  const { isVerified, isLoading } = useSchoolVerificationGuard(() => {});

  // 학교 인증 안 된 계정은 진입 차단 (프로필 로딩이 끝난 뒤에만 판단)
  useEffect(() => {
    if (isLoading || isVerified) return;
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/infoPost");
    }
  }, [isLoading, isVerified]);

  if (isLoading || !isVerified) return null;

  return (
    <InfoPostForm
      mode="create"
      onSubmit={async (form) => {
        const created = await createInfoPost.mutateAsync(form);
        router.replace(`/infoPost/${created.infoPostId}`);
      }}
    />
  );
}

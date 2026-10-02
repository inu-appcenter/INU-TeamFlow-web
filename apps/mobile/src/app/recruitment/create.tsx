import { useEffect } from "react";
import { router } from "expo-router";
import RecruitmentForm, {
  type RecruitmentFormData,
} from "@/components/RecruitmentForm";
import { useCreateRecruitment } from "@moimi/core/hooks/useRecruitmentQuery";
import { useSchoolVerificationGuard } from "@moimi/core/hooks/useSchoolVerificationGuard";

// 들어온 화면(모집 목록)으로 pop, 이전 화면이 없으면 모집 목록으로 교체
const goBack = () => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/recruitment");
  }
};

export default function RecruitmentCreateScreen() {
  const { mutateAsync: createRecruitment } = useCreateRecruitment();
  const { isVerified, isLoading } = useSchoolVerificationGuard(() => {});

  // 학교 인증 안 된 계정은 진입 차단 (프로필 로딩이 끝난 뒤에만 판단)
  useEffect(() => {
    if (isLoading || isVerified) return;
    goBack();
  }, [isLoading, isVerified]);

  if (isLoading || !isVerified) return null;

  const handleSubmit = async (form: RecruitmentFormData) => {
    if (form.targetMemberCount === "") return;

    try {
      await createRecruitment({
        title: form.title,
        category: form.category,
        description: form.description,
        infoPostId: form.announcementId || undefined,
        teamId: form.teamId || undefined,
        targetMemberCount: form.targetMemberCount,
        endAt: form.endAt,
      });

      // replace하면 목록이 스택에 중복으로 쌓임 → 기존 목록으로 복귀
      goBack();
    } catch (err) {
      console.log("모집글 생성 실패", err);
    }
  };

  return <RecruitmentForm mode="create" onSubmit={handleSubmit} />;
}

import { useMyProfile } from "./useUserQuery";

export function useSchoolVerificationGuard(
  showErrorMessage: (message: string) => void
) {
  const { data: me, isLoading } = useMyProfile();

  const checkVerified = () => {
    // 프로필 로딩 중에는 판단 보류 (인증된 사용자에게 잘못된 메시지 방지)
    if (isLoading) return false;
    if (!me?.isSchoolVerified) {
      showErrorMessage("학교 인증 후 이용 가능합니다");
      return false;
    }
    return true;
  };

  return {
    isVerified: me?.isSchoolVerified ?? false,
    isLoading,
    checkVerified,
  };
}

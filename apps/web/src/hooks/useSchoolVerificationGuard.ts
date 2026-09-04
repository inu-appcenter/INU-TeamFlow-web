import { useMyProfile } from '@/hooks/useUserQuery';

export function useSchoolVerificationGuard(
  showErrorMessage: (message: string) => void
) {
  const { data: me } = useMyProfile();

  const checkVerified = () => {
    if (!me?.isSchoolVerified) {
      showErrorMessage('학교 인증 후 이용 가능합니다');
      return false;
    }
    return true;
  };

  return { isVerified: me?.isSchoolVerified ?? false, checkVerified };
}

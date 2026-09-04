'use client';

import TeamForm, { type TeamFormData } from '@/components/team/TeamForm';
import { useCreateTeam } from '@moimi/core/hooks/team/useTeamQuery';
import { useSchoolVerificationGuard } from '@moimi/core/hooks/useSchoolVerificationGuard';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TeamCreatePage() {
  const router = useRouter();
  const { mutateAsync: createTeam } = useCreateTeam();

  const [errorMessage, setErrorMessage] = useState('');
  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 1800);
  };
  const { isVerified } = useSchoolVerificationGuard(showErrorMessage);

  useEffect(() => {
    if (!isVerified) {
      router.replace('/team?error=school-verification-required');
    }
  }, [isVerified, router]);

  const handleSubmit = async (form: TeamFormData) => {
    try {
      await createTeam({
        name: form.name,
        category: form.category,
        description: form.description,
        link: form.link || undefined,
        sns: form.sns || undefined,
        imageKey: form.imageUrl || undefined,
      });
      router.push('/team');
    } catch (err) {
      console.error('팀 생성 실패', err);
    }
  };

  return (
    <>
      {errorMessage && (
        <div className="animate-modal-pop fixed top-32 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
          {errorMessage}
        </div>
      )}
      <TeamForm mode="create" onSubmit={handleSubmit} />
    </>
  );
}

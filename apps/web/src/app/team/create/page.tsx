'use client';

import TeamForm, { type TeamFormData } from '@/components/team/TeamForm';
import { useCreateTeam } from '@moimi/core/hooks/team/useTeamQuery';
import { useSchoolVerificationGuard } from '@moimi/core/hooks/useSchoolVerificationGuard';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { TeamDetailResponse } from '@moimi/core/types/team';
import { ANALYTICS_EVENTS } from '@moimi/core/constants/analytics';
import { startAnalyticsAttempt } from '@/lib/analytics';
import { capture } from '@/lib/analytics/client';

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
    const attempt = startAnalyticsAttempt('team_create', {
      feature: 'team',
      attempt_scope: 'submission',
      category: form.category,
    });

    let createdTeam: TeamDetailResponse;

    try {
      createdTeam = await createTeam({
        name: form.name,
        category: form.category,
        description: form.description,
        link: form.link || undefined,
        sns: form.sns || undefined,
        imageKey: form.imageUrl || undefined,
      });
    } catch (error) {
      attempt.fail(error);
      console.error('팀 생성 실패', error);
      return;
    }

    attempt.succeed({
      team_id: createdTeam.teamId,
    });

    // 생성된 팀 ID와 행동 분류를 추가
    capture(ANALYTICS_EVENTS.TEAM_CREATED, {
      feature: 'team',
      interaction_type: 'creation',
      team_id: String(createdTeam.teamId),
      category: form.category,
      has_image: Boolean(form.imageUrl),
      attempt_id: attempt.attemptId,
    });

    router.push('/team');
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

'use client';

import TeamForm, { type TeamFormData } from '@/components/team/TeamForm';
import { useRouter } from 'next/navigation';

export default function TeamCreatePage() {
  const router = useRouter();

  const handleSubmit = async (form: TeamFormData) => {
    console.log('팀 생성 요청:', form);

    await fetch('/api/teams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    router.push('/team');
  };

  return <TeamForm mode="create" onSubmit={handleSubmit} />;
}

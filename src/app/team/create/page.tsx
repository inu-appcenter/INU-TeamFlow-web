'use client';

import TeamForm, { type TeamFormData } from '@/components/team/TeamForm';
import { useCreateTeam } from '@/hooks/useTeamQuery';
import { useRouter } from 'next/navigation';

export default function TeamCreatePage() {
  const router = useRouter();
  const { mutateAsync: createTeam } = useCreateTeam();

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

  return <TeamForm mode="create" onSubmit={handleSubmit} />;
}

'use client';

import TeamForm, { type TeamFormData } from '@/components/team/TeamForm';
import { useRouter, useParams } from 'next/navigation';
import { teamDetails } from '@/mocks/teams';
import { useMemo } from 'react';

export default function TeamEditPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = useMemo(() => {
    return Number(Array.isArray(params.id) ? params.id[0] : params.id);
  }, [params.id]);
  const team = teamDetails.find((t) => t.teamId === teamId);

  if (!team) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-[#2C2C2C]">존재하지 않는 팀입니다.</p>
      </main>
    );
  }

  const initialData: TeamFormData = {
    name: team.name,
    category: team.category,
    description: team.description,
    link: team.link ?? '',
    sns: team.sns ?? '',
    imageUrl: team.imageUrl ?? '', // ✔️ 여기만 사용
  };

  const handleSubmit = async (form: TeamFormData) => {
    try {
      const res = await fetch(`/api/teams/${team.teamId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error('팀 수정 실패');
      }

      router.push(`/team/${team.teamId}`);
    } catch (err) {
      console.error(err);
      alert('수정에 실패했습니다.');
    }
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-[800px]">
        <TeamForm
          mode="edit"
          initialData={initialData}
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
}

'use client';

import TeamForm, { type TeamFormData } from '@/components/team/TeamForm';
import {
  useTeamDetail,
  useUpdateTeam,
  useDeleteTeam,
} from '@/hooks/useTeamQuery';
import { useRouter, useParams } from 'next/navigation';
import { useMemo, useState } from 'react';

export default function TeamEditPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = useMemo(() => {
    return Number(Array.isArray(params.id) ? params.id[0] : params.id);
  }, [params.id]);

  const { data: team, isLoading } = useTeamDetail(teamId);
  const { mutateAsync: updateTeam } = useUpdateTeam();

  const { mutateAsync: deleteTeamMutate } = useDeleteTeam();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteTeamMutate(teamId);
      router.push('/team');
    } catch (err) {
      console.error('팀 삭제 실패', err);
    }
  };

  if (isLoading) return null;

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
    imageUrl: team.imageUrl ?? '',
  };

  const handleSubmit = async (form: TeamFormData) => {
    try {
      await updateTeam({
        teamId,
        body: {
          name: form.name,
          category: form.category,
          description: form.description,
          link: form.link || undefined,
          sns: form.sns || undefined,
          imageKey: form.imageUrl || undefined,
        },
      });
      router.push(`/team/${teamId}`);
    } catch (err) {
      console.error('팀 수정 실패', err);
    }
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-[800px]">
        <TeamForm
          mode="edit"
          initialData={initialData}
          onSubmit={handleSubmit}
          onDelete={() => setIsDeleteConfirmOpen(true)}
        />
      </div>

      {isDeleteConfirmOpen && (
        <div
          onClick={() => setIsDeleteConfirmOpen(false)}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-modal-pop w-[360px] rounded-3xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-center text-xl font-bold">팀을 삭제할까요?</h2>

            <p className="mt-2 text-center text-sm text-[#989898]">
              삭제한 팀은 복구할 수 없어요
            </p>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 cursor-pointer rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-2 font-semibold"
              >
                취소
              </button>

              <button
                onClick={async () => {
                  setIsDeleteConfirmOpen(false);
                  await handleDelete();
                }}
                className="flex-1 cursor-pointer rounded-xl bg-[#E22222] py-3 font-semibold text-white"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

'use client';

import TeamForm, { type TeamFormData } from '@/components/team/TeamForm';
import { isDefaultTeamImage } from '@/utils/image/isDefaultTeamImage';
import {
  useTeamDetail,
  useUpdateTeam,
  useDeleteTeam,
} from '@moimi/core/hooks/team/useTeamQuery';
import { useRouter, useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import PostDeleteConfirmModal from '@/components/common/PostDeleteConfirmModal';

export default function TeamEditPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = useMemo(() => {
    return Number(Array.isArray(params.id) ? params.id[0] : params.id);
  }, [params.id]);

  const { data: team, isLoading } = useTeamDetail(teamId);
  const { mutateAsync: updateTeam } = useUpdateTeam();

  const { mutateAsync: deleteTeamMutate, isPending: isDeleting } =
    useDeleteTeam();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      await deleteTeamMutate(teamId);
      setIsDeleteConfirmOpen(false);
      router.push('/team');
    } catch (err) {
      console.error('팀 삭제 실패', err);
      setIsDeleteConfirmOpen(false);
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
    imageUrl:
      team.imageUrl && !isDefaultTeamImage(team.imageUrl) ? team.imageUrl : '',
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
    <>
      <TeamForm
        mode="edit"
        initialData={initialData}
        onSubmit={handleSubmit}
        onDelete={() => setIsDeleteConfirmOpen(true)}
      />

      {isDeleteConfirmOpen && (
        <PostDeleteConfirmModal
          postLabel="팀"
          isPending={isDeleting}
          onClose={() => {
            if (!isDeleting) setIsDeleteConfirmOpen(false);
          }}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}

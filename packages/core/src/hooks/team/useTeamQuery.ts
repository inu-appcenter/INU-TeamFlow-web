import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMyTeams,
  getTeamDetail,
  getTeamMembers,
  createTeam,
  updateTeam,
  deleteTeam,
  kickMember,
  leaveTeam,
  updateMemberRole,
} from '@moimi/core/api/team';
import type { TeamCreateRequest, TeamUpdateRequest } from '@moimi/core/types/team';

export const teamKeys = {
  myTeams: () => ['teams', 'me'] as const,
  teamDetail: (teamId: number) => ['teams', teamId] as const,
  teamMembers: (teamId: number) => ['teams', teamId, 'members'] as const,
};

export const useMyTeams = () =>
  useQuery({
    queryKey: teamKeys.myTeams(),
    queryFn: getMyTeams,
  });

export const useTeamDetail = (teamId: number) =>
  useQuery({
    queryKey: teamKeys.teamDetail(teamId),
    queryFn: () => getTeamDetail(teamId),
  });

export const useTeamMembers = (teamId: number, enabled = true) =>
  useQuery({
    queryKey: teamKeys.teamMembers(teamId),
    queryFn: () => getTeamMembers(teamId),
    enabled: enabled && !!teamId,
  });

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: TeamCreateRequest) => createTeam(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      teamId,
      body,
    }: {
      teamId: number;
      body: TeamUpdateRequest;
    }) => updateTeam(teamId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: number) => deleteTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useKickMember = (teamId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: number) => kickMember(teamId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.teamMembers(teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.teamDetail(teamId) });
    },
  });
};

export const useLeaveTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: number) => leaveTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useUpdateMemberRole = (teamId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memberId,
      teamRole,
    }: {
      memberId: number;
      teamRole: 'LEADER' | 'MANAGER' | 'MEMBER';
    }) => updateMemberRole(teamId, memberId, teamRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.teamMembers(teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.teamDetail(teamId) });
    },
  });
};

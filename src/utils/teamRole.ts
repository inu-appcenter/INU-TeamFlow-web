export const TEAM_ROLE_MAP: Record<string, string> = {
  LEADER: '팀장',
  MANAGER: '매니저',
  MEMBER: '팀원',
};

export const getTeamRoleLabel = (role: string) => TEAM_ROLE_MAP[role] ?? role;

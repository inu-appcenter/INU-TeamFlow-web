export const TEAM_ROLE_MAP: Record<string, string> = {
  LEADER: '팀장',
  MANAGER: '관리자',
  MEMBER: '팀원',
};

export const getTeamRoleLabel = (role: string) => TEAM_ROLE_MAP[role] ?? role;

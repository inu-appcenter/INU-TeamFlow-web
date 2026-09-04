import { infoPostCategoryColorMap } from '@/constants/infoPost';

export const categoryMap: Record<string, string> = {
  CONTEST: '공모전',
  STUDY: '스터디',
  PROJECT: '프로젝트',
  CLUB: '동아리',
  ETC: '기타',
  EXTERNAL_ACTIVITY: '외부활동',
  INTERN: '인턴',
  CAREER_ADVICE: '취업 조언',
  CASUAL_TALK: '잡담',
  INFO_SHARING: '정보 공유',
  INVITATION: '초대',
};

// CONTEST~ETC는 팀(모집글) 카테고리라 이 파일이 색상 원본입니다.
// 나머지(EXTERNAL_ACTIVITY~INFO_SHARING)는 정보글 전용 카테고리라
// infoPostCategoryColorMap 값을 그대로 가져와 씁니다. 스프레드 뒤에
// 오는 팀 카테고리 5개가 우선순위를 가지므로, CONTEST/CLUB이 두 맵에
// 모두 있어도 여기 적힌 값이 이깁니다.
export const categoryColorMap: Record<string, string> = {
  ...infoPostCategoryColorMap,
  CONTEST: '#FBE4F8',
  STUDY: '#D8FAD8',
  PROJECT: '#DCEBFF',
  CLUB: '#FFF1CC',
  ETC: '#E9E9E9',
  INVITATION: '#E3E7EE',
};

export const categoryBorderColorMap: Record<string, string> = {
  CONTEST: '#E7A8DF',
  STUDY: '#95D695',
  PROJECT: '#9FC4F7',
  CLUB: '#E8C46A',
  ETC: '#BDBDBD',
  EXTERNAL_ACTIVITY: '#7FC4DD',
  INTERN: '#AEA2DE',
  CAREER_ADVICE: '#96ADD2',
  CASUAL_TALK: '#E3A087',
  INFO_SHARING: '#83BFAE',
};

export const categoryTextColorMap: Record<string, string> = {
  CONTEST: '#9E3F8F',
  STUDY: '#357A42',
  PROJECT: '#426AA3',
  CLUB: '#8C6800',
  ETC: '#616161',
  EXTERNAL_ACTIVITY: '#00728F',
  INTERN: '#6D5E9F',
  CAREER_ADVICE: '#4D6993',
  CASUAL_TALK: '#99563A',
  INFO_SHARING: '#257464',
};

export const DEFAULT_CATEGORY_COLOR = '#E9E9E9';

export const statusBorderColorMap: Record<string, string> = {
  ONGOING: '#DDF7E5',
  ENDED: '#EEF1F5',
  OPEN: '#DDF7E5',
  CLOSED: '#EEF1F5',
  WAITING: '#E8F1FF',
  READ: '#EEF1F5',
  UNREAD: '#E8F1FF',
  ACCEPTED: '#DDF7E5',
  DECLINED: '#FFDDDD',
  CANCELLED: '#EEF1F5',
};

export const statusTextColorMap: Record<string, string> = {
  ONGOING: '#2E7845',
  ENDED: '#646B75',
  OPEN: '#2E7845',
  CLOSED: '#646B75',
  WAITING: '#416AAB',
  READ: '#646B75',
  UNREAD: '#416AAB',
  ACCEPTED: '#2E7845',
  DECLINED: '#B53434',
  CANCELLED: '#646B75',
};

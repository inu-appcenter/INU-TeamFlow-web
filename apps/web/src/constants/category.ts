export const categoryMap: Record<string, string> = {
  CONTEST: '공모전',
  STUDY: '스터디',
  PROJECT: '프로젝트',
  CLUB: '동아리',
  ETC: '기타',
};

export const categoryColorMap: Record<string, string> = {
  CONTEST: '#FBE4F8',
  STUDY: '#D8FAD8',
  PROJECT: '#DCEBFF',
  CLUB: '#FFF1CC',
  ETC: '#E9E9E9',
};

export const categoryBorderColorMap: Record<string, string> = {
  CONTEST: '#E7A8DF',
  STUDY: '#95D695',
  PROJECT: '#9FC4F7',
  CLUB: '#E8C46A',
  ETC: '#BDBDBD',
};

export const categoryTextColorMap: Record<string, string> = {
  CONTEST: '#9E3F8F',
  STUDY: '#357A42',
  PROJECT: '#426AA3',
  CLUB: '#8C6800',
  ETC: '#616161',
};

export const DEFAULT_CATEGORY_COLOR = '#E9E9E9';

export const categoryFilterOptions = [
  { label: '전체', value: 'ALL' },
  { label: '공모전', value: 'CONTEST' },
  { label: '스터디', value: 'STUDY' },
  { label: '프로젝트', value: 'PROJECT' },
  { label: '동아리', value: 'CLUB' },
  { label: '기타', value: 'ETC' },
];

export const InfoPostCategoryMap: Record<string, string> = {
  CONTEST: '공모전',
  CLUB: '동아리',
  EXTERNAL_ACTIVITY: '외부활동',
  INTERN: '인턴',
  CAREER_ADVICE: '취업 조언',
  CASUAL_TALK: '고민 ・ 잡담',
  INFO_SHARING: '정보 공유',
};

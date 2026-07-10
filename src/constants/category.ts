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

export const DEFAULT_CATEGORY_COLOR = '#E9E9E9';

export const categoryFilterOptions = [
  { label: '전체', value: 'ALL' },
  { label: '공모전', value: 'CONTEST' },
  { label: '스터디', value: 'STUDY' },
  { label: '프로젝트', value: 'PROJECT' },
  { label: '동아리', value: 'CLUB' },
  { label: '기타', value: 'ETC' },
];

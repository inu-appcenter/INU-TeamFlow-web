import type { InfoPostCategory, InfoPostType } from '../types/infoPost';

export const infoPostCategoryMap: Record<InfoPostCategory, string> = {
  CONTEST: '공모전',
  CLUB: '동아리',
  EXTERNAL_ACTIVITY: '대외활동',
  INTERN: '인턴',
  CAREER_ADVICE: '취업 조언',
  CASUAL_TALK: '고민·잡담',
  INFO_SHARING: '정보 공유',
};

export const infoPostCategoryColorMap: Record<InfoPostCategory, string> = {
  CONTEST: '#FBE4F8',
  CLUB: '#FFF1CC',
  EXTERNAL_ACTIVITY: '#DCEBFF',
  INTERN: '#D8FAD8',
  CAREER_ADVICE: '#FFE4D6',
  CASUAL_TALK: '#E8E0FF',
  INFO_SHARING: '#E9E9E9',
};

export const infoPostCategoryBorderColorMap: Record<InfoPostCategory, string> =
  {
    CONTEST: '#E7A8DF',
    CLUB: '#E8C46A',
    EXTERNAL_ACTIVITY: '#9FC4F7',
    INTERN: '#95D695',
    CAREER_ADVICE: '#F0AC85',
    CASUAL_TALK: '#B9A5E8',
    INFO_SHARING: '#BDBDBD',
  };

export const infoPostCategoryFilterOptions: {
  label: string;
  value: 'ALL' | InfoPostCategory;
}[] = [
  { label: '전체', value: 'ALL' },
  { label: '공모전', value: 'CONTEST' },
  { label: '동아리', value: 'CLUB' },
  { label: '대외활동', value: 'EXTERNAL_ACTIVITY' },
  { label: '인턴', value: 'INTERN' },
  { label: '취업 조언', value: 'CAREER_ADVICE' },
  { label: '고민·잡담', value: 'CASUAL_TALK' },
  { label: '정보 공유', value: 'INFO_SHARING' },
];

export const infoPostTypeFilterOptions: {
  label: string;
  value: 'ALL' | InfoPostType;
}[] = [
  { label: '전체', value: 'ALL' },
  { label: '공지·정보', value: 'NOTICE' },
  { label: '자유글', value: 'FREE' },
];

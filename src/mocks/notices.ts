export interface Notice {
  noticeId: number;

  teamId: number;
  teamName: string;

  title: string;
  content: string;

  createdAt: string;
}

export const notices: Notice[] = [
  {
    noticeId: 1,
    teamId: 1,
    teamName: '프론트팀',

    title: '5월 첫 번째 정기 회의 안내',

    content:
      '이번 주 금요일 오후 7시에 정기 회의를 진행합니다. 각자 맡은 기능 진행 상황을 정리해서 참석해주세요.',

    createdAt: '2026-05-01',
  },

  {
    noticeId: 2,
    teamId: 2,
    teamName: '알고리즘 스터디',

    title: '스터디 장소 변경 안내',

    content:
      '기존 강의실 사용이 어려워져 공학관 301호로 변경되었습니다. 시간은 동일합니다.',

    createdAt: '2026-05-03',
  },

  {
    noticeId: 3,
    teamId: 3,
    teamName: '캡스톤 프로젝트팀',

    title:
      '최종 발표 자료 제출 관련 공지 어쩌구저쩌군ㅇ럼너라ㅣㅁ너라ㅣㅁ너라ㅣㅁ널',

    content:
      '최종 발표 자료는 발표 하루 전까지 업로드해주세요. 제출 형식은 PDF이며 발표 시간은 10분입니다.',

    createdAt: '2026-05-05',
  },

  {
    noticeId: 4,
    teamId: 4,
    teamName: 'UX 동아리',

    title: '신입 부원 OT 안내',

    content:
      '신입 부원 오리엔테이션은 토요일 오후 2시에 진행됩니다. 간단한 자기소개를 준비해주세요.',

    createdAt: '2026-05-03',
  },

  {
    noticeId: 5,
    teamId: 4,
    teamName: 'UX 동아리',

    title: '디자인 세션 일정 공지',

    content:
      '이번 주 디자인 세션에서는 Figma 컴포넌트 시스템과 Auto Layout을 다룰 예정입니다.',

    createdAt: '2026-05-05',
  },

  {
    noticeId: 6,
    teamId: 1,
    teamName: '프론트팀',

    title: '캘린더 기능 QA 요청',

    content:
      '캘린더 기간 일정과 반복 일정 관련 QA를 진행해주세요. 발견된 버그는 노션에 정리 부탁드립니다.',

    createdAt: '2026-05-08',
  },

  {
    noticeId: 7,
    teamId: 1,
    teamName: '프론트팀',

    title: '배포 일정 공유',

    content:
      '다음 주 월요일 저녁에 첫 테스트 배포를 진행할 예정입니다. develop 브랜치 최신화 부탁드립니다.',

    createdAt: '2026-05-10',
  },
];

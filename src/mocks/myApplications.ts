import type { RecruitmentCategory } from './myRecruitments';

export type ApplicationStatus = 'WAITING' | 'ACCEPTED' | 'REJECTED';

export type MyApplication = {
  applicationId: number;
  applicationStatus: ApplicationStatus;
  recruitmentCategory: RecruitmentCategory;
  recruiterName: string;
  createdAt: string;
  respondedAt: string | null;
  type: 'APPLY';
};

export const myApplications: MyApplication[] = [
  {
    applicationId: 101,
    applicationStatus: 'WAITING',
    recruitmentCategory: 'CONTEST',
    recruiterName: '홍길동',
    createdAt: '2026-06-25T04:48:37.644Z',
    respondedAt: null,
    type: 'APPLY',
  },
  {
    applicationId: 102,
    applicationStatus: 'ACCEPTED',
    recruitmentCategory: 'PROJECT',
    recruiterName: '김민수',
    createdAt: '2026-06-22T11:20:00.000Z',
    respondedAt: '2026-06-23T13:00:00.000Z',
    type: 'APPLY',
  },
  {
    applicationId: 103,
    applicationStatus: 'REJECTED',
    recruitmentCategory: 'STUDY',
    recruiterName: '이서연',
    createdAt: '2026-06-18T09:30:00.000Z',
    respondedAt: '2026-06-20T10:00:00.000Z',
    type: 'APPLY',
  },
];

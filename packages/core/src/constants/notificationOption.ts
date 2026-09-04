import type { NotificationItem } from '../types/notificationOption';

export const notificationItems: NotificationItem[] = [
  {
    key: 'noticeEnabled',
    title: '공지 알림',
    description: '새로운 공지와 관련된 알림을 받아요',
  },
  {
    key: 'inviteEnabled',
    title: '초대 알림',
    description: '팀 초대와 관련된 알림을 받아요',
  },
  {
    key: 'applicationEnabled',
    title: '신청 알림',
    description: '팀 신청과 관련된 알림을 받아요',
  },
  {
    key: 'calendarEnabled',
    title: '캘린더 알림',
    description: '일정과 관련된 알림을 받아요',
  },
  {
    key: 'chatEnabled',
    title: '채팅 알림',
    description: '새로운 채팅과 관련된 알림을 받아요',
  },
];

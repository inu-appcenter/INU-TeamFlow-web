import type { NotificationListResponse } from '@/types/notification';

export const mockNotificationResponse: NotificationListResponse = {
  hasNext: false,
  unreadCount: 2,
  notifications: [
    {
      notificationId: 40,
      title: '[앱센터 - 베이직 스터디 일정] 일정 투표가 시작되었습니다',
      content: '오프라인으로 진행될 예정입니다. 가능한 시간대에 투표해주세요.',
      type: 'TEAM_SCHEDULE',
      redirectUrl: '/team/1/vote/5',
      isRead: false,
      createdAt: '2026-07-10T09:00:00',
    },
    {
      notificationId: 39,
      title: '[TEAM FLOW] 프로젝트 팀에 초대되었습니다',
      content: '홍길동님이 팀 초대를 보냈습니다.',
      type: 'INVITE',
      redirectUrl: '/mypage/invitations',
      isRead: false,
      createdAt: '2026-07-09T21:04:00',
    },
    {
      notificationId: 38,
      title: '[프론트엔드 프로젝트]에 보낸 신청이 승인되었습니다',
      content: '담당자가 신청서를 승인했습니다.',
      type: 'APPLICATION',
      redirectUrl: '/application/38',
      isRead: true,
      createdAt: '2026-07-09T18:47:00',
    },
    {
      notificationId: 37,
      title: '[앱센터] 새로운 공지사항이 등록되었습니다',
      content: '이번 주 팀 회의 장소가 변경되었습니다.',
      type: 'NOTICE',
      redirectUrl: '/team/1/notice/12',
      isRead: true,
      createdAt: '2026-07-08T14:30:00',
    },
    {
      notificationId: 36,
      title: '[TEAM FLOW] 새로운 채팅 메시지가 도착했습니다',
      content: '팀 채팅에 새로운 메시지가 있습니다.',
      type: 'CHAT',
      redirectUrl: '/team/1/chat',
      isRead: true,
      createdAt: '2026-07-07T20:15:00',
    },
  ],
};

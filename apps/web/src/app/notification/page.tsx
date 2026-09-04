'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { motion } from 'motion/react';
import Checkbox from '@/components/common/Checkbox';
import BottomNav from '@/components/common/bottom-nav/BottomNav';
import {
  useDeleteNotifications,
  useNotifications,
  useReadNotification,
  useReadNotifications,
} from '@moimi/core/hooks/useNotificationQuery';
import { useErrorToast } from '@/hooks/useErrorToast';
import type {
  NotificationFilterType,
  NotificationItem,
  NotificationType,
} from '@moimi/core/types/notification';
import { formatDate } from '@/utils/date/formatDate';

const notificationTabs: {
  label: string;
  value: NotificationFilterType;
}[] = [
  { label: '전체', value: 'ALL' },
  { label: '공지사항', value: 'NOTICE' },
  { label: '초대', value: 'INVITE' },
  { label: '신청', value: 'APPLICATION' },
  { label: '일정', value: 'CALENDAR' },
  { label: '채팅', value: 'CHAT' },
];

const notificationTypeLabel: Record<NotificationType, string> = {
  NOTICE: '공지사항',
  INVITE: '초대',
  APPLICATION: '신청',
  CALENDAR: '일정',
  CHAT: '채팅',
};

const notificationTypeStyle: Record<NotificationType, string> = {
  NOTICE: 'bg-[#EAF2FF] text-[#5E92F0]',
  INVITE: 'bg-[#EEE9FF] text-[#7656D6]',
  APPLICATION: 'bg-[#EAF8EF] text-[#3B8A58]',
  CALENDAR: 'bg-[#FFF2E6] text-[#C8762D]',
  CHAT: 'bg-[#EEF1F5] text-[#5C6670]',
};

export default function NotificationPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<NotificationFilterType>('ALL');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { errorMessage, showErrorMessage } = useErrorToast();

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useNotifications(activeTab);

  const { mutateAsync: readNotification, isPending: isReadingOne } =
    useReadNotification();

  const { mutateAsync: readNotifications, isPending: isReadingSelected } =
    useReadNotifications();

  const { mutateAsync: deleteNotifications, isPending: isDeletingSelected } =
    useDeleteNotifications();

  const notifications = useMemo(
    () =>
      data?.pages.flatMap(
        (notificationPage) => notificationPage.notifications
      ) ?? [],
    [data]
  );

  const unreadCount = data?.pages[0]?.unreadCount ?? 0;

  const notificationIds = notifications.map(
    (notification) => notification.notificationId
  );

  const isAllSelected =
    notificationIds.length > 0 &&
    notificationIds.every((notificationId) =>
      selectedIds.includes(notificationId)
    );

  const isMutationPending =
    isReadingOne || isReadingSelected || isDeletingSelected;

  const handleTabChange = (tab: NotificationFilterType) => {
    setActiveTab(tab);
    setSelectedIds([]);
  };

  const handleSelectNotification = (notificationId: number) => {
    setSelectedIds((currentIds) =>
      currentIds.includes(notificationId)
        ? currentIds.filter((id) => id !== notificationId)
        : [...currentIds, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(notificationIds);
  };

  const handleMarkAsRead = async () => {
    if (selectedIds.length === 0 || isReadingSelected) {
      return;
    }

    try {
      await readNotifications(selectedIds);
      setSelectedIds([]);
    } catch {
      showErrorMessage('알림을 읽음 처리하지 못했습니다.');
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0 || isDeletingSelected) {
      return;
    }

    try {
      await deleteNotifications(selectedIds);
      setSelectedIds([]);
    } catch {
      showErrorMessage('알림을 삭제하지 못했습니다.');
    }
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (isReadingOne) {
      return;
    }

    try {
      if (!notification.isRead) {
        await readNotification(notification.notificationId);
      }

      if (notification.redirectUrl) {
        router.push(notification.redirectUrl);
      }
    } catch {
      showErrorMessage('알림을 확인하지 못했습니다.');
    }
  };

  const handleFetchNextPage = async () => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    try {
      await fetchNextPage();
    } catch {
      showErrorMessage('알림을 추가로 불러오지 못했습니다.');
    }
  };

  return (
    <main className="min-h-screen px-3 py-6 pb-28 sm:px-6">
      {errorMessage && (
        <div className="animate-modal-pop fixed top-32 left-1/2 z-150 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
          {errorMessage}
        </div>
      )}

      <div className="mx-auto mb-10 max-w-[1180px]">
        <header className="mt-12 mb-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="이전 페이지로 돌아가기"
            className="cursor-pointer text-[#2C2C2C] transition-all duration-150 active:scale-90"
          >
            <ChevronLeft size={28} strokeWidth={2.5} />
          </button>

          <h1 className="text-2xl font-bold text-[#2C2C2C]">알림</h1>
        </header>

        {unreadCount > 0 && (
          <div className="mb-3 flex items-center gap-3 rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-[#5E92F0]/5 px-5 py-4 sm:px-6">
            <Bell
              size={20}
              strokeWidth={2.5}
              className="shrink-0 text-[#5E92F0]"
            />

            <p className="text-sm font-semibold text-[#2C2C2C] sm:text-base">
              아직 읽지 않은 알림이{' '}
              <span className="font-bold text-[#5E92F0]">{unreadCount}건</span>{' '}
              있어요
            </p>
          </div>
        )}

        <section className="mb-3 rounded-xl border-[0.5px] border-[#D6DDE5] bg-white px-4 pt-4 sm:px-6">
          <div className="relative flex border-b-[0.5px] border-[#D6DDE5]">
            {notificationTabs.map((tab) => {
              const isActive = activeTab === tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleTabChange(tab.value)}
                  disabled={isMutationPending}
                  className={`relative flex-1 cursor-pointer pb-4 text-center text-lg font-bold whitespace-nowrap transition sm:text-xl ${
                    isActive
                      ? 'text-[#5E92F0]'
                      : 'text-[#CBD2DA] hover:text-[#5E92F0]'
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {tab.label}

                  {isActive && (
                    <motion.div
                      layoutId="notificationTabIndicator"
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-[#5E92F0]"
                      transition={{
                        type: 'spring',
                        stiffness: 600,
                        damping: 50,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex min-h-16 flex-wrap items-center gap-2 py-3">
            <div
              className={
                notifications.length === 0 || isMutationPending
                  ? 'pointer-events-none opacity-50'
                  : ''
              }
            >
              <Checkbox
                checked={isAllSelected}
                onChange={handleSelectAll}
                label="전체 선택"
                size="sm"
                className="mr-1 text-sm font-medium text-[#989898]"
              />
            </div>

            <button
              type="button"
              onClick={handleMarkAsRead}
              disabled={selectedIds.length === 0 || isReadingSelected}
              className="flex w-18 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-[0.5px] border-[#D6DDE5] bg-white py-1.5 text-sm font-medium text-[#5c5c5c] transition-all duration-150 hover:border-[#5E92F0] hover:text-[#5E92F0] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check size={16} strokeWidth={2.5} />
              읽음
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={selectedIds.length === 0 || isDeletingSelected}
              className="flex w-18 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-[0.5px] border-[#D6DDE5] bg-white py-1.5 text-sm font-medium text-[#5c5c5c] transition-all duration-150 hover:border-[#FF7B8A] hover:text-[#FF7B8A] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={15} strokeWidth={2.5} />
              삭제
            </button>

            {selectedIds.length > 0 && (
              <span className="ml-auto text-xs font-medium text-[#989898]">
                {selectedIds.length}개 선택
              </span>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          {isLoading ? (
            <NotificationListSkeleton />
          ) : isError ? (
            <div className="flex h-[240px] items-center justify-center rounded-xl border-[0.5px] border-[#D6DDE5] bg-white text-sm text-[#989898]">
              알림을 불러오지 못했습니다
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-[240px] items-center justify-center rounded-xl border-[0.5px] border-[#D6DDE5] bg-white text-sm text-[#989898]">
              알림이 없습니다
            </div>
          ) : (
            notifications.map((notification) => {
              const isSelected = selectedIds.includes(
                notification.notificationId
              );

              return (
                <article
                  key={notification.notificationId}
                  className={`flex items-center gap-3 rounded-xl border-[0.5px] bg-white px-4 py-4 transition hover:bg-[#FAFAFA] sm:px-5 ${
                    notification.isRead
                      ? 'border-[#D6DDE5]'
                      : 'border-l-10 border-[#D6DDE5] border-l-[#5E92F0]'
                  }`}
                >
                  <div
                    className={
                      isMutationPending ? 'pointer-events-none opacity-50' : ''
                    }
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() =>
                        handleSelectNotification(notification.notificationId)
                      }
                      size="md"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    disabled={isReadingOne}
                    className="group flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left disabled:cursor-not-allowed"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                            notificationTypeStyle[notification.type]
                          }`}
                        >
                          {notificationTypeLabel[notification.type]}
                        </span>

                        <h2
                          className={`truncate text-base text-[#2C2C2C] sm:text-lg ${
                            notification.isRead ? 'font-semibold' : 'font-bold'
                          }`}
                        >
                          {notification.title}
                        </h2>

                        {!notification.isRead && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5E92F0]" />
                        )}
                      </div>

                      <p className="mt-1 truncate px-1 text-sm text-[#989898]">
                        {notification.content}
                      </p>

                      <time className="mt-1 block px-1 text-xs text-[#b0b0b0]">
                        {formatDate(notification.createdAt)}
                      </time>
                    </div>

                    <ChevronRight
                      size={22}
                      strokeWidth={2.5}
                      className="shrink-0 text-[#989898]/60 transition-transform duration-150 group-hover:translate-x-0.5"
                    />
                  </button>
                </article>
              );
            })
          )}
        </section>

        {!isLoading && !isError && notifications.length > 0 && hasNextPage && (
          <button
            type="button"
            onClick={handleFetchNextPage}
            disabled={isFetchingNextPage}
            className="group mx-auto mt-7 flex cursor-pointer items-center justify-center gap-0 rounded-xl border-[0.5px] border-[#D6DDE5]/40 bg-white px-6 py-2.5 text-sm font-semibold text-[#5E92F0] transition-all duration-150 hover:bg-[#F8FAFF] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFetchingNextPage ? '불러오는 중...' : '알림 더 보기'}

            <span className="ml-0 inline-flex w-0 items-center justify-center overflow-hidden opacity-0 transition-all duration-200 group-hover:w-5.5 group-hover:opacity-100">
              <ChevronDown
                size={16}
                className="mr-[-12px] shrink-0"
                strokeWidth={2.5}
              />
            </span>
          </button>
        )}

        {!isLoading && !isError && notifications.length > 0 && !hasNextPage && (
          <p className="mt-7 text-center text-sm text-[#B0B8C1]">
            모든 알림을 확인했어요
          </p>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

function NotificationListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-xl border-[0.5px] border-[#D6DDE5] bg-white px-4 py-4 sm:px-5"
        >
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 shrink-0 rounded bg-[#EDF1F5]" />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="h-6 w-16 rounded-full bg-[#EDF1F5]" />
                <div className="h-5 w-2/5 rounded bg-[#EDF1F5]" />
              </div>

              <div className="mt-3 h-4 w-3/5 rounded bg-[#EDF1F5]" />
              <div className="mt-3 h-3 w-20 rounded bg-[#EDF1F5]" />
            </div>

            <div className="h-6 w-6 rounded bg-[#EDF1F5]" />
          </div>
        </div>
      ))}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { BellRing } from 'lucide-react';
import {
  useNotificationOptions,
  useUpdateNotificationOptions,
} from '@/hooks/useNotificationOptionQuery';
import type { NotificationOptionRequest } from '@/types/notificationOption';

interface NotificationSettingsProps {
  showErrorMessage: (message: string) => void;
}

interface NotificationToggleProps {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

const notificationItems: {
  key: keyof NotificationOptionRequest;
  title: string;
  description: string;
}[] = [
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

function NotificationToggle({
  checked,
  disabled = false,
  onChange,
  label,
}: NotificationToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
        checked ? 'bg-[#5E92F0]' : 'bg-[#D9DEE7]'
      } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
    >
      <span
        className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function NotificationSettings({
  showErrorMessage,
}: NotificationSettingsProps) {
  const {
    data: notificationOptions,
    isLoading,
    isError,
  } = useNotificationOptions();

  const { mutate: updateNotificationOptions, isPending } =
    useUpdateNotificationOptions();

  const [draft, setDraft] = useState<NotificationOptionRequest | null>(null);

  useEffect(() => {
    if (!notificationOptions) return;

    setDraft({
      noticeEnabled: notificationOptions.noticeEnabled,
      inviteEnabled: notificationOptions.inviteEnabled,
      applicationEnabled: notificationOptions.applicationEnabled,
      calendarEnabled: notificationOptions.calendarEnabled,
      chatEnabled: notificationOptions.chatEnabled,
    });
  }, [notificationOptions]);

  const allEnabled =
    draft !== null &&
    draft.noticeEnabled &&
    draft.inviteEnabled &&
    draft.applicationEnabled &&
    draft.calendarEnabled &&
    draft.chatEnabled;

  const isDirty =
    draft !== null &&
    notificationOptions !== undefined &&
    (draft.noticeEnabled !== notificationOptions.noticeEnabled ||
      draft.inviteEnabled !== notificationOptions.inviteEnabled ||
      draft.applicationEnabled !== notificationOptions.applicationEnabled ||
      draft.calendarEnabled !== notificationOptions.calendarEnabled ||
      draft.chatEnabled !== notificationOptions.chatEnabled);

  const handleAllToggle = (enabled: boolean) => {
    setDraft({
      noticeEnabled: enabled,
      inviteEnabled: enabled,
      applicationEnabled: enabled,
      calendarEnabled: enabled,
      chatEnabled: enabled,
    });
  };

  const handleOptionToggle = (
    key: keyof NotificationOptionRequest,
    enabled: boolean
  ) => {
    setDraft((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [key]: enabled,
      };
    });
  };

  const handleCancel = () => {
    if (!notificationOptions) return;

    setDraft({
      noticeEnabled: notificationOptions.noticeEnabled,
      inviteEnabled: notificationOptions.inviteEnabled,
      applicationEnabled: notificationOptions.applicationEnabled,
      calendarEnabled: notificationOptions.calendarEnabled,
      chatEnabled: notificationOptions.chatEnabled,
    });
  };

  const handleSave = () => {
    if (!draft || !isDirty || isPending) return;

    const request = { ...draft };

    updateNotificationOptions(request, {
      onError: () => {
        showErrorMessage('알림 설정 저장에 실패했습니다');
      },
    });
  };

  if (isLoading || !draft) {
    return (
      <section>
        <div className="mb-4">
          <h3 className="text-[18px] font-bold text-[#2C2C2C]">알림 설정</h3>

          <p className="mt-1 text-[14px] leading-6 text-[#989898]">
            받고 싶은 알림을 선택할 수 있어요
          </p>
        </div>

        <div className="flex min-h-[180px] items-center justify-center rounded-3xl border-[0.5px] border-[#D6DDE5] bg-white">
          <p className="text-[14px] text-[#989898]">
            알림 설정을 불러오는 중...
          </p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section>
        <div className="mb-4">
          <h3 className="text-[18px] font-bold text-[#2C2C2C]">알림 설정</h3>
        </div>

        <div className="flex min-h-[180px] items-center justify-center rounded-3xl border-[0.5px] border-[#D6DDE5] bg-white">
          <p className="text-[14px] text-[#989898]">
            알림 설정을 불러오지 못했습니다
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-4">
      <div className="mb-4">
        <h3 className="text-[18px] font-bold text-[#2C2C2C]">알림 설정</h3>

        <p className="mt-1 text-[14px] leading-6 text-[#989898]">
          받고 싶은 알림을 선택할 수 있어요
        </p>
      </div>

      <div className="rounded-3xl border-[0.5px] border-[#D6DDE5] bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F1FF] text-[#5E92F0]">
              <BellRing size={19} />
            </span>

            <div className="min-w-0">
              <p className="text-[16px] font-semibold text-[#2C2C2C]">
                전체 알림
              </p>

              <p className="mt-1 text-[13px] text-[#989898]">
                모든 알림을 한 번에 켜거나 끌 수 있어요
              </p>
            </div>
          </div>

          <NotificationToggle
            label="전체 알림"
            checked={allEnabled}
            onChange={handleAllToggle}
          />
        </div>

        <div className="my-5 border-t border-[#EEF1F5]" />

        <div className="flex flex-col">
          {notificationItems.map((item, index) => (
            <div
              key={item.key}
              className={`flex items-center justify-between gap-4 py-4 ${
                index !== notificationItems.length - 1
                  ? 'border-b border-[#F0F2F5]'
                  : ''
              }`}
            >
              <div className="min-w-0">
                <p className="text-[15px] font-medium text-[#2C2C2C]">
                  {item.title}
                </p>

                <p className="mt-1 text-[13px] text-[#989898]">
                  {item.description}
                </p>
              </div>

              <NotificationToggle
                label={item.title}
                checked={draft[item.key]}
                onChange={(enabled) => handleOptionToggle(item.key, enabled)}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3 border-t border-[#EEF1F5] pt-5">
          <button
            type="button"
            onClick={handleCancel}
            disabled={!isDirty || isPending}
            className="flex-1 cursor-pointer rounded-xl bg-[#D9DEE7] py-3 text-[13px] font-medium text-[#2C2C2C] transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            취소
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || isPending}
            className="flex-1 cursor-pointer rounded-xl bg-[#5E92F0] py-3 text-[13px] font-medium text-white transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#B8C9E8]"
          >
            완료
          </button>
        </div>
      </div>
    </section>
  );
}

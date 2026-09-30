'use client';

import { useEffect, useRef, useState } from 'react';
import { BellRing } from 'lucide-react';

import {
  useNotificationOptions,
  useUpdateNotificationOptions,
} from '@moimi/core/hooks/useNotificationOptionQuery';
import { notificationItems } from '@moimi/core/constants/notificationOption';
import type {
  NotificationOptionRequest,
  NotificationSettingsProps,
  NotificationToggleProps,
} from '@moimi/core/types/notificationOption';
import { useAuth } from '@/hooks/useAuth';
import { useFcm } from '@/hooks/useFcm';
import {
  hasEnabledNotifications,
  pauseAutomaticFcmSync,
  isNotificationSetupPending,
  clearNotificationSetupPending,
} from '@/lib/fcmLifecycle';

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
  onDirtyChange,
}: NotificationSettingsProps) {
  const {
    data: notificationOptions,
    isLoading,
    isError,
  } = useNotificationOptions();

  const { mutateAsync: updateNotificationOptions, isPending } =
    useUpdateNotificationOptions();

  const { user } = useAuth();
  const { syncFcmToken, requestFcmPermission } = useFcm();

  const [draft, setDraft] = useState<NotificationOptionRequest | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);

  const isBusy = isPending || isSaving;
  const needsInitialSetup = user
    ? isNotificationSetupPending(user.userId)
    : false;

  const serverOptions: NotificationOptionRequest | null = notificationOptions
    ? {
        noticeEnabled: notificationOptions.noticeEnabled,
        inviteEnabled: notificationOptions.inviteEnabled,
        applicationEnabled: notificationOptions.applicationEnabled,
        calendarEnabled: notificationOptions.calendarEnabled,
        chatEnabled: notificationOptions.chatEnabled,
      }
    : null;

  const currentOptions = draft ?? serverOptions;

  // 스위치 표시는 모든 항목이 켜져 있을 때 ON.
  const allEnabled =
    currentOptions !== null &&
    currentOptions.noticeEnabled &&
    currentOptions.inviteEnabled &&
    currentOptions.applicationEnabled &&
    currentOptions.calendarEnabled &&
    currentOptions.chatEnabled;

  const isDirty =
    draft !== null &&
    serverOptions !== null &&
    (draft.noticeEnabled !== serverOptions.noticeEnabled ||
      draft.inviteEnabled !== serverOptions.inviteEnabled ||
      draft.applicationEnabled !== serverOptions.applicationEnabled ||
      draft.calendarEnabled !== serverOptions.calendarEnabled ||
      draft.chatEnabled !== serverOptions.chatEnabled);

  useEffect(() => {
    onDirtyChange?.(isDirty || isSaving);
  }, [isDirty, isSaving, onDirtyChange]);

  const handleAllToggle = (enabled: boolean) => {
    if (savingRef.current) return;

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
    if (!currentOptions || savingRef.current) return;

    setDraft({
      ...currentOptions,
      [key]: enabled,
    });
  };

  const handleCancel = () => {
    if (!savingRef.current) {
      setDraft(null);
    }
  };

  const handleSave = async () => {
    if (
      !currentOptions ||
      (!isDirty && !needsInitialSetup) ||
      isBusy ||
      savingRef.current ||
      !user
    ) {
      return;
    }

    const nextOptions = { ...currentOptions };
    const accessToken = localStorage.getItem('accessToken');

    const resume = pauseAutomaticFcmSync();

    savingRef.current = true;
    setIsSaving(true);

    try {
      // 권한 요청은 클릭 직후, FCM 등록은 저장 성공 후.
      if (hasEnabledNotifications(nextOptions)) {
        await requestFcmPermission();
      }

      if (localStorage.getItem('accessToken') !== accessToken) {
        return;
      }

      try {
        await updateNotificationOptions(nextOptions);
      } catch {
        showErrorMessage('알림 설정 저장에 실패했습니다');
        return;
      }

      if (localStorage.getItem('accessToken') !== accessToken) {
        return;
      }

      setDraft(null);
      clearNotificationSetupPending(user.userId);

      try {
        const result = await syncFcmToken(user.userId);

        if (result.status === 'denied') {
          showErrorMessage(
            '설정은 저장됐어요. 브라우저 사이트 설정에서 알림을 허용해주세요.'
          );
        } else if (result.status === 'default') {
          showErrorMessage(
            '설정은 저장됐어요. 브라우저 알림 권한은 아직 허용되지 않았어요.'
          );
        } else if (result.status === 'unsupported') {
          showErrorMessage(
            '설정은 저장됐지만 이 브라우저에서는 푸시 알림을 사용할 수 없어요.'
          );
        } else if (result.status === 'disabled' && result.cleanupFailed) {
          showErrorMessage(
            '설정은 저장됐지만 기기 알림 삭제 일부가 실패했어요. 재접속하면 다시 시도해요.'
          );
        }
      } catch {
        showErrorMessage(
          '설정은 저장됐지만 기기 알림 반영에 실패했어요. 재접속하면 다시 시도해요.'
        );
      }
    } catch {
      showErrorMessage(
        '브라우저 알림 권한을 확인하지 못했습니다. 다시 시도해주세요.'
      );
    } finally {
      resume();
      savingRef.current = false;
      setIsSaving(false);
    }
  };

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

  if (isLoading || !currentOptions) {
    return (
      <section>
        <div className="mb-4">
          <h3 className="text-[18px] font-bold text-[#2C2C2C]">알림 설정</h3>
          <p className="text-[14px] leading-6 text-[#989898]">
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

  return (
    <section className="mb-6">
      <div className="mb-4">
        <h3 className="text-[18px] font-bold text-[#2C2C2C]">알림 설정</h3>
        <p className="text-[14px] leading-6 text-[#989898]">
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
            disabled={isBusy}
            onChange={handleAllToggle}
          />
        </div>

        <div className="mt-5 border-t border-[#EEF1F5]" />

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
                checked={currentOptions[item.key]}
                disabled={isBusy}
                onChange={(enabled) => handleOptionToggle(item.key, enabled)}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 border-t border-[#EEF1F5] pt-5">
          <button
            type="button"
            onClick={handleCancel}
            disabled={!isDirty || isBusy}
            className="flex-1 cursor-pointer rounded-xl border border-[#D6DDE5] bg-[#F6F8FA] py-3 text-[14px] font-semibold text-[#2C2C2C] transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            취소
          </button>

          <button
            type="button"
            onClick={() => {
              void handleSave();
            }}
            disabled={(!isDirty && !needsInitialSetup) || isBusy}
            className="flex-1 cursor-pointer rounded-xl bg-[#5E92F0] py-3 text-[14px] font-semibold text-white transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#B8C9E8]"
          >
            {isSaving ? '저장 중...' : '완료'}
          </button>
        </div>
      </div>
    </section>
  );
}

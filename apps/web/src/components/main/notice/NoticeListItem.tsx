'use client';

import { useRouter } from 'next/navigation';
import { formatDate } from '@/utils/date/formatDate';
import { getTeamRoleLabel } from '@/utils/teamRole';
import type { TeamNoticeSummary } from '@moimi/core/types/notice';

type NoticeListItemProps = {
  notice: TeamNoticeSummary;
  size: 'sm' | 'lg';
};

export default function NoticeListItem({ notice, size }: NoticeListItemProps) {
  const router = useRouter();
  const isLg = size === 'lg';

  return (
    <button
      type="button"
      onClick={() =>
        router.push(
          `/team/${notice.teamId}/notice/${notice.noticeId}?from=home`
        )
      }
      className={`z-50 border-b-[0.5px] border-[#D6DDE5] text-left last:border-b-0 active:scale-[0.99] ${
        isLg ? 'py-4' : 'py-3'
      }`}
    >
      <h3
        className={`truncate font-semibold text-[#2C2C2C] ${
          isLg ? 'text-[17px]' : 'text-[15px]'
        }`}
      >
        [ {notice.teamName} ] {notice.title}
      </h3>

      <p
        className={`truncate text-[#989898] ${
          isLg ? 'mt-1.5 text-xs' : 'mt-0.5 text-[11px]'
        }`}
      >
        {notice.authorName} · {getTeamRoleLabel(notice.teamRole)} ·{' '}
        {formatDate(notice.createdAt)}
      </p>
    </button>
  );
}

'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  statusTextColorMap,
  statusBorderColorMap,
  categoryMap,
  categoryBorderColorMap,
  categoryColorMap,
} from '@/constants/contentCard';
import { darkenColor } from '@/utils/color/darkenColor';

interface BaseCardProps {
  category: string;
  title: string;
  content: string;
  cardStatus: CardStatus;
  path?: string;
}

interface RecruitmentCardProps extends BaseCardProps {
  cardType: 'recruitment';
  startAt: string;
  endAt: string;
  dDay: string;
}

interface InfoPostCardProps extends BaseCardProps {
  cardType: 'infoPost';
  createdAt: string;
}

interface ApplicationCardProps extends BaseCardProps {
  cardType: 'application';
  createdAt: string;
}

interface NoticeCardProps extends BaseCardProps {
  cardType: 'notice';
  createdAt: string;
  updatedAt?: string;
}

export const cardStatusMap = {
  OPEN: '모집중',
  CLOSED: '모집마감',
  WAITING: '대기중',
  READ: '읽음',
  UNREAD: '안읽음',
  ACCEPTED: '수락됨',
  DECLINED: '거절됨',
  CANCELLED: '취소됨',
} as const;

type CardStatus = keyof typeof cardStatusMap;

type CardProps =
  | RecruitmentCardProps
  | InfoPostCardProps
  | ApplicationCardProps
  | NoticeCardProps;

export default function ContentCard(props: CardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const statusLabel = cardStatusMap[props.cardStatus];

  return (
    <main>
      {/* 리스트 */}
      <div
        className="cursor-pointer rounded-2xl border-l-15 bg-white p-6"
        style={{ borderColor: categoryColorMap[props.category] }}
        onClick={() => router.push(`${props.path}`)}
      >
        <div className="flex items-center gap-2">
          <span
            className="shrink-0 truncate rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{
              backgroundColor: categoryColorMap[props.category],
              color: darkenColor(categoryColorMap[props.category], 140),
            }}
          >
            {categoryMap[props.category]}
          </span>

          <h2 className="truncate text-lg font-bold text-[#2C2C2C]">
            {props.title}
          </h2>
        </div>

        <p
          className={`mt-2 text-sm ${
            props.content ? 'text-[#2C2C2C]' : 'text-[#B0B0B0]'
          }`}
        >
          {props.content || '연결된 정보글이 없습니다'}
        </p>

        <div className="mt-6 flex items-center justify-between">
          {props.cardType === 'recruitment' && (
            <div className="flex items-center gap-2">
              <p className="text-[13px] text-[#989898]">
                {props.startAt} ~ {props.endAt}
              </p>
              <span className="text-[13px] font-medium text-[#5E92F0]">
                {props.dDay}
              </span>
            </div>
          )}
          {props.cardType === 'infoPost' && (
            <div className="flex items-center gap-2">
              <p className="text-[13px] text-[#989898]">
                작성일 {props.createdAt}
              </p>
            </div>
          )}
          {props.cardType === 'application' && (
            <div className="flex items-center gap-2">
              <p className="text-[13px] text-[#989898]">
                작성일 {props.createdAt}
              </p>
            </div>
          )}
          {props.cardType === 'notice' && (
            <div className="flex items-center gap-2">
              <p className="text-[13px] text-[#989898]">
                작성일 {props.createdAt}
                {props.updatedAt && `\t 수정일 ${props.updatedAt}`}
              </p>
            </div>
          )}
          {props.cardStatus === 'WAITING' ? (
            <div className="relative shrink-0">
              <span
                className={`absolute right-0 bottom-full mb-2 rounded-full px-3 py-1 text-[13px] font-medium whitespace-nowrap`}
                style={{
                  backgroundColor: statusBorderColorMap[props.cardStatus],
                  color: statusTextColorMap[props.cardStatus],
                }}
              >
                {cardStatusMap[props.cardStatus]}
              </span>
              <span
                className="inline-flex items-center rounded-full bg-[#EEF1F5] px-3 py-1 text-[13px] font-medium text-[#646B75]"
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                신청취소
              </span>
            </div>
          ) : statusLabel ? (
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-[13px] font-medium`}
              style={{
                backgroundColor: statusBorderColorMap[props.cardStatus],
                color: statusTextColorMap[props.cardStatus],
              }}
            >
              {statusLabel}
            </span>
          ) : (
            ''
          )}
        </div>
      </div>
    </main>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { darkenColor } from '@/utils/color/darkenColor';
import {
  statusTextColorMap,
  statusBorderColorMap,
  categoryMap,
  categoryColorMap,
} from '@moimi/core/constants/contentCard';

interface BaseCardProps {
  category: string;
  title: string;
  content?: string;
  cardStatus?: CardStatus;
  path?: string;
  onClick?: () => void;
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
  thumbnailUrl?: string | null;
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

interface VoteCardProps extends BaseCardProps {
  cardType: 'vote';
  createdAt: string;
  completedCount: number;
  totalCount: number;
  dateCount: number;
  time: string;
}

interface InvitationCardProps extends BaseCardProps {
  cardType: 'invitation';
  createdAt: string;
  direction: 'RECEIVED' | 'SENT';
  personName: string;
  isPending?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
}

export const cardStatusMap = {
  ONGOING: '진행중',
  ENDED: '종료',

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
  | NoticeCardProps
  | VoteCardProps
  | InvitationCardProps;

export default function ContentCard(props: CardProps) {
  const router = useRouter();

  const statusLabel = props.cardStatus
    ? cardStatusMap[props.cardStatus]
    : undefined;

  const handleCardClick = () => {
    if (props.onClick) {
      props.onClick();
      return;
    }

    if (props.path) {
      router.push(props.path);
    }
  };

  return (
    <article className="h-full">
      <div
        className="relative flex h-full min-h-[154px] cursor-pointer flex-col rounded-2xl border-l-15 bg-white p-6"
        style={{
          borderColor: categoryColorMap[props.category] ?? categoryColorMap.ETC,
        }}
        onClick={handleCardClick}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="shrink-0 truncate rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{
              backgroundColor:
                categoryColorMap[props.category] ?? categoryColorMap.ETC,
              color: darkenColor(
                categoryColorMap[props.category] ?? categoryColorMap.ETC,
                140
              ),
            }}
          >
            {categoryMap[props.category] ?? '기타'}
          </span>

          <h2 className="min-w-0 truncate text-lg font-bold text-[#2C2C2C]">
            {props.title}
          </h2>
        </div>

        {(props.content || props.cardType === 'recruitment') && (
          <p
            className={`mt-2 min-h-5 w-full truncate text-sm font-medium ${
              props.content ? 'text-[#2C2C2C]' : 'text-[#B0B0B0]'
            }`}
          >
            {props.content || '연결된 정보글이 없습니다'}
          </p>
        )}

        <div className="mt-auto pt-4 pr-32">
          {props.cardType === 'recruitment' && (
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-[13px] text-[#989898]">
                기간 {props.startAt} ~ {props.endAt}
              </p>

              <span className="shrink-0 text-[13px] font-medium text-[#5E92F0]">
                {props.dDay}
              </span>
            </div>
          )}

          {props.cardType === 'infoPost' && (
            <p className="text-[13px] text-[#989898]">
              작성일 {props.createdAt}
            </p>
          )}

          {props.cardType === 'application' && (
            <p className="text-[13px] text-[#989898]">
              작성일 {props.createdAt}
            </p>
          )}

          {props.cardType === 'notice' && (
            <p className="text-[13px] text-[#989898]">
              작성일 {props.createdAt}
              {props.updatedAt && ` · 수정일 ${props.updatedAt}`}
            </p>
          )}

          {props.cardType === 'vote' && (
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex items-center gap-2">
                <p className="text-[13px] text-[#989898]">
                  생성일 {props.createdAt}
                </p>

                <span className="text-[13px] text-[#CBD2DA]">·</span>

                <p className="text-[13px] text-[#989898]">
                  후보 날짜 {props.dateCount}개
                </p>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-[13px] text-[#989898]">
                  참여 {props.completedCount}/{props.totalCount}명
                </p>

                <span className="text-[13px] text-[#CBD2DA]">·</span>

                <p className="text-[13px] text-[#989898]">{props.time}</p>
              </div>
            </div>
          )}
          {props.cardType === 'infoPost' && props.thumbnailUrl && (
            <div className="absolute top-1/2 right-6 h-[110px] w-[130px] -translate-y-1/2 overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={props.thumbnailUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          )}
          {props.cardType === 'invitation' && (
            <div className="flex min-w-0 flex-col gap-1">
              <p className="truncate text-[13px] text-[#989898]">
                {props.direction === 'RECEIVED'
                  ? `보낸 사람 ${props.personName}`
                  : `받는 사람 ${props.personName}`}
              </p>

              <p className="text-[13px] text-[#989898]">
                초대일 {props.createdAt}
              </p>
            </div>
          )}
          <div className="absolute right-6 bottom-6 flex h-[60px] items-end justify-end">
            {props.cardType === 'invitation' &&
            props.direction === 'RECEIVED' &&
            props.cardStatus === 'WAITING' ? (
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span
                  className="rounded-full px-3 py-1 text-[13px] font-medium"
                  style={{
                    backgroundColor: statusBorderColorMap[props.cardStatus],
                    color: statusTextColorMap[props.cardStatus],
                  }}
                >
                  {cardStatusMap[props.cardStatus]}
                </span>

                <div className="flex gap-2">
                  <span
                    className="inline-flex items-center rounded-full bg-[#DDF7E5] px-3 py-1 text-[13px] font-medium text-[#2E7845] disabled:bg-[#B0B8C1]"
                    onClick={(event) => {
                      event.stopPropagation();
                      props.onAccept?.();
                    }}
                  >
                    수락
                  </span>

                  <span
                    className="inline-flex items-center rounded-full bg-[#EEF1F5] px-3 py-1 text-[13px] font-medium text-[#646B75]"
                    onClick={(event) => {
                      event.stopPropagation();
                      props.onReject?.();
                    }}
                  >
                    거절
                  </span>
                </div>
              </div>
            ) : props.cardType === 'application' &&
              props.cardStatus === 'WAITING' ? (
              <div className="relative shrink-0">
                <span
                  className="absolute right-0 bottom-full mb-2 rounded-full px-3 py-1 text-[13px] font-medium whitespace-nowrap"
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
            ) : props.cardStatus && statusLabel ? (
              <span
                className="inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[13px] font-medium"
                style={{
                  backgroundColor: statusBorderColorMap[props.cardStatus],
                  color: statusTextColorMap[props.cardStatus],
                }}
              >
                {statusLabel}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

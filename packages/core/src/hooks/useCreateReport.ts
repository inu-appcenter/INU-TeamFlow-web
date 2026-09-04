import { useMutation } from '@tanstack/react-query';
import { reportRecruitment, reportInfoPost, reportUser } from '@moimi/core/api/report';
import type { ReportRequest } from '@moimi/core/types/report';

export type ReportTarget =
  | { type: 'RECRUITMENT_POST'; id: number }
  | { type: 'INFO_POST'; id: number }
  | { type: 'USER'; id: number };

export const useCreateReport = () =>
  useMutation({
    mutationFn: ({
      target,
      body,
    }: {
      target: ReportTarget;
      body: ReportRequest;
    }) => {
      if (target.type === 'RECRUITMENT_POST')
        return reportRecruitment(target.id, body);
      if (target.type === 'INFO_POST') return reportInfoPost(target.id, body);
      return reportUser(target.id, body);
    },
  });

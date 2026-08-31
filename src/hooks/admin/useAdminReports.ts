import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminReports,
  getAdminReportDetail,
  handleAdminReport,
} from '@/api/admin';
import type { ReportHandleRequest, ReportStatus } from '@/types/report';

export const useAdminReports = (params: {
  page: number;
  size?: number;
  status?: ReportStatus;
}) =>
  useQuery({
    queryKey: ['admin', 'reports', params],
    queryFn: () => getAdminReports(params),
  });

export const useAdminReportDetail = (reportId: number | null) =>
  useQuery({
    queryKey: ['admin', 'reports', 'detail', reportId],
    queryFn: () => getAdminReportDetail(reportId as number),
    enabled: reportId !== null,
  });

export const useHandleAdminReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reportId,
      body,
    }: {
      reportId: number;
      body: ReportHandleRequest;
    }) => handleAdminReport(reportId, body),
    onSuccess: (_data, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'reports', 'detail', reportId],
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
};

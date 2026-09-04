import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getRecruitments,
  getMyRecruitments,
  getRecruitmentDetail,
  createRecruitment,
  updateRecruitment,
  deleteRecruitment,
  applyRecruitment,
  getRecruitmentApplications,
  getMyApplications,
  getApplicationDetail,
  updateApplicationStatus,
} from '@moimi/core/api/recruitment';
import type {
  RecruitmentCreateRequest,
  RecruitmentUpdateRequest,
  ApplicationCreateRequest,
  ApplicationStatusUpdateRequest,
} from '@moimi/core/types/recruitment';

export const recruitmentKeys = {
  all: () => ['recruitments'] as const,
  detail: (id: number) => ['recruitments', id] as const,
  applications: (id: number) => ['recruitments', id, 'applications'] as const,
  myRecruitments: () => ['recruitments', 'me'] as const,
  myApplications: () => ['applications', 'me'] as const,
  applicationDetail: (id: number) => ['applications', id] as const,
};

export const useRecruitments = (page = 0, size = 10) =>
  useQuery({
    queryKey: [...recruitmentKeys.all(), page, size],
    queryFn: () => getRecruitments(page, size),
  });

export const useMyRecruitments = (page = 0, size = 10) =>
  useQuery({
    queryKey: [...recruitmentKeys.myRecruitments(), page, size],
    queryFn: () => getMyRecruitments(page, size),
  });

export const useRecruitmentDetail = (recruitmentId: number) =>
  useQuery({
    queryKey: recruitmentKeys.detail(recruitmentId),
    queryFn: () => getRecruitmentDetail(recruitmentId),
  });

export const useRecruitmentApplications = (
  recruitmentId: number,
  page = 0,
  size = 10
) =>
  useQuery({
    queryKey: [...recruitmentKeys.applications(recruitmentId), page, size],
    queryFn: () => getRecruitmentApplications(recruitmentId, page, size),
  });

export const useMyApplications = (page = 0, size = 10) =>
  useQuery({
    queryKey: [...recruitmentKeys.myApplications(), page, size],
    queryFn: () => getMyApplications(page, size),
  });

export const useApplicationDetail = (applicationId: number) =>
  useQuery({
    queryKey: recruitmentKeys.applicationDetail(applicationId),
    queryFn: () => getApplicationDetail(applicationId),
  });

export const useCreateRecruitment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: RecruitmentCreateRequest) => createRecruitment(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitments'] });
    },
  });
};

export const useUpdateRecruitment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      recruitmentId,
      body,
    }: {
      recruitmentId: number;
      body: RecruitmentUpdateRequest;
    }) => updateRecruitment(recruitmentId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitments'] });
    },
  });
};

export const useDeleteRecruitment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recruitmentId: number) => deleteRecruitment(recruitmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitments'] });
    },
  });
};

export const useApplyRecruitment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      recruitmentId,
      body,
    }: {
      recruitmentId: number;
      body: ApplicationCreateRequest;
    }) => applyRecruitment(recruitmentId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitments'] });
    },
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      applicationId,
      body,
    }: {
      applicationId: number;
      body: ApplicationStatusUpdateRequest;
    }) => updateApplicationStatus(applicationId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['recruitments'] });
    },
  });
};

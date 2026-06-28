import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMyEvents,
  createMyEvent,
  updateMyEvent,
  deleteMyEvent,
  getTeamEvents,
  createTeamEvent,
  updateTeamEvent,
  deleteTeamEvent,
} from '@/api/event';
import type { MyEventCreateRequest, MyEventUpdateRequest } from '@/types/event';
import type {
  TeamEventCreateRequest,
  TeamEventUpdateRequest,
} from '@/types/event';

export const eventKeys = {
  myEvents: (year: number, month: number) =>
    ['events', 'my', year, month] as const,
};

export const useMyEvents = (year: number, month: number) =>
  useQuery({
    queryKey: eventKeys.myEvents(year, month),
    queryFn: () => getMyEvents(year, month),
  });

export const useCreateMyEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: MyEventCreateRequest) => createMyEvent(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useUpdateMyEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      body,
    }: {
      eventId: number;
      body: MyEventUpdateRequest;
    }) => updateMyEvent(eventId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useDeleteMyEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      scope,
      occurence,
    }: {
      eventId: number;
      scope: string;
      occurence: string;
    }) => deleteMyEvent(eventId, scope, occurence),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useTeamEvents = (teamId: number, year: number, month: number) =>
  useQuery({
    queryKey: ['events', 'team', teamId, year, month],
    queryFn: () => getTeamEvents(teamId, year, month),
  });

export const useCreateTeamEvent = (teamId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: TeamEventCreateRequest) => createTeamEvent(teamId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useUpdateTeamEvent = (teamId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      body,
    }: {
      eventId: number;
      body: TeamEventUpdateRequest;
    }) => updateTeamEvent(teamId, eventId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useDeleteTeamEvent = (teamId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      scope,
      occurence,
    }: {
      eventId: number;
      scope: string;
      occurence: string;
    }) => deleteTeamEvent(teamId, eventId, scope, occurence),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

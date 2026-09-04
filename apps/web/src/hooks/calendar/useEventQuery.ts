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
import type {
  MyEventCreateRequest,
  MyEventUpdateRequest,
  TeamEventCreateRequest,
  TeamEventUpdateRequest,
  EventListResponse,
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

    onMutate: async ({ eventId, body }) => {
      await queryClient.cancelQueries({ queryKey: ['events'] });

      const previousData = queryClient.getQueriesData<EventListResponse[]>({
        queryKey: ['events'],
      });

      queryClient.setQueriesData<EventListResponse[]>(
        { queryKey: ['events', 'my'] },
        (old) => {
          if (!old) return old;

          return old.map((s) => {
            const sameEvent = s.eventId === eventId;
            const sameOccurrence =
              (s.occurrenceAt ?? s.startAt) ===
              (body.occurrenceAt ?? body.startAt);

            if (sameEvent && sameOccurrence) {
              return { ...s, isFinished: body.isFinished };
            }
            return s;
          });
        }
      );

      return { previousData };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    onSettled: () => {
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
      occurrence,
    }: {
      eventId: number;
      scope: string;
      occurrence: string;
    }) => deleteMyEvent(eventId, scope, occurrence),
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

    onMutate: async ({ eventId, body }) => {
      await queryClient.cancelQueries({ queryKey: ['events', 'team', teamId] });

      const previousData = queryClient.getQueriesData<EventListResponse[]>({
        queryKey: ['events', 'team', teamId],
      });

      queryClient.setQueriesData<EventListResponse[]>(
        { queryKey: ['events', 'team', teamId] },
        (old) => {
          if (!old) return old;

          return old.map((s) => {
            const sameEvent = s.eventId === eventId;
            const sameOccurrence =
              (s.occurrenceAt ?? s.startAt) ===
              (body.occurrenceAt ?? body.startAt);

            if (sameEvent && sameOccurrence) {
              return { ...s, isFinished: body.isFinished };
            }
            return s;
          });
        }
      );

      return { previousData };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    onSettled: () => {
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
      occurrence,
    }: {
      eventId: number;
      scope: string;
      occurrence: string;
    }) => deleteTeamEvent(teamId, eventId, scope, occurrence),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

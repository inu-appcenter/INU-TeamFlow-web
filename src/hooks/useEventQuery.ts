import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyEvents,
  createMyEvent,
  updateMyEvent,
  deleteMyEvent,
} from "@/api/event";
import type {
  MyEventCreateRequest,
  MyEventUpdateRequest,
} from "@/types/event";

export const eventKeys = {
  myEvents: (year: number, month: number) =>
    ["events", "my", year, month] as const,
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
      queryClient.invalidateQueries({ queryKey: ["events"] });
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
      queryClient.invalidateQueries({ queryKey: ["events"] });
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
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
import {
  useCreateMyEvent,
  useUpdateMyEvent,
  useDeleteMyEvent,
} from '@/hooks/useEventQuery';
import type { Schedule, RecurrenceEditScope } from '@/types/event';
import type { CreateEventRequest } from '@/components/calendar/CalendarAddModal';

export function useCalendarEventActions() {
  const { mutateAsync: createEvent } = useCreateMyEvent();
  const { mutateAsync: updateEvent } = useUpdateMyEvent();
  const { mutateAsync: deleteEvent } = useDeleteMyEvent();

  const handleAddSchedule = async (request: CreateEventRequest) => {
    try {
      await createEvent({
        title: request.title,
        description: request.description,
        startAt: request.startAt,
        endAt: request.endAt,
        isAllDay: request.isAllDay,
        color: request.color,
        ...(request.recurrence && { recurrence: request.recurrence }),
      });
    } catch (error) {
      console.error('일정 생성 실패', error);
    }
  };

  const handleEditSchedule = async (
    updated: Schedule,
    scope: RecurrenceEditScope
  ) => {
    try {
      await updateEvent({
        eventId: updated.eventId,
        body: {
          title: updated.title,
          description: updated.description,
          startAt: updated.startAt,
          endAt: updated.endAt,
          isAllDay: updated.isAllDay,
          color: updated.color,
          isFinished: updated.isFinished,
          occurrenceAt: updated.occurrenceAt ?? updated.startAt,
          recurrenceEditScope: scope,
          ...(updated.recurrence && {
            recurrence: updated.recurrence,
          }),
        },
      });
    } catch (error) {
      console.error('일정 수정 실패', error);
    }
  };

  const handleDeleteSchedule = async (
    eventId: number,
    scope: RecurrenceEditScope,
    occurrence: string
  ) => {
    try {
      await deleteEvent({ eventId, scope, occurrence });
    } catch (error) {
      console.error('일정 삭제 실패', error);
    }
  };

  const handleToggleSchedule = async (target: Schedule) => {
    try {
      await updateEvent({
        eventId: target.eventId,
        body: {
          title: target.title,
          description: target.description,
          startAt: target.startAt,
          endAt: target.endAt,
          isAllDay: target.isAllDay,
          color: target.color,
          isFinished: !target.isFinished,
          occurrenceAt: target.occurrenceAt ?? target.startAt,
          recurrenceEditScope: 'THIS_INSTANCE',
          ...(target.recurrence && { recurrence: target.recurrence }),
        },
      });
    } catch (error) {
      console.error('일정 완료 토글 실패', error);
    }
  };

  return {
    handleAddSchedule,
    handleEditSchedule,
    handleDeleteSchedule,
    handleToggleSchedule,
  };
}

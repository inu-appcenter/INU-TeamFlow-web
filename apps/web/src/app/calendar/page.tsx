'use client';

import BottomNav from '@/components/common/bottom-nav/BottomNav';
import CalendarAddModal from '@/components/calendar/CalendarAddModal';
import CalendarEditModal from '@/components/calendar/CalendarEditModal';
import type { Schedule, RecurrenceEditScope } from '@/types/event';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useCalendarEventActions } from '@/hooks/calendar/useCalendarEventActions';
import { useCalendarGrid } from '@/hooks/calendar/useCalendarGrid';
import { useMonthSchedules } from '@/hooks/calendar/useMonthSchedules';
import { formatDateKey, isScheduleOnDate } from '@/utils/date/calendar';
import ScheduleDetailPanel from '@/components/calendar/ScheduleDetailPanel';
import MonthGridWithEvents from '@/components/calendar/MonthGridWithEvents';

const days = ['일', '월', '화', '수', '목', '금', '토'];

export default function CalendarPage() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [editSchedule, setEditSchedule] = useState<Schedule | null>(null);
  const [selectedDate, setSelectedDate] = useState(today);
  const { errorMessage, showErrorMessage } = useErrorToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const {
    handleAddSchedule,
    handleEditSchedule: editSchedule_,
    handleDeleteSchedule: deleteSchedule_,
    handleToggleSchedule,
  } = useCalendarEventActions();
  const schedules = useMonthSchedules(year, month);
  const calendarDates = useCalendarGrid(year, month);
  const weeks = Array.from(
    { length: calendarDates.length / 7 },
    (_, weekIndex) => calendarDates.slice(weekIndex * 7, weekIndex * 7 + 7)
  );
  const selectedDateKey = formatDateKey(selectedDate);
  const selectedSchedules = schedules.filter((schedule) =>
    isScheduleOnDate(schedule, selectedDateKey)
  );
  const dayLabel = days[selectedDate.getDay()];
  const handlePrevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    setCurrentDate(prev);
    setSelectedDate(prev);
  };
  const handleNextMonth = () => {
    const next = new Date(year, month + 1, 1);
    setCurrentDate(next);
    setSelectedDate(next);
  };
  const handleEditSchedule = async (
    updated: Schedule,
    scope: RecurrenceEditScope
  ) => {
    await editSchedule_(updated, scope);
    setEditSchedule(null);
  };
  const handleDeleteSchedule = async (
    eventId: number,
    scope: RecurrenceEditScope
  ) => {
    await deleteSchedule_(
      eventId,
      scope,
      editSchedule?.occurrenceAt ?? editSchedule?.startAt ?? ''
    );
    setEditSchedule(null);
  };

  return (
    <main className="h-screen overflow-hidden px-3 py-6 pt-6 pb-28 sm:px-6 sm:pt-12 sm:pb-34">
      <section className="z-100 mx-auto flex h-full max-w-[1180px] flex-col">
        <div className="mb-2 flex items-center justify-between px-3">
          <h1 className="text-[28px] font-bold text-[#2C2C2C]">
            {month + 1}월
          </h1>

          <div className="flex gap-2">
            <button
              onClick={handlePrevMonth}
              className="z-100 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#2c2c2c]/40"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={handleNextMonth}
              className="relative z-100 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#2c2c2c]/40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        {errorMessage && (
          <div className="animate-modal-pop absolute top-32 left-1/2 z-300 -translate-x-1/2 rounded-full bg-[#2C2C2C] px-5 py-2 text-sm font-semibold whitespace-nowrap text-white">
            {errorMessage}
          </div>
        )}

        <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
          <section className="flex h-full flex-1 flex-col overflow-hidden rounded-2xl border-[0.8px] border-[#D6DDE5] bg-white py-2 pt-3 pl-2">
            <div className="grid shrink-0 grid-cols-7 pr-2.5 text-center text-[15px] text-[#D6DDE5]">
              {days.map((day) => (
                <div key={day} className="mb-2">
                  {day}
                </div>
              ))}
            </div>

            <div
              className="thin-scrollbar min-h-0 flex-1 overflow-y-auto"
              style={{
                scrollbarGutter: 'stable',
              }}
            >
              <MonthGridWithEvents
                year={year}
                month={month}
                weeks={weeks}
                schedules={schedules}
                selectedDate={selectedDate}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  setIsMobileDetailOpen(true);
                }}
                rowMinHeight={90}
                selectedCellClassName="rounded-2xl bg-[#FAFAFA]"
                cellTextSize="text-[14px]"
              />
            </div>
          </section>

          <aside className="hidden h-full w-[365px] flex-col rounded-2xl border-[0.8] border-[#D6DDE5] bg-white px-6 py-6 lg:flex">
            <ScheduleDetailPanel
              selectedDate={selectedDate}
              dayLabel={dayLabel}
              schedules={selectedSchedules}
              onClickItem={(schedule) => {
                if (schedule.teamId) {
                  showErrorMessage('팀 일정은 수정할 수 없습니다');
                  return;
                }
                setEditSchedule(schedule);
              }}
              onToggle={(schedule) => {
                if (schedule.teamId) {
                  showErrorMessage('팀 일정은 수정할 수 없습니다');
                  return;
                }
                handleToggleSchedule(schedule);
              }}
              onAddClick={() => setIsAddOpen(true)}
            />
          </aside>

          {isMobileDetailOpen && (
            <div
              onClick={() => setIsMobileDetailOpen(false)}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 px-5 transition-opacity duration-200 lg:hidden"
            >
              <aside
                onClick={(e) => e.stopPropagation()}
                className="animate-modal-pop flex h-[70vh] w-full max-w-[365px] flex-col rounded-2xl border-[0.5px] border-[#EDF1F5] bg-white px-6 py-6"
              >
                <ScheduleDetailPanel
                  selectedDate={selectedDate}
                  dayLabel={dayLabel}
                  schedules={selectedSchedules}
                  titleClassName="mb-2"
                  onClickItem={(schedule) => {
                    if (schedule.teamId) {
                      showErrorMessage('팀 일정은 수정할 수 없습니다');
                      return;
                    }
                    setEditSchedule(schedule);
                  }}
                  onToggle={(schedule) => {
                    if (schedule.teamId) {
                      showErrorMessage('팀 일정은 수정할 수 없습니다');
                      return;
                    }
                    handleToggleSchedule(schedule);
                  }}
                  onAddClick={() => {
                    setIsMobileDetailOpen(false);
                    setIsAddOpen(true);
                  }}
                />
              </aside>
            </div>
          )}
        </div>
      </section>

      <CalendarAddModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddSchedule}
        selectedDate={selectedDate}
      />

      <CalendarEditModal
        key={`${editSchedule?.eventId}-${editSchedule?.occurrenceAt ?? ''}`}
        open={editSchedule !== null}
        schedule={editSchedule}
        onClose={() => setEditSchedule(null)}
        onEdit={handleEditSchedule}
        onDelete={handleDeleteSchedule}
      />

      <BottomNav />
    </main>
  );
}

import { useCallback, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateClickArg, EventClickArg, EventInput } from '@fullcalendar/core';
import { api } from '../api/client';
import type { EventDto } from '../types';

interface EventCalendarProps {
  onDateClick: (dateIso: string) => void;
  onEventClick: (event: EventDto) => void;
  refreshKey: number;
}

function toCalendarEvent(evt: EventDto): EventInput {
  return {
    id: String(evt.id),
    title: evt.name,
    start: evt.startDatetime,
    end: evt.endDatetime,
    extendedProps: { eventData: evt },
  };
}

export function EventCalendar({ onDateClick, onEventClick, refreshKey }: EventCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(
    async (info: { startStr: string; endStr: string }, successCallback: (events: EventInput[]) => void, failureCallback: (err: Error) => void) => {
      try {
        setError(null);
        const events = await api.getEvents(info.startStr, info.endStr);
        successCallback(events.map(toCalendarEvent));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load events';
        setError(message);
        failureCallback(err instanceof Error ? err : new Error(message));
      }
    },
    [refreshKey],
  );

  const handleDateClick = (info: DateClickArg) => {
    onDateClick(`${info.dateStr}T12:00`);
  };

  const handleEventClick = (info: EventClickArg) => {
    const eventData = info.event.extendedProps.eventData as EventDto | undefined;
    if (eventData) onEventClick(eventData);
  };

  return (
    <div className="calendar-shell">
      {error && <div className="message message-error">{error}</div>}
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,listWeek',
        }}
        events={loadEvents}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height="auto"
      />
    </div>
  );
}

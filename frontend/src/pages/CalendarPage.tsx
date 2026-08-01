import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { EventDto, EventPayload, GameTypeTemplate } from '../types';
import { EventCalendar } from '../components/EventCalendar';
import { EventFormDialog } from '../components/EventFormDialog';
import { EventViewDialog } from '../components/EventViewDialog';

export function CalendarPage() {
  const [gameTypes, setGameTypes] = useState<GameTypeTemplate[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [initialDate, setInitialDate] = useState<string | undefined>();
  const [viewingEvent, setViewingEvent] = useState<EventDto | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventDto | null>(null);

  useEffect(() => {
    api.getGameTypes().then(setGameTypes).catch(console.error);
  }, []);

  const bumpRefresh = () => setRefreshKey((k) => k + 1);

  const handleSave = async (payload: EventPayload, eventId?: number) => {
    if (eventId) {
      await api.updateEvent(eventId, payload);
    } else {
      await api.createEvent(payload);
    }
    bumpRefresh();
  };

  const handleDelete = async (eventId: number) => {
    await api.deleteEvent(eventId);
    bumpRefresh();
  };

  const openSchedule = (date?: string) => {
    setEditingEvent(null);
    setInitialDate(date);
    setFormOpen(true);
  };

  const openEdit = (event: EventDto) => {
    setViewingEvent(null);
    setEditingEvent(event);
    setFormOpen(true);
  };

  return (
    <>
      <header>
        <h1>Trading Card Event Calendar</h1>
        <button type="button" className="btn btn-primary" onClick={() => openSchedule()}>
          Schedule Event
        </button>
      </header>

      <main>
        <EventCalendar
          refreshKey={refreshKey}
          onDateClick={(date) => openSchedule(date)}
          onEventClick={setViewingEvent}
        />
      </main>

      <EventFormDialog
        open={formOpen}
        gameTypes={gameTypes}
        initialDate={initialDate}
        editingEvent={editingEvent}
        onClose={() => {
          setFormOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      <EventViewDialog
        event={viewingEvent}
        onClose={() => setViewingEvent(null)}
        onEdit={openEdit}
      />
    </>
  );
}

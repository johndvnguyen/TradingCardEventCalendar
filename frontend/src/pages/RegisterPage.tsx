import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { EventPublicDto } from '../types';
import { formatDatetime } from '../utils/dates';
import { CalendarInviteButton } from '../components/CalendarInviteButton';

export function RegisterPage() {
  const { token } = useParams<{ token: string }>();
  const [event, setEvent] = useState<EventPublicDto | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadEvent = useCallback(async () => {
    if (!token) {
      setPageError('Missing event token. Scan the QR code or use a valid registration link.');
      return;
    }
    try {
      const data = await api.getPublicEvent(token);
      setEvent(data);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Event not found.');
    }
  }, [token]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setFormError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const result = await api.register(token, name.trim());
      setSuccess(result.message);
      await loadEvent();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed.';
      setFormError(message);
      if (message.toLowerCase().includes('full')) {
        await loadEvent();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (pageError) {
    return (
      <main className="page-card">
        <div className="message message-error">{pageError}</div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="page-card">
        <p>Loading event…</p>
      </main>
    );
  }

  const description = `${event.gameType} trading card event.`;

  return (
    <main className="page-card">
      <h2>{event.name}</h2>
      <dl className="detail-list compact">
        <dt>Game</dt>
        <dd>{event.gameType}</dd>
        <dt>Start</dt>
        <dd>{formatDatetime(event.startDatetime)}</dd>
        <dt>End</dt>
        <dd>{formatDatetime(event.endDatetime)}</dd>
        <dt>Spots left</dt>
        <dd>{event.isFull ? 'None — event is full' : String(event.spotsRemaining)}</dd>
      </dl>

      {event.isFull && (
        <div className="message message-warning">This event is full. Registration is closed.</div>
      )}

      {!event.isFull && !success && (
        <form onSubmit={handleSubmit}>
          <label htmlFor="player-name">Your name</label>
          <input
            id="player-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            autoComplete="name"
            disabled={submitting}
          />

          {formError && <div className="message message-error">{formError}</div>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            Register
          </button>
        </form>
      )}

      {success && <div className="message message-success">{success}</div>}
      {success && <div className="ics-section compact">
        <CalendarInviteButton
          title={event.name}
          description={description}
          startDatetime={event.startDatetime}
          endDatetime={event.endDatetime}
          registrationUrl={event.registrationUrl}
        />
      </div>}
      <p className="hint">
        <Link to={`/event/${token}`}>View event page</Link>
      </p>
    </main>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../api/client';
import type { EventPublicDto } from '../types';
import { buildEventDescription } from '../utils/eventDisplay';
import { CalendarInviteButton } from '../components/CalendarInviteButton';
import { EventDetailsList } from '../components/EventDetailsList';

export function EventPage() {
  const { token } = useParams<{ token: string }>();
  const [event, setEvent] = useState<EventPublicDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Missing event token.');
      return;
    }

    api
      .getPublicEvent(token)
      .then(setEvent)
      .catch((err) => setError(err instanceof Error ? err.message : 'Event not found.'));
  }, [token]);

  const copyLink = async () => {
    if (!event) return;
    await navigator.clipboard.writeText(event.registrationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <main className="page-card">
        <div className="message message-error">{error}</div>
        <Link to="/" className="btn btn-secondary">
          Back to calendar
        </Link>
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

  const description = buildEventDescription(
    event.gameType,
    event.playFormat,
    event.playerCapacity,
    event.minPlayers,
    event.showMinPlayersOnEvent,
  );

  return (
    <main className="page-card">
      <Link to="/" className="header-link">
        &larr; Calendar
      </Link>

      <h2>{event.name}</h2>
      <EventDetailsList
        event={{
          ...event,
          name: event.name,
        }}
        showRegistration
      />

      <section className="qr-section">
        <h3>Registration QR Code</h3>
        <p className="hint">Scan to open the registration form.</p>
        <div className="qrcode-wrap">
          <QRCodeSVG value={event.registrationUrl} size={200} bgColor="#1a2332" fgColor="#e8edf4" />
        </div>
        <div className="registration-link-row">
          <input type="text" readOnly value={event.registrationUrl} />
          <button type="button" className="btn btn-secondary" onClick={copyLink}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <Link to={`/register/${token}`} className="btn btn-primary">
          Open registration form
        </Link>
      </section>

      <section className="ics-section">
        <h3>Calendar invite</h3>
        <p className="hint">Download an .ics file for Google Calendar, Outlook, or Apple Calendar.</p>
        <CalendarInviteButton
          title={event.name}
          description={description}
          startDatetime={event.startDatetime}
          endDatetime={event.endDatetime}
          registrationUrl={event.registrationUrl}
        />
      </section>
    </main>
  );
}

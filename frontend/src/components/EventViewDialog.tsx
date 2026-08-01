import { Link } from 'react-router-dom';
import type { EventDto } from '../types';
import { formatDatetime } from '../utils/dates';
import { CalendarInviteButton } from './CalendarInviteButton';

interface EventViewDialogProps {
  event: EventDto | null;
  onClose: () => void;
  onEdit: (event: EventDto) => void;
}

export function EventViewDialog({ event, onClose, onEdit }: EventViewDialogProps) {
  if (!event) return null;

  const registeredText = event.isFull
    ? `${event.registrationCount} / ${event.playerCapacity} (Full)`
    : `${event.registrationCount} / ${event.playerCapacity} (${event.spotsRemaining} spots left)`;

  const description = `${event.gameType} trading card event. Capacity: ${event.playerCapacity} players.`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <dialog open className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{event.name}</h2>
        <dl className="detail-list">
          <dt>Game</dt>
          <dd>{event.gameType}</dd>
          <dt>Start</dt>
          <dd>{formatDatetime(event.startDatetime)}</dd>
          <dt>End</dt>
          <dd>{formatDatetime(event.endDatetime)}</dd>
          <dt>Registered</dt>
          <dd>{registeredText}</dd>
        </dl>

        <div className="dialog-actions-stack">
          <CalendarInviteButton
            title={event.name}
            description={description}
            startDatetime={event.startDatetime}
            endDatetime={event.endDatetime}
            registrationUrl={event.registrationUrl}
          />
          <Link to={`/event/${event.registrationToken}`} className="btn btn-primary">
            Event page &amp; QR
          </Link>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => onEdit(event)}>
            Edit
          </button>
        </div>
      </dialog>
    </div>
  );
}

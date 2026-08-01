import { Link } from 'react-router-dom';
import type { EventDto } from '../types';
import { buildEventDescription } from '../utils/eventDisplay';
import { CalendarInviteButton } from './CalendarInviteButton';
import { EventDetailsList } from './EventDetailsList';

interface EventViewDialogProps {
  event: EventDto | null;
  onClose: () => void;
  onEdit: (event: EventDto) => void;
}

export function EventViewDialog({ event, onClose, onEdit }: EventViewDialogProps) {
  if (!event) return null;

  const description = buildEventDescription(
    event.gameType,
    event.playFormat,
    event.playerCapacity,
    event.minPlayers,
    event.showMinPlayersOnEvent,
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <dialog open className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{event.name}</h2>
        <EventDetailsList
          event={{
            ...event,
            registrationCount: event.registrationCount,
            spotsRemaining: event.spotsRemaining,
            isFull: event.isFull,
          }}
          showRegistration
        />

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

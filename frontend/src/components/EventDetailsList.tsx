import type { EventDisplayInfo } from '../types';
import { formatDatetime } from '../utils/dates';
import { formatEventLabel } from '../utils/eventDisplay';

interface EventDetailsListProps {
  event: EventDisplayInfo;
  showRegistration?: boolean;
  compact?: boolean;
}

export function EventDetailsList({ event, showRegistration = false, compact = false }: EventDetailsListProps) {
  const registeredText =
    event.registrationCount !== undefined && event.playerCapacity !== undefined
      ? event.isFull
        ? `${event.registrationCount} / ${event.playerCapacity} (Full)`
        : `${event.registrationCount} / ${event.playerCapacity} (${event.spotsRemaining} spots left)`
      : null;

  const spotsText =
    event.isFull !== undefined
      ? event.isFull
        ? 'None — event is full'
        : String(event.spotsRemaining)
      : null;

  return (
    <dl className={`detail-list${compact ? ' compact' : ''}`}>
      <dt>Game</dt>
      <dd>{formatEventLabel(event.gameType, event.playFormat)}</dd>
      <dt>Start</dt>
      <dd>{formatDatetime(event.startDatetime)}</dd>
      <dt>End</dt>
      <dd>{formatDatetime(event.endDatetime)}</dd>
      {event.showMinPlayersOnEvent && (
        <>
          <dt>Minimum players</dt>
          <dd>{event.minPlayers}</dd>
        </>
      )}
      {showRegistration && registeredText !== null && (
        <>
          <dt>Registered</dt>
          <dd>{registeredText}</dd>
        </>
      )}
      {!showRegistration && spotsText !== null && (
        <>
          <dt>Spots left</dt>
          <dd>{spotsText}</dd>
        </>
      )}
    </dl>
  );
}

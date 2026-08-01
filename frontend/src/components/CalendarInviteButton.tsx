import ICalendarLink from 'react-icalendar-link';
import { slugifyFilename, toIcsDatetime } from '../utils/dates';

interface CalendarInviteButtonProps {
  title: string;
  description: string;
  startDatetime: string;
  endDatetime: string;
  registrationUrl?: string;
  className?: string;
}

export function CalendarInviteButton({
  title,
  description,
  startDatetime,
  endDatetime,
  registrationUrl,
  className = 'btn btn-secondary',
}: CalendarInviteButtonProps) {
  const fullDescription = registrationUrl
    ? `${description}\n\nRegister: ${registrationUrl}`
    : description;

  const event = {
    title,
    description: fullDescription,
    startTime: toIcsDatetime(startDatetime),
    endTime: toIcsDatetime(endDatetime),
    location: 'Trading Card Event',
  };

  return (
    <ICalendarLink
      event={event}
      filename={`${slugifyFilename(title)}.ics`}
      className={className}
    >
      Add to Calendar (.ics)
    </ICalendarLink>
  );
}

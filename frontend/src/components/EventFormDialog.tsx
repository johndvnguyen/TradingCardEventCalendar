import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { EventDto, EventPayload, GameTypeTemplate, PlayFormat } from '../types';
import { defaultEndFromStart, localInputToIso, toLocalDatetimeInputValue } from '../utils/dates';

interface EventFormDialogProps {
  open: boolean;
  gameTypes: GameTypeTemplate[];
  initialDate?: string;
  editingEvent?: EventDto | null;
  onClose: () => void;
  onSave: (payload: EventPayload, eventId?: number) => Promise<void>;
  onDelete?: (eventId: number) => Promise<void>;
}

function findFormat(gameTypes: GameTypeTemplate[], gameTypeName: string, formatName: string): PlayFormat | undefined {
  return gameTypes.find((g) => g.name === gameTypeName)?.playFormats.find((f) => f.name === formatName);
}

const MAX_EVENT_NAME_LENGTH = 100;

function validateEventName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Event name is required.';
  if (trimmed.length > MAX_EVENT_NAME_LENGTH) {
    return `Event name must be ${MAX_EVENT_NAME_LENGTH} characters or fewer.`;
  }
  return null;
}

export function EventFormDialog({
  open,
  gameTypes,
  initialDate,
  editingEvent,
  onClose,
  onSave,
  onDelete,
}: EventFormDialogProps) {
  const [name, setName] = useState('');
  const [gameType, setGameType] = useState('');
  const [playFormat, setPlayFormat] = useState('');
  const [startDatetime, setStartDatetime] = useState('');
  const [endDatetime, setEndDatetime] = useState('');
  const [playerCapacity, setPlayerCapacity] = useState(16);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedGame = useMemo(
    () => gameTypes.find((g) => g.name === gameType),
    [gameTypes, gameType],
  );

  const selectedFormat = useMemo(
    () => selectedGame?.playFormats.find((f) => f.name === playFormat),
    [selectedGame, playFormat],
  );

  useEffect(() => {
    if (!open) return;

    if (editingEvent) {
      setName(editingEvent.name);
      setGameType(editingEvent.gameType);
      setPlayFormat(editingEvent.playFormat);
      setStartDatetime(toLocalDatetimeInputValue(editingEvent.startDatetime));
      setEndDatetime(toLocalDatetimeInputValue(editingEvent.endDatetime));
      setPlayerCapacity(editingEvent.playerCapacity);
    } else {
      const firstGame = gameTypes[0];
      const firstFormat = firstGame?.playFormats[0];
      setName('');
      setGameType(firstGame?.name ?? '');
      setPlayFormat(firstFormat?.name ?? '');
      setPlayerCapacity(firstFormat?.defaultCapacity ?? 16);
      const start = initialDate ?? '';
      setStartDatetime(start);
      if (start && firstFormat) {
        setEndDatetime(
          toLocalDatetimeInputValue(
            defaultEndFromStart(localInputToIso(start), firstFormat.defaultDurationHours),
          ),
        );
      } else {
        setEndDatetime('');
      }
    }
    setError(null);
  }, [open, editingEvent, initialDate, gameTypes]);

  const applyFormatDefaults = (format: PlayFormat, startValue?: string) => {
    setPlayerCapacity(format.defaultCapacity);
    const start = startValue ?? startDatetime;
    if (start) {
      setEndDatetime(
        toLocalDatetimeInputValue(
          defaultEndFromStart(localInputToIso(start), format.defaultDurationHours),
        ),
      );
    }
  };

  const handleGameTypeChange = (value: string) => {
    setGameType(value);
    if (editingEvent) return;
    const game = gameTypes.find((g) => g.name === value);
    const firstFormat = game?.playFormats[0];
    if (firstFormat) {
      setPlayFormat(firstFormat.name);
      applyFormatDefaults(firstFormat);
    }
  };

  const handlePlayFormatChange = (value: string) => {
    setPlayFormat(value);
    if (editingEvent) return;
    const format = findFormat(gameTypes, gameType, value);
    if (format) applyFormatDefaults(format);
  };

  const handleStartChange = (value: string) => {
    setStartDatetime(value);
    const format = selectedFormat;
    if (!editingEvent && value && format) {
      setEndDatetime(
        toLocalDatetimeInputValue(
          defaultEndFromStart(localInputToIso(value), format.defaultDurationHours),
        ),
      );
    }
  };

  const validateCapacity = (format: PlayFormat, capacity: number): string | null => {
    if (capacity < format.minPlayers) {
      return `${format.name} requires at least ${format.minPlayers} players.`;
    }
    if (format.maxCapacity !== null && capacity > format.maxCapacity) {
      return `${format.name} allows at most ${format.maxCapacity} players.`;
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const format = selectedFormat;
    if (!format) {
      setError('Please select a valid play format.');
      setSaving(false);
      return;
    }

    const nameError = validateEventName(name);
    if (nameError) {
      setError(nameError);
      setSaving(false);
      return;
    }

    const startIso = localInputToIso(startDatetime);
    const endIso = localInputToIso(endDatetime);

    if (new Date(endIso) <= new Date(startIso)) {
      setError('End time must be after start time.');
      setSaving(false);
      return;
    }

    const capacityError = validateCapacity(format, playerCapacity);
    if (capacityError) {
      setError(capacityError);
      setSaving(false);
      return;
    }

    const payload: EventPayload = {
      name: name.trim(),
      gameType,
      playFormat,
      startDatetime: startIso,
      endDatetime: endIso,
      playerCapacity,
    };

    try {
      await onSave(payload, editingEvent?.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingEvent || !onDelete) return;
    if (!confirm('Delete this event?')) return;

    setSaving(true);
    setError(null);
    try {
      await onDelete(editingEvent.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const capacityMin = selectedFormat?.minPlayers ?? 1;
  const capacityMax = selectedFormat?.maxCapacity ?? undefined;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <dialog open className="modal" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <h2>{editingEvent ? 'Edit Event' : 'Schedule Event'}</h2>

          <label htmlFor="event-name">Event Name</label>
          <input
            id="event-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={MAX_EVENT_NAME_LENGTH}
          />

          <label htmlFor="game-type">Game Type</label>
          <select
            id="game-type"
            value={gameType}
            onChange={(e) => handleGameTypeChange(e.target.value)}
            required
          >
            {gameTypes.map((gt) => (
              <option key={gt.id} value={gt.name}>
                {gt.name}
              </option>
            ))}
          </select>

          <label htmlFor="play-format">Play Format</label>
          <select
            id="play-format"
            value={playFormat}
            onChange={(e) => handlePlayFormatChange(e.target.value)}
            required
          >
            {(selectedGame?.playFormats ?? []).map((pf) => (
              <option key={pf.id} value={pf.name}>
                {pf.name}
              </option>
            ))}
          </select>

          {selectedFormat && selectedFormat.minPlayers > 2 && (
            <p className="hint">
              This format requires at least {selectedFormat.minPlayers} players.
            </p>
          )}

          <label htmlFor="start-datetime">Start Date &amp; Time</label>
          <input
            id="start-datetime"
            type="datetime-local"
            value={startDatetime}
            onChange={(e) => handleStartChange(e.target.value)}
            required
          />

          <label htmlFor="end-datetime">End Date &amp; Time</label>
          <input
            id="end-datetime"
            type="datetime-local"
            value={endDatetime}
            onChange={(e) => setEndDatetime(e.target.value)}
            required
          />

          <label htmlFor="player-capacity">Player Capacity</label>
          <input
            id="player-capacity"
            type="number"
            min={capacityMin}
            max={capacityMax}
            value={playerCapacity}
            onChange={(e) => setPlayerCapacity(parseInt(e.target.value, 10))}
            required
          />

          {error && <div className="message message-error">{error}</div>}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              Save
            </button>
            {editingEvent && onDelete && (
              <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                Delete
              </button>
            )}
          </div>
        </form>
      </dialog>
    </div>
  );
}

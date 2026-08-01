import { FormEvent, useEffect, useState } from 'react';
import type { EventDto, EventPayload, GameType } from '../types';
import { defaultEndFromStart, localInputToIso, toLocalDatetimeInputValue } from '../utils/dates';

interface EventFormDialogProps {
  open: boolean;
  gameTypes: GameType[];
  initialDate?: string;
  editingEvent?: EventDto | null;
  onClose: () => void;
  onSave: (payload: EventPayload, eventId?: number) => Promise<void>;
  onDelete?: (eventId: number) => Promise<void>;
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
  const [startDatetime, setStartDatetime] = useState('');
  const [endDatetime, setEndDatetime] = useState('');
  const [playerCapacity, setPlayerCapacity] = useState(16);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (editingEvent) {
      setName(editingEvent.name);
      setGameType(editingEvent.gameType);
      setStartDatetime(toLocalDatetimeInputValue(editingEvent.startDatetime));
      setEndDatetime(toLocalDatetimeInputValue(editingEvent.endDatetime));
      setPlayerCapacity(editingEvent.playerCapacity);
    } else {
      setName('');
      setGameType(gameTypes[0]?.name ?? '');
      setPlayerCapacity(gameTypes[0]?.maxCapacity ?? 16);
      const start = initialDate ?? '';
      setStartDatetime(start);
      setEndDatetime(start ? toLocalDatetimeInputValue(defaultEndFromStart(localInputToIso(start))) : '');
    }
    setError(null);
  }, [open, editingEvent, initialDate, gameTypes]);

  const handleGameTypeChange = (value: string) => {
    setGameType(value);
    const selected = gameTypes.find((gt) => gt.name === value);
    if (selected && !editingEvent) setPlayerCapacity(selected.maxCapacity);
  };

  const handleStartChange = (value: string) => {
    setStartDatetime(value);
    if (!editingEvent && value) {
      setEndDatetime(toLocalDatetimeInputValue(defaultEndFromStart(localInputToIso(value))));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const startIso = localInputToIso(startDatetime);
    const endIso = localInputToIso(endDatetime);

    if (new Date(endIso) <= new Date(startIso)) {
      setError('End time must be after start time.');
      setSaving(false);
      return;
    }

    const payload: EventPayload = {
      name: name.trim(),
      gameType,
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
            maxLength={200}
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
            min={1}
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

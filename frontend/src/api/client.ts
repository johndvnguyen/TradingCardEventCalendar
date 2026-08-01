import type {
  ErrorResponse,
  EventDto,
  EventPayload,
  EventPublicDto,
  GameType,
  RegisterResponse,
} from './types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = (await response.json()) as ErrorResponse;
      if (body.message) message = body.message;
    } catch {
      const text = await response.text();
      if (text) message = text;
    }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  getGameTypes: () => fetchJson<GameType[]>(`${API_BASE}/gametypes`),

  getEvents: (start?: string, end?: string) => {
    const params = new URLSearchParams();
    if (start) params.set('start', start);
    if (end) params.set('end', end);
    const query = params.toString();
    return fetchJson<EventDto[]>(`${API_BASE}/events${query ? `?${query}` : ''}`);
  },

  getEvent: (id: number) => fetchJson<EventDto>(`${API_BASE}/events/${id}`),

  createEvent: (payload: EventPayload) =>
    fetchJson<EventDto>(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  updateEvent: (id: number, payload: EventPayload) =>
    fetchJson<void>(`${API_BASE}/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, id }),
    }),

  deleteEvent: (id: number) =>
    fetchJson<void>(`${API_BASE}/events/${id}`, { method: 'DELETE' }),

  getPublicEvent: (token: string) =>
    fetchJson<EventPublicDto>(`${API_BASE}/events/public/${token}`),

  register: (token: string, name: string) =>
    fetchJson<RegisterResponse>(`${API_BASE}/events/public/${token}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    }),
};

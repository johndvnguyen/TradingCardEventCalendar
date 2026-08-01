const API_BASE = '/api';

let gameTypes = [];
let editingEventId = null;
let calendar;

const eventDialog = document.getElementById('event-dialog');
const viewDialog = document.getElementById('view-dialog');
const eventForm = document.getElementById('event-form');
const gameTypeSelect = document.getElementById('game-type');
const deleteBtn = document.getElementById('delete-btn');

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
  if (response.status === 204) return null;
  return response.json();
}

async function loadGameTypes() {
  gameTypes = await fetchJson(`${API_BASE}/gametypes`);
  gameTypeSelect.innerHTML = gameTypes
    .map(gt => `<option value="${gt.name}">${gt.name}</option>`)
    .join('');
}

async function loadEvents(info, successCallback, failureCallback) {
  try {
    const start = info.startStr;
    const end = info.endStr;
    const events = await fetchJson(`${API_BASE}/events?start=${start}&end=${end}`);
    successCallback(events.map(toCalendarEvent));
  } catch (err) {
    failureCallback(err);
  }
}

function toCalendarEvent(evt) {
  return {
    id: String(evt.id),
    title: evt.name,
    start: evt.startDatetime,
    extendedProps: {
      gameType: evt.gameType,
      playerCapacity: evt.playerCapacity,
      registrationCount: evt.registrationCount,
      spotsRemaining: evt.spotsRemaining,
      isFull: evt.isFull,
      eventPageUrl: evt.eventPageUrl,
      registrationToken: evt.registrationToken
    }
  };
}

function formatDatetime(isoString) {
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function toLocalDatetimeInputValue(isoString) {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function openScheduleDialog(dateStr) {
  editingEventId = null;
  document.getElementById('dialog-title').textContent = 'Schedule Event';
  eventForm.reset();
  deleteBtn.hidden = true;

  if (dateStr) {
    document.getElementById('start-datetime').value = dateStr.slice(0, 16);
  }

  if (gameTypes.length > 0) {
    gameTypeSelect.value = gameTypes[0].name;
    document.getElementById('player-capacity').value = gameTypes[0].maxCapacity;
  }

  eventDialog.showModal();
}

function openEditDialog(event) {
  editingEventId = event.id;
  document.getElementById('dialog-title').textContent = 'Edit Event';
  document.getElementById('event-name').value = event.title;
  gameTypeSelect.value = event.extendedProps.gameType;
  document.getElementById('start-datetime').value = toLocalDatetimeInputValue(event.start);
  document.getElementById('player-capacity').value = event.extendedProps.playerCapacity;
  deleteBtn.hidden = false;
  eventDialog.showModal();
}

function openViewDialog(event) {
  const props = event.extendedProps;
  const registered = props.registrationCount ?? 0;
  const capacity = props.playerCapacity;
  const spotsText = props.isFull
    ? `${registered} / ${capacity} (Full)`
    : `${registered} / ${capacity} (${props.spotsRemaining ?? capacity - registered} spots left)`;

  document.getElementById('view-title').textContent = event.title;
  document.getElementById('view-details').innerHTML = `
    <dt>Game</dt><dd>${props.gameType}</dd>
    <dt>Start</dt><dd>${formatDatetime(event.start)}</dd>
    <dt>Registered</dt><dd>${spotsText}</dd>
  `;

  const eventPageLink = document.getElementById('view-event-page-btn');
  if (props.eventPageUrl) {
    eventPageLink.href = props.eventPageUrl;
    eventPageLink.hidden = false;
  } else {
    eventPageLink.hidden = true;
  }

  viewDialog.dataset.eventId = event.id;
  viewDialog.showModal();
}

async function saveEvent(e) {
  e.preventDefault();

  const payload = {
    name: document.getElementById('event-name').value.trim(),
    gameType: gameTypeSelect.value,
    startDatetime: new Date(document.getElementById('start-datetime').value).toISOString(),
    playerCapacity: parseInt(document.getElementById('player-capacity').value, 10)
  };

  if (editingEventId) {
    await fetchJson(`${API_BASE}/events/${editingEventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, id: parseInt(editingEventId, 10) })
    });
  } else {
    await fetchJson(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  eventDialog.close();
  calendar.refetchEvents();
}

async function deleteEvent() {
  if (!editingEventId) return;
  if (!confirm('Delete this event?')) return;

  await fetchJson(`${API_BASE}/events/${editingEventId}`, { method: 'DELETE' });
  eventDialog.close();
  calendar.refetchEvents();
}

function initCalendar() {
  const calendarEl = document.getElementById('calendar');
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,listWeek'
    },
    events: loadEvents,
    dateClick(info) {
      openScheduleDialog(info.dateStr + 'T12:00');
    },
    eventClick(info) {
      openViewDialog(info.event);
    },
    height: 'auto'
  });
  calendar.render();
}

gameTypeSelect.addEventListener('change', () => {
  const selected = gameTypes.find(gt => gt.name === gameTypeSelect.value);
  if (selected) {
    document.getElementById('player-capacity').value = selected.maxCapacity;
  }
});

document.getElementById('schedule-btn').addEventListener('click', () => openScheduleDialog());
document.getElementById('cancel-btn').addEventListener('click', () => eventDialog.close());
document.getElementById('view-close-btn').addEventListener('click', () => viewDialog.close());
document.getElementById('view-edit-btn').addEventListener('click', () => {
  const eventId = viewDialog.dataset.eventId;
  const event = calendar.getEventById(eventId);
  viewDialog.close();
  if (event) openEditDialog(event);
});
eventForm.addEventListener('submit', saveEvent);
deleteBtn.addEventListener('click', deleteEvent);

loadGameTypes().then(initCalendar);

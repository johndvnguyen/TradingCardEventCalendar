const API_BASE = '/api';

function getTokenFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('token');
}

function formatDatetime(isoString) {
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function showPageError(message) {
  document.getElementById('loading').hidden = true;
  document.getElementById('error').hidden = false;
  document.getElementById('error').textContent = message;
}

function showFormError(message) {
  const el = document.getElementById('form-error');
  el.hidden = false;
  el.textContent = message;
  document.getElementById('form-success').hidden = true;
}

function showFormSuccess(message) {
  const el = document.getElementById('form-success');
  el.hidden = false;
  el.textContent = message;
  document.getElementById('form-error').hidden = true;
}

async function loadEvent() {
  const token = getTokenFromQuery();
  if (!token) {
    showPageError('Missing event token. Scan the QR code or use a valid registration link.');
    return null;
  }

  const response = await fetch(`${API_BASE}/events/public/${token}`);
  if (!response.ok) {
    showPageError('Event not found.');
    return null;
  }

  return response.json();
}

function renderEvent(event) {
  document.getElementById('loading').hidden = true;
  document.getElementById('register-content').hidden = false;

  document.getElementById('event-name').textContent = event.name;
  document.getElementById('event-game').textContent = event.gameType;
  document.getElementById('event-start').textContent = formatDatetime(event.startDatetime);
  document.getElementById('event-spots').textContent =
    event.isFull ? 'None — event is full' : String(event.spotsRemaining);

  const form = document.getElementById('register-form');
  const submitBtn = document.getElementById('submit-btn');

  if (event.isFull) {
    document.getElementById('full-message').hidden = false;
    form.hidden = true;
    submitBtn.disabled = true;
  }
}

async function register(token, name) {
  const response = await fetch(`${API_BASE}/events/public/${token}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });

  const body = await response.json().catch(() => ({}));

  if (response.status === 409) {
    showFormError(body.message || 'This event is full. Registration is closed.');
    document.getElementById('full-message').hidden = false;
    document.getElementById('register-form').hidden = true;
    return;
  }

  if (!response.ok) {
    showFormError(body.message || 'Registration failed. Please try again.');
    return;
  }

  showFormSuccess(body.message);
  document.getElementById('player-name').disabled = true;
  document.getElementById('submit-btn').disabled = true;

  const spotsEl = document.getElementById('event-spots');
  const updated = await loadEvent();
  if (updated) {
    spotsEl.textContent =
      updated.isFull ? 'None — event is full' : String(updated.spotsRemaining);
    if (updated.isFull) {
      document.getElementById('full-message').hidden = false;
      document.getElementById('register-form').hidden = true;
    }
  }
}

const token = getTokenFromQuery();

loadEvent()
  .then(event => {
    if (event) renderEvent(event);
  })
  .catch(() => showPageError('Failed to load event.'));

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  document.getElementById('form-error').hidden = true;

  const name = document.getElementById('player-name').value.trim();
  if (!name) {
    showFormError('Name is required.');
    return;
  }

  if (!token) {
    showFormError('Invalid registration link.');
    return;
  }

  document.getElementById('submit-btn').disabled = true;
  try {
    await register(token, name);
  } finally {
    const form = document.getElementById('register-form');
    if (!form.hidden) {
      document.getElementById('submit-btn').disabled = false;
    }
  }
});

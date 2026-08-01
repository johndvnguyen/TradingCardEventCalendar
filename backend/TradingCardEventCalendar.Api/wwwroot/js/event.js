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

function showError(message) {
  document.getElementById('loading').hidden = true;
  document.getElementById('error').hidden = false;
  document.getElementById('error').textContent = message;
}

function renderQrCode(url) {
  const container = document.getElementById('qrcode');
  container.innerHTML = '';
  // eslint-disable-next-line no-undef
  new QRCode(container, {
    text: url,
    width: 200,
    height: 200,
    colorDark: '#e8edf4',
    colorLight: '#1a2332',
    correctLevel: QRCode.CorrectLevel.M
  });
}

async function loadEvent() {
  const token = getTokenFromQuery();
  if (!token) {
    showError('Missing event token. Use a valid registration link.');
    return;
  }

  const response = await fetch(`${API_BASE}/events/public/${token}`);
  if (!response.ok) {
    showError('Event not found.');
    return;
  }

  const event = await response.json();

  document.getElementById('loading').hidden = true;
  document.getElementById('event-content').hidden = false;

  document.getElementById('event-name').textContent = event.name;
  document.getElementById('event-game').textContent = event.gameType;
  document.getElementById('event-start').textContent = formatDatetime(event.startDatetime);
  document.getElementById('event-registrations').textContent =
    `${event.registrationCount} / ${event.playerCapacity}` +
    (event.isFull ? ' (Full)' : ` (${event.spotsRemaining} spots left)`);

  const registrationUrl = event.registrationUrl;
  document.getElementById('registration-url').value = registrationUrl;
  document.getElementById('register-link').href = registrationUrl;

  renderQrCode(registrationUrl);

  document.getElementById('copy-link-btn').addEventListener('click', async () => {
    await navigator.clipboard.writeText(registrationUrl);
    const btn = document.getElementById('copy-link-btn');
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
  });
}

loadEvent().catch(() => showError('Failed to load event.'));

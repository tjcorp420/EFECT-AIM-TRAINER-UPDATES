import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js';
import {
  collection,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  where,
} from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyB8y-U6IfohJPMx6VDnXCSKy_ZIdalmXb0',
  authDomain: 'efect-aim-trainer-lb.firebaseapp.com',
  databaseURL: 'https://efect-aim-trainer-lb-default-rtdb.firebaseio.com',
  projectId: 'efect-aim-trainer-lb',
  storageBucket: 'efect-aim-trainer-lb.firebasestorage.app',
  messagingSenderId: '312486579575',
  appId: '1:312486579575:web:60d90e9fea6ba91187a572',
  measurementId: 'G-FYLQ3M9SDJ',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const GITHUB_RELEASES =
  'https://api.github.com/repos/tjcorp420/EFECT-AIM-TRAINER-UPDATES/releases';
const UPDATER_JSON =
  'https://raw.githubusercontent.com/tjcorp420/EFECT-AIM-TRAINER-UPDATES/main/updater.json';
const PROFILE_KEY = 'emx_companion_profile';

const gameYaws = {
  aimlabs: { label: 'Aimlabs / EMX', yaw: 0.022 },
  valorant: { label: 'Valorant', yaw: 0.07 },
  cs2: { label: 'CS2 / Source', yaw: 0.022 },
  apex: { label: 'Apex Legends', yaw: 0.022 },
  overwatch: { label: 'Overwatch 2', yaw: 0.0066 },
  fortnite: { label: 'Fortnite', yaw: 0.0055 },
  r6: { label: 'Rainbow Six Siege', yaw: 0.02 },
  cod: { label: 'Call of Duty', yaw: 0.0066 },
  roblox: { label: 'Roblox', yaw: 0.012 },
};

const scenarioLabels = {
  gridshot_standard: 'Gridshot Standard',
  neon_popcorn: 'Neon Popcorn',
  void_cluster: 'Void Cluster',
  glider_tracking_night: 'Glider Night Track',
  tracking_dynamic: 'Tracking Dynamic',
  headshot_only: 'Headshot Only',
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const cleanScore = (score) => Math.max(0, Math.min(10000000, Math.round(Number(score) || 0)));
const cleanAccuracy = (accuracy) => Math.max(0, Math.min(100, Math.round(Number(accuracy) || 0)));
const cleanName = (name) => String(name || 'EMX TWEAKS').trim().slice(0, 16) || 'EMX TWEAKS';
const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const safeUrl = (value, fallback) => {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : fallback;
  } catch {
    return fallback;
  }
};

function setStatus(label, ok = true) {
  const status = $('#networkStatus');
  status.textContent = label;
  status.style.color = ok ? 'var(--cyan)' : 'var(--yellow)';
  status.style.borderColor = ok ? 'rgba(0,255,204,0.35)' : 'rgba(255,212,0,0.38)';
}

function showTab(tabId) {
  const nextTab = $(`#${tabId}`) ? tabId : 'command';

  $$('.tab-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === nextTab);
  });

  $$('.tab-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === nextTab);
  });

  if (location.hash.slice(1) !== nextTab) {
    history.replaceState(null, '', `#${nextTab}`);
  }
}

function populateGames() {
  const options = Object.entries(gameYaws)
    .map(([value, game]) => `<option value="${value}">${game.label}</option>`)
    .join('');

  $('#originGame').innerHTML = options;
  $('#targetGame').innerHTML = options;
  $('#originGame').value = 'valorant';
  $('#targetGame').value = 'aimlabs';
}

function cmPer360(sens, dpi, yaw) {
  const safeSens = Math.max(0.0001, Number(sens) || 0);
  const safeDpi = Math.max(1, Number(dpi) || 800);

  return (360 / (safeSens * yaw) / safeDpi) * 2.54;
}

function sensFromCm(cm, dpi, yaw) {
  const safeCm = Math.max(0.01, Number(cm) || 0);
  const safeDpi = Math.max(1, Number(dpi) || 800);

  return 360 / ((safeCm / 2.54) * safeDpi * yaw);
}

function updateConverter() {
  const origin = gameYaws[$('#originGame').value] || gameYaws.valorant;
  const target = gameYaws[$('#targetGame').value] || gameYaws.aimlabs;
  const sens = Number($('#originSens').value) || 0;
  const dpi = Number($('#originDpi').value) || 800;
  const cm = cmPer360(sens, dpi, origin.yaw);
  const converted = sensFromCm(cm, dpi, target.yaw);

  $('#convertedSens').textContent = converted.toFixed(converted >= 10 ? 2 : 4);
  $('#convertedCm').textContent = `${cm.toFixed(2)} cm/360`;
  $('#quickCm').textContent = `${cmPer360($('#quickSens').value, $('#quickDpi').value, gameYaws.valorant.yaw).toFixed(2)} cm/360`;
  localStorage.setItem(
    'emx_sens_snapshot',
    JSON.stringify({ origin: $('#originGame').value, target: $('#targetGame').value, sens, dpi })
  );
}

async function loadLeaderboard() {
  const scenario = $('#scenarioSelect').value;
  const rows = $('#leaderboardRows');
  rows.innerHTML = '<tr><td colspan="4">Loading leaderboard...</td></tr>';

  try {
    const q = query(
      collection(db, 'leaderboards'),
      where('scenario', '==', scenario),
      orderBy('score', 'desc'),
      limit(500)
    );
    const snapshot = await getDocs(q);
    const bestByPlayer = new Map();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const username = cleanName(data.username);
      const score = cleanScore(data.score);
      const accuracy = cleanAccuracy(data.accuracy);
      const key = data.uid || username.toLowerCase().replace(/\s+/g, '_');
      const current = bestByPlayer.get(key);

      if (!current || score > current.score) {
        bestByPlayer.set(key, { id: doc.id, username, score, accuracy });
      }
    });

    const scores = [...bestByPlayer.values()].sort((a, b) => b.score - a.score).slice(0, 100);
    $('#topScorePreview').textContent = scores[0] ? scores[0].score.toLocaleString() : '--';

    rows.innerHTML =
      scores.length > 0
        ? scores
            .map(
              (entry, index) => `
                <tr>
                  <td>#${index + 1}</td>
                  <td>${escapeHtml(entry.username)}</td>
                  <td>${entry.score.toLocaleString()}</td>
                  <td>${entry.accuracy}%</td>
                </tr>
              `
            )
            .join('')
        : '<tr><td colspan="4">No scores yet for this module.</td></tr>';
  } catch (error) {
    rows.innerHTML =
      '<tr><td colspan="4">Leaderboard is offline or blocked. Try again in a minute.</td></tr>';
    setStatus('LIMITED', false);
  }
}

async function loadReleaseInfo() {
  try {
    const [updaterRes, releasesRes] = await Promise.all([
      fetch(UPDATER_JSON, { cache: 'no-store' }),
      fetch(GITHUB_RELEASES, { cache: 'no-store' }),
    ]);
    const updater = await updaterRes.json();
    const releases = await releasesRes.json();
    const latest = releases[0];

    $('#latestVersion').textContent = updater.version || latest?.tag_name || '--';
    $('#releaseVersion').textContent = updater.version || latest?.tag_name || 'Latest';
    $('#releaseNotes').textContent = updater.notes || latest?.body || 'Latest updater manifest loaded.';
    $('#releaseLink').href = safeUrl(
      latest?.html_url,
      'https://github.com/tjcorp420/EFECT-AIM-TRAINER-UPDATES/releases'
    );

    $('#releaseList').innerHTML = releases
      .slice(0, 6)
      .map((release) => {
        const releaseTitle = escapeHtml(release.name || release.tag_name || 'EMX Release');
        const releaseDate = release.published_at
          ? new Date(release.published_at).toLocaleDateString()
          : 'Pending';
        const releaseBody = escapeHtml(
          release.body || 'Signed EMX Aim Trainer release.'
        ).slice(0, 560);
        const releaseUrl = safeUrl(
          release.html_url,
          'https://github.com/tjcorp420/EFECT-AIM-TRAINER-UPDATES/releases'
        );

        return `
          <article class="release-item">
            <h3><span>${releaseTitle}</span><span>${escapeHtml(releaseDate)}</span></h3>
            <p>${releaseBody}</p>
            <a class="link-button" href="${releaseUrl}" target="_blank" rel="noreferrer">Open</a>
          </article>
        `;
      })
      .join('');

    setStatus('ONLINE', true);
  } catch {
    $('#releaseVersion').textContent = 'Offline';
    $('#releaseNotes').textContent = 'Release feed will refresh when the network is available.';
    $('#releaseList').innerHTML =
      '<article class="release-item"><h3>Offline cache</h3><p>Reconnect to refresh releases.</p></article>';
    setStatus('OFFLINE', false);
  }
}

function loadProfile() {
  const profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
  $('#profileName').value = profile.name || 'EMX TWEAKS';
  $('#scoreGoal').value = profile.goal || '20000';
  $('#mainGame').value = profile.game || 'Valorant';
  $('#goalPreview').textContent = Number(profile.goal || 20000).toLocaleString();
}

function saveProfile() {
  const profile = {
    name: $('#profileName').value || 'EMX TWEAKS',
    goal: Number($('#scoreGoal').value) || 20000,
    game: $('#mainGame').value,
  };

  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  $('#goalPreview').textContent = profile.goal.toLocaleString();
  $('#todayRoutineTitle').textContent = `${profile.game} Skill Stack`;
}

function hydrateSavedSens() {
  const saved = JSON.parse(localStorage.getItem('emx_sens_snapshot') || '{}');

  if (saved.origin && gameYaws[saved.origin]) $('#originGame').value = saved.origin;
  if (saved.target && gameYaws[saved.target]) $('#targetGame').value = saved.target;
  if (saved.sens) $('#originSens').value = saved.sens;
  if (saved.dpi) $('#originDpi').value = saved.dpi;
}

let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  $('#installButton').hidden = false;
});

$('#installButton').addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  $('#installButton').hidden = true;
});

$$('.tab-button').forEach((button) => {
  button.addEventListener('click', () => showTab(button.dataset.tab));
});

window.addEventListener('hashchange', () => showTab(location.hash.slice(1)));

['originGame', 'targetGame', 'originSens', 'originDpi', 'quickSens', 'quickDpi'].forEach((id) => {
  $(`#${id}`).addEventListener('input', updateConverter);
  $(`#${id}`).addEventListener('change', updateConverter);
});

$('#scenarioSelect').addEventListener('change', loadLeaderboard);
$('#refreshLeaderboard').addEventListener('click', loadLeaderboard);
$('#saveProfile').addEventListener('click', saveProfile);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => null);
}

populateGames();
hydrateSavedSens();
loadProfile();
updateConverter();
showTab(location.hash.slice(1) || 'command');
loadReleaseInfo();
loadLeaderboard();

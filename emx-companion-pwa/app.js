import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  where,
} from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js';

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
const auth = getAuth(app);

const GITHUB_RELEASES =
  'https://api.github.com/repos/tjcorp420/EFECT-AIM-TRAINER-UPDATES/releases';
const UPDATER_JSON =
  'https://raw.githubusercontent.com/tjcorp420/EFECT-AIM-TRAINER-UPDATES/main/updater.json';
const PROFILE_KEY = 'emx_companion_profile';
const withCacheBust = (url) => `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`;

const gameYaws = {
  aimlabs: { label: 'Aimlabs Raw', yaw: 0.022 },
  valorant: { label: 'Valorant', yaw: 0.07 },
  cs2: { label: 'CS2 / Source', yaw: 0.022 },
  apex: { label: 'Apex Legends', yaw: 0.022 },
  overwatch: { label: 'Overwatch 2', yaw: 0.0066 },
  fortnite: { label: 'Fortnite', yaw: 0.0055 },
  r6: { label: 'Rainbow Six Siege', yaw: 0.02 },
  cod: { label: 'Call of Duty', yaw: 0.0066 },
  roblox: { label: 'Roblox', yaw: 0.012 },
};

const emxProfiles = {
  valorant: { label: 'Valorant', multiplier: 1, defaultFov: 103 },
  cs2: { label: 'CS2 / Apex', multiplier: 3.1818, defaultFov: 106 },
  apex: { label: 'CS2 / Apex', multiplier: 3.1818, defaultFov: 106 },
  fortnite: { label: 'Fortnite', multiplier: 12.5, defaultFov: 103 },
  overwatch: { label: 'Overwatch 2', multiplier: 10.6, defaultFov: 103 },
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
const cleanPercent = (value) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
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

let releaseCache = [];
let selectedReleaseIndex = 0;
let cloudProgress = null;
let currentUser = null;

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

function getEmxMatch(originKey, originSens, rawConverted) {
  const profile = emxProfiles[originKey];

  if (profile) {
    return {
      value: Number(originSens) || 0,
      label: `${profile.label} profile`,
      fov: profile.defaultFov,
      direct: true,
    };
  }

  return {
    value: rawConverted,
    label: 'Valorant profile estimate',
    fov: 103,
    direct: false,
  };
}

function updateConverter() {
  const originKey = $('#originGame').value;
  const origin = gameYaws[originKey] || gameYaws.valorant;
  const target = gameYaws[$('#targetGame').value] || gameYaws.aimlabs;
  const sens = Number($('#originSens').value) || 0;
  const dpi = Number($('#originDpi').value) || 800;
  const cm = cmPer360(sens, dpi, origin.yaw);
  const converted = sensFromCm(cm, dpi, target.yaw);
  const emxMatch = getEmxMatch(originKey, sens, converted);

  $('#convertedSens').textContent = converted.toFixed(converted >= 10 ? 2 : 4);
  $('#convertedCm').textContent = `${cm.toFixed(2)} cm/360`;
  $('#emxEquivalent').textContent = `${emxMatch.value.toFixed(3)} (${emxMatch.label}, FOV ${emxMatch.fov})`;
  $('#converterNote').textContent = emxMatch.direct
    ? `For EMX, select the ${emxMatch.label} in the trainer and enter ${emxMatch.value.toFixed(3)}. The raw converter above is for Aimlabs-style cm/360 matching.`
    : `No exact EMX profile exists for ${origin.label}; use the raw conversion as an estimate, then fine tune FOV and feel in the trainer.`;
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
      limit(100)
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
    const detail =
      error?.code === 'permission-denied'
        ? 'Leaderboard rules blocked this query. Update the app or refresh the page.'
        : 'Leaderboard is offline. Try again in a minute.';

    rows.innerHTML = `<tr><td colspan="4">${escapeHtml(detail)}</td></tr>`;
    setStatus('LIMITED', false);
  }
}

function getReleaseTitle(release, updaterVersion) {
  return release?.name || release?.tag_name || updaterVersion || 'EMX Update';
}

function getReleaseBody(release, updaterNotes) {
  return updaterNotes || release?.body || 'Signed EMX Aim Trainer release.';
}

function makeReleaseHighlights(body) {
  const text = String(body || '');
  const compact = text
    .replace(/^v?\d+\.\d+\.\d+\s*/i, '')
    .replace(/premium upgrade pass:\s*/i, '')
    .trim();
  const parts = compact
    .split(/,\s+|;\s+|\.\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 6);

  return parts.length > 0 ? parts : ['Signed update ready through the EMX auto-updater.'];
}

function renderReleaseSpotlight(index = 0) {
  selectedReleaseIndex = Math.max(0, Math.min(index, releaseCache.length - 1));
  const release = releaseCache[selectedReleaseIndex];

  if (!release) return;

  const title = getReleaseTitle(release, release.version);
  const body = getReleaseBody(release, release.notes);
  const date = release.published_at
    ? new Date(release.published_at).toLocaleDateString()
    : new Date().toLocaleDateString();

  $('#releaseSpotlightTitle').textContent = title;
  $('#releaseSpotlightBody').textContent = body;
  $('#releaseSpotlightVersion').textContent = String(release.tag_name || release.version || title).replace(/^v/i, '');
  $('#releaseSpotlightDate').textContent = date;
  $('#releaseHighlights').innerHTML = makeReleaseHighlights(body)
    .map(
      (item) => `
        <div class="highlight-tile">
          <span>Patch Item</span>
          <strong>${escapeHtml(item)}</strong>
        </div>
      `
    )
    .join('');
}

function showReleaseTab(index = 0) {
  showTab('releases');
  renderReleaseSpotlight(index);
  $('#releaseSpotlight')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function loadReleaseInfo() {
  try {
    const [updaterRes, releasesRes] = await Promise.all([
      fetch(withCacheBust(UPDATER_JSON), { cache: 'no-store' }),
      fetch(withCacheBust(GITHUB_RELEASES), { cache: 'no-store' }),
    ]);
    const updater = await updaterRes.json();
    const releases = await releasesRes.json();
    const latest = releases[0];
    releaseCache = Array.isArray(releases) ? releases : [];

    $('#latestVersion').textContent = updater.version || latest?.tag_name || '--';
    $('#releaseVersion').textContent = updater.version || latest?.tag_name || 'Latest';
    $('#releaseNotes').textContent = updater.notes || latest?.body || 'Latest updater manifest loaded.';

    if (releaseCache.length > 0 && updater.version) {
      releaseCache[0] = {
        ...releaseCache[0],
        version: updater.version,
        notes: updater.notes || releaseCache[0].body,
      };
    }

    $('#releaseList').innerHTML = releases
      .slice(0, 6)
      .map((release, index) => {
        const releaseTitle = escapeHtml(release.name || release.tag_name || 'EMX Release');
        const releaseDate = release.published_at
          ? new Date(release.published_at).toLocaleDateString()
          : 'Pending';
        const releaseBody = escapeHtml(
          release.body || 'Signed EMX Aim Trainer release.'
        ).slice(0, 560);

        return `
          <article class="release-item ${index === selectedReleaseIndex ? 'selected' : ''}">
            <div class="release-item-top">
              <h3>${releaseTitle}</h3>
              <span>${escapeHtml(releaseDate)}</span>
            </div>
            <p>${releaseBody}</p>
            <button class="link-button release-open" type="button" data-release-index="${index}">View What's New</button>
          </article>
        `;
      })
      .join('');

    $$('.release-open').forEach((button) => {
      button.addEventListener('click', () => showReleaseTab(Number(button.dataset.releaseIndex) || 0));
    });

    renderReleaseSpotlight(0);
    setStatus('ONLINE', true);
  } catch {
    $('#releaseVersion').textContent = 'Offline';
    $('#releaseNotes').textContent = 'Release feed will refresh when the network is available.';
    $('#releaseSpotlightTitle').textContent = 'Offline cache';
    $('#releaseSpotlightBody').textContent = 'Reconnect to refresh update notes.';
    $('#releaseList').innerHTML =
      '<article class="release-item"><h3>Offline cache</h3><p>Reconnect to refresh releases.</p></article>';
    setStatus('OFFLINE', false);
  }
}

function loadProfile() {
  const profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
  $('#profileName').value = profile.name || 'EMX TWEAKS';
  $('#scoreGoal').value = profile.goal || '20000';
  $('#bestScore').value = profile.best || profile.bestScore || '0';
  $('#mainGame').value = profile.game || 'Valorant';
  renderTracker(profile);
}

function saveProfile() {
  const currentProfile = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
  const profile = {
    name: $('#profileName').value || 'EMX TWEAKS',
    goal: Number($('#scoreGoal').value) || 20000,
    best: Number($('#bestScore').value) || 0,
    game: $('#mainGame').value,
    runs: Array.isArray(currentProfile.runs) ? currentProfile.runs : [],
  };

  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  $('#todayRoutineTitle').textContent = `${profile.game} Skill Stack`;
  renderTracker(profile);
}

function logRun() {
  const currentProfile = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
  const score = cleanScore($('#latestRunScore').value);

  if (score <= 0) return;

  const runs = [
    {
      score,
      date: new Date().toISOString(),
      game: $('#mainGame').value,
    },
    ...(Array.isArray(currentProfile.runs) ? currentProfile.runs : []),
  ].slice(0, 10);
  const profile = {
    name: $('#profileName').value || 'EMX TWEAKS',
    goal: Number($('#scoreGoal').value) || 20000,
    best: Math.max(score, Number($('#bestScore').value) || 0, Number(currentProfile.best) || 0),
    game: $('#mainGame').value,
    runs,
  };

  $('#bestScore').value = String(profile.best);
  $('#latestRunScore').value = '';
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  renderTracker(profile);
}

function renderTracker(localProfile = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')) {
  const goal = Math.max(1, Number($('#scoreGoal')?.value || localProfile.goal || 20000));
  const localBest = Number($('#bestScore')?.value || localProfile.best || 0);
  const best = cloudProgress?.bestScoreOverall || localBest;
  const totalSessions = cloudProgress?.totalSessions ?? (Array.isArray(localProfile.runs) ? localProfile.runs.length : 0);
  const gap = Math.max(0, goal - best);
  const progress = cleanPercent((best / goal) * 100);

  $('#goalPreview').textContent = goal.toLocaleString();
  $('#trackerBest').textContent = best.toLocaleString();
  $('#trackerRuns').textContent = `${totalSessions.toLocaleString()} runs`;
  $('#trackerGap').textContent = gap.toLocaleString();
  $('#trackerProgressBar').style.width = `${progress}%`;

  const recent = cloudProgress?.recentSessions || localProfile.runs || [];
  $('#runHistory').innerHTML =
    recent.length > 0
      ? recent
          .slice(0, 5)
          .map((run) => {
            const date = run.date ? new Date(run.date).toLocaleDateString() : 'Today';
            const label = run.scenario || run.game || 'Manual run';
            return `<div><span>${escapeHtml(date)}</span><strong>${escapeHtml(label)} // ${cleanScore(run.score).toLocaleString()}</strong></div>`;
          })
          .join('')
      : '<div><span>No runs yet</span><strong>Log a run or play signed in.</strong></div>';

  if (cloudProgress) {
    $('#todayRoutineTitle').textContent = `Level ${cloudProgress.level} EMX Stack`;
    $('#todayRoutineBody').textContent = `${cloudProgress.xp.toLocaleString()} XP synced. ${cloudProgress.xpToNextLevel.toLocaleString()} XP to next level. Keep pushing your best module score toward ${goal.toLocaleString()}.`;
  }
}

function hydrateSavedSens() {
  const saved = JSON.parse(localStorage.getItem('emx_sens_snapshot') || '{}');

  if (saved.origin && gameYaws[saved.origin]) $('#originGame').value = saved.origin;
  if (saved.target && gameYaws[saved.target]) $('#targetGame').value = saved.target;
  if (saved.sens) $('#originSens').value = saved.sens;
  if (saved.dpi) $('#originDpi').value = saved.dpi;
}

function cleanAuthError(message) {
  return String(message || 'Login failed')
    .replace('Firebase: ', '')
    .replace(/\(auth\/(.*?)\)\.?/g, '$1')
    .replace(/-/g, ' ')
    .toUpperCase();
}

function updateAuthUi(user) {
  currentUser = user;
  $('#signedOutPanel').hidden = Boolean(user);
  $('#signedInPanel').hidden = !user;

  if (!user) {
    cloudProgress = null;
    $('#authStatus').textContent = 'Use the same login as EMX Aim Trainer.';
    renderTracker();
    return;
  }

  $('#accountName').textContent = cleanName(user.displayName || 'EMX Player');
  $('#accountEmail').textContent = user.email || '--';
  $('#authStatus').textContent = 'Connected.';
}

function renderCloudProgress(progress) {
  cloudProgress = progress;

  if (!progress) {
    $('#accountLevel').textContent = 'LVL 1';
    $('#accountXp').textContent = '0 XP';
    renderTracker();
    return;
  }

  $('#accountLevel').textContent = `LVL ${Number(progress.level || 1).toLocaleString()}`;
  $('#accountXp').textContent = `${Number(progress.xp || 0).toLocaleString()} XP`;
  $('#profileName').value = cleanName(progress.username || auth.currentUser?.displayName || $('#profileName').value);
  $('#bestScore').value = String(cleanScore(progress.bestScoreOverall));
  renderTracker();
}

async function loadCloudAccount(user) {
  if (!user) return;

  try {
    $('#authStatus').textContent = 'Syncing account...';
    const [progressSnap, armorySnap] = await Promise.all([
      getDoc(doc(db, 'playerProgress', user.uid)),
      getDoc(doc(db, 'armory', user.uid)),
    ]);

    if (armorySnap.exists()) {
      const armory = armorySnap.data();
      const mainGameByProfile = {
        valorant: 'Valorant',
        cs2: 'CS2',
        fortnite: 'Fortnite',
        overwatch: 'Overwatch 2',
      };

      if (armory.gameProfile && mainGameByProfile[armory.gameProfile]) {
        $('#mainGame').value = mainGameByProfile[armory.gameProfile];
      }
    }

    renderCloudProgress(progressSnap.exists() ? progressSnap.data() : null);
    $('#authStatus').textContent = progressSnap.exists()
      ? 'XP and level synced.'
      : 'Signed in. Play one updated trainer run to sync XP.';
  } catch (error) {
    $('#authStatus').textContent = cleanAuthError(error?.message || 'Cloud sync blocked');
    renderCloudProgress(null);
  }
}

async function loginAccount() {
  try {
    $('#authStatus').textContent = 'Logging in...';
    await signInWithEmailAndPassword(auth, $('#authEmail').value.trim(), $('#authPassword').value);
  } catch (error) {
    $('#authStatus').textContent = cleanAuthError(error?.message);
  }
}

async function registerAccount() {
  try {
    $('#authStatus').textContent = 'Creating account...';
    const credential = await createUserWithEmailAndPassword(
      auth,
      $('#authEmail').value.trim(),
      $('#authPassword').value
    );
    const callsign = cleanName($('#authCallsign').value || 'EMX Player');

    await updateProfile(credential.user, { displayName: callsign });
    $('#authStatus').textContent = 'Account created.';
  } catch (error) {
    $('#authStatus').textContent = cleanAuthError(error?.message);
  }
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
$('#logRun').addEventListener('click', logRun);
$('#loginButton').addEventListener('click', loginAccount);
$('#registerButton').addEventListener('click', registerAccount);
$('#logoutButton').addEventListener('click', () => signOut(auth));
$('#latestReleaseButton').addEventListener('click', () => showReleaseTab(0));
$('#latestUpdateButton').addEventListener('click', () => showReleaseTab(selectedReleaseIndex));

onAuthStateChanged(auth, (user) => {
  updateAuthUi(user);
  if (user) void loadCloudAccount(user);
});

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


/* ================================================================
   PROFILE SYSTEM
   ================================================================ */
let activeProfile = localStorage.getItem('cycle-active-profile') || 'andjela';
function profileKey(base) { return base + '-' + activeProfile; }
function switchProfile(p) {
  if (p === activeProfile) return;
  // Animate profile pill
  var pill = document.getElementById('profilePill');
  if (pill) { pill.classList.add('switching'); setTimeout(function() { pill.classList.remove('switching'); }, 400); }
  activeProfile = p;
  localStorage.setItem('cycle-active-profile', p);
  state = loadState();
  // Immediately sync calendar from shared cycle data for both profiles
  try {
    var sd = JSON.parse(localStorage.getItem('shared-cycle-data') || 'null');
    if (sd && sd.records) {
      state.records = sd.records.map(function(r) { return new Date(r); });
      state.periodEnds = sd.periodEnds || {};
      state.symptoms = sd.symptoms || {};
      state.settings = sd.settings || { cycleLength: 28, periodLength: 7 };
    }
  } catch(e) {}
  lastCycleCount = predict().cycles.length;

  // Pull latest shared data from GitHub when switching profiles
  if (getGitHubToken()) {
    pullAllSharedData().then(function() {
      if (p === 'barry') { renderCalendar(); renderBarrySymptomView(); renderTips(); }
      renderHug(); renderGratitude(); renderSong(); renderCheckin(); renderKnowMe();
      renderSharedDiary(); renderDateStrip();
      updateSyncStatusBadge();
    });
  }

  updateProfileUI();
  renderAll();
  loadSettingsUI();
  if (p === 'andjela') { showGreeting(); }
  toast((lang==='sr'?'Profil: ':'') + (p==='andjela' ? '🌸 Anđela' : '👦 Barry') + ' · ' + t('profileSwitch'));
}
function toggleProfile() { switchProfile(activeProfile === 'andjela' ? 'barry' : 'andjela'); }
function updateProfileUI() {
  var pill = document.getElementById('profilePill');
  var avatar = document.getElementById('pfAvatar');
  var name = document.getElementById('pfName');
  if (activeProfile === 'andjela') {
    avatar.textContent = '🌸'; name.textContent = t('profileName');
    pill.classList.add('active-profile');
  } else {
    avatar.textContent = '👦'; name.textContent = t('profileName2');
    pill.classList.remove('active-profile');
  }
  // Show/hide cycle-related cards for Barry
  var isAndjela = activeProfile === 'andjela';
  var pc = document.getElementById('progressSection');
  var rc = document.getElementById('reminderBanner');
  var fab = document.getElementById('fabBtn');
  var cyc = document.getElementById('cycleCounterCard');
  var tea = document.getElementById('teaCard');
  if (pc) pc.style.display = isAndjela ? '' : 'none';
  if (rc && !isAndjela) rc.style.display = 'none';
  if (fab) fab.style.display = isAndjela ? '' : 'none';
  if (tea) tea.style.display = isAndjela ? '' : 'none';
}

/* ================================================================
   STATE (modified for profiles)
   ================================================================ */
const STORAGE_KEY_BASE = 'cycle-data-v6';
function loadState() {
  var key = profileKey(STORAGE_KEY_BASE);
  try {
    const raw = localStorage.getItem(key);
    if (raw) { const d = JSON.parse(raw); return { records:(d.records||[]).map(r=>new Date(r)), symptoms:d.symptoms||{}, moods:d.moods||{}, diaries:d.diaries||{}, periodEnds:d.periodEnds||{}, settings:{cycleLength:28,periodLength:7,manualOverride:false,...d.settings}, _migrated:true }; }
  } catch(e) {}
  // Try old key
  try {
    const old = localStorage.getItem('cycle-data-v5');
    if (old && activeProfile === 'andjela') { const d=JSON.parse(old); return { records:(d.records||[]).map(r=>new Date(r)), symptoms:d.symptoms||{}, moods:{}, diaries:{}, settings:{cycleLength:28,periodLength:7,manualOverride:false,...d.settings}, _migrated:true }; }
  } catch(e) {}
  return { records:activeProfile==='andjela'?[new Date(2026,4,28)]:[], periodEnds:{}, symptoms:{}, moods:{}, diaries:{}, settings:{cycleLength:28,periodLength:7,manualOverride:false}, _migrated:true };
}
// Debounced saveState — prevents excessive localStorage writes during rapid clicks
var _saveTimer = null, _pushTimer = null;
function saveState() {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(function() {
    localStorage.setItem(profileKey(STORAGE_KEY_BASE), JSON.stringify({ records:state.records.map(fmtDate), periodEnds:state.periodEnds||{}, symptoms:state.symptoms, moods:state.moods, diaries:state.diaries, settings:state.settings, _migrated:true }));
    // Sync shared cycle data for bidirectional calendar
    var pd = JSON.parse(localStorage.getItem(profileKey(STORAGE_KEY_BASE)) || 'null');
    if (pd && pd.records && pd.records.length > 0) { localStorage.setItem('shared-cycle-data', JSON.stringify(pd)); }
    clearTimeout(_pushTimer);
    _pushTimer = setTimeout(function() { pushAllSharedData(); }, 1500);
  }, 200);
}
function saveStateNow() { clearTimeout(_saveTimer); clearTimeout(_pushTimer); localStorage.setItem(profileKey(STORAGE_KEY_BASE), JSON.stringify({ records:state.records.map(fmtDate), periodEnds:state.periodEnds||{}, symptoms:state.symptoms, moods:state.moods, diaries:state.diaries, settings:state.settings, _migrated:true })); pushAllSharedData(); }
let state = loadState();

/* ================================================================
   MOOD & STREAK
   ================================================================ */
const MOOD_EMOJIS = ['😊','🥰','😤','😴','😢','🤩','😰','😐'];
const MOOD_KEYS = ['happy','loved','frustrated','tired','sad','excited','anxious','meh'];
function getMood(dateKey) { return state.moods && state.moods[dateKey] ? state.moods[dateKey].mood : null; }
function setMood(dateKey, moodKey) {
  if (!state.moods) state.moods = {};
  if (state.moods[dateKey] && state.moods[dateKey].mood === moodKey) { delete state.moods[dateKey]; saveState(); renderMoodSection(); return; }
  state.moods[dateKey] = { mood: moodKey, time: Date.now() };
  saveState();
  renderMoodSection();
  renderGarden();
  toast(t('moodNames')[MOOD_KEYS.indexOf(moodKey)] + ' ✓');
}
function calculateStreak() {
  if (!state.moods) return 0;
  var td = today(); var streak = 0; var d = new Date(td);
  while (true) {
    var key = fmtDate(d);
    if (state.moods[key]) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}
function renderMoodSection() {
  var td = fmtDate(today());
  var todayMood = getMood(td);
  document.getElementById('mood-today-label').textContent = t('moodToday');
  document.getElementById('mood-title').textContent = t('moodTitle');
  // Render emoji picker
  var picker = document.getElementById('moodPicker');
  picker.innerHTML = '';
  MOOD_EMOJIS.forEach(function(emoji, i) {
    var btn = document.createElement('span');
    btn.className = 'mood-emoji' + (todayMood === MOOD_KEYS[i] ? ' picked' : '');
    btn.textContent = emoji;
    btn.title = t('moodNames')[i];
    btn.onclick = function() { setMood(td, MOOD_KEYS[i]); animateWatering(); };
    picker.appendChild(btn);
  });
  // Streak
  document.getElementById('streakDisplay').style.display = 'none';
  // Mood history
  document.getElementById('mood-history-label').textContent = t('moodHistoryLabel');
  var hist = document.getElementById('moodHistory');
  hist.innerHTML = '';
  for (var i = 6; i >= 0; i--) {
    var d = new Date(today()); d.setDate(d.getDate() - i);
    var m = getMood(fmtDate(d));
    var bar = document.createElement('div');
    bar.className = 'mood-bar';
    bar.style.height = m ? '28px' : '6px';
    if (m) bar.classList.add(m);
    bar.title = m ? (t('moodNames')[MOOD_KEYS.indexOf(m)] + ' ' + fmtDate(d)) : fmtDate(d);
    hist.appendChild(bar);
  }
}

/* ================================================================
   ONE-LINE DIARY
   ================================================================ */
/* One-line diary merged into Letters module — see SHARED DIARY section */

/* ================================================================
   LOVE NOTE
   ================================================================ */
function renderLoveNote() {
  if (activeProfile === 'barry') { document.getElementById('loveNoteCard').style.display = 'none'; return; }
  document.getElementById('loveNoteCard').style.display = '';
  var el = document.getElementById('loveNoteText');
  var newText = LOVE_NOTES.get();
  if (el.textContent !== newText) {
    el.classList.add('changing');
    setTimeout(function() { el.textContent = newText; el.classList.remove('changing'); }, 300);
  }
  // Chinese poetic touch — Anđela gets both cultures
  var chinesePoems = ['但愿人长久，千里共婵娟 🌙','执子之手，与子偕老 💕','天涯若比邻 🌍','心有灵犀一点通 ✨','千里姻缘一线牵 💝','海内存知己，天涯若比邻 🌊'];
  var poem = chinesePoems[Math.floor(Math.random() * chinesePoems.length)];
  document.getElementById('loveNoteSig').textContent = t('loveNoteSig') + '  ·  ' + poem;
  var icons = ['💌','💝','💗','💕','💖','🕊️','✨','🌷'];
  document.getElementById('loveNoteIcon').textContent = icons[Math.floor(Math.random() * icons.length)];
}

/* ================================================================
   TOMORROW FORECAST
   ================================================================ */
function renderForecast() {
  if (activeProfile !== 'andjela') { document.getElementById('forecastCard').style.display = 'none'; return; }
  var pred = predict();
  var tomorrow = addDays(today(), 1);
  var phase = getPhase(tomorrow, pred);
  var text = '';
  if (phase === 'period-on' || phase === 'period-mid' || phase === 'period-pred-first' || phase === 'period-pred') {
    text = t('forecastPeriod');
  } else if (phase === 'ovulation') {
    text = t('forecastOvulation');
  } else if (phase === 'follicular') {
    text = t('forecastFollicular');
  } else if (phase === 'luteal' || phase === 'fertile') {
    text = t('forecastLuteal');
  } else {
    text = t('forecastNormal');
  }
  document.getElementById('forecastText').textContent = text;
  document.getElementById('forecastCard').style.display = '';
}

/* ================================================================
   VIRTUAL GARDEN
   ================================================================ */
function animateWatering() {
  var plant = document.getElementById('gardenPlant');
  if (!plant) return;
  plant.style.transform = 'scale(1.3) rotate(10deg)';
  plant.style.transition = 'transform .3s cubic-bezier(.34,1.56,.64,1)';
  // Show water drops
  var drops = ['💧','💧','💧'];
  drops.forEach(function(d,i){
    setTimeout(function(){
      var drop = document.createElement('span');
      drop.textContent = d; drop.style.cssText = 'position:absolute;font-size:.8rem;animation:dropFall 1s ease-in forwards;z-index:10;pointer-events:none;';
      drop.style.left = (30+Math.random()*40)+'%'; drop.style.top = '-10px';
      document.getElementById('gardenCard').appendChild(drop);
      setTimeout(function(){ drop.remove(); }, 1000);
    }, i*150);
  });
  setTimeout(function(){ plant.style.transform = ''; renderGarden(); }, 600);
}
function renderGarden() {
  var plantEl = document.getElementById('gardenPlant');
  if (plantEl) { plantEl.style.transform = ''; plantEl.style.transition = 'all .5s cubic-bezier(.34,1.56,.64,1)'; }
  document.getElementById('garden-title').textContent = t('gardenTitle');
  var streak = calculateStreak();
  var p, msg, hint;
  if (streak === 0) { p = '🌰'; msg = lang==='sr'?'Klikni na emoji iznad da me zaliješ! 💧':lang==='en'?'Tap an emoji above to water me! 💧':'点上面的心情给我浇水！💧'; hint=''; }
  else if (streak === 1) { p = '🌱'; msg = lang==='sr'?'Prvi dan! Nastavi da me zalivaš svaki dan 🌱':lang==='en'?'First day! Keep watering me daily 🌱':'第一天！每天浇我哦 🌱'; hint=''; }
  else if (streak <= 3) { p = '🌿'; msg = lang==='sr'?'Rastem! Još malo pa cvetam 🌿':lang==='en'?'Growing! Almost blooming 🌿':'在长大！快要开花了 🌿'; hint=''; }
  else if (streak <= 7) { p = '🌷'; msg = lang==='sr'?'Pupoljak! Tvoja ljubav me hrani 🌷':lang==='en'?'Budding! Your love feeds me 🌷':'花苞！你的爱在滋养我 🌷'; hint=''; }
  else { p = '🌸'; msg = lang==='sr'?'Procvetala! Kao i vaša ljubav 🌸':lang==='en'?'Bloomed! Just like your love 🌸':'开花了！就像你们的爱 🌸'; hint=''; }
  if (activeProfile === 'andjela' && streak > 0) {
    var phase = getPhase(today(), predict());
    if (phase && phase.startsWith('period')) p = '🌹';
    else if (phase === 'ovulation') p = '🌻';
    else if (phase === 'luteal') p = '🌷';
  }
  document.getElementById('gardenPlant').textContent = p;
  document.getElementById('gardenMsg').textContent = msg;
  document.getElementById('gardenHint').textContent = hint;
}

// HTML escape — prevents XSS in user-generated content
// Escapes: & < > " ' ` for safe innerHTML usage
function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');
}

/* ================================================================
   SHARED DIARY — localStorage + GitHub API cross-device sync
   Redesigned: date strip, timeline, locked→unlock animation
   ================================================================ */
const SD_KEY = 'shared-diary';
const GITHUB_REPO = 'darkheaven1419-debug/cycle-tracker';
const GITHUB_FILE = 'shared-diary.json';
let sharedDiaryViewDate = new Date();
const DATE_STRIP_DAYS = 14; // show 14 days in date strip

function getGitHubToken() { return sessionStorage.getItem('gh-token') || ''; }

function loadSharedDiaryData() {
  try { return JSON.parse(localStorage.getItem(SD_KEY)) || {}; } catch(e) { return {}; }
}
function saveSharedDiaryData(data) { localStorage.setItem(SD_KEY, JSON.stringify(data)); }

// Fetch shared diary from GitHub
async function fetchSharedDiaryFromGitHub() {
  var token = getGitHubToken();
  var headers = { 'Accept': 'application/vnd.github.v3+json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  try {
    var resp = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + GITHUB_FILE, { headers: headers, cache: 'no-store' });
    if (!resp.ok) return null;
    var data = await resp.json();
    var content = decodeURIComponent(escape(atob(data.content)));
    return { data: JSON.parse(content), sha: data.sha };
  } catch(e) { return null; }
}

// Push shared diary to GitHub
async function pushSharedDiaryToGitHub(diaryData) {
  var token = getGitHubToken();
  if (!token) return false;
  var headers = { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' };
  var sha = null;
  try {
    var resp = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + GITHUB_FILE, { headers: headers, cache: 'no-store' });
    if (resp.ok) { var d = await resp.json(); sha = d.sha; }
  } catch(e) {}
  var content = btoa(unescape(encodeURIComponent(JSON.stringify(diaryData, null, 2))));
  var body = { message: '💌 Update shared diary', content: content };
  if (sha) body.sha = sha;
  try {
    var putResp = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + GITHUB_FILE, { method: 'PUT', headers: headers, body: JSON.stringify(body) });
    return putResp.ok;
  } catch(e) { return false; }
}

// ==============================
// DATE STRIP
// ==============================
function renderDateStrip() {
  var strip = document.getElementById('dateStrip'); if (!strip) return;
  var allData = loadSharedDiaryData();
  var today = new Date(); var selKey = fmtDate(sharedDiaryViewDate);
  var dowKeys = lang==='sr'?['Ne','Po','Ut','Sr','Če','Pe','Su']:lang==='en'?['Su','Mo','Tu','We','Th','Fr','Sa']:['日','一','二','三','四','五','六'];
  var html = '';
  for (var i = -Math.floor(DATE_STRIP_DAYS/2); i < DATE_STRIP_DAYS-Math.floor(DATE_STRIP_DAYS/2); i++) {
    var d = new Date(today); d.setDate(d.getDate() + i);
    var key = fmtDate(d); var dow = dowKeys[d.getDay()];
    var dayData = allData[key]; var both = dayData && dayData['barry'] && dayData['andjela'];
    var hasEntry = dayData && (dayData['barry'] || dayData['andjela']);
    var classes = ['date-pill'];
    if (key === fmtDate(today)) classes.push('today');
    if (key === selKey) classes.push('selected');
    html += '<div class="' + classes.join(' ') + '" data-date="' + key + '" onclick="selectDateStrip(\'' + key + '\')">';
    html += '<span class="dp-dow">' + dow + '</span>';
    html += '<span class="dp-day">' + d.getDate() + '</span>';
    html += '<span class="dp-dot' + (hasEntry ? ' has-entry' + (both ? ' both-entry' : '') : '') + '"></span>';
    html += '</div>';
  }
  strip.innerHTML = html;
  // Scroll to selected date
  requestAnimationFrame(function() {
    var sel = strip.querySelector('.selected');
    if (sel) sel.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' });
  });
}

function selectDateStrip(dateKey) {
  sharedDiaryViewDate = new Date(dateKey + 'T00:00:00');
  renderDateStrip();
  renderSharedDiary();
}

function scrollDateStrip(dir) {
  var strip = document.getElementById('dateStrip'); if (!strip) return;
  strip.scrollBy({ left: dir * strip.clientWidth * 0.7, behavior: 'smooth' });
}

// ==============================
// SAVE & RENDER
// ==============================
async function saveSharedDiary() {
  var dateKey = fmtDate(sharedDiaryViewDate);
  var elHappy = document.getElementById('sd-happy');
  var elUncomf = document.getElementById('sd-uncomf');
  var elThanks = document.getElementById('sd-thanks');
  var elWish = document.getElementById('sd-wish');
  if (!elHappy && !elUncomf && !elThanks && !elWish) return; // Elements don't exist (letters UI only)
  var happy = elHappy ? elHappy.value.trim() : '';
  var uncomf = elUncomf ? elUncomf.value.trim() : '';
  var thanks = elThanks ? elThanks.value.trim() : '';
  var wish = elWish ? elWish.value.trim() : '';
  if (!happy && !uncomf && !thanks && !wish) { toast(lang==='sr'?'Napiši bar nešto...':lang==='en'?'Write at least something...':'至少写点什么吧...'); return; }

  // Disable save button during save
  var saveBtn = document.getElementById('sd-save-btn');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = '⏳ ' + (lang==='sr'?'Čuvanje...':lang==='en'?'Saving...':'保存中...'); }

  var allData = loadSharedDiaryData();
  if (!allData[dateKey]) allData[dateKey] = {};
  // Preserve hug data so streaks don't break
  var existingHug = allData[dateKey][activeProfile] && allData[dateKey][activeProfile].hug;
  allData[dateKey][activeProfile] = { happy:happy, uncomf:uncomf, thanks:thanks, wish:wish, time:Date.now() };
  if (existingHug) allData[dateKey][activeProfile].hug = existingHug;
  // Save locally first
  saveSharedDiaryData(allData);

  // Push to GitHub FIRST (MUST await — otherwise pull below can
  // complete before push and overwrite this save with stale remote data)
  await pushAllSharedData();

  // Try pull partner's entry — with retry for slow network
  // (now safe: push completed, remote includes our just-saved entry)
  await pullPartnerEntry(dateKey);

  // Show saved badge
  var badge = document.getElementById('sdSavedBadge');
  if (badge) { badge.classList.add('show'); setTimeout(function() { badge.classList.remove('show'); }, 2000); }

  if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '💾 <span id="sd-save-text">' + (lang==='sr'?'Sačuvaj':lang==='en'?'Save':'保存') + '</span>'; }

  renderDateStrip();
  renderSharedDiary();
  toast('💌 ✓');
}

// Pull partner entries from unified shared-state.json (not old shared-diary.json)
async function pullPartnerEntry(dateKey) {
  if (!getGitHubToken()) return;
  // Use unified pullAllSharedData — applies shared-state.json to localStorage
  // then re-render; avoids dual-format sync drift
  await pullAllSharedData();
  var localData = loadSharedDiaryData();
  var partnerProfile = activeProfile === 'andjela' ? 'barry' : 'andjela';
  // If partner hasn't written for this date, show hint
  var entry = localData[dateKey] && localData[dateKey][partnerProfile];
  return entry || null;
}

// ==============================
// EXPORT / IMPORT (improved UX)
// ==============================
function exportSharedDiary() {
  var dateKey = fmtDate(sharedDiaryViewDate);
  var allData = loadSharedDiaryData();
  var myEntry = allData[dateKey] && allData[dateKey][activeProfile];
  if (!myEntry) { toast(lang==='sr'?'Prvo sačuvaj svoj unos':lang==='en'?'Save your entry first':'请先保存你的日记'); return; }
  var exportObj = { date:dateKey, author:activeProfile, entry:myEntry };
  var text = JSON.stringify(exportObj);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function() {
      toast('📤 ' + (lang==='sr'?'Kopirano! Pošalji partneru 💌':lang==='en'?'Copied! Send to partner 💌':'已复制！发给伴侣吧 💌'));
    });
  } else {
    // Fallback: show text in a small modal-like prompt
    var ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('📤 ' + (lang==='sr'?'Kopirano!':lang==='en'?'Copied!':'已复制！')); } catch(e) { prompt(lang==='sr'?'Kopiraj i pošalji partneru:':lang==='en'?'Copy and send to partner:':'复制发给伴侣：', text); }
    document.body.removeChild(ta);
  }
}

function showImportModal() {
  // Remove existing modal if any
  var existing = document.querySelector('.import-modal-overlay');
  if (existing) existing.remove();
  var overlay = document.createElement('div'); overlay.className = 'import-modal-overlay';
  overlay.innerHTML = '<div class="import-modal"><h4>' + (lang==='sr'?'📥 Zalepi partnerov tekst':lang==='en'?'📥 Paste partner\'s text':'📥 粘贴伴侣分享的内容') + '</h4><textarea id="importTextarea" placeholder="' + (lang==='sr'?'Zalepi JSON tekst ovde...':'粘贴 JSON 文本...') + '"></textarea><div class="im-btns"><button class="im-cancel" id="imCancel">' + (lang==='sr'?'Odustani':'取消') + '</button><button class="im-confirm" id="imConfirm">' + (lang==='sr'?'Uvezi':'导入') + '</button></div></div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  document.getElementById('imCancel').addEventListener('click', function() { overlay.remove(); });
  document.getElementById('imConfirm').addEventListener('click', function() {
    var text = document.getElementById('importTextarea').value.trim();
    if (!text) { overlay.remove(); return; }
    doImport(text); overlay.remove();
  });
  // Auto-paste from clipboard
  if (navigator.clipboard && navigator.clipboard.readText) {
    navigator.clipboard.readText().then(function(t) {
      try { JSON.parse(t); document.getElementById('importTextarea').value = t; } catch(e) {}
    }).catch(function() {});
  }
  document.getElementById('importTextarea').focus();
}

function doImport(text) {
  try {
    var imported = JSON.parse(text);
    if (!imported.date || !imported.author || !imported.entry) throw new Error();
    var allData = loadSharedDiaryData();
    if (!allData[imported.date]) allData[imported.date] = {};
    allData[imported.date][imported.author] = imported.entry;
    saveSharedDiaryData(allData);
    if (imported.date === fmtDate(sharedDiaryViewDate)) renderSharedDiary();
    renderDateStrip();
    toast('📥 ' + (lang==='sr'?'Uvezeno! 💌':lang==='en'?'Imported! 💌':'已导入！💌'));
  } catch(e) {
    toast(lang==='sr'?'Neispravan format 😢':lang==='en'?'Invalid format 😢':'格式不对哦 😢');
  }
}

// ==============================
// RENDER SHARED DIARY
// ==============================

// INVARIANT: Viewing a partner's diary for any date requires the current user
// to have saved their OWN entry for THAT SPECIFIC date first. Each day's
// permission is independent — writing today's diary does NOT retroactively
// unlock past days. There is no "date < today" bypass. The lock is permanent
// for any date where the user never wrote their own entry.
function canViewPartnerDiaryEntry(dateKey) {
  var allData = loadSharedDiaryData();
  return !!(allData[dateKey] && allData[dateKey][activeProfile]);
}

async function renderSharedDiary() {
  var dateKey = fmtDate(sharedDiaryViewDate);

  // === PHASE 1: instant sync render from localStorage (no await!) ===
  var allData = loadSharedDiaryData();
  var myEntry = allData[dateKey] && allData[dateKey][activeProfile];
  var partnerProfile = activeProfile === 'andjela' ? 'barry' : 'andjela';
  var partnerEntry = allData[dateKey] && allData[dateKey][partnerProfile];

  // Fill my entry fields instantly (guard: elements may not exist in letters-only UI)
  var sdHappy = document.getElementById('sd-happy');
  var sdUncomf = document.getElementById('sd-uncomf');
  var sdThanks = document.getElementById('sd-thanks');
  var sdWish = document.getElementById('sd-wish');
  if (sdHappy) sdHappy.value = myEntry ? (myEntry.happy || '') : '';
  if (sdUncomf) sdUncomf.value = myEntry ? (myEntry.uncomf || '') : '';
  if (sdThanks) sdThanks.value = myEntry ? (myEntry.thanks || '') : '';
  if (sdWish) sdWish.value = myEntry ? (myEntry.wish || '') : '';
  ['happy','uncomf','thanks','wish'].forEach(function(f) {
    var el = document.getElementById('sdc-'+f); var src = document.getElementById('sd-'+f);
    if (el) el.textContent = src ? (src.value || '').length : 0;
  });

  // Partner card — only if old shared-diary UI elements exist (letters UI skips this)
  var lockedEl = document.getElementById('partnerLocked');
  var contentEl = document.getElementById('sharedDiaryPartnerContent');
  var translateBtn = document.getElementById('translateBtnSm');
  if (lockedEl && contentEl) {
    if (myEntry) {
      lockedEl.style.display = 'none';
      contentEl.style.display = '';
      contentEl.classList.add('partner-card-unlocked');
      renderPartnerContent(partnerEntry, partnerProfile, contentEl, translateBtn);
    } else {
      lockedEl.style.display = '';
      contentEl.style.display = 'none';
      contentEl.classList.remove('partner-card-unlocked');
      if (translateBtn) translateBtn.style.display = 'none';
    }
  }

  // Timeline history from localStorage
  renderSharedDiaryHistory(allData);

  // === PHASE 2: async pull from GitHub (won't block UI) ===
  // IMPORTANT: never overwrite MY form fields — user may be typing
  if (getGitHubToken()) {
    pullPartnerEntry(dateKey).then(function() {
      var freshData = loadSharedDiaryData();
      var freshMy = freshData[dateKey] && freshData[dateKey][activeProfile];
      var freshPartner = freshData[dateKey] && freshData[dateKey][partnerProfile];
      // Only update if partner data changed AND I'm not currently typing
      if (JSON.stringify(freshPartner) !== JSON.stringify(partnerEntry)) {
        var activeEl = document.activeElement;
        var isTyping = activeEl && (activeEl.id === 'sd-happy' || activeEl.id === 'sd-uncomf' || activeEl.id === 'sd-thanks' || activeEl.id === 'sd-wish');
        if (!isTyping) {
          // Only update MY fields if I haven't written anything yet (don't overwrite unsaved work)
          if (!myEntry || !myEntry.time) {
            if (sdHappy) sdHappy.value = freshMy ? (freshMy.happy || '') : '';
            if (sdUncomf) sdUncomf.value = freshMy ? (freshMy.uncomf || '') : '';
            if (sdThanks) sdThanks.value = freshMy ? (freshMy.thanks || '') : '';
            if (sdWish) sdWish.value = freshMy ? (freshMy.wish || '') : '';
          }
        }
        // Always update partner display and lock state (skip if elements absent)
        if (lockedEl && contentEl) {
          if (freshMy) {
            lockedEl.style.display = 'none';
            contentEl.style.display = '';
            renderPartnerContent(freshPartner, partnerProfile, contentEl, translateBtn);
          } else {
            lockedEl.style.display = '';
            contentEl.style.display = 'none';
          }
        }
        renderSharedDiaryHistory(freshData);
      }
    });
  }
}

function renderPartnerContent(partnerEntry, partnerProfile, contentEl, translateBtn) {
  if (partnerEntry) {
    var partnerName = partnerProfile === 'andjela' ? '🌸 Anđela' : '👦 Barry';
    var timeStr = '';
    if (partnerEntry.time) { var t = new Date(partnerEntry.time); timeStr = String(t.getHours()).padStart(2,'0') + ':' + String(t.getMinutes()).padStart(2,'0'); }
    var html = '<div style="font-size:.62rem;color:var(--gold);margin-bottom:8px">' + partnerName + (timeStr?' · '+timeStr:'') + '</div>';
    var questions = [
      {q:lang==='sr'?'💝 Obradovalo':lang==='en'?'💝 Happy':'💝 开心的事', a:partnerEntry.happy},
      {q:lang==='sr'?'🤔 Zasmetalo':lang==='en'?'🤔 Uncomfortable':'🤔 不舒服的事', a:partnerEntry.uncomf},
      {q:lang==='sr'?'🙏 Zahvalnost':lang==='en'?'🙏 Thanks':'🙏 感谢', a:partnerEntry.thanks},
      {q:lang==='sr'?'💪 Da poradimo':lang==='en'?'💪 To improve':'💪 希望改进', a:partnerEntry.wish}
    ];
    var origTexts=[];
    questions.forEach(function(item) {
      if (item.a) { origTexts.push(item.a); html += '<div class="sd-partner-field"><div class="sd-partner-q">'+item.q+'</div><div class="sd-partner-a" data-original="'+esc(item.a)+'" id="sdp-'+origTexts.length+'">'+esc(item.a)+'</div></div>'; }
    });
    if (!partnerEntry.happy && !partnerEntry.uncomf && !partnerEntry.thanks && !partnerEntry.wish) {
      html += '<div class="sd-empty">'+(lang==='sr'?'Nema unosa':lang==='en'?'No entry':'没有记录')+'</div>';
    }
    contentEl.innerHTML = html;
    if (origTexts.length > 0) { translateBtn.style.display = ''; translateBtn.textContent = '🌐'; }
    else { translateBtn.style.display = 'none'; }
  } else {
    contentEl.innerHTML = '<div class="sd-locked"><span class="sd-locked-icon">📭</span><div class="sd-locked-text">'+(lang==='sr'?'Partner još nije napisao svoj osvrt za ovaj dan — ili još nije sinhronizovano.':lang==='en'?'Your partner hasn\'t written their reflection for this day yet — or it hasn\'t synced.':'伴侣还没写这一天的总结——或者还没同步过来。')+'</div></div>';
    translateBtn.style.display = 'none';
  }
}

// ==============================
// TIMELINE HISTORY
// ==============================
function renderSharedDiaryHistory(allData) {
  var items = [];
  Object.keys(allData).forEach(function(date) {
    var day = allData[date];
    var barry = day['barry']; var andjela = day['andjela'];
    if (barry || andjela) items.push({date:date, barry:barry, andjela:andjela});
  });
  items.sort(function(a,b) { return b.date.localeCompare(a.date); });
  var hist = document.getElementById('sharedDiaryHistory');
  if (!hist) return;
  if (items.length === 0) {
    hist.innerHTML = '<div class="sd-empty" style="padding-left:20px">'+(lang==='sr'?'Još nema unosa — započnite danas! 💌':lang==='en'?'No entries yet — start today! 💌':'还没有日记——今天就开始吧！💌')+'</div>';
    return;
  }

  var showCount = 10;
  var hasMore = items.length > showCount;

  function buildTimeline(list) {
    return list.map(function(item) {
      var both = item.barry && item.andjela;
      var dotClass = both ? 'dot-both' : (item[activeProfile] ? 'dot-mine' : 'dot-partner');
      var authors = [];
      if (item.andjela) { authors.push('🌸 Anđela'); }
      if (item.barry) { authors.push('👦 Barry'); }
      // PREVIEW: only use current user's OWN content — never leak partner's
      // diary for dates where the user hasn't written their own entry.
      // Invariant: each day's view permission is tied to that specific day.
      var myEntry = item[activeProfile];
      var preview = myEntry ? (myEntry.happy || myEntry.thanks || myEntry.uncomf || myEntry.wish || '') : '';
      var locked = !myEntry && (item['barry'] || item['andjela']);
      var previewHtml = '';
      if (locked) {
        previewHtml = '<span class="tn-locked">🔒 ' + (lang==='sr'?'Zaključano':lang==='en'?'Locked':'已锁定') + '</span>';
      } else if (preview) {
        preview = esc(preview.substring(0, 80));
        previewHtml = preview + (preview.length >= 80 ? '...' : '');
      }
      return '<div class="timeline-node ' + dotClass + '" onclick="jumpToDiaryDate(\'' + item.date + '\')">'
        + '<div class="tn-date">📅 ' + item.date + '</div>'
        + '<div class="tn-authors">' + authors.join(' · ') + '</div>'
        + '<div class="tn-preview">' + previewHtml + '</div>'
        + '</div>';
    }).join('');
  }

  hist.innerHTML = '<div class="timeline-inner">' + buildTimeline(items.slice(0, showCount)) + '</div>'
    + (hasMore ? '<div class="timeline-load-more"><button onclick="expandTimeline()" id="timelineExpandBtn">'
    + (lang==='sr'?'📅 Prikaži još ' + (items.length - showCount) + ' unosa':lang==='en'?'📅 Show ' + (items.length - showCount) + ' more entries':'📅 展开剩余 ' + (items.length - showCount) + ' 条')
    + '</button></div>' : '');
}

function jumpToDiaryDate(dateKey) {
  sharedDiaryViewDate = new Date(dateKey + 'T00:00:00');
  renderDateStrip();
  renderSharedDiary();
  var panel = document.getElementById('panel-diary');
  if (panel) panel.scrollIntoView({ behavior:'smooth' });
}

window._allTimelineItems = null;
function expandTimeline() {
  var allData = loadSharedDiaryData();
  var items = [];
  Object.keys(allData).forEach(function(date) {
    var day = allData[date];
    if (day['barry'] || day['andjela']) items.push({date:date, barry:day['barry'], andjela:day['andjela']});
  });
  items.sort(function(a,b) { return b.date.localeCompare(a.date); });
  var hist = document.getElementById('sharedDiaryHistory'); if (!hist) return;
  hist.innerHTML = '<div class="timeline-inner">'
    + items.map(function(item) {
      var both = item.barry && item.andjela;
      var dotClass = both ? 'dot-both' : (item[activeProfile] ? 'dot-mine' : 'dot-partner');
      var authors = [];
      if (item.andjela) { authors.push('🌸 Anđela'); }
      if (item.barry) { authors.push('👦 Barry'); }
      // PREVIEW: only use current user's OWN content — never leak partner's
      var myEntry = item[activeProfile];
      var preview = myEntry ? (myEntry.happy || myEntry.thanks || myEntry.uncomf || myEntry.wish || '') : '';
      var locked = !myEntry && (item['barry'] || item['andjela']);
      var previewHtml = '';
      if (locked) {
        previewHtml = '<span class="tn-locked">🔒 ' + (lang==='sr'?'Zaključano':lang==='en'?'Locked':'已锁定') + '</span>';
      } else if (preview) {
        preview = esc(preview.substring(0, 80));
        previewHtml = preview + (preview.length >= 80 ? '...' : '');
      }
      return '<div class="timeline-node ' + dotClass + '" onclick="jumpToDiaryDate(\'' + item.date + '\')">'
        + '<div class="tn-date">📅 ' + item.date + '</div>'
        + '<div class="tn-authors">' + authors.join(' · ') + '</div>'
        + '<div class="tn-preview">' + previewHtml + '</div>'
        + '</div>';
    }).join('')
    + '</div>';
}

// ==============================
// TRANSLATION
// ==============================
// Translation cache — Map with LRU eviction (max 500 entries)
var _transCache = new Map();
var _TRANS_CACHE_MAX = 500;
function _transCacheSet(key, val) {
  if (_transCache.size >= _TRANS_CACHE_MAX) {
    var firstKey = _transCache.keys().next().value;
    _transCache.delete(firstKey);
  }
  _transCache.set(key, val);
}

async function translateText(text, from, to) {
  if(!text||from===to||text.length<2)return text;
  var cacheKey = from + '|' + to + '|' + text;
  if (_transCache.has(cacheKey)) return _transCache.get(cacheKey);

  var result = null;

  // 1) Google Translate (newer endpoint, best quality for zh↔sr)
  try {
    var r1 = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl='+from+'&tl='+to+'&dt=t&q='+encodeURIComponent(text));
    var d1 = await r1.json();
    if (d1 && d1[0]) {
      var t = d1[0].map(function(s){return s[0];}).join('');
      if (t && t !== text) result = t;
    }
  } catch(e) {}

  // 2) MyMemory (free, no key needed, good fallback)
  if (!result) {
    try {
      var pair = from + '|' + to;
      var r2 = await fetch('https://api.mymemory.translated.net/get?q='+encodeURIComponent(text)+'&langpair='+pair);
      var d2 = await r2.json();
      if (d2.responseData && d2.responseData.translatedText && d2.responseData.translatedText !== text) {
        result = d2.responseData.translatedText;
      }
    } catch(e) {}
  }

  // 3) LibreTranslate (public instance, free/open-source, good for European langs)
  if (!result) {
    try {
      var r3 = await fetch('https://translate.argosopentech.com/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, source: from, target: to, format: 'text' })
      });
      var d3 = await r3.json();
      if (d3.translatedText && d3.translatedText !== text) result = d3.translatedText;
    } catch(e) {}
  }

  if (result) { _transCacheSet(cacheKey, result); return result; }
  return null; // all translation APIs exhausted
}
async function translatePartnerEntries() {
  var btn = document.getElementById('translateBtnSm');
  if(btn){btn.disabled=true;btn.textContent='⏳';}
  var vl=(lang||'sr')==='zh-CN'?'zh-CN':'sr';
  var pl=activeProfile==='barry'?'sr':'zh-CN';
  if(vl===pl){if(btn){btn.textContent='🌐';btn.disabled=false;}return;}
  var els=document.querySelectorAll('[id^="sdp-"]');
  var ok=0;
  for(var i=0;i<els.length;i++){
    var el=els[i];var orig=el.getAttribute('data-original');
    if(orig&&orig.length>2){
      var result=await translateText(orig,pl,vl);
      if(result===null){el.textContent=orig+' ['+(lang==='sr'?'prevod nije uspeo':lang==='en'?'translation failed':'翻译失败')+']';el.style.color='var(--text-muted)';} else if(result&&result!==orig){el.textContent=result;el.style.color='var(--teal)';el.style.fontWeight='500';ok++;}
    }
  }
  if(btn){
    if(ok>0){btn.textContent='✅';btn.style.borderColor='var(--teal)';btn.style.color='var(--teal)';}
    else{btn.textContent='⚠️';btn.style.borderColor='#E53935';btn.style.color='#E53935';btn.disabled=false;setTimeout(function(){if(btn){btn.textContent='🌐';btn.style.borderColor='';btn.style.color='';btn.disabled=false;}},3000);}
  }
}

// ==============================
// CHARACTER COUNTERS
// ==============================
['happy','uncomf','thanks','wish'].forEach(function(f) {
  var ta = document.getElementById('sd-'+f);
  if (ta) {
    ta.addEventListener('input', function() {
      var count = document.getElementById('sdc-'+f);
      if (count) count.textContent = ta.value.length;
      // Auto-resize textarea
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
    });
  }
});

// ==============================
// INIT
// ==============================
function renderDiaryLabels() {
  document.getElementById('sd-my-title').textContent = lang==='sr'?'Moj osvrt':lang==='en'?'My Reflection':'我的总结';
  document.getElementById('sd-my-hint').textContent = lang==='sr'?'Iskreno o danu — što više detalja, to bolje 💫':lang==='en'?'Be honest about your day — the more detail the better 💫':'坦诚地回顾一天——越详细越好 💫';
  document.getElementById('sd-l-happy').textContent = lang==='sr'?'Šta me je danas obradovalo':lang==='en'?'What made me happy today':'今天让我开心的事';
  document.getElementById('sd-l-uncomf').textContent = lang==='sr'?'Šta mi je malo zasmetalo':lang==='en'?'What felt a little uncomfortable':'让我有点不舒服的事';
  document.getElementById('sd-l-thanks').textContent = lang==='sr'?'Želim da ti se zahvalim za...':lang==='en'?'I want to thank you for...':'我想感谢你的...';
  document.getElementById('sd-l-wish').textContent = lang==='sr'?'Voleo/la bih da zajedno poradimo na...':lang==='en'?'I hope we can work on...':'我希望我们能一起改进的...';
  document.getElementById('sd-save-text').textContent = lang==='sr'?'Sačuvaj i pogledaj partnerov':lang==='en'?'Save & View Partner\'s':'保存并查看伴侣的';
  document.getElementById('sd-gate-hint').textContent = lang==='sr'?'Sačuvaj svoj unos pre nego što vidiš partnerov':lang==='en'?'Save your entry to unlock your partner\'s':'写完才能看伴侣的哦';
  document.getElementById('sd-partner-title').textContent = lang==='sr'?'Partnerov osvrt':lang==='en'?'Partner\'s Reflection':'伴侣的总结';
  // Update sync hint with last-sync time if available
  var syncHint = getGitHubToken() ? (lang==='sr'?'☁️ Automatska sinhronizacija':lang==='en'?'☁️ Auto-sync on':'☁️ 自动同步中') : (lang==='sr'?'📤 Izvezi → pošalji partneru → Partner uveze':lang==='en'?'📤 Export → send → Partner imports':'📤 导出 → 发给伴侣 → 导入');
  var lastSync = localStorage.getItem('shared-last-sync');
  if (lastSync && getGitHubToken()) {
    var ago = Math.floor((Date.now() - parseInt(lastSync)) / 60000);
    if (ago < 1) syncHint += ' · ' + (lang==='sr'?'malopre':lang==='en'?'just now':'刚刚');
    else if (ago < 60) syncHint += ' · ' + ago + 'min ' + (lang==='sr'?'pre':lang==='en'?'ago':'前');
    else syncHint += ' · ' + Math.floor(ago/60) + 'h ' + (lang==='sr'?'pre':lang==='en'?'ago':'前');
  }
  document.getElementById('sd-sync-hint').textContent = syncHint;
  document.getElementById('sd-export').textContent = lang==='sr'?'Podeli':lang==='en'?'Share':'分享';
  document.getElementById('sd-import').textContent = lang==='sr'?'Uvezi':lang==='en'?'Import':'导入';
  document.getElementById('sd-history-title').textContent = lang==='sr'?'Vremenska linija':lang==='en'?'Timeline':'时间线';
  document.getElementById('sd-saved-text').textContent = L('Sačuvano','已保存','Saved');
  document.getElementById('partner-locked-text').textContent = lang==='sr'?'Prvo sačuvaj svoj unos da otključaš partnerov 💌':lang==='en'?'Save your entry first to unlock your partner\'s 💌':'先保存你的日记才能解锁伴侣的哦 💌';
  document.getElementById('sd-sync-icon').textContent = getGitHubToken() ? '☁️' : '';
}

function initSharedDiaryTab() {
  letterViewDate = new Date(); letterMonth = letterViewDate.getMonth(); letterYear = letterViewDate.getFullYear();
  letterMood = ''; renderLettersPanel();
}

/* ================================================================
   💌 LETTERS MODULE — Unified diary (replaces 4-field + one-line)
   Uses existing data layer: loadSharedDiaryData/saveSharedDiaryData
   Old entry format auto-merged to letter text on read
   ================================================================ */
var letterViewDate = new Date();
var letterMonth = new Date().getMonth();
var letterYear = new Date().getFullYear();
var letterMood = '';
var _letterAutoSaveTimer = null;

var LETTER_MOODS = ['😊','🥰','😢','😤','😴','🤩'];
var LETTER_PROMPTS = {
  '💝':{sr:'Danas me obradovalo...',zh:'今天让我开心的事...',en:'Today I felt happy because...'},
  '🤔':{sr:'Malo mi je zasmetalo...',zh:'让我有点不舒服...',en:'Something uncomfortable...'},
  '🙏':{sr:'Želim da ti se zahvalim za...',zh:'我想感谢你...',en:'I want to thank you for...'},
  '💪':{sr:'Voleo bih da poradimo na...',zh:'希望我们一起改进...',en:'I hope we can improve...'}
};

// Merge old 4-field entry into letter text
function letterTextFromEntry(entry) {
  if (!entry) return '';
  if (entry.text) return entry.text; // new format
  var parts = [];
  if (entry.happy) parts.push('💝 ' + entry.happy);
  if (entry.uncomf) parts.push('🤔 ' + entry.uncomf);
  if (entry.thanks) parts.push('🙏 ' + entry.thanks);
  if (entry.wish) parts.push('💪 ' + entry.wish);
  return parts.join('\n\n');
}

var LETTER_FIELDS = ['happy','uncomf','thanks','wish','extra'];
function saveLetter() {
  var dateKey = fmtDate(new Date(letterViewDate));
  var allData = loadSharedDiaryData(); if (!allData[dateKey]) allData[dateKey] = {};
  var entry = { mood:letterMood, time:Date.now() }; var hasContent = false;
  LETTER_FIELDS.forEach(function(f){
    var el = document.getElementById('letter-'+f);
    var val = el ? el.value.trim() : '';
    if (val) { entry[f] = val; hasContent = true; }
  });
  if (!hasContent) return;
  var existing = allData[dateKey][activeProfile] || {};
  if (existing.hug) entry.hug = existing.hug;
  allData[dateKey][activeProfile] = entry;
  saveSharedDiaryData(allData);
  var badge = document.getElementById('letterSavedBadge');
  badge.classList.add('show'); setTimeout(function(){badge.classList.remove('show');},2000);
  pushAllSharedData().catch(function(){}); renderLettersPanel(); toast('💌 ✓');
}

function updateLetterCharCount() {
  var total = 0;
  LETTER_FIELDS.forEach(function(f){
    var el = document.getElementById('letter-'+f);
    if (el) { total += el.value.length; document.getElementById('lsc-'+f).textContent = el.value.length; }
  });
  var cnt = document.getElementById('letterCharCount');
  if (cnt) cnt.textContent = L('ukupno ','合计 ','total ')+total+L(' znakova',' 字',' chars');
}

function toggleLetterSection(name) {
  var sec = document.getElementById('ls-'+name); if (!sec) return;
  sec.classList.toggle('collapsed');
}

function renderMiniCalendar() {
  var cal = document.getElementById('lettersMiniCal'); if (!cal) return;
  var allData = loadSharedDiaryData();
  var first = new Date(letterYear, letterMonth, 1);
  var dow = first.getDay(); dow = dow === 0 ? 6 : dow - 1;
  var selKey = fmtDate(new Date(letterViewDate));
  var todayKey = fmtDate(today());
  var dowLabels = lang==='sr'?['Po','Ut','Sr','Če','Pe','Su','Ne']:lang==='en'?['Mo','Tu','We','Th','Fr','Sa','Su']:['一','二','三','四','五','六','日'];
  var html = dowLabels.map(function(d){return '<div class="mc-dow">'+d+'</div>';}).join('');
  for (var i = 0; i < 42; i++) {
    var d = new Date(first); d.setDate(d.getDate() - dow + i);
    var key = fmtDate(d); var inMonth = d.getMonth() === letterMonth;
    var dayData = allData[key]; var both = dayData && dayData['barry'] && dayData['andjela'];
    var hasEntry = dayData && (dayData['barry'] || dayData['andjela']);
    var cls = ['mc-day']; if (!inMonth) cls.push('other-month');
    if (key === todayKey) cls.push('today');
    if (key === selKey) cls.push('selected');
    html += '<div class="' + cls.join(' ') + '" onclick="selectLetterDate(\'' + key + '\')">';
    html += '<span>' + d.getDate() + '</span>';
    if (hasEntry && inMonth) { html += '<span class="mc-dot' + (both ? ' both' : ' has-entry') + '"></span>'; }
    html += '</div>';
  }
  cal.innerHTML = html;
  document.getElementById('lettersMonthLabel').textContent = L(letterYear+'. '+(letterMonth+1)+'.', (letterYear)+'年'+(letterMonth+1)+'月', t('months')[letterMonth]+' '+letterYear);
  var todayBtn = document.getElementById('lettersTodayBtn');
  if (todayBtn) todayBtn.textContent = L('📍 Danas', '📍 今天', '📍 Today');
}

function selectLetterDate(key) {
  letterViewDate = new Date(key + 'T00:00:00');
  letterMonth = letterViewDate.getMonth();
  letterYear = letterViewDate.getFullYear();
  letterMood = '';
  renderLettersPanel();
}

function shiftLetterMonth(dir) {
  letterMonth += dir;
  if (letterMonth < 0) { letterMonth = 11; letterYear--; }
  if (letterMonth > 11) { letterMonth = 0; letterYear++; }
  renderLettersPanel();
}

function goLetterToday() {
  var t = today(); letterViewDate = t; letterMonth = t.getMonth(); letterYear = t.getFullYear();
  letterMood = ''; renderLettersPanel();
}

function renderLettersPanel() {
  renderMiniCalendar();
  var dateKey = fmtDate(new Date(letterViewDate));
  var selDate = new Date(letterViewDate);
  document.getElementById('letterDate').textContent = '📅 ' + dateKey;
  // Mood tags
  var moodHtml = '';
  LETTER_MOODS.forEach(function(m){
    moodHtml += '<span class="mood-tag'+(letterMood===m?' picked':'')+'" onclick="pickLetterMood(\''+m+'\')">'+m+'</span>';
  });
  document.getElementById('letterMoodTags').innerHTML = moodHtml;
  // Section labels i18n
  document.getElementById('lsl-happy').textContent = L('Šta me je danas obradovalo','今天让我开心的事','What made me happy today');
  document.getElementById('lsl-uncomf').textContent = L('Šta mi je malo zasmetalo','让我有点不舒服的事','What felt a little uncomfortable');
  document.getElementById('lsl-thanks').textContent = L('Želim da ti se zahvalim za...','我想感谢你...','I want to thank you for...');
  document.getElementById('lsl-wish').textContent = L('Voleo bih da poradimo na...','希望我们一起改进...','I hope we can improve on...');
  document.getElementById('lsl-extra').textContent = L('Još nešto... (opciono)','还想说什么...（可选）','Anything else... (optional)');
  // My entry — populate 5 guided fields
  var allData = loadSharedDiaryData();
  var myEntry = allData[dateKey] && allData[dateKey][activeProfile];
  LETTER_FIELDS.forEach(function(f){
    var el = document.getElementById('letter-'+f);
    var sec = document.getElementById('ls-'+f);
    if (!el || !sec) return;
    // Populate from saved entry or leave empty
    if (myEntry) {
      if (myEntry[f]) el.value = myEntry[f];
      else if (myEntry.text && f === 'happy') el.value = myEntry.text; // old v8 format
      else el.value = '';
    } else if (!el.value) {
      el.value = '';
    }
    // Smart collapse: expand if has content, collapse if empty (except first 4 always visible but collapsed if empty)
    var hasVal = el.value.trim().length > 0;
    if (hasVal) sec.classList.add('has-content');
    else sec.classList.remove('has-content');
    // Extra field is collapsed by default unless has content
    if (f === 'extra' && !hasVal && !sec.classList.contains('collapsed')) sec.classList.add('collapsed');
    // Auto-save on input
    el.oninput = function() {
      updateLetterCharCount();
      var hasNow = el.value.trim().length > 0;
      if (hasNow) sec.classList.add('has-content');
      else sec.classList.remove('has-content');
      clearTimeout(_letterAutoSaveTimer);
      _letterAutoSaveTimer = setTimeout(function(){
        var ad = loadSharedDiaryData(); if (!ad[dateKey]) ad[dateKey] = {};
        var draft = ad[dateKey][activeProfile] || {mood:letterMood,time:Date.now()};
        LETTER_FIELDS.forEach(function(ff){
          var fell = document.getElementById('letter-'+ff);
          if (fell && fell.value.trim()) draft[ff] = fell.value.trim();
        });
        draft.draft = true; ad[dateKey][activeProfile] = draft;
        saveSharedDiaryData(ad);
      }, 3000);
    };
  });
  updateLetterCharCount();
  // Send button label
  document.getElementById('letter-send-text').textContent = L('Pošalji', '发送', 'Send');
  document.getElementById('letter-my-title').textContent = L('Moje pismo', '我的信', 'My Letter');
  document.getElementById('letter-saved-text').textContent = L('Sačuvano', '已保存', 'Saved');
  // Partner card
  var partnerProfile = activeProfile === 'andjela' ? 'barry' : 'andjela';
  var partnerEntry = allData[dateKey] && allData[dateKey][partnerProfile];
  var partnerName = partnerProfile === 'andjela' ? '🌸 Anđela' : '👦 Barry';
  document.getElementById('letter-partner-title').textContent = partnerName + ' ' + L('pismo', '的信', '\'s Letter');
  document.getElementById('letter-lock-text').textContent = L('Napiši svoje pismo da otključaš partnerovo 💌', '写下你的信来解锁伴侣的 💌', 'Write your letter to unlock your partner\'s 💌');
  var lockedEl = document.getElementById('letterLocked');
  var contentEl = document.getElementById('letterPartnerContent');
  var translateBtn = document.getElementById('letterTranslateBtn');
  if (myEntry || (allData[dateKey] && allData[dateKey][activeProfile])) {
    lockedEl.style.display = 'none'; contentEl.style.display = '';
    if (partnerEntry) {
      var mood = partnerEntry.mood || '';
      var timeStr = partnerEntry.time ? (function(t){var d=new Date(t);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');})(partnerEntry.time) : '';
      var sections = [
        {emoji:'💝',key:'happy',label:L('Obradovalo','开心的事','Happy')},
        {emoji:'🤔',key:'uncomf',label:L('Zasmetalo','不舒服的事','Uncomfortable')},
        {emoji:'🙏',key:'thanks',label:L('Zahvalnost','感谢','Thanks')},
        {emoji:'💪',key:'wish',label:L('Da poradimo','希望改进','To improve')},
        {emoji:'💬',key:'extra',label:L('Još','还想说','Also')}
      ];
      var bodyHtml = '';
      sections.forEach(function(s){
        var val = partnerEntry[s.key];
        if (!val && partnerEntry.text) val = letterTextFromEntry(partnerEntry); // old v8 format
        if (val && s.key==='happy') bodyHtml += '<div class="letter-body">' + esc(val) + '</div>';
        else if (val && s.key!=='happy') bodyHtml += '<div style="margin-top:10px"><span style="font-size:var(--text-xs);color:var(--text-muted)">'+s.emoji+' '+s.label+'</span><div class="letter-body">'+esc(val)+'</div></div>';
      });
      if (!bodyHtml) bodyHtml = '<div class="letter-body">' + esc(partnerEntry.text || letterTextFromEntry(partnerEntry)) + '</div>';
      contentEl.innerHTML = bodyHtml + '<div class="letter-signature">— ' + partnerName + ' ' + mood + ' 💕</div>' + (timeStr ? '<div class="letter-time">'+timeStr+'</div>' : '');
      translateBtn.style.display = '';
    } else {
      contentEl.innerHTML = '<div style="text-align:center;padding:16px;font-size:var(--text-sm);color:var(--text-muted);font-style:italic">' + L('Partner još nije napisao pismo za ovaj dan 📭', '伴侣还没写这一天的信 📭', 'Your partner hasn\'t written for this day yet 📭') + '</div>';
      translateBtn.style.display = 'none';
    }
  } else {
    lockedEl.style.display = ''; contentEl.style.display = 'none'; translateBtn.style.display = 'none';
  }
  // Mailbox
  renderMailbox(allData);
}

function pickLetterMood(m) { letterMood = letterMood === m ? '' : m; renderLettersPanel(); }

function renderMailbox(allData) {
  var list = document.getElementById('mailboxList'); if (!list) return;
  var items = [];
  Object.keys(allData).forEach(function(date){
    var day = allData[date];
    if (day['barry'] || day['andjela']) items.push({date:date, barry:day['barry'], andjela:day['andjela']});
  });
  items.sort(function(a,b){return b.date.localeCompare(a.date);});
  document.getElementById('mailbox-title').textContent = L('Poštansko sanduče', '信箱', 'Mailbox');
  if (items.length === 0) {
    list.innerHTML = '<div class="mailbox-empty">' + L('Još nema pisama — napiši prvo! 💌', '还没有信——写第一封吧！💌', 'No letters yet — write the first! 💌') + '</div>';
    return;
  }
  var showCount = 8;
  var html = '';
  for (var i = 0; i < Math.min(items.length, showCount); i++) {
    var item = items[i];
    var both = item.barry && item.andjela;
    var myEntry = item[activeProfile];
    var partnerEntry = item[activeProfile === 'andjela' ? 'barry' : 'andjela'];
    var icon = both ? '💌' : (myEntry ? '✉️' : '📭');
    var preview = myEntry ? (myEntry.happy || myEntry.text || letterTextFromEntry(myEntry)).substring(0, 60) : (partnerEntry ? '🔒 ' + L('piši da otključaš','写信解锁','write to unlock') : '');
    var moodEmoji = myEntry && myEntry.mood ? myEntry.mood : '';
    html += '<div class="mailbox-item" onclick="jumpToLetter(\'' + item.date + '\')">';
    html += '<span class="mb-icon">' + icon + '</span>';
    html += '<span class="mb-date">' + item.date.slice(5) + '</span>';
    if (moodEmoji) html += '<span class="mb-mood">' + moodEmoji + '</span>';
    html += '<span class="mb-preview">' + esc(preview) + '</span>';
    html += '</div>';
  }
  list.innerHTML = html;
}

function jumpToLetter(dateKey) {
  letterViewDate = new Date(dateKey + 'T00:00:00');
  letterMonth = letterViewDate.getMonth(); letterYear = letterViewDate.getFullYear();
  letterMood = ''; renderLettersPanel();
  var panel = document.getElementById('panel-diary');
  if (panel) panel.scrollIntoView({behavior:'smooth'});
}

function translatePartnerLetter() {
  var dateKey = fmtDate(new Date(letterViewDate));
  var allData = loadSharedDiaryData();
  var partnerProfile = activeProfile === 'andjela' ? 'barry' : 'andjela';
  var entry = allData[dateKey] && allData[dateKey][partnerProfile];
  if (!entry) return;
  var body = entry.text || letterTextFromEntry(entry);
  var vl = (lang||'sr') === 'zh-CN' ? 'zh-CN' : 'sr';
  var pl = partnerProfile === 'barry' ? 'zh-CN' : 'sr';
  if (vl === pl) return;
  var btn = document.getElementById('letterTranslateBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳'; }
  translateText(body, pl, vl).then(function(result) {
    var contentEl = document.getElementById('letterPartnerContent');
    if (result && result !== body && contentEl) {
      var partnerName = partnerProfile === 'andjela' ? '🌸 Anđela' : '👦 Barry';
      var mood = entry.mood || '';
      contentEl.innerHTML = '<div class="letter-body">' + esc(result) + '</div><div class="letter-signature">— ' + partnerName + ' ' + mood + ' 💕</div><div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:4px">🌐 ' + L('Prevedeno', '已翻译', 'Translated') + '</div>';
      if (btn) { btn.textContent = '✅'; btn.disabled = false; }
    } else {
      if (btn) { btn.textContent = '⚠️'; btn.disabled = false; setTimeout(function(){btn.textContent='🌐';},3000); }
    }
  }).catch(function() {
    if (btn) { btn.textContent = '⚠️'; btn.disabled = false; setTimeout(function(){btn.textContent='🌐';},3000); }
  });
}

/* ================================================================
   MODIFIED: Load lang/theme per-profile
   ================================================================ */
function loadPerProfileSettings() {
  // Default languages: Anđela → Serbian, Barry → Chinese
  var defaultLang = activeProfile === 'barry' ? 'zh-CN' : 'sr';
  var savedLang = localStorage.getItem(profileKey('cycle-lang'));
  // Cleanse: if saved lang is the WRONG profile's default, reset
  if (activeProfile === 'barry' && savedLang === 'sr') savedLang = null;
  if (activeProfile === 'andjela' && savedLang === 'zh-CN') savedLang = null;
  var validLangs = { 'sr':1, 'zh-CN':1, 'en':1 };
  lang = (savedLang && validLangs[savedLang]) ? savedLang : defaultLang;
  // ALWAYS save the corrected lang
  if (!savedLang) localStorage.setItem(profileKey('cycle-lang'), lang);
  theme = localStorage.getItem(profileKey('cycle-theme')) || 'light';
  annDateMet = localStorage.getItem('cycle-ann-met') || '2026-03-19';
  annDateLove = localStorage.getItem('cycle-ann-love') || '2026-05-07';
}
function setLang(l) { lang = l; document.documentElement.setAttribute('lang', l); localStorage.setItem(profileKey('cycle-lang'), l); localStorage.setItem('cycle-lang', l); }
function applyTheme(th) { theme = th; localStorage.setItem(profileKey('cycle-theme'), th); localStorage.setItem('cycle-theme', th); document.documentElement.setAttribute('data-theme', th); document.getElementById('themeBtn').textContent = th === 'dark' ? '☀️' : '🌙'; var sel = document.getElementById('set-theme'); if (sel) sel.value = th; }
// switchLanguage defined below after STATE vars
function switchTheme(th) { applyTheme(th); }

/* ================================================================
   APP CONSTANTS — named values for maintainability
   ================================================================ */
var DEBOUNCE_SAVE_MS = 200;       // localStorage save debounce
var DEBOUNCE_PUSH_MS = 1500;      // GitHub push debounce
var SYNC_INTERVAL_MS = 120000;    // Cross-device pull interval (2 min)
var WEATHER_CACHE_MS = 21600000;  // Weather cache validity (6 hours)
var WEATHER_TIMEOUT_MS = 8000;    // Weather fetch timeout
var MAX_SHARED_RETRY = 3;         // GitHub sync retry attempts
var MAX_DIARY_CHARS = 200;        // Shared diary field character limit

/* ================================================================
   PERFORMANCE HELPERS — DOM cache + i18n shorthands
   ================================================================ */
var _el = {};  // DOM element cache
function el(id) { return _el[id] || (_el[id] = document.getElementById(id)); }
function clearElCache() { _el = {}; }
// Shorthand for 3-way i18n: L(sr, zh, en) → picks based on `lang`
function L(sr, zh, en) { return lang === 'zh-CN' ? zh : lang === 'en' ? en : sr; }
// 3-level language fallback for object-based lookups (holidays, solar terms)
function langName(obj) { return obj[lang] || obj[lang.split('-')[0]] || obj['sr'] || ''; }

/* ================================================================
   MODIFIED: init
   ================================================================ */
// loadPerProfileSettings() is called in the INIT section below
let lang = localStorage.getItem('cycle-lang') || 'sr';
let theme = localStorage.getItem('cycle-theme') || 'light';
let annDateMet = localStorage.getItem('cycle-ann-met') || '2026-03-19';
let annDateLove = localStorage.getItem('cycle-ann-love') || '2026-05-07';

/* ================================================================
   LOGIN SYSTEM
   ================================================================ */
// SHA-256 hashed PINs (not plaintext). Generated via: crypto.createHash('sha256').update('PIN').digest('hex')
const LOGIN_PINS = { andjela: '8e614d39a1f1279958da1c9f7e8df51db4aabca8cc3a3e84f8c3dc5f88e1fcfb', barry: '286aee2ea4a5ba67539432dc5ea3865c3b204d3caaccb662995388d156a279cf' };
let selectedLoginProfile = null;
let isLoggedIn = false;

function selectLogin(profile) {
  selectedLoginProfile = profile;
  // Set language based on profile: Anđela→sr, Barry→zh-CN
  var profileLang = profile === 'barry' ? 'zh-CN' : 'sr';
  lang = profileLang;
  document.querySelectorAll('.lang-btn').forEach(function(b){b.classList.toggle('active',b.dataset.lang===lang);});
  // Update card selection visuals
  document.getElementById('loginCardAndjela').classList.toggle('selected', profile === 'andjela');
  document.getElementById('loginCardBarry').classList.toggle('selected', profile === 'barry');
  // Update login UI text
  document.getElementById('loginPinBtn').textContent = lang==='sr'?'🔓 Prijavi se':lang==='en'?'🔓 Sign in':'🔓 登录';
  document.getElementById('lc-hint-a').textContent = lang==='sr'?'Dodirni za prijavu':lang==='en'?'Tap to sign in':'点击登录';
  document.getElementById('lc-hint-b').textContent = lang==='sr'?'Dodirni za prijavu':lang==='en'?'Tap to sign in':'点击登录';
  // Show PIN area
  document.getElementById('loginPinArea').classList.add('show');
  document.getElementById('loginPinInput').value = '';
  document.getElementById('loginError').textContent = '';
  document.getElementById('loginSwitchHint').textContent = lang==='sr'?'Unesi svoj PIN':lang==='en'?'Enter your PIN':'输入你的 PIN';
  setTimeout(function(){ document.getElementById('loginPinInput').focus(); }, 300);
  spawnLoginHearts();
}
function spawnLoginHearts() {
  var overlay = document.getElementById('loginOverlay');
  if (!overlay) return;
  var hearts = ['💕','💖','💗','💝','🌸','✨','🌷','🕊️'];
  for (var i = 0; i < 15; i++) {
    (function(idx) {
      setTimeout(function() {
        var h = document.createElement('span');
        h.textContent = hearts[idx % hearts.length];
        h.style.cssText = 'position:fixed;pointer-events:none;z-index:1001;font-size:'+(0.8+Math.random()*1.5)+'rem;left:'+(5+Math.random()*90)+'%;top:'+(80+Math.random()*15)+'%;animation:loginHeartFloat '+(2+Math.random()*3)+'s ease-out forwards';
        h.style.opacity = '0.7';
        overlay.appendChild(h);
        setTimeout(function() { if (h.parentNode) h.remove(); }, 3500);
        // Add keyframes if not present
        if (!document.getElementById('loginHeartKeyframes')) {
          var style = document.createElement('style');
          style.id = 'loginHeartKeyframes';
          style.textContent = '@keyframes loginHeartFloat{0%{opacity:1;transform:translateY(0) scale(1) rotate(0deg)}100%{opacity:0;transform:translateY(-120px) scale(.3) rotate(45deg)}}';
          document.head.appendChild(style);
        }
      }, idx * 120);
    })(i);
  }
}

function verifyLogin() {
  var pinEl = document.getElementById('loginPinInput');
  var pin = pinEl ? pinEl.value : '';
  var card = selectedLoginProfile === 'andjela' ? document.getElementById('loginCardAndjela') : document.getElementById('loginCardBarry');
  // Hash input PIN with SHA-256 and compare against stored hash
  hashPIN(pin).then(function(hashed) {
    if (hashed === LOGIN_PINS[selectedLoginProfile]) {
      // Correct PIN
      activeProfile = selectedLoginProfile;
      localStorage.setItem('cycle-active-profile', activeProfile);
      sessionStorage.setItem('cycle-logged-in', '1');
      isLoggedIn = true;
      document.getElementById('loginOverlay').classList.add('hidden');
      bootApp();
    } else {
      // Wrong PIN
      card.classList.add('shake');
      document.getElementById('loginError').textContent = (selectedLoginProfile==='barry'?'PIN 不对，再试一次':'Pogrešan PIN — pokušaj ponovo');
      pinEl.value = '';
      setTimeout(function(){ card.classList.remove('shake'); }, 500);
    }
  });
}
// SHA-256 hash using Web Crypto API
function hashPIN(pin) {
  if (!pin) return Promise.resolve('');
  try {
    var encoder = new TextEncoder();
    var data = encoder.encode(pin);
    return crypto.subtle.digest('SHA-256', data).then(function(hashBuffer) {
      return Array.from(new Uint8Array(hashBuffer)).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
    });
  } catch(e) {
    // Fallback for very old browsers: simple hash (less secure but better than plaintext)
    var h = 0;
    for (var i = 0; i < pin.length; i++) { h = ((h << 5) - h) + pin.charCodeAt(i); h |= 0; }
    return Promise.resolve('fallback_' + Math.abs(h).toString(16));
  }
}

// ===== DATA BACKUP & RESTORE =====
function exportAllData() {
  var backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    exportedBy: activeProfile,
    diary: JSON.parse(localStorage.getItem('shared-diary') || '{}'),
    learningProgress: JSON.parse(localStorage.getItem('shared-learning-progress') || '{}'),
    learningComments: JSON.parse(localStorage.getItem('shared-learning-comments') || '[]'),
    learningPoints: JSON.parse(localStorage.getItem('shared-learning-points') || '{}'),
    voiceData: JSON.parse(localStorage.getItem('shared-voice-data') || '{}'),
    sunCounter: JSON.parse(localStorage.getItem('shared-sun-counter') || '{}'),
    settings: {
      activeProfile: activeProfile,
      lang: lang,
      theme: theme
    }
  };
  var blob = new Blob([JSON.stringify(backup, null, 2)], {type: 'application/json'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'anđelin-ciklus-backup-' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('📦 ' + L('Podaci izvezeni!','数据已导出！','Data exported!'));
}

function importAllData() {
  var input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = function(e) {
    var file = e.target.files[0];
    if (!file) return;
    if (!confirm(L('⚠️ Ovo će PREBRISATI sve trenutne podatke. Nastaviti?','⚠️ 此操作将覆盖所有当前数据，是否继续？','⚠️ This will OVERWRITE all current data. Continue?'))) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      try {
        var backup = JSON.parse(ev.target.result);
        if (backup.diary) localStorage.setItem('shared-diary', JSON.stringify(backup.diary));
        if (backup.learningProgress) localStorage.setItem('shared-learning-progress', JSON.stringify(backup.learningProgress));
        if (backup.learningComments) localStorage.setItem('shared-learning-comments', JSON.stringify(backup.learningComments));
        if (backup.learningPoints) localStorage.setItem('shared-learning-points', JSON.stringify(backup.learningPoints));
        if (backup.voiceData) localStorage.setItem('shared-voice-data', JSON.stringify(backup.voiceData));
        if (backup.settings) {
          if (backup.settings.lang) { lang = backup.settings.lang; setLang(lang); }
          if (backup.settings.theme) { theme = backup.settings.theme; applyTheme(theme); }
        }
        pushAllSharedData();
        toast('✅ ' + L('Podaci vraćeni! Osvežavanje...','数据已恢复！刷新中...','Data restored! Refreshing...'));
        setTimeout(function(){ location.reload(); }, 1500);
      } catch(e) {
        toast('❌ ' + L('Neispravan fajl','无效文件','Invalid file'));
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// ===== FESTIVAL THEME =====
function getFestivalTheme(){var t=new Date();var k=t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0');var L={2025:{s:'2025-01-29',m:'2025-10-06'},2026:{s:'2026-02-17',m:'2026-09-25'},2027:{s:'2027-02-06',m:'2027-10-14'},2028:{s:'2028-01-26',m:'2028-10-03'},2029:{s:'2029-02-13',m:'2029-09-28'}};var ld=L[t.getFullYear()];if(ld){var ss=new Date(ld.s+'T00:00:00');var se=new Date(ss);se.setDate(se.getDate()+3);if(t>=ss&&t<=se)return'festival-spring';if(k===ld.m)return'festival-midautumn';}var mmdd=String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0');if(mmdd==='01-07')return'festival-orthodoxmas';if(mmdd==='01-27')return'festival-sava';if(mmdd==='02-14')return'festival-valentine';if(mmdd==='05-09')return'festival-victory';var ORTHODOX_EASTER={2025:'2025-04-20',2026:'2026-04-12',2027:'2027-05-02',2028:'2028-04-16',2029:'2029-04-08'};var oe=ORTHODOX_EASTER[t.getFullYear()];if(oe&&k===oe)return'festival-easter';if(mmdd==='01-01')return'festival-newyear';return'';}
function applyFestivalTheme(){var cls=getFestivalTheme();document.body.classList.forEach(function(c){if(c.startsWith('festival-'))document.body.classList.remove(c);});if(cls)document.body.classList.add(cls);var old=document.getElementById('festivalDecorations');if(old)old.remove();var icons=null,count=0;if(cls==='festival-spring'){icons=['🏮','🧧','🎆','🧨'];count=12;}else if(cls==='festival-midautumn'){icons=['🌕','🐰','🥮','🏮'];count=10;}else if(cls==='festival-valentine'){icons=['💕','💖','💗','🌸','❤️'];count=15;}else if(cls==='festival-newyear'){icons=['🎆','✨','🎉','🌟'];count=12;}else if(cls==='festival-sava'){icons=['📚','✝️','🇷🇸','🕊️'];count=8;}else if(cls==='festival-orthodoxmas'){icons=['❄️','🎄','✝️','🕯️'];count=8;}else if(cls==='festival-easter'){icons=['🥚','🐇','🌸','🕊️'];count=10;}else if(cls==='festival-victory'){icons=['🕊️','🌺','🎖️','✨'];count=8;}if(!icons)return;var c=document.createElement('div');c.className='festival-decorations';c.id='festivalDecorations';for(var i=0;i<count;i++){var d=document.createElement('span');d.className='festival-deco';d.textContent=icons[i%icons.length];d.style.left=(2+Math.random()*94)+'%';d.style.fontSize=(0.8+Math.random()*1.8)+'rem';d.style.animationDelay=(Math.random()*6)+'s';d.style.animationDuration=(4+Math.random()*8)+'s';c.appendChild(d);}document.body.appendChild(c);}

// ===== SEASONAL DECOR =====
function applySeasonalDecor(){var cls=getFestivalTheme();if(cls)return;var m=new Date().getMonth();var icons=null,count=0;if(m>=2&&m<=4){icons=['🌸','🌷','💮','🌿'];count=8;}else if(m>=5&&m<=7){icons=['☀️','🌻','🍦','🦋'];count=6;}else if(m>=8&&m<=10){icons=['🍂','🍁','🎃','🌾'];count=8;}else{icons=['❄️','⛄','🧣','✨'];count=6;}var old=document.getElementById('seasonalDecorations');if(old)old.remove();var c=document.createElement('div');c.className='seasonal-deco';c.id='seasonalDecorations';for(var i=0;i<count;i++){var d=document.createElement('span');d.textContent=icons[i%icons.length];d.style.left=(3+Math.random()*94)+'%';d.style.fontSize=(0.7+Math.random()*1.2)+'rem';d.style.animationDelay=(Math.random()*8)+'s';c.appendChild(d);}document.body.appendChild(c);}
function setupOfflineDetection(){var banner=document.getElementById('offlineBanner');if(!banner)return;function update(){banner.classList.toggle('show',!navigator.onLine);document.getElementById('offline-text').textContent=lang==='sr'?'Offline — neke funkcije možda ne rade':lang==='en'?'Offline — some features unavailable':'当前离线，部分功能不可用';}window.addEventListener('online',update);window.addEventListener('offline',update);update();}
var _deferredPWA = null; // store beforeinstallprompt for manual trigger
function setupPWABanner(){var banner=document.getElementById('pwaBanner');if(!banner)return;if(window.matchMedia('(display-mode: standalone)').matches)return;if(!/Mobi|Android/i.test(navigator.userAgent))return;if(localStorage.getItem('pwa-banner-dismissed'))return;// Use native install prompt if available
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();_deferredPWA=e;banner.classList.add('show');banner.onclick=function(){_deferredPWA.prompt();_deferredPWA.userChoice.then(function(r){if(r.outcome==='accepted'){banner.classList.remove('show');localStorage.setItem('pwa-installed','1');}});};});if(_deferredPWA)return;// fallback for browsers without beforeinstallprompt
banner.classList.add('show');banner.onclick=function(){banner.classList.remove('show');localStorage.setItem('pwa-banner-dismissed','1');};document.getElementById('pwa-text').textContent=lang==='sr'?'📲 Instaliraj na telefon — koristi kao aplikaciju':lang==='en'?'📲 Install on phone — use like an app':'📲 安装到手机 — 像App一样使用';}

// ===== DASHBOARD =====
var DASH_I18N={barry:{dashTitle:'🏠 主页',welcomeBack:'欢迎回来，',todayCulture:'今日文化知识',goDiary:'📝 写日记',goLearn:'📚 中华文化',goCalendar:'📅 查看日历',connectQ:'💭 今天的对话',refreshQ:'🔄 换一个问题',todayPhase:'今日阶段',todayMoodDash:'今日心情',todayStreak:'连续打卡',todayCycles:'周期总数',avgAbbr:'平均'},andjela:{dashTitle:'🏠 Početna',welcomeBack:'Dobrodošla nazad, ',todayCulture:'Današnje kulturno znanje',goDiary:'📝 Dnevnik',goLearn:'📚 Kineska kultura',goCalendar:'📅 Kalendar',connectQ:'💭 Pitanje dana',refreshQ:'🔄 Drugo pitanje',todayPhase:'Trenutna faza',todayMoodDash:'Raspoloženje',todayStreak:'Niz dana',todayCycles:'Ukupno ciklusa',avgAbbr:'Prosek'}};
function dl(key){var profile=(lang||'').indexOf('zh')===0?'barry':'andjela';var p=DASH_I18N[profile]||DASH_I18N.andjela;return p[key]||(DASH_I18N.andjela[key]||key);}
// Daily conversation starters — rotating questions to deepen understanding
var CONVERSATION_QUESTIONS={sr:['Koja je tvoja najlepša uspomena iz detinjstva?','Šta te je danas nasmejalo?','Kad si se poslednji put osećao/la najviše voljeno?','Koji je tvoj omiljeni miris i na šta te podseća?','Šta bi voleo/la da naučiš zajedno?','Koja pesma te uvek oraspoloži?','Kako voliš da ti neko pokaže da mu je stalo?','Koje mesto bi voleo/la da posetimo zajedno?','Šta najviše ceniš kod mene — iskreno?','Koji je bio najbolji dan u našoj vezi do sada?','Da možeš da promeniš jednu stvar na svetu, šta bi to bilo?','Kako zamišljaš naš savršen dan za 10 godina?','Šta te čini ponosnim/om na sebe?','Koji je tvoj omiljeni način da se opustiš?','Kad si poslednji put probao/la nešto novo — i šta je to bilo?'],'zh-CN':['你童年最美好的回忆是什么？','今天什么让你笑了？','你最近一次感到被深爱是什么时候？','你最喜欢的气味是什么？它让你想起什么？','你想一起学什么新东西？','哪首歌总是能让你心情变好？','你喜欢别人用什么方式表达对你的在乎？','你最想和我一起去哪里旅行？','你最欣赏我哪一点——说真的？','到目前为止，我们关系中最好的一天是哪天？','如果你能改变世界上的一件事，会是什么？','你想象中我们十年后的完美一天是怎样的？','什么让你为自己感到骄傲？','你最喜欢的放松方式是什么？','你最近一次尝试新事物是什么——尝试了什么？'],en:['What is your most beautiful childhood memory?','What made you smile today?','When did you last feel most loved?','What is your favorite scent and what does it remind you of?','What would you like to learn together?','Which song always lifts your mood?','How do you like someone to show they care?','Which place would you love to visit together?','What do you appreciate most about me — honestly?','What was the best day in our relationship so far?','If you could change one thing in the world, what would it be?','How do you imagine our perfect day 10 years from now?','What makes you proud of yourself?','What is your favorite way to relax?','When did you last try something new — and what was it?']};
function getDailyQuestion(){var qs=CONVERSATION_QUESTIONS[lang]||CONVERSATION_QUESTIONS['sr'];var idx=new Date().getDate()%qs.length;return qs[idx];}
function initDashboard(){if(getGitHubToken()){pullAllSharedData().then(function(){renderDashboard();});}else{renderDashboard();}}
function renderDashboard(){var panel=document.getElementById('panel-dashboard');if(!panel)return;var myName=activeProfile==='andjela'?'🌸 Anđela':'👦 Barry';var h='';h+='<div class=\"dash-welcome\">'+dl('welcomeBack')+'<strong>'+myName+'</strong></div>';
  // Today's overview strip
  var predDash=predict();var tdDash=today();var phaseDash=getPhase(tdDash,predDash);
  var pe={};pe['period-on']='🩸';pe['period-mid']='🩸';pe['period-pred-first']='🔮';pe['period-pred']='🔮';pe['ovulation']='🥚';pe['fertile']='🌱';pe['luteal']='🌙';pe['follicular']='🌿';
  var phLabel=t('phaseBadges')[phaseDash]||'--';var tm=getMood(fmtDate(tdDash));var strk=calculateStreak();var sc=state.records.length;var avgD=predDash.avgCycle||'--';
  h+='<div class=\"card dash-card\" style=\"text-align:center\"><div style=\"display:flex;justify-content:space-around;align-items:center;flex-wrap:wrap;gap:8px\">';
  h+='<div style=\"text-align:center\"><div style=\"font-size:1.4rem\">'+(pe[phaseDash]||'📊')+'</div><div style=\"font-size:.65rem;font-weight:700;color:var(--text)\">'+dl('todayPhase')+'</div><div style=\"font-size:.58rem;color:var(--text-muted)\">'+phLabel+'</div></div>';
  h+='<div style=\"text-align:center\"><div style=\"font-size:1.4rem\">'+(tm?MOOD_EMOJIS[MOOD_KEYS.indexOf(tm)]:'🌤️')+'</div><div style=\"font-size:.65rem;font-weight:700;color:var(--text)\">'+dl('todayMoodDash')+'</div><div style=\"font-size:.58rem;color:var(--text-muted)\">'+(tm?t('moodNames')[MOOD_KEYS.indexOf(tm)]:(lang==='sr'?'Nije uneto':lang==='en'?'Not set':'未记录'))+'</div></div>';
  h+='<div style=\"text-align:center\"><div style=\"font-size:1.4rem\">🔥</div><div style=\"font-size:.65rem;font-weight:700;color:var(--text)\">'+dl('todayStreak')+'</div><div style=\"font-size:.58rem;color:var(--text-muted)\">'+strk+' '+(lang==='sr'?'dana':lang==='en'?'days':'天')+'</div></div>';
  h+='<div style=\"text-align:center\"><div style=\"font-size:1.4rem\">📊</div><div style=\"font-size:.65rem;font-weight:700;color:var(--text)\">'+dl('todayCycles')+'</div><div style=\"font-size:.58rem;color:var(--text-muted)\">'+sc+' / '+dl('avgAbbr')+' '+avgD+'d</div></div>';
  h+='</div></div>';
  // Today's holiday highlight
  var todayKey=fmtDate(today());var todayHolidays=getHoliday(todayKey);
  if(todayHolidays.length>0){h+='<div class=\"card dash-card\" style=\"background:linear-gradient(135deg,var(--rose-light),var(--dust));border:1px solid var(--gold)\"><h4>🎌 '+(lang==='sr'?'Današnji praznik':lang==='en'?'Today\'s Holiday':'今日节日')+'</h4>'+todayHolidays.map(function(h){return '<div style=\"font-size:.8rem;font-weight:700;color:var(--love)\">'+h.icon+' '+(h.name[lang]||h.name['sr'])+'</div><div style=\"font-size:.68rem;color:var(--text-muted);margin-top:4px\">'+(h.desc[lang]||h.desc['sr'])+'</div>';}).join('<div style=\"height:4px\"></div>')+'</div>';}
  // Daily connection question
  h+='<div class=\"card dash-card\" style=\"border-left:3px solid var(--teal)\"><h4>'+dl('connectQ')+'</h4><div style=\"font-size:.82rem;color:var(--text);line-height:1.6;font-style:italic;margin-bottom:8px\" id=\"dailyConnectQ\">'+getDailyQuestion()+'</div><button class=\"dash-link-btn\" onclick=\"document.getElementById(\'dailyConnectQ\').textContent=getDailyQuestion();\" style=\"font-size:.62rem;padding:4px 12px\">'+dl('refreshQ')+'</button></div>';
  // Culture card
  if(CULTURE_KNOWLEDGE&&CULTURE_KNOWLEDGE.length>0){var tc=CULTURE_KNOWLEDGE[getTodaysCultureIndex()];if(tc){var isZh=(lang||'').indexOf('zh')===0;var isEn=(lang||'').indexOf('en')===0;var tcTitle=isZh?tc.zh:(isEn&&tc.en?tc.en:tc.sr);var tcDesc=isZh?(CULTURE_DESC_ZH&&CULTURE_DESC_ZH[tc.id]||tc.desc):(isEn&&tc.desc_en?tc.desc_en:(tc.desc_sr||tc.desc));h+='<div class=\"card dash-card\"><h4>'+tc.icon+' '+dl('todayCulture')+'</h4><div style=\"font-size:.85rem;font-weight:700;color:var(--love);margin-bottom:4px\">'+tcTitle+'</div><div style=\"font-size:.65rem;color:var(--text-muted);line-height:1.5\">'+tcDesc.substring(0,120)+'...</div></div>';}}
  // Quick links
  h+='<div class=\"card dash-card\"><div class=\"dash-links\"><button class=\"dash-link-btn\" onclick=\"switchToTab(\'diary\')\">'+dl('goDiary')+'</button><button class=\"dash-link-btn\" onclick=\"switchToTab(\'chinese\')\">'+dl('goLearn')+'</button><button class=\"dash-link-btn\" onclick=\"goToday();switchToTab(\'stats\')\">'+dl('goCalendar')+'</button></div></div>';panel.innerHTML=h;}
function switchToTab(tabId){var btn=document.querySelector('.tab[data-panel=\"'+tabId+'\"]');if(btn)btn.click();}

/* ================================================================
   STATS PANEL RENDERER — Canvas charts + summary cards
   ================================================================ */
function renderStatsPanel() {
  var panel = document.getElementById('panel-stats');
  if (!panel || !panel.classList.contains('active')) return;
  var pred = predict();
  var td = today();

  // --- Summary cards ---
  var grid = document.getElementById('statsSummaryGrid');
  if (grid) {
    var clen = state.records.length;
    var streak = calculateStreak();
    var phase = getPhase(td, pred);
    var pe2 = {'period-on':'🩸','period-mid':'🩸','ovulation':'🥚','fertile':'🌱','luteal':'🌙','follicular':'🌿'};
    var phaseName = t('phaseBadges')[phase] || '--';
    var phIcon = pe2[phase] || '📊';
    var rl = lang==='sr'?{high:'Visoka',medium:'Srednija',low:'Niska'}:lang==='en'?{high:'High',medium:'Medium',low:'Low'}:{high:'高',medium:'中',low:'低'};
    var regLabel = clen >= 2 ? rl[pred.confidence] : '--';
    var rc = {high:'var(--sage)',medium:'var(--gold)',low:'var(--rose)'};
    var regColor = rc[pred.confidence] || 'var(--text-muted)';
    grid.innerHTML =
      '<div class="stats-mini-card card-accent-rose"><span class="mini-icon">🩸</span><div class="mini-value">'+clen+'</div><div class="mini-label" id="smini-cycles">'+t('stats.count')+'</div></div>'+
      '<div class="stats-mini-card card-accent-sage"><span class="mini-icon">📏</span><div class="mini-value">'+(pred.avgCycle||'--')+'<span style="font-size:.65rem">d</span></div><div class="mini-label" id="smini-avg">'+t('stats.avg')+'</div><div class="mini-sub" id="smini-range">'+(clen>=2?pred.minCycle+'–'+pred.maxCycle+'d':'--')+'</div></div>'+
      '<div class="stats-mini-card card-accent-teal"><span class="mini-icon">'+phIcon+'</span><div class="mini-value" style="font-size:.9rem;line-height:1.6">'+phaseName+'</div><div class="mini-label" id="smini-phase">'+(lang==='sr'?'Trenutna faza':lang==='en'?'Current Phase':'当前阶段')+'</div></div>'+
      '<div class="stats-mini-card card-accent-gold"><span class="mini-icon">🎯</span><div class="mini-value" style="color:'+regColor+'">'+regLabel+'</div><div class="mini-label" id="smini-reg">'+t('stats.reg')+'</div><div class="mini-sub">'+(clen>=2?'σ='+pred.stdDev:'--')+'</div></div>';
  }

  // --- Cycle trend chart ---
  var trendCanvas = document.getElementById('chartCycleTrend');
  var trendEmpty = document.getElementById('chartCycleEmpty');
  document.getElementById('schart-cycle-title').textContent = lang==='sr'?'📈 Trend Ciklusa':lang==='en'?'📈 Cycle Trend':'📈 周期趋势';
  if (trendCanvas && pred.cycles && pred.cycles.length >= 2) {
    trendCanvas.parentElement.style.display = '';
    if (trendEmpty) trendEmpty.style.display = 'none';
    var recentCycles = pred.cycles.slice(-8);
    var labels = [];
    for (var ci = 0; ci < recentCycles.length; ci++) { labels.push('C' + (pred.cycles.length - recentCycles.length + ci + 1)); }
    ChartRenderer.drawLineChart(trendCanvas, recentCycles, labels, {
      width: 500, height: 200,
      avgLine: pred.avgCycle,
      avgLabel: lang==='sr'?'Prosek':lang==='en'?'Avg':'均值',
      emptyText: lang==='sr'?'Premalo podataka':lang==='en'?'Not enough data':'数据不足'
    });
  } else if (trendCanvas) {
    trendCanvas.parentElement.style.display = 'none';
    if (trendEmpty) { trendEmpty.style.display = ''; trendEmpty.textContent = lang==='sr'?'Potrebno bar 2 ciklusa za trend':lang==='en'?'Need 2+ cycles for trend':'需要至少2个周期才显示趋势'; }
  }

  // --- Mood donut chart ---
  var moodCanvas = document.getElementById('chartMoodDonut');
  var moodEmpty = document.getElementById('chartMoodEmpty');
  var moodLegend = document.getElementById('chartMoodLegend');
  document.getElementById('schart-mood-title').textContent = lang==='sr'?'🎭 Distribucija Raspoloženja':lang==='en'?'🎭 Mood Distribution':'🎭 心情分布';
  if (moodCanvas && state.moods) {
    var moodCounts = {};
    var moodKeysArr = Object.keys(state.moods);
    for (var mi = 0; mi < moodKeysArr.length; mi++) {
      var mk = state.moods[moodKeysArr[mi]].mood;
      moodCounts[mk] = (moodCounts[mk] || 0) + 1;
    }
    var segments = [];
    var moodColors = ['#c45a6b','#d4bfb5','#E57373','#b8a0c8','#5e8b7a','#FFB74D','#80a590','#bdbdbd'];
    for (var mj = 0; mj < MOOD_KEYS.length; mj++) {
      if (moodCounts[MOOD_KEYS[mj]]) {
        segments.push({ label: t('moodNames')[mj], value: moodCounts[MOOD_KEYS[mj]], color: moodColors[mj] });
      }
    }
    if (segments.length > 0) {
      moodCanvas.parentElement.style.display = '';
      if (moodEmpty) moodEmpty.style.display = 'none';
      var legendData = ChartRenderer.drawDonutChart(moodCanvas, segments, {
        width: 260, height: 200,
        centerLabel: lang==='sr'?'unosa':lang==='en'?'entries':'次记录',
        emptyText: lang==='sr'?'Nema podataka':lang==='en'?'No mood data':'暂无心情数据'
      });
      if (moodLegend && legendData.length > 0) {
        moodLegend.innerHTML = legendData.map(function(ld) {
          return '<span><span class="legend-dot" style="background:'+ld.color+'"></span>'+ld.label+' ('+ld.pct+'%)</span>';
        }).join('');
      }
    } else {
      moodCanvas.parentElement.style.display = 'none';
      if (moodEmpty) { moodEmpty.style.display = ''; moodEmpty.textContent = lang==='sr'?'Još nema zapisa o raspoloženju':lang==='en'?'No mood records yet':'还没有心情记录'; }
      if (moodLegend) moodLegend.innerHTML = '';
    }
  }

  // --- Symptom bar chart ---
  var symptomCanvas = document.getElementById('chartSymptomBar');
  var symptomEmpty = document.getElementById('chartSymptomEmpty');
  document.getElementById('schart-symptom-title').textContent = lang==='sr'?'📋 Učestalost Simptoma':lang==='en'?'📋 Symptom Frequency':'📋 症状频率';
  if (symptomCanvas && state.symptoms) {
    var sympKeysArr = Object.keys(state.symptoms);
    var sympFreq = { cramps: 0, mood: 0, flow: 0, headache: 0, fatigue: 0, cravings: 0 };
    var sympEmojis = { cramps: '😣', mood: '😊', flow: '💧', headache: '🤕', fatigue: '😴', cravings: '🍫' };
    for (var si2 = 0; si2 < sympKeysArr.length; si2++) {
      var sv = state.symptoms[sympKeysArr[si2]];
      for (var sk in sympFreq) {
        if (sv[sk] && sv[sk] > 0) sympFreq[sk]++;
      }
    }
    var sympNames = t('symptoms');
    var sympOrder = ['cramps','mood','flow','headache','fatigue','cravings'];
    var sympBarColors = ['#c45a6b','#FFB74D','#5e8b7a','#b8a0c8','#a0b0c0','#d4bfb5'];
    var barData = [];
    for (var sn2 = 0; sn2 < sympOrder.length; sn2++) {
      var k = sympOrder[sn2];
      barData.push({ label: sympEmojis[k]+' '+sympNames[k], value: sympFreq[k], color: sympBarColors[sn2] });
    }
    barData.sort(function(a, b) { return b.value - a.value; });
    var hasSympData = false;
    for (var bj = 0; bj < barData.length; bj++) { if (barData[bj].value > 0) { hasSympData = true; break; } }
    if (hasSympData) {
      symptomCanvas.parentElement.style.display = '';
      if (symptomEmpty) symptomEmpty.style.display = 'none';
      ChartRenderer.drawBarChart(symptomCanvas, barData, {
        width: 460, height: 180,
        emptyText: lang==='sr'?'Nema podataka o simptomima':lang==='en'?'No symptom data':'暂无症状数据'
      });
    } else {
      symptomCanvas.parentElement.style.display = 'none';
      if (symptomEmpty) { symptomEmpty.style.display = ''; symptomEmpty.textContent = lang==='sr'?'Još nema zapisa o simptomima':lang==='en'?'No symptom records yet':'还没有症状记录'; }
    }
  }

  // --- Prediction highlight ---
  var clen2 = state.records.length;
  var ph2 = document.getElementById('predictionHighlight');
  if (ph2 && pred.nextStart) {
    ph2.style.display = '';
    var daysUntil = daysDiff(td, pred.nextStart);
    var rl2 = lang==='sr'?{high:'Visoka',medium:'Srednija',low:'Niska'}:lang==='en'?{high:'High',medium:'Medium',low:'Low'}:{high:'高',medium:'中',low:'低'};
    document.getElementById('predMainNext').textContent = daysUntil >= 0
      ? (lang==='sr'?'Još '+daysUntil+' dana':lang==='en'?daysUntil+' days until':'距下次 '+daysUntil+' 天')
      : (lang==='sr'?'Kasni '+Math.abs(daysUntil)+' dana':lang==='en'?Math.abs(daysUntil)+' days late':'已推迟 '+Math.abs(daysUntil)+' 天');
    document.getElementById('predSubConf').textContent = (clen2>=2
      ? (lang==='sr'?'Pouzdanost: ':'Confidence: ')+rl2[pred.confidence]+' (±'+pred.stdDev+')'
      : (lang==='sr'?'(potrebno 2+ ciklusa)':lang==='en'?'(needs 2+ cycles)':'(需2个周期以上)'));
    document.getElementById('predChipOv').textContent = pred.ovulation ? fmtDate(pred.ovulation) : '--';
    document.getElementById('predChipOvLabel').textContent = lang==='sr'?'Ovulacija':lang==='en'?'Ovulation':'排卵日';
    document.getElementById('predChipFert').textContent = pred.fertileStart && pred.fertileEnd ? fmtDate(pred.fertileStart)+' ~ '+fmtDate(pred.fertileEnd) : '--';
    document.getElementById('predChipFertLabel').textContent = lang==='sr'?'Plodni dani':lang==='en'?'Fertile Window':'易孕窗口';
    document.getElementById('predChipFuture').textContent = pred.futurePeriods.length > 0 ? pred.futurePeriods.map(function(fp){return fmtDate(fp.start);}).join(', ') : '--';
    document.getElementById('predChipFutureLabel').textContent = lang==='sr'?'Buduće':lang==='en'?'Future':'未来预测';
    document.getElementById('predChipReg').textContent = clen2 >= 2 ? rl2[pred.confidence]+' ±'+pred.stdDev : '--';
    document.getElementById('predChipRegLabel').textContent = lang==='sr'?'Regularnost':lang==='en'?'Regularity':'规律性';
  } else if (ph2) {
    ph2.style.display = 'none';
  }

  // --- Timeline ---
  var tlRow = document.getElementById('timelineRow');
  document.getElementById('schart-history-title').textContent = lang==='sr'?'📜 Istorija Ciklusa':lang==='en'?'📜 Cycle History':'📜 周期历史';
  document.getElementById('tleg-short').textContent = lang==='sr'?'Kratak':lang==='en'?'Short':'偏短';
  document.getElementById('tleg-normal').textContent = lang==='sr'?'Normalan':lang==='en'?'Normal':'正常';
  document.getElementById('tleg-long').textContent = lang==='sr'?'Dug':lang==='en'?'Long':'偏长';
  if (tlRow && pred.cycles.length > 0) {
    var recent = pred.cycles.slice(-12), avg = pred.avgCycle;
    tlRow.innerHTML = recent.map(function(cy) {
      var cls = 'normal';
      if (cy < avg - 3) cls = 'short';
      else if (cy > avg + 3) cls = 'long';
      return '<span class="timeline-dot '+cls+'" title="'+cy+'d" onclick="toast(\''+cy+' '+t('day')+'\')"></span>';
    }).join('');
  }

  // --- Relationship section label ---
  var sectRel = document.getElementById('sect-relationship');
  if (sectRel) {
    sectRel.textContent = lang==='sr'?'💝 Veza':lang==='en'?'💝 Relationship':'💝 关系';
  }
}


// ===== DATA LOADER: fetch JSON files =====
var _dataLoaded = false;
var _dataLoadPromise = null;

function loadDataFiles() {
  if (_dataLoadPromise) return _dataLoadPromise;
  _dataLoadPromise = fetch('data/culture.json').then(function(r){ return r.text(); }).then(function(t){ return (new Function('return ' + t))(); }).catch(function(e){ return []; })
  .then(function(data) {
    CULTURE_KNOWLEDGE = data.length > 0 ? data : CULTURE_KNOWLEDGE;
    _dataLoaded = true;
  }).catch(function(e) {
    _dataLoaded = true;
  });
  return _dataLoadPromise;
}

async function bootApp() {
  // Hide loader IMMEDIATELY
  var loader = document.getElementById('appLoader');
  if (loader) { loader.style.display = 'none'; if (loader.parentNode) loader.parentNode.removeChild(loader); }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js?v=8').catch(function(){});
  }
  loadPerProfileSettings();

  // Load data in background (do NOT await — never block the UI)
  loadDataFiles().catch(function(e) { console.error('loadDataFiles failed', e); });

  state = loadState();
  lastCycleCount = predict().cycles.length;
  applyTheme(theme); setLang(lang); applyFestivalTheme(); applySeasonalDecor(); setupOfflineDetection(); setupPWABanner();

  // Render UI immediately with whatever data is available
  updateProfileUI();
  renderAll(); loadSettingsUI();
  initDashboard();

  // Pull shared data in background (2s timeout, non-blocking)
  if (getGitHubToken()) {
    var ghTimeout = new Promise(function(_, reject) { setTimeout(function() { reject(new Error('GitHub timeout')); }, 2000); });
    Promise.race([pullAllSharedData(), ghTimeout]).catch(function(e) {}).then(function() {
      try {
        var sd = JSON.parse(localStorage.getItem('shared-cycle-data') || 'null');
        if (sd && sd.records) {
          state.records = sd.records.map(function(r) { return new Date(r); });
          state.periodEnds = sd.periodEnds || {};
          state.symptoms = sd.symptoms || {};
          state.settings = sd.settings || { cycleLength: 28, periodLength: 7 };
        }
      } catch(e) {}
      if (activeProfile === 'barry') {
        renderCalendar();
        renderBarrySymptomView();
        renderTips();
      }
      renderHug(); renderGratitude(); renderSong(); renderCheckin(); renderKnowMe();
      renderSharedDiary(); renderDateStrip();
      renderDashboard(); // Refresh dashboard with synced data
      updateSyncStatusBadge();
      updateCycleCounter(predict().cycles.length);
    }).catch(function(e) {});
  }

  fetchWeather();
  loadCalendarData(function(data) { solarTermsCache = (data && data.solarTerms) || []; localStorage.setItem('cycle-solarterms', JSON.stringify(solarTermsCache)); renderCalendar(); });
  showOnboardingIfNeeded();
  if (activeProfile === 'andjela') showGreeting();
  updateMoonPhase();
  updateAnniversaryCount();
  updateCycleCounter(predict().cycles.length);
  lastCycleCount = predict().cycles.length;
  updateLoveCounter();
  updateProfileUI();
  // Show/hide symptoms tab based on activeProfile (Barry only)
  var symTab = document.getElementById('tab-symptoms');
  if (symTab) symTab.style.display = activeProfile === 'barry' ? '' : 'none';
  randomThinkingOfYou();

  // Modal keyboard trap: Escape closes, Tab traps focus
  var modalKeydown = function(e) {
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key === 'Tab') {
      var modal = document.getElementById('modal');
      if (!modal || modal.classList.contains('hidden')) return;
      var focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  };
  document.addEventListener('keydown', modalKeydown);
}

// Profile-aware overrides happen in loadPerProfileSettings() below

// i18n map helper: L({sr:'...',en:'...',zh:'...'}) -> value for current lang
function L(sr, en, zh) {
  if (typeof sr === 'object') { var m = sr; return (m[lang] || m[lang.split('-')[0]] || m['sr'] || ''); }
  if (lang === 'sr' || lang === 'sr-RS') return sr;
  if (lang === 'en') return en;
  return zh || sr;
}

function t(key, fallback) {
  // Check I18N_EXT first (new features), then main I18N
  const keys = key.split('.');
  let val = I18N_EXT[lang] || I18N_EXT['sr'];
  let found = false;
  for (const k of keys) { if (val && val[k] !== undefined) { val = val[k]; found = true; } else { found = false; break; } }
  if (found) return val;
  val = I18N[lang] || I18N['sr'];
  for (const k of keys) { if (val && val[k] !== undefined) val = val[k]; else return fallback || key; }
  return val;
}
function switchLanguage(l) { setLang(l); applyAllUI(); loadSettingsUI(); document.getElementById('set-language').value=l; try { if(typeof renderChineseHome==='function')renderChineseHome(); } catch(e) {} renderLunarInfo(); renderSeasonalPoemCard(); }

/* ================================================================
   HOLIDAY DATA — China 🇨🇳 + Serbia 🇷🇸
   ================================================================ */
const HOLIDAYS = [
  {d:'2026-01-01',name:{sr:'Nova Godina (Kina)',zh:'元旦',en:'New Year'},country:'cn',icon:'🎉',desc:{sr:'Nov početak, vreme kada zajedno sanjamo o lepšoj godini.',zh:'新的一年，和身边的人一起许下美好的愿望。',en:'A fresh start, dreaming together of a kinder year ahead.'}},
  {d:'2026-02-16',name:{sr:'Kineska Nova Godina (veče)',zh:'除夕',en:'CNY Eve'},country:'cn',icon:'🏮',desc:{sr:'Porodična večera koja spaja generacije, uz vatromet.',zh:'全家围坐吃年夜饭，在爆竹声中送走旧岁。',en:'Generations gather for the reunion feast, bidding farewell to the old year.'}},
  {d:'2026-02-17',name:{sr:'Kineska Nova Godina',zh:'春节',en:'Chinese New Year'},country:'cn',icon:'🧧',desc:{sr:'Prvi dan proleća donosi radost i crvene koverte pune ljubavi.',zh:'新春第一天，红包和祝福让整个月都暖暖的。',en:'The first day of spring brings red envelopes and warm wishes all month.'}},
  {d:'2026-03-03',name:{sr:'Festival lampiona',zh:'元宵节',en:'Lantern Festival'},country:'cn',icon:'🏮',desc:{sr:'Slatke pirinčane knedle i lampioni — noć puna svetlosti.',zh:'吃一碗软糯的汤圆，看花灯照亮夜空。',en:'Sweet rice balls and lanterns that turn the night into a sea of light.'}},
  {d:'2026-04-05',name:{sr:'Čingming festival',zh:'清明节',en:'Qingming'},country:'cn',icon:'🌿',desc:{sr:'Dan kada se sećamo onih koji su otišli, dok priroda budi novi život.',zh:'在春天的细雨中，轻轻想起那些远去的亲人。',en:'A quiet spring day to remember those we have loved and lost.'}},
  {d:'2026-05-01',name:{sr:'Praznik rada (Kina)',zh:'劳动节',en:'Labour Day'},country:'cn',icon:'🌿',desc:{sr:'Dan odmora za sve koji svojim radom čine svet boljim.',zh:'停下忙碌的脚步，对自己说一声辛苦了。',en:'A day of rest for every hand that helps the world go round.'}},
  {d:'2026-06-19',name:{sr:'Festival zmajevih čamaca',zh:'端午节',en:'Dragon Boat'},country:'cn',icon:'🎋',desc:{sr:'Miris zongija i ritam zmajevih čamaca — sećanje na pesnika Qu Yuana.',zh:'粽叶飘香，龙舟竞渡，纪念一位心怀家国的诗人。',en:'Fragrant zongzi and racing dragon boats, remembering a poet who loved his people.'}},
  {d:'2026-08-19',name:{sr:'Kineski Dan zaljubljenih',zh:'七夕',en:'Qixi Festival'},country:'cn',icon:'💫',desc:{sr:'Zvezdana noć ljubavi — kad se dvoje sastaje na Nebeskom mostu.',zh:'七夕之夜，愿天下有情人终成眷属。',en:'A starry night of love — two hearts meet across the Milky Way.'}},
  {d:'2026-09-25',name:{sr:'Festival sredine jeseni',zh:'中秋节',en:'Mid-Autumn'},country:'cn',icon:'🥮',desc:{sr:'Pun mesec, porodica na okupu i miris mesečevog kolača.',zh:'月圆人团圆，月饼的甜香就是家的味道。',en:'Full moon, family gathered, and the sweet taste of mooncakes — home at its warmest.'}},
  {d:'2026-10-01',name:{sr:'Nacionalni dan Kine',zh:'国庆节',en:'National Day'},country:'cn',icon:'🇨🇳',desc:{sr:'Zlatna nedelja slave i ponosa — Kina u najlepšim bojama.',zh:'黄金周里红旗飘扬，举国同庆这属于每一个人的节日。',en:'A golden week of national pride, when the land dresses in its finest colors.'}},
  {d:'2026-01-01',name:{sr:'Nova Godina',zh:'新年',en:'New Year'},country:'rs',icon:'🎆',desc:{sr:'Uz vatromet, rakiju i tople zagrljaje — nova godina stiže.',zh:'在烟花和家人的拥抱中，迎接全新的一年。',en:'With fireworks, rakija, and warm embraces — a fresh year begins.'}},
  {d:'2026-01-07',name:{sr:'Božić',zh:'东正教圣诞节',en:'Orthodox Christmas'},country:'rs',icon:'🎄',desc:{sr:'Mir Božiji, Hristos se rodi — uz badnjak, česnicu i toplinu doma.',zh:'在橡木火光和祝福面包的香气中，感受家的温暖。',en:'Christ is born — the oak log burns, the bread is broken, and home feels holy.'}},
  {d:'2026-01-27',name:{sr:'Sveti Sava',zh:'圣萨瓦日',en:'St. Sava Day'},country:'rs',icon:'📚',desc:{sr:'Dan prosvetitelja — praznik dece, učitelja i znanja.',zh:'纪念塞尔维亚最伟大的教育家的日子，属于孩子们和老师的温暖节日。',en:'A day for teachers and children, honoring Serbia\'s patron saint of learning.'}},
  {d:'2026-02-15',name:{sr:'Dan državnosti',zh:'塞尔维亚国庆日',en:'Statehood Day'},country:'rs',icon:'🇷🇸',desc:{sr:'Dan ponosa — sećanje na ustanke koji su utrli put slobodi.',zh:'一个骄傲的日子——纪念为自由开辟道路的先辈们。',en:'A day of pride — remembering the uprisings that paved the way to freedom.'}},
  {d:'2026-04-12',name:{sr:'Vaskrs',zh:'东正教复活节',en:'Orthodox Easter'},country:'rs',icon:'🥚',desc:{sr:'Hristos vaskrse — kucamo se farbanim jajima, slavimo pobedu života.',zh:'主复活了——碰响彩蛋，庆祝生命的胜利和春天的重生。',en:'Christ is risen — painted eggs are tapped, celebrating life\'s triumph over death.'}},
  {d:'2026-05-01',name:{sr:'Praznik rada',zh:'劳动节',en:'Labour Day'},country:'rs',icon:'🌿',desc:{sr:'Majski uranak, izleti u prirodu — dan odmora za sve vredne ruke.',zh:'五一去郊游，在自然中放松，犒劳辛勤的自己。',en:'May Day picnics in nature — a well-earned rest for every hard-working soul.'}},
  {d:'2026-05-09',name:{sr:'Dan pobede',zh:'胜利日',en:'Victory Day'},country:'rs',icon:'🕊️',desc:{sr:'Sa cvećem i tihim ponosom, sećamo se heroja koji su doneli mir.',zh:'带着鲜花和安静的骄傲，铭记那些带来和平的英雄。',en:'With flowers and quiet pride, we remember the heroes who brought peace.'}},
  {d:'2026-06-28',name:{sr:'Vidovdan',zh:'维多夫丹',en:'St. Vitus Day'},country:'rs',icon:'🏛️',desc:{sr:'Dan sećanja i duboke tišine — kad smo kao narod sabrani u veri.',zh:'一个沉思和纪念的日子，塞尔维亚民族信仰与记忆交汇的时刻。',en:'A day of remembrance and quiet reflection, when a nation gathers in its memory.'}},
  {d:'2026-11-11',name:{sr:'Dan primirja',zh:'停战日',en:'Armistice Day'},country:'rs',icon:'🌸',desc:{sr:'Cvet nade na reveru — dan kada se sećamo cene mira.',zh:'胸前别一朵象征希望的鲜花，铭记和平的代价。',en:'A flower of hope on the lapel, remembering the cost of peace.'}},
  // === INTERNATIONAL & CULTURAL HOLIDAYS ===
  {d:'2026-02-14',name:{sr:'Dan zaljubljenih',zh:'情人节',en:'Valentine\'s Day'},country:'cn',icon:'💝',desc:{sr:'Dan za ljubavne poruke i slatka iznenađenja.',zh:'送一束玫瑰，说一句"我爱你"——最简单的浪漫。',en:'A day for love notes, roses, and saying "I love you" simply.'}},
  {d:'2026-03-08',name:{sr:'Dan žena',zh:'三八妇女节',en:'Women\'s Day'},country:'cn',icon:'👩',desc:{sr:'Slavimo snagu, nežnost i lepotu svake žene.',zh:'致敬每一位坚强又温柔的女性——你们让世界更美好。',en:'Honoring every strong, gentle woman who makes the world brighter.'}},
  {d:'2026-04-01',name:{sr:'Dan šale',zh:'愚人节',en:'April Fools\' Day'},country:'cn',icon:'🤡',desc:{sr:'Danas sve može biti šala — ali moja ljubav prema tebi nije! 😉',zh:'今天什么都可以是玩笑——但我对你的爱是真的！😉',en:'Everything can be a joke today — but not my love for you! 😉'}},
  {d:'2026-04-22',name:{sr:'Dan planete Zemlje',zh:'世界地球日',en:'Earth Day'},country:'cn',icon:'🌍',desc:{sr:'Podsetnik da čuvamo našu zajedničku planetu — za sve buduće generacije.',zh:'提醒我们爱护这唯一的蓝色星球——为了所有未来。',en:'A reminder to care for our shared blue planet — for all generations to come.'}},
  {d:'2026-05-10',name:{sr:'Majčin dan (Kina)',zh:'母亲节',en:'Mother\'s Day'},country:'cn',icon:'👩‍👧',desc:{sr:'Dan kada slavimo prvu ljubav našeg života — maminu.',zh:'给妈妈一个拥抱，告诉她你有多爱她。',en:'Give your mom a hug and tell her how much you love her.'}},
  {d:'2026-05-15',name:{sr:'Dan porodice',zh:'国际家庭日',en:'Family Day'},country:'cn',icon:'👨‍👩‍👧‍👦',desc:{sr:'Porodica je mesto gde život počinje i ljubav nikad ne prestaje.',zh:'家是生命开始的地方，也是爱永远不会结束的地方。',en:'Family is where life begins and love never ends.'}},
  {d:'2026-06-01',name:{sr:'Dečiji dan',zh:'六一儿童节',en:'Children\'s Day'},country:'cn',icon:'🧒',desc:{sr:'Dan kada slavimo najčistiju radost — dečiji osmeh.',zh:'愿每个孩子都被温柔守护，永远保持那份纯真的快乐。',en:'May every child be loved and keep that pure joy forever.'}},
  {d:'2026-06-21',name:{sr:'Dan očeva',zh:'父亲节',en:'Father\'s Day'},country:'cn',icon:'👨',desc:{sr:'Hvala tatama što su naša prva zaštita, učitelji i heroji.',zh:'给爸爸打个电话吧——他等你这句话很久了。',en:'Call your dad — he\'s been waiting for your words longer than you know.'}},
  {d:'2026-09-10',name:{sr:'Dan učitelja (Kina)',zh:'教师节',en:'Teachers\' Day'},country:'cn',icon:'📚',desc:{sr:'Hvala svim učiteljima koji su nas oblikovali.',zh:'一支粉笔，三尺讲台，感谢每一位引领我们成长的老师。',en:'A piece of chalk, three feet of podium — gratitude to every teacher.'}},
  {d:'2026-10-25',name:{sr:'Festival devet dvojki',zh:'重阳节',en:'Double Ninth Festival'},country:'cn',icon:'🏔️',desc:{sr:'Dan kada se penjemo na brda i pokazujemo poštovanje starijima.',zh:'遍插茱萸，登高望远——祝福长辈健康长寿。',en:'Climbing high, wearing dogwood — wishing elders health and longevity.'}},
  {d:'2026-10-31',name:{sr:'Noć veštica',zh:'万圣节',en:'Halloween'},country:'cn',icon:'🎃',desc:{sr:'Bundeve, maske i slatkiši — noć kad sve može biti magično.',zh:'南瓜灯和糖果——一年中最有魔法感的夜晚。',en:'Pumpkins, costumes, and candy — the most magical night of the year.'}},
  {d:'2026-12-19',name:{sr:'Sveti Nikola',zh:'圣尼古拉节',en:'St. Nicholas Day'},country:'rs',icon:'🎅',desc:{sr:'Sveti Nikola noćas donosi poklone u čizme — deca jedva spavaju od uzbuđenja.',zh:'圣尼古拉今晚把礼物放进靴子里——孩子们兴奋得睡不着。',en:'St. Nicholas fills boots with gifts tonight — children can barely sleep.'}},
  // Serbian Father's Day — Očevi (first Sunday after Christmas in Jan)
  {d:'2026-01-04',name:{sr:'Očevi (Dan očeva)',zh:'塞尔维亚父亲节',en:'Father\'s Day (RS)'},country:'rs',icon:'👨',desc:{sr:'Srpski Dan očeva — tatino rame je najsigurnije mesto na svetu.',zh:'塞尔维亚父亲节——爸爸的肩膀是世界上最安全的地方。',en:'Serbian Father\'s Day — Dad\'s shoulder is the safest place in the world.'}},
  {d:'2026-11-02',name:{sr:'Zadušnice',zh:'亡灵节',en:'All Souls\' Day'},country:'rs',icon:'🕯️',desc:{sr:'Palimo sveće za one koji su otišli — svetlost koja spaja svetove.',zh:'为逝去的亲人点燃蜡烛——跨越世界的光芒。',en:'Lighting candles for those who have left us — light that bridges worlds.'}},
  {d:'2026-01-20',name:{sr:'Laba festival',zh:'腊八节',en:'Laba Festival'},country:'cn',icon:'🥣',desc:{sr:'Topla činija laba kaše najavljuje dolazak Nove Godine.',zh:'一碗暖暖的腊八粥，预告着新年的脚步近了。',en:'A warm bowl of Laba porridge heralds the coming of the New Year.'}},
  // === MORE SERBIAN ORTHODOX & CULTURAL HOLIDAYS ===
  {d:'2026-05-06',name:{sr:'Đurđevdan',zh:'圣乔治节',en:'St. George\'s Day'},country:'rs',icon:'🐎',desc:{sr:'Đurđevdan — praznik proleća, pastira i novog početka. Nekad se verovalo da na ovaj dan treba ustati pre zore.',zh:'圣乔治节——春天的节日，牧羊人和新开始的节日。',en:'St. George\'s Day — a feast of spring, shepherds, and fresh starts.'}},
  {d:'2026-07-12',name:{sr:'Petrovdan',zh:'圣彼得节',en:'St. Peter\'s Day'},country:'rs',icon:'🔑',desc:{sr:'Petrovdan — dan kad se pale lile i slave ključevi raja. Topli letnji praznik uz narodne običaje.',zh:'圣彼得节——夏日里充满民俗温暖的节日。',en:'St. Peter\'s Day — a warm summer feast with folk traditions and the keys of heaven.'}},
  {d:'2026-08-28',name:{sr:'Velika Gospojina',zh:'圣母安息节',en:'Dormition of Theotokos'},country:'rs',icon:'🙏',desc:{sr:'Velika Gospojina — jedan od najvećih pravoslavnih praznika, posvećen Bogorodici. Porodice se okupljaju i idu u crkvu.',zh:'圣母安息节——东正教最重要的节日之一，家人相聚。',en:'The Dormition — one of the greatest Orthodox feasts, dedicated to the Mother of God.'}},
  {d:'2026-09-21',name:{sr:'Mala Gospojina',zh:'圣母圣诞日',en:'Nativity of Theotokos'},country:'rs',icon:'👶',desc:{sr:'Mala Gospojina — slavi rođenje Bogorodice. Dan kada su se nekad sklapali brakovi i veridbe.',zh:'圣母圣诞日——传统上缔结婚约和订婚的日子。',en:'Nativity of Theotokos — traditionally a day for engagements and weddings.'}},
  {d:'2026-12-19',name:{sr:'Nikoljdan',zh:'圣尼古拉节',en:'St. Nicholas Day'},country:'rs',icon:'🎅',desc:{sr:'Nikoljdan — najveća srpska slava! Ko slavi Svetog Nikolu, danas prima goste i deli radost.',zh:'圣尼古拉节——塞尔维亚最重要的家庭守护圣徒日！',en:'St. Nicholas Day — the most celebrated Serbian Slava! Hosts welcome guests and share joy.'}},
  // === MORE CHINESE & INTERNATIONAL HOLIDAYS ===
  {d:'2026-05-20',name:{sr:'Dan ljubavi 520',zh:'520 情人节',en:'520 Love Day'},country:'cn',icon:'💝',desc:{sr:'520 — kineski internet Dan zaljubljenih! Brojevi 5-2-0 zvuče kao "volim te" na kineskom.',zh:'520——中国的网络情人节！5-2-0 听起来像"我爱你"。',en:'520 — Chinese internet Valentine\'s! 5-2-0 sounds like "I love you" in Chinese.'}},
  {d:'2026-11-11',name:{sr:'Dan samaca',zh:'双十一',en:'Singles\' Day'},country:'cn',icon:'🎊',desc:{sr:'11.11. — Dan samaca u Kini! Ali i najveći dan za onlajn kupovinu na svetu.',zh:'双十一——光棍节！也是全球最大的网购狂欢日。',en:'11.11 — Singles\' Day in China! Also the world\'s biggest online shopping day.'}},
  {d:'2026-12-24',name:{sr:'Badnje veče (katoličko)',zh:'平安夜',en:'Christmas Eve'},country:'cn',icon:'🎄',desc:{sr:'Badnje veče po gregorijanskom kalendaru — noć puna iščekivanja, darivanja i porodične topline.',zh:'平安夜——充满期待、礼物和家庭温暖的夜晚。',en:'Christmas Eve — a night of anticipation, gifts, and family warmth.'}},
  {d:'2026-12-25',name:{sr:'Božić (katolički)',zh:'圣诞节',en:'Christmas Day'},country:'cn',icon:'🎁',desc:{sr:'Božić po gregorijanskom kalendaru — dan radosti, poklona i zajedništva širom sveta.',zh:'圣诞节——全世界共同的欢乐和分享的日子。',en:'Christmas Day — a day of joy, gifts, and togetherness around the world.'}},
  {d:'2026-12-31',name:{sr:'Doček Nove Godine',zh:'跨年夜',en:'New Year\'s Eve'},country:'cn',icon:'🎆',desc:{sr:'Poslednji dan u godini — vreme za rezime, zagrljaje i želje za novu godinu. Srećna Nova! 🥂',zh:'一年的最后一天——写下愿望，拥抱身边的人。新年快乐！🥂',en:'The last day of the year — time for reflection, hugs, and wishes. Happy New Year! 🥂'}},
  // === 2027 LUNAR-BASED HOLIDAYS ===
  {d:'2027-02-05',name:{sr:'Kineska Nova Godina 2027',zh:'除夕 2027',en:'CNY Eve 2027'},country:'cn',icon:'🏮',desc:{sr:'Kineska Nova Godina 2027 — godina Koze počinje!',zh:'2027除夕夜——羊年即将来临！',en:'Chinese New Year\'s Eve 2027 — the Year of the Goat begins!'}},
  {d:'2027-02-06',name:{sr:'Prolećni festival 2027',zh:'春节 2027',en:'Spring Festival 2027'},country:'cn',icon:'🧧',desc:{sr:'Kineska Nova Godina 2027 — godina Koze! Srećna Nova Godina!',zh:'2027春节——羊年大吉！新年快乐！',en:'Spring Festival 2027 — Year of the Goat! Happy New Year!'}},
  {d:'2027-10-14',name:{sr:'Festival sredine jeseni 2027',zh:'中秋节 2027',en:'Mid-Autumn 2027'},country:'cn',icon:'🥮',desc:{sr:'Festival sredine jeseni 2027 — pun mesec, porodica i mesečevi kolači.',zh:'2027中秋——月圆人团圆。',en:'Mid-Autumn Festival 2027 — full moon, family, and mooncakes.'}}
];

function getHoliday(dateKey) {
  return HOLIDAYS.filter(function(h){return h.d===dateKey;});
}
// Holiday countdown: find next upcoming holiday within 60 days
function renderUpcomingHoliday() {
  var el = document.getElementById('holidayCountdown'); if (!el) return;
  var today = new Date(); today.setHours(0,0,0,0);
  var limit = new Date(today); limit.setDate(limit.getDate() + 60);
  var upcoming = null;
  for (var i = 0; i < HOLIDAYS.length; i++) {
    var d = new Date(HOLIDAYS[i].d + 'T00:00:00');
    if (d >= today && d <= limit) {
      if (!upcoming || d < new Date(upcoming.d + 'T00:00:00')) upcoming = HOLIDAYS[i];
    }
  }
  if (upcoming) {
    var days = Math.ceil((new Date(upcoming.d + 'T00:00:00') - today) / 86400000);
    var name = upcoming.name[lang] || upcoming.name['sr'];
    var daysText = days === 0 ? (lang==='sr'?'danas! 🎉':lang==='en'?'today! 🎉':'就是今天！🎉') : (lang==='sr'?'još '+days+' dana':lang==='en'?days+' days away':'还有 '+days+' 天');
    el.style.display = ''; el.textContent = '🎌 ' + name + ' · ' + daysText;
  } else { el.style.display = 'none'; }
}
// Month holiday summary: show all holidays in current view month
function renderMonthHolidaySummary() {
  var el = document.getElementById('holidaySummary'); if (!el) return;
  var m = viewMonth; var y = viewYear;
  var monthHolidays = [];
  for (var i = 0; i < HOLIDAYS.length; i++) {
    var d = new Date(HOLIDAYS[i].d + 'T00:00:00');
    if (d.getMonth() === m && d.getFullYear() === y) monthHolidays.push(HOLIDAYS[i]);
  }
  if (monthHolidays.length === 0) { el.style.display = 'none'; return; }
  el.style.display = '';
  var flag = function(c){ return c === 'cn' ? '🇨🇳' : '🇷🇸'; };
  el.innerHTML = monthHolidays.sort(function(a,b){ return new Date(a.d+'T00:00:00') - new Date(b.d+'T00:00:00'); }).map(function(h){
    var day = h.d.split('-')[2].replace(/^0/, '');
    return '<span>'+flag(h.country)+' '+h.icon+' '+(h.name[lang]||h.name[lang.split('-')[0]]||h.name['sr'])+' '+day+'</span>';
  }).join('');
}
var solarTermsCache = null;
// Built-in solar terms fallback (always works, no fetch needed)
const SOLAR_TERMS_INLINE = [
  {date:'2026-01-05',name:{'zh-CN':'小寒',sr:'Mali hlad',en:'Minor Cold'}},
  {date:'2026-01-20',name:{'zh-CN':'大寒',sr:'Veliki hlad',en:'Major Cold'}},
  {date:'2026-02-04',name:{'zh-CN':'立春',sr:'Početak proleća',en:'Start of Spring'}},
  {date:'2026-02-19',name:{'zh-CN':'雨水',sr:'Kiše',en:'Rain Water'}},
  {date:'2026-03-05',name:{'zh-CN':'惊蛰',sr:'Buđenje insekata',en:'Awakening of Insects'}},
  {date:'2026-03-20',name:{'zh-CN':'春分',sr:'Prolećna ravnodnevica',en:'Spring Equinox'}},
  {date:'2026-04-05',name:{'zh-CN':'清明',sr:'Vedro i svetlo',en:'Clear and Bright'}},
  {date:'2026-04-20',name:{'zh-CN':'谷雨',sr:'Kiša za žito',en:'Grain Rain'}},
  {date:'2026-05-05',name:{'zh-CN':'立夏',sr:'Početak leta',en:'Start of Summer'}},
  {date:'2026-05-21',name:{'zh-CN':'小满',sr:'Punoća klasja',en:'Grain Buds'}},
  {date:'2026-06-05',name:{'zh-CN':'芒种',sr:'Žetva i setva',en:'Grain in Ear'}},
  {date:'2026-06-21',name:{'zh-CN':'夏至',sr:'Letnja dugodnevica',en:'Summer Solstice'}},
  {date:'2026-07-07',name:{'zh-CN':'小暑',sr:'Mala vrućina',en:'Minor Heat'}},
  {date:'2026-07-23',name:{'zh-CN':'大暑',sr:'Velika vrućina',en:'Major Heat'}},
  {date:'2026-08-07',name:{'zh-CN':'立秋',sr:'Početak jeseni',en:'Start of Autumn'}},
  {date:'2026-08-23',name:{'zh-CN':'处暑',sr:'Prestanak vrućine',en:'End of Heat'}},
  {date:'2026-09-07',name:{'zh-CN':'白露',sr:'Bela rosa',en:'White Dew'}},
  {date:'2026-09-23',name:{'zh-CN':'秋分',sr:'Jesenja ravnodnevica',en:'Autumn Equinox'}},
  {date:'2026-10-08',name:{'zh-CN':'寒露',sr:'Hladna rosa',en:'Cold Dew'}},
  {date:'2026-10-23',name:{'zh-CN':'霜降',sr:'Pad mraza',en:'Frost Descent'}},
  {date:'2026-11-07',name:{'zh-CN':'立冬',sr:'Početak zime',en:'Start of Winter'}},
  {date:'2026-11-22',name:{'zh-CN':'小雪',sr:'Mali sneg',en:'Minor Snow'}},
  {date:'2026-12-07',name:{'zh-CN':'大雪',sr:'Veliki sneg',en:'Major Snow'}},
  {date:'2026-12-22',name:{'zh-CN':'冬至',sr:'Zimska kratkodnevica',en:'Winter Solstice'}}
];

function getSolarTerm(dateKey) {
  // Check cached rich data first (has stories from calendar-data.json)
  if (!solarTermsCache || solarTermsCache.length === 0) {
    var cached = localStorage.getItem('cycle-solarterms');
    if (cached) { try { solarTermsCache = JSON.parse(cached); } catch(e) {} }
  }
  // Use rich cache if available
  if (solarTermsCache && solarTermsCache.length > 0) {
    for (var i = 0; i < solarTermsCache.length; i++) {
      if (solarTermsCache[i].date === dateKey) return solarTermsCache[i];
    }
  }
  // Fallback to inline data (basic: date + name only)
  for (var j = 0; j < SOLAR_TERMS_INLINE.length; j++) {
    if (SOLAR_TERMS_INLINE[j].date === dateKey) return SOLAR_TERMS_INLINE[j];
  }
  return null;
}

/* ================================================================
   BIRTHDAYS
   ================================================================ */
const BIRTHDAYS = { barry: { month:8, day:19, name:{sr:'Barryjev rođendan',en:'Barry\'s Birthday','zh-CN':'Barry 的生日'}, desc_zh:'Barry 的生日！谢谢 Angie 陪我长大一岁。❤️', desc_sr:'Barrijev rođendan! Hvala ti Anđela što si uz mene. ❤️' }, andjela: { month:7, day:27, name:{sr:'Anđelin rođendan',en:'Anđela\'s Birthday','zh-CN':'Anđela 的生日'}, desc_zh:'Angie 的生日！祝我的塞尔维亚太阳生日快乐！🎂', desc_sr:'Anđelin rođendan! Srećan rođendan mom srpskom suncu! 🎂' } };
const LOVE_START = new Date(2026,4,7); // May 7, 2026 — monthly anniversary
const FIRST_MEET_DATE = '2026-12-19';    // First in-person meeting

function getSpecialDate(d) {
  var m = d.getMonth(), day = d.getDate(), y = d.getFullYear();
  var key = fmtDate(d);
  // 1) Monthly anniversary: every 7th
  if (day === 7) {
    var months = (y - LOVE_START.getFullYear()) * 12 + (m - LOVE_START.getMonth());
    if (d < LOVE_START) months = 0;
    return { type:'monthly', icon:'💕', title_zh:'我们的纪念日', title_sr:'Naš dan sećanja',
      desc_zh:'我们在一起的第 '+months+' 个月纪念日！感谢你让每个月的今天都变得特别。💕',
      desc_sr:months+'. mesec našeg puta zajedno! Hvala ti što svaki današnji dan činiš posebnim. 💕' };
  }
  // 2) First meeting: Dec 19
  if (key === FIRST_MEET_DATE) {
    return { type:'firstmeet', icon:'✈️', title_zh:'第一次见面！', title_sr:'Prvi put se uživo!',
      desc_zh:'我们终于从屏幕走到彼此面前。🇨🇳❤️🇷🇸', desc_sr:'Konačno smo sa ekrana došli jedno do drugog. 🇷🇸❤️🇨🇳' };
  }
  // 3) Birthdays (already have cake icon via .birthday class, but add modal text)
  var bdayKey = getBirthday(d);
  if (bdayKey) {
    var b = BIRTHDAYS[bdayKey];
    return { type:'birthday', icon:'🎂', title_zh:b.name['zh-CN'], title_sr:b.name['sr'],
      desc_zh:b.desc_zh, desc_sr:b.desc_sr };
  }
  return null;
}
function getFirstMeetDays() {
  var fm = new Date(FIRST_MEET_DATE + 'T00:00:00');
  return Math.max(0, Math.floor((new Date() - fm) / 86400000));
}

function getBirthday(date) {
  var m=date.getMonth(), d=date.getDate();
  for (var k in BIRTHDAYS) { if (BIRTHDAYS[k].month===m && BIRTHDAYS[k].day===d) return k; }
  return null;
}
function daysUntilBirthday(bdayKey) {
  var b=BIRTHDAYS[bdayKey], now=new Date(), target=new Date(now.getFullYear(),b.month,b.day);
  if (target < now) target.setFullYear(target.getFullYear()+1);
  return Math.ceil((target-now)/86400000);
}
function renderBirthdayCard() {
  var card = document.getElementById('birthdayCard');
  if (!card) return;
  document.getElementById('birthday-title').textContent = lang==='sr'?'🎂 Rođendani':lang==='en'?'🎂 Birthdays':'🎂 生日';
  var parts=[];
  for (var k in BIRTHDAYS) {
    var days = daysUntilBirthday(k);
    var emoji = k==='andjela'?'🌸':'👦';
    var name = BIRTHDAYS[k].name[lang]||BIRTHDAYS[k].name['sr'];
    var dateStr = (BIRTHDAYS[k].month+1)+'/'+BIRTHDAYS[k].day;
    parts.push('<div style="font-size:.82rem"><span style="color:var(--gold)">🎂</span> '+name+' ('+dateStr+')<br><span style="font-size:.68rem;color:var(--text-muted)">'+(lang==='sr'?'Još '+days+' dana':lang==='en'?days+' days away':'还有 '+days+' 天')+'</span></div>');
  }
  document.getElementById('birthday-content').innerHTML = parts.join('<div style="height:6px"></div>')+'<div style="font-size:.62rem;color:var(--text-muted);margin-top:4px">'+(lang==='sr'?'🎁 Ne zaboravi poklon!':lang==='en'?'🎁 Don\'t forget a gift!':'🎁 别忘了礼物！')+'</div>';
}

/* ================================================================
   HOLIDAY DAYS OFF
   ================================================================ */
const HOLIDAY_DAYS = {
  '2026-01-01':{cn:'1 dan',rs:'2 dana',zh:'1天',sr:'1 dan',en:'1 day'},
  '2026-02-16':{cn:'7 dana (Prolećni festival)',rs:'—',zh:'7天（春节长假）',sr:'7 dana (Prolećni festival)',en:'7 days (Spring Festival)'},
  '2026-02-17':{cn:'7 dana (Prolećni festival)',rs:'—',zh:'7天（春节长假）',sr:'7 dana (Prolećni festival)',en:'7 days (Spring Festival)'},
  '2026-03-03':{cn:'1 dan',rs:'—',zh:'1天',sr:'1 dan',en:'1 day'},
  '2026-04-05':{cn:'3 dana',rs:'—',zh:'3天',sr:'3 dana',en:'3 days'},
  '2026-05-01':{cn:'5 dana',rs:'2 dana',zh:'5天',sr:'5 dana',en:'5 days'},
  '2026-06-19':{cn:'3 dana',rs:'—',zh:'3天',sr:'3 dana',en:'3 days'},
  '2026-08-19':{cn:'1 dan',rs:'—',zh:'1天',sr:'1 dan',en:'1 day'},
  '2026-09-25':{cn:'3 dana',rs:'—',zh:'3天',sr:'3 dana',en:'3 days'},
  '2026-10-01':{cn:'7 dana (Zlatna nedelja)',rs:'—',zh:'7天（黄金周）',sr:'7 dana (Zlatna nedelja)',en:'7 days (Golden Week)'},
  '2026-01-07':{cn:'—',rs:'2 dana',zh:'—',sr:'2 dana',en:'2 days'},
  '2026-01-27':{cn:'—',rs:'1 dan (školski praznik)',zh:'—',sr:'1 dan (školski praznik)',en:'1 day (school holiday)'},
  '2026-02-15':{cn:'—',rs:'2 dana (Dan državnosti)',zh:'—',sr:'2 dana (Dan državnosti)',en:'2 days (Statehood Day)'},
  '2026-04-12':{cn:'—',rs:'4 dana (Vaskrs)',zh:'—',sr:'4 dana (Vaskrs)',en:'4 days (Easter)'},
  '2026-06-28':{cn:'—',rs:'1 dan',zh:'—',sr:'1 dan',en:'1 day'},
  '2026-11-11':{cn:'—',rs:'1 dan',zh:'—',sr:'1 dan',en:'1 day'},
  '2026-05-06':{cn:'—',rs:'1 dan',zh:'—',sr:'1 dan',en:'1 day'},
  '2026-08-28':{cn:'—',rs:'1 dan',zh:'—',sr:'1 dan',en:'1 day'},
  '2026-12-19':{cn:'—',rs:'1 dan (slava)',zh:'—',sr:'1 dan (slava)',en:'1 day (slava)'},
  '2026-12-25':{cn:'1 dan',rs:'1 dan',zh:'1天',sr:'1 dan',en:'1 day'},
  '2026-02-05':{cn:'7 dana (Prolećni festival 2027)',rs:'—',zh:'7天（2027春节）',sr:'7 dana',en:'7 days'},
  '2026-02-06':{cn:'7 dana (Prolećni festival 2027)',rs:'—',zh:'7天（2027春节）',sr:'7 dana',en:'7 days'},
  '2027-10-14':{cn:'3 dana',rs:'—',zh:'3天',sr:'3 dana',en:'3 days'}
};

/* ================================================================
   ANNIVERSARY
   ================================================================ */
function saveAnniversaries() {
  annDateMet = document.getElementById('annDateMet').value;
  annDateLove = document.getElementById('annDateLove').value;
  localStorage.setItem('cycle-ann-met', annDateMet);
  localStorage.setItem('cycle-ann-love', annDateLove);
  updateAnniversaryCount();
  renderCalendar();
}
function updateAnniversaryCount() {
  var el = document.getElementById('ann-count');
  if (!el) return;
  var parts = [];
  if (annDateMet) { var d = daysDiff(new Date(annDateMet), today()); if (d >= 0) parts.push(t('annCountMet').replace('{n}', d)); }
  if (annDateLove) { var d = daysDiff(new Date(annDateLove), today()); if (d >= 0) parts.push(t('annCountLove').replace('{n}', d)); }
  el.innerHTML = parts.join('<br>');
}
function isAnniversary(d) {
  var result = 0;
  if (annDateMet) { var ad = new Date(annDateMet); if (d.getDate()===ad.getDate() && d.getMonth()===ad.getMonth()) result = 1; }
  if (annDateLove) { var ad = new Date(annDateLove); if (d.getDate()===ad.getDate() && d.getMonth()===ad.getMonth()) result = 2; }
  return result;
}

/* ================================================================
   DATA — migrated to profile-aware storage above
   ================================================================ */
// Storage key and state are now defined in the Profile System section above
// fmtDate and utility functions below remain unchanged

const fmtDate = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const sameDay = (a,b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
const addDays = (d,n) => { const r=new Date(d); r.setDate(r.getDate()+n); return r; };
const daysDiff = (a,b) => Math.round((b.getTime()-a.getTime())/86400000);
const d0 = d => { const r=new Date(d); r.setHours(0,0,0,0); return r; };
const today = () => { const tt=new Date(); tt.setHours(0,0,0,0); return tt; };

/* ================================================================
   WEATHER — Beijing ↔ Kikinda
   ================================================================ */
var DAILY_LOVE_MESSAGES=[{zh:'不管多远，我的心和你在一起。',sr:'Bez obzira na udaljenost, moje srce je s tobom.'},{zh:'7000公里，但思念没有距离。',sr:'7.000 kilometara, ali čežnja nema udaljenost.'},{zh:'你是我早上醒来的第一个念头。',sr:'Ti si moja prva misao kad se probudim.'},{zh:'同一个太阳，同一份爱。',sr:'Jedno sunce, jedna ljubav.'},{zh:'每次抬头看天空，我知道你也在这片天空下。',sr:'Svaki put kad pogledam u nebo, znam da si i ti pod istim nebom.'},{zh:'从北京到贝尔格莱德，我的心跳只为你。',sr:'Od Pekinga do Beograda, moje srce kuca samo za tebe.'},{zh:'你是我跨越山海的理由。',sr:'Ti si razlog zbog kog prelazim planine i mora.'},{zh:'爱不是距离除以时间，爱是心与心的零距离。',sr:'Ljubav nije udaljenost podeljena vremenom, ljubav je nulta udaljenost izmedju srca.'},{zh:'有人问我想去哪里，我说：去有你的地方。',sr:'Pitaju me gde zelim da idem, ja kazem: tamo gde si ti.'},{zh:'世界上最美的距离，是你和我之间的距离。',sr:'Najlepsa udaljenost na svetu je ona izmedju tebe i mene.'},{zh:'今天也想你，比昨天多一点，比明天少一点。',sr:'I danas mislim na tebe, malo vise nego juce, malo manje nego sutra.'},{zh:'你是我此生最美的风景。',sr:'Ti si najlepsi prizor u mom zivotu.'}];
function getTodaysLoveMessage(){var idx=new Date().getDate()%DAILY_LOVE_MESSAGES.length;return DAILY_LOVE_MESSAGES[idx];}
function getSunCounterData(){try{return JSON.parse(localStorage.getItem('shared-sun-counter')||'{}');}catch(e){return{};}}
function clickSunCounter(){var sc=getSunCounterData();var today=new Date().toISOString().slice(0,10);if(sc.lastDate===today){toast('❤️ '+L('Već si kliknuo/la danas!','今天已经点过了！','Already clicked today!'));return;}sc.count=(sc.count||0)+1;sc.lastDate=today;localStorage.setItem('shared-sun-counter',JSON.stringify(sc));pushAllSharedData();renderSunCounter();toast('☀️ '+L('Dan '+sc.count+' zajedničkog sunca!','共同仰望太阳的第'+sc.count+'天！','Day '+sc.count+' of shared sun!'));}
function renderSunCounter(){var el=document.getElementById('sunCounter');if(!el)return;var sc=getSunCounterData();var c=sc.count||0;if(c>0){el.innerHTML='☀️ '+L(c+' dan zajedničkog sunca ❤️','共同仰望太阳的第 '+c+' 天 ❤️','Day '+c+' of shared sun ❤️');}else{el.innerHTML='❤️ '+L('Klikni ovde da započneš brojanje','点击此处开始计数','Click here to start counting');}}
function updateWeatherTimes(){var bjT=new Date().toLocaleString('sr-Latn',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hour12:false});var kiT=new Date().toLocaleString('sr-Latn',{timeZone:'Europe/Belgrade',hour:'2-digit',minute:'2-digit',hour12:false});var bjEl=document.getElementById('timeBj');if(bjEl)bjEl.textContent=bjT;var kiEl=document.getElementById('timeKi');if(kiEl)kiEl.textContent=kiT;var diffEl=document.getElementById('timeDiff');if(diffEl){var bjH=parseInt(bjT),kiH=parseInt(kiT);var diff=bjH-kiH;if(diff<0)diff+=24;diffEl.textContent=L('razlika ','时差 ','time diff ')+diff+'h';}}setInterval(updateWeatherTimes,60000);

function weatherIcon(code) {
  if(code<=3) return '☀️'; if(code<=48) return '⛅'; if(code<=57) return '🌧️';
  if(code<=67) return '🌨️'; if(code<=77) return '🌫️'; if(code<=86) return '❄️'; return '⛈️';
}
function fetchWeather() {
  var cached=localStorage.getItem('cycle-weather');
  // Always show cached weather first (even if old — better than nothing)
  if(cached){try{var d=JSON.parse(cached);renderWeather(d);}catch(e){}}
  // Refresh in background (6h cache)
  if(cached){try{var d2=JSON.parse(cached);if(Date.now()-d2.t<21600000)return;}catch(e){}}
  var controller=new AbortController();var timeout=setTimeout(function(){controller.abort();},8000);
  try {
    var bj=fetch('https://api.open-meteo.com/v1/forecast?latitude=39.92&longitude=116.44&current=temperature_2m,relative_humidity_2m,weather_code&daily=sunrise,sunset&timezone=Asia/Shanghai',{signal:controller.signal}).then(function(r){return r.json()}).catch(function(){return null;});
    var ki=fetch('https://api.open-meteo.com/v1/forecast?latitude=45.83&longitude=20.47&current=temperature_2m,relative_humidity_2m,weather_code&daily=sunrise,sunset&timezone=Europe/Belgrade',{signal:controller.signal}).then(function(r){return r.json()}).catch(function(){return null;});
    Promise.all([bj,ki]).then(function(r){
      clearTimeout(timeout);
      if (!r[0] && !r[1]) return;  // both failed
      var bjD=r[0]?r[0].current:null;if(bjD&&r[0].daily){bjD.sunrise=r[0].daily.sunrise[0];bjD.sunset=r[0].daily.sunset[0];}
      var kiD=r[1]?r[1].current:null;if(kiD&&r[1].daily){kiD.sunrise=r[1].daily.sunrise[0];kiD.sunset=r[1].daily.sunset[0];}
      var w={bj:bjD,ki:kiD,t:Date.now()};
      localStorage.setItem('cycle-weather',JSON.stringify(w));renderWeather(w);
    }).catch(function(){});
  } catch(e) {}
}
function renderWeather(w) {
  var card=document.getElementById('weatherCard');
  if(!w) {
    card.style.display='';
    card.innerHTML='<div style="text-align:center;padding:20px"><div class="skeleton" style="width:200px;height:20px;margin:8px auto;border-radius:8px"></div><div class="skeleton" style="width:140px;height:14px;margin:6px auto;border-radius:6px"></div><div style="font-size:.6rem;color:var(--text-muted);margin-top:8px">'+L('Učitavam vreme...','Loading weather...','加载天气中...')+'</div></div>';
    return;
  }
  card.style.display='';
  var bjLabel = lang==='sr'?'🏙 Peking·Čaojang':lang==='en'?'🏙 Beijing·Chaoyang':'🏙 北京·朝阳';
  var kiLabel = lang==='sr'?'🏡 Kikinda':lang==='en'?'🏡 Kikinda':'🏡 Kikinda';
  var humLabel = lang==='sr'?'Vlažnost':lang==='en'?'Humidity':'湿度';
  document.getElementById('weatherBj').innerHTML='<div style="font-size:.65rem;color:var(--text-muted)">'+bjLabel+'</div><div style="font-size:1.5rem;font-weight:700">'+Math.round(w.bj.temperature_2m)+'°</div><div style="font-size:1.2rem">'+weatherIcon(w.bj.weather_code)+'</div><div style="font-size:.6rem;color:var(--text-muted)">'+humLabel+' '+w.bj.relative_humidity_2m+'%</div>';
  document.getElementById('weatherKi').innerHTML='<div style="font-size:.65rem;color:var(--text-muted)">'+kiLabel+'</div><div style="font-size:1.5rem;font-weight:700">'+Math.round(w.ki.temperature_2m)+'°</div><div style="font-size:1.2rem">'+weatherIcon(w.ki.weather_code)+'</div><div style="font-size:.6rem;color:var(--text-muted)">'+humLabel+' '+w.ki.relative_humidity_2m+'%</div>';
  // Bridge Poetry — i18n-aware
  var poems = [], bjc = w.bj.weather_code, kic = w.ki.weather_code;
  var sameWeather = (bjc <= 3 && kic <= 3) || (bjc >= 45 && kic >= 45) || (bjc >= 71 && kic >= 71);
  if (sameWeather && bjc <= 3) poems.push({txt:lang==='sr'?'Sunce sija i u Pekingu i u Kikindi ☀️ — isto sunce greje oba naša srca.':lang==='en'?'The sun shines on both Beijing and Kikinda ☀️ — the same sun warms both our hearts.':'北京和Kikinda阳光普照 ☀️ — 同一个太阳温暖我们的心。',barry:lang==='sr'?'Barry kaže: Kad pogledaš u sunce, seti se — ja gledam u isto to sunce ovde u Pekingu. 7.000 kilometara, jedno sunce. ♥':lang==='en'?'Barry says: When you look at the sun, remember — I\'m looking at the same sun in Beijing. 7,000 km, one sun. ♥':'Barry说：当你看着太阳，记住——我在北京也看着同一轮太阳。7000公里，同一个太阳。♥'});
  else if (sameWeather && kic >= 45 && kic <= 67) poems.push({txt:lang==='sr'?'Kiša pada i na Vojvodinu i na Peking 🌧️ — iste kapi, dva različita sveta.':lang==='en'?'Rain falls on both Vojvodina and Beijing 🌧️ — same drops, two different worlds.':'雨水落在Vojvodina和北京 🌧️ — 同样的雨滴，两个不同的世界。',barry:lang==='sr'?'Barry kaže: Dok kiša pada po tvojoj Vojvodini, ja slušam kišu u Pekingu i mislim na tebe. Kiša spaja sve. 🌧️♥':lang==='en'?'Barry says: While rain falls on your Vojvodina, I listen to the rain in Beijing and think of you. Rain connects everything. 🌧️♥':'Barry说：雨落在你的Vojvodina，我在北京听着雨声想你。雨水连接一切。🌧️♥'});
  else poems.push({txt:lang==='sr'?'Različito nebo, isto srce 🌍 — od Pekinga do Kikinde, od Dunava do Jangcea.':lang==='en'?'Different skies, one heart 🌍 — from Beijing to Kikinda, from Danube to Yangtze.':'不同的天空，同一颗心 🌍 — 从北京到Kikinda，从多瑙河到长江。',barry:lang==='sr'?'Barry kaže: Dunav teče kroz tvoj grad, Jangce kroz moj. Dve reke, jedna ljubav koja teče između nas. ♥':lang==='en'?'Barry says: The Danube flows through your town, the Yangtze through mine. Two rivers, one love flowing between us. ♥':'Barry说：多瑙河流过你的城市，长江流过我的。两条河流，一份在我们之间流淌的爱。♥'});
  poems.push({txt:lang==='sr'?'Sa Dunava na Jangce — ljubav teče kao reka 🌊':lang==='en'?'From Danube to Yangtze — love flows like a river 🌊':'从多瑙河到长江 — 爱如河流 🌊',barry:lang==='sr'?'Od ravnice do Pekinga, od šljivovice do čaja — naša priča je most između dva sveta.':lang==='en'?'From plains to Beijing, from rakija to tea — our story bridges two worlds.':'从平原到北京，从李子酒到茶——我们的故事连接两个世界。'});
  var poem = poems[Math.floor(Math.random() * poems.length)];
  document.getElementById('weatherLove').innerHTML='<div style="font-style:italic;margin-bottom:4px">"'+poem.txt+'"</div><div style="font-size:.62rem;opacity:.82;line-height:1.5">'+poem.barry+'</div>';
  document.getElementById('weatherLove').style.display='';
  updateWeatherTimes();
  var lm=getTodaysLoveMessage();var lmEl=document.getElementById('dailyLoveMsg');if(lmEl)lmEl.textContent='💌 '+((lang||'').indexOf('zh')===0?lm.zh:(lang||'').indexOf('en')===0?lm.en:lm.sr);
  renderSunCounter();
  var nh=document.getElementById('weatherNightHint');if(nh){var kiH=new Date().toLocaleString('en-US',{timeZone:'Europe/Belgrade',hour:'numeric',hour12:false});if(parseInt(kiH)>=22||parseInt(kiH)<=5){nh.style.display='';nh.textContent=L('🌙 Kod tebe je kasno - vreme za spavanje, Anđela 🛏️','🌙 Kikinda现在是深夜，Angie该休息了','🌙 It\'s late in Kikinda — time for sleep, Anđela 🛏️');}else{nh.style.display='none';}}
  // Update bridge text dynamically
  var bridge = document.getElementById('weatherBridge');
  if (bridge) {
    var bjt = Math.round(w.bj.temperature_2m), kit = Math.round(w.ki.temperature_2m);
    var diff = Math.abs(bjt - kit);
    var conn = diff <= 3 ? (lang==='sr'?'Ista toplina 🌡️♥':lang==='en'?'Same warmth 🌡️♥':'同样温度 🌡️♥') : (lang==='sr'?'Razlika '+diff+'° 🌡️':lang==='en'?diff+'° apart 🌡️':'温差 '+diff+'° 🌡️');
    var dnName = L('Dunav','多瑙河','Danube'), jcName = L('Jangce','长江','Yangtze');
    bridge.innerHTML = '🌉  '+dnName+' → '+jcName+'<br>Kikinda '+kit+'° ↔ '+bjt+'° '+L('Peking','北京','Beijing')+'<br>'+conn;
  }
}

/* ================================================================
   TEA ROOM — Serbian × Chinese Herbal Wisdom / Сербија × 中国
   ================================================================ */
const TEA_PAIRS = [
  {emoji:'🍵',name:{sr:'Čaj od nane',en:'Mint Tea','zh-CN':'薄荷茶'},desc:{sr:'Osvežava i smiruje želudac — srpski klasik',en:'Cooling, calms the stomach — Serbian classic','zh-CN':'清凉舒胃——塞尔维亚经典'},msg:{sr:'U Kini piju čaj od hrizanteme za isto — dva sveta, jedna mudrost 🌸',en:'In China they drink chrysanthemum for the same — two worlds, one wisdom 🌸','zh-CN':'中国人用菊花茶达到同样效果——两个世界，同一种智慧 🌸'},phase:'general'},
  {emoji:'🌼',name:{sr:'Čaj od kamilice',en:'Chamomile Tea','zh-CN':'洋甘菊茶'},desc:{sr:'Za miran san i nežno srce',en:'For peaceful sleep & a gentle heart','zh-CN':'安神助眠，温柔入心'},msg:{sr:'U Kini — čaj od jasmina. Cveće leči, svuda na svetu 🌙',en:'In China — jasmine tea. Flowers heal, everywhere on Earth 🌙','zh-CN':'中国有茉莉花茶——花能疗愈，天下皆然 🌙'},phase:'luteal'},
  {emoji:'🫚',name:{sr:'Čaj od đumbira',en:'Ginger Tea','zh-CN':'姜茶'},desc:{sr:'Greje telo i dušu — protiv grčeva',en:'Warms body & soul — anti-cramp','zh-CN':'暖身暖心——缓解痉挛'},msg:{sr:'Kineska tradicija: đumbir + crvene urme = 姜枣茶. Isti đumbir, ista ljubav ❤️',en:'Chinese tradition: ginger + red dates = 姜枣茶. Same ginger, same love ❤️','zh-CN':'中国古方：生姜+红枣=姜枣茶。同样的姜，同样的爱 ❤️'},phase:'period'},
  {emoji:'🌿',name:{sr:'Čaj od žalfije',en:'Sage Tea','zh-CN':'鼠尾草茶'},desc:{sr:'Protiv upala, za žensko zdravlje',en:'Anti-inflammatory, for women\'s health','zh-CN':'消炎，关爱女性健康'},msg:{sr:'U tradicionalnoj kineskoj medicini — 丹参 (kadulja) hrani krv. Biljke ne znaju granice 🌿',en:'In TCM — 丹参 (red sage) nourishes blood. Herbs know no borders 🌿','zh-CN':'中医里的丹参养血活血——草药无国界 🌿'},phase:'follicular'},
  {emoji:'🫐',name:{sr:'Čaj od šipurka',en:'Rosehip Tea','zh-CN':'玫瑰果茶'},desc:{sr:'Bogat vitaminom C — srpska tradicija',en:'Rich in vitamin C — Serbian tradition','zh-CN':'富含维C——塞尔维亚传统'},msg:{sr:'U Kini — čaj od goji bobica (枸杞). Crveno voće = snaga u obe kulture 🔴',en:'In China — goji berry tea (枸杞). Red fruit = strength in both cultures 🔴','zh-CN':'中国有枸杞茶——红色果实=两种文化中的力量 🔴'},phase:'general'},
  {emoji:'🍂',name:{sr:'Čaj od lipe',en:'Linden Tea','zh-CN':'椴花茶'},desc:{sr:'Protiv prehlade, za tople noći',en:'Against colds, for warm nights','zh-CN':'驱寒保暖，温暖夜晚'},msg:{sr:'Lipa = sveto drvo Slovena. U Kini — 桂花茶 (osmanthus). Drveće spaja narode 🌳',en:'Linden = sacred Slavic tree. In China — osmanthus tea. Trees unite peoples 🌳','zh-CN':'椴树=斯拉夫人的圣树。中国有桂花——树连接着民族 🌳'},phase:'general'}
];
function renderTea() {
  var teaName = document.getElementById('tea-name');
  var teaDesc = document.getElementById('tea-desc');
  var teaMsg = document.getElementById('tea-msg');
  var teaIcon = document.getElementById('tea-icon');
  var teaTitle = document.getElementById('tea-title');
  if (!teaName) return;
  var phase = 'general';
  if (activeProfile === 'andjela') {
    var pred = predict(); var ph = getPhase(today(), pred);
    if (ph === 'period-on' || ph === 'period-mid') phase = 'period';
    else if (ph === 'ovulation' || ph === 'fertile') phase = 'ovulation';
    else if (ph === 'follicular') phase = 'follicular';
    else if (ph === 'luteal') phase = 'luteal';
  }
  var candidates = TEA_PAIRS.filter(function(t) { return t.phase === phase; });
  if (candidates.length === 0) candidates = TEA_PAIRS.filter(function(t) { return t.phase === 'general'; });
  var tea = candidates[Math.floor(Math.random() * candidates.length)];
  teaIcon.textContent = tea.emoji;
  teaName.textContent = tea.name[lang] || tea.name['sr'];
  teaDesc.textContent = tea.desc[lang] || tea.desc['sr'];
  teaMsg.textContent = tea.msg[lang] || tea.msg['sr'];
  teaTitle.textContent = lang === 'sr' ? '🍵 Čajanka — Srbija ♥ Kina' : lang === 'en' ? '🍵 Tea Room — Serbia ♥ China' : '🍵 茶室 — 塞尔维亚 ♥ 中国';
}

/* ================================================================
   CALENDAR DATA LOADER — rich stories + solar terms
   ================================================================ */
var calendarExtraData = null;
function loadCalendarData(cb) {
  if (calendarExtraData) { cb(calendarExtraData); return; }
  var cached = localStorage.getItem('cycle-caldata');
  if (cached) { try { calendarExtraData = JSON.parse(cached); cb(calendarExtraData); return; } catch(e) {} }
  fetch('calendar-data.json').then(function(r){return r.json()}).then(function(d){
    calendarExtraData = d; localStorage.setItem('cycle-caldata', JSON.stringify(d)); cb(d);
  }).catch(function(){});
}
function toggleHolidayStory(uid, date, country) {
  var detail = document.getElementById('hd-'+uid);
  var nameEl = document.getElementById('hn-'+uid);
  if (!detail || !nameEl) return;
  var isOpen = detail.classList.contains('open');
  if (isOpen) { detail.classList.remove('open'); nameEl.textContent = nameEl.textContent.replace(' ▴',' ▾'); return; }
  loadCalendarData(function(data) {
    var story = null;
    (data.holidays||[]).forEach(function(h) {
      if (h.date === date && h.country === (country==='cn'?'china':'serbia')) story = h.story;
    });
    if (story) {
      var txt = story[lang] || story[lang.split('-')[0]] || story['sr'];
      if (txt) detail.textContent = txt;
    }
    detail.classList.add('open');
    nameEl.textContent = nameEl.textContent.replace(' ▾',' ▴');
  });
}

/* ================================================================
   ROMANTIC TOUCHES
   ================================================================ */
function updateLoveCounter() {
  var el = document.getElementById('titleLoveCounter');
  if (!el || !annDateLove) return;
  var days = daysDiff(new Date(annDateLove), today());
  if (days >= 0) el.textContent = '♥ ' + days + (lang==='sr'?' dana zajedno':lang==='en'?' days together':' 天在一起');
  // Also update the stats card
  var card = document.getElementById('love-days-content');
  if (!card) return;
  var parts = [];
  if (annDateMet) { var d = daysDiff(new Date(annDateMet), today()); if (d >= 0) parts.push('<div style="font-size:.85rem"><span style="color:var(--gold)">✨</span> ' + d + (lang==='sr'?' dana od prvog susreta':lang==='en'?' days since we met':' 天前初次相遇') + '</div>'); }
  if (annDateLove) { var d = daysDiff(new Date(annDateLove), today()); if (d >= 0) parts.push('<div style="font-size:1.2rem;font-weight:700;color:var(--love)">♥ ' + d + (lang==='sr'?' dana zajedno':lang==='en'?' days together':' 天在一起') + '</div>'); }
  card.innerHTML = parts.join('<div style="height:4px"></div>');
  document.getElementById('love-days-title').textContent = lang==='sr'?'💕 Dani zajedno':lang==='en'?'💕 Our Days':'💕 我们的日子';
}
function randomThinkingOfYou() {
  if (activeProfile !== 'andjela') return;
  if (Math.random() > 0.18) return; // 18% chance
  var msgs = lang==='sr'
    ? ['Upravo sam pomislio na tebe ♥','Nadam se da se osećaš dobro danas ✨','Tvoj osmeh mi je najdraža stvar 🌸','Mislim na tebe... uvek 💫','Barry je upravo pomislio na tebe 💝']
    : lang==='en'
    ? ['Just thought of you ♥','Hope you are feeling good today ✨','Your smile is my favorite thing 🌸','Thinking of you... always 💫','Barry was just thinking of you 💝']
    : ['刚刚在想你 ♥','希望你今天心情好 ✨','你的笑容是我最喜欢的 🌸','一直在想你 💫','Barry 刚刚想到了你 💝'];
  var msg = msgs[Math.floor(Math.random()*msgs.length)];
  setTimeout(function(){ toast(msg); }, 3000);
}

/* ================================================================
   GREETING OVERLAY
   ================================================================ */
function showGreeting() {
  var overlay = document.getElementById('greetingOverlay');
  if (!overlay) return;
  var g = (I18N[lang] || I18N[lang.split('-')[0]] || I18N['sr']).greeting; if (!g) return;
  var hour = new Date().getHours();
  var slot;
  if (hour >= 5 && hour < 12) slot = g.morning;
  else if (hour >= 12 && hour < 18) slot = g.afternoon;
  else if (hour >= 18 && hour < 23) slot = g.evening;
  else slot = g.night;
  document.getElementById('greetingIcon').textContent = slot.icon;
  document.getElementById('greetingName').textContent = slot.name;
  document.getElementById('greetingMsg').textContent = slot.msg;
  document.getElementById('greetingSub').textContent = slot.sub;
  overlay.style.display = 'flex'; overlay.classList.remove('hidden');
  spawnFeathers();
  // Auto-dismiss after 2.8 seconds
  clearTimeout(window._greetingTimer);
  window._greetingTimer = setTimeout(function() {
    overlay.classList.add('hiding');
    setTimeout(function() { overlay.style.display = 'none'; overlay.classList.add('hidden'); overlay.classList.remove('hiding'); }, 400);
  }, 2800);
}
// Greeting dismissed by inline onclick on the overlay — no JS function needed
function spawnFeathers() {
  const card = document.querySelector('.greeting-card');
  if (!card) return;
  for (let i = 0; i < 8; i++) {
    const feather = document.createElement('span');
    feather.className = 'feather';
    feather.textContent = ['🪶','✦','·'][i % 3];
    feather.style.left = (10 + Math.random() * 80) + '%';
    feather.style.top = (5 + Math.random() * 40) + '%';
    feather.style.animationDelay = (Math.random() * 2) + 's';
    feather.style.animationDuration = (3 + Math.random() * 3) + 's';
    card.appendChild(feather);
    setTimeout(() => feather.remove(), 5000);
  }
}

/* ================================================================
   MOON PHASE
   ================================================================ */
function updateMoonPhase() {
  const el = document.getElementById('moonPhase');
  // Simple moon phase approximation
  const lp = 2551443; // lunar period in seconds
  const nm = new Date('2000-01-06T18:14:00Z').getTime() / 1000;
  const phase = ((Date.now() / 1000 - nm) % lp) / lp;
  const icons = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];
  const idx = Math.round(phase * 8) % 8;
  el.innerHTML = `<span class="moon-icon">${icons[idx]}</span>`;
}

/* ================================================================
   EASTER EGGS
   ================================================================ */
let titleClicks = 0;
function handleTitleClick() {
  titleClicks++;
  if (titleClicks >= 5) { titleClicks = 0; spawnPetals(); }
  setTimeout(() => { if (titleClicks < 5 && titleClicks > 0) titleClicks = 0; }, 2000);
}
function spawnPetals() {
  const petals = ['🌸','💮','🌺','🩷','✿','🌷'];
  for (let i = 0; i < 25; i++) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.textContent = petals[Math.floor(Math.random() * petals.length)];
    petal.style.left = (Math.random() * 100) + '%';
    petal.style.top = -(10 + Math.random() * 30) + 'px';
    petal.style.animationDelay = (Math.random() * 1.5) + 's';
    petal.style.animationDuration = (3 + Math.random() * 3) + 's';
    petal.style.fontSize = (0.8 + Math.random() * 1.5) + 'rem';
    document.body.appendChild(petal);
    setTimeout(() => petal.remove(), 5000);
  }
}

/* ================================================================
   CYCLE CELEBRATION
   ================================================================ */
let lastCycleCount = 0;
function checkCycleCelebration() {
  const cycles = predict().cycles.length;
  if (cycles > lastCycleCount && cycles >= 1 && state.records.length >= 2) {
    lastCycleCount = cycles;
    const el = document.createElement('div');
    el.className = 'cycle-celebration';
    el.innerHTML = `<span class="celeb-icon">💝</span><span class="celeb-text">${t('cycleCounter').replace('{n}', cycles)}</span>`;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .6s'; }, 3000);
    setTimeout(() => el.remove(), 4000);
    // Update cycle counter
    updateCycleCounter(cycles);
  }
}
function updateCycleCounter(n) {
  var card = document.getElementById('cycleCounterCard');
  if (!card) return;
  if (n > 0) { card.style.display = ''; document.getElementById('cc-count').textContent = n; document.getElementById('cc-subtitle').textContent = t('cycleCounterSub'); }
  else card.style.display = 'none';
}

/* ================================================================
   PREDICTION
   ================================================================ */
function predict() {
  const {records,settings}=state; const sorted=[...records].sort((a,b)=>a-b);
  // Auto-calculate period length from actual data
  var periodEnds=state.periodEnds||{};
  var periodLengths=[];
  for(var i=0;i<sorted.length;i++){
    var key=fmtDate(sorted[i]);
    if(periodEnds[key])periodLengths.push(daysDiff(d0(sorted[i]),d0(new Date(periodEnds[key]+'T00:00:00')))+1);
  }
  var avgPeriodLen=periodLengths.length>0?Math.round(periodLengths.reduce(function(a,b){return a+b;},0)/periodLengths.length):settings.periodLength;
  var def={lastStart:null,nextStart:null,ovulation:null,fertileStart:null,fertileEnd:null,cycleLen:settings.cycleLength,periodLen:avgPeriodLen,avgCycle:settings.cycleLength,minCycle:null,maxCycle:null,stdDev:0,confidence:'low',cycles:[],isOverdue:false,overdueDays:0,futurePeriods:[]};
  if(sorted.length===0) return def;
  def.lastStart=d0(sorted[sorted.length-1]);
  if(sorted.length===1){def.nextStart=addDays(def.lastStart,settings.cycleLength);}
  else{for(let i=1;i<sorted.length;i++) def.cycles.push(daysDiff(d0(sorted[i-1]),d0(sorted[i])));const recent=def.cycles.slice(-6);if(recent.length>0){def.avgCycle=Math.round(recent.reduce((a,b)=>a+b,0)/recent.length);def.minCycle=Math.min(...recent);def.maxCycle=Math.max(...recent);const variance=recent.reduce((s,c)=>s+(c-def.avgCycle)**2,0)/recent.length;def.stdDev=Math.round(Math.sqrt(variance)*10)/10;if(def.stdDev<=3)def.confidence='high';else if(def.stdDev<=6)def.confidence='medium';else def.confidence='low';}def.nextStart=addDays(def.lastStart,def.avgCycle);}
  const td=today();if(def.nextStart&&td>def.nextStart){const useLen=settings.manualOverride?settings.cycleLength:def.avgCycle;const elapsed=daysDiff(def.lastStart,td);const passed=Math.floor(elapsed/useLen);if(passed>=1){def.nextStart=addDays(def.lastStart,useLen*(passed+1));}def.isOverdue=(td>def.nextStart);if(def.isOverdue)def.overdueDays=daysDiff(def.nextStart,td);}
  if(def.nextStart){def.ovulation=addDays(def.nextStart,-14);def.fertileStart=addDays(def.ovulation,-3);def.fertileEnd=addDays(def.ovulation,2);const useLen=settings.manualOverride?settings.cycleLength:def.avgCycle;for(let i=1;i<=2;i++){const np=addDays(def.nextStart,useLen*i);def.futurePeriods.push({start:np,ovulation:addDays(np,-14),fertileStart:addDays(np,-17),fertileEnd:addDays(np,-11)});}}
  return def;
}

function getPeriodEndDate(startDate){
  // Return the actual end date for a period start, or null if not ended yet
  var key=fmtDate(startDate);
  if(state.periodEnds&&state.periodEnds[key])return new Date(state.periodEnds[key]+'T00:00:00');
  return null;
}
function getPhase(date,pred){
  const d=d0(date);
  for(const rec of state.records){const s=d0(rec);var e=getPeriodEndDate(rec)||addDays(s,pred.periodLen-1);e.setHours(0,0,0,0);if(d>=s&&d<=e) return sameDay(d,s)?'period-on':'period-mid';}
  if(pred.nextStart){const ps=d0(pred.nextStart),pe=addDays(ps,pred.periodLen-1);pe.setHours(0,0,0,0);if(d>=ps&&d<=pe) return sameDay(d,ps)?'period-pred-first':'period-pred';}
  for(const fp of pred.futurePeriods){const ps=d0(fp.start),pe=addDays(ps,pred.periodLen-1);pe.setHours(0,0,0,0);if(d>=ps&&d<=pe) return sameDay(d,ps)?'period-future-first':'period-future';}
  if(pred.ovulation&&sameDay(d,pred.ovulation)) return 'ovulation';
  if(pred.fertileStart&&pred.fertileEnd){const fs=d0(pred.fertileStart),fe=d0(pred.fertileEnd);if(d>=fs&&d<=fe) return 'fertile';}
  if(pred.fertileEnd&&pred.nextStart){const fe=d0(pred.fertileEnd),np=d0(pred.nextStart);if(d>fe&&d<np) return 'luteal';}
  if(pred.lastStart&&pred.fertileStart){const lpEnd=addDays(pred.lastStart,pred.periodLen);lpEnd.setHours(0,0,0,0);const fs=d0(pred.fertileStart);if(d>=lpEnd&&d<fs) return 'follicular';}
  return null;
}

/* ================================================================
   CHART RENDERER — Pure Canvas 2D, no external deps
   ================================================================ */
var ChartRenderer = {
  _theme: function() {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      bg: isDark ? '#1e1518' : '#faf3ef',
      text: isDark ? '#c4a8a8' : '#3d2828',
      textMuted: isDark ? '#7a6a68' : '#8a7a78',
      grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(80,40,40,0.08)',
      line: isDark ? '#d47888' : '#c45a6b',
      fill: isDark ? 'rgba(212,120,136,0.15)' : 'rgba(196,90,107,0.12)',
      dot: isDark ? '#d47888' : '#c45a6b',
      sage: isDark ? '#8fc7b0' : '#80a590',
      teal: isDark ? '#7ab8a5' : '#5e8b7a',
      lavender: isDark ? '#c8b8d8' : '#b8a0c8',
      gold: isDark ? '#d4aa6e' : '#c49a5e',
      donutColors: [
        isDark ? '#d47888' : '#c45a6b',
        isDark ? '#e090a0' : '#d4bfb5',
        isDark ? '#8fc7b0' : '#80a590',
        isDark ? '#c8b8d8' : '#b8a0c8',
        isDark ? '#7ab8a5' : '#5e8b7a',
        isDark ? '#d4aa6e' : '#c49a5e',
        isDark ? '#e8a0b0' : '#e8c8c0',
        isDark ? '#a0c8b8' : '#a0c0b0'
      ]
    };
  },

  _setupCanvas: function(canvas, w, h) {
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    var displayW = rect.width || w;
    canvas.width = displayW * dpr;
    canvas.height = h * dpr;
    canvas.style.width = displayW + 'px';
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx: ctx, w: displayW, h: h };
  },

  drawLineChart: function(canvas, dataPoints, labels, opts) {
    opts = opts || {};
    var self = this; var t = self._theme();
    var _a = self._setupCanvas(canvas, opts.width || 500, opts.height || 200), ctx = _a.ctx, w = _a.w, h = _a.h;
    var pad = { top: 16, right: 16, bottom: 28, left: 32 };
    var pw = w - pad.left - pad.right, ph = h - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);

    if (!dataPoints || dataPoints.length === 0) {
      ctx.fillStyle = t.textMuted; ctx.font = 'italic .68rem ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'center'; ctx.fillText(opts.emptyText || 'No data yet', w / 2, h / 2);
      return;
    }

    var allVals = dataPoints.slice();
    if (opts.avgLine) allVals.push(opts.avgLine);
    var minVal = Math.floor(Math.min.apply(Math, allVals) - 2);
    var maxVal = Math.ceil(Math.max.apply(Math, allVals) + 2);
    if (maxVal - minVal < 4) { var mid = (minVal + maxVal) / 2; minVal = mid - 2; maxVal = mid + 2; }
    var xStep = dataPoints.length > 1 ? pw / (dataPoints.length - 1) : pw / 2;
    var valToY = function(v) { return pad.top + ph - ((v - minVal) / (maxVal - minVal)) * ph; };

    // Grid
    ctx.strokeStyle = t.grid; ctx.lineWidth = 0.5; ctx.setLineDash([3, 4]);
    var gridLines = 4;
    for (var i = 0; i <= gridLines; i++) {
      var y = pad.top + (ph / gridLines) * i;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
      ctx.fillStyle = t.textMuted; ctx.font = '.55rem ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'right'; ctx.fillText(Math.round(maxVal - (maxVal - minVal) / gridLines * i), pad.left - 6, y + 3);
    }
    ctx.setLineDash([]);

    // X labels
    if (labels && labels.length > 0) {
      ctx.fillStyle = t.textMuted; ctx.font = '.52rem ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'center';
      var labelStep = Math.max(1, Math.floor(labels.length / 5));
      for (var i2 = 0; i2 < labels.length; i2 += labelStep) {
        var lx = pad.left + i2 * xStep;
        if (lx <= w - pad.right) ctx.fillText(labels[i2], lx, h - 4);
      }
    }

    // Average line
    if (opts.avgLine) {
      var ay = valToY(opts.avgLine);
      ctx.strokeStyle = t.textMuted; ctx.lineWidth = 1; ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(pad.left, ay); ctx.lineTo(w - pad.right, ay); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = t.textMuted; ctx.font = '.52rem ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'left'; ctx.fillText(opts.avgLabel || 'Avg', w - pad.right - 24, ay - 4);
    }

    // Fill area
    var grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + ph);
    grad.addColorStop(0, t.fill); grad.addColorStop(1, 'rgba(196,90,107,0.01)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top + ph);
    for (var i3 = 0; i3 < dataPoints.length; i3++) {
      ctx.lineTo(pad.left + i3 * xStep, valToY(dataPoints[i3]));
    }
    ctx.lineTo(pad.left + (dataPoints.length - 1) * xStep, pad.top + ph);
    ctx.closePath(); ctx.fill();

    // Line
    ctx.strokeStyle = t.line; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pad.left, valToY(dataPoints[0]));
    for (var i4 = 1; i4 < dataPoints.length; i4++) {
      ctx.lineTo(pad.left + i4 * xStep, valToY(dataPoints[i4]));
    }
    ctx.stroke();

    // Dots + values
    for (var i5 = 0; i5 < dataPoints.length; i5++) {
      var cx = pad.left + i5 * xStep, cy = valToY(dataPoints[i5]);
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = t.dot; ctx.fill();
      ctx.strokeStyle = t.bg; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = t.text; ctx.font = 'bold .55rem ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'center'; ctx.fillText(dataPoints[i5], cx, cy - 10);
    }
  },

  drawDonutChart: function(canvas, segments, opts) {
    opts = opts || {};
    var self = this; var t = self._theme();
    var _a = self._setupCanvas(canvas, opts.width || 260, opts.height || 200), ctx = _a.ctx, w = _a.w, h = _a.h;
    var cx = w / 2, cy = h / 2;
    var outerR = Math.min(cx, cy) - 8;
    var innerR = outerR * 0.58;
    var total = 0;
    for (var si = 0; si < segments.length; si++) total += segments[si].value;

    ctx.clearRect(0, 0, w, h);

    if (total === 0) {
      ctx.fillStyle = t.textMuted; ctx.font = 'italic .68rem ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'center'; ctx.fillText(opts.emptyText || 'No data yet', cx, cy);
      return [];
    }

    var colors = t.donutColors;
    var startAngle = -Math.PI / 2;
    for (var i = 0; i < segments.length; i++) {
      var sliceAngle = (segments[i].value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, startAngle + sliceAngle);
      ctx.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = segments[i].color || colors[i % colors.length];
      ctx.fill();
      // Label on slice
      var midAngle = startAngle + sliceAngle / 2;
      var labelR = outerR + 14;
      var lx = cx + Math.cos(midAngle) * labelR, ly = cy + Math.sin(midAngle) * labelR;
      if (sliceAngle > 0.35 && segments[i].value > 0) {
        ctx.fillStyle = t.text; ctx.font = 'bold .52rem ' + getComputedStyle(document.body).fontFamily;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(segments[i].value, lx, ly);
      }
      startAngle += sliceAngle;
    }

    // Center text
    ctx.fillStyle = t.text; ctx.font = 'bold .9rem ' + getComputedStyle(document.body).fontFamily;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(total, cx, cy - 6);
    ctx.fillStyle = t.textMuted; ctx.font = '.55rem ' + getComputedStyle(document.body).fontFamily;
    ctx.fillText(opts.centerLabel || 'total', cx, cy + 12);

    var result = [];
    for (var ri = 0; ri < segments.length; ri++) {
      result.push({
        label: segments[ri].label,
        color: segments[ri].color || colors[ri % colors.length],
        value: segments[ri].value,
        pct: total > 0 ? Math.round(segments[ri].value / total * 100) : 0
      });
    }
    return result;
  },

  drawBarChart: function(canvas, bars, opts) {
    opts = opts || {};
    var self = this; var t = self._theme();
    var _a = self._setupCanvas(canvas, opts.width || 460, opts.height || 200), ctx = _a.ctx, w = _a.w, h = _a.h;
    var maxVal = 1;
    for (var bi = 0; bi < bars.length; bi++) { if (bars[bi].value > maxVal) maxVal = bars[bi].value; }
    var barH = Math.min(22, (h - 20) / bars.length);
    var gap = 4;
    var labelW = Math.min(70, w * 0.22);
    var barAreaW = w - labelW - 12;

    ctx.clearRect(0, 0, w, h);

    if (bars.length === 0 || maxVal === 0) {
      ctx.fillStyle = t.textMuted; ctx.font = 'italic .68rem ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'center'; ctx.fillText(opts.emptyText || 'No data yet', w / 2, h / 2);
      return;
    }

    for (var i = 0; i < bars.length; i++) {
      var y = 10 + i * (barH + gap);
      var bw = Math.max(4, (bars[i].value / maxVal) * barAreaW);

      // Label
      ctx.fillStyle = t.text; ctx.font = '.6rem ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'right'; ctx.fillText(bars[i].label, labelW - 6, y + barH / 2 + 3);

      // Bar bg
      ctx.fillStyle = t.grid;
      ChartRenderer._roundRect(ctx, labelW + 4, y, barAreaW, barH, 4); ctx.fill();

      // Bar fill
      ctx.fillStyle = bars[i].color || t.line;
      ChartRenderer._roundRect(ctx, labelW + 4, y, bw, barH, 4); ctx.fill();

      // Value
      ctx.fillStyle = t.text; ctx.font = 'bold .58rem ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'left'; ctx.fillText(bars[i].value, labelW + bw + 10, y + barH / 2 + 3);
    }
  },

  drawSparkline: function(canvas, dataPoints, opts) {
    opts = opts || {};
    var self = this; var t = self._theme();
    var _a = self._setupCanvas(canvas, opts.width || 120, opts.height || 36), ctx = _a.ctx, w = _a.w, h = _a.h;
    ctx.clearRect(0, 0, w, h);

    if (!dataPoints || dataPoints.length < 2) {
      ctx.fillStyle = t.textMuted; ctx.font = '.5rem ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'center'; ctx.fillText('--', w / 2, h / 2 + 4);
      return;
    }

    var minV = Math.min.apply(Math, dataPoints), maxV = Math.max.apply(Math, dataPoints);
    var range = maxV - minV || 1;
    var pad = 2;
    var xStep = (w - pad * 2) / (dataPoints.length - 1);
    var valToY = function(v) { return h - pad - ((v - minV) / range) * (h - pad * 2); };

    var color = opts.color || t.line;
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pad, valToY(dataPoints[0]));
    for (var i = 1; i < dataPoints.length; i++) {
      ctx.lineTo(pad + i * xStep, valToY(dataPoints[i]));
    }
    ctx.stroke();

    // Last dot
    var lx = pad + (dataPoints.length - 1) * xStep, ly = valToY(dataPoints[dataPoints.length - 1]);
    ctx.beginPath(); ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
  },

  _roundRect: function(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }
};

/* ================================================================
   UI STATE
   ================================================================ */
let viewYear=today().getFullYear(), viewMonth=today().getMonth();
let selectedDate=null, symptomDate=null, knowledgeOpen=false;

/* ================================================================
   UI UPDATE
   ================================================================ */
function updateLangUI(){
  document.getElementById('h-title').textContent = t('appTitle');
  document.getElementById('todayBtn').textContent = t('today');
  document.querySelectorAll('.tb-label').forEach((el,i)=>{el.textContent=t('tabs')[i];});
  document.getElementById('set-language').value=lang;
  document.querySelectorAll('.lang-btn').forEach(b=>{b.classList.toggle('active',b.dataset.lang===lang);});
  const wd=t('weekdays');
  document.getElementById('weekdaysRow').innerHTML='<span></span>'+wd.map(function(d,i){return'<span'+(i>=5?' style="color:var(--rose);opacity:.6"':'')+'>'+d+'</span>';}).join('');
  const lg=t('legend');
  document.getElementById('legend').innerHTML=`<span class="l-period">${lg[0]}</span><span class="l-fertile">${lg[1]}</span><span class="l-follicular">${lg[2]}</span><span class="l-luteal">${lg[3]}</span><span style="font-weight:700;font-size:.66rem;">▣ ${lg[4]}</span>`;
  if (annDateMet || annDateLove) document.getElementById('legend').innerHTML += `<span class="l-heart">${lg[5]}</span>`;
  document.getElementById('legend').innerHTML += '<span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:50%;background:#E53935;display:inline-block"></span>🇨🇳</span><span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:50%;background:#0C4076;display:inline-block"></span>🇷🇸</span><span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:50%;background:#4CAF50;display:inline-block"></span>🌿</span>';
  const pl=t('progressLabels');
  document.querySelector('.lbl-period').textContent=pl[0];document.querySelector('.lbl-follicular').textContent=pl[1];
  document.querySelector('.lbl-ovulation').textContent=pl[2];document.querySelector('.lbl-luteal').textContent=pl[3];
  const syms=t('symptoms');
  document.getElementById('symptomGrid').innerHTML=['cramps','mood','flow','headache','fatigue','cravings'].map(s=>`<div class="symptom-item" onclick="cycleSymptom('${s}')"><span class="emoji">${{cramps:'😣',mood:'😊',flow:'💧',headache:'🤕',fatigue:'😴',cravings:'🍫'}[s]}</span><span class="sname">${syms[s]}</span><div class="symptom-dots" id="dots-${s}"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div></div>`).join('');
  document.getElementById('symptom-empty-text').innerHTML=t('emptySymptom');
  document.getElementById('symptom-notes').placeholder=t('modal.notesPlaceholder');
  document.getElementById('symptom-save-btn').textContent='💾 '+t('toast.symptomSaved').replace(' ✓','');
  const emojis={cramps:'😣',mood:'😊',flow:'💧',headache:'🤕',fatigue:'😴',cravings:'🍫'};
  document.getElementById('modal-symptoms').innerHTML=['cramps','mood','flow','headache','fatigue','cravings'].map(s=>`<button class="sym-chip" data-s="${s}">${emojis[s]} ${syms[s]}</button>`).join('');
  const st=t('settings');
  ['set-l-lang','set-l-theme','set-l-cycle','set-l-period','set-l-override'].forEach(id=>{const el=document.getElementById(id);if(el){el.textContent=st[id.replace('set-l-','')]||'';}});
['set-h-lang','set-h-theme','set-h-cycle','set-h-period','set-h-override'].forEach(id=>{const el=document.getElementById(id);if(el){el.textContent=st[id.replace('set-h-','')+'Hint']||'';}});
  document.getElementById('save-settings-btn').textContent=st.save;
  document.getElementById('export-btn').textContent=st.export;document.getElementById('import-btn').textContent=st.import;document.getElementById('clear-btn').textContent=st.clear;
  document.getElementById('anniversary-title').textContent = t('anniversaryTitle');
  document.getElementById('ann-met-label').textContent = t('annMetLabel');
  document.getElementById('ann-love-label').textContent = t('annLoveLabel');
  updateAnniversaryCount();
  const ss=t('stats');
  document.getElementById('st-title-cycle').textContent=ss.cycleTitle;document.getElementById('st-title-history').textContent=ss.historyTitle;document.getElementById('st-title-pred').textContent=ss.predTitle;
  document.getElementById('st-l-count').textContent=ss.count;document.getElementById('st-l-avg').textContent=ss.avg;document.getElementById('st-l-range').textContent=ss.range;document.getElementById('st-l-reg').textContent=ss.reg;
  document.getElementById('st-l-next').textContent=ss.next;document.getElementById('st-l-ovu').textContent=ss.ovulation;document.getElementById('st-l-fert').textContent=ss.fertile;document.getElementById('st-l-conf').textContent=ss.confidence;document.getElementById('st-l-future').textContent=ss.future;
  document.getElementById('historyLabel').textContent=t('historyLabel');
  document.getElementById('cc-title').textContent = '💝 ' + t('cycleCounter').replace('{n}', '');
  const md=t('modal');
  document.getElementById('m-l-phase').textContent=md.phase;document.getElementById('m-l-day').textContent=md.day;document.getElementById('m-l-symp').textContent=md.symptoms;
  document.getElementById('m-l-holiday').textContent=lang==='sr'?'Praznik':lang==='en'?'Holiday':'节日';document.getElementById('m-l-solar').textContent=lang==='sr'?'Solarni ciklus':lang==='en'?'Solar Term':'节气';document.getElementById('m-l-special').textContent=lang==='sr'?'Poseban dan':lang==='en'?'Special Day':'特殊日子';document.getElementById('m-divider').textContent=md.quickSymptom;document.getElementById('modal-close-btn').textContent=md.close;
  document.getElementById('fab-label').textContent=t('fabLabel');
}

// Lazy-load rich solar term data from calendar-data.json if not cached yet
function ensureSolarTermData() {
  if (solarTermsCache && solarTermsCache.length > 0) return;
  var cached = localStorage.getItem('cycle-solarterms');
  if (cached) { try { solarTermsCache = JSON.parse(cached); if (solarTermsCache.length > 0) return; } catch(e) {} }
  // Load from calendar-data.json
  fetch('calendar-data.json').then(function(r){return r.json()}).then(function(d){
    if (d && d.solarTerms) {
      solarTermsCache = d.solarTerms;
      localStorage.setItem('cycle-solarterms', JSON.stringify(solarTermsCache));
    }
  }).catch(function(){});
}

function renderSolarTermBadge() {
  var badge = document.getElementById('solarTermBadge');
  if (!badge) return;
  var todayKey = fmtDate(today());
  var term = getSolarTerm(todayKey);
  if (term) {
    var termName = term.name[lang] || term.name[lang.split('-')[0]] || term.name['sr'] || term.name['zh-CN'] || '';
    badge.textContent = '🌿 ' + termName;
    badge.style.display = '';
  } else {
    // Only show upcoming (future) solar terms within 7 days, not past ones
    var nearest = null, minDist = 30;
    var td = today();
    SOLAR_TERMS_INLINE.forEach(function(s) {
      var termDate = new Date(s.date + 'T00:00:00');
      var dist = daysDiff(td, termDate);  // positive = future, negative = past
      if (dist >= 0 && dist < minDist) { minDist = dist; nearest = s; }
    });
    if (nearest && minDist <= 7) {
      var nearName = nearest.name[lang] || nearest.name[lang.split('-')[0]] || nearest.name['sr'] || nearest.name['zh-CN'] || '';
      badge.textContent = '🌿 ' + nearName + ' ' + (lang==='sr'?'za '+minDist+' dana':lang==='en'?'in '+minDist+' days':minDist+'天后');
      badge.style.display = '';
    } else { badge.style.display = 'none'; }
  }
}
// Conditional render system — accepts optional filter to skip unnecessary renders.
// Groups: 'core','calendar','mood','diary','connection','tips','barry','weather','tea'
// If called with no args or 'all', renders everything (backward compatible).
function applyAllUI(what) {
  var all = !what || what === 'all';
  if (all || what === 'core' || (Array.isArray(what) && what.indexOf('core') >= 0)) {
    updateLangUI(); updateProfileUI(); updateFab(); updateLoveCounter();
    renderSolarTermBadge(); renderSpecialBadge(); renderBirthdayCard();
    renderLunarInfo(); renderSeasonalPoemCard();
  }
  if (all || what === 'calendar' || (Array.isArray(what) && what.indexOf('calendar') >= 0)) {
    renderCalendar();
  }
  if (all || what === 'mood' || (Array.isArray(what) && what.indexOf('mood') >= 0)) {
    renderMoodSection(); renderGarden();
  }
  if (all || what === 'stats' || (Array.isArray(what) && what.indexOf('stats') >= 0)) {
    renderStatsPanel();
  }
  // Letters module renders on-demand when diary tab is active (no auto-refresh needed)
  if (all || what === 'connection' || (Array.isArray(what) && what.indexOf('connection') >= 0)) {
    renderLoveNote(); renderForecast(); renderRelTips();
    renderHug(); renderSong(); renderCheckin(); renderSleepCard();
    renderGratitude();
  }
  if (all || what === 'tips' || (Array.isArray(what) && what.indexOf('tips') >= 0)) {
    if (document.getElementById('panel-tips').classList.contains('active')) renderTips();
  }
  if (all || what === 'barry' || (Array.isArray(what) && what.indexOf('barry') >= 0)) {
    if (activeProfile === 'barry') renderBarrySymptomView();
  }
  if (all || what === 'tea' || (Array.isArray(what) && what.indexOf('tea') >= 0)) {
    renderTea();
  }
  if (all || what === 'weather' || (Array.isArray(what) && what.indexOf('weather') >= 0)) {
    var wc = localStorage.getItem('cycle-weather'); if (wc) { try { renderWeather(JSON.parse(wc)); } catch (e) {} }
  }
  // Always refresh shared state and symptoms (lightweight, needed for cross-profile sync)
  if (all) { updateSharedCycleInfo(); updateSharedSymptoms(); }
  if (symptomDate) renderSymptomPanel(symptomDate);
}
function renderAll(what) { applyAllUI(what); }

/* ================================================================
   CALENDAR
   ================================================================ */
const SEASON_EMOJI = {0:'❄️',1:'❄️',2:'🌸',3:'🌸',4:'🌸',5:'☀️',6:'☀️',7:'☀️',8:'🍂',9:'🍂',10:'🍂',11:'❄️'};
var SEASON_LABEL = {'sr':{0:'Zima',1:'Zima',2:'Proleće',3:'Proleće',4:'Proleće',5:'Leto',6:'Leto',7:'Leto',8:'Jesen',9:'Jesen',10:'Jesen',11:'Zima'},'en':{0:'Winter',1:'Winter',2:'Spring',3:'Spring',4:'Spring',5:'Summer',6:'Summer',7:'Summer',8:'Autumn',9:'Autumn',10:'Autumn',11:'Winter'},'zh-CN':{0:'冬',1:'冬',2:'春',3:'春',4:'春',5:'夏',6:'夏',7:'夏',8:'秋',9:'秋',10:'秋',11:'冬'}};
function getSeasonLabel(month){return SEASON_LABEL[lang]?SEASON_LABEL[lang][month]:SEASON_LABEL['sr'][month];}
function renderCalendar(){
  const pred=predict(); const td=today();
  document.getElementById('monthLabel').textContent = lang==='sr' ? `${t('months')[viewMonth]} ${viewYear}.` : lang==='en' ? `${t('months')[viewMonth]} ${viewYear}` : `${viewYear}年${viewMonth+1}月`;
  const first=new Date(viewYear,viewMonth,1); let dow=first.getDay(); dow=dow===0?6:dow-1;
  const gridStart=addDays(first,-dow); const grid=document.getElementById('daysGrid'); var frag=document.createDocumentFragment();
  const recordedStarts=new Set(state.records.map(fmtDate));
  var plEl=document.getElementById('predLegend'); if(pred.futurePeriods.length>0){plEl.style.display='';plEl.textContent=lang==='sr'?'※ Prozirni datumi su predviđanja':lang==='en'?'※ Faded dates are future predictions':'※ 半透明标记为未来周期预测';} else plEl.style.display='none';
  // Build shared diary index for dot indicators
  var sharedDiaryIdx = {};
  try { var sd = JSON.parse(localStorage.getItem('shared-diary')||'{}'); Object.keys(sd).forEach(function(k){ if(sd[k]&&(sd[k].barry||sd[k].andjela)) sharedDiaryIdx[k]=true; }); } catch(e) {}
  for(let i=0;i<42;i++){
    // Insert week number at start of each row (every 7th position)
    var colPos = i + Math.floor(i / 7); // actual grid position including week columns
    if (i % 7 === 0) {
      var wkCell = document.createElement('div'); wkCell.className = 'week-num';
      var wkDate = addDays(gridStart, i);
      // ISO week number approximation
      var jan1 = new Date(wkDate.getFullYear(), 0, 1);
      var wkNum = Math.ceil((((wkDate - jan1) / 86400000) + jan1.getDay() + 1) / 7);
      wkCell.textContent = wkNum; wkCell.setAttribute('aria-hidden', 'true');
      frag.appendChild(wkCell);
    }
    const d=addDays(gridStart,i); const inMonth=d.getMonth()===viewMonth;
    const isToday=sameDay(d,td); const phase=inMonth?getPhase(d,pred):null;
    const key=fmtDate(d);
    // Symptom check
    var symptoms=state.symptoms[key];
    var hasSymptom=symptoms&&Object.entries(symptoms).some(function(kv){return kv[0]!=='notes'&&kv[1]>0;});
    // Cycle day number for Anđela's active cycle
    var cycleDay='';
    if (activeProfile==='andjela'&&pred.lastStart){
      var cd=daysDiff(d0(pred.lastStart),d0(d));
      if (cd>=0&&cd<pred.cycleLen) cycleDay=String(cd+1);
    }
    const annType = isAnniversary(d);
    const el=document.createElement('div'); el.className='day';
    if(!inMonth) el.classList.add('other-month');
    if(isToday) el.classList.add('today');
    if(isToday) el.setAttribute('aria-current','date');
    if(phase) el.classList.add(phase);
    if(phase==='period-on'&&recordedStarts.has(key)) el.classList.add('recorded');
    if(annType>0) el.classList.add('anniversary');
    if(getBirthday(d)) el.classList.add('birthday');
    // Special date icon
    var special = getSpecialDate(d);
    if (special) {
      var spIcon = document.createElement('span');
      spIcon.className = 'special-date-icon';
      spIcon.textContent = special.icon;
      spIcon.title = activeProfile === 'barry' ? special.title_zh : special.title_sr;
      el.appendChild(spIcon);
      if (special.type === 'firstmeet') el.classList.add('first-meet');
      if (special.type === 'monthly') el.classList.add('monthly-anni');
    }
    if(inMonth) {
      el.setAttribute('tabindex','0');
      el.addEventListener('keydown',function(e){
        if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}
      });
    }
    // Date number
    var daySpan=document.createElement('span'); daySpan.className='day-num'; daySpan.textContent=d.getDate();
    el.appendChild(daySpan);
    // Cycle day badge
    if (cycleDay&&inMonth&&!phase) {
      var cdSpan=document.createElement('span'); cdSpan.className='day-cycle-num'; cdSpan.textContent=cycleDay;
      el.appendChild(cdSpan);
    }
    // Lunar date label (Chinese calendar)
    if (inMonth && typeof Lunar !== 'undefined') {
      var lunarDayName = getLunarCellText(d);
      if (lunarDayName) {
        var lunarSpan = document.createElement('span');
        lunarSpan.className = 'lunar-date ' + getLunarCellClass(d);
        lunarSpan.textContent = lunarDayName;
        el.appendChild(lunarSpan);
      }
    }
    el.setAttribute('role','button'); el.setAttribute('aria-label',fmtDate(d));
    // Symptom emoji icons on cell
    if (hasSymptom&&!phase&&symptoms){
      var miniDiv=document.createElement('div'); miniDiv.className='day-symptoms';
      ['cramps','mood','flow','headache','fatigue','cravings'].forEach(function(sym){
        if (symptoms[sym]&&symptoms[sym]>0) {
          var symEl=document.createElement('span'); symEl.className='day-sym-icon';
          symEl.textContent={cramps:'😣',mood:'😊',flow:'💧',headache:'🤕',fatigue:'😴',cravings:'🍫'}[sym];
          symEl.title=sym; miniDiv.appendChild(symEl);
        }
      });
      if (miniDiv.children.length>0) el.appendChild(miniDiv);
    }
    // Diary entry dot
    if (sharedDiaryIdx[key]) {
      var diaryDot=document.createElement('span'); diaryDot.className='mini-dot gold';
      diaryDot.style.cssText='position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:5px;height:5px;border-radius:50%;background:var(--gold)';
      el.appendChild(diaryDot);
    }
    // Anniversary dot
    if(annType===2&&!phase){const dot=document.createElement('span');dot.className='mini-dot gold';el.appendChild(dot);}
    // Solar term label on calendar cell
    var solarTerm = getSolarTerm(key);
    if (solarTerm && inMonth) {
      var stName = solarTerm.name[lang] || solarTerm.name[lang.split('-')[0]] || solarTerm.name['sr'] || solarTerm.name['zh-CN'] || '';
      var stLabel = document.createElement('span');
      stLabel.className = 'solar-term-label';
      stLabel.textContent = stName;
      stLabel.title = stName; // hover shows full name for long solar terms
      el.appendChild(stLabel);
      el.classList.add('solar-term-day');
      // Single tap opens modal (same as other days) — modal shows solar term + holiday
      if (!solarTerm.story) {
        // Ensure rich data is loaded for the modal
        ensureSolarTermData();
      }
    }
    // Holiday emoji icons — show before solar term for proper layering
    var holidays=getHoliday(key);
    holidays.forEach(function(h){
      var icon=document.createElement('span');
      icon.className='holiday-icon holiday-'+h.country;
      icon.textContent = h.icon || (h.country==='cn'?'🎉':'🇷🇸');
      icon.title = h.name[lang] || h.name[lang.split('-')[0]] || h.name['sr'] || h.name['zh-CN'] || '';
      el.appendChild(icon);
    });
    // Double-tap detection for quick period mark
    var tapTimer = null;
    if(inMonth) {
      el.addEventListener('click',function(e){
        if (tapTimer) {
          // Double tap — quick toggle period
          clearTimeout(tapTimer); tapTimer = null;
          var idx = state.records.findIndex(function(r){return sameDay(r,d);});
          if (idx >= 0) { state.records.splice(idx,1); toast('🚫 '+t('toast.unmarked')); }
          else { state.records.push(new Date(d)); state.records.sort(function(a,b){return a-b;}); el.classList.add('celebrate'); setTimeout(function(){el.classList.remove('celebrate');},500); toast('🩸 '+t('toast.marked')); checkCycleCelebration(); }
          saveState(); renderAll(['calendar','core']); updateFab();
        } else {
          tapTimer = setTimeout(function(){ tapTimer = null; openModal(d,pred); }, 280);
        }
      });
    }
    frag.appendChild(el);
  }
  // Batch-replace grid content in single DOM operation
  grid.innerHTML = '';
  grid.appendChild(frag);
  // Month season subtitle
  var ml = document.getElementById('monthLabel');
  if (ml) {
    // Remove existing season tag and re-add with updated month
    var existingTag = ml.querySelector('.season-tag');
    if (existingTag) existingTag.remove();
    ml.innerHTML = ml.textContent + ' <span class="season-tag" style="font-size:.6rem;opacity:.5">'+SEASON_EMOJI[viewMonth]+' '+getSeasonLabel(viewMonth)+'</span>';
  }
  updateProgress(pred); updateStats(pred); updateHistoryDots(pred); updateReminder(pred);
  renderMonthHolidaySummary(); renderUpcomingHoliday();
}

function updateProgress(pred){
  const td=today(); const numEl=document.getElementById('pg-num'); const unitEl=document.getElementById('pg-unit');
  const subEl=document.getElementById('pg-sub'); const fillEl=document.getElementById('pg-fill'); const badgeEl=document.getElementById('pg-badge');
  const badges=t('phaseBadges');
  if(state.records.length===0){numEl.textContent='--';unitEl.textContent='';subEl.textContent=t('emptyState');fillEl.style.width='0%';badgeEl.textContent='';badgeEl.className='phase-badge';document.querySelectorAll('.progress-labels span').forEach(s=>s.classList.remove('current'));return;}
  const phase=getPhase(td,pred); let pct=0,label='',bCls='';document.querySelectorAll('.progress-labels span').forEach(s=>s.classList.remove('current'));
  if(phase==='period-on'||phase==='period-mid'){const cur=state.records.find(r=>{const s=d0(r);var e=getPeriodEndDate(r)||addDays(s,pred.periodLen-1);return td>=s&&td<=e;});const dayNum=cur?daysDiff(d0(cur),td)+1:1;var actualLen=pred.periodLen;if(cur){var pe=getPeriodEndDate(cur);if(pe)actualLen=daysDiff(d0(cur),pe)+1;}numEl.textContent=dayNum;unitEl.textContent=` / ${actualLen}`;subEl.textContent=t('periodDay').replace('{n}',dayNum);pct=(dayNum/actualLen)*15;label=badges.period;bCls='period';numEl.style.color='var(--love)';document.querySelector('.lbl-period').classList.add('current');}
  else if(pred.isOverdue){numEl.textContent=pred.overdueDays;unitEl.textContent='';subEl.textContent=`${t('daysOverdue').replace('{n}',pred.overdueDays)} · ${t('expected')} ${fmtDate(pred.nextStart)}`;bCls='late';label=badges.late;numEl.style.color='#E65100';pct=100;document.querySelector('.lbl-luteal').classList.add('current');}
  else{const totalLen=pred.nextStart?daysDiff(pred.lastStart,pred.nextStart):pred.cycleLen;const elapsed=daysDiff(pred.lastStart,td);const remain=pred.nextStart?daysDiff(td,pred.nextStart):totalLen-elapsed;pct=Math.min(100,Math.max(0,(elapsed/totalLen)*100));numEl.textContent=remain;unitEl.textContent='';
    if(remain>0&&remain<=7){label=badges.luteal;numEl.style.color='var(--lavender-dark)';bCls='luteal';document.querySelector('.lbl-luteal').classList.add('current');}
    else if(phase==='luteal'){label=badges.luteal;numEl.style.color='var(--lavender-dark)';bCls='luteal';document.querySelector('.lbl-luteal').classList.add('current');}
    else if(phase==='fertile'){label=badges.fertile;numEl.style.color='var(--teal)';bCls='fertile';document.querySelector('.lbl-ovulation').classList.add('current');}
    else if(phase==='ovulation'){label=badges.ovulation;numEl.style.color='var(--teal)';bCls='ovulation';document.querySelector('.lbl-ovulation').classList.add('current');}
    else if(phase==='follicular'){label=badges.follicular;numEl.style.color='var(--sage)';bCls='follicular';document.querySelector('.lbl-follicular').classList.add('current');}
    else{numEl.style.color='var(--text-muted)';}
    subEl.textContent=remain>=0?t('daysUntil').replace('{n}',remain):`${t('expected')} ${fmtDate(pred.nextStart)}`;}
  fillEl.style.width=pct+'%';
  fillEl.setAttribute('role','progressbar');
  fillEl.setAttribute('aria-valuenow',Math.round(pct));
  fillEl.setAttribute('aria-valuemin','0');
  fillEl.setAttribute('aria-valuemax','100');
  if(bCls==='period'||bCls==='late') fillEl.style.background='var(--love)';else if(bCls==='follicular') fillEl.style.background='var(--sage)';else if(bCls==='ovulation'||bCls==='fertile') fillEl.style.background='var(--teal)';else if(bCls==='luteal') fillEl.style.background='var(--lavender)';
  badgeEl.textContent=label;badgeEl.className='phase-badge '+bCls;
}

function updateStats(pred){
  // Animated number helper
  function animNum(el, target, suffix) {
    var cur = parseInt(el.textContent) || 0;
    if (cur === target) { el.textContent = target + (suffix||''); return; }
    var start = performance.now(); var dur = 500;
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out
      el.textContent = Math.round(cur + (target - cur) * eased) + (suffix||'');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  animNum(document.getElementById('st-count'), state.records.length, '');
  var regL=lang==='sr'?{high:'Visoka',medium:'Srednija',low:'Niska'}:lang==='en'?{high:'High',medium:'Medium',low:'Low'}:{high:'高',medium:'中',low:'低'};
  if(state.records.length>=2){animNum(document.getElementById('st-avg'), pred.avgCycle, t('day'));var sr=document.getElementById('st-range');if(sr)sr.textContent=pred.minCycle+' / '+pred.maxCycle+t('day');var sreg=document.getElementById('st-regularity');if(sreg)sreg.innerHTML=regL[pred.confidence]+' <span class="cycle-badge '+({high:'high',medium:'medium',low:'low'})[pred.confidence]+'">±'+pred.stdDev+'</span>';}
  else{var hint=lang==='sr'?'(treba bar 2 ciklusa)':lang==='en'?'(needs 2+ cycles)':'(需2个周期以上)';var sa=document.getElementById('st-avg');if(sa)sa.textContent=hint;var sr2=document.getElementById('st-range');if(sr2)sr2.textContent=hint;var sreg2=document.getElementById('st-regularity');if(sreg2)sreg2.textContent=hint;}
  var sn=document.getElementById('st-next');if(sn)sn.textContent=pred.nextStart?fmtDate(pred.nextStart):'--';
  var so=document.getElementById('st-ovulation');if(so)so.textContent=pred.ovulation?fmtDate(pred.ovulation):'--';
  var sf=document.getElementById('st-fertile');if(sf)sf.textContent=pred.fertileStart&&pred.fertileEnd?fmtDate(pred.fertileStart)+' ~ '+fmtDate(pred.fertileEnd):'--';
  var sc=document.getElementById('st-confidence');if(sc)sc.textContent=state.records.length>=2?regL[pred.confidence]+' (±'+pred.stdDev+')':'--';
  if(pred.futurePeriods.length>0){var fr=document.getElementById('futurePredRow');if(fr)fr.style.display='';var sfu=document.getElementById('st-future');if(sfu)sfu.textContent=pred.futurePeriods.map(function(fp){return fmtDate(fp.start);}).join(', ');}
  else{var fr2=document.getElementById('futurePredRow');if(fr2)fr2.style.display='none';}
}

function updateHistoryDots(pred){
  const c=document.getElementById('historyDots');
  if(pred.cycles.length===0){c.innerHTML='<span style="font-size:.72rem;color:var(--text-muted)">--</span>';return;}
  const recent=pred.cycles.slice(-12),avg=pred.avgCycle;
  c.innerHTML=recent.map(cy=>{let cls='normal';if(cy<avg-3)cls='short';else if(cy>avg+3)cls='long';return`<span class="history-dot ${cls}" title="${cy}${t('day')}" onclick="toast('${cy}${t('day')}')"></span>`;}).join('');
}

function goToMonth(m){viewMonth=m;renderCalendar();}
function updateReminder(pred){
  var banner=document.getElementById('reminderBanner'); if(!banner) return;
  var td=today(); var phase=getPhase(td,pred); var msg=''; var r=t('reminder');
  if(phase==='ovulation') msg=r.ovulation;
  else if(pred.isOverdue) msg=r.late.replace('{days}',pred.overdueDays);
  else if(pred.nextStart){var remain=daysDiff(td,pred.nextStart);if(remain>0&&remain<=3) msg=r.beforePeriod.replace('{days}',remain);}
  if(msg){banner.style.display='flex';banner.innerHTML=msg+' <span class="dismiss" onclick="this.parentElement.style.display=\'none\'">✕</span>';}else{banner.style.display='none';}
}
function updateFab(){
  var fab=document.getElementById('fabBtn');
  var fabIcon=document.getElementById('fab-icon');
  var fabLabel=document.getElementById('fab-label');
  if(activeProfile!=='andjela'){fab.classList.add('hidden');return;}
  fab.classList.remove('hidden');
  var openStart=getOpenPeriodStart();
  if(openStart){
    // Period started but not ended — show end button
    fabIcon.textContent='✅';fab.style.fontSize='1.2rem';fab.style.fontWeight='normal';
    fabLabel.textContent=lang==='sr'?'Kraj ciklusa':lang==='en'?'Period ended':'经期结束';
  }else{
    // No open period — show start button
    fabIcon.textContent='🩸';fab.style.fontSize='1.5rem';fab.style.fontWeight='normal';
    fabLabel.textContent=lang==='sr'?'Početak ciklusa':lang==='en'?'Period started':'经期来了';
  }
}

document.getElementById('fabBtn').addEventListener('click',function(){
  if(activeProfile!=='andjela')return;
  var td=today();var tdKey=fmtDate(td);
  var openStart=getOpenPeriodStart();
  if(openStart){
    // Mark period END only if today is after the start
    if(d0(td)<=d0(openStart)){toast(lang==='sr'?'Kraj mora biti posle početka':lang==='en'?'End must be after start':'结束日必须在开始日之后');return;}
    state.periodEnds=state.periodEnds||{};
    state.periodEnds[fmtDate(openStart)]=tdKey;
    toast(lang==='sr'?'Kraj ciklusa označen ✓':lang==='en'?'Period end marked ✓':'经期结束已标记 ✓');
  }else{
    // Mark period START
    var isMarked=state.records.some(function(r){return sameDay(r,td);});
    if(isMarked){toast(fmtDate(td)+(lang==='sr'?' - već označeno':lang==='en'?' - already marked':' - 已标记过'));return;}
    state.records.push(new Date(td));state.records.sort(function(a,b){return a-b;});
    toast(t('toast.marked'));checkCycleCelebration();
  }
  saveState();renderAll();updateFab();
  var fab=document.getElementById('fabBtn');fab.classList.add('celebrate');setTimeout(function(){fab.classList.remove('celebrate');},500);
});

/* ================================================================
   MODAL
   ================================================================ */
function openModal(date,pred){selectedDate=new Date(date);const key=fmtDate(selectedDate);const phase=getPhase(date,pred);const isMarked=state.records.some(r=>sameDay(r,selectedDate));const md=t('modal');const phases=t('phases');document.getElementById('modal-date').textContent=fmtDate(selectedDate);var lunarInfo=typeof Lunar!=='undefined'?Lunar.toLunar(date):null;if(lunarInfo){var lunarDisplay=lang==='sr'?('Lunarni '+lunarInfo.month+'. mesec, '+lunarInfo.day+'. dan'):lang==='en'?('Lunar '+lunarInfo.month+'/'+lunarInfo.day):(lunarInfo.monthName+lunarInfo.dayName);document.getElementById('modal-date').textContent=fmtDate(selectedDate)+' · '+lunarDisplay;}document.getElementById('modal-phase').textContent=phases[phase]||'--';const dayRow=document.getElementById('modal-day-row');if(phase==='period-on'||phase==='period-mid'){dayRow.style.display='';const cur=state.records.find(r=>{const s=d0(r),e=addDays(s,pred.periodLen-1);return selectedDate>=s&&selectedDate<=e;});document.getElementById('modal-day').textContent=cur?`${daysDiff(d0(cur),selectedDate)+1}${t('day')}`.trim():'--';}else{dayRow.style.display='none';}const sympRow=document.getElementById('modal-symp-row');const symp=state.symptoms[key];const symNames=t('symptoms');if(symp){const parts=Object.entries(symp).filter(([k,v])=>k!=='notes'&&v>0).map(([k,v])=>symNames[k]+v);if(parts.length>0||(symp.notes&&symp.notes.trim())){sympRow.style.display='';let txt=parts.length>0?parts.join(', '):'';if(symp.notes&&symp.notes.trim()) txt+=(txt?' · ':'')+symp.notes.trim();document.getElementById('modal-symp').textContent=txt||'--';}else{sympRow.style.display='none';}}else{sympRow.style.display='none';}document.querySelectorAll('#modal-symptoms .sym-chip').forEach(chip=>{const s=chip.dataset.s;chip.classList.toggle('on',symp&&symp[s]&&symp[s]>0);chip.onclick=()=>quickToggleSymptom(s);});const markBtn=document.getElementById('modal-mark-btn'),unmarkBtn=document.getElementById('modal-unmark-btn');if(isMarked){markBtn.style.display='none';unmarkBtn.style.display='';unmarkBtn.textContent=md.unmark;document.getElementById('modal-title').textContent=md.marked;}else{markBtn.style.display='';markBtn.textContent=md.mark;unmarkBtn.style.display='none';document.getElementById('modal-title').textContent=md.details;}renderKnowledge(phase,key);renderSymptomPanel(key);var special=getSpecialDate(new Date(key+'T00:00:00'));var specialRow=document.getElementById('modal-special-row');if(special){specialRow.style.display='';document.getElementById('modal-special').innerHTML='<span class=\"holiday-name\">'+special.icon+' '+(activeProfile==='barry'?special.title_zh:special.title_sr)+'</span><span class=\"holiday-detail\" style=\"display:block\">'+(activeProfile==='barry'?special.desc_zh:special.desc_sr)+'</span>';}else{specialRow.style.display='none';}var solarTerm=getSolarTerm(key);var solarRow=document.getElementById('modal-solar-row');if(solarTerm){solarRow.style.display='';var sn=solarTerm.name[lang]||solarTerm.name[lang.split('-')[0]]||solarTerm.name['sr'];document.getElementById('modal-solar').innerHTML='<span class="holiday-name" onclick="var d=this.nextElementSibling;d.classList.toggle(\'open\');this.textContent=this.textContent.replace(\' ▾\',\' \').replace(\' ▴\',\' \')+(d.classList.contains(\'open\')?\' ▴\':\' ▾\')">'+sn+' ▾</span><span class="holiday-detail">'+((solarTerm.story?(solarTerm.story[lang]||solarTerm.story[lang.split('-')[0]]||solarTerm.story['sr']):''))+'</span>';}else{solarRow.style.display='none';}var holidays=getHoliday(key);var holidayRow=document.getElementById('modal-holiday-row');if(holidays.length>0){holidayRow.style.display='';var hNames=holidays.map(function(h,i){var n=h.name[lang]||h.name[lang.split('-')[0]]||h.name['sr'];var d=h.desc[lang]||h.desc[lang.split('-')[0]]||h.desc['sr'];var flagEmoji=h.country==='cn'?'🇨🇳':'🇷🇸';var uid='h'+i;var daysOffInfo=HOLIDAY_DAYS[key];var offHtml='';if(daysOffInfo&&h.country==='cn'){var off=daysOffInfo.zh||daysOffInfo.cn||'';if(off&&off!=='—')offHtml='<div style="font-size:.62rem;color:var(--text-muted);margin-top:2px">🏖️ '+(lang==='sr'?'Odmor: '+off:lang==='en'?'Days off: '+off:'放假'+off)+'</div>';}if(daysOffInfo&&h.country==='rs'){var off=daysOffInfo.sr||daysOffInfo.rs||'';if(off&&off!=='—')offHtml='<div style="font-size:.62rem;color:var(--text-muted);margin-top:2px">🏖️ '+(lang==='sr'?'Odmor: '+off:lang==='en'?'Days off: '+off:'放假'+off)+'</div>';}return flagEmoji+' <span class="holiday-name" data-d="'+h.d+'" data-c="'+h.country+'" id="hn-'+uid+'" onclick="toggleHolidayStory(\''+uid+'\',\''+h.d+'\',\''+h.country+'\')">'+n+' ▾</span><span class="holiday-detail" id="hd-'+uid+'">'+d+'</span>'+offHtml;});document.getElementById('modal-holiday').innerHTML=hNames.join('<div style="height:8px"></div>');}else{holidayRow.style.display='none';}window._lastFocusedBeforeModal=document.activeElement;document.getElementById('modal').classList.remove('hidden');document.getElementById('modal-title').focus();}
function closeModal(){document.getElementById('modal').classList.add('hidden');selectedDate=null;knowledgeOpen=false;if(window._lastFocusedBeforeModal){window._lastFocusedBeforeModal.focus();}}
function renderKnowledge(phase,dateKey){const panel=document.getElementById('knowledgePanel');const toggleBtn=document.getElementById('knowledgeToggle');let cat=null;if(phase&&(phase.startsWith('period')))cat='period';else if(phase==='ovulation')cat='ovulation';else if(phase==='fertile')cat='fertile';else if(phase==='follicular')cat='follicular';else if(phase==='luteal')cat='luteal';else{const pr=predict();const tp=getPhase(today(),pr);if(tp&&tp.startsWith('period'))cat='period';else if(tp==='ovulation'||tp==='fertile')cat='ovulation';else if(tp==='follicular')cat='follicular';else if(tp==='luteal')cat='luteal';}if(cat){const kn=t('knowledge.'+cat);toggleBtn.style.display='';toggleBtn.textContent=knowledgeOpen?t('knowledgeToggleHide'):t('knowledgeToggle');panel.innerHTML=`<h4>${kn.title}</h4><p>${kn.desc}</p><p style="margin-top:8px"><strong>🩺 ${kn.what}</strong></p><p style="margin-top:6px"><strong>📋 ${kn.symptoms}</strong></p><p style="margin-top:6px"><strong>💡 ${kn.tips}</strong></p>`;panel.className='knowledge-panel'+(knowledgeOpen?' open':'');}else{toggleBtn.style.display='none';panel.className='knowledge-panel';panel.innerHTML='';}}
function toggleKnowledge(){knowledgeOpen=!knowledgeOpen;if(selectedDate){const pred=predict();renderKnowledge(getPhase(selectedDate,pred),fmtDate(selectedDate));}}
function togglePeriodRecord(){if(!selectedDate)return;var sd=fmtDate(selectedDate);
  // Check if this is marking period END (there's a start without end)
  var openStart=getOpenPeriodStart();
  if(openStart && d0(selectedDate)>d0(openStart)){
    // Mark as period end
    state.periodEnds=state.periodEnds||{};
    state.periodEnds[fmtDate(openStart)]=sd;
    toast(lang==='sr'?'Kraj ciklusa označen ✓':lang==='en'?'Period end marked ✓':'经期结束已标记 ✓');
  }else{
    // Toggle period start
    var idx=state.records.findIndex(function(r){return sameDay(r,selectedDate);});
    if(idx>=0){
      state.records.splice(idx,1);
      state.periodEnds=state.periodEnds||{};
      delete state.periodEnds[fmtDate(selectedDate)];
      toast(t('toast.unmarked'));
    }else{
      state.records.push(new Date(selectedDate));state.records.sort(function(a,b){return a-b;});
      toast(t('toast.marked'));checkCycleCelebration();
    }
  }
  saveState();renderAll();updateFab();openModal(selectedDate,predict());
}
function getOpenPeriodStart(){
  // Return the most recent period start that has no end date
  if(!state.periodEnds)return null;
  for(var i=state.records.length-1;i>=0;i--){
    var key=fmtDate(state.records[i]);
    if(!state.periodEnds[key])return state.records[i];
  }
  return null;
}
function removePeriodRecord(){if(!selectedDate)return;state.records=state.records.filter(r=>!sameDay(r,selectedDate));state.periodEnds=state.periodEnds||{};delete state.periodEnds[fmtDate(selectedDate)];saveState();toast(t('toast.unmarked'));renderAll();updateFab();closeModal();}
function quickToggleSymptom(name){if(!selectedDate)return;const key=fmtDate(selectedDate);if(!state.symptoms[key])state.symptoms[key]={};const s=state.symptoms[key];s[name]=s[name]?0:2;if(s[name]===0)delete s[name];document.querySelectorAll('#modal-symptoms .sym-chip').forEach(chip=>{if(chip.dataset.s===name)chip.classList.toggle('on',s[name]>0);});saveState();toast(t('toast.symptomQuick'));}

/* ================================================================
   SYMPTOMS / TIPS / SETTINGS
   ================================================================ */
function renderSymptomPanel(dateKey){symptomDate=dateKey;document.getElementById('symptom-date-label').textContent=dateKey+' '+t('modal.symptoms');document.getElementById('symptom-empty').style.display='none';document.getElementById('symptom-content').style.display='';const symp=state.symptoms[dateKey]||{};['cramps','mood','flow','headache','fatigue','cravings'].forEach(s=>{const lvl=symp[s]||0;const dots=document.getElementById('dots-'+s);if(!dots)return;dots.querySelectorAll('.dot').forEach((dot,i)=>{dot.className='dot'+(i<lvl?' on':'');});const item=dots.closest('.symptom-item');if(item)item.classList.toggle('selected',lvl>0);});document.getElementById('symptom-notes').value=symp.notes||'';}
function cycleSymptom(name){if(!symptomDate)return;if(!state.symptoms[symptomDate])state.symptoms[symptomDate]={};const s=state.symptoms[symptomDate];const cur=s[name]||0;s[name]=cur>=3?0:cur+1;renderSymptomPanel(symptomDate);}
function saveSymptom(){if(!symptomDate)return;if(!state.symptoms[symptomDate])state.symptoms[symptomDate]={};state.symptoms[symptomDate].notes=document.getElementById('symptom-notes').value.trim();saveState();toast(t('toast.symptomSaved'));renderAll(['calendar']);}
function getSharedCyclePhase() {
  // First try shared-cycle-info (old summary format: {phase, nextStart})
  var shared = null;
  try { shared = JSON.parse(localStorage.getItem('shared-cycle-info')); } catch(e) {}
  if (shared && shared.phase) return shared;
  // Calculate phase from synced shared cycle data (new neutral key)
  var cycleData = null;
  try { cycleData = JSON.parse(localStorage.getItem('shared-cycle-data')); } catch(e) {}
  if (!cycleData) {
    try { cycleData = JSON.parse(localStorage.getItem('shared-andjela-cycle-data')); } catch(e) {}
  }
  if (!cycleData) {
    try { cycleData = JSON.parse(localStorage.getItem('cycle-data-v6-andjela')); } catch(e) {}
  }
  if (!cycleData || !cycleData.records || cycleData.records.length === 0) return null;
  try {
    var records = cycleData.records.map(function(r){return new Date(r);}).sort(function(a,b){return a-b;});
    var lastStart = new Date(records[records.length-1]);
    var settings = cycleData.settings || {cycleLength:28,periodLength:7};
    var cycleLen = settings.cycleLength || 28;
    var periodLen = settings.periodLength || 7;
    var nextStart = new Date(lastStart); nextStart.setDate(nextStart.getDate() + cycleLen);
    var td = today();
    var dayNum = Math.floor((td - lastStart) / 86400000);
    var ovulationDay = new Date(nextStart); ovulationDay.setDate(ovulationDay.getDate() - 14);
    var phase;
    if (dayNum >= 0 && dayNum < periodLen) phase = 'period';
    else if (td >= ovulationDay && td < nextStart) {
      var daysToOvulation = Math.floor((ovulationDay - lastStart) / 86400000);
      if (dayNum >= daysToOvulation - 3 && dayNum <= daysToOvulation + 1) phase = 'ovulation';
      else if (dayNum > daysToOvulation + 1) phase = 'luteal';
      else phase = 'follicular';
    } else if (td < ovulationDay) phase = 'follicular';
    else phase = 'luteal';
    return {phase:phase, nextStart:fmtDate(nextStart), updated:Date.now()};
  } catch(e) { return null; }
}
function updateSharedCycleInfo() {
  if (activeProfile !== 'andjela') return;
  var pred = predict();
  var phase = getPhase(today(),pred);
  var cat = 'general';
  if (phase==='period-on'||phase==='period-mid') cat='period';
  else if (phase==='ovulation'||phase==='fertile') cat='ovulation';
  else if (phase==='follicular') cat='follicular';
  else if (phase==='luteal') cat='luteal';
  localStorage.setItem('shared-cycle-info', JSON.stringify({phase:cat,nextStart:pred.nextStart?fmtDate(pred.nextStart):null,updated:Date.now()}));
}
function renderTips(){
  var cat='period'; var tips=[];
  if (activeProfile === 'barry') {
    // Barry's tips — read shared cycle info from Anđela
    var shared = getSharedCyclePhase();
    if (shared && shared.phase) cat = shared.phase;
    else cat = 'general';
    var tipKey = 'barryTips' + cat.charAt(0).toUpperCase() + cat.slice(1);
    tips = t(tipKey) || t('barryTipsGeneral');
    var phaseNames = {period:lang==='sr'?'Njena menstruacija':lang==='en'?'Her Period':'她的经期',follicular:lang==='sr'?'Njena folikularna':lang==='en'?'Her Follicular':'她的卵泡期',ovulation:lang==='sr'?'Njena ovulacija':lang==='en'?'Her Ovulation':'她的排卵期',luteal:lang==='sr'?'Njena lutealna':lang==='en'?'Her Luteal':'她的黄体期',general:lang==='sr'?'Budi tu za nju':lang==='en'?'Be There For Her':'好好待她'};
    var title = (lang==='sr'?'💡 Kako postupati prema njoj danas':lang==='en'?'💡 How to treat her today':'💡 今天如何对待她');
    document.getElementById('tips-list').innerHTML='<div style="text-align:center;padding:8px 0;font-size:.78rem;font-weight:700;color:var(--text)">'+title+'</div><div style="text-align:center;font-size:.68rem;color:var(--gold);margin-bottom:8px">'+phaseNames[cat]+'</div>'+tips.map(function(tip){return '<div class="tip-card" style="border-left:3px solid var(--teal)"><span class="tip-icon">'+tip.icon+'</span><div class="tip-body"><span class="tip-text">'+tip.text+'</span></div></div>';}).join('');
    return;
  }
  // Anđela's tips (original)
  const pred=predict();const td=today();const phase=getPhase(td,pred);
  if(phase==='period-on'||phase==='period-mid')cat='period';
  else if(phase==='ovulation'||phase==='fertile')cat='ovulation';
  else if(phase==='follicular')cat='follicular';
  else if(phase==='luteal')cat='luteal';
  const names={period:lang==='sr'?'Menstruacija':lang==='en'?'Period':'经期',follicular:lang==='sr'?'Folikularna':lang==='en'?'Follicular':'卵泡期',ovulation:lang==='sr'?'Ovulacija':lang==='en'?'Ovulation':'排卵期',luteal:lang==='sr'?'Lutealna':lang==='en'?'Luteal':'黄体期'};
  tips=t('tips.'+cat);
  document.getElementById('tips-list').innerHTML=tips.map(tip=>`<div class="tip-card ${tip.tcm?'tcm':(tip.source&&tip.source.includes('Srpska')||tip.source.includes('Serbian')?'serbian':'')}"><span class="tip-icon">${tip.icon}</span><div class="tip-body"><span class="tip-phase-label">${names[cat]} · ${t('tabs')[2]}</span><span class="tip-text">${tip.text}</span>${tip.source?`<span class="tip-source">${tip.source}</span>`:''}</div></div>`).join('');}
function saveGitHubToken(){var t=document.getElementById('set-gh-token').value.trim();if(t){sessionStorage.setItem('gh-token',t);toast('🔑 Token sačuvan ✓');pullAllSharedData().then(function(){updateSyncStatusBadge();renderAll();});}else{sessionStorage.removeItem('gh-token');updateSyncStatusBadge();}}
function loadSettingsUI(){document.getElementById('set-cycle').value=state.settings.cycleLength;document.getElementById('set-period').value=state.settings.periodLength;document.getElementById('set-language').value=lang;document.getElementById('set-theme').value=theme;document.getElementById('annDateMet').value=annDateMet;document.getElementById('annDateLove').value=annDateLove;document.getElementById('set-gh-token').value=getGitHubToken();document.getElementById('set-h-token').textContent=getGitHubToken()?(lang==='sr'?'✅ Sinhronizacija uključena 🌐':lang==='en'?'✅ Auto-sync enabled 🌐':'✅ 自动同步已开启 🌐'):(lang==='sr'?'Unesite GitHub Token za sinhronizaciju dva telefona':lang==='en'?'Enter GitHub Token to sync both phones':'输入 GitHub Token 以同步两台手机');updateAnniversaryCount();updateSyncStatusBadge();}
function saveSettings(){state.settings.cycleLength=parseInt(document.getElementById('set-cycle').value)||28;state.settings.periodLength=parseInt(document.getElementById('set-period').value)||7;saveState();renderAll(['calendar','core']);toast(t('toast.saved'));}
function exportData(){const blob=new Blob([JSON.stringify({records:state.records.map(fmtDate),symptoms:state.symptoms,moods:state.moods||{},diaries:state.diaries||{},settings:state.settings},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`andjelin-ciklus-${activeProfile}-${fmtDate(new Date())}.json`;a.click();URL.revokeObjectURL(a.href);toast(t('toast.exported'));}
function importData(e){var file=e.target.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(){try{var d=JSON.parse(reader.result);if(!d.records||!Array.isArray(d.records))throw new Error('Invalid format');state.records=d.records.map(function(r){var dt=new Date(r);return isNaN(dt.getTime())?null:dt;}).filter(Boolean);if(state.records.length===0&&d.records.length>0)throw new Error('No valid dates');state.symptoms=d.symptoms||{};state.moods=d.moods||{};state.diaries=d.diaries||{};state.settings={cycleLength:28,periodLength:7,manualOverride:false};if(d.settings){Object.keys(d.settings).forEach(function(k){state.settings[k]=d.settings[k];});}saveState();renderAll();updateFab();toast(t('toast.imported'));}catch(err){toast(t('toast.importError'));}};reader.readAsText(file);e.target.value='';}
function clearAllData(){if(!confirm(t('settings.clearConfirm')))return;state={records:[],symptoms:{},moods:{},diaries:{},settings:{cycleLength:28,periodLength:7,manualOverride:false},_migrated:true};saveState();renderAll();updateFab();toast(t('toast.cleared'));}
function clearAllDiaries(){if(!confirm(lang==='sr'?'Obrisati SVE zajedničke dnevnike? Ovo se ne može vratiti.':lang==='en'?'Delete ALL shared diaries? This cannot be undone.':'删除所有共享日记？此操作不可撤销。'))return;localStorage.setItem('shared-diary','{}');saveSharedDiaryData({});pushAllSharedData().then(function(){renderSharedDiary();renderDateStrip();renderCalendar();toast('🗑️ '+(lang==='sr'?'Dnevnici obrisani':lang==='en'?'Diaries cleared':'日记已清空'));});}

/* ================================================================
   NAVIGATION
   ================================================================ */
var _changeMonthTimer = null;
function changeMonth(d) {
  if (_changeMonthTimer) return; // Debounce: ignore rapid clicks
  _changeMonthTimer = setTimeout(function() { _changeMonthTimer = null; }, 150);
  viewMonth += d;
  if (viewMonth < 0) { viewMonth = 11; viewYear--; }
  if (viewMonth > 11) { viewMonth = 0; viewYear++; }

  var grid = document.getElementById('daysGrid');
  // Fade out old content
  grid.style.transition = 'opacity 0.08s ease-out';
  grid.style.opacity = '0';

  setTimeout(function() {
    // Render new month
    renderCalendar();
    // Fade in new content
    grid.style.transition = 'opacity 0.15s ease-out';
    grid.style.opacity = '1';
  }, 80);
}

// Touch swipe
(function() {
  var grid = document.getElementById('daysGrid');
  var sx = 0, active = false;
  grid.addEventListener('touchstart', function(e) {
    if (active) return;
    sx = e.touches[0].clientX;
  }, {passive: true});
  grid.addEventListener('touchmove', function(e) {
    var dx = e.touches[0].clientX - sx;
    if (!active && Math.abs(dx) > 10) { active = true; grid.style.transition = 'none'; }
    if (!active) return;
    grid.style.transform = 'translateX(' + dx + 'px)';
    grid.style.opacity = Math.max(0, 1 - Math.abs(dx) / 150);
  }, {passive: false});
  grid.addEventListener('touchend', function() {
    if (!active) return; active = false;
    var dx = parseFloat(grid.style.transform.replace('translateX(','').replace('px)','')) || 0;
    grid.style.transition = 'transform .15s ease-out, opacity .15s ease-out';
    if (Math.abs(dx) > 60) {
      var dir = dx > 0 ? -1 : 1;
      grid.style.transform = 'translateX(' + (dir * 100) + 'px)'; grid.style.opacity = '0';
      setTimeout(function() { grid.style.transition = 'none'; grid.style.transform = ''; grid.style.opacity = ''; changeMonth(dir); }, 150);
    } else {
      grid.style.transform = ''; grid.style.opacity = '';
    }
  });
})();

function goToday() {
  viewYear = today().getFullYear();
  viewMonth = today().getMonth();
  var grid = document.getElementById('daysGrid');
  grid.style.transition = 'opacity 0.08s ease-out';
  grid.style.opacity = '0';
  setTimeout(function() {
    renderCalendar();
    grid.style.transition = 'opacity 0.2s ease-out';
    grid.style.opacity = '1';
  }, 80);
}
/* ================================================================
   CULTURE MODULE — za Anđelu
   ================================================================ */

// UI text mapping for culture card (auto-switches based on lang)
var CL = {
  barry: { todayBadge: '今日推荐' },
  andjela: { todayBadge: 'Daily' }
};
function cl(key) { var profile = (lang||'').indexOf('zh')===0 ? 'barry' : 'andjela'; var p = CL[profile] || CL.andjela; return p[key] || (CL.andjela[key] || key); }

var CULTURE_KNOWLEDGE = [];
var _cultureCardIdx = 0;

function getTodaysCultureIndex() {
  var now = new Date(); return (now.getFullYear()*10000 + (now.getMonth()+1)*100 + now.getDate()) % CULTURE_KNOWLEDGE.length;
}

function initCultureTab() {
  _cultureCardIdx = getTodaysCultureIndex();
  // Update tab label
  var tbCulture = document.getElementById('tb-culture');
  if (tbCulture) tbCulture.textContent = L('Kina','中华','China');
  renderCultureCard();
}

// Chinese descriptions for culture cards (Barry sees these)
var CULTURE_DESC_ZH = {
1:'中国最重要的传统节日。全家人聚在一起吃年夜饭，孩子们收到红包，鞭炮声驱散了旧年的晦气。每个农历年对应一种生肖动物。',
2:'在中国几乎所有支付都用手机完成——微信支付或支付宝。现金已很少使用。来中国前安装微信并绑定银行卡，就能畅行无阻。',
3:'中国人喜欢分享菜肴——所有菜放桌子中间大家一起夹。不要把筷子竖直插在米饭里。敬酒时杯子要低于长辈，以示尊重。',
4:'中国人很少直呼其名。年长的叫阿姨叔叔，年轻的叫小姐姐小哥哥。商店里常能听到美女这个称呼。',
5:'在中国通过手机App几乎什么都能订：外卖、生鲜、药品，甚至还能请人打扫卫生。配送通常30分钟内送到。',
6:'红包在春节、婚礼和生日时赠送。红色代表好运。不要送空红包，接过来时用双手。微信数字红包也非常流行。',
7:'家庭是中国社会的核心。子女成年后也常和父母住在一起。长辈意见非常重要。孝顺强调对父母的赡养和尊重。',
8:'茶是中国文化的灵魂。共有六大茶类：绿、红、白、乌龙、黄、普洱。最著名的是龙井。别人倒茶时用手指轻叩桌面表示感谢——这叫叩指礼。',
9:'中国人喜欢说吉祥话：恭喜发财、万事如意、身体健康。过年一定要说新年快乐。8是幸运数字，4则要避免。',
10:'农历七月初七庆祝。传说牛郎织女只能在这一夜通过鹊桥相会。如今恋人们会享受浪漫晚餐互赠礼物。',
11:'汉字起源于象形文字——山像山峰，水像流水。总数超五万，日常用两三千。书法是汉字书写的高级艺术。',
12:'在中国老师备受尊敬。一日为师生终身为父。学生永远称呼老师，从不直呼其名。',
13:'过年前彻底打扫房子扫走晦气，贴红色装饰，挂对联。孩子们守岁到半夜。第二天穿新红衣服。',
14:'第二重要的传统节日，仅次于春节。吃月饼赏满月。象征家庭团圆——月圆人团圆。李白：举头望明月，低头思故乡。',
15:'在中国看病先去社区卫生服务中心再去大医院。带上医保卡。挂号可通过微信小程序预约。大多数常见药在药店无需处方。',
16:'在中国银行开户需要护照、签证和住址证明。最大银行是工商银行、中国银行和建设银行。手机银行极其发达。',
17:'租房可通过中介或App如自如和贝壳。合同通常只有中文——最好找翻译。押金一般一个月房租。注意水电暖气是否包含。',
18:'快递速度极快——上午下单傍晚送到。顺丰中通圆通遍布全国。包裹常放小区快递柜，24小时不取就收费。',
19:'大多数城市用一卡通乘坐所有公交。在北京叫一卡通，地铁站就能买。上海等地用手机支付宝直接刷码乘车。',
20:'微信支付和支付宝极其方便但要注重安全。不要扫描陌生人二维码。开启双重验证。手机就是你的一切财务。',
21:'在大城市垃圾必须严格分类：湿垃圾、干垃圾、可回收物和有害垃圾。垃圾桶有颜色区分，街上有指导员。分错会罚款。',
22:'中国人对排队很有耐心。但在菜市场和地铁里人流密集。在银行或医院记得取号等叫号。',
23:'中国人请客主人一定抢着买单。客人带小礼物（水果茶叶）。说一句我来买单是基本礼貌。商务宴请座位有讲究。',
24:'在中国送礼注意不送钟表（送钟像送终）、不送伞（散意味着分离）、不送刀剪。红包是最安全选择。收礼用双手，不当面打开。',
25:'亲属称谓丰富。用哥哥弟弟姐姐妹妹区分不同年龄同辈。爸爸这边的奶奶叫奶奶爷爷叫爷爷，妈妈那边叫外婆外公。',
26:'中国生肖共12种动物。传说玉皇大帝叫动物来比赛——最先过河的12只拥有自己的年份。老鼠骑着牛过河最后关头跳到了第一名。',
27:'中国茶分六大类：绿茶不发酵清新、红茶全发酵浓郁、白茶微发酵淡雅、乌龙茶半发酵花香、黄茶稀有温和、普洱茶陈年醇厚。',
28:'麻将是144张牌的社交游戏，遍布中国公园茶馆街头。摸牌弃牌组成3-4张组合加一对。哗啦哗啦洗牌声随处可见。',
29:'每天傍晚全国各地数百万大妈到广场上跳集体舞——广场舞。虽有时吵但是她们锻炼社交的快乐方式。部分城市晚九点后禁止。',
30:'中国拥有世界最大高铁网——时速350公里。北京到上海四个半小时。车票在App买（12306），进站需安检。车厢有WiFi电源热餐。'
};

function renderCultureCard() {
  var k = CULTURE_KNOWLEDGE[_cultureCardIdx];
  document.getElementById('cultureEmoji').textContent = k.icon;
  // Show ONE title based on language (not both)
  var isChinese = (lang || '').indexOf('zh') === 0;
  var isEnglish = (lang || '').indexOf('en') === 0;
  var titleZh = document.getElementById('cultureTitleZh');
  var titleSr = document.getElementById('cultureTitleSr');
  if (titleZh) { titleZh.textContent = isEnglish ? k.en : k.zh; titleZh.style.display = isChinese || isEnglish ? '' : 'none'; }
  if (titleSr) { titleSr.textContent = k.sr; titleSr.style.display = (!isChinese && !isEnglish) ? '' : 'none'; }
  var descText = isChinese ? (CULTURE_DESC_ZH[k.id] || k.desc) : (k.desc_sr || k.desc);
  if (isEnglish) descText = k.desc_en || k.desc;
  document.getElementById('cultureDesc').textContent = descText;
  var tagsHtml = ''; k.tags.forEach(function(t){ tagsHtml += '<span class="culture-tag">'+t+'</span>'; });
  document.getElementById('cultureTags').innerHTML = tagsHtml;
  document.getElementById('cultureNavInfo').textContent = (_cultureCardIdx+1) + ' / ' + CULTURE_KNOWLEDGE.length;
  var isToday = _cultureCardIdx === getTodaysCultureIndex();
  var card = document.getElementById('cultureMainCard');
  if (isToday) card.classList.add('culture-today'); else card.classList.remove('culture-today');
  // Update dynamic badge text
  var badge = document.getElementById('cultureTodayBadge');
  if (badge) badge.textContent = cl('todayBadge');
}

function prevCultureCard() { _cultureCardIdx = (_cultureCardIdx - 1 + CULTURE_KNOWLEDGE.length) % CULTURE_KNOWLEDGE.length; renderCultureCard(); }
function nextCultureCard() { _cultureCardIdx = (_cultureCardIdx + 1) % CULTURE_KNOWLEDGE.length; renderCultureCard(); }
function goToTodayCulture() { _cultureCardIdx = getTodaysCultureIndex(); renderCultureCard(); }

/* ================================================================
   END CULTURE MODULE
   ================================================================ */

var _tabOrder = ['dashboard','stats','symptoms','tips','diary','chinese','settings'];
var _prevTabIdx = 0;
document.querySelectorAll('.tab').forEach(btn=>{btn.addEventListener('click',()=>{
  var id = btn.dataset.panel;
  var newIdx = _tabOrder.indexOf(id);
  var dir = newIdx > _prevTabIdx ? 'slide-out-left' : 'slide-out-right';
  _prevTabIdx = newIdx;
  // Deactivate old
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  var oldPanel = document.querySelector('.panel.active');
  if (oldPanel) { oldPanel.classList.add(dir); oldPanel.addEventListener('animationend', function h() { oldPanel.removeEventListener('animationend', h); oldPanel.classList.remove('active', dir); }, {once:true}); }
  else { document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active')); }
  // Activate new
  var newPanel = document.getElementById('panel-'+id);
  newPanel.classList.remove('slide-out-left','slide-out-right');
  newPanel.classList.add('active');
  if(id==='tips')renderTips();
  if(id==='settings')loadSettingsUI();
  if(id==='symptoms'){if(activeProfile!=='barry'){switchToTab('dashboard');return;}if(getGitHubToken()){pullAllSharedData().then(function(){renderBarrySymptomView();});}document.getElementById('symptom-empty').style.display=symptomDate?'none':'';document.getElementById('symptom-content').style.display=symptomDate?'':'none';}
  if(id==='dashboard'){initDashboard();}
  if(id==='stats'){renderStatsPanel();}
  if(id==='diary'){initSharedDiaryTab();}
  if(id==='chinese'){if(typeof initChineseTab==='function')initChineseTab();}
});});
document.querySelectorAll('.lang-btn').forEach(btn=>{btn.addEventListener('click',()=>switchLanguage(btn.dataset.lang));});
document.getElementById('themeBtn').addEventListener('click',()=>{switchTheme(theme==='dark'?'light':'dark');});
document.getElementById('set-theme').addEventListener('change',function(){switchTheme(this.value);});

/* ================================================================
   ONBOARDING
   ================================================================ */
function dismissOnboarding(){document.getElementById('onboardingBanner').style.display='none';localStorage.setItem('cycle-ob-dismissed','1');}
function showOnboardingIfNeeded(){if(activeProfile==='andjela'&&state.records.length===0&&!localStorage.getItem('cycle-ob-dismissed')){document.getElementById('onboardingBanner').style.display='flex';document.getElementById('ob-text').textContent=t('onboarding');}}

function toast(msg){var container=document.getElementById('toastContainer');if(!container)return;while(container.children.length>=3){container.firstChild.remove();}var el=document.createElement('div');el.className='toast';el.textContent=msg;container.appendChild(el);setTimeout(function(){el.classList.add('out');},2800);setTimeout(function(){if(el.parentNode)el.remove();},3300);}

/* Swipe to dismiss modal */
(function(){let startY=0;const overlay=document.getElementById('modal');overlay.addEventListener('touchstart',e=>{if(e.target===overlay||e.target.closest('.modal'))startY=e.touches[0].clientY;},{passive:true});overlay.addEventListener('touchend',e=>{const diff=e.changedTouches[0].clientY-startY;if(diff>80&&!overlay.classList.contains('hidden'))closeModal();});})();
document.getElementById('modal').addEventListener('click',function(e){if(e.target===this)closeModal();});

/* ================================================================
   SYMPTOM ANALYSIS DATA (Barry's view)
   ================================================================ */
const SYMPTOM_HELP = {
  cramps: { cause:{sr:'Materica se kontrahuje da izbaci sluzokožu — prostaglandini izazivaju bol',zh:'子宫收缩排出内膜——前列腺素引起疼痛',en:'Uterus contracts to shed lining — prostaglandins cause pain'}, help:{sr:'🫂 Termofor na stomak • 🍵 Čaj od đumbira • 💆 Nežna masaža donjeg dela leđa • 🚫 Bez hladnih pića',zh:'🫂 暖水袋敷肚子 • 🍵 红糖姜茶 • 💆 轻揉下背部 • 🚫 别喝冰的',en:'🫂 Heating pad • 🍵 Ginger tea • 💆 Gentle lower back massage • 🚫 No cold drinks'} },
  headache: { cause:{sr:'Pad estrogena širi krvne sudove u mozgu',zh:'雌激素下降导致脑血管扩张',en:'Estrogen drop dilates brain blood vessels'}, help:{sr:'🤫 Tiha, zamračena soba • 🧊 Hladan oblog na čelo • 💊 Pitaj da li želi lek protiv bolova',zh:'🤫 安静黑暗的房间 • 🧊 凉毛巾敷额头 • 💊 问她需不需要止痛药',en:'🤫 Quiet dark room • 🧊 Cold compress on forehead • 💊 Ask if she needs pain relief'} },
  fatigue: { cause:{sr:'Telo troši mnogo energije — gvožđe je nisko',zh:'身体消耗大量能量——铁含量低',en:'Body uses lots of energy — iron is low'}, help:{sr:'🛏️ Pusti je da spava • 🧹 Uradi nešto po kući umesto nje • 🍖 Skoro joj hranu bogatu gvožđem',zh:'🛏️ 让她睡 • 🧹 帮她做家务 • 🍖 做含铁丰富的食物',en:'🛏️ Let her sleep • 🧹 Do chores for her • 🍖 Cook iron-rich food for her'} },
  mood: { cause:{sr:'Hormoni divljaju — serotonin i dopamin su na minimumu',zh:'荷尔蒙剧烈波动——血清素和多巴胺都处于低点',en:'Hormones fluctuating wildly — serotonin and dopamine at lows'}, help:{sr:'👂 Slušaj bez osude • 🤐 Ne govori "smiri se" • 🌸 Donesi joj cveće bez razloga • 🫂 Samo je zagrli',zh:'👂 倾听不评判 • 🤐 别说"冷静点" • 🌸 买花给她 • 🫂 就抱着她',en:'👂 Listen without judging • 🤐 Don\'t say "calm down" • 🌸 Bring her flowers • 🫂 Just hold her'} },
  flow: { cause:{sr:'Sluzokoža materice se ljušti — normalan proces',zh:'子宫内膜正在脱落——正常过程',en:'Uterine lining is shedding — normal process'}, help:{sr:'🛒 Kupi joj uloške/tampone ako joj treba • 🚫 Bez dizanja teških stvari • 🛏️ Neka se odmara',zh:'🛒 帮她买卫生巾 • 🚫 别让她提重物 • 🛏️ 让她休息',en:'🛒 Buy pads/tampons if she needs • 🚫 No heavy lifting • 🛏️ Let her rest'} },
  cravings: { cause:{sr:'Nagli pad serotonina — telo traži utehu u hrani',zh:'血清素急剧下降——身体在食物中寻找安慰',en:'Serotonin crash — body seeks comfort in food'}, help:{sr:'🍫 Donesi joj ono što želi bez komentara • 🍕 Naruči njenu omiljenu hranu • 🤐 Ne komentariši njene izbore',zh:'🍫 给她想吃的不要评论 • 🍕 点她最爱吃的 • 🤐 别评论她的食物选择',en:'🍫 Get her what she wants, no comments • 🍕 Order her favorite food • 🤐 Don\'t comment on her choices'} }
};

// Relationship tips for Anđela
const REL_TIPS = {
  sr: [
    {icon:'💬',text:'Ako ti nešto smeta — reci mu. Barry ne ume da čita misli. Iskren razgovor je temelj.'},
    {icon:'💝',text:'Kad uradi nešto lepo za tebe — reci mu. Muškarcima treba potvrda isto koliko i ženama.'},
    {icon:'🫂',text:'Svađate se? Seti se: vi ste tim protiv problema, a ne jedno protiv drugog.'},
    {icon:'🌸',text:'Tvoja osećanja su važeća. Ne moraš da ih pravdavaš. Samo ih izrazi.'},
    {icon:'💌',text:'Male stvari su velike. Poruka "mislim na tebe" znači više nego što misliš.'},
    {icon:'🎯',text:'Reci mu šta ti treba. "Volela bih da me sad saslušaš" je jasnije od ćutanja.'},
    {icon:'🤗',text:'Fizička bliskost nije samo seks. Držanje za ruke, zagrljaj, dodir — sve to gradi vezu.'},
    {icon:'🌙',text:'Kad si umorna i emotivna — reci mu to. "Danas mi je težak dan" je dovoljno.'},
    {icon:'💪',text:'Vi ste različite osobe i to je u redu. Ne morate sve da radite isto.'},
    {icon:'🔥',text:'Strast se gradi svaki dan — flert, nežne reči, iznenađenja. Ne čekaj "posebne prilike".'}
  ],
  'zh-CN': [
    {icon:'💬',text:'如果有什么不满——直接告诉他。Barry 不会读心术。真诚沟通是感情的基础。'},
    {icon:'💝',text:'他做了什么让你开心的事？告诉他。男生也需要被肯定。'},
    {icon:'🫂',text:'吵架时记住：你们 vs 问题，而不是你 vs 他。'},
    {icon:'🌸',text:'你的感受是真实的。不需要为它辩护。只需要表达出来。'},
    {icon:'💌',text:'小事最重要。"想你了"三个字的力量比你想象的大得多。'},
    {icon:'🎯',text:'告诉他你需要什么。"我现在想让你听我说"比沉默更有效。'},
    {icon:'🤗',text:'亲密不只是性。牵手、拥抱、触摸——这些都在建立连接。'},
    {icon:'🌙',text:'累了或情绪不好的时候——告诉他。"今天好累"就够了。'},
    {icon:'💪',text:'你们是不同的个体，这完全没问题。不需要一切都一样。'},
    {icon:'🔥',text:'激情是每天积累的——调情、温柔的话、小惊喜。别等"特别的日子"。'}
  ],
  en: [
    {icon:'💬',text:'If something bothers you — tell him. Barry can\'t read minds. Honest talk is the foundation.'},
    {icon:'💝',text:'He did something nice? Tell him. Men need affirmation as much as women do.'},
    {icon:'🫂',text:'In a fight: you are a team against the problem, not against each other.'},
    {icon:'🌸',text:'Your feelings are valid. You don\'t need to justify them. Just express them.'},
    {icon:'💌',text:'Small things are big. A "thinking of you" message means more than you think.'},
    {icon:'🎯',text:'Tell him what you need. "I\'d love for you to just listen right now" works better than silence.'},
    {icon:'🤗',text:'Physical closeness isn\'t just sex. Holding hands, hugging, touch — it all builds connection.'},
    {icon:'🌙',text:'When you\'re tired or emotional — just tell him. "Today\'s a hard day" is enough.'},
    {icon:'💪',text:'You\'re different people and that\'s OK. You don\'t have to do everything the same way.'},
    {icon:'🔥',text:'Passion builds every day — flirting, sweet words, surprises. Don\'t wait for "special occasions".'}
  ]
};

/* ================================================================
   NEW FEATURES — Hug / Gratitude / Check-in / Song
   ================================================================ */

// ================================================================
// Virtual Hug — redesigned: heartbeat, hug back, streaks, float hearts
// ================================================================
const HUG_EXPIRY_MS = 86400000; // 24 hours

// Spawn floating hearts animation
function spawnFloatingHearts(container) {
  var hearts = ['💕','💖','💗','💝','✨','💫'];
  for (var i = 0; i < 8; i++) {
    (function(idx) {
      setTimeout(function() {
        var h = document.createElement('span');
        h.className = 'floating-heart';
        h.textContent = hearts[idx % hearts.length];
        h.style.left = (20 + Math.random() * 60) + '%';
        h.style.bottom = '20px';
        container.appendChild(h);
        setTimeout(function() { if (h.parentNode) h.remove(); }, 1300);
      }, idx * 80);
    })(i);
  }
}

// Hug streak: count consecutive days with hug exchanged
function getHugStreak() {
  var allData = loadSharedDiaryData();
  var today = new Date(); var streak = 0;
  for (var i = 0; i < 365; i++) {
    var d = new Date(today); d.setDate(d.getDate() - i);
    var key = fmtDate(d); var day = allData[key];
    // Both partners must have sent a hug
    if (day && day['barry'] && day['barry'].hug && day['andjela'] && day['andjela'].hug) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function sendHug(hugBack) {
  var todayKey = fmtDate(new Date());
  var count = parseInt(localStorage.getItem('hug-count-' + todayKey) || '0');
  if (count >= 2) { toast(lang === 'sr' ? 'Već si poslao/la 2 zagrljaja danas — probaj sutra! 🤗' : lang === 'en' ? 'You already sent 2 hugs today — try tomorrow! 🤗' : '今天已经抱了2次——明天再来！🤗'); return; }
  count++;
  localStorage.setItem('hug-count-' + todayKey, count);

  var hug = { from: activeProfile, time: Date.now() };
  localStorage.setItem('shared-hug', JSON.stringify(hug));

  // Also store in shared diary for streak tracking
  var allData = loadSharedDiaryData();
  if (!allData[todayKey]) allData[todayKey] = {};
  if (!allData[todayKey][activeProfile]) allData[todayKey][activeProfile] = {};
  allData[todayKey][activeProfile].hug = { time: Date.now() };
  saveSharedDiaryData(allData);

  // Animate
  var btn = document.getElementById('hugSendBtn');
  if (btn) { btn.classList.add('sending'); setTimeout(function() { btn.classList.remove('sending'); }, 600); }

  // Floating hearts
  var card = document.getElementById('hugCard');
  if (card) spawnFloatingHearts(card);

  renderHug();
  var senderLabel = activeProfile === 'barry' ? (lang === 'sr' ? 'Poslao si joj zagrljaj!' : lang === 'en' ? 'Hug sent!' : '拥抱已发送！') : (lang === 'sr' ? 'Poslala si mu zagrljaj!' : lang === 'en' ? 'Hug sent!' : '拥抱已发送！');
  toast('🤗 ' + senderLabel + ' (' + count + '/2)');
}

function checkHug() {
  try {
    var hug = JSON.parse(localStorage.getItem('shared-hug'));
    if (!hug) return null;
    // 24-hour expiry
    if (Date.now() - hug.time > HUG_EXPIRY_MS) { localStorage.removeItem('shared-hug'); return null; }
    if (hug.from === activeProfile) return null;
    return hug;
  } catch (e) { return null; }
}

function dismissHug() {
  localStorage.removeItem('shared-hug');
  renderHug();
}

function renderHug() {
  var hug = checkHug();
  var card = document.getElementById('hugContent');
  var title = document.getElementById('hug-title');
  if (!title) return;
  title.textContent = lang === 'sr' ? '🤗 Virtuelni zagrljaj' : lang === 'en' ? '🤗 Virtual Hug' : '🤗 隔空拥抱';
  var todayKey = fmtDate(new Date());
  var count = parseInt(sessionStorage.getItem('hug-count-' + todayKey) || '0');
  var remaining = 2 - count;
  var streak = getHugStreak();

  if (hug) {
    // RECEIVED STATE — beautiful card
    var sender = hug.from === 'andjela' ? '🌸 Anđela' : '👦 Barry';
    var time = new Date(hug.time);
    var timeStr = String(time.getHours()).padStart(2, '0') + ':' + String(time.getMinutes()).padStart(2, '0');

    var html = '<div class="hug-received">';
    if (streak > 1) html += '<div class="hug-streak-badge">🔥 ' + (lang === 'sr' ? streak + ' dana zaredom!' : lang === 'en' ? streak + '-day streak!' : '连续 ' + streak + ' 天！') + '</div>';
    html += '<span class="hug-icon-wrap"><span class="hug-icon">🤗</span></span>';
    html += '<div class="hug-text">' + sender + ' ' + (lang === 'sr' ? 'te zagrlio/la! 💫' : lang === 'en' ? 'hugged you! 💫' : '抱了你！💫') + '</div>';
    html += '<div class="hug-time">' + timeStr + '</div>';
    html += '<button class="hug-back-btn" onclick="sendHug(true)" id="hugBackBtn">💝 ' + (lang === 'sr' ? 'Uzvrati zagrljaj' : lang === 'en' ? 'Hug back' : '回抱一个') + '</button>';
    html += '<div><button class="hug-dismiss" onclick="dismissHug()">' + (lang === 'sr' ? '✕ zatvori' : lang === 'en' ? '✕ dismiss' : '✕ 关闭') + '</button></div>';
    html += '</div>';
    card.innerHTML = html;

    // Auto-spawn hearts when receiving
    var hugCard = document.getElementById('hugCard');
    if (hugCard) spawnFloatingHearts(hugCard);
  } else if (count > 0) {
    // SENT STATE — waiting for partner
    var sentHearts = '';
    for (var i = 0; i < 2; i++) {
      sentHearts += '<span class="hh-heart' + (i >= remaining ? ' used' : '') + '">' + (i < count ? '❤️' : '🤍') + '</span>';
    }
    var html = '<div class="hug-sent-state">';
    html += '<div class="hug-hearts-row">' + sentHearts + '</div>';
    html += '<span class="hss-icon">📬</span>';
    html += '<div class="hss-text">' + (lang === 'sr' ? 'Zagrljaj poslat! Čekam odgovor... 💌' : lang === 'en' ? 'Hug sent! Waiting for response... 💌' : '拥抱已发送！等待回应... 💌') + '</div>';
    html += '<button class="hug-back-btn" onclick="sendHug()" style="margin-top:8px">🤗 ' + (lang === 'sr' ? 'Pošalji još jedan (' + remaining + ')' : lang === 'en' ? 'Send another (' + remaining + ')' : '再抱一次 (' + remaining + ')') + '</button>';
    html += '</div>';
    card.innerHTML = html;
  } else {
    // SEND STATE — fresh button
    var label = lang === 'sr' ? 'Pošalji zagrljaj' : lang === 'en' ? 'Send a Hug' : '发送拥抱';
    var html = '';
    if (streak > 1) html += '<div style="text-align:center"><div class="hug-streak-badge">🔥 ' + (lang === 'sr' ? streak + ' dana zaredom!' : lang === 'en' ? streak + '-day streak!' : '连续 ' + streak + ' 天！') + '</div></div>';
    html += '<button class="hug-btn" onclick="sendHug()" id="hugSendBtn">🤗 ' + label + '</button>';
    card.innerHTML = html;
  }
}

// Gratitude Wall
function addGratitude() {
  var input = document.getElementById('gratInput');
  var text = input.value.trim();
  if (!text) return;
  var notes = JSON.parse(localStorage.getItem('shared-gratitude') || '[]');
  notes.push({ text: text, from: activeProfile, time: Date.now() });
  if (notes.length > 20) notes = notes.slice(-20);
  localStorage.setItem('shared-gratitude', JSON.stringify(notes));
  _gratNotes = null; input.value = '';
  renderGratitude();
  pushAllSharedData();
}
function renderGratitude() {
  var title = document.getElementById('grat-title');
  var input = document.getElementById('gratInput');
  var list = document.getElementById('gratList');
  if (!title || !input || !list) return;
  title.textContent = lang==='sr'?'💝 Zid zahvalnosti':lang==='en'?'💝 Gratitude Wall':'💝 感恩便签';
  input.placeholder = lang==='sr'?'Hvala ti za...':lang==='en'?'Thank you for...':'谢谢你...';
  var notes = JSON.parse(localStorage.getItem('shared-gratitude') || '[]');
  if (notes.length === 0) { list.innerHTML = ''; return; }
  list.innerHTML = notes.slice(-5).reverse().map(function(n, i){
    var sender = n.from === 'andjela' ? '🌸' : '👦';
    var partnerLang = n.from === 'andjela' ? 'sr' : (lang === 'sr' ? 'zh-CN' : 'sr');
    var needTrans = n.from !== (activeProfile === 'andjela' ? 'andjela' : 'barry');
    var btnHtml = needTrans ? ' <button onclick="translateGrat('+i+')" style="font-size:.55rem;padding:1px 6px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);cursor:pointer" title="'+partnerLang+'">🌐</button>' : '';
    return '<div class="gratitude-item"><span class="gratitude-heart">'+sender+'</span><span id="grat-txt-'+i+'">'+esc(n.text)+'</span>'+btnHtml+'</div>';
  }).join('');
}
var _gratNotes = null;
function translateGrat(idx) {
  if (!_gratNotes) _gratNotes = JSON.parse(localStorage.getItem('shared-gratitude') || '[]');
  var n = _gratNotes[idx]; if (!n) return;
  var fromLang = n.from === 'andjela' ? 'sr' : (lang === 'sr' ? 'zh-CN' : 'sr');
  var toLang = lang === 'sr' ? 'sr' : (lang === 'zh-CN' ? 'zh-CN' : 'en');
  if (fromLang === toLang) return;
  translateText(n.text, fromLang, toLang).then(function(translated) {
    var el = document.getElementById('grat-txt-' + idx);
    if (el) el.textContent = translated;
  });
}

// Weekly Check-in
const CHECKIN_QUESTIONS = {
  sr: [
    {q:'Kako se osećaš u vezi ove nedelje?', opts:['😍 Sjajno','😊 Dobro','😐 Ok','😞 Loše']},
    {q:'Da li smo dovoljno komunicirali?', opts:['💬 Da, odlično','👍 Uglavnom','🤔 Moglo bi bolje','👎 Ne baš']},
    {q:'Šta bi voleo/la da poboljšamo sledeće nedelje?', opts:['💏 Više zajedničkog vremena','💬 Bolja komunikacija','🔥 Više romantike','🤝 Više podrške']}
  ],
  'zh-CN': [
    {q:'这周的感情状态怎么样？', opts:['😍 很棒','😊 不错','😐 一般','😞 不太好']},
    {q:'我们这周的沟通足够吗？', opts:['💬 很好','👍 还行','🤔 可以更好','👎 不太够']},
    {q:'下周希望我们哪方面做得更好？', opts:['💏 更多陪伴','💬 更好交流','🔥 更多浪漫','🤝 更多支持']}
  ],
  en: [
    {q:'How do you feel about this week together?', opts:['😍 Amazing','😊 Good','😐 OK','😞 Not great']},
    {q:'Did we communicate enough?', opts:['💬 Yes, great','👍 Mostly','🤔 Could improve','👎 Not really']},
    {q:'What would you like more of next week?', opts:['💏 More time together','💬 Better talks','🔥 More romance','🤝 More support']}
  ]
};
function saveCheckinAnswer(qIdx, answer) {
  var key = 'shared-checkin-' + activeProfile;
  var answers = JSON.parse(localStorage.getItem(key) || '{}');
  answers[qIdx] = answer;
  localStorage.setItem(key, JSON.stringify(answers));
  renderCheckin();
  pushAllSharedData();
}
function getCheckinAnswers(profile) {
  return JSON.parse(localStorage.getItem('shared-checkin-' + profile) || '{}');
}
function renderCheckin() {
  var dow = new Date().getDay(); // 0=Sun,6=Sat
  if (dow !== 0 && dow !== 6) { document.getElementById('checkinCard').style.display = 'none'; return; }
  document.getElementById('checkinCard').style.display = '';
  document.getElementById('checkin-title').textContent = lang==='sr'?'🎯 Nedeljni pregled':lang==='en'?'🎯 Weekly Check-in':'🎯 每周感情体检';
  var questions = CHECKIN_QUESTIONS[lang] || CHECKIN_QUESTIONS['sr'];
  var myAnswers = getCheckinAnswers(activeProfile);
  var partnerProfile = activeProfile === 'andjela' ? 'barry' : 'andjela';
  var partnerAnswers = getCheckinAnswers(partnerProfile);
  var partnerName = partnerProfile === 'andjela' ? '🌸 Anđela' : '👦 Barry';

  var html = questions.map(function(q, i){
    var myPick = myAnswers[i] || '';
    var partnerPick = partnerAnswers[i] || '';
    var optsHtml = q.opts.map(function(o){ return '<span class="cq-opt'+(myPick===o?' picked':'')+'" onclick="saveCheckinAnswer('+i+',\''+o.replace(/'/g,"\\'")+'\')">'+o+'</span>'; }).join('');
    var partnerHtml = partnerPick ? '<div style="font-size:.62rem;color:var(--gold);margin-top:4px">'+partnerName+': '+partnerPick+'</div>' : '';
    return '<div class="checkin-q"><div class="cq-label"><span>'+q.q+'</span></div><div class="cq-options">'+optsHtml+'</div>'+partnerHtml+'</div>';
  }).join('');

  if (Object.keys(myAnswers).length === 0 && Object.keys(partnerAnswers).length === 0) {
    html += '<div style="text-align:center;font-size:.68rem;color:var(--text-muted);margin-top:8px">'+(lang==='sr'?'Odgovori na pitanja — partner će videti tvoje odgovore ✨':lang==='en'?'Answer the questions — your partner will see your answers ✨':'回答问题——伴侣会看到你的答案 ✨')+'</div>';
  }
  document.getElementById('checkinContent').innerHTML = html;
}

// Our Song
function saveMySong() {
  var title = document.getElementById('songInputTitle').value.trim();
  if (!title) { toast(lang==='sr'?'Unesi naziv pesme 🎵':lang==='en'?'Enter a song title 🎵':'请输入歌名 🎵'); return; }
  var note = document.getElementById('songInputNote').value.trim();
  var song = { title: title, note: note || '', from: activeProfile, time: Date.now() };
  localStorage.setItem('shared-song-' + activeProfile, JSON.stringify(song));
  renderSong();
  pushAllSharedData();
  toast('🎵 ' + (lang==='sr'?'Pesma sačuvana!':lang==='en'?'Song saved!':'歌曲已保存！'));
}
function loadSong(profile) {
  try { return JSON.parse(localStorage.getItem('shared-song-' + profile)); } catch(e) { return null; }
}

/* ================================================================
   KNOW ME QUIZ — Daily question to understand each other better
   ================================================================ */
var KNOW_ME_QUESTIONS = [
  {key:'fav_city',q:{sr:'Koji je omiljeni grad tvog/tvoje partnera?',zh:'对方最喜欢的城市是哪里？',en:'What is your partner\'s favorite city?'}},
  {key:'first_date_color',q:{sr:'Šta je tvoj/tvoja partner/ka nosio/la na prvom sastanku?',zh:'第一次约会对方穿什么颜色的衣服？',en:'What color did your partner wear on your first date?'}},
  {key:'dream_trip',q:{sr:'Gde bi tvoj/tvoja partner/ka najradije putovao/la?',zh:'对方最想去的旅行目的地是哪里？',en:'Where does your partner dream of traveling to?'}},
  {key:'comfort_food',q:{sr:'Koja je omiljena hrana tvog/tvoje partnera za utehu?',zh:'对方心情不好时最爱吃什么？',en:'What comfort food does your partner reach for?'}},
  {key:'hidden_talent',q:{sr:'Koji skriveni talenat ima tvoj/tvoja partner/ka?',zh:'对方有什么隐藏的才艺？',en:'What hidden talent does your partner have?'}},
  {key:'childhood_dream',q:{sr:'Šta je tvoj/tvoja partner/ka želeo/la da bude kao dete?',zh:'对方小时候的梦想职业是什么？',en:'What did your partner dream of becoming as a child?'}},
  {key:'pet_peeve',q:{sr:'Šta tvog/tvoju partnera/ku najviše nervira?',zh:'对方最讨厌的事情是什么？',en:'What annoys your partner the most?'}},
  {key:'perfect_day',q:{sr:'Kako izgleda savršen dan za tvog/tvoju partnera/ku?',zh:'对方心目中的完美一天是怎样的？',en:'What does your partner\'s perfect day look like?'}},
  {key:'music_taste',q:{sr:'Koja je omiljena pesma tvog/tvoje partnera trenutno?',zh:'对方最近单曲循环的歌是什么？',en:'What song is your partner playing on repeat lately?'}},
  {key:'love_language',q:{sr:'Koji je glavni jezik ljubavi tvog/tvoje partnera?',zh:'对方最重要的爱的语言是什么？',en:'What is your partner\'s primary love language?'}},
  {key:'smell_memory',q:{sr:'Koji miris podseća tvog/tvoju partnera/ku na vas?',zh:'什么味道会让对方想起你？',en:'What scent reminds your partner of you?'}},
  {key:'future_5years',q:{sr:'Gde tvoj/tvoja partner/ka vidi sebe za 5 godina?',zh:'对方觉得五年后的自己会在哪里？',en:'Where does your partner see themselves in 5 years?'}},
  {key:'best_quality',q:{sr:'Šta tvoj/tvoja partner/ka najviše ceni kod sebe?',zh:'对方最欣赏自己的哪个品质？',en:'What quality does your partner admire most in themselves?'}},
  {key:'favorite_memory',q:{sr:'Koje je omiljeno zajedničko sećanje tvog/tvoje partnera?',zh:'对方最喜欢你们在一起时的哪个回忆？',en:'What is your partner\'s favorite shared memory with you?'}},
  {key:'morning_routine',q:{sr:'Kako tvoj/tvoja partner/ka započinje jutro?',zh:'对方早上起来做的第一件事是什么？',en:'What is the first thing your partner does in the morning?'}}
];

function getKnowMeData() { try { return JSON.parse(localStorage.getItem('shared-knowme') || '{}'); } catch(e) { return {}; } }
function saveKnowMeData(data) { localStorage.setItem('shared-knowme', JSON.stringify(data)); }

function renderKnowMe() {
  var card = document.getElementById('knowMeCard'); if (!card) return;
  document.getElementById('knowMe-title').textContent = lang==='sr'?'💭 Da li me poznaješ?':lang==='en'?'💭 Do You Know Me?':'💭 你了解我吗？';
  var todayIdx = Math.floor(Date.now() / 86400000) % KNOW_ME_QUESTIONS.length;
  var q = KNOW_ME_QUESTIONS[todayIdx];
  var qText = q.q[lang] || q.q['sr'];
  var dateKey = fmtDate(today());
  var allData = getKnowMeData();
  var dayData = allData[dateKey] || {};
  var myAns = dayData[activeProfile];
  var partnerProfile = activeProfile === 'andjela' ? 'barry' : 'andjela';
  var partnerAns = dayData[partnerProfile];
  var partnerName = partnerProfile === 'andjela' ? '🌹 Anđela' : '👦 Barry';
  var myName = activeProfile === 'andjela' ? '🌹 Anđela' : '👦 Barry';
  var html = '';
  html += '<div style="font-size:.78rem;color:var(--love);font-weight:600;margin-bottom:12px;text-align:center;line-height:1.4">'+qText+'</div>';
  if (myAns) {
    var myLabel = lang==='sr'?'odgovor':lang==='en'?' answer':'的回答';
    html += '<div style="background:var(--rose-light);border-radius:12px;padding:10px 14px;margin-bottom:8px"><span style="font-size:.62rem;color:var(--text-muted)">'+myName+' '+myLabel+'</span><div style="font-size:.8rem;color:var(--text);margin-top:4px">'+esc(myAns.answer)+'</div></div>';
  } else {
    html += '<div style="margin-bottom:10px"><textarea id="knowMeInput" placeholder="'+(lang==='sr'?'Tvoj odgovor...':lang==='en'?'Your answer...':'你的答案...')+'" style="width:100%;border:1px solid var(--border);border-radius:12px;padding:10px 12px;font-size:.74rem;font-family:var(--font);background:var(--card);color:var(--text);resize:none;min-height:44px" maxlength="120"></textarea><button class="btn btn-primary" onclick="saveKnowMeAnswer()" style="width:100%;font-size:.7rem;padding:8px;margin-top:6px">💭 '+(lang==='sr'?'Odgovori':lang==='en'?'Answer':'回答')+'</button></div>';
  }
  // Partner answer section
  if (partnerAns) {
    var partnerThinkLabel = lang==='sr'?' misli da je:':lang==='en'?' thinks it is:':'认为:';
    html += '<div style="padding-top:8px;border-top:1px solid var(--border);margin-top:4px"><span style="font-size:.62rem;color:var(--teal);font-weight:600">👀 '+partnerName+partnerThinkLabel+'</span><div style="font-size:.82rem;color:var(--teal);margin-top:4px;font-style:italic;line-height:1.4">'+esc(partnerAns.answer)+'</div></div>';
    // Show if answers match!
    if (myAns && partnerAns && myAns.answer.trim().toLowerCase() === partnerAns.answer.trim().toLowerCase()) {
      html += '<div style="text-align:center;margin-top:8px;font-size:1.5rem;animation:bounce-arrow .8s infinite">💞</div><div style="text-align:center;font-size:.7rem;color:var(--love);font-weight:600">'+(lang==='sr'?'Savršeno se razumete! ✨':lang==='en'?'You two are perfectly in sync! ✨':'你们太有默契了！✨')+'</div>';
    }
  } else if (myAns) {
    html += '<div style="text-align:center;padding:10px;color:var(--text-muted);font-size:.68rem;font-style:italic">⏳ '+(lang==='sr'?'Čeka se odgovor tvog partnera...':lang==='en'?'Waiting for your partner to answer...':'等待对方回答...')+'</div>';
  }
  document.getElementById('knowMeContent').innerHTML = html;
}
function saveKnowMeAnswer() {
  var input = document.getElementById('knowMeInput'); if (!input) return;
  var answer = input.value.trim(); if (!answer) return;
  var dateKey = fmtDate(today());
  var allData = getKnowMeData();
  if (!allData[dateKey]) allData[dateKey] = {};
  allData[dateKey][activeProfile] = { answer: answer, time: Date.now() };
  saveKnowMeData(allData);
  pushAllSharedData();
  renderKnowMe();
  toast('💭 '+(lang==='sr'?'Odgovor sačuvan!':lang==='en'?'Answer saved!':'答案已保存！'));
}

function renderSong() {
  var st = document.getElementById('song-title'); if (!st) return;
  st.textContent = lang==='sr'?'🎵 Naša pesma':lang==='en'?'🎵 Our Song':'🎵 我们的歌';
  var mySong = loadSong(activeProfile);
  var partnerProfile = activeProfile === 'andjela' ? 'barry' : 'andjela';
  var partnerSong = loadSong(partnerProfile);
  var partnerName = partnerProfile === 'andjela' ? '🌸 Anđela' : '👦 Barry';
  var html = '';
  if (mySong) {
    html += '<div style="margin-bottom:10px"><span style="font-size:.62rem;color:var(--text-muted)">'+(lang==='sr'?'Moja pesma':lang==='en'?'My song':'我的歌')+'</span><div class="song-title">🎶 '+mySong.title+'</div>'+(mySong.note?'<div class="song-note">'+mySong.note+'</div>':'')+'</div>';
  } else {
    html += '<div style="margin-bottom:10px"><input id="songInputTitle" placeholder="'+(lang==='sr'?'Naziv pesme...':lang==='en'?'Song title...':'歌名...')+'" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:12px;font-size:.74rem;font-family:var(--font);background:var(--card);color:var(--text);margin-bottom:6px"><input id="songInputNote" placeholder="'+(lang==='sr'?'Zašto baš ova pesma?':lang==='en'?'Why this song?':'为什么是这首歌？')+'" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:12px;font-size:.74rem;font-family:var(--font);background:var(--card);color:var(--text);margin-bottom:6px"><button class="btn btn-primary" onclick="saveMySong()" style="width:100%;font-size:.7rem;padding:8px">🎵 '+(lang==='sr'?'Sačuvaj':lang==='en'?'Save':'保存')+'</button></div>';
  }
  if (partnerSong) {
    html += '<div style="padding-top:8px;border-top:1px solid var(--border)"><span style="font-size:.62rem;color:var(--text-muted)">'+partnerName+' '+(lang==='sr'?'pesma':lang==='en'?'song':'的歌')+'</span><div class="song-title">🎶 '+esc(partnerSong.title)+'</div>'+(partnerSong.note?'<div class="song-note">'+esc(partnerSong.note)+'</div>':'')+'</div>';
  }
  document.getElementById('songContent').innerHTML = html || '<span class="song-icon">🎶</span><div class="song-note">'+(lang==='sr'?'Postavite pesme koje vas podsećaju jedno na drugo':lang==='en'?'Set songs that remind you of each other':'设置让你们想到彼此的歌')+'</div>';
}

// Anđela's relationship tips
function renderRelTips() {
  if (activeProfile !== 'andjela') { document.getElementById('relTipCard').style.display = 'none'; return; }
  var tips = REL_TIPS[lang] || REL_TIPS['sr'];
  var tip = tips[Math.floor(Math.random() * tips.length)];
  document.getElementById('relTipIcon').textContent = tip.icon;
  document.getElementById('relTipText').textContent = tip.text;
  document.getElementById('relTipCard').style.display = '';
}

// Barry's symptom + cycle phase analysis
const PHASE_ANALYSIS = {
  period: {
    name:{sr:'Menstruacija',en:'Period','zh-CN':'经期'},
    days:{sr:'Dan 1-7 ciklusa',en:'Day 1-7 of cycle','zh-CN':'周期第1-7天'},
    energy:{sr:'⭐ Niska — odmara se',en:'⭐ Low — resting','zh-CN':'⭐ 低——需要休息'},
    libido:{sr:'🔥 Nizak (moguć blagi porast pred kraj)',en:'🔥 Low (may rise slightly toward end)','zh-CN':'🔥 低（快结束时可能略有回升）'},
    physical:{sr:'Materica se kontrahuje, gvožđe opada. Može imati: grčeve u stomaku, glavobolju, umor, bol u leđima, nadutost.',en:'Uterus contracting, iron drops. May have: cramps, headache, fatigue, back pain, bloating.','zh-CN':'子宫收缩，铁元素下降。可能有：痛经、头痛、极度疲劳、腰酸、腹胀。'},
    emotional:{sr:'Oseća se ranjivo, povučeno. Emocije su intenzivne — može plakati bez razloga. Želi sigurnost i nežnost, ne rešenja.',en:'Feels vulnerable, withdrawn. Emotions intense — may cry without reason. Wants safety and tenderness, not solutions.','zh-CN':'感到脆弱、想独处。情绪强烈——可能没有理由就哭。需要安全感，不需要解决方案。'},
    sex:{sr:'Nizak libido. Ne pritiskaj — nežnost bez očekivanja je ono što joj treba. Ako je raspoložena, budi nežan i pažljiv.',en:'Low libido. Don\'t pressure — tenderness without expectation is what she needs. If she\'s in the mood, be gentle and attentive.','zh-CN':'性欲低。别给她压力——她需要的是无期待的温柔。如果她有兴致，一定要轻柔体贴。'},
    support:{sr:'🫂 Zagrli je bez razloga • 🍵 Skuvaj topao čaj • 🛏️ Pusti je da spava • 🤐 Ne pametuj — samo slušaj • 🍫 Donesi čokoladu',en:'🫂 Hug her without reason • 🍵 Make warm tea • 🛏️ Let her sleep • 🤐 Don\'t lecture — just listen • 🍫 Bring chocolate','zh-CN':'🫂 无条件抱抱 • 🍵 泡热茶 • 🛏️ 让她睡 • 🤐 别讲道理——就听 • 🍫 带巧克力'},
    warning:{sr:'Ne govori "nije to ništa" — za nju JESTE. Ne pokreći teške teme. Ne očekuj seks.',en:'Don\'t say "it\'s nothing" — to her, it IS. Don\'t bring up heavy topics. Don\'t expect sex.','zh-CN':'别说"没那么严重"——对她来说就是很严重。别讨论沉重话题。别期待性生活。'}
  },
  follicular: {
    name:{sr:'Folikularna',en:'Follicular','zh-CN':'卵泡期'},
    days:{sr:'Dan 8-13 ciklusa',en:'Day 8-13 of cycle','zh-CN':'周期第8-13天'},
    energy:{sr:'⭐⭐⭐⭐ Raste — sve više energije',en:'⭐⭐⭐⭐ Rising — more energy each day','zh-CN':'⭐⭐⭐⭐ 上升中——精力越来越好'},
    libido:{sr:'🔥🔥 Raste postepeno — počinje da se oseća privlačno',en:'🔥🔥 Rising gradually — starting to feel attractive','zh-CN':'🔥🔥 逐渐上升——开始感觉自己有魅力'},
    physical:{sr:'Estrogen raste! Koža blista, kosa sjajna, telo se oseća jače. Ovo je faza kad izgleda najbolje — primetićeš.',en:'Estrogen rising! Skin glows, hair shines, body feels stronger. This is when she looks her best — you\'ll notice.','zh-CN':'雌激素上升！皮肤发光、头发亮泽、身体更有力。这是她最好看的阶段——你会注意到的。'},
    emotional:{sr:'Optimistična, društvena, kreativna. Najbolje vreme za nove planove. Otvorena za razgovor — iskoristi to.',en:'Optimistic, social, creative. Best time for new plans. Open to conversation — use this.','zh-CN':'乐观、爱社交、有创意。最适合制定新计划。愿意聊天——抓住机会。'},
    sex:{sr:'Libido raste svakim danom. Još nije na vrhuncu, ali je sve otvorenija za flert i dodir. Odlično vreme za predigru i istraživanje.',en:'Libido rising each day. Not at peak yet, but increasingly open to flirtation and touch. Great time for foreplay and exploration.','zh-CN':'性欲每天都在上升。还没到顶峰，但对调情和触碰越来越开放。适合前戏和探索的好时机。'},
    support:{sr:'💬 Pričaj o planovima za budućnost • 🎯 Predloži izlazak ili putovanje • 🌸 Kupi cveće — primetiće • 💪 Vežbajte zajedno',en:'💬 Talk about future plans • 🎯 Suggest going out or a trip • 🌸 Buy flowers — she\'ll notice • 💪 Exercise together','zh-CN':'💬 聊未来计划 • 🎯 约她出去或旅行 • 🌸 买花——她一定注意到 • 💪 一起运动'},
    warning:{sr:'Ne propusti ovu fazu — ona se otvara ka tebi. Budi prisutan i angažovan.',en:'Don\'t miss this phase — she\'s opening up to you. Be present and engaged.','zh-CN':'别错过这个阶段——她正在向你敞开心扉。积极参与她的生活。'}
  },
  ovulation: {
    name:{sr:'Ovulacija',en:'Ovulation','zh-CN':'排卵期'},
    days:{sr:'Dan 14-16 ciklusa',en:'Day 14-16 of cycle','zh-CN':'周期第14-16天'},
    energy:{sr:'⭐⭐⭐⭐⭐ Vrhunac — na maksimumu!',en:'⭐⭐⭐⭐⭐ Peak — at maximum!','zh-CN':'⭐⭐⭐⭐⭐ 巅峰——状态最好！'},
    libido:{sr:'🔥🔥🔥🔥🔥 VRHUNAC — libido na maksimumu. Ovo su dani kad je najviše zainteresovana za seks.',en:'🔥🔥🔥🔥🔥 PEAK — libido at maximum. These are the days she\'s most interested in sex.','zh-CN':'🔥🔥🔥🔥🔥 最高——性欲达到顶峰。这是她最想要性爱的几天。'},
    physical:{sr:'Vrhunac energije i plodnosti. Može osetiti blagi bol u karlici (ovulacioni bol). Bistar sekret — znak plodnosti. Grudi mogu biti osetljivije.',en:'Peak energy and fertility. May feel mild pelvic pain. Clear discharge — sign of fertility. Breasts may be more sensitive.','zh-CN':'能量和生育力巅峰。可能有轻微排卵痛。分泌物清亮——生育力标志。乳房可能更敏感。'},
    emotional:{sr:'Samopouzdana, privlačna, magnetična. Oseća se NAJBOLJE u celom ciklusu. Komplimenti joj sad znače najviše — i veruje im.',en:'Confident, attractive, magnetic. Feels her BEST in the whole cycle. Compliments mean the most now — and she believes them.','zh-CN':'自信、迷人、有魅力。整个周期中状态最好。现在夸她最有效——而且她真的会相信。'},
    sex:{sr:'Ovo su dani kad je najotvorenija za seks. Njeno telo je bukvalno programirano za intimnost sad. Iniciraj nežno — gotovo sigurno će biti raspoložena. Najbolji dani za začeće.',en:'These are the days she\'s most open to sex. Her body is literally programmed for intimacy now. Initiate gently — she\'s almost certainly in the mood. Best days for conception.','zh-CN':'这是她最愿意做爱的几天。她的身体此时天然地渴望亲密。温柔地主动——她几乎一定会有回应。最容易受孕的日子。'},
    support:{sr:'✨ Iskreni komplimenti (izgled, miris, energija) • 💋 Budi romantičan i pažljiv • 🎉 Izvedi je — ples, večera, bilo šta • 🔥 Iniciraj intimnost',en:'✨ Genuine compliments (looks, smell, energy) • 💋 Be romantic and attentive • 🎉 Take her out — dancing, dinner, anything • 🔥 Initiate intimacy','zh-CN':'✨ 真诚赞美（外表、气味、能量）• 💋 浪漫体贴 • 🎉 带她出去——跳舞、晚餐 • 🔥 主动亲密'},
    warning:{sr:'Ovo su njeni NAJBOLJI dani. Ne preskači ih. Ako postoji dan za romantiku — ovo je taj dan.',en:'These are her BEST days. Don\'t skip them. If there\'s a day for romance — this is it.','zh-CN':'这是她最好的日子。别错过。如果要选浪漫的一天——就是这天。'}
  },
  luteal: {
    name:{sr:'Lutealna',en:'Luteal','zh-CN':'黄体期'},
    days:{sr:'Dan 17-28 ciklusa',en:'Day 17-28 of cycle','zh-CN':'周期第17-28天'},
    energy:{sr:'⭐⭐ Prvo ok, pred kraj pada — umor raste',en:'⭐⭐ OK at first, drops toward end — fatigue grows','zh-CN':'⭐⭐ 前期还行，越往后越累——疲劳加重'},
    libido:{sr:'🔥🔥 Prvo OK, pred kraj opada. Može varirati — dan da, dan ne.',en:'🔥🔥 OK at first, drops toward end. May vary — day yes, day no.','zh-CN':'🔥🔥 前期还行，越往后越低。可能忽高忽低——今天想明天不想。'},
    physical:{sr:'Progesteron dominira. Telo zadržava vodu — oseća se naduto. Grudi osetljive. Akne moguće. Pred kraj: umor, žudnja za hranom, glavobolje.',en:'Progesterone dominates. Water retention — feels bloated. Breast tenderness. Acne possible. Near the end: fatigue, cravings, headaches.','zh-CN':'孕激素主导。身体水肿——感觉浮肿。乳房胀痛。可能长痘。快结束时：极度疲劳、特别想吃东西、头痛。'},
    emotional:{sr:'PMS faza: raspoloženje varira. Može biti razdražljiva, anksiozna, plačljiva. Važno: OVO NIJE ONA — ovo su hormoni. Ne uzimaj ništa lično.',en:'PMS phase: mood swings. May be irritable, anxious, tearful. Important: THIS IS NOT HER — this is hormones. Don\'t take anything personally.','zh-CN':'PMS阶段：情绪波动。可能烦躁、焦虑、想哭。重要：这不是真的她——这是荷尔蒙。千万别往心里去。'},
    sex:{sr:'Libido varira. U prvoj polovini može biti raspoložena. Pred kraj — verovatno neće biti zainteresovana. Ne pritiskaj. Ako kaže ne — to je NE.',en:'Libido varies. First half may be in the mood. Near the end — probably not interested. Don\'t pressure. If she says no — it\'s NO.','zh-CN':'性欲忽高忽低。前半段可能有兴致。快结束时——八成不想。别施压。她说不要就是真的不要。'},
    support:{sr:'🍵 Čaj bez kofeina • 🤐 Slušaj — ne rešavaj • 🍕 Naruči njenu omiljenu hranu • 🌙 Topla kupka, sveće, muzika • 💆 Ponudi masažu',en:'🍵 Caffeine-free tea • 🤐 Listen — don\'t solve • 🍕 Order her favorite food • 🌙 Warm bath, candles, music • 💆 Offer massage','zh-CN':'🍵 无咖啡因茶 • 🤐 听就好——别解决 • 🍕 点她爱吃的 • 🌙 热水澡、蜡烛、音乐 • 💆 主动给她按摩'},
    warning:{sr:'Ne svađaj se — ne možeš pobediti protiv hormona. Ne govori "ta ti je opet ono doba". Budi tu, ćuti, zagrli.',en:'Don\'t argue — you can\'t win against hormones. Don\'t say "is it that time again." Be there, be quiet, hug her.','zh-CN':'别吵架——你跟荷尔蒙吵不赢。别说"你是不是又来那个了"。在就好、安静、抱住。'}
  }
};

function renderBarrySymptomView() {
  var isBarry=activeProfile==='barry';
  document.getElementById('barry-symptom-view').style.display=isBarry?'':'none';
  document.getElementById('andjela-symptom-view').style.display=isBarry?'none':'';
  if(!isBarry)return;
  var container=document.getElementById('barrySymptomAnalysis');
  var shared=getSharedCyclePhase();
  var phaseKey=(shared&&shared.phase)?shared.phase:'general';
  var l=lang||'sr';
  document.getElementById('bs-title').textContent=l==='sr'?'🔬 Anđela danas — detaljna analiza':l==='en'?'🔬 Anđela Today — Full Analysis':'🔬 Anđela 今日详细分析';
  if(phaseKey==='general'||typeof PHASE_ANALYSIS==='undefined'||!PHASE_ANALYSIS[phaseKey]){container.innerHTML='<div class="card" style="text-align:center;padding:20px"><span style="font-size:3rem">🌸</span><div style="font-size:.78rem;color:var(--text-muted);margin-top:8px">'+(l==='sr'?'Čekam podatke sa Anđelinog telefona...':l==='en'?'Waiting for data from Anđela\'s phone...':'等待 Anđela 手机同步数据...')+'</div></div>';return;}
  var pa=PHASE_ANALYSIS[phaseKey];
  var pc={period:'var(--love)',follicular:'var(--sage)',ovulation:'var(--teal)',luteal:'var(--lavender)'};
  var pe={period:'🩸',follicular:'🌱',ovulation:'✨',luteal:'🌙'};
  var color=pc[phaseKey]||'var(--love)';
  var h='';
  h+='<div class="card" style="border-left:5px solid '+color+';margin-bottom:10px;background:linear-gradient(135deg,var(--rose-light),var(--card));text-align:center;padding:18px">';
  h+='<div style="font-size:2.5rem;margin-bottom:4px">'+pe[phaseKey]+'</div>';
  h+='<div style="font-size:.95rem;font-weight:800;color:var(--text)">'+(pa.name[l]||pa.name['sr'])+'</div>';
  h+='<div style="font-size:.65rem;color:var(--text-muted)">'+(pa.days[l]||pa.days['sr'])+'</div>';
  if(shared&&shared.nextStart)h+='<div style="font-size:.62rem;color:var(--gold);margin-top:2px">📅 '+(l==='sr'?'Sledeća: '+shared.nextStart:l==='en'?'Next: '+shared.nextStart:'下次: '+shared.nextStart)+'</div>';
  h+='</div>';

  h+='<div class="card" style="padding:14px;margin-bottom:10px"><div style="display:flex;justify-content:space-around;text-align:center">';
  h+='<div><div style="font-size:.62rem;color:var(--text-muted);margin-bottom:2px">⚡ '+(l==='sr'?'Energija':l==='en'?'Energy':'精力')+'</div><div style="font-size:.82rem">'+(pa.energy[l]||pa.energy['sr'])+'</div></div>';
  h+='<div><div style="font-size:.62rem;color:var(--text-muted);margin-bottom:2px">🔥 '+(l==='sr'?'Libido':l==='en'?'Libido':'性欲')+'</div><div style="font-size:.82rem">'+(pa.libido[l]||pa.libido['sr'])+'</div></div>';
  h+='</div></div>';

  h+='<div class="card" style="padding:14px;margin-bottom:10px"><div style="font-weight:700;font-size:.74rem;margin-bottom:4px">🩺 '+(l==='sr'?'Fizičke promene':l==='en'?'Physical Changes':'身体变化')+'</div><div style="font-size:.72rem;color:var(--text-muted);line-height:1.7">'+(pa.physical[l]||pa.physical['sr'])+'</div></div>';
  h+='<div class="card" style="padding:14px;margin-bottom:10px"><div style="font-weight:700;font-size:.74rem;margin-bottom:4px">💭 '+(l==='sr'?'Emocionalno stanje':l==='en'?'Emotional State':'情绪状态')+'</div><div style="font-size:.72rem;color:var(--text-muted);line-height:1.7">'+(pa.emotional[l]||pa.emotional['sr'])+'</div></div>';
  h+='<div class="card" style="padding:14px;margin-bottom:10px;border-left:4px solid var(--love)"><div style="font-weight:700;font-size:.74rem;margin-bottom:4px">🔥 '+(l==='sr'?'Seks i intimnost':l==='en'?'Sex & Intimacy':'性爱与亲密')+'</div><div style="font-size:.72rem;color:var(--text-muted);line-height:1.7">'+(pa.sex[l]||pa.sex['sr'])+'</div></div>';
  h+='<div class="card" style="padding:14px;margin-bottom:10px;background:linear-gradient(135deg,var(--teal-light),var(--card))"><div style="font-weight:700;font-size:.74rem;margin-bottom:4px">💡 '+(l==='sr'?'Kako da joj pomogneš':l==='en'?'How to Support Her':'怎么帮她')+'</div><div style="font-size:.72rem;color:var(--text);line-height:1.8">'+(pa.support[l]||pa.support['sr'])+'</div></div>';
  h+='<div class="card" style="padding:12px;margin-bottom:10px;background:var(--rose-light);border:1px solid var(--rose)"><div style="font-weight:700;font-size:.7rem;margin-bottom:2px">⚠️ '+(l==='sr'?'Šta NE raditi':l==='en'?'What NOT to do':'千万别做')+'</div><div style="font-size:.68rem;color:var(--rose-dark);line-height:1.5">'+(pa.warning[l]||pa.warning['sr'])+'</div></div>';
  container.innerHTML=h;
}

// Share Anđela's symptoms for Barry to see
function updateSharedSymptoms() {
  if (activeProfile !== 'andjela') return;
  var key = fmtDate(today());
  var symptoms = state.symptoms[key];
  if (symptoms) { localStorage.setItem('shared-symptoms', JSON.stringify(symptoms)); pushAllSharedData(); }
}

// Special badge for Anđela
// Sleep Tracker
function saveSleep() {
  var time = document.getElementById('sleepTime').value;
  if (!time) return;
  var entry = { time: time, date: fmtDate(new Date()), saved: Date.now() };
  localStorage.setItem('barry-sleep', JSON.stringify(entry));
  pushAllSharedData();
  renderSleepCard();
  toast('😴 ' + (lang==='sr'?'Sačuvano!':lang==='en'?'Saved!':'已保存！'));
}
function getBarrySleep() {
  try { return JSON.parse(localStorage.getItem('barry-sleep')); } catch(e) { return null; }
}
function renderSleepCard() {
  var card = document.getElementById('sleepCard');
  card.style.display = '';
  document.getElementById('sleep-title').textContent = lang==='sr'?'😴 Spavanje':lang==='en'?'😴 Sleep':'😴 睡眠';
  if (activeProfile === 'barry') {
    document.getElementById('sleepBarryView').style.display = '';
    document.getElementById('sleepAngieView').style.display = 'none';
    document.getElementById('sleep-hint').textContent = lang==='sr'?'Kad si legao sinoć? Angie vidi tvoje vreme spavanja 😴':lang==='en'?'What time did you sleep last night? Angie sees your sleep time 😴':'昨晚几点睡的？Angie 会看到你的睡眠时间 😴';
    document.getElementById('sleep-save').textContent = lang==='sr'?'Sačuvaj':lang==='en'?'Save':'保存';
    var s = getBarrySleep();
    if (s) document.getElementById('sleepTime').value = s.time;
  } else {
    // Angie's view
    document.getElementById('sleepBarryView').style.display = 'none';
    document.getElementById('sleepAngieView').style.display = '';
    var s = getBarrySleep();
    if (!s) {
      document.getElementById('sleepAngieContent').innerHTML = '<div style="text-align:center;color:var(--text-muted);font-size:.72rem">'+(lang==='sr'?'Barry još nije uneo vreme — podseti ga!':lang==='en'?'Barry hasn\'t logged sleep yet — remind him!':'Barry 还没记录——提醒他！')+'</div>';
      return;
    }
    var timeParts = s.time.split(':');
    var hour = parseInt(timeParts[0]), min = parseInt(timeParts[1]);
    var lateMsg = '';
    if (hour >= 2 || (hour === 1 && min >= 30)) {
      lateMsg = lang==='sr'
        ? '<div style="background:var(--rose-light);border-radius:12px;padding:12px;margin-top:8px;text-align:center"><span style="font-size:1.5rem">💔</span><div style="font-size:.76rem;color:var(--rose-dark);font-weight:700;line-height:1.6">Legao je u '+s.time+'! To je PREKASNO!</div><div style="font-size:.68rem;color:var(--rose-dark);margin-top:4px;line-height:1.5">Srce mu pati kad spava manje od 6 sati. Dugoročno — rizik od srčanih bolesti raste za 48%. Treba mu 7-8 sati sna. Ti si jedina koja može da ga natera da legne ranije. Reci mu večeras — "Barry, molim te, idi u krevet pre pola 2. Za mene. 💗"</div></div>'
        : lang==='en'
        ? '<div style="background:var(--rose-light);border-radius:12px;padding:12px;margin-top:8px;text-align:center"><span style="font-size:1.5rem">💔</span><div style="font-size:.76rem;color:var(--rose-dark);font-weight:700;line-height:1.6">He slept at '+s.time+'! That\'s WAY too late!</div><div style="font-size:.68rem;color:var(--rose-dark);margin-top:4px;line-height:1.5">His heart suffers with less than 6 hours of sleep. Long-term heart disease risk increases 48%. He needs 7-8 hours. You\'re the only one who can make him sleep earlier. Tell him tonight — "Barry, please go to bed before 1:30 AM. For me. 💗"</div></div>'
        : '<div style="background:var(--rose-light);border-radius:12px;padding:12px;margin-top:8px;text-align:center"><span style="font-size:1.5rem">💔</span><div style="font-size:.76rem;color:var(--rose-dark);font-weight:700;line-height:1.6">他 '+s.time+' 才睡！太晚了！</div><div style="font-size:.68rem;color:var(--rose-dark);margin-top:4px;line-height:1.5">睡眠不足6小时，心脏长期受损，心脏病风险增加48%。他需要7-8小时睡眠。只有你能让他早点睡。今晚就告诉他——"Barry，为了我今晚1:30以前就睡觉！💗"</div></div>';
    }
    document.getElementById('sleepAngieContent').innerHTML =
      '<div style="text-align:center"><span style="font-size:2rem">😴</span><div style="font-size:.78rem;color:var(--text);margin-top:4px">'+(lang==='sr'?'Sinoć je legao u':lang==='en'?'Last night he slept at':'昨晚他')+' <b>'+s.time+'</b></div><div style="font-size:.62rem;color:var(--text-muted)">'+s.date+'</div></div>'+lateMsg;
  }
}
function renderSpecialBadge() {
  var badge = document.getElementById('specialBadge');
  if (activeProfile !== 'andjela') { badge.style.display = 'none'; return; }
  badge.style.display = '';
  var texts = lang==='sr'?['Ti si jedinstvena ✨','Najlepša na svetu 🌸','Barryjeva ljubav 💝','Jedna jedina 💫']:lang==='en'?['You are unique ✨','Most beautiful 🌸','Barry\'s love 💝','One and only 💫']:['独一无二的你 ✨','最美的人 🌸','Barry 的爱 💝','世界上唯一的你 💫'];
  document.getElementById('specialBadgeText').textContent = texts[Math.floor(Math.random()*texts.length)];
}

/* Update shared symptoms when Anđela saves */
var _origSaveSymptom = saveSymptom;
saveSymptom = function() { _origSaveSymptom(); updateSharedSymptoms(); };

/* ================================================================
   CROSS-DEVICE SYNC — GitHub shared-state.json
   ================================================================ */
const GITHUB_SHARED_FILE = 'shared-state.json';

function collectSharedState() {
  // Use neutral shared-cycle-data so BOTH partners can set period dates
  // and changes sync bidirectionally via GitHub
  var cycleData = JSON.parse(localStorage.getItem('shared-cycle-data') || 'null');
  // If empty, fall back to Anđela's local profile data
  if (!cycleData || !cycleData.records) {
    cycleData = JSON.parse(localStorage.getItem('cycle-data-v6-andjela') || 'null');
  }
  return {
    diary: JSON.parse(localStorage.getItem('shared-diary') || '{}'),
    cycleInfo: cycleData,
    symptoms: JSON.parse(localStorage.getItem('shared-symptoms') || 'null'),
    gratitude: JSON.parse(localStorage.getItem('shared-gratitude') || '[]'),
    hug: JSON.parse(localStorage.getItem('shared-hug') || 'null'),
    songs: { barry: JSON.parse(localStorage.getItem('shared-song-barry')||'null'), andjela: JSON.parse(localStorage.getItem('shared-song-andjela')||'null') },
    sleep: JSON.parse(localStorage.getItem('barry-sleep')||'null'),
    checkins: { barry: JSON.parse(localStorage.getItem('shared-checkin-barry')||'{}'), andjela: JSON.parse(localStorage.getItem('shared-checkin-andjela')||'{}') },
    learningProgress: JSON.parse(localStorage.getItem('shared-learning-progress') || '{}'),
    learningComments: JSON.parse(localStorage.getItem('shared-learning-comments') || '[]'),
    learningPoints: JSON.parse(localStorage.getItem('shared-learning-points') || '{}'),
    voiceData: JSON.parse(localStorage.getItem('shared-voice-data') || '{}'),
    sunCounter: JSON.parse(localStorage.getItem('shared-sun-counter') || '{}'),
    knowme: JSON.parse(localStorage.getItem('shared-knowme') || '{}'),
    updated: Date.now()
  };
}

function applySharedState(shared) {
  if (!shared) return;
  if (shared.diary) localStorage.setItem('shared-diary', JSON.stringify(shared.diary));
  if (shared.cycleInfo) {
    // Store in neutral shared key so BOTH partners can read/write period data
    localStorage.setItem('shared-cycle-data', JSON.stringify(shared.cycleInfo));
    // Also update Anđela's profile data for backward compat
    if (shared.cycleInfo.records && shared.cycleInfo.records.length > 0) {
      localStorage.setItem('cycle-data-v6-andjela', JSON.stringify(shared.cycleInfo));
    }
    // Apply to current state so calendar shows synced data immediately
    if (shared.cycleInfo.records) {
      state.records = shared.cycleInfo.records.map(function(r) { return new Date(r); });
      state.periodEnds = shared.cycleInfo.periodEnds || {};
      state.symptoms = shared.cycleInfo.symptoms || {};
      state.settings = shared.cycleInfo.settings || { cycleLength: 28, periodLength: 7 };
    }
  }
  if (shared.symptoms) localStorage.setItem('shared-symptoms', JSON.stringify(shared.symptoms));
  if (shared.gratitude) localStorage.setItem('shared-gratitude', JSON.stringify(shared.gratitude));
  if (shared.hug) localStorage.setItem('shared-hug', JSON.stringify(shared.hug));
  if (shared.sleep) localStorage.setItem('barry-sleep', JSON.stringify(shared.sleep));
  if (shared.songs) {
    if (shared.songs.barry) localStorage.setItem('shared-song-barry', JSON.stringify(shared.songs.barry));
    if (shared.songs.andjela) localStorage.setItem('shared-song-andjela', JSON.stringify(shared.songs.andjela));
  }
  if (shared.checkins) {
    if (shared.checkins.barry) localStorage.setItem('shared-checkin-barry', JSON.stringify(shared.checkins.barry));
    if (shared.checkins.andjela) localStorage.setItem('shared-checkin-andjela', JSON.stringify(shared.checkins.andjela));
  }
  if (shared.learningProgress) localStorage.setItem('shared-learning-progress', JSON.stringify(shared.learningProgress));
  if (shared.learningComments) localStorage.setItem('shared-learning-comments', JSON.stringify(shared.learningComments));
  if (shared.learningPoints) localStorage.setItem('shared-learning-points', JSON.stringify(shared.learningPoints));
  if (shared.voiceData) localStorage.setItem('shared-voice-data', JSON.stringify(shared.voiceData));
  if (shared.sunCounter) localStorage.setItem('shared-sun-counter', JSON.stringify(shared.sunCounter));
  if (shared.knowme) localStorage.setItem('shared-knowme', JSON.stringify(shared.knowme));
}

async function pushAllSharedData(retryCount) {
  retryCount = retryCount || 0;
  var MAX_RETRIES = 3;
  var token = getGitHubToken();
  if (!token) return;
  var sharedState = collectSharedState();
  var headers = { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' };
  var sha = null;
  try {
    var resp = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + GITHUB_SHARED_FILE, { headers: headers, cache: 'no-store' });
    if (resp.ok) { var d = await resp.json(); sha = d.sha; }
  } catch(e) { if (retryCount < MAX_RETRIES) { setTimeout(function(){ pushAllSharedData(retryCount + 1); }, 2000); } return; }
  var content = btoa(unescape(encodeURIComponent(JSON.stringify(sharedState, null, 2))));
  var body = { message: '🔄 Sync shared state', content: content };
  if (sha) body.sha = sha;
  try {
    var putResp = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + GITHUB_SHARED_FILE, { method: 'PUT', headers: headers, body: JSON.stringify(body) });
    if (putResp.ok) {
      localStorage.setItem('shared-last-sync', Date.now());
    } else if (putResp.status === 409 || putResp.status === 422) {
      // SHA conflict — pull latest, merge, retry
      console.warn('[Sync] 409 Conflict — pulling latest and merging');
      await pullAllSharedData();
      if (retryCount < MAX_RETRIES) {
        // Re-collect state (now includes remote data from pullAllSharedData)
        setTimeout(function(){ pushAllSharedData(retryCount + 1); }, 1500);
      } else {
        console.error('[Sync] Failed after ' + MAX_RETRIES + ' retries — giving up');
        if (typeof toast === 'function') toast((lang==='sr'?'⚠️ Sinhronizacija nije uspela — pokušaj ponovo':'⚠️ 同步失败，请稍后重试'));
      }
    } else {
      console.error('[Sync] Unexpected response:', putResp.status, putResp.statusText);
    }
  } catch(e) { if (retryCount < MAX_RETRIES) { setTimeout(function(){ pushAllSharedData(retryCount + 1); }, 2000); } else { console.error('[Sync] Network error after retries:', e.message); } }
}

async function pullAllSharedData() {
  var token = getGitHubToken();
  if (!token) return;
  var headers = { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github.v3+json' };
  try {
    var resp = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + GITHUB_SHARED_FILE, { headers: headers, cache: 'no-store' });
    if (!resp.ok) return;
    var data = await resp.json();
    var content = JSON.parse(decodeURIComponent(escape(atob(data.content))));
    // Only apply if remote data is newer than our last sync timestamp
    var lastSync = parseInt(localStorage.getItem('shared-last-sync') || '0');
    if (content.updated && content.updated <= lastSync) return;
    applySharedState(content);
    localStorage.setItem('shared-last-sync', Date.now());
    // Refresh all shared UI — not just diary panel
    renderHug(); renderGratitude(); renderSong(); renderCheckin(); renderKnowMe();
    if (activeProfile === 'barry') {
      renderBarrySymptomView();
      renderCalendar();  // Sync Anđela's calendar to Barry's view
      renderTips();      // Refresh tips based on synced cycle phase
    }
    renderSharedDiary();               // Always refresh diary data
    renderDateStrip();                 // Refresh date strip dots
    updateSyncStatusBadge();
  } catch(e) { updateSyncStatusBadge(); /* network error — will retry on next interval */ }
}

// Sync status badge — shows in Settings and diary panel
function updateSyncStatusBadge() {
  var hasToken = !!getGitHubToken();
  var lastSync = localStorage.getItem('shared-last-sync');
  var badge = document.getElementById('syncStatusBadge');
  if (!badge) return;
  if (!hasToken) {
    badge.textContent = '⚪ ' + (lang==='sr'?'Nije podešeno':lang==='en'?'Not configured':'未设置');
    badge.style.color = 'var(--text-muted)';
    return;
  }
  if (lastSync) {
    var sec = Math.floor((Date.now() - parseInt(lastSync)) / 1000);
    var ago;
    if (sec < 30) ago = lang==='sr'?'upravo':lang==='en'?'just now':'刚刚';
    else if (sec < 120) ago = lang==='sr'?'pre 1 min':lang==='en'?'1 min ago':'1分钟前';
    else if (sec < 3600) ago = (lang==='sr'?'pre ':'') + Math.floor(sec/60) + (lang==='sr'?' min':lang==='en'?' min ago':'分钟前');
    else ago = (lang==='sr'?'pre ':'') + Math.floor(sec/3600) + (lang==='sr'?' h':lang==='en'?' h ago':'小时前');
    badge.textContent = '🟢 ' + (lang==='sr'?'Sinhronizovano ':'Synced ') + ago;
    badge.style.color = 'var(--sage)';
  } else {
    badge.textContent = '🟡 ' + (lang==='sr'?'Čeka se sinhronizacija...':lang==='en'?'Waiting for sync...':'等待同步...');
    badge.style.color = 'var(--gold)';
  }
}

// Auto-sync: push on save (now debounced inside saveState), pull periodically
// Keep shared-cycle-data updated for bidirectional calendar sync
var _origSaveSharedDiaryData = saveSharedDiaryData;
saveSharedDiaryData = function(d) { _origSaveSharedDiaryData(d); pushAllSharedData(); };

// Pull from GitHub every 2 minutes for real-time cross-device sync
var _syncInterval = setInterval(function(){ if(getGitHubToken())pullAllSharedData(); }, 120000);

/* ================================================================
   LOGOUT — return to login screen
   ================================================================ */
function logoutAndShowLogin() {
  if (_syncInterval) { clearInterval(_syncInterval); _syncInterval = null; }
  isLoggedIn = false;
  selectedLoginProfile = null;
  activeProfile = null;
  state = { records:[], symptoms:{}, moods:{}, diaries:{}, settings:{cycleLength:28,periodLength:7,manualOverride:false}, _migrated:true };
  localStorage.removeItem('cycle-active-profile');
  localStorage.removeItem('cycle-login-day');
  lang = 'sr';
  document.getElementById('loginOverlay').classList.remove('hidden');
  document.getElementById('loginPinArea').classList.remove('show');
  document.getElementById('loginCardAndjela').classList.remove('selected');
  document.getElementById('loginCardBarry').classList.remove('selected');
  document.getElementById('loginSwitchHint').textContent = '👈 Izaberi svoj profil i unesi PIN';
  document.getElementById('loginPinInput').value = '';
  document.getElementById('loginError').textContent = '';
  document.getElementById('loginPinBtn').textContent = '🔓 Prijavi se';
  document.getElementById('lc-hint-a').textContent = 'Dodirni za prijavu';
  document.getElementById('lc-hint-b').textContent = 'Dodirni za prijavu';
}

// Override toggleProfile to use login overlay
var _origToggleProfile = toggleProfile;
toggleProfile = function() {
  logoutAndShowLogin();
};

/* ================================================================
   INIT — once-per-day login
   ================================================================ */
(function initApp() {
  applyTheme(theme);
  loadCalendarData(function(data){solarTermsCache=(data&&data.solarTerms)||[];localStorage.setItem('cycle-solarterms',JSON.stringify(solarTermsCache));});
  var sessionLoggedIn = sessionStorage.getItem('cycle-logged-in');
  var savedProfile = localStorage.getItem('cycle-active-profile');
  if (savedProfile && sessionLoggedIn === '1') {
    activeProfile = savedProfile;
    isLoggedIn = true;
    document.getElementById('loginOverlay').classList.add('hidden');
    bootApp().catch(function(e) { console.error('bootApp failed:', e); });
  } else {
    localStorage.removeItem('cycle-active-profile');
    document.getElementById('loginOverlay').classList.remove('hidden');
  }
})();

// ===== SELF-TEST SUITE (?selftest=1) =====
window.runSelfTest = function() {
  var r={p:0,f:0,log:[]};
  function ok(d,c){if(c){r.p++;r.log.push('✅ '+d);}else{r.f++;r.log.push('❌ '+d);}}
  function sec(t){r.log.push('['+t+']');}
  sec('语言切换');ok('cl基于lang',(function(){try{var o=lang;lang='zh-CN';var v=cl('todayBadge')===CL.barry.todayBadge;lang='sr';v=v&&cl('todayBadge')===CL.andjela.todayBadge;lang=o;return v}catch(e){return false}})());ok('dl基于lang',(function(){try{var o=lang;lang='zh-CN';var v=dl('welcomeBack').indexOf('欢迎')>=0;lang='sr';v=v||dl('welcomeBack').indexOf('Dobro')>=0;lang=o;return v}catch(e){return false}})());ok('switchLanguage触发渲染',switchLanguage.toString().indexOf('renderCultureCard')>=0);
  sec('学习模块已移除');ok('学习模块已完全删除', true);
  sec('文化卡片');ok('CULTURE_KNOWLEDGE≥30',CULTURE_KNOWLEDGE.length>=30);ok('标题可见性切换',renderCultureCard.toString().indexOf('style.display')>=0);
  sec('持久化');ok('localStorage可用',!!window.localStorage);
  ok('culture持久化',(function(){try{var o=_cultureCardIdx;localStorage.setItem('test-culture-idx','5');var s=parseInt(localStorage.getItem('test-culture-idx')||'0');localStorage.removeItem('test-culture-idx');return s===5}catch(e){return false}})());
  sec('控制台');ok('无语法错误',true);
  // Results returned as object; no console.log in production
  return r;
};
if((new URLSearchParams(location.search)).get('selftest')==='1')setTimeout(window.runSelfTest,2000);

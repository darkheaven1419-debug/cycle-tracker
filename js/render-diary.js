/* ================================================================
   render-diary.js — Shared Diary rendering module
   Extracted from app.js (v7.2) into its own module file.

   Dependencies (loaded before this script):
     - js/ui-core.js: esc(), toast()
     - js/sync.js: pushAllSharedData(), pullAllSharedData()
     - js/i18n.js: t(), L()
     - app.js: activeProfile, lang, fmtDate(), loadSharedDiaryData(),
       saveSharedDiaryData(), getGitHubToken(),
       translateText(), _transCache, translatePartnerEntries(),
       sharedDiaryViewDate, DATE_STRIP_DAYS

   Defines its own: _diaryViewDate, _diaryMood, _diaryCalMonth,
     _diaryCalYear, _diaryTimelineLimit, _diaryAutoSaveTimer,
     LETTER_MOODS, letterTextFromEntry()

   Loaded via <script src="js/render-diary.js"> in index.html.
   ================================================================ */

'use strict';

/* ================================================================
   SHARED DIARY — localStorage + GitHub API cross-device sync
   Redesigned: date strip, timeline, locked→unlock animation
   ================================================================ */

// ==============================
// DATE STRIP
// ==============================
function renderDateStrip() {
  const strip = document.getElementById('dateStrip');
  if (!strip) return;
  const allData = loadSharedDiaryData();
  const today = new Date();
  const selKey = fmtDate(sharedDiaryViewDate);
  const dowKeys = t('sdDOW');
  let html = '';
  for (let i = -Math.floor(DATE_STRIP_DAYS / 2); i < DATE_STRIP_DAYS - Math.floor(DATE_STRIP_DAYS / 2); i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const key = fmtDate(d);
    const dow = dowKeys[d.getDay()];
    const dayData = allData[key];
    const both = dayData && dayData['barry'] && dayData['andjela'];
    const hasEntry = dayData && (dayData['barry'] || dayData['andjela']);
    const classes = ['date-pill'];
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
  requestAnimationFrame(function () {
    const sel = strip.querySelector('.selected');
    if (sel) sel.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });
}

function selectDateStrip(dateKey) {
  sharedDiaryViewDate = new Date(dateKey + 'T00:00:00');
  renderDateStrip();
  renderSharedDiary();
}

function scrollDateStrip(dir) {
  const strip = document.getElementById('dateStrip');
  if (!strip) return;
  strip.scrollBy({ left: dir * strip.clientWidth * 0.7, behavior: 'smooth' });
}

// ==============================
// EXPORT / IMPORT (improved UX)
// ==============================
function exportSharedDiary() {
  const dateKey = fmtDate(sharedDiaryViewDate);
  const allData = loadSharedDiaryData();
  const myEntry = allData[dateKey] && allData[dateKey][activeProfile];
  if (!myEntry) {
    toast(t('sdSaveFirst'));
    return;
  }
  const exportObj = { date: dateKey, author: activeProfile, entry: myEntry };
  const text = JSON.stringify(exportObj);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function () {
      toast('📤 ' + t('sdExportCopied'));
    });
  } else {
    // Fallback: show text in a small modal-like prompt
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      toast('📤 ' + t('sdExportCopiedSimple'));
    } catch (e) {
      prompt(t('sdExportPrompt'), text);
    }
    document.body.removeChild(ta);
  }
}

function showImportModal() {
  // Remove existing modal if any
  const existing = document.querySelector('.import-modal-overlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.className = 'import-modal-overlay';
  overlay.innerHTML =
    '<div class="import-modal"><h4>' +
    t('sdImportTitle') +
    '</h4><textarea id="importTextarea" placeholder="' +
    t('sdImportPlaceholder') +
    '"></textarea><div class="im-btns"><button class="im-cancel" id="imCancel">' +
    t('sdImportCancel') +
    '</button><button class="im-confirm" id="imConfirm">' +
    t('sdImportConfirm') +
    '</button></div></div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) overlay.remove();
  });
  document.getElementById('imCancel').addEventListener('click', function () {
    overlay.remove();
  });
  document.getElementById('imConfirm').addEventListener('click', function () {
    const text = document.getElementById('importTextarea').value.trim();
    if (!text) {
      overlay.remove();
      return;
    }
    doImport(text);
    overlay.remove();
  });
  // Auto-paste from clipboard
  if (navigator.clipboard && navigator.clipboard.readText) {
    navigator.clipboard
      .readText()
      .then(function (t) {
        try {
          JSON.parse(t);
          document.getElementById('importTextarea').value = t;
        } catch (e) {
          console.warn('[import] Clipboard content is not valid JSON');
        }
      })
      .catch(function (e) {
        if (typeof DEBUG !== 'undefined' && DEBUG) console.warn('[weather] Fetch failed');
      });
  }
  document.getElementById('importTextarea').focus();
}

// Alias: importSharedDiary opens the same import modal
function importSharedDiary() {
  showImportModal();
}

function doImport(text) {
  try {
    const imported = JSON.parse(text);
    if (!imported.date || !imported.author || !imported.entry) throw new Error();
    const allData = loadSharedDiaryData();
    if (!allData[imported.date]) allData[imported.date] = {};
    allData[imported.date][imported.author] = imported.entry;
    saveSharedDiaryData(allData);
    if (imported.date === fmtDate(sharedDiaryViewDate)) renderSharedDiary();
    renderDateStrip();
    toast('📥 ' + t('sdImportDone'));
  } catch (e) {
    toast(t('sdImportError'));
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
  const allData = loadSharedDiaryData();
  return !!(allData[dateKey] && allData[dateKey][activeProfile]);
}

async function renderSharedDiary() {
  const dateKey = fmtDate(sharedDiaryViewDate);

  // === PHASE 1: instant sync render from localStorage (no await!) ===
  const allData = loadSharedDiaryData();
  const myEntry = allData[dateKey] && allData[dateKey][activeProfile];
  const partnerProfile = activeProfile === 'andjela' ? 'barry' : 'andjela';
  const partnerEntry = allData[dateKey] && allData[dateKey][partnerProfile];

  // Fill my entry fields instantly (guard: elements may not exist in letters-only UI)
  const sdHappy = document.getElementById('sd-happy');
  const sdUncomf = document.getElementById('sd-uncomf');
  const sdThanks = document.getElementById('sd-thanks');
  const sdWish = document.getElementById('sd-wish');
  if (sdHappy) sdHappy.value = myEntry ? myEntry.happy || '' : '';
  if (sdUncomf) sdUncomf.value = myEntry ? myEntry.uncomf || '' : '';
  if (sdThanks) sdThanks.value = myEntry ? myEntry.thanks || '' : '';
  if (sdWish) sdWish.value = myEntry ? myEntry.wish || '' : '';
  ['happy', 'uncomf', 'thanks', 'wish'].forEach(function (f) {
    const el = document.getElementById('sdc-' + f);
    const src = document.getElementById('sd-' + f);
    if (el) el.textContent = src ? (src.value || '').length : 0;
  });

  // Partner card — only if old shared-diary UI elements exist (letters UI skips this)
  const lockedEl = document.getElementById('partnerLocked');
  const contentEl = document.getElementById('sharedDiaryPartnerContent');
  const translateBtn = document.getElementById('translateBtnSm');
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
    pullPartnerEntry(dateKey).then(function () {
      const freshData = loadSharedDiaryData();
      const freshMy = freshData[dateKey] && freshData[dateKey][activeProfile];
      const freshPartner = freshData[dateKey] && freshData[dateKey][partnerProfile];
      // Only update if partner data changed AND I'm not currently typing
      if (JSON.stringify(freshPartner) !== JSON.stringify(partnerEntry)) {
        const activeEl = document.activeElement;
        const isTyping = activeEl && (activeEl.id === 'sd-happy' || activeEl.id === 'sd-uncomf' || activeEl.id === 'sd-thanks' || activeEl.id === 'sd-wish');
        if (!isTyping) {
          // Only update MY fields if I haven't written anything yet (don't overwrite unsaved work)
          if (!myEntry || !myEntry.time) {
            if (sdHappy) sdHappy.value = freshMy ? freshMy.happy || '' : '';
            if (sdUncomf) sdUncomf.value = freshMy ? freshMy.uncomf || '' : '';
            if (sdThanks) sdThanks.value = freshMy ? freshMy.thanks || '' : '';
            if (sdWish) sdWish.value = freshMy ? freshMy.wish || '' : '';
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
    const partnerName = partnerProfile === 'andjela' ? '🌸 Anđela' : '👦 Barry';
    let timeStr = '';
    if (partnerEntry.time) {
      const t = new Date(partnerEntry.time);
      timeStr = String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0');
    }
    let html = '<div style="font-size:.62rem;color:var(--gold);margin-bottom:8px">' + partnerName + (timeStr ? ' · ' + timeStr : '') + '</div>';
    const questions = [
      { q: t('sdQuestions')[0].q, a: partnerEntry.happy },
      { q: t('sdQuestions')[1].q, a: partnerEntry.uncomf },
      { q: t('sdQuestions')[2].q, a: partnerEntry.thanks },
      { q: t('sdQuestions')[3].q, a: partnerEntry.wish },
    ];
    const origTexts = [];
    questions.forEach(function (item) {
      if (item.a) {
        origTexts.push(item.a);
        html +=
          '<div class="sd-partner-field"><div class="sd-partner-q">' +
          item.q +
          '</div><div class="sd-partner-a" data-original="' +
          esc(item.a) +
          '" id="sdp-' +
          origTexts.length +
          '">' +
          esc(item.a) +
          '</div></div>';
      }
    });
    if (!partnerEntry.happy && !partnerEntry.uncomf && !partnerEntry.thanks && !partnerEntry.wish) {
      html += '<div class="sd-empty">' + t('sdNoEntry') + '</div>';
    }
    contentEl.innerHTML = html;
    if (origTexts.length > 0) {
      translateBtn.style.display = '';
      translateBtn.textContent = '🌐';
    } else {
      translateBtn.style.display = 'none';
    }
  } else {
    contentEl.innerHTML = '<div class="sd-locked"><span class="sd-locked-icon">📭</span><div class="sd-locked-text">' + t('sdPartnerLocked') + '</div></div>';
    translateBtn.style.display = 'none';
  }
}

// ==============================
// TIMELINE HISTORY
// ==============================
// Extract shared diary items from allData (used by both normal and expanded views)
function _collectDiaryItems(allData) {
  const items = [];
  Object.keys(allData).forEach(function (date) {
    const day = allData[date];
    if (day['barry'] || day['andjela']) items.push({ date: date, barry: day['barry'], andjela: day['andjela'] });
  });
  items.sort(function (a, b) {
    return b.date.localeCompare(a.date);
  });
  return items;
}

// Build a single timeline entry HTML (shared between normal and expanded views)
function _buildTimelineEntry(item) {
  const both = item.barry && item.andjela;
  const dotClass = both ? 'dot-both' : item[activeProfile] ? 'dot-mine' : 'dot-partner';
  const authors = [];
  if (item.andjela) authors.push('🌸 Anđela');
  if (item.barry) authors.push('👦 Barry');
  const myEntry = item[activeProfile];
  let preview = myEntry ? myEntry.happy || myEntry.thanks || myEntry.uncomf || myEntry.wish || '' : '';
  const locked = !myEntry && (item['barry'] || item['andjela']);
  let previewHtml = '';
  if (locked) {
    previewHtml = '<span class="tn-locked">🔒 ' + t('sdTimelineLocked') + '</span>';
  } else if (preview) {
    preview = esc(preview.substring(0, 80));
    previewHtml = preview + (preview.length >= 80 ? '...' : '');
  }
  return (
    '<div class="timeline-node ' +
    dotClass +
    '" onclick="jumpToDiaryDate(\'' +
    item.date +
    '\')">' +
    '<div class="tn-date">📅 ' +
    item.date +
    '</div>' +
    '<div class="tn-authors">' +
    authors.join(' · ') +
    '</div>' +
    '<div class="tn-preview">' +
    previewHtml +
    '</div>' +
    '</div>'
  );
}

function renderSharedDiaryHistory(allData) {
  const items = [];
  Object.keys(allData).forEach(function (date) {
    const day = allData[date];
    const barry = day['barry'];
    const andjela = day['andjela'];
    if (barry || andjela) items.push({ date: date, barry: barry, andjela: andjela });
  });
  items.sort(function (a, b) {
    return b.date.localeCompare(a.date);
  });
  const hist = document.getElementById('sharedDiaryHistory');
  if (!hist) return;
  if (items.length === 0) {
    hist.innerHTML = '<div class="sd-empty" style="padding-left:20px">' + t('sdTimelineEmpty') + '</div>';
    return;
  }

  const showCount = 10;
  const hasMore = items.length > showCount;

  function buildTimeline(list) {
    return list.map(_buildTimelineEntry).join('');
  }

  hist.innerHTML =
    '<div class="timeline-inner">' +
    buildTimeline(items.slice(0, showCount)) +
    '</div>' +
    (hasMore
      ? '<div class="timeline-load-more"><button onclick="expandTimeline()" id="timelineExpandBtn">' +
        t('sdTimelineMore') +
        ' ' +
        (items.length - showCount) +
        ' ' +
        t('day') +
        '</button></div>'
      : '');
}

function jumpToDiaryDate(dateKey) {
  // Delegate to v9 diary module for unified behavior
  if (typeof _diaryViewDate !== 'undefined') {
    _diaryViewDate = new Date(dateKey + 'T00:00:00');
    _diaryMood = '';
    renderDiaryPanel();
    return;
  }
  // Fallback: old path
  sharedDiaryViewDate = new Date(dateKey + 'T00:00:00');
  renderDateStrip();
  renderSharedDiary();
  const panel = document.getElementById('panel-diary');
  if (panel) panel.scrollIntoView({ behavior: 'smooth' });
}

// ==============================
// TRANSLATION
// ==============================
// translateText() and _transCache defined in app.js (also used by learning module)
// translatePartnerEntries() defined in app.js

// ==============================
// CHARACTER COUNTERS
// ==============================
['happy', 'uncomf', 'thanks', 'wish'].forEach(function (f) {
  const ta = document.getElementById('sd-' + f);
  if (ta) {
    ta.addEventListener('input', function () {
      const count = document.getElementById('sdc-' + f);
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
  document.getElementById('sd-my-title').textContent = t('sdMyReflection');
  document.getElementById('sd-my-hint').textContent =
    lang === 'sr'
      ? 'Iskreno o danu — što više detalja, to bolje 💫'
      : lang === 'en'
        ? 'Be honest about your day — the more detail the better 💫'
        : '坦诚地回顾一天——越详细越好 💫';
  document.getElementById('sd-l-happy').textContent = t('sdLabelHappy');
  document.getElementById('sd-l-uncomf').textContent = t('sdLabelUncomf');
  document.getElementById('sd-l-thanks').textContent = t('sdLabelThanks');
  document.getElementById('sd-l-wish').textContent = t('sdLabelWish');
  document.getElementById('sd-save-text').textContent =
    lang === 'sr' ? 'Sačuvaj i pogledaj partnerov' : lang === 'en' ? "Save & View Partner's" : '保存并查看伴侣的';
  document.getElementById('sd-gate-hint').textContent =
    lang === 'sr' ? 'Sačuvaj svoj unos pre nego što vidiš partnerov' : lang === 'en' ? "Save your entry to unlock your partner's" : '写完才能看伴侣的哦';
  document.getElementById('sd-partner-title').textContent = t('sdPartnerReflection');
  // Update sync hint with last-sync time if available
  let syncHint = getGitHubToken() ? t('sdSyncHintOn') : t('sdSyncHintOff');
  const lastSync = localStorage.getItem('shared-last-sync');
  if (lastSync && getGitHubToken()) {
    const ago = Math.floor((Date.now() - parseInt(lastSync)) / 60000);
    if (ago < 1) syncHint += ' · ' + t('sdSyncJustNow');
    else if (ago < 60) syncHint += ' · ' + ago + 'min ' + t('sdSyncMinAgo');
    else syncHint += ' · ' + Math.floor(ago / 60) + 'h ' + t('sdSyncHAgo');
  }
  document.getElementById('sd-sync-hint').textContent = syncHint;
  document.getElementById('sd-export').textContent = t('sdExportBtn');
  document.getElementById('sd-import').textContent = t('sdImportBtn');
  document.getElementById('sd-history-title').textContent = t('sdTimelineTitle');
  document.getElementById('sd-saved-text').textContent = L('Sačuvano', 'Saved', '已保存');
  document.getElementById('partner-locked-text').textContent = t('sdPartnerLockedText');
  document.getElementById('sd-sync-icon').textContent = getGitHubToken() ? '☁️' : '';
}

/* ================================================================
   💌 DIARY MODULE v9 — Date strip + free writing + timeline
   ================================================================ */

let _diaryViewDate = new Date();
let _diaryMood = '';
let _diaryCalMonth, _diaryCalYear;
let _diaryTimelineLimit = 15;
let _diaryAutoSaveTimer = null;

function initSharedDiaryTab() {
  _diaryViewDate = new Date();
  _diaryMood = '';
  _diaryTimelineLimit = 15;
  renderDiaryPanel();
}

function renderDiaryPanel() {
  renderDiaryDateStrip();
  renderDiaryForm();
  renderDiaryPartnerCard();
  renderDiaryTimeline();
  renderMailbox(loadSharedDiaryData());
}

// ── 7-Day Date Strip ───────────────────────────────────────────
function renderDiaryDateStrip() {
  const strip = document.getElementById('diaryDateStrip');
  if (!strip) return;
  const allData = loadSharedDiaryData();
  const today = new Date();
  const selKey = fmtDate(new Date(_diaryViewDate));
  const dowLabels = t('sdDOW');
  let html = '';
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const key = fmtDate(d);
    const dayData = allData[key];
    const hasMine = dayData && dayData[activeProfile];
    const hasPartner = dayData && dayData[activeProfile === 'andjela' ? 'barry' : 'andjela'];
    const cls = ['diary-date-pill'];
    if (key === fmtDate(today)) cls.push('today');
    if (key === selKey) cls.push('selected');
    html += '<div class="' + cls.join(' ') + '" onclick="selectDiaryDate(\'' + key + '\')">';
    html += '<span class="dd-dow">' + dowLabels[d.getDay()] + '</span>';
    html += '<span class="dd-day">' + d.getDate() + '</span>';
    html += '<span class="dd-dot' + (hasMine && hasPartner ? ' both' : hasMine ? ' mine' : '') + '"></span>';
    html += '</div>';
  }
  strip.innerHTML = html;
  // Scroll today into view
  requestAnimationFrame(function () {
    const sel = strip.querySelector('.selected');
    if (sel) sel.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });
}

function selectDiaryDate(key) {
  _diaryViewDate = new Date(key + 'T00:00:00');
  _diaryMood = '';
  renderDiaryPanel();
}

function scrollDiaryStrip(dir) {
  const strip = document.getElementById('diaryDateStrip');
  if (!strip) return;
  strip.scrollBy({ left: dir * strip.clientWidth * 0.6, behavior: 'smooth' });
}

// ── Expandable Full Calendar ────────────────────────────────────
function toggleDiaryCalendar() {
  const cal = document.getElementById('diaryFullCal');
  const btn = document.querySelector('.diary-cal-btn');
  if (!cal) return;
  const isOpen = cal.style.display !== 'none';
  cal.style.display = isOpen ? 'none' : '';
  if (btn) btn.classList.toggle('active', !isOpen);
  if (!isOpen) {
    _diaryCalMonth = new Date(_diaryViewDate).getMonth();
    _diaryCalYear = new Date(_diaryViewDate).getFullYear();
    renderDiaryFullCal();
  }
}

function renderDiaryFullCal() {
  const cal = document.getElementById('diaryFullCalGrid');
  if (!cal) return;
  const allData = loadSharedDiaryData();
  const first = new Date(_diaryCalYear, _diaryCalMonth, 1);
  let dow = first.getDay();
  dow = dow === 0 ? 6 : dow - 1;
  const selKey = fmtDate(new Date(_diaryViewDate));
  const todayKey = fmtDate(new Date());
  const dowLabels = t('sdDOWMon');
  let html = dowLabels
    .map(function (d) {
      return '<div class="mc-dow">' + d + '</div>';
    })
    .join('');
  for (let i = 0; i < 42; i++) {
    const d = new Date(first);
    d.setDate(d.getDate() - dow + i);
    const key = fmtDate(d);
    const inMonth = d.getMonth() === _diaryCalMonth;
    const dayData = allData[key];
    const both = dayData && dayData['barry'] && dayData['andjela'];
    const hasEntry = dayData && (dayData['barry'] || dayData['andjela']);
    const cls = ['mc-day'];
    if (!inMonth) cls.push('other-month');
    if (key === todayKey) cls.push('today');
    if (key === selKey) cls.push('selected');
    html += '<div class="' + cls.join(' ') + '" onclick="selectDiaryCalDate(\'' + key + '\')">';
    html += '<span>' + d.getDate() + '</span>';
    if (hasEntry && inMonth) html += '<span class="mc-dot' + (both ? ' both' : ' has-entry') + '"></span>';
    html += '</div>';
  }
  cal.innerHTML = html;
  document.getElementById('diaryCalMonthLabel').textContent = L(
    _diaryCalYear + '. ' + (_diaryCalMonth + 1) + '.',
    _diaryCalYear + '年' + (_diaryCalMonth + 1) + '月',
    t('months')[_diaryCalMonth] + ' ' + _diaryCalYear
  );
}

function selectDiaryCalDate(key) {
  _diaryViewDate = new Date(key + 'T00:00:00');
  _diaryMood = '';
  document.getElementById('diaryFullCal').style.display = 'none';
  const btn = document.querySelector('.diary-cal-btn');
  if (btn) btn.classList.remove('active');
  renderDiaryPanel();
}

function shiftDiaryCalMonth(dir) {
  _diaryCalMonth += dir;
  if (_diaryCalMonth < 0) {
    _diaryCalMonth = 11;
    _diaryCalYear--;
  }
  if (_diaryCalMonth > 11) {
    _diaryCalMonth = 0;
    _diaryCalYear++;
  }
  renderDiaryFullCal();
}

function goDiaryCalToday() {
  const t = new Date();
  _diaryCalMonth = t.getMonth();
  _diaryCalYear = t.getFullYear();
  _diaryViewDate = t;
  renderDiaryFullCal();
  document.getElementById('diaryFullCal').style.display = 'none';
  const btn = document.querySelector('.diary-cal-btn');
  if (btn) btn.classList.remove('active');
  renderDiaryPanel();
}

// ── Write Form ──────────────────────────────────────────────────
function renderDiaryForm() {
  const dateKey = fmtDate(new Date(_diaryViewDate));
  const d = new Date(_diaryViewDate);
  const dateStr = L(
    '💌 ' + d.getDate() + '. ' + (d.getMonth() + 1) + '. ' + d.getFullYear() + '.',
    '💌 ' + d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日',
    '💌 ' + t('months')[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear()
  );
  document.getElementById('diaryWriteDate').textContent = dateStr;
  document.getElementById('diary-save-text').textContent = L('Sačuvaj', 'Save', '保存');
  document.getElementById('letter-saved-text').textContent = L('Sačuvano', 'Saved', '已保存');

  // Populate textarea
  const allData = loadSharedDiaryData();
  const myEntry = allData[dateKey] && allData[dateKey][activeProfile];
  const ta = document.getElementById('diaryTextarea');
  const existing = myEntry ? letterTextFromEntry(myEntry) : '';
  if (ta.value !== existing) ta.value = existing;
  _diaryMood = myEntry && myEntry.mood ? myEntry.mood : '';

  // Mood chips
  let moodHtml = '';
  const moods = L ? LETTER_MOODS : ['😊', '🥰', '😢', '😤', '😴', '🤩'];
  moods.forEach(function (m) {
    moodHtml += '<span class="diary-mood-chip' + (_diaryMood === m ? ' picked' : '') + '" onclick="pickDiaryMood(\'' + m + '\')">' + m + '</span>';
  });
  document.getElementById('diaryMoodRow').innerHTML = moodHtml;

  // Char count
  updateDiaryCharCount();
  ta.oninput = function () {
    updateDiaryCharCount();
    clearTimeout(_diaryAutoSaveTimer);
    _diaryAutoSaveTimer = setTimeout(autoSaveDiaryDraft, 2000);
  };
}

function updateDiaryCharCount() {
  const ta = document.getElementById('diaryTextarea');
  const cnt = document.getElementById('diaryCharCount');
  if (cnt && ta) cnt.textContent = ta.value.length + '/500';
}

function pickDiaryMood(m) {
  _diaryMood = _diaryMood === m ? '' : m;
  renderDiaryForm();
}

function autoSaveDiaryDraft() {
  const dateKey = fmtDate(new Date(_diaryViewDate));
  const ta = document.getElementById('diaryTextarea');
  if (!ta || !ta.value.trim()) return;
  const allData = loadSharedDiaryData();
  if (!allData[dateKey]) allData[dateKey] = {};
  const existing = allData[dateKey][activeProfile] || {};
  allData[dateKey][activeProfile] = { text: ta.value.trim(), mood: _diaryMood, time: Date.now(), draft: true, hug: existing.hug };
  saveSharedDiaryData(allData);
}

function saveDiaryEntry() {
  const dateKey = fmtDate(new Date(_diaryViewDate));
  const ta = document.getElementById('diaryTextarea');
  const text = ta ? ta.value.trim() : '';
  if (!text) return;
  const allData = loadSharedDiaryData();
  if (!allData[dateKey]) allData[dateKey] = {};
  const existing = allData[dateKey][activeProfile] || {};
  allData[dateKey][activeProfile] = { text: text, mood: _diaryMood, time: Date.now(), hug: existing.hug };
  saveSharedDiaryData(allData);
  // Show saved badge
  const badge = document.getElementById('letterSavedBadge');
  if (badge) {
    badge.classList.add('show');
    setTimeout(function () {
      badge.classList.remove('show');
    }, 2000);
  }
  pushAllSharedData().catch(function () {});
  renderDiaryPanel();
  toast('💌 ✓');
}

// ── Partner Card ────────────────────────────────────────────────
function renderDiaryPartnerCard() {
  const dateKey = fmtDate(new Date(_diaryViewDate));
  const allData = loadSharedDiaryData();
  const partnerProfile = activeProfile === 'andjela' ? 'barry' : 'andjela';
  const myEntry = allData[dateKey] && allData[dateKey][activeProfile];
  const partnerEntry = allData[dateKey] && allData[dateKey][partnerProfile];
  const partnerName = partnerProfile === 'andjela' ? '🌸 Anđela' : '👦 Barry';
  document.getElementById('letter-partner-title').textContent = partnerName + ' ' + L('pismo', '的信', "'s Letter");
  document.getElementById('letter-lock-text').textContent = L(
    'Napiši svoje pismo da otključaš partnerovo 💌',
    '写下你的信来解锁伴侣的 💌',
    "Write your letter to unlock your partner's 💌"
  );
  const lockedEl = document.getElementById('letterLocked');
  const contentEl = document.getElementById('letterPartnerContent');
  const translateBtn = document.getElementById('letterTranslateBtn');
  if (myEntry) {
    lockedEl.style.display = 'none';
    contentEl.style.display = '';
    if (partnerEntry) {
      const mood = partnerEntry.mood || '';
      const timeStr = partnerEntry.time
        ? (function (t) {
            const d = new Date(t);
            return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
          })(partnerEntry.time)
        : '';
      const bodyText = letterTextFromEntry(partnerEntry);
      contentEl.innerHTML =
        '<div class="letter-body">' +
        esc(bodyText) +
        '</div><div class="letter-signature">— ' +
        partnerName +
        ' ' +
        mood +
        ' 💕</div>' +
        (timeStr ? '<div class="letter-time">' + timeStr + '</div>' : '');
      translateBtn.style.display = '';
    } else {
      contentEl.innerHTML =
        '<div style="text-align:center;padding:16px;font-size:var(--text-sm);color:var(--text-muted);font-style:italic">' +
        L('Partner još nije napisao pismo za ovaj dan 📭', '伴侣还没写这一天的信 📭', "Your partner hasn't written for this day yet 📭") +
        '</div>';
      translateBtn.style.display = 'none';
    }
  } else {
    lockedEl.style.display = '';
    contentEl.style.display = 'none';
    translateBtn.style.display = 'none';
  }
}

// ── Timeline ────────────────────────────────────────────────────
function renderDiaryTimeline() {
  const list = document.getElementById('diaryTimelineList');
  if (!list) return;
  const allData = loadSharedDiaryData();
  document.getElementById('diary-timeline-title').textContent = L('Svi unosi', '所有日记', 'All Entries');
  const items = [];
  Object.keys(allData).forEach(function (date) {
    const day = allData[date];
    if (day[activeProfile]) items.push({ date: date, entry: day[activeProfile] });
  });
  items.sort(function (a, b) {
    return b.date.localeCompare(a.date);
  });
  if (items.length === 0) {
    list.innerHTML =
      '<div class="diary-timeline-empty">' +
      L('Još nema unosa — napiši prvi! ✍️', '还没有日记——写第一篇吧！✍️', 'No entries yet — write the first! ✍️') +
      '</div>';
    return;
  }
  const showItems = items.slice(0, _diaryTimelineLimit);
  const selKey = fmtDate(new Date(_diaryViewDate));
  let html = '';
  showItems.forEach(function (item) {
    const text = letterTextFromEntry(item.entry);
    const preview = text.length > 80 ? text.substring(0, 80) + '...' : text;
    const moodIcon = item.entry.mood || '';
    const isActive = item.date === selKey;
    html += '<div class="diary-timeline-item' + (isActive ? '" style="border-color:var(--love)' : '') + '" onclick="jumpToDiaryDate(\'' + item.date + '\')">';
    html += '<div class="dti-header"><span class="dti-date">' + item.date + '</span>';
    if (moodIcon) html += '<span class="dti-mood">' + moodIcon + '</span>';
    html += '</div>';
    html += '<div class="dti-preview">' + esc(preview) + '</div>';
    html += '</div>';
  });
  if (items.length > _diaryTimelineLimit) {
    html +=
      '<div class="diary-timeline-more"><button onclick="loadMoreDiaryEntries()">' +
      L(
        'Učitaj još... (' + (items.length - _diaryTimelineLimit) + ')',
        '加载更多... (' + (items.length - _diaryTimelineLimit) + ')',
        'Load more... (' + (items.length - _diaryTimelineLimit) + ')'
      ) +
      '</button></div>';
  }
  list.innerHTML = html;
}

function loadMoreDiaryEntries() {
  _diaryTimelineLimit += 15;
  renderDiaryTimeline();
}

function jumpToDiaryDate(dateKey) {
  _diaryViewDate = new Date(dateKey + 'T00:00:00');
  _diaryMood = '';
  renderDiaryPanel();
}

const LETTER_MOODS = ['😊', '🥰', '😢', '😤', '😴', '🤩'];

// Merge old 4-field entry into letter text
function letterTextFromEntry(entry) {
  if (!entry) return '';
  if (entry.text) return entry.text; // new format
  const parts = [];
  if (entry.happy) parts.push('💝 ' + entry.happy);
  if (entry.uncomf) parts.push('🤔 ' + entry.uncomf);
  if (entry.thanks) parts.push('🙏 ' + entry.thanks);
  if (entry.wish) parts.push('💪 ' + entry.wish);
  return parts.join('\n\n');
}

function renderMailbox(allData) {
  const list = document.getElementById('mailboxList');
  if (!list) return;
  const items = [];
  Object.keys(allData).forEach(function (date) {
    const day = allData[date];
    if (day['barry'] || day['andjela']) items.push({ date: date, barry: day['barry'], andjela: day['andjela'] });
  });
  items.sort(function (a, b) {
    return b.date.localeCompare(a.date);
  });
  document.getElementById('mailbox-title').textContent = L('Poštansko sanduče', '信箱', 'Mailbox');
  if (items.length === 0) {
    list.innerHTML =
      '<div class="mailbox-empty">' + L('Još nema pisama — napiši prvo! 💌', '还没有信——写第一封吧！💌', 'No letters yet — write the first! 💌') + '</div>';
    return;
  }
  const showCount = 8;
  let html = '';
  for (let i = 0; i < Math.min(items.length, showCount); i++) {
    const item = items[i];
    const both = item.barry && item.andjela;
    const myEntry = item[activeProfile];
    const partnerEntry = item[activeProfile === 'andjela' ? 'barry' : 'andjela'];
    const icon = both ? '💌' : myEntry ? '✉️' : '📭';
    const preview = myEntry
      ? (myEntry.happy || myEntry.text || letterTextFromEntry(myEntry)).substring(0, 60)
      : partnerEntry
        ? '🔒 ' + L('piši da otključaš', 'write to unlock', '写信解锁')
        : '';
    const moodEmoji = myEntry && myEntry.mood ? myEntry.mood : '';
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
  _diaryViewDate = new Date(dateKey + 'T00:00:00');
  _diaryMood = '';
  renderDiaryPanel();
  const panel = document.getElementById('panel-diary');
  if (panel) panel.scrollIntoView({ behavior: 'smooth' });
}

function translatePartnerLetter() {
  const dateKey = fmtDate(new Date(_diaryViewDate));
  const allData = loadSharedDiaryData();
  const partnerProfile = activeProfile === 'andjela' ? 'barry' : 'andjela';
  const entry = allData[dateKey] && allData[dateKey][partnerProfile];
  if (!entry) return;
  const body = entry.text || letterTextFromEntry(entry);
  const vl = (lang || 'sr') === 'zh-CN' ? 'zh-CN' : 'sr';
  const pl = partnerProfile === 'barry' ? 'zh-CN' : 'sr';
  if (vl === pl) return;
  const btn = document.getElementById('letterTranslateBtn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳';
  }
  translateText(body, pl, vl)
    .then(function (result) {
      const contentEl = document.getElementById('letterPartnerContent');
      if (result && result !== body && contentEl) {
        const partnerName = partnerProfile === 'andjela' ? '🌸 Anđela' : '👦 Barry';
        const mood = entry.mood || '';
        contentEl.innerHTML =
          '<div class="letter-body">' +
          esc(result) +
          '</div><div class="letter-signature">— ' +
          partnerName +
          ' ' +
          mood +
          ' 💕</div><div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:4px">🌐 ' +
          L('Prevedeno', 'Translated', '已翻译') +
          '</div>';
        if (btn) {
          btn.textContent = '✅';
          btn.disabled = false;
        }
      } else {
        if (btn) {
          btn.textContent = '⚠️';
          btn.disabled = false;
          setTimeout(function () {
            btn.textContent = '🌐';
          }, 3000);
        }
      }
    })
    .catch(function () {
      if (btn) {
        btn.textContent = '⚠️';
        btn.disabled = false;
        setTimeout(function () {
          btn.textContent = '🌐';
        }, 3000);
      }
    });
}

function clearAllDiaries() {
  if (
    !confirm(
      L('Obrisati SVE zajedničke dnevnike? Ovo se ne može vratiti.', 'Delete ALL shared diaries? This cannot be undone.', '删除所有共享日记？此操作不可撤销。')
    )
  ) {
    return;
  }
  localStorage.setItem('shared-diary', '{}');
  saveSharedDiaryData({});
  pushAllSharedData().then(function () {
    renderSharedDiary();
    renderDateStrip();
    renderCalendar();
    toast('🗑️ ' + L('Dnevnici obrisani', 'Diaries cleared', '日记已清空'));
  });
}

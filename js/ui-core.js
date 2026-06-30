/* ================================================================
   ui-core.js — Global UI utility functions extracted from app.js

   Provides: safeParse(), $(), clearElCache(), debounce(), esc(),
             closeModal(), toggleKnowledge(), toast()

   These are global functions used by app.js, social.js, and inline
   onclick handlers in index.html.
   ================================================================ */

'use strict';
/* eslint-disable no-unused-vars */

/* ================================================================
   SAFE JSON PARSE — returns default on failure, never throws
   ================================================================ */
function safeParse(text, defaultVal) {
  if (text == null) return defaultVal;
  try {
    return JSON.parse(text);
  } catch (e) {
    return defaultVal;
  }
}

/* ================================================================
   DOM CACHE — reduces repeated document.getElementById calls
   ================================================================ */
let _elCache = {};
function $(id) {
  if (!_elCache[id]) {
    const el = document.getElementById(id);
    if (el) _elCache[id] = el;
  }
  return _elCache[id] || null;
}
function clearElCache() {
  _elCache = {};
}

/* ================================================================
   DEBOUNCE — returns a debounced version of fn
   ================================================================ */
function debounce(fn, delay) {
  let timer = null;
  return function () {
    const args = arguments,
      ctx = this;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(ctx, args);
    }, delay);
  };
}

/* ================================================================
   HTML ESCAPE — prevents XSS in user-generated content
   Escapes: & < > " ' ` for safe innerHTML usage
   ================================================================ */
function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/`/g, '&#96;');
}

/* ================================================================
   MODAL — close with closing animation
   ================================================================ */
function closeModal() {
  const overlay = document.getElementById('modal');
  if (!overlay) return;
  const modalEl = overlay.querySelector('.modal');
  if (modalEl) {
    // Fallback: try GSAP close, otherwise use CSS animation
    if (typeof animateModalOut === 'function') {
      animateModalOut(overlay);
    } else {
      modalEl.classList.add('closing');
      overlay.classList.add('closing');
      modalEl.addEventListener('animationend', function h() {
        modalEl.removeEventListener('animationend', h);
        overlay.classList.add('hidden');
        overlay.classList.remove('closing');
        modalEl.classList.remove('closing');
      }, { once: true });
    }
  } else {
    overlay.classList.add('hidden');
  }
  selectedDate = null;
  knowledgeOpen = false;
  if (window._lastFocusedBeforeModal) {
    window._lastFocusedBeforeModal.focus();
  }
}

/* ================================================================
   KNOWLEDGE PANEL — toggle cycle phase knowledge panel in modal
   ================================================================ */
function toggleKnowledge() {
  knowledgeOpen = !knowledgeOpen;
  if (selectedDate) {
    const pred = predict();
    renderKnowledge(getPhase(selectedDate, pred), fmtDate(selectedDate));
  }
}

/* ================================================================
   TOAST — show a temporary notification
   ================================================================ */
function toast(msg) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  while (container.children.length >= 3) {
    container.firstChild.remove();
  }
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(function () {
    el.classList.add('out');
  }, 2800);
  setTimeout(function () {
    if (el.parentNode) el.remove();
  }, 3300);
}

/* ================================================================
   CENTRALIZED EVENT DELEGATION — replace inline onclick handlers
   Attach data-action="name" to any element. Reduces global scope
   pollution and improves CSP compatibility.
   ================================================================ */
document.addEventListener('click', function (e) {
  const target = e.target.closest('[data-action]');
  if (!target) return;
  const action = target.getAttribute('data-action');
  if (!action) return;
  e.preventDefault();

  switch (action) {
    case 'close-modal':
      if (typeof closeModal === 'function') closeModal();
      break;
    case 'toggle-period':
      if (typeof togglePeriodRecord === 'function') togglePeriodRecord();
      break;
    case 'remove-period':
      if (typeof removePeriodRecord === 'function') removePeriodRecord();
      break;
    case 'save-diary':
      if (typeof saveDiaryEntry === 'function') saveDiaryEntry();
      break;
    case 'save-symptom':
      if (typeof saveSymptom === 'function') saveSymptom();
      break;
    case 'add-gratitude':
      if (typeof addGratitude === 'function') addGratitude();
      break;
    case 'send-hug':
      if (typeof sendHug === 'function') sendHug();
      break;
    case 'export-data':
      if (typeof exportAllData === 'function') exportAllData();
      break;
    case 'import-data':
      if (typeof importAllData === 'function') importAllData();
      break;
    case 'clear-diary':
      if (typeof clearAllDiaries === 'function') clearAllDiaries();
      break;
    case 'save-settings':
      if (typeof saveSettings === 'function') saveSettings();
      break;
    default:
      target.dispatchEvent(new CustomEvent('action-' + action, { bubbles: true }));
  }
});

document.addEventListener('change', function (e) {
  const target = e.target.closest('[data-action-change]');
  if (!target) return;
  const action = target.getAttribute('data-action-change');
  if (!action) return;
  switch (action) {
    case 'theme':
      if (typeof switchTheme === 'function') switchTheme(target.value);
      break;
    case 'language':
      if (typeof switchLanguage === 'function') switchLanguage(target.value);
      break;
  }
});

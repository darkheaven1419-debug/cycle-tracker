/* ================================================================
   ui-core.js — Global UI utility functions extracted from app.js

   Provides: safeParse(), $(), clearElCache(), debounce(), esc(),
             closeModal(), toggleKnowledge(), toast()

   These are global functions used by app.js, social.js, and inline
   onclick handlers in index.html.
   ================================================================ */

'use strict';

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
var _elCache = {};
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
  const modalEl = overlay.querySelector('.modal');
  if (modalEl) {
    modalEl.classList.add('closing');
    overlay.classList.add('closing');
    modalEl.addEventListener(
      'animationend',
      function h() {
        modalEl.removeEventListener('animationend', h);
        overlay.classList.add('hidden');
        overlay.classList.remove('closing');
        modalEl.classList.remove('closing');
        selectedDate = null;
        knowledgeOpen = false;
        if (window._lastFocusedBeforeModal) {
          window._lastFocusedBeforeModal.focus();
        }
      },
      { once: true }
    );
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

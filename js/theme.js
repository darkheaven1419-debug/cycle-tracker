/* ================================================================
   theme.js — Theme & decoration module extracted from app.js

   Provides: applyTheme(), switchTheme(), getFestivalTheme(),
             applyFestivalTheme(), applySeasonalDecor()
   Dependencies (globals): theme (string 'light'|'dark'),
             profileKey() from app.js
   ================================================================ */

'use strict';

/* ================================================================
   THEME MANAGEMENT
   ================================================================ */
function applyTheme(th) {
  theme = th;
  localStorage.setItem(profileKey('cycle-theme'), th);
  localStorage.setItem('cycle-theme', th);
  document.documentElement.setAttribute('data-theme', th);
  var btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = th === 'dark' ? '☀️' : '🌙';
  var sel = document.getElementById('set-theme');
  if (sel) sel.value = th;
}

function switchTheme(th) {
  applyTheme(th);
}

/* ================================================================
   FESTIVAL THEME — auto-apply visual theme on special days
   ================================================================ */
function getFestivalTheme() {
  var t = new Date();
  var k = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  var L = {
    2025: { s: '2025-01-29', m: '2025-10-06' },
    2026: { s: '2026-02-17', m: '2026-09-25' },
    2027: { s: '2027-02-06', m: '2027-10-14' },
    2028: { s: '2028-01-26', m: '2028-10-03' },
    2029: { s: '2029-02-13', m: '2029-09-28' },
  };
  var ld = L[t.getFullYear()];
  if (ld) {
    var ss = new Date(ld.s + 'T00:00:00');
    var se = new Date(ss);
    se.setDate(se.getDate() + 3);
    if (t >= ss && t <= se) return 'festival-spring';
    if (k === ld.m) return 'festival-midautumn';
  }
  var mmdd = String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  if (mmdd === '01-07') return 'festival-orthodoxmas';
  if (mmdd === '01-27') return 'festival-sava';
  if (mmdd === '02-14') return 'festival-valentine';
  if (mmdd === '05-09') return 'festival-victory';
  var ORTHODOX_EASTER = { 2025: '2025-04-20', 2026: '2026-04-12', 2027: '2027-05-02', 2028: '2028-04-16', 2029: '2029-04-08' };
  var oe = ORTHODOX_EASTER[t.getFullYear()];
  if (oe && k === oe) return 'festival-easter';
  if (mmdd === '01-01') return 'festival-newyear';
  return '';
}

function applyFestivalTheme() {
  var cls = getFestivalTheme();
  document.body.classList.forEach(function (c) {
    if (c.startsWith('festival-')) document.body.classList.remove(c);
  });
  if (cls) document.body.classList.add(cls);
  var old = document.getElementById('festivalDecorations');
  if (old) old.remove();
  var icons = null, count = 0;
  if (cls === 'festival-spring') { icons = ['🏮', '🧧', '🎆', '🧨']; count = 12; }
  else if (cls === 'festival-midautumn') { icons = ['🌕', '🐰', '🥮', '🏮']; count = 10; }
  else if (cls === 'festival-valentine') { icons = ['💕', '💖', '💗', '🌸', '❤️']; count = 15; }
  else if (cls === 'festival-newyear') { icons = ['🎆', '✨', '🎉', '🌟']; count = 12; }
  else if (cls === 'festival-sava') { icons = ['📚', '✝️', '🇷🇸', '🕊️']; count = 8; }
  else if (cls === 'festival-orthodoxmas') { icons = ['❄️', '🎄', '✝️', '🕯️']; count = 8; }
  else if (cls === 'festival-easter') { icons = ['🥚', '🐇', '🌸', '🕊️']; count = 10; }
  else if (cls === 'festival-victory') { icons = ['🕊️', '🌺', '🎖️', '✨']; count = 8; }
  if (!icons) return;
  var c = document.createElement('div');
  c.className = 'festival-decorations';
  c.id = 'festivalDecorations';
  for (var i = 0; i < count; i++) {
    var d = document.createElement('span');
    d.className = 'festival-deco';
    d.textContent = icons[i % icons.length];
    d.style.left = 2 + Math.random() * 94 + '%';
    d.style.fontSize = 0.8 + Math.random() * 1.8 + 'rem';
    d.style.animationDelay = Math.random() * 6 + 's';
    d.style.animationDuration = 4 + Math.random() * 8 + 's';
    c.appendChild(d);
  }
  document.body.appendChild(c);
}

/* ================================================================
   SEASONAL DECOR — floating seasonal emojis (when no festival)
   ================================================================ */
function applySeasonalDecor() {
  var cls = getFestivalTheme();
  if (cls) return;
  var m = new Date().getMonth();
  var icons = null, count = 0;
  if (m >= 2 && m <= 4) { icons = ['🌸', '🌷', '💮', '🌿']; count = 8; }
  else if (m >= 5 && m <= 7) { icons = ['☀️', '🌻', '🍦', '🦋']; count = 6; }
  else if (m >= 8 && m <= 10) { icons = ['🍂', '🍁', '🎃', '🌾']; count = 8; }
  else { icons = ['❄️', '⛄', '🧣', '✨']; count = 6; }
  var old = document.getElementById('seasonalDecorations');
  if (old) old.remove();
  var c = document.createElement('div');
  c.className = 'seasonal-deco';
  c.id = 'seasonalDecorations';
  for (var i = 0; i < count; i++) {
    var d = document.createElement('span');
    d.textContent = icons[i % icons.length];
    d.style.left = 3 + Math.random() * 94 + '%';
    d.style.fontSize = 0.7 + Math.random() * 1.2 + 'rem';
    d.style.animationDelay = Math.random() * 8 + 's';
    c.appendChild(d);
  }
  document.body.appendChild(c);
}

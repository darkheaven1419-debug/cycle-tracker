/* ================================================================
   translate.js — Translation module extracted from app.js

   Provides: translateText(), translatePartnerEntries()
   Dependencies (globals): lang, activeProfile, DEBUG
   ================================================================ */

'use strict';

// Translation cache — Map with LRU eviction (max 500 entries)
const _transCache = new Map();
const _TRANS_CACHE_MAX = 500;
function _transCacheSet(key, val) {
  if (_transCache.size >= _TRANS_CACHE_MAX) {
    const firstKey = _transCache.keys().next().value;
    _transCache.delete(firstKey);
  }
  _transCache.set(key, val);
}

/**
 * Translate text using 3-tier fallback: Google -> MyMemory -> LibreTranslate
 * @param {string} text
 * @param {string} from - source language code
 * @param {string} to - target language code
 * @returns {Promise<string|null>}
 */
async function translateText(text, from, to) {
  if (!text || from === to || text.length < 2) return text;
  const cacheKey = from + '|' + to + '|' + text;
  if (_transCache.has(cacheKey)) return _transCache.get(cacheKey);

  let result = null;

  // 1) Google Translate
  try {
    const r1 = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + from + '&tl=' + to + '&dt=t&q=' + encodeURIComponent(text));
    const d1 = await r1.json();
    if (d1 && d1[0]) {
      const t = d1[0]
        .map(function (s) { return s[0]; })
        .join('');
      if (t && t !== text) result = t;
    }
  } catch (e) {
    if (typeof DEBUG !== 'undefined' && DEBUG) console.warn('[translate] Google API failed:', e.message);
  }

  // 2) MyMemory (free, no key needed)
  if (!result) {
    try {
      const pair = from + '|' + to;
      const r2 = await fetch('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=' + pair);
      const d2 = await r2.json();
      if (d2.responseData && d2.responseData.translatedText && d2.responseData.translatedText !== text) {
        result = d2.responseData.translatedText;
      }
    } catch (e) {
      if (typeof DEBUG !== 'undefined' && DEBUG) console.warn('[translate] MyMemory failed:', e.message);
    }
  }

  // 3) LibreTranslate (public instance)
  if (!result) {
    try {
      const r3 = await fetch('https://translate.argosopentech.com/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, source: from, target: to, format: 'text' }),
      });
      const d3 = await r3.json();
      if (d3.translatedText && d3.translatedText !== text) result = d3.translatedText;
    } catch (e) {
      if (typeof DEBUG !== 'undefined' && DEBUG) console.warn('[translate] LibreTranslate failed:', e.message);
    }
  }

  if (result) {
    _transCacheSet(cacheKey, result);
    return result;
  }
  return null;
}

/**
 * Translate all partner diary entries on the page
 */
async function translatePartnerEntries() {
  const btn = document.getElementById('translateBtnSm');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳';
  }
  const vl = (typeof lang !== 'undefined' && lang === 'zh-CN') ? 'zh-CN' : 'sr';
  const pl = (typeof activeProfile !== 'undefined' && activeProfile === 'barry') ? 'sr' : 'zh-CN';
  if (vl === pl) {
    if (btn) { btn.textContent = '🌐'; btn.disabled = false; }
    return;
  }
  const els = document.querySelectorAll('[id^="sdp-"]');
  let ok = 0;
  for (let i = 0; i < els.length; i++) {
    const el = els[i];
    const orig = el.getAttribute('data-original');
    if (orig && orig.length > 2) {
      const result = await translateText(orig, pl, vl);
      if (result === null) {
        el.textContent = orig + ' [' + (lang === 'sr' ? 'prevod nije uspeo' : lang === 'en' ? 'translation failed' : '翻译失败') + ']';
        el.style.color = 'var(--text-muted)';
      } else if (result && result !== orig) {
        el.textContent = result;
        el.style.color = 'var(--teal)';
        el.style.fontWeight = '500';
        ok++;
      }
    }
  }
  if (btn) {
    if (ok > 0) {
      btn.textContent = '✅';
      btn.style.borderColor = 'var(--teal)';
      btn.style.color = 'var(--teal)';
    } else {
      btn.textContent = '⚠️';
      btn.style.borderColor = '#E53935';
      btn.style.color = '#E53935';
      btn.disabled = false;
      setTimeout(function () {
        if (btn) {
          btn.textContent = '🌐';
          btn.style.borderColor = '';
          btn.style.color = '';
          btn.disabled = false;
        }
      }, 3000);
    }
  }
}

"use strict";

(function () {
  console.log('[module-settings] 已加载');

  /* token i18n via global t() */

  function saveGitHubToken() {
    var t = document.getElementById('set-gh-token').value.trim();
    var warning = document.getElementById('tokenSecurityWarning');
    if (t) {
      sessionStorage.setItem('gh-token', t);
      toast('\u{1F511} ' + (typeof t === 'function' ? t('tokenSaved') : 'Token saved ✓'));
      if (warning) warning.style.display = '';
      if (typeof pullAllSharedData === 'function') {
        pullAllSharedData().then(function () {
          if (typeof updateSyncStatusBadge === 'function') updateSyncStatusBadge();
          if (typeof renderAll === 'function') renderAll();
        });
      }
    } else {
      sessionStorage.removeItem('gh-token');
      if (warning) warning.style.display = 'none';
      if (typeof updateSyncStatusBadge === 'function') updateSyncStatusBadge();
    }
  }
  window.saveGitHubToken = saveGitHubToken;

  async function testGitHubToken() {
    var btn = document.getElementById('testTokenBtn');
    if (!btn) return;
    var origText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '\u{23F3} Testiranje...';
    var token = typeof getGitHubToken === 'function' ? getGitHubToken() : sessionStorage.getItem('gh-token') || '';
    if (!token) {
      toast('\u{1F511} ' + (typeof t === 'function' ? t('tokenMissing') : 'Enter a token first'));
      btn.textContent = origText; btn.disabled = false; return;
    }
    try {
      var resp = await fetch('https://api.github.com/user', { headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github.v3+json' } });
      if (resp.ok) {
        var user = await resp.json();
        toast('\u{2705} ' + (typeof t === 'function' ? t('tokenValid') : 'Token valid') + ' \u{2014} ' + (user.login || ''));
        btn.textContent = '\u{2705} Va\u{017E}i'; setTimeout(function () { btn.textContent = origText; btn.disabled = false; }, 3000);
      } else if (resp.status === 401) {
        toast('\u{274C} ' + (typeof t === 'function' ? t('tokenInvalid') : 'Token invalid'));
        btn.textContent = '\u{274C} Neva\u{017E}e\u{0107}i'; setTimeout(function () { btn.textContent = origText; btn.disabled = false; }, 3000);
      } else {
        toast('\u{26A0}\u{FE0F} ' + (typeof t === 'function' ? t('tokenError') : 'Error: ') + resp.status);
        btn.textContent = origText; btn.disabled = false;
      }
    } catch (e) {
      toast('\u{26A0}\u{FE0F} ' + (typeof t === 'function' ? t('tokenNetError') : 'Network error'));
      btn.textContent = origText; btn.disabled = false;
    }
  }
  window.testGitHubToken = testGitHubToken;

  function clearGitHubToken() {
    if (typeof getGitHubToken !== 'function') return;
    if (!getGitHubToken()) return;
    if (!confirm((typeof t === 'function' ? t('tokenConfirmClear') : ''))) return;
    sessionStorage.removeItem('gh-token');
    document.getElementById('set-gh-token').value = '';
    var warning = document.getElementById('tokenSecurityWarning');
    if (warning) warning.style.display = 'none';
    if (typeof updateSyncStatusBadge === 'function') updateSyncStatusBadge();
    toast('\u{1F5D1}\u{FE0F} ' + (typeof t === 'function' ? t('tokenCleared') : 'Token cleared'));
  }
  window.clearGitHubToken = clearGitHubToken;

  function loadSettingsUI() {
    document.getElementById('set-cycle').value = (state && state.settings) ? state.settings.cycleLength : 28;
    document.getElementById('set-period').value = (state && state.settings) ? state.settings.periodLength : 7;
    document.getElementById('set-language').value = lang;
    document.getElementById('set-theme').value = typeof theme !== 'undefined' ? theme : 'light';
    document.getElementById('annDateMet').value = typeof annDateMet !== 'undefined' ? annDateMet : '2026-03-19';
    document.getElementById('annDateLove').value = typeof annDateLove !== 'undefined' ? annDateLove : '2026-05-07';
    var hasToken = typeof getGitHubToken === 'function' ? !!getGitHubToken() : false;
    document.getElementById('set-gh-token').value = typeof getGitHubToken === 'function' ? (getGitHubToken() || '') : '';
    document.getElementById('github-token-label').textContent = '\u{1F511} GitHub Token';
    document.getElementById('set-gh-token').placeholder = 'ghp_...';
    document.getElementById('set-gh-token').setAttribute('aria-label', 'GitHub Token');
    document.getElementById('set-h-token').textContent = hasToken ? (typeof t === 'function' ? t('settingsTokenHintEnabled') : '') : (typeof t === 'function' ? t('settingsTokenHintDisabled') : '');
    var warning = document.getElementById('tokenSecurityWarning');
    if (warning) warning.style.display = hasToken ? '' : 'none';
    if (typeof updateAnniversaryCount === 'function') updateAnniversaryCount();
    if (typeof updateSyncStatusBadge === 'function') updateSyncStatusBadge();
  }
  window.loadSettingsUI = loadSettingsUI;

  function saveSettings() {
    if (!state || !state.settings) return;
    state.settings.cycleLength = parseInt(document.getElementById('set-cycle').value) || 28;
    state.settings.periodLength = parseInt(document.getElementById('set-period').value) || 7;
    if (typeof saveState === 'function') saveState();
    if (typeof renderAll === 'function') renderAll(['calendar', 'core']);
    if (typeof toast === 'function' && typeof t === 'function') toast(t('toast.saved'));
  }
  window.saveSettings = saveSettings;
})();

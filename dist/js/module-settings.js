"use strict";

(function () {
  // console.log('[module-settings] 已加载');

  /* token i18n via global t() */
  function _i18n(key, fallback) {
    return typeof window.t === 'function' ? window.t(key) : fallback;
  }

  function saveGitHubToken() {
    var _val = document.getElementById('set-gh-token').value.trim();
    var warning = document.getElementById('tokenSecurityWarning');
    if (_val) {
      localStorage.setItem('gh-token', _val);
      toast('\u{1F511} ' + _i18n('tokenSaved', 'Token saved \u{2713}'));
      console.log('[Token] Token 已保存到 localStorage (前4位=' + _val.substring(0, 4) + '...)');
      if (warning) warning.style.display = '';
      // 保存后立即验证 Token
      _validateStoredToken();
      if (typeof pullAllSharedData === 'function') {
        pullAllSharedData().then(function () {
          if (typeof updateSyncStatusBadge === 'function') updateSyncStatusBadge();
          if (typeof renderAll === 'function') renderAll();
        });
      }
    } else {
      localStorage.removeItem('gh-token');
      console.warn('[Token] Token 被保存但值为空，已从 localStorage 移除');
      if (warning) warning.style.display = 'none';
      if (typeof updateSyncStatusBadge === 'function') updateSyncStatusBadge();
    }
  }
  window.saveGitHubToken = saveGitHubToken;

  // 保存后立即验证 Token 有效性
  async function _validateStoredToken() {
    var _t = typeof getGitHubToken === 'function' ? getGitHubToken() : '';
    if (!_t) return;
    try {
      var _r = await fetch('https://api.github.com/user', { headers: { Authorization: 'Bearer ' + _t, Accept: 'application/vnd.github.v3+json' } });
      if (_r.ok) {
        console.log('[Token] Token 验证通过 ✓');
      } else if (_r.status === 401) {
        toast(_i18n('tokenInvalid', 'Token invalid'));
        console.error('[Token] Token 无效 (401)');
      }
    } catch (_e) {
      // 网络错误不干扰用户操作
    }
  }

  async function testGitHubToken() {
    var btn = document.getElementById('testTokenBtn');
    if (!btn) return;
    var origText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '\u{23F3} Testiranje...';
    var token = typeof getGitHubToken === 'function' ? getGitHubToken() : localStorage.getItem('gh-token') || '';
    if (!token) {
      toast('\u{1F511} ' + _i18n('tokenMissing', 'Enter a token first'));
      btn.textContent = origText; btn.disabled = false; return;
    }
    try {
      var resp = await fetch('https://api.github.com/user', { headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github.v3+json' } });
      if (resp.ok) {
        var user = await resp.json();
        toast('\u{2705} ' + _i18n('tokenValid', 'Token valid') + ' \u{2014} ' + (user.login || ''));
        btn.textContent = '\u{2705} Va\u{017E}i'; setTimeout(function () { btn.textContent = origText; btn.disabled = false; }, 3000);
      } else if (resp.status === 401) {
        toast('\u{274C} ' + _i18n('tokenInvalid', 'Token invalid'));
        btn.textContent = '\u{274C} Neva\u{017E}e\u{0107}i'; setTimeout(function () { btn.textContent = origText; btn.disabled = false; }, 3000);
      } else {
        toast('\u{26A0}\u{FE0F} ' + _i18n('tokenError', 'Error: ') + resp.status);
        btn.textContent = origText; btn.disabled = false;
      }
    } catch (e) {
      toast('\u{26A0}\u{FE0F} ' + _i18n('tokenNetError', 'Network error'));
      btn.textContent = origText; btn.disabled = false;
    }
  }
  window.testGitHubToken = testGitHubToken;

  function clearGitHubToken() {
    if (typeof getGitHubToken !== 'function') return;
    if (!getGitHubToken()) return;
    if (!confirm(_i18n('tokenConfirmClear', ''))) return;
    localStorage.removeItem('gh-token');
    document.getElementById('set-gh-token').value = '';
    var warning = document.getElementById('tokenSecurityWarning');
    if (warning) warning.style.display = 'none';
    if (typeof updateSyncStatusBadge === 'function') updateSyncStatusBadge();
    toast('\u{1F5D1}\u{FE0F} ' + _i18n('tokenCleared', 'Token cleared'));
    console.log('[Token] Token 已清除');
  }
  window.clearGitHubToken = clearGitHubToken;

  function loadSettingsUI() {
    document.getElementById('set-cycle').value = (state && state.settings) ? state.settings.cycleLength : 28;
    document.getElementById('set-period').value = (state && state.settings) ? state.settings.periodLength : 7;
    document.getElementById('set-language').value = lang;
    document.getElementById('set-theme').value = typeof theme !== 'undefined' ? theme : 'light';
    document.getElementById('annDateMet').value = typeof annDateMet !== 'undefined' ? annDateMet : '2026-03-19';
    document.getElementById('annDateLove').value = typeof annDateLove !== 'undefined' ? annDateLove : '2026-05-07';
    var _tokenVal = typeof getGitHubToken === 'function' ? getGitHubToken() : '';
    var hasToken = !!_tokenVal;
    document.getElementById('set-gh-token').value = _tokenVal;
    document.getElementById('github-token-label').textContent = '\u{1F511} ' + _i18n('settingsTokenLabel', 'GitHub Token');
    document.getElementById('set-gh-token').placeholder = 'ghp_...';
    document.getElementById('set-gh-token').setAttribute('aria-label', _i18n('settingsTokenLabel', 'GitHub Token'));
    document.getElementById('set-h-token').textContent = hasToken ? _i18n('settingsTokenHintEnabled', '') : _i18n('settingsTokenHintDisabled', '');
    // Token-related text i18n (hardcoded in HTML, updated dynamically)
    var warning = document.getElementById('tokenSecurityWarning');
    if (warning) {
      warning.textContent = '⚠️ ' + (lang === 'zh-CN' ? 'Token 已保存于浏览器本地存储。请使用最小权限的 fine-grained token（仅 contents:write 权限）。' : lang === 'en' ? 'Token saved in browser local storage. Use minimal fine-grained token (contents:write only).' : 'Token sačuvan u lokalnom skladištu pregledača. Koristi fine-grained token sa minimalnim ovlašćenjima (samo contents:write za ovaj repozitorijum).');
      warning.style.display = hasToken ? '' : 'none';
    }
    var testBtn = document.getElementById('testTokenBtn');
    if (testBtn) testBtn.textContent = '🔍 ' + (lang === 'zh-CN' ? '测试 Token' : lang === 'en' ? 'Test Token' : 'Testiraj token');
    var clearBtn = document.getElementById('clearTokenBtn');
    if (clearBtn) clearBtn.textContent = '🗑️ ' + (lang === 'zh-CN' ? '清除 Token' : lang === 'en' ? 'Clear Token' : 'Obriši token');
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

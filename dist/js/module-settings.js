"use strict";

(function () {
  // console.log('[module-settings] 已加载');

  /* token i18n via global t() */
  function _i18n(key, fallback) {
    return typeof window.t === 'function' ? window.t(key) : fallback;
  }

  // ── Phase 2B：设置页管理「本机 App Secret」（Pull 凭据 / Worker 身份） ──
  // 与 Push 仍在用的 GitHub PAT（localStorage['gh-token']）是两把互不相干的钥匙：
  // 这里绝不读写 gh-token，也绝不把密钥的值写进日志、错误消息或 URL。
  var APP_KEY_STORAGE = 'ct-app-key';
  var WORKER_URL = (typeof SyncModule !== 'undefined' && SyncModule.workerUrl)
    ? SyncModule.workerUrl
    : 'https://cycle-tracker-data.cycletracker-barry.workers.dev';

  /** 读取本机 App Secret（只 trim；绝不打印）。 */
  function _getAppSecret() {
    try {
      if (typeof getAppSecret === 'function') return getAppSecret();
      var k = localStorage.getItem(APP_KEY_STORAGE);
      return k ? String(k).trim() : '';
    } catch (e) { return ''; }
  }

  /**
   * 用 Worker /health 验证密钥。只回传 {ok,status,actor}：
   * actor 是身份（barry / andjela），密钥本身既不读回也不回显。
   */
  async function _probeHealth(key) {
    var resp = await fetch(WORKER_URL + '/health', {
      headers: { Authorization: 'Bearer ' + key, Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!resp.ok) return { ok: false, status: resp.status, actor: '' };
    var body = null;
    try { body = await resp.json(); } catch (e) { body = null; }
    return { ok: true, status: resp.status, actor: (body && body.actor) ? String(body.actor) : '' };
  }

  function saveAppSecret() {
    var el = document.getElementById('set-gh-token');
    var _val = el ? el.value.trim() : '';
    var warning = document.getElementById('tokenSecurityWarning');
    if (_val) {
      localStorage.setItem(APP_KEY_STORAGE, _val);
      if (el) el.value = ''; // 不回填明文：输入框只留「已配置」提示
      toast('\u{1F511} ' + _i18n('tokenSaved', 'Key saved \u{2713}'));
      if (warning) warning.style.display = '';
      // 保存后立即验证密钥（走 Worker /health，不打印密钥）
      _validateStoredSecret();
      if (typeof pullAllSharedData === 'function') {
        pullAllSharedData().then(function () {
          if (typeof updateSyncStatusBadge === 'function') updateSyncStatusBadge();
          if (typeof renderAll === 'function') renderAll();
        });
      }
    } else {
      localStorage.removeItem(APP_KEY_STORAGE);
      console.warn('[Token] 密钥为空，已从本机移除');
      if (warning) warning.style.display = 'none';
      if (typeof updateSyncStatusBadge === 'function') updateSyncStatusBadge();
    }
  }
  window.saveAppSecret = saveAppSecret;

  // 保存后立即验证密钥有效性（Worker /health，不再调用 GitHub /user）
  async function _validateStoredSecret() {
    var _key = _getAppSecret();
    if (!_key) return;
    try {
      var _r = await _probeHealth(_key);
      if (_r.ok) {
        console.log('[Token] App Secret 验证通过 ✓' + (_r.actor ? ' actor=' + _r.actor : ''));
      } else if (_r.status === 401) {
        toast(_i18n('tokenInvalid', 'Key invalid'));
        console.error('[Token] App Secret 无效 (401)');
      }
    } catch (_e) {
      // 网络错误不干扰用户操作
    }
  }

  async function testAppSecret() {
    var btn = document.getElementById('testTokenBtn');
    if (!btn) return;
    var origText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '\u{23F3} Testiranje...';
    var key = _getAppSecret();
    if (!key) {
      toast('\u{1F511} ' + _i18n('tokenMissing', 'Enter a key first'));
      btn.textContent = origText; btn.disabled = false; return;
    }
    try {
      var r = await _probeHealth(key);
      if (r.ok) {
        // 只显示身份 actor，绝不显示密钥
        toast('\u{2705} ' + _i18n('tokenValid', 'Key valid') + (r.actor ? ' \u{2014} ' + r.actor : ''));
        btn.textContent = '\u{2705} ' + (r.actor || 'OK'); setTimeout(function () { btn.textContent = origText; btn.disabled = false; }, 3000);
      } else if (r.status === 401) {
        toast('\u{274C} ' + _i18n('tokenInvalid', 'Key invalid'));
        btn.textContent = '\u{274C} Neva\u{017E}e\u{0107}i'; setTimeout(function () { btn.textContent = origText; btn.disabled = false; }, 3000);
      } else {
        toast('\u{26A0}\u{FE0F} ' + _i18n('tokenError', 'Error: ') + r.status);
        btn.textContent = origText; btn.disabled = false;
      }
    } catch (e) {
      toast('\u{26A0}\u{FE0F} ' + _i18n('tokenNetError', 'Network error'));
      btn.textContent = origText; btn.disabled = false;
    }
  }
  window.testAppSecret = testAppSecret;

  function clearAppSecret() {
    if (!_getAppSecret()) return;
    if (!confirm(_i18n('tokenConfirmClear', ''))) return;
    // 只清 Pull 凭据（ct-app-key）。Push 用的 gh-token 必须原样保留。
    localStorage.removeItem(APP_KEY_STORAGE);
    var el = document.getElementById('set-gh-token');
    if (el) el.value = '';
    var warning = document.getElementById('tokenSecurityWarning');
    if (warning) warning.style.display = 'none';
    if (typeof updateSyncStatusBadge === 'function') updateSyncStatusBadge();
    toast('\u{1F5D1}\u{FE0F} ' + _i18n('tokenCleared', 'Key cleared'));
    console.log('[Token] 本机 App Secret 已清除（GitHub PAT 未动）');
  }
  window.clearAppSecret = clearAppSecret;

  function loadSettingsUI() {
    document.getElementById('set-cycle').value = (state && state.settings) ? state.settings.cycleLength : 28;
    document.getElementById('set-period').value = (state && state.settings) ? state.settings.periodLength : 7;
    document.getElementById('set-language').value = lang;
    document.getElementById('set-theme').value = typeof theme !== 'undefined' ? theme : 'light';
    document.getElementById('annDateMet').value = typeof annDateMet !== 'undefined' ? annDateMet : '2026-03-19';
    document.getElementById('annDateLove').value = typeof annDateLove !== 'undefined' ? annDateLove : '2026-05-07';
    // ── Phase 2B：本机 App Secret（Pull 凭据）──
    // 绝不把密钥回填到 input.value —— 只显示「已配置 / 未配置」。
    var _hasKey = !!_getAppSecret();
    var _tokenInput = document.getElementById('set-gh-token');
    if (_tokenInput) {
      _tokenInput.value = '';
      _tokenInput.placeholder = 'App Secret';
    }
    document.getElementById('github-token-label').textContent = '\u{1F511} ' + _i18n('settingsTokenLabel', 'App Secret');
    if (_tokenInput) _tokenInput.setAttribute('aria-label', _i18n('settingsTokenLabel', 'App Secret'));
    document.getElementById('set-h-token').textContent = _hasKey ? _i18n('settingsTokenHintEnabled', '') : _i18n('settingsTokenHintDisabled', '');
    // Token-related text i18n (hardcoded in HTML, updated dynamically)
    var warning = document.getElementById('tokenSecurityWarning');
    if (warning) {
      warning.textContent = '⚠️ ' + (lang === 'zh-CN' ? '密钥只保存在本机浏览器，用于读取你与伴侣的共享数据。不要分享，也不要粘贴到聊天工具。' : lang === 'en' ? 'The key is stored only in this browser and is used to read your shared data. Never share it or paste it into a chat.' : 'Ključ se čuva samo u ovom pregledaču i služi za čitanje vaših zajedničkih podataka. Ne delite ga.');
      warning.style.display = _hasKey ? '' : 'none';
    }
    var testBtn = document.getElementById('testTokenBtn');
    if (testBtn) testBtn.textContent = '🔍 ' + (lang === 'zh-CN' ? '测试密钥' : lang === 'en' ? 'Test key' : 'Testiraj ključ');
    var clearBtn = document.getElementById('clearTokenBtn');
    if (clearBtn) clearBtn.textContent = '🗑️ ' + (lang === 'zh-CN' ? '清除密钥' : lang === 'en' ? 'Clear key' : 'Obriši ključ');
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

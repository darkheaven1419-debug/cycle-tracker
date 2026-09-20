"use strict";

(function () {
  // console.log('[module-settings] 已加载');

  /* token i18n via global t() */
  function _i18n(key, fallback) {
    return typeof window.t === 'function' ? window.t(key) : fallback;
  }

  // ── Phase 2B/2C：设置页管理「本机 App Secret」（Worker 身份；Pull 与 Push 共用同一把） ──
  // 旧的 GitHub PAT 通道已于 Phase 2D 移除，浏览器侧不再有第二把钥匙，
  // 存储键只剩 ct-app-key。这里绝不读写 gh-token，也绝不把密钥的值写进日志、错误消息或 URL。
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
    // 只清本机 App Secret（ct-app-key）——Phase 2C 起它同时是 Pull 与 Push 的凭据。
    // 旧 gh-token 已不是凭据，清不清都不影响同步；这里不碰它，交给 fix-all.js 的遗留清理。
    localStorage.removeItem(APP_KEY_STORAGE);
    var el = document.getElementById('set-gh-token');
    if (el) el.value = '';
    var warning = document.getElementById('tokenSecurityWarning');
    if (warning) warning.style.display = 'none';
    if (typeof updateSyncStatusBadge === 'function') updateSyncStatusBadge();
    toast('\u{1F5D1}\u{FE0F} ' + _i18n('tokenCleared', 'Key cleared'));
    console.log('[Token] 本机 App Secret 已清除（旧 gh-token 与同步无关，未触碰）');
  }
  window.clearAppSecret = clearAppSecret;

  // ── Phase 2B.5 · 纪念日同步状态（只读诊断）──────────────────────────────
  // 起因：冲突标记（shared-ann-conflict）此前只能靠开发者工具翻 localStorage
  // 才看得见，于是「线上到底有没有真实冲突」既无法由代码断言，也无法由
  // Barry / Anđela 自己确认。这一块把同一批数据搬到 Settings 里。
  //
  // 四条边界（本轮授权原文：只做只读诊断 UI，不改变 anniversary 同步协议，
  // 不改变 canonical 值，不自动 resolve，不清除 conflict）：
  //   1. 不写任何键 —— 不写 canonical、不清 conflict、不动 pending；
  //   2. 不改协议、不发网络请求。remote 值取自 sync.js 已经写好的
  //      shared-ann-remote 留痕，那段留痕由现有 pull 流程维护，因此这里既
  //      不需要新的读取路径，也不可能绕过认证；
  //   3. 完全不碰凭据 —— 不读、不显示、不记录 App Secret / GH_PAT；
  //   4. 结论只由**标记**决定，绝不比较日期。「本机日期 ≠ 远端日期 ⇒ 冲突」
  //      等于系统替两个人选一边，是被 §2.3 明确禁止的。冲突的唯一来源是
  //      sync.js 写下的 shared-ann-conflict，本文件只把它读出来。
  //
  // 键名归 js/sync.js 所有（见其 ANN_SHARED 一段）。这里按本文件既有惯例
  // （见上方 APP_KEY_STORAGE / WORKER_URL）复述字面量，而不去改 sync.js ——
  // 同步协议本轮不动。
  var ANN_K_MET = 'cycle-ann-met';
  var ANN_K_LOVE = 'cycle-ann-love';
  var ANN_K_CANON = 'shared-anniversaries';
  var ANN_K_REMOTE = 'shared-ann-remote';
  var ANN_K_CONFLICT = 'shared-ann-conflict';
  var ANN_K_PENDING = 'shared-ann-pending';

  var _ANN_RE_DATE = /^\d{4}-\d{2}-\d{2}$/;

  function _annLs(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function _annJson(key) {
    var raw = _annLs(key);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }
  function _annDate(v) {
    return (typeof v === 'string' && _ANN_RE_DATE.test(v)) ? v : null;
  }
  /** {met,love} 成对才算合法 —— 与 js/sync.js _annValid 同一形状。 */
  function _annPair(v) {
    if (!v || typeof v !== 'object') return null;
    return (_annDate(v.met) && _annDate(v.love)) ? { met: v.met, love: v.love } : null;
  }

  /**
   * 本机生效日期。优先 getAnnDates()：app.js 是默认值的唯一来源，这里不复制
   * 日期字面量，只在 getAnnDates 不可用时退回 ANN_DEFAULT_*（同样是 app.js 的）。
   */
  function _annDiagLocal() {
    if (typeof getAnnDates === 'function') {
      try {
        var d = getAnnDates();
        if (d && _annDate(d.met) && _annDate(d.love)) return d;
      } catch (e) { /* 忽略，走下面的兜底 */ }
    }
    var def = null;
    try {
      if (typeof ANN_DEFAULT_MET === 'string' && typeof ANN_DEFAULT_LOVE === 'string') {
        def = { met: ANN_DEFAULT_MET, love: ANN_DEFAULT_LOVE };
      }
    } catch (e) { /* TDZ：app.js 尚未执行 */ }
    return {
      met: _annDate(_annLs(ANN_K_MET)) || (def && def.met) || null,
      love: _annDate(_annLs(ANN_K_LOVE)) || (def && def.love) || null,
    };
  }

  function _annDiagConflict() {
    var c = null;
    try { if (typeof getAnnConflict === 'function') c = getAnnConflict(); } catch (e) { /* 忽略 */ }
    if (c && typeof c === 'object') return c;
    var raw = _annJson(ANN_K_CONFLICT);
    return (raw && typeof raw === 'object') ? raw : null;
  }

  /**
   * 远端 canonical 的最后一次观测值（写于 js/sync.js _annRememberRemote）：
   *   {met,love} 已观测到的远端 canonical
   *   'none'     已确认远端还没有 canonical —— 这是事实，不是读取失败
   *   null       本机从未成功读取过远端 → 结论 D
   */
  function _annDiagRemote() {
    var raw = _annJson(ANN_K_REMOTE);
    if (raw === 'none') return 'none';
    return _annPair(raw) || null;
  }

  /** 纯读取。返回值是快照，调用它不产生任何副作用。 */
  function annSyncDiagnostics() {
    var local = _annDiagLocal();
    var d = {
      localMet: local.met,
      localLove: local.love,
      canonical: _annPair(_annJson(ANN_K_CANON)),
      remote: _annDiagRemote(),
      conflict: _annDiagConflict(),
      pending: _annLs(ANN_K_PENDING) === '1',
    };
    /* 优先级：冲突 > 待同步 > remote 不可读 > 正常。
       注意这里没有任何一条分支去看日期是否相等 —— 见文件头第 4 条边界。 */
    if (d.conflict) d.status = 'B';
    else if (d.pending) d.status = 'C';
    else if (!d.remote) d.status = 'D';
    else d.status = 'A';
    return d;
  }
  window.annSyncDiagnostics = annSyncDiagnostics;

  // 内联三语，与上方 tokenSecurityWarning / testTokenBtn 的写法一致。
  // 不走 js/i18n.js：那里的 t() 在键缺失时不回落到第二参数，而这里的文案
  // 需要随本区块一起演进，不适合塞进全局表。
  var _ANN_DIAG_COPY = {
    sr: {
      title: 'Sinhronizacija datuma',
      A: 'U redu — nema sukoba',
      B: 'Potrebna potvrda — pronađena oznaka sukoba',
      C: 'Čeka slanje — neposlata izmena na ovom uređaju',
      D: 'Status sa servera nije pročitan',
      canon: 'Zajednička vrednost (ovaj uređaj)',
      remote: 'Zajednička vrednost (server)',
      fConflict: 'Oznaka sukoba',
      fPending: 'Neposlata izmena',
      empty: 'nema',
      unread: 'nije pročitano',
      yes: 'da',
      no: 'ne',
      note: 'Prikaz je samo uvid. Ništa se ne menja automatski i nijedan datum se ne bira umesto vas.',
    },
    'zh-CN': {
      title: '纪念日同步状态',
      A: '正常 — 当前没有发现冲突',
      B: '待确认 — 检测到冲突标记',
      C: '待同步 — 本机存在未推送修改',
      D: '无法读取服务器状态',
      canon: '共享值（本机）',
      remote: '共享值（服务器）',
      fConflict: '冲突标记',
      fPending: '未推送修改',
      empty: '无',
      unread: '未读取',
      yes: '有',
      no: '无',
      note: '此区域只做展示：不会自动修改任何值，也不会替你选择日期。',
    },
    en: {
      title: 'Anniversary sync status',
      A: 'OK — no conflict found',
      B: 'Needs confirmation — conflict flag present',
      C: 'Pending — unsent change on this device',
      D: 'Server status unavailable',
      canon: 'Shared value (this device)',
      remote: 'Shared value (server)',
      fConflict: 'Conflict flag',
      fPending: 'Unsent change',
      empty: 'none',
      unread: 'not read',
      yes: 'yes',
      no: 'no',
      note: 'This panel only reports. Nothing changes automatically and no date is chosen for you.',
    },
  };
  function _annCopy() {
    return _ANN_DIAG_COPY[typeof lang !== 'undefined' ? lang : 'sr'] || _ANN_DIAG_COPY.sr;
  }

  /* 值虽然已被 _annDate 的正则夹过，但仍然统一转义：这一段是 innerHTML 拼的，
     而 conflict 里的 reason 是自由字符串。 */
  function _annEsc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function _annRow(label, value, muted) {
    return '<div class="stat-row ann-sync-row"><span class="ann-sync-k">' + _annEsc(label) +
      '</span><span class="val' + (muted ? ' ann-sync-muted' : '') + '">' + _annEsc(value) + '</span></div>';
  }

  /** 一对日期 → 一行文本。'none' 与 null 是两种不同的事实，分开说。 */
  function _annPairText(p, t) {
    if (p === 'none') return t.empty;
    if (!p) return t.unread;
    return p.met + ' · ' + p.love;
  }

  function _annChip(label, value, alert) {
    return '<span class="ann-sync-chip' + (alert ? ' ann-sync-chip-alert' : '') + '">' +
      _annEsc(label) + ': <b>' + _annEsc(value) + '</b></span>';
  }

  function renderAnnSyncStatus() {
    var host = document.getElementById('annSyncPanel');
    var body = document.getElementById('annSyncBody');
    var name = document.getElementById('annSyncName');
    var pill = document.getElementById('annSyncPill');
    if (!host || !body || !name || !pill) return;

    var t = _annCopy();
    var d = annSyncDiagnostics();
    /* 前两行的标签直接复用上方纪念日卡片的既有文案，避免同一件事出现两套说法。 */
    var metLabel = document.getElementById('ann-met-label');
    var loveLabel = document.getElementById('ann-love-label');
    var rows = _annRow(metLabel ? metLabel.textContent : ANN_K_MET, d.localMet || t.unread);
    rows += _annRow(loveLabel ? loveLabel.textContent : ANN_K_LOVE, d.localLove || t.unread);
    rows += _annRow(t.canon, _annPairText(d.canonical, t), !d.canonical);
    rows += _annRow(t.remote, _annPairText(d.remote, t), !d.remote || d.remote === 'none');
    rows += '<div class="ann-sync-flags">' +
      _annChip(t.fConflict, d.conflict ? t.yes : t.no, !!d.conflict) +
      _annChip(t.fPending, d.pending ? t.yes : t.no, false) +
      '</div>';
    body.innerHTML = rows + '<p class="ann-sync-note">' + _annEsc(t.note) + '</p>';

    name.textContent = t.title;
    pill.textContent = t[d.status];
    pill.className = 'ann-sync-pill ann-sync-pill-' + d.status.toLowerCase();
    host.setAttribute('data-ann-status', d.status);
    /* 只有 B（真冲突）自动展开 —— 其余保持收起，做到低打扰。 */
    if (d.status === 'B') host.open = true;
  }
  window.renderAnnSyncStatus = renderAnnSyncStatus;

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
    /* Phase 2B.5 —— 每次打开设置页重算一次诊断，因此 remote 留痕、conflict
       标记、pending 都是当下的值，不需要用户手动刷新。 */
    renderAnnSyncStatus();
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

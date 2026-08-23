const SyncModule = (function () {
  var REPO = 'darkheaven1419-debug/cycle-tracker';
  var STATE_FILE = 'shared-state.json';
  var _lastError = null; // 持久化同步错误状态

  // ── 自动拉取定时器（句柄可清理，页面隐藏时暂停） ──
  var _autoPullTimer = null;
  var _visHandler = null;

  function _startAutoPull() {
    _stopAutoPull();
    _autoPullTimer = setInterval(function () {
      if (typeof getGitHubToken === 'function' && getGitHubToken()) {
        console.log('[同步] 定时拉取...');
        pull();
      }
    }, 60000);
    // 页面隐藏时暂停拉取，恢复可见后重启 —— 避免多开/后台重复请求
    if (!_visHandler && typeof document !== 'undefined') {
      _visHandler = function () {
        if (document.hidden) _stopAutoPull();
        else _startAutoPull();
      };
      document.addEventListener('visibilitychange', _visHandler);
    }
  }

  function _stopAutoPull() {
    if (_autoPullTimer) { clearInterval(_autoPullTimer); _autoPullTimer = null; }
  }

  // ── 同步错误状态管理 ──
  function _setError(msg) {
    _lastError = msg;
    console.warn('[同步] 错误:', msg);
  }
  function _clearError() {
    _lastError = null;
  }

  // ── 工具函数 ──
  function getJSON(key, fallback) {
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (e) { return fallback; }
  }

  /** 本地日期键（YYYY-MM-DD），用于记录去重 —— 与项目 sameDay/fmtDate 的本地日期语义一致 */
  function _dkey(d) {
    var dt = (d instanceof Date) ? d : new Date(d);
    return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
  }

  // ── 收集全部本地状态 ──
  function collect() {
    var ce = getJSON('shared-cycle-data', null);
    if (!ce || !ce.records) ce = getJSON('cycle-data-v6-andjela', null);
    return {
      diary: getJSON('shared-diary', {}),
      cycleInfo: ce,
      symptoms: getJSON('shared-symptoms', null),
      gratitude: getJSON('shared-gratitude', []),
      hug: getJSON('shared-hug', null),
      songs: {
        barry: getJSON('shared-song-barry', null),
        andjela: getJSON('shared-song-andjela', null)
      },
      sleep: getJSON('barry-sleep', null),
      checkins: {
        barry: getJSON('shared-checkin-barry', {}),
        andjela: getJSON('shared-checkin-andjela', {})
      },
      learningProgress: getJSON('shared-learning-progress', {}),
      learningComments: getJSON('shared-learning-comments', []),
      learningPoints: getJSON('shared-learning-points', {}),
      voiceData: getJSON('shared-voice-data', {}),
      sunCounter: getJSON('shared-sun-counter', {}),
      knowme: getJSON('shared-knowme', {}),
      calendarMarkers: getJSON('shared-calendar-markers', {}),
      updated: Date.now()
    };
  }

  // ── 日记合并：保留双方所有日记条目 ──
  function mergeDiary(local, remote) {
    if (!remote || typeof remote !== 'object') return local || {};
    if (!local || typeof local !== 'object') return remote || {};
    var result = {};
    // 先拷贝所有本地条目
    for (var dk in local) { if (local.hasOwnProperty(dk)) result[dk] = JSON.parse(JSON.stringify(local[dk])); }
    // 合并远程条目（仅补缺失的，本地已有的不覆盖）
    var added = 0;
    for (var dk2 in remote) {
      if (remote.hasOwnProperty(dk2)) {
        if (!result[dk2]) { result[dk2] = {}; }
        for (var uk in remote[dk2]) {
          if (remote[dk2].hasOwnProperty(uk) && !result[dk2][uk]) {
            result[dk2][uk] = JSON.parse(JSON.stringify(remote[dk2][uk]));
            added++;
          }
        }
      }
    }
    if (added > 0) console.log('[同步] 日记合并新增 ' + added + ' 条外来条目');
    return result;
  }

  // ── 应用远程状态到本地 ──
  function apply(state) {
    if (!state) return;

    // 日记：合并而非覆盖
    if (state.diary) {
      var localDiary = getJSON('shared-diary', {});
      var merged = mergeDiary(localDiary, state.diary);
      localStorage.setItem('shared-diary', JSON.stringify(merged));
      console.log('[同步] 日记合并完成 本地=' + Object.keys(localDiary).length + ' 远程=' + Object.keys(state.diary).length + ' 合并后=' + Object.keys(merged).length);
    }

    // 周期数据：合并（保留本地未推送的经期记录，避免拉取覆盖离线标记）
    if (state.cycleInfo) {
      var mergedInfo = JSON.parse(JSON.stringify(state.cycleInfo));
      var localCE = getJSON('shared-cycle-data', null);
      if (!localCE || !localCE.records) localCE = getJSON('cycle-data-v6-andjela', null);
      if (localCE && localCE.records && Array.isArray(localCE.records) && localCE.records.length) {
        var seen = {};
        (mergedInfo.records || []).forEach(function (r) { seen[_dkey(r)] = 1; });
        localCE.records.forEach(function (r) {
          var k = _dkey(r);
          if (!seen[k]) { seen[k] = 1; (mergedInfo.records = mergedInfo.records || []).push(r); }
        });
        mergedInfo.records.sort(function (a, b) { return new Date(a) - new Date(b); });
      }
      // periodEnds：本地有而远程没有的保留
      var localEnds = (localCE && localCE.periodEnds) || {};
      var mergedEnds = mergedInfo.periodEnds || {};
      for (var pk in localEnds) {
        if (localEnds.hasOwnProperty(pk) && !mergedEnds[pk]) mergedEnds[pk] = localEnds[pk];
      }
      mergedInfo.periodEnds = mergedEnds;

      localStorage.setItem('shared-cycle-data', JSON.stringify(mergedInfo));
      localStorage.setItem('cycle-data-v6-andjela', JSON.stringify(mergedInfo));
      if (typeof window.state !== 'undefined') {
        window.state.records = (mergedInfo.records || []).map(function (r) { return new Date(r); });
        window.state.periodEnds = mergedInfo.periodEnds || {};
        window.state.symptoms = mergedInfo.symptoms || {};
        window.state.settings = mergedInfo.settings || { cycleLength: 28, periodLength: 7 };
      }
    }

    // 其他数据：直接替换
    if (state.symptoms) localStorage.setItem('shared-symptoms', JSON.stringify(state.symptoms));
    if (state.gratitude) localStorage.setItem('shared-gratitude', JSON.stringify(state.gratitude));
    if (state.hug) localStorage.setItem('shared-hug', JSON.stringify(state.hug));
    if (state.sleep) localStorage.setItem('barry-sleep', JSON.stringify(state.sleep));
    if (state.songs) {
      if (state.songs.barry) localStorage.setItem('shared-song-barry', JSON.stringify(state.songs.barry));
      if (state.songs.andjela) localStorage.setItem('shared-song-andjela', JSON.stringify(state.songs.andjela));
    }
    if (state.checkins) {
      if (state.checkins.barry) localStorage.setItem('shared-checkin-barry', JSON.stringify(state.checkins.barry));
      if (state.checkins.andjela) localStorage.setItem('shared-checkin-andjela', JSON.stringify(state.checkins.andjela));
    }
    if (state.learningProgress) localStorage.setItem('shared-learning-progress', JSON.stringify(state.learningProgress));
    if (state.learningComments) localStorage.setItem('shared-learning-comments', JSON.stringify(state.learningComments));
    if (state.learningPoints) localStorage.setItem('shared-learning-points', JSON.stringify(state.learningPoints));
    if (state.voiceData) localStorage.setItem('shared-voice-data', JSON.stringify(state.voiceData));
    if (state.sunCounter) localStorage.setItem('shared-sun-counter', JSON.stringify(state.sunCounter));
    if (state.knowme) localStorage.setItem('shared-knowme', JSON.stringify(state.knowme));
    if (state.calendarMarkers) {
      localStorage.setItem('shared-calendar-markers', JSON.stringify(state.calendarMarkers));
      if (typeof renderCalendar === 'function') renderCalendar();
    }
  }

  // ── 三语错误提示 ──
  function _syncMsg(key) {
    var L = window.lang || 'sr';
    var msgs = {
      token401: { 'zh-CN': '⚠️ Token 无效，请在设置中重新输入', en: '⚠️ Token invalid, please re-enter in Settings', sr: '⚠️ Token nevažeći, unesite ponovo u Podešavanjima' },
      netError: { 'zh-CN': '⚠️ 同步失败，请检查网络后重试', en: '⚠️ Sync failed, check network and retry', sr: '⚠️ Sinhronizacija nije uspela — proverite mrežu' },
      retryFail: { 'zh-CN': '⚠️ 同步失败，请在设置中手动同步', en: '⚠️ Sync failed, please sync manually in Settings', sr: '⚠️ Sinhronizacija nije uspela — pokušajte ručno u Podešavanjima' },
    };
    return msgs[key] ? (msgs[key][L] || msgs[key]['sr']) : '';
  }
  function _syncToast(msg) {
    if (typeof toast === 'function') toast(msg);
    var _sb = document.getElementById('syncStatusBadge');
    if (_sb) { _sb.textContent = '🔴 ' + msg.replace(/^[^ ]* /, ''); _sb.style.color = '#E53935'; }
  }

  // ── 推送数据到 GitHub ──
  async function push(n) {
    n = n || 0;
    var token = typeof getGitHubToken === 'function' ? getGitHubToken() : '';
    if (!token) { console.log('[同步] 无 Token，跳过推送'); return; }

    var _localBefore = getJSON('shared-diary', {});
    console.log('[同步] 开始推送 (重试#' + n + ') — 本地日记数:', Object.keys(_localBefore).length);

    // ── 步骤 1：拉取远程（一次 GET 取得 sha 并合并日记，消除重复请求与 TOCTOU 窗口） ──
    var sha = null;
    try {
      var headers = { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github.v3+json' };
      var resp = await fetch('https://api.github.com/repos/' + REPO + '/contents/' + STATE_FILE, { headers: headers, cache: 'no-store' });
      if (resp.status === 401) {
        _syncToast(_syncMsg('token401'));
        return;
      }
      if (resp.ok) {
        var data = await resp.json();
        sha = data.sha;
        var remoteState = JSON.parse(decodeURIComponent(escape(atob(data.content))));
        if (remoteState && remoteState.diary) {
          var remoteCount = Object.keys(remoteState.diary).length;
          var localDiary = getJSON('shared-diary', {});
          var merged = mergeDiary(localDiary, remoteState.diary);
          localStorage.setItem('shared-diary', JSON.stringify(merged));
          console.log('[同步] 推送前合并远程 ✓ 本地=' + Object.keys(localDiary).length + ' 远程=' + remoteCount + ' 合并后=' + Object.keys(merged).length);
        }
      }
    } catch (e) {
      console.warn('[同步] 推送前拉取失败，继续推送:', e.message);
    }

    // ── 步骤 2：收集本地状态（含已合并的日记） ──
    var state = collect();

    // ── 步骤 3（已并入步骤 1）：直接复用步骤 1 取得的 sha ──
    var authHeaders = { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' };

    // ── 步骤 4：PUT ──
    var body = {
      message: '🔄 Sync shared state',
      content: btoa(unescape(encodeURIComponent(JSON.stringify(state, null, 2))))
    };
    if (sha) body.sha = sha;

    try {
      var putResp = await fetch('https://api.github.com/repos/' + REPO + '/contents/' + STATE_FILE, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(body)
      });

      if (putResp.ok) {
        localStorage.setItem('shared-last-sync', Date.now());
        _clearError();
        console.log('[同步] 推送成功 ✓');
        updateBadge();
      } else if (putResp.status === 401) {
        _setError(_syncMsg('token401'));
        _syncToast(_syncMsg('token401'));
      } else if (putResp.status === 409 || putResp.status === 422) {
        console.warn('[同步] 冲突 (' + putResp.status + ')，拉取最新后重试...');
        await pull();
        if (n < 2) { setTimeout(function () { push(n + 1); }, 3000); }
        else { _syncToast(_syncMsg('retryFail')); }
      } else {
        console.error('[同步] 意外响应:', putResp.status, putResp.statusText);
        if (n < 2) { setTimeout(function () { push(n + 1); }, 3000); }
        else { _setError(_syncMsg('retryFail')); _syncToast(_syncMsg('retryFail')); }
      }
    } catch (e) {
      console.error('[同步] 网络错误:', e.message);
      _setError(_syncMsg('netError'));
      if (n < 2) { setTimeout(function () { push(n + 1); }, 3000); }
      else { _syncToast(_syncMsg('retryFail')); }
    }
  }

  // ── 从 GitHub 拉取数据 ──
  async function pull(n) {
    n = n || 0;
    var token = typeof getGitHubToken === 'function' ? getGitHubToken() : '';
    if (!token) { console.log('[同步] 无 Token，跳过拉取'); return; }

    var _localBefore = getJSON('shared-diary', {});
    console.log('[同步] 开始拉取 (重试#' + n + ') — 本地日记数:', Object.keys(_localBefore).length);
    var headers = { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github.v3+json' };

    try {
      var resp = await fetch('https://api.github.com/repos/' + REPO + '/contents/' + STATE_FILE, { headers: headers, cache: 'no-store' });
      if (resp.status === 401) {
        _setError(_syncMsg('token401'));
        _syncToast(_syncMsg('token401'));
        return;
      }
      if (!resp.ok) {
        console.warn('[同步] 拉取失败，状态码:', resp.status);
        if (n < 2) { setTimeout(function () { pull(n + 1); }, 3000); return; }
        _setError(_syncMsg('retryFail'));
        _syncToast(_syncMsg('retryFail'));
        return;
      }

      var data = await resp.json();
      var state = JSON.parse(decodeURIComponent(escape(atob(data.content))));

      var diaryCount = state.diary ? Object.keys(state.diary).length : 0;
      console.log('[同步] 拉取成功 ✓ 远程=', diaryCount, '本地=', Object.keys(_localBefore).length);

      // 应用数据到本地（含日记合并）
      apply(state);

      // 对比合并前后的日记数
      var _localAfter = getJSON('shared-diary', {});
      var _afterCount = Object.keys(_localAfter).length;
      var _newCount = _afterCount - Object.keys(_localBefore).length;
      if (_newCount > 0) console.log('[同步] 日记新增:', _newCount, '(合计:', _afterCount, ')');
      else console.log('[同步] 日记无新增 (合计:', _afterCount, ')');

      _clearError();
      localStorage.setItem('shared-last-sync', Date.now());
      console.log('[同步] 已应用 ✓');

      // 触发重渲染
      if (typeof invalidateSDCache === 'function') invalidateSDCache();
      if (typeof renderHug === 'function') renderHug();
      if (typeof renderGratitude === 'function') renderGratitude();
      if (typeof renderSong === 'function') renderSong();
      if (typeof renderCheckin === 'function') renderCheckin();
      if (typeof renderKnowMe === 'function') renderKnowMe();
      if (typeof activeProfile !== 'undefined' && activeProfile === 'barry') {
        if (typeof renderBarrySymptomView === 'function') renderBarrySymptomView();
        if (typeof renderCalendar === 'function') renderCalendar();
        if (typeof renderTips === 'function') renderTips();
      }
      if (typeof renderSharedDiary === 'function') renderSharedDiary();
      if (typeof renderDateStrip === 'function') renderDateStrip();
      updateBadge();
    } catch (e) {
      console.error('[同步] 拉取异常:', e.message);
      _setError(_syncMsg('netError'));
      if (n < 2) { setTimeout(function () { pull(n + 1); }, 3000); }
      else { _syncToast(_syncMsg('retryFail')); }
    }
  }

  // ── 同步状态徽章 ──
  function updateBadge() {
    var hasToken = !!getGitHubToken();
    var lastSync = localStorage.getItem('shared-last-sync');
    var el = document.getElementById('syncStatusBadge');
    if (!el) return;
    // 优先显示持久化错误状态
    if (_lastError) {
      el.textContent = '🔴 ' + _lastError.replace(/^[^ ]* /, '');
      el.style.color = '#E53935';
      return;
    }
    if (!hasToken) {
      el.textContent = '⚪ ' + (window.lang === 'sr' ? 'Nije podešeno' : window.lang === 'en' ? 'Not configured' : '未设置');
      el.style.color = 'var(--text-muted)';
      return;
    }
    if (lastSync) {
      var seconds = Math.floor((Date.now() - parseInt(lastSync)) / 1000);
      var ago;
      if (seconds < 30) ago = window.lang === 'sr' ? 'upravo' : window.lang === 'en' ? 'just now' : '刚刚';
      else if (seconds < 120) ago = (window.lang === 'sr' ? 'pre 1 min' : window.lang === 'en' ? '1 min ago' : '1分钟前');
      else if (seconds < 3600) ago = Math.floor(seconds / 60) + (window.lang === 'sr' ? ' min' : window.lang === 'en' ? ' min ago' : '分钟前');
      else ago = Math.floor(seconds / 3600) + (window.lang === 'sr' ? ' h' : window.lang === 'en' ? ' h ago' : '小时前');
      el.textContent = '🟢 ' + (window.lang === 'sr' ? 'Sinhronizovano ' : 'Synced ') + ago;
      el.style.color = 'var(--sage)';
    } else {
      el.textContent = '🟡 ' + (window.lang === 'sr' ? 'Čeka se sinhronizacija...' : window.lang === 'en' ? 'Waiting for sync...' : '等待同步...');
      el.style.color = 'var(--gold)';
    }
  }

  // ── 公开 API ──
  return {
    init: function () {
      // Hook saveSharedDiaryData: 保存日记后自动推送
      var orig = window.saveSharedDiaryData;
      if (typeof orig === 'function') {
        window.saveSharedDiaryData = function (data) {
          orig(data);
          push();
        };
      }

      // 定时自动拉取（每 60 秒，句柄可清理）
      _startAutoPull();

      updateBadge();
      console.log('[同步] 模块已初始化 ✓');
    },
    push: push,
    pull: pull,
    collect: collect,
    apply: apply,
    updateBadge: updateBadge,
    stopAutoPull: _stopAutoPull,
    startAutoPull: _startAutoPull
  };
})();

// ── 暴露全局接口 ──
updateSyncStatusBadge = SyncModule.updateBadge;
pushAllSharedData = SyncModule.push;
pullAllSharedData = SyncModule.pull;
collectSharedState = SyncModule.collect;
applySharedState = SyncModule.apply;

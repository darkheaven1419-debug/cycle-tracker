const SyncModule = (function () {
  var _lastError = null; // 持久化同步错误状态

  // ── Phase 2A/2C：Pull 与 Push 都走 Worker（私有数据仓库） ──
  // 仓库名/文件路径是 Worker 里的字面量，前端只发路径，不带任何 repo/path 参数。
  // 浏览器不再持有、也不再用任何 GitHub API 地址 —— 共享数据的读写只有这一条链路。
  var WORKER_URL = 'https://cycle-tracker-data.cycletracker-barry.workers.dev';
  // 与旧 gh-token 明确分开的一把钥匙。只存 localStorage，绝不进 URL / Git / 源码 / 日志
  var APP_KEY_STORAGE = 'ct-app-key';
  // 最近一次拉取到的远端 sha（Worker 信封里的 sha）——为后续阶段的 CAS 推送保留
  var _lastSha = null;

  // ── 自动拉取定时器（句柄可清理，页面隐藏时暂停） ──
  var _autoPullTimer = null;
  var _visHandler = null;

  function _startAutoPull() {
    _stopAutoPull();
    _autoPullTimer = setInterval(function () {
      // Phase 2B：定时拉取只看 Pull 凭据（App Secret），不再看 Push 用的 GitHub PAT
      if (typeof getAppSecret === 'function' && getAppSecret()) {
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
    // 同时移除可见性监听，避免登出后页面切回可见时被 _visHandler 重新拉起轮询
    if (_visHandler && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', _visHandler);
      _visHandler = null;
    }
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

  /**
   * 读取本机的 app secret。Phase 2C 起这是共享数据（Pull 与 Push）唯一的凭据，
   * 与旧的 GitHub PAT 完全无关。
   * 只做 trim —— 值本身绝不写日志、绝不进 URL。
   */
  function getAppSecret() {
    try {
      var key = localStorage.getItem(APP_KEY_STORAGE);
      return key ? String(key).trim() : '';
    } catch (e) { return ''; }
  }

  /** 最近一次 Worker 拉取拿到的 sha；没有就是 null。 */
  function getLastSha() { return _lastSha; }

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
      gratitudeEcho: getJSON('shared-gratitude-echo', []),
      dailyQ: getJSON('shared-daily-q', []),
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

  // ── 通用 append-only 合并 ──
  function _asArray(v) { return Array.isArray(v) ? v : []; }

  /**
   * 两个 append-only 数组按 key 取并集。
   *
   * - 先收本地条目，再收远端中 key 未出现过的条目 —— 双方近同时提交时得到并集
   * - 同一 key 冲突时取 timeOf 更大的那条。不用"本地优先"：那会让两台设备各自
   *   坚持自己的版本、永久发散；按时间取新是确定性的，两端收敛到同一结果
   * - 结果按 timeOf 升序（稳定排序），cap 给定时裁到最近 cap 条
   */
  function mergeByTimeKey(local, remote, keyOf, timeOf, cap) {
    var out = [];
    var at = Object.create(null); // 无原型，避免 key 撞上 constructor 等内建属性
    function add(entry) {
      if (!entry || typeof entry !== 'object') return;
      var k = keyOf(entry);
      var i = at[k];
      if (i === undefined) { at[k] = out.length; out.push(entry); return; }
      if (timeOf(entry) > timeOf(out[i])) out[i] = entry;
    }
    _asArray(local).forEach(add);
    _asArray(remote).forEach(add);
    out.sort(function (a, b) { return timeOf(a) - timeOf(b); });
    if (cap && out.length > cap) out = out.slice(-cap);
    return out;
  }

  // ── 感恩便签：按 (from,time) 取并集，沿用本地 slice(-20) 的窗口 ──
  var GRAT_CAP = 20;

  function _gratKey(note) {
    var t = note.time;
    if (typeof t === 'number' && isFinite(t)) return String(note.from) + '|' + t;
    // 旧数据兜底：没有可用时间戳的条目按 (from,text) 去重，只合并、绝不丢弃
    return 'legacy|' + String(note.from) + '|' + String(note.text);
  }
  function _gratTime(note) {
    return (typeof note.time === 'number' && isFinite(note.time)) ? note.time : 0;
  }

  function mergeGratitude(local, remote) {
    return mergeByTimeKey(local, remote, _gratKey, _gratTime, GRAT_CAP);
  }

  // ── Echo：感恩便签上的 emoji 回应，独立 append-only，不污染 gratitude 条目 ──
  // 存储键 shared-gratitude-echo，字段 {noteFrom, noteTime, from, emoji, time}
  var ECHO_CAP = 500; // 单文件 JSON 的体积护栏；两个人正常使用远达不到

  /** noteFrom+noteTime 指向被回应的便签，from 是回应者：一人一条，天然幂等 */
  function _echoKey(e) { return String(e.noteFrom) + '|' + e.noteTime + '|' + String(e.from); }
  function _echoTime(e) {
    return (typeof e.time === 'number' && isFinite(e.time)) ? e.time : 0;
  }

  function mergeEcho(local, remote) {
    return mergeByTimeKey(local, remote, _echoKey, _echoTime, ECHO_CAP);
  }

  // ── Daily Question：两人各自对「今天这道题」的回答，独立 append-only ──
  // 存储键 shared-daily-q，字段 {qKey, from, answer, time}
  var DAILY_Q_CAP = 500; // 与 Echo 同样的体积护栏

  /**
   * qKey 必须与语言和时区都无关，否则两个人永远对不上同一道题：
   * 用「epoch 天数 + 题库下标」（module-dashboard.js 的 getDailyQuestion 用同一算法），
   * 同一时刻两人算出同一个值。以后改题库文案也不影响历史记录的身份。
   * from 一起进 key —— 每人对每道题只保留一条回答，改答案就是覆盖自己那条。
   */
  function _dqKey(e) { return String(e.qKey) + '|' + String(e.from); }
  function _dqTime(e) {
    return (typeof e.time === 'number' && isFinite(e.time)) ? e.time : 0;
  }

  function mergeDailyQ(local, remote) {
    return mergeByTimeKey(local, remote, _dqKey, _dqTime, DAILY_Q_CAP);
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

    // 感恩便签：合并而非覆盖 —— 拉取不能抹掉本机刚写、对方还没有的内容
    if (state.gratitude) {
      var localGrat = _asArray(getJSON('shared-gratitude', []));
      var mergedGrat = mergeGratitude(localGrat, state.gratitude);
      localStorage.setItem('shared-gratitude', JSON.stringify(mergedGrat));
      console.log('[同步] 感恩便签合并 本地=' + localGrat.length + ' 远程=' + _asArray(state.gratitude).length + ' 合并后=' + mergedGrat.length);
    }

    // Echo：独立 append-only，取并集
    if (state.gratitudeEcho) {
      var localEcho = _asArray(getJSON('shared-gratitude-echo', []));
      var mergedEcho = mergeEcho(localEcho, state.gratitudeEcho);
      localStorage.setItem('shared-gratitude-echo', JSON.stringify(mergedEcho));
      console.log('[同步] Echo 合并 本地=' + localEcho.length + ' 远程=' + _asArray(state.gratitudeEcho).length + ' 合并后=' + mergedEcho.length);
      // §3：对方的回应也算「她给我留了东西」，拉取后要让提示立即反映出来。
      // _initTodayWindow() 的窗口在整个会话内是固定的，所以这里不会因为
      // 「拉取时刚好重算了窗口」而把新内容吃掉。
      if (typeof renderTogetherNew === 'function') renderTogetherNew();
    }

    // Daily Question 回答：独立 append-only，取并集 —— 两人各留自己那条
    if (state.dailyQ) {
      var localDQ = _asArray(getJSON('shared-daily-q', []));
      var mergedDQ = mergeDailyQ(localDQ, state.dailyQ);
      localStorage.setItem('shared-daily-q', JSON.stringify(mergedDQ));
      console.log('[同步] Daily Question 合并 本地=' + localDQ.length + ' 远程=' + _asArray(state.dailyQ).length + ' 合并后=' + mergedDQ.length);
      // renderTogether() only runs when the Together tab is entered, so without
      // this a pull that lands while the app is open leaves the card showing the
      // pre-pull state until the user navigates away and back.
      if (typeof renderDailyQ === 'function') renderDailyQ();
    }

    // 其他数据：直接替换
    if (state.symptoms) localStorage.setItem('shared-symptoms', JSON.stringify(state.symptoms));
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
      token401: { 'zh-CN': '⚠️ 数据同步密钥无效，请在设置中重新输入', en: '⚠️ Data sync key invalid, please re-enter in Settings', sr: '⚠️ Ključ za sinhronizaciju je nevažeći — unesite ponovo u Podešavanjima' },
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

  // ── Phase 2C：把远程快照里的先写内容并进本地 ──
  // 推送前必须先取并集：本机推送不能抹掉对方刚写的日记 / 便签 / 刚产生的回应。
  // 迁移前这段逻辑内联在 push() 的 GET 分支里；现在「推送前的 GET」与「409 冲突重试」
  // 共用同一份实现，保证两条路径的合并语义严格一致。
  function _mergeRemoteIntoLocal(remoteState) {
    if (!remoteState || typeof remoteState !== 'object') return;
    if (remoteState.diary) {
      var remoteCount = Object.keys(remoteState.diary).length;
      var localDiary = getJSON('shared-diary', {});
      var merged = mergeDiary(localDiary, remoteState.diary);
      localStorage.setItem('shared-diary', JSON.stringify(merged));
      console.log('[同步] 推送前合并远程 ✓ 本地=' + Object.keys(localDiary).length + ' 远程=' + remoteCount + ' 合并后=' + Object.keys(merged).length);
    }
    if (remoteState.gratitude) {
      var lg = _asArray(getJSON('shared-gratitude', []));
      var mg = mergeGratitude(lg, remoteState.gratitude);
      localStorage.setItem('shared-gratitude', JSON.stringify(mg));
      console.log('[同步] 推送前合并感恩便签 本地=' + lg.length + ' 远程=' + _asArray(remoteState.gratitude).length + ' 合并后=' + mg.length);
    }
    if (remoteState.gratitudeEcho) {
      var le = _asArray(getJSON('shared-gratitude-echo', []));
      var me = mergeEcho(le, remoteState.gratitudeEcho);
      localStorage.setItem('shared-gratitude-echo', JSON.stringify(me));
      console.log('[同步] 推送前合并 Echo 本地=' + le.length + ' 远程=' + _asArray(remoteState.gratitudeEcho).length + ' 合并后=' + me.length);
    }
    if (remoteState.dailyQ) {
      var ldq = _asArray(getJSON('shared-daily-q', []));
      var mdq = mergeDailyQ(ldq, remoteState.dailyQ);
      localStorage.setItem('shared-daily-q', JSON.stringify(mdq));
      console.log('[同步] 推送前合并 Daily Question 本地=' + ldq.length + ' 远程=' + _asArray(remoteState.dailyQ).length + ' 合并后=' + mdq.length);
    }
  }

  // ── PUT /state 并处理全部响应分支（含 409 CAS 冲突重试） ──
  // 409 时 Worker 的信封里直接带回最新 sha 与最新 state：用它合并后重发，
  // 不再额外发 GET，也不会覆盖掉对方刚写入的数据。重试上限仍是 3 次（n=0,1,2）。
  async function _putState(state, baseSha, n) {
    var secret = getAppSecret();
    if (!secret) return;
    var headers = {
      Authorization: 'Bearer ' + secret,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
    try {
      var putResp = await fetch(WORKER_URL + '/state', {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({ baseSha: baseSha || null, state: state })
      });

      if (putResp.ok) {
        localStorage.setItem('shared-last-sync', Date.now());
        _clearError();
        console.log('[同步] 推送成功 ✓');
        updateBadge();
      } else if (putResp.status === 401) {
        _setError(_syncMsg('token401'));
        _syncToast(_syncMsg('token401'));
      } else if (putResp.status === 409) {
        console.warn('[同步] 版本冲突 (409)，用返回的最新快照合并后重试...');
        var latest = null;
        try { latest = await putResp.json(); } catch (e) { latest = null; }
        if (latest && typeof latest === 'object') {
          _mergeRemoteIntoLocal(latest.state);
          if (n < 2) {
            // 直接复用 409 信封里的 sha 重发（不再 GET）
            setTimeout(function () { _putState(collect(), latest.sha || null, n + 1); }, 3000);
            return;
          }
        }
        if (n < 2) { setTimeout(function () { push(n + 1); }, 3000); }
        else { _setError(_syncMsg('retryFail')); _syncToast(_syncMsg('retryFail')); }
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

  // ── 推送数据到 Worker（Phase 2C：私有数据仓库 + CAS，凭据 = App Secret） ──
  // 全流程不访问 api.github.com，也不存在任何 GitHub 回退路径：
  // Worker 不可用时保留本地数据、走既有重试，最终如实报告同步失败。
  async function push(n) {
    n = n || 0;
    var secret = typeof getAppSecret === 'function' ? getAppSecret() : '';
    if (!secret) { console.log('[同步] 无 App Secret，跳过推送'); return; }

    var _localBefore = getJSON('shared-diary', {});
    console.log('[同步] 开始推送 (重试#' + n + ') — 本地日记数:', Object.keys(_localBefore).length);

    // ── 步骤 1：GET Worker /state —— 一次请求取得 baseSha，并把远程 diary/gratitude/echo 先并进本地 ──
    var baseSha = null;
    try {
      var headers = { Authorization: 'Bearer ' + secret, Accept: 'application/json' };
      var resp = await fetch(WORKER_URL + '/state', { headers: headers, cache: 'no-store' });
      if (resp.status === 401) {
        _syncToast(_syncMsg('token401'));
        return;
      }
      if (resp.ok) {
        var env = await resp.json();
        if (env && typeof env === 'object') {
          baseSha = env.sha || null;
          _mergeRemoteIntoLocal(env.state);
        }
      } else {
        console.warn('[同步] 推送前读取失败 (' + resp.status + ')，仍尝试推送');
      }
    } catch (e) {
      console.warn('[同步] 推送前拉取失败，继续推送:', e.message);
    }

    // ── 步骤 2：收集本地状态（含已并入的远程内容） ──
    var state = collect();

    // ── 步骤 3：PUT Worker /state（baseSha = 步骤 1 取得的 sha） ──
    await _putState(state, baseSha, n);
  }

  // ── 从 Worker 拉取数据（Phase 2A：Pull 已迁移；Push 仍在旧 GitHub 链路） ──
  async function pull(n) {
    n = n || 0;
    var secret = getAppSecret();
    if (!secret) { console.log('[同步] 无 App Secret，跳过拉取'); return; }

    var _localBefore = getJSON('shared-diary', {});
    console.log('[同步] 开始拉取 (重试#' + n + ') — 本地日记数:', Object.keys(_localBefore).length);
    var headers = { Authorization: 'Bearer ' + secret, Accept: 'application/json' };

    try {
      var resp = await fetch(WORKER_URL + '/state', { headers: headers, cache: 'no-store' });
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
      // Worker 返回 { sha, state } 信封，不是 state 本身 —— 必须先拆封再交给 apply()
      if (!data || typeof data !== 'object' || !('state' in data)) {
        console.warn('[同步] 拉取响应不是 Worker 信封，已忽略');
        if (n < 2) { setTimeout(function () { pull(n + 1); }, 3000); return; }
        _setError(_syncMsg('retryFail'));
        _syncToast(_syncMsg('retryFail'));
        return;
      }
      _lastSha = data.sha || null;
      var state = data.state;

      var diaryCount = (state && state.diary) ? Object.keys(state.diary).length : 0;
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
      // Today card — refreshed without replaying the entrance animation.
      if (typeof renderDashboard === 'function') renderDashboard(false);
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
    // Phase 2B：徽章反映「Pull 能否运行」，因此以 App Secret 为准；
    // Push 用的 GitHub PAT 与此无关，不能拿它当同步是否可用的依据。
    var hasToken = !!getAppSecret();
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
    // Phase 2A：Pull 用的 Worker 地址 / app secret 读取，供 tests/test-sync-merge.js 断言
    workerUrl: WORKER_URL,
    appKeyStorage: APP_KEY_STORAGE,
    getAppSecret: getAppSecret,
    getLastSha: getLastSha,
    // 合并规则单独暴露，供 tests/test-sync-merge.js 直接做单元测试（与 apply/collect 同理）
    mergeByTimeKey: mergeByTimeKey,
    mergeGratitude: mergeGratitude,
    mergeEcho: mergeEcho,
    mergeDailyQ: mergeDailyQ,
    updateBadge: updateBadge,
    stopAutoPull: _stopAutoPull,
    startAutoPull: _startAutoPull
  };
})();

// ── 暴露全局接口 ──
// Phase 2C：共享数据（Pull 与 Push）统一使用一把凭据 ——
//   App Secret（localStorage['ct-app-key']，Worker 身份，Phase 2A/2B/2C 全部迁移完成）
// GitHub PAT 不再是这条链路上的凭据，也不再参与任何同步决策。
getAppSecret = SyncModule.getAppSecret;
updateSyncStatusBadge = SyncModule.updateBadge;
pushAllSharedData = SyncModule.push;
pullAllSharedData = SyncModule.pull;
collectSharedState = SyncModule.collect;
applySharedState = SyncModule.apply;

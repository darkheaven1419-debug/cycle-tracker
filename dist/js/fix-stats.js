"use strict";
(function () {
  console.log('[fix-stats] 已加载');

  // ── 数据初始化：默认经期记录 —— Phase 1.9 已移除 ──
  // 这里原本有一个 IIFE：当 state.records.length < 2 时，向 state 注入两条硬编码的
  // 2026 年记录（05-28 / 06-24）、补上对应的 periodEnds，然后调用 saveState()。
  // 它的危害不在「补了个默认值」，而在写入路径：saveState() 会把 records 写进
  // shared-cycle-data，并在 1500ms 后触发 pushAllSharedData() —— 一次普通页面加载
  // 就能把两条用户从未输入过的周期记录同步给对方。周期是健康数据，这条路径等于
  // 让应用替用户捏造生理事实。
  //
  // 移除规则（Phase 1.9 §二）：任何自动修复逻辑都不得在用户没有明确输入的情况下
  // 向 shared state 写入周期记录。不存在「自动猜测经期」这种功能。
  //
  // 移除只阻止未来注入：设备 localStorage 与 shared-cycle-data 里已有的记录保持原样，
  // 不回滚、不清理。空状态由各渲染层自行处理（空日历 / 空图表），不靠造数据。

  // ── 进度条修复 ──
  (function(){
  window.animateProgressBar = function(el, pct) {
    if (!el) return;
    pct = Math.min(100, Math.max(0, pct));
    el.style.width = pct + '%';
    el.style.transition = 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
    if (pct > 0 && pct < 2) el.style.minWidth = '2px';
    else el.style.minWidth = '';
  };

  function _fixProgressBar() {
    var fillEl = document.getElementById('pg-fill');
    var numEl = document.getElementById('pg-num');
    var subEl = document.getElementById('pg-sub');
    var badgeEl = document.getElementById('pg-badge');
    if (!fillEl) return;
    if (typeof window.state === 'undefined' || typeof predict !== 'function') return;

    try {
      var pred = predict();
      var td = typeof today === 'function' ? today() : new Date();
      var hasRecords = window.state.records && window.state.records.length > 0;

      if (!hasRecords) {
        fillEl.style.width = '0%';
        fillEl.style.background = 'var(--border, #ddd)';
        if (numEl) numEl.textContent = '--';
        if (subEl) subEl.textContent = '';
        if (badgeEl) { badgeEl.textContent = ''; badgeEl.className = 'phase-badge'; }
        console.log('[进度条] 无数据，宽度=0%');
        return;
      }

      var phase = typeof getPhase === 'function' ? getPhase(td, pred) : null;
      var pct = 0, color = 'var(--border, #ddd)', label = '';

      if (phase === 'period-on' || phase === 'period-mid') {
        var cur = window.state.records.find(function(r) {
          var s = typeof d0 === 'function' ? d0(r) : r;
          var e = typeof getPeriodEndDate === 'function' ? (getPeriodEndDate(r) || typeof addDays === 'function' ? addDays(s, (pred.periodLen || 7) - 1) : new Date(s.getTime() + 6*86400000)) : new Date(s.getTime() + 6*86400000);
          return td >= s && td <= e;
        });
        if (cur) {
          var dayNum = typeof daysDiff === 'function' ? daysDiff(typeof d0 === 'function' ? d0(cur) : cur, td) + 1 : 1;
          var actualLen = pred.periodLen || 7;
          pct = (dayNum / actualLen) * 15;
          if (pct > 15) pct = 15;
          color = 'var(--love, #c45a6b)';
          label = typeof t === 'function' ? t('phaseBadges').period : '';
        }
      } else if (pred.isOverdue) {
        pct = 100;
        color = '#E65100';
        label = typeof t === 'function' ? t('phaseBadges').late : '';
      } else {
        var totalLen = pred.nextStart && pred.lastStart ? Math.round((pred.nextStart - pred.lastStart) / 86400000) : (pred.cycleLen || 28);
        var elapsed = pred.lastStart ? Math.round((td - pred.lastStart) / 86400000) : 0;
        pct = Math.min(100, Math.max(0, (elapsed / totalLen) * 100));
        if (phase === 'luteal' || phase === 'fertile') { color = 'var(--lavender, #b8a0c8)'; label = ''; }
        else if (phase === 'follicular') { color = 'var(--sage, #5e8b7a)'; label = ''; }
        else if (phase === 'ovulation') { color = 'var(--teal, #80a590)'; label = ''; }
        else { color = 'var(--love, #c45a6b)'; }
      }

      fillEl.style.width = pct + '%';
      fillEl.style.background = color;
      fillEl.style.transition = 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
      if (badgeEl) badgeEl.style.background = color;

      console.log('[进度条] 宽度=' + Math.round(pct) + '% 颜色=' + color + ' 阶段=' + (phase || 'none'));
    } catch(e) {
      console.warn('[进度条] 计算失败:', e.message);
    }
  }

  var _rc = window.renderCalendar;
  if (typeof _rc === 'function') {
    window.renderCalendar = function() {
      _rc.apply(this, arguments);
      setTimeout(_fixProgressBar, 200);
    };
  }
  var _aa = window.applyAllUI;
  if (typeof _aa === 'function') {
    window.applyAllUI = function(w) {
      _aa(w);
      setTimeout(_fixProgressBar, 200);
    };
  }
  var _tp = window.togglePeriodRecord;
  if (typeof _tp === 'function') {
    window.togglePeriodRecord = function(s, e) {
      _tp(s, e);
      setTimeout(_fixProgressBar, 300);
    };
  }
  setTimeout(_fixProgressBar, 500);
  setTimeout(_fixProgressBar, 1500);
  setTimeout(_fixProgressBar, 3000);
  console.log('[进度条] 修复已加载');
  })();

  // ── 统计面板：图表渲染修复 ──
  (function(){
  var _origRC = window._renderCharts;
  if (typeof _origRC === 'function') {
    window._renderCharts = function(pred, td, clen) {
      _origRC(pred, td, clen);
      try {
        var tc = document.getElementById('chartCycleTrend');
        var te = document.getElementById('chartCycleEmpty');
        if (!tc) return;
        var hasData = window.state && window.state.records && window.state.records.length >= 2;
        var chartHidden = te && te.style.display !== 'none';
        if (hasData && chartHidden && typeof ChartRenderer !== 'undefined') {
          var sorted = window.state.records.slice().sort(function(a,b){return new Date(a) - new Date(b);});
          var diffs = [];
          for (var i = 1; i < sorted.length; i++) {
            diffs.push(Math.round((new Date(sorted[i]) - new Date(sorted[i-1])) / 86400000));
          }
          if (diffs.length > 0) {
            var lbs = [];
            var L = window.lang || 'sr';
            for (var j = 0; j < diffs.length; j++) {
              lbs.push(L === 'zh-CN' ? '周期' + (j+1) : 'C' + (j+1));
            }
            var avg = diffs.length > 1 ? Math.round(diffs.reduce(function(s,v){return s+v;},0) / diffs.length) : diffs[0];
            if (te) { te.style.display = 'none'; }
            if (tc.parentElement) tc.parentElement.style.display = '';
            ChartRenderer.drawLineChart(tc, diffs, lbs, { width: 500, height: 200, avgLine: avg, avgLabel: L === 'zh-CN' ? '均值' : L === 'en' ? 'Avg' : 'Prosek', emptyText: '' });
            var note = document.getElementById('chartCycleNote');
            if (!note) {
              note = document.createElement('div');
              note.id = 'chartCycleNote';
              note.style.cssText = 'text-align:center;font-size:.7rem;color:var(--text-muted);margin-top:6px';
              tc.closest('.chart-card').appendChild(note);
            }
            if (diffs.length === 1) {
              note.textContent = L === 'zh-CN' ? '当前仅有 2 次记录，趋势将随更多记录逐渐清晰' : L === 'en' ? 'Only 2 records, trend will become clearer' : 'Samo 2 zapisa, trend će postati jasniji';
            } else { note.textContent = ''; }
          }
        }
      } catch(e) {}
    };
  } else {
    var _chartRetry = 0;
    var _chartTimer = setInterval(function() {
      _chartRetry++;
      if (typeof window._renderCharts === 'function') {
        clearInterval(_chartTimer);
        var _oc2 = window._renderCharts;
        window._renderCharts = function(pred, td, clen) {
          _oc2(pred, td, clen);
          try {
            var tc2 = document.getElementById('chartCycleTrend');
            var te2 = document.getElementById('chartCycleEmpty');
            if (!tc2) return;
            var hasData2 = window.state && window.state.records && window.state.records.length >= 2;
            var chartHidden2 = te2 && te2.style.display !== 'none';
            if (hasData2 && chartHidden2 && typeof ChartRenderer !== 'undefined') {
              var sorted2 = window.state.records.slice().sort(function(a,b){return new Date(a)-new Date(b);});
              var diffs2 = [];
              for (var i2 = 1; i2 < sorted2.length; i2++) {
                diffs2.push(Math.round((new Date(sorted2[i2])-new Date(sorted2[i2-1]))/86400000));
              }
              if (diffs2.length > 0) {
                var lbs2 = [], L2 = window.lang||'sr';
                for (var j2 = 0; j2 < diffs2.length; j2++) lbs2.push(L2==='zh-CN'?'周期'+(j2+1):'C'+(j2+1));
                var avg2 = diffs2.length>1 ? Math.round(diffs2.reduce(function(s,v){return s+v;},0)/diffs2.length) : diffs2[0];
                if (te2) te2.style.display = 'none';
                if (tc2.parentElement) tc2.parentElement.style.display = '';
                ChartRenderer.drawLineChart(tc2, diffs2, lbs2, {width:500,height:200,avgLine:avg2,avgLabel:L2==='zh-CN'?'均值':L2==='en'?'Avg':'Prosek',emptyText:''});
              }
            }
          } catch(e) {}
        };
      }
      if (_chartRetry > 100) clearInterval(_chartTimer);
    }, 100);
  }
  })();

  // ── 双人共享 Todo List ──
  (function () {
    // Phase 2C-2：这里不再有 TODO_REPO / TODO_FILE —— 仓库名与文件路径都是 Worker 里的
    // 字面量，浏览器只发 /todo 这个路径，既不持有也不需要知道它们。

    // ── 初始化：确保 localStorage 中有空数组 ──
    function _initData() {
      var raw = localStorage.getItem('shared-todolist');
      if (raw === null || raw === undefined || raw === 'null' || raw === 'undefined') {
        localStorage.setItem('shared-todolist', '[]');
      }
      try {
        var parsed = JSON.parse(localStorage.getItem('shared-todolist') || '[]');
        if (!Array.isArray(parsed)) {
          localStorage.setItem('shared-todolist', '[]');
          parsed = [];
        }
        if (typeof window.state !== 'undefined') {
          window.state.todoList = parsed;
        }
      } catch (e) {
        localStorage.setItem('shared-todolist', '[]');
        if (typeof window.state !== 'undefined') {
          window.state.todoList = [];
        }
      }
    }
    _initData();

    function _tl(key) {
      var l = window.lang || 'sr';
      var m = {
        title:        {'zh-CN':'📋 我们的清单','en':'📋 Our Todo List','sr':'📋 Naša lista'},
        ph:           {'zh-CN':'想一起做什么？','en':'What do we want to do together?','sr':'Šta želimo da radimo zajedno?'},
        add:          {'zh-CN':'添加','en':'Add','sr':'Dodaj'},
        all:          {'zh-CN':'全部','en':'All','sr':'Sve'},
        active:       {'zh-CN':'⏳ 未完成','en':'⏳ Active','sr':'⏳ Aktivno'},
        done:         {'zh-CN':'✅ 已完成','en':'✅ Done','sr':'✅ Završeno'},
        empty:        {'zh-CN':'还没有事项 ✨','en':'No items yet ✨','sr':'Još nema stavki ✨'},
        noMatch:      {'zh-CN':'没有匹配的事项','en':'No matching items','sr':'Nema odgovarajućih'},
        doneBy:       {'zh-CN':'已完成','en':'Done by','sr':'Završio/la'},
      };
      return (m[key] && m[key][l]) || m[key]['zh-CN'] || '';
    }

    function _uid(u) { return u === 'barry' ? '👦 Barry' : '👧 Anđela'; }
    function _esc(s) { var d = document.createElement('div'); d.appendChild(document.createTextNode(s||'')); return d.innerHTML; }
    function _gid() { return Date.now().toString(36) + Math.random().toString(36).substr(2,4); }
    function _td(d) { if (!d) d = new Date(); return typeof d==='string' ? d.slice(0,10) : d.getFullYear()+'-'+(d.getMonth()+1).toString().padStart(2,'0')+'-'+d.getDate().toString().padStart(2,'0'); }

    function _save() {
      if (typeof window.state === 'undefined') return;
      localStorage.setItem('shared-todolist', JSON.stringify(window.state.todoList||[]));
      if (typeof saveState === 'function') saveState();
    }

    function _addTodo(text) {
      if (!text||!text.trim()) return;
      if (typeof window.state === 'undefined') return;
      if (!window.state.todoList) window.state.todoList=[];
      window.state.todoList.push({ id:_gid(), text:text.trim(), author:(typeof activeProfile!=='undefined'?activeProfile:'andjela'), createdAt:_td(new Date()), completed:false, completedBy:null, completedAt:null });
      _save(); _render(); _pushTodo();
    }

    function _toggleTodo(id) {
      if (typeof window.state === 'undefined') return;
      for (var i=0;i<window.state.todoList.length;i++) {
        if (window.state.todoList[i].id===id) {
          var t=window.state.todoList[i];
          if (t.completed) { t.completed=false; t.completedBy=null; t.completedAt=null; }
          else { t.completed=true; t.completedBy=(typeof activeProfile!=='undefined'?activeProfile:'andjela'); t.completedAt=_td(new Date()); }
          _save(); _render(); _pushTodo();
          return;
        }
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // Todo 合并规则（Phase 2C-2）—— 先写清楚，再实现
    //
    // 数据模型：一个条目必是二者之一
    //   活条目 { id, text, author, createdAt, completed, completedBy, completedAt }
    //   墓碑   { id, deleted:true, deletedAt, deletedBy }
    //
    // 从现有代码推出的事实（是既有行为，不是新设计）：
    //   F1 id 由 _gid() 在创建时生成一次，全项目没有任何地方改写 id。
    //   F2 text / author / createdAt 只在 _addTodo 里写。没有任何编辑入口
    //      （_toggleTodo 只动完成三元组，_deleteTodo 只删除），所以同一个 id 的
    //      两个副本，这三个字段必然相同。
    //   F3 completed / completedBy / completedAt 是唯一可变字段，只由 _toggleTodo 改。
    //
    // 规则：
    //   R1 id 不同 → 取并集，两边都留。
    //   R2 同 id，两边都不是墓碑：
    //      R2a 一边完成一边未完成 → 完成的一方胜（沿用旧 _pullTodo 的
    //          “远程完成能同步到本地”），completedBy / completedAt 取完成方。
    //      R2b 都完成 → completedAt 较大者胜；相同则 completedBy 字典序较大者胜。
    //      R2c 都未完成 → 按 F2 两边字段本来就相同，任取；万一 id 撞车（F2 被打破），
    //          按 createdAt → author → text 字典序取较大者。
    //   R3 同 id，一边是墓碑 → 删除胜，结果是墓碑。删除因此可以传播。
    //   R4 两边都是墓碑 → deletedAt 较大者胜，相同则 deletedBy 较大者胜。
    //   R5 合并结果按 id 升序排序：同样的输入永远得到逐字节相同的输出，
    //      既让重复拉取/推送不产生重复条目，也避免 CAS 因为数组顺序抖动反复冲突。
    //   R6 墓碑不参与渲染（_render 过滤掉），但保留在 shared-todolist 和 PUT 载荷里
    //      —— 它本身就是传播给对方的删除信号。
    //
    // R1–R5 全是全序、可交换且可结合的，所以结果与合并顺序无关，409 重试一定收敛
    // 而不是来回打架。不引入向量时钟，不引入 CRDT。
    //
    // 已知取舍：墓碑只增不删。2C 不做墓碑回收——那是策略问题，不是合并正确性问题。
    // ════════════════════════════════════════════════════════════════════════

    /** 字典序比较；null / undefined 视为最小。返回 -1 / 0 / 1。 */
    function _cmp(a, b, k) {
      var x = a[k], y = b[k];
      if (x === y) return 0;
      if (x === null || x === undefined) return -1;
      if (y === null || y === undefined) return 1;
      return x < y ? -1 : 1;
    }

    /** 最后兜底：createdAt → author → text，保证 _todoPick 是全序的。 */
    function _todoTotals(a, b) {
      var c = _cmp(a, b, 'createdAt'); if (c !== 0) return c > 0 ? a : b;
      c = _cmp(a, b, 'author'); if (c !== 0) return c > 0 ? a : b;
      c = _cmp(a, b, 'text'); if (c !== 0) return c > 0 ? a : b;
      return a;
    }

    /** 先比 k1 再比 k2，最后走 _todoTotals。 */
    function _todoLater(a, b, k1, k2) {
      var c = _cmp(a, b, k1); if (c !== 0) return c > 0 ? a : b;
      c = _cmp(a, b, k2); if (c !== 0) return c > 0 ? a : b;
      return _todoTotals(a, b);
    }

    /** 同一个 id 的两个副本取确定性胜者（R2 / R3 / R4）。 */
    function _todoPick(a, b) {
      if (a.deleted && b.deleted) return _todoLater(a, b, 'deletedAt', 'deletedBy');
      if (a.deleted) return a;
      if (b.deleted) return b;
      if (!!a.completed !== !!b.completed) return a.completed ? a : b;
      if (a.completed) return _todoLater(a, b, 'completedAt', 'completedBy');
      return _todoTotals(a, b);
    }

    /** 按 id 合并两个数组（R1 + R5）。纯函数，不改参数。 */
    function _todoMerge(local, remote) {
      var byId = {};
      function put(rec) {
        if (!rec || !rec.id) return;
        var cur = byId[rec.id];
        byId[rec.id] = cur ? _todoPick(cur, rec) : rec;
      }
      (local || []).forEach(put);
      (remote || []).forEach(put);
      return Object.keys(byId).map(function (k) { return byId[k]; }).sort(function (a, b) {
        return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
      });
    }

    function _todoList() {
      return (typeof window.state !== 'undefined' && window.state.todoList) || [];
    }

    /** Phase 2C：Worker 地址只在 sync.js 有一处出处，这里不复制字面量。 */
    function _workerUrl() {
      return (typeof SyncModule !== 'undefined' && SyncModule.workerUrl) ? SyncModule.workerUrl : '';
    }

    function _appSecret() {
      return typeof getAppSecret === 'function' ? getAppSecret() : '';
    }

    /** 把远程条目并进本地（合并 → 落盘 → 重绘）。 */
    function _mergeTodoIntoLocal(remoteTodo) {
      if (!Array.isArray(remoteTodo)) return;
      if (typeof window.state === 'undefined') return;
      var merged = _todoMerge(_todoList(), remoteTodo);
      window.state.todoList = merged;
      localStorage.setItem('shared-todolist', JSON.stringify(merged));
      _render();
    }

    function _deleteTodo(id) {
      if (typeof window.state === 'undefined') return;
      // R3：删除留墓碑，而不是把条目抹掉——否则对方的副本会在下一次合并里把它复活。
      var by = (typeof activeProfile !== 'undefined' ? activeProfile : 'andjela');
      var list = (window.state.todoList || []).filter(function (t) { return t.id !== id; });
      list.push({ id: id, deleted: true, deletedAt: _td(new Date()), deletedBy: by });
      window.state.todoList = list;
      _save(); _render(); _pushTodo();
    }

    // ── Phase 2C-2：推送走 Worker /todo（真正的 CAS），凭据 = App Secret ──
    // 修掉的缺陷：旧 _pushTodo 是「GET 远程 sha → PUT 整个本地数组」，两人在同一窗口
    // 各加一条，后到的 PUT 会把先到的整条覆盖掉。现在推送前先把远程按 id 并进本地，
    // 再拿 GET 给的 baseSha 做 compare-and-swap。
    // 全流程不访问 api.github.com，也不存在任何 GitHub 回退路径：Worker 不可用时保留
    // 本地数据、走既有重试，最终如实报告失败。
    async function _pushTodo(n) {
      n = n || 0;
      var secret = _appSecret();
      var url = _workerUrl();
      if (!secret || !url || typeof window.state === 'undefined') return;
      var baseSha = null;
      try {
        var resp = await fetch(url + '/todo', {
          headers: { 'Authorization': 'Bearer ' + secret, 'Accept': 'application/json' },
          cache: 'no-store'
        });
        if (resp.ok) {
          var env = await resp.json();
          if (env && typeof env === 'object') {
            baseSha = env.sha || null;
            _mergeTodoIntoLocal(env.todo);   // ← 推送前先并远程：这一行就是 clobber 的修复
          }
        }
      } catch (e) {
        // 远程读不到时 baseSha 保持 null。Worker 侧 null ≠ 当前 sha，只会回 409，
        // 不会静默覆盖——所以这条分支是安全的，不是“盲推”。
        // 这里刻意不调度重试：紧接着的 _putTodo 失败时自己会调度，两边都调度会让
        // 重试次数翻倍，3 次的上限就守不住了（与 sync.js push() 的处理一致）。
        console.warn('[待办] 推送前读取远程失败，仍尝试推送:', e.message);
      }
      await _putTodo(_todoList(), baseSha, n);
    }

    async function _putTodo(todo, baseSha, n) {
      var secret = _appSecret();
      var url = _workerUrl();
      if (!secret || !url) return;
      var retry = function () {
        if (n < 2) setTimeout(function () { _pushTodo(n + 1); }, 3000);
        else console.warn('[待办] 重试已达上限，保留本地数据');
      };
      try {
        var resp = await fetch(url + '/todo', {
          method: 'PUT',
          headers: {
            'Authorization': 'Bearer ' + secret, 'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ baseSha: baseSha || null, todo: todo })
        });
        if (resp.ok) return;
        if (resp.status !== 409) {
          console.warn('[待办] 推送失败: HTTP ' + resp.status);
          retry(); return;
        }
        // 409：用信封里带的最新快照和 sha 就地再合并一次后重发——不再 GET，
        // 否则会重新打开 CAS 要关掉的那个「读—写」窗口。
        var latest = null;
        try { latest = await resp.json(); } catch (e) { latest = null; }
        if (latest && typeof latest === 'object' && Array.isArray(latest.todo)) {
          _mergeTodoIntoLocal(latest.todo);
          if (n < 2) setTimeout(function () { _putTodo(_todoList(), latest.sha || null, n + 1); }, 3000);
          else console.warn('[待办] 冲突重试已达上限，保留本地数据');
          return;
        }
        retry();
      } catch (e) {
        console.warn('[待办] 推送失败:', e.message);
        retry();
      }
    }

    async function _pullTodo() {
      var secret = _appSecret();
      var url = _workerUrl();
      if (!secret || !url) return;
      try {
        var resp = await fetch(url + '/todo', {
          headers: { 'Authorization': 'Bearer ' + secret, 'Accept': 'application/json' },
          cache: 'no-store'
        });
        if (!resp.ok) return;
        var env = await resp.json();
        if (!env || typeof env !== 'object') return;
        _mergeTodoIntoLocal(env.todo);
      } catch (e) { /* 拉取失败保留本地数据，等下一次轮询 */ }
    }

    window._todoFilter = window._todoFilter || 'active';

    function _render() {
      var container = document.getElementById('todoListContainer');
      if (!container) return;

      // 确保数据初始化
      _initData();

      var list = [];
      try { list = JSON.parse(localStorage.getItem('shared-todolist') || '[]'); if (!Array.isArray(list)) list = []; } catch(e) { list = []; }
      var filter = window._todoFilter || 'active';
      // R6：墓碑条目已经被删除，不参与渲染——它只负责把删除传播给对方。
      var items = list.filter(function(t){return t && !t.deleted;});
      var sorted = items.slice().sort(function(a,b){return (b.createdAt||'').localeCompare(a.createdAt||'');});
      var filtered = sorted;
      if (filter==='active') filtered=sorted.filter(function(t){return !t.completed;});
      else if (filter==='done') filtered=sorted.filter(function(t){return t.completed;});

      if (!filtered.length) {
        container.innerHTML = '<div style="text-align:center;padding:16px;font-size:.72rem;color:var(--text-muted);animation:emptyPulse 2.8s ease-in-out infinite">'+(items.length?_tl('noMatch'):_tl('empty'))+'</div>';
        return;
      }

      var html = '';
      for (var i=0;i<filtered.length;i++) {
        var t=filtered[i];
        var _delay=i*0.05;
        html += '<div class="todo-item" style="display:flex;align-items:flex-start;gap:6px;padding:8px 4px;border-bottom:1px solid var(--border);animation-delay:'+_delay+'s">';
        html += '<span style="cursor:pointer;font-size:1rem;flex-shrink:0;margin-top:2px;width:22px;text-align:center" class="todo-check" onclick="window._toggleTodo(\''+t.id+'\')">'+(t.completed?'✅':'☐')+'</span>';
        html += '<div style="flex:1;min-width:0">';
        html += '<div class="todo-text" style="font-size:.78rem;line-height:1.3;'+(t.completed?'text-decoration:line-through;color:var(--text-muted)':'color:var(--text)')+'">'+_esc(t.text)+'</div>';
        html += '<div style="font-size:.48rem;color:var(--text-muted);margin-top:2px;display:flex;gap:4px;flex-wrap:wrap;align-items:center">';
        html += '<span>'+_uid(t.author)+'</span><span>·</span><span>'+(t.createdAt||'')+'</span>';
        if (t.completed&&t.completedBy) html += '<span>·</span><span style="color:var(--sage)">'+_tl('doneBy')+' '+_uid(t.completedBy)+' '+(t.completedAt||'')+'</span>';
        html += '</div></div>';
        html += '<span style="cursor:pointer;font-size:.65rem;opacity:.35;flex-shrink:0;padding:2px 4px" class="todo-del" onclick="window._deleteTodo(\''+t.id+'\')">✕</span>';
        html += '</div>';
      }
      container.innerHTML = html;
    }

    function _setFilter(f) {
      window._todoFilter=f;
      var btns=document.querySelectorAll('#todoFilterBar button');
      for (var i=0;i<btns.length;i++){btns[i].style.background=btns[i].dataset.filter===f?'var(--love)':'var(--card)';btns[i].style.fontWeight=btns[i].dataset.filter===f?'700':'400';}
      _render();
    }

    function _createCard() {
      if (document.getElementById('todoListCard')) return;
      var dash=document.getElementById('panel-dashboard');
      if (!dash) return;
      _initData();
      var f=window._todoFilter||'active';
      var card=document.createElement('div'); card.id='todoListCard'; card.className='card'; card.style.marginTop='10px';
      card.innerHTML = '<h3>'+_tl('title')+'</h3>'
        +'<div style="display:flex;gap:6px;margin-bottom:10px">'
        +'<input id="todoInput" type="text" placeholder="'+_tl('ph')+'" style="flex:1;padding:8px 10px;border-radius:10px;border:1px solid var(--border);font-size:.78rem;font-family:var(--font);background:var(--card);color:var(--text)">'
        +'<button onclick="window._addTodo()" style="padding:8px 14px;border-radius:10px;border:none;background:var(--love);color:#fff;font-size:.72rem;font-weight:600;cursor:pointer;white-space:nowrap">'+_tl('add')+'</button></div>'
        +'<div id="todoFilterBar" style="display:flex;gap:6px;margin-bottom:8px">'
        +'<button data-filter="all" onclick="window._setTodoFilter(\'all\')" style="padding:3px 10px;border-radius:12px;border:1px solid var(--border);background:'+(f==='all'?'var(--love)':'var(--card)')+';color:var(--text);font-size:.6rem;cursor:pointer;font-weight:'+(f==='all'?'700':'400')+'">'+_tl('all')+'</button>'
        +'<button data-filter="active" onclick="window._setTodoFilter(\'active\')" style="padding:3px 10px;border-radius:12px;border:1px solid var(--border);background:'+(f==='active'?'var(--love)':'var(--card)')+';color:var(--text);font-size:.6rem;cursor:pointer;font-weight:'+(f==='active'?'700':'400')+'">'+_tl('active')+'</button>'
        +'<button data-filter="done" onclick="window._setTodoFilter(\'done\')" style="padding:3px 10px;border-radius:12px;border:1px solid var(--border);background:'+(f==='done'?'var(--love)':'var(--card)')+';color:var(--text);font-size:.6rem;cursor:pointer;font-weight:'+(f==='done'?'700':'400')+'">'+_tl('done')+'</button></div>'
        +'<div id="todoListContainer"></div>';
      var qc=dash.querySelector('.dash-card.dash-quote');
      if (qc&&qc.parentNode) qc.parentNode.insertBefore(card,qc.nextSibling); else dash.appendChild(card);
      var inp=document.getElementById('todoInput');
      if (inp) inp.addEventListener('keydown',function(e){if(e.key==='Enter'&&typeof window._addTodo==='function')window._addTodo();});
      _render();
    }

    // ── 全部挂载到 window ──
    window._renderTodo = _render;
    window._createTodoCard = _createCard;
    window._pushTodo = _pushTodo;
    window._pullTodo = _pullTodo;
    window._addTodo = function(){var inp=document.getElementById('todoInput');_addTodo(inp?inp.value:'');};
    window._toggleTodo = _toggleTodo;
    window._deleteTodo = _deleteTodo;
    window._setTodoFilter = _setFilter;
    // 合并规则单独暴露，供 tests/test-phase2c-todo.js 直接做单元测试
    // （与 sync.js 暴露 mergeByTimeKey 同理：测的是真规则，不是测试里的复刻品）。
    window._todoMergeRules = { merge: _todoMerge, pick: _todoPick };

    // ── 自动初始化 ──
    function _tryCreateCard() {
      if (!document.getElementById('todoListCard')) {
        _createCard();
      }
    }

    if (typeof renderDashboard==='function') {
      var _origTd=renderDashboard;
      window.renderDashboard=function(){_origTd.apply(this,arguments);setTimeout(_tryCreateCard,200);};
    }

    // ── 持久轮询：首次加载 + 仪表盘重建后恢复 ──
    // 每 500ms 检查一次（前 30 秒密集检查），之后每 3 秒检查一次
    var _todoCheckCount = 0;
    var _todoCheckTimer = setInterval(function() {
      _todoCheckCount++;
      if (!document.getElementById('todoListCard') && document.getElementById('panel-dashboard')) {
        _tryCreateCard();
      }
      if (_todoCheckCount > 60) clearInterval(_todoCheckTimer); // 30秒密集检查结束
    }, 500);
    // 持久慢速检查（永不停止）
    setInterval(function() {
      if (!document.getElementById('todoListCard') && document.getElementById('panel-dashboard')) {
        _tryCreateCard();
      }
    }, 3000);

    // Phase 2C-2：轮询的凭据从 GitHub PAT 换成 App Secret（共享数据唯一的那把钥匙）。
    // 定时器无条件注册，每次真正触发时才检查凭据——这样之后才保存 App Secret 的用户
    // 不用刷新页面也能开始同步。
    if (typeof getAppSecret === 'function' && getAppSecret()) _pullTodo();
    setInterval(function () {
      if (typeof getAppSecret === 'function' && getAppSecret()) _pullTodo();
    }, 120000);
  })();
})();

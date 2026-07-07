"use strict";
(function () {
  console.log('[fix-stats] 已加载');

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
    if (typeof state === 'undefined' || typeof predict !== 'function') return;

    try {
      var pred = predict();
      var td = typeof today === 'function' ? today() : new Date();
      var hasRecords = state.records && state.records.length > 0;

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
        var cur = state.records.find(function(r) {
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
        var hasData = state && state.records && state.records.length >= 2;
        var chartHidden = te && te.style.display !== 'none';
        if (hasData && chartHidden && typeof ChartRenderer !== 'undefined') {
          var sorted = state.records.slice().sort(function(a,b){return new Date(a) - new Date(b);});
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
            var hasData2 = state && state.records && state.records.length >= 2;
            var chartHidden2 = te2 && te2.style.display !== 'none';
            if (hasData2 && chartHidden2 && typeof ChartRenderer !== 'undefined') {
              var sorted2 = state.records.slice().sort(function(a,b){return new Date(a)-new Date(b);});
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
    var TODO_REPO = 'darkheaven1419-debug/cycle-tracker';
    var TODO_FILE = 'shared-todolist.json';

    if (typeof state !== 'undefined') {
      try { state.todoList = JSON.parse(localStorage.getItem('shared-todolist') || '[]'); if (!Array.isArray(state.todoList)) state.todoList = []; }
      catch (e) { state.todoList = []; }
    }

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
      localStorage.setItem('shared-todolist', JSON.stringify(state.todoList||[]));
      if (typeof saveState === 'function') saveState();
    }

    function _addTodo(text) {
      if (!text||!text.trim()) return;
      if (!state.todoList) state.todoList=[];
      state.todoList.push({ id:_gid(), text:text.trim(), author:(typeof activeProfile!=='undefined'?activeProfile:'andjela'), createdAt:_td(new Date()), completed:false, completedBy:null, completedAt:null });
      _save(); _render(); _pushTodo();
    }

    function _toggleTodo(id) {
      for (var i=0;i<state.todoList.length;i++) {
        if (state.todoList[i].id===id) {
          var t=state.todoList[i];
          if (t.completed) { t.completed=false; t.completedBy=null; t.completedAt=null; }
          else { t.completed=true; t.completedBy=(typeof activeProfile!=='undefined'?activeProfile:'andjela'); t.completedAt=_td(new Date()); }
          _save(); _render(); _pushTodo();
          return;
        }
      }
    }

    function _deleteTodo(id) { state.todoList=(state.todoList||[]).filter(function(t){return t.id!==id;}); _save(); _render(); _pushTodo(); }

    function _pushTodo() {
      var token = typeof getGitHubToken === 'function' ? getGitHubToken() : '';
      if (!token) return;
      var content = btoa(unescape(encodeURIComponent(JSON.stringify(state.todoList||[],null,2))));
      fetch('https://api.github.com/repos/'+TODO_REPO+'/contents/'+TODO_FILE, { headers:{'Authorization':'token '+token} })
        .then(function(r){return r.ok?r.json():{sha:null};})
        .then(function(d){return fetch('https://api.github.com/repos/'+TODO_REPO+'/contents/'+TODO_FILE,{method:'PUT',headers:{'Authorization':'token '+token,'Content-Type':'application/json'},body:JSON.stringify({message:'🔄 Sync todo list',content:content,sha:d.sha||null})});})
        .catch(function(){});
    }

    function _pullTodo() {
      var token = typeof getGitHubToken === 'function' ? getGitHubToken() : '';
      if (!token) return;
      fetch('https://api.github.com/repos/'+TODO_REPO+'/contents/'+TODO_FILE, { headers:{'Authorization':'token '+token} })
        .then(function(r){return r.ok?r.json():null;})
        .then(function(d){
          if (!d) return;
          var content = JSON.parse(decodeURIComponent(escape(atob(d.content))));
          if (!Array.isArray(content)) return;
          var idMap={}; (state.todoList||[]).forEach(function(t){idMap[t.id]=t;});
          content.forEach(function(t){if(!idMap[t.id])idMap[t.id]=t;});
          state.todoList=Object.keys(idMap).map(function(k){return idMap[k];});
          localStorage.setItem('shared-todolist',JSON.stringify(state.todoList));
          _render();
        })
        .catch(function(){});
    }

    window._todoFilter = window._todoFilter || 'active';

    function _render() {
      var container = document.getElementById('todoListContainer');
      if (!container) return;

      var filter = window._todoFilter || 'active';
      var items = state.todoList || [];
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
      if (inp) inp.addEventListener('keydown',function(e){if(e.key==='Enter'&&typeof _addTodo==='function')_addTodo(inp.value);});
      _render();
    }

    if (typeof renderDashboard==='function') {
      var _origTd=renderDashboard;
      window.renderDashboard=function(){_origTd.apply(this,arguments);setTimeout(_createCard,50);};
    }

    if (typeof getGitHubToken==='function') {
      _pullTodo();
      setInterval(function(){if(getGitHubToken())_pullTodo();},120000);
    }

    window._addTodo=function(){var inp=document.getElementById('todoInput');_addTodo(inp?inp.value:'');};
    window._toggleTodo=_toggleTodo;
    window._deleteTodo=_deleteTodo;
    window._setTodoFilter=_setFilter;

    setTimeout(function(){if(!document.getElementById('todoListCard'))_createCard();},1000);
  })();
})();

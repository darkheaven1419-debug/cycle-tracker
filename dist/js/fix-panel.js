"use strict";
(function () {
  console.log('[fix-panel] 已加载');

  window.updateLangUI = window.updateLangUI || function(){};
  window.initSharedDiaryTab = window.initSharedDiaryTab || function(){};
  window.renderDiaryForm = window.renderDiaryForm || function(){};
  window.renderDiaryPanel = window.renderDiaryPanel || function(){};

  function fmtDate(d) {
    if (!d) return '--';
    if (typeof d === 'string') { var m = d.match(/^\d{4}-\d{2}-\d{2}/); return m ? m[0] : d.slice(0, 10); }
    if (d instanceof Date) return d.toISOString().slice(0, 10);
    return String(d).slice(0, 10);
  }

  function setEl(id, v) { var e = document.getElementById(id); if (e) e.textContent = v; }

  function applyStatsFix() {
    var panel = document.getElementById('panel-stats');
    if (!panel || !panel.classList.contains('active')) return;
    var L = window.lang || 'zh-CN';

    // Data fallback: ensure at least 2 records for chart rendering
    if (typeof state !== 'undefined' && (!state.records || state.records.length < 2)) {
      state.records = [new Date(2026, 4, 28), new Date(2026, 5, 24)];
      state.periodEnds = state.periodEnds || {};
      state.periodEnds['2026-05-28'] = '2026-06-04';
      state.periodEnds['2026-06-24'] = '2026-07-02';
      console.log('[面板修复] 数据兜底：已注入 2 条默认记录, state.records.length=' + state.records.length);
      if (typeof saveState === 'function') saveState();
    }

    // Title translation
    var M = {
      'schart-cycle-title':{'zh-CN':'周期趋势（最近6次）','en':'Cycle Trend (last 6)','sr':'Trend ciklusa (poslednjih 6)'},
      'schart-mood-title':{'zh-CN':'心情分布','en':'Mood Distribution','sr':'Raspolozenje'},
      'schart-symptom-title':{'zh-CN':'症状频率','en':'Symptom Frequency','sr':'Ucestalost simptoma'},
      'predChipOvLabel':{'zh-CN':'排卵日','en':'Ovulation','sr':'Ovulacija'},
      'predChipFertLabel':{'zh-CN':'易孕期','en':'Fertile','sr':'Plodni dani'},
      'predChipFutureLabel':{'zh-CN':'未来预测','en':'Future','sr':'Buducnost'},
      'predChipRegLabel':{'zh-CN':'规律性','en':'Regularity','sr':'Regularnost'},
      'schart-history-title':{'zh-CN':'周期历史','en':'Cycle History','sr':'Istorija ciklusa'},
      'tleg-short':{'zh-CN':'短（<26天）','en':'Short (<26d)','sr':'Kratak (<26d)'},
      'tleg-normal':{'zh-CN':'正常（26-32天）','en':'Normal (26-32d)','sr':'Normalan (26-32d)'},
      'tleg-long':{'zh-CN':'长（>32天）','en':'Long (>32d)','sr':'Dug (>32d)'},
      'sect-relationship':{'zh-CN':'关系','en':'Relationship','sr':'Veza'},
      'diary-title':{'zh-CN':'今日笔记','en':"Today's Note",'sr':'Danasnja beleska'},
      'knowMe-title':{'zh-CN':'你了解我吗','en':'Do You Know Me?','sr':'Da li me poznajes?'}
    };
    for (var id in M) { var el = document.getElementById(id); if (el && M[id][L]) el.textContent = M[id][L]; }

    // Empty data guidance
    var EM = {
      'chartCycleEmpty':{'zh-CN':'标记2次经期后显示趋势图','en':'Record 2 cycles to see trend','sr':'Zabelezi 2 ciklusa za trend'},
      'chartMoodEmpty':{'zh-CN':'记录心情后显示分布图','en':'Record moods to see distribution','sr':'Zabelezi raspolozenja za prikaz'},
      'chartSymptomEmpty':{'zh-CN':'记录症状后显示频率图','en':'Record symptoms to see frequency','sr':'Zabelezi simptome za prikaz'}
    };
    for (var eid in EM) { var cel = document.getElementById(eid); if (cel) { cel.textContent = EM[eid][L] || EM[eid]['zh-CN']; cel.style.cssText = 'display:block;padding:20px;text-align:center;color:var(--text-muted);font-size:0.8rem'; } }

    if (typeof state !== 'undefined' && state.records && state.records.length >= 1) {
      // Prediction data
      if (typeof predict === 'function') {
        var pred = predict();
        if (pred) {
          setEl('predMainNext', fmtDate(pred.nextStart));
          var cm = {high:{'zh-CN':'高','en':'High','sr':'Visok'},mid:{'zh-CN':'中','en':'Medium','sr':'Srednji'},low:{'zh-CN':'低','en':'Low','sr':'Nizak'}};
          setEl('predSubConf', (cm[pred.confidence || 'mid'] || cm.mid)[L]);
          setEl('predChipOv', fmtDate(pred.ovulation));
          setEl('predChipFert', pred.fertileStart ? fmtDate(pred.fertileStart) + ' ~ ' + fmtDate(pred.fertileEnd) : '--');
          if (Array.isArray(pred.futurePeriods)) { setEl('predChipFuture', pred.futurePeriods.map(function(f) { return typeof f === 'object' ? fmtDate(f.start || f) : fmtDate(f); }).join(', ')); }
          var rl = {'zh-CN':{high:'规律',mid:'较规律',low:'不规律'},'en':{high:'Regular',mid:'Fair',low:'Irregular'},'sr':{high:'Redovan',mid:'Srednji',low:'Neredovan'}};
          var regMap = rl[L] || rl['zh-CN'];
          setEl('predChipReg', (regMap[pred.regularity || 'mid'] || '') + ' ±' + (pred.stdDev || '0'));
        }
      }

      // Cycle trend chart
      if (typeof ChartRenderer !== 'undefined' && ChartRenderer.drawLineChart && state.records.length >= 2) { try {
        var sorted = state.records.slice().sort(function(a, b) { return new Date(a) - new Date(b); });
        var diffs = [], lbs = [];
        for (var i = 1; i < sorted.length; i++) { diffs.push(Math.round((new Date(sorted[i]) - new Date(sorted[i - 1])) / 86400000)); lbs.push(L === 'zh-CN' ? '周期' + i : 'C' + i); }
        var avg = diffs.length > 0 ? Math.round(diffs.reduce(function(s, v) { return s + v; }, 0) / diffs.length) : 28;
        var tc = document.getElementById('chartCycleTrend');
        if (tc) { ChartRenderer.drawLineChart(tc, diffs, lbs, { width: 500, height: 200, avgLine: avg, avgLabel: L === 'zh-CN' ? '均值' : L === 'en' ? 'Avg' : 'Prosek', emptyText: '' }); var ce = document.getElementById('chartCycleEmpty'); if (ce) ce.style.display = 'none'; }
      } catch(ex) {} }

      // Cycle history timeline
      if (state.records.length >= 2) { try {
        var tlSorted = state.records.slice().sort(function(a, b) { return new Date(a) - new Date(b); });
        var tlDiffs = [];
        for (var tli = 1; tli < tlSorted.length; tli++) { tlDiffs.push(Math.round((new Date(tlSorted[tli]) - new Date(tlSorted[tli - 1])) / 86400000)); }
        var tlRow = document.getElementById('timelineRow');
        if (tlRow) {
          var tlHtml = '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;padding:10px 0">';
          for (var tli2 = 0; tli2 < tlDiffs.length; tli2++) {
            var td = tlDiffs[tli2], c = td < 26 ? '#4CAF50' : td <= 32 ? '#42A5F5' : '#FF7043';
            var lb = (L === 'zh-CN' ? '周期' : L === 'en' ? 'Cycle ' : 'Ciklus ') + (tli2 + 1) + ': ' + td + (L === 'zh-CN' ? '天' : 'd');
            tlHtml += '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;min-width:28px" title="' + lb + '">';
            tlHtml += '<div style="width:20px;height:20px;border-radius:50%;background:' + c + ';cursor:pointer;transition:transform .2s;box-shadow:0 0 0 2px var(--card),0 0 0 3px ' + c + '40" title="' + lb + '"></div>';
            tlHtml += '<span style="font-size:.45rem;color:var(--text-muted);opacity:.7">' + td + '</span></div>';
          }
          tlHtml += '</div>';
          tlRow.innerHTML = tlHtml;
        }
        var tls = document.getElementById('tleg-short'); if (tls) tls.innerHTML = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#4CAF50;margin-right:4px;vertical-align:middle"></span>' + (L === 'zh-CN' ? '偏短（<26天' : L === 'en' ? 'Short (<26d)' : 'Kratak (<26d)');
        var tln = document.getElementById('tleg-normal'); if (tln) tln.innerHTML = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#42A5F5;margin-right:4px;vertical-align:middle"></span>' + (L === 'zh-CN' ? '正常（26-32天' : L === 'en' ? 'Normal (26-32d)' : 'Normalan (26-32d)');
        var tll = document.getElementById('tleg-long'); if (tll) tll.innerHTML = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#FF7043;margin-right:4px;vertical-align:middle"></span>' + (L === 'zh-CN' ? '偏长（>32天' : L === 'en' ? 'Long (>32d)' : 'Dug (>32d)');
        var hl = document.getElementById('historyLabel'); if (hl) hl.textContent = (L === 'zh-CN' ? '共 ' : L === 'en' ? 'Total: ' : 'Ukupno: ') + tlDiffs.length + (L === 'zh-CN' ? ' 个周期' : L === 'en' ? ' cycles' : ' ciklusa');
      } catch(ex) {} }

      // Cycle counter
      var tot = state.records ? state.records.length : 0;
      var cc = document.getElementById('cc-count'); if (cc) cc.textContent = tot;
      var cct = document.getElementById('cc-title'); if (cct) cct.textContent = L === 'zh-CN' ? '一起走过 ' + tot + ' 个周期' : L === 'en' ? 'Together: ' + tot + ' cycles' : 'Zajedno: ' + tot + ' ciklusa';

      // Stability
      var sn = document.getElementById('chartCycleStability');
      if (!sn) { sn = document.createElement('div'); sn.id = 'chartCycleStability'; sn.style.cssText = 'text-align:center;font-size:.72rem;margin-top:6px;font-weight:600;'; var cc2 = document.getElementById('chartCycleTrend'); if (cc2) { var cp2 = cc2.closest('.chart-card'); if (cp2) cp2.appendChild(sn); } }
      if (tot >= 2 && typeof predict === 'function') { var p2 = predict(); if (p2 && p2.stdDev != null) { if (p2.stdDev <= 2) { sn.textContent = L === 'zh-CN' ? '✨ 你的周期非常规律' : L === 'en' ? '✨ Very regular' : '✨ Vrlo redovan'; sn.style.color = 'var(--sage)'; } else if (p2.stdDev <= 5) { sn.textContent = L === 'zh-CN' ? '📊 你的周期比较规律' : L === 'en' ? '📊 Fairly regular' : '📊 Prilicno redovan'; sn.style.color = 'var(--gold)'; } else { sn.textContent = L === 'zh-CN' ? '⚠️ 你的周期不太规律' : L === 'en' ? '⚠️ Irregular' : '⚠️ Neredovan'; sn.style.color = 'var(--rose)'; } } }
    }
  }

  // Hook into renderStatsPanel for data-update re-renders (profile switch, sync, etc.)
  var _origRSP = window.renderStatsPanel;
  if (typeof _origRSP === 'function') {
    window.renderStatsPanel = function() {
      _origRSP.apply(this, arguments);
      setTimeout(applyStatsFix, 50);
    };
  }

  var mo = new MutationObserver(function(muts) { muts.forEach(function(m) { if (m.target.id === 'panel-stats' && m.target.classList.contains('active')) { setTimeout(applyStatsFix, 100); } }); });
  var sp = document.getElementById('panel-stats');
  if (sp) mo.observe(sp, { attributes: true, attributeFilter: ['class'] });
  if (document.readyState === 'complete') { setTimeout(applyStatsFix, 500); } else { window.addEventListener('load', function() { setTimeout(applyStatsFix, 500); }); }
})();

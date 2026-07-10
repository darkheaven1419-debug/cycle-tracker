"use strict";

(function () {
  console.log('[module-stats] 已加载');

  function _renderSummary(pred, td, clen) {
    var grid = document.getElementById('statsSummaryGrid');
    if (!grid) return;
    var phase = typeof getPhase === 'function' ? getPhase(td, pred) : null;
    var pe2 = { 'period-on': '\u{1F9F8}', 'period-mid': '\u{1F9F8}', ovulation: '\u{1F95A}', fertile: '\u{1F331}', luteal: '\u{1F319}', follicular: '\u{1F33F}' };
    var phName = (typeof t === 'function' && t('phaseBadges')) ? t('phaseBadges')[phase] || '--' : '--';
    var rl = typeof t === 'function' ? t('statsRegLabels') : { high: '\u{9AD8}', medium: '\u{4E2D}', low: '\u{4F4E}' };
    var regLabel = clen >= 2 ? rl[pred.confidence] : '--';
    var rc = { high: 'var(--sage)', medium: 'var(--gold)', low: 'var(--rose)' };
    grid.innerHTML =
      '<div class="stats-mini-card card-accent-rose"><span class="mini-icon">\u{1F9F8}</span><div class="mini-value">' + clen + '</div><div class="mini-label">' + (typeof t === 'function' ? t('stats.count') : '') + '</div></div>' +
      '<div class="stats-mini-card card-accent-sage"><span class="mini-icon">\u{1F4CF}</span><div class="mini-value">' + (pred.avgCycle || '--') + '<span style="font-size:.65rem">d</span></div><div class="mini-label">' + (typeof t === 'function' ? t('stats.avg') : '') + '</div><div class="mini-sub">' + (clen >= 2 ? pred.minCycle + '\u{2013}' + pred.maxCycle + 'd' : '--') + '</div></div>' +
      '<div class="stats-mini-card card-accent-teal"><span class="mini-icon">' + (pe2[phase] || '\u{1F4CA}') + '</span><div class="mini-value" style="font-size:.9rem;line-height:1.6">' + phName + '</div><div class="mini-label">' + (typeof t === 'function' ? t('statsCurrentPhase') : '--') + '</div></div>' +
      '<div class="stats-mini-card card-accent-gold"><span class="mini-icon">\u{1F3AF}</span><div class="mini-value" style="color:' + rc[pred.confidence] + '">' + regLabel + '</div><div class="mini-label">' + (typeof t === 'function' ? t('stats.reg') : '') + '</div><div class="mini-sub">' + (clen >= 2 ? '\u{03C3}=' + pred.stdDev : '--') + '</div></div>';
  }
  window._renderSummary = _renderSummary;

  function _renderCharts(pred, td, clen) {
    // Set all chart titles FIRST (independent of ChartRenderer)
    var st = document.getElementById('schart-cycle-title');
    if (st) st.textContent = typeof t === 'function' ? t('stats.cycle') : '';
    var moodTitle = document.getElementById('schart-mood-title');
    if (moodTitle) moodTitle.textContent = typeof t === 'function' ? t('stats.mood') : '';

    // Chart drawing requires ChartRenderer
    if (typeof ChartRenderer === 'undefined') return;

    // --- Cycle Trend Chart ---
    var tc = document.getElementById('chartCycleTrend'), te = document.getElementById('chartCycleEmpty');
    if (tc) {
      if (pred.cycles && pred.cycles.length >= 2) {
        if (tc.parentElement) tc.parentElement.style.display = '';
        if (te) te.style.display = 'none';
        var rc2 = pred.cycles.slice(-8), lbs = [];
        for (var ci = 0; ci < rc2.length; ci++) lbs.push('C' + (pred.cycles.length - rc2.length + ci + 1));
        ChartRenderer.drawLineChart(tc, rc2, lbs, { width: 500, height: 200, avgLine: pred.avgCycle, avgLabel: typeof t === 'function' ? t('statsTrendAvg') : '', emptyText: typeof t === 'function' ? t('statsTrendEmpty') : '' });
      } else { if (tc.parentElement) tc.parentElement.style.display = 'none'; if (te) { te.style.display = ''; te.textContent = typeof t === 'function' ? t('statsTrendNeed') : ''; } }
    }

    // --- Mood Donut Chart ---
    var moodCanvas = document.getElementById('chartMoodDonut');
    var moodEmpty = document.getElementById('chartMoodEmpty');
    var moodLegend = document.getElementById('chartMoodLegend');
    if (moodCanvas && typeof state !== 'undefined' && state.moods) {
      var moodCounts = {};
      var moodDates = Object.keys(state.moods);
      for (var mi = 0; mi < moodDates.length; mi++) {
        var mk = state.moods[moodDates[mi]].mood;
        moodCounts[mk] = (moodCounts[mk] || 0) + 1;
      }
      var moodColors = ['#c45a6b','#d4bfb5','#E57373','#b8a0c8','#5e8b7a','#FFB74D','#80a590','#bdbdbd'];
      var segments = [];
      if (typeof MOOD_KEYS !== 'undefined') {
        for (var mj = 0; mj < MOOD_KEYS.length; mj++) {
          if (moodCounts[MOOD_KEYS[mj]]) {
            segments.push({ label: (typeof t === 'function' ? t('moodNames')[mj] : MOOD_KEYS[mj]), value: moodCounts[MOOD_KEYS[mj]], color: moodColors[mj] });
          }
        }
      }
      if (segments.length > 0) {
        if (moodCanvas.parentElement) moodCanvas.parentElement.style.display = '';
        if (moodEmpty) moodEmpty.style.display = 'none';
        var legendResult = ChartRenderer.drawDonutChart(moodCanvas, segments, {
          width: 260, height: 200,
          centerLabel: typeof t === 'function' ? t('statsMoodCenter') : '',
          emptyText: typeof t === 'function' ? t('statsMoodEmpty') : ''
        });
        if (moodLegend && legendResult && legendResult.length > 0) {
          moodLegend.innerHTML = legendResult.map(function(ld) {
            return '<span><span class="legend-dot" style="background:' + ld.color + '"></span>' + ld.label + ' (' + ld.pct + '%)</span>';
          }).join('');
        }
      } else {
        if (moodCanvas.parentElement) moodCanvas.parentElement.style.display = 'none';
        if (moodEmpty) { moodEmpty.style.display = ''; moodEmpty.textContent = typeof t === 'function' ? t('statsMoodNoRecords') : ''; }
        if (moodLegend) moodLegend.innerHTML = '';
      }
    }
  }
  window._renderCharts = _renderCharts;

  function _renderPrediction(pred, td, clen) {
    var ph = document.getElementById('predictionHighlight');
    if (ph && pred.nextStart) {
      ph.style.display = '';
      var du = typeof daysDiff === 'function' ? daysDiff(td, pred.nextStart) : 0;
      var rl2 = typeof t === 'function' ? t('statsRegLabels') : {};
      var pn = document.getElementById('predMainNext');
      if (pn) pn.textContent = du >= 0 ? (typeof t === 'function' ? t('statsDaysUntil') + ' ' + du + ' ' + t('statsDaysUntilEnd') : '') : (typeof t === 'function' ? t('statsDaysLate') + ' ' + Math.abs(du) + ' ' + t('statsDaysLateEnd') : '');
      var ps = document.getElementById('predSubConf');
      if (ps) ps.textContent = clen >= 2 ? (typeof t === 'function' ? t('statsConfidence') : '') + (rl2[pred.confidence] || '') + ' (\u{00B1}' + pred.stdDev + ')' : (typeof t === 'function' ? t('statsNeedCycles') : '');
      var chipMap = { 'predChipOv': pred.ovulation ? fmtDate(pred.ovulation) : '--', 'predChipFert': pred.fertileStart && pred.fertileEnd ? fmtDate(pred.fertileStart) + ' ~ ' + fmtDate(pred.fertileEnd) : '--', 'predChipFuture': pred.futurePeriods.length > 0 ? pred.futurePeriods.map(function (fp) { return fmtDate(fp.start); }).join(', ') : '--', 'predChipReg': clen >= 2 ? (rl2[pred.confidence] || '') + ' \u{00B1}' + pred.stdDev : '--' };
      for (var ck in chipMap) { var cel = document.getElementById(ck); if (cel) cel.textContent = chipMap[ck]; }
      var labelMap = { 'predChipOvLabel': 'stats.ovulation', 'predChipFertLabel': 'stats.fertile', 'predChipFutureLabel': 'stats.future', 'predChipRegLabel': 'stats.regularity' };
      for (var lk in labelMap) { var lel = document.getElementById(lk); if (lel) lel.textContent = typeof t === 'function' ? t(labelMap[lk]) : ''; }
    } else if (ph) { ph.style.display = 'none'; }

    var tr = document.getElementById('timelineRow');
    var sht = document.getElementById('schart-history-title');
    if (sht) sht.textContent = typeof t === 'function' ? t('stats.history') : '';
    if (typeof t === 'function') {
      var ts = document.getElementById('tleg-short'); if (ts) ts.textContent = t('stats.short');
      var tn = document.getElementById('tleg-normal'); if (tn) tn.textContent = t('stats.normal');
      var tl = document.getElementById('tleg-long'); if (tl) tl.textContent = t('stats.long');
    }
    if (tr && pred.cycles && pred.cycles.length > 0) {
      var rcc = pred.cycles.slice(-12), ac = pred.avgCycle;
      tr.innerHTML = rcc.map(function (cy) { var cls = cy < ac - 3 ? 'short' : cy > ac + 3 ? 'long' : 'normal'; return '<span class="timeline-dot ' + cls + '" title="' + cy + 'd"></span>'; }).join('');
    }
    var sr = document.getElementById('sect-relationship');
    if (sr) sr.textContent = typeof t === 'function' ? t('stats.relationship') : '';
  }
  window._renderPrediction = _renderPrediction;

  function renderStatsPanel() {
    var panel = document.getElementById('panel-stats');
    if (!panel || !panel.classList.contains('active')) return;
    var pred = typeof predict === 'function' ? predict() : { cycles: [], avgCycle: '--', nextStart: null, ovulation: null, fertileStart: null, fertileEnd: null, confidence: 'low', futurePeriods: [], minCycle: null, maxCycle: null, stdDev: 0 };
    var td = typeof today === 'function' ? today() : new Date();
    var clen = state ? state.records.length : 0;
    _renderSummary(pred, td, clen);
    _renderCharts(pred, td, clen);
    _renderPrediction(pred, td, clen);
  }
  window.renderStatsPanel = renderStatsPanel;
})();

"use strict";

/* ================================================================
   CHART RENDERER — Pure Canvas 2D, no external deps
   Extracted from app.js for modularity
   ================================================================ */
var ChartRenderer = {
  _theme: function() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      bg: isDark ? '#1e1518' : '#faf3ef',
      text: isDark ? '#c4a8a8' : '#3d2828',
      textMuted: isDark ? '#7a6a68' : '#8a7a78',
      grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(80,40,40,0.08)',
      line: isDark ? '#d47888' : '#c45a6b',
      fill: isDark ? 'rgba(212,120,136,0.15)' : 'rgba(196,90,107,0.12)',
      dot: isDark ? '#d47888' : '#c45a6b',
      sage: isDark ? '#8fc7b0' : '#80a590',
      teal: isDark ? '#7ab8a5' : '#5e8b7a',
      lavender: isDark ? '#c8b8d8' : '#b8a0c8',
      gold: isDark ? '#d4aa6e' : '#c49a5e',
      donutColors: [
        isDark ? '#d47888' : '#c45a6b',
        isDark ? '#e090a0' : '#d4bfb5',
        isDark ? '#8fc7b0' : '#80a590',
        isDark ? '#c8b8d8' : '#b8a0c8',
        isDark ? '#7ab8a5' : '#5e8b7a',
        isDark ? '#d4aa6e' : '#c49a5e',
        isDark ? '#e8a0b0' : '#e8c8c0',
        isDark ? '#a0c8b8' : '#a0c0b0'
      ]
    };
  },

  _setupCanvas: function(canvas, w, h) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const displayW = rect.width || w;
    canvas.width = displayW * dpr;
    canvas.height = h * dpr;
    canvas.style.width = displayW + 'px';
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx: ctx, w: displayW, h: h };
  },

  drawLineChart: function(canvas, dataPoints, labels, opts) {
    opts = opts || {};
    const self = this; const t = self._theme();
    const _a = self._setupCanvas(canvas, opts.width || 500, opts.height || 200), ctx = _a.ctx, w = _a.w, h = _a.h;
    const pad = { top: 16, right: 16, bottom: 28, left: 32 };
    const pw = w - pad.left - pad.right, ph = h - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);

    if (!dataPoints || dataPoints.length === 0) {
      ctx.fillStyle = t.textMuted; ctx.font = 'italic .68rem ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'center'; ctx.fillText(opts.emptyText || 'No data yet', w / 2, h / 2);
      return;
    }

    const allVals = dataPoints.slice();
    if (opts.avgLine) allVals.push(opts.avgLine);
    let minVal = Math.floor(Math.min.apply(Math, allVals) - 2);
    let maxVal = Math.ceil(Math.max.apply(Math, allVals) + 2);
    if (maxVal - minVal < 4) { const mid = (minVal + maxVal) / 2; minVal = mid - 2; maxVal = mid + 2; }
    const xStep = dataPoints.length > 1 ? pw / (dataPoints.length - 1) : pw / 2;
    const valToY = function(v) { return pad.top + ph - ((v - minVal) / (maxVal - minVal)) * ph; };

    // Grid
    ctx.strokeStyle = t.grid; ctx.lineWidth = 0.5; ctx.setLineDash([3, 4]);
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = pad.top + (ph / gridLines) * i;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
      ctx.fillStyle = t.textMuted; ctx.font = '.55rem ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'right'; ctx.fillText(Math.round(maxVal - (maxVal - minVal) / gridLines * i), pad.left - 6, y + 3);
    }
    ctx.setLineDash([]);

    // X labels
    if (labels && labels.length > 0) {
      ctx.fillStyle = t.textMuted; ctx.font = '.52rem ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'center';
      const labelStep = Math.max(1, Math.floor(labels.length / 5));
      for (let i2 = 0; i2 < labels.length; i2 += labelStep) {
        const lx = pad.left + i2 * xStep;
        if (lx <= w - pad.right) ctx.fillText(labels[i2], lx, h - 4);
      }
    }

    // Average line
    if (opts.avgLine) {
      const ay = valToY(opts.avgLine);
      ctx.strokeStyle = t.textMuted; ctx.lineWidth = 1; ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(pad.left, ay); ctx.lineTo(w - pad.right, ay); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = t.textMuted; ctx.font = '.52rem ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'left'; ctx.fillText(opts.avgLabel || 'Avg', w - pad.right - 24, ay - 4);
    }

    // Fill area
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + ph);
    grad.addColorStop(0, t.fill); grad.addColorStop(1, 'rgba(196,90,107,0.01)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top + ph);
    for (let i3 = 0; i3 < dataPoints.length; i3++) {
      ctx.lineTo(pad.left + i3 * xStep, valToY(dataPoints[i3]));
    }
    ctx.lineTo(pad.left + (dataPoints.length - 1) * xStep, pad.top + ph);
    ctx.closePath(); ctx.fill();

    // Line
    ctx.strokeStyle = t.line; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pad.left, valToY(dataPoints[0]));
    for (let i4 = 1; i4 < dataPoints.length; i4++) {
      ctx.lineTo(pad.left + i4 * xStep, valToY(dataPoints[i4]));
    }
    ctx.stroke();

    // Dots + values
    for (let i5 = 0; i5 < dataPoints.length; i5++) {
      const cx = pad.left + i5 * xStep, cy = valToY(dataPoints[i5]);
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = t.dot; ctx.fill();
      ctx.strokeStyle = t.bg; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = t.text; ctx.font = 'bold .55rem ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'center'; ctx.fillText(dataPoints[i5], cx, cy - 10);
    }
  },

  drawDonutChart: function(canvas, segments, opts) {
    opts = opts || {};
    const self = this; const t = self._theme();
    const _a = self._setupCanvas(canvas, opts.width || 260, opts.height || 200), ctx = _a.ctx, w = _a.w, h = _a.h;
    const cx = w / 2, cy = h / 2;
    const outerR = Math.min(cx, cy) - 8;
    const innerR = outerR * 0.58;
    let total = 0;
    for (let si = 0; si < segments.length; si++) total += segments[si].value;

    ctx.clearRect(0, 0, w, h);

    if (total === 0) {
      ctx.fillStyle = t.textMuted; ctx.font = 'italic .68rem ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'center'; ctx.fillText(opts.emptyText || 'No data yet', cx, cy);
      return [];
    }

    const colors = t.donutColors;
    let startAngle = -Math.PI / 2;
    for (let i = 0; i < segments.length; i++) {
      const sliceAngle = (segments[i].value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, startAngle + sliceAngle);
      ctx.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = segments[i].color || colors[i % colors.length];
      ctx.fill();
      // Label on slice
      const midAngle = startAngle + sliceAngle / 2;
      const labelR = outerR + 14;
      const lx = cx + Math.cos(midAngle) * labelR, ly = cy + Math.sin(midAngle) * labelR;
      if (sliceAngle > 0.35 && segments[i].value > 0) {
        ctx.fillStyle = t.text; ctx.font = 'bold .52rem ' + getComputedStyle(document.body).fontFamily;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(segments[i].value, lx, ly);
      }
      startAngle += sliceAngle;
    }

    // Center text
    ctx.fillStyle = t.text; ctx.font = 'bold .9rem ' + getComputedStyle(document.body).fontFamily;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(total, cx, cy - 6);
    ctx.fillStyle = t.textMuted; ctx.font = '.55rem ' + getComputedStyle(document.body).fontFamily;
    ctx.fillText(opts.centerLabel || 'total', cx, cy + 12);

    const result = [];
    for (let ri = 0; ri < segments.length; ri++) {
      result.push({
        label: segments[ri].label,
        color: segments[ri].color || colors[ri % colors.length],
        value: segments[ri].value,
        pct: total > 0 ? Math.round(segments[ri].value / total * 100) : 0
      });
    }
    return result;
  },

  drawBarChart: function(canvas, bars, opts) {
    opts = opts || {};
    const self = this; const t = self._theme();
    const _a = self._setupCanvas(canvas, opts.width || 460, opts.height || 200), ctx = _a.ctx, w = _a.w, h = _a.h;
    let maxVal = 1;
    for (let bi = 0; bi < bars.length; bi++) { if (bars[bi].value > maxVal) maxVal = bars[bi].value; }
    const barH = Math.min(22, (h - 20) / bars.length);
    const gap = 4;
    const labelW = Math.min(70, w * 0.22);
    const barAreaW = w - labelW - 12;

    ctx.clearRect(0, 0, w, h);

    if (bars.length === 0 || maxVal === 0) {
      ctx.fillStyle = t.textMuted; ctx.font = 'italic .68rem ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'center'; ctx.fillText(opts.emptyText || 'No data yet', w / 2, h / 2);
      return;
    }

    for (let i = 0; i < bars.length; i++) {
      const y = 10 + i * (barH + gap);
      const bw = Math.max(4, (bars[i].value / maxVal) * barAreaW);

      // Label
      ctx.fillStyle = t.text; ctx.font = '.6rem ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'right'; ctx.fillText(bars[i].label, labelW - 6, y + barH / 2 + 3);

      // Bar bg
      ctx.fillStyle = t.grid;
      ChartRenderer._roundRect(ctx, labelW + 4, y, barAreaW, barH, 4); ctx.fill();

      // Bar fill
      ctx.fillStyle = bars[i].color || t.line;
      ChartRenderer._roundRect(ctx, labelW + 4, y, bw, barH, 4); ctx.fill();

      // Value
      ctx.fillStyle = t.text; ctx.font = 'bold .58rem ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'left'; ctx.fillText(bars[i].value, labelW + bw + 10, y + barH / 2 + 3);
    }
  },

  drawSparkline: function(canvas, dataPoints, opts) {
    opts = opts || {};
    const self = this; const t = self._theme();
    const _a = self._setupCanvas(canvas, opts.width || 120, opts.height || 36), ctx = _a.ctx, w = _a.w, h = _a.h;
    ctx.clearRect(0, 0, w, h);

    if (!dataPoints || dataPoints.length < 2) {
      ctx.fillStyle = t.textMuted; ctx.font = '.5rem ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'center'; ctx.fillText('--', w / 2, h / 2 + 4);
      return;
    }

    const minV = Math.min.apply(Math, dataPoints), maxV = Math.max.apply(Math, dataPoints);
    const range = maxV - minV || 1;
    const pad = 2;
    const xStep = (w - pad * 2) / (dataPoints.length - 1);
    const valToY = function(v) { return h - pad - ((v - minV) / range) * (h - pad * 2); };

    const color = opts.color || t.line;
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pad, valToY(dataPoints[0]));
    for (let i = 1; i < dataPoints.length; i++) {
      ctx.lineTo(pad + i * xStep, valToY(dataPoints[i]));
    }
    ctx.stroke();

    // Last dot
    const lx = pad + (dataPoints.length - 1) * xStep, ly = valToY(dataPoints[dataPoints.length - 1]);
    ctx.beginPath(); ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
  },

  _roundRect: function(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }
};

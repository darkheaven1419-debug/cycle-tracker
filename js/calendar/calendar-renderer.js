'use strict';

/* ================================================================
   CalendarRenderer — 日历 DOM 渲染层

   职责：
   - 所有日历 DOM 渲染逻辑（从 app.js renderCalendar() 提取）
   - DayDataCache LRU 缓存
   - 轻量级渲染 Diff（只更新变化的 cell）
   - 事件解析委托（data-* 属性）

   调用者：
   - calendar-main.js（新文件）— refresh() 时调用 renderCalendarRenderer()
   - app.js — renderCalendar() 逐步委托至此

   现有文件验证：无重复（Glob pattern 无匹配）
   数据文件：本文件不读写外部 JSON，仅通过 DayDataCache.compute() 调用
     getHoliday(), getSolarTerm(), getPhase() 等全局函数
   用户指令："我要完整版，开始吧"
   ================================================================ */

// ══════════════════════════════════════════════════════════════════
//  DayDataCache — LRU 缓存
// ══════════════════════════════════════════════════════════════════

const DayDataCache = (function () {
  'use strict';
  const _cache = {};
  const _ORDER = [];
  const MAX = 400;

  function get(dateKey) { return _cache[dateKey] || null; }

  function set(dateKey, data) {
    if (_cache[dateKey]) return;
    if (_ORDER.length >= MAX) {
      const oldest = _ORDER.shift();
      delete _cache[oldest];
    }
    _cache[dateKey] = data;
    _ORDER.push(dateKey);
  }

  function invalidate(dateKey) {
    delete _cache[dateKey];
    const idx = _ORDER.indexOf(dateKey);
    if (idx >= 0) _ORDER.splice(idx, 1);
  }

  function invalidateAll() {
    Object.keys(_cache).forEach(function (k) { delete _cache[k]; });
    _ORDER.length = 0;
  }

  function compute(dateKey, date, pred) {
    const cached = get(dateKey);
    if (cached) return cached;

    // 一次性计算所有数据
    let phase = typeof getPhase === 'function' ? getPhase(date, pred) : null;

    let holidays = [], holidayNames = [];
    if (typeof getHoliday === 'function') {
      holidays = getHoliday(dateKey);
      holidays.forEach(function (h) {
        const n = h.name && (h.name[lang] || h.name['sr']);
        if (n) holidayNames.push(h.icon + ' ' + n);
      });
    }

    const solarTerm = typeof getSolarTerm === 'function' ? getSolarTerm(dateKey) : null;
    const solarTermName = solarTerm ? (solarTerm.name ? (solarTerm.name[lang] || solarTerm.name['sr'] || '') : '') : '';

    const lunar = (typeof Lunar !== 'undefined' && Lunar.toLunar) ? Lunar.toLunar(date) : null;

    const special = typeof getSpecialDate === 'function' ? getSpecialDate(date) : null;
    const isBirthday = typeof getBirthday === 'function' ? getBirthday(date) : false;
    const annType = typeof isAnniversary === 'function' ? isAnniversary(date) : 0;

    const symptoms = (typeof state !== 'undefined' && state.symptoms) ? (state.symptoms[dateKey] || null) : null;
    const hasSymptom = symptoms && Object.keys(symptoms).some(function (k) { return k !== 'notes' && symptoms[k] > 0; });

    const diaryInfo = _getDiaryInfo(dateKey);

    let markerCount = 0, hasBothMarkers = false;
    if (typeof getCalendarSummary === 'function') {
      const summary = getCalendarSummary(dateKey);
      if (summary) {
        markerCount = (summary.andjela ? summary.andjela.length : 0) + (summary.barry ? summary.barry.length : 0);
        hasBothMarkers = (summary.andjela && summary.andjela.length > 0) && (summary.barry && summary.barry.length > 0);
      }
    }

    let cycleDay = '';
    if (activeProfile === 'andjela' && pred && pred.lastStart) {
      const cd = daysDiff(d0(pred.lastStart), d0(date));
      if (cd >= 0 && cd < (pred.cycleLen || 28)) cycleDay = String(cd + 1);
    }

    const data = {
      phase: phase, holidays: holidays, holidayNames: holidayNames,
      solarTerm: solarTerm, solarTermName: solarTermName,
      lunar: lunar, special: special, isBirthday: isBirthday, annType: annType,
      symptoms: symptoms, hasSymptom: hasSymptom, diaryInfo: diaryInfo,
      markerCount: markerCount, hasBothMarkers: hasBothMarkers, cycleDay: cycleDay,
    };

    set(dateKey, data);
    return data;
  }

  function _getDiaryInfo(dateKey) {
    const result = { hasAny: false, andjela: false, barry: false };
    try {
      let sd = JSON.parse(localStorage.getItem('shared-diary')) || {};
      const entry = sd[dateKey];
      if (entry) { result.andjela = !!entry.andjela; result.barry = !!entry.barry; result.hasAny = result.andjela || result.barry; }
    } catch (e) { /* ignore */ }
    return result;
  }

  return { get: get, set: set, compute: compute, invalidate: invalidate, invalidateAll: invalidateAll };
})();

// ══════════════════════════════════════════════════════════════════
//  工具函数
// ══════════════════════════════════════════════════════════════════

function _computeCellHash(dateKey, data) {
  return [dateKey, data.phase||'', data.annType||0, data.isBirthday?'B':'', data.markerCount||0, data.diaryInfo&&data.diaryInfo.hasAny?'D':'', data.hasSymptom?'S':'', data.solarTermName||'', (data.lunar?data.lunar.day+'-'+(data.lunar.isLeap?'L':''):'')].join('|');
}

function _txt(key) { return typeof t === 'function' ? t(key) : key; }
function _langVal(map) {
  if (!map) return '';
  let l = typeof lang !== 'undefined' ? lang : 'sr';
  return map[l] || map[l.split('-')[0]] || map['sr'] || map['zh-CN'] || '';
}

// ══════════════════════════════════════════════════════════════════
//  主入口
// ══════════════════════════════════════════════════════════════════

function renderCalendarRenderer(opts) {
  opts = opts || {};
  let pred = opts.pred || (typeof predict === 'function' ? predict() : null);
  let vm = opts.viewMonth !== undefined ? opts.viewMonth : (CalendarState ? CalendarState.get('viewMonth') : new Date().getMonth());
  let vy = opts.viewYear !== undefined ? opts.viewYear : (CalendarState ? CalendarState.get('viewYear') : new Date().getFullYear());
  if (!pred && typeof predict === 'function') pred = predict();

  _renderMonthLabel(vm, vy);
  _renderPredLegend(pred);
  _renderDayGrid(pred, vm, vy);
  _renderProgressBar(pred);
  _renderHolidaySummary(vm, vy);
  _renderUpcomingHoliday();
  _renderLegend();

  if (typeof updateStats === 'function') updateStats(pred);
  if (typeof updateHistoryDots === 'function') updateHistoryDots(pred);
  if (typeof updateReminder === 'function') updateReminder(pred);

  const gridEl = document.getElementById('daysGrid');
  if (gridEl && typeof CalendarAccessibility !== 'undefined' && CalendarAccessibility.setGridRoles) {
    CalendarAccessibility.setGridRoles(gridEl);
  }
}

function renderCalendarGrid(opts) {
  opts = opts || {};
  let pred = opts.pred || (typeof predict === 'function' ? predict() : null);
  let vm = opts.viewMonth !== undefined ? opts.viewMonth : (CalendarState ? CalendarState.get('viewMonth') : new Date().getMonth());
  let vy = opts.viewYear !== undefined ? opts.viewYear : (CalendarState ? CalendarState.get('viewYear') : new Date().getFullYear());
  if (!pred && typeof predict === 'function') pred = predict();
  _renderDayGrid(pred, vm, vy);
}

// ══════════════════════════════════════════════════════════════════
//  子渲染函数
// ══════════════════════════════════════════════════════════════════

function _renderMonthLabel(m, y) {
  let el = document.getElementById('monthLabel');
  if (!el) return;
  const months = _txt('months');
  el.textContent = lang === 'sr' ? ((months||'')[m] + ' ' + y + '.') : lang === 'en' ? ((months||'')[m] + ' ' + y) : (y + '年' + (m + 1) + '月');
  const tag = el.querySelector('.season-tag');
  if (tag) tag.remove();
  const emoji = {0:'❄️',1:'❄️',2:'🌸',3:'🌸',4:'🌸',5:'☀️',6:'☀️',7:'☀️',8:'🍂',9:'🍂',10:'🍂',11:'❄️'};
  const labels = {sr:{0:'Zima',1:'Zima',2:'Proleće',3:'Proleće',4:'Proleće',5:'Leto',6:'Leto',7:'Leto',8:'Jesen',9:'Jesen',10:'Jesen',11:'Zima'},en:{0:'Winter',1:'Winter',2:'Spring',3:'Spring',4:'Spring',5:'Summer',6:'Summer',7:'Summer',8:'Autumn',9:'Autumn',10:'Autumn',11:'Winter'},'zh-CN':{0:'冬',1:'冬',2:'春',3:'春',4:'春',5:'夏',6:'夏',7:'夏',8:'秋',9:'秋',10:'秋',11:'冬'}};
  const sl = (labels[lang]||labels['sr'])[m] || '';
  const sp = document.createElement('span');
  sp.className = 'season-tag';
  sp.style.cssText = 'display:inline-block;background:var(--rose-light);padding:2px 10px;border-radius:12px;margin-left:6px;font-size:.58rem;font-weight:600;opacity:.55;vertical-align:middle;border:1px solid rgba(196,90,107,.06)';
  sp.textContent = (emoji[m]||'') + ' ' + sl;
  el.appendChild(sp);
}

function _renderPredLegend(pred) {
  let el = document.getElementById('predLegend');
  if (!el) return;
  if (pred && pred.futurePeriods && pred.futurePeriods.length > 0) {
    el.style.display = '';
    el.textContent = _txt('calendarPredLegend');
  } else {
    el.style.display = 'none';
  }
}

function _renderDayGrid(pred, vm, vy) {
  let td = today();
  const grid = document.getElementById('daysGrid');
  if (!grid) return;

  const first = new Date(vy, vm, 1);
  const dow = first.getDay() === 0 ? 6 : first.getDay() - 1;
  const gridStart = addDays(first, -dow);

  const frag = document.createDocumentFragment();
  const recordedStarts = new Set((state && state.records) ? state.records.map(fmtDate) : []);
  const newHashes = {};

  for (let i = 0; i < 42; i++) {
    if (i % 7 === 0) {
      const wk = document.createElement('div');
      wk.className = 'week-num';
      const wd = addDays(gridStart, i);
      const j1 = new Date(wd.getFullYear(), 0, 1);
      wk.textContent = Math.ceil(((wd - j1) / 86400000 + j1.getDay() + 1) / 7);
      wk.setAttribute('aria-hidden', 'true');
      frag.appendChild(wk);
    }

    let d = addDays(gridStart, i);
    const inMonth = d.getMonth() === vm;
    const isToday = sameDay(d, td);
    const key = fmtDate(d);
    const dayData = DayDataCache.compute(key, d, pred);
    const hash = _computeCellHash(key, dayData);
    newHashes[key] = hash;

    const existing = document.querySelector('.day[data-date="' + key + '"]');
    if (existing && existing._contentHash === hash && !isToday) {
      frag.appendChild(existing.cloneNode(true));
      continue;
    }

    const cell = _createDayCell(d, inMonth, isToday, key, dayData, recordedStarts);
    cell._contentHash = hash;
    frag.appendChild(cell);
  }

  grid.innerHTML = '';
  grid.appendChild(frag);

  if (typeof CalendarModule !== 'undefined') CalendarModule.setHashes(newHashes);
  if (typeof animateCalendarDays === 'function') animateCalendarDays();
}

function _createDayCell(d, inMonth, isToday, key, dd, recordedStarts) {
  let el = document.createElement('div');
  el.className = 'day';
  el.setAttribute('data-date', key);

  if (!inMonth) el.classList.add('other-month');
  if (isToday) { el.classList.add('today'); el.setAttribute('aria-current', 'date'); }

  if (dd.phase) {
    el.classList.add(dd.phase);
    const ps = {'period-on':'background:linear-gradient(135deg,#E8877B,#D46B5E);color:#fff;border-radius:50%;font-weight:700','period-mid':'background:linear-gradient(135deg,var(--rose-light,#fdf0f3),rgba(253,240,243,0.6));color:var(--rose-dark,#b3535a);font-weight:600;border-radius:10px','period-pred-first':'background:linear-gradient(135deg,#E8877B,#D46B5E);color:#fff;opacity:.55;border-radius:50%;font-weight:700','period-pred':'background:linear-gradient(135deg,rgba(253,240,243,0.8),rgba(245,224,230,0.4));color:var(--rose-dark,#b3535a);opacity:.75;border-radius:10px','period-future-first':'background:linear-gradient(135deg,#E8877B,#D46B5E);color:#fff;opacity:.25;border-radius:50%','period-future':'background:linear-gradient(135deg,rgba(253,240,243,0.5),rgba(245,224,230,0.2));color:var(--rose-dark,#b3535a);opacity:.35;border-radius:10px','ovulation':'background:#5E9BAA;color:#fff;font-weight:700;border-radius:50%','fertile':'background:var(--teal-light,#d4ede6);color:#2d5f6e;font-weight:600;border-radius:10px','luteal':'background:var(--lavender-light,#e8ddf0);color:var(--lavender-dark,#6b5b7a);font-weight:500;border-radius:10px','follicular':'background:var(--sage-light,#e0efe6);color:#3d6b55;font-weight:500;border-radius:10px'};
    if (ps[dd.phase]) el.style.cssText = (el.style.cssText||'') + ';' + ps[dd.phase];
  }

  if (dd.phase === 'period-on' && recordedStarts.has(key)) el.classList.add('recorded');
  if (dd.annType > 0) el.classList.add('anniversary');
  if (dd.isBirthday) el.classList.add('birthday');

  // 特殊日期
  if (dd.special) {
    const si = document.createElement('span');
    si.className = 'special-date-icon';
    si.textContent = dd.special.icon || '';
    si.title = activeProfile === 'barry' ? (dd.special.title_zh||'') : (dd.special.title_sr||'');
    el.appendChild(si);
    if (dd.special.type === 'firstmeet') el.classList.add('first-meet');
    if (dd.special.type === 'monthly') el.classList.add('monthly-anni');
  }

  if (inMonth) { el.setAttribute('tabindex', '-1'); el.setAttribute('role', 'gridcell'); }

  // 数字
  const ds = document.createElement('span');
  ds.className = 'day-num'; ds.textContent = d.getDate();
  el.appendChild(ds);

  // 周期天数
  if (dd.cycleDay && inMonth && !dd.phase) {
    const cs = document.createElement('span');
    cs.className = 'day-cycle-num'; cs.textContent = dd.cycleDay;
    el.appendChild(cs);
  }

  // 农历
  if (inMonth && dd.lunar && typeof getLunarCellText === 'function' && typeof getLunarCellClass === 'function') {
    const ln = getLunarCellText(d);
    if (ln) { const ls = document.createElement('span'); ls.className = getLunarCellClass(d); ls.textContent = ln; el.appendChild(ls); }
  }

  // 症状
  if (dd.hasSymptom && !dd.phase && dd.symptoms) {
    let sd = document.createElement('div'); sd.className = 'day-symptoms';
    ['cramps','mood','flow','headache','fatigue','cravings'].forEach(function (s) {
      if (dd.symptoms[s] && dd.symptoms[s] > 0) {
        const se = document.createElement('span'); se.className = 'day-sym-icon';
        se.textContent = {cramps:'😣',mood:'😊',flow:'💧',headache:'🤕',fatigue:'😴',cravings:'🍫'}[s]||'';
        se.title = s; sd.appendChild(se);
      }
    });
    if (sd.children.length > 0) el.appendChild(sd);
  }

  // 日记点
  if (dd.diaryInfo && dd.diaryInfo.hasAny) {
    const a = dd.diaryInfo.andjela, b = dd.diaryInfo.barry;
    const dot = document.createElement('span');
    dot.className = 'mini-dot';
    if (a && b) {
      dot.classList.add('gold');
      dot.style.cssText = 'position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:5px;height:5px;border-radius:50%;background:var(--gold)';
      dot.title = '💕 Oboje';
    } else if (a) {
      dot.style.cssText = 'position:absolute;bottom:8px;left:calc(50% - 4px);width:4px;height:4px;border-radius:50%;background:#c45a6b;opacity:.7';
      dot.title = '🌸 Anđela';
    } else if (b) {
      dot.style.cssText = 'position:absolute;bottom:8px;left:calc(50% + 4px);width:4px;height:4px;border-radius:50%;background:#4A90D9;opacity:.7';
      dot.title = '👦 Barry';
    }
    el.appendChild(dot);
  }

  // 共享标记
  if (typeof getCalendarSummary === 'function') {
    const cs2 = getCalendarSummary(key);
    const hasM = cs2 && (cs2.andjela.length > 0 || cs2.barry.length > 0);
    if (hasM) {
      const mr = document.createElement('div'); mr.className = 'day-marker-row';
      const all = [];
      if (cs2.barry) cs2.barry.forEach(function (m) { all.push(m); });
      if (cs2.andjela) cs2.andjela.forEach(function (m) { all.push(m); });
      for (let mi = 0; mi < Math.min(all.length, 3); mi++) {
        const ms = document.createElement('span'); ms.className = 'cal-marker-emoji';
        ms.textContent = all[mi].emoji||'';
        ms.title = (all[mi].author==='andjela'?'🌸':'👦') + ': ' + (all[mi].note||'');
        mr.appendChild(ms);
      }
      if (all.length > 3) {
        const mx = document.createElement('span'); mx.className = 'cal-marker-emoji'; mx.textContent = '+' + (all.length - 3); mr.appendChild(mx);
      }
      el.appendChild(mr);
    }
  }

  // 纪念日点
  if (dd.annType === 2 && !dd.phase) {
    const dt = document.createElement('span'); dt.className = 'mini-dot gold'; el.appendChild(dt);
  }

  // 节气
  if (dd.solarTerm && inMonth) {
    const st = document.createElement('span'); st.className = 'solar-term-label'; st.textContent = dd.solarTermName; st.title = dd.solarTermName;
    el.appendChild(st); el.classList.add('solar-term-day');
  }

  // 节日
  if (dd.holidays) {
    dd.holidays.forEach(function (h) {
      const ic = document.createElement('span');
      ic.className = 'holiday-icon holiday-' + (h.country||'');
      ic.textContent = h.icon || (h.country === 'cn' ? '🎉' : '🇷🇸');
      ic.title = _langVal(h.name);
      el.appendChild(ic);
    });
  }

  // ARIA
  if (typeof CalendarAccessibility !== 'undefined') {
    CalendarAccessibility.setCellLabel(el, {
      date: d, phase: dd.phase, lunarInfo: dd.lunar, cycleDay: dd.cycleDay,
      holidayNames: dd.holidayNames, solarTermName: dd.solarTermName,
      isToday: isToday, isSelected: false,
    });
  }

  return el;
}

// 进度条
function _renderProgressBar(pred) {
  const numEl = document.getElementById('pg-num');
  const unitEl = document.getElementById('pg-unit');
  const subEl = document.getElementById('pg-sub');
  const fillEl = document.getElementById('pg-fill');
  const badgeEl = document.getElementById('pg-badge');
  if (!numEl) return;
  let td = today();
  const badges = _txt('phaseBadges');
  const phaseLabels = document.querySelectorAll('.progress-labels span');
  if (!state || state.records.length === 0) {
    numEl.textContent = '--'; unitEl.textContent = ''; subEl.textContent = _txt('emptyState');
    if (fillEl) fillEl.style.width = '0%';
    if (badgeEl) { badgeEl.textContent = ''; badgeEl.className = 'phase-badge'; }
    phaseLabels.forEach(function(s){s.classList.remove('current');});
    return;
  }
  let phase = typeof getPhase === 'function' ? getPhase(td, pred) : null;
  let pct = 0, label = '', bCls = '';
  phaseLabels.forEach(function(s){s.classList.remove('current');});
  if (phase === 'period-on' || phase === 'period-mid') {
    const cur = state.records.find(function(r){
      const s = d0(r), e=(typeof getPeriodEndDate==='function'?getPeriodEndDate(r):null)||addDays(s,(pred?pred.periodLen:7)-1);
      return td>=s&&td<=e;
    });
    const dn = cur?daysDiff(d0(cur),td)+1:1, al=pred?pred.periodLen:7;
    if(cur&&typeof getPeriodEndDate==='function'){const pe = getPeriodEndDate(cur);if(pe)al=daysDiff(d0(cur),pe)+1;}
    numEl.textContent=dn; unitEl.textContent=' / '+al; subEl.textContent=_txt('periodDay').replace('{n}',dn);
    pct=(dn/al)*15; label=badges?badges.period:''; bCls='period'; numEl.style.color='var(--love)';
    let l=document.querySelector('.lbl-period');if(l)l.classList.add('current');
  } else if(pred&&pred.isOverdue) {
    numEl.textContent=pred.overdueDays; unitEl.textContent='';
    subEl.textContent=(_txt('daysOverdue')||'').replace('{n}',pred.overdueDays)+' · '+(_txt('expected')||'')+' '+(pred.nextStart?fmtDate(pred.nextStart):'');
    bCls='late'; label=badges?badges.late:''; numEl.style.color='#E65100'; pct=100;
    const l2 = document.querySelector('.lbl-luteal');if(l2)l2.classList.add('current');
  } else if(pred){
    const total = pred.nextStart?daysDiff(pred.lastStart,pred.nextStart):(pred.cycleLen||28);
    const elap = daysDiff(pred.lastStart,td); const rem = pred.nextStart?daysDiff(td,pred.nextStart):total-elap;
    pct=Math.min(100,Math.max(0,(elap/total)*100)); numEl.textContent=rem; unitEl.textContent='';
    if(rem>0&&rem<=7){label=badges?badges.luteal:'';numEl.style.color='var(--lavender-dark)';bCls='luteal';const l3 = document.querySelector('.lbl-luteal');if(l3)l3.classList.add('current');}
    else if(phase==='luteal'){label=badges?badges.luteal:'';numEl.style.color='var(--lavender-dark)';bCls='luteal';const l4 = document.querySelector('.lbl-luteal');if(l4)l4.classList.add('current');}
    else if(phase==='fertile'){label=badges?badges.fertile:'';numEl.style.color='var(--teal)';bCls='fertile';const o1 = document.querySelector('.lbl-ovulation');if(o1)o1.classList.add('current');}
    else if(phase==='ovulation'){label=badges?badges.ovulation:'';numEl.style.color='var(--teal)';bCls='ovulation';const o2 = document.querySelector('.lbl-ovulation');if(o2)o2.classList.add('current');}
    else if(phase==='follicular'){label=badges?badges.follicular:'';numEl.style.color='var(--sage)';bCls='follicular';const f1 = document.querySelector('.lbl-follicular');if(f1)f1.classList.add('current');}
    else numEl.style.color='var(--text-muted)';
    subEl.textContent=rem>=0?(_txt('daysUntil')||'').replace('{n}',rem):(_txt('expected')||'')+' '+(pred.nextStart?fmtDate(pred.nextStart):'');
  }
  if(fillEl){
    if(typeof animateProgressBar==='function')animateProgressBar(fillEl,pct); else fillEl.style.transform='scaleX('+(pct/100)+')';
    fillEl.setAttribute('role','progressbar'); fillEl.setAttribute('aria-valuenow',Math.round(pct));
    fillEl.setAttribute('aria-valuemin','0'); fillEl.setAttribute('aria-valuemax','100');
    const cm = {period:'var(--love)',late:'var(--love)',follicular:'var(--sage)',ovulation:'var(--teal)',fertile:'var(--teal)',luteal:'var(--lavender)'};
    fillEl.style.background=cm[bCls]||'var(--love)';
  }
  if(badgeEl){badgeEl.textContent=label;badgeEl.className='phase-badge '+(bCls||'');}
}

// 节日摘要
function _renderHolidaySummary(m,y){
  let el=document.getElementById('holidaySummary'); if(!el)return;
  if(typeof HOLIDAYS==='undefined'||!HOLIDAYS){el.style.display='none';return;}
  const mh = []; for(let i=0;i<HOLIDAYS.length;i++){let d=new Date(HOLIDAYS[i].d+'T00:00:00'); if(d.getMonth()===m&&d.getFullYear()===y)mh.push(HOLIDAYS[i]);}
  if(mh.length===0){el.style.display='none';return;}
  el.style.display=''; el.innerHTML=mh.sort(function(a,b){return new Date(a.d+'T00:00:00')-new Date(b.d+'T00:00:00');}).map(function(h){let d=h.d.split('-')[2].replace(/^0/,'');return '<span>'+(h.country==='cn'?'🇨🇳':'🇷🇸')+' '+(h.icon||'')+' '+_langVal(h.name)+' '+d+'</span>';}).join('');
}

// 下一个节日
function _renderUpcomingHoliday(){
  let el=document.getElementById('holidayCountdown'); if(!el)return;
  if(typeof HOLIDAYS==='undefined'||!HOLIDAYS){el.style.display='none';return;}
  let td=new Date();td.setHours(0,0,0,0); const limit = new Date(td);limit.setDate(limit.getDate()+60);
  let upcoming=null;
  for(let i=0;i<HOLIDAYS.length;i++){let d=new Date(HOLIDAYS[i].d+'T00:00:00');if(d>=td&&d<=limit){if(!upcoming||d<new Date(upcoming.d+'T00:00:00'))upcoming=HOLIDAYS[i];}}
  if(upcoming){const days = Math.ceil((new Date(upcoming.d+'T00:00:00')-td)/86400000);el.style.display='';el.textContent='🎌 '+_langVal(upcoming.name)+' · '+(days===0?_txt('holidayToday'):(_txt('holidayDaysAway')||'')+' '+days+' '+_txt('day'));}
  else el.style.display='none';
}

// 图例
function _renderLegend(){
  let el=document.getElementById('legend'); if(!el)return;
  el.innerHTML='<span class="l-period">'+_txt('legendPeriod')+'</span><span class="l-fertile">'+_txt('legendFertile')+'</span><span class="l-follicular">'+_txt('legendFollicular')+'</span><span class="l-luteal">'+_txt('legendLuteal')+'</span><span class="l-heart">'+_txt('legendLove')+'</span>';
}

// ══════════════════════════════════════════════════════════════════
//  导出全局
// ══════════════════════════════════════════════════════════════════
if(typeof window!=='undefined'){window.renderCalendarRenderer=renderCalendarRenderer;window.renderCalendarGrid=renderCalendarGrid;window.DayDataCache=DayDataCache;}

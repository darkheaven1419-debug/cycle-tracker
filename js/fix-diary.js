"use strict";
(function () {
  console.log('[fix-diary] 已加载');

  // ── 日记当前查看日期（全局状态） ──
  var _diaryViewDate = null;

/* ════════════════════════════════════════════════════════════ */
/* ★ 日记模块修复：语言切换 + 新功能（v7.2.1）                  */
/* ════════════════════════════════════════════════════════════ */
(function(){
console.log('[日记] 修复模块启动');
console.log('[日记] 情书卡片布局已添加');

// ── 周期数据恢复：从 shared-cycle-data 合并到 state ──
(function(){
  if (typeof state === 'undefined') return;
  try {
    var sd = JSON.parse(localStorage.getItem('shared-cycle-data') || 'null');
    var profileKey = 'cycle-data-v6-' + (typeof activeProfile !== 'undefined' ? activeProfile : 'andjela');
    var pkData = JSON.parse(localStorage.getItem(profileKey) || 'null');

    var stateCount = state.records ? state.records.length : 0;
    var sdCount = sd && sd.records ? sd.records.length : 0;
    var pkCount = pkData && pkData.records ? pkData.records.length : 0;

    var best = null;
    var bestCount = stateCount;
    if (sdCount > bestCount) { best = sd; bestCount = sdCount; }
    if (pkCount > bestCount) { best = pkData; bestCount = pkCount; }

    if (best && best.records && bestCount > stateCount) {
      state.records = best.records.map(function(r){return new Date(r);});
      state.periodEnds = best.periodEnds || {};
      state.symptoms = best.symptoms || {};
      state.settings = best.settings || state.settings || {};
      try {
        var toSave = JSON.parse(JSON.stringify(state));
        toSave.records = toSave.records.map(function(r){return typeof r==='string'?r:r.getFullYear()+'-'+String(r.getMonth()+1).padStart(2,'0')+'-'+String(r.getDate()).padStart(2,'0');});
        localStorage.setItem(profileKey, JSON.stringify(toSave));
      } catch(e) {}
      if (typeof saveState === 'function') saveState();
      if (typeof renderCalendar === 'function') renderCalendar();
      console.log('[数据恢复] 从 ' + (sdCount > stateCount ? 'shared-cycle-data' : 'profileKey') + ' 恢复了 ' + (bestCount - stateCount) + ' 条记录');
    } else {
      console.log('[数据恢复] state 已有 ' + stateCount + ' 条记录，无需恢复 (shared=' + sdCount + ', profile=' + pkCount + ')');
    }
  } catch(e) {
    console.warn('[数据恢复] 失败:', e.message);
  }
})();

// ── 症状按钮：三重保障 ──
(function(){
function _fixSymTab(){
  var isB = typeof activeProfile !== 'undefined' && activeProfile === 'barry';
  document.body.classList.toggle('is-barry', isB);
  var st = document.getElementById('tab-symptoms');
  if (st) st.style.display = isB ? '' : 'none';
}
var _sp = window.switchProfile;
if (typeof _sp === 'function') {
  window.switchProfile = function(p) {
    _sp(p);
    setTimeout(_fixSymTab, 10);
  };
}
var _up = window.updateProfileUI;
if (typeof _up === 'function') {
  window.updateProfileUI = function() {
    _up.apply(this, arguments);
    _fixSymTab();
  };
}
var _symMo = new MutationObserver(function(){_fixSymTab();});
_symMo.observe(document.body, { childList: true, subtree: true });
_fixSymTab();
setTimeout(_fixSymTab, 500);
setTimeout(_fixSymTab, 1500);
console.log('[安全] 症状按钮三重保障已激活');
})();


// ── 三语硬编码映射表 ──
// NOTE: 日记专用翻译，i18n.js 的 t() 中不存在这些键
// 迁移条件：将 partnerTitle/barryTitle/save/saved 等加入 i18n.js 三语映射
var DD = {
  'zh-CN': {
    partnerTitle: '\u{1F338} Anđela 的信', barryTitle: '\u{1F466} Barry 的信',
    save: '保存', saved: '\u{2705} \u{5DF2}\u{4FDD}\u{5B58}',
    allEntries: '\u{1F4DC} \u{5168}\u{90E8}\u{65E5}\u{8BB0}', mailbox: '\u{1F4EE} \u{4FE1}\u{7BB1}',
    export: '\u{1F4E4} \u{5206}\u{4EAB}', import: '\u{1F4E5} \u{5BFC}\u{5165}',
    edit: '\u{270F}\u{FE0F} \u{7F16}\u{8F91}',
    diaryPlaceholder: '\u{5199}\u{5427}\u{FF0C}\u{4EB2}\u{7231}\u{7684}... \u{270D}\u{FE0F}',
    navPrev: '\u{25C2} \u{4E0A}\u{4E00}\u{5468}', navNext: '\u{4E0B}\u{4E00}\u{5468} \u{25B8}',
    calTitle: '\u{65E5}\u{5386}', writeDatePrefix: '\u{1F48C} ',
    translateBtn: '\u{1F310} \u{7FFB}\u{8BD1}',
    today: '\u{1F4C5} \u{4ECA}\u{5929}', todayTitle: '\u{56DE}\u{5230}\u{4ECA}\u{5929}',
  },
  sr: {
    partnerTitle: '\u{1F338} An\u{0111}elino pismo', barryTitle: '\u{1F466} Barryjevo pismo',
    save: 'Sa\u{010D}uvaj', saved: '\u{2705} Sa\u{010D}uvano',
    allEntries: '\u{1F4DC} Svi unosi', mailbox: '\u{1F4EE} Po\u{0161}tansko sandu\u{010D}e',
    export: '\u{1F4E4} Podeli', import: '\u{1F4E5} Uvezi',
    edit: '\u{270F}\u{FE0F} Uredi',
    diaryPlaceholder: 'Pi\u{0161}i, du\u{0161}o moja... \u{270D}\u{FE0F}',
    navPrev: '\u{25C2} Prethodna nedelja', navNext: 'Slede\u{0107}a nedelja \u{25B8}',
    calTitle: 'Kalendar', writeDatePrefix: '\u{1F48C} ',
    translateBtn: '\u{1F310} Prevedi',
    today: '\u{1F4C5} Danas', todayTitle: 'Nazad na danas',
  },
  en: {
    partnerTitle: '\u{1F338} An\u{0111}ela\'s Letter', barryTitle: '\u{1F466} Barry\'s Letter',
    save: 'Save', saved: '\u{2705} Saved',
    allEntries: '\u{1F4DC} All Entries', mailbox: '\u{1F4EE} Mailbox',
    export: '\u{1F4E4} Share', import: '\u{1F4E5} Import',
    edit: '\u{270F}\u{FE0F} Edit',
    diaryPlaceholder: 'Write, my dear... \u{270D}\u{FE0F}',
    navPrev: '\u{25C2} Previous Week', navNext: 'Next Week \u{25B8}',
    calTitle: 'Calendar', writeDatePrefix: '\u{1F48C} ',
    translateBtn: '\u{1F310} Translate',
    today: '\u{1F4C5} Today', todayTitle: 'Back to today',
  }
};
function _dd(key) {
  var L = window.lang || 'sr';
  var m = DD[L] || DD.sr;
  return m[key] || DD['zh-CN'][key] || key;
}

function _updateDiaryLang() {
  var map = {
    'letter-partner-title': _dd('partnerTitle'), 'diary-timeline-title': _dd('allEntries'),
    'mailbox-title': _dd('mailbox'), 'diary-save-text': _dd('save'),
    'letter-saved-text': _dd('saved'),
    'sd-export': _dd('export'), 'sd-import': _dd('import'), 'modalDiaryEditText': _dd('edit'),
  };
  for (var id in map) { var el = document.getElementById(id); if (el) el.textContent = map[id]; }
  var ta = document.getElementById('diaryTextarea');
  if (ta) ta.placeholder = _dd('diaryPlaceholder');
  var pt = document.getElementById('letter-partner-title');
  if (pt) pt.textContent = (typeof activeProfile !== 'undefined' && activeProfile === 'barry') ? _dd('partnerTitle') : _dd('barryTitle');
  var tb = document.getElementById('letterTranslateBtn');
  if (tb) tb.textContent = _dd('translateBtn');
  var arrows = document.querySelectorAll('.date-strip-arrow');
  if (arrows.length >= 2) { arrows[0].setAttribute('aria-label', _dd('navPrev')); arrows[1].setAttribute('aria-label', _dd('navNext')); }
  var calBtn = document.querySelector('.diary-cal-btn');
  if (calBtn) calBtn.title = _dd('calTitle');
  var todayBtn2 = document.getElementById('diaryTodayBtn');
  if (todayBtn2) { todayBtn2.innerHTML = _dd('today'); todayBtn2.title = _dd('todayTitle'); }
  _renderDiaryDateStrip(_diaryViewDate);
  _applyLetterPaperLayout();
}

function _applyLetterPaperLayout() {
  var panel = document.getElementById('panel-diary');
  if (!panel) return;
  var wc = document.getElementById('diaryWriteCard'), pc = document.getElementById('letterPartnerCard');
  if (!wc && !pc) return;
  if (wc) wc.classList.add('letter-paper-card');
  if (pc) pc.classList.add('letter-paper-card');
  if (wc && pc && wc.parentNode === panel && pc.parentNode === panel) {
    var er = wc.previousElementSibling;
    if (!er || !er.classList.contains('lpc-row')) { var row = document.createElement('div'); row.className = 'lpc-row'; panel.insertBefore(row, wc); row.appendChild(wc); row.appendChild(pc); }
  }
  if (wc && !wc.querySelector('.lpc-footer')) {
    var sigDiv = document.createElement('div');
    sigDiv.className = 'lpc-footer';
    var L = window.lang || 'sr', today = new Date();
    sigDiv.innerHTML = '<span class="lpc-date">\u{1F48C} ' + today.getDate() + '.' + (today.getMonth()+1) + '.' + today.getFullYear() + '</span><span class="lpc-sig">...</span>';
    wc.appendChild(sigDiv);
  }
  setTimeout(_renderOwnSignature, 100);
}


window.saveDiaryEntry = function() {
  var ta = document.getElementById('diaryTextarea');
  if (!ta) { if (typeof toast === 'function') toast('Diary not ready'); return; }
  var text = ta.value.trim();
  if (!text) { if (typeof toast === 'function') toast('\u{1F4DD} ' + (window.lang === 'zh-CN' ? '\u{5199}\u{70B9}\u{4EC0}\u{4E48}\u{5427}' : window.lang === 'en' ? 'Write something' : 'Napi\u{0161}i ne\u{0161}to')); return; }
  try {
    var dateEl = document.getElementById('diaryWriteDate');
    var dateKey = null;
    if (dateEl && dateEl.textContent) { var m = dateEl.textContent.match(/\d{4}-\d{2}-\d{2}/); if (m) dateKey = m[0]; }
    if (!dateKey) { var d = new Date(); dateKey = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
    var mood = '';
    var moodRow = document.getElementById('diaryMoodRow');
    if (moodRow) { var sel = moodRow.querySelector('.mood-emoji.picked,.selected'); if (sel) mood = sel.getAttribute('data-mood')||''; }
    var sd = {};
    try { sd = JSON.parse(localStorage.getItem('shared-diary')||'{}'); } catch(e) {}
    if (!sd[dateKey]) sd[dateKey] = {};
    var user = (typeof activeProfile !== 'undefined') ? activeProfile : 'andjela';
    if (!sd[dateKey][user]) sd[dateKey][user] = {};
    sd[dateKey][user].text = text; sd[dateKey][user].mood = mood; sd[dateKey][user].time = Date.now();
    // 失效缓存后再写 localStorage，避免 _sdCache 读到旧数据
    if (typeof invalidateSDCache === 'function') invalidateSDCache();
    localStorage.setItem('shared-diary', JSON.stringify(sd));
    var badge = document.getElementById('letterSavedBadge');
    if (badge) badge.style.display = '';
    var savedText = document.getElementById('letter-saved-text');
    if (savedText) savedText.textContent = _dd('saved');
    if (typeof pushAllSharedData === 'function') pushAllSharedData();
    _updatePartnerLetter(dateKey);
    _renderOwnSignature();
    if (typeof window._clearDraftForDate === 'function') window._clearDraftForDate(dateKey);
    if (typeof toast === 'function') toast(_dd('saved'));
    // 信纸飞入动画
    var _lpc=document.getElementById('letterPartnerCard');
    if(_lpc){_lpc.classList.remove('fly-in');setTimeout(function(){_lpc.classList.add('fly-in');},50);}
  } catch(e) { console.error('[日记] 保存失败:', e); if (typeof toast === 'function') toast('Error: ' + e.message); }
};



window._updateDiaryLang = _updateDiaryLang;

var _origApply2 = window.applyAllUI;
if (typeof _origApply2 === 'function') { window.applyAllUI = function(w) { _origApply2(w); setTimeout(_updateDiaryLang, 50); }; }

function _parseDateKey(s) { if (!s) return new Date(); var p = s.split('-'); return new Date(parseInt(p[0],10), parseInt(p[1],10)-1, parseInt(p[2],10)); }
function _formatDateKey(d) { return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
window._formatDateKey = _formatDateKey;

function _renderDiaryDateStrip(centerDate) {
  var container = document.getElementById('diaryDateStrip');
  if (!container) return;
  var cd = centerDate ? _parseDateKey(centerDate) : new Date();
  var cdKey = _formatDateKey(cd), L = window.lang || 'sr';
  var sd = {};
  try { sd = JSON.parse(localStorage.getItem('shared-diary')||'{}'); } catch(e) {}
  var user = (typeof activeProfile !== 'undefined') ? activeProfile : 'andjela';
  // 读取纪念日
  // Phase 1.9 §四 — read the canonical accessor, not the input elements.
  // This used to be `document.getElementById('annDateMet').value`, i.e. whatever
  // js/module-settings.js loadSettingsUI() had last written into the Settings
  // input. Until that had run, the value was the static HTML attribute, so this
  // panel badged the wrong day purely because of render order. getAnnDates()
  // resolves the same two localStorage keys the rest of the app uses, and the
  // guard keeps this file loadable standalone (it is not a module).
  var _ann = (typeof getAnnDates === 'function') ? getAnnDates() : { met: '', love: '' };
  var annMet = _ann.met, annLove = _ann.love;
  var annDays = {}; if (annMet) annDays[annMet] = '⭐'; if (annLove) annDays[annLove] = '\u{1F495}';
  var html = '';
  for (var i = -3; i <= 3; i++) {
    var d = new Date(cd); d.setDate(d.getDate()+i);
    var dk = _formatDateKey(d), isC = dk === cdKey, isT = _formatDateKey(new Date()) === dk;
    var hasE = sd[dk] && (sd[dk][user] || sd[dk][user==='barry'?'andjela':'barry']);
    var annIcon = annDays[dk] || '';
    var cls = 'diary-date-btn' + (isC ? ' current' : '') + (isT ? ' today' : '');
    html += '<div class="'+cls+'" data-date="'+dk+'" onclick="window._onDateBtnClick(\''+dk+'\')" style="display:flex;flex-direction:column;align-items:center;padding:4px 6px;border-radius:10px;cursor:pointer;transition:all .2s;min-width:38px;background:'+(isC?'var(--rose-light,#f0d0d0)':'transparent')+';border:1px solid '+(isC?'var(--love,#c45a6b)':'var(--border,#e0d0c8)')+';font-weight:'+(isT?'700':'400')+'">';
    if (annIcon) html += '<span class="dab-badge" style="font-size:.4rem;position:absolute;top:-3px;left:-2px;line-height:1">'+annIcon+'</span>';
    html += '<span style="font-size:.58rem;color:'+(isC?'var(--love,#c45a6b)':'var(--text-muted,#8a7a78)')+';line-height:1.3">'+(d.getMonth()+1)+'/'+d.getDate()+'</span>';
    html += '<span style="font-size:.45rem;color:'+(isC?'var(--love,#c45a6b)':'var(--text-muted,#8a7a78)')+';opacity:.6;line-height:1">'+(L==='zh-CN'?['日','一','二','三','四','五','六'][d.getDay()]:L==='en'?['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]:['Ned','Pon','Uto','Sre','Čet','Pet','Sub'][d.getDay()])+'</span>';
    if (hasE) html += '<span style="font-size:.4rem;color:var(--love,#c45a6b);line-height:1">●</span>'; else html += '<span style="font-size:.4rem;line-height:1;opacity:0">●</span>';
    html += '</div>';
  }
  container.innerHTML = html;
  // 自动将选中日期滚动到容器中央
  (function(){
    var _cb = container.querySelector('.diary-date-btn.current');
    if (_cb) {
      var _to = _cb.offsetLeft - (container.clientWidth / 2) + (_cb.clientWidth / 2);
      container.scrollLeft = Math.max(0, _to);
    }
  })();
}

window._onDateBtnClick = function(dateKey) {
  _setDiaryDate(dateKey); _updatePartnerLetter(dateKey); _renderOwnSignature();
  try {
    var sd = JSON.parse(localStorage.getItem('shared-diary')||'{}');
    var u = (typeof activeProfile !== 'undefined') ? activeProfile : 'andjela';
    var entry = sd[dateKey]&&sd[dateKey][u] ? sd[dateKey][u] : null;
    var ta = document.getElementById('diaryTextarea');
    if (ta) { if (entry&&entry.text) { ta.value = entry.text; var b = document.getElementById('letterSavedBadge'); if (b) b.style.display = ''; } else { ta.value = ''; var b2 = document.getElementById('letterSavedBadge'); if (b2) b2.style.display = 'none'; } }
    var cc = document.getElementById('diaryCharCount');
    if (cc) { var ta2 = document.getElementById('diaryTextarea'); cc.textContent = (ta2?ta2.value.length:0)+'/500'; }
  } catch(e) {}
};

function _setDiaryDate(dateKey) {
  var dateEl = document.getElementById('diaryWriteDate');
  if (!dateEl) return;
  var d = dateKey ? _parseDateKey(dateKey) : new Date();
  if (!dateKey) dateKey = _formatDateKey(d);
  var L = window.lang || 'sr';
  var dayNames = L === 'zh-CN' ? ['\u{65E5}','\u{4E00}','\u{4E8C}','\u{4E09}','\u{56DB}','\u{4E94}','\u{516D}'] : L === 'en' ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] : ['Ned','Pon','Uto','Sre','\u{010C}et','Pet','Sub'];
  dateEl.textContent = '\u{1F48C} ' + dayNames[d.getDay()] + ' ' + dateKey;
  _diaryViewDate = dateKey;
  _renderDiaryDateStrip(dateKey);
}
window._setDiaryDate = _setDiaryDate;

/* Phase 2C — 「她的信」入口打开时该落在哪一天。
   回忆面板里切到 📖 日记，如果永远停在今天，那么明天打开就是一片空白，
   而这个人写了一年的日记 —— 她是空的这件事会被读成「这里什么都没有」。
   所以默认落到**最近一个真的有人写过东西的日期**（我或她，任一）。
   三条规矩：
   1. 只认 `YYYY-MM-DD` 形状的 key —— 这个 localStorage 里混过别的东西，
      不筛的话 `Object.keys().sort().pop()` 会把 "zzz" 之类的垃圾日期当成最新一天。
   2. 不认未来日期 —— 往前翻能翻到明天（日期条 ±7 天），一篇写给明天的日记
      不该变成入口的默认落点。
   3. 要求这一天至少有一侧有 text —— 只存了 mood 或空对象的壳不算「有内容」。
   都没有就回今天：空日记本上也该让人立刻能写。 */
function _latestDiaryDate() {
  var today = _formatDateKey(new Date());
  var best = null;
  try {
    var sd = JSON.parse(localStorage.getItem('shared-diary') || '{}') || {};
    Object.keys(sd).forEach(function (k) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) return;
      if (k > today) return;
      var slot = sd[k] || {};
      var b = slot.barry, a = slot.andjela;
      var hasText = (b && b.text) || (a && a.text);
      if (!hasText) return;
      if (!best || k > best) best = k;
    });
  } catch (e) {}
  return best || today;
}
window._latestDiaryDate = _latestDiaryDate;

window.scrollDiaryStrip = function(direction) {
  if (direction !== -1 && direction !== 1) return;
  var currentKey = _diaryViewDate;
  if (!currentKey) { var d = new Date(); currentKey = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  var d = _parseDateKey(currentKey); d.setDate(d.getDate()+(direction*7));
  var newKey = _formatDateKey(d);
  _setDiaryDate(newKey); _updatePartnerLetter(newKey); _renderOwnSignature();
  try {
    var sd = JSON.parse(localStorage.getItem('shared-diary')||'{}');
    var user = (typeof activeProfile!=='undefined')?activeProfile:'andjela';
    var ue = sd[newKey]&&sd[newKey][user]?sd[newKey][user]:null;
    var ta = document.getElementById('diaryTextarea');
    if (ta) { if (ue&&ue.text) { ta.value=ue.text; var b=document.getElementById('letterSavedBadge'); if(b)b.style.display=''; } else { ta.value=''; var b2=document.getElementById('letterSavedBadge'); if(b2)b2.style.display='none'; } }
  } catch(e) {}
  var cc = document.getElementById('diaryCharCount');
  if (cc) { var ta2 = document.getElementById('diaryTextarea'); cc.textContent = (ta2?ta2.value.length:0)+'/500'; }
};

window.toggleDiaryCalendar = function() {
  var ex = document.getElementById('diaryCalPicker');
  if (ex) { ex.remove(); return; }
  var picker = document.createElement('div');
  picker.id = 'diaryCalPicker';
  picker.style.cssText = 'position:absolute;top:100%;right:0;z-index:100;background:var(--card,#fff);border:1px solid var(--border);border-radius:12px;padding:8px;box-shadow:0 4px 20px rgba(0,0,0,.12);width:240px;max-height:300px;overflow-y:auto';
  var html = '<div style="font-size:.65rem;font-weight:700;text-align:center;margin-bottom:6px;color:var(--text-muted)">📅 '+(window.lang==='zh-CN'?'选择日期':window.lang==='en'?'Pick a date':'Izaberi datum')+'</div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center">';
  var L = window.lang || 'sr';
  var dh = L==='zh-CN'?['日','一','二','三','四','五','六']:L==='en'?['Su','Mo','Tu','We','Th','Fr','Sa']:['Ne','Po','Ut','Sr','Če','Pe','Su'];
  for (var hi=0;hi<7;hi++) html+='<span style="font-size:.5rem;color:var(--text-muted);padding:2px 0">'+dh[hi]+'</span>';
  var today = new Date(); today.setHours(0,0,0,0);
  for (var i=30;i>=-7;i--) { var d=new Date(today); d.setDate(d.getDate()-i); var dk=_formatDateKey(d); var isT=d.getTime()===today.getTime(), isC=dk===_diaryViewDate;
    html+='<div onclick="var d=this.dataset.date;document.getElementById(\'diaryCalPicker\').remove();window.scrollDiaryStrip(0);_diaryViewDate=d;_setDiaryDate(d);_updatePartnerLetter(d);try{var sd=JSON.parse(localStorage.getItem(\'shared-diary\')||\'{}\');var u=(typeof activeProfile!==\'undefined\')?activeProfile:\'andjela\';var e=sd[d]&&sd[d][u]?sd[d][u]:null;var ta=document.getElementById(\'diaryTextarea\');if(ta){if(e&&e.text){ta.value=e.text;document.getElementById(\'letterSavedBadge\').style.display=\'\'}else{ta.value=\'\';document.getElementById(\'letterSavedBadge\').style.display=\'none\'}}var cc=document.getElementById(\'diaryCharCount\');if(cc){var ta2=document.getElementById(\'diaryTextarea\');cc.textContent=(ta2?ta2.value.length:0)+\'/500\'}}catch(e){}" data-date="'+dk+'" style="cursor:pointer;padding:4px 2px;border-radius:6px;font-size:.62rem;background:'+(isC?'var(--love)':isT?'var(--rose-light)':'transparent')+';color:'+(isC?'#fff':'var(--text)')+';font-weight:'+(isT?'700':'400')+'">'+d.getDate()+'</div>'; }
  html += '</div>'; picker.innerHTML = html;
  var calBtn = document.querySelector('.diary-cal-btn');
  if (calBtn&&calBtn.parentNode) { calBtn.parentNode.style.position='relative'; calBtn.parentNode.appendChild(picker); }
  else { document.getElementById('panel-diary').appendChild(picker); }
};

var _origSD2 = window.initSharedDiaryTab;
window.initSharedDiaryTab = function() {
  if (typeof _origSD2 === 'function') _origSD2();
  _setDiaryDate();
  var _sr=0,_st=setInterval(function(){_sr++;var c=document.getElementById('diaryDateStrip');if(c&&c.innerHTML===''&&_diaryViewDate)_renderDiaryDateStrip(_diaryViewDate);if(_sr>20||(c&&c.innerHTML!==''))clearInterval(_st);},100);
  var d=new Date(); var dk=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  _updatePartnerLetter(dk); _renderOwnSignature();
  var badge=document.getElementById('letterSavedBadge'); if(badge)badge.style.display='none';
  setTimeout(_updateDiaryLang,300);
  setTimeout(_updateSigBtnText,350);
  // ── 注入「今天」按钮 ──
  /* Phase 2C — 日期条能往回翻 7 天、月历能挑 30 天，但**回今天**这条最短的路
     原来不存在：翻到半个月前之后只能一天一天点回来。默认落点会变（见 _latestDiaryDate），
     落点一旦不是今天，这个按钮就是唯一的「一步回家」。
     走 _onDateBtnClick 而不是只 _setDiaryDate —— 后者只换日期和日期条，
     不把这一天的内容（她的信、我的草稿、签名）一起装回来。 */
  (function(){
    if(document.getElementById('diaryTodayBtn'))return;
    var wrap0=document.querySelector('.diary-date-strip-wrap');
    if(!wrap0)return;
    var todayBtn=document.createElement('button');
    todayBtn.id='diaryTodayBtn';
    todayBtn.type='button';
    todayBtn.innerHTML=_dd('today');
    todayBtn.title=_dd('todayTitle');
    // 44px 最小高度：这是拇指目标，不是排版装饰。
    todayBtn.style.cssText='min-height:44px;padding:4px 12px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:.72rem;cursor:pointer;margin-left:4px;white-space:nowrap';
    todayBtn.onclick=function(){
      var d=new Date();
      var dk=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
      if(typeof window._onDateBtnClick==='function')window._onDateBtnClick(dk);
      else _setDiaryDate(dk);
    };
    wrap0.appendChild(todayBtn);
  })();
  // ── 注入同步刷新按钮 + 状态指示器 ──
  (function(){
    if(document.getElementById('diarySyncBtn'))return;
    var wrap=document.querySelector('.diary-date-strip-wrap');
    if(!wrap)return;
    var L=window.lang||'sr';
    // 状态文字
    var statusSpan=document.createElement('span');
    statusSpan.id='diarySyncStatus';
    statusSpan.style.cssText='font-size:.6rem;color:var(--text-muted);margin-left:4px;transition:opacity .3s;opacity:0';
    // 按钮
    var syncBtn=document.createElement('button');
    syncBtn.id='diarySyncBtn';
    syncBtn.innerHTML='🔄';
    syncBtn.title=L==='zh-CN'?'同步日记':L==='en'?'Sync diary':'Sinhronizuj dnevnik';
    syncBtn.style.cssText='padding:4px 8px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:.72rem;cursor:pointer;margin-left:4px;white-space:nowrap';
    function _showStatus(msg,color,duration){
      statusSpan.textContent=msg;
      statusSpan.style.color=color;
      statusSpan.style.opacity='1';
      if(duration)setTimeout(function(){statusSpan.style.opacity='0';},duration);
    }
    syncBtn.onclick=function(){
      syncBtn.innerHTML='⏳';
      _showStatus(L==='zh-CN'?'同步中...':L==='en'?'Syncing...':'Sinhronizacija...','var(--gold)',0);
      if(typeof pullAllSharedData==='function'){
        var _oldDC2=0;try{_oldDC2=Object.keys(JSON.parse(localStorage.getItem('shared-diary')||'{}')).length;}catch(e){}
        pullAllSharedData().then(function(){
          syncBtn.innerHTML='✅';
          _showStatus(L==='zh-CN'?'已同步':L==='en'?'Synced':'Sinhronizovano','var(--sage)',3000);
          setTimeout(function(){syncBtn.innerHTML='🔄';},3000);
          try{var _newDC2=Object.keys(JSON.parse(localStorage.getItem('shared-diary')||'{}')).length;if(_newDC2>_oldDC2&&typeof toast==='function'){var _who2=activeProfile==='barry'?'Anđela':'Barry';toast('\u{1F48C} '+_who2+(L==='zh-CN'?'写了新日记':L==='en'?' wrote a new letter!':' je napisao/la novo pismo!'));}}catch(e){}
        }).catch(function(){
          syncBtn.innerHTML='⚠️';
          _showStatus(L==='zh-CN'?'同步失败':L==='en'?'Sync failed':'Greška','var(--rose)',5000);
          setTimeout(function(){syncBtn.innerHTML='🔄';},5000);
        });
      }else{
        syncBtn.innerHTML='⚠️';
        _showStatus(L==='zh-CN'?'同步不可用':L==='en'?'Unavailable':'Nedostupno','var(--rose)',3000);
        setTimeout(function(){syncBtn.innerHTML='🔄';},3000);
      }
    };
    wrap.appendChild(statusSpan);
    wrap.appendChild(syncBtn);
  })();
};

var _dp=document.getElementById('panel-diary');
if(_dp){var _dpMo=new MutationObserver(function(){if(_dp.classList.contains('active')){if(!_diaryViewDate){var _n=new Date();_diaryViewDate=_n.getFullYear()+'-'+String(_n.getMonth()+1).padStart(2,'0')+'-'+String(_n.getDate()).padStart(2,'0');}_renderDiaryDateStrip(_diaryViewDate);setTimeout(_renderOwnSignature,150);setTimeout(_updateDiaryLang,200);// 切换到日记 tab 时自动触发同步拉取
if(typeof pullAllSharedData==='function'){console.log('[同步] 日记tab激活，自动拉取...');var _oldDC=0;try{_oldDC=Object.keys(JSON.parse(localStorage.getItem('shared-diary')||'{}')).length;}catch(e){}setTimeout(function(){pullAllSharedData().then(function(){try{var _newDC=Object.keys(JSON.parse(localStorage.getItem('shared-diary')||'{}')).length;if(_newDC>_oldDC&&typeof toast==='function'){var _who=activeProfile==='barry'?'Anđela':'Barry';toast('\u{1F48C} '+_who+(L==='zh-CN'?'写了新日记':L==='en'?' wrote a new letter!':' je napisao/la novo pismo!'));}}catch(e){}});},300);}}});_dpMo.observe(_dp,{attributes:true,attributeFilter:['class']});}

setTimeout(_updateDiaryLang,1000);
console.log('[日记] 语言修复完成');

// ── 草稿自动保存 + 字数预警 ──
(function(){var _dt=null;var _ta=document.getElementById('diaryTextarea');if(!_ta)return;
function _dk(){return 'draft-'+(_diaryViewDate||_formatDateKey(new Date()));}
function _sd(){var k=_dk();var v=_ta.value.trim();if(v){localStorage.setItem(k,JSON.stringify({text:v,time:Date.now()}));}else{localStorage.removeItem(k);}}
function _updCC(){var cc=document.getElementById('diaryCharCount');if(!cc)return;var len=_ta.value.length;cc.textContent=len+'/500';cc.style.color=len>490?'#E65100':len>450?'#FF8F00':'';cc.style.fontWeight=len>490?'700':'400';}
function _rd(){var k=_dk();try{var d=JSON.parse(localStorage.getItem(k));if(d&&d.text&&d.text.trim()&&d.text!==_ta.value){_ta.value=d.text;console.log('[草稿] 已恢复:',k);_updCC();}}catch(e){}}
window._clearDraft=function(){localStorage.removeItem(_dk());};
window._clearDraftForDate=function(dk){localStorage.removeItem('draft-'+dk);};
_ta.addEventListener('input',function(){if(_dt)clearTimeout(_dt);_dt=setTimeout(_sd,3000);_updCC();});
_ta.addEventListener('blur',function(){_sd();});
_ta.addEventListener('focus',function(){setTimeout(function(){_ta.scrollIntoView({block:'center',behavior:'smooth'});},300);});
window._restoreDraft=_rd;
window._updateCharCount=_updCC;
console.log('[草稿] 自动保存已启动');
})();

// 日期切换时恢复草稿
var _odc=window._onDateBtnClick;window._onDateBtnClick=function(dk){if(typeof _odc==='function')_odc(dk);setTimeout(function(){if(typeof window._restoreDraft==='function')window._restoreDraft();if(typeof window._updateCharCount==='function')window._updateCharCount();},50);};
var _osc=window.scrollDiaryStrip;window.scrollDiaryStrip=function(d){if(typeof _osc==='function')_osc(d);setTimeout(function(){if(typeof window._restoreDraft==='function')window._restoreDraft();if(typeof window._updateCharCount==='function')window._updateCharCount();},50);};

})();

// ── 共享函数（主日记 + 终极包共用） ──
function _getLatestSignature(user) {
  var latest = null, latestDate = '';
  for (var _i = 0; _i < localStorage.length; _i++) {
    var _k = localStorage.key(_i);
    if (_k && _k.indexOf(user + '-signature-') === 0) {
      var _d = _k.replace(user + '-signature-', '');
      if (_d.length === 10 && _d > latestDate) { latestDate = _d; latest = localStorage.getItem(_k); }
    }
  }
  return latest;
}
function _renderOwnSignature() {
  var sig = document.querySelector('#diaryWriteCard .lpc-sig');
  if (!sig) return;
  var user = (typeof activeProfile !== 'undefined') ? activeProfile : 'andjela';
  // 按日期读取签名，无专属签名时回退到最新签名
  var dateKey = _diaryViewDate;
  var sigData = dateKey ? localStorage.getItem(user + '-signature-' + dateKey) : null;
  if (!sigData) sigData = _getLatestSignature(user);
  if (sigData) { sig.innerHTML = '<img src="' + sigData + '" style="max-height:50px;max-width:150px;opacity:.8;border-radius:4px;vertical-align:middle" alt="signature">'; }
  else { sig.textContent = '—— ' + (user === 'barry' ? 'Barry' : 'Anđela') + ' \u{270D}\u{FE0F}'; }
  var dateEl = document.querySelector('#diaryWriteCard .lpc-date');
  if (dateEl && _diaryViewDate) { var parts = _diaryViewDate.split('-'); if (parts.length === 3) dateEl.textContent = '\u{1F48C} ' + parseInt(parts[2],10) + '.' + parseInt(parts[1],10) + '.'; }
}
function escHtml(s) { if (!s) return ''; var d = document.createElement('div'); d.appendChild(document.createTextNode(s)); return d.innerHTML; }

// === 日记终极功能包：伴侣的信 + 翻译 + 签名 ===
/* Phase 2C — 这个包原来叫「写作锁 + 翻译 + 签名」，现在锁没了（见 _updatePartnerLetter），
   名字跟着改：它只剩「显示她的信 / 翻译 / 签名」三件事。 */
(function(){
  console.log('[日记终极包] 已加载');
  window._updatePartnerLetter = function(dateKey) {
    if (!dateKey) { var d=new Date(); dateKey=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
    try {
      var sd=JSON.parse(localStorage.getItem('shared-diary')||'{}');
      var user=(typeof activeProfile!=='undefined')?activeProfile:'barry';
      var partner=user==='barry'?'andjela':'barry';
      var dayData=sd[dateKey]||{};
      var partnerEntry=dayData[partner];
      var contentEl=document.getElementById('letterPartnerContent'), transBtn=document.getElementById('letterTranslateBtn');
      /* Phase 2C — 写作锁取消。
         这里原本还有一条 `if (!myEntry || !myEntry.text)` 的分支：当天自己没写，她的信
         就完全不渲染，只留一堵 🔒「先写你的信才能解锁她的」。它和 myEntry 一起删掉了 ——
         读对方的信不该以先写一篇为前提，而这道门槛恰好挡在「我只想看看她写了什么」
         那条最短路径上。现在只有两种状态：她写了（显示信），她没写（空状态）。
         我这一天的日记在旁边的编辑器里，两栏互不设条件。
         index.html 里那个 #letterLocked 一并删除 —— 锁没有了，锁的 UI 不该留在页面里。
         顺带修一处真 bug：署名原本取 user，也就是**读信人自己**的签名，所以她写给你
         的信落款是你的名字。签名和兜底署名一并改成 partner。 */
      /* 空状态文案对**读信人**是中性的：写这段的时候 activeProfile 可能是
         andjela，那时对面是 Barry，写「她还没有写」就是错的。中文沿用这套代码
         里既有的中性说法「Ta」（旧文案就是「Ta还没有写」），塞尔维亚语换成不带
         性别分词的句式，英语本来就是中性的。 */
      if (!partnerEntry||!partnerEntry.text) { if(contentEl){contentEl.style.display='';contentEl.innerHTML='<div style="text-align:center;padding:20px;color:var(--text-muted)">📭 '+(window.lang==='zh-CN'?'Ta \u{8FD9}\u{4E00}\u{5929}\u{8FD8}\u{6CA1}\u{6709}\u{5199} \u{1F48C}':window.lang==='en'?'Nothing from your partner on this day \u{1F48C}':'Ovog dana jo\u{0161} nema ni\u{0161}ta od partnera \u{1F48C}')+'</div>';} if(transBtn)transBtn.style.display='none'; }
      else { if(contentEl){contentEl.style.display='';var _html='<div style="padding:12px;font-size:.85rem;line-height:1.8;white-space:pre-wrap">'+escHtml(partnerEntry.text)+'</div>';if(partnerEntry.mood)_html+='<div style="text-align:right;font-size:1.2rem;margin-top:8px">'+partnerEntry.mood+'</div>';var _sigData=localStorage.getItem(partner+'-signature-'+(dateKey||''));if(!_sigData&&typeof _getLatestSignature==='function')_sigData=_getLatestSignature(partner);if(_sigData)_html+='<div style="text-align:right;margin-top:12px"><img src="'+_sigData+'" style="max-height:50px;max-width:150px;opacity:.8;border-radius:4px" alt="signature"></div>';else _html+='<div style="text-align:right;margin-top:12px;font-family:cursive,serif;font-style:italic;font-size:1.05rem;color:var(--text-muted,#8a7a78)">—— '+(partner==='barry'?'Barry':'Anđela')+' ✍️</div>';contentEl.innerHTML=_html;}if(transBtn){transBtn.style.display='';transBtn.style.marginTop='10px';if(transBtn.parentNode!==contentEl.parentNode){contentEl.parentNode.appendChild(transBtn);}}}
    } catch(e) { console.warn('[伴侣的信] 更新失败:', e.message); }
  };
  window.translatePartnerLetter = function() {
    var contentEl=document.getElementById('letterPartnerContent'), btn=document.getElementById('letterTranslateBtn');
    if(!contentEl||!btn)return; var originalText=contentEl.textContent||''; if(!originalText.trim())return;
    if(contentEl.dataset.translated==='true'){contentEl.dataset.translated='false';btn.textContent=window.lang==='zh-CN'?'🌐 翻译':window.lang==='en'?'🌐 Translate':'🌐 Prevedi';var d=new Date(),dk=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');window._updatePartnerLetter(dk);}
    else {btn.textContent=window.lang==='zh-CN'?'⏳ 翻译中...':window.lang==='en'?'⏳ Translating...':'⏳ Prevođenje...';var targetLang=(window.lang==='zh-CN')?'zh-CN':(window.lang==='sr'?'sr':'en');var sourceLang=(targetLang==='zh-CN')?'sr':(targetLang==='sr'?'zh-CN':'sr');var url='https://translate.googleapis.com/translate_a/single?client=gtx&sl='+sourceLang+'&tl='+targetLang+'&dt=t&q='+encodeURIComponent(originalText);fetch(url).then(function(r){return r.json();}).then(function(data){if(data&&data[0]){var translated=data[0].map(function(s){return s[0];}).join('');contentEl.innerHTML='<div style="padding:12px;font-size:.85rem;line-height:1.8;white-space:pre-wrap">'+escHtml(translated)+'</div>';contentEl.dataset.translated='true';btn.textContent=window.lang==='zh-CN'?'📋 查看原文':window.lang==='en'?'📋 Original':'📋 Original';}}).catch(function(e){console.warn('[翻译] 失败:',e.message);btn.textContent=window.lang==='zh-CN'?'🌐 翻译':window.lang==='en'?'🌐 Translate':'🌐 Prevedi';});}
  };
  window._openSignaturePad = function() {
    var overlay=document.createElement('div'); overlay.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.7);z-index:99999;display:flex;align-items:center;justify-content:center'; overlay.onclick=function(e){if(e.target===overlay)overlay.remove();};
    var pad=document.createElement('div'); pad.style.cssText='background:#fdf5e6;border-radius:16px;padding:20px;width:90%;max-width:400px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,.3)';
    var title=document.createElement('div'); title.textContent=window.lang==='zh-CN'?'✍️ 手写签名':window.lang==='en'?'✍️ Signature':'✍️ Potpis'; title.style.cssText='font-size:1rem;font-weight:700;margin-bottom:12px;color:#5a3e2b'; pad.appendChild(title);
    var canvas=document.createElement('canvas'); canvas.width=350; canvas.height=150; canvas.style.cssText='background:#fff;border:1px solid #e8d5c4;border-radius:8px;touch-action:none;width:100%'; pad.appendChild(canvas);
    var _colors=[{name:'#2c1810',label:'⚫'},{name:'#1a237e',label:'🔵'},{name:'#8b0000',label:'🔴'}]; var _curColor=_colors[0].name;
    var ctx=canvas.getContext('2d'); ctx.strokeStyle=_curColor; ctx.lineWidth=2; ctx.lineCap='round'; var drawing=false;
    canvas.onpointerdown=function(e){drawing=true;ctx.beginPath();var r=canvas.getBoundingClientRect();ctx.moveTo(e.clientX-r.left,e.clientY-r.top);canvas.setPointerCapture(e.pointerId);e.preventDefault();};
    canvas.onpointermove=function(e){if(!drawing)return;var r=canvas.getBoundingClientRect();ctx.lineTo(e.clientX-r.left,e.clientY-r.top);ctx.stroke();e.preventDefault();};
    canvas.onpointerup=function(){drawing=false;}; canvas.onpointercancel=function(){drawing=false;};
    // 颜色选择器
    var colorRow=document.createElement('div'); colorRow.style.cssText='display:flex;gap:10px;margin-top:8px;justify-content:center;align-items:center';
    colorRow.innerHTML='<span style="font-size:.7rem;color:#8a7a6a;margin-right:4px">🎨</span>';
    for(var _ci=0;_ci<_colors.length;_ci++){(function(_c){var _swatch=document.createElement('span');_swatch.style.cssText='display:inline-block;width:28px;height:28px;border-radius:50%;background:'+_c.name+';cursor:pointer;border:3px solid '+( _c.name===_curColor ? 'var(--gold,#b89147)' : 'transparent')+';transition:border .2s';_swatch.onclick=function(){_curColor=_c.name;ctx.strokeStyle=_curColor;colorRow.querySelectorAll('.sig-swatch').forEach(function(s){s.style.border='3px solid transparent';});_swatch.style.border='3px solid var(--gold,#b89147)';};_swatch.className='sig-swatch';colorRow.appendChild(_swatch);})(_colors[_ci]);}
    pad.appendChild(colorRow);
    var btnRow=document.createElement('div'); btnRow.style.cssText='display:flex;gap:8px;margin-top:10px;justify-content:center';
    var clearBtn=document.createElement('button'); clearBtn.textContent=window.lang==='zh-CN'?'清除':window.lang==='en'?'Clear':'Obriši'; clearBtn.style.cssText='padding:8px 16px;border:1px solid #ccc;border-radius:8px;background:#fff;cursor:pointer;font-size:.8rem'; clearBtn.onclick=function(){ctx.clearRect(0,0,canvas.width,canvas.height);};
    var saveBtn=document.createElement('button'); saveBtn.textContent='💾 '+(window.lang==='zh-CN'?'保存':window.lang==='en'?'Save':'Sačuvaj'); saveBtn.style.cssText='padding:8px 16px;border:none;border-radius:8px;background:var(--love,#c45a6b);color:#fff;cursor:pointer;font-size:.8rem;font-weight:600';
    saveBtn.onclick=function(){var dataUrl=canvas.toDataURL('image/png');var user2=(typeof activeProfile!=='undefined')?activeProfile:'barry';var _dateKey=_diaryViewDate||(function(){var _d=new Date();return _d.getFullYear()+'-'+String(_d.getMonth()+1).padStart(2,'0')+'-'+String(_d.getDate()).padStart(2,'0');})();localStorage.setItem(user2+'-signature-'+_dateKey,dataUrl);overlay.remove();_renderOwnSignature();if(typeof _updatePartnerLetter==='function')_updatePartnerLetter(_dateKey);console.log('[签名] 已保存 ('+user2+', '+_dateKey+')');};
    btnRow.appendChild(clearBtn); btnRow.appendChild(saveBtn); pad.appendChild(btnRow); overlay.appendChild(pad); document.body.appendChild(overlay);
  };
  console.log('[日记终极包] 伴侣的信+翻译+签名 已就绪');
})();

function _updateSigBtnText() { var sb=document.getElementById('diarySigBtn'); if(!sb)return; var _l=window.lang||'sr'; sb.textContent=_l==='zh-CN'?'✍️ 设置签名':_l==='en'?'✍️ Set Signature':'✍️ Potpis'; }

(function(){
  function _injectSignatureBtn() { var saveBtn=document.getElementById('diarySaveBtn'); if(!saveBtn)return; if(document.getElementById('diarySigBtn'))return; var sigBtn=document.createElement('button'); sigBtn.id='diarySigBtn'; sigBtn.style.cssText='padding:6px 12px;border:1px dashed var(--border,#d4bfa0);border-radius:8px;background:transparent;cursor:pointer;font-size:.72rem;transition:all .2s;margin-left:6px;white-space:nowrap'; sigBtn.onmouseover=function(){this.style.background='var(--rose-light,#f0d0d0)';}; sigBtn.onmouseout=function(){this.style.background='transparent';}; sigBtn.onclick=function(){if(typeof window._openSignaturePad==='function')window._openSignaturePad();}; sigBtn.textContent='✍️'; saveBtn.parentNode.insertBefore(sigBtn,saveBtn.nextSibling); setTimeout(_updateSigBtnText,100); }
  _injectSignatureBtn(); var _mo=new MutationObserver(function(){_injectSignatureBtn();}); _mo.observe(document.body,{childList:true,subtree:true});
  // 重试包裹 applyAllUI（该函数在 app.js defer 加载后才存在）
  (function(){
    function _tryHook() {
      var _oa = window.applyAllUI;
      if (typeof _oa === 'function') {
        window.applyAllUI = function(w) { _oa(w); setTimeout(_updateSigBtnText, 100); };
        return true;
      }
      return false;
    }
    if (!_tryHook()) {
      var _hookRetry = setInterval(function() { if (_tryHook()) clearInterval(_hookRetry); }, 200);
      setTimeout(function() { clearInterval(_hookRetry); }, 5000);
    }
  })();
  console.log('[签名按钮] 已就绪');
})();

})();

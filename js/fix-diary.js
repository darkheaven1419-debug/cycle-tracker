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
    lockText: '\u{1F512} \u{5199}\u{5B8C}\u{81EA}\u{5DF1}\u{7684}\u{65E5}\u{8BB0}\u{624D}\u{80FD}\u{67E5}\u{770B}\u{4ED6}/\u{5979}\u{7684}\u{54E6} \u{1F48C}',
    navPrev: '\u{25C2} \u{4E0A}\u{4E00}\u{5468}', navNext: '\u{4E0B}\u{4E00}\u{5468} \u{25B8}',
    calTitle: '\u{65E5}\u{5386}', writeDatePrefix: '\u{1F48C} ',
    translateBtn: '\u{1F310} \u{7FFB}\u{8BD1}', chineseLearn: '\u{1F4DA} \u{5B66}\u{4E2D}\u{6587}',
  },
  sr: {
    partnerTitle: '\u{1F338} An\u{0111}elino pismo', barryTitle: '\u{1F466} Barryjevo pismo',
    save: 'Sa\u{010D}uvaj', saved: '\u{2705} Sa\u{010D}uvano',
    allEntries: '\u{1F4DC} Svi unosi', mailbox: '\u{1F4EE} Po\u{0161}tansko sandu\u{010D}e',
    export: '\u{1F4E4} Podeli', import: '\u{1F4E5} Uvezi',
    edit: '\u{270F}\u{FE0F} Uredi',
    diaryPlaceholder: 'Pi\u{0161}i, du\u{0161}o moja... \u{270D}\u{FE0F}',
    lockText: '\u{1F512} Napi\u{0161}i svoje pismo da otklju\u{010D}a\u{0161} partnerovo \u{1F48C}',
    navPrev: '\u{25C2} Prethodna nedelja', navNext: 'Slede\u{0107}a nedelja \u{25B8}',
    calTitle: 'Kalendar', writeDatePrefix: '\u{1F48C} ',
    translateBtn: '\u{1F310} Prevedi', chineseLearn: '\u{1F4DA} Kineski',
  },
  en: {
    partnerTitle: '\u{1F338} An\u{0111}ela\'s Letter', barryTitle: '\u{1F466} Barry\'s Letter',
    save: 'Save', saved: '\u{2705} Saved',
    allEntries: '\u{1F4DC} All Entries', mailbox: '\u{1F4EE} Mailbox',
    export: '\u{1F4E4} Share', import: '\u{1F4E5} Import',
    edit: '\u{270F}\u{FE0F} Edit',
    diaryPlaceholder: 'Write, my dear... \u{270D}\u{FE0F}',
    lockText: '\u{1F512} Write your diary first to unlock your partner\'s \u{1F48C}',
    navPrev: '\u{25C2} Previous Week', navNext: 'Next Week \u{25B8}',
    calTitle: 'Calendar', writeDatePrefix: '\u{1F48C} ',
    translateBtn: '\u{1F310} Translate', chineseLearn: '\u{1F4DA} Learn Chinese',
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
    'letter-saved-text': _dd('saved'), 'letter-lock-text': _dd('lockText'),
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
    localStorage.setItem('shared-diary', JSON.stringify(sd));
    var badge = document.getElementById('letterSavedBadge');
    if (badge) badge.style.display = '';
    var savedText = document.getElementById('letter-saved-text');
    if (savedText) savedText.textContent = _dd('saved');
    if (typeof pushAllSharedData === 'function') pushAllSharedData();
    _updatePartnerLetter(dateKey);
    _renderOwnSignature();
    if (typeof toast === 'function') toast(_dd('saved'));
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
  var html = '';
  for (var i = -3; i <= 3; i++) {
    var d = new Date(cd); d.setDate(d.getDate()+i);
    var dk = _formatDateKey(d), isC = dk === cdKey, isT = _formatDateKey(new Date()) === dk;
    var hasE = sd[dk] && (sd[dk][user] || sd[dk][user==='barry'?'andjela':'barry']);
    html += '<div class="diary-date-btn'+(isC?' current':'')+'" data-date="'+dk+'" onclick="window._onDateBtnClick(\''+dk+'\')" style="display:flex;flex-direction:column;align-items:center;padding:4px 6px;border-radius:10px;cursor:pointer;transition:all .2s;min-width:38px;background:'+(isC?'var(--rose-light,#f0d0d0)':'transparent')+';border:1px solid '+(isC?'var(--love,#c45a6b)':'var(--border,#e0d0c8)')+';font-weight:'+(isT?'700':'400')+'">';
    html += '<span style="font-size:.58rem;color:'+(isC?'var(--love,#c45a6b)':'var(--text-muted,#8a7a78)')+';line-height:1.3">'+(d.getMonth()+1)+'/'+d.getDate()+'</span>';
    html += '<span style="font-size:.45rem;color:'+(isC?'var(--love,#c45a6b)':'var(--text-muted,#8a7a78)')+';opacity:.6;line-height:1">'+(L==='zh-CN'?['日','一','二','三','四','五','六'][d.getDay()]:L==='en'?['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]:['Ned','Pon','Uto','Sre','Čet','Pet','Sub'][d.getDay()])+'</span>';
    if (hasE) html += '<span style="font-size:.4rem;color:var(--love,#c45a6b);line-height:1">●</span>'; else html += '<span style="font-size:.4rem;line-height:1;opacity:0">●</span>';
    html += '</div>';
  }
  container.innerHTML = html;
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
};

var _dp=document.getElementById('panel-diary');
if(_dp){var _dpMo=new MutationObserver(function(){if(_dp.classList.contains('active')){if(!_diaryViewDate){var _n=new Date();_diaryViewDate=_n.getFullYear()+'-'+String(_n.getMonth()+1).padStart(2,'0')+'-'+String(_n.getDate()).padStart(2,'0');}_renderDiaryDateStrip(_diaryViewDate);setTimeout(_renderOwnSignature,150);setTimeout(_updateDiaryLang,200);}});_dpMo.observe(_dp,{attributes:true,attributeFilter:['class']});}

setTimeout(_updateDiaryLang,1000);
console.log('[日记] 语言修复完成');
})();

// ── 共享函数（主日记 + 终极包共用） ──
function _renderOwnSignature() {
  var sig = document.querySelector('#diaryWriteCard .lpc-sig');
  if (!sig) return;
  var user = (typeof activeProfile !== 'undefined') ? activeProfile : 'andjela';
  var sigData = localStorage.getItem(user + '-signature');
  if (sigData) { sig.innerHTML = '<img src="' + sigData + '" style="max-height:50px;max-width:150px;opacity:.8;border-radius:4px;vertical-align:middle" alt="signature">'; }
  else { sig.textContent = '—— ' + (user === 'barry' ? 'Barry' : 'Anđela') + ' \u{270D}\u{FE0F}'; }
  var dateEl = document.querySelector('#diaryWriteCard .lpc-date');
  if (dateEl && _diaryViewDate) { var parts = _diaryViewDate.split('-'); if (parts.length === 3) dateEl.textContent = '\u{1F48C} ' + parseInt(parts[2],10) + '.' + parseInt(parts[1],10) + '.'; }
}
function escHtml(s) { if (!s) return ''; var d = document.createElement('div'); d.appendChild(document.createTextNode(s)); return d.innerHTML; }

// === 日记终极功能包：写作锁 + 翻译 + 签名 ===
(function(){
  console.log('[日记终极包] 已加载');
  window._updatePartnerLetter = function(dateKey) {
    if (!dateKey) { var d=new Date(); dateKey=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
    try {
      var sd=JSON.parse(localStorage.getItem('shared-diary')||'{}');
      var user=(typeof activeProfile!=='undefined')?activeProfile:'barry';
      var partner=user==='barry'?'andjela':'barry';
      var dayData=sd[dateKey]||{};
      var myEntry=dayData[user], partnerEntry=dayData[partner];
      var contentEl=document.getElementById('letterPartnerContent'), lockedEl=document.getElementById('letterLocked'), transBtn=document.getElementById('letterTranslateBtn');
      if (!myEntry||!myEntry.text) { if(lockedEl)lockedEl.style.display=''; if(contentEl)contentEl.style.display='none'; if(transBtn)transBtn.style.display='none'; }
      else if (!partnerEntry||!partnerEntry.text) { if(lockedEl)lockedEl.style.display='none'; if(contentEl){contentEl.style.display='';contentEl.innerHTML='<div style="text-align:center;padding:20px;color:var(--text-muted)">📭 '+(window.lang==='zh-CN'?'Ta还没有写，稍后再来看看 💌':window.lang==='en'?'Your partner hasn\'t written yet 💌':'Partner još nije pisao 💌')+'</div>';} if(transBtn)transBtn.style.display='none'; }
      else { if(lockedEl)lockedEl.style.display='none'; if(contentEl){contentEl.style.display='';var _html='<div style="padding:12px;font-size:.85rem;line-height:1.8;white-space:pre-wrap">'+escHtml(partnerEntry.text)+'</div>';if(partnerEntry.mood)_html+='<div style="text-align:right;font-size:1.2rem;margin-top:8px">'+partnerEntry.mood+'</div>';var _sigData=localStorage.getItem(user+'-signature');if(_sigData)_html+='<div style="text-align:right;margin-top:12px"><img src="'+_sigData+'" style="max-height:50px;max-width:150px;opacity:.8;border-radius:4px" alt="signature"></div>';else _html+='<div style="text-align:right;margin-top:12px;font-family:cursive,serif;font-style:italic;font-size:1.05rem;color:var(--text-muted,#8a7a78)">—— '+(user==='barry'?'Barry':'Anđela')+' ✍️</div>';contentEl.innerHTML=_html;}if(transBtn)transBtn.style.display='';}
    } catch(e) { console.warn('[写作锁] 更新失败:', e.message); }
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
    var title=document.createElement('div'); title.textContent=window.lang==='zh-CN'?'✍️ 手写签名':window.lang==='en'?'✍️ Signature':'✍️ Potpis'; title.style.cssText='font-size:1rem;font-weight:700;margin-bottom:16px;color:#5a3e2b'; pad.appendChild(title);
    var canvas=document.createElement('canvas'); canvas.width=350; canvas.height=150; canvas.style.cssText='background:#fff;border:1px solid #e8d5c4;border-radius:8px;touch-action:none;width:100%'; pad.appendChild(canvas);
    var ctx=canvas.getContext('2d'); ctx.strokeStyle='#2c1810'; ctx.lineWidth=2; ctx.lineCap='round'; var drawing=false;
    canvas.onmousedown=function(e){drawing=true;ctx.beginPath();var r=canvas.getBoundingClientRect();ctx.moveTo(e.clientX-r.left,e.clientY-r.top);e.preventDefault();};
    canvas.ontouchstart=function(e){drawing=true;ctx.beginPath();var t=e.touches[0];var r=canvas.getBoundingClientRect();ctx.moveTo(t.clientX-r.left,t.clientY-r.top);e.preventDefault();};
    canvas.onmousemove=function(e){if(!drawing)return;var r=canvas.getBoundingClientRect();ctx.lineTo(e.clientX-r.left,e.clientY-r.top);ctx.stroke();e.preventDefault();};
    canvas.ontouchmove=function(e){if(!drawing)return;var t=e.touches[0];var r=canvas.getBoundingClientRect();ctx.lineTo(t.clientX-r.left,t.clientY-r.top);ctx.stroke();e.preventDefault();};
    canvas.onmouseup=function(){drawing=false;}; canvas.ontouchend=function(){drawing=false;};
    var btnRow=document.createElement('div'); btnRow.style.cssText='display:flex;gap:8px;margin-top:12px;justify-content:center';
    var clearBtn=document.createElement('button'); clearBtn.textContent=window.lang==='zh-CN'?'清除':window.lang==='en'?'Clear':'Obriši'; clearBtn.style.cssText='padding:8px 16px;border:1px solid #ccc;border-radius:8px;background:#fff;cursor:pointer;font-size:.8rem'; clearBtn.onclick=function(){ctx.clearRect(0,0,canvas.width,canvas.height);};
    var saveBtn=document.createElement('button'); saveBtn.textContent='💾 '+(window.lang==='zh-CN'?'保存':window.lang==='en'?'Save':'Sačuvaj'); saveBtn.style.cssText='padding:8px 16px;border:none;border-radius:8px;background:var(--love,#c45a6b);color:#fff;cursor:pointer;font-size:.8rem;font-weight:600';
    saveBtn.onclick=function(){var dataUrl=canvas.toDataURL('image/png');var user2=(typeof activeProfile!=='undefined')?activeProfile:'barry';localStorage.setItem(user2+'-signature',dataUrl);overlay.remove();_renderOwnSignature();if(typeof _updatePartnerLetter==='function'){var _dk=document.querySelector('#diaryWriteCard .lpc-date');if(_dk)_dk.textContent='\u{1F48C} '+new Date().getDate()+'.'+(new Date().getMonth()+1)+'.'+new Date().getFullYear();}console.log('[签名] 已保存 ('+user2+')');};
    btnRow.appendChild(clearBtn); btnRow.appendChild(saveBtn); pad.appendChild(btnRow); overlay.appendChild(pad); document.body.appendChild(overlay);
  };
  console.log('[日记终极包] 写作锁+翻译+签名 已就绪');
})();

function _updateSigBtnText() { var sb=document.getElementById('diarySigBtn'); if(!sb)return; sb.textContent=window.lang==='zh-CN'?'✍️ 设置签名':window.lang==='en'?'✍️ Set Signature':'✍️ Potpis'; }

(function(){
  function _injectSignatureBtn() { var saveBtn=document.getElementById('diarySaveBtn'); if(!saveBtn)return; if(document.getElementById('diarySigBtn'))return; var sigBtn=document.createElement('button'); sigBtn.id='diarySigBtn'; sigBtn.style.cssText='padding:6px 12px;border:1px dashed var(--border,#d4bfa0);border-radius:8px;background:transparent;cursor:pointer;font-size:.72rem;transition:all .2s;margin-left:6px;white-space:nowrap'; sigBtn.onmouseover=function(){this.style.background='var(--rose-light,#f0d0d0)';}; sigBtn.onmouseout=function(){this.style.background='transparent';}; sigBtn.onclick=function(){if(typeof window._openSignaturePad==='function')window._openSignaturePad();}; sigBtn.textContent='✍️ ...'; saveBtn.parentNode.insertBefore(sigBtn,saveBtn.nextSibling); setTimeout(_updateSigBtnText,300); }
  _injectSignatureBtn(); var _mo=new MutationObserver(function(){_injectSignatureBtn();}); _mo.observe(document.body,{childList:true,subtree:true});
  var _origApply3=window.applyAllUI; if(typeof _origApply3==='function'){window.applyAllUI=function(w){_origApply3(w);setTimeout(_updateSigBtnText,100);};}
  console.log('[签名按钮] 已就绪');
})();

})();

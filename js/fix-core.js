"use strict";
(function () {
  console.log('[fix-core] 已加载');

  /* 日期工具 */
  function _fmtDate(d) { return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  function _sameDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}
  function _addDays(d,n){var r=new Date(d);r.setDate(r.getDate()+n);return r;}
  function _daysDiff(a,b){return Math.round((b.getTime()-a.getTime())/86400000);}
  function _d0(d){var r=new Date(d);r.setHours(0,0,0,0);return r;}

  /* 来源映射 */
  if (!localStorage.getItem('fix-period-sources')) localStorage.setItem('fix-period-sources','{}');
  window._getRecordSource = function(k){var m=JSON.parse(localStorage.getItem('fix-period-sources')||'{}');return m[k]||null;};
  window._setRecordSource = function(k,s){var m=JSON.parse(localStorage.getItem('fix-period-sources')||'{}');m[k]=s;localStorage.setItem('fix-period-sources',JSON.stringify(m));};

  /* CSS 注入 */
  var _s=document.createElement('style');
  _s.textContent='html{overflow-x:hidden!important}body{margin-right:0!important;overflow-x:hidden!important;width:100vw!important;max-width:100vw!important}.days{grid-template-columns:repeat(7,1fr)!important}.week-num{display:none!important}.day.barry-marked{box-shadow:inset 0 0 0 2.5px rgba(74,144,217,0.7)!important}nav.tabs-nav .tabs{display:flex!important;justify-content:space-around!important;width:100%!important;gap:0!important}.progress-fill{transition:transform 0.7s cubic-bezier(0.22,1,0.36,1)!important}.day.in-month{animation:fixDayIn 0.35s ease-out both}@keyframes fixDayIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}';
  document.head.appendChild(_s);
  console.log('[fix-core] CSS 已注入 ✓');
  console.log('[fix-core] GSAP 替换动画已注入 ✓');

  /* 禁用 GSAP 动画函数，让 CSS 动画接管 */
  window.animateModalOut = null;  // closeModal 已有 CSS fallback (closing class + animationend)
  // 其他 GSAP 函数 (animateModalIn等) 在 GSAP 未加载时已为无操作

  /* I18N_EXT */
  (function(){var E={sr:{modalMarkersTitle:'📌 Oznake',modalAddMarker:'Dodaj oznaku',modalEndPeriod:'Oznazi kraj ciklusa',modalPeriodOngoing:'Ciklus u toku',modalEndNow:'Zavrsi ciklus'},'zh-CN':{modalMarkersTitle:'📌 日历标记',modalAddMarker:'添加标记',modalEndPeriod:'标记经期结束',modalPeriodOngoing:'经期进行中',modalEndNow:'结束当前经期'},en:{modalMarkersTitle:'📌 Markers',modalAddMarker:'Add Marker',modalEndPeriod:'End Period',modalPeriodOngoing:'Period Ongoing',modalEndNow:'End Current Period'}};if(typeof I18N_EXT!=='undefined'){for(var L in E){if(!I18N_EXT[L])I18N_EXT[L]={};for(var K in E[L])I18N_EXT[L][K]=E[L][K];}console.log('[fix-core] i18n 扩展键已注入 ✓');}})();

  /* Bug 3: 移除遮罩 onclick */
  var _m=document.getElementById('modal');if(_m)_m.removeAttribute('onclick');

  /* 共享状态 */
  window._fixShared={fixRunOnce:false};

  /* Emoji 选择器标题修复 */
  (function(){var _o=window.openEmojiPickerForModal;window.openEmojiPickerForModal=function(){if(typeof _o==='function')_o();setTimeout(function(){var _t=document.getElementById('ep-title');if(!_t)return;var _l=(typeof window.lang!=='undefined')?window.lang:'sr',_x=_l==='zh-CN'?'添加标记':_l==='en'?'Add Marker':'Dodaj oznaku',_n='📌 '+_x;if(_t.textContent!==_n)_t.textContent=_n;},50);};})();

  /* MutationObserver */
  (function(){
    var _mo=new MutationObserver(function(){
      var _me=document.getElementById('modal'),_pe=document.getElementById('emojiPickerOverlay');
      if(_me&&_me.classList.contains('hidden')&&_pe&&!_pe.classList.contains('hidden'))_pe.classList.add('hidden');
      if(typeof _fixNavigation==='function')_fixNavigation();
      if(typeof window._handleModalMutation==='function')window._handleModalMutation();
      if(!_me||_me.classList.contains('hidden'))window._fixShared.fixRunOnce=false;
    });
    var _target=document.body||document.documentElement;
    if(_target)_mo.observe(_target,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
    console.log('[fix-core] MutationObserver 已启动');
  })();
})();

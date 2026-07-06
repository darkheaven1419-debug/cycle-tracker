"use strict";
(function () {
  console.log('[fix-data] 已加载');
  function _fmtDate(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}

  (function(){
    var ms=['push','pop','splice','sort','shift','unshift'];
    function pa(){if(typeof state==='undefined'||!state.records||state.records._h2)return;
      ms.forEach(function(m){var o=state.records[m];state.records[m]=function(){var r=o.apply(this,arguments);setTimeout(function(){console.log('[fix-data] H2 records:',state.records?state.records.length:'N/A');},0);return r;};});
      state.records._h2=true;}
    pa();var _os=typeof saveState==='function'?saveState:null;
    if(_os){window.saveState=function(){_os();if(!state.records||!state.records._h2)pa();};console.log('[fix-data] H2 已启用');}
  })();

  (function(){var _o=typeof togglePeriodRecord==='function'?togglePeriodRecord:null;if(!_o)return;
    window.togglePeriodRecord=function(s,e){_o(s,e);var p=localStorage.getItem('cycle-active-profile')||'andjela',u=p.indexOf('barry')!==-1?'barry':'andjela',k=null;
    if(typeof s==='string')k=s;else if(s&&typeof s.toISOString==='function')k=s.toISOString().slice(0,10);else if(typeof selectedDate!=='undefined'&&selectedDate)k=_fmtDate(selectedDate);
    if(k&&typeof window._setRecordSource==='function')window._setRecordSource(k,u);};console.log('[fix-data] togglePeriodRecord ✓');})();

  (function(){var _o=typeof pushAllSharedData==='function'?pushAllSharedData:null;if(!_o)return;
    window.pushAllSharedData=function(){try{var p=JSON.parse(localStorage.getItem('shared-cycle-data')||'null');if(p&&typeof window._getRecordSource==='function'){p.periodSources=JSON.parse(localStorage.getItem('fix-period-sources')||'{}');localStorage.setItem('shared-cycle-data',JSON.stringify(p));}}catch(e){}_o();};console.log('[fix-data] pushAllSharedData ✓');})();

  (function(){var _o=typeof pullAllSharedData==='function'?pullAllSharedData:null;if(!_o)return;
    window.pullAllSharedData=function(){return _o().then(function(){try{var p=JSON.parse(localStorage.getItem('shared-cycle-data')||'null');if(p&&p.periodSources)localStorage.setItem('fix-period-sources',JSON.stringify(p.periodSources));}catch(e){}}).catch(function(){});};console.log('[fix-data] pullAllSharedData ✓');})();

  var _dc=null,_dct=0;
  function _prc(){
    if(typeof renderCalendar!=='function')return false;
    var _r=renderCalendar;
    window.renderCalendar=function(){
      var n=Date.now();if(!_dc||n-_dct>30000){try{_dc=JSON.parse(localStorage.getItem('shared-diary')||'{}');_dct=n;}catch(e){_dc={};}}
      _r.apply(this,arguments);
      var cs=document.querySelectorAll('.day[aria-label]');cs.forEach(function(c){var l=c.getAttribute('aria-label');if(!l)return;c.classList.add('in-month');if(typeof window._getRecordSource==='function'&&window._getRecordSource(l.slice(0,10))==='barry')c.classList.add('barry-marked');});};
    console.log('[fix-data] renderCalendar 已劫持 ✓');return true;
  }
  if(!_prc()){var _n=0,_t=setInterval(function(){_n++;if(_prc()||_n>50)clearInterval(_t);},100);}
})();

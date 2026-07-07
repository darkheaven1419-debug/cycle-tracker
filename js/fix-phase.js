"use strict";
(function () {
  console.log('[fix-phase] 已加载');

  function _d0(d){var r=new Date(d);r.setHours(0,0,0,0);return r;}
  function _addDays(d,n){var r=new Date(d);r.setDate(r.getDate()+n);return r;}
  function _sameDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}
  function _fmtDate(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  function _daysDiff(a,b){return Math.round((b.getTime()-a.getTime())/86400000);}

  function _ccp(d,pe,ns){
    d=_d0(d);pe=_d0(pe);ns=_d0(ns);
    var o=_addDays(ns,-14),fs=_addDays(o,-3),fe=_addDays(o,2);
    if(d>=pe&&d<fs)return'follicular';
    if(d>=fs&&d<=fe){if(_sameDay(d,o))return'ovulation';return'fertile';}
    if(d>fe&&d<ns)return'luteal';return null;
  }

  function _fgp(date,records,periodEnds,settings){
    var d=_d0(date),pl=(settings&&settings.periodLength)||7;
    var s=[];for(var i=0;i<records.length;i++)s.push(_d0(records[i]));s.sort(function(a,b){return a-b;});
    for(var i=0;i<s.length;i++){var st=_d0(s[i]),ek=_fmtDate(s[i]),e=(periodEnds&&periodEnds[ek])?_d0(new Date(periodEnds[ek]+'T00:00:00')):_addDays(st,pl-1);if(d>=st&&d<=e)return _sameDay(d,st)?'period-on':'period-mid';}
    if(s.length===0)return null;
    var c=[];for(var ci=1;ci<s.length;ci++)c.push(_daysDiff(s[ci-1],s[ci]));
    var rc=c.slice(-3),ac=rc.length>0?Math.round(rc.reduce(function(a,b){return a+b;},0)/rc.length):(settings&&settings.cycleLength)||28;
    var ls=s[s.length-1],lek=_fmtDate(ls),le=(periodEnds&&periodEnds[lek])?_d0(new Date(periodEnds[lek]+'T00:00:00')):_addDays(ls,pl-1);
    for(var j=0;j<s.length-1;j++){var ts=s[j],tek=_fmtDate(ts),te=(periodEnds&&periodEnds[tek])?_d0(new Date(periodEnds[tek]+'T00:00:00')):_addDays(ts,pl-1),ns2=s[j+1];if(d>te&&d<ns2)return _ccp(d,te,ns2);}
    var pns=_addDays(ls,ac),pne=_addDays(pns,pl-1);
    if(d>=pns&&d<=pne)return _sameDay(d,pns)?'period-pred-first':'period-pred';
    if(d>le&&d<pns)return _ccp(d,le,pns);
    if(d>pne){var n2s=_addDays(pns,ac),n2e=_addDays(n2s,pl-1);if(d>=n2s&&d<=n2e)return _sameDay(d,n2s)?'period-future-first':'period-future';if(d<n2s)return _ccp(d,pne,n2s);var n3s=_addDays(n2s,ac);if(d<n3s)return _ccp(d,n2e,n3s);return null;}
    return null;
  }

  var _o=typeof getPhase==='function'?getPhase:null;
  window.getPhase=function(date,pred){
    try{var st=typeof state!=='undefined'?state:null;if(st&&st.records){var r=_fgp(date,st.records,st.periodEnds||{},st.settings||{});if(r!==null)return r;}}catch(e){}
    return _o?_o(date,pred):null;
  };
  console.log('[fix-phase] getPhase 已替换 ✓');
})();

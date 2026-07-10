"use strict";
// === 趋势图修复：数据恢复 + 强制渲染 ===
(function(){var _log=function(m){console.log('[趋势图] '+m);};_log('已启动');

// ── 三语映射表 ──
var _T={'schart-cycle-title':{'zh-CN':'周期趋势','en':'Cycle Trend','sr':'Trend ciklusa'},'schart-mood-title':{'zh-CN':'心情分布','en':'Mood Distribution','sr':'Raspoloženje'},'predChipOvLabel':{'zh-CN':'排卵日','en':'Ovulation','sr':'Ovulacija'},'predChipFertLabel':{'zh-CN':'易孕期','en':'Fertile','sr':'Plodni dani'},'predChipFutureLabel':{'zh-CN':'未来预测','en':'Future','sr':'Budućnost'},'predChipRegLabel':{'zh-CN':'规律性','en':'Regularity','sr':'Regularnost'},'schart-history-title':{'zh-CN':'周期历史','en':'Cycle History','sr':'Istorija ciklusa'},'tleg-short':{'zh-CN':'偏短','en':'Short','sr':'Kratak'},'tleg-normal':{'zh-CN':'正常','en':'Normal','sr':'Normalan'},'tleg-long':{'zh-CN':'偏长','en':'Long','sr':'Dug'}};
var _E={'zh-CN':'请标记经期日期后查看趋势图','en':'Mark period dates to see the trend','sr':'Označi datume ciklusa za prikaz trenda'};
var _1T={'zh-CN':'仅有 1 次记录, 再标记一次即显示趋势','en':'Only 1 record, add one more to see trend','sr':'Samo 1 zapis, dodaj još jedan za trend'};

function _isDate(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}/.test(s);}

// ── 数据恢复：检查所有 localStorage 来源 ──
function _recover(){
  if(typeof state==='undefined')return 0;
  var candidates=[];

  try{var sd=JSON.parse(localStorage.getItem('shared-cycle-data')||'null');if(sd&&Array.isArray(sd.records))candidates.push(sd.records);}catch(e){}
  try{var pk=JSON.parse(localStorage.getItem('cycle-data-v6-andjela')||'null');if(pk&&Array.isArray(pk.records))candidates.push(pk.records);}catch(e){}
  try{var v5=JSON.parse(localStorage.getItem('cycle-data-v5')||'null');if(v5&&Array.isArray(v5.records))candidates.push(v5.records);}catch(e){}

  var best=state.records?state.records.slice():[];
  var bestCount=best.length;

  for(var ci=0;ci<candidates.length;ci++){
    var recs=candidates[ci];
    if(recs.length>bestCount){
      best=recs.map(function(r){return typeof r==='string'?new Date(r+'T00:00:00'):new Date(r);});
      bestCount=best.length;
    }
  }

  // 从 fix-period-sources 恢复日期
  try{
    var ps=JSON.parse(localStorage.getItem('fix-period-sources')||'{}');
    for(var ds in ps){
      if(_isDate(ds)){
        var d=new Date(ds+'T00:00:00');
        var ex=false;
        for(var bi=0;bi<best.length;bi++){if(best[bi].getTime()===d.getTime()){ex=true;break;}}
        if(!ex){best.push(d);bestCount++;}
      }
    }
  }catch(e){}

  best.sort(function(a,b){return a-b;});
  if(bestCount>(state.records?state.records.length:0)){
    state.records=best;
    if(typeof saveState==='function')saveState();
    _log('已恢复 '+bestCount+' 条记录');
  }
  return bestCount;
}

// ── 渲染趋势图 ──
function _draw(){
  var lang=window.lang||'sr';
  for(var id in _T){var el=document.getElementById(id);if(el&&_T[id]&&_T[id][lang])el.textContent=_T[id][lang];}

  if(!state||!state.records||state.records.length<2){
    var emptyEl=document.getElementById('chartCycleEmpty');
    if(emptyEl){
      emptyEl.textContent=state&&state.records&&state.records.length===1?_1T[lang]||_1T['zh-CN']:_E[lang]||_E['zh-CN'];
      emptyEl.style.display='block';emptyEl.style.padding='20px';emptyEl.style.textAlign='center';emptyEl.style.color='var(--text-muted)';emptyEl.style.fontSize='0.8rem';
    }
    return;
  }

  var sorted=state.records.slice().sort(function(a,b){return new Date(a)-new Date(b);});
  var diffs=[],lbs=[];
  for(var i=1;i<sorted.length;i++){
    diffs.push(Math.round((new Date(sorted[i])-new Date(sorted[i-1]))/86400000));
    lbs.push(lang==='zh-CN'?'周期'+i:'C'+i);
  }

  var avg=diffs.length>0?Math.round(diffs.reduce(function(s,v){return s+v;},0)/diffs.length):28;

  var e=document.getElementById('chartCycleEmpty');
  if(e){e.style.display='none';e.textContent='';}

  var canvas=document.getElementById('chartCycleTrend');
  if(canvas&&canvas.parentElement)canvas.parentElement.style.display='';

  if(canvas&&typeof ChartRenderer!=='undefined'&&ChartRenderer.drawLineChart){
    ChartRenderer.drawLineChart(canvas,diffs,lbs,{width:500,height:200,avgLine:avg,avgLabel:lang==='zh-CN'?'均值':lang==='en'?'Avg':'Prosek',emptyText:''});
    _log('已绘制 ('+diffs.length+'点, 均值='+avg+'d)');
  }
}

// ── 持久轮询 ──
var _t=0;
var _iv=setInterval(function(){
  _t++;_recover();
  var p=document.getElementById('panel-stats');
  if(p&&p.classList.contains('active'))_draw();
  if(_t>600){clearInterval(_iv);_log('轮询已停止');}
},500);
_log('轮询已启动');
})();

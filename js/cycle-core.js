"use strict";

/* ================================================================
   CYCLE CORE — Date utilities & cycle prediction
   Extracted from app.js for modularity
   ================================================================ */

// ── Pure Date Utilities ──────────────────────────────────────────
const fmtDate = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const sameDay = (a,b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
const addDays = (d,n) => { const r=new Date(d); r.setDate(r.getDate()+n); return r; };
const daysDiff = (a,b) => Math.round((b.getTime()-a.getTime())/86400000);
const d0 = d => { const r=new Date(d); r.setHours(0,0,0,0); return r; };
const today = () => { const tt=new Date(); tt.setHours(0,0,0,0); return tt; };

// ── Cycle Prediction (depends on global state) ───────────────────
function predict() {
  const {records,settings}=state; const sorted=[...records].sort((a,b)=>a-b);
  const periodEnds=state.periodEnds||{};
  const periodLengths=[];
  for(let i=0;i<sorted.length;i++){
    const key=fmtDate(sorted[i]);
    if(periodEnds[key])periodLengths.push(daysDiff(d0(sorted[i]),d0(new Date(periodEnds[key]+'T00:00:00')))+1);
  }
  const avgPeriodLen=periodLengths.length>0?Math.round(periodLengths.reduce(function(a,b){return a+b;},0)/periodLengths.length):settings.periodLength;
  const def={lastStart:null,nextStart:null,ovulation:null,fertileStart:null,fertileEnd:null,cycleLen:settings.cycleLength,periodLen:avgPeriodLen,avgCycle:settings.cycleLength,minCycle:null,maxCycle:null,stdDev:0,confidence:'low',cycles:[],isOverdue:false,overdueDays:0,futurePeriods:[]};
  if(sorted.length===0) return def;
  def.lastStart=d0(sorted[sorted.length-1]);
  if(sorted.length===1){def.nextStart=addDays(def.lastStart,settings.cycleLength);}
  else{for(let i=1;i<sorted.length;i++) def.cycles.push(daysDiff(d0(sorted[i-1]),d0(sorted[i])));const recent=def.cycles.slice(-6);if(recent.length>0){def.avgCycle=Math.round(recent.reduce((a,b)=>a+b,0)/recent.length);def.minCycle=Math.min(...recent);def.maxCycle=Math.max(...recent);const variance=recent.reduce((s,c)=>s+(c-def.avgCycle)**2,0)/recent.length;def.stdDev=Math.round(Math.sqrt(variance)*10)/10;if(def.stdDev<=3)def.confidence='high';else if(def.stdDev<=6)def.confidence='medium';else def.confidence='low';}def.nextStart=addDays(def.lastStart,def.avgCycle);}
  const td=today();if(def.nextStart&&td>def.nextStart){const useLen=settings.manualOverride?settings.cycleLength:def.avgCycle;const elapsed=daysDiff(def.lastStart,td);const passed=Math.floor(elapsed/useLen);if(passed>=1){def.nextStart=addDays(def.lastStart,useLen*(passed+1));}def.isOverdue=(td>def.nextStart);if(def.isOverdue)def.overdueDays=daysDiff(def.nextStart,td);}
  if(def.nextStart){def.ovulation=addDays(def.nextStart,-14);def.fertileStart=addDays(def.ovulation,-3);def.fertileEnd=addDays(def.ovulation,2);const useLen=settings.manualOverride?settings.cycleLength:def.avgCycle;for(let i=1;i<=2;i++){const np=addDays(def.nextStart,useLen*i);def.futurePeriods.push({start:np,ovulation:addDays(np,-14),fertileStart:addDays(np,-17),fertileEnd:addDays(np,-11)});}}
  return def;
}

function getPeriodEndDate(startDate){
  const key=fmtDate(startDate);
  if(state.periodEnds&&state.periodEnds[key])return new Date(state.periodEnds[key]+'T00:00:00');
  return null;
}

function getPhase(date,pred){
  const d=d0(date);
  for(const rec of state.records){const s=d0(rec);const e=getPeriodEndDate(rec)||addDays(s,pred.periodLen-1);e.setHours(0,0,0,0);if(d>=s&&d<=e) return sameDay(d,s)?'period-on':'period-mid';}
  if(pred.nextStart){const ps=d0(pred.nextStart),pe=addDays(ps,pred.periodLen-1);pe.setHours(0,0,0,0);if(d>=ps&&d<=pe) return sameDay(d,ps)?'period-pred-first':'period-pred';}
  for(const fp of pred.futurePeriods){const ps=d0(fp.start),pe=addDays(ps,pred.periodLen-1);pe.setHours(0,0,0,0);if(d>=ps&&d<=pe) return sameDay(d,ps)?'period-future-first':'period-future';}
  if(pred.ovulation&&sameDay(d,pred.ovulation)) return 'ovulation';
  if(pred.fertileStart&&pred.fertileEnd){const fs=d0(pred.fertileStart),fe=d0(pred.fertileEnd);if(d>=fs&&d<=fe) return 'fertile';}
  if(pred.fertileEnd&&pred.nextStart){const fe=d0(pred.fertileEnd),np=d0(pred.nextStart);if(d>fe&&d<np) return 'luteal';}
  if(pred.lastStart&&pred.fertileStart){const lpEnd=addDays(pred.lastStart,pred.periodLen);lpEnd.setHours(0,0,0,0);const fs=d0(pred.fertileStart);if(d>=lpEnd&&d<fs) return 'follicular';}
  return null;
}

function getOpenPeriodStart(){
  if(!state.periodEnds)return null;
  for(let i=state.records.length-1;i>=0;i--){
    const key=fmtDate(state.records[i]);
    if(!state.periodEnds[key])return state.records[i];
  }
  return null;
}

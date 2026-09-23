"use strict";const fmtDate=t=>`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`,sameDay=(t,e)=>t.getFullYear()===e.getFullYear()&&t.getMonth()===e.getMonth()&&t.getDate()===e.getDate(),addDays=(t,e)=>{const r=new Date(t);return r.setDate(r.getDate()+e),r},daysDiff=(t,e)=>Math.round((e.getTime()-t.getTime())/864e5),d0=t=>{const e=new Date(t);return e.setHours(0,0,0,0),e},today=()=>{const t=new Date;return t.setHours(0,0,0,0),t};
/* ── §二 预测引擎的三个新零件 ──────────────────────────────────────────────
   1. _median —— 预测一律取中位数。一次异常长的经期会把均值拉走，中位数不会。
   2. _addCalMonths —— 窗口是「3 个**日历月**」，不是 90 天：9/23 → 12/23。
      逐月加、并夹住月末（1/31 + 1 月 = 2/28，不是 3/3），否则月末会漂。
   3. 五个常量：样本量、数据够不够的门槛、循环上限（防御 0 步长死循环）。
   名字都带 PRED_ 前缀：本文件不包 IIFE，顶层 const 是全局的。 */
function _median(a){if(!a||!a.length)return null;const s=a.slice().sort((x,y)=>x-y),m=s.length>>1;return s.length%2?s[m]:Math.round((s[m-1]+s[m])/2)}
function _gaps(a){const g=[];for(let i=1;i<a.length;i++)g.push(daysDiff(d0(a[i-1]),d0(a[i])));return g}
function _addCalMonths(d,n){const b=d0(d),r=new Date(b.getFullYear(),b.getMonth()+n,b.getDate());if(r.getDate()!==b.getDate())r.setDate(0);return r}
const PRED_FORECAST_MONTHS=3,PRED_CYCLE_SAMPLES=3,PRED_DURATION_SAMPLES=4,PRED_MIN_COMPLETE=4,PRED_MAX_LOOP=24;
function predict(){const{records:t,settings:e}=state,r=[...t].sort((t,e)=>t-e),a=state.periodEnds||{},n=[],cs=[];for(let t=0;t<r.length;t++){const e=fmtDate(r[t]);if(a[e]){n.push(daysDiff(d0(r[t]),d0(new Date(a[e]+"T00:00:00")))+1),cs.push(r[t])}}
/* §二 三处口径，全部改成「最近 4 次已完整记录的经期」：
   · 持续天数 = 最近 4 次 (end-start+1) 的**中位数**（原为全部记录的均值）；
   · 周期基准 = 最近 4 次 start 之间的 3 个间隔的**中位数**（原为最近 6 个间隔的均值）；
   · cs 只收「有结束日期」的那几次 —— 没结束的那次不参与任何一步。
   一次异常长的经期会把均值拉走，中位数不会，这正是这一轮要的稳健性。 */
const td=today(),d=n.length>0?_median(n.slice(-PRED_DURATION_SAMPLES)):e.periodLength,
      cg=_gaps(cs),allG=_gaps(r),
      medC=cg.length>0?_median(cg.slice(-PRED_CYCLE_SAMPLES)):null,
      medA=allG.length>0?_median(allG.slice(-PRED_CYCLE_SAMPLES)):null,
      s={lastStart:null,nextStart:null,ovulation:null,fertileStart:null,fertileEnd:null,cycleLen:e.cycleLength,periodLen:d,avgCycle:medC!==null?medC:(medA!==null?medA:e.cycleLength),minCycle:null,maxCycle:null,stdDev:0,confidence:"low",cycles:[],isOverdue:!1,overdueDays:0,futurePeriods:[],medianCycle:medC!==null?medC:medA,medianPeriodLen:d,completeCount:cs.length,cycleSamples:Math.min((cg.length>0?cg:allG).length,PRED_CYCLE_SAMPLES),durationSamples:Math.min(n.length,PRED_DURATION_SAMPLES),forecast:{reliable:!1,reason:"need-complete",cycles:0,duration:d,horizonStart:td,horizonEnd:_addCalMonths(td,PRED_FORECAST_MONTHS),periods:[]}};
if(0===r.length)return s;if(s.lastStart=d0(r[r.length-1]),1===r.length)s.nextStart=addDays(s.lastStart,e.cycleLength);else{for(let t=1;t<r.length;t++)s.cycles.push(daysDiff(d0(r[t-1]),d0(r[t])));const t=s.cycles.slice(-6);if(t.length>0){/* 离散度仍按**真均值**算，只是均值不再当预测基准了。 */
const mu=t.reduce((t,e)=>t+e,0)/t.length;s.minCycle=Math.min(...t),s.maxCycle=Math.max(...t);const e=t.reduce((t,e)=>t+(e-mu)**2,0)/t.length;s.stdDev=Math.round(10*Math.sqrt(e))/10,s.stdDev<=3?s.confidence="high":s.stdDev<=6?s.confidence="medium":s.confidence="low"}s.nextStart=addDays(s.lastStart,s.avgCycle)}const o=today();if(s.nextStart&&o>s.nextStart){const t=e.manualOverride?e.cycleLength:s.avgCycle,r=daysDiff(s.lastStart,o),a=Math.floor(r/t);a>=1&&(s.nextStart=addDays(s.lastStart,t*(a+1))),s.isOverdue=o>s.nextStart,s.isOverdue&&(s.overdueDays=daysDiff(s.nextStart,o))}if(s.nextStart){s.ovulation=addDays(s.nextStart,-14),s.fertileStart=addDays(s.ovulation,-3),s.fertileEnd=addDays(s.ovulation,2);
/* 未来列表（futurePeriods）从这一刻起有了两道闸：
   ① 数据闸 —— 不足 4 次完整记录不给列表，宁缺毋滥（nextStart 不受此闸：
      它是「下一期」，每对情侣都该看到，而「未来三个月」是统计推断）；
   ② 窗口闸 —— 只留「今天 → 今天 + 3 个日历月」以内的，**两端都显式判**：
      上界 st>horizonEnd 就 break（日期往后递推，所以不存在无限循环）；
      下界 st>=horizonStart 才入列。窗口起点是**今天**，不是最近一次经期
      —— 最近一次经期早于今天，不会让窗口提前结束（9/1 那次 + 今天 9/23
      仍然是 9/23 → 12/23，不是 12/1）。
      下界在正常情况下由上面那段 overdue 回滚已经保证（nextStart 恒 >= today），
      这里再判一次是把「推论」变成「约束」：回滚一旦被改动，过去的预测不会
      悄悄混进 futurePeriods 被 getPhase() 拿去给日历上色。
      PRED_MAX_LOOP 是 base<=0 时的保险。 */
const base=e.manualOverride?e.cycleLength:s.avgCycle,hor=s.forecast.horizonEnd,h0=s.forecast.horizonStart;
s.forecast.reliable=cs.length>=PRED_MIN_COMPLETE&&medC>0,
s.forecast.reason=cs.length<PRED_MIN_COMPLETE?"need-complete":(medC>0?"ok":"bad-span"),
s.forecast.cycles=cg.length;
if(s.forecast.reliable&&base>0){let st=s.nextStart,k=0;while(st&&k<PRED_MAX_LOOP){if(st>hor)break;st>=h0&&s.futurePeriods.push({start:st,ovulation:addDays(st,-14),fertileStart:addDays(st,-17),fertileEnd:addDays(st,-11)}),st=addDays(st,base),k++}}
/* periods 是给界面用的「预计 9/25 – 9/29」成对形态，纯派生，不写回任何存储。 */
s.forecast.periods=s.futurePeriods.map(function(f){return{start:f.start,end:addDays(f.start,s.medianPeriodLen-1)}})}return s}function getPeriodEndDate(t){const e=fmtDate(t);return state.periodEnds&&state.periodEnds[e]?new Date(state.periodEnds[e]+"T00:00:00"):null}function getPhase(t,e){const r=d0(t);for(const t of state.records){const a=d0(t),n=getPeriodEndDate(t)||addDays(a,e.periodLen-1);if(n.setHours(0,0,0,0),r>=a&&r<=n)return sameDay(r,a)?"period-on":"period-mid"}if(e.nextStart){const t=d0(e.nextStart),a=addDays(t,e.periodLen-1);if(a.setHours(0,0,0,0),r>=t&&r<=a)return sameDay(r,t)?"period-pred-first":"period-pred"}for(const t of e.futurePeriods){const a=d0(t.start),n=addDays(a,e.periodLen-1);if(n.setHours(0,0,0,0),r>=a&&r<=n)return sameDay(r,a)?"period-future-first":"period-future"}if(e.ovulation&&sameDay(r,e.ovulation))return"ovulation";if(e.fertileStart&&e.fertileEnd){const t=d0(e.fertileStart),a=d0(e.fertileEnd);if(r>=t&&r<=a)return"fertile"}if(e.fertileEnd&&e.nextStart){const t=d0(e.fertileEnd),a=d0(e.nextStart);if(r>t&&r<a)return"luteal"}if(e.lastStart&&e.fertileStart){const t=addDays(e.lastStart,e.periodLen);t.setHours(0,0,0,0);const a=d0(e.fertileStart);if(r>=t&&r<a)return"follicular"}return null}function getOpenPeriodStart(){if(!state.periodEnds)return null;for(let t=state.records.length-1;t>=0;t--){const e=fmtDate(state.records[t]);if(!state.periodEnds[e])return state.records[t]}return null}
const HUG_EXPIRY_MS=864e5;let _gratNotes=null;const KNOW_ME_QUESTIONS=[{key:"fav_city",q:{sr:"Koji je omiljeni grad tvog/tvoje partnera?",zh:"对方最喜欢的城市是哪里？",en:"What is your partner's favorite city?"}},{key:"first_date_color",q:{sr:"Šta je tvoj/tvoja partner/ka nosio/la na prvom sastanku?",zh:"第一次约会对方穿什么颜色的衣服？",en:"What color did your partner wear on your first date?"}},{key:"dream_trip",q:{sr:"Gde bi tvoj/tvoja partner/ka najradije putovao/la?",zh:"对方最想去的旅行目的地是哪里？",en:"Where does your partner dream of traveling to?"}},{key:"comfort_food",q:{sr:"Koja je omiljena hrana tvog/tvoje partnera za utehu?",zh:"对方心情不好时最爱吃什么？",en:"What comfort food does your partner reach for?"}},{key:"hidden_talent",q:{sr:"Koji skriveni talenat ima tvoj/tvoja partner/ka?",zh:"对方有什么隐藏的才艺？",en:"What hidden talent does your partner have?"}},{key:"childhood_dream",q:{sr:"Šta je tvoj/tvoja partner/ka želeo/la da bude kao dete?",zh:"对方小时候的梦想职业是什么？",en:"What did your partner dream of becoming as a child?"}},{key:"pet_peeve",q:{sr:"Šta tvog/tvoju partnera/ku najviše nervira?",zh:"对方最讨厌的事情是什么？",en:"What annoys your partner the most?"}},{key:"perfect_day",q:{sr:"Kako izgleda savršen dan za tvog/tvoju partnera/ku?",zh:"对方心目中的完美一天是怎样的？",en:"What does your partner's perfect day look like?"}},{key:"music_taste",q:{sr:"Koja je omiljena pesma tvog/tvoje partnera trenutno?",zh:"对方最近单曲循环的歌是什么？",en:"What song is your partner playing on repeat lately?"}},{key:"love_language",q:{sr:"Koji je glavni jezik ljubavi tvog/tvoje partnera?",zh:"对方最重要的爱的语言是什么？",en:"What is your partner's primary love language?"}},{key:"smell_memory",q:{sr:"Koji miris podseća tvog/tvoju partnera/ku na vas?",zh:"什么味道会让对方想起你？",en:"What scent reminds your partner of you?"}},{key:"future_5years",q:{sr:"Gde tvoj/tvoja partner/ka vidi sebe za 5 godina?",zh:"对方觉得五年后的自己会在哪里？",en:"Where does your partner see themselves in 5 years?"}},{key:"best_quality",q:{sr:"Šta tvoj/tvoja partner/ka najviše ceni kod sebe?",zh:"对方最欣赏自己的哪个品质？",en:"What quality does your partner admire most in themselves?"}},{key:"favorite_memory",q:{sr:"Koje je omiljeno zajedničko sećanje tvog/tvoje partnera?",zh:"对方最喜欢你们在一起时的哪个回忆？",en:"What is your partner's favorite shared memory with you?"}},{key:"morning_routine",q:{sr:"Kako tvoj/tvoja partner/ka započinje jutro?",zh:"对方早上起来做的第一件事是什么？",en:"What is the first thing your partner does in the morning?"}}],CHECKIN_QUESTIONS={sr:[{q:"Kako se osećaš u vezi ove nedelje?",opts:["😍 Sjajno","😊 Dobro","😐 Ok","😞 Loše"]},{q:"Da li smo dovoljno komunicirali?",opts:["💬 Da, odlično","👍 Uglavnom","🤔 Moglo bi bolje","👎 Ne baš"]},{q:"Šta bi voleo/la da poboljšamo sledeće nedelje?",opts:["💏 Više zajedničkog vremena","💬 Bolja komunikacija","🔥 Više romantike","🤝 Više podrške"]}],"zh-CN":[{q:"这周的感情状态怎么样？",opts:["😍 很棒","😊 不错","😐 一般","😞 不太好"]},{q:"我们这周的沟通足够吗？",opts:["💬 很好","👍 还行","🤔 可以更好","👎 不太够"]},{q:"下周希望我们哪方面做得更好？",opts:["💏 更多陪伴","💬 更好交流","🔥 更多浪漫","🤝 更多支持"]}],en:[{q:"How do you feel about this week together?",opts:["😍 Amazing","😊 Good","😐 OK","😞 Not great"]},{q:"Did we communicate enough?",opts:["💬 Yes, great","👍 Mostly","🤔 Could improve","👎 Not really"]},{q:"What would you like more of next week?",opts:["💏 More time together","💬 Better talks","🔥 More romance","🤝 More support"]}]};function spawnFloatingHearts(e){const t=["💕","💖","💗","💝","✨","💫"];for(let n=0;n<8;n++)(function(n){setTimeout(function(){const a=document.createElement("span");a.className="floating-heart",a.textContent=t[n%t.length],a.style.left=20+60*Math.random()+"%",a.style.bottom="20px",e.appendChild(a),setTimeout(function(){a.parentNode&&a.remove()},1300)},80*n)})(n)}function getHugStreak(){const e=loadSharedDiaryData(),t=new Date;let n=0;for(let a=0;a<365;a++){const o=new Date(t);o.setDate(o.getDate()-a);const r=e[fmtDate(o)];if(!(r&&r.barry&&r.barry.hug&&r.andjela&&r.andjela.hug))break;n++}return n}function sendHug(e){const n=fmtDate(new Date);let a=parseInt(localStorage.getItem("hug-count-"+n)||"0");if(a>=2)return void toast(t("hugLimit"));a++,localStorage.setItem("hug-count-"+n,a);const o={from:activeProfile,time:Date.now()};localStorage.setItem("shared-hug",JSON.stringify(o));const r=loadSharedDiaryData();r[n]||(r[n]={}),r[n][activeProfile]||(r[n][activeProfile]={}),r[n][activeProfile].hug={time:Date.now()},saveSharedDiaryData(r);const i=document.getElementById("hugSendBtn");i&&(i.classList.add("sending"),setTimeout(function(){i.classList.remove("sending")},600));const s=document.getElementById("hugCard");s&&spawnFloatingHearts(s),renderHug(),toast("🤗 "+("barry"===activeProfile?t("hugSentBarry"):t("hugSentAndjela"))+" ("+a+"/2)")}function checkHug(){try{const e=JSON.parse(localStorage.getItem("shared-hug"));return e?Date.now()-e.time>864e5?(localStorage.removeItem("shared-hug"),null):e.from===activeProfile?null:e:null}catch(e){return null}}function dismissHug(){localStorage.removeItem("shared-hug"),renderHug()}function renderHug(){const e=checkHug(),n=document.getElementById("hugContent"),a=document.getElementById("hug-title");if(!a)return;a.textContent=t("hugTitle");const o=fmtDate(new Date),r=parseInt(localStorage.getItem("hug-count-"+o)||"0"),i=2-r,s=getHugStreak();if(e){const t="andjela"===e.from?"🌸 Anđela":"👦 Barry",a=new Date(e.time),o=String(a.getHours()).padStart(2,"0")+":"+String(a.getMinutes()).padStart(2,"0");let r='<div class="hug-received">';s>1&&(r+='<div class="hug-streak-badge">🔥 '+("sr"===lang?s+" dana zaredom!":"en"===lang?s+"-day streak!":"连续 "+s+" 天！")+"</div>"),r+='<span class="hug-icon-wrap"><span class="hug-icon">🤗</span></span>',r+='<div class="hug-text">'+t+" "+("sr"===lang?"te zagrlio/la! 💫":"en"===lang?"hugged you! 💫":"抱了你！💫")+"</div>",r+='<div class="hug-time">'+o+"</div>",r+='<button class="hug-back-btn" onclick="sendHug(true)" id="hugBackBtn">💝 '+("sr"===lang?"Uzvrati zagrljaj":"en"===lang?"Hug back":"回抱一个")+"</button>",r+='<div><button class="hug-dismiss" onclick="dismissHug()">'+("sr"===lang?"✕ zatvori":"en"===lang?"✕ dismiss":"✕ 关闭")+"</button></div></div>",n.innerHTML=r;const i=document.getElementById("hugCard");i&&spawnFloatingHearts(i)}else if(r>0){let e="";for(let t=0;t<2;t++)e+='<span class="hh-heart'+(t>=i?" used":"")+'">'+(t<r?"❤️":"🤍")+"</span>";const a='<div class="hug-sent-state"><div class="hug-hearts-row">'+e+'</div><span class="hss-icon">📬</span><div class="hss-text">'+t("hugSentWaiting")+'</div><button class="hug-back-btn" onclick="sendHug()" style="margin-top:8px">🤗 '+("sr"===lang?"Pošalji još jedan ("+i+")":"en"===lang?"Send another ("+i+")":"再抱一次 ("+i+")")+"</button></div>";n.innerHTML=a}else{const e=t("hugSendBtn");let a="";s>1&&(a+='<div style="text-align:center"><div class="hug-streak-badge">🔥 '+("sr"===lang?s+" dana zaredom!":"en"===lang?s+"-day streak!":"连续 "+s+" 天！")+"</div></div>"),a+='<button class="hug-btn" onclick="sendHug()" id="hugSendBtn">🤗 '+e+"</button>",n.innerHTML=a}}function addGratitude(){const e=document.getElementById("gratInput"),t=e.value.trim();if(!t)return;let n=JSON.parse(localStorage.getItem("shared-gratitude")||"[]");n.push({text:t,from:activeProfile,time:Date.now()}),n.length>20&&(n=n.slice(-20)),localStorage.setItem("shared-gratitude",JSON.stringify(n)),_gratNotes=null,e.value="",renderGratitude(),pushAllSharedData()}/* ── Echo：感恩便签上的 emoji 回应（只做回应，没有文字回复） ──
   独立存放于 shared-gratitude-echo，条目 {noteFrom,noteTime,from,emoji,time}，
   不写入 gratitude 原条目。noteFrom+noteTime 指向被回应的便签（与 sync.js 的
   _gratKey 同一身份），from 是回应者 —— 一人在一条便签上只有一条记录，
   所以"我是否已回应"是查 key，重复点击天然幂等。 */
const GRAT_EMOJI=["❤️","🫂","😘","🥹","✨"];
/* 已退役：🥰 😂 👍。Phase 4 的 Echo 用的是上一组，旧记录里可能还存着它们，
   所以渲染层必须容忍——见 gratEchoRow 末尾的 legacy 分支。 */
const GRAT_EMOJI_RETIRED=["🥰","😂","👍"];
function gratEchoList(){try{const e=JSON.parse(localStorage.getItem("shared-gratitude-echo")||"[]");return Array.isArray(e)?e:[]}catch(e){return[]}}
function gratEchoKey(e){return String(e.noteFrom)+"|"+e.noteTime+"|"+String(e.from)}
function gratEchoMine(){return"andjela"===activeProfile?"andjela":"barry"}
/* inline onclick 用双引号包住属性，所以实参一律用单引号字面量并转义，避免属性被提前闭合 */
function gratEchoLit(e){return"'"+String(e).replace(/[\\']/g,"\\$&")+"'"}
/* 便签身份是 (from,time)：没有可用时间戳的旧条目无法与回应一一对应，就不渲染回应行，
   否则两条不同的便签会共用同一组回应。实测线上数据全部带 time，不受影响。 */
function gratEchoRow(note){
  if(!note||typeof note.time!=="number"||!isFinite(note.time))return"";
  const list=gratEchoList(),nf=String(note.from),nt=note.time,me=gratEchoMine();
  const mine=list.filter(function(x){return String(x.noteFrom)===nf&&x.noteTime===nt&&String(x.from)===me})[0];
  /* 这条便签上的全部回应，只筛一次——按钮和下面的 legacy 分支共用。 */
  const onNote=list.filter(function(x){return String(x.noteFrom)===nf&&x.noteTime===nt});
  const btns=GRAT_EMOJI.map(function(em){
    const n=onNote.filter(function(x){return x.emoji===em}).length;
    const isMine=mine&&mine.emoji===em?" mine":"";
    const cnt=n>0?'<span class="grat-echo-n">'+n+"</span>":"";
    return'<button class="grat-echo-btn'+isMine+'" onclick="reactGratitude('+gratEchoLit(nf)+","+nt+","+gratEchoLit(em)+')">'+em+cnt+"</button>"
  }).join("");
  /* 已退役的 emoji（🥰😂👍）不再是可选项，但不能让已经存在的回应凭空消失。
     渲染成不可点的计数块；本人想改，点上面五个之一即可——reactGratitude 按
     (noteFrom,noteTime,from) 原地替换自己那条，旧的随之消失。 */
  const legacy=onNote.filter(function(x){return GRAT_EMOJI_RETIRED.indexOf(x.emoji)>=0})
    .reduce(function(acc,x){const hit=acc.filter(function(y){return y.em===x.emoji})[0];hit?hit.n++:acc.push({em:x.emoji,n:1});return acc},[])
    .map(function(o){return'<span class="grat-echo-btn grat-echo-old">'+o.em+'<span class="grat-echo-n">'+o.n+"</span></span>"}).join("");
  return'<div class="grat-echo">'+btns+legacy+"</div>"
}
/* Phase 2A §2：回应行现在同时出现在 Home 与 Together，两处共用同一份
   shared-gratitude-echo。点完之后只重绘 #gratList 的话，被点的那一行会停在
   点击之前的样子 —— 所以在这同一条 shared state 上把三个界面都重绘一遍。
   三者都是可选的（typeof 守卫）：模块还没加载时点击不应抛错。 */
function _refreshEchoSurfaces(){
  if(typeof renderGratitude==="function")renderGratitude();
  if(typeof renderTogetherNew==="function")renderTogetherNew();
  if(typeof renderDashboard==="function")renderDashboard(false);
  /* §Phase 2B.4：Know Me 的判定现在也能从 Home 上点（_knowMeAffordanceHtml），
     点完之后那张引子必须消失 —— 只重绘 Know Me 卡的话，Home 上的按钮会停在
     点击之前的样子。与 echo 那条同理，四个面都重绘。 */
  if(typeof renderKnowMe==="function")renderKnowMe();
}
/* 一次点击完成：同一 emoji 再点不改变状态（幂等），换一个 emoji 就是改自己的回应。 */
function reactGratitude(e,t,n){
  if(-1===GRAT_EMOJI.indexOf(n))return;
  if(typeof t!=="number"||!isFinite(t))return;
  const a=gratEchoMine(),o=gratEchoList(),r=String(e)+"|"+t+"|"+a;
  const i=o.findIndex(function(e){return gratEchoKey(e)===r});
  if(i>=0&&o[i].emoji===n)return;
  const s={noteFrom:String(e),noteTime:t,from:a,emoji:n,time:Date.now()};
  i>=0?o[i]=s:o.push(s),localStorage.setItem("shared-gratitude-echo",JSON.stringify(o)),_refreshEchoSurfaces(),pushAllSharedData();
  echoSentFeedback(e,t,n)
}
/* §7：点击后的轻微反馈——按钮 pop 一下，旁边出现"已发送给 X"。
   动画绑在 .just-sent 上而不是 .mine 上：.mine 每次重绘（含每次同步拉取）
   都会命中，那样动画会反复重放，看起来像又点了一次。 */
function echoSentFeedback(e,t,n){
  const bi=JSON.parse(localStorage.getItem("shared-gratitude")||"[]").slice(-5).reverse()
    .findIndex(function(x){return String(x.from)===String(e)&&x.time===t});
  if(bi<0)return;
  const blk=document.querySelectorAll("#gratList .grat-block")[bi];
  if(!blk)return;
  const btn=blk.querySelectorAll(".grat-echo-btn")[GRAT_EMOJI.indexOf(n)];
  if(!btn)return;
  btn.classList.add("just-sent");
  setTimeout(function(){btn.classList.remove("just-sent")},400);
  const old=blk.querySelector(".grat-echo-sent");
  old&&old.remove();
  const tag=document.createElement("span");
  tag.className="grat-echo-sent";
  tag.textContent=("sr"===lang?"Poslato ":"en"===lang?"Sent to ":"已发送给 ")+("andjela"===String(e)?"Anđela":"Barry");
  btn.parentNode.appendChild(tag);
  setTimeout(function(){tag.remove()},2200)
}
function renderGratitude(){const e=document.getElementById("grat-title"),n=document.getElementById("gratInput"),a=document.getElementById("gratList");if(!e||!n||!a)return;e.textContent=t("gratTitle"),n.placeholder=t("gratPlaceholder");const o=JSON.parse(localStorage.getItem("shared-gratitude")||"[]");0!==o.length?a.innerHTML=o.slice(-5).reverse().map(function(e,t){const n="andjela"===e.from?"🌸":"👦",a=e.from!==("andjela"===activeProfile?"andjela":"barry")?' <button onclick="translateGrat('+t+')" style="font-size:.55rem;padding:1px 6px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);cursor:pointer">🌐</button>':"";return'<div class="grat-block"><div class="gratitude-item"><span class="gratitude-heart">'+n+'</span><span id="grat-txt-'+t+'">'+esc(e.text)+"</span>"+a+"</div>"+gratEchoRow(e)+"</div>"}).join(""):a.innerHTML=""}function translateGrat(e){_gratNotes||(_gratNotes=JSON.parse(localStorage.getItem("shared-gratitude")||"[]"));const t=_gratNotes[e];if(!t)return;const n="andjela"===t.from?"sr":"sr"===lang?"zh-CN":"sr",a="sr"===lang?"sr":"zh-CN"===lang?"zh-CN":"en";n!==a&&translateText(t.text,n,a).then(function(t){const n=document.getElementById("grat-txt-"+e);n&&(n.textContent=t)})}function saveCheckinAnswer(e,t){const n="shared-checkin-"+activeProfile,a=JSON.parse(localStorage.getItem(n)||"{}");a[e]=t,localStorage.setItem(n,JSON.stringify(a)),renderCheckin(),pushAllSharedData()}function getCheckinAnswers(e){return JSON.parse(localStorage.getItem("shared-checkin-"+e)||"{}")}function renderCheckin(){const e=(new Date).getDay();if(0!==e&&6!==e)return void(document.getElementById("checkinCard").style.display="none");document.getElementById("checkinCard").style.display="",document.getElementById("checkin-title").textContent=t("checkinTitle");const n=CHECKIN_QUESTIONS[lang]||CHECKIN_QUESTIONS.sr,a=getCheckinAnswers(activeProfile),o="andjela"===activeProfile?"barry":"andjela",r=getCheckinAnswers(o),i="andjela"===o?"🌸 Anđela":"👦 Barry";let s=n.map(function(e,t){const n=a[t]||"",o=r[t]||"",s=e.opts.map(function(e){return'<span class="cq-opt'+(n===e?" picked":"")+'" onclick="saveCheckinAnswer('+t+",'"+e.replace(/'/g,"\\'")+"')\">"+e+"</span>"}).join(""),l=o?'<div style="font-size:.62rem;color:var(--gold);margin-top:4px">'+i+": "+o+"</div>":"";return'<div class="checkin-q"><div class="cq-label"><span>'+e.q+'</span></div><div class="cq-options">'+s+"</div>"+l+"</div>"}).join("");0===Object.keys(a).length&&0===Object.keys(r).length&&(s+='<div style="text-align:center;font-size:.68rem;color:var(--text-muted);margin-top:8px">'+("sr"===lang?"Odgovori na pitanja — partner će videti tvoje odgovore ✨":"en"===lang?"Answer the questions — your partner will see your answers ✨":"回答问题——伴侣会看到你的答案 ✨")+"</div>"),document.getElementById("checkinContent").innerHTML=s}function saveMySong(){const e=document.getElementById("songInputTitle").value.trim();if(!e)return void toast(t("songSaveEmpty"));const n={title:e,note:document.getElementById("songInputNote").value.trim()||"",from:activeProfile,time:Date.now()};localStorage.setItem("shared-song-"+activeProfile,JSON.stringify(n)),renderSong(),pushAllSharedData(),toast(t("songSaved"))}function loadSong(e){return safeParse(localStorage.getItem("shared-song-"+e),null)}function getKnowMeData(){return safeParse(localStorage.getItem("shared-knowme"),{})}function saveKnowMeData(e){localStorage.setItem("shared-knowme",JSON.stringify(e))}function renderKnowMe(){if(!document.getElementById("knowMeCard"))return;document.getElementById("knowMe-title").textContent=t("knowMeTitle");const e=Math.floor(Date.now()/864e5)%KNOW_ME_QUESTIONS.length,n=KNOW_ME_QUESTIONS[e],a=n.q[lang]||n.q[lang.split("-")[0]]||n.q.sr,o=fmtDate(today()),r=getKnowMeData()[o]||{},i=r[activeProfile],s="andjela"===activeProfile?"barry":"andjela",l=r[s],d="andjela"===s?"🌹 Anđela":"👦 Barry",g="andjela"===activeProfile?"🌹 Anđela":"👦 Barry";/* §一 这里**不**插 knowMeGuessHtml：本卡下面已经把当天的题目单独显示了一行
   （`c+='<div style="font-size:.78rem...'+a`），再插一次就是同一道题出现两遍 ——
   正是本文件 §Phase 2B.6 记录过的「双引导叠字」。缺内容的是 Home 那张卡
   （module-dashboard 的 _knowMeAffordanceHtml），那里才需要补。 */
let c="";c+=knowMeLead(i,l);c+='<div style="font-size:.78rem;color:var(--love);font-weight:600;margin-bottom:12px;text-align:center;line-height:1.4">'+a+"</div>",c+=i?'<div style="background:var(--rose-light);border-radius:12px;padding:10px 14px;margin-bottom:8px"><span style="font-size:.62rem;color:var(--text-muted)">'+g+" "+("sr"===lang?"odgovor":"en"===lang?" answer":"的回答")+'</span><div style="font-size:.8rem;color:var(--text);margin-top:4px">'+esc(i.answer)+"</div>"+(i.fb?'<div style="margin-top:6px;font-size:.7rem;font-weight:600;color:var(--love)">'+knowMeFbText(["andjela"===activeProfile?"On kaže: ":"Ona kaže: ","They say: ","对方："]):'')+(i.fb?knowMeFbText(i.fb==="yes"?["❤️ Tačno!","❤️ Correct!","❤️ 正确！"]:["😌 Skoro","😌 Almost","😌 差不多"])+"</div>":"")+"</div>":'<div style="margin-bottom:10px"><textarea id="knowMeInput" placeholder="'+("sr"===lang?"Tvoj odgovor...":"en"===lang?"Your answer...":"你的答案...")+'" style="width:100%;border:1px solid var(--border);border-radius:12px;padding:10px 12px;font-size:.74rem;font-family:var(--font);background:var(--card);color:var(--text);resize:none;min-height:44px" maxlength="120"></textarea><button class="btn btn-primary" onclick="saveKnowMeAnswer()" style="width:100%;font-size:.7rem;padding:8px;margin-top:6px">💭 '+("sr"===lang?"Odgovori":"en"===lang?"Answer":"回答")+"</button></div>",l?(c+='<div style="padding-top:8px;border-top:1px solid var(--border);margin-top:4px"><span style="font-size:.62rem;color:var(--teal);font-weight:600">👀 '+d+t("knowMePartnerLabel")+'</span><div style="font-size:.82rem;color:var(--teal);margin-top:4px;font-style:italic;line-height:1.4">'+esc(l.answer)+"</div>"+knowMeFb(l)+"</div>",i&&l&&i.answer.trim().toLowerCase()===l.answer.trim().toLowerCase()&&(c+='<div style="text-align:center;margin-top:8px;font-size:1.5rem;animation:float-arrow .8s infinite">💞</div><div style="text-align:center;font-size:.7rem;color:var(--love);font-weight:600">'+t("knowMeMatch")+"</div>")):i&&(c+='<div style="text-align:center;padding:10px;color:var(--text-muted);font-size:.68rem;font-style:italic">⏳ '+t("knowMeWaiting")+"</div>"),document.getElementById("knowMeContent").innerHTML=c,_kmQKey=n.key}function saveKnowMeAnswer(){const e=document.getElementById("knowMeInput");if(!e)return;const n=e.value.trim();if(!n)return;const a=fmtDate(today()),o=getKnowMeData();o[a]||(o[a]={});const pv=o[a][activeProfile]||{},nx={answer:n,time:Date.now(),qKey:_kmQKey||""};if(pv.fb){nx.fb=pv.fb,nx.fbTime=pv.fbTime}o[a][activeProfile]=nx,saveKnowMeData(o),pushAllSharedData(),renderKnowMe(),toast(t("knowMeAnswerSaved"))}
/* ── §5 Know Me：猜完要有反馈，但保留自由文本 ──
   这道题问的是「对方」的事，所以两个人都在猜对方 —— 也就是说，对方的答案
   说的正是我，只有我能判它对不对。于是：对方的答案下面挂两个按钮（❤️ 正确 /
   😌 差不多），我的答案下面显示对方给我的判定。不是考试：没有分数、没有排名、
   不记录连对。判定存在被判定那条记录上（l.fb），所以两个人都看得见结果。 */
/* ── §一 她到底猜了什么 ───────────────────────────────────────────────────
   症状：Home 那张卡只说「她猜了你——猜对了吗？」，既不说是**关于什么**的猜测，
   也不给她的原话。要显示内容，先得知道「那天问的是哪道题」。

   恢复链三档，前两档可验证，第三档宁可含糊也不编：
     ① 记录自带 qKey（本轮起写入的都带）—— 直接查表，最可靠；
     ② 老记录没有 qKey，但每条都有 time（真实毫秒戳）。renderKnowMe 用
        Math.floor(Date.now()/864e5) % QUESTIONS.length 选题，而 rec.time 与
        渲染发生在**同一个 UTC 日**，所以 Math.floor(rec.time/864e5) % length
        还原出的就是同一道题。
        —— 不能用日期键（fmtDate(today())）还原：那是**本地**日期，UTC+2 下一天
        里有大半时间比 UTC 日大 1，索引随之错位，会稳定地差一题。
     ③ 两档都不可用（缺 time / time 非有限数）→ null。调用方必须降级成
        「她对你的一个猜测」这种**准确但不具体**的说法。

   ★ 三档都不允许从 answer 反推 question。answer 是自由文本，反推等于编造问题。
     knowMeQuestionFor 返回 null 时只降级措辞，绝不降级成猜。

   _kmQKey 是 renderKnowMe 当次真正渲染出来的那道题的 key：saveKnowMeAnswer 存
   的是「我看到的题」，而不是「保存那一刻按 UTC 日重算出来的题」—— 页面跨午夜挂着
   时这两者会不同。用 var 声明，免得在 renderKnowMe 里踩 TDZ。 */
var _kmQKey=null;
function knowMeQuestionFor(l){
  if(!l)return null;
  var k=String(l.qKey||"");
  if(k){for(var i=0;i<KNOW_ME_QUESTIONS.length;i++)if(KNOW_ME_QUESTIONS[i].key===k)return KNOW_ME_QUESTIONS[i]}
  if(typeof l.time!=="number"||!isFinite(l.time))return null;
  return KNOW_ME_QUESTIONS[Math.floor(l.time/864e5)%KNOW_ME_QUESTIONS.length]||null
}
function knowMeQuestionText(q){return q&&q.q?(q.q[lang]||q.q[lang.split("-")[0]]||q.q.sr||""):""}
/** 卡片的第一段。顺序是「他是冲着你来的 → 那天问的题 → 他的原话」：先让读的人
    知道这事跟自己有关，再给内容。原话逐字保留，不改写、不翻译 —— 她写的是
    塞尔维亚语就是塞尔维亚语，那正是这条信息的价值所在。 */
function knowMeGuessHtml(l){
  if(!l||!l.answer)return "";
  var she="andjela"!==activeProfile,
      kick=she?["Ona je nešto pogodila o tebi","She guessed something about you","她猜了一个关于你"]
              :["On je nešto pogodio o tebi","He guessed something about you","他猜了一个关于你"],
      gen=she?["Ona ima pretpostavku o tebi","She has a guess about you","她对你的一个猜测"]
             :["On ima pretpostavku o tebi","He has a guess about you","他对你的一个猜测"],
      pre=["Bilo je pitanje: ","The question was: ","那天的问题是："],
      lab=she?["Njena pretpostavka","Her guess","她的猜测"]:["Njegova pretpostavka","His guess","他的猜测"],
      qt=knowMeQuestionText(knowMeQuestionFor(l)),
      h='<div class="km-guess">';
  h+=qt?'<div class="km-guess-kicker">'+knowMeFbText(kick)+'</div><div class="km-guess-q">'+knowMeFbText(pre)+"<span>"+esc(qt)+"</span></div>"
       :'<div class="km-guess-kicker">'+knowMeFbText(gen)+"</div>";
  return h+'<div class="km-guess-label">'+knowMeFbText(lab)+"</div>"+
    '<blockquote class="km-guess-text">'+esc(l.answer)+"</blockquote></div>"
}
/** 「谁在等我判」—— 全库只有这一份扫描。Home（module-dashboard 的
    _newestUnjudgedGuess）与判定（rateKnowMe）共用它，所以「展示的那条」与
    「点下去改的那条」必然是同一行 —— 这正是过去那个 bug 的根因。
    筛选条件与原实现一致：有可用 time，且没有 fb。判过就靠 fb 这个**动作**清除，
    不靠时间。 */
function knowMePendingGuess(p){
  var o=getKnowMeData(),best=null;
  Object.keys(o||{}).forEach(function(d){
    var r=o[d]&&o[d][p];
    if(!r||typeof r.time!=="number"||!isFinite(r.time)||r.fb)return;
    if(!best||r.time>best.time)best={date:d,note:r,time:r.time}
  });
  return best
}
/* §一 判完之后 Home 上那一块会被 knowMePendingGuess 过滤掉、整块消失 —— 消失本身
   是反馈，但看不到「我选的是哪一个」。所以补一条回显：最近 ms 内判过的那条，交给
   knowMeFb 的已判分支渲染成同形状的 .km-fb-on 药丸（按钮的「选中状态」）。
   刻意不给它 .tnew-react：test-return-motivation.js:379 数的是 .tnew-react 的总数，
   多一个就会把它算坏；.km-fb-on 也匹配不上 test-together.js 的 '.km-fb' 计数。 */
function knowMeVerdictEcho(p,ms){
  var o=getKnowMeData(),best=null;
  Object.keys(o||{}).forEach(function(d){
    var r=o[d]&&o[d][p];
    if(!r||!r.fb||typeof r.fbTime!=="number"||!isFinite(r.fbTime))return;
    if(!best||r.fbTime>best.fbTime)best=r
  });
  if(!best||Date.now()-best.fbTime>ms)return "";
  return knowMeFb(best)
}
/** §Phase 2B.3 Know Me 的引子。卡片过去第一眼要么是我的输入框（还没答时）、
    要么是我自己的答案，读起来像当天的作业。§七 要的是「我想猜她」，所以先把
    这一轮真正活着的那件事说出来：
      · 她猜了我、而我还没判 → 这是本卡上唯一的一键回应，先说它；
      · 我还没猜她 → 说出那个悬念本身。
    其余状态（双方都处理完了）刻意留白 —— 没有新闻时不该占位。性别按对方算，
    和本文件既有的写法一致（"andjela"===activeProfile ⇒ 对方是 Barry）。
    文案沿用本文件的内联三语数组写法，不进 i18n 表。 */
function knowMeLead(i,l){
  var m="andjela"===activeProfile;
  var k=null;
  if(l&&!l.fb)k=m
    ?["On je pogađao tebe — je li pogodio?","He guessed you — was he right?","他猜了你——猜对了吗？"]
    :["Ona je pogađala tebe — je li pogodila?","She guessed you — was she right?","她猜了你——猜对了吗？"];
  else if(!i)k=m?["Pogodi ga","Guess him","猜猜他"]:["Pogodi je","Guess her","猜猜她"];
  if(!k)return"";
  return'<div class="km-lead">'+knowMeFbText(k)+"</div>"
}
function knowMeFbText(k){return "sr"===lang?k[0]:"en"===lang?k[1]:k[2]}
function knowMeFb(l){
  const yes=["❤️ Tačno!","❤️ Correct!","❤️ 正确！"],almost=["😌 Skoro","😌 Almost","😌 差不多"];
  /* §一 判过之后这里不是「按钮消失了」，而是换成一颗同形状的药丸（.km-fb-on，
     在 v2.css 里与 .km-fb 同宽同高同圆角 + 一次 pop）——「按钮显示选中状态」。 */
  if(l.fb)return'<div class="km-fb-on" style="margin-top:8px;font-size:.72rem;font-weight:600;color:var(--love)">'+knowMeFbText(l.fb==="yes"?yes:almost)+"</div>";
  /* Phase 2B.6：这里原本还有一句
       knowMeFbText(["Da li je tačno?","Was that right?","猜对了吗？"])
     但引子（knowMeLead 的「她猜了你——猜对了吗？」/ "Ona je pogađala tebe — je li
     pogodila?"）已经把同一件事问过一遍，而 Home 与 Together 的引子上方就是这一行，
     两句于是上下叠在一起。中文下两句是**完全相同的一句话**（「猜对了吗？」出现两次），
     sr/en 只是措辞不同、问的是同一件事 —— 这就是「双引导叠字」的来源。
     引子那半句被 tests/test-phase2b-knowme.js 与 tests/test-phase2b-knowme-home.js
     逐字钉住（leadText === LEAD_HIS/HERS），所以移除的是这里这一句，不是引子。
     两个按钮本身就是答案（「正确！」「差不多」），移除后语义不减：
     该分支只会在引子为「她猜了你——猜对了吗？」时渲染（见 knowMeLead 的分支顺序），
     按钮永远不会失去它要回答的那个问题。 */
  return'<div style="margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">'+
    '<button class="km-fb" onclick="rateKnowMe(\'yes\')">'+knowMeFbText(yes)+"</button>"+
    '<button class="km-fb" onclick="rateKnowMe(\'almost\')">'+knowMeFbText(almost)+"</button></div>"
}
/** 只改对方那条记录上的 fb —— 不碰 answer，也不碰我自己那条。
    §Phase 2B.4：判定可以从 Home 或 Together 上点，所以重绘走 _refreshEchoSurfaces
    而不是只重绘本卡 —— 否则点过的那处引子会留在原地。 */
function rateKnowMe(v){
  if(v!=="yes"&&v!=="almost")return;
  const o=getKnowMeData(),p="andjela"===activeProfile?"barry":"andjela";
  /* §一 这里过去写的是 fmtDate(today())，而 Home 展示的是**全库最新那条未判定**。
     她昨天猜的、我今天从 Home 点下去，就会因为「今天没有她的记录」而静默 return：
     按钮看起来能点，实际上什么都没发生 —— 用户报的正是这个。现在「展示的那条」
     与「改的那条」由同一个 knowMePendingGuess 选出，不再可能分叉。 */
  const g=knowMePendingGuess(p);
  if(!g)return;
  const r=o[g.date]&&o[g.date][p];
  if(!r)return;
  /* 幂等：重复点同一个值不再写、不再同步。连点两下不会产生第二份数据。 */
  if(r.fb===v)return;
  r.fb=v,r.fbTime=Date.now(),saveKnowMeData(o),pushAllSharedData(),_refreshEchoSurfaces();
  /* 点下去必须**看得见**变化：卡片上的按钮换成判定结果（knowMeFb 的 l.fb 分支），
     外加一句 toast。文案沿用本文件的内联三语数组写法，不进 i18n 表。 */
  toast(knowMeFbText(["❤️ Zabeleženo","❤️ Noted","❤️ 已记下"]))
}function renderSong(){const e=document.getElementById("song-title");if(!e)return;e.textContent=t("songTitle");const n=loadSong(activeProfile),a="andjela"===activeProfile?"barry":"andjela",o=loadSong(a),r="andjela"===a?"🌸 Anđela":"👦 Barry";let i="";i+=n?'<div style="margin-bottom:10px"><span style="font-size:.62rem;color:var(--text-muted)">'+t("songMyLabel")+'</span><div class="song-title">🎶 '+esc(n.title)+"</div>"+(n.note?'<div class="song-note">'+esc(n.note)+"</div>":"")+"</div>":'<div style="margin-bottom:10px"><input id="songInputTitle" placeholder="'+t("songTitlePlaceholder")+'" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:12px;font-size:.74rem;font-family:var(--font);background:var(--card);color:var(--text);margin-bottom:6px"><input id="songInputNote" placeholder="'+t("songNotePlaceholder")+'" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:12px;font-size:.74rem;font-family:var(--font);background:var(--card);color:var(--text);margin-bottom:6px"><button class="btn btn-primary" onclick="saveMySong()" style="width:100%;font-size:.7rem;padding:8px">🎵 '+t("songSave")+"</button></div>",o&&(i+='<div style="padding-top:8px;border-top:1px solid var(--border)"><span style="font-size:.62rem;color:var(--text-muted)">'+r+" "+t("songPartnerLabel")+'</span><div class="song-title">🎶 '+esc(o.title)+"</div>"+(o.note?'<div class="song-note">'+esc(o.note)+"</div>":"")+"</div>"),document.getElementById("songContent").innerHTML=i||'<span class="song-icon">🎶</span><div class="song-note">'+t("songEmpty")+"</div>"}function renderRelTips(){if("andjela"!==activeProfile)return void(document.getElementById("relTipCard").style.display="none");const e=REL_TIPS[lang]||REL_TIPS.sr,t=e[Math.floor(Math.random()*e.length)];document.getElementById("relTipIcon").textContent=t.icon,document.getElementById("relTipText").textContent=t.text,document.getElementById("relTipCard").style.display=""}
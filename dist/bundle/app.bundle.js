// Anđelin Ciklus v7.2.0 | Built 2026-08-23

/* === dist/js/gsap-animations.js === */
let HAS_GSAP=!1;try{"undefined"!=typeof gsap&&"undefined"!=typeof ScrollTrigger&&(gsap.registerPlugin(ScrollTrigger),gsap.defaults({ease:"power2.out",duration:.4}),gsap.matchMedia().add("(prefers-reduced-motion: reduce)",()=>(gsap.set(".gsap-animate",{clearProps:"all"}),()=>{})),HAS_GSAP=!0)}catch(a){}function animateLoginEntrance(){if(!HAS_GSAP)return;const a=document.querySelectorAll(".login-card");a.length&&gsap.timeline({defaults:{duration:.5,ease:"back.out(1.4)"}}).from(a,{y:40,autoAlpha:0,scale:.9,stagger:.15}).from(".login-title",{y:-20,autoAlpha:0,duration:.4},"-=0.3").from(".login-pin-area",{y:15,autoAlpha:0,duration:.3},"-=0.1")}function animateGreetingIn(){if(!HAS_GSAP)return;const a=document.querySelector(".greeting-card");a&&gsap.timeline({defaults:{ease:"back.out(1.7)",duration:.5}}).from(a,{scale:.7,autoAlpha:0,y:30}).from(".greeting-icon",{scale:0,rotation:-180,duration:.4},"-=0.2").from(".greeting-name",{y:10,autoAlpha:0},"-=0.15").from(".greeting-msg",{y:10,autoAlpha:0},"-=0.1")}function animateGreetingOut(a){HAS_GSAP&&a?gsap.to(a,{autoAlpha:0,scale:.95,duration:.25,ease:"power2.in",onComplete(){a.classList.add("hidden")}}):a&&a.classList.add("hidden")}function animateCalendarDays(){if(!HAS_GSAP)return;const a=document.querySelectorAll(".days .day.in-month");a.length&&(gsap.killTweensOf(a),gsap.from(a,{autoAlpha:0,y:10,duration:.35,stagger:{amount:.35,from:"center"},ease:"power1.out",clearProps:"all"}))}function animateModalIn(a){if(!HAS_GSAP)return;if(a||(a=document.getElementById("modal")),!a)return;const e=a.querySelector(".modal");if(e)try{gsap.killTweensOf([a,e]),a.classList.remove("hidden"),gsap.set(a,{display:"flex",autoAlpha:1}),gsap.from(e,{scale:.88,autoAlpha:0,y:15,duration:.35,ease:"back.out(1.3)",clearProps:"all"})}catch(a){}}function animateModalOut(a){if(!HAS_GSAP||!a)return void(a&&a.classList.add("hidden"));const e=a.querySelector(".modal");e?gsap.to(e,{scale:.9,autoAlpha:0,y:10,duration:.2,ease:"power2.in",onComplete(){a.classList.add("hidden"),gsap.set(e,{clearProps:"all"}),gsap.set(a,{clearProps:"all"})}}):a.classList.add("hidden")}function animateDashboardCards(){if(!HAS_GSAP)return;const a=document.querySelectorAll("#panel-dashboard .card, #panel-dashboard .dash-card");a.length&&(gsap.killTweensOf(a),gsap.from(a,{autoAlpha:0,y:20,duration:.45,stagger:.1,ease:"power2.out",clearProps:"all"}))}function showToast(a,e){e=e||"info";const t=document.getElementById("toastContainer");if(!t)return;const o=document.createElement("div");o.className="toast toast-"+e,o.textContent=a,o.setAttribute("role","alert"),t.appendChild(o),HAS_GSAP?(gsap.fromTo(o,{y:40,autoAlpha:0,scale:.95},{y:0,autoAlpha:1,scale:1,duration:.35,ease:"back.out(1.2)"}),gsap.to(o,{autoAlpha:0,y:-10,duration:.3,delay:2.5,ease:"power2.in",onComplete(){o.parentNode&&o.parentNode.removeChild(o)}})):setTimeout(()=>{o.parentNode&&o.parentNode.removeChild(o)},3e3)}function animateProgressBar(a,e){a&&(HAS_GSAP?(gsap.killTweensOf(a),gsap.to(a,{scaleX:e/100,duration:.7,ease:"power2.out",transformOrigin:"left center"})):a.style.transform="scaleX("+e/100+")")}function animateMoodPicker(a){if(!HAS_GSAP||!a)return;const e=a.querySelectorAll(".mood-btn");e.length&&(gsap.killTweensOf(e),gsap.from(e,{scale:0,autoAlpha:0,duration:.35,stagger:.05,ease:"back.out(2.5)",clearProps:"all"}))}let _starsAnimated=!1;function animateFloatingStars(){if(!HAS_GSAP||_starsAnimated)return;const a=document.querySelectorAll(".floating-stars .star");a.length&&(_starsAnimated=!0,a.forEach((a,e)=>{gsap.to(a,{y:gsap.utils.random(-15,15),x:gsap.utils.random(-8,8),rotation:gsap.utils.random(-8,8),duration:gsap.utils.random(2,4),repeat:-1,yoyo:!0,ease:"sine.inOut",delay:.25*e})}))}function animateStatsPanel(){if(!HAS_GSAP)return;const a=document.querySelectorAll("#panel-stats .card");a.length&&(gsap.killTweensOf(a),gsap.from(a,{autoAlpha:0,y:16,duration:.4,stagger:.08,ease:"power2.out",clearProps:"all"}))}function animateCountUp(a,e,t){if(t=t||"",!HAS_GSAP||!a)return void(a.textContent=e+t);const o={val:0};gsap.killTweensOf(o),gsap.to(o,{val:e,duration:1.2,ease:"power2.out",onUpdate(){a.textContent=Math.round(o.val)+t}})}function setupScrollReveals(){HAS_GSAP&&(ScrollTrigger.batch(".card, .stats-mini-card, .chart-card, .love-note-card, .garden-card",{interval:.1,batchMax:6,onEnter:a=>gsap.fromTo(a,{autoAlpha:0,y:24},{autoAlpha:1,y:0,duration:.5,stagger:.08,ease:"power2.out",overwrite:!0}),start:"top 90%",once:!0}),ScrollTrigger.batch(".diary-entry, .letter-card, .timeline-item",{interval:.1,batchMax:5,onEnter:a=>gsap.fromTo(a,{autoAlpha:0,x:-20},{autoAlpha:1,x:0,duration:.4,stagger:.06,ease:"power2.out",overwrite:!0}),start:"top 88%",once:!0}))}function initGsapAnimations(){HAS_GSAP&&(setupScrollReveals(),animateFloatingStars())}
/* === dist/js/ui-core.js === */
"use strict";function safeParse(e,t){if(null==e)return t;try{return JSON.parse(e)}catch(e){return t}}let _elCache={};function $(e){if(!_elCache[e]){const t=document.getElementById(e);t&&(_elCache[e]=t)}return _elCache[e]||null}function clearElCache(){_elCache={}}function debounce(e,t){let n=null;return function(){const a=arguments,o=this;clearTimeout(n),n=setTimeout(function(){e.apply(o,a)},t)}}function esc(e){return null==e?"":String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/`/g,"&#96;")}function closeModal(){const e=document.getElementById("modal");if(!e)return;const t=e.querySelector(".modal");t?"function"==typeof animateModalOut?animateModalOut(e):(t.classList.add("closing"),e.classList.add("closing"),t.addEventListener("animationend",function n(){t.removeEventListener("animationend",n),e.classList.add("hidden"),e.classList.remove("closing"),t.classList.remove("closing")},{once:!0})):e.classList.add("hidden"),selectedDate=null,knowledgeOpen=!1,window._lastFocusedBeforeModal&&window._lastFocusedBeforeModal.focus()}function toggleKnowledge(){if(knowledgeOpen=!knowledgeOpen,selectedDate){const e=predict();renderKnowledge(getPhase(selectedDate,e),fmtDate(selectedDate))}}function toast(e){const t=document.getElementById("toastContainer");if(!t)return;for(;t.children.length>=3;)t.firstChild.remove();const n=document.createElement("div");n.className="toast",n.textContent=e,t.appendChild(n),setTimeout(function(){n.classList.add("out")},2800),setTimeout(function(){n.parentNode&&n.remove()},3300)}document.addEventListener("click",function(e){const t=e.target.closest("[data-action]");if(!t)return;const n=t.getAttribute("data-action");if(n)switch(e.preventDefault(),n){case"close-modal":"function"==typeof closeModal&&closeModal();break;case"toggle-period":"function"==typeof togglePeriodRecord&&togglePeriodRecord();break;case"remove-period":"function"==typeof removePeriodRecord&&removePeriodRecord();break;case"save-diary":"function"==typeof saveDiaryEntry&&saveDiaryEntry();break;case"save-symptom":"function"==typeof saveSymptom&&saveSymptom();break;case"add-gratitude":"function"==typeof addGratitude&&addGratitude();break;case"send-hug":"function"==typeof sendHug&&sendHug();break;case"export-data":"function"==typeof exportAllData&&exportAllData();break;case"import-data":"function"==typeof importAllData&&importAllData();break;case"clear-diary":"function"==typeof clearAllDiaries&&clearAllDiaries();break;case"save-settings":"function"==typeof saveSettings&&saveSettings();break;default:t.dispatchEvent(new CustomEvent("action-"+n,{bubbles:!0}))}}),document.addEventListener("change",function(e){const t=e.target.closest("[data-action-change]");if(!t)return;const n=t.getAttribute("data-action-change");if(n)switch(n){case"theme":"function"==typeof switchTheme&&switchTheme(t.value);break;case"language":"function"==typeof switchLanguage&&switchLanguage(t.value)}});
/* === dist/js/i18n.js === */
!function(){try{const e=document.getElementById("appLoader");e&&(e.style.display="none")}catch(e){}}();const I18N={sr:{appTitle:"Anđelin Ciklus",theme:"Tamni režim",themeHint:"Prebacivanje između tamnog i svetlog režima",weekdays:["Pon","Uto","Sre","Čet","Pet","Sub","Ned"],months:["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Avg","Sep","Okt","Nov","Dec"],today:"Danas",tabs:["Početna","Statistika","Simptomi","Dnevnik","Podeš."],legend:["Menstruacija","Ovul./Plodni","Folikularna","Lutealna","Danas","Ljubav"],progressLabels:["Menstr.","Folikul.","Ovulacija","Lutealna"],phases:{"period-on":"Početak · Odmori","period-mid":"Menstruacija · Topliće","period-pred-first":"Predviđen početak","period-pred":"Predviđeno","period-future-first":"Buduća pred.","period-future":"Buduća pred.",ovulation:"Ovulacija · Vrhunac",fertile:"Plodni dani",luteal:"Lutealna",follicular:"Folikularna"},phaseBadges:{period:"Menstruacija","period-on":"Menstruacija","period-mid":"Menstruacija","period-pred-first":"Predviđen početak","period-pred":"Predviđeno","period-future-first":"Buduća pred.","period-future":"Buduća pred.",follicular:"Folikularna",ovulation:"Ovulacija",fertile:"Plodni dani",luteal:"Lutealna",late:"Kašnjenje"},knowledgeToggle:"📖 Saznaj više o ovoj fazi ▾",knowledgeToggleHide:"Sakri ▴",knowledge:{period:{title:"Menstruacija · Nežnost",desc:"Sluzokoža materice se ljušti. Anđeli je potrebno više odmora i topline. Barry, skuvaj joj čaj. ❤️",what:"Estrogen i progesteron na najnižem nivou. Kineska medicina preporučuje negovanje krvi (xue yang), srpska tradicija topli čaj od nane.",symptoms:"Grčevi, umor, promene raspoloženja, glavobolje, bol u leđima",tips:"Barryev savet: topli čaj od đumbira (kineski) ili nane (srpski). Termofor na stomak. Mnogo ljubavi i pažnje. ❤️"},follicular:{title:"Folikularna · Energija raste",desc:"Posle menstruacije energija se vraća. Sjajan period za planove i zajedničke aktivnosti.",what:"FSH stimuliše rast folikula. Kineski čaj od goji bobica pomaže. Srpska tradicija: voće i orašasti plodovi.",symptoms:"Povratak energije, jasnije razmišljanje, bolja koža",tips:"Planirajte zajednički izlazak! Energija je na vrhuncu za vežbanje i kreativnost."},ovulation:{title:"O ovulaciji",desc:"Zrela jajna ćelija se oslobađa. Najplodniji period. Ćelija živi ~24h, spermatozoidi do 5 dana.",what:"LH talas pokreće ovulaciju. Estrogen dostiže vrhunac.",symptoms:"Blagi bol u karlici, bistri sekret, povećan libido, blagi porast temperature",tips:"Najbolje vreme za začeće, fizičke performanse na vrhuncu"},luteal:{title:"O lutealnoj fazi",desc:"Faza između ovulacije i sledeće menstruacije. Žuto telo proizvodi progesteron.",what:"Progesteron stabilizuje sluzokožu. Ako nema trudnoće, žuto telo propada.",symptoms:"PMS, osetljivost grudi, promene raspoloženja, nadutost, žudnja za hranom",tips:"Smanjite kofein i so, uzimajte vitamin B6 i magnezijum, lagane vežbe pomažu"},fertile:{title:"O plodnim danima",desc:"Dani oko ovulacije kada je najveća verovatnoća začeća.",what:"Spermatozoidi preživljavaju 3-5 dana. Jajna ćelija živi ~24h.",symptoms:"Bistar rastegljiv sekret, povećan libido, promene bazalne temperature",tips:"Za začeće svaki drugi dan, folna kiselina, dobar san"}},emptyState:"Dodirni datum — započni svoju priču ✨",emptySymptom:"Dodirni datum na kalendaru<br>da uneseš simptome",daysUntil:"Još {n} dana do sledeće menstruacije",daysOverdue:"Kašnjenje {n} dana",day:" dana",periodDay:"{n}. dan ciklusa",expected:"Očekivano",onboarding:"👋 Dobrodošla, Anđelo! Dodirni bilo koji datum da započneš. ♥",fabLabel:"Danas je",greeting:{morning:{icon:"🌅",name:"Anđelo",msg:"Dobro jutro, anđele moj. Želim ti divan dan — budi nežna prema sebi.",sub:"— Sa ljubavlju, Barry"},afternoon:{icon:"🌤️",name:"Anđelo",msg:"Prijatno popodne, moja draga. Napravi pauzu, popij čaj i odmori — brinem se kad preteruješ.",sub:"— Tvoj Barry"},evening:{icon:"🌆",name:"Anđelo",msg:"Dobro veče, najlepša moja. Polako večeras — zaslužuješ miran i topao kraj dana.",sub:"— Sa ljubavlju, tvoj Barry"},night:{icon:"🌙",name:"Anđelo!",msg:"Zašto si još uvek budna? Odmah na spavanje! Brinem se kad ne spavaš, znaš.",sub:"— Voli te, Barry"},dismiss:"♥ Zatvori"},stats:{cycleTitle:"📈 Statistika ciklusa",historyTitle:"📅 Nedavni ciklusi",predTitle:"🔮 Predviđanje",count:"Zabeleženih ciklusa",avg:"Prosečan ciklus",range:"Najkraći / Najduži",reg:"Redovnost",next:"Sledeća menstruacija",ovulation:"Ovulacija",fertile:"Plodni dani",confidence:"Pouzdanost",future:"Buduća predviđanja",cycle:"Trend ciklusa",mood:"Raspoloženje",symptoms:"Učestalost simptoma",history:"Istorija ciklusa",short:"Kratak",normal:"Normalan",long:"Dug",relationship:"Veza",note:"Današnja beleška",knowme:"Da li me poznaješ?",regularity:"Regularnost"},historyLabel:"● Kratak  ● Normalan  ● Dug  (tačka = ciklus)",modal:{details:"Detalji datuma",marked:"Zabeležen početak",phase:"Faza",day:"Dan ciklusa",symptoms:"Simptomi",mark:"Označi početak",unmark:"Ukloni",close:"Zatvori",quickSymptom:"Brzi unos",notesPlaceholder:"Beleške..."},symptoms:{cramps:"Grčevi",mood:"Raspoloženje",flow:"Protok",headache:"Glavobolja",fatigue:"Umor",cravings:"Žudnja"},tips:{period:[{icon:"🩸",text:"Telo gubi gvožđe — jedite crveno meso, spanać i susam.",source:"",tcm:!1},{icon:"♨",text:"Zagrejte stomak termoforom ili toplom vodom.",source:"",tcm:!1},{icon:"🍵",text:"Popijte čaj od šipurka posle obroka — umiruje grčeve.",source:"Srpska tradicija",tcm:!1},{icon:"🧘",text:"Blago istezanje ili joga ublažavaju tegobe.",source:"",tcm:!1},{icon:"🫘",text:"Crveni pasulj i susam bogati gvožđem — tradicionalni srpski izvor gvožđa.",source:"Srpska kuhinja",tcm:!1}],follicular:[{icon:"💪",text:"Estrogen raste, energija se vraća — odlično za novi fitnes plan.",source:"",tcm:!1},{icon:"🥗",text:"Jedite dosta povrća i voća za uravnoteženu ishranu.",source:"",tcm:!1},{icon:"🌿",text:"U kineskoj medicini, ovo je vreme za jačanje krvi (养血). Probajte goji bobice.",source:"中医智慧",tcm:!0},{icon:"🎯",text:"Jasno razmišljanje i visoka energija za važne odluke.",source:"",tcm:!1}],ovulation:[{icon:"⭐",text:"Faza ovulacije — najplodniji dani.",source:"",tcm:!1},{icon:"🏃",text:"Fizičke performanse na vrhuncu — odlično za treninge.",source:"",tcm:!1},{icon:"🌸",text:"U kineskoj tradiciji, ovo je vreme ravnoteže (阴阳调和). Uživajte u prirodi.",source:"中医智慧",tcm:!0}],luteal:[{icon:"🍵",text:"Smanjite kofein — može pogoršati anksioznost.",source:"",tcm:!1},{icon:"🌿",text:"Vitamin B6 i magnezijum ublažavaju predmenstrualne simptome.",source:"",tcm:!1},{icon:"🫚",text:"Topla voda sa đumbirom i crvenim datulama greje telo pred ciklus.",source:"中医智慧 · 姜枣茶",tcm:!0},{icon:"🍌",text:"Skloni nadutosti? Smanjite so, jedite banane.",source:"",tcm:!1}]},settings:{lang:"Jezik / Language / 语言",langHint:"Promeni jezik",theme:"Tema",themeHint:"Tamni / Svetli režim",cycle:"Dužina ciklusa",cycleHint:"Automatski, možeš i ručno",period:"Trajanje menstruacije",periodHint:"Trajanje svake menstruacije",override:"Ručne vrednosti",overrideHint:"Ignoriši automatski proračun",save:"💾 Sačuvaj",export:"📤 Izvezi (JSON)",import:"📥 Uvezi (JSON)",clear:"🗑 Obriši sve",clearConfirm:"Sigurna si? Ovo se ne može opozvati!",anniversary:"Godišnjica",anniversaryHint:"Dan kad ste počeli"},toast:{saved:"Sačuvano ✓",marked:"Označeno ✓ Barry je uz tebe",unmarked:"Uklonjeno • Nema veze ❤️",symptomSaved:"Sačuvano ✓",symptomQuick:"Ažurirano ✓",exported:"Izvezeno ✓",imported:"Uvezeno ✓",importError:"Greška",cleared:"Obrisano"},reminder:{beforePeriod:"⏰ Menstruacija za {days} dana — spremi se, dušo",late:"⚠️ Kašnjenje {days} dana — konsultuj lekara",ovulation:"✨ Danas je ovulacija — vrhunac plodnosti"},cycleCounter:"Zajedno: {n} ciklusa",cycleCounterSub:"Barry prati svaki tvoj ciklus ♥",anniversaryTitle:"💕 Datumi koji znače",annMetLabel:"✨ Prvi put smo se sreli",annLoveLabel:"♥ Zajedno smo od",annCountMet:"{n} dana od prvog susreta ✨",annCountLove:"{n} dana zajedno ♥",yearTitle:"Godišnji pregled"},"zh-CN":{appTitle:"Anđelin Ciklus",theme:"深色模式",themeHint:"切换深色/浅色主题",weekdays:["一","二","三","四","五","六","日"],months:["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],today:"今天",tabs:["主页","统计","症状","日记","设置"],legend:["经期","排卵/易孕","卵泡期","黄体期","今天","♥纪念日"],progressLabels:["经期","卵泡期","排卵","黄体期"],phases:{"period-on":"经期 · 多休息","period-mid":"经期 · 注意保暖","period-pred-first":"预测开始","period-pred":"预测经期","period-future-first":"未来预测","period-future":"未来预测",ovulation:"排卵 · 最佳时机",fertile:"受孕窗 · 能量峰值",luteal:"黄体期 · 放松心情",follicular:"卵泡期 · 精力充沛"},phaseBadges:{period:"经期中","period-on":"经期中","period-mid":"经期中","period-pred-first":"预测开始","period-pred":"预测经期","period-future-first":"未来预测","period-future":"未来预测",follicular:"卵泡期",ovulation:"排卵日",fertile:"易孕期",luteal:"黄体期",late:"已推迟"},knowledgeToggle:"📖 了解这个阶段 ▾",knowledgeToggleHide:"收起 ▴",knowledge:{period:{title:"经期 · 温暖守护",desc:"子宫内膜脱落排出体外。这几天Anđela需要更多关心和休息。Barry记得给她泡一杯热茶。",what:"雌激素和孕激素最低。中医建议此时「养血」，塞尓维亚传统建议用暖水袋缓解不适。",symptoms:"腹部绞痛、疲劳、情绪波动、头痛、腰酸",tips:"Barry的贴心提醒：泡一杯姜枣茶（中医）或薄荷茶（塞尔维亚），用暖水袋敷肚子。少喝咖啡，多休息。"},follicular:{title:"卵泡期 · 活力回升",desc:"经期结束后卵泡开始发育，雌激素上升。Anđela的精力开始恢复，这是制定计划的好时机。",what:"FSH 刺激卵泡生长，雌激素使子宫内膜重新增厚。中医推荐枸杞红枣茶补气养血。",symptoms:"精力恢复、思维清晰、皮肤状态改善、自信心提升",tips:"适合开启新项目。塞尔维亚传统建议多吃水果和坚果。一起计划下一次约会吧！"},ovulation:{title:"排卵期 · 能量巅峰",desc:"这是Anđela体能和情绪最好的时期。成熟卵子从卵巢释放，生育力达到顶峰。",what:"LH 激素激增触发卵子释放。中医讲究「阴阳调和」，此时是身心最平衡的阶段。",symptoms:"轻微腹痛、分泌物清亮、性欲增强、体温微升、精力充沛",tips:"如果备孕，这是最佳时机。塞尔维亚传统认为此时适合户外活动和社交。Barry记得多夸她！"},luteal:{title:"黄体期 · 温柔以待",desc:"排卵后到下次月经前的阶段。孕激素上升，Anđela可能需要更多耐心和理解。",what:"孕激素稳定子宫内膜。如未受孕则黄体退化。中医认为此时宜「静养」，塞尔维亚传统推荐花草茶。",symptoms:"PMS、乳房胀痛、情绪波动、水肿、食欲变化、疲劳",tips:"减少咖啡因和盐。塞尔维亚传统：洋甘菊茶安神；中医：红枣桂圆汤暖身。Barry：多倾听，少讲道理。"},fertile:{title:"易孕窗 · 最佳时机",desc:"排卵日前后几天是最易受孕的阶段。精子可存活3-5天，卵子约24小时。",what:"约6天的受孕窗口。中医讲究「天人合一」，此时身体状态最适合孕育新生命。",symptoms:"分泌物清亮黏滑如蛋清、性欲增强、基础体温略升",tips:"如果计划怀孕，隔天同房受孕率最高。塞尔维亚传统：保持心情愉快，避免压力。补充叶酸。"}},emptyState:"点击日历 开始记录你们的故事 ✨",emptySymptom:"点击日历中的日期<br>来记录当日症状",daysUntil:"距下次月经还有 {n} 天",daysOverdue:"已推迟 {n} 天",day:"天",periodDay:"经期第 {n} 天",expected:"预计",onboarding:"👋 欢迎！点击日历开始记录吧 ♥",fabLabel:"今天来了",greeting:{morning:{icon:"🌅",name:"Anđelo",msg:"早安，我的天使。愿你今天温柔待自己。",sub:"— 爱你的 Barry"},afternoon:{icon:"🌤️",name:"Anđelo",msg:"下午了，亲爱的。休息一下，喝杯茶——你太拼了我会心疼。",sub:"— 你的 Barry"},evening:{icon:"🌆",name:"Anđelo",msg:"晚上好，最美的你。慢慢来——你值得一个温暖平静的夜晚。",sub:"— 爱你的 Barry"},night:{icon:"🌙",name:"Anđelo！",msg:"怎么还没睡？快去睡觉！你不睡我会担心的，知道吗。",sub:"— 想你的 Barry"},dismiss:"♥ 开始"},stats:{cycleTitle:"📈 周期统计",historyTitle:"📅 近期周期",predTitle:"🔮 当前预测",count:"已记录周期数",avg:"平均周期",range:"最短 / 最长",reg:"规律性",next:"下次月经",ovulation:"排卵日",fertile:"易孕窗口",confidence:"置信度",futurePeriod:"未来预测",currentPhase:"当前阶段",trendTitle:"📈 周期趋势",historyTitle:"📜 周期历史",cycle:"周期趋势",mood:"心情分布",symptoms:"症状频率",history:"周期历史",short:"短",normal:"正常",long:"长",relationship:"我们的关系",note:"今日笔记",knowme:"你了解我吗",regularity:"规律性"},historyLabel:"● 偏短  ● 正常  ● 偏长  (每点=一个周期)",modal:{details:"日期详情",marked:"已记录的经期开始日",phase:"阶段",day:"周期第几天",symptoms:"已记录症状",mark:"标记经期开始",unmark:"取消标记",close:"关闭",quickSymptom:"快速记录症状",notesPlaceholder:"添加备注..."},symptoms:{cramps:"痛经",mood:"情绪",flow:"流量",headache:"头痛",fatigue:"疲劳",cravings:"食欲"},tips:{period:[{icon:"🩸",text:"经期身体流失铁质，多吃红肉、菠菜、黑芝麻等富含铁的食物。",source:"",tcm:!1},{icon:"♨",text:"注意腹部保暖，可使用暖水袋或暖宝宝缓解不适。",source:"",tcm:!1},{icon:"🍵",text:"喝杯红枣姜茶，暖宫驱寒，缓解经期不适。",source:"中医养生 · 姜枣茶",tcm:!0},{icon:"🧘",text:"轻度拉伸或瑜伽有助缓解不适，避免剧烈运动。",source:"",tcm:!1},{icon:"🫘",text:"红豆补血养心——相思之物，亦养身之物。",source:"中医智慧 · 红豆",tcm:!0}],follicular:[{icon:"💪",text:"卵泡期雌激素上升，精力和体能恢复中，适合开启新运动计划。",source:"",tcm:!1},{icon:"🥗",text:"新陈代谢较好，多吃蔬菜水果，均衡营养。",source:"",tcm:!1},{icon:"🌿",text:"中医认为此时宜养血（养血），枸杞红枣茶正当时。",source:"中医智慧",tcm:!0},{icon:"🎯",text:"思维清晰精力充沛，适合处理复杂任务和做重要决定。",source:"",tcm:!1}],ovulation:[{icon:"⭐",text:"排卵期，如有备孕计划，这几天是最佳时机。",source:"",tcm:!1},{icon:"🏃",text:"体能处于高峰，适合高强度训练。",source:"",tcm:!1},{icon:"🌸",text:"中医讲究阴阳调和，此时阴阳平衡，适合赏花散步。",source:"中医养生",tcm:!0}],luteal:[{icon:"🍵",text:"黄体期减少咖啡因摄入，可能加重焦虑和情绪波动。",source:"",tcm:!1},{icon:"🌿",text:"适当补充维生素B6和镁，有助缓解经前不适。",source:"",tcm:!1},{icon:"🫚",text:"姜枣茶温经散寒——东方古老的温柔。",source:"中医智慧 · 姜枣茶",tcm:!0},{icon:"🍌",text:"易水肿，减少盐分，多吃香蕉等富含钾的食物。",source:"",tcm:!1}]},settings:{lang:"语言 / Language / Jezik",langHint:"切换界面语言",theme:"主题",themeHint:"深色/浅色模式",cycle:"默认周期长度",cycleHint:"系统自动计算，可手动覆盖",period:"默认经期天数",periodHint:"每次经期持续天数",override:"使用手动值预测",overrideHint:"开启后将忽略自动计算",save:"💾 保存设置",export:"📤 导出数据 (JSON)",import:"📥 导入数据 (JSON)",clear:"🗑 清除所有数据",clearConfirm:"确定清除所有数据？此操作不可恢复！",anniversary:"纪念日",anniversaryHint:"你们在一起的那一天"},toast:{saved:"设置已保存 ✓",marked:"已标记 ✓ Barry在守护着你",unmarked:"已取消 ·没关系 ❤️",symptomSaved:"症状已保存 ✓",symptomQuick:"症状已更新 ✓",exported:"数据已导出 ✓",imported:"数据导入成功 ✓",importError:"导入失败",cleared:"所有数据已清除"},reminder:{beforePeriod:"⏰ 预计 {days} 天后经期开始，提前准备哦",late:"⚠️ 经期已推迟 {days} 天，注意休息和调理",ovulation:"✨ 今天是排卵期，备孕的最佳时机"},cycleCounter:"一起走过 {n} 个周期",cycleCounterSub:"Barry 陪着你走过每一个周期 ♥",anniversaryTitle:"💕 重要的日子",annMetLabel:"✨ 初次相遇",annLoveLabel:"♥ 在一起的日子",annCountMet:"相遇 {n} 天 ✨",annCountLove:"相恋 {n} 天 ♥",yearTitle:"年度概览"},en:{appTitle:"Anđelin Ciklus",theme:"Dark Mode",themeHint:"Switch between dark and light",weekdays:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],months:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],today:"Today",tabs:["Home","Stats","Symptoms","Diary","Settings"],legend:["Period","Ovul./Fertile","Follicular","Luteal","Today","♥ Love"],progressLabels:["Period","Follicular","Ovulation","Luteal"],phases:{"period-on":"Period · Rest Well","period-mid":"Period · Stay Warm","period-pred-first":"Predicted Start","period-pred":"Predicted","period-future-first":"Future Pred.","period-future":"Future Pred.",ovulation:"Ovulation",fertile:"Fertile",luteal:"Luteal",follicular:"Follicular"},phaseBadges:{period:"Period","period-on":"Period","period-mid":"Period","period-pred-first":"Predicted Start","period-pred":"Predicted","period-future-first":"Future Pred.","period-future":"Future Pred.",follicular:"Follicular",ovulation:"Ovulation",fertile:"Fertile",luteal:"Luteal",late:"Late"},knowledgeToggle:"📖 Learn about this phase ▾",knowledgeToggleHide:"Hide ▴",knowledge:{period:{title:"Period · Rest & Warmth",desc:"The uterine lining sheds. Anđela needs extra care these days — a warm tea and gentle words go a long way. ❤️",what:"Estrogen and progesterone at lowest. TCM suggests nourishing blood (养血); Serbian tradition recommends mint tea and warmth.",symptoms:"Cramps, fatigue, mood swings, headaches, back pain",tips:"Barry's tip: ginger tea (Chinese) or mint tea (Serbian). Heating pad on the belly. And lots of love from 7,000 km away. ❤️"},follicular:{title:"Follicular · Rising Energy",desc:"After the period, energy returns. A great time for plans and new ideas together.",what:"FSH stimulates follicle growth. TCM recommends goji berry tea. Serbian tradition: fresh fruit and nuts.",symptoms:"Energy returning, clear thinking, better skin",tips:"Plan a virtual date! Great time for exercise and creative projects together."},ovulation:{title:"Ovulation",desc:"Mature egg released. Most fertile time.",what:"LH surge triggers ovulation. Estrogen peaks.",symptoms:"Mild pelvic pain, egg-white mucus, increased libido",tips:"Best time for conception, peak performance"},luteal:{title:"Luteal Phase",desc:"Between ovulation and next period.",what:"Progesterone stabilizes lining. Corpus luteum degrades if no pregnancy.",symptoms:"PMS, breast tenderness, mood swings, bloating",tips:"Reduce caffeine and salt, supplement B6 and magnesium"},fertile:{title:"Fertile Window",desc:"Days around ovulation when pregnancy is most likely.",what:"Sperm survive 3-5 days. Egg ~24h. ~6-day fertile window.",symptoms:"Clear mucus, increased libido, temperature changes",tips:"Every other day for conception, folic acid, good sleep"}},emptyState:"Tap a date — start your story here ✨",emptySymptom:"Tap a date on the calendar<br>to log symptoms",daysUntil:"{n} days until next period",daysOverdue:"{n} days late",day:" days",periodDay:"Period Day {n}",expected:"Expected",onboarding:"👋 Welcome, Anđela! Tap any date to begin. ♥",fabLabel:"Period today",greeting:{morning:{icon:"🌅",name:"Anđelo",msg:"Good morning, my angel. Wishing you a wonderful day — be gentle with yourself.",sub:"— With love, Barry"},afternoon:{icon:"🌤️",name:"Anđelo",msg:"Good afternoon, my dear. Take a break, have some tea — you worry me when you overdo it.",sub:"— Your Barry"},evening:{icon:"🌆",name:"Anđelo",msg:"Good evening, my most beautiful. Take it slow tonight — you deserve a peaceful end to the day.",sub:"— With love, your Barry"},night:{icon:"🌙",name:"Anđelo!",msg:"Why are you still awake? Go to sleep right now! I worry when you don't sleep, you know.",sub:"— Love, Barry"},dismiss:"♥ Enter"},stats:{cycleTitle:"📈 Cycle Statistics",historyTitle:"📅 Recent Cycles",predTitle:"🔮 Prediction",count:"Cycles recorded",avg:"Average cycle",range:"Shortest / Longest",reg:"Regularity",next:"Next period",ovulation:"Ovulation",fertile:"Fertile window",confidence:"Confidence",future:"Future predictions",cycle:"Cycle Trend",mood:"Mood Distribution",symptoms:"Symptom Frequency",history:"Cycle History",short:"Short",normal:"Normal",long:"Long",relationship:"Relationship",note:"Today's Note",knowme:"Do You Know Me?",regularity:"Regularity"},historyLabel:"● Short  ● Normal  ● Long  (dot = cycle)",modal:{details:"Date Details",marked:"Recorded Period Start",phase:"Phase",day:"Cycle day",symptoms:"Symptoms",mark:"Mark Period Start",unmark:"Remove",close:"Close",quickSymptom:"Quick Symptom Log",notesPlaceholder:"Add notes..."},symptoms:{cramps:"Cramps",mood:"Mood",flow:"Flow",headache:"Headache",fatigue:"Fatigue",cravings:"Cravings"},tips:{period:[{icon:"🩸",text:"Your body loses iron — eat iron-rich foods like red meat and spinach.",source:"",tcm:!1},{icon:"♨",text:"Keep your abdomen warm. A heating pad helps relieve discomfort.",source:"",tcm:!1},{icon:"🍵",text:"Try rosehip tea after meals — a Serbian tradition for easing cramps.",source:"Serbian tradition",tcm:!1},{icon:"🧘",text:"Gentle stretching or yoga helps. Avoid intense exercise.",source:"",tcm:!1},{icon:"🫘",text:"Red beans nourish the blood — an ancient Chinese remedy for women.",source:"TCM Wisdom",tcm:!0}],follicular:[{icon:"💪",text:"Estrogen rising, energy returning — great time for new fitness.",source:"",tcm:!1},{icon:"🥗",text:"Eat plenty of vegetables and fruits for balanced nutrition.",source:"",tcm:!1},{icon:"🌿",text:"In Chinese medicine, this is the time to nourish blood (养血). Try goji tea.",source:"TCM Wisdom",tcm:!0},{icon:"🎯",text:"Clear thinking and high energy — ideal for important decisions.",source:"",tcm:!1}],ovulation:[{icon:"⭐",text:"Ovulation phase. Most fertile days if planning pregnancy.",source:"",tcm:!1},{icon:"🏃",text:"Physical performance peaks — great for high-intensity workouts.",source:"",tcm:!1},{icon:"🌸",text:"In Chinese tradition, a time of balance (阴阳调和). Enjoy nature.",source:"TCM Wisdom",tcm:!0}],luteal:[{icon:"🍵",text:"Reduce caffeine — it can worsen anxiety and mood swings.",source:"",tcm:!1},{icon:"🌿",text:"Vitamin B6 and magnesium may ease premenstrual symptoms.",source:"",tcm:!1},{icon:"🫚",text:"Ginger tea with red dates warms the body — an ancient Eastern remedy.",source:"TCM Wisdom",tcm:!0},{icon:"🍌",text:"Prone to bloating? Reduce salt, eat bananas.",source:"",tcm:!1}]},settings:{lang:"Language / 语言 / Jezik",langHint:"Switch language",theme:"Theme",themeHint:"Dark / Light mode",cycle:"Default cycle length",cycleHint:"Auto-calculated (editable)",period:"Default period length",periodHint:"Duration of each period",override:"Use manual values",overrideHint:"Ignore auto-calculation",save:"💾 Save Settings",export:"📤 Export Data (JSON)",import:"📥 Import Data (JSON)",clear:"🗑 Clear All Data",clearConfirm:"Are you sure? This cannot be undone!",anniversary:"Anniversary",anniversaryHint:"The day you two started"},toast:{saved:"Saved ✓",marked:"Marked ✓ Barry is with you",unmarked:"Removed · It’s okay ❤️",symptomSaved:"Saved ✓",symptomQuick:"Updated ✓",exported:"Exported ✓",imported:"Imported ✓",importError:"Import failed",cleared:"Cleared"},reminder:{beforePeriod:"⏰ Period in {days} days — get ready, darling",late:"⚠️ Period {days} days late — check with doctor",ovulation:"✨ Ovulation day — peak fertility"},cycleCounter:"Together: {n} cycles",cycleCounterSub:"Barry is with you every step ♥",anniversaryTitle:"💕 Dates that matter",annMetLabel:"✨ First time we met",annLoveLabel:"♥ Together since",annCountMet:"{n} days since we met ✨",annCountLove:"{n} days together ♥",yearTitle:"Year Overview"}},I18N_EXT={sr:{profileName:"Anđela",profileName2:"Barry",loveNoteDefault:"Svakog dana mislim na tebe — ti si najlepši deo mog sveta. 💕",loveNoteSig:"— Tvoj Barry",moodTitle:"😊 Raspoloženje",moodToday:"Kako se osećaš danas?",moodHistoryLabel:"Poslednjih 7 dana",streakLabel:"dana zaredom!",streakLabel0:"Započni niz!",streakBadgeHot:"Sjajno! 🔥",streakBadgeWarm:"Dobro ✨",streakBadgeCold:"Započni danas 🌱",diaryTitle:"📓 Moja rečenica",diaryPrompt:"Danas ______ me je nasmejalo.",diaryPlaceholder:"upiši jednu rečenicu...",gardenTitle:"🌱 Naša bašta",gardenSeed:"Zalivaj me svaki dan — klikni na emoji iznad! 🌱",gardenSprout:"Tvoj niz raste... nastavi dalje! 🌿",gardenGrowing:"Sve si bliže cvetanju! 🌷",gardenBudding:"Skoro procvetala — još malo! 🎀",gardenBlooming:"Prelepo cvetaš! Kao naša ljubav. 🌸✨",forecastTomorrow:"Sutra",forecastFollicular:"Sutra si u folikularnoj fazi — energija raste, sjajan dan za planove! 💪",forecastOvulation:"Sutra je ovulacija — tvoje telo sija najjače! ✨",forecastLuteal:"Sutra ulaziš u lutealnu fazu — uspori malo, zaslužuješ odmor 🌙",forecastPeriod:"Sutra bi mogla da krene menstruacija — pripremi grejač i čaj 💗",forecastNormal:"Slušaj svoje telo. Ti si neverovatna svakog dana. 🌸",moodEmojis:["😊","🥰","😤","😴","😢","🤩","😰","😐"],moodNames:["Srećna","Voljena","Frustrirana","Umorna","Tužna","Uzbuđena","Anksiozna","Meh"],sharedDiaryTab:"Dnevnik",profileSwitch:"Profil promenjen",profileOnly:"Samo Barry može ovo pregledati",barryTipsPeriod:[{icon:"🫂",text:"Ona je u bolovima — budi nežan, zagrli je, donesi joj termofor i čaj."},{icon:"🍫",text:"Ponesi joj čokoladu. Male stvari znače najviše kad je boli."},{icon:"😤",text:'Ne svađaj se — raspoloženje joj je na minimumu. Slušaj, klimaj, reci "u pravu si".'},{icon:"🛏️",text:"Pusti je da se odmara. Donesi joj ćebe i ostavi na miru ako želi."},{icon:"💆",text:"Ponudi masažu leđa ili stopala — nežno, njeno telo je sad osetljivo."}],barryTipsFollicular:[{icon:"🎯",text:"Imaće više energije — isplaniraj izlazak, šetnju, zajedničku aktivnost!"},{icon:"💬",text:"Društvenija je — odlično vreme za dublje razgovore i planove za budućnost."},{icon:"💪",text:"Pridruži joj se u sportu ili fizičkoj aktivnosti. Zajedno ste jači."},{icon:"🌸",text:"Kupi joj cveće bez povoda. Primetiće i najmanji znak pažnje."},{icon:"🎨",text:"Faza kreativnosti — predloži novi hobi ili zajednički projekat."}],barryTipsOvulation:[{icon:"✨",text:"Danas sija — reci joj koliko je lepa. Budi iskren i detaljan u komplimentima."},{icon:"💋",text:"Fizička bliskost joj je važna — grli je, ljubi, drži za ruku."},{icon:"🎉",text:"Vrhunac energije — odličan dan za ples, izlazak, druženje."},{icon:"🔥",text:"Njen libido je na vrhuncu — budi pažljiv i romantičan večeras."},{icon:"📸",text:"Fotografiši je danas — blistaće na svakoj slici."}],barryTipsLuteal:[{icon:"🧘",text:"PMS počinje — ne shvataj ništa lično. Njen mozak je u hormonskom haosu."},{icon:"🍵",text:"Skuvaj joj čaj od kamilice ili nane. Smiruje nerve i pokazuje da brineš."},{icon:"🤐",text:"Slušaj više, pričaj manje. Ne rešavaj — samo slušaj."},{icon:"🍕",text:"Imaće žudnju — naruči njenu omiljenu hranu bez pitanja."},{icon:"🌙",text:"Pomogni joj da se opusti — topla kupka, sveće, muzika. Zaslužuje mir."}],barryTipsGeneral:[{icon:"💌",text:"Pošalji joj poruku sad — reci da misliš na nju. Ne treba povod."},{icon:"💝",text:"Mali znak pažnje danas — njen omiljeni sok, voće, nešto što voli."},{icon:"📞",text:"Pozovi je — čuj njen glas, pitaj kako je prošao dan."},{icon:"🌍",text:"Seti se — ti si njen oslonac. Voli te. Ti si dovoljan."}],diaryTextareaPlaceholder:"…… 想对她说的话，发自心底 ❤️",diaryDateStripPrev:"◂ Prethodna nedelja",diaryDateStripNext:"Sledeća nedelja ▸",diaryCalPrevMonth:"◂ Prethodni mesec",diaryCalNextMonth:"Sledeći mesec ▸",diaryGoToday:"📍 Danas",diaryCalBtnTitle:"Kalendar",diaryFooterCredit:"Napravljeno sa ljubavlju za Anđelu Nemet ♥",diary:{title:"💌 Naš dnevnik",placeholder:"Piši za svoju ljubav... ✍️",save:"💾 Sačuvaj",saved:"✅ Sačuvano",empty:"Još nema unosa za danas 📭",partnerEmpty:"Tvoj partner još nije pisao 💌",allEntries:"📜 Svi unosi",mailbox:"📮 Poštansko sanduče",export:"📤 Izvezi podatke (JSON)",import:"📥 Uvezi podatke (JSON)",andiLetter:"🌸 Anđelino pismo",barryLetter:"👦 Barryjevo pismo"},settingsTokenHintEnabled:"✅ Sinhronizacija uključena 🌐",settingsTokenHintDisabled:"Unesite GitHub Token za sinhronizaciju dva telefona",settingsTokenLabel:"GitHub Token",tokenSaved:"Token sačuvan ✓",tokenMissing:"Prvo unesi token",tokenValid:"Token važi",tokenInvalid:"Token nevažeći",tokenError:"Greška: ",tokenNetError:"Mrežna greška",tokenConfirmClear:"Obrisati GitHub token? Sinhronizacija će prestati.",tokenCleared:"Token obrisan",settingsExportAll:"📦 Izvezi sve podatke",settingsImportAll:"📥 Vrati iz backup-a",settingsClearDiary:"🗑️ Obriši sve dnevnike",settingsClearDiaryConfirm:"Obrisati SVE zajedničke dnevnike? Ovo se ne može vratiti.",settingsThemeLight:"☀️ Svetli",settingsThemeDark:"🌙 Tamni",sleepTitle:"Spavanje",sleepHint:"Kad si legao sinoc? Angie vidi tvoje vreme spavanja",sleepSave:"Sačuvaj",sleepEmpty:"Barry jos nije uneo vreme — podseti ga!",sleepLabel:"Sinoc je legao u",sleepSaved:"Sačuvano!",sleepLateTitle:"Legao je u {time}! PREKASNO!",sleepLateMsg:"Barry, molim te, idi u krevet ranije! \u{1F495}",specialBadgeTexts:["Ti si jedinstvena ✨","Najlepse na svetu 🌸","Barryjeva ljubav 💝","Jedna jedina 💫"],calendarPredLegend:"※ Prozirni datumi su predviđanja · Barry je uz tebe na svakom koraku ❤️",fabEndPeriod:"Kraj ciklusa",fabStartPeriod:"Početak ciklusa",fabEndYet:"Kraj mora biti posle početka",fabEndMarked:"Kraj ciklusa označen ✓",fabAlreadyMarked:" - već označeno",authPinBtn:"🔓 Prijavi se",authTapHint:"Dodirni za prijavu",authSwitchHint:"Unesi svoj PIN",gardenState0:"Klikni na emoji iznad da me zaliješ! 💧",gardenState1:"Prvi dan! Nastavi da me zalivaš svaki dan 🌱",gardenState3:"Rastem! Još malo pa cvetam 🌿",gardenState7:"Pupoljak! Tvoja ljubav me hrani 🌷",gardenStateBloom:"Procvetala! Kao i vaša ljubav 🌸",sdExportCopied:"Kopirano! Pošalji partneru 💌",sdExportCopiedSimple:"Kopirano!",songTitle:"🎵 Naša pesma",songMyLabel:"Moja pesma",songTitlePlaceholder:"Naziv pesme...",songNotePlaceholder:"Zašto baš ova pesma?",songSave:"Sačuvaj",songPartnerLabel:"pesma",songEmpty:"Postavite pesme koje vas podsećaju jedno na drugo",songSaveEmpty:"Unesi naziv pesme 🎵",songSaved:"🎵 Pesma sačuvana!",knowMeTitle:"💭 Da li me poznaješ?",knowMeMyLabel:"odgovor",knowMeAnswerSaved:"💭 Odgovor sačuvan!",hugTitle:"🤗 Virtuelni zagrljaj",gratTitle:"💝 Zid zahvalnosti",gratPlaceholder:"Hvala ti za...",checkinTitle:"🎯 Nedeljni pregled",teaTitle:"🍵 Čajanka — Srbija ♥ Kina",loveCounterTogether:" dana zajedno",sectRelationship:"💝 Veza",offlineText:"Offline — neke funkcije možda ne rade",pwaInstallText:"📲 Instaliraj na telefon — koristi kao aplikaciju",modalHolidayLabel:"Praznik",modalSolarLabel:"Solarni ciklus",modalSpecialLabel:"Poseban dan",fabEndYet:"Kraj mora biti posle početka",fabEndMarked:"Kraj ciklusa označen ✓",fabAlreadyMarked:" - već označeno",sdDOW:["Ne","Po","Ut","Sr","Če","Pe","Su"],sdDOWMon:["Po","Ut","Sr","Če","Pe","Su","Ne"],sdExportPrompt:"Kopiraj i pošalji partneru:",sdSaveFirst:"Prvo sačuvaj svoj unos",sdImportTitle:"📥 Zalepi partnerov tekst",sdImportPlaceholder:"Zalepi JSON tekst ovde...",sdImportCancel:"Odustani",sdImportConfirm:"Uvezi",sdImportDone:"📥 Uvezeno! 💌",sdImportError:"Neispravan format 😢",sdQuestions:[{q:"💝 Obradovalo"},{q:"🤔 Zasmetalo"},{q:"🙏 Zahvalnost"},{q:"💪 Da poradimo"}],sdNoEntry:"Nema unosa",sdPartnerLocked:"Partner još nije napisao svoj osvrt za ovaj dan — ili još nije sinhronizovano.",sdTimelineLocked:"Zaključano",sdTimelineEmpty:"Još nema unosa — započnite danas! 💌",sdTimelineMore:"📅 Prikaži još",sdMyReflection:"Moj osvrt",sdMyHint:"Iskreno o danu — što više detalja, to bolje 💫",sdLabelHappy:"Šta me je danas obradovalo",sdLabelUncomf:"Šta mi je malo zasmetalo",sdLabelThanks:"Želim da ti se zahvalim za...",sdLabelWish:"Voleo/la bih da zajedno poradimo na...",sdSaveView:"Sačuvaj i pogledaj partnerov",sdGateHint:"Sačuvaj svoj unos pre nego što vidiš partnerov",sdPartnerReflection:"Partnerov osvrt",sdSyncHintOn:"☁️ Automatska sinhronizacija",sdSyncHintOff:"📤 Izvezi → pošalji partneru → Partner uveze",sdSyncJustNow:"malopre",sdSyncMinAgo:"min pre",sdSyncHAgo:"h pre",sdExportBtn:"Podeli",sdImportBtn:"Uvezi",sdTimelineTitle:"Vremenska linija",sdPartnerLockedText:"Prvo sačuvaj svoj unos da otključaš partnerov 💌",sdTranslateFail:"prevod nije uspeo",hugStreak:" dana zaredom!",hugReceived:" te zagrlio/la! 💫",hugBackBtn:"💝 Uzvrati zagrljaj",hugDismiss:"✕ zatvori",hugSentWaiting:"Zagrljaj poslat! Čekam odgovor... 💌",hugSendAnother:"Pošalji još jedan",hugSendBtn:"Pošalji zagrljaj",hugLimit:"Već si poslao/la 2 zagrljaja danas — probaj sutra! 🤗",hugSentBarry:"Poslao si joj zagrljaj!",hugSentAndjela:"Poslala si mu zagrljaj!",statsRegLabels:{high:"Visoka",medium:"Srednja",low:"Niska"},statsTrendTitle:"📈 Trend Ciklusa",statsTrendAvg:"Prosek",statsTrendEmpty:"Premalo podataka",statsTrendNeed:"Potrebno bar 2 ciklusa za trend",statsCurrentPhase:"Trenutna faza",statsCycleTitle:"📈 Trend Ciklusa",statsMoodTitle:"🎭 Distribucija Raspoloženja",statsMoodCenter:"unosa",statsMoodEmpty:"Nema podataka",statsMoodNoRecords:"Još nema zapisa o raspoloženju",statsSympTitle:"📋 Učestalost Simptoma",statsSympEmpty:"Nema podataka o simptomima",statsSympNoRecords:"Još nema zapisa o simptomima",statsDaysUntil:"Još",statsDaysUntilEnd:"dana",statsDaysLate:"Kasni",statsDaysLateEnd:"dana",statsConfidence:"Pouzdanost: ",statsNeedCycles:"(potrebno 2+ ciklusa)",statsOvLabel:"Ovulacija",statsFertLabel:"Plodni dani",statsFutureLabel:"Buduće",statsRegLabel:"Regularnost",statsTimelineTitle:"📜 Istorija Ciklusa",statsTimelineShort:"Kratak",statsTimelineNormal:"Normalan",statsTimelineLong:"Dug",statsHintCycles:"(treba bar 2 ciklusa)",holidayToday:"danas! 🎉",holidayDaysAway:"još",holidayOffLabel:"Odmor: ",modalLunar:"Lunarni",modalLunarSrSep:". mesec, ",modalLunarSrDay:". dan",loveCounterMet:" dana od prvog susreta",loveDaysTitle:"💕 Dani zajedno",solarTermBadge:"za",knowMePartnerLabel:" misli da je:",knowMeMatch:"Savršeno se razumete! ✨",knowMeWaiting:"Čeka se odgovor tvog partnera...",barryPhasePeriod:"Njena menstruacija",barryPhaseFollicular:"Njena folikularna",barryPhaseOvulation:"Njena ovulacija",barryPhaseLuteal:"Njena lutealna",barryPhaseGeneral:"Budi tu za nju",barryTipsTitle:"💡 Kako postupati prema njoj danas",phasePeriod:"Menstruacija",phaseFollicular:"Folikularna",phaseOvulation:"Ovulacija",phaseLuteal:"Lutealna",modalFixMark:"🔴 Obeleži početak ciklusa",modalFixEnd:"⏹️ Završi ovaj ciklus",modalFixRemove:"❌ Ukloni zapis"},"zh-CN":{profileName:"Anđela",profileName2:"Barry",loveNoteDefault:"每一天都在想你——你是我世界里最美好的一部分。💕",loveNoteSig:"— 你的 Barry",moodTitle:"😊 今日心情",moodToday:"今天感觉怎么样？",moodHistoryLabel:"最近7天",streakLabel:"天连续记录！",streakLabel0:"开始打卡吧！",streakBadgeHot:"太棒了！🔥",streakBadgeWarm:"不错 ✨",streakBadgeCold:"今天开始 🌱",diaryTitle:"📓 一行日记",diaryPrompt:"今天______让我笑了。",diaryPlaceholder:"写一句话...",gardenTitle:"🌱 我们的花园",gardenSeed:"每天给我浇水——点击上面 emoji 打卡！🌱",gardenSprout:"你的坚持开始发芽了...继续加油！🌿",gardenGrowing:"越来越茁壮了！🌷",gardenBudding:"快要开花了——再坚持一下！🎀",gardenBlooming:"绽放得真美！就像我们的爱。🌸✨",forecastTomorrow:"明天",forecastFollicular:"明天进入卵泡期——精力回升，适合做计划！💪",forecastOvulation:"明天是排卵日——你的身体最有光彩！✨",forecastLuteal:"明天进入黄体期——放慢节奏，你值得好好休息 🌙",forecastPeriod:"明天可能会来月经——准备好暖宝宝和热茶 💗",forecastNormal:"听从你的身体。每一天你都很了不起。🌸",moodEmojis:["😊","🥰","😤","😴","😢","🤩","😰","😐"],moodNames:["开心","被爱","烦躁","疲惫","难过","兴奋","焦虑","还行"],sharedDiaryTab:"日记",profileSwitch:"已切换账号",profileOnly:"仅 Barry 可查看",barryTipsPeriod:[{icon:"🫂",text:"她正在经历疼痛——温柔一点，抱抱她，给她暖水袋和热茶。"},{icon:"🍫",text:"带巧克力或她喜欢的零食给她——小事情在经期最重要。"},{icon:"😤",text:'别跟她争论——她情绪很低。倾听、点头、说"你说得对"。'},{icon:"🛏️",text:"让她休息。如果她想睡一整天——给她毯子，让她安静。"},{icon:"💆",text:"给她按摩背或脚——动作轻柔，她的身体现在很敏感。"}],barryTipsFollicular:[{icon:"🎯",text:"她会精力充沛——计划一起出去！散步、新活动、约会。"},{icon:"💬",text:"比平时更善于社交——适合深入交谈和未来规划。"},{icon:"💪",text:"和她一起运动或健身——一起变得更强。"},{icon:"🌸",text:"买花给她——不需要理由。这个阶段她最容易被小细节打动。"},{icon:"🎨",text:"创造力高峰期——提议一个新爱好或项目一起做。"}],barryTipsOvulation:[{icon:"✨",text:"今天她最闪耀——告诉她她有多美。真诚且具体的夸奖。"},{icon:"💋",text:"身体接触对她很重要——拥抱、亲吻、牵手。"},{icon:"🎉",text:"能量巅峰——适合出去玩、跳舞、朋友聚会。"},{icon:"🔥",text:'她最有"性致"——今晚要体贴又浪漫。'},{icon:"📸",text:"今天给她拍照——每张都会发光。"}],barryTipsLuteal:[{icon:"🧘",text:"PMS 开始了——别把她的情绪当回事。她的大脑在荷尔蒙风暴里。"},{icon:"🍵",text:"给她泡杯无咖啡因的花草茶——洋甘菊或薄荷。"},{icon:"🤐",text:'多听少说。别试图"解决问题"——只需倾听就好。'},{icon:"🍕",text:"她会突然想吃东西——不问就点她最爱的外卖。"},{icon:"🌙",text:"帮她放松——热水澡、蜡烛、轻音乐。她值得安宁。"}],barryTipsGeneral:[{icon:"💌",text:"现在就给她发条消息——说你在想她。不需要理由。"},{icon:"💝",text:"今天一件小事——她喜欢的饮料、水果、小东西。"},{icon:"📞",text:"给她打电话——听听她的声音，问问今天过得怎么样。"},{icon:"🌍",text:"记住——你是她的依靠。她爱你。你足够好。"}],diaryTextareaPlaceholder:"写吧，亲爱的... ✍️",diaryDateStripPrev:"◂ 上一周",diaryDateStripNext:"下一周 ▸",diaryCalPrevMonth:"◂ 上个月",diaryCalNextMonth:"下个月 ▸",diaryGoToday:"📍 今天",diaryCalBtnTitle:"日历",diaryFooterCredit:"为 Anđela Nemet 用爱制作 ♥",diary:{title:"💌 我们的日记",placeholder:"写下今天想对Ta说的话... ✍️",save:"💾 保存",saved:"✅ 已保存",empty:"今天还没有写日记 📭",partnerEmpty:"Ta还没有写，稍后再来看看 💌",allEntries:"📜 全部日记",mailbox:"📮 信箱",export:"📤 导出数据 (JSON)",import:"📥 导入数据 (JSON)",andiLetter:"🌸 Anđela 的信",barryLetter:"👦 Barry 的信"},settingsTokenHintEnabled:"✅ 自动同步已开启 🌐",settingsTokenHintDisabled:"输入 GitHub Token 以同步两台手机",settingsTokenLabel:"GitHub Token",tokenSaved:"Token 已保存 ✓",tokenMissing:"请先输入 Token",tokenValid:"Token 有效",tokenInvalid:"Token 无效",tokenError:"错误: ",tokenNetError:"网络错误",tokenConfirmClear:"清除 GitHub Token？同步将停止。",tokenCleared:"Token 已清除",settingsExportAll:"📦 导出所有数据",settingsImportAll:"📥 从备份恢复",settingsClearDiary:"🗑️ 清空所有日记",settingsClearDiaryConfirm:"删除所有共享日记？此操作不可撤销。",settingsThemeLight:"☀️ 浅色",settingsThemeDark:"🌙 深色",sleepTitle:"睡眠",sleepHint:"昨晚几点睡的？Angie 会看到你的睡眠时间",sleepSave:"保存",sleepEmpty:"Barry 还没记录——提醒他！",sleepLabel:"昨晚他",sleepSaved:"已保存！",sleepLateTitle:"他 {time} 才睡！太晚了！",sleepLateMsg:"Barry，为了我早点睡！\u{1F495}",specialBadgeTexts:["独一无二的你 ✨","最美的人 🌸","Barry 的爱 💝","世界上唯一的你 💫"],calendarPredLegend:"※ 淡色为预测 · Barry陪着你走过每一个周期 ❤️",fabEndPeriod:"经期结束",fabStartPeriod:"经期来了",fabEndYet:"结束日必须在开始日之后",fabEndMarked:"经期结束已标记 ✓",fabAlreadyMarked:" - 已标记过",authPinBtn:"🔓 登录",authTapHint:"点击登录",authSwitchHint:"输入你的 PIN",gardenState0:"点上面的心情给我浇水！💧",gardenState1:"第一天！每天浇我哦 🌱",gardenState3:"在长大！快要开花了 🌿",gardenState7:"花苞！你的爱在滋养我 🌷",gardenStateBloom:"开花了！就像你们的爱 🌸",sdExportCopied:"已复制！发给伴侣吧 💌",sdExportCopiedSimple:"已复制！",songTitle:"🎵 我们的歌",songMyLabel:"我的歌",songTitlePlaceholder:"歌名...",songNotePlaceholder:"为什么是这首歌？",songSave:"保存",songPartnerLabel:"的歌",songEmpty:"设置让你们想到彼此的歌",songSaveEmpty:"请输入歌名 🎵",songSaved:"🎵 歌曲已保存！",knowMeTitle:"💭 你了解我吗？",knowMeMyLabel:"的回答",knowMeAnswerSaved:"💭 答案已保存！",hugTitle:"🤗 隔空拥抱",gratTitle:"💝 感恩便签",gratPlaceholder:"谢谢你...",checkinTitle:"🎯 每周感情体检",teaTitle:"🍵 茶室 — 塞尔维亚 ♥ 中国",loveCounterTogether:" 天在一起",sectRelationship:"💝 关系",offlineText:"当前离线，部分功能不可用",pwaInstallText:"📲 安装到手机 — 像App一样使用",modalHolidayLabel:"节日",modalSolarLabel:"节气",modalSpecialLabel:"特殊日子",sdDOW:["日","一","二","三","四","五","六"],sdDOWMon:["一","二","三","四","五","六","日"],sdExportPrompt:"复制发给伴侣：",sdSaveFirst:"请先保存你的日记",sdImportTitle:"📥 粘贴伴侣分享的内容",sdImportPlaceholder:"粘贴 JSON 文本...",sdImportCancel:"取消",sdImportConfirm:"导入",sdImportDone:"已导入！💌",sdImportError:"格式不对哦 😢",sdQuestions:[{q:"💝 开心的事"},{q:"🤔 不舒服的事"},{q:"🙏 感谢"},{q:"💪 希望改进"}],sdNoEntry:"没有记录",sdPartnerLocked:"伴侣还没写这一天的总结——或者还没同步过来。",sdTimelineLocked:"已锁定",sdTimelineEmpty:"还没有日记——今天就开始吧！💌",sdTimelineMore:"📅 展开剩余",sdMyReflection:"我的总结",sdMyHint:"坦诚地回顾一天——越详细越好 💫",sdLabelHappy:"今天让我开心的事",sdLabelUncomf:"让我有点不舒服的事",sdLabelThanks:"我想感谢你的...",sdLabelWish:"我希望我们能一起改进的...",sdSaveView:"保存并查看伴侣的",sdGateHint:"写完才能看伴侣的哦",sdPartnerReflection:"伴侣的总结",sdSyncHintOn:"☁️ 自动同步中",sdSyncHintOff:"📤 导出 → 发给伴侣 → 导入",sdSyncJustNow:"刚刚",sdSyncMinAgo:"分钟前",sdSyncHAgo:"小时前",sdExportBtn:"分享",sdImportBtn:"导入",sdTimelineTitle:"时间线",sdPartnerLockedText:"先保存你的日记才能解锁伴侣的哦 💌",sdTranslateFail:"翻译失败",hugStreak:"天连续！",hugReceived:"抱了你！💫",hugBackBtn:"回抱一个",hugDismiss:"✕ 关闭",hugSentWaiting:"拥抱已发送！等待回应... 💌",hugSendAnother:"再抱一次",hugSendBtn:"发送拥抱",hugLimit:"今天已经抱了2次——明天再来！🤗",hugSentBarry:"拥抱已发送！",hugSentAndjela:"拥抱已发送！",statsRegLabels:{high:"高",medium:"中",low:"低"},statsTrendTitle:"📈 周期趋势",statsTrendAvg:"均值",statsTrendEmpty:"数据不足",statsTrendNeed:"标记2次经期后显示趋势图",statsCurrentPhase:"当前阶段",statsCycleTitle:"📈 周期趋势",statsMoodTitle:"🎭 心情分布",statsMoodCenter:"次记录",statsMoodEmpty:"暂无心情数据",statsMoodNoRecords:"还没有心情记录",statsSympTitle:"📋 症状频率",statsSympEmpty:"暂无症状数据",statsSympNoRecords:"还没有症状记录",statsDaysUntil:"距下次",statsDaysUntilEnd:"天",statsDaysLate:"已推迟",statsDaysLateEnd:"天",statsConfidence:"置信度：",statsNeedCycles:"(需2个周期以上)",statsOvLabel:"排卵日",statsFertLabel:"易孕窗口",statsFutureLabel:"未来预测",statsRegLabel:"规律性",statsTimelineTitle:"📜 周期历史",statsTimelineShort:"偏短",statsTimelineNormal:"正常",statsTimelineLong:"偏长",statsHintCycles:"(需2个周期以上)",holidayToday:"就是今天！🎉",holidayDaysAway:"还有",holidayOffLabel:"放假",modalLunar:"农历",modalLunarSrSep:"月",modalLunarSrDay:"日",loveCounterMet:" 天前初次相遇",loveDaysTitle:"💕 我们的日子",solarTermBadge:"",knowMePartnerLabel:"认为:",knowMeMatch:"你们太有默契了！✨",knowMeWaiting:"等待对方回答...",barryPhasePeriod:"她的经期",barryPhaseFollicular:"她的卵泡期",barryPhaseOvulation:"她的排卵期",barryPhaseLuteal:"她的黄体期",barryPhaseGeneral:"好好待她",barryTipsTitle:"💡 今天如何对待她",phasePeriod:"经期",phaseFollicular:"卵泡期",phaseOvulation:"排卵期",phaseLuteal:"黄体期",modalFixMark:"🔴 标记经期开始",modalFixEnd:"⏹️ 结束本次经期",modalFixRemove:"❌ 移除记录"},en:{profileName:"Anđela",profileName2:"Barry",loveNoteDefault:"Every day I think of you — you are the most beautiful part of my world. 💕",loveNoteSig:"— Your Barry",moodTitle:"😊 Daily Mood",moodToday:"How are you feeling today?",moodHistoryLabel:"Last 7 days",streakLabel:"day streak!",streakLabel0:"Start a streak!",streakBadgeHot:"Amazing! 🔥",streakBadgeWarm:"Nice ✨",streakBadgeCold:"Start today 🌱",diaryTitle:"📓 One-Line Diary",diaryPrompt:"Today ______ made me smile.",diaryPlaceholder:"write one sentence...",gardenTitle:"🌱 Our Garden",gardenSeed:"Water me daily — tap an emoji above! 🌱",gardenSprout:"Your streak is sprouting... keep going! 🌿",gardenGrowing:"Getting stronger! 🌷",gardenBudding:"Almost blooming — just a bit more! 🎀",gardenBlooming:"Blooming beautifully! Just like our love. 🌸✨",forecastTomorrow:"Tomorrow",forecastFollicular:"Tomorrow you enter the follicular phase — energy rising, great day for plans! 💪",forecastOvulation:"Tomorrow is ovulation — your body shines brightest! ✨",forecastLuteal:"Tomorrow begins the luteal phase — slow down, you deserve rest 🌙",forecastPeriod:"Tomorrow your period may start — get your heating pad and tea ready 💗",forecastNormal:"Listen to your body. You are amazing every day. 🌸",moodEmojis:["😊","🥰","😤","😴","😢","🤩","😰","😐"],moodNames:["Happy","Loved","Frustrated","Tired","Sad","Excited","Anxious","Meh"],sharedDiaryTab:"Diary",profileSwitch:"Profile switched",profileOnly:"Only Barry can view this",barryTipsPeriod:[{icon:"🫂",text:"She is in pain — be gentle, hold her, bring her a heating pad and tea."},{icon:"🍫",text:"Bring her chocolate or her favorite treat. Little things matter most right now."},{icon:"😤",text:"Don't argue — her mood is at its lowest. Listen, nod, say \"you're right.\""},{icon:"🛏️",text:"Let her rest. If she wants to sleep all day — bring her a blanket and peace."},{icon:"💆",text:"Offer a back or foot massage — be gentle, her body is sensitive now."}],barryTipsFollicular:[{icon:"🎯",text:"She has rising energy — plan a date, a walk, a shared activity!"},{icon:"💬",text:"She's more social — great time for deep talks and future plans."},{icon:"💪",text:"Join her for a workout. Stronger together."},{icon:"🌸",text:"Buy her flowers for no reason. She'll notice the smallest gesture now."},{icon:"🎨",text:"Creative phase — suggest a new hobby or project to do together."}],barryTipsOvulation:[{icon:"✨",text:"She shines brightest today — tell her how beautiful she is. Be specific."},{icon:"💋",text:"Physical touch matters to her — hug, kiss, hold hands."},{icon:"🎉",text:"Peak energy — great day for dancing, going out, social fun."},{icon:"🔥",text:"Her libido peaks — be attentive and romantic tonight."},{icon:"📸",text:"Take photos of her today — she will glow in every shot."}],barryTipsLuteal:[{icon:"🧘",text:"PMS begins — don't take anything personally. Her brain is in a hormone storm."},{icon:"🍵",text:"Make her caffeine-free tea — chamomile or mint. It calms and shows you care."},{icon:"🤐",text:'Listen more, talk less. Don\'t try to "fix" — just listen.'},{icon:"🍕",text:"She'll have cravings — order her favorite food without asking."},{icon:"🌙",text:"Help her unwind — warm bath, candles, soft music. She deserves peace."}],barryTipsGeneral:[{icon:"💌",text:"Text her right now — say you're thinking of her. No reason needed."},{icon:"💝",text:"A small gesture today — her favorite drink, fruit, something thoughtful."},{icon:"📞",text:"Call her — hear her voice, ask how her day went."},{icon:"🌍",text:"Remember — you are her rock. She loves you. You are enough."}],diaryTextareaPlaceholder:"Write what’s in your heart today ❤️",diaryDateStripPrev:"◂ Previous week",diaryDateStripNext:"Next week ▸",diaryCalPrevMonth:"◂ Previous month",diaryCalNextMonth:"Next month ▸",diaryCalBtnTitle:"Calendar",diaryGoToday:"📍 Today",diaryFooterCredit:"Made with love for Anđela Nemet ♥",diary:{title:"💌 Our Diary",placeholder:"Write something for your love... ✍️",save:"💾 Save",saved:"✅ Saved",empty:"No entry for today yet 📭",partnerEmpty:"Your partner hasnt written yet 💌",allEntries:"📜 All Entries",mailbox:"📮 Mailbox",export:"📤 Export Data (JSON)",import:"📥 Import Data (JSON)",andiLetter:"🌸 Anđelas Letter",barryLetter:"👦 Barrys Letter"},settingsTokenHintEnabled:"✅ Auto-sync enabled 🌐",settingsTokenHintDisabled:"Enter GitHub Token to sync both phones",settingsTokenLabel:"GitHub Token",tokenSaved:"Token saved ✓",tokenMissing:"Enter a token first",tokenValid:"Token valid",tokenInvalid:"Token invalid",tokenError:"Error: ",tokenNetError:"Network error",tokenConfirmClear:"Clear GitHub token? Sync will stop.",tokenCleared:"Token cleared",settingsExportAll:"📦 Export All Data",settingsImportAll:"📥 Restore from Backup",settingsClearDiary:"🗑️ Clear All Diaries",settingsClearDiaryConfirm:"Delete ALL shared diaries? This cannot be undone.",settingsThemeLight:"☀️ Light",settingsThemeDark:"🌙 Dark",sleepTitle:"Sleep",sleepHint:"What time did you sleep last night? Angie sees your sleep time",sleepSave:"Save",sleepEmpty:"Barry hasn't logged sleep yet — remind him!",sleepLabel:"Last night he slept at",sleepSaved:"Saved!",sleepLateTitle:"He slept at {time}! TOO LATE!",sleepLateMsg:"Barry, please go to bed earlier! \u{1F495}",specialBadgeTexts:["You are unique ✨","Most beautiful 🌸","Barry's love 💝","One and only 💫"],calendarPredLegend:"※ Faded dates are predictions · Barry walks with you through every cycle ❤️",fabEndPeriod:"Period ended",fabStartPeriod:"Period started",fabEndYet:"End must be after start",fabEndMarked:"Period end marked ✓",fabAlreadyMarked:" - already marked",authPinBtn:"🔓 Sign in",authTapHint:"Tap to sign in",authSwitchHint:"Enter your PIN",gardenState0:"Tap an emoji above to water me! 💧",gardenState1:"First day! Keep watering me daily 🌱",gardenState3:"Growing! Almost blooming 🌿",gardenState7:"Budding! Your love feeds me 🌷",gardenStateBloom:"Bloomed! Just like your love 🌸",sdExportCopied:"Copied! Send to partner 💌",sdExportCopiedSimple:"Copied!",songTitle:"🎵 Our Song",songMyLabel:"My song",songTitlePlaceholder:"Song title...",songNotePlaceholder:"Why this song?",songSave:"Save",songPartnerLabel:"song",songEmpty:"Set songs that remind you of each other",songSaveEmpty:"Enter a song title 🎵",songSaved:"🎵 Song saved!",knowMeTitle:"💭 Do You Know Me?",knowMeMyLabel:" answer",knowMeAnswerSaved:"💭 Answer saved!",hugTitle:"🤗 Virtual Hug",gratTitle:"💝 Gratitude Wall",gratPlaceholder:"Thank you for...",checkinTitle:"🎯 Weekly Check-in",teaTitle:"🍵 Tea Room — Serbia ♥ China",loveCounterTogether:" days together",sectRelationship:"💝 Relationship",offlineText:"Offline — some features unavailable",pwaInstallText:"📲 Install on phone — use like an app",modalHolidayLabel:"Holiday",modalSolarLabel:"Solar Term",modalSpecialLabel:"Special Day",sdDOW:["Su","Mo","Tu","We","Th","Fr","Sa"],sdDOWMon:["Mo","Tu","We","Th","Fr","Sa","Su"],sdExportPrompt:"Copy and send to partner:",sdSaveFirst:"Save your entry first",sdImportTitle:"📥 Paste partner's text",sdImportPlaceholder:"Paste JSON text here...",sdImportCancel:"Cancel",sdImportConfirm:"Import",sdImportDone:"📥 Imported! 💌",sdImportError:"Invalid format 😢",sdQuestions:[{q:"💝 Happy"},{q:"🤔 Uncomfortable"},{q:"🙏 Thanks"},{q:"💪 To improve"}],sdNoEntry:"No entry",sdPartnerLocked:"Your partner hasn't written their reflection for this day yet — or it hasn't synced.",sdTimelineLocked:"🔒 Locked",sdTimelineEmpty:"No entries yet — start today! 💌",sdTimelineMore:"📅 Show",sdMyReflection:"My Reflection",sdMyHint:"Be honest about your day — the more detail the better 💫",sdLabelHappy:"What made me happy today",sdLabelUncomf:"What felt a little uncomfortable",sdLabelThanks:"I want to thank you for...",sdLabelWish:"I hope we can work on...",sdSaveView:"Save & View Partner's",sdGateHint:"Save your entry to unlock your partner's",sdPartnerReflection:"Partner's Reflection",sdSyncHintOn:"☁️ Auto-sync on",sdSyncHintOff:"📤 Export → send → Partner imports",sdSyncJustNow:"just now",sdSyncMinAgo:"min ago",sdSyncHAgo:"h ago",sdExportBtn:"Share",sdImportBtn:"Import",sdTimelineTitle:"Timeline",sdPartnerLockedText:"Save your entry first to unlock your partner's 💌",sdTranslateFail:"translation failed",hugStreak:"-day streak!",hugReceived:" hugged you! 💫",hugBackBtn:"💝 Hug back",hugDismiss:"✕ dismiss",hugSentWaiting:"Hug sent! Waiting for response... 💌",hugSendAnother:"Send another",hugSendBtn:"Send a Hug",hugLimit:"You already sent 2 hugs today — try tomorrow! 🤗",hugSentBarry:"Hug sent!",hugSentAndjela:"Hug sent!",statsRegLabels:{high:"High",medium:"Medium",low:"Low"},statsTrendTitle:"📈 Cycle Trend",statsTrendAvg:"Avg",statsTrendEmpty:"Not enough data",statsTrendNeed:"Need 2+ cycles for trend",statsCurrentPhase:"Current Phase",statsCycleTitle:"📈 Cycle Trend",statsMoodTitle:"🎭 Mood Distribution",statsMoodCenter:"entries",statsMoodEmpty:"No mood data",statsMoodNoRecords:"No mood records yet",statsSympTitle:"📋 Symptom Frequency",statsSympEmpty:"No symptom data",statsSympNoRecords:"No symptom records yet",statsDaysUntil:"",statsDaysUntilEnd:"days until",statsDaysLate:"",statsDaysLateEnd:"days late",statsConfidence:"Confidence: ",statsNeedCycles:"(needs 2+ cycles)",statsOvLabel:"Ovulation",statsFertLabel:"Fertile Window",statsFutureLabel:"Future",statsRegLabel:"Regularity",statsTimelineTitle:"📜 Cycle History",statsTimelineShort:"Short",statsTimelineNormal:"Normal",statsTimelineLong:"Long",statsHintCycles:"(needs 2+ cycles)",holidayToday:"today! 🎉",holidayDaysAway:"",holidayOffLabel:"Days off: ",modalLunar:"Lunar",modalLunarSrSep:"/",modalLunarSrDay:"",loveCounterMet:" days since we met",loveDaysTitle:"💕 Our Days",solarTermBadge:"in",knowMePartnerLabel:" thinks it is:",knowMeMatch:"You two are perfectly in sync! ✨",knowMeWaiting:"Waiting for your partner to answer...",barryPhasePeriod:"Her Period",barryPhaseFollicular:"Her Follicular",barryPhaseOvulation:"Her Ovulation",barryPhaseLuteal:"Her Luteal",barryPhaseGeneral:"Be There For Her",barryTipsTitle:"💡 How to treat her today",phasePeriod:"Period",phaseFollicular:"Follicular",phaseOvulation:"Ovulation",phaseLuteal:"Luteal",modalFixMark:"🔴 Mark Period Start",modalFixEnd:"⏹️ End this period",modalFixRemove:"❌ Remove record"}};function t(e,a){const o=e.split(".");let t=I18N_EXT[lang]||I18N_EXT.sr,i=!1;for(const e of o){if(!t||void 0===t[e]){i=!1;break}t=t[e],i=!0}if(i)return t;t=I18N[lang]||I18N.sr;for(const i of o){if(!t||void 0===t[i])return a||e;t=t[i]}return t}window.lang=localStorage.getItem("cycle-lang")||"sr";const LOVE_NOTES=function(){const e=["Svakog jutra kad otvorim oči, prva misao mi si ti. 🌅","Tvoj osmeh je moja omiljena boja. 🎨","Da si ovde, skuvao bih ti čaj i slušao kako ti je prošao dan. 🍵","Znaš onaj osećaj kad sunce izađe posle kiše? Ti si to za mene. 🌈","Nadam se da si danas nosila onaj osmeh koji toliko volim. 😊","Koliko god da si daleko, uvek si mi u srcu. 💝","Vojvodina je dobila najlepši cvet kad si se ti rodila. 🌻","Ti si ona vrsta lepote koja ne bledi — postaje samo dublja. ✨","Kad bih mogao da ti pošaljem zagrljaj kroz ekran, već bi stigao. 🤗","Ti si moja omiljena pesma, ona koja nikad ne dosadi. 🎵","Prošlo je X dana otkad smo zajedno, a ja te volim sve više. ♥","Razmišljam o tebi dok ovo pišem — i smešim se. 😌","Da mogu da biram gde ću biti sad, bio bih pored tebe. 🌍→🏡","Tvoja snaga me inspiriše svaki dan. Ti si neverovatna. 💪🌸","Sećaš se našeg prvog razgovora? Ja ga često prepričavam u glavi. 💭","Volim način na koji se smeješ — kao da cela soba postane svetlija. ✨","U svakom zalasku sunca vidim tvoje oči. 🌆","Danas sam video nešto lepo i poželeo da si tu da podelim s tobom. 🌸","Ako ikada posumnjaš u sebe, seti se da te Barry voli — a Barry zna. 😉","Ti nisi samo moja devojka — ti si moj najbolji prijatelj. 💑","Svaka priča ima svoju heroinu. U mojoj, to si ti. 📖","Da napišem knjigu o tebi, nestalo bi mi stranica. 📚","Ti si moj mir u haosu, moja tišina u buci. 🧘","Ne mogu da zamislim svet bez tvog osmeha. Ne želim ni da pokušam. 🌍♥","Kad te čujem preko telefona, ceo dan mi bude bolji. 📞","Ponekad samo zatvorim oči i zamislim da si pored mene. 💫","Ti me činiš boljom osobom — hvala ti za to. 💗","Kao što Mesec prati Zemlju, tako moje misli prate tebe. 🌙","Da si cvet, bila bi ruža — lepa, jaka, i sa trnjem kad treba. 🌹","Najbolji deo mog dana? Kad pomislim na tebe. A to je mnogo puta. 💌","Tvoja hrabrost me oduševljava. Ti se boriš kao lavica. 🦁","Volim i tvoje dobre i tvoje loše dane. Sve je to deo tebe. 🫂","Peking je veliki grad, ali bez tebe je prazan. 🏙️","Da mogu da ti dam jednu stvar, dao bih ti večnost nežnosti. ♾️","Ti si moj dokaz da ljubav ne poznaje granice. 🌍♥","Od Vojvodine do Pekinga — ljubav je najduža reka, i sve povezuje. 🌊","Kad bih umeo da slikam, slikao bih samo tebe. 🎨","Ti si mi u mislima kao što je beat u muzici — stalno. 🥁","Sanjam dan kad nećemo morati da brojimo kilometre. 🗺️","Volim te na srpskom, kineskom, i svim jezicima koji postoje. 🌐♥","Ako ikada zaboraviš koliko vrediš, pozovi me — podsetiću te. 📱","Ti si moja srećna zvezda. ⭐","Kad si srećna, i ja sam srećan. Tako je jednostavno. 😊","Tvoja lepota nije samo spolja — ona izvire iz tvoje duše. 🕯️","Volim te više nego što reči mogu da izraze. Zato ti šaljem srca. 💕💕💕","Svakog dana zahvaljujem univerzumu što si u mom životu. 🙏","Da se ponovo rodim, opet bih te tražio. 🔄♥","Tvoje ime Anđela — kao anđeo. I stvarno si to. 👼","Ti ulepšavaš svet samim tim što postojiš. 🌍→🌸","Nikad ne zaboravi: voljen si, i to beskrajno. ♾️💗"],a=["每天睁开眼，第一个想到的就是你。🌅","你的笑容是我最喜欢的颜色。🎨","如果你在身边，我会给你泡杯茶，听你讲今天的故事。🍵","你知道雨后阳光的感觉吗？你就是我的那种感觉。🌈","希望你今天带着我最爱的笑容。😊","不管多远，你一直在我心里。💝","Vojvodina 最美的花开在你出生的那天。🌻","你的美不会褪色——只会越来越深。✨","如果能穿过屏幕给你一个拥抱，它已经到了。🤗","你是我最爱的歌，永远听不腻的那一首。🎵","在一起 X 天了，每一天都更爱你。♥","写着写着就笑了——因为我在想你。😌","如果能选择此刻在哪里，我会选你身边。🌍→🏡","你的坚强每天都激励着我。你是了不起的。💪🌸","还记得我们第一次聊天吗？我经常在脑海里回放。💭","我喜欢你笑的样子——整个房间都亮了。✨","每一个日落里，我都看到你的眼睛。🌆","今天看到了美好的东西，真想你在身边分享。🌸","如果你怀疑自己，记住 Barry 爱你——Barry 是对的。😉","你不仅是我的女朋友——你是我最好的朋友。💑","每个故事都有女主角。在我的故事里，是你。📖","如果写一本关于你的书，纸都不够用。📚","你是我混乱中的平静，喧嚣中的安宁。🧘","无法想象没有你笑容的世界。也不想尝试。🌍♥","每次电话里听到你的声音，一整天都变好了。📞","有时候闭上眼，假装你就在身边。💫","你让我成为更好的人——谢谢你。💗","就像月亮绕着地球转，我的思绪绕着你。🌙","如果你是花，你一定是玫瑰——美丽、坚强，必要时有刺。🌹","一天中最棒的时刻？想你的那一刻。每天好多次。💌","你的勇敢让我惊叹。你像母狮一样战斗。🦁","我爱你的好日子，也爱你的坏日子。都是你的一部分。🫂","北京很大，但没有你是空的。🏙️","如果能给你一样东西，我会给你永恒的温柔。♾️","你是我跨过山海的证据。🌍♥","从 Vojvodina 到北京——爱是最长的河，连接一切。🌊","如果我会画画，只画你。🎨","你在我脑海里就像心跳——永不停止。🥁","梦想着不再数公里数的那一天。🗺️","用中文、塞语和所有语言说爱你。🌐♥","如果你忘了自己有多珍贵，打给我——我提醒你。📱","你是我的幸运星。⭐","你开心我就开心。就这么简单。😊","你的美不止在外表——从灵魂深处发光。🕯️","爱你超过言语能表达。所以给你发心心。💕💕💕","每一天都感谢宇宙让你出现在我的生命中。🙏","如果有来生，我还会去找你。🔄♥","你的名字 Anđela——意为天使。你真的是。👼","你存在本身就让世界更美好。🌍→🌸","永远不要忘记：你是被爱着的，无限地。♾️💗"],o=["Every morning when I open my eyes, my first thought is you. 🌅","Your smile is my favorite color. 🎨","If you were here, I would make you tea and listen to your day. 🍵","You know that feeling when the sun comes out after rain? You are that for me. 🌈","I hope you wore that smile I love so much today. 😊","No matter how far, you are always in my heart. 💝","Vojvodina got its most beautiful flower the day you were born. 🌻","You are the kind of beauty that never fades — it only deepens. ✨","If I could send you a hug through the screen, it would already be there. 🤗","You are my favorite song, the one that never gets old. 🎵","It has been X days together, and I love you more each one. ♥","I am writing this thinking of you — and smiling. 😌","If I could choose where to be right now, I would be next to you. 🌍→🏡","Your strength inspires me every day. You are amazing. 💪🌸","Remember our first conversation? I replay it in my head often. 💭","I love the way you laugh — like the whole room gets brighter. ✨","In every sunset, I see your eyes. 🌆","I saw something beautiful today and wished you were here to share it. 🌸","If you ever doubt yourself, remember Barry loves you — and Barry knows. 😉","You are not just my girlfriend — you are my best friend. 💑","Every story has a heroine. In mine, it is you. 📖","If I wrote a book about you, I would run out of pages. 📚","You are my calm in the chaos, my silence in the noise. 🧘","I cannot imagine a world without your smile. I do not want to try. 🌍♥","When I hear your voice on the phone, my whole day improves. 📞","Sometimes I close my eyes and pretend you are beside me. 💫","You make me a better person — thank you for that. 💗","As the moon follows the Earth, so my thoughts follow you. 🌙","If you were a flower, you would be a rose — beautiful, strong, with thorns when needed. 🌹","The best moment of my day? When I think of you. Which is a lot. 💌","Your courage astounds me. You fight like a lioness. 🦁","I love your good days and your bad days. All of it is you. 🫂","Beijing is a big city, but without you it is empty. 🏙️","If I could give you one thing, I would give you eternal tenderness. ♾️","You are my proof that love knows no borders. 🌍♥","From Vojvodina to Beijing — love is the longest river, connecting everything. 🌊","If I could paint, I would only paint you. 🎨","You are in my thoughts like a heartbeat — constant. 🥁","I dream of the day we stop counting kilometers. 🗺️","I love you in Serbian, Chinese, and every language that exists. 🌐♥","If you ever forget how precious you are, call me — I will remind you. 📱","You are my lucky star. ⭐","When you are happy, I am happy. It is that simple. 😊","Your beauty is not just outside — it glows from your soul. 🕯️","I love you more than words can say. So I send hearts. 💕💕💕","Every day I thank the universe for putting you in my life. 🙏","If I were born again, I would look for you. 🔄♥","Your name Anđela — like an angel. And you truly are one. 👼","You make the world more beautiful just by existing. 🌍→🌸","Never forget: you are loved, infinitely. ♾️💗"];return{get:function(){const t="zh-CN"===lang?a:"en"===lang?o:e;return t[Math.floor(Date.now()/864e5)%t.length]}}}();
/* === dist/js/chart-renderer.js === */
"use strict";const ChartRenderer={_theme:function(){const t="dark"===document.documentElement.getAttribute("data-theme");return{bg:t?"#1e1518":"#faf3ef",text:t?"#c4a8a8":"#3d2828",textMuted:t?"#7a6a68":"#8a7a78",grid:t?"rgba(255,255,255,0.06)":"rgba(80,40,40,0.08)",line:t?"#d47888":"#c45a6b",fill:t?"rgba(212,120,136,0.15)":"rgba(196,90,107,0.12)",dot:t?"#d47888":"#c45a6b",fillEnd:t?"rgba(212,120,136,0.01)":"rgba(196,90,107,0.01)",sage:t?"#8fc7b0":"#80a590",teal:t?"#7ab8a5":"#5e8b7a",lavender:t?"#c8b8d8":"#b8a0c8",gold:t?"#d4aa6e":"#c49a5e",donutColors:[t?"#d47888":"#c45a6b",t?"#e090a0":"#d4bfb5",t?"#8fc7b0":"#80a590",t?"#c8b8d8":"#b8a0c8",t?"#7ab8a5":"#5e8b7a",t?"#d4aa6e":"#c49a5e",t?"#e8a0b0":"#e8c8c0",t?"#a0c8b8":"#a0c0b0"]}},_setupCanvas:function(t,e,l){const n=window.devicePixelRatio||1,o=t.getBoundingClientRect().width||e;t.width=o*n,t.height=l*n,t.style.width=o+"px",t.style.height=l+"px";const i=t.getContext("2d");return i.scale(n,n),{ctx:i,w:o,h:l}},drawLineChart:function(t,e,l,n){n=n||{};const o=this._theme(),i=this._setupCanvas(t,n.width||500,n.height||200),a=i.ctx,r=i.w,d=i.h,c=16,h=32,f=r-h-16,g=d-c-28;if(a.clearRect(0,0,r,d),!e||0===e.length)return a.fillStyle=o.textMuted,a.font="italic .68rem "+getComputedStyle(document.body).fontFamily,a.textAlign="center",void a.fillText(n.emptyText||"No data yet",r/2,d/2);const u=e.slice();n.avgLine&&u.push(n.avgLine);let m=Math.floor(Math.min.apply(Math,u)-2),s=Math.ceil(Math.max.apply(Math,u)+2);if(s-m<4){const t=(m+s)/2;m=t-2,s=t+2}const y=e.length>1?f/(e.length-1):f/2,x=function(t){return c+g-(t-m)/(s-m)*g};a.strokeStyle=o.grid,a.lineWidth=.5,a.setLineDash([3,4]);for(let t=0;t<=4;t++){const e=c+g/4*t;a.beginPath(),a.moveTo(h,e),a.lineTo(r-16,e),a.stroke(),a.fillStyle=o.textMuted,a.font=".55rem "+getComputedStyle(document.body).fontFamily,a.textAlign="right",a.fillText(Math.round(s-(s-m)/4*t),26,e+3)}if(a.setLineDash([]),l&&l.length>0){a.fillStyle=o.textMuted,a.font=".52rem "+getComputedStyle(document.body).fontFamily,a.textAlign="center";const t=Math.max(1,Math.floor(l.length/5));for(let e=0;e<l.length;e+=t){const t=h+e*y;t<=r-16&&a.fillText(l[e],t,d-4)}}if(n.avgLine){const t=x(n.avgLine);a.strokeStyle=o.textMuted,a.lineWidth=1,a.setLineDash([4,6]),a.beginPath(),a.moveTo(h,t),a.lineTo(r-16,t),a.stroke(),a.setLineDash([]),a.fillStyle=o.textMuted,a.font=".52rem "+getComputedStyle(document.body).fontFamily,a.textAlign="left",a.fillText(n.avgLabel||"Avg",r-16-24,t-4)}const b=a.createLinearGradient(0,c,0,c+g);b.addColorStop(0,o.fill),b.addColorStop(1,o.fillEnd),a.fillStyle=b,a.beginPath(),a.moveTo(h,c+g);for(let t=0;t<e.length;t++)a.lineTo(h+t*y,x(e[t]));a.lineTo(h+(e.length-1)*y,c+g),a.closePath(),a.fill(),a.strokeStyle=o.line,a.lineWidth=2.5,a.lineJoin="round",a.beginPath(),a.moveTo(h,x(e[0]));for(let t=1;t<e.length;t++)a.lineTo(h+t*y,x(e[t]));a.stroke();for(let t=0;t<e.length;t++){const l=h+t*y,n=x(e[t]);a.beginPath(),a.arc(l,n,4,0,2*Math.PI),a.fillStyle=o.dot,a.fill(),a.strokeStyle=o.bg,a.lineWidth=2,a.stroke(),a.fillStyle=o.text,a.font="bold .55rem "+getComputedStyle(document.body).fontFamily,a.textAlign="center",a.fillText(e[t],l,n-10)}},drawDonutChart:function(t,e,l){l=l||{};const n=this._theme(),o=this._setupCanvas(t,l.width||260,l.height||200),i=o.ctx,a=o.w,r=o.h,d=a/2,c=r/2,h=Math.min(d,c)-8,f=.58*h;let g=0;for(let t=0;t<e.length;t++)g+=e[t].value;if(i.clearRect(0,0,a,r),0===g)return i.fillStyle=n.textMuted,i.font="italic .68rem "+getComputedStyle(document.body).fontFamily,i.textAlign="center",i.fillText(l.emptyText||"No data yet",d,c),[];const u=n.donutColors;let m=-Math.PI/2;for(let t=0;t<e.length;t++){const l=e[t].value/g*Math.PI*2;i.beginPath(),i.arc(d,c,h,m,m+l),i.arc(d,c,f,m+l,m,!0),i.closePath(),i.fillStyle=e[t].color||u[t%u.length],i.fill();const o=m+l/2,a=h+14,r=d+Math.cos(o)*a,s=c+Math.sin(o)*a;l>.35&&e[t].value>0&&(i.fillStyle=n.text,i.font="bold .52rem "+getComputedStyle(document.body).fontFamily,i.textAlign="center",i.textBaseline="middle",i.fillText(e[t].value,r,s)),m+=l}i.fillStyle=n.text,i.font="bold .9rem "+getComputedStyle(document.body).fontFamily,i.textAlign="center",i.textBaseline="middle",i.fillText(g,d,c-6),i.fillStyle=n.textMuted,i.font=".55rem "+getComputedStyle(document.body).fontFamily,i.fillText(l.centerLabel||"total",d,c+12);const s=[];for(let t=0;t<e.length;t++)s.push({label:e[t].label,color:e[t].color||u[t%u.length],value:e[t].value,pct:g>0?Math.round(e[t].value/g*100):0});return s},drawBarChart:function(t,e,l){l=l||{};const n=this._theme(),o=this._setupCanvas(t,l.width||460,l.height||200),i=o.ctx,a=o.w,r=o.h;let d=1;for(let t=0;t<e.length;t++)e[t].value>d&&(d=e[t].value);const c=Math.min(22,(r-20)/e.length),h=Math.min(70,.22*a),f=a-h-12;if(i.clearRect(0,0,a,r),0===e.length||0===d)return i.fillStyle=n.textMuted,i.font="italic .68rem "+getComputedStyle(document.body).fontFamily,i.textAlign="center",void i.fillText(l.emptyText||"No data yet",a/2,r/2);for(let t=0;t<e.length;t++){const l=10+t*(c+4),o=Math.max(4,e[t].value/d*f);i.fillStyle=n.text,i.font=".6rem "+getComputedStyle(document.body).fontFamily,i.textAlign="right",i.fillText(e[t].label,h-6,l+c/2+3),i.fillStyle=n.grid,ChartRenderer._roundRect(i,h+4,l,f,c,4),i.fill(),i.fillStyle=e[t].color||n.line,ChartRenderer._roundRect(i,h+4,l,o,c,4),i.fill(),i.fillStyle=n.text,i.font="bold .58rem "+getComputedStyle(document.body).fontFamily,i.textAlign="left",i.fillText(e[t].value,h+o+10,l+c/2+3)}},drawSparkline:function(t,e,l){l=l||{};const n=this._theme(),o=this._setupCanvas(t,l.width||120,l.height||36),i=o.ctx,a=o.w,r=o.h;if(i.clearRect(0,0,a,r),!e||e.length<2)return i.fillStyle=n.textMuted,i.font=".5rem "+getComputedStyle(document.body).fontFamily,i.textAlign="center",void i.fillText("--",a/2,r/2+4);const d=Math.min.apply(Math,e),c=Math.max.apply(Math,e)-d||1,h=(a-4)/(e.length-1),f=function(t){return r-2-(t-d)/c*(r-4)},g=l.color||n.line;i.strokeStyle=g,i.lineWidth=1.5,i.lineJoin="round",i.beginPath(),i.moveTo(2,f(e[0]));for(let t=1;t<e.length;t++)i.lineTo(2+t*h,f(e[t]));i.stroke();const u=2+(e.length-1)*h,m=f(e[e.length-1]);i.beginPath(),i.arc(u,m,2.5,0,2*Math.PI),i.fillStyle=g,i.fill()},_roundRect:function(t,e,l,n,o,i){t.beginPath(),t.moveTo(e+i,l),t.lineTo(e+n-i,l),t.arcTo(e+n,l,e+n,l+i,i),t.lineTo(e+n,l+o-i),t.arcTo(e+n,l+o,e+n-i,l+o,i),t.lineTo(e+i,l+o),t.arcTo(e,l+o,e,l+o-i,i),t.lineTo(e,l+i),t.arcTo(e,l,e+i,l,i),t.closePath()}};
/* === dist/js/lunar.js === */
const Lunar=function(){const n=[19416,19168,42352,21717,53856,55632,91476,22176,39632,21970,19168,42422,42192,53840,119381,46400,54944,44450,38320,84343,18800,42160,46261,27216,27968,109396,11104,38256,21234,18800,25958,54432,59984,92821,23248,11104,100067,37600,116951,51536,54432,120998,46416,22176,107956,9680,37584,53938,43344,46423,27808,46416,86869,19872,42416,83315,21168,43432,59728,27296,44710,43856,19296,43748,42352,21088,62051,55632,23383,22176,38608,19925,19152,42192,54484,53840,54616,46400,46752,103846,38320,18864,43380,42160,45690,27216,27968,44870,43872,38256,19189,18800,25776,29859,59984,27480,23232,43872,38613,37600,51552,55636,54432,55888,30034,22176,43959,9680,37584,51893,43344,46240,47780,44368,21977,19360,42416,86390,21168,43312,31060,27296,44368,23378,19296,42726,42208,53856,60005,54576,23200,30371,38608,19195,19152,42192,118966,53840,54560,56645,46496,22224,21938,18864,42359,42160,43600,111189,27936,44448,84835,37744,18936,18800,25776,92326,59984,27424,108228,43744,37600,53987,51552,54615,54432,55888,23893,22176,42704,21972,21200,43448,43344,46240,46758,44368,21920,43940,42416,21168,45683,26928,29495,27296,44368,84821,19296,42352,21732,53600,59752,54560,55968,92838,22224,19168,43476,42192,53584,62034,54560],t=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"],e=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"],a=["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"],r=["正","二","三","四","五","六","七","八","九","十","冬","腊"],o=["","初一","初二","初三","初四","初五","初六","初七","初八","初九","初十","十一","十二","十三","十四","十五","十六","十七","十八","十九","二十","廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"];function i(t){return 15&n[t-1900]}function u(t,e){return n[t-1900]&65536>>e?30:29}function c(t){const e=n[t-1900];let a=348;for(let n=32768;n>8;n>>=1)e&n&&(a+=1);return i(t)&&(a+=65536&e?30:29),a}function f(f){const s=new Date(1900,0,31);let l,h=Math.floor((f-s)/864e5);if(h<0)return null;for(l=1900;l<=2100;l++){const n=c(l);if(h<n)break;h-=n}if(l>2100)return null;const m=i(l);let y=1,N=!1;for(;y<=12;y++){let t=u(l,y);if(h<t)break;if(h-=t,m===y){if(t=65536&n[l-1900]?30:29,h<t){N=!0;break}h-=t}}const g=h+1;let D=(l-4)%60;D<0&&(D+=60);const L=t[D%10]+e[D%12];return{year:l,month:y,day:g,isLeap:N,monthName:(N?"闰":"")+r[y-1]+"月",dayName:o[g],yearName:L+"年",tianGanDiZhi:L,shengXiao:a[D%12]}}return{toLunar:f,getShengXiao:function(n){let t=(n-4)%12;return t<0&&(t+=12),a[t]},getTianGanDiZhi:function(n){let a=(n-4)%60;return a<0&&(a+=60),t[a%10]+e[a%12]},getLunarMonthDay:function(n){const t=f(n);return t?t.monthName+t.dayName:""},getLunarDayName:function(n){const t=f(n);return t?o[t.day]:""},isLunarNewYear:function(n){const t=f(n);return t&&1===t.month&&1===t.day&&!t.isLeap},isFullMoon:function(n){const t=f(n);return t&&15===t.day},getYearInfo:function(n){const t=f(n);return t?{yearName:t.yearName,shengXiao:t.shengXiao,tianGanDiZhi:t.tianGanDiZhi}:null},SHENGXIAO:a,GAN:t,ZHI:e}}();
/* === dist/js/calendar-culture.js === */
const EXTRA_HOLIDAYS=[{d:"2026-02-11",name:{sr:"Mala Nova Godina",zh:"小年",en:"Little New Year"},country:"cn",icon:"🧹",desc:{sr:"Dan čišćenja kuće pred Novu Godinu — da sva sreća ima gde da uđe.",zh:"腊月二十三，祭灶扫尘，准备迎接新年。灶糖甜甜的，给灶王爷一个好印象。",en:"Sweeping the house clean — making room for all the blessings of the New Year."}},{d:"2026-02-18",name:{sr:"Dan ljudi",zh:"人日",en:"Renri (Human Day)"},country:"cn",icon:"👤",desc:{sr:"Sedmi dan Nove Godine — rođendan čovečanstva. Nüwa je danas stvorila ljude od gline.",zh:"正月初七，传说女娲在这一天创造了人类——是每个人的生日。吃七宝羹，祈求健康平安。",en:"The 7th day of CNY — humanity's birthday. Nüwa created humans from clay on this day."}},{d:"2026-04-20",name:{sr:"Festival kiše za žito",zh:"谷雨节",en:"Grain Rain Festival"},country:"cn",icon:"🌾",desc:{sr:"Poslednji prolećni solarni termin — vreme za setvu i molitvu za bogatu žetvu.",zh:"雨生百谷，春天最后一个节气。喝一杯谷雨茶，赏一赏牡丹花，感恩大地的滋养。",en:"The last spring solar term — time for sowing. Drink Grain Rain tea and admire the peonies."}},{d:"2026-09-15",name:{sr:"Festival gladnih duhova",zh:"中元节",en:"Hungry Ghost Festival"},country:"cn",icon:"🏮",desc:{sr:"Dan kada se pali tamjan za duše predaka. Noćas granica između svetova postaje tanja.",zh:"七月十五，中元普渡。点燃一盏河灯，照亮先人回家的路。这天晚上别太晚回家哦。",en:"The 15th of the 7th lunar month. Light water lanterns to guide ancestral spirits home."}},{d:"2026-11-01",name:{sr:"Festival donjeg izvora",zh:"下元节",en:"Xiayuan Festival"},country:"cn",icon:"🙏",desc:{sr:"Dan molitve Bogu Vode da smiri reke i donese mir.",zh:"十月十五，祭祀水官大帝，祈求冬日平安。一碗热汤圆，温暖即将到来的整个冬天。",en:"Praying to the Water God for a calm winter. Tangyuan brings warmth for the cold months ahead."}},{d:"2026-12-22",name:{sr:"Zimski solsticij festival",zh:"冬至节",en:"Winter Solstice Festival"},country:"cn",icon:"🥟",desc:{sr:'"Zimski solsticij je važniji od Nove Godine!" Porodica se okuplja uz jufke.',zh:"冬至大如年！北方人吃饺子，南方人吃汤圆。从今天起阳气渐生，春天已经在路上了。",en:"Winter Solstice is as important as New Year! Northern dumplings, southern tangyuan — yang energy returns."}}],CULTURE_EXPLAIN={lunar:{sr:'Kinezi već 4000 godina prate vreme pomoću lunarnog kalendara (农历 Nónglì). Svaki mesec počinje mladim mesecom 🌑, a pun mesec 🌕 je uvek 15. dana. Datumi koje vidiš na kalendaru (npr. "初三" = treći dan lunarnog meseca) pomažu Kinezima da odrede kada su tradicionalni praznici, venčanja i važni događaji. Za razliku od gregorijanskog kalendara, lunarna Nova Godina je svake godine na drugi datum!',en:'For 4000 years, Chinese people have tracked time with the lunar calendar (农历 Nónglì). Each month starts with a new moon 🌑, and the full moon 🌕 is always on the 15th. The dates on the calendar (e.g. "初三" = 3rd day of the lunar month) help Chinese people determine traditional holidays, weddings, and important events. Unlike the Gregorian calendar, Lunar New Year falls on a different date each year!',zh:'农历已有四千多年历史，每月始于新月🌑，十五必是满月🌕。日历格上的小字（如"初三"）告诉你今天是农历月的第几天，中国人靠它来定节日、婚嫁、祭祀。公历1月1日是新年，但农历新年每年日期都不一样——这就是"春节"的魅力。'},tiangandizhi:{sr:'天干地支 (Tiāngān Dìzhī) je drevni kineski sistem brojanja od 60 kombinacija — 10 Nebeskih Stabljika (天干) i 12 Zemaljskih Grana (地支). Svaka godina, mesec, dan, pa čak i sat imaju svoju kombinaciju! To je kao kineski astrološki kod. Trenutna godina (丙午 Bǐngwǔ) znači "Vatreni Konj" — vatrena energija i sloboda.',en:'天干地支 (Tiāngān Dìzhī) is an ancient Chinese 60-combination counting system — 10 Heavenly Stems (天干) and 12 Earthly Branches (地支). Every year, month, day, and even hour has its own combination! Think of it as a Chinese astrological code. The current year (丙午 Bǐngwǔ) means "Fire Horse" — fiery energy and freedom.',zh:'天干地支是中国最古老的纪年法，十天干配十二地支，六十种组合循环往复。不止年份，月份、日子、时辰也都有干支。古代中国人用它来看命理、选吉日。今年是"丙午"年——丙属火，午为马，合起来就是"火马之年"，象征热情奔腾。'},shengxiao:{sr:"Kineski zodijak (生肖 Shēngxiào) ima 12 životinja koje se smenjuju svake godine: Pacov 🐭, Vo 🐮, Tigar 🐯, Zec 🐰, Zmaj 🐲, Zmija 🐍, Konj 🐴, Koza 🐑, Majmun 🐵, Petao 🐔, Pas 🐶, Svinja 🐷. Tvoja životinja zavisi od godine rođenja! Svaka životinja nosi posebne osobine — Zmaj je moćan, Zec je nežan, Konj je slobodan...",en:"The Chinese zodiac (生肖 Shēngxiào) has 12 animals that cycle each year: Rat 🐭, Ox 🐮, Tiger 🐯, Rabbit 🐰, Dragon 🐲, Snake 🐍, Horse 🐴, Goat 🐑, Monkey 🐵, Rooster 🐔, Dog 🐶, Pig 🐷. Your animal depends on your birth year! Each animal carries special traits — Dragon is powerful, Rabbit is gentle, Horse is free-spirited...",zh:"十二生肖大家都熟悉——鼠牛虎兔龙蛇马羊猴鸡狗猪，每年轮一个。哪年出生的就属什么。龙年出生的霸气，兔年出生的温柔，马年出生的爱自由……你和你的伴侣分别属什么？"},solarterm:{sr:'24 solarna termina (节气 Jiéqì) dele godinu na 24 dela — to je drevni kineski "poljoprivredni sat" star 3000 godina! Svaki termin traje oko 15 dana i opisuje šta se dešava u prirodi: buđenje insekata (惊蛰), žetva pšenice (芒种), prvi mraz (霜降)... Kinezi ih i danas koriste da znaju kada da sade, žanju i slave.',en:'24 Solar Terms (节气 Jiéqì) divide the year into 24 segments — an ancient Chinese "farming clock" over 3000 years old! Each term lasts about 15 days and describes what happens in nature: Awakening of Insects (惊蛰), Grain in Ear (芒种), First Frost (霜降)... Chinese people still use them today to know when to plant, harvest, and celebrate.',zh:'二十四节气把一年分成24份，是三千年前的"农耕时钟"。每个节气约15天，精准描述自然变化：惊蛰虫子醒、芒种麦子熟、霜降天变冷……这套系统在2016年被列入联合国非物质文化遗产。中国人至今依照节气种地、养生、过节。'},poem:{sr:"Tang i Song dinastije (7-13. vek) su zlatno doba kineske poezije. Ove pesme — pune prirode, ljubavi i čežnje — i danas svaki Kinez zna napamet. One su kao mali prozori u kinesku dušu: zima je samoća i lepota, proleće je nada, leto je radost, jesen je seta.",en:"The Tang and Song dynasties (7th-13th century) were the golden age of Chinese poetry. These poems — full of nature, love, and longing — are still memorized by every Chinese person today. They are little windows into the Chinese soul: winter is solitude and beauty, spring is hope, summer is joy, autumn is melancholy.",zh:"唐诗宋词是中国文学最璀璨的明珠。一千多年前的诗人们，用最精炼的文字写下山水、离别、思念、豁达——至今每个中国人都会背几首。这里每月精选一首与你共赏。"},color:{sr:'Kinezi su kroz istoriju razvili neverovatno bogat rečnik boja — stotine poetskih imena koja oslikavaju prirodu: "mesečevo bela" (月白), "breskvino roze" (桃红), "lotus zelena" (荷绿)... Svako ime je mala slika. Boje se menjaju kroz godišnja doba prateći drevni sistem Pet Elemenata (Drvo, Vatra, Zemlja, Metal, Voda).',en:'Throughout history, Chinese people developed an incredibly rich color vocabulary — hundreds of poetic names that paint nature: "moon white" (月白), "peach pink" (桃红), "lotus green" (荷绿)... Each name is a tiny painting. Colors shift through the seasons following the ancient Five Elements system (Wood, Fire, Earth, Metal, Water).',zh:"中国传统色有上百种，名字极美——月白、桃红、柳绿、黛蓝、琥珀、胭脂……每听一个名字都是一幅画。颜色还与五行（木火土金水）和季节呼应。看看这个月是什么色？"}},SEASONAL_POEMS={0:{title:{zh:"元日",sr:"Novogodišnji dan",en:"New Year's Day"},author:"王安石",dynasty:"宋",explain:{sr:'Pesma slavi kinesku Novu Godinu. "Peach-wood signs" (桃符) su preteče današnjih crvenih papirnih amajlija koje Kinezi lepe na vrata za sreću.',en:'This poem celebrates Chinese New Year. "Peach-wood signs" (桃符) were the ancestors of today\'s red paper couplets pasted on doors for luck.',zh:"写春节最经典的诗。爆竹声里旧年过去，家家户户换上新的桃符（春联的前身），春风把暖意送进每一杯屠苏酒里。"},lines:{zh:"爆竹声中一岁除，春风送暖入屠苏。\n千门万户曈曈日，总把新桃换旧符。",sr:"Uz prasak petardi stara godina odlazi,\nProlećni vetar donosi toplinu.\nSunce obasjava hiljade domova,\nSvi menjaju stare amajlije za nove.",en:"Firecrackers bid the old year farewell,\nSpring wind brings warmth to every home.\nThe sun shines on a thousand doors,\nAll swap old charms for new peach-wood signs."}},2:{title:{zh:"春晓",sr:"Prolećno jutro",en:"Spring Morning"},author:"孟浩然",dynasty:"唐",explain:{sr:"Najpoznatija kineska pesma o proleću. Pesnik se budi i shvata da je proleće već tu — ptice pevaju, a noćna kiša je oborila latice cveća. Jednostavna, a tako živa slika.",en:"The most famous Chinese spring poem. The poet wakes to find spring has arrived — birds sing, and last night's rain has knocked petals to the ground. Simple yet vivid.",zh:"每个中国人都会背的第一首诗。春睡醒来，鸟鸣处处，想起昨夜风雨——不知花落了多少？短短二十个字，春日的慵懒与怜惜跃然纸上。"},lines:{zh:"春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。",sr:"U prolećnom snu ne čuješ zoru,\nSvuda cvrkut ptica.\nSinoć šum vetra i kiše —\nKoliko latica je palo?",en:"Spring sleep, unaware of dawn,\nEverywhere I hear birds sing.\nLast night — wind and rain,\nHow many flowers have fallen?"}},5:{title:{zh:"小池",sr:"Mali ribnjak",en:"Little Pond"},author:"杨万里",dynasty:"宋",explain:{sr:'Letnja minijatura — izvor, senka drveta, lotosov pupoljak i vilin konjic. Pesnik gleda mali ribnjak i vidi ceo svet u njemu. Kineska poezija voli ovakve "male velike stvari".',en:'A summer miniature — a spring, tree shade, a lotus bud, and a dragonfly. The poet sees a whole world in a little pond. Chinese poetry loves these "small big things."',zh:'夏日小景——泉眼、树荫、才露尖角的小荷、早已立在荷尖的蜻蜓。诗人没有说一个"夏"字，却写尽了初夏的灵动与生机。'},lines:{zh:"泉眼无声惜细流，树阴照水爱晴柔。\n小荷才露尖尖角，早有蜻蜓立上头。",sr:"Izvor šapuće, štedeći tanak mlaz,\nSenka drveta miluje vodu.\nTek što lotos pokaže vrh,\nVilin konjic već na njemu stoji.",en:"The spring murmurs, sparing its stream,\nTree shade caresses the sunlit water.\nThe lotus bud just shows its tip,\nA dragonfly already rests upon it."}},8:{title:{zh:"山居秋暝",sr:"Jesenje veče u planinama",en:"Autumn Evening"},author:"王维",dynasty:"唐",explain:{sr:"Wang Wei je bio pesnik i slikar — njegove pesme su kao slike. Ovde slika jesenje veče u planinama posle kiše: svež vazduh, mesečina kroz borove, potok preko kamenja. Savršen mir.",en:"Wang Wei was both poet and painter — his poems are like paintings. Here he paints an autumn evening in the mountains after rain: fresh air, moonlight through pines, a stream over stones. Perfect peace.",zh:'王维是"诗中有画"的代表。空山新雨，明月松间，清泉石上——四句话就是一幅山水画。秋夜的清冷与宁静，美到让人忘记时间。'},lines:{zh:"空山新雨后，天气晚来秋。\n明月松间照，清泉石上流。",sr:"Prazne planine posle sveže kiše,\nVazduh miriše na jesen.\nMesec sija kroz borove,\nPotok teče preko kamenja.",en:"Empty mountains after fresh rain,\nThe air feels of autumn.\nMoon shines through the pines,\nA clear spring flows over stones."}},11:{title:{zh:"江雪",sr:"Sneg na reci",en:"River Snow"},author:"柳宗元",dynasty:"唐",explain:{sr:"Najpoznatija kineska zimska pesma. Hiljade planina — ni jedne ptice. Deset hiljada staza — ni jednog čoveka. Samo jedan starac u čamcu, peca na zaleđenoj reci. Potpuna tišina i samoća — ali i neverovatna unutrašnja snaga.",en:"The most famous Chinese winter poem. A thousand mountains — not a single bird. Ten thousand paths — not a single person. Only an old man in a boat, fishing on a frozen river. Absolute silence and solitude — but also incredible inner strength.",zh:"中国最有名的冬诗。千山无鸟，万径无人——天地间只剩一个披蓑戴笠的老翁，独坐在江雪中垂钓。极致的孤独，也是极致的自由。"},lines:{zh:"千山鸟飞绝，万径人踪灭。\n孤舟蓑笠翁，独钓寒江雪。",sr:"Na hiljadu planina ni ptice,\nNa deset hiljada staza ni traga.\nU čamcu starac sa slamnim šeširom —\nSam peca na hladnoj reci pod snegom.",en:"A thousand hills — no bird in flight,\nTen thousand paths — no human trace.\nA lone boat, an old man in straw cloak,\nFishing alone in the cold river snow."}}},TRADITIONAL_COLORS={0:{name:{zh:"月白",sr:"mesečevo bela",en:"moon white"},hex:"#D6E4F0"},1:{name:{zh:"水色",sr:"vodeno plava",en:"water blue"},hex:"#A8D8EA"},2:{name:{zh:"柳绿",sr:"vrbino zelena",en:"willow green"},hex:"#A8D08D"},3:{name:{zh:"桃红",sr:"breskvino roze",en:"peach pink"},hex:"#F4A7B9"},4:{name:{zh:"天青",sr:"nebesko plava",en:"sky cyan"},hex:"#87CEEB"},5:{name:{zh:"朱砂",sr:"cinober crvena",en:"cinnabar red"},hex:"#E53935"},6:{name:{zh:"荷绿",sr:"lotus zelena",en:"lotus green"},hex:"#4CAF50"},7:{name:{zh:"黛蓝",sr:"indigo plava",en:"indigo blue"},hex:"#1A237E"},8:{name:{zh:"琥珀",sr:"ćilibarna",en:"amber"},hex:"#FF8F00"},9:{name:{zh:"胭脂",sr:"rumenilo",en:"rouge"},hex:"#C62828"},10:{name:{zh:"霜白",sr:"mrazno bela",en:"frost white"},hex:"#ECEFF1"},11:{name:{zh:"墨色",sr:"tuš crna",en:"ink black"},hex:"#212121"}},GAN_SR=["Dzja","Ji","Bing","Ding","Vu","Dji","Geng","Sin","Ren","Guej"],GAN_EN=["Jia","Yi","Bing","Ding","Wu","Ji","Geng","Xin","Ren","Gui"],GAN_ELEM_SR=["Drvo Jang","Drvo Jin","Vatra Jang","Vatra Jin","Zemlja Jang","Zemlja Jin","Metal Jang","Metal Jin","Voda Jang","Voda Jin"],GAN_ELEM_EN=["Yang Wood","Yin Wood","Yang Fire","Yin Fire","Yang Earth","Yin Earth","Yang Metal","Yin Metal","Yang Water","Yin Water"],ZHI_SR=["Zi","Čou","Jin","Mao","Čen","Si","Vu","Vej","Šen","Jou","Sju","Haj"],ZHI_EN=["Zi","Chou","Yin","Mao","Chen","Si","Wu","Wei","Shen","You","Xu","Hai"],ZOO_SR=["Pacov","Vo","Tigar","Zec","Zmaj","Zmija","Konj","Koza","Majmun","Petao","Pas","Svinja"],ZOO_EN=["Rat","Ox","Tiger","Rabbit","Dragon","Snake","Horse","Goat","Monkey","Rooster","Dog","Pig"],ZOO_EMOJI=["🐭","🐮","🐯","🐰","🐲","🐍","🐴","🐑","🐵","🐔","🐶","🐷"];function _ganZhiTranslated(e){if(!e||e.length<2)return e;const n=e[0],a=e[1],i=Lunar.GAN.indexOf(n),o=Lunar.ZHI.indexOf(a);if(i<0||o<0)return e;const t="undefined"!=typeof lang?lang:"sr";return"sr"===t||"sr-RS"===t?GAN_SR[i]+ZHI_SR[o]+" ("+GAN_ELEM_SR[i]+" "+ZOO_SR[o]+")":"en"===t?GAN_EN[i]+ZHI_EN[o]+" ("+GAN_ELEM_EN[i]+" "+ZOO_EN[o]+")":e}function _shengxiaoTranslated(e){const n=Lunar.SHENGXIAO.indexOf(e);if(n<0)return e;const a="undefined"!=typeof lang?lang:"sr";return"sr"===a||"sr-RS"===a?ZOO_SR[n]:"en"===a?ZOO_EN[n]:e}function _zooEmoji(e){const n=Lunar.SHENGXIAO.indexOf(e);return n>=0?ZOO_EMOJI[n]:""}function _CL(e){if(!e)return"";const n="undefined"!=typeof lang?lang:"sr";return e[n]||e[n.split("-")[0]]||e.sr||""}function renderLunarInfo(){if("undefined"==typeof today)return;const e=document.getElementById("lunarInfo");if(!e)return;const n=today(),a=Lunar.getYearInfo(n),i=Lunar.toLunar(n);if(!a||!i)return void(e.style.display="none");e.style.display="";const o=_ganZhiTranslated(a.tianGanDiZhi),t=_shengxiaoTranslated(a.shengXiao),r=_CL({sr:"Lunarni "+i.month+". mesec, "+i.day+". dan",en:"Lunar "+i.month+"/"+i.day,"zh-CN":i.monthName+i.dayName});e.innerHTML='<span title="'+escAttr(_CL(CULTURE_EXPLAIN.tiangandizhi))+'">🐲 '+o+'</span> · <span title="'+escAttr(_CL(CULTURE_EXPLAIN.shengxiao))+'">'+_zooEmoji(a.shengXiao)+" "+t+'</span> · <span title="'+escAttr(_CL(CULTURE_EXPLAIN.lunar))+'">'+r+'</span> <span style="cursor:pointer;font-size:.7rem" onclick="renderCultureExplain()" title="'+escAttr(_CL({sr:"Klikni za objasnjenje",en:"Click to learn more","zh-CN":"点击了解更多"}))+'">ℹ️</span>'}function renderSeasonalPoemCard(){if("undefined"==typeof today)return;const e=document.getElementById("cultureCard");if(!e)return;const n=today().getMonth(),a=SEASONAL_POEMS[n];if(!a)return void(e.style.display="none");e.style.display="";const i=TRADITIONAL_COLORS[n],o=Lunar.getYearInfo(today()),t="undefined"!=typeof lang?lang:"zh",r=(a.lines[t]||a.lines[t.split("-")[0]]||a.lines.zh).replace(/\n/g,"<br>"),s=a.title[t]||a.title[t.split("-")[0]]||a.title.zh;e.innerHTML='<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-size:1.2rem">📜</span><span class="poem-title">'+s+'</span><span style="font-size:.6rem;opacity:.45">— '+a.author+" · "+a.dynasty+'</span></div><div class="poem-body" style="white-space:pre-line">'+r+'</div><div class="poem-explain" style="font-size:.65rem;color:var(--text-muted);margin-top:6px;line-height:1.6;font-style:italic;padding:6px 10px;background:rgba(180,140,100,.06);border-radius:8px">💡 '+_CL(a.explain)+'</div><div style="margin-top:6px;font-size:.6rem;opacity:.4;display:flex;gap:12px;flex-wrap:wrap"><span title="'+escAttr(_CL(CULTURE_EXPLAIN.color))+'">🖌️ '+_CL({sr:"Tradicionalna boja: ","zh-CN":"中国传统色：",en:"Traditional color: "})+_CL(i.name)+' <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:'+i.hex+';vertical-align:middle;margin-left:2px"></span></span>'+(o?'<span title="'+escAttr(_CL(CULTURE_EXPLAIN.shengxiao))+'">🐉 '+_CL({sr:"Godina ",en:"Year of the ","zh-CN":""})+_shengxiaoTranslated(o.shengXiao)+_CL({sr:"",en:"","zh-CN":"年"})+"</span>":"")+'<span title="'+escAttr(_CL(CULTURE_EXPLAIN.solarterm))+'" style="cursor:pointer" onclick="renderCultureExplain()">🌿 '+_CL({sr:"Sta je sve ovo?",en:"What is all this?","zh-CN":"这些是什么？"})+"</span></div>"}function renderCultureExplain(){const e=document.getElementById("cultureExplain");if(!e)return;if("none"!==e.style.display&&e.innerHTML)return void(e.style.display="none");e.style.display="";let n='<div style="font-weight:700;margin-bottom:8px;font-size:.78rem">🏮 '+_CL({sr:"Kineska Kultura — Objasnjenje",en:"Chinese Culture — Explained","zh-CN":"中国文化小课堂"})+"</div>";[{icon:"📅",key:"lunar",title:{sr:"Lunarni Kalendar",en:"Lunar Calendar","zh-CN":"农历"}},{icon:"🐉",key:"shengxiao",title:{sr:"Kineski Zodijak (生肖)",en:"Chinese Zodiac (生肖)","zh-CN":"十二生肖"}},{icon:"🔢",key:"tiangandizhi",title:{sr:"Nebeske Stabljike i Zemaljske Grane",en:"Heavenly Stems & Earthly Branches","zh-CN":"天干地支"}},{icon:"🌿",key:"solarterm",title:{sr:"24 Solarna Termina (节气)",en:"24 Solar Terms (节气)","zh-CN":"二十四节气"}},{icon:"🎨",key:"color",title:{sr:"Tradicionalne Kineske Boje",en:"Traditional Chinese Colors","zh-CN":"中国传统色"}},{icon:"📜",key:"poem",title:{sr:"Tang & Song Poezija",en:"Tang & Song Poetry","zh-CN":"唐诗宋词"}}].forEach(function(e){n+='<div style="margin-bottom:10px;padding:8px 10px;background:var(--card);border-radius:10px;border-left:2px solid var(--rose-mist)"><div style="font-weight:700;font-size:.72rem;margin-bottom:3px">'+e.icon+" "+_CL(e.title)+'</div><div style="font-size:.65rem;color:var(--text-muted);line-height:1.6">'+_CL(CULTURE_EXPLAIN[e.key])+"</div></div>"}),n+="<div style=\"text-align:center;font-size:.6rem;color:var(--text-muted);margin-top:6px;cursor:pointer\" onclick=\"document.getElementById('cultureExplain').style.display='none'\">"+_CL({sr:"✕ zatvori",en:"✕ close","zh-CN":"✕ 关闭"})+"</div>",e.innerHTML=n,e.scrollIntoView({behavior:"smooth",block:"nearest"})}function escAttr(e){return String(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function getLunarCellClass(e){const n=Lunar.toLunar(e);if(!n)return"";let a="lunar-date";return 1===n.day?a+=" lunar-first":15===n.day&&(a+=" lunar-fifteen"),1!==n.month||1!==n.day||n.isLeap||(a+=" lunar-newyear"),a}function getLunarCellText(e){const n=Lunar.toLunar(e);if(!n)return"";const a="undefined"!=typeof lang?lang:"sr";return"sr"===a||"sr-RS"===a||"en"===a?n.day:Lunar.getLunarDayName(e)}function initExtraHolidays(){"undefined"!=typeof HOLIDAYS?HOLIDAYS._mergedExtra||(EXTRA_HOLIDAYS.forEach(function(e){HOLIDAYS.some(function(n){return n.d===e.d&&n.country===e.country})||HOLIDAYS.push(e)}),HOLIDAYS._mergedExtra=!0,"function"==typeof _rebuildHolidayCache&&_rebuildHolidayCache()):setTimeout(initExtraHolidays,100)}!function e(n){if(n=n||0,"undefined"==typeof today||"undefined"==typeof lang)return n<50?void setTimeout(function(){e(n+1)},200):void("undefined"!=typeof DEBUG&&DEBUG&&console.warn("[culture] today/lang not available after 50 retries — skipping"));initExtraHolidays(),renderLunarInfo(),renderSeasonalPoemCard()}();
/* === dist/js/cycle-core.js === */
"use strict";const fmtDate=t=>`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`,sameDay=(t,e)=>t.getFullYear()===e.getFullYear()&&t.getMonth()===e.getMonth()&&t.getDate()===e.getDate(),addDays=(t,e)=>{const r=new Date(t);return r.setDate(r.getDate()+e),r},daysDiff=(t,e)=>Math.round((e.getTime()-t.getTime())/864e5),d0=t=>{const e=new Date(t);return e.setHours(0,0,0,0),e},today=()=>{const t=new Date;return t.setHours(0,0,0,0),t};function predict(){const{records:t,settings:e}=state,r=[...t].sort((t,e)=>t-e),a=state.periodEnds||{},n=[];for(let t=0;t<r.length;t++){const e=fmtDate(r[t]);a[e]&&n.push(daysDiff(d0(r[t]),d0(new Date(a[e]+"T00:00:00")))+1)}const d=n.length>0?Math.round(n.reduce(function(t,e){return t+e},0)/n.length):e.periodLength,s={lastStart:null,nextStart:null,ovulation:null,fertileStart:null,fertileEnd:null,cycleLen:e.cycleLength,periodLen:d,avgCycle:e.cycleLength,minCycle:null,maxCycle:null,stdDev:0,confidence:"low",cycles:[],isOverdue:!1,overdueDays:0,futurePeriods:[]};if(0===r.length)return s;if(s.lastStart=d0(r[r.length-1]),1===r.length)s.nextStart=addDays(s.lastStart,e.cycleLength);else{for(let t=1;t<r.length;t++)s.cycles.push(daysDiff(d0(r[t-1]),d0(r[t])));const t=s.cycles.slice(-6);if(t.length>0){s.avgCycle=Math.round(t.reduce((t,e)=>t+e,0)/t.length),s.minCycle=Math.min(...t),s.maxCycle=Math.max(...t);const e=t.reduce((t,e)=>t+(e-s.avgCycle)**2,0)/t.length;s.stdDev=Math.round(10*Math.sqrt(e))/10,s.stdDev<=3?s.confidence="high":s.stdDev<=6?s.confidence="medium":s.confidence="low"}s.nextStart=addDays(s.lastStart,s.avgCycle)}const o=today();if(s.nextStart&&o>s.nextStart){const t=e.manualOverride?e.cycleLength:s.avgCycle,r=daysDiff(s.lastStart,o),a=Math.floor(r/t);a>=1&&(s.nextStart=addDays(s.lastStart,t*(a+1))),s.isOverdue=o>s.nextStart,s.isOverdue&&(s.overdueDays=daysDiff(s.nextStart,o))}if(s.nextStart){s.ovulation=addDays(s.nextStart,-14),s.fertileStart=addDays(s.ovulation,-3),s.fertileEnd=addDays(s.ovulation,2);const t=e.manualOverride?e.cycleLength:s.avgCycle;for(let e=1;e<=2;e++){const r=addDays(s.nextStart,t*e);s.futurePeriods.push({start:r,ovulation:addDays(r,-14),fertileStart:addDays(r,-17),fertileEnd:addDays(r,-11)})}}return s}function getPeriodEndDate(t){const e=fmtDate(t);return state.periodEnds&&state.periodEnds[e]?new Date(state.periodEnds[e]+"T00:00:00"):null}function getPhase(t,e){const r=d0(t);for(const t of state.records){const a=d0(t),n=getPeriodEndDate(t)||addDays(a,e.periodLen-1);if(n.setHours(0,0,0,0),r>=a&&r<=n)return sameDay(r,a)?"period-on":"period-mid"}if(e.nextStart){const t=d0(e.nextStart),a=addDays(t,e.periodLen-1);if(a.setHours(0,0,0,0),r>=t&&r<=a)return sameDay(r,t)?"period-pred-first":"period-pred"}for(const t of e.futurePeriods){const a=d0(t.start),n=addDays(a,e.periodLen-1);if(n.setHours(0,0,0,0),r>=a&&r<=n)return sameDay(r,a)?"period-future-first":"period-future"}if(e.ovulation&&sameDay(r,e.ovulation))return"ovulation";if(e.fertileStart&&e.fertileEnd){const t=d0(e.fertileStart),a=d0(e.fertileEnd);if(r>=t&&r<=a)return"fertile"}if(e.fertileEnd&&e.nextStart){const t=d0(e.fertileEnd),a=d0(e.nextStart);if(r>t&&r<a)return"luteal"}if(e.lastStart&&e.fertileStart){const t=addDays(e.lastStart,e.periodLen);t.setHours(0,0,0,0);const a=d0(e.fertileStart);if(r>=t&&r<a)return"follicular"}return null}function getOpenPeriodStart(){if(!state.periodEnds)return null;for(let t=state.records.length-1;t>=0;t--){const e=fmtDate(state.records[t]);if(!state.periodEnds[e])return state.records[t]}return null}
/* === dist/js/cycle-engine.js === */
"use strict";

/* ================================================================
   cycle-engine.js — 日历数据引擎（纯函数）

   输入原始经期记录 → 输出 CalendarCell[]（42 格数组）
   - 用户录入的经期起止日期优先于任何预测
   - 不含任何 DOM 操作
   - 渲染层不应当在此引擎之外做额外阶段判断
   - 预留 userA / userB 支持，当前 userB 返回 null
   ================================================================ */

var CycleEngine = (function () {

  /* ================================================================
     内建日期工具（纯函数，不依赖 cycle-core.js）
     ================================================================ */

  /** Date → "YYYY-MM-DD" */
  function fmtDate(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  /** 判断两个 Date 是否同一天 */
  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  /** Date + n 天（返回新对象） */
  function addDays(date, n) {
    var r = new Date(date);
    r.setDate(r.getDate() + n);
    return r;
  }

  /** 计算相差天数 */
  function daysDiff(a, b) {
    return Math.round((b.getTime() - a.getTime()) / 86400000);
  }

  /** Date → 归零到午夜（纯函数，返回新对象） */
  function d0(date) {
    var r = new Date(date);
    r.setHours(0, 0, 0, 0);
    return r;
  }

  /** 获取今天 00:00:00 */
  function today() {
    var t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }

  /* ================================================================
     核心阶段计算
     ================================================================ */

  /**
   * 获取一个经期记录的结束日期
   * @param {Date} periodStart - 周期开始日期
   * @param {Object} periodEnds - { 'YYYY-MM-DD': 'YYYY-MM-DD' }
   * @param {number} defaultPeriodLen - 默认经期长度
   * @returns {Date} 结束日期（经期最后一天）
   */
  function getPeriodEndDate(periodStart, periodEnds, defaultPeriodLen) {
    var key = fmtDate(periodStart);
    if (periodEnds && periodEnds[key]) {
      return d0(new Date(periodEnds[key] + 'T00:00:00'));
    }
    return addDays(d0(periodStart), defaultPeriodLen - 1);
  }

  /**
   * 在两个已知周期之间计算某天的非经期阶段
   * @param {Date} date - 待计算日期（已 d0）
   * @param {Date} periodEnd - 本次经期结束日（已 d0）
   * @param {Date} nextPeriodStart - 下次经期开始日（已 d0）
   * @returns {string|null} 'follicular' | 'ovulation' | 'fertile' | 'luteal' | null
   */
  function computeCyclePhase(date, periodEnd, nextPeriodStart) {
    var d = d0(date);

    var ovulation = addDays(nextPeriodStart, -14);
    var fertileStart = addDays(ovulation, -3);
    var fertileEnd = addDays(ovulation, 2);

    // 卵泡期
    if (d >= periodEnd && d < fertileStart) return 'follicular';

    // 受孕窗口（含排卵日）
    if (d >= fertileStart && d <= fertileEnd) {
      if (sameDay(d, ovulation)) return 'ovulation';
      return 'fertile';
    }

    // 黄体期
    if (d > fertileEnd && d < nextPeriodStart) return 'luteal';

    return null;
  }

  /**
   * 计算单日的阶段信息
   *
   * 优先级（从高到低）：
   *   1. 用户录入的经期区间（绝对优先）
   *   2. 两个录入周期之间的阶段（基于真实周期长度）
   *   3. 最后一个录入周期后的预测阶段
   *   4. 逾期后的阶段（持续预测，最多到第 3 周期）
   *
   * @param {Date} date - 待计算日期
   * @param {Date[]} sortedRecords - 经期开始日期（已排序、已 d0）
   * @param {Object} periodEnds - 结束日期映射
   * @param {Object} settings - { cycleLength, periodLength }
   * @returns {Object} phaseInfo
   */
  function computeDayPhase(date, sortedRecords, periodEnds, settings) {
    var d = d0(date);
    var periodLen = (settings && settings.periodLength) || 7;

    // ===== STEP 1: 检查是否在已录入的经期内 =====
    for (var i = 0; i < sortedRecords.length; i++) {
      var start = d0(sortedRecords[i]);
      var end = getPeriodEndDate(sortedRecords[i], periodEnds, periodLen);

      if (d >= start && d <= end) {
        var cycleDay = daysDiff(start, d) + 1;
        var isFirstDay = sameDay(d, start);
        return {
          phase: isFirstDay ? 'period-on' : 'period-mid',
          semanticPhase: 'period',
          predicted: false,
          cycleDay: cycleDay,
          isOverdue: false,
          futurePeriod: false,
        };
      }
    }

    // 无记录
    if (sortedRecords.length === 0) {
      return { phase: null, semanticPhase: null, predicted: false, cycleDay: null, isOverdue: false, futurePeriod: false };
    }

    // ===== STEP 2: 计算周期指标 =====
    var cycles = [];
    for (var j = 1; j < sortedRecords.length; j++) {
      cycles.push(daysDiff(d0(sortedRecords[j - 1]), d0(sortedRecords[j])));
    }

    var recentCycles = cycles.slice(-3);
    var avgCycle = recentCycles.length > 0
      ? Math.round(recentCycles.reduce(function (a, b) { return a + b; }, 0) / recentCycles.length)
      : (settings && settings.cycleLength) || 28;

    var lastStart = d0(sortedRecords[sortedRecords.length - 1]);
    var lastEnd = getPeriodEndDate(sortedRecords[sortedRecords.length - 1], periodEnds, periodLen);

    // ===== STEP 3: 检查是否在两个已录入周期之间 =====
    for (var k = 0; k < sortedRecords.length - 1; k++) {
      var thisStart = d0(sortedRecords[k]);
      var thisEnd = getPeriodEndDate(sortedRecords[k], periodEnds, periodLen);
      var nextStart = d0(sortedRecords[k + 1]);

      if (d > thisEnd && d < nextStart) {
        var phase = computeCyclePhase(d, thisEnd, nextStart);
        var cd = daysDiff(lastStart, d) + 1;
        return {
          phase: phase,
          semanticPhase: phase,
          predicted: false,
          cycleDay: cd,
          isOverdue: false,
          futurePeriod: false,
        };
      }
    }

    // ===== STEP 4: 日期在最后一个录入周期之后 =====
    var predictedNextStart = addDays(lastStart, avgCycle);
    var predictedNextEnd = addDays(predictedNextStart, periodLen - 1);

    // 4a: 在预测的下次经期内
    if (d >= predictedNextStart && d <= predictedNextEnd) {
      var cdPred = daysDiff(lastStart, d) + 1;
      var isPredFirst = sameDay(d, predictedNextStart);
      return {
        phase: isPredFirst ? 'period-pred-first' : 'period-pred',
        semanticPhase: 'period',
        predicted: true,
        cycleDay: cdPred,
        isOverdue: false,
        futurePeriod: false,
      };
    }

    // 4b: 在最后一个经期结束后、预测下次经期前
    if (d > lastEnd && d < predictedNextStart) {
      var phaseBetween = computeCyclePhase(d, lastEnd, predictedNextStart);
      var cdBetween = daysDiff(lastStart, d) + 1;
      return {
        phase: phaseBetween,
        semanticPhase: phaseBetween,
        predicted: true,
        cycleDay: cdBetween,
        isOverdue: false,
        futurePeriod: false,
      };
    }

    // ===== STEP 5: 日期在预测经期之后（逾期）=====
    if (d > predictedNextEnd) {
      var nextPeriod2Start = addDays(predictedNextStart, avgCycle);
      var nextPeriod2End = addDays(nextPeriod2Start, periodLen - 1);

      /* 第 2 个预测经期内 */
      if (d >= nextPeriod2Start && d <= nextPeriod2End) {
        var cdFut = daysDiff(lastStart, d) + 1;
        var isFutFirst = sameDay(d, nextPeriod2Start);
        return {
          phase: isFutFirst ? 'period-future-first' : 'period-future',
          semanticPhase: 'period',
          predicted: true,
          cycleDay: cdFut,
          isOverdue: true,
          futurePeriod: true,
        };
      }

      /* 第 2 个周期内的非经期阶段 */
      if (d < nextPeriod2Start) {
        var phaseFut = computeCyclePhase(d, predictedNextEnd, nextPeriod2Start);
        var cdFut2 = daysDiff(lastStart, d) + 1;
        return {
          phase: phaseFut,
          semanticPhase: phaseFut,
          predicted: true,
          cycleDay: cdFut2,
          isOverdue: true,
          futurePeriod: true,
        };
      }

      /* 第 3 个周期（限制预测范围） */
      var nextPeriod3Start = addDays(nextPeriod2Start, avgCycle);
      if (d < nextPeriod3Start) {
        var phaseFut3 = computeCyclePhase(d, nextPeriod2End, nextPeriod3Start);
        var cdFut3 = daysDiff(lastStart, d) + 1;
        return {
          phase: phaseFut3,
          semanticPhase: phaseFut3,
          predicted: true,
          cycleDay: cdFut3,
          isOverdue: true,
          futurePeriod: true,
        };
      }

      /* 超过第 3 个周期 */
      return { phase: null, semanticPhase: null, predicted: true, cycleDay: null, isOverdue: true, futurePeriod: true };
    }

    return { phase: null, semanticPhase: null, predicted: false, cycleDay: null, isOverdue: false, futurePeriod: false };
  }

  /* ================================================================
     42 格日历生产
     ================================================================ */

  /**
   * @typedef {Object} CalendarCell
   * @property {Date}     date           - 日期对象
   * @property {string}   dateKey        - "YYYY-MM-DD"
   * @property {number}   dayNumber      - 1-31
   * @property {boolean}  isCurrentMonth - 在当前视图月内
   * @property {boolean}  isToday        - 是否为今天
   * @property {string|null}  phase      - CSS 阶段类名
   * @property {string|null}  semanticPhase - 语义阶段
   * @property {boolean}  predicted      - 是否依赖预测数据
   * @property {number|null} cycleDay    - 当前周期第几天
   * @property {boolean}  isOverdue      - 预测经期已过期
   * @property {boolean}  futurePeriod   - 未来第 2+ 个预测周期
   * @property {boolean}  periodStart    - 此日是用户标记的经期开始
   * @property {boolean}  periodEnd      - 此日是用户标记的经期结束
   * @property {Object|null} userA       - 用户 A 数据（预留）
   * @property {Object|null} userB       - 用户 B 数据（预留，当前返回 null）
   * 以下由渲染层填充：
   * @property {Array}    holidays       - 节日
   * @property {Object|null} solarTerm   - 节气
   * @property {string|null} lunarDay    - 农历日
   * @property {Object|null} symptoms    - 症状
   * @property {Array}    markers        - 日历标记
   * @property {boolean}  hasDiary       - 有日记
   * @property {number}   anniversary    - 纪念日类型
   * @property {boolean}  birthday       - 生日
   * @property {Object|null} specialDate - 特别日期
   */

  /**
   * 生成 42 格日历数据（6 行 × 7 列）
   *
   * @param {number}   year        - 年份
   * @param {number}   month       - 月份（0-11）
   * @param {Date[]}   records     - 经期开始日期数组
   * @param {Object}   periodEnds  - 经期结束映射
   * @param {Object}   settings    - { cycleLength, periodLength }
   * @param {Date}     [todayDate] - 用于判断"今天"
   * @returns {CalendarCell[]} 长度 42
   */
  function computeCalendarCells(year, month, records, periodEnds, settings, todayDate) {
    var td = todayDate ? d0(todayDate) : today();
    var safeSettings = Object.assign({ cycleLength: 28, periodLength: 7 }, settings || {});

    // 排序并归一化记录
    var sortedRecords = [];
    for (var si = 0; si < records.length; si++) {
      sortedRecords.push(d0(records[si]));
    }
    sortedRecords.sort(function (a, b) { return a - b; });

    // 计算网格起始日期（前推到周一）
    var firstDay = new Date(year, month, 1);
    var dow = firstDay.getDay();
    dow = dow === 0 ? 6 : dow - 1; // Sun→6, Mon→0
    var gridStart = addDays(firstDay, -dow);

    // 建立记录集（O(1) 查询）
    var recordedStartSet = {};
    for (var rsi = 0; rsi < sortedRecords.length; rsi++) {
      recordedStartSet[fmtDate(sortedRecords[rsi])] = true;
    }

    // 经期结束集
    var periodEndSet = {};
    for (var pei = 0; pei < sortedRecords.length; pei++) {
      var peKey = fmtDate(sortedRecords[pei]);
      if (periodEnds && periodEnds[peKey]) {
        periodEndSet[periodEnds[peKey]] = true;
      }
    }

    // 计算平均周期长度（用于 cycleDay 判断）
    var avgCycleForDay = safeSettings.cycleLength;
    if (sortedRecords.length >= 2) {
      var cycArr = [];
      for (var ci = 1; ci < sortedRecords.length; ci++) {
        cycArr.push(daysDiff(sortedRecords[ci - 1], sortedRecords[ci]));
      }
      var recentC = cycArr.slice(-3);
      if (recentC.length > 0) {
        avgCycleForDay = Math.round(recentC.reduce(function (a, b) { return a + b; }, 0) / recentC.length);
      }
    }

    var cells = [];

    for (var i = 0; i < 42; i++) {
      var date = addDays(gridStart, i);
      var dateKey = fmtDate(date);
      var isCurrentMonth = (date.getMonth() === month && date.getFullYear() === year);
      var isTodayFlag = sameDay(date, td);

      // 阶段计算（仅当月格子计算，其他月份格子无阶段）
      var phaseInfo = isCurrentMonth
        ? computeDayPhase(date, sortedRecords, periodEnds, safeSettings)
        : { phase: null, semanticPhase: null, predicted: false, cycleDay: null, isOverdue: false, futurePeriod: false };

      // cycleDay 限制在当前周期内显示
      var displayCycleDay = null;
      if (phaseInfo.cycleDay !== null && sortedRecords.length > 0) {
        if (phaseInfo.cycleDay >= 1 && phaseInfo.cycleDay <= avgCycleForDay) {
          displayCycleDay = phaseInfo.cycleDay;
        }
      }

      var cell = {
        // 基础信息
        date: date,
        dateKey: dateKey,
        dayNumber: date.getDate(),
        isCurrentMonth: isCurrentMonth,
        isToday: isTodayFlag,

        // 阶段信息
        phase: phaseInfo.phase,
        semanticPhase: phaseInfo.semanticPhase,
        predicted: phaseInfo.predicted,
        cycleDay: displayCycleDay,
        isOverdue: phaseInfo.isOverdue,
        futurePeriod: phaseInfo.futurePeriod,

        // 经期标记
        periodStart: !!recordedStartSet[dateKey],
        periodEnd: !!periodEndSet[dateKey],

        // 预留双用户
        userA: null,
        userB: null,

        // 占位字段（渲染层填充）
        holidays: [],
        solarTerm: null,
        lunarDay: null,
        symptoms: null,
        markers: [],
        hasDiary: false,
        anniversary: 0,
        birthday: false,
        specialDate: null,
      };

      cells.push(cell);
    }

    return cells;
  }

  /* ================================================================
     公开 API
     ================================================================ */
  return {
    /** 主入口：生成 42 格日历数据 */
    computeCalendarCells: computeCalendarCells,

    /** 单日阶段计算（可用于查询指定日期的阶段） */
    computeDayPhase: computeDayPhase,

    /** 日期工具（方便其他模块共用） */
    fmtDate: fmtDate,
    sameDay: sameDay,
    addDays: addDays,
    daysDiff: daysDiff,
    d0: d0,
    today: today,
  };
})();

/* === dist/js/render-calendar.js === */
"use strict";

/* ================================================================
   render-calendar.js — 日历视图渲染器

   接收 CalendarCell[] 数组 → 构建完整 DOM 日历网格。
   - 不做任何阶段判断（阶段由 CycleEngine 提供）
   - 调用全局数据模块填充节日、农历、记号等辅助信息
   - 保持与现有交互完全一致（点击、双击、触摸、键盘）
   ================================================================ */

var CalendarRenderer = (function () {

  /* ================================================================
     症状图标常量（与 app.js MOOD_EMOJIS 保持一致）
     ================================================================ */
  var SYMPTOM_EMOJIS = {
    cramps: '\u{1F623}', mood: '\u{1F60A}', flow: '\u{1F4A7}',
    headache: '\u{1F915}', fatigue: '\u{1F634}', cravings: '\u{1F36B}',
  };

  /* ================================================================
     日期格渲染
     ================================================================ */

  /**
   * 构建一个日期格 DOM 元素
   * @param {Object} cell   - CalendarCell（来自 CycleEngine）
   * @param {Object} opts   - 渲染选项
   * @param {Object} opts.pred       - predict() 结果
   * @param {string} opts.activeProfile - 当前用户
   * @param {string} opts.lang       - 当前语言
   * @param {Object} opts.sharedDiaryIdx - { dateKey: true } 日记索引
   * @param {Object} opts.sharedDiaryData - 完整日记数据
   * @param {Object} opts.symptoms   - state.symptoms
   * @returns {HTMLElement}
   */
  function buildDayCell(cell, opts) {
    var d = cell.date;
    var key = cell.dateKey;
    var isInMonth = cell.isCurrentMonth;
    var el = document.createElement('div');
    el.className = 'day';

    /* ---- 基础样式 ---- */
    if (!isInMonth) el.classList.add('other-month');
    if (cell.isToday) {
      el.classList.add('today');
      el.setAttribute('aria-current', 'date');
    }

    /* ---- 阶段类 ---- */
    if (cell.phase) {
      el.classList.add(cell.phase);
    }
    if (cell.periodStart && cell.phase === 'period-on') {
      el.classList.add('recorded');
    }

    /* ---- 纪念日 / 生日 / 特别日期 ---- */
    var annType = typeof isAnniversary === 'function' ? isAnniversary(d) : 0;
    if (annType > 0) el.classList.add('anniversary');

    if (typeof getBirthday === 'function' && getBirthday(d)) {
      el.classList.add('birthday');
    }

    if (typeof getSpecialDate === 'function') {
      var special = getSpecialDate(d);
      if (special) {
        var spIcon = document.createElement('span');
        spIcon.className = 'special-date-icon';
        spIcon.textContent = special.icon;
        spIcon.title = opts.activeProfile === 'barry' ? special.title_zh : special.title_sr;
        el.appendChild(spIcon);
        if (special.type === 'firstmeet') el.classList.add('first-meet');
        if (special.type === 'monthly') el.classList.add('monthly-anni');
      }
    }

    /* ---- 键盘导航 ---- */
    if (isInMonth) {
      el.setAttribute('tabindex', '0');
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          el.click();
        }
      });
    }

    /* ---- 日期数字 ---- */
    var daySpan = document.createElement('span');
    daySpan.className = 'day-num';
    daySpan.textContent = cell.dayNumber;
    el.appendChild(daySpan);

    /* ---- 周期第几天 ---- */
    if (cell.cycleDay !== null && isInMonth && !cell.phase) {
      var cdSpan = document.createElement('span');
      cdSpan.className = 'day-cycle-num';
      cdSpan.textContent = String(cell.cycleDay);
      el.appendChild(cdSpan);
    }

    /* ---- 农历 ---- */
    if (isInMonth && typeof Lunar !== 'undefined' && typeof getLunarCellText === 'function') {
      var lunarDayName = getLunarCellText(d);
      if (lunarDayName) {
        var cls = typeof getLunarCellClass === 'function' ? getLunarCellClass(d) : '';
        var lunarSpan = document.createElement('span');
        lunarSpan.className = 'lunar-date ' + cls;
        lunarSpan.textContent = lunarDayName;
        el.appendChild(lunarSpan);
      }
    }

    /* ---- ARIA ---- */
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', key);

    /* ---- 症状图标 ---- */
    var symptoms = (opts.symptoms && opts.symptoms[key]) || null;
    if (symptoms && !cell.phase) {
      var hasSymp = false;
      for (var sk in symptoms) {
        if (sk !== 'notes' && symptoms[sk] > 0) { hasSymp = true; break; }
      }
      if (hasSymp) {
        var miniDiv = document.createElement('div');
        miniDiv.className = 'day-symptoms';
        ['cramps', 'mood', 'flow', 'headache', 'fatigue', 'cravings'].forEach(function (sym) {
          if (symptoms[sym] && symptoms[sym] > 0) {
            var symEl = document.createElement('span');
            symEl.className = 'day-sym-icon';
            symEl.textContent = SYMPTOM_EMOJIS[sym] || sym;
            symEl.title = sym;
            miniDiv.appendChild(symEl);
          }
        });
        if (miniDiv.children.length > 0) el.appendChild(miniDiv);
      }
    }

    /* ---- 日记标记 ---- */
    var sdIdx = opts.sharedDiaryIdx || {};
    var sdData = opts.sharedDiaryData || {};
    if (sdIdx[key]) {
      var sdEntry = sdData[key] || {};
      var hasA = !!sdEntry.andjela;
      var hasB = !!sdEntry.barry;
      var diaryTooltip = '';
      if (hasA && hasB) {
        diaryTooltip = '\u{1F495} Oboje';
        var dotBoth = document.createElement('span');
        dotBoth.className = 'mini-dot gold';
        dotBoth.style.cssText = 'position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:5px;height:5px;border-radius:50%;background:var(--gold)';
        dotBoth.title = diaryTooltip;
        el.appendChild(dotBoth);
      } else if (hasA) {
        diaryTooltip = '\u{1F338} Anđela';
        var dotA = document.createElement('span');
        dotA.className = 'mini-dot';
        dotA.style.cssText = 'position:absolute;bottom:8px;left:calc(50% - 4px);width:4px;height:4px;border-radius:50%;background:#c45a6b;opacity:.7';
        dotA.title = diaryTooltip;
        el.appendChild(dotA);
      } else if (hasB) {
        diaryTooltip = '\u{1F466} Barry';
        var dotB = document.createElement('span');
        dotB.className = 'mini-dot';
        dotB.style.cssText = 'position:absolute;bottom:8px;left:calc(50% + 4px);width:4px;height:4px;border-radius:50%;background:#4A90D9;opacity:.7';
        dotB.title = diaryTooltip;
        el.appendChild(dotB);
      }
      if (isInMonth && diaryTooltip) {
        var previewText = '';
        try {
          var entryA = sdEntry.andjela;
          var entryB = sdEntry.barry;
          if (hasA && entryA) previewText += '\u{1F338} ' + (entryA.text || entryA.happy || '').substring(0, 40);
          if (hasB && entryB) previewText += (previewText ? ' | ' : '') + '\u{1F466} ' + (entryB.text || entryB.happy || '').substring(0, 40);
        } catch (e) { /* ignore */ }
        if (previewText) el.setAttribute('data-diary', previewText);
      }
    }

    /* ---- 日历记号（表情标记） ---- */
    if (typeof getCalendarSummary === 'function' && isInMonth) {
      var calSummary = getCalendarSummary(key);
      var hasMarkers = calSummary.andjela.length > 0 || calSummary.barry.length > 0;
      if (hasMarkers) {
        var markerRow = document.createElement('div');
        markerRow.className = 'day-marker-row';
        var allMarkers = calSummary.barry.concat(calSummary.andjela);
        for (var mi = 0; mi < Math.min(allMarkers.length, 3); mi++) {
          var mSpan = document.createElement('span');
          mSpan.className = 'cal-marker-emoji';
          mSpan.textContent = allMarkers[mi].emoji;
          mSpan.title = (allMarkers[mi].author === 'andjela' ? '\u{1F338} Anđela' : '\u{1F466} Barry') + ': ' + (allMarkers[mi].note || '');
          markerRow.appendChild(mSpan);
        }
        el.appendChild(markerRow);
      }
    }

    /* ---- 纪念日爱心 ---- */
    if (annType === 2 && !cell.phase) {
      var dotGold = document.createElement('span');
      dotGold.className = 'mini-dot gold';
      el.appendChild(dotGold);
    }

    /* ---- 节气 ---- */
    if (typeof getSolarTerm === 'function') {
      var solarTerm = getSolarTerm(key);
      if (solarTerm && isInMonth) {
        var stName = solarTerm.name[opts.lang] || (opts.lang ? solarTerm.name[opts.lang.split('-')[0]] : null) || solarTerm.name['sr'] || solarTerm.name['zh-CN'] || '';
        var stLabel = document.createElement('span');
        stLabel.className = 'solar-term-label';
        stLabel.textContent = stName;
        stLabel.title = stName;
        el.appendChild(stLabel);
        el.classList.add('solar-term-day');
        if (!solarTerm.story && typeof ensureSolarTermData === 'function') {
          ensureSolarTermData();
        }
      }
    }

    /* ---- 节日图标 ---- */
    if (typeof getHoliday === 'function') {
      var holidays = getHoliday(key);
      holidays.forEach(function (h) {
        var icon = document.createElement('span');
        icon.className = 'holiday-icon holiday-' + h.country;
        icon.textContent = h.icon || (h.country === 'cn' ? '\u{1F389}' : '\u{1F1F7}\u{1F1F8}');
        icon.title = h.name[opts.lang] || (opts.lang ? h.name[opts.lang.split('-')[0]] : null) || h.name['sr'] || h.name['zh-CN'] || '';
        el.appendChild(icon);
      });
    }

    /* ---- 双击检测 & 弹窗 ---- */
    if (isInMonth) {
      (function () {
        var tapTimer = null;
        el.addEventListener('click', function (e) {
          if (tapTimer) {
            clearTimeout(tapTimer);
            tapTimer = null;
            if (typeof togglePeriodRecord === 'function') togglePeriodRecord(d);
            el.classList.add('celebrate');
            setTimeout(function () { el.classList.remove('celebrate'); }, 500);
            e.preventDefault();
          } else {
            tapTimer = setTimeout(function () {
              tapTimer = null;
              if (typeof openModal === 'function') openModal(d, opts.pred);
            }, 280);
          }
        });

        var touchCount = 0;
        var touchTimer = null;
        el.addEventListener('touchend', function (e) {
          touchCount++;
          if (touchCount === 1) {
            touchTimer = setTimeout(function () { touchCount = 0; }, 350);
          } else if (touchCount === 2) {
            clearTimeout(touchTimer);
            touchCount = 0;
            if (tapTimer) {
              clearTimeout(tapTimer);
              tapTimer = null;
            }
            if (typeof togglePeriodRecord === 'function') togglePeriodRecord(d);
            e.preventDefault();
          }
        });
      })();
    }

    return el;
  }

  /* ================================================================
     主渲染入口
     ================================================================ */

  /**
   * 渲染日历网格
   *
   * @param {HTMLElement} grid          - daysGrid DOM 元素
   * @param {Object[]}    cells         - CalendarCell[]（来自 CycleEngine）
   * @param {Object}      opts          - 选项
   * @param {boolean}     opts.isWeekView    - 是否周视图
   * @param {number}      opts.CalState.month     - 当前视图月
   * @param {number}      opts.CalState.year      - 当前视图年
   * @param {Object}      opts.pred          - predict() 结果
   * @param {string}      opts.activeProfile - 当前用户
   * @param {string}      opts.lang          - 当前语言
   * @param {Object}      [opts.symptoms]    - state.symptoms（可选）
   * @returns {void}
   */
  function render(grid, cells, opts) {
    if (!grid || !cells) return;
    opts = opts || {};
    var isWeekView = !!opts.isWeekView;
    var lang = opts.lang || 'sr';
    var activeProfile = opts.activeProfile || 'andjela';
    var pred = opts.pred || { futurePeriods: [] };

    /* ---- 预测图例 ---- */
    var plEl = document.getElementById('predLegend');
    if (plEl) {
      var futureCount = pred.futurePeriods ? pred.futurePeriods.length : 0;
      if (futureCount > 0 && !isWeekView) {
        plEl.style.display = '';
        if (typeof t === 'function') plEl.textContent = t('calendarPredLegend');
      } else {
        plEl.style.display = 'none';
      }
    }

    /* ---- 日记索引 ---- */
    var sharedDiaryData = {};
    var sharedDiaryIdx = {};
    try {
      var raw = localStorage.getItem('shared-diary');
      if (raw) {
        sharedDiaryData = JSON.parse(raw);
        Object.keys(sharedDiaryData).forEach(function (k) {
          if (sharedDiaryData[k] && (sharedDiaryData[k].barry || sharedDiaryData[k].andjela)) {
            sharedDiaryIdx[k] = true;
          }
        });
      }
    } catch (e) { /* ignore */ }

    /* ---- 症状数据 ---- */
    var symptoms = opts.symptoms || {};

    /* ---- 网格属性 ---- */
    grid.setAttribute('role', 'grid');
    if (typeof t === 'function') {
      grid.setAttribute('aria-label', t('calendarGridLabel') || 'Calendar');
    }
    grid.classList.toggle('week-view', isWeekView);

    /* ---- 构建 DOM 片段 ---- */
    var frag = document.createDocumentFragment();

    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];

      /* 周数格（月视图，每行第一个格子之前） */
      if (!isWeekView && i % 7 === 0 && i < cells.length) {
        var wkCell = document.createElement('div');
        wkCell.className = 'week-num';
        var wkDate = cell.date;
        var jan1 = new Date(wkDate.getFullYear(), 0, 1);
        var wkNum = Math.ceil(((wkDate - jan1) / 86400000 + jan1.getDay() + 1) / 7);
        wkCell.textContent = wkNum;
        wkCell.setAttribute('aria-hidden', 'true');
        frag.appendChild(wkCell);
      }

      /* 日期格 */
      var dayEl = buildDayCell(cell, {
        pred: pred,
        activeProfile: activeProfile,
        lang: lang,
        sharedDiaryIdx: sharedDiaryIdx,
        sharedDiaryData: sharedDiaryData,
        symptoms: symptoms,
      });

      frag.appendChild(dayEl);
    }

    grid.innerHTML = '';
    grid.appendChild(frag);
  }

  /* ================================================================
     公开 API
     ================================================================ */
  return {
    /** 主渲染入口 */
    render: render,
  };
})();

/* === dist/js/theme.js === */
"use strict";function applyTheme(e){theme=e,localStorage.setItem(profileKey("cycle-theme"),e),localStorage.setItem("cycle-theme",e),document.documentElement.setAttribute("data-theme",e);const t=document.getElementById("themeBtn");t&&(t.textContent="dark"===e?"☀️":"🌙");const a=document.getElementById("set-theme");a&&(a.value=e)}function switchTheme(e){applyTheme(e)}function getFestivalTheme(){const e=new Date,t=e.getFullYear()+"-"+String(e.getMonth()+1).padStart(2,"0")+"-"+String(e.getDate()).padStart(2,"0"),a={2025:{s:"2025-01-29",m:"2025-10-06"},2026:{s:"2026-02-17",m:"2026-09-25"},2027:{s:"2027-02-06",m:"2027-10-14"},2028:{s:"2028-01-26",m:"2028-10-03"},2029:{s:"2029-02-13",m:"2029-09-28"}}[e.getFullYear()];if(a){const n=new Date(a.s+"T00:00:00"),s=new Date(n);if(s.setDate(s.getDate()+3),e>=n&&e<=s)return"festival-spring";if(t===a.m)return"festival-midautumn"}const n=String(e.getMonth()+1).padStart(2,"0")+"-"+String(e.getDate()).padStart(2,"0");if("01-07"===n)return"festival-orthodoxmas";if("01-27"===n)return"festival-sava";if("02-14"===n)return"festival-valentine";if("05-09"===n)return"festival-victory";const s={2025:"2025-04-20",2026:"2026-04-12",2027:"2027-05-02",2028:"2028-04-16",2029:"2029-04-08"}[e.getFullYear()];return s&&t===s?"festival-easter":"01-01"===n?"festival-newyear":""}function applyFestivalTheme(){const e=getFestivalTheme();document.body.classList.forEach(function(e){e.startsWith("festival-")&&document.body.classList.remove(e)}),e&&document.body.classList.add(e);const t=document.getElementById("festivalDecorations");t&&t.remove();let a=null,n=0;if("festival-spring"===e?(a=["🏮","🧧","🎆","🧨"],n=12):"festival-midautumn"===e?(a=["🌕","🐰","🥮","🏮"],n=10):"festival-valentine"===e?(a=["💕","💖","💗","🌸","❤️"],n=15):"festival-newyear"===e?(a=["🎆","✨","🎉","🌟"],n=12):"festival-sava"===e?(a=["📚","✝️","🇷🇸","🕊️"],n=8):"festival-orthodoxmas"===e?(a=["❄️","🎄","✝️","🕯️"],n=8):"festival-easter"===e?(a=["🥚","🐇","🌸","🕊️"],n=10):"festival-victory"===e&&(a=["🕊️","🌺","🎖️","✨"],n=8),!a)return;const s=document.createElement("div");s.className="festival-decorations",s.id="festivalDecorations";for(let e=0;e<n;e++){const t=document.createElement("span");t.className="festival-deco",t.textContent=a[e%a.length],t.style.left=2+94*Math.random()+"%",t.style.fontSize=.8+1.8*Math.random()+"rem",t.style.animationDelay=6*Math.random()+"s",t.style.animationDuration=4+8*Math.random()+"s",s.appendChild(t)}document.body.appendChild(s)}function applySeasonalDecor(){if(getFestivalTheme())return;const e=(new Date).getMonth();let t=null,a=0;e>=2&&e<=4?(t=["🌸","🌷","💮","🌿"],a=8):e>=5&&e<=7?(t=["☀️","🌻","🍦","🦋"],a=6):e>=8&&e<=10?(t=["🍂","🍁","🎃","🌾"],a=8):(t=["❄️","⛄","🧣","✨"],a=6);const n=document.getElementById("seasonalDecorations");n&&n.remove();const s=document.createElement("div");s.className="seasonal-deco",s.id="seasonalDecorations";for(let e=0;e<a;e++){const a=document.createElement("span");a.textContent=t[e%t.length],a.style.left=3+94*Math.random()+"%",a.style.fontSize=.7+1.2*Math.random()+"rem",a.style.animationDelay=8*Math.random()+"s",s.appendChild(a)}document.body.appendChild(s)}
/* === dist/js/translate.js === */
"use strict";const _transCache=new Map,_TRANS_CACHE_MAX=500;function _transCacheSet(t,e){if(_transCache.size>=500){const t=_transCache.keys().next().value;_transCache.delete(t)}_transCache.set(t,e)}async function translateText(t,e,n){if(!t||e===n||t.length<2)return t;const a=e+"|"+n+"|"+t;if(_transCache.has(a))return _transCache.get(a);let s=null;try{const a=await fetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl="+e+"&tl="+n+"&dt=t&q="+encodeURIComponent(t)),o=await a.json();if(o&&o[0]){const e=o[0].map(function(t){return t[0]}).join("");e&&e!==t&&(s=e)}}catch(t){"undefined"!=typeof DEBUG&&DEBUG&&console.warn("[translate] Google API failed:",t.message)}if(!s)try{const a=e+"|"+n,o=await fetch("https://api.mymemory.translated.net/get?q="+encodeURIComponent(t)+"&langpair="+a),r=await o.json();r.responseData&&r.responseData.translatedText&&r.responseData.translatedText!==t&&(s=r.responseData.translatedText)}catch(t){"undefined"!=typeof DEBUG&&DEBUG&&console.warn("[translate] MyMemory failed:",t.message)}if(!s)try{const a=await fetch("https://translate.argosopentech.com/translate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({q:t,source:e,target:n,format:"text"})}),o=await a.json();o.translatedText&&o.translatedText!==t&&(s=o.translatedText)}catch(t){"undefined"!=typeof DEBUG&&DEBUG&&console.warn("[translate] LibreTranslate failed:",t.message)}return s?(_transCacheSet(a,s),s):null}async function translatePartnerEntries(){const t=document.getElementById("translateBtnSm");t&&(t.disabled=!0,t.textContent="⏳");const e="undefined"!=typeof lang&&"zh-CN"===lang?"zh-CN":"sr",n="undefined"!=typeof activeProfile&&"barry"===activeProfile?"sr":"zh-CN";if(e===n)return void(t&&(t.textContent="🌐",t.disabled=!1));const a=document.querySelectorAll('[id^="sdp-"]');let s=0;for(let t=0;t<a.length;t++){const o=a[t],r=o.getAttribute("data-original");if(r&&r.length>2){const t=await translateText(r,n,e);null===t?(o.textContent=r+" ["+("sr"===lang?"prevod nije uspeo":"en"===lang?"translation failed":"翻译失败")+"]",o.style.color="var(--text-muted)"):t&&t!==r&&(o.textContent=t,o.style.color="var(--teal)",o.style.fontWeight="500",s++)}}t&&(s>0?(t.textContent="✅",t.style.borderColor="var(--teal)",t.style.color="var(--teal)"):(t.textContent="⚠️",t.style.borderColor="#E53935",t.style.color="#E53935",t.disabled=!1,setTimeout(function(){t&&(t.textContent="🌐",t.style.borderColor="",t.style.color="",t.disabled=!1)},3e3)))}
/* === dist/js/auth.js === */
const AuthModule=function(){"use strict";const e={andjela:"8e614d39a1f1279958da1c9f7e8df51db4aabca8cc3a3e84f8c3dc5f88e1fcfb",barry:"286aee2ea4a5ba67539432dc5ea3865c3b204d3caaccb662995388d156a279cf"};let n=null,o=!1;function l(){const t=document.getElementById("loginPinInput"),l=t?t.value:"";let a;a="andjela"===n?document.getElementById("loginCardAndjela"):document.getElementById("loginCardBarry"),function(e){if(!e)return Promise.resolve("");try{const t=(new TextEncoder).encode(e);return crypto.subtle.digest("SHA-256",t).then(function(e){return Array.from(new Uint8Array(e)).map(function(e){return e.toString(16).padStart(2,"0")}).join("")})}catch(t){let n=0;for(let t=0;t<e.length;t++)n=(n<<5)-n+e.charCodeAt(t),n|=0;return Promise.resolve("fallback_"+Math.abs(n).toString(16))}}(l).then(function(l){if(l===e[n]){window.activeProfile=n,localStorage.setItem("cycle-active-profile",activeProfile),sessionStorage.setItem("cycle-logged-in","1"),o=!0;const e=document.getElementById("loginOverlay");e&&e.classList.add("hidden"),"function"==typeof bootApp&&bootApp()}else{a&&a.classList.add("shake");const e=document.getElementById("loginError");e&&(e.textContent="barry"===n?"PIN 不对，再试一次":"Pogrešan PIN — pokušaj ponovo"),t&&(t.value=""),setTimeout(function(){a&&a.classList.remove("shake")},500)}})}return{init:function(){applyTheme(localStorage.getItem("cycle-theme")||"light"),loadCalendarData(function(e){solarTermsCache=e&&e.solarTerms||[],localStorage.setItem("cycle-solarterms",JSON.stringify(solarTermsCache))});const e=sessionStorage.getItem("cycle-logged-in"),t=localStorage.getItem("cycle-active-profile");if(t&&"1"===e){window.activeProfile=t,o=!0;const e=document.getElementById("loginOverlay");e&&e.classList.add("hidden"),"function"==typeof bootApp&&bootApp().catch(function(e){"undefined"!=typeof DEBUG&&DEBUG&&console.error("bootApp failed:",e)})}else{localStorage.removeItem("cycle-active-profile");const e=document.getElementById("loginOverlay");e&&e.classList.remove("hidden")}},login:l,logout:function(){"undefined"!=typeof _syncInterval&&null!==_syncInterval&&(clearInterval(_syncInterval),_syncInterval=null),o=!1,n=null,window.activeProfile=null,state={records:[],symptoms:{},moods:{},diaries:{},settings:{cycleLength:28,periodLength:7,manualOverride:!1},_migrated:!0},localStorage.removeItem("cycle-active-profile"),localStorage.removeItem("cycle-login-day"),window.lang="sr";const e=document.getElementById("loginOverlay");e&&e.classList.remove("hidden");const t=document.getElementById("loginPinArea");t&&t.classList.remove("show");const l=document.getElementById("loginCardAndjela"),a=document.getElementById("loginCardBarry");l&&l.classList.remove("selected"),a&&a.classList.remove("selected");const c=document.getElementById("loginSwitchHint");c&&(c.textContent="👈 Izaberi svoj profil i unesi PIN");const i=document.getElementById("loginPinInput");i&&(i.value="");const r=document.getElementById("loginError");r&&(r.textContent="");const s=document.getElementById("loginPinBtn");s&&(s.textContent="🔓 Prijavi se");const d=document.getElementById("lc-hint-a"),m=document.getElementById("lc-hint-b");d&&(d.textContent="Dodirni za prijavu"),m&&(m.textContent="Dodirni za prijavu")},selectLogin:function(e){n=e;const o="barry"===e?"zh-CN":"sr";window.lang=o,document.querySelectorAll(".lang-btn").forEach(function(e){e.classList.toggle("active",e.dataset.lang===window.lang)});const l=document.getElementById("loginCardAndjela"),a=document.getElementById("loginCardBarry");l&&l.classList.toggle("selected","andjela"===e),a&&a.classList.toggle("selected","barry"===e);const c=document.getElementById("loginPinBtn");c&&(c.textContent=t("authPinBtn"));const i=document.getElementById("lc-hint-a"),r=document.getElementById("lc-hint-b"),s=t("authTapHint");i&&(i.textContent=s),r&&(r.textContent=s);const d=document.getElementById("loginPinArea");d&&d.classList.add("show");const m=document.getElementById("loginPinInput");m&&(m.value="",setTimeout(function(){m.focus()},300));const g=document.getElementById("loginError");g&&(g.textContent="");const u=document.getElementById("loginSwitchHint");u&&(u.textContent=t("authSwitchHint")),function(){const e=document.getElementById("loginOverlay");if(!e)return;const t=["💕","💖","💗","💝","🌸","✨","🌷","🕊️"];for(let n=0;n<15;n++)(function(n){setTimeout(function(){const o=document.createElement("span");if(o.textContent=t[n%t.length],o.style.cssText="position:fixed;pointer-events:none;z-index:1001;font-size:"+(.8+1.5*Math.random())+"rem;left:"+(5+90*Math.random())+"%;top:"+(80+15*Math.random())+"%;animation:loginHeartFloat "+(2+3*Math.random())+"s ease-out forwards",o.style.opacity="0.7",e.appendChild(o),setTimeout(function(){o.parentNode&&o.remove()},3500),!document.getElementById("loginHeartKeyframes")){const e=document.createElement("style");e.id="loginHeartKeyframes",e.textContent="@keyframes loginHeartFloat{0%{opacity:1;transform:translateY(0) scale(1) rotate(0deg)}100%{opacity:0;transform:translateY(-120px) scale(.3) rotate(45deg)}}",document.head.appendChild(e)}},120*n)})(n)}()},verifyLogin:l,isLoggedIn:function(){return o},getSelectedProfile:function(){return n},getPinHashes:function(){return e}}}(),selectLogin=AuthModule.selectLogin,verifyLogin=AuthModule.verifyLogin;
/* === dist/js/weather.js === */
const WeatherModule=function(){"use strict";const e=[{zh:"不管多远，我的心和你在一起。",sr:"Bez obzira na udaljenost, moje srce je s tobom."},{zh:"7000公里，但思念没有距离。",sr:"7.000 kilometara, ali čežnja nema udaljenost."},{zh:"你是我早上醒来的第一个念头。",sr:"Ti si moja prva misao kad se probudim."},{zh:"同一个太阳，同一份爱。",sr:"Jedno sunce, jedna ljubav."},{zh:"每次抬头看天空，我知道你也在这片天空下。",sr:"Svaki put kad pogledam u nebo, znam da si i ti pod istim nebom."},{zh:"从北京到贝尔格莱德，我的心跳只为你。",sr:"Od Pekinga do Beograda, moje srce kuca samo za tebe."},{zh:"你是我跨越山海的理由。",sr:"Ti si razlog zbog kog prelazim planine i mora."},{zh:"爱不是距离除以时间，爱是心与心的零距离。",sr:"Ljubav nije udaljenost podeljena vremenom, ljubav je nulta udaljenost između srca."},{zh:"有人问我想去哪里，我说：去有你的地方。",sr:"Pitaju me gde želim da idem, ja kažem: tamo gde si ti."},{zh:"世界上最美的距离，是你和我之间的距离。",sr:"Najlepša udaljenost na svetu je ona između tebe i mene."},{zh:"今天也想你，比昨天多一点，比明天少一点。",sr:"I danas mislim na tebe, malo više nego juče, malo manje nego sutra."},{zh:"你是我此生最美的风景。",sr:"Ti si najlepši prizor u mom životu."}];function t(){try{return localStorage.getItem("cycle-ann-love")||"2026-05-07"}catch(e){return"2026-05-07"}}function n(){try{return localStorage.getItem("cycle-ann-met")||"2026-03-19"}catch(e){return"2026-03-19"}}function a(e,t){return Math.round((t.getTime()-e.getTime())/864e5)}function o(){const e=new Date;return new Date(e.getFullYear(),e.getMonth(),e.getDate())}function i(){const t=(new Date).getDate()%e.length;return e[t]}function r(){return function(e){try{return JSON.parse(e)}catch(e){return{}}}(localStorage.getItem("shared-sun-counter"))}function s(){const e=document.getElementById("sunCounter");if(!e)return;const t=r().count||0;e.innerHTML=t>0?"☀️ "+L(t+" dan zajedničkog sunca ❤️","Day "+t+" of shared sun ❤️","共同仰望太阳的第 "+t+" 天 ❤️"):"❤️ "+L("Klikni ovde da započneš brojanje","Click here to start counting","点击此处开始计数")}function u(e){return e<=3?"☀️":e<=48?"⛅":e<=57?"🌧️":e<=67?"🌨️":e<=77?"🌫️":e<=86?"❄️":"⛈️"}function d(){const e=(new Date).toLocaleString("sr-Latn",{timeZone:"Asia/Shanghai",hour:"2-digit",minute:"2-digit",hour12:!1}),t=(new Date).toLocaleString("sr-Latn",{timeZone:"Europe/Belgrade",hour:"2-digit",minute:"2-digit",hour12:!1}),n=document.getElementById("timeBj");n&&(n.textContent=e);const a=document.getElementById("timeKi");a&&(a.textContent=t);const o=document.getElementById("timeDiff");if(o){let n=parseInt(e)-parseInt(t);n<0&&(n+=24),o.textContent=L("razlika ","time diff ","时差 ")+n+"h"}}function l(e){const t=document.getElementById("weatherCard");if(!e)return t.style.display="",void(t.innerHTML='<div style="text-align:center;padding:20px"><div class="skeleton" style="width:200px;height:20px;margin:8px auto;border-radius:8px"></div><div class="skeleton" style="width:140px;height:14px;margin:6px auto;border-radius:6px"></div><div style="font-size:.6rem;color:var(--text-muted);margin-top:8px">'+L("Učitavam vreme...","Loading weather...","加载天气中...")+"</div></div>");t.style.display="";const n="sr"===lang?"🏙 Peking·Čaojang":"en"===lang?"🏙 Beijing·Chaoyang":"🏙 北京·朝阳",a=("sr"===lang||lang,"🏡 Kikinda"),o="sr"===lang?"Vlažnost":"en"===lang?"Humidity":"湿度";document.getElementById("weatherBj").innerHTML='<div style="font-size:.65rem;color:var(--text-muted)">'+n+'</div><div style="font-size:1.5rem;font-weight:700">'+Math.round(e.bj.temperature_2m)+'°</div><div style="font-size:1.2rem">'+u(e.bj.weather_code)+'</div><div style="font-size:.6rem;color:var(--text-muted)">'+o+" "+e.bj.relative_humidity_2m+"%</div>",document.getElementById("weatherKi").innerHTML='<div style="font-size:.65rem;color:var(--text-muted)">'+a+'</div><div style="font-size:1.5rem;font-weight:700">'+Math.round(e.ki.temperature_2m)+'°</div><div style="font-size:1.2rem">'+u(e.ki.weather_code)+'</div><div style="font-size:.6rem;color:var(--text-muted)">'+o+" "+e.ki.relative_humidity_2m+"%</div>";const r=[],l=e.bj.weather_code,c=e.ki.weather_code,m=l<=3&&c<=3||l>=45&&c>=45||l>=71&&c>=71;m&&l<=3?r.push({txt:"sr"===lang?"Sunce sija i u Pekingu i u Kikindi ☀️ — isto sunce greje oba naša srca.":"en"===lang?"The sun shines on both Beijing and Kikinda ☀️ — the same sun warms both our hearts.":"北京和Kikinda阳光普照 ☀️ — 同一个太阳温暖我们的心。",barry:"sr"===lang?"Barry kaže: Kad pogledaš u sunce, seti se — ja gledam u isto to sunce ovde u Pekingu. 7.000 kilometara, jedno sunce. ♥":"en"===lang?"Barry says: When you look at the sun, remember — I'm looking at the same sun in Beijing. 7,000 km, one sun. ♥":"Barry说：当你看着太阳，记住——我在北京也看着同一轮太阳。7000公里，同一个太阳。♥"}):m&&c>=45&&c<=67?r.push({txt:"sr"===lang?"Kiša pada i na Vojvodinu i na Peking 🌧️ — iste kapi, dva različita sveta.":"en"===lang?"Rain falls on both Vojvodina and Beijing 🌧️ — same drops, two different worlds.":"雨水落在Vojvodina和北京 🌧️ — 同样的雨滴，两个不同的世界。",barry:"sr"===lang?"Barry kaže: Dok kiša pada po tvojoj Vojvodini, ja slušam kišu u Pekingu i mislim na tebe. Kiša spaja sve. 🌧️♥":"en"===lang?"Barry says: While rain falls on your Vojvodina, I listen to the rain in Beijing and think of you. Rain connects everything. 🌧️♥":"Barry说：雨落在你的Vojvodina，我在北京听着雨声想你。雨水连接一切。🌧️♥"}):r.push({txt:"sr"===lang?"Različito nebo, isto srce 🌍 — od Pekinga do Kikinde, od Dunava do Jangcea.":"en"===lang?"Different skies, one heart 🌍 — from Beijing to Kikinda, from Danube to Yangtze.":"不同的天空，同一颗心 🌍 — 从北京到Kikinda，从多瑙河到长江。",barry:"sr"===lang?"Barry kaže: Dunav teče kroz tvoj grad, Jangce kroz moj. Dve reke, jedna ljubav koja teče između nas. ♥":"en"===lang?"Barry says: The Danube flows through your town, the Yangtze through mine. Two rivers, one love flowing between us. ♥":"Barry说：多瑙河流过你的城市，长江流过我的。两条河流，一份在我们之间流淌的爱。♥"}),r.push({txt:"sr"===lang?"Sa Dunava na Jangce — ljubav teče kao reka 🌊":"en"===lang?"From Danube to Yangtze — love flows like a river 🌊":"从多瑙河到长江 — 爱如河流 🌊",barry:"sr"===lang?"Od ravnice do Pekinga, od šljivovice do čaja — naša priča je most između dva sveta.":"en"===lang?"From plains to Beijing, from rakija to tea — our story bridges two worlds.":"从平原到北京，从李子酒到茶——我们的故事连接两个世界。"});const g=r[Math.floor(Math.random()*r.length)];document.getElementById("weatherLove").innerHTML='<div style="font-style:italic;margin-bottom:4px">"'+g.txt+'"</div><div style="font-size:.62rem;opacity:.82;line-height:1.5">'+g.barry+"</div>",document.getElementById("weatherLove").style.display="",d();const h=i(),y=document.getElementById("dailyLoveMsg");y&&(y.textContent="💌 "+(0===(lang||"").indexOf("zh")?h.zh:0===(lang||"").indexOf("en")?h.en:h.sr)),s();const v=document.getElementById("weatherNightHint");if(v){const e=(new Date).toLocaleString("en-US",{timeZone:"Europe/Belgrade",hour:"numeric",hour12:!1});parseInt(e)>=22||parseInt(e)<=5?(v.style.display="",v.textContent=L("🌙 Kod tebe je kasno - vreme za spavanje, Anđela 🛏️","🌙 Kikinda现在是深夜，Angie该休息了","🌙 It's late in Kikinda — time for sleep, Anđela 🛏️")):v.style.display="none"}const f=document.getElementById("weatherBridge");if(f){const t=Math.round(e.bj.temperature_2m),n=Math.round(e.ki.temperature_2m),a=Math.abs(t-n),o=a<=3?"sr"===lang?"Ista toplina 🌡️♥":"en"===lang?"Same warmth 🌡️♥":"同样温度 🌡️♥":"sr"===lang?"Razlika "+a+"° 🌡️":"en"===lang?a+"° apart 🌡️":"温差 "+a+"° 🌡️",i=L("Dunav","Danube","多瑙河"),r=L("Jangce","Yangtze","长江");f.innerHTML="🌉  "+i+" → "+r+"<br>Kikinda "+n+"° ↔ "+t+"° "+L("Peking","Beijing","北京")+"<br>"+o}}return{init:function(){setInterval(d,6e4)},fetchWeather:function(){const e=localStorage.getItem("cycle-weather");if(e)try{l(JSON.parse(e))}catch(e){"undefined"!=typeof DEBUG&&DEBUG&&console.warn("[weather] Bad cached data")}if(e)try{const t=JSON.parse(e);if(Date.now()-t.t<216e5)return}catch(e){"undefined"!=typeof DEBUG&&DEBUG&&console.warn("[weather] Bad cache")}const t=new AbortController,n=setTimeout(function(){t.abort()},8e3);try{const e=fetch("https://api.open-meteo.com/v1/forecast?latitude=39.92&longitude=116.44&current=temperature_2m,relative_humidity_2m,weather_code&daily=sunrise,sunset&timezone=Asia/Shanghai",{signal:t.signal}).then(function(e){return e.json()}).catch(function(){return null}),a=fetch("https://api.open-meteo.com/v1/forecast?latitude=45.83&longitude=20.47&current=temperature_2m,relative_humidity_2m,weather_code&daily=sunrise,sunset&timezone=Europe/Belgrade",{signal:t.signal}).then(function(e){return e.json()}).catch(function(){return null});Promise.all([e,a]).then(function(e){if(clearTimeout(n),!e[0]&&!e[1])return;const t=e[0]?e[0].current:null;t&&e[0].daily&&(t.sunrise=e[0].daily.sunrise[0],t.sunset=e[0].daily.sunset[0]);const a=e[1]?e[1].current:null;a&&e[1].daily&&(a.sunrise=e[1].daily.sunrise[0],a.sunset=e[1].daily.sunset[0]);const o={bj:t,ki:a,t:Date.now()};localStorage.setItem("cycle-weather",JSON.stringify(o)),l(o)}).catch(function(){})}catch(e){"undefined"!=typeof DEBUG&&DEBUG&&console.warn("[weather] Forecast fetch failed")}},renderWeather:l,weatherIcon:u,clickSunCounter:function(){const e=r(),t=(new Date).toISOString().slice(0,10);e.lastDate!==t?(e.count=(e.count||0)+1,e.lastDate=t,localStorage.setItem("shared-sun-counter",JSON.stringify(e)),"function"==typeof pushAllSharedData&&pushAllSharedData(),s(),toast("☀️ "+L("Dan "+e.count+" zajedničkog sunca!","Day "+e.count+" of shared sun!","共同仰望太阳的第"+e.count+"天！"))):toast("❤️ "+L("Već si kliknuo/la danas!","Already clicked today!","今天已经点过了！"))},renderSunCounter:s,updateLoveCounter:function(){const e=document.getElementById("titleLoveCounter");if(!e||!t())return;const i=a(new Date(t()),o());i>=0&&(e.textContent="♥ "+i+("sr"===lang?" dana zajedno":"en"===lang?" days together":" 天在一起"));const r=document.getElementById("love-days-content");if(!r)return;const s=[];if(n()){const e=a(new Date(n()),o());e>=0&&s.push('<div style="font-size:.85rem"><span style="color:var(--gold)">✨</span> '+e+("sr"===lang?" dana od prvog susreta":"en"===lang?" days since we met":" 天前初次相遇")+"</div>")}if(t()){const e=a(new Date(t()),o());e>=0&&s.push('<div style="font-size:1.2rem;font-weight:700;color:var(--love)">♥ '+e+("sr"===lang?" dana zajedno":"en"===lang?" days together":" 天在一起")+"</div>")}r.innerHTML=s.join('<div style="height:4px"></div>');const u=document.getElementById("love-days-title");u&&(u.textContent="sr"===lang?"💕 Dani zajedno":"en"===lang?"💕 Our Days":"💕 我们的日子")},randomThinkingOfYou:function(){if("undefined"!=typeof activeProfile&&"andjela"!==activeProfile)return;if(Math.random()>.18)return;const e="sr"===lang?["Upravo sam pomislio na tebe ♥","Nadam se da se osećaš dobro danas ✨","Tvoj osmeh mi je najdraža st let 🌸","Mislim na tebe... uvek 💫","Barry je upravo pomislio na tebe 💝"]:"en"===lang?["Just thought of you ♥","Hope you are feeling good today ✨","Your smile is my favorite thing 🌸","Thinking of you... always 💫","Barry was just thinking of you 💝"]:["刚刚在想你 ♥","希望你今天心情好 ✨","你的笑容是我最喜欢的 🌸","一直在想你 💫","Barry 刚刚想到了你 💝"],t=e[Math.floor(Math.random()*e.length)];"function"==typeof toast&&setTimeout(function(){toast(t)},3e3)},getTodaysLoveMessage:i,updateWeatherTimes:d,DAILY_LOVE_MESSAGES:e}}(),fetchWeather=WeatherModule.fetchWeather,renderWeather=WeatherModule.renderWeather,weatherIcon=WeatherModule.weatherIcon,clickSunCounter=WeatherModule.clickSunCounter,renderSunCounter=WeatherModule.renderSunCounter,updateWeatherTimes=WeatherModule.updateWeatherTimes,getTodaysLoveMessage=WeatherModule.getTodaysLoveMessage,DAILY_LOVE_MESSAGES=WeatherModule.DAILY_LOVE_MESSAGES;
/* === dist/js/sync.js === */
const SyncModule = (function () {
  var REPO = 'darkheaven1419-debug/cycle-tracker';
  var STATE_FILE = 'shared-state.json';
  var _lastError = null; // 持久化同步错误状态

  // ── 自动拉取定时器（句柄可清理，页面隐藏时暂停） ──
  var _autoPullTimer = null;
  var _visHandler = null;

  function _startAutoPull() {
    _stopAutoPull();
    _autoPullTimer = setInterval(function () {
      if (typeof getGitHubToken === 'function' && getGitHubToken()) {
        console.log('[同步] 定时拉取...');
        pull();
      }
    }, 60000);
    // 页面隐藏时暂停拉取，恢复可见后重启 —— 避免多开/后台重复请求
    if (!_visHandler && typeof document !== 'undefined') {
      _visHandler = function () {
        if (document.hidden) _stopAutoPull();
        else _startAutoPull();
      };
      document.addEventListener('visibilitychange', _visHandler);
    }
  }

  function _stopAutoPull() {
    if (_autoPullTimer) { clearInterval(_autoPullTimer); _autoPullTimer = null; }
    // 同时移除可见性监听，避免登出后页面切回可见时被 _visHandler 重新拉起轮询
    if (_visHandler && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', _visHandler);
      _visHandler = null;
    }
  }

  // ── 同步错误状态管理 ──
  function _setError(msg) {
    _lastError = msg;
    console.warn('[同步] 错误:', msg);
  }
  function _clearError() {
    _lastError = null;
  }

  // ── 工具函数 ──
  function getJSON(key, fallback) {
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (e) { return fallback; }
  }

  /** 本地日期键（YYYY-MM-DD），用于记录去重 —— 与项目 sameDay/fmtDate 的本地日期语义一致 */
  function _dkey(d) {
    var dt = (d instanceof Date) ? d : new Date(d);
    return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
  }

  // ── 收集全部本地状态 ──
  function collect() {
    var ce = getJSON('shared-cycle-data', null);
    if (!ce || !ce.records) ce = getJSON('cycle-data-v6-andjela', null);
    return {
      diary: getJSON('shared-diary', {}),
      cycleInfo: ce,
      symptoms: getJSON('shared-symptoms', null),
      gratitude: getJSON('shared-gratitude', []),
      hug: getJSON('shared-hug', null),
      songs: {
        barry: getJSON('shared-song-barry', null),
        andjela: getJSON('shared-song-andjela', null)
      },
      sleep: getJSON('barry-sleep', null),
      checkins: {
        barry: getJSON('shared-checkin-barry', {}),
        andjela: getJSON('shared-checkin-andjela', {})
      },
      learningProgress: getJSON('shared-learning-progress', {}),
      learningComments: getJSON('shared-learning-comments', []),
      learningPoints: getJSON('shared-learning-points', {}),
      voiceData: getJSON('shared-voice-data', {}),
      sunCounter: getJSON('shared-sun-counter', {}),
      knowme: getJSON('shared-knowme', {}),
      calendarMarkers: getJSON('shared-calendar-markers', {}),
      updated: Date.now()
    };
  }

  // ── 日记合并：保留双方所有日记条目 ──
  function mergeDiary(local, remote) {
    if (!remote || typeof remote !== 'object') return local || {};
    if (!local || typeof local !== 'object') return remote || {};
    var result = {};
    // 先拷贝所有本地条目
    for (var dk in local) { if (local.hasOwnProperty(dk)) result[dk] = JSON.parse(JSON.stringify(local[dk])); }
    // 合并远程条目（仅补缺失的，本地已有的不覆盖）
    var added = 0;
    for (var dk2 in remote) {
      if (remote.hasOwnProperty(dk2)) {
        if (!result[dk2]) { result[dk2] = {}; }
        for (var uk in remote[dk2]) {
          if (remote[dk2].hasOwnProperty(uk) && !result[dk2][uk]) {
            result[dk2][uk] = JSON.parse(JSON.stringify(remote[dk2][uk]));
            added++;
          }
        }
      }
    }
    if (added > 0) console.log('[同步] 日记合并新增 ' + added + ' 条外来条目');
    return result;
  }

  // ── 应用远程状态到本地 ──
  function apply(state) {
    if (!state) return;

    // 日记：合并而非覆盖
    if (state.diary) {
      var localDiary = getJSON('shared-diary', {});
      var merged = mergeDiary(localDiary, state.diary);
      localStorage.setItem('shared-diary', JSON.stringify(merged));
      console.log('[同步] 日记合并完成 本地=' + Object.keys(localDiary).length + ' 远程=' + Object.keys(state.diary).length + ' 合并后=' + Object.keys(merged).length);
    }

    // 周期数据：合并（保留本地未推送的经期记录，避免拉取覆盖离线标记）
    if (state.cycleInfo) {
      var mergedInfo = JSON.parse(JSON.stringify(state.cycleInfo));
      var localCE = getJSON('shared-cycle-data', null);
      if (!localCE || !localCE.records) localCE = getJSON('cycle-data-v6-andjela', null);
      if (localCE && localCE.records && Array.isArray(localCE.records) && localCE.records.length) {
        var seen = {};
        (mergedInfo.records || []).forEach(function (r) { seen[_dkey(r)] = 1; });
        localCE.records.forEach(function (r) {
          var k = _dkey(r);
          if (!seen[k]) { seen[k] = 1; (mergedInfo.records = mergedInfo.records || []).push(r); }
        });
        mergedInfo.records.sort(function (a, b) { return new Date(a) - new Date(b); });
      }
      // periodEnds：本地有而远程没有的保留
      var localEnds = (localCE && localCE.periodEnds) || {};
      var mergedEnds = mergedInfo.periodEnds || {};
      for (var pk in localEnds) {
        if (localEnds.hasOwnProperty(pk) && !mergedEnds[pk]) mergedEnds[pk] = localEnds[pk];
      }
      mergedInfo.periodEnds = mergedEnds;

      localStorage.setItem('shared-cycle-data', JSON.stringify(mergedInfo));
      localStorage.setItem('cycle-data-v6-andjela', JSON.stringify(mergedInfo));
      if (typeof window.state !== 'undefined') {
        window.state.records = (mergedInfo.records || []).map(function (r) { return new Date(r); });
        window.state.periodEnds = mergedInfo.periodEnds || {};
        window.state.symptoms = mergedInfo.symptoms || {};
        window.state.settings = mergedInfo.settings || { cycleLength: 28, periodLength: 7 };
      }
    }

    // 其他数据：直接替换
    if (state.symptoms) localStorage.setItem('shared-symptoms', JSON.stringify(state.symptoms));
    if (state.gratitude) localStorage.setItem('shared-gratitude', JSON.stringify(state.gratitude));
    if (state.hug) localStorage.setItem('shared-hug', JSON.stringify(state.hug));
    if (state.sleep) localStorage.setItem('barry-sleep', JSON.stringify(state.sleep));
    if (state.songs) {
      if (state.songs.barry) localStorage.setItem('shared-song-barry', JSON.stringify(state.songs.barry));
      if (state.songs.andjela) localStorage.setItem('shared-song-andjela', JSON.stringify(state.songs.andjela));
    }
    if (state.checkins) {
      if (state.checkins.barry) localStorage.setItem('shared-checkin-barry', JSON.stringify(state.checkins.barry));
      if (state.checkins.andjela) localStorage.setItem('shared-checkin-andjela', JSON.stringify(state.checkins.andjela));
    }
    if (state.learningProgress) localStorage.setItem('shared-learning-progress', JSON.stringify(state.learningProgress));
    if (state.learningComments) localStorage.setItem('shared-learning-comments', JSON.stringify(state.learningComments));
    if (state.learningPoints) localStorage.setItem('shared-learning-points', JSON.stringify(state.learningPoints));
    if (state.voiceData) localStorage.setItem('shared-voice-data', JSON.stringify(state.voiceData));
    if (state.sunCounter) localStorage.setItem('shared-sun-counter', JSON.stringify(state.sunCounter));
    if (state.knowme) localStorage.setItem('shared-knowme', JSON.stringify(state.knowme));
    if (state.calendarMarkers) {
      localStorage.setItem('shared-calendar-markers', JSON.stringify(state.calendarMarkers));
      if (typeof renderCalendar === 'function') renderCalendar();
    }
  }

  // ── 三语错误提示 ──
  function _syncMsg(key) {
    var L = window.lang || 'sr';
    var msgs = {
      token401: { 'zh-CN': '⚠️ Token 无效，请在设置中重新输入', en: '⚠️ Token invalid, please re-enter in Settings', sr: '⚠️ Token nevažeći, unesite ponovo u Podešavanjima' },
      netError: { 'zh-CN': '⚠️ 同步失败，请检查网络后重试', en: '⚠️ Sync failed, check network and retry', sr: '⚠️ Sinhronizacija nije uspela — proverite mrežu' },
      retryFail: { 'zh-CN': '⚠️ 同步失败，请在设置中手动同步', en: '⚠️ Sync failed, please sync manually in Settings', sr: '⚠️ Sinhronizacija nije uspela — pokušajte ručno u Podešavanjima' },
    };
    return msgs[key] ? (msgs[key][L] || msgs[key]['sr']) : '';
  }
  function _syncToast(msg) {
    if (typeof toast === 'function') toast(msg);
    var _sb = document.getElementById('syncStatusBadge');
    if (_sb) { _sb.textContent = '🔴 ' + msg.replace(/^[^ ]* /, ''); _sb.style.color = '#E53935'; }
  }

  // ── 推送数据到 GitHub ──
  async function push(n) {
    n = n || 0;
    var token = typeof getGitHubToken === 'function' ? getGitHubToken() : '';
    if (!token) { console.log('[同步] 无 Token，跳过推送'); return; }

    var _localBefore = getJSON('shared-diary', {});
    console.log('[同步] 开始推送 (重试#' + n + ') — 本地日记数:', Object.keys(_localBefore).length);

    // ── 步骤 1：拉取远程（一次 GET 取得 sha 并合并日记，消除重复请求与 TOCTOU 窗口） ──
    var sha = null;
    try {
      var headers = { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github.v3+json' };
      var resp = await fetch('https://api.github.com/repos/' + REPO + '/contents/' + STATE_FILE, { headers: headers, cache: 'no-store' });
      if (resp.status === 401) {
        _syncToast(_syncMsg('token401'));
        return;
      }
      if (resp.ok) {
        var data = await resp.json();
        sha = data.sha;
        var remoteState = JSON.parse(decodeURIComponent(escape(atob(data.content))));
        if (remoteState && remoteState.diary) {
          var remoteCount = Object.keys(remoteState.diary).length;
          var localDiary = getJSON('shared-diary', {});
          var merged = mergeDiary(localDiary, remoteState.diary);
          localStorage.setItem('shared-diary', JSON.stringify(merged));
          console.log('[同步] 推送前合并远程 ✓ 本地=' + Object.keys(localDiary).length + ' 远程=' + remoteCount + ' 合并后=' + Object.keys(merged).length);
        }
      }
    } catch (e) {
      console.warn('[同步] 推送前拉取失败，继续推送:', e.message);
    }

    // ── 步骤 2：收集本地状态（含已合并的日记） ──
    var state = collect();

    // ── 步骤 3（已并入步骤 1）：直接复用步骤 1 取得的 sha ──
    var authHeaders = { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' };

    // ── 步骤 4：PUT ──
    var body = {
      message: '🔄 Sync shared state',
      content: btoa(unescape(encodeURIComponent(JSON.stringify(state, null, 2))))
    };
    if (sha) body.sha = sha;

    try {
      var putResp = await fetch('https://api.github.com/repos/' + REPO + '/contents/' + STATE_FILE, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(body)
      });

      if (putResp.ok) {
        localStorage.setItem('shared-last-sync', Date.now());
        _clearError();
        console.log('[同步] 推送成功 ✓');
        updateBadge();
      } else if (putResp.status === 401) {
        _setError(_syncMsg('token401'));
        _syncToast(_syncMsg('token401'));
      } else if (putResp.status === 409 || putResp.status === 422) {
        console.warn('[同步] 冲突 (' + putResp.status + ')，拉取最新后重试...');
        await pull();
        if (n < 2) { setTimeout(function () { push(n + 1); }, 3000); }
        else { _syncToast(_syncMsg('retryFail')); }
      } else {
        console.error('[同步] 意外响应:', putResp.status, putResp.statusText);
        if (n < 2) { setTimeout(function () { push(n + 1); }, 3000); }
        else { _setError(_syncMsg('retryFail')); _syncToast(_syncMsg('retryFail')); }
      }
    } catch (e) {
      console.error('[同步] 网络错误:', e.message);
      _setError(_syncMsg('netError'));
      if (n < 2) { setTimeout(function () { push(n + 1); }, 3000); }
      else { _syncToast(_syncMsg('retryFail')); }
    }
  }

  // ── 从 GitHub 拉取数据 ──
  async function pull(n) {
    n = n || 0;
    var token = typeof getGitHubToken === 'function' ? getGitHubToken() : '';
    if (!token) { console.log('[同步] 无 Token，跳过拉取'); return; }

    var _localBefore = getJSON('shared-diary', {});
    console.log('[同步] 开始拉取 (重试#' + n + ') — 本地日记数:', Object.keys(_localBefore).length);
    var headers = { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github.v3+json' };

    try {
      var resp = await fetch('https://api.github.com/repos/' + REPO + '/contents/' + STATE_FILE, { headers: headers, cache: 'no-store' });
      if (resp.status === 401) {
        _setError(_syncMsg('token401'));
        _syncToast(_syncMsg('token401'));
        return;
      }
      if (!resp.ok) {
        console.warn('[同步] 拉取失败，状态码:', resp.status);
        if (n < 2) { setTimeout(function () { pull(n + 1); }, 3000); return; }
        _setError(_syncMsg('retryFail'));
        _syncToast(_syncMsg('retryFail'));
        return;
      }

      var data = await resp.json();
      var state = JSON.parse(decodeURIComponent(escape(atob(data.content))));

      var diaryCount = state.diary ? Object.keys(state.diary).length : 0;
      console.log('[同步] 拉取成功 ✓ 远程=', diaryCount, '本地=', Object.keys(_localBefore).length);

      // 应用数据到本地（含日记合并）
      apply(state);

      // 对比合并前后的日记数
      var _localAfter = getJSON('shared-diary', {});
      var _afterCount = Object.keys(_localAfter).length;
      var _newCount = _afterCount - Object.keys(_localBefore).length;
      if (_newCount > 0) console.log('[同步] 日记新增:', _newCount, '(合计:', _afterCount, ')');
      else console.log('[同步] 日记无新增 (合计:', _afterCount, ')');

      _clearError();
      localStorage.setItem('shared-last-sync', Date.now());
      console.log('[同步] 已应用 ✓');

      // 触发重渲染
      if (typeof invalidateSDCache === 'function') invalidateSDCache();
      if (typeof renderHug === 'function') renderHug();
      if (typeof renderGratitude === 'function') renderGratitude();
      if (typeof renderSong === 'function') renderSong();
      if (typeof renderCheckin === 'function') renderCheckin();
      if (typeof renderKnowMe === 'function') renderKnowMe();
      if (typeof activeProfile !== 'undefined' && activeProfile === 'barry') {
        if (typeof renderBarrySymptomView === 'function') renderBarrySymptomView();
        if (typeof renderCalendar === 'function') renderCalendar();
        if (typeof renderTips === 'function') renderTips();
      }
      if (typeof renderSharedDiary === 'function') renderSharedDiary();
      if (typeof renderDateStrip === 'function') renderDateStrip();
      updateBadge();
    } catch (e) {
      console.error('[同步] 拉取异常:', e.message);
      _setError(_syncMsg('netError'));
      if (n < 2) { setTimeout(function () { pull(n + 1); }, 3000); }
      else { _syncToast(_syncMsg('retryFail')); }
    }
  }

  // ── 同步状态徽章 ──
  function updateBadge() {
    var hasToken = !!getGitHubToken();
    var lastSync = localStorage.getItem('shared-last-sync');
    var el = document.getElementById('syncStatusBadge');
    if (!el) return;
    // 优先显示持久化错误状态
    if (_lastError) {
      el.textContent = '🔴 ' + _lastError.replace(/^[^ ]* /, '');
      el.style.color = '#E53935';
      return;
    }
    if (!hasToken) {
      el.textContent = '⚪ ' + (window.lang === 'sr' ? 'Nije podešeno' : window.lang === 'en' ? 'Not configured' : '未设置');
      el.style.color = 'var(--text-muted)';
      return;
    }
    if (lastSync) {
      var seconds = Math.floor((Date.now() - parseInt(lastSync)) / 1000);
      var ago;
      if (seconds < 30) ago = window.lang === 'sr' ? 'upravo' : window.lang === 'en' ? 'just now' : '刚刚';
      else if (seconds < 120) ago = (window.lang === 'sr' ? 'pre 1 min' : window.lang === 'en' ? '1 min ago' : '1分钟前');
      else if (seconds < 3600) ago = Math.floor(seconds / 60) + (window.lang === 'sr' ? ' min' : window.lang === 'en' ? ' min ago' : '分钟前');
      else ago = Math.floor(seconds / 3600) + (window.lang === 'sr' ? ' h' : window.lang === 'en' ? ' h ago' : '小时前');
      el.textContent = '🟢 ' + (window.lang === 'sr' ? 'Sinhronizovano ' : 'Synced ') + ago;
      el.style.color = 'var(--sage)';
    } else {
      el.textContent = '🟡 ' + (window.lang === 'sr' ? 'Čeka se sinhronizacija...' : window.lang === 'en' ? 'Waiting for sync...' : '等待同步...');
      el.style.color = 'var(--gold)';
    }
  }

  // ── 公开 API ──
  return {
    init: function () {
      // Hook saveSharedDiaryData: 保存日记后自动推送
      var orig = window.saveSharedDiaryData;
      if (typeof orig === 'function') {
        window.saveSharedDiaryData = function (data) {
          orig(data);
          push();
        };
      }

      // 定时自动拉取（每 60 秒，句柄可清理）
      _startAutoPull();

      updateBadge();
      console.log('[同步] 模块已初始化 ✓');
    },
    push: push,
    pull: pull,
    collect: collect,
    apply: apply,
    updateBadge: updateBadge,
    stopAutoPull: _stopAutoPull,
    startAutoPull: _startAutoPull
  };
})();

// ── 暴露全局接口 ──
updateSyncStatusBadge = SyncModule.updateBadge;
pushAllSharedData = SyncModule.push;
pullAllSharedData = SyncModule.pull;
collectSharedState = SyncModule.collect;
applySharedState = SyncModule.apply;

/* === dist/js/social.js === */
const SocialModule=function(){"use strict";const e=864e5,t={sr:[{icon:"💬",text:"Ako ti nešto smeta — reci mu. Barry ne ume da čita misli. Iskren razgovor je temelj."},{icon:"💝",text:"Kad uradi nešto lepo za tebe — reci mu. Muškarcima treba potvrda isto koliko i ženama."},{icon:"🫂",text:"Svađate se? Seti se: vi ste tim protiv problema, a ne jedno protiv drugog."},{icon:"🌸",text:"Tvoja osećanja su važeća. Ne moraš da ih pravdavaš. Samo ih izrazi."},{icon:"💌",text:'Male stvari su velike. Poruka "mislim na tebe" znači više nego što misliš.'},{icon:"🎯",text:'Reci mu šta ti treba. "Volela bih da me sad saslušaš" je jasnije od ćutanja.'},{icon:"🤗",text:"Fizička bliskost nije samo seks. Držanje za ruke, zagrljaj, dodir — sve to gradi vezu."},{icon:"🌙",text:'Kad si umorna i emotivna — reci mu to. "Danas mi je težak dan" je dovoljno.'},{icon:"💪",text:"Vi ste različite osobe i to je u redu. Ne morate sve da radite isto."},{icon:"🔥",text:'Strast se gradi svaki dan — flert, nežne reči, iznenađenja. Ne čekaj "posebne prilike".'}],"zh-CN":[{icon:"💬",text:"如果有什么不满——直接告诉他。Barry 不会读心术。真诚沟通是感情的基础。"},{icon:"💝",text:"他做了什么让你开心的事？告诉他。男生也需要被肯定。"},{icon:"🫂",text:"吵架时记住：你们 vs 问题，而不是你 vs 他。"},{icon:"🌸",text:"你的感受是真实的。不需要为它辩护。只需要表达出来。"},{icon:"💌",text:'小事最重要。"想你了"三个字的力量比你想象的大得多。'},{icon:"🎯",text:'告诉他你需要什么。"我现在想让你听我说"比沉默更有效。'},{icon:"🤗",text:"亲密不只是性。牵手、拥抱、触摸——这些都在建立连接。"},{icon:"🌙",text:'累了或情绪不好的时候——告诉他。"今天好累"就够了。'},{icon:"💪",text:"你们是不同的个体，这完全没问题。不需要一切都一样。"},{icon:"🔥",text:'激情是每天积累的——调情、温柔的话、小惊喜。别等"特别的日子"。'}],en:[{icon:"💬",text:"If something bothers you — tell him. Barry can't read minds. Honest talk is the foundation."},{icon:"💝",text:"He did something nice? Tell him. Men need affirmation as much as women do."},{icon:"🫂",text:"In a fight: you are a team against the problem, not against each other."},{icon:"🌸",text:"Your feelings are valid. You don't need to justify them. Just express them."},{icon:"💌",text:'A "thinking of you" message means more than you think.'},{icon:"🎯",text:'Tell him what you need. "I\'d love for you to just listen right now" works better than silence.'},{icon:"🤗",text:"Physical closeness isn't just sex. Holding hands, hugging, touch — it all builds connection."},{icon:"🌙",text:"When you're tired or emotional — just tell him. \"Today's a hard day\" is enough."},{icon:"💪",text:"You're different people and that's OK. You don't have to do everything the same way."},{icon:"🔥",text:'Passion builds every day — flirting, sweet words, surprises. Don\'t wait for "special occasions".'}]};window.REL_TIPS=t;const a={sr:[{q:"Kako se osećaš u vezi ove nedelje?",opts:["😍 Sjajno","😊 Dobro","😐 Ok","😞 Loše"]},{q:"Da li smo dovoljno komunicirali?",opts:["💬 Da, odlično","👍 Uglavnom","🤔 Moglo bi bolje","👎 Ne baš"]},{q:"Šta bi voleo/la da poboljšamo sledeće nedelje?",opts:["💏 Više zajedničkog vremena","💬 Bolja komunikacija","🔥 Više romantike","🤝 Više podrške"]}],"zh-CN":[{q:"这周的感情状态怎么样？",opts:["😍 很棒","😊 不错","😐 一般","😞 不太好"]},{q:"我们这周的沟通足够吗？",opts:["💬 很好","👍 还行","🤔 可以更好","👎 不太够"]},{q:"下周希望我们哪方面做得更好？",opts:["💏 更多陪伴","💬 更好交流","🔥 更多浪漫","🤝 更多支持"]}],en:[{q:"How do you feel about this week together?",opts:["😍 Amazing","😊 Good","😐 OK","😞 Not great"]},{q:"Did we communicate enough?",opts:["💬 Yes, great","👍 Mostly","🤔 Could improve","👎 Not really"]},{q:"What would you like more of next week?",opts:["💏 More time together","💬 Better talks","🔥 More romance","🤝 More support"]}]},n=[{key:"fav_city",q:{sr:"Koji je omiljeni grad tvog/tvoje partnera?",zh:"对方最喜欢的城市是哪里？",en:"What is your partner's favorite city?"}},{key:"first_date_color",q:{sr:"Šta je tvoj/tvoja partner/ka nosio/la na prvom sastanku?",zh:"第一次约会对方穿什么颜色的衣服？",en:"What color did your partner wear on your first date?"}},{key:"dream_trip",q:{sr:"Gde bi tvoj/tvoja partner/ka najradije putovao/la?",zh:"对方最想去的旅行目的地是哪里？",en:"Where does your partner dream of traveling to?"}},{key:"comfort_food",q:{sr:"Koja je omiljena hrana tvog/tvoje partnera za utehu?",zh:"对方心情不好时最爱吃什么？",en:"What comfort food does your partner reach for?"}},{key:"hidden_talent",q:{sr:"Koji skriveni talenat ima tvoj/tvoja partner/ka?",zh:"对方有什么隐藏的才艺？",en:"What hidden talent does your partner have?"}},{key:"childhood_dream",q:{sr:"Šta je tvoj/tvoja partner/ka želeo/la da bude kao dete?",zh:"对方小时候的梦想职业是什么？",en:"What did your partner dream of becoming as a child?"}},{key:"pet_peeve",q:{sr:"Šta tvog/tvoju partnera/ku najviše nervira?",zh:"对方最讨厌的事情是什么？",en:"What annoys your partner the most?"}},{key:"perfect_day",q:{sr:"Kako izgleda savršen dan za tvog/tvoju partnera/ku?",zh:"对方心目中的完美一天是怎样的？",en:"What does your partner's perfect day look like?"}},{key:"music_taste",q:{sr:"Koja je omiljena pesma tvog/tvoje partnera trenutno?",zh:"对方最近单曲循环的歌是什么？",en:"What song is your partner playing on repeat lately?"}},{key:"love_language",q:{sr:"Koji je glavni jezik ljubavi tvog/tvoje partnera?",zh:"对方最重要的爱的语言是什么？",en:"What is your partner's primary love language?"}},{key:"smell_memory",q:{sr:"Koji miris podseća tvog/tvoju partnera/ku na vas?",zh:"什么味道会让对方想起你？",en:"What scent reminds your partner of you?"}},{key:"future_5years",q:{sr:"Gde tvoj/tvoja partner/ka vidi sebe za 5 godina?",zh:"对方觉得五年后的自己会在哪里？",en:"Where does your partner see themselves in 5 years?"}},{key:"best_quality",q:{sr:"Šta tvoj/tvoja partner/ka najviše ceni kod sebe?",zh:"对方最欣赏自己的哪个品质？",en:"What quality does your partner admire most in themselves?"}},{key:"favorite_memory",q:{sr:"Koje je omiljeno zajedničko sećanje tvog/tvoje partnera?",zh:"对方最喜欢你们在一起时的哪个回忆？",en:"What is your partner's favorite shared memory with you?"}},{key:"morning_routine",q:{sr:"Kako tvoj/tvoja partner/ka započinje jutro?",zh:"对方早上起来做的第一件事是什么？",en:"What is the first thing your partner does in the morning?"}}];function o(e){const t=["💕","💖","💗","💝","✨","💫"];for(let a=0;a<8;a++)(function(a){setTimeout(function(){const n=document.createElement("span");n.className="floating-heart",n.textContent=t[a%t.length],n.style.left=20+60*Math.random()+"%",n.style.bottom="20px",e.appendChild(n),setTimeout(function(){n.parentNode&&n.remove()},1300)},80*a)})(a)}function r(){const e=loadSharedDiaryData(),t=new Date;let a=0;for(let n=0;n<365;n++){const o=new Date(t);o.setDate(o.getDate()-n);const r=e[fmtDate(o)];if(!(r&&r.barry&&r.barry.hug&&r.andjela&&r.andjela.hug))break;a++}return a}function i(){try{const t=JSON.parse(localStorage.getItem("shared-hug"));return t?Date.now()-t.time>e?(localStorage.removeItem("shared-hug"),null):t.from===activeProfile?null:t:null}catch(e){return null}}function s(){const e=i(),t=document.getElementById("hugContent"),a=document.getElementById("hug-title");if(!a)return;a.textContent="sr"===lang?"🤗 Virtuelni zagrljaj":"en"===lang?"🤗 Virtual Hug":"🤗 隔空拥抱";const n=fmtDate(new Date),s=parseInt(sessionStorage.getItem("hug-count-"+n)||"0"),l=2-s,d=r();if(e){const a="andjela"===e.from?"🌸 Anđela":"👦 Barry",n=new Date(e.time),r=String(n.getHours()).padStart(2,"0")+":"+String(n.getMinutes()).padStart(2,"0");let i='<div class="hug-received">';d>1&&(i+='<div class="hug-streak-badge">🔥 '+("sr"===lang?d+" dana zaredom!":"en"===lang?d+"-day streak!":"连续 "+d+" 天！")+"</div>"),i+='<span class="hug-icon-wrap"><span class="hug-icon">🤗</span></span>',i+='<div class="hug-text">'+a+" "+("sr"===lang?"te zagrlio/la! 💫":"en"===lang?"hugged you! 💫":"抱了你！💫")+"</div>",i+='<div class="hug-time">'+r+"</div>",i+='<button class="hug-back-btn" onclick="sendHug(true)" id="hugBackBtn">💝 '+("sr"===lang?"Uzvrati zagrljaj":"en"===lang?"Hug back":"回抱一个")+"</button>",i+='<div><button class="hug-dismiss" onclick="dismissHug()">'+("sr"===lang?"✕ zatvori":"en"===lang?"✕ dismiss":"✕ 关闭")+"</button></div>",i+="</div>",t.innerHTML=i;const s=document.getElementById("hugCard");s&&o(s)}else if(s>0){let e="";for(let t=0;t<2;t++)e+='<span class="hh-heart'+(t>=l?" used":"")+'">'+(t<s?"❤️":"🤍")+"</span>";let a='<div class="hug-sent-state">';a+='<div class="hug-hearts-row">'+e+"</div>",a+='<span class="hss-icon">📬</span>',a+='<div class="hss-text">'+("sr"===lang?"Zagrljaj poslat! Čekam odgovor... 💌":"en"===lang?"Hug sent! Waiting for response... 💌":"拥抱已发送！等待回应... 💌")+"</div>",a+='<button class="hug-back-btn" onclick="sendHug()" style="margin-top:8px">🤗 '+("sr"===lang?"Pošalji još jedan ("+l+")":"en"===lang?"Send another ("+l+")":"再抱一次 ("+l+")")+"</button>",a+="</div>",t.innerHTML=a}else{const e="sr"===lang?"Pošalji zagrljaj":"en"===lang?"Send a Hug":"发送拥抱";let a="";d>1&&(a+='<div style="text-align:center"><div class="hug-streak-badge">🔥 '+("sr"===lang?d+" dana zaredom!":"en"===lang?d+"-day streak!":"连续 "+d+" 天！")+"</div></div>"),a+='<button class="hug-btn" onclick="sendHug()" id="hugSendBtn">🤗 '+e+"</button>",t.innerHTML=a}}let l=null;function d(){const e=document.getElementById("grat-title"),t=document.getElementById("gratInput"),a=document.getElementById("gratList");if(!e||!t||!a)return;e.textContent="sr"===lang?"💝 Zid zahvalnosti":"en"===lang?"💝 Gratitude Wall":"💝 感恩便签",t.placeholder="sr"===lang?"Hvala ti za...":"en"===lang?"Thank you for...":"谢谢你...";const n=JSON.parse(localStorage.getItem("shared-gratitude")||"[]");0!==n.length?a.innerHTML=n.slice(-5).reverse().map(function(e,t){const a="andjela"===e.from?"🌸":"👦",n="andjela"===e.from?"sr":"sr"===lang?"zh-CN":"sr",o=e.from!==("andjela"===activeProfile?"andjela":"barry")?' <button onclick="translateGrat('+t+')" style="font-size:.55rem;padding:1px 6px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);cursor:pointer" title="'+n+'">🌐</button>':"";return'<div class="gratitude-item"><span class="gratitude-heart">'+a+'</span><span id="grat-txt-'+t+'">'+esc(e.text)+"</span>"+o+"</div>"}).join(""):a.innerHTML=""}function g(e){return JSON.parse(localStorage.getItem("shared-checkin-"+e)||"{}")}function c(){const e=(new Date).getDay();if(0!==e&&6!==e)return void(document.getElementById("checkinCard").style.display="none");document.getElementById("checkinCard").style.display="",document.getElementById("checkin-title").textContent="sr"===lang?"🎯 Nedeljni pregled":"en"===lang?"🎯 Weekly Check-in":"🎯 每周感情体检";const t=a[lang]||a.sr,n=g(activeProfile),o="andjela"===activeProfile?"barry":"andjela",r=g(o),i="andjela"===o?"🌸 Anđela":"👦 Barry";let s=t.map(function(e,t){const a=n[t]||"",o=r[t]||"",s=e.opts.map(function(e){return'<span class="cq-opt'+(a===e?" picked":"")+'" onclick="saveCheckinAnswer('+t+",'"+e.replace(/'/g,"\\'")+"')\">"+e+"</span>"}).join(""),l=o?'<div style="font-size:.62rem;color:var(--gold);margin-top:4px">'+i+": "+o+"</div>":"";return'<div class="checkin-q"><div class="cq-label"><span>'+e.q+'</span></div><div class="cq-options">'+s+"</div>"+l+"</div>"}).join("");0===Object.keys(n).length&&0===Object.keys(r).length&&(s+='<div style="text-align:center;font-size:.68rem;color:var(--text-muted);margin-top:8px">'+("sr"===lang?"Odgovori na pitanja — partner će videti tvoje odgovore ✨":"en"===lang?"Answer the questions — your partner will see your answers ✨":"回答问题——伴侣会看到你的答案 ✨")+"</div>"),document.getElementById("checkinContent").innerHTML=s}function u(e){return safeParse(localStorage.getItem("shared-song-"+e),null)}function m(){const e=document.getElementById("song-title");if(!e)return;e.textContent="sr"===lang?"🎵 Naša pesma":"en"===lang?"🎵 Our Song":"🎵 我们的歌";const t=u(activeProfile),a="andjela"===activeProfile?"barry":"andjela",n=u(a),o="andjela"===a?"🌸 Anđela":"👦 Barry";let r="";r+=t?'<div style="margin-bottom:10px"><span style="font-size:.62rem;color:var(--text-muted)">'+("sr"===lang?"Moja pesma":"en"===lang?"My song":"我的歌")+'</span><div class="song-title">🎶 '+t.title+"</div>"+(t.note?'<div class="song-note">'+t.note+"</div>":"")+"</div>":'<div style="margin-bottom:10px"><input id="songInputTitle" placeholder="'+("sr"===lang?"Naziv pesme...":"en"===lang?"Song title...":"歌名...")+'" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:12px;font-size:.74rem;font-family:var(--font);background:var(--card);color:var(--text);margin-bottom:6px"><input id="songInputNote" placeholder="'+("sr"===lang?"Zašto baš ova pesma?":"en"===lang?"Why this song?":"为什么是这首歌？")+'" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:12px;font-size:.74rem;font-family:var(--font);background:var(--card);color:var(--text);margin-bottom:6px"><button class="btn btn-primary" onclick="saveMySong()" style="width:100%;font-size:.7rem;padding:8px">🎵 '+("sr"===lang?"Sačuvaj":"en"===lang?"Save":"保存")+"</button></div>",n&&(r+='<div style="padding-top:8px;border-top:1px solid var(--border)"><span style="font-size:.62rem;color:var(--text-muted)">'+o+" "+("sr"===lang?"pesma":"en"===lang?"song":"的歌")+'</span><div class="song-title">🎶 '+esc(n.title)+"</div>"+(n.note?'<div class="song-note">'+esc(n.note)+"</div>":"")+"</div>"),document.getElementById("songContent").innerHTML=r||'<span class="song-icon">🎶</span><div class="song-note">'+("sr"===lang?"Postavite pesme koje vas podsećaju jedno na drugo":"en"===lang?"Set songs that remind you of each other":"设置让你们想到彼此的歌")+"</div>"}function v(){return safeParse(localStorage.getItem("shared-knowme"),{})}function p(e){localStorage.setItem("shared-knowme",JSON.stringify(e))}function h(){if(!document.getElementById("knowMeCard"))return;document.getElementById("knowMe-title").textContent="sr"===lang?"💭 Da li me poznaješ?":"en"===lang?"💭 Do You Know Me?":"💭 你了解我吗？";const e=Math.floor(Date.now()/864e5)%n.length,t=n[e],a=t.q[lang]||t.q.sr,o=fmtDate(today()),r=v()[o]||{},i=r[activeProfile],s="andjela"===activeProfile?"barry":"andjela",l=r[s],d="andjela"===s?"🌹 Anđela":"👦 Barry",g="andjela"===activeProfile?"🌹 Anđela":"👦 Barry";let c="";c+='<div style="font-size:.78rem;color:var(--love);font-weight:600;margin-bottom:12px;text-align:center;line-height:1.4">'+a+"</div>",c+=i?'<div style="background:var(--rose-light);border-radius:12px;padding:10px 14px;margin-bottom:8px"><span style="font-size:.62rem;color:var(--text-muted)">'+g+" "+("sr"===lang?"odgovor":"en"===lang?" answer":"的回答")+'</span><div style="font-size:.8rem;color:var(--text);margin-top:4px">'+esc(i.answer)+"</div></div>":'<div style="margin-bottom:10px"><textarea id="knowMeInput" placeholder="'+("sr"===lang?"Tvoj odgovor...":"en"===lang?"Your answer...":"你的答案...")+'" style="width:100%;border:1px solid var(--border);border-radius:12px;padding:10px 12px;font-size:.74rem;font-family:var(--font);background:var(--card);color:var(--text);resize:none;min-height:44px" maxlength="120"></textarea><button class="btn btn-primary" onclick="saveKnowMeAnswer()" style="width:100%;font-size:.7rem;padding:8px;margin-top:6px">💭 '+("sr"===lang?"Odgovori":"en"===lang?"Answer":"回答")+"</button></div>",l?(c+='<div style="padding-top:8px;border-top:1px solid var(--border);margin-top:4px"><span style="font-size:.62rem;color:var(--teal);font-weight:600">👀 '+d+("sr"===lang?" misli da je:":"en"===lang?" thinks it is:":"认为:")+'</span><div style="font-size:.82rem;color:var(--teal);margin-top:4px;font-style:italic;line-height:1.4">'+esc(l.answer)+"</div></div>",i&&l&&i.answer.trim().toLowerCase()===l.answer.trim().toLowerCase()&&(c+='<div style="text-align:center;margin-top:8px;font-size:1.5rem;animation:bounce-arrow .8s infinite">💞</div><div style="text-align:center;font-size:.7rem;color:var(--love);font-weight:600">'+("sr"===lang?"Savršeno se razumete! ✨":"en"===lang?"You two are perfectly in sync! ✨":"你们太有默契了！✨")+"</div>")):i&&(c+='<div style="text-align:center;padding:10px;color:var(--text-muted);font-size:.68rem;font-style:italic">⏳ '+("sr"===lang?"Čeka se odgovor tvog partnera...":"en"===lang?"Waiting for your partner to answer...":"等待对方回答...")+"</div>"),document.getElementById("knowMeContent").innerHTML=c}return{HUG_EXPIRY_MS:e,REL_TIPS:t,CHECKIN_QUESTIONS:a,KNOW_ME_QUESTIONS:n,spawnFloatingHearts:o,getHugStreak:r,sendHug:function(e){const t=fmtDate(new Date);let a=parseInt(localStorage.getItem("hug-count-"+t)||"0");if(a>=2)return void toast("sr"===lang?"Već si poslao/la 2 zagrljaja danas — probaj sutra! 🤗":"en"===lang?"You already sent 2 hugs today — try tomorrow! 🤗":"今天已经抱了2次——明天再来！🤗");a++,localStorage.setItem("hug-count-"+t,a);const n={from:activeProfile,time:Date.now()};localStorage.setItem("shared-hug",JSON.stringify(n));const r=loadSharedDiaryData();r[t]||(r[t]={}),r[t][activeProfile]||(r[t][activeProfile]={}),r[t][activeProfile].hug={time:Date.now()},saveSharedDiaryData(r);const i=document.getElementById("hugSendBtn");i&&(i.classList.add("sending"),setTimeout(function(){i.classList.remove("sending")},600));const l=document.getElementById("hugCard");l&&o(l),s();const d="barry"===activeProfile?"sr"===lang?"Poslao si joj zagrljaj!":"en"===lang?"Hug sent!":"拥抱已发送！":"sr"===lang?"Poslala si mu zagrljaj!":"en"===lang?"Hug sent!":"拥抱已发送！";toast("🤗 "+d+" ("+a+"/2)")},checkHug:i,dismissHug:function(){localStorage.removeItem("shared-hug"),s()},renderHug:s,addGratitude:function(){const e=document.getElementById("gratInput"),t=e.value.trim();if(!t)return;let a=JSON.parse(localStorage.getItem("shared-gratitude")||"[]");a.push({text:t,from:activeProfile,time:Date.now()}),a.length>20&&(a=a.slice(-20)),localStorage.setItem("shared-gratitude",JSON.stringify(a)),l=null,e.value="",d(),pushAllSharedData()},renderGratitude:d,translateGrat:function(e){l||(l=JSON.parse(localStorage.getItem("shared-gratitude")||"[]"));const t=l[e];if(!t)return;const a="andjela"===t.from?"sr":"sr"===lang?"zh-CN":"sr",n="sr"===lang?"sr":"zh-CN"===lang?"zh-CN":"en";a!==n&&translateText(t.text,a,n).then(function(t){const a=document.getElementById("grat-txt-"+e);a&&(a.textContent=t)})},saveCheckinAnswer:function(e,t){const a="shared-checkin-"+activeProfile,n=JSON.parse(localStorage.getItem(a)||"{}");n[e]=t,localStorage.setItem(a,JSON.stringify(n)),c(),pushAllSharedData()},getCheckinAnswers:g,renderCheckin:c,saveMySong:function(){const e=document.getElementById("songInputTitle").value.trim();if(!e)return void toast("sr"===lang?"Unesi naziv pesme 🎵":"en"===lang?"Enter a song title 🎵":"请输入歌名 🎵");const t={title:e,note:document.getElementById("songInputNote").value.trim()||"",from:activeProfile,time:Date.now()};localStorage.setItem("shared-song-"+activeProfile,JSON.stringify(t)),m(),pushAllSharedData(),toast("🎵 "+("sr"===lang?"Pesma sačuvana!":"en"===lang?"Song saved!":"歌曲已保存！"))},loadSong:u,renderSong:m,getKnowMeData:v,saveKnowMeData:p,renderKnowMe:h,saveKnowMeAnswer:function(){const e=document.getElementById("knowMeInput");if(!e)return;const t=e.value.trim();if(!t)return;const a=fmtDate(today()),n=v();n[a]||(n[a]={}),n[a][activeProfile]={answer:t,time:Date.now()},p(n),pushAllSharedData(),h(),toast("💭 "+("sr"===lang?"Odgovor sačuvan!":"en"===lang?"Answer saved!":"答案已保存！"))},renderRelTips:function(){if("andjela"!==activeProfile)return void(document.getElementById("relTipCard").style.display="none");const e=t[lang]||t.sr,a=e[Math.floor(Math.random()*e.length)];document.getElementById("relTipIcon").textContent=a.icon,document.getElementById("relTipText").textContent=a.text,document.getElementById("relTipCard").style.display=""}}}();function spawnFloatingHearts(e){return SocialModule.spawnFloatingHearts(e)}
/* === dist/js/culture-cards.js === */
const CultureCardsModule=function(){"use strict";let e=[],t=0;const n={barry:{todayBadge:"今日推荐"},andjela:{todayBadge:"Daily"}},u={1:"中国最重要的传统节日。全家人聚在一起吃年夜饭，孩子们收到红包，鞭炮声驱散了旧年的晦气。每个农历年对应一种生肖动物。",2:"在中国几乎所有支付都用手机完成——微信支付或支付宝。现金已很少使用。来中国前安装微信并绑定银行卡，就能畅行无阻。",3:"中国人喜欢分享菜肴——所有菜放桌子中间大家一起夹。不要把筷子竖直插在米饭里。敬酒时杯子要低于长辈，以示尊重。",4:"中国人很少直呼其名。年长的叫阿姨叔叔，年轻的叫小姐姐小哥哥。商店里常能听到美女这个称呼。",5:"在中国通过手机App几乎什么都能订：外卖、生鲜、药品，甚至还能请人打扫卫生。配送通常30分钟内送到。",6:"红包在春节、婚礼和生日时赠送。红色代表好运。不要送空红包，接过来时用双手。微信数字红包也非常流行。",7:"家庭是中国社会的核心。子女成年后也常和父母住在一起。长辈意见非常重要。孝顺强调对父母的赡养和尊重。",8:"茶是中国文化的灵魂。共有六大茶类：绿、红、白、乌龙、黄、普洱。最著名的是龙井。别人倒茶时用手指轻叩桌面表示感谢——这叫叩指礼。",9:"中国人喜欢说吉祥话：恭喜发财、万事如意、身体健康。过年一定要说新年快乐。8是幸运数字，4则要避免。",10:"农历七月初七庆祝。传说牛郎织女只能在这一夜通过鹊桥相会。如今恋人们会享受浪漫晚餐互赠礼物。",11:"汉字起源于象形文字——山像山峰，水像流水。总数超五万，日常用两三千。书法是汉字书写的高级艺术。",12:"在中国老师备受尊敬。一日为师生终身为父。学生永远称呼老师，从不直呼其名。",13:"过年前彻底打扫房子扫走晦气，贴红色装饰，挂对联。孩子们守岁到半夜。第二天穿新红衣服。",14:"第二重要的传统节日，仅次于春节。吃月饼赏满月。象征家庭团圆——月圆人团圆。李白：举头望明月，低头思故乡。",15:"在中国看病先去社区卫生服务中心再去大医院。带上医保卡。挂号可通过微信小程序预约。大多数常见药在药店无需处方。",16:"在中国银行开户需要护照、签证和住址证明。最大银行是工商银行、中国银行和建设银行。手机银行极其发达。",17:"租房可通过中介或App如自如和贝壳。合同通常只有中文——最好找翻译。押金一般一个月房租。注意水电暖气是否包含。",18:"快递速度极快——上午下单傍晚送到。顺丰中通圆通遍布全国。包裹常放小区快递柜，24小时不取就收费。",19:"大多数城市用一卡通乘坐所有公交。在北京叫一卡通，地铁站就能买。上海等地用手机支付宝直接刷码乘车。",20:"微信支付和支付宝极其方便但要注重安全。不要扫描陌生人二维码。开启双重验证。手机就是你的一切财务。",21:"在大城市垃圾必须严格分类：湿垃圾、干垃圾、可回收物和有害垃圾。垃圾桶有颜色区分，街上有指导员。分错会罚款。",22:"中国人对排队很有耐心。但在菜市场和地铁里人流密集。在银行或医院记得取号等叫号。",23:"中国人请客主人一定抢着买单。客人带小礼物（水果茶叶）。说一句我来买单是基本礼貌。商务宴请座位有讲究。",24:"在中国送礼注意不送钟表（送钟像送终）、不送伞（散意味着分离）、不送刀剪。红包是最安全选择。收礼用双手，不当面打开。",25:"亲属称谓丰富。用哥哥弟弟姐姐妹妹区分不同年龄同辈。爸爸这边的奶奶叫奶奶爷爷叫爷爷，妈妈那边叫外婆外公。",26:"中国生肖共12种动物。传说玉皇大帝叫动物来比赛——最先过河的12只拥有自己的年份。老鼠骑着牛过河最后关头跳到了第一名。",27:"中国茶分六大类：绿茶不发酵清新、红茶全发酵浓郁、白茶微发酵淡雅、乌龙茶半发酵花香、黄茶稀有温和、普洱茶陈年醇厚。",28:"麻将是144张牌的社交游戏，遍布中国公园茶馆街头。摸牌弃牌组成3-4张组合加一对。哗啦哗啦洗牌声随处可见。",29:"每天傍晚全国各地数百万大妈到广场上跳集体舞——广场舞。虽有时吵但是她们锻炼社交的快乐方式。部分城市晚九点后禁止。",30:"中国拥有世界最大高铁网——时速350公里。北京到上海四个半小时。车票在App买（12306），进站需安检。车厢有WiFi电源热餐。"};function r(){return("undefined"!=typeof lang?lang:"sr")||"sr"}function o(){return 0===r().indexOf("zh")}function d(){return 0===r().indexOf("en")}function l(e){return(n[o()?"barry":"andjela"]||n.andjela)[e]||n.andjela[e]||e}function c(){if(0===e.length)return 0;const t=new Date;return(1e4*t.getFullYear()+100*(t.getMonth()+1)+t.getDate())%e.length}function a(){if(0===e.length)return;const n=e[t];if(!n)return;const r=document.getElementById("cultureEmoji");r&&(r.textContent=n.icon);const a=document.getElementById("cultureTitleZh"),s=document.getElementById("cultureTitleSr");a&&(a.textContent=d()&&n.en||n.zh,a.style.display=o()||d()?"":"none"),s&&(s.textContent=n.sr,s.style.display=o()||d()?"none":"");const i=document.getElementById("cultureDesc");if(i){let e=o()?u[n.id]||n.desc:n.desc_sr||n.desc;d()&&(e=n.desc_en||n.desc),i.textContent=e}const C=document.getElementById("cultureTags");if(C){let e="";(n.tags||[]).forEach(function(t){e+='<span class="culture-tag">'+t+"</span>"}),C.innerHTML=e}const f=document.getElementById("cultureNavInfo");f&&(f.textContent=t+1+" / "+e.length);const g=t===c(),y=document.getElementById("cultureMainCard");y&&(g?y.classList.add("culture-today"):y.classList.remove("culture-today"));const h=document.getElementById("cultureTodayBadge");h&&(h.textContent=l("todayBadge"))}return{load:function(){return fetch("data/culture-knowledge.json").then(function(e){return e.json()}).then(function(t){return e=Array.isArray(t)&&t.length>0?t:e,e}).catch(function(){return e})},getData:function(){return e},init:function(e){const n=document.getElementById("tb-culture");n&&"undefined"!=typeof L&&(n.textContent=L("Kina","China","中华")),t=c(),a()},render:a,prev:function(){0!==e.length&&(t=(t-1+e.length)%e.length,a())},next:function(){0!==e.length&&(t=(t+1)%e.length,a())},goToToday:function(){t=c(),a()},getTodaysIndex:c,dashboardSnippet:function(t){if(0===e.length)return"";const n=e[c()];if(!n)return"";const r=o(),l=d(),a=r?n.zh:l&&n.en?n.en:n.sr,s=r?u[n.id]||n.desc:l&&n.desc_en?n.desc_en:n.desc_sr||n.desc;return'<div class="card dash-card"><h4>'+n.icon+" "+(t||"Today")+'</h4><div style="font-size:.85rem;font-weight:700;color:var(--love);margin-bottom:4px">'+a+'</div><div style="font-size:.65rem;color:var(--text-muted);line-height:1.5">'+(s||"").substring(0,120)+"...</div></div>"},locale:l,DESC_ZH:u}}();let CULTURE_KNOWLEDGE=[];const CULTURE_DESC_ZH=CultureCardsModule.DESC_ZH;let _cultureCardIdx=0;function cl(e){return CultureCardsModule.locale(e)}function getTodaysCultureIndex(){return CultureCardsModule.getTodaysIndex()}function initCultureTab(){CultureCardsModule.init()}function renderCultureCard(){CultureCardsModule.render()}function prevCultureCard(){CultureCardsModule.prev()}function nextCultureCard(){CultureCardsModule.next()}function goToTodayCulture(){CultureCardsModule.goToToday()}!function(){const e=CultureCardsModule.load;CultureCardsModule.load=function(){return e.call(CultureCardsModule).then(function(e){return CULTURE_KNOWLEDGE=e,_cultureCardIdx=CultureCardsModule.getTodaysIndex(),e})}}();
/* === dist/js/calendar.js === */
"use strict";const CalendarModule={};
/* === dist/js/shared-calendar.js === */
"use strict";const SharedCalendarModule=function(){const e="shared-calendar-markers",a=[{emoji:"💕",label_sr:"Ljubav",label_zh:"爱",label_en:"Love"},{emoji:"🌸",label_sr:"Cvet",label_zh:"花",label_en:"Flower"},{emoji:"🌙",label_sr:"Noć",label_zh:"夜晚",label_en:"Night"},{emoji:"☀️",label_sr:"Srećan dan",label_zh:"好天气",label_en:"Nice day"},{emoji:"🍵",label_sr:"Čaj",label_zh:"喝茶",label_en:"Tea"},{emoji:"🎵",label_sr:"Muzika",label_zh:"音乐",label_en:"Music"},{emoji:"📖",label_sr:"Čitanje",label_zh:"阅读",label_en:"Reading"},{emoji:"💪",label_sr:"Vežba",label_zh:"运动",label_en:"Workout"},{emoji:"😊",label_sr:"Sreća",label_zh:"开心",label_en:"Happy"},{emoji:"😢",label_sr:"Tužno",label_zh:"难过",label_en:"Sad"},{emoji:"🤗",label_sr:"Zagrljaj",label_zh:"拥抱",label_en:"Hug"},{emoji:"🎂",label_sr:"Proslava",label_zh:"庆祝",label_en:"Celebration"},{emoji:"✈️",label_sr:"Putovanje",label_zh:"旅行",label_en:"Travel"},{emoji:"🏠",label_sr:"Kod kuće",label_zh:"在家",label_en:"At home"},{emoji:"💼",label_sr:"Posao",label_zh:"工作",label_en:"Work"},{emoji:"🎮",label_sr:"Igrice",label_zh:"游戏",label_en:"Gaming"},{emoji:"🍜",label_sr:"Hrana",label_zh:"美食",label_en:"Food"},{emoji:"🥰",label_sr:"Zaljubljeno",label_zh:"甜蜜",label_en:"In love"}];function l(){try{return JSON.parse(localStorage.getItem(e))||{}}catch(e){return{}}}function r(a){try{localStorage.setItem(e,JSON.stringify(a))}catch(e){}}function n(e){return l()[e]||[]}return{getMarkers:n,addMarker:function(e,a){if(a=a||{},!e||!a.emoji)return null;const n=l();n[e]||(n[e]=[]);const t={id:Date.now().toString(36)+Math.random().toString(36).substr(2,6),author:"undefined"!=typeof activeProfile?activeProfile:"unknown",emoji:a.emoji,type:a.type||"custom",note:a.note||"",time:Date.now()};return n[e].push(t),r(n),t},removeMarker:function(e){if(!e)return!1;const a=l();for(const l in a){if(!a.hasOwnProperty(l))continue;const n=a[l];for(let t=0;t<n.length;t++)if(n[t].id===e&&n[t].author===activeProfile)return n.splice(t,1),0===n.length&&delete a[l],r(a),!0}return!1},getAllMarkers:function(){return l()},getSummary:function(e){const a=n(e),l={andjela:[],barry:[],andjelaDiary:!1,barryDiary:!1};for(let e=0;e<a.length;e++){const r=a[e];"andjela"===r.author?l.andjela.push(r):l.barry.push(r)}try{const a=JSON.parse(localStorage.getItem("shared-diary"))||{};a[e]&&(a[e].andjela&&(l.andjelaDiary=!0),a[e].barry&&(l.barryDiary=!0))}catch(e){}return l},hasAnyActivity:function(e){if(n(e).length>0)return!0;try{const a=JSON.parse(localStorage.getItem("shared-diary"))||{};if(a[e]&&(a[e].barry||a[e].andjela))return!0}catch(e){}return!1},clearAll:function(){r({})},bulkSet:function(e){e&&"object"==typeof e&&r(e)},getQuickEmojis:function(){return a}}}(),getCalendarMarkers=SharedCalendarModule.getMarkers,addCalendarMarker=SharedCalendarModule.addMarker,removeCalendarMarker=SharedCalendarModule.removeMarker,getCalendarSummary=SharedCalendarModule.getSummary;
/* === dist/js/barry.js === */
"use strict";const BarryModule={SYMPTOM_HELP:{cramps:{cause:{sr:"Materica se kontrahuje da izbaci sluzokozu — prostaglandini izazivaju bol",zh:"子宫收缩排出内膜——前列腺素引起疼痛",en:"Uterus contracts to shed lining — prostaglandins cause pain"},help:{sr:"Termofor na stomak • Caj od dumbira • Nezna masaza donjeg dela leda • Bez hladnih pica",zh:"暖水袋敷肚子 • 红糖姜茶 • 轻揉下背部 • 别喝冰的",en:"Heating pad • Ginger tea • Gentle lower back massage • No cold drinks"}},headache:{cause:{sr:"Pad estrogena siri krvne sudove u mozgu",zh:"雌激素下降导致脑血管扩张",en:"Estrogen drop dilates brain blood vessels"},help:{sr:"Tiha, zamracena soba • Hladan oblog na celo • Pitaj da li zeli lek protiv bolova",zh:"安静黑暗的房间 • 凉毛巾敷额头 • 问她需不需要止痛药",en:"Quiet dark room • Cold compress on forehead • Ask if she needs pain relief"}},fatigue:{cause:{sr:"Telo trosi mnogo energije — grozde je nisko",zh:"身体消耗大量能量——铁含量低",en:"Body uses lots of energy — iron is low"},help:{sr:"Pusti je da spava • Uradi nesto po kuci umesto nje • Skoro joj hranu bogatu grozdem",zh:"让她睡 • 帮她做家务 • 做含铁丰富的食物",en:"Let her sleep • Do chores for her • Cook iron-rich food for her"}},mood:{cause:{sr:"Hormoni divljaju — serotonin i dopamin su na minimumu",zh:"荷尔蒙剧烈波动——血清素和多巴胺都处于低点",en:"Serotonin and dopamine at lows"},help:{sr:'Slupsaj bez osude • Ne govori "smiri se" • Donesi joj cvece bez razloga • Samo je zagrli',zh:'倾听不评判 • 别说"冷静点" • 买花给她 • 就抱着她',en:'Listen without judging • Dont say "calm down" • Bring her flowers • Just hold her'}},flow:{cause:{sr:"Sluzokoza materice se ljusti — normalan proces",zh:"子宫内膜正在脱落——正常过程",en:"Uterine lining is shedding — normal process"},help:{sr:"Kupi joj uloske/tampone ako joj treba • Bez dizanja teskih stvari • Neka se odmara",zh:"帮她买卫生巾 • 别让她提重物 • 让她休息",en:"Buy pads/tampons if she needs • No heavy lifting • Let her rest"}},cravings:{cause:{sr:"Nagli pad serotonina — telo trazi utehu u hrani",zh:"血清素急剧下降——身体在食物中寻找安慰",en:"Serotonin crash — body seeks comfort in food"},help:{sr:"Donesi joj ono sto zeli bez komentara • Naruci njenu omiljenu hranu • Ne komentari njene izbore",zh:"给她想吃的不要评论 • 点她最爱吃的 • 别评论她的食物选择",en:"Get her what she wants, no comments • Order her favorite food • Dont comment on her choices"}}}};
/* === dist/js/render-mood.js === */
function getMood(t){return state.moods&&state.moods[t]?state.moods[t].mood:null}function setMood(e,o){if(state.moods||(state.moods={}),state.moods[e]&&state.moods[e].mood===o)return delete state.moods[e],saveState(),void renderMoodSection();state.moods[e]={mood:o,time:Date.now()},saveState(),renderMoodSection(),renderGarden(),toast(t("moodNames")[MOOD_KEYS.indexOf(o)]+" check")}function calculateStreak(){if(!state.moods)return 0;const t=today();let e=0;const o=new Date(t);for(;;){const t=fmtDate(o);if(!state.moods[t])break;e++,o.setDate(o.getDate()-1)}return e}function renderMoodSection(){const e=fmtDate(today()),o=getMood(e);document.getElementById("mood-today-label").textContent=t("moodToday"),document.getElementById("mood-title").textContent=t("moodTitle");const n=document.getElementById("moodPicker");n.innerHTML="",MOOD_EMOJIS.forEach(function(a,d){const s=document.createElement("span");s.className="mood-emoji"+(o===MOOD_KEYS[d]?" picked":""),s.textContent=a,s.title=t("moodNames")[d],s.onclick=function(){setMood(e,MOOD_KEYS[d]),animateWatering()},n.appendChild(s)}),document.getElementById("streakDisplay").style.display="none",document.getElementById("mood-history-label").textContent=t("moodHistoryLabel");const a=document.getElementById("moodHistory");a.innerHTML="";for(let e=6;e>=0;e--){const o=new Date(today());o.setDate(o.getDate()-e);const n=getMood(fmtDate(o)),d=document.createElement("div");d.className="mood-bar",d.style.height=n?"28px":"6px",n&&d.classList.add(n),d.title=n?t("moodNames")[MOOD_KEYS.indexOf(n)]+" "+fmtDate(o):fmtDate(o),a.appendChild(d)}}function renderLoveNote(){if("barry"===activeProfile)return void(document.getElementById("loveNoteCard").style.display="none");document.getElementById("loveNoteCard").style.display="";const e=document.getElementById("loveNoteText"),o=LOVE_NOTES.get();e.textContent!==o&&(e.classList.add("changing"),setTimeout(function(){e.textContent=o,e.classList.remove("changing")},300));const n=["但愿人长久，千里共婵娟 🌙","执子之手，与子偕老 💕","天涯若比邻 🌍","心有灵犀一点通 ✨","千里姻缘一线牵 💝","海内存知己，天涯若比邻 🌊"],a=n[Math.floor(Math.random()*n.length)];document.getElementById("loveNoteSig").textContent=t("loveNoteSig")+"  ·  "+a;const d=["💌","💝","💗","💕","💖","🕊️","✨","🌷"];document.getElementById("loveNoteIcon").textContent=d[Math.floor(Math.random()*d.length)]}function renderForecast(){if("andjela"!==activeProfile)return void(document.getElementById("forecastCard").style.display="none");const e=predict(),o=addDays(today(),1),n=getPhase(o,e);let a="";a="period-on"===n||"period-mid"===n||"period-pred-first"===n||"period-pred"===n?t("forecastPeriod"):"ovulation"===n?t("forecastOvulation"):"follicular"===n?t("forecastFollicular"):"luteal"===n||"fertile"===n?t("forecastLuteal"):t("forecastNormal"),document.getElementById("forecastText").textContent=a,document.getElementById("forecastCard").style.display=""}function animateWatering(){const t=document.getElementById("gardenPlant");t&&(t.style.transform="scale(1.3) rotate(10deg)",t.style.transition="transform .3s cubic-bezier(.22, 1, .36, 1)",["💧","💧","💧"].forEach(function(t,e){setTimeout(function(){const e=document.createElement("span");e.textContent=t,e.style.cssText="position:absolute;font-size:.8rem;animation:dropFall 1s ease-in forwards;z-index:10;pointer-events:none;",e.style.left=30+40*Math.random()+"%",e.style.top="-10px",document.getElementById("gardenCard").appendChild(e),setTimeout(function(){e.remove()},1e3)},150*e)}),setTimeout(function(){t.style.transform="",renderGarden()},600))}function renderGarden(){const e=document.getElementById("gardenPlant");e&&(e.style.transform="",e.style.transition="all .5s cubic-bezier(.22, 1, .36, 1)"),document.getElementById("garden-title").textContent=t("gardenTitle");const o=calculateStreak();let n,a,d;if(0===o?(n="🌰",a=t("gardenState0"),d=""):1===o?(n="🌱",a=t("gardenState1"),d=""):o<=3?(n="🌿",a=t("gardenState3"),d=""):o<=7?(n="🌷",a=t("gardenState7"),d=""):(n="🌸",a=t("gardenStateBloom"),d=""),"andjela"===activeProfile&&o>0){const t=getPhase(today(),predict());t&&t.startsWith("period")?n="🌹":"ovulation"===t?n="🌻":"luteal"===t&&(n="🌷")}document.getElementById("gardenPlant").textContent=n,document.getElementById("gardenMsg").textContent=a,document.getElementById("gardenHint").textContent=d}
/* === dist/js/render-love.js === */
const HUG_EXPIRY_MS=864e5;let _gratNotes=null;const KNOW_ME_QUESTIONS=[{key:"fav_city",q:{sr:"Koji je omiljeni grad tvog/tvoje partnera?",zh:"对方最喜欢的城市是哪里？",en:"What is your partner's favorite city?"}},{key:"first_date_color",q:{sr:"Šta je tvoj/tvoja partner/ka nosio/la na prvom sastanku?",zh:"第一次约会对方穿什么颜色的衣服？",en:"What color did your partner wear on your first date?"}},{key:"dream_trip",q:{sr:"Gde bi tvoj/tvoja partner/ka najradije putovao/la?",zh:"对方最想去的旅行目的地是哪里？",en:"Where does your partner dream of traveling to?"}},{key:"comfort_food",q:{sr:"Koja je omiljena hrana tvog/tvoje partnera za utehu?",zh:"对方心情不好时最爱吃什么？",en:"What comfort food does your partner reach for?"}},{key:"hidden_talent",q:{sr:"Koji skriveni talenat ima tvoj/tvoja partner/ka?",zh:"对方有什么隐藏的才艺？",en:"What hidden talent does your partner have?"}},{key:"childhood_dream",q:{sr:"Šta je tvoj/tvoja partner/ka želeo/la da bude kao dete?",zh:"对方小时候的梦想职业是什么？",en:"What did your partner dream of becoming as a child?"}},{key:"pet_peeve",q:{sr:"Šta tvog/tvoju partnera/ku najviše nervira?",zh:"对方最讨厌的事情是什么？",en:"What annoys your partner the most?"}},{key:"perfect_day",q:{sr:"Kako izgleda savršen dan za tvog/tvoju partnera/ku?",zh:"对方心目中的完美一天是怎样的？",en:"What does your partner's perfect day look like?"}},{key:"music_taste",q:{sr:"Koja je omiljena pesma tvog/tvoje partnera trenutno?",zh:"对方最近单曲循环的歌是什么？",en:"What song is your partner playing on repeat lately?"}},{key:"love_language",q:{sr:"Koji je glavni jezik ljubavi tvog/tvoje partnera?",zh:"对方最重要的爱的语言是什么？",en:"What is your partner's primary love language?"}},{key:"smell_memory",q:{sr:"Koji miris podseća tvog/tvoju partnera/ku na vas?",zh:"什么味道会让对方想起你？",en:"What scent reminds your partner of you?"}},{key:"future_5years",q:{sr:"Gde tvoj/tvoja partner/ka vidi sebe za 5 godina?",zh:"对方觉得五年后的自己会在哪里？",en:"Where does your partner see themselves in 5 years?"}},{key:"best_quality",q:{sr:"Šta tvoj/tvoja partner/ka najviše ceni kod sebe?",zh:"对方最欣赏自己的哪个品质？",en:"What quality does your partner admire most in themselves?"}},{key:"favorite_memory",q:{sr:"Koje je omiljeno zajedničko sećanje tvog/tvoje partnera?",zh:"对方最喜欢你们在一起时的哪个回忆？",en:"What is your partner's favorite shared memory with you?"}},{key:"morning_routine",q:{sr:"Kako tvoj/tvoja partner/ka započinje jutro?",zh:"对方早上起来做的第一件事是什么？",en:"What is the first thing your partner does in the morning?"}}],CHECKIN_QUESTIONS={sr:[{q:"Kako se osećaš u vezi ove nedelje?",opts:["😍 Sjajno","😊 Dobro","😐 Ok","😞 Loše"]},{q:"Da li smo dovoljno komunicirali?",opts:["💬 Da, odlično","👍 Uglavnom","🤔 Moglo bi bolje","👎 Ne baš"]},{q:"Šta bi voleo/la da poboljšamo sledeće nedelje?",opts:["💏 Više zajedničkog vremena","💬 Bolja komunikacija","🔥 Više romantike","🤝 Više podrške"]}],"zh-CN":[{q:"这周的感情状态怎么样？",opts:["😍 很棒","😊 不错","😐 一般","😞 不太好"]},{q:"我们这周的沟通足够吗？",opts:["💬 很好","👍 还行","🤔 可以更好","👎 不太够"]},{q:"下周希望我们哪方面做得更好？",opts:["💏 更多陪伴","💬 更好交流","🔥 更多浪漫","🤝 更多支持"]}],en:[{q:"How do you feel about this week together?",opts:["😍 Amazing","😊 Good","😐 OK","😞 Not great"]},{q:"Did we communicate enough?",opts:["💬 Yes, great","👍 Mostly","🤔 Could improve","👎 Not really"]},{q:"What would you like more of next week?",opts:["💏 More time together","💬 Better talks","🔥 More romance","🤝 More support"]}]};function spawnFloatingHearts(e){const t=["💕","💖","💗","💝","✨","💫"];for(let n=0;n<8;n++)(function(n){setTimeout(function(){const a=document.createElement("span");a.className="floating-heart",a.textContent=t[n%t.length],a.style.left=20+60*Math.random()+"%",a.style.bottom="20px",e.appendChild(a),setTimeout(function(){a.parentNode&&a.remove()},1300)},80*n)})(n)}function getHugStreak(){const e=loadSharedDiaryData(),t=new Date;let n=0;for(let a=0;a<365;a++){const o=new Date(t);o.setDate(o.getDate()-a);const r=e[fmtDate(o)];if(!(r&&r.barry&&r.barry.hug&&r.andjela&&r.andjela.hug))break;n++}return n}function sendHug(e){const n=fmtDate(new Date);let a=parseInt(localStorage.getItem("hug-count-"+n)||"0");if(a>=2)return void toast(t("hugLimit"));a++,localStorage.setItem("hug-count-"+n,a);const o={from:activeProfile,time:Date.now()};localStorage.setItem("shared-hug",JSON.stringify(o));const r=loadSharedDiaryData();r[n]||(r[n]={}),r[n][activeProfile]||(r[n][activeProfile]={}),r[n][activeProfile].hug={time:Date.now()},saveSharedDiaryData(r);const i=document.getElementById("hugSendBtn");i&&(i.classList.add("sending"),setTimeout(function(){i.classList.remove("sending")},600));const s=document.getElementById("hugCard");s&&spawnFloatingHearts(s),renderHug(),toast("🤗 "+("barry"===activeProfile?t("hugSentBarry"):t("hugSentAndjela"))+" ("+a+"/2)")}function checkHug(){try{const e=JSON.parse(localStorage.getItem("shared-hug"));return e?Date.now()-e.time>864e5?(localStorage.removeItem("shared-hug"),null):e.from===activeProfile?null:e:null}catch(e){return null}}function dismissHug(){localStorage.removeItem("shared-hug"),renderHug()}function renderHug(){const e=checkHug(),n=document.getElementById("hugContent"),a=document.getElementById("hug-title");if(!a)return;a.textContent=t("hugTitle");const o=fmtDate(new Date),r=parseInt(sessionStorage.getItem("hug-count-"+o)||"0"),i=2-r,s=getHugStreak();if(e){const t="andjela"===e.from?"🌸 Anđela":"👦 Barry",a=new Date(e.time),o=String(a.getHours()).padStart(2,"0")+":"+String(a.getMinutes()).padStart(2,"0");let r='<div class="hug-received">';s>1&&(r+='<div class="hug-streak-badge">🔥 '+("sr"===lang?s+" dana zaredom!":"en"===lang?s+"-day streak!":"连续 "+s+" 天！")+"</div>"),r+='<span class="hug-icon-wrap"><span class="hug-icon">🤗</span></span>',r+='<div class="hug-text">'+t+" "+("sr"===lang?"te zagrlio/la! 💫":"en"===lang?"hugged you! 💫":"抱了你！💫")+"</div>",r+='<div class="hug-time">'+o+"</div>",r+='<button class="hug-back-btn" onclick="sendHug(true)" id="hugBackBtn">💝 '+("sr"===lang?"Uzvrati zagrljaj":"en"===lang?"Hug back":"回抱一个")+"</button>",r+='<div><button class="hug-dismiss" onclick="dismissHug()">'+("sr"===lang?"✕ zatvori":"en"===lang?"✕ dismiss":"✕ 关闭")+"</button></div></div>",n.innerHTML=r;const i=document.getElementById("hugCard");i&&spawnFloatingHearts(i)}else if(r>0){let e="";for(let t=0;t<2;t++)e+='<span class="hh-heart'+(t>=i?" used":"")+'">'+(t<r?"❤️":"🤍")+"</span>";const a='<div class="hug-sent-state"><div class="hug-hearts-row">'+e+'</div><span class="hss-icon">📬</span><div class="hss-text">'+t("hugSentWaiting")+'</div><button class="hug-back-btn" onclick="sendHug()" style="margin-top:8px">🤗 '+("sr"===lang?"Pošalji još jedan ("+i+")":"en"===lang?"Send another ("+i+")":"再抱一次 ("+i+")")+"</button></div>";n.innerHTML=a}else{const e=t("hugSendBtn");let a="";s>1&&(a+='<div style="text-align:center"><div class="hug-streak-badge">🔥 '+("sr"===lang?s+" dana zaredom!":"en"===lang?s+"-day streak!":"连续 "+s+" 天！")+"</div></div>"),a+='<button class="hug-btn" onclick="sendHug()" id="hugSendBtn">🤗 '+e+"</button>",n.innerHTML=a}}function addGratitude(){const e=document.getElementById("gratInput"),t=e.value.trim();if(!t)return;let n=JSON.parse(localStorage.getItem("shared-gratitude")||"[]");n.push({text:t,from:activeProfile,time:Date.now()}),n.length>20&&(n=n.slice(-20)),localStorage.setItem("shared-gratitude",JSON.stringify(n)),_gratNotes=null,e.value="",renderGratitude(),pushAllSharedData()}function renderGratitude(){const e=document.getElementById("grat-title"),n=document.getElementById("gratInput"),a=document.getElementById("gratList");if(!e||!n||!a)return;e.textContent=t("gratTitle"),n.placeholder=t("gratPlaceholder");const o=JSON.parse(localStorage.getItem("shared-gratitude")||"[]");0!==o.length?a.innerHTML=o.slice(-5).reverse().map(function(e,t){const n="andjela"===e.from?"🌸":"👦",a=e.from!==("andjela"===activeProfile?"andjela":"barry")?' <button onclick="translateGrat('+t+')" style="font-size:.55rem;padding:1px 6px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);cursor:pointer">🌐</button>':"";return'<div class="gratitude-item"><span class="gratitude-heart">'+n+'</span><span id="grat-txt-'+t+'">'+esc(e.text)+"</span>"+a+"</div>"}).join(""):a.innerHTML=""}function translateGrat(e){_gratNotes||(_gratNotes=JSON.parse(localStorage.getItem("shared-gratitude")||"[]"));const t=_gratNotes[e];if(!t)return;const n="andjela"===t.from?"sr":"sr"===lang?"zh-CN":"sr",a="sr"===lang?"sr":"zh-CN"===lang?"zh-CN":"en";n!==a&&translateText(t.text,n,a).then(function(t){const n=document.getElementById("grat-txt-"+e);n&&(n.textContent=t)})}function saveCheckinAnswer(e,t){const n="shared-checkin-"+activeProfile,a=JSON.parse(localStorage.getItem(n)||"{}");a[e]=t,localStorage.setItem(n,JSON.stringify(a)),renderCheckin(),pushAllSharedData()}function getCheckinAnswers(e){return JSON.parse(localStorage.getItem("shared-checkin-"+e)||"{}")}function renderCheckin(){const e=(new Date).getDay();if(0!==e&&6!==e)return void(document.getElementById("checkinCard").style.display="none");document.getElementById("checkinCard").style.display="",document.getElementById("checkin-title").textContent=t("checkinTitle");const n=CHECKIN_QUESTIONS[lang]||CHECKIN_QUESTIONS.sr,a=getCheckinAnswers(activeProfile),o="andjela"===activeProfile?"barry":"andjela",r=getCheckinAnswers(o),i="andjela"===o?"🌸 Anđela":"👦 Barry";let s=n.map(function(e,t){const n=a[t]||"",o=r[t]||"",s=e.opts.map(function(e){return'<span class="cq-opt'+(n===e?" picked":"")+'" onclick="saveCheckinAnswer('+t+",'"+e.replace(/'/g,"\\'")+"')\">"+e+"</span>"}).join(""),l=o?'<div style="font-size:.62rem;color:var(--gold);margin-top:4px">'+i+": "+o+"</div>":"";return'<div class="checkin-q"><div class="cq-label"><span>'+e.q+'</span></div><div class="cq-options">'+s+"</div>"+l+"</div>"}).join("");0===Object.keys(a).length&&0===Object.keys(r).length&&(s+='<div style="text-align:center;font-size:.68rem;color:var(--text-muted);margin-top:8px">'+("sr"===lang?"Odgovori na pitanja — partner će videti tvoje odgovore ✨":"en"===lang?"Answer the questions — your partner will see your answers ✨":"回答问题——伴侣会看到你的答案 ✨")+"</div>"),document.getElementById("checkinContent").innerHTML=s}function saveMySong(){const e=document.getElementById("songInputTitle").value.trim();if(!e)return void toast(t("songSaveEmpty"));const n={title:e,note:document.getElementById("songInputNote").value.trim()||"",from:activeProfile,time:Date.now()};localStorage.setItem("shared-song-"+activeProfile,JSON.stringify(n)),renderSong(),pushAllSharedData(),toast(t("songSaved"))}function loadSong(e){return safeParse(localStorage.getItem("shared-song-"+e),null)}function getKnowMeData(){return safeParse(localStorage.getItem("shared-knowme"),{})}function saveKnowMeData(e){localStorage.setItem("shared-knowme",JSON.stringify(e))}function renderKnowMe(){if(!document.getElementById("knowMeCard"))return;document.getElementById("knowMe-title").textContent=t("knowMeTitle");const e=Math.floor(Date.now()/864e5)%KNOW_ME_QUESTIONS.length,n=KNOW_ME_QUESTIONS[e],a=n.q[lang]||n.q.sr,o=fmtDate(today()),r=getKnowMeData()[o]||{},i=r[activeProfile],s="andjela"===activeProfile?"barry":"andjela",l=r[s],d="andjela"===s?"🌹 Anđela":"👦 Barry",g="andjela"===activeProfile?"🌹 Anđela":"👦 Barry";let c="";c+='<div style="font-size:.78rem;color:var(--love);font-weight:600;margin-bottom:12px;text-align:center;line-height:1.4">'+a+"</div>",c+=i?'<div style="background:var(--rose-light);border-radius:12px;padding:10px 14px;margin-bottom:8px"><span style="font-size:.62rem;color:var(--text-muted)">'+g+" "+("sr"===lang?"odgovor":"en"===lang?" answer":"的回答")+'</span><div style="font-size:.8rem;color:var(--text);margin-top:4px">'+esc(i.answer)+"</div></div>":'<div style="margin-bottom:10px"><textarea id="knowMeInput" placeholder="'+("sr"===lang?"Tvoj odgovor...":"en"===lang?"Your answer...":"你的答案...")+'" style="width:100%;border:1px solid var(--border);border-radius:12px;padding:10px 12px;font-size:.74rem;font-family:var(--font);background:var(--card);color:var(--text);resize:none;min-height:44px" maxlength="120"></textarea><button class="btn btn-primary" onclick="saveKnowMeAnswer()" style="width:100%;font-size:.7rem;padding:8px;margin-top:6px">💭 '+("sr"===lang?"Odgovori":"en"===lang?"Answer":"回答")+"</button></div>",l?(c+='<div style="padding-top:8px;border-top:1px solid var(--border);margin-top:4px"><span style="font-size:.62rem;color:var(--teal);font-weight:600">👀 '+d+t("knowMePartnerLabel")+'</span><div style="font-size:.82rem;color:var(--teal);margin-top:4px;font-style:italic;line-height:1.4">'+esc(l.answer)+"</div></div>",i&&l&&i.answer.trim().toLowerCase()===l.answer.trim().toLowerCase()&&(c+='<div style="text-align:center;margin-top:8px;font-size:1.5rem;animation:float-arrow .8s infinite">💞</div><div style="text-align:center;font-size:.7rem;color:var(--love);font-weight:600">'+t("knowMeMatch")+"</div>")):i&&(c+='<div style="text-align:center;padding:10px;color:var(--text-muted);font-size:.68rem;font-style:italic">⏳ '+t("knowMeWaiting")+"</div>"),document.getElementById("knowMeContent").innerHTML=c}function saveKnowMeAnswer(){const e=document.getElementById("knowMeInput");if(!e)return;const n=e.value.trim();if(!n)return;const a=fmtDate(today()),o=getKnowMeData();o[a]||(o[a]={}),o[a][activeProfile]={answer:n,time:Date.now()},saveKnowMeData(o),pushAllSharedData(),renderKnowMe(),toast(t("knowMeAnswerSaved"))}function renderSong(){const e=document.getElementById("song-title");if(!e)return;e.textContent=t("songTitle");const n=loadSong(activeProfile),a="andjela"===activeProfile?"barry":"andjela",o=loadSong(a),r="andjela"===a?"🌸 Anđela":"👦 Barry";let i="";i+=n?'<div style="margin-bottom:10px"><span style="font-size:.62rem;color:var(--text-muted)">'+t("songMyLabel")+'</span><div class="song-title">🎶 '+esc(n.title)+"</div>"+(n.note?'<div class="song-note">'+esc(n.note)+"</div>":"")+"</div>":'<div style="margin-bottom:10px"><input id="songInputTitle" placeholder="'+t("songTitlePlaceholder")+'" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:12px;font-size:.74rem;font-family:var(--font);background:var(--card);color:var(--text);margin-bottom:6px"><input id="songInputNote" placeholder="'+t("songNotePlaceholder")+'" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:12px;font-size:.74rem;font-family:var(--font);background:var(--card);color:var(--text);margin-bottom:6px"><button class="btn btn-primary" onclick="saveMySong()" style="width:100%;font-size:.7rem;padding:8px">🎵 '+t("songSave")+"</button></div>",o&&(i+='<div style="padding-top:8px;border-top:1px solid var(--border)"><span style="font-size:.62rem;color:var(--text-muted)">'+r+" "+t("songPartnerLabel")+'</span><div class="song-title">🎶 '+esc(o.title)+"</div>"+(o.note?'<div class="song-note">'+esc(o.note)+"</div>":"")+"</div>"),document.getElementById("songContent").innerHTML=i||'<span class="song-icon">🎶</span><div class="song-note">'+t("songEmpty")+"</div>"}function renderRelTips(){if("andjela"!==activeProfile)return void(document.getElementById("relTipCard").style.display="none");const e=REL_TIPS[lang]||REL_TIPS.sr,t=e[Math.floor(Math.random()*e.length)];document.getElementById("relTipIcon").textContent=t.icon,document.getElementById("relTipText").textContent=t.text,document.getElementById("relTipCard").style.display=""}
/* === dist/js/render-misc.js === */
let titleClicks=0,lastCycleCount=0;function updateLoveCounter(){const e=document.getElementById("titleLoveCounter");if(!e||!annDateLove)return;const n=daysDiff(new Date(annDateLove),today());n>=0&&(e.textContent="♥ "+n+t("loveCounterTogether"));const o=document.getElementById("love-days-content");if(!o)return;const a=[];if(annDateMet){const e=daysDiff(new Date(annDateMet),today());e>=0&&a.push('<div style="font-size:.85rem"><span style="color:var(--gold)">✨</span> '+e+t("loveCounterMet")+"</div>")}if(annDateLove){const e=daysDiff(new Date(annDateLove),today());e>=0&&a.push('<div style="font-size:1.2rem;font-weight:700;color:var(--love)">♥ '+e+("sr"===lang?" dana zajedno":"en"===lang?" days together":" 天在一起")+"</div>")}o.innerHTML=a.join('<div style="height:4px"></div>'),document.getElementById("love-days-title").textContent=t("loveDaysTitle")}function randomThinkingOfYou(){if("andjela"!==activeProfile)return;if(Math.random()>.18)return;const e="sr"===lang?["Upravo sam pomislio na tebe ♥","Nadam se da se osećaš dobro danas ✨","Tvoj osmeh mi je najdraža st let 🌸","Mislim na tebe... uvek 💫","Barry je upravo pomislio na tebe 💝"]:"en"===lang?["Just thought of you ♥","Hope you are feeling good today ✨","Your smile is my favorite thing 🌸","Thinking of you... always 💫","Barry was just thinking of you 💝"]:["刚刚在想你 ♥","希望你今天心情好 ✨","你的笑容是我最喜欢的 🌸","一直在想你 💫","Barry 刚刚想到了你 💝"],t=e[Math.floor(Math.random()*e.length)];setTimeout(function(){toast(t)},3e3)}function showGreeting(){if(sessionStorage.getItem("_greetingShown"))return;sessionStorage.setItem("_greetingShown","1");const e=document.getElementById("greetingOverlay");if(!e)return;const t=(I18N[lang]||I18N[lang.split("-")[0]]||I18N.sr).greeting;if(!t)return;const n=(new Date).getHours();let o;o=n>=5&&n<12?t.morning:n>=12&&n<18?t.afternoon:n>=18&&n<23?t.evening:t.night,document.getElementById("greetingIcon").textContent=o.icon,document.getElementById("greetingName").textContent=o.name,document.getElementById("greetingMsg").textContent=o.msg,document.getElementById("greetingSub").textContent=o.sub,e.style.display="flex",e.classList.remove("hidden"),spawnFeathers(),clearTimeout(window._greetingTimer),window._greetingTimer=setTimeout(function(){e.classList.add("hiding"),setTimeout(function(){e.style.display="none",e.classList.add("hidden"),e.classList.remove("hiding")},400)},2800)}function spawnFeathers(){const e=document.querySelector(".greeting-card");if(e)for(let t=0;t<8;t++){const n=document.createElement("span");n.className="feather",n.textContent=["🪶","✦","·"][t%3],n.style.left=10+80*Math.random()+"%",n.style.top=5+40*Math.random()+"%",n.style.animationDelay=2*Math.random()+"s",n.style.animationDuration=3+3*Math.random()+"s",e.appendChild(n),setTimeout(()=>n.remove(),5e3)}}function updateMoonPhase(){const e=document.getElementById("moonPhase"),t=2551443,n=new Date("2000-01-06T18:14:00Z").getTime()/1e3,o=(Date.now()/1e3-n)%t/t;e.innerHTML='<span class="moon-icon">'+["🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘"][Math.round(8*o)%8]+"</span>"}function handleTitleClick(){titleClicks++,titleClicks>=5&&(titleClicks=0,spawnPetals()),setTimeout(function(){titleClicks<5&&titleClicks>0&&(titleClicks=0)},2e3)}function spawnPetals(){const e=["🌸","💮","🌺","🩷","✿","🌷"];for(let t=0;t<25;t++){const t=document.createElement("span");t.className="petal",t.textContent=e[Math.floor(Math.random()*e.length)],t.style.left=100*Math.random()+"%",t.style.top=-(10+30*Math.random())+"px",t.style.animationDelay=1.5*Math.random()+"s",t.style.animationDuration=3+3*Math.random()+"s",t.style.fontSize=.8+1.5*Math.random()+"rem",document.body.appendChild(t),setTimeout(function(){t.remove()},5e3)}}function checkCycleCelebration(){const e=predict().cycles.length;if(e>lastCycleCount&&e>=1&&state.records.length>=2){lastCycleCount=e;const n=document.createElement("div");n.className="cycle-celebration",n.innerHTML='<span class="celeb-icon">💝</span><span class="celeb-text">'+t("cycleCounter").replace("{n}",e)+"</span>",document.body.appendChild(n),setTimeout(function(){n.style.opacity="0",n.style.transition="opacity .6s"},3e3),setTimeout(function(){n.remove()},4e3),updateCycleCounter(e)}}function updateCycleCounter(e){const n=document.getElementById("cycleCounterCard");n&&(e>0?(n.style.display="",document.getElementById("cc-count").textContent=e,document.getElementById("cc-subtitle").textContent=t("cycleCounterSub")):n.style.display="none")}function renderSpecialBadge(){const e=document.getElementById("specialBadge");if("andjela"!==activeProfile)return void(e.style.display="none");e.style.display="";const t="sr"===lang?["Ti si jedinstvena ✨","Najlepša na svetu 🌸","Barryjeva ljubav 💝","Jedna jedina 💫"]:"en"===lang?["You are unique ✨","Most beautiful 🌸","Barry's love 💝","One and only 💫"]:["独一无二的你 ✨","最美的人 🌸","Barry 的爱 💝","世界上唯一的你 💫"];document.getElementById("specialBadgeText").textContent=t[Math.floor(Math.random()*t.length)]}
/* === dist/js/module-holidays.js === */
"use strict";

(function () {
  console.log('[module-holidays] 已加载');

  window.HOLIDAYS = [];
  window.HOLIDAY_DAYS = {};
  window._holidayCache = null;
  window._origHolidayPush = null;
  window.calendarExtraData = null;
  window.solarTermsCache = [];

  function loadHolidays() {
    return fetch('data/holidays.json')
      .then(function (r) {
        if (!r.ok) throw new Error('Failed to load holidays.json');
        return r.json();
      })
      .then(function (data) {
        window.HOLIDAYS = data.holidays || [];
        window.HOLIDAY_DAYS = data.holidayDays || {};
        if (typeof renderCalendar === 'function') renderCalendar();
      })
      .catch(function () { /*console.warn('[holidays] 数据加载失败');*/ });
  }
  window.loadHolidays = loadHolidays;
  loadHolidays();

  function _buildHolidayCache() {
    window._holidayCache = {};
    for (var hi = 0; hi < window.HOLIDAYS.length; hi++) {
      var h = window.HOLIDAYS[hi];
      if (!window._holidayCache[h.d]) window._holidayCache[h.d] = [];
      window._holidayCache[h.d].push(h);
    }
  }
  window._buildHolidayCache = _buildHolidayCache;

  function getHoliday(dateKey) {
    if (!window._holidayCache) _buildHolidayCache();
    return window._holidayCache[dateKey] || [];
  }
  window.getHoliday = getHoliday;

  function _rebuildHolidayCache() { window._holidayCache = null; }
  window._rebuildHolidayCache = _rebuildHolidayCache;

  function renderUpcomingHoliday() {
    var el = document.getElementById('holidayCountdown');
    if (!el) return;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var limit = new Date(today); limit.setDate(limit.getDate() + 60);
    var upcoming = null;
    for (var i = 0; i < window.HOLIDAYS.length; i++) {
      var d = new Date(window.HOLIDAYS[i].d + 'T00:00:00');
      if (d >= today && d <= limit) {
        if (!upcoming || d < new Date(upcoming.d + 'T00:00:00')) upcoming = window.HOLIDAYS[i];
      }
    }
    if (upcoming) {
      var days = Math.ceil((new Date(upcoming.d + 'T00:00:00') - today) / 86400000);
      var name = upcoming.name[lang] || upcoming.name[lang && lang.split('-')[0]] || upcoming.name['sr'] || upcoming.name['en'] || '';
      var daysText = days === 0 ? t('holidayToday') : t('holidayDaysAway') + ' ' + days + ' ' + t('day');
      el.style.display = ''; el.textContent = '\u{1F38C} ' + name + ' \u{00B7} ' + daysText;
    } else { el.style.display = 'none'; }
  }
  window.renderUpcomingHoliday = renderUpcomingHoliday;

  function renderMonthHolidaySummary() {
    var el = document.getElementById('holidaySummary');
    if (!el) return;
    var m = (typeof CalState.month !== 'undefined') ? CalState.month : new Date().getMonth();
    var y = (typeof CalState.year !== 'undefined') ? CalState.year : new Date().getFullYear();
    var mh = [];
    for (var i = 0; i < window.HOLIDAYS.length; i++) {
      var d = new Date(window.HOLIDAYS[i].d + 'T00:00:00');
      if (d.getMonth() === m && d.getFullYear() === y) mh.push(window.HOLIDAYS[i]);
    }
    if (mh.length === 0) { el.style.display = 'none'; return; }
    el.style.display = '';
    el.innerHTML = mh.sort(function (a, b) { return new Date(a.d) - new Date(b.d); })
      .map(function (h) {
        return '<span>' + (h.country === 'cn' ? '\u{1F1E8}\u{1F1F3}' : '\u{1F1F7}\u{1F1F8}') + ' ' + h.icon + ' ' + (h.name[lang] || h.name[lang.split('-')[0]] || h.name['sr']) + ' ' + h.d.split('-')[2].replace(/^0/, '') + '</span>';
      }).join('');
  }
  window.renderMonthHolidaySummary = renderMonthHolidaySummary;

  function toggleHolidayStory(uid, date, country) {
    var detail = document.getElementById('hd-' + uid), nameEl = document.getElementById('hn-' + uid);
    if (!detail || !nameEl) return;
    if (detail.classList.contains('open')) {
      detail.classList.remove('open');
      nameEl.textContent = nameEl.textContent.replace(' \u{25B4}', ' \u{25BE}');
      return;
    }
    loadCalendarData(function (data) {
      var story = null;
      (data.holidays || []).forEach(function (h) {
        if (h.date === date && h.country === (country === 'cn' ? 'china' : 'serbia')) story = h.story;
      });
      if (story) {
        var txt = story[lang] || story[lang.split('-')[0]] || story['sr'];
        if (txt) detail.textContent = txt;
      }
      detail.classList.add('open');
      nameEl.textContent = nameEl.textContent.replace(' \u{25BE}', ' \u{25B4}');
    });
  }
  window.toggleHolidayStory = toggleHolidayStory;

  function loadCalendarData(cb) {
    if (window.calendarExtraData) {
      if (window.calendarExtraData.solarTerms) window.solarTermsCache = window.calendarExtraData.solarTerms;
      cb(window.calendarExtraData); return;
    }
    var cached = localStorage.getItem('cycle-caldata');
    if (cached) {
      try {
        window.calendarExtraData = JSON.parse(cached);
        if (window.calendarExtraData.solarTerms) window.solarTermsCache = window.calendarExtraData.solarTerms;
        cb(window.calendarExtraData); return;
      } catch (e) {}
    }
    fetch('calendar-data.json').then(function (r) { return r.json(); })
      .then(function (d) {
        window.calendarExtraData = d;
        if (d && d.solarTerms) window.solarTermsCache = d.solarTerms;
        localStorage.setItem('cycle-caldata', JSON.stringify(d));
        cb(d);
      }).catch(function () { /*console.warn('[holidays] 数据加载失败');*/ });
  }
  window.loadCalendarData = loadCalendarData;

  function ensureSolarTermData() {
    if (window.solarTermsCache && window.solarTermsCache.length > 0) return;
    var cached = localStorage.getItem('cycle-solarterms');
    if (cached) {
      try { window.solarTermsCache = JSON.parse(cached); if (window.solarTermsCache.length > 0) return; } catch (e) {}
    }
    fetch('calendar-data.json').then(function (r) { return r.json(); })
      .then(function (d) { if (d && d.solarTerms) { window.solarTermsCache = d.solarTerms; localStorage.setItem('cycle-solarterms', JSON.stringify(window.solarTermsCache)); } })
      .catch(function () { /*console.warn('[holidays] 数据加载失败');*/ });
  }
  window.ensureSolarTermData = ensureSolarTermData;

  function getSolarTerm(dateKey) {
    if (!window.solarTermsCache || !window.solarTermsCache.length) return;
    for (var i = 0; i < window.solarTermsCache.length; i++) {
      if (window.solarTermsCache[i].date === dateKey) return window.solarTermsCache[i];
    }
  }
  window.getSolarTerm = getSolarTerm;

  function renderSolarTermBadge() {
    var badge = document.getElementById('solarTermBadge');
    if (!badge) return;
    var tk = fmtDate(today());
    var term = getSolarTerm(tk);
    if (term) {
      var n = term.name[lang] || term.name[lang.split('-')[0]] || term.name['sr'] || term.name['zh-CN'] || '';
      badge.textContent = '\u{1F33F} ' + n; badge.style.display = '';
    } else {
      var nearest = null, md = 30, td = today(), ts = window.solarTermsCache || [];
      ts.forEach(function (s) { var d = daysDiff(td, new Date(s.date + 'T00:00:00')); if (d >= 0 && d < md) { md = d; nearest = s; } });
      if (nearest && md <= 7) {
        var nn = nearest.name[lang] || nearest.name[lang.split('-')[0]] || nearest.name['sr'] || nearest.name['zh-CN'] || '';
        badge.textContent = '\u{1F33F} ' + nn + ' ' + t('solarTermBadge') + ' ' + md + ' ' + t('day'); badge.style.display = '';
      } else { badge.style.display = 'none'; }
    }
  }
  window.renderSolarTermBadge = renderSolarTermBadge;
})();

/* === dist/app.js === */
﻿'use strict';

if (typeof window.HOLIDAYS === 'undefined') window.HOLIDAYS = [];
if (typeof window.solarTermsCache === 'undefined') window.solarTermsCache = [];
if (typeof window.CalState === 'undefined') window.CalState = { year: 2026, month: 6, view: 'month', weekOffset: 0 };

/* eslint-disable no-unused-vars */

/* ================================================================
   NOTE: Global utility functions have been extracted to js/ui-core.js:
   safeParse(), $(), clearElCache(), debounce(), esc(),
   closeModal(), toggleKnowledge(), toast()
   Loaded via <script src="js/ui-core.js"> in index.html.
   ================================================================ */

/* ================================================================
   VERSION
   ================================================================ */
/* ================================================================
   SHARED CONSTANTS
   ================================================================ */
const MOOD_EMOJIS = ['😊', '🥰', '😤', '😴', '😢', '🤩', '😰', '😐'];
const MOOD_KEYS = ['happy', 'loved', 'frustrated', 'tired', 'sad', 'excited', 'anxious', 'meh'];
// Pre-computed O(1) lookup maps (replaces O(n) indexOf calls)
const MOOD_EMOJI_MAP = Object.fromEntries(
  MOOD_KEYS.map(function (k, i) {
    return [k, MOOD_EMOJIS[i]];
  })
);
let MOOD_NAME_MAP = {}; // populated lazily after i18n loads

/* ================================================================
   EXTRACTED to js/ui-core.js
   safeParse(), $(), clearElCache(), debounce()
   ================================================================ */
// On DOM mutations that add/remove elements, clear cache

/* ================================================================
   DEBUG FLAG — set to true to enable console.debug output
   ================================================================ */
const DEBUG = false;
function _dbg() {
  if (DEBUG) console.warn.apply(console, arguments);
}

/* ================================================================
   GLOBAL ERROR BOUNDARY — silent in production
   ================================================================ */
window.addEventListener('error', function (e) {
  if (DEBUG) console.warn('[caught]', e.message);
});
window.addEventListener('unhandledrejection', function (e) {
  if (DEBUG) console.warn('[unhandled]', e.reason);
});

/* ================================================================
   PROFILE SYSTEM
   ================================================================ */
let activeProfile = localStorage.getItem('cycle-active-profile') || 'andjela';
function profileKey(base) {
  return base + '-' + activeProfile;
}
function switchProfile(p) {
  if (p === activeProfile) return;
  // Animate profile pill
  const pill = document.getElementById('profilePill');
  if (pill) {
    pill.classList.add('switching');
    setTimeout(function () {
      pill.classList.remove('switching');
    }, 400);
  }
  activeProfile = p;
  localStorage.setItem('cycle-active-profile', p);
  state = loadState();
  window.state = state;
  // Load per-profile language & theme settings for this profile
  loadPerProfileSettings();
  setLang(lang);
  applyTheme(theme);
  console.log('[switchProfile] 已切换到 ' + p + '，语言=' + lang + '，主题=' + theme);
  // Immediately sync calendar from shared cycle data for both profiles
  try {
    const sd = JSON.parse(localStorage.getItem('shared-cycle-data') || 'null');
    if (sd && sd.records) {
      state.records = sd.records.map(function (r) {
        return new Date(r);
      });
      state.periodEnds = sd.periodEnds || {};
      state.symptoms = sd.symptoms || {};
      state.settings = sd.settings || { cycleLength: 28, periodLength: 7 };
    }
  } catch (e) {
    console.warn('[profile] Failed to parse shared-cycle-data:', e.message);
  }
  lastCycleCount = predict().cycles.length;

  // Pull latest shared data from GitHub when switching profiles
  if (getGitHubToken()) {
    pullAllSharedData().then(function () {
      if (p === 'barry') {
        renderCalendar();
        renderBarrySymptomView();
        renderTips();
      }
      renderHug();
      renderGratitude();
      renderSong();
      renderCheckin();
      renderKnowMe();
      renderSharedDiary();
      renderDateStrip();
      updateSyncStatusBadge();
    });
  }

  updateProfileUI();
  renderAll();
  loadSettingsUI();
  if (p === 'andjela' && !sessionStorage.getItem('_greetingShown')) {
    showGreeting();
  }
  toast((p === 'andjela' ? '🌸' : '👦') + ' ' + t('profileSwitch'));
}
function toggleProfile() {
  switchProfile(activeProfile === 'andjela' ? 'barry' : 'andjela');
}
function updateProfileUI() {
  const pill = document.getElementById('profilePill');
  const avatar = document.getElementById('pfAvatar');
  const name = document.getElementById('pfName');
  if (activeProfile === 'andjela') {
    avatar.textContent = '🌸';
    name.textContent = t('profileName');
    pill.classList.add('active-profile');
  } else {
    avatar.textContent = '👦';
    name.textContent = t('profileName2');
    pill.classList.remove('active-profile');
  }
  // Show/hide cycle-related cards for Barry
  const isAndjela = activeProfile === 'andjela';
  const pc = document.getElementById('progressSection');
  const rc = document.getElementById('reminderBanner');
  const fab = document.getElementById('fabBtn');
  const tea = document.getElementById('teaCard');
  if (pc) pc.style.display = isAndjela ? '' : 'none';
  if (rc && !isAndjela) rc.style.display = 'none';
  if (fab) fab.style.display = isAndjela ? '' : 'none';
  if (tea) tea.style.display = isAndjela ? '' : 'none';
}

/* ================================================================
   STATE (modified for profiles)
   ================================================================ */
const STORAGE_KEY_BASE = 'cycle-data-v6';
function loadState() {
  const key = profileKey(STORAGE_KEY_BASE);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const d = JSON.parse(raw);
      return {
        records: (d.records || []).map((r) => new Date(r)),
        symptoms: d.symptoms || {},
        moods: d.moods || {},
        diaries: d.diaries || {},
        periodEnds: d.periodEnds || {},
        settings: { cycleLength: 28, periodLength: 7, manualOverride: false, ...d.settings },
        _migrated: true,
      };
    }
  } catch (e) {
    if (DEBUG) console.warn('[state] Failed to load state:', e.message);
  }
  // Try old key
  try {
    const old = localStorage.getItem('cycle-data-v5');
    if (old && activeProfile === 'andjela') {
      const d = JSON.parse(old);
      return {
        records: (d.records || []).map((r) => new Date(r)),
        symptoms: d.symptoms || {},
        moods: {},
        diaries: {},
        settings: { cycleLength: 28, periodLength: 7, manualOverride: false, ...d.settings },
        _migrated: true,
      };
    }
  } catch (e) {
    if (DEBUG) console.warn('[state] Failed to migrate old state:', e.message);
  }
  return {
    records: activeProfile === 'andjela' ? [new Date(2026, 4, 28)] : [],
    periodEnds: {},
    symptoms: {},
    moods: {},
    diaries: {},
    settings: { cycleLength: 28, periodLength: 7, manualOverride: false },
    _migrated: true,
  };
}
// Debounced saveState — prevents excessive localStorage writes during rapid clicks
let _saveTimer = null,
  _pushTimer = null;
function saveState() {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(function () {
    localStorage.setItem(
      profileKey(STORAGE_KEY_BASE),
      JSON.stringify({
        records: state.records.map(fmtDate),
        periodEnds: state.periodEnds || {},
        symptoms: state.symptoms,
        moods: state.moods,
        diaries: state.diaries,
        settings: state.settings,
        _migrated: true,
      })
    );
    // Sync shared cycle data for bidirectional calendar
    const pd = JSON.parse(localStorage.getItem(profileKey(STORAGE_KEY_BASE)) || 'null');
    if (pd && pd.records && pd.records.length > 0) {
      localStorage.setItem('shared-cycle-data', JSON.stringify(pd));
    }
    clearTimeout(_pushTimer);
    _pushTimer = setTimeout(function () {
      pushAllSharedData();
    }, 1500);
  }, 200);
}
let state = loadState();
window.state = state;
/* ================================================================
   SOLAR TERMS CACHE — fetched from calendar-data.json
   ================================================================ */
let solarTermsCache = [];

/* Mood, love note, forecast, garden moved to js/render-mood.js */
function renderGarden() {
  const plantEl = document.getElementById('gardenPlant');
  if (plantEl) {
    plantEl.style.transform = '';
    plantEl.style.transition = 'all .5s cubic-bezier(.22, 1, .36, 1)';
  }
  document.getElementById('garden-title').textContent = t('gardenTitle');
  const streak = calculateStreak();
  let p, msg, hint;
  if (streak === 0) {
    p = '🌰';
    msg = t('gardenState0');
    hint = '';
  } else if (streak === 1) {
    p = '🌱';
    msg = t('gardenState1');
    hint = '';
  } else if (streak <= 3) {
    p = '🌿';
    msg = t('gardenState3');
    hint = '';
  } else if (streak <= 7) {
    p = '🌷';
    msg = t('gardenState7');
    hint = '';
  } else {
    p = '🌸';
    msg = t('gardenStateBloom');
    hint = '';
  }
  if (activeProfile === 'andjela' && streak > 0) {
    const phase = getPhase(today(), predict());
    if (phase && phase.startsWith('period')) p = '🌹';
    else if (phase === 'ovulation') p = '🌻';
    else if (phase === 'luteal') p = '🌷';
  }
  document.getElementById('gardenPlant').textContent = p;
  document.getElementById('gardenMsg').textContent = msg;
  document.getElementById('gardenHint').textContent = hint;
}

/* ================================================================
   SHARED DIARY — extracted to js/render-diary.js
   Data access layer (constants + localStorage/GitHub helpers)
   kept here because sync.js and other modules depend on them.
   ================================================================ */
// esc() extracted to js/ui-core.js
// ===== SHARED DIARY HELPERS =====
// These functions are used as globals by js/render-diary.js, js/sync.js, etc.

const SD_KEY = 'shared-diary';
const DATE_STRIP_DAYS = 14; // used by render-diary.js
let sharedDiaryViewDate = new Date(); // used by render-diary.js

function getGitHubToken() {
  var _token = localStorage.getItem('gh-token') || '';
  // 防御性日志：Token 为空时输出警告
  if (!_token) {
    console.warn('[Token] getGitHubToken: Token 为空 — 请先在设置页面配置 GitHub Token');
  } else {
    console.log('[Token] getGitHubToken: Token 存在 (前4位=' + _token.substring(0, 4) + '...)');
  }
  return _token;
}

let _sdCache = null;
function loadSharedDiaryData() {
  if (_sdCache) return _sdCache;
  try {
    _sdCache = JSON.parse(localStorage.getItem(SD_KEY)) || {};
    return _sdCache;
  } catch (e) {
    return {};
  }
}
function saveSharedDiaryData(data) {
  _sdCache = data;
  localStorage.setItem(SD_KEY, JSON.stringify(data));
}
function invalidateSDCache() {
  _sdCache = null;
} // Call when pull from GitHub returns new data

// NOTE: renderDateStrip(), selectDateStrip(), scrollDateStrip() extracted to js/render-diary.js

// Pull partner entries from unified shared-state.json (not old shared-diary.json)
async function pullPartnerEntry(dateKey) {
  if (!getGitHubToken()) return;
  // Use unified pullAllSharedData — applies shared-state.json to localStorage
  // then re-render; avoids dual-format sync drift
  await pullAllSharedData();
  const localData = loadSharedDiaryData();
  const partnerProfile = activeProfile === 'andjela' ? 'barry' : 'andjela';
  // If partner hasn't written for this date, show hint
  const entry = localData[dateKey] && localData[dateKey][partnerProfile];
  return entry || null;
}

// exportSharedDiary(), showImportModal(), importSharedDiary(), doImport() extracted to js/render-diary.js

// renderSharedDiary(), canViewPartnerDiaryEntry(), renderPartnerContent(),
// renderSharedDiaryHistory(), _collectDiaryItems(), _buildTimelineEntry(),
// jumpToDiaryDate() extracted to js/render-diary.js

// ==============================
// TRANSLATION — extracted to js/translate.js
// ==============================

// Character counter listeners + renderDiaryLabels() extracted to js/render-diary.js

// Diary v9 module (renderDiaryPanel, renderMailbox, toggleDiaryCalendar,
// shiftDiaryCalMonth, goDiaryCalToday, saveDiaryEntry, translatePartnerLetter,
// scrollDiaryStrip, letterTextFromEntry, LETTER_MOODS, initSharedDiaryTab,
// _diaryViewDate, _diaryMood, etc.) extracted to js/render-diary.js

/* ================================================================
   MODIFIED: Load lang/theme per-profile
   ================================================================ */
function loadPerProfileSettings() {
  // Default languages: Anđela → Serbian, Barry → Chinese
  const defaultLang = activeProfile === 'barry' ? 'zh-CN' : 'sr';
  let savedLang = localStorage.getItem(profileKey('cycle-lang'));
  // Cleanse: if saved lang is the WRONG profile's default, reset
  if (activeProfile === 'barry' && savedLang === 'sr') savedLang = null;
  if (activeProfile === 'andjela' && savedLang === 'zh-CN') savedLang = null;
  const validLangs = { sr: 1, 'zh-CN': 1, en: 1 };
  window.lang = savedLang && validLangs[savedLang] ? savedLang : defaultLang;
  // ALWAYS save the corrected lang
  if (!savedLang) localStorage.setItem(profileKey('cycle-lang'), lang);
  theme = localStorage.getItem(profileKey('cycle-theme')) || 'light';
  annDateMet = localStorage.getItem('cycle-ann-met') || '2026-03-19';
  annDateLove = localStorage.getItem('cycle-ann-love') || '2026-05-07';
}
function setLang(l) {
  window.lang = l;
  document.documentElement.setAttribute('lang', l);
  localStorage.setItem(profileKey('cycle-lang'), l);
  localStorage.setItem('cycle-lang', l);
}
// applyTheme(), switchTheme() — extracted to js/theme.js

/* ================================================================
   I18N HELPERS
   ================================================================ */
// i18n helper L() defined below (line ~1647) — handles both object and string args

/* ================================================================
   MODIFIED: init
   ================================================================ */
// loadPerProfileSettings() is called in the INIT section below
// window.lang is set in i18n.js (loaded before app.js)
window.lang = localStorage.getItem('cycle-lang') || 'sr';
let theme = localStorage.getItem('cycle-theme') || 'light';
let annDateMet = localStorage.getItem('cycle-ann-met') || '2026-03-19';
let annDateLove = localStorage.getItem('cycle-ann-love') || '2026-05-07';

// exportAllData(), importAllData() — defined in js/render-settings.js

// getFestivalTheme(), applyFestivalTheme(), applySeasonalDecor() — extracted to js/theme.js
function setupOfflineDetection() {
  const banner = document.getElementById('offlineBanner');
  if (!banner) return;
  function update() {
    banner.classList.toggle('show', !navigator.onLine);
    document.getElementById('offline-text').textContent = t('offlineText');
  }
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}
let _deferredPWA = null; // store beforeinstallprompt for manual trigger
function setupPWABanner() {
  const banner = document.getElementById('pwaBanner');
  if (!banner) return;
  if (window.matchMedia('(display-mode: standalone)').matches) return;
  if (!/Mobi|Android/i.test(navigator.userAgent)) return;
  if (localStorage.getItem('pwa-banner-dismissed')) return; // Use native install prompt if available
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    _deferredPWA = e;
    banner.classList.add('show');
    banner.onclick = function () {
      _deferredPWA.prompt();
      _deferredPWA.userChoice.then(function (r) {
        if (r.outcome === 'accepted') {
          banner.classList.remove('show');
          localStorage.setItem('pwa-installed', '1');
        }
      });
    };
  });
  if (_deferredPWA) return; // fallback for browsers without beforeinstallprompt
  banner.classList.add('show');
  banner.onclick = function () {
    banner.classList.remove('show');
    localStorage.setItem('pwa-banner-dismissed', '1');
  };
  document.getElementById('pwa-text').textContent = t('pwaInstallText');
}

// ===== DASHBOARD =====
// Daily conversation starters — rotating questions to deepen understanding
const CONVERSATION_QUESTIONS = {
  sr: [
    'Koja je tvoja najlepša uspomena iz detinjstva?',
    'Šta te je danas nasmejalo?',
    'Kad si se poslednji put osećao/la najviše voljeno?',
    'Koji je tvoj omiljeni miris i na šta te podseća?',
    'Šta bi voleo/la da naučiš zajedno?',
    'Koja pesma te uvek oraspoloži?',
    'Kako voliš da ti neko pokaže da mu je stalo?',
    'Koje mesto bi voleo/la da posetimo zajedno?',
    'Šta najviše ceniš kod mene — iskreno?',
    'Koji je bio najbolji dan u našoj vezi do sada?',
    'Da možeš da promeniš jednu st let na svetu, šta bi to bilo?',
    'Kako zamišljaš naš savršen dan za 10 godina?',
    'Šta te čini ponosnim/om na sebe?',
    'Koji je tvoj omiljeni način da se opustiš?',
    'Kad si poslednji put probao/la nešto novo — i šta je to bilo?',
  ],
  'zh-CN': [
    '你童年最美好的回忆是什么？',
    '今天什么让你笑了？',
    '你最近一次感到被深爱是什么时候？',
    '你最喜欢的气味是什么？它让你想起什么？',
    '你想一起学什么新东西？',
    '哪首歌总是能让你心情变好？',
    '你喜欢别人用什么方式表达对你的在乎？',
    '你最想和我一起去哪里旅行？',
    '你最欣赏我哪一点——说真的？',
    '到目前为止，我们关系中最好的一天是哪天？',
    '如果你能改变世界上的一件事，会是什么？',
    '你想象中我们十年后的完美一天是怎样的？',
    '什么让你为自己感到骄傲？',
    '你最喜欢的放松方式是什么？',
    '你最近一次尝试新事物是什么——尝试了什么？',
  ],
  en: [
    'What is your most beautiful childhood memory?',
    'What made you smile today?',
    'When did you last feel most loved?',
    'What is your favorite scent and what does it remind you of?',
    'What would you like to learn together?',
    'Which song always lifts your mood?',
    'How do you like someone to show they care?',
    'Which place would you love to visit together?',
    'What do you appreciate most about me — honestly?',
    'What was the best day in our relationship so far?',
    'If you could change one thing in the world, what would it be?',
    'How do you imagine our perfect day 10 years from now?',
    'What makes you proud of yourself?',
    'What is your favorite way to relax?',
    'When did you last try something new — and what was it?',
  ],
};
var _dataLoadPromise = null;
var _dataLoaded = false;
function loadDataFiles() {
  if (_dataLoadPromise) return _dataLoadPromise;
  _dataLoadPromise = CultureCardsModule.load()
    .then(function (data) {
      CULTURE_KNOWLEDGE = data;
      _cultureCardIdx = CultureCardsModule.getTodaysIndex();
      _dataLoaded = true;
    })
    .catch(function () {
      _dataLoaded = true;
    });
  return _dataLoadPromise;
}

async function bootApp() {
  // CRITICAL: Sync activeProfile — auth.js sets window.activeProfile, not the module-level let.
  // Re-read from the global source of truth to avoid stale profile bug.
  activeProfile = window.activeProfile || localStorage.getItem('cycle-active-profile') || 'andjela';
  window.activeProfile = activeProfile;
  window.bootApp = bootApp; // Export to global scope for auth.js
  // Hide loader IMMEDIATELY
  const loader = document.getElementById('appLoader');
  if (loader) {
    loader.style.display = 'none';
    if (loader.parentNode) loader.parentNode.removeChild(loader);
  }

  // Build mood name lookup map (O(1) — replaces indexOf scans)
  let moodNamesArr = t('moodNames');
  if (moodNamesArr && moodNamesArr.length === MOOD_KEYS.length) {
    MOOD_NAME_MAP = Object.fromEntries(
      MOOD_KEYS.map(function (k, i) {
        return [k, moodNamesArr[i]];
      })
    );
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js?v=7.3.0').catch(function () {});
  }
  loadPerProfileSettings();

  // Load data in background (do NOT await — never block the UI)
  loadDataFiles().catch(function () {
    /* Non-critical, UI works without data files */
  });

  state = loadState();
  window.state = state;
  lastCycleCount = predict().cycles.length;
  applyTheme(theme);
  setLang(lang);
  applyFestivalTheme();
  applySeasonalDecor();
  setupOfflineDetection();
  setupPWABanner();

  // Render UI immediately with whatever data is available
  updateProfileUI();
  renderAll();
  loadSettingsUI();
  initDashboard();

  // Pull shared data in background (2s timeout, non-blocking)
  if (getGitHubToken()) {
    const ghTimeout = new Promise(function (_, reject) {
      setTimeout(function () {
        reject(new Error('GitHub timeout'));
      }, 2000);
    });
    Promise.race([pullAllSharedData(), ghTimeout])
      .catch(function (e) {})
      .then(function () {
        try {
          const sd = JSON.parse(localStorage.getItem('shared-cycle-data') || 'null');
          if (sd && sd.records) {
            state.records = sd.records.map(function (r) {
              return new Date(r);
            });
            state.periodEnds = sd.periodEnds || {};
            state.symptoms = sd.symptoms || {};
            state.settings = sd.settings || { cycleLength: 28, periodLength: 7 };
          }
        } catch (e) {
          /* non-critical */
        }
        if (activeProfile === 'barry') {
          renderCalendar();
          renderBarrySymptomView();
          renderTips();
        }
        renderHug();
        renderGratitude();
        renderSong();
        renderCheckin();
        renderKnowMe();
        renderSharedDiary();
        renderDateStrip();
        renderDashboard(); // Refresh dashboard with synced data
        updateSyncStatusBadge();
        updateCycleCounter(predict().cycles.length);
      })
      .catch(function (e) {});
  }

  fetchWeather();
  loadCalendarData(function (data) {
    solarTermsCache = (data && data.solarTerms) || [];
    localStorage.setItem('cycle-solarterms', JSON.stringify(solarTermsCache));
    renderCalendar();
  });
  showOnboardingIfNeeded();
  if (activeProfile === 'andjela' && !sessionStorage.getItem('_greetingShown')) showGreeting();
  updateMoonPhase();
  updateAnniversaryCount();
  updateCycleCounter(predict().cycles.length);
  lastCycleCount = predict().cycles.length;
  updateLoveCounter();
  updateProfileUI();
  // Dim symptoms tab for Anđela (click shows toast instead of redirect)
  const symTab = document.getElementById('tab-symptoms');
  if (symTab) {
    symTab.style.opacity = activeProfile === 'barry' ? '' : '0.45';
    symTab.title = activeProfile === 'barry' ? '' : t('profileOnly') || 'Only Barry can view this';
  }
  randomThinkingOfYou();

  // Modal keyboard trap: Escape closes, Tab traps focus
  const modalKeydown = function (e) {
    if (e.key === 'Escape') {
      closeModal();
      return;
    }
    if (e.key === 'Tab') {
      const modal = document.getElementById('modal');
      if (!modal || modal.classList.contains('hidden')) return;
      const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0],
        last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  };
  document.addEventListener('keydown', modalKeydown);

  // Restore tab from URL hash on load
  const initTab = location.hash.replace('#', '') || 'dashboard';
  if (document.getElementById('panel-' + initTab)) {
    switchToTab(initTab);
  }

  // Swipe gesture on calendar container (initialized once)
  initCalendarSwipe();
  // Month label click opens year/month picker
  setupMonthPicker();

  // GSAP animations (deep gsap-skills integration)
  initGsapAnimations();
  setTimeout(function () {
    animateLoginEntrance();
  }, 100);
}

// Hash change handler for forward/back navigation
window.addEventListener('hashchange', function () {
  const tab = location.hash.replace('#', '') || 'dashboard';
  if (document.getElementById('panel-' + tab)) switchToTab(tab);
});

// Profile-aware overrides happen in loadPerProfileSettings() below

// i18n map helper: L({sr:'...',en:'...',zh:'...'}) -> value for current lang
function L(sr, en, zh) {
  if (typeof sr === 'object') {
    const m = sr;
    return m[lang] || m[lang.split('-')[0]] || m['sr'] || '';
  }
  if (lang === 'sr' || lang === 'sr-RS') return sr;
  if (lang === 'en') return en;
  return zh || sr;
}

function switchLanguage(l) {
  setLang(l);
  applyAllUI();
  loadSettingsUI();
  document.getElementById('set-language').value = l;
  renderLunarInfo();
  renderSeasonalPoemCard();
}

/* ================================================================
   HOLIDAY DATA — China 🇨🇳 + Serbia 🇷🇸
   ================================================================ */
let HOLIDAYS = [];
let HOLIDAY_DAYS = {};

/* ================================================================
   HOLIDAY DATA LOADER — fetches holidays.json asynchronously
   ================================================================ */
function loadHolidays() {
  return fetch('data/holidays.json')
    .then(function (r) {
      if (!r.ok) throw new Error('Failed to load holidays.json');
      return r.json();
    })
    .then(function (data) {
      HOLIDAYS = data.holidays || [];
      HOLIDAY_DAYS = data.holidayDays || {};
      // Re-render calendar with holiday data now available
      renderCalendar();
    })
    .catch(function () {
      /* Non-critical, holidays not available */
    });
}
loadHolidays();

/** Holiday lookup with O(1) cache — replaces O(n) .filter() per cell */
let _holidayCache = null;
function saveAnniversaries() {
  annDateMet = document.getElementById('annDateMet').value;
  annDateLove = document.getElementById('annDateLove').value;
  localStorage.setItem('cycle-ann-met', annDateMet);
  localStorage.setItem('cycle-ann-love', annDateLove);
  updateAnniversaryCount();
  renderCalendar();
}
function updateAnniversaryCount() {
  const el = document.getElementById('ann-count');
  if (!el) return;
  const parts = [];
  if (annDateMet) {
    const d = daysDiff(new Date(annDateMet), today());
    if (d >= 0) parts.push(t('annCountMet').replace('{n}', d));
  }
  if (annDateLove) {
    const d = daysDiff(new Date(annDateLove), today());
    if (d >= 0) parts.push(t('annCountLove').replace('{n}', d));
  }
  el.innerHTML = parts.join('<br>');
}
function isAnniversary(d) {
  let result = 0;
  if (annDateMet) {
    const ad = new Date(annDateMet);
    if (d.getDate() === ad.getDate() && d.getMonth() === ad.getMonth()) result = 1;
  }
  if (annDateLove) {
    const ad = new Date(annDateLove);
    if (d.getDate() === ad.getDate() && d.getMonth() === ad.getMonth()) result = 2;
  }
  return result;
}

/* ================================================================
   DATA — migrated to profile-aware storage above
   ================================================================ */
// Date utilities (fmtDate, sameDay, addDays, daysDiff, d0, today)
// are now defined in js/cycle-core.js — loaded before app.js

/* ================================================================
   TEA ROOM — Serbian × Chinese Herbal Wisdom / Сербија × 中国
   ================================================================ */
const TEA_PAIRS = [
  {
    emoji: '🍵',
    name: { sr: 'Čaj od nane', en: 'Mint Tea', 'zh-CN': '薄荷茶' },
    desc: { sr: 'Osvežava i smiruje želudac — srpski klasik', en: 'Cooling, calms the stomach — Serbian classic', 'zh-CN': '清凉舒胃——塞尔维亚经典' },
    msg: {
      sr: 'U Kini piju čaj od hrizanteme za isto — dva sveta, jedna mudrost 🌸',
      en: 'In China they drink chrysanthemum for the same — two worlds, one wisdom 🌸',
      'zh-CN': '中国人用菊花茶达到同样效果——两个世界，同一种智慧 🌸',
    },
    phase: 'general',
  },
  {
    emoji: '🌼',
    name: { sr: 'Čaj od kamilice', en: 'Chamomile Tea', 'zh-CN': '洋甘菊茶' },
    desc: { sr: 'Za miran san i nežno srce', en: 'For peaceful sleep & a gentle heart', 'zh-CN': '安神助眠，温柔入心' },
    msg: {
      sr: 'U Kini — čaj od jasmina. Cveće leči, svuda na svetu 🌙',
      en: 'In China — jasmine tea. Flowers heal, everywhere on Earth 🌙',
      'zh-CN': '中国有茉莉花茶——花能疗愈，天下皆然 🌙',
    },
    phase: 'luteal',
  },
  {
    emoji: '🫚',
    name: { sr: 'Čaj od đumbira', en: 'Ginger Tea', 'zh-CN': '姜茶' },
    desc: { sr: 'Greje telo i dušu — protiv grčeva', en: 'Warms body & soul — anti-cramp', 'zh-CN': '暖身暖心——缓解痉挛' },
    msg: {
      sr: 'Kineska tradicija: đumbir + crvene urme = 姜枣茶. Isti đumbir, ista ljubav ❤️',
      en: 'Chinese tradition: ginger + red dates = 姜枣茶. Same ginger, same love ❤️',
      'zh-CN': '中国古方：生姜+红枣=姜枣茶。同样的姜，同样的爱 ❤️',
    },
    phase: 'period',
  },
  {
    emoji: '🌿',
    name: { sr: 'Čaj od žalfije', en: 'Sage Tea', 'zh-CN': '鼠尾草茶' },
    desc: { sr: 'Protiv upala, za žensko zdravlje', en: "Anti-inflammatory, for women's health", 'zh-CN': '消炎，关爱女性健康' },
    msg: {
      sr: 'U tradicionalnoj kineskoj medicini — 丹参 (kadulja) hrani krv. Biljke ne znaju granice 🌿',
      en: 'In TCM — 丹参 (red sage) nourishes blood. Herbs know no borders 🌿',
      'zh-CN': '中医里的丹参养血活血——草药无国界 🌿',
    },
    phase: 'follicular',
  },
  {
    emoji: '🫐',
    name: { sr: 'Čaj od šipurka', en: 'Rosehip Tea', 'zh-CN': '玫瑰果茶' },
    desc: { sr: 'Bogat vitaminom C — srpska tradicija', en: 'Rich in vitamin C — Serbian tradition', 'zh-CN': '富含维C——塞尔维亚传统' },
    msg: {
      sr: 'U Kini — čaj od goji bobica (枸杞). Crveno voće = snaga u obe kulture 🔴',
      en: 'In China — goji berry tea (枸杞). Red fruit = strength in both cultures 🔴',
      'zh-CN': '中国有枸杞茶——红色果实=两种文化中的力量 🔴',
    },
    phase: 'general',
  },
  {
    emoji: '🍂',
    name: { sr: 'Čaj od lipe', en: 'Linden Tea', 'zh-CN': '椴花茶' },
    desc: { sr: 'Protiv prehlade, za tople noći', en: 'Against colds, for warm nights', 'zh-CN': '驱寒保暖，温暖夜晚' },
    msg: {
      sr: 'Lipa = sveto drvo Slovena. U Kini — 桂花茶 (osmanthus). Drveće spaja narode 🌳',
      en: 'Linden = sacred Slavic tree. In China — osmanthus tea. Trees unite peoples 🌳',
      'zh-CN': '椴树=斯拉夫人的圣树。中国有桂花——树连接着民族 🌳',
    },
    phase: 'general',
  },
];
function renderTea() {
  const teaName = document.getElementById('tea-name');
  const teaDesc = document.getElementById('tea-desc');
  const teaMsg = document.getElementById('tea-msg');
  const teaIcon = document.getElementById('tea-icon');
  const teaTitle = document.getElementById('tea-title');
  if (!teaName) return;
  let phase = 'general';
  if (activeProfile === 'andjela') {
    const pred = predict();
    const ph = getPhase(today(), pred);
    if (ph === 'period-on' || ph === 'period-mid') phase = 'period';
    else if (ph === 'ovulation' || ph === 'fertile') phase = 'ovulation';
    else if (ph === 'follicular') phase = 'follicular';
    else if (ph === 'luteal') phase = 'luteal';
  }
  let candidates = TEA_PAIRS.filter(function (t) {
    return t.phase === phase;
  });
  if (candidates.length === 0) {
    candidates = TEA_PAIRS.filter(function (t) {
      return t.phase === 'general';
    });
  }
  const tea = candidates[Math.floor(Math.random() * candidates.length)];
  teaIcon.textContent = tea.emoji;
  teaName.textContent = tea.name[lang] || tea.name['sr'];
  teaDesc.textContent = tea.desc[lang] || tea.desc['sr'];
  teaMsg.textContent = tea.msg[lang] || tea.msg['sr'];
  teaTitle.textContent = t('teaTitle');
}

/* ================================================================
   CALENDAR DATA LOADER — rich stories + solar terms
   ================================================================ */
let calendarExtraData = null;
function randomThinkingOfYou() {
  if (activeProfile !== 'andjela') return;
  if (Math.random() > 0.18) return; // 18% chance
  const msgs =
    lang === 'sr'
      ? [
          'Upravo sam pomislio na tebe ♥',
          'Nadam se da se osećaš dobro danas ✨',
          'Tvoj osmeh mi je najdraža st let 🌸',
          'Mislim na tebe... uvek 💫',
          'Barry je upravo pomislio na tebe 💝',
        ]
      : lang === 'en'
        ? [
            'Just thought of you ♥',
            'Hope you are feeling good today ✨',
            'Your smile is my favorite thing 🌸',
            'Thinking of you... always 💫',
            'Barry was just thinking of you 💝',
          ]
        : ['刚刚在想你 ♥', '希望你今天心情好 ✨', '你的笑容是我最喜欢的 🌸', '一直在想你 💫', 'Barry 刚刚想到了你 💝'];
  const msg = msgs[Math.floor(Math.random() * msgs.length)];
  setTimeout(function () {
    toast(msg);
  }, 3000);
}

/* ================================================================
   GREETING OVERLAY
   ================================================================ */
function showGreeting() {
  if (sessionStorage.getItem('_greetingShown')) return;
  sessionStorage.setItem('_greetingShown', '1');
  const overlay = document.getElementById('greetingOverlay');
  if (!overlay) return;
  const g = (I18N[lang] || I18N[lang.split('-')[0]] || I18N['sr']).greeting;
  if (!g) return;
  const hour = new Date().getHours();
  let slot;
  if (hour >= 5 && hour < 12) slot = g.morning;
  else if (hour >= 12 && hour < 18) slot = g.afternoon;
  else if (hour >= 18 && hour < 23) slot = g.evening;
  else slot = g.night;
  document.getElementById('greetingIcon').textContent = slot.icon;
  document.getElementById('greetingName').textContent = slot.name;
  document.getElementById('greetingMsg').textContent = slot.msg;
  document.getElementById('greetingSub').textContent = slot.sub;
  overlay.style.display = 'flex';
  overlay.classList.remove('hidden');
  spawnFeathers();
  animateGreetingIn();
  // Auto-dismiss after 2.8 seconds
  clearTimeout(window._greetingTimer);
  window._greetingTimer = setTimeout(function () {
    overlay.classList.add('hiding');
    setTimeout(function () {
      overlay.style.display = 'none';
      overlay.classList.add('hidden');
      overlay.classList.remove('hiding');
    }, 400);
  }, 2800);
}
// Greeting dismissed by inline onclick on the overlay — no JS function needed
function spawnFeathers() {
  const card = document.querySelector('.greeting-card');
  if (!card) return;
  for (let i = 0; i < 8; i++) {
    const feather = document.createElement('span');
    feather.className = 'feather';
    feather.textContent = ['🪶', '✦', '·'][i % 3];
    feather.style.left = 10 + Math.random() * 80 + '%';
    feather.style.top = 5 + Math.random() * 40 + '%';
    feather.style.animationDelay = Math.random() * 2 + 's';
    feather.style.animationDuration = 3 + Math.random() * 3 + 's';
    card.appendChild(feather);
    setTimeout(() => feather.remove(), 5000);
  }
}

/* ================================================================
   MOON PHASE
   ================================================================ */
function updateMoonPhase() {
  const el = document.getElementById('moonPhase');
  // Simple moon phase approximation
  const lp = 2551443; // lunar period in seconds
  const nm = new Date('2000-01-06T18:14:00Z').getTime() / 1000;
  const phase = ((Date.now() / 1000 - nm) % lp) / lp;
  const icons = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
  const idx = Math.round(phase * 8) % 8;
  el.innerHTML = `<span class="moon-icon">${icons[idx]}</span>`;
}

/* ================================================================
   EASTER EGGS
   ================================================================ */
function handleTitleClick() {
  titleClicks++;
  if (titleClicks >= 5) {
    titleClicks = 0;
    spawnPetals();
  }
  setTimeout(() => {
    if (titleClicks < 5 && titleClicks > 0) titleClicks = 0;
  }, 2000);
}
function spawnPetals() {
  const petals = ['🌸', '💮', '🌺', '🩷', '✿', '🌷'];
  for (let i = 0; i < 25; i++) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.textContent = petals[Math.floor(Math.random() * petals.length)];
    petal.style.left = Math.random() * 100 + '%';
    petal.style.top = -(10 + Math.random() * 30) + 'px';
    petal.style.animationDelay = Math.random() * 1.5 + 's';
    petal.style.animationDuration = 3 + Math.random() * 3 + 's';
    petal.style.fontSize = 0.8 + Math.random() * 1.5 + 'rem';
    document.body.appendChild(petal);
    setTimeout(() => petal.remove(), 5000);
  }
}

/* ================================================================
   CYCLE CELEBRATION
   ================================================================ */
function checkCycleCelebration() {
  const cycles = predict().cycles.length;
  if (cycles > lastCycleCount && cycles >= 1 && state.records.length >= 2) {
    lastCycleCount = cycles;
    const el = document.createElement('div');
    el.className = 'cycle-celebration';
    el.innerHTML = `<span class="celeb-icon">💝</span><span class="celeb-text">${t('cycleCounter').replace('{n}', cycles)}</span>`;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity .6s';
    }, 3000);
    setTimeout(() => el.remove(), 4000);
    // Update cycle counter
    updateCycleCounter(cycles);
  }
}
function updateCycleCounter(n) {
  const card = document.getElementById('cycleCounterCard');
  if (!card) return;
  if (n > 0) {
    card.style.display = '';
    document.getElementById('cc-count').textContent = n;
    document.getElementById('cc-subtitle').textContent = t('cycleCounterSub');
  } else card.style.display = 'none';
}

/* ================================================================
   PREDICTION
   ================================================================ */
// predict(), getPeriodEndDate(), getPhase() defined in js/cycle-core.js

/* predict(), getPeriodEndDate(), getPhase() defined in js/cycle-core.js */

/* ChartRenderer extracted to js/chart-renderer.js — loaded via <script> in index.html */

/* ================================================================
   UI STATE
   ================================================================ */
CalState.year = today().getFullYear(),
  CalState.month = today().getMonth();
CalState.view = 'month'; // 'month' | 'week'
let _weekOffset = 0; // weeks offset from today when in week view
let selectedDate = null,
  symptomDate = null,
  knowledgeOpen = false;

/* ================================================================
   UI UPDATE
   ================================================================ */
function updateLangUI() {
  document.getElementById('h-title').textContent = t('appTitle');
  document.getElementById('todayBtn').textContent = t('today');
  document.querySelectorAll('.tb-label').forEach((el, i) => {
    el.textContent = t('tabs')[i];
  });
  document.getElementById('set-language').value = lang;
  document.querySelectorAll('.lang-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  let wd = t('weekdays');
  let weekdaysEl = document.getElementById('weekdaysRow');
  weekdaysEl.setAttribute('role', 'row');
  weekdaysEl.innerHTML =
    '<span role="gridcell" aria-hidden="true"></span>' +
    wd
      .map(function (d, i) {
        return '<span role="columnheader" scope="col"' + (i >= 5 ? ' style="color:var(--rose);opacity:.6"' : '') + '>' + d + '</span>';
      })
      .join('');
  const lg = t('legend');
  document.getElementById('legend').innerHTML =
    `<span class="l-period">${lg[0]}</span><span class="l-fertile">${lg[1]}</span><span class="l-follicular">${lg[2]}</span><span class="l-luteal">${lg[3]}</span><span style="font-weight:700;font-size:.66rem;">▣ ${lg[4]}</span>`;
  if (annDateMet || annDateLove) document.getElementById('legend').innerHTML += `<span class="l-heart">${lg[5]}</span>`;
  document.getElementById('legend').innerHTML +=
    '<span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:50%;background:#E53935;display:inline-block"></span>🇨🇳</span><span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:50%;background:#0C4076;display:inline-block"></span>🇷🇸</span><span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:50%;background:#4CAF50;display:inline-block"></span>🌿</span>';
  const pl = t('progressLabels');
  document.querySelector('.lbl-period').textContent = pl[0];
  document.querySelector('.lbl-follicular').textContent = pl[1];
  document.querySelector('.lbl-ovulation').textContent = pl[2];
  document.querySelector('.lbl-luteal').textContent = pl[3];
  const syms = t('symptoms');
  document.getElementById('symptomGrid').innerHTML = ['cramps', 'mood', 'flow', 'headache', 'fatigue', 'cravings']
    .map(
      (s) =>
        `<div class="symptom-item" onclick="cycleSymptom('${s}')"><span class="emoji">${{ cramps: '😣', mood: '😊', flow: '💧', headache: '🤕', fatigue: '😴', cravings: '🍫' }[s]}</span><span class="sname">${syms[s]}</span><div class="symptom-dots" id="dots-${s}"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div></div>`
    )
    .join('');
  document.getElementById('symptom-empty-text').innerHTML = t('emptySymptom');
  document.getElementById('symptom-notes').placeholder = t('modal.notesPlaceholder');
  document.getElementById('symptom-save-btn').textContent = '💾 ' + t('toast.symptomSaved').replace(' ✓', '');
  const emojis = { cramps: '😣', mood: '😊', flow: '💧', headache: '🤕', fatigue: '😴', cravings: '🍫' };
  document.getElementById('modal-symptoms').innerHTML = ['cramps', 'mood', 'flow', 'headache', 'fatigue', 'cravings']
    .map((s) => `<button class="sym-chip" data-s="${s}">${emojis[s]} ${syms[s]}</button>`)
    .join('');
  const st = t('settings');
  ['set-l-lang', 'set-l-theme', 'set-l-cycle', 'set-l-period', 'set-l-override'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = st[id.replace('set-l-', '')] || '';
    }
  });
  ['set-h-lang', 'set-h-theme', 'set-h-cycle', 'set-h-period', 'set-h-override'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = st[id.replace('set-h-', '') + 'Hint'] || '';
    }
  });
  document.getElementById('save-settings-btn').textContent = st.save;
  document.getElementById('export-btn').textContent = st.export;
  document.getElementById('import-btn').textContent = st.import;
  document.getElementById('clear-btn').textContent = st.clear;
  // Settings extras
  document.getElementById('export-all-label').textContent = t('settingsExportAll');
  document.getElementById('import-all-label').textContent = t('settingsImportAll');
  document.getElementById('clear-diary-btn').innerHTML = t('settingsClearDiary');
  // Diary panel i18n
  const ta = document.getElementById('diaryTextarea');
  if (ta) ta.placeholder = t('diary.placeholder');
  document.getElementById('sd-export').textContent = st.export;
  document.getElementById('sd-import').textContent = st.import;
  // Diary aria-labels
  const dsp = document.querySelector('.date-strip-arrow[onclick*="scrollDiaryStrip(-1)"]');
  if (dsp) dsp.setAttribute('aria-label', t('diaryDateStripPrev'));
  const dsn = document.querySelector('.date-strip-arrow[onclick*="scrollDiaryStrip(1)"]');
  if (dsn) dsn.setAttribute('aria-label', t('diaryDateStripNext'));
  const cpm = document.querySelector('.nav-btn[onclick*="shiftDiaryCalMonth(-1)"]');
  if (cpm) cpm.setAttribute('aria-label', t('diaryCalPrevMonth'));
  const cpn = document.querySelector('.nav-btn[onclick*="shiftDiaryCalMonth(1)"]');
  if (cpn) cpn.setAttribute('aria-label', t('diaryCalNextMonth'));
  // Footer credit
  const fc = document.querySelector('.footer-credit');
  if (fc) fc.textContent = t('diaryFooterCredit');
  // Diary calendar button title
  const calBtn = document.querySelector('.diary-cal-btn');
  if (calBtn) calBtn.setAttribute('title', t('diaryCalBtnTitle'));
  // Theme option labels
  const themeSel = document.getElementById('set-theme');
  if (themeSel) {
    themeSel.options[0].text = t('settingsThemeLight');
    themeSel.options[1].text = t('settingsThemeDark');
  }
  document.getElementById('anniversary-title').textContent = t('anniversaryTitle');
  document.getElementById('ann-met-label').textContent = t('annMetLabel');
  document.getElementById('ann-love-label').textContent = t('annLoveLabel');
  updateAnniversaryCount();
  const ss = t('stats');
  document.getElementById('st-title-cycle').textContent = ss.cycleTitle;
  document.getElementById('st-title-history').textContent = ss.historyTitle;
  document.getElementById('st-title-pred').textContent = ss.predTitle;
  document.getElementById('st-l-count').textContent = ss.count;
  document.getElementById('st-l-avg').textContent = ss.avg;
  document.getElementById('st-l-range').textContent = ss.range;
  document.getElementById('st-l-reg').textContent = ss.reg;
  document.getElementById('st-l-next').textContent = ss.next;
  document.getElementById('st-l-ovu').textContent = ss.ovulation;
  document.getElementById('st-l-fert').textContent = ss.fertile;
  document.getElementById('st-l-conf').textContent = ss.confidence;
  document.getElementById('st-l-future').textContent = ss.future;
  document.getElementById('historyLabel').textContent = t('historyLabel');
  document.getElementById('cc-title').textContent = '💝 ' + t('cycleCounter').replace('{n}', '');
  const md = t('modal');
  document.getElementById('m-l-phase').textContent = md.phase;
  document.getElementById('m-l-day').textContent = md.day;
  document.getElementById('m-l-symp').textContent = md.symptoms;
  document.getElementById('m-l-holiday').textContent = t('modalHolidayLabel');
  document.getElementById('m-l-solar').textContent = t('modalSolarLabel');
  document.getElementById('m-l-special').textContent = t('modalSpecialLabel');
  document.getElementById('m-divider').textContent = md.quickSymptom;
  document.getElementById('modal-close-btn').textContent = md.close;
  document.getElementById('fab-label').textContent = t('fabLabel');
}

// Lazy-load rich solar term data from calendar-data.json if not cached yet
function applyAllUI(what) {
  const all = !what || what === 'all';
  if (all || what === 'core' || (Array.isArray(what) && what.indexOf('core') >= 0)) {
    updateLangUI();
    updateProfileUI();
    updateFab();
    updateLoveCounter();
    renderSolarTermBadge();
    renderSpecialBadge();
    renderBirthdayCard();
    renderLunarInfo();
    renderSeasonalPoemCard();
  }
  if (all || what === 'calendar' || (Array.isArray(what) && what.indexOf('calendar') >= 0)) {
    renderCalendar();
  }
  if (all || what === 'mood' || (Array.isArray(what) && what.indexOf('mood') >= 0)) {
    renderMoodSection();
    renderGarden();
  }
  if (all || what === 'stats' || (Array.isArray(what) && what.indexOf('stats') >= 0)) {
    renderStatsPanel();
  }
  // Letters module renders on-demand when diary tab is active (no auto-refresh needed)
  if (all || what === 'connection' || (Array.isArray(what) && what.indexOf('connection') >= 0)) {
    renderLoveNote();
    renderForecast();
    renderRelTips();
    renderHug();
    renderSong();
    renderCheckin();
    renderSleepCard();
    renderGratitude();
  }
  if (all || what === 'tips' || (Array.isArray(what) && what.indexOf('tips') >= 0)) {
    if (document.getElementById('panel-tips').classList.contains('active')) renderTips();
  }
  if (all || what === 'barry' || (Array.isArray(what) && what.indexOf('barry') >= 0)) {
    if (activeProfile === 'barry') renderBarrySymptomView();
  }
  if (all || what === 'tea' || (Array.isArray(what) && what.indexOf('tea') >= 0)) {
    renderTea();
  }
  if (all || what === 'weather' || (Array.isArray(what) && what.indexOf('weather') >= 0)) {
    const wc = localStorage.getItem('cycle-weather');
    if (wc) {
      try {
        renderWeather(JSON.parse(wc));
      } catch (e) {
        _dbg('[weather] Bad cached render data');
      }
    }
  }
  // Always refresh shared state and symptoms (lightweight, needed for cross-profile sync)
  if (all) {
    updateSharedCycleInfo();
    updateSharedSymptoms();
  }
  if (symptomDate) renderSymptomPanel(symptomDate);
}
const renderAll = applyAllUI;

/* ================================================================
   IMMUTABLE STATE HELPERS
   ================================================================ */
/** Toggle a period record for a date (immutable state update) */
/* togglePeriodRecord: 单一实现移至下方 (line ~2194)。
   此处不再重复声明，避免函数提升导致的重复定义遮蔽。 */

/* ================================================================
   CALENDAR
   ================================================================ */
const SEASON_EMOJI = { 0: '❄️', 1: '❄️', 2: '🌸', 3: '🌸', 4: '🌸', 5: '☀️', 6: '☀️', 7: '☀️', 8: '🍂', 9: '🍂', 10: '🍂', 11: '❄️' };
const SEASON_LABEL = {
  sr: { 0: 'Zima', 1: 'Zima', 2: 'Proleće', 3: 'Proleće', 4: 'Proleće', 5: 'Leto', 6: 'Leto', 7: 'Leto', 8: 'Jesen', 9: 'Jesen', 10: 'Jesen', 11: 'Zima' },
  en: {
    0: 'Winter',
    1: 'Winter',
    2: 'Spring',
    3: 'Spring',
    4: 'Spring',
    5: 'Summer',
    6: 'Summer',
    7: 'Summer',
    8: 'Autumn',
    9: 'Autumn',
    10: 'Autumn',
    11: 'Winter',
  },
  'zh-CN': { 0: '冬', 1: '冬', 2: '春', 3: '春', 4: '春', 5: '夏', 6: '夏', 7: '夏', 8: '秋', 9: '秋', 10: '秋', 11: '冬' },
};
function getSeasonLabel(month) {
  return SEASON_LABEL[lang] ? SEASON_LABEL[lang][month] : SEASON_LABEL['sr'][month];
}
function renderCalendar() {
  // Orchestrator: delegates to specialized sub-functions
  let pred = predict();
  let td = today();
  let monthLabel = document.getElementById('monthLabel');
  if (CalState.view === 'week') {
    let monday = getWeekStart();
    let sunday = addDays(monday, 6);
    if (lang === 'sr') {
      monthLabel.textContent = monday.getDate() + '. ' + t('months')[monday.getMonth()] + ' — ' + sunday.getDate() + '. ' + t('months')[sunday.getMonth()];
    } else if (lang === 'en') {
      monthLabel.textContent = t('months')[monday.getMonth()] + ' ' + monday.getDate() + ' — ' + t('months')[sunday.getMonth()] + ' ' + sunday.getDate();
    } else {
      monthLabel.textContent = monday.getMonth() + 1 + '月' + monday.getDate() + '日 — ' + (sunday.getMonth() + 1) + '月' + sunday.getDate() + '日';
    }
  } else {
    monthLabel.textContent =
      lang === 'sr'
        ? t('months')[CalState.month] + ' ' + CalState.year + '.'
        : lang === 'en'
          ? t('months')[CalState.month] + ' ' + CalState.year
          : CalState.year + '年' + (CalState.month + 1) + '月';
  }
  let grid = document.getElementById('daysGrid');
  // [STEP 3] 使用 CycleEngine + CalendarRenderer 替换旧的 buildCalendarGrid
  var engCells = CycleEngine.computeCalendarCells(CalState.year, CalState.month, state.records, state.periodEnds, state.settings, td);
  CalendarRenderer.render(grid, engCells, {
    isWeekView: CalState.view === 'week',
    viewMonth: CalState.month,
    viewYear: CalState.year,
    pred: pred,
    activeProfile: activeProfile,
    lang: lang,
    symptoms: state.symptoms,
  });
  updateCalendarSeason();
  updateProgress(pred);
  updateStats(pred);
  updateHistoryDots(pred);
  updateReminder(pred);
  renderMonthHolidaySummary();
  renderUpcomingHoliday();
  animateCalendarDays();
}

/** Build the day grid DOM fragment (supports month and week view) */
/** @deprecated Replaced by CycleEngine + CalendarRenderer. Preserved for rollback. */
function buildCalendarGrid(grid, pred, td) {
  // [DEPRECATED] Replaced by CycleEngine + CalendarRenderer. See fix-all.js.
  return;
}

/** Update month season tag after grid render */
function updateCalendarSeason() {
  let ml = document.getElementById('monthLabel');
  if (!ml) return;
  let existingTag = ml.querySelector('.season-tag');
  if (existingTag) existingTag.remove();
  ml.innerHTML = ml.textContent + ' <span class="season-tag">' + SEASON_EMOJI[CalState.month] + ' ' + getSeasonLabel(CalState.month) + '</span>';
  // Add seasonal data attribute to calendar container for CSS styling
  let container = document.getElementById('calendarContainer');
  if (container) {
    let seasons = ['spring', 'spring', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];
    container.dataset.season = seasons[CalState.month] || 'spring';
  }
}

/** Initialize swipe gesture on calendar container */
function initCalendarSwipe() {
  let container = document.getElementById('calendarContainer');
  if (!container) return;
  let startX = 0,
    startY = 0;
  container.addEventListener(
    'touchstart',
    function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    },
    { passive: true }
  );
  container.addEventListener(
    'touchend',
    function (e) {
      let endX = e.changedTouches[0].clientX;
      let endY = e.changedTouches[0].clientY;
      let diffX = endX - startX;
      let diffY = endY - startY;
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) changeMonth(-1);
        else changeMonth(1);
      }
    },
    { passive: true }
  );
}

/** Setup month label click — shows year/month picker overlay */
function setupMonthPicker() {
  let ml = document.getElementById('monthLabel');
  if (!ml) return;
  ml.style.cursor = 'pointer';
  ml.title = ml.title || t('monthPickerHint') || 'Click to jump';
  ml.addEventListener('click', function (e) {
    e.stopPropagation();
    showMonthPicker();
  });
  // Close picker on Escape
  document.addEventListener('keydown', function mpEscape(e) {
    if (e.key === 'Escape' && _mpickerEl) {
      closeMonthPicker();
    }
  });
}

/** Show year/month picker overlay */
let _mpickerEl = null;
function showMonthPicker() {
  closeMonthPicker();
  let overlay = document.createElement('div');
  overlay.className = 'month-picker-overlay';
  overlay.id = 'monthPickerOverlay';
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeMonthPicker();
  });

  let box = document.createElement('div');
  box.className = 'month-picker-box';

  // Year nav
  let yearRow = document.createElement('div');
  yearRow.className = 'mp-year-row';
  let prevBtn = document.createElement('button');
  prevBtn.className = 'mp-nav-btn';
  prevBtn.textContent = '◂';
  prevBtn.addEventListener('click', function () {
    _mpYear--;
    renderMPicker(box);
  });
  let yearLabel = document.createElement('span');
  yearLabel.className = 'mp-year-label';
  yearLabel.id = 'mpYearLabel';
  let nextBtn = document.createElement('button');
  nextBtn.className = 'mp-nav-btn';
  nextBtn.textContent = '▸';
  nextBtn.addEventListener('click', function () {
    _mpYear++;
    renderMPicker(box);
  });
  yearRow.appendChild(prevBtn);
  yearRow.appendChild(yearLabel);
  yearRow.appendChild(nextBtn);
  box.appendChild(yearRow);

  // Month grid
  let grid = document.createElement('div');
  grid.className = 'mp-month-grid';
  grid.id = 'mpMonthGrid';
  box.appendChild(grid);

  overlay.appendChild(box);
  document.body.appendChild(overlay);
  _mpickerEl = overlay;
  _mpYear = CalState.year;
  renderMPicker(box);
}

let _mpYear = 0;
function renderMPicker(box) {
  let yearLabel = document.getElementById('mpYearLabel');
  let grid = document.getElementById('mpMonthGrid');
  if (!yearLabel || !grid) return;
  yearLabel.textContent = String(_mpYear);
  grid.innerHTML = '';
  for (let i = 0; i < 12; i++) {
    let cell = document.createElement('button');
    cell.className = 'mp-month-cell';
    cell.textContent = t('months')[i] || (lang === 'zh-CN' ? i + 1 + '月' : i + 1);
    if (_mpYear === CalState.year && i === CalState.month) cell.classList.add('mp-current');
    cell.addEventListener(
      'click',
      (function (y, m) {
        return function () {
          CalState.year = y;
          CalState.month = m;
          closeMonthPicker();
          renderCalendar();
        };
      })(_mpYear, i)
    );
    grid.appendChild(cell);
  }
}

function closeMonthPicker() {
  if (_mpickerEl) {
    _mpickerEl.remove();
    _mpickerEl = null;
  }
}

function updateProgress(pred) {
  const td = today();
  const numEl = document.getElementById('pg-num');
  const unitEl = document.getElementById('pg-unit');
  const subEl = document.getElementById('pg-sub');
  const fillEl = document.getElementById('pg-fill');
  const badgeEl = document.getElementById('pg-badge');
  const badges = t('phaseBadges');
  // Cache phase label elements (used up to 3× per call)
  const phaseLabels = document.querySelectorAll('.progress-labels span');
  if (state.records.length === 0) {
    numEl.textContent = '--';
    unitEl.textContent = '';
    subEl.textContent = t('emptyState');
    fillEl.style.width = '0%';
    badgeEl.textContent = '';
    badgeEl.className = 'phase-badge';
    phaseLabels.forEach((s) => s.classList.remove('current'));
    return;
  }
  const phase = getPhase(td, pred);
  let pct = 0,
    label = '',
    bCls = '';
  phaseLabels.forEach((s) => s.classList.remove('current'));
  if (phase === 'period-on' || phase === 'period-mid') {
    const cur = state.records.find((r) => {
      const s = d0(r);
      const e = getPeriodEndDate(r) || addDays(s, pred.periodLen - 1);
      return td >= s && td <= e;
    });
    const dayNum = cur ? daysDiff(d0(cur), td) + 1 : 1;
    let actualLen = pred.periodLen;
    if (cur) {
      const pe = getPeriodEndDate(cur);
      if (pe) actualLen = daysDiff(d0(cur), pe) + 1;
    }
    numEl.textContent = dayNum;
    unitEl.textContent = ` / ${actualLen}`;
    subEl.textContent = t('periodDay').replace('{n}', dayNum);
    pct = (dayNum / actualLen) * 15;
    label = badges.period;
    bCls = 'period';
    numEl.style.color = 'var(--love)';
    document.querySelector('.lbl-period').classList.add('current');
  } else if (pred.isOverdue) {
    numEl.textContent = pred.overdueDays;
    unitEl.textContent = '';
    subEl.textContent = `${t('daysOverdue').replace('{n}', pred.overdueDays)} · ${t('expected')} ${fmtDate(pred.nextStart)}`;
    bCls = 'late';
    label = badges.late;
    numEl.style.color = '#E65100';
    pct = 100;
    document.querySelector('.lbl-luteal').classList.add('current');
  } else {
    const totalLen = pred.nextStart ? daysDiff(pred.lastStart, pred.nextStart) : pred.cycleLen;
    const elapsed = daysDiff(pred.lastStart, td);
    const remain = pred.nextStart ? daysDiff(td, pred.nextStart) : totalLen - elapsed;
    pct = Math.min(100, Math.max(0, (elapsed / totalLen) * 100));
    numEl.textContent = remain;
    unitEl.textContent = '';
    if (remain > 0 && remain <= 7) {
      label = badges.luteal;
      numEl.style.color = 'var(--lavender-dark)';
      bCls = 'luteal';
      document.querySelector('.lbl-luteal').classList.add('current');
    } else if (phase === 'luteal') {
      label = badges.luteal;
      numEl.style.color = 'var(--lavender-dark)';
      bCls = 'luteal';
      document.querySelector('.lbl-luteal').classList.add('current');
    } else if (phase === 'fertile') {
      label = badges.fertile;
      numEl.style.color = 'var(--teal)';
      bCls = 'fertile';
      document.querySelector('.lbl-ovulation').classList.add('current');
    } else if (phase === 'ovulation') {
      label = badges.ovulation;
      numEl.style.color = 'var(--teal)';
      bCls = 'ovulation';
      document.querySelector('.lbl-ovulation').classList.add('current');
    } else if (phase === 'follicular') {
      label = badges.follicular;
      numEl.style.color = 'var(--sage)';
      bCls = 'follicular';
      document.querySelector('.lbl-follicular').classList.add('current');
    } else {
      numEl.style.color = 'var(--text-muted)';
    }
    subEl.textContent = remain >= 0 ? t('daysUntil').replace('{n}', remain) : `${t('expected')} ${fmtDate(pred.nextStart)}`;
  }
  animateProgressBar(fillEl, pct);
  fillEl.setAttribute('role', 'progressbar');
  fillEl.setAttribute('aria-valuenow', Math.round(pct));
  fillEl.setAttribute('aria-valuemin', '0');
  fillEl.setAttribute('aria-valuemax', '100');
  if (bCls === 'period' || bCls === 'late') fillEl.style.background = 'var(--love)';
  else if (bCls === 'follicular') fillEl.style.background = 'var(--sage)';
  else if (bCls === 'ovulation' || bCls === 'fertile') fillEl.style.background = 'var(--teal)';
  else if (bCls === 'luteal') fillEl.style.background = 'var(--lavender)';
  badgeEl.textContent = label;
  badgeEl.className = 'phase-badge ' + bCls;
}

function updateStats(pred) {
  // Animated number helper
  function animNum(el, target, suffix) {
    const cur = parseInt(el.textContent) || 0;
    if (cur === target) {
      el.textContent = target + (suffix || '');
      return;
    }
    const start = performance.now();
    const dur = 500;
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out
      el.textContent = Math.round(cur + (target - cur) * eased) + (suffix || '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  animNum(document.getElementById('st-count'), state.records.length, '');
  const regL = t('statsRegLabels');
  if (state.records.length >= 2) {
    animNum(document.getElementById('st-avg'), pred.avgCycle, t('day'));
    const sr = document.getElementById('st-range');
    if (sr) sr.textContent = pred.minCycle + ' / ' + pred.maxCycle + t('day');
    const sreg = document.getElementById('st-regularity');
    if (sreg) {
      sreg.innerHTML =
        regL[pred.confidence] +
        ' <span class="cycle-badge ' +
        { high: 'high', medium: 'medium', low: 'low' }[pred.confidence] +
        '">±' +
        pred.stdDev +
        '</span>';
    }
  } else {
    const hint = t('statsHintCycles');
    const sa = document.getElementById('st-avg');
    if (sa) sa.textContent = hint;
    const sr2 = document.getElementById('st-range');
    if (sr2) sr2.textContent = hint;
    const sreg2 = document.getElementById('st-regularity');
    if (sreg2) sreg2.textContent = hint;
  }
  const sn = document.getElementById('st-next');
  if (sn) sn.textContent = pred.nextStart ? fmtDate(pred.nextStart) : '--';
  const so = document.getElementById('st-ovulation');
  if (so) so.textContent = pred.ovulation ? fmtDate(pred.ovulation) : '--';
  const sf = document.getElementById('st-fertile');
  if (sf) sf.textContent = pred.fertileStart && pred.fertileEnd ? fmtDate(pred.fertileStart) + ' ~ ' + fmtDate(pred.fertileEnd) : '--';
  const sc = document.getElementById('st-confidence');
  if (sc) sc.textContent = state.records.length >= 2 ? regL[pred.confidence] + ' (±' + pred.stdDev + ')' : '--';
  if (pred.futurePeriods.length > 0) {
    const fr = document.getElementById('futurePredRow');
    if (fr) fr.style.display = '';
    const sfu = document.getElementById('st-future');
    if (sfu) {
      sfu.textContent = pred.futurePeriods
        .map(function (fp) {
          return fmtDate(fp.start);
        })
        .join(', ');
    }
  } else {
    const fr2 = document.getElementById('futurePredRow');
    if (fr2) fr2.style.display = 'none';
  }
  animateStatsPanel();
}

function updateHistoryDots(pred) {
  const c = document.getElementById('historyDots');
  if (pred.cycles.length === 0) {
    c.innerHTML = '<span style="font-size:.72rem;color:var(--text-muted)">--</span>';
    return;
  }
  const recent = pred.cycles.slice(-12),
    avg = pred.avgCycle;
  c.innerHTML = recent
    .map((cy) => {
      let cls = 'normal';
      if (cy < avg - 3) cls = 'short';
      else if (cy > avg + 3) cls = 'long';
      return `<span class="history-dot ${cls}" title="${cy}${t('day')}" onclick="toast('${cy}${t('day')}')"></span>`;
    })
    .join('');
}

function goToMonth(m) {
  CalState.month = m;
  renderCalendar();
}
function updateReminder(pred) {
  const banner = document.getElementById('reminderBanner');
  if (!banner) return;
  const td = today();
  const phase = getPhase(td, pred);
  let msg = '';
  const r = t('reminder');
  if (phase === 'ovulation') msg = r.ovulation;
  else if (pred.isOverdue) msg = r.late.replace('{days}', pred.overdueDays);
  else if (pred.nextStart) {
    const remain = daysDiff(td, pred.nextStart);
    if (remain > 0 && remain <= 3) msg = r.beforePeriod.replace('{days}', remain);
  }
  if (msg) {
    banner.style.display = 'flex';
    banner.innerHTML = msg + ' <span class="dismiss" onclick="this.parentElement.style.display=\'none\'">✕</span>';
  } else {
    banner.style.display = 'none';
  }
}
function updateFab() {
  const fab = document.getElementById('fabBtn');
  const fabIcon = document.getElementById('fab-icon');
  const fabLabel = document.getElementById('fab-label');
  if (activeProfile !== 'andjela') {
    fab.classList.add('hidden');
    return;
  }
  fab.classList.remove('hidden');
  const openStart = getOpenPeriodStart();
  if (openStart) {
    // Period started but not ended — show end button
    fabIcon.textContent = '✅';
    fab.style.fontSize = '1.2rem';
    fab.style.fontWeight = 'normal';
    fabLabel.textContent = t('fabEndPeriod');
  } else {
    // No open period — show start button
    fabIcon.textContent = '🩸';
    fab.style.fontSize = '1.5rem';
    fab.style.fontWeight = 'normal';
    fabLabel.textContent = t('fabStartPeriod');
  }
}

document.getElementById('fabBtn').addEventListener('click', function () {
  if (activeProfile !== 'andjela') return;
  const td = today();
  const tdKey = fmtDate(td);
  const openStart = getOpenPeriodStart();
  if (openStart) {
    // Mark period END only if today is after the start
    if (d0(td) <= d0(openStart)) {
      toast(lang === 'sr' ? 'Kraj mora biti posle početka' : lang === 'en' ? 'End must be after start' : '结束日必须在开始日之后');
      return;
    }
    state.periodEnds = state.periodEnds || {};
    state.periodEnds[fmtDate(openStart)] = tdKey;
    toast(lang === 'sr' ? 'Kraj ciklusa označen ✓' : lang === 'en' ? 'Period end marked ✓' : '经期结束已标记 ✓');
  } else {
    // Mark period START
    const isMarked = state.records.some(function (r) {
      return sameDay(r, td);
    });
    if (isMarked) {
      toast(fmtDate(td) + (lang === 'sr' ? ' - već označeno' : lang === 'en' ? ' - already marked' : ' - 已标记过'));
      return;
    }
    state.records.push(new Date(td));
    state.records.sort(function (a, b) {
      return a - b;
    });
    toast(t('toast.marked'));
    checkCycleCelebration();
  }
  saveState();
  renderAll();
  updateFab();
  const fab = document.getElementById('fabBtn');
  fab.classList.add('celebrate');
  setTimeout(function () {
    fab.classList.remove('celebrate');
  }, 500);
});

// FAB long-press label on mobile
(function () {
  const fab = document.getElementById('fabBtn');
  if (!fab) return;
  let longPressTimer = null;
  fab.addEventListener(
    'touchstart',
    function () {
      longPressTimer = setTimeout(function () {
        fab.classList.add('show-label');
      }, 500);
    },
    { passive: true }
  );
  fab.addEventListener('touchend', function () {
    clearTimeout(longPressTimer);
    setTimeout(function () {
      fab.classList.remove('show-label');
    }, 1500);
  });
  fab.addEventListener('touchcancel', function () {
    clearTimeout(longPressTimer);
    fab.classList.remove('show-label');
  });
  fab.addEventListener('mouseenter', function () {
    fab.classList.add('show-label');
  });
  fab.addEventListener('mouseleave', function () {
    fab.classList.remove('show-label');
  });
})();

/* Escape key handler — dismiss overlays/modals */
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  const greeting = document.getElementById('greetingOverlay');
  if (greeting && !greeting.classList.contains('hidden') && greeting.style.display !== 'none') {
    greeting.style.display = 'none';
    greeting.classList.add('hidden');
    return;
  }
  const modal = document.getElementById('modal');
  if (modal && !modal.classList.contains('hidden')) {
    closeModal();
    return;
  }
  const importModal = document.querySelector('.import-modal-overlay');
  if (importModal) {
    importModal.remove();
    return;
  }
});

/* ================================================================
   MODAL
   ================================================================ */
function openModal(date, pred) {
  selectedDate = new Date(date);
  const key = fmtDate(selectedDate);
  const phase = getPhase(date, pred);
  const isMarked = state.records.some((r) => sameDay(r, selectedDate));
  const md = t('modal');
  const phases = t('phases');
  document.getElementById('modal-date').textContent = fmtDate(selectedDate);
  const lunarInfo = typeof Lunar !== 'undefined' ? Lunar.toLunar(date) : null;
  if (lunarInfo) {
    const lunarDisplay = t('modalLunar') + ' ' + lunarInfo.month + t('modalLunarSrSep') + ' ' + lunarInfo.day + t('modalLunarSrDay');
    document.getElementById('modal-date').textContent = fmtDate(selectedDate) + ' · ' + lunarDisplay;
  }
  document.getElementById('modal-phase').textContent = phases[phase] || '--';
  const dayRow = document.getElementById('modal-day-row');
  if (phase === 'period-on' || phase === 'period-mid') {
    dayRow.style.display = '';
    const cur = state.records.find((r) => {
      const s = d0(r),
        e = addDays(s, pred.periodLen - 1);
      return selectedDate >= s && selectedDate <= e;
    });
    document.getElementById('modal-day').textContent = cur ? `${daysDiff(d0(cur), selectedDate) + 1}${t('day')}`.trim() : '--';
  } else {
    dayRow.style.display = 'none';
  }
  const sympRow = document.getElementById('modal-symp-row');
  const symp = state.symptoms[key];
  const symNames = t('symptoms');
  if (symp) {
    const parts = Object.entries(symp)
      .filter(([k, v]) => k !== 'notes' && v > 0)
      .map(([k, v]) => symNames[k] + v);
    if (parts.length > 0 || (symp.notes && symp.notes.trim())) {
      sympRow.style.display = '';
      let txt = parts.length > 0 ? parts.join(', ') : '';
      if (symp.notes && symp.notes.trim()) txt += (txt ? ' · ' : '') + symp.notes.trim();
      document.getElementById('modal-symp').textContent = txt || '--';
    } else {
      sympRow.style.display = 'none';
    }
  } else {
    sympRow.style.display = 'none';
  }
  document.querySelectorAll('#modal-symptoms .sym-chip').forEach((chip) => {
    const s = chip.dataset.s;
    chip.classList.toggle('on', symp && symp[s] && symp[s] > 0);
    chip.onclick = () => quickToggleSymptom(s);
  });
  const markBtn = document.getElementById('modal-mark-btn'),
    unmarkBtn = document.getElementById('modal-unmark-btn');
  if (isMarked) {
    markBtn.style.display = 'none';
    unmarkBtn.style.display = '';
    unmarkBtn.textContent = md.unmark;
    document.getElementById('modal-title').textContent = md.marked;
  } else {
    markBtn.style.display = '';
    markBtn.textContent = md.mark;
    unmarkBtn.style.display = 'none';
    document.getElementById('modal-title').textContent = md.details;
  }
  renderKnowledge(phase, key);
  renderSymptomPanel(key);
  const special = getSpecialDate(new Date(key + 'T00:00:00'));
  const specialRow = document.getElementById('modal-special-row');
  if (special) {
    specialRow.style.display = '';
    document.getElementById('modal-special').innerHTML =
      '<span class=\"holiday-name\">' +
      special.icon +
      ' ' +
      (activeProfile === 'barry' ? special.title_zh : special.title_sr) +
      '</span><span class=\"holiday-detail\" style=\"display:block\">' +
      (activeProfile === 'barry' ? special.desc_zh : special.desc_sr) +
      '</span>';
  } else {
    specialRow.style.display = 'none';
  }
  const solarTerm = getSolarTerm(key);
  const solarRow = document.getElementById('modal-solar-row');
  if (solarTerm) {
    solarRow.style.display = '';
    const sn = solarTerm.name[lang] || solarTerm.name[lang.split('-')[0]] || solarTerm.name['sr'];
    document.getElementById('modal-solar').innerHTML =
      "<span class=\"holiday-name\" onclick=\" let d=this.nextElementSibling;d.classList.toggle('open');this.textContent=this.textContent.replace(' ▾',' ').replace(' ▴',' ')+(d.classList.contains('open')?' ▴':' ▾')\">" +
      sn +
      ' ▾</span><span class="holiday-detail">' +
      (solarTerm.story ? solarTerm.story[lang] || solarTerm.story[lang.split('-')[0]] || solarTerm.story['sr'] : '') +
      '</span>';
  } else {
    solarRow.style.display = 'none';
  }
  const holidays = getHoliday(key);
  const holidayRow = document.getElementById('modal-holiday-row');
  if (holidays.length > 0) {
    holidayRow.style.display = '';
    const hNames = holidays.map(function (h, i) {
      const n = h.name[lang] || h.name[lang.split('-')[0]] || h.name['sr'];
      const d = h.desc[lang] || h.desc[lang.split('-')[0]] || h.desc['sr'];
      const flagEmoji = h.country === 'cn' ? '🇨🇳' : '🇷🇸';
      const uid = 'h' + i;
      const daysOffInfo = HOLIDAY_DAYS[key];
      let offHtml = '';
      if (daysOffInfo && h.country === 'cn') {
        const off = daysOffInfo.zh || daysOffInfo.cn || '';
        if (off && off !== '—') offHtml = '<div style="font-size:.62rem;color:var(--text-muted);margin-top:2px">🏖️ ' + t('holidayOffLabel') + off + '</div>';
      }
      if (daysOffInfo && h.country === 'rs') {
        const off = daysOffInfo.sr || daysOffInfo.rs || '';
        if (off && off !== '—') {
          offHtml =
            '<div style="font-size:.62rem;color:var(--text-muted);margin-top:2px">🏖️ ' +
            (lang === 'sr' ? 'Odmor: ' + off : lang === 'en' ? 'Days off: ' + off : '放假' + off) +
            '</div>';
        }
      }
      return (
        flagEmoji +
        ' <span class="holiday-name" data-d="' +
        h.d +
        '" data-c="' +
        h.country +
        '" id="hn-' +
        uid +
        '" onclick="toggleHolidayStory(\'' +
        uid +
        "','" +
        h.d +
        "','" +
        h.country +
        '\')">' +
        n +
        ' ▾</span><span class="holiday-detail" id="hd-' +
        uid +
        '">' +
        d +
        '</span>' +
        offHtml
      );
    });
    document.getElementById('modal-holiday').innerHTML = hNames.join('<div style="height:8px"></div>');
  } else {
    holidayRow.style.display = 'none';
  }
  // Render shared calendar markers
  if (typeof getCalendarSummary === 'function') {
    const calMarkersSummary = getCalendarSummary(key);
    const markersList = document.getElementById('modalMarkersList');
    const markersContainer = document.getElementById('modalMarkers');
    if (markersList && markersContainer) {
      const allMarkerItems = [];
      calMarkersSummary.barry.forEach(function (m) {
        allMarkerItems.push(m);
      });
      calMarkersSummary.andjela.forEach(function (m) {
        allMarkerItems.push(m);
      });
      if (allMarkerItems.length > 0) {
        markersContainer.style.display = '';
        markersList.innerHTML = allMarkerItems
          .map(function (m) {
            const authorName = m.author === 'andjela' ? '🌸' : '👦';
            const timeStr = m.time
              ? (function (t) {
                  const d = new Date(t);
                  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
                })(m.time)
              : '';
            const canRemove =
              m.author === activeProfile ? ' <span class="marker-remove" data-id="' + m.id + '" onclick="removeCalendarMarker(\'' + m.id + '\')">✕</span>' : '';
            return '<span class="modal-marker-item" title="' + authorName + ' ' + timeStr + '">' + m.emoji + ' ' + esc(m.note || '') + canRemove + '</span>';
          })
          .join(' ');
      } else {
        markersList.innerHTML = '<span class="marker-empty">' + (activeProfile === 'barry' ? '还没有标记 📌' : 'Još nema oznaka 📌') + '</span>';
      }
    }
  }
  // Render diary preview in modal
  const diaryPreviewEl = document.getElementById('modalDiaryPreview');
  const diaryBodyEl = document.getElementById('modalDiaryBody');
  if (diaryPreviewEl && diaryBodyEl) {
    try {
      const sdModal = JSON.parse(localStorage.getItem('shared-diary')) || {};
      const dayDiary = sdModal[key] || {};
      const myDiaryEntry = dayDiary[activeProfile];
      const partnerProfile2 = activeProfile === 'andjela' ? 'barry' : 'andjela';
      const partnerDiaryEntry = dayDiary[partnerProfile2];
      if (myDiaryEntry || partnerDiaryEntry) {
        diaryPreviewEl.style.display = '';
        let diaryText = '';
        if (myDiaryEntry) {
          const myText = myDiaryEntry.text || myDiaryEntry.happy || '';
          diaryText +=
            '<div class="modal-diary-mine"><span class="modal-diary-author">' +
            (activeProfile === 'andjela' ? '🌸' : '👦') +
            '</span> ' +
            esc(myText.substring(0, 100)) +
            (myText.length > 100 ? '...' : '') +
            '</div>';
        }
        if (partnerDiaryEntry) {
          const partnerText = partnerDiaryEntry.text || partnerDiaryEntry.happy || '';
          diaryText +=
            '<div class="modal-diary-partner"><span class="modal-diary-author">' +
            (partnerProfile2 === 'andjela' ? '🌸' : '👦') +
            '</span> ' +
            esc(partnerText.substring(0, 100)) +
            (partnerText.length > 100 ? '...' : '') +
            '</div>';
        }
        diaryBodyEl.innerHTML = diaryText;
        var _mdLang = (typeof window.lang !== 'undefined') ? window.lang : 'sr';
        document.getElementById('modalDiaryHeader').textContent = _mdLang === 'zh-CN' ? '💌 日记' : _mdLang === 'en' ? '💌 Diary' : '💌 Dnevnik';
        document.getElementById('modalDiaryEditText').textContent = _mdLang === 'zh-CN' ? '编辑' : _mdLang === 'en' ? 'Edit' : 'Uredi';
      } else {
        diaryPreviewEl.style.display = 'none';
      }
    } catch (e) {
      diaryPreviewEl.style.display = 'none';
    }
  }
  window._lastFocusedBeforeModal = document.activeElement;
  document.getElementById('modal').classList.remove('hidden');
  if (typeof animateModalIn === 'function') animateModalIn();
  document.getElementById('modal-title').focus();
}

/* ================================================================
   Shared Calendar Actions — emoji picker, diary jump
   ================================================================ */

/**
 * Close the emoji picker overlay.
 */
function closeEmojiPicker() {
  const overlay = document.getElementById('emojiPickerOverlay');
  if (overlay) overlay.classList.add('hidden');
}

/**
 * Open the emoji picker and attach it to a specific date.
 * @param {string} dateKey - 'YYYY-MM-DD'
 */
function openEmojiPicker(dateKey) {
  const overlay = document.getElementById('emojiPickerOverlay');
  const grid = document.getElementById('emojiPickerGrid');
  const dateLabel = document.getElementById('epDateLabel');
  if (!overlay || !grid) return;
  overlay.classList.remove('hidden');
  overlay._targetDate = dateKey;
  if (dateLabel) dateLabel.textContent = dateKey;
  if (grid.children.length === 0) {
    // Populate once
    let emojis = [];
    if (typeof getQuickEmojis === 'function') {
      emojis = getQuickEmojis();
    } else {
      emojis = [
        { emoji: '💕' },
        { emoji: '🌸' },
        { emoji: '🌙' },
        { emoji: '☀️' },
        { emoji: '🍵' },
        { emoji: '🎵' },
        { emoji: '📖' },
        { emoji: '💪' },
        { emoji: '😊' },
        { emoji: '😢' },
        { emoji: '🤗' },
        { emoji: '🎂' },
        { emoji: '✈️' },
        { emoji: '🏠' },
        { emoji: '💼' },
        { emoji: '🎮' },
        { emoji: '🍜' },
        { emoji: '🥰' },
      ];
    }
    emojis.forEach(function (e) {
      const cell = document.createElement('span');
      cell.className = 'emoji-picker-cell';
      cell.textContent = e.emoji;
      cell.title = e.label_sr || e.emoji;
      cell.addEventListener('click', function () {
        const targetDate = overlay._targetDate || fmtDate(new Date());
        const marker = addCalendarMarker(targetDate, { emoji: e.emoji, type: 'custom', note: '' });
        if (marker) {
          closeEmojiPicker();
          // Refresh calendar and modal if open
          renderCalendar();
          if (!document.getElementById('modal').classList.contains('hidden')) {
            if (selectedDate) openModal(selectedDate, predict());
          }
          const label = lang === 'sr' ? 'Oznaka dodana' : lang === 'en' ? 'Marker added' : '标记已添加';
          toast(e.emoji + ' ' + label);
          // Auto-push sync
          if (typeof pushAllSharedData === 'function') pushAllSharedData();
        }
      });
      grid.appendChild(cell);
    });
  }
}

/**
 * Open emoji picker from the modal (uses selectedDate global).
 */
function openEmojiPickerForModal() {
  if (!selectedDate) return;
  const key = fmtDate(selectedDate);
  openEmojiPicker(key);
}

/**
 * Jump from calendar modal to diary panel for the selected date.
 */
function jumpToDiaryFromCalendar() {
  if (!selectedDate) return;
  const key = fmtDate(selectedDate);
  closeModal();
  // Set diary view date and switch tab
  if (typeof _diaryViewDate !== 'undefined') {
    _diaryViewDate = new Date(key + 'T00:00:00');
    _diaryMood = '';
    if (typeof renderDiaryPanel === 'function') renderDiaryPanel();
  }
  // Switch to diary tab
  const diaryTab = document.querySelector('.tab[data-panel="diary"]');
  if (diaryTab) diaryTab.click();
}

// closeModal() extracted to js/ui-core.js
function renderKnowledge(phase, dateKey) {
  const panel = document.getElementById('knowledgePanel');
  const toggleBtn = document.getElementById('knowledgeToggle');
  let cat = null;
  if (phase && phase.startsWith('period')) cat = 'period';
  else if (phase === 'ovulation') cat = 'ovulation';
  else if (phase === 'fertile') cat = 'fertile';
  else if (phase === 'follicular') cat = 'follicular';
  else if (phase === 'luteal') cat = 'luteal';
  else {
    const pr = predict();
    const tp = getPhase(today(), pr);
    if (tp && tp.startsWith('period')) cat = 'period';
    else if (tp === 'ovulation' || tp === 'fertile') cat = 'ovulation';
    else if (tp === 'follicular') cat = 'follicular';
    else if (tp === 'luteal') cat = 'luteal';
  }
  if (cat) {
    const kn = t('knowledge.' + cat);
    toggleBtn.style.display = '';
    toggleBtn.textContent = knowledgeOpen ? t('knowledgeToggleHide') : t('knowledgeToggle');
    panel.innerHTML = `<h4>${kn.title}</h4><p>${kn.desc}</p><p style="margin-top:8px"><strong>🩺 ${kn.what}</strong></p><p style="margin-top:6px"><strong>📋 ${kn.symptoms}</strong></p><p style="margin-top:6px"><strong>💡 ${kn.tips}</strong></p>`;
    panel.className = 'knowledge-panel' + (knowledgeOpen ? ' open' : '');
  } else {
    toggleBtn.style.display = 'none';
    panel.className = 'knowledge-panel';
    panel.innerHTML = '';
  }
}
// toggleKnowledge() extracted to js/ui-core.js
function togglePeriodRecord(date) {
  if (date) selectedDate = date;
  if (!selectedDate) return;
  const sd = fmtDate(selectedDate);
  // Check if this is marking period END (there's a start without end)
  const openStart = getOpenPeriodStart();
  if (openStart && d0(selectedDate) > d0(openStart)) {
    // Mark as period end
    state.periodEnds = state.periodEnds || {};
    state.periodEnds[fmtDate(openStart)] = sd;
    toast(lang === 'sr' ? 'Kraj ciklusa označen ✓' : lang === 'en' ? 'Period end marked ✓' : '经期结束已标记 ✓');
  } else {
    // Toggle period start
    const idx = state.records.findIndex(function (r) {
      return sameDay(r, selectedDate);
    });
    if (idx >= 0) {
      state.records.splice(idx, 1);
      state.periodEnds = state.periodEnds || {};
      delete state.periodEnds[fmtDate(selectedDate)];
      toast(t('toast.unmarked'));
    } else {
      state.records.push(new Date(selectedDate));
      state.records.sort(function (a, b) {
        return a - b;
      });
      toast(t('toast.marked'));
      checkCycleCelebration();
    }
  }
  saveState();
  renderAll();
  updateFab();
  openModal(selectedDate, predict());
}
// getOpenPeriodStart() defined in js/cycle-core.js
function removePeriodRecord() {
  if (!selectedDate) return;
  state.records = state.records.filter((r) => !sameDay(r, selectedDate));
  state.periodEnds = state.periodEnds || {};
  delete state.periodEnds[fmtDate(selectedDate)];
  saveState();
  toast(t('toast.unmarked'));
  renderAll();
  updateFab();
  closeModal();
}
function quickToggleSymptom(name) {
  if (!selectedDate) return;
  const key = fmtDate(selectedDate);
  if (!state.symptoms[key]) state.symptoms[key] = {};
  const s = state.symptoms[key];
  s[name] = s[name] ? 0 : 2;
  if (s[name] === 0) delete s[name];
  document.querySelectorAll('#modal-symptoms .sym-chip').forEach((chip) => {
    if (chip.dataset.s === name) chip.classList.toggle('on', s[name] > 0);
  });
  saveState();
  toast(t('toast.symptomQuick'));
}

/* ================================================================
   SYMPTOMS / TIPS / SETTINGS
   ================================================================ */
function renderSymptomPanel(dateKey) {
  symptomDate = dateKey;
  document.getElementById('symptom-date-label').textContent = dateKey + ' ' + t('modal.symptoms');
  document.getElementById('symptom-empty').style.display = 'none';
  document.getElementById('symptom-content').style.display = '';
  const symp = state.symptoms[dateKey] || {};
  ['cramps', 'mood', 'flow', 'headache', 'fatigue', 'cravings'].forEach((s) => {
    const lvl = symp[s] || 0;
    const dots = document.getElementById('dots-' + s);
    if (!dots) return;
    dots.querySelectorAll('.dot').forEach((dot, i) => {
      dot.className = 'dot' + (i < lvl ? ' on' : '');
    });
    const item = dots.closest('.symptom-item');
    if (item) item.classList.toggle('selected', lvl > 0);
  });
  document.getElementById('symptom-notes').value = symp.notes || '';
}
function cycleSymptom(name) {
  if (!symptomDate) return;
  if (!state.symptoms[symptomDate]) state.symptoms[symptomDate] = {};
  const s = state.symptoms[symptomDate];
  const cur = s[name] || 0;
  s[name] = cur >= 3 ? 0 : cur + 1;
  renderSymptomPanel(symptomDate);
}
function saveSymptom() {
  if (!symptomDate) return;
  if (!state.symptoms[symptomDate]) state.symptoms[symptomDate] = {};
  state.symptoms[symptomDate].notes = document.getElementById('symptom-notes').value.trim();
  saveState();
  toast(t('toast.symptomSaved'));
  renderAll(['calendar']);
}
function getSharedCyclePhase() {
  // First try shared-cycle-info (old summary format: {phase, nextStart})
  let shared = null;
  shared = safeParse(localStorage.getItem('shared-cycle-info'), null);
  if (shared && shared.phase) return shared;
  // Calculate phase from synced shared cycle data (new neutral key)
  let cycleData = null;
  cycleData = safeParse(localStorage.getItem('shared-cycle-data'), null);
  if (!cycleData) {
    cycleData = safeParse(localStorage.getItem('shared-andjela-cycle-data'), null);
  }
  if (!cycleData) {
    cycleData = safeParse(localStorage.getItem('cycle-data-v6-andjela'), null);
  }
  if (!cycleData || !cycleData.records || cycleData.records.length === 0) return null;
  try {
    const records = cycleData.records
      .map(function (r) {
        return new Date(r);
      })
      .sort(function (a, b) {
        return a - b;
      });
    const lastStart = new Date(records[records.length - 1]);
    const settings = cycleData.settings || { cycleLength: 28, periodLength: 7 };
    const cycleLen = settings.cycleLength || 28;
    const periodLen = settings.periodLength || 7;
    const nextStart = new Date(lastStart);
    nextStart.setDate(nextStart.getDate() + cycleLen);
    const td = today();
    const dayNum = Math.floor((td - lastStart) / 86400000);
    const ovulationDay = new Date(nextStart);
    ovulationDay.setDate(ovulationDay.getDate() - 14);
    let phase;
    if (dayNum >= 0 && dayNum < periodLen) phase = 'period';
    else if (td >= ovulationDay && td < nextStart) {
      const daysToOvulation = Math.floor((ovulationDay - lastStart) / 86400000);
      if (dayNum >= daysToOvulation - 3 && dayNum <= daysToOvulation + 1) phase = 'ovulation';
      else if (dayNum > daysToOvulation + 1) phase = 'luteal';
      else phase = 'follicular';
    } else if (td < ovulationDay) phase = 'follicular';
    else phase = 'luteal';
    return { phase: phase, nextStart: fmtDate(nextStart), updated: Date.now() };
  } catch (e) {
    return null;
  }
}
function updateSharedCycleInfo() {
  if (activeProfile !== 'andjela') return;
  const pred = predict();
  const phase = getPhase(today(), pred);
  let cat = 'general';
  if (phase === 'period-on' || phase === 'period-mid') cat = 'period';
  else if (phase === 'ovulation' || phase === 'fertile') cat = 'ovulation';
  else if (phase === 'follicular') cat = 'follicular';
  else if (phase === 'luteal') cat = 'luteal';
  localStorage.setItem('shared-cycle-info', JSON.stringify({ phase: cat, nextStart: pred.nextStart ? fmtDate(pred.nextStart) : null, updated: Date.now() }));
}
function renderTips() {
  let cat = 'period';
  let tips = [];
  if (activeProfile === 'barry') {
    // Barry's tips — read shared cycle info from Anđela
    const shared = getSharedCyclePhase();
    if (shared && shared.phase) cat = shared.phase;
    else cat = 'general';
    const tipKey = 'barryTips' + cat.charAt(0).toUpperCase() + cat.slice(1);
    tips = t(tipKey) || t('barryTipsGeneral');
    const phaseNames = {
      period: t('barryPhasePeriod'),
      follicular: t('barryPhaseFollicular'),
      ovulation: t('barryPhaseOvulation'),
      luteal: t('barryPhaseLuteal'),
      general: t('barryPhaseGeneral'),
    };
    const title = t('barryTipsTitle');
    document.getElementById('tips-list').innerHTML =
      '<div style="text-align:center;padding:8px 0;font-size:.78rem;font-weight:700;color:var(--text)">' +
      title +
      '</div><div style="text-align:center;font-size:.68rem;color:var(--gold);margin-bottom:8px">' +
      phaseNames[cat] +
      '</div>' +
      tips
        .map(function (tip) {
          return (
            '<div class="tip-card" style="border-left:3px solid var(--teal)"><span class="tip-icon">' +
            tip.icon +
            '</span><div class="tip-body"><span class="tip-text">' +
            tip.text +
            '</span></div></div>'
          );
        })
        .join('');
    return;
  }
  // Anđela's tips (original)
  const pred = predict();
  const td = today();
  const phase = getPhase(td, pred);
  if (phase === 'period-on' || phase === 'period-mid') cat = 'period';
  else if (phase === 'ovulation' || phase === 'fertile') cat = 'ovulation';
  else if (phase === 'follicular') cat = 'follicular';
  else if (phase === 'luteal') cat = 'luteal';
  const names = {
    period: t('phasePeriod'),
    follicular: t('phaseFollicular'),
    ovulation: t('phaseOvulation'),
    luteal: t('phaseLuteal'),
  };
  tips = t('tips.' + cat);
  document.getElementById('tips-list').innerHTML = tips
    .map(
      (tip) =>
        `<div class="tip-card ${tip.tcm ? 'tcm' : (tip.source && tip.source.includes('Srpska')) || tip.source.includes('Serbian') ? 'serbian' : ''}"><span class="tip-icon">${tip.icon}</span><div class="tip-body"><span class="tip-phase-label">${names[cat]} · ${t('tabs')[2]}</span><span class="tip-text">${tip.text}</span>${tip.source ? `<span class="tip-source">${tip.source}</span>` : ''}</div></div>`
    )
    .join('');
}
function exportData() {
  const blob = new Blob(
    [
      JSON.stringify(
        { records: state.records.map(fmtDate), symptoms: state.symptoms, moods: state.moods || {}, diaries: state.diaries || {}, settings: state.settings },
        null,
        2
      ),
    ],
    { type: 'application/json' }
  );
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `andjelin-ciklus-${activeProfile}-${fmtDate(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast(t('toast.exported'));
}
function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function () {
    try {
      const d = JSON.parse(reader.result);
      if (!d.records || !Array.isArray(d.records)) throw new Error('Invalid format');
      state.records = d.records
        .map(function (r) {
          const dt = new Date(r);
          return isNaN(dt.getTime()) ? null : dt;
        })
        .filter(Boolean);
      if (state.records.length === 0 && d.records.length > 0) throw new Error('No valid dates');
      state.symptoms = d.symptoms || {};
      state.moods = d.moods || {};
      state.diaries = d.diaries || {};
      state.settings = { cycleLength: 28, periodLength: 7, manualOverride: false };
      if (d.settings) {
        Object.keys(d.settings).forEach(function (k) {
          state.settings[k] = d.settings[k];
        });
      }
      saveState();
      renderAll();
      updateFab();
      toast(t('toast.imported'));
    } catch (err) {
      toast(t('toast.importError'));
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}
function clearAllData() {
  if (!confirm(t('settings.clearConfirm'))) return;
  state = { records: [], symptoms: {}, moods: {}, diaries: {}, settings: { cycleLength: 28, periodLength: 7, manualOverride: false }, _migrated: true };
  window.state = state;
  saveState();
  renderAll();
  updateFab();
  toast(t('toast.cleared'));
}
// clearAllDiaries() extracted to js/render-diary.js

/* ================================================================
   NAVIGATION
   ================================================================ */
let _changeMonthTimer = null;
function changeMonth(d) {
  if (_changeMonthTimer) return; // Debounce: ignore rapid clicks
  if (d === 0) {
    renderCalendar();
    return;
  }
  _changeMonthTimer = setTimeout(function () {
    _changeMonthTimer = null;
  }, 150);
  if (CalState.view === 'week') {
    // In week view, shift by weeks using offset
    _weekOffset += d;
    let newMonday = getWeekStart();
    CalState.year = newMonday.getFullYear();
    CalState.month = newMonday.getMonth();
  } else {
    CalState.month += d;
    if (CalState.month < 0) {
      CalState.month = 11;
      CalState.year--;
    }
    if (CalState.month > 11) {
      CalState.month = 0;
      CalState.year++;
    }
  }

  let grid = document.getElementById('daysGrid');
  grid.style.transition = 'opacity 0.08s ease-out';
  grid.style.opacity = '0';

  setTimeout(function () {
    renderCalendar();
    grid.style.transition = 'opacity 0.15s ease-out';
    grid.style.opacity = '1';
  }, 80);
}

/** Get the Monday of the current view week */
function getWeekStart() {
  // Always compute from today, then apply week offset
  let td = today();
  let day = td.getDay();
  let diff = td.getDate() - (day === 0 ? 6 : day - 1);
  let thisMonday = new Date(td.getFullYear(), td.getMonth(), diff);
  if (CalState.view === 'week' && _weekOffset !== 0) {
    return addDays(thisMonday, _weekOffset * 7);
  }
  return thisMonday;
}

/** Toggle between month and week view */
function setCalView(view) {
  CalState.view = view;
  _weekOffset = 0;
  document.getElementById('viewBtnMonth').classList.toggle('active', view === 'month');
  document.getElementById('viewBtnWeek').classList.toggle('active', view === 'week');
  if (view === 'week') {
    let monday = getWeekStart();
    CalState.year = monday.getFullYear();
    CalState.month = monday.getMonth();
  }
  renderCalendar();
}

/** Go to today in current view mode */
function goToday() {
  _weekOffset = 0;
  CalState.year = today().getFullYear();
  CalState.month = today().getMonth();
  const grid = document.getElementById('daysGrid');
  if (grid) {
    grid.style.transition = 'opacity 0.08s ease-out';
    grid.style.opacity = '0';
    setTimeout(function () {
      renderCalendar();
      grid.style.transition = 'opacity 0.2s ease-out';
      grid.style.opacity = '1';
    }, 80);
  } else {
    renderCalendar();
  }
}

// Touch swipe
(function () {
  const grid = document.getElementById('daysGrid');
  let sx = 0,
    active = false;
  grid.addEventListener(
    'touchstart',
    function (e) {
      if (active) return;
      sx = e.touches[0].clientX;
    },
    { passive: true }
  );
  grid.addEventListener(
    'touchmove',
    function (e) {
      const dx = e.touches[0].clientX - sx;
      if (!active && Math.abs(dx) > 10) {
        active = true;
        grid.style.transition = 'none';
      }
      if (!active) return;
      grid.style.transform = 'translateX(' + dx + 'px)';
      grid.style.opacity = Math.max(0, 1 - Math.abs(dx) / 150);
    },
    { passive: true }
  );
  grid.addEventListener('touchend', function () {
    if (!active) return;
    active = false;
    const dx = parseFloat(grid.style.transform.replace('translateX(', '').replace('px)', '')) || 0;
    grid.style.transition = 'transform .15s ease-out, opacity .15s ease-out';
    if (Math.abs(dx) > 60) {
      const dir = dx > 0 ? -1 : 1;
      grid.style.transform = 'translateX(' + dir * 100 + 'px)';
      grid.style.opacity = '0';
      setTimeout(function () {
        grid.style.transition = 'none';
        grid.style.transform = '';
        grid.style.opacity = '';
        changeMonth(dir);
      }, 150);
    } else {
      grid.style.transform = '';
      grid.style.opacity = '';
    }
  });
})();

/* goToday: 单一实现已上移至 CALENDAR 模块 (重置 _weekOffset + 淡入动画)。
   此重复声明删除，避免函数提升遮蔽正确版本。 */
/* ================================================================
   CULTURE MODULE — za Anđelu
   ================================================================ */

// UI text mapping for culture card (auto-switches based on lang)
// CULTURE_KNOWLEDGE defined as backward-compat globals in js/culture-cards.js
// See CultureCardsModule for the IIFE implementation
/* CULTURE_KNOWLEDGE and _cultureCardIdx defined in js/culture-cards.js */

// cl(), getTodaysCultureIndex(), initCultureTab(), renderCultureCard(),
// prevCultureCard(), nextCultureCard(), goToTodayCulture() are in culture-cards.js

const _tabOrder = ['dashboard', 'stats', 'symptoms', 'diary', 'settings'];
let _prevTabIdx = 0;
document.querySelectorAll('.tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.panel;
    // Skip if already on this tab — prevents double-click animation glitch
    if (btn.classList.contains('active')) return;
    // Symptom tab only for Barry — show message for Anđela
    if (id === 'symptoms' && activeProfile !== 'barry') {
      toast(t('profileOnly') || 'Only Barry can view this');
      return;
    }
    const newIdx = _tabOrder.indexOf(id);
    if (newIdx === -1) return;
    const dir = newIdx > _prevTabIdx ? 'slide-out-left' : 'slide-out-right';
    _prevTabIdx = newIdx;
    // Update aria-selected on all tabs
    document.querySelectorAll('.tab').forEach((t) => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    const oldPanel = document.querySelector('.panel.active');
    if (oldPanel) {
      oldPanel.classList.add(dir);
      oldPanel.addEventListener(
        'animationend',
        function h() {
          oldPanel.removeEventListener('animationend', h);
          oldPanel.classList.remove('active', dir);
        },
        { once: true }
      );
    } else {
      document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
    }
    // Activate new
    const newPanel = document.getElementById('panel-' + id);
    newPanel.classList.remove('slide-out-left', 'slide-out-right');
    newPanel.classList.add('active');
    // Scroll to top on mobile when switching tabs
    // Scroll position preserved per user request
    // Scroll position preserved per user request
    // Scroll position preserved per user request
    if (id === 'settings') loadSettingsUI();
    if (id === 'symptoms') {
      if (getGitHubToken()) {
        pullAllSharedData().then(function () {
          renderBarrySymptomView();
        });
      }
      document.getElementById('symptom-empty').style.display = symptomDate ? 'none' : '';
      document.getElementById('symptom-content').style.display = symptomDate ? '' : 'none';
    }
    if (id === 'dashboard') {
      initDashboard();
      renderTips();
    }
    if (id === 'stats') {
      renderStatsPanel();
    }
    if (id === 'diary') {
      initSharedDiaryTab();
    }
  });
});
document.querySelectorAll('.lang-btn').forEach((btn) => {
  btn.addEventListener('click', () => switchLanguage(btn.dataset.lang));
});
document.getElementById('themeBtn').addEventListener('click', () => {
  switchTheme(theme === 'dark' ? 'light' : 'dark');
});
document.getElementById('set-theme').addEventListener('change', function () {
  switchTheme(this.value);
});

/* Panel swipe gesture — horizontal swipe to navigate between tabs */
(function () {
  const app = document.querySelector('.app');
  if (!app) return;
  let startX = 0,
    startY = 0,
    swiping = false,
    lockDir = null;
  app.addEventListener(
    'touchstart',
    function (e) {
      // Only handle single-finger swipes
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      swiping = true;
      lockDir = null;
    },
    { passive: true }
  );
  app.addEventListener(
    'touchmove',
    function (e) {
      if (!swiping) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      window._lastSwipeX = e.touches[0].clientX;
      // Lock direction after 10px
      if (!lockDir && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
        lockDir = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
      }
      if (lockDir === 'h') {
        // Give visual hint — subtle panel shift
        const activePanel = document.querySelector('.panel.active');
        if (activePanel && Math.abs(dx) > 20) {
          const resistance = Math.min(Math.abs(dx) * 0.5, 60);
          activePanel.style.transition = 'none';
          activePanel.style.transform = 'translateX(' + (dx > 0 ? resistance : -resistance) + 'px)';
          activePanel.style.opacity = Math.max(0.5, 1 - Math.abs(dx) / 200);
        }
      }
    },
    { passive: true }
  );
  app.addEventListener('touchend', function () {
    if (!swiping || lockDir !== 'h') {
      swiping = false;
      lockDir = null;
      return;
    }
    const lastX = window._lastSwipeX || startX;
    const dx = lastX - startX;
    swiping = false;
    lockDir = null;
    const activePanel = document.querySelector('.panel.active');
    if (activePanel) {
      activePanel.style.transition = 'transform .3s cubic-bezier(.22,1,.36,1), opacity .3s ease';
      activePanel.style.transform = '';
      activePanel.style.opacity = '';
    }
    if (Math.abs(dx) > 60) {
      const currentTab = document.querySelector('.tab.active');
      const currentId = currentTab ? currentTab.dataset.panel : 'dashboard';
      const curIdx = _tabOrder.indexOf(currentId);
      if (dx > 60 && curIdx > 0) {
        // Swipe right → previous tab
        switchToTab(_tabOrder[curIdx - 1]);
      } else if (dx < -60 && curIdx < _tabOrder.length - 1) {
        // Swipe left → next tab
        switchToTab(_tabOrder[curIdx + 1]);
      }
    }
  });
})();

/* ================================================================
   ONBOARDING
   ================================================================ */
function dismissOnboarding() {
  document.getElementById('onboardingBanner').style.display = 'none';
  localStorage.setItem('cycle-ob-dismissed', '1');
}
function showOnboardingIfNeeded() {
  if (activeProfile === 'andjela' && state.records.length === 0 && !localStorage.getItem('cycle-ob-dismissed')) {
    document.getElementById('onboardingBanner').style.display = 'flex';
    document.getElementById('ob-text').textContent = t('onboarding');
  }
}

// toast() extracted to js/ui-core.js

/* Swipe to dismiss modal — full drag with visual feedback */
(function () {
  let startY = 0,
    currentY = 0,
    dragging = false;
  const overlay = document.getElementById('modal');
  overlay.addEventListener(
    'touchstart',
    function (e) {
      if (e.target === overlay || e.target.closest('.modal')) {
        startY = e.touches[0].clientY;
        dragging = true;
      }
    },
    { passive: true }
  );
  overlay.addEventListener(
    'touchmove',
    function (e) {
      if (!dragging) return;
      currentY = e.touches[0].clientY;
      const diff = currentY - startY;
      if (diff > 0) {
        const modalEl = overlay.querySelector('.modal');
        if (modalEl) {
          modalEl.style.transition = 'none';
          modalEl.style.transform = 'translateY(' + diff + 'px)';
          modalEl.style.opacity = Math.max(0.3, 1 - diff / 300);
        }
      }
    },
    { passive: true }
  );
  overlay.addEventListener('touchend', function () {
    if (!dragging) return;
    dragging = false;
    const modalEl = overlay.querySelector('.modal');
    const diff = currentY - startY;
    if (modalEl) {
      modalEl.style.transition = 'transform .25s cubic-bezier(.4,0,1,1), opacity .25s ease';
      if (diff > 80 && !overlay.classList.contains('hidden')) {
        modalEl.style.transform = 'translateY(100%)';
        modalEl.style.opacity = '0.5';
        modalEl.addEventListener(
          'transitionend',
          function h() {
            modalEl.removeEventListener('transitionend', h);
            modalEl.style.transition = '';
            modalEl.style.transform = '';
            modalEl.style.opacity = '';
            overlay.classList.add('hidden');
            selectedDate = null;
            knowledgeOpen = false;
            if (window._lastFocusedBeforeModal) {
              window._lastFocusedBeforeModal.focus();
            }
          },
          { once: true }
        );
      } else {
        modalEl.style.transform = '';
        modalEl.style.opacity = '';
      }
    }
    startY = 0;
    currentY = 0;
  });
})();
document.getElementById('modal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

/* ================================================================
   SYMPTOM ANALYSIS DATA (Barry's view)
   ================================================================ */
/* moved to js/barry.js (BarryModule) */

// Relationship tips for Anđela
/* moved to js/render-love.js */

/* ================================================================
   NEW FEATURES — Hug / Gratitude / Check-in / Song
   ================================================================ */

// ================================================================
// Virtual Hug — redesigned: heartbeat, hug back, streaks, float hearts
// ================================================================
/* moved to js/render-love.js */

// Spawn floating hearts animation
/* Love features (hug, gratitude, checkin, song, knowme, tips) → js/render-love.js */

const PHASE_ANALYSIS = {
  period: {
    name: { sr: 'Menstruacija', en: 'Period', 'zh-CN': '经期' },
    days: { sr: 'Dan 1-7 ciklusa', en: 'Day 1-7 of cycle', 'zh-CN': '周期第1-7天' },
    energy: { sr: '⭐ Niska — odmara se', en: '⭐ Low — resting', 'zh-CN': '⭐ 低——需要休息' },
    libido: { sr: '🔥 Nizak (moguć blagi porast pred kraj)', en: '🔥 Low (may rise slightly toward end)', 'zh-CN': '🔥 低（快结束时可能略有回升）' },
    physical: {
      sr: 'Materica se kontrahuje, gvožđe opada. Može imati: grčeve u stomaku, glavobolju, umor, bol u leđima, nadutost.',
      en: 'Uterus contracting, iron drops. May have: cramps, headache, fatigue, back pain, bloating.',
      'zh-CN': '子宫收缩，铁元素下降。可能有：痛经、头痛、极度疲劳、腰酸、腹胀。',
    },
    emotional: {
      sr: 'Oseća se ranjivo, povučeno. Emocije su intenzivne — može plakati bez razloga. Želi sigurnost i nežnost, ne rešenja.',
      en: 'Feels vulnerable, withdrawn. Emotions intense — may cry without reason. Wants safety and tenderness, not solutions.',
      'zh-CN': '感到脆弱、想独处。情绪强烈——可能没有理由就哭。需要安全感，不需要解决方案。',
    },
    sex: {
      sr: 'Nizak libido. Ne pritiskaj — nežnost bez očekivanja je ono što joj treba. Ako je raspoložena, budi nežan i pažljiv.',
      en: "Low libido. Don't pressure — tenderness without expectation is what she needs. If she's in the mood, be gentle and attentive.",
      'zh-CN': '性欲低。别给她压力——她需要的是无期待的温柔。如果她有兴致，一定要轻柔体贴。',
    },
    support: {
      sr: '🫂 Zagrli je bez razloga • 🍵 Skuvaj topao čaj • 🛏️ Pusti je da spava • 🤐 Ne pametuj — samo slušaj • 🍫 Donesi čokoladu',
      en: "🫂 Hug her without reason • 🍵 Make warm tea • 🛏️ Let her sleep • 🤐 Don't lecture — just listen • 🍫 Bring chocolate",
      'zh-CN': '🫂 无条件抱抱 • 🍵 泡热茶 • 🛏️ 让她睡 • 🤐 别讲道理——就听 • 🍫 带巧克力',
    },
    warning: {
      sr: 'Ne govori "nije to ništa" — za nju JESTE. Ne pokreći teške teme. Ne očekuj seks.',
      en: "Don't say \"it's nothing\" — to her, it IS. Don't bring up heavy topics. Don't expect sex.",
      'zh-CN': '别说"没那么严重"——对她来说就是很严重。别讨论沉重话题。别期待性生活。',
    },
  },
  follicular: {
    name: { sr: 'Folikularna', en: 'Follicular', 'zh-CN': '卵泡期' },
    days: { sr: 'Dan 8-13 ciklusa', en: 'Day 8-13 of cycle', 'zh-CN': '周期第8-13天' },
    energy: { sr: '⭐⭐⭐⭐ Raste — sve više energije', en: '⭐⭐⭐⭐ Rising — more energy each day', 'zh-CN': '⭐⭐⭐⭐ 上升中——精力越来越好' },
    libido: {
      sr: '🔥🔥 Raste postepeno — počinje da se oseća privlačno',
      en: '🔥🔥 Rising gradually — starting to feel attractive',
      'zh-CN': '🔥🔥 逐渐上升——开始感觉自己有魅力',
    },
    physical: {
      sr: 'Estrogen raste! Koža blista, kosa sjajna, telo se oseća jače. Ovo je faza kad izgleda najbolje — primetićeš.',
      en: "Estrogen rising! Skin glows, hair shines, body feels stronger. This is when she looks her best — you'll notice.",
      'zh-CN': '雌激素上升！皮肤发光、头发亮泽、身体更有力。这是她最好看的阶段——你会注意到的。',
    },
    emotional: {
      sr: 'Optimistična, društvena, kreativna. Najbolje vreme za nove planove. Otvorena za razgovor — iskoristi to.',
      en: 'Optimistic, social, creative. Best time for new plans. Open to conversation — use this.',
      'zh-CN': '乐观、爱社交、有创意。最适合制定新计划。愿意聊天——抓住机会。',
    },
    sex: {
      sr: 'Libido raste svakim danom. Još nije na vrhuncu, ali je sve otvorenija za flert i dodir. Odlično vreme za predigru i istraživanje.',
      en: 'Libido rising each day. Not at peak yet, but increasingly open to flirtation and touch. Great time for foreplay and exploration.',
      'zh-CN': '性欲每天都在上升。还没到顶峰，但对调情和触碰越来越开放。适合前戏和探索的好时机。',
    },
    support: {
      sr: '💬 Pričaj o planovima za budućnost • 🎯 Predloži izlazak ili putovanje • 🌸 Kupi cveće — primetiće • 💪 Vežbajte zajedno',
      en: "💬 Talk about future plans • 🎯 Suggest going out or a trip • 🌸 Buy flowers — she'll notice • 💪 Exercise together",
      'zh-CN': '💬 聊未来计划 • 🎯 约她出去或旅行 • 🌸 买花——她一定注意到 • 💪 一起运动',
    },
    warning: {
      sr: 'Ne propusti ovu fazu — ona se otvara ka tebi. Budi prisutan i angažovan.',
      en: "Don't miss this phase — she's opening up to you. Be present and engaged.",
      'zh-CN': '别错过这个阶段——她正在向你敞开心扉。积极参与她的生活。',
    },
  },
  ovulation: {
    name: { sr: 'Ovulacija', en: 'Ovulation', 'zh-CN': '排卵期' },
    days: { sr: 'Dan 14-16 ciklusa', en: 'Day 14-16 of cycle', 'zh-CN': '周期第14-16天' },
    energy: { sr: '⭐⭐⭐⭐⭐ Vrhunac — na maksimumu!', en: '⭐⭐⭐⭐⭐ Peak — at maximum!', 'zh-CN': '⭐⭐⭐⭐⭐ 巅峰——状态最好！' },
    libido: {
      sr: '🔥🔥🔥🔥🔥 VRHUNAC — libido na maksimumu. Ovo su dani kad je najviše zainteresovana za seks.',
      en: "🔥🔥🔥🔥🔥 PEAK — libido at maximum. These are the days she's most interested in sex.",
      'zh-CN': '🔥🔥🔥🔥🔥 最高——性欲达到顶峰。这是她最想要性爱的几天。',
    },
    physical: {
      sr: 'Vrhunac energije i plodnosti. Može osetiti blagi bol u karlici (ovulacioni bol). Bistar sekret — znak plodnosti. Grudi mogu biti osetljivije.',
      en: 'Peak energy and fertility. May feel mild pelvic pain. Clear discharge — sign of fertility. Breasts may be more sensitive.',
      'zh-CN': '能量和生育力巅峰。可能有轻微排卵痛。分泌物清亮——生育力标志。乳房可能更敏感。',
    },
    emotional: {
      sr: 'Samopouzdana, privlačna, magnetična. Oseća se NAJBOLJE u celom ciklusu. Komplimenti joj sad znače najviše — i veruje im.',
      en: 'Confident, attractive, magnetic. Feels her BEST in the whole cycle. Compliments mean the most now — and she believes them.',
      'zh-CN': '自信、迷人、有魅力。整个周期中状态最好。现在夸她最有效——而且她真的会相信。',
    },
    sex: {
      sr: 'Ovo su dani kad je najotvorenija za seks. Njeno telo je bukvalno programirano za intimnost sad. Iniciraj nežno — gotovo sigurno će biti raspoložena. Najbolji dani za začeće.',
      en: "These are the days she's most open to sex. Her body is literally programmed for intimacy now. Initiate gently — she's almost certainly in the mood. Best days for conception.",
      'zh-CN': '这是她最愿意做爱的几天。她的身体此时天然地渴望亲密。温柔地主动——她几乎一定会有回应。最容易受孕的日子。',
    },
    support: {
      sr: '✨ Iskreni komplimenti (izgled, miris, energija) • 💋 Budi romantičan i pažljiv • 🎉 Izvedi je — ples, večera, bilo šta • 🔥 Iniciraj intimnost',
      en: '✨ Genuine compliments (looks, smell, energy) • 💋 Be romantic and attentive • 🎉 Take her out — dancing, dinner, anything • 🔥 Initiate intimacy',
      'zh-CN': '✨ 真诚赞美（外表、气味、能量）• 💋 浪漫体贴 • 🎉 带她出去——跳舞、晚餐 • 🔥 主动亲密',
    },
    warning: {
      sr: 'Ovo su njeni NAJBOLJI dani. Ne preskači ih. Ako postoji dan za romantiku — ovo je taj dan.',
      en: "These are her BEST days. Don't skip them. If there's a day for romance — this is it.",
      'zh-CN': '这是她最好的日子。别错过。如果要选浪漫的一天——就是这天。',
    },
  },
  luteal: {
    name: { sr: 'Lutealna', en: 'Luteal', 'zh-CN': '黄体期' },
    days: { sr: 'Dan 17-28 ciklusa', en: 'Day 17-28 of cycle', 'zh-CN': '周期第17-28天' },
    energy: {
      sr: '⭐⭐ Prvo ok, pred kraj pada — umor raste',
      en: '⭐⭐ OK at first, drops toward end — fatigue grows',
      'zh-CN': '⭐⭐ 前期还行，越往后越累——疲劳加重',
    },
    libido: {
      sr: '🔥🔥 Prvo OK, pred kraj opada. Može varirati — dan da, dan ne.',
      en: '🔥🔥 OK at first, drops toward end. May vary — day yes, day no.',
      'zh-CN': '🔥🔥 前期还行，越往后越低。可能忽高忽低——今天想明天不想。',
    },
    physical: {
      sr: 'Progesteron dominira. Telo zadržava vodu — oseća se naduto. Grudi osetljive. Akne moguće. Pred kraj: umor, žudnja za hranom, glavobolje.',
      en: 'Progesterone dominates. Water retention — feels bloated. Breast tenderness. Acne possible. Near the end: fatigue, cravings, headaches.',
      'zh-CN': '孕激素主导。身体水肿——感觉浮肿。乳房胀痛。可能长痘。快结束时：极度疲劳、特别想吃东西、头痛。',
    },
    emotional: {
      sr: 'PMS faza: raspoloženje varira. Može biti razdražljiva, anksiozna, plačljiva. Važno: OVO NIJE ONA — ovo su hormoni. Ne uzimaj ništa lično.',
      en: "PMS phase: mood swings. May be irritable, anxious, tearful. Important: THIS IS NOT HER — this is hormones. Don't take anything personally.",
      'zh-CN': 'PMS阶段：情绪波动。可能烦躁、焦虑、想哭。重要：这不是真的她——这是荷尔蒙。千万别往心里去。',
    },
    sex: {
      sr: 'Libido varira. U prvoj polovini može biti raspoložena. Pred kraj — verovatno neće biti zainteresovana. Ne pritiskaj. Ako kaže ne — to je NE.',
      en: "Libido varies. First half may be in the mood. Near the end — probably not interested. Don't pressure. If she says no — it's NO.",
      'zh-CN': '性欲忽高忽低。前半段可能有兴致。快结束时——八成不想。别施压。她说不要就是真的不要。',
    },
    support: {
      sr: '🍵 Čaj bez kofeina • 🤐 Slušaj — ne rešavaj • 🍕 Naruči njenu omiljenu hranu • 🌙 Topla kupka, sveće, muzika • 💆 Ponudi masažu',
      en: "🍵 Caffeine-free tea • 🤐 Listen — don't solve • 🍕 Order her favorite food • 🌙 Warm bath, candles, music • 💆 Offer massage",
      'zh-CN': '🍵 无咖啡因茶 • 🤐 听就好——别解决 • 🍕 点她爱吃的 • 🌙 热水澡、蜡烛、音乐 • 💆 主动给她按摩',
    },
    warning: {
      sr: 'Ne svađaj se — ne možeš pobediti protiv hormona. Ne govori "ta ti je opet ono doba". Budi tu, ćuti, zagrli.',
      en: "Don't argue — you can't win against hormones. Don't say \"is it that time again.\" Be there, be quiet, hug her.",
      'zh-CN': '别吵架——你跟荷尔蒙吵不赢。别说"你是不是又来那个了"。在就好、安静、抱住。',
    },
  },
};

function renderBarrySymptomView() {
  const isBarry = activeProfile === 'barry';
  document.getElementById('barry-symptom-view').style.display = isBarry ? '' : 'none';
  document.getElementById('andjela-symptom-view').style.display = isBarry ? 'none' : '';
  if (!isBarry) return;
  const container = document.getElementById('barrySymptomAnalysis');
  const shared = getSharedCyclePhase();
  const phaseKey = shared && shared.phase ? shared.phase : 'general';
  const l = lang || 'sr';
  document.getElementById('bs-title').textContent =
    l === 'sr' ? '🔬 Anđela danas — detaljna analiza' : l === 'en' ? '🔬 Anđela Today — Full Analysis' : '🔬 Anđela 今日详细分析';
  if (phaseKey === 'general' || typeof PHASE_ANALYSIS === 'undefined' || !PHASE_ANALYSIS[phaseKey]) {
    container.innerHTML =
      '<div class="card" style="text-align:center;padding:20px"><span style="font-size:3rem">🌸</span><div style="font-size:.78rem;color:var(--text-muted);margin-top:8px">' +
      (l === 'sr' ? 'Čekam podatke sa Anđelinog telefona...' : l === 'en' ? "Waiting for data from Anđela's phone..." : '等待 Anđela 手机同步数据...') +
      '</div></div>';
    return;
  }
  const pa = PHASE_ANALYSIS[phaseKey];
  const pc = { period: 'var(--love)', follicular: 'var(--sage)', ovulation: 'var(--teal)', luteal: 'var(--lavender)' };
  const pe = { period: '🩸', follicular: '🌱', ovulation: '✨', luteal: '🌙' };
  const color = pc[phaseKey] || 'var(--love)';
  let h = '';
  h +=
    '<div class="card" style="border-left:5px solid ' +
    color +
    ';margin-bottom:10px;background:linear-gradient(135deg,var(--rose-light),var(--card));text-align:center;padding:18px">';
  h += '<div style="font-size:2.5rem;margin-bottom:4px">' + pe[phaseKey] + '</div>';
  h += '<div style="font-size:.95rem;font-weight:800;color:var(--text)">' + (pa.name[l] || pa.name['sr']) + '</div>';
  h += '<div style="font-size:.65rem;color:var(--text-muted)">' + (pa.days[l] || pa.days['sr']) + '</div>';
  if (shared && shared.nextStart) {
    h +=
      '<div style="font-size:.62rem;color:var(--gold);margin-top:2px">📅 ' +
      (l === 'sr' ? 'Sledeća: ' + shared.nextStart : l === 'en' ? 'Next: ' + shared.nextStart : '下次: ' + shared.nextStart) +
      '</div>';
  }
  h += '</div>';

  h += '<div class="card" style="padding:14px;margin-bottom:10px"><div style="display:flex;justify-content:space-around;text-align:center">';
  h +=
    '<div><div style="font-size:.62rem;color:var(--text-muted);margin-bottom:2px">⚡ ' +
    (l === 'sr' ? 'Energija' : l === 'en' ? 'Energy' : '精力') +
    '</div><div style="font-size:.82rem">' +
    (pa.energy[l] || pa.energy['sr']) +
    '</div></div>';
  h +=
    '<div><div style="font-size:.62rem;color:var(--text-muted);margin-bottom:2px">🔥 ' +
    (l === 'sr' ? 'Libido' : l === 'en' ? 'Libido' : '性欲') +
    '</div><div style="font-size:.82rem">' +
    (pa.libido[l] || pa.libido['sr']) +
    '</div></div>';
  h += '</div></div>';

  h +=
    '<div class="card" style="padding:14px;margin-bottom:10px"><div style="font-weight:700;font-size:.74rem;margin-bottom:4px">🩺 ' +
    (l === 'sr' ? 'Fizičke promene' : l === 'en' ? 'Physical Changes' : '身体变化') +
    '</div><div style="font-size:.72rem;color:var(--text-muted);line-height:1.7">' +
    (pa.physical[l] || pa.physical['sr']) +
    '</div></div>';
  h +=
    '<div class="card" style="padding:14px;margin-bottom:10px"><div style="font-weight:700;font-size:.74rem;margin-bottom:4px">💭 ' +
    (l === 'sr' ? 'Emocionalno stanje' : l === 'en' ? 'Emotional State' : '情绪状态') +
    '</div><div style="font-size:.72rem;color:var(--text-muted);line-height:1.7">' +
    (pa.emotional[l] || pa.emotional['sr']) +
    '</div></div>';
  h +=
    '<div class="card" style="padding:14px;margin-bottom:10px;border-left:4px solid var(--love)"><div style="font-weight:700;font-size:.74rem;margin-bottom:4px">🔥 ' +
    (l === 'sr' ? 'Seks i intimnost' : l === 'en' ? 'Sex & Intimacy' : '性爱与亲密') +
    '</div><div style="font-size:.72rem;color:var(--text-muted);line-height:1.7">' +
    (pa.sex[l] || pa.sex['sr']) +
    '</div></div>';
  h +=
    '<div class="card" style="padding:14px;margin-bottom:10px;background:linear-gradient(135deg,var(--teal-light),var(--card))"><div style="font-weight:700;font-size:.74rem;margin-bottom:4px">💡 ' +
    (l === 'sr' ? 'Kako da joj pomogneš' : l === 'en' ? 'How to Support Her' : '怎么帮她') +
    '</div><div style="font-size:.72rem;color:var(--text);line-height:1.8">' +
    (pa.support[l] || pa.support['sr']) +
    '</div></div>';
  h +=
    '<div class="card" style="padding:12px;margin-bottom:10px;background:var(--rose-light);border:1px solid var(--rose)"><div style="font-weight:700;font-size:.7rem;margin-bottom:2px">⚠️ ' +
    (l === 'sr' ? 'Šta NE raditi' : l === 'en' ? 'What NOT to do' : '千万别做') +
    '</div><div style="font-size:.68rem;color:var(--rose-dark);line-height:1.5">' +
    (pa.warning[l] || pa.warning['sr']) +
    '</div></div>';
  container.innerHTML = h;
}

// Share Anđela's symptoms for Barry to see
function updateSharedSymptoms() {
  if (activeProfile !== 'andjela') return;
  const key = fmtDate(today());
  const symptoms = state.symptoms[key];
  if (symptoms) {
    localStorage.setItem('shared-symptoms', JSON.stringify(symptoms));
    pushAllSharedData();
  }
}

// Special badge for Anđela
// Sleep Tracker
function getSpecialDate(d) {
  const annMet = localStorage.getItem('cycle-ann-met') || '2026-03-19';
  const annLove = localStorage.getItem('cycle-ann-love') || '2026-05-07';
  const mmdd = String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const metMMDD = annMet.slice(5);
  const loveMMDD = annLove.slice(5);
  if (mmdd === metMMDD) {
    return {
      icon: '💕',
      type: 'firstmeet',
      title_sr: '✨ Dan kad smo se sreli',
      title_zh: '✨ 初次相遇纪念日',
      desc_sr: 'Najlepši dan — kad smo se prvi put sreli ♥',
      desc_zh: '最美好的一天——我们初次相遇 ♥',
    };
  }
  if (mmdd === loveMMDD) {
    return {
      icon: '💝',
      type: 'monthly',
      title_sr: '♥ Zajedno smo',
      title_zh: '♥ 在一起的纪念日',
      desc_sr: 'Dan kad je sve počelo — ljubav koja traje ♥',
      desc_zh: '一切开始的那一天——永恒的爱 ♥',
    };
  }
  if (annMet) {
    const met = new Date(annMet + 'T00:00:00');
    const diff = daysDiff(met, d0(d));
    if (diff > 0 && diff % 90 === 0 && diff <= 365) {
      return {
        icon: '🌷',
        type: 'monthly',
        title_sr: diff + ' dana od susreta',
        title_zh: '相遇 ' + diff + ' 天',
        desc_sr: diff + ' dana od prvog susreta ♥',
        desc_zh: '相遇 ' + diff + ' 天 ♥',
      };
    }
  }
  return null;
}

/* ================================================================
   BIRTHDAY — check date & render countdown card
   Birthdays stored in localStorage: cycle-bday-andjela, cycle-bday-barry
   Defaults: 13. oktobar (Anđela), 27. avgust (Barry)
   ================================================================ */
function getBirthday(d) {
  const aBday = localStorage.getItem('cycle-bday-andjela') || '10-13';
  const bBday = localStorage.getItem('cycle-bday-barry') || '08-27';
  const mmdd = String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  return mmdd === aBday || mmdd === bBday;
}
function renderBirthdayCard() {
  const card = document.getElementById('birthdayCard');
  const title = document.getElementById('birthday-title');
  const content = document.getElementById('birthday-content');
  if (!card || !title || !content) return;
  const aBday = localStorage.getItem('cycle-bday-andjela') || '10-13';
  const bBday = localStorage.getItem('cycle-bday-barry') || '08-27';
  const td = today();
  const aDate = new Date(td.getFullYear(), parseInt(aBday.split('-')[0]) - 1, parseInt(aBday.split('-')[1]));
  const bDate = new Date(td.getFullYear(), parseInt(bBday.split('-')[0]) - 1, parseInt(bBday.split('-')[1]));
  if (aDate < td) aDate.setFullYear(aDate.getFullYear() + 1);
  if (bDate < td) bDate.setFullYear(bDate.getFullYear() + 1);
  const aDays = Math.ceil((aDate - td) / 86400000);
  const bDays = Math.ceil((bDate - td) / 86400000);
  const closeDays = Math.min(aDays, bDays);
  const isAnyToday = aDays === 365 || aDays === 0 || bDays === 365 || bDays === 0;
  if (isAnyToday) {
    card.style.display = '';
    const who = aDays === 365 || aDays === 0 ? '🎂 Anđela' : '🎂 Barry';
    title.textContent = '🎉 ' + (lang === 'sr' ? 'Rođendan!' : lang === 'en' ? 'Birthday!' : '生日！');
    content.innerHTML = '<div class="text-center" style="font-size:1.2rem;line-height:2">' + who + ' 🎉🎉🎉</div>';
    return;
  }
  if (closeDays <= 30) {
    card.style.display = '';
    const who = aDays < bDays ? '🌸 Anđela' : '👦 Barry';
    title.textContent = '🎂 ' + (lang === 'sr' ? 'Rođendan' : lang === 'en' ? 'Birthday' : '生日');
    content.innerHTML =
      '<div class="text-center" style="font-size:.82rem">' +
      who +
      ' — ' +
      closeDays +
      ' ' +
      (lang === 'sr' ? 'dana' : lang === 'en' ? 'days' : '天') +
      '</div>';
  } else {
    card.style.display = 'none';
  }
}

function renderSpecialBadge() {
  const badge = document.getElementById('specialBadge');
  if (activeProfile !== 'andjela') {
    badge.style.display = 'none';
    return;
  }
  badge.style.display = '';
  const texts =
    lang === 'sr'
      ? ['Ti si jedinstvena ✨', 'Najlepša na svetu 🌸', 'Barryjeva ljubav 💝', 'Jedna jedina 💫']
      : lang === 'en'
        ? ['You are unique ✨', 'Most beautiful 🌸', "Barry's love 💝", 'One and only 💫']
        : ['独一无二的你 ✨', '最美的人 🌸', 'Barry 的爱 💝', '世界上唯一的你 💫'];
  document.getElementById('specialBadgeText').textContent = texts[Math.floor(Math.random() * texts.length)];
}

/* Update shared symptoms when Anđela saves */
const _origSaveSymptom = saveSymptom;
saveSymptom = function () {
  _origSaveSymptom();
  updateSharedSymptoms();
};

// (self-test suite removed in cleanup)

/* ── BOOT: Initialize auth and start the app ─────────────────── */
if (typeof AuthModule !== 'undefined') {
  AuthModule.init();
}

/* ── 自动同步：登录确认（bootApp）后启动 60s 自动拉取，登出时停止 ── */
(function () {
  // bootApp 是登录成功（PIN 验证通过）与会话恢复的共同入口
  var _bootAppOrig = window.bootApp;
  if (typeof _bootAppOrig === 'function') {
    window.bootApp = function () {
      var _result = _bootAppOrig.apply(this, arguments);
      if (typeof SyncModule !== 'undefined' && SyncModule.startAutoPull) SyncModule.startAutoPull();
      return _result;
    };
  }
  // 登出时停止轮询，避免后台持续请求
  var _logoutOrig = AuthModule.logout;
  if (typeof _logoutOrig === 'function') {
    AuthModule.logout = function () {
      if (typeof SyncModule !== 'undefined' && SyncModule.stopAutoPull) SyncModule.stopAutoPull();
      return _logoutOrig.apply(this, arguments);
    };
  }
})();

/* === dist/js/module-sleep.js === */
"use strict";

(function () {
  console.log('[module-sleep] 已加载');

  function saveSleep() {
    var time = document.getElementById('sleepTime').value;
    if (!time) return;
    var entry = { time: time, date: fmtDate(new Date()), saved: Date.now() };
    localStorage.setItem('barry-sleep', JSON.stringify(entry));
    if (typeof pushAllSharedData === 'function') pushAllSharedData();
    renderSleepCard();
    toast('\u{1F634} ' + (typeof t === 'function' ? t('sleepSaved') : 'Saved!'));
  }
  window.saveSleep = saveSleep;

  function getBarrySleep() {
    try { return JSON.parse(localStorage.getItem('barry-sleep')) || null; } catch (e) { return null; }
  }
  window.getBarrySleep = getBarrySleep;

  function renderSleepCard() {
    var card = document.getElementById('sleepCard');
    if (!card) return;
    card.style.display = '';
    document.getElementById('sleep-title').textContent = '\u{1F634} ' + (typeof t === 'function' ? t('sleepTitle') : 'Sleep');
    if (activeProfile === 'barry') {
      document.getElementById('sleepBarryView').style.display = '';
      document.getElementById('sleepAngieView').style.display = 'none';
      document.getElementById('sleep-hint').textContent = (typeof t === 'function' ? t('sleepHint') : '');
      document.getElementById('sleep-save').textContent = (typeof t === 'function' ? t('sleepSave') : 'Save');
      var s = getBarrySleep();
      if (s) document.getElementById('sleepTime').value = s.time;
    } else {
      document.getElementById('sleepBarryView').style.display = 'none';
      document.getElementById('sleepAngieView').style.display = '';
      var s = getBarrySleep();
      if (!s) {
        document.getElementById('sleepAngieContent').innerHTML = '<div style="text-align:center;color:var(--text-muted);font-size:.72rem">' + (typeof t === 'function' ? t('sleepEmpty') : '') + '</div>';
        return;
      }
      var parts = s.time.split(':');
      var hour = parseInt(parts[0]), min = parseInt(parts[1]);
      var lateMsg = '';
      if (hour >= 2 || (hour === 1 && min >= 30)) {
        lateMsg = '<div style="background:var(--rose-light);border-radius:12px;padding:12px;margin-top:8px;text-align:center"><span style="font-size:1.5rem">\u{1F494}</span><div style="font-size:.76rem;color:var(--rose-dark);font-weight:700;line-height:1.6">' + (typeof t === 'function' ? t('sleepLateTitle').replace('{time}', s.time) : '') + '</div><div style="font-size:.68rem;color:var(--rose-dark);margin-top:4px;line-height:1.5">' + (typeof t === 'function' ? t('sleepLateMsg') : '') + '</div></div>';
      }
      document.getElementById('sleepAngieContent').innerHTML = '<div style="text-align:center"><span style="font-size:2rem">\u{1F634}</span><div style="font-size:.78rem;color:var(--text);margin-top:4px">' + (typeof t === 'function' ? t('sleepLabel') : '') + ' <b>' + s.time + '</b></div><div style="font-size:.62rem;color:var(--text-muted)">' + s.date + '</div></div>' + lateMsg;
    }
  }
  window.renderSleepCard = renderSleepCard;
})();

/* === dist/js/module-settings.js === */
"use strict";

(function () {
  // console.log('[module-settings] 已加载');

  /* token i18n via global t() */
  function _i18n(key, fallback) {
    return typeof window.t === 'function' ? window.t(key) : fallback;
  }

  function saveGitHubToken() {
    var _val = document.getElementById('set-gh-token').value.trim();
    var warning = document.getElementById('tokenSecurityWarning');
    if (_val) {
      localStorage.setItem('gh-token', _val);
      toast('\u{1F511} ' + _i18n('tokenSaved', 'Token saved \u{2713}'));
      console.log('[Token] Token 已保存到 localStorage (前4位=' + _val.substring(0, 4) + '...)');
      if (warning) warning.style.display = '';
      // 保存后立即验证 Token
      _validateStoredToken();
      if (typeof pullAllSharedData === 'function') {
        pullAllSharedData().then(function () {
          if (typeof updateSyncStatusBadge === 'function') updateSyncStatusBadge();
          if (typeof renderAll === 'function') renderAll();
        });
      }
    } else {
      localStorage.removeItem('gh-token');
      console.warn('[Token] Token 被保存但值为空，已从 localStorage 移除');
      if (warning) warning.style.display = 'none';
      if (typeof updateSyncStatusBadge === 'function') updateSyncStatusBadge();
    }
  }
  window.saveGitHubToken = saveGitHubToken;

  // 保存后立即验证 Token 有效性
  async function _validateStoredToken() {
    var _t = typeof getGitHubToken === 'function' ? getGitHubToken() : '';
    if (!_t) return;
    try {
      var _r = await fetch('https://api.github.com/user', { headers: { Authorization: 'Bearer ' + _t, Accept: 'application/vnd.github.v3+json' } });
      if (_r.ok) {
        console.log('[Token] Token 验证通过 ✓');
      } else if (_r.status === 401) {
        toast(_i18n('tokenInvalid', 'Token invalid'));
        console.error('[Token] Token 无效 (401)');
      }
    } catch (_e) {
      // 网络错误不干扰用户操作
    }
  }

  async function testGitHubToken() {
    var btn = document.getElementById('testTokenBtn');
    if (!btn) return;
    var origText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '\u{23F3} Testiranje...';
    var token = typeof getGitHubToken === 'function' ? getGitHubToken() : localStorage.getItem('gh-token') || '';
    if (!token) {
      toast('\u{1F511} ' + _i18n('tokenMissing', 'Enter a token first'));
      btn.textContent = origText; btn.disabled = false; return;
    }
    try {
      var resp = await fetch('https://api.github.com/user', { headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github.v3+json' } });
      if (resp.ok) {
        var user = await resp.json();
        toast('\u{2705} ' + _i18n('tokenValid', 'Token valid') + ' \u{2014} ' + (user.login || ''));
        btn.textContent = '\u{2705} Va\u{017E}i'; setTimeout(function () { btn.textContent = origText; btn.disabled = false; }, 3000);
      } else if (resp.status === 401) {
        toast('\u{274C} ' + _i18n('tokenInvalid', 'Token invalid'));
        btn.textContent = '\u{274C} Neva\u{017E}e\u{0107}i'; setTimeout(function () { btn.textContent = origText; btn.disabled = false; }, 3000);
      } else {
        toast('\u{26A0}\u{FE0F} ' + _i18n('tokenError', 'Error: ') + resp.status);
        btn.textContent = origText; btn.disabled = false;
      }
    } catch (e) {
      toast('\u{26A0}\u{FE0F} ' + _i18n('tokenNetError', 'Network error'));
      btn.textContent = origText; btn.disabled = false;
    }
  }
  window.testGitHubToken = testGitHubToken;

  function clearGitHubToken() {
    if (typeof getGitHubToken !== 'function') return;
    if (!getGitHubToken()) return;
    if (!confirm(_i18n('tokenConfirmClear', ''))) return;
    localStorage.removeItem('gh-token');
    document.getElementById('set-gh-token').value = '';
    var warning = document.getElementById('tokenSecurityWarning');
    if (warning) warning.style.display = 'none';
    if (typeof updateSyncStatusBadge === 'function') updateSyncStatusBadge();
    toast('\u{1F5D1}\u{FE0F} ' + _i18n('tokenCleared', 'Token cleared'));
    console.log('[Token] Token 已清除');
  }
  window.clearGitHubToken = clearGitHubToken;

  function loadSettingsUI() {
    document.getElementById('set-cycle').value = (state && state.settings) ? state.settings.cycleLength : 28;
    document.getElementById('set-period').value = (state && state.settings) ? state.settings.periodLength : 7;
    document.getElementById('set-language').value = lang;
    document.getElementById('set-theme').value = typeof theme !== 'undefined' ? theme : 'light';
    document.getElementById('annDateMet').value = typeof annDateMet !== 'undefined' ? annDateMet : '2026-03-19';
    document.getElementById('annDateLove').value = typeof annDateLove !== 'undefined' ? annDateLove : '2026-05-07';
    var _tokenVal = typeof getGitHubToken === 'function' ? getGitHubToken() : '';
    var hasToken = !!_tokenVal;
    document.getElementById('set-gh-token').value = _tokenVal;
    document.getElementById('github-token-label').textContent = '\u{1F511} ' + _i18n('settingsTokenLabel', 'GitHub Token');
    document.getElementById('set-gh-token').placeholder = 'ghp_...';
    document.getElementById('set-gh-token').setAttribute('aria-label', _i18n('settingsTokenLabel', 'GitHub Token'));
    document.getElementById('set-h-token').textContent = hasToken ? _i18n('settingsTokenHintEnabled', '') : _i18n('settingsTokenHintDisabled', '');
    // Token-related text i18n (hardcoded in HTML, updated dynamically)
    var warning = document.getElementById('tokenSecurityWarning');
    if (warning) {
      warning.textContent = '⚠️ ' + (lang === 'zh-CN' ? 'Token 已保存于浏览器本地存储。请使用最小权限的 fine-grained token（仅 contents:write 权限）。' : lang === 'en' ? 'Token saved in browser local storage. Use minimal fine-grained token (contents:write only).' : 'Token sačuvan u lokalnom skladištu pregledača. Koristi fine-grained token sa minimalnim ovlašćenjima (samo contents:write za ovaj repozitorijum).');
      warning.style.display = hasToken ? '' : 'none';
    }
    var testBtn = document.getElementById('testTokenBtn');
    if (testBtn) testBtn.textContent = '🔍 ' + (lang === 'zh-CN' ? '测试 Token' : lang === 'en' ? 'Test Token' : 'Testiraj token');
    var clearBtn = document.getElementById('clearTokenBtn');
    if (clearBtn) clearBtn.textContent = '🗑️ ' + (lang === 'zh-CN' ? '清除 Token' : lang === 'en' ? 'Clear Token' : 'Obriši token');
    if (typeof updateAnniversaryCount === 'function') updateAnniversaryCount();
    if (typeof updateSyncStatusBadge === 'function') updateSyncStatusBadge();
  }
  window.loadSettingsUI = loadSettingsUI;

  function saveSettings() {
    if (!state || !state.settings) return;
    state.settings.cycleLength = parseInt(document.getElementById('set-cycle').value) || 28;
    state.settings.periodLength = parseInt(document.getElementById('set-period').value) || 7;
    if (typeof saveState === 'function') saveState();
    if (typeof renderAll === 'function') renderAll(['calendar', 'core']);
    if (typeof toast === 'function' && typeof t === 'function') toast(t('toast.saved'));
  }
  window.saveSettings = saveSettings;
})();

/* === dist/js/module-dashboard.js === */
"use strict";

(function () {
  console.log('[module-dashboard] 已加载');

  var DASH_I18N = {
    barry: {
      dashTitle: '\u{1F3E0} \u{4E3B}\u{9875}',
      welcomeBack: '\u{65E9}\u{4E0A}\u{597D}\u{FF0C}',
      todayCulture: '\u{4ECA}\u{65E5}\u{6587}\u{5316}\u{77E5}\u{8BC6}',
      goDiary: '\u{1F4DD} \u{5199}\u{65E5}\u{8BB0}',
      goCalendar: '\u{1F4C5} \u{67E5}\u{770B}\u{65E5}\u{5386}',
      connectQ: '\u{1F4AD} \u{4ECA}\u{5929}\u{7684}\u{5BF9}\u{8BDD}',
      refreshQ: '\u{1F504} \u{6362}\u{4E00}\u{4E2A}\u{95EE}\u{9898}',
      todayPhase: '\u{4ECA}\u{65E5}\u{9636}\u{6BB5}',
      todayMoodDash: '\u{4ECA}\u{65E5}\u{5FC3}\u{60C5}',
      todayStreak: '\u{8FDE}\u{7EED}\u{6253}\u{5361}',
      todayCycles: '\u{5468}\u{671F}\u{603B}\u{6570}',
      avgAbbr: '\u{5E73}\u{5747}'
    },
    andjela: {
      dashTitle: '\u{1F3E0} Po\u{010D}etna',
      welcomeBack: 'Dobrodo\u{0161}la,',
      todayCulture: 'Dana\u{0161}nje kulturno znanje',
      goDiary: '\u{1F4DD} Dnevnik',
      goCalendar: '\u{1F4C5} Kalendar',
      connectQ: '\u{1F4AD} Pitanje dana',
      refreshQ: '\u{1F504} Drugo pitanje',
      todayPhase: 'Trenutna faza',
      todayMoodDash: 'Raspolo\u{017E}enje',
      todayStreak: 'Niz dana',
      todayCycles: 'Ukupno ciklusa',
      avgAbbr: 'Prosek'
    }
  };

  var DAILY_QS = {
    sr: [
      'Koja je tvoja najlep\u{0161}a uspomena iz detinjstva?',
      '\u{0160}ta bi voleo/la da nau\u{010D}i\u{0161} o Kini?',
      'Kad smo najbli\u{017E}e iako smo 7.000 km daleko?',
      '\u{0160}ta ti najvi\u{0161}e nedostaje kad nisam tu?',
      'Kako zami\u{0161}lja\u{0161} na\u{0161} prvi zagrljaj?',
      'Koji srpski obi\u{010D}aj želi\u{0161} da poka\u{017E}e\u{0161} Baraju?',
      '\u{0160}ta ćemo raditi kad se prvi put sretnemo?'
    ],
    'zh-CN': [
      '\u{4F60}\u{7AE5}\u{5E74}\u{6700}\u{7F8E}\u{597D}\u{7684}\u{56DE}\u{5FC6}\u{662F}\u{4EC0}\u{4E48}\u{FF1F}',
      '\u{4F60}\u{60F3}\u{4E86}\u{89E3}\u{5173}\u{4E8E}\u{585E}\u{5C14}\u{7EF4}\u{4E9A}\u{7684}\u{4EC0}\u{4E48}\u{FF1F}',
      '\u{4EC0}\u{4E48}\u{65F6}\u{5019}\u{4F60}\u{89C9}\u{5F97}\u{6211}\u{4EEC}\u{6700}\u{8FD1}\u{FF1F}',
      '\u{5982}\u{679C}\u{80FD}\u{77AC}\u{95F4}\u{98DE}\u{5230}Kikinda\u{FF0C}\u{4F60}\u{6700}\u{60F3}\u{548C}\u{5979}\u{505A}\u{4EC0}\u{4E48}\u{FF1F}',
      '\u{4F60}\u{89C9}\u{5F97}\u{6211}\u{4EEC}\u{7684}\u{7B2C}\u{4E00}\u{6B21}\u{62E5}\u{62B1}\u{4F1A}\u{662F}\u{4EC0}\u{4E48}\u{6837}\u{7684}\u{FF1F}',
      '\u{4E2D}\u{56FD}\u{6709}\u{4EC0}\u{4E48}\u{4F60}\u{60F3}\u{5E26}An\u{0111}ela\u{53BB}\u{770B}\u{7684}\u{FF1F}',
      '\u{60F3}\u{5411}An\u{0111}ela\u{5B66}\u{4EC0}\u{4E48}\u{585E}\u{5C14}\u{7EF4}\u{4E9A}\u{8BED}\u{FF1F}'
    ],
    en: [
      'What is your most beautiful childhood memory?',
      'What do you want to learn about Serbia/China?',
      'When do you feel closest despite the distance?',
      'What do you miss most when we are apart?',
      'How do you imagine our first hug?',
      'What tradition do you want to share with your partner?',
      'What will we do when we finally meet?'
    ]
  };

  var _initialized = false;

  function dl(key) {
    var profile = (lang || '').indexOf('zh') === 0 ? 'barry' : 'andjela';
    var p = DASH_I18N[profile] || DASH_I18N.andjela;
    return p[key] || DASH_I18N.andjela[key] || key;
  }

  function getDailyQuestion() {
    var qs = DAILY_QS[lang] || DAILY_QS.sr;
    return qs[new Date().getDate() % qs.length];
  }
  window.getDailyQuestion = getDailyQuestion;

  function switchToTab(tabId) {
    var btn = document.querySelector('.tab[data-panel="' + tabId + '"]');
    if (btn) btn.click();
    if (history.replaceState) history.replaceState(null, '', '#' + tabId);
  }
  window.switchToTab = switchToTab;

  function initDashboard() {
    if (typeof getGitHubToken === 'function' && getGitHubToken()) {
      if (typeof pullAllSharedData === 'function') pullAllSharedData().then(function () { renderDashboard(); });
    } else { renderDashboard(); }
  }
  window.initDashboard = initDashboard;

  function _updateWelcome(panel) {
    var myName = activeProfile === 'andjela' ? '\u{1F338} An\u{0111}ela' : '\u{1F466} Barry';
    var el = document.getElementById('dash-welcome');
    if (!el) return;
    var _h = new Date().getHours();
    var _l = (typeof lang !== 'undefined') ? lang : 'sr';
    var _greet, _icon;
    if (_h >= 5 && _h < 12) {
      _greet = _l === 'sr' ? 'Dobro jutro' : _l === 'en' ? 'Good morning' : '\u{65E9}\u{4E0A}\u{597D}';
      _icon = '\u{2600}\u{FE0F}';
    } else if (_h >= 12 && _h < 18) {
      _greet = _l === 'sr' ? 'Dobar dan' : _l === 'en' ? 'Good afternoon' : '\u{4E0B}\u{5348}\u{597D}';
      _icon = '\u{1F324}\u{FE0F}';
    } else {
      _greet = _l === 'sr' ? 'Dobro ve\u{010D}e' : _l === 'en' ? 'Good evening' : '\u{665A}\u{4E0A}\u{597D}';
      _icon = '\u{1F319}';
    }
    var _ann = typeof annDateMet !== 'undefined' ? annDateMet : '2026-03-19';
    var _days = Math.round((Date.now() - new Date(_ann).getTime()) / 86400000);
    el.innerHTML = _greet + ' ' + _icon + '\u{FF0C}' + '<strong>' + myName + '</strong> \u{00B7} ' + _days + ' ' + (_l === 'sr' ? 'dana' : _l === 'en' ? 'days' : '\u{5929}') + ' \u{2764}';
  }

  function _updateStatsCards(panel) {
    var predDash = typeof predict === 'function' ? predict() : { cycles: [], avgCycle: '--', nextStart: null, ovulation: null, fertileStart: null, fertileEnd: null, confidence: 'low', futurePeriods: [] };
    var tdDash = typeof today === 'function' ? today() : new Date();
    var phaseDash = typeof getPhase === 'function' ? getPhase(tdDash, predDash) : null;
    var pe = { 'period-on': '\u{1F9F8}', 'period-mid': '\u{1F9F8}', ovulation: '\u{1F95A}', fertile: '\u{1F331}', luteal: '\u{1F319}', follicular: '\u{1F33F}' };
    var phLabel = (typeof t === 'function' && t('phaseBadges')) ? t('phaseBadges')[phaseDash] || '--' : '--';
    var tm = typeof getMood === 'function' ? getMood(fmtDate(tdDash)) : null;
    var strk = typeof calculateStreak === 'function' ? calculateStreak() : 0;
    var sc = state ? state.records.length : 0;
    var avgD = predDash.avgCycle || '--';
    var el = document.getElementById('dash-stats-cards');
    if (!el) return;
    el.innerHTML =
      '<div style="text-align:center"><div style="font-size:1.4rem">' + (pe[phaseDash] || '\u{1F4CA}') + '</div><div style="font-size:.65rem;font-weight:700;color:var(--text)">' + dl('todayPhase') + '</div><div style="font-size:.58rem;color:var(--text-muted)">' + phLabel + '</div></div>' +
      '<div style="text-align:center"><div style="font-size:1.4rem">' + (tm || '\u{1F324}\u{FE0F}') + '</div><div style="font-size:.65rem;font-weight:700;color:var(--text)">' + dl('todayMoodDash') + '</div><div style="font-size:.58rem;color:var(--text-muted)">' + (tm || '--') + '</div></div>' +
      '<div style="text-align:center"><div style="font-size:1.4rem">\u{1F525}</div><div style="font-size:.65rem;font-weight:700;color:var(--text)">' + dl('todayStreak') + '</div><div style="font-size:.58rem;color:var(--text-muted)">' + strk + ' ' + (lang === 'sr' ? 'dana' : lang === 'en' ? 'days' : '\u{5929}') + '</div></div>' +
      '<div style="text-align:center"><div style="font-size:1.4rem">\u{1F4CA}</div><div style="font-size:.65rem;font-weight:700;color:var(--text)">' + dl('todayCycles') + '</div><div style="font-size:.58rem;color:var(--text-muted)">' + sc + ' / ' + dl('avgAbbr') + ' ' + avgD + 'd</div></div>';
  }

  function _updateConnectCard(panel) {
    var el = document.getElementById('dash-connect');
    if (!el) return;
    var q = getDailyQuestion();
    var cq = el.querySelector('#dailyConnectQ');
    if (cq) cq.textContent = q;
  }

  function _initSkeleton(panel) {
    panel.innerHTML =
      '<div class="dash-welcome" id="dash-welcome">' + dl('welcomeBack') + '<strong></strong></div>' +
      '<div class="card dash-card" style="text-align:center"><div id="dash-stats-cards" style="display:flex;justify-content:space-around;align-items:center;flex-wrap:wrap;gap:8px"></div></div>' +
      '<div class="card dash-card" id="dash-connect" style="border-left:3px solid var(--teal)"><h4>' + dl('connectQ') + '</h4><div style="font-size:.82rem;color:var(--text);line-height:1.6;font-style:italic;margin-bottom:8px" id="dailyConnectQ"></div><button class="dash-link-btn" onclick="document.getElementById(\'dailyConnectQ\').textContent=getDailyQuestion();" style="font-size:.62rem;padding:4px 12px">' + dl('refreshQ') + '</button></div>' +
      '<div class="card dash-card"><div class="dash-links"><button class="dash-link-btn" onclick="switchToTab(\'diary\')">' + dl('goDiary') + '</button><button class="dash-link-btn" onclick="goToday();switchToTab(\'stats\')">' + dl('goCalendar') + '</button></div></div>';
    _initialized = true;
  }

  function renderDashboard() {
    var panel = document.getElementById('panel-dashboard');
    if (!panel) return;
    if (!_initialized) _initSkeleton(panel);
    _updateWelcome(panel);
    _updateStatsCards(panel);
    _updateConnectCard(panel);
    if (typeof animateDashboardCards === 'function') animateDashboardCards();
  }
  window.renderDashboard = renderDashboard;
})();

/* === dist/js/module-stats.js === */
"use strict";

(function () {
  console.log('[module-stats] 已加载');

  function _renderSummary(pred, td, clen) {
    var grid = document.getElementById('statsSummaryGrid');
    if (!grid) return;
    var phase = typeof getPhase === 'function' ? getPhase(td, pred) : null;
    var pe2 = { 'period-on': '\u{1F9F8}', 'period-mid': '\u{1F9F8}', ovulation: '\u{1F95A}', fertile: '\u{1F331}', luteal: '\u{1F319}', follicular: '\u{1F33F}' };
    var phName = (typeof t === 'function' && t('phaseBadges')) ? t('phaseBadges')[phase] || '--' : '--';
    var rl = typeof t === 'function' ? t('statsRegLabels') : { high: '\u{9AD8}', medium: '\u{4E2D}', low: '\u{4F4E}' };
    var regLabel = clen >= 2 ? rl[pred.confidence] : '--';
    var rc = { high: 'var(--sage)', medium: 'var(--gold)', low: 'var(--rose)' };
    grid.innerHTML =
      '<div class="stats-mini-card card-accent-rose"><span class="mini-icon">\u{1F9F8}</span><div class="mini-value">' + clen + '</div><div class="mini-label">' + (typeof t === 'function' ? t('stats.count') : '') + '</div></div>' +
      '<div class="stats-mini-card card-accent-sage"><span class="mini-icon">\u{1F4CF}</span><div class="mini-value">' + (pred.avgCycle || '--') + '<span style="font-size:.65rem">d</span></div><div class="mini-label">' + (typeof t === 'function' ? t('stats.avg') : '') + '</div><div class="mini-sub">' + (clen >= 2 ? pred.minCycle + '\u{2013}' + pred.maxCycle + 'd' : '--') + '</div></div>' +
      '<div class="stats-mini-card card-accent-teal"><span class="mini-icon">' + (pe2[phase] || '\u{1F4CA}') + '</span><div class="mini-value" style="font-size:.9rem;line-height:1.6">' + phName + '</div><div class="mini-label">' + (typeof t === 'function' ? t('statsCurrentPhase') : '--') + '</div></div>' +
      '<div class="stats-mini-card card-accent-gold"><span class="mini-icon">\u{1F3AF}</span><div class="mini-value" style="color:' + rc[pred.confidence] + '">' + regLabel + '</div><div class="mini-label">' + (typeof t === 'function' ? t('stats.reg') : '') + '</div><div class="mini-sub">' + (clen >= 2 ? '\u{03C3}=' + pred.stdDev : '--') + '</div></div>';
  }
  window._renderSummary = _renderSummary;

  function _renderCharts(pred, td, clen) {
    // Set all chart titles FIRST (independent of ChartRenderer)
    var st = document.getElementById('schart-cycle-title');
    if (st) st.textContent = typeof t === 'function' ? t('stats.cycle') : '';
    var moodTitle = document.getElementById('schart-mood-title');
    if (moodTitle) moodTitle.textContent = typeof t === 'function' ? t('stats.mood') : '';

    // Chart drawing requires ChartRenderer
    if (typeof ChartRenderer === 'undefined') return;

    // --- Cycle Trend Chart ---
    var tc = document.getElementById('chartCycleTrend'), te = document.getElementById('chartCycleEmpty');
    if (tc) {
      if (pred.cycles && pred.cycles.length >= 2) {
        if (tc.parentElement) tc.parentElement.style.display = '';
        if (te) te.style.display = 'none';
        var rc2 = pred.cycles.slice(-8), lbs = [];
        for (var ci = 0; ci < rc2.length; ci++) lbs.push('C' + (pred.cycles.length - rc2.length + ci + 1));
        ChartRenderer.drawLineChart(tc, rc2, lbs, { width: 500, height: 200, avgLine: pred.avgCycle, avgLabel: typeof t === 'function' ? t('statsTrendAvg') : '', emptyText: typeof t === 'function' ? t('statsTrendEmpty') : '' });
      } else { if (tc.parentElement) tc.parentElement.style.display = 'none'; if (te) { te.style.display = ''; te.textContent = typeof t === 'function' ? t('statsTrendNeed') : ''; } }
    }

    // --- Mood Donut Chart ---
    var moodCanvas = document.getElementById('chartMoodDonut');
    var moodEmpty = document.getElementById('chartMoodEmpty');
    var moodLegend = document.getElementById('chartMoodLegend');
    if (moodCanvas && typeof state !== 'undefined' && state.moods) {
      var moodCounts = {};
      var moodDates = Object.keys(state.moods);
      for (var mi = 0; mi < moodDates.length; mi++) {
        var mk = state.moods[moodDates[mi]].mood;
        moodCounts[mk] = (moodCounts[mk] || 0) + 1;
      }
      var moodColors = ['#c45a6b','#d4bfb5','#E57373','#b8a0c8','#5e8b7a','#FFB74D','#80a590','#bdbdbd'];
      var segments = [];
      if (typeof MOOD_KEYS !== 'undefined') {
        for (var mj = 0; mj < MOOD_KEYS.length; mj++) {
          if (moodCounts[MOOD_KEYS[mj]]) {
            segments.push({ label: (typeof t === 'function' ? t('moodNames')[mj] : MOOD_KEYS[mj]), value: moodCounts[MOOD_KEYS[mj]], color: moodColors[mj] });
          }
        }
      }
      if (segments.length > 0) {
        if (moodCanvas.parentElement) moodCanvas.parentElement.style.display = '';
        if (moodEmpty) moodEmpty.style.display = 'none';
        var legendResult = ChartRenderer.drawDonutChart(moodCanvas, segments, {
          width: 260, height: 200,
          centerLabel: typeof t === 'function' ? t('statsMoodCenter') : '',
          emptyText: typeof t === 'function' ? t('statsMoodEmpty') : ''
        });
        if (moodLegend && legendResult && legendResult.length > 0) {
          moodLegend.innerHTML = legendResult.map(function(ld) {
            return '<span><span class="legend-dot" style="background:' + ld.color + '"></span>' + ld.label + ' (' + ld.pct + '%)</span>';
          }).join('');
        }
      } else {
        if (moodCanvas.parentElement) moodCanvas.parentElement.style.display = 'none';
        if (moodEmpty) { moodEmpty.style.display = ''; moodEmpty.textContent = typeof t === 'function' ? t('statsMoodNoRecords') : ''; }
        if (moodLegend) moodLegend.innerHTML = '';
      }
    }
  }
  window._renderCharts = _renderCharts;

  function _renderPrediction(pred, td, clen) {
    var ph = document.getElementById('predictionHighlight');
    if (ph && pred.nextStart) {
      ph.style.display = '';
      var du = typeof daysDiff === 'function' ? daysDiff(td, pred.nextStart) : 0;
      var rl2 = typeof t === 'function' ? t('statsRegLabels') : {};
      var pn = document.getElementById('predMainNext');
      if (pn) pn.textContent = du >= 0 ? (typeof t === 'function' ? t('statsDaysUntil') + ' ' + du + ' ' + t('statsDaysUntilEnd') : '') : (typeof t === 'function' ? t('statsDaysLate') + ' ' + Math.abs(du) + ' ' + t('statsDaysLateEnd') : '');
      var ps = document.getElementById('predSubConf');
      if (ps) ps.textContent = clen >= 2 ? (typeof t === 'function' ? t('statsConfidence') : '') + (rl2[pred.confidence] || '') + ' (\u{00B1}' + pred.stdDev + ')' : (typeof t === 'function' ? t('statsNeedCycles') : '');
      var chipMap = { 'predChipOv': pred.ovulation ? fmtDate(pred.ovulation) : '--', 'predChipFert': pred.fertileStart && pred.fertileEnd ? fmtDate(pred.fertileStart) + ' ~ ' + fmtDate(pred.fertileEnd) : '--', 'predChipFuture': pred.futurePeriods.length > 0 ? pred.futurePeriods.map(function (fp) { return fmtDate(fp.start); }).join(', ') : '--', 'predChipReg': clen >= 2 ? (rl2[pred.confidence] || '') + ' \u{00B1}' + pred.stdDev : '--' };
      for (var ck in chipMap) { var cel = document.getElementById(ck); if (cel) cel.textContent = chipMap[ck]; }
      var labelMap = { 'predChipOvLabel': 'stats.ovulation', 'predChipFertLabel': 'stats.fertile', 'predChipFutureLabel': 'stats.future', 'predChipRegLabel': 'stats.regularity' };
      for (var lk in labelMap) { var lel = document.getElementById(lk); if (lel) lel.textContent = typeof t === 'function' ? t(labelMap[lk]) : ''; }
    } else if (ph) { ph.style.display = 'none'; }

    var tr = document.getElementById('timelineRow');
    var sht = document.getElementById('schart-history-title');
    if (sht) sht.textContent = typeof t === 'function' ? t('stats.history') : '';
    if (typeof t === 'function') {
      var ts = document.getElementById('tleg-short'); if (ts) ts.textContent = t('stats.short');
      var tn = document.getElementById('tleg-normal'); if (tn) tn.textContent = t('stats.normal');
      var tl = document.getElementById('tleg-long'); if (tl) tl.textContent = t('stats.long');
    }
    if (tr && pred.cycles && pred.cycles.length > 0) {
      var rcc = pred.cycles.slice(-12), ac = pred.avgCycle;
      tr.innerHTML = rcc.map(function (cy) { var cls = cy < ac - 3 ? 'short' : cy > ac + 3 ? 'long' : 'normal'; return '<span class="timeline-dot ' + cls + '" title="' + cy + 'd"></span>'; }).join('');
    }
    var sr = document.getElementById('sect-relationship');
    if (sr) sr.textContent = typeof t === 'function' ? t('stats.relationship') : '';
  }
  window._renderPrediction = _renderPrediction;

  function renderStatsPanel() {
    var panel = document.getElementById('panel-stats');
    if (!panel || !panel.classList.contains('active')) return;
    var pred = typeof predict === 'function' ? predict() : { cycles: [], avgCycle: '--', nextStart: null, ovulation: null, fertileStart: null, fertileEnd: null, confidence: 'low', futurePeriods: [], minCycle: null, maxCycle: null, stdDev: 0 };
    var td = typeof today === 'function' ? today() : new Date();
    var clen = state ? state.records.length : 0;
    _renderSummary(pred, td, clen);
    _renderCharts(pred, td, clen);
    _renderPrediction(pred, td, clen);
  }
  window.renderStatsPanel = renderStatsPanel;
})();

/* === dist/js/fix-css.js === */
"use strict";
(function () {
  console.log('[fix-css] 已加载');

  var _s = document.createElement('style');
  _s.textContent =
    /* === 通用布局 === */
    'html { overflow-x: hidden !important; }' +

    // #1 导航栏安全区（iPhone Home Indicator）
    'nav.tabs-nav { padding-bottom: env(safe-area-inset-bottom, 0px) !important; }' +
    'nav.tabs-nav { padding-bottom: constant(safe-area-inset-bottom, 0px) !important; }' +

    // #2 日历触摸目标 ≥44px
    '.day { min-height: 44px !important; display: flex !important; align-items: center !important; justify-content: center !important; }' +
    '.day .day-num { line-height: 1.2 !important; }' +
    'nav.tabs-nav .tabs .tab { min-height: 44px !important; padding: 8px 4px !important; }' +
    '.diary-date-btn { min-width: 44px !important; min-height: 44px !important; }' +
    '.mood-emoji { min-width: 44px !important; min-height: 44px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; }' +
    '.dash-link-btn { min-height: 44px !important; }' +
    '.todo-check, .todo-del { min-width: 44px !important; min-height: 44px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; }' +

    // #3 输入框字号 ≥16px（防止 iOS 自动缩放）
    '@media (max-width: 480px) {' +
    'input[type="text"], input[type="number"], input[type="password"], input[type="date"], input[type="time"], input[type="search"], textarea, select { font-size: 16px !important; }' +
    '.diary-textarea { font-size: 16px !important; }' +
    '}' +

    // #4 弹窗在小屏幕溢出修复
    '@media (max-width: 480px) {' +
    '#modal .modal { max-height: 85vh !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; margin: 10px auto !important; border-radius: 14px !important; }' +
    '#modal:not(.hidden) { display: flex !important; align-items: flex-end !important; justify-content: center !important; }' +
    '#modal .modal .btn-row { flex-direction: column !important; gap: 6px !important; }' +
    '#modal .modal .btn-row .btn { width: 100% !important; }' +
    '#modal .modal #modal-close-btn { margin-top: 8px !important; padding: 12px !important; min-height: 44px !important; }' +
    '}' +

    // #5 touch-active 状态（移动端无 hover）
    '.day:active:not(.other-month):not(.period-on):not(.ovulation):not(.fertile) { transform: scale(0.96) !important; }' +
    '.diary-date-btn:active { transform: translateY(0px) !important; box-shadow: none !important; }' +
    'nav.tabs-nav .tabs .tab:active { opacity: 0.7 !important; }' +
    '.dash-link-btn:active { transform: scale(0.97) !important; opacity: 0.8 !important; }' +
    '.todo-check:active { transform: scale(0.85) !important; }' +
    '.todo-del:active { transform: scale(0.9) !important; opacity: 0.6 !important; }' +
    '#fabBtn:active { transform: scale(0.92) !important; }' +
    '.nav-btn:active, .today-pill:active, .cal-view-btn:active { transform: scale(0.92) !important; opacity: 0.7 !important; }' +
    '.lang-btn:active { transform: scale(0.9) !important; }' +
    '.theme-btn:active { transform: scale(0.9) !important; }' +
    '.profile-pill:active { transform: scale(0.95) !important; }' +
    '.emoji-picker-cell:active { transform: scale(0.85) !important; }' +
    '.sym-chip:active { transform: scale(0.92) !important; }' +
    '.hug-btn:active, .diary-submit:active, .btn-primary:active { transform: scale(0.96) !important; opacity: 0.85 !important; }' +
    '.mood-emoji:not(.picked):active { transform: scale(0.9) !important; opacity: 1 !important; }' +

    // #9 星星动画性能优化 + 移动端居中修复
    '.floating-stars .star { will-change: transform, opacity !important; }' +
    'body { margin: 0 !important; overflow-x: hidden !important; width: 100% !important; max-width: 100vw !important; display: flex !important; justify-content: center !important; }' +
    'main { width: 100%; margin: 0; display: flex; justify-content: center; }' +
    '.app { width: 100% !important; max-width: 420px !important; margin: 0 auto !important; }' +
    '.calendar { width: 100% !important; margin: 0 auto !important; box-sizing: border-box !important; }' +
    '.days { grid-template-columns: repeat(7, 1fr) !important; gap: 3px !important; }' +
    '@media (max-width: 420px) { .days { gap: 2px !important; } .day { min-width: 0 !important; } }' +
    '.emoji-picker-overlay { display: none !important; }' +
    '.emoji-picker-overlay.hidden { display: none !important; }' +
    '.week-num { display: none !important; }' +
    'nav.tabs-nav .tabs { display: flex !important; justify-content: space-around !important; width: 100% !important; gap: 0 !important; }' +
    'nav.tabs-nav .tabs .tab.active { color: var(--love) !important; }' +
    '.progress-fill { transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) !important; }' +
    '.day.in-month { animation: fixDayIn 0.35s ease-out both; }' +
    '@keyframes fixDayIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }' +
    '@keyframes modalSlideIn { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }' +
    '#modal:not(.hidden) .modal { animation: modalSlideIn 0.22s ease-out; }' +

    /* === Todo List 动画 === */
    '@keyframes todoItemIn{from{opacity:0;transform:translateY(10px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}' +
    '.todo-item{animation:todoItemIn .35s cubic-bezier(.22,1,.36,1) both}' +
    '.todo-check{cursor:pointer;font-size:1rem;flex-shrink:0;margin-top:2px;width:22px;text-align:center;transition:transform .2s cubic-bezier(.22,1,.36,1)}' +
    '.todo-check:hover{transform:scale(1.2)}' +
    '.todo-check:active{transform:scale(.9)}' +
    '.todo-del{cursor:pointer;font-size:.65rem;opacity:.35;flex-shrink:0;padding:2px 4px;transition:opacity .2s,transform .2s}' +
    '.todo-del:hover{opacity:.8;transform:scale(1.15)}' +
    '.todo-del:active{transform:scale(.9)}' +

    /* === 心情动画 === */
    '@keyframes moodPop{0%{transform:scale(1) rotate(0deg)}40%{transform:scale(1.4) rotate(-10deg)}70%{transform:scale(1.25) rotate(5deg)}100%{transform:scale(1.3) rotate(0deg)}}' +
    '.mood-emoji{transition:transform .25s cubic-bezier(.22,1,.36,1),opacity .2s,background .2s,box-shadow .2s}' +
    '.mood-emoji:not(.picked){opacity:.78}' +
    '.mood-emoji:not(.picked):hover{transform:scale(1.18)!important;opacity:1!important}' +
    '.mood-emoji:not(.picked):active{transform:scale(.9)!important}' +
    '.mood-emoji.picked{animation:moodPop .4s cubic-bezier(.22,1,.36,1) both;background:var(--rose-light);box-shadow:0 0 0 2px var(--love)}' +

    /* === 仪表盘卡片动画 === */
    '@keyframes dashCardIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}' +
    '#todoListCard{animation:dashCardIn .45s cubic-bezier(.22,1,.36,1) both}' +

    /* === 空状态脉冲 === */
    '@keyframes emptyPulse{0%,100%{opacity:.65}50%{opacity:1}}' +
    '.chart-empty{animation:emptyPulse 2.8s ease-in-out infinite}' +

    /* === 日记面板隐藏重复元素 === */
    '#panel-diary .mt-10>.flex.gap-6.mt-8{display:none!important}' +

    /* === 日历格子 hover === */
    '.day{transition:transform .22s cubic-bezier(.22,1,.36,1),box-shadow .25s ease,border-color .22s ease,background .22s ease!important}' +
    '.day:hover:not(.other-month):not(.period-on):not(.ovulation):not(.fertile){transform:scale(1.1)!important;box-shadow:0 6px 20px rgba(196,90,107,.13)!important;border-color:rgba(196,90,107,.18)!important}' +

    /* === 日记模块：症状按钮隐藏 + 情书卡片 + 日期导航 === */
    'body:not(.is-barry) #tab-symptoms{display:none!important}' +
    '.diary-date-btn{transition:all .2s cubic-bezier(.22,1,.36,1)!important}' +
    '.diary-date-btn:hover{transform:translateY(-2px)!important;box-shadow:0 3px 10px rgba(196,90,107,.15)!important}' +
    '.diary-date-btn.current{box-shadow:0 2px 8px rgba(196,90,107,.2)!important}' +
    '.letter-paper-card{background:#fdf5e6!important;border:1px solid #e8d5b7!important;border-radius:12px!important;padding:18px 20px!important;box-shadow:0 2px 12px rgba(0,0,0,.06)!important;position:relative!important;margin-bottom:14px!important}' +
    '.letter-paper-card::before{content:"";position:absolute;inset:0;border-radius:12px;pointer-events:none;background:repeating-linear-gradient(0deg,transparent,transparent 27px,#e8d5b7 27px,#e8d5b7 28px)!important;opacity:.35!important}' +
    '[data-theme="dark"] .letter-paper-card{background:#2d2318!important;border-color:#4a3825!important}' +
    '[data-theme="dark"] .letter-paper-card::before{background:repeating-linear-gradient(0deg,transparent,transparent 27px,#4a3825 27px,#4a3825 28px)!important;opacity:.2!important}' +
    '.letter-paper-card .lpc-header{display:flex!important;justify-content:space-between!important;align-items:center!important;margin-bottom:10px!important;position:relative!important;z-index:1!important}' +
    '.letter-paper-card .lpc-date{font-size:.72rem!important;color:#8a7a6a!important;font-weight:600!important}' +
    '[data-theme="dark"] .letter-paper-card .lpc-date{color:#a09080!important}' +
    '.letter-paper-card .lpc-body{font-size:.85rem!important;line-height:28px!important;color:#3d3225!important;min-height:84px!important;white-space:pre-wrap!important;word-wrap:break-word!important;position:relative!important;z-index:1!important;padding:0 2px!important}' +
    '[data-theme="dark"] .letter-paper-card .lpc-body{color:#d0c0b0!important}' +
    '.letter-paper-card .lpc-footer{display:flex!important;justify-content:space-between!important;align-items:flex-end!important;margin-top:12px!important;padding-top:8px!important;border-top:1px dashed #d4bfa0!important;position:relative!important;z-index:1!important}' +
    '[data-theme="dark"] .letter-paper-card .lpc-footer{border-color:#4a3825!important}' +
    '.letter-paper-card .lpc-sig{font-size:.7rem!important;color:#8a7a6a!important;font-style:italic!important;text-align:right!important}' +
    '.lpc-textarea{width:100%!important;padding:12px!important;border:1px solid #d4bfa0!important;border-radius:10px!important;font-size:.82rem!important;font-family:var(--font)!important;background:#fff8f0!important;color:#3d3225!important;line-height:28px!important;resize:vertical!important;box-sizing:border-box!important;min-height:90px!important;position:relative!important;z-index:1!important}' +
    '[data-theme="dark"] .lpc-textarea{background:#1a1410!important;color:#d0c0b0!important;border-color:#4a3825!important}' +
    '@media(max-width:600px){.lpc-row{flex-direction:column!important}}' +
    '.lpc-row{display:flex!important;gap:14px!important;margin-bottom:14px!important}' +
    '.lpc-row>*{flex:1!important;min-width:0!important}' +

    /* === M3: 小屏日期导航水平滚动 === */
    '@media(max-width:420px){.diary-date-strip-wrap{overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:none!important}.diary-date-strip-wrap::-webkit-scrollbar{display:none!important}.diary-date-btn{flex:0 0 auto!important;min-width:38px!important}}' +

    /* === 打字机光标动画 === */
        // @keyframes diaryCursorBlink removed — caused whole-textarea flickering during typing
    '.diary-textarea:focus{caret-color:var(--love,#c45a6b)}' +

    /* === 信纸飞入动画 === */
    '@keyframes letterFlyIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}' +
    '.letter-card.fly-in .letter-content{animation:letterFlyIn .5s cubic-bezier(.22,1,.36,1) both}' +

    /* === 今天按钮高亮（金色边框+跳动心形） === */
    '.diary-date-btn.today{border-color:var(--gold,#b89147)!important;box-shadow:0 0 0 2px rgba(184,145,71,.25)!important}' +
    '.diary-date-btn.today::after{content:\"💖\";position:absolute;font-size:.45rem;top:-2px;right:-4px;animation:diaryHeartBeat 1.5s ease-in-out infinite}@keyframes diaryHeartBeat{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}' +
    '.diary-date-btn{position:relative!important}' +

    /* === 纪念日徽章 === */
    '.diary-date-btn .dab-badge{font-size:.4rem;position:absolute;top:-3px;left:-2px;line-height:1}';

  document.head.appendChild(_s);
})();

/* === dist/js/fix-diary.js === */
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
    translateBtn: '\u{1F310} \u{7FFB}\u{8BD1}',
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
    translateBtn: '\u{1F310} Prevedi',
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
    translateBtn: '\u{1F310} Translate',
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
  var _annMet = document.getElementById('annDateMet'); var annMet = _annMet ? _annMet.value : '';
  var _annLove = document.getElementById('annDateLove'); var annLove = _annLove ? _annLove.value : '';
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
      else { if(lockedEl)lockedEl.style.display='none'; if(contentEl){contentEl.style.display='';var _html='<div style="padding:12px;font-size:.85rem;line-height:1.8;white-space:pre-wrap">'+escHtml(partnerEntry.text)+'</div>';if(partnerEntry.mood)_html+='<div style="text-align:right;font-size:1.2rem;margin-top:8px">'+partnerEntry.mood+'</div>';var _sigData=localStorage.getItem(user+'-signature-'+(dateKey||''));if(!_sigData&&typeof _getLatestSignature==='function')_sigData=_getLatestSignature(user);if(_sigData)_html+='<div style="text-align:right;margin-top:12px"><img src="'+_sigData+'" style="max-height:50px;max-width:150px;opacity:.8;border-radius:4px" alt="signature"></div>';else _html+='<div style="text-align:right;margin-top:12px;font-family:cursive,serif;font-style:italic;font-size:1.05rem;color:var(--text-muted,#8a7a78)">—— '+(user==='barry'?'Barry':'Anđela')+' ✍️</div>';contentEl.innerHTML=_html;}if(transBtn){transBtn.style.display='';transBtn.style.marginTop='10px';if(transBtn.parentNode!==contentEl.parentNode){contentEl.parentNode.appendChild(transBtn);}}}
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
  console.log('[日记终极包] 写作锁+翻译+签名 已就绪');
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

/* === dist/js/fix-stats.js === */
"use strict";
(function () {
  console.log('[fix-stats] 已加载');

  // ── 数据初始化：默认经期记录 ──
  (function () {
    function _seed() {
      if (typeof window.state === 'undefined') { setTimeout(_seed, 200); return; }
      if (window.state.records && window.state.records.length >= 2) {
        console.log('[数据初始化] 已有' + window.state.records.length + '条记录，跳过注入');
        return;
      }
      var defaultRecords = [new Date(2026, 4, 28), new Date(2026, 5, 24)];
      var defaultPeriodEnds = {'2026-05-28': '2026-06-04', '2026-06-24': '2026-07-02'};
      if (!window.state.records) window.state.records = [];
      var seen = {};
      for (var i = 0; i < window.state.records.length; i++) {
        var k = typeof fmtDate === 'function' ? fmtDate(window.state.records[i]) : window.state.records[i].toISOString().slice(0, 10);
        seen[k] = true;
      }
      for (var j = 0; j < defaultRecords.length; j++) {
        var dk = typeof fmtDate === 'function' ? fmtDate(defaultRecords[j]) : defaultRecords[j].toISOString().slice(0, 10);
        if (!seen[dk]) {
          window.state.records.push(defaultRecords[j]);
        }
      }
      window.state.periodEnds = window.state.periodEnds || {};
      for (var pk in defaultPeriodEnds) {
        if (!window.state.periodEnds[pk]) window.state.periodEnds[pk] = defaultPeriodEnds[pk];
      }
      window.state.settings = window.state.settings || { cycleLength: 28, periodLength: 7 };
      if (typeof saveState === 'function') saveState();
      setTimeout(function() {
        if (typeof renderCalendar === 'function') renderCalendar();
      }, 300);
      console.log('[数据初始化] 已注入默认周期记录');
    }
    setTimeout(_seed, 200);
  })();

  // ── 进度条修复 ──
  (function(){
  window.animateProgressBar = function(el, pct) {
    if (!el) return;
    pct = Math.min(100, Math.max(0, pct));
    el.style.width = pct + '%';
    el.style.transition = 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
    if (pct > 0 && pct < 2) el.style.minWidth = '2px';
    else el.style.minWidth = '';
  };

  function _fixProgressBar() {
    var fillEl = document.getElementById('pg-fill');
    var numEl = document.getElementById('pg-num');
    var subEl = document.getElementById('pg-sub');
    var badgeEl = document.getElementById('pg-badge');
    if (!fillEl) return;
    if (typeof window.state === 'undefined' || typeof predict !== 'function') return;

    try {
      var pred = predict();
      var td = typeof today === 'function' ? today() : new Date();
      var hasRecords = window.state.records && window.state.records.length > 0;

      if (!hasRecords) {
        fillEl.style.width = '0%';
        fillEl.style.background = 'var(--border, #ddd)';
        if (numEl) numEl.textContent = '--';
        if (subEl) subEl.textContent = '';
        if (badgeEl) { badgeEl.textContent = ''; badgeEl.className = 'phase-badge'; }
        console.log('[进度条] 无数据，宽度=0%');
        return;
      }

      var phase = typeof getPhase === 'function' ? getPhase(td, pred) : null;
      var pct = 0, color = 'var(--border, #ddd)', label = '';

      if (phase === 'period-on' || phase === 'period-mid') {
        var cur = window.state.records.find(function(r) {
          var s = typeof d0 === 'function' ? d0(r) : r;
          var e = typeof getPeriodEndDate === 'function' ? (getPeriodEndDate(r) || typeof addDays === 'function' ? addDays(s, (pred.periodLen || 7) - 1) : new Date(s.getTime() + 6*86400000)) : new Date(s.getTime() + 6*86400000);
          return td >= s && td <= e;
        });
        if (cur) {
          var dayNum = typeof daysDiff === 'function' ? daysDiff(typeof d0 === 'function' ? d0(cur) : cur, td) + 1 : 1;
          var actualLen = pred.periodLen || 7;
          pct = (dayNum / actualLen) * 15;
          if (pct > 15) pct = 15;
          color = 'var(--love, #c45a6b)';
          label = typeof t === 'function' ? t('phaseBadges').period : '';
        }
      } else if (pred.isOverdue) {
        pct = 100;
        color = '#E65100';
        label = typeof t === 'function' ? t('phaseBadges').late : '';
      } else {
        var totalLen = pred.nextStart && pred.lastStart ? Math.round((pred.nextStart - pred.lastStart) / 86400000) : (pred.cycleLen || 28);
        var elapsed = pred.lastStart ? Math.round((td - pred.lastStart) / 86400000) : 0;
        pct = Math.min(100, Math.max(0, (elapsed / totalLen) * 100));
        if (phase === 'luteal' || phase === 'fertile') { color = 'var(--lavender, #b8a0c8)'; label = ''; }
        else if (phase === 'follicular') { color = 'var(--sage, #5e8b7a)'; label = ''; }
        else if (phase === 'ovulation') { color = 'var(--teal, #80a590)'; label = ''; }
        else { color = 'var(--love, #c45a6b)'; }
      }

      fillEl.style.width = pct + '%';
      fillEl.style.background = color;
      fillEl.style.transition = 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
      if (badgeEl) badgeEl.style.background = color;

      console.log('[进度条] 宽度=' + Math.round(pct) + '% 颜色=' + color + ' 阶段=' + (phase || 'none'));
    } catch(e) {
      console.warn('[进度条] 计算失败:', e.message);
    }
  }

  var _rc = window.renderCalendar;
  if (typeof _rc === 'function') {
    window.renderCalendar = function() {
      _rc.apply(this, arguments);
      setTimeout(_fixProgressBar, 200);
    };
  }
  var _aa = window.applyAllUI;
  if (typeof _aa === 'function') {
    window.applyAllUI = function(w) {
      _aa(w);
      setTimeout(_fixProgressBar, 200);
    };
  }
  var _tp = window.togglePeriodRecord;
  if (typeof _tp === 'function') {
    window.togglePeriodRecord = function(s, e) {
      _tp(s, e);
      setTimeout(_fixProgressBar, 300);
    };
  }
  setTimeout(_fixProgressBar, 500);
  setTimeout(_fixProgressBar, 1500);
  setTimeout(_fixProgressBar, 3000);
  console.log('[进度条] 修复已加载');
  })();

  // ── 统计面板：图表渲染修复 ──
  (function(){
  var _origRC = window._renderCharts;
  if (typeof _origRC === 'function') {
    window._renderCharts = function(pred, td, clen) {
      _origRC(pred, td, clen);
      try {
        var tc = document.getElementById('chartCycleTrend');
        var te = document.getElementById('chartCycleEmpty');
        if (!tc) return;
        var hasData = window.state && window.state.records && window.state.records.length >= 2;
        var chartHidden = te && te.style.display !== 'none';
        if (hasData && chartHidden && typeof ChartRenderer !== 'undefined') {
          var sorted = window.state.records.slice().sort(function(a,b){return new Date(a) - new Date(b);});
          var diffs = [];
          for (var i = 1; i < sorted.length; i++) {
            diffs.push(Math.round((new Date(sorted[i]) - new Date(sorted[i-1])) / 86400000));
          }
          if (diffs.length > 0) {
            var lbs = [];
            var L = window.lang || 'sr';
            for (var j = 0; j < diffs.length; j++) {
              lbs.push(L === 'zh-CN' ? '周期' + (j+1) : 'C' + (j+1));
            }
            var avg = diffs.length > 1 ? Math.round(diffs.reduce(function(s,v){return s+v;},0) / diffs.length) : diffs[0];
            if (te) { te.style.display = 'none'; }
            if (tc.parentElement) tc.parentElement.style.display = '';
            ChartRenderer.drawLineChart(tc, diffs, lbs, { width: 500, height: 200, avgLine: avg, avgLabel: L === 'zh-CN' ? '均值' : L === 'en' ? 'Avg' : 'Prosek', emptyText: '' });
            var note = document.getElementById('chartCycleNote');
            if (!note) {
              note = document.createElement('div');
              note.id = 'chartCycleNote';
              note.style.cssText = 'text-align:center;font-size:.7rem;color:var(--text-muted);margin-top:6px';
              tc.closest('.chart-card').appendChild(note);
            }
            if (diffs.length === 1) {
              note.textContent = L === 'zh-CN' ? '当前仅有 2 次记录，趋势将随更多记录逐渐清晰' : L === 'en' ? 'Only 2 records, trend will become clearer' : 'Samo 2 zapisa, trend će postati jasniji';
            } else { note.textContent = ''; }
          }
        }
      } catch(e) {}
    };
  } else {
    var _chartRetry = 0;
    var _chartTimer = setInterval(function() {
      _chartRetry++;
      if (typeof window._renderCharts === 'function') {
        clearInterval(_chartTimer);
        var _oc2 = window._renderCharts;
        window._renderCharts = function(pred, td, clen) {
          _oc2(pred, td, clen);
          try {
            var tc2 = document.getElementById('chartCycleTrend');
            var te2 = document.getElementById('chartCycleEmpty');
            if (!tc2) return;
            var hasData2 = window.state && window.state.records && window.state.records.length >= 2;
            var chartHidden2 = te2 && te2.style.display !== 'none';
            if (hasData2 && chartHidden2 && typeof ChartRenderer !== 'undefined') {
              var sorted2 = window.state.records.slice().sort(function(a,b){return new Date(a)-new Date(b);});
              var diffs2 = [];
              for (var i2 = 1; i2 < sorted2.length; i2++) {
                diffs2.push(Math.round((new Date(sorted2[i2])-new Date(sorted2[i2-1]))/86400000));
              }
              if (diffs2.length > 0) {
                var lbs2 = [], L2 = window.lang||'sr';
                for (var j2 = 0; j2 < diffs2.length; j2++) lbs2.push(L2==='zh-CN'?'周期'+(j2+1):'C'+(j2+1));
                var avg2 = diffs2.length>1 ? Math.round(diffs2.reduce(function(s,v){return s+v;},0)/diffs2.length) : diffs2[0];
                if (te2) te2.style.display = 'none';
                if (tc2.parentElement) tc2.parentElement.style.display = '';
                ChartRenderer.drawLineChart(tc2, diffs2, lbs2, {width:500,height:200,avgLine:avg2,avgLabel:L2==='zh-CN'?'均值':L2==='en'?'Avg':'Prosek',emptyText:''});
              }
            }
          } catch(e) {}
        };
      }
      if (_chartRetry > 100) clearInterval(_chartTimer);
    }, 100);
  }
  })();

  // ── 双人共享 Todo List ──
  (function () {
    var TODO_REPO = 'darkheaven1419-debug/cycle-tracker';
    var TODO_FILE = 'shared-todolist.json';

    // ── 初始化：确保 localStorage 中有空数组 ──
    function _initData() {
      var raw = localStorage.getItem('shared-todolist');
      if (raw === null || raw === undefined || raw === 'null' || raw === 'undefined') {
        localStorage.setItem('shared-todolist', '[]');
      }
      try {
        var parsed = JSON.parse(localStorage.getItem('shared-todolist') || '[]');
        if (!Array.isArray(parsed)) {
          localStorage.setItem('shared-todolist', '[]');
          parsed = [];
        }
        if (typeof window.state !== 'undefined') {
          window.state.todoList = parsed;
        }
      } catch (e) {
        localStorage.setItem('shared-todolist', '[]');
        if (typeof window.state !== 'undefined') {
          window.state.todoList = [];
        }
      }
    }
    _initData();

    function _tl(key) {
      var l = window.lang || 'sr';
      var m = {
        title:        {'zh-CN':'📋 我们的清单','en':'📋 Our Todo List','sr':'📋 Naša lista'},
        ph:           {'zh-CN':'想一起做什么？','en':'What do we want to do together?','sr':'Šta želimo da radimo zajedno?'},
        add:          {'zh-CN':'添加','en':'Add','sr':'Dodaj'},
        all:          {'zh-CN':'全部','en':'All','sr':'Sve'},
        active:       {'zh-CN':'⏳ 未完成','en':'⏳ Active','sr':'⏳ Aktivno'},
        done:         {'zh-CN':'✅ 已完成','en':'✅ Done','sr':'✅ Završeno'},
        empty:        {'zh-CN':'还没有事项 ✨','en':'No items yet ✨','sr':'Još nema stavki ✨'},
        noMatch:      {'zh-CN':'没有匹配的事项','en':'No matching items','sr':'Nema odgovarajućih'},
        doneBy:       {'zh-CN':'已完成','en':'Done by','sr':'Završio/la'},
      };
      return (m[key] && m[key][l]) || m[key]['zh-CN'] || '';
    }

    function _uid(u) { return u === 'barry' ? '👦 Barry' : '👧 Anđela'; }
    function _esc(s) { var d = document.createElement('div'); d.appendChild(document.createTextNode(s||'')); return d.innerHTML; }
    function _gid() { return Date.now().toString(36) + Math.random().toString(36).substr(2,4); }
    function _td(d) { if (!d) d = new Date(); return typeof d==='string' ? d.slice(0,10) : d.getFullYear()+'-'+(d.getMonth()+1).toString().padStart(2,'0')+'-'+d.getDate().toString().padStart(2,'0'); }

    function _save() {
      if (typeof window.state === 'undefined') return;
      localStorage.setItem('shared-todolist', JSON.stringify(window.state.todoList||[]));
      if (typeof saveState === 'function') saveState();
    }

    function _addTodo(text) {
      if (!text||!text.trim()) return;
      if (typeof window.state === 'undefined') return;
      if (!window.state.todoList) window.state.todoList=[];
      window.state.todoList.push({ id:_gid(), text:text.trim(), author:(typeof activeProfile!=='undefined'?activeProfile:'andjela'), createdAt:_td(new Date()), completed:false, completedBy:null, completedAt:null });
      _save(); _render(); _pushTodo();
    }

    function _toggleTodo(id) {
      if (typeof window.state === 'undefined') return;
      for (var i=0;i<window.state.todoList.length;i++) {
        if (window.state.todoList[i].id===id) {
          var t=window.state.todoList[i];
          if (t.completed) { t.completed=false; t.completedBy=null; t.completedAt=null; }
          else { t.completed=true; t.completedBy=(typeof activeProfile!=='undefined'?activeProfile:'andjela'); t.completedAt=_td(new Date()); }
          _save(); _render(); _pushTodo();
          return;
        }
      }
    }

    function _deleteTodo(id) { if (typeof window.state === 'undefined') return; window.state.todoList=(window.state.todoList||[]).filter(function(t){return t.id!==id;}); _save(); _render(); _pushTodo(); }

    function _pushTodo() {
      if (typeof window.state === 'undefined') return;
      var token = typeof getGitHubToken === 'function' ? getGitHubToken() : '';
      if (!token) return;
      var content = btoa(unescape(encodeURIComponent(JSON.stringify(window.state.todoList||[],null,2))));
      fetch('https://api.github.com/repos/'+TODO_REPO+'/contents/'+TODO_FILE, { headers:{'Authorization':'token '+token} })
        .then(function(r){return r.ok?r.json():{sha:null};})
        .then(function(d){return fetch('https://api.github.com/repos/'+TODO_REPO+'/contents/'+TODO_FILE,{method:'PUT',headers:{'Authorization':'token '+token,'Content-Type':'application/json'},body:JSON.stringify({message:'🔄 Sync todo list',content:content,sha:d.sha||null})});})
        .catch(function(){});
    }

    function _pullTodo() {
      var token = typeof getGitHubToken === 'function' ? getGitHubToken() : '';
      if (!token) return;
      fetch('https://api.github.com/repos/'+TODO_REPO+'/contents/'+TODO_FILE, { headers:{'Authorization':'token '+token} })
        .then(function(r){return r.ok?r.json():null;})
        .then(function(d){
          if (!d) return;
          if (typeof window.state === 'undefined') return;
          var content = JSON.parse(decodeURIComponent(escape(atob(d.content))));
          if (!Array.isArray(content)) return;
          var idMap={}; (window.state.todoList||[]).forEach(function(t){idMap[t.id]=t;});
          content.forEach(function(t){
            if(!idMap[t.id]){ idMap[t.id]=t; return; }
            // 同 id：同步完成状态（远程完成能同步到本地），文本保留本地避免覆盖正在编辑的内容
            var l=idMap[t.id];
            if(t.completed && !l.completed){ l.completed=true; l.completedBy=t.completedBy||l.completedBy; l.completedAt=t.completedAt||Date.now(); }
            else if(t.completed && l.completed && (t.completedAt||0)>(l.completedAt||0)){ l.completedBy=t.completedBy||l.completedBy; l.completedAt=t.completedAt; }
          });
          window.state.todoList=Object.keys(idMap).map(function(k){return idMap[k];});
          localStorage.setItem('shared-todolist',JSON.stringify(window.state.todoList));
          _render();
        })
        .catch(function(){});
    }

    window._todoFilter = window._todoFilter || 'active';

    function _render() {
      var container = document.getElementById('todoListContainer');
      if (!container) return;

      // 确保数据初始化
      _initData();

      var list = [];
      try { list = JSON.parse(localStorage.getItem('shared-todolist') || '[]'); if (!Array.isArray(list)) list = []; } catch(e) { list = []; }
      var filter = window._todoFilter || 'active';
      var items = list;
      var sorted = items.slice().sort(function(a,b){return (b.createdAt||'').localeCompare(a.createdAt||'');});
      var filtered = sorted;
      if (filter==='active') filtered=sorted.filter(function(t){return !t.completed;});
      else if (filter==='done') filtered=sorted.filter(function(t){return t.completed;});

      if (!filtered.length) {
        container.innerHTML = '<div style="text-align:center;padding:16px;font-size:.72rem;color:var(--text-muted);animation:emptyPulse 2.8s ease-in-out infinite">'+(items.length?_tl('noMatch'):_tl('empty'))+'</div>';
        return;
      }

      var html = '';
      for (var i=0;i<filtered.length;i++) {
        var t=filtered[i];
        var _delay=i*0.05;
        html += '<div class="todo-item" style="display:flex;align-items:flex-start;gap:6px;padding:8px 4px;border-bottom:1px solid var(--border);animation-delay:'+_delay+'s">';
        html += '<span style="cursor:pointer;font-size:1rem;flex-shrink:0;margin-top:2px;width:22px;text-align:center" class="todo-check" onclick="window._toggleTodo(\''+t.id+'\')">'+(t.completed?'✅':'☐')+'</span>';
        html += '<div style="flex:1;min-width:0">';
        html += '<div class="todo-text" style="font-size:.78rem;line-height:1.3;'+(t.completed?'text-decoration:line-through;color:var(--text-muted)':'color:var(--text)')+'">'+_esc(t.text)+'</div>';
        html += '<div style="font-size:.48rem;color:var(--text-muted);margin-top:2px;display:flex;gap:4px;flex-wrap:wrap;align-items:center">';
        html += '<span>'+_uid(t.author)+'</span><span>·</span><span>'+(t.createdAt||'')+'</span>';
        if (t.completed&&t.completedBy) html += '<span>·</span><span style="color:var(--sage)">'+_tl('doneBy')+' '+_uid(t.completedBy)+' '+(t.completedAt||'')+'</span>';
        html += '</div></div>';
        html += '<span style="cursor:pointer;font-size:.65rem;opacity:.35;flex-shrink:0;padding:2px 4px" class="todo-del" onclick="window._deleteTodo(\''+t.id+'\')">✕</span>';
        html += '</div>';
      }
      container.innerHTML = html;
    }

    function _setFilter(f) {
      window._todoFilter=f;
      var btns=document.querySelectorAll('#todoFilterBar button');
      for (var i=0;i<btns.length;i++){btns[i].style.background=btns[i].dataset.filter===f?'var(--love)':'var(--card)';btns[i].style.fontWeight=btns[i].dataset.filter===f?'700':'400';}
      _render();
    }

    function _createCard() {
      if (document.getElementById('todoListCard')) return;
      var dash=document.getElementById('panel-dashboard');
      if (!dash) return;
      _initData();
      var f=window._todoFilter||'active';
      var card=document.createElement('div'); card.id='todoListCard'; card.className='card'; card.style.marginTop='10px';
      card.innerHTML = '<h3>'+_tl('title')+'</h3>'
        +'<div style="display:flex;gap:6px;margin-bottom:10px">'
        +'<input id="todoInput" type="text" placeholder="'+_tl('ph')+'" style="flex:1;padding:8px 10px;border-radius:10px;border:1px solid var(--border);font-size:.78rem;font-family:var(--font);background:var(--card);color:var(--text)">'
        +'<button onclick="window._addTodo()" style="padding:8px 14px;border-radius:10px;border:none;background:var(--love);color:#fff;font-size:.72rem;font-weight:600;cursor:pointer;white-space:nowrap">'+_tl('add')+'</button></div>'
        +'<div id="todoFilterBar" style="display:flex;gap:6px;margin-bottom:8px">'
        +'<button data-filter="all" onclick="window._setTodoFilter(\'all\')" style="padding:3px 10px;border-radius:12px;border:1px solid var(--border);background:'+(f==='all'?'var(--love)':'var(--card)')+';color:var(--text);font-size:.6rem;cursor:pointer;font-weight:'+(f==='all'?'700':'400')+'">'+_tl('all')+'</button>'
        +'<button data-filter="active" onclick="window._setTodoFilter(\'active\')" style="padding:3px 10px;border-radius:12px;border:1px solid var(--border);background:'+(f==='active'?'var(--love)':'var(--card)')+';color:var(--text);font-size:.6rem;cursor:pointer;font-weight:'+(f==='active'?'700':'400')+'">'+_tl('active')+'</button>'
        +'<button data-filter="done" onclick="window._setTodoFilter(\'done\')" style="padding:3px 10px;border-radius:12px;border:1px solid var(--border);background:'+(f==='done'?'var(--love)':'var(--card)')+';color:var(--text);font-size:.6rem;cursor:pointer;font-weight:'+(f==='done'?'700':'400')+'">'+_tl('done')+'</button></div>'
        +'<div id="todoListContainer"></div>';
      var qc=dash.querySelector('.dash-card.dash-quote');
      if (qc&&qc.parentNode) qc.parentNode.insertBefore(card,qc.nextSibling); else dash.appendChild(card);
      var inp=document.getElementById('todoInput');
      if (inp) inp.addEventListener('keydown',function(e){if(e.key==='Enter'&&typeof window._addTodo==='function')window._addTodo();});
      _render();
    }

    // ── 全部挂载到 window ──
    window._renderTodo = _render;
    window._createTodoCard = _createCard;
    window._pushTodo = _pushTodo;
    window._pullTodo = _pullTodo;
    window._addTodo = function(){var inp=document.getElementById('todoInput');_addTodo(inp?inp.value:'');};
    window._toggleTodo = _toggleTodo;
    window._deleteTodo = _deleteTodo;
    window._setTodoFilter = _setFilter;

    // ── 自动初始化 ──
    function _tryCreateCard() {
      if (!document.getElementById('todoListCard')) {
        _createCard();
      }
    }

    if (typeof renderDashboard==='function') {
      var _origTd=renderDashboard;
      window.renderDashboard=function(){_origTd.apply(this,arguments);setTimeout(_tryCreateCard,200);};
    }

    // ── 持久轮询：首次加载 + 仪表盘重建后恢复 ──
    // 每 500ms 检查一次（前 30 秒密集检查），之后每 3 秒检查一次
    var _todoCheckCount = 0;
    var _todoCheckTimer = setInterval(function() {
      _todoCheckCount++;
      if (!document.getElementById('todoListCard') && document.getElementById('panel-dashboard')) {
        _tryCreateCard();
      }
      if (_todoCheckCount > 60) clearInterval(_todoCheckTimer); // 30秒密集检查结束
    }, 500);
    // 持久慢速检查（永不停止）
    setInterval(function() {
      if (!document.getElementById('todoListCard') && document.getElementById('panel-dashboard')) {
        _tryCreateCard();
      }
    }, 3000);

    if (typeof getGitHubToken==='function') {
      _pullTodo();
      setInterval(function(){if(getGitHubToken())_pullTodo();},120000);
    }
  })();
})();

/* === dist/js/fix-all.js === */
"use strict";

// === 魔法数字常量 ===
var TAP_DELAY_MS = 280;
var TOUCH_TIMEOUT_MS = 350;
var SAVE_DEBOUNCE_MS = 200;
var SYNC_DEBOUNCE_MS = 1500;
var SYNC_INTERVAL_MS = 120000;

window.CalState={year:2026,month:6,view:"month",weekOffset:0};
var APP_VERSION = (function () {
  var meta = document.querySelector('meta[name="version"]');
  return meta ? meta.content : '7.2.0';
})();

(function () {
  function _fmtDate(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }
  function _sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }
  function _addDays(date, n) {
    var r = new Date(date);
    r.setDate(r.getDate() + n);
    return r;
  }
  function _daysDiff(a, b) {
    return Math.round((b.getTime() - a.getTime()) / 86400000);
  }
  function _d0(date) {
    var r = new Date(date);
    r.setHours(0, 0, 0, 0);
    return r;
  }

  if (typeof togglePeriodRecord === 'function') {
    var _origToggle = togglePeriodRecord;
    window.togglePeriodRecord = function (startDate, endDate) {
      _origToggle(startDate, endDate);
    };
  }

  function _computeCyclePhase(date, periodEnd, nextPeriodStart) {
    var d = _d0(date);
    var pe = _d0(periodEnd);
    var ns = _d0(nextPeriodStart);
    var ovulation = _addDays(ns, -14);
    var fertileStart = _addDays(ovulation, -3);
    var fertileEnd = _addDays(ovulation, 2);
    if (d >= pe && d < fertileStart) return 'follicular';
    if (d >= fertileStart && d <= fertileEnd) {
      if (_sameDay(d, ovulation)) return 'ovulation';
      return 'fertile';
    }
    if (d > fertileEnd && d < ns) return 'luteal';
    return null;
  }

  function _fixedGetPhase(date, records, periodEnds, settings) {
    var d = _d0(date);
    var periodLen = (settings && settings.periodLength) || 7;
    var sorted = [];
    for (var si = 0; si < records.length; si++) {
      sorted.push(_d0(records[si]));
    }
    sorted.sort(function (a, b) { return a - b; });
    for (var i = 0; i < sorted.length; i++) {
      var start = _d0(sorted[i]);
      var endKey = _fmtDate(sorted[i]);
      var end;
      if (periodEnds && periodEnds[endKey]) {
        end = _d0(new Date(periodEnds[endKey] + 'T00:00:00'));
      } else {
        end = _addDays(start, periodLen - 1);
      }
      if (d >= start && d <= end) {
        return _sameDay(d, start) ? 'period-on' : 'period-mid';
      }
    }
    if (sorted.length === 0) return null;
    var cycles = [];
    for (var ci = 1; ci < sorted.length; ci++) {
      cycles.push(_daysDiff(sorted[ci - 1], sorted[ci]));
    }
    var recentCycles = cycles.slice(-3);
    var avgCycle = recentCycles.length > 0
      ? Math.round(recentCycles.reduce(function (a, b) { return a + b; }, 0) / recentCycles.length)
      : (settings && settings.cycleLength) || 28;
    var lastStart = sorted[sorted.length - 1];
    var lastEndKey = _fmtDate(lastStart);
    var lastEnd;
    if (periodEnds && periodEnds[lastEndKey]) {
      lastEnd = _d0(new Date(periodEnds[lastEndKey] + 'T00:00:00'));
    } else {
      lastEnd = _addDays(lastStart, periodLen - 1);
    }
    for (var j = 0; j < sorted.length - 1; j++) {
      var thisStart = sorted[j];
      var thisEndKey = _fmtDate(thisStart);
      var thisEnd;
      if (periodEnds && periodEnds[thisEndKey]) {
        thisEnd = _d0(new Date(periodEnds[thisEndKey] + 'T00:00:00'));
      } else {
        thisEnd = _addDays(thisStart, periodLen - 1);
      }
      var nextStart = sorted[j + 1];
      if (d > thisEnd && d < nextStart) {
        return _computeCyclePhase(d, thisEnd, nextStart);
      }
    }
    var predictedNextStart = _addDays(lastStart, avgCycle);
    var predictedNextEnd = _addDays(predictedNextStart, periodLen - 1);
    if (d >= predictedNextStart && d <= predictedNextEnd) {
      return _sameDay(d, predictedNextStart) ? 'period-pred-first' : 'period-pred';
    }
    if (d > lastEnd && d < predictedNextStart) {
      return _computeCyclePhase(d, lastEnd, predictedNextStart);
    }
    if (d > predictedNextEnd) {
      var next2Start = _addDays(predictedNextStart, avgCycle);
      var next2End = _addDays(next2Start, periodLen - 1);
      if (d >= next2Start && d <= next2End) {
        return _sameDay(d, next2Start) ? 'period-future-first' : 'period-future';
      }
      if (d < next2Start) {
        return _computeCyclePhase(d, predictedNextEnd, next2Start);
      }
      var next3Start = _addDays(next2Start, avgCycle);
      if (d < next3Start) {
        return _computeCyclePhase(d, next2End, next3Start);
      }
      return null;
    }
    return null;
  }

  var _origGetPhase = (typeof getPhase === 'function') ? getPhase : null;
  window.getPhase = function (date, pred) {
    try {
      var st = (typeof state !== 'undefined') ? state : null;
      if (st && st.records) {
        var result = _fixedGetPhase(date, st.records, st.periodEnds || {}, st.settings || {});
        if (result !== null) return result;
      }
    } catch (e) {}
    if (_origGetPhase) return _origGetPhase(date, pred);
    return null;
  };

  window.animateModalOut = null;

  // === 导航栏滑动指示器 ===
  (function () {
    var _tabs = document.querySelector('.tabs');
    var _indicator = document.getElementById('tabSlideIndicator');
    if (_tabs && !_indicator) {
      _indicator = document.createElement('div');
      _indicator.id = 'tabSlideIndicator';
      _indicator.style.cssText = 'position:absolute;bottom:0;left:0;height:3px;background:var(--love);border-radius:3px 3px 0 0;transition:transform .3s cubic-bezier(.22,1,.36,1),width .3s cubic-bezier(.22,1,.36,1);pointer-events:none;z-index:2';
      _tabs.style.position = 'relative';
      _tabs.appendChild(_indicator);
    }
    function _updateTabIndicator() {
      var _a = document.querySelector('.tab.active');
      var _t = document.querySelector('.tabs');
      var _i = document.getElementById('tabSlideIndicator');
      if (!_a || !_t || !_i) return;
      var _tr = _t.getBoundingClientRect();
      var _ar = _a.getBoundingClientRect();
      _i.style.transform = 'translateX(' + (_ar.left - _tr.left) + 'px)';
      _i.style.width = _ar.width + 'px';
    }
    _updateTabIndicator();
    var _tabMo = new MutationObserver(function () { _updateTabIndicator(); });
    document.querySelectorAll('.tab').forEach(function (t) { _tabMo.observe(t, { attributes: true, attributeFilter: ['class'] }); });
    var _tmRetry = 0;
    var _tmTimer = setInterval(function () {
      _tmRetry++;
      var _newTabs = document.querySelectorAll('.tab');
      if (_newTabs.length === 0) { clearInterval(_tmTimer); return; }
      _newTabs.forEach(function (t) { _tabMo.observe(t, { attributes: true, attributeFilter: ['class'] }); });
      if (_tmRetry > 30) clearInterval(_tmTimer);
    }, 200);
  })();

  // === 弹窗加速：防重入 + 先显示后填充 ===
  (function () {
    // 守卫 animateModalIn 防止重复播放
    window._amiBusy = false;
    var _origAMI = typeof animateModalIn === 'function' ? animateModalIn : null;
    if (_origAMI) {
      window.animateModalIn = function (el) {
        if (window._amiBusy) return;
        window._amiBusy = true;
        if (typeof HAS_GSAP !== 'undefined' && HAS_GSAP && typeof gsap !== 'undefined') {
          var m = el || document.getElementById('modal');
          if (m) {
            var c = m.querySelector('.modal');
            if (c) {
              try {
                gsap.killTweensOf(c);
                gsap.fromTo(c, { scale: .88, autoAlpha: 0, y: 15 }, { scale: 1, autoAlpha: 1, y: 0, duration: .2, ease: 'back.out(1.3)', clearProps: 'all' });
              } catch (e) {}
            }
          }
        }
        setTimeout(function () { window._amiBusy = false; }, 350);
      };
    }

    // openModal 优化统一合并至下方单一包裹
  })();

  (function () {
    var _all = document.querySelectorAll('nav.tabs-nav');
    if (_all.length > 1) {
      for (var _ni = 1; _ni < _all.length; _ni++) _all[_ni].parentNode.removeChild(_all[_ni]);
    }
  })();

  function _fixNavigation() {
    var _cal = document.querySelector('.calendar') || document.querySelector('.days');
    var _nav = document.querySelector('nav.tabs-nav');
    if (!_cal || !_nav) return;
    var _all2 = document.querySelectorAll('nav.tabs-nav');
    if (_all2.length > 1) {
      for (var _ni2 = 1; _ni2 < _all2.length; _ni2++) _all2[_ni2].parentNode.removeChild(_all2[_ni2]);
    }
    var _rect = _cal.getBoundingClientRect();
    _nav.style.position = 'fixed';
    _nav.style.bottom = '0';
    _nav.style.left = _rect.left + 'px';
    _nav.style.width = _rect.width + 'px';
    _nav.style.maxWidth = 'none';
    _nav.style.margin = '0';
    _nav.style.transform = 'none';
  }
  _fixNavigation();

  var _diaryCache = null;
  var _diaryCacheTime = 0;

  function _patchRenderCalendar() {
    if (typeof renderCalendar !== 'function') return false;
    var _origRC = renderCalendar;
    window.renderCalendar = function () {
      var now = Date.now();
      if (!_diaryCache || (now - _diaryCacheTime) > 30000) {
        try {
          _diaryCache = JSON.parse(localStorage.getItem('shared-diary') || '{}');
          _diaryCacheTime = now;
        } catch (e) { _diaryCache = {}; }
      }
      if (!window.HOLIDAYS || !window.HOLIDAYS.length) {
        if (typeof loadHolidays === 'function') {
          var _args = arguments;
          var _self = this;
          loadHolidays().then(function () {
            _origRC.apply(_self, _args);
          }).catch(function () {
            window.HOLIDAYS = [];
            _origRC.apply(_self, _args);
          });
          return;
        }
      }
      _origRC.apply(this, arguments);
      var _cells = document.querySelectorAll('.day[aria-label]');
      _cells.forEach(function (c) {
        var _l = c.getAttribute('aria-label');
        if (!_l) return;
        c.classList.add('in-month');
      });
    };
    return true;
  }
  if (!_patchRenderCalendar()) {
    var _rcRetry = 0;
    var _rcTimer = setInterval(function () {
      _rcRetry++;
      if (_patchRenderCalendar() || _rcRetry > 50) clearInterval(_rcTimer);
    }, 100);
  }

  (function () {
    var _origPull = (typeof pullAllSharedData === 'function') ? pullAllSharedData : null;
    if (!_origPull) return;
    window.pullAllSharedData = function () {
      var p = _origPull.apply(this, arguments);
      if (p && typeof p.then === 'function') {
        return p.then(function (r) { _diaryCache = null; return r; });
      }
      _diaryCache = null;
      return p;
    };
  })();

  var _modal = document.getElementById('modal');
  if (_modal) {
    _modal.removeAttribute('onclick');
  }

  (function () {
    var EXT_KEYS = {
      sr: { modalMarkersTitle: '\u{1F4CC} Oznake', modalAddMarker: 'Dodaj oznaku', modalEndPeriod: 'Ozna\u{017E}i kraj ciklusa', modalPeriodOngoing: 'Ciklus u toku', modalEndNow: 'Zavr\u{0161}i ciklus' },
      'zh-CN': { modalMarkersTitle: '\u{1F4CC} \u{65E5}\u{5386}\u{6807}\u{8BB0}', modalAddMarker: '\u{6DFB}\u{52A0}\u{6807}\u{8BB0}', modalEndPeriod: '\u{6807}\u{8BB0}\u{7ECF}\u{671F}\u{7ED3}\u{675F}', modalPeriodOngoing: '\u{7ECF}\u{671F}\u{8FDB}\u{884C}\u{4E2D}', modalEndNow: '\u{7ED3}\u{675F}\u{5F53}\u{524D}\u{7ECF}\u{671F}' },
      en: { modalMarkersTitle: '\u{1F4CC} Markers', modalAddMarker: 'Add Marker', modalEndPeriod: 'Mark Period End', modalPeriodOngoing: 'Period Ongoing', modalEndNow: 'End Current Period' },
    };
    if (typeof I18N_EXT !== 'undefined') {
      for (var _lang in EXT_KEYS) {
        if (!I18N_EXT[_lang]) I18N_EXT[_lang] = {};
        for (var _key in EXT_KEYS[_lang]) {
          I18N_EXT[_lang][_key] = EXT_KEYS[_lang][_key];
        }
      }
    }
  })();

  (function () {
    var _methods = ['push', 'pop', 'splice', 'sort', 'shift', 'unshift'];
    function _patchRecordsArray() {
      if (typeof state === 'undefined' || !state.records) return;
      if (state.records._h2Patched) return;
      for (var _mi = 0; _mi < _methods.length; _mi++) {
        (function (methodName) {
          var orig = state.records[methodName];
          state.records[methodName] = function () {
            var result = orig.apply(this, arguments);
            setTimeout(function () {}, 0);
            return result;
          };
        })(_methods[_mi]);
      }
      state.records._h2Patched = true;
    }
    _patchRecordsArray();
    var _origSaveState = typeof saveState === 'function' ? saveState : null;
    if (_origSaveState) {
      window.saveState = function () {
        _origSaveState();
        if (!state.records || !state.records._h2Patched) {
          _patchRecordsArray();
        }
      };
    }
  })();

  // === 统一 openModal 包裹 ===
  // 合并了：弹窗前置显示、日记按钮、节日行交互（原 4 处独立包裹）
  var _omOrig = (typeof openModal === 'function') ? openModal : null;
  if (!_omOrig) {
    var _omRetry = setInterval(function () {
      if (typeof openModal === 'function') {
        _omOrig = openModal;
        clearInterval(_omRetry);
      }
    }, 100);
    setTimeout(function () { clearInterval(_omRetry); }, 5000);
  }
  window.openModal = function (d, p) {
    try {
      // 1) 弹窗前置显示优化
      if (_omOrig) {
        var _mEl = document.getElementById('modal');
        if (_mEl && _mEl.classList.contains('hidden')) {
          _mEl.classList.remove('hidden');
          if (typeof animateModalIn === 'function') animateModalIn();
        }
        // 2) 调用原始 openModal
        _omOrig(d, p);
      } else if (typeof openModal === 'function') {
        openModal(d, p);
        _omOrig = openModal;
      }
    } catch (e) {}
    // 3) 后处理（DOM 操作延迟执行）
    setTimeout(function () {
      // 日记按钮
      if (!document.getElementById('fix-modal-diary-btn')) {
        var _cb = document.getElementById('modal-close-btn');
        if (_cb && _cb.parentNode) {
          var _btn = document.createElement('button');
          _btn.id = 'fix-modal-diary-btn';
          _btn.className = 'btn btn-ghost mt-6';
          _btn.style.cssText = 'margin-bottom:0;margin-top:6px;width:100%';
          var _dl = (typeof window.lang !== 'undefined') ? window.lang : 'sr';
          _btn.textContent = _dl === 'zh-CN' ? '\u{1F4DD} \u{67E5}\u{770B}\u{5F53}\u{6708}\u{65E5}\u{8BB0}' : _dl === 'en' ? '\u{1F4DD} View This Month\u{2019}s Diary' : '\u{1F4DD} Pregled dnevnika za ovaj mesec';
          _btn.onclick = function () {
            if (typeof closeModal === 'function') closeModal();
            if (typeof switchToTab === 'function') switchToTab('diary');
          };
          _cb.parentNode.insertBefore(_btn, _cb);
        }
      }
      // 节日/节气行点击
      ['holiday-row', 'solar-row'].forEach(function (id) {
        var _row = document.getElementById('modal-' + id);
        if (!_row || _row._fixPatched) return;
        _row._fixPatched = true;
        _row.style.cursor = 'pointer';
        _row.onclick = function (e) {
          if (e.target.tagName === 'SPAN' || e.target.tagName === 'A') return;
          var _toggle = _row.querySelector('.knowledge-toggle, .holiday-name, [onclick*="toggle"]');
          if (_toggle && _toggle.onclick) _toggle.onclick();
        };
      });
    }, 100);
  };

  (function () {
    var _origPickerOpen = window.openEmojiPickerForModal;
    window.openEmojiPickerForModal = function () {
      if (typeof _origPickerOpen === 'function') _origPickerOpen();
      setTimeout(function () {
        var _epTitle = document.getElementById('ep-title');
        if (!_epTitle) return;
        var _l = (typeof window.lang !== 'undefined') ? window.lang : 'sr';
        var _txt = _l === 'zh-CN' ? '\u{6DFB}\u{52A0}\u{6807}\u{8BB0}' : _l === 'en' ? 'Add Marker' : 'Dodaj oznaku';
        var _newTitle = '\u{1F4CC} ' + _txt;
        if (_epTitle.textContent !== _newTitle) { _epTitle.textContent = _newTitle; }
      }, 50);
    };
  })();

  (function () {
    var fixRunOnce = false;
    var _mo = new MutationObserver(function () {
      var _modalEl = document.getElementById('modal');
      var _pickerEl = document.getElementById('emojiPickerOverlay');
      if (_modalEl && _modalEl.classList.contains('hidden') && _pickerEl && !_pickerEl.classList.contains('hidden')) {
        _pickerEl.classList.add('hidden');
      }
      _fixNavigation();
      if (!_modalEl || _modalEl.classList.contains('hidden')) {
        fixRunOnce = false;
        return;
      }
      if (fixRunOnce) return;
      fixRunOnce = true;

      var _markersTitle = document.getElementById('modalMarkersTitle');
      var _addBtn = document.getElementById('modalAddMarkerBtn');
      if (_markersTitle) _markersTitle.style.display = 'none';
      if (_addBtn) {
        _addBtn.style.display = 'inline-flex';
        _addBtn.style.alignItems = 'center';
        _addBtn.style.gap = '4px';
        _addBtn.style.padding = '4px 10px';
        _addBtn.style.margin = '6px 0 0';
        _addBtn.style.fontSize = '.65rem';
        _addBtn.style.border = 'none';
        _addBtn.style.background = 'var(--rose-light)';
        _addBtn.style.color = 'var(--rose-dark)';
        _addBtn.style.borderRadius = '20px';
        _addBtn.style.cursor = 'pointer';
        var _mk = (typeof t === 'function') ? t('modalAddMarker') : '';
        if (_mk === 'modalAddMarker' || !_mk) {
          var _ml = (typeof window.lang !== 'undefined') ? window.lang : 'sr';
          _mk = _ml === 'zh-CN' ? '\u{6DFB}\u{52A0}\u{6807}\u{8BB0}' : _ml === 'en' ? 'Add Marker' : 'Dodaj oznaku';
        }
        _addBtn.innerHTML = '\u{2795} ' + _mk;
        _addBtn.removeAttribute('onclick');
        _addBtn.addEventListener('click', function () { if (typeof openEmojiPickerForModal === 'function') openEmojiPickerForModal(); });
      }
      var _oldMarkBtn = document.getElementById('modal-mark-btn');
      var _oldUnmarkBtn = document.getElementById('modal-unmark-btn');
      if (_oldMarkBtn) _oldMarkBtn.style.display = 'none';
      if (_oldUnmarkBtn) _oldUnmarkBtn.style.display = 'none';

      var _selDate = (typeof selectedDate !== 'undefined') ? selectedDate : null;
      function _isInClosedPeriod(d) {
        if (typeof window.state === 'undefined' || !window.state.records || !window.state.periodEnds) return false;
        for (var _ri = 0; _ri < window.state.records.length; _ri++) {
          var _s = _d0(window.state.records[_ri]);
          var _ek = _fmtDate(window.state.records[_ri]);
          var _e = window.state.periodEnds[_ek] ? _d0(new Date(window.state.periodEnds[_ek] + 'T00:00:00')) : null;
          if (_e && d >= _s && d <= _e) return true;
        }
        return false;
      }
      function _getPeriodBtnText() {
        if (!_selDate) return null;
        var _d = _d0(_selDate);
        var _today = _d0(new Date());
        // Defense: 不允许标记在未来日期的经期
        if (_d > _today) return null;
        if (typeof window.state !== 'undefined' && window.state.records) {
          for (var _ri2 = 0; _ri2 < window.state.records.length; _ri2++) {
            if (_sameDay(window.state.records[_ri2], _d)) return t('modalFixRemove');
          }
        }
        var _os = (typeof getOpenPeriodStart === 'function') ? getOpenPeriodStart() : null;
        // Defense: "结束经期" 仅在选中日 >= 开始日 且 <= 今天时显示
        if (_os && _d0(_os) <= _d && _d <= _today) return t('modalFixEnd');
        if (_isInClosedPeriod(_d)) return null;
        return t('modalFixMark');
      }
      var _phaseRow = document.querySelector('.modal .info-row');
      var _newBtn = document.getElementById('fix-period-btn');
      var _btnText = _getPeriodBtnText();
      if (_btnText === null && _newBtn) { _newBtn.style.display = 'none'; }
      else if (_btnText !== null) {
        if (!_newBtn) {
          _newBtn = document.createElement('button');
          _newBtn.id = 'fix-period-btn';
          _newBtn.style.display = 'block';
          _newBtn.style.width = '100%';
          _newBtn.style.padding = '12px 16px';
          _newBtn.style.margin = '10px 0 6px';
          _newBtn.style.border = 'none';
          _newBtn.style.borderRadius = '12px';
          _newBtn.style.fontSize = '.88rem';
          _newBtn.style.fontWeight = '700';
          _newBtn.style.cursor = 'pointer';
          _newBtn.style.color = '#fff';
          _newBtn.style.transition = 'opacity .2s';
          _newBtn.onmouseover = function () { this.style.opacity = '0.85'; };
          _newBtn.onmouseout = function () { this.style.opacity = '1'; };
          _newBtn.onclick = function () {
            fixRunOnce = false;
            if (typeof togglePeriodRecord === 'function') togglePeriodRecord();
          };
          if (_phaseRow && _phaseRow.parentNode) {
            _phaseRow.parentNode.insertBefore(_newBtn, _phaseRow.nextSibling);
          } else {
            var _closeBtn = document.getElementById('modal-close-btn');
            if (_closeBtn && _closeBtn.parentNode) {
              _closeBtn.parentNode.insertBefore(_newBtn, _closeBtn);
            }
          }
        } else { _newBtn.style.display = 'block'; }
        _newBtn.textContent = _btnText;
        if (_btnText.indexOf('\u{23F9}') >= 0) { _newBtn.style.background = '#E65100'; }
        else if (_btnText.indexOf('\u{274C}') >= 0) { _newBtn.style.background = 'var(--rose)'; }
        else { _newBtn.style.background = 'var(--love)'; }
      }
    });
    _mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
  })();

  // animateStatsPanel / animateDashboardCards 由 gsap-animations.js 定义，勿置空（否则 app.js updateStats 调用崩溃）

  // GitHub Token — 已在 app.js 中统一使用 localStorage 持久化存储。
  // ⚠️ 安全提示：Token 在浏览器中可被同源脚本读取。建议使用最小权限的 fine-grained token，
  //    仅授予 contents:write 权限给当前仓库。不要在公共或共享设备上使用此功能。
  (function () {
    try {
      var _url = new URL(window.location.href);
      if (_url.searchParams.has('token') || _url.searchParams.has('gh-token')) {
        _url.searchParams.delete('token');
        _url.searchParams.delete('gh-token');
        window.history.replaceState({}, '', _url.toString());
      }
    } catch (e) {}
    // 迁移检查：如果用户有旧的 sessionStorage token，迁移到 localStorage
    try {
      var _oldToken = sessionStorage.getItem('gh-token');
      if (_oldToken && !localStorage.getItem('gh-token')) {
        localStorage.setItem('gh-token', _oldToken);
        sessionStorage.removeItem('gh-token');
        console.log('[Token] 已从 sessionStorage 迁移 Token 到 localStorage');
      }
    } catch (e) {}
  })();

  (function () {
    var _origRD = typeof renderDashboard === 'function' ? renderDashboard : null;
    if (!_origRD) return;
    window.renderDashboard = function () {
      _origRD.apply(this, arguments);
      var _ql = document.querySelector('.dash-links');
      if (!_ql) return;
      if (document.getElementById('fix-quick-mark')) return;
      var _hasOpen = typeof getOpenPeriodStart === 'function' ? !!getOpenPeriodStart() : false;
      var _btn = document.createElement('button');
      _btn.id = 'fix-quick-mark';
      _btn.className = 'dash-link-btn';
      _btn.textContent = _hasOpen ? '\u{23F9}\u{FE0F} \u{7ECF}\u{671F}\u{8D70}\u{4E86}' : '\u{1F9F8} \u{7ECF}\u{671F}\u{6765}\u{4E86}';
      _btn.onclick = function () { if (typeof togglePeriodRecord === 'function') togglePeriodRecord(); };
      _ql.appendChild(_btn);
    };
  })();

  (function () {
    var _origSP = typeof renderStatsPanel === 'function' ? renderStatsPanel : null;
    if (!_origSP) return;
    window.renderStatsPanel = function () {
      _origSP.apply(this, arguments);
      var _subs = document.querySelectorAll('.stats-mini-card .mini-sub');
      _subs.forEach(function (el) {
        var txt = el.textContent || '';
        if (txt.indexOf('\u{03C3}=') >= 0) {
          var val = parseFloat(txt.replace('\u{03C3}=', ''));
          var label = val <= 3 ? '\u{89C4}\u{5F8B}' : val <= 6 ? '\u{8F83}\u{89C4}\u{5F8B}' : '\u{4E0D}\u{89C4}\u{5F8B}';
          el.textContent = label;
        }
      });
    };
  })();

  // openModal 日记按钮已合并至上方统一包裹

  (function () {
    var _origRD2 = typeof renderDashboard === 'function' ? renderDashboard : null;
    if (!_origRD2) return;
    var _origRender = window.renderDashboard;
    window.renderDashboard = function () {
      _origRender.apply(this, arguments);
      setTimeout(function () {
        var _cards = document.querySelectorAll('.dash-card');
        _cards.forEach(function (c) {});
      }, 50);
    };
  })();

  (function () {
    var _origSS = typeof saveSettings === 'function' ? saveSettings : null;
    if (!_origSS) return;
    window.saveSettings = function () {
      _origSS.apply(this, arguments);
      var _btn = document.getElementById('save-settings-btn');
      if (!_btn) return;
      _btn.style.transition = 'background 0.3s';
      _btn.style.background = 'var(--sage)';
      setTimeout(function () { _btn.style.background = ''; }, 1000);
    };
  })();

  (function () {
    var _o = typeof renderStatsPanel === 'function' ? renderStatsPanel : null;
    if (!_o) return;
    var _orig = window.renderStatsPanel;
    window.renderStatsPanel = function () {
      _orig.apply(this, arguments);
      if (!state || state.records.length < 2) {
        var _el = document.getElementById('chartCycleEmpty');
        if (_el) _el.textContent = '\u{6807}\u{8BB0} 2 \u{6B21}\u{7ECF}\u{671F}\u{540E}\u{663E}\u{793A}\u{8D8B}\u{52BF}\u{56FE}';
      }
    };
  })();

  // openModal 节日行交互已合并至上方统一包裹

  (function () {
    function _fixPeriodEnds() {
      if (typeof state === 'undefined' || !state.periodEnds || !state.records) return;
      var _records = state.records.slice().sort(function (a, b) { return a - b; });
      var _changed = false;
      for (var i = 0; i < _records.length; i++) {
        var _startKey = _fmtDate(_records[i]);
        var _endVal = state.periodEnds[_startKey];
        if (!_endVal) continue;
        // Defense: 结束日期不能早于开始日期
        if (_endVal < _startKey) {
          state.periodEnds[_startKey] = _startKey;
          _changed = true;
          _endVal = _startKey;
          console.log('[fix-period] Fixed end before start:', _startKey);
        }
        if (i < _records.length - 1) {
          var _nextStart = _records[i + 1];
          var _maxEnd = new Date(_nextStart);
          _maxEnd.setDate(_maxEnd.getDate() - 1);
          var _maxEndKey = _fmtDate(_maxEnd);
          if (_endVal > _maxEndKey) { state.periodEnds[_startKey] = _maxEndKey; _changed = true; }
        }
        var _endDate = new Date(_endVal + 'T00:00:00');
        var _startDate = new Date(_startKey + 'T00:00:00');
        var _len = Math.round((_endDate - _startDate) / 86400000) + 1;
        if (_len > 14) {
          var _newEnd = new Date(_startDate);
          _newEnd.setDate(_newEnd.getDate() + 13);
          state.periodEnds[_startKey] = _fmtDate(_newEnd);
          _changed = true;
        }
      }
      if (_changed) {
        if (typeof saveState === 'function') saveState();
        if (typeof renderCalendar === 'function') renderCalendar();
      }
    }
    _fixPeriodEnds();
    var _origTPR = typeof togglePeriodRecord === 'function' ? togglePeriodRecord : null;
    if (_origTPR) {
      window.togglePeriodRecord = function (s, e) {
        // --- 防御性检查（仅在弹窗按钮调用即无显式参数时生效） ---
        if (!s && !e) {
          var _sel = (typeof selectedDate !== 'undefined') ? selectedDate : null;
          if (_sel) {
            var _today = _d0(new Date());
            var _d = _d0(_sel);
            var _open = (typeof getOpenPeriodStart === 'function') ? getOpenPeriodStart() : null;
            // 1) 不允许标记未来日期
            if (_d > _today) {
              var _msg = window.lang === 'zh-CN' ? '不能标记未来日期' : window.lang === 'en' ? 'Cannot mark future date' : 'Ne može se označiti budući datum';
              if (typeof toast === 'function') toast('⛔ ' + _msg);
              console.log('[fix-period] BLOCKED future date:', _fmtDate(_sel));
              return;
            }
            // 2) 如果在标记新经期开始时存在未结束的经期，先自动结束它
            if (_open && _d < _d0(_open)) {
              var _closeDate = new Date(_today);
              _closeDate.setDate(_closeDate.getDate() - 1);
              if (typeof state !== 'undefined' && state) {
                state.periodEnds = state.periodEnds || {};
                state.periodEnds[_fmtDate(_open)] = _fmtDate(_closeDate);
                console.log('[fix-period] Auto-closed open period:', _fmtDate(_open), '→', _fmtDate(_closeDate));
                if (typeof saveState === 'function') saveState();
              }
            }
            // 3) 结束日期早于开始日期的检查由 app.js 的 d0(selectedDate) > d0(openStart) 条件保证
          }
        }
        _origTPR(s, e);
        _fixPeriodEnds();
      };
    }
  })();

  (function () {
    var _ta = document.getElementById('diaryTextarea');
    var _cc = document.getElementById('diaryCharCount');
    if (_ta && _cc) {
      _ta.addEventListener('input', function () { _cc.textContent = _ta.value.length + '/500'; });
    }
  })();

  (function () {
    var _tips = ['\u{1F33F} \u{4ECA}\u{5929}\u{4E5F}\u{8981}\u{5F00}\u{5FC3}\u{54E6}', '\u{2728} \u{4F60}\u{5F88}\u{68D2}', '\u{1F31F} \u{5FAE}\u{7B11}\u{5410}\u{8F6F}', '\u{1F4AA} \u{52A0}\u{6CB9}\u{FF01}', '\u{1F33C} \u{4F11}\u{606F}\u{4E00}\u{4E0B}\u{5427}', '\u{2615} \u{559D}\u{676F}\u{8336}'];
    var _o = typeof renderCalendar === 'function' ? renderCalendar : null;
    if (!_o) return;
    var _orig = window.renderCalendar;
    window.renderCalendar = function () {
      _orig.apply(this, arguments);
      setTimeout(function () {
        var _cells = document.querySelectorAll('.day[aria-label]');
        _cells.forEach(function (c) {
          if (c._fixTip) return;
          if (!c.classList.contains('other-month') && c.classList.length <= 3 && !c.querySelector('.holiday-icon')) {
            if (Math.random() < 0.08) {
              var _tip = document.createElement('span');
              _tip.style.cssText = 'position:absolute;bottom:1px;left:50%;transform:translateX(-50%);font-size:.38rem;opacity:.4;pointer-events:none;white-space:nowrap';
              _tip.textContent = _tips[Math.floor(Math.random() * _tips.length)];
              c.appendChild(_tip);
              c._fixTip = true;
            }
          }
        });
      }, 200);
    };
  })();

  (function () {
    var _origRender = typeof CalendarRenderer !== 'undefined' ? CalendarRenderer.render : null;
    if (!_origRender) return;
    CalendarRenderer.render = function (grid, cells, opts) {
      var _shadow = document.createElement('div');
      _shadow.style.display = 'none';
      document.body.appendChild(_shadow);
      _origRender(_shadow, cells, opts);
      ['role', 'aria-label'].forEach(function (a) {
        var v = _shadow.getAttribute(a);
        if (v) grid.setAttribute(a, v);
      });
      grid.classList.toggle('week-view', _shadow.classList.contains('week-view'));
      grid.replaceChildren.apply(grid, _shadow.childNodes);
      document.body.removeChild(_shadow);
    };
  })();

  // === 双人心情记录系统 (Dual-User Mood System) ===
  (function () {
    function _migrateMoods() {
      if (typeof state === 'undefined' || !state.moods) return;
      var changed = false;
      var dates = Object.keys(state.moods);
      for (var i = 0; i < dates.length; i++) {
        var entry = state.moods[dates[i]];
        if (entry && entry.mood && typeof entry.mood === 'string' && !entry.andjela && !entry.barry) {
          state.moods[dates[i]] = { andjela: { mood: entry.mood, time: entry.time || Date.now() } };
          changed = true;
        }
      }
      if (changed && typeof saveState === 'function') saveState();
    }
    _migrateMoods();

    function _getDayEntry(dateStr) {
      if (typeof state === 'undefined' || !state.moods || !state.moods[dateStr]) return {};
      var entry = state.moods[dateStr];
      if (entry && entry.mood && typeof entry.mood === 'string' && !entry.andjela && !entry.barry) {
        state.moods[dateStr] = { andjela: { mood: entry.mood, time: entry.time || Date.now() } };
        if (typeof saveState === 'function') saveState();
        return state.moods[dateStr];
      }
      return entry || {};
    }

    function _getUserMood(dateStr, user) {
      if (!user) user = (typeof activeProfile !== 'undefined') ? activeProfile : 'andjela';
      var entry = _getDayEntry(dateStr);
      return (entry[user] && entry[user].mood) ? entry[user].mood : null;
    }

    function _setUserMood(dateStr, moodKey, user) {
      if (typeof state === 'undefined' || !state.moods) return;
      if (!user) user = (typeof activeProfile !== 'undefined') ? activeProfile : 'andjela';
      if (!state.moods[dateStr]) state.moods[dateStr] = {};
      _getDayEntry(dateStr);

      if (state.moods[dateStr][user] && state.moods[dateStr][user].mood === moodKey) {
        delete state.moods[dateStr][user];
        if (Object.keys(state.moods[dateStr]).length === 0) delete state.moods[dateStr];
        if (typeof saveState === 'function') saveState();
        if (typeof renderMoodSection === 'function') renderMoodSection();
        if (typeof renderGarden === 'function') renderGarden();
        return;
      }

      state.moods[dateStr][user] = { mood: moodKey, time: Date.now() };
      if (typeof saveState === 'function') saveState();
      if (typeof renderMoodSection === 'function') renderMoodSection();
      if (typeof renderGarden === 'function') renderGarden();

      var lang = window.lang || 'sr';
      var names = lang === 'zh-CN' ? ['开心', '被爱', '烦躁', '疲惫', '难过', '兴奋', '焦虑', '还行']
        : lang === 'en' ? ['Happy', 'Loved', 'Frustrated', 'Tired', 'Sad', 'Excited', 'Anxious', 'Meh']
        : ['Srećna', 'Voljena', 'Frustrirana', 'Umorna', 'Tužna', 'Uzbuđena', 'Anksiozna', 'Meh'];
      var moodIdx = (typeof MOOD_KEYS !== 'undefined') ? MOOD_KEYS.indexOf(moodKey) : -1;
      var moodName = (moodIdx >= 0 && names[moodIdx]) ? names[moodIdx] : moodKey;
      if (typeof toast === 'function') toast((user === 'barry' ? 'Barry' : 'Anđela') + ': ' + moodName + ' ✓');
    }

    var _origGetMood = (typeof getMood === 'function') ? getMood : null;
    window.getMood = function (dateStr, user) {
      if (!user) user = (typeof activeProfile !== 'undefined') ? activeProfile : 'andjela';
      return _getUserMood(dateStr, user);
    };

    window.setMood = function (dateStr, moodKey, user) {
      if (!user) user = (typeof activeProfile !== 'undefined') ? activeProfile : 'andjela';
      _setUserMood(dateStr, moodKey, user);
    };

    var _origRenderMood = (typeof renderMoodSection === 'function') ? renderMoodSection : null;
    window.renderMoodSection = function () {
      var today = (typeof fmtDate === 'function') ? fmtDate(new Date()) : new Date().toISOString().slice(0, 10);

      var titleEl = document.getElementById('mood-title');
      if (titleEl) {
        var _l = window.lang || 'sr';
        titleEl.textContent = _l === 'zh-CN' ? '😊 今日心情' : _l === 'en' ? '😊 Today\'s Mood' : '😊 Raspoloženje';
      }

      var labelEl = document.getElementById('mood-today-label');
      if (labelEl) labelEl.textContent = (typeof t === 'function') ? t('moodToday') : '';

      var picker = document.getElementById('moodPicker');
      if (!picker) return;

      var _l = window.lang || 'sr';
      var dayEntry = _getDayEntry(today);
      var moodKeys = (typeof MOOD_KEYS !== 'undefined') ? MOOD_KEYS
        : ['happy','loved','frustrated','tired','sad','excited','anxious','meh'];
      var moodEmojis = (typeof MOOD_EMOJIS !== 'undefined') ? MOOD_EMOJIS
        : ['😊','🥰','😤','😴','😢','🤩','😰','😐'];

      var moodNames;
      if (typeof t === 'function') {
        var _mn = t('moodNames');
        moodNames = Array.isArray(_mn) && _mn.length === moodKeys.length ? _mn : null;
      }
      if (!moodNames) {
        moodNames = _l === 'zh-CN' ? ['开心','被爱','烦躁','疲惫','难过','兴奋','焦虑','还行']
          : _l === 'en' ? ['Happy','Loved','Frustrated','Tired','Sad','Excited','Anxious','Meh']
          : ['Srećna','Voljena','Frustrirana','Umorna','Tužna','Uzbuđena','Anksiozna','Meh'];
      }

      var users = ['barry','andjela'];
      var html = '';
      for (var ui = 0; ui < users.length; ui++) {
        var user = users[ui];
        var userMood = (dayEntry[user] && dayEntry[user].mood) ? dayEntry[user].mood : null;

        html += '<div class="mood-dual-row" style="display:flex;align-items:center;gap:5px;margin-bottom:5px;padding:3px 0">';
        html += '<span class="mood-user-badge" style="font-size:.62rem;font-weight:700;min-width:64px;white-space:nowrap;color:var(--text-muted);text-align:right;flex-shrink:0">'
          + (user === 'barry' ? '👦 Barry' : '👧 Anđela') + '</span>';

        for (var mi = 0; mi < moodEmojis.length; mi++) {
          var isPicked = userMood === moodKeys[mi];
          html += '<span class="mood-emoji' + (isPicked ? ' picked' : '') + '"'
            + ' data-user="' + user + '" data-mood="' + moodKeys[mi] + '"'
            + ' title="' + (moodNames[mi] || moodKeys[mi]) + '"'
            + ' style="font-size:1.15rem;cursor:pointer;padding:3px;border-radius:50%;line-height:1.2;'
            + (isPicked ? 'background:var(--rose-light);box-shadow:0 0 0 2px var(--love);' : '')
            + '">' + moodEmojis[mi] + '</span>';
        }
        html += '</div>';
      }

      picker.innerHTML = html;

      var emojiEls = picker.querySelectorAll('.mood-emoji');
      for (var ei = 0; ei < emojiEls.length; ei++) {
        (function (el) {
          el.onclick = function () {
            _setUserMood(today, this.getAttribute('data-mood'), this.getAttribute('data-user'));
          };
        })(emojiEls[ei]);
      }

      var streakEl = document.getElementById('streakDisplay');
      if (streakEl) streakEl.style.display = 'none';

      var histLabel = document.getElementById('mood-history-label');
      if (histLabel) histLabel.textContent = (typeof t === 'function') ? t('moodHistoryLabel') : '';

      _renderDualHistory();
    };

    function _renderDualHistory() {
      var histEl = document.getElementById('moodHistory');
      if (!histEl) return;

      var html = '<div class="dual-mood-track" style="display:flex;gap:4px;justify-content:center;padding:6px 0 2px">';

      for (var di = 6; di >= 0; di--) {
        var d = new Date();
        d.setDate(d.getDate() - di);
        var dateKey = (typeof fmtDate === 'function') ? fmtDate(d) : d.toISOString().slice(0, 10);
        var entry = _getDayEntry(dateKey);
        var bMood = (entry.barry && entry.barry.mood) ? true : false;
        var aMood = (entry.andjela && entry.andjela.mood) ? true : false;

        html += '<div class="mood-day-col" style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1;min-width:16px;max-width:30px">';
        html += '<span style="font-size:.42rem;color:var(--text-muted);opacity:.5;line-height:1">' + d.getDate() + '/' + (d.getMonth()+1) + '</span>';
        html += '<div style="width:14px;height:14px;border-radius:50%;background:' + (bMood ? 'var(--love)' : 'var(--border)') + ';opacity:' + (bMood ? '1' : '.2') + ';transform:' + (bMood ? 'scale(1.1)' : 'scale(.85)') + ';transition:all .3s ease;box-shadow:0 0 0 1px var(--border)"></div>';
        html += '<div style="width:14px;height:14px;border-radius:50%;background:' + (aMood ? 'var(--accent)' : 'var(--border)') + ';opacity:' + (aMood ? '1' : '.2') + ';transform:' + (aMood ? 'scale(1.1)' : 'scale(.85)') + ';transition:all .3s ease;box-shadow:0 0 0 1px var(--border)"></div>';
        html += '</div>';
      }

      html += '</div>';
      html += '<div style="display:flex;justify-content:center;gap:12px;font-size:.48rem;color:var(--text-muted);margin-top:1px;padding-bottom:3px">'
        + '<span><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--love);margin-right:3px;vertical-align:middle"></span>Barry</span>'
        + '<span><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--accent);margin-right:3px;vertical-align:middle"></span>Anđela</span></div>';

      histEl.innerHTML = html;
    }

    if (typeof calculateStreak === 'function') {
      var _origCS = calculateStreak;
      window.calculateStreak = function (user) {
        if (!user) user = (typeof activeProfile !== 'undefined') ? activeProfile : 'andjela';
        if (typeof state === 'undefined' || !state.moods) return 0;
        var streak = 0;
        var d = new Date();
        while (true) {
          var key = (typeof fmtDate === 'function') ? fmtDate(d) : d.toISOString().slice(0, 10);
          var entry = _getDayEntry(key);
          if (!entry[user] || !entry[user].mood) break;
          streak++;
          d.setDate(d.getDate() - 1);
        }
        return streak;
      };
    }
  })();



})();

/* === dist/js/fix-panel.js === */
"use strict";
(function () {
  // console.log('[fix-panel] 已加载');

  window.updateLangUI = window.updateLangUI || function(){};
  window.initSharedDiaryTab = window.initSharedDiaryTab || function(){};
  window.renderDiaryForm = window.renderDiaryForm || function(){};
  window.renderDiaryPanel = window.renderDiaryPanel || function(){};

  function fmtDate(d) {
    if (!d) return '--';
    if (typeof d === 'string') { var m = d.match(/^\d{4}-\d{2}-\d{2}/); return m ? m[0] : d.slice(0, 10); }
    if (d instanceof Date) return d.toISOString().slice(0, 10);
    return String(d).slice(0, 10);
  }

  function setEl(id, v) { var e = document.getElementById(id); if (e) e.textContent = v; }

  function applyStatsFix() {
    var panel = document.getElementById('panel-stats');
    if (!panel || !panel.classList.contains('active')) return;
    var L = window.lang || 'zh-CN';

    // Do NOT inject fake data into state.records — empty guidance text is set below

    // Title translation
    var M = {
      'schart-cycle-title':{'zh-CN':'周期趋势（最近6次）','en':'Cycle Trend (last 6)','sr':'Trend ciklusa (poslednjih 6)'},
      'schart-mood-title':{'zh-CN':'心情分布','en':'Mood Distribution','sr':'Raspolozenje'},
'predChipOvLabel':{'zh-CN':'排卵日','en':'Ovulation','sr':'Ovulacija'},
      'predChipFertLabel':{'zh-CN':'易孕期','en':'Fertile','sr':'Plodni dani'},
      'predChipFutureLabel':{'zh-CN':'未来预测','en':'Future','sr':'Buducnost'},
      'predChipRegLabel':{'zh-CN':'规律性','en':'Regularity','sr':'Regularnost'},
      'schart-history-title':{'zh-CN':'周期历史','en':'Cycle History','sr':'Istorija ciklusa'},
      'tleg-short':{'zh-CN':'短（<26天）','en':'Short (<26d)','sr':'Kratak (<26d)'},
      'tleg-normal':{'zh-CN':'正常（26-32天）','en':'Normal (26-32d)','sr':'Normalan (26-32d)'},
      'tleg-long':{'zh-CN':'长（>32天）','en':'Long (>32d)','sr':'Dug (>32d)'},
      'sect-relationship':{'zh-CN':'关系','en':'Relationship','sr':'Veza'},
      'diary-title':{'zh-CN':'今日笔记','en':"Today's Note",'sr':'Danasnja beleska'},
      'knowMe-title':{'zh-CN':'你了解我吗','en':'Do You Know Me?','sr':'Da li me poznajes?'}
    };
    for (var id in M) { var el = document.getElementById(id); if (el && M[id][L]) el.textContent = M[id][L]; }

    // Empty data guidance
    var EM = {
      'chartCycleEmpty':{'zh-CN':'标记2次经期后显示趋势图','en':'Record 2 cycles to see trend','sr':'Zabelezi 2 ciklusa za trend'},
      'chartMoodEmpty':{'zh-CN':'记录心情后显示分布图','en':'Record moods to see distribution','sr':'Zabelezi raspolozenja za prikaz'}
    };
    for (var eid in EM) { var cel = document.getElementById(eid); if (cel) { cel.textContent = EM[eid][L] || EM[eid]['zh-CN']; cel.style.cssText = 'display:block;padding:20px;text-align:center;color:var(--text-muted);font-size:0.8rem'; } }

    if (typeof state !== 'undefined' && state.records && state.records.length >= 1) {
      // Prediction data
      if (typeof predict === 'function') {
        var pred = predict();
        if (pred) {
          setEl('predMainNext', fmtDate(pred.nextStart));
          var cm = {high:{'zh-CN':'高','en':'High','sr':'Visok'},mid:{'zh-CN':'中','en':'Medium','sr':'Srednji'},low:{'zh-CN':'低','en':'Low','sr':'Nizak'}};
          setEl('predSubConf', (cm[pred.confidence || 'mid'] || cm.mid)[L]);
          setEl('predChipOv', fmtDate(pred.ovulation));
          setEl('predChipFert', pred.fertileStart ? fmtDate(pred.fertileStart) + ' ~ ' + fmtDate(pred.fertileEnd) : '--');
          if (Array.isArray(pred.futurePeriods)) { setEl('predChipFuture', pred.futurePeriods.map(function(f) { return typeof f === 'object' ? fmtDate(f.start || f) : fmtDate(f); }).join(', ')); }
          var rl = {'zh-CN':{high:'规律',mid:'较规律',low:'不规律'},'en':{high:'Regular',mid:'Fair',low:'Irregular'},'sr':{high:'Redovan',mid:'Srednji',low:'Neredovan'}};
          var regMap = rl[L] || rl['zh-CN'];
          setEl('predChipReg', (regMap[pred.regularity || 'mid'] || '') + ' ±' + (pred.stdDev || '0'));
        }
      }

      // Cycle trend chart
      if (typeof ChartRenderer !== 'undefined' && ChartRenderer.drawLineChart && state.records.length >= 2) { try {
        var sorted = state.records.slice().sort(function(a, b) { return new Date(a) - new Date(b); });
        var diffs = [], lbs = [];
        for (var i = 1; i < sorted.length; i++) { diffs.push(Math.round((new Date(sorted[i]) - new Date(sorted[i - 1])) / 86400000)); lbs.push(L === 'zh-CN' ? '周期' + i : 'C' + i); }
        var avg = diffs.length > 0 ? Math.round(diffs.reduce(function(s, v) { return s + v; }, 0) / diffs.length) : 28;
        var tc = document.getElementById('chartCycleTrend');
        if (tc) { ChartRenderer.drawLineChart(tc, diffs, lbs, { width: 500, height: 200, avgLine: avg, avgLabel: L === 'zh-CN' ? '均值' : L === 'en' ? 'Avg' : 'Prosek', emptyText: '' }); var ce = document.getElementById('chartCycleEmpty'); if (ce) ce.style.display = 'none'; }
      } catch(ex) {} }

      // Cycle history timeline
      if (state.records.length >= 2) { try {
        var tlSorted = state.records.slice().sort(function(a, b) { return new Date(a) - new Date(b); });
        var tlDiffs = [];
        for (var tli = 1; tli < tlSorted.length; tli++) { tlDiffs.push(Math.round((new Date(tlSorted[tli]) - new Date(tlSorted[tli - 1])) / 86400000)); }
        var tlRow = document.getElementById('timelineRow');
        if (tlRow) {
          var tlHtml = '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;padding:10px 0">';
          for (var tli2 = 0; tli2 < tlDiffs.length; tli2++) {
            var td = tlDiffs[tli2], c = td < 26 ? '#4CAF50' : td <= 32 ? '#42A5F5' : '#FF7043';
            var lb = (L === 'zh-CN' ? '周期' : L === 'en' ? 'Cycle ' : 'Ciklus ') + (tli2 + 1) + ': ' + td + (L === 'zh-CN' ? '天' : 'd');
            tlHtml += '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;min-width:28px" title="' + lb + '">';
            tlHtml += '<div style="width:20px;height:20px;border-radius:50%;background:' + c + ';cursor:pointer;transition:transform .2s;box-shadow:0 0 0 2px var(--card),0 0 0 3px ' + c + '40" title="' + lb + '"></div>';
            tlHtml += '<span style="font-size:.45rem;color:var(--text-muted);opacity:.7">' + td + '</span></div>';
          }
          tlHtml += '</div>';
          tlRow.innerHTML = tlHtml;
        }
        var tls = document.getElementById('tleg-short'); if (tls) tls.innerHTML = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#4CAF50;margin-right:4px;vertical-align:middle"></span>' + (L === 'zh-CN' ? '偏短（<26天' : L === 'en' ? 'Short (<26d)' : 'Kratak (<26d)');
        var tln = document.getElementById('tleg-normal'); if (tln) tln.innerHTML = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#42A5F5;margin-right:4px;vertical-align:middle"></span>' + (L === 'zh-CN' ? '正常（26-32天' : L === 'en' ? 'Normal (26-32d)' : 'Normalan (26-32d)');
        var tll = document.getElementById('tleg-long'); if (tll) tll.innerHTML = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#FF7043;margin-right:4px;vertical-align:middle"></span>' + (L === 'zh-CN' ? '偏长（>32天' : L === 'en' ? 'Long (>32d)' : 'Dug (>32d)');
        var hl = document.getElementById('historyLabel'); if (hl) hl.textContent = (L === 'zh-CN' ? '共 ' : L === 'en' ? 'Total: ' : 'Ukupno: ') + tlDiffs.length + (L === 'zh-CN' ? ' 个周期' : L === 'en' ? ' cycles' : ' ciklusa');
      } catch(ex) {} }

      // Cycle counter
      var tot = state.records ? state.records.length : 0;
      var cc = document.getElementById('cc-count'); if (cc) cc.textContent = tot;
      var cct = document.getElementById('cc-title'); if (cct) cct.textContent = L === 'zh-CN' ? '一起走过 ' + tot + ' 个周期' : L === 'en' ? 'Together: ' + tot + ' cycles' : 'Zajedno: ' + tot + ' ciklusa';

      // Stability
      var sn = document.getElementById('chartCycleStability');
      if (!sn) { sn = document.createElement('div'); sn.id = 'chartCycleStability'; sn.style.cssText = 'text-align:center;font-size:.72rem;margin-top:6px;font-weight:600;'; var cc2 = document.getElementById('chartCycleTrend'); if (cc2) { var cp2 = cc2.closest('.chart-card'); if (cp2) cp2.appendChild(sn); } }
      if (tot >= 2 && typeof predict === 'function') { var p2 = predict(); if (p2 && p2.stdDev != null) { if (p2.stdDev <= 2) { sn.textContent = L === 'zh-CN' ? '✨ 你的周期非常规律' : L === 'en' ? '✨ Very regular' : '✨ Vrlo redovan'; sn.style.color = 'var(--sage)'; } else if (p2.stdDev <= 5) { sn.textContent = L === 'zh-CN' ? '📊 你的周期比较规律' : L === 'en' ? '📊 Fairly regular' : '📊 Prilicno redovan'; sn.style.color = 'var(--gold)'; } else { sn.textContent = L === 'zh-CN' ? '⚠️ 你的周期不太规律' : L === 'en' ? '⚠️ Irregular' : '⚠️ Neredovan'; sn.style.color = 'var(--rose)'; } } }
    }
  }

  // Hook into renderStatsPanel for data-update re-renders (profile switch, sync, etc.)
  var _origRSP = window.renderStatsPanel;
  if (typeof _origRSP === 'function') {
    window.renderStatsPanel = function() {
      _origRSP.apply(this, arguments);
      setTimeout(applyStatsFix, 50);
    };
  }

  var mo = new MutationObserver(function(muts) { muts.forEach(function(m) { if (m.target.id === 'panel-stats' && m.target.classList.contains('active')) { setTimeout(applyStatsFix, 100); } }); });
  var sp = document.getElementById('panel-stats');
  if (sp) mo.observe(sp, { attributes: true, attributeFilter: ['class'] });
  if (document.readyState === 'complete') { setTimeout(applyStatsFix, 500); } else { window.addEventListener('load', function() { setTimeout(applyStatsFix, 500); }); }
})();


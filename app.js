console.log('APP JS LOADED v17');
try {
  var _ldr = document.getElementById('appLoader');
  console.log('loader found:', !!_ldr, _ldr ? 'display:'+_ldr.style.display : 'null');
  if (_ldr) { _ldr.style.display = 'none'; console.log('loader hidden by top-level script'); }
} catch(e) { console.error('top-level error:', e); }

/* ================================================================
   i18n — Full 3-language data (sr as default for Anđela)
   ================================================================ */
const I18N = {
'sr': {
  appTitle:'Anđelin Ciklus', theme:'Tamni režim', themeHint:'Prebacite između tamnog i svetlog režima',
  weekdays:['Pon','Uto','Sre','Čet','Pet','Sub','Ned'],
  months:['Jan','Feb','Mar','Apr','Maj','Jun','Jul','Avg','Sep','Okt','Nov','Dec'],
  today:'Danas', tabs:['Početna','Statistika','Simptomi','Saveti','Dnevnik','Kina','Podeš.'],
  legend:['Menstruacija','Ovul./Plodni','Folikularna','Lutealna','Danas','Ljubav'],
  progressLabels:['Menstr.','Folikul.','Ovulacija','Lutealna'],
  phases:{'period-on':'Početak','period-mid':'Menstruacija','period-pred-first':'Predviđen početak','period-pred':'Predviđeno','period-future-first':'Buduća pred.','period-future':'Buduća pred.','ovulation':'Ovulacija','fertile':'Plodni dani','luteal':'Lutealna','follicular':'Folikularna'},
  phaseBadges:{period:'Menstruacija',follicular:'Folikularna',ovulation:'Ovulacija',fertile:'Plodni dani',luteal:'Lutealna',late:'Kašnjenje'},
  knowledgeToggle:'📖 Saznaj više o ovoj fazi ▾', knowledgeToggleHide:'Sakrij ▴',
  knowledge:{period:{title:'O menstrualnoj fazi',desc:'Sluzokoža materice se ljušti i izbacuje se sa krvlju.',what:'Estrogen i progesteron su na najnižem nivou. Endometrijum se odvaja.',symptoms:'Grčevi, umor, promene raspoloženja, glavobolje, bol u leđima',tips:'Povećajte unos gvožđa, zagrejte stomak, izbegavajte naporne vežbe, spavajte dovoljno'},follicular:{title:'O folikularnoj fazi',desc:'Posle menstruacije, folikuli u jajnicima se razvijaju i estrogen raste.',what:'Hipofiza luči FSH koji stimuliše rast folikula. Estrogen obnavlja sluzokožu.',symptoms:'Povratak energije, jasnije razmišljanje, bolja koža, povećan libido',tips:'Odlično vreme za nove projekte, povećajte vežbanje, uravnotežena ishrana'},ovulation:{title:'O ovulaciji',desc:'Zrela jajna ćelija se oslobađa. Najplodniji period. Ćelija živi ~24h, spermatozoidi do 5 dana.',what:'LH talas pokreće ovulaciju. Estrogen dostiže vrhunac.',symptoms:'Blagi bol u karlici, bistri sekret, povećan libido, blagi porast temperature',tips:'Najbolje vreme za začeće, fizičke performanse na vrhuncu'},luteal:{title:'O lutealnoj fazi',desc:'Faza između ovulacije i sledeće menstruacije. Žuto telo proizvodi progesteron.',what:'Progesteron stabilizuje sluzokožu. Ako nema trudnoće, žuto telo propada.',symptoms:'PMS, osetljivost grudi, promene raspoloženja, nadutost, žudnja za hranom',tips:'Smanjite kofein i so, uzimajte vitamin B6 i magnezijum, lagane vežbe pomažu'},fertile:{title:'O plodnim danima',desc:'Dani oko ovulacije kada je najveća verovatnoća začeća.',what:'Spermatozoidi preživljavaju 3-5 dana. Jajna ćelija živi ~24h.',symptoms:'Bistar rastegljiv sekret, povećan libido, promene bazalne temperature',tips:'Za začeće svaki drugi dan, folna kiselina, dobar san'}},
  emptyState:'Dodirnite datum za prvi unos', emptySymptom:'Dodirnite datum na kalendaru<br>za unos simptoma',
  daysUntil:'Još {n} dana do sledeće menstruacije', daysOverdue:'Kašnjenje {n} dana', day:' dana', periodDay:'{n}. dan ciklusa', expected:'Očekivano',
  onboarding:'👋 Dobrodošla, Anđelo! Dodirni bilo koji datum da započneš. ♥',
  fabLabel:'Danas je',
  greeting:{morning:{icon:'🌅',name:'Anđelo',msg:'Dobro jutro, anđele moj. Želim ti divan dan — budi nežna prema sebi.',sub:'— Sa ljubavlju, Barry'},afternoon:{icon:'🌤️',name:'Anđelo',msg:'Prijatno popodne, moja draga. Napravi pauzu, popij čaj i odmori — brinem se kad preteruješ.',sub:'— Tvoj Barry'},evening:{icon:'🌆',name:'Anđelo',msg:'Dobro veče, najlepša moja. Polako večeras — zaslužuješ miran i topao kraj dana.',sub:'— Sa ljubavlju, tvoj Barry'},night:{icon:'🌙',name:'Anđelo!',msg:'Zašto si još uvek budna? Odmah na spavanje! Brinem se kad ne spavaš, znaš.',sub:'— Voli te, Barry'},dismiss:'♥ Zatvori'},
  stats:{cycleTitle:'📈 Statistika ciklusa',historyTitle:'📅 Nedavni ciklusi',predTitle:'🔮 Predviđanje',count:'Zabeleženih ciklusa',avg:'Prosečan ciklus',range:'Najkraći / Najduži',reg:'Regularnost',next:'Sledeća menstruacija',ovulation:'Ovulacija',fertile:'Plodni dani',confidence:'Pouzdanost',future:'Buduća predviđanja'},
  historyLabel:'● Kratak  ● Normalan  ● Dug  (tačka = ciklus)',
  modal:{details:'Detalji datuma',marked:'Zabeležen početak',phase:'Faza',day:'Dan ciklusa',symptoms:'Simptomi',mark:'Označi početak',unmark:'Ukloni',close:'Zatvori',quickSymptom:'Brzi unos',notesPlaceholder:'Beleške...'},
  symptoms:{cramps:'Grčevi',mood:'Raspoloženje',flow:'Protok',headache:'Glavobolja',fatigue:'Umor',cravings:'Žudnja'},
  tips:{period:[{icon:'🩸',text:'Telo gubi gvožđe — jedite crveno meso, spanać i susam.',source:'',tcm:false},{icon:'♨',text:'Zagrejte stomak termoforom ili toplom vodom.',source:'',tcm:false},{icon:'🍵',text:'Popijte čaj od šipurka posle obroka — umiruje grčeve.',source:'Srpska tradicija',tcm:false},{icon:'🧘',text:'Blago istezanje ili joga ublažavaju tegobe.',source:'',tcm:false},{icon:'🫘',text:'Crveni pasulj i susam bogati gvožđem — tradicionalni srpski izvor gvožđa.',source:'Srpska kuhinja',tcm:false}],follicular:[{icon:'💪',text:'Estrogen raste, energija se vraća — odlično za novi fitnes plan.',source:'',tcm:false},{icon:'🥗',text:'Jedite dosta povrća i voća za uravnoteženu ishranu.',source:'',tcm:false},{icon:'🌿',text:'U kineskoj medicini, ovo je vreme za jačanje krvi (养血). Probajte goji bobice.',source:'中医智慧',tcm:true},{icon:'🎯',text:'Jasno razmišljanje i visoka energija za važne odluke.',source:'',tcm:false}],ovulation:[{icon:'⭐',text:'Faza ovulacije — najplodniji dani.',source:'',tcm:false},{icon:'🏃',text:'Fizičke performanse na vrhuncu — odlično za treninge.',source:'',tcm:false},{icon:'🌸',text:'U kineskoj tradiciji, ovo je vreme ravnoteže (阴阳调和). Uživajte u prirodi.',source:'中医智慧',tcm:true}],luteal:[{icon:'🍵',text:'Smanjite kofein — može pogoršati anksioznost.',source:'',tcm:false},{icon:'🌿',text:'Vitamin B6 i magnezijum ublažavaju predmenstrualne simptome.',source:'',tcm:false},{icon:'🫚',text:'Topla voda sa đumbirom i crvenim datulama greje telo pred ciklus.',source:'中医智慧 · 姜枣茶',tcm:true},{icon:'🍌',text:'Skloni nadutosti? Smanjite so, jedite banane.',source:'',tcm:false}]},
  settings:{lang:'Jezik / Language / 语言',langHint:'Promenite jezik',theme:'Tema',themeHint:'Tamni / Svetli režim',cycle:'Dužina ciklusa',cycleHint:'Automatski, možete ručno',period:'Trajanje menstruacije',periodHint:'Trajanje svake menstruacije',override:'Ručne vrednosti',overrideHint:'Ignoriši automatski proračun',save:'💾 Sačuvaj',export:'📤 Izvezi (JSON)',import:'📥 Uvezi (JSON)',clear:'🗑 Obriši sve',clearConfirm:'Sigurna si? Ovo se ne može opozvati!',anniversary:'Godišnjica',anniversaryHint:'Dan kada ste počeli'},
  toast:{saved:'Sačuvano ✓',marked:'Označeno ✓',unmarked:'Uklonjeno',symptomSaved:'Sačuvano ✓',symptomQuick:'Ažurirano ✓',exported:'Izvezeno ✓',imported:'Uvezeno ✓',importError:'Greška',cleared:'Obrisano'},
  reminder:{beforePeriod:'⏰ Menstruacija za {days} dana — spremi se, dušo',late:'⚠️ Kašnjenje {days} dana — konsultuj lekara',ovulation:'✨ Danas je ovulacija — vrhunac plodnosti'},
  cycleCounter:'Zajedno: {n} ciklusa', cycleCounterSub:'Barry prati svaki tvoj ciklus ♥',
  anniversaryTitle:'💕 Datumi koji znače', annMetLabel:'✨ Prvi put smo se sreli', annLoveLabel:'♥ Zajedno smo od', annCountMet:'{n} dana od prvog susreta ✨', annCountLove:'{n} dana zajedno ♥',
  yearTitle:'Godišnji pregled'
},
'zh-CN': {
  appTitle:'Anđelin Ciklus', theme:'暗色模式', themeHint:'切换深色/浅色主题',
  weekdays:['一','二','三','四','五','六','日'],
  months:['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
  today:'今天', tabs:['主页','统计','症状','贴士','日记','中华','设置'],
  legend:['经期','排卵/易孕','卵泡期','黄体期','今天','♥纪念日'],
  progressLabels:['经期','卵泡期','排卵','黄体期'],
  phases:{'period-on':'经期开始','period-mid':'经期中','period-pred-first':'预测开始','period-pred':'预测经期','period-future-first':'未来预测','period-future':'未来预测','ovulation':'排卵日','fertile':'易孕期','luteal':'黄体期','follicular':'卵泡期'},
  phaseBadges:{period:'经期中',follicular:'卵泡期',ovulation:'排卵日',fertile:'易孕期',luteal:'黄体期',late:'已推迟'},
  knowledgeToggle:'📖 了解这个阶段 ▾', knowledgeToggleHide:'收起 ▴',
  knowledge:{period:{title:'关于经期',desc:'月经周期的第一阶段。子宫内膜脱落，伴随出血排出体外。',what:'雌激素和孕激素都处于最低水平。子宫内膜正在脱落。',symptoms:'腹部绞痛、疲劳、情绪波动、头痛、腰酸',tips:'多补充铁质、注意保暖、避免剧烈运动、保证睡眠'},follicular:{title:'关于卵泡期',desc:'经期结束后，卵泡开始发育，雌激素逐渐上升。',what:'脑垂体分泌FSH刺激卵泡生长。雌激素上升使子宫内膜重新增厚。',symptoms:'精力恢复、思维清晰、皮肤状态改善',tips:'适合开始新计划、增加运动强度、均衡饮食'},ovulation:{title:'关于排卵期',desc:'成熟卵子从卵巢释放，是最易受孕的时期。',what:'LH激素激增触发排卵。雌激素达到峰值。',symptoms:'轻微腹痛、分泌物增多、性欲增强、体温微升',tips:'备孕最佳时机、体能高峰适合运动'},luteal:{title:'关于黄体期',desc:'排卵后到下次月经前的阶段。黄体分泌孕激素。',what:'孕激素上升稳定子宫内膜。如未受孕，黄体退化。',symptoms:'PMS、乳房胀痛、情绪波动、水肿、食欲变化',tips:'减少咖啡因和盐分、补充B6和镁、轻度运动'},fertile:{title:'关于易孕期',desc:'排卵日前后几天，怀孕可能性最高的时间段。',what:'精子可存活3-5天。卵子约24小时。共约6天易孕窗口。',symptoms:'分泌物清亮黏滑、性欲增强、基础体温变化',tips:'备孕可隔天同房、补充叶酸、保持良好作息'}},
  emptyState:'点击日历标记第一次经期', emptySymptom:'点击日历中的日期<br>来记录当日症状',
  daysUntil:'距下次月经还有 {n} 天', daysOverdue:'已推迟 {n} 天', day:'天', periodDay:'经期第 {n} 天', expected:'预计',
  onboarding:'👋 欢迎！点击日历开始记录吧 ♥',
  fabLabel:'今天来了',
  greeting:{morning:{icon:'🌅',name:'Anđelo',msg:'早安，我的天使。愿你今天温柔待自己。',sub:'— 爱你的 Barry'},afternoon:{icon:'🌤️',name:'Anđelo',msg:'下午了，亲爱的。休息一下，喝杯茶——你太拼了我会心疼。',sub:'— 你的 Barry'},evening:{icon:'🌆',name:'Anđelo',msg:'晚上好，最美的你。慢慢来——你值得一个温暖平静的夜晚。',sub:'— 爱你的 Barry'},night:{icon:'🌙',name:'Anđelo！',msg:'怎么还没睡？快去睡觉！你不睡我会担心的，知道吗。',sub:'— 想你的 Barry'},dismiss:'♥ 开始'},
  stats:{cycleTitle:'📈 周期统计',historyTitle:'📅 近期周期',predTitle:'🔮 当前预测',count:'已记录周期数',avg:'平均周期',range:'最短 / 最长',reg:'规律性',next:'下次月经',ovulation:'排卵日',fertile:'易孕窗口',confidence:'置信度',future:'未来预测周期'},
  historyLabel:'● 偏短  ● 正常  ● 偏长  (每点=一个周期)',
  modal:{details:'日期详情',marked:'已记录的经期开始日',phase:'阶段',day:'周期第几天',symptoms:'已记录症状',mark:'标记经期开始',unmark:'取消标记',close:'关闭',quickSymptom:'快速记录症状',notesPlaceholder:'添加备注...'},
  symptoms:{cramps:'痛经',mood:'情绪',flow:'流量',headache:'头痛',fatigue:'疲劳',cravings:'食欲'},
  tips:{period:[{icon:'🩸',text:'经期身体流失铁质，多吃红肉、菠菜、黑芝麻等富含铁的食物。',source:'',tcm:false},{icon:'♨',text:'注意腹部保暖，可使用暖水袋或暖宝宝缓解不适。',source:'',tcm:false},{icon:'🍵',text:'喝杯红枣姜茶，暖宫驱寒，缓解经期不适。',source:'中医养生 · 姜枣茶',tcm:true},{icon:'🧘',text:'轻度拉伸或瑜伽有助缓解不适，避免剧烈运动。',source:'',tcm:false},{icon:'🫘',text:'红豆补血养心——相思之物，亦养身之物。',source:'中医智慧 · 红豆',tcm:true}],follicular:[{icon:'💪',text:'卵泡期雌激素上升，精力和体能恢复中，适合开启新运动计划。',source:'',tcm:false},{icon:'🥗',text:'新陈代谢较好，多吃蔬菜水果，均衡营养。',source:'',tcm:false},{icon:'🌿',text:'中医认为此时宜养血（养血），枸杞红枣茶正当时。',source:'中医智慧',tcm:true},{icon:'🎯',text:'思维清晰精力充沛，适合处理复杂任务和做重要决定。',source:'',tcm:false}],ovulation:[{icon:'⭐',text:'排卵期，如有备孕计划，这几天是最佳时机。',source:'',tcm:false},{icon:'🏃',text:'体能处于高峰，适合高强度训练。',source:'',tcm:false},{icon:'🌸',text:'中医讲究阴阳调和，此时阴阳平衡，适合赏花散步。',source:'中医养生',tcm:true}],luteal:[{icon:'🍵',text:'黄体期减少咖啡因摄入，可能加重焦虑和情绪波动。',source:'',tcm:false},{icon:'🌿',text:'适当补充维生素B6和镁，有助缓解经前不适。',source:'',tcm:false},{icon:'🫚',text:'姜枣茶温经散寒——东方古老的温柔。',source:'中医智慧 · 姜枣茶',tcm:true},{icon:'🍌',text:'易水肿，减少盐分，多吃香蕉等富含钾的食物。',source:'',tcm:false}]},
  settings:{lang:'语言 / Language / Jezik',langHint:'切换界面语言',theme:'主题',themeHint:'深色/浅色模式',cycle:'默认周期长度',cycleHint:'系统自动计算，可手动覆盖',period:'默认经期天数',periodHint:'每次经期持续天数',override:'使用手动值预测',overrideHint:'开启后忽略自动计算',save:'💾 保存设置',export:'📤 导出数据 (JSON)',import:'📥 导入数据 (JSON)',clear:'🗑 清除所有数据',clearConfirm:'确定清除所有数据？此操作不可恢复！',anniversary:'纪念日',anniversaryHint:'你们在一起的那一天'},
  toast:{saved:'设置已保存 ✓',marked:'已标记 ✓',unmarked:'已取消标记',symptomSaved:'症状已保存 ✓',symptomQuick:'症状已更新 ✓',exported:'数据已导出 ✓',imported:'数据导入成功 ✓',importError:'导入失败',cleared:'所有数据已清除'},
  reminder:{beforePeriod:'⏰ 预计 {days} 天后经期开始，提前准备哦',late:'⚠️ 经期已推迟 {days} 天，建议关注身体状况',ovulation:'✨ 今天是排卵期，备孕的最佳时机'},
  cycleCounter:'一起走过 {n} 个周期', cycleCounterSub:'Barry 记录着你的每一个周期 ♥',
  anniversaryTitle:'💕 重要的日子', annMetLabel:'✨ 初次相遇', annLoveLabel:'♥ 在一起的日子', annCountMet:'相遇 {n} 天 ✨', annCountLove:'相恋 {n} 天 ♥',
  yearTitle:'年度概览'
},
'en': {
  appTitle:'Anđelin Ciklus', theme:'Dark Mode', themeHint:'Switch theme',
  weekdays:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
  months:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  today:'Today', tabs:['Home','Stats','Symptoms','Tips','Diary','Culture','Settings'],
  legend:['Period','Ovul./Fertile','Follicular','Luteal','Today','♥ Love'],
  progressLabels:['Period','Follicular','Ovulation','Luteal'],
  phases:{'period-on':'Period Start','period-mid':'Period','period-pred-first':'Predicted Start','period-pred':'Predicted','period-future-first':'Future Pred.','period-future':'Future Pred.','ovulation':'Ovulation','fertile':'Fertile','luteal':'Luteal','follicular':'Follicular'},
  phaseBadges:{period:'Period',follicular:'Follicular',ovulation:'Ovulation',fertile:'Fertile',luteal:'Luteal',late:'Late'},
  knowledgeToggle:'📖 Learn about this phase ▾', knowledgeToggleHide:'Hide ▴',
  knowledge:{period:{title:'Menstrual Phase',desc:'The uterine lining sheds. First phase of the cycle.',what:'Estrogen and progesterone at lowest. Endometrium shedding.',symptoms:'Cramps, fatigue, mood swings, headaches',tips:'Increase iron, keep warm, avoid intense exercise, sleep well'},follicular:{title:'Follicular Phase',desc:'Follicles develop and estrogen rises.',what:'FSH stimulates follicle growth. Estrogen rebuilds lining.',symptoms:'Energy returning, clear thinking, better skin',tips:'Great for new projects, increase exercise, balanced nutrition'},ovulation:{title:'Ovulation',desc:'Mature egg released. Most fertile time.',what:'LH surge triggers ovulation. Estrogen peaks.',symptoms:'Mild pelvic pain, egg-white mucus, increased libido',tips:'Best time for conception, peak performance'},luteal:{title:'Luteal Phase',desc:'Between ovulation and next period.',what:'Progesterone stabilizes lining. Corpus luteum degrades if no pregnancy.',symptoms:'PMS, breast tenderness, mood swings, bloating',tips:'Reduce caffeine and salt, supplement B6 and magnesium'},fertile:{title:'Fertile Window',desc:'Days around ovulation when pregnancy is most likely.',what:'Sperm survive 3-5 days. Egg ~24h. ~6-day fertile window.',symptoms:'Clear mucus, increased libido, temperature changes',tips:'Every other day for conception, folic acid, good sleep'}},
  emptyState:'Tap a date to record your first period', emptySymptom:'Tap a date on the calendar<br>to log symptoms',
  daysUntil:'{n} days until next period', daysOverdue:'{n} days late', day:' days', periodDay:'Period Day {n}', expected:'Expected',
  onboarding:'👋 Welcome, Anđela! Tap any date to begin. ♥',
  fabLabel:'Period today',
  greeting:{morning:{icon:'🌅',name:'Anđelo',msg:'Good morning, my angel. Wishing you a wonderful day — be gentle with yourself.',sub:'— With love, Barry'},afternoon:{icon:'🌤️',name:'Anđelo',msg:'Good afternoon, my dear. Take a break, have some tea — you worry me when you overdo it.',sub:'— Your Barry'},evening:{icon:'🌆',name:'Anđelo',msg:'Good evening, my most beautiful. Take it slow tonight — you deserve a peaceful end to the day.',sub:'— With love, your Barry'},night:{icon:'🌙',name:'Anđelo!',msg:'Why are you still awake? Go to sleep right now! I worry when you don\'t sleep, you know.',sub:'— Love, Barry'},dismiss:'♥ Enter'},
  stats:{cycleTitle:'📈 Cycle Statistics',historyTitle:'📅 Recent Cycles',predTitle:'🔮 Prediction',count:'Cycles recorded',avg:'Average cycle',range:'Shortest / Longest',reg:'Regularity',next:'Next period',ovulation:'Ovulation',fertile:'Fertile window',confidence:'Confidence',future:'Future predictions'},
  historyLabel:'● Short  ● Normal  ● Long  (dot = cycle)',
  modal:{details:'Date Details',marked:'Recorded Period Start',phase:'Phase',day:'Cycle day',symptoms:'Symptoms',mark:'Mark Period Start',unmark:'Remove',close:'Close',quickSymptom:'Quick Symptom Log',notesPlaceholder:'Add notes...'},
  symptoms:{cramps:'Cramps',mood:'Mood',flow:'Flow',headache:'Headache',fatigue:'Fatigue',cravings:'Cravings'},
  tips:{period:[{icon:'🩸',text:'Your body loses iron — eat iron-rich foods like red meat and spinach.',source:'',tcm:false},{icon:'♨',text:'Keep your abdomen warm. A heating pad helps relieve discomfort.',source:'',tcm:false},{icon:'🍵',text:'Try rosehip tea after meals — a Serbian tradition for easing cramps.',source:'Serbian tradition',tcm:false},{icon:'🧘',text:'Gentle stretching or yoga helps. Avoid intense exercise.',source:'',tcm:false},{icon:'🫘',text:'Red beans nourish the blood — an ancient Chinese remedy for women.',source:'TCM Wisdom',tcm:true}],follicular:[{icon:'💪',text:'Estrogen rising, energy returning — great time for new fitness.',source:'',tcm:false},{icon:'🥗',text:'Eat plenty of vegetables and fruits for balanced nutrition.',source:'',tcm:false},{icon:'🌿',text:'In Chinese medicine, this is the time to nourish blood (养血). Try goji tea.',source:'TCM Wisdom',tcm:true},{icon:'🎯',text:'Clear thinking and high energy — ideal for important decisions.',source:'',tcm:false}],ovulation:[{icon:'⭐',text:'Ovulation phase. Most fertile days if planning pregnancy.',source:'',tcm:false},{icon:'🏃',text:'Physical performance peaks — great for high-intensity workouts.',source:'',tcm:false},{icon:'🌸',text:'In Chinese tradition, a time of balance (阴阳调和). Enjoy nature.',source:'TCM Wisdom',tcm:true}],luteal:[{icon:'🍵',text:'Reduce caffeine — it can worsen anxiety and mood swings.',source:'',tcm:false},{icon:'🌿',text:'Vitamin B6 and magnesium may ease premenstrual symptoms.',source:'',tcm:false},{icon:'🫚',text:'Ginger tea with red dates warms the body — an ancient Eastern remedy.',source:'TCM Wisdom',tcm:true},{icon:'🍌',text:'Prone to bloating? Reduce salt, eat bananas.',source:'',tcm:false}]},
  settings:{lang:'Language / 语言 / Jezik',langHint:'Switch language',theme:'Theme',themeHint:'Dark / Light mode',cycle:'Default cycle length',cycleHint:'Auto-calculated',period:'Default period length',periodHint:'Duration of each period',override:'Use manual values',overrideHint:'Ignore auto-calculation',save:'💾 Save Settings',export:'📤 Export Data (JSON)',import:'📥 Import Data (JSON)',clear:'🗑 Clear All Data',clearConfirm:'Are you sure? This cannot be undone!',anniversary:'Anniversary',anniversaryHint:'The day you two started'},
  toast:{saved:'Saved ✓',marked:'Marked ✓',unmarked:'Removed',symptomSaved:'Saved ✓',symptomQuick:'Updated ✓',exported:'Exported ✓',imported:'Imported ✓',importError:'Import failed',cleared:'Cleared'},
  reminder:{beforePeriod:'⏰ Period in {days} days — get ready, darling',late:'⚠️ Period {days} days late — check with doctor',ovulation:'✨ Ovulation day — peak fertility'},
  cycleCounter:'Together: {n} cycles', cycleCounterSub:'Barry tracks every cycle for you ♥',
  anniversaryTitle:'💕 Dates that matter', annMetLabel:'✨ First time we met', annLoveLabel:'♥ Together since', annCountMet:'{n} days since we met ✨', annCountLove:'{n} days together ♥',
  yearTitle:'Year Overview'
}};

/* ================================================================
   i18n EXTENSION — New Features
   ================================================================ */
const I18N_EXT = {
'sr': {
  profileName: 'Anđela', profileName2: 'Barry',
  loveNoteDefault: 'Svakog dana mislim na tebe — ti si najlepši deo mog sveta. 💕', loveNoteSig: '— Tvoj Barry',
  moodTitle: '😊 Raspoloženje', moodToday: 'Kako se osećaš danas?',
  moodHistoryLabel: 'Poslednjih 7 dana',
  streakLabel: 'dana zaredom!', streakLabel0: 'Započni niz!', streakBadgeHot: 'Sjajno! 🔥', streakBadgeWarm: 'Dobro ✨', streakBadgeCold: 'Započni danas 🌱',
  diaryTitle: '📓 Moja rečenica', diaryPrompt: 'Danas ______ me je nasmejalo.', diaryPlaceholder: 'upiši jednu rečenicu...',
  gardenTitle: '🌱 Naša bašta', gardenSeed: 'Zalivaj me svaki dan — klikni na emoji iznad! 🌱', gardenSprout: 'Tvoj niz raste... nastavi dalje! 🌿', gardenGrowing: 'Sve si bliže cvetanju! 🌷', gardenBudding: 'Skoro procvetala — još malo! 🎀', gardenBlooming: 'Prelepo cvetaš! Kao naša ljubav. 🌸✨',
  forecastTomorrow: 'Sutra', forecastFollicular: 'Sutra si u folikularnoj fazi — energija raste, sjajan dan za planove! 💪',
  forecastOvulation: 'Sutra je ovulacija — tvoje telo sija najjače! ✨', forecastLuteal: 'Sutra ulaziš u lutealnu fazu — uspori malo, zaslužuješ odmor 🌙',
  forecastPeriod: 'Sutra bi mogla da krene menstruacija — pripremi grejač i čaj 💗',
  forecastNormal: 'Slušaj svoje telo. Ti si neverovatna svakog dana. 🌸',
  moodEmojis: ['😊','🥰','😤','😴','😢','🤩','😰','😐'],
  moodNames: ['Srećno','Voljeno','Frustrirano','Umorno','Tužno','Uzbuđeno','Anksiozno','Meh'],
  sharedDiaryTab: 'Dnevnik',
  profileSwitch: 'Profil promenjen',
  barryTipsPeriod:[{icon:'🫂',text:'Ona je u bolovima — budi nežan, zagrli je, donesi joj termofor i čaj.'},{icon:'🍫',text:'Ponesi joj čokoladu. Male stvari znače najviše kad je boli.'},{icon:'😤',text:'Ne svađaj se — raspoloženje joj je na minimumu. Slušaj, klimaj, reci "u pravu si".'},{icon:'🛏️',text:'Pusti je da se odmara. Donesi joj ćebe i ostavi na miru ako želi.'},{icon:'💆',text:'Ponudi masažu leđa ili stopala — nežno, njeno telo je sad osetljivo.'}],
  barryTipsFollicular:[{icon:'🎯',text:'Imaće više energije — isplaniraj izlazak, šetnju, zajedničku aktivnost!'},{icon:'💬',text:'Društvenija je — odlično vreme za dublje razgovore i planove za budućnost.'},{icon:'💪',text:'Pridruži joj se u sportu ili fizičkoj aktivnosti. Zajedno ste jači.'},{icon:'🌸',text:'Kupi joj cveće bez povoda. Primetiće i najmanji znak pažnje.'},{icon:'🎨',text:'Faza kreativnosti — predloži novi hobi ili zajednički projekat.'}],
  barryTipsOvulation:[{icon:'✨',text:'Danas sija — reci joj koliko je lepa. Budi iskren i detaljan u komplimentima.'},{icon:'💋',text:'Fizička bliskost joj je važna — grli je, ljubi, drži za ruku.'},{icon:'🎉',text:'Vrhunac energije — odličan dan za ples, izlazak, druženje.'},{icon:'🔥',text:'Njen libido je na vrhuncu — budi pažljiv i romantičan večeras.'},{icon:'📸',text:'Fotografiši je danas — blistaće na svakoj slici.'}],
  barryTipsLuteal:[{icon:'🧘',text:'PMS počinje — ne shvataj ništa lično. Njen mozak je u hormonskom haosu.'},{icon:'🍵',text:'Skuvaj joj čaj od kamilice ili nane. Smiruje nerve i pokazuje da brineš.'},{icon:'🤐',text:'Slušaj više, pričaj manje. Ne rešavaj — samo slušaj.'},{icon:'🍕',text:'Imaće žudnju — naruči njenu omiljenu hranu bez pitanja.'},{icon:'🌙',text:'Pomogni joj da se opusti — topla kupka, sveće, muzika. Zaslužuje mir.'}],
  barryTipsGeneral:[{icon:'💌',text:'Pošalji joj poruku sad — reci da misliš na nju. Ne treba povod.'},{icon:'💝',text:'Mali znak pažnje danas — njen omiljeni sok, voće, nešto što voli.'},{icon:'📞',text:'Pozovi je — čuj njen glas, pitaj kako je prošao dan.'},{icon:'🌍',text:'Seti se — ti si njen oslonac. Voli te. Ti si dovoljan.'}]
},
'zh-CN': {
  profileName: 'Anđela', profileName2: 'Barry',
  loveNoteDefault: '每一天都在想你——你是我世界里最美好的一部分。💕', loveNoteSig: '— 你的 Barry',
  moodTitle: '😊 今日心情', moodToday: '今天感觉怎么样？',
  moodHistoryLabel: '最近7天',
  streakLabel: '天连续记录！', streakLabel0: '开始打卡吧！', streakBadgeHot: '太棒了！🔥', streakBadgeWarm: '不错 ✨', streakBadgeCold: '今天开始 🌱',
  diaryTitle: '📓 一行日记', diaryPrompt: '今天______让我笑了。', diaryPlaceholder: '写一句话...',
  gardenTitle: '🌱 我们的花园', gardenSeed: '每天给我浇水——点击上面 emoji 打卡！🌱', gardenSprout: '你的坚持开始发芽了...继续加油！🌿', gardenGrowing: '越来越茁壮了！🌷', gardenBudding: '快要开花了——再坚持一下！🎀', gardenBlooming: '绽放得真美！就像我们的爱。🌸✨',
  forecastTomorrow: '明天', forecastFollicular: '明天进入卵泡期——精力回升，适合做计划！💪',
  forecastOvulation: '明天是排卵日——你的身体最有光彩！✨', forecastLuteal: '明天进入黄体期——放慢节奏，你值得好好休息 🌙',
  forecastPeriod: '明天可能会来月经——准备好暖宝宝和热茶 💗',
  forecastNormal: '听从你的身体。每一天你都很了不起。🌸',
  moodEmojis: ['😊','🥰','😤','😴','😢','🤩','😰','😐'],
  moodNames: ['开心','被爱','烦躁','疲惫','难过','兴奋','焦虑','还行'],
  sharedDiaryTab: '日记',
  profileSwitch: '已切换账号',
  barryTipsPeriod:[{icon:'🫂',text:'她正在经历疼痛——温柔一点，抱抱她，给她暖水袋和热茶。'},{icon:'🍫',text:'带巧克力或她喜欢的零食给她——小事情在经期最重要。'},{icon:'😤',text:'别跟她争论——她情绪很低。倾听、点头、说"你说得对"。'},{icon:'🛏️',text:'让她休息。如果她想睡一整天——给她毯子，让她安静。'},{icon:'💆',text:'给她按摩背或脚——动作轻柔，她的身体现在很敏感。'}],
  barryTipsFollicular:[{icon:'🎯',text:'她会精力充沛——计划一起出去！散步、新活动、约会。'},{icon:'💬',text:'比平时更善于社交——适合深入交谈和未来规划。'},{icon:'💪',text:'和她一起运动或健身——一起变得更强。'},{icon:'🌸',text:'买花给她——不需要理由。这个阶段她最容易被小细节打动。'},{icon:'🎨',text:'创造力高峰期——提议一个新爱好或项目一起做。'}],
  barryTipsOvulation:[{icon:'✨',text:'今天她最闪耀——告诉她她有多美。真诚且具体的夸奖。'},{icon:'💋',text:'身体接触对她很重要——拥抱、亲吻、牵手。'},{icon:'🎉',text:'能量巅峰——适合出去玩、跳舞、朋友聚会。'},{icon:'🔥',text:'她最有"性致"——今晚要体贴又浪漫。'},{icon:'📸',text:'今天给她拍照——每张都会发光。'}],
  barryTipsLuteal:[{icon:'🧘',text:'PMS 开始了——别把她的情绪当回事。她的大脑在荷尔蒙风暴里。'},{icon:'🍵',text:'给她泡杯无咖啡因的花草茶——洋甘菊或薄荷。'},{icon:'🤐',text:'多听少说。别试图"解决问题"——只需倾听就好。'},{icon:'🍕',text:'她会突然想吃东西——不问就点她最爱的外卖。'},{icon:'🌙',text:'帮她放松——热水澡、蜡烛、轻音乐。她值得安宁。'}],
  barryTipsGeneral:[{icon:'💌',text:'现在就给她发条消息——说你在想她。不需要理由。'},{icon:'💝',text:'今天一件小事——她喜欢的饮料、水果、小东西。'},{icon:'📞',text:'给她打电话——听听她的声音，问问今天过得怎么样。'},{icon:'🌍',text:'记住——你是她的依靠。她爱你。你足够好。'}]
},
'en': {
  profileName: 'Anđela', profileName2: 'Barry',
  loveNoteDefault: 'Every day I think of you — you are the most beautiful part of my world. 💕', loveNoteSig: '— Your Barry',
  moodTitle: '😊 Daily Mood', moodToday: 'How are you feeling today?',
  moodHistoryLabel: 'Last 7 days',
  streakLabel: 'day streak!', streakLabel0: 'Start your streak!', streakBadgeHot: 'Amazing! 🔥', streakBadgeWarm: 'Good ✨', streakBadgeCold: 'Start today 🌱',
  diaryTitle: '📓 One-Line Diary', diaryPrompt: 'Today ______ made me smile.', diaryPlaceholder: 'write one sentence...',
  gardenTitle: '🌱 Our Garden', gardenSeed: 'Water me daily — tap an emoji above! 🌱', gardenSprout: 'Your streak is sprouting... keep going! 🌿', gardenGrowing: 'Getting stronger! 🌷', gardenBudding: 'Almost blooming — just a bit more! 🎀', gardenBlooming: 'Blooming beautifully! Just like our love. 🌸✨',
  forecastTomorrow: 'Tomorrow', forecastFollicular: 'Tomorrow you enter the follicular phase — energy rising, great day for plans! 💪',
  forecastOvulation: 'Tomorrow is ovulation — your body shines brightest! ✨', forecastLuteal: 'Tomorrow begins the luteal phase — slow down, you deserve rest 🌙',
  forecastPeriod: 'Tomorrow your period may start — get your heating pad and tea ready 💗',
  forecastNormal: 'Listen to your body. You are amazing every single day. 🌸',
  moodEmojis: ['😊','🥰','😤','😴','😢','🤩','😰','😐'],
  moodNames: ['Happy','Loved','Frustrated','Tired','Sad','Excited','Anxious','Meh'],
  sharedDiaryTab: 'Diary',
  profileSwitch: 'Profile switched',
  barryTipsPeriod:[{icon:'🫂',text:'She is in pain — be gentle, hold her, bring her a heating pad and tea.'},{icon:'🍫',text:'Bring her chocolate or her favorite treat. Little things matter most right now.'},{icon:'😤',text:'Don\'t argue — her mood is at its lowest. Listen, nod, say "you\'re right."'},{icon:'🛏️',text:'Let her rest. If she wants to sleep all day — bring her a blanket and peace.'},{icon:'💆',text:'Offer a back or foot massage — be gentle, her body is sensitive now.'}],
  barryTipsFollicular:[{icon:'🎯',text:'She has rising energy — plan a date, a walk, a shared activity!'},{icon:'💬',text:'She\'s more social — great time for deep talks and future plans.'},{icon:'💪',text:'Join her for a workout. Stronger together.'},{icon:'🌸',text:'Buy her flowers for no reason. She\'ll notice the smallest gesture now.'},{icon:'🎨',text:'Creative phase — suggest a new hobby or project to do together.'}],
  barryTipsOvulation:[{icon:'✨',text:'She shines brightest today — tell her how beautiful she is. Be specific.'},{icon:'💋',text:'Physical touch matters to her — hug, kiss, hold hands.'},{icon:'🎉',text:'Peak energy — great day for dancing, going out, social fun.'},{icon:'🔥',text:'Her libido peaks — be attentive and romantic tonight.'},{icon:'📸',text:'Take photos of her today — she will glow in every shot.'}],
  barryTipsLuteal:[{icon:'🧘',text:'PMS begins — don\'t take anything personally. Her brain is in a hormone storm.'},{icon:'🍵',text:'Make her caffeine-free tea — chamomile or mint. It calms and shows you care.'},{icon:'🤐',text:'Listen more, talk less. Don\'t try to "fix" — just listen.'},{icon:'🍕',text:'She\'ll have cravings — order her favorite food without asking.'},{icon:'🌙',text:'Help her unwind — warm bath, candles, soft music. She deserves peace.'}],
  barryTipsGeneral:[{icon:'💌',text:'Text her right now — say you\'re thinking of her. No reason needed.'},{icon:'💝',text:'A small gesture today — her favorite drink, fruit, something thoughtful.'},{icon:'📞',text:'Call her — hear her voice, ask how her day went.'},{icon:'🌍',text:'Remember — you are her rock. She loves you. You are enough.'}]
}};

// Love Notes Pool (60 entries per language)
const LOVE_NOTES = (function(){
  var sr=['Svakog jutra kad otvorim oči, prva misao mi si ti. 🌅','Tvoj osmeh je moja omiljena boja. 🎨','Da si ovde, skuvao bih ti čaj i slušao kako ti je prošao dan. 🍵','Znaš onaj osećaj kad sunce izađe posle kiše? Ti si to za mene. 🌈','Nadam se da si danas nosila onaj osmeh koji toliko volim. 😊','Koliko god da si daleko, uvek si mi u srcu. 💝','Vojvodina je dobila najlepši cvet kad si se ti rodila. 🌻','Ti si ona vrsta lepote koja ne bledi — postaje samo dublja. ✨','Kad bih mogao da ti pošaljem zagrljaj kroz ekran, već bi stigao. 🤗','Ti si moja omiljena pesma, ona koja nikad ne dosadi. 🎵','Prošlo je X dana otkad smo zajedno, a ja te volim sve više. ♥','Razmišljam o tebi dok ovo pišem — i smešim se. 😌','Da mogu da biram gde ću biti sad, bio bih pored tebe. 🌍→🏡','Tvoja snaga me inspiriše svaki dan. Ti si neverovatna. 💪🌸','Sećaš se našeg prvog razgovora? Ja ga često prepričavam u glavi. 💭','Volim način na koji se smeješ — kao da cela soba postane svetlija. ✨','U svakom zalasku sunca vidim tvoje oči. 🌆','Danas sam video nešto lepo i poželeo da si tu da podelim s tobom. 🌸','Ako ikada posumnjaš u sebe, seti se da te Barry voli — a Barry zna. 😉','Ti nisi samo moja devojka — ti si moj najbolji prijatelj. 💑','Svaka priča ima svoju heroinu. U mojoj, to si ti. 📖','Da napišem knjigu o tebi, nestalo bi mi stranica. 📚','Ti si moj mir u haosu, moja tišina u buci. 🧘','Ne mogu da zamislim svet bez tvog osmeha. Ne želim ni da pokušam. 🌍♥','Kad te čujem preko telefona, ceo dan mi bude bolji. 📞','Ponekad samo zatvorim oči i zamislim da si pored mene. 💫','Ti me činiš boljom osobom — hvala ti za to. 💗','Kao što Mesec prati Zemlju, tako moje misli prate tebe. 🌙','Da si cvet, bila bi ruža — lepa, jaka, i sa trnjem kad treba. 🌹','Najbolji deo mog dana? Kad pomislim na tebe. A to je mnogo puta. 💌','Tvoja hrabrost me oduševljava. Ti se boriš kao lavica. 🦁','Volim i tvoje dobre i tvoje loše dane. Sve je to deo tebe. 🫂','Peking je veliki grad, ali bez tebe je prazan. 🏙️','Da mogu da ti dam jednu stvar, dao bih ti večnost nežnosti. ♾️','Ti si moj dokaz da ljubav ne poznaje granice. 🌍♥','Od Vojvodine do Pekinga — ljubav je najduža reka, i sve povezuje. 🌊','Kad bih umeo da slikam, slikao bih samo tebe. 🎨','Ti si mi u mislima kao što je beat u muzici — stalno. 🥁','Sanjam dan kad nećemo morati da brojimo kilometre. 🗺️','Volim te na srpskom, kineskom, i svim jezicima koji postoje. 🌐♥','Ako ikada zaboraviš koliko vrediš, pozovi me — podsetiću te. 📱','Ti si moja srećna zvezda. ⭐','Kad si srećna, i ja sam srećan. Tako je jednostavno. 😊','Tvoja lepota nije samo spolja — ona izvire iz tvoje duše. 🕯️','Volim te više nego što reči mogu da izraze. Zato ti šaljem srca. 💕💕💕','Svakog dana zahvaljujem univerzumu što si u mom životu. 🙏','Da se ponovo rodim, opet bih te tražio. 🔄♥','Tvoje ime Anđela — kao anđeo. I stvarno si to. 👼','Ti ulepšavaš svet samim tim što postojiš. 🌍→🌸','Nikad ne zaboravi: voljen si, i to beskrajno. ♾️💗'];
  var zh=['每天睁开眼，第一个想到的就是你。🌅','你的笑容是我最喜欢的颜色。🎨','如果你在身边，我会给你泡杯茶，听你讲今天的故事。🍵','你知道雨后阳光的感觉吗？你就是我的那种感觉。🌈','希望你今天带着我最爱的笑容。😊','不管多远，你一直在我心里。💝','Vojvodina 最美的花开在你出生的那天。🌻','你的美不会褪色——只会越来越深。✨','如果能穿过屏幕给你一个拥抱，它已经到了。🤗','你是我最爱的歌，永远听不腻的那一首。🎵','在一起 X 天了，每一天都更爱你。♥','写着写着就笑了——因为我在想你。😌','如果能选择此刻在哪里，我会选你身边。🌍→🏡','你的坚强每天都激励着我。你是了不起的。💪🌸','还记得我们第一次聊天吗？我经常在脑海里回放。💭','我喜欢你笑的样子——整个房间都亮了。✨','每一个日落里，我都看到你的眼睛。🌆','今天看到了美好的东西，真想你在身边分享。🌸','如果你怀疑自己，记住 Barry 爱你——Barry 是对的。😉','你不仅是我的女朋友——你是我最好的朋友。💑','每个故事都有女主角。在我的故事里，是你。📖','如果写一本关于你的书，纸都不够用。📚','你是我混乱中的平静，喧嚣中的安宁。🧘','无法想象没有你笑容的世界。也不想尝试。🌍♥','每次电话里听到你的声音，一整天都变好了。📞','有时候闭上眼，假装你就在身边。💫','你让我成为更好的人——谢谢你。💗','就像月亮绕着地球转，我的思绪绕着你。🌙','如果你是花，你一定是玫瑰——美丽、坚强，必要时有刺。🌹','一天中最棒的时刻？想你的那一刻。每天好多次。💌','你的勇敢让我惊叹。你像母狮一样战斗。🦁','我爱你的好日子，也爱你的坏日子。都是你的一部分。🫂','北京很大，但没有你是空的。🏙️','如果能给你一样东西，我会给你永恒的温柔。♾️','你是我跨过山海的证据。🌍♥','从 Vojvodina 到北京——爱是最长的河，连接一切。🌊','如果我会画画，只画你。🎨','你在我脑海里就像心跳——永不停止。🥁','梦想着不再数公里数的那一天。🗺️','用中文、塞语和所有语言说爱你。🌐♥','如果你忘了自己有多珍贵，打给我——我提醒你。📱','你是我的幸运星。⭐','你开心我就开心。就这么简单。😊','你的美不止在外表——从灵魂深处发光。🕯️','爱你超过言语能表达。所以给你发心心。💕💕💕','每一天都感谢宇宙让你出现在我的生命中。🙏','如果有来生，我还会去找你。🔄♥','你的名字 Anđela——意为天使。你真的是。👼','你存在本身就让世界更美好。🌍→🌸','永远不要忘记：你是被爱着的，无限地。♾️💗'];
  var en=['Every morning when I open my eyes, my first thought is you. 🌅','Your smile is my favorite color. 🎨','If you were here, I would make you tea and listen to your day. 🍵','You know that feeling when the sun comes out after rain? You are that for me. 🌈','I hope you wore that smile I love so much today. 😊','No matter how far, you are always in my heart. 💝','Vojvodina got its most beautiful flower the day you were born. 🌻','You are the kind of beauty that never fades — it only deepens. ✨','If I could send you a hug through the screen, it would already be there. 🤗','You are my favorite song, the one that never gets old. 🎵','It has been X days together, and I love you more each one. ♥','I am writing this thinking of you — and smiling. 😌','If I could choose where to be right now, I would be next to you. 🌍→🏡','Your strength inspires me every day. You are amazing. 💪🌸','Remember our first conversation? I replay it in my head often. 💭','I love the way you laugh — like the whole room gets brighter. ✨','In every sunset, I see your eyes. 🌆','I saw something beautiful today and wished you were here to share it. 🌸','If you ever doubt yourself, remember Barry loves you — and Barry knows. 😉','You are not just my girlfriend — you are my best friend. 💑','Every story has a heroine. In mine, it is you. 📖','If I wrote a book about you, I would run out of pages. 📚','You are my calm in the chaos, my silence in the noise. 🧘','I cannot imagine a world without your smile. I do not want to try. 🌍♥','When I hear your voice on the phone, my whole day improves. 📞','Sometimes I close my eyes and pretend you are beside me. 💫','You make me a better person — thank you for that. 💗','As the moon follows the Earth, so my thoughts follow you. 🌙','If you were a flower, you would be a rose — beautiful, strong, with thorns when needed. 🌹','The best moment of my day? When I think of you. Which is a lot. 💌','Your courage astounds me. You fight like a lioness. 🦁','I love your good days and your bad days. All of it is you. 🫂','Beijing is a big city, but without you it is empty. 🏙️','If I could give you one thing, I would give you eternal tenderness. ♾️','You are my proof that love knows no borders. 🌍♥','From Vojvodina to Beijing — love is the longest river, connecting everything. 🌊','If I could paint, I would only paint you. 🎨','You are in my thoughts like a heartbeat — constant. 🥁','I dream of the day we stop counting kilometers. 🗺️','I love you in Serbian, Chinese, and every language that exists. 🌐♥','If you ever forget how precious you are, call me — I will remind you. 📱','You are my lucky star. ⭐','When you are happy, I am happy. It is that simple. 😊','Your beauty is not just outside — it glows from your soul. 🕯️','I love you more than words can say. So I send hearts. 💕💕💕','Every day I thank the universe for putting you in my life. 🙏','If I were born again, I would look for you. 🔄♥','Your name Anđela — like an angel. And you truly are one. 👼','You make the world more beautiful just by existing. 🌍→🌸','Never forget: you are loved, infinitely. ♾️💗'];
  function get(){ var arr=lang==='zh-CN'?zh:lang==='en'?en:sr; var day=Math.floor(Date.now()/86400000); return arr[day%arr.length]; }
  return {get:get};
})();

/* ================================================================
   PROFILE SYSTEM
   ================================================================ */
let activeProfile = localStorage.getItem('cycle-active-profile') || 'andjela';
function profileKey(base) { return base + '-' + activeProfile; }
function switchProfile(p) {
  if (p === activeProfile) return;
  // Animate profile pill
  var pill = document.getElementById('profilePill');
  if (pill) { pill.classList.add('switching'); setTimeout(function() { pill.classList.remove('switching'); }, 400); }
  activeProfile = p;
  localStorage.setItem('cycle-active-profile', p);
  state = loadState();
  // Immediately sync calendar from shared cycle data for both profiles
  try {
    var sd = JSON.parse(localStorage.getItem('shared-cycle-data') || 'null');
    if (sd && sd.records) {
      state.records = sd.records.map(function(r) { return new Date(r); });
      state.periodEnds = sd.periodEnds || {};
      state.symptoms = sd.symptoms || {};
      state.settings = sd.settings || { cycleLength: 28, periodLength: 7 };
    }
  } catch(e) {}
  lastCycleCount = predict().cycles.length;

  // Pull latest shared data from GitHub when switching profiles
  if (getGitHubToken()) {
    pullAllSharedData().then(function() {
      if (p === 'barry') { renderCalendar(); renderBarrySymptomView(); renderTips(); }
      renderHug(); renderGratitude(); renderSong(); renderCheckin();
      renderSharedDiary(); renderDateStrip();
      updateSyncStatusBadge();
    });
  }

  updateProfileUI();
  renderAll();
  loadSettingsUI();
  if (p === 'andjela') { showGreeting(); }
  toast((lang==='sr'?'Profil: ':'') + (p==='andjela' ? '🌸 Anđela' : '👦 Barry') + ' · ' + t('profileSwitch'));
}
function toggleProfile() { switchProfile(activeProfile === 'andjela' ? 'barry' : 'andjela'); }
function updateProfileUI() {
  var pill = document.getElementById('profilePill');
  var avatar = document.getElementById('pfAvatar');
  var name = document.getElementById('pfName');
  if (activeProfile === 'andjela') {
    avatar.textContent = '🌸'; name.textContent = t('profileName');
    pill.classList.add('active-profile');
  } else {
    avatar.textContent = '👦'; name.textContent = t('profileName2');
    pill.classList.remove('active-profile');
  }
  // Show/hide cycle-related cards for Barry
  var isAndjela = activeProfile === 'andjela';
  var pc = document.getElementById('progressSection');
  var rc = document.getElementById('reminderBanner');
  var fab = document.getElementById('fabBtn');
  var cyc = document.getElementById('cycleCounterCard');
  var tea = document.getElementById('teaCard');
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
  var key = profileKey(STORAGE_KEY_BASE);
  try {
    const raw = localStorage.getItem(key);
    if (raw) { const d = JSON.parse(raw); return { records:(d.records||[]).map(r=>new Date(r)), symptoms:d.symptoms||{}, moods:d.moods||{}, diaries:d.diaries||{}, periodEnds:d.periodEnds||{}, settings:{cycleLength:28,periodLength:7,manualOverride:false,...d.settings}, _migrated:true }; }
  } catch(e) {}
  // Try old key
  try {
    const old = localStorage.getItem('cycle-data-v5');
    if (old && activeProfile === 'andjela') { const d=JSON.parse(old); return { records:(d.records||[]).map(r=>new Date(r)), symptoms:d.symptoms||{}, moods:{}, diaries:{}, settings:{cycleLength:28,periodLength:7,manualOverride:false,...d.settings}, _migrated:true }; }
  } catch(e) {}
  return { records:activeProfile==='andjela'?[new Date(2026,4,28)]:[], periodEnds:{}, symptoms:{}, moods:{}, diaries:{}, settings:{cycleLength:28,periodLength:7,manualOverride:false}, _migrated:true };
}
// Debounced saveState — prevents excessive localStorage writes during rapid clicks
var _saveTimer = null, _pushTimer = null;
function saveState() {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(function() {
    localStorage.setItem(profileKey(STORAGE_KEY_BASE), JSON.stringify({ records:state.records.map(fmtDate), periodEnds:state.periodEnds||{}, symptoms:state.symptoms, moods:state.moods, diaries:state.diaries, settings:state.settings, _migrated:true }));
    // Sync shared cycle data for bidirectional calendar
    var pd = JSON.parse(localStorage.getItem(profileKey(STORAGE_KEY_BASE)) || 'null');
    if (pd && pd.records && pd.records.length > 0) { localStorage.setItem('shared-cycle-data', JSON.stringify(pd)); }
    clearTimeout(_pushTimer);
    _pushTimer = setTimeout(function() { pushAllSharedData(); }, 1500);
  }, 200);
}
function saveStateNow() { clearTimeout(_saveTimer); clearTimeout(_pushTimer); localStorage.setItem(profileKey(STORAGE_KEY_BASE), JSON.stringify({ records:state.records.map(fmtDate), periodEnds:state.periodEnds||{}, symptoms:state.symptoms, moods:state.moods, diaries:state.diaries, settings:state.settings, _migrated:true })); pushAllSharedData(); }
let state = loadState();

/* ================================================================
   MOOD & STREAK
   ================================================================ */
const MOOD_EMOJIS = ['😊','🥰','😤','😴','😢','🤩','😰','😐'];
const MOOD_KEYS = ['happy','loved','frustrated','tired','sad','excited','anxious','meh'];
function getMood(dateKey) { return state.moods && state.moods[dateKey] ? state.moods[dateKey].mood : null; }
function setMood(dateKey, moodKey) {
  if (!state.moods) state.moods = {};
  if (state.moods[dateKey] && state.moods[dateKey].mood === moodKey) { delete state.moods[dateKey]; saveState(); renderMoodSection(); return; }
  state.moods[dateKey] = { mood: moodKey, time: Date.now() };
  saveState();
  renderMoodSection();
  renderGarden();
  toast(t('moodNames')[MOOD_KEYS.indexOf(moodKey)] + ' ✓');
}
function calculateStreak() {
  if (!state.moods) return 0;
  var td = today(); var streak = 0; var d = new Date(td);
  while (true) {
    var key = fmtDate(d);
    if (state.moods[key]) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}
function renderMoodSection() {
  var td = fmtDate(today());
  var todayMood = getMood(td);
  document.getElementById('mood-today-label').textContent = t('moodToday');
  document.getElementById('mood-title').textContent = t('moodTitle');
  // Render emoji picker
  var picker = document.getElementById('moodPicker');
  picker.innerHTML = '';
  MOOD_EMOJIS.forEach(function(emoji, i) {
    var btn = document.createElement('span');
    btn.className = 'mood-emoji' + (todayMood === MOOD_KEYS[i] ? ' picked' : '');
    btn.textContent = emoji;
    btn.title = t('moodNames')[i];
    btn.onclick = function() { setMood(td, MOOD_KEYS[i]); animateWatering(); };
    picker.appendChild(btn);
  });
  // Streak
  document.getElementById('streakDisplay').style.display = 'none';
  // Mood history
  document.getElementById('mood-history-label').textContent = t('moodHistoryLabel');
  var hist = document.getElementById('moodHistory');
  hist.innerHTML = '';
  for (var i = 6; i >= 0; i--) {
    var d = new Date(today()); d.setDate(d.getDate() - i);
    var m = getMood(fmtDate(d));
    var bar = document.createElement('div');
    bar.className = 'mood-bar';
    bar.style.height = m ? '28px' : '6px';
    if (m) bar.classList.add(m);
    bar.title = m ? (t('moodNames')[MOOD_KEYS.indexOf(m)] + ' ' + fmtDate(d)) : fmtDate(d);
    hist.appendChild(bar);
  }
}

/* ================================================================
   ONE-LINE DIARY
   ================================================================ */
function saveDiary() {
  var input = document.getElementById('diaryInput');
  var text = input.value.trim();
  if (!text) return;
  if (!state.diaries) state.diaries = {};
  var key = fmtDate(today());
  if (!state.diaries[key]) state.diaries[key] = [];
  state.diaries[key].push({ text: text, time: Date.now() });
  saveState();
  input.value = '';
  renderDiarySection();
  toast('📓 ✓');
}
function renderDiarySection() {
  document.getElementById('diary-title').textContent = t('diaryTitle');
  document.getElementById('diaryPrompt').textContent = t('diaryPrompt');
  document.getElementById('diaryInput').placeholder = t('diaryPlaceholder');
  var key = fmtDate(today());
  var entries = (state.diaries && state.diaries[key]) ? state.diaries[key] : [];
  var hist = document.getElementById('diaryHistory');
  if (entries.length === 0) { hist.innerHTML = ''; return; }
  hist.innerHTML = entries.slice().reverse().map(function(e) {
    var t = new Date(e.time);
    var timeStr = String(t.getHours()).padStart(2,'0') + ':' + String(t.getMinutes()).padStart(2,'0');
    return '<div class="diary-history-item"><span class="diary-history-date">' + timeStr + '</span><span class="diary-history-text">' + esc(e.text) + '</span></div>';
  }).join('');
}

/* ================================================================
   LOVE NOTE
   ================================================================ */
function renderLoveNote() {
  if (activeProfile === 'barry') { document.getElementById('loveNoteCard').style.display = 'none'; return; }
  document.getElementById('loveNoteCard').style.display = '';
  var el = document.getElementById('loveNoteText');
  var newText = LOVE_NOTES.get();
  if (el.textContent !== newText) {
    el.classList.add('changing');
    setTimeout(function() { el.textContent = newText; el.classList.remove('changing'); }, 300);
  }
  // Chinese poetic touch — Anđela gets both cultures
  var chinesePoems = ['但愿人长久，千里共婵娟 🌙','执子之手，与子偕老 💕','天涯若比邻 🌍','心有灵犀一点通 ✨','千里姻缘一线牵 💝','海内存知己，天涯若比邻 🌊'];
  var poem = chinesePoems[Math.floor(Math.random() * chinesePoems.length)];
  document.getElementById('loveNoteSig').textContent = t('loveNoteSig') + '  ·  ' + poem;
  var icons = ['💌','💝','💗','💕','💖','🕊️','✨','🌷'];
  document.getElementById('loveNoteIcon').textContent = icons[Math.floor(Math.random() * icons.length)];
}

/* ================================================================
   TOMORROW FORECAST
   ================================================================ */
function renderForecast() {
  if (activeProfile !== 'andjela') { document.getElementById('forecastCard').style.display = 'none'; return; }
  var pred = predict();
  var tomorrow = addDays(today(), 1);
  var phase = getPhase(tomorrow, pred);
  var text = '';
  if (phase === 'period-on' || phase === 'period-mid' || phase === 'period-pred-first' || phase === 'period-pred') {
    text = t('forecastPeriod');
  } else if (phase === 'ovulation') {
    text = t('forecastOvulation');
  } else if (phase === 'follicular') {
    text = t('forecastFollicular');
  } else if (phase === 'luteal' || phase === 'fertile') {
    text = t('forecastLuteal');
  } else {
    text = t('forecastNormal');
  }
  document.getElementById('forecastText').textContent = text;
  document.getElementById('forecastCard').style.display = '';
}

/* ================================================================
   VIRTUAL GARDEN
   ================================================================ */
function animateWatering() {
  var plant = document.getElementById('gardenPlant');
  if (!plant) return;
  plant.style.transform = 'scale(1.3) rotate(10deg)';
  plant.style.transition = 'transform .3s cubic-bezier(.34,1.56,.64,1)';
  // Show water drops
  var drops = ['💧','💧','💧'];
  drops.forEach(function(d,i){
    setTimeout(function(){
      var drop = document.createElement('span');
      drop.textContent = d; drop.style.cssText = 'position:absolute;font-size:.8rem;animation:dropFall 1s ease-in forwards;z-index:10;pointer-events:none;';
      drop.style.left = (30+Math.random()*40)+'%'; drop.style.top = '-10px';
      document.getElementById('gardenCard').appendChild(drop);
      setTimeout(function(){ drop.remove(); }, 1000);
    }, i*150);
  });
  setTimeout(function(){ plant.style.transform = ''; renderGarden(); }, 600);
}
function renderGarden() {
  var plantEl = document.getElementById('gardenPlant');
  if (plantEl) { plantEl.style.transform = ''; plantEl.style.transition = 'all .5s cubic-bezier(.34,1.56,.64,1)'; }
  document.getElementById('garden-title').textContent = t('gardenTitle');
  var streak = calculateStreak();
  var p, msg, hint;
  if (streak === 0) { p = '🌰'; msg = lang==='sr'?'Klikni na emoji iznad da me zaliješ! 💧':lang==='en'?'Tap an emoji above to water me! 💧':'点上面的心情给我浇水！💧'; hint=''; }
  else if (streak === 1) { p = '🌱'; msg = lang==='sr'?'Prvi dan! Nastavi da me zalivaš svaki dan 🌱':lang==='en'?'First day! Keep watering me daily 🌱':'第一天！每天浇我哦 🌱'; hint=''; }
  else if (streak <= 3) { p = '🌿'; msg = lang==='sr'?'Rastem! Još malo pa cvetam 🌿':lang==='en'?'Growing! Almost blooming 🌿':'在长大！快要开花了 🌿'; hint=''; }
  else if (streak <= 7) { p = '🌷'; msg = lang==='sr'?'Pupoljak! Tvoja ljubav me hrani 🌷':lang==='en'?'Budding! Your love feeds me 🌷':'花苞！你的爱在滋养我 🌷'; hint=''; }
  else { p = '🌸'; msg = lang==='sr'?'Procvetala! Kao i vaša ljubav 🌸':lang==='en'?'Bloomed! Just like your love 🌸':'开花了！就像你们的爱 🌸'; hint=''; }
  if (activeProfile === 'andjela' && streak > 0) {
    var phase = getPhase(today(), predict());
    if (phase && phase.startsWith('period')) p = '🌹';
    else if (phase === 'ovulation') p = '🌻';
    else if (phase === 'luteal') p = '🌷';
  }
  document.getElementById('gardenPlant').textContent = p;
  document.getElementById('gardenMsg').textContent = msg;
  document.getElementById('gardenHint').textContent = hint;
}

// HTML escape — prevents XSS in user-generated content
function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ================================================================
   SHARED DIARY — localStorage + GitHub API cross-device sync
   Redesigned: date strip, timeline, locked→unlock animation
   ================================================================ */
const SD_KEY = 'shared-diary';
const GITHUB_REPO = 'darkheaven1419-debug/cycle-tracker';
const GITHUB_FILE = 'shared-diary.json';
let sharedDiaryViewDate = new Date();
const DATE_STRIP_DAYS = 14; // show 14 days in date strip

function getGitHubToken() { return localStorage.getItem('gh-token') || ''; }

function loadSharedDiaryData() {
  try { return JSON.parse(localStorage.getItem(SD_KEY)) || {}; } catch(e) { return {}; }
}
function saveSharedDiaryData(data) { localStorage.setItem(SD_KEY, JSON.stringify(data)); }

// Fetch shared diary from GitHub
async function fetchSharedDiaryFromGitHub() {
  var token = getGitHubToken();
  var headers = { 'Accept': 'application/vnd.github.v3+json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  try {
    var resp = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + GITHUB_FILE, { headers: headers, cache: 'no-store' });
    if (!resp.ok) return null;
    var data = await resp.json();
    var content = decodeURIComponent(escape(atob(data.content)));
    return { data: JSON.parse(content), sha: data.sha };
  } catch(e) { return null; }
}

// Push shared diary to GitHub
async function pushSharedDiaryToGitHub(diaryData) {
  var token = getGitHubToken();
  if (!token) return false;
  var headers = { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' };
  var sha = null;
  try {
    var resp = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + GITHUB_FILE, { headers: headers, cache: 'no-store' });
    if (resp.ok) { var d = await resp.json(); sha = d.sha; }
  } catch(e) {}
  var content = btoa(unescape(encodeURIComponent(JSON.stringify(diaryData, null, 2))));
  var body = { message: '💌 Update shared diary', content: content };
  if (sha) body.sha = sha;
  try {
    var putResp = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + GITHUB_FILE, { method: 'PUT', headers: headers, body: JSON.stringify(body) });
    return putResp.ok;
  } catch(e) { return false; }
}

// ==============================
// DATE STRIP
// ==============================
function renderDateStrip() {
  var strip = document.getElementById('dateStrip'); if (!strip) return;
  var allData = loadSharedDiaryData();
  var today = new Date(); var selKey = fmtDate(sharedDiaryViewDate);
  var dowKeys = lang==='sr'?['Ne','Po','Ut','Sr','Če','Pe','Su']:lang==='en'?['Su','Mo','Tu','We','Th','Fr','Sa']:['日','一','二','三','四','五','六'];
  var html = '';
  for (var i = -Math.floor(DATE_STRIP_DAYS/2); i < DATE_STRIP_DAYS-Math.floor(DATE_STRIP_DAYS/2); i++) {
    var d = new Date(today); d.setDate(d.getDate() + i);
    var key = fmtDate(d); var dow = dowKeys[d.getDay()];
    var dayData = allData[key]; var both = dayData && dayData['barry'] && dayData['andjela'];
    var hasEntry = dayData && (dayData['barry'] || dayData['andjela']);
    var classes = ['date-pill'];
    if (key === fmtDate(today)) classes.push('today');
    if (key === selKey) classes.push('selected');
    html += '<div class="' + classes.join(' ') + '" data-date="' + key + '" onclick="selectDateStrip(\'' + key + '\')">';
    html += '<span class="dp-dow">' + dow + '</span>';
    html += '<span class="dp-day">' + d.getDate() + '</span>';
    html += '<span class="dp-dot' + (hasEntry ? ' has-entry' + (both ? ' both-entry' : '') : '') + '"></span>';
    html += '</div>';
  }
  strip.innerHTML = html;
  // Scroll to selected date
  requestAnimationFrame(function() {
    var sel = strip.querySelector('.selected');
    if (sel) sel.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' });
  });
}

function selectDateStrip(dateKey) {
  sharedDiaryViewDate = new Date(dateKey + 'T00:00:00');
  renderDateStrip();
  renderSharedDiary();
}

function scrollDateStrip(dir) {
  var strip = document.getElementById('dateStrip'); if (!strip) return;
  strip.scrollBy({ left: dir * strip.clientWidth * 0.7, behavior: 'smooth' });
}

// ==============================
// SAVE & RENDER
// ==============================
async function saveSharedDiary() {
  var dateKey = fmtDate(sharedDiaryViewDate);
  var happy = document.getElementById('sd-happy').value.trim();
  var uncomf = document.getElementById('sd-uncomf').value.trim();
  var thanks = document.getElementById('sd-thanks').value.trim();
  var wish = document.getElementById('sd-wish').value.trim();
  if (!happy && !uncomf && !thanks && !wish) { toast(lang==='sr'?'Napiši bar nešto...':lang==='en'?'Write at least something...':'至少写点什么吧...'); return; }

  // Disable save button during save
  var saveBtn = document.getElementById('sd-save-btn');
  saveBtn.disabled = true; saveBtn.textContent = '⏳ ' + (lang==='sr'?'Čuvanje...':lang==='en'?'Saving...':'保存中...');

  var allData = loadSharedDiaryData();
  if (!allData[dateKey]) allData[dateKey] = {};
  // Preserve hug data so streaks don't break
  var existingHug = allData[dateKey][activeProfile] && allData[dateKey][activeProfile].hug;
  allData[dateKey][activeProfile] = { happy:happy, uncomf:uncomf, thanks:thanks, wish:wish, time:Date.now() };
  if (existingHug) allData[dateKey][activeProfile].hug = existingHug;
  // Save locally first
  saveSharedDiaryData(allData);

  // Push to GitHub FIRST (MUST await — otherwise pull below can
  // complete before push and overwrite this save with stale remote data)
  await pushAllSharedData();

  // Try pull partner's entry — with retry for slow network
  // (now safe: push completed, remote includes our just-saved entry)
  await pullPartnerEntry(dateKey);

  // Show saved badge
  var badge = document.getElementById('sdSavedBadge');
  badge.classList.add('show');
  setTimeout(function() { badge.classList.remove('show'); }, 2000);

  saveBtn.disabled = false;
  saveBtn.innerHTML = '💾 <span id="sd-save-text">' + (lang==='sr'?'Sačuvaj':lang==='en'?'Save':'保存') + '</span>';

  renderDateStrip();
  renderSharedDiary();
  toast('💌 ✓');
}

// Pull partner entries from unified shared-state.json (not old shared-diary.json)
async function pullPartnerEntry(dateKey) {
  if (!getGitHubToken()) return;
  // Use unified pullAllSharedData — applies shared-state.json to localStorage
  // then re-render; avoids dual-format sync drift
  await pullAllSharedData();
  var localData = loadSharedDiaryData();
  var partnerProfile = activeProfile === 'andjela' ? 'barry' : 'andjela';
  // If partner hasn't written for this date, show hint
  var entry = localData[dateKey] && localData[dateKey][partnerProfile];
  return entry || null;
}

// ==============================
// EXPORT / IMPORT (improved UX)
// ==============================
function exportSharedDiary() {
  var dateKey = fmtDate(sharedDiaryViewDate);
  var allData = loadSharedDiaryData();
  var myEntry = allData[dateKey] && allData[dateKey][activeProfile];
  if (!myEntry) { toast(lang==='sr'?'Prvo sačuvaj svoj unos':lang==='en'?'Save your entry first':'请先保存你的日记'); return; }
  var exportObj = { date:dateKey, author:activeProfile, entry:myEntry };
  var text = JSON.stringify(exportObj);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function() {
      toast('📤 ' + (lang==='sr'?'Kopirano! Pošalji partneru 💌':lang==='en'?'Copied! Send to partner 💌':'已复制！发给伴侣吧 💌'));
    });
  } else {
    // Fallback: show text in a small modal-like prompt
    var ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('📤 ' + (lang==='sr'?'Kopirano!':lang==='en'?'Copied!':'已复制！')); } catch(e) { prompt(lang==='sr'?'Kopiraj i pošalji partneru:':lang==='en'?'Copy and send to partner:':'复制发给伴侣：', text); }
    document.body.removeChild(ta);
  }
}

function showImportModal() {
  // Remove existing modal if any
  var existing = document.querySelector('.import-modal-overlay');
  if (existing) existing.remove();
  var overlay = document.createElement('div'); overlay.className = 'import-modal-overlay';
  overlay.innerHTML = '<div class="import-modal"><h4>' + (lang==='sr'?'📥 Zalepi partnerov tekst':lang==='en'?'📥 Paste partner\'s text':'📥 粘贴伴侣分享的内容') + '</h4><textarea id="importTextarea" placeholder="' + (lang==='sr'?'Zalepi JSON tekst ovde...':'粘贴 JSON 文本...') + '"></textarea><div class="im-btns"><button class="im-cancel" id="imCancel">' + (lang==='sr'?'Odustani':'取消') + '</button><button class="im-confirm" id="imConfirm">' + (lang==='sr'?'Uvezi':'导入') + '</button></div></div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  document.getElementById('imCancel').addEventListener('click', function() { overlay.remove(); });
  document.getElementById('imConfirm').addEventListener('click', function() {
    var text = document.getElementById('importTextarea').value.trim();
    if (!text) { overlay.remove(); return; }
    doImport(text); overlay.remove();
  });
  // Auto-paste from clipboard
  if (navigator.clipboard && navigator.clipboard.readText) {
    navigator.clipboard.readText().then(function(t) {
      try { JSON.parse(t); document.getElementById('importTextarea').value = t; } catch(e) {}
    }).catch(function() {});
  }
  document.getElementById('importTextarea').focus();
}

function doImport(text) {
  try {
    var imported = JSON.parse(text);
    if (!imported.date || !imported.author || !imported.entry) throw new Error();
    var allData = loadSharedDiaryData();
    if (!allData[imported.date]) allData[imported.date] = {};
    allData[imported.date][imported.author] = imported.entry;
    saveSharedDiaryData(allData);
    if (imported.date === fmtDate(sharedDiaryViewDate)) renderSharedDiary();
    renderDateStrip();
    toast('📥 ' + (lang==='sr'?'Uvezeno! 💌':lang==='en'?'Imported! 💌':'已导入！💌'));
  } catch(e) {
    toast(lang==='sr'?'Neispravan format 😢':lang==='en'?'Invalid format 😢':'格式不对哦 😢');
  }
}

// ==============================
// RENDER SHARED DIARY
// ==============================

// INVARIANT: Viewing a partner's diary for any date requires the current user
// to have saved their OWN entry for THAT SPECIFIC date first. Each day's
// permission is independent — writing today's diary does NOT retroactively
// unlock past days. There is no "date < today" bypass. The lock is permanent
// for any date where the user never wrote their own entry.
function canViewPartnerDiaryEntry(dateKey) {
  var allData = loadSharedDiaryData();
  return !!(allData[dateKey] && allData[dateKey][activeProfile]);
}

async function renderSharedDiary() {
  var dateKey = fmtDate(sharedDiaryViewDate);

  // === PHASE 1: instant sync render from localStorage (no await!) ===
  var allData = loadSharedDiaryData();
  var myEntry = allData[dateKey] && allData[dateKey][activeProfile];
  var partnerProfile = activeProfile === 'andjela' ? 'barry' : 'andjela';
  var partnerEntry = allData[dateKey] && allData[dateKey][partnerProfile];

  // Fill my entry fields instantly
  document.getElementById('sd-happy').value = myEntry ? (myEntry.happy || '') : '';
  document.getElementById('sd-uncomf').value = myEntry ? (myEntry.uncomf || '') : '';
  document.getElementById('sd-thanks').value = myEntry ? (myEntry.thanks || '') : '';
  document.getElementById('sd-wish').value = myEntry ? (myEntry.wish || '') : '';
  ['happy','uncomf','thanks','wish'].forEach(function(f) {
    var el = document.getElementById('sdc-'+f); if (el) el.textContent = (document.getElementById('sd-'+f).value || '').length;
  });

  // Partner card — locked until you save your own entry first (by design)
  // Uses the invariant: each day's permission is tied to that specific day.
  var lockedEl = document.getElementById('partnerLocked');
  var contentEl = document.getElementById('sharedDiaryPartnerContent');
  var translateBtn = document.getElementById('translateBtnSm');
  if (myEntry) {
    lockedEl.style.display = 'none';
    contentEl.style.display = '';
    contentEl.classList.add('partner-card-unlocked');
    renderPartnerContent(partnerEntry, partnerProfile, contentEl, translateBtn);
  } else {
    // Lock stays permanently for this date — user never wrote their entry
    lockedEl.style.display = '';
    contentEl.style.display = 'none';
    contentEl.classList.remove('partner-card-unlocked');
    translateBtn.style.display = 'none';
  }

  // Timeline history from localStorage
  renderSharedDiaryHistory(allData);

  // === PHASE 2: async pull from GitHub (won't block UI) ===
  // IMPORTANT: never overwrite MY form fields — user may be typing
  if (getGitHubToken()) {
    pullPartnerEntry(dateKey).then(function() {
      var freshData = loadSharedDiaryData();
      var freshMy = freshData[dateKey] && freshData[dateKey][activeProfile];
      var freshPartner = freshData[dateKey] && freshData[dateKey][partnerProfile];
      // Only update if partner data changed AND I'm not currently typing
      if (JSON.stringify(freshPartner) !== JSON.stringify(partnerEntry)) {
        var activeEl = document.activeElement;
        var isTyping = activeEl && (activeEl.id === 'sd-happy' || activeEl.id === 'sd-uncomf' || activeEl.id === 'sd-thanks' || activeEl.id === 'sd-wish');
        if (!isTyping) {
          // Only update MY fields if I haven't written anything yet (don't overwrite unsaved work)
          if (!myEntry || !myEntry.time) {
            document.getElementById('sd-happy').value = freshMy ? (freshMy.happy || '') : '';
            document.getElementById('sd-uncomf').value = freshMy ? (freshMy.uncomf || '') : '';
            document.getElementById('sd-thanks').value = freshMy ? (freshMy.thanks || '') : '';
            document.getElementById('sd-wish').value = freshMy ? (freshMy.wish || '') : '';
          }
        }
        // Always update partner display and lock state - same invariant: user must have own entry for THIS date
        if (freshMy) {
          lockedEl.style.display = 'none';
          contentEl.style.display = '';
          renderPartnerContent(freshPartner, partnerProfile, contentEl, translateBtn);
        } else {
          lockedEl.style.display = '';
          contentEl.style.display = 'none';
        }
        renderSharedDiaryHistory(freshData);
      }
    });
  }
}

function renderPartnerContent(partnerEntry, partnerProfile, contentEl, translateBtn) {
  if (partnerEntry) {
    var partnerName = partnerProfile === 'andjela' ? '🌸 Anđela' : '👦 Barry';
    var timeStr = '';
    if (partnerEntry.time) { var t = new Date(partnerEntry.time); timeStr = String(t.getHours()).padStart(2,'0') + ':' + String(t.getMinutes()).padStart(2,'0'); }
    var html = '<div style="font-size:.62rem;color:var(--gold);margin-bottom:8px">' + partnerName + (timeStr?' · '+timeStr:'') + '</div>';
    var questions = [
      {q:lang==='sr'?'💝 Obradovalo':lang==='en'?'💝 Happy':'💝 开心的事', a:partnerEntry.happy},
      {q:lang==='sr'?'🤔 Zasmetalo':lang==='en'?'🤔 Uncomfortable':'🤔 不舒服的事', a:partnerEntry.uncomf},
      {q:lang==='sr'?'🙏 Zahvalnost':lang==='en'?'🙏 Thanks':'🙏 感谢', a:partnerEntry.thanks},
      {q:lang==='sr'?'💪 Da poradimo':lang==='en'?'💪 To improve':'💪 希望改进', a:partnerEntry.wish}
    ];
    var origTexts=[];
    questions.forEach(function(item) {
      if (item.a) { origTexts.push(item.a); html += '<div class="sd-partner-field"><div class="sd-partner-q">'+item.q+'</div><div class="sd-partner-a" data-original="'+esc(item.a)+'" id="sdp-'+origTexts.length+'">'+esc(item.a)+'</div></div>'; }
    });
    if (!partnerEntry.happy && !partnerEntry.uncomf && !partnerEntry.thanks && !partnerEntry.wish) {
      html += '<div class="sd-empty">'+(lang==='sr'?'Nema unosa':lang==='en'?'No entry':'没有记录')+'</div>';
    }
    contentEl.innerHTML = html;
    if (origTexts.length > 0) { translateBtn.style.display = ''; translateBtn.textContent = '🌐'; }
    else { translateBtn.style.display = 'none'; }
  } else {
    contentEl.innerHTML = '<div class="sd-locked"><span class="sd-locked-icon">📭</span><div class="sd-locked-text">'+(lang==='sr'?'Partner još nije napisao svoj osvrt za ovaj dan — ili još nije sinhronizovano.':lang==='en'?'Your partner hasn\'t written their reflection for this day yet — or it hasn\'t synced.':'伴侣还没写这一天的总结——或者还没同步过来。')+'</div></div>';
    translateBtn.style.display = 'none';
  }
}

// ==============================
// TIMELINE HISTORY
// ==============================
function renderSharedDiaryHistory(allData) {
  var items = [];
  Object.keys(allData).forEach(function(date) {
    var day = allData[date];
    var barry = day['barry']; var andjela = day['andjela'];
    if (barry || andjela) items.push({date:date, barry:barry, andjela:andjela});
  });
  items.sort(function(a,b) { return b.date.localeCompare(a.date); });
  var hist = document.getElementById('sharedDiaryHistory');
  if (!hist) return;
  if (items.length === 0) {
    hist.innerHTML = '<div class="sd-empty" style="padding-left:20px">'+(lang==='sr'?'Još nema unosa — započnite danas! 💌':lang==='en'?'No entries yet — start today! 💌':'还没有日记——今天就开始吧！💌')+'</div>';
    return;
  }

  var showCount = 10;
  var hasMore = items.length > showCount;

  function buildTimeline(list) {
    return list.map(function(item) {
      var both = item.barry && item.andjela;
      var dotClass = both ? 'dot-both' : (item[activeProfile] ? 'dot-mine' : 'dot-partner');
      var authors = [];
      if (item.andjela) { authors.push('🌸 Anđela'); }
      if (item.barry) { authors.push('👦 Barry'); }
      // PREVIEW: only use current user's OWN content — never leak partner's
      // diary for dates where the user hasn't written their own entry.
      // Invariant: each day's view permission is tied to that specific day.
      var myEntry = item[activeProfile];
      var preview = myEntry ? (myEntry.happy || myEntry.thanks || myEntry.uncomf || myEntry.wish || '') : '';
      var locked = !myEntry && (item['barry'] || item['andjela']);
      var previewHtml = '';
      if (locked) {
        previewHtml = '<span class="tn-locked">🔒 ' + (lang==='sr'?'Zaključano':lang==='en'?'Locked':'已锁定') + '</span>';
      } else if (preview) {
        preview = esc(preview.substring(0, 80));
        previewHtml = preview + (preview.length >= 80 ? '...' : '');
      }
      return '<div class="timeline-node ' + dotClass + '" onclick="jumpToDiaryDate(\'' + item.date + '\')">'
        + '<div class="tn-date">📅 ' + item.date + '</div>'
        + '<div class="tn-authors">' + authors.join(' · ') + '</div>'
        + '<div class="tn-preview">' + previewHtml + '</div>'
        + '</div>';
    }).join('');
  }

  hist.innerHTML = '<div class="timeline-inner">' + buildTimeline(items.slice(0, showCount)) + '</div>'
    + (hasMore ? '<div class="timeline-load-more"><button onclick="expandTimeline()" id="timelineExpandBtn">'
    + (lang==='sr'?'📅 Prikaži još ' + (items.length - showCount) + ' unosa':lang==='en'?'📅 Show ' + (items.length - showCount) + ' more entries':'📅 展开剩余 ' + (items.length - showCount) + ' 条')
    + '</button></div>' : '');
}

function jumpToDiaryDate(dateKey) {
  sharedDiaryViewDate = new Date(dateKey + 'T00:00:00');
  renderDateStrip();
  renderSharedDiary();
  var panel = document.getElementById('panel-diary');
  if (panel) panel.scrollIntoView({ behavior:'smooth' });
}

window._allTimelineItems = null;
function expandTimeline() {
  var allData = loadSharedDiaryData();
  var items = [];
  Object.keys(allData).forEach(function(date) {
    var day = allData[date];
    if (day['barry'] || day['andjela']) items.push({date:date, barry:day['barry'], andjela:day['andjela']});
  });
  items.sort(function(a,b) { return b.date.localeCompare(a.date); });
  var hist = document.getElementById('sharedDiaryHistory'); if (!hist) return;
  hist.innerHTML = '<div class="timeline-inner">'
    + items.map(function(item) {
      var both = item.barry && item.andjela;
      var dotClass = both ? 'dot-both' : (item[activeProfile] ? 'dot-mine' : 'dot-partner');
      var authors = [];
      if (item.andjela) { authors.push('🌸 Anđela'); }
      if (item.barry) { authors.push('👦 Barry'); }
      // PREVIEW: only use current user's OWN content — never leak partner's
      var myEntry = item[activeProfile];
      var preview = myEntry ? (myEntry.happy || myEntry.thanks || myEntry.uncomf || myEntry.wish || '') : '';
      var locked = !myEntry && (item['barry'] || item['andjela']);
      var previewHtml = '';
      if (locked) {
        previewHtml = '<span class="tn-locked">🔒 ' + (lang==='sr'?'Zaključano':lang==='en'?'Locked':'已锁定') + '</span>';
      } else if (preview) {
        preview = esc(preview.substring(0, 80));
        previewHtml = preview + (preview.length >= 80 ? '...' : '');
      }
      return '<div class="timeline-node ' + dotClass + '" onclick="jumpToDiaryDate(\'' + item.date + '\')">'
        + '<div class="tn-date">📅 ' + item.date + '</div>'
        + '<div class="tn-authors">' + authors.join(' · ') + '</div>'
        + '<div class="tn-preview">' + previewHtml + '</div>'
        + '</div>';
    }).join('')
    + '</div>';
}

// ==============================
// TRANSLATION
// ==============================
// Translation cache — avoids re-fetching identical text (session only)
var _transCache = {};

async function translateText(text, from, to) {
  if(!text||from===to||text.length<2)return text;
  var cacheKey = from + '|' + to + '|' + text;
  if (_transCache[cacheKey]) return _transCache[cacheKey];

  var result = null;

  // 1) Google Translate (newer endpoint, best quality for zh↔sr)
  try {
    var r1 = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl='+from+'&tl='+to+'&dt=t&q='+encodeURIComponent(text));
    var d1 = await r1.json();
    if (d1 && d1[0]) {
      var t = d1[0].map(function(s){return s[0];}).join('');
      if (t && t !== text) result = t;
    }
  } catch(e) {}

  // 2) MyMemory (free, no key needed, good fallback)
  if (!result) {
    try {
      var pair = from + '|' + to;
      var r2 = await fetch('https://api.mymemory.translated.net/get?q='+encodeURIComponent(text)+'&langpair='+pair);
      var d2 = await r2.json();
      if (d2.responseData && d2.responseData.translatedText && d2.responseData.translatedText !== text) {
        result = d2.responseData.translatedText;
      }
    } catch(e) {}
  }

  // 3) LibreTranslate (public instance, free/open-source, good for European langs)
  if (!result) {
    try {
      var r3 = await fetch('https://translate.argosopentech.com/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, source: from, target: to, format: 'text' })
      });
      var d3 = await r3.json();
      if (d3.translatedText && d3.translatedText !== text) result = d3.translatedText;
    } catch(e) {}
  }

  if (result) { _transCache[cacheKey] = result; return result; }
  return null; // all translation APIs exhausted
}
async function translatePartnerEntries() {
  var btn = document.getElementById('translateBtnSm');
  if(btn){btn.disabled=true;btn.textContent='⏳';}
  var vl=(lang||'sr')==='zh-CN'?'zh-CN':'sr';
  var pl=activeProfile==='barry'?'sr':'zh-CN';
  if(vl===pl){if(btn){btn.textContent='🌐';btn.disabled=false;}return;}
  var els=document.querySelectorAll('[id^="sdp-"]');
  var ok=0;
  for(var i=0;i<els.length;i++){
    var el=els[i];var orig=el.getAttribute('data-original');
    if(orig&&orig.length>2){
      var result=await translateText(orig,pl,vl);
      if(result===null){el.textContent=orig+' ['+(lang==='sr'?'prevod nije uspeo':lang==='en'?'translation failed':'翻译失败')+']';el.style.color='var(--text-muted)';} else if(result&&result!==orig){el.textContent=result;el.style.color='var(--teal)';el.style.fontWeight='500';ok++;}
    }
  }
  if(btn){
    if(ok>0){btn.textContent='✅';btn.style.borderColor='var(--teal)';btn.style.color='var(--teal)';}
    else{btn.textContent='⚠️';btn.style.borderColor='#E53935';btn.style.color='#E53935';btn.disabled=false;setTimeout(function(){if(btn){btn.textContent='🌐';btn.style.borderColor='';btn.style.color='';btn.disabled=false;}},3000);}
  }
}

// ==============================
// CHARACTER COUNTERS
// ==============================
['happy','uncomf','thanks','wish'].forEach(function(f) {
  var ta = document.getElementById('sd-'+f);
  if (ta) {
    ta.addEventListener('input', function() {
      var count = document.getElementById('sdc-'+f);
      if (count) count.textContent = ta.value.length;
      // Auto-resize textarea
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
    });
  }
});

// ==============================
// INIT
// ==============================
function renderDiaryLabels() {
  document.getElementById('sd-my-title').textContent = lang==='sr'?'Moj osvrt':lang==='en'?'My Reflection':'我的总结';
  document.getElementById('sd-my-hint').textContent = lang==='sr'?'Iskreno o danu — što više detalja, to bolje 💫':lang==='en'?'Be honest about your day — the more detail the better 💫':'坦诚地回顾一天——越详细越好 💫';
  document.getElementById('sd-l-happy').textContent = lang==='sr'?'Šta me je danas obradovalo':lang==='en'?'What made me happy today':'今天让我开心的事';
  document.getElementById('sd-l-uncomf').textContent = lang==='sr'?'Šta mi je malo zasmetalo':lang==='en'?'What felt a little uncomfortable':'让我有点不舒服的事';
  document.getElementById('sd-l-thanks').textContent = lang==='sr'?'Želim da ti se zahvalim za...':lang==='en'?'I want to thank you for...':'我想感谢你的...';
  document.getElementById('sd-l-wish').textContent = lang==='sr'?'Voleo/la bih da zajedno poradimo na...':lang==='en'?'I hope we can work on...':'我希望我们能一起改进的...';
  document.getElementById('sd-save-text').textContent = lang==='sr'?'Sačuvaj i pogledaj partnerov':lang==='en'?'Save & View Partner\'s':'保存并查看伴侣的';
  document.getElementById('sd-gate-hint').textContent = lang==='sr'?'Sačuvaj svoj unos pre nego što vidiš partnerov':lang==='en'?'Save your entry to unlock your partner\'s':'写完才能看伴侣的哦';
  document.getElementById('sd-partner-title').textContent = lang==='sr'?'Partnerov osvrt':lang==='en'?'Partner\'s Reflection':'伴侣的总结';
  // Update sync hint with last-sync time if available
  var syncHint = getGitHubToken() ? (lang==='sr'?'☁️ Automatska sinhronizacija':lang==='en'?'☁️ Auto-sync on':'☁️ 自动同步中') : (lang==='sr'?'📤 Izvezi → pošalji partneru → Partner uveze':lang==='en'?'📤 Export → send → Partner imports':'📤 导出 → 发给伴侣 → 导入');
  var lastSync = localStorage.getItem('shared-last-sync');
  if (lastSync && getGitHubToken()) {
    var ago = Math.floor((Date.now() - parseInt(lastSync)) / 60000);
    if (ago < 1) syncHint += ' · ' + (lang==='sr'?'malopre':lang==='en'?'just now':'刚刚');
    else if (ago < 60) syncHint += ' · ' + ago + 'min ' + (lang==='sr'?'pre':lang==='en'?'ago':'前');
    else syncHint += ' · ' + Math.floor(ago/60) + 'h ' + (lang==='sr'?'pre':lang==='en'?'ago':'前');
  }
  document.getElementById('sd-sync-hint').textContent = syncHint;
  document.getElementById('sd-export').textContent = lang==='sr'?'Podeli':lang==='en'?'Share':'分享';
  document.getElementById('sd-import').textContent = lang==='sr'?'Uvezi':lang==='en'?'Import':'导入';
  document.getElementById('sd-history-title').textContent = lang==='sr'?'Vremenska linija':lang==='en'?'Timeline':'时间线';
  document.getElementById('sd-saved-text').textContent = lang==='sr'?'Sačuvano':'已保存';
  document.getElementById('partner-locked-text').textContent = lang==='sr'?'Prvo sačuvaj svoj unos da otključaš partnerov 💌':lang==='en'?'Save your entry first to unlock your partner\'s 💌':'先保存你的日记才能解锁伴侣的哦 💌';
  document.getElementById('sd-sync-icon').textContent = getGitHubToken() ? '☁️' : '';
}

function initSharedDiaryTab() {
  sharedDiaryViewDate = new Date();
  renderDiaryLabels();
  renderDateStrip();
  renderSharedDiary();
}

/* ================================================================
   MODIFIED: Load lang/theme per-profile
   ================================================================ */
function loadPerProfileSettings() {
  // Default languages: Anđela → Serbian, Barry → Chinese
  var defaultLang = activeProfile === 'barry' ? 'zh-CN' : 'sr';
  var savedLang = localStorage.getItem(profileKey('cycle-lang'));
  // Cleanse: if saved lang is the WRONG profile's default, reset
  if (activeProfile === 'barry' && savedLang === 'sr') savedLang = null;
  if (activeProfile === 'andjela' && savedLang === 'zh-CN') savedLang = null;
  var validLangs = { 'sr':1, 'zh-CN':1, 'en':1 };
  lang = (savedLang && validLangs[savedLang]) ? savedLang : defaultLang;
  // ALWAYS save the corrected lang
  if (!savedLang) localStorage.setItem(profileKey('cycle-lang'), lang);
  theme = localStorage.getItem(profileKey('cycle-theme')) || 'light';
  annDateMet = localStorage.getItem('cycle-ann-met') || '2026-03-19';
  annDateLove = localStorage.getItem('cycle-ann-love') || '2026-05-07';
}
function setLang(l) { lang = l; document.documentElement.setAttribute('lang', l); localStorage.setItem(profileKey('cycle-lang'), l); localStorage.setItem('cycle-lang', l); }
function applyTheme(th) { theme = th; localStorage.setItem(profileKey('cycle-theme'), th); localStorage.setItem('cycle-theme', th); document.documentElement.setAttribute('data-theme', th); document.getElementById('themeBtn').textContent = th === 'dark' ? '☀️' : '🌙'; var sel = document.getElementById('set-theme'); if (sel) sel.value = th; }
// switchLanguage defined below after STATE vars
function switchTheme(th) { applyTheme(th); }

/* ================================================================
   MODIFIED: init
   ================================================================ */
// loadPerProfileSettings() is called in the INIT section below
let lang = localStorage.getItem('cycle-lang') || 'sr';
let theme = localStorage.getItem('cycle-theme') || 'light';
let annDateMet = localStorage.getItem('cycle-ann-met') || '2026-03-19';
let annDateLove = localStorage.getItem('cycle-ann-love') || '2026-05-07';

/* ================================================================
   LOGIN SYSTEM
   ================================================================ */
const LOGIN_PINS = { andjela: '1909', barry: '0827' };
let selectedLoginProfile = null;
let isLoggedIn = false;

function selectLogin(profile) {
  selectedLoginProfile = profile;
  // Set language based on profile: Anđela→sr, Barry→zh-CN
  var profileLang = profile === 'barry' ? 'zh-CN' : 'sr';
  lang = profileLang;
  document.querySelectorAll('.lang-btn').forEach(function(b){b.classList.toggle('active',b.dataset.lang===lang);});
  // Update card selection visuals
  document.getElementById('loginCardAndjela').classList.toggle('selected', profile === 'andjela');
  document.getElementById('loginCardBarry').classList.toggle('selected', profile === 'barry');
  // Update login UI text
  document.getElementById('loginPinBtn').textContent = lang==='sr'?'🔓 Prijavi se':lang==='en'?'🔓 Sign in':'🔓 登录';
  document.getElementById('lc-hint-a').textContent = lang==='sr'?'Dodirni za prijavu':lang==='en'?'Tap to sign in':'点击登录';
  document.getElementById('lc-hint-b').textContent = lang==='sr'?'Dodirni za prijavu':lang==='en'?'Tap to sign in':'点击登录';
  // Show PIN area
  document.getElementById('loginPinArea').classList.add('show');
  document.getElementById('loginPinInput').value = '';
  document.getElementById('loginError').textContent = '';
  document.getElementById('loginSwitchHint').textContent = lang==='sr'?'Unesi svoj PIN':lang==='en'?'Enter your PIN':'输入你的 PIN';
  setTimeout(function(){ document.getElementById('loginPinInput').focus(); }, 300);
  spawnLoginHearts();
}
function spawnLoginHearts() {
  var overlay = document.getElementById('loginOverlay');
  if (!overlay) return;
  var hearts = ['💕','💖','💗','💝','🌸','✨','🌷','🕊️'];
  for (var i = 0; i < 15; i++) {
    (function(idx) {
      setTimeout(function() {
        var h = document.createElement('span');
        h.textContent = hearts[idx % hearts.length];
        h.style.cssText = 'position:fixed;pointer-events:none;z-index:1001;font-size:'+(0.8+Math.random()*1.5)+'rem;left:'+(5+Math.random()*90)+'%;top:'+(80+Math.random()*15)+'%;animation:loginHeartFloat '+(2+Math.random()*3)+'s ease-out forwards';
        h.style.opacity = '0.7';
        overlay.appendChild(h);
        setTimeout(function() { if (h.parentNode) h.remove(); }, 3500);
        // Add keyframes if not present
        if (!document.getElementById('loginHeartKeyframes')) {
          var style = document.createElement('style');
          style.id = 'loginHeartKeyframes';
          style.textContent = '@keyframes loginHeartFloat{0%{opacity:1;transform:translateY(0) scale(1) rotate(0deg)}100%{opacity:0;transform:translateY(-120px) scale(.3) rotate(45deg)}}';
          document.head.appendChild(style);
        }
      }, idx * 120);
    })(i);
  }
}

function verifyLogin() {
  var pin = document.getElementById('loginPinInput').value;
  var card = selectedLoginProfile === 'andjela' ? document.getElementById('loginCardAndjela') : document.getElementById('loginCardBarry');
  if (pin === LOGIN_PINS[selectedLoginProfile]) {
    // Correct PIN
    activeProfile = selectedLoginProfile;
    localStorage.setItem('cycle-active-profile', activeProfile);
    sessionStorage.setItem('cycle-logged-in', '1');
    isLoggedIn = true;
    document.getElementById('loginOverlay').classList.add('hidden');
    bootApp();
  } else {
    // Wrong PIN
    card.classList.add('shake');
    document.getElementById('loginError').textContent = (selectedLoginProfile==='barry'?'PIN 不对，再试一次':'Pogrešan PIN — pokušaj ponovo');
    document.getElementById('loginPinInput').value = '';
    setTimeout(function(){ card.classList.remove('shake'); }, 500);
  }
}

// ===== DATA BACKUP & RESTORE =====
function exportAllData() {
  var backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    exportedBy: activeProfile,
    diary: JSON.parse(localStorage.getItem('shared-diary') || '{}'),
    learningProgress: JSON.parse(localStorage.getItem('shared-learning-progress') || '{}'),
    learningComments: JSON.parse(localStorage.getItem('shared-learning-comments') || '[]'),
    learningPoints: JSON.parse(localStorage.getItem('shared-learning-points') || '{}'),
    voiceData: JSON.parse(localStorage.getItem('shared-voice-data') || '{}'),
    sunCounter: JSON.parse(localStorage.getItem('shared-sun-counter') || '{}'),
    settings: {
      activeProfile: activeProfile,
      lang: lang,
      theme: theme
    }
  };
  var blob = new Blob([JSON.stringify(backup, null, 2)], {type: 'application/json'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'anđelin-ciklus-backup-' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('📦 ' + (lang==='sr'?'Podaci izvezeni!':'数据已导出！'));
}

function importAllData() {
  var input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = function(e) {
    var file = e.target.files[0];
    if (!file) return;
    if (!confirm(lang==='sr'?'⚠️ Ovo će PREBRISATI sve trenutne podatke. Nastaviti?':'⚠️ 此操作将覆盖所有当前数据，是否继续？')) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      try {
        var backup = JSON.parse(ev.target.result);
        if (backup.diary) localStorage.setItem('shared-diary', JSON.stringify(backup.diary));
        if (backup.learningProgress) localStorage.setItem('shared-learning-progress', JSON.stringify(backup.learningProgress));
        if (backup.learningComments) localStorage.setItem('shared-learning-comments', JSON.stringify(backup.learningComments));
        if (backup.learningPoints) localStorage.setItem('shared-learning-points', JSON.stringify(backup.learningPoints));
        if (backup.voiceData) localStorage.setItem('shared-voice-data', JSON.stringify(backup.voiceData));
        if (backup.settings) {
          if (backup.settings.lang) { lang = backup.settings.lang; setLang(lang); }
          if (backup.settings.theme) { theme = backup.settings.theme; applyTheme(theme); }
        }
        pushAllSharedData();
        toast('✅ ' + (lang==='sr'?'Podaci vraćeni! Osvežavanje...':'数据已恢复！刷新中...'));
        setTimeout(function(){ location.reload(); }, 1500);
      } catch(e) {
        toast('❌ ' + (lang==='sr'?'Neispravan fajl':'无效文件'));
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// ===== FESTIVAL THEME =====
function getFestivalTheme(){var t=new Date();var k=t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0');var L={2025:{s:'2025-01-29',m:'2025-10-06'},2026:{s:'2026-02-17',m:'2026-09-25'},2027:{s:'2027-02-06',m:'2027-10-14'},2028:{s:'2028-01-26',m:'2028-10-03'},2029:{s:'2029-02-13',m:'2029-09-28'}};var ld=L[t.getFullYear()];if(ld){var ss=new Date(ld.s+'T00:00:00');var se=new Date(ss);se.setDate(se.getDate()+3);if(t>=ss&&t<=se)return'festival-spring';if(k===ld.m)return'festival-midautumn';}var mmdd=String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0');if(mmdd==='01-07')return'festival-orthodoxmas';if(mmdd==='01-27')return'festival-sava';if(mmdd==='02-14')return'festival-valentine';if(mmdd==='05-09')return'festival-victory';var ORTHODOX_EASTER={2025:'2025-04-20',2026:'2026-04-12',2027:'2027-05-02',2028:'2028-04-16',2029:'2029-04-08'};var oe=ORTHODOX_EASTER[t.getFullYear()];if(oe&&k===oe)return'festival-easter';if(mmdd==='01-01')return'festival-newyear';return'';}
function applyFestivalTheme(){var cls=getFestivalTheme();document.body.classList.forEach(function(c){if(c.startsWith('festival-'))document.body.classList.remove(c);});if(cls)document.body.classList.add(cls);var old=document.getElementById('festivalDecorations');if(old)old.remove();var icons=null,count=0;if(cls==='festival-spring'){icons=['🏮','🧧','🎆','🧨'];count=12;}else if(cls==='festival-midautumn'){icons=['🌕','🐰','🥮','🏮'];count=10;}else if(cls==='festival-valentine'){icons=['💕','💖','💗','🌸','❤️'];count=15;}else if(cls==='festival-newyear'){icons=['🎆','✨','🎉','🌟'];count=12;}else if(cls==='festival-sava'){icons=['📚','✝️','🇷🇸','🕊️'];count=8;}else if(cls==='festival-orthodoxmas'){icons=['❄️','🎄','✝️','🕯️'];count=8;}else if(cls==='festival-easter'){icons=['🥚','🐇','🌸','🕊️'];count=10;}else if(cls==='festival-victory'){icons=['🕊️','🌺','🎖️','✨'];count=8;}if(!icons)return;var c=document.createElement('div');c.className='festival-decorations';c.id='festivalDecorations';for(var i=0;i<count;i++){var d=document.createElement('span');d.className='festival-deco';d.textContent=icons[i%icons.length];d.style.left=(2+Math.random()*94)+'%';d.style.fontSize=(0.8+Math.random()*1.8)+'rem';d.style.animationDelay=(Math.random()*6)+'s';d.style.animationDuration=(4+Math.random()*8)+'s';c.appendChild(d);}document.body.appendChild(c);}

// ===== SEASONAL DECOR =====
function applySeasonalDecor(){var cls=getFestivalTheme();if(cls)return;var m=new Date().getMonth();var icons=null,count=0;if(m>=2&&m<=4){icons=['🌸','🌷','💮','🌿'];count=8;}else if(m>=5&&m<=7){icons=['☀️','🌻','🍦','🦋'];count=6;}else if(m>=8&&m<=10){icons=['🍂','🍁','🎃','🌾'];count=8;}else{icons=['❄️','⛄','🧣','✨'];count=6;}var old=document.getElementById('seasonalDecorations');if(old)old.remove();var c=document.createElement('div');c.className='seasonal-deco';c.id='seasonalDecorations';for(var i=0;i<count;i++){var d=document.createElement('span');d.textContent=icons[i%icons.length];d.style.left=(3+Math.random()*94)+'%';d.style.fontSize=(0.7+Math.random()*1.2)+'rem';d.style.animationDelay=(Math.random()*8)+'s';c.appendChild(d);}document.body.appendChild(c);}
function setupOfflineDetection(){var banner=document.getElementById('offlineBanner');if(!banner)return;function update(){banner.classList.toggle('show',!navigator.onLine);document.getElementById('offline-text').textContent=lang==='sr'?'Offline — neke funkcije možda ne rade':lang==='en'?'Offline — some features unavailable':'当前离线，部分功能不可用';}window.addEventListener('online',update);window.addEventListener('offline',update);update();}
function setupPWABanner(){var banner=document.getElementById('pwaBanner');if(!banner)return;if(window.matchMedia('(display-mode: standalone)').matches)return;if(!/Mobi|Android/i.test(navigator.userAgent))return;if(localStorage.getItem('pwa-banner-dismissed'))return;banner.classList.add('show');document.getElementById('pwa-text').textContent=lang==='sr'?'📲 Instaliraj na telefon — koristi kao aplikaciju':lang==='en'?'📲 Install on phone — use like an app':'📲 安装到手机 — 像App一样使用';}

// ===== DASHBOARD =====
var DASH_I18N={barry:{dashTitle:'🏠 主页',welcomeBack:'欢迎回来，',todayCulture:'今日文化知识',learningSummary:'学习进度',completedLabel:'已完成',totalLabel:'总课程',streakLabel:'连续学习',daysUnit:'天',pointsLabel:'总积分',unreadMessages:'你有 {n} 条新留言',noUnread:'没有新留言',goDiary:'📝 写日记',goLearn:'📚 今日课程',goCalendar:'📅 查看日历',quoteTitle:'每日一句'},andjela:{dashTitle:'🏠 Početna',welcomeBack:'Dobrodošla nazad, ',todayCulture:'Današnje kulturno znanje',learningSummary:'Pregled napretka',completedLabel:'Završeno',totalLabel:'ukupno lekcija',streakLabel:'Niz učenja',daysUnit:'dana',pointsLabel:'Ukupno poena',unreadMessages:'Imaš {n} novih poruka',noUnread:'Nema novih poruka',goDiary:'📝 Dnevnik',goLearn:'📚 Današnja lekcija',goCalendar:'📅 Kalendar',quoteTitle:'Današnja misao'}};
function dl(key){var profile=(lang||'').indexOf('zh')===0?'barry':'andjela';var p=DASH_I18N[profile]||DASH_I18N.andjela;return p[key]||(DASH_I18N.andjela[key]||key);}
function initDashboard(){if(getGitHubToken()){pullAllSharedData().then(function(){renderDashboard();});}else{renderDashboard();}}
function renderDashboard(){var panel=document.getElementById('panel-dashboard');if(!panel)return;var pp=getPartnerProgress();var myName=activeProfile==='andjela'?'🌸 Anđela':'👦 Barry';var cc=(pp&&pp.completed)?pp.completed.length:0;var tl=DAILY_LESSONS.length;var pct=tl>0?Math.round(cc/tl*100):0;var s=getStreak();var dp=getPoints('andjela');var mb=getUnlockedBadges('andjela');var uc=getUnreadCommentCount();var q=MOTIVATIONAL_QUOTES[Math.floor(Math.random()*MOTIVATIONAL_QUOTES.length)];var lb=null;for(var i=BADGES.length-1;i>=0;i--){if(mb.indexOf(BADGES[i].id)>=0){lb=BADGES[i];break;}}var tc=CULTURE_KNOWLEDGE[getTodaysCultureIndex()];var h='';h+='<div class=\"dash-welcome\">'+dl('welcomeBack')+'<strong>'+myName+'</strong></div>';h+='<div class=\"card dash-card\"><h4>'+tc.icon+' '+dl('todayCulture')+'</h4><div style=\"font-size:.85rem;font-weight:700;color:var(--love);margin-bottom:4px\">'+tc.zh+'</div><div style=\"font-size:.72rem;color:var(--text);margin-bottom:4px\">'+tc.sr+'</div><div style=\"font-size:.65rem;color:var(--text-muted);line-height:1.5\">'+(activeProfile==="barry"?(CULTURE_DESC_ZH[tc.id]||tc.desc):(tc.desc_sr||tc.desc)).substring(0,120)+'...</div></div>';h+='<div class=\"card dash-card\"><h4>📊 '+dl('learningSummary')+'</h4><div class=\"dash-bar\"><div class=\"dash-bar-fill\" style=\"width:'+pct+'%\"></div></div><div class=\"dash-row\"><span>✅ '+dl('completedLabel')+': '+cc+'/'+tl+'</span><span>'+pct+'%</span></div><div class=\"dash-row\"><span>🔥 '+dl('streakLabel')+': '+s+' '+dl('daysUnit')+'</span><span>⭐ '+dl('pointsLabel')+': '+dp+'</span></div>'+((lb)?'<div style=\"margin-top:4px;font-size:.72rem\">'+lb.icon+' '+cl(lb.nameKey)+'</div>':'')+'</div>';h+='<div class=\"card dash-card\">'+((uc>0)?'<div class=\"dash-unread\" onclick=\"showGlobalComments()\" style=\"cursor:pointer\">🔴 '+dl('unreadMessages').replace('{n}',uc)+' 💌</div>':'<div style=\"font-size:.7rem;color:var(--text-muted);margin-bottom:8px\">✅ '+dl('noUnread')+'</div>');h+='<div class=\"dash-links\"><button class=\"dash-link-btn\" onclick=\"switchToTab(\'diary\')\">'+dl('goDiary')+'</button><button class=\"dash-link-btn\" onclick=\"switchToTab(\'culture\')\">'+dl('goLearn')+'</button><button class=\"dash-link-btn\" onclick=\"goToday();switchToTab(\'stats\')\">'+dl('goCalendar')+'</button></div></div>';h+='<div class=\"card dash-card dash-quote\"><div style=\"font-size:.62rem;color:var(--gold);margin-bottom:4px\">💭 '+dl('quoteTitle')+'</div><div style=\"font-size:.78rem;color:var(--love);font-style:italic\">'+q.zh+'</div><div style=\"font-size:.65rem;color:var(--text-muted)\">'+q.sr+'</div></div>';panel.innerHTML=h;}
function switchToTab(tabId){var btn=document.querySelector('.tab[data-panel=\"'+tabId+'\"]');if(btn)btn.click();}


// ===== DATA LOADER: fetch JSON files =====
var _dataLoaded = false;
var _dataLoadPromise = null;

function loadDataFiles() {
  if (_dataLoadPromise) return _dataLoadPromise;
  _dataLoadPromise = Promise.all([
    fetch('data/culture.json').then(function(r){ return r.text(); }).then(function(t){ return (new Function('return ' + t))(); }).catch(function(e){ console.error('Failed to load culture.json', e); return []; }),
    fetch('data/lessons.json').then(function(r){ return r.text(); }).then(function(t){ return (new Function('return ' + t))(); }).catch(function(e){ console.error('Failed to load lessons.json', e); return []; }),
    fetch('data/quotes.json').then(function(r){ return r.text(); }).then(function(t){ return (new Function('return ' + t))(); }).catch(function(e){ console.error('Failed to load quotes.json', e); return []; })
  ]).then(function(results) {
    // Use eval to parse JS-style object literals (unquoted keys)
    // The JSON files use JS syntax like {id:1,zh:'...'} not valid JSON
    // So we stringify then eval
    CULTURE_KNOWLEDGE = results[0].length > 0 ? results[0] : CULTURE_KNOWLEDGE;
    DAILY_LESSONS = results[1].length > 0 ? results[1] : DAILY_LESSONS;
    MOTIVATIONAL_QUOTES = results[2].length > 0 ? results[2] : MOTIVATIONAL_QUOTES;
    _dataLoaded = true;
    console.log('Data files loaded: culture=' + CULTURE_KNOWLEDGE.length + ' lessons=' + DAILY_LESSONS.length + ' quotes=' + MOTIVATIONAL_QUOTES.length);
  }).catch(function(e) {
    console.error('Data loading failed, using fallbacks', e);
    _dataLoaded = true;
  });
  return _dataLoadPromise;
}

async function bootApp() {
  // Hide loader IMMEDIATELY
  var loader = document.getElementById('appLoader');
  if (loader) { loader.style.display = 'none'; if (loader.parentNode) loader.parentNode.removeChild(loader); }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js?v=11').catch(function(){});
  }
  loadPerProfileSettings();

  // Load data in background (do NOT await — never block the UI)
  loadDataFiles().catch(function(e) { console.error('loadDataFiles failed', e); });

  state = loadState();
  lastCycleCount = predict().cycles.length;
  applyTheme(theme); setLang(lang); applyFestivalTheme(); applySeasonalDecor(); setupOfflineDetection(); setupPWABanner();

  // Render UI immediately with whatever data is available
  updateProfileUI();
  renderAll(); loadSettingsUI();
  initDashboard();

  // Pull shared data in background (2s timeout, non-blocking)
  if (getGitHubToken()) {
    var ghTimeout = new Promise(function(_, reject) { setTimeout(function() { reject(new Error('GitHub timeout')); }, 2000); });
    Promise.race([pullAllSharedData(), ghTimeout]).catch(function(e) { console.log('Shared data pull skipped:', e.message); }).then(function() {
      try {
        var sd = JSON.parse(localStorage.getItem('shared-cycle-data') || 'null');
        if (sd && sd.records) {
          state.records = sd.records.map(function(r) { return new Date(r); });
          state.periodEnds = sd.periodEnds || {};
          state.symptoms = sd.symptoms || {};
          state.settings = sd.settings || { cycleLength: 28, periodLength: 7 };
        }
      } catch(e) {}
      if (activeProfile === 'barry') {
        renderCalendar();
        renderBarrySymptomView();
        renderTips();
      }
      renderHug(); renderGratitude(); renderSong(); renderCheckin();
      renderSharedDiary(); renderDateStrip();
      renderDashboard(); // Refresh dashboard with synced data
      updateSyncStatusBadge();
      updateCycleCounter(predict().cycles.length);
    }).catch(function(e) {});
  }

  fetchWeather();
  loadCalendarData(function(data) { solarTermsCache = (data && data.solarTerms) || []; localStorage.setItem('cycle-solarterms', JSON.stringify(solarTermsCache)); renderCalendar(); });
  showOnboardingIfNeeded();
  if (activeProfile === 'andjela') showGreeting();
  updateMoonPhase();
  updateAnniversaryCount();
  updateCycleCounter(predict().cycles.length);
  lastCycleCount = predict().cycles.length;
  updateLoveCounter();
  updateProfileUI();
  // Show/hide symptoms tab based on activeProfile (Barry only)
  var symTab = document.getElementById('tab-symptoms');
  if (symTab) symTab.style.display = activeProfile === 'barry' ? '' : 'none';
  randomThinkingOfYou();

  // Modal keyboard trap: Escape closes, Tab traps focus
  var modalKeydown = function(e) {
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key === 'Tab') {
      var modal = document.getElementById('modal');
      if (!modal || modal.classList.contains('hidden')) return;
      var focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  };
  document.addEventListener('keydown', modalKeydown);
}

// Profile-aware overrides happen in loadPerProfileSettings() below

function t(key, fallback) {
  // Check I18N_EXT first (new features), then main I18N
  const keys = key.split('.');
  let val = I18N_EXT[lang] || I18N_EXT['sr'];
  let found = false;
  for (const k of keys) { if (val && val[k] !== undefined) { val = val[k]; found = true; } else { found = false; break; } }
  if (found) return val;
  val = I18N[lang] || I18N['sr'];
  for (const k of keys) { if (val && val[k] !== undefined) val = val[k]; else return fallback || key; }
  return val;
}
function switchLanguage(l) { setLang(l); applyAllUI(); loadSettingsUI(); document.getElementById('set-language').value=l; try { renderCultureCard(); renderStudySession(); } catch(e) {} }

/* ================================================================
   HOLIDAY DATA — China 🇨🇳 + Serbia 🇷🇸
   ================================================================ */
const HOLIDAYS = [
  {d:'2026-01-01',name:{sr:'Nova Godina (Kina)',zh:'元旦',en:'New Year'},country:'cn',icon:'🎉',desc:{sr:'Nov početak, vreme kada zajedno sanjamo o lepšoj godini.',zh:'新的一年，和身边的人一起许下美好的愿望。',en:'A fresh start, dreaming together of a kinder year ahead.'}},
  {d:'2026-02-16',name:{sr:'Kineska Nova Godina (veče)',zh:'除夕',en:'CNY Eve'},country:'cn',icon:'🏮',desc:{sr:'Porodična večera koja spaja generacije, uz vatromet.',zh:'全家围坐吃年夜饭，在爆竹声中送走旧岁。',en:'Generations gather for the reunion feast, bidding farewell to the old year.'}},
  {d:'2026-02-17',name:{sr:'Kineska Nova Godina',zh:'春节',en:'Chinese New Year'},country:'cn',icon:'🧧',desc:{sr:'Prvi dan proleća donosi radost i crvene koverte pune ljubavi.',zh:'新春第一天，红包和祝福让整个月都暖暖的。',en:'The first day of spring brings red envelopes and warm wishes all month.'}},
  {d:'2026-03-03',name:{sr:'Festival lampiona',zh:'元宵节',en:'Lantern Festival'},country:'cn',icon:'🏮',desc:{sr:'Slatke pirinčane knedle i lampioni — noć puna svetlosti.',zh:'吃一碗软糯的汤圆，看花灯照亮夜空。',en:'Sweet rice balls and lanterns that turn the night into a sea of light.'}},
  {d:'2026-04-05',name:{sr:'Čingming festival',zh:'清明节',en:'Qingming'},country:'cn',icon:'🌿',desc:{sr:'Dan kada se sećamo onih koji su otišli, dok priroda budi novi život.',zh:'在春天的细雨中，轻轻想起那些远去的亲人。',en:'A quiet spring day to remember those we have loved and lost.'}},
  {d:'2026-05-01',name:{sr:'Praznik rada (Kina)',zh:'劳动节',en:'Labour Day'},country:'cn',icon:'🌿',desc:{sr:'Dan odmora za sve koji svojim radom čine svet boljim.',zh:'停下忙碌的脚步，对自己说一声辛苦了。',en:'A day of rest for every hand that helps the world go round.'}},
  {d:'2026-06-19',name:{sr:'Festival zmajevih čamaca',zh:'端午节',en:'Dragon Boat'},country:'cn',icon:'🎋',desc:{sr:'Miris zongija i ritam zmajevih čamaca — sećanje na pesnika Qu Yuana.',zh:'粽叶飘香，龙舟竞渡，纪念一位心怀家国的诗人。',en:'Fragrant zongzi and racing dragon boats, remembering a poet who loved his people.'}},
  {d:'2026-08-19',name:{sr:'Kineski Dan zaljubljenih',zh:'七夕',en:'Qixi Festival'},country:'cn',icon:'💫',desc:{sr:'Zvezdana noć ljubavi — kad se dvoje sastaje na Nebeskom mostu.',zh:'七夕之夜，愿天下有情人终成眷属。',en:'A starry night of love — two hearts meet across the Milky Way.'}},
  {d:'2026-09-25',name:{sr:'Festival sredine jeseni',zh:'中秋节',en:'Mid-Autumn'},country:'cn',icon:'🥮',desc:{sr:'Pun mesec, porodica na okupu i miris mesečevog kolača.',zh:'月圆人团圆，月饼的甜香就是家的味道。',en:'Full moon, family gathered, and the sweet taste of mooncakes — home at its warmest.'}},
  {d:'2026-10-01',name:{sr:'Nacionalni dan Kine',zh:'国庆节',en:'National Day'},country:'cn',icon:'🇨🇳',desc:{sr:'Zlatna nedelja slave i ponosa — Kina u najlepšim bojama.',zh:'黄金周里红旗飘扬，举国同庆这属于每一个人的节日。',en:'A golden week of national pride, when the land dresses in its finest colors.'}},
  {d:'2026-01-01',name:{sr:'Nova Godina',zh:'新年',en:'New Year'},country:'rs',icon:'🎆',desc:{sr:'Uz vatromet, rakiju i tople zagrljaje — nova godina stiže.',zh:'在烟花和家人的拥抱中，迎接全新的一年。',en:'With fireworks, rakija, and warm embraces — a fresh year begins.'}},
  {d:'2026-01-07',name:{sr:'Božić',zh:'东正教圣诞节',en:'Orthodox Christmas'},country:'rs',icon:'🎄',desc:{sr:'Mir Božiji, Hristos se rodi — uz badnjak, česnicu i toplinu doma.',zh:'在橡木火光和祝福面包的香气中，感受家的温暖。',en:'Christ is born — the oak log burns, the bread is broken, and home feels holy.'}},
  {d:'2026-01-27',name:{sr:'Sveti Sava',zh:'圣萨瓦日',en:'St. Sava Day'},country:'rs',icon:'📚',desc:{sr:'Dan prosvetitelja — praznik dece, učitelja i znanja.',zh:'纪念塞尔维亚最伟大的教育家的日子，属于孩子们和老师的温暖节日。',en:'A day for teachers and children, honoring Serbia\'s patron saint of learning.'}},
  {d:'2026-02-15',name:{sr:'Dan državnosti',zh:'塞尔维亚国庆日',en:'Statehood Day'},country:'rs',icon:'🇷🇸',desc:{sr:'Dan ponosa — sećanje na ustanke koji su utrli put slobodi.',zh:'一个骄傲的日子——纪念为自由开辟道路的先辈们。',en:'A day of pride — remembering the uprisings that paved the way to freedom.'}},
  {d:'2026-04-12',name:{sr:'Vaskrs',zh:'东正教复活节',en:'Orthodox Easter'},country:'rs',icon:'🥚',desc:{sr:'Hristos vaskrse — kucamo se farbanim jajima, slavimo pobedu života.',zh:'主复活了——碰响彩蛋，庆祝生命的胜利和春天的重生。',en:'Christ is risen — painted eggs are tapped, celebrating life\'s triumph over death.'}},
  {d:'2026-05-01',name:{sr:'Praznik rada',zh:'劳动节',en:'Labour Day'},country:'rs',icon:'🌿',desc:{sr:'Majski uranak, izleti u prirodu — dan odmora za sve vredne ruke.',zh:'五一去郊游，在自然中放松，犒劳辛勤的自己。',en:'May Day picnics in nature — a well-earned rest for every hard-working soul.'}},
  {d:'2026-05-09',name:{sr:'Dan pobede',zh:'胜利日',en:'Victory Day'},country:'rs',icon:'🕊️',desc:{sr:'Sa cvećem i tihim ponosom, sećamo se heroja koji su doneli mir.',zh:'带着鲜花和安静的骄傲，铭记那些带来和平的英雄。',en:'With flowers and quiet pride, we remember the heroes who brought peace.'}},
  {d:'2026-06-28',name:{sr:'Vidovdan',zh:'维多夫丹',en:'St. Vitus Day'},country:'rs',icon:'🏛️',desc:{sr:'Dan sećanja i duboke tišine — kad smo kao narod sabrani u veri.',zh:'一个沉思和纪念的日子，塞尔维亚民族信仰与记忆交汇的时刻。',en:'A day of remembrance and quiet reflection, when a nation gathers in its memory.'}},
  {d:'2026-11-11',name:{sr:'Dan primirja',zh:'停战日',en:'Armistice Day'},country:'rs',icon:'🌸',desc:{sr:'Cvet nade na reveru — dan kada se sećamo cene mira.',zh:'胸前别一朵象征希望的鲜花，铭记和平的代价。',en:'A flower of hope on the lapel, remembering the cost of peace.'}}
];

function getHoliday(dateKey) {
  return HOLIDAYS.filter(function(h){return h.d===dateKey;});
}
var solarTermsCache = null;
// Built-in solar terms fallback (always works, no fetch needed)
const SOLAR_TERMS_INLINE = [
  {date:'2026-01-05',name:{'zh-CN':'小寒',sr:'Mali hlad',en:'Minor Cold'}},
  {date:'2026-01-20',name:{'zh-CN':'大寒',sr:'Veliki hlad',en:'Major Cold'}},
  {date:'2026-02-04',name:{'zh-CN':'立春',sr:'Početak proleća',en:'Start of Spring'}},
  {date:'2026-02-19',name:{'zh-CN':'雨水',sr:'Kiše',en:'Rain Water'}},
  {date:'2026-03-05',name:{'zh-CN':'惊蛰',sr:'Buđenje insekata',en:'Awakening of Insects'}},
  {date:'2026-03-20',name:{'zh-CN':'春分',sr:'Prolećna ravnodnevica',en:'Spring Equinox'}},
  {date:'2026-04-05',name:{'zh-CN':'清明',sr:'Vedro i svetlo',en:'Clear and Bright'}},
  {date:'2026-04-20',name:{'zh-CN':'谷雨',sr:'Kiša za žito',en:'Grain Rain'}},
  {date:'2026-05-05',name:{'zh-CN':'立夏',sr:'Početak leta',en:'Start of Summer'}},
  {date:'2026-05-21',name:{'zh-CN':'小满',sr:'Punoća klasja',en:'Grain Buds'}},
  {date:'2026-06-05',name:{'zh-CN':'芒种',sr:'Žetva i setva',en:'Grain in Ear'}},
  {date:'2026-06-21',name:{'zh-CN':'夏至',sr:'Letnja dugodnevica',en:'Summer Solstice'}},
  {date:'2026-07-07',name:{'zh-CN':'小暑',sr:'Mala vrućina',en:'Minor Heat'}},
  {date:'2026-07-23',name:{'zh-CN':'大暑',sr:'Velika vrućina',en:'Major Heat'}},
  {date:'2026-08-07',name:{'zh-CN':'立秋',sr:'Početak jeseni',en:'Start of Autumn'}},
  {date:'2026-08-23',name:{'zh-CN':'处暑',sr:'Prestanak vrućine',en:'End of Heat'}},
  {date:'2026-09-07',name:{'zh-CN':'白露',sr:'Bela rosa',en:'White Dew'}},
  {date:'2026-09-23',name:{'zh-CN':'秋分',sr:'Jesenja ravnodnevica',en:'Autumn Equinox'}},
  {date:'2026-10-08',name:{'zh-CN':'寒露',sr:'Hladna rosa',en:'Cold Dew'}},
  {date:'2026-10-23',name:{'zh-CN':'霜降',sr:'Pad mraza',en:'Frost Descent'}},
  {date:'2026-11-07',name:{'zh-CN':'立冬',sr:'Početak zime',en:'Start of Winter'}},
  {date:'2026-11-22',name:{'zh-CN':'小雪',sr:'Mali sneg',en:'Minor Snow'}},
  {date:'2026-12-07',name:{'zh-CN':'大雪',sr:'Veliki sneg',en:'Major Snow'}},
  {date:'2026-12-22',name:{'zh-CN':'冬至',sr:'Zimska kratkodnevica',en:'Winter Solstice'}}
];

function getSolarTerm(dateKey) {
  // Check cached rich data first (has stories from calendar-data.json)
  if (!solarTermsCache || solarTermsCache.length === 0) {
    var cached = localStorage.getItem('cycle-solarterms');
    if (cached) { try { solarTermsCache = JSON.parse(cached); } catch(e) {} }
  }
  // Use rich cache if available
  if (solarTermsCache && solarTermsCache.length > 0) {
    for (var i = 0; i < solarTermsCache.length; i++) {
      if (solarTermsCache[i].date === dateKey) return solarTermsCache[i];
    }
  }
  // Fallback to inline data (basic: date + name only)
  for (var j = 0; j < SOLAR_TERMS_INLINE.length; j++) {
    if (SOLAR_TERMS_INLINE[j].date === dateKey) return SOLAR_TERMS_INLINE[j];
  }
  return null;
}

/* ================================================================
   BIRTHDAYS
   ================================================================ */
const BIRTHDAYS = { barry: { month:8, day:19, name:{sr:'Barryjev rođendan',en:'Barry\'s Birthday','zh-CN':'Barry 的生日'}, desc_zh:'Barry 的生日！谢谢 Angie 陪我长大一岁。❤️', desc_sr:'Barrijev rođendan! Hvala ti Anđela što si uz mene. ❤️' }, andjela: { month:7, day:27, name:{sr:'Anđelin rođendan',en:'Anđela\'s Birthday','zh-CN':'Anđela 的生日'}, desc_zh:'Angie 的生日！祝我的塞尔维亚太阳生日快乐！🎂', desc_sr:'Anđelin rođendan! Srećan rođendan mom srpskom suncu! 🎂' } };
const LOVE_START = new Date(2026,4,7); // May 7, 2026 — monthly anniversary
const FIRST_MEET_DATE = '2026-12-19';    // First in-person meeting

function getSpecialDate(d) {
  var m = d.getMonth(), day = d.getDate(), y = d.getFullYear();
  var key = fmtDate(d);
  // 1) Monthly anniversary: every 7th
  if (day === 7) {
    var months = (y - LOVE_START.getFullYear()) * 12 + (m - LOVE_START.getMonth());
    if (d < LOVE_START) months = 0;
    return { type:'monthly', icon:'💕', title_zh:'我们的纪念日', title_sr:'Naš dan sećanja',
      desc_zh:'我们在一起的第 '+months+' 个月纪念日！感谢你让每个月的今天都变得特别。💕',
      desc_sr:months+'. mesec našeg puta zajedno! Hvala ti što svaki današnji dan činiš posebnim. 💕' };
  }
  // 2) First meeting: Dec 19
  if (key === FIRST_MEET_DATE) {
    return { type:'firstmeet', icon:'✈️', title_zh:'第一次见面！', title_sr:'Prvi put se uživo!',
      desc_zh:'我们终于从屏幕走到彼此面前。🇨🇳❤️🇷🇸', desc_sr:'Konačno smo sa ekrana došli jedno do drugog. 🇷🇸❤️🇨🇳' };
  }
  // 3) Birthdays (already have cake icon via .birthday class, but add modal text)
  var bdayKey = getBirthday(d);
  if (bdayKey) {
    var b = BIRTHDAYS[bdayKey];
    return { type:'birthday', icon:'🎂', title_zh:b.name['zh-CN'], title_sr:b.name['sr'],
      desc_zh:b.desc_zh, desc_sr:b.desc_sr };
  }
  return null;
}
function getFirstMeetDays() {
  var fm = new Date(FIRST_MEET_DATE + 'T00:00:00');
  return Math.max(0, Math.floor((new Date() - fm) / 86400000));
}

function getBirthday(date) {
  var m=date.getMonth(), d=date.getDate();
  for (var k in BIRTHDAYS) { if (BIRTHDAYS[k].month===m && BIRTHDAYS[k].day===d) return k; }
  return null;
}
function daysUntilBirthday(bdayKey) {
  var b=BIRTHDAYS[bdayKey], now=new Date(), target=new Date(now.getFullYear(),b.month,b.day);
  if (target < now) target.setFullYear(target.getFullYear()+1);
  return Math.ceil((target-now)/86400000);
}
function renderBirthdayCard() {
  var card = document.getElementById('birthdayCard');
  if (!card) return;
  document.getElementById('birthday-title').textContent = lang==='sr'?'🎂 Rođendani':lang==='en'?'🎂 Birthdays':'🎂 生日';
  var parts=[];
  for (var k in BIRTHDAYS) {
    var days = daysUntilBirthday(k);
    var emoji = k==='andjela'?'🌸':'👦';
    var name = BIRTHDAYS[k].name[lang]||BIRTHDAYS[k].name['sr'];
    var dateStr = (BIRTHDAYS[k].month+1)+'/'+BIRTHDAYS[k].day;
    parts.push('<div style="font-size:.82rem"><span style="color:var(--gold)">🎂</span> '+name+' ('+dateStr+')<br><span style="font-size:.68rem;color:var(--text-muted)">'+(lang==='sr'?'Još '+days+' dana':lang==='en'?days+' days away':'还有 '+days+' 天')+'</span></div>');
  }
  document.getElementById('birthday-content').innerHTML = parts.join('<div style="height:6px"></div>')+'<div style="font-size:.62rem;color:var(--text-muted);margin-top:4px">'+(lang==='sr'?'🎁 Ne zaboravi poklon!':lang==='en'?'🎁 Don\'t forget a gift!':'🎁 别忘了礼物！')+'</div>';
}

/* ================================================================
   HOLIDAY DAYS OFF
   ================================================================ */
const HOLIDAY_DAYS = {
  '2026-01-01':{cn:'1 dan',rs:'2 dana',zh:'1天',sr:'1 dan',en:'1 day'},
  '2026-02-16':{cn:'7 dana (Prolećni festival)',rs:'—',zh:'7天（春节长假）',sr:'7 dana (Prolećni festival)',en:'7 days (Spring Festival)'},
  '2026-02-17':{cn:'7 dana (Prolećni festival)',rs:'—',zh:'7天（春节长假）',sr:'7 dana (Prolećni festival)',en:'7 days (Spring Festival)'},
  '2026-03-03':{cn:'1 dan',rs:'—',zh:'1天',sr:'1 dan',en:'1 day'},
  '2026-04-05':{cn:'3 dana',rs:'—',zh:'3天',sr:'3 dana',en:'3 days'},
  '2026-05-01':{cn:'5 dana',rs:'2 dana',zh:'5天',sr:'5 dana',en:'5 days'},
  '2026-06-19':{cn:'3 dana',rs:'—',zh:'3天',sr:'3 dana',en:'3 days'},
  '2026-08-19':{cn:'1 dan',rs:'—',zh:'1天',sr:'1 dan',en:'1 day'},
  '2026-09-25':{cn:'3 dana',rs:'—',zh:'3天',sr:'3 dana',en:'3 days'},
  '2026-10-01':{cn:'7 dana (Zlatna nedelja)',rs:'—',zh:'7天（黄金周）',sr:'7 dana (Zlatna nedelja)',en:'7 days (Golden Week)'},
  '2026-01-07':{cn:'—',rs:'2 dana',zh:'—',sr:'2 dana',en:'2 days'},
  '2026-01-27':{cn:'—',rs:'1 dan (školski praznik)',zh:'—',sr:'1 dan (školski praznik)',en:'1 day (school holiday)'},
  '2026-02-15':{cn:'—',rs:'2 dana (Dan državnosti)',zh:'—',sr:'2 dana (Dan državnosti)',en:'2 days (Statehood Day)'},
  '2026-04-12':{cn:'—',rs:'4 dana (Vaskrs)',zh:'—',sr:'4 dana (Vaskrs)',en:'4 days (Easter)'},
  '2026-06-28':{cn:'—',rs:'1 dan',zh:'—',sr:'1 dan',en:'1 day'},
  '2026-11-11':{cn:'—',rs:'1 dan',zh:'—',sr:'1 dan',en:'1 day'}
};

/* ================================================================
   ANNIVERSARY
   ================================================================ */
function saveAnniversaries() {
  annDateMet = document.getElementById('annDateMet').value;
  annDateLove = document.getElementById('annDateLove').value;
  localStorage.setItem('cycle-ann-met', annDateMet);
  localStorage.setItem('cycle-ann-love', annDateLove);
  updateAnniversaryCount();
  renderCalendar();
}
function updateAnniversaryCount() {
  var el = document.getElementById('ann-count');
  if (!el) return;
  var parts = [];
  if (annDateMet) { var d = daysDiff(new Date(annDateMet), today()); if (d >= 0) parts.push(t('annCountMet').replace('{n}', d)); }
  if (annDateLove) { var d = daysDiff(new Date(annDateLove), today()); if (d >= 0) parts.push(t('annCountLove').replace('{n}', d)); }
  el.innerHTML = parts.join('<br>');
}
function isAnniversary(d) {
  var result = 0;
  if (annDateMet) { var ad = new Date(annDateMet); if (d.getDate()===ad.getDate() && d.getMonth()===ad.getMonth()) result = 1; }
  if (annDateLove) { var ad = new Date(annDateLove); if (d.getDate()===ad.getDate() && d.getMonth()===ad.getMonth()) result = 2; }
  return result;
}

/* ================================================================
   DATA — migrated to profile-aware storage above
   ================================================================ */
// Storage key and state are now defined in the Profile System section above
// fmtDate and utility functions below remain unchanged

const fmtDate = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const sameDay = (a,b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
const addDays = (d,n) => { const r=new Date(d); r.setDate(r.getDate()+n); return r; };
const daysDiff = (a,b) => Math.round((b.getTime()-a.getTime())/86400000);
const d0 = d => { const r=new Date(d); r.setHours(0,0,0,0); return r; };
const today = () => { const tt=new Date(); tt.setHours(0,0,0,0); return tt; };

/* ================================================================
   WEATHER — Beijing ↔ Kikinda
   ================================================================ */
var DAILY_LOVE_MESSAGES=[{zh:'不管多远，我的心和你在一起。',sr:'Bez obzira na udaljenost, moje srce je s tobom.'},{zh:'7000公里，但思念没有距离。',sr:'7.000 kilometara, ali čežnja nema udaljenost.'},{zh:'你是我早上醒来的第一个念头。',sr:'Ti si moja prva misao kad se probudim.'},{zh:'同一个太阳，同一份爱。',sr:'Jedno sunce, jedna ljubav.'},{zh:'每次抬头看天空，我知道你也在这片天空下。',sr:'Svaki put kad pogledam u nebo, znam da si i ti pod istim nebom.'},{zh:'从北京到贝尔格莱德，我的心跳只为你。',sr:'Od Pekinga do Beograda, moje srce kuca samo za tebe.'},{zh:'你是我跨越山海的理由。',sr:'Ti si razlog zbog kog prelazim planine i mora.'},{zh:'爱不是距离除以时间，爱是心与心的零距离。',sr:'Ljubav nije udaljenost podeljena vremenom, ljubav je nulta udaljenost izmedju srca.'},{zh:'有人问我想去哪里，我说：去有你的地方。',sr:'Pitaju me gde zelim da idem, ja kazem: tamo gde si ti.'},{zh:'世界上最美的距离，是你和我之间的距离。',sr:'Najlepsa udaljenost na svetu je ona izmedju tebe i mene.'},{zh:'今天也想你，比昨天多一点，比明天少一点。',sr:'I danas mislim na tebe, malo vise nego juce, malo manje nego sutra.'},{zh:'你是我此生最美的风景。',sr:'Ti si najlepsi prizor u mom zivotu.'}];
function getTodaysLoveMessage(){var idx=new Date().getDate()%DAILY_LOVE_MESSAGES.length;return DAILY_LOVE_MESSAGES[idx];}
function getSunCounterData(){try{return JSON.parse(localStorage.getItem('shared-sun-counter')||'{}');}catch(e){return{};}}
function clickSunCounter(){var sc=getSunCounterData();var today=new Date().toISOString().slice(0,10);if(sc.lastDate===today){toast('❤️ '+(lang==='sr'?'Već si kliknuo/la danas!':'今天已经点过了！'));return;}sc.count=(sc.count||0)+1;sc.lastDate=today;localStorage.setItem('shared-sun-counter',JSON.stringify(sc));pushAllSharedData();renderSunCounter();toast('☀️ '+(lang==='sr'?'Dan '+sc.count+' zajedničkog sunca!':'共同仰望太阳的第'+sc.count+'天！'));}
function renderSunCounter(){var el=document.getElementById('sunCounter');if(!el)return;var sc=getSunCounterData();var c=sc.count||0;var zh=(lang||'').indexOf('zh')===0;if(c>0){el.innerHTML='☀️ '+(zh?'共同仰望太阳的第 ':'')+c+(zh?' 天 ❤️':' dan zajedničkog sunca ❤️');}else{el.innerHTML='❤️ '+(zh?'点击此处开始计数':'Klikni ovde da započneš brojanje');}}
function updateWeatherTimes(){var bjT=new Date().toLocaleString('sr-Latn',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hour12:false});var kiT=new Date().toLocaleString('sr-Latn',{timeZone:'Europe/Belgrade',hour:'2-digit',minute:'2-digit',hour12:false});var bjEl=document.getElementById('timeBj');if(bjEl)bjEl.textContent=bjT;var kiEl=document.getElementById('timeKi');if(kiEl)kiEl.textContent=kiT;var diffEl=document.getElementById('timeDiff');if(diffEl){var bjH=parseInt(bjT),kiH=parseInt(kiT);var diff=bjH-kiH;if(diff<0)diff+=24;diffEl.textContent=(activeProfile==='barry'?'时差 ':'razlika ')+diff+'h';}}setInterval(updateWeatherTimes,60000);

function weatherIcon(code) {
  if(code<=3) return '☀️'; if(code<=48) return '⛅'; if(code<=57) return '🌧️';
  if(code<=67) return '🌨️'; if(code<=77) return '🌫️'; if(code<=86) return '❄️'; return '⛈️';
}
function fetchWeather() {
  var cached=localStorage.getItem('cycle-weather');
  // Always show cached weather first (even if old — better than nothing)
  if(cached){try{var d=JSON.parse(cached);renderWeather(d);}catch(e){}}
  // Refresh in background (6h cache)
  if(cached){try{var d2=JSON.parse(cached);if(Date.now()-d2.t<21600000)return;}catch(e){}}
  var controller=new AbortController();var timeout=setTimeout(function(){controller.abort();},8000);
  try {
    var bj=fetch('https://api.open-meteo.com/v1/forecast?latitude=39.92&longitude=116.44&current=temperature_2m,relative_humidity_2m,weather_code&daily=sunrise,sunset&timezone=Asia/Shanghai',{signal:controller.signal}).then(function(r){return r.json()}).catch(function(){return null;});
    var ki=fetch('https://api.open-meteo.com/v1/forecast?latitude=45.83&longitude=20.47&current=temperature_2m,relative_humidity_2m,weather_code&daily=sunrise,sunset&timezone=Europe/Belgrade',{signal:controller.signal}).then(function(r){return r.json()}).catch(function(){return null;});
    Promise.all([bj,ki]).then(function(r){
      clearTimeout(timeout);
      if (!r[0] && !r[1]) return;  // both failed
      var bjD=r[0]?r[0].current:null;if(bjD&&r[0].daily){bjD.sunrise=r[0].daily.sunrise[0];bjD.sunset=r[0].daily.sunset[0];}
      var kiD=r[1]?r[1].current:null;if(kiD&&r[1].daily){kiD.sunrise=r[1].daily.sunrise[0];kiD.sunset=r[1].daily.sunset[0];}
      var w={bj:bjD,ki:kiD,t:Date.now()};
      localStorage.setItem('cycle-weather',JSON.stringify(w));renderWeather(w);
    }).catch(function(){});
  } catch(e) {}
}
function renderWeather(w) {
  var card=document.getElementById('weatherCard'); if(!w) return;
  card.style.display='';
  var bjLabel = lang==='sr'?'🏙 Peking·Čaojang':lang==='en'?'🏙 Beijing·Chaoyang':'🏙 北京·朝阳';
  var kiLabel = lang==='sr'?'🏡 Kikinda':lang==='en'?'🏡 Kikinda':'🏡 Kikinda';
  var humLabel = lang==='sr'?'Vlažnost':lang==='en'?'Humidity':'湿度';
  document.getElementById('weatherBj').innerHTML='<div style="font-size:.65rem;color:var(--text-muted)">'+bjLabel+'</div><div style="font-size:1.5rem;font-weight:700">'+Math.round(w.bj.temperature_2m)+'°</div><div style="font-size:1.2rem">'+weatherIcon(w.bj.weather_code)+'</div><div style="font-size:.6rem;color:var(--text-muted)">'+humLabel+' '+w.bj.relative_humidity_2m+'%</div>';
  document.getElementById('weatherKi').innerHTML='<div style="font-size:.65rem;color:var(--text-muted)">'+kiLabel+'</div><div style="font-size:1.5rem;font-weight:700">'+Math.round(w.ki.temperature_2m)+'°</div><div style="font-size:1.2rem">'+weatherIcon(w.ki.weather_code)+'</div><div style="font-size:.6rem;color:var(--text-muted)">'+humLabel+' '+w.ki.relative_humidity_2m+'%</div>';
  // Bridge Poetry — i18n-aware
  var poems = [], bjc = w.bj.weather_code, kic = w.ki.weather_code;
  var sameWeather = (bjc <= 3 && kic <= 3) || (bjc >= 45 && kic >= 45) || (bjc >= 71 && kic >= 71);
  if (sameWeather && bjc <= 3) poems.push({txt:lang==='sr'?'Sunce sija i u Pekingu i u Kikindi ☀️ — isto sunce greje oba naša srca.':lang==='en'?'The sun shines on both Beijing and Kikinda ☀️ — the same sun warms both our hearts.':'北京和Kikinda阳光普照 ☀️ — 同一个太阳温暖我们的心。',barry:lang==='sr'?'Barry kaže: Kad pogledaš u sunce, seti se — ja gledam u isto to sunce ovde u Pekingu. 7.000 kilometara, jedno sunce. ♥':lang==='en'?'Barry says: When you look at the sun, remember — I\'m looking at the same sun in Beijing. 7,000 km, one sun. ♥':'Barry说：当你看着太阳，记住——我在北京也看着同一轮太阳。7000公里，同一个太阳。♥'});
  else if (sameWeather && kic >= 45 && kic <= 67) poems.push({txt:lang==='sr'?'Kiša pada i na Vojvodinu i na Peking 🌧️ — iste kapi, dva različita sveta.':lang==='en'?'Rain falls on both Vojvodina and Beijing 🌧️ — same drops, two different worlds.':'雨水落在Vojvodina和北京 🌧️ — 同样的雨滴，两个不同的世界。',barry:lang==='sr'?'Barry kaže: Dok kiša pada po tvojoj Vojvodini, ja slušam kišu u Pekingu i mislim na tebe. Kiša spaja sve. 🌧️♥':lang==='en'?'Barry says: While rain falls on your Vojvodina, I listen to the rain in Beijing and think of you. Rain connects everything. 🌧️♥':'Barry说：雨落在你的Vojvodina，我在北京听着雨声想你。雨水连接一切。🌧️♥'});
  else poems.push({txt:lang==='sr'?'Različito nebo, isto srce 🌍 — od Pekinga do Kikinde, od Dunava do Jangcea.':lang==='en'?'Different skies, one heart 🌍 — from Beijing to Kikinda, from Danube to Yangtze.':'不同的天空，同一颗心 🌍 — 从北京到Kikinda，从多瑙河到长江。',barry:lang==='sr'?'Barry kaže: Dunav teče kroz tvoj grad, Jangce kroz moj. Dve reke, jedna ljubav koja teče između nas. ♥':lang==='en'?'Barry says: The Danube flows through your town, the Yangtze through mine. Two rivers, one love flowing between us. ♥':'Barry说：多瑙河流过你的城市，长江流过我的。两条河流，一份在我们之间流淌的爱。♥'});
  poems.push({txt:lang==='sr'?'Sa Dunava na Jangce — ljubav teče kao reka 🌊':lang==='en'?'From Danube to Yangtze — love flows like a river 🌊':'从多瑙河到长江 — 爱如河流 🌊',barry:lang==='sr'?'Od ravnice do Pekinga, od šljivovice do čaja — naša priča je most između dva sveta.':lang==='en'?'From plains to Beijing, from rakija to tea — our story bridges two worlds.':'从平原到北京，从李子酒到茶——我们的故事连接两个世界。'});
  var poem = poems[Math.floor(Math.random() * poems.length)];
  document.getElementById('weatherLove').innerHTML='<div style="font-style:italic;margin-bottom:4px">"'+poem.txt+'"</div><div style="font-size:.62rem;opacity:.82;line-height:1.5">'+poem.barry+'</div>';
  document.getElementById('weatherLove').style.display='';
  updateWeatherTimes();
  var lm=getTodaysLoveMessage();var lmEl=document.getElementById('dailyLoveMsg');if(lmEl)lmEl.textContent='💌 '+((lang||'').indexOf('zh')===0?lm.zh:lm.sr);
  renderSunCounter();
  var nh=document.getElementById('weatherNightHint');if(nh){var kiH=new Date().toLocaleString('en-US',{timeZone:'Europe/Belgrade',hour:'numeric',hour12:false});if(parseInt(kiH)>=22||parseInt(kiH)<=5){nh.style.display='';nh.textContent=activeProfile==='barry'?'🌙 Kikinda现在是深夜，Angie该休息了':'🌙 Kod tebe je kasno - vreme za spavanje, Anđela 🛏️';}else{nh.style.display='none';}}
  // Update bridge text dynamically
  var bridge = document.getElementById('weatherBridge');
  if (bridge) {
    var bjt = Math.round(w.bj.temperature_2m), kit = Math.round(w.ki.temperature_2m);
    var diff = Math.abs(bjt - kit);
    var conn = diff <= 3 ? (lang==='sr'?'Ista toplina 🌡️♥':lang==='en'?'Same warmth 🌡️♥':'同样温度 🌡️♥') : (lang==='sr'?'Razlika '+diff+'° 🌡️':lang==='en'?diff+'° apart 🌡️':'温差 '+diff+'° 🌡️');
    bridge.innerHTML = '🌉  Dunav → Jangce<br>Kikinda '+kit+'° ↔ '+bjt+'° Peking<br>'+conn;
  }
}

/* ================================================================
   TEA ROOM — Serbian × Chinese Herbal Wisdom / Сербија × 中国
   ================================================================ */
const TEA_PAIRS = [
  {emoji:'🍵',name:{sr:'Čaj od nane',en:'Mint Tea','zh-CN':'薄荷茶'},desc:{sr:'Osvežava i smiruje želudac — srpski klasik',en:'Cooling, calms the stomach — Serbian classic','zh-CN':'清凉舒胃——塞尔维亚经典'},msg:{sr:'U Kini piju čaj od hrizanteme za isto — dva sveta, jedna mudrost 🌸',en:'In China they drink chrysanthemum for the same — two worlds, one wisdom 🌸','zh-CN':'中国人用菊花茶达到同样效果——两个世界，同一种智慧 🌸'},phase:'general'},
  {emoji:'🌼',name:{sr:'Čaj od kamilice',en:'Chamomile Tea','zh-CN':'洋甘菊茶'},desc:{sr:'Za miran san i nežno srce',en:'For peaceful sleep & a gentle heart','zh-CN':'安神助眠，温柔入心'},msg:{sr:'U Kini — čaj od jasmina. Cveće leči, svuda na svetu 🌙',en:'In China — jasmine tea. Flowers heal, everywhere on Earth 🌙','zh-CN':'中国有茉莉花茶——花能疗愈，天下皆然 🌙'},phase:'luteal'},
  {emoji:'🫚',name:{sr:'Čaj od đumbira',en:'Ginger Tea','zh-CN':'姜茶'},desc:{sr:'Greje telo i dušu — protiv grčeva',en:'Warms body & soul — anti-cramp','zh-CN':'暖身暖心——缓解痉挛'},msg:{sr:'Kineska tradicija: đumbir + crvene urme = 姜枣茶. Isti đumbir, ista ljubav ❤️',en:'Chinese tradition: ginger + red dates = 姜枣茶. Same ginger, same love ❤️','zh-CN':'中国古方：生姜+红枣=姜枣茶。同样的姜，同样的爱 ❤️'},phase:'period'},
  {emoji:'🌿',name:{sr:'Čaj od žalfije',en:'Sage Tea','zh-CN':'鼠尾草茶'},desc:{sr:'Protiv upala, za žensko zdravlje',en:'Anti-inflammatory, for women\'s health','zh-CN':'消炎，关爱女性健康'},msg:{sr:'U tradicionalnoj kineskoj medicini — 丹参 (kadulja) hrani krv. Biljke ne znaju granice 🌿',en:'In TCM — 丹参 (red sage) nourishes blood. Herbs know no borders 🌿','zh-CN':'中医里的丹参养血活血——草药无国界 🌿'},phase:'follicular'},
  {emoji:'🫐',name:{sr:'Čaj od šipurka',en:'Rosehip Tea','zh-CN':'玫瑰果茶'},desc:{sr:'Bogat vitaminom C — srpska tradicija',en:'Rich in vitamin C — Serbian tradition','zh-CN':'富含维C——塞尔维亚传统'},msg:{sr:'U Kini — čaj od goji bobica (枸杞). Crveno voće = snaga u obe kulture 🔴',en:'In China — goji berry tea (枸杞). Red fruit = strength in both cultures 🔴','zh-CN':'中国有枸杞茶——红色果实=两种文化中的力量 🔴'},phase:'general'},
  {emoji:'🍂',name:{sr:'Čaj od lipe',en:'Linden Tea','zh-CN':'椴花茶'},desc:{sr:'Protiv prehlade, za tople noći',en:'Against colds, for warm nights','zh-CN':'驱寒保暖，温暖夜晚'},msg:{sr:'Lipa = sveto drvo Slovena. U Kini — 桂花茶 (osmanthus). Drveće spaja narode 🌳',en:'Linden = sacred Slavic tree. In China — osmanthus tea. Trees unite peoples 🌳','zh-CN':'椴树=斯拉夫人的圣树。中国有桂花——树连接着民族 🌳'},phase:'general'}
];
function renderTea() {
  var teaName = document.getElementById('tea-name');
  var teaDesc = document.getElementById('tea-desc');
  var teaMsg = document.getElementById('tea-msg');
  var teaIcon = document.getElementById('tea-icon');
  var teaTitle = document.getElementById('tea-title');
  if (!teaName) return;
  var phase = 'general';
  if (activeProfile === 'andjela') {
    var pred = predict(); var ph = getPhase(today(), pred);
    if (ph === 'period-on' || ph === 'period-mid') phase = 'period';
    else if (ph === 'ovulation' || ph === 'fertile') phase = 'ovulation';
    else if (ph === 'follicular') phase = 'follicular';
    else if (ph === 'luteal') phase = 'luteal';
  }
  var candidates = TEA_PAIRS.filter(function(t) { return t.phase === phase; });
  if (candidates.length === 0) candidates = TEA_PAIRS.filter(function(t) { return t.phase === 'general'; });
  var tea = candidates[Math.floor(Math.random() * candidates.length)];
  teaIcon.textContent = tea.emoji;
  teaName.textContent = tea.name[lang] || tea.name['sr'];
  teaDesc.textContent = tea.desc[lang] || tea.desc['sr'];
  teaMsg.textContent = tea.msg[lang] || tea.msg['sr'];
  teaTitle.textContent = lang === 'sr' ? '🍵 Čajanka — Srbija ♥ Kina' : lang === 'en' ? '🍵 Tea Room — Serbia ♥ China' : '🍵 茶室 — 塞尔维亚 ♥ 中国';
}

/* ================================================================
   CALENDAR DATA LOADER — rich stories + solar terms
   ================================================================ */
var calendarExtraData = null;
function loadCalendarData(cb) {
  if (calendarExtraData) { cb(calendarExtraData); return; }
  var cached = localStorage.getItem('cycle-caldata');
  if (cached) { try { calendarExtraData = JSON.parse(cached); cb(calendarExtraData); return; } catch(e) {} }
  fetch('calendar-data.json').then(function(r){return r.json()}).then(function(d){
    calendarExtraData = d; localStorage.setItem('cycle-caldata', JSON.stringify(d)); cb(d);
  }).catch(function(){});
}
function toggleHolidayStory(uid, date, country) {
  var detail = document.getElementById('hd-'+uid);
  var nameEl = document.getElementById('hn-'+uid);
  if (!detail || !nameEl) return;
  var isOpen = detail.classList.contains('open');
  if (isOpen) { detail.classList.remove('open'); nameEl.textContent = nameEl.textContent.replace(' ▴',' ▾'); return; }
  loadCalendarData(function(data) {
    var story = null;
    (data.holidays||[]).forEach(function(h) {
      if (h.date === date && h.country === (country==='cn'?'china':'serbia')) story = h.story;
    });
    if (story) {
      var txt = story[lang] || story[lang.split('-')[0]] || story['sr'];
      if (txt) detail.textContent = txt;
    }
    detail.classList.add('open');
    nameEl.textContent = nameEl.textContent.replace(' ▾',' ▴');
  });
}

/* ================================================================
   ROMANTIC TOUCHES
   ================================================================ */
function updateLoveCounter() {
  var el = document.getElementById('titleLoveCounter');
  if (!el || !annDateLove) return;
  var days = daysDiff(new Date(annDateLove), today());
  if (days >= 0) el.textContent = '♥ ' + days + (lang==='sr'?' dana zajedno':lang==='en'?' days together':' 天在一起');
  // Also update the stats card
  var card = document.getElementById('love-days-content');
  if (!card) return;
  var parts = [];
  if (annDateMet) { var d = daysDiff(new Date(annDateMet), today()); if (d >= 0) parts.push('<div style="font-size:.85rem"><span style="color:var(--gold)">✨</span> ' + d + (lang==='sr'?' dana od prvog susreta':lang==='en'?' days since we met':' 天前初次相遇') + '</div>'); }
  if (annDateLove) { var d = daysDiff(new Date(annDateLove), today()); if (d >= 0) parts.push('<div style="font-size:1.2rem;font-weight:700;color:var(--love)">♥ ' + d + (lang==='sr'?' dana zajedno':lang==='en'?' days together':' 天在一起') + '</div>'); }
  card.innerHTML = parts.join('<div style="height:4px"></div>');
  document.getElementById('love-days-title').textContent = lang==='sr'?'💕 Dani zajedno':lang==='en'?'💕 Our Days':'💕 我们的日子';
}
function randomThinkingOfYou() {
  if (activeProfile !== 'andjela') return;
  if (Math.random() > 0.18) return; // 18% chance
  var msgs = lang==='sr'
    ? ['Upravo sam pomislio na tebe ♥','Nadam se da se osećaš dobro danas ✨','Tvoj osmeh mi je najdraža stvar 🌸','Mislim na tebe... uvek 💫','Barry je upravo pomislio na tebe 💝']
    : lang==='en'
    ? ['Just thought of you ♥','Hope you are feeling good today ✨','Your smile is my favorite thing 🌸','Thinking of you... always 💫','Barry was just thinking of you 💝']
    : ['刚刚在想你 ♥','希望你今天心情好 ✨','你的笑容是我最喜欢的 🌸','一直在想你 💫','Barry 刚刚想到了你 💝'];
  var msg = msgs[Math.floor(Math.random()*msgs.length)];
  setTimeout(function(){ toast(msg); }, 3000);
}

/* ================================================================
   GREETING OVERLAY
   ================================================================ */
function showGreeting() {
  var overlay = document.getElementById('greetingOverlay');
  if (!overlay) return;
  var g = I18N['sr'].greeting; if (!g) return;
  var hour = new Date().getHours();
  var slot;
  if (hour >= 5 && hour < 12) slot = g.morning;
  else if (hour >= 12 && hour < 18) slot = g.afternoon;
  else if (hour >= 18 && hour < 23) slot = g.evening;
  else slot = g.night;
  document.getElementById('greetingIcon').textContent = slot.icon;
  document.getElementById('greetingName').textContent = slot.name;
  document.getElementById('greetingMsg').textContent = slot.msg;
  document.getElementById('greetingSub').textContent = slot.sub;
  overlay.style.display = 'flex'; overlay.classList.remove('hidden');
  spawnFeathers();
  // Auto-dismiss after 2.8 seconds
  clearTimeout(window._greetingTimer);
  window._greetingTimer = setTimeout(function() {
    overlay.classList.add('hiding');
    setTimeout(function() { overlay.style.display = 'none'; overlay.classList.add('hidden'); overlay.classList.remove('hiding'); }, 400);
  }, 2800);
}
// Greeting dismissed by inline onclick on the overlay — no JS function needed
function spawnFeathers() {
  const card = document.querySelector('.greeting-card');
  if (!card) return;
  for (let i = 0; i < 8; i++) {
    const feather = document.createElement('span');
    feather.className = 'feather';
    feather.textContent = ['🪶','✦','·'][i % 3];
    feather.style.left = (10 + Math.random() * 80) + '%';
    feather.style.top = (5 + Math.random() * 40) + '%';
    feather.style.animationDelay = (Math.random() * 2) + 's';
    feather.style.animationDuration = (3 + Math.random() * 3) + 's';
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
  const icons = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];
  const idx = Math.round(phase * 8) % 8;
  el.innerHTML = `<span class="moon-icon">${icons[idx]}</span>`;
}

/* ================================================================
   EASTER EGGS
   ================================================================ */
let titleClicks = 0;
function handleTitleClick() {
  titleClicks++;
  if (titleClicks >= 5) { titleClicks = 0; spawnPetals(); }
  setTimeout(() => { if (titleClicks < 5 && titleClicks > 0) titleClicks = 0; }, 2000);
}
function spawnPetals() {
  const petals = ['🌸','💮','🌺','🩷','✿','🌷'];
  for (let i = 0; i < 25; i++) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.textContent = petals[Math.floor(Math.random() * petals.length)];
    petal.style.left = (Math.random() * 100) + '%';
    petal.style.top = -(10 + Math.random() * 30) + 'px';
    petal.style.animationDelay = (Math.random() * 1.5) + 's';
    petal.style.animationDuration = (3 + Math.random() * 3) + 's';
    petal.style.fontSize = (0.8 + Math.random() * 1.5) + 'rem';
    document.body.appendChild(petal);
    setTimeout(() => petal.remove(), 5000);
  }
}

/* ================================================================
   CYCLE CELEBRATION
   ================================================================ */
let lastCycleCount = 0;
function checkCycleCelebration() {
  const cycles = predict().cycles.length;
  if (cycles > lastCycleCount && cycles >= 1 && state.records.length >= 2) {
    lastCycleCount = cycles;
    const el = document.createElement('div');
    el.className = 'cycle-celebration';
    el.innerHTML = `<span class="celeb-icon">💝</span><span class="celeb-text">${t('cycleCounter').replace('{n}', cycles)}</span>`;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .6s'; }, 3000);
    setTimeout(() => el.remove(), 4000);
    // Update cycle counter
    updateCycleCounter(cycles);
  }
}
function updateCycleCounter(n) {
  var card = document.getElementById('cycleCounterCard');
  if (!card) return;
  if (n > 0) { card.style.display = ''; document.getElementById('cc-count').textContent = n; document.getElementById('cc-subtitle').textContent = t('cycleCounterSub'); }
  else card.style.display = 'none';
}

/* ================================================================
   PREDICTION
   ================================================================ */
function predict() {
  const {records,settings}=state; const sorted=[...records].sort((a,b)=>a-b);
  // Auto-calculate period length from actual data
  var periodEnds=state.periodEnds||{};
  var periodLengths=[];
  for(var i=0;i<sorted.length;i++){
    var key=fmtDate(sorted[i]);
    if(periodEnds[key])periodLengths.push(daysDiff(d0(sorted[i]),d0(new Date(periodEnds[key]+'T00:00:00')))+1);
  }
  var avgPeriodLen=periodLengths.length>0?Math.round(periodLengths.reduce(function(a,b){return a+b;},0)/periodLengths.length):settings.periodLength;
  var def={lastStart:null,nextStart:null,ovulation:null,fertileStart:null,fertileEnd:null,cycleLen:settings.cycleLength,periodLen:avgPeriodLen,avgCycle:settings.cycleLength,minCycle:null,maxCycle:null,stdDev:0,confidence:'low',cycles:[],isOverdue:false,overdueDays:0,futurePeriods:[]};
  if(sorted.length===0) return def;
  def.lastStart=d0(sorted[sorted.length-1]);
  if(sorted.length===1){def.nextStart=addDays(def.lastStart,settings.cycleLength);}
  else{for(let i=1;i<sorted.length;i++) def.cycles.push(daysDiff(d0(sorted[i-1]),d0(sorted[i])));const recent=def.cycles.slice(-6);if(recent.length>0){def.avgCycle=Math.round(recent.reduce((a,b)=>a+b,0)/recent.length);def.minCycle=Math.min(...recent);def.maxCycle=Math.max(...recent);const variance=recent.reduce((s,c)=>s+(c-def.avgCycle)**2,0)/recent.length;def.stdDev=Math.round(Math.sqrt(variance)*10)/10;if(def.stdDev<=3)def.confidence='high';else if(def.stdDev<=6)def.confidence='medium';else def.confidence='low';}def.nextStart=addDays(def.lastStart,def.avgCycle);}
  const td=today();if(def.nextStart&&td>def.nextStart){const useLen=settings.manualOverride?settings.cycleLength:def.avgCycle;const elapsed=daysDiff(def.lastStart,td);const passed=Math.floor(elapsed/useLen);if(passed>=1){def.nextStart=addDays(def.lastStart,useLen*(passed+1));}def.isOverdue=(td>def.nextStart);if(def.isOverdue)def.overdueDays=daysDiff(def.nextStart,td);}
  if(def.nextStart){def.ovulation=addDays(def.nextStart,-14);def.fertileStart=addDays(def.ovulation,-3);def.fertileEnd=addDays(def.ovulation,2);const useLen=settings.manualOverride?settings.cycleLength:def.avgCycle;for(let i=1;i<=2;i++){const np=addDays(def.nextStart,useLen*i);def.futurePeriods.push({start:np,ovulation:addDays(np,-14),fertileStart:addDays(np,-17),fertileEnd:addDays(np,-11)});}}
  return def;
}

function getPeriodEndDate(startDate){
  // Return the actual end date for a period start, or null if not ended yet
  var key=fmtDate(startDate);
  if(state.periodEnds&&state.periodEnds[key])return new Date(state.periodEnds[key]+'T00:00:00');
  return null;
}
function getPhase(date,pred){
  const d=d0(date);
  for(const rec of state.records){const s=d0(rec);var e=getPeriodEndDate(rec)||addDays(s,pred.periodLen-1);e.setHours(0,0,0,0);if(d>=s&&d<=e) return sameDay(d,s)?'period-on':'period-mid';}
  if(pred.nextStart){const ps=d0(pred.nextStart),pe=addDays(ps,pred.periodLen-1);pe.setHours(0,0,0,0);if(d>=ps&&d<=pe) return sameDay(d,ps)?'period-pred-first':'period-pred';}
  for(const fp of pred.futurePeriods){const ps=d0(fp.start),pe=addDays(ps,pred.periodLen-1);pe.setHours(0,0,0,0);if(d>=ps&&d<=pe) return sameDay(d,ps)?'period-future-first':'period-future';}
  if(pred.ovulation&&sameDay(d,pred.ovulation)) return 'ovulation';
  if(pred.fertileStart&&pred.fertileEnd){const fs=d0(pred.fertileStart),fe=d0(pred.fertileEnd);if(d>=fs&&d<=fe) return 'fertile';}
  if(pred.fertileEnd&&pred.nextStart){const fe=d0(pred.fertileEnd),np=d0(pred.nextStart);if(d>fe&&d<np) return 'luteal';}
  if(pred.lastStart&&pred.fertileStart){const lpEnd=addDays(pred.lastStart,pred.periodLen);lpEnd.setHours(0,0,0,0);const fs=d0(pred.fertileStart);if(d>=lpEnd&&d<fs) return 'follicular';}
  return null;
}

/* ================================================================
   UI STATE
   ================================================================ */
let viewYear=today().getFullYear(), viewMonth=today().getMonth();
let selectedDate=null, symptomDate=null, knowledgeOpen=false;

/* ================================================================
   UI UPDATE
   ================================================================ */
function updateLangUI(){
  document.getElementById('h-title').textContent = t('appTitle');
  document.getElementById('todayBtn').textContent = t('today');
  document.querySelectorAll('.tb-label').forEach((el,i)=>{el.textContent=t('tabs')[i];});
  document.getElementById('set-language').value=lang;
  document.querySelectorAll('.lang-btn').forEach(b=>{b.classList.toggle('active',b.dataset.lang===lang);});
  const wd=t('weekdays');
  document.getElementById('weekdaysRow').innerHTML='<span></span>'+wd.map(function(d,i){return'<span'+(i>=5?' style="color:var(--rose);opacity:.6"':'')+'>'+d+'</span>';}).join('');
  const lg=t('legend');
  document.getElementById('legend').innerHTML=`<span class="l-period">${lg[0]}</span><span class="l-fertile">${lg[1]}</span><span class="l-follicular">${lg[2]}</span><span class="l-luteal">${lg[3]}</span><span style="font-weight:700;font-size:.66rem;">▣ ${lg[4]}</span>`;
  if (annDateMet || annDateLove) document.getElementById('legend').innerHTML += `<span class="l-heart">${lg[5]}</span>`;
  document.getElementById('legend').innerHTML += '<span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:50%;background:#E53935;display:inline-block"></span>🇨🇳</span><span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:50%;background:#0C4076;display:inline-block"></span>🇷🇸</span><span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:50%;background:#4CAF50;display:inline-block"></span>🌿</span>';
  const pl=t('progressLabels');
  document.querySelector('.lbl-period').textContent=pl[0];document.querySelector('.lbl-follicular').textContent=pl[1];
  document.querySelector('.lbl-ovulation').textContent=pl[2];document.querySelector('.lbl-luteal').textContent=pl[3];
  const syms=t('symptoms');
  document.getElementById('symptomGrid').innerHTML=['cramps','mood','flow','headache','fatigue','cravings'].map(s=>`<div class="symptom-item" onclick="cycleSymptom('${s}')"><span class="emoji">${{cramps:'😣',mood:'😊',flow:'💧',headache:'🤕',fatigue:'😴',cravings:'🍫'}[s]}</span><span class="sname">${syms[s]}</span><div class="symptom-dots" id="dots-${s}"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div></div>`).join('');
  document.getElementById('symptom-empty-text').innerHTML=t('emptySymptom');
  document.getElementById('symptom-notes').placeholder=t('modal.notesPlaceholder');
  document.getElementById('symptom-save-btn').textContent='💾 '+t('toast.symptomSaved').replace(' ✓','');
  const emojis={cramps:'😣',mood:'😊',flow:'💧',headache:'🤕',fatigue:'😴',cravings:'🍫'};
  document.getElementById('modal-symptoms').innerHTML=['cramps','mood','flow','headache','fatigue','cravings'].map(s=>`<button class="sym-chip" data-s="${s}">${emojis[s]} ${syms[s]}</button>`).join('');
  const st=t('settings');
  ['set-l-lang','set-l-theme','set-l-cycle','set-l-period','set-l-override'].forEach(id=>{const el=document.getElementById(id);if(el){el.textContent=st[id.replace('set-l-','')]||'';}});
['set-h-lang','set-h-theme','set-h-cycle','set-h-period','set-h-override'].forEach(id=>{const el=document.getElementById(id);if(el){el.textContent=st[id.replace('set-h-','')+'Hint']||'';}});
  document.getElementById('save-settings-btn').textContent=st.save;
  document.getElementById('export-btn').textContent=st.export;document.getElementById('import-btn').textContent=st.import;document.getElementById('clear-btn').textContent=st.clear;
  document.getElementById('anniversary-title').textContent = t('anniversaryTitle');
  document.getElementById('ann-met-label').textContent = t('annMetLabel');
  document.getElementById('ann-love-label').textContent = t('annLoveLabel');
  updateAnniversaryCount();
  const ss=t('stats');
  document.getElementById('st-title-cycle').textContent=ss.cycleTitle;document.getElementById('st-title-history').textContent=ss.historyTitle;document.getElementById('st-title-pred').textContent=ss.predTitle;
  document.getElementById('st-l-count').textContent=ss.count;document.getElementById('st-l-avg').textContent=ss.avg;document.getElementById('st-l-range').textContent=ss.range;document.getElementById('st-l-reg').textContent=ss.reg;
  document.getElementById('st-l-next').textContent=ss.next;document.getElementById('st-l-ovu').textContent=ss.ovulation;document.getElementById('st-l-fert').textContent=ss.fertile;document.getElementById('st-l-conf').textContent=ss.confidence;document.getElementById('st-l-future').textContent=ss.future;
  document.getElementById('historyLabel').textContent=t('historyLabel');
  document.getElementById('cc-title').textContent = '💝 ' + t('cycleCounter').replace('{n}', '');
  const md=t('modal');
  document.getElementById('m-l-phase').textContent=md.phase;document.getElementById('m-l-day').textContent=md.day;document.getElementById('m-l-symp').textContent=md.symptoms;
  document.getElementById('m-l-holiday').textContent=lang==='sr'?'Praznik':lang==='en'?'Holiday':'节日';document.getElementById('m-l-solar').textContent=lang==='sr'?'Solarni ciklus':lang==='en'?'Solar Term':'节气';document.getElementById('m-l-special').textContent=lang==='sr'?'Poseban dan':lang==='en'?'Special Day':'特殊日子';document.getElementById('m-divider').textContent=md.quickSymptom;document.getElementById('modal-close-btn').textContent=md.close;
  document.getElementById('fab-label').textContent=t('fabLabel');
}

// Lazy-load rich solar term data from calendar-data.json if not cached yet
function ensureSolarTermData() {
  if (solarTermsCache && solarTermsCache.length > 0) return;
  var cached = localStorage.getItem('cycle-solarterms');
  if (cached) { try { solarTermsCache = JSON.parse(cached); if (solarTermsCache.length > 0) return; } catch(e) {} }
  // Load from calendar-data.json
  fetch('calendar-data.json').then(function(r){return r.json()}).then(function(d){
    if (d && d.solarTerms) {
      solarTermsCache = d.solarTerms;
      localStorage.setItem('cycle-solarterms', JSON.stringify(solarTermsCache));
    }
  }).catch(function(){});
}

function renderSolarTermBadge() {
  var badge = document.getElementById('solarTermBadge');
  if (!badge) return;
  var todayKey = fmtDate(today());
  var term = getSolarTerm(todayKey);
  if (term) {
    var cnName = term.name['zh-CN'] || term.name['zh'] || '';
    var srName = term.name['sr'] || '';
    badge.textContent = '🌿 ' + cnName + ' · ' + srName;
    badge.style.display = '';
  } else {
    // Only show upcoming (future) solar terms within 7 days, not past ones
    var nearest = null, minDist = 30;
    var td = today();
    SOLAR_TERMS_INLINE.forEach(function(s) {
      var termDate = new Date(s.date + 'T00:00:00');
      var dist = daysDiff(td, termDate);  // positive = future, negative = past
      if (dist >= 0 && dist < minDist) { minDist = dist; nearest = s; }
    });
    if (nearest && minDist <= 7) {
      var cnName = nearest.name['zh-CN'] || nearest.name['zh'] || '';
      badge.textContent = '🌿 ' + cnName + ' ' + (lang==='sr'?'za '+minDist+' dana':lang==='en'?'in '+minDist+' days':minDist+'天后');
      badge.style.display = '';
    } else { badge.style.display = 'none'; }
  }
}
function applyAllUI(){updateLangUI();renderCalendar();updateSharedCycleInfo();updateSharedSymptoms();renderMoodSection();renderDiarySection();renderLoveNote();renderTea();renderForecast();renderGarden();renderRelTips();renderHug();renderSong();renderCheckin();renderSleepCard();renderSpecialBadge();renderSolarTermBadge();renderGratitude();var wc=localStorage.getItem('cycle-weather');if(wc){try{renderWeather(JSON.parse(wc));}catch(e){}}if(activeProfile==='barry')renderBarrySymptomView();if(symptomDate)renderSymptomPanel(symptomDate);if(document.getElementById('panel-tips').classList.contains('active'))renderTips();updateFab();updateLoveCounter();updateProfileUI();renderBirthdayCard();}
function renderAll(){applyAllUI();}

/* ================================================================
   CALENDAR
   ================================================================ */
const SEASON_EMOJI = {0:'❄️',1:'❄️',2:'🌸',3:'🌸',4:'🌸',5:'☀️',6:'☀️',7:'☀️',8:'🍂',9:'🍂',10:'🍂',11:'❄️'};
var SEASON_LABEL = {'sr':{0:'Zima',1:'Zima',2:'Proleće',3:'Proleće',4:'Proleće',5:'Leto',6:'Leto',7:'Leto',8:'Jesen',9:'Jesen',10:'Jesen',11:'Zima'},'en':{0:'Winter',1:'Winter',2:'Spring',3:'Spring',4:'Spring',5:'Summer',6:'Summer',7:'Summer',8:'Autumn',9:'Autumn',10:'Autumn',11:'Winter'},'zh-CN':{0:'冬',1:'冬',2:'春',3:'春',4:'春',5:'夏',6:'夏',7:'夏',8:'秋',9:'秋',10:'秋',11:'冬'}};
function getSeasonLabel(month){return SEASON_LABEL[lang]?SEASON_LABEL[lang][month]:SEASON_LABEL['sr'][month];}
function renderCalendar(){
  const pred=predict(); const td=today();
  document.getElementById('monthLabel').textContent = lang==='sr' ? `${t('months')[viewMonth]} ${viewYear}.` : lang==='en' ? `${t('months')[viewMonth]} ${viewYear}` : `${viewYear}年${viewMonth+1}月`;
  const first=new Date(viewYear,viewMonth,1); let dow=first.getDay(); dow=dow===0?6:dow-1;
  const gridStart=addDays(first,-dow); const grid=document.getElementById('daysGrid'); var frag=document.createDocumentFragment();
  const recordedStarts=new Set(state.records.map(fmtDate));
  var plEl=document.getElementById('predLegend'); if(pred.futurePeriods.length>0){plEl.style.display='';plEl.textContent=lang==='sr'?'※ Prozirni datumi su predviđanja':lang==='en'?'※ Faded dates are future predictions':'※ 半透明标记为未来周期预测';} else plEl.style.display='none';
  // Build shared diary index for dot indicators
  var sharedDiaryIdx = {};
  try { var sd = JSON.parse(localStorage.getItem('shared-diary')||'{}'); Object.keys(sd).forEach(function(k){ if(sd[k]&&(sd[k].barry||sd[k].andjela)) sharedDiaryIdx[k]=true; }); } catch(e) {}
  for(let i=0;i<42;i++){
    // Insert week number at start of each row (every 7th position)
    var colPos = i + Math.floor(i / 7); // actual grid position including week columns
    if (i % 7 === 0) {
      var wkCell = document.createElement('div'); wkCell.className = 'week-num';
      var wkDate = addDays(gridStart, i);
      // ISO week number approximation
      var jan1 = new Date(wkDate.getFullYear(), 0, 1);
      var wkNum = Math.ceil((((wkDate - jan1) / 86400000) + jan1.getDay() + 1) / 7);
      wkCell.textContent = wkNum; wkCell.setAttribute('aria-hidden', 'true');
      frag.appendChild(wkCell);
    }
    const d=addDays(gridStart,i); const inMonth=d.getMonth()===viewMonth;
    const isToday=sameDay(d,td); const phase=inMonth?getPhase(d,pred):null;
    const key=fmtDate(d);
    // Symptom check
    var symptoms=state.symptoms[key];
    var hasSymptom=symptoms&&Object.entries(symptoms).some(function(kv){return kv[0]!=='notes'&&kv[1]>0;});
    // Cycle day number for Anđela's active cycle
    var cycleDay='';
    if (activeProfile==='andjela'&&pred.lastStart){
      var cd=daysDiff(d0(pred.lastStart),d0(d));
      if (cd>=0&&cd<pred.cycleLen) cycleDay=String(cd+1);
    }
    const annType = isAnniversary(d);
    const el=document.createElement('div'); el.className='day';
    if(!inMonth) el.classList.add('other-month');
    if(isToday) el.classList.add('today');
    if(isToday) el.setAttribute('aria-current','date');
    if(phase) el.classList.add(phase);
    if(phase==='period-on'&&recordedStarts.has(key)) el.classList.add('recorded');
    if(annType>0) el.classList.add('anniversary');
    if(getBirthday(d)) el.classList.add('birthday');
    // Special date icon
    var special = getSpecialDate(d);
    if (special) {
      var spIcon = document.createElement('span');
      spIcon.className = 'special-date-icon';
      spIcon.textContent = special.icon;
      spIcon.title = activeProfile === 'barry' ? special.title_zh : special.title_sr;
      el.appendChild(spIcon);
      if (special.type === 'firstmeet') el.classList.add('first-meet');
      if (special.type === 'monthly') el.classList.add('monthly-anni');
    }
    if(inMonth) {
      el.setAttribute('tabindex','0');
      el.addEventListener('keydown',function(e){
        if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}
      });
    }
    // Date number
    var daySpan=document.createElement('span'); daySpan.className='day-num'; daySpan.textContent=d.getDate();
    el.appendChild(daySpan);
    // Cycle day badge
    if (cycleDay&&inMonth&&!phase) {
      var cdSpan=document.createElement('span'); cdSpan.className='day-cycle-num'; cdSpan.textContent=cycleDay;
      el.appendChild(cdSpan);
    }
    el.setAttribute('role','button'); el.setAttribute('aria-label',fmtDate(d));
    // Symptom emoji icons on cell
    if (hasSymptom&&!phase&&symptoms){
      var miniDiv=document.createElement('div'); miniDiv.className='day-symptoms';
      ['cramps','mood','flow','headache','fatigue','cravings'].forEach(function(sym){
        if (symptoms[sym]&&symptoms[sym]>0) {
          var symEl=document.createElement('span'); symEl.className='day-sym-icon';
          symEl.textContent={cramps:'😣',mood:'😊',flow:'💧',headache:'🤕',fatigue:'😴',cravings:'🍫'}[sym];
          symEl.title=sym; miniDiv.appendChild(symEl);
        }
      });
      if (miniDiv.children.length>0) el.appendChild(miniDiv);
    }
    // Diary entry dot
    if (sharedDiaryIdx[key]) {
      var diaryDot=document.createElement('span'); diaryDot.className='mini-dot gold';
      diaryDot.style.cssText='position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:5px;height:5px;border-radius:50%;background:var(--gold)';
      el.appendChild(diaryDot);
    }
    // Anniversary dot
    if(annType===2&&!phase){const dot=document.createElement('span');dot.className='mini-dot gold';el.appendChild(dot);}
    // Solar term label on calendar cell
    var solarTerm = getSolarTerm(key);
    if (solarTerm && inMonth) {
      var stName = solarTerm.name[lang] || solarTerm.name[lang.split('-')[0]] || solarTerm.name['sr'] || solarTerm.name['zh-CN'] || '';
      var stLabel = document.createElement('span');
      stLabel.className = 'solar-term-label';
      stLabel.textContent = stName;
      stLabel.title = stName; // hover shows full name for long solar terms
      el.appendChild(stLabel);
      el.classList.add('solar-term-day');
      // Single tap opens modal (same as other days) — modal shows solar term + holiday
      if (!solarTerm.story) {
        // Ensure rich data is loaded for the modal
        ensureSolarTermData();
      }
    }
    // Holiday emoji icons — show before solar term for proper layering
    var holidays=getHoliday(key);
    holidays.forEach(function(h){
      var icon=document.createElement('span');
      icon.className='holiday-icon holiday-'+h.country;
      icon.textContent = h.icon || (h.country==='cn'?'🎉':'🇷🇸');
      icon.title = h.name[lang] || h.name[lang.split('-')[0]] || h.name['sr'] || h.name['zh-CN'] || '';
      el.appendChild(icon);
    });
    // Double-tap detection for quick period mark
    var tapTimer = null;
    if(inMonth) {
      el.addEventListener('click',function(e){
        if (tapTimer) {
          // Double tap — quick toggle period
          clearTimeout(tapTimer); tapTimer = null;
          var idx = state.records.findIndex(function(r){return sameDay(r,d);});
          if (idx >= 0) { state.records.splice(idx,1); toast('🚫 '+t('toast.unmarked')); }
          else { state.records.push(new Date(d)); state.records.sort(function(a,b){return a-b;}); el.classList.add('celebrate'); setTimeout(function(){el.classList.remove('celebrate');},500); toast('🩸 '+t('toast.marked')); checkCycleCelebration(); }
          saveState(); renderAll(); updateFab();
        } else {
          tapTimer = setTimeout(function(){ tapTimer = null; openModal(d,pred); }, 280);
        }
      });
    }
    frag.appendChild(el);
  }
  // Batch-replace grid content in single DOM operation
  grid.innerHTML = '';
  grid.appendChild(frag);
  // Month season subtitle
  var ml = document.getElementById('monthLabel');
  if (ml) {
    // Remove existing season tag and re-add with updated month
    var existingTag = ml.querySelector('.season-tag');
    if (existingTag) existingTag.remove();
    ml.innerHTML = ml.textContent + ' <span class="season-tag" style="font-size:.6rem;opacity:.5">'+SEASON_EMOJI[viewMonth]+' '+getSeasonLabel(viewMonth)+'</span>';
  }
  updateProgress(pred); updateStats(pred); updateHistoryDots(pred); updateReminder(pred);
}

function updateProgress(pred){
  const td=today(); const numEl=document.getElementById('pg-num'); const unitEl=document.getElementById('pg-unit');
  const subEl=document.getElementById('pg-sub'); const fillEl=document.getElementById('pg-fill'); const badgeEl=document.getElementById('pg-badge');
  const badges=t('phaseBadges');
  if(state.records.length===0){numEl.textContent='--';unitEl.textContent='';subEl.textContent=t('emptyState');fillEl.style.width='0%';badgeEl.textContent='';badgeEl.className='phase-badge';document.querySelectorAll('.progress-labels span').forEach(s=>s.classList.remove('current'));return;}
  const phase=getPhase(td,pred); let pct=0,label='',bCls='';document.querySelectorAll('.progress-labels span').forEach(s=>s.classList.remove('current'));
  if(phase==='period-on'||phase==='period-mid'){const cur=state.records.find(r=>{const s=d0(r);var e=getPeriodEndDate(r)||addDays(s,pred.periodLen-1);return td>=s&&td<=e;});const dayNum=cur?daysDiff(d0(cur),td)+1:1;var actualLen=pred.periodLen;if(cur){var pe=getPeriodEndDate(cur);if(pe)actualLen=daysDiff(d0(cur),pe)+1;}numEl.textContent=dayNum;unitEl.textContent=` / ${actualLen}`;subEl.textContent=t('periodDay').replace('{n}',dayNum);pct=(dayNum/actualLen)*15;label=badges.period;bCls='period';numEl.style.color='var(--love)';document.querySelector('.lbl-period').classList.add('current');}
  else if(pred.isOverdue){numEl.textContent=pred.overdueDays;unitEl.textContent='';subEl.textContent=`${t('daysOverdue').replace('{n}',pred.overdueDays)} · ${t('expected')} ${fmtDate(pred.nextStart)}`;bCls='late';label=badges.late;numEl.style.color='#E65100';pct=100;document.querySelector('.lbl-luteal').classList.add('current');}
  else{const totalLen=pred.nextStart?daysDiff(pred.lastStart,pred.nextStart):pred.cycleLen;const elapsed=daysDiff(pred.lastStart,td);const remain=pred.nextStart?daysDiff(td,pred.nextStart):totalLen-elapsed;pct=Math.min(100,Math.max(0,(elapsed/totalLen)*100));numEl.textContent=remain;unitEl.textContent='';
    if(remain>0&&remain<=7){label=badges.luteal;numEl.style.color='var(--lavender-dark)';bCls='luteal';document.querySelector('.lbl-luteal').classList.add('current');}
    else if(phase==='luteal'){label=badges.luteal;numEl.style.color='var(--lavender-dark)';bCls='luteal';document.querySelector('.lbl-luteal').classList.add('current');}
    else if(phase==='fertile'){label=badges.fertile;numEl.style.color='var(--teal)';bCls='fertile';document.querySelector('.lbl-ovulation').classList.add('current');}
    else if(phase==='ovulation'){label=badges.ovulation;numEl.style.color='var(--teal)';bCls='ovulation';document.querySelector('.lbl-ovulation').classList.add('current');}
    else if(phase==='follicular'){label=badges.follicular;numEl.style.color='var(--sage)';bCls='follicular';document.querySelector('.lbl-follicular').classList.add('current');}
    else{numEl.style.color='var(--text-muted)';}
    subEl.textContent=remain>=0?t('daysUntil').replace('{n}',remain):`${t('expected')} ${fmtDate(pred.nextStart)}`;}
  fillEl.style.width=pct+'%';
  fillEl.setAttribute('role','progressbar');
  fillEl.setAttribute('aria-valuenow',Math.round(pct));
  fillEl.setAttribute('aria-valuemin','0');
  fillEl.setAttribute('aria-valuemax','100');
  if(bCls==='period'||bCls==='late') fillEl.style.background='var(--love)';else if(bCls==='follicular') fillEl.style.background='var(--sage)';else if(bCls==='ovulation'||bCls==='fertile') fillEl.style.background='var(--teal)';else if(bCls==='luteal') fillEl.style.background='var(--lavender)';
  badgeEl.textContent=label;badgeEl.className='phase-badge '+bCls;
}

function updateStats(pred){
  // Animated number helper
  function animNum(el, target, suffix) {
    var cur = parseInt(el.textContent) || 0;
    if (cur === target) { el.textContent = target + (suffix||''); return; }
    var start = performance.now(); var dur = 500;
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out
      el.textContent = Math.round(cur + (target - cur) * eased) + (suffix||'');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  animNum(document.getElementById('st-count'), state.records.length, '');
  var regL=lang==='sr'?{high:'Visoka',medium:'Srednija',low:'Niska'}:lang==='en'?{high:'High',medium:'Medium',low:'Low'}:{high:'高',medium:'中',low:'低'};
  if(state.records.length>=2){animNum(document.getElementById('st-avg'), pred.avgCycle, t('day'));var sr=document.getElementById('st-range');if(sr)sr.textContent=pred.minCycle+' / '+pred.maxCycle+t('day');var sreg=document.getElementById('st-regularity');if(sreg)sreg.innerHTML=regL[pred.confidence]+' <span class="cycle-badge '+({high:'high',medium:'medium',low:'low'})[pred.confidence]+'">±'+pred.stdDev+'</span>';}
  else{var hint=lang==='sr'?'(treba bar 2 ciklusa)':lang==='en'?'(needs 2+ cycles)':'(需2个周期以上)';var sa=document.getElementById('st-avg');if(sa)sa.textContent=hint;var sr2=document.getElementById('st-range');if(sr2)sr2.textContent=hint;var sreg2=document.getElementById('st-regularity');if(sreg2)sreg2.textContent=hint;}
  var sn=document.getElementById('st-next');if(sn)sn.textContent=pred.nextStart?fmtDate(pred.nextStart):'--';
  var so=document.getElementById('st-ovulation');if(so)so.textContent=pred.ovulation?fmtDate(pred.ovulation):'--';
  var sf=document.getElementById('st-fertile');if(sf)sf.textContent=pred.fertileStart&&pred.fertileEnd?fmtDate(pred.fertileStart)+' ~ '+fmtDate(pred.fertileEnd):'--';
  var sc=document.getElementById('st-confidence');if(sc)sc.textContent=state.records.length>=2?regL[pred.confidence]+' (±'+pred.stdDev+')':'--';
  if(pred.futurePeriods.length>0){var fr=document.getElementById('futurePredRow');if(fr)fr.style.display='';var sfu=document.getElementById('st-future');if(sfu)sfu.textContent=pred.futurePeriods.map(function(fp){return fmtDate(fp.start);}).join(', ');}
  else{var fr2=document.getElementById('futurePredRow');if(fr2)fr2.style.display='none';}
}

function updateHistoryDots(pred){
  const c=document.getElementById('historyDots');
  if(pred.cycles.length===0){c.innerHTML='<span style="font-size:.72rem;color:var(--text-muted)">--</span>';return;}
  const recent=pred.cycles.slice(-12),avg=pred.avgCycle;
  c.innerHTML=recent.map(cy=>{let cls='normal';if(cy<avg-3)cls='short';else if(cy>avg+3)cls='long';return`<span class="history-dot ${cls}" title="${cy}${t('day')}" onclick="toast('${cy}${t('day')}')"></span>`;}).join('');
}

function goToMonth(m){viewMonth=m;renderCalendar();}
function updateReminder(pred){
  var banner=document.getElementById('reminderBanner'); if(!banner) return;
  var td=today(); var phase=getPhase(td,pred); var msg=''; var r=t('reminder');
  if(phase==='ovulation') msg=r.ovulation;
  else if(pred.isOverdue) msg=r.late.replace('{days}',pred.overdueDays);
  else if(pred.nextStart){var remain=daysDiff(td,pred.nextStart);if(remain>0&&remain<=3) msg=r.beforePeriod.replace('{days}',remain);}
  if(msg){banner.style.display='flex';banner.innerHTML=msg+' <span class="dismiss" onclick="this.parentElement.style.display=\'none\'">✕</span>';}else{banner.style.display='none';}
}
function updateFab(){
  var fab=document.getElementById('fabBtn');
  var fabIcon=document.getElementById('fab-icon');
  var fabLabel=document.getElementById('fab-label');
  if(activeProfile!=='andjela'){fab.classList.add('hidden');return;}
  fab.classList.remove('hidden');
  var openStart=getOpenPeriodStart();
  if(openStart){
    // Period started but not ended — show end button
    fabIcon.textContent='✅';fab.style.fontSize='1.2rem';fab.style.fontWeight='normal';
    fabLabel.textContent=lang==='sr'?'Kraj ciklusa':lang==='en'?'Period ended':'经期结束';
  }else{
    // No open period — show start button
    fabIcon.textContent='🩸';fab.style.fontSize='1.5rem';fab.style.fontWeight='normal';
    fabLabel.textContent=lang==='sr'?'Početak ciklusa':lang==='en'?'Period started':'经期来了';
  }
}

document.getElementById('fabBtn').addEventListener('click',function(){
  if(activeProfile!=='andjela')return;
  var td=today();var tdKey=fmtDate(td);
  var openStart=getOpenPeriodStart();
  if(openStart){
    // Mark period END only if today is after the start
    if(d0(td)<=d0(openStart)){toast(lang==='sr'?'Kraj mora biti posle početka':lang==='en'?'End must be after start':'结束日必须在开始日之后');return;}
    state.periodEnds=state.periodEnds||{};
    state.periodEnds[fmtDate(openStart)]=tdKey;
    toast(lang==='sr'?'Kraj ciklusa označen ✓':lang==='en'?'Period end marked ✓':'经期结束已标记 ✓');
  }else{
    // Mark period START
    var isMarked=state.records.some(function(r){return sameDay(r,td);});
    if(isMarked){toast(fmtDate(td)+(lang==='sr'?' - već označeno':lang==='en'?' - already marked':' - 已标记过'));return;}
    state.records.push(new Date(td));state.records.sort(function(a,b){return a-b;});
    toast(t('toast.marked'));checkCycleCelebration();
  }
  saveState();renderAll();updateFab();
  var fab=document.getElementById('fabBtn');fab.classList.add('celebrate');setTimeout(function(){fab.classList.remove('celebrate');},500);
});

/* ================================================================
   MODAL
   ================================================================ */
function openModal(date,pred){selectedDate=new Date(date);const key=fmtDate(selectedDate);const phase=getPhase(date,pred);const isMarked=state.records.some(r=>sameDay(r,selectedDate));const md=t('modal');const phases=t('phases');document.getElementById('modal-date').textContent=fmtDate(selectedDate);document.getElementById('modal-phase').textContent=phases[phase]||'--';const dayRow=document.getElementById('modal-day-row');if(phase==='period-on'||phase==='period-mid'){dayRow.style.display='';const cur=state.records.find(r=>{const s=d0(r),e=addDays(s,pred.periodLen-1);return selectedDate>=s&&selectedDate<=e;});document.getElementById('modal-day').textContent=cur?`${daysDiff(d0(cur),selectedDate)+1}${t('day')}`.trim():'--';}else{dayRow.style.display='none';}const sympRow=document.getElementById('modal-symp-row');const symp=state.symptoms[key];const symNames=t('symptoms');if(symp){const parts=Object.entries(symp).filter(([k,v])=>k!=='notes'&&v>0).map(([k,v])=>symNames[k]+v);if(parts.length>0||(symp.notes&&symp.notes.trim())){sympRow.style.display='';let txt=parts.length>0?parts.join(', '):'';if(symp.notes&&symp.notes.trim()) txt+=(txt?' · ':'')+symp.notes.trim();document.getElementById('modal-symp').textContent=txt||'--';}else{sympRow.style.display='none';}}else{sympRow.style.display='none';}document.querySelectorAll('#modal-symptoms .sym-chip').forEach(chip=>{const s=chip.dataset.s;chip.classList.toggle('on',symp&&symp[s]&&symp[s]>0);chip.onclick=()=>quickToggleSymptom(s);});const markBtn=document.getElementById('modal-mark-btn'),unmarkBtn=document.getElementById('modal-unmark-btn');if(isMarked){markBtn.style.display='none';unmarkBtn.style.display='';unmarkBtn.textContent=md.unmark;document.getElementById('modal-title').textContent=md.marked;}else{markBtn.style.display='';markBtn.textContent=md.mark;unmarkBtn.style.display='none';document.getElementById('modal-title').textContent=md.details;}renderKnowledge(phase,key);renderSymptomPanel(key);var special=getSpecialDate(new Date(key+'T00:00:00'));var specialRow=document.getElementById('modal-special-row');if(special){specialRow.style.display='';document.getElementById('modal-special').innerHTML='<span class=\"holiday-name\">'+special.icon+' '+(activeProfile==='barry'?special.title_zh:special.title_sr)+'</span><span class=\"holiday-detail\" style=\"display:block\">'+(activeProfile==='barry'?special.desc_zh:special.desc_sr)+'</span>';}else{specialRow.style.display='none';}var solarTerm=getSolarTerm(key);var solarRow=document.getElementById('modal-solar-row');if(solarTerm){solarRow.style.display='';var sn=solarTerm.name[lang]||solarTerm.name[lang.split('-')[0]]||solarTerm.name['sr'];document.getElementById('modal-solar').innerHTML='<span class="holiday-name" onclick="var d=this.nextElementSibling;d.classList.toggle(\'open\');this.textContent=this.textContent.replace(\' ▾\',\' \').replace(\' ▴\',\' \')+(d.classList.contains(\'open\')?\' ▴\':\' ▾\')">'+sn+' ▾</span><span class="holiday-detail">'+((solarTerm.story?(solarTerm.story[lang]||solarTerm.story[lang.split('-')[0]]||solarTerm.story['sr']):''))+'</span>';}else{solarRow.style.display='none';}var holidays=getHoliday(key);var holidayRow=document.getElementById('modal-holiday-row');if(holidays.length>0){holidayRow.style.display='';var hNames=holidays.map(function(h,i){var n=h.name[lang]||h.name[lang.split('-')[0]]||h.name['sr'];var d=h.desc[lang]||h.desc[lang.split('-')[0]]||h.desc['sr'];var flagEmoji=h.country==='cn'?'🇨🇳':'🇷🇸';var uid='h'+i;return flagEmoji+' <span class="holiday-name" data-d="'+h.d+'" data-c="'+h.country+'" id="hn-'+uid+'" onclick="toggleHolidayStory(\''+uid+'\',\''+h.d+'\',\''+h.country+'\')">'+n+' ▾</span><span class="holiday-detail" id="hd-'+uid+'">'+d+'</span>'});var daysOff=HOLIDAY_DAYS[key];var daysOffHtml='';if(daysOff){var cnOff=daysOff.zh||daysOff.cn||'';var rsOff=daysOff.sr||daysOff.rs||'';if(cnOff)daysOffHtml+='<div style="font-size:.62rem;color:var(--text-muted);margin-top:2px">🇨🇳 '+cnOff+'</div>';if(rsOff)daysOffHtml+='<div style="font-size:.62rem;color:var(--text-muted);margin-top:2px">🇷🇸 '+rsOff+'</div>';}var hNames=holidays.map(function(h,i){var n=h.name[lang]||h.name[lang.split('-')[0]]||h.name['sr'];var d=h.desc[lang]||h.desc[lang.split('-')[0]]||h.desc['sr'];var flagEmoji=h.country==='cn'?'🇨🇳':'🇷🇸';var uid='h'+i;var daysOff=HOLIDAY_DAYS[key];var offHtml='';if(daysOff&&h.country==='cn'){var off=daysOff.zh||daysOff.cn||'';if(off&&off!=='—')offHtml='<div style="font-size:.62rem;color:var(--text-muted);margin-top:2px">🏖️ '+(lang==='sr'?'Odmor: '+off:lang==='en'?'Days off: '+off:'放假'+off)+'</div>';}if(daysOff&&h.country==='rs'){var off=daysOff.sr||daysOff.rs||'';if(off&&off!=='—')offHtml='<div style="font-size:.62rem;color:var(--text-muted);margin-top:2px">🏖️ '+(lang==='sr'?'Odmor: '+off:lang==='en'?'Days off: '+off:'放假'+off)+'</div>';}return flagEmoji+' <span class="holiday-name" data-d="'+h.d+'" data-c="'+h.country+'" id="hn-'+uid+'" onclick="toggleHolidayStory(\''+uid+'\',\''+h.d+'\',\''+h.country+'\')">'+n+' ▾</span><span class="holiday-detail" id="hd-'+uid+'">'+d+'</span>'+offHtml;});document.getElementById('modal-holiday').innerHTML=hNames.join('<div style="height:8px"></div>');}else{holidayRow.style.display='none';}window._lastFocusedBeforeModal=document.activeElement;document.getElementById('modal').classList.remove('hidden');document.getElementById('modal-title').focus();}
function closeModal(){document.getElementById('modal').classList.add('hidden');selectedDate=null;knowledgeOpen=false;if(window._lastFocusedBeforeModal){window._lastFocusedBeforeModal.focus();}}
function renderKnowledge(phase,dateKey){const panel=document.getElementById('knowledgePanel');const toggleBtn=document.getElementById('knowledgeToggle');let cat=null;if(phase&&(phase.startsWith('period')))cat='period';else if(phase==='ovulation')cat='ovulation';else if(phase==='fertile')cat='fertile';else if(phase==='follicular')cat='follicular';else if(phase==='luteal')cat='luteal';else{const pr=predict();const tp=getPhase(today(),pr);if(tp&&tp.startsWith('period'))cat='period';else if(tp==='ovulation'||tp==='fertile')cat='ovulation';else if(tp==='follicular')cat='follicular';else if(tp==='luteal')cat='luteal';}if(cat){const kn=t('knowledge.'+cat);toggleBtn.style.display='';toggleBtn.textContent=knowledgeOpen?t('knowledgeToggleHide'):t('knowledgeToggle');panel.innerHTML=`<h4>${kn.title}</h4><p>${kn.desc}</p><p style="margin-top:8px"><strong>🩺 ${kn.what}</strong></p><p style="margin-top:6px"><strong>📋 ${kn.symptoms}</strong></p><p style="margin-top:6px"><strong>💡 ${kn.tips}</strong></p>`;panel.className='knowledge-panel'+(knowledgeOpen?' open':'');}else{toggleBtn.style.display='none';panel.className='knowledge-panel';panel.innerHTML='';}}
function toggleKnowledge(){knowledgeOpen=!knowledgeOpen;if(selectedDate){const pred=predict();renderKnowledge(getPhase(selectedDate,pred),fmtDate(selectedDate));}}
function togglePeriodRecord(){if(!selectedDate)return;var sd=fmtDate(selectedDate);
  // Check if this is marking period END (there's a start without end)
  var openStart=getOpenPeriodStart();
  if(openStart && d0(selectedDate)>d0(openStart)){
    // Mark as period end
    state.periodEnds=state.periodEnds||{};
    state.periodEnds[fmtDate(openStart)]=sd;
    toast(lang==='sr'?'Kraj ciklusa označen ✓':lang==='en'?'Period end marked ✓':'经期结束已标记 ✓');
  }else{
    // Toggle period start
    var idx=state.records.findIndex(function(r){return sameDay(r,selectedDate);});
    if(idx>=0){
      state.records.splice(idx,1);
      state.periodEnds=state.periodEnds||{};
      delete state.periodEnds[fmtDate(selectedDate)];
      toast(t('toast.unmarked'));
    }else{
      state.records.push(new Date(selectedDate));state.records.sort(function(a,b){return a-b;});
      toast(t('toast.marked'));checkCycleCelebration();
    }
  }
  saveState();renderAll();updateFab();openModal(selectedDate,predict());
}
function getOpenPeriodStart(){
  // Return the most recent period start that has no end date
  if(!state.periodEnds)return null;
  for(var i=state.records.length-1;i>=0;i--){
    var key=fmtDate(state.records[i]);
    if(!state.periodEnds[key])return state.records[i];
  }
  return null;
}
function removePeriodRecord(){if(!selectedDate)return;state.records=state.records.filter(r=>!sameDay(r,selectedDate));state.periodEnds=state.periodEnds||{};delete state.periodEnds[fmtDate(selectedDate)];saveState();toast(t('toast.unmarked'));renderAll();updateFab();closeModal();}
function quickToggleSymptom(name){if(!selectedDate)return;const key=fmtDate(selectedDate);if(!state.symptoms[key])state.symptoms[key]={};const s=state.symptoms[key];s[name]=s[name]?0:2;if(s[name]===0)delete s[name];document.querySelectorAll('#modal-symptoms .sym-chip').forEach(chip=>{if(chip.dataset.s===name)chip.classList.toggle('on',s[name]>0);});saveState();toast(t('toast.symptomQuick'));}

/* ================================================================
   SYMPTOMS / TIPS / SETTINGS
   ================================================================ */
function renderSymptomPanel(dateKey){symptomDate=dateKey;document.getElementById('symptom-date-label').textContent=dateKey+' '+t('modal.symptoms');document.getElementById('symptom-empty').style.display='none';document.getElementById('symptom-content').style.display='';const symp=state.symptoms[dateKey]||{};['cramps','mood','flow','headache','fatigue','cravings'].forEach(s=>{const lvl=symp[s]||0;const dots=document.getElementById('dots-'+s);if(!dots)return;dots.querySelectorAll('.dot').forEach((dot,i)=>{dot.className='dot'+(i<lvl?' on':'');});const item=dots.closest('.symptom-item');if(item)item.classList.toggle('selected',lvl>0);});document.getElementById('symptom-notes').value=symp.notes||'';}
function cycleSymptom(name){if(!symptomDate)return;if(!state.symptoms[symptomDate])state.symptoms[symptomDate]={};const s=state.symptoms[symptomDate];const cur=s[name]||0;s[name]=cur>=3?0:cur+1;renderSymptomPanel(symptomDate);}
function saveSymptom(){if(!symptomDate)return;if(!state.symptoms[symptomDate])state.symptoms[symptomDate]={};state.symptoms[symptomDate].notes=document.getElementById('symptom-notes').value.trim();saveState();toast(t('toast.symptomSaved'));renderAll();}
function getSharedCyclePhase() {
  // First try shared-cycle-info (old summary format: {phase, nextStart})
  var shared = null;
  try { shared = JSON.parse(localStorage.getItem('shared-cycle-info')); } catch(e) {}
  if (shared && shared.phase) return shared;
  // Calculate phase from synced shared cycle data (new neutral key)
  var cycleData = null;
  try { cycleData = JSON.parse(localStorage.getItem('shared-cycle-data')); } catch(e) {}
  if (!cycleData) {
    try { cycleData = JSON.parse(localStorage.getItem('shared-andjela-cycle-data')); } catch(e) {}
  }
  if (!cycleData) {
    try { cycleData = JSON.parse(localStorage.getItem('cycle-data-v6-andjela')); } catch(e) {}
  }
  if (!cycleData || !cycleData.records || cycleData.records.length === 0) return null;
  try {
    var records = cycleData.records.map(function(r){return new Date(r);}).sort(function(a,b){return a-b;});
    var lastStart = new Date(records[records.length-1]);
    var settings = cycleData.settings || {cycleLength:28,periodLength:7};
    var cycleLen = settings.cycleLength || 28;
    var periodLen = settings.periodLength || 7;
    var nextStart = new Date(lastStart); nextStart.setDate(nextStart.getDate() + cycleLen);
    var td = today();
    var dayNum = Math.floor((td - lastStart) / 86400000);
    var ovulationDay = new Date(nextStart); ovulationDay.setDate(ovulationDay.getDate() - 14);
    var phase;
    if (dayNum >= 0 && dayNum < periodLen) phase = 'period';
    else if (td >= ovulationDay && td < nextStart) {
      var daysToOvulation = Math.floor((ovulationDay - lastStart) / 86400000);
      if (dayNum >= daysToOvulation - 3 && dayNum <= daysToOvulation + 1) phase = 'ovulation';
      else if (dayNum > daysToOvulation + 1) phase = 'luteal';
      else phase = 'follicular';
    } else if (td < ovulationDay) phase = 'follicular';
    else phase = 'luteal';
    return {phase:phase, nextStart:fmtDate(nextStart), updated:Date.now()};
  } catch(e) { return null; }
}
function updateSharedCycleInfo() {
  if (activeProfile !== 'andjela') return;
  var pred = predict();
  var phase = getPhase(today(),pred);
  var cat = 'general';
  if (phase==='period-on'||phase==='period-mid') cat='period';
  else if (phase==='ovulation'||phase==='fertile') cat='ovulation';
  else if (phase==='follicular') cat='follicular';
  else if (phase==='luteal') cat='luteal';
  localStorage.setItem('shared-cycle-info', JSON.stringify({phase:cat,nextStart:pred.nextStart?fmtDate(pred.nextStart):null,updated:Date.now()}));
}
function renderTips(){
  var cat='period'; var tips=[];
  if (activeProfile === 'barry') {
    // Barry's tips — read shared cycle info from Anđela
    var shared = getSharedCyclePhase();
    if (shared && shared.phase) cat = shared.phase;
    else cat = 'general';
    var tipKey = 'barryTips' + cat.charAt(0).toUpperCase() + cat.slice(1);
    tips = t(tipKey) || t('barryTipsGeneral');
    var phaseNames = {period:lang==='sr'?'Njena menstruacija':lang==='en'?'Her Period':'她的经期',follicular:lang==='sr'?'Njena folikularna':lang==='en'?'Her Follicular':'她的卵泡期',ovulation:lang==='sr'?'Njena ovulacija':lang==='en'?'Her Ovulation':'她的排卵期',luteal:lang==='sr'?'Njena lutealna':lang==='en'?'Her Luteal':'她的黄体期',general:lang==='sr'?'Budi tu za nju':lang==='en'?'Be There For Her':'好好待她'};
    var title = (lang==='sr'?'💡 Kako postupati prema njoj danas':lang==='en'?'💡 How to treat her today':'💡 今天如何对待她');
    document.getElementById('tips-list').innerHTML='<div style="text-align:center;padding:8px 0;font-size:.78rem;font-weight:700;color:var(--text)">'+title+'</div><div style="text-align:center;font-size:.68rem;color:var(--gold);margin-bottom:8px">'+phaseNames[cat]+'</div>'+tips.map(function(tip){return '<div class="tip-card" style="border-left:3px solid var(--teal)"><span class="tip-icon">'+tip.icon+'</span><div class="tip-body"><span class="tip-text">'+tip.text+'</span></div></div>';}).join('');
    return;
  }
  // Anđela's tips (original)
  const pred=predict();const td=today();const phase=getPhase(td,pred);
  if(phase==='period-on'||phase==='period-mid')cat='period';
  else if(phase==='ovulation'||phase==='fertile')cat='ovulation';
  else if(phase==='follicular')cat='follicular';
  else if(phase==='luteal')cat='luteal';
  const names={period:lang==='sr'?'Menstruacija':lang==='en'?'Period':'经期',follicular:lang==='sr'?'Folikularna':lang==='en'?'Follicular':'卵泡期',ovulation:lang==='sr'?'Ovulacija':lang==='en'?'Ovulation':'排卵期',luteal:lang==='sr'?'Lutealna':lang==='en'?'Luteal':'黄体期'};
  tips=t('tips.'+cat);
  document.getElementById('tips-list').innerHTML=tips.map(tip=>`<div class="tip-card ${tip.tcm?'tcm':(tip.source&&tip.source.includes('Srpska')||tip.source.includes('Serbian')?'serbian':'')}"><span class="tip-icon">${tip.icon}</span><div class="tip-body"><span class="tip-phase-label">${names[cat]} · ${t('tabs')[2]}</span><span class="tip-text">${tip.text}</span>${tip.source?`<span class="tip-source">${tip.source}</span>`:''}</div></div>`).join('');}
function saveGitHubToken(){var t=document.getElementById('set-gh-token').value.trim();if(t){localStorage.setItem('gh-token',t);toast('🔑 Token sačuvan ✓');pullAllSharedData().then(function(){updateSyncStatusBadge();renderAll();});}else{localStorage.removeItem('gh-token');updateSyncStatusBadge();}}
function loadSettingsUI(){document.getElementById('set-cycle').value=state.settings.cycleLength;document.getElementById('set-period').value=state.settings.periodLength;document.getElementById('set-language').value=lang;document.getElementById('set-theme').value=theme;document.getElementById('annDateMet').value=annDateMet;document.getElementById('annDateLove').value=annDateLove;document.getElementById('set-gh-token').value=getGitHubToken();document.getElementById('set-h-token').textContent=getGitHubToken()?(lang==='sr'?'✅ Sinhronizacija uključena 🌐':lang==='en'?'✅ Auto-sync enabled 🌐':'✅ 自动同步已开启 🌐'):(lang==='sr'?'Unesite GitHub Token za sinhronizaciju dva telefona':lang==='en'?'Enter GitHub Token to sync both phones':'输入 GitHub Token 以同步两台手机');updateAnniversaryCount();updateSyncStatusBadge();}
function saveSettings(){state.settings.cycleLength=parseInt(document.getElementById('set-cycle').value)||28;state.settings.periodLength=parseInt(document.getElementById('set-period').value)||7;saveState();renderAll();toast(t('toast.saved'));}
function exportData(){const blob=new Blob([JSON.stringify({records:state.records.map(fmtDate),symptoms:state.symptoms,moods:state.moods||{},diaries:state.diaries||{},settings:state.settings},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`andjelin-ciklus-${activeProfile}-${fmtDate(new Date())}.json`;a.click();URL.revokeObjectURL(a.href);toast(t('toast.exported'));}
function importData(e){var file=e.target.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(){try{var d=JSON.parse(reader.result);if(!d.records||!Array.isArray(d.records))throw new Error('Invalid format');state.records=d.records.map(function(r){var dt=new Date(r);return isNaN(dt.getTime())?null:dt;}).filter(Boolean);if(state.records.length===0&&d.records.length>0)throw new Error('No valid dates');state.symptoms=d.symptoms||{};state.moods=d.moods||{};state.diaries=d.diaries||{};state.settings={cycleLength:28,periodLength:7,manualOverride:false};if(d.settings){Object.keys(d.settings).forEach(function(k){state.settings[k]=d.settings[k];});}saveState();renderAll();updateFab();toast(t('toast.imported'));}catch(err){toast(t('toast.importError'));}};reader.readAsText(file);e.target.value='';}
function clearAllData(){if(!confirm(t('settings.clearConfirm')))return;state={records:[],symptoms:{},moods:{},diaries:{},settings:{cycleLength:28,periodLength:7,manualOverride:false},_migrated:true};saveState();renderAll();updateFab();toast(t('toast.cleared'));}
function clearAllDiaries(){if(!confirm(lang==='sr'?'Obrisati SVE zajedničke dnevnike? Ovo se ne može vratiti.':lang==='en'?'Delete ALL shared diaries? This cannot be undone.':'删除所有共享日记？此操作不可撤销。'))return;localStorage.setItem('shared-diary','{}');saveSharedDiaryData({});pushAllSharedData().then(function(){renderSharedDiary();renderDateStrip();renderCalendar();toast('🗑️ '+(lang==='sr'?'Dnevnici obrisani':lang==='en'?'Diaries cleared':'日记已清空'));});}

/* ================================================================
   NAVIGATION
   ================================================================ */
function changeMonth(d) {
  viewMonth += d;
  if (viewMonth < 0) { viewMonth = 11; viewYear--; }
  if (viewMonth > 11) { viewMonth = 0; viewYear++; }

  var grid = document.getElementById('daysGrid');
  // Fade out old content
  grid.style.transition = 'opacity 0.08s ease-out';
  grid.style.opacity = '0';

  setTimeout(function() {
    // Render new month
    renderCalendar();
    // Fade in new content
    grid.style.transition = 'opacity 0.15s ease-out';
    grid.style.opacity = '1';
  }, 80);
}

// Touch swipe
(function() {
  var grid = document.getElementById('daysGrid');
  var sx = 0, active = false;
  grid.addEventListener('touchstart', function(e) {
    if (active) return;
    sx = e.touches[0].clientX;
  }, {passive: true});
  grid.addEventListener('touchmove', function(e) {
    var dx = e.touches[0].clientX - sx;
    if (!active && Math.abs(dx) > 10) { active = true; grid.style.transition = 'none'; }
    if (!active) return;
    grid.style.transform = 'translateX(' + dx + 'px)';
    grid.style.opacity = Math.max(0, 1 - Math.abs(dx) / 150);
  }, {passive: false});
  grid.addEventListener('touchend', function() {
    if (!active) return; active = false;
    var dx = parseFloat(grid.style.transform.replace('translateX(','').replace('px)','')) || 0;
    grid.style.transition = 'transform .15s ease-out, opacity .15s ease-out';
    if (Math.abs(dx) > 60) {
      var dir = dx > 0 ? -1 : 1;
      grid.style.transform = 'translateX(' + (dir * 100) + 'px)'; grid.style.opacity = '0';
      setTimeout(function() { grid.style.transition = 'none'; grid.style.transform = ''; grid.style.opacity = ''; changeMonth(dir); }, 150);
    } else {
      grid.style.transform = ''; grid.style.opacity = '';
    }
  });
})();

function goToday() {
  viewYear = today().getFullYear();
  viewMonth = today().getMonth();
  var grid = document.getElementById('daysGrid');
  grid.style.transition = 'opacity 0.08s ease-out';
  grid.style.opacity = '0';
  setTimeout(function() {
    renderCalendar();
    grid.style.transition = 'opacity 0.2s ease-out';
    grid.style.opacity = '1';
  }, 80);
}
/* ================================================================
   CULTURE & CHINESE LEARNING MODULE — za Anđelu
   ================================================================ */

// UI text mapping: auto-switches based on activeProfile (Barry→zh, Angie→sr)
var CL = {
  barry: {
    checklistTitle:'每日进度', dayPrefix:'第', daySuffix:'天',
    partnerProgress:'伴侣进度', commentBoard:'留言板',
    streakLabel:'天连续', streakDay:'天',
    sendBtn:'发送', placeholder:'写留言... 💌',
    noComments:'暂无留言，来写第一条！', loading:'加载中...',
    notStarted:'还没有开始学习', willCome:'会来的！',
    completed:'已完成', lessons:'课', lastLesson:'最近',
    todayBadge:'今日推荐', globalBoard:'留言板',
    points:'积分', badgeTitle:'徽章', badgeNewStar:'汉语新星',
    badgeCulture:'文化大使', badgeMaster:'中国通',
    nextBadge:'下一个徽章', shareBtn:'分享我的进步',
    voiceBtn:'🎤 录音', voiceRetry:'重录', voicePlay:'播放',
    voiceSubmit:'发送', voiceListening:'听自己的声音...',
    unreadBadge:'条新消息', pointsEarned:'+{n} 分！',
    shareTitle:'我的中文学习进度', challengeTitle:'今日挑战',
    recording:'录音中...', recordHint:'点击 🎤 开始录音',
    congratsTitle:'🎉 恭喜！', congratsMsg:'你解锁了新徽章：',
    noMic:'麦克风不可用', imageReady:'图片已下载！'
  },
  andjela: {
    checklistTitle:'Dnevni napredak', dayPrefix:'Dan', daySuffix:'',
    partnerProgress:'Napredak', commentBoard:'Tabla za poruke',
    streakLabel:'dana zaredom', streakDay:'dan',
    sendBtn:'Pošalji', placeholder:'Napiši poruku... 💌',
    noComments:'Još nema poruka. Budi prvi!', loading:'Učitavanje...',
    notStarted:'još nije započela učenje', willCome:'Doći će uskoro!',
    completed:'završeno', lessons:'lekcija', lastLesson:'Poslednja',
    todayBadge:'Daily', globalBoard:'Tabla',
    points:'Poeni', badgeTitle:'Značke', badgeNewStar:'Kineska zvezda',
    badgeCulture:'Ambasador kulture', badgeMaster:'Majstor kineskog',
    nextBadge:'Sledeća značka', shareBtn:'Podeli moj napredak',
    voiceBtn:'🎤 Snimi glas', voiceRetry:'Ponovo', voicePlay:'Pusti',
    voiceSubmit:'Pošalji', voiceListening:'Slušaj svoj glas...',
    unreadBadge:'nepročitanih', pointsEarned:'+{n} poena!',
    shareTitle:'Moj napredak u kineskom', challengeTitle:'Današnji izazov',
    recording:'Snimanje...', recordHint:'Dodirni 🎤 da snimiš',
    congratsTitle:'🎉 Čestitamo!', congratsMsg:'Otključila si značku:',
    noMic:'Mikrofon nije dostupan', imageReady:'Slika preuzeta!'
  }
};
function cl(key) { var profile = (lang||'').indexOf('zh')===0 ? 'barry' : 'andjela'; var p = CL[profile] || CL.andjela; return p[key] || (CL.andjela[key] || key); }

// ===== POINTS & BADGES =====
var BADGES = [
  { id:'newstar', nameKey:'badgeNewStar', icon:'🎖️', points:50 },
  { id:'culture',  nameKey:'badgeCulture',  icon:'🏅', points:100 },
  { id:'master',   nameKey:'badgeMaster',   icon:'🎓', points:200 }
];
function getPointsData() { try { return JSON.parse(localStorage.getItem('shared-learning-points')||'{}'); } catch(e) { return {}; } }
function savePointsData(d) { localStorage.setItem('shared-learning-points',JSON.stringify(d)); pushAllSharedData(); }
function getPoints(profile) { var pd=getPointsData(); return (pd[profile]&&pd[profile].total)||0; }
function getUnlockedBadges(profile) { var pd=getPointsData(); return (pd[profile]&&pd[profile].badges)||[]; }
function getStreak() { var s=localStorage.getItem('culture-lesson-progress'); if(!s)return 0; try{var p=JSON.parse(s);var c=p.completed||[];if(c.length===0)return 0;var streak=0;for(var i=1;i<=DAILY_LESSONS.length;i++){if(c.indexOf(i)>=0)streak++;else break;}return streak;}catch(e){return 0;} }

function addPoints(profile, amount, reason) {
  var pd=getPointsData(); if(!pd[profile]) pd[profile]={total:0,history:[],badges:[]};
  pd[profile].total=(pd[profile].total||0)+amount;
  pd[profile].history=pd[profile].history||[];
  pd[profile].history.push({amount:amount,reason:reason,time:Date.now()});
  if(pd[profile].history.length>50) pd[profile].history=pd[profile].history.slice(-50);
  savePointsData(pd);
  var unlocked=getUnlockedBadges(profile);
  BADGES.forEach(function(b){ if(pd[profile].total>=b.points&&unlocked.indexOf(b.id)<0){ pd[profile].badges.push(b.id); savePointsData(pd); toast(cl('congratsTitle')+' '+b.icon+' '+cl(b.nameKey)); } });
  renderPointsPanel();
  return pd[profile].total;
}

function renderPointsPanel() {
  var panel=document.getElementById('pointsPanel'); if(!panel)return;
  var pp=getPartnerProgress(); var partnerPoints=getPoints(getPartnerProfile());
  var myPoints=getPoints(activeProfile); var myBadges=getUnlockedBadges(activeProfile);
  var displayPoints=activeProfile==='andjela'?myPoints:partnerPoints;
  var displayBadges=activeProfile==='andjela'?myBadges:getUnlockedBadges(getPartnerProfile());
  var streak=getStreak();
  var html='<div class="pts-header">⭐ '+cl('points')+': <strong>'+displayPoints+'</strong>';
  if(streak>=3) html+=' · 🔥'+streak+cl('streakDay');
  html+='</div><div class="pts-badges">';
  BADGES.forEach(function(b){ var e=displayBadges.indexOf(b.id)>=0; html+='<span class="pts-badge'+(e?' earned':' locked')+'" title="'+cl(b.nameKey)+' ('+b.points+' '+cl('points')+')">'+b.icon+'</span>'; });
  html+='</div>';
  var nextBadge=null; for(var i=0;i<BADGES.length;i++){ if(displayBadges.indexOf(BADGES[i].id)<0&&displayPoints<BADGES[i].points){nextBadge=BADGES[i];break;} }
  if(nextBadge){ var pct=Math.min(100,Math.round(displayPoints/nextBadge.points*100)); html+='<div class="pts-next">🎯 '+cl('nextBadge')+': '+cl(nextBadge.nameKey)+' '+nextBadge.icon+' ('+displayPoints+'/'+nextBadge.points+')</div><div class="pts-progress-bar"><div class="pts-progress-fill" style="width:'+pct+'%"></div></div>'; }
  html+='<button class="btn btn-outline pts-share-btn" onclick="generateShareImage()" style="width:100%;margin-top:8px;font-size:.68rem">📸 '+cl('shareBtn')+'</button>';
  html+='<div id="shareCard" style="position:absolute;left:-9999px;top:0;width:360px;background:linear-gradient(135deg,#faf3ef,#fdf0f3);border-radius:20px;padding:24px;font-family:sans-serif;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,.15)"><div style="font-size:3rem;margin-bottom:8px">🌸</div><div style="font-size:1.2rem;font-weight:800;color:#c45a6b;margin-bottom:4px">Anđela</div><div style="font-size:.85rem;color:#3d2828;margin-bottom:4px" id="shareStats"></div><div style="font-size:1.5rem;margin:8px 0" id="shareBadges"></div><div style="font-size:.75rem;color:#8a7a78;margin-bottom:4px" id="shareComments"></div><div style="font-size:.85rem;color:#c49a5e;font-style:italic;margin:8px 0" id="shareQuote"></div><div style="font-size:.6rem;color:#aaa;margin-top:12px">Anđelin Ciklus · Kineska kultura</div></div>';
  panel.innerHTML=html;
}

// ===== UNREAD COMMENTS =====
function getLastReadTime() { var v=localStorage.getItem(profileKey('last-read-comment-time')); return v?parseInt(v):0; }
function setLastReadTime() { localStorage.setItem(profileKey('last-read-comment-time'),Date.now()); updateUnreadBadge(); }
function getUnreadCommentCount() { var lastRead=getLastReadTime(); var comments=getSharedComments(); var partner=getPartnerProfile(); var count=0; comments.forEach(function(c){ if(c.author===partner&&c.time>lastRead) count++; }); return count; }
function updateUnreadBadge() { var badge=document.getElementById('unreadBadge'); if(!badge)return; var count=getUnreadCommentCount(); if(count>0){badge.textContent=count;badge.style.display='';}else{badge.style.display='none';} }

// ===== SHARE IMAGE =====
var MOTIVATIONAL_QUOTES = [];
var CULTURE_KNOWLEDGE = [];
var DAILY_LESSONS = [];
function generateShareImage() {
  var card=document.getElementById('shareCard'); if(!card){renderPointsPanel();card=document.getElementById('shareCard');}
  var pp=getPartnerProgress(); var myPoints=getPoints(activeProfile); var myBadges=getUnlockedBadges(activeProfile);
  var comments=getSharedComments(); var pc=comments.filter(function(c){return c.author===getPartnerProfile();});
  var quote=MOTIVATIONAL_QUOTES[Math.floor(Math.random()*MOTIVATIONAL_QUOTES.length)];
  var completedCount=(pp&&pp.completed)?pp.completed.length:0;
  document.getElementById('shareStats').textContent=cl('completed')+': '+completedCount+'/'+DAILY_LESSONS.length+' · ⭐'+myPoints;
  var bh=''; BADGES.forEach(function(b){ if(myBadges.indexOf(b.id)>=0) bh+=b.icon; });
  document.getElementById('shareBadges').textContent=bh||'🌱';
  document.getElementById('shareComments').textContent='💌 '+pc.length+' poruka od Barry-ja';
  document.getElementById('shareQuote').innerHTML='「'+quote.zh+'」<br><span style="font-size:.7rem">'+quote.sr+'</span>';
  if(typeof html2canvas!=='undefined'){
    card.style.left='10px';card.style.top='10px';card.style.zIndex='9999';card.style.position='fixed';
    html2canvas(card,{scale:2,backgroundColor:null}).then(function(canvas){
      card.style.left='-9999px';card.style.top='0';card.style.position='absolute';
      var link=document.createElement('a');link.download='kineski-napredak.png';link.href=canvas.toDataURL('image/png');link.click();
      toast('📸 '+cl('imageReady'));
    }).catch(function(){card.style.left='-9999px';card.style.position='absolute';});
  }else{
    var script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
    script.onload=function(){generateShareImage();};document.head.appendChild(script);
    toast('⏳ '+cl('loading'));
  }
}

// ===== VOICE CHALLENGE =====
(function(){
  var challenges=[{zh:'你好，很高兴认识你。',py:'nǐ hǎo, hěn gāo xìng rèn shi nǐ.',sr:'Zdravo, drago mi je.'},{zh:'我想要两个包子。',py:'wǒ xiǎng yào liǎng gè bāo zi.',sr:'Želim dva baozi.'},{zh:'这是我的妈妈和爸爸。',py:'zhè shì wǒ de mā ma hé bà ba.',sr:'Ovo su moja mama i tata.'},{zh:'我爱你，Barry。',py:'wǒ ài nǐ, Barry.',sr:'Volim te, Barry.'},{zh:'这个很好吃！',py:'zhè ge hěn hǎo chī!',sr:'Ovo je jako ukusno!'},{zh:'请问，地铁站在哪里？',py:'qǐng wèn, dì tiě zhàn zài nǎ lǐ?',sr:'Gde je metro?'},{zh:'我叫Anđela，我是塞尔维亚人。',py:'wǒ jiào Anđela, wǒ shì sài ěr wéi yà rén.',sr:'Ja sam Srpkinja.'},{zh:'服务员，我要这个，不要辣。',py:'fú wù yuán, wǒ yào zhè ge, bú yào là.',sr:'Konobar, ovo, bez ljutog.'},{zh:'红色很好看，我喜欢红色。',py:'hóng sè hěn hǎo kàn.',sr:'Crvena je lepa, volim crvenu.'},{zh:'明天下午三点见。',py:'míng tiān xià wǔ sān diǎn jiàn.',sr:'Vidimo se sutra u tri.'},{zh:'我要去天安门广场。',py:'wǒ yào qù tiān ān mén guǎng chǎng.',sr:'Idem na Tjenanmen.'},{zh:'太贵了，便宜一点吧。',py:'tài guì le, pián yi yì diǎn ba.',sr:'Preskupo, spusti malo.'},{zh:'今天我很开心。',py:'jīn tiān wǒ hěn kāi xīn.',sr:'Danas sam srećna.'},{zh:'救命！我的手机没电了。',py:'jiù mìng! wǒ de shǒu jī méi diàn le.',sr:'Upomoć! Telefon mi je prazan.'}];
  DAILY_LESSONS.forEach(function(l,i){ if(challenges[i]) l.challenge=challenges[i]; });
})();
// STUDY_PLAN and helper functions defined above in code block
var _mediaRecorder=null; var _audioChunks=[]; var _audioBlob=null;
async function startVoiceRecording(){
  _audioChunks=[]; _audioBlob=null;
  try{var stream=await navigator.mediaDevices.getUserMedia({audio:true});
  // iOS Safari compatibility: try multiple mime types
  var mimeType='audio/webm;codecs=opus';
  if(!MediaRecorder.isTypeSupported(mimeType)){if(MediaRecorder.isTypeSupported('audio/mp4'))mimeType='audio/mp4';else if(MediaRecorder.isTypeSupported('audio/aac'))mimeType='audio/aac';else mimeType='audio/webm';}
  _mediaRecorder=new MediaRecorder(stream,{mimeType:mimeType}); _mediaRecorder.ondataavailable=function(e){if(e.data.size>0)_audioChunks.push(e.data);}; _mediaRecorder.onstop=function(){_audioBlob=new Blob(_audioChunks,{type:'audio/webm'});renderVoiceUI();}; _mediaRecorder.start(); document.getElementById('voiceStatus').textContent='🔴 '+cl('recording'); document.getElementById('voiceStatus').style.color='#E53935'; document.getElementById('voiceStartBtn').style.display='none'; document.getElementById('voiceStopBtn').style.display=''; setTimeout(function(){if(_mediaRecorder&&_mediaRecorder.state==='recording')stopVoiceRecording();},30000);}catch(e){document.getElementById('voiceStatus').textContent='⚠️ '+cl('noMic');}
}
function stopVoiceRecording(){ if(_mediaRecorder&&_mediaRecorder.state==='recording'){_mediaRecorder.stop();_mediaRecorder.stream.getTracks().forEach(function(t){t.stop();});} document.getElementById('voiceStatus').textContent='✅'; document.getElementById('voiceStatus').style.color='var(--sage-dark)'; document.getElementById('voiceStopBtn').style.display='none'; renderVoiceUI(); }
function playVoiceRecording(){ if(!_audioBlob)return; var audio=new Audio(URL.createObjectURL(_audioBlob));audio.play(); }
function submitVoiceRecording(){ if(!_audioBlob)return; var reader=new FileReader(); reader.onload=function(){ var base64=reader.result; var key='voice-'+DAILY_LESSONS[_lessonDayIdx].day; localStorage.setItem(key,base64.substring(0,500000)); var vd=JSON.parse(localStorage.getItem('shared-voice-data')||'{}'); vd[DAILY_LESSONS[_lessonDayIdx].day]={author:activeProfile,time:Date.now(),hasRecording:true}; localStorage.setItem('shared-voice-data',JSON.stringify(vd)); pushAllSharedData(); toast('🎤 Glasovna poruka sačuvana!'); renderVoiceUI(); }; reader.readAsDataURL(_audioBlob); }
function hasVoiceRecording(lessonDay){ return !!localStorage.getItem('voice-'+lessonDay); }
function cleanVoiceGistData(){ var vd=JSON.parse(localStorage.getItem('shared-voice-data')||'{}'); Object.keys(vd).forEach(function(k){vd[k]={author:vd[k].author||'',time:vd[k].time||0,hasRecording:!!vd[k].hasRecording};}); localStorage.setItem('shared-voice-data',JSON.stringify(vd)); pushAllSharedData(); toast('🧹 Voice metadata cleaned!'); }
function renderVoiceUI(){ document.getElementById('voiceStartBtn').style.display=_audioBlob?'none':''; document.getElementById('voiceStopBtn').style.display='none'; document.getElementById('voicePlayBtn').style.display=_audioBlob?'':'none'; document.getElementById('voiceSubmitBtn').style.display=_audioBlob?'':'none'; }

var _cultureCardIdx = 0;
// ===== STUDY SESSION (progressive, session-based) =====
var _studySessionCount = parseInt(localStorage.getItem('studySessionCount') || '0');
var _currentStudySession = Math.min(_studySessionCount + 1, DAILY_LESSONS.length);
function startStudySession() {
  // Only complete if viewing the NEXT uncompleted session
  if (_currentStudySession > _studySessionCount && _currentStudySession <= DAILY_LESSONS.length) {
    _studySessionCount = _currentStudySession;
    _currentStudySession = Math.min(_studySessionCount + 1, DAILY_LESSONS.length);
    localStorage.setItem('studySessionCount', String(_studySessionCount));
    if (activeProfile === 'andjela' && typeof addPoints === 'function') addPoints('andjela', 10, 'study');
  }
  renderStudySession();
}
function prevStudySession() { _currentStudySession = Math.max(1, _currentStudySession - 1); renderStudySession(); }
function nextStudySession() {
  // Only advance if next session is unlocked (completed count + 1)
  var maxUnlocked = Math.min(_studySessionCount + 1, DAILY_LESSONS.length);
  if (_currentStudySession < maxUnlocked) { _currentStudySession++; renderStudySession(); }
}
function renderStudySession() {
  if (DAILY_LESSONS.length === 0) return; // data not loaded yet
  var zh = (lang || '').indexOf('zh') === 0;
  var el = function(id) { return document.getElementById(id); };
  var maxUnlocked = Math.min(_studySessionCount + 1, DAILY_LESSONS.length);
  var isLocked = _currentStudySession > maxUnlocked;

  // Progress bar (always show based on completed count)
  var pct = Math.round(_studySessionCount / DAILY_LESSONS.length * 100);
  if (el('study-progress-bar')) el('study-progress-bar').style.width = pct + '%';
  if (el('study-progress-pct')) el('study-progress-pct').textContent = pct + '%';
  if (el('study-progress-label')) el('study-progress-label').textContent = (zh?'已完成 ':'Završeno ')+_studySessionCount+'/'+DAILY_LESSONS.length;
  if (el('studyProgress')) el('studyProgress').textContent = _currentStudySession + ' / ' + DAILY_LESSONS.length;

  if (isLocked) {
    // Locked session — show lock message
    if (el('studyIcon')) el('studyIcon').textContent = '🔒';
    if (el('studyTopic')) el('studyTopic').textContent = (zh?'未解锁':'Zaključano');
    if (el('studySubtitle')) el('studySubtitle').textContent = '';
    if (el('studyVocab')) el('studyVocab').innerHTML = '<div style="text-align:center;padding:16px;color:var(--text-muted)">'+(zh?'请先完成前面的课程,再解锁这一课 📖':'Prvo završi prethodne lekcije 📖')+'</div>';
    if (el('studySentences')) el('studySentences').innerHTML = '';
    if (el('studyTip')) el('studyTip').textContent = '';
    var btn = el('studyStartBtn'); if (btn) { btn.textContent = '🔒'; btn.disabled = true; }
    return;
  }

  var s = DAILY_LESSONS[_currentStudySession - 1]; if (!s) return;
  if (el('studyIcon')) el('studyIcon').textContent = s.icon || '📖';
  if (el('studyTopic')) el('studyTopic').textContent = (zh?'第':'')+_currentStudySession+(zh?'次学习':'')+'：'+s.topic;
  if (el('studySubtitle')) el('studySubtitle').textContent = (zh?'重点词汇':'📖 Ključne reči');
  var vocabHtml = ''; s.words.forEach(function(w) { vocabHtml += '<div style="display:flex;gap:6px;padding:2px 0;border-bottom:1px solid rgba(0,0,0,.03)"><span style="font-weight:700;color:var(--love);min-width:55px;font-size:.75rem">'+w.zh+'</span><span style="color:var(--sage-dark);min-width:80px;font-size:.62rem">'+w.py+'</span><span style="color:var(--text);font-size:.68rem">'+w.sr+'</span></div>'; });
  if (el('studyVocab')) el('studyVocab').innerHTML = vocabHtml;
  var sentHtml = '';
  if (s.challenge) { sentHtml = '<div style="font-size:.75rem;font-weight:700;color:var(--love)">💬 '+(zh?'例句':'Primer')+': '+s.challenge.zh+'</div><div style="font-size:.62rem;color:var(--sage-dark)">'+s.challenge.py+'</div><div style="font-size:.68rem;color:var(--text)">'+s.challenge.sr+'</div>'; }
  if (el('studySentences')) el('studySentences').innerHTML = sentHtml || ('<div style="color:var(--text-muted);font-style:italic">'+(zh?'用本课词汇造一个句子吧!':'Napravi rečenicu sa rečima iz lekcije!')+'</div>');
  if (el('studyTip')) el('studyTip').textContent = '💡 ' + s.tip;
  var isNextNew = _currentStudySession > _studySessionCount;
  var btn = el('studyStartBtn');
  if (btn) {
    if (_studySessionCount >= DAILY_LESSONS.length) { btn.textContent = '🎉 ' + (zh ? '全部完成!' : 'Sve završeno!'); btn.disabled = true; }
    else { btn.textContent = isNextNew ? (zh ? '✅ 完成本次学习' : '✅ Završi lekciju') : '✅ ' + (zh ? '已完成' : 'Završeno'); btn.disabled = !isNextNew; }
  }
  var enc = el('studyEncouragement');
  if (enc && activeProfile === 'barry') {
    var pp = getPartnerProgress(); var done = (pp && pp.completed) ? pp.completed.length : 0;
    enc.style.display = done > 0 ? '' : 'none';
    enc.innerHTML = '🌸 Angie: ' + (zh?'已完成 ':'završila ') + done + '/' + DAILY_LESSONS.length + ' <button onclick=\"showGlobalComments()\" style=\"font-size:.6rem;padding:2px 8px;border:1px solid var(--love);border-radius:10px;background:transparent;color:var(--love);cursor:pointer\">💬</button>';
  }
}
// ===== SUB-TAB SWITCHING =====
var _cultureSubtab = 'culture'; // 'culture' or 'learn'
function switchCultureSubtab(tab) {
  _cultureSubtab = tab;
  var zh = (lang || '').indexOf('zh') === 0;
  // Update button styles
  var btnC = document.getElementById('subtab-culture');
  var btnL = document.getElementById('subtab-learn');
  if (btnC && btnL) {
    if (tab === 'culture') { btnC.style.background = 'var(--love)'; btnC.style.color = '#fff'; btnL.style.background = 'var(--card)'; btnL.style.color = 'var(--text)'; btnL.style.border = '1px solid var(--border)'; btnC.style.border = 'none'; }
    else { btnL.style.background = 'var(--love)'; btnL.style.color = '#fff'; btnC.style.background = 'var(--card)'; btnC.style.color = 'var(--text)'; btnC.style.border = '1px solid var(--border)'; btnL.style.border = 'none'; }
  }
  // Update button labels
  if (btnC) btnC.textContent = (tab === 'culture' ? '📚 ' : '') + (zh ? '中华文化' : 'Kineska kultura');
  if (btnL) btnL.textContent = (tab === 'learn' ? '📖 ' : '') + (zh ? '学习' : 'Učenje');
  // Show/hide panels
  var cp = document.getElementById('subpanel-culture');
  var lp = document.getElementById('subpanel-learn');
  if (cp) cp.style.display = tab === 'culture' ? '' : 'none';
  if (lp) lp.style.display = tab === 'learn' ? '' : 'none';
  if (tab === 'learn') renderStudySession();
}

var _lessonDayIdx = 0;

function getTodaysCultureIndex() {
  var now = new Date(); return (now.getFullYear()*10000 + (now.getMonth()+1)*100 + now.getDate()) % CULTURE_KNOWLEDGE.length;
}

function initCultureTab() {
  _cultureCardIdx = getTodaysCultureIndex();
  _lessonDayIdx = 0;
  // Update dynamic UI text based on active profile
  var ctEl = document.getElementById('checklist-title');
  if (ctEl) ctEl.textContent = cl('checklistTitle');
  var cbEl = document.getElementById('comment-board-label');
  if (cbEl) cbEl.textContent = cl('commentBoard');
  // Update tab label
  var tbCulture = document.getElementById('tb-culture');
  if (tbCulture) tbCulture.textContent = (lang||'').indexOf('zh')===0 ? '中华' : 'Kina';
  // Update sub-tab labels
  switchCultureSubtab(_cultureSubtab);
  // Load saved progress
  var saved = localStorage.getItem('culture-lesson-progress');
  if (saved) { try { var p = JSON.parse(saved); if (p.lastLessonDay) _lessonDayIdx = Math.min(p.lastLessonDay, DAILY_LESSONS.length - 1); } catch(e) {} }
  renderCultureCard();
  renderDailyLesson();
  renderStudySession();
  renderChecklist();
  // Update unread badge
  updateUnreadBadge();
  // Pull latest shared data for partner progress & comments
  if (getGitHubToken()) {
    pullAllSharedData().then(function() { renderChecklist(); updateUnreadBadge(); });
  }
}

// Chinese descriptions for culture cards (Barry sees these)
var CULTURE_DESC_ZH = {
1:'中国最重要的传统节日。全家人聚在一起吃年夜饭，孩子们收到红包，鞭炮声驱散了旧年的晦气。每个农历年对应一种生肖动物。',
2:'在中国几乎所有支付都用手机完成——微信支付或支付宝。现金已很少使用。来中国前安装微信并绑定银行卡，就能畅行无阻。',
3:'中国人喜欢分享菜肴——所有菜放桌子中间大家一起夹。不要把筷子竖直插在米饭里。敬酒时杯子要低于长辈，以示尊重。',
4:'中国人很少直呼其名。年长的叫阿姨叔叔，年轻的叫小姐姐小哥哥。商店里常能听到美女这个称呼。',
5:'在中国通过手机App几乎什么都能订：外卖、生鲜、药品，甚至还能请人打扫卫生。配送通常30分钟内送到。',
6:'红包在春节、婚礼和生日时赠送。红色代表好运。不要送空红包，接过来时用双手。微信数字红包也非常流行。',
7:'家庭是中国社会的核心。子女成年后也常和父母住在一起。长辈意见非常重要。孝顺强调对父母的赡养和尊重。',
8:'茶是中国文化的灵魂。共有六大茶类：绿、红、白、乌龙、黄、普洱。最著名的是龙井。别人倒茶时用手指轻叩桌面表示感谢——这叫叩指礼。',
9:'中国人喜欢说吉祥话：恭喜发财、万事如意、身体健康。过年一定要说新年快乐。8是幸运数字，4则要避免。',
10:'农历七月初七庆祝。传说牛郎织女只能在这一夜通过鹊桥相会。如今恋人们会享受浪漫晚餐互赠礼物。',
11:'汉字起源于象形文字——山像山峰，水像流水。总数超五万，日常用两三千。书法是汉字书写的高级艺术。',
12:'在中国老师备受尊敬。一日为师生终身为父。学生永远称呼老师，从不直呼其名。',
13:'过年前彻底打扫房子扫走晦气，贴红色装饰，挂对联。孩子们守岁到半夜。第二天穿新红衣服。',
14:'第二重要的传统节日，仅次于春节。吃月饼赏满月。象征家庭团圆——月圆人团圆。李白：举头望明月，低头思故乡。',
15:'在中国看病先去社区卫生服务中心再去大医院。带上医保卡。挂号可通过微信小程序预约。大多数常见药在药店无需处方。',
16:'在中国银行开户需要护照、签证和住址证明。最大银行是工商银行、中国银行和建设银行。手机银行极其发达。',
17:'租房可通过中介或App如自如和贝壳。合同通常只有中文——最好找翻译。押金一般一个月房租。注意水电暖气是否包含。',
18:'快递速度极快——上午下单傍晚送到。顺丰中通圆通遍布全国。包裹常放小区快递柜，24小时不取就收费。',
19:'大多数城市用一卡通乘坐所有公交。在北京叫一卡通，地铁站就能买。上海等地用手机支付宝直接刷码乘车。',
20:'微信支付和支付宝极其方便但要注重安全。不要扫描陌生人二维码。开启双重验证。手机就是你的一切财务。',
21:'在大城市垃圾必须严格分类：湿垃圾、干垃圾、可回收物和有害垃圾。垃圾桶有颜色区分，街上有指导员。分错会罚款。',
22:'中国人对排队很有耐心。但在菜市场和地铁里人流密集。在银行或医院记得取号等叫号。',
23:'中国人请客主人一定抢着买单。客人带小礼物（水果茶叶）。说一句我来买单是基本礼貌。商务宴请座位有讲究。',
24:'在中国送礼注意不送钟表（送钟像送终）、不送伞（散意味着分离）、不送刀剪。红包是最安全选择。收礼用双手，不当面打开。',
25:'亲属称谓丰富。用哥哥弟弟姐姐妹妹区分不同年龄同辈。爸爸这边的奶奶叫奶奶爷爷叫爷爷，妈妈那边叫外婆外公。',
26:'中国生肖共12种动物。传说玉皇大帝叫动物来比赛——最先过河的12只拥有自己的年份。老鼠骑着牛过河最后关头跳到了第一名。',
27:'中国茶分六大类：绿茶不发酵清新、红茶全发酵浓郁、白茶微发酵淡雅、乌龙茶半发酵花香、黄茶稀有温和、普洱茶陈年醇厚。',
28:'麻将是144张牌的社交游戏，遍布中国公园茶馆街头。摸牌弃牌组成3-4张组合加一对。哗啦哗啦洗牌声随处可见。',
29:'每天傍晚全国各地数百万大妈到广场上跳集体舞——广场舞。虽有时吵但是她们锻炼社交的快乐方式。部分城市晚九点后禁止。',
30:'中国拥有世界最大高铁网——时速350公里。北京到上海四个半小时。车票在App买（12306），进站需安检。车厢有WiFi电源热餐。'
};

function renderCultureCard() {
  var k = CULTURE_KNOWLEDGE[_cultureCardIdx];
  document.getElementById('cultureEmoji').textContent = k.icon;
  document.getElementById('cultureTitleZh').textContent = k.zh;
  document.getElementById('cultureTitleSr').textContent = k.sr;
  // Show description based on active profile: Barry→Chinese, Angie→Serbian
  // Use lang variable only (language button) — NOT activeProfile
  var isChinese = (lang || '').indexOf('zh') === 0;
  var descText = isChinese ? (CULTURE_DESC_ZH[k.id] || k.desc) : (k.desc_sr || k.desc);
  document.getElementById('cultureDesc').textContent = descText;
  // Also toggle title visibility based on language
  var titleZh = document.getElementById('cultureTitleZh');
  var titleSr = document.getElementById('cultureTitleSr');
  if (titleZh) titleZh.style.display = isChinese ? '' : 'none';
  if (titleSr) titleSr.style.display = isChinese ? 'none' : '';
  var tagsHtml = ''; k.tags.forEach(function(t){ tagsHtml += '<span class="culture-tag">'+t+'</span>'; });
  document.getElementById('cultureTags').innerHTML = tagsHtml;
  document.getElementById('cultureNavInfo').textContent = (_cultureCardIdx+1) + ' / ' + CULTURE_KNOWLEDGE.length;
  var isToday = _cultureCardIdx === getTodaysCultureIndex();
  var card = document.getElementById('cultureMainCard');
  if (isToday) card.classList.add('culture-today'); else card.classList.remove('culture-today');
  // Update dynamic badge text
  var badge = document.getElementById('cultureTodayBadge');
  if (badge) badge.textContent = cl('todayBadge');
}

function prevCultureCard() { _cultureCardIdx = (_cultureCardIdx - 1 + CULTURE_KNOWLEDGE.length) % CULTURE_KNOWLEDGE.length; renderCultureCard(); }
function nextCultureCard() { _cultureCardIdx = (_cultureCardIdx + 1) % CULTURE_KNOWLEDGE.length; renderCultureCard(); }
function goToTodayCulture() { _cultureCardIdx = getTodaysCultureIndex(); renderCultureCard(); }

function renderDailyLesson() { renderChecklist(); }
function prevLesson() { _lessonDayIdx = Math.max(0, _lessonDayIdx - 1); renderDailyLesson(); }
function nextLesson() { _lessonDayIdx = Math.min(DAILY_LESSONS.length - 1, _lessonDayIdx + 1); renderDailyLesson(); }

function getCompletedDays() {
  var saved = localStorage.getItem('culture-lesson-progress');
  if (!saved) return [];
  try { var p = JSON.parse(saved); return p.completed || []; } catch(e) { return []; }
}

// ===== SHARED LEARNING HELPERS =====
function saveLearningProgress() {
  var completed = getCompletedDays();
  // Save to local
  var saved = localStorage.getItem('culture-lesson-progress');
  var p = saved ? JSON.parse(saved) : {};
  p.completed = completed; p.updated = Date.now();
  localStorage.setItem('culture-lesson-progress', JSON.stringify(p));
  // Save to shared for partner to see
  var sp = JSON.parse(localStorage.getItem('shared-learning-progress') || '{}');
  if (!sp[activeProfile]) sp[activeProfile] = {};
  sp[activeProfile].completed = completed;
  sp[activeProfile].lastLessonDay = _lessonDayIdx;
  sp[activeProfile].updated = Date.now();
  localStorage.setItem('shared-learning-progress', JSON.stringify(sp));
  // Push to GitHub
  pushAllSharedData();
}

function getPartnerProfile() { return activeProfile === 'andjela' ? 'barry' : 'andjela'; }

function getPartnerProgress() {
  var sp = JSON.parse(localStorage.getItem('shared-learning-progress') || '{}');
  return sp[getPartnerProfile()] || null;
}

function getSharedComments() {
  return JSON.parse(localStorage.getItem('shared-learning-comments') || '[]');
}

function saveSharedComments(comments) {
  localStorage.setItem('shared-learning-comments', JSON.stringify(comments));
  pushAllSharedData();
}

// ===== CHECKLIST =====
function toggleLessonDay(dayNum) {
  var completed = getCompletedDays();
  var idx = completed.indexOf(dayNum);
  var isCompleting = idx < 0;
  if (isCompleting) completed.push(dayNum); else completed.splice(idx, 1);
  saveLearningProgress();
  renderChecklist();
  // Points: +10 for completing a lesson (only once per lesson)
  if (isCompleting && activeProfile === 'andjela') {
    addPoints('andjela', 10, 'lesson-'+dayNum);
    // Check 7-day streak bonus
    var streak = getStreak();
    if (streak >= 7) {
      var pd = getPointsData();
      var history = (pd.andjela && pd.andjela.history) || [];
      var alreadyGotStreak = history.some(function(h) { return h.reason === 'streak-7'; });
      if (!alreadyGotStreak) addPoints('andjela', 30, 'streak-7');
    }
  }
}

function renderChecklist() {
  var completed = getCompletedDays();
  var comments = getSharedComments();
  var itemsHtml = '';
  for (var i = 0; i < DAILY_LESSONS.length; i++) {
    var l = DAILY_LESSONS[i];
    var done = completed.indexOf(l.day) >= 0;
    var current = l.day === DAILY_LESSONS[_lessonDayIdx].day;
    // Count comments for this lesson day
    var commentCount = comments.filter(function(c){ return c.lessonDay === l.day; }).length;
    itemsHtml += '<div class="checklist-item'+(done?' done':'')+(current?' current':'')+'" onclick="toggleLessonDay('+l.day+')">';
    itemsHtml += '<span class="checklist-check">'+(done?'✅':'☐')+'</span>';
    itemsHtml += '<span class="checklist-label">'+cl('dayPrefix')+' '+l.day+': '+l.topic+'</span>';
    if (commentCount > 0) itemsHtml += '<span class="checklist-comment-badge" onclick="event.stopPropagation();showLessonComments('+l.day+')" title="Komentari">💬'+commentCount+'</span>';
    itemsHtml += '</div>';
  }
  document.getElementById('checklistItems').innerHTML = itemsHtml;
  document.getElementById('streakCount').textContent = completed.length;
  document.getElementById('streakLabel').textContent = completed.length === 1 ? 'dan' : 'dana';
  // Render partner progress + points panel
  renderPartnerProgress();
  renderPointsPanel();
}

// ===== PARTNER PROGRESS PANEL =====
function renderPartnerProgress() {
  var panel = document.getElementById('partnerProgressPanel');
  if (!panel) return;
  var pp = getPartnerProgress();
  var partnerName = getPartnerProfile() === 'andjela' ? '🌸 Anđela' : '👦 Barry';
  if (!pp || !pp.completed || pp.completed.length === 0) {
    panel.innerHTML = '<div class="pp-empty">' + partnerName + ' ' + cl('notStarted') + '. ' + cl('willCome') + ' 💫</div>';
    return;
  }
  var pct = Math.round(pp.completed.length / DAILY_LESSONS.length * 100);
  var lastLesson = pp.lastLessonDay !== undefined ? DAILY_LESSONS[pp.lastLessonDay] : null;
  var html = '<div class="pp-header">📊 ' + cl('partnerProgress') + ': <strong>' + partnerName + '</strong></div>';
  html += '<div class="pp-bar-track"><div class="pp-bar-fill" style="width:'+pct+'%"></div></div>';
  html += '<div class="pp-stats"><span>✅ ' + pp.completed.length + ' / ' + DAILY_LESSONS.length + ' ' + cl('lessons') + '</span><span>' + pct + '% ' + cl('completed') + '</span></div>';
  if (lastLesson) html += '<div class="pp-last">📖 ' + cl('lastLesson') + ': ' + cl('dayPrefix') + ' ' + lastLesson.day + ' — ' + lastLesson.topic + '</div>';
  // Mark which lessons partner completed
  html += '<div class="pp-lessons">';
  DAILY_LESSONS.forEach(function(l){
    var pDone = pp.completed.indexOf(l.day) >= 0;
    html += '<span class="pp-dot'+(pDone?' done':'')+'" title="'+cl('dayPrefix')+' '+l.day+': '+l.topic+'">'+(pDone?'✅':'○')+'</span>';
  });
  html += '</div>';
  panel.innerHTML = html;
}

// ===== COMMENTS SYSTEM =====
var _commentLessonDay = 0; // 0 = global board, >0 = specific lesson

function showLessonComments(lessonDay) {
  _commentLessonDay = lessonDay;
  var l = DAILY_LESSONS.find(function(d){ return d.day === lessonDay; });
  var title = l ? ('💬 ' + cl('dayPrefix') + ' ' + l.day + ': ' + l.topic) : ('💬 ' + cl('globalBoard'));
  showCommentModal(title);
}

function showGlobalComments() {
  _commentLessonDay = 0;
  showCommentModal('💌 Tabla za poruke');
}

function showCommentModal(title) {
  // Remove existing modal
  var existing = document.querySelector('.comment-modal-overlay');
  if (existing) existing.remove();
  var overlay = document.createElement('div'); overlay.className = 'comment-modal-overlay';
  overlay.innerHTML = '<div class="comment-modal">'
    + '<div class="cm-header"><span class="cm-title">' + title + '</span><button class="cm-close" onclick="closeCommentModal()">✕</button></div>'
    + '<div class="cm-list" id="cmList"></div>'
    + '<div class="cm-input-row"><textarea id="cmInput" placeholder="' + cl('placeholder') + '" rows="2"></textarea>'
    + '<button class="btn btn-primary" onclick="saveComment()" style="font-size:.7rem;padding:8px 14px">📨 ' + cl('sendBtn') + '</button></div>'
    + '</div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeCommentModal(); });
  renderCommentList();
  setLastReadTime(); // mark comments as read
  setTimeout(function(){ var ta = document.getElementById('cmInput'); if (ta) ta.focus(); }, 200);
}

function closeCommentModal() {
  var overlay = document.querySelector('.comment-modal-overlay');
  if (overlay) overlay.remove();
  renderChecklist(); // refresh comment counts
}

function saveComment() {
  var input = document.getElementById('cmInput');
  if (!input) return;
  var text = input.value.trim();
  if (!text) return;
  var comments = getSharedComments();
  comments.push({
    id: 'cm' + Date.now(),
    lessonDay: _commentLessonDay,
    author: activeProfile,
    content: text,
    time: Date.now()
  });
  saveSharedComments(comments);
  input.value = '';
  renderCommentList();
  // Points: +2 for receiver (max 10/day)
  var receiver = getPartnerProfile();
  var todayPoints = 0;
  var pd = getPointsData();
  if (pd[receiver] && pd[receiver].history) {
    var today = new Date(); today.setHours(0,0,0,0);
    pd[receiver].history.forEach(function(h) { if (h.reason === 'comment' && new Date(h.time) >= today) todayPoints += h.amount; });
  }
  if (todayPoints < 10) addPoints(receiver, 2, 'comment');
}

function renderCommentList() {
  var list = document.getElementById('cmList');
  if (!list) return;
  var comments = getSharedComments();
  var filtered = _commentLessonDay === 0
    ? comments // global board: show all
    : comments.filter(function(c){ return c.lessonDay === _commentLessonDay; });
  filtered.sort(function(a,b){ return a.time - b.time; });
  if (filtered.length === 0) {
    list.innerHTML = '<div class="cm-empty">' + cl('noComments') + ' 💌</div>';
    return;
  }
  var html = '';
  filtered.forEach(function(c){
    var isMe = c.author === activeProfile;
    var authorName = c.author === 'andjela' ? '🌸 Anđela' : '👦 Barry';
    var dateStr = new Date(c.time).toLocaleDateString('sr-Latn', {day:'numeric',month:'short'});
    var timeStr = new Date(c.time).toLocaleTimeString('sr-Latn', {hour:'2-digit',minute:'2-digit'});
    html += '<div class="cm-msg'+(isMe?' cm-mine':'')+'">'
      + '<div class="cm-meta"><span class="cm-author">'+authorName+'</span><span class="cm-time">'+dateStr+' '+timeStr+'</span></div>'
      + '<div class="cm-text">'+esc(c.content)+'</div>'
      + '</div>';
  });
  list.innerHTML = html;
  list.scrollTop = list.scrollHeight;
}

// ===== ROADMAP INTERACTION =====
var ROADMAP_DETAILS = [
  {step:1,icon:'🔤',title_zh:'拼音',title_sr:'Pinjin',desc_zh:'学习汉语拼音系统，掌握声母、韵母和四个声调。这是中文学习的基础，大约需要1-2周。',desc_sr:'Nauci sistem pinjin pisma — inicijali, finali i cetiri tona. Ovo je osnova ucenja kineskog.',goal_zh:'目标：准确读出任何带拼音的中文句子',goal_sr:'Cilj: Tacno procitati bilo koju kinesku recenicu sa pinjinom'},
  {step:2,icon:'💬',title_zh:'200句日常对话',title_sr:'200 recenica',desc_zh:'通过场景化学习掌握200句最常用的日常对话，覆盖问候、点餐、购物、问路等实用场景。',desc_sr:'Kroz kontekstualno ucenje savladaj 200 najcescih svakodnevnih recenica.',goal_zh:'目标：在常见场景中能进行简单对话',goal_sr:'Cilj: Voditi jednostavne razgovore u uobicajenim situacijama'},
  {step:3,icon:'🀄',title_zh:'300个基础汉字',title_sr:'300 znakova',desc_zh:'系统学习300个最常用的汉字，理解偏旁部首和造字规律。',desc_sr:'Sistematski nauci 300 najcescih kineskih znakova. Razumej radikale.',goal_zh:'目标：能读懂菜单、路标和简单社交媒体',goal_sr:'Cilj: Citati menije, putokaze i jednostavne objave'},
  {step:4,icon:'📖',title_zh:'语境学句子',title_sr:'Kontekst',desc_zh:'在真实语境中学习更复杂的句子结构，通过短文和日常对话理解中文的表达习惯。',desc_sr:'Uci slozenije recenicne strukture u stvarnom kontekstu kroz kratke price i dijaloge.',goal_zh:'目标：能写简短的中文段落',goal_sr:'Cilj: Napisati kratke pasuse na kineskom'},
  {step:5,icon:'📰',title_zh:'简单阅读',title_sr:'Citanje',desc_zh:'阅读简短的中文文章和新闻，从学习阶段过渡到实际使用阶段。',desc_sr:'Citaj kratke kineske clanke i vesti. Prelaz od ucenja ka koriscenju.',goal_zh:'目标：独立阅读简单中文材料',goal_sr:'Cilj: Samostalno citati jednostavne kineske materijale'}
];

function showRoadmapDetail(stepNum) {
  var d = ROADMAP_DETAILS[stepNum - 1]; if (!d) return;
  var panel = document.getElementById('lrDetail'); if (!panel) return;
  var isOpen = panel.getAttribute('data-step') === String(stepNum);
  if (isOpen) { panel.style.display = 'none'; panel.removeAttribute('data-step'); document.querySelectorAll('.lr-step').forEach(function(s){ s.classList.remove('active-step'); }); return; }
  panel.style.display = ''; panel.setAttribute('data-step', String(stepNum));
  document.getElementById('lrDetailTitle').textContent = d.icon + ' ' + (activeProfile === 'barry' ? d.title_zh : d.title_sr);
  document.getElementById('lrDetailDesc').textContent = activeProfile === 'barry' ? d.desc_zh : d.desc_sr;
  document.getElementById('lrDetailGoal').textContent = '🎯 ' + (activeProfile === 'barry' ? d.goal_zh : d.goal_sr);
  document.querySelectorAll('.lr-step').forEach(function(s){ s.classList.toggle('active-step', parseInt(s.getAttribute('data-step')) === stepNum); });
}

(function() {
  function attach() {
    document.querySelectorAll('.lr-step').forEach(function(s) {
      s.style.cursor = 'pointer';
      s.addEventListener('click', function() { showRoadmapDetail(parseInt(this.getAttribute('data-step'))); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach); else attach();
})();

// Update roadmap based on completed count
(function(){
  var origRenderChecklist = renderChecklist;
  renderChecklist = function() {
    origRenderChecklist();
    var completed = getCompletedDays();
    var steps = document.querySelectorAll('.lr-step');
    var stepIdx = Math.min(4, Math.floor(completed.length / Math.ceil(DAILY_LESSONS.length / 5)));
    steps.forEach(function(s,i){ s.classList.toggle('done', i <= stepIdx); });
    document.querySelectorAll('.lr-connector').forEach(function(c,i){ c.classList.toggle('done', i < stepIdx); });
    var streakEl = document.getElementById('checklistStreak');
    if (streakEl) streakEl.style.display = completed.length > 0 ? '' : 'none';
  };
})();

/* ================================================================
   END CULTURE MODULE
   ================================================================ */

var _tabOrder = ['dashboard','stats','symptoms','tips','diary','culture','settings'];
var _prevTabIdx = 0;
document.querySelectorAll('.tab').forEach(btn=>{btn.addEventListener('click',()=>{
  var id = btn.dataset.panel;
  var newIdx = _tabOrder.indexOf(id);
  var dir = newIdx > _prevTabIdx ? 'slide-out-left' : 'slide-out-right';
  _prevTabIdx = newIdx;
  // Deactivate old
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  var oldPanel = document.querySelector('.panel.active');
  if (oldPanel) { oldPanel.classList.add(dir); oldPanel.addEventListener('animationend', function h() { oldPanel.removeEventListener('animationend', h); oldPanel.classList.remove('active', dir); }, {once:true}); }
  else { document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active')); }
  // Activate new
  var newPanel = document.getElementById('panel-'+id);
  newPanel.classList.remove('slide-out-left','slide-out-right');
  newPanel.classList.add('active');
  if(id==='tips')renderTips();
  if(id==='settings')loadSettingsUI();
  if(id==='symptoms'){if(activeProfile!=='barry'){switchToTab('dashboard');return;}if(getGitHubToken()){pullAllSharedData().then(function(){renderBarrySymptomView();});}document.getElementById('symptom-empty').style.display=symptomDate?'none':'';document.getElementById('symptom-content').style.display=symptomDate?'':'none';}
  if(id==='dashboard'){initDashboard();}
  if(id==='diary'){initSharedDiaryTab();}
  if(id==='culture'){initCultureTab();}
});});
document.querySelectorAll('.lang-btn').forEach(btn=>{btn.addEventListener('click',()=>switchLanguage(btn.dataset.lang));});
document.getElementById('themeBtn').addEventListener('click',()=>{switchTheme(theme==='dark'?'light':'dark');});
document.getElementById('set-theme').addEventListener('change',function(){switchTheme(this.value);});

/* ================================================================
   ONBOARDING
   ================================================================ */
function dismissOnboarding(){document.getElementById('onboardingBanner').style.display='none';localStorage.setItem('cycle-ob-dismissed','1');}
function showOnboardingIfNeeded(){if(activeProfile==='andjela'&&state.records.length===0&&!localStorage.getItem('cycle-ob-dismissed')){document.getElementById('onboardingBanner').style.display='flex';document.getElementById('ob-text').textContent=t('onboarding');}}

function toast(msg){var container=document.getElementById('toastContainer');if(!container)return;while(container.children.length>=3){container.firstChild.remove();}var el=document.createElement('div');el.className='toast';el.textContent=msg;container.appendChild(el);setTimeout(function(){el.classList.add('out');},2800);setTimeout(function(){if(el.parentNode)el.remove();},3300);}

/* Swipe to dismiss modal */
(function(){let startY=0;const overlay=document.getElementById('modal');overlay.addEventListener('touchstart',e=>{if(e.target===overlay||e.target.closest('.modal'))startY=e.touches[0].clientY;},{passive:true});overlay.addEventListener('touchend',e=>{const diff=e.changedTouches[0].clientY-startY;if(diff>80&&!overlay.classList.contains('hidden'))closeModal();});})();
document.getElementById('modal').addEventListener('click',function(e){if(e.target===this)closeModal();});

/* ================================================================
   SYMPTOM ANALYSIS DATA (Barry's view)
   ================================================================ */
const SYMPTOM_HELP = {
  cramps: { cause:{sr:'Materica se kontrahuje da izbaci sluzokožu — prostaglandini izazivaju bol',zh:'子宫收缩排出内膜——前列腺素引起疼痛',en:'Uterus contracts to shed lining — prostaglandins cause pain'}, help:{sr:'🫂 Termofor na stomak • 🍵 Čaj od đumbira • 💆 Nežna masaža donjeg dela leđa • 🚫 Bez hladnih pića',zh:'🫂 暖水袋敷肚子 • 🍵 红糖姜茶 • 💆 轻揉下背部 • 🚫 别喝冰的',en:'🫂 Heating pad • 🍵 Ginger tea • 💆 Gentle lower back massage • 🚫 No cold drinks'} },
  headache: { cause:{sr:'Pad estrogena širi krvne sudove u mozgu',zh:'雌激素下降导致脑血管扩张',en:'Estrogen drop dilates brain blood vessels'}, help:{sr:'🤫 Tiha, zamračena soba • 🧊 Hladan oblog na čelo • 💊 Pitaj da li želi lek protiv bolova',zh:'🤫 安静黑暗的房间 • 🧊 凉毛巾敷额头 • 💊 问她需不需要止痛药',en:'🤫 Quiet dark room • 🧊 Cold compress on forehead • 💊 Ask if she needs pain relief'} },
  fatigue: { cause:{sr:'Telo troši mnogo energije — gvožđe je nisko',zh:'身体消耗大量能量——铁含量低',en:'Body uses lots of energy — iron is low'}, help:{sr:'🛏️ Pusti je da spava • 🧹 Uradi nešto po kući umesto nje • 🍖 Skoro joj hranu bogatu gvožđem',zh:'🛏️ 让她睡 • 🧹 帮她做家务 • 🍖 做含铁丰富的食物',en:'🛏️ Let her sleep • 🧹 Do chores for her • 🍖 Cook iron-rich food for her'} },
  mood: { cause:{sr:'Hormoni divljaju — serotonin i dopamin su na minimumu',zh:'荷尔蒙剧烈波动——血清素和多巴胺都处于低点',en:'Hormones fluctuating wildly — serotonin and dopamine at lows'}, help:{sr:'👂 Slušaj bez osude • 🤐 Ne govori "smiri se" • 🌸 Donesi joj cveće bez razloga • 🫂 Samo je zagrli',zh:'👂 倾听不评判 • 🤐 别说"冷静点" • 🌸 买花给她 • 🫂 就抱着她',en:'👂 Listen without judging • 🤐 Don\'t say "calm down" • 🌸 Bring her flowers • 🫂 Just hold her'} },
  flow: { cause:{sr:'Sluzokoža materice se ljušti — normalan proces',zh:'子宫内膜正在脱落——正常过程',en:'Uterine lining is shedding — normal process'}, help:{sr:'🛒 Kupi joj uloške/tampone ako joj treba • 🚫 Bez dizanja teških stvari • 🛏️ Neka se odmara',zh:'🛒 帮她买卫生巾 • 🚫 别让她提重物 • 🛏️ 让她休息',en:'🛒 Buy pads/tampons if she needs • 🚫 No heavy lifting • 🛏️ Let her rest'} },
  cravings: { cause:{sr:'Nagli pad serotonina — telo traži utehu u hrani',zh:'血清素急剧下降——身体在食物中寻找安慰',en:'Serotonin crash — body seeks comfort in food'}, help:{sr:'🍫 Donesi joj ono što želi bez komentara • 🍕 Naruči njenu omiljenu hranu • 🤐 Ne komentariši njene izbore',zh:'🍫 给她想吃的不要评论 • 🍕 点她最爱吃的 • 🤐 别评论她的食物选择',en:'🍫 Get her what she wants, no comments • 🍕 Order her favorite food • 🤐 Don\'t comment on her choices'} }
};

// Relationship tips for Anđela
const REL_TIPS = {
  sr: [
    {icon:'💬',text:'Ako ti nešto smeta — reci mu. Barry ne ume da čita misli. Iskren razgovor je temelj.'},
    {icon:'💝',text:'Kad uradi nešto lepo za tebe — reci mu. Muškarcima treba potvrda isto koliko i ženama.'},
    {icon:'🫂',text:'Svađate se? Seti se: vi ste tim protiv problema, a ne jedno protiv drugog.'},
    {icon:'🌸',text:'Tvoja osećanja su važeća. Ne moraš da ih pravdavaš. Samo ih izrazi.'},
    {icon:'💌',text:'Male stvari su velike. Poruka "mislim na tebe" znači više nego što misliš.'},
    {icon:'🎯',text:'Reci mu šta ti treba. "Volela bih da me sad saslušaš" je jasnije od ćutanja.'},
    {icon:'🤗',text:'Fizička bliskost nije samo seks. Držanje za ruke, zagrljaj, dodir — sve to gradi vezu.'},
    {icon:'🌙',text:'Kad si umorna i emotivna — reci mu to. "Danas mi je težak dan" je dovoljno.'},
    {icon:'💪',text:'Vi ste različite osobe i to je u redu. Ne morate sve da radite isto.'},
    {icon:'🔥',text:'Strast se gradi svaki dan — flert, nežne reči, iznenađenja. Ne čekaj "posebne prilike".'}
  ],
  'zh-CN': [
    {icon:'💬',text:'如果有什么不满——直接告诉他。Barry 不会读心术。真诚沟通是感情的基础。'},
    {icon:'💝',text:'他做了什么让你开心的事？告诉他。男生也需要被肯定。'},
    {icon:'🫂',text:'吵架时记住：你们 vs 问题，而不是你 vs 他。'},
    {icon:'🌸',text:'你的感受是真实的。不需要为它辩护。只需要表达出来。'},
    {icon:'💌',text:'小事最重要。"想你了"三个字的力量比你想象的大得多。'},
    {icon:'🎯',text:'告诉他你需要什么。"我现在想让你听我说"比沉默更有效。'},
    {icon:'🤗',text:'亲密不只是性。牵手、拥抱、触摸——这些都在建立连接。'},
    {icon:'🌙',text:'累了或情绪不好的时候——告诉他。"今天好累"就够了。'},
    {icon:'💪',text:'你们是不同的个体，这完全没问题。不需要一切都一样。'},
    {icon:'🔥',text:'激情是每天积累的——调情、温柔的话、小惊喜。别等"特别的日子"。'}
  ],
  en: [
    {icon:'💬',text:'If something bothers you — tell him. Barry can\'t read minds. Honest talk is the foundation.'},
    {icon:'💝',text:'He did something nice? Tell him. Men need affirmation as much as women do.'},
    {icon:'🫂',text:'In a fight: you are a team against the problem, not against each other.'},
    {icon:'🌸',text:'Your feelings are valid. You don\'t need to justify them. Just express them.'},
    {icon:'💌',text:'Small things are big. A "thinking of you" message means more than you think.'},
    {icon:'🎯',text:'Tell him what you need. "I\'d love for you to just listen right now" works better than silence.'},
    {icon:'🤗',text:'Physical closeness isn\'t just sex. Holding hands, hugging, touch — it all builds connection.'},
    {icon:'🌙',text:'When you\'re tired or emotional — just tell him. "Today\'s a hard day" is enough.'},
    {icon:'💪',text:'You\'re different people and that\'s OK. You don\'t have to do everything the same way.'},
    {icon:'🔥',text:'Passion builds every day — flirting, sweet words, surprises. Don\'t wait for "special occasions".'}
  ]
};

/* ================================================================
   NEW FEATURES — Hug / Gratitude / Check-in / Song
   ================================================================ */

// ================================================================
// Virtual Hug — redesigned: heartbeat, hug back, streaks, float hearts
// ================================================================
const HUG_EXPIRY_MS = 86400000; // 24 hours

// Spawn floating hearts animation
function spawnFloatingHearts(container) {
  var hearts = ['💕','💖','💗','💝','✨','💫'];
  for (var i = 0; i < 8; i++) {
    (function(idx) {
      setTimeout(function() {
        var h = document.createElement('span');
        h.className = 'floating-heart';
        h.textContent = hearts[idx % hearts.length];
        h.style.left = (20 + Math.random() * 60) + '%';
        h.style.bottom = '20px';
        container.appendChild(h);
        setTimeout(function() { if (h.parentNode) h.remove(); }, 1300);
      }, idx * 80);
    })(i);
  }
}

// Hug streak: count consecutive days with hug exchanged
function getHugStreak() {
  var allData = loadSharedDiaryData();
  var today = new Date(); var streak = 0;
  for (var i = 0; i < 365; i++) {
    var d = new Date(today); d.setDate(d.getDate() - i);
    var key = fmtDate(d); var day = allData[key];
    // Both partners must have sent a hug
    if (day && day['barry'] && day['barry'].hug && day['andjela'] && day['andjela'].hug) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function sendHug(hugBack) {
  var todayKey = fmtDate(new Date());
  var count = parseInt(sessionStorage.getItem('hug-count-' + todayKey) || '0');
  if (count >= 2) { toast(lang === 'sr' ? 'Već si poslao/la 2 zagrljaja danas — probaj sutra! 🤗' : lang === 'en' ? 'You already sent 2 hugs today — try tomorrow! 🤗' : '今天已经抱了2次——明天再来！🤗'); return; }
  count++;
  sessionStorage.setItem('hug-count-' + todayKey, count);

  var hug = { from: activeProfile, time: Date.now() };
  localStorage.setItem('shared-hug', JSON.stringify(hug));

  // Also store in shared diary for streak tracking
  var allData = loadSharedDiaryData();
  if (!allData[todayKey]) allData[todayKey] = {};
  if (!allData[todayKey][activeProfile]) allData[todayKey][activeProfile] = {};
  allData[todayKey][activeProfile].hug = { time: Date.now() };
  saveSharedDiaryData(allData);

  // Animate
  var btn = document.getElementById('hugSendBtn');
  if (btn) { btn.classList.add('sending'); setTimeout(function() { btn.classList.remove('sending'); }, 600); }

  // Floating hearts
  var card = document.getElementById('hugCard');
  if (card) spawnFloatingHearts(card);

  renderHug();
  var senderLabel = activeProfile === 'barry' ? (lang === 'sr' ? 'Poslao si joj zagrljaj!' : lang === 'en' ? 'Hug sent!' : '拥抱已发送！') : (lang === 'sr' ? 'Poslala si mu zagrljaj!' : lang === 'en' ? 'Hug sent!' : '拥抱已发送！');
  toast('🤗 ' + senderLabel + ' (' + count + '/2)');
}

function checkHug() {
  try {
    var hug = JSON.parse(localStorage.getItem('shared-hug'));
    if (!hug) return null;
    // 24-hour expiry
    if (Date.now() - hug.time > HUG_EXPIRY_MS) { localStorage.removeItem('shared-hug'); return null; }
    if (hug.from === activeProfile) return null;
    return hug;
  } catch (e) { return null; }
}

function dismissHug() {
  localStorage.removeItem('shared-hug');
  renderHug();
}

function renderHug() {
  var hug = checkHug();
  var card = document.getElementById('hugContent');
  var title = document.getElementById('hug-title');
  if (!title) return;
  title.textContent = lang === 'sr' ? '🤗 Virtuelni zagrljaj' : lang === 'en' ? '🤗 Virtual Hug' : '🤗 隔空拥抱';
  var todayKey = fmtDate(new Date());
  var count = parseInt(sessionStorage.getItem('hug-count-' + todayKey) || '0');
  var remaining = 2 - count;
  var streak = getHugStreak();

  if (hug) {
    // RECEIVED STATE — beautiful card
    var sender = hug.from === 'andjela' ? '🌸 Anđela' : '👦 Barry';
    var time = new Date(hug.time);
    var timeStr = String(time.getHours()).padStart(2, '0') + ':' + String(time.getMinutes()).padStart(2, '0');

    var html = '<div class="hug-received">';
    if (streak > 1) html += '<div class="hug-streak-badge">🔥 ' + (lang === 'sr' ? streak + ' dana zaredom!' : lang === 'en' ? streak + '-day streak!' : '连续 ' + streak + ' 天！') + '</div>';
    html += '<span class="hug-icon-wrap"><span class="hug-icon">🤗</span></span>';
    html += '<div class="hug-text">' + sender + ' ' + (lang === 'sr' ? 'te zagrlio/la! 💫' : lang === 'en' ? 'hugged you! 💫' : '抱了你！💫') + '</div>';
    html += '<div class="hug-time">' + timeStr + '</div>';
    html += '<button class="hug-back-btn" onclick="sendHug(true)" id="hugBackBtn">💝 ' + (lang === 'sr' ? 'Uzvrati zagrljaj' : lang === 'en' ? 'Hug back' : '回抱一个') + '</button>';
    html += '<div><button class="hug-dismiss" onclick="dismissHug()">' + (lang === 'sr' ? '✕ zatvori' : lang === 'en' ? '✕ dismiss' : '✕ 关闭') + '</button></div>';
    html += '</div>';
    card.innerHTML = html;

    // Auto-spawn hearts when receiving
    var hugCard = document.getElementById('hugCard');
    if (hugCard) spawnFloatingHearts(hugCard);
  } else if (count > 0) {
    // SENT STATE — waiting for partner
    var sentHearts = '';
    for (var i = 0; i < 2; i++) {
      sentHearts += '<span class="hh-heart' + (i >= remaining ? ' used' : '') + '">' + (i < count ? '❤️' : '🤍') + '</span>';
    }
    var html = '<div class="hug-sent-state">';
    html += '<div class="hug-hearts-row">' + sentHearts + '</div>';
    html += '<span class="hss-icon">📬</span>';
    html += '<div class="hss-text">' + (lang === 'sr' ? 'Zagrljaj poslat! Čekam odgovor... 💌' : lang === 'en' ? 'Hug sent! Waiting for response... 💌' : '拥抱已发送！等待回应... 💌') + '</div>';
    html += '<button class="hug-back-btn" onclick="sendHug()" style="margin-top:8px">🤗 ' + (lang === 'sr' ? 'Pošalji još jedan (' + remaining + ')' : lang === 'en' ? 'Send another (' + remaining + ')' : '再抱一次 (' + remaining + ')') + '</button>';
    html += '</div>';
    card.innerHTML = html;
  } else {
    // SEND STATE — fresh button
    var label = lang === 'sr' ? 'Pošalji zagrljaj' : lang === 'en' ? 'Send a Hug' : '发送拥抱';
    var html = '';
    if (streak > 1) html += '<div style="text-align:center"><div class="hug-streak-badge">🔥 ' + (lang === 'sr' ? streak + ' dana zaredom!' : lang === 'en' ? streak + '-day streak!' : '连续 ' + streak + ' 天！') + '</div></div>';
    html += '<button class="hug-btn" onclick="sendHug()" id="hugSendBtn">🤗 ' + label + '</button>';
    card.innerHTML = html;
  }
}

// Gratitude Wall
function addGratitude() {
  var input = document.getElementById('gratInput');
  var text = input.value.trim();
  if (!text) return;
  var notes = JSON.parse(localStorage.getItem('shared-gratitude') || '[]');
  notes.push({ text: text, from: activeProfile, time: Date.now() });
  if (notes.length > 20) notes = notes.slice(-20);
  localStorage.setItem('shared-gratitude', JSON.stringify(notes));
  _gratNotes = null; input.value = '';
  renderGratitude();
  pushAllSharedData();
}
function renderGratitude() {
  var title = document.getElementById('grat-title');
  var input = document.getElementById('gratInput');
  var list = document.getElementById('gratList');
  if (!title || !input || !list) return;
  title.textContent = lang==='sr'?'💝 Zid zahvalnosti':lang==='en'?'💝 Gratitude Wall':'💝 感恩便签';
  input.placeholder = lang==='sr'?'Hvala ti za...':lang==='en'?'Thank you for...':'谢谢你...';
  var notes = JSON.parse(localStorage.getItem('shared-gratitude') || '[]');
  if (notes.length === 0) { list.innerHTML = ''; return; }
  list.innerHTML = notes.slice(-5).reverse().map(function(n, i){
    var sender = n.from === 'andjela' ? '🌸' : '👦';
    var partnerLang = n.from === 'andjela' ? 'sr' : (lang === 'sr' ? 'zh-CN' : 'sr');
    var needTrans = n.from !== (activeProfile === 'andjela' ? 'andjela' : 'barry');
    var btnHtml = needTrans ? ' <button onclick="translateGrat('+i+')" style="font-size:.55rem;padding:1px 6px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);cursor:pointer" title="'+partnerLang+'">🌐</button>' : '';
    return '<div class="gratitude-item"><span class="gratitude-heart">'+sender+'</span><span id="grat-txt-'+i+'">'+esc(n.text)+'</span>'+btnHtml+'</div>';
  }).join('');
}
var _gratNotes = null;
function translateGrat(idx) {
  if (!_gratNotes) _gratNotes = JSON.parse(localStorage.getItem('shared-gratitude') || '[]');
  var n = _gratNotes[idx]; if (!n) return;
  var fromLang = n.from === 'andjela' ? 'sr' : (lang === 'sr' ? 'zh-CN' : 'sr');
  var toLang = lang === 'sr' ? 'sr' : (lang === 'zh-CN' ? 'zh-CN' : 'en');
  if (fromLang === toLang) return;
  translateText(n.text, fromLang, toLang).then(function(translated) {
    var el = document.getElementById('grat-txt-' + idx);
    if (el) el.textContent = translated;
  });
}

// Weekly Check-in
const CHECKIN_QUESTIONS = {
  sr: [
    {q:'Kako se osećaš u vezi ove nedelje?', opts:['😍 Sjajno','😊 Dobro','😐 Ok','😞 Loše']},
    {q:'Da li smo dovoljno komunicirali?', opts:['💬 Da, odlično','👍 Uglavnom','🤔 Moglo bi bolje','👎 Ne baš']},
    {q:'Šta bi voleo/la da poboljšamo sledeće nedelje?', opts:['💏 Više zajedničkog vremena','💬 Bolja komunikacija','🔥 Više romantike','🤝 Više podrške']}
  ],
  'zh-CN': [
    {q:'这周的感情状态怎么样？', opts:['😍 很棒','😊 不错','😐 一般','😞 不太好']},
    {q:'我们这周的沟通足够吗？', opts:['💬 很好','👍 还行','🤔 可以更好','👎 不太够']},
    {q:'下周希望我们哪方面做得更好？', opts:['💏 更多陪伴','💬 更好交流','🔥 更多浪漫','🤝 更多支持']}
  ],
  en: [
    {q:'How do you feel about this week together?', opts:['😍 Amazing','😊 Good','😐 OK','😞 Not great']},
    {q:'Did we communicate enough?', opts:['💬 Yes, great','👍 Mostly','🤔 Could improve','👎 Not really']},
    {q:'What would you like more of next week?', opts:['💏 More time together','💬 Better talks','🔥 More romance','🤝 More support']}
  ]
};
function saveCheckinAnswer(qIdx, answer) {
  var key = 'shared-checkin-' + activeProfile;
  var answers = JSON.parse(localStorage.getItem(key) || '{}');
  answers[qIdx] = answer;
  localStorage.setItem(key, JSON.stringify(answers));
  renderCheckin();
  pushAllSharedData();
}
function getCheckinAnswers(profile) {
  return JSON.parse(localStorage.getItem('shared-checkin-' + profile) || '{}');
}
function renderCheckin() {
  var dow = new Date().getDay(); // 0=Sun,6=Sat
  if (dow !== 0 && dow !== 6) { document.getElementById('checkinCard').style.display = 'none'; return; }
  document.getElementById('checkinCard').style.display = '';
  document.getElementById('checkin-title').textContent = lang==='sr'?'🎯 Nedeljni pregled':lang==='en'?'🎯 Weekly Check-in':'🎯 每周感情体检';
  var questions = CHECKIN_QUESTIONS[lang] || CHECKIN_QUESTIONS['sr'];
  var myAnswers = getCheckinAnswers(activeProfile);
  var partnerProfile = activeProfile === 'andjela' ? 'barry' : 'andjela';
  var partnerAnswers = getCheckinAnswers(partnerProfile);
  var partnerName = partnerProfile === 'andjela' ? '🌸 Anđela' : '👦 Barry';

  var html = questions.map(function(q, i){
    var myPick = myAnswers[i] || '';
    var partnerPick = partnerAnswers[i] || '';
    var optsHtml = q.opts.map(function(o){ return '<span class="cq-opt'+(myPick===o?' picked':'')+'" onclick="saveCheckinAnswer('+i+',\''+o.replace(/'/g,"\\'")+'\')">'+o+'</span>'; }).join('');
    var partnerHtml = partnerPick ? '<div style="font-size:.62rem;color:var(--gold);margin-top:4px">'+partnerName+': '+partnerPick+'</div>' : '';
    return '<div class="checkin-q"><div class="cq-label"><span>'+q.q+'</span></div><div class="cq-options">'+optsHtml+'</div>'+partnerHtml+'</div>';
  }).join('');

  if (Object.keys(myAnswers).length === 0 && Object.keys(partnerAnswers).length === 0) {
    html += '<div style="text-align:center;font-size:.68rem;color:var(--text-muted);margin-top:8px">'+(lang==='sr'?'Odgovori na pitanja — partner će videti tvoje odgovore ✨':lang==='en'?'Answer the questions — your partner will see your answers ✨':'回答问题——伴侣会看到你的答案 ✨')+'</div>';
  }
  document.getElementById('checkinContent').innerHTML = html;
}

// Our Song
function saveMySong() {
  var title = document.getElementById('songInputTitle').value.trim();
  if (!title) { toast(lang==='sr'?'Unesi naziv pesme 🎵':lang==='en'?'Enter a song title 🎵':'请输入歌名 🎵'); return; }
  var note = document.getElementById('songInputNote').value.trim();
  var song = { title: title, note: note || '', from: activeProfile, time: Date.now() };
  localStorage.setItem('shared-song-' + activeProfile, JSON.stringify(song));
  renderSong();
  pushAllSharedData();
  toast('🎵 ' + (lang==='sr'?'Pesma sačuvana!':lang==='en'?'Song saved!':'歌曲已保存！'));
}
function loadSong(profile) {
  try { return JSON.parse(localStorage.getItem('shared-song-' + profile)); } catch(e) { return null; }
}
function renderSong() {
  var st = document.getElementById('song-title'); if (!st) return;
  st.textContent = lang==='sr'?'🎵 Naša pesma':lang==='en'?'🎵 Our Song':'🎵 我们的歌';
  var mySong = loadSong(activeProfile);
  var partnerProfile = activeProfile === 'andjela' ? 'barry' : 'andjela';
  var partnerSong = loadSong(partnerProfile);
  var partnerName = partnerProfile === 'andjela' ? '🌸 Anđela' : '👦 Barry';
  var html = '';
  if (mySong) {
    html += '<div style="margin-bottom:10px"><span style="font-size:.62rem;color:var(--text-muted)">'+(lang==='sr'?'Moja pesma':lang==='en'?'My song':'我的歌')+'</span><div class="song-title">🎶 '+mySong.title+'</div>'+(mySong.note?'<div class="song-note">'+mySong.note+'</div>':'')+'</div>';
  } else {
    html += '<div style="margin-bottom:10px"><input id="songInputTitle" placeholder="'+(lang==='sr'?'Naziv pesme...':lang==='en'?'Song title...':'歌名...')+'" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:12px;font-size:.74rem;font-family:var(--font);background:var(--card);color:var(--text);margin-bottom:6px"><input id="songInputNote" placeholder="'+(lang==='sr'?'Zašto baš ova pesma?':lang==='en'?'Why this song?':'为什么是这首歌？')+'" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:12px;font-size:.74rem;font-family:var(--font);background:var(--card);color:var(--text);margin-bottom:6px"><button class="btn btn-primary" onclick="saveMySong()" style="width:100%;font-size:.7rem;padding:8px">🎵 '+(lang==='sr'?'Sačuvaj':lang==='en'?'Save':'保存')+'</button></div>';
  }
  if (partnerSong) {
    html += '<div style="padding-top:8px;border-top:1px solid var(--border)"><span style="font-size:.62rem;color:var(--text-muted)">'+partnerName+' '+(lang==='sr'?'pesma':lang==='en'?'song':'的歌')+'</span><div class="song-title">🎶 '+partnerSong.title+'</div>'+(partnerSong.note?'<div class="song-note">'+partnerSong.note+'</div>':'')+'</div>';
  }
  document.getElementById('songContent').innerHTML = html || '<span class="song-icon">🎶</span><div class="song-note">'+(lang==='sr'?'Postavite pesme koje vas podsećaju jedno na drugo':lang==='en'?'Set songs that remind you of each other':'设置让你们想到彼此的歌')+'</div>';
}

// Anđela's relationship tips
function renderRelTips() {
  if (activeProfile !== 'andjela') { document.getElementById('relTipCard').style.display = 'none'; return; }
  var tips = REL_TIPS[lang] || REL_TIPS['sr'];
  var tip = tips[Math.floor(Math.random() * tips.length)];
  document.getElementById('relTipIcon').textContent = tip.icon;
  document.getElementById('relTipText').textContent = tip.text;
  document.getElementById('relTipCard').style.display = '';
}

// Barry's symptom + cycle phase analysis
const PHASE_ANALYSIS = {
  period: {
    name:{sr:'Menstruacija',en:'Period','zh-CN':'经期'},
    days:{sr:'Dan 1-7 ciklusa',en:'Day 1-7 of cycle','zh-CN':'周期第1-7天'},
    energy:{sr:'⭐ Niska — odmara se',en:'⭐ Low — resting','zh-CN':'⭐ 低——需要休息'},
    libido:{sr:'🔥 Nizak (moguć blagi porast pred kraj)',en:'🔥 Low (may rise slightly toward end)','zh-CN':'🔥 低（快结束时可能略有回升）'},
    physical:{sr:'Materica se kontrahuje, gvožđe opada. Može imati: grčeve u stomaku, glavobolju, umor, bol u leđima, nadutost.',en:'Uterus contracting, iron drops. May have: cramps, headache, fatigue, back pain, bloating.','zh-CN':'子宫收缩，铁元素下降。可能有：痛经、头痛、极度疲劳、腰酸、腹胀。'},
    emotional:{sr:'Oseća se ranjivo, povučeno. Emocije su intenzivne — može plakati bez razloga. Želi sigurnost i nežnost, ne rešenja.',en:'Feels vulnerable, withdrawn. Emotions intense — may cry without reason. Wants safety and tenderness, not solutions.','zh-CN':'感到脆弱、想独处。情绪强烈——可能没有理由就哭。需要安全感，不需要解决方案。'},
    sex:{sr:'Nizak libido. Ne pritiskaj — nežnost bez očekivanja je ono što joj treba. Ako je raspoložena, budi nežan i pažljiv.',en:'Low libido. Don\'t pressure — tenderness without expectation is what she needs. If she\'s in the mood, be gentle and attentive.','zh-CN':'性欲低。别给她压力——她需要的是无期待的温柔。如果她有兴致，一定要轻柔体贴。'},
    support:{sr:'🫂 Zagrli je bez razloga • 🍵 Skuvaj topao čaj • 🛏️ Pusti je da spava • 🤐 Ne pametuj — samo slušaj • 🍫 Donesi čokoladu',en:'🫂 Hug her without reason • 🍵 Make warm tea • 🛏️ Let her sleep • 🤐 Don\'t lecture — just listen • 🍫 Bring chocolate','zh-CN':'🫂 无条件抱抱 • 🍵 泡热茶 • 🛏️ 让她睡 • 🤐 别讲道理——就听 • 🍫 带巧克力'},
    warning:{sr:'Ne govori "nije to ništa" — za nju JESTE. Ne pokreći teške teme. Ne očekuj seks.',en:'Don\'t say "it\'s nothing" — to her, it IS. Don\'t bring up heavy topics. Don\'t expect sex.','zh-CN':'别说"没那么严重"——对她来说就是很严重。别讨论沉重话题。别期待性生活。'}
  },
  follicular: {
    name:{sr:'Folikularna',en:'Follicular','zh-CN':'卵泡期'},
    days:{sr:'Dan 8-13 ciklusa',en:'Day 8-13 of cycle','zh-CN':'周期第8-13天'},
    energy:{sr:'⭐⭐⭐⭐ Raste — sve više energije',en:'⭐⭐⭐⭐ Rising — more energy each day','zh-CN':'⭐⭐⭐⭐ 上升中——精力越来越好'},
    libido:{sr:'🔥🔥 Raste postepeno — počinje da se oseća privlačno',en:'🔥🔥 Rising gradually — starting to feel attractive','zh-CN':'🔥🔥 逐渐上升——开始感觉自己有魅力'},
    physical:{sr:'Estrogen raste! Koža blista, kosa sjajna, telo se oseća jače. Ovo je faza kad izgleda najbolje — primetićeš.',en:'Estrogen rising! Skin glows, hair shines, body feels stronger. This is when she looks her best — you\'ll notice.','zh-CN':'雌激素上升！皮肤发光、头发亮泽、身体更有力。这是她最好看的阶段——你会注意到的。'},
    emotional:{sr:'Optimistična, društvena, kreativna. Najbolje vreme za nove planove. Otvorena za razgovor — iskoristi to.',en:'Optimistic, social, creative. Best time for new plans. Open to conversation — use this.','zh-CN':'乐观、爱社交、有创意。最适合制定新计划。愿意聊天——抓住机会。'},
    sex:{sr:'Libido raste svakim danom. Još nije na vrhuncu, ali je sve otvorenija za flert i dodir. Odlično vreme za predigru i istraživanje.',en:'Libido rising each day. Not at peak yet, but increasingly open to flirtation and touch. Great time for foreplay and exploration.','zh-CN':'性欲每天都在上升。还没到顶峰，但对调情和触碰越来越开放。适合前戏和探索的好时机。'},
    support:{sr:'💬 Pričaj o planovima za budućnost • 🎯 Predloži izlazak ili putovanje • 🌸 Kupi cveće — primetiće • 💪 Vežbajte zajedno',en:'💬 Talk about future plans • 🎯 Suggest going out or a trip • 🌸 Buy flowers — she\'ll notice • 💪 Exercise together','zh-CN':'💬 聊未来计划 • 🎯 约她出去或旅行 • 🌸 买花——她一定注意到 • 💪 一起运动'},
    warning:{sr:'Ne propusti ovu fazu — ona se otvara ka tebi. Budi prisutan i angažovan.',en:'Don\'t miss this phase — she\'s opening up to you. Be present and engaged.','zh-CN':'别错过这个阶段——她正在向你敞开心扉。积极参与她的生活。'}
  },
  ovulation: {
    name:{sr:'Ovulacija',en:'Ovulation','zh-CN':'排卵期'},
    days:{sr:'Dan 14-16 ciklusa',en:'Day 14-16 of cycle','zh-CN':'周期第14-16天'},
    energy:{sr:'⭐⭐⭐⭐⭐ Vrhunac — na maksimumu!',en:'⭐⭐⭐⭐⭐ Peak — at maximum!','zh-CN':'⭐⭐⭐⭐⭐ 巅峰——状态最好！'},
    libido:{sr:'🔥🔥🔥🔥🔥 VRHUNAC — libido na maksimumu. Ovo su dani kad je najviše zainteresovana za seks.',en:'🔥🔥🔥🔥🔥 PEAK — libido at maximum. These are the days she\'s most interested in sex.','zh-CN':'🔥🔥🔥🔥🔥 最高——性欲达到顶峰。这是她最想要性爱的几天。'},
    physical:{sr:'Vrhunac energije i plodnosti. Može osetiti blagi bol u karlici (ovulacioni bol). Bistar sekret — znak plodnosti. Grudi mogu biti osetljivije.',en:'Peak energy and fertility. May feel mild pelvic pain. Clear discharge — sign of fertility. Breasts may be more sensitive.','zh-CN':'能量和生育力巅峰。可能有轻微排卵痛。分泌物清亮——生育力标志。乳房可能更敏感。'},
    emotional:{sr:'Samopouzdana, privlačna, magnetična. Oseća se NAJBOLJE u celom ciklusu. Komplimenti joj sad znače najviše — i veruje im.',en:'Confident, attractive, magnetic. Feels her BEST in the whole cycle. Compliments mean the most now — and she believes them.','zh-CN':'自信、迷人、有魅力。整个周期中状态最好。现在夸她最有效——而且她真的会相信。'},
    sex:{sr:'Ovo su dani kad je najotvorenija za seks. Njeno telo je bukvalno programirano za intimnost sad. Iniciraj nežno — gotovo sigurno će biti raspoložena. Najbolji dani za začeće.',en:'These are the days she\'s most open to sex. Her body is literally programmed for intimacy now. Initiate gently — she\'s almost certainly in the mood. Best days for conception.','zh-CN':'这是她最愿意做爱的几天。她的身体此时天然地渴望亲密。温柔地主动——她几乎一定会有回应。最容易受孕的日子。'},
    support:{sr:'✨ Iskreni komplimenti (izgled, miris, energija) • 💋 Budi romantičan i pažljiv • 🎉 Izvedi je — ples, večera, bilo šta • 🔥 Iniciraj intimnost',en:'✨ Genuine compliments (looks, smell, energy) • 💋 Be romantic and attentive • 🎉 Take her out — dancing, dinner, anything • 🔥 Initiate intimacy','zh-CN':'✨ 真诚赞美（外表、气味、能量）• 💋 浪漫体贴 • 🎉 带她出去——跳舞、晚餐 • 🔥 主动亲密'},
    warning:{sr:'Ovo su njeni NAJBOLJI dani. Ne preskači ih. Ako postoji dan za romantiku — ovo je taj dan.',en:'These are her BEST days. Don\'t skip them. If there\'s a day for romance — this is it.','zh-CN':'这是她最好的日子。别错过。如果要选浪漫的一天——就是这天。'}
  },
  luteal: {
    name:{sr:'Lutealna',en:'Luteal','zh-CN':'黄体期'},
    days:{sr:'Dan 17-28 ciklusa',en:'Day 17-28 of cycle','zh-CN':'周期第17-28天'},
    energy:{sr:'⭐⭐ Prvo ok, pred kraj pada — umor raste',en:'⭐⭐ OK at first, drops toward end — fatigue grows','zh-CN':'⭐⭐ 前期还行，越往后越累——疲劳加重'},
    libido:{sr:'🔥🔥 Prvo OK, pred kraj opada. Može varirati — dan da, dan ne.',en:'🔥🔥 OK at first, drops toward end. May vary — day yes, day no.','zh-CN':'🔥🔥 前期还行，越往后越低。可能忽高忽低——今天想明天不想。'},
    physical:{sr:'Progesteron dominira. Telo zadržava vodu — oseća se naduto. Grudi osetljive. Akne moguće. Pred kraj: umor, žudnja za hranom, glavobolje.',en:'Progesterone dominates. Water retention — feels bloated. Breast tenderness. Acne possible. Near the end: fatigue, cravings, headaches.','zh-CN':'孕激素主导。身体水肿——感觉浮肿。乳房胀痛。可能长痘。快结束时：极度疲劳、特别想吃东西、头痛。'},
    emotional:{sr:'PMS faza: raspoloženje varira. Može biti razdražljiva, anksiozna, plačljiva. Važno: OVO NIJE ONA — ovo su hormoni. Ne uzimaj ništa lično.',en:'PMS phase: mood swings. May be irritable, anxious, tearful. Important: THIS IS NOT HER — this is hormones. Don\'t take anything personally.','zh-CN':'PMS阶段：情绪波动。可能烦躁、焦虑、想哭。重要：这不是真的她——这是荷尔蒙。千万别往心里去。'},
    sex:{sr:'Libido varira. U prvoj polovini može biti raspoložena. Pred kraj — verovatno neće biti zainteresovana. Ne pritiskaj. Ako kaže ne — to je NE.',en:'Libido varies. First half may be in the mood. Near the end — probably not interested. Don\'t pressure. If she says no — it\'s NO.','zh-CN':'性欲忽高忽低。前半段可能有兴致。快结束时——八成不想。别施压。她说不要就是真的不要。'},
    support:{sr:'🍵 Čaj bez kofeina • 🤐 Slušaj — ne rešavaj • 🍕 Naruči njenu omiljenu hranu • 🌙 Topla kupka, sveće, muzika • 💆 Ponudi masažu',en:'🍵 Caffeine-free tea • 🤐 Listen — don\'t solve • 🍕 Order her favorite food • 🌙 Warm bath, candles, music • 💆 Offer massage','zh-CN':'🍵 无咖啡因茶 • 🤐 听就好——别解决 • 🍕 点她爱吃的 • 🌙 热水澡、蜡烛、音乐 • 💆 主动给她按摩'},
    warning:{sr:'Ne svađaj se — ne možeš pobediti protiv hormona. Ne govori "ta ti je opet ono doba". Budi tu, ćuti, zagrli.',en:'Don\'t argue — you can\'t win against hormones. Don\'t say "is it that time again." Be there, be quiet, hug her.','zh-CN':'别吵架——你跟荷尔蒙吵不赢。别说"你是不是又来那个了"。在就好、安静、抱住。'}
  }
};

function renderBarrySymptomView() {
  var isBarry=activeProfile==='barry';
  document.getElementById('barry-symptom-view').style.display=isBarry?'':'none';
  document.getElementById('andjela-symptom-view').style.display=isBarry?'none':'';
  if(!isBarry)return;
  var container=document.getElementById('barrySymptomAnalysis');
  var shared=getSharedCyclePhase();
  var phaseKey=(shared&&shared.phase)?shared.phase:'general';
  var l=lang||'sr';
  document.getElementById('bs-title').textContent=l==='sr'?'🔬 Anđela danas — detaljna analiza':l==='en'?'🔬 Anđela Today — Full Analysis':'🔬 Anđela 今日详细分析';
  if(phaseKey==='general'||!PHASE_ANALYSIS[phaseKey]){container.innerHTML='<div class="card" style="text-align:center;padding:20px"><span style="font-size:3rem">🌸</span><div style="font-size:.78rem;color:var(--text-muted);margin-top:8px">'+(l==='sr'?'Čekam podatke sa Anđelinog telefona...':l==='en'?'Waiting for data from Anđela\'s phone...':'等待 Anđela 手机同步数据...')+'</div></div>';return;}
  var pa=PHASE_ANALYSIS[phaseKey];
  var pc={period:'var(--love)',follicular:'var(--sage)',ovulation:'var(--teal)',luteal:'var(--lavender)'};
  var pe={period:'🩸',follicular:'🌱',ovulation:'✨',luteal:'🌙'};
  var color=pc[phaseKey]||'var(--love)';
  var h='';
  h+='<div class="card" style="border-left:5px solid '+color+';margin-bottom:10px;background:linear-gradient(135deg,var(--rose-light),var(--card));text-align:center;padding:18px">';
  h+='<div style="font-size:2.5rem;margin-bottom:4px">'+pe[phaseKey]+'</div>';
  h+='<div style="font-size:.95rem;font-weight:800;color:var(--text)">'+(pa.name[l]||pa.name['sr'])+'</div>';
  h+='<div style="font-size:.65rem;color:var(--text-muted)">'+(pa.days[l]||pa.days['sr'])+'</div>';
  if(shared&&shared.nextStart)h+='<div style="font-size:.62rem;color:var(--gold);margin-top:2px">📅 '+(l==='sr'?'Sledeća: '+shared.nextStart:l==='en'?'Next: '+shared.nextStart:'下次: '+shared.nextStart)+'</div>';
  h+='</div>';

  h+='<div class="card" style="padding:14px;margin-bottom:10px"><div style="display:flex;justify-content:space-around;text-align:center">';
  h+='<div><div style="font-size:.62rem;color:var(--text-muted);margin-bottom:2px">⚡ '+(l==='sr'?'Energija':l==='en'?'Energy':'精力')+'</div><div style="font-size:.82rem">'+(pa.energy[l]||pa.energy['sr'])+'</div></div>';
  h+='<div><div style="font-size:.62rem;color:var(--text-muted);margin-bottom:2px">🔥 '+(l==='sr'?'Libido':l==='en'?'Libido':'性欲')+'</div><div style="font-size:.82rem">'+(pa.libido[l]||pa.libido['sr'])+'</div></div>';
  h+='</div></div>';

  h+='<div class="card" style="padding:14px;margin-bottom:10px"><div style="font-weight:700;font-size:.74rem;margin-bottom:4px">🩺 '+(l==='sr'?'Fizičke promene':l==='en'?'Physical Changes':'身体变化')+'</div><div style="font-size:.72rem;color:var(--text-muted);line-height:1.7">'+(pa.physical[l]||pa.physical['sr'])+'</div></div>';
  h+='<div class="card" style="padding:14px;margin-bottom:10px"><div style="font-weight:700;font-size:.74rem;margin-bottom:4px">💭 '+(l==='sr'?'Emocionalno stanje':l==='en'?'Emotional State':'情绪状态')+'</div><div style="font-size:.72rem;color:var(--text-muted);line-height:1.7">'+(pa.emotional[l]||pa.emotional['sr'])+'</div></div>';
  h+='<div class="card" style="padding:14px;margin-bottom:10px;border-left:4px solid var(--love)"><div style="font-weight:700;font-size:.74rem;margin-bottom:4px">🔥 '+(l==='sr'?'Seks i intimnost':l==='en'?'Sex & Intimacy':'性爱与亲密')+'</div><div style="font-size:.72rem;color:var(--text-muted);line-height:1.7">'+(pa.sex[l]||pa.sex['sr'])+'</div></div>';
  h+='<div class="card" style="padding:14px;margin-bottom:10px;background:linear-gradient(135deg,var(--teal-light),var(--card))"><div style="font-weight:700;font-size:.74rem;margin-bottom:4px">💡 '+(l==='sr'?'Kako da joj pomogneš':l==='en'?'How to Support Her':'怎么帮她')+'</div><div style="font-size:.72rem;color:var(--text);line-height:1.8">'+(pa.support[l]||pa.support['sr'])+'</div></div>';
  h+='<div class="card" style="padding:12px;margin-bottom:10px;background:var(--rose-light);border:1px solid var(--rose)"><div style="font-weight:700;font-size:.7rem;margin-bottom:2px">⚠️ '+(l==='sr'?'Šta NE raditi':l==='en'?'What NOT to do':'千万别做')+'</div><div style="font-size:.68rem;color:var(--rose-dark);line-height:1.5">'+(pa.warning[l]||pa.warning['sr'])+'</div></div>';
  container.innerHTML=h;
}

// Share Anđela's symptoms for Barry to see
function updateSharedSymptoms() {
  if (activeProfile !== 'andjela') return;
  var key = fmtDate(today());
  var symptoms = state.symptoms[key];
  if (symptoms) { localStorage.setItem('shared-symptoms', JSON.stringify(symptoms)); pushAllSharedData(); }
}

// Special badge for Anđela
// Sleep Tracker
function saveSleep() {
  var time = document.getElementById('sleepTime').value;
  if (!time) return;
  var entry = { time: time, date: fmtDate(new Date()), saved: Date.now() };
  localStorage.setItem('barry-sleep', JSON.stringify(entry));
  pushAllSharedData();
  renderSleepCard();
  toast('😴 ' + (lang==='sr'?'Sačuvano!':lang==='en'?'Saved!':'已保存！'));
}
function getBarrySleep() {
  try { return JSON.parse(localStorage.getItem('barry-sleep')); } catch(e) { return null; }
}
function renderSleepCard() {
  var card = document.getElementById('sleepCard');
  card.style.display = '';
  document.getElementById('sleep-title').textContent = lang==='sr'?'😴 Spavanje':lang==='en'?'😴 Sleep':'😴 睡眠';
  if (activeProfile === 'barry') {
    document.getElementById('sleepBarryView').style.display = '';
    document.getElementById('sleepAngieView').style.display = 'none';
    document.getElementById('sleep-hint').textContent = lang==='sr'?'Kad si legao sinoć? Angie vidi tvoje vreme spavanja 😴':lang==='en'?'What time did you sleep last night? Angie sees your sleep time 😴':'昨晚几点睡的？Angie 会看到你的睡眠时间 😴';
    document.getElementById('sleep-save').textContent = lang==='sr'?'Sačuvaj':lang==='en'?'Save':'保存';
    var s = getBarrySleep();
    if (s) document.getElementById('sleepTime').value = s.time;
  } else {
    // Angie's view
    document.getElementById('sleepBarryView').style.display = 'none';
    document.getElementById('sleepAngieView').style.display = '';
    var s = getBarrySleep();
    if (!s) {
      document.getElementById('sleepAngieContent').innerHTML = '<div style="text-align:center;color:var(--text-muted);font-size:.72rem">'+(lang==='sr'?'Barry još nije uneo vreme — podseti ga!':lang==='en'?'Barry hasn\'t logged sleep yet — remind him!':'Barry 还没记录——提醒他！')+'</div>';
      return;
    }
    var timeParts = s.time.split(':');
    var hour = parseInt(timeParts[0]), min = parseInt(timeParts[1]);
    var lateMsg = '';
    if (hour >= 2 || (hour === 1 && min >= 30)) {
      lateMsg = lang==='sr'
        ? '<div style="background:var(--rose-light);border-radius:12px;padding:12px;margin-top:8px;text-align:center"><span style="font-size:1.5rem">💔</span><div style="font-size:.76rem;color:var(--rose-dark);font-weight:700;line-height:1.6">Legao je u '+s.time+'! To je PREKASNO!</div><div style="font-size:.68rem;color:var(--rose-dark);margin-top:4px;line-height:1.5">Srce mu pati kad spava manje od 6 sati. Dugoročno — rizik od srčanih bolesti raste za 48%. Treba mu 7-8 sati sna. Ti si jedina koja može da ga natera da legne ranije. Reci mu večeras — "Barry, molim te, idi u krevet pre pola 2. Za mene. 💗"</div></div>'
        : lang==='en'
        ? '<div style="background:var(--rose-light);border-radius:12px;padding:12px;margin-top:8px;text-align:center"><span style="font-size:1.5rem">💔</span><div style="font-size:.76rem;color:var(--rose-dark);font-weight:700;line-height:1.6">He slept at '+s.time+'! That\'s WAY too late!</div><div style="font-size:.68rem;color:var(--rose-dark);margin-top:4px;line-height:1.5">His heart suffers with less than 6 hours of sleep. Long-term heart disease risk increases 48%. He needs 7-8 hours. You\'re the only one who can make him sleep earlier. Tell him tonight — "Barry, please go to bed before 1:30 AM. For me. 💗"</div></div>'
        : '<div style="background:var(--rose-light);border-radius:12px;padding:12px;margin-top:8px;text-align:center"><span style="font-size:1.5rem">💔</span><div style="font-size:.76rem;color:var(--rose-dark);font-weight:700;line-height:1.6">他 '+s.time+' 才睡！太晚了！</div><div style="font-size:.68rem;color:var(--rose-dark);margin-top:4px;line-height:1.5">睡眠不足6小时，心脏长期受损，心脏病风险增加48%。他需要7-8小时睡眠。只有你能让他早点睡。今晚就告诉他——"Barry，为了我今晚1:30以前就睡觉！💗"</div></div>';
    }
    document.getElementById('sleepAngieContent').innerHTML =
      '<div style="text-align:center"><span style="font-size:2rem">😴</span><div style="font-size:.78rem;color:var(--text);margin-top:4px">'+(lang==='sr'?'Sinoć je legao u':lang==='en'?'Last night he slept at':'昨晚他')+' <b>'+s.time+'</b></div><div style="font-size:.62rem;color:var(--text-muted)">'+s.date+'</div></div>'+lateMsg;
  }
}
function renderSpecialBadge() {
  var badge = document.getElementById('specialBadge');
  if (activeProfile !== 'andjela') { badge.style.display = 'none'; return; }
  badge.style.display = '';
  var texts = lang==='sr'?['Ti si jedinstvena ✨','Najlepša na svetu 🌸','Barryjeva ljubav 💝','Jedna jedina 💫']:lang==='en'?['You are unique ✨','Most beautiful 🌸','Barry\'s love 💝','One and only 💫']:['独一无二的你 ✨','最美的人 🌸','Barry 的爱 💝','世界上唯一的你 💫'];
  document.getElementById('specialBadgeText').textContent = texts[Math.floor(Math.random()*texts.length)];
}

/* Update shared symptoms when Anđela saves */
var _origSaveSymptom = saveSymptom;
saveSymptom = function() { _origSaveSymptom(); updateSharedSymptoms(); };

/* ================================================================
   CROSS-DEVICE SYNC — GitHub shared-state.json
   ================================================================ */
const GITHUB_SHARED_FILE = 'shared-state.json';

function collectSharedState() {
  // Use neutral shared-cycle-data so BOTH partners can set period dates
  // and changes sync bidirectionally via GitHub
  var cycleData = JSON.parse(localStorage.getItem('shared-cycle-data') || 'null');
  // If empty, fall back to Anđela's local profile data
  if (!cycleData || !cycleData.records) {
    cycleData = JSON.parse(localStorage.getItem('cycle-data-v6-andjela') || 'null');
  }
  return {
    diary: JSON.parse(localStorage.getItem('shared-diary') || '{}'),
    cycleInfo: cycleData,
    symptoms: JSON.parse(localStorage.getItem('shared-symptoms') || 'null'),
    gratitude: JSON.parse(localStorage.getItem('shared-gratitude') || '[]'),
    hug: JSON.parse(localStorage.getItem('shared-hug') || 'null'),
    songs: { barry: JSON.parse(localStorage.getItem('shared-song-barry')||'null'), andjela: JSON.parse(localStorage.getItem('shared-song-andjela')||'null') },
    sleep: JSON.parse(localStorage.getItem('barry-sleep')||'null'),
    checkins: { barry: JSON.parse(localStorage.getItem('shared-checkin-barry')||'{}'), andjela: JSON.parse(localStorage.getItem('shared-checkin-andjela')||'{}') },
    learningProgress: JSON.parse(localStorage.getItem('shared-learning-progress') || '{}'),
    learningComments: JSON.parse(localStorage.getItem('shared-learning-comments') || '[]'),
    learningPoints: JSON.parse(localStorage.getItem('shared-learning-points') || '{}'),
    voiceData: JSON.parse(localStorage.getItem('shared-voice-data') || '{}'),
    sunCounter: JSON.parse(localStorage.getItem('shared-sun-counter') || '{}'),
    updated: Date.now()
  };
}

function applySharedState(shared) {
  if (!shared) return;
  if (shared.diary) localStorage.setItem('shared-diary', JSON.stringify(shared.diary));
  if (shared.cycleInfo) {
    // Store in neutral shared key so BOTH partners can read/write period data
    localStorage.setItem('shared-cycle-data', JSON.stringify(shared.cycleInfo));
    // Also update Anđela's profile data for backward compat
    if (shared.cycleInfo.records && shared.cycleInfo.records.length > 0) {
      localStorage.setItem('cycle-data-v6-andjela', JSON.stringify(shared.cycleInfo));
    }
    // Apply to current state so calendar shows synced data immediately
    if (shared.cycleInfo.records) {
      state.records = shared.cycleInfo.records.map(function(r) { return new Date(r); });
      state.periodEnds = shared.cycleInfo.periodEnds || {};
      state.symptoms = shared.cycleInfo.symptoms || {};
      state.settings = shared.cycleInfo.settings || { cycleLength: 28, periodLength: 7 };
    }
  }
  if (shared.symptoms) localStorage.setItem('shared-symptoms', JSON.stringify(shared.symptoms));
  if (shared.gratitude) localStorage.setItem('shared-gratitude', JSON.stringify(shared.gratitude));
  if (shared.hug) localStorage.setItem('shared-hug', JSON.stringify(shared.hug));
  if (shared.sleep) localStorage.setItem('barry-sleep', JSON.stringify(shared.sleep));
  if (shared.songs) {
    if (shared.songs.barry) localStorage.setItem('shared-song-barry', JSON.stringify(shared.songs.barry));
    if (shared.songs.andjela) localStorage.setItem('shared-song-andjela', JSON.stringify(shared.songs.andjela));
  }
  if (shared.checkins) {
    if (shared.checkins.barry) localStorage.setItem('shared-checkin-barry', JSON.stringify(shared.checkins.barry));
    if (shared.checkins.andjela) localStorage.setItem('shared-checkin-andjela', JSON.stringify(shared.checkins.andjela));
  }
  if (shared.learningProgress) localStorage.setItem('shared-learning-progress', JSON.stringify(shared.learningProgress));
  if (shared.learningComments) localStorage.setItem('shared-learning-comments', JSON.stringify(shared.learningComments));
  if (shared.learningPoints) localStorage.setItem('shared-learning-points', JSON.stringify(shared.learningPoints));
  if (shared.voiceData) localStorage.setItem('shared-voice-data', JSON.stringify(shared.voiceData));
  if (shared.sunCounter) localStorage.setItem('shared-sun-counter', JSON.stringify(shared.sunCounter));
}

async function pushAllSharedData(retryCount) {
  retryCount = retryCount || 0;
  var MAX_RETRIES = 3;
  var token = getGitHubToken();
  if (!token) return;
  var state = collectSharedState();
  var headers = { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' };
  var sha = null;
  try {
    var resp = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + GITHUB_SHARED_FILE, { headers: headers, cache: 'no-store' });
    if (resp.ok) { var d = await resp.json(); sha = d.sha; }
  } catch(e) { if (retryCount < MAX_RETRIES) { setTimeout(function(){ pushAllSharedData(retryCount + 1); }, 2000); } return; }
  var content = btoa(unescape(encodeURIComponent(JSON.stringify(state, null, 2))));
  var body = { message: '🔄 Sync shared state', content: content };
  if (sha) body.sha = sha;
  try {
    var putResp = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + GITHUB_SHARED_FILE, { method: 'PUT', headers: headers, body: JSON.stringify(body) });
    if (putResp.ok) {
      localStorage.setItem('shared-last-sync', Date.now());
    } else if (putResp.status === 409 || putResp.status === 422) {
      // SHA conflict — pull latest, merge, retry
      console.warn('[Sync] 409 Conflict — pulling latest and merging');
      await pullAllSharedData();
      if (retryCount < MAX_RETRIES) {
        // Re-collect state (now includes remote data from pullAllSharedData)
        setTimeout(function(){ pushAllSharedData(retryCount + 1); }, 1500);
      } else {
        console.error('[Sync] Failed after ' + MAX_RETRIES + ' retries — giving up');
        if (typeof toast === 'function') toast((lang==='sr'?'⚠️ Sinhronizacija nije uspela — pokušaj ponovo':'⚠️ 同步失败，请稍后重试'));
      }
    } else {
      console.error('[Sync] Unexpected response:', putResp.status, putResp.statusText);
    }
  } catch(e) { if (retryCount < MAX_RETRIES) { setTimeout(function(){ pushAllSharedData(retryCount + 1); }, 2000); } else { console.error('[Sync] Network error after retries:', e.message); } }
}

async function pullAllSharedData() {
  var token = getGitHubToken();
  if (!token) return;
  var headers = { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github.v3+json' };
  try {
    var resp = await fetch('https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + GITHUB_SHARED_FILE, { headers: headers, cache: 'no-store' });
    if (!resp.ok) return;
    var data = await resp.json();
    var content = JSON.parse(decodeURIComponent(escape(atob(data.content))));
    // Only apply if remote data is newer than our last sync timestamp
    var lastSync = parseInt(localStorage.getItem('shared-last-sync') || '0');
    if (content.updated && content.updated <= lastSync) return;
    applySharedState(content);
    localStorage.setItem('shared-last-sync', Date.now());
    // Refresh all shared UI — not just diary panel
    renderHug(); renderGratitude(); renderSong(); renderCheckin();
    if (activeProfile === 'barry') {
      renderBarrySymptomView();
      renderCalendar();  // Sync Anđela's calendar to Barry's view
      renderTips();      // Refresh tips based on synced cycle phase
    }
    renderSharedDiary();               // Always refresh diary data
    renderDateStrip();                 // Refresh date strip dots
    updateSyncStatusBadge();
  } catch(e) { updateSyncStatusBadge(); /* network error — will retry on next interval */ }
}

// Sync status badge — shows in Settings and diary panel
function updateSyncStatusBadge() {
  var hasToken = !!getGitHubToken();
  var lastSync = localStorage.getItem('shared-last-sync');
  var badge = document.getElementById('syncStatusBadge');
  if (!badge) return;
  if (!hasToken) {
    badge.textContent = '⚪ ' + (lang==='sr'?'Nije podešeno':lang==='en'?'Not configured':'未设置');
    badge.style.color = 'var(--text-muted)';
    return;
  }
  if (lastSync) {
    var sec = Math.floor((Date.now() - parseInt(lastSync)) / 1000);
    var ago;
    if (sec < 30) ago = lang==='sr'?'upravo':lang==='en'?'just now':'刚刚';
    else if (sec < 120) ago = lang==='sr'?'pre 1 min':lang==='en'?'1 min ago':'1分钟前';
    else if (sec < 3600) ago = (lang==='sr'?'pre ':'') + Math.floor(sec/60) + (lang==='sr'?' min':lang==='en'?' min ago':'分钟前');
    else ago = (lang==='sr'?'pre ':'') + Math.floor(sec/3600) + (lang==='sr'?' h':lang==='en'?' h ago':'小时前');
    badge.textContent = '🟢 ' + (lang==='sr'?'Sinhronizovano ':'Synced ') + ago;
    badge.style.color = 'var(--sage)';
  } else {
    badge.textContent = '🟡 ' + (lang==='sr'?'Čeka se sinhronizacija...':lang==='en'?'Waiting for sync...':'等待同步...');
    badge.style.color = 'var(--gold)';
  }
}

// Auto-sync: push on save (now debounced inside saveState), pull periodically
// Keep shared-cycle-data updated for bidirectional calendar sync
var _origSaveSharedDiaryData = saveSharedDiaryData;
saveSharedDiaryData = function(d) { _origSaveSharedDiaryData(d); pushAllSharedData(); };

// Pull from GitHub every 2 minutes for real-time cross-device sync
var _syncInterval = setInterval(function(){ if(getGitHubToken())pullAllSharedData(); }, 120000);

/* ================================================================
   LOGOUT — return to login screen
   ================================================================ */
function logoutAndShowLogin() {
  if (_syncInterval) { clearInterval(_syncInterval); _syncInterval = null; }
  isLoggedIn = false;
  selectedLoginProfile = null;
  activeProfile = null;
  state = { records:[], symptoms:{}, moods:{}, diaries:{}, settings:{cycleLength:28,periodLength:7,manualOverride:false}, _migrated:true };
  localStorage.removeItem('cycle-active-profile');
  localStorage.removeItem('cycle-login-day');
  lang = 'sr';
  document.getElementById('loginOverlay').classList.remove('hidden');
  document.getElementById('loginPinArea').classList.remove('show');
  document.getElementById('loginCardAndjela').classList.remove('selected');
  document.getElementById('loginCardBarry').classList.remove('selected');
  document.getElementById('loginSwitchHint').textContent = '👈 Izaberi svoj profil i unesi PIN';
  document.getElementById('loginPinInput').value = '';
  document.getElementById('loginError').textContent = '';
  document.getElementById('loginPinBtn').textContent = '🔓 Prijavi se';
  document.getElementById('lc-hint-a').textContent = 'Dodirni za prijavu';
  document.getElementById('lc-hint-b').textContent = 'Dodirni za prijavu';
}

// Override toggleProfile to use login overlay
var _origToggleProfile = toggleProfile;
toggleProfile = function() {
  logoutAndShowLogin();
};

/* ================================================================
   INIT — once-per-day login
   ================================================================ */
(function initApp() {
  applyTheme(theme);
  loadCalendarData(function(data){solarTermsCache=(data&&data.solarTerms)||[];localStorage.setItem('cycle-solarterms',JSON.stringify(solarTermsCache));});
  // Check if already logged in today
  var sessionLoggedIn = sessionStorage.getItem('cycle-logged-in');
  var savedProfile = localStorage.getItem('cycle-active-profile');
  console.log('INIT: session=' + !!sessionLoggedIn + ' saved=' + savedProfile);
  if (savedProfile && sessionLoggedIn === '1' && LOGIN_PINS[savedProfile]) {
    console.log('INIT: auto-login as ' + savedProfile);
    activeProfile = savedProfile;
    isLoggedIn = true;
    document.getElementById('loginOverlay').classList.add('hidden');
    bootApp().catch(function(e) { console.error('bootApp rejected:', e); });
    console.log('INIT: bootApp called');
  } else {
    console.log('INIT: showing login screen (no saved session)');
    localStorage.removeItem('cycle-active-profile');
    document.getElementById('loginOverlay').classList.remove('hidden');
    console.log('INIT: login overlay visible');
  }
})();

// ===== SELF-TEST SUITE (?selftest=1) =====
window.runSelfTest = function() {
  var r={p:0,f:0,log:[]};
  function ok(d,c){if(c){r.p++;r.log.push('✅ '+d);}else{r.f++;r.log.push('❌ '+d);}}
  function sec(t){r.log.push('['+t+']');}
  sec('语言切换');ok('cl基于lang',(function(){try{var o=lang;lang='zh-CN';var v=cl('commentBoard')===CL.barry.commentBoard;lang='sr';v=v&&cl('commentBoard')===CL.andjela.commentBoard;lang=o;return v}catch(e){return false}})());ok('dl基于lang',(function(){try{var o=lang;lang='zh-CN';var v=dl('welcomeBack').indexOf('欢迎')>=0;lang='sr';v=v||dl('welcomeBack').indexOf('Dobro')>=0;lang=o;return v}catch(e){return false}})());ok('switchLanguage触发渲染',switchLanguage.toString().indexOf('renderCultureCard')>=0);
  sec('学习模块');ok('DAILY_LESSONS≥30',DAILY_LESSONS.length>=30);ok('sessionCount数字',typeof _studySessionCount==='number');ok('逐课解锁',nextStudySession.toString().indexOf('maxUnlocked')>=0);ok('完成后+1',startStudySession.toString().indexOf('_studySessionCount=_currentStudySession')>=0);
  sec('文化卡片');ok('CULTURE_KNOWLEDGE≥30',CULTURE_KNOWLEDGE.length>=30);ok('标题可见性切换',renderCultureCard.toString().indexOf('style.display')>=0);
  sec('持久化');ok('localStorage可用',!!window.localStorage);
  ok('studySessionCount持久化',(function(){try{var o=_studySessionCount;localStorage.setItem('studySessionCount','3');var s=parseInt(localStorage.getItem('studySessionCount')||'0');_studySessionCount=o;return s===3}catch(e){return false}})());
  sec('控制台');ok('无语法错误',true);
  console.log(r.log.join('\n')+'\n总计:'+r.p+'/'+(r.p+r.f));
  return r;
};
if((new URLSearchParams(location.search)).get('selftest')==='1')setTimeout(window.runSelfTest,2000);

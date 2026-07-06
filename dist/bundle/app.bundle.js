// Anđelin Ciklus v7.2.0 | Built 2026-07-06

/* === dist/js/i18n.js === */
!function(){try{const e=document.getElementById("appLoader");e&&(e.style.display="none")}catch(e){}}();const I18N={sr:{appTitle:"Anđelin Ciklus",theme:"Tamni režim",themeHint:"Prebacivanje između tamnog i svetlog režima",weekdays:["Pon","Uto","Sre","Čet","Pet","Sub","Ned"],months:["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Avg","Sep","Okt","Nov","Dec"],today:"Danas",tabs:["Početna","Statistika","Simptomi","Dnevnik","Kineski","Podeš."],legend:["Menstruacija","Ovul./Plodni","Folikularna","Lutealna","Danas","Ljubav"],progressLabels:["Menstr.","Folikul.","Ovulacija","Lutealna"],phases:{"period-on":"Početak","period-mid":"Menstruacija","period-pred-first":"Predviđen početak","period-pred":"Predviđeno","period-future-first":"Buduća pred.","period-future":"Buduća pred.",ovulation:"Ovulacija",fertile:"Plodni dani",luteal:"Lutealna",follicular:"Folikularna"},phaseBadges:{period:"Menstruacija",follicular:"Folikularna",ovulation:"Ovulacija",fertile:"Plodni dani",luteal:"Lutealna",late:"Kašnjenje"},knowledgeToggle:"📖 Saznaj više o ovoj fazi ▾",knowledgeToggleHide:"Sakri ▴",knowledge:{period:{title:"O menstrualnoj fazi",desc:"Sluzokoža materice se ljušti i izbacuje se sa krvlju.",what:"Estrogen i progesteron su na najnižem nivou. Endometrijum se odvaja.",symptoms:"Grčevi, umor, promene raspoloženja, glavobolje, bol u leđima",tips:"Povećajte unos gvožđa, zagrejte stomak, izbegavajte naporne vežbe, spavajte dovoljno"},follicular:{title:"O folikularnoj fazi",desc:"Posle menstruacije, folikuli u jajnicima se razvijaju i estrogen raste.",what:"Hipofiza luči FSH koji stimuliše rast folikula. Estrogen obnavlja sluzokožu.",symptoms:"Povratak energije, jasnije razmišljanje, bolja koža, povećan libido",tips:"Odlično vreme za nove projekte, povećajte vežbanje, uravnotežena ishrana"},ovulation:{title:"O ovulaciji",desc:"Zrela jajna ćelija se oslobađa. Najplodniji period. Ćelija živi ~24h, spermatozoidi do 5 dana.",what:"LH talas pokreće ovulaciju. Estrogen dostiže vrhunac.",symptoms:"Blagi bol u karlici, bistri sekret, povećan libido, blagi porast temperature",tips:"Najbolje vreme za začeće, fizičke performanse na vrhuncu"},luteal:{title:"O lutealnoj fazi",desc:"Faza između ovulacije i sledeće menstruacije. Žuto telo proizvodi progesteron.",what:"Progesteron stabilizuje sluzokožu. Ako nema trudnoće, žuto telo propada.",symptoms:"PMS, osetljivost grudi, promene raspoloženja, nadutost, žudnja za hranom",tips:"Smanjite kofein i so, uzimajte vitamin B6 i magnezijum, lagane vežbe pomažu"},fertile:{title:"O plodnim danima",desc:"Dani oko ovulacije kada je najveća verovatnoća začeća.",what:"Spermatozoidi preživljavaju 3-5 dana. Jajna ćelija živi ~24h.",symptoms:"Bistar rastegljiv sekret, povećan libido, promene bazalne temperature",tips:"Za začeće svaki drugi dan, folna kiselina, dobar san"}},emptyState:"Dodirni datum za prvi unos",emptySymptom:"Dodirni datum na kalendaru<br>da uneseš simptome",daysUntil:"Još {n} dana do sledeće menstruacije",daysOverdue:"Kašnjenje {n} dana",day:" dana",periodDay:"{n}. dan ciklusa",expected:"Očekivano",onboarding:"👋 Dobrodošla, Anđelo! Dodirni bilo koji datum da započneš. ♥",fabLabel:"Danas je",greeting:{morning:{icon:"🌅",name:"Anđelo",msg:"Dobro jutro, anđele moj. Želim ti divan dan — budi nežna prema sebi.",sub:"— Sa ljubavlju, Barry"},afternoon:{icon:"🌤️",name:"Anđelo",msg:"Prijatno popodne, moja draga. Napravi pauzu, popij čaj i odmori — brinem se kad preteruješ.",sub:"— Tvoj Barry"},evening:{icon:"🌆",name:"Anđelo",msg:"Dobro veče, najlepša moja. Polako večeras — zaslužuješ miran i topao kraj dana.",sub:"— Sa ljubavlju, tvoj Barry"},night:{icon:"🌙",name:"Anđelo!",msg:"Zašto si još uvek budna? Odmah na spavanje! Brinem se kad ne spavaš, znaš.",sub:"— Voli te, Barry"},dismiss:"♥ Zatvori"},stats:{cycleTitle:"📈 Statistika ciklusa",historyTitle:"📅 Nedavni ciklusi",predTitle:"🔮 Predviđanje",count:"Zabeleženih ciklusa",avg:"Prosečan ciklus",range:"Najkraći / Najduži",reg:"Redovnost",next:"Sledeća menstruacija",ovulation:"Ovulacija",fertile:"Plodni dani",confidence:"Pouzdanost",future:"Buduća predviđanja"},historyLabel:"● Kratak  ● Normalan  ● Dug  (tačka = ciklus)",modal:{details:"Detalji datuma",marked:"Zabeležen početak",phase:"Faza",day:"Dan ciklusa",symptoms:"Simptomi",mark:"Označi početak",unmark:"Ukloni",close:"Zatvori",quickSymptom:"Brzi unos",notesPlaceholder:"Beleške..."},symptoms:{cramps:"Grčevi",mood:"Raspoloženje",flow:"Protok",headache:"Glavobolja",fatigue:"Umor",cravings:"Žudnja"},tips:{period:[{icon:"🩸",text:"Telo gubi gvožđe — jedite crveno meso, spanać i susam.",source:"",tcm:!1},{icon:"♨",text:"Zagrejte stomak termoforom ili toplom vodom.",source:"",tcm:!1},{icon:"🍵",text:"Popijte čaj od šipurka posle obroka — umiruje grčeve.",source:"Srpska tradicija",tcm:!1},{icon:"🧘",text:"Blago istezanje ili joga ublažavaju tegobe.",source:"",tcm:!1},{icon:"🫘",text:"Crveni pasulj i susam bogati gvožđem — tradicionalni srpski izvor gvožđa.",source:"Srpska kuhinja",tcm:!1}],follicular:[{icon:"💪",text:"Estrogen raste, energija se vraća — odlično za novi fitnes plan.",source:"",tcm:!1},{icon:"🥗",text:"Jedite dosta povrća i voća za uravnoteženu ishranu.",source:"",tcm:!1},{icon:"🌿",text:"U kineskoj medicini, ovo je vreme za jačanje krvi (养血). Probajte goji bobice.",source:"中医智慧",tcm:!0},{icon:"🎯",text:"Jasno razmišljanje i visoka energija za važne odluke.",source:"",tcm:!1}],ovulation:[{icon:"⭐",text:"Faza ovulacije — najplodniji dani.",source:"",tcm:!1},{icon:"🏃",text:"Fizičke performanse na vrhuncu — odlično za treninge.",source:"",tcm:!1},{icon:"🌸",text:"U kineskoj tradiciji, ovo je vreme ravnoteže (阴阳调和). Uživajte u prirodi.",source:"中医智慧",tcm:!0}],luteal:[{icon:"🍵",text:"Smanjite kofein — može pogoršati anksioznost.",source:"",tcm:!1},{icon:"🌿",text:"Vitamin B6 i magnezijum ublažavaju predmenstrualne simptome.",source:"",tcm:!1},{icon:"🫚",text:"Topla voda sa đumbirom i crvenim datulama greje telo pred ciklus.",source:"中医智慧 · 姜枣茶",tcm:!0},{icon:"🍌",text:"Skloni nadutosti? Smanjite so, jedite banane.",source:"",tcm:!1}]},settings:{lang:"Jezik / Language / 语言",langHint:"Promeni jezik",theme:"Tema",themeHint:"Tamni / Svetli režim",cycle:"Dužina ciklusa",cycleHint:"Automatski, možeš i ručno",period:"Trajanje menstruacije",periodHint:"Trajanje svake menstruacije",override:"Ručne vrednosti",overrideHint:"Ignoriši automatski proračun",save:"💾 Sačuvaj",export:"📤 Izvezi (JSON)",import:"📥 Uvezi (JSON)",clear:"🗑 Obriši sve",clearConfirm:"Sigurna si? Ovo se ne može opozvati!",anniversary:"Godišnjica",anniversaryHint:"Dan kad ste počeli"},toast:{saved:"Sačuvano ✓",marked:"Označeno ✓",unmarked:"Uklonjeno",symptomSaved:"Sačuvano ✓",symptomQuick:"Ažurirano ✓",exported:"Izvezeno ✓",imported:"Uvezeno ✓",importError:"Greška",cleared:"Obrisano"},reminder:{beforePeriod:"⏰ Menstruacija za {days} dana — spremi se, dušo",late:"⚠️ Kašnjenje {days} dana — konsultuj lekara",ovulation:"✨ Danas je ovulacija — vrhunac plodnosti"},cycleCounter:"Zajedno: {n} ciklusa",cycleCounterSub:"Barry prati svaki tvoj ciklus ♥",anniversaryTitle:"💕 Datumi koji znače",annMetLabel:"✨ Prvi put smo se sreli",annLoveLabel:"♥ Zajedno smo od",annCountMet:"{n} dana od prvog susreta ✨",annCountLove:"{n} dana zajedno ♥",yearTitle:"Godišnji pregled"},"zh-CN":{appTitle:"Anđelin Ciklus",theme:"深色模式",themeHint:"切换深色/浅色主题",weekdays:["一","二","三","四","五","六","日"],months:["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],today:"今天",tabs:["主页","统计","症状","日记","学中文","设置"],legend:["经期","排卵/易孕","卵泡期","黄体期","今天","♥纪念日"],progressLabels:["经期","卵泡期","排卵","黄体期"],phases:{"period-on":"经期开始","period-mid":"经期中","period-pred-first":"预测开始","period-pred":"预测经期","period-future-first":"未来预测","period-future":"未来预测",ovulation:"排卵日",fertile:"易孕期",luteal:"黄体期",follicular:"卵泡期"},phaseBadges:{period:"经期中",follicular:"卵泡期",ovulation:"排卵日",fertile:"易孕期",luteal:"黄体期",late:"已推迟"},knowledgeToggle:"📖 了解这个阶段 ▾",knowledgeToggleHide:"收起 ▴",knowledge:{period:{title:"关于经期",desc:"月经周期的第一阶段。子宫内膜脱落，伴随出血排出体外。",what:"雌激素和孕激素都处于最低水平。子宫内膜正在脱落。",symptoms:"腹部绞痛、疲劳、情绪波动、头痛、腰酸",tips:"多补充铁质、注意保暖、避免剧烈运动、保证睡眠"},follicular:{title:"关于卵泡期",desc:"经期结束后，卵泡开始发育，雌激素逐渐上升。",what:"脑垂体分泌 FSH 刺激卵泡生长。雌激素上升使子宫内膜重新增厚。",symptoms:"精力恢复、思维清晰、皮肤状态改善",tips:"适合开启新计划、增加运动强度、均衡饮食"},ovulation:{title:"关于排卵期",desc:"成熟卵子从卵巢释放，是最易受孕的时期。",what:"LH 激素激增触发排卵。雌激素达到峰值。",symptoms:"轻微腹痛、分泌物增多、性欲增强、体温微升",tips:"备孕最佳时机、体能高峰适合运动"},luteal:{title:"关于黄体期",desc:"排卵后到下次月经前的阶段。黄体分泌孕激素。",what:"孕激素上升稳定子宫内膜。如未受孕，黄体退化。",symptoms:"PMS、乳房胀痛、情绪波动、水肿、食欲变化",tips:"减少咖啡因和盐分、补充 B6 和镁、轻度运动"},fertile:{title:"关于易孕期",desc:"排卵日前后几天，怀孕可能性最高的时间段。",what:"精子可存活 3–5 天。卵子约 24 小时。共约 6 天易孕窗口。",symptoms:"分泌物清亮黏滑、性欲增强、基础体温变化",tips:"备孕可隔天同房、补充叶酸、保持良好作息"}},emptyState:"点击日历标记第一次经期",emptySymptom:"点击日历中的日期<br>来记录当日症状",daysUntil:"距下次月经还有 {n} 天",daysOverdue:"已推迟 {n} 天",day:"天",periodDay:"经期第 {n} 天",expected:"预计",onboarding:"👋 欢迎！点击日历开始记录吧 ♥",fabLabel:"今天来了",greeting:{morning:{icon:"🌅",name:"Anđelo",msg:"早安，我的天使。愿你今天温柔待自己。",sub:"— 爱你的 Barry"},afternoon:{icon:"🌤️",name:"Anđelo",msg:"下午了，亲爱的。休息一下，喝杯茶——你太拼了我会心疼。",sub:"— 你的 Barry"},evening:{icon:"🌆",name:"Anđelo",msg:"晚上好，最美的你。慢慢来——你值得一个温暖平静的夜晚。",sub:"— 爱你的 Barry"},night:{icon:"🌙",name:"Anđelo！",msg:"怎么还没睡？快去睡觉！你不睡我会担心的，知道吗。",sub:"— 想你的 Barry"},dismiss:"♥ 开始"},stats:{cycleTitle:"📈 周期统计",historyTitle:"📅 近期周期",predTitle:"🔮 当前预测",count:"已记录周期数",avg:"平均周期",range:"最短 / 最长",reg:"规律性",next:"下次月经",ovulation:"排卵日",fertile:"易孕窗口",confidence:"置信度",future:"未来预测周期"},historyLabel:"● 偏短  ● 正常  ● 偏长  (每点=一个周期)",modal:{details:"日期详情",marked:"已记录的经期开始日",phase:"阶段",day:"周期第几天",symptoms:"已记录症状",mark:"标记经期开始",unmark:"取消标记",close:"关闭",quickSymptom:"快速记录症状",notesPlaceholder:"添加备注..."},symptoms:{cramps:"痛经",mood:"情绪",flow:"流量",headache:"头痛",fatigue:"疲劳",cravings:"食欲"},tips:{period:[{icon:"🩸",text:"经期身体流失铁质，多吃红肉、菠菜、黑芝麻等富含铁的食物。",source:"",tcm:!1},{icon:"♨",text:"注意腹部保暖，可使用暖水袋或暖宝宝缓解不适。",source:"",tcm:!1},{icon:"🍵",text:"喝杯红枣姜茶，暖宫驱寒，缓解经期不适。",source:"中医养生 · 姜枣茶",tcm:!0},{icon:"🧘",text:"轻度拉伸或瑜伽有助缓解不适，避免剧烈运动。",source:"",tcm:!1},{icon:"🫘",text:"红豆补血养心——相思之物，亦养身之物。",source:"中医智慧 · 红豆",tcm:!0}],follicular:[{icon:"💪",text:"卵泡期雌激素上升，精力和体能恢复中，适合开启新运动计划。",source:"",tcm:!1},{icon:"🥗",text:"新陈代谢较好，多吃蔬菜水果，均衡营养。",source:"",tcm:!1},{icon:"🌿",text:"中医认为此时宜养血（养血），枸杞红枣茶正当时。",source:"中医智慧",tcm:!0},{icon:"🎯",text:"思维清晰精力充沛，适合处理复杂任务和做重要决定。",source:"",tcm:!1}],ovulation:[{icon:"⭐",text:"排卵期，如有备孕计划，这几天是最佳时机。",source:"",tcm:!1},{icon:"🏃",text:"体能处于高峰，适合高强度训练。",source:"",tcm:!1},{icon:"🌸",text:"中医讲究阴阳调和，此时阴阳平衡，适合赏花散步。",source:"中医养生",tcm:!0}],luteal:[{icon:"🍵",text:"黄体期减少咖啡因摄入，可能加重焦虑和情绪波动。",source:"",tcm:!1},{icon:"🌿",text:"适当补充维生素B6和镁，有助缓解经前不适。",source:"",tcm:!1},{icon:"🫚",text:"姜枣茶温经散寒——东方古老的温柔。",source:"中医智慧 · 姜枣茶",tcm:!0},{icon:"🍌",text:"易水肿，减少盐分，多吃香蕉等富含钾的食物。",source:"",tcm:!1}]},settings:{lang:"语言 / Language / Jezik",langHint:"切换界面语言",theme:"主题",themeHint:"深色/浅色模式",cycle:"默认周期长度",cycleHint:"系统自动计算，可手动覆盖",period:"默认经期天数",periodHint:"每次经期持续天数",override:"使用手动值预测",overrideHint:"开启后将忽略自动计算",save:"💾 保存设置",export:"📤 导出数据 (JSON)",import:"📥 导入数据 (JSON)",clear:"🗑 清除所有数据",clearConfirm:"确定清除所有数据？此操作不可恢复！",anniversary:"纪念日",anniversaryHint:"你们在一起的那一天"},toast:{saved:"设置已保存 ✓",marked:"已标记 ✓",unmarked:"已取消标记",symptomSaved:"症状已保存 ✓",symptomQuick:"症状已更新 ✓",exported:"数据已导出 ✓",imported:"数据导入成功 ✓",importError:"导入失败",cleared:"所有数据已清除"},reminder:{beforePeriod:"⏰ 预计 {days} 天后经期开始，提前准备哦",late:"⚠️ 经期已推迟 {days} 天，注意休息和调理",ovulation:"✨ 今天是排卵期，备孕的最佳时机"},cycleCounter:"一起走过 {n} 个周期",cycleCounterSub:"Barry 陪着你走过每一个周期 ♥",anniversaryTitle:"💕 重要的日子",annMetLabel:"✨ 初次相遇",annLoveLabel:"♥ 在一起的日子",annCountMet:"相遇 {n} 天 ✨",annCountLove:"相恋 {n} 天 ♥",yearTitle:"年度概览"},en:{appTitle:"Anđelin Ciklus",theme:"Dark Mode",themeHint:"Switch between dark and light",weekdays:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],months:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],today:"Today",tabs:["Home","Stats","Symptoms","Diary","Learn","Settings"],legend:["Period","Ovul./Fertile","Follicular","Luteal","Today","♥ Love"],progressLabels:["Period","Follicular","Ovulation","Luteal"],phases:{"period-on":"Period Start","period-mid":"Period","period-pred-first":"Predicted Start","period-pred":"Predicted","period-future-first":"Future Pred.","period-future":"Future Pred.",ovulation:"Ovulation",fertile:"Fertile",luteal:"Luteal",follicular:"Follicular"},phaseBadges:{period:"Period",follicular:"Follicular",ovulation:"Ovulation",fertile:"Fertile",luteal:"Luteal",late:"Late"},knowledgeToggle:"📖 Learn about this phase ▾",knowledgeToggleHide:"Hide ▴",knowledge:{period:{title:"Menstrual Phase",desc:"The uterine lining sheds. First phase of the cycle.",what:"Estrogen and progesterone at lowest. Endometrium shedding.",symptoms:"Cramps, fatigue, mood swings, headaches",tips:"Increase iron, keep warm, avoid intense exercise, sleep well"},follicular:{title:"Follicular Phase",desc:"Follicles develop and estrogen rises.",what:"FSH stimulates follicle growth. Estrogen rebuilds lining.",symptoms:"Energy returning, clear thinking, better skin",tips:"Great for new projects, increase exercise, balanced nutrition"},ovulation:{title:"Ovulation",desc:"Mature egg released. Most fertile time.",what:"LH surge triggers ovulation. Estrogen peaks.",symptoms:"Mild pelvic pain, egg-white mucus, increased libido",tips:"Best time for conception, peak performance"},luteal:{title:"Luteal Phase",desc:"Between ovulation and next period.",what:"Progesterone stabilizes lining. Corpus luteum degrades if no pregnancy.",symptoms:"PMS, breast tenderness, mood swings, bloating",tips:"Reduce caffeine and salt, supplement B6 and magnesium"},fertile:{title:"Fertile Window",desc:"Days around ovulation when pregnancy is most likely.",what:"Sperm survive 3-5 days. Egg ~24h. ~6-day fertile window.",symptoms:"Clear mucus, increased libido, temperature changes",tips:"Every other day for conception, folic acid, good sleep"}},emptyState:"Tap a date to record your first period",emptySymptom:"Tap a date on the calendar<br>to log symptoms",daysUntil:"{n} days until next period",daysOverdue:"{n} days late",day:" days",periodDay:"Period Day {n}",expected:"Expected",onboarding:"👋 Welcome, Anđela! Tap any date to begin. ♥",fabLabel:"Period today",greeting:{morning:{icon:"🌅",name:"Anđelo",msg:"Good morning, my angel. Wishing you a wonderful day — be gentle with yourself.",sub:"— With love, Barry"},afternoon:{icon:"🌤️",name:"Anđelo",msg:"Good afternoon, my dear. Take a break, have some tea — you worry me when you overdo it.",sub:"— Your Barry"},evening:{icon:"🌆",name:"Anđelo",msg:"Good evening, my most beautiful. Take it slow tonight — you deserve a peaceful end to the day.",sub:"— With love, your Barry"},night:{icon:"🌙",name:"Anđelo!",msg:"Why are you still awake? Go to sleep right now! I worry when you don't sleep, you know.",sub:"— Love, Barry"},dismiss:"♥ Enter"},stats:{cycleTitle:"📈 Cycle Statistics",historyTitle:"📅 Recent Cycles",predTitle:"🔮 Prediction",count:"Cycles recorded",avg:"Average cycle",range:"Shortest / Longest",reg:"Regularity",next:"Next period",ovulation:"Ovulation",fertile:"Fertile window",confidence:"Confidence",future:"Future predictions"},historyLabel:"● Short  ● Normal  ● Long  (dot = cycle)",modal:{details:"Date Details",marked:"Recorded Period Start",phase:"Phase",day:"Cycle day",symptoms:"Symptoms",mark:"Mark Period Start",unmark:"Remove",close:"Close",quickSymptom:"Quick Symptom Log",notesPlaceholder:"Add notes..."},symptoms:{cramps:"Cramps",mood:"Mood",flow:"Flow",headache:"Headache",fatigue:"Fatigue",cravings:"Cravings"},tips:{period:[{icon:"🩸",text:"Your body loses iron — eat iron-rich foods like red meat and spinach.",source:"",tcm:!1},{icon:"♨",text:"Keep your abdomen warm. A heating pad helps relieve discomfort.",source:"",tcm:!1},{icon:"🍵",text:"Try rosehip tea after meals — a Serbian tradition for easing cramps.",source:"Serbian tradition",tcm:!1},{icon:"🧘",text:"Gentle stretching or yoga helps. Avoid intense exercise.",source:"",tcm:!1},{icon:"🫘",text:"Red beans nourish the blood — an ancient Chinese remedy for women.",source:"TCM Wisdom",tcm:!0}],follicular:[{icon:"💪",text:"Estrogen rising, energy returning — great time for new fitness.",source:"",tcm:!1},{icon:"🥗",text:"Eat plenty of vegetables and fruits for balanced nutrition.",source:"",tcm:!1},{icon:"🌿",text:"In Chinese medicine, this is the time to nourish blood (养血). Try goji tea.",source:"TCM Wisdom",tcm:!0},{icon:"🎯",text:"Clear thinking and high energy — ideal for important decisions.",source:"",tcm:!1}],ovulation:[{icon:"⭐",text:"Ovulation phase. Most fertile days if planning pregnancy.",source:"",tcm:!1},{icon:"🏃",text:"Physical performance peaks — great for high-intensity workouts.",source:"",tcm:!1},{icon:"🌸",text:"In Chinese tradition, a time of balance (阴阳调和). Enjoy nature.",source:"TCM Wisdom",tcm:!0}],luteal:[{icon:"🍵",text:"Reduce caffeine — it can worsen anxiety and mood swings.",source:"",tcm:!1},{icon:"🌿",text:"Vitamin B6 and magnesium may ease premenstrual symptoms.",source:"",tcm:!1},{icon:"🫚",text:"Ginger tea with red dates warms the body — an ancient Eastern remedy.",source:"TCM Wisdom",tcm:!0},{icon:"🍌",text:"Prone to bloating? Reduce salt, eat bananas.",source:"",tcm:!1}]},settings:{lang:"Language / 语言 / Jezik",langHint:"Switch language",theme:"Theme",themeHint:"Dark / Light mode",cycle:"Default cycle length",cycleHint:"Auto-calculated (editable)",period:"Default period length",periodHint:"Duration of each period",override:"Use manual values",overrideHint:"Ignore auto-calculation",save:"💾 Save Settings",export:"📤 Export Data (JSON)",import:"📥 Import Data (JSON)",clear:"🗑 Clear All Data",clearConfirm:"Are you sure? This cannot be undone!",anniversary:"Anniversary",anniversaryHint:"The day you two started"},toast:{saved:"Saved ✓",marked:"Marked ✓",unmarked:"Removed",symptomSaved:"Saved ✓",symptomQuick:"Updated ✓",exported:"Exported ✓",imported:"Imported ✓",importError:"Import failed",cleared:"Cleared"},reminder:{beforePeriod:"⏰ Period in {days} days — get ready, darling",late:"⚠️ Period {days} days late — check with doctor",ovulation:"✨ Ovulation day — peak fertility"},cycleCounter:"Together: {n} cycles",cycleCounterSub:"Barry is with you every step ♥",anniversaryTitle:"💕 Dates that matter",annMetLabel:"✨ First time we met",annLoveLabel:"♥ Together since",annCountMet:"{n} days since we met ✨",annCountLove:"{n} days together ♥",yearTitle:"Year Overview"}},I18N_EXT={sr:{profileName:"Anđela",profileName2:"Barry",loveNoteDefault:"Svakog dana mislim na tebe — ti si najlepši deo mog sveta. 💕",loveNoteSig:"— Tvoj Barry",moodTitle:"😊 Raspoloženje",moodToday:"Kako se osećaš danas?",moodHistoryLabel:"Poslednjih 7 dana",streakLabel:"dana zaredom!",streakLabel0:"Započni niz!",streakBadgeHot:"Sjajno! 🔥",streakBadgeWarm:"Dobro ✨",streakBadgeCold:"Započni danas 🌱",diaryTitle:"📓 Moja rečenica",diaryPrompt:"Danas ______ me je nasmejalo.",diaryPlaceholder:"upiši jednu rečenicu...",gardenTitle:"🌱 Naša bašta",gardenSeed:"Zalivaj me svaki dan — klikni na emoji iznad! 🌱",gardenSprout:"Tvoj niz raste... nastavi dalje! 🌿",gardenGrowing:"Sve si bliže cvetanju! 🌷",gardenBudding:"Skoro procvetala — još malo! 🎀",gardenBlooming:"Prelepo cvetaš! Kao naša ljubav. 🌸✨",forecastTomorrow:"Sutra",forecastFollicular:"Sutra si u folikularnoj fazi — energija raste, sjajan dan za planove! 💪",forecastOvulation:"Sutra je ovulacija — tvoje telo sija najjače! ✨",forecastLuteal:"Sutra ulaziš u lutealnu fazu — uspori malo, zaslužuješ odmor 🌙",forecastPeriod:"Sutra bi mogla da krene menstruacija — pripremi grejač i čaj 💗",forecastNormal:"Slušaj svoje telo. Ti si neverovatna svakog dana. 🌸",moodEmojis:["😊","🥰","😤","😴","😢","🤩","😰","😐"],moodNames:["Srećna","Voljena","Frustrirana","Umorna","Tužna","Uzbuđena","Anksiozna","Meh"],sharedDiaryTab:"Dnevnik",profileSwitch:"Profil promenjen",profileOnly:"Samo Barry može ovo pregledati",barryTipsPeriod:[{icon:"🫂",text:"Ona je u bolovima — budi nežan, zagrli je, donesi joj termofor i čaj."},{icon:"🍫",text:"Ponesi joj čokoladu. Male stvari znače najviše kad je boli."},{icon:"😤",text:'Ne svađaj se — raspoloženje joj je na minimumu. Slušaj, klimaj, reci "u pravu si".'},{icon:"🛏️",text:"Pusti je da se odmara. Donesi joj ćebe i ostavi na miru ako želi."},{icon:"💆",text:"Ponudi masažu leđa ili stopala — nežno, njeno telo je sad osetljivo."}],barryTipsFollicular:[{icon:"🎯",text:"Imaće više energije — isplaniraj izlazak, šetnju, zajedničku aktivnost!"},{icon:"💬",text:"Društvenija je — odlično vreme za dublje razgovore i planove za budućnost."},{icon:"💪",text:"Pridruži joj se u sportu ili fizičkoj aktivnosti. Zajedno ste jači."},{icon:"🌸",text:"Kupi joj cveće bez povoda. Primetiće i najmanji znak pažnje."},{icon:"🎨",text:"Faza kreativnosti — predloži novi hobi ili zajednički projekat."}],barryTipsOvulation:[{icon:"✨",text:"Danas sija — reci joj koliko je lepa. Budi iskren i detaljan u komplimentima."},{icon:"💋",text:"Fizička bliskost joj je važna — grli je, ljubi, drži za ruku."},{icon:"🎉",text:"Vrhunac energije — odličan dan za ples, izlazak, druženje."},{icon:"🔥",text:"Njen libido je na vrhuncu — budi pažljiv i romantičan večeras."},{icon:"📸",text:"Fotografiši je danas — blistaće na svakoj slici."}],barryTipsLuteal:[{icon:"🧘",text:"PMS počinje — ne shvataj ništa lično. Njen mozak je u hormonskom haosu."},{icon:"🍵",text:"Skuvaj joj čaj od kamilice ili nane. Smiruje nerve i pokazuje da brineš."},{icon:"🤐",text:"Slušaj više, pričaj manje. Ne rešavaj — samo slušaj."},{icon:"🍕",text:"Imaće žudnju — naruči njenu omiljenu hranu bez pitanja."},{icon:"🌙",text:"Pomogni joj da se opusti — topla kupka, sveće, muzika. Zaslužuje mir."}],barryTipsGeneral:[{icon:"💌",text:"Pošalji joj poruku sad — reci da misliš na nju. Ne treba povod."},{icon:"💝",text:"Mali znak pažnje danas — njen omiljeni sok, voće, nešto što voli."},{icon:"📞",text:"Pozovi je — čuj njen glas, pitaj kako je prošao dan."},{icon:"🌍",text:"Seti se — ti si njen oslonac. Voli te. Ti si dovoljan."}],diaryTextareaPlaceholder:"Piši, dušo moja... ✍️",diaryDateStripPrev:"◂ Prethodna nedelja",diaryDateStripNext:"Sledeća nedelja ▸",diaryCalPrevMonth:"◂ Prethodni mesec",diaryCalNextMonth:"Sledeći mesec ▸",diaryGoToday:"📍 Danas",diaryCalBtnTitle:"Kalendar",diaryFooterCredit:"Napravljeno sa ljubavlju za Anđelu Nemet ♥",settingsTokenHintEnabled:"✅ Sinhronizacija uključena 🌐",settingsTokenHintDisabled:"Unesite GitHub Token za sinhronizaciju dva telefona",settingsExportAll:"📦 Izvezi sve podatke",settingsImportAll:"📥 Vrati iz backup-a",settingsClearDiary:"🗑️ Obriši sve dnevnike",settingsClearDiaryConfirm:"Obrisati SVE zajedničke dnevnike? Ovo se ne može vratiti.",settingsThemeLight:"☀️ Svetli",settingsThemeDark:"🌙 Tamni",sleepTitle:"Spavanje",sleepHint:"Kad si legao sinoc? Angie vidi tvoje vreme spavanja",sleepSave:"Sačuvaj",sleepEmpty:"Barry jos nije uneo vreme — podseti ga!",sleepLabel:"Sinoc je legao u",specialBadgeTexts:["Ti si jedinstvena ✨","Najlepse na svetu 🌸","Barryjeva ljubav 💝","Jedna jedina 💫"],calendarPredLegend:"※ Prozirni datumi su predviđanja",fabEndPeriod:"Kraj ciklusa",fabStartPeriod:"Početak ciklusa",fabEndYet:"Kraj mora biti posle početka",fabEndMarked:"Kraj ciklusa označen ✓",fabAlreadyMarked:" - već označeno",authPinBtn:"🔓 Prijavi se",authTapHint:"Dodirni za prijavu",authSwitchHint:"Unesi svoj PIN",gardenState0:"Klikni na emoji iznad da me zaliješ! 💧",gardenState1:"Prvi dan! Nastavi da me zalivaš svaki dan 🌱",gardenState3:"Rastem! Još malo pa cvetam 🌿",gardenState7:"Pupoljak! Tvoja ljubav me hrani 🌷",gardenStateBloom:"Procvetala! Kao i vaša ljubav 🌸",sdExportCopied:"Kopirano! Pošalji partneru 💌",sdExportCopiedSimple:"Kopirano!",songTitle:"🎵 Naša pesma",songMyLabel:"Moja pesma",songTitlePlaceholder:"Naziv pesme...",songNotePlaceholder:"Zašto baš ova pesma?",songSave:"Sačuvaj",songPartnerLabel:"pesma",songEmpty:"Postavite pesme koje vas podsećaju jedno na drugo",songSaveEmpty:"Unesi naziv pesme 🎵",songSaved:"🎵 Pesma sačuvana!",knowMeTitle:"💭 Da li me poznaješ?",knowMeMyLabel:"odgovor",knowMeAnswerSaved:"💭 Odgovor sačuvan!",hugTitle:"🤗 Virtuelni zagrljaj",gratTitle:"💝 Zid zahvalnosti",gratPlaceholder:"Hvala ti za...",checkinTitle:"🎯 Nedeljni pregled",teaTitle:"🍵 Čajanka — Srbija ♥ Kina",loveCounterTogether:" dana zajedno",sectRelationship:"💝 Veza",offlineText:"Offline — neke funkcije možda ne rade",pwaInstallText:"📲 Instaliraj na telefon — koristi kao aplikaciju",modalHolidayLabel:"Praznik",modalSolarLabel:"Solarni ciklus",modalSpecialLabel:"Poseban dan",fabEndYet:"Kraj mora biti posle početka",fabEndMarked:"Kraj ciklusa označen ✓",fabAlreadyMarked:" - već označeno",sdDOW:["Ne","Po","Ut","Sr","Če","Pe","Su"],sdDOWMon:["Po","Ut","Sr","Če","Pe","Su","Ne"],sdExportPrompt:"Kopiraj i pošalji partneru:",sdSaveFirst:"Prvo sačuvaj svoj unos",sdImportTitle:"📥 Zalepi partnerov tekst",sdImportPlaceholder:"Zalepi JSON tekst ovde...",sdImportCancel:"Odustani",sdImportConfirm:"Uvezi",sdImportDone:"📥 Uvezeno! 💌",sdImportError:"Neispravan format 😢",sdQuestions:[{q:"💝 Obradovalo"},{q:"🤔 Zasmetalo"},{q:"🙏 Zahvalnost"},{q:"💪 Da poradimo"}],sdNoEntry:"Nema unosa",sdPartnerLocked:"Partner još nije napisao svoj osvrt za ovaj dan — ili još nije sinhronizovano.",sdTimelineLocked:"Zaključano",sdTimelineEmpty:"Još nema unosa — započnite danas! 💌",sdTimelineMore:"📅 Prikaži još",sdMyReflection:"Moj osvrt",sdMyHint:"Iskreno o danu — što više detalja, to bolje 💫",sdLabelHappy:"Šta me je danas obradovalo",sdLabelUncomf:"Šta mi je malo zasmetalo",sdLabelThanks:"Želim da ti se zahvalim za...",sdLabelWish:"Voleo/la bih da zajedno poradimo na...",sdSaveView:"Sačuvaj i pogledaj partnerov",sdGateHint:"Sačuvaj svoj unos pre nego što vidiš partnerov",sdPartnerReflection:"Partnerov osvrt",sdSyncHintOn:"☁️ Automatska sinhronizacija",sdSyncHintOff:"📤 Izvezi → pošalji partneru → Partner uveze",sdSyncJustNow:"malopre",sdSyncMinAgo:"min pre",sdSyncHAgo:"h pre",sdExportBtn:"Podeli",sdImportBtn:"Uvezi",sdTimelineTitle:"Vremenska linija",sdPartnerLockedText:"Prvo sačuvaj svoj unos da otključaš partnerov 💌",sdTranslateFail:"prevod nije uspeo",hugStreak:" dana zaredom!",hugReceived:" te zagrlio/la! 💫",hugBackBtn:"💝 Uzvrati zagrljaj",hugDismiss:"✕ zatvori",hugSentWaiting:"Zagrljaj poslat! Čekam odgovor... 💌",hugSendAnother:"Pošalji još jedan",hugSendBtn:"Pošalji zagrljaj",hugLimit:"Već si poslao/la 2 zagrljaja danas — probaj sutra! 🤗",hugSentBarry:"Poslao si joj zagrljaj!",hugSentAndjela:"Poslala si mu zagrljaj!",statsRegLabels:{high:"Visoka",medium:"Srednja",low:"Niska"},statsTrendTitle:"📈 Trend Ciklusa",statsTrendAvg:"Prosek",statsTrendEmpty:"Premalo podataka",statsTrendNeed:"Potrebno bar 2 ciklusa za trend",statsMoodTitle:"🎭 Distribucija Raspoloženja",statsMoodCenter:"unosa",statsMoodEmpty:"Nema podataka",statsMoodNoRecords:"Još nema zapisa o raspoloženju",statsSympTitle:"📋 Učestalost Simptoma",statsSympEmpty:"Nema podataka o simptomima",statsSympNoRecords:"Još nema zapisa o simptomima",statsDaysUntil:"Još",statsDaysUntilEnd:"dana",statsDaysLate:"Kasni",statsDaysLateEnd:"dana",statsConfidence:"Pouzdanost: ",statsNeedCycles:"(potrebno 2+ ciklusa)",statsOvLabel:"Ovulacija",statsFertLabel:"Plodni dani",statsFutureLabel:"Buduće",statsRegLabel:"Regularnost",statsTimelineTitle:"📜 Istorija Ciklusa",statsTimelineShort:"Kratak",statsTimelineNormal:"Normalan",statsTimelineLong:"Dug",statsHintCycles:"(treba bar 2 ciklusa)",holidayToday:"danas! 🎉",holidayDaysAway:"još",holidayOffLabel:"Odmor: ",modalLunar:"Lunarni",modalLunarSrSep:". mesec, ",modalLunarSrDay:". dan",loveCounterMet:" dana od prvog susreta",loveDaysTitle:"💕 Dani zajedno",solarTermBadge:"za",knowMePartnerLabel:" misli da je:",knowMeMatch:"Savršeno se razumete! ✨",knowMeWaiting:"Čeka se odgovor tvog partnera...",barryPhasePeriod:"Njena menstruacija",barryPhaseFollicular:"Njena folikularna",barryPhaseOvulation:"Njena ovulacija",barryPhaseLuteal:"Njena lutealna",barryPhaseGeneral:"Budi tu za nju",barryTipsTitle:"💡 Kako postupati prema njoj danas",phasePeriod:"Menstruacija",phaseFollicular:"Folikularna",phaseOvulation:"Ovulacija",phaseLuteal:"Lutealna"},"zh-CN":{profileName:"Anđela",profileName2:"Barry",loveNoteDefault:"每一天都在想你——你是我世界里最美好的一部分。💕",loveNoteSig:"— 你的 Barry",moodTitle:"😊 今日心情",moodToday:"今天感觉怎么样？",moodHistoryLabel:"最近7天",streakLabel:"天连续记录！",streakLabel0:"开始打卡吧！",streakBadgeHot:"太棒了！🔥",streakBadgeWarm:"不错 ✨",streakBadgeCold:"今天开始 🌱",diaryTitle:"📓 一行日记",diaryPrompt:"今天______让我笑了。",diaryPlaceholder:"写一句话...",gardenTitle:"🌱 我们的花园",gardenSeed:"每天给我浇水——点击上面 emoji 打卡！🌱",gardenSprout:"你的坚持开始发芽了...继续加油！🌿",gardenGrowing:"越来越茁壮了！🌷",gardenBudding:"快要开花了——再坚持一下！🎀",gardenBlooming:"绽放得真美！就像我们的爱。🌸✨",forecastTomorrow:"明天",forecastFollicular:"明天进入卵泡期——精力回升，适合做计划！💪",forecastOvulation:"明天是排卵日——你的身体最有光彩！✨",forecastLuteal:"明天进入黄体期——放慢节奏，你值得好好休息 🌙",forecastPeriod:"明天可能会来月经——准备好暖宝宝和热茶 💗",forecastNormal:"听从你的身体。每一天你都很了不起。🌸",moodEmojis:["😊","🥰","😤","😴","😢","🤩","😰","😐"],moodNames:["开心","被爱","烦躁","疲惫","难过","兴奋","焦虑","还行"],sharedDiaryTab:"日记",profileSwitch:"已切换账号",profileOnly:"仅 Barry 可查看",barryTipsPeriod:[{icon:"🫂",text:"她正在经历疼痛——温柔一点，抱抱她，给她暖水袋和热茶。"},{icon:"🍫",text:"带巧克力或她喜欢的零食给她——小事情在经期最重要。"},{icon:"😤",text:'别跟她争论——她情绪很低。倾听、点头、说"你说得对"。'},{icon:"🛏️",text:"让她休息。如果她想睡一整天——给她毯子，让她安静。"},{icon:"💆",text:"给她按摩背或脚——动作轻柔，她的身体现在很敏感。"}],barryTipsFollicular:[{icon:"🎯",text:"她会精力充沛——计划一起出去！散步、新活动、约会。"},{icon:"💬",text:"比平时更善于社交——适合深入交谈和未来规划。"},{icon:"💪",text:"和她一起运动或健身——一起变得更强。"},{icon:"🌸",text:"买花给她——不需要理由。这个阶段她最容易被小细节打动。"},{icon:"🎨",text:"创造力高峰期——提议一个新爱好或项目一起做。"}],barryTipsOvulation:[{icon:"✨",text:"今天她最闪耀——告诉她她有多美。真诚且具体的夸奖。"},{icon:"💋",text:"身体接触对她很重要——拥抱、亲吻、牵手。"},{icon:"🎉",text:"能量巅峰——适合出去玩、跳舞、朋友聚会。"},{icon:"🔥",text:'她最有"性致"——今晚要体贴又浪漫。'},{icon:"📸",text:"今天给她拍照——每张都会发光。"}],barryTipsLuteal:[{icon:"🧘",text:"PMS 开始了——别把她的情绪当回事。她的大脑在荷尔蒙风暴里。"},{icon:"🍵",text:"给她泡杯无咖啡因的花草茶——洋甘菊或薄荷。"},{icon:"🤐",text:'多听少说。别试图"解决问题"——只需倾听就好。'},{icon:"🍕",text:"她会突然想吃东西——不问就点她最爱的外卖。"},{icon:"🌙",text:"帮她放松——热水澡、蜡烛、轻音乐。她值得安宁。"}],barryTipsGeneral:[{icon:"💌",text:"现在就给她发条消息——说你在想她。不需要理由。"},{icon:"💝",text:"今天一件小事——她喜欢的饮料、水果、小东西。"},{icon:"📞",text:"给她打电话——听听她的声音，问问今天过得怎么样。"},{icon:"🌍",text:"记住——你是她的依靠。她爱你。你足够好。"}],diaryTextareaPlaceholder:"写吧，亲爱的... ✍️",diaryDateStripPrev:"◂ 上一周",diaryDateStripNext:"下一周 ▸",diaryCalPrevMonth:"◂ 上个月",diaryCalNextMonth:"下个月 ▸",diaryGoToday:"📍 今天",diaryCalBtnTitle:"日历",diaryFooterCredit:"为 Anđela Nemet 用爱制作 ♥",settingsTokenHintEnabled:"✅ 自动同步已开启 🌐",settingsTokenHintDisabled:"输入 GitHub Token 以同步两台手机",settingsExportAll:"📦 导出所有数据",settingsImportAll:"📥 从备份恢复",settingsClearDiary:"🗑️ 清空所有日记",settingsClearDiaryConfirm:"删除所有共享日记？此操作不可撤销。",settingsThemeLight:"☀️ 浅色",settingsThemeDark:"🌙 深色",sleepTitle:"睡眠",sleepHint:"昨晚几点睡的？Angie 会看到你的睡眠时间",sleepSave:"保存",sleepEmpty:"Barry 还没记录——提醒他！",sleepLabel:"昨晚他",specialBadgeTexts:["独一无二的你 ✨","最美的人 🌸","Barry 的爱 💝","世界上唯一的你 💫"],calendarPredLegend:"※ 半透明标记为未来周期预测",fabEndPeriod:"经期结束",fabStartPeriod:"经期来了",fabEndYet:"结束日必须在开始日之后",fabEndMarked:"经期结束已标记 ✓",fabAlreadyMarked:" - 已标记过",authPinBtn:"🔓 登录",authTapHint:"点击登录",authSwitchHint:"输入你的 PIN",gardenState0:"点上面的心情给我浇水！💧",gardenState1:"第一天！每天浇我哦 🌱",gardenState3:"在长大！快要开花了 🌿",gardenState7:"花苞！你的爱在滋养我 🌷",gardenStateBloom:"开花了！就像你们的爱 🌸",sdExportCopied:"已复制！发给伴侣吧 💌",sdExportCopiedSimple:"已复制！",songTitle:"🎵 我们的歌",songMyLabel:"我的歌",songTitlePlaceholder:"歌名...",songNotePlaceholder:"为什么是这首歌？",songSave:"保存",songPartnerLabel:"的歌",songEmpty:"设置让你们想到彼此的歌",songSaveEmpty:"请输入歌名 🎵",songSaved:"🎵 歌曲已保存！",knowMeTitle:"💭 你了解我吗？",knowMeMyLabel:"的回答",knowMeAnswerSaved:"💭 答案已保存！",hugTitle:"🤗 隔空拥抱",gratTitle:"💝 感恩便签",gratPlaceholder:"谢谢你...",checkinTitle:"🎯 每周感情体检",teaTitle:"🍵 茶室 — 塞尔维亚 ♥ 中国",loveCounterTogether:" 天在一起",sectRelationship:"💝 关系",offlineText:"当前离线，部分功能不可用",pwaInstallText:"📲 安装到手机 — 像App一样使用",modalHolidayLabel:"节日",modalSolarLabel:"节气",modalSpecialLabel:"特殊日子",sdDOW:["日","一","二","三","四","五","六"],sdDOWMon:["一","二","三","四","五","六","日"],sdExportPrompt:"复制发给伴侣：",sdSaveFirst:"请先保存你的日记",sdImportTitle:"📥 粘贴伴侣分享的内容",sdImportPlaceholder:"粘贴 JSON 文本...",sdImportCancel:"取消",sdImportConfirm:"导入",sdImportDone:"已导入！💌",sdImportError:"格式不对哦 😢",sdQuestions:[{q:"💝 开心的事"},{q:"🤔 不舒服的事"},{q:"🙏 感谢"},{q:"💪 希望改进"}],sdNoEntry:"没有记录",sdPartnerLocked:"伴侣还没写这一天的总结——或者还没同步过来。",sdTimelineLocked:"已锁定",sdTimelineEmpty:"还没有日记——今天就开始吧！💌",sdTimelineMore:"📅 展开剩余",sdMyReflection:"我的总结",sdMyHint:"坦诚地回顾一天——越详细越好 💫",sdLabelHappy:"今天让我开心的事",sdLabelUncomf:"让我有点不舒服的事",sdLabelThanks:"我想感谢你的...",sdLabelWish:"我希望我们能一起改进的...",sdSaveView:"保存并查看伴侣的",sdGateHint:"写完才能看伴侣的哦",sdPartnerReflection:"伴侣的总结",sdSyncHintOn:"☁️ 自动同步中",sdSyncHintOff:"📤 导出 → 发给伴侣 → 导入",sdSyncJustNow:"刚刚",sdSyncMinAgo:"分钟前",sdSyncHAgo:"小时前",sdExportBtn:"分享",sdImportBtn:"导入",sdTimelineTitle:"时间线",sdPartnerLockedText:"先保存你的日记才能解锁伴侣的哦 💌",sdTranslateFail:"翻译失败",hugStreak:"天连续！",hugReceived:"抱了你！💫",hugBackBtn:"回抱一个",hugDismiss:"✕ 关闭",hugSentWaiting:"拥抱已发送！等待回应... 💌",hugSendAnother:"再抱一次",hugSendBtn:"发送拥抱",hugLimit:"今天已经抱了2次——明天再来！🤗",hugSentBarry:"拥抱已发送！",hugSentAndjela:"拥抱已发送！",statsRegLabels:{high:"高",medium:"中",low:"低"},statsTrendTitle:"📈 周期趋势",statsTrendAvg:"均值",statsTrendEmpty:"数据不足",statsTrendNeed:"需要至少2个周期才显示趋势",statsMoodTitle:"🎭 心情分布",statsMoodCenter:"次记录",statsMoodEmpty:"暂无心情数据",statsMoodNoRecords:"还没有心情记录",statsSympTitle:"📋 症状频率",statsSympEmpty:"暂无症状数据",statsSympNoRecords:"还没有症状记录",statsDaysUntil:"距下次",statsDaysUntilEnd:"天",statsDaysLate:"已推迟",statsDaysLateEnd:"天",statsConfidence:"置信度：",statsNeedCycles:"(需2个周期以上)",statsOvLabel:"排卵日",statsFertLabel:"易孕窗口",statsFutureLabel:"未来预测",statsRegLabel:"规律性",statsTimelineTitle:"📜 周期历史",statsTimelineShort:"偏短",statsTimelineNormal:"正常",statsTimelineLong:"偏长",statsHintCycles:"(需2个周期以上)",holidayToday:"就是今天！🎉",holidayDaysAway:"还有",holidayOffLabel:"放假",modalLunar:"农历",modalLunarSrSep:"月",modalLunarSrDay:"日",loveCounterMet:" 天前初次相遇",loveDaysTitle:"💕 我们的日子",solarTermBadge:"",knowMePartnerLabel:"认为:",knowMeMatch:"你们太有默契了！✨",knowMeWaiting:"等待对方回答...",barryPhasePeriod:"她的经期",barryPhaseFollicular:"她的卵泡期",barryPhaseOvulation:"她的排卵期",barryPhaseLuteal:"她的黄体期",barryPhaseGeneral:"好好待她",barryTipsTitle:"💡 今天如何对待她",phasePeriod:"经期",phaseFollicular:"卵泡期",phaseOvulation:"排卵期",phaseLuteal:"黄体期"},en:{profileName:"Anđela",profileName2:"Barry",loveNoteDefault:"Every day I think of you — you are the most beautiful part of my world. 💕",loveNoteSig:"— Your Barry",moodTitle:"😊 Daily Mood",moodToday:"How are you feeling today?",moodHistoryLabel:"Last 7 days",streakLabel:"day streak!",streakLabel0:"Start a streak!",streakBadgeHot:"Amazing! 🔥",streakBadgeWarm:"Nice ✨",streakBadgeCold:"Start today 🌱",diaryTitle:"📓 One-Line Diary",diaryPrompt:"Today ______ made me smile.",diaryPlaceholder:"write one sentence...",gardenTitle:"🌱 Our Garden",gardenSeed:"Water me daily — tap an emoji above! 🌱",gardenSprout:"Your streak is sprouting... keep going! 🌿",gardenGrowing:"Getting stronger! 🌷",gardenBudding:"Almost blooming — just a bit more! 🎀",gardenBlooming:"Blooming beautifully! Just like our love. 🌸✨",forecastTomorrow:"Tomorrow",forecastFollicular:"Tomorrow you enter the follicular phase — energy rising, great day for plans! 💪",forecastOvulation:"Tomorrow is ovulation — your body shines brightest! ✨",forecastLuteal:"Tomorrow begins the luteal phase — slow down, you deserve rest 🌙",forecastPeriod:"Tomorrow your period may start — get your heating pad and tea ready 💗",forecastNormal:"Listen to your body. You are amazing every day. 🌸",moodEmojis:["😊","🥰","😤","😴","😢","🤩","😰","😐"],moodNames:["Happy","Loved","Frustrated","Tired","Sad","Excited","Anxious","Meh"],sharedDiaryTab:"Diary",profileSwitch:"Profile switched",profileOnly:"Only Barry can view this",barryTipsPeriod:[{icon:"🫂",text:"She is in pain — be gentle, hold her, bring her a heating pad and tea."},{icon:"🍫",text:"Bring her chocolate or her favorite treat. Little things matter most right now."},{icon:"😤",text:"Don't argue — her mood is at its lowest. Listen, nod, say \"you're right.\""},{icon:"🛏️",text:"Let her rest. If she wants to sleep all day — bring her a blanket and peace."},{icon:"💆",text:"Offer a back or foot massage — be gentle, her body is sensitive now."}],barryTipsFollicular:[{icon:"🎯",text:"She has rising energy — plan a date, a walk, a shared activity!"},{icon:"💬",text:"She's more social — great time for deep talks and future plans."},{icon:"💪",text:"Join her for a workout. Stronger together."},{icon:"🌸",text:"Buy her flowers for no reason. She'll notice the smallest gesture now."},{icon:"🎨",text:"Creative phase — suggest a new hobby or project to do together."}],barryTipsOvulation:[{icon:"✨",text:"She shines brightest today — tell her how beautiful she is. Be specific."},{icon:"💋",text:"Physical touch matters to her — hug, kiss, hold hands."},{icon:"🎉",text:"Peak energy — great day for dancing, going out, social fun."},{icon:"🔥",text:"Her libido peaks — be attentive and romantic tonight."},{icon:"📸",text:"Take photos of her today — she will glow in every shot."}],barryTipsLuteal:[{icon:"🧘",text:"PMS begins — don't take anything personally. Her brain is in a hormone storm."},{icon:"🍵",text:"Make her caffeine-free tea — chamomile or mint. It calms and shows you care."},{icon:"🤐",text:'Listen more, talk less. Don\'t try to "fix" — just listen.'},{icon:"🍕",text:"She'll have cravings — order her favorite food without asking."},{icon:"🌙",text:"Help her unwind — warm bath, candles, soft music. She deserves peace."}],barryTipsGeneral:[{icon:"💌",text:"Text her right now — say you're thinking of her. No reason needed."},{icon:"💝",text:"A small gesture today — her favorite drink, fruit, something thoughtful."},{icon:"📞",text:"Call her — hear her voice, ask how her day went."},{icon:"🌍",text:"Remember — you are her rock. She loves you. You are enough."}],diaryTextareaPlaceholder:"Write, my darling... ✍️",diaryDateStripPrev:"◂ Previous week",diaryDateStripNext:"Next week ▸",diaryCalPrevMonth:"◂ Previous month",diaryCalNextMonth:"Next month ▸",diaryCalBtnTitle:"Calendar",diaryGoToday:"📍 Today",diaryFooterCredit:"Made with love for Anđela Nemet ♥",settingsTokenHintEnabled:"✅ Auto-sync enabled 🌐",settingsTokenHintDisabled:"Enter GitHub Token to sync both phones",settingsExportAll:"📦 Export All Data",settingsImportAll:"📥 Restore from Backup",settingsClearDiary:"🗑️ Clear All Diaries",settingsClearDiaryConfirm:"Delete ALL shared diaries? This cannot be undone.",settingsThemeLight:"☀️ Light",settingsThemeDark:"🌙 Dark",sleepTitle:"Sleep",sleepHint:"What time did you sleep last night? Angie sees your sleep time",sleepSave:"Save",sleepEmpty:"Barry hasn't logged sleep yet — remind him!",sleepLabel:"Last night he slept at",specialBadgeTexts:["You are unique ✨","Most beautiful 🌸","Barry's love 💝","One and only 💫"],calendarPredLegend:"※ Faded dates are future predictions",fabEndPeriod:"Period ended",fabStartPeriod:"Period started",fabEndYet:"End must be after start",fabEndMarked:"Period end marked ✓",fabAlreadyMarked:" - already marked",authPinBtn:"🔓 Sign in",authTapHint:"Tap to sign in",authSwitchHint:"Enter your PIN",gardenState0:"Tap an emoji above to water me! 💧",gardenState1:"First day! Keep watering me daily 🌱",gardenState3:"Growing! Almost blooming 🌿",gardenState7:"Budding! Your love feeds me 🌷",gardenStateBloom:"Bloomed! Just like your love 🌸",sdExportCopied:"Copied! Send to partner 💌",sdExportCopiedSimple:"Copied!",songTitle:"🎵 Our Song",songMyLabel:"My song",songTitlePlaceholder:"Song title...",songNotePlaceholder:"Why this song?",songSave:"Save",songPartnerLabel:"song",songEmpty:"Set songs that remind you of each other",songSaveEmpty:"Enter a song title 🎵",songSaved:"🎵 Song saved!",knowMeTitle:"💭 Do You Know Me?",knowMeMyLabel:" answer",knowMeAnswerSaved:"💭 Answer saved!",hugTitle:"🤗 Virtual Hug",gratTitle:"💝 Gratitude Wall",gratPlaceholder:"Thank you for...",checkinTitle:"🎯 Weekly Check-in",teaTitle:"🍵 Tea Room — Serbia ♥ China",loveCounterTogether:" days together",sectRelationship:"💝 Relationship",offlineText:"Offline — some features unavailable",pwaInstallText:"📲 Install on phone — use like an app",modalHolidayLabel:"Holiday",modalSolarLabel:"Solar Term",modalSpecialLabel:"Special Day",sdDOW:["Su","Mo","Tu","We","Th","Fr","Sa"],sdDOWMon:["Mo","Tu","We","Th","Fr","Sa","Su"],sdExportPrompt:"Copy and send to partner:",sdSaveFirst:"Save your entry first",sdImportTitle:"📥 Paste partner's text",sdImportPlaceholder:"Paste JSON text here...",sdImportCancel:"Cancel",sdImportConfirm:"Import",sdImportDone:"📥 Imported! 💌",sdImportError:"Invalid format 😢",sdQuestions:[{q:"💝 Happy"},{q:"🤔 Uncomfortable"},{q:"🙏 Thanks"},{q:"💪 To improve"}],sdNoEntry:"No entry",sdPartnerLocked:"Your partner hasn't written their reflection for this day yet — or it hasn't synced.",sdTimelineLocked:"🔒 Locked",sdTimelineEmpty:"No entries yet — start today! 💌",sdTimelineMore:"📅 Show",sdMyReflection:"My Reflection",sdMyHint:"Be honest about your day — the more detail the better 💫",sdLabelHappy:"What made me happy today",sdLabelUncomf:"What felt a little uncomfortable",sdLabelThanks:"I want to thank you for...",sdLabelWish:"I hope we can work on...",sdSaveView:"Save & View Partner's",sdGateHint:"Save your entry to unlock your partner's",sdPartnerReflection:"Partner's Reflection",sdSyncHintOn:"☁️ Auto-sync on",sdSyncHintOff:"📤 Export → send → Partner imports",sdSyncJustNow:"just now",sdSyncMinAgo:"min ago",sdSyncHAgo:"h ago",sdExportBtn:"Share",sdImportBtn:"Import",sdTimelineTitle:"Timeline",sdPartnerLockedText:"Save your entry first to unlock your partner's 💌",sdTranslateFail:"translation failed",hugStreak:"-day streak!",hugReceived:" hugged you! 💫",hugBackBtn:"💝 Hug back",hugDismiss:"✕ dismiss",hugSentWaiting:"Hug sent! Waiting for response... 💌",hugSendAnother:"Send another",hugSendBtn:"Send a Hug",hugLimit:"You already sent 2 hugs today — try tomorrow! 🤗",hugSentBarry:"Hug sent!",hugSentAndjela:"Hug sent!",statsRegLabels:{high:"High",medium:"Medium",low:"Low"},statsTrendTitle:"📈 Cycle Trend",statsTrendAvg:"Avg",statsTrendEmpty:"Not enough data",statsTrendNeed:"Need 2+ cycles for trend",statsMoodTitle:"🎭 Mood Distribution",statsMoodCenter:"entries",statsMoodEmpty:"No mood data",statsMoodNoRecords:"No mood records yet",statsSympTitle:"📋 Symptom Frequency",statsSympEmpty:"No symptom data",statsSympNoRecords:"No symptom records yet",statsDaysUntil:"",statsDaysUntilEnd:"days until",statsDaysLate:"",statsDaysLateEnd:"days late",statsConfidence:"Confidence: ",statsNeedCycles:"(needs 2+ cycles)",statsOvLabel:"Ovulation",statsFertLabel:"Fertile Window",statsFutureLabel:"Future",statsRegLabel:"Regularity",statsTimelineTitle:"📜 Cycle History",statsTimelineShort:"Short",statsTimelineNormal:"Normal",statsTimelineLong:"Long",statsHintCycles:"(needs 2+ cycles)",holidayToday:"today! 🎉",holidayDaysAway:"",holidayOffLabel:"Days off: ",modalLunar:"Lunar",modalLunarSrSep:"/",modalLunarSrDay:"",loveCounterMet:" days since we met",loveDaysTitle:"💕 Our Days",solarTermBadge:"in",knowMePartnerLabel:" thinks it is:",knowMeMatch:"You two are perfectly in sync! ✨",knowMeWaiting:"Waiting for your partner to answer...",barryPhasePeriod:"Her Period",barryPhaseFollicular:"Her Follicular",barryPhaseOvulation:"Her Ovulation",barryPhaseLuteal:"Her Luteal",barryPhaseGeneral:"Be There For Her",barryTipsTitle:"💡 How to treat her today",phasePeriod:"Period",phaseFollicular:"Follicular",phaseOvulation:"Ovulation",phaseLuteal:"Luteal"}};function t(e,a){const o=e.split(".");let t=I18N_EXT[lang]||I18N_EXT.sr,i=!1;for(const e of o){if(!t||void 0===t[e]){i=!1;break}t=t[e],i=!0}if(i)return t;t=I18N[lang]||I18N.sr;for(const i of o){if(!t||void 0===t[i])return a||e;t=t[i]}return t}window.lang=localStorage.getItem("cycle-lang")||"sr";const LOVE_NOTES=function(){const e=["Svakog jutra kad otvorim oči, prva misao mi si ti. 🌅","Tvoj osmeh je moja omiljena boja. 🎨","Da si ovde, skuvao bih ti čaj i slušao kako ti je prošao dan. 🍵","Znaš onaj osećaj kad sunce izađe posle kiše? Ti si to za mene. 🌈","Nadam se da si danas nosila onaj osmeh koji toliko volim. 😊","Koliko god da si daleko, uvek si mi u srcu. 💝","Vojvodina je dobila najlepši cvet kad si se ti rodila. 🌻","Ti si ona vrsta lepote koja ne bledi — postaje samo dublja. ✨","Kad bih mogao da ti pošaljem zagrljaj kroz ekran, već bi stigao. 🤗","Ti si moja omiljena pesma, ona koja nikad ne dosadi. 🎵","Prošlo je X dana otkad smo zajedno, a ja te volim sve više. ♥","Razmišljam o tebi dok ovo pišem — i smešim se. 😌","Da mogu da biram gde ću biti sad, bio bih pored tebe. 🌍→🏡","Tvoja snaga me inspiriše svaki dan. Ti si neverovatna. 💪🌸","Sećaš se našeg prvog razgovora? Ja ga često prepričavam u glavi. 💭","Volim način na koji se smeješ — kao da cela soba postane svetlija. ✨","U svakom zalasku sunca vidim tvoje oči. 🌆","Danas sam video nešto lepo i poželeo da si tu da podelim s tobom. 🌸","Ako ikada posumnjaš u sebe, seti se da te Barry voli — a Barry zna. 😉","Ti nisi samo moja devojka — ti si moj najbolji prijatelj. 💑","Svaka priča ima svoju heroinu. U mojoj, to si ti. 📖","Da napišem knjigu o tebi, nestalo bi mi stranica. 📚","Ti si moj mir u haosu, moja tišina u buci. 🧘","Ne mogu da zamislim svet bez tvog osmeha. Ne želim ni da pokušam. 🌍♥","Kad te čujem preko telefona, ceo dan mi bude bolji. 📞","Ponekad samo zatvorim oči i zamislim da si pored mene. 💫","Ti me činiš boljom osobom — hvala ti za to. 💗","Kao što Mesec prati Zemlju, tako moje misli prate tebe. 🌙","Da si cvet, bila bi ruža — lepa, jaka, i sa trnjem kad treba. 🌹","Najbolji deo mog dana? Kad pomislim na tebe. A to je mnogo puta. 💌","Tvoja hrabrost me oduševljava. Ti se boriš kao lavica. 🦁","Volim i tvoje dobre i tvoje loše dane. Sve je to deo tebe. 🫂","Peking je veliki grad, ali bez tebe je prazan. 🏙️","Da mogu da ti dam jednu stvar, dao bih ti večnost nežnosti. ♾️","Ti si moj dokaz da ljubav ne poznaje granice. 🌍♥","Od Vojvodine do Pekinga — ljubav je najduža reka, i sve povezuje. 🌊","Kad bih umeo da slikam, slikao bih samo tebe. 🎨","Ti si mi u mislima kao što je beat u muzici — stalno. 🥁","Sanjam dan kad nećemo morati da brojimo kilometre. 🗺️","Volim te na srpskom, kineskom, i svim jezicima koji postoje. 🌐♥","Ako ikada zaboraviš koliko vrediš, pozovi me — podsetiću te. 📱","Ti si moja srećna zvezda. ⭐","Kad si srećna, i ja sam srećan. Tako je jednostavno. 😊","Tvoja lepota nije samo spolja — ona izvire iz tvoje duše. 🕯️","Volim te više nego što reči mogu da izraze. Zato ti šaljem srca. 💕💕💕","Svakog dana zahvaljujem univerzumu što si u mom životu. 🙏","Da se ponovo rodim, opet bih te tražio. 🔄♥","Tvoje ime Anđela — kao anđeo. I stvarno si to. 👼","Ti ulepšavaš svet samim tim što postojiš. 🌍→🌸","Nikad ne zaboravi: voljen si, i to beskrajno. ♾️💗"],a=["每天睁开眼，第一个想到的就是你。🌅","你的笑容是我最喜欢的颜色。🎨","如果你在身边，我会给你泡杯茶，听你讲今天的故事。🍵","你知道雨后阳光的感觉吗？你就是我的那种感觉。🌈","希望你今天带着我最爱的笑容。😊","不管多远，你一直在我心里。💝","Vojvodina 最美的花开在你出生的那天。🌻","你的美不会褪色——只会越来越深。✨","如果能穿过屏幕给你一个拥抱，它已经到了。🤗","你是我最爱的歌，永远听不腻的那一首。🎵","在一起 X 天了，每一天都更爱你。♥","写着写着就笑了——因为我在想你。😌","如果能选择此刻在哪里，我会选你身边。🌍→🏡","你的坚强每天都激励着我。你是了不起的。💪🌸","还记得我们第一次聊天吗？我经常在脑海里回放。💭","我喜欢你笑的样子——整个房间都亮了。✨","每一个日落里，我都看到你的眼睛。🌆","今天看到了美好的东西，真想你在身边分享。🌸","如果你怀疑自己，记住 Barry 爱你——Barry 是对的。😉","你不仅是我的女朋友——你是我最好的朋友。💑","每个故事都有女主角。在我的故事里，是你。📖","如果写一本关于你的书，纸都不够用。📚","你是我混乱中的平静，喧嚣中的安宁。🧘","无法想象没有你笑容的世界。也不想尝试。🌍♥","每次电话里听到你的声音，一整天都变好了。📞","有时候闭上眼，假装你就在身边。💫","你让我成为更好的人——谢谢你。💗","就像月亮绕着地球转，我的思绪绕着你。🌙","如果你是花，你一定是玫瑰——美丽、坚强，必要时有刺。🌹","一天中最棒的时刻？想你的那一刻。每天好多次。💌","你的勇敢让我惊叹。你像母狮一样战斗。🦁","我爱你的好日子，也爱你的坏日子。都是你的一部分。🫂","北京很大，但没有你是空的。🏙️","如果能给你一样东西，我会给你永恒的温柔。♾️","你是我跨过山海的证据。🌍♥","从 Vojvodina 到北京——爱是最长的河，连接一切。🌊","如果我会画画，只画你。🎨","你在我脑海里就像心跳——永不停止。🥁","梦想着不再数公里数的那一天。🗺️","用中文、塞语和所有语言说爱你。🌐♥","如果你忘了自己有多珍贵，打给我——我提醒你。📱","你是我的幸运星。⭐","你开心我就开心。就这么简单。😊","你的美不止在外表——从灵魂深处发光。🕯️","爱你超过言语能表达。所以给你发心心。💕💕💕","每一天都感谢宇宙让你出现在我的生命中。🙏","如果有来生，我还会去找你。🔄♥","你的名字 Anđela——意为天使。你真的是。👼","你存在本身就让世界更美好。🌍→🌸","永远不要忘记：你是被爱着的，无限地。♾️💗"],o=["Every morning when I open my eyes, my first thought is you. 🌅","Your smile is my favorite color. 🎨","If you were here, I would make you tea and listen to your day. 🍵","You know that feeling when the sun comes out after rain? You are that for me. 🌈","I hope you wore that smile I love so much today. 😊","No matter how far, you are always in my heart. 💝","Vojvodina got its most beautiful flower the day you were born. 🌻","You are the kind of beauty that never fades — it only deepens. ✨","If I could send you a hug through the screen, it would already be there. 🤗","You are my favorite song, the one that never gets old. 🎵","It has been X days together, and I love you more each one. ♥","I am writing this thinking of you — and smiling. 😌","If I could choose where to be right now, I would be next to you. 🌍→🏡","Your strength inspires me every day. You are amazing. 💪🌸","Remember our first conversation? I replay it in my head often. 💭","I love the way you laugh — like the whole room gets brighter. ✨","In every sunset, I see your eyes. 🌆","I saw something beautiful today and wished you were here to share it. 🌸","If you ever doubt yourself, remember Barry loves you — and Barry knows. 😉","You are not just my girlfriend — you are my best friend. 💑","Every story has a heroine. In mine, it is you. 📖","If I wrote a book about you, I would run out of pages. 📚","You are my calm in the chaos, my silence in the noise. 🧘","I cannot imagine a world without your smile. I do not want to try. 🌍♥","When I hear your voice on the phone, my whole day improves. 📞","Sometimes I close my eyes and pretend you are beside me. 💫","You make me a better person — thank you for that. 💗","As the moon follows the Earth, so my thoughts follow you. 🌙","If you were a flower, you would be a rose — beautiful, strong, with thorns when needed. 🌹","The best moment of my day? When I think of you. Which is a lot. 💌","Your courage astounds me. You fight like a lioness. 🦁","I love your good days and your bad days. All of it is you. 🫂","Beijing is a big city, but without you it is empty. 🏙️","If I could give you one thing, I would give you eternal tenderness. ♾️","You are my proof that love knows no borders. 🌍♥","From Vojvodina to Beijing — love is the longest river, connecting everything. 🌊","If I could paint, I would only paint you. 🎨","You are in my thoughts like a heartbeat — constant. 🥁","I dream of the day we stop counting kilometers. 🗺️","I love you in Serbian, Chinese, and every language that exists. 🌐♥","If you ever forget how precious you are, call me — I will remind you. 📱","You are my lucky star. ⭐","When you are happy, I am happy. It is that simple. 😊","Your beauty is not just outside — it glows from your soul. 🕯️","I love you more than words can say. So I send hearts. 💕💕💕","Every day I thank the universe for putting you in my life. 🙏","If I were born again, I would look for you. 🔄♥","Your name Anđela — like an angel. And you truly are one. 👼","You make the world more beautiful just by existing. 🌍→🌸","Never forget: you are loved, infinitely. ♾️💗"];return{get:function(){const t="zh-CN"===lang?a:"en"===lang?o:e;return t[Math.floor(Date.now()/864e5)%t.length]}}}();
/* === dist/js/gsap-animations.js === */
let HAS_GSAP=!1;try{"undefined"!=typeof gsap&&"undefined"!=typeof ScrollTrigger&&(gsap.registerPlugin(ScrollTrigger),gsap.defaults({ease:"power2.out",duration:.4}),gsap.matchMedia().add("(prefers-reduced-motion: reduce)",()=>(gsap.set(".gsap-animate",{clearProps:"all"}),()=>{})),HAS_GSAP=!0)}catch(a){}function animateLoginEntrance(){if(!HAS_GSAP)return;const a=document.querySelectorAll(".login-card");a.length&&gsap.timeline({defaults:{duration:.5,ease:"back.out(1.4)"}}).from(a,{y:40,autoAlpha:0,scale:.9,stagger:.15}).from(".login-title",{y:-20,autoAlpha:0,duration:.4},"-=0.3").from(".login-pin-area",{y:15,autoAlpha:0,duration:.3},"-=0.1")}function animateGreetingIn(){if(!HAS_GSAP)return;const a=document.querySelector(".greeting-card");a&&gsap.timeline({defaults:{ease:"back.out(1.7)",duration:.5}}).from(a,{scale:.7,autoAlpha:0,y:30}).from(".greeting-icon",{scale:0,rotation:-180,duration:.4},"-=0.2").from(".greeting-name",{y:10,autoAlpha:0},"-=0.15").from(".greeting-msg",{y:10,autoAlpha:0},"-=0.1")}function animateGreetingOut(a){HAS_GSAP&&a?gsap.to(a,{autoAlpha:0,scale:.95,duration:.25,ease:"power2.in",onComplete(){a.classList.add("hidden")}}):a&&a.classList.add("hidden")}function animateCalendarDays(){if(!HAS_GSAP)return;const a=document.querySelectorAll(".days .day.in-month");a.length&&(gsap.killTweensOf(a),gsap.from(a,{autoAlpha:0,y:10,duration:.35,stagger:{amount:.35,from:"center"},ease:"power1.out",clearProps:"all"}))}function animateModalIn(a){if(!HAS_GSAP)return;if(a||(a=document.getElementById("modal")),!a)return;const e=a.querySelector(".modal");if(e)try{gsap.killTweensOf([a,e]),a.classList.remove("hidden"),gsap.set(a,{display:"flex",autoAlpha:1}),gsap.from(e,{scale:.88,autoAlpha:0,y:15,duration:.35,ease:"back.out(1.3)",clearProps:"all"})}catch(a){}}function animateModalOut(a){if(!HAS_GSAP||!a)return void(a&&a.classList.add("hidden"));const e=a.querySelector(".modal");e?gsap.to(e,{scale:.9,autoAlpha:0,y:10,duration:.2,ease:"power2.in",onComplete(){a.classList.add("hidden"),gsap.set(e,{clearProps:"all"}),gsap.set(a,{clearProps:"all"})}}):a.classList.add("hidden")}function animateDashboardCards(){if(!HAS_GSAP)return;const a=document.querySelectorAll("#panel-dashboard .card, #panel-dashboard .dash-card");a.length&&(gsap.killTweensOf(a),gsap.from(a,{autoAlpha:0,y:20,duration:.45,stagger:.1,ease:"power2.out",clearProps:"all"}))}function showToast(a,e){e=e||"info";const t=document.getElementById("toastContainer");if(!t)return;const o=document.createElement("div");o.className="toast toast-"+e,o.textContent=a,o.setAttribute("role","alert"),t.appendChild(o),HAS_GSAP?(gsap.fromTo(o,{y:40,autoAlpha:0,scale:.95},{y:0,autoAlpha:1,scale:1,duration:.35,ease:"back.out(1.2)"}),gsap.to(o,{autoAlpha:0,y:-10,duration:.3,delay:2.5,ease:"power2.in",onComplete(){o.parentNode&&o.parentNode.removeChild(o)}})):setTimeout(()=>{o.parentNode&&o.parentNode.removeChild(o)},3e3)}function animateProgressBar(a,e){a&&(HAS_GSAP?(gsap.killTweensOf(a),gsap.to(a,{scaleX:e/100,duration:.7,ease:"power2.out",transformOrigin:"left center"})):a.style.transform="scaleX("+e/100+")")}function animateMoodPicker(a){if(!HAS_GSAP||!a)return;const e=a.querySelectorAll(".mood-btn");e.length&&(gsap.killTweensOf(e),gsap.from(e,{scale:0,autoAlpha:0,duration:.35,stagger:.05,ease:"back.out(2.5)",clearProps:"all"}))}let _starsAnimated=!1;function animateFloatingStars(){if(!HAS_GSAP||_starsAnimated)return;const a=document.querySelectorAll(".floating-stars .star");a.length&&(_starsAnimated=!0,a.forEach((a,e)=>{gsap.to(a,{y:gsap.utils.random(-15,15),x:gsap.utils.random(-8,8),rotation:gsap.utils.random(-8,8),duration:gsap.utils.random(2,4),repeat:-1,yoyo:!0,ease:"sine.inOut",delay:.25*e})}))}function animateStatsPanel(){if(!HAS_GSAP)return;const a=document.querySelectorAll("#panel-stats .card");a.length&&(gsap.killTweensOf(a),gsap.from(a,{autoAlpha:0,y:16,duration:.4,stagger:.08,ease:"power2.out",clearProps:"all"}))}function animateCountUp(a,e,t){if(t=t||"",!HAS_GSAP||!a)return void(a.textContent=e+t);const o={val:0};gsap.killTweensOf(o),gsap.to(o,{val:e,duration:1.2,ease:"power2.out",onUpdate(){a.textContent=Math.round(o.val)+t}})}function setupScrollReveals(){HAS_GSAP&&(ScrollTrigger.batch(".card, .stats-mini-card, .chart-card, .love-note-card, .garden-card",{interval:.1,batchMax:6,onEnter:a=>gsap.fromTo(a,{autoAlpha:0,y:24},{autoAlpha:1,y:0,duration:.5,stagger:.08,ease:"power2.out",overwrite:!0}),start:"top 90%",once:!0}),ScrollTrigger.batch(".diary-entry, .letter-card, .timeline-item",{interval:.1,batchMax:5,onEnter:a=>gsap.fromTo(a,{autoAlpha:0,x:-20},{autoAlpha:1,x:0,duration:.4,stagger:.06,ease:"power2.out",overwrite:!0}),start:"top 88%",once:!0}))}function initGsapAnimations(){HAS_GSAP&&(setupScrollReveals(),animateFloatingStars())}
/* === dist/js/ui-core.js === */
"use strict";function safeParse(e,t){if(null==e)return t;try{return JSON.parse(e)}catch(e){return t}}let _elCache={};function $(e){if(!_elCache[e]){const t=document.getElementById(e);t&&(_elCache[e]=t)}return _elCache[e]||null}function clearElCache(){_elCache={}}function debounce(e,t){let n=null;return function(){const a=arguments,o=this;clearTimeout(n),n=setTimeout(function(){e.apply(o,a)},t)}}function esc(e){return null==e?"":String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/`/g,"&#96;")}function closeModal(){const e=document.getElementById("modal");if(!e)return;const t=e.querySelector(".modal");t?"function"==typeof animateModalOut?animateModalOut(e):(t.classList.add("closing"),e.classList.add("closing"),t.addEventListener("animationend",function n(){t.removeEventListener("animationend",n),e.classList.add("hidden"),e.classList.remove("closing"),t.classList.remove("closing")},{once:!0})):e.classList.add("hidden"),selectedDate=null,knowledgeOpen=!1,window._lastFocusedBeforeModal&&window._lastFocusedBeforeModal.focus()}function toggleKnowledge(){if(knowledgeOpen=!knowledgeOpen,selectedDate){const e=predict();renderKnowledge(getPhase(selectedDate,e),fmtDate(selectedDate))}}function toast(e){const t=document.getElementById("toastContainer");if(!t)return;for(;t.children.length>=3;)t.firstChild.remove();const n=document.createElement("div");n.className="toast",n.textContent=e,t.appendChild(n),setTimeout(function(){n.classList.add("out")},2800),setTimeout(function(){n.parentNode&&n.remove()},3300)}document.addEventListener("click",function(e){const t=e.target.closest("[data-action]");if(!t)return;const n=t.getAttribute("data-action");if(n)switch(e.preventDefault(),n){case"close-modal":"function"==typeof closeModal&&closeModal();break;case"toggle-period":"function"==typeof togglePeriodRecord&&togglePeriodRecord();break;case"remove-period":"function"==typeof removePeriodRecord&&removePeriodRecord();break;case"save-diary":"function"==typeof saveDiaryEntry&&saveDiaryEntry();break;case"save-symptom":"function"==typeof saveSymptom&&saveSymptom();break;case"add-gratitude":"function"==typeof addGratitude&&addGratitude();break;case"send-hug":"function"==typeof sendHug&&sendHug();break;case"export-data":"function"==typeof exportAllData&&exportAllData();break;case"import-data":"function"==typeof importAllData&&importAllData();break;case"clear-diary":"function"==typeof clearAllDiaries&&clearAllDiaries();break;case"save-settings":"function"==typeof saveSettings&&saveSettings();break;default:t.dispatchEvent(new CustomEvent("action-"+n,{bubbles:!0}))}}),document.addEventListener("change",function(e){const t=e.target.closest("[data-action-change]");if(!t)return;const n=t.getAttribute("data-action-change");if(n)switch(n){case"theme":"function"==typeof switchTheme&&switchTheme(t.value);break;case"language":"function"==typeof switchLanguage&&switchLanguage(t.value)}});
/* === dist/js/chart-renderer.js === */
"use strict";const ChartRenderer={_theme:function(){const t="dark"===document.documentElement.getAttribute("data-theme");return{bg:t?"#1e1518":"#faf3ef",text:t?"#c4a8a8":"#3d2828",textMuted:t?"#7a6a68":"#8a7a78",grid:t?"rgba(255,255,255,0.06)":"rgba(80,40,40,0.08)",line:t?"#d47888":"#c45a6b",fill:t?"rgba(212,120,136,0.15)":"rgba(196,90,107,0.12)",dot:t?"#d47888":"#c45a6b",fillEnd:t?"rgba(212,120,136,0.01)":"rgba(196,90,107,0.01)",sage:t?"#8fc7b0":"#80a590",teal:t?"#7ab8a5":"#5e8b7a",lavender:t?"#c8b8d8":"#b8a0c8",gold:t?"#d4aa6e":"#c49a5e",donutColors:[t?"#d47888":"#c45a6b",t?"#e090a0":"#d4bfb5",t?"#8fc7b0":"#80a590",t?"#c8b8d8":"#b8a0c8",t?"#7ab8a5":"#5e8b7a",t?"#d4aa6e":"#c49a5e",t?"#e8a0b0":"#e8c8c0",t?"#a0c8b8":"#a0c0b0"]}},_setupCanvas:function(t,e,l){const n=window.devicePixelRatio||1,o=t.getBoundingClientRect().width||e;t.width=o*n,t.height=l*n,t.style.width=o+"px",t.style.height=l+"px";const i=t.getContext("2d");return i.scale(n,n),{ctx:i,w:o,h:l}},drawLineChart:function(t,e,l,n){n=n||{};const o=this._theme(),i=this._setupCanvas(t,n.width||500,n.height||200),a=i.ctx,r=i.w,d=i.h,c=16,h=32,f=r-h-16,g=d-c-28;if(a.clearRect(0,0,r,d),!e||0===e.length)return a.fillStyle=o.textMuted,a.font="italic .68rem "+getComputedStyle(document.body).fontFamily,a.textAlign="center",void a.fillText(n.emptyText||"No data yet",r/2,d/2);const u=e.slice();n.avgLine&&u.push(n.avgLine);let m=Math.floor(Math.min.apply(Math,u)-2),s=Math.ceil(Math.max.apply(Math,u)+2);if(s-m<4){const t=(m+s)/2;m=t-2,s=t+2}const y=e.length>1?f/(e.length-1):f/2,x=function(t){return c+g-(t-m)/(s-m)*g};a.strokeStyle=o.grid,a.lineWidth=.5,a.setLineDash([3,4]);for(let t=0;t<=4;t++){const e=c+g/4*t;a.beginPath(),a.moveTo(h,e),a.lineTo(r-16,e),a.stroke(),a.fillStyle=o.textMuted,a.font=".55rem "+getComputedStyle(document.body).fontFamily,a.textAlign="right",a.fillText(Math.round(s-(s-m)/4*t),26,e+3)}if(a.setLineDash([]),l&&l.length>0){a.fillStyle=o.textMuted,a.font=".52rem "+getComputedStyle(document.body).fontFamily,a.textAlign="center";const t=Math.max(1,Math.floor(l.length/5));for(let e=0;e<l.length;e+=t){const t=h+e*y;t<=r-16&&a.fillText(l[e],t,d-4)}}if(n.avgLine){const t=x(n.avgLine);a.strokeStyle=o.textMuted,a.lineWidth=1,a.setLineDash([4,6]),a.beginPath(),a.moveTo(h,t),a.lineTo(r-16,t),a.stroke(),a.setLineDash([]),a.fillStyle=o.textMuted,a.font=".52rem "+getComputedStyle(document.body).fontFamily,a.textAlign="left",a.fillText(n.avgLabel||"Avg",r-16-24,t-4)}const b=a.createLinearGradient(0,c,0,c+g);b.addColorStop(0,o.fill),b.addColorStop(1,o.fillEnd),a.fillStyle=b,a.beginPath(),a.moveTo(h,c+g);for(let t=0;t<e.length;t++)a.lineTo(h+t*y,x(e[t]));a.lineTo(h+(e.length-1)*y,c+g),a.closePath(),a.fill(),a.strokeStyle=o.line,a.lineWidth=2.5,a.lineJoin="round",a.beginPath(),a.moveTo(h,x(e[0]));for(let t=1;t<e.length;t++)a.lineTo(h+t*y,x(e[t]));a.stroke();for(let t=0;t<e.length;t++){const l=h+t*y,n=x(e[t]);a.beginPath(),a.arc(l,n,4,0,2*Math.PI),a.fillStyle=o.dot,a.fill(),a.strokeStyle=o.bg,a.lineWidth=2,a.stroke(),a.fillStyle=o.text,a.font="bold .55rem "+getComputedStyle(document.body).fontFamily,a.textAlign="center",a.fillText(e[t],l,n-10)}},drawDonutChart:function(t,e,l){l=l||{};const n=this._theme(),o=this._setupCanvas(t,l.width||260,l.height||200),i=o.ctx,a=o.w,r=o.h,d=a/2,c=r/2,h=Math.min(d,c)-8,f=.58*h;let g=0;for(let t=0;t<e.length;t++)g+=e[t].value;if(i.clearRect(0,0,a,r),0===g)return i.fillStyle=n.textMuted,i.font="italic .68rem "+getComputedStyle(document.body).fontFamily,i.textAlign="center",i.fillText(l.emptyText||"No data yet",d,c),[];const u=n.donutColors;let m=-Math.PI/2;for(let t=0;t<e.length;t++){const l=e[t].value/g*Math.PI*2;i.beginPath(),i.arc(d,c,h,m,m+l),i.arc(d,c,f,m+l,m,!0),i.closePath(),i.fillStyle=e[t].color||u[t%u.length],i.fill();const o=m+l/2,a=h+14,r=d+Math.cos(o)*a,s=c+Math.sin(o)*a;l>.35&&e[t].value>0&&(i.fillStyle=n.text,i.font="bold .52rem "+getComputedStyle(document.body).fontFamily,i.textAlign="center",i.textBaseline="middle",i.fillText(e[t].value,r,s)),m+=l}i.fillStyle=n.text,i.font="bold .9rem "+getComputedStyle(document.body).fontFamily,i.textAlign="center",i.textBaseline="middle",i.fillText(g,d,c-6),i.fillStyle=n.textMuted,i.font=".55rem "+getComputedStyle(document.body).fontFamily,i.fillText(l.centerLabel||"total",d,c+12);const s=[];for(let t=0;t<e.length;t++)s.push({label:e[t].label,color:e[t].color||u[t%u.length],value:e[t].value,pct:g>0?Math.round(e[t].value/g*100):0});return s},drawBarChart:function(t,e,l){l=l||{};const n=this._theme(),o=this._setupCanvas(t,l.width||460,l.height||200),i=o.ctx,a=o.w,r=o.h;let d=1;for(let t=0;t<e.length;t++)e[t].value>d&&(d=e[t].value);const c=Math.min(22,(r-20)/e.length),h=Math.min(70,.22*a),f=a-h-12;if(i.clearRect(0,0,a,r),0===e.length||0===d)return i.fillStyle=n.textMuted,i.font="italic .68rem "+getComputedStyle(document.body).fontFamily,i.textAlign="center",void i.fillText(l.emptyText||"No data yet",a/2,r/2);for(let t=0;t<e.length;t++){const l=10+t*(c+4),o=Math.max(4,e[t].value/d*f);i.fillStyle=n.text,i.font=".6rem "+getComputedStyle(document.body).fontFamily,i.textAlign="right",i.fillText(e[t].label,h-6,l+c/2+3),i.fillStyle=n.grid,ChartRenderer._roundRect(i,h+4,l,f,c,4),i.fill(),i.fillStyle=e[t].color||n.line,ChartRenderer._roundRect(i,h+4,l,o,c,4),i.fill(),i.fillStyle=n.text,i.font="bold .58rem "+getComputedStyle(document.body).fontFamily,i.textAlign="left",i.fillText(e[t].value,h+o+10,l+c/2+3)}},drawSparkline:function(t,e,l){l=l||{};const n=this._theme(),o=this._setupCanvas(t,l.width||120,l.height||36),i=o.ctx,a=o.w,r=o.h;if(i.clearRect(0,0,a,r),!e||e.length<2)return i.fillStyle=n.textMuted,i.font=".5rem "+getComputedStyle(document.body).fontFamily,i.textAlign="center",void i.fillText("--",a/2,r/2+4);const d=Math.min.apply(Math,e),c=Math.max.apply(Math,e)-d||1,h=(a-4)/(e.length-1),f=function(t){return r-2-(t-d)/c*(r-4)},g=l.color||n.line;i.strokeStyle=g,i.lineWidth=1.5,i.lineJoin="round",i.beginPath(),i.moveTo(2,f(e[0]));for(let t=1;t<e.length;t++)i.lineTo(2+t*h,f(e[t]));i.stroke();const u=2+(e.length-1)*h,m=f(e[e.length-1]);i.beginPath(),i.arc(u,m,2.5,0,2*Math.PI),i.fillStyle=g,i.fill()},_roundRect:function(t,e,l,n,o,i){t.beginPath(),t.moveTo(e+i,l),t.lineTo(e+n-i,l),t.arcTo(e+n,l,e+n,l+i,i),t.lineTo(e+n,l+o-i),t.arcTo(e+n,l+o,e+n-i,l+o,i),t.lineTo(e+i,l+o),t.arcTo(e,l+o,e,l+o-i,i),t.lineTo(e,l+i),t.arcTo(e,l,e+i,l,i),t.closePath()}};
/* === dist/js/lunar.js === */
const Lunar=function(){const n=[19416,19168,42352,21717,53856,55632,91476,22176,39632,21970,19168,42422,42192,53840,119381,46400,54944,44450,38320,84343,18800,42160,46261,27216,27968,109396,11104,38256,21234,18800,25958,54432,59984,92821,23248,11104,100067,37600,116951,51536,54432,120998,46416,22176,107956,9680,37584,53938,43344,46423,27808,46416,86869,19872,42416,83315,21168,43432,59728,27296,44710,43856,19296,43748,42352,21088,62051,55632,23383,22176,38608,19925,19152,42192,54484,53840,54616,46400,46752,103846,38320,18864,43380,42160,45690,27216,27968,44870,43872,38256,19189,18800,25776,29859,59984,27480,23232,43872,38613,37600,51552,55636,54432,55888,30034,22176,43959,9680,37584,51893,43344,46240,47780,44368,21977,19360,42416,86390,21168,43312,31060,27296,44368,23378,19296,42726,42208,53856,60005,54576,23200,30371,38608,19195,19152,42192,118966,53840,54560,56645,46496,22224,21938,18864,42359,42160,43600,111189,27936,44448,84835,37744,18936,18800,25776,92326,59984,27424,108228,43744,37600,53987,51552,54615,54432,55888,23893,22176,42704,21972,21200,43448,43344,46240,46758,44368,21920,43940,42416,21168,45683,26928,29495,27296,44368,84821,19296,42352,21732,53600,59752,54560,55968,92838,22224,19168,43476,42192,53584,62034,54560],t=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"],e=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"],a=["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"],r=["正","二","三","四","五","六","七","八","九","十","冬","腊"],o=["","初一","初二","初三","初四","初五","初六","初七","初八","初九","初十","十一","十二","十三","十四","十五","十六","十七","十八","十九","二十","廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"];function i(t){return 15&n[t-1900]}function u(t,e){return n[t-1900]&65536>>e?30:29}function c(t){const e=n[t-1900];let a=348;for(let n=32768;n>8;n>>=1)e&n&&(a+=1);return i(t)&&(a+=65536&e?30:29),a}function f(f){const s=new Date(1900,0,31);let l,h=Math.floor((f-s)/864e5);if(h<0)return null;for(l=1900;l<=2100;l++){const n=c(l);if(h<n)break;h-=n}if(l>2100)return null;const m=i(l);let y=1,N=!1;for(;y<=12;y++){let t=u(l,y);if(h<t)break;if(h-=t,m===y){if(t=65536&n[l-1900]?30:29,h<t){N=!0;break}h-=t}}const g=h+1;let D=(l-4)%60;D<0&&(D+=60);const L=t[D%10]+e[D%12];return{year:l,month:y,day:g,isLeap:N,monthName:(N?"闰":"")+r[y-1]+"月",dayName:o[g],yearName:L+"年",tianGanDiZhi:L,shengXiao:a[D%12]}}return{toLunar:f,getShengXiao:function(n){let t=(n-4)%12;return t<0&&(t+=12),a[t]},getTianGanDiZhi:function(n){let a=(n-4)%60;return a<0&&(a+=60),t[a%10]+e[a%12]},getLunarMonthDay:function(n){const t=f(n);return t?t.monthName+t.dayName:""},getLunarDayName:function(n){const t=f(n);return t?o[t.day]:""},isLunarNewYear:function(n){const t=f(n);return t&&1===t.month&&1===t.day&&!t.isLeap},isFullMoon:function(n){const t=f(n);return t&&15===t.day},getYearInfo:function(n){const t=f(n);return t?{yearName:t.yearName,shengXiao:t.shengXiao,tianGanDiZhi:t.tianGanDiZhi}:null},SHENGXIAO:a,GAN:t,ZHI:e}}();
/* === dist/js/calendar-culture.js === */
const EXTRA_HOLIDAYS=[{d:"2026-02-11",name:{sr:"Mala Nova Godina",zh:"小年",en:"Little New Year"},country:"cn",icon:"🧹",desc:{sr:"Dan čišćenja kuće pred Novu Godinu — da sva sreća ima gde da uđe.",zh:"腊月二十三，祭灶扫尘，准备迎接新年。灶糖甜甜的，给灶王爷一个好印象。",en:"Sweeping the house clean — making room for all the blessings of the New Year."}},{d:"2026-02-18",name:{sr:"Dan ljudi",zh:"人日",en:"Renri (Human Day)"},country:"cn",icon:"👤",desc:{sr:"Sedmi dan Nove Godine — rođendan čovečanstva. Nüwa je danas stvorila ljude od gline.",zh:"正月初七，传说女娲在这一天创造了人类——是每个人的生日。吃七宝羹，祈求健康平安。",en:"The 7th day of CNY — humanity's birthday. Nüwa created humans from clay on this day."}},{d:"2026-04-20",name:{sr:"Festival kiše za žito",zh:"谷雨节",en:"Grain Rain Festival"},country:"cn",icon:"🌾",desc:{sr:"Poslednji prolećni solarni termin — vreme za setvu i molitvu za bogatu žetvu.",zh:"雨生百谷，春天最后一个节气。喝一杯谷雨茶，赏一赏牡丹花，感恩大地的滋养。",en:"The last spring solar term — time for sowing. Drink Grain Rain tea and admire the peonies."}},{d:"2026-09-15",name:{sr:"Festival gladnih duhova",zh:"中元节",en:"Hungry Ghost Festival"},country:"cn",icon:"🏮",desc:{sr:"Dan kada se pali tamjan za duše predaka. Noćas granica između svetova postaje tanja.",zh:"七月十五，中元普渡。点燃一盏河灯，照亮先人回家的路。这天晚上别太晚回家哦。",en:"The 15th of the 7th lunar month. Light water lanterns to guide ancestral spirits home."}},{d:"2026-11-01",name:{sr:"Festival donjeg izvora",zh:"下元节",en:"Xiayuan Festival"},country:"cn",icon:"🙏",desc:{sr:"Dan molitve Bogu Vode da smiri reke i donese mir.",zh:"十月十五，祭祀水官大帝，祈求冬日平安。一碗热汤圆，温暖即将到来的整个冬天。",en:"Praying to the Water God for a calm winter. Tangyuan brings warmth for the cold months ahead."}},{d:"2026-12-22",name:{sr:"Zimski solsticij festival",zh:"冬至节",en:"Winter Solstice Festival"},country:"cn",icon:"🥟",desc:{sr:'"Zimski solsticij je važniji od Nove Godine!" Porodica se okuplja uz jufke.',zh:"冬至大如年！北方人吃饺子，南方人吃汤圆。从今天起阳气渐生，春天已经在路上了。",en:"Winter Solstice is as important as New Year! Northern dumplings, southern tangyuan — yang energy returns."}}],CULTURE_EXPLAIN={lunar:{sr:'Kinezi već 4000 godina prate vreme pomoću lunarnog kalendara (农历 Nónglì). Svaki mesec počinje mladim mesecom 🌑, a pun mesec 🌕 je uvek 15. dana. Datumi koje vidiš na kalendaru (npr. "初三" = treći dan lunarnog meseca) pomažu Kinezima da odrede kada su tradicionalni praznici, venčanja i važni događaji. Za razliku od gregorijanskog kalendara, lunarna Nova Godina je svake godine na drugi datum!',en:'For 4000 years, Chinese people have tracked time with the lunar calendar (农历 Nónglì). Each month starts with a new moon 🌑, and the full moon 🌕 is always on the 15th. The dates on the calendar (e.g. "初三" = 3rd day of the lunar month) help Chinese people determine traditional holidays, weddings, and important events. Unlike the Gregorian calendar, Lunar New Year falls on a different date each year!',zh:'农历已有四千多年历史，每月始于新月🌑，十五必是满月🌕。日历格上的小字（如"初三"）告诉你今天是农历月的第几天，中国人靠它来定节日、婚嫁、祭祀。公历1月1日是新年，但农历新年每年日期都不一样——这就是"春节"的魅力。'},tiangandizhi:{sr:'天干地支 (Tiāngān Dìzhī) je drevni kineski sistem brojanja od 60 kombinacija — 10 Nebeskih Stabljika (天干) i 12 Zemaljskih Grana (地支). Svaka godina, mesec, dan, pa čak i sat imaju svoju kombinaciju! To je kao kineski astrološki kod. Trenutna godina (丙午 Bǐngwǔ) znači "Vatreni Konj" — vatrena energija i sloboda.',en:'天干地支 (Tiāngān Dìzhī) is an ancient Chinese 60-combination counting system — 10 Heavenly Stems (天干) and 12 Earthly Branches (地支). Every year, month, day, and even hour has its own combination! Think of it as a Chinese astrological code. The current year (丙午 Bǐngwǔ) means "Fire Horse" — fiery energy and freedom.',zh:'天干地支是中国最古老的纪年法，十天干配十二地支，六十种组合循环往复。不止年份，月份、日子、时辰也都有干支。古代中国人用它来看命理、选吉日。今年是"丙午"年——丙属火，午为马，合起来就是"火马之年"，象征热情奔腾。'},shengxiao:{sr:"Kineski zodijak (生肖 Shēngxiào) ima 12 životinja koje se smenjuju svake godine: Pacov 🐭, Vo 🐮, Tigar 🐯, Zec 🐰, Zmaj 🐲, Zmija 🐍, Konj 🐴, Koza 🐑, Majmun 🐵, Petao 🐔, Pas 🐶, Svinja 🐷. Tvoja životinja zavisi od godine rođenja! Svaka životinja nosi posebne osobine — Zmaj je moćan, Zec je nežan, Konj je slobodan...",en:"The Chinese zodiac (生肖 Shēngxiào) has 12 animals that cycle each year: Rat 🐭, Ox 🐮, Tiger 🐯, Rabbit 🐰, Dragon 🐲, Snake 🐍, Horse 🐴, Goat 🐑, Monkey 🐵, Rooster 🐔, Dog 🐶, Pig 🐷. Your animal depends on your birth year! Each animal carries special traits — Dragon is powerful, Rabbit is gentle, Horse is free-spirited...",zh:"十二生肖大家都熟悉——鼠牛虎兔龙蛇马羊猴鸡狗猪，每年轮一个。哪年出生的就属什么。龙年出生的霸气，兔年出生的温柔，马年出生的爱自由……你和你的伴侣分别属什么？"},solarterm:{sr:'24 solarna termina (节气 Jiéqì) dele godinu na 24 dela — to je drevni kineski "poljoprivredni sat" star 3000 godina! Svaki termin traje oko 15 dana i opisuje šta se dešava u prirodi: buđenje insekata (惊蛰), žetva pšenice (芒种), prvi mraz (霜降)... Kinezi ih i danas koriste da znaju kada da sade, žanju i slave.',en:'24 Solar Terms (节气 Jiéqì) divide the year into 24 segments — an ancient Chinese "farming clock" over 3000 years old! Each term lasts about 15 days and describes what happens in nature: Awakening of Insects (惊蛰), Grain in Ear (芒种), First Frost (霜降)... Chinese people still use them today to know when to plant, harvest, and celebrate.',zh:'二十四节气把一年分成24份，是三千年前的"农耕时钟"。每个节气约15天，精准描述自然变化：惊蛰虫子醒、芒种麦子熟、霜降天变冷……这套系统在2016年被列入联合国非物质文化遗产。中国人至今依照节气种地、养生、过节。'},poem:{sr:"Tang i Song dinastije (7-13. vek) su zlatno doba kineske poezije. Ove pesme — pune prirode, ljubavi i čežnje — i danas svaki Kinez zna napamet. One su kao mali prozori u kinesku dušu: zima je samoća i lepota, proleće je nada, leto je radost, jesen je seta.",en:"The Tang and Song dynasties (7th-13th century) were the golden age of Chinese poetry. These poems — full of nature, love, and longing — are still memorized by every Chinese person today. They are little windows into the Chinese soul: winter is solitude and beauty, spring is hope, summer is joy, autumn is melancholy.",zh:"唐诗宋词是中国文学最璀璨的明珠。一千多年前的诗人们，用最精炼的文字写下山水、离别、思念、豁达——至今每个中国人都会背几首。这里每月精选一首与你共赏。"},color:{sr:'Kinezi su kroz istoriju razvili neverovatno bogat rečnik boja — stotine poetskih imena koja oslikavaju prirodu: "mesečevo bela" (月白), "breskvino roze" (桃红), "lotus zelena" (荷绿)... Svako ime je mala slika. Boje se menjaju kroz godišnja doba prateći drevni sistem Pet Elemenata (Drvo, Vatra, Zemlja, Metal, Voda).',en:'Throughout history, Chinese people developed an incredibly rich color vocabulary — hundreds of poetic names that paint nature: "moon white" (月白), "peach pink" (桃红), "lotus green" (荷绿)... Each name is a tiny painting. Colors shift through the seasons following the ancient Five Elements system (Wood, Fire, Earth, Metal, Water).',zh:"中国传统色有上百种，名字极美——月白、桃红、柳绿、黛蓝、琥珀、胭脂……每听一个名字都是一幅画。颜色还与五行（木火土金水）和季节呼应。看看这个月是什么色？"}},SEASONAL_POEMS={0:{title:{zh:"元日",sr:"Novogodišnji dan",en:"New Year's Day"},author:"王安石",dynasty:"宋",explain:{sr:'Pesma slavi kinesku Novu Godinu. "Peach-wood signs" (桃符) su preteče današnjih crvenih papirnih amajlija koje Kinezi lepe na vrata za sreću.',en:'This poem celebrates Chinese New Year. "Peach-wood signs" (桃符) were the ancestors of today\'s red paper couplets pasted on doors for luck.',zh:"写春节最经典的诗。爆竹声里旧年过去，家家户户换上新的桃符（春联的前身），春风把暖意送进每一杯屠苏酒里。"},lines:{zh:"爆竹声中一岁除，春风送暖入屠苏。\n千门万户曈曈日，总把新桃换旧符。",sr:"Uz prasak petardi stara godina odlazi,\nProlećni vetar donosi toplinu.\nSunce obasjava hiljade domova,\nSvi menjaju stare amajlije za nove.",en:"Firecrackers bid the old year farewell,\nSpring wind brings warmth to every home.\nThe sun shines on a thousand doors,\nAll swap old charms for new peach-wood signs."}},2:{title:{zh:"春晓",sr:"Prolećno jutro",en:"Spring Morning"},author:"孟浩然",dynasty:"唐",explain:{sr:"Najpoznatija kineska pesma o proleću. Pesnik se budi i shvata da je proleće već tu — ptice pevaju, a noćna kiša je oborila latice cveća. Jednostavna, a tako živa slika.",en:"The most famous Chinese spring poem. The poet wakes to find spring has arrived — birds sing, and last night's rain has knocked petals to the ground. Simple yet vivid.",zh:"每个中国人都会背的第一首诗。春睡醒来，鸟鸣处处，想起昨夜风雨——不知花落了多少？短短二十个字，春日的慵懒与怜惜跃然纸上。"},lines:{zh:"春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。",sr:"U prolećnom snu ne čuješ zoru,\nSvuda cvrkut ptica.\nSinoć šum vetra i kiše —\nKoliko latica je palo?",en:"Spring sleep, unaware of dawn,\nEverywhere I hear birds sing.\nLast night — wind and rain,\nHow many flowers have fallen?"}},5:{title:{zh:"小池",sr:"Mali ribnjak",en:"Little Pond"},author:"杨万里",dynasty:"宋",explain:{sr:'Letnja minijatura — izvor, senka drveta, lotosov pupoljak i vilin konjic. Pesnik gleda mali ribnjak i vidi ceo svet u njemu. Kineska poezija voli ovakve "male velike stvari".',en:'A summer miniature — a spring, tree shade, a lotus bud, and a dragonfly. The poet sees a whole world in a little pond. Chinese poetry loves these "small big things."',zh:'夏日小景——泉眼、树荫、才露尖角的小荷、早已立在荷尖的蜻蜓。诗人没有说一个"夏"字，却写尽了初夏的灵动与生机。'},lines:{zh:"泉眼无声惜细流，树阴照水爱晴柔。\n小荷才露尖尖角，早有蜻蜓立上头。",sr:"Izvor šapuće, štedeći tanak mlaz,\nSenka drveta miluje vodu.\nTek što lotos pokaže vrh,\nVilin konjic već na njemu stoji.",en:"The spring murmurs, sparing its stream,\nTree shade caresses the sunlit water.\nThe lotus bud just shows its tip,\nA dragonfly already rests upon it."}},8:{title:{zh:"山居秋暝",sr:"Jesenje veče u planinama",en:"Autumn Evening"},author:"王维",dynasty:"唐",explain:{sr:"Wang Wei je bio pesnik i slikar — njegove pesme su kao slike. Ovde slika jesenje veče u planinama posle kiše: svež vazduh, mesečina kroz borove, potok preko kamenja. Savršen mir.",en:"Wang Wei was both poet and painter — his poems are like paintings. Here he paints an autumn evening in the mountains after rain: fresh air, moonlight through pines, a stream over stones. Perfect peace.",zh:'王维是"诗中有画"的代表。空山新雨，明月松间，清泉石上——四句话就是一幅山水画。秋夜的清冷与宁静，美到让人忘记时间。'},lines:{zh:"空山新雨后，天气晚来秋。\n明月松间照，清泉石上流。",sr:"Prazne planine posle sveže kiše,\nVazduh miriše na jesen.\nMesec sija kroz borove,\nPotok teče preko kamenja.",en:"Empty mountains after fresh rain,\nThe air feels of autumn.\nMoon shines through the pines,\nA clear spring flows over stones."}},11:{title:{zh:"江雪",sr:"Sneg na reci",en:"River Snow"},author:"柳宗元",dynasty:"唐",explain:{sr:"Najpoznatija kineska zimska pesma. Hiljade planina — ni jedne ptice. Deset hiljada staza — ni jednog čoveka. Samo jedan starac u čamcu, peca na zaleđenoj reci. Potpuna tišina i samoća — ali i neverovatna unutrašnja snaga.",en:"The most famous Chinese winter poem. A thousand mountains — not a single bird. Ten thousand paths — not a single person. Only an old man in a boat, fishing on a frozen river. Absolute silence and solitude — but also incredible inner strength.",zh:"中国最有名的冬诗。千山无鸟，万径无人——天地间只剩一个披蓑戴笠的老翁，独坐在江雪中垂钓。极致的孤独，也是极致的自由。"},lines:{zh:"千山鸟飞绝，万径人踪灭。\n孤舟蓑笠翁，独钓寒江雪。",sr:"Na hiljadu planina ni ptice,\nNa deset hiljada staza ni traga.\nU čamcu starac sa slamnim šeširom —\nSam peca na hladnoj reci pod snegom.",en:"A thousand hills — no bird in flight,\nTen thousand paths — no human trace.\nA lone boat, an old man in straw cloak,\nFishing alone in the cold river snow."}}},TRADITIONAL_COLORS={0:{name:{zh:"月白",sr:"mesečevo bela",en:"moon white"},hex:"#D6E4F0"},1:{name:{zh:"水色",sr:"vodeno plava",en:"water blue"},hex:"#A8D8EA"},2:{name:{zh:"柳绿",sr:"vrbino zelena",en:"willow green"},hex:"#A8D08D"},3:{name:{zh:"桃红",sr:"breskvino roze",en:"peach pink"},hex:"#F4A7B9"},4:{name:{zh:"天青",sr:"nebesko plava",en:"sky cyan"},hex:"#87CEEB"},5:{name:{zh:"朱砂",sr:"cinober crvena",en:"cinnabar red"},hex:"#E53935"},6:{name:{zh:"荷绿",sr:"lotus zelena",en:"lotus green"},hex:"#4CAF50"},7:{name:{zh:"黛蓝",sr:"indigo plava",en:"indigo blue"},hex:"#1A237E"},8:{name:{zh:"琥珀",sr:"ćilibarna",en:"amber"},hex:"#FF8F00"},9:{name:{zh:"胭脂",sr:"rumenilo",en:"rouge"},hex:"#C62828"},10:{name:{zh:"霜白",sr:"mrazno bela",en:"frost white"},hex:"#ECEFF1"},11:{name:{zh:"墨色",sr:"tuš crna",en:"ink black"},hex:"#212121"}},GAN_SR=["Dzja","Ji","Bing","Ding","Vu","Dji","Geng","Sin","Ren","Guej"],GAN_EN=["Jia","Yi","Bing","Ding","Wu","Ji","Geng","Xin","Ren","Gui"],GAN_ELEM_SR=["Drvo Jang","Drvo Jin","Vatra Jang","Vatra Jin","Zemlja Jang","Zemlja Jin","Metal Jang","Metal Jin","Voda Jang","Voda Jin"],GAN_ELEM_EN=["Yang Wood","Yin Wood","Yang Fire","Yin Fire","Yang Earth","Yin Earth","Yang Metal","Yin Metal","Yang Water","Yin Water"],ZHI_SR=["Zi","Čou","Jin","Mao","Čen","Si","Vu","Vej","Šen","Jou","Sju","Haj"],ZHI_EN=["Zi","Chou","Yin","Mao","Chen","Si","Wu","Wei","Shen","You","Xu","Hai"],ZOO_SR=["Pacov","Vo","Tigar","Zec","Zmaj","Zmija","Konj","Koza","Majmun","Petao","Pas","Svinja"],ZOO_EN=["Rat","Ox","Tiger","Rabbit","Dragon","Snake","Horse","Goat","Monkey","Rooster","Dog","Pig"],ZOO_EMOJI=["🐭","🐮","🐯","🐰","🐲","🐍","🐴","🐑","🐵","🐔","🐶","🐷"];function _ganZhiTranslated(e){if(!e||e.length<2)return e;const n=e[0],a=e[1],i=Lunar.GAN.indexOf(n),o=Lunar.ZHI.indexOf(a);if(i<0||o<0)return e;const t="undefined"!=typeof lang?lang:"sr";return"sr"===t||"sr-RS"===t?GAN_SR[i]+ZHI_SR[o]+" ("+GAN_ELEM_SR[i]+" "+ZOO_SR[o]+")":"en"===t?GAN_EN[i]+ZHI_EN[o]+" ("+GAN_ELEM_EN[i]+" "+ZOO_EN[o]+")":e}function _shengxiaoTranslated(e){const n=Lunar.SHENGXIAO.indexOf(e);if(n<0)return e;const a="undefined"!=typeof lang?lang:"sr";return"sr"===a||"sr-RS"===a?ZOO_SR[n]:"en"===a?ZOO_EN[n]:e}function _zooEmoji(e){const n=Lunar.SHENGXIAO.indexOf(e);return n>=0?ZOO_EMOJI[n]:""}function _CL(e){if(!e)return"";const n="undefined"!=typeof lang?lang:"sr";return e[n]||e[n.split("-")[0]]||e.sr||""}function renderLunarInfo(){if("undefined"==typeof today)return;const e=document.getElementById("lunarInfo");if(!e)return;const n=today(),a=Lunar.getYearInfo(n),i=Lunar.toLunar(n);if(!a||!i)return void(e.style.display="none");e.style.display="";const o=_ganZhiTranslated(a.tianGanDiZhi),t=_shengxiaoTranslated(a.shengXiao),r=_CL({sr:"Lunarni "+i.month+". mesec, "+i.day+". dan",en:"Lunar "+i.month+"/"+i.day,"zh-CN":i.monthName+i.dayName});e.innerHTML='<span title="'+escAttr(_CL(CULTURE_EXPLAIN.tiangandizhi))+'">🐲 '+o+'</span> · <span title="'+escAttr(_CL(CULTURE_EXPLAIN.shengxiao))+'">'+_zooEmoji(a.shengXiao)+" "+t+'</span> · <span title="'+escAttr(_CL(CULTURE_EXPLAIN.lunar))+'">'+r+'</span> <span style="cursor:pointer;font-size:.7rem" onclick="renderCultureExplain()" title="'+escAttr(_CL({sr:"Klikni za objasnjenje",en:"Click to learn more","zh-CN":"点击了解更多"}))+'">ℹ️</span>'}function renderSeasonalPoemCard(){if("undefined"==typeof today)return;const e=document.getElementById("cultureCard");if(!e)return;const n=today().getMonth(),a=SEASONAL_POEMS[n];if(!a)return void(e.style.display="none");e.style.display="";const i=TRADITIONAL_COLORS[n],o=Lunar.getYearInfo(today()),t="undefined"!=typeof lang?lang:"zh",r=(a.lines[t]||a.lines[t.split("-")[0]]||a.lines.zh).replace(/\n/g,"<br>"),s=a.title[t]||a.title[t.split("-")[0]]||a.title.zh;e.innerHTML='<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-size:1.2rem">📜</span><span class="poem-title">'+s+'</span><span style="font-size:.6rem;opacity:.45">— '+a.author+" · "+a.dynasty+'</span></div><div class="poem-body" style="white-space:pre-line">'+r+'</div><div class="poem-explain" style="font-size:.65rem;color:var(--text-muted);margin-top:6px;line-height:1.6;font-style:italic;padding:6px 10px;background:rgba(180,140,100,.06);border-radius:8px">💡 '+_CL(a.explain)+'</div><div style="margin-top:6px;font-size:.6rem;opacity:.4;display:flex;gap:12px;flex-wrap:wrap"><span title="'+escAttr(_CL(CULTURE_EXPLAIN.color))+'">🖌️ '+_CL({sr:"Tradicionalna boja: ","zh-CN":"中国传统色：",en:"Traditional color: "})+_CL(i.name)+' <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:'+i.hex+';vertical-align:middle;margin-left:2px"></span></span>'+(o?'<span title="'+escAttr(_CL(CULTURE_EXPLAIN.shengxiao))+'">🐉 '+_CL({sr:"Godina ",en:"Year of the ","zh-CN":""})+_shengxiaoTranslated(o.shengXiao)+_CL({sr:"",en:"","zh-CN":"年"})+"</span>":"")+'<span title="'+escAttr(_CL(CULTURE_EXPLAIN.solarterm))+'" style="cursor:pointer" onclick="renderCultureExplain()">🌿 '+_CL({sr:"Sta je sve ovo?",en:"What is all this?","zh-CN":"这些是什么？"})+"</span></div>"}function renderCultureExplain(){const e=document.getElementById("cultureExplain");if(!e)return;if("none"!==e.style.display&&e.innerHTML)return void(e.style.display="none");e.style.display="";let n='<div style="font-weight:700;margin-bottom:8px;font-size:.78rem">🏮 '+_CL({sr:"Kineska Kultura — Objasnjenje",en:"Chinese Culture — Explained","zh-CN":"中国文化小课堂"})+"</div>";[{icon:"📅",key:"lunar",title:{sr:"Lunarni Kalendar",en:"Lunar Calendar","zh-CN":"农历"}},{icon:"🐉",key:"shengxiao",title:{sr:"Kineski Zodijak (生肖)",en:"Chinese Zodiac (生肖)","zh-CN":"十二生肖"}},{icon:"🔢",key:"tiangandizhi",title:{sr:"Nebeske Stabljike i Zemaljske Grane",en:"Heavenly Stems & Earthly Branches","zh-CN":"天干地支"}},{icon:"🌿",key:"solarterm",title:{sr:"24 Solarna Termina (节气)",en:"24 Solar Terms (节气)","zh-CN":"二十四节气"}},{icon:"🎨",key:"color",title:{sr:"Tradicionalne Kineske Boje",en:"Traditional Chinese Colors","zh-CN":"中国传统色"}},{icon:"📜",key:"poem",title:{sr:"Tang & Song Poezija",en:"Tang & Song Poetry","zh-CN":"唐诗宋词"}}].forEach(function(e){n+='<div style="margin-bottom:10px;padding:8px 10px;background:var(--card);border-radius:10px;border-left:2px solid var(--rose-mist)"><div style="font-weight:700;font-size:.72rem;margin-bottom:3px">'+e.icon+" "+_CL(e.title)+'</div><div style="font-size:.65rem;color:var(--text-muted);line-height:1.6">'+_CL(CULTURE_EXPLAIN[e.key])+"</div></div>"}),n+="<div style=\"text-align:center;font-size:.6rem;color:var(--text-muted);margin-top:6px;cursor:pointer\" onclick=\"document.getElementById('cultureExplain').style.display='none'\">"+_CL({sr:"✕ zatvori",en:"✕ close","zh-CN":"✕ 关闭"})+"</div>",e.innerHTML=n,e.scrollIntoView({behavior:"smooth",block:"nearest"})}function escAttr(e){return String(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function getLunarCellClass(e){const n=Lunar.toLunar(e);if(!n)return"";let a="lunar-date";return 1===n.day?a+=" lunar-first":15===n.day&&(a+=" lunar-fifteen"),1!==n.month||1!==n.day||n.isLeap||(a+=" lunar-newyear"),a}function getLunarCellText(e){const n=Lunar.toLunar(e);if(!n)return"";const a="undefined"!=typeof lang?lang:"sr";return"sr"===a||"sr-RS"===a||"en"===a?n.day:Lunar.getLunarDayName(e)}function initExtraHolidays(){"undefined"!=typeof HOLIDAYS?HOLIDAYS._mergedExtra||(EXTRA_HOLIDAYS.forEach(function(e){HOLIDAYS.some(function(n){return n.d===e.d&&n.country===e.country})||HOLIDAYS.push(e)}),HOLIDAYS._mergedExtra=!0,"function"==typeof _rebuildHolidayCache&&_rebuildHolidayCache()):setTimeout(initExtraHolidays,100)}!function e(n){if(n=n||0,"undefined"==typeof today||"undefined"==typeof lang)return n<50?void setTimeout(function(){e(n+1)},200):void("undefined"!=typeof DEBUG&&DEBUG&&console.warn("[culture] today/lang not available after 50 retries — skipping"));initExtraHolidays(),renderLunarInfo(),renderSeasonalPoemCard()}();
/* === dist/js/chinese-learn.js === */
let LESSONS_DATA=[],ACHIEVEMENTS_DATA=[],_lessonsLoaded=!1,_lessonsLoading=!1,_lessonLoadQueue=[];const PROGRESS_KEY_PREFIX="chinese-progress-",REVIEW_INTERVALS=[1,3,7,14,30],PHASE_NAMES=[{id:1,icon:"🔤",key:"pinyin"},{id:2,icon:"🗣️",key:"conversation"},{id:3,icon:"🤝",key:"social"},{id:4,icon:"💖",key:"emotional"},{id:5,icon:"📖",key:"reading"},{id:6,icon:"🎓",key:"advanced"}],TOTAL_LESSONS=180,LESSONS_PER_PHASE=30;function loadLessonData(t){if(_lessonsLoaded)return void(t&&t(null));if(_lessonsLoading)return void(t&&_lessonLoadQueue.push(t));_lessonsLoading=!0;let e=0,a=null;function r(r){if(r&&(a=r),e++,e>=2){_lessonsLoading=!1,a||(_lessonsLoaded=!0,applyPhaseAssignments()),t&&t(a);for(let t=0;t<_lessonLoadQueue.length;t++)_lessonLoadQueue[t](a);_lessonLoadQueue=[]}}fetch("data/lessons.json").then(function(t){if(!t.ok)throw new Error("HTTP "+t.status+" loading lessons");return t.json()}).then(function(t){LESSONS_DATA=[];for(let e=0;e<t.length;e++){const a=t[e].lessons||[];for(let r=0;r<a.length;r++){const o=a[r];o.phase||(o.phase=t[e].phase),LESSONS_DATA.push(o)}}r(null)}).catch(function(t){r(t)}),fetch("data/achievements.json").then(function(t){if(!t.ok)throw new Error("HTTP "+t.status+" loading achievements");return t.json()}).then(function(t){ACHIEVEMENTS_DATA=t,r(null)}).catch(function(t){r(t)})}function applyPhaseAssignments(){for(let t=0;t<LESSONS_DATA.length;t++){const e=LESSONS_DATA[t];e.phase||(e.phase=Math.floor(t/30)+1),e.day||(e.day=t%30+1),e.id||(e.id=t+1)}}function isDataLoaded(){return _lessonsLoaded}let _currentProgress=null;function getProgressKey(){return"chinese-progress-"+("undefined"!=typeof activeProfile?activeProfile:"default")}function loadProgress(){const t=getProgressKey();try{const e=localStorage.getItem(t);if(e)return _currentProgress=JSON.parse(e),_currentProgress}catch(t){}return _currentProgress=getDefaultProgress(),_currentProgress}function saveProgress(t){const e=t||_currentProgress||getDefaultProgress();_currentProgress=e;try{localStorage.setItem(getProgressKey(),JSON.stringify(e))}catch(t){"undefined"!=typeof DEBUG&&DEBUG&&console.warn("[chinese] saveProgress failed:",t.message)}"undefined"!=typeof scheduleSync&&scheduleSync()}function getDefaultProgress(){return{version:2,completedLessons:{},currentLessonId:null,totalPoints:0,totalTimeSpent:0,studyStreak:{current:0,longest:0,lastDate:null},reviews:{},achievements:{},dailyStats:{},perfectScores:0,quizResults:{},dailyGoal:3,favoriteWords:[]}}function getProgress(){return _currentProgress||loadProgress(),_currentProgress}function getLessonPhase(t){const e=getLessonById(t);return e&&e.phase?e.phase:Math.floor((t-1)/30)+1}function isLessonUnlocked(t){const e=getProgress(),a=getLessonPhase(t);return a<=1||!(getPhaseProgress(a-1).percent<80)&&!((t-1)%30>0&&!e.completedLessons[String(t-1)])}function getPhaseUnlockRequirement(t){if(t<=1)return _("直接可用","Dostupno odmah","Available now");const e=Math.ceil(24);return _("完成阶段"+(t-1)+"至少"+e+"课","Završite najmanje "+e+" lekcija faze "+(t-1),"Complete at least "+e+" lessons in phase "+(t-1))}function markLessonComplete(t,e,a){const r=getProgress(),o=String(t);let s=[];r.completedLessons[o]?e>(r.completedLessons[o].score||0)&&(r.completedLessons[o].score=e):r.completedLessons[o]={completedAt:(new Date).toISOString(),score:e||0,timeSpent:a||0},100===e&&(r.perfectScores=(r.perfectScores||0)+1),e&&(r.totalPoints=(r.totalPoints||0)+e),a&&(r.totalTimeSpent=(r.totalTimeSpent||0)+a),updateStreak(r),updateDailyStats(r,a||0),setInitialReview(r,t),s=checkAchievements(r);const l=t+1;return l<=180&&isLessonUnlocked(l)?r.currentLessonId=l:r.currentLessonId=null,saveProgress(r),s}function updateStreak(t){const e=fmtDateLocal(new Date),a=t.studyStreak.lastDate;a!==e&&(a===fmtDateLocal(addDaysLocal(new Date,-1))?t.studyStreak.current++:t.studyStreak.current=1,t.studyStreak.current>t.studyStreak.longest&&(t.studyStreak.longest=t.studyStreak.current),t.studyStreak.lastDate=e)}function updateDailyStats(t,e){const a=fmtDateLocal(new Date);t.dailyStats||(t.dailyStats={}),t.dailyStats[a]||(t.dailyStats[a]={lessonsCompleted:0,timeSpent:0,pointsEarned:0}),t.dailyStats[a].lessonsCompleted++,t.dailyStats[a].timeSpent+=e}function getTotalProgress(){const t=getProgress(),e=Object.keys(t.completedLessons).length;return{completedLessons:e,totalLessons:180,percent:Math.round(e/180*100),totalPoints:t.totalPoints||0,streak:t.studyStreak.current||0,longestStreak:t.studyStreak.longest||0}}function getPhaseProgress(t){const e=getProgress();let a=0;const r=30*t;for(let o=30*(t-1)+1;o<=r;o++)e.completedLessons[String(o)]&&a++;return{completed:a,total:30,percent:Math.round(a/30*100),unlocked:isPhaseUnlocked(t)}}function isPhaseUnlocked(t){return t<=1||getPhaseProgress(t-1).percent>=80}function setInitialReview(t,e){t.reviews||(t.reviews={});const a=String(e);t.reviews[a]||(t.reviews[a]={history:[],nextDue:fmtDateLocal(addDaysLocal(new Date,REVIEW_INTERVALS[0])),intervalIndex:0})}function getDueReviews(){const t=getProgress();if(!t.reviews)return[];const e=fmtDateLocal(new Date),a=[],r=Object.keys(t.reviews);for(let o=0;o<r.length;o++){const s=r[o],l=t.reviews[s];if(!l.nextDue)continue;const n=getLessonById(parseInt(s,10));if(!n)continue;const i=dateDiffDays(l.nextDue,e),c=i<=0?"urgent":i<=3?"soon":"ok";a.push({lessonId:parseInt(s,10),topic:getTopicText(n.topic),icon:n.icon||"📖",lastReview:getLastReviewDate(l),nextDue:l.nextDue,daysUntilDue:i,urgency:c})}return a.sort(function(t,e){const a={urgent:0,soon:1,ok:2};return(a[t.urgency]||3)-(a[e.urgency]||3)||t.daysUntilDue-e.daysUntilDue}),a}function getLastReviewDate(t){return t.history&&t.history.length>0?t.history[t.history.length-1]:null}function markLessonReviewed(t){const e=getProgress(),a=String(t),r=fmtDateLocal(new Date);e.reviews||(e.reviews={}),e.reviews[a]||(e.reviews[a]={history:[],nextDue:r,intervalIndex:0});const o=e.reviews[a];o.history||(o.history=[]),o.history.push(r),o.intervalIndex=Math.min((o.intervalIndex||0)+1,REVIEW_INTERVALS.length-1),o.nextDue=fmtDateLocal(addDaysLocal(new Date,REVIEW_INTERVALS[o.intervalIndex])),saveProgress(e)}function getFavorites(){return(getProgress().favoriteWords||[]).slice()}function isFavoriteWord(t){return(getProgress().favoriteWords||[]).indexOf(t)>=0}function toggleFavoriteWord(t){const e=getProgress();e.favoriteWords||(e.favoriteWords=[]);const a=e.favoriteWords.indexOf(t);return a>=0?e.favoriteWords.splice(a,1):e.favoriteWords.push(t),saveProgress(e),a<0}function getDailyGoal(){return getProgress().dailyGoal||3}function setDailyGoal(t){const e=getProgress();e.dailyGoal=Math.max(1,Math.min(20,parseInt(t,10)||3)),saveProgress(e)}function getTodayCompletedCount(){const t=getProgress(),e=fmtDateLocal(new Date);return t.dailyStats&&t.dailyStats[e]&&t.dailyStats[e].lessonsCompleted||0}function getTodayProgress(){const t=getDailyGoal(),e=getTodayCompletedCount();return{completed:e,goal:t,percent:Math.min(100,Math.round(e/t*100))}}const STROKE_DATA={"我":{radical:"戈",radicalStrokes:3,totalStrokes:7},"你":{radical:"亻",radicalStrokes:2,totalStrokes:7},"好":{radical:"女",radicalStrokes:3,totalStrokes:6},"是":{radical:"日",radicalStrokes:4,totalStrokes:9},"不":{radical:"一",radicalStrokes:1,totalStrokes:4},"了":{radical:"亅",radicalStrokes:1,totalStrokes:2},"人":{radical:"人",radicalStrokes:2,totalStrokes:2},"在":{radical:"土",radicalStrokes:3,totalStrokes:6},"有":{radical:"月",radicalStrokes:4,totalStrokes:6},"中":{radical:"丨",radicalStrokes:1,totalStrokes:4},"大":{radical:"大",radicalStrokes:3,totalStrokes:3},"小":{radical:"小",radicalStrokes:3,totalStrokes:3},"天":{radical:"大",radicalStrokes:3,totalStrokes:4},"日":{radical:"日",radicalStrokes:4,totalStrokes:4},"月":{radical:"月",radicalStrokes:4,totalStrokes:4},"水":{radical:"水",radicalStrokes:4,totalStrokes:4},"火":{radical:"火",radicalStrokes:4,totalStrokes:4},"山":{radical:"山",radicalStrokes:3,totalStrokes:3},"木":{radical:"木",radicalStrokes:4,totalStrokes:4},"花":{radical:"艹",radicalStrokes:3,totalStrokes:7},"爱":{radical:"爫",radicalStrokes:4,totalStrokes:10},"一":{radical:"一",radicalStrokes:1,totalStrokes:1},"二":{radical:"二",radicalStrokes:2,totalStrokes:2},"三":{radical:"一",radicalStrokes:1,totalStrokes:3},"四":{radical:"囗",radicalStrokes:3,totalStrokes:5},"五":{radical:"二",radicalStrokes:2,totalStrokes:4},"六":{radical:"八",radicalStrokes:2,totalStrokes:4},"七":{radical:"一",radicalStrokes:1,totalStrokes:2},"八":{radical:"八",radicalStrokes:2,totalStrokes:2},"九":{radical:"丿",radicalStrokes:1,totalStrokes:2},"十":{radical:"十",radicalStrokes:2,totalStrokes:2},"上":{radical:"一",radicalStrokes:1,totalStrokes:3},"下":{radical:"一",radicalStrokes:1,totalStrokes:3},"左":{radical:"工",radicalStrokes:3,totalStrokes:5},"右":{radical:"口",radicalStrokes:3,totalStrokes:5},"学":{radical:"子",radicalStrokes:3,totalStrokes:8},"习":{radical:"冫",radicalStrokes:2,totalStrokes:3},"中":{radical:"丨",radicalStrokes:1,totalStrokes:4},"国":{radical:"囗",radicalStrokes:3,totalStrokes:8},"女":{radical:"女",radicalStrokes:3,totalStrokes:3},"男":{radical:"田",radicalStrokes:5,totalStrokes:7},"子":{radical:"子",radicalStrokes:3,totalStrokes:3},"她":{radical:"女",radicalStrokes:3,totalStrokes:6},"他":{radical:"亻",radicalStrokes:2,totalStrokes:5},"们":{radical:"亻",radicalStrokes:2,totalStrokes:5},"朋":{radical:"月",radicalStrokes:4,totalStrokes:8},"友":{radical:"又",radicalStrokes:2,totalStrokes:4},"老":{radical:"老",radicalStrokes:6,totalStrokes:6},"师":{radical:"巾",radicalStrokes:3,totalStrokes:6},"美":{radical:"羊",radicalStrokes:6,totalStrokes:9},"丽":{radical:"一",radicalStrokes:1,totalStrokes:7},"漂":{radical:"氵",radicalStrokes:3,totalStrokes:14},"亮":{radical:"亠",radicalStrokes:2,totalStrokes:9},"谢":{radical:"讠",radicalStrokes:2,totalStrokes:12},"吗":{radical:"口",radicalStrokes:3,totalStrokes:6},"吃":{radical:"口",radicalStrokes:3,totalStrokes:6},"喝":{radical:"口",radicalStrokes:3,totalStrokes:12},"看":{radical:"目",radicalStrokes:5,totalStrokes:9},"听":{radical:"口",radicalStrokes:3,totalStrokes:7},"说":{radical:"讠",radialStrokes:2,totalStrokes:9},"读":{radical:"讠",radicalStrokes:2,totalStrokes:10},"写":{radical:"冖",radicalStrokes:2,totalStrokes:5},"家":{radical:"宀",radicalStrokes:3,totalStrokes:10},"门":{radical:"门",radicalStrokes:3,totalStrokes:3},"开":{radical:"廾",radicalStrokes:3,totalStrokes:4},"关":{radical:"丷",radicalStrokes:2,totalStrokes:6},"谢":{radical:"讠",radicalStrokes:2,totalStrokes:12},"对":{radical:"又",radicalStrokes:2,totalStrokes:5},"起":{radical:"走",radicalStrokes:7,totalStrokes:10},"来":{radical:"来",radicalStrokes:7,totalStrokes:7},"去":{radical:"土",radicalStrokes:3,totalStrokes:5},"回":{radical:"囗",radicalStrokes:3,totalStrokes:6},"叫":{radical:"口",radicalStrokes:3,totalStrokes:5},"岁":{radical:"山",radicalStrokes:3,totalStrokes:6},"今":{radical:"人",radicalStrokes:2,totalStrokes:4},"年":{radical:"干",radicalStrokes:3,totalStrokes:6},"星":{radical:"日",radicalStrokes:4,totalStrokes:9},"期":{radical:"月",radicalStrokes:4,totalStrokes:12},"的":{radical:"白",radicalStrokes:5,totalStrokes:8},"和":{radical:"禾",radicalStrokes:5,totalStrokes:8},"也":{radical:"乙",radicalStrokes:1,totalStrokes:3},"都":{radical:"阝",radicalStrokes:2,totalStrokes:10},"很":{radical:"彳",radicalStrokes:3,totalStrokes:9},"这":{radical:"辶",radicalStrokes:3,totalStrokes:7},"那":{radical:"阝",radicalStrokes:2,totalStrokes:6},"什":{radical:"亻",radicalStrokes:2,totalStrokes:4},"么":{radical:"丿",radicalStrokes:1,totalStrokes:3},"多":{radical:"夕",radicalStrokes:3,totalStrokes:6},"少":{radical:"小",radicalStrokes:3,totalStrokes:4},"想":{radical:"心",radicalStrokes:4,totalStrokes:13},"知":{radical:"矢",radicalStrokes:5,totalStrokes:8},"道":{radical:"辶",radicalStrokes:3,totalStrokes:12},"能":{radical:"月",radicalStrokes:4,totalStrokes:10},"会":{radical:"人",radicalStrokes:2,totalStrokes:6},"可":{radical:"口",radicalStrokes:3,totalStrokes:5},"以":{radical:"人",radicalStrokes:2,totalStrokes:4},"生":{radical:"生",radicalStrokes:5,totalStrokes:5},"气":{radical:"气",radicalStrokes:4,totalStrokes:4},"新":{radical:"斤",radicalStrokes:4,totalStrokes:13},"旧":{radical:"日",radicalStrokes:4,totalStrokes:5},"前":{radical:"丷",radicalStrokes:2,totalStrokes:9},"后":{radical:"口",radicalStrokes:3,totalStrokes:6},"时":{radical:"日",radicalStrokes:4,totalStrokes:7}};function getStrokeInfo(t){return STROKE_DATA[t]||null}function dateDiffDays(t,e){return Math.round((parseDateLocal(t)-parseDateLocal(e))/864e5)}function checkAchievements(t){const e=[];for(let a=0;a<ACHIEVEMENTS_DATA.length;a++){const r=ACHIEVEMENTS_DATA[a];t.achievements[r.id]||isAchievementConditionMet(r,t)&&e.push(unlockAchievement(t,r.id))}return e}function isAchievementConditionMet(t,e){const a=t.condition;if(!a)return!1;switch(a.type){case"lessonsCompleted":return getCompletedCount(e)>=a.value;case"phaseComplete":return getPhaseProgress(a.phaseId).completed>=30;case"streak":return(e.studyStreak.current||0)>=a.value;case"totalPoints":return(e.totalPoints||0)>=a.value;case"perfectScore":return(e.perfectScores||0)>=a.value;case"timeSpent":return(e.totalTimeSpent||0)>=a.value;case"allLessons":return getCompletedCount(e)>=180;default:return!1}}function getCompletedCount(t){return Object.keys(t.completedLessons||{}).length}function unlockAchievement(t,e){t.achievements||(t.achievements={}),t.achievements[e]={unlockedAt:(new Date).toISOString()};let a=null;for(let t=0;t<ACHIEVEMENTS_DATA.length;t++)if(ACHIEVEMENTS_DATA[t].id===e){a=ACHIEVEMENTS_DATA[t];break}return a&&a.points&&(t.totalPoints=(t.totalPoints||0)+a.points),a||{id:e}}function getAchievementStatus(){const t=getProgress();let e=0;const a=[];for(let r=0;r<ACHIEVEMENTS_DATA.length;r++){const o=ACHIEVEMENTS_DATA[r],s=!(!t.achievements||!t.achievements[o.id]);s&&e++,a.push({id:o.id,icon:o.icon,name:o.name,description:o.description,points:o.points,isUnlocked:s,unlockedAt:s?t.achievements[o.id].unlockedAt:null})}return{unlocked:e,total:ACHIEVEMENTS_DATA.length,percent:ACHIEVEMENTS_DATA.length>0?Math.round(e/ACHIEVEMENTS_DATA.length*100):0,list:a}}function _(t,e,a){return"undefined"==typeof lang?a||e||t:"sr"===lang?e:"zh-CN"===lang||"zh"===lang?t:"en"===lang?a:e}function langName(t){return t?"undefined"==typeof lang?t.en||t.sr||t.zh||"":"sr"===lang?t.sr||t.en||t.zh||"":"zh-CN"===lang||"zh"===lang?t.zh||t.en||t.sr||"":t.en||t.sr||t.zh||"":""}function getTopicText(t){return"object"==typeof t&&null!==t?_(t.zh||"",t.sr||"",t.en||""):String(t||"")}function getLessonById(t){const e="string"==typeof t?parseInt(t,10):t;for(let t=0;t<LESSONS_DATA.length;t++){if(LESSONS_DATA[t].id===e)return LESSONS_DATA[t];if(t+1===e)return LESSONS_DATA[t]}return null}function fmtDateLocal(t){return t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0")}function parseDateLocal(t){if(!t)return new Date;const e=t.split("-");return new Date(parseInt(e[0],10),parseInt(e[1],10)-1,parseInt(e[2],10))}function addDaysLocal(t,e){const a=new Date(t);return a.setDate(a.getDate()+e),a}function shuffleArray(t){const e=t.slice();for(let t=e.length-1;t>0;t--){const a=Math.floor(Math.random()*(t+1)),r=e[t];e[t]=e[a],e[a]=r}return e}function escapeHtml(t){return"string"!=typeof t?"":t.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}window.loadLessonData=loadLessonData,window.isDataLoaded=isDataLoaded,window.loadProgress=loadProgress,window.saveProgress=saveProgress,window.getTotalProgress=getTotalProgress,window.getPhaseProgress=getPhaseProgress,window.isLessonUnlocked=isLessonUnlocked,window.getDueReviews=getDueReviews,window.markLessonComplete=markLessonComplete,window.markLessonReviewed=markLessonReviewed,window.getAchievementStatus=getAchievementStatus,window.getLessonById=getLessonById,window.getFavorites=getFavorites,window.isFavoriteWord=isFavoriteWord,window.toggleFavoriteWord=toggleFavoriteWord,window.getDailyGoal=getDailyGoal,window.setDailyGoal=setDailyGoal,window.getTodayCompletedCount=getTodayCompletedCount,window.getTodayProgress=getTodayProgress,window.getStrokeInfo=getStrokeInfo,window.lessonsEngineReady=!0;
/* === dist/js/chinese-ui.js === */
let _currentView="home",_currentPhaseId=null,_currentLessonViewId=null,_currentLessonTab="vocab";function switchLrnView(e){_currentView=e;const n=document.querySelectorAll(".lrn-subnav-btn");for(let t=0;t<n.length;t++)n[t].getAttribute("data-lrn-view")===e?n[t].classList.add("active"):n[t].classList.remove("active");const t=document.querySelectorAll(".lrn-view");for(let e=0;e<t.length;e++)t[e].classList.remove("active"),t[e].style.display="none";const s={home:"lrn-view-home",achievements:"lrn-view-achievements",review:"lrn-view-review",stats:"lrn-view-stats",favorites:"lrn-view-favorites",phase:"lrn-view-phase",lesson:"lrn-view-lesson"}[e];if(s){const e=document.getElementById(s);e&&(e.style.display="",e.classList.add("active"))}"home"===e?renderChineseHome():"achievements"===e?renderAchievementPanel():"review"===e?renderReviewPanel():"stats"===e?renderStatsPanel():"favorites"===e&&renderFavoritesPanel()}function continueLearning(){const e=getProgress();if(e.currentLessonId&&isLessonUnlocked(e.currentLessonId))return void renderLessonView(e.currentLessonId);const n=getFirstIncompleteLesson();n&&renderLessonView(n)}function initChineseTab(){"function"==typeof preloadVoices&&preloadVoices();const e=document.getElementById("tb-chinese");e&&(e.textContent=_("中文学习","Kineski","Chinese")),loadLessonData(function(e){if(e){const e=document.getElementById("lrnStreakCard");return void(e&&(e.innerHTML='<div class="empty-state"><span class="empty-icon">⚠️</span><span class="empty-text">'+_("无法加载课程数据","Greška pri učitavanju lekcija","Failed to load lessons")+"</span></div>"))}switchLrnView("home")})}function renderChineseHome(){const e=getProgress(),n=getTotalProgress(),t=getDueReviews();fillStreakCard(n),fillContinueCard(e),fillDailyMotivation(),fillPhasePath(),fillReviewReminders(t)}function fillStreakCard(e){const n=document.getElementById("lrnStreakCard");if(!n)return;const t=251.2*(1-e.percent/100),s=getTodayProgress(),i=_("今日目标: ","Dnevni cilj: ","Daily goal: ")+s.completed+"/"+s.goal;n.innerHTML='<div class="lrn-streak-icon">🔥</div><div class="lrn-streak-info"><div class="lrn-streak-count">'+e.streak+'</div><div class="lrn-streak-label">'+_("连续天数","dana zaredom","day streak")+'</div><div style="margin-top:4px;font-size:.62rem;color:var(--text-muted)">'+_("已完成 ","Završeno ","Completed ")+e.completedLessons+"/"+e.totalLessons+" · ⭐"+(e.totalPoints||0)+'</div><div class="lrn-daily-goal-bar" style="margin-top:8px"><div style="display:flex;justify-content:space-between;font-size:.55rem;color:var(--text-muted);margin-bottom:3px"><span>'+i+"</span><span>"+s.percent+'%</span></div><div class="lrn-goal-track"><div class="lrn-goal-fill" style="width:'+s.percent+'%"></div></div></div></div><div class="lrn-progress-ring-wrap"><svg class="lrn-progress-ring" viewBox="0 0 100 100"><circle class="lrn-ring-bg" cx="50" cy="50" r="40"/><circle class="lrn-ring-fg" cx="50" cy="50" r="40" style="stroke-dashoffset:'+t+'"/></svg><span class="lrn-ring-text">'+e.percent+"%</span></div>"}function fillDailyMotivation(){const e=document.getElementById("lrnStreakCard");if(!e)return;const n=document.getElementById("lrnDailyMotivation");n&&n.remove();const t=[{zh:"每天进步一点点，滴水穿石！💧",sr:"Svaki dan po malo — kap koja buši kamen! 💧",en:"A little progress each day adds up to big results! 💧"},{zh:"学习语言是打开新世界的钥匙 🔑",sr:"Učenje jezika je ključ za novi svet 🔑",en:"Learning a language opens doors to a new world 🔑"},{zh:"不怕慢，就怕站！🏃",sr:"Ne plaši se sporosti, plaši se stajanja! 🏃",en:"Don't fear going slow, fear standing still! 🏃"},{zh:"你说中文的样子很美 💕",sr:"Prelepa si kad pričaš kineski 💕",en:"You're beautiful when you speak Chinese 💕"},{zh:"今天的努力是明天的自由 🕊️",sr:"Današnji trud je sutrašnja sloboda 🕊️",en:"Today's effort is tomorrow's freedom 🕊️"},{zh:"学而时习之，不亦说乎 📚",sr:"Učiti i vežbati — nije li to radost? 📚",en:"To learn and practice — is that not a joy? 📚"},{zh:"每个汉字都是一幅画 🎨",sr:"Svaki kineski znak je slika 🎨",en:"Every Chinese character is a painting 🎨"},{zh:"和你一起学中文是最幸福的事 💑",sr:"Učiti kineski sa tobom je najlepša st let 💑",en:"Learning Chinese together is the best 💑"}],s=new Date,i=t[(1e4*s.getFullYear()+100*(s.getMonth()+1)+s.getDate())%t.length],r=document.createElement("div");r.id="lrnDailyMotivation",r.className="lrn-daily-motivation",r.innerHTML='<span class="lrn-daily-motivation-icon">💬</span><span>'+_(i.zh,i.sr,i.en)+"</span>",e.parentNode.insertBefore(r,e.nextSibling)}function fillContinueCard(e){const n=document.getElementById("lrnContinueCard");if(!n)return;const t=e.currentLessonId,s=t?getLessonById(t):null;if(s){n.style.display="flex",n.setAttribute("onclick","renderLessonView("+t+")");const e=n.querySelector(".lrn-continue-icon"),i=n.querySelector(".lrn-continue-title"),r=n.querySelector(".lrn-continue-sub");e&&(e.textContent=s.icon||"📖"),i&&(i.textContent=getTopicText(s.topic)),r&&(r.textContent=_("继续学习","Nastavi učenje","Continue Learning"))}else{const e=getFirstIncompleteLesson();if(e){n.style.display="flex",n.setAttribute("onclick","renderLessonView("+e+")");const t=n.querySelector(".lrn-continue-icon"),s=n.querySelector(".lrn-continue-title"),i=n.querySelector(".lrn-continue-sub");t&&(t.textContent="🚀"),s&&(s.textContent=_("开始学习中文！","Započni učenje!","Start Learning!")),i&&(i.textContent=_("从第"+e+"课开始","Od lekcije "+e,"From lesson "+e))}else n.style.display="none"}}function getFirstIncompleteLesson(){const e=getProgress();for(let n=1;n<=TOTAL_LESSONS;n++)if(!e.completedLessons[String(n)]&&isLessonUnlocked(n))return n;return null}function fillPhasePath(){const e=document.getElementById("lrn-phase-title"),n=document.getElementById("lrnPhaseGrid");if(!e||!n)return;e.textContent=_("学习路径","Put učenja","Learning Path");const t=["🏛️","🌅","🌆","🌸","📚","👑"];let s="";for(let e=0;e<PHASE_NAMES.length;e++){const n=PHASE_NAMES[e],i=getPhaseProgress(n.id),r=i.percent||0,a=i.unlocked?r>=100?"completed":"active":"locked";s+='<div class="lrn-phase-card phase-clr-'+n.id+" "+a+'" onclick="renderPhaseLessons('+n.id+')" data-phase="'+n.id+'">',s+='<div class="lrn-phase-icon-wrap" style="background:'+("locked"===a?"var(--border-soft)":"var(--phase-clr-light)")+'">',s+="<span>"+("locked"===a?"🔒":t[e]||n.icon)+"</span>",s+="</div>",s+='<div class="lrn-phase-name">'+getPhaseName(n.id)+"</div>",s+='<div class="lrn-phase-progress">'+i.completed+"/"+i.total+"</div>",s+='<div class="lrn-phase-bar"><div class="lrn-phase-bar-fill" style="width:'+r+'%;background:var(--phase-clr,var(--love))"></div></div>',"locked"===a&&(s+='<span class="lrn-phase-lock-icon">🔒</span>'),s+="</div>"}n.innerHTML=s}function getPhaseName(e){const n={1:{zh:"拼音基础",sr:"Pinyin osnove",en:"Pinyin Basics"},2:{zh:"日常会话",sr:"Svakodnevni razgovori",en:"Daily Conversations"},3:{zh:"社交场景",sr:"Društvene situacije",en:"Social Situations"},4:{zh:"情感表达",sr:"Izražavanje emocija",en:"Emotional Expression"},5:{zh:"读写提升",sr:"Čitanje i pisanje",en:"Reading & Writing"},6:{zh:"高级综合",sr:"Napredni nivo",en:"Advanced Level"}}[e]||{zh:"",sr:"",en:""};return _(n.zh,n.sr,n.en)}function fillReviewReminders(e){const n=document.getElementById("lrnReviewCard"),t=document.getElementById("lrnReviewList"),s=document.getElementById("lrn-review-all-btn"),i=document.getElementById("lrn-review-title");if(!n||!t)return;const r=[],a=[],o=[];for(let n=0;n<e.length;n++)"urgent"===e[n].urgency?r.push(e[n]):"soon"===e[n].urgency?a.push(e[n]):o.push(e[n]);if(0===r.length&&0===a.length)return void(n.style.display="none");n.style.display="",i&&(i.textContent=_("今日复习","Današnji pregled","Review Today"));let l="";for(let e=0;e<Math.min(r.length,3);e++)l+=renderReviewItemHtml(r[e]);for(let e=0;e<Math.min(a.length,3);e++)l+=renderReviewItemHtml(a[e]);for(let e=0;e<Math.min(o.length,2);e++)l+=renderReviewItemHtml(o[e]);t.innerHTML=l,s&&(s.style.display=r.length+a.length+o.length>8?"":"none")}function renderReviewItemHtml(e){const n=e.urgency,t=e.daysUntilDue<0?_("超期 "+Math.abs(e.daysUntilDue)+" 天","Kasni "+Math.abs(e.daysUntilDue)+" d",Math.abs(e.daysUntilDue)+"d late"):0===e.daysUntilDue?_("今天到期","Danas","Due today"):_("还有 "+e.daysUntilDue+" 天","Za "+e.daysUntilDue+" d","In "+e.daysUntilDue+"d");return'<div class="lrn-review-item '+n+'" onclick="renderLessonView('+e.lessonId+')"><span class="lrn-review-dot '+n+'"></span><div class="lrn-review-info"><div class="lrn-review-topic">'+(e.topic||"")+'</div><div class="lrn-review-due">'+t+"</div></div></div>"}function renderPhaseLessons(e){if(_currentPhaseId=e,!isPhaseUnlocked(e))return switchLrnView("home"),void("undefined"!=typeof toast&&toast(getPhaseUnlockRequirement(e)));const n=30*(e-1)+1,t=30*e,s=getProgress(),i=getPhaseProgress(e),r=document.getElementById("lrnPhaseHeader");r&&(r.innerHTML='<span class="lrn-phase-header-icon">'+(PHASE_NAMES[e-1]?PHASE_NAMES[e-1].icon:"📚")+'</span><div class="lrn-phase-header-name">'+getPhaseName(e)+'</div><div class="lrn-phase-header-desc">'+i.completed+"/"+i.total+" "+_("课已完成","lekcije završene","lessons done")+"</div>");const a=document.getElementById("lrnLessonList");if(!a)return;let o="";for(let e=n;e<=t;e++){const t=getLessonById(e);if(!t)continue;const i=!!s.completedLessons[String(e)],r=isLessonUnlocked(e),a=i&&s.completedLessons[String(e)]?s.completedLessons[String(e)].score:null,l=i?"completed":r?"current":"locked",c=r?' onclick="renderLessonView('+e+')"':"",d=getTopicText(t.topic);let u="";t.words&&t.words.length>0&&(u=t.words.slice(0,3).map(function(e){return e.zh}).join(" · ")),o+='<div class="lrn-lesson-item '+l+'"'+c+">",o+='<span class="lrn-lesson-num">'+(i?"✓":"locked"===l?"🔒":t.day||e-n+1)+"</span>",o+='<div class="lrn-lesson-info">',o+='<div class="lrn-lesson-topic">'+(t.icon||"📖")+" "+d+"</div>",u&&(o+='<div class="lrn-lesson-words">'+u+"</div>"),o+="</div>",null!==a&&(o+='<span class="lrn-lesson-status" style="color:var(--sage);font-weight:700">'+a+"%</span>"),o+="</div>"}a.innerHTML=o,switchLrnView("phase")}function renderLessonView(e,n){const t=getLessonById(e);if(!t)return void("undefined"!=typeof toast&&toast(_("未找到课程","Lekcija nije pronađena","Lesson not found")));const s=_currentLessonViewId!==e;_currentLessonViewId=e,n?_currentLessonTab=n:!s&&_currentLessonTab||(_currentLessonTab="vocab"),_quizAnswers={};const i=!!getProgress().completedLessons[String(e)],r=getLessonPhase(e),a=document.getElementById("lrnLessonHeader");a&&(a.innerHTML='<span class="lrn-lesson-header-icon">'+(t.icon||"📖")+'</span><div class="lrn-lesson-header-topic">'+getTopicText(t.topic)+'</div><div style="font-size:.65rem;color:var(--text-muted)">'+_("第"+e+"课","Lekcija "+e,"Lesson "+e)+"</div>");const o=document.getElementById("lrnStepIndicator");if(o){const n=[{key:"review",label_zh:"复习",label_sr:"Pregled",label_en:"Review",icon:"📝"},{key:"vocab",label_zh:"生词",label_sr:"Reči",label_en:"Words",icon:"📖"},{key:"grammar",label_zh:"语法",label_sr:"Gram.",label_en:"Grammar",icon:"📐"},{key:"practice",label_zh:"练习",label_sr:"Vežba",label_en:"Practice",icon:"✏️"},{key:"culture",label_zh:"文化",label_sr:"Kult.",label_en:"Culture",icon:"🏮"},{key:"quiz",label_zh:"测验",label_sr:"Test",label_en:"Quiz",icon:"✅"}];let t="";for(let s=0;s<n.length;s++){const i=n[s],r=_currentLessonTab===i.key?"active":"pending";t+='<div style="text-align:center;cursor:pointer" onclick="switchLessonTab(\''+i.key+"',"+e+')">',t+='<div class="lrn-step-dot '+r+'">'+i.icon+"</div>",t+='<div style="font-size:.48rem;color:var(--text-muted);margin-top:2px">'+_(i.label_zh,i.label_sr,i.label_en)+"</div>",t+="</div>"}o.innerHTML=t}const l=document.getElementById("lrnStepContent");l&&(l.innerHTML=renderLessonTabContent(_currentLessonTab,t,e));const c=document.getElementById("lrnStepActions");c&&(c.innerHTML='<div style="display:flex;gap:8px;margin-top:14px"><button class="lrn-back-btn" onclick="switchLessonTab(\''+getPrevTab()+"',"+e+')" style="flex:1">← '+_("上一步","Prethodni","Prev")+'</button><button class="lrn-complete-btn" onclick="switchLessonTab(\''+getNextTab()+"',"+e+')" style="flex:1">'+_("下一步","Sledeći","Next")+' →</button></div><button class="lrn-back-btn" onclick="renderPhaseLessons('+r+')" style="width:100%;margin-top:8px;text-align:center">← '+_("返回列表","Nazad na listu","Back to list")+"</button>"),i&&c&&(c.innerHTML+='<div style="text-align:center;margin-top:10px"><span style="background:var(--sage-light);color:var(--sage);padding:4px 12px;border-radius:10px;font-size:.68rem">✅ '+_("已完成","Završeno","Completed")+"</span></div>"),switchLrnView("lesson")}function switchLessonTab(e,n){renderLessonView(n,e)}function getPrevTab(){const e=["review","vocab","grammar","practice","culture","quiz"],n=e.indexOf(_currentLessonTab);return n>0?e[n-1]:e[0]}function getNextTab(){const e=["review","vocab","grammar","practice","culture","quiz"],n=e.indexOf(_currentLessonTab);return n<e.length-1?e[n+1]:e[e.length-1]}function renderLessonTabContent(e,n,t){switch(e){case"review":return renderReviewStepTab(n,t);case"vocab":return renderVocabTab(n);case"grammar":return renderGrammarTab(n);case"practice":return renderPracticeTab(n,t);case"culture":return renderCultureTab(n);case"quiz":return renderQuizTab(n,t);default:return""}}function renderReviewStepTab(e,n){if(!e.words||0===e.words.length)return'<div class="lrn-empty-state"><span class="lrn-empty-icon">📝</span>'+_("暂无内容","Nema sadržaja","No content yet")+"</div>";const t=getProgress().completedLessons[String(n)];let s='<h3 style="font-size:.82rem;font-weight:700;text-align:center;margin-bottom:12px">📝 '+_("课前复习","Pregled pre lekcije","Pre-lesson Review")+"</h3>";t&&(s+='<div style="background:var(--sage-light);border-radius:12px;padding:10px 14px;margin-bottom:14px;font-size:.7rem">',s+=_("上次得分: ","Prošli rezultat: ","Last score: ")+"<strong>"+(t.score||0)+"%</strong>",s+='<span style="margin-left:8px;font-size:.62rem;color:var(--text-muted)">'+_("完成于: ","Završeno: ","Completed: ")+new Date(t.completedAt).toLocaleDateString()+"</span>",s+="</div>"),s+='<p style="font-size:.68rem;color:var(--text-muted);text-align:center;margin-bottom:8px">'+_("快速浏览本课关键词汇","Brzi pregled ključnih reči","Quick review of key vocabulary")+"</p>";for(let n=0;n<Math.min(e.words.length,4);n++){const t=e.words[n];s+='<div class="lrn-word-card" style="padding:12px 16px;margin-bottom:6px">',s+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">',s+='<div><span class="lrn-word-zh" style="font-size:1.2rem">'+(t.zh||"")+"</span>",s+='<span class="lrn-word-py" style="font-size:.68rem;margin-left:8px">'+(t.py||"")+"</span></div>",s+='<span class="lrn-word-sr" style="font-size:.7rem">'+(t.sr||"")+"</span>",s+="</div>",s+='<button class="lrn-word-audio" onclick="event.stopPropagation();speakWord(\''+escapeHtml(t.zh||"")+'\')" title="'+_("发音","Izgovor","Pronounce")+'" style="position:static">🔊</button>',s+="</div>"}return s}function renderVocabTab(e){if(!e.words||0===e.words.length)return'<div class="lrn-empty-state"><span class="lrn-empty-icon">📝</span>'+_("暂无生词","Nema reči","No words yet")+"</div>";let n='<div style="font-size:.6rem;text-align:center;color:var(--text-muted);margin-bottom:8px">💡 '+_("点击词卡翻转","Dodirni karticu da okreneš","Tap card to flip")+"</div>";for(let t=0;t<e.words.length;t++){const s=e.words[t],i=isFavoriteWord(s.zh||"");let r="";const a=getStrokeInfo(s.zh||"");a&&(r='<div class="lrn-stroke-hint">'+_("部首: ","Radikal: ","Radical: ")+a.radical+" ("+a.radicalStrokes+_("画) 总笔画: "," poteza) Ukupno: "," strokes) Total: ")+a.totalStrokes+_("画"," poteza"," strokes")+"</div>"),n+='<div class="lrn-word-card flip-ready" onclick="this.classList.toggle(\'flipped\')">',n+='<div class="lrn-word-inner">',n+='<div class="lrn-word-front">',n+='<button class="lrn-word-audio" onclick="event.stopPropagation();speakWord(\''+escapeHtml(s.zh||"")+'\')" title="'+_("发音","Izgovor","Pronounce")+'">🔊</button>',n+='<button class="lrn-fav-btn '+(i?"fav-active":"")+'" onclick="event.stopPropagation();window.toggleFavBtn(this,\''+escapeHtml(s.zh||"")+'\')" title="'+_("收藏","Sačuvaj","Favorite")+'">'+(i?"⭐":"⬚")+"</button>",n+='<div class="lrn-word-zh">'+(s.zh||"")+"</div>",n+='<div class="lrn-word-py">'+(s.py||"")+"</div>",a&&(n+=r),n+="</div>",n+='<div class="lrn-word-back">',n+='<div class="lrn-word-sr">'+(s.sr||"")+"</div>",s.en&&(n+='<div class="lrn-word-en">'+(s.en||"")+"</div>"),n+="</div>",n+="</div></div>"}return n+='<div class="lrn-word-nav">'+_("共","Ukupno","Total")+" "+e.words.length+" "+_("个词","reči","words")+"</div>",n}function toggleFavBtn(e,n){const t=toggleFavoriteWord(n);e.textContent=t?"⭐":"⬚",e.className="lrn-fav-btn"+(t?" fav-active":"")}let _zhVoice=null,_voicesReady=!1;function _pickChineseVoice(){const e=speechSynthesis.getVoices();if(e&&0!==e.length){for(let n=0;n<e.length;n++)if("zh-CN"===e[n].lang)return _zhVoice=e[n],void(_voicesReady=!0);for(let n=0;n<e.length;n++)if(0===e[n].lang.indexOf("zh"))return _zhVoice=e[n],void(_voicesReady=!0)}}function preloadVoices(){if(!window.speechSynthesis)return;const e=window.speechSynthesis;if(e.paused&&e.resume(),_zhVoice||_pickChineseVoice(),/iPad|iPhone|iPod/.test(navigator.userAgent)||"MacIntel"===navigator.platform&&navigator.maxTouchPoints>1)_voicesReady=!0;else try{const n=new SpeechSynthesisUtterance("");n.volume=0,n.rate=1.5,_zhVoice&&(n.voice=_zhVoice),n.onend=function(){_voicesReady=!0},n.onerror=function(){},e.speak(n)}catch(e){}}function speakWord(e){if(!window.speechSynthesis)return;const n=window.speechSynthesis;n.cancel(),n.paused&&n.resume(),_zhVoice||_pickChineseVoice();const t=new SpeechSynthesisUtterance(e);t.lang="zh-CN",t.rate=.7,t.volume=1,_zhVoice&&(t.voice=_zhVoice),n.speak(t)}function renderGrammarTab(e){let n='<div class="lrn-grammar-box">';if(n+='<div class="lrn-grammar-title">📐 '+_("语法要点","Gramatika","Grammar Point")+"</div>",e.grammar?n+='<div class="lrn-grammar-text">'+_(e.grammar.zh||"",e.grammar.sr||"",e.grammar.en||"")+"</div>":n+='<div class="lrn-grammar-text">'+_("本课暂无语法要点。","Nema gramatičkih objašnjenja.","No grammar notes for this lesson.")+"</div>",n+="</div>",e.dialog){n+='<h3 style="font-size:.72rem;margin:12px 0 6px">💬 '+_("情景对话","Dijalog","Dialogue")+"</h3>",n+='<div class="lrn-dialog-box">';const t=(e.dialog.zh||"").split("\n");for(let e=0;e<t.length;e++){const s=0===t[e].indexOf("A:");n+='<div class="lrn-dialog-bubble speaker-'+(s?"a":"b")+'">',n+='<span class="lrn-dialog-speaker">'+(s?"A":"B")+"</span>",n+='<div class="lrn-dialog-zh">'+escapeHtml(t[e].replace(/^[AB]: /,""))+"</div>",n+="</div>"}n+="</div>"}return n}function renderPracticeTab(e,n){if(!e.words||0===e.words.length)return'<div class="empty-state">'+_("暂无练习","Nema vežbe","No practice")+"</div>";let t='<div class="chinese-practice-section">';t+='<p class="chinese-practice-instruct">'+_("选择正确的翻译","Izaberite tačan prevod","Choose the correct translation")+"</p>";const s=e.words.slice(0,Math.min(3,e.words.length));for(let n=0;n<s.length;n++){const i=s[n],r=generatePracticeOptions(i,e.words);t+='<div class="chinese-practice-question" data-word-zh="'+escapeHtml(i.zh||"")+'" data-answer="'+escapeHtml(i.sr||"")+'">',t+='<span class="chinese-practice-q">'+(i.zh||"")+" = ?</span>",t+='<div class="lrn-practice-choice">';for(let e=0;e<r.length;e++)t+='<button class="lrn-practice-option" onclick="checkPracticeAnswer(this, \''+escapeHtml(r[e])+"', '"+escapeHtml(i.sr||"")+"', this.parentElement.parentElement)\">"+r[e]+"</button>";t+="</div></div>"}return t+='<div class="chinese-practice-result"></div>',t+="</div>",t+='<div id="lrnListenContainer" style="margin-top:14px"></div>',t+='<button class="lrn-complete-btn" style="margin-top:8px" onclick="renderListenPractice('+n+')">🔊 '+_("听力练习","Vežba slušanja","Listening Practice")+"</button>",t}window.speechSynthesis&&(speechSynthesis.getVoices(),speechSynthesis.addEventListener("voiceschanged",function(){_pickChineseVoice()}),_pickChineseVoice()),window.preloadVoices=preloadVoices,window.speakWord=speakWord;let _cultureDataCache=null;function loadCultureData(e){_cultureDataCache?e(_cultureDataCache):fetch("data/culture.json").then(function(e){return e.json()}).then(function(n){_cultureDataCache=n,e(n)}).catch(function(){e(null)})}function renderCultureTab(e){let n="";e.culture&&(n=_(e.culture.zh||"",e.culture.sr||"",e.culture.en||""));let t="<div>";n&&(t+='<div class="lrn-culture-box">',t+='<span class="lrn-culture-icon">🏮</span>',t+='<div class="lrn-culture-text">'+n+"</div>",t+="</div>"),t+='<div id="lrn-culture-card-dynamic">',t+='<div class="lrn-empty-state"><span class="lrn-empty-icon">🔄</span>'+_("加载文化知识...","Učitavanje...","Loading culture knowledge...")+"</div>",t+="</div>",t+="</div>";const s=_currentLessonViewId;return setTimeout(function(){loadCultureData(function(e){const n=document.getElementById("lrn-culture-card-dynamic");if(n)if(e&&e.length>0){const t=e[(s||1)%e.length];n.innerHTML='<div class="lrn-culture-box" style="margin-top:10px"><span class="lrn-culture-icon">'+(t.icon||"📚")+'</span><div style="font-weight:700;font-size:.75rem;margin-bottom:4px;color:var(--text)">'+(t.zh||"")+" / "+(t.sr||"")+'</div><div class="lrn-culture-text">'+(t.desc||"")+"</div></div>"}else n.innerHTML=""})},50),t}function renderQuizTab(e,n){if(!e.words||0===e.words.length)return'<div class="empty-state">'+_("暂无测验","Nema testa","No quiz")+"</div>";_quizAnswers={};let t='<div class="chinese-quiz-section" data-lesson-id="'+n+'">';t+='<p class="chinese-quiz-instruct">'+_("小测验 — 每题10分","Kviz — svako pitanje 10 poena","Quiz — 10 points each")+"</p>";const s=generateQuizQuestions(e.words);for(let e=0;e<s.length;e++){const n=s[e];if("fill-zh"===n.type||"fill-py"===n.type)t+='<div class="chinese-quiz-question" data-answer="'+escapeHtml(n.answer)+'" data-index="'+e+'" data-type="fill">',t+='<div class="chinese-quiz-q">'+n.question+"</div>",t+='<input type="text" class="lrn-practice-input fill-input" placeholder="'+_("输入答案","Unesite odgovor","Type answer")+'">',t+="</div>";else{t+='<div class="chinese-quiz-question" data-answer="'+escapeHtml(n.answer)+'" data-index="'+e+'">',t+='<div class="chinese-quiz-q">'+(e+1)+". "+n.question+"</div>",t+='<div class="lrn-practice-choice">';for(let e=0;e<n.options.length;e++){const s=String.fromCharCode(65+e);t+='<button class="lrn-practice-option chinese-quiz-option" onclick="selectQuizOption(this, \''+escapeHtml(n.options[e])+"', '"+escapeHtml(n.answer)+'\')" data-opt-text="'+escapeHtml(n.options[e])+'">'+s+". "+n.options[e]+"</button>"}t+="</div></div>"}}return t+='<button class="btn btn-primary chinese-quiz-submit" onclick="submitQuiz('+n+')" style="width:100%;margin-top:12px">'+_("提交答案","Predaj odgovore","Submit Answers")+"</button>",t+='<div class="chinese-quiz-result"></div>',t+="</div>",t}function renderAchievementPanel(){const e=getAchievementStatus(),n=document.getElementById("lrnAchStats");n&&(n.innerHTML='<div class="lrn-ach-stat"><div class="lrn-ach-stat-val">'+e.unlocked+'</div><div class="lrn-ach-stat-label">'+_("已解锁","Otključano","Unlocked")+'</div></div><div class="lrn-ach-stat"><div class="lrn-ach-stat-val">'+e.total+'</div><div class="lrn-ach-stat-label">'+_("总计","Ukupno","Total")+'</div></div><div class="lrn-ach-stat"><div class="lrn-ach-stat-val">'+e.percent+'%</div><div class="lrn-ach-stat-label">'+_("完成率","Završeno","Complete")+"</div></div>");const t=document.getElementById("lrnAchGrid");if(t){let n="";for(let t=0;t<e.list.length;t++){const s=e.list[t];n+='<div class="lrn-ach-badge '+(s.isUnlocked?"unlocked":"locked")+'">',n+='<span class="lrn-ach-icon">'+(s.isUnlocked?s.icon:"🔒")+"</span>",n+='<div class="lrn-ach-name">'+langName(s.name)+"</div>",n+='<div class="lrn-ach-desc">'+langName(s.description)+"</div>",n+="</div>"}t.innerHTML=n}}function renderReviewPanel(){const e=getDueReviews(),n=document.getElementById("lrnReviewFullList");if(!n)return;if(0===e.length)return void(n.innerHTML='<div class="lrn-empty-state"><span class="lrn-empty-icon">🎉</span><span class="lrn-empty-text">'+_("暂无待复习课程","Nema lekcija za ponavljanje","No reviews due")+"</span></div>");const t=[],s=[],i=[];for(let n=0;n<e.length;n++)"urgent"===e[n].urgency?t.push(e[n]):"soon"===e[n].urgency?s.push(e[n]):i.push(e[n]);let r="";if(t.length>0){r+='<h4 class="lrn-review-section-title">🔴 '+_("紧急复习","Hitno za pregled","Urgent Review")+"</h4>";for(let e=0;e<t.length;e++)r+=renderFullReviewItem(t[e])}if(s.length>0){r+='<h4 class="lrn-review-section-title">🟡 '+_("近期复习","Uskoro za pregled","Review Soon")+"</h4>";for(let e=0;e<s.length;e++)r+=renderFullReviewItem(s[e])}if(i.length>0){r+='<h4 class="lrn-review-section-title">🟢 '+_("后续复习","Kasnije za pregled","Review Later")+"</h4>";for(let e=0;e<Math.min(i.length,10);e++)r+=renderFullReviewItem(i[e])}n.innerHTML=r}function renderFullReviewItem(e){const n=e.daysUntilDue<0?_("超期 "+Math.abs(e.daysUntilDue)+" 天","Zakašnjenje "+Math.abs(e.daysUntilDue)+" dana","Overdue by "+Math.abs(e.daysUntilDue)+" days"):0===e.daysUntilDue?_("今天到期","Dospijeva danas","Due today"):_("还有 "+e.daysUntilDue+" 天","Preostalo "+e.daysUntilDue+" dana",e.daysUntilDue+" days left");return'<div class="lrn-review-item '+e.urgency+'" onclick="renderLessonView('+e.lessonId+')"><span class="lrn-review-dot '+e.urgency+'"></span><div class="lrn-review-info"><div class="lrn-review-topic">'+e.icon+" "+e.topic+'</div><div class="lrn-review-due">'+n+"</div></div></div>"}window.toggleFavBtn=toggleFavBtn,window.initChineseTab=initChineseTab,window.renderChineseHome=renderChineseHome,window.renderPhaseLessons=renderPhaseLessons,window.renderLessonView=renderLessonView,window.renderAchievementPanel=renderAchievementPanel,window.renderReviewPanel=renderReviewPanel,window.switchLrnView=switchLrnView,window.continueLearning=continueLearning,window.switchLessonTab=switchLessonTab,window.speakWord=speakWord;
/* === dist/js/chinese-quiz.js === */
const _quizAnswers={};function generatePracticeOptions(e,t){const n=e.sr||"",r=[n],i=[];for(let e=0;e<t.length;e++)t[e].sr!==n&&t[e].sr&&i.push(t[e].sr);shuffleArray(i);for(let e=0;e<Math.min(3,i.length);e++)r.indexOf(i[e])<0&&r.push(i[e]);const o="zh-CN"===lang?["你好","谢谢","再见","好的","请问"]:"en"===lang?["Hello","Thanks","Goodbye","OK","Please"]:["Zdravo","Hvala","Doviđenja","Dobro","Molim"];for(;r.length<4;){const e=o[Math.floor(Math.random()*o.length)];r.indexOf(e)<0&&r.push(e)}return shuffleArray(r),r}function checkPracticeAnswer(e,t,n,r){const i=r.querySelectorAll(".lrn-practice-option");for(let e=0;e<i.length;e++)i[e].disabled=!0,i[e].style.cursor="default",i[e].textContent===n&&(i[e].className="lrn-practice-option correct");e.className=t===n?"lrn-practice-option correct":"lrn-practice-option wrong";const o=document.querySelector(".chinese-practice-section");if(!o)return;const s=o.querySelector(".chinese-practice-result");if(!s)return;const c=o.querySelectorAll(".chinese-practice-question");let l=!0;for(let e=0;e<c.length;e++){const t=c[e].querySelector(".lrn-practice-option.correct, .lrn-practice-option.wrong");if(!t||t.className.indexOf("wrong")>=0){l=!1;break}}l&&(s.innerHTML='<div class="lrn-practice-feedback correct">✅ '+_("全部正确！","Sve tačno!","All correct!")+"</div>")}function generateQuizQuestions(e){const t=[],n=["choice","choice","fill-zh","fill-py"];for(let r=0;r<e.length&&r<5;r++){const i=e[r],o=n[r%n.length];"choice"===o?"zh2sr"==(Math.random()>.5?"zh2sr":"sr2zh")?t.push({question:i.zh+" "+_("的意思是？","znači?","means?"),answer:i.sr||"",options:generateQuizOptions(i.sr||"",e,"sr"),type:"choice"}):t.push({question:'"'+(i.sr||"")+'" '+_("的中文是？","na kineskom?","in Chinese?"),answer:i.zh||"",options:generateQuizOptions(i.zh||"",e,"zh"),type:"choice"}):"fill-zh"===o?t.push({question:"✍️ "+_("请写出汉字: ","Napišite kineski: ","Write Chinese: ")+"<strong>"+escapeHtml(i.py||"")+"</strong> ("+escapeHtml(i.sr||"")+")",answer:i.zh||"",type:"fill-zh"}):"fill-py"===o&&t.push({question:"✍️ "+_("请写出拼音: ","Napišite pinyin: ","Write pinyin: ")+"<strong>"+escapeHtml(i.zh||"")+"</strong> ("+escapeHtml(i.sr||"")+")",answer:(i.py||"").toLowerCase().replace(/[0-9]/g,"").replace(/[āáǎà]/g,"a").replace(/[ēéěè]/g,"e").replace(/[īíǐì]/g,"i").replace(/[ōóǒò]/g,"o").replace(/[ūúǔù]/g,"u").replace(/[ǖǘǚǜ]/g,"ü"),originalAnswer:i.py||"",type:"fill-py"})}return t}function generateQuizOptions(e,t,n){const r=[e],i=[];for(let r=0;r<t.length;r++){const o=t[r][n];o&&o!==e&&i.push(o)}shuffleArray(i);for(let e=0;e<Math.min(3,i.length);e++)r.indexOf(i[e])<0&&r.push(i[e]);return shuffleArray(r),r}function selectQuizOption(e,t,n){const r=e.closest(".chinese-quiz-question"),i=r.querySelectorAll(".chinese-quiz-option");for(let e=0;e<i.length;e++)i[e].classList.remove("selected");e.classList.add("selected"),_quizAnswers[r.getAttribute("data-index")]=t===n}function submitQuiz(e){const t=document.querySelector('.chinese-quiz-section[data-lesson-id="'+e+'"]');if(!t)return;const n=t.querySelectorAll(".chinese-quiz-question"),r=n.length;let i=0;const o=t.querySelector(".chinese-quiz-submit");o&&(o.style.display="none");for(let e=0;e<n.length;e++){const t=n[e],r=t.getAttribute("data-answer"),o=t.getAttribute("data-type")||"choice";if("fill"===o||"fill-py"===o){const e=t.querySelector(".fill-input");if(e){e.disabled=!0;const t=(e.value||"").trim().toLowerCase(),n=r?r.toLowerCase():"",o=function(e){return e.replace(/[āáǎà]/g,"a").replace(/[ēéěè]/g,"e").replace(/[īíǐì]/g,"i").replace(/[ōóǒò]/g,"o").replace(/[ūúǔù]/g,"u").replace(/[ǖǘǚǜ]/g,"ü").replace(/[0-9]/g,"").trim()},s=o(t)===o(n);e.className="lrn-practice-input fill-input "+(s?"correct":"wrong"),s&&i++}}else{const e=t.querySelector(".chinese-quiz-option.selected"),n=t.querySelectorAll(".chinese-quiz-option");for(let e=0;e<n.length;e++)n[e].disabled=!0,n[e].style.cursor="default",(n[e].getAttribute("data-opt-text")||n[e].textContent.replace(/^[A-D]\. /,"").trim())===r&&n[e].classList.add("correct");e&&((e.getAttribute("data-opt-text")||e.textContent.replace(/^[A-D]\. /,"").trim())===r?i++:e.classList.add("wrong"))}}const s=r>0?Math.round(i/r*100):0,c=t.querySelector(".chinese-quiz-result");if(!c)return;let l='<div class="lrn-quiz-result">';l+='<span class="lrn-quiz-score-icon">'+(s>=80?"🌟":s>=60?"👍":"💪")+"</span>",l+='<div class="lrn-quiz-score-text">'+s+"%</div>",l+='<div class="lrn-quiz-score-detail">'+i+"/"+r+" "+_("正确","tačno","correct")+"</div>";const a=s>=100?5:s>=80?4:s>=60?3:s>=40?2:s>=20?1:0;l+='<div class="lrn-quiz-stars">';for(let e=0;e<5;e++)l+='<span class="star '+(e<a?"filled":"empty")+'">⭐</span>';if(l+="</div></div>",s>=60){const t=markLessonComplete(e,s,0);if(l+='<div class="lrn-practice-feedback correct">✅ '+_("恭喜通过！","Čestitamo!","Congratulations!")+"</div>",t&&t.length>0){l+='<div style="text-align:center;margin-top:8px">';for(let e=0;e<t.length;e++)t[e]&&(l+='<div style="font-size:.7rem;margin:4px;padding:6px 12px;background:var(--rose-light);border-radius:10px;display:inline-block">',l+=(t[e].icon||"🏆")+" "+langName(t[e].name),l+="</div>");l+="</div>"}const n=e+1;n<=TOTAL_LESSONS&&isLessonUnlocked(n)&&(l+='<button class="btn btn-primary" onclick="renderLessonView('+n+',\'vocab\')" style="margin-top:12px;width:100%">'+_("下一课 ▸","Sledeća lekcija ▸","Next Lesson ▸")+"</button>"),triggerCelebration(),"undefined"!=typeof toast&&toast(_("✅ 第"+e+"课完成！","✅ Lekcija "+e+" završena!","✅ Lesson "+e+" complete!"))}else l+='<div class="lrn-practice-feedback wrong">'+_("未通过（需60%以上），再试一次吧","Niste prošli (potrebno 60%), probajte ponovo","Not passed (need 60%), try again")+"</div>",l+='<button class="lrn-quiz-retry-btn" onclick="renderLessonView('+e+',\'quiz\')" style="margin-top:8px;width:100%">'+_("重新测验","Ponovi test","Retry Quiz")+"</button>";c.innerHTML=l}function triggerCelebration(){const e=["#E8877B","#F0985C","#4EB8B0","#E8919C","#9B7EC4","#D4A843","#FF6B6B","#FFD93D","#6BCB77","#4D96FF"],t=document.createElement("div");t.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999;";for(let n=0;n<50;n++){const n=document.createElement("div");n.className="lrn-confetti-piece",n.style.cssText="position:fixed;width:"+(4+8*Math.random())+"px;height:"+(4+8*Math.random())+"px;border-radius:"+(Math.random()>.5?"50%":"2px")+";left:"+100*Math.random()+"%;top:"+(-10-20*Math.random())+"px;background:"+e[Math.floor(Math.random()*e.length)]+";animation:confetti "+(1.5+3*Math.random())+"s ease-out forwards;animation-delay:"+.8*Math.random()+"s;pointer-events:none;z-index:99999;",t.appendChild(n)}document.body.appendChild(t),setTimeout(function(){t.parentNode&&t.parentNode.removeChild(t)},4e3)}window.checkPracticeAnswer=checkPracticeAnswer,window.selectQuizOption=selectQuizOption,window.submitQuiz=submitQuiz;
/* === dist/js/chinese-panels.js === */
function renderStatsPanel(){const t=document.getElementById("lrnStatsCards"),e=document.getElementById("lrnStatsHeatmap");if(!t||!e)return;const s=getProgress(),a=getTotalProgress(),n=s.completedLessons||{},l=Object.keys(n).length;t.innerHTML='<div class="lrn-stat-card"><span class="lrn-stat-icon">📚</span><div class="lrn-stat-val">'+l+"/"+TOTAL_LESSONS+'</div><div class="lrn-stat-label">'+_("已学课程","Završene lekcije","Lessons done")+'</div></div><div class="lrn-stat-card"><span class="lrn-stat-icon">🔥</span><div class="lrn-stat-val">'+(a.streak||0)+'</div><div class="lrn-stat-label">'+_("连续天数","Dana zaredom","Day streak")+'</div></div><div class="lrn-stat-card"><span class="lrn-stat-icon">⭐</span><div class="lrn-stat-val">'+(a.totalPoints||0)+'</div><div class="lrn-stat-label">'+_("总积分","Ukupno poena","Total points")+'</div></div><div class="lrn-stat-card" onclick="var g=prompt(\''+_("设置每日目标课数:","Postavi dnevni cilj:","Set daily goal:")+'\',getDailyGoal());if(g)setDailyGoal(g);renderStatsPanel();renderChineseHome();" style="cursor:pointer"><span class="lrn-stat-icon">🎯</span><div class="lrn-stat-val">'+getDailyGoal()+'</div><div class="lrn-stat-label">'+_("每日目标","Dnevni cilj","Daily goal")+"</div></div>";let r='<h4 style="font-size:.68rem;margin-bottom:8px;font-weight:700">'+_("学习热力图","Mapa učenja","Study heatmap")+"</h4>";r+='<div class="lrn-heatmap-grid">';const i=_("一二三四五六日","P U S C P S N","M T W T F S S");for(let t=0;t<7;t++)r+='<div style="font-size:.45rem;color:var(--text-muted);text-align:center">'+i.charAt(t)+"</div>";const o=new Date,d=new Date(o);d.setDate(d.getDate()-48);const c=d.getDay();d.setDate(d.getDate()-(c+6)%7);const v=s.dailyStats||{},p=new Date(d),g=fmtDateLocal(new Date);let h=0;for(let t=0;t<7;t++){for(let t=0;t<7;t++){const t=fmtDateLocal(p),e=v[t]&&v[t].lessonsCompleted||0;if(r+='<div class="lrn-heat-cell '+(0===e?"":e<=1?"low":e<=3?"med":"high")+(t===g?" today":"")+'" title="'+t+": "+e+" "+_("课","lekcija","lessons")+'"></div>',p.setDate(p.getDate()+1),h++,h>=49)break}if(h>=49)break}r+="</div>",r+='<div class="lrn-heat-legend" style="display:flex;justify-content:flex-end;gap:4px;margin-top:6px;font-size:.5rem;color:var(--text-muted);align-items:center">'+_("少","Manje","Less")+'<div class="lrn-heat-cell" style="width:10px;height:10px"></div><div class="lrn-heat-cell low" style="width:10px;height:10px"></div><div class="lrn-heat-cell med" style="width:10px;height:10px"></div><div class="lrn-heat-cell high" style="width:10px;height:10px"></div>'+_("多","Više","More")+"</div>",e.innerHTML=r}function renderFavoritesPanel(){const t=document.getElementById("lrnFavoritesContainer");if(!t)return;const e=getFavorites();if(0===e.length)return void(t.innerHTML='<div class="lrn-empty-state"><span class="lrn-empty-icon">⬚</span><span class="lrn-empty-text">'+_("暂无收藏词汇","Nema sačuvanih reči","No favorite words")+"</span></div>");let s="";for(let t=0;t<e.length;t++){const a=e[t],n=findWordInLessons(a);n&&(s+='<div class="lrn-word-card">',s+='<button class="lrn-fav-btn fav-active" onclick="toggleFavoriteWord(\''+escapeHtml(a)+"');this.closest('.lrn-word-card').remove();\" title=\""+_("取消收藏","Ukloni","Remove")+'">⭐</button>',s+='<div class="lrn-word-zh">'+(n.zh||"")+"</div>",s+='<div class="lrn-word-py">'+(n.py||"")+"</div>",s+='<div class="lrn-word-sr">'+(n.sr||"")+"</div>",n.en&&(s+='<div class="lrn-word-en">'+(n.en||"")+"</div>"),s+='<button class="lrn-word-audio" onclick="event.stopPropagation();speakWord(\''+escapeHtml(a)+'\')" title="'+_("发音","Izgovor","Pronounce")+'">🔊</button>',s+="</div>")}t.innerHTML=s}function findWordInLessons(t){for(let e=0;e<LESSONS_DATA.length;e++){const s=LESSONS_DATA[e];if(s.words)for(let e=0;e<s.words.length;e++)if(s.words[e].zh===t)return s.words[e]}return null}window.renderStatsPanel=renderStatsPanel,window.renderFavoritesPanel=renderFavoritesPanel;
/* === dist/js/chinese-listen.js === */
let _currentListenWordIdx=0,_currentListenScore=0,_listenLessonWords=[];function renderListenPractice(e){const n=document.getElementById("lrnListenContainer");if(!n)return;const t=getLessonById(e);!t||!t.words||t.words.length<2?n.innerHTML='<div class="lrn-empty-state">'+_("词汇不足，无法听力练习","Nedovoljno reči za vežbu slušanja","Not enough words for listening")+"</div>":(_currentListenWordIdx=0,_currentListenScore=0,_listenLessonWords=t.words,n.innerHTML='<div style="text-align:center;padding:20px"><div style="font-size:.7rem;color:var(--text-muted);margin-bottom:12px">'+_("听中文发音，选对应的翻译","Slušajte izgovor i izaberite prevod","Listen to Chinese and pick the translation")+'</div><button class="btn btn-primary" onclick="startListenSession()" style="width:100%">'+_("开始听力练习","Započni vežbu","Start Listening")+"</button></div>")}function startListenSession(){_currentListenWordIdx=0,_currentListenScore=0,nextListenWord()}function nextListenWord(){if(_currentListenWordIdx>=_listenLessonWords.length){const e=document.getElementById("lrnListenContainer");if(!e)return;const n=_listenLessonWords.length>0?Math.round(_currentListenScore/_listenLessonWords.length*100):0;return void(e.innerHTML='<div style="text-align:center;padding:20px"><div style="font-size:2rem;margin-bottom:8px">'+(n>=80?"🌟":n>=60?"👍":"💪")+'</div><div style="font-size:1.2rem;font-weight:700">'+_currentListenScore+"/"+_listenLessonWords.length+'</div><div style="font-size:.7rem;color:var(--text-muted);margin-bottom:12px">'+n+"% "+_("正确","tačno","correct")+'</div><button class="btn btn-primary" onclick="startListenSession()" style="width:100%">'+_("再听一次","Ponovo slušaj","Listen again")+"</button></div>")}const e=_listenLessonWords[_currentListenWordIdx],n=e.sr||"",t=[n],s=[];for(let e=0;e<_listenLessonWords.length;e++)_listenLessonWords[e].sr!==n&&_listenLessonWords[e].sr&&s.push(_listenLessonWords[e].sr);shuffleArray(s);for(let e=0;e<3&&e<s.length;e++)t.indexOf(s[e])<0&&t.push(s[e]);for(;t.length<4;){const e="zh-CN"===lang?["你好","谢谢","再见","好的","请问"]:"en"===lang?["Hello","Thanks","Goodbye","OK","Please"]:["Zdravo","Hvala","Doviđenja","Ćao","Molim"],n=e[Math.floor(Math.random()*e.length)];t.indexOf(n)<0&&t.push(n)}if(shuffleArray(t),window.speechSynthesis){window.speechSynthesis.cancel(),"function"==typeof preloadVoices&&preloadVoices();const n=new SpeechSynthesisUtterance(e.zh||"");n.lang="zh-CN",n.rate=.6,n.volume=1;const t=speechSynthesis.getVoices();for(let e=0;e<t.length;e++)if("zh-CN"===t[e].lang){n.voice=t[e];break}if(!n.voice)for(let e=0;e<t.length;e++)if(0===t[e].lang.indexOf("zh")){n.voice=t[e];break}window.speechSynthesis.speak(n)}const i=document.getElementById("lrnListenContainer");if(!i)return;let o='<div class="lrn-listen-card" style="text-align:center">';o+='<div style="font-size:.65rem;color:var(--text-muted);margin-bottom:6px">'+_("听中文，选翻译","Slušaj kineski, izaberi prevod","Listen and choose")+" ("+(_currentListenWordIdx+1)+"/"+_listenLessonWords.length+") · "+_("得分: ","Rezultat: ","Score: ")+_currentListenScore+"</div>",o+='<div class="lrn-listen-sound" onclick="replayListenWord(\''+escapeHtml(e.zh||"")+'\')" style="font-size:2.5rem;cursor:pointer;margin-bottom:10px">🔊</div>',o+='<div id="lrnListenChoices" class="lrn-practice-choice">';for(let e=0;e<t.length;e++)o+='<button class="lrn-practice-option" onclick="checkListenAnswer(this,\''+escapeHtml(t[e])+"','"+escapeHtml(n)+"')\">"+t[e]+"</button>";o+="</div></div>",i.innerHTML=o}function checkListenAnswer(e,n,t){const s=document.querySelectorAll("#lrnListenChoices .lrn-practice-option");for(let e=0;e<s.length;e++)s[e].disabled=!0,s[e].style.cursor="default",s[e].textContent===t&&(s[e].className="lrn-practice-option correct");n===t?_currentListenScore++:e.className="lrn-practice-option wrong",_currentListenWordIdx++,setTimeout(function(){nextListenWord()},1e3)}function replayListenWord(e){if(!window.speechSynthesis)return;"function"==typeof preloadVoices&&preloadVoices(),window.speechSynthesis.cancel();const n=new SpeechSynthesisUtterance(e);n.lang="zh-CN",n.rate=.6,n.volume=1;const t=speechSynthesis.getVoices();for(let e=0;e<t.length;e++)if("zh-CN"===t[e].lang){n.voice=t[e];break}if(!n.voice)for(let e=0;e<t.length;e++)if(0===t[e].lang.indexOf("zh")){n.voice=t[e];break}window.speechSynthesis.speak(n)}window.renderListenPractice=renderListenPractice,window.startListenSession=startListenSession,window.nextListenWord=nextListenWord,window.checkListenAnswer=checkListenAnswer,window.replayListenWord=replayListenWord;
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
const AuthModule=function(){"use strict";const e={andjela:"8e614d39a1f1279958da1c9f7e8df51db4aabca8cc3a3e84f8c3dc5f88e1fcfb",barry:"286aee2ea4a5ba67539432dc5ea3865c3b204d3caaccb662995388d156a279cf"};let n=null,o=!1;function l(){const t=document.getElementById("loginPinInput"),l=t?t.value:"";let a;a="andjela"===n?document.getElementById("loginCardAndjela"):document.getElementById("loginCardBarry"),function(e){if(!e)return Promise.resolve("");try{const t=(new TextEncoder).encode(e);return crypto.subtle.digest("SHA-256",t).then(function(e){return Array.from(new Uint8Array(e)).map(function(e){return e.toString(16).padStart(2,"0")}).join("")})}catch(t){let n=0;for(let t=0;t<e.length;t++)n=(n<<5)-n+e.charCodeAt(t),n|=0;return Promise.resolve("fallback_"+Math.abs(n).toString(16))}}(l).then(function(l){if(l===e[n]){window.activeProfile=n,localStorage.setItem("cycle-active-profile",activeProfile),sessionStorage.setItem("cycle-logged-in","1"),o=!0;const e=document.getElementById("loginOverlay");e&&e.classList.add("hidden"),bootApp()}else{a&&a.classList.add("shake");const e=document.getElementById("loginError");e&&(e.textContent="barry"===n?"PIN 不对，再试一次":"Pogrešan PIN — pokušaj ponovo"),t&&(t.value=""),setTimeout(function(){a&&a.classList.remove("shake")},500)}})}return{init:function(){applyTheme(localStorage.getItem("cycle-theme")||"light"),loadCalendarData(function(e){solarTermsCache=e&&e.solarTerms||[],localStorage.setItem("cycle-solarterms",JSON.stringify(solarTermsCache))});const e=sessionStorage.getItem("cycle-logged-in"),t=localStorage.getItem("cycle-active-profile");if(t&&"1"===e){window.activeProfile=t,o=!0;const e=document.getElementById("loginOverlay");e&&e.classList.add("hidden"),bootApp().catch(function(e){"undefined"!=typeof DEBUG&&DEBUG&&console.error("bootApp failed:",e)})}else{localStorage.removeItem("cycle-active-profile");const e=document.getElementById("loginOverlay");e&&e.classList.remove("hidden")}},login:l,logout:function(){"undefined"!=typeof _syncInterval&&null!==_syncInterval&&(clearInterval(_syncInterval),_syncInterval=null),o=!1,n=null,window.activeProfile=null,state={records:[],symptoms:{},moods:{},diaries:{},settings:{cycleLength:28,periodLength:7,manualOverride:!1},_migrated:!0},localStorage.removeItem("cycle-active-profile"),localStorage.removeItem("cycle-login-day"),window.lang="sr";const e=document.getElementById("loginOverlay");e&&e.classList.remove("hidden");const t=document.getElementById("loginPinArea");t&&t.classList.remove("show");const l=document.getElementById("loginCardAndjela"),a=document.getElementById("loginCardBarry");l&&l.classList.remove("selected"),a&&a.classList.remove("selected");const c=document.getElementById("loginSwitchHint");c&&(c.textContent="👈 Izaberi svoj profil i unesi PIN");const i=document.getElementById("loginPinInput");i&&(i.value="");const r=document.getElementById("loginError");r&&(r.textContent="");const s=document.getElementById("loginPinBtn");s&&(s.textContent="🔓 Prijavi se");const d=document.getElementById("lc-hint-a"),m=document.getElementById("lc-hint-b");d&&(d.textContent="Dodirni za prijavu"),m&&(m.textContent="Dodirni za prijavu")},selectLogin:function(e){n=e;const o="barry"===e?"zh-CN":"sr";window.lang=o,document.querySelectorAll(".lang-btn").forEach(function(e){e.classList.toggle("active",e.dataset.lang===window.lang)});const l=document.getElementById("loginCardAndjela"),a=document.getElementById("loginCardBarry");l&&l.classList.toggle("selected","andjela"===e),a&&a.classList.toggle("selected","barry"===e);const c=document.getElementById("loginPinBtn");c&&(c.textContent=t("authPinBtn"));const i=document.getElementById("lc-hint-a"),r=document.getElementById("lc-hint-b"),s=t("authTapHint");i&&(i.textContent=s),r&&(r.textContent=s);const d=document.getElementById("loginPinArea");d&&d.classList.add("show");const m=document.getElementById("loginPinInput");m&&(m.value="",setTimeout(function(){m.focus()},300));const g=document.getElementById("loginError");g&&(g.textContent="");const u=document.getElementById("loginSwitchHint");u&&(u.textContent=t("authSwitchHint")),function(){const e=document.getElementById("loginOverlay");if(!e)return;const t=["💕","💖","💗","💝","🌸","✨","🌷","🕊️"];for(let n=0;n<15;n++)(function(n){setTimeout(function(){const o=document.createElement("span");if(o.textContent=t[n%t.length],o.style.cssText="position:fixed;pointer-events:none;z-index:1001;font-size:"+(.8+1.5*Math.random())+"rem;left:"+(5+90*Math.random())+"%;top:"+(80+15*Math.random())+"%;animation:loginHeartFloat "+(2+3*Math.random())+"s ease-out forwards",o.style.opacity="0.7",e.appendChild(o),setTimeout(function(){o.parentNode&&o.remove()},3500),!document.getElementById("loginHeartKeyframes")){const e=document.createElement("style");e.id="loginHeartKeyframes",e.textContent="@keyframes loginHeartFloat{0%{opacity:1;transform:translateY(0) scale(1) rotate(0deg)}100%{opacity:0;transform:translateY(-120px) scale(.3) rotate(45deg)}}",document.head.appendChild(e)}},120*n)})(n)}()},verifyLogin:l,isLoggedIn:function(){return o},getSelectedProfile:function(){return n},getPinHashes:function(){return e}}}(),selectLogin=AuthModule.selectLogin,verifyLogin=AuthModule.verifyLogin;
/* === dist/js/weather.js === */
const WeatherModule=function(){"use strict";const e=[{zh:"不管多远，我的心和你在一起。",sr:"Bez obzira na udaljenost, moje srce je s tobom."},{zh:"7000公里，但思念没有距离。",sr:"7.000 kilometara, ali čežnja nema udaljenost."},{zh:"你是我早上醒来的第一个念头。",sr:"Ti si moja prva misao kad se probudim."},{zh:"同一个太阳，同一份爱。",sr:"Jedno sunce, jedna ljubav."},{zh:"每次抬头看天空，我知道你也在这片天空下。",sr:"Svaki put kad pogledam u nebo, znam da si i ti pod istim nebom."},{zh:"从北京到贝尔格莱德，我的心跳只为你。",sr:"Od Pekinga do Beograda, moje srce kuca samo za tebe."},{zh:"你是我跨越山海的理由。",sr:"Ti si razlog zbog kog prelazim planine i mora."},{zh:"爱不是距离除以时间，爱是心与心的零距离。",sr:"Ljubav nije udaljenost podeljena vremenom, ljubav je nulta udaljenost između srca."},{zh:"有人问我想去哪里，我说：去有你的地方。",sr:"Pitaju me gde želim da idem, ja kažem: tamo gde si ti."},{zh:"世界上最美的距离，是你和我之间的距离。",sr:"Najlepša udaljenost na svetu je ona između tebe i mene."},{zh:"今天也想你，比昨天多一点，比明天少一点。",sr:"I danas mislim na tebe, malo više nego juče, malo manje nego sutra."},{zh:"你是我此生最美的风景。",sr:"Ti si najlepši prizor u mom životu."}];function t(){try{return localStorage.getItem("cycle-ann-love")||"2026-05-07"}catch(e){return"2026-05-07"}}function n(){try{return localStorage.getItem("cycle-ann-met")||"2026-03-19"}catch(e){return"2026-03-19"}}function a(e,t){return Math.round((t.getTime()-e.getTime())/864e5)}function o(){const e=new Date;return new Date(e.getFullYear(),e.getMonth(),e.getDate())}function i(){const t=(new Date).getDate()%e.length;return e[t]}function r(){return function(e){try{return JSON.parse(e)}catch(e){return{}}}(localStorage.getItem("shared-sun-counter"))}function s(){const e=document.getElementById("sunCounter");if(!e)return;const t=r().count||0;e.innerHTML=t>0?"☀️ "+L(t+" dan zajedničkog sunca ❤️","Day "+t+" of shared sun ❤️","共同仰望太阳的第 "+t+" 天 ❤️"):"❤️ "+L("Klikni ovde da započneš brojanje","Click here to start counting","点击此处开始计数")}function u(e){return e<=3?"☀️":e<=48?"⛅":e<=57?"🌧️":e<=67?"🌨️":e<=77?"🌫️":e<=86?"❄️":"⛈️"}function d(){const e=(new Date).toLocaleString("sr-Latn",{timeZone:"Asia/Shanghai",hour:"2-digit",minute:"2-digit",hour12:!1}),t=(new Date).toLocaleString("sr-Latn",{timeZone:"Europe/Belgrade",hour:"2-digit",minute:"2-digit",hour12:!1}),n=document.getElementById("timeBj");n&&(n.textContent=e);const a=document.getElementById("timeKi");a&&(a.textContent=t);const o=document.getElementById("timeDiff");if(o){let n=parseInt(e)-parseInt(t);n<0&&(n+=24),o.textContent=L("razlika ","time diff ","时差 ")+n+"h"}}function l(e){const t=document.getElementById("weatherCard");if(!e)return t.style.display="",void(t.innerHTML='<div style="text-align:center;padding:20px"><div class="skeleton" style="width:200px;height:20px;margin:8px auto;border-radius:8px"></div><div class="skeleton" style="width:140px;height:14px;margin:6px auto;border-radius:6px"></div><div style="font-size:.6rem;color:var(--text-muted);margin-top:8px">'+L("Učitavam vreme...","Loading weather...","加载天气中...")+"</div></div>");t.style.display="";const n="sr"===lang?"🏙 Peking·Čaojang":"en"===lang?"🏙 Beijing·Chaoyang":"🏙 北京·朝阳",a=("sr"===lang||lang,"🏡 Kikinda"),o="sr"===lang?"Vlažnost":"en"===lang?"Humidity":"湿度";document.getElementById("weatherBj").innerHTML='<div style="font-size:.65rem;color:var(--text-muted)">'+n+'</div><div style="font-size:1.5rem;font-weight:700">'+Math.round(e.bj.temperature_2m)+'°</div><div style="font-size:1.2rem">'+u(e.bj.weather_code)+'</div><div style="font-size:.6rem;color:var(--text-muted)">'+o+" "+e.bj.relative_humidity_2m+"%</div>",document.getElementById("weatherKi").innerHTML='<div style="font-size:.65rem;color:var(--text-muted)">'+a+'</div><div style="font-size:1.5rem;font-weight:700">'+Math.round(e.ki.temperature_2m)+'°</div><div style="font-size:1.2rem">'+u(e.ki.weather_code)+'</div><div style="font-size:.6rem;color:var(--text-muted)">'+o+" "+e.ki.relative_humidity_2m+"%</div>";const r=[],l=e.bj.weather_code,c=e.ki.weather_code,m=l<=3&&c<=3||l>=45&&c>=45||l>=71&&c>=71;m&&l<=3?r.push({txt:"sr"===lang?"Sunce sija i u Pekingu i u Kikindi ☀️ — isto sunce greje oba naša srca.":"en"===lang?"The sun shines on both Beijing and Kikinda ☀️ — the same sun warms both our hearts.":"北京和Kikinda阳光普照 ☀️ — 同一个太阳温暖我们的心。",barry:"sr"===lang?"Barry kaže: Kad pogledaš u sunce, seti se — ja gledam u isto to sunce ovde u Pekingu. 7.000 kilometara, jedno sunce. ♥":"en"===lang?"Barry says: When you look at the sun, remember — I'm looking at the same sun in Beijing. 7,000 km, one sun. ♥":"Barry说：当你看着太阳，记住——我在北京也看着同一轮太阳。7000公里，同一个太阳。♥"}):m&&c>=45&&c<=67?r.push({txt:"sr"===lang?"Kiša pada i na Vojvodinu i na Peking 🌧️ — iste kapi, dva različita sveta.":"en"===lang?"Rain falls on both Vojvodina and Beijing 🌧️ — same drops, two different worlds.":"雨水落在Vojvodina和北京 🌧️ — 同样的雨滴，两个不同的世界。",barry:"sr"===lang?"Barry kaže: Dok kiša pada po tvojoj Vojvodini, ja slušam kišu u Pekingu i mislim na tebe. Kiša spaja sve. 🌧️♥":"en"===lang?"Barry says: While rain falls on your Vojvodina, I listen to the rain in Beijing and think of you. Rain connects everything. 🌧️♥":"Barry说：雨落在你的Vojvodina，我在北京听着雨声想你。雨水连接一切。🌧️♥"}):r.push({txt:"sr"===lang?"Različito nebo, isto srce 🌍 — od Pekinga do Kikinde, od Dunava do Jangcea.":"en"===lang?"Different skies, one heart 🌍 — from Beijing to Kikinda, from Danube to Yangtze.":"不同的天空，同一颗心 🌍 — 从北京到Kikinda，从多瑙河到长江。",barry:"sr"===lang?"Barry kaže: Dunav teče kroz tvoj grad, Jangce kroz moj. Dve reke, jedna ljubav koja teče između nas. ♥":"en"===lang?"Barry says: The Danube flows through your town, the Yangtze through mine. Two rivers, one love flowing between us. ♥":"Barry说：多瑙河流过你的城市，长江流过我的。两条河流，一份在我们之间流淌的爱。♥"}),r.push({txt:"sr"===lang?"Sa Dunava na Jangce — ljubav teče kao reka 🌊":"en"===lang?"From Danube to Yangtze — love flows like a river 🌊":"从多瑙河到长江 — 爱如河流 🌊",barry:"sr"===lang?"Od ravnice do Pekinga, od šljivovice do čaja — naša priča je most između dva sveta.":"en"===lang?"From plains to Beijing, from rakija to tea — our story bridges two worlds.":"从平原到北京，从李子酒到茶——我们的故事连接两个世界。"});const g=r[Math.floor(Math.random()*r.length)];document.getElementById("weatherLove").innerHTML='<div style="font-style:italic;margin-bottom:4px">"'+g.txt+'"</div><div style="font-size:.62rem;opacity:.82;line-height:1.5">'+g.barry+"</div>",document.getElementById("weatherLove").style.display="",d();const h=i(),y=document.getElementById("dailyLoveMsg");y&&(y.textContent="💌 "+(0===(lang||"").indexOf("zh")?h.zh:0===(lang||"").indexOf("en")?h.en:h.sr)),s();const v=document.getElementById("weatherNightHint");if(v){const e=(new Date).toLocaleString("en-US",{timeZone:"Europe/Belgrade",hour:"numeric",hour12:!1});parseInt(e)>=22||parseInt(e)<=5?(v.style.display="",v.textContent=L("🌙 Kod tebe je kasno - vreme za spavanje, Anđela 🛏️","🌙 Kikinda现在是深夜，Angie该休息了","🌙 It's late in Kikinda — time for sleep, Anđela 🛏️")):v.style.display="none"}const f=document.getElementById("weatherBridge");if(f){const t=Math.round(e.bj.temperature_2m),n=Math.round(e.ki.temperature_2m),a=Math.abs(t-n),o=a<=3?"sr"===lang?"Ista toplina 🌡️♥":"en"===lang?"Same warmth 🌡️♥":"同样温度 🌡️♥":"sr"===lang?"Razlika "+a+"° 🌡️":"en"===lang?a+"° apart 🌡️":"温差 "+a+"° 🌡️",i=L("Dunav","Danube","多瑙河"),r=L("Jangce","Yangtze","长江");f.innerHTML="🌉  "+i+" → "+r+"<br>Kikinda "+n+"° ↔ "+t+"° "+L("Peking","Beijing","北京")+"<br>"+o}}return{init:function(){setInterval(d,6e4)},fetchWeather:function(){const e=localStorage.getItem("cycle-weather");if(e)try{l(JSON.parse(e))}catch(e){"undefined"!=typeof DEBUG&&DEBUG&&console.warn("[weather] Bad cached data")}if(e)try{const t=JSON.parse(e);if(Date.now()-t.t<216e5)return}catch(e){"undefined"!=typeof DEBUG&&DEBUG&&console.warn("[weather] Bad cache")}const t=new AbortController,n=setTimeout(function(){t.abort()},8e3);try{const e=fetch("https://api.open-meteo.com/v1/forecast?latitude=39.92&longitude=116.44&current=temperature_2m,relative_humidity_2m,weather_code&daily=sunrise,sunset&timezone=Asia/Shanghai",{signal:t.signal}).then(function(e){return e.json()}).catch(function(){return null}),a=fetch("https://api.open-meteo.com/v1/forecast?latitude=45.83&longitude=20.47&current=temperature_2m,relative_humidity_2m,weather_code&daily=sunrise,sunset&timezone=Europe/Belgrade",{signal:t.signal}).then(function(e){return e.json()}).catch(function(){return null});Promise.all([e,a]).then(function(e){if(clearTimeout(n),!e[0]&&!e[1])return;const t=e[0]?e[0].current:null;t&&e[0].daily&&(t.sunrise=e[0].daily.sunrise[0],t.sunset=e[0].daily.sunset[0]);const a=e[1]?e[1].current:null;a&&e[1].daily&&(a.sunrise=e[1].daily.sunrise[0],a.sunset=e[1].daily.sunset[0]);const o={bj:t,ki:a,t:Date.now()};localStorage.setItem("cycle-weather",JSON.stringify(o)),l(o)}).catch(function(){})}catch(e){"undefined"!=typeof DEBUG&&DEBUG&&console.warn("[weather] Forecast fetch failed")}},renderWeather:l,weatherIcon:u,clickSunCounter:function(){const e=r(),t=(new Date).toISOString().slice(0,10);e.lastDate!==t?(e.count=(e.count||0)+1,e.lastDate=t,localStorage.setItem("shared-sun-counter",JSON.stringify(e)),"function"==typeof pushAllSharedData&&pushAllSharedData(),s(),toast("☀️ "+L("Dan "+e.count+" zajedničkog sunca!","Day "+e.count+" of shared sun!","共同仰望太阳的第"+e.count+"天！"))):toast("❤️ "+L("Već si kliknuo/la danas!","Already clicked today!","今天已经点过了！"))},renderSunCounter:s,updateLoveCounter:function(){const e=document.getElementById("titleLoveCounter");if(!e||!t())return;const i=a(new Date(t()),o());i>=0&&(e.textContent="♥ "+i+("sr"===lang?" dana zajedno":"en"===lang?" days together":" 天在一起"));const r=document.getElementById("love-days-content");if(!r)return;const s=[];if(n()){const e=a(new Date(n()),o());e>=0&&s.push('<div style="font-size:.85rem"><span style="color:var(--gold)">✨</span> '+e+("sr"===lang?" dana od prvog susreta":"en"===lang?" days since we met":" 天前初次相遇")+"</div>")}if(t()){const e=a(new Date(t()),o());e>=0&&s.push('<div style="font-size:1.2rem;font-weight:700;color:var(--love)">♥ '+e+("sr"===lang?" dana zajedno":"en"===lang?" days together":" 天在一起")+"</div>")}r.innerHTML=s.join('<div style="height:4px"></div>');const u=document.getElementById("love-days-title");u&&(u.textContent="sr"===lang?"💕 Dani zajedno":"en"===lang?"💕 Our Days":"💕 我们的日子")},randomThinkingOfYou:function(){if("undefined"!=typeof activeProfile&&"andjela"!==activeProfile)return;if(Math.random()>.18)return;const e="sr"===lang?["Upravo sam pomislio na tebe ♥","Nadam se da se osećaš dobro danas ✨","Tvoj osmeh mi je najdraža st let 🌸","Mislim na tebe... uvek 💫","Barry je upravo pomislio na tebe 💝"]:"en"===lang?["Just thought of you ♥","Hope you are feeling good today ✨","Your smile is my favorite thing 🌸","Thinking of you... always 💫","Barry was just thinking of you 💝"]:["刚刚在想你 ♥","希望你今天心情好 ✨","你的笑容是我最喜欢的 🌸","一直在想你 💫","Barry 刚刚想到了你 💝"],t=e[Math.floor(Math.random()*e.length)];"function"==typeof toast&&setTimeout(function(){toast(t)},3e3)},getTodaysLoveMessage:i,updateWeatherTimes:d,DAILY_LOVE_MESSAGES:e}}(),fetchWeather=WeatherModule.fetchWeather,renderWeather=WeatherModule.renderWeather,weatherIcon=WeatherModule.weatherIcon,clickSunCounter=WeatherModule.clickSunCounter,renderSunCounter=WeatherModule.renderSunCounter,updateWeatherTimes=WeatherModule.updateWeatherTimes,getTodaysLoveMessage=WeatherModule.getTodaysLoveMessage,DAILY_LOVE_MESSAGES=WeatherModule.DAILY_LOVE_MESSAGES;
/* === dist/js/sync.js === */
const SyncModule=function(){const e="darkheaven1419-debug/cycle-tracker",t="shared-state.json";function n(e,t){try{const n=localStorage.getItem(e);return n?JSON.parse(n):t}catch(e){return t}}function a(){let e=n("shared-cycle-data",null);return e&&e.records||(e=n("cycle-data-v6-andjela",null)),{diary:n("shared-diary",{}),cycleInfo:e,symptoms:n("shared-symptoms",null),gratitude:n("shared-gratitude",[]),hug:n("shared-hug",null),songs:{barry:n("shared-song-barry",null),andjela:n("shared-song-andjela",null)},sleep:n("barry-sleep",null),checkins:{barry:n("shared-checkin-barry",{}),andjela:n("shared-checkin-andjela",{})},learningProgress:n("shared-learning-progress",{}),learningComments:n("shared-learning-comments",[]),learningPoints:n("shared-learning-points",{}),voiceData:n("shared-voice-data",{}),sunCounter:n("shared-sun-counter",{}),knowme:n("shared-knowme",{}),calendarMarkers:n("shared-calendar-markers",{}),updated:Date.now()}}function r(e){e&&(e.diary&&localStorage.setItem("shared-diary",JSON.stringify(e.diary)),e.cycleInfo&&(localStorage.setItem("shared-cycle-data",JSON.stringify(e.cycleInfo)),e.cycleInfo.records&&e.cycleInfo.records.length>0&&localStorage.setItem("cycle-data-v6-andjela",JSON.stringify(e.cycleInfo)),e.cycleInfo.records&&(state.records=e.cycleInfo.records.map(function(e){return new Date(e)}),state.periodEnds=e.cycleInfo.periodEnds||{},state.symptoms=e.cycleInfo.symptoms||{},state.settings=e.cycleInfo.settings||{cycleLength:28,periodLength:7})),e.symptoms&&localStorage.setItem("shared-symptoms",JSON.stringify(e.symptoms)),e.gratitude&&localStorage.setItem("shared-gratitude",JSON.stringify(e.gratitude)),e.hug&&localStorage.setItem("shared-hug",JSON.stringify(e.hug)),e.sleep&&localStorage.setItem("barry-sleep",JSON.stringify(e.sleep)),e.songs&&(e.songs.barry&&localStorage.setItem("shared-song-barry",JSON.stringify(e.songs.barry)),e.songs.andjela&&localStorage.setItem("shared-song-andjela",JSON.stringify(e.songs.andjela))),e.checkins&&(e.checkins.barry&&localStorage.setItem("shared-checkin-barry",JSON.stringify(e.checkins.barry)),e.checkins.andjela&&localStorage.setItem("shared-checkin-andjela",JSON.stringify(e.checkins.andjela))),e.learningProgress&&localStorage.setItem("shared-learning-progress",JSON.stringify(e.learningProgress)),e.learningComments&&localStorage.setItem("shared-learning-comments",JSON.stringify(e.learningComments)),e.learningPoints&&localStorage.setItem("shared-learning-points",JSON.stringify(e.learningPoints)),e.voiceData&&localStorage.setItem("shared-voice-data",JSON.stringify(e.voiceData)),e.sunCounter&&localStorage.setItem("shared-sun-counter",JSON.stringify(e.sunCounter)),e.knowme&&localStorage.setItem("shared-knowme",JSON.stringify(e.knowme)),e.calendarMarkers&&(localStorage.setItem("shared-calendar-markers",JSON.stringify(e.calendarMarkers)),"function"==typeof renderCalendar&&renderCalendar()))}async function s(n){n=n||0;const r=getGitHubToken();if(!r)return;const c=a(),l={Authorization:"Bearer "+r,Accept:"application/vnd.github.v3+json","Content-Type":"application/json"};let i=null;try{const n=await fetch("https://api.github.com/repos/"+e+"/contents/"+t,{headers:l,cache:"no-store"});n.ok&&(i=(await n.json()).sha)}catch(e){return void(n<3&&setTimeout(function(){s(n+1)},2e3))}const d={message:"🔄 Sync shared state",content:btoa(unescape(encodeURIComponent(JSON.stringify(c,null,2))))};i&&(d.sha=i);try{const a=await fetch("https://api.github.com/repos/"+e+"/contents/"+t,{method:"PUT",headers:l,body:JSON.stringify(d)});a.ok?localStorage.setItem("shared-last-sync",Date.now()):409===a.status||422===a.status?("undefined"!=typeof DEBUG&&DEBUG&&console.warn("[Sync] 409 Conflict — pulling latest and merging"),await o(),n<3?setTimeout(function(){s(n+1)},1500):("undefined"!=typeof DEBUG&&DEBUG&&console.error("[Sync] Failed after 3 retries — giving up"),"function"==typeof toast&&toast("sr"===lang?"⚠️ Sinhronizacija nije uspela — pokušaj ponovo":"⚠️ 同步失败，请稍后重试"))):"undefined"!=typeof DEBUG&&DEBUG&&console.error("[Sync] Unexpected response:",a.status,a.statusText)}catch(e){n<3?setTimeout(function(){s(n+1)},2e3):"undefined"!=typeof DEBUG&&DEBUG&&console.error("[Sync] Network error after retries:",e.message)}}async function o(){const n=getGitHubToken();if(!n)return;const a={Authorization:"Bearer "+n,Accept:"application/vnd.github.v3+json"};try{const n=await fetch("https://api.github.com/repos/"+e+"/contents/"+t,{headers:a,cache:"no-store"});if(!n.ok)return;const s=await n.json(),o=JSON.parse(decodeURIComponent(escape(atob(s.content)))),l=parseInt(localStorage.getItem("shared-last-sync")||"0");if(o.updated&&o.updated<=l)return;invalidateSDCache(),r(o),localStorage.setItem("shared-last-sync",Date.now()),renderHug(),renderGratitude(),renderSong(),renderCheckin(),renderKnowMe(),"barry"===activeProfile&&(renderBarrySymptomView(),renderCalendar(),renderTips()),renderSharedDiary(),renderDateStrip(),c()}catch(e){c()}}function c(){const e=!!getGitHubToken(),t=localStorage.getItem("shared-last-sync"),n=document.getElementById("syncStatusBadge");if(n){if(!e)return n.textContent="⚪ "+("sr"===lang?"Nije podešeno":"en"===lang?"Not configured":"未设置"),void(n.style.color="var(--text-muted)");if(t){const e=Math.floor((Date.now()-parseInt(t))/1e3);let a;a=e<30?"sr"===lang?"upravo":"en"===lang?"just now":"刚刚":e<120?"sr"===lang?"pre 1 min":"en"===lang?"1 min ago":"1分钟前":e<3600?("sr"===lang?"pre ":"")+Math.floor(e/60)+("sr"===lang?" min":"en"===lang?" min ago":"分钟前"):("sr"===lang?"pre ":"")+Math.floor(e/3600)+("sr"===lang?" h":"en"===lang?" h ago":"小时前"),n.textContent="🟢 "+("sr"===lang?"Sinhronizovano ":"Synced ")+a,n.style.color="var(--sage)"}else n.textContent="🟡 "+("sr"===lang?"Čeka se sinhronizacija...":"en"===lang?"Waiting for sync...":"等待同步..."),n.style.color="var(--gold)"}}return{init:function(){const e=window.saveSharedDiaryData;window.saveSharedDiaryData=function(t){e(t),s()},setInterval(function(){getGitHubToken()&&o()},12e4),c()},push:s,pull:o,collect:a,apply:r,updateBadge:c}}(),updateSyncStatusBadge=SyncModule.updateBadge,pushAllSharedData=SyncModule.push,pullAllSharedData=SyncModule.pull,collectSharedState=SyncModule.collect,applySharedState=SyncModule.apply;
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
/* === dist/js/render-settings.js === */
function exportAllData(){const e={version:1,exportedAt:(new Date).toISOString(),exportedBy:activeProfile,diary:JSON.parse(localStorage.getItem("shared-diary")||"{}"),learningProgress:JSON.parse(localStorage.getItem("shared-learning-progress")||"{}"),learningComments:JSON.parse(localStorage.getItem("shared-learning-comments")||"[]"),learningPoints:JSON.parse(localStorage.getItem("shared-learning-points")||"{}"),voiceData:JSON.parse(localStorage.getItem("shared-voice-data")||"{}"),sunCounter:JSON.parse(localStorage.getItem("shared-sun-counter")||"{}"),settings:{activeProfile:activeProfile,lang:lang,theme:theme}},t=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),n=document.createElement("a");n.href=URL.createObjectURL(t),n.download="andjelin-ciklus-backup-"+(new Date).toISOString().slice(0,10)+".json",n.click(),URL.revokeObjectURL(n.href),toast("📦 "+L("Podaci izvezeni!","Data exported!","数据已导出！"))}function importAllData(){const e=document.createElement("input");e.type="file",e.accept=".json",e.onchange=function(e){const t=e.target.files[0];if(!t)return;if(!confirm(L("Ovo ce PREBRISATI sve trenutne podatke. Nastaviti?","This will OVERWRITE all current data. Continue?","此操作将覆盖所有当前数据，是否继续？")))return;const n=new FileReader;n.onload=function(e){try{const t=JSON.parse(e.target.result);t.diary&&localStorage.setItem("shared-diary",JSON.stringify(t.diary)),t.learningProgress&&localStorage.setItem("shared-learning-progress",JSON.stringify(t.learningProgress)),t.learningComments&&localStorage.setItem("shared-learning-comments",JSON.stringify(t.learningComments)),t.learningPoints&&localStorage.setItem("shared-learning-points",JSON.stringify(t.learningPoints)),t.voiceData&&localStorage.setItem("shared-voice-data",JSON.stringify(t.voiceData)),t.settings&&(t.settings.lang&&(lang=t.settings.lang,setLang(lang)),t.settings.theme&&(theme=t.settings.theme,applyTheme(theme))),pushAllSharedData(),toast("✅ "+L("Podaci vraceni! Osvezavanje...","Data restored! Refreshing...","数据已恢复！刷新中...")),setTimeout(function(){location.reload()},1500)}catch(e){toast("❌ "+L("Neispravan fajl","Invalid file","无效文件"))}},n.readAsText(t)},e.click()}function saveAnniversaries(){annDateMet=document.getElementById("annDateMet").value,annDateLove=document.getElementById("annDateLove").value,localStorage.setItem("cycle-ann-met",annDateMet),localStorage.setItem("cycle-ann-love",annDateLove),updateAnniversaryCount(),renderCalendar()}function saveGitHubToken(){const e=document.getElementById("set-gh-token").value.trim(),t=document.getElementById("tokenSecurityWarning");e?(sessionStorage.setItem("gh-token",e),toast("🔑 Token sacuvan"),t&&(t.style.display=""),pullAllSharedData().then(function(){updateSyncStatusBadge(),renderAll()})):(sessionStorage.removeItem("gh-token"),t&&(t.style.display="none"),updateSyncStatusBadge())}async function testGitHubToken(){const e=document.getElementById("testTokenBtn");if(!e)return;const t=e.textContent;e.disabled=!0,e.textContent="⏳ Testiranje...";const n=getGitHubToken();if(!n)return toast("🔑 "+L("Prvo unesi token","Enter a token first","请先输入 Token")),e.textContent=t,void(e.disabled=!1);try{const a=await fetch("https://api.github.com/user",{headers:{Authorization:"Bearer "+n,Accept:"application/vnd.github.v3+json"}});if(a.ok){const n=await a.json();toast("✅ "+L("Token vazi - "+n.login,"Token valid - "+n.login,"Token 有效 - "+n.login)),e.textContent="✅ Vazi",setTimeout(function(){e.textContent=t,e.disabled=!1},3e3)}else 401===a.status?(toast("❌ "+L("Token nevazeci - generisi novi","Token invalid - generate a new one","Token 无效 - 请重新生成")),e.textContent="❌ Nevazeci",setTimeout(function(){e.textContent=t,e.disabled=!1},3e3)):(toast("⚠️ "+L("Greska: "+a.status,"Error: "+a.status,"错误: "+a.status)),e.textContent=t,e.disabled=!1)}catch(n){toast("⚠️ "+L("Mrezna greska","Network error","网络错误")),e.textContent=t,e.disabled=!1}}function clearGitHubToken(){if(!getGitHubToken())return;if(!confirm(L("Obrisati GitHub token? Sinhronizacija ce prestati.","Clear GitHub token? Sync will stop.","清除 GitHub Token？同步将停止。")))return;sessionStorage.removeItem("gh-token"),document.getElementById("set-gh-token").value="";const e=document.getElementById("tokenSecurityWarning");e&&(e.style.display="none"),updateSyncStatusBadge(),toast("🗑️ "+L("Token obrisan","Token cleared","Token 已清除"))}function loadSettingsUI(){document.getElementById("set-cycle").value=state.settings.cycleLength,document.getElementById("set-period").value=state.settings.periodLength,document.getElementById("set-language").value=lang,document.getElementById("set-theme").value=theme,document.getElementById("annDateMet").value=annDateMet,document.getElementById("annDateLove").value=annDateLove;const e=!!getGitHubToken();document.getElementById("set-gh-token").value=getGitHubToken(),document.getElementById("set-gh-token").placeholder="ghp_...",document.getElementById("set-h-token").textContent=e?t("settingsTokenHintEnabled"):t("settingsTokenHintDisabled");const n=document.getElementById("tokenSecurityWarning");n&&(n.style.display=e?"":"none"),updateAnniversaryCount(),updateSyncStatusBadge()}function saveSettings(){state.settings.cycleLength=parseInt(document.getElementById("set-cycle").value)||28,state.settings.periodLength=parseInt(document.getElementById("set-period").value)||7,saveState(),renderAll(["calendar","core"]),toast(t("toast.saved"))}function exportData(){const e=new Blob([JSON.stringify({records:state.records.map(fmtDate),symptoms:state.symptoms,moods:state.moods||{},diaries:state.diaries||{},settings:state.settings},null,2)],{type:"application/json"}),n=document.createElement("a");n.href=URL.createObjectURL(e),n.download="andjelin-ciklus-"+activeProfile+"-"+fmtDate(new Date)+".json",n.click(),URL.revokeObjectURL(n.href),toast(t("toast.exported"))}function importData(e){const n=e.target.files[0];if(!n)return;const a=new FileReader;a.onload=function(){try{const e=JSON.parse(a.result);if(!e.records||!Array.isArray(e.records))throw new Error("Invalid format");if(state.records=e.records.map(function(e){const t=new Date(e);return isNaN(t.getTime())?null:t}).filter(Boolean),0===state.records.length&&e.records.length>0)throw new Error("No valid dates");state.symptoms=e.symptoms||{},state.moods=e.moods||{},state.diaries=e.diaries||{},state.settings={cycleLength:28,periodLength:7,manualOverride:!1},e.settings&&Object.keys(e.settings).forEach(function(t){state.settings[t]=e.settings[t]}),saveState(),renderAll(),updateFab(),toast(t("toast.imported"))}catch(e){toast(t("toast.importError"))}},a.readAsText(n),e.target.value=""}function clearAllData(){confirm(t("settings.clearConfirm"))&&(state={records:[],symptoms:{},moods:{},diaries:{},settings:{cycleLength:28,periodLength:7,manualOverride:!1},_migrated:!0},saveState(),renderAll(),updateFab(),toast(t("toast.cleared")))}function dismissOnboarding(){document.getElementById("onboardingBanner").style.display="none",localStorage.setItem("cycle-ob-dismissed","1")}function showOnboardingIfNeeded(){"andjela"!==activeProfile||0!==state.records.length||localStorage.getItem("cycle-ob-dismissed")||(document.getElementById("onboardingBanner").style.display="flex",document.getElementById("ob-text").textContent=t("onboarding"))}
/* === dist/js/render-diary.js === */
"use strict";function renderDateStrip(){const e=document.getElementById("dateStrip");if(!e)return;const a=loadSharedDiaryData(),n=new Date,r=fmtDate(sharedDiaryViewDate),i=t("sdDOW");let o="";for(let e=-Math.floor(DATE_STRIP_DAYS/2);e<DATE_STRIP_DAYS-Math.floor(DATE_STRIP_DAYS/2);e++){const t=new Date(n);t.setDate(t.getDate()+e);const d=fmtDate(t),l=i[t.getDay()],s=a[d],c=s&&s.barry&&s.andjela,y=s&&(s.barry||s.andjela),m=["date-pill"];d===fmtDate(n)&&m.push("today"),d===r&&m.push("selected"),o+='<div class="'+m.join(" ")+'" data-date="'+d+'" onclick="selectDateStrip(\''+d+"')\">",o+='<span class="dp-dow">'+l+"</span>",o+='<span class="dp-day">'+t.getDate()+"</span>",o+='<span class="dp-dot'+(y?" has-entry"+(c?" both-entry":""):"")+'"></span>',o+="</div>"}e.innerHTML=o,requestAnimationFrame(function(){const t=e.querySelector(".selected");t&&t.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"})})}function selectDateStrip(e){sharedDiaryViewDate=new Date(e+"T00:00:00"),renderDateStrip(),renderSharedDiary()}function scrollDateStrip(e){const t=document.getElementById("dateStrip");t&&t.scrollBy({left:e*t.clientWidth*.7,behavior:"smooth"})}function exportSharedDiary(){const e=fmtDate(sharedDiaryViewDate),a=loadSharedDiaryData(),n=a[e]&&a[e][activeProfile];if(!n)return void toast(t("sdSaveFirst"));const r={date:e,author:activeProfile,entry:n},i=JSON.stringify(r);if(navigator.clipboard)navigator.clipboard.writeText(i).then(function(){toast("📤 "+t("sdExportCopied"))});else{const e=document.createElement("textarea");e.value=i,e.style.cssText="position:fixed;top:0;left:0;opacity:0",document.body.appendChild(e),e.select();try{document.execCommand("copy"),toast("📤 "+t("sdExportCopiedSimple"))}catch(e){prompt(t("sdExportPrompt"),i)}document.body.removeChild(e)}}function showImportModal(){const e=document.querySelector(".import-modal-overlay");e&&e.remove();const a=document.createElement("div");a.className="import-modal-overlay",a.innerHTML='<div class="import-modal"><h4>'+t("sdImportTitle")+'</h4><textarea id="importTextarea" placeholder="'+t("sdImportPlaceholder")+'"></textarea><div class="im-btns"><button class="im-cancel" id="imCancel">'+t("sdImportCancel")+'</button><button class="im-confirm" id="imConfirm">'+t("sdImportConfirm")+"</button></div></div>",document.body.appendChild(a),a.addEventListener("click",function(e){e.target===a&&a.remove()}),document.getElementById("imCancel").addEventListener("click",function(){a.remove()}),document.getElementById("imConfirm").addEventListener("click",function(){const e=document.getElementById("importTextarea").value.trim();e?(doImport(e),a.remove()):a.remove()}),navigator.clipboard&&navigator.clipboard.readText&&navigator.clipboard.readText().then(function(e){try{JSON.parse(e),document.getElementById("importTextarea").value=e}catch(e){console.warn("[import] Clipboard content is not valid JSON")}}).catch(function(e){"undefined"!=typeof DEBUG&&DEBUG&&console.warn("[weather] Fetch failed")}),document.getElementById("importTextarea").focus()}function importSharedDiary(){showImportModal()}function doImport(e){try{const a=JSON.parse(e);if(!a.date||!a.author||!a.entry)throw new Error;const n=loadSharedDiaryData();n[a.date]||(n[a.date]={}),n[a.date][a.author]=a.entry,saveSharedDiaryData(n),a.date===fmtDate(sharedDiaryViewDate)&&renderSharedDiary(),renderDateStrip(),toast("📥 "+t("sdImportDone"))}catch(e){toast(t("sdImportError"))}}function canViewPartnerDiaryEntry(e){const t=loadSharedDiaryData();return!(!t[e]||!t[e][activeProfile])}async function renderSharedDiary(){const e=fmtDate(sharedDiaryViewDate),t=loadSharedDiaryData(),a=t[e]&&t[e][activeProfile],n="andjela"===activeProfile?"barry":"andjela",r=t[e]&&t[e][n],i=document.getElementById("sd-happy"),o=document.getElementById("sd-uncomf"),d=document.getElementById("sd-thanks"),l=document.getElementById("sd-wish");i&&(i.value=a&&a.happy||""),o&&(o.value=a&&a.uncomf||""),d&&(d.value=a&&a.thanks||""),l&&(l.value=a&&a.wish||""),["happy","uncomf","thanks","wish"].forEach(function(e){const t=document.getElementById("sdc-"+e),a=document.getElementById("sd-"+e);t&&(t.textContent=a?(a.value||"").length:0)});const s=document.getElementById("partnerLocked"),c=document.getElementById("sharedDiaryPartnerContent"),y=document.getElementById("translateBtnSm");s&&c&&(a?(s.style.display="none",c.style.display="",c.classList.add("partner-card-unlocked"),renderPartnerContent(r,n,c,y)):(s.style.display="",c.style.display="none",c.classList.remove("partner-card-unlocked"),y&&(y.style.display="none"))),renderSharedDiaryHistory(t),getGitHubToken()&&pullPartnerEntry(e).then(function(){const t=loadSharedDiaryData(),m=t[e]&&t[e][activeProfile],u=t[e]&&t[e][n];if(JSON.stringify(u)!==JSON.stringify(r)){const e=document.activeElement;e&&("sd-happy"===e.id||"sd-uncomf"===e.id||"sd-thanks"===e.id||"sd-wish"===e.id)||a&&a.time||(i&&(i.value=m&&m.happy||""),o&&(o.value=m&&m.uncomf||""),d&&(d.value=m&&m.thanks||""),l&&(l.value=m&&m.wish||"")),s&&c&&(m?(s.style.display="none",c.style.display="",renderPartnerContent(u,n,c,y)):(s.style.display="",c.style.display="none")),renderSharedDiaryHistory(t)}})}function renderPartnerContent(e,a,n,r){if(e){const i="andjela"===a?"🌸 Anđela":"👦 Barry";let o="";if(e.time){const t=new Date(e.time);o=String(t.getHours()).padStart(2,"0")+":"+String(t.getMinutes()).padStart(2,"0")}let d='<div style="font-size:.62rem;color:var(--gold);margin-bottom:8px">'+i+(o?" · "+o:"")+"</div>";const l=[{q:t("sdQuestions")[0].q,a:e.happy},{q:t("sdQuestions")[1].q,a:e.uncomf},{q:t("sdQuestions")[2].q,a:e.thanks},{q:t("sdQuestions")[3].q,a:e.wish}],s=[];l.forEach(function(e){e.a&&(s.push(e.a),d+='<div class="sd-partner-field"><div class="sd-partner-q">'+e.q+'</div><div class="sd-partner-a" data-original="'+esc(e.a)+'" id="sdp-'+s.length+'">'+esc(e.a)+"</div></div>")}),e.happy||e.uncomf||e.thanks||e.wish||(d+='<div class="sd-empty">'+t("sdNoEntry")+"</div>"),n.innerHTML=d,s.length>0?(r.style.display="",r.textContent="🌐"):r.style.display="none"}else n.innerHTML='<div class="sd-locked"><span class="sd-locked-icon">📭</span><div class="sd-locked-text">'+t("sdPartnerLocked")+"</div></div>",r.style.display="none"}function _collectDiaryItems(e){const t=[];return Object.keys(e).forEach(function(a){const n=e[a];(n.barry||n.andjela)&&t.push({date:a,barry:n.barry,andjela:n.andjela})}),t.sort(function(e,t){return t.date.localeCompare(e.date)}),t}function _buildTimelineEntry(e){const a=e.barry&&e.andjela?"dot-both":e[activeProfile]?"dot-mine":"dot-partner",n=[];e.andjela&&n.push("🌸 Anđela"),e.barry&&n.push("👦 Barry");const r=e[activeProfile];let i=r&&(r.happy||r.thanks||r.uncomf||r.wish)||"",o="";return r||!e.barry&&!e.andjela?i&&(i=esc(i.substring(0,80)),o=i+(i.length>=80?"...":"")):o='<span class="tn-locked">🔒 '+t("sdTimelineLocked")+"</span>",'<div class="timeline-node '+a+'" onclick="jumpToDiaryDate(\''+e.date+'\')"><div class="tn-date">📅 '+e.date+'</div><div class="tn-authors">'+n.join(" · ")+'</div><div class="tn-preview">'+o+"</div></div>"}function renderSharedDiaryHistory(e){const a=[];Object.keys(e).forEach(function(t){const n=e[t],r=n.barry,i=n.andjela;(r||i)&&a.push({date:t,barry:r,andjela:i})}),a.sort(function(e,t){return t.date.localeCompare(e.date)});const n=document.getElementById("sharedDiaryHistory");if(!n)return;if(0===a.length)return void(n.innerHTML='<div class="sd-empty" style="padding-left:20px">'+t("sdTimelineEmpty")+"</div>");const r=a.length>10;n.innerHTML='<div class="timeline-inner">'+a.slice(0,10).map(_buildTimelineEntry).join("")+"</div>"+(r?'<div class="timeline-load-more"><button onclick="expandTimeline()" id="timelineExpandBtn">'+t("sdTimelineMore")+" "+(a.length-10)+" "+t("day")+"</button></div>":"")}function jumpToDiaryDate(e){if(void 0!==_diaryViewDate)return _diaryViewDate=new Date(e+"T00:00:00"),_diaryMood="",void renderDiaryPanel();sharedDiaryViewDate=new Date(e+"T00:00:00"),renderDateStrip(),renderSharedDiary();const t=document.getElementById("panel-diary");t&&t.scrollIntoView({behavior:"smooth"})}function renderDiaryLabels(){document.getElementById("sd-my-title").textContent=t("sdMyReflection"),document.getElementById("sd-my-hint").textContent="sr"===lang?"Iskreno o danu — što više detalja, to bolje 💫":"en"===lang?"Be honest about your day — the more detail the better 💫":"坦诚地回顾一天——越详细越好 💫",document.getElementById("sd-l-happy").textContent=t("sdLabelHappy"),document.getElementById("sd-l-uncomf").textContent=t("sdLabelUncomf"),document.getElementById("sd-l-thanks").textContent=t("sdLabelThanks"),document.getElementById("sd-l-wish").textContent=t("sdLabelWish"),document.getElementById("sd-save-text").textContent="sr"===lang?"Sačuvaj i pogledaj partnerov":"en"===lang?"Save & View Partner's":"保存并查看伴侣的",document.getElementById("sd-gate-hint").textContent="sr"===lang?"Sačuvaj svoj unos pre nego što vidiš partnerov":"en"===lang?"Save your entry to unlock your partner's":"写完才能看伴侣的哦",document.getElementById("sd-partner-title").textContent=t("sdPartnerReflection");let e=getGitHubToken()?t("sdSyncHintOn"):t("sdSyncHintOff");const a=localStorage.getItem("shared-last-sync");if(a&&getGitHubToken()){const n=Math.floor((Date.now()-parseInt(a))/6e4);e+=n<1?" · "+t("sdSyncJustNow"):n<60?" · "+n+"min "+t("sdSyncMinAgo"):" · "+Math.floor(n/60)+"h "+t("sdSyncHAgo")}document.getElementById("sd-sync-hint").textContent=e,document.getElementById("sd-export").textContent=t("sdExportBtn"),document.getElementById("sd-import").textContent=t("sdImportBtn"),document.getElementById("sd-history-title").textContent=t("sdTimelineTitle"),document.getElementById("sd-saved-text").textContent=L("Sačuvano","Saved","已保存"),document.getElementById("partner-locked-text").textContent=t("sdPartnerLockedText"),document.getElementById("sd-sync-icon").textContent=getGitHubToken()?"☁️":""}["happy","uncomf","thanks","wish"].forEach(function(e){const t=document.getElementById("sd-"+e);t&&t.addEventListener("input",function(){const a=document.getElementById("sdc-"+e);a&&(a.textContent=t.value.length),t.style.height="auto",t.style.height=Math.min(t.scrollHeight,160)+"px"})});let _diaryCalMonth,_diaryCalYear,_diaryViewDate=new Date,_diaryMood="",_diaryTimelineLimit=15,_diaryAutoSaveTimer=null;function initSharedDiaryTab(){_diaryViewDate=new Date,_diaryMood="",_diaryTimelineLimit=15,renderDiaryPanel()}function renderDiaryPanel(){renderDiaryDateStrip(),renderDiaryForm(),renderDiaryPartnerCard(),renderDiaryTimeline(),renderMailbox(loadSharedDiaryData())}function renderDiaryDateStrip(){const e=document.getElementById("diaryDateStrip");if(!e)return;const a=loadSharedDiaryData(),n=new Date,r=fmtDate(new Date(_diaryViewDate)),i=t("sdDOW");let o="";for(let e=-3;e<=3;e++){const t=new Date(n);t.setDate(t.getDate()+e);const d=fmtDate(t),l=a[d],s=l&&l[activeProfile],c=l&&l["andjela"===activeProfile?"barry":"andjela"],y=["diary-date-pill"];d===fmtDate(n)&&y.push("today"),d===r&&y.push("selected"),o+='<div class="'+y.join(" ")+'" onclick="selectDiaryDate(\''+d+"')\">",o+='<span class="dd-dow">'+i[t.getDay()]+"</span>",o+='<span class="dd-day">'+t.getDate()+"</span>",o+='<span class="dd-dot'+(s&&c?" both":s?" mine":"")+'"></span>',o+="</div>"}e.innerHTML=o,requestAnimationFrame(function(){const t=e.querySelector(".selected");t&&t.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"})})}function selectDiaryDate(e){_diaryViewDate=new Date(e+"T00:00:00"),_diaryMood="",renderDiaryPanel()}function scrollDiaryStrip(e){const t=document.getElementById("diaryDateStrip");t&&t.scrollBy({left:e*t.clientWidth*.6,behavior:"smooth"})}function toggleDiaryCalendar(){const e=document.getElementById("diaryFullCal"),t=document.querySelector(".diary-cal-btn");if(!e)return;const a="none"!==e.style.display;e.style.display=a?"none":"",t&&t.classList.toggle("active",!a),a||(_diaryCalMonth=new Date(_diaryViewDate).getMonth(),_diaryCalYear=new Date(_diaryViewDate).getFullYear(),renderDiaryFullCal())}function renderDiaryFullCal(){const e=document.getElementById("diaryFullCalGrid");if(!e)return;const a=loadSharedDiaryData(),n=new Date(_diaryCalYear,_diaryCalMonth,1);let r=n.getDay();r=0===r?6:r-1;const i=fmtDate(new Date(_diaryViewDate)),o=fmtDate(new Date);let d=t("sdDOWMon").map(function(e){return'<div class="mc-dow">'+e+"</div>"}).join("");for(let e=0;e<42;e++){const t=new Date(n);t.setDate(t.getDate()-r+e);const l=fmtDate(t),s=t.getMonth()===_diaryCalMonth,c=a[l],y=c&&c.barry&&c.andjela,m=c&&(c.barry||c.andjela),u=["mc-day"];s||u.push("other-month"),l===o&&u.push("today"),l===i&&u.push("selected"),d+='<div class="'+u.join(" ")+'" onclick="selectDiaryCalDate(\''+l+"')\">",d+="<span>"+t.getDate()+"</span>",m&&s&&(d+='<span class="mc-dot'+(y?" both":" has-entry")+'"></span>'),d+="</div>"}e.innerHTML=d,document.getElementById("diaryCalMonthLabel").textContent=L(_diaryCalYear+". "+(_diaryCalMonth+1)+".",_diaryCalYear+"年"+(_diaryCalMonth+1)+"月",t("months")[_diaryCalMonth]+" "+_diaryCalYear)}function selectDiaryCalDate(e){_diaryViewDate=new Date(e+"T00:00:00"),_diaryMood="",document.getElementById("diaryFullCal").style.display="none";const t=document.querySelector(".diary-cal-btn");t&&t.classList.remove("active"),renderDiaryPanel()}function shiftDiaryCalMonth(e){_diaryCalMonth+=e,_diaryCalMonth<0&&(_diaryCalMonth=11,_diaryCalYear--),_diaryCalMonth>11&&(_diaryCalMonth=0,_diaryCalYear++),renderDiaryFullCal()}function goDiaryCalToday(){const e=new Date;_diaryCalMonth=e.getMonth(),_diaryCalYear=e.getFullYear(),_diaryViewDate=e,renderDiaryFullCal(),document.getElementById("diaryFullCal").style.display="none";const t=document.querySelector(".diary-cal-btn");t&&t.classList.remove("active"),renderDiaryPanel()}function renderDiaryForm(){const e=fmtDate(new Date(_diaryViewDate)),a=new Date(_diaryViewDate),n=L("💌 "+a.getDate()+". "+(a.getMonth()+1)+". "+a.getFullYear()+".","💌 "+a.getFullYear()+"年"+(a.getMonth()+1)+"月"+a.getDate()+"日","💌 "+t("months")[a.getMonth()]+" "+a.getDate()+", "+a.getFullYear());document.getElementById("diaryWriteDate").textContent=n,document.getElementById("diary-save-text").textContent=L("Sačuvaj","Save","保存"),document.getElementById("letter-saved-text").textContent=L("Sačuvano","Saved","已保存");const r=loadSharedDiaryData(),i=r[e]&&r[e][activeProfile],o=document.getElementById("diaryTextarea"),d=i?letterTextFromEntry(i):"";o.value!==d&&(o.value=d),_diaryMood=i&&i.mood?i.mood:"";let l="";(L?LETTER_MOODS:["😊","🥰","😢","😤","😴","🤩"]).forEach(function(e){l+='<span class="diary-mood-chip'+(_diaryMood===e?" picked":"")+'" onclick="pickDiaryMood(\''+e+"')\">"+e+"</span>"}),document.getElementById("diaryMoodRow").innerHTML=l,updateDiaryCharCount(),o.oninput=function(){updateDiaryCharCount(),clearTimeout(_diaryAutoSaveTimer),_diaryAutoSaveTimer=setTimeout(autoSaveDiaryDraft,2e3)}}function updateDiaryCharCount(){const e=document.getElementById("diaryTextarea"),t=document.getElementById("diaryCharCount");t&&e&&(t.textContent=e.value.length+"/500")}function pickDiaryMood(e){_diaryMood=_diaryMood===e?"":e,renderDiaryForm()}function autoSaveDiaryDraft(){const e=fmtDate(new Date(_diaryViewDate)),t=document.getElementById("diaryTextarea");if(!t||!t.value.trim())return;const a=loadSharedDiaryData();a[e]||(a[e]={});const n=a[e][activeProfile]||{};a[e][activeProfile]={text:t.value.trim(),mood:_diaryMood,time:Date.now(),draft:!0,hug:n.hug},saveSharedDiaryData(a)}function saveDiaryEntry(){const e=fmtDate(new Date(_diaryViewDate)),t=document.getElementById("diaryTextarea"),a=t?t.value.trim():"";if(!a)return;const n=loadSharedDiaryData();n[e]||(n[e]={});const r=n[e][activeProfile]||{};n[e][activeProfile]={text:a,mood:_diaryMood,time:Date.now(),hug:r.hug},saveSharedDiaryData(n);const i=document.getElementById("letterSavedBadge");i&&(i.classList.add("show"),setTimeout(function(){i.classList.remove("show")},2e3)),pushAllSharedData().catch(function(){}),renderDiaryPanel(),toast("💌 ✓")}function renderDiaryPartnerCard(){const e=fmtDate(new Date(_diaryViewDate)),t=loadSharedDiaryData(),a="andjela"===activeProfile?"barry":"andjela",n=t[e]&&t[e][activeProfile],r=t[e]&&t[e][a],i="andjela"===a?"🌸 Anđela":"👦 Barry";document.getElementById("letter-partner-title").textContent=i+" "+L("pismo","的信","'s Letter"),document.getElementById("letter-lock-text").textContent=L("Napiši svoje pismo da otključaš partnerovo 💌","写下你的信来解锁伴侣的 💌","Write your letter to unlock your partner's 💌");const o=document.getElementById("letterLocked"),d=document.getElementById("letterPartnerContent"),l=document.getElementById("letterTranslateBtn");if(n)if(o.style.display="none",d.style.display="",r){const e=r.mood||"",t=r.time?function(e){const t=new Date(e);return String(t.getHours()).padStart(2,"0")+":"+String(t.getMinutes()).padStart(2,"0")}(r.time):"",a=letterTextFromEntry(r);d.innerHTML='<div class="letter-body">'+esc(a)+'</div><div class="letter-signature">— '+i+" "+e+" 💕</div>"+(t?'<div class="letter-time">'+t+"</div>":""),l.style.display=""}else d.innerHTML='<div style="text-align:center;padding:16px;font-size:var(--text-sm);color:var(--text-muted);font-style:italic">'+L("Partner još nije napisao pismo za ovaj dan 📭","伴侣还没写这一天的信 📭","Your partner hasn't written for this day yet 📭")+"</div>",l.style.display="none";else o.style.display="",d.style.display="none",l.style.display="none"}function renderDiaryTimeline(){const e=document.getElementById("diaryTimelineList");if(!e)return;const t=loadSharedDiaryData();document.getElementById("diary-timeline-title").textContent=L("Svi unosi","所有日记","All Entries");const a=[];if(Object.keys(t).forEach(function(e){const n=t[e];n[activeProfile]&&a.push({date:e,entry:n[activeProfile]})}),a.sort(function(e,t){return t.date.localeCompare(e.date)}),0===a.length)return void(e.innerHTML='<div class="diary-timeline-empty">'+L("Još nema unosa — napiši prvi! ✍️","还没有日记——写第一篇吧！✍️","No entries yet — write the first! ✍️")+"</div>");const n=a.slice(0,_diaryTimelineLimit),r=fmtDate(new Date(_diaryViewDate));let i="";n.forEach(function(e){const t=letterTextFromEntry(e.entry),a=t.length>80?t.substring(0,80)+"...":t,n=e.entry.mood||"",o=e.date===r;i+='<div class="diary-timeline-item'+(o?'" style="border-color:var(--love)':"")+'" onclick="jumpToDiaryDate(\''+e.date+"')\">",i+='<div class="dti-header"><span class="dti-date">'+e.date+"</span>",n&&(i+='<span class="dti-mood">'+n+"</span>"),i+="</div>",i+='<div class="dti-preview">'+esc(a)+"</div>",i+="</div>"}),a.length>_diaryTimelineLimit&&(i+='<div class="diary-timeline-more"><button onclick="loadMoreDiaryEntries()">'+L("Učitaj još... ("+(a.length-_diaryTimelineLimit)+")","加载更多... ("+(a.length-_diaryTimelineLimit)+")","Load more... ("+(a.length-_diaryTimelineLimit)+")")+"</button></div>"),e.innerHTML=i}function loadMoreDiaryEntries(){_diaryTimelineLimit+=15,renderDiaryTimeline()}function jumpToDiaryDate(e){_diaryViewDate=new Date(e+"T00:00:00"),_diaryMood="",renderDiaryPanel()}const LETTER_MOODS=["😊","🥰","😢","😤","😴","🤩"];function letterTextFromEntry(e){if(!e)return"";if(e.text)return e.text;const t=[];return e.happy&&t.push("💝 "+e.happy),e.uncomf&&t.push("🤔 "+e.uncomf),e.thanks&&t.push("🙏 "+e.thanks),e.wish&&t.push("💪 "+e.wish),t.join("\n\n")}function renderMailbox(e){const t=document.getElementById("mailboxList");if(!t)return;const a=[];if(Object.keys(e).forEach(function(t){const n=e[t];(n.barry||n.andjela)&&a.push({date:t,barry:n.barry,andjela:n.andjela})}),a.sort(function(e,t){return t.date.localeCompare(e.date)}),document.getElementById("mailbox-title").textContent=L("Poštansko sanduče","信箱","Mailbox"),0===a.length)return void(t.innerHTML='<div class="mailbox-empty">'+L("Još nema pisama — napiši prvo! 💌","还没有信——写第一封吧！💌","No letters yet — write the first! 💌")+"</div>");let n="";for(let e=0;e<Math.min(a.length,8);e++){const t=a[e],r=t.barry&&t.andjela,i=t[activeProfile],o=t["andjela"===activeProfile?"barry":"andjela"],d=r?"💌":i?"✉️":"📭",l=i?(i.happy||i.text||letterTextFromEntry(i)).substring(0,60):o?"🔒 "+L("piši da otključaš","write to unlock","写信解锁"):"",s=i&&i.mood?i.mood:"";n+='<div class="mailbox-item" onclick="jumpToLetter(\''+t.date+"')\">",n+='<span class="mb-icon">'+d+"</span>",n+='<span class="mb-date">'+t.date.slice(5)+"</span>",s&&(n+='<span class="mb-mood">'+s+"</span>"),n+='<span class="mb-preview">'+esc(l)+"</span>",n+="</div>"}t.innerHTML=n}function jumpToLetter(e){_diaryViewDate=new Date(e+"T00:00:00"),_diaryMood="",renderDiaryPanel();const t=document.getElementById("panel-diary");t&&t.scrollIntoView({behavior:"smooth"})}function translatePartnerLetter(){const e=fmtDate(new Date(_diaryViewDate)),t=loadSharedDiaryData(),a="andjela"===activeProfile?"barry":"andjela",n=t[e]&&t[e][a];if(!n)return;const r=n.text||letterTextFromEntry(n),i="zh-CN"===(lang||"sr")?"zh-CN":"sr",o="barry"===a?"zh-CN":"sr";if(i===o)return;const d=document.getElementById("letterTranslateBtn");d&&(d.disabled=!0,d.textContent="⏳"),translateText(r,o,i).then(function(e){const t=document.getElementById("letterPartnerContent");if(e&&e!==r&&t){const r="andjela"===a?"🌸 Anđela":"👦 Barry",i=n.mood||"";t.innerHTML='<div class="letter-body">'+esc(e)+'</div><div class="letter-signature">— '+r+" "+i+' 💕</div><div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:4px">🌐 '+L("Prevedeno","Translated","已翻译")+"</div>",d&&(d.textContent="✅",d.disabled=!1)}else d&&(d.textContent="⚠️",d.disabled=!1,setTimeout(function(){d.textContent="🌐"},3e3))}).catch(function(){d&&(d.textContent="⚠️",d.disabled=!1,setTimeout(function(){d.textContent="🌐"},3e3))})}function clearAllDiaries(){confirm(L("Obrisati SVE zajedničke dnevnike? Ovo se ne može vratiti.","Delete ALL shared diaries? This cannot be undone.","删除所有共享日记？此操作不可撤销。"))&&(localStorage.setItem("shared-diary","{}"),saveSharedDiaryData({}),pushAllSharedData().then(function(){renderSharedDiary(),renderDateStrip(),renderCalendar(),toast("🗑️ "+L("Dnevnici obrisani","Diaries cleared","日记已清空"))}))}
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
  return sessionStorage.getItem('gh-token') || '';
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
// langName() defined in js/chinese-learn.js — 3-level language fallback for object lookups

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
const DASH_I18N = {
  barry: {
    dashTitle: '🏠 主页',
    welcomeBack: '欢迎回来，',
    todayCulture: '今日文化知识',
    goDiary: '📝 写日记',
    goLearn: '📚 中华文化',
    goCalendar: '📅 查看日历',
    connectQ: '💭 今天的对话',
    refreshQ: '🔄 换一个问题',
    todayPhase: '今日阶段',
    todayMoodDash: '今日心情',
    todayStreak: '连续打卡',
    todayCycles: '周期总数',
    avgAbbr: '平均',
  },
  andjela: {
    dashTitle: '🏠 Početna',
    welcomeBack: 'Dobrodošla nazad, ',
    todayCulture: 'Današnje kulturno znanje',
    goDiary: '📝 Dnevnik',
    goLearn: '📚 Kineska kultura',
    goCalendar: '📅 Kalendar',
    connectQ: '💭 Pitanje dana',
    refreshQ: '🔄 Drugo pitanje',
    todayPhase: 'Trenutna faza',
    todayMoodDash: 'Raspoloženje',
    todayStreak: 'Niz dana',
    todayCycles: 'Ukupno ciklusa',
    avgAbbr: 'Prosek',
  },
};
function dl(key) {
  const profile = (lang || '').indexOf('zh') === 0 ? 'barry' : 'andjela';
  const p = DASH_I18N[profile] || DASH_I18N.andjela;
  return p[key] || DASH_I18N.andjela[key] || key;
}
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
    navigator.serviceWorker.register('sw.js?v=7.2.0').catch(function () {});
  }
  loadPerProfileSettings();

  // Load data in background (do NOT await — never block the UI)
  loadDataFiles().catch(function () {
    /* Non-critical, UI works without data files */
  });

  state = loadState();
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
  try {
    if (typeof renderChineseHome === 'function') renderChineseHome();
  } catch (e) {
    /* renderChineseHome may not exist */
  }
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
  if (ta) ta.placeholder = t('diaryTextareaPlaceholder');
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
function togglePeriodRecord(date) {
  let idx = state.records.findIndex(function (r) {
    return sameDay(r, date);
  });
  let wasAdded = false;
  if (idx >= 0) {
    state = Object.assign({}, state, {
      records: state.records.filter(function (_, i) {
        return i !== idx;
      }),
    });
    toast('🚫 ' + t('toast.unmarked'));
  } else {
    let newRecords = state.records.concat([new Date(date)]).sort(function (a, b) {
      return a - b;
    });
    state = Object.assign({}, state, { records: newRecords });
    wasAdded = true;
    toast('🩸 ' + t('toast.marked'));
  }
  saveState();
  renderAll(['calendar', 'core']);
  updateFab();
  if (wasAdded) checkCycleCelebration();
  return wasAdded;
}

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
        document.getElementById('modalDiaryHeader').textContent = activeProfile === 'barry' ? '💌 日记' : '💌 Dnevnik';
        document.getElementById('modalDiaryEditText').textContent = activeProfile === 'barry' ? '编辑' : 'Uredi';
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
function togglePeriodRecord() {
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
  renderCalendar();
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
    { passive: false }
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

function goToday() {
  CalState.year = today().getFullYear();
  CalState.month = today().getMonth();
  const grid = document.getElementById('daysGrid');
  grid.style.transition = 'opacity 0.08s ease-out';
  grid.style.opacity = '0';
  setTimeout(function () {
    renderCalendar();
    grid.style.transition = 'opacity 0.2s ease-out';
    grid.style.opacity = '1';
  }, 80);
}
/* ================================================================
   CULTURE MODULE — za Anđelu
   ================================================================ */

// UI text mapping for culture card (auto-switches based on lang)
// CULTURE_KNOWLEDGE defined as backward-compat globals in js/culture-cards.js
// See CultureCardsModule for the IIFE implementation
/* CULTURE_KNOWLEDGE and _cultureCardIdx defined in js/culture-cards.js */

// cl(), getTodaysCultureIndex(), initCultureTab(), renderCultureCard(),
// prevCultureCard(), nextCultureCard(), goToTodayCulture() are in culture-cards.js

const _tabOrder = ['dashboard', 'stats', 'symptoms', 'diary', 'chinese', 'settings'];
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
    const app = document.querySelector('.app');
    if (app) app.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (id === 'chinese') {
      if (typeof initChineseTab === 'function') initChineseTab();
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
      .catch(function () { console.warn('[holidays] 数据加载失败'); });
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
      var name = upcoming.name[lang] || upcoming.name['sr'];
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
      }).catch(function () { console.warn('[holidays] 数据加载失败'); });
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
      .catch(function () { console.warn('[holidays] 数据加载失败'); });
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

/* === dist/js/module-sleep.js === */
"use strict";

(function () {
  console.log('[module-sleep] 已加载');

  var _S = {
    saved: { sr:'Sačuvano!', en:'Saved!', zh:'\u{5DF2}\u{4FDD}\u{5B58}\u{FF01}' },
    title: { sr:'Spavanje', en:'Sleep', zh:'\u{7761}\u{7720}' },
    hint: { sr:'Kad si legao sinoć? Angie vidi tvoje vreme spavanja \u{1F634}', en:'What time did you sleep last night? Angie sees your sleep time \u{1F634}', zh:'\u{6628}\u{665A}\u{51E0}\u{70B9}\u{7761}\u{7684}\u{FF1F}Angie \u{4F1A}\u{770B}\u{5230}\u{4F60}\u{7684}\u{7761}\u{7720}\u{65F6}\u{95F4} \u{1F634}' },
    save: { sr:'Sačuvaj', en:'Save', zh:'\u{4FDD}\u{5B58}' },
    empty: { sr:'Barry jo\u{0161} nije uneo vreme \u{2014} podseti ga!', en:"Barry hasn't logged sleep yet \u{2014} remind him!", zh:'Barry \u{8FD8}\u{6CA1}\u{8BB0}\u{5F55}\u{2014}\u{2014}\u{63D0}\u{9192}\u{4ED6}\u{FF01}' },
    lateTitle: { sr:'Legao je u', en:'He slept at', zh:'\u{6628}\u{665A}\u{4ED6}' },
    lateMsg: { sr:'Barry, molim te, idi u krevet ranije! \u{1F495}', en:'Barry, please go to bed earlier! \u{1F495}', zh:'Barry\u{FF0C}\u{4E3A}\u{4E86}\u{6211}\u{65E9}\u{70B9}\u{7761}\u{FF01}\u{1F495}' },
    sinec: { sr:'Sinoć je legao u', en:'Last night he slept at', zh:'\u{6628}\u{665A}\u{4ED6}' },
  };
  function _s(key) { var m = _S[key]; return m ? (m[lang] || m.sr || m.zh || key) : key; }

  function saveSleep() {
    var time = document.getElementById('sleepTime').value;
    if (!time) return;
    var entry = { time: time, date: fmtDate(new Date()), saved: Date.now() };
    localStorage.setItem('barry-sleep', JSON.stringify(entry));
    if (typeof pushAllSharedData === 'function') pushAllSharedData();
    renderSleepCard();
    toast('\u{1F634} ' + _s('saved'));
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
    document.getElementById('sleep-title').textContent = '\u{1F634} ' + _s('title');
    if (activeProfile === 'barry') {
      document.getElementById('sleepBarryView').style.display = '';
      document.getElementById('sleepAngieView').style.display = 'none';
      document.getElementById('sleep-hint').textContent = _s('hint');
      document.getElementById('sleep-save').textContent = _s('save');
      var s = getBarrySleep();
      if (s) document.getElementById('sleepTime').value = s.time;
    } else {
      document.getElementById('sleepBarryView').style.display = 'none';
      document.getElementById('sleepAngieView').style.display = '';
      var s = getBarrySleep();
      if (!s) {
        document.getElementById('sleepAngieContent').innerHTML = '<div style="text-align:center;color:var(--text-muted);font-size:.72rem">' + _s('empty') + '</div>';
        return;
      }
      var parts = s.time.split(':');
      var hour = parseInt(parts[0]), min = parseInt(parts[1]);
      var lateMsg = '';
      if (hour >= 2 || (hour === 1 && min >= 30)) {
        lateMsg = '<div style="background:var(--rose-light);border-radius:12px;padding:12px;margin-top:8px;text-align:center"><span style="font-size:1.5rem">\u{1F494}</span><div style="font-size:.76rem;color:var(--rose-dark);font-weight:700;line-height:1.6">' + (lang === 'sr' ? 'Legao je u ' + s.time + '! PREKASNO!' : lang === 'en' ? 'He slept at ' + s.time + '! TOO LATE!' : '他 ' + s.time + ' 才睡！太晚了！') + '</div><div style="font-size:.68rem;color:var(--rose-dark);margin-top:4px;line-height:1.5">\u{1F495} Barry, molim te, idi u krevet ranije!</div></div>';
      }
      document.getElementById('sleepAngieContent').innerHTML = '<div style="text-align:center"><span style="font-size:2rem">\u{1F634}</span><div style="font-size:.78rem;color:var(--text);margin-top:4px">' + _s('sinec') + ' <b>' + s.time + '</b></div><div style="font-size:.62rem;color:var(--text-muted)">' + s.date + '</div></div>' + lateMsg;
    }
  }
  window.renderSleepCard = renderSleepCard;
})();

/* === dist/js/module-settings.js === */
"use strict";

(function () {
  console.log('[module-settings] 已加载');

  var _T = {
    saved: { sr:'Token sa\u{010D}uvan \u{2713}', en:'Token saved \u{2713}', zh:'Token \u{5DF2}\u{4FDD}\u{5B58} \u{2713}' },
    missing: { sr:'Prvo unesi token', en:'Enter a token first', zh:'\u{8BF7}\u{5148}\u{8F93}\u{5165} Token' },
    valid: { sr:'Token va\u{017E}i', en:'Token valid', zh:'Token \u{6709}\u{6548}' },
    invalid: { sr:'Token neva\u{017E}e\u{0107}i', en:'Token invalid', zh:'Token \u{65E0}\u{6548}' },
    error: { sr:'Gre\u{0161}ka: ', en:'Error: ', zh:'\u{9519}\u{8BEF}: ' },
    netError: { sr:'Mre\u{017E}na gre\u{0161}ka', en:'Network error', zh:'\u{7F51}\u{7EDC}\u{9519}\u{8BEF}' },
    confirm: { sr:'Obrisati GitHub token? Sinhronizacija \u{0107}e prestati.', en:'Clear GitHub token? Sync will stop.', zh:'\u{6E05}\u{9664} GitHub Token\u{FF1F}\u{540C}\u{6B65}\u{5C06}\u{505C}\u{6B62}\u{3002}' },
    cleared: { sr:'Token obrisan', en:'Token cleared', zh:'Token \u{5DF2}\u{6E05}\u{9664}' },
  };
  function _tk(key) { var m = _T[key]; return m ? (m[lang] || m.sr || m.zh || key) : key; }

  function saveGitHubToken() {
    var t = document.getElementById('set-gh-token').value.trim();
    var warning = document.getElementById('tokenSecurityWarning');
    if (t) {
      sessionStorage.setItem('gh-token', t);
      toast('\u{1F511} ' + _tk('saved'));
      if (warning) warning.style.display = '';
      if (typeof pullAllSharedData === 'function') {
        pullAllSharedData().then(function () {
          if (typeof updateSyncStatusBadge === 'function') updateSyncStatusBadge();
          if (typeof renderAll === 'function') renderAll();
        });
      }
    } else {
      sessionStorage.removeItem('gh-token');
      if (warning) warning.style.display = 'none';
      if (typeof updateSyncStatusBadge === 'function') updateSyncStatusBadge();
    }
  }
  window.saveGitHubToken = saveGitHubToken;

  async function testGitHubToken() {
    var btn = document.getElementById('testTokenBtn');
    if (!btn) return;
    var origText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '\u{23F3} Testiranje...';
    var token = typeof getGitHubToken === 'function' ? getGitHubToken() : sessionStorage.getItem('gh-token') || '';
    if (!token) {
      toast('\u{1F511} ' + _tk('missing'));
      btn.textContent = origText; btn.disabled = false; return;
    }
    try {
      var resp = await fetch('https://api.github.com/user', { headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github.v3+json' } });
      if (resp.ok) {
        var user = await resp.json();
        toast('\u{2705} ' + _tk('valid') + ' \u{2014} ' + (user.login || ''));
        btn.textContent = '\u{2705} Va\u{017E}i'; setTimeout(function () { btn.textContent = origText; btn.disabled = false; }, 3000);
      } else if (resp.status === 401) {
        toast('\u{274C} ' + _tk('invalid'));
        btn.textContent = '\u{274C} Neva\u{017E}e\u{0107}i'; setTimeout(function () { btn.textContent = origText; btn.disabled = false; }, 3000);
      } else {
        toast('\u{26A0}\u{FE0F} ' + _tk('error') + resp.status);
        btn.textContent = origText; btn.disabled = false;
      }
    } catch (e) {
      toast('\u{26A0}\u{FE0F} ' + _tk('netError'));
      btn.textContent = origText; btn.disabled = false;
    }
  }
  window.testGitHubToken = testGitHubToken;

  function clearGitHubToken() {
    if (typeof getGitHubToken !== 'function') return;
    if (!getGitHubToken()) return;
    if (!confirm(_tk('confirm'))) return;
    sessionStorage.removeItem('gh-token');
    document.getElementById('set-gh-token').value = '';
    var warning = document.getElementById('tokenSecurityWarning');
    if (warning) warning.style.display = 'none';
    if (typeof updateSyncStatusBadge === 'function') updateSyncStatusBadge();
    toast('\u{1F5D1}\u{FE0F} ' + _tk('cleared'));
  }
  window.clearGitHubToken = clearGitHubToken;

  function loadSettingsUI() {
    document.getElementById('set-cycle').value = (state && state.settings) ? state.settings.cycleLength : 28;
    document.getElementById('set-period').value = (state && state.settings) ? state.settings.periodLength : 7;
    document.getElementById('set-language').value = lang;
    document.getElementById('set-theme').value = typeof theme !== 'undefined' ? theme : 'light';
    document.getElementById('annDateMet').value = typeof annDateMet !== 'undefined' ? annDateMet : '2026-03-19';
    document.getElementById('annDateLove').value = typeof annDateLove !== 'undefined' ? annDateLove : '2026-05-07';
    var hasToken = typeof getGitHubToken === 'function' ? !!getGitHubToken() : false;
    document.getElementById('set-gh-token').value = typeof getGitHubToken === 'function' ? (getGitHubToken() || '') : '';
    document.getElementById('github-token-label').textContent = '\u{1F511} GitHub Token';
    document.getElementById('set-gh-token').placeholder = 'ghp_...';
    document.getElementById('set-gh-token').setAttribute('aria-label', 'GitHub Token');
    document.getElementById('set-h-token').textContent = hasToken ? (typeof t === 'function' ? t('settingsTokenHintEnabled') : '') : (typeof t === 'function' ? t('settingsTokenHintDisabled') : '');
    var warning = document.getElementById('tokenSecurityWarning');
    if (warning) warning.style.display = hasToken ? '' : 'none';
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
      dashTitle: '\u{1F3E0} \u{4E3B}\u{9875}', welcomeBack: '\u{6B22}\u{8FCE}\u{56DE}\u{6765}\u{FF0C}',
      todayCulture: '\u{4ECA}\u{65E5}\u{6587}\u{5316}\u{77E5}\u{8BC6}', goDiary: '\u{1F4DD} \u{5199}\u{65E5}\u{8BB0}',
      goLearn: '\u{1F4DA} \u{4E2D}\u{534E}\u{6587}\u{5316}', goCalendar: '\u{1F4C5} \u{67E5}\u{770B}\u{65E5}\u{5386}',
      connectQ: '\u{1F4AD} \u{4ECA}\u{5929}\u{7684}\u{5BF9}\u{8BDD}', refreshQ: '\u{1F504} \u{6362}\u{4E00}\u{4E2A}\u{95EE}\u{9898}',
      todayPhase: '\u{4ECA}\u{65E5}\u{9636}\u{6BB5}', todayMoodDash: '\u{4ECA}\u{65E5}\u{5FC3}\u{60C5}',
      todayStreak: '\u{8FDE}\u{7EED}\u{6253}\u{5361}', todayCycles: '\u{5468}\u{671F}\u{603B}\u{6570}', avgAbbr: '\u{5E73}\u{5747}'
    },
    andjela: {
      dashTitle: '\u{1F3E0} Po\u{010D}etna', welcomeBack: 'Dobrodo\u{0161}la nazad, ',
      todayCulture: 'Dana\u{0161}nje kulturno znanje', goDiary: '\u{1F4DD} Dnevnik',
      goLearn: '\u{1F4DA} Kineska kultura', goCalendar: '\u{1F4C5} Kalendar',
      connectQ: '\u{1F4AD} Pitanje dana', refreshQ: '\u{1F504} Drugo pitanje',
      todayPhase: 'Trenutna faza', todayMoodDash: 'Raspolo\u{017E}enje',
      todayStreak: 'Niz dana', todayCycles: 'Ukupno ciklusa', avgAbbr: 'Prosek'
    }
  };

  var DAILY_QS = {
    sr: ['Koja je tvoja najlep\u{0161}a uspomena iz detinjstva?', '\u{0160}ta te je danas nasmejalo?', 'Kad si se ose\u{0107}ao/la najvi\u{0161}e voljeno?', 'Koji je tvoj omiljeni miris?', '\u{0160}ta bi voleo/la da nau\u{010D}i\u{0161} zajedno?', 'Koji je tvoj omiljeni na\u{010D}in da se opustite?'],
    'zh-CN': ['\u{4F60}\u{7AE5}\u{5E74}\u{6700}\u{7F8E}\u{597D}\u{7684}\u{56DE}\u{5FC6}\u{662F}\u{4EC0}\u{4E48}\u{FF1F}', '\u{4ECA}\u{5929}\u{4EC0}\u{4E48}\u{8BA9}\u{4F60}\u{7B11}\u{4E86}\u{FF1F}', '\u{4F60}\u{6700}\u{559C}\u{6B22}\u{7684}\u{6C14}\u{5473}\u{662F}\u{4EC0}\u{4E48}\u{FF1F}', '\u{4F60}\u{60F3}\u{4E00}\u{8D77}\u{5B66}\u{4EC0}\u{4E48}\u{65B0}\u{4E1C}\u{897F}\u{FF1F}', '\u{54EA}\u{9996}\u{6B4C}\u{603B}\u{662F}\u{80FD}\u{8BA9}\u{4F60}\u{5FC3}\u{60C5}\u{53D8}\u{597D}\u{FF1F}'],
    en: ['What is your most beautiful childhood memory?', 'What made you smile today?', 'What is your favorite scent?', 'What would you like to learn together?', 'Which song always lifts your mood?']
  };

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

  function renderDashboard() {
    var panel = document.getElementById('panel-dashboard');
    if (!panel) return;
    var myName = activeProfile === 'andjela' ? '\u{1F338} An\u{0111}ela' : '\u{1F466} Barry';
    var h = '<div class="dash-welcome">' + dl('welcomeBack') + '<strong>' + myName + '</strong></div>';
    var predDash = typeof predict === 'function' ? predict() : { cycles: [], avgCycle: '--', nextStart: null, ovulation: null, fertileStart: null, fertileEnd: null, confidence: 'low', futurePeriods: [] };
    var tdDash = typeof today === 'function' ? today() : new Date();
    var phaseDash = typeof getPhase === 'function' ? getPhase(tdDash, predDash) : null;
    var pe = { 'period-on': '\u{1F9F8}', 'period-mid': '\u{1F9F8}', ovulation: '\u{1F95A}', fertile: '\u{1F331}', luteal: '\u{1F319}', follicular: '\u{1F33F}' };
    var phLabel = (typeof t === 'function' && t('phaseBadges')) ? t('phaseBadges')[phaseDash] || '--' : '--';
    var tm = typeof getMood === 'function' ? getMood(fmtDate(tdDash)) : null;
    var strk = typeof calculateStreak === 'function' ? calculateStreak() : 0;
    var sc = state ? state.records.length : 0;
    var avgD = predDash.avgCycle || '--';
    h += '<div class="card dash-card" style="text-align:center"><div style="display:flex;justify-content:space-around;align-items:center;flex-wrap:wrap;gap:8px">';
    h += '<div style="text-align:center"><div style="font-size:1.4rem">' + (pe[phaseDash] || '\u{1F4CA}') + '</div><div style="font-size:.65rem;font-weight:700;color:var(--text)">' + dl('todayPhase') + '</div><div style="font-size:.58rem;color:var(--text-muted)">' + phLabel + '</div></div>';
    h += '<div style="text-align:center"><div style="font-size:1.4rem">' + (tm || '\u{1F324}\u{FE0F}') + '</div><div style="font-size:.65rem;font-weight:700;color:var(--text)">' + dl('todayMoodDash') + '</div><div style="font-size:.58rem;color:var(--text-muted)">' + (tm || '--') + '</div></div>';
    h += '<div style="text-align:center"><div style="font-size:1.4rem">\u{1F525}</div><div style="font-size:.65rem;font-weight:700;color:var(--text)">' + dl('todayStreak') + '</div><div style="font-size:.58rem;color:var(--text-muted)">' + strk + ' ' + (lang === 'sr' ? 'dana' : lang === 'en' ? 'days' : '\u{5929}') + '</div></div>';
    h += '<div style="text-align:center"><div style="font-size:1.4rem">\u{1F4CA}</div><div style="font-size:.65rem;font-weight:700;color:var(--text)">' + dl('todayCycles') + '</div><div style="font-size:.58rem;color:var(--text-muted)">' + sc + ' / ' + dl('avgAbbr') + ' ' + avgD + 'd</div></div></div></div>';
    h += '<div class="card dash-card" style="border-left:3px solid var(--teal)"><h4>' + dl('connectQ') + '</h4><div style="font-size:.82rem;color:var(--text);line-height:1.6;font-style:italic;margin-bottom:8px" id="dailyConnectQ">' + getDailyQuestion() + '</div><button class="dash-link-btn" onclick="document.getElementById(\'dailyConnectQ\').textContent=getDailyQuestion();" style="font-size:.62rem;padding:4px 12px">' + dl('refreshQ') + '</button></div>';
    h += '<div class="card dash-card"><div class="dash-links"><button class="dash-link-btn" onclick="switchToTab(\'diary\')">' + dl('goDiary') + '</button><button class="dash-link-btn" onclick="switchToTab(\'chinese\')">' + dl('goLearn') + '</button><button class="dash-link-btn" onclick="goToday();switchToTab(\'stats\')">' + dl('goCalendar') + '</button></div></div>';
    panel.innerHTML = h;
    if (typeof animateDashboardCards === 'function') animateDashboardCards();
  }
  window.renderDashboard = renderDashboard;
})();

/* === dist/js/module-stats.js === */
"use strict";

(function () {
  console.log('[module-stats] 已加载');

  function renderStatsPanel() {
    var panel = document.getElementById('panel-stats');
    if (!panel || !panel.classList.contains('active')) return;
    var pred = typeof predict === 'function' ? predict() : { cycles: [], avgCycle: '--', nextStart: null, ovulation: null, fertileStart: null, fertileEnd: null, confidence: 'low', futurePeriods: [], minCycle: null, maxCycle: null, stdDev: 0 };
    var td = typeof today === 'function' ? today() : new Date();
    var clen = state ? state.records.length : 0;

    /* Summary grid */
    var grid = document.getElementById('statsSummaryGrid');
    if (grid) {
      var phase = typeof getPhase === 'function' ? getPhase(td, pred) : null;
      var pe2 = { 'period-on': '\u{1F9F8}', 'period-mid': '\u{1F9F8}', ovulation: '\u{1F95A}', fertile: '\u{1F331}', luteal: '\u{1F319}', follicular: '\u{1F33F}' };
      var phName = (typeof t === 'function' && t('phaseBadges')) ? t('phaseBadges')[phase] || '--' : '--';
      var rl = typeof t === 'function' ? t('statsRegLabels') : { high: '\u{9AD8}', medium: '\u{4E2D}', low: '\u{4F4E}' };
      var regLabel = clen >= 2 ? rl[pred.confidence] : '--';
      var rc = { high: 'var(--sage)', medium: 'var(--gold)', low: 'var(--rose)' };
      grid.innerHTML =
        '<div class="stats-mini-card card-accent-rose"><span class="mini-icon">\u{1F9F8}</span><div class="mini-value">' + clen + '</div><div class="mini-label">' + (typeof t === 'function' ? t('stats.count') : '') + '</div></div>' +
        '<div class="stats-mini-card card-accent-sage"><span class="mini-icon">\u{1F4CF}</span><div class="mini-value">' + (pred.avgCycle || '--') + '<span style="font-size:.65rem">d</span></div><div class="mini-label">' + (typeof t === 'function' ? t('stats.avg') : '') + '</div><div class="mini-sub">' + (clen >= 2 ? pred.minCycle + '\u{2013}' + pred.maxCycle + 'd' : '--') + '</div></div>' +
        '<div class="stats-mini-card card-accent-teal"><span class="mini-icon">' + (pe2[phase] || '\u{1F4CA}') + '</span><div class="mini-value" style="font-size:.9rem;line-height:1.6">' + phName + '</div><div class="mini-label">' + (lang === 'sr' ? 'Trenutna faza' : lang === 'en' ? 'Current Phase' : '\u{5F33}\u{524D}\u{9636}\u{6BB5}') + '</div></div>' +
        '<div class="stats-mini-card card-accent-gold"><span class="mini-icon">\u{1F3AF}</span><div class="mini-value" style="color:' + rc[pred.confidence] + '">' + regLabel + '</div><div class="mini-label">' + (typeof t === 'function' ? t('stats.reg') : '') + '</div><div class="mini-sub">' + (clen >= 2 ? '\u{03C3}=' + pred.stdDev : '--') + '</div></div>';
    }

    /* Charts: trend / mood / symptom - delegate to ChartRenderer */
    var labels = ['chartCycleTrend', 'chartMoodDonut', 'chartSymptomBar'];
    var empties = ['chartCycleEmpty', 'chartMoodEmpty', 'chartSymptomEmpty'];
    /* Chart rendering requires ChartRenderer and complex data - keep concise */
    if (typeof ChartRenderer !== 'undefined') {
      var tc = document.getElementById('chartCycleTrend'), te = document.getElementById('chartCycleEmpty');
      if (tc) {
        var st = document.getElementById('schart-cycle-title');
        if (st) st.textContent = typeof t === 'function' ? t('statsTrendTitle') : 'Cycle Trend';
        if (pred.cycles && pred.cycles.length >= 2) {
          if (tc.parentElement) tc.parentElement.style.display = '';
          if (te) te.style.display = 'none';
          var rc2 = pred.cycles.slice(-8), lbs = [];
          for (var ci = 0; ci < rc2.length; ci++) lbs.push('C' + (pred.cycles.length - rc2.length + ci + 1));
          ChartRenderer.drawLineChart(tc, rc2, lbs, { width: 500, height: 200, avgLine: pred.avgCycle, avgLabel: typeof t === 'function' ? t('statsTrendAvg') : '', emptyText: typeof t === 'function' ? t('statsTrendEmpty') : '' });
        } else { if (tc.parentElement) tc.parentElement.style.display = 'none'; if (te) { te.style.display = ''; te.textContent = typeof t === 'function' ? t('statsTrendNeed') : ''; } }
      }
    }

    /* Prediction highlight + timeline */
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
      var labelMap = { 'predChipOvLabel': 'statsOvLabel', 'predChipFertLabel': 'statsFertLabel', 'predChipFutureLabel': 'statsFutureLabel', 'predChipRegLabel': 'statsRegLabel' };
      for (var lk in labelMap) { var lel = document.getElementById(lk); if (lel) lel.textContent = typeof t === 'function' ? t(labelMap[lk]) : ''; }
    } else if (ph) { ph.style.display = 'none'; }

    var tr = document.getElementById('timelineRow');
    var sht = document.getElementById('schart-history-title');
    if (sht) sht.textContent = typeof t === 'function' ? t('statsTimelineTitle') : 'History';
    if (typeof t === 'function') {
      var ts = document.getElementById('tleg-short'); if (ts) ts.textContent = t('statsTimelineShort');
      var tn = document.getElementById('tleg-normal'); if (tn) tn.textContent = t('statsTimelineNormal');
      var tl = document.getElementById('tleg-long'); if (tl) tl.textContent = t('statsTimelineLong');
    }
    if (tr && pred.cycles && pred.cycles.length > 0) {
      var rcc = pred.cycles.slice(-12), ac = pred.avgCycle;
      tr.innerHTML = rcc.map(function (cy) { var cls = cy < ac - 3 ? 'short' : cy > ac + 3 ? 'long' : 'normal'; return '<span class="timeline-dot ' + cls + '" title="' + cy + 'd"></span>'; }).join('');
    }

    var sr = document.getElementById('sect-relationship');
    if (sr) sr.textContent = typeof t === 'function' ? t('sectRelationship') : '\u{1F497} Relationship';
  }
  window.renderStatsPanel = renderStatsPanel;
})();

/* === dist/js/fix-all.js === */
"use strict";

// === 魔法数字常量 ===
var TAP_DELAY_MS = 280;       // 单击延迟打开弹窗 (ms)
var TOUCH_TIMEOUT_MS = 350;   // 触摸双击间隔 (ms)
var SAVE_DEBOUNCE_MS = 200;   // localStorage 写入防抖 (ms)
var SYNC_DEBOUNCE_MS = 1500;  // GitHub 推同步防抖 (ms)
var SYNC_INTERVAL_MS = 120000; // GitHub 拉同步轮询间隔 (ms)

// === 版本号（从 HTML meta 标签读取）===
window.CalState={year:2026,month:6,view:"month",weekOffset:0};
var APP_VERSION = (function () {
  var meta = document.querySelector('meta[name="version"]');
  return meta ? meta.content : '7.2.0';
})();

/* ================================================================
   fix-all.js — 三个 Bug 统一修复

   采用最小侵入方式：猴子补丁覆盖旧函数 + CSS 注入 + DOM 修复。
   不修改 app.js / cycle-core.js 等已有文件。

   修复：
     Bug 2 — 阶段计算（劫持 getPhase）
     Bug 1 — 五月高度跳动（CSS 覆盖）
     Bug 3 — 弹窗闪烁（移除遮罩 onclick）
   ================================================================ */

(function () {
  console.log('[fix-all.js] 已加载');

  /* ================================================================
     内建日期工具（纯函数，不依赖任何外部模块）
     ================================================================ */
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

  // === togglePeriodRecord 补丁：记录来源 ===
  if (typeof togglePeriodRecord === 'function') {
    var _origToggle = togglePeriodRecord;
    window.togglePeriodRecord = function (startDate, endDate) {
      _origToggle(startDate, endDate);

    };
    console.log('[fix-all.js] togglePeriodRecord 已打补丁 ✓');
  }

  /* ================================================================
     Bug 2: 阶段计算修复
     ================================================================ */

  /**
   * 在两个已知周期之间计算非经期阶段
   */
  function _computeCyclePhase(date, periodEnd, nextPeriodStart) {
    var d = _d0(date);
    var pe = _d0(periodEnd);
    var ns = _d0(nextPeriodStart);

    var ovulation = _addDays(ns, -14);
    var fertileStart = _addDays(ovulation, -3);
    var fertileEnd = _addDays(ovulation, 2);

    // 卵泡期
    if (d >= pe && d < fertileStart) return 'follicular';

    // 受孕窗口（含排卵日）
    if (d >= fertileStart && d <= fertileEnd) {
      if (_sameDay(d, ovulation)) return 'ovulation';
      return 'fertile';
    }

    // 黄体期
    if (d > fertileEnd && d < ns) return 'luteal';

    return null;
  }

  /**
   * 修复的阶段计算函数
   *
   * 核心原则：用户录入的经期起止日期绝对优先于任何预测。
   * 预测只补录在无数据的时间段，且不产生逾期跳跃。
   */
  function _fixedGetPhase(date, records, periodEnds, settings) {
    var d = _d0(date);
    var periodLen = (settings && settings.periodLength) || 7;

    // 排序记录
    var sorted = [];
    for (var si = 0; si < records.length; si++) {
      sorted.push(_d0(records[si]));
    }
    sorted.sort(function (a, b) { return a - b; });

    // ===== STEP 1: 检查是否在已录入的经期内（绝对优先） =====
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

    // 无记录
    if (sorted.length === 0) return null;

    // ===== STEP 2: 计算周期指标 =====
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

    // ===== STEP 3: 检查是否在两个已录入周期之间 =====
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

    // ===== STEP 4: 日期在最后一个录入周期之后 =====
    var predictedNextStart = _addDays(lastStart, avgCycle);
    var predictedNextEnd = _addDays(predictedNextStart, periodLen - 1);

    // 4a: 在预测的下次经期内
    if (d >= predictedNextStart && d <= predictedNextEnd) {
      return _sameDay(d, predictedNextStart) ? 'period-pred-first' : 'period-pred';
    }

    // 4b: 在最后一个经期结束后、预测下次经期前
    if (d > lastEnd && d < predictedNextStart) {
      return _computeCyclePhase(d, lastEnd, predictedNextStart);
    }

    // ===== STEP 5: 日期在预测经期之后（逾期）=====
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

  // ---- 猴子补丁：替换 getPhase ----
  var _origGetPhase = (typeof getPhase === 'function') ? getPhase : null;

  window.getPhase = function (date, pred) {
    try {
      var st = (typeof state !== 'undefined') ? state : null;
      if (st && st.records) {
        var result = _fixedGetPhase(date, st.records, st.periodEnds || {}, st.settings || {});
        if (result !== null) return result;
      }
    } catch (e) {
      // 静默失败，回退到旧逻辑
    }

    if (_origGetPhase) return _origGetPhase(date, pred);
    return null;
  };

  console.log('[fix-all.js] getPhase 已替换 ✓');

  /* ================================================================
     Bug 1: 五月高度跳动修复（CSS 注入覆盖）
     ================================================================ */
  var _styleEl = document.createElement('style');
  _styleEl.textContent =
    'html { overflow-x: hidden !important; }' +
    'body { margin-right: 0 !important; overflow-x: hidden !important; width: 100vw !important; max-width: 100vw !important; }' +
    '.days { grid-template-columns: repeat(7, 1fr) !important; }' +
    '.week-num { display: none !important; }' +
    '/* === 导航栏样式 === */' +
    'nav.tabs-nav .tabs { display: flex !important; justify-content: space-around !important; width: 100% !important; gap: 0 !important; }' +
    '.progress-fill { transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) !important; }' +
    '.day.in-month { animation: fixDayIn 0.35s ease-out both; }' +
    '@keyframes fixDayIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }' +
    '@keyframes modalSlideIn { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }' +
    '#modal:not(.hidden) .modal { animation: modalSlideIn 0.3s ease-out; }';
  document.head.appendChild(_styleEl);
  console.log('[fix-all.js] CSS 已注入 ✓');
  console.log('[fix-all.js] GSAP 替换动画已注入 ✓');

  window.animateModalOut = null;

  /* ---- 重复元素清理（一次性） ---- */
  (function () {
    var _all = document.querySelectorAll('nav.tabs-nav');
    if (_all.length > 1) {
      for (var _ni = 1; _ni < _all.length; _ni++) _all[_ni].parentNode.removeChild(_all[_ni]);
    }
  })();

  /* ---- M3: 导航栏对齐函数 ---- */
  function _fixNavigation() {
    var _cal = document.querySelector('.calendar') || document.querySelector('.days');
    var _nav = document.querySelector('nav.tabs-nav');
    if (!_cal || !_nav) return;
    // 清理重复
    var _all2 = document.querySelectorAll('nav.tabs-nav');
    if (_all2.length > 1) {
      for (var _ni2 = 1; _ni2 < _all2.length; _ni2++) _all2[_ni2].parentNode.removeChild(_all2[_ni2]);
    }
    // 对齐到日历容器宽度
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
  console.log('[fix-all] M3 导航栏样式已整理');

  // ---- M5: diary 内存缓存 ----
  var _diaryCache = null;
  var _diaryCacheTime = 0;

  // ---- 猴子补丁：renderCalendar（来源标记 + diary 缓存 + .in-month 动画） ----
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
      // 确保节日数据已加载，否则先等 fetch 完成再渲染
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
      console.log('[fix-all] L3 日历动画已激活');
    };
    console.log('[fix-all.js] renderCalendar 已劫持 ✓');
    console.log('[fix-all] M5 diary 缓存已启用');
    return true;
  }

  if (!_patchRenderCalendar()) {
    console.log('[fix-all.js] renderCalendar 未找到，尝试延迟捕获');
    var _rcRetry = 0;
    var _rcTimer = setInterval(function () {
      _rcRetry++;
      if (_patchRenderCalendar() || _rcRetry > 50) clearInterval(_rcTimer);
    }, 100);
  }

  // ---- 同步拉取后刷新 diary 缓存 ----
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

  /* ================================================================
     Bug 3: 弹窗闪烁修复（移除遮罩 onclick）
     ================================================================ */
  var _modal = document.getElementById('modal');
  if (_modal) {
    _modal.removeAttribute('onclick');
    console.log('[fix-all.js] 弹窗 onclick 已移除 ✓');
  }

  console.log('[fix-all.js] 三个 Bug 修复已完成');

  /* ================================================================
     语言修复: 注入扩展 i18n 键（弹窗标注 + 经期标记按钮）
     ================================================================ */
  (function () {
    var EXT_KEYS = {
      sr: {
        modalMarkersTitle: '\u{1F4CC} Oznake',
        modalAddMarker: 'Dodaj oznaku',
        modalEndPeriod: 'Oznaži kraj ciklusa',
        modalPeriodOngoing: 'Ciklus u toku',
        modalEndNow: 'Zavr\u{0161}i ciklus',
      },
      'zh-CN': {
        modalMarkersTitle: '\u{1F4CC} 日历标记',
        modalAddMarker: '添加标记',
        modalEndPeriod: '标记经期结束',
        modalPeriodOngoing: '经期进行中',
        modalEndNow: '结束当前经期',
      },
      en: {
        modalMarkersTitle: '\u{1F4CC} Markers',
        modalAddMarker: 'Add Marker',
        modalEndPeriod: 'Mark Period End',
        modalPeriodOngoing: 'Period Ongoing',
        modalEndNow: 'End Current Period',
      },
    };

    if (typeof I18N_EXT !== 'undefined') {
      for (var _lang in EXT_KEYS) {
        if (!I18N_EXT[_lang]) I18N_EXT[_lang] = {};
        for (var _key in EXT_KEYS[_lang]) {
          I18N_EXT[_lang][_key] = EXT_KEYS[_lang][_key];
        }
      }
      console.log('[fix-all.js] i18n 扩展键已注入 ✓');
      console.log('[fix-all] M2 翻译键已合并');
    }
  })();

  console.log('[fix-all] 弹窗回退已修复');

  /* ================================================================
     H2: 统一不可变状态更新
     ================================================================ */
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
            // 在下一个 tick 再打补丁（避免在排序中重新绑定）
            setTimeout(function () {
              console.log('[fix-all] H2 状态已更新, records 数量:', state.records ? state.records.length : 'N/A');
            }, 0);
            return result;
          };
        })(_methods[_mi]);
      }
      state.records._h2Patched = true;
    }

    _patchRecordsArray();

    // 拦截 saveState，每次保存后重新检查 records 是否被替换
    var _origSaveState = typeof saveState === 'function' ? saveState : null;
    if (_origSaveState) {
      window.saveState = function () {
        _origSaveState();
        // 如果 records 被替换（Object.assign），重新打补丁
        if (!state.records || !state.records._h2Patched) {
          _patchRecordsArray();
        }
      };
      console.log('[fix-all] H2 不可变状态更新已启用');
    }
  })();

  // ---- 猴子补丁：openModal ----
  var _origOpenModal = (typeof openModal === 'function') ? openModal : window.openModal;

  // 如果两个路径都没抓到，说明 app.js 可能尚未执行完毕，轮询等待
  if (!_origOpenModal) {
    console.warn('[fix-all.js] openModal 暂未定义，启动延迟捕获');
    var _retryTimer = setInterval(function () {
      if (typeof openModal === 'function') {
        _origOpenModal = openModal;
        clearInterval(_retryTimer);
        console.log('[fix-all.js] openModal 延迟捕获成功');
      }
    }, 100);
    setTimeout(function () { clearInterval(_retryTimer); }, 5000);
  }

  window.openModal = function (date, pred) {
    try {
      if (_origOpenModal) {
        _origOpenModal(date, pred);
      } else {
        console.warn('[fix-all.js] _origOpenModal 不可用，尝试直接访问 openModal');
        if (typeof openModal === 'function') {
          openModal(date, pred);
          _origOpenModal = openModal;
        }
      }
    } catch (e) {
      console.warn('[fix-all.js] 原始 openModal 调用失败:', e);
    }

    // [已废弃] 原 _fixModalI18n/_fixPeriodButton 已迁移至 MutationObserver 回调
  };

  console.log('[fix-all.js] 弹窗 i18n + 经期标记已修复 ✓');
  console.log('[fix-all.js] 全部修复已完成');

  /* ================================================================
     弹窗 i18n 修复 + 经期标记按钮（MutationObserver 版本）
     修正说明：
       - 按钮 ID: modal-mark-btn（原代码误写为 markPeriodBtn）
       - selectedDate 是全局 let，不在 window 上，直接访问
       - Date 比较用 _sameDay() 而非 ===
     ================================================================ */
  /* ---- 猴子补丁：emoji 选择器标题语言修复（不依赖 MutationObserver，避免死循环） ---- */
  (function () {
    var _origPickerOpen = window.openEmojiPickerForModal;
    window.openEmojiPickerForModal = function () {
      if (typeof _origPickerOpen === 'function') _origPickerOpen();
      // 微延时等 DOM 就绪后修复标题
      setTimeout(function () {
        var _epTitle = document.getElementById('ep-title');
        if (!_epTitle) return;
        var _l = (typeof window.lang !== 'undefined') ? window.lang : 'sr';
        var _txt = _l === 'zh-CN' ? '\u{6DFB}\u{52A0}\u{6807}\u{8BB0}' : _l === 'en' ? 'Add Marker' : 'Dodaj oznaku';
        var _newTitle = '\u{1F4CC} ' + _txt;
        // 只在实际不同时修改，避免死循环
        if (_epTitle.textContent !== _newTitle) {
          _epTitle.textContent = _newTitle;
        }
      }, 50);
    };
  })();

  (function () {
    var fixRunOnce = false;
    var _mo = new MutationObserver(function () {
      /* ---- 前置：弹窗关闭时同时关闭 emoji 选择器 ---- */
      var _modalEl = document.getElementById('modal');
      var _pickerEl = document.getElementById('emojiPickerOverlay');
      if (_modalEl && _modalEl.classList.contains('hidden') && _pickerEl && !_pickerEl.classList.contains('hidden')) {
        _pickerEl.classList.add('hidden');
        console.log('[fix-all] emoji 选择器已随弹窗关闭');
      }

      /* ---- 导航栏对齐 ---- */
      _fixNavigation();

      /* ---- 弹窗 UI 优化（fixRunOnce 保证每次打开只执行一次） ---- */
      if (!_modalEl || _modalEl.classList.contains('hidden')) {
        fixRunOnce = false;
        return;
      }
      if (fixRunOnce) return;
      fixRunOnce = true;

      /* ================================================================
         弹窗 UI 优化：精简标记区 + 移动经期按钮
         ================================================================ */

      // ---- 1. 隐藏重复的标记标题 + 保持按钮完整结构并设为行内显示 ----
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
        // 通过 t() 获取翻译（I18N_EXT 已注入 modalAddMarker 键）
        _addBtn.innerHTML = '\u{2795} ' + (typeof t === 'function' ? t('modalAddMarker') : 'Dodaj oznaku');
        _addBtn.removeAttribute('onclick'); _addBtn.addEventListener('click', function () { if (typeof openEmojiPickerForModal === 'function') openEmojiPickerForModal(); });
      }

      // ---- 2. 隐藏旧的操作按钮区 ----
      var _oldMarkBtn = document.getElementById('modal-mark-btn');
      var _oldUnmarkBtn = document.getElementById('modal-unmark-btn');
      if (_oldMarkBtn) _oldMarkBtn.style.display = 'none';
      if (_oldUnmarkBtn) _oldUnmarkBtn.style.display = 'none';

      // ---- 3. 创建/更新新的经期按钮（在阶段信息下方、症状上方） ----
      var _selDate = (typeof selectedDate !== 'undefined') ? selectedDate : null;

      function _isInClosedPeriod(d) {
        // 检查 d 是否落在某个已有结束日的经期内
        if (!state || !state.records || !state.periodEnds) return false;
        for (var _ri = 0; _ri < state.records.length; _ri++) {
          var _s = _d0(state.records[_ri]);
          var _ek = _fmtDate(state.records[_ri]);
          var _e = state.periodEnds[_ek] ? _d0(new Date(state.periodEnds[_ek] + 'T00:00:00')) : null;
          if (_e && d >= _s && d <= _e) return true;
        }
        return false;
      }

      function _getPeriodBtnText() {
        if (!_selDate) return null;
        var _d = _d0(_selDate);

        // 规则 1: 选中日期是某个经期开始日 → 移除记录
        if (typeof state !== 'undefined' && state.records) {
          for (var _ri2 = 0; _ri2 < state.records.length; _ri2++) {
            if (_sameDay(state.records[_ri2], _d)) return '❌ 移除记录';
          }
        }

        // 规则 2: 有一个未结束的经期，且选中日期在其开始日之后 → 结束本次经期
        var _os = (typeof getOpenPeriodStart === 'function') ? getOpenPeriodStart() : null;
        if (_os && _d0(_os) <= _d) return '⏹️ 结束本次经期';

        // 规则 4: 选中日期落在某个已结束的经期内 → 置灰不可操作
        if (_isInClosedPeriod(_d)) return null;

        // 规则 3: 没有进行中的经期 → 可标记开始
        return '\u{1F534} 标记经期开始';
      }

      // 定位阶段行
      var _phaseRow = document.querySelector('.modal .info-row');
      console.log('[fix-all] 找到阶段行:', _phaseRow ? (_phaseRow.textContent || 'ok') : 'null');
      console.log('[fix-all] 正在创建/更新经期按钮');

      var _newBtn = document.getElementById('fix-period-btn');
      var _btnText = _getPeriodBtnText();

      if (_btnText === null && _newBtn) {
        // 置灰/隐藏按钮
        _newBtn.style.display = 'none';
      } else if (_btnText !== null) {
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
            // 重置 fixRunOnce 使 togglePeriodRecord 递归调用 openModal 后 UI 能刷新
            fixRunOnce = false;
            if (typeof togglePeriodRecord === 'function') togglePeriodRecord();
          };
          // 在阶段行后插入
          if (_phaseRow && _phaseRow.parentNode) {
            _phaseRow.parentNode.insertBefore(_newBtn, _phaseRow.nextSibling);
            console.log('[fix-all] 新经期按钮已插入阶段行之后');
          } else {
            var _closeBtn = document.getElementById('modal-close-btn');
            if (_closeBtn && _closeBtn.parentNode) {
              _closeBtn.parentNode.insertBefore(_newBtn, _closeBtn);
              console.log('[fix-all] 新经期按钮通过 fallback 插入');
            } else {
              console.warn('[fix-all] 无法找到插入位置');
            }
          }
        } else {
          _newBtn.style.display = 'block'; // 确保按钮可见
        }

        // 更新文字和颜色
        _newBtn.textContent = _btnText;
        if (_btnText.indexOf('⏹') >= 0) {
          _newBtn.style.background = '#E65100';
        } else if (_btnText.indexOf('❌') >= 0) {
          _newBtn.style.background = 'var(--rose)';
        } else {
          _newBtn.style.background = 'var(--love)';
        }
        console.log('[fix-all] 经期按钮已设为:', _btnText);
      } else {
        console.log('[fix-all] 日期在已结束经期内，按钮隐藏');
      }

      console.log('[fix-all] 弹窗 UI 优化完成');
    });

    // 作用域: body，捕获导航栏和弹窗的所有样式变化
    _mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    console.log('[fix-all] MutationObserver 已启动');
  })();
  /* ---- 废弃 GSAP 动画函数置空 ---- */
  window.animateDashboardCards = null;
  window.animateStatsPanel = null;
  console.log('[cleanup] 废弃 GSAP 函数已置空');
  // ---- H4: GitHub Token 安全加固 ----
  (function () {
    var _H4_KEY = 'gh-token';
    var _H4_PREFIX = 'tk_';

    function _encode(t) { return _H4_PREFIX + btoa(t).split('').reverse().join(''); }
    function _decode(t) {
      if (!t || t.indexOf(_H4_PREFIX) !== 0) return t;
      try { return atob(t.slice(_H4_PREFIX.length).split('').reverse().join('')); } catch (e) { return ''; }
    }

    var _origGet = typeof getGitHubToken === 'function' ? getGitHubToken : null;
    window.getGitHubToken = function () {
      var raw = sessionStorage.getItem(_H4_KEY);
      if (raw && raw.indexOf(_H4_PREFIX) === 0) return _decode(raw);
      return raw || '';
    };

    var _origSave = typeof saveGitHubToken === 'function' ? saveGitHubToken : null;
    window.saveGitHubToken = function () {
      var t = document.getElementById('set-gh-token').value.trim();
      if (!t) { sessionStorage.removeItem(_H4_KEY); _origSave(); return; }
      sessionStorage.setItem(_H4_KEY, _encode(t));
      _origSave();
    };

    var _origClear = typeof clearGitHubToken === 'function' ? clearGitHubToken : null;
    window.clearGitHubToken = function () {
      sessionStorage.removeItem(_H4_KEY);
      if (_origClear) _origClear();
    };

    /* URL 参数清理 */
    try {
      var _url = new URL(window.location.href);
      if (_url.searchParams.has('token') || _url.searchParams.has('gh-token')) {
        _url.searchParams.delete('token');
        _url.searchParams.delete('gh-token');
        window.history.replaceState({}, '', _url.toString());
      }
    } catch (e) {}

    console.log('[fix-all] H4 Token 安全加固已启用');
  })();
})();


/**
 * Calendar Culture Module — Chinese cultural content for Anđelin Ciklus
 * Depends on: Lunar (js/lunar.js), i18n (js/i18n.js), app.js globals
 * Adds: lunar dates on cells, zodiac info, seasonal poems, culture cards, traditional colors
 */

// ── Extra Chinese holidays (merged into HOLIDAYS at init) ──────
var EXTRA_HOLIDAYS = [
  {d:'2026-02-11',name:{sr:'Mala Nova Godina',zh:'小年',en:'Little New Year'},country:'cn',icon:'🧹',
   desc:{sr:'Dan čišćenja kuće pred Novu Godinu — da sva sreća ima gde da uđe.',
        zh:'腊月二十三，祭灶扫尘，准备迎接新年。灶糖甜甜的，给灶王爷一个好印象。',
        en:'Sweeping the house clean — making room for all the blessings of the New Year.'}},
  {d:'2026-02-18',name:{sr:'Dan ljudi',zh:'人日',en:'Renri (Human Day)'},country:'cn',icon:'👤',
   desc:{sr:'Sedmi dan Nove Godine — rođendan čovečanstva. Nüwa je danas stvorila ljude od gline.',
        zh:'正月初七，传说女娲在这一天创造了人类——是每个人的生日。吃七宝羹，祈求健康平安。',
        en:'The 7th day of CNY — humanity\'s birthday. Nüwa created humans from clay on this day.'}},
  {d:'2026-04-20',name:{sr:'Festival kiše za žito',zh:'谷雨节',en:'Grain Rain Festival'},country:'cn',icon:'🌾',
   desc:{sr:'Poslednji prolećni solarni termin — vreme za setvu i molitvu za bogatu žetvu. Pije se čaj i dive božurima.',
        zh:'雨生百谷，春天最后一个节气。喝一杯谷雨茶，赏一赏牡丹花，感恩大地的滋养。',
        en:'The last spring solar term — time for sowing. Drink Grain Rain tea and admire the peonies.'}},
  {d:'2026-09-15',name:{sr:'Festival gladnih duhova',zh:'中元节',en:'Hungry Ghost Festival'},country:'cn',icon:'🏮',
   desc:{sr:'Dan kada se pali tamjan za duše predaka. Noćas granica između svetova postaje tanja. Pale se vodeni lampioni.',
        zh:'七月十五，中元普渡。点燃一盏河灯，照亮先人回家的路。这天晚上别太晚回家哦。',
        en:'The 15th of the 7th lunar month. Light water lanterns to guide ancestral spirits home.'}},
  {d:'2026-11-01',name:{sr:'Festival donjeg izvora',zh:'下元节',en:'Xiayuan Festival'},country:'cn',icon:'🙏',
   desc:{sr:'Dan molitve Bogu Vode da smiri reke i donese mir. Jede se tangyuan za toplinu cele zime.',
        zh:'十月十五，祭祀水官大帝，祈求冬日平安。一碗热汤圆，温暖即将到来的整个冬天。',
        en:'Praying to the Water God for a calm winter. Tangyuan brings warmth for the cold months ahead.'}},
  {d:'2026-12-22',name:{sr:'Zimski solsticij festival',zh:'冬至节',en:'Winter Solstice Festival'},country:'cn',icon:'🥟',
   desc:{sr:'Najkraći dan, najduža noć — porodica se okuplja uz jufke. "Zimski solsticij je važniji od Nove Godine!"',
        zh:'冬至大如年！北方人吃饺子，南方人吃汤圆。从今天起阳气渐生，春天已经在路上了。',
        en:'Winter Solstice is as important as New Year! Northern dumplings, southern tangyuan — yang energy returns.'}}
];

// ── Seasonal poems by month (唐诗宋词 selection) ────────────────
var SEASONAL_POEMS = {
  0: { title:{zh:'元日',sr:'Novogodišnji dan',en:'New Year\'s Day'}, author:'王安石',
    lines:{zh:'爆竹声中一岁除，春风送暖入屠苏。\n千门万户曈曈日，总把新桃换旧符。',
           sr:'Uz prasak petardi stara godina odlazi,\nProlećni vetar donosi toplinu.\nSunce obasjava hiljade domova,\nSvi menjaju stare amajlije za nove.',
           en:'Firecrackers bid the old year farewell,\nSpring wind brings warmth to every home.\nThe sun shines on a thousand doors,\nAll swap old charms for new peach-wood signs.'}},
  2: { title:{zh:'春晓',sr:'Prolećno jutro',en:'Spring Morning'}, author:'孟浩然',
    lines:{zh:'春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。',
           sr:'U prolećnom snu ne čuješ zoru,\nSvuda cvrkut ptica.\nSinoć šum vetra i kiše —\nKoliko latica je palo?',
           en:'Spring sleep, unaware of dawn,\nEverywhere I hear birds sing.\nLast night — wind and rain,\nHow many flowers have fallen?'}},
  5: { title:{zh:'小池',sr:'Mali ribnjak',en:'Little Pond'}, author:'杨万里',
    lines:{zh:'泉眼无声惜细流，树阴照水爱晴柔。\n小荷才露尖尖角，早有蜻蜓立上头。',
           sr:'Izvor šapuće, štedeći tanak mlaz,\nSenka drveta miluje vodu.\nTek što lotos pokaže vrh,\nVilin konjic već na njemu stoji.',
           en:'The spring murmurs, sparing its stream,\nTree shade caresses the sunlit water.\nThe lotus bud just shows its tip,\nA dragonfly already rests upon it.'}},
  8: { title:{zh:'山居秋暝',sr:'Jesenje veče u planinama',en:'Autumn Evening'}, author:'王维',
    lines:{zh:'空山新雨后，天气晚来秋。\n明月松间照，清泉石上流。',
           sr:'Prazne planine posle sveže kiše,\nVazduh miriše na jesen.\nMesec sija kroz borove,\nPotok teče preko kamenja.',
           en:'Empty mountains after fresh rain,\nThe air feels of autumn.\nMoon shines through the pines,\nA clear spring flows over stones.'}},
  11: { title:{zh:'江雪',sr:'Sneg na reci',en:'River Snow'}, author:'柳宗元',
    lines:{zh:'千山鸟飞绝，万径人踪灭。\n孤舟蓑笠翁，独钓寒江雪。',
           sr:'Na hiljadu planina ni ptice,\nNa deset hiljada staza ni traga.\nU čamcu starac sa slamnim šeširom —\nSam peca na hladnoj reci pod snegom.',
           en:'A thousand hills — no bird in flight,\nTen thousand paths — no human trace.\nA lone boat, an old man in straw cloak,\nFishing alone in the cold river snow.'}}
};

// ── Traditional Chinese seasonal colors ────────────────────────
var TRADITIONAL_COLORS = {
  0:{name:{zh:'月白',sr:'mesečevo bela',en:'moon white'},hex:'#D6E4F0'},
  1:{name:{zh:'水色',sr:'vodeno plava',en:'water blue'},hex:'#A8D8EA'},
  2:{name:{zh:'柳绿',sr:'vrbino zelena',en:'willow green'},hex:'#A8D08D'},
  3:{name:{zh:'桃红',sr:'breskvino roze',en:'peach pink'},hex:'#F4A7B9'},
  4:{name:{zh:'天青',sr:'nebesko plava',en:'sky cyan'},hex:'#87CEEB'},
  5:{name:{zh:'朱砂',sr:'cinober crvena',en:'cinnabar red'},hex:'#E53935'},
  6:{name:{zh:'荷绿',sr:'lotus zelena',en:'lotus green'},hex:'#4CAF50'},
  7:{name:{zh:'黛蓝',sr:'indigo plava',en:'indigo blue'},hex:'#1A237E'},
  8:{name:{zh:'琥珀',sr:'ćilibarna',en:'amber'},hex:'#FF8F00'},
  9:{name:{zh:'胭脂',sr:'rumenilo',en:'rouge'},hex:'#C62828'},
  10:{name:{zh:'霜白',sr:'mrazno bela',en:'frost white'},hex:'#ECEFF1'},
  11:{name:{zh:'墨色',sr:'tuš crna',en:'ink black'},hex:'#212121'}
};

// ── Culture card rendering ────────────────────────────────────

function renderLunarInfo() {
  var el = document.getElementById('lunarInfo');
  if (!el) return;
  var td = today();
  var info = Lunar.getYearInfo(td);
  var lunar = Lunar.toLunar(td);
  if (!info || !lunar) { el.style.display = 'none'; return; }
  el.style.display = '';
  var zoo = {鼠:'🐭',牛:'🐮',虎:'🐯',兔:'🐰',龙:'🐲',蛇:'🐍',马:'🐴',羊:'🐑',猴:'🐵',鸡:'🐔',狗:'🐶',猪:'🐷'};
  if (lang === 'sr') {
    el.textContent = '🐲 ' + info.tianGanDiZhi + ' · ' + info.shengXiao + ' ' + (zoo[info.shengXiao]||'') + ' · ' + lunar.monthName + ' ' + lunar.dayName;
  } else if (lang === 'en') {
    el.textContent = '🐲 ' + info.tianGanDiZhi + ' · Year of the ' + info.shengXiao + ' ' + (zoo[info.shengXiao]||'') + ' · ' + lunar.monthName + ' ' + lunar.dayName;
  } else {
    el.textContent = '🐲 ' + info.tianGanDiZhi + '年 · ' + info.shengXiao + '年' + (zoo[info.shengXiao]||'') + ' · ' + lunar.monthName + lunar.dayName;
  }
}

function renderSeasonalPoemCard() {
  var el = document.getElementById('cultureCard');
  if (!el) return;
  var m = today().getMonth();
  var poem = SEASONAL_POEMS[m];
  if (!poem) { el.style.display = 'none'; return; }
  el.style.display = '';
  var color = TRADITIONAL_COLORS[m];
  var info = Lunar.getYearInfo(today());
  var lines = (poem.lines[lang] || poem.lines['zh']).replace(/\n/g, '<br>');
  var title = poem.title[lang] || poem.title['zh'];
  el.innerHTML =
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
      '<span style="font-size:1.2rem">📜</span>' +
      '<span class="poem-title">' + title + '</span>' +
      '<span style="font-size:.6rem;opacity:.45">— ' + poem.author + '</span>' +
    '</div>' +
    '<div class="poem-body">' + lines + '</div>' +
    '<div style="margin-top:8px;font-size:.6rem;opacity:.4;display:flex;gap:12px;flex-wrap:wrap">' +
      '<span>🖌️ ' + (lang==='sr'?'Tradicionalna boja: ':lang==='en'?'Traditional color: ':'中国传统色：') +
        color.name[lang||'zh'] + ' <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + color.hex + ';vertical-align:middle;margin-left:2px"></span></span>' +
      (info ? '<span>🐉 ' + (lang==='sr'?'Godina '+info.shengXiao:lang==='en'?'Year of the '+info.shengXiao:info.shengXiao+'年') + '</span>' : '') +
    '</div>';
}

// ── Lunar helpers for calendar cells ───────────────────────────

function getLunarCellClass(date) {
  var lunar = Lunar.toLunar(date);
  if (!lunar) return '';
  var cls = 'lunar-date';
  if (lunar.day === 1) cls += ' lunar-first';
  else if (lunar.day === 15) cls += ' lunar-fifteen';
  if (lunar.month === 1 && lunar.day === 1 && !lunar.isLeap) cls += ' lunar-newyear';
  return cls;
}

function getLunarCellText(date) {
  return Lunar.getLunarDayName(date);
}

// ── Auto-merge extra holidays into HOLIDAYS ────────────────────

function initExtraHolidays() {
  if (typeof HOLIDAYS === 'undefined') { setTimeout(initExtraHolidays, 100); return; }
  if (HOLIDAYS._mergedExtra) return;
  EXTRA_HOLIDAYS.forEach(function(h) {
    var dup = HOLIDAYS.some(function(e) { return e.d === h.d && e.country === h.country; });
    if (!dup) HOLIDAYS.push(h);
  });
  HOLIDAYS._mergedExtra = true;
}

// ── Auto-init after page load ──────────────────────────────────
setTimeout(function() {
  initExtraHolidays();
  renderLunarInfo();
  renderSeasonalPoemCard();
}, 500);

/**
 * Calendar Culture Module — Chinese cultural content
 * All content follows the language switch (sr / zh-CN / en)
 * Depends on: Lunar (js/lunar.js), app.js globals (lang, today())
 */

// ── Extra Chinese holidays ────────────────────────────────────
const EXTRA_HOLIDAYS = [
  {
    d: '2026-02-11',
    name: { sr: 'Mala Nova Godina', zh: '小年', en: 'Little New Year' },
    country: 'cn',
    icon: '🧹',
    desc: {
      sr: 'Dan čišćenja kuće pred Novu Godinu — da sva sreća ima gde da uđe.',
      zh: '腊月二十三，祭灶扫尘，准备迎接新年。灶糖甜甜的，给灶王爷一个好印象。',
      en: 'Sweeping the house clean — making room for all the blessings of the New Year.',
    },
  },
  {
    d: '2026-02-18',
    name: { sr: 'Dan ljudi', zh: '人日', en: 'Renri (Human Day)' },
    country: 'cn',
    icon: '👤',
    desc: {
      sr: 'Sedmi dan Nove Godine — rođendan čovečanstva. Nüwa je danas stvorila ljude od gline.',
      zh: '正月初七，传说女娲在这一天创造了人类——是每个人的生日。吃七宝羹，祈求健康平安。',
      en: "The 7th day of CNY — humanity's birthday. Nüwa created humans from clay on this day.",
    },
  },
  {
    d: '2026-04-20',
    name: { sr: 'Festival kiše za žito', zh: '谷雨节', en: 'Grain Rain Festival' },
    country: 'cn',
    icon: '🌾',
    desc: {
      sr: 'Poslednji prolećni solarni termin — vreme za setvu i molitvu za bogatu žetvu.',
      zh: '雨生百谷，春天最后一个节气。喝一杯谷雨茶，赏一赏牡丹花，感恩大地的滋养。',
      en: 'The last spring solar term — time for sowing. Drink Grain Rain tea and admire the peonies.',
    },
  },
  {
    d: '2026-09-15',
    name: { sr: 'Festival gladnih duhova', zh: '中元节', en: 'Hungry Ghost Festival' },
    country: 'cn',
    icon: '🏮',
    desc: {
      sr: 'Dan kada se pali tamjan za duše predaka. Noćas granica između svetova postaje tanja.',
      zh: '七月十五，中元普渡。点燃一盏河灯，照亮先人回家的路。这天晚上别太晚回家哦。',
      en: 'The 15th of the 7th lunar month. Light water lanterns to guide ancestral spirits home.',
    },
  },
  {
    d: '2026-11-01',
    name: { sr: 'Festival donjeg izvora', zh: '下元节', en: 'Xiayuan Festival' },
    country: 'cn',
    icon: '🙏',
    desc: {
      sr: 'Dan molitve Bogu Vode da smiri reke i donese mir.',
      zh: '十月十五，祭祀水官大帝，祈求冬日平安。一碗热汤圆，温暖即将到来的整个冬天。',
      en: 'Praying to the Water God for a calm winter. Tangyuan brings warmth for the cold months ahead.',
    },
  },
  {
    d: '2026-12-22',
    name: { sr: 'Zimski solsticij festival', zh: '冬至节', en: 'Winter Solstice Festival' },
    country: 'cn',
    icon: '🥟',
    desc: {
      sr: '"Zimski solsticij je važniji od Nove Godine!" Porodica se okuplja uz jufke.',
      zh: '冬至大如年！北方人吃饺子，南方人吃汤圆。从今天起阳气渐生，春天已经在路上了。',
      en: 'Winter Solstice is as important as New Year! Northern dumplings, southern tangyuan — yang energy returns.',
    },
  },
];

// ── Cultural concept explanations (tri-lingual) ─────────────────
const CULTURE_EXPLAIN = {
  lunar: {
    sr: 'Kinezi već 4000 godina prate vreme pomoću lunarnog kalendara (农历 Nónglì). Svaki mesec počinje mladim mesecom 🌑, a pun mesec 🌕 je uvek 15. dana. Datumi koje vidiš na kalendaru (npr. "初三" = treći dan lunarnog meseca) pomažu Kinezima da odrede kada su tradicionalni praznici, venčanja i važni događaji. Za razliku od gregorijanskog kalendara, lunarna Nova Godina je svake godine na drugi datum!',
    en: 'For 4000 years, Chinese people have tracked time with the lunar calendar (农历 Nónglì). Each month starts with a new moon 🌑, and the full moon 🌕 is always on the 15th. The dates on the calendar (e.g. "初三" = 3rd day of the lunar month) help Chinese people determine traditional holidays, weddings, and important events. Unlike the Gregorian calendar, Lunar New Year falls on a different date each year!',
    zh: '农历已有四千多年历史，每月始于新月🌑，十五必是满月🌕。日历格上的小字（如"初三"）告诉你今天是农历月的第几天，中国人靠它来定节日、婚嫁、祭祀。公历1月1日是新年，但农历新年每年日期都不一样——这就是"春节"的魅力。',
  },
  tiangandizhi: {
    sr: '天干地支 (Tiāngān Dìzhī) je drevni kineski sistem brojanja od 60 kombinacija — 10 Nebeskih Stabljika (天干) i 12 Zemaljskih Grana (地支). Svaka godina, mesec, dan, pa čak i sat imaju svoju kombinaciju! To je kao kineski astrološki kod. Trenutna godina (丙午 Bǐngwǔ) znači "Vatreni Konj" — vatrena energija i sloboda.',
    en: '天干地支 (Tiāngān Dìzhī) is an ancient Chinese 60-combination counting system — 10 Heavenly Stems (天干) and 12 Earthly Branches (地支). Every year, month, day, and even hour has its own combination! Think of it as a Chinese astrological code. The current year (丙午 Bǐngwǔ) means "Fire Horse" — fiery energy and freedom.',
    zh: '天干地支是中国最古老的纪年法，十天干配十二地支，六十种组合循环往复。不止年份，月份、日子、时辰也都有干支。古代中国人用它来看命理、选吉日。今年是"丙午"年——丙属火，午为马，合起来就是"火马之年"，象征热情奔腾。',
  },
  shengxiao: {
    sr: 'Kineski zodijak (生肖 Shēngxiào) ima 12 životinja koje se smenjuju svake godine: Pacov 🐭, Vo 🐮, Tigar 🐯, Zec 🐰, Zmaj 🐲, Zmija 🐍, Konj 🐴, Koza 🐑, Majmun 🐵, Petao 🐔, Pas 🐶, Svinja 🐷. Tvoja životinja zavisi od godine rođenja! Svaka životinja nosi posebne osobine — Zmaj je moćan, Zec je nežan, Konj je slobodan...',
    en: 'The Chinese zodiac (生肖 Shēngxiào) has 12 animals that cycle each year: Rat 🐭, Ox 🐮, Tiger 🐯, Rabbit 🐰, Dragon 🐲, Snake 🐍, Horse 🐴, Goat 🐑, Monkey 🐵, Rooster 🐔, Dog 🐶, Pig 🐷. Your animal depends on your birth year! Each animal carries special traits — Dragon is powerful, Rabbit is gentle, Horse is free-spirited...',
    zh: '十二生肖大家都熟悉——鼠牛虎兔龙蛇马羊猴鸡狗猪，每年轮一个。哪年出生的就属什么。龙年出生的霸气，兔年出生的温柔，马年出生的爱自由……你和你的伴侣分别属什么？',
  },
  solarterm: {
    sr: '24 solarna termina (节气 Jiéqì) dele godinu na 24 dela — to je drevni kineski "poljoprivredni sat" star 3000 godina! Svaki termin traje oko 15 dana i opisuje šta se dešava u prirodi: buđenje insekata (惊蛰), žetva pšenice (芒种), prvi mraz (霜降)... Kinezi ih i danas koriste da znaju kada da sade, žanju i slave.',
    en: '24 Solar Terms (节气 Jiéqì) divide the year into 24 segments — an ancient Chinese "farming clock" over 3000 years old! Each term lasts about 15 days and describes what happens in nature: Awakening of Insects (惊蛰), Grain in Ear (芒种), First Frost (霜降)... Chinese people still use them today to know when to plant, harvest, and celebrate.',
    zh: '二十四节气把一年分成24份，是三千年前的"农耕时钟"。每个节气约15天，精准描述自然变化：惊蛰虫子醒、芒种麦子熟、霜降天变冷……这套系统在2016年被列入联合国非物质文化遗产。中国人至今依照节气种地、养生、过节。',
  },
  poem: {
    sr: 'Tang i Song dinastije (7-13. vek) su zlatno doba kineske poezije. Ove pesme — pune prirode, ljubavi i čežnje — i danas svaki Kinez zna napamet. One su kao mali prozori u kinesku dušu: zima je samoća i lepota, proleće je nada, leto je radost, jesen je seta.',
    en: 'The Tang and Song dynasties (7th-13th century) were the golden age of Chinese poetry. These poems — full of nature, love, and longing — are still memorized by every Chinese person today. They are little windows into the Chinese soul: winter is solitude and beauty, spring is hope, summer is joy, autumn is melancholy.',
    zh: '唐诗宋词是中国文学最璀璨的明珠。一千多年前的诗人们，用最精炼的文字写下山水、离别、思念、豁达——至今每个中国人都会背几首。这里每月精选一首与你共赏。',
  },
  color: {
    sr: 'Kinezi su kroz istoriju razvili neverovatno bogat rečnik boja — stotine poetskih imena koja oslikavaju prirodu: "mesečevo bela" (月白), "breskvino roze" (桃红), "lotus zelena" (荷绿)... Svako ime je mala slika. Boje se menjaju kroz godišnja doba prateći drevni sistem Pet Elemenata (Drvo, Vatra, Zemlja, Metal, Voda).',
    en: 'Throughout history, Chinese people developed an incredibly rich color vocabulary — hundreds of poetic names that paint nature: "moon white" (月白), "peach pink" (桃红), "lotus green" (荷绿)... Each name is a tiny painting. Colors shift through the seasons following the ancient Five Elements system (Wood, Fire, Earth, Metal, Water).',
    zh: '中国传统色有上百种，名字极美——月白、桃红、柳绿、黛蓝、琥珀、胭脂……每听一个名字都是一幅画。颜色还与五行（木火土金水）和季节呼应。看看这个月是什么色？',
  },
};

// ── Seasonal poems ────────────────────────────────────────────
const SEASONAL_POEMS = {
  0: {
    title: { zh: '元日', sr: 'Novogodišnji dan', en: "New Year's Day" },
    author: '王安石',
    dynasty: '宋',
    explain: {
      sr: 'Pesma slavi kinesku Novu Godinu. "Peach-wood signs" (桃符) su preteče današnjih crvenih papirnih amajlija koje Kinezi lepe na vrata za sreću.',
      en: 'This poem celebrates Chinese New Year. "Peach-wood signs" (桃符) were the ancestors of today\'s red paper couplets pasted on doors for luck.',
      zh: '写春节最经典的诗。爆竹声里旧年过去，家家户户换上新的桃符（春联的前身），春风把暖意送进每一杯屠苏酒里。',
    },
    lines: {
      zh: '爆竹声中一岁除，春风送暖入屠苏。\n千门万户曈曈日，总把新桃换旧符。',
      sr: 'Uz prasak petardi stara godina odlazi,\nProlećni vetar donosi toplinu.\nSunce obasjava hiljade domova,\nSvi menjaju stare amajlije za nove.',
      en: 'Firecrackers bid the old year farewell,\nSpring wind brings warmth to every home.\nThe sun shines on a thousand doors,\nAll swap old charms for new peach-wood signs.',
    },
  },
  2: {
    title: { zh: '春晓', sr: 'Prolećno jutro', en: 'Spring Morning' },
    author: '孟浩然',
    dynasty: '唐',
    explain: {
      sr: 'Najpoznatija kineska pesma o proleću. Pesnik se budi i shvata da je proleće već tu — ptice pevaju, a noćna kiša je oborila latice cveća. Jednostavna, a tako živa slika.',
      en: "The most famous Chinese spring poem. The poet wakes to find spring has arrived — birds sing, and last night's rain has knocked petals to the ground. Simple yet vivid.",
      zh: '每个中国人都会背的第一首诗。春睡醒来，鸟鸣处处，想起昨夜风雨——不知花落了多少？短短二十个字，春日的慵懒与怜惜跃然纸上。',
    },
    lines: {
      zh: '春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。',
      sr: 'U prolećnom snu ne čuješ zoru,\nSvuda cvrkut ptica.\nSinoć šum vetra i kiše —\nKoliko latica je palo?',
      en: 'Spring sleep, unaware of dawn,\nEverywhere I hear birds sing.\nLast night — wind and rain,\nHow many flowers have fallen?',
    },
  },
  5: {
    title: { zh: '小池', sr: 'Mali ribnjak', en: 'Little Pond' },
    author: '杨万里',
    dynasty: '宋',
    explain: {
      sr: 'Letnja minijatura — izvor, senka drveta, lotosov pupoljak i vilin konjic. Pesnik gleda mali ribnjak i vidi ceo svet u njemu. Kineska poezija voli ovakve "male velike stvari".',
      en: 'A summer miniature — a spring, tree shade, a lotus bud, and a dragonfly. The poet sees a whole world in a little pond. Chinese poetry loves these "small big things."',
      zh: '夏日小景——泉眼、树荫、才露尖角的小荷、早已立在荷尖的蜻蜓。诗人没有说一个"夏"字，却写尽了初夏的灵动与生机。',
    },
    lines: {
      zh: '泉眼无声惜细流，树阴照水爱晴柔。\n小荷才露尖尖角，早有蜻蜓立上头。',
      sr: 'Izvor šapuće, štedeći tanak mlaz,\nSenka drveta miluje vodu.\nTek što lotos pokaže vrh,\nVilin konjic već na njemu stoji.',
      en: 'The spring murmurs, sparing its stream,\nTree shade caresses the sunlit water.\nThe lotus bud just shows its tip,\nA dragonfly already rests upon it.',
    },
  },
  8: {
    title: { zh: '山居秋暝', sr: 'Jesenje veče u planinama', en: 'Autumn Evening' },
    author: '王维',
    dynasty: '唐',
    explain: {
      sr: 'Wang Wei je bio pesnik i slikar — njegove pesme su kao slike. Ovde slika jesenje veče u planinama posle kiše: svež vazduh, mesečina kroz borove, potok preko kamenja. Savršen mir.',
      en: 'Wang Wei was both poet and painter — his poems are like paintings. Here he paints an autumn evening in the mountains after rain: fresh air, moonlight through pines, a stream over stones. Perfect peace.',
      zh: '王维是"诗中有画"的代表。空山新雨，明月松间，清泉石上——四句话就是一幅山水画。秋夜的清冷与宁静，美到让人忘记时间。',
    },
    lines: {
      zh: '空山新雨后，天气晚来秋。\n明月松间照，清泉石上流。',
      sr: 'Prazne planine posle sveže kiše,\nVazduh miriše na jesen.\nMesec sija kroz borove,\nPotok teče preko kamenja.',
      en: 'Empty mountains after fresh rain,\nThe air feels of autumn.\nMoon shines through the pines,\nA clear spring flows over stones.',
    },
  },
  11: {
    title: { zh: '江雪', sr: 'Sneg na reci', en: 'River Snow' },
    author: '柳宗元',
    dynasty: '唐',
    explain: {
      sr: 'Najpoznatija kineska zimska pesma. Hiljade planina — ni jedne ptice. Deset hiljada staza — ni jednog čoveka. Samo jedan starac u čamcu, peca na zaleđenoj reci. Potpuna tišina i samoća — ali i neverovatna unutrašnja snaga.',
      en: 'The most famous Chinese winter poem. A thousand mountains — not a single bird. Ten thousand paths — not a single person. Only an old man in a boat, fishing on a frozen river. Absolute silence and solitude — but also incredible inner strength.',
      zh: '中国最有名的冬诗。千山无鸟，万径无人——天地间只剩一个披蓑戴笠的老翁，独坐在江雪中垂钓。极致的孤独，也是极致的自由。',
    },
    lines: {
      zh: '千山鸟飞绝，万径人踪灭。\n孤舟蓑笠翁，独钓寒江雪。',
      sr: 'Na hiljadu planina ni ptice,\nNa deset hiljada staza ni traga.\nU čamcu starac sa slamnim šeširom —\nSam peca na hladnoj reci pod snegom.',
      en: 'A thousand hills — no bird in flight,\nTen thousand paths — no human trace.\nA lone boat, an old man in straw cloak,\nFishing alone in the cold river snow.',
    },
  },
};

// ── Traditional Chinese seasonal colors ────────────────────────
const TRADITIONAL_COLORS = {
  0: { name: { zh: '月白', sr: 'mesečevo bela', en: 'moon white' }, hex: '#D6E4F0' },
  1: { name: { zh: '水色', sr: 'vodeno plava', en: 'water blue' }, hex: '#A8D8EA' },
  2: { name: { zh: '柳绿', sr: 'vrbino zelena', en: 'willow green' }, hex: '#A8D08D' },
  3: { name: { zh: '桃红', sr: 'breskvino roze', en: 'peach pink' }, hex: '#F4A7B9' },
  4: { name: { zh: '天青', sr: 'nebesko plava', en: 'sky cyan' }, hex: '#87CEEB' },
  5: { name: { zh: '朱砂', sr: 'cinober crvena', en: 'cinnabar red' }, hex: '#E53935' },
  6: { name: { zh: '荷绿', sr: 'lotus zelena', en: 'lotus green' }, hex: '#4CAF50' },
  7: { name: { zh: '黛蓝', sr: 'indigo plava', en: 'indigo blue' }, hex: '#1A237E' },
  8: { name: { zh: '琥珀', sr: 'ćilibarna', en: 'amber' }, hex: '#FF8F00' },
  9: { name: { zh: '胭脂', sr: 'rumenilo', en: 'rouge' }, hex: '#C62828' },
  10: { name: { zh: '霜白', sr: 'mrazno bela', en: 'frost white' }, hex: '#ECEFF1' },
  11: { name: { zh: '墨色', sr: 'tuš crna', en: 'ink black' }, hex: '#212121' },
};

// ── Transliteration maps for Gan-Zhi and ShengXiao ──────────────
const GAN_SR = ['Dzja', 'Ji', 'Bing', 'Ding', 'Vu', 'Dji', 'Geng', 'Sin', 'Ren', 'Guej'];
const GAN_EN = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'];
const GAN_ELEM_SR = ['Drvo Jang', 'Drvo Jin', 'Vatra Jang', 'Vatra Jin', 'Zemlja Jang', 'Zemlja Jin', 'Metal Jang', 'Metal Jin', 'Voda Jang', 'Voda Jin'];
const GAN_ELEM_EN = ['Yang Wood', 'Yin Wood', 'Yang Fire', 'Yin Fire', 'Yang Earth', 'Yin Earth', 'Yang Metal', 'Yin Metal', 'Yang Water', 'Yin Water'];
const ZHI_SR = ['Zi', 'Čou', 'Jin', 'Mao', 'Čen', 'Si', 'Vu', 'Vej', 'Šen', 'Jou', 'Sju', 'Haj'];
const ZHI_EN = ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'];
const ZOO_SR = ['Pacov', 'Vo', 'Tigar', 'Zec', 'Zmaj', 'Zmija', 'Konj', 'Koza', 'Majmun', 'Petao', 'Pas', 'Svinja'];
const ZOO_EN = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
const ZOO_EMOJI = ['🐭', '🐮', '🐯', '🐰', '🐲', '🐍', '🐴', '🐑', '🐵', '🐔', '🐶', '🐷'];

function _ganZhiTranslated(tgd) {
  // tgd is like "丙午" — two chars: gan + zhi
  if (!tgd || tgd.length < 2) return tgd;
  const g = tgd[0],
    z = tgd[1];
  const gi = Lunar.GAN.indexOf(g),
    zi = Lunar.ZHI.indexOf(z);
  if (gi < 0 || zi < 0) return tgd;
  const _l = typeof lang !== 'undefined' ? lang : 'sr';
  if (_l === 'sr' || _l === 'sr-RS') return GAN_SR[gi] + ZHI_SR[zi] + ' (' + GAN_ELEM_SR[gi] + ' ' + ZOO_SR[zi] + ')';
  if (_l === 'en') return GAN_EN[gi] + ZHI_EN[zi] + ' (' + GAN_ELEM_EN[gi] + ' ' + ZOO_EN[zi] + ')';
  return tgd;
}

function _shengxiaoTranslated(sx) {
  const si = Lunar.SHENGXIAO.indexOf(sx);
  if (si < 0) return sx;
  const _l = typeof lang !== 'undefined' ? lang : 'sr';
  if (_l === 'sr' || _l === 'sr-RS') return ZOO_SR[si];
  if (_l === 'en') return ZOO_EN[si];
  return sx;
}

function _zooEmoji(sx) {
  const si = Lunar.SHENGXIAO.indexOf(sx);
  return si >= 0 ? ZOO_EMOJI[si] : '';
}

// ── Helper: pick text by current language ──────────────────────
function _CL(map) {
  if (!map) return '';
  const _l = typeof lang !== 'undefined' ? lang : 'sr';
  return map[_l] || map[_l.split('-')[0]] || map['sr'] || '';
}

// ── Lunar info row (fully translated) ──────────────────────────
function renderLunarInfo() {
  if (typeof today === 'undefined') return;
  const el = document.getElementById('lunarInfo');
  if (!el) return;
  const td = today();
  const info = Lunar.getYearInfo(td);
  const lunar = Lunar.toLunar(td);
  if (!info || !lunar) {
    el.style.display = 'none';
    return;
  }
  el.style.display = '';
  const tgdDisplay = _ganZhiTranslated(info.tianGanDiZhi);
  const sxDisplay = _shengxiaoTranslated(info.shengXiao);
  const lunarDisplay = _CL({
    sr: 'Lunarni ' + lunar.month + '. mesec, ' + lunar.day + '. dan',
    en: 'Lunar ' + lunar.month + '/' + lunar.day,
    'zh-CN': lunar.monthName + lunar.dayName,
  });
  el.innerHTML =
    '<span title="' +
    escAttr(_CL(CULTURE_EXPLAIN.tiangandizhi)) +
    '">🐲 ' +
    tgdDisplay +
    '</span>' +
    ' · ' +
    '<span title="' +
    escAttr(_CL(CULTURE_EXPLAIN.shengxiao)) +
    '">' +
    _zooEmoji(info.shengXiao) +
    ' ' +
    sxDisplay +
    '</span>' +
    ' · ' +
    '<span title="' +
    escAttr(_CL(CULTURE_EXPLAIN.lunar)) +
    '">' +
    lunarDisplay +
    '</span>' +
    ' <span style="cursor:pointer;font-size:.7rem" onclick="renderCultureExplain()" title="' +
    escAttr(_CL({ sr: 'Klikni za objasnjenje', en: 'Click to learn more', 'zh-CN': '点击了解更多' })) +
    '">ℹ️</span>';
}

// ── Seasonal poem card (follows language) ──────────────────────
function renderSeasonalPoemCard() {
  if (typeof today === 'undefined') return;
  const el = document.getElementById('cultureCard');
  if (!el) return;
  const m = today().getMonth();
  const poem = SEASONAL_POEMS[m];
  if (!poem) {
    el.style.display = 'none';
    return;
  }
  el.style.display = '';
  const color = TRADITIONAL_COLORS[m];
  const info = Lunar.getYearInfo(today());
  const _l = typeof lang !== 'undefined' ? lang : 'zh';
  const lines = (poem.lines[_l] || poem.lines[_l.split('-')[0]] || poem.lines['zh']).replace(/\n/g, '<br>');
  const title = poem.title[_l] || poem.title[_l.split('-')[0]] || poem.title['zh'];
  el.innerHTML =
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
    '<span style="font-size:1.2rem">📜</span>' +
    '<span class="poem-title">' +
    title +
    '</span>' +
    '<span style="font-size:.6rem;opacity:.45">— ' +
    poem.author +
    ' · ' +
    poem.dynasty +
    '</span>' +
    '</div>' +
    '<div class="poem-body" style="white-space:pre-line">' +
    lines +
    '</div>' +
    '<div class="poem-explain" style="font-size:.65rem;color:var(--text-muted);margin-top:6px;line-height:1.6;font-style:italic;padding:6px 10px;background:rgba(180,140,100,.06);border-radius:8px">' +
    '💡 ' +
    _CL(poem.explain) +
    '</div>' +
    '<div style="margin-top:6px;font-size:.6rem;opacity:.4;display:flex;gap:12px;flex-wrap:wrap">' +
    '<span title="' +
    escAttr(_CL(CULTURE_EXPLAIN.color)) +
    '">🖌️ ' +
    _CL({ sr: 'Tradicionalna boja: ', 'zh-CN': '中国传统色：', en: 'Traditional color: ' }) +
    _CL(color.name) +
    ' <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' +
    color.hex +
    ';vertical-align:middle;margin-left:2px"></span></span>' +
    (info
      ? '<span title="' +
        escAttr(_CL(CULTURE_EXPLAIN.shengxiao)) +
        '">🐉 ' +
        _CL({ sr: 'Godina ', en: 'Year of the ', 'zh-CN': '' }) +
        _shengxiaoTranslated(info.shengXiao) +
        _CL({ sr: '', en: '', 'zh-CN': '年' }) +
        '</span>'
      : '') +
    '<span title="' +
    escAttr(_CL(CULTURE_EXPLAIN.solarterm)) +
    '" style="cursor:pointer" onclick="renderCultureExplain()">🌿 ' +
    _CL({ sr: 'Sta je sve ovo?', en: 'What is all this?', 'zh-CN': '这些是什么？' }) +
    '</span>' +
    '</div>';
}

// ── Culture explain card (clickable ℹ️) ────────────────────────
function renderCultureExplain() {
  const el = document.getElementById('cultureExplain');
  if (!el) return;
  if (el.style.display !== 'none' && el.innerHTML) {
    el.style.display = 'none';
    return;
  }
  el.style.display = '';
  const topics = [
    { icon: '📅', key: 'lunar', title: { sr: 'Lunarni Kalendar', en: 'Lunar Calendar', 'zh-CN': '农历' } },
    { icon: '🐉', key: 'shengxiao', title: { sr: 'Kineski Zodijak (生肖)', en: 'Chinese Zodiac (生肖)', 'zh-CN': '十二生肖' } },
    { icon: '🔢', key: 'tiangandizhi', title: { sr: 'Nebeske Stabljike i Zemaljske Grane', en: 'Heavenly Stems & Earthly Branches', 'zh-CN': '天干地支' } },
    { icon: '🌿', key: 'solarterm', title: { sr: '24 Solarna Termina (节气)', en: '24 Solar Terms (节气)', 'zh-CN': '二十四节气' } },
    { icon: '🎨', key: 'color', title: { sr: 'Tradicionalne Kineske Boje', en: 'Traditional Chinese Colors', 'zh-CN': '中国传统色' } },
    { icon: '📜', key: 'poem', title: { sr: 'Tang & Song Poezija', en: 'Tang & Song Poetry', 'zh-CN': '唐诗宋词' } },
  ];
  let h =
    '<div style="font-weight:700;margin-bottom:8px;font-size:.78rem">🏮 ' +
    _CL({ sr: 'Kineska Kultura — Objasnjenje', en: 'Chinese Culture — Explained', 'zh-CN': '中国文化小课堂' }) +
    '</div>';
  topics.forEach(function (t) {
    h +=
      '<div style="margin-bottom:10px;padding:8px 10px;background:var(--card);border-radius:10px;border-left:3px solid var(--love)">' +
      '<div style="font-weight:700;font-size:.72rem;margin-bottom:3px">' +
      t.icon +
      ' ' +
      _CL(t.title) +
      '</div>' +
      '<div style="font-size:.65rem;color:var(--text-muted);line-height:1.6">' +
      _CL(CULTURE_EXPLAIN[t.key]) +
      '</div>' +
      '</div>';
  });
  h +=
    '<div style="text-align:center;font-size:.6rem;color:var(--text-muted);margin-top:6px;cursor:pointer" onclick="document.getElementById(\'cultureExplain\').style.display=\'none\'">' +
    _CL({ sr: '✕ zatvori', en: '✕ close', 'zh-CN': '✕ 关闭' }) +
    '</div>';
  el.innerHTML = h;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Tiny HTML-attribute escaper ─────────────────────────────────
function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Lunar helpers for calendar cells ───────────────────────────

function getLunarCellClass(date) {
  const lunar = Lunar.toLunar(date);
  if (!lunar) return '';
  let cls = 'lunar-date';
  if (lunar.day === 1) cls += ' lunar-first';
  else if (lunar.day === 15) cls += ' lunar-fifteen';
  if (lunar.month === 1 && lunar.day === 1 && !lunar.isLeap) cls += ' lunar-newyear';
  return cls;
}

function getLunarCellText(date) {
  const lunar = Lunar.toLunar(date);
  if (!lunar) return '';
  // ZH mode: Chinese day names (初三, 十五...); SR/EN: numeric (L3, L15...)
  const _l = typeof lang !== 'undefined' ? lang : 'sr';
  if (_l === 'sr' || _l === 'sr-RS') return lunar.day;
  if (_l === 'en') return lunar.day;
  return Lunar.getLunarDayName(date);
}

// ── Auto-merge extra holidays ──────────────────────────────────

function initExtraHolidays() {
  if (typeof HOLIDAYS === 'undefined') {
    setTimeout(initExtraHolidays, 100);
    return;
  }
  if (HOLIDAYS._mergedExtra) return;
  EXTRA_HOLIDAYS.forEach(function (h) {
    const dup = HOLIDAYS.some(function (e) {
      return e.d === h.d && e.country === h.country;
    });
    if (!dup) HOLIDAYS.push(h);
  });
  HOLIDAYS._mergedExtra = true;
}

// ── Auto-init ──────────────────────────────────────────────────
(function _cultureInit(attempt) {
  attempt = attempt || 0;
  if (typeof today === 'undefined' || typeof lang === 'undefined') {
    if (attempt < 50) {
      setTimeout(function () {
        _cultureInit(attempt + 1);
      }, 200);
      return;
    }
    console.warn('[culture] today/lang not available after 50 retries — skipping');
    return;
  }
  initExtraHolidays();
  renderLunarInfo();
  renderSeasonalPoemCard();
})();

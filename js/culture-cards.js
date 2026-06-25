/**
 * CultureCardsModule — 中国文化知识卡片 (IIFE)
 *
 * Dependencies (global): lang, state, L(), t(), CL (for cl()), today()
 * Data: data/culture-knowledge.json (fetched at boot)
 * DOM IDs used: cultureMainCard, cultureEmoji, cultureTitleZh, cultureTitleSr,
 *               cultureDesc, cultureTags, cultureNavInfo, cultureTodayBadge,
 *               tb-culture, btnCulturePrev, btnCultureNext, btnCultureToday
 *
 * Backward compatible: the global functions (cl, initCultureTab, renderCultureCard,
 * prevCultureCard, nextCultureCard, goToTodayCulture, getTodaysCultureIndex,
 * toggleHolidayStory) and variables (CULTURE_KNOWLEDGE, CULTURE_DESC_ZH, _cultureCardIdx)
 * are preserved by delegating to the module.
 */
var CultureCardsModule = (function () {
  'use strict';

  /* ── Internal State ── */
  var _cultureData = [];       // loaded from culture-knowledge.json
  var _cardIdx = 0;

  /* ── CL (Culture Labels) — dual-profile badge text ── */
  var CL = {
    barry: { todayBadge: '今日推荐' },
    andjela: { todayBadge: 'Daily' },
  };

  /* ── Chinese descriptions (Barry's native language) ── */
  var DESC_ZH = {
    1: '中国最重要的传统节日。全家人聚在一起吃年夜饭，孩子们收到红包，鞭炮声驱散了旧年的晦气。每个农历年对应一种生肖动物。',
    2: '在中国几乎所有支付都用手机完成——微信支付或支付宝。现金已很少使用。来中国前安装微信并绑定银行卡，就能畅行无阻。',
    3: '中国人喜欢分享菜肴——所有菜放桌子中间大家一起夹。不要把筷子竖直插在米饭里。敬酒时杯子要低于长辈，以示尊重。',
    4: '中国人很少直呼其名。年长的叫阿姨叔叔，年轻的叫小姐姐小哥哥。商店里常能听到美女这个称呼。',
    5: '在中国通过手机App几乎什么都能订：外卖、生鲜、药品，甚至还能请人打扫卫生。配送通常30分钟内送到。',
    6: '红包在春节、婚礼和生日时赠送。红色代表好运。不要送空红包，接过来时用双手。微信数字红包也非常流行。',
    7: '家庭是中国社会的核心。子女成年后也常和父母住在一起。长辈意见非常重要。孝顺强调对父母的赡养和尊重。',
    8: '茶是中国文化的灵魂。共有六大茶类：绿、红、白、乌龙、黄、普洱。最著名的是龙井。别人倒茶时用手指轻叩桌面表示感谢——这叫叩指礼。',
    9: '中国人喜欢说吉祥话：恭喜发财、万事如意、身体健康。过年一定要说新年快乐。8是幸运数字，4则要避免。',
    10: '农历七月初七庆祝。传说牛郎织女只能在这一夜通过鹊桥相会。如今恋人们会享受浪漫晚餐互赠礼物。',
    11: '汉字起源于象形文字——山像山峰，水像流水。总数超五万，日常用两三千。书法是汉字书写的高级艺术。',
    12: '在中国老师备受尊敬。一日为师生终身为父。学生永远称呼老师，从不直呼其名。',
    13: '过年前彻底打扫房子扫走晦气，贴红色装饰，挂对联。孩子们守岁到半夜。第二天穿新红衣服。',
    14: '第二重要的传统节日，仅次于春节。吃月饼赏满月。象征家庭团圆——月圆人团圆。李白：举头望明月，低头思故乡。',
    15: '在中国看病先去社区卫生服务中心再去大医院。带上医保卡。挂号可通过微信小程序预约。大多数常见药在药店无需处方。',
    16: '在中国银行开户需要护照、签证和住址证明。最大银行是工商银行、中国银行和建设银行。手机银行极其发达。',
    17: '租房可通过中介或App如自如和贝壳。合同通常只有中文——最好找翻译。押金一般一个月房租。注意水电暖气是否包含。',
    18: '快递速度极快——上午下单傍晚送到。顺丰中通圆通遍布全国。包裹常放小区快递柜，24小时不取就收费。',
    19: '大多数城市用一卡通乘坐所有公交。在北京叫一卡通，地铁站就能买。上海等地用手机支付宝直接刷码乘车。',
    20: '微信支付和支付宝极其方便但要注重安全。不要扫描陌生人二维码。开启双重验证。手机就是你的一切财务。',
    21: '在大城市垃圾必须严格分类：湿垃圾、干垃圾、可回收物和有害垃圾。垃圾桶有颜色区分，街上有指导员。分错会罚款。',
    22: '中国人对排队很有耐心。但在菜市场和地铁里人流密集。在银行或医院记得取号等叫号。',
    23: '中国人请客主人一定抢着买单。客人带小礼物（水果茶叶）。说一句我来买单是基本礼貌。商务宴请座位有讲究。',
    24: '在中国送礼注意不送钟表（送钟像送终）、不送伞（散意味着分离）、不送刀剪。红包是最安全选择。收礼用双手，不当面打开。',
    25: '亲属称谓丰富。用哥哥弟弟姐姐妹妹区分不同年龄同辈。爸爸这边的奶奶叫奶奶爷爷叫爷爷，妈妈那边叫外婆外公。',
    26: '中国生肖共12种动物。传说玉皇大帝叫动物来比赛——最先过河的12只拥有自己的年份。老鼠骑着牛过河最后关头跳到了第一名。',
    27: '中国茶分六大类：绿茶不发酵清新、红茶全发酵浓郁、白茶微发酵淡雅、乌龙茶半发酵花香、黄茶稀有温和、普洱茶陈年醇厚。',
    28: '麻将是144张牌的社交游戏，遍布中国公园茶馆街头。摸牌弃牌组成3-4张组合加一对。哗啦哗啦洗牌声随处可见。',
    29: '每天傍晚全国各地数百万大妈到广场上跳集体舞——广场舞。虽有时吵但是她们锻炼社交的快乐方式。部分城市晚九点后禁止。',
    30: '中国拥有世界最大高铁网——时速350公里。北京到上海四个半小时。车票在App买（12306），进站需安检。车厢有WiFi电源热餐。',
  };

  /* ── Helpers ── */
  function getLang() {
    return (typeof lang !== 'undefined' ? lang : 'sr') || 'sr';
  }

  function isChinese() {
    return getLang().indexOf('zh') === 0;
  }

  function isEnglish() {
    return getLang().indexOf('en') === 0;
  }

  function getProfile() {
    return isChinese() ? 'barry' : 'andjela';
  }

  function locale(key) {
    var p = CL[getProfile()] || CL.andjela;
    return p[key] || CL.andjela[key] || key;
  }

  /* ── Loading ── */
  function load() {
    return fetch('data/culture-knowledge.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        _cultureData = Array.isArray(data) && data.length > 0 ? data : _cultureData;
        return _cultureData;
      })
      .catch(function () {
        return _cultureData;
      });
  }

  function getData() {
    return _cultureData;
  }

  /* ── Index Calculation ── */
  function getTodaysIndex() {
    if (_cultureData.length === 0) return 0;
    var now = new Date();
    return (now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()) % _cultureData.length;
  }

  /* ── Render ── */
  function render() {
    if (_cultureData.length === 0) return;
    var k = _cultureData[_cardIdx];
    if (!k) return;

    var emojiEl = document.getElementById('cultureEmoji');
    if (emojiEl) emojiEl.textContent = k.icon;

    var titleZh = document.getElementById('cultureTitleZh');
    var titleSr = document.getElementById('cultureTitleSr');

    if (titleZh) {
      titleZh.textContent = isEnglish() ? (k.en || k.zh) : k.zh;
      titleZh.style.display = isChinese() || isEnglish() ? '' : 'none';
    }
    if (titleSr) {
      titleSr.textContent = k.sr;
      titleSr.style.display = !isChinese() && !isEnglish() ? '' : 'none';
    }

    var descEl = document.getElementById('cultureDesc');
    if (descEl) {
      var desc = isChinese() ? (DESC_ZH[k.id] || k.desc) : (k.desc_sr || k.desc);
      if (isEnglish()) desc = k.desc_en || k.desc;
      descEl.textContent = desc;
    }

    var tagsEl = document.getElementById('cultureTags');
    if (tagsEl) {
      var html = '';
      (k.tags || []).forEach(function (t) {
        html += '<span class="culture-tag">' + t + '</span>';
      });
      tagsEl.innerHTML = html;
    }

    var navEl = document.getElementById('cultureNavInfo');
    if (navEl) navEl.textContent = (_cardIdx + 1) + ' / ' + _cultureData.length;

    var isToday = _cardIdx === getTodaysIndex();
    var card = document.getElementById('cultureMainCard');
    if (card) {
      if (isToday) card.classList.add('culture-today');
      else card.classList.remove('culture-today');
    }

    var badge = document.getElementById('cultureTodayBadge');
    if (badge) badge.textContent = locale('todayBadge');
  }

  /* ── Navigation ── */
  function prev() {
    if (_cultureData.length === 0) return;
    _cardIdx = (_cardIdx - 1 + _cultureData.length) % _cultureData.length;
    render();
  }

  function next() {
    if (_cultureData.length === 0) return;
    _cardIdx = (_cardIdx + 1) % _cultureData.length;
    render();
  }

  function goToToday() {
    _cardIdx = getTodaysIndex();
    render();
  }

  /* ── Init ── */
  function init(tabLabel) {
    // Update tab label
    var tb = document.getElementById('tb-culture');
    if (tb && typeof L !== 'undefined') {
      tb.textContent = L('Kina', 'China', '中华');
    }

    // Set initial card index to today's culture
    _cardIdx = getTodaysIndex();
    render();
  }

  /* ── Dashboard snippet (used by app.js renderDashboard) ── */
  function dashboardSnippet(dl) {
    if (_cultureData.length === 0) return '';
    var tc = _cultureData[getTodaysIndex()];
    if (!tc) return '';

    var isZh = isChinese();
    var isEn = isEnglish();
    var title = isZh ? tc.zh : (isEn && tc.en ? tc.en : tc.sr);
    var desc = isZh ? (DESC_ZH[tc.id] || tc.desc) : (isEn && tc.desc_en ? tc.desc_en : tc.desc_sr || tc.desc);

    return '<div class="card dash-card"><h4>' +
      tc.icon + ' ' +
      (dl || 'Today') +
      '</h4><div style="font-size:.85rem;font-weight:700;color:var(--love);margin-bottom:4px">' +
      title +
      '</div><div style="font-size:.65rem;color:var(--text-muted);line-height:1.5">' +
      (desc || '').substring(0, 120) +
      '...</div></div>';
  }

  /* ── Public API (exposed to window for backward compat) ── */
  var api = {
    load: load,
    getData: getData,
    init: init,
    render: render,
    prev: prev,
    next: next,
    goToToday: goToToday,
    getTodaysIndex: getTodaysIndex,
    dashboardSnippet: dashboardSnippet,
    locale: locale,
    DESC_ZH: DESC_ZH,
  };

  return api;
})();

/* ================================================================
   Backward-compatible global aliases (delegate to IIFE)
   ================================================================ */
var CULTURE_KNOWLEDGE = [];
var CULTURE_DESC_ZH = CultureCardsModule.DESC_ZH;
var _cultureCardIdx = 0;

function cl(key) { return CultureCardsModule.locale(key); }
function getTodaysCultureIndex() { return CultureCardsModule.getTodaysIndex(); }
function initCultureTab() { CultureCardsModule.init(); }
function renderCultureCard() { CultureCardsModule.render(); }
function prevCultureCard() { CultureCardsModule.prev(); }
function nextCultureCard() { CultureCardsModule.next(); }
function goToTodayCulture() { CultureCardsModule.goToToday(); }

// Sync the global CULTURE_KNOWLEDGE with module data when loaded
(function () {
  var origLoad = CultureCardsModule.load;
  CultureCardsModule.load = function () {
    return origLoad.call(CultureCardsModule).then(function (data) {
      CULTURE_KNOWLEDGE = data;
      _cultureCardIdx = CultureCardsModule.getTodaysIndex();
      return data;
    });
  };
})();

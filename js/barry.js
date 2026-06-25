/**
 * BarryModule — Barry-specific features: symptom analysis, shared cycle phase,
 * sleep tracker, special badge, relationship tips, and symptom help.
 *
 * Dependencies (global): state, lang, L(), t(), predict(), getPhase(), fmtDate(),
 *   today(), addDays(), getPeriodEndDate(), loadSharedDiaryData(),
 *   saveSharedDiaryData(), pushAllSharedData(), safeParse(), activeProfile,
 *   saveSymptom, localStorage
 *
 * DOM IDs used: barry-symptom-view, andjela-symptom-view, barrySymptomAnalysis,
 *   bs-title, sleepCard, sleep-title, sleepBarryView, sleepAngieView, sleep-hint,
 *   sleep-save, sleepTime, sleepAngieContent, specialBadge, specialBadgeText,
 *   relTipCard, relTipIcon, relTipText
 *
 * Backward compatible: the global functions (renderBarrySymptomView,
 * updateSharedSymptoms, getSharedCyclePhase, updateSharedCycleInfo,
 * saveSleep, getBarrySleep, renderSleepCard, renderSpecialBadge,
 * renderRelTips) are preserved by delegating to the module.
 */
var BarryModule = (function () {
  'use strict';

  /* ================================================================
     SHARED CYCLE PHASE — reads Anđela's cycle data from shared storage
     ================================================================ */

  /**
   * Get shared cycle phase, falling back through multiple storage keys.
   * @returns {{ phase: string, nextStart: string, updated: number } | null}
   */
  function getSharedCyclePhase() {
    // First try shared-cycle-info (old summary format: {phase, nextStart})
    var shared = null;
    shared = safeParse(localStorage.getItem('shared-cycle-info'), null);
    if (shared && shared.phase) return shared;

    // Calculate phase from synced shared cycle data (new neutral key)
    var cycleData = null;
    cycleData = safeParse(localStorage.getItem('shared-cycle-data'), null);
    if (!cycleData) {
      cycleData = safeParse(localStorage.getItem('shared-andjela-cycle-data'), null);
    }
    if (!cycleData) {
      cycleData = safeParse(localStorage.getItem('cycle-data-v6-andjela'), null);
    }
    if (!cycleData || !cycleData.records || cycleData.records.length === 0) return null;

    try {
      var records = cycleData.records
        .map(function (r) {
          return new Date(r);
        })
        .sort(function (a, b) {
          return a - b;
        });
      var lastStart = new Date(records[records.length - 1]);
      var settings = cycleData.settings || { cycleLength: 28, periodLength: 7 };
      var cycleLen = settings.cycleLength || 28;
      var periodLen = settings.periodLength || 7;
      var nextStart = new Date(lastStart);
      nextStart.setDate(nextStart.getDate() + cycleLen);
      var td = today();
      var dayNum = Math.floor((td - lastStart) / 86400000);
      var ovulationDay = new Date(nextStart);
      ovulationDay.setDate(ovulationDay.getDate() - 14);
      var phase;
      if (dayNum >= 0 && dayNum < periodLen) phase = 'period';
      else if (td >= ovulationDay && td < nextStart) {
        var daysToOvulation = Math.floor((ovulationDay - lastStart) / 86400000);
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

  /**
   * Update shared cycle info from Anđela's profile (called when saving symptoms).
   * Only runs when activeProfile === 'andjela'.
   */
  function updateSharedCycleInfo() {
    if (activeProfile !== 'andjela') return;
    var pred = predict();
    var phase = getPhase(today(), pred);
    var cat = 'general';
    if (phase === 'period-on' || phase === 'period-mid') cat = 'period';
    else if (phase === 'ovulation' || phase === 'fertile') cat = 'ovulation';
    else if (phase === 'follicular') cat = 'follicular';
    else if (phase === 'luteal') cat = 'luteal';
    localStorage.setItem(
      'shared-cycle-info',
      JSON.stringify({ phase: cat, nextStart: pred.nextStart ? fmtDate(pred.nextStart) : null, updated: Date.now() })
    );
  }

  /* ================================================================
     SYMPTOM HELPER — explains symptoms for Barry's perspective
     ================================================================ */

  var SYMPTOM_HELP = {
    cramps: {
      cause: {
        sr: 'Materica se kontrahuje da izbaci sluzokozu — prostaglandini izazivaju bol',
        zh: '子宫收缩排出内膜——前列腺素引起疼痛',
        en: 'Uterus contracts to shed lining — prostaglandins cause pain',
      },
      help: {
        sr: 'Termofor na stomak • Caj od dumbira • Nezna masaza donjeg dela leda • Bez hladnih pica',
        zh: '暖水袋敷肚子 • 红糖姜茶 • 轻揉下背部 • 别喝冰的',
        en: 'Heating pad • Ginger tea • Gentle lower back massage • No cold drinks',
      },
    },
    headache: {
      cause: { sr: 'Pad estrogena siri krvne sudove u mozgu', zh: '雌激素下降导致脑血管扩张', en: 'Estrogen drop dilates brain blood vessels' },
      help: {
        sr: 'Tiha, zamracena soba • Hladan oblog na celo • Pitaj da li zeli lek protiv bolova',
        zh: '安静黑暗的房间 • 凉毛巾敷额头 • 问她需不需要止痛药',
        en: 'Quiet dark room • Cold compress on forehead • Ask if she needs pain relief',
      },
    },
    fatigue: {
      cause: { sr: 'Telo trosi mnogo energije — grozde je nisko', zh: '身体消耗大量能量——铁含量低', en: "Body uses lots of energy — iron is low" },
      help: {
        sr: 'Pusti je da spava • Uradi nesto po kuci umesto nje • Skoro joj hranu bogatu grozdem',
        zh: '让她睡 • 帮她做家务 • 做含铁丰富的食物',
        en: 'Let her sleep • Do chores for her • Cook iron-rich food for her',
      },
    },
    mood: {
      cause: {
        sr: 'Hormoni divljaju — serotonin i dopamin su na minimumu',
        zh: '荷尔蒙剧烈波动——血清素和多巴胺都处于低点',
        en: 'Serotonin and dopamine at lows',
      },
      help: {
        sr: 'Slupsaj bez osude • Ne govori "smiri se" • Donesi joj cvece bez razloga • Samo je zagrli',
        zh: '倾听不评判 • 别说"冷静点" • 买花给她 • 就抱着她',
        en: 'Listen without judging • Dont say "calm down" • Bring her flowers • Just hold her',
      },
    },
    flow: {
      cause: { sr: 'Sluzokoza materice se ljusti — normalan proces', zh: '子宫内膜正在脱落——正常过程', en: 'Uterine lining is shedding — normal process' },
      help: {
        sr: 'Kupi joj uloske/tampone ako joj treba • Bez dizanja teskih stvari • Neka se odmara',
        zh: '帮她买卫生巾 • 别让她提重物 • 让她休息',
        en: 'Buy pads/tampons if she needs • No heavy lifting • Let her rest',
      },
    },
    cravings: {
      cause: {
        sr: 'Nagli pad serotonina — telo trazi utehu u hrani',
        zh: '血清素急剧下降——身体在食物中寻找安慰',
        en: 'Serotonin crash — body seeks comfort in food',
      },
      help: {
        sr: 'Donesi joj ono sto zeli bez komentara • Naruci njenu omiljenu hranu • Ne komentari njene izbore',
        zh: '给她想吃的不要评论 • 点她最爱吃的 • 别评论她的食物选择',
        en: "Get her what she wants, no comments • Order her favorite food • Dont comment on her choices",
      },
    },
  };

  /* ================================================================
     PHASE ANALYSIS — detailed cycle phase info for Barry's dashboard
     ================================================================ */

  var PHASE_ANALYSIS = {
    period: {
      name: { sr: 'Menstruacija', en: 'Period', 'zh-CN': '经期' },
      days: { sr: 'Dan 1-7 ciklusa', en: 'Day 1-7 of cycle', 'zh-CN': '周期第1-7天' },
      energy: { sr: 'Niska — odmara se', en: 'Low — resting', 'zh-CN': '低——需要休息' },
      libido: { sr: 'Nizak (moguc blagi porast pred kraj)', en: 'Low (may rise slightly toward end)', 'zh-CN': '低（快结束时可能略有回升）' },
      physical: {
        sr: 'Materica se kontrahuje, grozde opada. Moze imati: grceve u stomaku, glavobolju, umor, bol u ledjima, nadutost.',
        en: 'Uterus contracting, iron drops. May have: cramps, headache, fatigue, back pain, bloating.',
        'zh-CN': '子宫收缩，铁元素下降。可能有：痛经、头痛、极度疲劳、腰酸、腹胀。',
      },
      emotional: {
        sr: 'Oseca se ranjivo, povuceno. Emocije su intenzivne — moze plakati bez razloga. Zeli sigurnost i neznost, ne resenja.',
        en: 'Feels vulnerable, withdrawn. Emotions intense — may cry without reason. Wants safety and tenderness, not solutions.',
        'zh-CN': '感到脆弱、想独处。情绪强烈——可能没有理由就哭。需要安全感，不需要解决方案。',
      },
      sex: {
        sr: 'Nizak libido. Ne pritiskaj — neznost bez ocekivanja je ono sto joj treba. Ako je raspolozena, budi nezan i pazljiv.',
        en: "Low libido. Dont pressure — tenderness without expectation is what she needs. If shes in the mood, be gentle and attentive.",
        'zh-CN': '性欲低。别给她压力——她需要的是无期待的温柔。如果她有兴致，一定要轻柔体贴。',
      },
      support: {
        sr: 'Zagrli je bez razloga • Skuvaj topao caj • Pusti je da spava • Ne pametuj — samo slusaj • Donesi cokoladu',
        en: "Hug her without reason • Make warm tea • Let her sleep • Dont lecture — just listen • Bring chocolate",
        'zh-CN': '无条件抱抱 • 泡热茶 • 让她睡 • 别讲道理——就听 • 带巧克力',
      },
      warning: {
        sr: 'Ne govori "nije to nista" — za nju JESTE. Ne pokreci teske teme. Ne ocekuj seks.',
        en: 'Dont say "its nothing" — to her, it IS. Dont bring up heavy topics. Dont expect sex.',
        'zh-CN': '别说"没那么严重"——对她来说就是很严重。别讨论沉重话题。别期待性生活。',
      },
    },
    follicular: {
      name: { sr: 'Folikularna', en: 'Follicular', 'zh-CN': '卵泡期' },
      days: { sr: 'Dan 8-13 ciklusa', en: 'Day 8-13 of cycle', 'zh-CN': '周期第8-13天' },
      energy: { sr: 'Raste — sve vise energije', en: 'Rising — more energy each day', 'zh-CN': '上升中——精力越来越好' },
      libido: {
        sr: 'Raste postepeno — pocinje da se oseca privlacno',
        en: 'Rising gradually — starting to feel attractive',
        'zh-CN': '逐渐上升——开始感觉自己有魅力',
      },
      physical: {
        sr: 'Estrogen raste! Koza blista, kosa sjajna, telo se oseca jace. Ovo je faza kad izgleda najbolje — primetices.',
        en: "Estrogen rising! Skin glows, hair shines, body feels stronger. This is when she looks her best — you'll notice.",
        'zh-CN': '雌激素上升！皮肤发光、头发亮泽、身体更有力。这是她最好看的阶段——你会注意到的。',
      },
      emotional: {
        sr: 'Optimisticna, drustvena, kreativna. Najbolje vreme za nove planove. Otvorena za razgovor — iskoristi to.',
        en: 'Optimistic, social, creative. Best time for new plans. Open to conversation — use this.',
        'zh-CN': '乐观、爱社交、有创意。最适合制定新计划。愿意聊天——抓住机会。',
      },
      sex: {
        sr: 'Libido raste svakim danom. Jos nije na vrhuncu, ali je sve otvorenija za flert i dodir. Odlicno vreme za predigru i istrazivanje.',
        en: 'Libido rising each day. Not at peak yet, but increasingly open to flirtation and touch. Great time for foreplay and exploration.',
        'zh-CN': '性欲每天都在上升。还没到顶峰，但对调情和触碰越来越开放。适合前戏和探索的好时机。',
      },
      support: {
        sr: 'Pricaj o planovima za buducnost • Predlozi izlazak ili putovanje • Kupi cvece • Vezbajte zajedno',
        en: "Talk about future plans • Suggest going out or a trip • Buy flowers • Exercise together",
        'zh-CN': '聊未来计划 • 约她出去或旅行 • 买花——她一定注意到 • 一起运动',
      },
      warning: {
        sr: 'Ne propusti ovu fazu — ona se otvara ka tebi. Budi prisutan i angazovan.',
        en: "Dont miss this phase — shes opening up to you. Be present and engaged.",
        'zh-CN': '别错过这个阶段——她正在向你敞开心扉。积极参与她的生活。',
      },
    },
    ovulation: {
      name: { sr: 'Ovulacija', en: 'Ovulation', 'zh-CN': '排卵期' },
      days: { sr: 'Dan 14-16 ciklusa', en: 'Day 14-16 of cycle', 'zh-CN': '周期第14-16天' },
      energy: { sr: 'Vrhunac — na maksimumu!', en: 'Peak — at maximum!', 'zh-CN': '巅峰——状态最好！' },
      libido: {
        sr: 'VRHUNAC — libido na maksimumu. Ovo su dani kad je najvise zainteresovana za seks.',
        en: "PEAK — libido at maximum. These are the days she's most interested in sex.",
        'zh-CN': '最高——性欲达到顶峰。这是她最想要性爱的几天。',
      },
      physical: {
        sr: 'Vrhunac energije i plodnosti. Moze osetiti blagi bol u karlici (ovulacioni bol). Bistar sekret — znak plodnosti. Grudi mogu biti osetljivije.',
        en: 'Peak energy and fertility. May feel mild pelvic pain. Clear discharge — sign of fertility. Breasts may be more sensitive.',
        'zh-CN': '能量和生育力巅峰。可能有轻微排卵痛。分泌物清亮——生育力标志。乳房可能更敏感。',
      },
      emotional: {
        sr: 'Samopouzdana, privlacna, magneticna. Oseca se NAJBOLJE u celom ciklusu. Komplimenti joj sad znace najvise — i veruje im.',
        en: 'Confident, attractive, magnetic. Feels her BEST in the whole cycle. Compliments mean the most now — and she believes them.',
        'zh-CN': '自信、迷人、有魅力。整个周期中状态最好。现在夸她最有效——而且她真的会相信。',
      },
      sex: {
        sr: 'Ovo su dani kad je najotvorenija za seks. Njeno telo je bukvalno programirano za intimnost sad. Iniciraj neznon — gotovo sigurno ce biti raspolozena. Najbolji dani za zacece.',
        en: "These are the days she's most open to sex. Her body is literally programmed for intimacy now. Initiate gently — she's almost certainly in the mood. Best days for conception.",
        'zh-CN': '这是她最愿意做爱的几天。她的身体此时天然地渴望亲密。温柔地主动——她几乎一定会有回应。最容易受孕的日子。',
      },
      support: {
        sr: 'Iskreni komplimenti (izgled, miris, energija) • Budi romantican i pazljiv • Izvedi je — ples, vecera • Iniciraj intimnost',
        en: 'Genuine compliments (looks, smell, energy) • Be romantic and attentive • Take her out — dancing, dinner • Initiate intimacy',
        'zh-CN': '真诚赞美（外表、气味、能量）• 浪漫体贴 • 带她出去——跳舞、晚餐 • 主动亲密',
      },
      warning: {
        sr: 'Ovo su njeni NAJBOLJI dani. Ne preskaci ih. Ako postoji dan za romantiku — ovo je taj dan.',
        en: "These are her BEST days. Dont skip them. If there is a day for romance — this is it.",
        'zh-CN': '这是她最好的日子。别错过。如果要选浪漫的一天——就是这天。',
      },
    },
    luteal: {
      name: { sr: 'Lutealna', en: 'Luteal', 'zh-CN': '黄体期' },
      days: { sr: 'Dan 17-28 ciklusa', en: 'Day 17-28 of cycle', 'zh-CN': '周期第17-28天' },
      energy: {
        sr: 'Prvo ok, pred kraj pada — umor raste',
        en: 'OK at first, drops toward end — fatigue grows',
        'zh-CN': '前期还行，越往后越累——疲劳加重',
      },
      libido: {
        sr: 'Prvo OK, pred kraj opada. Moze varirati — dan da, dan ne.',
        en: 'OK at first, drops toward end. May vary — day yes, day no.',
        'zh-CN': '前期还行，越往后越低。可能忽高忽低——今天想明天不想。',
      },
      physical: {
        sr: 'Progesteron dominira. Telo zadrzava vodu — oseca se naduto. Grudi osetljive. Akne moguce. Pred kraj: umor, zudnja za hranom, glavobolje.',
        en: 'Progesterone dominates. Water retention — feels bloated. Breast tenderness. Acne possible. Near the end: fatigue, cravings, headaches.',
        'zh-CN': '孕激素主导。身体水肿——感觉浮肿。乳房胀痛。可能长痘。快结束时：极度疲劳、特别想吃东西、头痛。',
      },
      emotional: {
        sr: 'PMS faza: raspolozenje varira. Moze biti razdrazljiva, anksiozna, placljiva. Vazno: OVO NIJE ONA — ovo su hormoni. Ne uzimaj nista licno.',
        en: "PMS phase: mood swings. May be irritable, anxious, tearful. Important: THIS IS NOT HER — this is hormones. Dont take anything personally.",
        'zh-CN': 'PMS阶段：情绪波动。可能烦躁、焦虑、想哭。重要：这不是真的她——这是荷尔蒙。千万别往心里去。',
      },
      sex: {
        sr: 'Libido varira. U prvoj polovini moze biti raspolozena. Pred kraj — verovatno nece biti zainteresovana. Ne pritiskaj. Ako kaze ne — to je NE.',
        en: "Libido varies. First half may be in the mood. Near the end — probably not interested. Dont pressure. If she says no — it is NO.",
        'zh-CN': '性欲忽高忽低。前半段可能有兴致。快结束时——八成不想。别施压。她说不要就是真的不要。',
      },
      support: {
        sr: 'Caj bez kofeina • Slusaj — ne resavaj • Naruci njenu omiljenu hranu • Topla kupka, svece, muzika • Ponudi masazu',
        en: "Caffeine-free tea • Listen — dont solve • Order her favorite food • Warm bath, candles, music • Offer massage",
        'zh-CN': '无咖啡因茶 • 听就好——别解决 • 点她爱吃的 • 热水澡、蜡烛、音乐 • 主动给她按摩',
      },
      warning: {
        sr: 'Ne svadjaj se — ne mozes pobediti protiv hormona. Ne govori "ta ti je opet ono doba". Budi tu, cuti, zagrli.',
        en: 'Dont argue — you cant win against hormones. Dont say "is it that time again." Be there, be quiet, hug her.',
        'zh-CN': '别吵架——你跟荷尔蒙吵不赢。别说"你是不是又来那个了"。在就好、安静、抱住。',
      },
    },
  };

  /* ================================================================
     RENDER BARRY SYMPTOM VIEW — detailed cycle phase dashboard for Barry
     ================================================================ */

  function renderBarrySymptomView() {
    var isBarry = activeProfile === 'barry';
    var barryView = document.getElementById('barry-symptom-view');
    var angieView = document.getElementById('andjela-symptom-view');
    if (barryView) barryView.style.display = isBarry ? '' : 'none';
    if (angieView) angieView.style.display = isBarry ? 'none' : '';
    if (!isBarry) return;

    var container = document.getElementById('barrySymptomAnalysis');
    if (!container) return;

    var shared = getSharedCyclePhase();
    var phaseKey = shared && shared.phase ? shared.phase : 'general';
    var l = lang || 'sr';

    var titleEl = document.getElementById('bs-title');
    if (titleEl) {
      titleEl.textContent =
        l === 'sr' ? 'Analiza Andjelinog ciklusa' : l === 'en' ? 'Andjela Today — Full Analysis' : 'Andjela 今日详细分析';
    }

    if (phaseKey === 'general' || !PHASE_ANALYSIS[phaseKey]) {
      container.innerHTML =
        '<div class="card" style="text-align:center;padding:20px"><span style="font-size:3rem"></span><div style="font-size:.78rem;color:var(--text-muted);margin-top:8px">' +
        (l === 'sr' ? 'Cekam podatke sa Andjelinog telefona...' : l === 'en' ? "Waiting for data from Andjela's phone..." : '等待 Andjela 手机同步数据...') +
        '</div></div>';
      return;
    }

    var pa = PHASE_ANALYSIS[phaseKey];
    var colorMap = { period: 'var(--love)', follicular: 'var(--sage)', ovulation: 'var(--teal)', luteal: 'var(--lavender)' };
    var iconMap = { period: 'period', follicular: 'follicular', ovulation: 'ovulation', luteal: 'luteal' };
    var color = colorMap[phaseKey] || 'var(--love)';

    var h = '';
    h +=
      '<div class="card" style="border-left:5px solid ' +
      color +
      ';margin-bottom:10px;background:linear-gradient(135deg,var(--rose-light),var(--card));text-align:center;padding:18px">';
    h += '<div style="font-size:.95rem;font-weight:800;color:var(--text)">' + (pa.name[l] || pa.name['sr']) + '</div>';
    h += '<div style="font-size:.65rem;color:var(--text-muted)">' + (pa.days[l] || pa.days['sr']) + '</div>';
    if (shared && shared.nextStart)
      h +=
        '<div style="font-size:.62rem;color:var(--gold);margin-top:2px">' +
        (l === 'sr' ? 'Sledeca: ' + shared.nextStart : l === 'en' ? 'Next: ' + shared.nextStart : '下次: ' + shared.nextStart) +
        '</div>';
    h += '</div>';

    h += '<div class="card" style="padding:14px;margin-bottom:10px"><div style="display:flex;justify-content:space-around;text-align:center">';
    h +=
      '<div><div style="font-size:.62rem;color:var(--text-muted);margin-bottom:2px">' +
      (l === 'sr' ? 'Energija' : l === 'en' ? 'Energy' : '精力') +
      '</div><div style="font-size:.82rem">' +
      (pa.energy[l] || pa.energy['sr']) +
      '</div></div>';
    h +=
      '<div><div style="font-size:.62rem;color:var(--text-muted);margin-bottom:2px">' +
      (l === 'sr' ? 'Libido' : l === 'en' ? 'Libido' : '性欲') +
      '</div><div style="font-size:.82rem">' +
      (pa.libido[l] || pa.libido['sr']) +
      '</div></div>';
    h += '</div></div>';

    h +=
      '<div class="card" style="padding:14px;margin-bottom:10px"><div style="font-weight:700;font-size:.74rem;margin-bottom:4px">' +
      (l === 'sr' ? 'Fizicke promene' : l === 'en' ? 'Physical Changes' : '身体变化') +
      '</div><div style="font-size:.72rem;color:var(--text-muted);line-height:1.7">' +
      (pa.physical[l] || pa.physical['sr']) +
      '</div></div>';
    h +=
      '<div class="card" style="padding:14px;margin-bottom:10px"><div style="font-weight:700;font-size:.74rem;margin-bottom:4px">' +
      (l === 'sr' ? 'Emocionalno stanje' : l === 'en' ? 'Emotional State' : '情绪状态') +
      '</div><div style="font-size:.72rem;color:var(--text-muted);line-height:1.7">' +
      (pa.emotional[l] || pa.emotional['sr']) +
      '</div></div>';
    h +=
      '<div class="card" style="padding:14px;margin-bottom:10px;border-left:4px solid var(--love)"><div style="font-weight:700;font-size:.74rem;margin-bottom:4px">' +
      (l === 'sr' ? 'Seks i intimnost' : l === 'en' ? 'Sex & Intimacy' : '性爱与亲密') +
      '</div><div style="font-size:.72rem;color:var(--text-muted);line-height:1.7">' +
      (pa.sex[l] || pa.sex['sr']) +
      '</div></div>';
    h +=
      '<div class="card" style="padding:14px;margin-bottom:10px;background:linear-gradient(135deg,var(--teal-light),var(--card))"><div style="font-weight:700;font-size:.74rem;margin-bottom:4px">' +
      (l === 'sr' ? 'Kako da joj pomognes' : l === 'en' ? 'How to Support Her' : '怎么帮她') +
      '</div><div style="font-size:.72rem;color:var(--text);line-height:1.8">' +
      (pa.support[l] || pa.support['sr']) +
      '</div></div>';
    h +=
      '<div class="card" style="padding:12px;margin-bottom:10px;background:var(--rose-light);border:1px solid var(--rose)"><div style="font-weight:700;font-size:.7rem;margin-bottom:2px">' +
      (l === 'sr' ? 'Sta NE raditi' : l === 'en' ? 'What NOT to do' : '千万别做') +
      '</div><div style="font-size:.68rem;color:var(--rose-dark);line-height:1.5">' +
      (pa.warning[l] || pa.warning['sr']) +
      '</div></div>';
    container.innerHTML = h;
  }

  /* ================================================================
     UPDATE SHARED SYMPTOMS — pushes Andjela's symptoms to shared storage
     ================================================================ */

  function updateSharedSymptoms() {
    if (activeProfile !== 'andjela') return;
    var key = fmtDate(today());
    var symptoms = state.symptoms[key];
    if (symptoms) {
      localStorage.setItem('shared-symptoms', JSON.stringify(symptoms));
      if (typeof pushAllSharedData === 'function') {
        pushAllSharedData();
      }
    }
  }

  /* ================================================================
     SLEEP TRACKER — Barry logs sleep time, Andjela sees it
     ================================================================ */

  function saveSleep() {
    var time = document.getElementById('sleepTime').value;
    if (!time) return;
    var entry = { time: time, date: fmtDate(new Date()), saved: Date.now() };
    localStorage.setItem('barry-sleep', JSON.stringify(entry));
    if (typeof pushAllSharedData === 'function') {
      pushAllSharedData();
    }
    renderSleepCard();
  }

  function getBarrySleep() {
    try {
      var v = localStorage.getItem('barry-sleep');
      return v ? JSON.parse(v) : null;
    } catch (e) {
      return null;
    }
  }

  function renderSleepCard() {
    var card = document.getElementById('sleepCard');
    if (!card) return;
    card.style.display = '';

    var titleEl = document.getElementById('sleep-title');
    if (titleEl) {
      titleEl.textContent = t('sleepTitle');
    }

    if (activeProfile === 'barry') {
      var barryView = document.getElementById('sleepBarryView');
      var angieView = document.getElementById('sleepAngieView');
      if (barryView) barryView.style.display = '';
      if (angieView) angieView.style.display = 'none';

      var hintEl = document.getElementById('sleep-hint');
      if (hintEl) {
        hintEl.textContent = t('sleepHint');
      }

      var saveEl = document.getElementById('sleep-save');
      if (saveEl) {
        saveEl.textContent = t('sleepSave');
      }

      var s = getBarrySleep();
      var inputEl = document.getElementById('sleepTime');
      if (s && inputEl) inputEl.value = s.time;
    } else {
      // Angie's view
      var barryView2 = document.getElementById('sleepBarryView');
      var angieView2 = document.getElementById('sleepAngieView');
      if (barryView2) barryView2.style.display = 'none';
      if (angieView2) angieView2.style.display = '';

      var s = getBarrySleep();
      var contentEl = document.getElementById('sleepAngieContent');
      if (!contentEl) return;

      if (!s) {
        contentEl.innerHTML =
          '<div style="text-align:center;color:var(--text-muted);font-size:.72rem">' +
          t('sleepEmpty') +
          '</div>';
        return;
      }

      var timeParts = s.time.split(':');
      var hour = parseInt(timeParts[0], 10);
      var min = parseInt(timeParts[1], 10);
      var lateMsg = '';

      if (hour >= 2 || (hour === 1 && min >= 30)) {
        if (lang === 'sr') {
          lateMsg =
            '<div style="background:var(--rose-light);border-radius:12px;padding:12px;margin-top:8px;text-align:center"><span style="font-size:1.5rem">💔</span><div style="font-size:.76rem;color:var(--rose-dark);font-weight:700;line-height:1.6">Legao je u ' +
            s.time +
            '! To je PREKASNO!</div><div style="font-size:.68rem;color:var(--rose-dark);margin-top:4px;line-height:1.5">Srce mu pati kad spava manje od 6 sati. Dugorocno — rizik od srcanih bolesti raste za 48%. Treba mu 7-8 sati sna. Ti si jedina koja moze da ga natera da legne ranije. Reci mu veceras — "Barry, molim te, idi u krevet pre pola 2. Za mene. 💗"</div></div>';
        } else if (lang === 'en') {
          lateMsg =
            '<div style="background:var(--rose-light);border-radius:12px;padding:12px;margin-top:8px;text-align:center"><span style="font-size:1.5rem">💔</span><div style="font-size:.76rem;color:var(--rose-dark);font-weight:700;line-height:1.6">He slept at ' +
            s.time +
            "! That's WAY too late!</div><div style=\"font-size:.68rem;color:var(--rose-dark);margin-top:4px;line-height:1.5\">His heart suffers with less than 6 hours of sleep. Long-term heart disease risk increases 48%. He needs 7-8 hours. You're the only one who can make him sleep earlier. Tell him tonight — \"Barry, please go to bed before 1:30 AM. For me. 💗\"</div></div>";
        } else {
          lateMsg =
            '<div style="background:var(--rose-light);border-radius:12px;padding:12px;margin-top:8px;text-align:center"><span style="font-size:1.5rem">💔</span><div style="font-size:.76rem;color:var(--rose-dark);font-weight:700;line-height:1.6">他 ' +
            s.time +
            ' 才睡！太晚了！</div><div style="font-size:.68rem;color:var(--rose-dark);margin-top:4px;line-height:1.5">睡眠不足6小时，心脏长期受损，心脏病风险增加48%。他需要7-8小时睡眠。只有你能让他早点睡。今晚就告诉他——"Barry，为了我今晚1:30以前就睡觉！💗"</div></div>';
        }
      }

      contentEl.innerHTML =
        '<div style="text-align:center"><span style="font-size:2rem">😴</span><div style="font-size:.78rem;color:var(--text);margin-top:4px">' +
        t('sleepLabel') +
        ' <b>' +
        s.time +
        '</b></div><div style="font-size:.62rem;color:var(--text-muted)">' +
        s.date +
        '</div></div>' +
        lateMsg;
    }
  }

  /* ================================================================
     SPECIAL BADGE — daily affirmation for Andjela
     ================================================================ */

  function renderSpecialBadge() {
    var badge = document.getElementById('specialBadge');
    if (!badge) return;
    if (activeProfile !== 'andjela') {
      badge.style.display = 'none';
      return;
    }
    badge.style.display = '';
    var texts = t('specialBadgeTexts');
    var textEl = document.getElementById('specialBadgeText');
    if (textEl) textEl.textContent = texts[Math.floor(Math.random() * texts.length)];
  }

  /* ================================================================
     PUBLIC API — preserve backward-compatible global function names
     ================================================================ */

  return {
    getSharedCyclePhase: getSharedCyclePhase,
    updateSharedCycleInfo: updateSharedCycleInfo,
    renderBarrySymptomView: renderBarrySymptomView,
    updateSharedSymptoms: updateSharedSymptoms,
    saveSleep: saveSleep,
    getBarrySleep: getBarrySleep,
    renderSleepCard: renderSleepCard,
    renderSpecialBadge: renderSpecialBadge,
    SYMPTOM_HELP: SYMPTOM_HELP,
    PHASE_ANALYSIS: PHASE_ANALYSIS,
  };
})();

/* NOTE: Globals (renderBarrySymptomView, saveSleep, etc.) are
   defined in app.js. Do NOT redefine them here — app.js function
   declarations would win and these would be wasted assignments.
   BarryModule provides namespaced access for future migration. */

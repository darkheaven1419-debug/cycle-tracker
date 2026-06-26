/**
 * BarryModule — Barry-specific features & data.
 *
 * Functions (renderBarrySymptomView, saveSleep, renderSleepCard,
 * renderSpecialBadge, getSharedCyclePhase, etc.) are defined in
 * app.js and loaded via index.html. This module provides unique
 * data structures and a placeholder for future modularization.
 *
 * Data provided:
 *   SYMPTOM_HELP — cause/help explanations for each symptom type
 */

'use strict';

const BarryModule = (function () {

  /* ================================================================
     SYMPTOM HELP — cause & support explanations for Barry's view
     (Unique to this module — not duplicated in app.js)
     ================================================================ */

  const SYMPTOM_HELP = {
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
     PUBLIC API
     ================================================================ */

  return {
    SYMPTOM_HELP: SYMPTOM_HELP,
  };
})();

/**
 * WeatherModule — 双城天气（北京 ↔ Kikinda）+ 太阳计数器 + 每日情话
 *
 * Dependencies (global): state, lang, L(), t(), pushAllSharedData, localStorage
 * DOM IDs used: weatherBj, weatherKi, weatherTimes, sunCounter, weatherNightHint,
 *               dailyLoveMsg, weatherLove, timeBj, timeKi, timeDiff, weatherCard,
 *               weatherBridge, titleLoveCounter, love-days-content, love-days-title
 *
 * Backward compatible: the global functions (fetchWeather, renderWeather, weatherIcon,
 * clickSunCounter, renderSunCounter) are preserved by delegating to the module.
 */
var WeatherModule = (function () {
  'use strict';

  /* ── Daily Love Messages ── */
  const DAILY_LOVE_MESSAGES = [
    { zh: '不管多远，我的心和你在一起。', sr: 'Bez obzira na udaljenost, moje srce je s tobom.' },
    { zh: '7000公里，但思念没有距离。', sr: '7.000 kilometara, ali čežnja nema udaljenost.' },
    { zh: '你是我早上醒来的第一个念头。', sr: 'Ti si moja prva misao kad se probudim.' },
    { zh: '同一个太阳，同一份爱。', sr: 'Jedno sunce, jedna ljubav.' },
    { zh: '每次抬头看天空，我知道你也在这片天空下。', sr: 'Svaki put kad pogledam u nebo, znam da si i ti pod istim nebom.' },
    { zh: '从北京到贝尔格莱德，我的心跳只为你。', sr: 'Od Pekinga do Beograda, moje srce kuca samo za tebe.' },
    { zh: '你是我跨越山海的理由。', sr: 'Ti si razlog zbog kog prelazim planine i mora.' },
    { zh: '爱不是距离除以时间，爱是心与心的零距离。', sr: 'Ljubav nije udaljenost podeljena vremenom, ljubav je nulta udaljenost između srca.' },
    { zh: '有人问我想去哪里，我说：去有你的地方。', sr: 'Pitaju me gde želim da idem, ja kažem: tamo gde si ti.' },
    { zh: '世界上最美的距离，是你和我之间的距离。', sr: 'Najlepša udaljenost na svetu je ona između tebe i mene.' },
    { zh: '今天也想你，比昨天多一点，比明天少一点。', sr: 'I danas mislim na tebe, malo više nego juče, malo manje nego sutra.' },
    { zh: '你是我此生最美的风景。', sr: 'Ti si najlepši prizor u mom životu.' },
  ];

  /* ── Anniversary / Met dates from global state ── */
  function annDateLove() {
    return typeof state !== 'undefined' && state.annDateLove ? state.annDateLove : '2023-10-18';
  }
  function annDateMet() {
    return typeof state !== 'undefined' && state.annDateMet ? state.annDateMet : null;
  }

  function daysDiff(a, b) {
    return Math.round((b.getTime() - a.getTime()) / 86400000);
  }

  function today() {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function safeParse(json, fallback) {
    try {
      return JSON.parse(json);
    } catch (e) {
      return fallback;
    }
  }

  function getTodaysLoveMessage() {
    const idx = new Date().getDate() % DAILY_LOVE_MESSAGES.length;
    return DAILY_LOVE_MESSAGES[idx];
  }

  function getSunCounterData() {
    return safeParse(localStorage.getItem('shared-sun-counter'), {});
  }

  /* ── Sun Counter ── */
  function clickSunCounter() {
    const sc = getSunCounterData();
    const todayStr = new Date().toISOString().slice(0, 10);
    if (sc.lastDate === todayStr) {
      toast('❤️ ' + L('Već si kliknuo/la danas!', 'Already clicked today!', '今天已经点过了！'));
      return;
    }
    sc.count = (sc.count || 0) + 1;
    sc.lastDate = todayStr;
    localStorage.setItem('shared-sun-counter', JSON.stringify(sc));
    if (typeof pushAllSharedData === 'function') pushAllSharedData();
    renderSunCounter();
    toast('☀️ ' + L('Dan ' + sc.count + ' zajedničkog sunca!', 'Day ' + sc.count + ' of shared sun!', '共同仰望太阳的第' + sc.count + '天！'));
  }

  function renderSunCounter() {
    const el = document.getElementById('sunCounter');
    if (!el) return;
    const sc = getSunCounterData();
    const c = sc.count || 0;
    if (c > 0) {
      el.innerHTML = '☀️ ' + L(c + ' dan zajedničkog sunca ❤️', 'Day ' + c + ' of shared sun ❤️', '共同仰望太阳的第 ' + c + ' 天 ❤️');
    } else {
      el.innerHTML = '❤️ ' + L('Klikni ovde da započneš brojanje', 'Click here to start counting', '点击此处开始计数');
    }
  }

  /* ── Weather Icon ── */
  function weatherIcon(code) {
    if (code <= 3) return '☀️';
    if (code <= 48) return '⛅';
    if (code <= 57) return '🌧️';
    if (code <= 67) return '🌨️';
    if (code <= 77) return '🌫️';
    if (code <= 86) return '❄️';
    return '⛈️';
  }

  /* ── Fetch Weather ── */
  function fetchWeather() {
    const cached = localStorage.getItem('cycle-weather');
    // Always show cached weather first (even if old — better than nothing)
    if (cached) {
      try {
        const d = JSON.parse(cached);
        renderWeather(d);
      } catch (e) {
        console.warn('[weather] Bad cached data');
      }
    }
    // Refresh in background (6h cache)
    if (cached) {
      try {
        const d2 = JSON.parse(cached);
        if (Date.now() - d2.t < 21600000) return;
      } catch (e) {
        console.warn('[weather] Bad cache');
      }
    }
    const controller = new AbortController();
    const timeout = setTimeout(function () {
      controller.abort();
    }, 8000);
    try {
      const bj = fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=39.92&longitude=116.44&current=temperature_2m,relative_humidity_2m,weather_code&daily=sunrise,sunset&timezone=Asia/Shanghai',
        { signal: controller.signal }
      )
        .then(function (r) {
          return r.json();
        })
        .catch(function () {
          return null;
        });
      const ki = fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=45.83&longitude=20.47&current=temperature_2m,relative_humidity_2m,weather_code&daily=sunrise,sunset&timezone=Europe/Belgrade',
        { signal: controller.signal }
      )
        .then(function (r) {
          return r.json();
        })
        .catch(function () {
          return null;
        });
      Promise.all([bj, ki])
        .then(function (r) {
          clearTimeout(timeout);
          if (!r[0] && !r[1]) return; // both failed
          const bjD = r[0] ? r[0].current : null;
          if (bjD && r[0].daily) {
            bjD.sunrise = r[0].daily.sunrise[0];
            bjD.sunset = r[0].daily.sunset[0];
          }
          const kiD = r[1] ? r[1].current : null;
          if (kiD && r[1].daily) {
            kiD.sunrise = r[1].daily.sunrise[0];
            kiD.sunset = r[1].daily.sunset[0];
          }
          const w = { bj: bjD, ki: kiD, t: Date.now() };
          localStorage.setItem('cycle-weather', JSON.stringify(w));
          renderWeather(w);
        })
        .catch(function () {});
    } catch (e) {
      console.warn('[weather] Forecast fetch failed');
    }
  }

  /* ── Update Time Display ── */
  function updateWeatherTimes() {
    const bjT = new Date().toLocaleString('sr-Latn', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hour12: false });
    const kiT = new Date().toLocaleString('sr-Latn', { timeZone: 'Europe/Belgrade', hour: '2-digit', minute: '2-digit', hour12: false });
    const bjEl = document.getElementById('timeBj');
    if (bjEl) bjEl.textContent = bjT;
    const kiEl = document.getElementById('timeKi');
    if (kiEl) kiEl.textContent = kiT;
    const diffEl = document.getElementById('timeDiff');
    if (diffEl) {
      const bjH = parseInt(bjT),
        kiH = parseInt(kiT);
      let diff = bjH - kiH;
      if (diff < 0) diff += 24;
      diffEl.textContent = L('razlika ', 'time diff ', '时差 ') + diff + 'h';
    }
  }

  /* ── Render Weather ── */
  function renderWeather(w) {
    const card = document.getElementById('weatherCard');
    if (!w) {
      card.style.display = '';
      card.innerHTML =
        '<div style="text-align:center;padding:20px"><div class="skeleton" style="width:200px;height:20px;margin:8px auto;border-radius:8px"></div><div class="skeleton" style="width:140px;height:14px;margin:6px auto;border-radius:6px"></div><div style="font-size:.6rem;color:var(--text-muted);margin-top:8px">' +
        L('Učitavam vreme...', 'Loading weather...', '加载天气中...') +
        '</div></div>';
      return;
    }
    card.style.display = '';
    const bjLabel = lang === 'sr' ? '🏙 Peking·Čaojang' : lang === 'en' ? '🏙 Beijing·Chaoyang' : '🏙 北京·朝阳';
    const kiLabel = lang === 'sr' ? '🏡 Kikinda' : lang === 'en' ? '🏡 Kikinda' : '🏡 Kikinda';
    const humLabel = lang === 'sr' ? 'Vlažnost' : lang === 'en' ? 'Humidity' : '湿度';
    document.getElementById('weatherBj').innerHTML =
      '<div style="font-size:.65rem;color:var(--text-muted)">' +
      bjLabel +
      '</div><div style="font-size:1.5rem;font-weight:700">' +
      Math.round(w.bj.temperature_2m) +
      '°</div><div style="font-size:1.2rem">' +
      weatherIcon(w.bj.weather_code) +
      '</div><div style="font-size:.6rem;color:var(--text-muted)">' +
      humLabel +
      ' ' +
      w.bj.relative_humidity_2m +
      '%</div>';
    document.getElementById('weatherKi').innerHTML =
      '<div style="font-size:.65rem;color:var(--text-muted)">' +
      kiLabel +
      '</div><div style="font-size:1.5rem;font-weight:700">' +
      Math.round(w.ki.temperature_2m) +
      '°</div><div style="font-size:1.2rem">' +
      weatherIcon(w.ki.weather_code) +
      '</div><div style="font-size:.6rem;color:var(--text-muted)">' +
      humLabel +
      ' ' +
      w.ki.relative_humidity_2m +
      '%</div>';
    // Bridge Poetry — i18n-aware
    const poems = [],
      bjc = w.bj.weather_code,
      kic = w.ki.weather_code;
    const sameWeather = (bjc <= 3 && kic <= 3) || (bjc >= 45 && kic >= 45) || (bjc >= 71 && kic >= 71);
    if (sameWeather && bjc <= 3)
      {poems.push({
        txt:
          lang === 'sr'
            ? 'Sunce sija i u Pekingu i u Kikindi ☀️ — isto sunce greje oba naša srca.'
            : lang === 'en'
              ? 'The sun shines on both Beijing and Kikinda ☀️ — the same sun warms both our hearts.'
              : '北京和Kikinda阳光普照 ☀️ — 同一个太阳温暖我们的心。',
        barry:
          lang === 'sr'
            ? 'Barry kaže: Kad pogledaš u sunce, seti se — ja gledam u isto to sunce ovde u Pekingu. 7.000 kilometara, jedno sunce. ♥'
            : lang === 'en'
              ? "Barry says: When you look at the sun, remember — I'm looking at the same sun in Beijing. 7,000 km, one sun. ♥"
              : 'Barry说：当你看着太阳，记住——我在北京也看着同一轮太阳。7000公里，同一个太阳。♥',
      });}
    else if (sameWeather && kic >= 45 && kic <= 67)
      {poems.push({
        txt:
          lang === 'sr'
            ? 'Kiša pada i na Vojvodinu i na Peking 🌧️ — iste kapi, dva različita sveta.'
            : lang === 'en'
              ? 'Rain falls on both Vojvodina and Beijing 🌧️ — same drops, two different worlds.'
              : '雨水落在Vojvodina和北京 🌧️ — 同样的雨滴，两个不同的世界。',
        barry:
          lang === 'sr'
            ? 'Barry kaže: Dok kiša pada po tvojoj Vojvodini, ja slušam kišu u Pekingu i mislim na tebe. Kiša spaja sve. 🌧️♥'
            : lang === 'en'
              ? 'Barry says: While rain falls on your Vojvodina, I listen to the rain in Beijing and think of you. Rain connects everything. 🌧️♥'
              : 'Barry说：雨落在你的Vojvodina，我在北京听着雨声想你。雨水连接一切。🌧️♥',
      });}
    else
      {poems.push({
        txt:
          lang === 'sr'
            ? 'Različito nebo, isto srce 🌍 — od Pekinga do Kikinde, od Dunava do Jangcea.'
            : lang === 'en'
              ? 'Different skies, one heart 🌍 — from Beijing to Kikinda, from Danube to Yangtze.'
              : '不同的天空，同一颗心 🌍 — 从北京到Kikinda，从多瑙河到长江。',
        barry:
          lang === 'sr'
            ? 'Barry kaže: Dunav teče kroz tvoj grad, Jangce kroz moj. Dve reke, jedna ljubav koja teče između nas. ♥'
            : lang === 'en'
              ? 'Barry says: The Danube flows through your town, the Yangtze through mine. Two rivers, one love flowing between us. ♥'
              : 'Barry说：多瑙河流过你的城市，长江流过我的。两条河流，一份在我们之间流淌的爱。♥',
      });}
    poems.push({
      txt:
        lang === 'sr'
          ? 'Sa Dunava na Jangce — ljubav teče kao reka 🌊'
          : lang === 'en'
            ? 'From Danube to Yangtze — love flows like a river 🌊'
            : '从多瑙河到长江 — 爱如河流 🌊',
      barry:
        lang === 'sr'
          ? 'Od ravnice do Pekinga, od šljivovice do čaja — naša priča je most između dva sveta.'
          : lang === 'en'
            ? 'From plains to Beijing, from rakija to tea — our story bridges two worlds.'
            : '从平原到北京，从李子酒到茶——我们的故事连接两个世界。',
    });
    const poem = poems[Math.floor(Math.random() * poems.length)];
    document.getElementById('weatherLove').innerHTML =
      '<div style="font-style:italic;margin-bottom:4px">"' +
      poem.txt +
      '"</div><div style="font-size:.62rem;opacity:.82;line-height:1.5">' +
      poem.barry +
      '</div>';
    document.getElementById('weatherLove').style.display = '';
    updateWeatherTimes();
    const lm = getTodaysLoveMessage();
    const lmEl = document.getElementById('dailyLoveMsg');
    if (lmEl) lmEl.textContent = '💌 ' + ((lang || '').indexOf('zh') === 0 ? lm.zh : (lang || '').indexOf('en') === 0 ? lm.en : lm.sr);
    renderSunCounter();
    const nh = document.getElementById('weatherNightHint');
    if (nh) {
      const kiH = new Date().toLocaleString('en-US', { timeZone: 'Europe/Belgrade', hour: 'numeric', hour12: false });
      if (parseInt(kiH) >= 22 || parseInt(kiH) <= 5) {
        nh.style.display = '';
        nh.textContent = L(
          '🌙 Kod tebe je kasno - vreme za spavanje, Anđela 🛏️',
          '🌙 Kikinda现在是深夜，Angie该休息了',
          "🌙 It's late in Kikinda — time for sleep, Anđela 🛏️"
        );
      } else {
        nh.style.display = 'none';
      }
    }
    // Update bridge text dynamically
    const bridge = document.getElementById('weatherBridge');
    if (bridge) {
      const bjt = Math.round(w.bj.temperature_2m),
        kit = Math.round(w.ki.temperature_2m);
      const diff = Math.abs(bjt - kit);
      const conn =
        diff <= 3
          ? lang === 'sr'
            ? 'Ista toplina 🌡️♥'
            : lang === 'en'
              ? 'Same warmth 🌡️♥'
              : '同样温度 🌡️♥'
          : lang === 'sr'
            ? 'Razlika ' + diff + '° 🌡️'
            : lang === 'en'
              ? diff + '° apart 🌡️'
              : '温差 ' + diff + '° 🌡️';
      const dnName = L('Dunav', 'Danube', '多瑙河'),
        jcName = L('Jangce', 'Yangtze', '长江');
      bridge.innerHTML = '🌉  ' + dnName + ' → ' + jcName + '<br>Kikinda ' + kit + '° ↔ ' + bjt + '° ' + L('Peking', 'Beijing', '北京') + '<br>' + conn;
    }
  }

  /* ── Love Counter ── */
  function updateLoveCounter() {
    const el = document.getElementById('titleLoveCounter');
    if (!el || !annDateLove()) return;
    const days = daysDiff(new Date(annDateLove()), today());
    if (days >= 0) el.textContent = '♥ ' + days + (lang === 'sr' ? ' dana zajedno' : lang === 'en' ? ' days together' : ' 天在一起');
    // Also update the stats card
    const card = document.getElementById('love-days-content');
    if (!card) return;
    const parts = [];
    if (annDateMet()) {
      var d = daysDiff(new Date(annDateMet()), today());
      if (d >= 0)
        {parts.push(
          '<div style="font-size:.85rem"><span style="color:var(--gold)">✨</span> ' +
            d +
            (lang === 'sr' ? ' dana od prvog susreta' : lang === 'en' ? ' days since we met' : ' 天前初次相遇') +
            '</div>'
        );}
    }
    if (annDateLove()) {
      var d = daysDiff(new Date(annDateLove()), today());
      if (d >= 0)
        {parts.push(
          '<div style="font-size:1.2rem;font-weight:700;color:var(--love)">♥ ' +
            d +
            (lang === 'sr' ? ' dana zajedno' : lang === 'en' ? ' days together' : ' 天在一起') +
            '</div>'
        );}
    }
    card.innerHTML = parts.join('<div style="height:4px"></div>');
    const titleEl = document.getElementById('love-days-title');
    if (titleEl) titleEl.textContent = lang === 'sr' ? '💕 Dani zajedno' : lang === 'en' ? '💕 Our Days' : '💕 我们的日子';
  }

  /* ── Random "Thinking of You" ── */
  function randomThinkingOfYou() {
    if (typeof activeProfile !== 'undefined' && activeProfile !== 'andjela') return;
    if (Math.random() > 0.18) return; // 18% chance
    const msgs =
      lang === 'sr'
        ? [
            'Upravo sam pomislio na tebe ♥',
            'Nadam se da se osećaš dobro danas ✨',
            'Tvoj osmeh mi je najdraža stvar 🌸',
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
    if (typeof toast === 'function')
      {setTimeout(function () {
        toast(msg);
      }, 3000);}
  }

  /* ── Init: start time updater ── */
  function init() {
    setInterval(updateWeatherTimes, 60000);
  }

  /* ── Public API ── */
  return {
    init: init,
    fetchWeather: fetchWeather,
    renderWeather: renderWeather,
    weatherIcon: weatherIcon,
    clickSunCounter: clickSunCounter,
    renderSunCounter: renderSunCounter,
    updateLoveCounter: updateLoveCounter,
    randomThinkingOfYou: randomThinkingOfYou,
    getTodaysLoveMessage: getTodaysLoveMessage,
    updateWeatherTimes: updateWeatherTimes,
    DAILY_LOVE_MESSAGES: DAILY_LOVE_MESSAGES,
  };
})();

/* ── Backward compatibility: delegate global functions to module ── */
var fetchWeather = WeatherModule.fetchWeather;
var renderWeather = WeatherModule.renderWeather;
var weatherIcon = WeatherModule.weatherIcon;
var clickSunCounter = WeatherModule.clickSunCounter;
var renderSunCounter = WeatherModule.renderSunCounter;
var updateWeatherTimes = WeatherModule.updateWeatherTimes;
var updateLoveCounter = WeatherModule.updateLoveCounter;
var randomThinkingOfYou = WeatherModule.randomThinkingOfYou;
var getTodaysLoveMessage = WeatherModule.getTodaysLoveMessage;

/* ── Keep global DAILY_LOVE_MESSAGES for any remaining references ── */
var DAILY_LOVE_MESSAGES = WeatherModule.DAILY_LOVE_MESSAGES;

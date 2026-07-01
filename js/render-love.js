/* render-love.js — Love features (hugs, gratitude, checkin, songs, know-me quiz, tips) — extracted from app.js v7.1 */

const HUG_EXPIRY_MS = 86400000;
let _gratNotes = null;
const KNOW_ME_QUESTIONS = [
  { key: 'fav_city', q: { sr: 'Koji je omiljeni grad tvog/tvoje partnera?', zh: '对方最喜欢的城市是哪里？', en: "What is your partner's favorite city?" } },
  {
    key: 'first_date_color',
    q: {
      sr: 'Šta je tvoj/tvoja partner/ka nosio/la na prvom sastanku?',
      zh: '第一次约会对方穿什么颜色的衣服？',
      en: 'What color did your partner wear on your first date?',
    },
  },
  {
    key: 'dream_trip',
    q: { sr: 'Gde bi tvoj/tvoja partner/ka najradije putovao/la?', zh: '对方最想去的旅行目的地是哪里？', en: 'Where does your partner dream of traveling to?' },
  },
  {
    key: 'comfort_food',
    q: { sr: 'Koja je omiljena hrana tvog/tvoje partnera za utehu?', zh: '对方心情不好时最爱吃什么？', en: 'What comfort food does your partner reach for?' },
  },
  {
    key: 'hidden_talent',
    q: { sr: 'Koji skriveni talenat ima tvoj/tvoja partner/ka?', zh: '对方有什么隐藏的才艺？', en: 'What hidden talent does your partner have?' },
  },
  {
    key: 'childhood_dream',
    q: {
      sr: 'Šta je tvoj/tvoja partner/ka želeo/la da bude kao dete?',
      zh: '对方小时候的梦想职业是什么？',
      en: 'What did your partner dream of becoming as a child?',
    },
  },
  { key: 'pet_peeve', q: { sr: 'Šta tvog/tvoju partnera/ku najviše nervira?', zh: '对方最讨厌的事情是什么？', en: 'What annoys your partner the most?' } },
  {
    key: 'perfect_day',
    q: {
      sr: 'Kako izgleda savršen dan za tvog/tvoju partnera/ku?',
      zh: '对方心目中的完美一天是怎样的？',
      en: "What does your partner's perfect day look like?",
    },
  },
  {
    key: 'music_taste',
    q: {
      sr: 'Koja je omiljena pesma tvog/tvoje partnera trenutno?',
      zh: '对方最近单曲循环的歌是什么？',
      en: 'What song is your partner playing on repeat lately?',
    },
  },
  {
    key: 'love_language',
    q: { sr: 'Koji je glavni jezik ljubavi tvog/tvoje partnera?', zh: '对方最重要的爱的语言是什么？', en: "What is your partner's primary love language?" },
  },
  {
    key: 'smell_memory',
    q: { sr: 'Koji miris podseća tvog/tvoju partnera/ku na vas?', zh: '什么味道会让对方想起你？', en: 'What scent reminds your partner of you?' },
  },
  {
    key: 'future_5years',
    q: {
      sr: 'Gde tvoj/tvoja partner/ka vidi sebe za 5 godina?',
      zh: '对方觉得五年后的自己会在哪里？',
      en: 'Where does your partner see themselves in 5 years?',
    },
  },
  {
    key: 'best_quality',
    q: {
      sr: 'Šta tvoj/tvoja partner/ka najviše ceni kod sebe?',
      zh: '对方最欣赏自己的哪个品质？',
      en: 'What quality does your partner admire most in themselves?',
    },
  },
  {
    key: 'favorite_memory',
    q: {
      sr: 'Koje je omiljeno zajedničko sećanje tvog/tvoje partnera?',
      zh: '对方最喜欢你们在一起时的哪个回忆？',
      en: "What is your partner's favorite shared memory with you?",
    },
  },
  {
    key: 'morning_routine',
    q: {
      sr: 'Kako tvoj/tvoja partner/ka započinje jutro?',
      zh: '对方早上起来做的第一件事是什么？',
      en: 'What is the first thing your partner does in the morning?',
    },
  },
];

const CHECKIN_QUESTIONS = {
  sr: [
    { q: 'Kako se osećaš u vezi ove nedelje?', opts: ['😍 Sjajno', '😊 Dobro', '😐 Ok', '😞 Loše'] },
    { q: 'Da li smo dovoljno komunicirali?', opts: ['💬 Da, odlično', '👍 Uglavnom', '🤔 Moglo bi bolje', '👎 Ne baš'] },
    {
      q: 'Šta bi voleo/la da poboljšamo sledeće nedelje?',
      opts: ['💏 Više zajedničkog vremena', '💬 Bolja komunikacija', '🔥 Više romantike', '🤝 Više podrške'],
    },
  ],
  'zh-CN': [
    { q: '这周的感情状态怎么样？', opts: ['😍 很棒', '😊 不错', '😐 一般', '😞 不太好'] },
    { q: '我们这周的沟通足够吗？', opts: ['💬 很好', '👍 还行', '🤔 可以更好', '👎 不太够'] },
    { q: '下周希望我们哪方面做得更好？', opts: ['💏 更多陪伴', '💬 更好交流', '🔥 更多浪漫', '🤝 更多支持'] },
  ],
  en: [
    { q: 'How do you feel about this week together?', opts: ['😍 Amazing', '😊 Good', '😐 OK', '😞 Not great'] },
    { q: 'Did we communicate enough?', opts: ['💬 Yes, great', '👍 Mostly', '🤔 Could improve', '👎 Not really'] },
    { q: 'What would you like more of next week?', opts: ['💏 More time together', '💬 Better talks', '🔥 More romance', '🤝 More support'] },
  ],
};

function spawnFloatingHearts(container) {
  const hearts = ['💕', '💖', '💗', '💝', '✨', '💫'];
  for (let i = 0; i < 8; i++) {
    (function (idx) {
      setTimeout(function () {
        const h = document.createElement('span');
        h.className = 'floating-heart';
        h.textContent = hearts[idx % hearts.length];
        h.style.left = 20 + Math.random() * 60 + '%';
        h.style.bottom = '20px';
        container.appendChild(h);
        setTimeout(function () {
          if (h.parentNode) h.remove();
        }, 1300);
      }, idx * 80);
    })(i);
  }
}
function getHugStreak() {
  const allData = loadSharedDiaryData();
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = fmtDate(d);
    const day = allData[key];
    if (day && day['barry'] && day['barry'].hug && day['andjela'] && day['andjela'].hug) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
function sendHug(hugBack) {
  const todayKey = fmtDate(new Date());
  let count = parseInt(localStorage.getItem('hug-count-' + todayKey) || '0');
  if (count >= 2) {
    toast(t('hugLimit'));
    return;
  }
  count++;
  localStorage.setItem('hug-count-' + todayKey, count);
  const hug = { from: activeProfile, time: Date.now() };
  localStorage.setItem('shared-hug', JSON.stringify(hug));
  const allData = loadSharedDiaryData();
  if (!allData[todayKey]) allData[todayKey] = {};
  if (!allData[todayKey][activeProfile]) allData[todayKey][activeProfile] = {};
  allData[todayKey][activeProfile].hug = { time: Date.now() };
  saveSharedDiaryData(allData);
  const btn = document.getElementById('hugSendBtn');
  if (btn) {
    btn.classList.add('sending');
    setTimeout(function () {
      btn.classList.remove('sending');
    }, 600);
  }
  const card = document.getElementById('hugCard');
  if (card) spawnFloatingHearts(card);
  renderHug();
  toast('🤗 ' + (activeProfile === 'barry' ? t('hugSentBarry') : t('hugSentAndjela')) + ' (' + count + '/2)');
}
function checkHug() {
  try {
    const hug = JSON.parse(localStorage.getItem('shared-hug'));
    if (!hug) return null;
    if (Date.now() - hug.time > HUG_EXPIRY_MS) {
      localStorage.removeItem('shared-hug');
      return null;
    }
    if (hug.from === activeProfile) return null;
    return hug;
  } catch (e) {
    return null;
  }
}
function dismissHug() {
  localStorage.removeItem('shared-hug');
  renderHug();
}
function renderHug() {
  const hug = checkHug();
  const card = document.getElementById('hugContent');
  const title = document.getElementById('hug-title');
  if (!title) return;
  title.textContent = t('hugTitle');
  const todayKey = fmtDate(new Date());
  const count = parseInt(sessionStorage.getItem('hug-count-' + todayKey) || '0');
  const remaining = 2 - count;
  const streak = getHugStreak();
  if (hug) {
    const sender = hug.from === 'andjela' ? '🌸 Anđela' : '👦 Barry';
    const time = new Date(hug.time);
    const timeStr = String(time.getHours()).padStart(2, '0') + ':' + String(time.getMinutes()).padStart(2, '0');
    let html = '<div class="hug-received">';
    if (streak > 1)
      {html +=
        '<div class="hug-streak-badge">🔥 ' +
        (lang === 'sr' ? streak + ' dana zaredom!' : lang === 'en' ? streak + '-day streak!' : '连续 ' + streak + ' 天！') +
        '</div>';}
    html += '<span class="hug-icon-wrap"><span class="hug-icon">🤗</span></span>';
    html += '<div class="hug-text">' + sender + ' ' + (lang === 'sr' ? 'te zagrlio/la! 💫' : lang === 'en' ? 'hugged you! 💫' : '抱了你！💫') + '</div>';
    html += '<div class="hug-time">' + timeStr + '</div>';
    html +=
      '<button class="hug-back-btn" onclick="sendHug(true)" id="hugBackBtn">💝 ' +
      (lang === 'sr' ? 'Uzvrati zagrljaj' : lang === 'en' ? 'Hug back' : '回抱一个') +
      '</button>';
    html +=
      '<div><button class="hug-dismiss" onclick="dismissHug()">' +
      (lang === 'sr' ? '✕ zatvori' : lang === 'en' ? '✕ dismiss' : '✕ 关闭') +
      '</button></div></div>';
    card.innerHTML = html;
    const hugCard = document.getElementById('hugCard');
    if (hugCard) spawnFloatingHearts(hugCard);
  } else if (count > 0) {
    let sentHearts = '';
    for (let i = 0; i < 2; i++) {
      sentHearts += '<span class="hh-heart' + (i >= remaining ? ' used' : '') + '">' + (i < count ? '❤️' : '🤍') + '</span>';
    }
    const html =
      '<div class="hug-sent-state">' +
      '<div class="hug-hearts-row">' +
      sentHearts +
      '</div><span class="hss-icon">📬</span><div class="hss-text">' +
      t('hugSentWaiting') +
      '</div><button class="hug-back-btn" onclick="sendHug()" style="margin-top:8px">🤗 ' +
      (lang === 'sr' ? 'Pošalji još jedan (' + remaining + ')' : lang === 'en' ? 'Send another (' + remaining + ')' : '再抱一次 (' + remaining + ')') +
      '</button></div>';
    card.innerHTML = html;
  } else {
    const label = t('hugSendBtn');
    let html = '';
    if (streak > 1)
      {html +=
        '<div style="text-align:center"><div class="hug-streak-badge">🔥 ' +
        (lang === 'sr' ? streak + ' dana zaredom!' : lang === 'en' ? streak + '-day streak!' : '连续 ' + streak + ' 天！') +
        '</div></div>';}
    html += '<button class="hug-btn" onclick="sendHug()" id="hugSendBtn">🤗 ' + label + '</button>';
    card.innerHTML = html;
  }
}
function addGratitude() {
  const input = document.getElementById('gratInput');
  const text = input.value.trim();
  if (!text) return;
  let notes = JSON.parse(localStorage.getItem('shared-gratitude') || '[]');
  notes.push({ text: text, from: activeProfile, time: Date.now() });
  if (notes.length > 20) notes = notes.slice(-20);
  localStorage.setItem('shared-gratitude', JSON.stringify(notes));
  _gratNotes = null;
  input.value = '';
  renderGratitude();
  pushAllSharedData();
}
function renderGratitude() {
  const title = document.getElementById('grat-title');
  const input = document.getElementById('gratInput');
  const list = document.getElementById('gratList');
  if (!title || !input || !list) return;
  title.textContent = t('gratTitle');
  input.placeholder = t('gratPlaceholder');
  const notes = JSON.parse(localStorage.getItem('shared-gratitude') || '[]');
  if (notes.length === 0) {
    list.innerHTML = '';
    return;
  }
  list.innerHTML = notes
    .slice(-5)
    .reverse()
    .map(function (n, i) {
      const sender = n.from === 'andjela' ? '🌸' : '👦';
      const needTrans = n.from !== (activeProfile === 'andjela' ? 'andjela' : 'barry');
      const btnHtml = needTrans
        ? ' <button onclick="translateGrat(' +
          i +
          ')" style="font-size:.55rem;padding:1px 6px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);cursor:pointer">🌐</button>'
        : '';
      return (
        '<div class="gratitude-item"><span class="gratitude-heart">' +
        sender +
        '</span><span id="grat-txt-' +
        i +
        '">' +
        esc(n.text) +
        '</span>' +
        btnHtml +
        '</div>'
      );
    })
    .join('');
}
function translateGrat(idx) {
  if (!_gratNotes) _gratNotes = JSON.parse(localStorage.getItem('shared-gratitude') || '[]');
  const n = _gratNotes[idx];
  if (!n) return;
  const fromLang = n.from === 'andjela' ? 'sr' : lang === 'sr' ? 'zh-CN' : 'sr';
  const toLang = lang === 'sr' ? 'sr' : lang === 'zh-CN' ? 'zh-CN' : 'en';
  if (fromLang === toLang) return;
  translateText(n.text, fromLang, toLang).then(function (translated) {
    const el = document.getElementById('grat-txt-' + idx);
    if (el) el.textContent = translated;
  });
}
function saveCheckinAnswer(qIdx, answer) {
  const key = 'shared-checkin-' + activeProfile;
  const answers = JSON.parse(localStorage.getItem(key) || '{}');
  answers[qIdx] = answer;
  localStorage.setItem(key, JSON.stringify(answers));
  renderCheckin();
  pushAllSharedData();
}
function getCheckinAnswers(profile) {
  return JSON.parse(localStorage.getItem('shared-checkin-' + profile) || '{}');
}
function renderCheckin() {
  const dow = new Date().getDay();
  if (dow !== 0 && dow !== 6) {
    document.getElementById('checkinCard').style.display = 'none';
    return;
  }
  document.getElementById('checkinCard').style.display = '';
  document.getElementById('checkin-title').textContent = t('checkinTitle');
  const questions = CHECKIN_QUESTIONS[lang] || CHECKIN_QUESTIONS['sr'];
  const myAnswers = getCheckinAnswers(activeProfile);
  const partnerProfile = activeProfile === 'andjela' ? 'barry' : 'andjela';
  const partnerAnswers = getCheckinAnswers(partnerProfile);
  const partnerName = partnerProfile === 'andjela' ? '🌸 Anđela' : '👦 Barry';
  let html = questions
    .map(function (q, i) {
      const myPick = myAnswers[i] || '';
      const partnerPick = partnerAnswers[i] || '';
      const optsHtml = q.opts
        .map(function (o) {
          return (
            '<span class="cq-opt' +
            (myPick === o ? ' picked' : '') +
            '" onclick="saveCheckinAnswer(' +
            i +
            ",'" +
            o.replace(/'/g, "\\'") +
            '\')">' +
            o +
            '</span>'
          );
        })
        .join('');
      const partnerHtml = partnerPick ? '<div style="font-size:.62rem;color:var(--gold);margin-top:4px">' + partnerName + ': ' + partnerPick + '</div>' : '';
      return (
        '<div class="checkin-q"><div class="cq-label"><span>' + q.q + '</span></div><div class="cq-options">' + optsHtml + '</div>' + partnerHtml + '</div>'
      );
    })
    .join('');
  if (Object.keys(myAnswers).length === 0 && Object.keys(partnerAnswers).length === 0) {
    html +=
      '<div style="text-align:center;font-size:.68rem;color:var(--text-muted);margin-top:8px">' +
      (lang === 'sr'
        ? 'Odgovori na pitanja — partner će videti tvoje odgovore ✨'
        : lang === 'en'
          ? 'Answer the questions — your partner will see your answers ✨'
          : '回答问题——伴侣会看到你的答案 ✨') +
      '</div>';
  }
  document.getElementById('checkinContent').innerHTML = html;
}
function saveMySong() {
  const title = document.getElementById('songInputTitle').value.trim();
  if (!title) {
    toast(t('songSaveEmpty'));
    return;
  }
  const note = document.getElementById('songInputNote').value.trim();
  const song = { title: title, note: note || '', from: activeProfile, time: Date.now() };
  localStorage.setItem('shared-song-' + activeProfile, JSON.stringify(song));
  renderSong();
  pushAllSharedData();
  toast(t('songSaved'));
}
function loadSong(profile) {
  return safeParse(localStorage.getItem('shared-song-' + profile), null);
}
function getKnowMeData() {
  return safeParse(localStorage.getItem('shared-knowme'), {});
}
function saveKnowMeData(data) {
  localStorage.setItem('shared-knowme', JSON.stringify(data));
}
function renderKnowMe() {
  const card = document.getElementById('knowMeCard');
  if (!card) return;
  document.getElementById('knowMe-title').textContent = t('knowMeTitle');
  const todayIdx = Math.floor(Date.now() / 86400000) % KNOW_ME_QUESTIONS.length;
  const q = KNOW_ME_QUESTIONS[todayIdx];
  const qText = q.q[lang] || q.q['sr'];
  const dateKey = fmtDate(today());
  const allData = getKnowMeData();
  const dayData = allData[dateKey] || {};
  const myAns = dayData[activeProfile];
  const partnerProfile = activeProfile === 'andjela' ? 'barry' : 'andjela';
  const partnerAns = dayData[partnerProfile];
  const partnerName = partnerProfile === 'andjela' ? '🌹 Anđela' : '👦 Barry';
  const myName = activeProfile === 'andjela' ? '🌹 Anđela' : '👦 Barry';
  let html = '';
  html += '<div style="font-size:.78rem;color:var(--love);font-weight:600;margin-bottom:12px;text-align:center;line-height:1.4">' + qText + '</div>';
  if (myAns) {
    html +=
      '<div style="background:var(--rose-light);border-radius:12px;padding:10px 14px;margin-bottom:8px"><span style="font-size:.62rem;color:var(--text-muted)">' +
      myName +
      ' ' +
      (lang === 'sr' ? 'odgovor' : lang === 'en' ? ' answer' : '的回答') +
      '</span><div style="font-size:.8rem;color:var(--text);margin-top:4px">' +
      esc(myAns.answer) +
      '</div></div>';
  } else {
    html +=
      '<div style="margin-bottom:10px"><textarea id="knowMeInput" placeholder="' +
      (lang === 'sr' ? 'Tvoj odgovor...' : lang === 'en' ? 'Your answer...' : '你的答案...') +
      '" style="width:100%;border:1px solid var(--border);border-radius:12px;padding:10px 12px;font-size:.74rem;font-family:var(--font);background:var(--card);color:var(--text);resize:none;min-height:44px" maxlength="120"></textarea><button class="btn btn-primary" onclick="saveKnowMeAnswer()" style="width:100%;font-size:.7rem;padding:8px;margin-top:6px">💭 ' +
      (lang === 'sr' ? 'Odgovori' : lang === 'en' ? 'Answer' : '回答') +
      '</button></div>';
  }
  if (partnerAns) {
    html +=
      '<div style="padding-top:8px;border-top:1px solid var(--border);margin-top:4px"><span style="font-size:.62rem;color:var(--teal);font-weight:600">👀 ' +
      partnerName +
      t('knowMePartnerLabel') +
      '</span><div style="font-size:.82rem;color:var(--teal);margin-top:4px;font-style:italic;line-height:1.4">' +
      esc(partnerAns.answer) +
      '</div></div>';
    if (myAns && partnerAns && myAns.answer.trim().toLowerCase() === partnerAns.answer.trim().toLowerCase()) {
      html +=
        '<div style="text-align:center;margin-top:8px;font-size:1.5rem;animation:float-arrow .8s infinite">💞</div><div style="text-align:center;font-size:.7rem;color:var(--love);font-weight:600">' +
        t('knowMeMatch') +
        '</div>';
    }
  } else if (myAns) {
    html += '<div style="text-align:center;padding:10px;color:var(--text-muted);font-size:.68rem;font-style:italic">⏳ ' + t('knowMeWaiting') + '</div>';
  }
  document.getElementById('knowMeContent').innerHTML = html;
}
function saveKnowMeAnswer() {
  const input = document.getElementById('knowMeInput');
  if (!input) return;
  const answer = input.value.trim();
  if (!answer) return;
  const dateKey = fmtDate(today());
  const allData = getKnowMeData();
  if (!allData[dateKey]) allData[dateKey] = {};
  allData[dateKey][activeProfile] = { answer: answer, time: Date.now() };
  saveKnowMeData(allData);
  pushAllSharedData();
  renderKnowMe();
  toast(t('knowMeAnswerSaved'));
}
function renderSong() {
  const st = document.getElementById('song-title');
  if (!st) return;
  st.textContent = t('songTitle');
  const mySong = loadSong(activeProfile);
  const partnerProfile = activeProfile === 'andjela' ? 'barry' : 'andjela';
  const partnerSong = loadSong(partnerProfile);
  const partnerName = partnerProfile === 'andjela' ? '🌸 Anđela' : '👦 Barry';
  let html = '';
  if (mySong) {
    html +=
      '<div style="margin-bottom:10px"><span style="font-size:.62rem;color:var(--text-muted)">' +
      t('songMyLabel') +
      '</span><div class="song-title">🎶 ' +
      esc(mySong.title) +
      '</div>' +
      (mySong.note ? '<div class="song-note">' + esc(mySong.note) + '</div>' : '') +
      '</div>';
  } else {
    html +=
      '<div style="margin-bottom:10px"><input id="songInputTitle" placeholder="' +
      t('songTitlePlaceholder') +
      '" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:12px;font-size:.74rem;font-family:var(--font);background:var(--card);color:var(--text);margin-bottom:6px"><input id="songInputNote" placeholder="' +
      t('songNotePlaceholder') +
      '" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:12px;font-size:.74rem;font-family:var(--font);background:var(--card);color:var(--text);margin-bottom:6px"><button class="btn btn-primary" onclick="saveMySong()" style="width:100%;font-size:.7rem;padding:8px">🎵 ' +
      t('songSave') +
      '</button></div>';
  }
  if (partnerSong) {
    html +=
      '<div style="padding-top:8px;border-top:1px solid var(--border)"><span style="font-size:.62rem;color:var(--text-muted)">' +
      partnerName +
      ' ' +
      t('songPartnerLabel') +
      '</span><div class="song-title">🎶 ' +
      esc(partnerSong.title) +
      '</div>' +
      (partnerSong.note ? '<div class="song-note">' + esc(partnerSong.note) + '</div>' : '') +
      '</div>';
  }
  document.getElementById('songContent').innerHTML = html || '<span class="song-icon">🎶</span><div class="song-note">' + t('songEmpty') + '</div>';
}
function renderRelTips() {
  if (activeProfile !== 'andjela') {
    document.getElementById('relTipCard').style.display = 'none';
    return;
  }
  const tips = REL_TIPS[lang] || REL_TIPS['sr'];
  const tip = tips[Math.floor(Math.random() * tips.length)];
  document.getElementById('relTipIcon').textContent = tip.icon;
  document.getElementById('relTipText').textContent = tip.text;
  document.getElementById('relTipCard').style.display = '';
}

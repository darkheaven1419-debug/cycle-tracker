/**
 * SocialModule — Hug / Gratitude / Check-in / Song / Know Me / Tips
 *
 * Extracted from app.js lines 5148-5790 for modularity.
 * Full backward compatibility maintained — global functions still exist.
 *
 * Dependencies (global):
 *   state, lang, L(), t(), activeProfile
 *   loadSharedDiaryData(), saveSharedDiaryData()
 *   pushAllSharedData(), toast()
 *   translateText(), fmtDate(), today()
 *   esc(), safeParse(), profileKey()
 *   localStorage
 *
 * DOM IDs used:
 *   hugCard, hugContent, hug-title, hugSendBtn, hugBackBtn
 *   gratInput, gratList, grat-title
 *   checkinCard, checkin-title, checkinContent
 *   songInputTitle, songInputNote, songContent, song-title
 *   knowMeCard, knowMe-title, knowMeContent, knowMeInput
 *   relTipCard, relTipIcon, relTipText
 *   tips-list
 */
const SocialModule = (function () {
  'use strict';

  // ====================================================================
  // Constants
  // ====================================================================
  const HUG_EXPIRY_MS = 86400000; // 24 hours

  // ====================================================================
  // Relationship Tips (Anđela)
  // ====================================================================
  const REL_TIPS = {
    sr: [
      { icon: '💬', text: 'Ako ti nešto smeta — reci mu. Barry ne ume da čita misli. Iskren razgovor je temelj.' },
      { icon: '💝', text: 'Kad uradi nešto lepo za tebe — reci mu. Muškarcima treba potvrda isto koliko i ženama.' },
      { icon: '🫂', text: 'Svađate se? Seti se: vi ste tim protiv problema, a ne jedno protiv drugog.' },
      { icon: '🌸', text: 'Tvoja osećanja su važeća. Ne moraš da ih pravdavaš. Samo ih izrazi.' },
      { icon: '💌', text: 'Male stvari su velike. Poruka "mislim na tebe" znači više nego što misliš.' },
      { icon: '🎯', text: 'Reci mu šta ti treba. "Volela bih da me sad saslušaš" je jasnije od ćutanja.' },
      { icon: '🤗', text: 'Fizička bliskost nije samo seks. Držanje za ruke, zagrljaj, dodir — sve to gradi vezu.' },
      { icon: '🌙', text: 'Kad si umorna i emotivna — reci mu to. "Danas mi je težak dan" je dovoljno.' },
      { icon: '💪', text: 'Vi ste različite osobe i to je u redu. Ne morate sve da radite isto.' },
      { icon: '🔥', text: 'Strast se gradi svaki dan — flert, nežne reči, iznenađenja. Ne čekaj "posebne prilike".' },
    ],
    'zh-CN': [
      { icon: '💬', text: '如果有什么不满——直接告诉他。Barry 不会读心术。真诚沟通是感情的基础。' },
      { icon: '💝', text: '他做了什么让你开心的事？告诉他。男生也需要被肯定。' },
      { icon: '🫂', text: '吵架时记住：你们 vs 问题，而不是你 vs 他。' },
      { icon: '🌸', text: '你的感受是真实的。不需要为它辩护。只需要表达出来。' },
      { icon: '💌', text: '小事最重要。"想你了"三个字的力量比你想象的大得多。' },
      { icon: '🎯', text: '告诉他你需要什么。"我现在想让你听我说"比沉默更有效。' },
      { icon: '🤗', text: '亲密不只是性。牵手、拥抱、触摸——这些都在建立连接。' },
      { icon: '🌙', text: '累了或情绪不好的时候——告诉他。"今天好累"就够了。' },
      { icon: '💪', text: '你们是不同的个体，这完全没问题。不需要一切都一样。' },
      { icon: '🔥', text: '激情是每天积累的——调情、温柔的话、小惊喜。别等"特别的日子"。' },
    ],
    en: [
      { icon: '💬', text: "If something bothers you — tell him. Barry can't read minds. Honest talk is the foundation." },
      { icon: '💝', text: 'He did something nice? Tell him. Men need affirmation as much as women do.' },
      { icon: '🫂', text: 'In a fight: you are a team against the problem, not against each other.' },
      { icon: '🌸', text: "Your feelings are valid. You don't need to justify them. Just express them." },
      { icon: '💌', text: 'A "thinking of you" message means more than you think.' },
      { icon: '🎯', text: 'Tell him what you need. "I\'d love for you to just listen right now" works better than silence.' },
      { icon: '🤗', text: "Physical closeness isn't just sex. Holding hands, hugging, touch — it all builds connection." },
      { icon: '🌙', text: 'When you\'re tired or emotional — just tell him. "Today\'s a hard day" is enough.' },
      { icon: '💪', text: "You're different people and that's OK. You don't have to do everything the same way." },
      { icon: '🔥', text: 'Passion builds every day — flirting, sweet words, surprises. Don\'t wait for "special occasions".' },
    ],
  };

  // ====================================================================
  // Weekly Check-in Questions
  // ====================================================================
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

  // ====================================================================
  // Know Me Quiz Questions
  // ====================================================================
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
      q: {
        sr: 'Gde bi tvoj/tvoja partner/ka najradije putovao/la?',
        zh: '对方最想去的旅行目的地是哪里？',
        en: 'Where does your partner dream of traveling to?',
      },
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

  // ====================================================================
  // Floating Hearts Animation
  // ====================================================================
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

  // ====================================================================
  // Virtual Hug
  // ====================================================================

  // Hug streak: count consecutive days with hug exchanged
  function getHugStreak() {
    const allData = loadSharedDiaryData();
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = fmtDate(d);
      const day = allData[key];
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
    const todayKey = fmtDate(new Date());
    let count = parseInt(localStorage.getItem('hug-count-' + todayKey) || '0');
    if (count >= 2) {
      toast(
        lang === 'sr'
          ? 'Već si poslao/la 2 zagrljaja danas — probaj sutra! 🤗'
          : lang === 'en'
            ? 'You already sent 2 hugs today — try tomorrow! 🤗'
            : '今天已经抱了2次——明天再来！🤗'
      );
      return;
    }
    count++;
    localStorage.setItem('hug-count-' + todayKey, count);

    const hug = { from: activeProfile, time: Date.now() };
    localStorage.setItem('shared-hug', JSON.stringify(hug));

    // Also store in shared diary for streak tracking
    const allData = loadSharedDiaryData();
    if (!allData[todayKey]) allData[todayKey] = {};
    if (!allData[todayKey][activeProfile]) allData[todayKey][activeProfile] = {};
    allData[todayKey][activeProfile].hug = { time: Date.now() };
    saveSharedDiaryData(allData);

    // Animate
    const btn = document.getElementById('hugSendBtn');
    if (btn) {
      btn.classList.add('sending');
      setTimeout(function () {
        btn.classList.remove('sending');
      }, 600);
    }

    // Floating hearts
    const card = document.getElementById('hugCard');
    if (card) spawnFloatingHearts(card);

    renderHug();
    const senderLabel =
      activeProfile === 'barry'
        ? lang === 'sr'
          ? 'Poslao si joj zagrljaj!'
          : lang === 'en'
            ? 'Hug sent!'
            : '拥抱已发送！'
        : lang === 'sr'
          ? 'Poslala si mu zagrljaj!'
          : lang === 'en'
            ? 'Hug sent!'
            : '拥抱已发送！';
    toast('🤗 ' + senderLabel + ' (' + count + '/2)');
  }

  function checkHug() {
    try {
      const hug = JSON.parse(localStorage.getItem('shared-hug'));
      if (!hug) return null;
      // 24-hour expiry
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
    title.textContent = lang === 'sr' ? '🤗 Virtuelni zagrljaj' : lang === 'en' ? '🤗 Virtual Hug' : '🤗 隔空拥抱';
    const todayKey = fmtDate(new Date());
    const count = parseInt(sessionStorage.getItem('hug-count-' + todayKey) || '0');
    const remaining = 2 - count;
    const streak = getHugStreak();

    if (hug) {
      // RECEIVED STATE — beautiful card
      const sender = hug.from === 'andjela' ? '🌸 Anđela' : '👦 Barry';
      const time = new Date(hug.time);
      const timeStr = String(time.getHours()).padStart(2, '0') + ':' + String(time.getMinutes()).padStart(2, '0');

      let html = '<div class="hug-received">';
      if (streak > 1) {
        html +=
          '<div class="hug-streak-badge">🔥 ' +
          (lang === 'sr' ? streak + ' dana zaredom!' : lang === 'en' ? streak + '-day streak!' : '连续 ' + streak + ' 天！') +
          '</div>';
      }
      html += '<span class="hug-icon-wrap"><span class="hug-icon">🤗</span></span>';
      html += '<div class="hug-text">' + sender + ' ' + (lang === 'sr' ? 'te zagrlio/la! 💫' : lang === 'en' ? 'hugged you! 💫' : '抱了你！💫') + '</div>';
      html += '<div class="hug-time">' + timeStr + '</div>';
      html +=
        '<button class="hug-back-btn" onclick="sendHug(true)" id="hugBackBtn">💝 ' +
        (lang === 'sr' ? 'Uzvrati zagrljaj' : lang === 'en' ? 'Hug back' : '回抱一个') +
        '</button>';
      html +=
        '<div><button class="hug-dismiss" onclick="dismissHug()">' + (lang === 'sr' ? '✕ zatvori' : lang === 'en' ? '✕ dismiss' : '✕ 关闭') + '</button></div>';
      html += '</div>';
      card.innerHTML = html;

      // Auto-spawn hearts when receiving
      const hugCard = document.getElementById('hugCard');
      if (hugCard) spawnFloatingHearts(hugCard);
    } else if (count > 0) {
      // SENT STATE — waiting for partner
      let sentHearts = '';
      for (let i = 0; i < 2; i++) {
        sentHearts += '<span class="hh-heart' + (i >= remaining ? ' used' : '') + '">' + (i < count ? '❤️' : '🤍') + '</span>';
      }
      let html = '<div class="hug-sent-state">';
      html += '<div class="hug-hearts-row">' + sentHearts + '</div>';
      html += '<span class="hss-icon">📬</span>';
      html +=
        '<div class="hss-text">' +
        (lang === 'sr' ? 'Zagrljaj poslat! Čekam odgovor... 💌' : lang === 'en' ? 'Hug sent! Waiting for response... 💌' : '拥抱已发送！等待回应... 💌') +
        '</div>';
      html +=
        '<button class="hug-back-btn" onclick="sendHug()" style="margin-top:8px">🤗 ' +
        (lang === 'sr' ? 'Pošalji još jedan (' + remaining + ')' : lang === 'en' ? 'Send another (' + remaining + ')' : '再抱一次 (' + remaining + ')') +
        '</button>';
      html += '</div>';
      card.innerHTML = html;
    } else {
      // SEND STATE — fresh button
      const label = lang === 'sr' ? 'Pošalji zagrljaj' : lang === 'en' ? 'Send a Hug' : '发送拥抱';
      let html = '';
      if (streak > 1) {
        html +=
          '<div style="text-align:center"><div class="hug-streak-badge">🔥 ' +
          (lang === 'sr' ? streak + ' dana zaredom!' : lang === 'en' ? streak + '-day streak!' : '连续 ' + streak + ' 天！') +
          '</div></div>';
      }
      html += '<button class="hug-btn" onclick="sendHug()" id="hugSendBtn">🤗 ' + label + '</button>';
      card.innerHTML = html;
    }
  }

  // ====================================================================
  // Gratitude Wall
  // ====================================================================
  let _gratNotes = null;

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
    title.textContent = lang === 'sr' ? '💝 Zid zahvalnosti' : lang === 'en' ? '💝 Gratitude Wall' : '💝 感恩便签';
    input.placeholder = lang === 'sr' ? 'Hvala ti za...' : lang === 'en' ? 'Thank you for...' : '谢谢你...';
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
        const partnerLang = n.from === 'andjela' ? 'sr' : lang === 'sr' ? 'zh-CN' : 'sr';
        const needTrans = n.from !== (activeProfile === 'andjela' ? 'andjela' : 'barry');
        const btnHtml = needTrans
          ? ' <button onclick="translateGrat(' +
            i +
            ')" style="font-size:.55rem;padding:1px 6px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);cursor:pointer" title="' +
            partnerLang +
            '">🌐</button>'
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

  // ====================================================================
  // Weekly Check-in
  // ====================================================================
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
    const dow = new Date().getDay(); // 0=Sun,6=Sat
    if (dow !== 0 && dow !== 6) {
      document.getElementById('checkinCard').style.display = 'none';
      return;
    }
    document.getElementById('checkinCard').style.display = '';
    document.getElementById('checkin-title').textContent = lang === 'sr' ? '🎯 Nedeljni pregled' : lang === 'en' ? '🎯 Weekly Check-in' : '🎯 每周感情体检';
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

  // ====================================================================
  // Our Song
  // ====================================================================
  function saveMySong() {
    const title = document.getElementById('songInputTitle').value.trim();
    if (!title) {
      toast(lang === 'sr' ? 'Unesi naziv pesme 🎵' : lang === 'en' ? 'Enter a song title 🎵' : '请输入歌名 🎵');
      return;
    }
    const note = document.getElementById('songInputNote').value.trim();
    const song = { title: title, note: note || '', from: activeProfile, time: Date.now() };
    localStorage.setItem('shared-song-' + activeProfile, JSON.stringify(song));
    renderSong();
    pushAllSharedData();
    toast('🎵 ' + (lang === 'sr' ? 'Pesma sačuvana!' : lang === 'en' ? 'Song saved!' : '歌曲已保存！'));
  }

  function loadSong(profile) {
    return safeParse(localStorage.getItem('shared-song-' + profile), null);
  }

  function renderSong() {
    const st = document.getElementById('song-title');
    if (!st) return;
    st.textContent = lang === 'sr' ? '🎵 Naša pesma' : lang === 'en' ? '🎵 Our Song' : '🎵 我们的歌';
    const mySong = loadSong(activeProfile);
    const partnerProfile = activeProfile === 'andjela' ? 'barry' : 'andjela';
    const partnerSong = loadSong(partnerProfile);
    const partnerName = partnerProfile === 'andjela' ? '🌸 Anđela' : '👦 Barry';
    let html = '';
    if (mySong) {
      html +=
        '<div style="margin-bottom:10px"><span style="font-size:.62rem;color:var(--text-muted)">' +
        (lang === 'sr' ? 'Moja pesma' : lang === 'en' ? 'My song' : '我的歌') +
        '</span><div class="song-title">🎶 ' +
        mySong.title +
        '</div>' +
        (mySong.note ? '<div class="song-note">' + mySong.note + '</div>' : '') +
        '</div>';
    } else {
      html +=
        '<div style="margin-bottom:10px"><input id="songInputTitle" placeholder="' +
        (lang === 'sr' ? 'Naziv pesme...' : lang === 'en' ? 'Song title...' : '歌名...') +
        '" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:12px;font-size:.74rem;font-family:var(--font);background:var(--card);color:var(--text);margin-bottom:6px"><input id="songInputNote" placeholder="' +
        (lang === 'sr' ? 'Zašto baš ova pesma?' : lang === 'en' ? 'Why this song?' : '为什么是这首歌？') +
        '" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:12px;font-size:.74rem;font-family:var(--font);background:var(--card);color:var(--text);margin-bottom:6px"><button class="btn btn-primary" onclick="saveMySong()" style="width:100%;font-size:.7rem;padding:8px">🎵 ' +
        (lang === 'sr' ? 'Sačuvaj' : lang === 'en' ? 'Save' : '保存') +
        '</button></div>';
    }
    if (partnerSong) {
      html +=
        '<div style="padding-top:8px;border-top:1px solid var(--border)"><span style="font-size:.62rem;color:var(--text-muted)">' +
        partnerName +
        ' ' +
        (lang === 'sr' ? 'pesma' : lang === 'en' ? 'song' : '的歌') +
        '</span><div class="song-title">🎶 ' +
        esc(partnerSong.title) +
        '</div>' +
        (partnerSong.note ? '<div class="song-note">' + esc(partnerSong.note) + '</div>' : '') +
        '</div>';
    }
    document.getElementById('songContent').innerHTML =
      html ||
      '<span class="song-icon">🎶</span><div class="song-note">' +
        (lang === 'sr'
          ? 'Postavite pesme koje vas podsećaju jedno na drugo'
          : lang === 'en'
            ? 'Set songs that remind you of each other'
            : '设置让你们想到彼此的歌') +
        '</div>';
  }

  // ====================================================================
  // Know Me Quiz
  // ====================================================================
  function getKnowMeData() {
    return safeParse(localStorage.getItem('shared-knowme'), {});
  }

  function saveKnowMeData(data) {
    localStorage.setItem('shared-knowme', JSON.stringify(data));
  }

  function renderKnowMe() {
    const card = document.getElementById('knowMeCard');
    if (!card) return;
    document.getElementById('knowMe-title').textContent = lang === 'sr' ? '💭 Da li me poznaješ?' : lang === 'en' ? '💭 Do You Know Me?' : '💭 你了解我吗？';
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
      const myLabel = lang === 'sr' ? 'odgovor' : lang === 'en' ? ' answer' : '的回答';
      html +=
        '<div style="background:var(--rose-light);border-radius:12px;padding:10px 14px;margin-bottom:8px"><span style="font-size:.62rem;color:var(--text-muted)">' +
        myName +
        ' ' +
        myLabel +
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

    // Partner answer section
    if (partnerAns) {
      const partnerThinkLabel = lang === 'sr' ? ' misli da je:' : lang === 'en' ? ' thinks it is:' : '认为:';
      html +=
        '<div style="padding-top:8px;border-top:1px solid var(--border);margin-top:4px"><span style="font-size:.62rem;color:var(--teal);font-weight:600">👀 ' +
        partnerName +
        partnerThinkLabel +
        '</span><div style="font-size:.82rem;color:var(--teal);margin-top:4px;font-style:italic;line-height:1.4">' +
        esc(partnerAns.answer) +
        '</div></div>';
      // Show if answers match!
      if (myAns && partnerAns && myAns.answer.trim().toLowerCase() === partnerAns.answer.trim().toLowerCase()) {
        html +=
          '<div style="text-align:center;margin-top:8px;font-size:1.5rem;animation:bounce-arrow .8s infinite">💞</div><div style="text-align:center;font-size:.7rem;color:var(--love);font-weight:600">' +
          (lang === 'sr' ? 'Savršeno se razumete! ✨' : lang === 'en' ? 'You two are perfectly in sync! ✨' : '你们太有默契了！✨') +
          '</div>';
      }
    } else if (myAns) {
      html +=
        '<div style="text-align:center;padding:10px;color:var(--text-muted);font-size:.68rem;font-style:italic">⏳ ' +
        (lang === 'sr' ? 'Čeka se odgovor tvog partnera...' : lang === 'en' ? 'Waiting for your partner to answer...' : '等待对方回答...') +
        '</div>';
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
    toast('💭 ' + (lang === 'sr' ? 'Odgovor sačuvan!' : lang === 'en' ? 'Answer saved!' : '答案已保存！'));
  }

  // ====================================================================
  // Relationship Tips (Anđela only)
  // ====================================================================
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

  // ====================================================================
  // Public API — expose global functions for backward compat
  // ====================================================================
  return {
    // Constants
    HUG_EXPIRY_MS: HUG_EXPIRY_MS,
    REL_TIPS: REL_TIPS,
    CHECKIN_QUESTIONS: CHECKIN_QUESTIONS,
    KNOW_ME_QUESTIONS: KNOW_ME_QUESTIONS,

    // Hug
    spawnFloatingHearts: spawnFloatingHearts,
    getHugStreak: getHugStreak,
    sendHug: sendHug,
    checkHug: checkHug,
    dismissHug: dismissHug,
    renderHug: renderHug,

    // Gratitude
    addGratitude: addGratitude,
    renderGratitude: renderGratitude,
    translateGrat: translateGrat,

    // Check-in
    saveCheckinAnswer: saveCheckinAnswer,
    getCheckinAnswers: getCheckinAnswers,
    renderCheckin: renderCheckin,

    // Song
    saveMySong: saveMySong,
    loadSong: loadSong,
    renderSong: renderSong,

    // Know Me
    getKnowMeData: getKnowMeData,
    saveKnowMeData: saveKnowMeData,
    renderKnowMe: renderKnowMe,
    saveKnowMeAnswer: saveKnowMeAnswer,

    // Tips
    renderRelTips: renderRelTips,
  };
})();

// ====================================================================
// Global backward compat — delegate to SocialModule
// ====================================================================
// NOTE: HUG_EXPIRY_MS, CHECKIN_QUESTIONS, KNOW_ME_QUESTIONS
// are now defined in js/render-love.js (extracted module).

function spawnFloatingHearts(container) {
  return SocialModule.spawnFloatingHearts(container);
}
// NOTE: All social module functions (sendHug, renderHug, etc.)
// are defined in app.js. Do NOT redefine globals here.

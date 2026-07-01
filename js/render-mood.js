/* render-mood.js — Mood tracking, streak, garden — extracted from app.js v7.1 */

function getMood(dateKey) {
  return state.moods && state.moods[dateKey] ? state.moods[dateKey].mood : null;
}
function setMood(dateKey, moodKey) {
  if (!state.moods) state.moods = {};
  if (state.moods[dateKey] && state.moods[dateKey].mood === moodKey) {
    delete state.moods[dateKey];
    saveState();
    renderMoodSection();
    return;
  }
  state.moods[dateKey] = { mood: moodKey, time: Date.now() };
  saveState();
  renderMoodSection();
  renderGarden();
  toast(t('moodNames')[MOOD_KEYS.indexOf(moodKey)] + ' check');
}
function calculateStreak() {
  if (!state.moods) return 0;
  const td = today();
  let streak = 0;
  const d = new Date(td);
  while (true) {
    const key = fmtDate(d);
    if (state.moods[key]) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}
function renderMoodSection() {
  const td = fmtDate(today());
  const todayMood = getMood(td);
  document.getElementById('mood-today-label').textContent = t('moodToday');
  document.getElementById('mood-title').textContent = t('moodTitle');
  const picker = document.getElementById('moodPicker');
  picker.innerHTML = '';
  MOOD_EMOJIS.forEach(function (emoji, i) {
    const btn = document.createElement('span');
    btn.className = 'mood-emoji' + (todayMood === MOOD_KEYS[i] ? ' picked' : '');
    btn.textContent = emoji;
    btn.title = t('moodNames')[i];
    btn.onclick = function () {
      setMood(td, MOOD_KEYS[i]);
      animateWatering();
    };
    picker.appendChild(btn);
  });
  document.getElementById('streakDisplay').style.display = 'none';
  document.getElementById('mood-history-label').textContent = t('moodHistoryLabel');
  const hist = document.getElementById('moodHistory');
  hist.innerHTML = '';
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today());
    d.setDate(d.getDate() - i);
    const m = getMood(fmtDate(d));
    const bar = document.createElement('div');
    bar.className = 'mood-bar';
    bar.style.height = m ? '28px' : '6px';
    if (m) bar.classList.add(m);
    bar.title = m ? t('moodNames')[MOOD_KEYS.indexOf(m)] + ' ' + fmtDate(d) : fmtDate(d);
    hist.appendChild(bar);
  }
}
function renderLoveNote() {
  if (activeProfile === 'barry') {
    document.getElementById('loveNoteCard').style.display = 'none';
    return;
  }
  document.getElementById('loveNoteCard').style.display = '';
  const el = document.getElementById('loveNoteText');
  const newText = LOVE_NOTES.get();
  if (el.textContent !== newText) {
    el.classList.add('changing');
    setTimeout(function () {
      el.textContent = newText;
      el.classList.remove('changing');
    }, 300);
  }
  const chinesePoems = [
    '但愿人长久，千里共婵娟 🌙',
    '执子之手，与子偕老 💕',
    '天涯若比邻 🌍',
    '心有灵犀一点通 ✨',
    '千里姻缘一线牵 💝',
    '海内存知己，天涯若比邻 🌊',
  ];
  const poem = chinesePoems[Math.floor(Math.random() * chinesePoems.length)];
  document.getElementById('loveNoteSig').textContent = t('loveNoteSig') + '  ·  ' + poem;
  const icons = ['💌', '💝', '💗', '💕', '💖', '🕊️', '✨', '🌷'];
  document.getElementById('loveNoteIcon').textContent = icons[Math.floor(Math.random() * icons.length)];
}
function renderForecast() {
  if (activeProfile !== 'andjela') {
    document.getElementById('forecastCard').style.display = 'none';
    return;
  }
  const pred = predict();
  const tomorrow = addDays(today(), 1);
  const phase = getPhase(tomorrow, pred);
  let text = '';
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
function animateWatering() {
  const plant = document.getElementById('gardenPlant');
  if (!plant) return;
  plant.style.transform = 'scale(1.3) rotate(10deg)';
  plant.style.transition = 'transform .3s cubic-bezier(.22, 1, .36, 1)';
  const drops = ['💧', '💧', '💧'];
  drops.forEach(function (d, i) {
    setTimeout(function () {
      const drop = document.createElement('span');
      drop.textContent = d;
      drop.style.cssText = 'position:absolute;font-size:.8rem;animation:dropFall 1s ease-in forwards;z-index:10;pointer-events:none;';
      drop.style.left = 30 + Math.random() * 40 + '%';
      drop.style.top = '-10px';
      document.getElementById('gardenCard').appendChild(drop);
      setTimeout(function () {
        drop.remove();
      }, 1000);
    }, i * 150);
  });
  setTimeout(function () {
    plant.style.transform = '';
    renderGarden();
  }, 600);
}
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

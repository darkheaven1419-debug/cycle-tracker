/* ================================================================
   chinese-listen.js — 听力练习 (Listening Practice)
   v2 — full listening practice using speechSynthesis
   Dependencies: chinese-learn.js (core engine via window.*)
   Called by: index.html:27, chinese-ui.js renderPracticeTab
   ================================================================ */

let _currentListenWordIdx = 0;
let _currentListenScore = 0;
let _listenLessonWords = [];

function renderListenPractice(lessonId) {
  const container = document.getElementById('lrnListenContainer');
  if (!container) return;
  const lesson = getLessonById(lessonId);
  if (!lesson || !lesson.words || lesson.words.length < 2) {
    container.innerHTML = '<div class="lrn-empty-state">' +
      _('词汇不足，无法听力练习', 'Nedovoljno reči za vežbu slušanja', 'Not enough words for listening') +
      '</div>';
    return;
  }

  _currentListenWordIdx = 0;
  _currentListenScore = 0;
  _listenLessonWords = lesson.words;

  container.innerHTML = '<div style="text-align:center;padding:20px">' +
    '<div style="font-size:.7rem;color:var(--text-muted);margin-bottom:12px">' +
    _('听中文发音，选对应的翻译', 'Slušajte izgovor i izaberite prevod', 'Listen to Chinese and pick the translation') +
    '</div>' +
    '<button class="btn btn-primary" onclick="startListenSession()" style="width:100%">' +
    _('开始听力练习', 'Započni vežbu', 'Start Listening') +
    '</button></div>';
}

function startListenSession() {
  _currentListenWordIdx = 0;
  _currentListenScore = 0;
  nextListenWord();
}

function nextListenWord() {
  if (_currentListenWordIdx >= _listenLessonWords.length) {
    const container = document.getElementById('lrnListenContainer');
    if (!container) return;
    const pct = _listenLessonWords.length > 0
      ? Math.round((_currentListenScore / _listenLessonWords.length) * 100) : 0;
    container.innerHTML = '<div style="text-align:center;padding:20px">' +
      '<div style="font-size:2rem;margin-bottom:8px">' +
      (pct >= 80 ? '\u{1F31F}' : pct >= 60 ? '\u{1F44D}' : '\u{1F4AA}') + '</div>' +
      '<div style="font-size:1.2rem;font-weight:700">' + _currentListenScore +
      '/' + _listenLessonWords.length + '</div>' +
      '<div style="font-size:.7rem;color:var(--text-muted);margin-bottom:12px">' +
      pct + '% ' + _('正确', 'tačno', 'correct') + '</div>' +
      '<button class="btn btn-primary" onclick="startListenSession()" style="width:100%">' +
      _('再听一次', 'Ponovo slušaj', 'Listen again') + '</button></div>';
    return;
  }

  const w = _listenLessonWords[_currentListenWordIdx];
  const correctSr = w.sr || '';
  const options = [correctSr];
  const pool = [];
  for (let p = 0; p < _listenLessonWords.length; p++) {
    if (_listenLessonWords[p].sr !== correctSr && _listenLessonWords[p].sr) {
      pool.push(_listenLessonWords[p].sr);
    }
  }
  shuffleArray(pool);
  for (let k = 0; k < 3 && k < pool.length; k++) {
    if (options.indexOf(pool[k]) < 0) options.push(pool[k]);
  }
  while (options.length < 4) {
    const fillers = lang === 'zh-CN'
      ? ['你好', '谢谢', '再见', '好的', '请问']
      : lang === 'en'
      ? ['Hello', 'Thanks', 'Goodbye', 'OK', 'Please']
      : ['Zdravo', 'Hvala', 'Doviđenja', 'Ćao', 'Molim'];
    const f = fillers[Math.floor(Math.random() * fillers.length)];
    if (options.indexOf(f) < 0) options.push(f);
  }
  shuffleArray(options);

  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    if (typeof preloadVoices === 'function') preloadVoices();
    const u = new SpeechSynthesisUtterance(w.zh || '');
    u.lang = 'zh-CN'; u.rate = 0.6; u.volume = 1;
    // Select Chinese voice if available (iOS Safari fix)
    const voices = speechSynthesis.getVoices();
    for (let vi = 0; vi < voices.length; vi++) {
      if (voices[vi].lang === 'zh-CN') { u.voice = voices[vi]; break; }
    }
    if (!u.voice) {
      for (let vj = 0; vj < voices.length; vj++) {
        if (voices[vj].lang.indexOf('zh') === 0) { u.voice = voices[vj]; break; }
      }
    }
    window.speechSynthesis.speak(u);
  }

  const container = document.getElementById('lrnListenContainer');
  if (!container) return;
  let html = '<div class="lrn-listen-card" style="text-align:center">';
  html += '<div style="font-size:.65rem;color:var(--text-muted);margin-bottom:6px">' +
    _('听中文，选翻译', 'Slušaj kineski, izaberi prevod', 'Listen and choose') +
    ' (' + (_currentListenWordIdx + 1) + '/' + _listenLessonWords.length + ') · ' +
    _('得分: ', 'Rezultat: ', 'Score: ') + _currentListenScore + '</div>';
  html += '<div class="lrn-listen-sound" onclick="replayListenWord(\'' +
    escapeHtml(w.zh || '') + '\')" ' +
    'style="font-size:2.5rem;cursor:pointer;margin-bottom:10px">\u{1F50A}</div>';
  html += '<div id="lrnListenChoices" class="lrn-practice-choice">';
  for (let opt = 0; opt < options.length; opt++) {
    html += '<button class="lrn-practice-option" onclick="checkListenAnswer(this,\'' +
      escapeHtml(options[opt]) + '\',\'' + escapeHtml(correctSr) + '\')">' +
      options[opt] + '</button>';
  }
  html += '</div></div>';
  container.innerHTML = html;
}

function checkListenAnswer(btn, selected, correct) {
  const allOpts = document.querySelectorAll('#lrnListenChoices .lrn-practice-option');
  for (let i = 0; i < allOpts.length; i++) {
    allOpts[i].disabled = true;
    allOpts[i].style.cursor = 'default';
    if (allOpts[i].textContent === correct) {
      allOpts[i].className = 'lrn-practice-option correct';
    }
  }
  if (selected === correct) {
    _currentListenScore++;
  } else {
    btn.className = 'lrn-practice-option wrong';
  }
  _currentListenWordIdx++;
  setTimeout(function () { nextListenWord(); }, 1000);
}

// Replay button handler — separate function for mobile-compatible TTS
function replayListenWord(text) {
  if (!window.speechSynthesis) return;
  if (typeof preloadVoices === 'function') preloadVoices();
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN'; u.rate = 0.6; u.volume = 1;
  const voices = speechSynthesis.getVoices();
  for (let vi = 0; vi < voices.length; vi++) {
    if (voices[vi].lang === 'zh-CN') { u.voice = voices[vi]; break; }
  }
  if (!u.voice) {
    for (let vj = 0; vj < voices.length; vj++) {
      if (voices[vj].lang.indexOf('zh') === 0) { u.voice = voices[vj]; break; }
    }
  }
  window.speechSynthesis.speak(u);
}

window.renderListenPractice = renderListenPractice;
window.startListenSession = startListenSession;
window.nextListenWord = nextListenWord;
window.checkListenAnswer = checkListenAnswer;
window.replayListenWord = replayListenWord;

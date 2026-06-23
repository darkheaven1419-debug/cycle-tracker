/* ================================================================
   chinese-listen.js — 听力练习 (Listening Practice)
   v2 — full listening practice using speechSynthesis
   Dependencies: chinese-learn.js (core engine via window.*)
   Called by: index.html:27, chinese-ui.js renderPracticeTab
   ================================================================ */

var _currentListenWordIdx = 0;
var _currentListenScore = 0;
var _listenLessonWords = [];

function renderListenPractice(lessonId) {
  var container = document.getElementById('lrnListenContainer');
  if (!container) return;
  var lesson = getLessonById(lessonId);
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
    var container = document.getElementById('lrnListenContainer');
    if (!container) return;
    var pct = _listenLessonWords.length > 0
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

  var w = _listenLessonWords[_currentListenWordIdx];
  var correctSr = w.sr || '';
  var options = [correctSr];
  var pool = [];
  for (var p = 0; p < _listenLessonWords.length; p++) {
    if (_listenLessonWords[p].sr !== correctSr && _listenLessonWords[p].sr) {
      pool.push(_listenLessonWords[p].sr);
    }
  }
  shuffleArray(pool);
  for (var k = 0; k < 3 && k < pool.length; k++) {
    if (options.indexOf(pool[k]) < 0) options.push(pool[k]);
  }
  while (options.length < 4) {
    var fillers = lang === 'zh-CN'
      ? ['你好', '谢谢', '再见', '好的', '请问']
      : lang === 'en'
      ? ['Hello', 'Thanks', 'Goodbye', 'OK', 'Please']
      : ['Zdravo', 'Hvala', 'Doviđenja', 'Ćao', 'Molim'];
    var f = fillers[Math.floor(Math.random() * fillers.length)];
    if (options.indexOf(f) < 0) options.push(f);
  }
  shuffleArray(options);

  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(w.zh || '');
    u.lang = 'zh-CN'; u.rate = 0.6;
    window.speechSynthesis.speak(u);
  }

  var container = document.getElementById('lrnListenContainer');
  if (!container) return;
  var html = '<div class="lrn-listen-card" style="text-align:center">';
  html += '<div style="font-size:.65rem;color:var(--text-muted);margin-bottom:6px">' +
    _('听中文，选翻译', 'Slušaj kineski, izaberi prevod', 'Listen and choose') +
    ' (' + (_currentListenWordIdx + 1) + '/' + _listenLessonWords.length + ') · ' +
    _('得分: ', 'Rezultat: ', 'Score: ') + _currentListenScore + '</div>';
  html += '<div class="lrn-listen-sound" onclick="if(window.speechSynthesis){window.speechSynthesis.cancel();' +
    'var u=new SpeechSynthesisUtterance(\'' + escapeHtml(w.zh || '') +
    '\');u.lang=\'zh-CN\';u.rate=0.6;window.speechSynthesis.speak(u);}" ' +
    'style="font-size:2.5rem;cursor:pointer;margin-bottom:10px">\u{1F50A}</div>';
  html += '<div id="lrnListenChoices" class="lrn-practice-choice">';
  for (var opt = 0; opt < options.length; opt++) {
    html += '<button class="lrn-practice-option" onclick="checkListenAnswer(this,\'' +
      escapeHtml(options[opt]) + '\',\'' + escapeHtml(correctSr) + '\')">' +
      options[opt] + '</button>';
  }
  html += '</div></div>';
  container.innerHTML = html;
}

function checkListenAnswer(btn, selected, correct) {
  var allOpts = document.querySelectorAll('#lrnListenChoices .lrn-practice-option');
  for (var i = 0; i < allOpts.length; i++) {
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

window.renderListenPractice = renderListenPractice;
window.startListenSession = startListenSession;
window.nextListenWord = nextListenWord;
window.checkListenAnswer = checkListenAnswer;

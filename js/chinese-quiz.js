/* ================================================================
   chinese-quiz.js — 中文学习练习和测验 (Practice & Quiz)
   v3 — split from monolithic file: practice, quiz, celebration
   Dependencies: chinese-learn.js (core engine), chinese-ui.js (UI)
   ================================================================ */

var _quizAnswers = {};

/* ================================================================
   1. PRACTICE — Option Generation & Answer Checking
   ================================================================ */

function generatePracticeOptions(correctWord, allWords) {
  var correct = correctWord.sr || '';
  var options = [correct];
  var pool = [];
  for (var i = 0; i < allWords.length; i++) {
    if (allWords[i].sr !== correct && allWords[i].sr) pool.push(allWords[i].sr);
  }
  shuffleArray(pool);
  for (var j = 0; j < Math.min(3, pool.length); j++) {
    if (options.indexOf(pool[j]) < 0) options.push(pool[j]);
  }
  var fillers = lang === 'zh-CN'
    ? ['你好', '谢谢', '再见', '好的', '请问']
    : lang === 'en'
    ? ['Hello', 'Thanks', 'Goodbye', 'OK', 'Please']
    : ['Zdravo', 'Hvala', 'Doviđenja', 'Dobro', 'Molim'];
  while (options.length < 4) {
    var f = fillers[Math.floor(Math.random() * fillers.length)];
    if (options.indexOf(f) < 0) options.push(f);
  }
  shuffleArray(options);
  return options;
}

function checkPracticeAnswer(btn, selectedAnswer, correctAnswer, questionEl) {
  var allOptions = questionEl.querySelectorAll('.lrn-practice-option');
  for (var i = 0; i < allOptions.length; i++) {
    allOptions[i].disabled = true;
    allOptions[i].style.cursor = 'default';
    if (allOptions[i].textContent === correctAnswer) {
      allOptions[i].className = 'lrn-practice-option correct';
    }
  }

  if (selectedAnswer === correctAnswer) {
    btn.className = 'lrn-practice-option correct';
  } else {
    btn.className = 'lrn-practice-option wrong';
  }

  // Update result area
  var section = document.querySelector('.chinese-practice-section');
  if (!section) return;
  var resultArea = section.querySelector('.chinese-practice-result');
  if (!resultArea) return;

  var allQuestions = section.querySelectorAll('.chinese-practice-question');
  var allCorrect = true;
  for (var q = 0; q < allQuestions.length; q++) {
    var selected = allQuestions[q].querySelector('.lrn-practice-option.correct, .lrn-practice-option.wrong');
    if (!selected || selected.className.indexOf('wrong') >= 0) { allCorrect = false; break; }
  }
  if (allCorrect) {
    resultArea.innerHTML = '<div class="lrn-practice-feedback correct">✅ ' +
      _('全部正确！', 'Sve tačno!', 'All correct!') + '</div>';
  }
}

/* ================================================================
   2. QUIZ — Question Generation, Option Selection & Submission
   ================================================================ */

function generateQuizQuestions(words) {
  var questions = [];
  var types = ['choice', 'choice', 'fill-zh', 'fill-py'];
  for (var i = 0; i < words.length && i < 5; i++) {
    var w = words[i];
    var type = types[i % types.length];
    if (type === 'choice') {
      var direction = Math.random() > 0.5 ? 'zh2sr' : 'sr2zh';
      if (direction === 'zh2sr') {
        questions.push({
          question: w.zh + ' ' + _('的意思是？', 'znači?', 'means?'),
          answer: w.sr || '',
          options: generateQuizOptions(w.sr || '', words, 'sr'),
          type: 'choice'
        });
      } else {
        questions.push({
          question: '"' + (w.sr || '') + '" ' + _('的中文是？', 'na kineskom?', 'in Chinese?'),
          answer: w.zh || '',
          options: generateQuizOptions(w.zh || '', words, 'zh'),
          type: 'choice'
        });
      }
    } else if (type === 'fill-zh') {
      questions.push({
        question: '✍️ ' + _('请写出汉字: ', 'Napišite kineski: ', 'Write Chinese: ') + '<strong>' + escapeHtml(w.py || '') + '</strong> (' + escapeHtml(w.sr || '') + ')',
        answer: w.zh || '',
        type: 'fill-zh'
      });
    } else if (type === 'fill-py') {
      questions.push({
        question: '✍️ ' + _('请写出拼音: ', 'Napišite pinyin: ', 'Write pinyin: ') + '<strong>' + escapeHtml(w.zh || '') + '</strong> (' + escapeHtml(w.sr || '') + ')',
        answer: (w.py || '').toLowerCase().replace(/[0-9]/g, '').replace(/[āáǎà]/g, 'a').replace(/[ēéěè]/g, 'e').replace(/[īíǐì]/g, 'i').replace(/[ōóǒò]/g, 'o').replace(/[ūúǔù]/g, 'u').replace(/[ǖǘǚǜ]/g, 'ü'),
        originalAnswer: w.py || '',
        type: 'fill-py'
      });
    }
  }
  return questions;
}

function generateQuizOptions(correct, allWords, field) {
  var options = [correct];
  var pool = [];
  for (var i = 0; i < allWords.length; i++) {
    var val = allWords[i][field];
    if (val && val !== correct) pool.push(val);
  }
  shuffleArray(pool);
  for (var j = 0; j < Math.min(3, pool.length); j++) {
    if (options.indexOf(pool[j]) < 0) options.push(pool[j]);
  }
  shuffleArray(options);
  return options;
}

function selectQuizOption(btn, selectedAnswer, correctAnswer) {
  var questionEl = btn.closest('.chinese-quiz-question');
  var allOptions = questionEl.querySelectorAll('.chinese-quiz-option');
  for (var i = 0; i < allOptions.length; i++) allOptions[i].classList.remove('selected');
  btn.classList.add('selected');
  _quizAnswers[questionEl.getAttribute('data-index')] = (selectedAnswer === correctAnswer);
}

function submitQuiz(lessonId) {
  var quizSection = document.querySelector('.chinese-quiz-section[data-lesson-id="' + lessonId + '"]');
  if (!quizSection) return;

  var questions = quizSection.querySelectorAll('.chinese-quiz-question');
  var totalQuestions = questions.length;
  var correctCount = 0;

  var submitBtn = quizSection.querySelector('.chinese-quiz-submit');
  if (submitBtn) submitBtn.style.display = 'none';

  for (var i = 0; i < questions.length; i++) {
    var q = questions[i];
    var answer = q.getAttribute('data-answer');
    var type = q.getAttribute('data-type') || 'choice';

    if (type === 'fill' || type === 'fill-py') {
      var input = q.querySelector('.fill-input');
      if (input) {
        input.disabled = true;
        var userVal = (input.value || '').trim().toLowerCase();
        var cmpAnswer = answer ? answer.toLowerCase() : '';
        // Strip tone marks for pinyin comparison
        var normalized = function(s) {
          return s.replace(/[āáǎà]/g, 'a').replace(/[ēéěè]/g, 'e').replace(/[īíǐì]/g, 'i').replace(/[ōóǒò]/g, 'o').replace(/[ūúǔù]/g, 'u').replace(/[ǖǘǚǜ]/g, 'ü').replace(/[0-9]/g, '').trim();
        };
        var isCorrect = normalized(userVal) === normalized(cmpAnswer);
        input.className = 'lrn-practice-input fill-input ' + (isCorrect ? 'correct' : 'wrong');
        if (isCorrect) correctCount++;
      }
    } else {
      var selected = q.querySelector('.chinese-quiz-option.selected');
      var allOpts = q.querySelectorAll('.chinese-quiz-option');

      for (var o = 0; o < allOpts.length; o++) {
        allOpts[o].disabled = true;
        allOpts[o].style.cursor = 'default';
        var optText = allOpts[o].getAttribute('data-opt-text') || allOpts[o].textContent.replace(/^[A-D]\. /, '').trim();
        if (optText === answer) allOpts[o].classList.add('correct');
      }

      if (selected) {
        var selectedText = selected.getAttribute('data-opt-text') || selected.textContent.replace(/^[A-D]\. /, '').trim();
        if (selectedText === answer) { correctCount++; }
        else { selected.classList.add('wrong'); }
      }
    }
  }

  var score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  var resultEl = quizSection.querySelector('.chinese-quiz-result');
  if (!resultEl) return;

  var resultHtml = '<div class="lrn-quiz-result">';
  resultHtml += '<span class="lrn-quiz-score-icon">' + (score >= 80 ? '\u{1F31F}' : score >= 60 ? '\u{1F44D}' : '\u{1F4AA}') + '</span>';
  resultHtml += '<div class="lrn-quiz-score-text">' + score + '%</div>';
  resultHtml += '<div class="lrn-quiz-score-detail">' + correctCount + '/' + totalQuestions + ' ' + _('正确', 'tačno', 'correct') + '</div>';

  // Stars
  var starCount = score >= 100 ? 5 : score >= 80 ? 4 : score >= 60 ? 3 : score >= 40 ? 2 : score >= 20 ? 1 : 0;
  resultHtml += '<div class="lrn-quiz-stars">';
  for (var s = 0; s < 5; s++) {
    resultHtml += '<span class="star ' + (s < starCount ? 'filled' : 'empty') + '">⭐</span>';
  }
  resultHtml += '</div></div>';

  if (score >= 60) {
    var newAchievements = markLessonComplete(lessonId, score, 0);
    resultHtml += '<div class="lrn-practice-feedback correct">✅ ' +
      _('恭喜通过！', 'Čestitamo!', 'Congratulations!') + '</div>';

    if (newAchievements && newAchievements.length > 0) {
      resultHtml += '<div style="text-align:center;margin-top:8px">';
      for (var a = 0; a < newAchievements.length; a++) {
        if (newAchievements[a]) {
          resultHtml += '<div style="font-size:.7rem;margin:4px;padding:6px 12px;background:var(--rose-light);border-radius:10px;display:inline-block">';
          resultHtml += (newAchievements[a].icon || '\u{1F3C6}') + ' ' + langName(newAchievements[a].name);
          resultHtml += '</div>';
        }
      }
      resultHtml += '</div>';
    }

    var nextLesson = lessonId + 1;
    if (nextLesson <= TOTAL_LESSONS && isLessonUnlocked(nextLesson)) {
      resultHtml += '<button class="btn btn-primary" onclick="renderLessonView(' + nextLesson + ',\'vocab\')" style="margin-top:12px;width:100%">' +
        _('下一课 ▸', 'Sledeća lekcija ▸', 'Next Lesson ▸') + '</button>';
    }

    triggerCelebration();

    if (typeof toast !== 'undefined') {
      toast(_('✅ 第' + lessonId + '课完成！', '✅ Lekcija ' + lessonId + ' završena!', '✅ Lesson ' + lessonId + ' complete!'));
    }
  } else {
    resultHtml += '<div class="lrn-practice-feedback wrong">' +
      _('未通过（需60%以上），再试一次吧', 'Niste prošli (potrebno 60%), probajte ponovo', 'Not passed (need 60%), try again') +
      '</div>';
    resultHtml += '<button class="lrn-quiz-retry-btn" onclick="renderLessonView(' + lessonId + ',\'quiz\')" style="margin-top:8px;width:100%">' +
      _('重新测验', 'Ponovi test', 'Retry Quiz') + '</button>';
  }

  resultEl.innerHTML = resultHtml;
}

/* ================================================================
   3. CELEBRATION EFFECT
   ================================================================ */

function triggerCelebration() {
  var colors = ['#E8877B', '#F0985C', '#4EB8B0', '#E8919C', '#9B7EC4', '#D4A843', '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF'];
  var container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999;';

  for (var i = 0; i < 50; i++) {
    var piece = document.createElement('div');
    piece.className = 'lrn-confetti-piece';
    piece.style.cssText =
      'position:fixed;width:' + (4 + Math.random() * 8) + 'px;' +
      'height:' + (4 + Math.random() * 8) + 'px;' +
      'border-radius:' + (Math.random() > 0.5 ? '50%' : '2px') + ';' +
      'left:' + (Math.random() * 100) + '%;' +
      'top:' + (-10 - Math.random() * 20) + 'px;' +
      'background:' + colors[Math.floor(Math.random() * colors.length)] + ';' +
      'animation:confetti ' + (1.5 + Math.random() * 3) + 's ease-out forwards;' +
      'animation-delay:' + (Math.random() * 0.8) + 's;' +
      'pointer-events:none;z-index:99999;';
    container.appendChild(piece);
  }

  document.body.appendChild(container);
  setTimeout(function () {
    if (container.parentNode) container.parentNode.removeChild(container);
  }, 4000);
}

/* ================================================================
   EXPOSE — Global functions for app.js and HTML onclick handlers
   ================================================================ */

window.checkPracticeAnswer = checkPracticeAnswer;
window.selectQuizOption = selectQuizOption;
window.submitQuiz = submitQuiz;

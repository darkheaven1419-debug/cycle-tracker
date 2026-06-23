/* ================================================================
   chinese-ui.js — 中文学习 UI 渲染 (UI Rendering)
   v3 — split from monolithic file: view management, all renders
   Dependencies: chinese-learn.js (core engine)
   ================================================================ */

/* ================================================================
   1. VIEW MANAGEMENT
   ================================================================ */

var _currentView = 'home';
var _currentPhaseId = null;
var _currentLessonViewId = null;
var _currentLessonTab = 'vocab';

function switchLrnView(viewName) {
  _currentView = viewName;

  // Update subnav buttons
  var btns = document.querySelectorAll('.lrn-subnav-btn');
  for (var i = 0; i < btns.length; i++) {
    if (btns[i].getAttribute('data-lrn-view') === viewName) {
      btns[i].classList.add('active');
    } else {
      btns[i].classList.remove('active');
    }
  }

  // Hide all views, show target
  var allViews = document.querySelectorAll('.lrn-view');
  for (var v = 0; v < allViews.length; v++) {
    allViews[v].classList.remove('active');
    allViews[v].style.display = 'none';
  }

  var viewMap = {
    'home': 'lrn-view-home',
    'achievements': 'lrn-view-achievements',
    'review': 'lrn-view-review',
    'stats': 'lrn-view-stats',
    'favorites': 'lrn-view-favorites',
    'phase': 'lrn-view-phase',
    'lesson': 'lrn-view-lesson'
  };

  var targetId = viewMap[viewName];
  if (targetId) {
    var targetEl = document.getElementById(targetId);
    if (targetEl) {
      targetEl.style.display = '';
      targetEl.classList.add('active');
    }
  }

  // Render content
  if (viewName === 'home') renderChineseHome();
  else if (viewName === 'achievements') renderAchievementPanel();
  else if (viewName === 'review') renderReviewPanel();
  else if (viewName === 'stats') renderStatsPanel();
  else if (viewName === 'favorites') renderFavoritesPanel();
}

function continueLearning() {
  var progress = getProgress();
  if (progress.currentLessonId && isLessonUnlocked(progress.currentLessonId)) {
    renderLessonView(progress.currentLessonId);
    return;
  }
  var firstId = getFirstIncompleteLesson();
  if (firstId) renderLessonView(firstId);
}

/* ================================================================
   2. RENDERING — fills HTML containers
   ================================================================ */

function initChineseTab() {
  // Preload speech voices on first user interaction (required for mobile TTS)
  if (typeof preloadVoices === 'function') preloadVoices();
  var tabLabel = document.getElementById('tb-chinese');
  if (tabLabel) tabLabel.textContent = _('中文学习', 'Kineski', 'Chinese');

  loadLessonData(function (err) {
    if (err) {
      var card = document.getElementById('lrnStreakCard');
      if (card) {
        card.innerHTML = '<div class="empty-state"><span class="empty-icon">⚠️</span>' +
          '<span class="empty-text">' +
          _('无法加载课程数据', 'Greška pri učitavanju lekcija', 'Failed to load lessons') +
          '</span></div>';
      }
      return;
    }
    switchLrnView('home');
  });
}

function renderChineseHome() {
  var progress = getProgress();
  var total = getTotalProgress();
  var todayReviews = getDueReviews();

  fillStreakCard(total);
  fillContinueCard(progress);
  fillDailyMotivation();
  fillPhasePath();
  fillReviewReminders(todayReviews);
}

function fillStreakCard(total) {
  var card = document.getElementById('lrnStreakCard');
  if (!card) return;
  var ringOffset = 251.2 * (1 - total.percent / 100);
  var todayProg = getTodayProgress();
  var goalLabel = _('今日目标: ', 'Dnevni cilj: ', 'Daily goal: ') + todayProg.completed + '/' + todayProg.goal;
  card.innerHTML =
    '<div class="lrn-streak-icon">\u{1F525}</div>' +
    '<div class="lrn-streak-info">' +
    '<div class="lrn-streak-count">' + total.streak + '</div>' +
    '<div class="lrn-streak-label">' + _('连续天数', 'dana zaredom', 'day streak') + '</div>' +
    '<div style="margin-top:4px;font-size:.62rem;color:var(--text-muted)">' +
    _('已完成 ', 'Završeno ', 'Completed ') + total.completedLessons + '/' + total.totalLessons +
    ' · ⭐' + (total.totalPoints || 0) +
    '</div>' +
    '<div class="lrn-daily-goal-bar" style="margin-top:8px">' +
    '<div style="display:flex;justify-content:space-between;font-size:.55rem;color:var(--text-muted);margin-bottom:3px">' +
    '<span>' + goalLabel + '</span>' +
    '<span>' + todayProg.percent + '%</span></div>' +
    '<div class="lrn-goal-track"><div class="lrn-goal-fill" style="width:' + todayProg.percent + '%"></div></div>' +
    '</div>' +
    '</div>' +
    '<div class="lrn-progress-ring-wrap">' +
    '<svg class="lrn-progress-ring" viewBox="0 0 100 100">' +
    '<circle class="lrn-ring-bg" cx="50" cy="50" r="40"/>' +
    '<circle class="lrn-ring-fg" cx="50" cy="50" r="40" style="stroke-dashoffset:' + ringOffset + '"/>' +
    '</svg>' +
    '<span class="lrn-ring-text">' + total.percent + '%</span>' +
    '</div>';
}

function fillDailyMotivation() {
  var streakCard = document.getElementById('lrnStreakCard');
  if (!streakCard) return;
  var old = document.getElementById('lrnDailyMotivation');
  if (old) old.remove();

  var motivations = [
    { zh: '每天进步一点点，滴水穿石！\u{1F4A7}', sr: 'Svaki dan po malo — kap koja buši kamen! \u{1F4A7}', en: 'A little progress each day adds up to big results! \u{1F4A7}' },
    { zh: '学习语言是打开新世界的钥匙 \u{1F511}', sr: 'Učenje jezika je ključ za novi svet \u{1F511}', en: 'Learning a language opens doors to a new world \u{1F511}' },
    { zh: '不怕慢，就怕站！\u{1F3C3}', sr: 'Ne plaši se sporosti, plaši se stajanja! \u{1F3C3}', en: 'Don\'t fear going slow, fear standing still! \u{1F3C3}' },
    { zh: '你说中文的样子很美 \u{1F495}', sr: 'Prelepa si kad pričaš kineski \u{1F495}', en: 'You\'re beautiful when you speak Chinese \u{1F495}' },
    { zh: '今天的努力是明天的自由 \u{1F54A}️', sr: 'Današnji trud je sutrašnja sloboda \u{1F54A}️', en: 'Today\'s effort is tomorrow\'s freedom \u{1F54A}️' },
    { zh: '学而时习之，不亦说乎 \u{1F4DA}', sr: 'Učiti i vežbati — nije li to radost? \u{1F4DA}', en: 'To learn and practice — is that not a joy? \u{1F4DA}' },
    { zh: '每个汉字都是一幅画 \u{1F3A8}', sr: 'Svaki kineski znak je slika \u{1F3A8}', en: 'Every Chinese character is a painting \u{1F3A8}' },
    { zh: '和你一起学中文是最幸福的事 \u{1F491}', sr: 'Učiti kineski sa tobom je najlepša stvar \u{1F491}', en: 'Learning Chinese together is the best \u{1F491}' }
  ];
  var today = new Date();
  var idx = (today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()) % motivations.length;
  var m = motivations[idx];

  var div = document.createElement('div');
  div.id = 'lrnDailyMotivation';
  div.className = 'lrn-daily-motivation';
  div.innerHTML = '<span class="lrn-daily-motivation-icon">\u{1F4AC}</span><span>' + _(m.zh, m.sr, m.en) + '</span>';
  streakCard.parentNode.insertBefore(div, streakCard.nextSibling);
}

function fillContinueCard(progress) {
  var card = document.getElementById('lrnContinueCard');
  if (!card) return;
  var currentId = progress.currentLessonId;
  var lesson = currentId ? getLessonById(currentId) : null;

  if (lesson) {
    card.style.display = 'flex';
    card.setAttribute('onclick', 'renderLessonView(' + currentId + ')');
    var iconEl = card.querySelector('.lrn-continue-icon');
    var titleEl = card.querySelector('.lrn-continue-title');
    var subEl = card.querySelector('.lrn-continue-sub');
    if (iconEl) iconEl.textContent = lesson.icon || '\u{1F4D6}';
    if (titleEl) titleEl.textContent = getTopicText(lesson.topic);
    if (subEl) subEl.textContent = _('继续学习', 'Nastavi učenje', 'Continue Learning');
  } else {
    var firstId = getFirstIncompleteLesson();
    if (firstId) {
      card.style.display = 'flex';
      card.setAttribute('onclick', 'renderLessonView(' + firstId + ')');
      var icEl = card.querySelector('.lrn-continue-icon');
      var tEl = card.querySelector('.lrn-continue-title');
      var sEl = card.querySelector('.lrn-continue-sub');
      if (icEl) icEl.textContent = '\u{1F680}';
      if (tEl) tEl.textContent = _('开始学习中文！', 'Započni učenje!', 'Start Learning!');
      if (sEl) sEl.textContent = _('从第' + firstId + '课开始', 'Od lekcije ' + firstId, 'From lesson ' + firstId);
    } else {
      card.style.display = 'none';
    }
  }
}

function getFirstIncompleteLesson() {
  var progress = getProgress();
  for (var i = 1; i <= TOTAL_LESSONS; i++) {
    if (!progress.completedLessons[String(i)] && isLessonUnlocked(i)) return i;
  }
  return null;
}

function fillPhasePath() {
  var titleEl = document.getElementById('lrn-phase-title');
  var gridEl = document.getElementById('lrnPhaseGrid');
  if (!titleEl || !gridEl) return;

  titleEl.textContent = _('学习路径', 'Put učenja', 'Learning Path');
  var phaseIcons = ['\u{1F3DB}️', '\u{1F305}', '\u{1F306}', '\u{1F338}', '\u{1F4DA}', '\u{1F451}'];
  var html = '';

  for (var p = 0; p < PHASE_NAMES.length; p++) {
    var phase = PHASE_NAMES[p];
    var pp = getPhaseProgress(phase.id);
    var pct = pp.percent || 0;
    var statusClass = pp.unlocked ? (pct >= 100 ? 'completed' : 'active') : 'locked';
    var clrClass = 'phase-clr-' + phase.id;

    html += '<div class="lrn-phase-card ' + clrClass + ' ' + statusClass + '" onclick="renderPhaseLessons(' + phase.id + ')" data-phase="' + phase.id + '">';
    html += '<div class="lrn-phase-icon-wrap" style="background:' + (statusClass === 'locked' ? 'var(--border-soft)' : 'var(--phase-clr-light)') + '">';
    html += '<span>' + (statusClass === 'locked' ? '\u{1F512}' : (phaseIcons[p] || phase.icon)) + '</span>';
    html += '</div>';
    html += '<div class="lrn-phase-name">' + getPhaseName(phase.id) + '</div>';
    html += '<div class="lrn-phase-progress">' + pp.completed + '/' + pp.total + '</div>';
    html += '<div class="lrn-phase-bar"><div class="lrn-phase-bar-fill" style="width:' + pct + '%;background:var(--phase-clr,var(--love))"></div></div>';
    if (statusClass === 'locked') html += '<span class="lrn-phase-lock-icon">\u{1F512}</span>';
    html += '</div>';
  }
  gridEl.innerHTML = html;
}

function getPhaseName(phaseId) {
  var names = {
    1: { zh: '拼音基础', sr: 'Pinyin osnove', en: 'Pinyin Basics' },
    2: { zh: '日常会话', sr: 'Svakodnevni razgovori', en: 'Daily Conversations' },
    3: { zh: '社交场景', sr: 'Društvene situacije', en: 'Social Situations' },
    4: { zh: '情感表达', sr: 'Izražavanje emocija', en: 'Emotional Expression' },
    5: { zh: '读写提升', sr: 'Čitanje i pisanje', en: 'Reading & Writing' },
    6: { zh: '高级综合', sr: 'Napredni nivo', en: 'Advanced Level' }
  };
  var n = names[phaseId] || { zh: '', sr: '', en: '' };
  return _(n.zh, n.sr, n.en);
}

function fillReviewReminders(dueReviews) {
  var card = document.getElementById('lrnReviewCard');
  var list = document.getElementById('lrnReviewList');
  var allBtn = document.getElementById('lrn-review-all-btn');
  var titleEl = document.getElementById('lrn-review-title');
  if (!card || !list) return;

  var urgent = [], soon = [], ok = [];
  for (var i = 0; i < dueReviews.length; i++) {
    if (dueReviews[i].urgency === 'urgent') urgent.push(dueReviews[i]);
    else if (dueReviews[i].urgency === 'soon') soon.push(dueReviews[i]);
    else ok.push(dueReviews[i]);
  }

  if (urgent.length === 0 && soon.length === 0) { card.style.display = 'none'; return; }

  card.style.display = '';
  if (titleEl) titleEl.textContent = _('今日复习', 'Današnji pregled', 'Review Today');

  var html = '';
  for (var u = 0; u < Math.min(urgent.length, 3); u++) html += renderReviewItemHtml(urgent[u]);
  for (var s = 0; s < Math.min(soon.length, 3); s++) html += renderReviewItemHtml(soon[s]);
  for (var o = 0; o < Math.min(ok.length, 2); o++) html += renderReviewItemHtml(ok[o]);
  list.innerHTML = html;

  if (allBtn) allBtn.style.display = (urgent.length + soon.length + ok.length > 8) ? '' : 'none';
}

function renderReviewItemHtml(review) {
  var urgClass = review.urgency;
  var dueText = review.daysUntilDue < 0
    ? _('超期 ' + Math.abs(review.daysUntilDue) + ' 天', 'Kasni ' + Math.abs(review.daysUntilDue) + ' d', Math.abs(review.daysUntilDue) + 'd late')
    : review.daysUntilDue === 0
      ? _('今天到期', 'Danas', 'Due today')
      : _('还有 ' + review.daysUntilDue + ' 天', 'Za ' + review.daysUntilDue + ' d', 'In ' + review.daysUntilDue + 'd');
  return '<div class="lrn-review-item ' + urgClass + '" onclick="renderLessonView(' + review.lessonId + ')">' +
    '<span class="lrn-review-dot ' + urgClass + '"></span>' +
    '<div class="lrn-review-info"><div class="lrn-review-topic">' + (review.topic || '') + '</div>' +
    '<div class="lrn-review-due">' + dueText + '</div></div></div>';
}

/* ---- Phase Lessons List ---- */

function renderPhaseLessons(phaseId) {
  _currentPhaseId = phaseId;

  if (!isPhaseUnlocked(phaseId)) {
    switchLrnView('home');
    if (typeof toast !== 'undefined') toast(getPhaseUnlockRequirement(phaseId));
    return;
  }

  var startId = (phaseId - 1) * 30 + 1;
  var endId = phaseId * 30;
  var progress = getProgress();
  var pp = getPhaseProgress(phaseId);

  // Fill phase header
  var headerEl = document.getElementById('lrnPhaseHeader');
  if (headerEl) {
    headerEl.innerHTML =
      '<span class="lrn-phase-header-icon">' + (PHASE_NAMES[phaseId - 1] ? PHASE_NAMES[phaseId - 1].icon : '\u{1F4DA}') + '</span>' +
      '<div class="lrn-phase-header-name">' + getPhaseName(phaseId) + '</div>' +
      '<div class="lrn-phase-header-desc">' + pp.completed + '/' + pp.total + ' ' + _('课已完成', 'lekcije završene', 'lessons done') + '</div>';
  }

  // Fill lesson list
  var listEl = document.getElementById('lrnLessonList');
  if (!listEl) return;

  var html = '';
  for (var id = startId; id <= endId; id++) {
    var lesson = getLessonById(id);
    if (!lesson) continue;

    var isComplete = !!progress.completedLessons[String(id)];
    var unlocked = isLessonUnlocked(id);
    var score = isComplete && progress.completedLessons[String(id)] ? progress.completedLessons[String(id)].score : null;
    var statusClass = isComplete ? 'completed' : (unlocked ? 'current' : 'locked');
    var clickHandler = unlocked ? ' onclick="renderLessonView(' + id + ')"' : '';
    var topicDisplay = getTopicText(lesson.topic);
    var wordsPreview = '';
    if (lesson.words && lesson.words.length > 0) {
      wordsPreview = lesson.words.slice(0, 3).map(function (w) { return w.zh; }).join(' · ');
    }

    html += '<div class="lrn-lesson-item ' + statusClass + '"' + clickHandler + '>';
    html += '<span class="lrn-lesson-num">' + (isComplete ? '✓' : (statusClass === 'locked' ? '\u{1F512}' : (lesson.day || (id - startId + 1)))) + '</span>';
    html += '<div class="lrn-lesson-info">';
    html += '<div class="lrn-lesson-topic">' + (lesson.icon || '\u{1F4D6}') + ' ' + topicDisplay + '</div>';
    if (wordsPreview) html += '<div class="lrn-lesson-words">' + wordsPreview + '</div>';
    html += '</div>';
    if (score !== null) html += '<span class="lrn-lesson-status" style="color:var(--sage);font-weight:700">' + score + '%</span>';
    html += '</div>';
  }
  listEl.innerHTML = html;
  switchLrnView('phase');
}

/* ---- Lesson Detail View ---- */

function renderLessonView(lessonId, tab) {
  var lesson = getLessonById(lessonId);
  if (!lesson) {
    if (typeof toast !== 'undefined') toast(_('未找到课程', 'Lekcija nije pronađena', 'Lesson not found'));
    return;
  }

  // If opening a different lesson, reset to vocab; otherwise use requested tab
  var isNewLesson = (_currentLessonViewId !== lessonId);
  _currentLessonViewId = lessonId;
  if (tab) {
    _currentLessonTab = tab;
  } else if (isNewLesson || !_currentLessonTab) {
    _currentLessonTab = 'vocab';
  }
  _quizAnswers = {};

  var progress = getProgress();
  var isComplete = !!progress.completedLessons[String(lessonId)];
  var phaseId = getLessonPhase(lessonId);

  // Fill lesson header
  var headerEl = document.getElementById('lrnLessonHeader');
  if (headerEl) {
    headerEl.innerHTML =
      '<span class="lrn-lesson-header-icon">' + (lesson.icon || '\u{1F4D6}') + '</span>' +
      '<div class="lrn-lesson-header-topic">' + getTopicText(lesson.topic) + '</div>' +
      '<div style="font-size:.65rem;color:var(--text-muted)">' + _('第' + lessonId + '课', 'Lekcija ' + lessonId, 'Lesson ' + lessonId) + '</div>';
  }

  // Fill step indicator
  var indicatorEl = document.getElementById('lrnStepIndicator');
  if (indicatorEl) {
    var steps = [
      { key: 'review', label_zh: '复习', label_sr: 'Pregled', label_en: 'Review', icon: '\u{1F4DD}' },
      { key: 'vocab', label_zh: '生词', label_sr: 'Reči', label_en: 'Words', icon: '\u{1F4D6}' },
      { key: 'grammar', label_zh: '语法', label_sr: 'Gram.', label_en: 'Grammar', icon: '\u{1F4D0}' },
      { key: 'practice', label_zh: '练习', label_sr: 'Vežba', label_en: 'Practice', icon: '✏️' },
      { key: 'culture', label_zh: '文化', label_sr: 'Kult.', label_en: 'Culture', icon: '\u{1F3EE}' },
      { key: 'quiz', label_zh: '测验', label_sr: 'Test', label_en: 'Quiz', icon: '✅' }
    ];
    var stepHtml = '';
    for (var s = 0; s < steps.length; s++) {
      var st = steps[s];
      var stState = _currentLessonTab === st.key ? 'active' : 'pending';
      stepHtml += '<div style="text-align:center;cursor:pointer" onclick="switchLessonTab(\'' + st.key + '\',' + lessonId + ')">';
      stepHtml += '<div class="lrn-step-dot ' + stState + '">' + st.icon + '</div>';
      stepHtml += '<div style="font-size:.48rem;color:var(--text-muted);margin-top:2px">' + _(st.label_zh, st.label_sr, st.label_en) + '</div>';
      stepHtml += '</div>';
    }
    indicatorEl.innerHTML = stepHtml;
  }

  // Fill tab content
  var contentEl = document.getElementById('lrnStepContent');
  if (contentEl) contentEl.innerHTML = renderLessonTabContent(_currentLessonTab, lesson, lessonId);

  // Fill action buttons
  var actionsEl = document.getElementById('lrnStepActions');
  if (actionsEl) {
    actionsEl.innerHTML =
      '<div style="display:flex;gap:8px;margin-top:14px">' +
      '<button class="lrn-back-btn" onclick="switchLessonTab(\'' + getPrevTab() + '\',' + lessonId + ')" style="flex:1">← ' + _('上一步', 'Prethodni', 'Prev') + '</button>' +
      '<button class="lrn-complete-btn" onclick="switchLessonTab(\'' + getNextTab() + '\',' + lessonId + ')" style="flex:1">' + _('下一步', 'Sledeći', 'Next') + ' →</button>' +
      '</div>' +
      '<button class="lrn-back-btn" onclick="renderPhaseLessons(' + phaseId + ')" style="width:100%;margin-top:8px;text-align:center">← ' + _('返回列表', 'Nazad na listu', 'Back to list') + '</button>';
  }

  // Show completed badge
  if (isComplete) {
    if (actionsEl) {
      actionsEl.innerHTML += '<div style="text-align:center;margin-top:10px"><span style="background:var(--sage-light);color:var(--sage);padding:4px 12px;border-radius:10px;font-size:.68rem">✅ ' + _('已完成', 'Završeno', 'Completed') + '</span></div>';
    }
  }

  switchLrnView('lesson');
}

function switchLessonTab(tab, lessonId) {
  renderLessonView(lessonId, tab);
}

function getPrevTab() {
  var tabs = ['review', 'vocab', 'grammar', 'practice', 'culture', 'quiz'];
  var idx = tabs.indexOf(_currentLessonTab);
  return idx > 0 ? tabs[idx - 1] : tabs[0];
}

function getNextTab() {
  var tabs = ['review', 'vocab', 'grammar', 'practice', 'culture', 'quiz'];
  var idx = tabs.indexOf(_currentLessonTab);
  return idx < tabs.length - 1 ? tabs[idx + 1] : tabs[tabs.length - 1];
}

function renderLessonTabContent(tab, lesson, lessonId) {
  switch (tab) {
    case 'review': return renderReviewStepTab(lesson, lessonId);
    case 'vocab': return renderVocabTab(lesson);
    case 'grammar': return renderGrammarTab(lesson);
    case 'practice': return renderPracticeTab(lesson, lessonId);
    case 'culture': return renderCultureTab(lesson);
    case 'quiz': return renderQuizTab(lesson, lessonId);
    default: return '';
  }
}

/* ---- Review Step Tab ---- */

function renderReviewStepTab(lesson, lessonId) {
  if (!lesson.words || lesson.words.length === 0) {
    return '<div class="lrn-empty-state"><span class="lrn-empty-icon">\u{1F4DD}</span>' +
      _('暂无内容', 'Nema sadržaja', 'No content yet') + '</div>';
  }

  var progress = getProgress();
  var lp = progress.completedLessons[String(lessonId)];

  var html = '<h3 style="font-size:.82rem;font-weight:700;text-align:center;margin-bottom:12px">\u{1F4DD} ' +
    _('课前复习', 'Pregled pre lekcije', 'Pre-lesson Review') + '</h3>';

  if (lp) {
    html += '<div style="background:var(--sage-light);border-radius:12px;padding:10px 14px;margin-bottom:14px;font-size:.7rem">';
    html += _('上次得分: ', 'Prošli rezultat: ', 'Last score: ') + '<strong>' + (lp.score || 0) + '%</strong>';
    html += '<span style="margin-left:8px;font-size:.62rem;color:var(--text-muted)">' +
      _('完成于: ', 'Završeno: ', 'Completed: ') + new Date(lp.completedAt).toLocaleDateString() + '</span>';
    html += '</div>';
  }

  html += '<p style="font-size:.68rem;color:var(--text-muted);text-align:center;margin-bottom:8px">' +
    _('快速浏览本课关键词汇', 'Brzi pregled ključnih reči', 'Quick review of key vocabulary') + '</p>';

  for (var i = 0; i < Math.min(lesson.words.length, 4); i++) {
    var w = lesson.words[i];
    html += '<div class="lrn-word-card" style="padding:12px 16px;margin-bottom:6px">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">';
    html += '<div><span class="lrn-word-zh" style="font-size:1.2rem">' + (w.zh || '') + '</span>';
    html += '<span class="lrn-word-py" style="font-size:.68rem;margin-left:8px">' + (w.py || '') + '</span></div>';
    html += '<span class="lrn-word-sr" style="font-size:.7rem">' + (w.sr || '') + '</span>';
    html += '</div>';
    html += '<button class="lrn-word-audio" onclick="event.stopPropagation();speakWord(\'' + escapeHtml(w.zh || '') + '\')" title="' + _('发音', 'Izgovor', 'Pronounce') + '" style="position:static">\u{1F50A}</button>';
    html += '</div>';
  }
  return html;
}

/* ---- Vocab Tab ---- */

function renderVocabTab(lesson) {
  if (!lesson.words || lesson.words.length === 0) {
    return '<div class="lrn-empty-state"><span class="lrn-empty-icon">\u{1F4DD}</span>' +
      _('暂无生词', 'Nema reči', 'No words yet') + '</div>';
  }
  var html = '<div style="font-size:.6rem;text-align:center;color:var(--text-muted);margin-bottom:8px">\u{1F4A1} ' +
    _('点击词卡翻转', 'Dodirni karticu da okreneš', 'Tap card to flip') + '</div>';
  for (var i = 0; i < lesson.words.length; i++) {
    var w = lesson.words[i];
    var isFav = isFavoriteWord(w.zh || '');
    var strokeHtml = '';
    var strokeInfo = getStrokeInfo(w.zh || '');
    if (strokeInfo) {
      strokeHtml = '<div class="lrn-stroke-hint">' +
        _('部首: ', 'Radikal: ', 'Radical: ') + strokeInfo.radical + ' (' + strokeInfo.radicalStrokes + _('画) 总笔画: ', ' poteza) Ukupno: ', ' strokes) Total: ') + strokeInfo.totalStrokes + _('画', ' poteza', ' strokes') +
        '</div>';
    }
    html += '<div class="lrn-word-card flip-ready" onclick="this.classList.toggle(\'flipped\')">';
    html += '<div class="lrn-word-inner">';
    html += '<div class="lrn-word-front">';
    html += '<button class="lrn-word-audio" onclick="event.stopPropagation();speakWord(\'' + escapeHtml(w.zh || '') + '\')" title="' + _('发音', 'Izgovor', 'Pronounce') + '">\u{1F50A}</button>';
    html += '<button class="lrn-fav-btn ' + (isFav ? 'fav-active' : '') + '" onclick="event.stopPropagation();window.toggleFavBtn(this,\'' + escapeHtml(w.zh || '') + '\')" title="' + _('收藏', 'Sačuvaj', 'Favorite') + '">' + (isFav ? '\u{2B50}' : '\u{2B1A}') + '</button>';
    html += '<div class="lrn-word-zh">' + (w.zh || '') + '</div>';
    html += '<div class="lrn-word-py">' + (w.py || '') + '</div>';
    if (strokeInfo) html += strokeHtml;
    html += '</div>';
    html += '<div class="lrn-word-back">';
    html += '<div class="lrn-word-sr">' + (w.sr || '') + '</div>';
    if (w.en) html += '<div class="lrn-word-en">' + (w.en || '') + '</div>';
    html += '</div>';
    html += '</div></div>';
  }
  html += '<div class="lrn-word-nav">' + _('共', 'Ukupno', 'Total') + ' ' + lesson.words.length + ' ' + _('个词', 'reči', 'words') + '</div>';
  return html;
}

function toggleFavBtn(btn, zh) {
  var nowFav = toggleFavoriteWord(zh);
  btn.textContent = nowFav ? '\u{2B50}' : '\u{2B1A}';
  btn.className = 'lrn-fav-btn' + (nowFav ? ' fav-active' : '');
}

/* ================================================================
   SPEECH SYNTHESIS — Mobile-optimized with engine pre-warming
   ================================================================ */

// Cached Chinese voice — set once on first load, reused instantly
var _zhVoice = null;
var _voicesReady = false;

// Listen for async voice loading (mobile browsers load voices after page load)
if (window.speechSynthesis) {
  // On some browsers, getVoices() returns empty until voiceschanged fires
  speechSynthesis.getVoices();
  speechSynthesis.addEventListener('voiceschanged', function () {
    _pickChineseVoice();
  });
  // Also try immediately (works on desktop, may be empty on mobile)
  _pickChineseVoice();
}

function _pickChineseVoice() {
  var voices = speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return;
  // Prefer zh-CN mainland, then any Chinese variant
  for (var i = 0; i < voices.length; i++) {
    if (voices[i].lang === 'zh-CN') { _zhVoice = voices[i]; _voicesReady = true; return; }
  }
  for (var j = 0; j < voices.length; j++) {
    if (voices[j].lang.indexOf('zh') === 0) { _zhVoice = voices[j]; _voicesReady = true; return; }
  }
}

// Pre-warm the TTS engine — called once when user opens the Chinese tab.
// On Android, the first speak() call can take 1-3 seconds while the engine loads.
// On iOS, speechSynthesis requires a user gesture — we just load voices here
// and defer actual speaking to user-initiated clicks.
function preloadVoices() {
  if (!window.speechSynthesis) return;
  var synth = window.speechSynthesis;
  // Resume if paused (some browsers pause after a while)
  if (synth.paused) synth.resume();
  // Pick voice if not yet selected
  if (!_zhVoice) _pickChineseVoice();
  // Only warm up on non-iOS (iOS requires user gesture for speak())
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!isIOS) {
    // Fire a silent utterance to wake up the TTS engine on Android/desktop
    try {
      var warmup = new SpeechSynthesisUtterance('');
      warmup.volume = 0;
      warmup.rate = 1.5;
      if (_zhVoice) warmup.voice = _zhVoice;
      warmup.onend = function () { _voicesReady = true; };
      warmup.onerror = function () { /* silent fail — engine may not be ready */ };
      synth.speak(warmup);
    } catch(e) { /* TTS warmup failed, will work on first user click */ }
  } else {
    _voicesReady = true; // iOS: mark ready, actual init happens on first click
  }
}

// Speak Chinese text — uses cached voice for zero-latency playback
function speakWord(text) {
  if (!window.speechSynthesis) return;
  var synth = window.speechSynthesis;
  // Cancel any ongoing speech (including warmup)
  synth.cancel();
  if (synth.paused) synth.resume();
  // Refresh voice cache if needed
  if (!_zhVoice) _pickChineseVoice();
  var u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  u.rate = 0.7;
  u.volume = 1;
  if (_zhVoice) u.voice = _zhVoice;
  synth.speak(u);
}

// Expose for other modules
window.preloadVoices = preloadVoices;
window.speakWord = speakWord;

/* ---- Grammar Tab ---- */

function renderGrammarTab(lesson) {
  var html = '<div class="lrn-grammar-box">';
  html += '<div class="lrn-grammar-title">\u{1F4D0} ' + _('语法要点', 'Gramatika', 'Grammar Point') + '</div>';
  if (lesson.grammar) {
    html += '<div class="lrn-grammar-text">' + _(lesson.grammar.zh || '', lesson.grammar.sr || '', lesson.grammar.en || '') + '</div>';
  } else {
    html += '<div class="lrn-grammar-text">' + _('本课暂无语法要点。', 'Nema gramatičkih objašnjenja.', 'No grammar notes for this lesson.') + '</div>';
  }
  html += '</div>';

  if (lesson.dialog) {
    html += '<h3 style="font-size:.72rem;margin:12px 0 6px">\u{1F4AC} ' + _('情景对话', 'Dijalog', 'Dialogue') + '</h3>';
    html += '<div class="lrn-dialog-box">';
    var lines = (lesson.dialog.zh || '').split('\n');
    for (var l = 0; l < lines.length; l++) {
      var isA = lines[l].indexOf('A:') === 0;
      html += '<div class="lrn-dialog-bubble speaker-' + (isA ? 'a' : 'b') + '">';
      html += '<span class="lrn-dialog-speaker">' + (isA ? 'A' : 'B') + '</span>';
      html += '<div class="lrn-dialog-zh">' + escapeHtml(lines[l].replace(/^[AB]: /, '')) + '</div>';
      html += '</div>';
    }
    html += '</div>';
  }
  return html;
}

/* ---- Practice Tab ---- */

function renderPracticeTab(lesson, lessonId) {
  if (!lesson.words || lesson.words.length === 0) {
    return '<div class="empty-state">' + _('暂无练习', 'Nema vežbe', 'No practice') + '</div>';
  }

  var html = '<div class="chinese-practice-section">';
  html += '<p class="chinese-practice-instruct">' + _('选择正确的翻译', 'Izaberite tačan prevod', 'Choose the correct translation') + '</p>';

  var practiceWords = lesson.words.slice(0, Math.min(3, lesson.words.length));
  for (var i = 0; i < practiceWords.length; i++) {
    var w = practiceWords[i];
    var options = generatePracticeOptions(w, lesson.words);
    html += '<div class="chinese-practice-question" data-word-zh="' + escapeHtml(w.zh || '') + '" data-answer="' + escapeHtml(w.sr || '') + '">';
    html += '<span class="chinese-practice-q">' + (w.zh || '') + ' = ?</span>';
    html += '<div class="lrn-practice-choice">';
    for (var o = 0; o < options.length; o++) {
      html += '<button class="lrn-practice-option" onclick="checkPracticeAnswer(this, \'' + escapeHtml(options[o]) + '\', \'' + escapeHtml(w.sr || '') + '\', this.parentElement.parentElement)">' + options[o] + '</button>';
    }
    html += '</div></div>';
  }

  html += '<div class="chinese-practice-result"></div>';
  html += '</div>';

  // Listening practice button
  html += '<div id="lrnListenContainer" style="margin-top:14px"></div>';
  html += '<button class="lrn-complete-btn" style="margin-top:8px" onclick="renderListenPractice(' + lessonId + ')">\u{1F50A} ' +
    _('听力练习', 'Vežba slušanja', 'Listening Practice') + '</button>';

  return html;
}

/* ---- Culture Tab ---- */

var _cultureDataCache = null;

function loadCultureData(callback) {
  if (_cultureDataCache) { callback(_cultureDataCache); return; }
  fetch('data/culture.json')
    .then(function (r) { return r.json(); })
    .then(function (data) { _cultureDataCache = data; callback(data); })
    .catch(function () { callback(null); });
}

function renderCultureTab(lesson) {
  var cultureText = '';
  if (lesson.culture) {
    cultureText = _(lesson.culture.zh || '', lesson.culture.sr || '', lesson.culture.en || '');
  }

  var html = '<div>';

  if (cultureText) {
    html += '<div class="lrn-culture-box">';
    html += '<span class="lrn-culture-icon">\u{1F3EE}</span>';
    html += '<div class="lrn-culture-text">' + cultureText + '</div>';
    html += '</div>';
  }

  html += '<div id="lrn-culture-card-dynamic">';
  html += '<div class="lrn-empty-state"><span class="lrn-empty-icon">\u{1F504}</span>' +
    _('加载文化知识...', 'Učitavanje...', 'Loading culture knowledge...') + '</div>';
  html += '</div>';
  html += '</div>';

  // Async load culture card
  var lessonId = _currentLessonViewId;
  setTimeout(function () {
    loadCultureData(function (data) {
      var container = document.getElementById('lrn-culture-card-dynamic');
      if (!container) return;
      if (data && data.length > 0) {
        var idx = (lessonId || 1) % data.length;
        var card = data[idx];
        container.innerHTML =
          '<div class="lrn-culture-box" style="margin-top:10px">' +
          '<span class="lrn-culture-icon">' + (card.icon || '\u{1F4DA}') + '</span>' +
          '<div style="font-weight:700;font-size:.75rem;margin-bottom:4px;color:var(--text)">' +
          (card.zh || '') + ' / ' + (card.sr || '') + '</div>' +
          '<div class="lrn-culture-text">' + (card.desc || '') + '</div>' +
          '</div>';
      } else {
        container.innerHTML = '';
      }
    });
  }, 50);

  return html;
}

/* ---- Quiz Tab ---- */

function renderQuizTab(lesson, lessonId) {
  if (!lesson.words || lesson.words.length === 0) {
    return '<div class="empty-state">' + _('暂无测验', 'Nema testa', 'No quiz') + '</div>';
  }

  _quizAnswers = {};

  var html = '<div class="chinese-quiz-section" data-lesson-id="' + lessonId + '">';
  html += '<p class="chinese-quiz-instruct">' + _('小测验 — 每题10分', 'Kviz — svako pitanje 10 poena', 'Quiz — 10 points each') + '</p>';

  var questions = generateQuizQuestions(lesson.words);
  for (var i = 0; i < questions.length; i++) {
    var q = questions[i];
    if (q.type === 'fill-zh' || q.type === 'fill-py') {
      html += '<div class="chinese-quiz-question" data-answer="' + escapeHtml(q.answer) + '" data-index="' + i + '" data-type="fill">';
      html += '<div class="chinese-quiz-q">' + q.question + '</div>';
      html += '<input type="text" class="lrn-practice-input fill-input" placeholder="' + _('输入答案', 'Unesite odgovor', 'Type answer') + '">';
      html += '</div>';
    } else {
      html += '<div class="chinese-quiz-question" data-answer="' + escapeHtml(q.answer) + '" data-index="' + i + '">';
      html += '<div class="chinese-quiz-q">' + (i + 1) + '. ' + q.question + '</div>';
      html += '<div class="lrn-practice-choice">';
      for (var o = 0; o < q.options.length; o++) {
        var label = String.fromCharCode(65 + o);
        html += '<button class="lrn-practice-option chinese-quiz-option" onclick="selectQuizOption(this, \'' + escapeHtml(q.options[o]) + '\', \'' + escapeHtml(q.answer) + '\')" data-opt-text="' + escapeHtml(q.options[o]) + '">' +
          label + '. ' + q.options[o] + '</button>';
      }
      html += '</div></div>';
    }
  }

  html += '<button class="btn btn-primary chinese-quiz-submit" onclick="submitQuiz(' + lessonId + ')" style="width:100%;margin-top:12px">' +
    _('提交答案', 'Predaj odgovore', 'Submit Answers') + '</button>';
  html += '<div class="chinese-quiz-result"></div>';
  html += '</div>';
  return html;
}

/* ---- Achievement Panel ---- */

function renderAchievementPanel() {
  var status = getAchievementStatus();

  var statsEl = document.getElementById('lrnAchStats');
  if (statsEl) {
    statsEl.innerHTML =
      '<div class="lrn-ach-stat"><div class="lrn-ach-stat-val">' + status.unlocked + '</div><div class="lrn-ach-stat-label">' + _('已解锁', 'Otključano', 'Unlocked') + '</div></div>' +
      '<div class="lrn-ach-stat"><div class="lrn-ach-stat-val">' + status.total + '</div><div class="lrn-ach-stat-label">' + _('总计', 'Ukupno', 'Total') + '</div></div>' +
      '<div class="lrn-ach-stat"><div class="lrn-ach-stat-val">' + status.percent + '%</div><div class="lrn-ach-stat-label">' + _('完成率', 'Završeno', 'Complete') + '</div></div>';
  }

  var gridEl = document.getElementById('lrnAchGrid');
  if (gridEl) {
    var html = '';
    for (var i = 0; i < status.list.length; i++) {
      var ach = status.list[i];
      html += '<div class="lrn-ach-badge ' + (ach.isUnlocked ? 'unlocked' : 'locked') + '">';
      html += '<span class="lrn-ach-icon">' + (ach.isUnlocked ? ach.icon : '\u{1F512}') + '</span>';
      html += '<div class="lrn-ach-name">' + langName(ach.name) + '</div>';
      html += '<div class="lrn-ach-desc">' + langName(ach.description) + '</div>';
      html += '</div>';
    }
    gridEl.innerHTML = html;
  }
}

/* ---- Review Panel ---- */

function renderReviewPanel() {
  var dueReviews = getDueReviews();
  var listEl = document.getElementById('lrnReviewFullList');
  if (!listEl) return;

  if (dueReviews.length === 0) {
    listEl.innerHTML = '<div class="lrn-empty-state"><span class="lrn-empty-icon">\u{1F389}</span>' +
      '<span class="lrn-empty-text">' + _('暂无待复习课程', 'Nema lekcija za ponavljanje', 'No reviews due') + '</span></div>';
    return;
  }

  var urgent = [], soon = [], later = [];
  for (var i = 0; i < dueReviews.length; i++) {
    if (dueReviews[i].urgency === 'urgent') urgent.push(dueReviews[i]);
    else if (dueReviews[i].urgency === 'soon') soon.push(dueReviews[i]);
    else later.push(dueReviews[i]);
  }

  var html = '';
  if (urgent.length > 0) {
    html += '<h4 class="lrn-review-section-title">\u{1F534} ' + _('紧急复习', 'Hitno za pregled', 'Urgent Review') + '</h4>';
    for (var u = 0; u < urgent.length; u++) html += renderFullReviewItem(urgent[u]);
  }
  if (soon.length > 0) {
    html += '<h4 class="lrn-review-section-title">\u{1F7E1} ' + _('近期复习', 'Uskoro za pregled', 'Review Soon') + '</h4>';
    for (var s = 0; s < soon.length; s++) html += renderFullReviewItem(soon[s]);
  }
  if (later.length > 0) {
    html += '<h4 class="lrn-review-section-title">\u{1F7E2} ' + _('后续复习', 'Kasnije za pregled', 'Review Later') + '</h4>';
    for (var l = 0; l < Math.min(later.length, 10); l++) html += renderFullReviewItem(later[l]);
  }

  listEl.innerHTML = html;
}

function renderFullReviewItem(review) {
  var dueText = review.daysUntilDue < 0
    ? _('超期 ' + Math.abs(review.daysUntilDue) + ' 天', 'Zakašnjenje ' + Math.abs(review.daysUntilDue) + ' dana', 'Overdue by ' + Math.abs(review.daysUntilDue) + ' days')
    : review.daysUntilDue === 0
      ? _('今天到期', 'Dospijeva danas', 'Due today')
      : _('还有 ' + review.daysUntilDue + ' 天', 'Preostalo ' + review.daysUntilDue + ' dana', review.daysUntilDue + ' days left');

  return '<div class="lrn-review-item ' + review.urgency + '" onclick="renderLessonView(' + review.lessonId + ')">' +
    '<span class="lrn-review-dot ' + review.urgency + '"></span>' +
    '<div class="lrn-review-info"><div class="lrn-review-topic">' + review.icon + ' ' + review.topic + '</div>' +
    '<div class="lrn-review-due">' + dueText + '</div></div></div>';
}

/* Stats & Favorites panels → js/chinese-panels.js */
/* Listening practice functions → js/chinese-listen.js */

/* ================================================================
   EXPOSE — Global functions for app.js and HTML onclick handlers
   ================================================================ */

window.toggleFavBtn = toggleFavBtn;
window.initChineseTab = initChineseTab;
window.renderChineseHome = renderChineseHome;
window.renderPhaseLessons = renderPhaseLessons;
window.renderLessonView = renderLessonView;
window.renderAchievementPanel = renderAchievementPanel;
window.renderReviewPanel = renderReviewPanel;
window.switchLrnView = switchLrnView;
window.continueLearning = continueLearning;
window.switchLessonTab = switchLessonTab;
window.speakWord = speakWord;
/* renderStatsPanel, renderFavoritesPanel → js/chinese-panels.js */
/* renderListenPractice, startListenSession, checkListenAnswer, nextListenWord → js/chinese-listen.js */

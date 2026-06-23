/* ================================================================
   chinese-learn.js — 中文学习核心引擎 (Chinese Learning Engine)
   180 lessons (6 phases × 30), achievements, review system, progress
   v2 — refactored: renders into HTML containers, view management
   ================================================================ */

/* ---- Data Caches ---- */
var LESSONS_DATA = [];
var ACHIEVEMENTS_DATA = [];
var _lessonsLoaded = false;
var _lessonsLoading = false;
var _lessonLoadQueue = [];

/* ---- Progress Constants ---- */
var PROGRESS_KEY_PREFIX = 'chinese-progress-';
var REVIEW_INTERVALS = [1, 3, 7, 14, 30]; // Ebbinghaus review intervals (days)
var PHASE_NAMES = [
  { id: 1, icon: '🔤', key: 'pinyin' },
  { id: 2, icon: '🗣️', key: 'conversation' },
  { id: 3, icon: '🤝', key: 'social' },
  { id: 4, icon: '💖', key: 'emotional' },
  { id: 5, icon: '📖', key: 'reading' },
  { id: 6, icon: '🎓', key: 'advanced' }
];
var TOTAL_LESSONS = 180;
var LESSONS_PER_PHASE = 30;

/* ================================================================
   1. DATA LOADING
   ================================================================ */

function loadLessonData(callback) {
  if (_lessonsLoaded) {
    if (callback) callback(null);
    return;
  }
  if (_lessonsLoading) {
    if (callback) _lessonLoadQueue.push(callback);
    return;
  }
  _lessonsLoading = true;

  var lessonsUrl = 'data/lessons.json';
  var achievementsUrl = 'data/achievements.json';
  var loadedCount = 0;
  var totalToLoad = 2;
  var loadError = null;

  function onLoaded(err) {
    if (err) loadError = err;
    loadedCount++;
    if (loadedCount >= totalToLoad) {
      _lessonsLoading = false;
      if (!loadError) {
        _lessonsLoaded = true;
        applyPhaseAssignments();
      }
      if (callback) callback(loadError);
      for (var i = 0; i < _lessonLoadQueue.length; i++) {
        _lessonLoadQueue[i](loadError);
      }
      _lessonLoadQueue = [];
    }
  }

  fetch(lessonsUrl)
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' loading lessons');
      return r.json();
    })
    .then(function (data) {
      LESSONS_DATA = [];
      for (var pi = 0; pi < data.length; pi++) {
        var phaseLessons = data[pi].lessons || [];
        for (var li = 0; li < phaseLessons.length; li++) {
          var les = phaseLessons[li];
          if (!les.phase) les.phase = data[pi].phase;
          LESSONS_DATA.push(les);
        }
      }
      onLoaded(null);
    })
    .catch(function (err) { onLoaded(err); });

  fetch(achievementsUrl)
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' loading achievements');
      return r.json();
    })
    .then(function (data) {
      ACHIEVEMENTS_DATA = data;
      onLoaded(null);
    })
    .catch(function (err) { onLoaded(err); });
}

function applyPhaseAssignments() {
  for (var i = 0; i < LESSONS_DATA.length; i++) {
    var lesson = LESSONS_DATA[i];
    if (!lesson.phase) lesson.phase = Math.floor(i / 30) + 1;
    if (!lesson.day) lesson.day = (i % 30) + 1;
    if (!lesson.id) lesson.id = i + 1;
  }
}

function isDataLoaded() { return _lessonsLoaded; }

/* ================================================================
   2. PROGRESS MANAGEMENT
   ================================================================ */

var _currentProgress = null;

function getProgressKey() {
  return PROGRESS_KEY_PREFIX + (typeof activeProfile !== 'undefined' ? activeProfile : 'default');
}

function loadProgress() {
  var key = getProgressKey();
  try {
    var raw = localStorage.getItem(key);
    if (raw) { _currentProgress = JSON.parse(raw); return _currentProgress; }
  } catch (e) { /* corrupted */ }
  _currentProgress = getDefaultProgress();
  return _currentProgress;
}

function saveProgress(progress) {
  var p = progress || _currentProgress || getDefaultProgress();
  _currentProgress = p;
  try { localStorage.setItem(getProgressKey(), JSON.stringify(p)); } catch (e) { /* full */ }
  if (typeof scheduleSync !== 'undefined') scheduleSync();
}

function getDefaultProgress() {
  return {
    version: 1,
    completedLessons: {},
    currentLessonId: null,
    totalPoints: 0,
    totalTimeSpent: 0,
    studyStreak: { current: 0, longest: 0, lastDate: null },
    reviews: {},
    achievements: {},
    dailyStats: {},
    perfectScores: 0,
    quizResults: {}
  };
}

function getProgress() {
  if (!_currentProgress) loadProgress();
  return _currentProgress;
}

/* ================================================================
   3. UNLOCK & PROGRESS LOGIC
   ================================================================ */

function getLessonPhase(lessonId) {
  var lesson = getLessonById(lessonId);
  if (lesson && lesson.phase) return lesson.phase;
  return Math.floor((lessonId - 1) / LESSONS_PER_PHASE) + 1;
}

function isLessonUnlocked(lessonId) {
  var progress = getProgress();
  var phase = getLessonPhase(lessonId);
  if (phase <= 1) return true;
  var prevProgress = getPhaseProgress(phase - 1);
  if (prevProgress.percent < 80) return false;
  var lessonIndex = (lessonId - 1) % LESSONS_PER_PHASE;
  if (lessonIndex > 0) {
    if (!progress.completedLessons[String(lessonId - 1)]) return false;
  }
  return true;
}

function getPhaseUnlockRequirement(phase) {
  if (phase <= 1) return _('直接可用', 'Dostupno odmah', 'Available now');
  var needed = Math.ceil(LESSONS_PER_PHASE * 0.8);
  return _(
    '完成阶段' + (phase - 1) + '至少' + needed + '课',
    'Završite najmanje ' + needed + ' lekcija faze ' + (phase - 1),
    'Complete at least ' + needed + ' lessons in phase ' + (phase - 1)
  );
}

function markLessonComplete(lessonId, score, timeSpentSeconds) {
  var progress = getProgress();
  var id = String(lessonId);
  var newAchievements = [];

  if (progress.completedLessons[id]) {
    if (score > (progress.completedLessons[id].score || 0)) {
      progress.completedLessons[id].score = score;
    }
  } else {
    progress.completedLessons[id] = {
      completedAt: new Date().toISOString(),
      score: score || 0,
      timeSpent: timeSpentSeconds || 0
    };
  }

  if (score === 100) progress.perfectScores = (progress.perfectScores || 0) + 1;
  if (score) progress.totalPoints = (progress.totalPoints || 0) + score;
  if (timeSpentSeconds) progress.totalTimeSpent = (progress.totalTimeSpent || 0) + timeSpentSeconds;

  updateStreak(progress);
  updateDailyStats(progress, timeSpentSeconds || 0);
  setInitialReview(progress, lessonId);
  newAchievements = checkAchievements(progress);

  var nextId = lessonId + 1;
  if (nextId <= TOTAL_LESSONS && isLessonUnlocked(nextId)) {
    progress.currentLessonId = nextId;
  } else {
    progress.currentLessonId = null;
  }

  saveProgress(progress);
  return newAchievements;
}

function updateStreak(progress) {
  var today = fmtDateLocal(new Date());
  var lastDate = progress.studyStreak.lastDate;
  if (lastDate === today) return;
  var yesterday = fmtDateLocal(addDaysLocal(new Date(), -1));
  if (lastDate === yesterday) { progress.studyStreak.current++; }
  else if (lastDate === null) { progress.studyStreak.current = 1; }
  else { progress.studyStreak.current = 1; }
  if (progress.studyStreak.current > progress.studyStreak.longest) {
    progress.studyStreak.longest = progress.studyStreak.current;
  }
  progress.studyStreak.lastDate = today;
}

function updateDailyStats(progress, timeSpent) {
  var today = fmtDateLocal(new Date());
  if (!progress.dailyStats) progress.dailyStats = {};
  if (!progress.dailyStats[today]) {
    progress.dailyStats[today] = { lessonsCompleted: 0, timeSpent: 0, pointsEarned: 0 };
  }
  progress.dailyStats[today].lessonsCompleted++;
  progress.dailyStats[today].timeSpent += timeSpent;
}

function getTotalProgress() {
  var progress = getProgress();
  var completed = Object.keys(progress.completedLessons).length;
  return {
    completedLessons: completed,
    totalLessons: TOTAL_LESSONS,
    percent: Math.round((completed / TOTAL_LESSONS) * 100),
    totalPoints: progress.totalPoints || 0,
    streak: progress.studyStreak.current || 0,
    longestStreak: progress.studyStreak.longest || 0
  };
}

function getPhaseProgress(phase) {
  var progress = getProgress();
  var completed = 0;
  var startId = (phase - 1) * LESSONS_PER_PHASE + 1;
  var endId = phase * LESSONS_PER_PHASE;
  for (var id = startId; id <= endId; id++) {
    if (progress.completedLessons[String(id)]) completed++;
  }
  return {
    completed: completed,
    total: LESSONS_PER_PHASE,
    percent: Math.round((completed / LESSONS_PER_PHASE) * 100),
    unlocked: isPhaseUnlocked(phase)
  };
}

function isPhaseUnlocked(phase) {
  if (phase <= 1) return true;
  return getPhaseProgress(phase - 1).percent >= 80;
}

/* ================================================================
   4. REVIEW SYSTEM (Ebbinghaus Forgetting Curve)
   ================================================================ */

function setInitialReview(progress, lessonId) {
  if (!progress.reviews) progress.reviews = {};
  var id = String(lessonId);
  if (!progress.reviews[id]) {
    progress.reviews[id] = {
      history: [],
      nextDue: fmtDateLocal(addDaysLocal(new Date(), REVIEW_INTERVALS[0])),
      intervalIndex: 0
    };
  }
}

function getDueReviews() {
  var progress = getProgress();
  if (!progress.reviews) return [];
  var today = fmtDateLocal(new Date());
  var reviews = [];
  var keys = Object.keys(progress.reviews);

  for (var i = 0; i < keys.length; i++) {
    var id = keys[i];
    var review = progress.reviews[id];
    if (!review.nextDue) continue;
    var lesson = getLessonById(parseInt(id, 10));
    if (!lesson) continue;

    var daysUntilDue = dateDiffDays(review.nextDue, today);
    var urgency = daysUntilDue <= 0 ? 'urgent' : (daysUntilDue <= 3 ? 'soon' : 'ok');

    reviews.push({
      lessonId: parseInt(id, 10),
      topic: getTopicText(lesson.topic),
      icon: lesson.icon || '📖',
      lastReview: getLastReviewDate(review),
      nextDue: review.nextDue,
      daysUntilDue: daysUntilDue,
      urgency: urgency
    });
  }

  reviews.sort(function (a, b) {
    var order = { urgent: 0, soon: 1, ok: 2 };
    return (order[a.urgency] || 3) - (order[b.urgency] || 3) || a.daysUntilDue - b.daysUntilDue;
  });

  return reviews;
}

function getLastReviewDate(review) {
  if (review.history && review.history.length > 0) return review.history[review.history.length - 1];
  return null;
}

function markLessonReviewed(lessonId) {
  var progress = getProgress();
  var id = String(lessonId);
  var today = fmtDateLocal(new Date());
  if (!progress.reviews) progress.reviews = {};
  if (!progress.reviews[id]) {
    progress.reviews[id] = { history: [], nextDue: today, intervalIndex: 0 };
  }
  var review = progress.reviews[id];
  if (!review.history) review.history = [];
  review.history.push(today);
  review.intervalIndex = Math.min((review.intervalIndex || 0) + 1, REVIEW_INTERVALS.length - 1);
  review.nextDue = fmtDateLocal(addDaysLocal(new Date(), REVIEW_INTERVALS[review.intervalIndex]));
  saveProgress(progress);
}

function dateDiffDays(dateStr1, dateStr2) {
  return Math.round((parseDateLocal(dateStr1) - parseDateLocal(dateStr2)) / 86400000);
}

/* ================================================================
   5. ACHIEVEMENT SYSTEM
   ================================================================ */

function checkAchievements(progress) {
  var newlyUnlocked = [];
  for (var i = 0; i < ACHIEVEMENTS_DATA.length; i++) {
    var ach = ACHIEVEMENTS_DATA[i];
    if (progress.achievements[ach.id]) continue;
    if (isAchievementConditionMet(ach, progress)) {
      newlyUnlocked.push(unlockAchievement(progress, ach.id));
    }
  }
  return newlyUnlocked;
}

function isAchievementConditionMet(ach, progress) {
  var cond = ach.condition;
  if (!cond) return false;
  switch (cond.type) {
    case 'lessonsCompleted': return getCompletedCount(progress) >= cond.value;
    case 'phaseComplete': return getPhaseProgress(cond.phaseId).completed >= LESSONS_PER_PHASE;
    case 'streak': return (progress.studyStreak.current || 0) >= cond.value;
    case 'totalPoints': return (progress.totalPoints || 0) >= cond.value;
    case 'perfectScore': return (progress.perfectScores || 0) >= cond.value;
    case 'timeSpent': return (progress.totalTimeSpent || 0) >= cond.value;
    case 'allLessons': return getCompletedCount(progress) >= TOTAL_LESSONS;
    default: return false;
  }
}

function getCompletedCount(progress) {
  return Object.keys(progress.completedLessons || {}).length;
}

function unlockAchievement(progress, achievementId) {
  if (!progress.achievements) progress.achievements = {};
  progress.achievements[achievementId] = { unlockedAt: new Date().toISOString() };
  var ach = null;
  for (var i = 0; i < ACHIEVEMENTS_DATA.length; i++) {
    if (ACHIEVEMENTS_DATA[i].id === achievementId) { ach = ACHIEVEMENTS_DATA[i]; break; }
  }
  if (ach && ach.points) progress.totalPoints = (progress.totalPoints || 0) + ach.points;
  return ach || { id: achievementId };
}

function getAchievementStatus() {
  var progress = getProgress();
  var unlocked = 0;
  var list = [];
  for (var i = 0; i < ACHIEVEMENTS_DATA.length; i++) {
    var ach = ACHIEVEMENTS_DATA[i];
    var isUnlocked = !!(progress.achievements && progress.achievements[ach.id]);
    if (isUnlocked) unlocked++;
    list.push({
      id: ach.id, icon: ach.icon, name: ach.name, description: ach.description,
      points: ach.points, isUnlocked: isUnlocked,
      unlockedAt: isUnlocked ? progress.achievements[ach.id].unlockedAt : null
    });
  }
  return {
    unlocked: unlocked, total: ACHIEVEMENTS_DATA.length,
    percent: ACHIEVEMENTS_DATA.length > 0 ? Math.round((unlocked / ACHIEVEMENTS_DATA.length) * 100) : 0,
    list: list
  };
}

/* ================================================================
   6. VIEW MANAGEMENT
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
   7. RENDERING — fills HTML containers
   ================================================================ */

function initChineseTab() {
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
  card.innerHTML =
    '<div class="lrn-streak-icon">🔥</div>' +
    '<div class="lrn-streak-info">' +
    '<div class="lrn-streak-count">' + total.streak + '</div>' +
    '<div class="lrn-streak-label">' + _('连续天数', 'dana zaredom', 'day streak') + '</div>' +
    '<div style="margin-top:4px;font-size:.62rem;color:var(--text-muted)">' +
    _('已完成 ', 'Završeno ', 'Completed ') + total.completedLessons + '/' + total.totalLessons +
    ' · ⭐' + (total.totalPoints || 0) +
    '</div></div>' +
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
    { zh: '每天进步一点点，滴水穿石！💧', sr: 'Svaki dan po malo — kap koja buši kamen! 💧', en: 'A little progress each day adds up to big results! 💧' },
    { zh: '学习语言是打开新世界的钥匙 🔑', sr: 'Učenje jezika je ključ za novi svet 🔑', en: 'Learning a language opens doors to a new world 🔑' },
    { zh: '不怕慢，就怕站！🏃', sr: 'Ne plaši se sporosti, plaši se stajanja! 🏃', en: 'Don\'t fear going slow, fear standing still! 🏃' },
    { zh: '你说中文的样子很美 💕', sr: 'Prelepa si kad pričaš kineski 💕', en: 'You\'re beautiful when you speak Chinese 💕' },
    { zh: '今天的努力是明天的自由 🕊️', sr: 'Današnji trud je sutrašnja sloboda 🕊️', en: 'Today\'s effort is tomorrow\'s freedom 🕊️' },
    { zh: '学而时习之，不亦说乎 📚', sr: 'Učiti i vežbati — nije li to radost? 📚', en: 'To learn and practice — is that not a joy? 📚' },
    { zh: '每个汉字都是一幅画 🎨', sr: 'Svaki kineski znak je slika 🎨', en: 'Every Chinese character is a painting 🎨' },
    { zh: '和你一起学中文是最幸福的事 💑', sr: 'Učiti kineski sa tobom je najlepša stvar 💑', en: 'Learning Chinese together is the best 💑' }
  ];
  var today = new Date();
  var idx = (today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()) % motivations.length;
  var m = motivations[idx];

  var div = document.createElement('div');
  div.id = 'lrnDailyMotivation';
  div.className = 'lrn-daily-motivation';
  div.innerHTML = '<span class="lrn-daily-motivation-icon">💬</span><span>' + _(m.zh, m.sr, m.en) + '</span>';
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
    if (iconEl) iconEl.textContent = lesson.icon || '📖';
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
      if (icEl) icEl.textContent = '🚀';
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
  var phaseIcons = ['🏛️', '🌅', '🌆', '🌸', '📚', '👑'];
  var html = '';

  for (var p = 0; p < PHASE_NAMES.length; p++) {
    var phase = PHASE_NAMES[p];
    var pp = getPhaseProgress(phase.id);
    var pct = pp.percent || 0;
    var statusClass = pp.unlocked ? (pct >= 100 ? 'completed' : 'active') : 'locked';
    var clrClass = 'phase-clr-' + phase.id;

    html += '<div class="lrn-phase-card ' + clrClass + ' ' + statusClass + '" onclick="renderPhaseLessons(' + phase.id + ')" data-phase="' + phase.id + '">';
    html += '<div class="lrn-phase-icon-wrap" style="background:' + (statusClass === 'locked' ? 'var(--border-soft)' : 'var(--phase-clr-light)') + '">';
    html += '<span>' + (statusClass === 'locked' ? '🔒' : (phaseIcons[p] || phase.icon)) + '</span>';
    html += '</div>';
    html += '<div class="lrn-phase-name">' + getPhaseName(phase.id) + '</div>';
    html += '<div class="lrn-phase-progress">' + pp.completed + '/' + pp.total + '</div>';
    html += '<div class="lrn-phase-bar"><div class="lrn-phase-bar-fill" style="width:' + pct + '%;background:var(--phase-clr,var(--love))"></div></div>';
    if (statusClass === 'locked') html += '<span class="lrn-phase-lock-icon">🔒</span>';
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
      '<span class="lrn-phase-header-icon">' + (PHASE_NAMES[phaseId - 1] ? PHASE_NAMES[phaseId - 1].icon : '📚') + '</span>' +
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
    html += '<span class="lrn-lesson-num">' + (isComplete ? '✓' : (statusClass === 'locked' ? '🔒' : (lesson.day || (id - startId + 1)))) + '</span>';
    html += '<div class="lrn-lesson-info">';
    html += '<div class="lrn-lesson-topic">' + (lesson.icon || '📖') + ' ' + topicDisplay + '</div>';
    if (wordsPreview) html += '<div class="lrn-lesson-words">' + wordsPreview + '</div>';
    html += '</div>';
    if (score !== null) html += '<span class="lrn-lesson-status" style="color:var(--sage);font-weight:700">' + score + '%</span>';
    html += '</div>';
  }
  listEl.innerHTML = html;
  switchLrnView('phase');
}

/* ---- Lesson Detail View ---- */

function renderLessonView(lessonId) {
  var lesson = getLessonById(lessonId);
  if (!lesson) {
    if (typeof toast !== 'undefined') toast(_('未找到课程', 'Lekcija nije pronađena', 'Lesson not found'));
    return;
  }

  _currentLessonViewId = lessonId;
  _currentLessonTab = 'vocab';
  _quizAnswers = {};

  var progress = getProgress();
  var isComplete = !!progress.completedLessons[String(lessonId)];
  var phaseId = getLessonPhase(lessonId);

  // Fill lesson header
  var headerEl = document.getElementById('lrnLessonHeader');
  if (headerEl) {
    headerEl.innerHTML =
      '<span class="lrn-lesson-header-icon">' + (lesson.icon || '📖') + '</span>' +
      '<div class="lrn-lesson-header-topic">' + getTopicText(lesson.topic) + '</div>' +
      '<div style="font-size:.65rem;color:var(--text-muted)">' + _('第' + lessonId + '课', 'Lekcija ' + lessonId, 'Lesson ' + lessonId) + '</div>';
  }

  // Fill step indicator
  var indicatorEl = document.getElementById('lrnStepIndicator');
  if (indicatorEl) {
    var steps = [
      { key: 'review', label_zh: '复习', label_sr: 'Pregled', label_en: 'Review', icon: '📝' },
      { key: 'vocab', label_zh: '生词', label_sr: 'Reči', label_en: 'Words', icon: '📖' },
      { key: 'grammar', label_zh: '语法', label_sr: 'Gram.', label_en: 'Grammar', icon: '📐' },
      { key: 'practice', label_zh: '练习', label_sr: 'Vežba', label_en: 'Practice', icon: '✏️' },
      { key: 'culture', label_zh: '文化', label_sr: 'Kult.', label_en: 'Culture', icon: '🏮' },
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
  _currentLessonTab = tab;
  renderLessonView(lessonId);
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
    return '<div class="lrn-empty-state"><span class="lrn-empty-icon">📝</span>' +
      _('暂无内容', 'Nema sadržaja', 'No content yet') + '</div>';
  }

  var progress = getProgress();
  var lp = progress.completedLessons[String(lessonId)];

  var html = '<h3 style="font-size:.82rem;font-weight:700;text-align:center;margin-bottom:12px">📝 ' +
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
    html += '<button class="lrn-word-audio" onclick="event.stopPropagation();speakWord(\'' + escapeHtml(w.zh || '') + '\')" title="' + _('发音', 'Izgovor', 'Pronounce') + '" style="position:static">🔊</button>';
    html += '</div>';
  }
  return html;
}

/* ---- Vocab Tab ---- */

function renderVocabTab(lesson) {
  if (!lesson.words || lesson.words.length === 0) {
    return '<div class="lrn-empty-state"><span class="lrn-empty-icon">📝</span>' +
      _('暂无生词', 'Nema reči', 'No words yet') + '</div>';
  }
  var html = '';
  for (var i = 0; i < lesson.words.length; i++) {
    var w = lesson.words[i];
    html += '<div class="lrn-word-card">';
    html += '<div class="lrn-word-zh">' + (w.zh || '') + '</div>';
    html += '<div class="lrn-word-py">' + (w.py || '') + '</div>';
    html += '<div class="lrn-word-sr">' + (w.sr || '') + '</div>';
    if (w.en) html += '<div class="lrn-word-en">' + (w.en || '') + '</div>';
    html += '<button class="lrn-word-audio" onclick="event.stopPropagation();speakWord(\'' + escapeHtml(w.zh || '') + '\')" title="' + _('发音', 'Izgovor', 'Pronounce') + '">🔊</button>';
    html += '</div>';
  }
  html += '<div class="lrn-word-nav">' + _('共', 'Ukupno', 'Total') + ' ' + lesson.words.length + ' ' + _('个词', 'reči', 'words') + '</div>';
  return html;
}

function speakWord(text) {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN'; u.rate = 0.7;
    window.speechSynthesis.speak(u);
  }
}

/* ---- Grammar Tab ---- */

function renderGrammarTab(lesson) {
  var html = '<div class="lrn-grammar-box">';
  html += '<div class="lrn-grammar-title">📐 ' + _('语法要点', 'Gramatika', 'Grammar Point') + '</div>';
  if (lesson.grammar) {
    html += '<div class="lrn-grammar-text">' + _(lesson.grammar.zh || '', lesson.grammar.sr || '', lesson.grammar.en || '') + '</div>';
  } else {
    html += '<div class="lrn-grammar-text">' + _('本课暂无语法要点。', 'Nema gramatičkih objašnjenja.', 'No grammar notes for this lesson.') + '</div>';
  }
  html += '</div>';

  if (lesson.dialog) {
    html += '<h3 style="font-size:.72rem;margin:12px 0 6px">💬 ' + _('情景对话', 'Dijalog', 'Dialogue') + '</h3>';
    html += '<div class="lrn-dialog-box">';
    var lines = _(lesson.dialog.zh || '', lesson.dialog.sr || '', lesson.dialog.en || '').split('\n');
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
    html += '<span class="lrn-culture-icon">🏮</span>';
    html += '<div class="lrn-culture-text">' + cultureText + '</div>';
    html += '</div>';
  }

  html += '<div id="lrn-culture-card-dynamic">';
  html += '<div class="lrn-empty-state"><span class="lrn-empty-icon">🔄</span>' +
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
          '<span class="lrn-culture-icon">' + (card.icon || '📚') + '</span>' +
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

  html += '<button class="btn btn-primary chinese-quiz-submit" onclick="submitQuiz(' + lessonId + ')" style="width:100%;margin-top:12px">' +
    _('提交答案', 'Predaj odgovore', 'Submit Answers') + '</button>';
  html += '<div class="chinese-quiz-result"></div>';
  html += '</div>';
  return html;
}

/* ---- Helpers: Practice & Quiz ---- */

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
  var fillers = ['Zdravo', 'Hvala', 'Doviđenja', 'Dobro', 'Molim'];
  while (options.length < 4) {
    var f = fillers[Math.floor(Math.random() * fillers.length)];
    if (options.indexOf(f) < 0) options.push(f);
  }
  shuffleArray(options);
  return options;
}

function generateQuizQuestions(words) {
  var questions = [];
  for (var i = 0; i < words.length && i < 5; i++) {
    var w = words[i];
    var direction = Math.random() > 0.5 ? 'zh2sr' : 'sr2zh';
    if (direction === 'zh2sr') {
      questions.push({
        question: w.zh + ' 的意思是？',
        answer: w.sr || '',
        options: generateQuizOptions(w.sr || '', words, 'sr')
      });
    } else {
      questions.push({
        question: '"' + (w.sr || '') + '" 的中文是？',
        answer: w.zh || '',
        options: generateQuizOptions(w.zh || '', words, 'zh')
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

/* ================================================================
   8. INTERACTION HANDLERS
   ================================================================ */

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

var _quizAnswers = {};

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
    var selected = q.querySelector('.chinese-quiz-option.selected');
    var allOpts = q.querySelectorAll('.chinese-quiz-option');

    for (var o = 0; o < allOpts.length; o++) {
      allOpts[o].disabled = true;
      allOpts[o].style.cursor = 'default';
      // FIXED: exact text match via data-opt-text attribute
      var optText = allOpts[o].getAttribute('data-opt-text') || allOpts[o].textContent.replace(/^[A-D]\. /, '').trim();
      if (optText === answer) allOpts[o].classList.add('correct');
    }

    if (selected) {
      var selectedText = selected.getAttribute('data-opt-text') || selected.textContent.replace(/^[A-D]\. /, '').trim();
      if (selectedText === answer) { correctCount++; }
      else { selected.classList.add('wrong'); }
    }
  }

  var score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  var resultEl = quizSection.querySelector('.chinese-quiz-result');
  if (!resultEl) return;

  var resultHtml = '<div class="lrn-quiz-result">';
  resultHtml += '<span class="lrn-quiz-score-icon">' + (score >= 80 ? '🌟' : score >= 60 ? '👍' : '💪') + '</span>';
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
          resultHtml += (newAchievements[a].icon || '🏆') + ' ' + langName(newAchievements[a].name);
          resultHtml += '</div>';
        }
      }
      resultHtml += '</div>';
    }

    var nextLesson = lessonId + 1;
    if (nextLesson <= TOTAL_LESSONS && isLessonUnlocked(nextLesson)) {
      resultHtml += '<button class="btn btn-primary" onclick="renderLessonView(' + nextLesson + ')" style="margin-top:12px;width:100%">' +
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
    resultHtml += '<button class="lrn-quiz-retry-btn" onclick="renderLessonView(' + lessonId + ')" style="margin-top:8px;width:100%">' +
      _('重新测验', 'Ponovi test', 'Retry Quiz') + '</button>';
  }

  resultEl.innerHTML = resultHtml;
}

/* ---- Celebration Effect ---- */

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
      html += '<span class="lrn-ach-icon">' + (ach.isUnlocked ? ach.icon : '🔒') + '</span>';
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
    listEl.innerHTML = '<div class="lrn-empty-state"><span class="lrn-empty-icon">🎉</span>' +
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
    html += '<h4 class="lrn-review-section-title">🔴 ' + _('紧急复习', 'Hitno za pregled', 'Urgent Review') + '</h4>';
    for (var u = 0; u < urgent.length; u++) html += renderFullReviewItem(urgent[u]);
  }
  if (soon.length > 0) {
    html += '<h4 class="lrn-review-section-title">🟡 ' + _('近期复习', 'Uskoro za pregled', 'Review Soon') + '</h4>';
    for (var s = 0; s < soon.length; s++) html += renderFullReviewItem(soon[s]);
  }
  if (later.length > 0) {
    html += '<h4 class="lrn-review-section-title">🟢 ' + _('后续复习', 'Kasnije za pregled', 'Review Later') + '</h4>';
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

/* ================================================================
   9. UTILITY FUNCTIONS
   ================================================================ */

function _(zh, sr, en) {
  if (typeof lang === 'undefined') return en || sr || zh;
  if (lang === 'sr') return sr;
  if (lang === 'zh-CN' || lang === 'zh') return zh;
  if (lang === 'en') return en;
  return sr;
}

function langName(obj) {
  if (!obj) return '';
  if (typeof lang === 'undefined') return obj.en || obj.sr || obj.zh || '';
  if (lang === 'sr') return obj.sr || obj.en || obj.zh || '';
  if (lang === 'zh-CN' || lang === 'zh') return obj.zh || obj.en || obj.sr || '';
  return obj.en || obj.sr || obj.zh || '';
}

function getTopicText(topic) {
  if (typeof topic === 'object' && topic !== null) return _(topic.zh || '', topic.sr || '', topic.en || '');
  return String(topic || '');
}

function getLessonById(id) {
  var numId = typeof id === 'string' ? parseInt(id, 10) : id;
  for (var i = 0; i < LESSONS_DATA.length; i++) {
    if (LESSONS_DATA[i].id === numId) return LESSONS_DATA[i];
    if (i + 1 === numId) return LESSONS_DATA[i];
  }
  return null;
}

function fmtDateLocal(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function parseDateLocal(str) {
  if (!str) return new Date();
  var parts = str.split('-');
  return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
}

function addDaysLocal(d, days) {
  var result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

function shuffleArray(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
  }
  return arr;
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ================================================================
   EXPOSE — Global functions for app.js and HTML onclick handlers
   ================================================================ */

window.initChineseTab = initChineseTab;
window.renderChineseHome = renderChineseHome;
window.renderPhaseLessons = renderPhaseLessons;
window.renderLessonView = renderLessonView;
window.renderAchievementPanel = renderAchievementPanel;
window.renderReviewPanel = renderReviewPanel;
window.switchLrnView = switchLrnView;
window.continueLearning = continueLearning;
window.switchLessonTab = switchLessonTab;
window.checkPracticeAnswer = checkPracticeAnswer;
window.selectQuizOption = selectQuizOption;
window.submitQuiz = submitQuiz;
window.loadLessonData = loadLessonData;
window.isDataLoaded = isDataLoaded;
window.loadProgress = loadProgress;
window.saveProgress = saveProgress;
window.getTotalProgress = getTotalProgress;
window.getPhaseProgress = getPhaseProgress;
window.isLessonUnlocked = isLessonUnlocked;
window.getDueReviews = getDueReviews;
window.markLessonComplete = markLessonComplete;
window.markLessonReviewed = markLessonReviewed;
window.getAchievementStatus = getAchievementStatus;
window.getLessonById = getLessonById;
window.speakWord = speakWord;
window.lessonsEngineReady = true;

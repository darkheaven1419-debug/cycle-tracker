/* ================================================================
   lesson-engine.js — 中文学习核心引擎 (Chinese Learning Engine)
   180 lessons (6 phases × 30), achievements, review system, progress
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
        // Apply phase assignments to lessons that lack them
        applyPhaseAssignments();
      }
      // Fire queued callbacks
      if (callback) callback(loadError);
      for (var i = 0; i < _lessonLoadQueue.length; i++) {
        _lessonLoadQueue[i](loadError);
      }
      _lessonLoadQueue = [];
    }
  }

  // Load lessons
  fetch(lessonsUrl)
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' loading lessons');
      return r.json();
    })
    .then(function (data) {
      LESSONS_DATA = data;
      onLoaded(null);
    })
    .catch(function (err) {
      onLoaded(err);
    });

  // Load achievements
  fetch(achievementsUrl)
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' loading achievements');
      return r.json();
    })
    .then(function (data) {
      ACHIEVEMENTS_DATA = data;
      onLoaded(null);
    })
    .catch(function (err) {
      onLoaded(err);
    });
}

function applyPhaseAssignments() {
  // Some lessons may already have a 'phase' field, otherwise assign by index
  for (var i = 0; i < LESSONS_DATA.length; i++) {
    var lesson = LESSONS_DATA[i];
    if (!lesson.phase) {
      lesson.phase = Math.floor(i / LESSONS_PER_PHASE) + 1;
    }
    if (!lesson.day) {
      lesson.day = i + 1;
    }
  }
}

function isDataLoaded() {
  return _lessonsLoaded;
}

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
    if (raw) {
      var parsed = JSON.parse(raw);
      _currentProgress = parsed;
      return parsed;
    }
  } catch (e) {
    // corrupted data — reset
  }
  _currentProgress = getDefaultProgress();
  return _currentProgress;
}

function saveProgress(progress) {
  var p = progress || _currentProgress || getDefaultProgress();
  _currentProgress = p;
  try {
    localStorage.setItem(getProgressKey(), JSON.stringify(p));
  } catch (e) {
    // localStorage full or unavailable
  }
  // Trigger delayed GitHub sync if available
  if (typeof scheduleSync !== 'undefined') {
    scheduleSync();
  }
}

function getDefaultProgress() {
  return {
    version: 1,
    completedLessons: {},
    currentLessonId: null,
    totalPoints: 0,
    totalTimeSpent: 0,
    studyStreak: {
      current: 0,
      longest: 0,
      lastDate: null
    },
    reviews: {},
    achievements: {},
    dailyStats: {},
    perfectScores: 0,
    quizResults: {}
  };
}

function getProgress() {
  if (!_currentProgress) {
    loadProgress();
  }
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

  // Phase 1: all lessons unlocked by default
  if (phase <= 1) return true;

  // Previous phase must be at 80% completion
  var prevPhase = phase - 1;
  var prevProgress = getPhaseProgress(prevPhase);
  var prevPhaseCompleted = prevProgress.percent >= 80;

  if (!prevPhaseCompleted) return false;

  // Same phase: previous lesson must be completed
  var lessonIndex = (lessonId - 1) % LESSONS_PER_PHASE;
  if (lessonIndex > 0) {
    var prevLessonId = lessonId - 1;
    if (!progress.completedLessons[String(prevLessonId)]) {
      return false;
    }
  }

  return true;
}

function getPhaseUnlockRequirement(phase) {
  if (phase <= 1) {
    return _('直接可用', 'Dostupno odmah', 'Available now');
  }
  var prevPhase = phase - 1;
  var needed = Math.ceil(LESSONS_PER_PHASE * 0.8);
  return _(
    '完成阶段' + prevPhase + '至少' + needed + '课',
    'Završite najmanje ' + needed + ' lekcija faze ' + prevPhase,
    'Complete at least ' + needed + ' lessons in phase ' + prevPhase
  );
}

function markLessonComplete(lessonId, score, timeSpentSeconds) {
  var progress = getProgress();
  var id = String(lessonId);
  var newAchievements = [];

  // 1. Update completedLessons
  if (progress.completedLessons[id]) {
    // Already completed — update score if better
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

  // Track perfect scores
  if (score === 100) {
    progress.perfectScores = (progress.perfectScores || 0) + 1;
  }

  // 2. Update totalPoints
  if (score) {
    progress.totalPoints = (progress.totalPoints || 0) + score;
  }

  // 3. Update totalTimeSpent
  if (timeSpentSeconds) {
    progress.totalTimeSpent = (progress.totalTimeSpent || 0) + timeSpentSeconds;
  }

  // 4. Update studyStreak
  updateStreak(progress);

  // 5. Update daily stats
  updateDailyStats(progress, timeSpentSeconds || 0);

  // 6. Set review reminder (1 day later)
  setInitialReview(progress, lessonId);

  // 7. Check and unlock achievements
  newAchievements = checkAchievements(progress);

  // 8. Update currentLessonId
  var nextId = lessonId + 1;
  if (nextId <= TOTAL_LESSONS && isLessonUnlocked(nextId)) {
    progress.currentLessonId = nextId;
  } else {
    progress.currentLessonId = null;
  }

  // 9. Save
  saveProgress(progress);

  return newAchievements;
}

function updateStreak(progress) {
  var today = fmtDateLocal(new Date());
  var lastDate = progress.studyStreak.lastDate;

  if (lastDate === today) {
    // Already recorded today — no change
    return;
  }

  var yesterday = fmtDateLocal(addDaysLocal(new Date(), -1));

  if (lastDate === yesterday) {
    // Consecutive day
    progress.studyStreak.current++;
  } else if (lastDate === null) {
    // First ever study
    progress.studyStreak.current = 1;
  } else {
    // Streak broken
    progress.studyStreak.current = 1;
  }

  // Update longest
  if (progress.studyStreak.current > progress.studyStreak.longest) {
    progress.studyStreak.longest = progress.studyStreak.current;
  }

  progress.studyStreak.lastDate = today;
}

function updateDailyStats(progress, timeSpent) {
  var today = fmtDateLocal(new Date());
  if (!progress.dailyStats) progress.dailyStats = {};

  if (!progress.dailyStats[today]) {
    progress.dailyStats[today] = {
      lessonsCompleted: 0,
      timeSpent: 0,
      pointsEarned: 0
    };
  }

  progress.dailyStats[today].lessonsCompleted++;
  progress.dailyStats[today].timeSpent += timeSpent;
}

function getTotalProgress() {
  var progress = getProgress();
  var completed = Object.keys(progress.completedLessons).length;
  var percent = Math.round((completed / TOTAL_LESSONS) * 100);

  return {
    completedLessons: completed,
    totalLessons: TOTAL_LESSONS,
    percent: percent,
    totalPoints: progress.totalPoints || 0,
    streak: progress.studyStreak.current || 0,
    longestStreak: progress.studyStreak.longest || 0
  };
}

function getPhaseProgress(phase) {
  var progress = getProgress();
  var total = LESSONS_PER_PHASE;
  var completed = 0;

  var startId = (phase - 1) * LESSONS_PER_PHASE + 1;
  var endId = phase * LESSONS_PER_PHASE;

  for (var id = startId; id <= endId; id++) {
    if (progress.completedLessons[String(id)]) {
      completed++;
    }
  }

  var percent = Math.round((completed / total) * 100);
  var unlocked = isPhaseUnlocked(phase);

  return {
    completed: completed,
    total: total,
    percent: percent,
    unlocked: unlocked
  };
}

function isPhaseUnlocked(phase) {
  if (phase <= 1) return true;
  var prevProgress = getPhaseProgress(phase - 1);
  return prevProgress.percent >= 80;
}

/* ================================================================
   4. REVIEW SYSTEM (Ebbinghaus Forgetting Curve)
   ================================================================ */

function setInitialReview(progress, lessonId) {
  if (!progress.reviews) progress.reviews = {};

  var id = String(lessonId);
  var now = new Date();
  var firstReview = addDaysLocal(now, REVIEW_INTERVALS[0]);

  if (!progress.reviews[id]) {
    progress.reviews[id] = {
      history: [],
      nextDue: fmtDateLocal(firstReview),
      intervalIndex: 0
    };
  }
}

function getDueReviews() {
  var progress = getProgress();
  if (!progress.reviews) return [];

  var today = fmtDateLocal(new Date());
  var reviews = [];
  var reviewKeys = Object.keys(progress.reviews);

  for (var i = 0; i < reviewKeys.length; i++) {
    var id = reviewKeys[i];
    var review = progress.reviews[id];
    if (!review.nextDue) continue;

    var lesson = getLessonById(parseInt(id, 10));
    if (!lesson) continue;

    var dueDate = review.nextDue;
    var daysUntilDue = dateDiffDays(dueDate, today);

    var urgency = 'ok';
    if (daysUntilDue < 0) {
      urgency = 'urgent'; // overdue
    } else if (daysUntilDue === 0) {
      urgency = 'urgent'; // due today
    } else if (daysUntilDue <= 3) {
      urgency = 'soon';
    }

    reviews.push({
      lessonId: parseInt(id, 10),
      topic: lesson.topic || '',
      icon: lesson.icon || '📖',
      lastReview: getLastReviewDate(review),
      nextDue: dueDate,
      daysUntilDue: daysUntilDue,
      urgency: urgency
    });
  }

  // Sort: urgent first, then soon, then ok
  reviews.sort(function (a, b) {
    var order = { urgent: 0, soon: 1, ok: 2 };
    var aOrder = order[a.urgency] || 3;
    var bOrder = order[b.urgency] || 3;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.daysUntilDue - b.daysUntilDue;
  });

  return reviews;
}

function getLastReviewDate(review) {
  if (review.history && review.history.length > 0) {
    return review.history[review.history.length - 1];
  }
  return null;
}

function markLessonReviewed(lessonId) {
  var progress = getProgress();
  var id = String(lessonId);
  var today = fmtDateLocal(new Date());

  if (!progress.reviews) progress.reviews = {};
  if (!progress.reviews[id]) {
    progress.reviews[id] = {
      history: [],
      nextDue: today,
      intervalIndex: 0
    };
  }

  var review = progress.reviews[id];
  if (!review.history) review.history = [];

  // Record this review
  review.history.push(today);

  // Advance to next interval
  var nextIdx = Math.min(
    (review.intervalIndex || 0) + 1,
    REVIEW_INTERVALS.length - 1
  );
  review.intervalIndex = nextIdx;

  // Calculate next due date
  var nextInterval = REVIEW_INTERVALS[nextIdx];
  var nextDate = addDaysLocal(new Date(), nextInterval);
  review.nextDue = fmtDateLocal(nextDate);

  saveProgress(progress);
}

function dateDiffDays(dateStr1, dateStr2) {
  var d1 = parseDateLocal(dateStr1);
  var d2 = parseDateLocal(dateStr2);
  return Math.round((d1 - d2) / 86400000);
}

/* ================================================================
   5. ACHIEVEMENT SYSTEM
   ================================================================ */

function checkAchievements(progress) {
  var newlyUnlocked = [];

  for (var i = 0; i < ACHIEVEMENTS_DATA.length; i++) {
    var ach = ACHIEVEMENTS_DATA[i];
    if (progress.achievements[ach.id]) continue; // already unlocked

    var met = isAchievementConditionMet(ach, progress);
    if (met) {
      var unlocked = unlockAchievement(progress, ach.id);
      newlyUnlocked.push(unlocked);
    }
  }

  return newlyUnlocked;
}

function isAchievementConditionMet(ach, progress) {
  var cond = ach.condition;
  if (!cond) return false;

  switch (cond.type) {
    case 'lessonsCompleted':
      return getCompletedCount(progress) >= cond.value;
    case 'phaseComplete':
      var pp = getPhaseProgress(cond.phaseId);
      return pp.completed >= pp.total;
    case 'streak':
      return (progress.studyStreak.current || 0) >= cond.value;
    case 'totalPoints':
      return (progress.totalPoints || 0) >= cond.value;
    case 'perfectScore':
      return (progress.perfectScores || 0) >= cond.value;
    case 'timeSpent':
      return (progress.totalTimeSpent || 0) >= cond.value;
    case 'allLessons':
      return getCompletedCount(progress) >= TOTAL_LESSONS;
    default:
      return false;
  }
}

function getCompletedCount(progress) {
  return Object.keys(progress.completedLessons || {}).length;
}

function unlockAchievement(progress, achievementId) {
  if (!progress.achievements) progress.achievements = {};
  progress.achievements[achievementId] = {
    unlockedAt: new Date().toISOString()
  };

  // Find the achievement data
  var ach = null;
  for (var i = 0; i < ACHIEVEMENTS_DATA.length; i++) {
    if (ACHIEVEMENTS_DATA[i].id === achievementId) {
      ach = ACHIEVEMENTS_DATA[i];
      break;
    }
  }

  // Award points
  if (ach && ach.points) {
    progress.totalPoints = (progress.totalPoints || 0) + ach.points;
  }

  return ach || { id: achievementId };
}

function getAchievementStatus() {
  var progress = getProgress();
  var unlocked = 0;
  var total = ACHIEVEMENTS_DATA.length;
  var list = [];

  for (var i = 0; i < ACHIEVEMENTS_DATA.length; i++) {
    var ach = ACHIEVEMENTS_DATA[i];
    var isUnlocked = !!(progress.achievements && progress.achievements[ach.id]);
    if (isUnlocked) unlocked++;

    list.push({
      id: ach.id,
      icon: ach.icon,
      name: ach.name,
      description: ach.description,
      points: ach.points,
      isUnlocked: isUnlocked,
      unlockedAt: isUnlocked ? progress.achievements[ach.id].unlockedAt : null
    });
  }

  return {
    unlocked: unlocked,
    total: total,
    percent: total > 0 ? Math.round((unlocked / total) * 100) : 0,
    list: list
  };
}

/* ================================================================
   6. RENDERING
   ================================================================ */

function initChineseTab() {
  // Ensure tab label is updated
  var tabLabel = document.getElementById('tb-culture');
  if (tabLabel) {
    tabLabel.textContent = _('中文学习', 'Kineski', 'Chinese');
  }

  loadLessonData(function (err) {
    if (err) {
      var panel = document.getElementById('panel-culture');
      if (panel) {
        panel.innerHTML =
          '<div class="empty-state"><span class="empty-icon">⚠️</span>' +
          '<span class="empty-text">' +
          _('无法加载课程数据', 'Greška pri učitavanju lekcija', 'Failed to load lessons') +
          '</span></div>';
      }
      return;
    }
    renderChineseHome();
  });
}

function renderChineseHome() {
  var panel = getChinesePanel();
  if (!panel) return;

  var progress = getProgress();
  var total = getTotalProgress();
  var todayReviews = getDueReviews();
  var achievements = getAchievementStatus();

  // Build the home page HTML
  var html = '';
  html += '<div class="chinese-section">';

  // Stats bar
  html += renderStatsBar(total);

  // Continue learning card
  html += renderContinueCard(progress);

  // Phase path
  html += renderPhasePath();

  // Review reminders
  html += renderReviewReminders(todayReviews);

  // Recent achievements
  html += renderRecentAchievements(achievements);

  html += '</div>';

  panel.innerHTML = html;
}

function getChinesePanel() {
  var panel = document.getElementById('panel-chinese');
  if (!panel) {
    // Fallback: render inside culture panel as a sub-section
    panel = document.getElementById('panel-culture');
  }
  return panel;
}

function renderStatsBar(total) {
  var html = '<div class="chinese-stats-bar">';

  // Streak
  html += '<div class="chinese-stat-item">';
  html += '<span class="chinese-stat-icon">🔥</span>';
  html += '<span class="chinese-stat-value">' + total.streak + '</span>';
  html += '<span class="chinese-stat-label">' + _('连续天数', 'Dana', 'Day streak') + '</span>';
  html += '</div>';

  // Progress
  html += '<div class="chinese-stat-item">';
  html += '<span class="chinese-stat-icon">📊</span>';
  html += '<span class="chinese-stat-value">' + total.percent + '%</span>';
  html += '<span class="chinese-stat-label">' + _('总进度', 'Napredak', 'Progress') + '</span>';
  html += '</div>';

  // Lessons
  html += '<div class="chinese-stat-item">';
  html += '<span class="chinese-stat-icon">📚</span>';
  html += '<span class="chinese-stat-value">' + total.completedLessons + '/' + total.totalLessons + '</span>';
  html += '<span class="chinese-stat-label">' + _('已完成', 'Lekcije', 'Lessons') + '</span>';
  html += '</div>';

  // Points
  html += '<div class="chinese-stat-item">';
  html += '<span class="chinese-stat-icon">⭐</span>';
  html += '<span class="chinese-stat-value">' + (total.totalPoints || 0) + '</span>';
  html += '<span class="chinese-stat-label">' + _('积分', 'Poeni', 'Points') + '</span>';
  html += '</div>';

  html += '</div>';
  return html;
}

function renderContinueCard(progress) {
  var currentId = progress.currentLessonId;
  var html = '';

  if (currentId) {
    var lesson = getLessonById(currentId);
    if (lesson) {
      html += '<div class="card chinese-continue-card" onclick="renderLessonView(' + currentId + ')">';
      html += '<div class="chinese-continue-header">';
      html += '<span>' + _('继续学习', 'Nastavi učenje', 'Continue Learning') + '</span>';
      html += '<span class="chinese-continue-arrow">▸</span>';
      html += '</div>';
      html += '<div class="chinese-continue-body">';
      html += '<span class="chinese-continue-icon">' + (lesson.icon || '📖') + '</span>';
      html += '<div class="chinese-continue-info">';
      html += '<div class="chinese-continue-topic">' + _(
        '第' + currentId + '课: ' + (lesson.topic || ''),
        'Lekcija ' + currentId + ': ' + (lesson.topic || ''),
        'Lesson ' + currentId + ': ' + (lesson.topic || '')
      ) + '</div>';
      html += '<div class="chinese-continue-sub">' + (lesson.tip || '') + '</div>';
      html += '</div></div></div>';
    }
  } else {
    // Suggest first incomplete lesson
    var firstIncomplete = getFirstIncompleteLesson();
    if (firstIncomplete) {
      html += '<div class="card chinese-continue-card" onclick="renderLessonView(' + firstIncomplete + ')">';
      html += '<div class="chinese-continue-header">';
      html += '<span>' + _('开始学习', 'Započni učenje', 'Start Learning') + '</span>';
      html += '<span class="chinese-continue-arrow">▸</span>';
      html += '</div>';
      html += '<div class="chinese-continue-body">';
      html += '<span class="chinese-continue-icon">🚀</span>';
      html += '<div class="chinese-continue-info">';
      html += '<div class="chinese-continue-topic">' + _(
        '从第' + firstIncomplete + '课开始',
        'Počni od lekcije ' + firstIncomplete,
        'Start from lesson ' + firstIncomplete
      ) + '</div>';
      html += '</div></div></div>';
    }
  }

  return html;
}

function getFirstIncompleteLesson() {
  var progress = getProgress();
  for (var i = 1; i <= TOTAL_LESSONS; i++) {
    if (!progress.completedLessons[String(i)] && isLessonUnlocked(i)) {
      return i;
    }
  }
  return null;
}

function renderPhasePath() {
  var html = '<div class="chinese-phase-path">';
  html += '<h3 class="chinese-section-title">' + _('学习路径', 'Put učenja', 'Learning Path') + '</h3>';

  for (var p = 0; p < PHASE_NAMES.length; p++) {
    var phase = PHASE_NAMES[p];
    var phaseProgress = getPhaseProgress(phase.id);
    var isUnlocked = phaseProgress.unlocked;
    var isComplete = phaseProgress.completed >= phaseProgress.total;
    var statusClass = isComplete ? 'phase-complete' : (isUnlocked ? 'phase-unlocked' : 'phase-locked');

    html += '<div class="phase-card ' + statusClass + '" onclick="renderPhaseLessons(' + phase.id + ')">';
    html += '<div class="phase-card-left">';
    html += '<span class="phase-icon">' + (isComplete ? '✅' : (isUnlocked ? phase.icon : '🔒')) + '</span>';
    html += '<div class="phase-info">';
    html += '<div class="phase-name">' + getPhaseName(phase.id) + '</div>';
    html += '<div class="phase-progress-text">' + phaseProgress.completed + '/' + phaseProgress.total + '</div>';
    html += '</div></div>';
    html += '<div class="phase-bar-container">';
    html += '<div class="phase-bar"><div class="phase-bar-fill" style="width:' + phaseProgress.percent + '%"></div></div>';
    html += '</div></div>';
  }

  html += '</div>';
  return html;
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

function renderReviewReminders(dueReviews) {
  var urgent = [];
  var soon = [];
  var ok = [];

  for (var i = 0; i < dueReviews.length; i++) {
    if (dueReviews[i].urgency === 'urgent') urgent.push(dueReviews[i]);
    else if (dueReviews[i].urgency === 'soon') soon.push(dueReviews[i]);
    else ok.push(dueReviews[i]);
  }

  if (urgent.length === 0 && soon.length === 0) {
    return ''; // No reviews needed
  }

  var html = '<div class="chinese-review-section">';
  html += '<h3 class="chinese-section-title">' + _('复习提醒', 'Ponavljanje', 'Review Reminders') + '</h3>';

  if (urgent.length > 0) {
    html += '<div class="chinese-review-group">';
    html += '<div class="chinese-review-group-label">🔴 ' + _('待复习', 'Hitno', 'Due Now') + '</div>';
    for (var u = 0; u < Math.min(urgent.length, 5); u++) {
      html += renderReviewItem(urgent[u]);
    }
    html += '</div>';
  }

  if (soon.length > 0) {
    html += '<div class="chinese-review-group">';
    html += '<div class="chinese-review-group-label">🟡 ' + _('即将到期', 'Uskoro', 'Coming Soon') + '</div>';
    for (var s = 0; s < Math.min(soon.length, 3); s++) {
      html += renderReviewItem(soon[s]);
    }
    html += '</div>';
  }

  html += '</div>';
  return html;
}

function renderReviewItem(review) {
  return '<div class="chinese-review-item" onclick="renderLessonView(' + review.lessonId + ')">' +
    '<span class="chinese-review-icon">' + review.icon + '</span>' +
    '<span class="chinese-review-topic">' + review.topic + '</span>' +
    '<span class="chinese-review-badge">' +
    (review.daysUntilDue < 0 ? _('超期' + Math.abs(review.daysUntilDue) + '天', 'Zakašnjenje ' + Math.abs(review.daysUntilDue) + 'd', Math.abs(review.daysUntilDue) + 'd overdue') :
      review.daysUntilDue === 0 ? _('今天', 'Danas', 'Today') :
      _('还有' + review.daysUntilDue + '天', review.daysUntilDue + 'd', review.daysUntilDue + 'd')) +
    '</span></div>';
}

function renderRecentAchievements(achievementStatus) {
  // Show only the 3 most recent unlocked achievements
  var unlocked = [];
  for (var i = 0; i < achievementStatus.list.length; i++) {
    if (achievementStatus.list[i].isUnlocked) {
      unlocked.push(achievementStatus.list[i]);
    }
  }

  if (unlocked.length === 0) return '';

  // Sort by unlock time, most recent first
  unlocked.sort(function (a, b) {
    return (b.unlockedAt || '').localeCompare(a.unlockedAt || '');
  });

  var recent = unlocked.slice(0, 3);

  var html = '<div class="chinese-achievements-mini">';
  html += '<h3 class="chinese-section-title">' + _('近期成就', 'Nedavna dostignuća', 'Recent Achievements') + '</h3>';
  html += '<div class="chinese-achievement-mini-list">';

  for (var r = 0; r < recent.length; r++) {
    html += '<div class="chinese-achievement-mini-item">';
    html += '<span class="chinese-ach-mini-icon">' + recent[r].icon + '</span>';
    html += '<span class="chinese-ach-mini-name">' + langName(recent[r].name) + '</span>';
    html += '</div>';
  }

  html += '</div></div>';
  return html;
}

/* ---- Phase Lessons List ---- */

function renderPhaseLessons(phaseId) {
  var panel = getChinesePanel();
  if (!panel) return;

  if (!isPhaseUnlocked(phaseId)) {
    panel.innerHTML =
      '<div class="chinese-section">' +
      '<button class="btn btn-ghost" onclick="renderChineseHome()">◂ ' + _('返回', 'Nazad', 'Back') + '</button>' +
      '<div class="empty-state"><span class="empty-icon">🔒</span>' +
      '<span class="empty-text">' + getPhaseUnlockRequirement(phaseId) + '</span></div></div>';
    return;
  }

  var startId = (phaseId - 1) * LESSONS_PER_PHASE + 1;
  var endId = phaseId * LESSONS_PER_PHASE;
  var progress = getProgress();

  var html = '<div class="chinese-section">';
  html += '<button class="btn btn-ghost" onclick="renderChineseHome()">◂ ' + _('返回', 'Nazad', 'Back') + '</button>';
  html += '<h3 class="chinese-section-title">' + getPhaseName(phaseId) + '</h3>';

  html += '<div class="chinese-lesson-list">';

  for (var id = startId; id <= endId; id++) {
    var lesson = getLessonById(id);
    if (!lesson) continue;

    var isComplete = !!progress.completedLessons[String(id)];
    var isUnlocked = isLessonUnlocked(id);
    var score = progress.completedLessons[String(id)] ? progress.completedLessons[String(id)].score : null;

    var statusIcon = isComplete ? '✅' : (isUnlocked ? lesson.icon || '📖' : '🔒');
    var statusClass = isComplete ? 'lesson-done' : (isUnlocked ? 'lesson-available' : 'lesson-locked');
    var clickHandler = isUnlocked ? 'renderLessonView(' + id + ')' : '';

    html += '<div class="chinese-lesson-item ' + statusClass + '" onclick="' + clickHandler + '">';
    html += '<span class="chinese-lesson-icon">' + statusIcon + '</span>';
    html += '<div class="chinese-lesson-info">';
    html += '<div class="chinese-lesson-num">' + _('第' + id + '课', 'Lekcija ' + id, 'Lesson ' + id) + '</div>';
    html += '<div class="chinese-lesson-topic">' + (lesson.topic || '') + '</div>';
    html += '</div>';
    if (score !== null) {
      html += '<span class="chinese-lesson-score">' + score + '%</span>';
    }
    html += '</div>';
  }

  html += '</div></div>';
  panel.innerHTML = html;
}

/* ---- Lesson Detail View ---- */

var _currentLessonViewId = null;
var _currentLessonTab = 'vocab'; // vocab | grammar | practice | quiz

function renderLessonView(lessonId) {
  var panel = getChinesePanel();
  if (!panel) return;

  var lesson = getLessonById(lessonId);
  if (!lesson) {
    panel.innerHTML = '<div class="empty-state"><span class="empty-icon">❓</span>' +
      '<span class="empty-text">' + _('未找到课程', 'Lekcija nije pronađena', 'Lesson not found') + '</span></div>';
    return;
  }

  _currentLessonViewId = lessonId;
  _currentLessonTab = 'vocab';

  _quizAnswers = {}; // Reset quiz answers for fresh quiz

  var progress = getProgress();
  var isComplete = !!progress.completedLessons[String(lessonId)];
  var score = progress.completedLessons[String(lessonId)] ? progress.completedLessons[String(lessonId)].score : null;

  var html = '<div class="chinese-section chinese-lesson-view">';
  html += '<button class="btn btn-ghost" onclick="renderPhaseLessons(' + getLessonPhase(lessonId) + ')">◂ ' +
    _('返回列表', 'Nazad na listu', 'Back to list') + '</button>';

  // Lesson header
  html += '<div class="chinese-lesson-header">';
  html += '<span class="chinese-lesson-view-icon">' + (lesson.icon || '📖') + '</span>';
  html += '<div class="chinese-lesson-view-title">';
  html += '<h3>' + _('第' + lessonId + '课', 'Lekcija ' + lessonId, 'Lesson ' + lessonId) + '</h3>';
  html += '<div class="chinese-lesson-view-topic">' + (lesson.topic || '') + '</div>';
  html += '</div>';
  if (isComplete && score !== null) {
    html += '<span class="chinese-lesson-score-badge">' + _('得分', 'Rezultat', 'Score') + ': ' + score + '%</span>';
  }
  html += '</div>';

  // Cultural tip
  if (lesson.tip) {
    html += '<div class="chinese-tip-card">💡 ' + lesson.tip + '</div>';
  }

  // Tabs
  html += '<div class="chinese-tab-bar">';
  var tabs = [
    { key: 'vocab', label_zh: '生词', label_sr: 'Reči', label_en: 'Words', icon: '📝' },
    { key: 'grammar', label_zh: '语法', label_sr: 'Gramatika', label_en: 'Grammar', icon: '📏' },
    { key: 'practice', label_zh: '练习', label_sr: 'Vežba', label_en: 'Practice', icon: '✏️' },
    { key: 'quiz', label_zh: '测验', label_sr: 'Test', label_en: 'Quiz', icon: '🎯' }
  ];
  for (var t = 0; t < tabs.length; t++) {
    var tab = tabs[t];
    var isActive = _currentLessonTab === tab.key;
    html += '<button class="chinese-tab-btn' + (isActive ? ' active' : '') + '" onclick="switchLessonTab(\'' + tab.key + '\',' + lessonId + ')">' +
      tab.icon + ' ' + _(tab.label_zh, tab.label_sr, tab.label_en) + '</button>';
  }
  html += '</div>';

  // Tab content
  html += '<div class="chinese-tab-content">';
  html += renderLessonTabContent(_currentLessonTab, lesson, lessonId);
  html += '</div>';

  // Complete button (only show if quiz was passed)
  html += '<div class="chinese-lesson-actions">';
  if (isComplete) {
    html += '<span class="chinese-lesson-complete-badge">✅ ' + _('已完成', 'Završeno', 'Completed') + '</span>';
  }
  html += '</div>';

  html += '</div>';
  panel.innerHTML = html;
}

function switchLessonTab(tab, lessonId) {
  _currentLessonTab = tab;
  renderLessonView(lessonId);
}

function renderLessonTabContent(tab, lesson, lessonId) {
  switch (tab) {
    case 'vocab':
      return renderVocabTab(lesson);
    case 'grammar':
      return renderGrammarTab(lesson);
    case 'practice':
      return renderPracticeTab(lesson, lessonId);
    case 'quiz':
      return renderQuizTab(lesson, lessonId);
    default:
      return '';
  }
}

function renderVocabTab(lesson) {
  if (!lesson.words || lesson.words.length === 0) {
    return '<div class="empty-state">' + _('暂无生词', 'Nema reči', 'No words') + '</div>';
  }

  var html = '<div class="chinese-vocab-list">';
  for (var i = 0; i < lesson.words.length; i++) {
    var w = lesson.words[i];
    html += '<div class="chinese-vocab-card">';
    html += '<div class="chinese-vocab-zh">' + (w.zh || '') + '</div>';
    html += '<div class="chinese-vocab-py">' + (w.py || '') + '</div>';
    html += '<div class="chinese-vocab-sr">' + (w.sr || '') + '</div>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function renderGrammarTab(lesson) {
  // Grammar is defined per phase, not per lesson — show general phase grammar
  var phaseId = getLessonPhase(lesson.day || 1);
  var grammar = getPhaseGrammar(phaseId);
  var html = '<div class="chinese-grammar-content">';
  html += '<p class="chinese-grammar-intro">' + grammar.explanation + '</p>';
  if (grammar.examples && grammar.examples.length) {
    html += '<div class="chinese-grammar-examples">';
    for (var i = 0; i < grammar.examples.length; i++) {
      var ex = grammar.examples[i];
      html += '<div class="chinese-grammar-example">';
      html += '<div class="chinese-grammar-ex-zh">' + ex.zh + '</div>';
      html += '<div class="chinese-grammar-ex-py">' + ex.py + '</div>';
      html += '<div class="chinese-grammar-ex-sr">' + ex.sr + '</div>';
      html += '</div>';
    }
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function renderPracticeTab(lesson, lessonId) {
  if (!lesson.words || lesson.words.length === 0) {
    return '<div class="empty-state">' + _('暂无练习', 'Nema vežbe', 'No practice') + '</div>';
  }

  var html = '<div class="chinese-practice-section">';
  html += '<p class="chinese-practice-instruct">' + _('选择正确的翻译', 'Izaberite tačan prevod', 'Choose the correct translation') + '</p>';

  // Generate multiple choice from first 3 words
  var practiceWords = lesson.words.slice(0, Math.min(3, lesson.words.length));
  for (var i = 0; i < practiceWords.length; i++) {
    var w = practiceWords[i];
    var options = generatePracticeOptions(w, lesson.words);
    html += '<div class="chinese-practice-question" data-word-zh="' + escapeHtml(w.zh || '') + '" data-answer="' + escapeHtml(w.sr || '') + '">';
    html += '<div class="chinese-practice-q">' + (w.zh || '') + ' = ?</div>';
    for (var o = 0; o < options.length; o++) {
      html += '<button class="chinese-practice-option" onclick="checkPracticeAnswer(this, \'' + escapeHtml(options[o]) + '\', \'' + escapeHtml(w.sr || '') + '\', this.parentElement)">' + options[o] + '</button>';
    }
    html += '</div>';
  }

  html += '<div class="chinese-practice-result"></div>';
  html += '</div>';
  return html;
}

function renderQuizTab(lesson, lessonId) {
  if (!lesson.words || lesson.words.length === 0) {
    return '<div class="empty-state">' + _('暂无测验', 'Nema testa', 'No quiz') + '</div>';
  }

  var html = '<div class="chinese-quiz-section" data-lesson-id="' + lessonId + '">';
  html += '<p class="chinese-quiz-instruct">' + _('小测验 — 每题10分', 'Kviz — svako pitanje 10 poena', 'Quiz — 10 points each') + '</p>';

  var questions = generateQuizQuestions(lesson.words);
  for (var i = 0; i < questions.length; i++) {
    var q = questions[i];
    html += '<div class="chinese-quiz-question" data-answer="' + escapeHtml(q.answer) + '" data-index="' + i + '">';
    html += '<div class="chinese-quiz-q">' + (i + 1) + '. ' + q.question + '</div>';
    html += '<div class="chinese-quiz-options">';
    for (var o = 0; o < q.options.length; o++) {
      html += '<button class="chinese-quiz-option" onclick="selectQuizOption(this, \'' + escapeHtml(q.options[o]) + '\', \'' + escapeHtml(q.answer) + '\')">' +
        String.fromCharCode(65 + o) + '. ' + q.options[o] + '</button>';
    }
    html += '</div></div>';
  }

  html += '<button class="btn btn-primary chinese-quiz-submit" onclick="submitQuiz(' + lessonId + ')" style="width:100%;margin-top:12px">' +
    _('提交答案', 'Predaj odgovore', 'Submit Answers') + '</button>';
  html += '<div class="chinese-quiz-result"></div>';
  html += '</div>';
  return html;
}

/* ---- Helper: Practice & Quiz ---- */

function generatePracticeOptions(correctWord, allWords) {
  var correct = correctWord.sr || '';
  var options = [correct];

  // Collect all other translations
  var pool = [];
  for (var i = 0; i < allWords.length; i++) {
    if (allWords[i].sr !== correct && allWords[i].sr) {
      pool.push(allWords[i].sr);
    }
  }

  // Shuffle and pick 3 distractors
  shuffleArray(pool);
  for (var j = 0; j < Math.min(3, pool.length); j++) {
    if (options.indexOf(pool[j]) < 0) {
      options.push(pool[j]);
    }
  }

  // Fill remaining slots with generic options
  var fillers = ['Zdravo', 'Hvala', 'Doviđenja', 'Dobro', 'Molim'];
  while (options.length < 4) {
    var filler = fillers[Math.floor(Math.random() * fillers.length)];
    if (options.indexOf(filler) < 0) {
      options.push(filler);
    }
  }

  shuffleArray(options);
  return options;
}

function generateQuizQuestions(words) {
  var questions = [];
  var used = {};

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
    if (val && val !== correct) {
      pool.push(val);
    }
  }

  shuffleArray(pool);
  for (var j = 0; j < Math.min(3, pool.length); j++) {
    if (options.indexOf(pool[j]) < 0) {
      options.push(pool[j]);
    }
  }

  shuffleArray(options);
  return options;
}

function getPhaseGrammar(phaseId) {
  var grammarMap = {
    1: {
      explanation: _(
        '汉语拼音 (Hànyǔ Pīnyīn) 是学习中文发音的基础。每个汉字对应一个音节，由声母(initial)和韵母(final)组成。四个声调改变意思：mā(妈)、má(麻)、mǎ(马)、mà(骂)。',
        'Pinyin je osnova za učenje kineskog izgovora. Svaki slog se sastoji od inicijala (suglasnik) i finala (samoglasnik). Četiri tona menjaju značenje: mā (mama), má (konoplja), mǎ (konj), mà (psovati).',
        'Pinyin is the foundation of Chinese pronunciation. Each syllable has an initial (consonant) and final (vowel). Four tones change meaning: mā (mother), má (hemp), mǎ (horse), mà (curse).'
      ),
      examples: [
        { zh: 'nǐ hǎo', py: 'nǐ hǎo', sr: 'Zdravo (doslovno: ti + dobro)' },
        { zh: 'xiè xie', py: 'xiè xie', sr: 'Hvala' }
      ]
    },
    2: {
      explanation: _(
        '中文的基本语序是：主语 + 时间 + 地点 + 动词 + 宾语。疑问词"吗"(ma)放在句尾将陈述变为是非问句。',
        'Osnovni red reči u kineskom: Subjekat + Vreme + Mesto + Glagol + Objekat. Rečca 吗 (ma) na kraju rečenice pretvara izjavu u pitanje.',
        'Basic word order in Chinese: Subject + Time + Place + Verb + Object. The particle 吗 (ma) at the end turns a statement into a yes/no question.'
      ),
      examples: [
        { zh: '你去中国吗？', py: 'nǐ qù zhōng guó ma', sr: 'Ideš li u Kinu?' },
        { zh: '我今天去学校。', py: 'wǒ jīn tiān qù xué xiào', sr: 'Ja danas idem u školu.' }
      ]
    },
    3: {
      explanation: _(
        '社交中常用"请"(qǐng)表示礼貌。量词非常重要：一个人、一本书、一杯茶。否定用"不"(bù)或"没"(méi)。',
        'U društvenim situacijama koristi se 请 (qǐng) za učtivost. Merno reči (量词) su važne: 一个人 (jedna osoba), 一本书 (jedna knjiga). Negacija sa 不 (bù) ili 没 (méi).',
        'Use 请 (qǐng) for politeness in social settings. Measure words (量词) are important: 一个人 (one person), 一本书 (one book). Negate with 不 (bù) or 没 (méi).'
      ),
      examples: [
        { zh: '请坐。', py: 'qǐng zuò', sr: 'Sedite, molim.' },
        { zh: '我没有钱。', py: 'wǒ méi yǒu qián', sr: 'Nemam novac.' }
      ]
    },
    4: {
      explanation: _(
        '表达情感时常用"很"(hěn)表示程度。感叹句用"太...了"(tài...le)结构。"想"(xiǎng)表示想念或想要。',
        'Za izražavanje emocija koristi se 很 (hěn) za stepen. Uzvične rečenice koriste 太...了 (tài...le). 想 (xiǎng) znači nedostajati ili želeti.',
        'Use 很 (hěn) for expressing degree. Exclamatory sentences use 太...了 (tài...le). 想 (xiǎng) means to miss or to want.'
      ),
      examples: [
        { zh: '我很想你。', py: 'wǒ hěn xiǎng nǐ', sr: 'Mnogo mi nedostaješ.' },
        { zh: '太好了！', py: 'tài hǎo le', sr: 'Odlično!' }
      ]
    },
    5: {
      explanation: _(
        '中文的"了"(le)表示动作完成或状态变化。"着"(zhe)表示持续状态。"过"(guo)表示过去的经历。',
        'Rečca 了 (le) označava završetak radnje ili promenu stanja. 着 (zhe) označava kontinuirano stanje. 过 (guo) označava prošlo iskustvo.',
        'The particle 了 (le) marks completed action or change of state. 着 (zhe) marks continuous state. 过 (guo) marks past experience.'
      ),
      examples: [
        { zh: '我吃了。', py: 'wǒ chī le', sr: 'Pojeo/la sam.' },
        { zh: '我去过中国。', py: 'wǒ qù guo zhōng guó', sr: 'Bio/la sam u Kini.' }
      ]
    },
    6: {
      explanation: _(
        '复合句使用"因为...所以..."(yīn wèi...suǒ yǐ...) 表因果，"虽然...但是..."(suī rán...dàn shì...) 表转折。"把"(bǎ)结构是中文特有的。',
        'Složene rečenice koriste 因为...所以... (jer...zato...) za uzrok-posledicu, 虽然...但是... (iako...ali...) za kontrast. 把 (bǎ) konstrukcija je jedinstvena za kineski.',
        'Complex sentences use 因为...所以... (because...therefore...) for cause-effect, 虽然...但是... (although...but...) for contrast. The 把 (bǎ) construction is unique to Chinese.'
      ),
      examples: [
        { zh: '因为下雨，所以我不去。', py: 'yīn wèi xià yǔ, suǒ yǐ wǒ bú qù', sr: 'Zato što pada kiša, ne idem.' },
        { zh: '虽然累，但是开心。', py: 'suī rán lèi, dàn shì kāi xīn', sr: 'Iako sam umoran/na, srećan/na sam.' }
      ]
    }
  };

  return grammarMap[phaseId] || grammarMap[1];
}

/* ================================================================
   7. INTERACTION HANDLERS
   ================================================================ */

function checkPracticeAnswer(btn, selectedAnswer, correctAnswer, questionEl) {
  var allOptions = questionEl.querySelectorAll('.chinese-practice-option');
  for (var i = 0; i < allOptions.length; i++) {
    allOptions[i].disabled = true;
    allOptions[i].style.cursor = 'default';
    if (allOptions[i].textContent === correctAnswer) {
      allOptions[i].className = 'chinese-practice-option correct';
    }
  }

  if (selectedAnswer === correctAnswer) {
    btn.className = 'chinese-practice-option correct';
  } else {
    btn.className = 'chinese-practice-option wrong';
  }

  // Update result area
  var resultArea = questionEl.closest('.chinese-practice-section').querySelector('.chinese-practice-result');
  if (resultArea) {
    var allCorrect = true;
    var allQuestions = resultArea.closest('.chinese-practice-section').querySelectorAll('.chinese-practice-question');
    for (var q = 0; q < allQuestions.length; q++) {
      var selected = allQuestions[q].querySelector('.chinese-practice-option.correct, .chinese-practice-option.wrong');
      if (!selected || selected.classList.contains('wrong')) {
        allCorrect = false;
        break;
      }
    }
    if (allCorrect) {
      resultArea.innerHTML = '<div class="chinese-result-success">✅ ' +
        _('全部正确！', 'Sve tačno!', 'All correct!') + '</div>';
    }
  }
}

var _quizAnswers = {};

function selectQuizOption(btn, selectedAnswer, correctAnswer) {
  var questionEl = btn.closest('.chinese-quiz-question');
  var index = questionEl.getAttribute('data-index');
  var allOptions = questionEl.querySelectorAll('.chinese-quiz-option');

  for (var i = 0; i < allOptions.length; i++) {
    allOptions[i].classList.remove('selected');
  }
  btn.classList.add('selected');

  var isCorrect = selectedAnswer === correctAnswer;
  _quizAnswers[index] = isCorrect;
}

function submitQuiz(lessonId) {
  var totalQuestions = 0;
  var correctCount = 0;

  var quizSection = document.querySelector('.chinese-quiz-section[data-lesson-id="' + lessonId + '"]');
  if (!quizSection) return;

  var questions = quizSection.querySelectorAll('.chinese-quiz-question');
  totalQuestions = questions.length;

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
      if (allOpts[o].textContent.indexOf(answer) >= 0) {
        allOpts[o].classList.add('correct');
      }
    }

    if (selected) {
      var selectedText = selected.textContent.substring(2).trim(); // Remove "A. " prefix
      if (selectedText === answer) {
        correctCount++;
      } else {
        selected.classList.add('wrong');
      }
    }
  }

  var score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  var resultEl = quizSection.querySelector('.chinese-quiz-result');

  var resultHtml = '<div class="chinese-quiz-score">';
  resultHtml += '<span class="chinese-quiz-score-num">' + score + '%</span>';
  resultHtml += '<span class="chinese-quiz-score-label">' +
    correctCount + '/' + totalQuestions + ' ' + _('正确', 'tačno', 'correct') + '</span>';
  resultHtml += '</div>';

  // Auto-mark complete if score >= 60%
  if (score >= 60) {
    var newAchievements = markLessonComplete(lessonId, score, 0);
    resultHtml += '<div class="chinese-result-success">✅ ' +
      _('恭喜通过！', 'Čestitamo!', 'Congratulations!') + '</div>';

    if (newAchievements && newAchievements.length > 0) {
      resultHtml += '<div class="chinese-new-achievements">';
      resultHtml += '<p>' + _('新成就解锁！', 'Nova dostignuća!', 'New achievements!') + '</p>';
      for (var a = 0; a < newAchievements.length; a++) {
        if (newAchievements[a]) {
          resultHtml += '<div class="chinese-achievement-flash">';
          resultHtml += '<span>' + (newAchievements[a].icon || '🏆') + ' ' +
            langName(newAchievements[a].name) + '</span>';
          resultHtml += '</div>';
        }
      }
      resultHtml += '</div>';
    }

    // "Next lesson" button
    var nextLesson = lessonId + 1;
    if (nextLesson <= TOTAL_LESSONS && isLessonUnlocked(nextLesson)) {
      resultHtml += '<button class="btn btn-primary" onclick="renderLessonView(' + nextLesson + ')" style="margin-top:12px;width:100%">' +
        _('下一课 ▸', 'Sledeća lekcija ▸', 'Next Lesson ▸') + '</button>';
    }
  } else {
    resultHtml += '<div class="chinese-result-fail">' +
      _('未通过（需60%以上），再试一次吧', 'Niste prošli (potrebno 60%), probajte ponovo', 'Not passed (need 60%), try again') +
      '</div>';
    resultHtml += '<button class="btn btn-outline" onclick="renderLessonView(' + lessonId + ')" style="margin-top:8px;width:100%">' +
      _('重新测验', 'Ponovi test', 'Retry Quiz') + '</button>';
  }

  resultEl.innerHTML = resultHtml;

  // Show toast
  if (score >= 60 && typeof toast !== 'undefined') {
    toast(_('✅ 第' + lessonId + '课完成！', '✅ Lekcija ' + lessonId + ' završena!', '✅ Lesson ' + lessonId + ' complete!'));
  }
}

/* ---- Achievement Panel ---- */

function renderAchievementPanel() {
  var panel = getChinesePanel();
  if (!panel) return;

  var status = getAchievementStatus();

  var html = '<div class="chinese-section">';
  html += '<button class="btn btn-ghost" onclick="renderChineseHome()">◂ ' + _('返回', 'Nazad', 'Back') + '</button>';
  html += '<h3 class="chinese-section-title">' + _('成就', 'Dostignuća', 'Achievements') + '</h3>';

  // Summary
  html += '<div class="chinese-achievement-summary">';
  html += '<span class="chinese-ach-summary-icon">🏆</span>';
  html += '<span class="chinese-ach-summary-text">' +
    status.unlocked + '/' + status.total + ' ' + _('已解锁', 'otključano', 'unlocked') + '</span>';
  html += '</div>';

  // Achievement grid
  html += '<div class="chinese-achievement-grid">';
  for (var i = 0; i < status.list.length; i++) {
    var ach = status.list[i];
    var achClass = ach.isUnlocked ? 'chinese-ach-card unlocked' : 'chinese-ach-card locked';
    html += '<div class="' + achClass + '">';
    html += '<span class="chinese-ach-icon">' + (ach.isUnlocked ? ach.icon : '🔒') + '</span>';
    html += '<div class="chinese-ach-name">' + langName(ach.name) + '</div>';
    html += '<div class="chinese-ach-desc">' + langName(ach.description) + '</div>';
    if (ach.isUnlocked) {
      html += '<div class="chinese-ach-points">+' + ach.points + '</div>';
    }
    html += '</div>';
  }
  html += '</div></div>';

  panel.innerHTML = html;
}

/* ---- Review Panel ---- */

function renderReviewPanel() {
  var panel = getChinesePanel();
  if (!panel) return;

  var dueReviews = getDueReviews();

  var html = '<div class="chinese-section">';
  html += '<button class="btn btn-ghost" onclick="renderChineseHome()">◂ ' + _('返回', 'Nazad', 'Back') + '</button>';
  html += '<h3 class="chinese-section-title">' + _('复习', 'Ponavljanje', 'Review') + '</h3>';

  if (dueReviews.length === 0) {
    html += '<div class="empty-state"><span class="empty-icon">🎉</span>' +
      '<span class="empty-text">' + _('暂无待复习课程', 'Nema lekcija za ponavljanje', 'No reviews due') + '</span></div>';
  } else {
    var urgent = [];
    var soon = [];
    var later = [];

    for (var i = 0; i < dueReviews.length; i++) {
      if (dueReviews[i].urgency === 'urgent') urgent.push(dueReviews[i]);
      else if (dueReviews[i].urgency === 'soon') soon.push(dueReviews[i]);
      else later.push(dueReviews[i]);
    }

    if (urgent.length > 0) {
      html += '<div class="chinese-review-group"><h4>🔴 ' + _('紧急', 'Hitno', 'Urgent') + '</h4>';
      for (var u = 0; u < urgent.length; u++) {
        html += renderFullReviewItem(urgent[u]);
      }
      html += '</div>';
    }

    if (soon.length > 0) {
      html += '<div class="chinese-review-group"><h4>🟡 ' + _('即将', 'Uskoro', 'Soon') + '</h4>';
      for (var s = 0; s < soon.length; s++) {
        html += renderFullReviewItem(soon[s]);
      }
      html += '</div>';
    }

    if (later.length > 0) {
      html += '<div class="chinese-review-group"><h4>🟢 ' + _('后续', 'Kasnije', 'Later') + '</h4>';
      for (var l = 0; l < Math.min(later.length, 10); l++) {
        html += renderFullReviewItem(later[l]);
      }
      html += '</div>';
    }
  }

  html += '</div>';
  panel.innerHTML = html;
}

function renderFullReviewItem(review) {
  return '<div class="chinese-review-full-item" onclick="renderLessonView(' + review.lessonId + ')">' +
    '<span class="chinese-review-icon">' + review.icon + '</span>' +
    '<div class="chinese-review-info">' +
    '<div class="chinese-review-topic">' + review.topic + '</div>' +
    '<div class="chinese-review-due">' +
    (review.daysUntilDue < 0 ?
      _('超期 ' + Math.abs(review.daysUntilDue) + ' 天', 'Zakašnjenje ' + Math.abs(review.daysUntilDue) + ' dana', 'Overdue by ' + Math.abs(review.daysUntilDue) + ' days') :
      review.daysUntilDue === 0 ?
        _('今天到期', 'Dospijeva danas', 'Due today') :
        _('还有 ' + review.daysUntilDue + ' 天', 'Preostalo ' + review.daysUntilDue + ' dana', review.daysUntilDue + ' days left')) +
    '</div></div></div>';
}

/* ================================================================
   8. UTILITY FUNCTIONS
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

function getLessonById(id) {
  var numId = typeof id === 'string' ? parseInt(id, 10) : id;
  for (var i = 0; i < LESSONS_DATA.length; i++) {
    var lesson = LESSONS_DATA[i];
    var lessonNum = lesson.day || (i + 1);
    if (lessonNum === numId) return lesson;
  }
  return null;
}

function fmtDateLocal(d) {
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
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
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ================================================================
   EXPOSE — Make functions available to app.js
   ================================================================ */

window.initChineseTab = initChineseTab;
window.renderChineseHome = renderChineseHome;
window.renderPhaseLessons = renderPhaseLessons;
window.renderLessonView = renderLessonView;
window.renderAchievementPanel = renderAchievementPanel;
window.renderReviewPanel = renderReviewPanel;
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
window.lessonsEngineReady = true;

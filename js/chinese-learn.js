/* ================================================================
   chinese-learn.js — 中文学习核心引擎 (Core Engine)
   v3 — split from monolithic file: data, progress, reviews, achievements
   Dependencies: i18n.js (provides _ and langName), app.js (activeProfile)
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
  { id: 1, icon: '\u{1F524}', key: 'pinyin' },
  { id: 2, icon: '\u{1F5E3}️', key: 'conversation' },
  { id: 3, icon: '\u{1F91D}', key: 'social' },
  { id: 4, icon: '\u{1F496}', key: 'emotional' },
  { id: 5, icon: '\u{1F4D6}', key: 'reading' },
  { id: 6, icon: '\u{1F393}', key: 'advanced' }
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

  const lessonsUrl = 'data/lessons.json';
  const achievementsUrl = 'data/achievements.json';
  let loadedCount = 0;
  const totalToLoad = 2;
  let loadError = null;

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
      for (let i = 0; i < _lessonLoadQueue.length; i++) {
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
      for (let pi = 0; pi < data.length; pi++) {
        const phaseLessons = data[pi].lessons || [];
        for (let li = 0; li < phaseLessons.length; li++) {
          const les = phaseLessons[li];
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
  for (let i = 0; i < LESSONS_DATA.length; i++) {
    const lesson = LESSONS_DATA[i];
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
  const key = getProgressKey();
  try {
    const raw = localStorage.getItem(key);
    if (raw) { _currentProgress = JSON.parse(raw); return _currentProgress; }
  } catch (e) { /* corrupted */ }
  _currentProgress = getDefaultProgress();
  return _currentProgress;
}

function saveProgress(progress) {
  const p = progress || _currentProgress || getDefaultProgress();
  _currentProgress = p;
  try { localStorage.setItem(getProgressKey(), JSON.stringify(p)); } catch (e) { console.warn('[chinese] saveProgress failed:', e.message); }
  if (typeof scheduleSync !== 'undefined') scheduleSync();
}

function getDefaultProgress() {
  return {
    version: 2,
    completedLessons: {},
    currentLessonId: null,
    totalPoints: 0,
    totalTimeSpent: 0,
    studyStreak: { current: 0, longest: 0, lastDate: null },
    reviews: {},
    achievements: {},
    dailyStats: {},
    perfectScores: 0,
    quizResults: {},
    dailyGoal: 3,
    favoriteWords: []
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
  const lesson = getLessonById(lessonId);
  if (lesson && lesson.phase) return lesson.phase;
  return Math.floor((lessonId - 1) / LESSONS_PER_PHASE) + 1;
}

function isLessonUnlocked(lessonId) {
  const progress = getProgress();
  const phase = getLessonPhase(lessonId);
  if (phase <= 1) return true;
  const prevProgress = getPhaseProgress(phase - 1);
  if (prevProgress.percent < 80) return false;
  const lessonIndex = (lessonId - 1) % LESSONS_PER_PHASE;
  if (lessonIndex > 0) {
    if (!progress.completedLessons[String(lessonId - 1)]) return false;
  }
  return true;
}

function getPhaseUnlockRequirement(phase) {
  if (phase <= 1) return _('直接可用', 'Dostupno odmah', 'Available now');
  const needed = Math.ceil(LESSONS_PER_PHASE * 0.8);
  return _(
    '完成阶段' + (phase - 1) + '至少' + needed + '课',
    'Završite najmanje ' + needed + ' lekcija faze ' + (phase - 1),
    'Complete at least ' + needed + ' lessons in phase ' + (phase - 1)
  );
}

function markLessonComplete(lessonId, score, timeSpentSeconds) {
  const progress = getProgress();
  const id = String(lessonId);
  let newAchievements = [];

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

  const nextId = lessonId + 1;
  if (nextId <= TOTAL_LESSONS && isLessonUnlocked(nextId)) {
    progress.currentLessonId = nextId;
  } else {
    progress.currentLessonId = null;
  }

  saveProgress(progress);
  return newAchievements;
}

function updateStreak(progress) {
  const today = fmtDateLocal(new Date());
  const lastDate = progress.studyStreak.lastDate;
  if (lastDate === today) return;
  const yesterday = fmtDateLocal(addDaysLocal(new Date(), -1));
  if (lastDate === yesterday) { progress.studyStreak.current++; }
  else if (lastDate === null) { progress.studyStreak.current = 1; }
  else { progress.studyStreak.current = 1; }
  if (progress.studyStreak.current > progress.studyStreak.longest) {
    progress.studyStreak.longest = progress.studyStreak.current;
  }
  progress.studyStreak.lastDate = today;
}

function updateDailyStats(progress, timeSpent) {
  const today = fmtDateLocal(new Date());
  if (!progress.dailyStats) progress.dailyStats = {};
  if (!progress.dailyStats[today]) {
    progress.dailyStats[today] = { lessonsCompleted: 0, timeSpent: 0, pointsEarned: 0 };
  }
  progress.dailyStats[today].lessonsCompleted++;
  progress.dailyStats[today].timeSpent += timeSpent;
}

function getTotalProgress() {
  const progress = getProgress();
  const completed = Object.keys(progress.completedLessons).length;
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
  const progress = getProgress();
  let completed = 0;
  const startId = (phase - 1) * LESSONS_PER_PHASE + 1;
  const endId = phase * LESSONS_PER_PHASE;
  for (let id = startId; id <= endId; id++) {
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
  const id = String(lessonId);
  if (!progress.reviews[id]) {
    progress.reviews[id] = {
      history: [],
      nextDue: fmtDateLocal(addDaysLocal(new Date(), REVIEW_INTERVALS[0])),
      intervalIndex: 0
    };
  }
}

function getDueReviews() {
  const progress = getProgress();
  if (!progress.reviews) return [];
  const today = fmtDateLocal(new Date());
  const reviews = [];
  const keys = Object.keys(progress.reviews);

  for (let i = 0; i < keys.length; i++) {
    const id = keys[i];
    const review = progress.reviews[id];
    if (!review.nextDue) continue;
    const lesson = getLessonById(parseInt(id, 10));
    if (!lesson) continue;

    const daysUntilDue = dateDiffDays(review.nextDue, today);
    const urgency = daysUntilDue <= 0 ? 'urgent' : (daysUntilDue <= 3 ? 'soon' : 'ok');

    reviews.push({
      lessonId: parseInt(id, 10),
      topic: getTopicText(lesson.topic),
      icon: lesson.icon || '\u{1F4D6}',
      lastReview: getLastReviewDate(review),
      nextDue: review.nextDue,
      daysUntilDue: daysUntilDue,
      urgency: urgency
    });
  }

  reviews.sort(function (a, b) {
    const order = { urgent: 0, soon: 1, ok: 2 };
    return (order[a.urgency] || 3) - (order[b.urgency] || 3) || a.daysUntilDue - b.daysUntilDue;
  });

  return reviews;
}

function getLastReviewDate(review) {
  if (review.history && review.history.length > 0) return review.history[review.history.length - 1];
  return null;
}

function markLessonReviewed(lessonId) {
  const progress = getProgress();
  const id = String(lessonId);
  const today = fmtDateLocal(new Date());
  if (!progress.reviews) progress.reviews = {};
  if (!progress.reviews[id]) {
    progress.reviews[id] = { history: [], nextDue: today, intervalIndex: 0 };
  }
  const review = progress.reviews[id];
  if (!review.history) review.history = [];
  review.history.push(today);
  review.intervalIndex = Math.min((review.intervalIndex || 0) + 1, REVIEW_INTERVALS.length - 1);
  review.nextDue = fmtDateLocal(addDaysLocal(new Date(), REVIEW_INTERVALS[review.intervalIndex]));
  saveProgress(progress);
}

/* ---- Favorites ---- */

function getFavorites() {
  const progress = getProgress();
  return (progress.favoriteWords || []).slice();
}

function isFavoriteWord(zh) {
  const progress = getProgress();
  return (progress.favoriteWords || []).indexOf(zh) >= 0;
}

function toggleFavoriteWord(zh) {
  const progress = getProgress();
  if (!progress.favoriteWords) progress.favoriteWords = [];
  const idx = progress.favoriteWords.indexOf(zh);
  if (idx >= 0) {
    progress.favoriteWords.splice(idx, 1);
  } else {
    progress.favoriteWords.push(zh);
  }
  saveProgress(progress);
  return idx < 0;
}

/* ---- Daily Goal ---- */

function getDailyGoal() {
  const progress = getProgress();
  return progress.dailyGoal || 3;
}

function setDailyGoal(val) {
  const progress = getProgress();
  progress.dailyGoal = Math.max(1, Math.min(20, parseInt(val, 10) || 3));
  saveProgress(progress);
}

function getTodayCompletedCount() {
  const progress = getProgress();
  const today = fmtDateLocal(new Date());
  if (progress.dailyStats && progress.dailyStats[today]) {
    return progress.dailyStats[today].lessonsCompleted || 0;
  }
  return 0;
}

function getTodayProgress() {
  const goal = getDailyGoal();
  const done = getTodayCompletedCount();
  return { completed: done, goal: goal, percent: Math.min(100, Math.round((done / goal) * 100)) };
}

/* ---- Stroke Info ---- */

var STROKE_DATA = {
  '我': { radical: '戈', radicalStrokes: 3, totalStrokes: 7 },
  '你': { radical: '亻', radicalStrokes: 2, totalStrokes: 7 },
  '好': { radical: '女', radicalStrokes: 3, totalStrokes: 6 },
  '是': { radical: '日', radicalStrokes: 4, totalStrokes: 9 },
  '不': { radical: '一', radicalStrokes: 1, totalStrokes: 4 },
  '了': { radical: '亅', radicalStrokes: 1, totalStrokes: 2 },
  '人': { radical: '人', radicalStrokes: 2, totalStrokes: 2 },
  '在': { radical: '土', radicalStrokes: 3, totalStrokes: 6 },
  '有': { radical: '月', radicalStrokes: 4, totalStrokes: 6 },
  '中': { radical: '丨', radicalStrokes: 1, totalStrokes: 4 },
  '大': { radical: '大', radicalStrokes: 3, totalStrokes: 3 },
  '小': { radical: '小', radicalStrokes: 3, totalStrokes: 3 },
  '天': { radical: '大', radicalStrokes: 3, totalStrokes: 4 },
  '日': { radical: '日', radicalStrokes: 4, totalStrokes: 4 },
  '月': { radical: '月', radicalStrokes: 4, totalStrokes: 4 },
  '水': { radical: '水', radicalStrokes: 4, totalStrokes: 4 },
  '火': { radical: '火', radicalStrokes: 4, totalStrokes: 4 },
  '山': { radical: '山', radicalStrokes: 3, totalStrokes: 3 },
  '木': { radical: '木', radicalStrokes: 4, totalStrokes: 4 },
  '花': { radical: '艹', radicalStrokes: 3, totalStrokes: 7 },
  '爱': { radical: '爫', radicalStrokes: 4, totalStrokes: 10 },
  '一': { radical: '一', radicalStrokes: 1, totalStrokes: 1 },
  '二': { radical: '二', radicalStrokes: 2, totalStrokes: 2 },
  '三': { radical: '一', radicalStrokes: 1, totalStrokes: 3 },
  '四': { radical: '囗', radicalStrokes: 3, totalStrokes: 5 },
  '五': { radical: '二', radicalStrokes: 2, totalStrokes: 4 },
  '六': { radical: '八', radicalStrokes: 2, totalStrokes: 4 },
  '七': { radical: '一', radicalStrokes: 1, totalStrokes: 2 },
  '八': { radical: '八', radicalStrokes: 2, totalStrokes: 2 },
  '九': { radical: '丿', radicalStrokes: 1, totalStrokes: 2 },
  '十': { radical: '十', radicalStrokes: 2, totalStrokes: 2 },
  '上': { radical: '一', radicalStrokes: 1, totalStrokes: 3 },
  '下': { radical: '一', radicalStrokes: 1, totalStrokes: 3 },
  '左': { radical: '工', radicalStrokes: 3, totalStrokes: 5 },
  '右': { radical: '口', radicalStrokes: 3, totalStrokes: 5 },
  '学': { radical: '子', radicalStrokes: 3, totalStrokes: 8 },
  '习': { radical: '冫', radicalStrokes: 2, totalStrokes: 3 },
  '中': { radical: '丨', radicalStrokes: 1, totalStrokes: 4 },
  '国': { radical: '囗', radicalStrokes: 3, totalStrokes: 8 },
  '女': { radical: '女', radicalStrokes: 3, totalStrokes: 3 },
  '男': { radical: '田', radicalStrokes: 5, totalStrokes: 7 },
  '子': { radical: '子', radicalStrokes: 3, totalStrokes: 3 },
  '她': { radical: '女', radicalStrokes: 3, totalStrokes: 6 },
  '他': { radical: '亻', radicalStrokes: 2, totalStrokes: 5 },
  '们': { radical: '亻', radicalStrokes: 2, totalStrokes: 5 },
  '朋': { radical: '月', radicalStrokes: 4, totalStrokes: 8 },
  '友': { radical: '又', radicalStrokes: 2, totalStrokes: 4 },
  '老': { radical: '老', radicalStrokes: 6, totalStrokes: 6 },
  '师': { radical: '巾', radicalStrokes: 3, totalStrokes: 6 },
  '美': { radical: '羊', radicalStrokes: 6, totalStrokes: 9 },
  '丽': { radical: '一', radicalStrokes: 1, totalStrokes: 7 },
  '漂': { radical: '氵', radicalStrokes: 3, totalStrokes: 14 },
  '亮': { radical: '亠', radicalStrokes: 2, totalStrokes: 9 },
  '谢': { radical: '讠', radicalStrokes: 2, totalStrokes: 12 },
  '吗': { radical: '口', radicalStrokes: 3, totalStrokes: 6 },
  '吃': { radical: '口', radicalStrokes: 3, totalStrokes: 6 },
  '喝': { radical: '口', radicalStrokes: 3, totalStrokes: 12 },
  '看': { radical: '目', radicalStrokes: 5, totalStrokes: 9 },
  '听': { radical: '口', radicalStrokes: 3, totalStrokes: 7 },
  '说': { radical: '讠', radialStrokes: 2, totalStrokes: 9 },
  '读': { radical: '讠', radicalStrokes: 2, totalStrokes: 10 },
  '写': { radical: '冖', radicalStrokes: 2, totalStrokes: 5 },
  '家': { radical: '宀', radicalStrokes: 3, totalStrokes: 10 },
  '门': { radical: '门', radicalStrokes: 3, totalStrokes: 3 },
  '开': { radical: '廾', radicalStrokes: 3, totalStrokes: 4 },
  '关': { radical: '丷', radicalStrokes: 2, totalStrokes: 6 },
  '谢': { radical: '讠', radicalStrokes: 2, totalStrokes: 12 },
  '对': { radical: '又', radicalStrokes: 2, totalStrokes: 5 },
  '起': { radical: '走', radicalStrokes: 7, totalStrokes: 10 },
  '来': { radical: '来', radicalStrokes: 7, totalStrokes: 7 },
  '去': { radical: '土', radicalStrokes: 3, totalStrokes: 5 },
  '回': { radical: '囗', radicalStrokes: 3, totalStrokes: 6 },
  '叫': { radical: '口', radicalStrokes: 3, totalStrokes: 5 },
  '岁': { radical: '山', radicalStrokes: 3, totalStrokes: 6 },
  '今': { radical: '人', radicalStrokes: 2, totalStrokes: 4 },
  '年': { radical: '干', radicalStrokes: 3, totalStrokes: 6 },
  '星': { radical: '日', radicalStrokes: 4, totalStrokes: 9 },
  '期': { radical: '月', radicalStrokes: 4, totalStrokes: 12 },
  '的': { radical: '白', radicalStrokes: 5, totalStrokes: 8 },
  '和': { radical: '禾', radicalStrokes: 5, totalStrokes: 8 },
  '也': { radical: '乙', radicalStrokes: 1, totalStrokes: 3 },
  '都': { radical: '阝', radicalStrokes: 2, totalStrokes: 10 },
  '很': { radical: '彳', radicalStrokes: 3, totalStrokes: 9 },
  '这': { radical: '辶', radicalStrokes: 3, totalStrokes: 7 },
  '那': { radical: '阝', radicalStrokes: 2, totalStrokes: 6 },
  '什': { radical: '亻', radicalStrokes: 2, totalStrokes: 4 },
  '么': { radical: '丿', radicalStrokes: 1, totalStrokes: 3 },
  '多': { radical: '夕', radicalStrokes: 3, totalStrokes: 6 },
  '少': { radical: '小', radicalStrokes: 3, totalStrokes: 4 },
  '想': { radical: '心', radicalStrokes: 4, totalStrokes: 13 },
  '知': { radical: '矢', radicalStrokes: 5, totalStrokes: 8 },
  '道': { radical: '辶', radicalStrokes: 3, totalStrokes: 12 },
  '能': { radical: '月', radicalStrokes: 4, totalStrokes: 10 },
  '会': { radical: '人', radicalStrokes: 2, totalStrokes: 6 },
  '可': { radical: '口', radicalStrokes: 3, totalStrokes: 5 },
  '以': { radical: '人', radicalStrokes: 2, totalStrokes: 4 },
  '生': { radical: '生', radicalStrokes: 5, totalStrokes: 5 },
  '气': { radical: '气', radicalStrokes: 4, totalStrokes: 4 },
  '新': { radical: '斤', radicalStrokes: 4, totalStrokes: 13 },
  '旧': { radical: '日', radicalStrokes: 4, totalStrokes: 5 },
  '前': { radical: '丷', radicalStrokes: 2, totalStrokes: 9 },
  '后': { radical: '口', radicalStrokes: 3, totalStrokes: 6 },
  '时': { radical: '日', radicalStrokes: 4, totalStrokes: 7 }
};

function getStrokeInfo(zh) {
  return STROKE_DATA[zh] || null;
}

function dateDiffDays(dateStr1, dateStr2) {
  return Math.round((parseDateLocal(dateStr1) - parseDateLocal(dateStr2)) / 86400000);
}

/* ================================================================
   5. ACHIEVEMENT SYSTEM
   ================================================================ */

function checkAchievements(progress) {
  const newlyUnlocked = [];
  for (let i = 0; i < ACHIEVEMENTS_DATA.length; i++) {
    const ach = ACHIEVEMENTS_DATA[i];
    if (progress.achievements[ach.id]) continue;
    if (isAchievementConditionMet(ach, progress)) {
      newlyUnlocked.push(unlockAchievement(progress, ach.id));
    }
  }
  return newlyUnlocked;
}

function isAchievementConditionMet(ach, progress) {
  const cond = ach.condition;
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
  let ach = null;
  for (let i = 0; i < ACHIEVEMENTS_DATA.length; i++) {
    if (ACHIEVEMENTS_DATA[i].id === achievementId) { ach = ACHIEVEMENTS_DATA[i]; break; }
  }
  if (ach && ach.points) progress.totalPoints = (progress.totalPoints || 0) + ach.points;
  return ach || { id: achievementId };
}

function getAchievementStatus() {
  const progress = getProgress();
  let unlocked = 0;
  const list = [];
  for (let i = 0; i < ACHIEVEMENTS_DATA.length; i++) {
    const ach = ACHIEVEMENTS_DATA[i];
    const isUnlocked = !!(progress.achievements && progress.achievements[ach.id]);
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
   6. UTILITY FUNCTIONS
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
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  for (let i = 0; i < LESSONS_DATA.length; i++) {
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
  const parts = str.split('-');
  return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
}

function addDaysLocal(d, days) {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

function shuffleArray(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i]; copy[i] = copy[j]; copy[j] = temp;
  }
  return copy;
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ================================================================
   EXPOSE — Global functions for app.js and HTML onclick handlers
   ================================================================ */

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
window.getFavorites = getFavorites;
window.isFavoriteWord = isFavoriteWord;
window.toggleFavoriteWord = toggleFavoriteWord;
window.getDailyGoal = getDailyGoal;
window.setDailyGoal = setDailyGoal;
window.getTodayCompletedCount = getTodayCompletedCount;
window.getTodayProgress = getTodayProgress;
window.getStrokeInfo = getStrokeInfo;
window.lessonsEngineReady = true;

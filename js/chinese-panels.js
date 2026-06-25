/* ================================================================
   chinese-panels.js — Stats + Favorites Panel Rendering
   Dependencies: chinese-learn.js (core engine via window.*)
   ================================================================ */

function renderStatsPanel() {
  const cardsEl = document.getElementById('lrnStatsCards');
  const heatEl = document.getElementById('lrnStatsHeatmap');
  if (!cardsEl || !heatEl) return;

  const progress = getProgress();
  const total = getTotalProgress();
  const completedList = progress.completedLessons || {};
  const completedCount = Object.keys(completedList).length;

  cardsEl.innerHTML =
    '<div class="lrn-stat-card"><span class="lrn-stat-icon">\u{1F4DA}</span>' +
    '<div class="lrn-stat-val">' + completedCount + '/' + TOTAL_LESSONS + '</div>' +
    '<div class="lrn-stat-label">' + _('已学课程', 'Završene lekcije', 'Lessons done') + '</div></div>' +
    '<div class="lrn-stat-card"><span class="lrn-stat-icon">\u{1F525}</span>' +
    '<div class="lrn-stat-val">' + (total.streak || 0) + '</div>' +
    '<div class="lrn-stat-label">' + _('连续天数', 'Dana zaredom', 'Day streak') + '</div></div>' +
    '<div class="lrn-stat-card"><span class="lrn-stat-icon">\u{2B50}</span>' +
    '<div class="lrn-stat-val">' + (total.totalPoints || 0) + '</div>' +
    '<div class="lrn-stat-label">' + _('总积分', 'Ukupno poena', 'Total points') + '</div></div>' +
    '<div class="lrn-stat-card" onclick="var g=prompt(\'' +
    _('设置每日目标课数:', 'Postavi dnevni cilj:', 'Set daily goal:') +
    '\',getDailyGoal());if(g)setDailyGoal(g);renderStatsPanel();renderChineseHome();" style="cursor:pointer">' +
    '<span class="lrn-stat-icon">\u{1F3AF}</span>' +
    '<div class="lrn-stat-val">' + getDailyGoal() + '</div>' +
    '<div class="lrn-stat-label">' + _('每日目标', 'Dnevni cilj', 'Daily goal') + '</div></div>';

  let heatHtml = '<h4 style="font-size:.68rem;margin-bottom:8px;font-weight:700">' +
    _('学习热力图', 'Mapa učenja', 'Study heatmap') + '</h4>';
  heatHtml += '<div class="lrn-heatmap-grid">';

  const dayLabels = _('一二三四五六日', 'P U S C P S N', 'M T W T F S S');
  for (let d = 0; d < 7; d++) {
    heatHtml += '<div style="font-size:.45rem;color:var(--text-muted);text-align:center">' +
      dayLabels.charAt(d) + '</div>';
  }

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 48);
  const startDay = startDate.getDay();
  startDate.setDate(startDate.getDate() - ((startDay + 6) % 7));

  const dailyStats = progress.dailyStats || {};
  const gridDate = new Date(startDate);
  const nowStr = fmtDateLocal(new Date());
  const maxWeeks = 7;
  let cells = 0;

  for (let w = 0; w < maxWeeks; w++) {
    for (let day = 0; day < 7; day++) {
      const dateStr = fmtDateLocal(gridDate);
      const count = dailyStats[dateStr] ? dailyStats[dateStr].lessonsCompleted || 0 : 0;
      const intensity = count === 0 ? '' : (count <= 1 ? 'low' : (count <= 3 ? 'med' : 'high'));
      const isToday = dateStr === nowStr;
      heatHtml += '<div class="lrn-heat-cell ' + intensity + (isToday ? ' today' : '') +
        '" title="' + dateStr + ': ' + count + ' ' +
        _('课', 'lekcija', 'lessons') + '"></div>';
      gridDate.setDate(gridDate.getDate() + 1);
      cells++;
      if (cells >= maxWeeks * 7) break;
    }
    if (cells >= maxWeeks * 7) break;
  }
  heatHtml += '</div>';
  heatHtml += '<div class="lrn-heat-legend" style="display:flex;justify-content:flex-end;gap:4px;' +
    'margin-top:6px;font-size:.5rem;color:var(--text-muted);align-items:center">' +
    _('少', 'Manje', 'Less') +
    '<div class="lrn-heat-cell" style="width:10px;height:10px"></div>' +
    '<div class="lrn-heat-cell low" style="width:10px;height:10px"></div>' +
    '<div class="lrn-heat-cell med" style="width:10px;height:10px"></div>' +
    '<div class="lrn-heat-cell high" style="width:10px;height:10px"></div>' +
    _('多', 'Više', 'More') + '</div>';

  heatEl.innerHTML = heatHtml;
}

/* ---- Favorites Panel ---- */

function renderFavoritesPanel() {
  const container = document.getElementById('lrnFavoritesContainer');
  if (!container) return;
  const favs = getFavorites();
  if (favs.length === 0) {
    container.innerHTML = '<div class="lrn-empty-state"><span class="lrn-empty-icon">\u{2B1A}</span>' +
      '<span class="lrn-empty-text">' +
      _('暂无收藏词汇', 'Nema sačuvanih reči', 'No favorite words') + '</span></div>';
    return;
  }
  let html = '';
  for (let i = 0; i < favs.length; i++) {
    const zh = favs[i];
    const wordInfo = findWordInLessons(zh);
    if (wordInfo) {
      html += '<div class="lrn-word-card">';
      html += '<button class="lrn-fav-btn fav-active" ' +
        'onclick="toggleFavoriteWord(\'' + escapeHtml(zh) +
        '\');this.closest(\'.lrn-word-card\').remove();" ' +
        'title="' + _('取消收藏', 'Ukloni', 'Remove') + '">\u{2B50}</button>';
      html += '<div class="lrn-word-zh">' + (wordInfo.zh || '') + '</div>';
      html += '<div class="lrn-word-py">' + (wordInfo.py || '') + '</div>';
      html += '<div class="lrn-word-sr">' + (wordInfo.sr || '') + '</div>';
      if (wordInfo.en) html += '<div class="lrn-word-en">' + (wordInfo.en || '') + '</div>';
      html += '<button class="lrn-word-audio" onclick="event.stopPropagation();speakWord(\'' +
        escapeHtml(zh) + '\')" title="' +
        _('发音', 'Izgovor', 'Pronounce') + '">\u{1F50A}</button>';
      html += '</div>';
    }
  }
  container.innerHTML = html;
}

function findWordInLessons(zh) {
  for (let i = 0; i < LESSONS_DATA.length; i++) {
    const lesson = LESSONS_DATA[i];
    if (lesson.words) {
      for (let j = 0; j < lesson.words.length; j++) {
        if (lesson.words[j].zh === zh) return lesson.words[j];
      }
    }
  }
  return null;
}

window.renderStatsPanel = renderStatsPanel;
window.renderFavoritesPanel = renderFavoritesPanel;

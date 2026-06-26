'use strict';

/* ================================================================
   CALENDAR MODULE — Calendar grid, progress, FAB, month navigation
   Extracted from app.js for modularity
   Depends on: cycle-core.js (fmtDate, sameDay, addDays, daysDiff,
     d0, today, predict, getPeriodEndDate, getPhase, getOpenPeriodStart)
   Depends on: app.js globals (state, viewYear, viewMonth, lang,
     activeProfile, SEASON_LABEL, SEASON_EMOJI, safeParse, t, L)
   Depends on: calendar-culture.js (getSolarTerm, getBirthday,
     getSpecialDate, getLunarCellText, getLunarCellClass)
   Depends on: lunar.js (Lunar global for lunar calendar)
   ================================================================ */

const CalendarModule = (function () {
  // ── Private helpers ──────────────────────────────────────────────

  /** Get season label for a month in current language */
  function getSeasonLabel(month) {
    return SEASON_LABEL[lang] ? SEASON_LABEL[lang][month] : SEASON_LABEL['sr'][month];
  }

  // ── Calendar grid rendering ──────────────────────────────────────

  function renderCalendar() {
    const pred = predict();
    const td = today();
    document.getElementById('monthLabel').textContent =
      lang === 'sr'
        ? t('months')[viewMonth] + ' ' + viewYear + '.'
        : lang === 'en'
          ? t('months')[viewMonth] + ' ' + viewYear
          : viewYear + '年' + (viewMonth + 1) + '月';

    const first = new Date(viewYear, viewMonth, 1);
    let dow = first.getDay();
    dow = dow === 0 ? 6 : dow - 1;
    const gridStart = addDays(first, -dow);
    const grid = document.getElementById('daysGrid');
    const frag = document.createDocumentFragment();
    const recordedStarts = new Set(state.records.map(fmtDate));

    // Prediction legend
    const plEl = document.getElementById('predLegend');
    if (pred.futurePeriods.length > 0) {
      plEl.style.display = '';
      plEl.textContent = t('calendarPredLegend');
    } else {
      plEl.style.display = 'none';
    }

    // Build shared diary index for dot indicators
    const sharedDiaryIdx = {};
    const sd = safeParse(localStorage.getItem('shared-diary'), {});
    Object.keys(sd).forEach(function (k) {
      if (sd[k] && (sd[k].barry || sd[k].andjela)) {
        sharedDiaryIdx[k] = true;
      }
    });

    for (let i = 0; i < 42; i++) {
      // Week number column at start of each row
      if (i % 7 === 0) {
        const wkCell = document.createElement('div');
        wkCell.className = 'week-num';
        const wkDate = addDays(gridStart, i);
        const jan1 = new Date(wkDate.getFullYear(), 0, 1);
        const wkNum = Math.ceil(((wkDate - jan1) / 86400000 + jan1.getDay() + 1) / 7);
        wkCell.textContent = wkNum;
        wkCell.setAttribute('aria-hidden', 'true');
        frag.appendChild(wkCell);
      }

      const d = addDays(gridStart, i);
      const inMonth = d.getMonth() === viewMonth;
      const isToday = sameDay(d, td);
      const phase = inMonth ? getPhase(d, pred) : null;
      const key = fmtDate(d);

      // Symptom check
      const symptoms = state.symptoms && state.symptoms[key];
      const hasSymptom =
        symptoms &&
        Object.entries(symptoms).some(function (kv) {
          return kv[0] !== 'notes' && kv[1] > 0;
        });

      // Cycle day number for Andjela's active cycle
      let cycleDay = '';
      if (activeProfile === 'andjela' && pred.lastStart) {
        const cd = daysDiff(d0(pred.lastStart), d0(d));
        if (cd >= 0 && cd < pred.cycleLen) {
          cycleDay = String(cd + 1);
        }
      }

      const annType = typeof isAnniversary === 'function' ? isAnniversary(d) : 0;

      const el = document.createElement('div');
      el.className = 'day';
      if (!inMonth) el.classList.add('other-month');
      if (isToday) {
        el.classList.add('today');
        el.setAttribute('aria-current', 'date');
      }
      if (phase) el.classList.add(phase);
      if (phase === 'period-on' && recordedStarts.has(key)) {
        el.classList.add('recorded');
      }
      if (annType > 0) el.classList.add('anniversary');
      if (typeof getBirthday === 'function' && getBirthday(d)) {
        el.classList.add('birthday');
      }

      // Special date icon
      if (typeof getSpecialDate === 'function') {
        const special = getSpecialDate(d);
        if (special) {
          const spIcon = document.createElement('span');
          spIcon.className = 'special-date-icon';
          spIcon.textContent = special.icon;
          spIcon.title = activeProfile === 'barry' ? special.title_zh : special.title_sr;
          el.appendChild(spIcon);
          if (special.type === 'firstmeet') el.classList.add('first-meet');
          if (special.type === 'monthly') el.classList.add('monthly-anni');
        }
      }

      // Keyboard accessibility
      if (inMonth) {
        el.setAttribute('tabindex', '0');
        el.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            el.click();
          }
        });
      }

      // Date number
      const daySpan = document.createElement('span');
      daySpan.className = 'day-num';
      daySpan.textContent = d.getDate();
      el.appendChild(daySpan);

      // Cycle day badge
      if (cycleDay && inMonth && !phase) {
        const cdSpan = document.createElement('span');
        cdSpan.className = 'day-cycle-num';
        cdSpan.textContent = cycleDay;
        el.appendChild(cdSpan);
      }

      // Lunar date label (Chinese calendar)
      if (inMonth && typeof Lunar !== 'undefined') {
        const lunarDayName = typeof getLunarCellText === 'function' ? getLunarCellText(d) : null;
        if (lunarDayName) {
          const lunarSpan = document.createElement('span');
          lunarSpan.className = 'lunar-date ' + (typeof getLunarCellClass === 'function' ? getLunarCellClass(d) : '');
          lunarSpan.textContent = lunarDayName;
          el.appendChild(lunarSpan);
        }
      }

      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', fmtDate(d));

      // Symptom emoji icons
      if (hasSymptom && !phase && symptoms) {
        const miniDiv = document.createElement('div');
        miniDiv.className = 'day-symptoms';
        ['cramps', 'mood', 'flow', 'headache', 'fatigue', 'cravings'].forEach(function (sym) {
          if (symptoms[sym] && symptoms[sym] > 0) {
            const symEl = document.createElement('span');
            symEl.className = 'day-sym-icon';
            symEl.textContent = {
              cramps: '😣',
              mood: '😊',
              flow: '💧',
              headache: '🤕',
              fatigue: '😴',
              cravings: '🍫',
            }[sym];
            symEl.title = sym;
            miniDiv.appendChild(symEl);
          }
        });
        if (miniDiv.children.length > 0) el.appendChild(miniDiv);
      }

      // Diary entry dot
      if (sharedDiaryIdx[key]) {
        const diaryDot = document.createElement('span');
        diaryDot.className = 'mini-dot gold';
        diaryDot.style.cssText =
          'position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:5px;height:5px;border-radius:50%;background:var(--gold)';
        el.appendChild(diaryDot);
      }

      // Anniversary dot
      if (annType === 2 && !phase) {
        const dot = document.createElement('span');
        dot.className = 'mini-dot gold';
        el.appendChild(dot);
      }

      // Solar term label
      if (typeof getSolarTerm === 'function') {
        const solarTerm = getSolarTerm(key);
        if (solarTerm && inMonth) {
          const stName = solarTerm.name[lang] || solarTerm.name[lang.split('-')[0]] || solarTerm.name['sr'] || solarTerm.name['zh-CN'] || '';
          const stLabel = document.createElement('span');
          stLabel.className = 'solar-term-label';
          stLabel.textContent = stName;
          stLabel.title = stName;
          el.appendChild(stLabel);
          el.classList.add('solar-term-day');
          if (!solarTerm.story) {
            // Ensure rich data is loaded for the modal
            if (typeof ensureSolarTermData === 'function') {
              ensureSolarTermData();
            }
          }
        }
      }

      // Holiday emoji icons
      if (typeof getHoliday === 'function') {
        const holidays = getHoliday(key);
        holidays.forEach(function (h) {
          const icon = document.createElement('span');
          icon.className = 'holiday-icon holiday-' + h.country;
          icon.textContent = h.icon || (h.country === 'cn' ? '🎉' : '🇷🇸');
          icon.title = h.name[lang] || h.name[lang.split('-')[0]] || h.name['sr'] || h.name['zh-CN'] || '';
          el.appendChild(icon);
        });
      }

      // Single/double tap detection
      let tapTimer = null;

      if (inMonth) {
        // Click handler (desktop single/double click)
        (function (d, el) {
          el.addEventListener('click', function (e) {
            if (tapTimer) {
              // Double click — quick toggle period
              clearTimeout(tapTimer);
              tapTimer = null;
              const idx = state.records.findIndex(function (r) {
                return sameDay(r, d);
              });
              if (idx >= 0) {
                state.records.splice(idx, 1);
                if (typeof toast === 'function') {
                  toast('🚫 ' + t('toast.unmarked'));
                }
              } else {
                state.records.push(new Date(d));
                state.records.sort(function (a, b) {
                  return a - b;
                });
                el.classList.add('celebrate');
                setTimeout(function () {
                  el.classList.remove('celebrate');
                }, 500);
                if (typeof toast === 'function') {
                  toast('🩸 ' + t('toast.marked'));
                }
                if (typeof checkCycleCelebration === 'function') {
                  checkCycleCelebration();
                }
              }
              if (typeof saveState === 'function') saveState();
              if (typeof renderAll === 'function') {
                renderAll(['calendar', 'core']);
              }
              if (typeof updateFab === 'function') updateFab();
              e.preventDefault();
            } else {
              tapTimer = setTimeout(function () {
                tapTimer = null;
                if (typeof openModal === 'function') {
                  openModal(d, pred);
                }
              }, 280);
            }
          });
        })(d, el);

        // Touch handler (mobile double-tap)
        (function (d, el) {
          let touchCount = 0;
          let touchTimer = null;
          el.addEventListener('touchend', function (e) {
            touchCount++;
            if (touchCount === 1) {
              touchTimer = setTimeout(function () {
                touchCount = 0;
              }, 350);
            } else if (touchCount === 2) {
              clearTimeout(touchTimer);
              touchCount = 0;
              if (tapTimer) {
                clearTimeout(tapTimer);
                tapTimer = null;
              }
              const idx = state.records.findIndex(function (r) {
                return sameDay(r, d);
              });
              if (idx >= 0) {
                state.records.splice(idx, 1);
                if (typeof toast === 'function') {
                  toast('🚫 ' + t('toast.unmarked'));
                }
              } else {
                state.records.push(new Date(d));
                state.records.sort(function (a, b) {
                  return a - b;
                });
                el.classList.add('celebrate');
                setTimeout(function () {
                  el.classList.remove('celebrate');
                }, 500);
                if (typeof toast === 'function') {
                  toast('🩸 ' + t('toast.marked'));
                }
                if (typeof checkCycleCelebration === 'function') {
                  checkCycleCelebration();
                }
              }
              if (typeof saveState === 'function') saveState();
              if (typeof renderAll === 'function') {
                renderAll(['calendar', 'core']);
              }
              if (typeof updateFab === 'function') updateFab();
              e.preventDefault();
            }
          });
        })(d, el);
      }

      frag.appendChild(el);
    }

    // Batch-replace grid content
    grid.innerHTML = '';
    grid.appendChild(frag);

    // Month season subtitle
    const ml = document.getElementById('monthLabel');
    if (ml) {
      const existingTag = ml.querySelector('.season-tag');
      if (existingTag) existingTag.remove();
      ml.innerHTML =
        ml.textContent +
        ' <span class="season-tag" style="font-size:.6rem;opacity:.5">' +
        SEASON_EMOJI[viewMonth] +
        ' ' +
        getSeasonLabel(viewMonth) +
        '</span>';
    }

    updateProgress(pred);
    if (typeof updateStats === 'function') updateStats(pred);
    if (typeof updateHistoryDots === 'function') updateHistoryDots(pred);
    updateReminder(pred);
    if (typeof renderMonthHolidaySummary === 'function') {
      renderMonthHolidaySummary();
    }
    if (typeof renderUpcomingHoliday === 'function') {
      renderUpcomingHoliday();
    }
  }

  // ── Progress bar ─────────────────────────────────────────────────

  function updateProgress(pred) {
    const td = today();
    const numEl = document.getElementById('pg-num');
    const unitEl = document.getElementById('pg-unit');
    const subEl = document.getElementById('pg-sub');
    const fillEl = document.getElementById('pg-fill');
    const badgeEl = document.getElementById('pg-badge');
    const badges = t('phaseBadges');

    if (state.records.length === 0) {
      numEl.textContent = '--';
      unitEl.textContent = '';
      subEl.textContent = t('emptyState');
      fillEl.style.width = '0%';
      badgeEl.textContent = '';
      badgeEl.className = 'phase-badge';
      const allLabels = document.querySelectorAll('.progress-labels span');
      allLabels.forEach(function (s) {
        s.classList.remove('current');
      });
      return;
    }

    const phase = getPhase(td, pred);
    let pct = 0;
    let label = '';
    let bCls = '';

    const allLabels2 = document.querySelectorAll('.progress-labels span');
    allLabels2.forEach(function (s) {
      s.classList.remove('current');
    });

    if (phase === 'period-on' || phase === 'period-mid') {
      const cur = state.records.find(function (r) {
        const s = d0(r);
        const e = getPeriodEndDate(r) || addDays(s, pred.periodLen - 1);
        return td >= s && td <= e;
      });
      const dayNum = cur ? daysDiff(d0(cur), td) + 1 : 1;
      let actualLen = pred.periodLen;
      if (cur) {
        const pe = getPeriodEndDate(cur);
        if (pe) actualLen = daysDiff(d0(cur), pe) + 1;
      }
      numEl.textContent = dayNum;
      unitEl.textContent = ' / ' + actualLen;
      subEl.textContent = t('periodDay').replace('{n}', dayNum);
      pct = (dayNum / actualLen) * 15;
      label = badges.period;
      bCls = 'period';
      numEl.style.color = 'var(--love)';
      const periodLbl = document.querySelector('.lbl-period');
      if (periodLbl) periodLbl.classList.add('current');
    } else if (pred.isOverdue) {
      numEl.textContent = pred.overdueDays;
      unitEl.textContent = '';
      subEl.textContent = t('daysOverdue').replace('{n}', pred.overdueDays) + ' · ' + t('expected') + ' ' + fmtDate(pred.nextStart);
      bCls = 'late';
      label = badges.late;
      numEl.style.color = '#E65100';
      pct = 100;
      const lutealLbl = document.querySelector('.lbl-luteal');
      if (lutealLbl) lutealLbl.classList.add('current');
    } else {
      const totalLen = pred.nextStart ? daysDiff(pred.lastStart, pred.nextStart) : pred.cycleLen;
      const elapsed = daysDiff(pred.lastStart, td);
      const remain = pred.nextStart ? daysDiff(td, pred.nextStart) : totalLen - elapsed;
      pct = Math.min(100, Math.max(0, (elapsed / totalLen) * 100));
      numEl.textContent = remain;
      unitEl.textContent = '';

      if (remain > 0 && remain <= 7) {
        label = badges.luteal;
        numEl.style.color = 'var(--lavender-dark)';
        bCls = 'luteal';
        const ll = document.querySelector('.lbl-luteal');
        if (ll) ll.classList.add('current');
      } else if (phase === 'luteal') {
        label = badges.luteal;
        numEl.style.color = 'var(--lavender-dark)';
        bCls = 'luteal';
        const ll2 = document.querySelector('.lbl-luteal');
        if (ll2) ll2.classList.add('current');
      } else if (phase === 'fertile') {
        label = badges.fertile;
        numEl.style.color = 'var(--teal)';
        bCls = 'fertile';
        const ol = document.querySelector('.lbl-ovulation');
        if (ol) ol.classList.add('current');
      } else if (phase === 'ovulation') {
        label = badges.ovulation;
        numEl.style.color = 'var(--teal)';
        bCls = 'ovulation';
        const ol2 = document.querySelector('.lbl-ovulation');
        if (ol2) ol2.classList.add('current');
      } else if (phase === 'follicular') {
        label = badges.follicular;
        numEl.style.color = 'var(--sage)';
        bCls = 'follicular';
        const fl = document.querySelector('.lbl-follicular');
        if (fl) fl.classList.add('current');
      } else {
        numEl.style.color = 'var(--text-muted)';
      }

      subEl.textContent = remain >= 0 ? t('daysUntil').replace('{n}', remain) : t('expected') + ' ' + fmtDate(pred.nextStart);
    }

    fillEl.style.width = pct + '%';
    fillEl.setAttribute('role', 'progressbar');
    fillEl.setAttribute('aria-valuenow', Math.round(pct));
    fillEl.setAttribute('aria-valuemin', '0');
    fillEl.setAttribute('aria-valuemax', '100');

    if (bCls === 'period' || bCls === 'late') {
      fillEl.style.background = 'var(--love)';
    } else if (bCls === 'follicular') {
      fillEl.style.background = 'var(--sage)';
    } else if (bCls === 'ovulation' || bCls === 'fertile') {
      fillEl.style.background = 'var(--teal)';
    } else if (bCls === 'luteal') {
      fillEl.style.background = 'var(--lavender)';
    }

    badgeEl.textContent = label;
    badgeEl.className = 'phase-badge ' + bCls;
  }

  // ── Reminder banner ──────────────────────────────────────────────

  function updateReminder(pred) {
    const banner = document.getElementById('reminderBanner');
    if (!banner) return;
    const td = today();
    const phase = getPhase(td, pred);
    let msg = '';
    const r = t('reminder');

    if (phase === 'ovulation') {
      msg = r.ovulation;
    } else if (pred.isOverdue) {
      msg = r.late.replace('{days}', pred.overdueDays);
    } else if (pred.nextStart) {
      const remain = daysDiff(td, pred.nextStart);
      if (remain > 0 && remain <= 3) {
        msg = r.beforePeriod.replace('{days}', remain);
      }
    }

    if (msg) {
      banner.style.display = 'flex';
      banner.innerHTML = msg + ' <span class="dismiss" onclick="this.parentElement.style.display=\'none\'">✕</span>';
    } else {
      banner.style.display = 'none';
    }
  }

  // ── Floating action button ───────────────────────────────────────

  function updateFab() {
    const fab = document.getElementById('fabBtn');
    const fabIcon = document.getElementById('fab-icon');
    const fabLabel = document.getElementById('fab-label');

    if (activeProfile !== 'andjela') {
      if (fab) fab.classList.add('hidden');
      return;
    }

    if (fab) fab.classList.remove('hidden');
    const openStart = typeof getOpenPeriodStart === 'function' ? getOpenPeriodStart() : null;

    if (openStart) {
      // Period started but not ended — show end button
      if (fabIcon) fabIcon.textContent = '✅';
      if (fab) fab.style.fontSize = '1.2rem';
      if (fab) fab.style.fontWeight = 'normal';
      if (fabLabel) {
        fabLabel.textContent = t('fabEndPeriod');
      }
    } else {
      // No open period — show start button
      if (fabIcon) fabIcon.textContent = '🩸';
      if (fab) fab.style.fontSize = '1.5rem';
      if (fab) fab.style.fontWeight = 'normal';
      if (fabLabel) {
        fabLabel.textContent = t('fabStartPeriod');
      }
    }
  }

  // ── Month navigation ─────────────────────────────────────────────

  /** Go to a specific month (0-based) */
  function goToMonth(m) {
    viewMonth = m;
    renderCalendar();
  }

  /** Change month by delta (+1 or -1) with fade animation */
  function changeMonth(d) {
    if (typeof _changeMonthTimer !== 'undefined' && _changeMonthTimer) {
      return; // Debounce: ignore rapid clicks
    }
    _changeMonthTimer = setTimeout(function () {
      _changeMonthTimer = null;
    }, 150);

    viewMonth += d;
    if (viewMonth < 0) {
      viewMonth = 11;
      viewYear--;
    }
    if (viewMonth > 11) {
      viewMonth = 0;
      viewYear++;
    }

    const grid = document.getElementById('daysGrid');
    grid.style.transition = 'opacity 0.08s ease-out';
    grid.style.opacity = '0';

    setTimeout(function () {
      renderCalendar();
      grid.style.transition = 'opacity 0.15s ease-out';
      grid.style.opacity = '1';
    }, 80);
  }

  /** Jump back to today's month */
  function goToday() {
    viewYear = today().getFullYear();
    viewMonth = today().getMonth();
    const grid = document.getElementById('daysGrid');
    grid.style.transition = 'opacity 0.08s ease-out';
    grid.style.opacity = '0';
    setTimeout(function () {
      renderCalendar();
      grid.style.transition = 'opacity 0.2s ease-out';
      grid.style.opacity = '1';
    }, 80);
  }

  // ── Public API ───────────────────────────────────────────────────

  return {
    renderCalendar: renderCalendar,
    updateProgress: updateProgress,
    updateReminder: updateReminder,
    updateFab: updateFab,
    getSeasonLabel: getSeasonLabel,
    goToMonth: goToMonth,
    changeMonth: changeMonth,
    goToday: goToday,
  };
})();

// NOTE: Global functions (renderCalendar, updateProgress, etc.)
// are defined in app.js. CalendarModule provides namespaced access
// for future migration. Do NOT add window assignments here — they
// would conflict with app.js function declarations.

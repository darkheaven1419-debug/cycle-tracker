"use strict";

(function () {
  console.log('[module-sleep] 已加载');

  function saveSleep() {
    var time = document.getElementById('sleepTime').value;
    if (!time) return;
    var entry = { time: time, date: fmtDate(new Date()), saved: Date.now() };
    localStorage.setItem('barry-sleep', JSON.stringify(entry));
    if (typeof pushAllSharedData === 'function') pushAllSharedData();
    renderSleepCard();
    toast('\u{1F634} ' + (typeof t === 'function' ? t('sleepSaved') : 'Saved!'));
  }
  window.saveSleep = saveSleep;

  function getBarrySleep() {
    try { return JSON.parse(localStorage.getItem('barry-sleep')) || null; } catch (e) { return null; }
  }
  window.getBarrySleep = getBarrySleep;

  function renderSleepCard() {
    var card = document.getElementById('sleepCard');
    if (!card) return;
    card.style.display = '';
    document.getElementById('sleep-title').textContent = '\u{1F634} ' + (typeof t === 'function' ? t('sleepTitle') : 'Sleep');
    if (activeProfile === 'barry') {
      document.getElementById('sleepBarryView').style.display = '';
      document.getElementById('sleepAngieView').style.display = 'none';
      document.getElementById('sleep-hint').textContent = (typeof t === 'function' ? t('sleepHint') : '');
      document.getElementById('sleep-save').textContent = (typeof t === 'function' ? t('sleepSave') : 'Save');
      var s = getBarrySleep();
      if (s) document.getElementById('sleepTime').value = s.time;
    } else {
      document.getElementById('sleepBarryView').style.display = 'none';
      document.getElementById('sleepAngieView').style.display = '';
      var s = getBarrySleep();
      if (!s) {
        document.getElementById('sleepAngieContent').innerHTML = '<div style="text-align:center;color:var(--text-muted);font-size:.72rem">' + (typeof t === 'function' ? t('sleepEmpty') : '') + '</div>';
        return;
      }
      var parts = s.time.split(':');
      var hour = parseInt(parts[0]), min = parseInt(parts[1]);
      var lateMsg = '';
      if (hour >= 2 || (hour === 1 && min >= 30)) {
        lateMsg = '<div style="background:var(--rose-light);border-radius:12px;padding:12px;margin-top:8px;text-align:center"><span style="font-size:1.5rem">\u{1F494}</span><div style="font-size:.76rem;color:var(--rose-dark);font-weight:700;line-height:1.6">' + (typeof t === 'function' ? t('sleepLateTitle').replace('{time}', s.time) : '') + '</div><div style="font-size:.68rem;color:var(--rose-dark);margin-top:4px;line-height:1.5">' + (typeof t === 'function' ? t('sleepLateMsg') : '') + '</div></div>';
      }
      document.getElementById('sleepAngieContent').innerHTML = '<div style="text-align:center"><span style="font-size:2rem">\u{1F634}</span><div style="font-size:.78rem;color:var(--text);margin-top:4px">' + (typeof t === 'function' ? t('sleepLabel') : '') + ' <b>' + s.time + '</b></div><div style="font-size:.62rem;color:var(--text-muted)">' + s.date + '</div></div>' + lateMsg;
    }
  }
  window.renderSleepCard = renderSleepCard;
})();

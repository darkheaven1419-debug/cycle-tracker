/* render-settings.js — Settings page, import/export, onboarding — extracted from app.js v7.1 */
/* eslint-disable no-unused-vars */

function exportAllData() {
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    exportedBy: activeProfile,
    diary: JSON.parse(localStorage.getItem('shared-diary') || '{}'),
    learningProgress: JSON.parse(localStorage.getItem('shared-learning-progress') || '{}'),
    learningComments: JSON.parse(localStorage.getItem('shared-learning-comments') || '[]'),
    learningPoints: JSON.parse(localStorage.getItem('shared-learning-points') || '{}'),
    voiceData: JSON.parse(localStorage.getItem('shared-voice-data') || '{}'),
    sunCounter: JSON.parse(localStorage.getItem('shared-sun-counter') || '{}'),
    settings: { activeProfile: activeProfile, lang: lang, theme: theme },
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'andjelin-ciklus-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('📦 ' + L('Podaci izvezeni!', 'Data exported!', '数据已导出！'));
}
function importAllData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function (e) {
    const file = e.target.files[0];
    if (!file) return;
    if (
      !confirm(
        L('Ovo ce PREBRISATI sve trenutne podatke. Nastaviti?', 'This will OVERWRITE all current data. Continue?', '此操作将覆盖所有当前数据，是否继续？')
      )
    )
      {return;}
    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        const backup = JSON.parse(ev.target.result);
        if (backup.diary) localStorage.setItem('shared-diary', JSON.stringify(backup.diary));
        if (backup.learningProgress) localStorage.setItem('shared-learning-progress', JSON.stringify(backup.learningProgress));
        if (backup.learningComments) localStorage.setItem('shared-learning-comments', JSON.stringify(backup.learningComments));
        if (backup.learningPoints) localStorage.setItem('shared-learning-points', JSON.stringify(backup.learningPoints));
        if (backup.voiceData) localStorage.setItem('shared-voice-data', JSON.stringify(backup.voiceData));
        if (backup.settings) {
          if (backup.settings.lang) {
            lang = backup.settings.lang;
            setLang(lang);
          }
          if (backup.settings.theme) {
            theme = backup.settings.theme;
            applyTheme(theme);
          }
        }
        pushAllSharedData();
        toast('✅ ' + L('Podaci vraceni! Osvezavanje...', 'Data restored! Refreshing...', '数据已恢复！刷新中...'));
        setTimeout(function () {
          location.reload();
        }, 1500);
      } catch (e) {
        toast('❌ ' + L('Neispravan fajl', 'Invalid file', '无效文件'));
      }
    };
    reader.readAsText(file);
  };
  input.click();
}
function saveAnniversaries() {
  annDateMet = document.getElementById('annDateMet').value;
  annDateLove = document.getElementById('annDateLove').value;
  localStorage.setItem('cycle-ann-met', annDateMet);
  localStorage.setItem('cycle-ann-love', annDateLove);
  updateAnniversaryCount();
  renderCalendar();
}
function saveGitHubToken() {
  const t = document.getElementById('set-gh-token').value.trim();
  const warning = document.getElementById('tokenSecurityWarning');
  if (t) {
    sessionStorage.setItem('gh-token', t);
    toast('🔑 Token sacuvan');
    if (warning) warning.style.display = '';
    pullAllSharedData().then(function () {
      updateSyncStatusBadge();
      renderAll();
    });
  } else {
    sessionStorage.removeItem('gh-token');
    if (warning) warning.style.display = 'none';
    updateSyncStatusBadge();
  }
}
async function testGitHubToken() {
  const btn = document.getElementById('testTokenBtn');
  if (!btn) return;
  const origText = btn.textContent;
  btn.disabled = true;
  btn.textContent = '⏳ Testiranje...';
  const token = getGitHubToken();
  if (!token) {
    toast('🔑 ' + L('Prvo unesi token', 'Enter a token first', '请先输入 Token'));
    btn.textContent = origText;
    btn.disabled = false;
    return;
  }
  try {
    const resp = await fetch('https://api.github.com/user', { headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github.v3+json' } });
    if (resp.ok) {
      const user = await resp.json();
      toast('✅ ' + L('Token vazi - ' + user.login, 'Token valid - ' + user.login, 'Token 有效 - ' + user.login));
      btn.textContent = '✅ Vazi';
      setTimeout(function () {
        btn.textContent = origText;
        btn.disabled = false;
      }, 3000);
    } else if (resp.status === 401) {
      toast('❌ ' + L('Token nevazeci - generisi novi', 'Token invalid - generate a new one', 'Token 无效 - 请重新生成'));
      btn.textContent = '❌ Nevazeci';
      setTimeout(function () {
        btn.textContent = origText;
        btn.disabled = false;
      }, 3000);
    } else {
      toast('⚠️ ' + L('Greska: ' + resp.status, 'Error: ' + resp.status, '错误: ' + resp.status));
      btn.textContent = origText;
      btn.disabled = false;
    }
  } catch (e) {
    toast('⚠️ ' + L('Mrezna greska', 'Network error', '网络错误'));
    btn.textContent = origText;
    btn.disabled = false;
  }
}
function clearGitHubToken() {
  if (!getGitHubToken()) return;
  if (!confirm(L('Obrisati GitHub token? Sinhronizacija ce prestati.', 'Clear GitHub token? Sync will stop.', '清除 GitHub Token？同步将停止。'))) return;
  sessionStorage.removeItem('gh-token');
  document.getElementById('set-gh-token').value = '';
  const warning = document.getElementById('tokenSecurityWarning');
  if (warning) warning.style.display = 'none';
  updateSyncStatusBadge();
  toast('🗑️ ' + L('Token obrisan', 'Token cleared', 'Token 已清除'));
}
function loadSettingsUI() {
  document.getElementById('set-cycle').value = state.settings.cycleLength;
  document.getElementById('set-period').value = state.settings.periodLength;
  document.getElementById('set-language').value = lang;
  document.getElementById('set-theme').value = theme;
  document.getElementById('annDateMet').value = annDateMet;
  document.getElementById('annDateLove').value = annDateLove;
  const hasToken = !!getGitHubToken();
  document.getElementById('set-gh-token').value = getGitHubToken();
  document.getElementById('set-gh-token').placeholder = 'ghp_...';
  document.getElementById('set-h-token').textContent = hasToken ? t('settingsTokenHintEnabled') : t('settingsTokenHintDisabled');
  const warning = document.getElementById('tokenSecurityWarning');
  if (warning) warning.style.display = hasToken ? '' : 'none';
  updateAnniversaryCount();
  updateSyncStatusBadge();
}
function saveSettings() {
  state.settings.cycleLength = parseInt(document.getElementById('set-cycle').value) || 28;
  state.settings.periodLength = parseInt(document.getElementById('set-period').value) || 7;
  saveState();
  renderAll(['calendar', 'core']);
  toast(t('toast.saved'));
}
function exportData() {
  const blob = new Blob(
    [
      JSON.stringify(
        { records: state.records.map(fmtDate), symptoms: state.symptoms, moods: state.moods || {}, diaries: state.diaries || {}, settings: state.settings },
        null,
        2
      ),
    ],
    { type: 'application/json' }
  );
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'andjelin-ciklus-' + activeProfile + '-' + fmtDate(new Date()) + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
  toast(t('toast.exported'));
}
function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function () {
    try {
      const d = JSON.parse(reader.result);
      if (!d.records || !Array.isArray(d.records)) throw new Error('Invalid format');
      state.records = d.records
        .map(function (r) {
          const dt = new Date(r);
          return isNaN(dt.getTime()) ? null : dt;
        })
        .filter(Boolean);
      if (state.records.length === 0 && d.records.length > 0) throw new Error('No valid dates');
      state.symptoms = d.symptoms || {};
      state.moods = d.moods || {};
      state.diaries = d.diaries || {};
      state.settings = { cycleLength: 28, periodLength: 7, manualOverride: false };
      if (d.settings) {
        Object.keys(d.settings).forEach(function (k) {
          state.settings[k] = d.settings[k];
        });
      }
      saveState();
      renderAll();
      updateFab();
      toast(t('toast.imported'));
    } catch (err) {
      toast(t('toast.importError'));
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}
function clearAllData() {
  if (!confirm(t('settings.clearConfirm'))) return;
  state = { records: [], symptoms: {}, moods: {}, diaries: {}, settings: { cycleLength: 28, periodLength: 7, manualOverride: false }, _migrated: true };
  saveState();
  renderAll();
  updateFab();
  toast(t('toast.cleared'));
}
function dismissOnboarding() {
  document.getElementById('onboardingBanner').style.display = 'none';
  localStorage.setItem('cycle-ob-dismissed', '1');
}
function showOnboardingIfNeeded() {
  if (activeProfile === 'andjela' && state.records.length === 0 && !localStorage.getItem('cycle-ob-dismissed')) {
    document.getElementById('onboardingBanner').style.display = 'flex';
    document.getElementById('ob-text').textContent = t('onboarding');
  }
}

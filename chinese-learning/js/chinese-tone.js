/* chinese-tone.js — V1.1 声调练习（Tone Drill）MVP
 * 8 题听音辨调：播放「已学过范围内」的单字词中文 TTS → 判断是第几声。
 * 纯静态小工具：不新增导航/课程/数据；不算「完成一课」；不写 localStorage/progress。
 * 复用：_() 三语、LESSONS_DATA、getProgress()、window._ensureChineseVoice() + speechSynthesis。
 * 架构：会话状态存模块级 _tone（语言切换/视图重渲染不丢）；
 *       UI 为 body 级 modal 悬浮层 → 与 lrnStepContent 重渲染隔离，切 tab/切语言只刷文案。
 * 无中文 voice / 无 speechSynthesis → 自动降级为「看拼音辨调」自检模式，不白屏不死页。
 * 导出(window)：openToneDrill / closeToneDrill / restartToneDrill / toneChooseTone /
 *        toneNextQ / toneReplay / toneReveal / toneOnLangSwitch / toneGetState /
 *        toneOf / unmarkTone / buildToneQuestions / buildRound / toneWordInfo
 */

/* ================= 纯函数：声调符号 ↔ 调号 ================= */
var TONE_NUM = { ā:1, á:2, ǎ:3, à:4, ē:1, é:2, ě:3, è:4, ī:1, í:2, ǐ:3, ì:4, ō:1, ó:2, ǒ:3, ò:4, ū:1, ú:2, ǔ:3, ù:4, ǖ:1, ǘ:2, ǚ:3, ǜ:4 };
var TONE_BASE = { ā:'a', á:'a', ǎ:'a', à:'a', ē:'e', é:'e', ě:'e', è:'e', ī:'i', í:'i', ǐ:'i', ì:'i', ō:'o', ó:'o', ǒ:'o', ò:'o', ū:'u', ú:'u', ǔ:'u', ù:'u', ǖ:'ü', ǘ:'ü', ǚ:'ü', ǜ:'ü' };
var TONE_GLYPH = { 1:'ā', 2:'á', 3:'ǎ', 4:'à' };

// 返回 py 中最后一个带调元音的调号（1-4）；无任何调号（含轻声/纯音素）→ null
function toneOf(py) {
  if (py === null || py === undefined) return null;
  var s = String(py).trim();
  if (!s) return null;
  var t = null;
  for (var i = 0; i < s.length; i++) {
    var c = TONE_NUM[s.charAt(i)];
    if (c !== undefined) t = c;
  }
  return t;
}

// 去掉全部调号 → 纯拼音（降级「看拼音辨调」模式用）
function unmarkTone(py) {
  if (py === null || py === undefined) return '';
  var s = String(py), out = '';
  for (var i = 0; i < s.length; i++) {
    var b = TONE_BASE[s.charAt(i)];
    out += b !== undefined ? b : s.charAt(i);
  }
  return out;
}

// 声调方向：每声三语标签（与 L6 grammar 方向概念一致）
var TONE_DIR = {
  1: { zh: '高平', sr: 'visok', en: 'high level' },
  2: { zh: '上扬', sr: 'uzlazni', en: 'rising' },
  3: { zh: '先降后升', sr: 'silaz.-uzlaz.', en: 'fall-rise' },
  4: { zh: '下降', sr: 'silazni', en: 'falling' }
};

/* ================= 题池（纯函数） ================= */
// 从已排序候选词挑 round 个（默认 8）：先保证 1/2/3/4 声各 ≥1（池够时），再轮转补满；同 zh 不重复。
// 候选序：已学范围（lesson ≤ lessonId）在前 → 补充（reserve）在后 → 优先出「已学过的词」。
// 返回 [{zh,py,sr,tone,fromReserve}]（fromReserve 标记是否来自未学范围）
function buildToneQuestions(orderedWords, opts) {
  opts = opts || {};
  var round = opts.round || 8;
  var bucket = { 1: [], 2: [], 3: [], 4: [] };
  var seen = {};
  for (var i = 0; i < orderedWords.length; i++) {
    var w = orderedWords[i];
    if (!w || !w.zh || seen[w.zh] || !w.tone || !bucket[w.tone]) continue;
    seen[w.zh] = 1;
    bucket[w.tone].push(w);
  }
  var picks = [];
  // 1) 四声各先取一（保声调覆盖）
  for (var t = 1; t <= 4; t++) if (bucket[t].length) picks.push(bucket[t].shift());
  // 2) 轮转补满到 round（仍按入桶序 → 已学优先）
  var ti = 0;
  while (picks.length < round) {
    var hasAny = false;
    for (var k = 1; k <= 4; k++) if (bucket[k].length) { hasAny = true; break; }
    if (!hasAny) break;                       // 池已空，有多少出多少
    var tt = (ti % 4) + 1; ti++;
    if (bucket[tt] && bucket[tt].length) picks.push(bucket[tt].shift());
  }
  var out = [];
  for (var j = 0; j < picks.length; j++) {
    var p = picks[j];
    out.push({ zh: p.zh, py: p.py, sr: p.sr || '', tone: p.tone, fromReserve: !!p.fromReserve });
  }
  return out;
}

// 判定某词是否「单字单音节可辨调」：1 个汉字、拼音无空格、能解析出调号（轻声/无调排除）
function toneWordInfo(w) {
  if (!w || !w.zh || !w.py) return null;
  if (String(w.zh).length !== 1) return null;          // 仅单字词
  if (String(w.py).indexOf(' ') >= 0) return null;     // 仅单音节
  var t = toneOf(w.py);
  if (!t) return null;                                 // 轻声/无调排除
  return { zh: w.zh, py: String(w.py), sr: w.sr || '', tone: t };
}

/* ================= 数据来源 ================= */
function _lessons() {
  var arr = [];
  try { if (typeof LESSONS_DATA !== 'undefined' && LESSONS_DATA && LESSONS_DATA.length) arr = LESSONS_DATA; } catch (e) { /* noop */ }
  return arr;
}
function _lang() { return (typeof lang !== 'undefined' && lang) || (window.lang) || 'sr'; }

// 全量可辨调单字池：{items:[已学在前、未学在后], meta:{primary,reserve}}
function getToneQuestionPool(lessonId) {
  var lessons = _lessons();
  var primary = [], reserve = [];
  for (var i = 0; i < lessons.length; i++) {
    var l = lessons[i];
    if (!l || !l.id || !l.words) continue;
    var target = l.id <= lessonId ? primary : reserve;
    for (var j = 0; j < l.words.length; j++) {
      var info = toneWordInfo(l.words[j]);
      if (info) target.push({ zh: info.zh, py: info.py, sr: info.sr, tone: info.tone, fromReserve: l.id > lessonId });
    }
  }
  return { items: primary.concat(reserve), meta: { primary: primary.length, reserve: reserve.length, lessonId: lessonId } };
}

// 组一轮题：scope=lessonId（已学范围 = lesson ≤ lessonId）
function buildRound(lessonId, round) {
  var pool = getToneQuestionPool(lessonId || 1);
  return buildToneQuestions(pool.items, { round: round || 8 });
}

/* ================= 会话状态（模块级 → 语言切换/重渲染不丢） ================= */
var _tone = { open: false, lessonId: 1, voice: null, visualOnly: false, questions: [], qi: 0, correct: 0, perQ: [], done: false };

function _resetRound(questions, lessonId) {
  _tone.open = true; _tone.lessonId = lessonId; _tone.questions = questions;
  _tone.qi = 0; _tone.correct = 0; _tone.done = false; _tone.perQ = [];
  for (var i = 0; i < questions.length; i++) _tone.perQ.push({ chosen: null, revealed: false });
}

/* ================= 语音 ================= */
function _speak(zh, onend) {
  if (!_tone.voice || !window.speechSynthesis) return false;
  try { window.speechSynthesis.cancel(); } catch (e) { /* noop */ }
  var u;
  try { u = new SpeechSynthesisUtterance(zh); } catch (e) { return false; }
  if (!u) return false;
  u.lang = 'zh-CN'; u.rate = 0.6; u.volume = 1;
  var vs = []; try { vs = window.speechSynthesis.getVoices() || []; } catch (e) { /* noop */ }
  var v = null;
  for (var i = 0; i < vs.length; i++) { if (vs[i] && vs[i].lang === 'zh-CN') { v = vs[i]; break; } }
  if (!v) for (var j = 0; j < vs.length; j++) { if (vs[j] && vs[j].lang && vs[j].lang.indexOf('zh') === 0) { v = vs[j]; break; } }
  if (v) u.voice = v;
  if (typeof onend === 'function') { u.onend = onend; u.onerror = onend; }
  try { window.speechSynthesis.speak(u); return true; } catch (e) { return false; }
}
function _playCurrent() { var q = _tone.questions[_tone.qi]; if (q) _speak(q.zh); }

/* ================= 样式与外壳 ================= */
function _ensureStyle() {
  if (document.getElementById('lrn-tone-style')) return;
  var st = document.createElement('style');
  st.id = 'lrn-tone-style';
  st.textContent = [
    '.lrn-tone-mask{position:fixed;inset:0;z-index:9999;background:rgba(40,30,24,.5);display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box}',
    '.lrn-tone-card{background:#fffdf8;color:#3a2f2a;width:100%;max-width:430px;max-height:94vh;overflow-y:auto;-webkit-overflow-scrolling:touch;border-radius:20px;padding:16px 14px;box-sizing:border-box;box-shadow:0 16px 48px rgba(0,0,0,.3);font-family:inherit}',
    '.lrn-tone-head{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:8px}',
    '.lrn-tone-title{font-size:.88rem;font-weight:800}',
    '.lrn-tone-close{background:none;border:none;font-size:1rem;color:#9a8a80;min-width:44px;min-height:44px;cursor:pointer}',
    '.lrn-tone-ref{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:4px 0 12px}',
    '.lrn-tone-refc{background:#f0ece4;border-radius:12px;text-align:center;padding:6px 2px}',
    '.lrn-tone-refc b{font-size:1.3rem;display:block;line-height:1.2}',
    '.lrn-tone-refc span{font-size:.58rem;color:#8a7a70;display:block;line-height:1.3;margin-top:1px}',
    '.lrn-tone-q{text-align:center;padding:4px 0 2px}',
    '.lrn-tone-word{font-size:3.4rem;line-height:1.15;margin:2px 0}',
    '.lrn-tone-pynote{font-size:.95rem;color:#8a7a70}',
    '.lrn-tone-sr{font-size:.72rem;color:#8a7a70;margin-top:3px}',
    '.lrn-tone-ask{font-size:.8rem;font-weight:700;margin:10px 0 10px}',
    '.lrn-tone-opts{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px}',
    '.lrn-tone-opt{min-height:64px;border-radius:14px;border:2px solid rgba(0,0,0,.08);background:#fff;font-size:1.6rem;font-weight:800;color:#3a2f2a;cursor:pointer;box-sizing:border-box}',
    '.lrn-tone-opt small{display:block;font-size:.62rem;font-weight:600;color:#8a7a70}',
    '.lrn-tone-opt:disabled{opacity:.5;cursor:default}',
    '.lrn-tone-opt.ok{border-color:#6c9a6c;background:#eef4ea}',
    '.lrn-tone-opt.bad{border-color:#c9716b;background:#fbeae8}',
    '.lrn-tone-fb{border-radius:13px;padding:9px 10px;margin:2px 0 10px;text-align:center;box-sizing:border-box}',
    '.lrn-tone-fb.good{background:#eef4ea}.lrn-tone-fb.badf{background:#fbeae8}',
    '.lrn-tone-fb .fb-word{font-size:1.6rem;font-weight:800}',
    '.lrn-tone-fb .fb-line{font-size:.7rem;color:#8a7a70;margin-top:2px}',
    '.lrn-tone-foot{display:flex;gap:8px;align-items:stretch}',
    '.lrn-tone-replay,.lrn-tone-next,.lrn-tone-reveal{flex:1;min-height:50px;border-radius:14px;font-size:.8rem;font-weight:700;cursor:pointer;box-sizing:border-box}',
    '.lrn-tone-replay{border:2px solid rgba(0,0,0,.08);background:#fff;color:#3a2f2a}',
    '.lrn-tone-reveal{border:2px solid rgba(0,0,0,.08);background:#fff;color:#3a2f2a}',
    '.lrn-tone-next{border:none;background:linear-gradient(135deg,#d99b8f,#7aa874);color:#fff}',
    '.lrn-tone-next:disabled{opacity:.4}',
    '.lrn-tone-degrade{font-size:.62rem;color:#8a7a70;text-align:center;margin-bottom:6px}',
    '.lrn-tone-resemoji{font-size:2.6rem;line-height:1.3}',
    '@media(max-width:360px){.lrn-tone-card{padding:12px 10px}.lrn-tone-refc b{font-size:1.1rem}.lrn-tone-word{font-size:2.9rem}.lrn-tone-opt{min-height:58px;font-size:1.4rem}}'
  ].join('');
  document.head.appendChild(st);
}
function _host() { return document.getElementById('lrn-tone-overlay'); }
function _openHost() {
  _ensureStyle();
  var host = _host();
  if (!host) { host = document.createElement('div'); host.id = 'lrn-tone-overlay'; document.body.appendChild(host); }
  return host;
}

function _dirLabel(t) { var d = TONE_DIR[t]; return d ? _(d.zh, d.sr, d.en) : ''; }

/* ================= 渲染：答题卡 ================= */
function _render() {
  var host = _openHost(); if (!host) return;
  if (_tone.done || _tone.qi >= _tone.questions.length) { _renderResult(); return; }
  var q = _tone.questions[_tone.qi], st = _tone.perQ[_tone.qi], n = _tone.questions.length;
  var answered = st.chosen !== null, revealed = !answered && st.revealed;
  var label = _('声调练习', 'Vežbanje tonova', 'Tone Drill');
  var head = '<div class="lrn-tone-head"><span class="lrn-tone-title">🎵 ' + label + '</span>' +
    '<span style="font-size:.68rem;color:#8a7a70">' + (_tone.qi + 1) + '/' + n + ' · ' +
    _('答对', 'tačno', 'right') + ' ' + _tone.correct + '</span>' +
    '<button class="lrn-tone-close" onclick="closeToneDrill()" aria-label="' + _('关闭', 'Zatvori', 'Close') + '">✕</button></div>';
  // 参照条：声调符号 + 编号 + 简短方向提示（始终显示）
  var ref = '<div class="lrn-tone-ref">';
  for (var t = 1; t <= 4; t++) ref += '<div class="lrn-tone-refc"><b>' + TONE_GLYPH[t] + '</b><span>' + t + ' · ' + _dirLabel(t) + '</span></div>';
  ref += '</div>';
  var degrade = _tone.visualOnly
    ? '<div class="lrn-tone-degrade">🔇 ' + _('音频不可用 — 看拼音练辨调', 'Audio nije dostupan — vežba čitanjem tona', 'Audio off — read-the-tone mode') + '</div>'
    : '';
  var wordBlock;
  if (_tone.visualOnly) {                                     // 视觉自检：露出无调拼音
    wordBlock = '<div class="lrn-tone-word">' + q.zh + '</div><div class="lrn-tone-pynote">' + unmarkTone(q.py) + '</div><div class="lrn-tone-sr">' + q.sr + '</div>';
  } else {                                                     // 听音辨调：只露汉字+释义，不泄调
    wordBlock = '<div class="lrn-tone-word">' + q.zh + '</div><div class="lrn-tone-sr">' + q.sr + '</div>';
  }
  var ask = '<div class="lrn-tone-ask">' + _('这是第几声？', 'Koji je ovo ton?', 'Which tone?') + '</div>';
  var opts = '<div class="lrn-tone-opts">';
  for (var o = 1; o <= 4; o++) {
    var cls = 'lrn-tone-opt', dis = '';
    if (answered) { dis = ' disabled'; if (o === q.tone) cls += ' ok'; else if (o === st.chosen) cls += ' bad'; }
    opts += '<button class="' + cls + '"' + dis + ' onclick="toneChooseTone(' + o + ')"><small>' + TONE_GLYPH[o] + '</small>' + o + '</button>';
  }
  opts += '</div>';
  // 反馈：拼音 + 声调数字 + 带调拼音 + 方向
  var fb = '';
  var wordStr = '<span class="fb-word">' + q.zh + '</span> <span style="font-size:1.02rem">' + q.py + '</span> <span style="font-weight:800;color:#3a2f2a">' + q.tone + '</span>';
  var dirStr = '· ' + _dirLabel(q.tone) + (q.sr ? ' · ' + q.sr : '');
  if (answered) {
    fb = st.right
      ? '<div class="lrn-tone-fb good">✅ ' + _('对！', 'Tačno!', 'Right!') + '<br>' + wordStr + '<div class="fb-line">' + dirStr + '</div></div>'
      : '<div class="lrn-tone-fb badf">❌ ' + _('不对 — 是第', 'Nije tačno — to je ', 'Not quite — it\'s tone ') + q.tone + _('声', '. ton', '') + '<br>' + wordStr + '<div class="fb-line">' + dirStr + '</div></div>';
  } else if (revealed) {
    fb = '<div class="lrn-tone-fb badf">👁 ' + _('答案：第', 'Odgovor: ', 'Answer: tone ') + q.tone + _('声', '. ton', '') + '<br>' + wordStr + '<div class="fb-line">' + dirStr + '</div></div>';
  }
  var replay = _tone.visualOnly ? '' : '<button class="lrn-tone-replay" onclick="toneReplay()">🔁 ' + _('再听一次', 'Poslušaj ponovo', 'Listen again') + '</button>';
  var nextLabel = (_tone.qi + 1 >= n) ? _('看结果', 'Rezultat', 'Result') : _('下一题 ▶', 'Sledeće ▶', 'Next ▶');
  var next = '<button class="lrn-tone-next"' + ((answered || revealed) ? '' : ' disabled') + ' onclick="toneNextQ()">' + nextLabel + '</button>';
  var revealBtn = (answered || revealed || _tone.visualOnly) ? '' : '<button class="lrn-tone-reveal" onclick="toneReveal()">👁 ' + _('看答案', 'Odgovor', 'Answer') + '</button>';
  var foot = '<div class="lrn-tone-foot">' + replay + revealBtn + next + '</div>';
  host.innerHTML = '<div class="lrn-tone-mask" onclick="if(event.target===this)closeToneDrill()"><div class="lrn-tone-card">' + head + ref + degrade +
    '<div class="lrn-tone-q">' + wordBlock + ask + '</div>' + opts + fb + foot + '</div></div>';
  // 未作答且非视觉模式 → 自动播放本题
  if (!answered && !_tone.visualOnly && _tone.voice) { try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) { /* noop */ } _playCurrent(); }
}

/* ================= 渲染：结果卡 ================= */
function _renderResult() {
  _tone.done = true;
  var host = _openHost(); if (!host) return;
  var n = _tone.questions.length || 1, pct = Math.round(_tone.correct / n * 100);
  var emoji = pct >= 90 ? '🌟' : pct >= 70 ? '👍' : pct >= 50 ? '💪' : '🌱';
  var praise = pct >= 90 ? _('太棒了！声调已经很清楚啦', 'Odlično! Tonovi ti sad idu sjajno', 'Excellent — tones are clicking!')
    : pct >= 70 ? _('很好！再多练几次更稳', 'Vrlo dobro! Još malo i biće savršeno', 'Great! A bit more and it\'s solid')
    : pct >= 50 ? _('不错！继续练会越来越准', 'Dobro! Nastavi — biće sve tačnije', 'Good start — keep going!')
    : _('多听几遍就会更准，再来一轮吧', 'Poslušaj još koju rundu — ideja je da uho navikneš', 'Ears need reps — try again!');
  var head = '<div class="lrn-tone-head"><span class="lrn-tone-title">🎵 ' + _('本回合结束', 'Kraj runde', 'Round done') + '</span><button class="lrn-tone-close" onclick="closeToneDrill()">✕</button></div>';
  var body = '<div style="text-align:center;padding:8px 0 2px"><div class="lrn-tone-resemoji">' + emoji + '</div>' +
    '<div style="font-size:2rem;font-weight:800;line-height:1.3">' + _tone.correct + ' / ' + n + '</div>' +
    '<div style="font-size:.76rem;color:#8a7a70;margin-bottom:4px">' + pct + '% · ' + _('正确', 'tačno', 'correct') + '</div>' +
    '<div style="font-size:.8rem;font-weight:700;margin:2px auto 10px;max-width:300px">' + praise + '</div></div>';
  var btn = '<button class="lrn-tone-next" style="width:100%;margin-top:2px" onclick="restartToneDrill()">🔄 ' + _('再练一轮', 'Još jedna runda', 'Another round') + '</button>' +
    '<button class="lrn-tone-replay" style="width:100%;margin-top:8px" onclick="closeToneDrill()">' + _('完成', 'Zatvori', 'Done') + '</button>';
  host.innerHTML = '<div class="lrn-tone-mask"><div class="lrn-tone-card">' + head + body + btn + '</div></div>';
}

/* ================= 交互 ================= */
function openToneDrill(lessonId) {
  lessonId = lessonId || 1;
  var questions = buildRound(lessonId, 8);
  if (!questions.length) {
    if (typeof toast === 'function') toast(_('暂无可用声调词', 'Nema reči sa tonom', 'No tone words yet'));
    return;
  }
  _resetRound(questions, lessonId);
  _tone.voice = null; _tone.visualOnly = false;
  _render();
  // 语音可用性探测（异步；结果决定 audio / visual 模式，不阻塞、不白屏）
  var ensure = (typeof window._ensureChineseVoice === 'function') ? window._ensureChineseVoice() : false;
  if (ensure && typeof ensure.then === 'function') {
    ensure.then(function (ok) {
      if (!_tone.open) return;
      _tone.voice = !!ok; _tone.visualOnly = !ok; _render();
    });
  } else { _tone.voice = !!ensure; _tone.visualOnly = !ensure; _render(); }
}
function restartToneDrill() { var lid = _tone.lessonId || 1; closeToneDrill(); openToneDrill(lid); }
function closeToneDrill() {
  _tone.open = false;
  try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) { /* noop */ }
  var host = _host(); if (host && host.parentNode) host.parentNode.removeChild(host);
}
function toneChooseTone(t) {
  if (!_tone.open || _tone.done) return;
  var i = _tone.qi, st = _tone.perQ[i];
  if (!st || st.chosen !== null) return;
  var q = _tone.questions[i];
  st.chosen = t; st.right = (t === q.tone);
  if (st.right) _tone.correct++;
  _render();
  if (!st.right && _tone.voice) setTimeout(function () { if (_tone.open && !_tone.done) _playCurrent(); }, 500);  // 答错自动重播一次
}
function toneNextQ() {
  if (!_tone.open) return;
  var st = _tone.perQ[_tone.qi];
  if (st && st.chosen === null && !st.revealed) return;
  if (_tone.qi + 1 >= _tone.questions.length) { _renderResult(); return; }
  _tone.qi++; _render();
}
function toneReplay() { if (_tone.open && !_tone.done && !_tone.visualOnly) _playCurrent(); }
function toneReveal() {
  if (!_tone.open || _tone.done) return;
  var st = _tone.perQ[_tone.qi]; if (!st || st.chosen !== null) return;
  st.revealed = true; _render();
}
function toneGetState() {
  var answered = 0;
  for (var i = 0; i < _tone.perQ.length; i++) if (_tone.perQ[i].chosen !== null || _tone.perQ[i].revealed) answered++;
  return { open: _tone.open, lessonId: _tone.lessonId, voice: _tone.voice, visualOnly: _tone.visualOnly,
    qi: _tone.qi, total: _tone.questions.length, correct: _tone.correct, done: _tone.done, answered: answered,
    questions: _tone.questions.slice() };
}
// 语言切换 hook：保留会话与当前题，仅刷新文案
function toneOnLangSwitch() { if (_tone.open) _render(); }

/* ================= 导出 ================= */
window.openToneDrill = openToneDrill;
window.closeToneDrill = closeToneDrill;
window.restartToneDrill = restartToneDrill;
window.toneChooseTone = toneChooseTone;
window.toneNextQ = toneNextQ;
window.toneReplay = toneReplay;
window.toneReveal = toneReveal;
window.toneOnLangSwitch = toneOnLangSwitch;
window.toneGetState = toneGetState;
window.toneOf = toneOf;
window.unmarkTone = unmarkTone;
window.buildToneQuestions = buildToneQuestions;
window.buildRound = buildRound;
window.toneWordInfo = toneWordInfo;
window.getToneQuestionPool = getToneQuestionPool;

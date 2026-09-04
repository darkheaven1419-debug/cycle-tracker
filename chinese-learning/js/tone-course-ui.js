/* =========================================================================
 * tone-course-ui.js — Zero Beginner Tone Curriculum（Faza 0）课程 UI / 状态机 / 声音
 * =========================================================================
 * 依赖：window.tc* 引擎函数（js/tone-course.js）已加载；语言取 window.lang（bootstrap 维护）。
 * 分工：本文件负责「怎么练」——渲染、步骤推进、播放/重听、自报、回合状态；
 *      课程内容/文案/示例/step 全部来自 data/tone-course.json（数据驱动）。
 * 原则：数据驱动（data/tone-course.json）；isTone 二元「是否目标声」不需命名非目标声；
 *      whichTone 轴只含已正式教过的声 + 本课目标声；一课可含多个 check 步（跨步累积判分）。
 * 声音：无麦克风朗读仅自报；无中文 voice → 明确视觉模式提示，绝不假装已播放（隐藏播放钮）。
 * ========================================================================= */
(function () {
  'use strict';

  /* ---------------- UI 动词（三语；课程文案在 JSON） ---------------- */
  var T = {
    next:      { zh: '继续', sr: 'Dalje', en: 'Next' },
    replay:    { zh: '🔁 再听一次', sr: '🔁 Pusti ponovo', en: '🔁 Play again' },
    play:      { zh: '🔊 播放', sr: '🔊 Pusti', en: '🔊 Play' },
    playStd:   { zh: '🔊 先听标准读法', sr: '🔊 Prvo poslušaj kako zvuči', en: '🔊 First hear it' },
    close:     { zh: '关闭', sr: 'Zatvori', en: 'Close' },
    correct:   { zh: '✓ 对！', sr: '✓ Tačno!', en: '✓ Correct!' },
    wrong:     { zh: '✗ 不是这个', sr: '✗ To nije to', en: '✗ Not that one' },
    yesPre:    { zh: '✓ 是——', sr: '✓ Da — ', en: '✓ Yes — ' },
    notIt:     { zh: '不是', sr: 'Nije', en: 'Not it' },
    mimicLike: { zh: '😊 像', sr: '😊 Zvuči slično', en: '😊 Sounds like it' },
    mimicNo:   { zh: '🤔 不太像', sr: '🤔 Ne baš', en: '🤔 Not really' },
    mimicAck:  { zh: '收到——多听多说就会越来越顺。', sr: 'Zabeleženo — slušanjem i ponavljanjem ide sve bolje.', en: 'Got it — listening & repeating will make it click.' },
    mimicHint: { zh: '先听，再自己读一遍。', sr: 'Prvo poslušaj, pa ponovi naglas.', en: 'Listen first, then say it out loud.' },
    visualOnly:{ zh: '🔇 这台设备不能播放中文声音 —— 先看曲线和记号来学。', sr: '🔇 Ovaj uređaj ne može da reprodukuje kineski zvuk — uči prateći liniju i znak.', en: '🔇 This device can’t play Chinese audio — learn by the curve & mark.' },
    great:     { zh: '做得好！', sr: 'Odlično!', en: 'Great!' },
    warm:      { zh: '想再练也可以，不急。', sr: 'Ako želiš, možeš ponoviti — bez žurbe.', en: 'Practice again anytime you like — no rush.' },
    nowT1:     { zh: '你现在认识第一声了：又高又平的 ā。', sr: 'Sada znaš prvi ton — visok i ravan ā.', en: 'You now know Tone 1 — the high, level ā.' },
    conceptDone:{ zh: '你已经听过四种声音了——接下来去学第一声。', sr: 'Čula si sva četiri tona — sledeće: prvi ton.', en: 'You’ve heard all four tones — next up: Tone 1.' },
    finish:    { zh: '完成', sr: 'Završi', en: 'Done' },
    retry:     { zh: '再练一次', sr: 'Vežbaj ponovo', en: 'Try again' },
    nextLsn:   { zh: '下一课', sr: 'Sledeća lekcija', en: 'Next lesson' }
  };
  function L(key) { var o = T[key]; return (o && (o[langKey()] || o.en || o.zh)) || key; }
  function lang() { return (typeof window.lang === 'string' && window.lang) ? window.lang : 'sr'; }
  /* 语言归一：站点 window.lang 可为 'zh-CN'；课程文案/声调文案 key 用 {zh,sr,en} → 归一到 zh。
   * 只在本模块取词处使用；不动 window.lang，也不影响 faza0-home 的 'zh-CN' 键判断。 */
  function langKey() {
    var l = lang();
    if (l === 'en') return 'en';
    return (typeof l === 'string' && l.indexOf('zh') === 0) ? 'zh' : 'sr';
  }
  function _tri(o) { return o ? (o[langKey()] || o.en || o.zh || '') : ''; }
  function _stepKind() { var l = _lesson(); return l && l.steps[_tc.stepIdx] ? l.steps[_tc.stepIdx].kind : null; }
  function _lesson() { return (typeof window.tcLesson === 'function') ? window.tcLesson(_tc.lessonId) : null; }
  /* ---- 声调注册表辅助（label / reveal 全部来自 data 的 tones 表，不再硬编码 T1） ---- */
  function _toneMeta(tone) {
    try { if (typeof window.tcToneMeta === 'function') return window.tcToneMeta(tone); } catch (e) {}
    return null;
  }
  /* isTone 的目标声：data 里该步 tones[0]（本课建锚/对照的目标声） */
  function _isToneTarget(meta) {
    return (meta && meta.checkKind === 'isTone' && Array.isArray(meta.tones) && meta.tones.length) ? meta.tones[0] : null;
  }
  /* isTone 的「是」按钮：'✓ 是——高平' 式 = 前缀 + 该目标声的 dir（本地化） */
  function _yesLabel(targetTone) {
    var m = targetTone == null ? null : _toneMeta(targetTone);
    var dir = (m && m.dir) ? _tri(m.dir) : '';
    return L('yesPre') + dir;
  }
  /* 单语言 reveal 行（按 langKey 直接拼；byte-identical 于旧 T1 文案）：
   * isTarget=true → 刚才那是第一声（ā）。 / To je bio prvi ton (ā). / That was Tone 1 (ā).
   * isTarget=false→ 刚才那不是第一声。  / To nije bio prvi ton. / That was NOT Tone 1. */
  function _lineTxt(ordTri, glyph, isTarget) {
    var k = langKey();
    var ord = (ordTri && (ordTri[k] || ordTri.en || ordTri.zh)) || '';
    var g = glyph || '';
    if (isTarget) {
      if (k === 'zh') return '刚才那是' + ord + '（' + g + '）。';
      if (k === 'sr') return 'To je bio ' + ord + ' (' + g + ').';
      return 'That was ' + ord + ' (' + g + ').';
    }
    if (k === 'zh') return '刚才那不是' + ord + '。';
    if (k === 'sr') return 'To nije bio ' + ord + '.';
    return 'That was NOT ' + ord + '.';
  }
  /* 依据某声的 ord/glyph 生成 reveal 行 */
  function _toneLine(tone, isTarget) {
    var m = _toneMeta(tone);
    return _lineTxt(m && m.ord, m && m.glyph, isTarget);
  }

  var TCOLOR = { 1: '#d6455f', 2: '#e0922f', 3: '#3f9d6e', 4: '#3f7fd0' };

  /* ---------------- 状态 ---------------- */
  var _tc = {
    open: false, host: null, lessonId: null, stepIdx: 0,
    qOrder: [], qIdx: 0, right: 0, total: 0, lastRight: null, justAnswered: false,
    acc: { right: 0, total: 0 }, listenIdx: 0, mimicDone: false, result: null, keepOrder: false, auto: true
  };

  /* ---------------- 声音（自包含 mini；镜像 chinese-tone 惯例：zh voice、rate 0.6、无 voice→视觉） ---------------- */
  function _pickVoice() {
    try {
      var ss = window.speechSynthesis;
      if (!ss) return null;
      var vs = ss.getVoices ? ss.getVoices() : [];
      for (var i = 0; i < vs.length; i++) if ((vs[i].lang || '').toLowerCase().indexOf('zh') === 0) return vs[i];
      return null;
    } catch (e) { return null; }
  }
  function _voiceOk() { return !!_pickVoice(); }
  function _speak(text, onend) {
    try {
      var ss = window.speechSynthesis, Utter = window.SpeechSynthesisUtterance;
      if (!ss || !Utter) { if (onend) onend(); return false; }
      var u = new Utter(String(text));
      u.lang = 'zh-CN'; u.rate = 0.6; u.volume = 1;
      var v = _pickVoice(); if (v) u.voice = v;
      u.onend = function () { if (onend) onend(); };
      u.onerror = function () { if (onend) onend(); };
      ss.cancel(); ss.speak(u); return true;
    } catch (e) { if (onend) onend(); return false; }
  }
  function _playZh(zh) { if (!zh) return false; return _speak(zh, null); }

  /* ---------------- 视觉曲线（标准四声图形：1高平 / 2升 / 3低而弯的浅谷 / 4降） ---------------- */
  function _curveSVG(tone, big) {
    var w = big ? 150 : 92, h = big ? 96 : 60, pad = big ? 10 : 7;
    var c = TCOLOR[tone] || '#888';
    function Y(v) { return pad + (h - 2 * pad) * ((5 - v) / 4); }
    var seqs = { 1: [5, 5], 2: [3, 5], 3: [2, 1, 3], 4: [5, 1] };
    var s = seqs[tone] || [5, 5];
    var n = s.length, pts = [];
    for (var i = 0; i < n; i++) pts.push(((w - pad * 2) / (n - 1)) * i + pad + ',' + Y(s[i]));
    var d = pts.map(function (p, i) { return (i === 0 ? 'M' : 'L') + p; }).join(' ');
    var lastP = pts[n - 1].split(',');
    return '<svg class="tcc-curve' + (big ? ' big' : '') + '" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="ton ' + tone + '">'
      + '<line x1="' + pad + '" y1="' + (h - pad) + '" x2="' + (w - pad) + '" y2="' + (h - pad) + '" class="g"/>'
      + '<line x1="' + pad + '" y1="' + Y(5) + '" x2="' + (w - pad) + '" y2="' + Y(5) + '" class="g"/>'
      + '<path d="' + d + '" stroke="' + c + '" stroke-width="' + (big ? 5 : 3.5) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
      + '<circle cx="' + lastP[0] + '" cy="' + lastP[1] + '" r="' + (big ? 5 : 3) + '" fill="' + c + '"/>'
      + '</svg>';
  }
  function _esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* ---------------- 样式（暖纸白单张卡片；触控 ≥44；无横向溢出；正文区自滚） ---------------- */
  function _ensureStyle() {
    if (document.getElementById('tcc-style')) return;
    var st = document.createElement('style');
    st.id = 'tcc-style';
    st.innerHTML =
      '#tcc-host{position:fixed;inset:0;z-index:2147483000;background:rgba(24,28,40,.46);display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box}'
      + '#tcc-host .tcc-frame{display:flex;flex-direction:column;width:min(560px,100%);max-height:calc(100vh - 24px);background:#fffdf7;color:#23262f;border-radius:20px;box-shadow:0 18px 60px rgba(20,22,30,.35);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;overflow:hidden}'
      + '#tcc-host .tcc-head{display:flex;flex-direction:column;padding:14px 20px 4px;flex:0 0 auto}'
      + '#tcc-host .tcc-scroll{overflow-y:auto;padding:4px 20px 18px;-webkit-overflow-scrolling:touch}'
      + '#tcc-host .tcc-top{display:flex;align-items:center;gap:8px;margin-bottom:4px}'
      + '#tcc-host .tcc-course{font-size:12px;letter-spacing:.4px;color:#8a6d4a;font-weight:600;text-transform:uppercase}'
      + '#tcc-host .tcc-x{margin-left:auto;border:none;background:rgba(120,120,130,.12);color:#3a3d46;border-radius:50%;width:38px;height:38px;min-height:38px;font-size:16px;cursor:pointer}'
      + '#tcc-host .tcc-title{font-size:21px;font-weight:800;line-height:1.2;margin:2px 0 2px;color:#20242e}'
      + '#tcc-host .tcc-step{font-size:13px;color:#6b6f7c;margin-bottom:2px}'
      + '#tcc-host .tcc-body{font-size:16px;line-height:1.55;color:#343843;margin:8px 0}'
      + '#tcc-host .tcc-body li{margin:6px 0}'
      + '#tcc-host .tcc-notice{background:#fff2d8;color:#7a5616;border:1px solid #efd9a8;border-radius:12px;padding:10px 12px;font-size:13.5px;line-height:1.4;margin:8px 0}'
      + '#tcc-host .tcc-cards{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}'
      + '#tcc-host .tcc-card-t{background:#fff;border:1.5px solid #e9e2d2;border-radius:16px;padding:10px 8px;text-align:center;box-shadow:0 2px 6px rgba(30,30,40,.04)}'
      + '#tcc-host .tcc-num{display:inline-block;font-weight:800;border-radius:8px;padding:1px 8px;color:#fff;font-size:13px;margin-right:4px}'
      + '#tcc-host .tcc-glyph{font-size:30px;font-weight:800;line-height:1.1}'
      + '#tcc-host .tcc-dir{font-size:12.5px;color:#5c6170;margin-bottom:4px}'
      + '#tcc-host .tcc-word{font-size:46px;font-weight:700;line-height:1.05;color:#1c1f28}'
      + '#tcc-host .tcc-hz{font-size:18px;color:#7b6f5f;margin-top:2px}'
      + '#tcc-host .tcc-py{font-size:34px;font-weight:700;color:#1c1f28;line-height:1.15}'
      + '#tcc-host .tcc-glass{font-size:15px;color:#6f7484;margin-top:4px}'
      + '#tcc-host .tcc-focus{text-align:center;padding:14px 4px 6px}'
      + '#tcc-host .tcc-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:6px 0 4px}'
      + '#tcc-host .tcc-chip{border:1.5px solid #e4ddcc;background:#fff;border-radius:999px;padding:8px 12px;font-size:16px;min-height:44px;cursor:pointer;color:#31353f}'
      + '#tcc-host .tcc-chip.on{border-color:#3f7fd0;background:#eef5ff}'
      + '#tcc-host .tcc-nobtn{border:1px solid #e9e2d2;background:#faf7ef;border-radius:12px;padding:8px 12px;font-size:16px;min-height:44px;display:inline-flex;align-items:center;justify-content:center;color:#4a4436}'
      + '#tcc-host .tcc-btn{display:block;width:100%;border:none;border-radius:14px;padding:14px 16px;font-size:17px;font-weight:700;min-height:52px;cursor:pointer;text-align:center}'
      + '#tcc-host .tcc-pri{background:linear-gradient(135deg,#e2845a,#d6605a);color:#fff;box-shadow:0 6px 16px rgba(214,96,90,.28)}'
      + '#tcc-host .tcc-sec{background:#f2eee4;color:#4a3f33;margin-top:8px}'
      + '#tcc-host .tcc-row{display:flex;gap:10px}'
      + '#tcc-host .tcc-row .tcc-btn{margin-top:0}'
      + '#tcc-host .tcc-grow{flex:1}'
      + '#tcc-host .tcc-ans{min-height:54px;font-size:15px;font-weight:700;border:none;border-radius:14px;cursor:pointer;padding:10px 12px}'
      + '#tcc-host .tcc-ans.yes{background:#eaf6ee;color:#1f7a46;border:2px solid #bfe5cd}'
      + '#tcc-host .tcc-ans.no{background:#f6eeee;color:#a03a3a;border:2px solid #edc9c9}'
      + '#tcc-host .tcc-ans:active{transform:scale(.98)}'
      + '#tcc-host .tcc-opts{display:grid;gap:8px;margin:10px 0 4px}'
      + '#tcc-host .tcc-opt{display:flex;align-items:center;justify-content:center;gap:8px;min-height:56px;font-size:15px;font-weight:700;border:2px solid #e7d3b8;border-radius:14px;cursor:pointer;padding:6px 4px;background:#fdf6ec;color:#7a3f1d}'
      + '#tcc-host .tcc-opt:active{transform:scale(.98)}'
      + '#tcc-host .tcc-optnum{display:inline-block;font-weight:800;border-radius:8px;padding:1px 7px;color:#fff;font-size:13px;min-width:24px;text-align:center}'
      + '#tcc-host .tcc-optglyph{font-size:26px;font-weight:800;line-height:1}'
      + '#tcc-host .tcc-fb{text-align:center;font-size:17px;font-weight:800;margin:8px 0 2px}'
      + '#tcc-host .tcc-fb.ok{color:#1f7a46}#tcc-host .tcc-fb.bad{color:#b04545}'
      + '#tcc-host .tcc-qbar{font-size:13px;color:#6b6f7c;margin-bottom:2px}'
      + '#tcc-host .tcc-dots{display:flex;gap:6px;justify-content:center;margin:10px 0 4px}'
      + '#tcc-host .tcc-dot{width:8px;height:8px;border-radius:50%;background:#ddd6c6}'
      + '#tcc-host .tcc-dot.on{background:#d6605a;width:18px;border-radius:6px}'
      + '#tcc-host .tcc-result{text-align:center;padding:12px 2px}'
      + '#tcc-host .tcc-big{font-size:40px;margin:2px 0 6px}'
      + '#tcc-host .tcc-score{font-size:15px;color:#6b6f7c;margin-bottom:8px}'
      + '@media(max-width:380px){#tcc-host .tcc-head{padding:12px 12px 2px}#tcc-host .tcc-scroll{padding:2px 12px 14px}#tcc-host .tcc-frame{border-radius:16px}#tcc-host .tcc-cards{gap:8px}#tcc-host .tcc-word{font-size:40px}}'
      + '@media(max-height:600px){#tcc-host .tcc-frame{max-height:calc(100vh - 12px)}}';
    document.head.appendChild(st);
  }
  function _ensureHost() {
    _ensureStyle();
    if (_tc.host && _tc.host.parentNode) return _tc.host;
    var h = document.getElementById('tcc-host');
    if (h) { _tc.host = h; return h; }
    h = document.createElement('div');
    h.id = 'tcc-host';
    document.body.appendChild(h);
    _tc.host = h;
    return h;
  }

  /* ---------------- 进度读写（全走引擎；UI 不自造字段） ---------------- */
  function _prog() { return (typeof window.tcLoadProgress === 'function') ? window.tcLoadProgress() : null; }
  function _save(p) { if (window.tcSaveProgress) window.tcSaveProgress(p); }
  function _persistActive() {
    if (!_tc.open || !_tc.lessonId) return;
    var p = _prog();
    if (!p) return;
    _save(window.tcSetActive(p, {
      lessonId: _tc.lessonId, stepIdx: _tc.stepIdx, qIdx: (_stepKind() === 'check' ? _tc.qIdx : 0),
      acc: (_stepKind() === 'check' ? _tc.acc : null)
    }));
  }

  /* ---------------- 渲染 ---------------- */
  function _render() {
    if (!_tc.open) return;
    var host = _ensureHost();
    var lesson = _lesson();
    if (!host || !lesson) { if (host) host.innerHTML = ''; return; }
    var vOnly = !_voiceOk();
    var kind = _stepKind();
    var html = '<div class="tcc-frame">' + _topHTML(lesson) + '<div class="tcc-scroll">';
    if (_tc.result) { html += _resHTML(lesson, _tc.result, vOnly); }
    else if (kind === 'check') { html += _checkHTML(vOnly); }
    else {
      var step = lesson.steps[_tc.stepIdx];
      if (step) {
        html += _noticeHTML(vOnly);
        if (step.kind === 'explain') html += _explainHTML(step);
        else if (step.kind === 'cards') html += _cardsHTML(step, vOnly);
        else if (step.kind === 'teach') html += _teachHTML(step, vOnly);
        else if (step.kind === 'listen') html += _listenHTML(step, vOnly);
        else if (step.kind === 'mimic') html += _mimicHTML(step, vOnly);
      }
      html += _dotsHTML(lesson);
      html += _navHTML(lesson);
    }
    html += '</div></div>';
    host.innerHTML = html;
    if (kind === 'listen' && !vOnly && _tc.auto) {
      var sitems = (lesson.steps[_tc.stepIdx] || {}).items || [];
      var it = sitems[Math.min(_tc.listenIdx, sitems.length - 1)];
      if (it) { _tc.auto = false; setTimeout(function () { _playZh(it.zh); }, 250); }
    }
  }
  function _topHTML(lesson) {
    var meta = window.tcGetData && window.tcGetData() ? window.tcGetData().meta : null;
    var course = meta && meta.name ? _tri(meta.name) : 'Tone Course';
    return '<div class="tcc-head"><div class="tcc-top"><span class="tcc-course">' + _esc(lesson.id) + ' · ' + _esc(course)
      + '</span><button class="tcc-x" onclick="toneCourseClose()" aria-label="' + _esc(L('close')) + '">✕</button></div>'
      + '<div class="tcc-title">' + _esc(_tri(lesson.title)) + '</div>'
      + '<div class="tcc-step">' + _esc(_tri(lesson.objective)) + '</div></div>';
  }
  function _noticeHTML(vOnly) {
    if (!vOnly) return '';
    return '<div class="tcc-notice">' + _esc(L('visualOnly')) + '</div>';
  }
  function _explainHTML(step) {
    var h = '<div class="tcc-body">' + _esc(_tri(step.body)) + '</div><ul class="tcc-body">';
    (step.points || []).forEach(function (p) { h += '<li>' + _esc(_tri(p)) + '</li>'; });
    return h + '</ul>';
  }
  function _cardsHTML(step, vOnly) {
    var h = '<div class="tcc-body">' + _esc(_tri(step.intro)) + '</div><div class="tcc-cards">';
    (step.cards || []).forEach(function (c, i) {
      h += '<div class="tcc-card-t">' + _curveSVG(c.tone, false)
        + '<div><span class="tcc-num" style="background:' + TCOLOR[c.tone] + '">' + c.tone + '</span>'
        + '<span class="tcc-glyph" style="color:' + TCOLOR[c.tone] + '">' + _esc(c.glyph) + '</span></div>'
        + '<div class="tcc-dir">' + _esc(_tri(c.dir)) + '</div>'
        + (vOnly
          ? '<div class="tcc-nobtn">' + _esc(c.sample.zh) + ' · ' + _esc(c.sample.py)
            + (c.sample.sr ? ' · ' + _esc(c.sample.sr) : '') + '</div>'
          : '<button class="tcc-chip" onclick="toneCoursePlayCard(' + i + ')">' + _esc(c.sample.zh) + ' · <span style="color:#8a8f9d">' + _esc(c.sample.py) + '</span>'
            + (c.sample.sr ? ' · <span style="color:#8a8f9d">' + _esc(c.sample.sr) + '</span>' : '') + '</button>')
        + '</div>';
    });
    return h + '</div>';
  }
  function _teachHTML(step, vOnly) {
    var c = TCOLOR[step.tone] || '#888';
    return '<div style="text-align:center;margin:4px 0 2px">' + _curveSVG(step.tone, true)
      + '<div class="tcc-body" style="margin:0">' + _esc(_tri(step.title)) + '</div></div>'
      + '<div class="tcc-focus"><div class="tcc-py" style="color:' + c + '">' + _esc(step.sample.py) + '</div>'
      + '<div class="tcc-hz">' + _esc(step.sample.zh) + (step.sample.sr ? ' · ' + _esc(step.sample.sr) : '') + '</div></div>'
      + '<div class="tcc-body">' + _esc(_tri(step.body)) + '</div>'
      + (step.hint ? '<div class="tcc-body" style="font-size:14.5px;color:#6f7484">💡 ' + _esc(_tri(step.hint)) + '</div>' : '')
      + (vOnly ? '' : '<button class="tcc-btn tcc-sec" onclick="toneCoursePlaySample()">' + _esc(L('play')) + ' · ' + _esc(step.sample.py) + '</button>');
  }
  function _listenHTML(step, vOnly) {
    var items = step.items || [];
    if (!items.length) return '';
    var cur = items[Math.min(_tc.listenIdx, items.length - 1)];
    var chips = '<div class="tcc-chips">';
    items.forEach(function (it, i) {
      chips += '<button class="tcc-chip' + (i === _tc.listenIdx ? ' on' : '') + '" onclick="toneCourseFocusWord(' + i + ')">'
        + _esc(it.zh) + ' <span style="color:#8a8f9d;font-size:14px">' + _esc(it.py) + '</span></button>';
    });
    chips += '</div>';
    return '<div class="tcc-body">' + _esc(_tri(step.intro)) + '</div>' + chips
      + '<div class="tcc-focus"><div class="tcc-word">' + _esc(cur.zh) + '</div>'
      + '<div class="tcc-hz">' + _esc(cur.py) + (cur.sr ? ' · ' + _esc(cur.sr) : '') + '</div></div>'
      + (vOnly ? '' : '<button class="tcc-btn tcc-sec" onclick="toneCoursePlayWord()">' + _esc(L('replay')) + '</button>');
  }
  function _mimicHTML(step, vOnly) {
    var it = step.item;
    var h = '<div class="tcc-body">' + _esc(L('mimicHint')) + '</div>'
      + '<div class="tcc-body" style="font-size:15px;color:#4f5462">' + _esc(_tri(step.instructions)) + '</div>'
      + '<div class="tcc-focus"><div class="tcc-py">' + _esc(it.py) + '</div>'
      + '<div class="tcc-hz">' + _esc(it.zh) + ' · ' + _esc(it.sr || '') + '</div></div>'
      + (vOnly ? '' : '<button class="tcc-btn tcc-sec" onclick="toneCoursePlaySample()">' + _esc(L('playStd')) + '</button>');
    if (_tc.mimicDone) {
      h += '<div class="tcc-fb ok" style="margin-top:10px">' + _esc(L('mimicAck')) + '</div>';
    } else {
      h += '<div class="tcc-body" style="text-align:center;font-size:14px;color:#5c6170">'
        + _esc(L('playStd')) + '，然后自己读一遍，并老实回答：</div>'
        + '<div class="tcc-row" style="margin-top:2px">'
        + '<button class="tcc-ans yes tcc-grow" onclick="toneCourseMimic(true)">' + _esc(L('mimicLike')) + '</button>'
        + '<button class="tcc-ans no tcc-grow" onclick="toneCourseMimic(false)">' + _esc(L('mimicNo')) + '</button></div>';
    }
    return h;
  }
  function _checkHTML(vOnly) {
    var meta = window.tcCheckMeta(_tc.lessonId, _tc.stepIdx);
    if (!meta) return '';
    if (!_tc.qOrder.length) {
      _tc.qOrder = window.tcRoundItems(_tc.lessonId, _tc.keepOrder, _tc.stepIdx);
      if (!_tc.qOrder.length) return '';
      _tc.qIdx = Math.min(_tc.qIdx, Math.max(0, _tc.qOrder.length - 1));
    }
    var item = _tc.qOrder[_tc.qIdx];
    if (!item) return '';
    var isBin = meta.checkKind === 'isTone';
    var target = isBin ? _isToneTarget(meta) : null;
    var h = '<div class="tcc-body">' + _esc(_tri(meta.intro)) + '</div>'
      + '<div class="tcc-qbar">' + _esc(_tri(meta.title)) + ' · ' + (_tc.qIdx + 1) + ' / ' + _tc.qOrder.length + '</div>'
      + '<div class="tcc-focus"><div class="tcc-word" style="font-size:64px;line-height:1.1">' + _esc(item.zh) + '</div>';
    if (vOnly) h += '<div class="tcc-hz">' + _esc(item.py) + '</div>';
    h += '<div class="tcc-glass" style="font-weight:700">' + _esc(_tri(meta.question)) + '</div></div>'
      + (vOnly ? '' : '<div style="display:flex;justify-content:center;margin:2px 0 6px">'
        + '<button class="tcc-btn tcc-sec" style="width:auto;min-width:150px" onclick="toneCoursePlayCheck()">' + _esc(L('replay')) + '</button></div>');
    if (_tc.justAnswered) {
      /* reveal 依据该词是否就是目标声（isTone）或该词实际声（whichTone），
       * 不再依据答对与否——修掉旧的误导：对非目标声答对「不是」时误报 wasT1。 */
      var reveal = isBin
        ? _toneLine(target, target != null && item.tone === target)
        : _toneLine(item.tone, true);
      h += '<div class="tcc-fb ' + (_tc.lastRight ? 'ok' : 'bad') + '">' + _esc(_tc.lastRight ? L('correct') : L('wrong')) + '</div>'
        + '<div class="tcc-glass" style="text-align:center">' + _esc(reveal) + '</div>'
        + '<button class="tcc-btn tcc-pri" style="margin-top:8px" onclick="toneCourseCheckNext()">'
        + _esc(L('next')) + ' →</button>';
    } else if (isBin) {
      h += '<div class="tcc-row">'
        + '<button class="tcc-ans yes tcc-grow" onclick="toneCourseAnswer(true)">' + _esc(_yesLabel(target)) + '</button>'
        + '<button class="tcc-ans no tcc-grow" onclick="toneCourseAnswer(false)">' + _esc(L('notIt')) + '</button></div>';
    } else {
      /* whichTone：按 meta.tones 轴渲染选项（轴=已教声∪本课目标声），点号作答 */
      var tones = meta.tones || [];
      var cols = tones.length >= 3 ? 3 : 2;
      h += '<div class="tcc-opts" style="grid-template-columns:repeat(' + cols + ',1fr)">';
      for (var i = 0; i < tones.length; i++) {
        var tn = tones[i];
        var m = _toneMeta(tn);
        var col = TCOLOR[tn] || '#888';
        h += '<button class="tcc-opt" data-tone="' + tn + '" onclick="toneCourseAnswer(' + tn + ')">'
          + '<span class="tcc-optnum" style="background:' + col + '">' + tn + '</span>'
          + '<span class="tcc-optglyph" style="color:' + col + '">' + _esc((m && m.glyph) || ('t' + tn)) + '</span></button>';
      }
      h += '</div>';
    }
    return h;
  }
  function _dotsHTML(lesson) {
    var n = (lesson.steps || []).length;
    if (n <= 1) return '';
    var h = '<div class="tcc-dots">';
    for (var i = 0; i < n; i++) h += '<div class="tcc-dot' + (i === _tc.stepIdx ? ' on' : '') + '"></div>';
    return h + '</div>';
  }
  function _navHTML(lesson) {
    var isMimic = _stepKind() === 'mimic';
    if (isMimic && !_tc.mimicDone) {
      return '<button class="tcc-btn tcc-sec" disabled style="opacity:.45;margin-top:8px">' + _esc(L('next')) + '</button>';
    }
    return '<button class="tcc-btn tcc-pri" style="margin-top:8px" onclick="toneCourseNext()">' + _esc(L('next')) + ' →</button>';
  }
  function _resHTML(lesson, res, vOnly) {
    var h = '<div class="tcc-result">';
    if (lesson.kind === 'concept') {
      h += '<div class="tcc-big">🎵</div><div class="tcc-title">' + _esc(L('great')) + '</div>'
        + '<div class="tcc-body">' + _esc(L('conceptDone')) + '</div>';
    } else {
      var passTxt = (lesson.now && _tri(lesson.now)) || L('nowT1'); // G3–G7 用各自 now；G2 回退 legacy
      h += '<div class="tcc-big">' + (res.passed ? '🎉' : '🌱') + '</div>'
        + '<div class="tcc-title">' + _esc(L('great')) + '</div>'
        + '<div class="tcc-score">' + res.right + ' / ' + res.total + (res.passed ? ' ✓' : '') + '</div>'
        + '<div class="tcc-body">' + _esc(res.passed ? passTxt : L('warm')) + '</div>';
    }
    if (lesson.kind === 'concept' || res.passed) h += '<div class="tcc-body" style="color:#6f7484;font-size:14.5px">' + _esc(L('warm')) + '</div>';
    h += '</div>';
    var p = _prog();
    var nextId = p ? window.tcNextLesson(p) : null;
    var allDone = p ? window.tcAllDone(p) : false;
    h += '<button class="tcc-btn tcc-pri" onclick="toneCourseResultAction()">'
      + (nextId && !allDone ? _esc(L('nextLsn')) + ' →' : _esc(L('finish'))) + '</button>';
    h += '<button class="tcc-btn tcc-sec" onclick="toneCourseRetry()">' + _esc(L('retry')) + '</button>';
    return h;
  }

  /* ---------------- 行为 ---------------- */
  /* 单步回合重置：只清本步状态，不清 acc（多 check 课的跨步累积保留） */
  function _resetRound() {
    _tc.qOrder = []; _tc.qIdx = 0; _tc.right = 0; _tc.total = 0;
    _tc.justAnswered = false; _tc.lastRight = null; _tc.mimicDone = false;
    _tc.listenIdx = 0; _tc.result = null; _tc.auto = true;
  }
  /* 整个「开课/重练」重置累积（进入新课或重练时调用） */
  function _resetAcc() { _tc.acc = { right: 0, total: 0 }; }
  /* 从 fromIdx 之后找下一个 check 步（多 check 课跨步推进）；无 → -1 */
  function _laterCheckIdx(lesson, fromIdx) {
    var steps = (lesson && lesson.steps) || [];
    for (var i = fromIdx + 1; i < steps.length; i++) {
      if (steps[i] && steps[i].kind === 'check') return i;
    }
    return -1;
  }
  function _open(lessonId) {
    var lesson = window.tcLesson(lessonId);
    if (!lesson) return;
    _resetRound();
    _resetAcc();
    _tc.open = true; _tc.lessonId = lessonId; _tc.stepIdx = 0;
    _persistActive();
    _render();
  }
  function _loadData(cb) {
    if (window.tcGetData && window.tcGetData()) { cb(); return; }
    window.tcLoadData(cb);
  }
  function toneCourseStartLesson(id) {
    _loadData(function () {
      if (id && window.tcLesson(id)) _open(id); else toneCourseStart();
    });
  }
  function toneCourseStart() {
    _loadData(function () {
      var p = _prog();
      var active = p ? window.tcGetActive(p) : null;
      if (active && active.lessonId && !(p && window.tcIsComplete(p, active.lessonId))) {
        var l = window.tcLesson(active.lessonId);
        if (l) {
          _resetRound();
          _tc.acc = (active.acc && typeof active.acc.right === 'number')
            ? { right: active.acc.right, total: active.acc.total } : { right: 0, total: 0 };
          _tc.open = true; _tc.lessonId = active.lessonId;
          _tc.stepIdx = Math.min(active.stepIdx || 0, (l.steps || []).length - 1);
          if (_stepKind() === 'check') _tc.qIdx = active.qIdx || 0;
          _render(); return;
        }
      }
      var next = p ? window.tcNextLesson(p) : (window.tcLessonIds()[0]);
      if (next) _open(next);
    });
  }
  function toneCourseClose() {
    if (!_tc.open) return;
    _tc.open = false;
    if (_tc.host && _tc.host.parentNode) _tc.host.parentNode.removeChild(_tc.host);
    _tc.host = null;
    // 关浮层后若底层是学习首页：重建首页（fillPhasePath 重写 grid → renderFaza0Card
    // 重新注入），让「进行中 / 已完成 / 毕业卡」即时可见，无需整页刷新。
    try {
      var av = document.querySelector('.lrn-view.active');
      if (av && av.id === 'lrn-view-home' && typeof window.renderChineseHome === 'function') {
        window.renderChineseHome();
      }
    } catch (e) {}
  }
  function toneCourseNext() {
    if (!_tc.open) return;
    var lesson = _lesson();
    if (!lesson) return;
    var steps = lesson.steps || [];
    if (_tc.stepIdx < steps.length - 1) {
      _tc.stepIdx++;
      if (_stepKind() === 'check') _resetRound();
      _persistActive();
      _render();
      return;
    }
    // 非 check 课的最后一步 → 直接完成进入 Result（G1 无评分）
    var p = _prog();
    if (p) _save(window.tcCompleteLesson(p, lesson.id));
    if (!_tc.result) _tc.result = { passed: true, right: 0, total: 0 };
    _render();
  }
  /* 作答：whichTone 传声调号(Number)，isTone 传布尔。
   * isTone：二元判分，mastery 仅在该词确为目标声时记录（tcRecordCheckAnswer）。
   * whichTone：该词实际声即被识别 → tcApplyAnswer 记入该声 mastery。
   * 每题同时进 _tc.acc（一课多 check 步累积，最终以 acc 判 Result）。 */
  function toneCourseAnswer(val) {
    if (!_tc.open || _tc.justAnswered) return;
    var meta = window.tcCheckMeta(_tc.lessonId, _tc.stepIdx);
    var item = _tc.qOrder[_tc.qIdx];
    if (!meta || !item) return;
    var p = _prog();
    if (!p) p = window.tcDefaultProgress();
    var right, out;
    if (meta.checkKind === 'whichTone') {
      right = (Number(val) === item.tone);
      out = window.tcApplyAnswer(p, item.tone, right);
    } else {
      var rec = window.tcRecordCheckAnswer(p, meta, item, !!val);
      right = rec.right; out = rec.prog;
    }
    _save(out);
    _tc.right += right ? 1 : 0; _tc.total++;
    _tc.acc.right += right ? 1 : 0; _tc.acc.total++;
    _tc.lastRight = !!right; _tc.justAnswered = true;
    _render();
  }
  function toneCourseCheckNext() {
    if (!_tc.open) return;
    if (_tc.qIdx >= _tc.qOrder.length - 1) {
      var lesson = _lesson();
      /* 本课还有后续 check 步（如 G6 的两段辨认）→ 推进到下一 check，保留 acc，未完成 */
      var later = lesson ? _laterCheckIdx(lesson, _tc.stepIdx) : -1;
      if (later >= 0) {
        _tc.stepIdx = later;
        _resetRound(); // 保留 acc，仅重置本步
        _persistActive();
        _render(); return;
      }
      var meta = window.tcCheckMeta(_tc.lessonId, _tc.stepIdx);
      var total = _tc.acc.total || _tc.qOrder.length;
      var right = _tc.acc.right;
      var th = (meta && meta.threshold) || 75;
      _tc.result = { passed: (right / total) >= (th / 100), right: right, total: total };
      var p = _prog();
      if (p && lesson) _save(window.tcCompleteLesson(p, lesson.id));
      _tc.justAnswered = false;
      _render(); return;
    }
    _tc.qIdx++; _tc.justAnswered = false; _tc.lastRight = null;
    _persistActive();
    _render();
  }
  function toneCourseResultAction() {
    var p = _prog();
    var nextId = p ? window.tcNextLesson(p) : null;
    if (nextId) { _open(nextId); } else { toneCourseClose(); }
  }
  function toneCourseRetry() {
    if (!_tc.open) return;
    var id = _tc.lessonId;
    _resetRound();
    _resetAcc();
    _tc.open = true; _tc.lessonId = id; _tc.stepIdx = 0;
    _persistActive();
    _render();
  }
  /* 复习入口：打开最后一课（G7 ma 四声总辨认）—— 首页毕业卡「复习声调」调用 */
  function toneCourseReview() {
    _loadData(function () {
      var ids = window.tcLessonIds();
      if (ids.length) _open(ids[ids.length - 1]);
    });
  }
  function _playCur(zh) { var ok = _playZh(zh); if (!ok) _render(); return ok; }
  window.toneCoursePlayCard = function (i) {
    var step = _lesson() && _lesson().steps[_tc.stepIdx];
    var c = step && step.cards && step.cards[i];
    if (c && c.sample) _playCur(c.sample.zh);
  };
  window.toneCourseFocusWord = function (i) { _tc.listenIdx = i; _render(); };
  window.toneCoursePlayWord = function () {
    var step = _lesson() && _lesson().steps[_tc.stepIdx];
    var it = step && step.items && step.items[Math.min(_tc.listenIdx, step.items.length - 1)];
    if (it) _playCur(it.zh);
  };
  window.toneCoursePlaySample = function () {
    var step = _lesson() && _lesson().steps[_tc.stepIdx];
    var it = step && (step.sample || step.item);
    if (it) _playCur(it.zh || it.py);
  };
  window.toneCoursePlayCheck = function () {
    var it = _tc.qOrder[_tc.qIdx];
    if (it) _playCur(it.zh);
  };
  window.toneCourseMimic = function (like) {
    if (!_tc.open || _tc.mimicDone) return;
    var step = _lesson() && _lesson().steps[_tc.stepIdx];
    var it = step && (step.item || step.sample);
    var tone = (step && step.tone) || (it && it.tone) || 1;
    var p = _prog();
    if (p) _save(window.tcRecordMimic(p, tone, !!like));
    _tc.mimicDone = true;
    _render();
  };
  window.toneCourseNext = toneCourseNext;
  window.toneCourseAnswer = toneCourseAnswer;
  window.toneCourseCheckNext = toneCourseCheckNext;
  window.toneCourseResultAction = toneCourseResultAction;
  window.toneCourseRetry = toneCourseRetry;
  window.toneCourseReview = toneCourseReview;
  window.toneCourseStart = toneCourseStart;
  window.toneCourseStartLesson = toneCourseStartLesson;
  window.toneCourseClose = toneCourseClose;
  window.toneCourseSetKeepOrder = function (b) { _tc.keepOrder = !!b; };
  window.toneCourseOnLangSwitch = function () { if (_tc.open) _render(); };
  window.toneCourseGetState = function () {
    return { open: _tc.open, lessonId: _tc.lessonId, stepIdx: _tc.stepIdx, qIdx: _tc.qIdx, right: _tc.right, total: _tc.total, acc: { right: _tc.acc.right, total: _tc.acc.total }, justAnswered: _tc.justAnswered, lastRight: _tc.lastRight, mimicDone: _tc.mimicDone, result: _tc.result, voiceOk: _voiceOk() };
  };
})();

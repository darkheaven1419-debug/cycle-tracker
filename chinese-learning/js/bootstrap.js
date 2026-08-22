/* bootstrap.js — 独立中文学习网站启动脚本
   职责：
   1. 定义全局 lang（默认 zh-CN，持久化到 localStorage）
   2. 提供最小 toast() 实现（依赖 #toastContainer）
   3. 语言切换：更新静态三语标签 + 重渲染当前视图
   4. 启动 initChineseTab()（chinese-ui.js 提供）
   不依赖主站任何全局变量（activeProfile / scheduleSync / i18n.js） */

(function () {
  'use strict';

  /* ---------- 1. 全局语言 ---------- */
  var DEFAULT_LANG = 'zh-CN';
  try {
    window.lang = localStorage.getItem('lrn-lang') || DEFAULT_LANG;
  } catch (e) {
    window.lang = DEFAULT_LANG;
  }

  /* ---------- 2. 最小 toast() ---------- */
  function toast(msg) {
    var box = document.getElementById('toastContainer');
    if (!box) {
      box = document.createElement('div');
      box.id = 'toastContainer';
      document.body.appendChild(box);
    }
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () { el.parentNode && el.parentNode.removeChild(el); }, 400);
    }, 2600);
  }
  window.toast = toast;

  /* ---------- 3. 静态标签三语映射 ---------- */
  var STATIC_LABELS = {
    lrnAppTitle:     { 'zh-CN': '中文学习',  sr: 'Učenje kineskog', en: 'Chinese Learning' },
    lrnAppTip:       { 'zh-CN': '💡 每天 3 课 · 点滴进步 · 滴水穿石', sr: '💡 3 lekcije dnevno · kap po kap', en: '💡 3 lessons a day · little by little' },
    'lrn-sub-home':  { 'zh-CN': '学习',      sr: 'Učenje',    en: 'Learn' },
    'lrn-sub-stats': { 'zh-CN': '统计',      sr: 'Statistika', en: 'Stats' },
    'lrn-sub-ach':   { 'zh-CN': '成就',      sr: 'Značke',     en: 'Badges' },
    'lrn-sub-fav':   { 'zh-CN': '收藏',      sr: 'Favoriti',   en: 'Favorites' },
    'lrn-sub-review':{ 'zh-CN': '复习',      sr: 'Pregled',    en: 'Review' },
    'lrn-back-label': { 'zh-CN': '返回',     sr: 'Nazad',      en: 'Back' },
    'lrn-back-label2':{ 'zh-CN': '返回',     sr: 'Nazad',      en: 'Back' },
    'lrn-fav-title':  { 'zh-CN': '收藏词汇',  sr: 'Sačuvane reči', en: 'Favorite words' }
  };

  function applyStaticLabels() {
    var l = window.lang || DEFAULT_LANG;
    Object.keys(STATIC_LABELS).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        var m = STATIC_LABELS[id];
        el.textContent = m[l] || m['zh-CN'] || '';
      }
    });
    // 语言按钮高亮
    var btns = document.querySelectorAll('.lrn-lang-btn');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (b.getAttribute('data-lang') === l) b.classList.add('active');
      else b.classList.remove('active');
    }
    // 页面 lang 属性
    if (document.documentElement) document.documentElement.setAttribute('lang', l);
  }

  /* ---------- 语言切换 ---------- */
  window.setLrnLang = function (l) {
    window.lang = l;
    try { localStorage.setItem('lrn-lang', l); } catch (e) {}
    applyStaticLabels();
    // 重渲染当前视图（保留 phase / lesson 内部状态）
    var cur = document.querySelector('.lrn-subnav-btn.active');
    var view = cur ? cur.getAttribute('data-lrn-view') : 'home';
    if (view === 'phase' && window.__lrnLastPhase) {
      window.renderPhaseLessons(window.__lrnLastPhase);
    } else if (view === 'lesson' && window.__lrnLastLesson) {
      window.renderLessonView(window.__lrnLastLesson);
    } else {
      window.switchLrnView(view);
    }
  };

  /* ---------- 记录 phase/lesson 当前状态（供语言切换重渲染） ---------- */
  (function () {
    var origPhase = window.renderPhaseLessons;
    if (typeof origPhase === 'function') {
      window.renderPhaseLessons = function (id) {
        window.__lrnLastPhase = id;
        return origPhase(id);
      };
    }
    var origLesson = window.renderLessonView;
    if (typeof origLesson === 'function') {
      window.renderLessonView = function (id, tab) {
        window.__lrnLastLesson = id;
        if (tab) window.__lrnLastTab = tab;
        return origLesson(id, tab);
      };
    }
  })();

  /* ---------- 启动 ---------- */
  function boot() {
    applyStaticLabels();
    if (typeof window.initChineseTab === 'function') {
      window.initChineseTab();
    } else {
      toast('加载失败');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

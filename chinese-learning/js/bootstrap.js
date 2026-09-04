/* bootstrap.js — 独立中文学习网站启动脚本
   职责：
   1. 定义全局 lang（默认 sr，持久化到 localStorage）
   2. 提供最小 toast() 实现（依赖 #toastContainer）
   3. 语言切换：更新静态三语标签 + 重渲染当前视图
   4. 启动 initChineseTab()（chinese-ui.js 提供）
   不依赖主站任何全局变量（activeProfile / scheduleSync / i18n.js） */

(function () {
  'use strict';

  /* ---------- 1. 全局语言 ---------- */
  var DEFAULT_LANG = 'sr';
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

  /* 浏览器标签页标题（三语，随语言动态变化） */
  var PAGE_TITLE = {
    'zh-CN': '中文学习 · Chinese',
    sr: 'Učenje kineskog · Kineski',
    en: 'Chinese Learning · Chinese'
  };

  /* 启动失败提示（防御性，三语） */
  var LOAD_FAIL = {
    'zh-CN': '加载失败',
    sr: 'Greška pri učitavanju',
    en: 'Failed to load'
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
    // 浏览器标签页标题（随语言变化：首次加载 / 切换语言 / 刷新均生效）
    if (PAGE_TITLE[l]) document.title = PAGE_TITLE[l];
  }

  /* ---------- 语言切换 ---------- */
  // 以 chinese-ui 模块的真实状态（getLrnUIState）为唯一状态来源，
  // 切换语言后重渲染当前视图，保留 phase / lesson 上下文，不再跳回首页
  window.setLrnLang = function (l) {
    window.lang = l;
    try { localStorage.setItem('lrn-lang', l); } catch (e) {}
    applyStaticLabels();
    var st = (typeof window.getLrnUIState === 'function') ? window.getLrnUIState() : null;
    if (st && st.view === 'phase' && st.phaseId) {
      window.renderPhaseLessons(st.phaseId);
    } else if (st && st.view === 'lesson' && st.lessonId) {
      window.renderLessonView(st.lessonId, st.tab);
    } else {
      window.switchLrnView((st && st.view) ? st.view : 'home');
    }
    // V1.1 声调练习：语言切换时刷新悬浮层文案（保留会话状态），无则跳过
    if (typeof window.toneOnLangSwitch === 'function') window.toneOnLangSwitch(st);
    // Faza0 声调课程（tone-course）：语言切换保留 lesson/step/题目状态，仅重渲染文案
    if (typeof window.toneCourseOnLangSwitch === 'function') window.toneCourseOnLangSwitch(st);
  };

  /* ---------- 启动 ---------- */
  function boot() {
    applyStaticLabels();
    if (typeof window.initChineseTab === 'function') {
      window.initChineseTab();
    } else {
      toast(LOAD_FAIL[window.lang] || LOAD_FAIL['zh-CN']);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

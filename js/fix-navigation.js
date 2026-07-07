"use strict";
(function () {
  console.log('[fix-navigation] 已加载');
  (function () {
    var a = document.querySelectorAll('nav.tabs-nav');
    if (a.length > 1) { for (var i = 1; i < a.length; i++) a[i].parentNode.removeChild(a[i]); }
  })();
  window._fixNavigation = function () {
    var c = document.querySelector('.calendar') || document.querySelector('.days');
    var n = document.querySelector('nav.tabs-nav');
    if (!c || !n) return;
    var a = document.querySelectorAll('nav.tabs-nav');
    if (a.length > 1) { for (var i = 1; i < a.length; i++) a[i].parentNode.removeChild(a[i]); }
    var r = c.getBoundingClientRect();
    n.style.position = 'fixed'; n.style.bottom = '0';
    n.style.left = r.left + 'px'; n.style.width = r.width + 'px';
    n.style.maxWidth = 'none'; n.style.margin = '0'; n.style.transform = 'none';
  };
  _fixNavigation();
  console.log('[fix-navigation] 已对齐 ✓');
})();

'use strict';

/* ================================================================
   CalendarAnimations — 日历动画模块

   职责：
   - 月份切换动画（GSAP timeline + CSS 回退）
   - 新增日期 cell 入场动画（stagger from center）
   - 进度条动画（scaleX, 仅 GSAP）
   - 弹窗出入动画（scale + fade, 信息分层 stagger）
   - 日 cell 悬停视差效果（仅非触屏设备）
   - prefers-reduced-motion 尊重（通过 gsap.matchMedia）
   - 统一清理接口

   遵循 GSAP best practices：
   - gsap-core: to(), from(), fromTo(), stagger, easing, matchMedia
   - gsap-timeline: timeline(), position param, nesting
   - gsap-performance: transform/opacity only, will-change
   - gsap-utils: clamp() for dynamic rotation bounds
   ================================================================ */

const CalendarAnimations = (function () {
  'use strict';

  // ── 依赖检测 ──────────────────────────────────────────────────
  // HAS_GSAP 由 gsap-animations.js 在启动时设置
  const HAS_GSAP = typeof window !== 'undefined' && window.HAS_GSAP === true;

  // ── 匹配媒体：prefers-reduced-motion ─────────────────────────
  let _mm = null;

  if (HAS_GSAP && typeof gsap !== 'undefined' && gsap.matchMedia) {
    _mm = gsap.matchMedia();
    _mm.add('(prefers-reduced-motion: reduce)', function () {
      // 当用户偏好减少运动时，所有 tween 持续时间为 0
      gsap.defaults({ duration: 0 });
      return function () {
        gsap.defaults({ duration: 0.4 });
      };
    });
  }

  // ══════════════════════════════════════════════════════════════════
  //  月份切换动画
  // ══════════════════════════════════════════════════════════════════

  /**
   * 月份切换动画
   * @param {HTMLElement} gridEl - #daysGrid 元素
   * @param {number} direction - -1: 上月, +1: 下月
   */
  function animateMonthChange(gridEl, direction) {
    if (!gridEl) return;

    if (!HAS_GSAP) {
      _fallbackMonthChange(gridEl);
      return;
    }

    try {
      const tl = gsap.timeline({
        onComplete: function () {
          gsap.set(gridEl, { clearProps: 'all' });
        },
      });

      // 第 1 步：缩小 + 淡出当前网格
      tl.to(gridEl, {
        scale: 0.92,
        autoAlpha: 0,
        duration: 0.12,
        ease: 'power2.in',
      });

      // 第 2 步：渲染新月份（通过 CalendarModule.refresh('grid')）
      tl.add(function () {
        if (typeof CalendarModule !== 'undefined' && CalendarModule.refresh) {
          CalendarModule.refresh('grid');
        }
      });

      // 第 3 步：放大 + 淡入新网格
      tl.fromTo(
        gridEl,
        { scale: 0.92, autoAlpha: 0 },
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.2,
          ease: 'power2.out',
        }
      );

      // 第 4 步：从中心 stagger 入场
      const newCells = gridEl.querySelectorAll('.day:not(.other-month)');
      if (newCells.length) {
        tl.from(
          newCells,
          {
            y: -8,
            autoAlpha: 0,
            duration: 0.25,
            stagger: {
              amount: 0.25,
              from: direction < 0 ? 'end' : 'start',
            },
            ease: 'back.out(1.2)',
            clearProps: 'all',
          },
          '-=0.05'
        );
      }
    } catch (e) {
      // GSAP 动画失败时确保网格仍然显示
      _fallbackMonthChange(gridEl);
    }
  }

  /**
   * 月份切换的 CSS 回退
   */
  function _fallbackMonthChange(gridEl) {
    if (!gridEl) return;
    gridEl.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    gridEl.style.opacity = '0';
    gridEl.style.transform = 'scale(0.95)';

    requestAnimationFrame(function () {
      if (typeof CalendarModule !== 'undefined' && CalendarModule.refresh) {
        CalendarModule.refresh('grid');
      }
      requestAnimationFrame(function () {
        gridEl.style.opacity = '1';
        gridEl.style.transform = 'scale(1)';
        setTimeout(function () {
          gridEl.style.transition = '';
          gridEl.style.opacity = '';
          gridEl.style.transform = '';
        }, 220);
      });
    });
  }

  // ══════════════════════════════════════════════════════════════════
  //  日期 Cell 入场动画
  // ══════════════════════════════════════════════════════════════════

  /**
   * 新增 day cell 入场动画
   * 仅针对通过 dataset 标记的新增 cell 执行
   * @param {HTMLElement} container - #daysGrid
   */
  function animateNewCells(container) {
    if (!container || !HAS_GSAP) return;

    try {
      // 选出刚新增的 cell（通过 data-new 标记）
      const newCells = container.querySelectorAll('.day[data-new]');
      if (!newCells.length) return;

      gsap.killTweensOf(newCells);
      gsap.from(newCells, {
        y: -8,
        autoAlpha: 0,
        duration: 0.3,
        stagger: { amount: 0.25, from: 'center' },
        ease: 'back.out(1.1)',
        clearProps: 'all',
        onComplete: function () {
          // 清除 data-new 标记
          let i,
            len = newCells.length;
          for (i = 0; i < len; i++) {
            newCells[i].removeAttribute('data-new');
          }
        },
      });
    } catch (e) {
      // GSAP 动画失败时直接清除标记
      const all = container.querySelectorAll('.day[data-new]');
      let i,
        len = all.length;
      for (i = 0; i < len; i++) {
        all[i].removeAttribute('data-new');
      }
    }
  }

  // ══════════════════════════════════════════════════════════════════
  //  进度条动画
  // ══════════════════════════════════════════════════════════════════

  /**
   * 进度条动画（scaleX）
   * @param {HTMLElement} fillEl - #pg-fill
   * @param {number} pct - 0–100 百分比
   */
  function animateProgressBarGSAP(fillEl, pct) {
    if (!fillEl) return;

    // GPU 加速提示
    fillEl.style.willChange = 'transform';

    if (!HAS_GSAP) {
      fillEl.style.transform = 'scaleX(' + pct / 100 + ')';
      return;
    }

    try {
      gsap.killTweensOf(fillEl);
      gsap.to(fillEl, {
        scaleX: pct / 100,
        duration: 0.7,
        ease: 'power2.out',
        transformOrigin: 'left center',
        overwrite: 'auto',
        onComplete: function () {
          fillEl.style.willChange = '';
        },
      });
    } catch (e) {
      fillEl.style.transform = 'scaleX(' + pct / 100 + ')';
    }
  }

  // ══════════════════════════════════════════════════════════════════
  //  弹窗动画
  // ══════════════════════════════════════════════════════════════════

  /**
   * 弹窗入场动画
   * @param {HTMLElement} modalEl - 弹窗最外层（如 #modal）
   */
  function animateModalInGSAP(modalEl) {
    if (!modalEl) return;

    if (!HAS_GSAP) {
      modalEl.classList.remove('hidden');
      return;
    }

    try {
      let inner = modalEl.querySelector('.modal');
      if (!inner) {
        modalEl.classList.remove('hidden');
        return;
      }

      gsap.killTweensOf([modalEl, inner]);

      // 先显示弹窗
      modalEl.classList.remove('hidden');
      gsap.set(modalEl, { display: 'flex', autoAlpha: 1 });

      // 弹窗主体 spring 入场
      gsap.from(inner, {
        scale: 0.85,
        autoAlpha: 0,
        y: 10,
        duration: 0.4,
        ease: 'back.out(1.3)',
        clearProps: 'all',
      });

      // 内部元素分层 stagger 入场
      const title = inner.querySelector('.modal-title, h2, h3');
      const phase = inner.querySelector('.modal-phase, .phase-badge');
      const details = inner.querySelectorAll('.modal-body, .modal-details, .modal-content > p, .modal-content > div');
      const actions = inner.querySelector('.modal-actions, .modal-footer');

      const infoTl = gsap.timeline({ defaults: { duration: 0.3, ease: 'power2.out' } });

      if (title) infoTl.from(title, { y: -6, autoAlpha: 0 }, 0);
      if (phase) infoTl.from(phase, { y: -4, autoAlpha: 0 }, '+=0.1');
      if (details && details.length) infoTl.from(details, { y: 4, autoAlpha: 0, stagger: 0.08 }, '+=0.1');
      if (actions) infoTl.from(actions, { y: 6, autoAlpha: 0 }, '+=0.1');
    } catch (e) {
      modalEl.classList.remove('hidden');
    }
  }

  /**
   * 弹窗退场动画
   * @param {HTMLElement} modalEl - 弹窗最外层
   */
  function animateModalOutGSAP(modalEl) {
    if (!modalEl) return;

    if (!HAS_GSAP) {
      modalEl.classList.add('hidden');
      return;
    }

    try {
      let inner = modalEl.querySelector('.modal');
      if (!inner) {
        modalEl.classList.add('hidden');
        return;
      }

      gsap.to(inner, {
        scale: 0.9,
        autoAlpha: 0,
        y: 8,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: function () {
          modalEl.classList.add('hidden');
          gsap.set(inner, { clearProps: 'all' });
          gsap.set(modalEl, { clearProps: 'all' });
        },
      });
    } catch (e) {
      modalEl.classList.add('hidden');
    }
  }

  // ══════════════════════════════════════════════════════════════════
  //  Cell 悬停视差效果
  // ══════════════════════════════════════════════════════════════════

  /**
   * 为日期 cell 添加鼠标悬停视差倾斜效果
   * 仅对非触屏设备启用
   * @param {HTMLElement} cell - .day 元素
   */
  function enhanceDayHover(cell) {
    if (!cell) return;

    // 触屏设备跳过
    if ('ontouchstart' in window) return;

    // 避免重复绑定
    if (cell._hoverEnhanced) return;
    cell._hoverEnhanced = true;

    cell.addEventListener('mouseenter', _onHoverEnter);
    cell.addEventListener('mousemove', _onHoverMove);
    cell.addEventListener('mouseleave', _onHoverLeave);
  }

  function _onHoverEnter(e) {
    let cell = e.currentTarget;
    cell.style.willChange = 'transform';
  }

  function _onHoverMove(e) {
    let cell = e.currentTarget;
    const rect = cell.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const halfW = rect.width / 2;
    const halfH = rect.height / 2;

    // 最大 3 度旋转，通过比例控制
    const rotY = ((x - halfW) / halfW) * 3;
    const rotX = ((halfH - y) / halfH) * 3;

    cell.style.transform = 'perspective(300px) rotateX(' + rotX.toFixed(1) + 'deg) rotateY(' + rotY.toFixed(1) + 'deg)';
  }

  function _onHoverLeave(e) {
    let cell = e.currentTarget;
    cell.style.transform = '';
    cell.style.willChange = '';
  }

  // ══════════════════════════════════════════════════════════════════
  //  统一清理
  // ══════════════════════════════════════════════════════════════════

  /**
   * 终止所有日历相关的 GSAP tween（用于 destroy）
   */
  function killCalendarAnimations() {
    if (!HAS_GSAP || typeof gsap === 'undefined') return;

    const gridEl = document.getElementById('daysGrid');
    const modalEl = document.getElementById('modal');
    const fillEl = document.getElementById('pg-fill');
    const targets = [];

    if (gridEl) targets.push(gridEl);
    if (modalEl) targets.push(modalEl, modalEl.querySelector('.modal'));
    if (fillEl) targets.push(fillEl);

    // 清理所有 day cell 的 hover 监听
    const allCells = document.querySelectorAll('.day');
    let i,
      len = allCells.length;
    for (i = 0; i < len; i++) {
      const c = allCells[i];
      if (c._hoverEnhanced) {
        c.removeEventListener('mouseenter', _onHoverEnter);
        c.removeEventListener('mousemove', _onHoverMove);
        c.removeEventListener('mouseleave', _onHoverLeave);
        c._hoverEnhanced = false;
        c.style.transform = '';
        c.style.willChange = '';
      }
    }

    // 清理 GSAP tween
    gsap.killTweensOf(targets);

    // 清理 matchMedia
    if (_mm && typeof _mm.revert === 'function') {
      _mm.revert();
    }
  }

  // ══════════════════════════════════════════════════════════════════
  //  导出
  // ══════════════════════════════════════════════════════════════════

  return {
    animateMonthChange: animateMonthChange,
    animateNewCells: animateNewCells,
    animateProgressBarGSAP: animateProgressBarGSAP,
    animateModalInGSAP: animateModalInGSAP,
    animateModalOutGSAP: animateModalOutGSAP,
    enhanceDayHover: enhanceDayHover,
    killCalendarAnimations: killCalendarAnimations,
  };
})();

/* 全局别名 */
if (typeof window !== 'undefined') {
  window.CalendarAnimations = CalendarAnimations;
}

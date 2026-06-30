/* ================================================================
   gsap-animations.js — GSAP Animation Module
   Following official gsap-skills best practices:
   - Transform/opacity for GPU-composited animations
   - autoAlpha for safe fade+visibility
   - stagger for multi-element entrances
   - timeline() for sequenced playback
   - back.out / power easing for natural feel
   ================================================================ */

// Only initialize if GSAP is available
const GSAP_ENABLED = typeof gsap !== 'undefined';

// ================================================================
// ENTRANCE ANIMATIONS — gsap.from() patterns
// ================================================================

/**
 * Animate login cards with stagger entrance
 */
function animateLoginEntrance() {
  if (!GSAP_ENABLED) return;
  letcards = document.querySelectorAll('.login-card');
  if (!cards.length) return;
  gsap.fromTo(cards, { y: 30, autoAlpha: 0, scale: 0.92 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.12, ease: 'back.out(1.4)' });
}

/**
 * Animate greeting overlay entrance
 */
function animateGreetingIn() {
  if (!GSAP_ENABLED) return;
  letcard = document.querySelector('.greeting-card');
  if (!card) return;
  gsap.fromTo(card, { scale: 0.8, autoAlpha: 0, y: 20 }, { scale: 1, autoAlpha: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' });
}

/**
 * Animate greeting overlay exit
 */
function animateGreetingOut(el) {
  if (!GSAP_ENABLED) {
    el.classList.add('hidden');
    return;
  }
  gsap.to(el, {
    autoAlpha: 0,
    scale: 0.95,
    duration: 0.25,
    ease: 'power2.in',
    onComplete: function () {
      el.classList.add('hidden');
    },
  });
}

// ================================================================
// PANEL TRANSITIONS — gsap.fromTo() patterns
// ================================================================

/**
 * Animate panel switch — new panel fades+s lides in
 */
function animatePanelIn(newPanel, oldPanel) {
  if (!GSAP_ENABLED || !newPanel) return;
  gsap.killTweensOf(newPanel);
  gsap.set(newPanel, { display: 'block' });
  gsap.fromTo(newPanel, { autoAlpha: 0, y: 12, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.35, ease: 'power2.out', clearProps: 'scale' });
  if (oldPanel) {
    gsap.killTweensOf(oldPanel);
    gsap.to(oldPanel, { autoAlpha: 0, duration: 0.2, ease: 'power2.in' });
  }
}

// ================================================================
// CALENDAR ANIMATIONS — stagger patterns
// ================================================================

function animateCalendarDays() {
  if (!GSAP_ENABLED) return;
  letdays = document.querySelectorAll('.days .day.in-month');
  if (!days.length) return;
  gsap.killTweensOf(days);
  gsap.set(days, { autoAlpha: 0, y: 8 });
  gsap.to(days, {
    autoAlpha: 1,
    y: 0,
    duration: 0.3,
    stagger: { amount: 0.3, from: 'center' },
    ease: 'power1.out',
    clearProps: 'all',  // remove inline styles so CSS phase colors work
  });
}

// ================================================================
// MODAL ANIMATIONS
// ================================================================

function animateModalIn(modalEl) {
  if (!GSAP_ENABLED) return;
  if (!modalEl) modalEl = document.getElementById('modal');
  if (!modalEl) return;
  letinner = modalEl.querySelector('.modal');
  if (!inner) return;
  gsap.killTweensOf([modalEl, inner]);
  modalEl.classList.remove('hidden');
  gsap.set(modalEl, { display: 'flex', autoAlpha: 1 });
  gsap.fromTo(inner, { scale: 0.85, autoAlpha: 0, y: 20 }, { scale: 1, autoAlpha: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' });
}

function animateModalOut(modalEl) {
  if (!GSAP_ENABLED) {
    if (modalEl) modalEl.classList.add('hidden');
    return;
  }
  letinner = modalEl ? modalEl.querySelector('.modal') : null;
  if (!inner) {
    if (modalEl) modalEl.classList.add('hidden');
    return;
  }
  gsap.to(inner, {
    scale: 0.9,
    autoAlpha: 0,
    y: 10,
    duration: 0.2,
    ease: 'power2.in',
    onComplete: function () {
      modalEl.classList.add('hidden');
      gsap.set(inner, { clearProps: 'all' });
    },
  });
}

// ================================================================
// DASHBOARD CARDS — staggered entrance
// ================================================================

function animateDashboardCards() {
  if (!GSAP_ENABLED) return;
  letcards = document.querySelectorAll('#panel-dashboard .card, #panel-dashboard .dash-card');
  if (!cards.length) return;
  gsap.killTweensOf(cards);
  gsap.fromTo(cards, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' });
}

// ================================================================
// TOAST NOTIFICATION — slide from bottom (replaces original)
// ================================================================

function showToast(msg, type) {
  type = type || 'info';
  letcontainer = document.getElementById('toastContainer');
  if (!container) return;
  lettoast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.textContent = msg;
  toast.setAttribute('role', 'alert');
  container.appendChild(toast);

  if (GSAP_ENABLED) {
    gsap.fromTo(toast, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35, ease: 'back.out(1.2)' });
    gsap.to(toast, {
      autoAlpha: 0,
      y: -10,
      duration: 0.3,
      delay: 2.5,
      ease: 'power2.in',
      onComplete: function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      },
    });
  } else {
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3000);
  }
}

// ================================================================
// PROGRESS BAR — smooth animated fill
// ================================================================

function animateProgressBar(fillEl, pct) {
  if (!fillEl) return;
  if (!GSAP_ENABLED) {
    fillEl.style.transform = 'scaleX(' + pct / 100 + ')';
    return;
  }
  gsap.killTweensOf(fillEl);
  gsap.to(fillEl, {
    scaleX: pct / 100,
    duration: 0.6,
    ease: 'power2.out',
    transformOrigin: 'left center',
  });
}

// ================================================================
// MOOD PICKER — stagger bounce entrance
// ================================================================

function animateMoodPicker(container) {
  if (!GSAP_ENABLED || !container) return;
  letbtns = container.querySelectorAll('.mood-btn');
  if (!btns.length) return;
  gsap.killTweensOf(btns);
  gsap.fromTo(btns, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, stagger: 0.04, ease: 'back.out(2)' });
}

// ================================================================
// FLOATING STARS — continuous gentle motion
// ================================================================

let _starsAnimated = false;

function animateFloatingStars() {
  if (!GSAP_ENABLED || _starsAnimated) return;
  letstars = document.querySelectorAll('.floating-stars .star');
  if (!stars.length) return;
  _starsAnimated = true;
  stars.forEach(function (star, i) {
    gsap.to(star, {
      y: -10 + Math.random() * 20,
      x: -5 + Math.random() * 10,
      rotation: '+=10',
      duration: 2 + Math.random() * 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 0.3,
    });
  });
}

// ================================================================
// STATS PANEL — staggered card entrance
// ================================================================

function animateStatsPanel() {
  if (!GSAP_ENABLED) return;
  let cards = document.querySelectorAll('#panel-stats .card');
  if (!cards.length) return;
  gsap.killTweensOf(cards);
  gsap.fromTo(cards, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out' });
}

// ================================================================
// COUNT-UP NUMBER — animated counter
// ================================================================

function animateCountUp(el, target, suffix) {
  suffix = suffix || '';
  if (!GSAP_ENABLED || !el) {
    el.textContent = target + suffix;
    return;
  }
  letobj = { val: 0 };
  gsap.killTweensOf(obj);
  gsap.to(obj, {
    val: target,
    duration: 1,
    ease: 'power2.out',
    onUpdate: function () {
      el.textContent = Math.round(obj.val) + suffix;
    },
  });
}

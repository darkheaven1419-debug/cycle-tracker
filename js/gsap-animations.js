/* ================================================================
   gsap-animations.js — GSAP Animation Module
   Following official gsap-skills best practices:
   - Transform/opacity for GPU-composited animations
   - autoAlpha for safe fade+visibility
   - stagger for multi-element entrances
   - timeline() for sequenced playback
   - back.out / power easing for natural feel
   - Graceful fallback when GSAP CDN is blocked
   ================================================================ */

const GSAP_ENABLED = typeof gsap !== 'undefined';

/* ------------------------------------------------------------------ */
/*  ENTRANCE ANIMATIONS                                               */
/* ------------------------------------------------------------------ */

function animateLoginEntrance() {
  if (!GSAP_ENABLED) return;
  const el = document.querySelectorAll('.login-card');
  if (!el.length) return;
  gsap.fromTo(el, { y: 30, autoAlpha: 0, scale: 0.92 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.12, ease: 'back.out(1.4)' });
}

function animateGreetingIn() {
  if (!GSAP_ENABLED) return;
  const el = document.querySelector('.greeting-card');
  if (!el) return;
  gsap.fromTo(el, { scale: 0.8, autoAlpha: 0, y: 20 }, { scale: 1, autoAlpha: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' });
}

function animateGreetingOut(el) {
  if (!GSAP_ENABLED || !el) { if (el) el.classList.add('hidden'); return; }
  gsap.to(el, {
    autoAlpha: 0, scale: 0.95, duration: 0.25, ease: 'power2.in',
    onComplete: function () { el.classList.add('hidden'); }
  });
}

/* ------------------------------------------------------------------ */
/*  CALENDAR — stagger entrance, clearProps to preserve CSS colors    */
/* ------------------------------------------------------------------ */

function animateCalendarDays() {
  if (!GSAP_ENABLED) return;
  const el = document.querySelectorAll('.days .day.in-month');
  if (!el.length) return;
  gsap.killTweensOf(el);
  gsap.set(el, { autoAlpha: 0, y: 8 });
  gsap.to(el, {
    autoAlpha: 1, y: 0, duration: 0.3,
    stagger: { amount: 0.3, from: 'center' },
    ease: 'power1.out',
    clearProps: 'all'  /* remove inline styles so CSS phase colors work */
  });
}

/* ------------------------------------------------------------------ */
/*  MODAL                                                              */
/* ------------------------------------------------------------------ */

function animateModalIn(modalEl) {
  if (!GSAP_ENABLED) return;
  if (!modalEl) modalEl = document.getElementById('modal');
  if (!modalEl) return;
  const inner = modalEl.querySelector('.modal');
  if (!inner) return;
  gsap.killTweensOf([modalEl, inner]);
  modalEl.classList.remove('hidden');
  gsap.set(modalEl, { display: 'flex', autoAlpha: 1 });
  gsap.fromTo(inner, { scale: 0.85, autoAlpha: 0, y: 20 }, { scale: 1, autoAlpha: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' });
}

function animateModalOut(modalEl) {
  if (!GSAP_ENABLED || !modalEl) { if (modalEl) modalEl.classList.add('hidden'); return; }
  const inner = modalEl.querySelector('.modal');
  if (!inner) { modalEl.classList.add('hidden'); return; }
  gsap.to(inner, {
    scale: 0.9, autoAlpha: 0, y: 10, duration: 0.2, ease: 'power2.in',
    onComplete: function () {
      modalEl.classList.add('hidden');
      gsap.set(inner, { clearProps: 'all' });
    }
  });
}

/* ------------------------------------------------------------------ */
/*  DASHBOARD CARDS — staggered entrance                              */
/* ------------------------------------------------------------------ */

function animateDashboardCards() {
  if (!GSAP_ENABLED) return;
  const el = document.querySelectorAll('#panel-dashboard .card, #panel-dashboard .dash-card');
  if (!el.length) return;
  gsap.killTweensOf(el);
  gsap.fromTo(el, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' });
}

/* ------------------------------------------------------------------ */
/*  TOAST — replaces original showToast()                             */
/* ------------------------------------------------------------------ */

function showToast(msg, type) {
  type = type || 'info';
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.textContent = msg;
  toast.setAttribute('role', 'alert');
  container.appendChild(toast);

  if (GSAP_ENABLED) {
    gsap.fromTo(toast, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35, ease: 'back.out(1.2)' });
    gsap.to(toast, {
      autoAlpha: 0, y: -10, duration: 0.3, delay: 2.5, ease: 'power2.in',
      onComplete: function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }
    });
  } else {
    setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 3000);
  }
}

/* ------------------------------------------------------------------ */
/*  PROGRESS BAR                                                       */
/* ------------------------------------------------------------------ */

function animateProgressBar(fillEl, pct) {
  if (!fillEl) return;
  if (!GSAP_ENABLED) { fillEl.style.transform = 'scaleX(' + (pct / 100) + ')'; return; }
  gsap.killTweensOf(fillEl);
  gsap.to(fillEl, { scaleX: pct / 100, duration: 0.6, ease: 'power2.out', transformOrigin: 'left center' });
}

/* ------------------------------------------------------------------ */
/*  MOOD PICKER                                                        */
/* ------------------------------------------------------------------ */

function animateMoodPicker(container) {
  if (!GSAP_ENABLED || !container) return;
  const el = container.querySelectorAll('.mood-btn');
  if (!el.length) return;
  gsap.killTweensOf(el);
  gsap.fromTo(el, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, stagger: 0.04, ease: 'back.out(2)' });
}

/* ------------------------------------------------------------------ */
/*  FLOATING STARS — continuous gentle motion (runs once)             */
/* ------------------------------------------------------------------ */

let _starsAnimated = false;

function animateFloatingStars() {
  if (!GSAP_ENABLED || _starsAnimated) return;
  const el = document.querySelectorAll('.floating-stars .star');
  if (!el.length) return;
  _starsAnimated = true;
  el.forEach(function (star, i) {
    gsap.to(star, {
      y: -10 + Math.random() * 20, x: -5 + Math.random() * 10, rotation: '+=10',
      duration: 2 + Math.random() * 2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * 0.3
    });
  });
}

/* ------------------------------------------------------------------ */
/*  STATS PANEL                                                        */
/* ------------------------------------------------------------------ */

function animateStatsPanel() {
  if (!GSAP_ENABLED) return;
  const el = document.querySelectorAll('#panel-stats .card');
  if (!el.length) return;
  gsap.killTweensOf(el);
  gsap.fromTo(el, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out' });
}

/* ------------------------------------------------------------------ */
/*  COUNT-UP NUMBER                                                    */
/* ------------------------------------------------------------------ */

function animateCountUp(el, target, suffix) {
  suffix = suffix || '';
  if (!GSAP_ENABLED || !el) { el.textContent = target + suffix; return; }
  const obj = { val: 0 };
  gsap.killTweensOf(obj);
  gsap.to(obj, { val: target, duration: 1, ease: 'power2.out',
    onUpdate: function () { el.textContent = Math.round(obj.val) + suffix; }
  });
}

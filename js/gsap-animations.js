/* ================================================================
   gsap-animations.js — GSAP Animation Module v2
   ================================================================
   Following official gsap-skills best practices:
   - gsap-core: to(), from(), fromTo(), stagger, easing, matchMedia
   - gsap-timeline: timeline(), position param, nesting, labels
   - gsap-scrolltrigger: scroll-triggered reveals
   - gsap-performance: transform/opacity only, will-change, batch
   - gsap-utils: random(), clamp() for dynamic values
   ================================================================ */

// --- Register plugins ---
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  // Global defaults for all animations (gsap-core best practice)
  gsap.defaults({
    ease: 'power2.out',
    duration: 0.4
  });

  // Responsive + reduced-motion handling (gsap-core: matchMedia)
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: reduce)', () => {
    // Kill all animations when user prefers reduced motion
    gsap.set('.gsap-animate', { clearProps: 'all' });
    return () => {}; // cleanup
  });
}

const HAS_GSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

/* ================================================================
   LOGIN — stagger entrance with timeline (gsap-timeline pattern)
   ================================================================ */
function animateLoginEntrance() {
  if (!HAS_GSAP) return;
  const cards = document.querySelectorAll('.login-card');
  if (!cards.length) return;
  // timeline() for sequenced entrance (gsap-timeline)
  const tl = gsap.timeline({ defaults: { duration: 0.5, ease: 'back.out(1.4)' } });
  tl.from(cards, { y: 40, autoAlpha: 0, scale: 0.9, stagger: 0.15 })
    .from('.login-title', { y: -20, autoAlpha: 0, duration: 0.4 }, '-=0.3')
    .from('.login-pin-area', { y: 15, autoAlpha: 0, duration: 0.3 }, '-=0.1');
}

/* ================================================================
   GREETING — spring entrance (gsap-core: back easing)
   ================================================================ */
function animateGreetingIn() {
  if (!HAS_GSAP) return;
  const card = document.querySelector('.greeting-card');
  if (!card) return;
  const tl = gsap.timeline({ defaults: { ease: 'back.out(1.7)', duration: 0.5 } });
  tl.from(card, { scale: 0.7, autoAlpha: 0, y: 30 })
    .from('.greeting-icon', { scale: 0, rotation: -180, duration: 0.4 }, '-=0.2')
    .from('.greeting-name', { y: 10, autoAlpha: 0 }, '-=0.15')
    .from('.greeting-msg', { y: 10, autoAlpha: 0 }, '-=0.1');
}

function animateGreetingOut(el) {
  if (!HAS_GSAP || !el) { if (el) el.classList.add('hidden'); return; }
  gsap.to(el, {
    autoAlpha: 0, scale: 0.95, duration: 0.25, ease: 'power2.in',
    onComplete() { el.classList.add('hidden'); }
  });
}

/* ================================================================
   CALENDAR — stagger from center (gsap-core: stagger)
   ================================================================ */
function animateCalendarDays() {
  if (!HAS_GSAP) return;
  const cells = document.querySelectorAll('.days .day.in-month');
  if (!cells.length) return;
  gsap.killTweensOf(cells);
  gsap.from(cells, {
    autoAlpha: 0, y: 10,
    duration: 0.35, stagger: { amount: 0.35, from: 'center' },
    ease: 'power1.out',
    clearProps: 'all' // remove inline styles after animation so CSS phase colors work
  });
}

/* ================================================================
   MODAL — scale+fade with timeline (gsap-timeline)
   ================================================================ */
function animateModalIn(modalEl) {
  if (!HAS_GSAP) return;
  if (!modalEl) modalEl = document.getElementById('modal');
  if (!modalEl) return;
  const inner = modalEl.querySelector('.modal');
  if (!inner) return;
  gsap.killTweensOf([modalEl, inner]);
  modalEl.classList.remove('hidden');
  gsap.set(modalEl, { display: 'flex', autoAlpha: 1 });

  const tl = gsap.timeline({ defaults: { ease: 'back.out(1.4)', duration: 0.4 } });
  tl.from(inner, { scale: 0.85, autoAlpha: 0, y: 20 })
    .from('.modal h2', { y: -8, autoAlpha: 0, duration: 0.25 }, '-=0.2')
    .from('.info-row', { y: 6, autoAlpha: 0, stagger: 0.05, duration: 0.2 }, '-=0.1');
}

function animateModalOut(modalEl) {
  if (!HAS_GSAP || !modalEl) { if (modalEl) modalEl.classList.add('hidden'); return; }
  const inner = modalEl.querySelector('.modal');
  if (!inner) { modalEl.classList.add('hidden'); return; }
  gsap.to(inner, {
    scale: 0.9, autoAlpha: 0, y: 10, duration: 0.2, ease: 'power2.in',
    onComplete() {
      modalEl.classList.add('hidden');
      gsap.set(inner, { clearProps: 'all' });
    }
  });
}

/* ================================================================
   DASHBOARD — staggered card entrance
   ================================================================ */
function animateDashboardCards() {
  if (!HAS_GSAP) return;
  const cards = document.querySelectorAll('#panel-dashboard .card, #panel-dashboard .dash-card');
  if (!cards.length) return;
  gsap.killTweensOf(cards);
  gsap.from(cards, {
    autoAlpha: 0, y: 20,
    duration: 0.45, stagger: 0.1, ease: 'power2.out',
    clearProps: 'all'
  });
}

/* ================================================================
   TOAST — slide-up with auto-dismiss (gsap-core pattern)
   ================================================================ */
function showToast(msg, type) {
  type = type || 'info';
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.textContent = msg;
  toast.setAttribute('role', 'alert');
  container.appendChild(toast);

  if (HAS_GSAP) {
    gsap.fromTo(toast, { y: 40, autoAlpha: 0, scale: 0.95 },
      { y: 0, autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(1.2)' });
    gsap.to(toast, {
      autoAlpha: 0, y: -10, duration: 0.3, delay: 2.5, ease: 'power2.in',
      onComplete() { if (toast.parentNode) toast.parentNode.removeChild(toast); }
    });
  } else {
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 3000);
  }
}

/* ================================================================
   PROGRESS BAR — GSAP animates scaleX (gsap-performance: transform)
   ================================================================ */
function animateProgressBar(fillEl, pct) {
  if (!fillEl) return;
  if (!HAS_GSAP) { fillEl.style.transform = 'scaleX(' + (pct / 100) + ')'; return; }
  gsap.killTweensOf(fillEl);
  gsap.to(fillEl, {
    scaleX: pct / 100, duration: 0.7, ease: 'power2.out',
    transformOrigin: 'left center'
  });
}

/* ================================================================
   MOOD PICKER — stagger bounce (gsap-core: back easing + stagger)
   ================================================================ */
function animateMoodPicker(container) {
  if (!HAS_GSAP || !container) return;
  const btns = container.querySelectorAll('.mood-btn');
  if (!btns.length) return;
  gsap.killTweensOf(btns);
  gsap.from(btns, {
    scale: 0, autoAlpha: 0, duration: 0.35, stagger: 0.05, ease: 'back.out(2.5)',
    clearProps: 'all'
  });
}

/* ================================================================
   FLOATING STARS — continuous yoyo float (gsap-core: repeat/yoyo)
   ================================================================ */
let _starsAnimated = false;

function animateFloatingStars() {
  if (!HAS_GSAP || _starsAnimated) return;
  const stars = document.querySelectorAll('.floating-stars .star');
  if (!stars.length) return;
  _starsAnimated = true;

  // gsap.utils.random() for varied motion (gsap-utils pattern)
  stars.forEach((star, i) => {
    gsap.to(star, {
      y: gsap.utils.random(-15, 15),
      x: gsap.utils.random(-8, 8),
      rotation: gsap.utils.random(-8, 8),
      duration: gsap.utils.random(2, 4),
      repeat: -1, yoyo: true, ease: 'sine.inOut',
      delay: i * 0.25
    });
  });
}

/* ================================================================
   STATS PANEL — staggered card entrance
   ================================================================ */
function animateStatsPanel() {
  if (!HAS_GSAP) return;
  const cards = document.querySelectorAll('#panel-stats .card');
  if (!cards.length) return;
  gsap.killTweensOf(cards);
  gsap.from(cards, {
    autoAlpha: 0, y: 16, duration: 0.4, stagger: 0.08, ease: 'power2.out',
    clearProps: 'all'
  });
}

/* ================================================================
   COUNT-UP — gsap.to() with onUpdate for animated numbers
   ================================================================ */
function animateCountUp(el, target, suffix) {
  suffix = suffix || '';
  if (!HAS_GSAP || !el) { el.textContent = target + suffix; return; }
  const obj = { val: 0 };
  gsap.killTweensOf(obj);
  gsap.to(obj, {
    val: target, duration: 1.2, ease: 'power2.out',
    onUpdate() { el.textContent = Math.round(obj.val) + suffix; }
  });
}

/* ================================================================
   SCROLL-TRIGGERED REVEALS (gsap-scrolltrigger: ScrollTrigger.batch)
   ================================================================ */
function setupScrollReveals() {
  if (!HAS_GSAP) return;

  // Reveal stat cards and chart cards as they scroll into view
  ScrollTrigger.batch('.card, .stats-mini-card, .chart-card, .love-note-card, .garden-card', {
    interval: 0.1,
    batchMax: 6,
    onEnter: (batch) => gsap.fromTo(batch,
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', overwrite: true }
    ),
    start: 'top 90%',
    once: true  // only animate once
  });

  // Reveal diary entries in the timeline
  ScrollTrigger.batch('.diary-entry, .letter-card, .timeline-item', {
    interval: 0.1,
    batchMax: 5,
    onEnter: (batch) => gsap.fromTo(batch,
      { autoAlpha: 0, x: -20 },
      { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out', overwrite: true }
    ),
    start: 'top 88%',
    once: true
  });
}

/* ================================================================
   INIT — called once from bootApp
   ================================================================ */
function initGsapAnimations() {
  // Read-only check — don't throw if GSAP failed to load
  if (!HAS_GSAP) return;
  setupScrollReveals();
  animateFloatingStars();
}

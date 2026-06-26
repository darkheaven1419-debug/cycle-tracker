/* ================================================================
   AuthModule — encapsulated login/logout/auth state
   Dependencies (global): activeProfile, state, lang, bootApp,
     applyTheme, loadCalendarData, solarTermsCache,
     saveSharedDiaryData, pushAllSharedData, pullAllSharedData,
     _syncInterval, getGitHubToken, toggleProfile (may be overridden)
   ================================================================ */
const AuthModule = (function () {
  'use strict';

  // ── SHA-256 hashed PINs (not plaintext) ──────────────────────────
  const LOGIN_PINS = {
    andjela: '8e614d39a1f1279958da1c9f7e8df51db4aabca8cc3a3e84f8c3dc5f88e1fcfb',
    barry: '286aee2ea4a5ba67539432dc5ea3865c3b204d3caaccb662995388d156a279cf',
  };

  // ── Internal state ──────────────────────────────────────────────
  let _selectedLoginProfile = null;
  let _isLoggedIn = false;

  // ── Public API ──────────────────────────────────────────────────

  /** Check if a user is currently logged in. */
  function isLoggedIn() {
    return _isLoggedIn;
  }

  /** Return the currently selected (but not yet verified) login profile. */
  function getSelectedProfile() {
    return _selectedLoginProfile;
  }

  /** Return the raw PIN hashes object (read-only reference). */
  function getPinHashes() {
    return LOGIN_PINS;
  }

  /**
   * selectLogin — choose a profile card on the login screen.
   * @param {string} profile - 'andjela' or 'barry'
   */
  function selectLogin(profile) {
    _selectedLoginProfile = profile;

    // Set language based on profile: Andjela -> sr, Barry -> zh-CN
    const profileLang = profile === 'barry' ? 'zh-CN' : 'sr';
    lang = profileLang;
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.lang === lang);
    });

    // Update card selection visuals
    const cardA = document.getElementById('loginCardAndjela');
    const cardB = document.getElementById('loginCardBarry');
    if (cardA) cardA.classList.toggle('selected', profile === 'andjela');
    if (cardB) cardB.classList.toggle('selected', profile === 'barry');

    // Update login UI text
    const pinBtn = document.getElementById('loginPinBtn');
    if (pinBtn) {
      pinBtn.textContent = t('authPinBtn');
    }
    const hintA = document.getElementById('lc-hint-a');
    const hintB = document.getElementById('lc-hint-b');
    const hintText = t('authTapHint');
    if (hintA) hintA.textContent = hintText;
    if (hintB) hintB.textContent = hintText;

    // Show PIN area
    const pinArea = document.getElementById('loginPinArea');
    if (pinArea) pinArea.classList.add('show');

    const pinInput = document.getElementById('loginPinInput');
    if (pinInput) {
      pinInput.value = '';
      setTimeout(function () {
        pinInput.focus();
      }, 300);
    }

    const errorEl = document.getElementById('loginError');
    if (errorEl) errorEl.textContent = '';

    const switchHint = document.getElementById('loginSwitchHint');
    if (switchHint) {
      switchHint.textContent = t('authSwitchHint');
    }

    spawnLoginHearts();
  }

  /**
   * verifyLogin — hash entered PIN and compare against stored hash.
   * On success: sets activeProfile, persists, boots app.
   */
  function verifyLogin() {
    const pinEl = document.getElementById('loginPinInput');
    const pin = pinEl ? pinEl.value : '';
    let card;
    if (_selectedLoginProfile === 'andjela') {
      card = document.getElementById('loginCardAndjela');
    } else {
      card = document.getElementById('loginCardBarry');
    }

    hashPIN(pin).then(function (hashed) {
      if (hashed === LOGIN_PINS[_selectedLoginProfile]) {
        // Correct PIN
        activeProfile = _selectedLoginProfile;
        localStorage.setItem('cycle-active-profile', activeProfile);
        sessionStorage.setItem('cycle-logged-in', '1');
        _isLoggedIn = true;

        const overlay = document.getElementById('loginOverlay');
        if (overlay) overlay.classList.add('hidden');

        bootApp();
      } else {
        // Wrong PIN
        if (card) card.classList.add('shake');
        const errorEl = document.getElementById('loginError');
        if (errorEl) {
          errorEl.textContent = _selectedLoginProfile === 'barry' ? 'PIN 不对，再试一次' : 'Pogrešan PIN — pokušaj ponovo';
        }
        if (pinEl) pinEl.value = '';
        setTimeout(function () {
          if (card) card.classList.remove('shake');
        }, 500);
      }
    });
  }

  /**
   * logout — return to login screen, clear all session state.
   */
  function logout() {
    // Stop sync interval
    if (typeof _syncInterval !== 'undefined' && _syncInterval !== null) {
      clearInterval(_syncInterval);
      _syncInterval = null;
    }

    _isLoggedIn = false;
    _selectedLoginProfile = null;
    activeProfile = null;

    // Reset global state
    state = {
      records: [],
      symptoms: {},
      moods: {},
      diaries: {},
      settings: { cycleLength: 28, periodLength: 7, manualOverride: false },
      _migrated: true,
    };

    localStorage.removeItem('cycle-active-profile');
    localStorage.removeItem('cycle-login-day');
    lang = 'sr';

    // Show login overlay and reset its UI
    const overlay = document.getElementById('loginOverlay');
    if (overlay) overlay.classList.remove('hidden');

    const pinArea = document.getElementById('loginPinArea');
    if (pinArea) pinArea.classList.remove('show');

    const cardA = document.getElementById('loginCardAndjela');
    const cardB = document.getElementById('loginCardBarry');
    if (cardA) cardA.classList.remove('selected');
    if (cardB) cardB.classList.remove('selected');

    const switchHint = document.getElementById('loginSwitchHint');
    if (switchHint) switchHint.textContent = '👈 Izaberi svoj profil i unesi PIN';

    const pinInput = document.getElementById('loginPinInput');
    if (pinInput) pinInput.value = '';

    const errorEl = document.getElementById('loginError');
    if (errorEl) errorEl.textContent = '';

    const pinBtn = document.getElementById('loginPinBtn');
    if (pinBtn) pinBtn.textContent = '🔓 Prijavi se';

    const hintA = document.getElementById('lc-hint-a');
    const hintB = document.getElementById('lc-hint-b');
    if (hintA) hintA.textContent = 'Dodirni za prijavu';
    if (hintB) hintB.textContent = 'Dodirni za prijavu';
  }

  /**
   * init — one-time boot check: restore session or show login.
   * Called from the IIFE at the end of app.js.
   */
  function init() {
    applyTheme(localStorage.getItem('cycle-theme') || 'light');

    // Preload calendar/solar terms data
    loadCalendarData(function (data) {
      solarTermsCache = (data && data.solarTerms) || [];
      localStorage.setItem('cycle-solarterms', JSON.stringify(solarTermsCache));
    });

    const sessionLoggedIn = sessionStorage.getItem('cycle-logged-in');
    const savedProfile = localStorage.getItem('cycle-active-profile');

    if (savedProfile && sessionLoggedIn === '1') {
      activeProfile = savedProfile;
      _isLoggedIn = true;
      const overlay = document.getElementById('loginOverlay');
      if (overlay) overlay.classList.add('hidden');

      bootApp().catch(function (e) {
        console.error('bootApp failed:', e);
      });
    } else {
      localStorage.removeItem('cycle-active-profile');
      const overlay = document.getElementById('loginOverlay');
      if (overlay) overlay.classList.remove('hidden');
    }
  }

  // ── Internal helpers ────────────────────────────────────────────

  /**
   * hashPIN — SHA-256 hash using Web Crypto API.
   * @param {string} pin
   * @returns {Promise<string>}
   */
  function hashPIN(pin) {
    if (!pin) return Promise.resolve('');
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(pin);
      return crypto.subtle.digest('SHA-256', data).then(function (hashBuffer) {
        return Array.from(new Uint8Array(hashBuffer))
          .map(function (b) {
            return b.toString(16).padStart(2, '0');
          })
          .join('');
      });
    } catch (e) {
      // Fallback for very old browsers: simple hash (less secure but better than plaintext)
      let h = 0;
      for (let i = 0; i < pin.length; i++) {
        h = (h << 5) - h + pin.charCodeAt(i);
        h |= 0;
      }
      return Promise.resolve('fallback_' + Math.abs(h).toString(16));
    }
  }

  /**
   * spawnLoginHearts — decorative heart animation on login screen.
   */
  function spawnLoginHearts() {
    const overlay = document.getElementById('loginOverlay');
    if (!overlay) return;

    const hearts = ['💕', '💖', '💗', '💝', '🌸', '✨', '🌷', '🕊️'];

    for (let i = 0; i < 15; i++) {
      (function (idx) {
        setTimeout(function () {
          const h = document.createElement('span');
          h.textContent = hearts[idx % hearts.length];
          h.style.cssText =
            'position:fixed;pointer-events:none;z-index:1001;' +
            'font-size:' +
            (0.8 + Math.random() * 1.5) +
            'rem;' +
            'left:' +
            (5 + Math.random() * 90) +
            '%;' +
            'top:' +
            (80 + Math.random() * 15) +
            '%;' +
            'animation:loginHeartFloat ' +
            (2 + Math.random() * 3) +
            's ease-out forwards';
          h.style.opacity = '0.7';
          overlay.appendChild(h);
          setTimeout(function () {
            if (h.parentNode) h.remove();
          }, 3500);

          // Add keyframes if not present
          if (!document.getElementById('loginHeartKeyframes')) {
            const style = document.createElement('style');
            style.id = 'loginHeartKeyframes';
            style.textContent =
              '@keyframes loginHeartFloat{' +
              '0%{opacity:1;transform:translateY(0) scale(1) rotate(0deg)}' +
              '100%{opacity:0;transform:translateY(-120px) scale(.3) rotate(45deg)}}';
            document.head.appendChild(style);
          }
        }, idx * 120);
      })(i);
    }
  }

  // ── Public interface ────────────────────────────────────────────
  return {
    init: init,
    login: verifyLogin, // alias: login == verifyLogin
    logout: logout,
    selectLogin: selectLogin,
    verifyLogin: verifyLogin,
    isLoggedIn: isLoggedIn,
    getSelectedProfile: getSelectedProfile,
    getPinHashes: getPinHashes,
  };
})();

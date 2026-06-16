/* app-es5.js — ES5 fallback for old browsers (VivoBrowser, UC, Android 5-7)
   Pure ES5: no const/let, no =>, no ``, no class
   Core: login + diary + messages */
(function() {
  'use strict';
  var PIN = { barry: '0827', andjela: '1909' };
  var profile = localStorage.getItem('cycle-active-profile') || 'barry';
  var selected = null;

  function $(id) { return document.getElementById(id); }
  function safe(el, fn) { if (el) fn(el); }

  window.selectLogin = function(p) {
    selected = p;
    safe($('loginCardAndjela'), function(e) { e.classList.toggle('selected', p === 'andjela'); });
    safe($('loginCardBarry'), function(e) { e.classList.toggle('selected', p === 'barry'); });
    safe($('loginPinArea'), function(e) { e.classList.add('show'); });
    safe($('loginPinInput'), function(e) { e.value = ''; });
    safe($('loginError'), function(e) { e.textContent = ''; });
    var pinEl = $('loginPinInput'); if (pinEl) setTimeout(function() { pinEl.focus(); }, 300);
  };

  window.verifyLogin = function() {
    var pinEl = $('loginPinInput');
    var pin = pinEl ? pinEl.value : '';
    if (pin === PIN[selected]) {
      profile = selected;
      localStorage.setItem('cycle-active-profile', profile);
      sessionStorage.setItem('cycle-logged-in', '1');
      safe($('loginOverlay'), function(e) { e.classList.add('hidden'); });
      showApp();
    } else {
      safe($('loginError'), function(e) { e.textContent = 'Pogresan PIN'; });
      if (pinEl) pinEl.value = '';
    }
  };

  function fmt(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }

  function t(key) {
    var zh = { diary:'📝 日记', save:'💾 保存', msg:'💌 留言', send:'📨 发送', links:'🔗 链接', logout:'🚪 退出', dph:'写今天的日记...', mph:'写留言...', empty:'暂无记录', noMsg:'暂无留言' };
    var sr = { diary:'📝 Dnevnik', save:'💾 Sačuvaj', msg:'💌 Poruka', send:'📨 Pošalji', links:'🔗 Linkovi', logout:'🚪 Odjavi se', dph:'Napiši danas...', mph:'Napiši poruku...', empty:'Još nema unosa', noMsg:'Nema poruka' };
    return (profile === 'barry' ? zh : sr)[key] || key;
  }

  function showApp() {
    var ldr = $('appLoader'); if (ldr) ldr.style.display = 'none';
    var app = document.querySelector('.app'); if (!app) return;
    app.style.display = '';
    var nm = profile === 'barry' ? '👦 Barry' : '🌸 Anđela';

    app.innerHTML = '<div style="padding:8px 0;display:flex;justify-content:space-between"><h2 style="font-size:1.1rem;color:#c45a6b">🌸 Ciklus</h2><button id="lb" style="padding:6px 12px;border:1px solid #e5dad4;border-radius:10px;background:#fff;color:#c45a6b;font-size:.65rem">'+t('logout')+'</button></div>'+
      '<div style="font-size:.65rem;color:#c49a5e;margin-bottom:10px">'+nm+' · ES5</div>'+
      '<div class="c"><h3>'+t('diary')+'</h3><div style="font-size:.72rem;margin-bottom:4px">'+fmt()+'</div><textarea id="da" rows="3" placeholder="'+t('dph')+'" class="tx"></textarea><button id="sb" class="bt">'+t('save')+'</button><div id="dl" style="margin-top:10px"></div></div>'+
      '<div class="c"><h3>'+t('msg')+'</h3><textarea id="ma" rows="2" placeholder="'+t('mph')+'" class="tx"></textarea><button id="mb" class="bt">'+t('send')+'</button><div id="ml" style="margin-top:10px"></div></div>'+
      '<div class="c"><h3>'+t('links')+'</h3><a href="index.html" class="lk">🏠 Sajt</a> <a href="lite.html" class="lk">⚡ Lite</a> <a href="static.html" class="lk">🔧 Test</a></div>';

    safe($('sb'), function(e) { e.addEventListener('click', saveD); });
    safe($('mb'), function(e) { e.addEventListener('click', saveM); });
    safe($('lb'), function(e) { e.addEventListener('click', function() { sessionStorage.removeItem('cycle-logged-in'); location.reload(); }); });
    renderD(); renderM();
  }

  function loadD() { try { return JSON.parse(localStorage.getItem('es5-diary')) || {}; } catch(e) { return {}; } }
  function saveD() {
    var el = $('da'); if (!el) return; var tx = el.value.trim(); if (!tx) return;
    var d = loadD(), k = fmt();
    if (!d[k]) d[k] = []; d[k].push({ t: tx, tm: Date.now(), a: profile });
    localStorage.setItem('es5-diary', JSON.stringify(d));
    el.value = ''; renderD();
  }
  function renderD() {
    var el = $('dl'); if (!el) return;
    var d = loadD(), ks = Object.keys(d).sort().reverse(), h = '';
    if (ks.length === 0) h = '<div class="em">'+t('empty')+'</div>';
    else for (var i = 0; i < Math.min(ks.length, 20); i++) {
      var k = ks[i], es = d[k];
      for (var j = 0; j < es.length; j++) {
        var e = es[j], ic = e.a === 'barry' ? '👦' : '🌸', ts = new Date(e.tm).toLocaleTimeString('sr-Latn',{hour:'2-digit',minute:'2-digit'});
        h += '<div class="hi"><b>'+k+'</b> '+ic+' '+ts+'<br>'+e.t.substring(0,150)+'</div>';
      }
    }
    el.innerHTML = h;
  }

  function loadM() { try { return JSON.parse(localStorage.getItem('es5-msgs')) || []; } catch(e) { return []; } }
  function saveM() {
    var el = $('ma'); if (!el) return; var tx = el.value.trim(); if (!tx) return;
    var m = loadM(); m.push({ a: profile, t: tx, tm: Date.now() });
    localStorage.setItem('es5-msgs', JSON.stringify(m));
    el.value = ''; renderM();
  }
  function renderM() {
    var el = $('ml'); if (!el) return;
    var m = loadM(), h = '';
    if (m.length === 0) h = '<div class="em">'+t('noMsg')+'</div>';
    else for (var i = m.length-1; i >= Math.max(0, m.length-20); i--) {
      var msg = m[i], ic = msg.a === 'barry' ? '👦' : '🌸', nm = msg.a === 'barry' ? 'Barry' : 'Anđela', ts = new Date(msg.tm).toLocaleTimeString('sr-Latn',{hour:'2-digit',minute:'2-digit'});
      h += '<div class="hi">'+ic+' <b>'+nm+'</b> '+ts+'<br>'+msg.t.substring(0,150)+'</div>';
    }
    el.innerHTML = h;
  }

  // Init
  if (sessionStorage.getItem('cycle-logged-in') === '1') {
    safe($('loginOverlay'), function(e) { e.classList.add('hidden'); });
    showApp();
  }
})();

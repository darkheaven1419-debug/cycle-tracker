"use strict";
(function () {
  console.log('[fix-css] 已加载');

  var _s = document.createElement('style');
  _s.textContent =
    /* === 通用布局 === */
    'html { overflow-x: hidden !important; }' +

    // #1 导航栏安全区（iPhone Home Indicator）
    'nav.tabs-nav { padding-bottom: env(safe-area-inset-bottom, 0px) !important; }' +
    'nav.tabs-nav { padding-bottom: constant(safe-area-inset-bottom, 0px) !important; }' +

    // #2 日历触摸目标 ≥44px
    '.day { min-height: 44px !important; display: flex !important; align-items: center !important; justify-content: center !important; }' +
    '.day .day-num { line-height: 1.2 !important; }' +
    'nav.tabs-nav .tabs .tab { min-height: 44px !important; padding: 8px 4px !important; }' +
    '.diary-date-btn { min-width: 44px !important; min-height: 44px !important; }' +
    '.mood-emoji { min-width: 44px !important; min-height: 44px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; }' +
    '.dash-link-btn { min-height: 44px !important; }' +
    '.todo-check, .todo-del { min-width: 44px !important; min-height: 44px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; }' +

    // #3 输入框字号 ≥16px（防止 iOS 自动缩放）
    '@media (max-width: 480px) {' +
    'input[type="text"], input[type="number"], input[type="password"], input[type="date"], input[type="time"], input[type="search"], textarea, select { font-size: 16px !important; }' +
    '.diary-textarea { font-size: 16px !important; }' +
    '}' +

    // #4 弹窗在小屏幕溢出修复
    '@media (max-width: 480px) {' +
    '#modal .modal { max-height: 85vh !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; margin: 10px auto !important; border-radius: 14px !important; }' +
    '#modal:not(.hidden) { display: flex !important; align-items: flex-end !important; justify-content: center !important; }' +
    '#modal .modal .btn-row { flex-direction: column !important; gap: 6px !important; }' +
    '#modal .modal .btn-row .btn { width: 100% !important; }' +
    '#modal .modal #modal-close-btn { margin-top: 8px !important; padding: 12px !important; min-height: 44px !important; }' +
    '}' +

    // #5 touch-active 状态（移动端无 hover）
    '.day:active:not(.other-month):not(.period-on):not(.ovulation):not(.fertile) { transform: scale(0.96) !important; }' +
    '.diary-date-btn:active { transform: translateY(0px) !important; box-shadow: none !important; }' +
    'nav.tabs-nav .tabs .tab:active { opacity: 0.7 !important; }' +
    '.dash-link-btn:active { transform: scale(0.97) !important; opacity: 0.8 !important; }' +
    '.todo-check:active { transform: scale(0.85) !important; }' +
    '.todo-del:active { transform: scale(0.9) !important; opacity: 0.6 !important; }' +
    '#fabBtn:active { transform: scale(0.92) !important; }' +
    '.nav-btn:active, .today-pill:active, .cal-view-btn:active { transform: scale(0.92) !important; opacity: 0.7 !important; }' +
    '.lang-btn:active { transform: scale(0.9) !important; }' +
    '.theme-btn:active { transform: scale(0.9) !important; }' +
    '.profile-pill:active { transform: scale(0.95) !important; }' +
    '.emoji-picker-cell:active { transform: scale(0.85) !important; }' +
    '.sym-chip:active { transform: scale(0.92) !important; }' +
    '.hug-btn:active, .diary-submit:active, .btn-primary:active { transform: scale(0.96) !important; opacity: 0.85 !important; }' +
    '.mood-emoji:not(.picked):active { transform: scale(0.9) !important; opacity: 1 !important; }' +

    // #9 星星动画性能优化 + 移动端居中修复
    '.floating-stars .star { will-change: transform, opacity !important; }' +
    'body { margin: 0 !important; overflow-x: hidden !important; width: 100% !important; max-width: 100vw !important; display: flex !important; justify-content: center !important; }' +
    'main { width: 100%; margin: 0; display: flex; justify-content: center; }' +
    '.app { width: 100% !important; max-width: 420px !important; margin: 0 auto !important; }' +
    '.calendar { width: 100% !important; margin: 0 auto !important; box-sizing: border-box !important; }' +
    '.days { grid-template-columns: repeat(7, 1fr) !important; gap: 3px !important; }' +
    '@media (max-width: 420px) { .days { gap: 2px !important; } .day { min-width: 0 !important; } }' +
    '.emoji-picker-overlay { display: none !important; }' +
    '.emoji-picker-overlay.hidden { display: none !important; }' +
    '.week-num { display: none !important; }' +
    'nav.tabs-nav .tabs { display: flex !important; justify-content: space-around !important; width: 100% !important; gap: 0 !important; }' +
    'nav.tabs-nav .tabs .tab.active { color: var(--love) !important; }' +
    '.progress-fill { transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) !important; }' +
    '.day.in-month { animation: fixDayIn 0.35s ease-out both; }' +
    '@keyframes fixDayIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }' +
    '@keyframes modalSlideIn { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }' +
    '#modal:not(.hidden) .modal { animation: modalSlideIn 0.22s ease-out; }' +

    /* === Todo List 动画 === */
    '@keyframes todoItemIn{from{opacity:0;transform:translateY(10px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}' +
    '.todo-item{animation:todoItemIn .35s cubic-bezier(.22,1,.36,1) both}' +
    '.todo-check{cursor:pointer;font-size:1rem;flex-shrink:0;margin-top:2px;width:22px;text-align:center;transition:transform .2s cubic-bezier(.22,1,.36,1)}' +
    '.todo-check:hover{transform:scale(1.2)}' +
    '.todo-check:active{transform:scale(.9)}' +
    '.todo-del{cursor:pointer;font-size:.65rem;opacity:.35;flex-shrink:0;padding:2px 4px;transition:opacity .2s,transform .2s}' +
    '.todo-del:hover{opacity:.8;transform:scale(1.15)}' +
    '.todo-del:active{transform:scale(.9)}' +

    /* === 心情动画 === */
    '@keyframes moodPop{0%{transform:scale(1) rotate(0deg)}40%{transform:scale(1.4) rotate(-10deg)}70%{transform:scale(1.25) rotate(5deg)}100%{transform:scale(1.3) rotate(0deg)}}' +
    '.mood-emoji{transition:transform .25s cubic-bezier(.22,1,.36,1),opacity .2s,background .2s,box-shadow .2s}' +
    '.mood-emoji:not(.picked){opacity:.78}' +
    '.mood-emoji:not(.picked):hover{transform:scale(1.18)!important;opacity:1!important}' +
    '.mood-emoji:not(.picked):active{transform:scale(.9)!important}' +
    '.mood-emoji.picked{animation:moodPop .4s cubic-bezier(.22,1,.36,1) both;background:var(--rose-light);box-shadow:0 0 0 2px var(--love)}' +

    /* === 仪表盘卡片动画 === */
    '@keyframes dashCardIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}' +
    '#todoListCard{animation:dashCardIn .45s cubic-bezier(.22,1,.36,1) both}' +

    /* === 空状态脉冲 === */
    '@keyframes emptyPulse{0%,100%{opacity:.65}50%{opacity:1}}' +
    '.chart-empty{animation:emptyPulse 2.8s ease-in-out infinite}' +

    /* === 日记面板隐藏重复元素 === */
    '#panel-diary .mt-10>.flex.gap-6.mt-8{display:none!important}' +

    /* === 日历格子 hover === */
    '.day{transition:transform .22s cubic-bezier(.22,1,.36,1),box-shadow .25s ease,border-color .22s ease,background .22s ease!important}' +
    '.day:hover:not(.other-month):not(.period-on):not(.ovulation):not(.fertile){transform:scale(1.1)!important;box-shadow:0 6px 20px rgba(196,90,107,.13)!important;border-color:rgba(196,90,107,.18)!important}' +

    /* === 日记模块：症状按钮隐藏 + 情书卡片 + 日期导航 === */
    'body:not(.is-barry) #tab-symptoms{display:none!important}' +
    '.diary-date-btn{transition:all .2s cubic-bezier(.22,1,.36,1)!important}' +
    '.diary-date-btn:hover{transform:translateY(-2px)!important;box-shadow:0 3px 10px rgba(196,90,107,.15)!important}' +
    '.diary-date-btn.current{box-shadow:0 2px 8px rgba(196,90,107,.2)!important}' +
    '.letter-paper-card{background:#fdf5e6!important;border:1px solid #e8d5b7!important;border-radius:12px!important;padding:18px 20px!important;box-shadow:0 2px 12px rgba(0,0,0,.06)!important;position:relative!important;margin-bottom:14px!important}' +
    '.letter-paper-card::before{content:"";position:absolute;inset:0;border-radius:12px;pointer-events:none;background:repeating-linear-gradient(0deg,transparent,transparent 27px,#e8d5b7 27px,#e8d5b7 28px)!important;opacity:.35!important}' +
    '[data-theme="dark"] .letter-paper-card{background:#2d2318!important;border-color:#4a3825!important}' +
    '[data-theme="dark"] .letter-paper-card::before{background:repeating-linear-gradient(0deg,transparent,transparent 27px,#4a3825 27px,#4a3825 28px)!important;opacity:.2!important}' +
    '.letter-paper-card .lpc-header{display:flex!important;justify-content:space-between!important;align-items:center!important;margin-bottom:10px!important;position:relative!important;z-index:1!important}' +
    '.letter-paper-card .lpc-date{font-size:.72rem!important;color:#8a7a6a!important;font-weight:600!important}' +
    '[data-theme="dark"] .letter-paper-card .lpc-date{color:#a09080!important}' +
    '.letter-paper-card .lpc-body{font-size:.85rem!important;line-height:28px!important;color:#3d3225!important;min-height:84px!important;white-space:pre-wrap!important;word-wrap:break-word!important;position:relative!important;z-index:1!important;padding:0 2px!important}' +
    '[data-theme="dark"] .letter-paper-card .lpc-body{color:#d0c0b0!important}' +
    '.letter-paper-card .lpc-footer{display:flex!important;justify-content:space-between!important;align-items:flex-end!important;margin-top:12px!important;padding-top:8px!important;border-top:1px dashed #d4bfa0!important;position:relative!important;z-index:1!important}' +
    '[data-theme="dark"] .letter-paper-card .lpc-footer{border-color:#4a3825!important}' +
    '.letter-paper-card .lpc-sig{font-size:.7rem!important;color:#8a7a6a!important;font-style:italic!important;text-align:right!important}' +
    '.lpc-textarea{width:100%!important;padding:12px!important;border:1px solid #d4bfa0!important;border-radius:10px!important;font-size:.82rem!important;font-family:var(--font)!important;background:#fff8f0!important;color:#3d3225!important;line-height:28px!important;resize:vertical!important;box-sizing:border-box!important;min-height:90px!important;position:relative!important;z-index:1!important}' +
    '[data-theme="dark"] .lpc-textarea{background:#1a1410!important;color:#d0c0b0!important;border-color:#4a3825!important}' +
    '@media(max-width:600px){.lpc-row{flex-direction:column!important}}' +
    '.lpc-row{display:flex!important;gap:14px!important;margin-bottom:14px!important}' +
    '.lpc-row>*{flex:1!important;min-width:0!important}';

  document.head.appendChild(_s);
})();

# 日历模块全面重构计划

**复杂度**: 极大（Large）— 涉及 10+ 文件，144+ 功能，多模块重构
**预计耗时**: 40-60 小时（5-8 天全职）
**优先级**: P0-P3

> **用户指令**: "请你按照现在的功能，调用所有专业的agent和skills来重新构建这个日历模块并优化它，给我完整的计划清单，包括做什么，怎么做，为什么做以及做了会有什么效果"
>
> 本计划基于对 app.js（行1834 renderCalendar、行3272 changeMonth、行3350 goToday、行2518 openModal 等 15+ 调用点）和 10 个关联模块的深度代码分析生成

---

## 📋 当前问题总结

| 问题 | 严重度 | 影响 |
|------|--------|------|
| renderCalendar() 350行做所有事 | P0 | 不可维护，修改易出bug |
| 每次渲染重建42个cell的全部DOM | P0 | 移动端渲染卡顿 |
| 168个事件监听器（42cell×4） | P1 | 内存泄漏，性能下降 |
| viewMonth/viewYear全局变量 | P1 | 状态混乱，模块间耦合 |
| 日历渲染与15+外部函数紧耦合 | P0 | 无法独立测试 |
| 280ms单击延迟（等双击判断） | P2 | 体验迟钝 |
| 触控手势竞态条件 | P2 | 偶发误触发 |
| 全量GSAP动画每次render重播 | P2 | 动画闪烁，GSAP tween堆积 |
| 无障碍仅基础ARIA | P2 | 屏幕阅读器体验差 |
| shared-calendar.js访问模式不一致 | P1 | 数据流混乱 |
| holiday/solar数据异步加载后强制全量render | P2 | 不必要重渲染 |
| 无任何日历单元测试 | P0 | 重构风险高 |

---

## 🎯 目标架构

```
js/
├── calendar/                      ← 新目录：日历模块全家桶
│   ├── calendar-main.js           ← CalendarModule 类（核心引擎）
│   ├── calendar-renderer.js       ← DOM渲染层（纯函数）
│   ├── calendar-interaction.js    ← 交互层（手势、键盘、事件委派）
│   ├── calendar-state.js          ← 状态管理层（viewMonth/viewYear + 观察者）
│   ├── calendar-animations.js     ← GSAP动画层
│   └── calendar-accessibility.js  ← 无障碍增强层
├── cycle-core.js                  ← 保持（已有 predict/getPhase）
├── shared-calendar.js             ← 保持（但优化访问接口）
├── calendar.js                    ← 改为：对外导出 CalendarModule API（index.js 模式）
├── calendar-culture.js            ← 保持（文化内容）
├── lunar.js                       ← 保持（农历引擎）
├── gsap-animations.js             ← 移除日历相关，移到 calendar-animations.js
└── data/
    ├── holidays.json              ← 保持
    ├── solar-terms.json           ← 保持
    └── culture-knowledge.json     ← 保持
```

### 数据流架构

```
app.js (renderAll → renderCalendar)
  │
  ▼
CalendarModule.render({ month, year, pred, state })
  │
  ├─ CalendarState.set('viewMonth', m)
  ├─ DayDataCache.get(dateKey)       ← LRU缓存，一次查询所有日数据
  │    ├─ cycle-core: predict(), getPhase()
  │    ├─ lunar.js: toLunar()
  │    ├─ calendar-culture.js: getHoliday(), getSolarTerm()
  │    └─ CalendarDataBridge: markers, diary, symptoms
  │
  ├─ CalendarRenderer.render(grid, cells)  ← 纯函数，DOM输出
  │    ├─ _renderMonthLabel()
  │    ├─ _renderDayGrid()
  │    │   └─ _createDayCell() → 10+子渲染函数
  │    ├─ _renderProgressBar()
  │    └─ _renderHolidaySummary()
  │
  ├─ CalendarInteraction.delegate(grid)  ← 事件委派，1vs168监听器
  │    ├─ _onClick
  │    ├─ _onTouch
  │    └─ _onKeydown
  │
  └─ CalendarAnimation.run()
       ├─ animateMonthChange()
       ├─ animateDayEntrance()
       └─ animateProgressBar()
```

---

## 📦 阶段计划

---

### 阶段 0：基础设施（P0 | 预计 6-8h）

#### 0.1 创建日历状态管理器
- **做什么**: 将 viewMonth, viewYear, selectedDate, knowledgeOpen 从全局变量提取到独立状态模块
- **怎么做**: IIFE 模式创建 CalendarState，内部 _state 对象，外部 get/set/subscribe 接口
  ```javascript
  const CalendarState = (function() {
    const _state = {
      viewMonth: new Date().getMonth(),
      viewYear: new Date().getFullYear(),
      selectedDate: null,
      knowledgeOpen: false,
    };
    const _listeners = new Map();
    function get(key) { return _state[key]; }
    function set(key, val) {
      const old = _state[key];
      _state[key] = val;
      _notify(key, val, old);
    }
    function subscribe(key, fn) { /* observer 模式 */ }
    return { get, set, subscribe, getAll };
  })();
  ```
- **为什么做**: 消除全局变量污染，让状态变化可追踪、可订阅。当前 viewMonth/viewYear 在 app.js 顶部定义，被 10+ 函数直接读写，无法追踪谁在何时改了它们
- **效果**: viewMonth 变更自动触发重渲染，不再需要手动调用 renderCalendar()
- **涉及文件**: NEW `js/calendar/calendar-state.js`, UPDATE `app.js`（替换所有 viewMonth/viewYear 引用 12 处）
- **调用点**: app.js 中 renderCalendar() L1834, changeMonth() L3272, goToday() L3350, openModal() L2518, updateProgress() L2182 等
- **工作量**: 2h

#### 0.2 创建事件总线（EventBus）
- **做什么**: 日历模块内部的事件发布/订阅系统
- **怎么做**: 简单 Pub/Sub 模式：`on(event, fn)`, `off(event, fn)`, `emit(event, data)`
  - 事件：`monthChanged`, `daySelected(day, phase)`, `periodToggled(dateKey)`, `dataSynced`, `holidayLoaded`
- **为什么做**: 解耦日历各子模块。当前 shared-calendar.js 添加标记后直接调用全局 renderCalendar() → 整个日历重建
- **效果**: 共享标记更新后 emit('markersChanged', dateKey) → renderer 只更新对应 cell
- **涉及文件**: 内置于 `calendar-main.js`
- **工作量**: 1h

#### 0.3 创建 CalendarModule 骨架
- **做什么**: 在 calendar-main.js 中创建 CalendarModule IIFE，暴露 init/refresh/destroy 接口
- **怎么做**:
  ```javascript
  const CalendarModule = (function() {
    let _container = null;
    function init(containerSelector) { /* 挂载到 DOM 节点 */ }
    function refresh(options) { /* 选择性刷新日历的某部分 */ }
    function destroy() { /* 清理所有监听器、GSAP tweens、timers、缓存 */ }
    return { init, refresh, destroy };
  })();
  ```
- **为什么做**: 提供清晰的模块边界。当前 app.js 中所有日历函数松散定义，无从知道「日历模块」的边界在哪
- **效果**: app.js 减少约 500 行，所有日历功能集中管理
- **涉及文件**: NEW `js/calendar/calendar-main.js`
- **工作量**: 2h

#### 0.4 迁移 build 系统
- **做什么**: 确保 package.json build 脚本正确处理新模块
- **怎么做**: 更新 build.js 的合并顺序，加入新模块到 terser 压缩管道
- **为什么做**: 防止新模块未压缩导致包体积增加
- **效果**: 生产包大小不变
- **涉及文件**: UPDATE `build.js`
- **工作量**: 1h

---

### 阶段 1：渲染引擎重构（P0 | 预计 8-12h）

#### 1.1 拆分 renderCalendar() 为 10+ 专注函数
- **做什么**: 将 350 行 renderCalendar() 拆分为职责单一的子函数
- **怎么做**: 按视觉区域拆分
  ```
  renderCalendar() → CalendarModule.refresh('all')
  ├── _renderMonthLabel()        ← 月/年/季节标签（L1837-1838、L2165-2171）
  ├── _renderLegend()            ← 颜色图例（替换 L236-240 calendar.css 的 legend 渲染）
  ├── _renderWeekNumbers()       ← 周数列（L1860-1870）
  ├── _renderDayGrid()           ← 主网格（L1857-2160，42天循环）
  │   ├── _createDayCell()       ← 单个cell工厂（L1890-2159）
  │   │   ├── _renderDayNumber()     ← 日期数字（L1938-1942）
  │   │   ├── _renderPhaseStyle()    ← 阶段颜色（L1895-1915）
  │   │   ├── _renderCycleDayNum()   ← 周期天数（L1943-1949）
  │   │   ├── _renderLunarDate()     ← 农历（L1950-1959）
  │   │   ├── _renderHolidays()      ← 节日图标（L2073-2079）
  │   │   ├── _renderSolarTerm()     ← 节气（L2056-2071）
  │   │   ├── _renderSpecialDate()   ← 纪念日（L1919-1928）
  │   │   ├── _renderSymptoms()      ← 症状图标（L1963-1976）
  │   │   ├── _renderDiaryDots()     ← 日记小圆点（L1977-2025）
  │   │   └── _renderSharedMarkers() ← 共享标记（L2026-2049）
  │   └── _attachInteraction()   ← 事件绑定（L2081-2158）
  ├── _renderProgressBar()       ← 进度条（L2173）
  ├── _renderHolidaySummary()    ← 当月节日摘要（L2177）
  └── _renderUpcomingHoliday()   ← 下一个节日（L2178）
  ```
- **为什么做**: 每个函数<50行，可单独测试，可单独 mock，新人可理解
- **效果**: 从「读 350 行理解日历」变成「读 20 行理解一个子功能」
- **涉及文件**: NEW `js/calendar/calendar-renderer.js`
- **调用点**: 替换 app.js L1834 的 renderCalendar() 定义
- **工作量**: 6h

#### 1.2 引入轻量级渲染 Diff
- **做什么**: 只更新有变化的 cell，不再每次全量重建
- **怎么做**:
  - 每次渲染生成 `dateKey → contentHash` 映射（基于 phase/holiday/lunar/markers/diary 的联合哈希）
  - 与上次的 prevHash 对比，只更新哈希变化的 cell
  - 首次渲染或切换月份时全量构建
- **为什么做**: 标记/取消经期只改 1-2 个 cell，但当前重建 42 个 cell 共 ~630 DOM 节点
- **效果**: 日常操作（标记/取消经期）渲染耗时从 ~30ms 降到 <5ms
- **涉及文件**: UPDATE `js/calendar/calendar-renderer.js`
- **工作量**: 3h

#### 1.3 事件解析委托（为阶段2准备）
- **做什么**: 将日期点击从内联事件改为 data 属性映射
- **怎么做**: 每个 cell 加 `data-date="YYYY-MM-DD"` 和 `data-phase="period-on"` 等属性，交互层通过 dataset 解析
- **为什么做**: 交互层（阶段2）不再需要自己计算日期，直接从 DOM 属性读取
- **效果**: 交互逻辑与渲染逻辑完全解耦
- **涉及文件**: UPDATE `js/calendar/calendar-renderer.js`
- **工作量**: 1h

#### 1.4 CSS containment 优化
- **做什么**: 添加 CSS containment 提示浏览器只布局可见区域
- **怎么做**:
  ```css
  .days { contain: layout style; content-visibility: auto; }
  .day { contain: layout style; }
  ```
- **为什么做**: 强制浏览器跳过 off-screen cell 的布局计算
- **效果**: 初始渲染布局时间减少约 40%
- **涉及文件**: UPDATE `css/calendar.css`
- **工作量**: 0.5h

---

### 阶段 2：交互系统重构（P1 | 预计 6-8h）

#### 2.1 事件委派取代逐 cell 绑定
- **做什么**: 将 168 个独立监听器（42cell × 4类型：click+touchend+touchstart+keydown）替换为 1 个 grid 级委派
- **怎么做**:
  ```javascript
  function setupDelegate(grid) {
    grid.addEventListener('click', onDayClick);       // 1 listener
    grid.addEventListener('touchend', onDayTouch);    // 1 listener
    grid.addEventListener('keydown', onDayKeydown);   // 1 listener
  }
  function onDayClick(e) {
    const cell = e.target.closest('.day');
    if (!cell || cell.classList.contains('other-month')) return;
    const dateKey = cell.dataset.date;
    // handle tap vs double-tap
  }
  ```
- **为什么做**: 当前在 render 循环内（L2083-2158）给每个 cell 独立绑定 → 每次 render 创建 168 个新函数对象
- **效果**: 内存占用从 ~50KB（事件对象）降到 ~1KB，新渲染的 cell 无需重新绑定
- **涉及文件**: NEW `js/calendar/calendar-interaction.js`
- **工作量**: 3h

#### 2.2 重设计双击/单击逻辑
- **做什么**: 消除 280ms 感知延迟 + 支持长按
- **怎么做**:
  - **单击**（1 tap within 300ms）：日期高亮 + 快速信息提示（tooltip/浮动卡片），不打开 modal
  - **双击**（2 taps within 350ms）：切换经期标记 + toast 确认
  - **长按**（≥500ms hold）：打开完整 modal（替代当前「单击等 280ms→仍无操作→modal」）
  - 移动端用 `touchstart` 时间戳 + `touchend` 差值判定
- **为什么做**: 当前所有点击都延迟 280ms 等待可能的双击，每次操作都「迟钝」
- **效果**: 单击零延迟（即刻 UI 反馈），双击和长按自然区分
- **涉及文件**: UPDATE `js/calendar/calendar-interaction.js`
- **工作量**: 3h

#### 2.3 触控手势优化
- **做什么**: 重写 swipe，使用 GSAP 实现物理过渡
- **怎么做**:
  - 当前（L3302-3348）：手动 touchmove + translate + opacity + changeMonth — 僵硬
  - 改为：GSAP timeline 控制全流程
    - 触摸跟踪期：跟随手指，透明剪影辅助
    - 释放判定：超过 60px → GSAP 滑动到目标位置 + 新月份滑入
    - 不足 60px → GSAP 回弹到原位置
    - 惯性：快速滑动时根据速度自动增加翻月数
- **为什么做**: 当前手势无物理感，无回弹动画
- **效果**: 手势流畅度提升到原生应用水平
- **涉及文件**: UPDATE `js/calendar/calendar-interaction.js`, NEW `js/calendar/calendar-animations.js`
- **工作量**: 2h

#### 2.4 键盘导航全面增强
- **做什么**: 实现完整 WAI-ARIA Grid 键盘导航
- **怎么做**:
  - ← → ↑ ↓: 在 day cell 间移动焦点
  - Enter/Space: 与单击相同（tap 语义）
  - PageUp/PageDown: 切换月份
  - Home/End: 跳到当月第一天/最后一天
  - Ctrl+Home: 回到今天
  - Tab: 在「日历网格 + 月份按钮 + 今天按钮」间循环
- **为什么做**: 当前只支持 Enter/Space 模拟点击
- **效果**: 完全符合 WAI-ARIA Grid（行1,列7）模式
- **涉及文件**: UPDATE `js/calendar/calendar-interaction.js`
- **工作量**: 2h

---

### 阶段 3：GSAP 动画升级（P1 | 预计 4-6h）

#### 3.1 月份过渡动画（gsap-timeline）
- **做什么**: 用 GSAP Timeline 替换手动 opacity 动画
- **怎么做**:
  ```javascript
  function animateMonthChange(tl, dir) {
    // 旧网格退出
    tl.to('.days', { scale: 0.95, opacity: 0, duration: 0.12, ease: 'power2.in' });
    // 渲染新网格（时间线暂停处）
    tl.call(() => CalendarModule.refresh('grid'));
    // 新网格进入 + cell 序列涌现
    tl.from('.days', { scale: 0.95, opacity: 0, duration: 0.2, ease: 'power2.out' });
    tl.from('.day:not(.other-month)', {
      y: -8, autoAlpha: 0, stagger: { amount: 0.25, from: dir > 0 ? 'end' : 'start' },
      duration: 0.25, ease: 'back.out(1.2)', clearProps: 'all'
    }, '-=0.15');
  }
  ```
- **为什么做**: 当前（L3288-3298）手动 setTimeout 链 opacity 过渡——控制器在各处，动画零物理感
- **效果**: 月份切换有「推入/拉出」物理感 + cell 序列涌现
- **GSAP技能**: gsap-timeline, gsap-core, gsap-performance
- **涉及文件**: NEW `js/calendar/calendar-animations.js`
- **工作量**: 2h

#### 3.2 日 cell 入场优化（gsap-core + gsap-utils）
- **做什么**: 只对 NEW cells 做动画，跳过已存在的
- **怎么做**: 用 dataset 标记区分新旧 cell，gsap.utils 过滤
- **为什么做**: 当前（gsap-animations.js L76-89）每次 render 重播 42 个 cell 动画 → 标记经期后 cell 闪烁
- **效果**: 减少 90%+ 不必要的 GSAP tween 创建，消除闪烁
- **涉及文件**: UPDATE `js/calendar/calendar-animations.js`
- **工作量**: 1h

#### 3.3 进度条动画增强（gsap-timeline）
- **做什么**: timeline 串联进度条 + 数字 + 徽章
- **怎么做**:
  ```javascript
  tl.to(fillEl, { scaleX: pct/100, duration: 0.7, ease: 'power2.out' })
    .to(numEl, { /* 数字跳动 */ }, '-=0.5')
    .to(badgeEl, { scale: 1.1, duration: 0.2, yoyo: true, repeat: 1 }, '-=0.3');
  ```
- **为什么做**: 当前（gsap-animations.js L187-200）只有 fillEl 动画，数字和徽章无过渡
- **效果**: 阶段切换时一组信息同步过渡，有完整节奏
- **涉及文件**: UPDATE `js/calendar/calendar-animations.js`
- **工作量**: 1h

#### 3.4 Modal 动画增强（gsap-timeline + gsap-plugins）
- **做什么**: timeline 控制弹窗内信息分层入场
- **怎么做**: 背景 backdrop blur 过渡 → modal scale/spring → 标题/阶段/节日/症状按优先级序列涌现
- **为什么做**: 当前（gsap-animations.js L94-108）整体弹入，20+ 行信息同时出现，用户不知道先看什么
- **效果**: 关键信息（阶段、日期）先出现，细节（节日故事、症状）后出现，引导阅读流
- **涉及文件**: UPDATE `js/calendar/calendar-animations.js`
- **工作量**: 1h

#### 3.5 视觉设计质量提升
- **做什么**: 应用 web/design-quality.md 标准
- **怎么做**:
  - 周期第一天 → 扩散 ripple 效果（border-radius pulse）
  - 双方日记都有的日期 → 心跳呼吸动画（scale pulse）
  - 节日 → 微缩 confetti 粒子（2-3 个 floating emoji）
  - 当前阶段 → 底部 subtle gradient shift
- **为什么做**: 当前设计虽不错（渐变、光晕、阴影），但缺少令人心动的细节 moment
- **效果**: 每个交互都有精心设计的视觉回报，符合「anti-template」标准
- **涉及文件**: UPDATE `css/calendar.css`, UPDATE `js/calendar/calendar-animations.js`
- **工作量**: 1h

---

### 阶段 4：数据访问层优化（P1 | 预计 4-6h）

#### 4.1 创建日数据缓存（DayDataCache）
- **做什么**: LRU 缓存，一次计算整天的 holidays/solarTerm/phase/lunar/special/markers/diary
- **怎么做**:
  ```javascript
  const DayDataCache = (function() {
    const _cache = new Map();
    const MAX = 365;
    function get(dateKey) {
      if (_cache.has(dateKey)) return _cache.get(dateKey);
      const data = _compute(dateKey);
      if (_cache.size >= MAX) _cache.delete(_cache.keys().next().value);
      _cache.set(dateKey, data);
      return data;
    }
    function invalidate(key) { _cache.delete(key); }
    function invalidateAll() { _cache.clear(); }
    return { get, invalidate, invalidateAll };
  })();
  ```
- **为什么做**: 当前对每个 cell 调用 getHoliday(O(n)) + getSolarTerm(O(n)) + getPhase(O(n × records)) = O(126n)；42 个 cell 每个都独立计算这些
- **效果**: 渲染复杂度从 O(126n) 降到 O(42 次缓存查询 + 1 次批量预计算)，render 耗时减少 60%
- **涉及文件**: NEW `js/calendar/calendar-renderer.js`（内部）
- **工作量**: 2h

#### 4.2 将 predict() 改为纯函数
- **做什么**: predict() 不再依赖全局 state，改为参数注入
- **怎么做**:
  ```javascript
  // 当前（cycle-core.js L17）
  function predict() { const {records, settings} = state; ... }
  // 改为
  function predict(state) { const {records, settings} = state; ... }
  ```
- **为什么做**: 当前 predict() 直接引用全局 state，无法独立测试（必须 mock 全局 state）
- **效果**: predict() 可单元测试，任给 records 输出确定结果
- **涉及文件**: UPDATE `js/cycle-core.js`, UPDATE 所有 predict() 调用点（约 12 处）
- **工作量**: 1h

#### 4.3 统一数据桥接层
- **做什么**: 创建 CalendarDataBridge 集中管理所有外部数据访问
- **怎么做**:
  ```javascript
  const CalendarDataBridge = {
    getMarkers:  dateKey => SharedCalendarModule.getMarkers(dateKey),
    getDiarySummary:  dateKey => getDiarySummaryForDate(dateKey),
    getSymptoms: dateKey => state.symptoms[dateKey] || {},
    getPeriodEnd: dateKey => state.periodEnds[dateKey],
    getHoliday:  dateKey => getHoliday(dateKey),
    getSolarTerm:dateKey => getSolarTerm(dateKey),
  };
  ```
- **为什么做**: 当前日历直接访问 5+ 数据源（localStorage、SharedCalendarModule、state、HOLIDAYS、solarTermsCache）
- **效果**: 所有数据依赖集中一处，替换/测试容易，新增数据源只需加一个方法
- **涉及文件**: NEW `js/calendar/calendar-main.js`（内部）
- **工作量**: 2h

---

### 阶段 5：无障碍全面增强（P2 | 预计 3-4h）

#### 5.1 ARIA 属性完善
- **做什么**: 完整 WAI-ARIA Grid 模式
- **怎么做**:
  - `role="grid"` on days 容器
  - `role="row"` on 每周（每组 7 cell + week num）
  - `role="gridcell"` on each day
  - `aria-selected="true/false"` for selected day
  - `aria-current="date"` for today
  - `aria-label` 包含完整信息：「2026年6月15日 星期一，经期第3天，端午节🇨🇳，农历五月初一」
  - `aria-describedby` 关联到 legend/phase badge
- **为什么做**: 当前只有 aria-label 日期和 role="button"
- **效果**: 屏幕阅读器可完整使用日历，包括阶段和节日信息

#### 5.2 公告系统（Live Region）
- **做什么**: aria-live 区域公告日历操作
- **怎么做**:
  ```html
  <div id="calendarAnnounce" aria-live="polite" aria-atomic="true" class="sr-only"></div>
  ```
  ```javascript
  function announce(msg) {
    const el = document.getElementById('calendarAnnounce');
    if (!el) return;
    el.textContent = ''; // 触发读取
    requestAnimationFrame(() => { el.textContent = msg; });
  }
  // 操作时调用：announce('已标注6月15日为经期第一天')
  ```
- **为什么做**: 标记经期、切换月份等操作无语音反馈
- **效果**: 盲人用户感知所有日历操作结果

#### 5.3 非视觉阶段指示器
- **做什么**: 阶段颜色之外增加文字指示
- **怎么做**: aria-label 包含「经期第3天」「排卵日」「易孕期」而非仅颜色区分
- **为什么做**: 4 种阶段完全依赖颜色区分，色盲/视障用户无法识别
- **效果**: 通过 WCAG 2.1 AA 色彩非依赖标准

#### 涉及文件
- NEW `js/calendar/calendar-accessibility.js`
- UPDATE `index.html`（添加 aria-live 区域）
- UPDATE `js/calendar/calendar-renderer.js`（添加 ARIA 属性）

---

### 阶段 6：测试覆盖（P0 | 预计 6-8h）

#### 6.1 单元测试
- **做什么**: 所有纯函数 UT
- **范围**:
  - `cycle-core.js`: predict() 测试（空记录、单记录、多记录、不规则周期等 10+ case）
  - `getPhase()`: 各种阶段边界测试（经期第一天最后一天、排卵日精确、跨年等）
  - `DayDataCache`: LRU 淘汰、无效化
  - `calendar-culture.js`: getLunarCellClass, getLunarCellText 三语
- **工具**: 现有 tests/ 框架（tests/test-core.js）

#### 6.2 集成测试
- **做什么**: DOM 行为验证
- **范围**:
  - 月份切换 → 正确的日期网格和月份标题
  - 标记经期 → 阶段颜色 + 进度条更新
  - 共享标记 → 添加/删除 emoji
  - 农历 → 初一/十五高亮、春节期间正确
  - 节日 → 图标 tooltip 内容

#### 6.3 视觉回归
- **做什么**: Playwright 截图对比
- **范围**: 3 个有代表性月份 × 亮/暗色模式 = 6 张截图

#### 6.4 性能基准
- **做什么**: 测量并设置性能门禁
- **基准**:
  - 首次渲染: < 50ms
  - 经期切换（日常操作）: < 15ms
  - 月份切换（含动画）: < 100ms
  - DOM 节点数（日历区域）: < 500

---

### 阶段 7：迁移与发布（P1 | 预计 4-6h）

#### 7.1 渐进式集成
- **做什么**: 不一次性替换，分阶段委托给新模块
- **怎么做**:
  1. 先创建 CalendarModule + 委托 renderCalendar()
  2. 替换数据层（Cache, Bridge）→ 验证功能
  3. 替换渲染层（Renderer）→ 验证功能
  4. 替换交互层（Interaction + Animation）→ 验证功能
  5. 删除 app.js 中旧的多余代码
- **为什么做**: 每步可验证 + 可回滚

#### 7.2 回归防止
- **做什么**: app.js 中代理所有日历函数到新模块
- **怎么做**:
  ```javascript
  // app.js — 所有日历函数变成代理
  const renderCalendar = (opts) => CalendarModule.refresh('all');
  const changeMonth = (d) => CalendarState.set('viewMonth', CalendarState.get('viewMonth') + d);
  const goToday = () => CalendarState.set('viewYear', today().getFullYear()) | CalendarState.set('viewMonth', today().getMonth());
  const openModal = (date, pred) => CalendarModule.openModal(date, pred);
  ```
- **为什么做**: 其他模块（weather.js, sync.js, social.js 等）直接调用这些全局函数

#### 7.3 代码审查 + 安全扫描
- **做什么**: 迁移完成后 code-reviewer + security-reviewer
- **怎么做**: ECC 规则触发自动审查

---

## 📊 优先级与工作量总表

| 阶段 | 子任务 | Pri | 预计 | 效果概要 |
|------|--------|-----|------|----------|
| 0.1 | CalendarState 状态管理 | **P0** | 2h | 消除全局变量污染 |
| 0.2 | EventBus 事件总线 | P1 | 1h | 模块间解耦 |
| 0.3 | CalendarModule 骨架 | **P0** | 2h | 模块化基础 |
| 0.4 | Build 更新 | P1 | 1h | 构建兼容 |
| **0** | **小计** | | **6h** | |
| 1.1 | 拆分为 10+ 子函数 | **P0** | 6h | renderCalendar 350→20行/函数 |
| 1.2 | 轻量级渲染 Diff | **P0** | 3h | 日常操作 30ms→<5ms |
| 1.3 | 事件解析委托 | P1 | 1h | 交互模块准备 |
| 1.4 | CSS containment | P2 | 0.5h | 布局时间减 40% |
| **1** | **小计** | | **10.5h** | |
| 2.1 | 事件委派 | **P0** | 3h | 内存 -95%（168→3 listeners） |
| 2.2 | Tap 重设计 | P1 | 3h | 单击零延迟，双击长按区分 |
| 2.3 | 触控手势 | P1 | 2h | 原生级物理滑动 |
| 2.4 | 键盘导航 | P2 | 2h | WAI-ARIA Grid 标准 |
| **2** | **小计** | | **10h** | |
| 3.1 | 月份过渡动画 | P1 | 2h | 「推入」物理感 |
| 3.2 | Cell 入场优化 | P2 | 1h | 减少 90% 无用 GSAP tween |
| 3.3 | 进度条动画 | P2 | 1h | 完整视觉节奏 |
| 3.4 | Modal 动画 | P2 | 1h | 信息分层涌现 |
| 3.5 | 视觉设计提升 | P3 | 1h | 「心动」细节 |
| **3** | **小计** | | **6h** | |
| 4.1 | DayDataCache | P1 | 2h | 渲染 O(126n)→O(42) |
| 4.2 | predict() 纯函数 | **P0** | 1h | 可测试性 |
| 4.3 | 数据桥接层 | P1 | 2h | 数据依赖集中 |
| **4** | **小计** | | **5h** | |
| 5.1 | ARIA 属性 | P2 | 1.5h | 屏幕阅读器可用 |
| 5.2 | 公告系统 | P2 | 1h | 操作有语音反馈 |
| 5.3 | 非视觉指示器 | P2 | 0.5h | 色盲用户可用 |
| **5** | **小计** | | **3h** | |
| 6.1 | 单元测试 | **P0** | 3h | 重构安全网 |
| 6.2 | 集成测试 | P1 | 2h | DOM 行为验证 |
| 6.3 | 视觉回归 | P2 | 1h | 样式无回归 |
| 6.4 | 性能基准 | P2 | 1h | 性能门禁 |
| **6** | **小计** | | **7h** | |
| 7.1 | 渐进集成 | P1 | 3h | 无停机上线 |
| 7.2 | 回归防止 | P1 | 1h | 随时可回滚 |
| 7.3 | 审查扫描 | P1 | 1h | 质量门禁 |
| **7** | **小计** | | **5h** | |
| **总计** | | | **52.5h** | |

---

## 🔗 依赖关系

```
阶段0 (基础设施) → 阶段1 (渲染引擎)
                  → 阶段2 (交互系统) → 阶段3 (GSAP动画)
                  → 阶段4 (数据访问层)
                  → 阶段5 (无障碍)
阶段6 (测试) ← 所有阶段
阶段7 (迁移) ← 所有阶段
```

**严格顺序**: 0 → 1 → (2|3|4|5 可并行) → 6 → 7

---

## ⚡ 速成路径

**最小可用（24h，P0 紧急任务）**:
0.1(2h) + 0.3(2h) + 1.1(6h) + 2.1(3h) + 2.2(3h) + 4.2(1h) + 6.1(3h) + 7.1(2h) + 7.2(1h) + 7.3(1h)

**标准版（40h，推荐）**: 最小 + 1.2(3h) + 2.3(2h) + 2.4(1h) + 3.1(2h) + 4.1(2h) + 4.3(1h) + 6.2(2h) + 6.3(1h)

**完整版（52h，含所有视觉和动画）**: 标准 + 1.4(0.5h) + 3.2-3.5(4h) + 5.1-5.3(3h) + 6.4(1h)

---

## 🚨 风险与缓解

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| 迁移中漏掉某个功能 | 中 | 高 | 每阶段后用 144 项功能清单验证 |
| 渲染 Diff 算法 bug | 中 | 中 | 全量重建 fallback（CalendarModule.refresh('all')） |
| GSAP 低端手机卡顿 | 低 | 中 | prefers-reduced-motion + HAS_GSAP 检测 + 无 GSAP 降级方案 |
| 触控新模型用户不适应 | 中 | 中 | 发布后保留 7 天旧模式 popup 提示切换方法 |
| 测试不足导致回归 | 中 | 高 | 优先写 predict()/getPhase() 的核心测试（阶段6.1 P0） |
| app.js 函数被其他模块直接引用 | 高 | 中 | 代理模式（7.2），其他模块无感知 |
| calendar.css 与新版渲染器不匹配 | 中 | 中 | 渐进式 CSS 更新，每步视觉验证 |

---

## ✅ 验收标准

- [ ] calendar.js 不再是空壳，导出 CalendarModule 完整 API
- [ ] renderCalendar() 不在 app.js 中定义，全部在 js/calendar/ 子模块
- [ ] 144 项功能全部保留，无功能退化
- [ ] viewMonth/viewYear/selectedDate 不再是全局变量
- [ ] 渲染耗时: 初始 < 50ms, 日常操作 < 15ms
- [ ] 事件监听器从 168 个降到 ≤ 3 个（日历网格级）
- [ ] 所有 50+ 单元测试通过
- [ ] GSAP 动画有 prefers-reduced-motion 尊享
- [ ] 键盘支持箭头导航 + PageUp/Down + Home/End
- [ ] 所有日历 cell aria-label 包含完整信息
- [ ] 新旧代码可并行运行，无竞态条件

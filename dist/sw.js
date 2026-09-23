// Service Worker — Anđelin Ciklus v10 (offline.html, auto-clean caches, full CSS+JS cache)
// Network-First for all dynamic assets, Cache-First for static
// Features: Background Sync for offline diary saves, cache-first for fonts

// ── 版本号唯一来源 ────────────────────────────────────────────────
// APP_VERSION 必须与 index.html 里每个 <script src="?v=..."> 的版本号、
// 以及 app.js 里 register('sw.js?v=...') 的版本号一致。
// tests/test-version-consistency.js 会强制校验，漂移即测试失败。
// 注意：这与 CACHE_STATIC 的 vNN 是两回事 —— 前者是资源查询串（决定
// 浏览器/SW 的 cache key），后者是 SW 自身的缓存代际（决定 activate 时
// 删掉哪些旧 cache）。两者不要合并。
const APP_VERSION = '7.4.1';
const V = '?v=' + APP_VERSION;

// Phase 1D · 日历结构对齐：v34 → v35。改的是 ./css/calendar.css 与 ./app.js ——
// 月份视图的星期表头和日期网格一直对不齐：.days 被 index.html 内联样式和 js/fix-css.js
// 两层 !important 压成 7 轨，而 .weekdays 还留着 28px 的周数列 + 8 个 span（首个子元素是
// app.js 里那个空的周数占位）。占位列其实早就死了 —— js/fix-css.js 用 !important 把
// .week-num 全局 display:none —— 但表头仍然为它留了一轨，于是 768/1440 下整行星期
// 左移 28px，320 下「日」被挤到第二行。现在把表头的占位 span 去掉、两侧轨道都写成
// repeat(7,1fr)，.week-num 的样式与 .days.week-view（周视图，另有 28px 列，未测）保持原样。
// 同一轮还修了 320 下格子互相重叠（.day 的 aspect-ratio 由 min-height:44px 反推出 44px 宽，
// 超出 37px 的轨道 —— 加 max-width:100% 把它夹回轨道内）与月份标题被挤成三行
// （≤360px 让标题独占一行、按钮换到下一行）。这两个文件都在 STATIC_ASSETS 里且 cache-first，
// calendar.css 还是裸路径，cache key 永不变 —— 不换名字，已装 SW 的客户端看到的还是歪的日历。
// （Phase 1D 前半：v33 → v34，周期中心重组；再前半 v32 → v33，日历调色板。
//  activate 会删掉所有不在 CURRENT_CACHES 里的旧 cache，所以改名即完成刷新。）
// Phase 1F · 「有新版本」提示：v35 → v36。这一轮改的是 ./index.html、./app.js 与
// ./css/v2.css —— 三个都在 STATIC_ASSETS 里且 cache key 永不变（index.html 与 v2.css
// 是裸路径，app.js 挂的是固定的 APP_VERSION），不换名字老客户端就永远看不到新横幅。
// 改动本身只在页面侧：新增一条底部横幅，检测 waiting / updatefound 后提示用户，
// 用户点了「更新」才 postMessage({type:'SKIP_WAITING'})。
// sw.js 自身的策略没变 —— install 里依旧不 skipWaiting（见下），message 处理早已存在。
// Phase 1E · 产品级视觉统一：v36 → v37。这一轮改的是 ./css/tokens.css、./css/calendar.css、
// ./css/v2.css、./js/fix-css.js、./index.html、./offline.html 与 ./manifest.json —— 七个
// 全部在 STATIC_ASSETS 里，而且 tokens.css / calendar.css / v2.css / offline.html /
// manifest.json 都是裸路径，cache key 永不变，不换名字已装 SW 的客户端会一直用旧配色。
// 改动内容：三支 accent 的 -ink 文本层全部落位 —— 原 accent 色是给填充调的，当文字用
// 全部低于 AA（light 下 --gold 2.88:1、--sage 3.15:1），calendar.css 里最后 17 条仍拿
// 填充色画文字的规则统一换成 -ink，并去掉两处 opacity:.6 的稀释。跨主题安全：dark 的
// --gold/--sage 本就等于各自的 -ink，这一轮在 dark 下是空操作。另有：控件统一 44px
// 触摸目标与 color:var(--text)、letter-paper 的硬编码暖灰换成主题感知的 --warm-ink、
// Cycle 图例改 flex-start 消除居中换行、Memories 精选卡居中并限宽 46ch、manifest 主题色
// 统一到 Midnight Couple。周期算法与数据结构未动。
// Phase 1E 续 · 触摸目标补齐：v37 → v38。这一轮只改 ./css/calendar.css 与 ./css/v2.css，
// 两个都是 STATIC_ASSETS 里的裸路径，cache key 永不变，不换名字老客户端拿不到新规则。
// 起因是 1E-D 的 44px 底线被旧媒体查询按特异性压了回去：v2.css 里
// `button{min-height:var(--touch-target)}` 是元素选择器（0,0,1），而 calendar.css 中
// ≤420px / ≤360px 两条媒体查询里的 `.lang-btn{min-height:36px/32px}` 与
// `.theme-btn{width:36px;height:36px}` 是类选择器（0,1,0）—— 类永远赢，与加载顺序无关。
// 于是语言切换与主题按钮在最需要 44px 的 320 屏上恰恰最小。现在这几处就地改成
// var(--touch-target)，并补上 .today-pill（原本就是 min-height:36px）、待办筛选按钮
// （内联 padding 使宽度随文字，最短的「Sve」只有 38px 宽）、以及 Cycle 文化卡里两个
// span 按钮（ℹ️ 16x16、🌿 80x17，生成自压缩过的 js/calendar-culture.js，没有类名，
// 因此改由容器 #lunarInfo / #cultureCard 选中）。
// 日历格 37x44 与日记日期条 38x44 保持不动 —— 那是 320px 下七列能给出的全部宽度，
// v2.css 早有说明，既有测试也已接受。周期算法与数据结构仍未动。
// Phase 1.9 起 · v38 → v39。./js/module-dashboard.js 与 ./app.js 的改动。
//
// ⚠️ 这一代际记录了一段真实的缺口，写在这里而不是抹掉：
// v39（由 8b09bb8 引入，到 bd2c3be 结束）期间一共有 **6 个 commit** 改了
// STATIC_ASSETS 里的**裸路径**资产，却只抬了 APP_VERSION、没有换 CACHE_STATIC：
//   88a043c  css/v2.css, js/module-dashboard.js
//   e6d0eb0  index.html
//   9764cab  index.html
//   228a6d7  data/holidays.json, index.html, js/module-dashboard.js
//   39b8d9c  index.html, js/module-dashboard.js
//   0122578  index.html, js/module-dashboard.js
// 裸路径的 cache key 就是路径本身，永远不会动，而 SW 对它们是 cache-first：
// APP_VERSION 只决定 ?v= 查询串，对裸路径完全无效。后果是，凡是已经装了 v39 的
// 客户端，activate 会保留 v39 桶，于是 index.html / module-dashboard.js / v2.css /
// holidays.json 一直吐旧副本 —— 这些 commit 的改动对它们是不可见的。
// 直到 bd2c3be（Phase 2B.3）把 v39 → v40，才连带把它们重新取了一遍；缺口是那样被
// 顺带补上的，而不是被发现的。也不是「6 个 commit 都错了」这么简单：其中只有 3 个
// 改的是 module-dashboard.js，另外 3 个错在 index.html / v2.css / holidays.json 上，
// 所以靠肉眼看 diff 很难发现 —— 这正是它需要一条自动断言而不是靠自觉的原因。
// tests/test-phase2a-sw.js 的 S15 现在从**当前代际**往回逐个 commit 校验这条不变量：
// 它盯的是「commit 有没有碰裸路径资产」，而不是「改了哪个文件」。
// 教训：判断该抬哪根轴，看的是文件在 STATIC_ASSETS 里**怎么被列的**，不是「改了文件」。
// Phase 2B.3 · v39 → v40。这一轮改 ./css/v2.css（新增 .km-lead）与 ./js/render-love.js。
// v2.css 又是裸路径，同一个老问题：不改名字，装了旧 SW 的客户端永远拿不到新规则，
// 卡片的状态引子会一直以正文字号、正文颜色渲染。render-love.js 带 ?v=，由 APP_VERSION 管。
// Phase 2B.4 · v40 → v41。这一轮改 ./js/module-dashboard.js（Home 与 Together 共用
// 新的 _knowMeAffordanceHtml，让她的 Know Me 猜测在首页就能一键判定）与
// ./js/render-love.js（rateKnowMe 改走 _refreshEchoSurfaces）。前者是裸路径，所以必须
// 抬这一代际；后者由 7.3.8 管。两轴同抬，和 2B.3 一样的判断方式。
// Phase 2B.5 · v41 → v42。这一轮改 ./index.html、./css/v2.css 与 ./js/module-settings.js ——
// Settings 页新增「纪念日同步状态」只读诊断区（把「冲突只能靠 DevTools 手查 localStorage」
// 变成打开设置页就能看）。三个全是裸路径，同一个老问题：不换名字，装了旧 SW 的客户端
// 永远看不到这个面板，而它要显示的恰恰是「当前有没有冲突」——一个显示不出来的诊断
// 等于没有诊断。没有任何带 ?v= 的资产被改，所以 APP_VERSION 保持 7.3.8 不动，
// 本轮只抬这一轴。判断依据仍是文件在 STATIC_ASSETS 里**怎么被列的**，不是「改了文件」。
// Phase 2B.6 · v42 → v43，两轴同抬。这一轮改四个文件，恰好两条轴各占一半：
//   · ./js/module-memories.js（第 137 行，裸路径）与 ./css/v2.css（第 107 行，同样是裸路径）
//     —— 页面顶部新增「故事的开头」日期条（.mem-anchor*），并把 Home 的
//     「来自我们的故事」那行补上 .dsl-more。裸路径，所以必须抬这一代际，
//     否则装了旧 SW 的客户端永远拿不到这条新规则和这句新文案。
//   · ./js/render-love.js（第 127 行）与 ./js/social.js（第 121 行）—— 两者都带 ?v=，
//     由 APP_VERSION 管：修的是 sendHug 写 localStorage、renderHug 却读 sessionStorage
//     的不一致（那个值还门控着「已发送、等待回应」分支，所以该状态以前根本无法出现），
//     以及 Know Me 引子与 knowMeFb 里重复问的同一句话。这两处都要么全改、要么全不改：
//     两个文件各有一份重复实现，谁赢得加载顺序决定哪一份是活的，所以必须同步，
//     并且两者都必须真的送达客户端 —— 只修一份或只抬一根轴都会留下半修状态。
// 判断依据仍是文件在 STATIC_ASSETS 里**怎么被列的**，不是「改了文件」。
// （注：上一段引用的行号是写入时的行号，今天 ./js/module-memories.js 在第 149 行、
//  ./css/v2.css 在第 119 行，./js/render-love.js 在第 139 行、./js/social.js 在第 133 行。
//  行号会漂，所以判断依据始终是「带不带 + V」，不是「第几行」。）
// Phase 2B.7 · v43 → v44，只抬这一轴。这一轮只改 ./js/module-memories.js（第 149 行，
// 裸路径），没有任何带 ?v= 的资产被改，所以 APP_VERSION 保持 7.3.9 不动。
// 改动内容两处，都在时间轴的渲染上，都在这一代际的可见范围内：
//   · 顶部推荐卡已经展示的那条记忆，不再在下面的时间轴里完整重复一遍（按 id 从时间轴
//     里排除；推荐卡的挑选池仍是完整列表，所以「哪条被选中」不受此影响）。
//   · 时间轴里最近几天的记录，日期位置改说「今天 / 昨天 / N 天前」，而不是两位日号。
//     复用的就是推荐卡早就在用的 mem('today')/mem('yesterday')/mem('daysAgo')，
//     MEM_I18N 一个字没动 —— 这一轮没有引入任何新文案，三语都无需再翻译或审校。
// 老问题照旧：裸路径的 cache key 就是路径本身，永远不会动，而 SW 对它是 cache-first。
// 不换名字，装了旧 SW 的客户端会一直看到一个既重复、又只显示两位日号的时间轴，
// 而这条改动恰恰只存在于渲染结果里 —— 没有新文件名、没有新 URL 可供它察觉。
// Phase 2B.8 · v44 → v45，只抬这一轴。这一轮改 ./js/module-memories.js（第 163 行，
// 裸路径）与 ./css/v2.css（第 133 行，同样是裸路径），没有任何带 ?v= 的资产被改，
// 所以 APP_VERSION 保持 7.3.9 不动。
// 改动内容：回忆页顶部、「故事的开头」之后、精选卡之前，新增一条「写一篇日记」
// 入口（.mem-write-cta），点击后由用户手势滚动到既有的 #diaryWriteCard。
// 起因不是功能缺失 —— 编辑器、日期切换、保存、Worker 同步全部完好（已端到端实测：
// 输入 → 保存 → shared-diary 落盘 → Worker PUT）—— 而是距离：#memRoot 是
// #panel-diary 的第一个子元素，故事越长写卡越靠下（320×800 实测 0 条 +415px、
// 100 条 +6822px），两人越认真写，入口越自己沉下去。
// 边界：文案进的是 MEM_I18N（三语各一条），没有第二套 i18n 机制；没有新数据模型、
// 没有新 storage key、没有自动滚动；app.js 里「切换 Tab 不动滚动位置」的规则未改，
// 用户点这一下不属于自动行为。Diary 仍然不是 Memories 的附属工具。
// 老问题照旧：两个文件都是裸路径，cache key 就是路径本身、永远不会动，而 SW 对它们
// 是 cache-first。不换名字，装了旧 SW 的客户端既拿不到这条入口的样式（v2.css），
// 也拿不到入口本身（module-memories.js）—— 而这条改动恰恰只存在于渲染结果里，
// 没有新文件名、没有新 URL 可供它察觉。
// Phase 2B.9 · v45 → v46，只抬这一轴。这一轮改六条裸路径：./index.html、
// ./offline.html、./css/tokens.css、./manifest.json、./js/module-memories.js 与
// ./css/v2.css —— 六者都没有 ?v= 查询串，cache key 就是路径本身、永远不会动，
// 而 SW 对它们一律 cache-first。没有任何带 ?v= 的资产被改，所以 APP_VERSION 保持
// 7.3.9 不动。这一轮的两件事同一次提交发布，所以只抬一次名字：一次 cache key 变化
// 就足以让客户端同时换掉这六条路径，分两次抬只会凭空多一个中间版本号。
// 改动只有一件事：浅色模式的页面底色从冷转暖。css/tokens.css 里的 --bg 原本是
// #f4f2f8（偏冷的淡紫灰），现在改成 #f7efe9 —— 与 css/calendar.css:6251 早就给
// >=768px 的 body 铺的那层暖色径向渐变（#f7efe9 → #f0e5dd → #e7d8cf）对上，
// 宽屏下首屏渐变与页面底色不再是两种色温。同一个值还要一起落在 ./index.html 与
// ./offline.html 的浅色 theme-color、以及 ./manifest.json 的 background_color
// 上，否则离线页与安装后的启动底色仍是冷的。
// 同时 ./index.html 里那条 setTimeout(...,3000) 内联脚本被删掉：它原本在三秒后
// 用 !important 把 document.body 的 background 强行写回 var(--bg)，
// 于是第一帧是暖的（渲染的是渐变）、第三秒反而转冷（被 --bg 的旧值盖了回去）。
// 删掉它，底色就只由 --bg 一处决定，不再有「暖 → 冷」的二次落色。
// 老问题照旧：这六条路径全是裸路径，不换名字，装了旧 SW 的客户端拿到的仍是旧
// tokens.css（冷底色）、旧 index.html（三秒后转冷的脚本）、旧 offline.html 与旧
// manifest.json —— 而这一轮改的恰恰就是底色本身，没有新文件名、没有新 URL
// 可供它察觉。
//
// 第二件事是回忆页那条写日记入口的行为改了：2B.8 里它是把人滚到面板底部的编辑器
// 去（_goToDiary + scrollIntoView），现在改成把那三个节点本身 —— 日期条、
// #diaryFullCal、#diaryWriteCard —— 就地搬进 #memWriteHost，原地展开，页面一动
// 不动。借出去的仍然是 index.html 里那同一个写卡：没有第二套编辑器、没有新数据
// 模型，保存路径仍是 saveDiaryEntry() → localStorage['shared-diary'] →
// pushAllSharedData()，sync 协议一个字没改。这一改动只落在
// ./js/module-memories.js（借还逻辑与入口）与 ./css/v2.css（host 与展开态样式）
// 两条路径上 —— 两条也都是裸路径，不换名字，客户端拿到的仍是「点一下把人送到面板
// 底部」的旧引擎与旧样式，而改动恰恰只存在于渲染结果里，没有新文件名可供它察觉。
//
// ── Phase 2C：回忆页拆成「我们的故事 | 📖 日记」两种模式 ──────────────────────
// 这一轮改动的裸路径：./index.html、./css/v2.css、./js/fix-diary.js、
// ./js/module-memories.js。没有任何带 ?v= 的资产被改，所以 APP_VERSION 保持
// 7.3.9 不动 —— 与上面同一个道理，变了名字的只有 CACHE_STATIC 一个。
// 下面按「为什么老客户端必须换」逐条写：
//
// 1. ./css/v2.css — 新增 .mem-mode-bar / .mem-mode-btn / .mem-row-ref，以及
//    #panel-diary.mem-mode-story 与 .mem-mode-diary 两组显隐规则。**这两组规则
//    决定这一页能看到什么**：旧样式下 #memRoot 与日记那几块会同时显示、两种模式
//    叠在一起，页面比改动前更乱。这是本轮最必须换的一条。
// 2. ./js/fix-diary.js — 写作锁整条删掉（_updatePartnerLetter 里那条
//    `if (!myEntry || !myEntry.text)` 分支连同 #letterLocked 的 UI 一起消失），
//    签名从 user 改成 partner（此前「她的信」落款取的是读信人自己的签名），新增
//    _latestDiaryDate()（默认落点）与 #diaryTodayBtn（回到今天）。旧引擎仍会在
//    对方没写的那天把整封信藏起来 —— 而这恰恰是本轮要修的那件事。
// 3. ./js/module-memories.js — 模式状态机、DIARY_REF_CAP = 6 的日记引用上限、
//    时间轴上的可点 .mem-row-ref。旧引擎没有这两个模式，也没有那条上限。
// 4. ./index.html — #letterLocked 节点删除、信箱卡加 diary-mailbox-card 类。
//    留着旧 HTML 而换了新引擎，锁的 UI 会留在页面上没有东西再管它（新引擎已经不
//    碰它了，所以它会**永久显示**在那封信本该出现的位置）。反向组合（新 HTML +
//    旧引擎）则会让 `document.getElementById('letterLocked')` 恒为 null —— 旧引擎
//    每处都判了空，不报错，只是锁没了，恰好是想要的结果。
//
// 老问题照旧：这几条全是裸路径，不换名字，装了旧 SW 的客户端拿到的仍是旧 CSS、
// 旧引擎、旧 index.html —— 而变化恰恰只存在于渲染结果里，没有新文件名可供它察觉。
//
// ── Phase 2E：极简 Memories（只简化显示层）────────────────────────────────
// v47 → v48。这一轮改动的裸路径是三条：./index.html、./css/v2.css、
// ./js/module-memories.js。**js/fix-diary.js 这一轮一个字没改**，仍是 Phase 2C
// 的版本。没有任何带 ?v= 的资产被改，所以 APP_VERSION 保持 7.3.9 不动，变的只有
// CACHE_STATIC —— 与上面每一次同一个道理。
//
// 这一轮**不动任何数据**：shared-diary / shared-gratitude / shared-knowme /
// anniversaries 的 schema 一个字没改，模块全程只有 getItem、没有写入路径，
// 保存路径仍是 saveDiaryEntry() → localStorage['shared-diary'] →
// pushAllSharedData()。删掉的全部是渲染层。逐条说为什么老客户端必须换：
// 1. ./js/module-memories.js — 「我们的故事」不再画时间轴长列表：整个列表渲染层
//    （_timelineHtml / _rowHtml / _capDiaryRefs / DIARY_REF_CAP = 6 / _songHtml，
//    连同相对日期 _relDay 与 REL_DAYS）删除，story 半边只剩一张「✦ 今天想起」卡、
//    一个「再看看一个 ›」和一个「📖 看全部日记 →」。旧引擎会把那条长列表继续
//    画出来 —— 而这正是本轮要删掉的那件东西；旧引擎的今日选取规则也不同（本轮
//    新增 7–400 天窗口、最近 7 日避重、昨日同类则优先换类）。
// 2. ./index.html — .diary-timeline-section 与信箱卡（.diary-mailbox-card）两个
//    容器整块删除，#diaryFullCalGrid 一并清掉。新引擎不再往这两个容器里放任何
//    东西，留着旧 HTML 只会得到两个空壳加一段残留结构。
// 3. ./css/v2.css — 时间轴 / 歌曲 / .mem-diary-head / .mem-row-ref 的样式块删除，
//    新增 .mem-feat-*（卡片正文与两个动作按钮）。旧样式下新卡片没有排版；
//    反向组合（新 CSS + 旧引擎）下旧时间轴的类名已经没有规则了。
//
// 老问题照旧：三条全是裸路径，不换名字，装了旧 SW 的客户端拿到的仍是旧 CSS、
// 旧引擎、旧 index.html —— 而变化恰恰只存在于渲染结果里，没有新文件名可供它察觉。
// ── Phase 2F：她猜了什么 + 三个月预测（两条轴同时动）────────────────────
// v48 → v49，APP_VERSION 7.3.9 → 7.4.0 —— 这是自 Phase 2B.8 以来第一次两条轴
// 同时推进，因为本轮同时改了裸路径与带 ?v= 的资产：
//   裸路径（CACHE_STATIC 的轴）：./index.html、./css/calendar.css、
//     ./css/v2.css、./js/module-dashboard.js、./js/fix-panel.js。
//   带 ?v=（APP_VERSION 的轴）：./js/cycle-core.js、./js/render-love.js。
// 两条轴各推各的：带 ?v= 的资产换了 URL，装旧 SW 的客户端本来就会重新下载；
// 裸路径的资产 URL 不变，只有换 cache 名字才推得动它。任何一条不动，那一半就
// 留在旧副本上。
//
// 逐条说为什么老客户端必须换：
// 1. ./js/cycle-core.js — predict() 新增 forecast 块。周期基线由「历史默认
//    cycleLength」改为「最近 3 个 start-to-start 间隔的中位数」，持续天数改为
//    「最近 4 次 end-start+1 的中位数」，并只在「今天 起 3 个日历月」内生成
//    预测。旧引擎给的是另一套数字与另一套日期，且不受窗口约束。
// 2. ./js/render-love.js — Know Me 新增 knowMeQuestionFor（三层恢复：存的 qKey
//    → 记录自身 time 反推 → 放弃）+ knowMeGuessHtml（把「她猜了什么」连同
//    原话一起画出来）；rateKnowMe 的目标由 fmtDate(today()) 改为
//    knowMePendingGuess()。旧引擎只有「她猜了你——猜对了吗？」加两个按钮，
//    而且她昨天猜的、今天从首页点下去会静默无反应。
// 3. ./js/module-dashboard.js — 首页与 Together 两处接线改走同一个
//    knowMePendingGuess，并新增判定回显（.km-verdict-echo）。
// 4. ./js/fix-panel.js — 新增 renderForecast3mo()，把 predict().forecast 画成
//    「接下来三个月」；不足 4 次完整记录时只给一句引导，一个日期都不给。
// 5. ./css/calendar.css — .pred3mo* 五条规则（含 [hidden] 守卫）。
// 6. ./css/v2.css — .km-guess* 与 .km-fb-on（判定后的「选中」药丸）。
// 7. ./index.html — 统计卡里新增 #predForecast3mo 容器；23 个脚本的 ?v= 与
//    <meta name="version"> 同步到 7.4.0。
//
// 本轮**不动任何数据**：shared-knowme / shared-cycle / shared-diary /
// shared-gratitude / anniversaries 的 schema 一个字没改。Know Me 只在对方那条
// 记录上多写一个可选的 qKey（写入时记录「那天问的是哪题」，读到没有就退回
// 时间反推，再没有就什么都不声称）——旧客户端读它不会有任何问题。预测值全程
// 只存在于 predict() 的返回值里，不落盘、不进 state.records/periodEnds、不回写
// shared cycle data，所以历史经期记录一个字节都没变。
//
// 老问题照旧：裸路径那五条不换名字，装了旧 SW 的客户端拿到的仍是旧 CSS、
// 旧引擎、旧 index.html，而变化恰恰只存在于渲染结果里。
//
// ── Phase 2F.1：窗口锚点写实（只有 APP_VERSION 动，CACHE_STATIC 不动）──
// 7.4.0 → 7.4.1。本轮只改 ./js/cycle-core.js 一个文件，而它带 ?v=，所以只推
// APP_VERSION。**CACHE_STATIC 停在 v49** —— 没有任何裸路径资产变化，资源没变
// 就不该为一次发布顺手 cache-bust。
//
// 改了什么：horizonEnd 本来就是 _addCalMonths(today(), 3)，不是从最近一次经期
// 起算。这一轮把窗口**起点**也写实成 forecast.horizonStart = today，并让
// futurePeriods 的入列同时判两端：st >= horizonStart 且 st <= horizonEnd。
// 在此之前下界只由上面那段 overdue 回滚「顺带」保证（nextStart 恒 >= today），
// 那是推论不是约束；现在它是一条判定 —— 回滚一旦被改动，过去的预测不会再悄悄
// 混进 futurePeriods 被 getPhase() 拿去给日历上色。
//
// 坦白说：对现有输入这是**行为保持**的加固，不是一个正在发生的 bug 修复。
// 最近一次经期早于今天时窗口不会提前结束（最近一次 9/1、今天 9/23 → 窗口仍是
// 9/23…12/23，不是 …12/1）；落在 horizonEnd 当天的预测照旧显示（包含，不是排除）。
// 但 cycle-core.js 这个文件确实变了，带 ?v= 的资源换了 URL 才会被重新拉取，
// 所以 APP_VERSION 必须走。schema 依旧一个字没改，预测值依旧只活在返回值里。
const CACHE_STATIC = 'ciklus-static-v49';
const CACHE_FONTS = 'ciklus-fonts-v1';

// 这个列表必须逐一等于 index.html 实际发出的请求 URL（含/不含 ?v= 都要一致）。
// 之前这里是清一色的裸路径，而 index.html 有 23 个脚本带 ?v=7.3.0 ——
// cache key 对不上，install 阶段的预缓存对那 23 个文件等于没做。
// 反过来，不带 ?v= 的 11 个 module-*.js / fix-*.js 才是真正命中的那批。
const STATIC_ASSETS = [
  './',
  './index.html',
  './offline.html',
  './app.js' + V,
  './css/tokens.css',
  './css/calendar.css',
  './css/v2.css',
  './js/i18n.js' + V,
  './js/auth.js' + V,
  './js/weather.js' + V,
  './js/sync.js' + V,
  './js/ui-core.js' + V,
  './js/chart-renderer.js' + V,
  './js/cycle-core.js' + V,
  './js/cycle-engine.js' + V,
  './js/render-calendar.js' + V,
  './js/lunar.js' + V,
  './js/calendar-culture.js' + V,
  './js/translate.js' + V,
  './js/theme.js' + V,
  './js/social.js' + V,
  './js/culture-cards.js' + V,
  './js/calendar.js' + V,
  './js/shared-calendar.js' + V,
  './js/barry.js' + V,
  './js/render-mood.js' + V,
  './js/render-love.js' + V,
  './js/render-misc.js' + V,
  './js/gsap-animations.js' + V,
  './js/module-holidays.js',
  './js/module-sleep.js',
  './js/module-settings.js',
  './js/module-dashboard.js',
  './js/module-stats.js',
  './js/fix-css.js',
  './js/fix-diary.js',
  './js/module-memories.js',
  './js/fix-stats.js',
  './js/fix-all.js',
  './js/fix-panel.js',
  './libs/gsap.min.js',
  './libs/ScrollTrigger.min.js',

  './calendar-data.json',
  './data/quotes.json',
  './data/culture-knowledge.json',
  './data/data.json',
  './data/solar-terms.json',
  './data/holidays.json',
  './manifest.json',
];

self.addEventListener('install', function (event) {
  // 预缓存完成之前不要进入 activated —— 否则可能出现
  // 「新 SW 已接管、但 cache 还是空的」窗口期。
  event.waitUntil(
    caches.open(CACHE_STATIC).then(function (cache) {
      return Promise.allSettled(
        STATIC_ASSETS.map(function (url) {
          return cache.add(url).catch(function () {});
        })
      );
    })
  );
  // 这里【故意不调用】self.skipWaiting()。
  // 无条件 skipWaiting 会让新 SW 立刻接管已打开的旧页面，
  // 紧接着 activate 删掉旧 cache —— 而旧页面手里还引用着被删掉的资源，
  // 就出现「旧页面 + 新 SW」的混搭状态。
  // 改为让新 SW 停在 waiting，等所有页面关闭后由浏览器自然激活。
  // 需要立即更新时，页面可 postMessage({type:'SKIP_WAITING'})（见下方 message 处理）。
});

// Clean up old cache versions — keep only current, delete everything else
const CURRENT_CACHES = [CACHE_STATIC, CACHE_FONTS];

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (key) {
              return CURRENT_CACHES.indexOf(key) === -1;
            })
            .map(function (key) {
              return caches.delete(key);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', function (event) {
  const request = event.request;
  const url = new URL(request.url);

  // 非 HTTP(S) 请求（chrome-extension:、data:、blob:、about: 等）一律跳过：
  // 不 respondWith、不 fetch、不进 Cache。
  // 否则 fetch()/caches.match() 会抛 "Request scheme 'chrome-extension' is unsupported"。
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Google Fonts — cache-first (fonts are versioned, rarely change)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then(function (cached) {
        if (cached) return cached;
        return fetch(request)
          .then(function (response) {
            const clone = response.clone();
            caches.open(CACHE_FONTS).then(function (cache) {
              cache.put(request, clone).catch(function () {});
            });
            return response;
          })
          .catch(function () {
            // 网络失败且缓存 miss：合成 503，绝不 resolve(undefined)。
            return new Response('', { status: 503, headers: { 'Content-Type': 'text/plain' } });
          });
      })
    );
    return;
  }

  // External APIs — bypass SW
  if (
    url.hostname.includes('api.github.com') ||
    url.hostname.includes('api.open-meteo.com') ||
    url.hostname.includes('translate.googleapis.com') ||
    url.hostname.includes('api.mymemory.translated.net') ||
    url.hostname.includes('translate.argosopentech.com') ||
    // 私有数据 Worker（Phase 2A 起 Pull 走这里）。
    // 精确匹配：这条路返回私人 diary / mood / gratitude 数据，
    // 绝不能被下面的 .json / 兜底分支写进 CACHE_STATIC。
    url.hostname === 'cycle-tracker-data.cycletracker-barry.workers.dev'
  ) {
    return;
  }

  // HTML — network first with timeout fallback (3s), then offline page / cached root / synthesized 503
  if (request.mode === 'navigate') {
    event.respondWith(
      Promise.race([
        fetch(request),
        new Promise(function (_, reject) {
          setTimeout(function () {
            reject(new Error('network timeout'));
          }, 3000);
        }),
      ]).catch(function () {
        // 网络失败/超时 → 依次回退：缓存的 offline.html → 缓存的根页面 → 合成 503。
        // caches.match() 在 miss 时 resolve(undefined) 而非 reject，
        // 必须显式判空兜底，保证 respondWith 永远拿到合法 Response。
        return caches.match('./offline.html').then(function (offline) {
          if (offline) return offline;
          return caches.match('./').then(function (root) {
            if (root) return root;
            return new Response(
              '<!DOCTYPE html><html lang="zh"><meta charset="utf-8"><title>Offline</title><body><h1>Offline</h1></body></html>',
              { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
            );
          });
        });
      })
    );
    return;
  }

  // CSS/JS/Data — network first with cache fallback + background cache update
  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'manifest' || url.pathname.endsWith('.json')) {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          // Clone immediately — response body can only be read once
          const clone = response.clone();
          caches.open(CACHE_STATIC).then(function (cache) {
            cache.put(request, clone).catch(function () {});
          });
          return response;
        })
        .catch(function () {
          return caches.match(request).then(function (cached) {
            if (cached) return cached;
            // 网络失败且缓存 miss：合成 503，绝不 resolve(undefined)。
            return new Response('', { status: 503, headers: { 'Content-Type': 'text/plain' } });
          });
        })
    );
    return;
  }

  // Everything else: network first, no cache
  event.respondWith(
    fetch(request).catch(function () {
      return caches.match(request).then(function (cached) {
        if (cached) return cached;
        // 网络失败且缓存 miss：合成 503，绝不 resolve(undefined)。
        return new Response('', { status: 503, headers: { 'Content-Type': 'text/plain' } });
      });
    })
  );
});

// ================================================================
// Background Sync — offline diary saves
// ================================================================

self.addEventListener('sync', function (event) {
  if (event.tag === 'sync-diary') {
    event.waitUntil(syncDiaryData());
  }
});

/**
 * Retrieve queued diary entries from IndexedDB and push them via the
 * app's sync endpoint. On success, clear the queue.
 */
function syncDiaryData() {
  // Fall back to the sync.js mechanism: open a client and re-trigger the
  // app-level sync function which knows how to push pending entries.
  return self.clients.matchAll().then(function (clients) {
    if (clients && clients.length) {
      clients.forEach(function (client) {
        client.postMessage({ type: 'SYNC_DIARY_TRIGGER' });
      });
    }
  });
}

// ================================================================
// Message event — allow the app to trigger a sync or perform
// other SW-level actions
// ================================================================

self.addEventListener('message', function (event) {
  const data = event.data || {};

  // 显式请求立即更新（页面侧可用它配合「有新版本」提示）。
  // 只在页面主动调用时触发，不再在 install 里无条件执行。
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  // Allow the app to ask the SW to try syncing now
  if (data.type === 'TRIGGER_SYNC') {
    self.registration.sync.register('sync-diary').catch(function () {
      // Sync registration failed — client should push immediately
    });
    return;
  }
});

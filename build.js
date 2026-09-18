// ⚠️ 已废弃（Phase 2D，commit fb85041）——不要运行，不要“修复”下面的 FILES 清单。
//
// 这个脚本是应用早期的手工打包工具，唯一产物是 dist/bundle/app.bundle.js。
// 应用从不加载 bundle（index.html 逐个 <script> 引入），Phase 2D 已把
// dist/bundle/ 整个删掉，并且 tests/test-phase2d-cleanup.js 的 D4 明确断言
// 它必须保持不存在、既不被 index.html 加载也不被 sw.js 预缓存。
// 因此：运行它 = 立刻打破 D4。没有任何流程依赖它（package.json 没有 scripts，
// 仓库没有 CI），保留它只是为了不删除历史文件。
//
// 下面的 FILES 是 Phase 2D 当时的一次性快照，不是当前加载顺序的清单 —— 它
// 已经不包含此后新增的模块（如 js/module-memories.js），这是预期的，不要
// 为了“清单看起来一致”而往里加文件：那只会让一个已死的工具显得仍在维护，
// 并引诱后人重新生成被禁止的 bundle。当前真实的加载顺序以 index.html 为准。
//
// build.js — 将 30+ 个 JS 文件打包为一个 bundle（历史文件，见上）
// 运行：node build.js
// 需要 esbuild：npm install esbuild
// 输出：dist/bundle/app.bundle.js（压缩）+ dist/bundle/app.bundle.min.js（压缩）

var fs = require('fs');
var path = require('path');

// 加载顺序（与 index.html 一致）
var FILES = [
  'dist/js/gsap-animations.js',
  'dist/js/ui-core.js',
  'dist/js/i18n.js',
  'dist/js/chart-renderer.js',
  'dist/js/lunar.js',
  'dist/js/calendar-culture.js',
  'dist/js/cycle-core.js',
  'dist/js/cycle-engine.js',
  'dist/js/render-calendar.js',
  'dist/js/theme.js',
  'dist/js/translate.js',
  'dist/js/auth.js',
  'dist/js/weather.js',
  'dist/js/sync.js',
  'dist/js/social.js',
  'dist/js/culture-cards.js',
  'dist/js/calendar.js',
  'dist/js/shared-calendar.js',
  'dist/js/barry.js',
  'dist/js/render-mood.js',
  'dist/js/render-love.js',
  'dist/js/render-misc.js',
  'dist/js/module-holidays.js',
  'dist/app.js',
  'dist/js/module-sleep.js',
  'dist/js/module-settings.js',
  'dist/js/module-dashboard.js',
  'dist/js/module-stats.js',
  'dist/js/fix-css.js',
  'dist/js/fix-diary.js',
  'dist/js/fix-stats.js',
  'dist/js/fix-all.js',
  'dist/js/fix-panel.js',
];

// 版本号唯一来源是 sw.js 的 APP_VERSION。这里曾硬编码兜底 '7.2.0'，
// 一旦 sw.js 升版就会在 bundle banner 里写下错误的版本号。
// 改为直接读 sw.js；env 变量仍可覆盖（CI 需要时用）。
var VERSION = process.env.APP_VERSION || (function () {
  try {
    var m = fs.readFileSync(path.join(__dirname, 'sw.js'), 'utf8')
      .match(/const APP_VERSION = '([^']+)'/);
    return m ? m[1] : 'unknown';
  } catch (e) {
    return 'unknown';
  }
})();
var banner = '// Anđelin Ciklus v' + VERSION + ' | Built ' + new Date().toISOString().slice(0, 10) + '\n\n';

var bundle = banner;

FILES.forEach(function (f) {
  var fullPath = path.join(__dirname, f);
  try {
    var content = fs.readFileSync(fullPath, 'utf8');
    bundle += '/* === ' + f + ' === */\n' + content + '\n';
  } catch (e) {
    console.error('  ✖ Missing:', f);
  }
});

// 确保 dist/bundle/ 目录存在
try { fs.mkdirSync(path.join(__dirname, 'dist/bundle'), { recursive: true }); } catch (e) {}

var outPath = path.join(__dirname, 'dist/bundle/app.bundle.js');
fs.writeFileSync(outPath, bundle, 'utf8');
console.log('✅ Bundle created: dist/bundle/app.bundle.js (' + (bundle.length / 1024).toFixed(0) + ' KB)');

// 用 esbuild 压缩（无 IIFE 包裹，避免作用域冲突）
try {
  require('esbuild').buildSync({
    stdin: { contents: bundle, sourcefile: 'bundle.js' },
    outfile: path.join(__dirname, 'dist/bundle/app.bundle.min.js'),
    minify: true,
    sourcemap: true,
    target: ['es2020'],
  });
  console.log('✅ Minified: dist/bundle/app.bundle.min.js');
} catch (e) {
  console.log('  (install esbuild: npm install esbuild)');
}

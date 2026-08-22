// build.js — 将 30+ 个 JS 文件打包为一个 bundle
// 运行：node build.js
// 需要 esbuild：npm install esbuild
// 输出：dist/bundle/app.bundle.js（压缩）+ dist/bundle/app.bundle.min.js（压缩）

var fs = require('fs');
var path = require('path');

// 加载顺序（与 index.html 一致）
var FILES = [
  'dist/js/i18n.js',
  'dist/js/gsap-animations.js',
  'dist/js/ui-core.js',
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
  'dist/js/render-settings.js',
  'dist/js/render-diary.js',
  'dist/app.js',
  'dist/js/module-holidays.js',
  'dist/js/module-sleep.js',
  'dist/js/module-settings.js',
  'dist/js/module-dashboard.js',
  'dist/js/module-stats.js',
  'dist/js/fix-all.js',
];

var VERSION = process.env.APP_VERSION || '7.2.0';
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

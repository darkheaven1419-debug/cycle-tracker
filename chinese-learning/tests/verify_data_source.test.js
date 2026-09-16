/* Data Source 防回归 — 中文学习课程只能有一个正式数据源
   用法: node tests/verify_data_source.test.js

   背景（2026-09-16 Data Source Cleanup）:
     此前同名 lessons.json 存在三份 —— 仓库根 data/、dist/data/、chinese-learning/data/。
     前两份是"中文模块内嵌在主 PWA 里"时期的历史遗留快照（1142 词条，仍含 L36 已修的
     「有过两个红绿灯」等旧内容），且曾实际导致 `git show HEAD:data/lessons.json`
     静默读错文件。两份历史副本已随本次清理删除。

   本测试锁定以下不变量，防止旧副本复活或再次被误读:
     A. chinese-learning/data/lessons.json 存在，且是唯一课程数据源（6/180/1143）
     B. 仓库根 data/lessons.json 与 dist/data/lessons.json 不存在
     C. 全仓库除 chinese-learning/data/ 外不存在任何同名 lessons.json
     D. 运行时代码只从 chinese-learning/ 读课程数据；根 PWA 侧零引用
     E. chinese-learning 的测试一律以 chinese-learning 为 BASE 读课程数据
     F. 两个退役生成器不再向旧路径写入
     G. 主项目自身的数据文件未被误删（防"误删整个 data/"）
*/
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..');   // chinese-learning/
const REPO = path.join(BASE, '..');        // 仓库根
const SOURCE = path.join(BASE, 'data', 'lessons.json');
const LEGACY = [
  path.join(REPO, 'data', 'lessons.json'),
  path.join(REPO, 'dist', 'data', 'lessons.json'),
];
// 主项目自身的数据文件（sw.js 预缓存依赖，缺任一都会导致 PWA 404）
const MAIN_DATA = ['culture-knowledge.json', 'data.json', 'holidays.json', 'quotes.json', 'solar-terms.json'];
const SKIP_DIRS = new Set(['node_modules', '.git', '.claude', '.agents', '.vscode', '.claude-verify']);

let passed = 0, failed = 0;
function ok(c, l) { if (c) { passed++; console.log('  PASS  ' + l); } else { failed++; console.log('  FAIL  ' + l); } }
function section(s) { console.log('\n== ' + s + ' =='); }

const rel = (p) => path.relative(REPO, p).split(path.sep).join('/');
function walk(dir, out) {
  out = out || [];
  let ents;
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return out; }
  for (const e of ents) {
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(path.join(dir, e.name), out); }
    else if (e.isFile()) out.push(path.join(dir, e.name));
  }
  return out;
}
function readText(p) {
  try { const b = fs.readFileSync(p); if (b.length > (4 << 20)) return null; return b.toString('utf8'); }
  catch (e) { return null; }
}
// 去掉注释后再判断 —— 避免"注释里提到旧路径"被误判成"代码里引用旧路径"
// 注意: 本仓库源文件为 CRLF 行尾，且 JS 的 `.` 不匹配 \r、`$`（无 m 标志）只匹配真末尾，
//       所以单用 /\/\/.*$/ 在 CRLF 下不会命中。必须先剥 \r，再按行判断/替换。
function stripComments(src) {
  return src.split('\n')
    .map((l) => l.replace(/\r$/, ''))
    .map((l) => {
      const t = l.trim();
      if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) return '';
      return l.replace(/\/\/.*$/, '');
    })
    .join('\n');
}

section('A. 正式数据源存在且唯一');
let LESSONS = null;
try { LESSONS = JSON.parse(fs.readFileSync(SOURCE, 'utf8')); ok(true, 'chinese-learning/data/lessons.json 可解析为合法 JSON'); }
catch (e) { ok(false, 'chinese-learning/data/lessons.json 读取失败: ' + e.message); }
if (LESSONS) {
  const flat = LESSONS.flatMap((p) => (p.lessons || []));
  const words = flat.flatMap((l) => (l.words || []));
  ok(LESSONS.length === 6, 'phase 数 = 6（实际 ' + LESSONS.length + '）');
  ok(flat.length === 180, 'lesson 数 = 180（实际 ' + flat.length + '）');
  ok(words.length === 1143, '词条总数 = 1143（实际 ' + words.length + '）');
  const badKey = [];
  words.forEach((w) => { const ks = Object.keys(w).sort().join(','); if (ks !== 'py,sr,zh') badKey.push(ks); });
  ok(badKey.length === 0, '词条 key 恰为 {zh,py,sr}（异常 ' + badKey.slice(0, 3).join('|') + '）');
}

section('B. 历史遗留副本已删除（仓库根 / dist）');
ok(!fs.existsSync(LEGACY[0]), '仓库根 data/lessons.json 不存在');
ok(!fs.existsSync(LEGACY[1]), 'dist/data/lessons.json 不存在');

section('C. 全仓库无其他同名 lessons.json');
const dupes = walk(REPO).filter((p) => path.basename(p) === 'lessons.json' && path.resolve(p) !== path.resolve(SOURCE));
ok(dupes.length === 0, '除 chinese-learning/data/lessons.json 外无同名文件（发现 ' + dupes.map(rel).join(', ') + '）');

section('D. 运行时代码只读 chinese-learning 的课程数据');
const rootRuntime = ['app.js', 'index.html', 'sw.js', 'lite.html', 'static.html', 'offline.html', 'dist/index.html', 'dist/sw.js']
  .map((f) => path.join(REPO, f));
['js', 'dist/js'].forEach((d) => {
  const p = path.join(REPO, d);
  if (!fs.existsSync(p)) return;
  fs.readdirSync(p).forEach((f) => { if (f.endsWith('.js')) rootRuntime.push(path.join(p, f)); });
});
const rootHits = rootRuntime.filter((p) => { const t = readText(p); return t !== null && /lessons\.json/.test(t); });
ok(rootHits.length === 0, '根 PWA 运行时零引用 lessons.json（命中 ' + rootHits.map(rel).join(', ') + '）');

const clLearn = path.join(BASE, 'js', 'chinese-learn.js');
const siteJs = fs.readdirSync(path.join(BASE, 'js')).filter((f) => f.endsWith('.js')).map((f) => path.join(BASE, 'js', f));
const siteHits = siteJs.filter((p) => /lessons\.json/.test(readText(p) || ''));
ok(siteHits.length === 1 && path.basename(siteHits[0]) === 'chinese-learn.js',
  'chinese-learning/js/ 中仅 chinese-learn.js 引用课程数据（实际 ' + siteHits.map(rel).join(', ') + '）');
const clSrc = readText(clLearn) || '';
ok(/fetch\(["']data\/lessons\.json["']\)/.test(clSrc), 'chinese-learn.js 使用相对路径 fetch("data/lessons.json")');
ok(!/["']\/data\/lessons\.json["']/.test(clSrc), 'chinese-learn.js 不使用站点根绝对路径 /data/lessons.json');
ok(!/\.\.\//.test(clSrc), 'chinese-learn.js 不含任何上级目录引用（../）');

section('E. chinese-learning 的测试以 chinese-learning 为 BASE');
const testFiles = fs.readdirSync(path.join(BASE, 'tests'))
  .filter((f) => f.endsWith('.test.js')).map((f) => path.join(BASE, 'tests', f));
const badBase = testFiles.filter((p) => {
  const t = stripComments(readText(p) || '');
  return /["']\.\.\/data["']|["']\.\.["']\s*,\s*["']data["']|`\.\.\/data/.test(t);
});
ok(badBase.length === 0, '无测试以仓库根相对路径读课程数据（违规 ' + badBase.map(rel).join(', ') + '）');
const readers = testFiles.filter((p) => /lessons\.json/.test(stripComments(readText(p) || '')));
const readersWithBase = readers.filter((p) => /path\.join\(\s*BASE/.test(readText(p) || ''));
ok(readers.length > 0 && readers.length === readersWithBase.length,
  '读取课程数据的测试都走 path.join(BASE, …)（' + readersWithBase.length + '/' + readers.length + '）');

section('F. 退役生成器不再写入旧路径');
// 自检：确认注释剥离在 CRLF 下确实生效，否则下面的 F 检查会"假通过"
ok(stripComments('// writeFileSync\r\ncode();\r\n') === '\ncode();\n',
  'stripComments 在 CRLF 行尾下正确剥离行注释（自检）');
['tools/gen-lessons.js', 'scripts/gen_full.js'].forEach((f) => {
  const p = path.join(REPO, f);
  const t = readText(p);
  ok(t !== null, rel(p) + ' 存在');
  if (t === null) return;
  ok(/DEPRECATED/.test(t), rel(p) + ' 已标记 DEPRECATED');
  ok(!/writeFileSync/.test(stripComments(t)), rel(p) + ' 无可执行写入语句（注释除外）');
});

section('G. 主项目自身数据文件未被误删');
MAIN_DATA.forEach((f) => {
  const p = path.join(REPO, 'data', f);
  ok(fs.existsSync(p), rel(p) + ' 存在');
});

console.log('\n== 汇总 ==');
console.log('通过 ' + passed + ' 项，失败 ' + failed + ' 项');
process.exit(failed ? 1 : 0);

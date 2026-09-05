/* Vocabulary Contextualization Audit — Phase A 验证（node）
   用法: node tests/verify_vocab_phasea.test.js
   验证内容:
   1. lessons.json 合法 + 课程结构不变（6 phase / 180 课 / 1142 词条 / 词条 key 恰为 zh,py,sr 且非空）
   2. Phase A 的 11 处定点修复值正确（含 喂 py 改 wèi、sr 拼写、同课 sr 撞串拆开）
   3. L22 点 有意保持 "Sat"（usage note 需第 4 字段 → schema 变更，越界缓做）
   4. 全语料无「同课 sr 撞串」（反向题二义数据级清零）
   5. pinyin 声调标记良构 + 喂 = 四声（toneOf 为纯函数，从韵母变音符解析）
*/
const fs = require('fs');
const path = require('path');
const BASE = path.join(__dirname, '..');
let passed = 0, failed = 0;
function ok(c, l) { if (c) { passed++; console.log('  PASS  ' + l); } else { failed++; console.log('  FAIL  ' + l); } }
function section(s) { console.log('\n== ' + s + ' =='); }

let LESSONS;
try { LESSONS = JSON.parse(fs.readFileSync(path.join(BASE, 'data', 'lessons.json'), 'utf8')); ok(true, 'lessons.json 可解析为合法 JSON'); }
catch (e) { ok(false, 'lessons.json 解析失败: ' + e.message); }
const flat = LESSONS.flatMap(p => (p.lessons || []));
const allWords = flat.flatMap(l => (l.words || []));
const byId = {}; flat.forEach(l => { byId[l.id] = l; });

// 纯函数：从带声调韵母解析调号 1-4，无变音符 → 5（轻声/无调）
function toneOf(py) {
  const two = ['á', 'é', 'í', 'ó', 'ú', 'ǘ'], three = ['ǎ', 'ě', 'ǐ', 'ǒ', 'ǔ', 'ǚ'], four = ['à', 'è', 'ì', 'ò', 'ù', 'ǜ'], one = ['ā', 'ē', 'ī', 'ō', 'ū', 'ǖ'];
  for (const ch of py) { if (two.indexOf(ch) >= 0) return 2; if (three.indexOf(ch) >= 0) return 3; if (four.indexOf(ch) >= 0) return 4; if (one.indexOf(ch) >= 0) return 1; }
  return 5;
}

section('结构不变');
ok(LESSONS.length === 6, 'phase 数 = 6（实际 ' + LESSONS.length + '）');
ok(flat.length === 180, 'lesson 数 = 180（实际 ' + flat.length + '）');
ok(allWords.length === 1142, '词条总数 = 1142（实际 ' + allWords.length + '）');
let badKey = [];
allWords.forEach(w => { const ks = Object.keys(w).sort().join(','); if (ks !== 'py,sr,zh') badKey.push(ks); });
ok(badKey.length === 0, '词条 key 恰为 {zh,py,sr}（异常 ' + badKey.slice(0, 3).join('|') + '）');
ok(allWords.every(w => w.zh && w.py && w.sr), '所有词条 zh/py/sr 非空');

section('Phase A 定点修复值');
// 每处修复都限定在某课的 words 内定位（如 幸福 亦存在于 L109/L143，Phase A 有意只改 L87）
const want = [
  [32, '咸', 'xián', 'Slano', '咸 L32 sr 拼写 Sleno→Slano'],
  [41, '喂', 'wèi', 'Halo', '喂 L41 py wéi→wèi（四声）'],
  [94, '想', 'xiǎng', 'nedostajati (misliti na)', '想 L94 sr → 本课「想念/nedostajati」口径'],
  [12, '会', 'huì', 'umeti (znati)', '会 L12 sr Znati→umeti(znati)，与练习 Umeti 对齐'],
  [68, '可是', 'kě shì', 'ali (razgovorni)', '可是 L68 sr 拆出撞串（口语转折）'],
  [68, '却', 'què', 'međutim (ipak; književno)', '却 L68 sr 拆出撞串（书面 ipak）'],
  [87, '好运', 'hǎo yùn', 'sreća (u igri)', '好运 L87 sr 拆出撞串（时运）'],
  [87, '幸福', 'xìng fú', 'sreća (životna)', '幸福 L87 sr 拆出撞串（人生幸福）'],
  [13, '岁', 'suì', 'Godina (starosti)', '岁 L13 sr → 年龄语境，与 年 区分'],
  [129, '酒', 'jiǔ', 'vino / alkoholno piće', '酒 L129 sr → 宽泛「酒/含酒精」'],
  [57, '倍', 'bèi', 'put(a) / puta više', '倍 L57 sr → 倍数语境，去「道路 put」歧义'],
];
for (const [lid, z, py, sr, label] of want) {
  const hit = (byId[lid] && byId[lid].words || []).filter(w => w.zh === z);
  const match = hit.length === 1 && hit[0].py === py && hit[0].sr === sr;
  ok(match, label + ' [L' + lid + ' ' + z + ' py=' + (hit[0] && hit[0].py) + ' sr=' + (hit[0] && hit[0].sr) + ']');
}
// 点 L22 有意不改
{
  const d = byId[22] && byId[22].words.find(w => w.zh === '点');
  ok(d && d.sr === 'Sat', '点 L22 sr 保持 "Sat"（usage note 需 schema 第 4 字段，Phase A 不改）');
}

section('同课 sr 撞串清零（反向题二义）');
let dupLessons = [];
for (const l of flat) {
  const seen = new Set(); const dup = new Set();
  (l.words || []).forEach(w => { const k = (w.sr || '').trim().toLowerCase().replace(/\s+/g, ' '); if (k && seen.has(k)) dup.add(k); seen.add(k); });
  if (dup.size) dupLessons.push({ id: l.id, dup: [...dup] });
}
ok(dupLessons.length === 0, '全语料无同课 sr 撞串（剩余 ' + dupLessons.map(d => 'L' + d.id + ':' + d.dup.join('|')).join(', ') + '）');
// 被改 9 课的 quiz 窗口（words 前 5）sr 唯一 —— 保证测验正确答案唯一
const editedIds = [12, 13, 32, 41, 57, 68, 87, 94, 129];
for (const id of editedIds) {
  const l = byId[id]; const win = (l.words || []).slice(0, 5);
  const set = new Set(win.map(w => (w.sr || '').trim().toLowerCase().replace(/\s+/g, ' ')));
  ok(set.size === win.length, 'L' + id + ' quiz 窗口前 5 词 sr 互异（' + win.length + ' 词）');
}

section('拼音声调良构 + 关键调值');
// 良构：单字条目（zh 单 CJK）py 为单音节，其带调韵母标记必须 ≤1 处（0=轻声）
const badTone = [];
for (const w of allWords) {
  if (!/^[一-鿿]$/.test(w.zh)) continue;
  if (/\s/.test(w.py)) continue; // 单字应单音节
  const marks = [...w.py].filter(c => /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(c));
  if (marks.length > 1) badTone.push(w.zh + '=' + w.py + '(' + marks.length + ')');
}
ok(badTone.length === 0, '单字条目 pinyin 带调标记 ≤1（异常 ' + badTone.slice(0, 5).join('|') + '）');
const toneExpect = [['喂', 4], ['妈', 1], ['麻', 2], ['马', 3], ['骂', 4], ['咸', 2], ['会', 4], ['想', 3], ['岁', 4], ['酒', 3], ['倍', 4], ['点', 3]];
for (const [z, t] of toneExpect) {
  const w = allWords.find(x => x.zh === z);
  ok(w && toneOf(w.py) === t, 'toneOf(' + (w && w.py) + ')=' + (w ? toneOf(w.py) : '?') + ' 期望 ' + t + '（' + z + '）');
}

console.log('\n== 汇总 ==');
console.log('通过 ' + passed + ' 项，失败 ' + failed + ' 项');
process.exit(failed ? 1 : 0);

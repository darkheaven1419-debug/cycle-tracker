/* V1.4 Phase A 验证 — L1 / L36 / L37 定点修复（node，只读）
   用法: node tests/verify_v14a.test.js

   覆盖用户要求的 12 项检查：
   L1  : (1) 无错误配对 (2) 无多余元语言解释 (3) 核心词在语境中 (4) Serbian + pinyin 同步
   L36 : (5) 全仓（已跟踪文件）不再出现「有过」 (6) 语法不再解释错误结构 (7) 三语同步
   L37 : (8) 公交车 使用恰当 (9) 公共汽车 不再是核心 (10) 核心交通词与对话挂钩
         (11) 手写练习不再考「骑」 (12) 词汇-对话-语法-练习闭环
   另加：全局结构不变量（6/180/1143、词条 key、同课 sr 撞串、紧凑 JSON 往返字节一致）
   后续：2026-09-16 用户决定把「飞机」恢复到 L37 词表（扩展词汇，1143 = 1142 + 1）→ 新增 L37-9b 检查
*/
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const BASE = path.join(__dirname, '..');
let passed = 0, failed = 0;
function ok(c, l) { if (c) { passed++; console.log('  PASS  ' + l); } else { failed++; console.log('  FAIL  ' + l); } }
function section(s) { console.log('\n== ' + s + ' =='); }

const CJK = /[一-鿿]/;
let LESSONS, raw;
try {
  raw = fs.readFileSync(path.join(BASE, 'data', 'lessons.json'), 'utf8');
  LESSONS = JSON.parse(raw);
  ok(true, 'lessons.json 可解析为合法 JSON');
} catch (e) { ok(false, 'lessons.json 解析失败: ' + e.message); }
const flat = LESSONS.flatMap((p) => (p.lessons || []));
const byId = {}; flat.forEach((l) => { byId[l.id] = l; });
const L1 = byId[1], L36 = byId[36], L37 = byId[37];

// 带调韵母 → 调号（纯函数）
function toneOf(py) {
  const two = ['á','é','í','ó','ú','ǘ'], three = ['ǎ','ě','ǐ','ǒ','ǔ','ǚ'],
        four = ['à','è','ì','ò','ù','ǜ'], one = ['ā','ē','ī','ō','ū','ǖ'];
  for (const ch of py) { if (two.indexOf(ch) >= 0) return 2; if (three.indexOf(ch) >= 0) return 3; if (four.indexOf(ch) >= 0) return 4; if (one.indexOf(ch) >= 0) return 1; }
  return 5;
}
const dlgLines = (s) => String(s || '').split('\n').filter((x) => x.trim());
// 取对话发言内容（去掉 "A: " / "B: " 前缀）
const dlgSay = (s) => dlgLines(s).map((x) => x.replace(/^[AB]:\s*/, ''));

// ---------------------------------------------------------------- 全局不变量
section('全局结构不变量（应与 V1.3 Phase A 基线一致）');
ok(LESSONS.length === 6, 'phase 数 = 6（实际 ' + LESSONS.length + '）');
ok(flat.length === 180, 'lesson 数 = 180（实际 ' + flat.length + '）');
const allWords = flat.flatMap((l) => (l.words || []));
ok(allWords.length === 1143, '词条总数 = 1143（实际 ' + allWords.length + '）');
ok(allWords.every((w) => Object.keys(w).sort().join(',') === 'py,sr,zh'), '词条 key 恰为 {zh,py,sr}');
ok(allWords.every((w) => w.zh && w.py && w.sr), '所有词条 zh/py/sr 非空');
ok(JSON.stringify(LESSONS) === raw, '紧凑 JSON 往返字节一致（未被格式化）');
// 无新增 schema 字段：lesson 级 key 仍为原 10 个
const LESSON_KEYS = 'id,day,icon,topic,words,dialog,grammar,practice,culture,points';
const badKeys = flat.filter((l) => Object.keys(l).slice().sort().join(',') !== LESSON_KEYS.split(',').sort().join(','));
ok(badKeys.length === 0, 'lesson 级 key 集合未变（无新增字段，异常 ' + badKeys.map((l) => l.id).join(',') + '）');
// 同课 sr 撞串 = 0
const collide = flat.filter((l) => {
  const sr = (l.words || []).map((w) => String(w.sr || '').trim());
  return new Set(sr).size !== sr.length;
});
ok(collide.length === 0, '全语料同课 sr 撞串 = 0（异常 ' + collide.map((l) => l.id).join(',') + '）');
// 汉字数 == 拼音音节数（词表内）—— 儿化音除外（如 L19 哪儿/nǎr：2 汉字 1 音节，属正确既有数据）
const sylBad = [];
for (const l of flat) for (const w of (l.words || [])) {
  const zh = String(w.zh || '');
  if (!/^[一-鿿]+$/.test(zh)) continue;
  const syl = String(w.py || '').trim().split(/\s+/).filter(Boolean);
  const erhua = /儿$/.test(zh) && syl.length === zh.length - 1;
  if (syl.length !== zh.length && !erhua) sylBad.push('L' + l.id + ':' + zh + '/' + w.py);
}
ok(sylBad.length === 0, '全语料「汉字数 == 拼音音节数」（儿化除外，异常 ' + sylBad.slice(0, 5).join(' ') + '）');

// ---------------------------------------------------------------- L1
section('L1 — 零基础第一课');
const l1Say = dlgSay(L1.dialog.zh);
// (1) 无错误配对
ok(L1.dialog.zh.indexOf('谢谢！\nB: 没关系') < 0, 'L1-1 不存在错误配对「谢谢 → 没关系」');
{
  const idxThanks = l1Say.findIndex((s) => s === '谢谢！');
  const idxSorry = l1Say.findIndex((s) => s === '对不起！');
  ok(idxThanks >= 0 && l1Say[idxThanks + 1] === '不客气。', 'L1-1 「谢谢！」的应答是「不客气。」（实际 ' + l1Say[idxThanks + 1] + '）');
  ok(idxSorry >= 0 && l1Say[idxSorry + 1] === '没关系。', 'L1-1 「对不起！」的应答是「没关系。」（实际 ' + l1Say[idxSorry + 1] + '）');
}
// (2) 无多余元语言解释
{
  const g = String(L1.grammar.zh || '');
  const meta = ['SVO', '语序', '词形变化', '词形', '语法学', '形态'];
  const hit = meta.filter((m) => g.indexOf(m) >= 0);
  ok(hit.length === 0, 'L1-2 语法不含元语言理论（命中 ' + hit.join(',') + '）');
  ok(!/SVO/.test(String(L1.grammar.sr) + String(L1.grammar.en)), 'L1-2 sr/en 语法同样不含 SVO 讲义');
  ok(g.length > 0 && CJK.test(g), 'L1-2 语法仍是一句可用的中文规则（非空）');
}
// (3) 核心词在语境中
{
  const keep = ['你好', '谢谢', '对不起', '没关系', '不客气'];
  const missing = keep.filter((w) => L1.dialog.zh.indexOf(w) < 0);
  ok(missing.length === 0, 'L1-3 保留词全部出现在对话中（缺失 ' + missing.join(',') + '）');
  const wz = L1.words.map((w) => w.zh);
  ok(keep.every((w) => wz.indexOf(w) >= 0), 'L1-3 保留词全部仍在词表中');
  ok(wz.indexOf('学习') < 0, 'L1-3 抽象词「学习」已移出词表');
  // 对话用字不得越出词表（L1 是第 1 课，没有"前序课程"可依赖）
  const sayChars = new Set(l1Say.join('').replace(/[！。？，]/g, '').split(''));
  const taught = new Set(wz.join('').split(''));
  const extra = [...sayChars].filter((c) => CJK.test(c) && !taught.has(c));
  ok(extra.length === 0, 'L1-3 对话无「词表外的汉字」（越界 ' + extra.join('') + '）');
}
// (4) Serbian + pinyin 同步
{
  ok(dlgLines(L1.dialog.zh).length === dlgLines(L1.dialog.sr).length
    && dlgLines(L1.dialog.zh).length === dlgLines(L1.dialog.en).length,
    'L1-4 三语对话行数一致（zh ' + dlgLines(L1.dialog.zh).length + ' / sr ' + dlgLines(L1.dialog.sr).length + ' / en ' + dlgLines(L1.dialog.en).length + '）');
  // 谢谢 的 sr 应答，必须与词表中「不客气」的 sr 一致
  const bukeqi = L1.words.find((w) => w.zh === '不客气');
  ok(bukeqi && L1.dialog.sr.indexOf(bukeqi.sr) >= 0, 'L1-4 对话 sr 使用了词表「不客气」的 sr（' + (bukeqi && bukeqi.sr) + '）');
  const meiguanxi = L1.words.find((w) => w.zh === '没关系');
  ok(meiguanxi && L1.dialog.sr.indexOf(meiguanxi.sr) >= 0, 'L1-4 对话 sr 使用了词表「没关系」的 sr（' + (meiguanxi && meiguanxi.sr) + '）');
  // 不再出现「谢谢 → Nema veze」与词表 Nema veze 相矛盾的配对
  ok(L1.dialog.sr.indexOf('Hvala!\nB: Nema veze') < 0, 'L1-4 不存在「Hvala → Nema veze」的错误配对');
  // 不客气 与 L53 口径一致
  const l53 = (byId[53].words || []).find((w) => w.zh === '不客气');
  ok(l53 && bukeqi && l53.py === bukeqi.py && l53.sr === bukeqi.sr,
    'L1-4 「不客气」py/sr 与 L53 完全一致（' + (bukeqi && bukeqi.py + '/' + bukeqi.sr) + '）');
  ok(toneOf(bukeqi.py) === 2 && /^bú/.test(bukeqi.py), 'L1-4 「不客气」拼音 bú（不 在四声前变二声）');
  // 练习：选项语言必须与全语料主流一致（塞尔维亚语），不再有英文选项
  const opts = L1.practice.options.join(' ');
  ok(L1.practice.options.length === 4, 'L1-4 练习选项数 = 4（实际 ' + L1.practice.options.length + '）');
  ok(!/\b(Hello|Thank you|Sorry|Goodbye)\b/i.test(opts), 'L1-4 练习不再使用英文选项');
  ok(L1.practice.options[L1.practice.correct] === 'Hvala', 'L1-4 练习正确项指向「谢谢」的塞尔维亚语 Hvala');
  ok(L1.words.some((w) => w.zh === '谢谢'), 'L1-4 练习考的「谢谢」在本课词表中');
}

// ---------------------------------------------------------------- L36
section('L36 — 语法错误修复');
ok(L36.dialog.zh.indexOf('过了两个红绿灯就到了') >= 0, 'L36-5 对话为「过了两个红绿灯就到了」');
ok(L36.dialog.zh.indexOf('有过') < 0, 'L36-5 L36 对话不再出现「有过」');
ok(L36.grammar.zh.indexOf('过+数字') < 0, 'L36-6 语法不再出现错误的「过+数字」模式');
ok(L36.grammar.zh.indexOf('过了+数字') >= 0, 'L36-6 语法改为「过了+数字+红绿灯」');
ok(L36.grammar.en.indexOf('Guò le') >= 0 && L36.grammar.sr.indexOf('Guò le') >= 0, 'L36-6 sr/en 语法同步为 Guò le');
{
  // (7) 三语同步 + 词表 sr 截断修复
  ok(dlgLines(L36.dialog.zh).length === dlgLines(L36.dialog.sr).length
    && dlgLines(L36.dialog.zh).length === dlgLines(L36.dialog.en).length,
    'L36-7 三语对话行数一致（' + dlgLines(L36.dialog.zh).length + '/' + dlgLines(L36.dialog.sr).length + '/' + dlgLines(L36.dialog.en).length + '）');
  const g = (zh) => L36.words.find((w) => w.zh === zh);
  ok(g('地铁站').sr === 'Metro stanica', 'L36-7 地铁站 sr 截断已修复（' + g('地铁站').sr + '）');
  ok(g('公交车站').sr === 'Autobuska stanica', 'L36-7 公交车站 sr 截断已修复（' + g('公交车站').sr + '）');
  ok(g('过').sr === 'Proći', 'L36-7 「过」sr 改为 Proći（经过，非 Preći 横穿）');
  ok(/prođeš|prošao/i.test(L36.dialog.sr), 'L36-7 对话 sr 同步为「经过」义（prođeš/prošao）');
  ok(L36.dialog.sr.indexOf('blizini') >= 0, 'L36-7 对话 sr 补回「附近」（blizini）');
  ok(L36.dialog.sr.indexOf('metro stanica') >= 0, 'L36-7 对话 sr 补回「地铁站」（metro stanica）');
  ok(/znači/.test(L36.practice.prompt.sr), 'L36-7 练习 sr 提示句补齐谓语（znači）');
  ok(/does .* mean/.test(L36.practice.prompt.en), 'L36-7 练习 en 提示句补齐谓语（does … mean）');
  ok(L36.practice.options[L36.practice.correct] === 'Semafor', 'L36-7 练习仍正确地指向 Semafor');
  ok(L36.words.some((w) => w.zh === '红绿灯'), 'L36-7 练习考的「红绿灯」在本课词表中');
  ok(/[.!?]\s*$/.test(String(L36.culture.sr).trim()) && String(L36.culture.sr).split(/\s+/).length >= 8,
    'L36-7 文化 sr 已是完整句子（' + String(L36.culture.sr).slice(0, 42) + '…）');
  ok(/[.!?]\s*$/.test(String(L36.culture.en).trim()) && String(L36.culture.en).split(/\s+/).length >= 8,
    'L36-7 文化 en 已是完整句子');
}

// L36-5 全仓（已跟踪文件）不再出现「有过」
{
  let files = [];
  try { files = execSync('git ls-files', { cwd: BASE, encoding: 'utf8' }).split('\n').filter(Boolean); }
  catch (e) { ok(false, 'git ls-files 失败: ' + e.message); }
  const hits = [];
  for (const f of files) {
    if (!/\.(json|js|html|css|md|txt)$/i.test(f)) continue;
    let t; try { t = fs.readFileSync(path.join(BASE, f), 'utf8'); } catch (e) { continue; }
    if (t.indexOf('有过两个红绿灯') >= 0) hits.push(f);
  }
  ok(hits.length === 0, 'L36-5 全部 ' + files.length + ' 个已跟踪文件中不再出现「有过两个红绿灯」（命中 ' + hits.join(',') + '）');
  ok(raw.indexOf('有过两个红绿灯') < 0, 'L36-5 data/lessons.json 不含错误句「有过两个红绿灯」');
  ok(raw.indexOf('过两个红绿灯') < 0 || raw.indexOf('过了两个红绿灯') >= 0, 'L36-5 「过两个红绿灯」只以正确形式「过了…」存在');
  ok(L36.dialog.zh.indexOf('有过') < 0 && String(L36.grammar.zh).indexOf('有过') < 0
    && String(L36.culture.zh).indexOf('有过') < 0 && String(L36.practice.prompt.zh).indexOf('有过') < 0,
    'L36-5 L36 全字段（对话/语法/练习/文化）均不含「有过」');
  // 注意：全语料仍存在 1 处「有过」，是 L163 经历体语法里的正确中文（「表示曾经有过的经历」），
  // 与 L36 的错句无关，本轮不得改动（只处理 L1/L36/L37）。此处显式固定下来，防止被误改或被误判为回归。
  {
    const l163 = String(byId[163].grammar.zh || '');
    ok(l163.indexOf('曾经有过') >= 0, 'L163「曾经有过的经历」保持不动（正确的经历体用法，非 L36 错句）');
    let others = 0;
    for (const l of flat) {
      if (l.id === 163) continue;
      for (const f of ['dialog', 'grammar', 'culture']) for (const k of ['zh', 'sr', 'en']) {
        if (String((l[f] && l[f][k]) || '').indexOf('有过') >= 0) others++;
      }
    }
    ok(others === 0, '除 L163 外全语料无其他「有过」出现（其他 ' + others + ' 处）');
  }
  ok(raw.indexOf('公共汽车') < 0, 'L37 全文件不再出现「公共汽车」');
}

// ---------------------------------------------------------------- L37
section('L37 — 教学目标重设计：学会说自己怎么去一个地方');
const l37w = L37.words.map((w) => w.zh);
const l37d = L37.dialog.zh;
// (8) 公交车 使用恰当
ok(l37w.indexOf('公交车') >= 0, 'L37-8 词表含 公交车');
ok(l37d.indexOf('公交车') >= 0, 'L37-8 对话含 公交车');
ok(raw.split('公交车').length - 1 >= 2, 'L37-8 全语料 公交车 出现 >= 2 次（不再是从未出现的词）');
ok(L37.words.find((w) => w.zh === '公交车').sr === 'Autobus', 'L37-8 公交车 sr = Autobus');
// (9) 公共汽车 不再是核心
ok(l37w.indexOf('公共汽车') < 0, 'L37-9 公共汽车 已移出词表（不再核心）');
ok(l37d.indexOf('公共汽车') < 0, 'L37-9 对话不使用 公共汽车');
// (9b) 「飞机」恢复为 L37 扩展词汇（2026-09-16 用户决定：飞机 是高价值、真实生活常用的
//      基础交通词；真正的问题是"对话没覆盖它"，不是"不值得学"。本轮不以生硬句子强行覆盖，
//      也不为它新增 schema 字段 —— 靠"排在词表末尾"这一位置事实实现"扩展词汇"。）
{
  const plane = L37.words.find((w) => w.zh === '飞机');
  ok(!!plane, 'L37-9b 「飞机」已恢复到 L37 词表');
  ok(plane && plane.py === 'fēi jī' && plane.sr === 'Avion',
    'L37-9b 「飞机」py/sr 与恢复前原值逐字一致（' + (plane && plane.py + ' / ' + plane.sr) + '）');
  ok(L37.words.length === 8, 'L37-9b L37 词条数 = 8（7 核心 + 1 扩展，实际 ' + L37.words.length + '）');
  ok(L37.words[L37.words.length - 1].zh === '飞机', 'L37-9b 「飞机」位于词表末尾（扩展位，非核心位）');
  ok(L37.words.slice(0, 5).every((w) => w.zh !== '飞机'),
    'L37-9b 「飞机」不在自动 quiz 抽取窗口 words[0..4] 内（扩展词不进主动测验）');
  ok(Object.keys(L37.words[7]).sort().join(',') === 'py,sr,zh', 'L37-9b 新词条未引入第 4 个字段');
  // 不为"覆盖率"写生硬句子：对话/语法/文化/手写练习 一律不涉及 飞机
  ok(l37d.indexOf('飞机') < 0, 'L37-9b 对话未为「飞机」写生硬句子（有意接受本课不覆盖它）');
  ok(String(L37.grammar.zh).indexOf('飞机') < 0, 'L37-9b 语法未为「飞机」新增句式（仍只讲 坐/骑）');
  ok(String(L37.culture.zh).indexOf('飞机') < 0 && String(L37.culture.sr).indexOf('avion') < 0
    && String(L37.culture.en).indexOf('plane') < 0, 'L37-9b 文化段未为「飞机」改动');
  ok(L37.practice.prompt.zh.indexOf('飞机') < 0
    && L37.practice.options.join('').indexOf('飞机') < 0
    && L37.practice.options.join('').indexOf('Avion') < 0,
    'L37-9b 手写练习不涉及「飞机」（不要求主动产出）');
  ok(dlgLines(L37.dialog.zh).length === 6, 'L37-9b 对话行数仍为 6（恢复「飞机」未触碰对话）');
}
// (10) 核心交通词与对话挂钩
{
  const core = ['坐', '地铁', '公交车', '走路', '骑自行车'];
  const missingD = core.filter((w) => l37d.indexOf(w) < 0);
  const missingW = core.filter((w) => l37w.indexOf(w) < 0);
  ok(missingD.length === 0, 'L37-10 5 个核心表达全部出现在对话中（缺失 ' + missingD.join(',') + '）');
  ok(missingW.length === 0, 'L37-10 5 个核心表达全部在词表中（缺失 ' + missingW.join(',') + '）');
  const gr = L37.grammar.zh;
  ok(gr.indexOf('开') < 0, 'L37-10 语法不再教未教过的「开」');
  ok(gr.indexOf('坐') >= 0 && gr.indexOf('骑') >= 0, 'L37-10 语法只讲已教的 坐/骑');
  ok(/Zuò\/qí/.test(L37.grammar.sr) && /Zuò\/qí/.test(L37.grammar.en), 'L37-10 sr/en 语法与 zh 同步（Zuò/qí）');
  ok(/坐地铁去/.test(l37d) && /坐公交车去/.test(l37d) && /走路去/.test(l37d) && /骑自行车去/.test(l37d),
    'L37-10 对话含 4 个「…去」目标句式（我坐地铁去 / 我坐公交车去 / 我走路去 / 我骑自行车去）');
  const says = dlgSay(l37d);
  ok(says.length <= 7, 'L37-10 对话未膨胀（发言 ' + says.length + ' 句，上限 7）');
  ok(says.every((s) => s.replace(/[！。？，]/g, '').length <= 9), 'L37-10 每句 <= 9 字（最长 ' + Math.max.apply(null, says.map((s) => s.replace(/[！。？，]/g, '').length)) + '）');
}
// (11) 手写练习不再考「骑」
ok(L37.practice.prompt.zh.indexOf('骑') < 0, 'L37-11 练习题干不再考「骑」');
ok(L37.practice.prompt.zh.indexOf('表示') < 0, 'L37-11 练习不再是「某字表示什么」的元语言提问');
{
  const q = L37.practice.prompt.zh.match(/"([^"]+)"/);
  const tested = q ? q[1] : '';
  ok(tested.length > 0 && l37w.indexOf(tested) >= 0, 'L37-11 练习考的是本课词表中的词（' + tested + '）');
  ok(tested.length > 0 && l37d.indexOf(tested) >= 0, 'L37-11 练习考的词同时出现在对话中（闭环）');
  ok(L37.practice.options.length === 4, 'L37-11 练习选项数 = 4');
  ok(L37.practice.options[L37.practice.correct] === 'Peške', 'L37-11 练习正确项 = Peške（走路）');
}
// (12) 词汇 - 对话 - 语法 - 练习 闭环
{
  // 自动 quiz 取 words[0..4]（见 js/chinese-quiz.js: r<5）
  const quizWords = L37.words.slice(0, 5).map((w) => w.zh);
  const notInDlg = quizWords.filter((w) => l37d.indexOf(w) < 0);
  ok(notInDlg.length === 0, 'L37-12 自动 quiz 抽到的 5 个词全部在对话中（' + quizWords.join('/') + '）');
  ok(quizWords.indexOf('骑自行车') >= 0, 'L37-12 「骑自行车」进入自动 quiz 抽取范围（骑 已教）');
  ok(l37w.indexOf('坐') >= 0, 'L37-12 语法动词「坐」已进词表');
  ok(l37w.some((z) => z.indexOf('骑') === 0), 'L37-12 语法动词「骑」已进词表');
  // 对话用字不得越出「本课词表 + 前 36 课已教」
  // 例外：「挤」是修改前 L37 对话里就有的字（挤吗？/ 早上很挤。），全语料词表从未教过，
  // 属既有缺口（本轮未授权把 挤 加进词表；词条总数现为 1143）。本轮只保证"不新引入"。
  const PRE_EXISTING_GAP = ['挤'];
  const taught = new Set();
  for (const l of flat) { if (l.id > 37) continue; for (const w of (l.words || [])) for (const c of String(w.zh)) taught.add(c); }
  const extra = [...new Set(dlgSay(l37d).join('').replace(/[！。？，]/g, '').split(''))]
    .filter((c) => CJK.test(c) && !taught.has(c) && PRE_EXISTING_GAP.indexOf(c) < 0);
  ok(extra.length === 0, 'L37-12 本次重写未新引入「未教汉字」（异常 ' + extra.join('') + '）');
  {
    // 显式暴露既有缺口：挤 仍是未教字（本轮有意不修，需单独授权才能补词表）
    const stillGap = [...new Set(dlgSay(l37d).join('').split(''))].filter((c) => CJK.test(c) && !taught.has(c));
    ok(stillGap.join('') === '挤', 'L37-12 既有缺口被如实记录：未教汉字恰为「挤」（实际 ' + (stillGap.join('') || '无') + '）');
  }
  ok(dlgLines(L37.dialog.zh).length === dlgLines(L37.dialog.sr).length
    && dlgLines(L37.dialog.zh).length === dlgLines(L37.dialog.en).length,
    'L37-12 三语对话行数一致（' + dlgLines(L37.dialog.zh).length + '/' + dlgLines(L37.dialog.sr).length + '/' + dlgLines(L37.dialog.en).length + '）');
  ok(/[.!?]\s*$/.test(String(L37.culture.sr).trim()) && String(L37.culture.sr).split(/\s+/).length >= 8, 'L37-12 文化 sr 已是完整句子');
  ok(/[.!?]\s*$/.test(String(L37.culture.en).trim()) && String(L37.culture.en).split(/\s+/).length >= 8, 'L37-12 文化 en 已是完整句子');
}

// ------------------------------------------- 真实 quiz 生成器（执行验证，非推断）
section('真实 quiz 生成器 generateQuizQuestions（从 js/chinese-quiz.js 加载后实际调用）');
{
  const vm = require('vm');
  const src = fs.readFileSync(path.join(BASE, 'js', 'chinese-quiz.js'), 'utf8');
  const ctx = { console: console, _: (a) => a, escapeHtml: (s) => String(s),
    shuffleArray: (a) => a.slice(), getLessonPhase: (id) => Math.floor((id - 1) / 30) + 1,
    LESSONS_DATA: flat };
  ctx.window = ctx;
  let loaded = true;
  try { vm.createContext(ctx); vm.runInContext(src, ctx); } catch (e) { loaded = false; ok(false, 'chinese-quiz.js 加载失败: ' + e.message); }
  if (loaded) {
    ok(typeof ctx.generateQuizQuestions === 'function', 'generateQuizQuestions 可用');
    const q37 = ctx.generateQuizQuestions(L37.words, 37);
    ok(q37.length === 5, 'L37 自动 quiz 生成 5 题（实际 ' + q37.length + '）');
    const blob37 = JSON.stringify(q37);
    ok(blob37.indexOf('公共汽车') < 0, 'L37 自动 quiz 完全不涉及「公共汽车」');
    ok(blob37.indexOf('骑自行车') >= 0, 'L37 自动 quiz 抽到「骑自行车」（骑 已教，不再是未教词）');
    ok(blob37.indexOf('Autobus') >= 0, 'L37 自动 quiz 抽到「公交车」(Autobus)');
    // choice 题必须给满 4 个选项，且选项互不相同
    const bad37 = q37.filter((q) => q.type === 'choice' && (!q.options || q.options.length !== 4 || new Set(q.options).size !== 4));
    ok(bad37.length === 0, 'L37 所有 choice 题均有 4 个互不相同的选项（异常 ' + bad37.length + '）');
    // 每个 quiz 题的答案必须能在词表里找到（题不考未教词）
    // 三种题型的答案分别是：choice→zh 或 sr；pick-zh/fill-zh→zh；fill-py→去声调拼音
    const stripTone = (p) => String(p).toLowerCase().replace(/[0-9]/g, '')
      .replace(/[āáǎà]/g, 'a').replace(/[ēéěè]/g, 'e').replace(/[īíǐì]/g, 'i')
      .replace(/[ōóǒò]/g, 'o').replace(/[ūúǔù]/g, 'u').replace(/[ǖǘǚǜ]/g, 'ü');
    const allowed = new Set();
    for (const w of L37.words) { allowed.add(w.zh); allowed.add(w.sr); allowed.add(stripTone(w.py)); }
    const strays = q37.filter((q) => !allowed.has(q.answer));
    ok(strays.length === 0, 'L37 自动 quiz 的答案全部来自本课词表（越界 ' + strays.map((q) => q.type + ':' + q.answer).join(',') + '）');
    // L1：新词「不客气」必须进 quiz，且选项不再是英文
    const q1 = ctx.generateQuizQuestions(L1.words, 1);
    ok(JSON.stringify(q1).indexOf('不客气') >= 0, 'L1 自动 quiz 覆盖新词「不客气」');
    ok(!/\b(Hello|Thank you|Sorry|Goodbye)\b/.test(JSON.stringify(q1)), 'L1 自动 quiz 不含英文选项');
    const q36 = ctx.generateQuizQuestions(L36.words, 36);
    ok(JSON.stringify(q36).indexOf('Proći') >= 0, 'L36 自动 quiz 使用修复后的「过」sr（Proći）');
    ok(JSON.stringify(q36).indexOf('Metro stanica') >= 0, 'L36 自动 quiz 使用修复后的「地铁站」sr（Metro stanica）');
    // 「飞机」是扩展词汇：自动 quiz 不得把它当作答案（= 不要求主动产出）。
    // 允许它作为 sr2zh 题的干扰项出现 —— 那是"识别"而非"产出"，
    // 且是既有干扰项生成器（从本课词表取干扰项）的固有行为，非本轮引入。
    const planeAsAnswer = q37.filter((q) => q.answer === '飞机' || q.answer === 'Avion' || q.answer === 'fei ji');
    ok(planeAsAnswer.length === 0,
      'L37 自动 quiz 不把「飞机」作为答案（扩展词不强制主动产出，异常 ' + planeAsAnswer.length + ' 题）');
  }
}

// ---------------------------------------------------------------- 改动范围
section('改动范围（其余 177 课不得被动过）');
ok(flat.filter((l) => l.dialog && l.dialog.zh && l.dialog.zh.indexOf('有过') >= 0).length === 0, '无任何课仍含「有过」');
ok(flat.filter((l) => (l.words || []).some((w) => w.zh === '公共汽车')).length === 0, '无任何课词表含「公共汽车」');
ok(flat.filter((l) => (l.words || []).some((w) => w.zh === '学习')).length === 0, '全语料词表已无「学习」词条');
ok([1, 36, 37].every((id) => byId[id]), 'L1 / L36 / L37 均存在');
// 「无新的未教词汇引用」的可证明形式：相对 HEAD（V1.3 基线），正文
// （dialog / grammar / culture / practice.prompt 的 zh）只在 L1/L36/L37 发生变化。
// 其余 177 课正文逐字未变，且词表只增不减（教学范围单调不减）
// → 恢复「飞机」这一"纯词表新增、正文零改动"的操作不可能引入新的未教引用。
{
  let headFlat = null;
  try {
    // 注意：`HEAD:data/lessons.json` 里的路径是「相对仓库根」而非相对 cwd。
    // 仓库根另有一个同名但内容不同的 data/lessons.json（属父项目，L112 正文不一致），
    // 直接写 'HEAD:data/lessons.json' 会静默读到那个文件。必须显式给仓库根相对全路径。
    const repoRoot = execSync('git rev-parse --show-toplevel', { cwd: BASE, encoding: 'utf8' }).trim();
    const relProj = path.relative(repoRoot, BASE).split(path.sep).join('/');
    ok(relProj === 'chinese-learning', '项目目录相对仓库根 = chinese-learning（实际 ' + relProj + '）');
    const headRaw = execSync('git show HEAD:' + relProj + '/data/lessons.json',
      { cwd: repoRoot, encoding: 'utf8', maxBuffer: 1 << 28 });
    headFlat = JSON.parse(headRaw).flatMap((p) => (p.lessons || []));
  } catch (e) { ok(false, '读取 HEAD 版 lessons.json 失败: ' + e.message); }
  if (headFlat) {
    const bodyOf = (l) => [l.dialog && l.dialog.zh, l.grammar && l.grammar.zh,
      l.culture && l.culture.zh, l.practice && l.practice.prompt.zh].filter(Boolean).join('\n');
    const changed = [];
    for (const h of headFlat) {
      const c = byId[h.id];
      if (!c) { changed.push('缺L' + h.id); continue; }
      if (bodyOf(h) !== bodyOf(c)) changed.push(h.id);
    }
    ok(changed.join(',') === '1,36,37', '正文（zh）相对 HEAD 仅 L1/L36/L37 变化（实际 ' + changed.join(',') + '）');
  }
}

console.log('\n=========================================');
console.log('  PASS = ' + passed + '   FAIL = ' + failed);
console.log('=========================================');
process.exit(failed ? 1 : 0);

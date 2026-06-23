// Generate complete lessons.json using programmatic approach
const fs = require('fs');

function T(zh, sr, en) { return { zh, sr, en }; }
function W(zh, py, sr) { return { zh, py, sr }; }
function C(prompt, options, correct) {
  return { type: 'choice', prompt: prompt, options: options, correct: correct };
}

function L(id, day, icon, topic, words, dialog, grammar, practice, culture, points) {
  return { id, day, icon, topic, words, dialog, grammar, practice, culture, points };
}

// Helper to add a lesson to an array
const p1 = [];

// Lesson 1
p1.push(L(1,1,'🌏',T('你好！汉语概览','Zdravo! Pregled kineskog','Hello! Chinese Overview'),
  [W('你好','nǐ hǎo','Zdravo'),W('谢谢','xiè xiè','Hvala'),W('对不起','duì bu qǐ','Izvinite'),W('没关系','méi guān xì','Nema veze'),W('汉语','hàn yǔ','Kineski'),W('学习','xué xí','Učiti')],
  T('A: 你好！\nB: 你好！\nA: 谢谢！\nB: 没关系。','A: Zdravo!\nB: Zdravo!\nA: Hvala!\nB: Nema na čemu.','A: Hello!\nB: Hello!\nA: Thank you!\nB: You are welcome.'),
  T('汉语是 SVO 语序。','Kineski ima SVO red reči.','Chinese follows SVO word order.'),
  C(T('"谢谢"是什么意思？','Šta znači "xiè xiè"?','What does "xiè xiè" mean?'),['Hello','Thank you','Sorry','Goodbye'],1),
  T('中国有56个民族。汉语是联合国六种官方语言之一。','Kina ima 56 etničkih grupa.','China has 56 ethnic groups.'),
  10));

console.log('Lesson 1 OK, testing JSON...');
const json = JSON.stringify(p1[0], null, 2);
console.log(json.substring(0, 200));
console.log('---');
console.log('JSON valid:', JSON.parse(json) !== null);
console.log('Lesson 1 id:', JSON.parse(json).id);

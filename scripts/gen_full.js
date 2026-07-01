// Generate complete 180-lesson JSON data
const fs = require('fs');

// Helper functions
function T(zh, sr, en) { return { zh, sr, en }; }
function W(zh, py, sr) { return { zh, py, sr }; }
function CP(prompt, options, correct) {
  return { type: 'choice', prompt: prompt, options: options, correct: correct };
}
function L(id, day, icon, topic, words, dialog, grammar, practice, culture, points) {
  return { id, day, icon, topic, words, dialog, grammar, practice, culture, points };
}

// Generate all phases
function buildPhase1() { return { phase:1, name:T('拼音基石','Osnove Pinjina','Pinyin Basics'), description:T('学习汉语拼音系统。','Naučite Pinjin.','Learn Chinese Pinyin.'), icon:'🏛️', lessons:[] }; }
function buildPhase2() { return { phase:2, name:T('日常生活','Svakodnevni život','Daily Life'), description:T('学习日常交流场景。','Naučite svakodnevne scene.','Learn daily scenes.'), icon:'🗣️', lessons:[] }; }
function buildPhase3() { return { phase:3, name:T('社交出行','Društveni život','Social Life'), description:T('学习社交和出行相关表达。','Naučite društvene izraze.','Learn social expressions.'), icon:'🌆', lessons:[] }; }
function buildPhase4() { return { phase:4, name:T('情感对话','Emocionalni dijalozi','Emotional Dialogues'), description:T('学习表达情感和深入交流。','Naučite izražavanje emocija.','Learn emotional expression.'), icon:'💬', lessons:[] }; }
function buildPhase5() { return { phase:5, name:T('读写进阶','Čitanje i pisanje','Reading & Writing'), description:T('提升读写能力。','Unapredite čitanje i pisanje.','Improve reading and writing.'), icon:'📝', lessons:[] }; }
function buildPhase6() { return { phase:6, name:T('流利表达','Tečno izražavanje','Fluent Expression'), description:T('达到流利交流水平。','Dostignite tečnost.','Achieve fluency.'), icon:'🎯', lessons:[] }; }

const phase1 = buildPhase1();
const p1 = phase1.lessons;

// ===== PHASE 1: Lessons 1-10 (detailed) =====
p1.push(L(1,1,'🌏',T('你好！汉语概览','Zdravo! Pregled','Hello! Chinese Overview'),
  [W('你好','nǐ hǎo','Zdravo'),W('谢谢','xiè xiè','Hvala'),W('对不起','duì bu qǐ','Izvinite'),W('没关系','méi guān xì','Nema veze'),W('汉语','hàn yǔ','Kineski'),W('学习','xué xí','Učiti')],
  T('A: 你好！\nB: 你好！\nA: 谢谢！\nB: 没关系。','A: Zdravo!\nB: Zdravo!\nA: Hvala!\nB: Nema na čemu.','A: Hello!\nB: Hello!\nA: Thank you!\nB: You are welcome.'),
  T('汉语是SVO语序。没有词形变化。','Kineski ima SVO red reči. Bez konjugacije.','Chinese is SVO. No conjugation.'),
  CP(T('"谢谢"是什么意思？','Šta znači "xiè xiè"?','What does "xiè xiè" mean?'),['Hello','Thank you','Sorry','Goodbye'],1),
  T('中国有56个民族。汉语是联合国六种官方语言之一。','Kina ima 56 etničkih grupa.','China has 56 ethnic groups.'),10));

p1.push(L(2,2,'🔤',T('声母（一）b p m f d t n l','Inicijali(1) b p m f d t n l','Initials(1) b p m f d t n l'),
  [W('爸爸','bà ba','Tata'),W('妈妈','mā ma','Mama'),W('朋友','péng yǒu','Prijatelj'),W('弟弟','dì di','Mlađi brat'),W('妹妹','mèi mei','Mlađa sestra'),W('你','nǐ','Ti'),W('他','tā','On'),W('她','tā','Ona')],
  T('A: 这是谁？\nB: 这是我爸爸。\nA: 你妈妈呢？\nB: 她在家。','A: Ko je ovo?\nB: Moj tata.\nA: Gde je mama?\nB: Kod kuće.','A: Who is this?\nB: My dad.\nA: Where is mom?\nB: At home.'),
  T('"是"表示判断。结构：A+是+B。否定用"不是"。疑问加"吗"。','"Shì" = biti. Negacija: bú shì. Pitanje: "ma".','"Shì" = to be. Negative: bú shì. Question: "ma".'),
  CP(T('"爸爸"的拼音？','Pinjin za "tata"?','Pinyin for "dad"?'),['mā ma','bà ba','péng yǒu','dì di'],1),
  T('中国家庭用亲属称谓称呼家人。','Porodice koriste rodbinske nazive.','Families use kinship terms.'),10));

p1.push(L(3,3,'🔤',T('声母（二）g k h j q x zh ch sh r','Inicijali(2) g k h j q x zh ch sh r','Initials(2) g k h j q x zh ch sh r'),
  [W('中国','zhōng guó','Kina'),W('吃','chī','Jesti'),W('喝','hē','Piti'),W('看','kàn','Gledati'),W('好','hǎo','Dobar'),W('说','shuō','Govoriti'),W('人','rén','Osoba'),W('去','qù','Ići')],
  T('A: 你吃什么？\nB: 我吃米饭。\nA: 你喝什么？\nB: 我喝水。','A: Šta jedeš?\nB: Pirinač.\nA: Šta piješ?\nB: Vodu.','A: What do you eat?\nB: Rice.\nA: What do you drink?\nB: Water.'),
  T('疑问代词"什么"询问事物：主语+动词+什么？','Upitna zamenica "shénme"(šta).','Question word "shénme"(what).'),
  CP(T('"中国"的拼音？','Pinjin za "Kina"?','Pinyin for "China"?'),['zhōng guó','zhǒng guǒ','zhòng guō','zhōng gǔo'],0),
  T('八大菜系：川、粤、鲁、淮扬、湘、闽、浙、徽。','8 kulinarskih škola.','8 cuisine schools.'),10));

p1.push(L(4,4,'🎵',T('韵母（一）a o e i u ü','Finale(1) a o e i u ü','Finals(1) a o e i u ü'),
  [W('爱','ài','Voleti'),W('来','lái','Doći'),W('买','mǎi','Kupiti'),W('大','dà','Velik'),W('我','wǒ','Ja'),W('雨','yǔ','Kiša'),W('鱼','yú','Riba')],
  T('A: 你去哪儿？\nB: 我去买鱼。\nA: 下雨了！\nB: 没关系，我带伞了。','A: Gde ideš?\nB: Da kupim ribu.\nA: Pada kiša!\nB: Imam kišobran.','A: Where are you going?\nB: To buy fish.\nA: It is raining!\nB: I have umbrella.'),
  T('"去"+地点。 "哪儿"问地点。','"Qù"+mesto. "Nǎr"=gde.','"Qù"+place. "Nǎr"=where.'),
  CP(T('我___你(wǒ ài nǐ)填什么？','Popuni prazninu','Fill blank'),['ài','āi','ǎi','aì'],0),
  T('520(5/20)谐音"我爱你"是中国网络情人节。','520 = "Volim te" na kineskom.','520 sounds like "I love you".'),10));

p1.push(L(5,5,'🎵',T('韵母（二）鼻韵母 an en in ang eng ong','Nazalne finale','Nasal Finals'),
  [W('很','hěn','Veoma'),W('电话','diàn huà','Telefon'),W('见','jiàn','Videti'),W('先','xiān','Prvo'),W('问','wèn','Pitati'),W('忙','máng','Zauzet'),W('请','qǐng','Molim'),W('听','tīng','Slušati')],
  T('A: 喂，你好！\nB: 你好！你忙吗？\nA: 我很忙。\nB: 那先再见！','A: Halo!\nB: Zdravo! Zauzet?\nA: Veoma.\nB: Doviđenja!','A: Hello!\nB: Hello! Busy?\nA: Very.\nB: Goodbye!'),
  T('"很"+形容词表程度高。如"很忙""很好"。','"Hěn"+pridev=veoma.','"Hěn"+adj=very.'),
  CP(T('"电话"的拼音？','Pinjin za "telefon"?','Pinyin for "telephone"?'),['diàn huà','diǎn huā','diān huá','diàn hùa'],0),
  T('中国接电话说"喂"。正式场合说"您好"。','Javljanje: "wéi".','Answer: "wéi".'),10));

p1.push(L(6,6,'🎶',T('四声和轻声','Četiri tona','Four Tones'),
  [W('妈','mā','Mama(1)'),W('麻','má','Konoplja(2)'),W('马','mǎ','Konj(3)'),W('骂','mà','Psovati(4)'),W('吗','ma','?(laki)'),W('了','le','rečca(laki)')],
  T('A: 你好吗？\nB: 我很好，你呢？\nA: 我也很好。','A: Kako si?\nB: Dobro, a ti?\nA: I ja.','A: How are you?\nB: Fine, you?\nA: Me too.'),
  T('四声：高平、上升、先降后升、下降。轻声又轻又短。','4 tona: 1.visok ravni, 2.uzlazni, 3.silazno-uzlazni, 4.silazni.','4 tones: level, rising, falling-rising, falling.'),
  CP(T('"马"(mǎ)是第几声？','Koji ton?','Which tone?'),['1声','2声','3声','4声'],2),
  T('声调是汉语的灵魂。mā/má/mǎ/mà意思完全不同。','Tonovi su ključni.','Tones are crucial.'),10));

p1.push(L(7,7,'✍️',T('基本笔画（一）','Osnovne crtice(1)','Basic Strokes(1)'),
  [W('我','wǒ','Ja'),W('你','nǐ','Ti'),W('他','tā','On'),W('她','tā','Ona'),W('的','de','Posesiv'),W('是','shì','Biti')],
  T('A: 他是谁？\nB: 他是我的朋友。\nA: 她是谁？\nB: 她是我的妹妹。','A: Ko je on?\nB: Moj prijatelj.\nA: Ko je ona?\nB: Moja sestra.','A: Who is he?\nB: My friend.\nA: Who is she?\nB: My sister.'),
  T('"的"是定语标记：修饰语+的+名词。"我的朋友"。','"De"=atributivna rečca.','"De"=attributive particle.'),
  CP(T('"的"在"我的书"中表示？','Šta "de" znači?','What does "de" mean?'),['Ja','Posesiv','Knjiga','Ovo'],1),
  T('六种基本笔画：横竖撇捺点提。','6 osnovnih crtica.','6 basic strokes.'),10));

p1.push(L(8,8,'✍️',T('基本笔画（二）复合笔画','Složene crtice','Compound Strokes'),
  [W('人','rén','Čovek'),W('大','dà','Velik'),W('中','zhōng','Sredina'),W('小','xiǎo','Mali'),W('上','shàng','Gore'),W('下','xià','Dole'),W('不','bù','Ne')],
  T('A: 你家大不大？\nB: 不大。\nA: 很大吗？\nB: 很小。','A: Da li je kuća velika?\nB: Nije.\nA: Veoma?\nB: Mala.','A: Is home big?\nB: No.\nA: Very?\nB: Small.'),
  T('A不A正反疑问句：肯定+不+肯定。如"大不大？"','A-bù-A: afirmativ+bù+afirmativ.','A-bù-A: affirmative+bù+affirmative.'),
  CP(T('"大不大？"是什么句型？','Šta je "dà bù dà"?','What is "dà bù dà"?'),['Veoma veliko','Veliko ili ne?','Nije veliko','Preveliko'],1),
  T('笔顺规则：先横后竖，先撇后捺，从上到下。','Pravila redosleda crtica.','Stroke order rules.'),10));

p1.push(L(9,9,'🔢',T('数字1-10','Brojevi 1-10','Numbers 1-10'),
  [W('一','yī','Jedan'),W('二','èr','Dva'),W('三','sān','Tri'),W('四','sì','Četiri'),W('五','wǔ','Pet'),W('六','liù','Šest'),W('七','qī','Sedam'),W('八','bā','Osam'),W('九','jiǔ','Devet'),W('十','shí','Deset')],
  T('A: 你有几个苹果？\nB: 三个。\nA: 我有五个。','A: Koliko jabuka?\nB: Tri.\nA: Imam pet.','A: How many apples?\nB: Three.\nA: I have five.'),
  T('数字+量词+名词。基本量词"个"。','Broj+merna reč+imenica.','Number+measure word+noun.'),
  CP(T('"十"是数字几？','Koji broj?','What number?'),['6','8','10','4'],2),
  T('数字文化：8吉利，9吉利，4不吉利。','8 srećan, 4 nesrećan.','8 lucky, 4 unlucky.'),10));

p1.push(L(10,10,'👋',T('问候和告别','Pozdravi','Greetings'),
  [W('早上好','zǎo shang hǎo','Dobro jutro'),W('晚上好','wǎn shang hǎo','Dobro veče'),W('再见','zài jiàn','Doviđenja'),W('明天见','míng tiān jiàn','Vidimo se sutra'),W('晚安','wǎn ān','Laku noć'),W('您好','nín hǎo','Zdravo(formalno)')],
  T('A: 早上好！\nB: 早上好！\nA: 明天见！\nB: 好，明天见！','A: Dobro jutro!\nB: Dobro jutro!\nA: Vidimo se sutra!\nB: Važi!','A: Good morning!\nB: Good morning!\nA: See you tomorrow!\nB: OK!'),
  T('"您"是"你"的尊称。对长辈或上级使用。','"Nín" je formalni oblik.','"Nín" is formal "you".'),
  CP(T('"晚安"什么时候说？','Kada se kaže "wǎn ān"?','When to say "wǎn ān"?'),['Jutro','Podne','Pre spavanja','Posle podne'],2),
  T('中国人常问"吃了吗？"作为问候。','"Jesi li jeo?" kao pozdrav.','"Have you eaten?" as greeting.'),10));

// Lessons 11-20
p1.push(L(11,11,'👤',T('自我介绍','Samopredstavljanje','Self-Introduction'),
  [W('叫','jiào','Zvati se'),W('姓','xìng','Prezime'),W('名字','míng zì','Ime'),W('认识','rèn shí','Upoznati'),W('高兴','gāo xìng','Drago mi je'),W('也','yě','Takođe')],
  T('A: 你好！我叫安娜。\nB: 我叫马克。很高兴认识你！\nA: 我也很高兴认识你！','A: Zdravo! Ja sam Ana.\nB: Ja sam Mark. Drago mi je!\nA: I meni!','A: Hello! I am Anna.\nB: I am Mark. Nice to meet you!\nA: Nice to meet you too!'),
  T('"叫"用于介绍名字：主语+叫+名字。"姓"用于姓氏。','"Jiào" za ime. "Xìng" za prezime.','"Jiào" for name. "Xìng" for surname.'),
  CP(T('"很高兴认识你"中"认识"是什么意思？','Šta znači "rèn shí"?','What does "rèn shí" mean?'),['Pamtiti','Upoznati','Razumeti','Govoriti'],1),
  T('中国人介绍先说姓氏。握手轻轻。递名片用双手。','Kinezi prvo kažu prezime. Rukovanje blago.','Surname first. Light handshake.'),10));

p1.push(L(12,12,'🌍',T('国籍和语言','Nacionalnost','Nationalities'),
  [W('中国','zhōng guó','Kina'),W('塞尔维亚','sài ěr wéi yà','Srbija'),W('美国','měi guó','Amerika'),W('说','shuō','Govoriti'),W('会','huì','Znati'),W('英语','yīng yǔ','Engleski'),W('塞尔维亚语','sài ěr wéi yà yǔ','Srpski')],
  T('A: 你是哪国人？\nB: 我是塞尔维亚人。\nA: 你会说汉语吗？\nB: 我会说一点儿。','A: Odakle si?\nB: Iz Srbije.\nA: Govoriš kineski?\nB: Malo.','A: Where are you from?\nB: Serbia.\nA: Can you speak Chinese?\nB: A little.'),
  T('"会"表示学到的技能。"说"+语言。"一点儿"表示少量。','"Huì"=umeće. "Shuō"+jezik. "Yìdiǎnr"=malo.','"Huì"=can(skill). "Shuō"+language.'),
  CP(T('"我会说汉语"中"会"表示？','Šta "huì" znači?','What does "huì" mean?'),['Hteti','Umeti','Morati','Moći'],1),
  T('中塞全面战略伙伴关系。互免签证。','Srbija i Kina strateški partneri.','Serbia-China strategic partners.'),10));

p1.push(L(13,13,'👨‍👩‍👧',T('年龄和家庭（一）','Godine(1)','Age & Family(1)'),
  [W('岁','suì','Godina'),W('爸爸','bà ba','Tata'),W('妈妈','mā ma','Mama'),W('爷爷','yé ye','Deda'),W('奶奶','nǎi nai','Baba'),W('几','jǐ','Koliko')],
  T('A: 你几岁？\nB: 我二十五岁。\nA: 你爸爸多大？\nB: 他五十岁。','A: Koliko imaš godina?\nB: 25.\nA: Koliko tata?\nB: 50.','A: How old are you?\nB: 25.\nA: How old is dad?\nB: 50.'),
  T('"几岁"问年龄。"岁"在数字后表示年龄。','"Jǐ suì"=koliko godina?','"Jǐ suì"=how old?'),
  CP(T('"你几岁？"问什么？','Šta pita "nǐ jǐ suì"?','What does "nǐ jǐ suì" ask?'),['Ime','Godine','Adresu','Posao'],1),
  T('中国尊敬老人。爷爷奶奶常帮忙带孙子。"孝"是重要美德。','Kinezi poštuju stare. Bake čuvaju unuke.','Chinese respect elders.'),10));

p1.push(L(14,14,'👨‍👩‍👧‍👦',T('家庭（二）','Porodica(2)','Family(2)'),
  [W('哥哥','gē ge','Stariji brat'),W('姐姐','jiě jie','Starija sestra'),W('弟弟','dì di','Mlađi brat'),W('妹妹','mèi mei','Mlađa sestra'),W('孩子','hái zi','Dete'),W('爱','ài','Voleti')],
  T('A: 你有兄弟姐妹吗？\nB: 我有一个哥哥和一个妹妹。','A: Imaš braće i sestara?\nB: Starijeg brata i mlađu sestru.','A: Do you have siblings?\nB: An older brother and younger sister.'),
  T('汉语区分兄/弟、姐/妹。"有"表示拥有。否定用"没有"。','Razlikuje starijeg/lađeg brata/sestru. "Yǒu"=imati.','Differentiates older/younger siblings.'),
  CP(T('"哥哥"是？','"Gē ge" je?','What is "gē ge"?'),['Mlađi brat','Stariji brat','Starija sestra','Mlađa sestra'],1),
  T('独生子女政策(1979-2015)。现开放三胎。','Politika jednog deteta(1979-2015).','One-child policy(1979-2015).'),10));

p1.push(L(15,15,'💼',T('职业','Zanimanja','Professions'),
  [W('医生','yī shēng','Doktor'),W('老师','lǎo shī','Učitelj'),W('学生','xué shēng','Učenik'),W('工程师','gōng chéng shī','Inženjer'),W('护士','hù shì','Sestra'),W('工作','gōng zuò','Posao')],
  T('A: 你是做什么的？\nB: 我是医生。\nA: 你爸爸呢？\nB: 他是工程师。','A: Čime se baviš?\nB: Doktor.\nA: A tata?\nB: Inženjer.','A: What do you do?\nB: I\'m a doctor.\nA: Your dad?\nB: Engineer.'),
  T('"是"+职业介绍。"做什么的"询问职业。','"Shì"+zanimanje. "Zuò shénme de"=Čime se baviš?','"Shì"+profession.'),
  CP(T('"工程师"是什么？','Šta je "gōng chéng shī"?','What is "gōng chéng shī"?'),['Doktor','Učitelj','Inženjer','Student'],2),
  T('最受尊敬职业：医生、教师、工程师。尊师重道。','Najpoštovanija zanimanja: doktor, učitelj, inženjer.','Most respected: doctor, teacher, engineer.'),10));

p1.push(L(16,16,'🏃',T('基本动词','Osnovni glagoli','Basic Verbs'),
  [W('吃','chī','Jesti'),W('喝','hē','Piti'),W('走','zǒu','Hodati'),W('跑','pǎo','Trčati'),W('看','kàn','Gledati'),W('听','tīng','Slušati'),W('读','dú','Čitati'),W('写','xiě','Pisati')],
  T('A: 你早上做什么？\nB: 我吃早饭，然后看手机。\nA: 你听音乐吗？\nB: 听。','A: Šta radiš ujutro?\nB: Doručkujem, gledam telefon.\nA: Slušaš muziku?\nB: Da.','A: What do you do in morning?\nB: Breakfast, look at phone.\nA: Listen to music?\nB: Yes.'),
  T('动词连用。"然后"表示先后。','Glagoli u nizu. "Ránhòu"=zatim.','Verbs in sequence. "Ránhòu"=then.'),
  CP(T('"读"是什么意思？','Šta znači "dú"?','What does "dú" mean?'),['Pisati','Čitati','Slušati','Govoriti'],1),
  T('中国学生从小学英语。"读书"也指上学。','Učenici uče engleski od osnovne.','Students learn English early.'),10));

p1.push(L(17,17,'📐',T('基本形容词','Osnovni pridevi','Basic Adjectives'),
  [W('大','dà','Velik'),W('小','xiǎo','Mali'),W('高','gāo','Visok'),W('矮','ǎi','Nizak'),W('漂亮','piào liang','Lepa'),W('可爱','kě ài','Slatka'),W('好吃','hǎo chī','Ukusno')],
  T('A: 这家餐厅好吃吗？\nB: 很好吃！\nA: 贵不贵？\nB: 不贵，很便宜。','A: Ukusno?\nB: Veoma!\nA: Skupo?\nB: Nije, jeftino.','A: Is it tasty?\nB: Very!\nA: Expensive?\nB: No, cheap.'),
  T('否定：不+形容词。"很+形容词"表示程度。','Negacija: bù+pridev. "Hěn"=veoma.','Negation: bù+adj.'),
  CP(T('"好吃"的反义词？','Antonim za "hǎo chī"?','Antonym of "hǎo chī"?'),['好喝','难吃','好看','好吃'],1),
  T('八大菜系各有特色。四川辣广东鲜山东咸。','8 kulinarskih škola.','8 cuisine schools.'),10));

p1.push(L(18,18,'🎨',T('颜色','Boje','Colors'),
  [W('红','hóng','Crvena'),W('黄','huáng','Žuta'),W('蓝','lán','Plava'),W('绿','lǜ','Zelena'),W('白','bái','Bela'),W('黑','hēi','Crna')],
  T('A: 你喜欢什么颜色？\nB: 我喜欢红色和白色。\nA: 为什么？\nB: 红色很漂亮。','A: Koja boja ti se sviđa?\nB: Crvena i bela.\nA: Zašto?\nB: Crvena je lepa.','A: What color do you like?\nB: Red and white.\nA: Why?\nB: Red is beautiful.'),
  T('"喜欢"+颜色/动词。如"我喜欢红色""我喜欢吃"。','"Xǐhuān"+boja/glagol.','"Xǐhuān"+color/verb.'),
  CP(T('中国国旗什么颜色？','Boje kineske zastave?','Chinese flag colors?'),['Crvena/bela','Crvena/žuta','Plava/bela','Zelena/crvena'],1),
  T('红色象征好运。春节结婚用红色。黄色曾是皇家颜色。','Crvena=sreća. Žuta carska boja.','Red=luck. Yellow=imperial.'),10));

p1.push(L(19,19,'❓',T('疑问词','Upitne reči','Question Words'),
  [W('什么','shén me','Šta'),W('谁','shuí','Ko'),W('哪儿','nǎr','Gde'),W('怎么','zěn me','Kako'),W('为什么','wèi shén me','Zašto'),W('几','jǐ','Koliko')],
  T('A: 这是谁的书？\nB: 是我的。\nA: 你的书在哪儿？\nB: 在桌子上。','A: Čija je knjiga?\nB: Moja.\nA: Gde ti je knjiga?\nB: Na stolu.','A: Whose book?\nB: Mine.\nA: Where is your book?\nB: On table.'),
  T('疑问词在句中原位。如"谁"在"是"前。','Upitne reči ostaju na mestu.','Question words stay in place.'),
  CP(T('"为什么"问什么？','"Wèi shénme" pita?','What does "wèi shénme" ask?'),['Gde','Zašto','Kako','Šta'],1),
  T('"吃了吗？"是问候。"你去哪儿？"也常是问候。','"Jesi li jeo?"=pozdrav.','"Have you eaten?"=greeting.'),10));

p1.push(L(20,20,'📚',T('综合复习1','Pregled 1','Review 1'),
  [W('复习','fù xí','Ponavljanje'),W('练习','liàn xí','Vežba'),W('记住','jì zhù','Zapamtiti'),W('忘记','wàng jì','Zaboraviti'),W('懂','dǒng','Razumeti'),W('问题','wèn tí','Pitanje')],
  T('A: 这个字你懂吗？\nB: 我懂了。\nA: 我们一起来复习吧！\nB: 好的！','A: Razumeš?\nB: Razumem.\nA: Hajde da ponovimo!\nB: U redu!','A: Understand?\nB: Yes.\nA: Let\'s review!\nB: OK!'),
  T('复习：SVO语序、"是"字句、A不A疑问句。"温故而知新"。','Pregled: SVO, shì, A-bù-A.','Review: SVO, shì, A-bù-A.'),
  CP(T('SVO中的S是什么？','Šta je S u SVO?','What is S in SVO?'),['Glagol','Subjekat','Objekat','Pridev'],1),
  T('谚语："温故而知新"温习旧知识能获新理解。','"Učenje kroz ponavljanje" - Konfučije.','"Review old to learn new" - Confucius.'),15));

// Lessons 21-30
p1.push(L(21,21,'📅',T('时间-日期','Datum','Date'),
  [W('今天','jīn tiān','Danas'),W('明天','míng tiān','Sutra'),W('昨天','zuó tiān','Juče'),W('星期','xīng qī','Nedelja'),W('月','yuè','Mesec'),W('年','nián','Godina'),W('号','hào','Datum')],
  T('A: 今天几月几号？\nB: 六月二十三号。\nA: 昨天星期几？\nB: 星期一。','A: Koji je danas datum?\nB: 23. jun.\nA: Šta je bilo juče?\nB: Ponedeljak.','A: What is the date today?\nB: June 23rd.\nA: What was yesterday?\nB: Monday.'),
  T('日期：年+月+号。星期：星期+数字(1-6)，周日=星期日/天。','Datum: god+mesec+dan. Nedelja: xīngqī+broj.','Date: year+month+day. Weekday: xīngqī+number.'),
  CP(T('"星期天"是星期几？','Koji dan?','What day?'),['Ponedeljak','Subota','Nedelja','Petak'],2),
  T('中国用农历和阳历。传统节日按农历。','Kina koristi lunarni i solarni kalendar.','China uses lunar and solar calendars.'),10));

p1.push(L(22,22,'🕐',T('时间-时刻','Sat','Clock Time'),
  [W('早上','zǎo shang','Jutro'),W('中午','zhōng wǔ','Podne'),W('下午','xià wǔ','Posle podne'),W('晚上','wǎn shang','Veče'),W('点','diǎn','Sat'),W('分','fēn','Minut'),W('半','bàn','Pola')],
  T('A: 现在几点？\nB: 早上八点半。\nA: 你几点上班？\nB: 九点。','A: Koliko je sati?\nB: 8:30.\nA: Kad ideš na posao?\nB: U 9.','A: What time?\nB: 8:30.\nA: When do you go to work?\nB: At 9.'),
  T('时间：点+分。半=30分，刻=15分。','Vreme: sat+minut. Bàn=30, kè=15.','Time: hour+minute. Bàn=30.'),
  CP(T('"半"表示多少分钟？','Koliko minuta "bàn"?','How many minutes "bàn"?'),['15','30','45','10'],1),
  T('朝九晚五。午休1-2小时。"午睡"很常见。','Radno vreme 9-17, pauza 1-2h.','Work 9-5, lunch break 1-2h.'),10));

p1.push(L(23,23,'🌅',T('日常作息','Dnevna rutina','Daily Routine'),
  [W('起床','qǐ chuáng','Ustati'),W('吃饭','chī fàn','Jesti'),W('上班','shàng bān','Ići na posao'),W('回家','huí jiā','Vratiti se kući'),W('睡觉','shuì jiào','Spavati'),W('洗澡','xǐ zǎo','Tuširati se')],
  T('A: 你每天几点起床？\nB: 七点。\nA: 几点睡觉？\nB: 十一点。','A: U koliko ustaješ?\nB: U 7.\nA: Kad spavaš?\nB: U 23.','A: What time do you get up?\nB: At 7.\nA: What time do you sleep?\nB: At 11.'),
  T('时间在动词前：时间+动词。"每天"=every day。','Vreme ispred glagola.','Time before verb.'),
  CP(T('"起床"是什么意思？','Šta znači "qǐ chuáng"?','What does "qǐ chuáng" mean?'),['Spavati','Ustati','Jesti','Tuširati'],1),
  T('谚语"一日之计在于晨"。早睡早起身体好。','"Jutro je najvažnije."','"Morning is the most important."'),10));

p1.push(L(24,24,'🌤️',T('天气和季节','Vreme i godišnja doba','Weather & Seasons'),
  [W('冷','lěng','Hladno'),W('热','rè','Vruće'),W('下雨','xià yǔ','Pada kiša'),W('下雪','xià xuě','Pada sneg'),W('春天','chūn tiān','Proleće'),W('夏天','xià tiān','Leto'),W('秋天','qiū tiān','Jesen'),W('冬天','dōng tiān','Zima')],
  T('A: 今天天气怎么样？\nB: 很冷，在下雪。\nA: 塞尔维亚冬天冷吗？\nB: 很冷。','A: Kakvo je vreme?\nB: Hladno, sneg.\nA: Da li je zima hladna u Srbiji?\nB: Veoma.','A: How is the weather?\nB: Cold, snowing.\nA: Is winter cold in Serbia?\nB: Very.'),
  T('"怎么样"问状况。"在+动词"表示正在做。','"Zěnme yàng"=kako je. "Zài+V"=u toku.','"Zěnme yàng"=how is. "Zài+V"=in progress.'),
  CP(T('"热"的意思？','Šta znači "rè"?','What does "rè" mean?'),['Hladno','Vruće','Kiša','Sneg'],1),
  T('中国气候多样。北京和贝尔格莱德纬度相近。','Kina raznolika klima. Peking i Beograd slične geografske širine.','China diverse climate. Beijing-Belgrade similar latitude.'),10));

p1.push(L(25,25,'🍜',T('食物和饮料','Hrana i piće','Food & Drinks'),
  [W('米饭','mǐ fàn','Pirinač'),W('面条','miàn tiáo','Rezanci'),W('水','shuǐ','Voda'),W('茶','chá','Čaj'),W('咖啡','kā fēi','Kafa'),W('牛奶','niú nǎi','Mleko'),W('鸡蛋','jī dàn','Jaje'),W('面包','miàn bāo','Hleb')],
  T('A: 你想吃什么？\nB: 我想吃面条。\nA: 喝什么？\nB: 喝茶。','A: Šta želiš jesti?\nB: Rezance.\nA: Za piće?\nB: Čaj.','A: What do you want to eat?\nB: Noodles.\nA: To drink?\nB: Tea.'),
  T('"想"+动词表示意愿。否定"不想"。','"Xiǎng"+glagol=želeti. Negacija: "bù xiǎng".','"Xiǎng"+verb=would like.'),
  CP(T('"茶"是什么饮品？','Šta je "chá"?','What is "chá"?'),['Kafa','Mleko','Čaj','Sok'],2),
  T('中国六大茶类：绿红乌白黄黑。功夫茶是传统。','6 vrsta čaja. Kung fu čaj je tradicija.','6 tea types. Kung fu tea traditional.'),10));

p1.push(L(26,26,'📍',T('方位词','Položaj','Location'),
  [W('上面','shàng miàn','Iznad'),W('下面','xià miàn','Ispod'),W('里面','lǐ miàn','Unutra'),W('外面','wài miàn','Napolju'),W('旁边','páng biān','Pored'),W('对面','duì miàn','Preko puta'),W('左边','zuǒ biān','Levo'),W('右边','yòu biān','Desno')],
  T('A: 我的手机在哪儿？\nB: 在桌子上面。\nA: 没有啊！\nB: 哦，在书的下面。','A: Gde mi je telefon?\nB: Na stolu.\nA: Nema!\nB: Ispod knjige.','A: Where is my phone?\nB: On the table.\nA: Not there!\nB: Under the book.'),
  T('方位词：名词+上面/下面等。"在"+位置。','Položaj: imenica+shàngmiàn. "Zài"+mesto.','Location: noun+shàngmiàn. "Zài"+place.'),
  CP(T('"外面"的意思？','Šta je "wài miàn"?','What is "wài miàn"?'),['Unutra','Napolju','Iznad','Pored'],1),
  T('中国人指路常用方向(东西)而非左右。中国城市方正布局。','Kinezi koriste strane sveta za uputstva.','Chinese use compass for directions.'),10));

p1.push(L(27,27,'📦',T('量词（一）','Merne reči(1)','Measure Words(1)'),
  [W('个','gè','(opšta)'),W('只','zhī','(životinje)'),W('条','tiáo','(dugačko)'),W('本','běn','(knjige)'),W('杯','bēi','(pića)'),W('张','zhāng','(ravno)'),W('件','jiàn','(odeća)')],
  T('A: 你要几个苹果？\nB: 三个。\nA: 还要什么？\nB: 一杯茶和两本书。','A: Koliko jabuka?\nB: Tri.\nA: Još?\nB: Šolju čaja, dve knjige.','A: How many apples?\nB: Three.\nA: Anything else?\nB: Tea and books.'),
  T('数词+量词+名词。不同名词用不同量词。"个"通用。','Broj+merna reč+imenica. "Gè" je opšta.','Number+MW+noun. "Gè" is general.'),
  CP(T('"一本书"的量词？','Merna reč za "knjiga"?','MW for "book"?'),['个','只','本','条'],2),
  T('汉语有上百个量词。正确使用是流利标志。','Stotine mernih reči u kineskom.','Hundreds of MW in Chinese.'),10));

p1.push(L(28,28,'🏠',T('日常用品','Dnevni predmeti','Daily Items'),
  [W('桌子','zhuō zi','Sto'),W('椅子','yǐ zi','Stolica'),W('门','mén','Vrata'),W('窗','chuāng','Prozor'),W('手机','shǒu jī','Mobilni'),W('钱包','qián bāo','Novčanik'),W('钥匙','yào shi','Ključ'),W('书包','shū bāo','Ranac')],
  T('A: 你的手机在哪儿？\nB: 在桌子上。\nA: 钥匙呢？\nB: 在书包里面。','A: Gde je telefon?\nB: Na stolu.\nA: Ključevi?\nB: U rancu.','A: Where is phone?\nB: On table.\nA: Keys?\nB: In backpack.'),
  T('"在"表位置。"有"表存在。','"Zài"=nalazi se. "Yǒu"=postoji.','"Zài"=located. "Yǒu"=there is.'),
  CP(T('"钱包"是什么？','Šta je "qián bāo"?','What is "qián bāo"?'),['Ključ','Novčanik','Telefon','Torba'],1),
  T('中国移动支付发达。微信支付、支付宝。出门不带钱包。','Mobilno plaćanje: WeChat Pay, Alipay.','Mobile payment: WeChat Pay, Alipay.'),10));

p1.push(L(29,29,'📖',T('综合练习-我的生活','Vežba-Moj život','Practice-My Life'),
  [W('生活','shēng huó','Život'),W('每天','měi tiān','Svaki dan'),W('常常','cháng cháng','Često'),W('有时候','yǒu shí hou','Ponekad'),W('总是','zǒng shì','Uvek'),W('从不','cóng bù','Nikad')],
  T('A: 你每天生活怎么样？\nB: 我七点起床，八点上班。\nA: 你常常喝茶吗？\nB: 总是一边工作一边喝。','A: Kako ti izgleda dan?\nB: Ustajem u 7, posao u 8.\nA: Piješ čaj?\nB: Uvek dok radim.','A: What is your day like?\nB: Wake up 7, work 8.\nA: Do you drink tea?\nB: Always while working.'),
  T('频率副词：总是(100%)常常(80%)有时候(30%)从不(0%)。在动词前。','Prilozi učestalosti. Ispred glagola.','Frequency adverbs. Before verb.'),
  CP(T('哪个频率更高？常常还是总是？','Šta je češće?','Which is more frequent?'),['常常','总是','Isto','Nijedno'],1),
  T('塞尔维亚生活节奏悠闲。中国大城市节奏快。','Srbija opušten tempo, Kina brz.','Serbia relaxed, China fast-paced.'),15));

p1.push(L(30,30,'🎯',T('阶段1测试','Test faze 1','Phase 1 Test'),
  [W('考试','kǎo shì','Ispit'),W('通过','tōng guò','Proći'),W('成绩','chéng jì','Rezultat'),W('进步','jìn bù','Napredak'),W('继续','jì xù','Nastaviti'),W('加油','jiā yóu','Samo napred')],
  T('A: 考试怎么样？\nB: 很好！进步了。\nA: 恭喜！继续加油！\nB: 谢谢！我会的。','A: Kako ispit?\nB: Odlično! Napredak.\nA: Čestitam! Samo napred!\nB: Hvala!','A: How was test?\nB: Great! Improved.\nA: Congrats! Keep going!\nB: Thanks!'),
  T('"加油"(=add oil)是最常用的鼓励用语。"继续"+动词。','"Jiā yóu"=samo napred. Ohrabrenje.','"Jiā yóu"=keep going. Encouragement.'),
  CP(T('"加油"的意思？','Šta znači "jiā yóu"?','What does "jiā yóu" mean?'),['Sipati ulje','Samo napred','Dodati','Vozi'],1),
  T('恭喜完成第一阶段30课！继续努力！','Čestitam na završenoj prvoj fazi!','Congratulations on Phase 1!'),20));

// ===== PHASE 2: Daily Life (31-60) =====
const phase2 = { phase:2, name:T('日常生活','Svakodnevni život','Daily Life'),
  description:T('学习日常交流场景：餐厅购物问路交通看病等。','Naučite svakodnevne scene.','Learn daily communication scenes.'),
  icon:'🗣️', lessons:[] };
const p2 = phase2.lessons;

p2.push(L(31,31,'🍽️',T('在餐厅（一）','Restoran(1)','At Restaurant(1)'),
  [W('菜单','cài dān','Meni'),W('点菜','diǎn cài','Naručiti'),W('服务员','fú wù yuán','Konobar'),W('筷子','kuài zi','Štapići'),W('碗','wǎn','Činija'),W('盘子','pán zi','Tanji')],
  T('A: 服务员，请给我菜单。\nB: 好的，这是菜单。\nA: 我想点这个菜。\nB: 请稍等。','A: Konobar, meni.\nB: Izvolite.\nA: Želim ovo.\nB: Sačekajte.','A: Waiter, menu please.\nB: Here.\nA: I want this.\nB: Wait please.'),
  T('"请"表礼貌请求。"给+我+物品"=给我。','"Qǐng"=molim(učtivo). "Gěi wǒ"=daj mi.','"Qǐng"=please(polite). "Gěi wǒ"=give me.'),
  CP(T('"点菜"是什么意思？','Šta znači "diǎn cài"?','What does "diǎn cài" mean?'),['Platiti','Naručiti','Jesti','Kuhati'],1),
  T('不要把筷子插在饭里(像上香)。AA制越来越流行。','Štapiće ne stavljati u pirinač. AA popularno.','Don\'t stick chopsticks in rice. AA popular.'),10));

p2.push(L(32,32,'🍽️',T('在餐厅（二）','Restoran(2)','At Restaurant(2)'),
  [W('好吃','hǎo chī','Ukusno'),W('辣','là','Ljuto'),W('咸','xián','Sleno'),W('甜','tián','Slatko'),W('酸','suān','Kiselo'),W('买单','mǎi dān','Račun')],
  T('A: 这个菜怎么样？\nB: 很好吃但是很辣。\nA: 你能吃辣吗？\nB: 能吃一点儿。服务员，买单！','A: Kako je jelo?\nB: Ukusno ali ljuto.\nA: Možeš ljuto?\nB: Malo. Konobar, račun!','A: How is the dish?\nB: Tasty but spicy.\nA: Can handle spicy?\nB: A little. Check please!'),
  T('"但是"表转折：A+但是+B。"能"表能力。','"Dànshì"=ali. "Néng"=moći.','"Dànshì"=but. "Néng"=can.'),
  CP(T('"买单"是什么意思？','Šta znači "mǎi dān"?','What does "mǎi dān" mean?'),['Kupiti','Naručiti','Tražiti račun','Jesti'],2),
  T('"买单"也可说"结账"。请客是友谊表现。','"Mǎi dān" ili "jié zhàng".','"Mǎi dān" or "jié zhàng".'),10));

p2.push(L(33,33,'🛍️',T('购物（一）','Kupovina(1)','Shopping(1)'),
  [W('多少钱','duō shao qián','Koliko košta'),W('贵','guì','Skupo'),W('便宜','pián yi','Jeftino'),W('买','mǎi','Kupiti'),W('卖','mài','Prodati'),W('打折','dǎ zhé','Popust')],
  T('A: 这个多少钱？\nB: 一百块。\nA: 太贵了！能便宜一点吗？\nB: 打八折。','A: Koliko?\nB: 100 juana.\nA: Preskupo! Jeftinije?\nB: 20% popusta.','A: How much?\nB: 100 yuan.\nA: Too expensive! Cheaper?\nB: 20% off.'),
  T('"多少钱"问价格。"太...了"表过度。"能...吗？"表请求。','"Duōshao qián"=koliko košta. "Tài...le"=previše.','"Duōshao qián"=how much. "Tài...le"=too.'),
  CP(T('"打折"是什么意思？','Šta znači "dǎ zhé"?','What does "dǎ zhé" mean?'),['Poklon','Popust','Skupo','Jeftino'],1),
  T('可以讨价还价(市场和景点)。商场固定价格。"块"=元口语。','Cenkanje na pijacama. Fiksne cene u radnjama.','Bargain at markets. Fixed in shops.'),10));

p2.push(L(34,34,'🛍️',T('购物（二）','Kupovina(2)','Shopping(2)'),
  [W('试穿','shì chuān','Probati'),W('大号','dà hào','Veliko'),W('小号','xiǎo hào','Malo'),W('颜色','yán sè','Boja'),W('合适','hé shì','Odgovara'),W('退换','tuì huàn','Vratiti/zameniti')],
  T('A: 这件可以试穿吗？\nB: 可以，试衣间那边。\nA: 太大了，有小号吗？\nB: 有，给你。','A: Mogu probati?\nB: Da, kabina tamo.\nA: Preveliko, ima manje?\nB: Da, izvolite.','A: Can I try on?\nB: Yes, fitting room.\nA: Too big, smaller?\nB: Yes, here.'),
  T('"可以"表允许。"有...吗？"询问存在。','"Kěyǐ"=dozvola. "Yǒu...ma?"=ima li?','"Kěyǐ"=allowed. "Yǒu...ma?"=is there?'),
  CP(T('"试穿"的意思？','Šta znači "shì chuān"?','What does "shì chuān" mean?'),['Kupiti','Probati odeću','Pogledati','Platiti'],1),
  T('网购：淘宝、京东、拼多多。双十一是最大购物节。','Taobao, JD, Pinduoduo. 11.11 najveći shopping festival.','Taobao, JD, Pinduoduo. 11.11 biggest shopping day.'),10));

p2.push(L(35,35,'🗺️',T('问路（一）','Traženje puta(1)','Asking Directions(1)'),
  [W('请问','qǐng wèn','Izvinite(pitam)'),W('怎么走','zěn me zǒu','Kako se ide'),W('左转','zuǒ zhuǎn','Skrenuti levo'),W('右转','yòu zhuǎn','Desno'),W('一直走','yī zhí zǒu','Pravo'),W('路口','lù kǒu','Raskrsnica')],
  T('A: 请问，去火车站怎么走？\nB: 一直走，第二个路口左转。\nA: 远不远？\nB: 不远，走路十分钟。','A: Izvinite, do stanice?\nB: Pravo, na drugom ćošku levo.\nA: Daleko?\nB: Nije, 10 min hoda.','A: Excuse me, to train station?\nB: Straight, 2nd corner left.\nA: Far?\nB: No, 10 min walk.'),
  T('"请问"礼貌提问。"怎么走"问路。"在+第+数字+路口"转向。','"Qǐng wèn"=izvinite(učtivo). "Zěnme zǒu"=kako se ide.','"Qǐng wèn"=excuse me. "Zěnme zǒu"=how to go.'),
  CP(T('"请问"在问路表示？','Šta znači "qǐng wèn"?','What does "qǐng wèn" mean?'),['Hvala','Izvinite(pitam)','Zbogom','Dobro'],1),
  T('中国人乐于助人。最好用手机地图导航。','Kinezi rado pomažu. Najbolje koristiti mapu.','Chinese are helpful. Use phone map.'),10));

p2.push(L(36,36,'🗺️',T('问路（二）','Traženje puta(2)','Asking Directions(2)'),
  [W('附近','fù jìn','U blizini'),W('红绿灯','hóng lǜ dēng','Semafor'),W('过','guò','Preći'),W('第一个','dì yī gè','Prvi'),W('地铁站','dì tiě zhàn','Metro stanica'),W('公交车站','gōng jiāo chē zhàn','Autobuska stanica')],
  T('A: 附近有地铁站吗？\nB: 有，过两个红绿灯就到了。\nA: 左边还是右边？\nB: 右边。','A: Ima li metro blizu?\nB: Da, posle 2 semafora.\nA: Levo ili desno?\nB: Desno.','A: Is there metro nearby?\nB: Yes, after 2 lights.\nA: Left or right?\nB: Right.'),
  T('"有...吗？"询问。"过+数字+红绿灯"。"就到了"将到。','"Yǒu...ma?"=ima li? "Guò"=posle.','"Yǒu...ma?"=is there? "Guò"=after.'),
  CP(T('"红绿灯"是什么？','Šta je "hóng lǜ dēng"?','What is "hóng lǜ dēng"?'),['Znak','Semafor','Ulica','Most'],1),
  T('中国大城市地铁发达。北京地铁世界最长。','Kineski metro je razvijen.','Chinese metro is developed.'),10));

p2.push(L(37,37,'🚗',T('交通工具','Prevoz','Transportation'),
  [W('公共汽车','gōng gòng qì chē','Autobus'),W('地铁','dì tiě','Metro'),W('出租车','chū zū chē','Taksi'),W('自行车','zì xíng chē','Bicikl'),W('火车','huǒ chē','Voz'),W('飞机','fēi jī','Avion'),W('走路','zǒu lù','Peške')],
  T('A: 你怎么去上班？\nB: 坐地铁。\nA: 挤吗？\nB: 早上很挤。','A: Kako ideš na posao?\nB: Metroom.\nA: Puno?\nB: Ujutro veoma.','A: How do you go to work?\nB: By metro.\nA: Crowded?\nB: Very in morning.'),
  T('"坐/骑/开"+交通工具。","','"Zuò/qí/kāi"+prevoz.','"Zuò/qí/kāi"+transport.'),
  CP(T('"骑自行车"中"骑"表示？','Šta je "qí"?','What is "qí"?'),['Voziti(auto)','Jašiti/vozi(bicik)','Popraviti','Kupiti'],1),
  T('中国曾是"自行车王国"。高铁世界最大网络。','Kina "carstvo bicikala". Brzi vozovi najveći.','China "bicycle kingdom". HSR world largest.'),10));

console.log('Phases 1-2 lessons (1-37) done, continuing...');

// For this test, let's just serialize what we have so far
const data = [phase1, phase2];
const jsonStr = JSON.stringify(data, null, 2);
fs.writeFileSync('data/lessons.json.tmp', jsonStr, 'utf8');
console.log('Written temporary file');
console.log('Phases:', data.length);
console.log('Phase1 lessons:', data[0].lessons.length);
console.log('Phase2 lessons:', data[1].lessons.length);
console.log('Total lessons so far:', data[0].lessons.length + data[1].lessons.length);

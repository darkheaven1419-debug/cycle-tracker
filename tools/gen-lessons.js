// Generate full 180-lesson JSON data
var fs = require('fs');

var LESSON_ID = 0;
function L(zh, sr, en) { return {zh:zh, sr:sr, en:en}; }
function W(zh, py, sr) { return {zh:zh, py:py, sr:sr}; }
function mkLesson(day, topic, icon, words, dialog, grammar, culture, points) {
  LESSON_ID++; points = points || 10;
  return {id:LESSON_ID, day:day, topic:topic, icon:icon, words:words,
    dialog:dialog||L('A: 你好！\nB: 你好！','A: Zdravo!\nB: Zdravo!','A: Hello!\nB: Hello!'),
    grammar:grammar||L('每天进步一点点。','Malo po malo.','Little by little.'),
    practice:{type:'choice',prompt:L('选对的！','Izaberi tačno!','Pick correct!'),options:['对✓','错✗','可能','不确定'],correct:0},
    culture:culture||L('坚持就是胜利！','Istranost je pobeda!','Persistence wins!'),
    points:points};
}

// Phase 1: Pinyin Basics (1-30)
var p1 = [];
p1.push(mkLesson(1,L('你好！汉语概览','Zdravo! Pregled','Hello! Overview'),'🌏',[W('你好','nǐ hǎo','Zdravo'),W('谢谢','xiè xiè','Hvala'),W('对不起','duì bu qǐ','Izvinite'),W('没关系','méi guān xì','Nema veze'),W('汉语','hàn yǔ','Kineski'),W('拼音','pīn yīn','Pinjin')],L('A: 你好！\nB: 你好！\nA: 谢谢！\nB: 没关系。','A: Zdravo!\nB: Zdravo!\nA: Hvala!\nB: Nema na čemu.','A: Hello!\nB: Hello!\nA: Thanks!\nB: You are welcome.'),L('汉语SVO语序：主语+谓语+宾语。','Kineski SVO red reči.','Chinese SVO word order.'),L('全球14亿+人使用汉语。','Kineski govori 1.4 milijarde ljudi.','1.4B+ people speak Chinese.')));

var p1data = [
  [L('声母(一) bpmf dtnl','Inicijali (1)','Initials (1)'),'👄',[W('爸爸','bà ba','Tata'),W('妈妈','mā ma','Mama'),W('朋友','péng you','Prijatelj'),W('猫','māo','Mačka'),W('不','bù','Ne'),W('大','dà','Velik'),W('他','tā','On'),W('你','nǐ','Ti')]],
  [L('声母(二) gkh jqx zhchshr','Inicijali (2)','Initials (2)'),'🗣️',[W('高兴','gāo xìng','Srećan'),W('中国','Zhōng guó','Kina'),W('吃','chī','Jesti'),W('喝','hē','Piti'),W('家','jiā','Dom'),W('去','qù','Ići'),W('是','shì','Biti'),W('说','shuō','Govoriti')]],
  [L('韵母(一) aoe iuü','Finale (1)','Finals (1)'),'🎵',[W('爱','ài','Voleti'),W('来','lái','Doći'),W('开','kāi','Otvoriti'),W('太','tài','Previše'),W('买','mǎi','Kupiti'),W('快','kuài','Brzo'),W('菜','cài','Jelo'),W('在','zài','Biti u')]],
  [L('韵母(二) 鼻韵母','Finale (2)','Finals (2)'),'👃',[W('很','hěn','Veoma'),W('电话','diàn huà','Telefon'),W('看见','kàn jiàn','Videti'),W('天','tiān','Dan'),W('忙','máng','Zauzet'),W('请','qǐng','Molim'),W('问','wèn','Pitati')]],
  [L('四声和轻声','Četiri tona','Four Tones'),'📈',[W('妈','mā','Mama'),W('麻','má','Konoplja'),W('马','mǎ','Konj'),W('骂','mà','Grditi'),W('吗','ma','Upitno'),W('的','de','Posesivno'),W('了','le','Svršeno'),W('说','shuō','Govoriti')]],
  [L('基本笔画(一)','Osnovni potezi (1)','Basic Strokes (1)'),'✍️',[W('一','yī','Jedan'),W('丨','shù','Vertikalno'),W('丿','piě','Koso'),W('丶','diǎn','Tačka'),W('我','wǒ','Ja'),W('的','de','Posesivno'),W('是','shì','Biti')]],
  [L('基本笔画(二)','Osnovni potezi (2)','Basic Strokes (2)'),'✏️',[W('人','rén','Osoba'),W('大','dà','Velik'),W('小','xiǎo','Mali'),W('上','shàng','Gore'),W('下','xià','Dole'),W('中','zhōng','Sredina'),W('水','shuǐ','Voda'),W('火','huǒ','Vatra')]],
  [L('数字1-10','Brojevi 1-10','Numbers 1-10'),'🔢',[W('一','yī','1'),W('二','èr','2'),W('三','sān','3'),W('四','sì','4'),W('五','wǔ','5'),W('六','liù','6'),W('七','qī','7'),W('八','bā','8'),W('九','jiǔ','9'),W('十','shí','10')]],
  [L('问候和告别','Pozdravi','Greetings'),'👋',[W('你好','nǐ hǎo','Zdravo'),W('您好','nín hǎo','Zdravo(učt)'),W('早上好','zǎo shang hǎo','Dobro jutro'),W('晚上好','wǎn shang hǎo','Dobro veče'),W('晚安','wǎn ān','Laku noć'),W('再见','zài jiàn','Doviđenja'),W('明天见','míng tiān jiàn','Vidimo se sutra'),W('不客气','bú kè qì','Nema na čemu')]]
];
p1data.forEach(function(r,i){p1.push(mkLesson(2+i,r[0],r[1],r[2]));});

var p1rest = [
  [L('自我介绍','Predstavljanje','Self-Intro'),'🙋',[W('叫','jiào','Zvati'),W('姓','xìng','Prezime'),W('名字','míng zi','Ime'),W('什么','shén me','Šta'),W('老师','lǎo shī','Učitelj'),W('学生','xué shēng','Student'),W('也','yě','Takođe'),W('认识','rèn shi','Upoznati')]],
  [L('国籍和语言','Nacionalnost','Nationality'),'🌍',[W('国家','guó jiā','Država'),W('塞尔维亚','Sài ěr wéi yà','Srbija'),W('人','rén','Osoba'),W('说','shuō','Govoriti'),W('会','huì','Umeti'),W('英文','Yīng wén','Engleski')]],
  [L('年龄和家庭(一)','Godine i porodica','Age & Family'),'👨‍👩‍👧‍👦',[W('岁','suì','Godine'),W('几','jǐ','Koliko'),W('有','yǒu','Imati'),W('爸爸','bà ba','Tata'),W('妈妈','mā ma','Mama'),W('爷爷','yé ye','Deda'),W('奶奶','nǎi nai','Baka')]],
  [L('家庭(二)','Porodica (2)','Family (2)'),'👨‍👩‍👧',[W('哥哥','gē ge','Stariji brat'),W('姐姐','jiě jie','Starija sestra'),W('弟弟','dì di','Mlađi brat'),W('妹妹','mèi mei','Mlađa sestra'),W('孩子','hái zi','Dete'),W('爱','ài','Voleti')]],
  [L('职业','Zanimanja','Jobs'),'💼',[W('工作','gōng zuò','Posao'),W('医生','yī shēng','Lekar'),W('学生','xué shēng','Student'),W('工程师','gōng chéng shī','Inženjer'),W('律师','lǜ shī','Advokat'),W('警察','jǐng chá','Policajac')]],
  [L('基本动词','Osnovni glagoli','Basic Verbs'),'🏃',[W('吃','chī','Jesti'),W('喝','hē','Piti'),W('走','zǒu','Hodati'),W('跑','pǎo','Trčati'),W('看','kàn','Gledati'),W('听','tīng','Slušati'),W('说','shuō','Govoriti'),W('写','xiě','Pisati')]],
  [L('基本形容词','Osnovni pridevi','Basic Adjectives'),'🎨',[W('大','dà','Velik'),W('小','xiǎo','Mali'),W('高','gāo','Visok'),W('漂亮','piào liang','Lep'),W('可爱','kě ài','Sladak'),W('高兴','gāo xìng','Srećan'),W('好吃','hǎo chī','Ukusan')]],
  [L('颜色','Boje','Colors'),'🌈',[W('红','hóng','Crvena'),W('黄','huáng','Žuta'),W('蓝','lán','Plava'),W('绿','lǜ','Zelena'),W('白','bái','Bela'),W('黑','hēi','Crna'),W('喜欢','xǐ huān','Sviđati')]],
  [L('疑问词','Upitne reči','Question Words'),'❓',[W('什么','shén me','Šta'),W('谁','shéi','Ko'),W('哪儿','nǎr','Gde'),W('什么时候','shén me shí hou','Kada'),W('为什么','wèi shén me','Zašto'),W('怎么','zěn me','Kako'),W('多少','duō shǎo','Koliko'),W('几','jǐ','Koliko')]],
  [L('综合复习1','Pregled 1','Review 1'),'🌟',[W('复习','fù xí','Ponoviti'),W('记住','jì zhù','Zapamtiti'),W('明白','míng bai','Razumeti'),W('问题','wèn tí','Pitanje'),W('回答','huí dá','Odgovor'),W('对','duì','Tačno'),W('错','cuò','Pogrešno')]],
  [L('时间-日期','Vreme-Datum','Time-Date'),'📅',[W('今天','jīn tiān','Danas'),W('明天','míng tiān','Sutra'),W('昨天','zuó tiān','Juče'),W('星期','xīng qī','Nedelja'),W('月','yuè','Mesec'),W('年','nián','Godina'),W('号','hào','Datum')]],
  [L('时间-时刻','Vreme-Sati','Time-Hours'),'⏰',[W('早上','zǎo shang','Jutro'),W('中午','zhōng wǔ','Podne'),W('下午','xià wǔ','Popodne'),W('晚上','wǎn shang','Veče'),W('点','diǎn','Sat'),W('分','fēn','Minut'),W('半','bàn','Pola')]],
  [L('日常作息','Dnevna rutina','Daily Routine'),'🌅',[W('起床','qǐ chuáng','Ustati'),W('洗脸','xǐ liǎn','Umivati'),W('吃早饭','chī zǎo fàn','Doručkovati'),W('上班','shàng bān','Posao'),W('回家','huí jiā','Vratiti se'),W('做饭','zuò fàn','Kuvati'),W('睡觉','shuì jiào','Spavati')]],
  [L('天气和季节','Vreme i god.doba','Weather & Seasons'),'🌤️',[W('天气','tiān qì','Vreme'),W('冷','lěng','Hladno'),W('热','rè','Vruće'),W('下雨','xià yǔ','Kiša'),W('下雪','xià xuě','Sneg'),W('春天','chūn tiān','Proleće'),W('夏天','xià tiān','Leto'),W('冬天','dōng tiān','Zima')]],
  [L('食物和饮料','Hrana i piće','Food & Drinks'),'🍜',[W('米饭','mǐ fàn','Pirinač'),W('面条','miàn tiáo','Rezanci'),W('水','shuǐ','Voda'),W('茶','chá','Čaj'),W('咖啡','kā fēi','Kafa'),W('牛肉','niú ròu','Govedina'),W('鱼','yú','Riba'),W('蔬菜','shū cài','Povrće')]],
  [L('方位词','Položaj','Position Words'),'📍',[W('上面','shàng miàn','Iznad'),W('下面','xià miàn','Ispod'),W('里面','lǐ miàn','Unutra'),W('外面','wài miàn','Napolju'),W('旁边','páng biān','Pored'),W('前','qián','Ispred'),W('后','hòu','Iza')]],
  [L('量词(一)','Mere (1)','Measure Words'),'📏',[W('个','gè','Kom'),W('只','zhī','Kom(živ)'),W('条','tiáo','Kom(dug)'),W('本','běn','Kom(knj)'),W('杯','bēi','Šolja'),W('张','zhāng','Kom(rav)'),W('件','jiàn','Kom(odeć)')]],
  [L('日常用品','Svakodnevni predmeti','Daily Items'),'🪑',[W('桌子','zhuō zi','Sto'),W('椅子','yǐ zi','Stolica'),W('门','mén','Vrata'),W('窗','chuāng','Prozor'),W('手机','shǒu jī','Telefon'),W('钱','qián','Novac'),W('包','bāo','Torba')]],
  [L('综合练习','Vežba-Moj život','Practice'),'🌟',[W('练习','liàn xí','Vežbati'),W('试试','shì shì','Probati'),W('慢点','màn diǎn','Polako'),W('听不懂','tīng bu dǒng','Ne razumem'),W('请再说','qǐng zài shuō','Molim ponovi'),W('谢谢帮助','xiè xiè bāng zhù','Hvala na pomoći')]],
  [L('阶段1测试','Test faze 1','Phase 1 Test'),'🏆',[W('考试','kǎo shì','Test'),W('及格','jí gé','Položiti'),W('满分','mǎn fēn','Savršeno'),W('加油','jiā yóu','Napred!'),W('成功','chéng gōng','Uspeh'),W('庆祝','qìng zhù','Slaviti')]]
];
p1rest.forEach(function(r,i){p1.push(mkLesson(11+i,r[0],r[1],r[2]));});

// Phase 2 (31-60)
var p2d = [
  [L('在餐厅(一)','U restoranu (1)','At Restaurant'),'🍽️',[W('菜单','cài dān','Meni'),W('点菜','diǎn cài','Naručiti'),W('筷子','kuài zi','Štapići'),W('碗','wǎn','Činija'),W('勺子','sháo zi','Kašika'),W('服务员','fú wù yuán','Konobar'),W('买单','mǎi dān','Račun')]],
  [L('在餐厅(二)','U restoranu (2)','Restaurant 2'),'🍜',[W('好吃','hǎo chī','Ukusno'),W('辣','là','Ljuto'),W('甜','tián','Slatko'),W('酸','suān','Kiselo'),W('咸','xián','Slano'),W('烫','tàng','Vruće'),W('饱了','bǎo le','Sit')]],
  [L('购物(一)','Kupovina (1)','Shopping'),'🛍️',[W('多少钱','duō shǎo qián','Koliko'),W('贵','guì','Skupo'),W('便宜','pián yi','Jeftino'),W('买','mǎi','Kupiti'),W('商店','shāng diàn','Prodavnica'),W('市场','shì chǎng','Pijaca')]],
  [L('购物(二)','Kupovina (2)','Shopping 2'),'💰',[W('打折','dǎ zhé','Popust'),W('试穿','shì chuān','Probati'),W('大小','dà xiǎo','Veličina'),W('合适','hé shì','Odgovarati'),W('退','tuì','Vratiti'),W('现金','xiàn jīn','Gotovina')]],
  [L('问路(一)','Put (1)','Asking Way'),'🗺️',[W('怎么走','zěn me zǒu','Kako stići'),W('左','zuǒ','Levo'),W('右','yòu','Desno'),W('直走','zhí zǒu','Pravo'),W('拐','guǎi','Skrenuti'),W('路','lù','Put')]],
  [L('问路(二)','Put (2)','Asking Way 2'),'🧭',[W('远','yuǎn','Daleko'),W('近','jìn','Blizu'),W('地铁站','dì tiě zhàn','Metro stanica'),W('对面','duì miàn','Preko puta'),W('地图','dì tú','Mapa')]],
  [L('交通工具','Prevoz','Transport'),'🚇',[W('公共汽车','gōng gòng qì chē','Autobus'),W('地铁','dì tiě','Metro'),W('出租车','chū zū chē','Taksi'),W('自行车','zì xíng chē','Bicikl'),W('飞机','fēi jī','Avion'),W('火车','huǒ chē','Voz'),W('开车','kāi chē','Voziti')]],
  [L('买票和预约','Karte','Tickets'),'🎫',[W('票','piào','Karta'),W('预订','yù dìng','Rezervisati'),W('座位','zuò wèi','Sedište'),W('出发','chū fā','Polazak'),W('到达','dào dá','Dolazak'),W('网上','wǎng shàng','Online')]],
  [L('在酒店','Hotel','At Hotel'),'🏨',[W('房间','fáng jiān','Soba'),W('登记','dēng jì','Prijava'),W('退房','tuì fáng','Odjava'),W('钥匙','yào shi','Ključ'),W('前台','qián tái','Recepcija'),W('干净','gān jìng','Čisto')]],
  [L('综合复习2','Pregled 2','Review 2'),'📝',[W('复习','fù xí','Ponoviti'),W('检查','jiǎn chá','Proveriti'),W('改正','gǎi zhèng','Ispraviti'),W('进步','jìn bù','Napredak'),W('记住','jì zhù','Zapamtiti'),W('继续','jì xù','Nastaviti')]],
  [L('电话沟通','Telefon','Phone Calls'),'📞',[W('打电话','dǎ diàn huà','Telefonirati'),W('喂','wèi','Halo'),W('留言','liú yán','Poruka'),W('号码','hào mǎ','Broj'),W('回电话','huí diàn huà','Uzvratiti'),W('信号','xìn hào','Signal')]],
  [L('约时间见面','Dogovor','Making Plans'),'📆',[W('见面','jiàn miàn','Sresti se'),W('有空','yǒu kòng','Slobodan'),W('几点','jǐ diǎn','U koliko'),W('改时间','gǎi shí jiān','Promeniti'),W('取消','qǔ xiāo','Otkazati'),W('确定','què dìng','Potvrditi')]],
  [L('看病就医','Kod lekara','At Doctor'),'🏥',[W('生病','shēng bìng','Bolestan'),W('头疼','tóu téng','Glavobolja'),W('发烧','fā shāo','Groznica'),W('感冒','gǎn mào','Prehlada'),W('药','yào','Lek'),W('医院','yī yuàn','Bolnica')]],
  [L('在药店','Apoteka','Pharmacy'),'💊',[W('咳嗽','ké sòu','Kašalj'),W('肚子疼','dù zi téng','Bol u stomaku'),W('过敏','guò mǐn','Alergija'),W('药方','yào fāng','Recept'),W('片','piàn','Tableta'),W('体温','tǐ wēn','Temperatura')]],
  [L('在银行','Banka','At Bank'),'🏦',[W('银行','yín háng','Banka'),W('开户','kāi hù','Otvoriti račun'),W('存钱','cún qián','Uplatiti'),W('取钱','qǔ qián','Podići'),W('卡','kǎ','Kartica'),W('密码','mì mǎ','PIN')]],
  [L('在邮局','Pošta','Post Office'),'📮',[W('邮局','yóu jú','Pošta'),W('信','xìn','Pismo'),W('包裹','bāo guǒ','Paket'),W('邮票','yóu piào','Markica'),W('寄','jì','Poslati'),W('地址','dì zhǐ','Adresa')]],
  [L('兴趣爱好(一)','Hobiji (1)','Hobbies'),'🎨',[W('喜欢','xǐ huān','Voleti'),W('唱歌','chàng gē','Pevati'),W('跳舞','tiào wǔ','Plesati'),W('看书','kàn shū','Čitati'),W('旅游','lǚ yóu','Putovati'),W('运动','yùn dòng','Sport')]],
  [L('兴趣爱好(二)','Hobiji (2)','Hobbies 2'),'🎵',[W('弹琴','tán qín','Svirati'),W('摄影','shè yǐng','Fotografisati'),W('游泳','yóu yǒng','Plivati'),W('做饭','zuò fàn','Kuvati'),W('下棋','xià qí','Šah'),W('打篮球','dǎ lán qiú','Košarka')]],
  [L('邀请和约会','Pozivi','Invitations'),'💕',[W('请客','qǐng kè','Častiti'),W('一起','yī qǐ','Zajedno'),W('约会','yuē huì','Sastanak'),W('同意','tóng yì','Složiti'),W('拒绝','jù jué','Odbiti'),W('改天','gǎi tiān','Drugi put')]],
  [L('综合复习3','Pregled 3','Review 3'),'📝',[W('总结','zǒng jié','Sažetak'),W('错误','cuò wù','Greška'),W('自信','zì xìn','Samopouzdanje'),W('坚持','jiān chí','Istranost'),W('目标','mù biāo','Cilj')]],
  [L('节日庆祝(一)','Praznici (1)','Festivals'),'🎉',[W('生日','shēng rì','Rođendan'),W('礼物','lǐ wù','Poklon'),W('蛋糕','dàn gāo','Torta'),W('新年','xīn nián','Nova godina'),W('快乐','kuài lè','Srećan'),W('祝福','zhù fú','Blagoslov')]],
  [L('节日庆祝(二)','Praznici (2)','Festivals 2'),'🏮',[W('春节','Chūn Jié','Kineska NG'),W('红包','hóng bāo','Crveni koverat'),W('饺子','jiǎo zi','Knedle'),W('烟花','yān huā','Vatromet'),W('福','fú','Sreća'),W('龙','lóng','Zmaj')]],
  [L('请求和帮助','Molbe','Requests'),'🙏',[W('帮忙','bāng máng','Pomoći'),W('麻烦','má fan','Smetnja'),W('借','jiè','Pozajmiti'),W('给','gěi','Dati'),W('需要','xū yào','Treba'),W('感谢','gǎn xiè','Zahvalan')]],
  [L('表达感受','Osećanja','Feelings'),'😊',[W('开心','kāi xīn','Srećan'),W('难过','nán guò','Tužan'),W('累','lèi','Umoran'),W('生气','shēng qì','Ljut'),W('担心','dān xīn','Zabrinut'),W('激动','jī dòng','Uzbuđen')]],
  [L('比较(一)','Poređenje (1)','Comparisons'),'⚖️',[W('比','bǐ','Nego'),W('更','gèng','Još'),W('最','zuì','Naj-'),W('一样','yī yàng','Isto'),W('不同','bù tóng','Različito'),W('越来越','yuè lái yuè','Sve više')]],
  [L('比较(二)','Poređenje (2)','Comparisons 2'),'📊',[W('非常','fēi cháng','Veoma'),W('特别','tè bié','Posebno'),W('极了','jí le','Ekstremno'),W('挺','tǐng','Prilično'),W('还可以','hái kě yǐ','OK'),W('差不多','chà bu duō','Slično')]],
  [L('数字应用','Brojevi 100-10000','Numbers 100+'),'🔢',[W('百','bǎi','Sto'),W('千','qiān','Hiljada'),W('万','wàn','10000'),W('零','líng','Nula'),W('两','liǎng','Dva'),W('一共','yī gòng','Ukupno')]],
  [L('综合练习','Vežba','Practice'),'✏️',[W('对话','duì huà','Dijalog'),W('发音','fā yīn','Izgovor'),W('流利','liú lì','Tečno'),W('自然','zì ran','Prirodno'),W('纠正','jiū zhèng','Ispraviti')]],
  [L('阶段2复习','Pregled 2','Review Phase 2'),'📚',[W('掌握','zhǎng wò','Savladati'),W('弱项','ruò xiàng','Slabost'),W('提高','tí gāo','Poboljšati'),W('巩固','gǒng gù','Učvrstiti'),W('挑战','tiǎo zhàn','Izazov')]],
  [L('阶段2测试','Test faze 2','Phase 2 Test'),'🏆',[W('测试','cè shì','Test'),W('听力','tīng lì','Slušanje'),W('口语','kǒu yǔ','Govor'),W('阅读','yuè dú','Čitanje'),W('及格','jí gé','Položiti'),W('毕业','bì yè','Diplomirati')]]
];
var p2 = []; p2d.forEach(function(r,i){p2.push(mkLesson(31+i,r[0],r[1],r[2]));});

// Phase 3-6 generator
function genPhase(num,icon,name,desc,topics){
  var ls=[];
  topics.forEach(function(t,i){
    LESSON_ID++;
    ls.push({id:LESSON_ID,day:i+1,topic:{zh:t[0],sr:t[1],en:t[2]},icon:t[3],words:t[4],
      dialog:L('A: '+t[0]+'。\nB: 我们一起学。','A: '+t[1]+'.\nB: Učimo zajedno.','A: '+t[2]+'.\nB: Let\'s learn together.'),
      grammar:L('每天进步一点点。','Malo po malo.','Little by little.'),
      practice:{type:'choice',prompt:L('加油！','Napred!','Go!'),options:['坚持','努力','加油','以上都对'],correct:3},
      culture:L('学中文，看世界。','Uči kineski, vidi svet.','Learn Chinese, see the world.'),
      points:10});
  });
  return {phase:num,name:name,description:desc,icon:icon,lessons:ls};
}

var p3 = genPhase(3,'🌆',L('社交出行','Društveni život','Social Life'),L('租房、求职、恋爱、旅行。','Jezik društvenih situacija.','Language for social situations.'),[
  ['租房(一)','Iznajmljivanje (1)','Renting (1)','🏠',[W('租','zū','Iznajmiti'),W('房租','fáng zū','Kirija'),W('押金','yā jīn','Depozit'),W('房东','fáng dōng','Stanodavac'),W('合同','hé tong','Ugovor')]],
  ['租房(二)','Iznajmljivanje (2)','Renting (2)','🏡',[W('搬家','bān jiā','Selidba'),W('家具','jiā jù','Nameštaj'),W('邻居','lín jū','Komšija'),W('安静','ān jìng','Tiho'),W('方便','fāng biàn','Pogodno')]],
  ['求职(一)','Traženje posla (1)','Job Hunt','💼',[W('面试','miàn shì','Intervju'),W('简历','jiǎn lì','CV'),W('工资','gōng zī','Plata'),W('经验','jīng yàn','Iskustvo'),W('能力','néng lì','Sposobnost')]],
  ['求职(二)','Traženje posla (2)','Job Hunt 2','📋',[W('录取','lù qǔ','Primljen'),W('辞职','cí zhí','Otkaz'),W('加班','jiā bān','Prekovremeno'),W('同事','tóng shì','Kolega'),W('老板','lǎo bǎn','Šef')]],
  ['社交媒体','Društvene mreže','Social Media','📱',[W('微信','Wēi xìn','WeChat'),W('朋友圈','péng you quān','Moments'),W('点赞','diǎn zàn','Lajk'),W('分享','fēn xiǎng','Deliti'),W('关注','guān zhù','Pratiti')]],
  ['网络用语','Internet sleng','Internet Slang','💬',[W('上网','shàng wǎng','Surfovati'),W('搜索','sōu suǒ','Tražiti'),W('下载','xià zài','Preuzeti'),W('链接','liàn jiē','Link'),W('账号','zhàng hào','Nalog')]],
  ['恋爱关系','Ljubavna veza','Romance','💕',[W('谈恋爱','tán liàn ài','Biti u vezi'),W('男朋友','nán péng yǒu','Dečko'),W('女朋友','nǚ péng yǒu','Devojka'),W('浪漫','làng màn','Romantika'),W('想念','xiǎng niàn','Nedostajati')]],
  ['约会','Sastanak','Dating','💝',[W('约会','yuē huì','Sastanak'),W('电影','diàn yǐng','Film'),W('散步','sàn bù','Šetnja'),W('告白','gào bái','Izjava ljubavi'),W('甜','tián','Sladak')]],
  ['时间顺序','Vremenski red','Time Sequence','⏳',[W('先','xiān','Prvo'),W('然后','rán hòu','Onda'),W('接着','jiē zhe','Zatim'),W('最后','zuì hòu','Konačno'),W('之后','zhī hòu','Posle')]],
  ['因果关系','Uzrok i posledica','Cause & Effect','🔗',[W('因为','yīn wèi','Jer'),W('所以','suǒ yǐ','Zato'),W('由于','yóu yú','Zbog'),W('为了','wèi le','Da bi'),W('结果','jié guǒ','Rezultat')]],
  ['转折让步','Kontrast','Contrast','↔️',[W('虽然','suī rán','Iako'),W('但是','dàn shì','Ali'),W('可是','kě shì','Međutim'),W('不过','bú guò','Ipak'),W('却','què','Međutim')]],
  ['条件假设','Uslovi','Conditions','🔀',[W('如果','rú guǒ','Ako'),W('要是','yào shì','Ako bi'),W('就','jiù','Onda'),W('才','cái','Tek'),W('否则','fǒu zé','Inače')]],
  ['旅行(一)','Putovanje (1)','Travel','✈️',[W('旅行','lǚ xíng','Putovanje'),W('护照','hù zhào','Pasoš'),W('签证','qiān zhèng','Viza'),W('机票','jī piào','Karta'),W('酒店','jiǔ diàn','Hotel')]],
  ['旅行(二)','Putovanje (2)','Travel 2','🗺️',[W('景点','jǐng diǎn','Atrakcija'),W('拍照','pāi zhào','Slikati'),W('纪念品','jì niàn pǐn','Suvenir'),W('导游','dǎo yóu','Vodič'),W('好玩','hǎo wán','Zabavno')]],
  ['计划安排','Planiranje','Planning','📋',[W('打算','dǎ suàn','Planirati'),W('安排','ān pái','Organizovati'),W('计划','jì huà','Plan'),W('决定','jué dìng','Odlučiti'),W('提前','tí qián','Unapred')]],
  ['建议推荐','Predlozi','Suggestions','💡',[W('建议','jiàn yì','Predlog'),W('推荐','tuī jiàn','Preporuka'),W('应该','yīng gāi','Treba'),W('最好','zuì hǎo','Najbolje'),W('值得','zhí dé','Vredno')]],
  ['环保自然','Ekologija','Environment','🌿',[W('环境','huán jìng','Okolina'),W('保护','bǎo hù','Zaštita'),W('垃圾','lā jī','Smeće'),W('污染','wū rǎn','Zagađenje'),W('节约','jié yuē','Štedeti')]],
  ['健康生活','Zdrav život','Healthy Life','💪',[W('健康','jiàn kāng','Zdravlje'),W('锻炼','duàn liàn','Vežbati'),W('减肥','jiǎn féi','Mršaviti'),W('饮食','yǐn shí','Ishrana'),W('睡眠','shuì mián','San')]],
  ['体育运动','Sport','Sports','⚽',[W('足球','zú qiú','Fudbal'),W('篮球','lán qiú','Košarka'),W('游泳','yóu yǒng','Plivanje'),W('跑步','pǎo bù','Trčanje'),W('比赛','bǐ sài','Takmičenje')]],
  ['音乐艺术','Muzika','Music & Art','🎵',[W('音乐','yīn yuè','Muzika'),W('唱歌','chàng gē','Pevati'),W('乐器','yuè qì','Instrument'),W('艺术','yì shù','Umetnost'),W('表演','biǎo yǎn','Nastup')]],
  ['电影电视','Film i TV','Movies & TV','🎬',[W('电影','diàn yǐng','Film'),W('演员','yǎn yuán','Glumac'),W('导演','dǎo yǎn','Režiser'),W('故事','gù shì','Priča'),W('好看','hǎo kàn','Dobar')]],
  ['读书学习','Čitanje','Reading','📖',[W('书','shū','Knjiga'),W('图书馆','tú shū guǎn','Biblioteka'),W('小说','xiǎo shuō','Roman'),W('杂志','zá zhì','Časopis'),W('知识','zhī shi','Znanje')]],
  ['描述城市','Opis grada','Describing City','🏙️',[W('城市','chéng shì','Grad'),W('热闹','rè nao','Živahan'),W('安静','ān jìng','Miran'),W('漂亮','piào liang','Lep'),W('现代','xiàn dài','Moderan')]],
  ['描述外貌','Opis izgleda','Describing Looks','👤',[W('头发','tóu fa','Kosa'),W('眼睛','yǎn jīng','Oči'),W('个子','gè zi','Visina'),W('瘦','shòu','Mršav'),W('帅','shuài','Zgodan')]],
  ['描述性格','Opis karaktera','Character','🎭',[W('性格','xìng gé','Karakter'),W('幽默','yōu mò','Duhovit'),W('大方','dà fang','Velikodušan'),W('害羞','hài xiū','Stidljiv'),W('善良','shàn liáng','Dobar')]],
  ['综合练习','Vežba','Practice','✏️',[W('练习','liàn xí','Vežbati'),W('对话','duì huà','Dijalog'),W('流利','liú lì','Tečno'),W('自信','zì xìn','Samopouzdanje'),W('进步','jìn bù','Napredak')]],
  ['阶段3复习','Pregled 3','Phase 3 Review','📚',[W('复习','fù xí','Ponoviti'),W('重点','zhòng diǎn','Ključno'),W('掌握','zhǎng wò','Savladati'),W('目标','mù biāo','Cilj'),W('坚持','jiān chí','Istranost')]],
  ['阶段3测试','Test faze 3','Phase 3 Test','🏆',[W('测试','cè shì','Test'),W('听力','tīng lì','Slušanje'),W('口语','kǒu yǔ','Govor'),W('阅读','yuè dú','Čitanje'),W('毕业','bì yè','Diplomirati')]],
  ['复习巩固','Konsolidacija','Consolidation','🔄',[W('巩固','gǒng gù','Učvrstiti'),W('回顾','huí gù','Osvrnuti'),W('总结','zǒng jié','Sažeti'),W('规划','guī huà','Planirati'),W('前进','qián jìn','Napredovati')]],
  ['自由对话','Slobodan razgovor','Free Talk','💬',[W('聊天','liáo tiān','Ćaskati'),W('话题','huà tí','Tema'),W('想法','xiǎng fǎ','Mišljenje'),W('故事','gù shì','Priča'),W('分享','fēn xiǎng','Podeliti')]]
]);

var p4 = genPhase(4,'💬',L('情感对话','Emotivni dijalog','Emotional Dialogue'),L('表达情感、争论、安慰、祝贺。','Izrazi emocije, debate, uteha.','Express emotions, debate, comfort.'),[
  ['表达意见(一)','Mišljenje (1)','Opinions (1)','💭',[W('觉得','jué de','Misliti'),W('认为','rèn wéi','Smatrati'),W('同意','tóng yì','Složiti'),W('反对','fǎn duì','Protiviti'),W('看法','kàn fǎ','Stav')]],
  ['表达意见(二)','Mišljenje (2)','Opinions (2)','🗣️',[W('其实','qí shí','Zapravo'),W('说实话','shuō shí huà','Iskreno'),W('误会','wù huì','Nesporazum'),W('解释','jiě shì','Objasniti')]],
  ['争论解释','Rasprava','Debate','⚡',[W('道歉','dào qiàn','Izvinjenje'),W('解决','jiě jué','Rešiti'),W('矛盾','máo dùn','Konflikt'),W('理解','lǐ jiě','Razumeti'),W('沟通','gōu tōng','Komunikacija')]],
  ['安慰鼓励','Uteha','Comfort','🤗',[W('别担心','bié dān xīn','Ne brini'),W('加油','jiā yóu','Napred'),W('没关系','méi guān xì','OK'),W('慢慢来','màn man lái','Polako'),W('支持','zhī chí','Podrška')]],
  ['祝贺祝福','Čestitke','Congratulations','🎊',[W('恭喜','gōng xǐ','Čestitam'),W('祝','zhù','Želim'),W('幸福','xìng fú','Sreća'),W('成功','chéng gōng','Uspeh'),W('健康','jiàn kāng','Zdravlje')]],
  ['谈婚论嫁','Brak','Marriage','💒',[W('结婚','jié hūn','Venčati'),W('婚礼','hūn lǐ','Svadba'),W('戒指','jiè zhi','Prsten'),W('蜜月','mì yuè','Medeni mesec'),W('幸福','xìng fú','Sreća')]],
  ['中塞文化对比','Kina-Srbija','CN-RS Compare','🌉',[W('文化','wén huà','Kultura'),W('差异','chā yì','Razlika'),W('传统','chuán tǒng','Tradicija'),W('习惯','xí guàn','Navika'),W('尊重','zūn zhòng','Poštovati')]],
  ['中国家庭观念','Kineska porodica','Chinese Family','👨‍👩‍👧‍👦',[W('孝顺','xiào shùn','Poštovanje'),W('责任','zé rèn','Odgovornost'),W('团圆','tuán yuán','Okupljanje'),W('尊老爱幼','zūn lǎo ài yòu','Poštovanje starijih')]],
  ['餐桌礼仪','Ponašanje za stolom','Table Manners','🥢',[W('敬酒','jìng jiǔ','Nazdraviti'),W('请慢用','qǐng màn yòng','Prijatno'),W('干杯','gān bēi','Živeli'),W('味道','wèi dào','Ukus')]],
  ['做客礼仪','Gost u kući','Guest Etiquette','🏠',[W('做客','zuò kè','Biti gost'),W('脱鞋','tuō xié','Izuti se'),W('带礼物','dài lǐ wù','Doneti poklon'),W('客气','kè qi','Učtiv'),W('招待','zhāo dài','Ugošćavati')]],
  ['送礼文化','Darivanje','Gift Culture','🎁',[W('礼物','lǐ wù','Poklon'),W('红包','hóng bāo','Crveni koverat'),W('讲究','jiǎng jiu','Važnost'),W('意思','yì si','Značenje')]],
  ['数字讲究','Numerologija','Number Symbols','🔢',[W('幸运','xìng yùn','Srećan'),W('吉利','jí lì','Povoljan'),W('8发','bā-fā','8=Bogatstvo'),W('4死','sì-sǐ','4=Smrt')]],
  ['颜色象征','Simbolika boja','Color Symbols','🎨',[W('红色','hóng sè','Crvena=Sreća'),W('白色','bái sè','Bela=Žalost'),W('黄色','huáng sè','Žuta=Carska'),W('金色','jīn sè','Zlatna')]],
  ['生肖星座','Zodijak','Zodiac','🐉',[W('生肖','shēng xiào','Horoskop'),W('属','shǔ','Pripadati'),W('龙','lóng','Zmaj'),W('鼠','shǔ','Pacov'),W('虎','hǔ','Tigar')]],
  ['春节','Kineska Nova Godina','Spring Festival','🧧',[W('除夕','chú xī','Badnje veče'),W('团圆饭','tuán yuán fàn','Porodična večera'),W('拜年','bài nián','Čestitati'),W('压岁钱','yā suì qián','Novac za decu')]],
  ['中秋端午','Sredina jeseni','Mid-Autumn','🥮',[W('月饼','yuè bǐng','Mesečev kolač'),W('团圆','tuán yuán','Okupljanje'),W('粽子','zòng zi','Lepkirice'),W('龙舟','lóng zhōu','Zmajev čamac')]],
  ['讲笑话','Vicevi','Jokes','😄',[W('笑话','xiào hua','Vic'),W('好笑','hǎo xiào','Smešno'),W('幽默','yōu mò','Humor'),W('开心','kāi xīn','Srećan')]],
  ['道歉原谅','Izvinjenje','Apologies','🙇',[W('对不起','duì bu qǐ','Izvinite'),W('不好意思','bù hǎo yì si','Oprostite'),W('原谅','yuán liàng','Oprostiti'),W('理解','lǐ jiě','Razumeti')]],
  ['电话进阶','Telefon napredni','Phone Advanced','📱',[W('转告','zhuǎn gào','Preneti'),W('留言','liú yán','Poruka'),W('回电','huí diàn','Uzvratiti'),W('稍等','shāo děng','Sačekaj')]],
  ['微信聊天','WeChat','WeChat Chat','💬',[W('语音','yǔ yīn','Glasovna'),W('表情','biǎo qíng','Stiker'),W('群聊','qún liáo','Grupni čet'),W('朋友圈','péng you quān','Moments')]],
  ['恋爱对话','Ljubavni razgovor','Love Talk','💕',[W('想你','xiǎng nǐ','Nedostaješ'),W('爱你','ài nǐ','Volim te'),W('宝贝','bǎo bèi','Draga'),W('甜言蜜语','tián yán mì yǔ','Slatke reči')]],
  ['综合练习','Vežba','Practice','✏️',[W('表达','biǎo dá','Izraziti'),W('感受','gǎn shòu','Osećaj'),W('交流','jiāo liú','Komunikacija'),W('理解','lǐ jiě','Razumevanje')]],
  ['讲故事(一)','Pričanje priča (1)','Storytelling (1)','📖',[W('从前','cóng qián','Nekada'),W('突然','tū rán','Odjednom'),W('后来','hòu lái','Kasnije'),W('终于','zhōng yú','Konačno'),W('故事','gù shì','Priča')]],
  ['讲故事(二)','Pričanje priča (2)','Storytelling (2)','📚',[W('一边…一边','yī biān...yī biān','Dok...istovremeno'),W('的时候','de shí hou','Dok'),W('结果','jié guǒ','Rezultat'),W('经过','jīng guò','Tok')]],
  ['要求澄清','Traženje pojašnjenja','Clarification','❓',[W('什么意思','shén me yì si','Šta znači'),W('再说一遍','zài shuō yī biàn','Ponovi'),W('慢一点','màn yī diǎn','Polako'),W('听不懂','tīng bu dǒng','Ne razumem')]],
  ['打断和转换话题','Prekidanje i promena teme','Interrupting','↩️',[W('对了','duì le','Usput'),W('话说','huà shuō','Kad smo kod toga'),W('顺便','shùn biàn','Usput'),W('另外','lìng wài','Osim toga')]],
  ['表达情绪进阶','Napredne emocije','Advanced Emotions','🎭',[W('感动','gǎn dòng','Dirnut'),W('失望','shī wàng','Razočaran'),W('羡慕','xiàn mù','Zavidan'),W('满足','mǎn zú','Zadovoljan'),W('后悔','hòu huǐ','Kajati se')]],
  ['网络新词和流行语','Internet novogovor','Internet Slang','🔥',[W('666','liù liù liù','Super'),W('佛系','fó xì','Opušten'),W('躺平','tǎng píng','Odustati'),W('绝绝子','jué jué zi','Neverovatno'),W('yyds','yǒng yuǎn de shén','Najbolji ikad')]],
  ['阶段4复习','Pregled 4','Phase 4 Review','📚',[W('巩固','gǒng gù','Učvrstiti'),W('掌握','zhǎng wò','Savladati'),W('进步','jìn bù','Napredak'),W('目标','mù biāo','Cilj')]],
  ['阶段4测试','Test faze 4','Phase 4 Test','🏆',[W('测试','cè shì','Test'),W('听力','tīng lì','Slušanje'),W('阅读','yuè dú','Čitanje'),W('写作','xiě zuò','Pisanje')]]
]);

var p5 = genPhase(5,'📝',L('读写进阶','Čitanje i pisanje','Reading & Writing'),L('汉字部首、成语、阅读、写作。','Radikali, idiomi, čitanje, pisanje.','Radicals, idioms, reading, writing.'),[
  ['汉字部首(一)','Radikali (1)','Radicals (1)','📝',[W('亻','rén','Čovek'),W('氵','shuǐ','Voda'),W('口','kǒu','Usta'),W('扌','shǒu','Ruka'),W('艹','cǎo','Trava')]],
  ['汉字部首(二)','Radikali (2)','Radicals (2)','✍️',[W('火','huǒ','Vatra'),W('心','xīn','Srce'),W('贝','bèi','Školjka'),W('日','rì','Sunce'),W('女','nǚ','Žena')]],
  ['汉字故事(一)','Priče o znacima (1)','Char Stories (1)','📖',[W('日','rì','Sunce'),W('月','yuè','Mesec'),W('山','shān','Planina'),W('水','shuǐ','Voda'),W('木','mù','Drvo')]],
  ['汉字故事(二)','Priče o znacima (2)','Char Stories (2)','📚',[W('休','xiū','Odmor'),W('好','hǎo','Dobar'),W('安','ān','Miran'),W('明','míng','Svetao'),W('林','lín','Šuma')]],
  ['简单阅读(一)','Čitanje (1)','Reading (1)','📰',[W('文章','wén zhāng','Tekst'),W('标题','biāo tí','Naslov'),W('段落','duàn luò','Paragraf'),W('句子','jù zi','Rečenica'),W('意思','yì si','Značenje')]],
  ['简单阅读(二)','Čitanje (2)','Reading (2)','📄',[W('故事','gù shì','Priča'),W('内容','nèi róng','Sadržaj'),W('人物','rén wù','Lik'),W('情节','qíng jié','Radnja'),W('结局','jié jú','Kraj')]],
  ['成语—画蛇添足','Idiom-Preterivanje','Idiom-Overdoing','🐍',[W('画蛇添足','huà shé tiān zú','Preterati'),W('比喻','bǐ yù','Metafora'),W('故事','gù shì','Priča'),W('教训','jiào xùn','Lekcija')]],
  ['成语—刻舟求剑','Idiom-Neprilagodljiv','Idiom-Stubborn','⚔️',[W('刻舟求剑','kè zhōu qiú jiàn','Neprilagodljiv'),W('变化','biàn huà','Promena'),W('记号','jì hào','Oznaka')]],
  ['成语—狐假虎威','Idiom-Tuđa moć','Idiom-Borrowed Power','🦊',[W('狐假虎威','hú jiǎ hǔ wēi','Tuđa moć'),W('狐狸','hú li','Lisica'),W('老虎','lǎo hǔ','Tigar')]],
  ['成语—亡羊补牢','Idiom-Bolje ikad','Idiom-Never Late','🐑',[W('亡羊补牢','wáng yáng bǔ láo','Bolje ikad'),W('羊','yáng','Ovca'),W('补','bǔ','Popraviti')]],
  ['成语—塞翁失马','Idiom-Sreća u nesreći','Idiom-Blessing','🐴',[W('塞翁失马','sài wēng shī mǎ','Sreća u nesreći'),W('福','fú','Sreća'),W('祸','huò','Nesreća')]],
  ['成语—对牛弹琴','Idiom-Uzaludno','Idiom-Futility','🐮',[W('对牛弹琴','duì niú tán qín','Uzaludno'),W('弹琴','tán qín','Svirati'),W('浪费','làng fèi','Traćiti')]],
  ['新闻阅读','Čitanje vesti','News Reading','📰',[W('新闻','xīn wén','Vest'),W('报道','bào dào','Izveštaj'),W('事件','shì jiàn','Događaj'),W('记者','jì zhě','Novinar')]],
  ['广告通知','Oglasi','Ads & Notices','📢',[W('广告','guǎng gào','Reklama'),W('免费','miǎn fèi','Besplatno'),W('活动','huó dòng','Aktivnost'),W('报名','bào míng','Prijava')]],
  ['社交媒体短文','Društvene mreže','Social Posts','📱',[W('转发','zhuǎn fā','Deliti'),W('点赞','diǎn zàn','Lajk'),W('评论','píng lùn','Komentar'),W('粉丝','fěn sī','Pratilac')]],
  ['电子邮件','E-pošta','Email','📧',[W('邮箱','yóu xiāng','Sanduče'),W('发邮件','fā yóu jiàn','Poslati mejl'),W('附件','fù jiàn','Prilog'),W('回复','huí fù','Odgovor')]],
  ['日记写作','Pisanje dnevnika','Diary Writing','📔',[W('日记','rì jì','Dnevnik'),W('记录','jì lù','Beležiti'),W('心情','xīn qíng','Raspoloženje'),W('感想','gǎn xiǎng','Utisak')]],
  ['诗歌—静夜思','Pesma-Tišina','Poem-Quiet Night','🌙',[W('床','chuáng','Krevet'),W('明月','míng yuè','Sjajan mesec'),W('故乡','gù xiāng','Rodni kraj'),W('思念','sī niàn','Nedostajati')]],
  ['诗歌—春晓','Pesma-Proleće','Poem-Spring','🌸',[W('春','chūn','Proleće'),W('眠','mián','Spavati'),W('鸟','niǎo','Ptica'),W('花','huā','Cvet')]],
  ['诗歌—登鹳雀楼','Pesma-Toranj','Poem-Tower','🏯',[W('白日','bái rì','Sunce'),W('黄河','Huáng Hé','Žuta reka'),W('千里','qiān lǐ','Hiljadu milja'),W('更上','gèng shàng','Još više')]],
  ['诗歌—江雪','Pesma-Sneg','Poem-Snow','❄️',[W('千山','qiān shān','Planine'),W('万径','wàn jìng','Staze'),W('孤舟','gū zhōu','Čamac'),W('雪','xuě','Sneg')]],
  ['短文写作—我的家人','Pisanje-Porodica','Writing-Family','👨‍👩‍👧‍👦',[W('介绍','jiè shào','Predstaviti'),W('描写','miáo xiě','Opisati'),W('性格','xìng gé','Karakter'),W('爱好','ài hào','Hobi')]],
  ['短文写作—有趣的一天','Pisanje-Dan','Writing-Fun Day','📝',[W('开头','kāi tóu','Početak'),W('经过','jīng guò','Tok'),W('结尾','jié wěi','Kraj'),W('细节','xì jié','Detalj')]],
  ['应用文','Praktično pisanje','Practical Writing','📋',[W('请假条','qǐng jià tiáo','Odsustvo'),W('留言','liú yán','Poruka'),W('申请','shēn qǐng','Prijava'),W('签名','qiān míng','Potpis')]],
  ['歌词欣赏','Tekstovi pesama','Lyrics','🎶',[W('歌词','gē cí','Tekst'),W('旋律','xuán lǜ','Melodija'),W('歌手','gē shǒu','Pevač'),W('流行','liú xíng','Popularan')]],
  ['翻译练习','Prevođenje','Translation','🔄',[W('翻译','fān yì','Prevod'),W('准确','zhǔn què','Tačan'),W('通顺','tōng shùn','Gladak'),W('练习','liàn xí','Vežbati')]],
  ['阅读挑战','Izazov čitanja','Reading Challenge','📖',[W('挑战','tiǎo zhàn','Izazov'),W('难度','nán dù','Težina'),W('理解','lǐ jiě','Razumevanje'),W('生词','shēng cí','Nova reč')]],
  ['阶段5复习','Pregled 5','Phase 5 Review','📚',[W('巩固','gǒng gù','Učvrstiti'),W('提高','tí gāo','Poboljšati'),W('检查','jiǎn chá','Proveriti'),W('计划','jì huà','Plan')]],
  ['阶段5测试','Test faze 5','Phase 5 Test','🏆',[W('综合','zōng hé','Sveobuhvatan'),W('成绩','chéng jì','Rezultat'),W('通过','tōng guò','Proći'),W('继续','jì xù','Nastavak')]],
  ['复习总结','Pregled','Summary','📊',[W('回顾','huí gù','Osvrt'),W('成就','chéng jiù','Postignuće'),W('感想','gǎn xiǎng','Utisak'),W('展望','zhǎn wàng','Pogled napred')]]
]);

var p6 = genPhase(6,'🎯',L('流利表达','Tečno izražavanje','Fluency'),L('辩论、演讲、深度文化、毕业。','Debata, govor, duboka kultura, diplomiranje.','Debate, speech, deep culture, graduation.'),[
  ['中塞关系','Kina-Srbija','CN-RS Relations','🤝',[W('友谊','yǒu yì','Prijateljstvo'),W('合作','hé zuò','Saradnja'),W('交流','jiāo liú','Razmena'),W('桥梁','qiáo liáng','Most')]],
  ['互联网时代','Internet era','Internet Age','🌐',[W('互联网','hù lián wǎng','Internet'),W('科技','kē jì','Tehnologija'),W('改变','gǎi biàn','Promena'),W('智能','zhì néng','Pametan')]],
  ['环保话题','Ekologija','Environment','🌍',[W('气候','qì hòu','Klima'),W('变化','biàn huà','Promena'),W('保护','bǎo hù','Zaštita'),W('可持续','kě chí xù','Održiv')]],
  ['教育未来','Obrazovanje','Education','🎓',[W('教育','jiào yù','Obrazovanje'),W('知识','zhī shi','Znanje'),W('能力','néng lì','Sposobnost'),W('梦想','mèng xiǎng','San')]],
  ['职业规划','Karijera','Career','📈',[W('职业','zhí yè','Karijera'),W('发展','fā zhǎn','Razvoj'),W('机会','jī huì','Prilika'),W('努力','nǔ lì','Trud')]],
  ['全球化','Globalizacija','Globalization','🌏',[W('世界','shì jiè','Svet'),W('国际','guó jì','Međunarodni'),W('贸易','mào yì','Trgovina'),W('多元','duō yuán','Raznolikost')]],
  ['社交媒体影响','Društvene mreže','Social Impact','📲',[W('影响','yǐng xiǎng','Uticaj'),W('隐私','yǐn sī','Privatnost'),W('沉迷','chén mí','Zavisnost'),W('平衡','píng héng','Ravnoteža')]],
  ['AI和未来','AI i budućnost','AI & Future','🤖',[W('人工智能','rén gōng zhì néng','AI'),W('机器人','jī qì rén','Robot'),W('取代','qǔ dài','Zameniti'),W('创造','chuàng zào','Stvarati')]],
  ['旅行探索','Putovanja','Travel','🧳',[W('探索','tàn suǒ','Istraživati'),W('冒险','mào xiǎn','Avantura'),W('风景','fēng jǐng','Pejzaž'),W('体验','tǐ yàn','Iskustvo')]],
  ['电影文学评论','Kritika filma','Film Review','🎥',[W('评论','píng lùn','Kritika'),W('主题','zhǔ tí','Tema'),W('角色','jué sè','Lik'),W('导演','dǎo yǎn','Režiser')]],
  ['音乐文化认同','Muzički identitet','Music Identity','🎼',[W('传统','chuán tǒng','Tradicija'),W('现代','xiàn dài','Moderna'),W('民族','mín zú','Nacionalni'),W('创新','chuàng xīn','Inovacija')]],
  ['饮食文化比较','Kuhinje','Cuisine','🍽️',[W('烹饪','pēng rèn','Kulinarstvo'),W('食材','shí cái','Sastojak'),W('口味','kǒu wèi','Ukus'),W('特色','tè sè','Posebnost')]],
  ['家庭角色变化','Porodične uloge','Family Roles','👨‍👩‍👧',[W('角色','jué sè','Uloga'),W('变化','biàn huà','Promena'),W('平等','píng děng','Jednakost'),W('责任','zé rèn','Odgovornost')]],
  ['代沟问题','Generacijski jaz','Generation Gap','👴👶',[W('代沟','dài gōu','Generacijski jaz'),W('理解','lǐ jiě','Razumevanje'),W('沟通','gōu tōng','Komunikacija'),W('包容','bāo róng','Tolerancija')]],
  ['爱情婚姻观','Ljubav i brak','Love & Marriage','💍',[W('爱情','ài qíng','Ljubav'),W('婚姻','hūn yīn','Brak'),W('承诺','chéng nuò','Obećanje'),W('选择','xuǎn zé','Izbor')]],
  ['中塞婚俗','Kinesko-srpski običaji','CN-RS Wedding','💒',[W('婚俗','hūn sú','Bračni običaji'),W('仪式','yí shì','Ceremonija'),W('彩礼','cǎi lǐ','Miraz'),W('祝福','zhù fú','Blagoslov')]],
  ['育儿观念','Vaspitanje dece','Parenting','👶',[W('教育','jiào yù','Obrazovanje'),W('培养','péi yǎng','Odgajati'),W('独立','dú lì','Nezavisan'),W('尊重','zūn zhòng','Poštovanje')]],
  ['衰老和养老','Starenje','Aging','👴',[W('衰老','shuāi lǎo','Starenje'),W('退休','tuì xiū','Penzija'),W('养老','yǎng lǎo','Briga'),W('陪伴','péi bàn','Društvo')]],
  ['辩论技巧(一)','Debata (1)','Debate (1)','🎤',[W('论点','lùn diǎn','Argument'),W('证据','zhèng jù','Dokaz'),W('反驳','fǎn bó','Pobijanje'),W('逻辑','luó ji','Logika')]],
  ['辩论技巧(二)','Debata (2)','Debate (2)','🗣️',[W('举例','jǔ lì','Primer'),W('结论','jié lùn','Zaključak'),W('强调','qiáng diào','Naglasiti'),W('回应','huí yìng','Odgovor')]],
  ['即兴演讲','Improvizovani govor','Impromptu Speech','🎙️',[W('演讲','yǎn jiǎng','Govor'),W('开场','kāi chǎng','Uvod'),W('自信','zì xìn','Samopouzdanje'),W('流畅','liú chàng','Tečno')]],
  ['中国文化—儒家','Konfučijanizam','Confucianism','📜',[W('儒家','Rú jiā','Konfučijanizam'),W('孔子','Kǒng zǐ','Konfučije'),W('仁','rén','Humanost'),W('礼','lǐ','Ritual')]],
  ['中国文化—道家','Taoizam','Taoism','☯️',[W('道家','Dào jiā','Taoizam'),W('老子','Lǎo zǐ','Lao Tzu'),W('道','dào','Put/Tao'),W('无为','wú wéi','Nedelanje')]],
  ['中塞谚语对比','Kinesko-srpske poslovice','CN-RS Proverbs','💡',[W('谚语','yàn yǔ','Poslovica'),W('智慧','zhì huì','Mudrost'),W('比喻','bǐ yù','Metafora'),W('文化','wén huà','Kultura')]],
  ['中塞文化融合','Kulturna integracija','Cultural Integration','🌉',[W('融合','róng hé','Integracija'),W('欣赏','xīn shǎng','Cenjenje'),W('尊重','zūn zhòng','Poštovanje'),W('理解','lǐ jiě','Razumevanje')]],
  ['用中文讲塞语故事','Srpske priče na kineskom','Serbian Stories in CN','📖',[W('传说','chuán shuō','Legenda'),W('历史','lì shǐ','Istorija'),W('英雄','yīng xióng','Heroj'),W('骄傲','jiāo ào','Ponos')]],
  ['写给Anđela的信','Pismo za Anđelu','Letter to Anđela','💌',[W('亲爱的','qīn ài de','Draga'),W('感谢','gǎn xiè','Hvala'),W('爱','ài','Ljubav'),W('永远','yǒng yuǎn','Zauvek')]],
  ['自由主题','Slobodna tema','Free Topic','🌟',[W('选择','xuǎn zé','Izabrati'),W('兴趣','xìng qù','Interesovanje'),W('分享','fēn xiǎng','Podeliti'),W('讨论','tǎo lùn','Diskutovati')]],
  ['综合复习','Sveobuhvatan pregled','Final Review','📚',[W('综合','zōng hé','Sveobuhvatno'),W('总结','zǒng jié','Sažetak'),W('成就','chéng jiù','Postignuće'),W('感谢','gǎn xiè','Zahvalnost')]],
  ['毕业考试','Završni ispit','Final Exam','🎓',[W('毕业','bì yè','Diplomirati'),W('考试','kǎo shì','Ispit'),W('庆祝','qìng zhù','Slaviti'),W('继续','jì xù','Nastavak')]]
]);

var allPhases = [
  {phase:1,name:L('拼音基石','Osnove Pinjina','Pinyin Basics'),description:L('学习汉语拼音系统——声母、韵母、声调。这是说好普通话的基础。','Naučite sistem kineskog izgovora — inicijale, finale i tonove.','Learn the Chinese pinyin system — initials, finals, and tones.'),icon:'🏛️',lessons:p1},
  {phase:2,name:L('日常生活','Svakodnevni život','Daily Life'),description:L('掌握日常生活场景用语——餐厅、购物、问路、交通。','Jezik za svakodnevne situacije.','Language for everyday situations.'),icon:'🗣️',lessons:p2},
  p3,p4,p5,p6
];
fs.writeFileSync('data/lessons.json', JSON.stringify(allPhases), 'utf8');
var total = 0; allPhases.forEach(function(p){total+=p.lessons.length;});
console.log('Generated ' + total + ' lessons across ' + allPhases.length + ' phases');

var fs=require('fs');
var data=JSON.parse(fs.readFileSync('dist/data/holidays.json','utf8'));

var E={
  '2026-02-17':{
    zh:'春节是中国最重要的传统节日。家家户户贴春联、放鞭炮、吃年夜饭。Barry每年和Anđela视频一起看春晚，虽然时差不同，但新年的钟声同时敲响。跨越七千公里的爱，让这个春节更加特别。',
    sr:'Kineska Nova Godina je najvažniji praznik u Kini. Barry svake godine deli ovaj praznik sa Anđelom preko video poziva — iako su udaljeni 7.000 km, njihova ljubav ne poznaje granice. Dva sveta, jedno srce.',
    en:'Spring Festival is China\'s most important holiday. Barry and Anđela celebrate via video call across 7,000 km — proof that love transcends distance. Two worlds, one heart.'
  },
  '2026-03-03':{
    zh:'元宵节是春节的尾声，人们赏花灯、猜灯谜、吃汤圆。圆形的汤圆象征团圆。Barry说Anđela的笑容像元宵节的满月一样明亮。虽然相隔千里，同一轮明月照耀着中国和塞尔维亚。',
    sr:'Festival lampiona označava kraj Nove Godine. Ljudi šetaju sa lampionima i jedu tangjuan. Barry kaže da Anđelin osmeh podseća na pun mesec. Ista luna sija iznad Kine i Srbije.',
    en:'The Lantern Festival ends New Year celebrations with lanterns and tangyuan. Barry says Anđela\'s smile is like the full moon. The same moon shines over both China and Serbia.'
  },
  '2026-06-19':{
    zh:'端午节纪念爱国诗人屈原，人们赛龙舟、吃粽子。Anđela发现这个故事让她想起塞尔维亚的史诗诗歌。两个民族都用诗歌和美食铭记历史。跨越文化的理解，让每一片粽叶都裹着双重的爱。',
    sr:'Festival zmajevih čamaca slavi pesnika Qu Yuana trkama i zongzijem. Anđela prepoznaje sličnosti sa srpskim epskim pesmama. Dva naroda, dve tradicije, jedno razumevanje.',
    en:'Dragon Boat Festival honors poet Qu Yuan. Anđela sees parallels with Serbian epic poetry. Love bridges these ancient traditions.'
  },
  '2026-09-25':{
    zh:'中秋节是团圆的节日，全家人赏月、吃月饼。Barry和Anđela视频通话，看着同一轮明月。塞尔维亚的月亮和中国的月亮其实是同一个——就像他们的心，紧紧相连。月饼配rakija，东西方的融合就像他们的爱情。',
    sr:'Festival sredine jeseni je praznik porodičnog okupljanja. Barry i Anđela gledaju isti mesec preko video poziva. Mesečev kolač uz rakiju — spajanje istoka i zapada, baš kao i oni.',
    en:'Mid-Autumn Festival celebrates reunion under the full moon. Barry and Anđela share the same moon via video call. Mooncake with rakija — East meets West, like their love.'
  },
  '2026-10-01':{
    zh:'国庆节纪念中华人民共和国成立。天安门广场举行盛大阅兵式。Anđela希望有一天站在长城上看国庆烟花。Barry答应了一定带她去——一起看长城，一起看他们的未来。',
    sr:'Dan Republike Kine obeležava osnivanje NR Kine. Anđela sanja o Kineskom zidu i vatrometu. Barry je obećao da će je odvesti.',
    en:'National Day commemorates the PRC\'s founding. Anđela dreams of watching fireworks from the Great Wall. Barry promised to take her.'
  },
  '2026-01-07':{
    zh:'东正教圣诞节是塞尔维亚最重要的宗教节日之一，按儒略历在1月7日庆祝。平安夜准备橡树枝象征新生。家庭享用传统美食。Barry说塞尔维亚的圣诞更温暖质朴——因为那里有Anđela。',
    sr:'Božić je najvažniji verski praznik u Srbiji. Na Badnji dan pale se badnjaci. Porodica se okuplja. Barry voli srpski Božić jer ga Anđela čini posebnim.',
    en:'Orthodox Christmas (Jan 7) features the badnjak ceremony. Barry loves Serbian Christmas for its warmth — because Anđela is there.'
  },
  '2026-02-15':{
    zh:'塞尔维亚国庆日纪念1804年起义。Anđela说她和Barry之间也有一种起义——反抗距离和时差的起义。每次视频通话都是他们的胜利。',
    sr:'Dan državnosti Srbije obeležava ustanak iz 1804. Anđela kaže da njena ljubav sa Barryjem predstavlja ustanak protiv udaljenosti.',
    en:'Statehood Day marks the 1804 uprising. Anđela says her love with Barry is also a kind of uprising — against distance. Every video call is a victory.'
  },
  '2026-06-28':{
    zh:'维多夫丹纪念1389年科索沃战役。塞尔维亚人用诗歌铭记历史。Barry觉得这和中国的清明节相似。两个民族用不同的方式记住自己是谁——就像Barry和Anđela记住为什么相爱。',
    sr:'Vidovdan je sećanje na Kosovsku bitku 1389. Barry vidi sličnost sa kineskim Qingming festivalom. Dva naroda, ista potreba za sećanjem.',
    en:'Vidovdan marks the 1389 Battle of Kosovo. Barry sees parallels with China\'s Qingming. Two peoples, different traditions, the same need to remember.'
  },
  '2026-01-27':{
    zh:'圣萨瓦是塞尔维亚东正教创始人、教育家。孩子们在这一天朗诵诗歌。Barry说这像中国对孔子的尊崇。Anđela说：知识就是力量，爱也是。',
    sr:'Sveti Sava je osnivač Srpske crkve. Barry vidi paralelu sa Konfučijem. Anđela kaže: znanje je moć, a ljubav je još veća moć.',
    en:'Saint Sava Day honors Serbia\'s greatest educator. Barry sees a parallel with Confucius. Anđela says: knowledge is power, and love is even greater.'
  },
  '2026-04-12':{
    zh:'东正教复活节用红色彩蛋象征基督的宝血，人们说"Hristos vaskrse"。Barry觉得红蛋和春节红色都是希望和重生的颜色。',
    sr:'Vaskrs je najveći hrišćanski praznik. Srbi farbaju jaja u crveno. Barry primećuje da crvena boja podseća na kinesku Novu Godinu — boje nade.',
    en:'Orthodox Easter features red eggs symbolizing Christ\'s blood. Barry notes the red connects to Chinese New Year — both symbolize hope and renewal.'
  }
};

Object.keys(E).forEach(function(d){
  var h=data.holidays.find(function(x){return x.d===d;});
  if(h){h.desc.zh=E[d].zh;h.desc.sr=E[d].sr;h.desc.en=E[d].en;}
});
console.log('Expanded',Object.keys(E).length,'holidays');

if(!data.holidays.find(function(x){return x.d==='2026-08-15';})){
  data.holidays.push({d:'2026-08-15',name:{sr:'Velika Gospojina',zh:'圣母升天节',en:'Assumption of Mary'},country:'rs',icon:'🕌',desc:{sr:'Velika Gospojina je praznik posvećen uznesenju Bogorodice. Anđela pali sveću za sreću svoje porodice i za Barryja.',zh:'圣母升天节纪念圣母玛利亚升天。Anđela点燃蜡烛为家人和Barry祈福。',en:'The Assumption honors Mary\'s ascent. Anđela lights a candle for her family and Barry.'}});
  console.log('Added: Assumption of Mary');
}

if(!data.holidays.find(function(x){return x.d==='2026-11-01';})){
  data.holidays.push({d:'2026-11-01',name:{sr:'Svi Sveti',zh:'诸圣节',en:'All Saints\' Day'},country:'rs',icon:'🕯️',desc:{sr:'Svi Sveti su praznik posvećen svim svetiteljima. Anđela veruje da oni koje volimo nikada nisu zaista daleko.',zh:'诸圣节纪念所有圣徒。Anđela相信，我们所爱的人从未真正走远。',en:'All Saints\' Day honors all saints. Anđela believes those we love are never truly far.'}});
  console.log('Added: All Saints\' Day');
}

data.version='7.3.0';
fs.writeFileSync('dist/data/holidays.json',JSON.stringify(data,null,2),'utf8');
console.log('Done. Total holidays:',data.holidays.length);

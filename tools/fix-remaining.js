var fs=require('fs');
var data=JSON.parse(fs.readFileSync('dist/data/holidays.json','utf8'));
var h=data.holidays;

function upd(nameMatch,zh,sr,en){
  h.forEach(function(item,i){
    var nm=item.name.zh||item.name.sr;
    if(nm.indexOf(nameMatch)>=0){
      item.desc.zh=zh+'。';
      item.desc.sr=sr;
      item.desc.en=en;
    }
  });
}

upd('劳动节','劳动节在中国是七天长假。Barry和Anđela分享各自城市天空的照片。北京和贝尔格莱德的天空是相连的——就像思念飘过云层抵达对方','Praznik rada u Srbiji znači piknik i roštilj u prirodi. Barry kaže više voli srpski način — jednostavno, tiho, savršeno kad je Anđela tu.','Labor Day in Serbia means picnics outdoors. Barry prefers the Serbian version — simple, peaceful, perfect if Anđela is there.');
upd('圣萨瓦','圣萨瓦是塞尔维亚东正教创始人、教育家。孩子们朗诵诗歌。Barry说这像中国尊崇孔子——两种文化都尊重教育。Anđela说知识就是力量爱也是','Sveti Sava — osnivač Srpske crkve. Deca recituju pesme. Barry vidi paralelu sa Konfučijem. Obe kulture cene obrazovanje. Anđela: znanje je moć, ljubav još veća.','Saint Sava — Serbia\'s greatest educator. Children recite poems. Barry sees parallel with Confucius. Anđela: knowledge is power, love is greater.');
upd('国庆日','塞尔维亚国庆日纪念1804年起义。Anđela说她和Barry之间也有种起义——反抗距离和时差。每次视频通话都是他们的小小胜利','Dan državnosti — ustanak 1804. Anđela kaže njena ljubav sa Barryjem je ustanak protiv udaljenosti. Svaki video poziv je pobeda.','Statehood Day — 1804 uprising. Anđela says her love with Barry is an uprising against distance. Every video call is a victory.');
upd('复活节','东正教复活节用红色彩蛋象征基督宝血。Barry觉得红蛋和春节红色都是希望和重生的颜色。虽然庆祝方式不同但对新生的期盼是一样的','Vaskrs — crvena jaja simbolizuju Hristovu krv. Barry primećuje: crveno je boja nade i u Kini i u Srbiji. Hristos vaskrse!','Orthodox Easter — red eggs symbolize Christ\'s blood. Barry notes red is hope\'s color in both cultures. Christ is risen!');
upd('地球日','世界地球日提醒保护共同的家园。Barry和Anđela约定每年做一件环保小事——少用一个塑料袋种一棵植物。爱地球也爱彼此','Dan planete — Barry i Anđela svake godine urade nešto malo za planetu. Manje plastike, zasađena biljka. Volimo Zemlju i jedno drugo.','Earth Day — Barry and Anđela do one eco-friendly thing yearly. Love the Earth, love each other.');
upd('母亲节','母亲节向母亲表达感谢。Barry给妈妈做了一顿饭。塞尔维亚母亲节孩子们做手工礼物。两种方式同样温馨对母亲的爱是一样的','Majčin dan — Barry skuvao ručak mami. U Srbiji deca prave ručne radove. Isti osećaj, različiti običaji.','Mother\'s Day — Barry cooked for his mom. Serbian kids make handmade gifts. Same love, different ways.');
upd('家庭日','国际家庭日提醒家庭的重要性。中国家庭注重团圆塞尔维亚注重好客。他们共同的愿望是组建跨越文化的小家庭两种文化一个家','Dan porodice — kineska porodica ceni okupljanje, srpska gostoljubivost. Oboje sanjaju o porodici koja spaja istok i zapad.','Family Day — Chinese families value reunion, Serbian ones hospitality. They dream of a family bridging East and West.');
upd('儿童节','儿童节是中国孩子们最期待的节日。Barry回忆小时候去游乐园的快乐。Anđela说塞尔维亚儿童节在秋天但孩子的笑容全世界共通','Dečiji dan u Kini — najradosniji praznik za decu. U Srbiji se slavi u jesen. Dečiji osmesi su univerzalni.','Children\'s Day — the happiest day for Chinese kids. Serbia celebrates in autumn. Children\'s smiles are universal.');
upd('父亲节','父亲节感恩父亲。Barry陪父亲喝茶下棋——中国父爱含蓄深沉。塞尔维亚父亲更热情会拥抱孩子。两种父爱都深厚只是表达方式不同','Dan očeva — Barry pije čaj sa ocem u Kini. Kineski očevi suzdržani, srpski otvoreniji. Dva načina ista ljubav.','Father\'s Day — Barry drinks tea with his dad. Chinese fathers reserved, Serbian ones open. Two styles, same love.');
upd('万圣节','万圣节在中国年轻人中流行。Barry和Anđela分享各自的万圣节装扮照片。塞尔维亚城市也庆祝。戴上南瓜面具谁也看不出他们在恋爱','Noć veštica — Barry i Anđela dele kostime. Pod maskom od bundeve niko ne vidi da su zaljubljeni.','Halloween — Barry and Anđela share costume photos. Behind masks nobody sees they\'re in love.');
upd('塞尔维亚父亲节','塞尔维亚父亲节在1月中国在8月。Anđela笑着说一年庆祝两次给两位父亲双倍祝福。跨文化爱情连节日都是双份的','Dan očeva u januaru u Srbiji, u Kini avgusta. Anđela se smeje — duplo više ljubavi za očeve.','Serbia\'s Father\'s Day in January, China\'s in August. Double the love for their fathers.');
upd('亡灵节','亡灵节是塞尔维亚纪念逝者的日子。和清明节非常相似——都是关于记忆爱与告别的节日。生命有限而爱无限','Dušni dan — sećanje na preminule. Slično kineskom Qingmingu. Život je kratak, ali ljubav je večna.','All Souls\' Day — remembering the departed. Similar to China\'s Qingming. Life is short but love is eternal.');
upd('圣尼古拉节','圣尼古拉节塞尔维亚孩子最期待的日子——圣尼古拉给好孩子带礼物。Barry觉得像圣诞老人但更具宗教意义。Anđela记得在靴子里找到糖果的喜悦','Sveti Nikola — zaštitnik dece. Deca ostavljaju čizme i nalaze poklone. Barry kaže podseća na Deda Mraza.','St. Nicholas Day — children leave boots for gifts. Barry notes resemblance to Santa but deeper meaning.');
upd('双十一','双十一起源于中国大学光棍节变成全球最大购物节。Barry每年给Anđela买礼物。她笑着说最好的礼物是每天能和他聊天','11.11 — Dan samaca postao najveći šoping praznik. Barry kupuje poklone Anđeli. Njen najbolji poklon je svaki dan kada pričaju.','Singles\' Day became world\'s largest shopping day. Her best gift is every day they talk.');
upd('跨年夜','跨年夜Barry在北京Anđela在贝尔格莱德视频倒计时。两地七小时时差。当北京午夜钟声响起时贝尔格莱德正是夕阳。新的一年新的希望','Doček Nove Godine — 7 sati razlike. Ponoć u Pekingu, zalazak u Beogradu. Nova godina, nova nada.','New Year\'s Eve — 7 hours apart. Midnight in Beijing, sunset in Belgrade. New year, new hope.');
upd('圣母升天','圣母升天节纪念圣母玛利亚升天。塞尔维亚家庭祈祷团聚。Anđela点燃蜡烛为家人和Barry祈福','Velika Gospojina — Anđela pali sveću za porodicu i Barryja.','Assumption of Mary — Anđela lights a candle for her family and Barry.');
upd('诸圣节','诸圣节纪念所有圣徒。塞尔维亚人扫墓点灯追思亲人。Anđela相信所爱的人从未真正走远——就像Barry在她心里','Svi Sveti — Anđela veruje oni koje volimo nisu daleko — kao Barry u njenom srcu.','All Saints\' Day — Anđela believes those we love are never far — like Barry in her heart.');
upd('元旦','元旦是新年的第一天。Barry在北京Anđela在贝尔格莱德有七小时时差。午夜钟声响起时他们互相发送新年祝福。距离让时间不同步心永远一起','Nova Godina — Barry u Pekingu, Anđela u Kikindi. Sedam sati razlike. Srca kucaju istim ritmom. Ljubav ne poznaje granice.','New Year — Barry in Beijing, Anđela in Serbia. Seven hours apart. Hearts beat as one. Love knows no borders.');

data.version='7.5.0';
fs.writeFileSync('dist/data/holidays.json',JSON.stringify(data,null,2),'utf8');

var d2=JSON.parse(fs.readFileSync('dist/data/holidays.json','utf8'));
var bad=0;
d2.holidays.forEach(function(h){
  var zl=h.desc.zh?h.desc.zh.length:0;
  if(zl<70){bad++;console.log('SHORT:',h.d,h.name.zh||h.name.sr,'zh:'+zl);}
});
console.log('Total:',d2.holidays.length,'Below 70:',bad);
if(bad===0)console.log('ALL PASS ✓');
else console.log(bad+' still need work');

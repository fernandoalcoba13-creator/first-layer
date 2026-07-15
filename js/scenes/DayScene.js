// â•â•â• DAY SCENE â•â•â•
// Day phase: clients arrive, player accepts/negotiates/rejects orders, manages stock & shop.
class DayScene extends Phaser.Scene{
  constructor(){super({key:'Day'});}
  room(){
    const s=Math.min(this.W/DAY_ROOM_W,this.H/DAY_ROOM_H);
    return {s,ox:(this.W-DAY_ROOM_W*s)/2,oy:18};
  }
  rp(x,y){
    const r=this.room();
    return {x:r.ox+x*r.s,y:r.oy+y*r.s,s:r.s};
  }
  solidRects(){
    const s=this.room().s,R=(x,y,w,h)=>{
      const p=this.rp(x,y);
      return new Phaser.Geom.Rectangle(p.x-w*s/2,p.y-h*s,w*s,h*s);
    };
    return [
      R(88,176,150,56),       // complete L-counter body; front remains reachable from below
      R(33,139,34,15),        // stacked boxes
      R(71,141,30,13),        // display/mannequin floor footprint
      R(294,153,96,18),       // model display cabinet base
      R(383,153,43,18),       // coffee station base
      R(370,250,68,30),       // lounge sofa footprint
      R(318,235,34,20),       // lounge table footprint
      R(194,260,105,24),      // machine behind the front glass
      R(230,218,36,22)        // active day printer stand
    ];
  }
  footRect(x=this.player.x,y=this.player.y){
    const s=this.room().s;
    return new Phaser.Geom.Rectangle(x-5*s,y-7*s,10*s,7*s);
  }
  hitsSolid(x,y){
    const f=this.footRect(x,y);
    return this.solidRects().some(r=>Phaser.Geom.Intersects.RectangleToRectangle(f,r));
  }
  movePlayer(dx,dy){
    const room=this.room(),minY=room.oy+102*room.s,maxY=room.oy+244*room.s;
    const minX=room.ox+12*room.s,maxX=room.ox+(DAY_ROOM_W-12)*room.s;
    const nx=Phaser.Math.Clamp(this.player.x+dx,minX,maxX);
    if(!this.hitsSolid(nx,this.player.y))this.player.x=nx;
    const ny=Phaser.Math.Clamp(this.player.y+dy,minY,maxY);
    if(!this.hitsSolid(this.player.x,ny))this.player.y=ny;
  }
  create(){
    this.W=this.scale.width;this.H=this.scale.height;
    this.beta=BETA_DAYS[G.day]||BETA_DAYS[3];
    G.phase='day';G.stress=0;G.block=false;G.dayEarn=0;G.dayOrd=0;G.dayCli=0;G.dayPrints=0;G.dayBought=0;G.dayBoughtMaterial=0;G.nightDone=0;G.nFixes=0;G.pActive=false;G.dayMod=null;
    BGM.playDay();
    G.dayStartGold=G.gold;G.dayStartRep=G.rep;
    const freshDayOne=G.day===1&&!(G.orders&&G.orders.length)&&!G.dayBoughtPlaBasic&&!G.dayUsedPlaBasic;
    if(G.day!==1){G.dayBoughtPlaBasic=false;G.dayUsedPlaBasic=false;}
    if(freshDayOne){G.stk={pla:{eco:0,std:0,pro:0},petg:{eco:0,std:0,pro:0},tpu:{basic:0,premium:0,pro:0},resin:{basic:0,std:0,pro:0},parts:3};G.cons={coffee:1,mate:0,bar:1,sandwich:0,cleaner:1};G.dayBoughtPlaBasic=false;G.dayUsedPlaBasic=false;ensureStockShape();ensureConsumables();}
    G.energy=100;G.mateActive=false;G.mateTimer=0;G.mateCount=3;
    this.clients=[];this.clientQueue=this._shuffleCL();this.cTimer=0;this.cInt=this.beta.interval-(G.upg.ig?2500:0)-(G.emp.juli2?2000:0);
    this.dur=this.beta.duration||90000;this.timer=this.dur;this.IA=[];this.near=null;this.nearClient=null;this.dlgOpen=false;this.overtimeWarned=false;
    this.wt=0;this.st=0;this.wb=0;this.dir=1;this.tired=false;this._ysort=[];
    this.initPrinters();this.buildWorld();this.createPlayer();this.setupKeys();this.setupPointer();
    loadPrinterAssetsAsync(this,()=>this.refreshPrinterSprites());
    loadPlayerAssetsAsync(this,()=>this.refreshPlayerSprite());
    loadClientAssetsAsync(this);
    this.checkStory();this.updateHUD();
    this.time.delayedCall(this.beta.firstSpawn,()=>this.spawn());
    this.time.delayedCall(this.beta.secondSpawn,()=>this.spawn());
    document.getElementById('ptag').className='ptag day';
    document.getElementById('ptag').textContent='â˜€ï¸ '+tr('day')+' '+G.day;
    document.getElementById('hday').textContent='ğŸ“… '+tr('dayDyn')+' '+G.day;
    updateMarket();this.applyDayMod();this.cInt=Math.max(7000,Math.round(this.cInt*repStanding().flow));this.announceStanding();sLog((this.beta.title?this.beta.title+' - ':'')+this.beta.hint);
    sHint('Click objetos | WASD + E');
    doSave(G);
  }
  initPrinters(){
    G.printers=[];
    for(let i=0;i<4;i++)G.printers.push({id:i,locked:i>=G.pCount,broken:false,busy:false,order:null,progress:0,_ev:null,_pau:false});
  }
  buildWorld(){
    const W=this.W,H=this.H;
    this.bgG=this.add.graphics();drawBG(this.bgG,W,H,false);applyDayRoomLayers(this,this.bgG,W,H);
    const counterPt=this.rp(86,181);
    this.IA.push({x:counterPt.x,y:counterPt.y,type:'counter',lbl:'Click/E '+tr('counter')});
    const pcPt=this.rp(55,176);
    this.IA.push({x:pcPt.x,y:pcPt.y,type:'shop',lbl:'Click/E '+tr('shopTitle')});
    const stockPt=this.rp(79,111);
    this.IA.push({x:stockPt.x,y:stockPt.y,type:'stock',lbl:'Click/E '+tr('stockTitle')});
    const cafePt=this.rp(382,137);
    this.IA.push({x:cafePt.x,y:cafePt.y,type:'cafe',lbl:'Click/E '+tr('cafeTitle')});
    const tabPt=this.rp(151,108),tx=tabPt.x,ty=tabPt.y;this.tZone={x:tx,y:ty};this.tblG=this.add.graphics();this.drawTbl(false);
    this.IA.push({x:tx,y:ty,type:'tab',lbl:'Click/E '+tr('boardTitle')});
    const printerPt=this.rp(230,194);
    this.pGfx=[];const psp=(W*.37)/4,mainPrinterX=printerPt.x,mainPrinterY=printerPt.y,printerScale=printerPt.s;
    for(let i=0;i<4;i++){
      const px=i===0?mainPrinterX:W*.6+i*psp+psp/2,py=i===0?mainPrinterY:H*.55;
      const bg=this.add.graphics();this.drawPrinterBench(bg,px,py,i===0?printerScale:3.5);
      this._ysort.push({o:bg,baseY:py+2});
      const sp=createPrinterSprite(this,px,py);if(sp)sp.setScale(i===0?printerScale:3.5);
      const pg=this.add.graphics();pg.setPosition(px,py);pg.setVisible(!sp);drawPrinter(pg,false,false,0,0x5bc8fa);
      const lt=this.add.text(px,py+42,'P'+(i+1),{fontSize:'8px',color:'#2a2050',fontFamily:'Press Start 2P'}).setOrigin(.5,0);
      if(i>0)this.hideDayPrinter(pg,sp,lt,bg);
      this.pGfx.push({g:pg,sp,lt,px,py,bench:bg});
    }
    this.IA.push({x:mainPrinterX,y:mainPrinterY,type:'printers',lbl:'Click/E '+tr('printerTitle')});
    G.printers.forEach((p,i)=>{
      if(p.locked||i>0)return;
      const px=i===0?mainPrinterX:W*.6+i*psp+psp/2,py=i===0?mainPrinterY:H*.55;
      this.IA.push({x:px,y:py,type:'printer',pid:i,lbl:'Click/E P'+(i+1)+' '+tr('loadJob')});
    });
    this.iLbl=this.add.text(0,0,'',{fontSize:'10px',color:'#ffb347',fontFamily:'Press Start 2P',backgroundColor:'#000000bb',padding:{x:4,y:2}}).setDepth(20).setVisible(false);
  }
  // Depth = base Y, so whatever is lower on screen draws in front. Keeps the player,
  // printers, clients and tall props overlapping like a real room instead of a flat layer.
  ySortWorld(){
    if(!this._ysort)return;
    if(this.player)this.player.setDepth(this.player.y);
    if(this.pGfx)this.pGfx.forEach(pg=>{const t=pg.sp&&pg.sp.visible?pg.sp:pg.g;if(t)t.setDepth(pg.py);if(pg.lt)pg.lt.setDepth(pg.py+1);});
    if(this.clients)this.clients.forEach(c=>{if(c.ct&&c.ct.active)c.ct.setDepth(c.baseY);});
    this._ysort.forEach(e=>{if(e.o&&e.o.active)e.o.setDepth(e.baseY);});
  }
  drawTbl(pwr){
    const g=this.tblG;if(g)g.clear();
    if(this.powerSprite)this.powerSprite.clearTint().setTint(pwr?0xff4d6a:0xffffff).setAlpha(pwr?.95:1);
  }
  stkTxt(){return 'PLA:'+matStock('pla')+'  PETG:'+matStock('petg')+'  TPU:'+matStock('tpu')+'\nResin:'+matStock('resin')+'  '+tr('parts')+':'+G.stk.parts;}
  hideDayPrinter(g,sp,lt,bench){
    if(sp)sp.setVisible(false);
    if(g)g.setVisible(false);
    if(lt)lt.setVisible(false);
    if(bench)bench.setVisible(false);
  }
  // Simple pixel workbench under a printer: top surface + two legs, sized to the printer scale.
  drawPrinterBench(g,cx,by,scale){
    if(!g)return;g.clear();
    const w=Math.round(30*scale),h=Math.round(6*scale),legH=Math.round(16*scale),legW=Math.round(4*scale);
    const x=cx-w/2,top=by-2;
    g.fillStyle(0x2a1d0e,1).fillRect(x+legW,top+h,w-legW*2,legH);            // shadow gap under top
    g.fillStyle(0x6b4a1c,1).fillRect(x,top,w,h);                             // table top
    g.fillStyle(0x8a6224,1).fillRect(x,top,w,Math.max(2,Math.round(h*.4))); // top highlight
    g.fillStyle(0x4a3213,1);
    g.fillRect(x+legW,top+h,legW,legH);g.fillRect(x+w-legW*2,top+h,legW,legH); // legs
    g.lineStyle(1,0x1a1206,.6).strokeRect(x,top,w,h);
  }
  createPlayer(){
    const start=this.rp(184,190);
    this.player=this.add.container(start.x,start.y).setDepth(5);
    this.pGr=this.add.graphics();drawPlayer(this.pGr,false,false);
    this.player.add(this.pGr);this.pSp=null;this.pDir='down';
  }
  refreshPlayerSprite(){if(this.pSp||!this.player)return;this.pSp=createPlayerSprite(this,this.player,false);if(this.pSp){this.pSp.setScale(2.6);this.pGr.setVisible(false);}}
  setupKeys(){
    this.keys=this.input.keyboard.addKeys({w:'W',s:'S',a:'A',d:'D',up:'UP',dn:'DOWN',lt:'LEFT',rt:'RIGHT'});
    this.input.keyboard.on('keydown-E',()=>{if(this.dlgOpen||G.block)return;if(this.nearClient)this.openCounter(this.nearClient);else if(this.near)this.interact(this.near);});
  }
  setupPointer(){
    this.input.on('pointerdown',p=>{
      if(this.dlgOpen||G.block||G.phase!=='day')return;
      const x=p.worldX,y=p.worldY;
      const c=this.clientAt(x,y,78);
      if(c){this.openCounter(c);return;}
      const it=this.interactiveAt(x,y,86);
      if(it)this.interact(it);
    });
  }
  checkStory(){
    const e=STORY.find(s=>s.day===G.day&&(BETA_DAYS[G.day]||G.day>G.ss));
    if(e){G.ss=G.day;G.cObj=e;this.time.delayedCall(600,()=>{const st=storyText(e);G.showSto(st.ti,st.tx,st.ob);});}
    const brand=document.getElementById('brand');if(brand)brand.childNodes[0].nodeValue=G.shopName?shopDisplayName():gameTitle();
    document.getElementById('obj').textContent=makerDisplayName()+' Â· '+shopDisplayName();
  }
  announceStanding(){
    const s=repStanding();
    const label={bad:'âš ï¸ '+tr('repBad'),norm:'â€¢ '+tr('repNorm'),good:'â­ '+tr('repGood')}[s.key];
    const note={bad:tr('repBadNote'),norm:tr('repNormNote'),good:tr('repGoodNote')}[s.key];
    showNotif(label+': '+note,s.key==='bad'?'warning':s.key==='good'?'success':'info');
  }
  applyDayMod(){
    if(BETA_DAYS[G.day])return;
    if(G.day<2||Math.random()>Math.min(.58,.12+G.day*.035))return;
    const mods=[
      {id:'rush',name:'Clientes apurados',log:'Hoy todos quieren retirar rapido.',cInt:.84,pay:1.08,pat:.9,risk:.02},
      {id:'humid',name:'Humedad alta',log:'El filamento esta absorbiendo humedad. Revisa repuestos.',cInt:1,pay:1,risk:.06},
      {id:'promo',name:'Promo viral',log:'Una publicacion trajo mas consultas al taller.',cInt:.78,pay:.95,pat:1},
      {id:'premium',name:'Pedidos premium',log:'Llegan trabajos mejor pagos, pero mas delicados.',cInt:1.08,pay:1.22,risk:.04}
    ];
    G.dayMod=mods[Math.floor(Math.random()*mods.length)];
    this.cInt=Math.max(6500,this.cInt*G.dayMod.cInt);
    sLog('EVENTO: '+G.dayMod.name+' - '+G.dayMod.log);
    showNotif('Evento del dia: '+G.dayMod.name,'info');
  }
  clientStyle(cl){
    const rules={
      marcos:{prefs:['util'],diff:.85,pat:1.25,tag:'flexible'},
      sofi:{prefs:['art','fig'],diff:1.12,pat:.82,tag:'apuro estetico'},
      diego:{prefs:['util'],diff:1.28,pat:1.05,tag:'tolerancia fina'},
      valeria:{prefs:['util','art'],diff:1.35,pat:.88,tag:'corporativo'},
      nico:{prefs:['fig'],diff:.95,pat:1.12,tag:'fan art'},
      laura:{prefs:['art'],diff:1.08,pat:1.05,tag:'creativo'},
      juli:{prefs:['fig','art'],diff:1.22,pat:.72,tag:'viral'},
      tomas:{prefs:['util'],diff:1.18,pat:.95,tag:'maqueta'},
      ramiro:{prefs:['util'],diff:1.38,pat:.65,tag:'contra reloj'},
      pablo:{prefs:['util'],diff:1.05,pat:1.35,tag:'academico'},
      meli:{prefs:['fig','util'],diff:.9,pat:1.05,tag:'simple'},
      caro:{prefs:['art','fig'],diff:1,pat:1.1,tag:'curiosa'}
    };
    return rules[cl.id]||{prefs:['util','fig','art'],diff:1,pat:1,tag:'normal'};
  }
  pickProduct(style){
    const pref=PR.filter(p=>style.prefs.includes(p.cat));
    const pool=(pref.length&&Math.random()<.75)?pref:PR;
    return pool[Math.floor(Math.random()*pool.length)];
  }
  materialAvailable(mat){
    const b=BETA_DAYS[G.day];
    if(!b||!b.shop)return true;
    return b.shop.some(x=>String(x).indexOf(mat+':')===0);
  }
  orderMaterialFor(pr,diff){
    const preferred=pr.cat==='art'?'resin':(pr.cat==='util'&&diff>1.15?'petg':'pla');
    if(this.materialAvailable(preferred))return preferred;
    const fallback=preferred==='resin'?['petg','pla','tpu','resin']:['pla','petg','tpu','resin'];
    return fallback.find(m=>this.materialAvailable(m))||'pla';
  }
  makeOrder(cl,pr,urg,style){
    const dayMul=1+Math.min(.8,(G.day-1)*.045);
    const diff=Phaser.Math.Clamp(style.diff*dayMul*(urg?1.18:1),.75,2.6);
    const mod=G.dayMod||{};
    const pay=Math.round(pr.p*G.pMult*repPriceMult()*cl.gr*(urg?1.5:1)*(0.82+diff*.26)*(mod.pay||1));
    const time=Math.max(1.2,pr.t*(0.82+diff*.28)*(urg?.86:1));
    const pat=Math.max(6,(cl.pat*style.pat-(G.day-1)*.28+(urg?-4:0))*repPatienceMult()*(mod.pat||1));
    const risk=Phaser.Math.Clamp(.035+(diff-1)*.07+G.day*.006+(urg?.035:0)+(mod.risk||0),.02,.42);
    let material=this.orderMaterialFor(pr,diff);
    if(G.day===1)material='pla';
    const units=G.day===1&&G.dayCli===0?1:Math.max(1,Math.ceil(pr.t*diff/3));
    return {pay,time,diff,risk,pat,tag:style.tag,material,units};
  }
  spawn(){
    const requiredOrders=G.day===1?3:4;
    const arrivalCap=this.beta.maxClients||5;
    if(this.clients.length>=5||G.phase!=='day'||(G.dayCli>=arrivalCap&&(G.dayOrd||0)>=requiredOrders))return;
    const slot=this.nextClientSlot();
    if(slot<0)return;
    const activeIds=this.clients.filter(c=>!c.served).map(c=>c.cl.id);
    if(!this.clientQueue.length)this.clientQueue=this._shuffleCL();
    const qi=this.clientQueue.findIndex(c=>!activeIds.includes(c.id));
    if(qi<0)return;
    let cl=this.clientQueue.splice(qi,1)[0];
    let style=this.clientStyle(cl);
    let pr=this.pickProduct(style);
    let urg=cl.m==='Urgente'||Math.random()<.18;
    if(G.day===1&&G.dayCli===0){
      cl=CL.find(x=>x.id==='meli')||cl;
      pr=PR.find(x=>x.n==='Logo')||pr;
      style={diff:.9,pat:1.25,tag:'simple'};
      urg=false;
      this.clientQueue=this.clientQueue.filter(x=>x.id!==cl.id);
    }
    const order=this.makeOrder(cl,pr,urg,style);
    let pay=order.pay;
    if(G.upg.ams&&(pr.cat==='fig'||pr.cat==='art'))pay=Math.round(pay*1.5);
    const idx=slot;
    const target=this.rp(42+slot*27,183),tX=target.x,yP=target.y;
    const pat=order.pat*1000;
    const ct=this.add.container(-50,yP).setDepth(4);
    const cs=createClientSprite(this,cl,idx);if(cs)cs.setScale(2.6);
    const cg=this.add.graphics();if(cs)ct.add(cs);else{drawClient(cg,cl,idx);ct.add(cg);}
    const bb=this.add.graphics();bb.fillStyle(0xf8f8f8,.97);bb.fillRoundedRect(-42,-116,84,34,4);bb.fillTriangle(-6,-82,6,-82,0,-74);ct.add(bb);
    ct.add(this.add.text(×Nü¶‰ËkºwµçyĞ¡ÑÈ ‘…å=¹•M¡½ÁQ¥Àœ¤¤ì4(€€€€€Ñ¡¥Ì¹Ñ¥µ”¹‘•±…å•‘…±° äÀÀ° ¤ôùí¥˜¡¹Á¡…Í”ôôô‘…äœ˜˜…µ…ÑMÑ½¬ Á±„œ¤¥¹½Á•¹M¡½À ÍÑ¬œ¤íô¤ì4(€€€ô¤ì4(€€€‘½M…Ù”¡¤ì4(€€€É•ÑÕÉ¸ÑÉÕ”ì4(€ô4(€±•…Ù•±¥•¹Ğ¡Œ±…¹œ¥ì4(€€€Œ¹Í•ÉÙ•õÑÉÕ”ì4(€€€¥˜¡…¹œ¥í¹É•Àõ5…Ñ ¹µ…à À±¹É•À´Ô¤í¹ÍÑÉ•ÍÌõ5…Ñ ¹µ¥¸ ÄÀÀ±¹ÍÑÉ•ÍÌ¬ÄÀ¤íM`¹•ÉÈ ¤íÍ¡½İ9½Ñ¥˜ ŸÂ~b€œ­Œ¹°¹¸¬œ€œ­ÑÈ ÕÍÑ½µ•É1•™Ğœ¤¬œ¸€´ÔI@œ°•ÉÉ½Èœ¤íô4(€€€Œ¹İ…±¬õÑÉÕ”í¥˜¡Œ¹Ì˜™Œ¹Ì¹…¹¥µÌ¥Œ¹Ì¹…¹¥µÌ¹É•ÍÕµ” ¤í¥˜¡Œ¹ÍÑ•ÁQÜ¥Œ¹ÍÑ•ÁQÜ¹ÍÑ½À ¤íŒ¹ÍÑ•ÁQÜõÑ¡¥Ì¹Ñİ••¹Ì¹…‘¡íÑ…É•ÑÌéŒ¹Ğ±äéŒ¹‰…Í•d´Ì±‘ÕÉ…Ñ¥½¸èÄÔÀ±å½å¼éÑÉÕ”±É•Á•…Ğè´Ä±•…Í”èM¥¹”¹•…Í•%¹=ÕĞô¤ì4(€€€Ñ¡¥Ì¹Ñİ••¹Ì¹…‘¡íÑ…É•ÑÌéŒ¹Ğ±àè´àÀ±‘ÕÉ…Ñ¥½¸èÔØÀ±½¹½µÁ±•Ñ”è ¤ôùí¥˜¡Œ¹ÍÑ•ÁQÜ¥Œ¹ÍÑ•ÁQÜ¹ÍÑ½À ¤íŒ¹Ğ¹‘•ÍÑÉ½ä ¤íõô¤ì4(€€€Ñ¡¥Ì¹±¥•¹ÑÌõÑ¡¥Ì¹±¥•¹ÑÌ¹™¥±Ñ•È¡àôùà„ôõŒ¤ì4(€ô4(€¥¹Ñ•É…Ğ¡Ğ¥ì4(€€€M`¹ÍÑ•À ¤ì4(€€€¥˜¡Ğ¹ÑåÁ”ôôô±¥•¹Ğœ¥Ñ¡¥Ì¹½Á•¹½Õ¹Ñ•È¡Ğ¹±¥•¹Ğ¤ì4(€€€•±Í”¥˜¡Ğ¹ÑåÁ”ôôô½Õ¹Ñ•Èœ¥Ñ¡¥Ì¹½Á•¹½Õ¹Ñ•È ¤ì4(€€€•±Í”¥˜¡Ğ¹ÑåÁ”ôôôÁÉ¥¹Ñ•Èœ¥Ñ¡¥Ì¹½Á•¹AÉ¥¹Ñ•ÉEÕ•Õ”¡¹ÁÉ¥¹Ñ•ÉÍmĞ¹Á¥‘t¤ì4(€€€•±Í”¥˜¡Ğ¹ÑåÁ”ôôôÁÉ¥¹Ñ•ÉÌœ¥Ñ¡¥Ì¹½Á•¹AÉ¥¹Ñ•ÉÌ ¤ì4(€€€•±Í”¥˜¡Ğ¹ÑåÁ”ôôôÍÑ½¬œ¥¹½Á•¹M¡½À ÍÑ¬œ¤ì(€€€•±Í”¥˜¡Ğ¹ÑåÁ”ôôôÍ¡½Àœ¥¹½Á•¹M¡½À ÕÀœ¤ì(€€€•±Í”¥˜¡Ğ¹ÑåÁ”ôôô…™”œ¥¹½Á•¹…™•M¡½À ¤ì(€€€•±Í”¥˜¡Ğ¹ÑåÁ”ôôôÑ…ˆœ¥Ñ¡¥Ì¹½Á•¹Q…ˆ ¤ì(€ô4(€½Á•¹½Õ¹Ñ•È¡Ñ…É•Ğ¥ì4(€€€½¹ÍĞÜõÑ¡¥Ì¹±¥•¹ÑÌ¹™¥±Ñ•È¡Œôø…Œ¹Í•ÉÙ•¤ì4(€€€¥˜ …Ü¹±•¹Ñ ¥íÍ¡½İ9½Ñ¥˜¡ÑÈ ¹½]…¥Ñ¥¹±¥•¹ÑÌœ¤¤íÉ•ÑÕÉ¸íô4(€€€½¹ÍĞŒõÑ…É•Ğ˜˜…Ñ…É•Ğ¹Í•ÉÙ•ıÑ…É•Ğè¡Ñ¡¥Ì¹¹•…É±¥•¹ÑññİlÁt¤ì4(€€€½¹ÍĞ‘°õ±1¥¹”¡Œ¹°¤ì4(€€€€¼¼	…É…¥¸¥Ì„½¹”µÍ¡½Ğ…µ‰±”Á•È±¥•¹ĞƒŠP½™™•É¥¹œ¥Ğ……¥¸İ½Õ±±•ĞÑ¡”Á±…å•È4(€€€€¼¼½µÁ½Õ¹Ñ¡”ÁÉ¥”‰ÕµÀ¥¹‘•™¥¹¥Ñ•±ä°Í¼¥Ğ‘¥Í…ÁÁ•…ÉÌ½¹”ÕÍ•¸4(€€€½¹ÍĞ¡½¥•Ìõmí±ˆèŸŠr€œ­ÑÈ …•ÁĞœ¤¬œ€ œ­Œ¹Á…ä¬œ¤œ±±Ìè½¬œ±ˆè ¤ôùí¥˜¡Ñ¡¥Ì¹…•ÁÑ=É¡Œ°µ…¸œ¤¥±œ ¤íõõtì4(€€€¥˜ …Œ¹¹•½Ñ¥…Ñ•¥¡½¥•Ì¹ÁÕÍ ¡í±ˆèŸÂ~J°€œ­ÑÈ ‰…É…¥¸œ¤±ˆè ¤ôùí¥˜¡Œ¹Í•ÉÙ•¥í±œ ¤íÉ•ÑÕÉ¸íõŒ¹¹•½Ñ¥…Ñ•õÑÉÕ”í½¹ÍĞ¹Àõ5…Ñ ¹É½Õ¹¡Œ¹Á…ä¨¡Œ¹°¹Èø¸ääü¸äÈèÄ¸Àà¤¤íŒ¹Á…äõ¹Àí±œ ¤íÍ¡½İ9½Ñ¥˜¡Œ¹°¹¸¬œè€œ­¹À¤íÑ¡¥Ì¹½Á•¹½Õ¹Ñ•È¡Œ¤íõô¤ì4(€€€¡½¥•Ì¹ÁÕÍ ¡í±ˆèŸŠv0€œ­ÑÈ ‘•±¥¹”œ¤±±Ìè¹¼œ±ˆè ¤ôùíÑ¡¥Ì¹±•…Ù•±¥•¹Ğ¡Œ±™…±Í”¤í±œ ¤íõô¤ì4(€€€¡½¥•Ì¹ÁÕÍ ¡í±ˆéÑÈ ±½Í”œ¤±ˆè ¤ôù±œ ¥ô¤ì4(€€€Ñ¡¥Ì¹½±œ¡Œ¹°¹”¬œ€œ­Œ¹°¹¸±ÑÈ µ½½œ¤¬œè€œ­µ½½‘9…µ”¡Œ¹°¹´¤°4(€€€€€€œˆœ­‘°¬œ‰q¹q»Â~N˜€œ­Œ¹ÁÈ¹”¬œ€œ­Œ¹ÁÈ¹¸¬q»Â~JÀ€œ­Œ¹Á…ä¬q¸œ­ÑÈ µ…Ñ•É¥…°œ¤¬œè€œ­Œ¹½É‘•È¹µ…Ñ•É¥…°¬œàœ­Œ¹½É‘•È¹Õ¹¥ÑÌ¬q¸œ­ÑÈ ÍÑ½¬œ¤¬œè€œ­µ…ÑMÑ½¬¡Œ¹½É‘•È¹µ…Ñ•É¥…°¤¬q¸œ­ÑÈ ‘¥™™¥Õ±Ñäœ¤¬œè€œ­5…Ñ ¹É½Õ¹¡Œ¹½É‘•È¹‘¥™˜¨ÄÀÀ¤¬œ”ğ€œ­Ñ…9…µ”¡Œ¹½É‘•È¹Ñ…œ¤¬¡Œ¹ÕÉœüq»Â~RĞ€œ­ÑÈ ÕÉ•¹Ğœ¤èœœ¤°4(€€€€€¡½¥•Ì¤ì4(€ô4(€½Á•¹AÉ¥¹Ñ•ÉÌ ¥ì4(€€€½¹ÍĞÁÌõ¹ÁÉ¥¹Ñ•ÉÌ¹™¥±Ñ•È¡Àôø…À¹±½­•¤ì4(€€€½¹ÍĞ¡½¥•ÌõÁÌ¹µ…À¡Àôùì4(€€€€€½¹ÍĞ‘…å1½­•õÀ¹¥øÀì4(€€€€€É•ÑÕÉ¸í±ˆè@œ¬¡À¹¥¬Ä¤¬œ€´€œ¬¡À¹‰ÕÍäıÀ¹½É‘•È¹ÁÈ¹”¬œ€œ­5…Ñ ¹É½Õ¹¡À¹ÁÉ½É•ÍÌ¨ÄÀÀ¤¬œ”œé‘…å1½­•ıÑÈ ¹¥¡ÑQ¥Ñ±”œ¤éÑÈ ±½…‘)½ˆœ¤¤±±ÌéÀ¹‰ÕÍåññ‘…å1½­•üœœè½¬œ±ˆè ¤ôùí±œ ¤íÑ¡¥Ì¹½Á•¹AÉ¥¹Ñ•ÉEÕ•Õ”¡À¤íõôì4(€€€ô¤ì4(€€€¡½¥•Ì¹ÁÕÍ ¡í±ˆéÑÈ ±½Í”œ¤±ˆè ¤ôù±œ ¥ô¤ì4(€€€Ñ¡¥Ì¹½±œ ŸÂ~Z£¾â<€œ­ÑÈ ÁÉ¥¹Ñ•ÉQ¥Ñ±”œ¤°œœ°4(€€€€€ÑÈ ™É•”œ¤¬œè€œ­¹ÁÉ¥¹Ñ•ÉÌ¹™¥±Ñ•È¡Àôø…À¹‰ÕÍä˜˜…À¹‰É½­•¸˜˜…À¹±½­•¤¹±•¹Ñ ¬4(€€€€€€q¸œ­ÑÈ ÅÕ•Õ•œ¤¬œè€œ­¹½É‘•ÉÌ¹±•¹Ñ ¬4(€€€€€€q¹q¸œ­ÑÈ µ…¹Õ…±9¥¡Ñ!¥¹Ğœ¤°4(€€€€€¡½¥•Ì¤ì4(€ô4(€½Á•¹AÉ¥¹Ñ•ÉEÕ•Õ”¡À¥ì4(€€€¥˜ …ÁññÀ¹±½­•¥É•ÑÕÉ¸ì4(€€€¥˜¡¹Á¡…Í”ôôô‘…äœ˜™À¹¥øÀ¥íÍ¡½İ9½Ñ¥˜¡ÑÈ ‘…åAÉ¥¹Ñ•É1¥µ¥Ğœ¤°¥¹™¼œ¤íÍ!¥¹Ğ¡ÑÈ ‘…åAÉ¥¹Ñ•É1¥µ¥Ğœ¤¤íÉ•ÑÕÉ¸íô4(€€€¥˜¡À¹‰ÕÍä¥íÍ¡½İ9½Ñ¥˜ @œ¬¡À¹¥¬Ä¤¬œè€œ­À¹½É‘•È¹ÁÈ¹”¬œ€œ­À¹½É‘•È¹ÁÈ¹¸¬œ€´€œ­5…Ñ ¹É½Õ¹¡À¹ÁÉ½É•ÍÌ¨ÄÀÀ¤¬œ”œ¤íÉ•ÑÕÉ¸íô4(€€€½¹ÍĞÅÕ•Õ•õ¹½É‘•ÉÌ¹™¥±Ñ•È¡¼ôø…¹ÁÉ¥¹Ñ•ÉÌ¹Í½µ”¡àôùà¹½É‘•Èôôõ¼¤¤ì4(€€€¥˜ …ÅÕ•Õ•¹±•¹Ñ ¥íÍ¡½İ9½Ñ¥˜¡ÑÈ ¹½A•¹‘¥¹)½‰Ìœ¤°¥¹™¼œ¤íÉ•ÑÕÉ¸íô4(€€€¹‰±½¬õÑÉÕ”ì4(€€€‘½Õµ•¹Ğ¹•Ñ±•µ•¹Ñ	å% Í œ¤¹Ñ•áÑ½¹Ñ•¹ĞõÑÉ˜ ±½…‘AÉ¥¹Ñ•Èœ±í¸éÀ¹¥¬Åô¤ì4(€€€‘½Õµ•¹Ğ¹•Ñ±•µ•¹Ñ	å% ÍÑ½Q…‰Ìœ¤¹¥¹¹•É!Q50ôœœì4(€€€‘½Õµ•¹Ğ¹•Ñ±•µ•¹Ñ	å% ÍÀœ¤¹Ñ•áÑ½¹Ñ•¹ĞõÑÈ ‘…å1½…‘AÉ¥¹Ñ•É•ÍŒœ¤ì4(€€€‘½Õµ•¹Ğ¹•Ñ±•µ•¹Ñ	å% ÍÑ½Ñ¥½¹Ìœ¤¹¥¹¹•É!Q50õÅÕ•Õ•¹µ…À¡¼ôø4(€€€€€€œñ‰ÕÑÑ½¸±…ÍÌô‰•ˆ™¥àˆ½¹±¥¬ô‰…µ”¹Í•¹”¹•ÑM•¹”¡p…åpœ¤¹…ÍÍ¥¹=É‘•ÉQ½AÉ¥¹Ñ•È¡¹ÁÉ¥¹Ñ•ÉÍlœ­À¹¥¬t±¹½É‘•ÉÍlœ­¹½É‘•ÉÌ¹¥¹‘•á=˜¡¼¤¬t¤ˆøœ­¼¹ÁÈ¹”¬œ€œ­¼¹ÁÈ¹¸¬œğ€œ­¼¹°¬œğ€œ­¼¹µ…Ñ•É¥…°¬œàœ­¼¹Õ¹¥ÑÌ¬œğ€œ­¼¹Á…ä¬œğ½‰ÕÑÑ½¸øœ4(€€€€¤¹©½¥¸ œœ¤ì4(€€€‘½Õµ•¹Ğ¹•Ñ±•µ•¹Ñ	å% ÍÑ¼œ¤¹ÍÑå±”¹‘¥ÍÁ±…äô‰±½¬œì4(€€€Í•ÑQ¥µ•½ÕĞ  ¤ôù™½ÕÍA…¹•±¥ÉÍĞ œÍÑ½Ñ¥½¹Ì€¹•ˆœ¤°À¤ì4(€ô4(€…ÍÍ¥¹=É‘•ÉQ½AÉ¥¹Ñ•È¡À±¼¥ì4(€€€¥˜ …Áñğ…½ññÀ¹‰ÕÍåññÀ¹±½­•¥É•ÑÕÉ¸™…±Í”ì4(€€€¥˜¡¹Á¡…Í”ôôô‘…äœ˜™À¹¥øÀ¥íÍ¡½İ9½Ñ¥˜¡ÑÈ ‘…åAÉ¥¹Ñ•É1¥µ¥Ğœ¤°¥¹™¼œ¤íÉ•ÑÕÉ¸™…±Í”íô4(€€€¥˜¡¹‘…äôôôÄ˜˜…¹‘…å	½Õ¡ÑA±…	…Í¥Œ¥íÍ¡½İ9½Ñ¥˜¡ÑÈ ‘…å=¹•M¡½ÁQ¥Àœ¤°¥¹™¼œ¤íÍ!¥¹Ğ¡ÑÈ ‘…å=¹•M¡½ÁQ¥Àœ¤¤í¹½Á•¹M¡½À ÍÑ¬œ¤íÉ•ÑÕÉ¸™…±Í”íô4(€€€¥˜¡¹ÁÉ¥¹Ñ•ÉÌ¹Í½µ”¡àôùà¹½É‘•Èôôõ¼¤¥íÍ¡½İ9½Ñ¥˜¡ÑÈ ©½‰1½…‘•œ¤°¥¹™¼œ¤íÉ•ÑÕÉ¸™…±Í”íô4(€€€¥˜ …ÁÉ•Á…É•=É‘•É5…Ñ•É¥…°¡¼¤¥ì4(€€€€€¼¹İ…¥Ñ¥¹5…Ñ•É¥…°õÑÉÕ”í‘½M…Ù”¡¤ì4(€€€€€Í¡½İ9½Ñ¥˜¡ÑÉ˜ µ¥ÍÍ¥¹=É‘•Èœ±íµ…Ğé¼¹µ…Ñ•É¥…°±Õ¹¥ÑÌé¼¹Õ¹¥ÑÍô¤¬œ€´€œ­¼¹ÁÈ¹¸°•ÉÉ½Èœ¤ì4(€€€€€É•ÑÕÉ¸™…±Í”ì4(€€€ô4(€€€À¹‰ÕÍäõÑÉÕ”íÀ¹½É‘•Èõ¼íÀ¹ÁÉ½É•ÍÌôÀíÀ¹}•Øõ¹Õ±°íÀ¹}Á…Ôõ™…±Í”íÀ¹‰É½­•¸õ™…±Í”íÀ¹}‘…å1½…‘•õÑÉÕ”ì4(€€€À¹}‘…åAÉ¥¹Ñ5Ìõ¹‘…äôôôÄü¡¹‘…åAÉ¥¹ÑÌøôÈüääääääèÈĞÀÀÀ¤é5…Ñ ¹µ…à ÄĞÀÀÀ±¼¹Ñ¥µ”¨àÔÀÀ¤ì4(€€€¥˜¡¹‘…äôôôÄ˜™¼¹µ…Ñ•É¥…°ôôôÁ±„œ˜™¼¹™¥±…µ•¹Ğ˜™¼¹™¥±…µ•¹Ğ¹¥ôôô•¼œ¥¹‘…åUÍ•‘A±…	…Í¥ŒõÑÉÕ”ì4(€€€Ñ¡¥Ì¹ÕÁ‘…Ñ•AÉ¥¹Ñ•ÉY¥ÍÕ…°¡À¹¥¤ì4(€€€‘½M…Ù”¡¤íM`¹½¬ ¤í¹MÑ¼ ¤ì4(€€€Í¡½İ9½Ñ¥˜ @œ¬¡À¹¥¬Ä¤¬œ€œ­ÑÈ ±½…‘•œ¤¬œ€œ­¼¹ÁÈ¹”¬œ€œ­¼¹ÁÈ¹¸°ÍÕ•ÍÌœ¤ì4(€€€Í1½œ @œ¬¡À¹¥¬Ä¤¬œ€œ­ÑÈ ±½…‘•œ¤¬œè€œ­¼¹°¬œ€´€œ­¼¹ÁÈ¹¸¬œ€œ­ÑÈ İ¥Ñ¡5…Ğœ¤¬œ€œ­¼¹™¥±…µ•¹Ğ¹¸¬œ¸œ¤ì4(€€€¥˜¡¹‘…äôôôÄ¥ì4(€€€€€½¹ÍĞµÍœõ¹‘…åAÉ¥¹ÑÌøôÈıÑÈ ‘…å=¹•9¥¡Ñ)½‰Q¥Àœ¤éÑÈ ‘…å=¹•AÉ¥¹ÑQ¥Àœ¤ì4(€€€€€Í¡½İ9½Ñ¥˜¡µÍœ°¥¹™¼œ¤íÍ!¥¹Ğ¡µÍœ¤ì4(€€€ô4(€€€É•ÑÕÉ¸ÑÉÕ”ì4(€ô4(€½µÁ±•Ñ•AÉ¥¹Ğ¡À¥ì4(€€€½¹ÍĞ¼õÀ¹½É‘•È±•…É¹•õ¼¹Á…ä±É•Á…¥¸ôÄ¬¡¼¹™¥±…µ•¹Ğ˜™¼¹™¥±…µ•¹Ğ¹É•ÁñğÀ¤ì4(€€€¹½±¬õ•…É¹•í¹É•Àõ5…Ñ ¹µ…à À±¹É•À­É•Á…¥¸¤í¹ÍÑ…ÑÌ¹•…É¸¬õ•…É¹•í¹‘…å…É¸¬õ•…É¹•í¹‘…åAÉ¥¹ÑÌ¬¬ì4(€€€¹½É‘•ÉÌõ¹½É‘•ÉÌ¹™¥±Ñ•È¡àôùà„ôõ¼¤ì4(€€€À¹‰ÕÍäõ™…±Í”íÀ¹½É‘•Èõ¹Õ±°íÀ¹ÁÉ½É•ÍÌôÀíÀ¹}•Øõ¹Õ±°íÀ¹}Á…Ôõ™…±Í”ì4(€€€Ñ¡¥Ì¹ÕÁ‘…Ñ•AÉ¥¹Ñ•ÉY¥ÍÕ…°¡À¹¥¤ì4(€€€M`¹½¥¸ ¤ì4(€€€½¹ÍĞÁœõÑ¡¥Ì¹Á™à˜™Ñ¡¥Ì¹Á™ámÀ¹¥‘tì4(€€€¥˜¡Áœ¥ì4(€€€€€½¹ÍĞ½¥¸õÑ¡¥Ì¹…‘¹Ñ•áĞ¡Áœ¹Áà±Áœ¹Áä´ÜÈ°œ¬œ­•…É¹•±í™½¹ÑM¥é”èœÄÉÁàœ±½±½Èèœ™™ÜÀÀœ±™½¹Ñ…µ¥±äèAÉ•ÍÌMÑ…ÉĞ€É@ô¤¹Í•Ñ=É¥¥¸ ¸Ô¤¹Í•Ñ•ÁÑ  ÄÈ¤ì4(€€€€€Ñ¡¥Ì¹Ñİ••¹Ì¹…‘¡íÑ…É•ÑÌé½¥¸±äé½¥¸¹ä´ĞÔ±…±Á¡„èÀ±‘ÕÉ…Ñ¥½¸èÄÀÀÀ±½¹½µÁ±•Ñ”è ¤ôù½¥¸¹‘•ÍÑÉ½ä ¥ô¤ì4(€€€ô4(€€€Í¡½İ9½Ñ¥˜ ŸŠr€œ­¼¹ÁÈ¹”¬œ€œ­¼¹ÁÈ¹¸¬œƒŠP€¬œ­•…É¹•°µ½¹•äœ¤ì4(€€€Í1½œ ŸŠr@œ¬¡À¹¥¬Ä¤¬œè€œ­¼¹ÁÈ¹”¬œ€œ­¼¹ÁÈ¹¸¬œ€œ­ÑÈ İ¥Ñ¡5…Ğœ¤¬œ€œ¬¡¼¹™¥±…µ•¹Ğı¼¹™¥±…µ•¹Ğ¹¸é¼¹µ…Ñ•É¥…°¤¬œƒŠP€¬œ­•…É¹•¤ì4(€€€‘½M…Ù”¡¤ì4(€ô4(€½Á•¹MÑ½¬ ¥ì4(€€€¹½Á•¹M¡½À ÍÑ¬œ¤ì4(€ô4(€½Á•¹Q…ˆ ¥ì4(€€€Ñ¡¥Ì¹½±œ ŸŠj„€œ­ÑÈ ‰½…É‘Q¥Ñ±”œ¤°œœ°4(€€€€€ÑÈ Í½±…Èœ¤¬œè€œ¬¡¹ÕÁœ¹Í½±…ÈüŸŠb¾â<€œ­ÑÈ ¥µµÕ¹”œ¤èŸŠv0œ¤¬4(€€€€€€q¹UALè€œ¬¡¹ÕÁœ¹ÕÁÌÈüŸÂ~R,%¹‘ÕÍÑÉ¥…°œé¹ÕÁœ¹ÕÁÌÄüŸÂ~R,€œ­ÑÈ ‰…Í¥Œœ¤èŸŠv0œ¤¬4(€€€€€€q¹•¹•É…‘½Èè€œ¬¡¹ÕÁœ¹•¸üŸŠnôœèŸŠv0œ¤¬4(€€€€€€q¹AÉ½Ñ•Ñ½Èè€œ¬¡¹ÕÁœ¹ÁÉ½ĞüŸŠrœèŸŠv0œ¤°4(€€€€€mí±ˆéÑÈ ½M¡½Àœ¤¬œƒŠHœ±±Ìè½¬œ±ˆè ¤ôùí±œ ¤í¹½Á•¹M¡½À ¤íõô±í±ˆéÑÈ ±½Í”œ¤±ˆè ¤ôù±œ ¥õt¤ì4(€ô4(€½±œ¡¹…µ”±µ½½±Ñ•áĞ±¡½¥•Ì¥ì4(€€€½¹ÍĞ°õ0¹™¥¹¡Œôù¹…µ”¹¥¹±Õ‘•Ì¡Œ¹¸¤¤ì4(€€€½¹ÍĞ…Øõ‘½Õµ•¹Ğ¹•Ñ±•µ•¹Ñ	å% ‘…Øœ¤ì4(€€€…Ø¹Ñ•áÑ½¹Ñ•¹Ğõ°ı°¹”èŸÂ~Z£¾â<œì4(€€€¥˜¡°¥í½¹ÍĞÈô¡°¹ŒøøÄØ¤˜ÈÔÔ±œô¡°¹Œøøà¤˜ÈÔÔ±ˆõ°¹Œ˜ÈÔÔí…Ø¹ÍÑå±”¹‰…­É½Õ¹‘½±½ÈôÉ‰„ œ­È¬œ°œ­œ¬œ°œ­ˆ¬œ°¸È¤œíô4(€€€•±Í”…Ø¹ÍÑå±”¹‰…­É½Õ¹‘½±½ÈôœŒÁ„ÀàÄØœì4(€€€‘½Õµ•¹Ğ¹•Ñ±•µ•¹Ñ	å% ‘¸œ¤¹Ñ•áÑ½¹Ñ•¹Ğõ¹…µ”ì4(€€€‘½Õµ•¹Ğ¹•Ñ±•µ•¹Ñ	å% ‘´œ¤¹Ñ•áÑ½¹Ñ•¹Ğõµ½½ì4(€€€‘½Õµ•¹Ğ¹•Ñ±•µ•¹Ñ	å% ‘Ğœ¤¹Ñ•áÑ½¹Ñ•¹ĞõÑ•áĞì4(€€€‘½Õµ•¹Ğ¹•Ñ±•µ•¹Ñ	å% ‘‰Ìœ¤¹¥¹¹•É!Q50õ¡½¥•Ì¹µ…À ¡Œ±¤¤ôø4(€€€€€€œñ‰ÕÑÑ½¸±…ÍÌô‰‘ˆ€œ¬¡Œ¹±Íñğœœ¤¬œˆ½¹±¥¬ô‰¹}‘ˆ œ­¤¬œ¤ˆøœ­Œ¹±ˆ¬œğ½‰ÕÑÑ½¸øœ¤¹©½¥¸ œœ¤ì4(€€€¹}‘ õ¡½¥•Ìì4(€€€‘½Õµ•¹Ğ¹•Ñ±•µ•¹Ñ	å% ‘±œœ¤¹ÍÑå±”¹‘¥ÍÁ±…äô‰±½¬œì4(€€€Í•ÑQ¥µ•½ÕĞ  ¤ôùí½¹ÍĞˆõ‘½Õµ•¹Ğ¹ÅÕ•ÉåM•±•Ñ½È œ‘‰Ì€¹‘ˆœ¤í¥˜¡ˆ¥ˆ¹™½ÕÌ ¤íô°À¤ì4(€€€Ñ¡¥Ì¹‘±=Á•¸õÑÉÕ”ì4(€ô4(€ÕÁ‘…Ñ•AÉ¥¹Ñ•ÉÌ¡‘Ğ¥ì4(€€€¹ÁÉ¥¹Ñ•ÉÌ¹™½É… ¡Àôùì4(€€€€€¥˜ …À¹‰ÕÍåññÀ¹‰É½­•¹ññÀ¹}•ÙññÀ¹}Á…Ô¥É•ÑÕÉ¸ì4(€€€€€¥˜¡À¹¥øÀ¥É•ÑÕÉ¸ì4(€€€€€À¹ÁÉ½É•ÍÌ¬õ‘Ğ¼¡À¹}‘…åAÉ¥¹Ñ5Íññ5…Ñ ¹µ…à ÄĞÀÀÀ±À¹½É‘•È¹Ñ¥µ”¨àÔÀÀ¤¤©¹Í5Õ±Ğ©•¹•ÉåMÁ•• ¤ì4(€€€€€¥˜¡À¹ÁÉ½É•ÍÌøôÄ¥Ñ¡¥Ì¹½µÁ±•Ñ•AÉ¥¹Ğ¡À¤ì4(€€€ô¤ì4(€€€Ñ¡¥Ì¹Á™à¹™½É…  ¡Áœ±¤¤ôùì4(€€€€€½¹ÍĞÀõ¹ÁÉ¥¹Ñ•ÉÍm¥tí¥˜ …À¥É•ÑÕÉ¸ì4(€€€€€¥˜¡¤øÀ¥íÑ¡¥Ì¹¡¥‘•…åAÉ¥¹Ñ•È¡Áœ¹œ±Áœ¹ÍÀ±Áœ¹±Ğ±Áœ¹‰•¹ ¤íÉ•ÑÕÉ¸íô4(€€€€€½¹ÍĞŒõÀ¹½É‘•ÈıÀ¹½É‘•È¹ÁÈ¹ŒèÁàÕ‰Œá™„ì4(€€€€€½¹ÍĞ…Ñ¥Ù•…äõÀ¹‰ÕÍä˜™À¹¥ôôôÀì4(€€€€€¥˜¡Áœ¹ÍÀ¥Í•ÑAÉ¥¹Ñ•ÉMÁÉ¥Ñ•MÑ…Ñ”¡Áœ¹ÍÀ±ì¸¸¹À±‰ÕÍäé…Ñ¥Ù•…åô¤ì4(€€€€€•±Í”‘É…İAÉ¥¹Ñ•È¡Áœ¹œ±…Ñ¥Ù•…ä±À¹‰É½­•¸±À¹ÁÉ½É•ÍÌ±Œ¤ì4(€€€€€¥˜¡À¹±½­•¥Áœ¹±Ğ¹Í•ÑQ•áĞ ŸÂ~RHœ¤¹Í•Ñ½±½È œŒÈÈÈÈĞĞœ¤ì4(€€€€€•±Í”¥˜¡À¹‰É½­•¸¥Áœ¹±Ğ¹Í•ÑQ•áĞ ŸŠjƒ¾â=I=Qœ¤¹Í•Ñ½±½È œ™˜ÑÙ„œ¤ì4(€€€€€•±Í”¥˜¡…Ñ¥Ù•…ä¥Áœ¹±Ğ¹Í•ÑQ•áĞ %5AI%5q¸œ­5…Ñ ¹É½Õ¹¡À¹ÁÉ½É•ÍÌ¨ÄÀÀ¤¬œ”œ¤¹Í•Ñ½±½È œŒÑ‘™˜äÄœ¤ì4(€€€€€•±Í”¥˜¡À¹‰ÕÍä¥Áœ¹±Ğ¹Í•ÑQ•áĞ 1%MQq¹9=!œ¤¹Í•Ñ½±½È œŒÕ‰Œá™„œ¤ì4(€€€€€•±Í”Áœ¹±Ğ¹Í•ÑQ•áĞ 1%	Iœ¤¹Í•Ñ½±½È œŒÉ„ÈÀÔÀœ¤ì4(€€€ô¤ì4(€ô4(€ÕÁ‘…Ñ•AÉ¥¹Ñ•ÉY¥ÍÕ…°¡¤¥ì4(€€€½¹ÍĞÁœõÑ¡¥Ì¹Á™à˜™Ñ¡¥Ì¹Á™ám¥t±Àõ¹ÁÉ¥¹Ñ•ÉÌ˜™¹ÁÉ¥¹Ñ•ÉÍm¥tí¥˜ …Áñğ…À¥É•ÑÕÉ¸ì4(€€€¥˜¡¤øÀ¥íÑ¡¥Ì¹¡¥‘•…åAÉ¥¹Ñ•È¡Áœ¹œ±Áœ¹ÍÀ±Áœ¹±Ğ±Áœ¹‰•¹ ¤íÉ•ÑÕÉ¸íô4(€€€½¹ÍĞŒõÀ¹½É‘•ÈıÀ¹½É‘•È¹ÁÈ¹ŒèÁàÕ‰Œá™„ì4(€€€½¹ÍĞ…Ñ¥Ù•…äõÀ¹‰ÕÍä˜™À¹¥ôôôÀ˜˜…À¹}Á…Ôì4(€€€¥˜¡Áœ¹ÍÀ¥ì4(€€€€€Áœ¹ÍÀ¹Í•ÑY¥Í¥‰±”¡ÑÉÕ”¤ì4(€€€€€Í•ÑAÉ¥¹Ñ•ÉMÁÉ¥Ñ•MÑ…Ñ”¡Áœ¹ÍÀ±ì¸¸¹À±‰ÕÍäé…Ñ¥Ù•…åô¤ì4(€€€€€¥˜¡Áœ¹œ¥Áœ¹œ¹Í•ÑY¥Í¥‰±”¡™…±Í”¤ì4(€€€õ•±Í•ì4(€€€€€¥˜¡Áœ¹œ¥Áœ¹œ¹Í•ÑY¥Í¥‰±”¡ÑÉÕ”¤ì4(€€€€€‘É…İAÉ¥¹Ñ•È¡Áœ¹œ±…Ñ¥Ù•…ä±À¹‰É½­•¸±À¹ÁÉ½É•ÍÌ±Œ¤ì4(€€€ô4(€€€¥˜¡À¹±½­•¥Áœ¹±Ğ¹Í•ÑQ•áĞ ŸÂ~RHœ¤¹Í•Ñ½±½È œŒÈÈÈÈĞĞœ¤ì4(€€€•±Í”¥˜¡À¹‰É½­•¸¥Áœ¹±Ğ¹Í•ÑQ•áĞ ŸŠjƒ¾â=I=Qœ¤¹Í•Ñ½±½È œ™˜ÑÙ„œ¤ì4(€€€•±Í”¥˜¡…Ñ¥Ù•…ä¥Áœ¹±Ğ¹Í•ÑQ•áĞ %5AI%5q¸œ­5…Ñ ¹É½Õ¹¡À¹ÁÉ½É•ÍÌ¨ÄÀÀ¤¬œ”œ¤¹Í•Ñ½±½È œŒÑ‘™˜äÄœ¤ì4(€€€•±Í”¥˜¡À¹‰ÕÍä¥Áœ¹±Ğ¹Í•ÑQ•áĞ 1%MQq¹9=!œ¤¹Í•Ñ½±½È œŒÕ‰Œá™„œ¤ì4(€€€•±Í”Áœ¹±Ğ¹Í•ÑQ•áĞ 1%	Iœ¤¹Í•Ñ½±½È œŒÉ„ÈÀÔÀœ¤ì4(€ô4(€É•™É•Í¡AÉ¥¹Ñ•ÉMÁÉ¥Ñ•Ì ¥ì4(€€€¥˜ …Ñ¡¥Ì¹Á™à¥É•ÑÕÉ¸ì4(€€€Ñ¡¥Ì¹Á™à¹™½É… ¡Áœôùì4(€€€€€¥˜¡Áœ¹ÍÁñğ…Ñ¡¥Ì¹Ñ•áÑÕÉ•Ì¹•á¥ÍÑÌ¡AI%9QI}MMP¤¥É•ÑÕÉ¸ì4(€€€€€½¹ÍĞ¤õÑ¡¥Ì¹Á™à¹¥¹‘•á=˜¡Áœ¤ì4(€€€€€Áœ¹ÍÀõÉ•…Ñ•AÉ¥¹Ñ•ÉMÁÉ¥Ñ”¡Ñ¡¥Ì±Áœ¹Áà±Áœ¹Áä¤ì4(€€€€€¥˜¡Áœ¹ÍÀ¥íÁœ¹ÍÀ¹Í•ÑM…±”¡¤ôôôÀı5…Ñ ¹µ…à Ì¸È±Ñ¡¥Ì¹É½½´ ¤¹Ì¤èÌ¸Ô¤íÁœ¹œ¹Í•ÑY¥Í¥‰±”¡™…±Í”¤íô(€€€€€¥˜¡¤øÀ¥Ñ¡¥Ì¹¡¥‘•…åAÉ¥¹Ñ•È¡Áœ¹œ±Áœ¹ÍÀ±Áœ¹±Ğ¤ì4(€€€€€•±Í”Ñ¡¥Ì¹ÕÁ‘…Ñ•AÉ¥¹Ñ•ÉY¥ÍÕ…°¡¤¤ì4(€€€ô¤ì4(€ô4(€ÕÁ‘…Ñ•!U ¥ì4(€€€‘½Õµ•¹Ğ¹•Ñ±•µ•¹Ñ	å% ¡œœ¤¹Ñ•áÑ½¹Ñ•¹Ğõ¹½±ì4(€€€É•¹‘•ÉI•Á!U ¤ì4(€€€‘½Õµ•¹Ğ¹•Ñ±•µ•¹Ñ	å% ¡Ìœ¤¹Ñ•áÑ½¹Ñ•¹Ğõ¹ÍÑÉ•ÍÌì4(€€€‘½Õµ•¹Ğ¹•Ñ±•µ•¹Ñ	å% ¡Ñ˜œ¤¹ÍÑå±”¹İ¥‘Ñ ô¡5…Ñ ¹µ…à À±Ñ¡¥Ì¹Ñ¥µ•È½Ñ¡¥Ì¹‘ÕÈ¤¨ÄÀÀ¤¬œ”œì4(€€€¥˜¡Ñ¡¥Ì¹Í1‰°¥Ñ¡¥Ì¹Í1‰°¹Í•ÑQ•áĞ¡Ñ¡¥Ì¹ÍÑ­QáĞ ¤¤ì4(€ô4(€‘…å=‰©•Ñ¥Ù•I•…‘ä ¥ì4(€€€½¹ÍĞ±½…‘•ô¡¹ÁÉ¥¹Ñ•ÉÍññmt¤¹™¥±Ñ•È¡ÀôùÀ¹½É‘•È¤¹±•¹Ñ ì4(€€€½¹ÍĞÅÕ•Õ•ô¡¹½É‘•ÉÍññmt¤¹±•¹Ñ ì4(€€€¥˜¡¹‘…äôôôÄ¤4(€€€€€É•ÑÕÉ¸€¡¹‘…å=É‘ñğÀ¤øôÌ˜˜¡¹‘…åAÉ¥¹ÑÍñğÀ¤øôÈ˜™ÅÕ•Õ•øôÄ˜˜¡¹‘…å	½Õ¡ÑA±…	…Í¥ññ¹‘…åUÍ•‘A±…	…Í¥Œ¤ì4(€€€¥˜¡¹‘…äôôôÈ¤(€€€€€É•ÑÕÉ¸€¡¹‘…å=É‘ñğÀ¤øôĞ˜˜ ¡¹‘…åAÉ¥¹ÑÍñğÀ¤­±½…‘•¤øôÌ˜˜¡¹‘…å	½Õ¡Ñ5…Ñ•É¥…±ñğÀ¤øôÄ˜™ÅÕ•Õ•øôÄì(€€€¥˜¡¹‘…äôôôÌ¤(€€€€€É•ÑÕÉ¸€¡¹‘…å=É‘ñğÀ¤øôĞ˜˜ ¡¹‘…åAÉ¥¹ÑÍñğÀ¤­±½…‘•¤øôÈ˜™ÅÕ•Õ•øôÈì(€€€É•ÑÕÉ¸™…±Í”ì4(€ô4(€µ…å‰•…ÍÑ±½Í•…ä ¥ì4(€€€¥˜¡Ñ¡¥Ì¹™…ÍÑ±½Í•…åññ¹‰±½­ññ¹Á¡…Í”„ôô‘…äœ¥É•ÑÕÉ¸ì4(€€€¥˜ …Ñ¡¥Ì¹‘…å=‰©•Ñ¥Ù•I•…‘ä ¤¥É•ÑÕÉ¸ì4(€€€Ñ¡¥Ì¹™…ÍÑ±½Í•…äõÑÉÕ”ì4(€€€Í¡½İ9½Ñ¥˜¡ÑÈ ‘…å½…±½µÁ±•Ñ”œ¤°ÍÕ•ÍÌœ¤ì4(€€€Í!¥¹Ğ¡ÑÈ ‘…å½…±½µÁ±•Ñ”œ¤¤ì4(€€€Ñ¡¥Ì¹Ñ¥µ”¹‘•±…å•‘…±° ÄÀÀÀ° ¤ôùí¥˜¡¹Á¡…Í”ôôô‘…äœ˜˜…¹‰±½¬¥Ñ¡¥Ì¹•¹‘…ä ¤íô¤ì4(€ô4(€ÕÁ‘…Ñ”¡}Ğ±‘Ğ¥ì(€€€¥˜¡¹Á¡…Í”„ôô‘…äññ¹‰±½¬¥É•ÑÕÉ¸ì(€€€Ñ¡¥Ì¹Ñ¥µ•Èõ5…Ñ ¹µ…à À±Ñ¡¥Ì¹Ñ¥µ•Èµ‘Ğ¤ì(€€€¥˜¡Ñ¡¥Ì¹Ñ¥µ•ÈğôÀ¥ì(€€€€€¥˜¡Ñ¡¥Ì¹‘…å=‰©•Ñ¥Ù•I•…‘ä ¤¥íÑ¡¥Ì¹•¹‘…ä ¤íÉ•ÑÕÉ¸íô(€€€€€¥˜ …Ñ¡¥Ì¹½Ù•ÉÑ¥µ•]…É¹•¥ì(€€€€€€€Ñ¡¥Ì¹½Ù•ÉÑ¥µ•]…É¹•õÑÉÕ”ì(€€€€€€€Í¡½İ9½Ñ¥˜¡ÑÈ ‘…åQ…Í­ÍA•¹‘¥¹œœ¤°İ…É¹¥¹œœ¤ì(€€€€€€€Í!¥¹Ğ¡ÑÈ ‘…åQ…Í­ÍA•¹‘¥¹œœ¤¤ì(€€€€€ô(€€€ô(€€€½¹ÍĞÁĞõÑ¡¥Ì¹Ñ¥µ•È½Ñ¡¥Ì¹‘ÕÈì4(€€€¥˜¡ÁĞğ¸È¥‘½Õµ•¹Ğ¹•Ñ±•µ•¹Ñ	å% ¡Ñ˜œ¤¹ÍÑå±”¹‰…­É½Õ¹ôœ™˜ÑÙ„œì4(€€€¥˜¡¹‘…äôôôÄ˜˜…Ñ¡¥Ì¹¡•…ÁMÑ½­Q¥À˜™ÁĞğ¸Äà¥ì4(€€€€€Ñ¡¥Ì¹¡•…ÁMÑ½­Q¥ÀõÑÉÕ”ì4(€€€€€Í¡½İ9½Ñ¥˜¡ÑÈ ¡•…ÁA±…I¥Í¬œ¤°¥¹™¼œ¤ì4(€€€€€Í1½œ ŸÂ~J„€œ­ÑÈ ¡•…ÁA±…I¥Í¬œ¤¤ì4(€€€ô4(€€€½¹ÍĞ¹ĞõÁĞğ¸ÄÔì4(€€€¥˜¡¹Ğ„ôõÑ¡¥Ì¹Ñ¥É•¥íÑ¡¥Ì¹Ñ¥É•õ¹Ğí‘É…İA±…å•È¡Ñ¡¥Ì¹ÁÈ±™…±Í”±¹Ğ¤íô4(€€€½¹ÍĞ¬õÑ¡¥Ì¹­•åÌí±•ĞÙàôÀ±ÙäôÀí½¹ÍĞÍÁõ•¹•ÉåMÁ•• ¤ì4(€€€¥˜¡¬¹„¹¥Í½İ¹ññ¬¹±Ğ¹¥Í½İ¸¥íÙàô´ÄØà©ÍÁíÑ¡¥Ì¹‘¥Èô´Äíô4(€€€¥˜¡¬¹¹¥Í½İ¹ññ¬¹ÉĞ¹¥Í½İ¸¥íÙàôÄØà©ÍÁíÑ¡¥Ì¹‘¥ÈôÄíô4(€€€¥˜¡¬¹Ü¹¥Í½İ¹ññ¬¹ÕÀ¹¥Í½İ¸¥Ùäô´ÄÀÄ©ÍÁì4(€€€¥˜¡¬¹Ì¹¥Í½İ¹ññ¬¹‘¸¹¥Í½İ¸¥ÙäôÄÀÄ©ÍÁì4(€€€Ñ¡¥Ì¹µ½Ù•A±…å•È¡Ùà©‘Ğ¼ÄÀÀÀ±Ùä©‘Ğ¼ÄÀÀÀ¤ì4(€€€Ñ¡¥Ì¹Á¥ÈõÍ•ÑA±…å•ÉMÁÉ¥Ñ•MÑ…Ñ”¡Ñ¡¥Ì¹ÁMÀ±Ùà±Ùä±Ñ¡¥Ì¹Á¥È¤ì4(€€€¥˜ …Ñ¡¥Ì¹ÁMÀ¥Ñ¡¥Ì¹Á±…å•È¹Í…±•`õÑ¡¥Ì¹‘¥Èì4(€€€€¼¼]…±¬µ‰½ˆ¥ÌÁÕÉ•±ä½Íµ•Ñ¥Œè½™™Í•ĞÑ¡”ÍÁÉ¥Ñ”¡¥±°¹•Ù•ÈÑ¡”½¹Ñ…¥¹•ÈÌ±½¥…°d4(€€€€¼¼€¡Ñ¡…Ğd‘É¥Ù•Ì½±±¥Í¥½¸°¥¹Ñ•É…Ñ¥½¸É…¹”…¹äµÍ½ÉÑ¥¹œƒŠPµÕÑ…Ñ¥¹œ¥Ğµ…‘”Ñ¡¥¹Ì©¥ÑÑ•È¤¸4(€€€¥˜¡ÙáññÙä¥íÑ¡¥Ì¹İĞ¬õ‘ĞíÑ¡¥Ì¹ÍĞ¬õ‘Ğí¥˜¡Ñ¡¥Ì¹İĞøÄàÀ¥íÑ¡¥Ì¹İ‰xôÄíÑ¡¥Ì¹İĞôÀíõ¥˜¡Ñ¡¥Ì¹ÍĞøÌØÀ¥íÑ¡¥Ì¹ÍĞôÀíM`¹ÍÑ•À ¤íõô4(€€€•±Í”Ñ¡¥Ì¹İˆôÀì4(€€€½¹ÍĞ‰½‰PõÑ¡¥Ì¹ÁMÁññÑ¡¥Ì¹ÁÈí¥˜¡‰½‰P¥‰½‰P¹äô¡ÙáññÙä¤˜™Ñ¡¥Ì¹İˆü´ÈèÀì4(€€€Ñ¡¥Ì¹åM½ÉÑ]½É± ¤ì4(€€€½¹ÍĞ9•…ÈõÑ¡¥Ì¹¹•…É•ÍÑ±¥•¹Ğ ¤ì4(€€€Ñ¡¥Ì¹¹•…É±¥•¹Ğõ9•…Èì4(€€€±•Ğ¹•…Èõ9•…Èıíàé9•…È¹Ğ¹à±äé9•…È¹Ğ¹ä±ÑåÁ”è±¥•¹Ğœ±±¥•¹Ğé9•…È±±‰°è±¥¬½€œ­9•…È¹°¹¹ôé¹Õ±°±µõ9•…ÈüÀèààì4(€€€Ñ¡¥Ì¹%¹™½É… ¡¥Ğôùì4(€€€€€½¹ÍĞõA¡…Í•È¹5…Ñ ¹¥ÍÑ…¹”¹	•Ñİ••¸¡Ñ¡¥Ì¹Á±…å•È¹à±Ñ¡¥Ì¹Á±…å•È¹ä±¥Ğ¹à±¥Ğ¹ä¤ì4(€€€€€¥˜¡ñµ¥íµõí¹•…Èõ¥Ğíô4(€€€ô¤ì4(€€€Ñ¡¥Ì¹¹•…Èõ¹•…Èì4(€€€¥˜¡¹•…È¥ì4(€€€€€½¹ÍĞÁÕ±Í”ô¸ÔÔ¬¸ÌÔ©5…Ñ ¹Í¥¸¡Ñ¡¥Ì¹Ñ¥µ”¹¹½Ü¼ÄÈÀ¤ì4(€€€€€Ñ¡¥Ì¹¥1‰°¹Í•ÑY¥Í¥‰±”¡ÑÉÕ”¤¹Í•Ñ±Á¡„ ¸ÜÈ­ÁÕ±Í”¨¸Èà¤¹Í•ÑM…±” Ä­ÁÕ±Í”¨¸ÀÔ¤¹Í•ÑQ•áĞ¡¹•…È¹±‰°¤¹Í•ÑA½Í¥Ñ¥½¸¡¹•…È¹à±¹•…È¹ä´ĞÈ¤ì4(€€€€€Í!¥¹Ğ¡¹•…È¹ÑåÁ”ôôô±¥•¹Ğœü±¥¬‰½Ñ½¹•Ìğ½8½HğÍŒœè±¥¬¼mtœ¤ì4(€€€ô4(€€€•±Í•íÑ¡¥Ì¹¥1‰°¹Í•ÑY¥Í¥‰±”¡™…±Í”¤íÍ!¥¹Ğ ±¥¬½‰©•Ñ½Ìğ]M€¬œ¤íô4(€€€Ñ¡¥Ì¹Q¥µ•È¬õ‘Ğí¥˜¡Ñ¡¥Ì¹Q¥µ•ÈøõÑ¡¥Ì¹%¹Ğ¥íÑ¡¥Ì¹Q¥µ•ÈôÀíÑ¡¥Ì¹ÍÁ…İ¸ ¤íô4(€€€Ñ¡¥Ì¹±¥•¹ÑÌ¹™½É… ¡Œôùì4(€€€€€¥˜¡Œ¹Í•ÉÙ•‘ññŒ¹İ…±¬¥É•ÑÕÉ¸ì4(€€€€€Œ¹Á…Ğ´õ‘Ğí½¹ÍĞÀõ5…Ñ ¹µ…à À±Œ¹Á…Ğ½Œ¹µ…á@¤ì4(€€€€€Œ¹Á‰¹İ¥‘Ñ ôĞØ©ÀíŒ¹Á‰¹™¥±±½±½ÈõÀğ¸ÌÔüÁá™˜ÑÙ„éÀğ¸ØÔüÁá™™”ÔØØèÁàÑ‘™˜äÄì4(€€€€€¥˜¡Œ¹Á…ĞğôÀ¥Ñ¡¥Ì¹±•…Ù•±¥•¹Ğ¡Œ±ÑÉÕ”¤ì4(€€€ô¤ì4(€€€Ñ¥­5…Ñ”¡‘Ğ¤íÑ¡¥Ì¹ÕÁ‘…Ñ•AÉ¥¹Ñ•ÉÌ¡‘Ğ¤íÑ¡¥Ì¹ÕÁ‘…Ñ•!U ¤íÑ¡¥Ì¹µ…å‰•…ÍÑ±½Í•…ä ¤ì4(€ô4(€•¹‘…ä ¥ì(€€€¥˜¡¹Á¡…Í”„ôô‘…äœ¥É•ÑÕÉ¸ì(€€€¥˜ …Ñ¡¥Ì¹‘…å=‰©•Ñ¥Ù•I•…‘ä ¤¥ì(€€€€€Ñ¡¥Ì¹Ñ¥µ•ÈôÀì(€€€€€¥˜ …Ñ¡¥Ì¹½Ù•ÉÑ¥µ•]…É¹•¥ì(€€€€€€€Ñ¡¥Ì¹½Ù•ÉÑ¥µ•]…É¹•õÑÉÕ”ì(€€€€€€€Í¡½İ9½Ñ¥˜¡ÑÈ ‘…åQ…Í­ÍA•¹‘¥¹œœ¤°İ…É¹¥¹œœ¤ì(€€€€€€€Í!¥¹Ğ¡ÑÈ ‘…åQ…Í­ÍA•¹‘¥¹œœ¤¤ì(€€€€€ô(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€¹Á¡…Í”ôÑÉ…¹Í¥Ñ¥½¸œí¹‰±½¬õÑÉÕ”í‘½M…Ù”¡¤íÑ¡¥Ì¹Í•¹”¹Á…ÕÍ” ¤ì4(€€€½¹ÍĞ…•ÁÑ•õ¹‘…å=É±±½ÍĞõ5…Ñ ¹µ…à À±¹‘…å±¤µ¹‘…å=É¤±ÅÕ•Õ”õ¹½É‘•ÉÌ¹±•¹Ñ ì4(€€€½¹ÍĞÕÉ•¹Ğõ¹½É‘•ÉÌ¹™¥±Ñ•È¡¼ôù¼¹ÕÉœ¤¹±•¹Ñ ì4(€€€½¹ÍĞÅÕ•Õ•Y…±Õ”õ¹½É‘•ÉÌ¹É•‘Õ” ¡ÍÕ´±¼¤ôùÍÕ´­¼¹Á…ä°À¤ì4(€€€½¹ÍĞÉ•Á•±Ñ„õ¹É•À´¡¹‘…åMÑ…ÉÑI•Áññ¹É•À¤ì4(€€€±•Ğµ½½õÑÈ ½½‘M¡¥™Ğœ¤ì4(€€€¥˜¡±½ÍĞøÈ¥µ½½õÑÈ ÍÁ¥åM¡¥™Ğœ¤ì4(€€€•±Í”¥˜¡ÅÕ•Õ”øôĞ¥µ½½õÑÈ ‰¥EÕ•Õ”œ¤ì4(€€€•±Í”¥˜¡ÅÕ•Õ”ôôôÀ¥µ½½õÑÈ Í±½İ…äœ¤ì4(€€€½¹ÍĞ¹½Ñ”õÅÕ•Õ”4(€€€€€€üÑÈ ÁÉ•Á9¥¡Ğœ¤4(€€€€€€èÑÈ ¹½I•…‘å=É‘•ÉÌœ¤ì4(€€€Í¡½İ…å±½Í”¡í‘…äé¹‘…ä±µ½½±±¥•¹ÑÌé¹‘…å±¤±…•ÁÑ•±±½ÍĞ±ÅÕ•Õ”±ÕÉ•¹Ğ±ÅÕ•Õ•Y…±Õ”±É•Àé¹É•À±É•Á•±Ñ„±ÍÑÉ•ÍÌé¹ÍÑÉ•ÍÌ±¹½Ñ•ô° ¤ôùì4(€€€€€‘½QÉ…¹Ì ŸÂ~2d€€œ­ÑÈ ¹¥¡ÑQ¥Ñ±”œ¤±ÑÉ˜ ¹¥¡ÑEÕ•Õ”œ±íÅÕ•Õ•ô¤° ¤ôùíÑ¡¥Ì¹Í•¹”¹ÍÑ½À ¤íÑ¡¥Ì¹Í•¹”¹ÍÑ…ÉĞ 9¥¡Ğœ¤íô¤ì4(€€€ô¤ì4(€ô4)ô4(
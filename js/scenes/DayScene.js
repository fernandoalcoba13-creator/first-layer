// ═══ DAY SCENE ═══
// Day phase: clients arrive, player accepts/negotiates/rejects orders, manages stock & shop.
class DayScene extends Phaser.Scene{
  constructor(){super({key:'Day'});}
  room(){
    const s=Math.min(this.W/420,this.H/270);
    return {s,ox:(this.W-420*s)/2,oy:8};
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
      R(32,105,30,36),R(134,125,36,54),R(232,128,54,36),R(310,126,58,54),R(362,126,38,54),
      R(185,204,26,24),R(225,204,30,24),R(268,199,42,26),R(176,153,24,12),
      R(47,166,26,22),R(381,166,26,22),R(178,88,38,24),R(112,89,14,14)
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
    const minY=this.H*.28,maxY=this.H*.82,minX=28,maxX=this.W-28;
    const nx=Phaser.Math.Clamp(this.player.x+dx,minX,maxX);
    if(!this.hitsSolid(nx,this.player.y))this.player.x=nx;
    const ny=Phaser.Math.Clamp(this.player.y+dy,minY,maxY);
    if(!this.hitsSolid(this.player.x,ny))this.player.y=ny;
  }
  create(){
    this.W=this.scale.width;this.H=this.scale.height;
    this.beta=BETA_DAYS[G.day]||BETA_DAYS[3];
    G.phase='day';G.stress=0;G.block=false;G.dayEarn=0;G.dayOrd=0;G.dayCli=0;G.dayPrints=0;G.dayBought=0;G.nightDone=0;G.nFixes=0;G.pActive=false;G.dayMod=null;
    BGM.playDay();
    G.dayStartGold=G.gold;G.dayStartRep=G.rep;
    const freshDayOne=G.day===1&&!(G.orders&&G.orders.length)&&!G.dayBoughtPlaBasic&&!G.dayUsedPlaBasic;
    if(G.day!==1){G.dayBoughtPlaBasic=false;G.dayUsedPlaBasic=false;}
    if(freshDayOne){G.stk={pla:{eco:0,std:0,pro:0},petg:{eco:0,std:0,pro:0},tpu:{basic:0,premium:0,pro:0},resin:{basic:0,std:0,pro:0},parts:3};G.cons={coffee:1,mate:0,bar:1,sandwich:0,cleaner:1};G.dayBoughtPlaBasic=false;G.dayUsedPlaBasic=false;ensureStockShape();ensureConsumables();}
    G.energy=100;G.mateActive=false;G.mateTimer=0;G.mateCount=3;
    this.clients=[];this.clientQueue=this._shuffleCL();this.cTimer=0;this.cInt=this.beta.interval-(G.upg.ig?2500:0)-(G.emp.juli2?2000:0);
    this.dur=this.beta.duration||90000;this.timer=this.dur;this.IA=[];this.near=null;this.nearClient=null;this.dlgOpen=false;
    this.wt=0;this.st=0;this.wb=0;this.dir=1;this.tired=false;this._ysort=[];
    this.initPrinters();this.buildWorld();this.createPlayer();this.setupKeys();this.setupPointer();
    loadPrinterAssetsAsync(this,()=>this.refreshPrinterSprites());
    loadPlayerAssetsAsync(this,()=>this.refreshPlayerSprite());
    loadClientAssetsAsync(this);
    loadEnvironmentPropsAsync(this,()=>this.placeEnvironmentProps());
    this.checkStory();this.updateHUD();
    this.time.delayedCall(this.beta.firstSpawn,()=>this.spawn());
    this.time.delayedCall(this.beta.secondSpawn,()=>this.spawn());
    document.getElementById('ptag').className='ptag day';
    document.getElementById('ptag').textContent='☀️ '+tr('day')+' '+G.day;
    document.getElementById('hday').textContent='📅 '+tr('dayDyn')+' '+G.day;
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
    this.bgG=this.add.graphics();drawBG(this.bgG,W,H,false);this.bgImg=applyRoomBackground(this,this.bgG,W,H,false);
    this.windowMood=addRoomWindowMood(this,false);
    const cY=H*.75,cg=this.add.graphics();this.counterG=cg;
    cg.fillStyle(0x28200e,.55);cg.fillRect(W*.23,cY,W*.54,32);
    cg.fillStyle(0x7a5a18,.75);cg.fillRect(W*.23,cY,W*.54,4);
    cg.fillStyle(0x1a1010,.45);cg.fillRect(W*.23+18,cY-20,28,18);
    this.shopSign=this.add.text(W*.24+129,cY+9,'🖨️  '+shopDisplayName().toUpperCase()+'  🖨️',{fontSize:'11px',color:'#ffb347',fontFamily:'Press Start 2P'}).setOrigin(.5,0);
    const counterPt=this.rp(128,176);
    this.IA.push({x:counterPt.x,y:counterPt.y,type:'counter',lbl:'Click/E '+tr('counter')});
    const stockPt=this.rp(130,106),sx=stockPt.x,sy=stockPt.y,sg=this.add.graphics();this.stockG=sg;
    sg.lineStyle(1,0x2a2040,.5);sg.strokeRect(sx-44,sy-68,88,88);
    [0x5bc8fa,0xff7eb3,0x4dff91,0xffe566,0x9d7fe3,0xff6644].forEach((c,i)=>{
      const x=sx-28+i%3*28,y=sy-56+Math.floor(i/3)*30;
      sg.fillStyle(c,.8);sg.fillCircle(x,y,9);sg.fillStyle(0x07060f);sg.fillCircle(x,y,4);
    });
    this.sLbl=this.add.text(sx,sy+28,this.stkTxt(),{fontSize:'9px',color:'#3a2a60',fontFamily:'Press Start 2P',align:'center'}).setOrigin(.5,0);
    this.IA.push({x:sx,y:sy,type:'stock',lbl:'Click/E '+tr('stockTitle')});
    const shopPt=this.rp(178,88),ux=shopPt.x,uy=shopPt.y,ug=this.add.graphics();this.shopG=ug;
    ug.fillStyle(0x07110a,.14);ug.fillRect(ux-40,uy-28,80,52);
    ug.lineStyle(1,0x2aff72,.55);ug.strokeRect(ux-40,uy-28,80,52);
    this.add.text(ux,uy,'🔧\n'+tr('shopTitle'),{fontSize:'9px',color:'#1eff72',fontFamily:'Press Start 2P',align:'center'}).setOrigin(.5);
    this.IA.push({x:ux,y:uy,type:'shop',lbl:'Click/E '+tr('shopTitle')});
    const tabPt=this.rp(112,89),tx=tabPt.x,ty=tabPt.y;this.tZone={x:tx,y:ty};this.tblG=this.add.graphics();this.drawTbl(false);
    this.IA.push({x:tx,y:ty,type:'tab',lbl:'Click/E '+tr('boardTitle')});
    const printerPt=this.rp(185,176);
    this.pGfx=[];const psp=(W*.37)/4,mainPrinterX=printerPt.x,mainPrinterY=printerPt.y,printerScale=printerPt.s;
    for(let i=0;i<4;i++){
      const px=i===0?mainPrinterX:W*.6+i*psp+psp/2,py=i===0?mainPrinterY:H*.55;
      // Each printer sits ON a bench/table so it doesn't float on the floor. The bench top is
      // drawn at the printer's base Y; its own base sits a bit lower so the printer reads as resting on it.
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
  placeEnvironmentProps(){
    if(this.envPropsPlaced)return;
    this.envPropsPlaced=true;
    const P=(x,y)=>this.rp(x,y),S=this.room().s;
    if(this.stockG)this.stockG.setVisible(false);
    if(this.counterG)this.counterG.setVisible(false);
    if(this.shopSign)this.shopSign.setVisible(false);
    [
      ['prop_shelf_5',32,105,S,1],
      ['prop_poster_idea',88,92,S,1],
      ['prop_electricity',112,89,S,3],
      ['prop_shelf_2',134,125,S,1],
      ['prop_filament_violet',128,82,S,3],
      ['prop_filament_pink',139,82,S,3],
      ['prop_filament_violet',150,82,S,3],
      ['prop_filament_cyan',128,105,S,3],
      ['prop_filament_blue',139,105,S,3],
      ['prop_toolbox',176,118,S,2],
      ['prop_workbench_2',232,96,S,1],
      ['prop_workbench_1',232,128,S,2],
      ['prop_shelf_1',310,126,S,1],
      ['prop_filament_yellow',294,82,S,3],
      ['prop_filament_orange',306,82,S,3],
      ['prop_filament_yellow',318,82,S,3],
      ['prop_filament_pink',294,112,S,3],
      ['prop_filament_violet',306,112,S,3],
      ['prop_shelf_2',362,126,S,1],
      ['prop_filament_green',354,82,S,3],
      ['prop_filament_red',365,105,S,3],
      ['prop_filament_blue',354,112,S,3],
      ['prop_box_2',47,166,S,1],
      ['prop_box_3',32,168,S,1],
      ['prop_box_4',381,166,S,1],
      ['prop_box_3',392,171,S,1],
      ['prop_shelf_4_1',185,204,S,2],
      ['prop_shelf_4',225,204,S,2],
      ['prop_shelf_4_2',268,199,S,2],
      ['prop_shelf_7',310,184,S,2]
    ].forEach(p=>{const q=P(p[1],p[2]),sp=addEnvSprite(this,p[0],q.x,q.y,p[3],p[4]);if(p[0]==='prop_electricity')this.powerSprite=sp;
      // Tall furniture the player can walk behind joins the y-sort pool; flat floor props stay low.
      if(sp&&/workbench|shelf_1|shelf_2|shelf_5|shelf_7/.test(p[0]))this._ysort.push({o:sp,baseY:q.y});});
    this.ySortWorld();
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
    const start=this.rp(127,178);
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
    document.getElementById('obj').textContent=makerDisplayName()+' · '+shopDisplayName();
  }
  announceStanding(){
    const s=repStanding();
    const label={bad:'⚠️ '+tr('repBad'),norm:'• '+tr('repNorm'),good:'⭐ '+tr('repGood')}[s.key];
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
    if(this.clients.length>=5||G.phase!=='day'||G.dayCli>=(this.beta.maxClients||5))return;
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
    const target=this.rp(127+slot*26,178),tX=target.x,yP=target.y;
    const pat=order.pat*1000;
    const ct=this.add.container(-50,yP).setDepth(4);
    const cs=createClientSprite(this,cl,idx);if(cs)cs.setScale(2.6);
    const cg=this.add.graphics();if(cs)ct.add(cs);else{drawClient(cg,cl,idx);ct.add(cg);}
    const bb=this.add.graphics();bb.fillStyle(0xf8f8f8,.97);bb.fillRoundedRect(-42,-116,84,34,4);bb.fillTriangle(-6,-82,6,-82,0,-74);ct.add(bb);
    ct.add(this.add.text(0,-101,pr.e+' $'+pay,{fontSize:'10px',color:'#111',fontFamily:'Press Start 2P'}).setOrigin(.5));
    if(urg)ct.add(this.add.text(0,-121,'🔴 '+tr('urgent'),{fontSize:'8px',color:'#f22',fontFamily:'Press Start 2P'}).setOrigin(.5));
    const pbB=this.add.rectangle(0,-69,46,4,0x111122).setOrigin(.5);
    const pbF=this.add.rectangle(-23,-69,46,4,urg?0xff4d6a:0x4dff91).setOrigin(0,.5);
    ct.add(pbB);ct.add(pbF);
    const co={ct,cg,cs,pbF,cl,pr,pay,urg,order,pat,maxP:pat,served:false,walk:true,tX,slot,baseY:yP};
    co.stepTw=this.tweens.add({targets:ct,y:yP-3,duration:150,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    this.tweens.add({targets:ct,x:tX,duration:640,ease:'Power2',onComplete:()=>this.stopClientWalk(co)});
    this.clients.push(co);G.dayCli++;
    if(G.emp.lucas&&this.clients.filter(c=>!c.served).length===1)
      this.time.delayedCall(1800,()=>{if(!co.served)this.acceptOrd(co,'auto');});
    sLog(cl.e+' '+cl.n+': "'+clLine(cl)+'" — '+pr.e+' $'+pay);
  }
  nextClientSlot(){
    const used=this.clients.filter(c=>!c.served).map(c=>c.slot);
    for(let i=0;i<5;i++)if(!used.includes(i))return i;
    return -1;
  }
  nearestClient(){
    let best=null,md=76;
    this.clients.forEach(c=>{
      if(c.served||c.walk)return;
      const d=Phaser.Math.Distance.Between(this.player.x,this.player.y,c.ct.x,c.ct.y);
      if(d<md){md=d;best=c;}
    });
    return best;
  }
  clientAt(x,y,range){
    let best=null,md=range;
    this.clients.forEach(c=>{
      if(c.served||c.walk)return;
      const d=Phaser.Math.Distance.Between(x,y,c.ct.x,c.ct.y);
      if(d<md){md=d;best=c;}
    });
    return best;
  }
  interactiveAt(x,y,range){
    let best=null,md=range;
    this.IA.forEach(it=>{
      const d=Phaser.Math.Distance.Between(x,y,it.x,it.y);
      if(d<md){md=d;best=it;}
    });
    return best;
  }
  _shuffleCL(){
    const a=[...CL];
    for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    return a;
  }
  stopClientWalk(c){
    c.walk=false;
    if(c.stepTw)c.stepTw.stop();
    c.ct.y=c.baseY;
    if(c.cs&&c.cs.anims)c.cs.anims.pause();
  }
  acceptOrd(c,mode){
    // Guard against a stale dialog: if this client already left (patience ran out, rejected,
    // or was served), a late Accept click must not create a ghost order.
    if(!c||c.served||this.clients.indexOf(c)<0)return false;
    const canPrint=matStock(c.order.material)>=c.order.units;
    G.orders.push({pr:c.pr,cl:c.cl.n,pay:c.pay,urg:c.urg,time:c.order.time,diff:c.order.diff,risk:c.order.risk,tag:c.order.tag,material:c.order.material,units:c.order.units,waitingMaterial:!canPrint});
    G.dayOrd++;G.dayEarn+=c.pay;G.stats.ord++;
    if(this.sLbl)this.sLbl.setText(this.stkTxt());
    this.leaveClient(c,false);SFX.ok();
    if(mode==='auto')showNotif('👦 '+tr('lucasAccepted')+': '+c.pr.e+' '+c.pr.n);
    sLog('✅ '+c.cl.n+': '+c.pr.e+' '+c.pr.n+' — '+(canPrint?tr('orderReady'):trf('missingOrder',{mat:c.order.material,units:c.order.units}))+'. '+tr('queueCount')+': '+G.orders.length);
    if(G.day===1&&G.dayOrd===1)this.time.delayedCall(500,()=>{
      showNotif(tr('dayOneShopTip'),'info');sHint(tr('dayOneShopTip'));
      this.time.delayedCall(900,()=>{if(G.phase==='day'&&!matStock('pla'))G.openShop('stk');});
    });
    doSave(G);
    return true;
  }
  leaveClient(c,ang){
    c.served=true;
    if(ang){G.rep=Math.max(0,G.rep-5);G.stress=Math.min(100,G.stress+10);SFX.err();showNotif('😤 '+c.cl.n+' '+tr('customerLeft')+'. -5 REP','error');}
    c.walk=true;if(c.cs&&c.cs.anims)c.cs.anims.resume();if(c.stepTw)c.stepTw.stop();c.stepTw=this.tweens.add({targets:c.ct,y:c.baseY-3,duration:150,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    this.tweens.add({targets:c.ct,x:-80,duration:560,onComplete:()=>{if(c.stepTw)c.stepTw.stop();c.ct.destroy();}});
    this.clients=this.clients.filter(x=>x!==c);
  }
  interact(t){
    SFX.step();
    if(t.type==='client')this.openCounter(t.client);
    else if(t.type==='counter')this.openCounter();
    else if(t.type==='printer')this.openPrinterQueue(G.printers[t.pid]);
    else if(t.type==='printers')this.openPrinters();
    else if(t.type==='stock')G.openShop('stk');
    else if(t.type==='shop')G.openShop();
    else if(t.type==='tab')this.openTab();
  }
  openCounter(target){
    const w=this.clients.filter(c=>!c.served);
    if(!w.length){showNotif(tr('noWaitingClients'));return;}
    const c=target&&!target.served?target:(this.nearClient||w[0]);
    const dl=clLine(c.cl);
    // Bargain is a one-shot gamble per client — offering it again would let the player
    // compound the price bump indefinitely, so it disappears once used.
    const choices=[{lb:'✅ '+tr('accept')+' ($'+c.pay+')',cls:'ok',cb:()=>{if(this.acceptOrd(c,'man'))cDlg();}}];
    if(!c.negotiated)choices.push({lb:'💬 '+tr('bargain'),cb:()=>{if(c.served){cDlg();return;}c.negotiated=true;const np=Math.round(c.pay*(c.cl.gr>.99?.92:1.08));c.pay=np;cDlg();showNotif(c.cl.n+': $'+np);this.openCounter(c);}});
    choices.push({lb:'❌ '+tr('decline'),cls:'no',cb:()=>{this.leaveClient(c,false);cDlg();}});
    choices.push({lb:tr('close'),cb:()=>cDlg()});
    this.oDlg(c.cl.e+' '+c.cl.n,tr('mood')+': '+moodName(c.cl.m),
      '"'+dl+'"\n\n📦 '+c.pr.e+' '+c.pr.n+'\n💰 $'+c.pay+'\n'+tr('material')+': '+c.order.material+' x'+c.order.units+'\n'+tr('stock')+': '+matStock(c.order.material)+'\n'+tr('difficulty')+': '+Math.round(c.order.diff*100)+'% | '+tagName(c.order.tag)+(c.urg?'\n🔴 '+tr('urgent'):''),
      choices);
  }
  openPrinters(){
    const ps=G.printers.filter(p=>!p.locked);
    const choices=ps.map(p=>{
      const dayLocked=p.id>0;
      return {lb:'P'+(p.id+1)+' - '+(p.busy?p.order.pr.e+' '+Math.round(p.progress*100)+'%':dayLocked?tr('nightTitle'):tr('loadJob')),cls:p.busy||dayLocked?'':'ok',cb:()=>{cDlg();this.openPrinterQueue(p);}};
    });
    choices.push({lb:tr('close'),cb:()=>cDlg()});
    this.oDlg('🖨️ '+tr('printerTitle'),'',
      tr('free')+': '+G.printers.filter(p=>!p.busy&&!p.broken&&!p.locked).length+
      '\n'+tr('queued')+': '+G.orders.length+
      '\n\n'+tr('manualNightHint'),
      choices);
  }
  openPrinterQueue(p){
    if(!p||p.locked)return;
    if(G.phase==='day'&&p.id>0){showNotif(tr('dayPrinterLimit'),'info');sHint(tr('dayPrinterLimit'));return;}
    if(p.busy){showNotif('P'+(p.id+1)+': '+p.order.pr.e+' '+p.order.pr.n+' - '+Math.round(p.progress*100)+'%');return;}
    const queued=G.orders.filter(o=>!G.printers.some(x=>x.order===o));
    if(!queued.length){showNotif(tr('noPendingJobs'),'info');return;}
    G.block=true;
    document.getElementById('sh').textContent=trf('loadPrinter',{n:p.id+1});
    document.getElementById('stoTabs').innerHTML='';
    document.getElementById('sp').textContent=tr('dayLoadPrinterDesc');
    document.getElementById('stoActions').innerHTML=queued.map(o=>
      '<button class="eb fix" onclick="game.scene.getScene(\'Day\').assignOrderToPrinter(G.printers['+p.id+'],G.orders['+G.orders.indexOf(o)+'])">'+o.pr.e+' '+o.pr.n+' | '+o.cl+' | '+o.material+' x'+o.units+' | $'+o.pay+'</button>'
    ).join('');
    document.getElementById('sto').style.display='block';
    setTimeout(()=>focusPanelFirst('#stoActions .eb'),0);
  }
  assignOrderToPrinter(p,o){
    if(!p||!o||p.busy||p.locked)return false;
    if(G.phase==='day'&&p.id>0){showNotif(tr('dayPrinterLimit'),'info');return false;}
    if(G.day===1&&!G.dayBoughtPlaBasic){showNotif(tr('dayOneShopTip'),'info');sHint(tr('dayOneShopTip'));G.openShop('stk');return false;}
    if(G.printers.some(x=>x.order===o)){showNotif(tr('jobLoaded'),'info');return false;}
    if(!prepareOrderMaterial(o)){
      o.waitingMaterial=true;doSave(G);
      showNotif(trf('missingOrder',{mat:o.material,units:o.units})+' - '+o.pr.n,'error');
      return false;
    }
    p.busy=true;p.order=o;p.progress=0;p._ev=null;p._pau=false;p.broken=false;p._dayLoaded=true;
    p._dayPrintMs=G.day===1?(G.dayPrints>=2?999999:24000):Math.max(14000,o.time*8500);
    if(G.day===1&&o.material==='pla'&&o.filament&&o.filament.id==='eco')G.dayUsedPlaBasic=true;
    this.updatePrinterVisual(p.id);
    doSave(G);SFX.ok();G.cSto();
    showNotif('P'+(p.id+1)+' '+tr('loaded')+' '+o.pr.e+' '+o.pr.n,'success');
    sLog('P'+(p.id+1)+' '+tr('loaded')+': '+o.cl+' - '+o.pr.n+' '+tr('withMat')+' '+o.filament.n+'.');
    if(G.day===1){
      const msg=G.dayPrints>=2?tr('dayOneNightJobTip'):tr('dayOnePrintTip');
      showNotif(msg,'info');sHint(msg);
    }
    return true;
  }
  completePrint(p){
    const o=p.order,earned=o.pay,repGain=1+(o.filament&&o.filament.rep||0);
    G.gold+=earned;G.rep=Math.max(0,G.rep+repGain);G.stats.earn+=earned;G.dayEarn+=earned;G.dayPrints++;
    G.orders=G.orders.filter(x=>x!==o);
    p.busy=false;p.order=null;p.progress=0;p._ev=null;p._pau=false;
    this.updatePrinterVisual(p.id);
    SFX.coin();
    const pg=this.pGfx&&this.pGfx[p.id];
    if(pg){
      const coin=this.add.text(pg.px,pg.py-72,'+$'+earned,{fontSize:'12px',color:'#ffd700',fontFamily:'Press Start 2P'}).setOrigin(.5).setDepth(12);
      this.tweens.add({targets:coin,y:coin.y-45,alpha:0,duration:1000,onComplete:()=>coin.destroy()});
    }
    showNotif('✅ '+o.pr.e+' '+o.pr.n+' — +$'+earned,'money');
    sLog('✅ P'+(p.id+1)+': '+o.pr.e+' '+o.pr.n+' '+tr('withMat')+' '+(o.filament?o.filament.n:o.material)+' — +$'+earned);
    doSave(G);
  }
  openStock(){
    G.openShop('stk');
  }
  openTab(){
    this.oDlg('⚡ '+tr('boardTitle'),'',
      tr('solar')+': '+(G.upg.solar?'☀️ '+tr('immune'):'❌')+
      '\nUPS: '+(G.upg.ups2?'🔋 Industrial':G.upg.ups1?'🔋 '+tr('basic'):'❌')+
      '\nGenerador: '+(G.upg.gen?'⛽':'❌')+
      '\nProtector: '+(G.upg.prot?'✅':'❌'),
      [{lb:tr('goShop')+' →',cls:'ok',cb:()=>{cDlg();G.openShop();}},{lb:tr('close'),cb:()=>cDlg()}]);
  }
  oDlg(name,mood,text,choices){
    const cl=CL.find(c=>name.includes(c.n));
    const av=document.getElementById('dav');
    av.textContent=cl?cl.e:'🖨️';
    if(cl){const r=(cl.c>>16)&255,gg=(cl.c>>8)&255,b=cl.c&255;av.style.backgroundColor='rgba('+r+','+gg+','+b+',.2)';}
    else av.style.backgroundColor='#0a0816';
    document.getElementById('dn').textContent=name;
    document.getElementById('dm').textContent=mood;
    document.getElementById('dt').textContent=text;
    document.getElementById('dbs').innerHTML=choices.map((c,i)=>
      '<button class="db '+(c.cls||'')+'" onclick="G._dcb('+i+')">'+c.lb+'</button>').join('');
    G._dch=choices;
    document.getElementById('dlg').style.display='block';
    setTimeout(()=>{const b=document.querySelector('#dbs .db');if(b)b.focus();},0);
    this.dlgOpen=true;
  }
  updatePrinters(dt){
    G.printers.forEach(p=>{
      if(!p.busy||p.broken||p._ev||p._pau)return;
      if(p.id>0)return;
      p.progress+=dt/(p._dayPrintMs||Math.max(14000,p.order.time*8500))*G.sMult*energySpeed();
      if(p.progress>=1)this.completePrint(p);
    });
    this.pGfx.forEach((pg,i)=>{
      const p=G.printers[i];if(!p)return;
      if(i>0){this.hideDayPrinter(pg.g,pg.sp,pg.lt,pg.bench);return;}
      const c=p.order?p.order.pr.c:0x5bc8fa;
      const activeDay=p.busy&&p.id===0;
      if(pg.sp)setPrinterSpriteState(pg.sp,{...p,busy:activeDay});
      else drawPrinter(pg.g,activeDay,p.broken,p.progress,c);
      if(p.locked)pg.lt.setText('🔒').setColor('#222244');
      else if(p.broken)pg.lt.setText('⚠️ROTA').setColor('#ff4d6a');
      else if(activeDay)pg.lt.setText('IMPRIME\n'+Math.round(p.progress*100)+'%').setColor('#4dff91');
      else if(p.busy)pg.lt.setText('LISTA\nNOCHE').setColor('#5bc8fa');
      else pg.lt.setText('LIBRE').setColor('#2a2050');
    });
  }
  updatePrinterVisual(i){
    const pg=this.pGfx&&this.pGfx[i],p=G.printers&&G.printers[i];if(!pg||!p)return;
    if(i>0){this.hideDayPrinter(pg.g,pg.sp,pg.lt,pg.bench);return;}
    const c=p.order?p.order.pr.c:0x5bc8fa;
    const activeDay=p.busy&&p.id===0&&!p._pau;
    if(pg.sp){
      pg.sp.setVisible(true);
      setPrinterSpriteState(pg.sp,{...p,busy:activeDay});
      if(pg.g)pg.g.setVisible(false);
    }else{
      if(pg.g)pg.g.setVisible(true);
      drawPrinter(pg.g,activeDay,p.broken,p.progress,c);
    }
    if(p.locked)pg.lt.setText('🔒').setColor('#222244');
    else if(p.broken)pg.lt.setText('⚠️ROTA').setColor('#ff4d6a');
    else if(activeDay)pg.lt.setText('IMPRIME\n'+Math.round(p.progress*100)+'%').setColor('#4dff91');
    else if(p.busy)pg.lt.setText('LISTA\nNOCHE').setColor('#5bc8fa');
    else pg.lt.setText('LIBRE').setColor('#2a2050');
  }
  refreshPrinterSprites(){
    if(!this.pGfx)return;
    this.pGfx.forEach(pg=>{
      if(pg.sp||!this.textures.exists(PRINTER_ASSET))return;
      const i=this.pGfx.indexOf(pg);
      pg.sp=createPrinterSprite(this,pg.px,pg.py);
      if(pg.sp){pg.sp.setScale(i===0?Math.max(3.65,this.W/420*.8):3.5);pg.g.setVisible(false);}
      if(i>0)this.hideDayPrinter(pg.g,pg.sp,pg.lt);
      else this.updatePrinterVisual(i);
    });
  }
  updateHUD(){
    document.getElementById('hg').textContent=G.gold;
    renderRepHUD();
    document.getElementById('hs').textContent=G.stress;
    document.getElementById('htf').style.width=(Math.max(0,this.timer/this.dur)*100)+'%';
    if(this.sLbl)this.sLbl.setText(this.stkTxt());
  }
  dayObjectiveReady(){
    const loaded=(G.printers||[]).filter(p=>p.order).length;
    const queued=(G.orders||[]).length;
    if(G.day===1)
      return (G.dayOrd||0)>=3&&(G.dayPrints||0)>=2&&queued>=1&&(G.dayBoughtPlaBasic||G.dayUsedPlaBasic);
    if(G.day===2)
      return (G.dayOrd||0)>=4&&((G.dayPrints||0)+loaded)>=3&&(G.dayBought||0)>=1;
    if(G.day===3)
      return G.pCount>=2&&((G.dayPrints||0)+loaded)>=2&&(G.dayOrd||0)>=4;
    return false;
  }
  maybeFastCloseDay(){
    if(this.fastCloseDay||G.block||G.phase!=='day')return;
    if(!this.dayObjectiveReady())return;
    this.fastCloseDay=true;
    showNotif(tr('dayGoalComplete'),'success');
    sHint(tr('dayGoalComplete'));
    this.time.delayedCall(1000,()=>{if(G.phase==='day'&&!G.block)this.endDay();});
  }
  update(_t,dt){
    if(G.phase!=='day'||G.block)return;
    this.timer-=dt;if(this.timer<=0){this.endDay();return;}
    const pct=this.timer/this.dur;
    if(pct<.2)document.getElementById('htf').style.background='#ff4d6a';
    if(G.day===1&&!this.cheapStockTip&&pct<.18){
      this.cheapStockTip=true;
      showNotif(tr('cheapPlaRisk'),'info');
      sLog('💡 '+tr('cheapPlaRisk'));
    }
    const nt=pct<.15;
    if(nt!==this.tired){this.tired=nt;drawPlayer(this.pGr,false,nt);}
    const k=this.keys;let vx=0,vy=0;const spd=energySpeed();
    if(k.a.isDown||k.lt.isDown){vx=-168*spd;this.dir=-1;}
    if(k.d.isDown||k.rt.isDown){vx=168*spd;this.dir=1;}
    if(k.w.isDown||k.up.isDown)vy=-101*spd;
    if(k.s.isDown||k.dn.isDown)vy=101*spd;
    this.movePlayer(vx*dt/1000,vy*dt/1000);
    this.pDir=setPlayerSpriteState(this.pSp,vx,vy,this.pDir);
    if(!this.pSp)this.player.scaleX=this.dir;
    // Walk-bob is purely cosmetic: offset the sprite child, never the container's logical Y
    // (that Y drives collision, interaction range and y-sorting — mutating it made things jitter).
    if(vx||vy){this.wt+=dt;this.st+=dt;if(this.wt>180){this.wb^=1;this.wt=0;}if(this.st>360){this.st=0;SFX.step();}}
    else this.wb=0;
    const bobT=this.pSp||this.pGr;if(bobT)bobT.y=(vx||vy)&&this.wb?-2:0;
    this.ySortWorld();
    const cNear=this.nearestClient();
    this.nearClient=cNear;
    let near=cNear?{x:cNear.ct.x,y:cNear.ct.y,type:'client',client:cNear,lbl:'Click/E '+cNear.cl.n}:null,md=cNear?0:88;
    this.IA.forEach(it=>{
      const d=Phaser.Math.Distance.Between(this.player.x,this.player.y,it.x,it.y);
      if(d<md){md=d;near=it;}
    });
    this.near=near;
    if(near){
      const pulse=.55+.35*Math.sin(this.time.now/120);
      this.iLbl.setVisible(true).setAlpha(.72+pulse*.28).setScale(1+pulse*.05).setText(near.lbl).setPosition(near.x,near.y-42);
      sHint(near.type==='client'?'Click botones | A/N/R | Esc':'Click o [E]');
    }
    else{this.iLbl.setVisible(false);sHint('Click objetos | WASD + E');}
    this.cTimer+=dt;if(this.cTimer>=this.cInt){this.cTimer=0;this.spawn();}
    this.clients.forEach(c=>{
      if(c.served||c.walk)return;
      c.pat-=dt;const p=Math.max(0,c.pat/c.maxP);
      c.pbF.width=46*p;c.pbF.fillColor=p<.35?0xff4d6a:p<.65?0xffe566:0x4dff91;
      if(c.pat<=0)this.leaveClient(c,true);
    });
    tickMate(dt);this.updatePrinters(dt);this.updateHUD();this.maybeFastCloseDay();
  }
  endDay(){
    if(G.phase!=='day')return;
    G.phase='transition';G.block=true;doSave(G);this.scene.pause();
    const accepted=G.dayOrd,lost=Math.max(0,G.dayCli-G.dayOrd),queue=G.orders.length;
    const urgent=G.orders.filter(o=>o.urg).length;
    const queueValue=G.orders.reduce((sum,o)=>sum+o.pay,0);
    const repDelta=G.rep-(G.dayStartRep||G.rep);
    let mood=tr('goodShift');
    if(lost>2)mood=tr('spicyShift');
    else if(queue>=4)mood=tr('bigQueue');
    else if(queue===0)mood=tr('slowDay');
    const note=queue
      ? tr('prepNight')
      : tr('noReadyOrders');
    showDayClose({day:G.day,mood,clients:G.dayCli,accepted,lost,queue,urgent,queueValue,rep:G.rep,repDelta,stress:G.stress,note},()=>{
      doTrans('🌙  '+tr('nightTitle'),trf('nightQueue',{queue}),()=>{this.scene.stop();this.scene.start('Night');});
    });
  }
}

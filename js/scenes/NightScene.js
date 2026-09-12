// ═══ NIGHT SCENE ═══
// Night phase: printers work autonomously, failures and power outages happen,
// player runs to inspect/repair and to the breaker panel.
class NightScene extends Phaser.Scene{
  constructor(){super({key:'Night'});}
  room(){
    if(!this.roomLayout)this.roomLayout=workshopLayout(this.W,this.H,NIGHT_ROOM_W,NIGHT_ROOM_H,8);
    return {s:this.roomLayout.scale,ox:this.roomLayout.ox,oy:this.roomLayout.oy};
  }
  rp(x,y){
    const r=this.room();
    return {x:r.ox+x*r.s,y:r.oy+y*r.s,s:r.s};
  }
  printerSlots(){
    // Measured 26x34 baked frames; see qa/night-room-art.json for the exact bounds.
    // The first three sit on the central bench; the fourth uses the storage rack.
    return [[157,111],[187,111],[241,111],[350,107]].map(p=>this.rp(p[0],p[1]));
  }
  fitPrinterSprite(sp){
    if(!sp)return null;
    return sp.setScale(this.room().s);
  }
  solidRects(){
    const s=this.room().s,R=(x,y,w,h)=>{
      const p=this.rp(x,y);
      return new Phaser.Geom.Rectangle(p.x-w*s/2,p.y-h*s,w*s,h*s);
    };
    return [
      R(26.5,189,31,64),      // coffee station at its current sprite position
      R(107,126,38,18),       // left filament shelf base
      R(199,127,112,18),      // central printer bench base
      R(288.5,127,57,18),     // tool workbench base
      R(363.5,127,85,18),     // upper-right printer shelf base
      R(200.5,204,79,24),     // office desk, leaving the chair approachable
      R(250,203,14,11),       // plant pot beside the office desk
      R(49.5,260,75,65),      // lower-left filament rack
      R(394.5,211,23,67),     // right tall box stack
      R(372,211,18,20),       // open box beside that stack
      R(382.5,258,43,46),     // separate lower piles, not the empty floor between them
      R(314.5,258,15,31),
      R(340,258,26,29)
    ];
  }
  footRect(x=this.player.x,y=this.player.y){
    const s=this.room().s;
    return new Phaser.Geom.Rectangle(x-3.5*s,y-4.5*s,7*s,4.5*s);
  }
  hitsSolid(x,y){
    const f=this.footRect(x,y);
    return this.solidRects().some(r=>Phaser.Geom.Intersects.RectangleToRectangle(f,r));
  }
  movePlayer(dx,dy){
    const room=this.room(),minY=room.oy+106*room.s,maxY=room.oy+244*room.s;
    const minX=room.ox+12*room.s,maxX=room.ox+(420-12)*room.s;
    dx=Phaser.Math.Clamp(this.player.x+dx,minX,maxX)-this.player.x;
    dy=Phaser.Math.Clamp(this.player.y+dy,minY,maxY)-this.player.y;
    // Sample the whole move so a slow frame cannot jump across a thin footprint.
    const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/(2*room.s)));
    for(let i=0;i<steps;i++){
      const nx=Phaser.Math.Clamp(this.player.x+dx/steps,minX,maxX);
      if(!this.hitsSolid(nx,this.player.y))this.player.x=nx;
      const ny=Phaser.Math.Clamp(this.player.y+dy/steps,minY,maxY);
      if(!this.hitsSolid(this.player.x,ny))this.player.y=ny;
    }
  }
  create(){
    if(G.betaResult){G.showBetaEnd();this.scene.pause();return;}
    this.W=this.scale.width;this.H=this.scale.height;
    // Phaser reuses this scene instance after Night 1. Its display objects were
    // destroyed on stop, so Night 2 must rebuild the same workshop dressing.
    this.envPropsPlaced=false;this.nightRoomLayers=null;this.nightObjectsLayer=null;this.roomLayout=null;this.powerSprite=null;this.bgImg=null;this.windowMood=null;
    ['dlg','evp','miniGame','bkg'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});
    this.beta=BETA_DAYS[G.day]||BETA_DAYS[3];
    G.phase='night';G.block=false;
    BGM.playNight();
    this._nightRun={};
    this.events.once('shutdown',()=>{
      this._nightRun=null;
      if(G._mini){clearInterval(G._mini.tick);G._mini=null;}
    });
    this.dur=80000;this.el=0;this.aEv=null;this.pObjs=[];this.near=null;G.nFixes=0;
    this.earn=0;this.done=0;G.nightDone=0;G.breakerFixes=0;G.lastPowerResolved=null;this.wt=0;this.st=0;this.wb=0;this.dir=1;this._actBusy=false;this.nightOvertimeWarned=false;this.fastCloseNight=false;
    this.startPwr=(G.stats&&G.stats.pwr)||0;
    const tabPt=this.rp(24,70);
    this.bkOrd=[];this.bkNext=0;this.tZone={x:tabPt.x,y:tabPt.y};
    this.breakerAccess=this.rp(55,117);
    if(G.syncPrinters)G.syncPrinters();
    G.printers.forEach(p=>{if(p.order&&!p.broken&&!p.locked){p.busy=true;p._dayLoaded=false;}});
    this.buildWorld();this.createPlayer();this.setupKeys();this.setupPointer();
    this.cameras.main.setZoom(1.08);
    this.cameras.main.centerOn(this.W/2,this.H/2);
    loadPrinterAssetsAsync(this,()=>this.refreshPrinterSprites());
    loadPlayerAssetsAsync(this,()=>this.refreshPlayerSprite());
    loadBenchyAsync(this,()=>this.refreshBenchySprites());
    this.schedPwr();this.schedEvs();
    document.getElementById('ptag').className='ptag night';
    document.getElementById('ptag').textContent='🌙 '+tr('night')+' — '+tr('dayDyn')+' '+G.day;
    document.getElementById('pov').className='';
    document.getElementById('phud').style.display='none';
    sLog(G.orders.length?tr('choosePrinterJob'):tr('noOrdersToPrint'));
    sHint(tr('assignHint'));
    setSaveCheckpoint(G,'night');
    if(G.menuOpen)this.scene.pause();
  }
  assignOrders(){
    const av=G.printers.filter(p=>!p.broken&&!p.locked);
    const queued=G.orders.filter(o=>!G.printers.some(p=>p.order===o));
    av.filter(p=>!p.busy&&!p.order).forEach((p,i)=>{
      const o=queued[i];if(!o)return;
      if(!prepareOrderMaterial(o)){o.waitingMaterial=true;showNotif(trf('missingOrder',{mat:o.material,units:o.units})+' - '+o.pr.n,'error');return;}
      p.busy=true;p.order=o;p.progress=0;p._ev=null;p._pau=false;p.broken=false;
    });
    if(this.pObjs)this.pObjs.forEach(po=>po.lb.setText('P'+(po.p.id+1)+'\n'+(po.p.order?po.p.order.pr.e+po.p.order.pr.n.slice(0,8):'💤')));
  }
  assignOrderToPrinter(p,o){
    if(!p||!o||p.busy||p.broken||p.locked||!G.orders.includes(o))return false;
    if(G.printers.some(x=>x.order===o)){showNotif(tr('jobLoaded'),'info');return false;}
    if(!prepareOrderMaterial(o)){
      o.waitingMaterial=true;doSave(G);
      showNotif(trf('missingOrder',{mat:o.material,units:o.units})+' - '+o.pr.n,'error');
      return false;
    }
    p.busy=true;p.order=o;p.progress=0;p._ev=null;p._pau=false;p.broken=false;
    doSave(G);SFX.ok();G.cSto();
    showNotif('P'+(p.id+1)+' '+tr('prints')+' '+o.pr.e+' '+o.pr.n,'success');
    sLog('P'+(p.id+1)+' '+tr('loaded')+': '+o.cl+' - '+o.pr.n+' '+tr('withMat')+' '+o.filament.n+'.');
    this.refreshPrinterLabels();
    return true;
  }
  refreshPrinterLabels(){
    if(!this.pObjs)return;
    this.pObjs.forEach(po=>po.lb.setText('P'+(po.p.id+1)+'\n'+(po.p.order?po.p.order.pr.e+po.p.order.pr.n.slice(0,8):'LIBRE')));
  }
  openPrinterQueue(po){
    const p=po&&po.p;if(!p)return;
    if(p._ev&&!p._ev.resolved){this.showEv(p._ev);G.block=true;return;}
    if(p.broken){this.openBrokenPrinter(p);return;}
    if(p.busy){showNotif('P'+(p.id+1)+': '+p.order.pr.e+' '+p.order.pr.n+' - '+Math.round(p.progress*100)+'%');return;}
    const queued=G.orders.filter(o=>!G.printers.some(x=>x.order===o));
    if(!queued.length){showNotif(tr('noPendingJobs'),'info');return;}
    G.block=true;
    document.getElementById('sh').textContent=trf('loadPrinter',{n:p.id+1});
    document.getElementById('stoTabs').innerHTML='';
    document.getElementById('sp').textContent=tr('loadPrinterDesc');
    document.getElementById('stoActions').innerHTML=queued.map(o=>
      '<button class="eb fix" onclick="game.scene.getScene(\'Night\').assignOrderToPrinter(G.printers['+p.id+'],G.orders['+G.orders.indexOf(o)+'])">'+o.pr.e+' '+o.pr.n+' | '+o.cl+' | '+o.material+' x'+o.units+' | $'+o.pay+'</button>'
    ).join('');
    document.getElementById('sto').style.display='block';
    setTimeout(()=>focusPanelFirst('#stoActions .eb'),0);
  }
  manualRepairCost(p){return 120+G.day*25+(p&&p.order?35:0);}
  openBrokenPrinter(p){
    const cost=this.manualRepairCost(p);
    G.block=true;
    document.getElementById('sh').textContent='P'+(p.id+1)+' - '+tr('broken');
    document.getElementById('stoTabs').innerHTML='';
    document.getElementById('sp').textContent=tr('brokenPrinter')+'\n'+tr('cost')+': $'+cost;
    document.getElementById('stoActions').innerHTML=
      '<button class="eb fix"'+(G.gold>=cost||betaCreditAllows('repair',p.id)?'':' disabled')+' onclick="game.scene.getScene(\'Night\').repairBrokenPrinter('+p.id+')">🔧 '+tr(G.gold>=cost?'repair':'buyOnCredit')+' $'+cost+'</button>';
    document.getElementById('sto').style.display='block';
    setTimeout(()=>focusPanelFirst('#stoActions .eb'),0);
  }
  repairBrokenPrinter(id){
    const p=G.printers[id],cost=this.manualRepairCost(p);if(!p||!p.broken)return;
    if(!payBetaPurchase(cost,'repair',id))return;
    p.broken=false;p._ev=null;p._pau=!!(G.pActive&&!G.upsLeft);if(p.order)p.busy=true;
    G.nFixes=(G.nFixes||0)+1;G.stats.fix++;document.getElementById('hg').textContent=G.gold;
    G.cSto();SFX.fix();try{playPlayerAction(this,'repair');}catch(e){}this.juice('IMPRESORA SALVADA','P'+(p.id+1)+' vuelve al taller','success');showNotif('P'+(p.id+1)+' '+tr('repair')+' OK','success');this.refreshPrinterLabels();doSave(G);
  }
  buildWorld(){
    const W=this.W,H=this.H;
    this.bgG=this.add.graphics();drawBG(this.bgG,W,H,true);applyNightRoomLayers(this,this.bgG,W,H);
    const nbg=this.add.rectangle(W/2,20,300,7,0x0d0a20).setOrigin(.5);
    this.nBf=this.add.rectangle(W/2-150,20,0,7,0x9d7fe3).setOrigin(0,.5).setDepth(20);
    this.add.text(W/2,30,tr('nightActive').toUpperCase(),{fontSize:'7px',color:'#2a2040',fontFamily:'Press Start 2P'}).setOrigin(.5,0).setDepth(20);
    this.tG=this.add.graphics();this.drawTblN(false);
    const shopPt=this.rp(205,190),invPt=this.rp(43,225);
    this.shopZone={x:shopPt.x,y:shopPt.y};
    this.invZone={x:invPt.x,y:invPt.y};
    const printerSlots=this.printerSlots();
    G.printers.forEach((p,i)=>{
      if(p.locked)return;
      const slot=printerSlots[i]||this.rp(151+i*40,107),px=slot.x,py=slot.y;
      const ct=this.add.container(px,py).setDepth(3);
      const spr=this.fitPrinterSprite(createPrinterSprite(this,px,py),i);
      const pg=this.add.graphics();drawPrinter(pg,p.busy,p.broken,0,p.order?p.order.pr.c:0x5bc8fa);pg.setVisible(!spr);ct.add(pg);
      const arm=this.add.graphics();
      arm.fillStyle(0x8888cc);arm.fillRect(-2,-64,4,22);
      arm.fillStyle(0x5bc8fa);arm.fillTriangle(-4,-42,4,-42,0,-36);
      arm.setVisible(!spr);
      ct.add(arm);
      if(p.busy&&!p.broken&&!spr){
        this.tweens.add({targets:arm,x:{from:-26,to:26},duration:750,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
        this.time.addEvent({delay:300,callback:()=>{
          if(!p.busy||p.broken)return;
          const sp2=this.add.circle(px+Phaser.Math.Between(-16,16),py-64,Phaser.Math.Between(1,3),0xff5500,.9).setDepth(5);
          this.tweens.add({targets:sp2,y:sp2.y-20,alpha:0,duration:480,onComplete:()=>sp2.destroy()});
        },repeat:-1});
      }
      // La pieza va a nivel de escena, NO dentro del contenedor: el sprite de la impresora
      // se agrega después con la misma depth que el contenedor, así que adentro quedaba tapada.
      const job=this.add.graphics();job.setPosition(px,py).setDepth(4);
      const benchy=createBenchySprite(this,px,py-20,1.3);if(benchy)benchy.setDepth(4);
      const pbB=this.add.rectangle(0,-16,70,5,0x070510).setOrigin(.5).setDepth(4);
      const pbF=this.add.rectangle(-35,-16,0,5,p.order?p.order.pr.c:0x5bc8fa).setOrigin(0,.5).setDepth(4);
      ct.add(pbB);ct.add(pbF);
      const lb=this.add.text(0,30,'P'+(i+1)+'\n'+(p.order?p.order.pr.e+p.order.pr.n.slice(0,8):'💤'),{fontSize:'8px',color:'#2a2050',fontFamily:'Press Start 2P',align:'center'}).setOrigin(.5,0);
      ct.add(lb);
      const wn=this.add.text(0,-22,'',{fontSize:'16px'}).setOrigin(.5).setDepth(5);ct.add(wn);
      this.pObjs.push({p,ct,pg,spr,job,benchy,pbF,lb,wn,arm,px,py});
    });
    this.iLbl=this.add.text(0,0,'',{fontSize:'10px',color:'#ff4d6a',fontFamily:'Press Start 2P',backgroundColor:'#000000cc',padding:{x:4,y:2}}).setDepth(15).setVisible(false);
  }
  placeEnvironmentProps(){
    if(this.envPropsPlaced)return;
    this.envPropsPlaced=true;
    const P=(x,y)=>this.rp(x,y),S=this.room().s;
    const props=[
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
    ].map(p=>{const q=P(p[1],p[2]),sp=addEnvSprite(this,p[0],q.x,q.y,p[3],p[4]);if(p[0]==='prop_electricity')this.powerSprite=sp;return sp;}).filter(Boolean);
    props.forEach(o=>o.setTint(0x7c7fa8).setAlpha(.72));
  }
  refreshPrinterSprites(){
    if(!this.pObjs)return;
    this.pObjs.forEach(po=>{
      if(po.spr||!this.textures.exists(PRINTER_ASSET))return;
      po.spr=createPrinterSprite(this,po.px,po.py);
      if(po.spr){
        this.fitPrinterSprite(po.spr,this.pObjs.indexOf(po));
        po.pg.setVisible(false);
        if(po.arm)po.arm.setVisible(false);
      }
    });
  }
  ensureUnlockedPrinterVisuals(){
    if(!this.pObjs)return;
    refreshNightRoomObjects(this);
    const unlocked=G.printers.filter(p=>!p.locked);
    const slots=this.printerSlots();
    unlocked.forEach((p,i)=>{
      const slot=slots[i]||this.rp(151+i*40,107),px=slot.x,py=slot.y;
      let po=this.pObjs.find(o=>o.p===p);
      if(po){
        po.px=px;po.py=py;po.ct.setPosition(px,py);
        if(po.spr){po.spr.setPosition(px,py);this.fitPrinterSprite(po.spr,i);}
        return;
      }
      const ct=this.add.container(px,py).setDepth(3);
      const spr=this.fitPrinterSprite(createPrinterSprite(this,px,py),i);
      const pg=this.add.graphics();drawPrinter(pg,p.busy,p.broken,0,p.order?p.order.pr.c:0x5bc8fa);pg.setVisible(!spr);ct.add(pg);
      const arm=this.add.graphics();
      arm.fillStyle(0x8888cc);arm.fillRect(-2,-64,4,22);
      arm.fillStyle(0x5bc8fa);arm.fillTriangle(-4,-42,4,-42,0,-36);
      arm.setVisible(!spr);
      ct.add(arm);
      const pbB=this.add.rectangle(0,-16,70,5,0x070510).setOrigin(.5).setDepth(4);
      const pbF=this.add.rectangle(-35,-16,0,5,p.order?p.order.pr.c:0x5bc8fa).setOrigin(0,.5).setDepth(4);
      ct.add(pbB);ct.add(pbF);
      const lb=this.add.text(0,30,'P'+(p.id+1)+'\n'+(p.order?p.order.pr.e+p.order.pr.n.slice(0,8):'LIBRE'),{fontSize:'8px',color:'#2a2050',fontFamily:'Press Start 2P',align:'center'}).setOrigin(.5,0);
      ct.add(lb);
      const wn=this.add.text(0,-22,'',{fontSize:'16px'}).setOrigin(.5).setDepth(5);ct.add(wn);
      this.pObjs.push({p,ct,pg,spr,pbF,lb,wn,arm,px,py});
    });
    this.refreshPrinterSprites();this.refreshPrinterLabels();
  }
  drawTblN(pwr){
    const g=this.tG;if(g)g.clear();
    if(this.powerSprite)this.powerSprite.clearTint().setTint(pwr?0xff4d6a:0x8da0ff).setAlpha(pwr?1:.88);
  }
  createPlayer(){
    const start=this.rp(205,235);
    this.player=this.add.container(start.x,start.y).setDepth(5);
    this.pGr=this.add.graphics();drawPlayer(this.pGr,true,false);
    this.player.add(this.pGr);
    this.fc=this.add.graphics();this.fc.fillStyle(0xffeeaa,.07);this.fc.fillTriangle(12,-6,12,6,52,0);
    this.player.add(this.fc);this.pSp=null;this.pDir='down';
  }
  refreshPlayerSprite(){if(this.pSp||!this.player)return;this.pSp=createPlayerSprite(this,this.player,true);if(this.pSp){this.pSp.setScale(2.45);this.pGr.setVisible(false);}}
  setupKeys(){
    this.keys=this.input.keyboard.addKeys({w:'W',s:'S',a:'A',d:'D',up:'UP',dn:'DOWN',lt:'LEFT',rt:'RIGHT'});
    this.input.keyboard.on('keydown-E',e=>{
      if(e&&e.repeat)return;
      this.activateTarget(this.targetAt(this.player.x,this.player.y,false));
    });
  }
  setupPointer(){
    this.input.on('pointerdown',p=>{
      this.activateTarget(this.targetAt(p.worldX,p.worldY,true));
    });
  }
  interactionTargets(){
    const targets=[];
    if(G.pActive&&G.pType&&G.pType.id!=='micro')targets.push({type:'breaker',visual:this.tZone,access:this.breakerAccess,label:tr('boardTitle')});
    targets.push({type:'shop',visual:this.shopZone,access:this.rp(203,212),label:tr('shopTitle')});
    targets.push({type:'inventory',visual:this.invZone,access:this.rp(93,223),label:tr('inventory')});
    this.pObjs.forEach(po=>targets.push({type:'printer',po,visual:{x:po.px,y:po.py},access:{x:po.px,y:this.rp(0,132).y},label:'P'+(po.p.id+1)+' '+tr('interact')}));
    return targets;
  }
  targetAt(x,y,click){
    let best=null,distance=20*this.room().s;
    this.interactionTargets().forEach(t=>{
      const point=click?t.visual:t.access;
      const d=Phaser.Math.Distance.Between(x,y,point.x,point.y);
      if(d<distance){best=t;distance=d;}
    });
    return best;
  }
  activateTarget(t){
    if(!t||G.block||G.menuOpen||this._actBusy||G.phase!=='night')return;
    if(t.type==='breaker')return this.openBk();
    if(t.type==='shop')return G.openShop('stk');
    if(t.type==='inventory')return G.showInventory();
    if(t.type==='printer')return this.openPrinterQueue(t.po);
  }
  printerAt(x,y,range){
    let best=null,md=range;
    this.pObjs.forEach(po=>{
      const d=Phaser.Math.Distance.Between(x,y,po.px,po.py+15);
      if(d<md){md=d;best=po;}
    });
    return best;
  }
  nightDelay(delay,callback){
    const run=this._nightRun;
    return this.time.delayedCall(delay,()=>{
      if(run&&run===this._nightRun&&G.phase==='night')callback();
    });
  }
  schedPwr(){
    if(G.upg.solar)return;
    if(this.beta&&this.beta.forcedPower){
      this.beta.forcedPower.forEach(e=>this.nightDelay(e.at,()=>this.trigPwr(e.id)));
      return;
    }
    if(Math.random()>Math.min(.85,.3+G.day*.04))return;
    [8,22,42,58].filter(()=>Math.random()>.4).forEach(s=>
      this.nightDelay(s*1000+Math.random()*3500,()=>this.trigPwr()));
  }
  trigPwr(forceId){
    if(G.phase!=='night'||G.upg.solar)return;
    if(G.pActive||G.block||G.menuOpen||this.aEv||G._mini){
      if(forceId)this.nightDelay(750,()=>this.trigPwr(forceId));
      return;
    }
    let pool=PE.filter(e=>{
      if(e.id==='micro'&&G.upg.prot)return false;
      if(e.id==='norm'&&G.upg.ups2)return false;
      if(e.id==='long'&&G.upg.gen)return false;
      return true;
    });
    if(forceId)pool=pool.filter(e=>e.id===forceId);
    if(!pool.length)return;
    const ev=forceId?pool[0]:pool[Math.floor(Math.random()*pool.length)];
    G.stats.pwr++;
    const evLabel=powerText(ev);
    G.pActive=true;G.pType=ev;G.pTimer=ev.dur;G.pMax=ev.dur;
    G.upsLeft=G.upg.ups2?600000:G.upg.ups1?180000:0;
    SFX.pwr();SFX.alm();shakeUI();this.cameras.main.flash(300,255,0,0,.5);
    if(!G.upsLeft)G.printers.forEach(p=>{if(p.busy&&!p.broken)p._pau=true;});
    document.getElementById('pov').className='on';
    document.getElementById('phud').style.display='block';
    document.getElementById('pht').textContent=evLabel.ti;
    document.getElementById('phd').textContent=evLabel.de;
    document.getElementById('phint').textContent=ev.id==='micro'?tr('waitReturn'):tr('runToBreaker');
    document.getElementById('ptag').className='ptag pwr';
    document.getElementById('ptag').textContent='⚡ CORTE DE LUZ';
    this.drawTblN(true);
    sLog('⚡ '+evLabel.ti+' — '+(ev.id==='micro'?tr('powerLogWait'):tr('powerLogRun')));
  }
  openBk(){
    if(G.block||G.menuOpen||!G.pActive||!G.pType||G.pType.id==='micro')return;
    G.block=true;G._bkRounds=G.pType.id==='long'?2:1;G._bkRound=0;
    document.getElementById('bkg').style.display='block';
    this.startBreakerRound();
    SFX.clk();
  }
  startBreakerRound(){
    const num=4;
    this.bkOrd=Phaser.Utils.Array.Shuffle(Array.from({length:num},(_,i)=>i));
    G._bkNum=num;G._bkNext=0;G._bkOrd=[...this.bkOrd];G._bkBusy=false;
    document.getElementById('bks').innerHTML=Array.from({length:num},(_,i)=>
      '<button type="button" class="bk" id="bk'+i+'" style="--slot:'+i+'" aria-label="'+trf('breakerSwitch',{num:i+1})+'" onclick="G._bk('+i+')"><span class="breakerSprite" aria-hidden="true"></span></button>').join('');
    document.getElementById('bkd').textContent=trf('breakerRound',{round:G._bkRound+1,total:G._bkRounds})+' — '+tr('breakerOrder');
    document.getElementById('bkseq').innerHTML='<b>'+tr('breakerSequence')+'</b>'+this.bkOrd.map((pos,step)=>
      '<span id="bkStep'+step+'">'+(pos+1)+'</span>').join('<i>→</i>');
    document.getElementById('bhint').textContent=trf('nowBreaker',{num:this.bkOrd[0]+1});
    setTimeout(()=>focusPanelFirst('#bks .bk'),0);
  }
  nextBreakerRound(){
    if(!G.pActive)return;
    G._bkRound++;
    this.startBreakerRound();
    showNotif('⚡ '+trf('breakerRound',{round:G._bkRound+1,total:G._bkRounds}),'warning');
  }
  inspect(po){
    const p=po.p;
    if(p._ev&&!p._ev.resolved){this.showEv(p._ev);G.block=true;}
    else if(p.busy)showNotif('P'+(p.id+1)+': '+p.order.pr.e+' '+p.order.pr.n+' — '+Math.round(p.progress*100)+'%');
    else showNotif('P'+(p.id+1)+': '+tr('noWorkTonight'));
  }
  schedEvs(){
    this.forcedFails=(this.beta&&this.beta.forcedFails||[]).map(e=>({...e,triggered:false,resolved:false}));
    if(this.beta&&this.beta.forcedFails){
      this.forcedFails.forEach((e,i)=>this.nightDelay(e.at,()=>this.trigEv(e.id,true,i)));
      return;
    }
    const n=2+Math.floor(G.day/3);
    [9,18,30,44,56].slice(0,Math.min(n,5)).forEach(s=>
      this.nightDelay(s*1000+Math.random()*3000,()=>this.trigEv()));
  }
  trigEv(forceId,forced=false,scriptIndex){
    if(G.phase!=='night')return;
    if(forced&&scriptIndex===undefined)scriptIndex=(this.forcedFails||[]).findIndex(e=>e.id===forceId&&!e.triggered);
    const scripted=forced&&this.forcedFails&&this.forcedFails[scriptIndex];
    if(forced&&(!scripted||scripted.triggered))return;
    // Scripted events wait their turn; never replace a live repair or cover a modal.
    if(G.block||G.menuOpen||this.aEv||G._mini){
      if(forced)this.nightDelay(750,()=>this.trigEv(forceId,true,scriptIndex));
      return;
    }
    let busy=G.printers.filter(p=>p.busy&&!p.broken&&!p._ev&&!p._pau);
    // A failure can only hit a printer that's actually printing. If nothing's running yet,
    // a forced (beta) fail waits and retries until the player has a job on a printer.
    if(!busy.length){if(forced)this.nightDelay(750,()=>this.trigEv(forceId,true,scriptIndex));return;}
    const avgRisk=busy.reduce((s,p)=>s+(p.order&&p.order.risk||0),0)/busy.length;
    if(!forced&&Math.random()>Math.min(.9,.22+G.day*.025+avgRisk))return;
    const totalRisk=busy.reduce((s,p)=>s+(p.order&&p.order.risk||.05),0);
    let roll=Math.random()*totalRisk,tgt=busy[0];
    for(const p of busy){roll-=p.order&&p.order.risk||.05;if(roll<=0){tgt=p;break;}}
    let pool=NE.filter(e=>{
      if(e.id==='therm'&&G.upg.cool&&Math.random()<.55)return false;
      if(e.id==='bed'&&G.upg.abed&&Math.random()<.5)return false;
      if(e.id==='warp'&&G.upg.enc)return false;
      if(e.id==='layer'&&G.upg.klip&&Math.random()<.65)return false;
      if(e.id==='humid'&&G.upg.dry)return false;
      return true;
    });
    if(forceId&&forceId!=='random')pool=pool.filter(e=>e.id===forceId);
    if(!pool.length)pool=NE;
    const fil=tgt.order&&tgt.order.filament;
    const total=pool.reduce((s,e)=>{
      let w=1;
      if(fil){
        if(['clog','jam','blob'].includes(e.id))w+=Math.max(0,fil.clog||0)*8;
        if(e.id==='humid')w+=Math.max(0,fil.risk||0)*8;
        if(e.id==='warp'&&tgt.order.material!=='resin')w+=Math.max(0,fil.risk||0)*5;
        if(e.id==='therm'&&fil.q>=3)w*=.75;
      }
      return s+w;
    },0);
    let wr=Math.random()*total,def=pool[0];
    if(forceId&&forceId!=='random'){
      def=pool.find(e=>e.id===forceId)||pool[0];
    } else for(const e of pool){
      let w=1;
      if(fil){
        if(['clog','jam','blob'].includes(e.id))w+=Math.max(0,fil.clog||0)*8;
        if(e.id==='humid')w+=Math.max(0,fil.risk||0)*8;
        if(e.id==='warp'&&tgt.order.material!=='resin')w+=Math.max(0,fil.risk||0)*5;
        if(e.id==='therm'&&fil.q>=3)w*=.75;
      }
      wr-=w;if(wr<=0){def=e;break;}
    }
    const defLabel=evText(def);
    const matLine=fil?(G.lang==='en'?'\nMaterial used: ':'\nMaterial usado: ')+fil.n:(G.day===1&&forceId==='clog'&&G.dayUsedPlaBasic?(G.lang==='en'?'\nMaterial used earlier: PLA Basic':'\nMaterial usado antes: PLA Basic'):'');
    const ev={...defLabel,printer:tgt,desc:defLabel.de.replace('{P}','P'+(tgt.id+1))+matLine,resolved:false,scriptIndex:scripted?scriptIndex:null};
    // Beta: fixes are always free and the nozzle minigame always has its consumable, so the player
    // can never get soft-locked once the skip button is removed (see showEv).
    if(BETA_DAYS[G.day]){ev.g=0;ev.pts=0;if(ev.id==='clog'){ensureConsumables();if(G.cons.cleaner<1)G.cons.cleaner=1;}}
    if(scripted)scripted.triggered=true;
    tgt._ev=ev;this.aEv=ev;G.block=true;SFX.alm();
    const po=this.pObjs.find(o=>o.p===tgt);
    if(po){po.wn.setText('⚠️');this.tweens.add({targets:po.wn,alpha:{from:1,to:0},duration:350,yoyo:true,repeat:5});}
    this.showEv(ev);
    showNotif('⚠️ '+ev.ic+' '+ev.ti+' — P'+(tgt.id+1)+'!');
    sLog('⚠️ FALLA: '+ev.ti+' en P'+(tgt.id+1));
  }
  showEv(ev){
    document.getElementById('et').textContent=ev.ic+' '+ev.ti;
    const ct=(ev.g>0?'\n'+tr('cost')+': $'+ev.g:'')+(ev.pts>0&&ev.id!=='clog'?'\n'+tr('parts')+': '+ev.pts:'')+(ev.id==='clog'?'\n'+tr('cleaner')+': '+((G.cons&&G.cons.cleaner)||0):'');
    document.getElementById('ed').textContent=ev.desc+ct;
    const beta=!!BETA_DAYS[G.day];
    const canFix=beta?true:ev.id==='clog'?!!(G.day===1||(G.cons&&G.cons.cleaner>0)):(ev.g===0||G.gold>=ev.g)&&(ev.pts===0||G.stk.parts>=ev.pts);
    const auto=G.emp.rodri&&['jam','blob','humid'].includes(ev.id);
    let buttons=auto
      ?'<button class="eb fix" onclick="G.nAutoFix()">🤖 '+tr('autoRepair')+'</button>'
      :(ev.id==='clog'
        ?'<button class="eb fix"'+(canFix?'':' disabled')+' onclick="G.startNozzleMini()">🚫 '+tr('nozzleMini')+'</button>'
        :ev.id==='bed'
        ?'<button class="eb fix"'+(canFix?'':' disabled')+' onclick="G.startBedMini()">📐 '+tr('bedMini')+(ev.g>0?' (-$'+ev.g+')':'')+'</button>'
        :'<button class="eb fix"'+(canFix?'':' disabled')+' onclick="G.nFix()">🔧 '+ev.fx+(ev.g>0?' (-$'+ev.g+')':(ev.pts>0?' (-'+ev.pts+' rep)':''))+'</button>')
        +(beta?'':'<button class="eb skip" onclick="G.nSkip()">⏭ '+tr('ignore')+' (-'+ev.rp+' REP)</button>');
    if(beta&&(ev._fails||0)>=2){
      const repairCost=G.emergencyRepairCost();
      buttons+='<button class="eb skip" onclick="G.nForceRepair()">🛠️ '+tr('repairAnyway')+' (-$'+repairCost+')</button>';
    }
    document.getElementById('ebs').innerHTML=buttons;
    document.getElementById('evp').style.display='block';
    setTimeout(()=>focusPanelFirst('#ebs .eb'),0);
  }
  juice(title,sub='',type='success'){
    nightJuice(this,title,sub,type);
  }
  resolveFailure(ev){
    if(!ev||ev.resolved||this.aEv!==ev||ev.printer._ev!==ev)return false;
    ev.resolved=true;ev.printer._ev=null;
    ev.printer._pau=!!(G.pActive&&!G.upsLeft);
    if(Number.isInteger(ev.scriptIndex)&&this.forcedFails[ev.scriptIndex])this.forcedFails[ev.scriptIndex].resolved=true;
    this.aEv=null;G.nFixes=(G.nFixes||0)+1;G.stats.fix++;
    const po=this.pObjs.find(o=>o.p===ev.printer);if(po)po.wn.setText('');
    return true;
  }
  completePrint(p){
    if(!p||!p.busy||!p.order||p._ev||p.broken||p._pau||G.block)return;
    // A very short final job must not leave a mandatory failure waiting forever.
    const pending=(this.forcedFails||[]).findIndex(e=>!e.triggered);
    if(G.orders.length===1&&pending>=0){
      this.trigEv(this.forcedFails[pending].id,true,pending);
      return;
    }
    const o=p.order,earned=o.pay;
    const repGain=2+(o.filament&&o.filament.rep||0);
    G.gold+=earned;G.rep=Math.max(0,G.rep+repGain);G.stats.earn+=earned;this.earn+=earned;this.done++;G.nightDone=this.done;
    G.orders=G.orders.filter(x=>x!==o);
    p.busy=false;p.order=null;p.progress=0;p._ev=null;p._pau=false;
    SFX.coin();
    const po=this.pObjs.find(x=>x.p===p);
    if(po){
      const coin=this.add.text(po.px,po.py-88,'+$'+earned,{fontSize:'18px',color:'#ffd700',fontFamily:'Press Start 2P'}).setOrigin(.5).setDepth(12);
      this.tweens.add({targets:coin,y:coin.y-72,scale:1.18,alpha:0,duration:1250,ease:'Cubic.easeOut',onComplete:()=>coin.destroy()});
      this.juice('TRABAJO COBRADO','P'+(p.id+1)+' · +$'+earned+(repGain!==2?' · REP '+(repGain>0?'+':'')+repGain:''),'money');
    }
    showNotif('✅ '+o.pr.e+' '+o.pr.n+' — +$'+earned+(repGain!==2?' REP '+(repGain>0?'+':'')+repGain:''),'money');
    sLog('✅ P'+(p.id+1)+': '+o.pr.e+' '+o.pr.n+' con '+(o.filament?o.filament.n:o.material)+' — +$'+earned+' 🪙');
    this.updateHUD();
  }
  resPwr(panel){
    if(!G.pActive)return;
    const resolvedType=G.pType&&G.pType.id;
    const pen=G.pType?G.pType.pen:.3;
    if(!G.upsLeft)G.printers.forEach(p=>{if(p._pau){p.progress=Math.max(0,p.progress-pen*.4);p._pau=false;}});
    if(panel){G.breakerFixes=(G.breakerFixes||0)+1;G.lastPowerResolved=resolvedType;}
    G.pActive=false;G.pType=null;G.upsLeft=0;SFX.pwrOn();
    document.getElementById('pov').className='';
    document.getElementById('phud').style.display='none';
    document.getElementById('bkg').style.display='none';
    document.getElementById('ptag').className='ptag night';
    document.getElementById('ptag').textContent='🌙 '+tr('night');
    syncGameplayBlock();this.drawTblN(false);
    this.cameras.main.flash(400,255,220,100,.4);
    showNotif(panel?'✅ '+tr('breakerRestored'):'⚡ '+tr('lightBack'));
    if(panel){SFX.fix();this.juice('LUZ RESTAURADA','Las impresoras retoman','power');}
    sLog('💡 Luz restablecida. Las impresoras retoman.');
  }
  update(_t,dt){
    if(G.phase!=='night')return;
    if(G.block||G.menuOpen){
      (this.pObjs||[]).forEach((po,i)=>{if(po.spr&&G.printers[i])setPrinterSpriteState(po.spr,G.printers[i]);});
      return;
    }
    if(G.pActive){
      G.pTimer-=dt;
      document.getElementById('ptf').style.width=(Math.max(0,G.pTimer/G.pMax)*100)+'%';
      if(G.upsLeft>0){G.upsLeft-=dt;if(G.upsLeft<=0){G.upsLeft=0;G.printers.forEach(p=>{if(p.busy&&!p.broken)p._pau=true;});}}
      if(G.pTimer<=0&&G.pType&&G.pType.id!=='micro'){
        if(BETA_DAYS[G.day])G.pTimer=0;
        else this.resPwr(false);
      }
      if(G.pTimer<=0&&G.pType&&G.pType.id==='micro')this.resPwr(false);
    }
    if(!G.block){
      const k=this.keys;let vx=0,vy=0;
      const spd=energySpeed();
      if(!this._actBusy){
        if(k.a.isDown||k.lt.isDown){vx=-172*spd;this.dir=-1;}
        if(k.d.isDown||k.rt.isDown){vx=172*spd;this.dir=1;}
        if(k.w.isDown||k.up.isDown)vy=-103*spd;
        if(k.s.isDown||k.dn.isDown)vy=103*spd;
        this.movePlayer(vx*dt/1000,vy*dt/1000);
        this.pDir=setPlayerSpriteState(this.pSp,vx,vy,this.pDir);
        if(!this.pSp)this.player.scaleX=this.dir;
        this.fc.scaleX=this.dir;
      }
      if(vx||vy){this.wt+=dt;this.st+=dt;if(this.wt>175){this.wb^=1;this.wt=0;}if(this.st>360){this.st=0;SFX.step();}}
      else this.wb=0;
      const bobT=this.pSp||this.pGr;if(bobT&&!this._actBusy)bobT.y=(vx||vy)&&this.wb?-2:0;
    }
    tickMate(dt);this.el+=dt;this.nBf.width=300*Math.min(1,this.el/this.dur);
    if(this.el>=this.dur){
      // In the beta the night can't just time out while a scripted failure is still unresolved:
      // the player must clear the minigame. Hold the clock full and keep waiting until it's fixed.
      if(BETA_DAYS[G.day]&&!this.nightObjectiveReady()){
        this.el=this.dur;
        if(!this.nightOvertimeWarned){
          this.nightOvertimeWarned=true;
          showNotif(tr('nightTasksPending'),'warning');
          sHint(tr('nightTasksPending'));
        }
      }
      else{this.endNight();return;}
    }
    G.printers.forEach(p=>{
      if(!p.busy||p.broken||p._ev||p._pau)return;
      p.progress+=dt/1000*G.sMult/(p.order?(p.order.time||p.order.pr.t)*10:100);
      if(p.progress>=1){p.progress=1;this.completePrint(p);}
    });
    this.pObjs.forEach(po=>{
      const p=po.p,c=p.order?p.order.pr.c:0x5bc8fa;
      if(po.spr)setPrinterSpriteState(po.spr,p);
      else drawPrinter(po.pg,p.busy&&!p._pau,p.broken,p.progress,c);
      po.pbF.width=70*Math.min(1,p.progress);
      const prog=(p.busy&&!p.broken)?p.progress:0;
      // Si el benchy cargó, se usa el sprite; si no, queda el dibujo procedural de respaldo.
      if(!updateBenchySprite(po.benchy,prog,c)&&po.job)drawPrintObject(po.job,prog,c,1);
      else if(po.job)po.job.clear();
    });
    const target=this.targetAt(this.player.x,this.player.y,false);
    this.near=target&&target.po||null;
    if(target&&!G.block){
      this.iLbl.setVisible(true).setText('Click/E '+target.label).setPosition(target.visual.x,target.visual.y-44);
      sHint('Click / [E] '+target.label);
    }else this.iLbl.setVisible(false);
    if(this.iLbl.visible){const pulse=.55+.35*Math.sin(this.time.now/120);this.iLbl.setAlpha(.72+pulse*.28).setScale(1+pulse*.05);}
    this.updateHUD();this.maybeFastCloseNight();
  }
  // Beta gate: the night may only close once every scripted failure has been handled.
  // A failure is "pending" while its printer still carries an active event or a panel is open,
  // or while the minigame is mid-run. nFixes must cover every forced fail the day scheduled.
  // El benchy carga async: cuando llega la textura se crean los sprites que faltaban.
  refreshBenchySprites(){
    if(!this.pObjs)return;
    this.pObjs.forEach(po=>{
      if(po.benchy)return;
      po.benchy=createBenchySprite(this,po.px,po.py-20,1.3);
      if(po.benchy)po.benchy.setDepth(4);
    });
  }
  betaNightClearable(){
    const ff=(this.beta&&this.beta.forcedFails)?this.beta.forcedFails.length:0;
    const anyEvActive=(G.printers||[]).some(p=>p._ev)||!!(this.aEv)||!!G._mini;
    if(anyEvActive)return false;
    if((this.forcedFails||[]).some(e=>!e.resolved))return false;
    return (G.nFixes||0)>=ff;
  }
  nightObjectiveReady(){
    return !!BETA_DAYS[G.day]&&betaObjectives('night').every(t=>t.done);
  }
  maybeFastCloseNight(){
    if(this.fastCloseNight||G.block||G.phase!=='night')return;
    if(!this.nightObjectiveReady())return;
    this.fastCloseNight=true;
    showNotif(tr('nightGoalComplete'),'success');
    sLog('✅ '+tr('nightGoalComplete'));
    this.nightDelay(1100,()=>{this.fastCloseNight=false;if(!G.block)this.endNight();});
  }
  updateHUD(){document.getElementById('hg').textContent=G.gold;renderRepHUD();}
  endNight(){
    if(G.phase!=='night'||G.block||G.menuOpen||G.pActive)return;
    if(BETA_DAYS[G.day]&&!this.nightObjectiveReady()){
      this.el=this.dur;
      if(!this.nightOvertimeWarned){
        this.nightOvertimeWarned=true;
        showNotif(tr('nightTasksPending'),'warning');
        sHint(tr('nightTasksPending'));
      }
      return;
    }
    G.phase='transition';G.block=true;
    let sal=0;
    Object.keys(G.emp).forEach(id=>{const e=EMP.find(x=>x.id===id);if(e){sal+=e.sal;G.gold=G.gold<0?G.gold-e.sal:Math.max(0,G.gold-e.sal);}});
    doSave(G);
    const sub=(G.lang==='en'?'Completed':'Completados')+': '+this.done+' | '+(G.lang==='en'?'Earned':'Ganado')+': $'+this.earn+'\nREP: '+G.rep+(sal?' | '+(G.lang==='en'?'Wages':'Salarios')+': -$'+sal:'');
    this.scene.pause();
    if(G.day>=3){
      G.betaResult={gold:G.gold,rep:G.rep,repairs:G.stats.fix};
      setSaveCheckpoint(G,'night');
      doTrans('🏁 '+(G.lang==='en'?'BETA COMPLETE':'BETA COMPLETA'),(G.lang==='en'?'End of the 3-day beta.':'Fin de la beta de 3 días.'),()=>{G.showBetaEnd(sub);});
      return;
    }
    G.day++;
    setSaveCheckpoint(G,'day');
    doTrans('☀️  '+tr('day')+' '+G.day,sub,()=>{this.scene.stop();this.scene.start('Day');});
  } // end endNight
} // end NightScene

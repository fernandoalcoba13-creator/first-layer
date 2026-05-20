// ═══ NIGHT SCENE ═══
// Night phase: printers work autonomously, failures and power outages happen,
// player runs to inspect/repair and to the breaker panel.
class NightScene extends Phaser.Scene{
  constructor(){super({key:'Night'});}
  create(){
    this.W=this.scale.width;this.H=this.scale.height;
    G.phase='night';G.block=false;
    this.dur=80000;this.el=0;this.aEv=null;this.pObjs=[];this.near=null;
    this.earn=0;this.done=0;this.wt=0;this.st=0;this.wb=0;this.dir=1;
    this.bkOrd=[];this.bkNext=0;this.tZone={x:this.W*.07,y:this.H*.42};
    if(G.syncPrinters)G.syncPrinters();
    this.assignOrders();this.buildWorld();this.createPlayer();this.setupKeys();
    loadPrinterAssetsAsync(this,()=>this.refreshPrinterSprites());
    loadPlayerAssetsAsync(this,()=>this.refreshPlayerSprite());
    this.schedPwr();this.schedEvs();
    document.getElementById('ptag').className='ptag night';
    document.getElementById('ptag').textContent='🌙 NOCHE — Día '+G.day;
    document.getElementById('pov').className='';
    document.getElementById('phud').style.display='none';
    sLog('Las impresoras trabajan. Vigilá fallas y ⚡ cortes de luz.');
    sHint('WASD | E=inspeccionar');
  }
  assignOrders(){
    const av=G.printers.filter(p=>!p.broken&&!p.locked);
    const queued=G.orders.filter(o=>!G.printers.some(p=>p.order===o));
    av.filter(p=>!p.busy&&!p.order).forEach((p,i)=>{
      const o=queued[i];if(!o)return;
      if(!prepareOrderMaterial(o)){o.waitingMaterial=true;showNotif('Falta '+o.material+' x'+o.units+' para '+o.pr.n,'error');return;}
      p.busy=true;p.order=o;p.progress=0;p._ev=null;p._pau=false;p.broken=false;
    });
    if(this.pObjs)this.pObjs.forEach(po=>po.lb.setText('P'+(po.p.id+1)+'\n'+(po.p.order?po.p.order.pr.e+po.p.order.pr.n.slice(0,8):'💤')));
  }
  buildWorld(){
    const W=this.W,H=this.H;
    this.bgG=this.add.graphics();drawBG(this.bgG,W,H,true);
    const nbg=this.add.rectangle(W/2,20,300,7,0x0d0a20).setOrigin(.5);
    this.nBf=this.add.rectangle(W/2-150,20,0,7,0x9d7fe3).setOrigin(0,.5).setDepth(20);
    this.add.text(W/2,30,'PROGRESO NOCHE',{fontSize:'7px',color:'#2a2040',fontFamily:'Courier New'}).setOrigin(.5,0).setDepth(20);
    this.tG=this.add.graphics();this.drawTblN(false);
    this.shopZone={x:W*.9,y:H*.34};
    this.invZone={x:W*.9,y:H*.47};
    const sg=this.add.graphics();
    sg.fillStyle(0x0c180c);sg.fillRect(this.shopZone.x-38,this.shopZone.y-26,76,50);
    sg.lineStyle(1,0x2a4a2a);sg.strokeRect(this.shopZone.x-38,this.shopZone.y-26,76,50);
    this.add.text(this.shopZone.x,this.shopZone.y,'🔧\nTIENDA',{fontSize:'9px',color:'#4dff91',fontFamily:'Courier New',align:'center'}).setOrigin(.5);
    sg.fillStyle(0x10101e);sg.fillRect(this.invZone.x-38,this.invZone.y-26,76,50);
    sg.lineStyle(1,0x2a2040);sg.strokeRect(this.invZone.x-38,this.invZone.y-26,76,50);
    this.add.text(this.invZone.x,this.invZone.y,'📦\nINV',{fontSize:'9px',color:'#5bc8fa',fontFamily:'Courier New',align:'center'}).setOrigin(.5);
    const cnt=G.printers.filter(p=>!p.locked).length;
    const sp=Math.min(160,(W-80)/Math.max(cnt,1));
    const sx=(W-sp*(cnt-1))/2;
    G.printers.forEach((p,i)=>{
      if(p.locked)return;
      const px=sx+i*sp,py=H*.51;
      const ct=this.add.container(px,py).setDepth(3);
      const spr=createPrinterSprite(this,px,py);
      const pg=this.add.graphics();drawPrinter(pg,p.busy,p.broken,0,p.order?p.order.pr.c:0x5bc8fa);pg.setVisible(!spr);ct.add(pg);
      const arm=this.add.graphics();
      arm.fillStyle(0x8888cc);arm.fillRect(-2,-64,4,22);
      arm.fillStyle(0x5bc8fa);arm.fillTriangle(-4,-42,4,-42,0,-36);
      ct.add(arm);
      if(p.busy&&!p.broken){
        this.tweens.add({targets:arm,x:{from:-26,to:26},duration:750,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
        this.time.addEvent({delay:300,callback:()=>{
          if(!p.busy||p.broken)return;
          const sp2=this.add.circle(px+Phaser.Math.Between(-16,16),py-64,Phaser.Math.Between(1,3),0xff5500,.9).setDepth(5);
          this.tweens.add({targets:sp2,y:sp2.y-20,alpha:0,duration:480,onComplete:()=>sp2.destroy()});
        },repeat:-1});
      }
      const pbB=this.add.rectangle(0,-16,70,5,0x070510).setOrigin(.5).setDepth(4);
      const pbF=this.add.rectangle(-35,-16,0,5,p.order?p.order.pr.c:0x5bc8fa).setOrigin(0,.5).setDepth(4);
      ct.add(pbB);ct.add(pbF);
      const lb=this.add.text(0,30,'P'+(i+1)+'\n'+(p.order?p.order.pr.e+p.order.pr.n.slice(0,8):'💤'),{fontSize:'8px',color:'#2a2050',fontFamily:'Courier New',align:'center'}).setOrigin(.5,0);
      ct.add(lb);
      const wn=this.add.text(0,-22,'',{fontSize:'16px'}).setOrigin(.5).setDepth(5);ct.add(wn);
      this.pObjs.push({p,ct,pg,spr,pbF,lb,wn,arm,px,py});
    });
    this.iLbl=this.add.text(0,0,'',{fontSize:'10px',color:'#ff4d6a',fontFamily:'Courier New',backgroundColor:'#000000cc',padding:{x:4,y:2}}).setDepth(15).setVisible(false);
  }
  refreshPrinterSprites(){
    if(!this.pObjs)return;
    this.pObjs.forEach(po=>{
      if(po.spr||!this.textures.exists(PRINTER_ASSET))return;
      po.spr=createPrinterSprite(this,po.px,po.py);
      if(po.spr)po.pg.setVisible(false);
    });
  }
  drawTblN(pwr){
    const g=this.tG,tx=this.W*.07,ty=this.H*.42;g.clear();
    g.fillStyle(pwr?0x2a0808:0x1a1010);g.fillRect(tx-26,ty-38,52,70);
    g.lineStyle(2,pwr?0xff3333:0x3a1a1a);g.strokeRect(tx-26,ty-38,52,70);
    g.fillStyle(pwr?0x3a0808:0x2a0808);g.fillRect(tx-22,ty-34,44,14);
    for(let i=0;i<4;i++){
      g.fillStyle(!pwr?0x4dff91:0x330000,!pwr?.6:1);g.fillRect(tx-18+i*10,ty-32,6,9);
      g.fillStyle(!pwr?0x4dff91:0x330000,!pwr?.3:.8);g.fillCircle(tx-15+i*10,ty-16,4);
    }
    this.tG.setDepth(2);
  }
  createPlayer(){
    this.player=this.add.container(this.W/2,this.H*.71).setDepth(5);
    this.pGr=this.add.graphics();drawPlayer(this.pGr,true,false);
    this.player.add(this.pGr);
    this.fc=this.add.graphics();this.fc.fillStyle(0xffeeaa,.07);this.fc.fillTriangle(12,-6,12,6,52,0);
    this.player.add(this.fc);this.pSp=null;this.pDir='down';
  }
  refreshPlayerSprite(){if(this.pSp||!this.player)return;this.pSp=createPlayerSprite(this,this.player,true);if(this.pSp)this.pGr.setVisible(false);}
  setupKeys(){
    this.keys=this.input.keyboard.addKeys({w:'W',s:'S',a:'A',d:'D',up:'UP',dn:'DOWN',lt:'LEFT',rt:'RIGHT'});
    this.input.keyboard.on('keydown-E',()=>{
      if(G.block)return;
      const dS=Phaser.Math.Distance.Between(this.player.x,this.player.y,this.shopZone.x,this.shopZone.y);
      if(dS<78){G.openShop('stk');return;}
      const dI=Phaser.Math.Distance.Between(this.player.x,this.player.y,this.invZone.x,this.invZone.y);
      if(dI<78){G.showInventory();return;}
      if(this.near)this.inspect(this.near);
      const dT=Phaser.Math.Distance.Between(this.player.x,this.player.y,this.tZone.x,this.tZone.y);
      if(dT<90&&G.pActive&&G.pType&&G.pType.id!=='micro')this.openBk();
    });
  }
  schedPwr(){
    if(G.upg.solar)return;
    if(Math.random()>Math.min(.85,.3+G.day*.04))return;
    [8,22,42,58].filter(()=>Math.random()>.4).forEach(s=>
      this.time.delayedCall(s*1000+Math.random()*3500,()=>this.trigPwr()));
  }
  trigPwr(){
    if(G.phase!=='night'||G.pActive||G.upg.solar)return;
    G.stats.pwr++;
    let pool=PE.filter(e=>{
      if(e.id==='micro'&&G.upg.prot)return false;
      if(e.id==='norm'&&G.upg.ups2)return false;
      if(e.id==='long'&&G.upg.gen)return false;
      return true;
    });
    if(!pool.length)return;
    const ev=pool[Math.floor(Math.random()*pool.length)];
    G.pActive=true;G.pType=ev;G.pTimer=ev.dur;G.pMax=ev.dur;
    G.upsLeft=G.upg.ups2?600000:G.upg.ups1?180000:0;
    SFX.pwr();SFX.alm();shakeUI();this.cameras.main.flash(300,255,0,0,.5);
    if(!G.upsLeft)G.printers.forEach(p=>{if(p.busy&&!p.broken)p._pau=true;});
    document.getElementById('pov').className='on';
    document.getElementById('phud').style.display='block';
    document.getElementById('pht').textContent=ev.ti;
    document.getElementById('phd').textContent=ev.de;
    document.getElementById('phint').textContent=ev.id==='micro'?'Esperá que vuelva...':'Corré al tablero → E';
    document.getElementById('ptag').className='ptag pwr';
    document.getElementById('ptag').textContent='⚡ CORTE DE LUZ';
    if(ev.id==='micro')this.time.delayedCall(ev.dur,()=>this.resPwr(false));
    this.drawTblN(true);
    sLog('⚡ '+ev.ti+' — '+(ev.id==='micro'?'Espera...':'¡Corré al tablero!'));
  }
  openBk(){
    if(!G.pActive||!G.pType||G.pType.id==='micro')return;
    const num=G.pType.id==='long'?6:4;
    this.bkOrd=Array.from({length:num},(_,i)=>i).sort(()=>Math.random()-.5);
    G.block=true;G._bkNum=num;G._bkNext=0;G._bkOrd=[...this.bkOrd];
    document.getElementById('bks').innerHTML=this.bkOrd.map((pos,seq)=>
      '<div class="bk" id="bk'+seq+'" tabindex="0" onclick="G._bk('+seq+')"><div class="bkn">'+(pos+1)+'</div><div class="bksw"></div><div class="bkl"></div></div>').join('');
    document.getElementById('bkd').textContent='Levantá los disyuntores en orden (1→'+num+')';
    document.getElementById('bhint').textContent='Orden: del 1 al '+num;
    document.getElementById('bkg').style.display='block';
    setTimeout(()=>focusPanelFirst('#bks .bk'),0);
    SFX.clk();
  }
  inspect(po){
    const p=po.p;
    if(p._ev&&!p._ev.resolved){this.showEv(p._ev);G.block=true;}
    else if(p.busy)showNotif('P'+(p.id+1)+': '+p.order.pr.e+' '+p.order.pr.n+' — '+Math.round(p.progress*100)+'%');
    else showNotif('P'+(p.id+1)+': Sin trabajo esta noche.');
  }
  schedEvs(){
    const n=2+Math.floor(G.day/3);
    [9,18,30,44,56].slice(0,Math.min(n,5)).forEach(s=>
      this.time.delayedCall(s*1000+Math.random()*3000,()=>this.trigEv()));
  }
  trigEv(){
    if(G.phase!=='night')return;
    const busy=G.printers.filter(p=>p.busy&&!p.broken&&!p._ev&&!p._pau);
    if(!busy.length)return;
    const avgRisk=busy.reduce((s,p)=>s+(p.order&&p.order.risk||0),0)/busy.length;
    if(Math.random()>Math.min(.9,.22+G.day*.025+avgRisk))return;
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
    for(const e of pool){
      let w=1;
      if(fil){
        if(['clog','jam','blob'].includes(e.id))w+=Math.max(0,fil.clog||0)*8;
        if(e.id==='humid')w+=Math.max(0,fil.risk||0)*8;
        if(e.id==='warp'&&tgt.order.material!=='resin')w+=Math.max(0,fil.risk||0)*5;
        if(e.id==='therm'&&fil.q>=3)w*=.75;
      }
      wr-=w;if(wr<=0){def=e;break;}
    }
    const ev={...def,printer:tgt,desc:def.de.replace('{P','P'+(tgt.id+1))+(fil?'\nMaterial usado: '+fil.n:''),resolved:false};
    tgt._ev=ev;this.aEv=ev;G.block=true;SFX.alm();
    const po=this.pObjs.find(o=>o.p===tgt);
    if(po){po.wn.setText('⚠️');this.tweens.add({targets:po.wn,alpha:{from:1,to:0},duration:350,yoyo:true,repeat:5});}
    this.showEv(ev);
    showNotif('⚠️ '+ev.ic+' '+ev.ti+' — P'+(tgt.id+1)+'!');
    sLog('⚠️ FALLA: '+ev.ti+' en P'+(tgt.id+1));
  }
  showEv(ev){
    document.getElementById('et').textContent=ev.ic+' '+ev.ti;
    const ct=(ev.g>0?'\nCosto: $'+ev.g:'')+(ev.pts>0?'\nRepuestos: '+ev.pts:'');
    document.getElementById('ed').textContent=ev.desc+ct;
    const canFix=(ev.g===0||G.gold>=ev.g)&&(ev.pts===0||G.stk.parts>=ev.pts);
    const auto=G.emp.rodri&&['jam','blob','humid'].includes(ev.id);
    let buttons=auto
      ?'<button class="eb fix" onclick="G.nAutoFix()">🤖 Rodrigo repara solo</button>'
      :(ev.id==='clog'
        ?'<button class="eb fix"'+(canFix?'':' disabled')+' onclick="G.startNozzleMini()">🚫 Minijuego: limpiar pico'+(ev.pts>0?' (-'+ev.pts+' rep)':'')+'</button>'
        :'<button class="eb fix"'+(canFix?'':' disabled')+' onclick="G.nFix()">🔧 '+ev.fx+(ev.g>0?' (-$'+ev.g+')':(ev.pts>0?' (-'+ev.pts+' rep)':''))+'</button>')
        +'<button class="eb skip" onclick="G.nSkip()">⏭ Ignorar (-'+ev.rp+' REP)</button>';
    if(!auto&&['clog','blob'].includes(ev.id)&&G.cons&&G.cons.cleaner>0)buttons='<button class="eb fix" onclick="G.useConsumable(\'cleaner\')">Limpia pico (-1)</button>'+buttons;
    document.getElementById('ebs').innerHTML=buttons;
    document.getElementById('evp').style.display='block';
    setTimeout(()=>focusPanelFirst('#ebs .eb'),0);
  }
  completePrint(p){
    const o=p.order,earned=o.pay;
    const repGain=2+(o.filament&&o.filament.rep||0);
    G.gold+=earned;G.rep=Math.max(0,G.rep+repGain);G.stats.earn+=earned;this.earn+=earned;this.done++;
    G.orders=G.orders.filter(x=>x!==o);
    p.busy=false;p.order=null;p.progress=0;p._ev=null;p._pau=false;
    SFX.coin();
    const po=this.pObjs.find(x=>x.p===p);
    if(po){
      const coin=this.add.text(po.px,po.py-80,'+$'+earned,{fontSize:'12px',color:'#ffd700',fontFamily:'Courier New'}).setOrigin(.5).setDepth(12);
      this.tweens.add({targets:coin,y:coin.y-55,alpha:0,duration:1100,onComplete:()=>coin.destroy()});
      this.cameras.main.flash(200,0,200,100,.3);
    }
    showNotif('✅ '+o.pr.e+' '+o.pr.n+' — +$'+earned+(repGain!==2?' REP '+(repGain>0?'+':'')+repGain:''),'money');
    sLog('✅ P'+(p.id+1)+': '+o.pr.e+' '+o.pr.n+' con '+(o.filament?o.filament.n:o.material)+' — +$'+earned+' 🪙');
    this.updateHUD();
  }
  resPwr(panel){
    const pen=G.pType?G.pType.pen:.3;
    if(!G.upsLeft)G.printers.forEach(p=>{if(p._pau){p.progress=Math.max(0,p.progress-pen*.4);p._pau=false;}});
    G.pActive=false;G.pType=null;G.upsLeft=0;SFX.pwrOn();
    document.getElementById('pov').className='';
    document.getElementById('phud').style.display='none';
    document.getElementById('bkg').style.display='none';
    document.getElementById('ptag').className='ptag night';
    document.getElementById('ptag').textContent='🌙 NOCHE';
    G.block=false;this.drawTblN(false);
    this.cameras.main.flash(400,255,220,100,.4);
    showNotif(panel?'✅ Tablero restablecido!':'⚡ Luz volvió automáticamente.');
    if(panel)SFX.fix();
    sLog('💡 Luz restablecida. Las impresoras retoman.');
  }
  update(_t,dt){
    if(G.phase!=='night')return;
    if(G.pActive){
      G.pTimer-=dt;
      document.getElementById('ptf').style.width=(Math.max(0,G.pTimer/G.pMax)*100)+'%';
      if(G.upsLeft>0){G.upsLeft-=dt;if(G.upsLeft<=0){G.upsLeft=0;G.printers.forEach(p=>{if(p.busy&&!p.broken)p._pau=true;});}}
      if(G.pTimer<=0&&G.pType&&G.pType.id!=='micro')this.resPwr(false);
    }
    if(!G.block){
      const k=this.keys;let vx=0,vy=0;
      const spd=G.mateActive?1.5:Math.max(0.5,G.energy/100);
      if(k.a.isDown||k.lt.isDown){vx=-172*spd;this.dir=-1;}
      if(k.d.isDown||k.rt.isDown){vx=172*spd;this.dir=1;}
      if(k.w.isDown||k.up.isDown)vy=-103*spd;
      if(k.s.isDown||k.dn.isDown)vy=103*spd;
      this.player.x=Phaser.Math.Clamp(this.player.x+vx*dt/1000,28,this.W-28);
      this.player.y=Phaser.Math.Clamp(this.player.y+vy*dt/1000,this.H*.28,this.H*.82);
      this.pDir=setPlayerSpriteState(this.pSp,vx,vy,this.pDir);
      if(!this.pSp)this.player.scaleX=this.dir;
      this.fc.scaleX=this.dir;
      if(vx||vy){this.wt+=dt;this.st+=dt;if(this.wt>175){this.wb^=1;this.wt=0;this.player.y+=this.wb?-2:2;}if(this.st>360){this.st=0;SFX.step();}}
    }
    tickMate(dt);this.el+=dt;this.nBf.width=300*Math.min(1,this.el/this.dur);
    if(this.el>=this.dur){this.endNight();return;}
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
    });
    let near=null,md=95;
    this.pObjs.forEach(po=>{
      const d=Phaser.Math.Distance.Between(this.player.x,this.player.y,po.px,po.py+15);
      if(d<md){md=d;near=po;}
    });
    this.near=near;
    const dT=Phaser.Math.Distance.Between(this.player.x,this.player.y,this.tZone.x,this.tZone.y);
    const dS=Phaser.Math.Distance.Between(this.player.x,this.player.y,this.shopZone.x,this.shopZone.y);
    const dI=Phaser.Math.Distance.Between(this.player.x,this.player.y,this.invZone.x,this.invZone.y);
    if(G.pActive&&dT<90&&G.pType&&G.pType.id!=='micro'){
      this.iLbl.setVisible(true).setText('[E] Tablero!').setPosition(this.tZone.x,this.tZone.y-50);
      sHint('[E] Restablecé el tablero!');
    } else if(dS<78&&!G.block){
      this.iLbl.setVisible(true).setText('[E] Tienda').setPosition(this.shopZone.x,this.shopZone.y-44);
      sHint('[E] Comprar material');
    } else if(dI<78&&!G.block){
      this.iLbl.setVisible(true).setText('[E] Inventario').setPosition(this.invZone.x,this.invZone.y-44);
      sHint('[E] Inventario');
    } else if(near&&!G.block){
      this.iLbl.setVisible(true).setText('[E] Inspeccionar').setPosition(near.px,near.py-88);
      sHint('[E] Inspeccionar impresora');
    } else {
      this.iLbl.setVisible(false);
    }
    this.updateHUD();
  }
  updateHUD(){document.getElementById('hg').textContent=G.gold;document.getElementById('hr').textContent=G.rep;}
  endNight(){
    if(G.phase!=='night')return;
    G.phase='transition';G.block=true;G.day++;G.orders=[];
    let sal=0;
    Object.keys(G.emp).forEach(id=>{const e=EMP.find(x=>x.id===id);if(e){sal+=e.sal;G.gold=Math.max(0,G.gold-e.sal);}});
    doSave(G);
    const sub='Completados: '+this.done+' | Ganado: $'+this.earn+'\nREP: '+G.rep+(sal?' | Salarios: -$'+sal:'');
    this.scene.pause();
    doTrans('☀️  DÍA '+G.day,sub,()=>{this.scene.stop();this.scene.start('Day');});
  } // end endNight
} // end NightScene

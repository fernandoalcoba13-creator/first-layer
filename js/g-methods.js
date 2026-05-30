// ═══ G METHODS ═══
// Methods attached to G for shop, fixes, breakers, story screen.
// Called from HTML inline onclicks and Phaser scene logic.
G.bStk=function(k,c,id){
  if(id&&!betaShopAllows(k,id)){showNotif('🔒 '+tr('lockedToday'),'info');return;}
  if(!id&&!betaShopAllows(k,'')){showNotif('🔒 '+tr('lockedToday'),'info');return;}
  if(G.gold<c){showNotif('💸 '+tr('noFunds'),'error');return;}
  G.gold-=c;
  if(id&&G.stk[k])G.stk[k][id]=(G.stk[k][id]||0)+1;
  else G.stk[k]=(G.stk[k]||0)+1;
  if(G.phase==='day')G.dayBought=(G.dayBought||0)+1;
  const f=id&&filDef(k,id);
  SFX.coin();showNotif('✅ '+(f?f.n:k)+' comprado. $'+G.gold,'money');
  if(G.phase==='day'&&G.day===1&&k==='pla'&&id==='eco'){G.dayBoughtPlaBasic=true;showNotif(tr('dayOneLoadTip'),'info');sHint(tr('dayOneLoadTip'));}
  document.getElementById('hg').textContent=G.gold;
  doSave(G);
};
G.nFix=function(){const ns=game.scene.getScene('Night');const ev=ns&&ns.aEv;if(!ev)return;if(ev.g>0&&G.gold<ev.g){showNotif('💸 '+tr('noFunds'));return;}if(ev.pts>0&&G.stk.parts<ev.pts){showNotif('🔩 '+tr('noSpares'));return;}G.gold-=ev.g;G.stk.parts-=ev.pts;ev.printer._ev=null;ev.printer._pau=false;ns.aEv=null;document.getElementById('evp').style.display='none';G.block=false;G.nFixes=(G.nFixes||0)+1;G.stats.fix++;SFX.fix();showNotif('🔧 '+ev.ti+' OK','success');sLog('✅ '+ev.ti+' OK.');};
G.nAutoFix=function(){const ns=game.scene.getScene('Night');const ev=ns&&ns.aEv;if(!ev)return;ev.printer._ev=null;ev.printer._pau=false;ns.aEv=null;document.getElementById('evp').style.display='none';G.block=false;G.nFixes=(G.nFixes||0)+1;SFX.fix();showNotif('👨‍🔧 Rodrigo reparó: '+ev.ti);};
G.nSkip=function(){const ns=game.scene.getScene('Night');const ev=ns&&ns.aEv;if(!ev)return;G.rep=Math.max(0,G.rep-ev.rp);ev.printer.broken=true;ev.printer.busy=false;ev.printer._ev=null;ns.aEv=null;document.getElementById('evp').style.display='none';G.block=false;SFX.err();shakeUI();showNotif('⚠️ P'+(ev.printer.id+1)+' averiada. -'+ev.rp+' REP','error');};
G.startNozzleMini=function(){
  const ns=game.scene.getScene('Night'),ev=ns&&ns.aEv;if(!ev||ev.id!=='clog')return;
  ensureConsumables();
  if(BETA_DAYS[G.day]&&G.cons.cleaner<1)G.cons.cleaner=1;
  if((G.cons.cleaner||0)<=0){showNotif('🪡 '+tr('missing')+tr('cleaner'),'error');return;}
  document.getElementById('evp').style.display='none';
  G._mini={type:'nozzle',ev,time:36000,max:36000,phase:'needle',hits:0,needHits:3,power:0,targetA:66,targetB:82,hold:0,holdNeed:1100,heat:12,needleHeld:false,filamentHeld:false,done:false,tick:null};
  document.getElementById('miniGame').style.display='flex';
  {const ab=document.getElementById('mgAbandon');if(ab)ab.style.display=BETA_DAYS[G.day]?'none':'';}
  document.getElementById('mgTitle').textContent='🚫 '+tr('nozzleTitle')+' - P'+(ev.printer.id+1);
  document.getElementById('mgDesc').textContent=G.lang==='en'?'Use the needle from below and push filament from above. Work inside the sensitivity zone.':'Usá la aguja desde abajo y empujá filamento desde arriba. Trabajá dentro de la zona sensible.';
  document.getElementById('mgTimerFill').style.width='100%';
  G.renderNozzleMini();
  G._mini.tick=setInterval(()=>{
    if(!G._mini)return;
    const m=G._mini;
    m.time-=250;
    m.power=Math.max(0,m.power-3.6);
    const inZone=m.power>=m.targetA&&m.power<=m.targetB;
    if(inZone){
      m.hold+=250;
      if(m.hold>=m.holdNeed)G.completeNozzleHold();
    } else {
      m.hold=Math.max(0,m.hold-350);
      if(m.power>m.targetB)m.heat=Math.min(100,m.heat+2.5);
    }
    m.heat=Math.max(0,m.heat-.45);
    document.getElementById('mgTimerFill').style.width=Math.max(0,m.time/m.max*100)+'%';
    G.renderNozzleMini();
    if(m.heat>=100||m.time<=0)G.failNozzleMini();
  },250);
  SFX.clk();
};
G.renderNozzleMini=function(){
  if(!G._mini)return;
  const m=G._mini;
  if(m.type==='nozzle'){
    const isNeedle=m.phase==='needle',phaseName=G.lang==='en'?(isNeedle?'Needle':'Filament'):(isNeedle?'Aguja':'Filamento');
    const key=G.lang==='en'?(isNeedle?'Tap ALT':'Tap SPACE'):(isNeedle?'Apreta ALT':'Apreta ESPACIO');
    const stable=Math.min(100,m.hold/m.holdNeed*100);
    document.getElementById('mgGrid').innerHTML=
      '<div class="nozzleGame">'+
        '<div class="nzPhase">'+phaseName+' '+m.hits+'/'+m.needHits+'</div>'+
        '<div class="nzGauge"><span style="left:'+m.targetA+'%;width:'+(m.targetB-m.targetA)+'%"></span><b style="width:'+m.power+'%"></b><i style="left:'+m.power+'%"></i></div>'+
        '<div class="nzCut">'+
          '<div class="nzTube"></div><div class="nzHeat" style="opacity:'+(m.heat/100)+'"></div>'+
          '<div class="nzClog" style="top:52%"></div>'+
          '<div class="nzFilament" style="height:'+(isNeedle?10:Math.max(10,m.power*.78))+'%"></div>'+
          '<div class="nzNeedle" style="height:'+(isNeedle?Math.max(10,m.power*.78):10)+'%"></div>'+
        '</div>'+
        '<div class="nzStats">'+
          '<b>'+key+' | '+Math.floor(stable)+'%</b><b class="'+(m.heat>70?'hot':'')+'">'+(G.lang==='en'?'Burn ':'Quemadura ')+Math.floor(m.heat)+'%</b>'+
        '</div>'+
        '<div class="mgBtns"><button onclick="G.applyNozzleMove(\'needle\',1)">ALT ↑</button><button onclick="G.applyNozzleMove(\'filament\',1)">SPACE ↓</button></div>'+
      '</div>';
    document.getElementById('mgHint').textContent=(G.lang==='en'?'Tap to fill, then keep it inside the green target. ':'Apreta para llenar y mantenela en la meta verde. ')+Math.ceil(m.time/1000)+'s';
    return;
  }
};
G.holdNozzleInput=function(which,on){
  const m=G._mini;if(!m||m.type!=='nozzle')return;
  if(which==='needle')m.needleHeld=on;
  if(which==='filament')m.filamentHeld=on;
};
G.applyNozzleMove=function(which,power){
  const m=G._mini;if(!m||m.done||m.type!=='nozzle')return;
  if(which!==m.phase){m.heat=Math.min(100,m.heat+3);G.renderNozzleMini();return;}
  m.power=Math.min(112,m.power+(power||1)*9.5);
  if(m.power>m.targetB){m.heat=Math.min(100,m.heat+4);SFX.err();}
  else SFX.clk();
  G.renderNozzleMini();
};
G.completeNozzleHold=function(){
  const m=G._mini;if(!m||m.done||m.type!=='nozzle')return;
  m.hits++;m.power=0;m.hold=0;m.heat=Math.max(0,m.heat-6);SFX.ok();
  if(m.hits>=m.needHits){
    if(m.phase==='needle'){m.phase='filament';m.hits=0;showNotif(G.lang==='en'?'Needle pass clear. Push filament.':'Aguja lista. Ahora empuja filamento.','success');}
    else{m.done=true;setTimeout(()=>G.winNozzleMini(),160);}
  }
};
G.moveNozzleMaze=function(dx,dy){if(G._mini&&G._mini.type==='nozzle')G.applyNozzleMove(dy<0?'needle':'filament',1);};
G.startBedMini=function(){
  const ns=game.scene.getScene('Night'),ev=ns&&ns.aEv;if(!ev||ev.id!=='bed')return;
  if(ev.g>0&&G.gold<ev.g){showNotif('💸 '+tr('noFunds'));return;}
  document.getElementById('evp').style.display='none';
  const seq=[0,1,2,3].sort(()=>Math.random()-.5);
  G._mini={type:'bed',ev,time:25000,max:25000,seq,idx:0,done:false,tick:null};
  document.getElementById('miniGame').style.display='flex';
  {const ab=document.getElementById('mgAbandon');if(ab)ab.style.display=BETA_DAYS[G.day]?'none':'';}
  document.getElementById('mgTitle').textContent='📐 '+tr('bedTitle')+' - P'+(ev.printer.id+1);
  document.getElementById('mgDesc').textContent=tr('bedDesc');
  document.getElementById('mgTimerFill').style.width='100%';
  G.renderBedMini();
  G._mini.tick=setInterval(()=>{if(!G._mini)return;G._mini.time-=250;document.getElementById('mgTimerFill').style.width=Math.max(0,G._mini.time/G._mini.max*100)+'%';G.renderBedMini();if(G._mini.time<=0)G.failNozzleMini();},250);
};
G.renderBedMini=function(){
  const m=G._mini;if(!m||m.type!=='bed')return;
  const labels=['↖','↗','↙','↘'];
  document.getElementById('mgGrid').innerHTML=labels.map((l,i)=>'<button class="mgCell exit '+(m.seq[m.idx]===i?'here':'')+'" onclick="G.tapBedMini('+i+')">'+l+'</button>').join('')+
    '<div class="mgBtns" style="grid-column:1/-1">'+m.seq.map(i=>labels[i]).join(' ')+'</div>';
  document.getElementById('mgHint').textContent=(G.lang==='en'?'Corner ':'Esquina ')+(m.idx+1)+'/'+m.seq.length+' | '+Math.ceil(m.time/1000)+'s';
};
G.tapBedMini=function(i){
  const m=G._mini;if(!m||m.type!=='bed'||m.done)return;
  if(m.seq[m.idx]!==i){m.idx=0;SFX.err();shakeUI();G.renderBedMini();return;}
  m.idx++;SFX.clk();if(m.idx>=m.seq.length){m.done=true;setTimeout(()=>G.winNozzleMini(),120);}else G.renderBedMini();
};
G.winNozzleMini=function(){
  if(!G._mini)return;
  const type=G._mini.type,ev=G._mini.ev;
  clearInterval(G._mini.tick);G._mini=null;document.getElementById('miniGame').style.display='none';
  if(type==='nozzle'&&ev){
    ev.printer._ev=null;ev.printer._pau=false;
    const ns=game.scene.getScene('Night');if(ns)ns.aEv=null;
    document.getElementById('evp').style.display='none';G.block=false;G.nFixes=(G.nFixes||0)+1;G.stats.fix++;
    SFX.fix();showNotif('🪡 '+tr('nozzleCleaned'),'success');sLog('P'+(ev.printer.id+1)+': '+tr('nozzleCleaned'));return;
  }
  G.nFix();
};
G.failNozzleMini=function(){
  if(!G._mini)return;
  const type=G._mini.type,ev=G._mini.ev;
  clearInterval(G._mini.tick);G._mini=null;document.getElementById('miniGame').style.display='none';
  if(BETA_DAYS[G.day]&&ev){
    // Beta: the minigame can't be skipped — re-present the failure so the player retries the job.
    SFX.err();shakeUI();showNotif((type==='bed'?tr('bedFail'):tr('nozzleFailed'))+' — '+tr('tryAgain'),'error');
    const ns=game.scene.getScene('Night');
    if(ns){ns.aEv=ns.aEv||ev;ev.printer._ev=ev;G.block=true;if(ns.showEv)ns.showEv(ns.aEv);}
    return;
  }
  showNotif(type==='bed'?tr('bedFail'):tr('nozzleFailed'),'error');G.nSkip();
};
G.cancelMiniGame=function(){G.failNozzleMini();};
G._bk=function(seq){
  const ns=game.scene.getScene('Night');if(!ns)return;
  // Find position value for this button (bkOrd[seq])
  const pos=G._bkOrd[seq];
  const expectedPos=G._bkNext;
  if(pos===expectedPos){
    document.getElementById('bk'+seq).classList.add('up');
    G._bkNext++;SFX.clk();
    document.getElementById('bhint').textContent=G._bkNext<G._bkNum?'✅ '+trf('nowBreaker',{num:G._bkNext+1}):tr('completed');
    if(G._bkNext>=G._bkNum)setTimeout(()=>{document.getElementById('bkg').style.display='none';ns.resPwr(true);},600);
  } else {
    const b=document.getElementById('bk'+seq);
    b.classList.add('bad');setTimeout(()=>b.classList.remove('bad'),300);
    G._bkNext=0;document.querySelectorAll('.bk').forEach(b=>b.classList.remove('up'));
    document.getElementById('bhint').textContent='❌ '+tr('wrongOrder');SFX.err();
  }
};
G._dcb=function(i){const cb=G._dch&&G._dch[i]&&G._dch[i].cb;if(cb)cb();};
G.syncPrinters=function(){
  for(let i=0;i<4;i++){
    if(!G.printers[i])G.printers[i]={id:i,locked:true,broken:false,busy:false,order:null,progress:0,_ev:null,_pau:false};
    G.printers[i].locked=i>=G.pCount;
  }
};
G.openShop=function(t){G.stab=t||G.stab||'up';G.tab(G.stab);document.getElementById('shop').style.display='block';G.block=true;setTimeout(()=>focusPanelFirst('#shop .st.on,#shop .st,#sg .si:not(.sb),#shop .shopClose'),0);};
G._bUpg=function(id){const u=UPG.find(x=>x.id===id);if(!u||G.upg[id])return;if(!betaShopAllows('upg',id)){showNotif(betaEverAllows('upg',id)?'🔒 '+tr('lockedToday'):'⭐ '+tr('fullGameMsg'),'info');return;}if(u.req&&!G.upg[u.req]){showNotif('⚠️ '+tr('needs')+u.req);return;}if(G.gold<u.co){showNotif('💸 '+tr('noFunds'));return;}G.gold-=u.co;G.upg[id]=true;if(id.indexOf('unlock')===0)G.syncPrinters();SFX.ok();showNotif('✅ '+u.ic+' '+u.n+' OK');doSave(G);G.tab(G.stab);document.getElementById('hg').textContent=G.gold;};
G._hEmp=function(id){const e=EMP.find(x=>x.id===id);if(!e||G.emp[id])return;if(!betaShopAllows('emp',id)){showNotif(betaEverAllows('emp',id)?'🔒 '+tr('lockedToday'):'⭐ '+tr('fullGameMsg'),'info');return;}if(G.gold<e.co){showNotif('💸 '+tr('noFunds'));return;}G.gold-=e.co;G.emp[id]=true;SFX.up();showNotif('✅ '+e.ic+' '+e.n+' OK');doSave(G);G.tab('emp');};
G.cShop=function(){
  document.getElementById('shop').style.display='none';G.block=false;
};
G.showSto=function(ti,tx,ob){G.block=true;document.getElementById('sh').textContent=ti;document.getElementById('sp').textContent=tx+(ob?'\n\n🎯 Objetivo: '+ob:'');document.getElementById('sto').style.display='block';};
G.cSto=function(){document.getElementById('sto').style.display='none';G.block=false;};
G.showInventory=function(){
  const orders=(G.orders||[]).map(o=>'• '+o.pr.e+' '+o.pr.n+' — '+o.material+' x'+o.units+(o.filament?' | '+o.filament.n:o.waitingMaterial?' | '+tr('missingMaterial'):'')).join('\n')||tr('noQueuedOrders');
  G.showSto(tr('inventory'),
    stockLine('pla')+'\n'+stockLine('petg')+'\n'+stockLine('tpu')+'\n'+stockLine('resin')+'\n'+tr('partsName')+': '+G.stk.parts+'\n\nCola:\n'+orders,
    null);
};

// Inventory v2: tabbed stock, queued orders, and consumables.
G.showSto=function(ti,tx,ob){
  G.block=true;
  document.getElementById('sh').textContent=ti;
  const tabs=document.getElementById('stoTabs'),acts=document.getElementById('stoActions');
  if(tabs)tabs.innerHTML='';
  if(acts)acts.innerHTML='';
  const sp=document.getElementById('sp');sp.className='';sp.textContent=tx+(ob?'\n\n'+tr('objectiveLabel')+': '+ob:'');
  document.getElementById('sto').style.display='block';
};
function consumableDefs(){
  return {
    coffee:{n:tr('coffee'),ic:'☕',c:45,de:tr('coffeeDesc')},
    mate:{n:tr('mateConsumable'),ic:'🧉',c:55,de:tr('mateDesc')},
    bar:{n:tr('bar'),ic:'🍫',c:35,de:tr('barDesc')},
    sandwich:{n:tr('sandwich'),ic:'🥪',c:75,de:tr('sandwichDesc')},
    cleaner:{n:tr('cleaner'),ic:'🪡',c:180,de:tr('cleanerDesc')}
  };
}
G.buyConsumable=function(id){
  const defs=consumableDefs();
  const it=defs[id];if(!it)return;
  if(!betaShopAllows('cons',id)){showNotif('🔒 '+tr('lockedToday'),'info');return;}
  if(G.gold<it.c){showNotif(tr('noFunds'),'error');return;}
  ensureConsumables();
  G.gold-=it.c;G.cons[id]=(G.cons[id]||0)+1;
  if(G.phase==='day')G.dayBought=(G.dayBought||0)+1;
  SFX.coin();showNotif(it.n+' +1','money');
  document.getElementById('hg').textContent=G.gold;
  doSave(G);
  if(typeof isShown==='function'&&isShown('sto'))G.showInventory('cons');
};
G.useConsumable=function(id){
  ensureConsumables();
  const defs=consumableDefs(),it=defs[id];if(!it)return;
  if((G.cons[id]||0)<=0){showNotif((G.lang==='en'?'No ':'Sin ')+it.n,'error');return;}
  if(id==='coffee'){
    if(G.mateActive){showNotif(tr('alreadyTurbo'),'info');return;}
    G.cons.coffee--;startTurbo(12000,30,'☕ '+tr('coffee')+' +30 '+tr('energy')+' | TURBO');
  } else if(id==='mate'){
    if(G.mateActive){showNotif(tr('alreadyTurbo'),'info');return;}
    G.cons.mate--;startTurbo(30000,40,'🧉 '+tr('mateConsumable')+' +40 '+tr('energy')+' | TURBO');
  } else if(id==='bar'){
    G.cons.bar--;G.energy=Math.min(100,G.energy+20);G.stress=Math.max(0,(G.stress||0)-8);
    SFX.up();showNotif(tr('bar')+' +20 '+tr('energy')+', -8 '+tr('stress'),'success');
    updateMateHUD();
  } else if(id==='sandwich'){
    G.cons.sandwich--;G.energy=Math.min(100,G.energy+35);G.stress=Math.max(0,(G.stress||0)-15);
    SFX.up();showNotif(tr('sandwich')+' +35 '+tr('energy')+', -15 '+tr('stress'),'success');
    updateMateHUD();
  } else if(id==='cleaner'){
    showNotif(tr('saveForNozzle'),'info');return;
  }
  doSave(G);
  if(typeof isShown==='function'&&isShown('sto'))G.showInventory('cons');
};
G.showInventory=function(tab){
  ensureConsumables();
  ensureStockShape();
  G.invTab=tab||G.invTab||'mat';
  G.block=true;
  document.getElementById('sh').textContent=tr('inventory');
  document.getElementById('sto').style.display='block';
  const tabs=document.getElementById('stoTabs'),sp=document.getElementById('sp'),acts=document.getElementById('stoActions');
  const mk=(id,txt)=>'<button class="stoTab '+(G.invTab===id?'on':'')+'" data-inv-tab="'+id+'" onclick="G.showInventory(\''+id+'\')">'+txt+'</button>';
  tabs.innerHTML=mk('mat',tr('materialsTab'))+mk('orders',tr('ordersTab'))+mk('cons',tr('consumablesTab'));
  acts.innerHTML='';
  sp.className='invGrid';
  const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const card=(ic,title,qty,body,actions,good)=>'<div class="invCard '+(good?'good':'')+'"><div class="invTop"><div class="invIc">'+ic+'</div><div><h4>'+esc(title)+'</h4>'+(body?'<p>'+body+'</p>':'')+'</div><div class="invQty">'+qty+'</div></div>'+(actions?'<div class="invActions">'+actions+'</div>':'')+'</div>';
  const btn=(cls,txt,fn)=>'<button class="eb '+cls+'" onclick="'+fn+'">'+txt+'</button>';
  const matCard=(mat,ic)=>{
    const total=matStock(mat);
    const detail=(FILAMENTS[mat]||[]).map(f=>'<span>'+esc(f.n)+': <b>'+(G.stk[mat][f.id]||0)+'</b></span>').join('<br>');
    return card(ic,mat.toUpperCase(),total,'<span class="invBreak">'+detail+'</span>','',total>0);
  };
  if(G.invTab==='orders'){
    const orders=(G.orders||[]);
    sp.innerHTML=orders.length?orders.map(o=>{
      const status=o.filament?o.filament.n:o.waitingMaterial?tr('missingMaterial'):tr('queued');
      const body='<span class="invMeta">'+esc(o.cl.n)+' | '+esc(o.material.toUpperCase())+' x'+o.units+' | $'+o.pay+'</span><br>'+esc(status);
      return card(o.pr.e,o.pr.n,o.loaded?'P'+o.loaded:'',body,'',!!o.filament);
    }).join(''):'<div class="invEmpty">'+tr('noQueuedOrders')+'</div>';
  } else if(G.invTab==='cons'){
    const defs=consumableDefs();
    sp.innerHTML=Object.keys(defs).map(id=>{
      const it=defs[id],qty=G.cons[id]||0,locked=!betaShopAllows('cons',id);
      const buyTxt=locked?tr('lockedToday'):tr('buy')+' $'+it.c;
      const actions=btn('fix',tr('use'),"G.useConsumable('"+id+"')")+btn('',buyTxt,"G.buyConsumable('"+id+"')");
      return card(it.ic,it.n,qty,esc(it.de),actions,qty>0);
    }).join('')+'<div class="invEmpty">'+tr('consHint')+'</div>';
  } else {
    G.invTab='mat';
    sp.innerHTML=matCard('pla','🧵')+matCard('petg','🧶')+matCard('tpu','🪢')+matCard('resin','🧪')+card('🔩',tr('partsName'),G.stk.parts,esc(tr('partsDesc')),'',G.stk.parts>0);
  }
  setTimeout(()=>{const b=document.querySelector('#stoTabs .stoTab.on');if(b)b.focus();},0);
};

// Shop v2 renderer: overrides the compact prototype shop with richer cards.
G.shopStats=function(){
  const hired=EMP.filter(e=>G.emp[e.id]).length,total=matStock('pla')+matStock('petg')+matStock('tpu')+matStock('resin')+G.stk.parts;
  document.getElementById('shopStats').innerHTML=[
    [tr('cash'),'$'+G.gold],[tr('printers'),G.pCount+'/4'],[tr('stock'),total],[tr('team'),hired+'/'+EMP.length]
  ].map(([k,v])=>'<div class="shopStat"><b>'+k+'</b><span>'+v+'</span></div>').join('');
};
G.shopCard=function(o){
  const fg=o.fullGame&&!o.done;
  const cls='si '+(o.done?'sb':fg?'sl sfg':o.locked?'sl':o.can?'sa':'');
  const action=o.done?tr('ready'):fg?'★':o.locked?tr('locked'):o.can?tr('buy'):tr('noMoney');
  const meta=o.done?'<div class="stg">'+(o.doneText||'Listo')+'</div>':(fg||o.locked)?'<div class="slock">'+(o.lockedText||'')+'</div>':'<div class="sc">$'+o.cost+'</div>';
  return '<div class="'+cls+'" tabindex="0" '+o.attr+'><div class="siTop"><div class="siIc">'+o.icon+'</div><div><h4>'+o.name+'</h4><p>'+o.desc+'</p></div></div><div class="siFoot">'+meta+'<span class="sact">'+action+'</span></div></div>';
};
function betaShopAllows(kind,id){
  const b=BETA_DAYS[G.day];if(!b||!b.shop)return true;
  if(kind==='parts')return b.shop.includes('parts');
  if(kind==='cons')return b.shop.includes(id);
  if(kind==='upg')return b.shop.includes(id);
  if(kind==='emp')return b.shop.includes('emp:'+id);
  return b.shop.includes(kind+':'+id);
}
// True if the item appears in ANY beta day's shop. If not, it's full-game-only content
// (the 3-day demo never sells it) — we surface that honestly instead of "bloqueado hoy".
function betaEverAllows(kind,id){
  for(const d in BETA_DAYS){
    const b=BETA_DAYS[d];if(!b||!b.shop)return true;
    if(kind==='parts'){if(b.shop.includes('parts'))return true;}
    else if(kind==='emp'){if(b.shop.includes('emp:'+id))return true;}
    else if(kind==='cons'){if(b.shop.includes(id))return true;}
    else if(kind==='upg'){if(b.shop.includes(id))return true;}
    else if(b.shop.includes(kind+':'+id))return true;
  }
  return false;
}
G.tab=function(t){
  G.stab=t;
  document.querySelectorAll('.st').forEach((el,i)=>el.classList.toggle('on',['up','emp','stk'][i]===t));
  G.shopStats();
  document.getElementById('shopSub').textContent=t==='up'?tr('upSub'):t==='emp'?tr('empSub'):tr('stkSub');
  const sg=document.getElementById('sg'),sgNew=sg.cloneNode(false);sg.parentNode.replaceChild(sgNew,sg);
  const s=sgNew;
  if(t==='up'){
    s.style.gridTemplateColumns='repeat(3,1fr)';
    s.innerHTML=UPG.map(u=>{const b=!!G.upg[u.id],dayLock=!betaShopAllows('upg',u.id),fg=!betaEverAllows('upg',u.id),reqLock=u.req&&!G.upg[u.req],lk=dayLock||reqLock,af=G.gold>=u.co;return G.shopCard({icon:u.ic,name:u.n,desc:u.de,cost:u.co,done:b,can:af&&!lk,locked:lk,fullGame:fg,lockedText:fg?tr('fullGameMsg'):dayLock?tr('lockedToday'):tr('needs')+u.req,doneText:tr('installed'),attr:'data-upg="'+u.id+'"'});}).join('');
    s.addEventListener('click',e=>{const d=e.target.closest('[data-upg]');if(d)G._bUpg(d.dataset.upg);});
  } else if(t==='emp'){
    s.style.gridTemplateColumns='repeat(3,1fr)';
    s.innerHTML=EMP.map(e=>{const h=!!G.emp[e.id],dayLock=!betaShopAllows('emp',e.id),fg=!betaEverAllows('emp',e.id),af=G.gold>=e.co;return G.shopCard({icon:e.ic,name:e.n,desc:e.de+' | '+tr('salary')+' $'+e.sal+'/noche',cost:e.co,done:h,can:af&&!dayLock,locked:dayLock,fullGame:fg,lockedText:fg?tr('fullGameMsg'):tr('lockedToday'),doneText:tr('hired'),attr:'data-emp="'+e.id+'"'});}).join('');
    s.addEventListener('click',e=>{const d=e.target.closest('[data-emp]');if(d)G._hEmp(d.dataset.emp);});
  } else {
    s.style.gridTemplateColumns='repeat(3,1fr)';
    const items=[];
    ['pla','petg','tpu','resin'].forEach(mat=>{
      (FILAMENTS[mat]||[]).forEach(f=>{
        const c=getFilPrice(mat,f.id);
        items.push({mat,f,c,ic:mat==='resin'?'🧪':'🧵',locked:!betaShopAllows(mat,f.id)});
      });
    });
    items.push({mat:'parts',f:{id:'',n:tr('partsName'),de:tr('partsDesc'),q:2},c:G.market.parts.cur,ic:'🔩',locked:!betaShopAllows('parts','')});
    Object.keys(consumableDefs()).forEach(id=>{
      const it=consumableDefs()[id];
      items.push({cons:id,ic:it.ic,n:it.n,de:it.de,c:it.c,locked:!betaShopAllows('cons',id)});
    });
    items.sort((a,b)=>(a.cons?1:0)-(b.cons?1:0)||a.c-b.c);
    s.innerHTML=items.map(o=>o.cons
      ?G.shopCard({icon:o.ic,name:o.n,desc:o.de,cost:o.c,done:false,can:G.gold>=o.c&&!o.locked,locked:o.locked,lockedText:tr('lockedToday'),attr:'data-cons="'+o.cons+'"'})
      :G.shopCard({icon:o.ic,name:o.f.n,desc:o.f.tier?tr('tier')+' '+filTier(o.f)+' | '+tr('stock')+' '+(G.stk[o.mat][o.f.id]||0)+' | '+tr('risk')+' '+(o.f.risk>0?'+':'')+Math.round(o.f.risk*100)+'%\n'+filDesc(o.f):tr('stock')+' '+G.stk.parts+'\n'+o.f.de,cost:o.c,done:false,can:G.gold>=o.c&&!o.locked,locked:o.locked,lockedText:tr('lockedToday'),attr:'data-stk="'+o.mat+'" data-id="'+o.f.id+'" data-cost="'+o.c+'"'})).join('');
    s.addEventListener('click',e=>{const d=e.target.closest('[data-stk]'),c=e.target.closest('[data-cons]');if(d){if(d.classList.contains('sl')){showNotif('🔒 '+tr('lockedToday'),'info');return;}G.bStk(d.dataset.stk,Number(d.dataset.cost),d.dataset.id);G.tab('stk');}else if(c){if(c.classList.contains('sl')){showNotif('🔒 '+tr('lockedToday'),'info');return;}G.buyConsumable(c.dataset.cons);G.tab('stk');}});
  }
};

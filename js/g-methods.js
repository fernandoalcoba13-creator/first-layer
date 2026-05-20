// ═══ G METHODS ═══
// Methods attached to G for shop, fixes, breakers, story screen.
// Called from HTML inline onclicks and Phaser scene logic.
G.bStk=function(k,c,id){
  if(G.gold<c){showNotif('💸 Sin fondos','error');return;}
  G.gold-=c;
  if(id&&G.stk[k])G.stk[k][id]=(G.stk[k][id]||0)+1;
  else G.stk[k]=(G.stk[k]||0)+1;
  const f=id&&filDef(k,id);
  SFX.coin();showNotif('✅ '+(f?f.n:k)+' comprado. $'+G.gold,'money');
  document.getElementById('hg').textContent=G.gold;
};
G.nFix=function(){const ns=game.scene.getScene('Night');const ev=ns&&ns.aEv;if(!ev)return;if(ev.g>0&&G.gold<ev.g){showNotif('💸 Sin fondos');return;}if(ev.pts>0&&G.stk.parts<ev.pts){showNotif('🔩 Sin repuestos');return;}G.gold-=ev.g;G.stk.parts-=ev.pts;ev.printer._ev=null;ev.printer._pau=false;ns.aEv=null;document.getElementById('evp').style.display='none';G.block=false;G.nFixes=(G.nFixes||0)+1;G.stats.fix++;SFX.fix();showNotif('🔧 '+ev.ti+' reparado!','success');sLog('✅ '+ev.ti+' resuelto.');};
G.nAutoFix=function(){const ns=game.scene.getScene('Night');const ev=ns&&ns.aEv;if(!ev)return;ev.printer._ev=null;ev.printer._pau=false;ns.aEv=null;document.getElementById('evp').style.display='none';G.block=false;G.nFixes=(G.nFixes||0)+1;SFX.fix();showNotif('👨‍🔧 Rodrigo reparó: '+ev.ti);};
G.nSkip=function(){const ns=game.scene.getScene('Night');const ev=ns&&ns.aEv;if(!ev)return;G.rep=Math.max(0,G.rep-ev.rp);ev.printer.broken=true;ev.printer.busy=false;ev.printer._ev=null;ns.aEv=null;document.getElementById('evp').style.display='none';G.block=false;SFX.err();shakeUI();showNotif('⚠️ P'+(ev.printer.id+1)+' averiada. -'+ev.rp+' REP','error');};
G.startNozzleMini=function(){
  const ns=game.scene.getScene('Night'),ev=ns&&ns.aEv;if(!ev||ev.id!=='clog')return;
  if(G.stk.parts<ev.pts){showNotif('🔩 Sin repuestos');return;}
  document.getElementById('evp').style.display='none';
  const lvl=Math.min(5,Math.floor((G.day-1)/2)+(ev.printer&&ev.printer.order?Math.floor((ev.printer.order.diff||1)-1):0));
  G._mini={ev,time:Math.max(5200,9000-lvl*650),max:Math.max(5200,9000-lvl*650),heat:18,dir:1,hits:0,need:3+(lvl>=3?1:0),lo:42+lvl*2,hi:58-lvl*2,spd:4.4+lvl*.45,tick:null,done:false};
  document.getElementById('miniGame').style.display='flex';
  document.getElementById('mgTitle').textContent='🚫 Limpiar pico - P'+(ev.printer.id+1);
  document.getElementById('mgDesc').textContent='Esperá la zona verde y limpiá el nozzle tres veces.';
  document.getElementById('mgTimerFill').style.width='100%';
  G.renderNozzleMini();
  G._mini.tick=setInterval(()=>{
    if(!G._mini)return;
    const m=G._mini;
    m.time-=80;m.heat+=m.dir*m.spd;
    if(m.heat>=96){m.heat=96;m.dir=-1;}
    if(m.heat<=8){m.heat=8;m.dir=1;}
    document.getElementById('mgTimerFill').style.width=Math.max(0,m.time/m.max*100)+'%';
    G.renderNozzleMini();
    if(m.time<=0)G.failNozzleMini();
  },80);
  SFX.clk();
};
G.renderNozzleMini=function(){
  if(!G._mini)return;
  const m=G._mini,ok=m.heat>=m.lo&&m.heat<=m.hi,heat=Math.round(m.heat);
  document.getElementById('mgGrid').innerHTML='<div class="mgCorner '+(ok?'ok':'')+'" style="grid-column:1/-1"><b>Temperatura del pico</b><div class="mgVal">'+heat+'%</div><div class="mgBar"><i style="width:'+heat+'%"></i></div><div class="mgBtns"><button style="width:120px" onclick="G.scrapeNozzle()">Limpiar</button></div></div>';
  document.getElementById('mgHint').textContent='Limpiezas buenas: '+m.hits+'/'+m.need+' | Zona verde: '+m.lo+' a '+m.hi;
};
G.scrapeNozzle=function(){
  if(!G._mini||G._mini.done)return;
  const ok=G._mini.heat>=G._mini.lo&&G._mini.heat<=G._mini.hi;
  if(ok){G._mini.hits++;SFX.ok();showNotif('Limpieza perfecta '+G._mini.hits+'/'+G._mini.need,'success');}
  else{G._mini.time=Math.max(0,G._mini.time-1500);SFX.err();shakeUI();showNotif('Rayaste el nozzle. -tiempo','error');}
  if(G._mini.hits>=G._mini.need){G._mini.done=true;setTimeout(()=>G.winNozzleMini(),180);}
};
G.winNozzleMini=function(){if(!G._mini)return;clearInterval(G._mini.tick);G._mini=null;document.getElementById('miniGame').style.display='none';G.nFix();};
G.failNozzleMini=function(){if(!G._mini)return;clearInterval(G._mini.tick);G._mini=null;document.getElementById('miniGame').style.display='none';showNotif('El pico quedó obstruido. La impresora queda fuera.','error');G.nSkip();};
G.cancelMiniGame=function(){G.failNozzleMini();};
G._bk=function(seq){
  const ns=game.scene.getScene('Night');if(!ns)return;
  // Find position value for this button (bkOrd[seq])
  const pos=G._bkOrd[seq];
  const expectedPos=G._bkNext;
  if(pos===expectedPos){
    document.getElementById('bk'+seq).classList.add('up');
    G._bkNext++;SFX.clk();
    document.getElementById('bhint').textContent=G._bkNext<G._bkNum?'✅ Ahora el '+(G._bkNext+1):'¡Completado!';
    if(G._bkNext>=G._bkNum)setTimeout(()=>{document.getElementById('bkg').style.display='none';ns.resPwr(true);},600);
  } else {
    const b=document.getElementById('bk'+seq);
    b.classList.add('bad');setTimeout(()=>b.classList.remove('bad'),300);
    G._bkNext=0;document.querySelectorAll('.bk').forEach(b=>b.classList.remove('up'));
    document.getElementById('bhint').textContent='❌ Orden incorrecto. Empezá de nuevo.';SFX.err();
  }
};
G._dcb=function(i){const cb=G._dch&&G._dch[i]&&G._dch[i].cb;if(cb)cb();};
G.syncPrinters=function(){
  for(let i=0;i<4;i++){
    if(!G.printers[i])G.printers[i]={id:i,locked:true,broken:false,busy:false,order:null,progress:0,_ev:null,_pau:false};
    G.printers[i].locked=i>=G.pCount;
  }
};
G.openShop=function(t){G.stab=t||G.stab||'up';G.tab(G.stab);document.getElementById('shop').style.display='block';G.block=true;};
G._bUpg=function(id){const u=UPG.find(x=>x.id===id);if(!u||G.upg[id])return;if(u.req&&!G.upg[u.req]){showNotif('⚠️ Requiere: '+u.req);return;}if(G.gold<u.co){showNotif('💸 Sin fondos');return;}G.gold-=u.co;G.upg[id]=true;if(id.indexOf('unlock')===0)G.syncPrinters();SFX.ok();showNotif('✅ '+u.ic+' '+u.n+' activado!');doSave(G);G.tab(G.stab);document.getElementById('hg').textContent=G.gold;};
G._hEmp=function(id){const e=EMP.find(x=>x.id===id);if(!e||G.emp[id])return;if(G.gold<e.co){showNotif('💸 Sin fondos');return;}G.gold-=e.co;G.emp[id]=true;SFX.up();showNotif('✅ '+e.ic+' '+e.n+' contratado!');doSave(G);G.tab('emp');};
G.cShop=function(){
  document.getElementById('shop').style.display='none';G.block=false;
  const ns=game.scene.getScene('Night');
  if(ns&&G.phase==='night'&&typeof ns.assignOrders==='function')ns.assignOrders();
};
G.showSto=function(ti,tx,ob){G.block=true;document.getElementById('sh').textContent=ti;document.getElementById('sp').textContent=tx+(ob?'\n\n🎯 Objetivo: '+ob:'');document.getElementById('sto').style.display='block';};
G.cSto=function(){document.getElementById('sto').style.display='none';G.block=false;};
G.showInventory=function(){
  const orders=(G.orders||[]).map(o=>'• '+o.pr.e+' '+o.pr.n+' — '+o.material+' x'+o.units+(o.filament?' | '+o.filament.n:o.waitingMaterial?' | falta material':'')).join('\n')||'Sin pedidos en cola.';
  G.showSto('Inventario',
    stockLine('pla')+'\n'+stockLine('petg')+'\n'+stockLine('resin')+'\n'+tr('partsName')+': '+G.stk.parts+'\n\nCola:\n'+orders,
    null);
};

// Inventory v2: tabbed stock, queued orders, and consumables.
G.showSto=function(ti,tx,ob){
  G.block=true;
  document.getElementById('sh').textContent=ti;
  const tabs=document.getElementById('stoTabs'),acts=document.getElementById('stoActions');
  if(tabs)tabs.innerHTML='';
  if(acts)acts.innerHTML='';
  document.getElementById('sp').textContent=tx+(ob?'\n\nObjetivo: '+ob:'');
  document.getElementById('sto').style.display='block';
};
G.buyConsumable=function(id){
  const defs={coffee:{n:tr('coffee'),c:45},bar:{n:tr('bar'),c:35},cleaner:{n:tr('cleaner'),c:70}};
  const it=defs[id];if(!it)return;
  if(G.gold<it.c){showNotif('Sin fondos','error');return;}
  ensureConsumables();
  G.gold-=it.c;G.cons[id]=(G.cons[id]||0)+1;
  SFX.coin();showNotif(it.n+' +1','money');
  document.getElementById('hg').textContent=G.gold;
  doSave(G);
  if(typeof isShown==='function'&&isShown('sto'))G.showInventory('cons');
};
G.useConsumable=function(id){
  ensureConsumables();
  const names={coffee:tr('coffee'),bar:tr('bar'),cleaner:tr('cleaner')};
  if((G.cons[id]||0)<=0){showNotif('Sin '+names[id],'error');return;}
  if(id==='coffee'){
    if(G.energy>92){showNotif('Energia casi llena. Guardalo.','info');return;}
    G.cons.coffee--;G.energy=Math.min(100,G.energy+30);
    SFX.up();showNotif(tr('coffee')+' +30 energia','success');
    updateMateHUD();
  } else if(id==='bar'){
    G.cons.bar--;G.energy=Math.min(100,G.energy+16);G.stress=Math.max(0,(G.stress||0)-8);
    SFX.up();showNotif(tr('bar')+' +16 energia, -8 estres','success');
    updateMateHUD();
  } else if(id==='cleaner'){
    const ns=game.scene.getScene('Night'),ev=ns&&ns.aEv;
    if(!ev||!['clog','blob'].includes(ev.id)){showNotif('Guardalo para boquilla tapada o blob.','info');return;}
    G.cons.cleaner--;
    ev.printer._ev=null;ev.printer._pau=false;ns.aEv=null;
    document.getElementById('evp').style.display='none';
    G.block=false;G.nFixes=(G.nFixes||0)+1;G.stats.fix++;
    SFX.fix();showNotif('Pico limpio sin gastar repuesto','success');sLog('P'+(ev.printer.id+1)+': pico limpiado con consumible.');
  }
  doSave(G);
  if(typeof isShown==='function'&&isShown('sto'))G.showInventory('cons');
};
G.showInventory=function(tab){
  ensureConsumables();
  G.invTab=tab||G.invTab||'mat';
  G.block=true;
  document.getElementById('sh').textContent=tr('inventory');
  document.getElementById('sto').style.display='block';
  const tabs=document.getElementById('stoTabs'),sp=document.getElementById('sp'),acts=document.getElementById('stoActions');
  const mk=(id,txt)=>'<button class="stoTab '+(G.invTab===id?'on':'')+'" onclick="G.showInventory(\''+id+'\')">'+txt+'</button>';
  tabs.innerHTML=mk('mat',tr('materialsTab'))+mk('orders',tr('ordersTab'))+mk('cons',tr('consumablesTab'));
  acts.innerHTML='';
  if(G.invTab==='orders'){
    sp.textContent=(G.orders||[]).map(o=>'- '+o.pr.e+' '+o.pr.n+' - '+o.material+' x'+o.units+(o.filament?' | '+o.filament.n:o.waitingMaterial?' | '+tr('missingMaterial'):'')).join('\n')||tr('noQueuedOrders');
  } else if(G.invTab==='cons'){
    sp.textContent=tr('coffee')+': '+G.cons.coffee+'  |  '+tr('bar')+': '+G.cons.bar+'  |  '+tr('cleaner')+': '+G.cons.cleaner+'\n\n'+tr('consHint');
    acts.innerHTML=[
      ['coffee',45,'Cafe'],['bar',35,'Barrita'],['cleaner',70,'Limpia pico']
    ].map(x=>'<button class="eb fix" onclick="G.useConsumable(\''+x[0]+'\')">'+tr('use')+' '+x[2]+'</button><button class="eb" onclick="G.buyConsumable(\''+x[0]+'\')">'+tr('buy')+' $'+x[1]+'</button>').join('');
  } else {
    G.invTab='mat';
    sp.textContent=stockLine('pla')+'\n'+stockLine('petg')+'\n'+stockLine('resin')+'\n'+tr('partsName')+': '+G.stk.parts;
  }
};

// Shop v2 renderer: overrides the compact prototype shop with richer cards.
G.shopStats=function(){
  const hired=EMP.filter(e=>G.emp[e.id]).length,total=matStock('pla')+matStock('petg')+matStock('resin')+G.stk.parts;
  document.getElementById('shopStats').innerHTML=[
    [tr('cash'),'$'+G.gold],[tr('printers'),G.pCount+'/4'],[tr('stock'),total],[tr('team'),hired+'/'+EMP.length]
  ].map(([k,v])=>'<div class="shopStat"><b>'+k+'</b><span>'+v+'</span></div>').join('');
};
G.shopCard=function(o){
  const cls='si '+(o.done?'sb':o.locked?'sl':o.can?'sa':'');
  const action=o.done?tr('ready'):o.locked?tr('locked'):o.can?tr('buy'):tr('noMoney');
  const meta=o.done?'<div class="stg">'+(o.doneText||'Listo')+'</div>':o.locked?'<div class="slock">'+o.lockedText+'</div>':'<div class="sc">$'+o.cost+'</div>';
  return '<div class="'+cls+'" '+o.attr+'><div class="siTop"><div class="siIc">'+o.icon+'</div><div><h4>'+o.name+'</h4><p>'+o.desc+'</p></div></div><div class="siFoot">'+meta+'<span class="sact">'+action+'</span></div></div>';
};
G.tab=function(t){
  G.stab=t;
  document.querySelectorAll('.st').forEach((el,i)=>el.classList.toggle('on',['up','emp','stk'][i]===t));
  G.shopStats();
  document.getElementById('shopSub').textContent=t==='up'?tr('upSub'):t==='emp'?tr('empSub'):tr('stkSub');
  const sg=document.getElementById('sg'),sgNew=sg.cloneNode(false);sg.parentNode.replaceChild(sgNew,sg);
  const s=sgNew;
  if(t==='up'){
    s.style.gridTemplateColumns='repeat(3,1fr)';
    s.innerHTML=UPG.map(u=>{const b=!!G.upg[u.id],lk=u.req&&!G.upg[u.req],af=G.gold>=u.co;return G.shopCard({icon:u.ic,name:u.n,desc:u.de,cost:u.co,done:b,can:af&&!lk,locked:lk,lockedText:tr('needs')+u.req,doneText:tr('installed'),attr:'data-upg="'+u.id+'"'});}).join('');
    s.addEventListener('click',e=>{const d=e.target.closest('[data-upg]');if(d)G._bUpg(d.dataset.upg);});
  } else if(t==='emp'){
    s.style.gridTemplateColumns='repeat(3,1fr)';
    s.innerHTML=EMP.map(e=>{const h=!!G.emp[e.id],af=G.gold>=e.co;return G.shopCard({icon:e.ic,name:e.n,desc:e.de+' | '+tr('salary')+' $'+e.sal+'/noche',cost:e.co,done:h,can:af,locked:false,doneText:tr('hired'),attr:'data-emp="'+e.id+'"'});}).join('');
    s.addEventListener('click',e=>{const d=e.target.closest('[data-emp]');if(d)G._hEmp(d.dataset.emp);});
  } else {
    s.style.gridTemplateColumns='repeat(3,1fr)';
    const items=[];
    ['pla','petg','resin'].forEach(mat=>{
      (FILAMENTS[mat]||[]).forEach(f=>{
        const c=getFilPrice(mat,f.id);
        items.push({mat,f,c,ic:mat==='resin'?'🧪':'🧵'});
      });
    });
    items.push({mat:'parts',f:{id:'',n:tr('partsName'),de:tr('partsDesc'),q:2},c:G.market.parts.cur,ic:'🔩'});
    s.innerHTML=items.map(o=>G.shopCard({icon:o.ic,name:o.f.n,desc:o.f.tier?tr('tier')+' '+filTier(o.f)+' | '+tr('stock')+' '+(G.stk[o.mat][o.f.id]||0)+' | '+tr('risk')+' '+(o.f.risk>0?'+':'')+Math.round(o.f.risk*100)+'%\n'+filDesc(o.f):tr('stock')+' '+G.stk.parts+'\n'+o.f.de,cost:o.c,done:false,can:G.gold>=o.c,locked:false,attr:'data-stk="'+o.mat+'" data-id="'+o.f.id+'" data-cost="'+o.c+'"'})).join('');
    s.addEventListener('click',e=>{const d=e.target.closest('[data-stk]');if(d){G.bStk(d.dataset.stk,Number(d.dataset.cost),d.dataset.id);G.tab('stk');}});
  }
};

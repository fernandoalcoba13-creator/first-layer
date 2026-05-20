// ═══ G METHODS ═══
// Methods attached to G for shop, fixes, breakers, story screen.
// Called from HTML inline onclicks and Phaser scene logic.
G.bStk=function(k,c){if(G.gold<c){showNotif('💸 Sin fondos','error');return;}G.gold-=c;G.stk[k]++;SFX.coin();showNotif('✅ '+k+' comprado. $'+G.gold,'money');document.getElementById('hg').textContent=G.gold;};
G.nFix=function(){const ns=game.scene.getScene('Night');const ev=ns&&ns.aEv;if(!ev)return;if(ev.g>0&&G.gold<ev.g){showNotif('💸 Sin fondos');return;}if(ev.pts>0&&G.stk.parts<ev.pts){showNotif('🔩 Sin repuestos');return;}G.gold-=ev.g;G.stk.parts-=ev.pts;ev.printer._ev=null;ev.printer._pau=false;ns.aEv=null;document.getElementById('evp').style.display='none';G.block=false;G.nFixes=(G.nFixes||0)+1;G.stats.fix++;SFX.fix();showNotif('🔧 '+ev.ti+' reparado!','success');sLog('✅ '+ev.ti+' resuelto.');};
G.nAutoFix=function(){const ns=game.scene.getScene('Night');const ev=ns&&ns.aEv;if(!ev)return;ev.printer._ev=null;ev.printer._pau=false;ns.aEv=null;document.getElementById('evp').style.display='none';G.block=false;G.nFixes=(G.nFixes||0)+1;SFX.fix();showNotif('👨‍🔧 Rodrigo reparó: '+ev.ti);};
G.nSkip=function(){const ns=game.scene.getScene('Night');const ev=ns&&ns.aEv;if(!ev)return;G.rep=Math.max(0,G.rep-ev.rp);ev.printer.broken=true;ev.printer.busy=false;ev.printer._ev=null;ns.aEv=null;document.getElementById('evp').style.display='none';G.block=false;SFX.err();shakeUI();showNotif('⚠️ P'+(ev.printer.id+1)+' averiada. -'+ev.rp+' REP','error');};
G.startNozzleMini=function(){
  const ns=game.scene.getScene('Night'),ev=ns&&ns.aEv;if(!ev||ev.id!=='clog')return;
  if(G.stk.parts<ev.pts){showNotif('🔩 Sin repuestos');return;}
  document.getElementById('evp').style.display='none';
  G._mini={ev,time:9000,max:9000,heat:18,dir:1,hits:0,tick:null,done:false};
  document.getElementById('miniGame').style.display='flex';
  document.getElementById('mgTitle').textContent='🚫 Limpiar pico - P'+(ev.printer.id+1);
  document.getElementById('mgDesc').textContent='Esperá la zona verde y limpiá el nozzle tres veces.';
  document.getElementById('mgTimerFill').style.width='100%';
  G.renderNozzleMini();
  G._mini.tick=setInterval(()=>{
    if(!G._mini)return;
    const m=G._mini;
    m.time-=80;m.heat+=m.dir*4.4;
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
  const m=G._mini,ok=m.heat>=42&&m.heat<=58,heat=Math.round(m.heat);
  document.getElementById('mgGrid').innerHTML='<div class="mgCorner '+(ok?'ok':'')+'" style="grid-column:1/-1"><b>Temperatura del pico</b><div class="mgVal">'+heat+'%</div><div class="mgBar"><i style="width:'+heat+'%"></i></div><div class="mgBtns"><button style="width:120px" onclick="G.scrapeNozzle()">Limpiar</button></div></div>';
  document.getElementById('mgHint').textContent='Limpiezas buenas: '+m.hits+'/3 | Zona verde: 42 a 58';
};
G.scrapeNozzle=function(){
  if(!G._mini||G._mini.done)return;
  const ok=G._mini.heat>=42&&G._mini.heat<=58;
  if(ok){G._mini.hits++;SFX.ok();showNotif('Limpieza perfecta '+G._mini.hits+'/3','success');}
  else{G._mini.time=Math.max(0,G._mini.time-1500);SFX.err();shakeUI();showNotif('Rayaste el nozzle. -tiempo','error');}
  if(G._mini.hits>=3){G._mini.done=true;setTimeout(()=>G.winNozzleMini(),180);}
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
G.openShop=function(t){G.stab=t||G.stab||'up';G.tab(G.stab);document.getElementById('shop').style.display='block';G.block=true;};
G._bUpg=function(id){const u=UPG.find(x=>x.id===id);if(!u||G.upg[id])return;if(u.req&&!G.upg[u.req]){showNotif('⚠️ Requiere: '+u.req);return;}if(G.gold<u.co){showNotif('💸 Sin fondos');return;}G.gold-=u.co;G.upg[id]=true;SFX.ok();showNotif('✅ '+u.ic+' '+u.n+' activado!');doSave(G);G.tab(G.stab);document.getElementById('hg').textContent=G.gold;};
G._hEmp=function(id){const e=EMP.find(x=>x.id===id);if(!e||G.emp[id])return;if(G.gold<e.co){showNotif('💸 Sin fondos');return;}G.gold-=e.co;G.emp[id]=true;SFX.up();showNotif('✅ '+e.ic+' '+e.n+' contratado!');doSave(G);G.tab('emp');};
G.cShop=function(){document.getElementById('shop').style.display='none';G.block=false;};
G.showSto=function(ti,tx,ob){G.block=true;document.getElementById('sh').textContent=ti;document.getElementById('sp').textContent=tx+(ob?'\n\n🎯 Objetivo: '+ob:'');document.getElementById('sto').style.display='block';};
G.cSto=function(){document.getElementById('sto').style.display='none';G.block=false;};

// Shop v2 renderer: overrides the compact prototype shop with richer cards.
G.shopStats=function(){
  const hired=EMP.filter(e=>G.emp[e.id]).length,total=G.stk.pla+G.stk.petg+G.stk.resin+G.stk.parts;
  document.getElementById('shopStats').innerHTML=[
    ['Caja','$'+G.gold],['Impresoras',G.pCount+'/4'],['Stock',total],['Equipo',hired+'/'+EMP.length]
  ].map(([k,v])=>'<div class="shopStat"><b>'+k+'</b><span>'+v+'</span></div>').join('');
};
G.shopCard=function(o){
  const cls='si '+(o.done?'sb':o.locked?'sl':o.can?'sa':'');
  const action=o.done?'LISTO':o.locked?'BLOQUEADO':o.can?'COMPRAR':'SIN FONDOS';
  const meta=o.done?'<div class="stg">'+(o.doneText||'Listo')+'</div>':o.locked?'<div class="slock">'+o.lockedText+'</div>':'<div class="sc">$'+o.cost+'</div>';
  return '<div class="'+cls+'" '+o.attr+'><div class="siTop"><div class="siIc">'+o.icon+'</div><div><h4>'+o.name+'</h4><p>'+o.desc+'</p></div></div><div class="siFoot">'+meta+'<span class="sact">'+action+'</span></div></div>';
};
G.tab=function(t){
  G.stab=t;
  document.querySelectorAll('.st').forEach((el,i)=>el.classList.toggle('on',['up','emp','stk'][i]===t));
  G.shopStats();
  document.getElementById('shopSub').textContent=t==='up'?'Comprá mejoras permanentes para sobrevivir más noches.':t==='emp'?'Contratá ayuda: pagás sueldo cada noche, pero te alivian el turno.':'Comprá materiales al precio del mercado de hoy.';
  const sg=document.getElementById('sg'),sgNew=sg.cloneNode(false);sg.parentNode.replaceChild(sgNew,sg);
  const s=sgNew;
  if(t==='up'){
    s.style.gridTemplateColumns='repeat(3,1fr)';
    s.innerHTML=UPG.map(u=>{const b=!!G.upg[u.id],lk=u.req&&!G.upg[u.req],af=G.gold>=u.co;return G.shopCard({icon:u.ic,name:u.n,desc:u.de,cost:u.co,done:b,can:af&&!lk,locked:lk,lockedText:'Requiere '+u.req,doneText:'Instalado',attr:'data-upg="'+u.id+'"'});}).join('');
    s.addEventListener('click',e=>{const d=e.target.closest('[data-upg]');if(d)G._bUpg(d.dataset.upg);});
  } else if(t==='emp'){
    s.style.gridTemplateColumns='repeat(3,1fr)';
    s.innerHTML=EMP.map(e=>{const h=!!G.emp[e.id],af=G.gold>=e.co;return G.shopCard({icon:e.ic,name:e.n,desc:e.de+' | Sueldo $'+e.sal+'/noche',cost:e.co,done:h,can:af,locked:false,doneText:'Contratado',attr:'data-emp="'+e.id+'"'});}).join('');
    s.addEventListener('click',e=>{const d=e.target.closest('[data-emp]');if(d)G._hEmp(d.dataset.emp);});
  } else {
    s.style.gridTemplateColumns='repeat(2,1fr)';
    const mk2=G.market,items=[['pla','PLA','🧵',mk2.pla.cur],['petg','PETG','🧵',mk2.petg.cur],['resin','Resina','🧪',mk2.resin.cur],['parts','Repuestos','🔩',mk2.parts.cur]];
    s.innerHTML=items.map(([k,n,ic,c])=>G.shopCard({icon:ic,name:n,desc:'Tenés '+G.stk[k]+' unidades en estantería',cost:c,done:false,can:G.gold>=c,locked:false,attr:'data-stk="'+k+'" data-cost="'+c+'"'})).join('');
    s.addEventListener('click',e=>{const d=e.target.closest('[data-stk]');if(d){G.bStk(d.dataset.stk,Number(d.dataset.cost));G.tab('stk');}});
  }
};

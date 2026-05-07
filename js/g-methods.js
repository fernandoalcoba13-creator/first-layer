// ═══ G METHODS ═══
// Methods attached to G for shop, fixes, breakers, story screen.
// Called from HTML inline onclicks and Phaser scene logic.
G.bStk=function(k,c){if(G.gold<c){showNotif('💸 Sin fondos','error');return;}G.gold-=c;G.stk[k]++;SFX.coin();showNotif('✅ '+k+' comprado. $'+G.gold,'money');document.getElementById('hg').textContent=G.gold;};
G.nFix=function(){const ns=game.scene.getScene('Night');const ev=ns&&ns.aEv;if(!ev)return;if(ev.g>0&&G.gold<ev.g){showNotif('💸 Sin fondos');return;}if(ev.pts>0&&G.stk.parts<ev.pts){showNotif('🔩 Sin repuestos');return;}G.gold-=ev.g;G.stk.parts-=ev.pts;ev.printer._ev=null;ev.printer._pau=false;ns.aEv=null;document.getElementById('evp').style.display='none';G.block=false;G.nFixes=(G.nFixes||0)+1;G.stats.fix++;SFX.fix();showNotif('🔧 '+ev.ti+' reparado!','success');sLog('✅ '+ev.ti+' resuelto.');};
G.nAutoFix=function(){const ns=game.scene.getScene('Night');const ev=ns&&ns.aEv;if(!ev)return;ev.printer._ev=null;ev.printer._pau=false;ns.aEv=null;document.getElementById('evp').style.display='none';G.block=false;G.nFixes=(G.nFixes||0)+1;SFX.fix();showNotif('👨‍🔧 Rodrigo reparó: '+ev.ti);};
G.nSkip=function(){const ns=game.scene.getScene('Night');const ev=ns&&ns.aEv;if(!ev)return;G.rep=Math.max(0,G.rep-ev.rp);ev.printer.broken=true;ev.printer.busy=false;ev.printer._ev=null;ns.aEv=null;document.getElementById('evp').style.display='none';G.block=false;SFX.err();shakeUI();showNotif('⚠️ P'+(ev.printer.id+1)+' averiada. -'+ev.rp+' REP','error');};
G.startBedMini=function(){
  const ns=game.scene.getScene('Night'),ev=ns&&ns.aEv;if(!ev||ev.id!=='bed')return;
  if(G.gold<ev.g){showNotif('💸 Sin fondos');return;}
  document.getElementById('evp').style.display='none';
  const vals=Array.from({length:4},()=>Phaser.Math.Between(18,82));
  G._mini={ev,vals,time:10000,max:10000,tick:null,done:false};
  document.getElementById('miniGame').style.display='flex';
  document.getElementById('mgTitle').textContent='📐 Nivelar cama - P'+(ev.printer.id+1);
  document.getElementById('mgDesc').textContent='Ajustá las cuatro esquinas. Verde = primera capa salvada.';
  document.getElementById('mgTimerFill').style.width='100%';
  G.renderBedMini();
  G._mini.tick=setInterval(()=>{
    if(!G._mini)return;
    G._mini.time-=120;
    document.getElementById('mgTimerFill').style.width=Math.max(0,G._mini.time/G._mini.max*100)+'%';
    if(G._mini.time<=0)G.failBedMini();
  },120);
  SFX.clk();
};
G.renderBedMini=function(){
  if(!G._mini)return;
  const names=['Frente izq','Frente der','Fondo izq','Fondo der'];
  document.getElementById('mgGrid').innerHTML=G._mini.vals.map((v,i)=>{
    const ok=v>=45&&v<=55;
    return '<div class="mgCorner '+(ok?'ok':'')+'"><b>'+names[i]+'</b><div class="mgVal">'+v+'</div><div class="mgBar"><i style="width:'+v+'%"></i></div><div class="mgBtns"><button onclick="G.tuneBed('+i+',-4)">-</button><button onclick="G.tuneBed('+i+',4)">+</button></div></div>';
  }).join('');
  const ready=G._mini.vals.every(v=>v>=45&&v<=55);
  document.getElementById('mgHint').textContent=ready?'¡Cama nivelada! Cerrando falla...':'Objetivo: todas entre 45 y 55';
  if(ready&&!G._mini.done){G._mini.done=true;setTimeout(()=>G.winBedMini(),220);}
};
G.tuneBed=function(i,d){if(!G._mini||G._mini.done)return;G._mini.vals[i]=Phaser.Math.Clamp(G._mini.vals[i]+d,0,100);SFX.clk();G.renderBedMini();};
G.winBedMini=function(){if(!G._mini)return;clearInterval(G._mini.tick);G._mini=null;document.getElementById('miniGame').style.display='none';G.nFix();};
G.failBedMini=function(){if(!G._mini)return;clearInterval(G._mini.tick);G._mini=null;document.getElementById('miniGame').style.display='none';showNotif('Primera capa perdida. La impresora queda fuera.','error');G.nSkip();};
G.cancelMiniGame=function(){G.failBedMini();};
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
G.tab=function(t){
  G.stab=t;
  document.querySelectorAll('.st').forEach((el,i)=>el.classList.toggle('on',['up','emp','stk'][i]===t));
  const sg=document.getElementById('sg');
  // Remove old listener to avoid duplicates
  const sgNew=sg.cloneNode(false);sg.parentNode.replaceChild(sgNew,sg);
  const s=sgNew;
  if(t==='up'){
    s.style.gridTemplateColumns='1fr 1fr';
    s.innerHTML=UPG.map(u=>{
      const b=!!G.upg[u.id],lk=u.req&&!G.upg[u.req],af=G.gold>=u.co;
      const cls='si '+(b?'sb':af&&!lk?'sa':'');
      const body='<h4>'+u.ic+' '+u.n+'</h4><p>'+(lk?'🔒 Req: '+u.req:u.de)+'</p>'+(b?'<div class="stg">✅</div>':'<div class="sc">🪙 $'+u.co+'</div>');
      return '<div class="'+cls+'" data-upg="'+u.id+'">'+body+'</div>';
    }).join('');
    s.addEventListener('click',e=>{
      const d=e.target.closest('[data-upg]');
      if(d)G._bUpg(d.dataset.upg);
    });
  } else if(t==='emp'){
    s.style.gridTemplateColumns='1fr 1fr';
    s.innerHTML=EMP.map(e=>{
      const h=!!G.emp[e.id],af=G.gold>=e.co;
      const cls='si '+(h?'sb':af?'sa':'');
      const body='<h4>'+e.ic+' '+e.n+'</h4><p>'+e.de+'<br><span style="color:#444;font-size:9px">$'+e.sal+'/noche</span></p>'+(h?'<div class="stg">✅ Contratado</div>':'<div class="sc">🪙 $'+e.co+'</div>');
      return '<div class="'+cls+'" data-emp="'+e.id+'">'+body+'</div>';
    }).join('');
    s.addEventListener('click',e=>{
      const d=e.target.closest('[data-emp]');
      if(d)G._hEmp(d.dataset.emp);
    });
  } else {
    s.style.gridTemplateColumns='1fr';
    const mk2=G.market;
    const items=[['pla','PLA','🧵',mk2.pla.cur],['petg','PETG','🧵',mk2.petg.cur],['resin','Resina','🧪',mk2.resin.cur],['parts','Repuestos','🔩',mk2.parts.cur]];
    s.innerHTML=items.map(([k,n,ic,c])=>{
      return '<div class="si '+(G.gold>=c?'sa':'')+'" data-stk="'+k+'" data-cost="'+c+'"><h4>'+ic+' '+n+' — $'+c+'</h4><p>Stock: '+G.stk[k]+'</p></div>';
    }).join('');
    s.addEventListener('click',e=>{
      const d=e.target.closest('[data-stk]');
      if(d){G.bStk(d.dataset.stk,Number(d.dataset.cost));G.tab('stk');}
    });
  }
};
G._bUpg=function(id){const u=UPG.find(x=>x.id===id);if(!u||G.upg[id])return;if(u.req&&!G.upg[u.req]){showNotif('⚠️ Requiere: '+u.req);return;}if(G.gold<u.co){showNotif('💸 Sin fondos');return;}G.gold-=u.co;G.upg[id]=true;SFX.ok();showNotif('✅ '+u.ic+' '+u.n+' activado!');doSave(G);G.tab(G.stab);document.getElementById('hg').textContent=G.gold;};
G._hEmp=function(id){const e=EMP.find(x=>x.id===id);if(!e||G.emp[id])return;if(G.gold<e.co){showNotif('💸 Sin fondos');return;}G.gold-=e.co;G.emp[id]=true;SFX.up();showNotif('✅ '+e.ic+' '+e.n+' contratado!');doSave(G);G.tab('emp');};
G.cShop=function(){document.getElementById('shop').style.display='none';G.block=false;};
G.showSto=function(ti,tx,ob){G.block=true;document.getElementById('sh').textContent=ti;document.getElementById('sp').textContent=tx+(ob?'\n\n🎯 Objetivo: '+ob:'');document.getElementById('sto').style.display='block';};
G.cSto=function(){document.getElementById('sto').style.display='none';G.block=false;};

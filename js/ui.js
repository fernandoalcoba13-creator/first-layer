// ═══ UI UTILS ═══
// DOM-side helpers used across scenes and G methods.
function sLog(m){document.getElementById('log').innerHTML=m;}
function sHint(m){document.getElementById('hint').textContent=m;}
function showNotif(m,type='info'){
  // Stagger existing notifs down
  document.querySelectorAll('.ntf').forEach((n,i)=>{n.style.top=(52+26*(i+1))+'px';});
  const n=document.createElement('div');
  n.className='ntf '+type;
  n.innerHTML='<div class="ntfdot"></div><span>'+m+'</span>';
  document.getElementById('ui').appendChild(n);
  n.animate([{transform:'translateX(20px)',opacity:0},{transform:'translateX(0)',opacity:1}],{duration:220});
  setTimeout(()=>{n.animate([{opacity:1},{opacity:0,transform:'translateX(12px)'}],{duration:280,fill:'forwards'});setTimeout(()=>n.remove(),280);},3200);
}
function shakeUI(){const c=document.getElementById('ui');c.classList.remove('shake');void c.offsetWidth;c.classList.add('shake');setTimeout(()=>c.classList.remove('shake'),400);}

// ═══ MERCADO DE FILAMENTO ═══
function updateMarket(){
  const M=G.market;
  const keys=['pla','petg','resin','parts'];
  const names=['pla','petg','res','pts'];
  keys.forEach((k,i)=>{
    const item=M[k];
    // Fluctuación basada en día + random
    const seed=G.day*17+i*31;
    const prev=item.cur;
    const change=(Math.sin(seed*.7)*15+Math.cos(seed*.3)*10);
    item.cur=Math.max(Math.round(item.base*.6),Math.round(item.base+change));
    item.trend=item.cur>prev?1:item.cur<prev?-1:0;
    // Update DOM
    const prEl=document.getElementById('mk_'+names[i]);if(prEl)prEl.textContent='$'+item.cur;
    const ta=document.getElementById('mkt_'+names[i]);
    if(ta){ta.textContent=item.trend>0?'▲':item.trend<0?'▼':'→';ta.className='mka '+(item.trend>0?'up':item.trend<0?'dn':'');}
  });
  // Show market panel for 4 seconds at day start
  const mkt=document.getElementById('mkt');mkt.classList.add('on');
  setTimeout(()=>mkt.classList.remove('on'),4000);
  // Log if any price is notable
  if(M.pla.cur<M.pla.base*.85)sLog('📈 ¡PLA barato hoy! $'+M.pla.cur+' — ¡Stockeate!');
  else if(M.pla.cur>M.pla.base*1.2)sLog('📈 PLA caro hoy ($'+M.pla.cur+'). Usá lo que tenés.');
}
function getPrice(k){return G.market[k]?G.market[k].cur:(k==='pla'?75:k==='petg'?100:k==='resin'?140:55);}
function getFilPrice(mat,id){
  const f=filDef(mat,id),m=G.market[mat];
  if(!f)return getPrice(mat);
  const ratio=m?m.cur/m.base:1;
  return Math.max(20,Math.round(f.base*ratio));
}

// ═══ MATE / ENERGÍA ═══
function updateMateHUD(){
  const pct=G.energy;
  document.getElementById('mfill').style.width=pct+'%';
  document.getElementById('mval').textContent=(G.mateActive?'⚡ TURBO':'🧉 '+G.mateCount)+' | '+Math.round(pct)+'%';
  document.getElementById('mfill').className='mfill'+(G.mateActive?' en':'');
  document.getElementById('mhot').className=G.mateActive?'on':'';
  // Color warning
  if(pct<30)document.getElementById('mbar').style.borderColor='#ff4d6a';
  else if(G.mateActive)document.getElementById('mbar').style.borderColor='#ffb347';
  else document.getElementById('mbar').style.borderColor='#2a2040';
}
G.tomarMate=function(){
  if(G.mateActive){showNotif('🧉 Ya estás en turbo!','info');return;}
  if(G.mateCount<=0){showNotif('😔 Sin mate. Comprá en tienda ($80).','error');return;}
  if(G.energy>85){showNotif('😎 Energía suficiente, guardá el mate.','info');return;}
  G.mateCount--;G.mateActive=true;G.mateTimer=30000;G.energy=Math.min(100,G.energy+40);
  SFX.up();showNotif('🧉 ¡Mate tomado! +40 energía. TURBO 30s 🚀','success');
  updateMateHUD();
};
function tickMate(dt){
  if(!G.mateActive){
    // Drain energy slowly during day
    if(G.phase==='day')G.energy=Math.max(0,G.energy-.008*dt/1000*100);
  } else {
    G.mateTimer-=dt;
    if(G.mateTimer<=0){G.mateActive=false;G.mateTimer=0;showNotif('☕ Turbo terminó.','info');}
  }
  updateMateHUD();
}
function cDlg(){document.getElementById('dlg').style.display='none';const d=game.scene.getScene('Day');if(d)d.dlgOpen=false;}
function isShown(id){const el=document.getElementById(id);return !!el&&getComputedStyle(el).display!=='none';}
function setGameMenu(open){
  const el=document.getElementById('titleScreen');
  if(!el)return;
  el.style.display=open?'flex':'none';
}
function openGameMenu(){setGameMenu(true);}
function closeGameMenu(){setGameMenu(false);SFX.ok();}
function clickButton(sel,idx=0){
  const list=[...document.querySelectorAll(sel)].filter(b=>!b.disabled&&b.offsetParent!==null);
  if(list[idx]){list[idx].click();return true;}
  return false;
}
function closeTopPanel(){
  if(isShown('dlg')){cDlg();return true;}
  if(isShown('shop')){G.cShop();return true;}
  if(isShown('sto')){G.cSto();return true;}
  if(isShown('titleScreen')){closeGameMenu();return true;}
  return false;
}
function buyShopCard(n){
  if(!isShown('shop'))return false;
  const cards=[...document.querySelectorAll('#sg .si')].filter(c=>!c.classList.contains('sb')&&!c.classList.contains('sl'));
  if(cards[n]){cards[n].click();return true;}
  return false;
}
document.addEventListener('keydown',e=>{
  if(e.repeat)return;
  const k=e.key.toLowerCase();
  if(k==='escape'){
    if(!closeTopPanel()&&!isShown('miniGame')&&!isShown('evp')&&!isShown('bkg')&&!isShown('dayEnd'))openGameMenu();
    e.preventDefault();return;
  }
  if(isShown('titleScreen')&&(k==='enter'||k===' ')){closeGameMenu();e.preventDefault();return;}
  if(isShown('miniGame')){
    if(k===' '||k==='enter'){G.scrapeNozzle();e.preventDefault();}
    return;
  }
  if(isShown('bkg')&&/^[1-6]$/.test(k)){G._bk(Number(k)-1);e.preventDefault();return;}
  if(isShown('evp')){
    if(/^[1-3]$/.test(k)){clickButton('#ebs .eb',Number(k)-1);e.preventDefault();return;}
    if(k==='f'||k==='enter'){clickButton('#ebs .eb.fix',0);e.preventDefault();return;}
    if(k==='i'){clickButton('#ebs .eb.skip',0);e.preventDefault();return;}
  }
  if(isShown('dayEnd')&&(k==='enter'||k===' ')){G.continueToNight();e.preventDefault();return;}
  if(isShown('sto')&&(k==='enter'||k===' ')){G.cSto();e.preventDefault();return;}
  if(isShown('dlg')){
    if(/^[1-6]$/.test(k)){if(clickButton('#dbs .db',Number(k)-1))e.preventDefault();return;}
    if(k==='a'||k==='enter'){if(clickButton('#dbs .db.ok',0)||clickButton('#dbs .db',0))e.preventDefault();return;}
    if(k==='n'){if(clickButton('#dbs .db',1))e.preventDefault();return;}
    if(k==='r'){if(clickButton('#dbs .db.no',0)||clickButton('#dbs .db',2))e.preventDefault();return;}
  }
  if(isShown('shop')){
    if(k==='u'){G.tab('up');e.preventDefault();return;}
    if(k==='e'){G.tab('emp');e.preventDefault();return;}
    if(k==='s'){G.tab('stk');e.preventDefault();return;}
    if(/^[1-9]$/.test(k)){if(buyShopCard(Number(k)-1))e.preventDefault();return;}
  }
  if(!G.block&&k==='i'){G.showInventory();e.preventDefault();return;}
  if(!G.block&&k==='o'){G.openShop('stk');e.preventDefault();return;}
  if(k==='m'){G.tomarMate();e.preventDefault();return;}
  if(k==='q'){doSave(G);showNotif('Guardado manual','success');e.preventDefault();return;}
  if(k==='h'){openGameMenu();e.preventDefault();}
});
applyLang();
function doTrans(h,p,cb){
  const el=document.getElementById('tr');
  document.getElementById('trh').textContent=h;
  document.getElementById('trp').textContent=p;
  el.style.pointerEvents='all';let op=0;
  const fi=setInterval(()=>{
    op=Math.min(1,op+.07);el.style.opacity=op;
    if(op>=1){clearInterval(fi);setTimeout(()=>{
      let op2=1;const fo=setInterval(()=>{
        op2=Math.max(0,op2-.06);el.style.opacity=op2;
        if(op2<=0){clearInterval(fo);el.style.pointerEvents='none';cb();}
      },28);
    },2400);}
  },28);
}
function showDayClose(summary,cb){
  const el=document.getElementById('dayEnd');
  document.getElementById('deTitle').textContent='Día '+summary.day+' cerrado';
  document.getElementById('deMood').textContent=summary.mood;
  document.getElementById('deStats').innerHTML=[
    ['Clientes atendidos',summary.accepted+' / '+summary.clients,summary.lost?'Se fueron o rechazaste: '+summary.lost:'Sin clientes perdidos'],
    ['Pedidos para la noche',summary.queue,summary.urgent?'Urgentes: '+summary.urgent:'Sin urgentes en cola'],
    ['Valor en cola','$'+summary.queueValue,'Se cobra al terminar impresiones'],
    ['Reputación',summary.rep+(summary.repDelta?' ('+(summary.repDelta>0?'+':'')+summary.repDelta+')':''),'Estrés final: '+summary.stress+'%']
  ].map(s=>'<div class="deStat"><b>'+s[0]+'</b><span>'+s[1]+'</span><small>'+s[2]+'</small></div>').join('');
  document.getElementById('deNote').textContent=summary.note;
  G._dayCloseCb=cb;
  el.style.display='flex';
  SFX.ok();
}
G.continueToNight=function(){
  const el=document.getElementById('dayEnd');
  el.style.display='none';
  const cb=G._dayCloseCb;
  G._dayCloseCb=null;
  if(cb)cb();
};
window.resetGame=()=>{localStorage.removeItem(SK);location.reload();};

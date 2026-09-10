// ═══ SAVE ═══
// localStorage save/load.
const SK='first_layer_save';
const SAVE_VERSION=2;
const CHECKPOINT_KEYS=['gold','rep','day','makerName','shopName','upg','emp','stk','cons','orders','ss','stats','lang','stress','dayEarn','dayOrd','dayCli','dayPrints','dayBought','dayBoughtMaterial','dayBoughtPlaBasic','dayUsedPlaBasic','dayStartGold','dayStartRep','energy','mateCount','market','dayMod'];
function cloneSaveValue(v){return v===undefined?undefined:JSON.parse(JSON.stringify(v));}
function buildSaveCheckpoint(G,phase){
  const cp={phase:phase==='night'?'night':'day'};
  if(G.betaResult)cp.betaResult=cloneSaveValue(G.betaResult);
  CHECKPOINT_KEYS.forEach(k=>{if(G[k]!==undefined)cp[k]=cloneSaveValue(G[k]);});
  const orders=G.orders||[];
  cp.printers=(G.printers||[]).map(p=>({
    id:p.id,locked:!!p.locked,broken:!!p.broken,busy:!!p.busy,
    progress:Number(p.progress||0),_pau:!!p._pau,_dayLoaded:!!p._dayLoaded,
    _dayPrintMs:Number(p._dayPrintMs||0),orderIndex:orders.indexOf(p.order)
  }));
  return cp;
}
function setSaveCheckpoint(G,phase){
  G.resumePhase=phase==='night'?'night':'day';
  G._checkpoint=buildSaveCheckpoint(G,G.resumePhase);
  doSave(G);
}
function doSave(G){
  try{
    if(!G._checkpoint)G._checkpoint=buildSaveCheckpoint(G,G.resumePhase||G.phase);
    const prefs={makerName:G.makerName||'',shopName:G.shopName||'',lang:G.lang||'es'};
    localStorage.setItem(SK,JSON.stringify({version:SAVE_VERSION,checkpoint:G._checkpoint,prefs}));
    const e=document.getElementById('sv');
    if(e){e.textContent=G.lang==='en'?'Checkpoint saved':'Checkpoint guardado';e.style.opacity='1';setTimeout(()=>e.style.opacity='0',1400);}
    G.saveUnavailable=false;return true;
  }catch(e){G.saveUnavailable=true;return false;}
}
function loadSave(){try{const r=localStorage.getItem(SK);return r?JSON.parse(r):null;}catch(e){return null;}}

// ═══ GAME STATE ═══
// Single global G. All gameplay reads/writes go through here.
const G={gold:500,rep:50,day:1,lang:'es',makerName:'',shopName:'',phase:'day',resumePhase:'day',menuOpen:true,_checkpoint:null,stress:0,orders:[],printers:[],upg:{},emp:{},stk:{pla:{eco:3,std:0,pro:0},petg:{eco:0,std:0,pro:0},tpu:{basic:0,premium:0,pro:0},resin:{basic:0,std:0,pro:0},parts:3},cons:{coffee:1,mate:0,bar:1,sandwich:0,cleaner:1},ss:0,cObj:null,stats:{earn:0,ord:0,fix:0,pwr:0},dayEarn:0,dayOrd:0,dayCli:0,dayPrints:0,dayBoughtPlaBasic:false,dayUsedPlaBasic:false,nightDone:0,nFixes:0,block:false,stab:'up',pActive:false,pType:null,pTimer:0,pMax:0,upsLeft:0,
  get pCount(){return this.upg.unlock4?4:this.upg.unlock3?3:this.upg.unlock2?2:1;},
  get sMult(){return 1+(this.upg.speed1?0.3:0)+(this.upg.speed2?0.3:0);},
  get pMult(){return 1+(this.upg.qual?0.25:0)+(this.emp.caro2?0.15:0);},
  // Mate / Energy
  energy:100, mateActive:false, mateTimer:0, turboMax:0,
  mateCount:3, // mates disponibles por dia
  // Mercado de filamento
  market:{pla:{base:75,cur:75,trend:0},petg:{base:100,cur:100,trend:0},tpu:{base:160,cur:160,trend:0},resin:{base:140,cur:140,trend:0},parts:{base:55,cur:55,trend:0}}
};
function ensureStockShape(){
  if(!G.stk||typeof G.stk!=='object'||Array.isArray(G.stk))G.stk={};
  const defs={pla:'std',petg:'std',tpu:'premium',resin:'std'};
  Object.keys(defs).forEach(k=>{
    if(typeof G.stk[k]==='number')G.stk[k]={[defs[k]]:G.stk[k]};
    if(!G.stk[k]||typeof G.stk[k]!=='object'||Array.isArray(G.stk[k]))G.stk[k]={};
    (FILAMENTS[k]||[]).forEach(f=>{G.stk[k][f.id]=saveNumber(G.stk[k][f.id],0,0);});
  });
  G.stk.parts=saveNumber(G.stk.parts,0,0);
}
function ensureConsumables(){
  if(!G.cons||typeof G.cons!=='object'||Array.isArray(G.cons))G.cons={};
  const base={coffee:1,mate:0,bar:1,sandwich:0,cleaner:1};
  Object.keys(base).forEach(k=>{G.cons[k]=saveNumber(G.cons[k],base[k],0);});
}
function saveNumber(value,fallback,min=-Infinity){return typeof value==='number'&&Number.isFinite(value)?Math.max(min,value):fallback;}
function saveObject(value){return value&&typeof value==='object'&&!Array.isArray(value);}
function filDef(mat,id){return (FILAMENTS[mat]||[]).find(f=>f.id===id)||null;}
function matStock(mat){const s=G.stk[mat];return typeof s==='number'?s:Object.values(s||{}).reduce((a,b)=>a+Number(b||0),0);}
function stockLine(mat){const s=G.stk[mat]||{};return (FILAMENTS[mat]||[]).map(f=>f.n+': '+(s[f.id]||0)).join(' | ');}
function chooseFilament(mat,diff){
  const list=(FILAMENTS[mat]||[]).filter(f=>(G.stk[mat]&&G.stk[mat][f.id]||0)>0).sort((a,b)=>a.q-b.q);
  if(!list.length)return null;
  if(diff>=1.55)return list[list.length-1];
  if(diff>=1.15)return list[Math.min(1,list.length-1)];
  return list[0];
}
function consumeFilament(mat,diff,units){
  if(matStock(mat)<units)return null;
  let list=(FILAMENTS[mat]||[]).filter(f=>(G.stk[mat]&&G.stk[mat][f.id]||0)>0).sort((a,b)=>a.q-b.q);
  if(diff>=1.55)list=list.reverse();
  else if(diff>=1.15)list=list.sort((a,b)=>Math.abs(a.q-2)-Math.abs(b.q-2)||a.q-b.q);
  let left=units,risk=0,clog=0,rep=0,q=0,used=[];
  for(const f of list){
    const take=Math.min(left,G.stk[mat][f.id]||0);
    if(take<=0)continue;
    G.stk[mat][f.id]-=take;left-=take;
    risk+=f.risk*take;clog+=(f.clog||0)*take;rep+=(f.rep||0)*take;q+=f.q*take;
    used.push({f,take});
    if(left<=0)break;
  }
  if(left>0)return null;
  const main=used[0].f,mix=used.map(u=>u.f.n+(u.take>1?' x'+u.take:'')).join(' + ');
  return {id:main.id,n:mix,q:q/units,clog:clog/units,rep:Math.round(rep/units),risk:risk/units};
}
function prepareOrderMaterial(o){
  if(o.filament)return true;
  const fil=consumeFilament(o.material,o.diff,o.units);
  if(!fil)return false;
  o.risk=Phaser.Math.Clamp((o.risk||0)+fil.risk,.01,.62);
  o.filament={id:fil.id,n:fil.n,q:fil.q,clog:fil.clog,rep:fil.rep,risk:fil.risk};
  o.waitingMaterial=false;
  return true;
}
function repPriceMult(){return Phaser.Math.Clamp(.72+(G.rep||0)*.005,.72,1.24);}
function repPatienceMult(){return Phaser.Math.Clamp(.76+(G.rep||0)*.0042,.76,1.18);}
// Reputation standing — single source of truth for the stakes system. Drives the day-start
// banner, the proPanel readout, and client arrival speed (flow). Rails: no game-over; flow only
// shifts arrival cadence, never the scripted client cap, and fixed first/second spawns keep a floor.
function repStanding(){const r=G.rep||0;if(r<30)return{key:'bad',flow:1.18};if(r>65)return{key:'good',flow:.86};return{key:'norm',flow:1};}
// Visible daily reputation target. A floor to hold (no fail state — purely an on-screen goal that
// makes the rep number feel like it matters). Rises gently across the 3 beta days.
function repGoal(){return ({1:45,2:50,3:55})[G.day]||50;}
function betaDayNeeds(){return {accept:G.day===1?3:4,produce:G.day===1?2:G.day===2?3:2,reserve:G.day===3?2:1};}
// The task list and scene gates consume the same predicates, not parallel copies.
function betaObjectives(phase=G.phase){
  const es=G.lang!=='en',tasks=[],add=(id,esText,enText,done)=>tasks.push({id,txt:es?esText:enText,done:!!done});
  const loaded=G.printers.filter(p=>p.order).length,printed=(G.dayPrints||0)+(G.nightDone||0),needs=betaDayNeeds();
  if(phase==='day'){
    add('accept','Aceptar '+needs.accept+' pedidos','Accept '+needs.accept+' orders',(G.dayOrd||0)>=needs.accept);
    if(G.day===1){
      add('material','Comprar PLA Basic para imprimir','Buy PLA Basic to print',G.dayBoughtPlaBasic||G.dayUsedPlaBasic);
      add('load','Cargar un trabajo en P1','Load one job into P1',loaded+(G.dayPrints||0)>=1);
      add('produce','Cobrar 2 trabajos','Cash out 2 jobs',(G.dayPrints||0)>=2);
    }else{
      add('produce','Imprimir o cargar '+needs.produce+' trabajos','Print or load '+needs.produce+' jobs',(G.dayPrints||0)+loaded>=needs.produce);
      if(G.day===2)add('material','Comprar material','Buy material',(G.dayBoughtMaterial||0)>=1);
      if(G.day===3)add('parts','Reservar 2 repuestos para la noche','Keep 2 spares for tonight',G.stk.parts>=2);
    }
    add('reserve','Reservar '+needs.reserve+' pedido(s) para la noche','Reserve '+needs.reserve+' job(s) for tonight',G.orders.length>=needs.reserve);
  }else if(phase==='night'){
    const ns=game.scene.getScene('Night');
    if(G.day===2)add('assign','Asignar un trabajo a una impresora','Assign a job to a printer',loaded+(G.nightDone||0)>=1);
    if(G.day===3)add('printers','Activar 2 impresoras sin averias','Activate 2 healthy printers',G.printers.filter(p=>!p.locked&&!p.broken).length>=2);
    add('failures','Resolver las fallas de esta noche','Resolve tonight\'s failures',ns&&ns.betaNightClearable());
    if(G.day>1){
      const protectedPower=G.upg.solar||(G.day===2?G.upg.ups2:G.upg.gen);
      add('power','Restablecer o prevenir el corte de luz','Restore or prevent the power outage',((G.breakerFixes||0)>=1||protectedPower)&&!G.pActive);
    }
    add('produce',G.day===1?'Terminar el pedido reservado':'Terminar '+(G.day===2?3:2)+' trabajos',G.day===1?'Finish the reserved job':'Finish '+(G.day===2?3:2)+' jobs',G.day===1?(G.nightDone||0)>=1:printed>=(G.day===2?3:2));
    add('queue','Cobrar todos los pedidos pendientes','Cash out every pending job',G.orders.length===0&&!G.printers.some(p=>p.order||p.busy));
  }
  return tasks;
}
function gameTitle(){return 'First Layer';}
function shopDisplayName(){return (G.shopName||(G.lang==='en'?'Workshop':'Taller')).trim()||(G.lang==='en'?'Workshop':'Taller');}
function makerDisplayName(){return (G.makerName||'Maker').trim()||'Maker';}
function spendFilament(mat,id,units){if(!G.stk[mat]||!G.stk[mat][id]||G.stk[mat][id]<units)return false;G.stk[mat][id]-=units;return true;}
(()=>{
  const defaults=buildSaveCheckpoint(G,'day');
  const raw=loadSave();
  let s=raw;
  if(raw&&raw.version>=2&&raw.checkpoint){
    s=Object.assign({},raw.checkpoint,raw.prefs||{});
    G._checkpoint=cloneSaveValue(raw.checkpoint);
  }
  if(s){
    CHECKPOINT_KEYS.forEach(k=>{if(s[k]!==undefined)G[k]=s[k];});
    ['makerName','shopName','lang'].forEach(k=>{if(s[k]!==undefined)G[k]=s[k];});
  }
  ['gold','rep','day','ss','stress','energy','mateCount','dayEarn','dayOrd','dayCli','dayPrints','dayBought','dayBoughtMaterial'].forEach(k=>{
    G[k]=saveNumber(G[k],defaults[k]||0,k==='gold'?-Infinity:0);
  });
  G.day=Math.max(1,Math.floor(G.day));
  ['makerName','shopName'].forEach(k=>{if(typeof G[k]!=='string')G[k]='';});
  if(!['es','en'].includes(G.lang))G.lang='es';
  ['upg','emp','stats','market'].forEach(k=>{if(!saveObject(G[k]))G[k]=cloneSaveValue(defaults[k]);});
  Object.keys(defaults.stats).forEach(k=>{G.stats[k]=saveNumber(G.stats[k],0,0);});
  Object.keys(defaults.market).forEach(k=>{
    if(!saveObject(G.market[k]))G.market[k]={};
    for(const field of ['base','cur','trend'])G.market[k][field]=saveNumber(G.market[k][field],defaults.market[k][field],field==='trend'?-Infinity:1);
  });
  if(G.day>3){G.day=1;G.orders=[];G.ss=0;G._checkpoint=null;}
  ensureStockShape();ensureConsumables();if(!Array.isArray(G.orders))G.orders=[];
  // Keep indices until printer references are rebuilt, then drop invalid entries.
  G.orders=G.orders.map(o=>{
    if(!saveObject(o)||!saveObject(o.pr)||typeof o.pr.n!=='string')return null;
    o.pr.e=typeof o.pr.e==='string'?o.pr.e:'';o.pr.c=saveNumber(o.pr.c,0x5bc8fa,0);o.pr.t=saveNumber(o.pr.t,2,1.2);
    o.pay=saveNumber(o.pay,0,0);o.time=saveNumber(o.time,o.pr.t,1.2);o.diff=saveNumber(o.diff,1,.1);
    o.units=Math.max(1,Math.ceil(saveNumber(o.units,1,1)));o.risk=saveNumber(o.risk,.05,0);
    if(!FILAMENTS[o.material])o.material='pla';
    if(!saveObject(o.filament))o.filament=null;
    return o;
  });
  G.resumePhase=s&&s.phase==='night'?'night':'day';
  if(G.resumePhase==='night'&&Array.isArray(s&&s.printers)){
    G.printers=s.printers.slice(0,4).map((raw,i)=>{const p=saveObject(raw)?raw:{};return {
      id:i,locked:i>=G.pCount,broken:!!p.broken,busy:!!p.busy,
      order:Number.isInteger(p.orderIndex)&&p.orderIndex>=0?G.orders[p.orderIndex]||null:null,
      progress:Number(p.progress||0),_ev:null,_pau:false,_dayLoaded:!!p._dayLoaded,
      _dayPrintMs:Number(p._dayPrintMs||0)
    };});
  }else G.printers=[];
  G.orders=G.orders.filter(Boolean);
  const assigned=new Set();
  G.printers.forEach(p=>{
    if(p.locked||assigned.has(p.order))p.order=null;
    if(p.order)assigned.add(p.order);else p.busy=false;
    p.progress=saveNumber(p.progress,0,0);
  });
  const result=s&&s.betaResult;
  G.betaResult=G.day===3&&saveObject(result)&&['gold','rep','repairs'].every(k=>typeof result[k]==='number'&&Number.isFinite(result[k]))
    ?{gold:result.gold,rep:Math.max(0,result.rep),repairs:Math.max(0,result.repairs)}:null;
  if(G.betaResult)G.resumePhase='night';
  else if(G.resumePhase==='night'&&(!G.orders.length||(G.day>1&&G.dayPrints+G.orders.length<(G.day===2?3:2)))){G.resumePhase='day';G.recoveredCheckpoint=true;}
  G.phase=G.resumePhase;G.block=false;G.pActive=false;G.pType=null;G.pTimer=0;G.pMax=0;
  if(G._checkpoint)G._checkpoint=buildSaveCheckpoint(G,G.resumePhase);
})();

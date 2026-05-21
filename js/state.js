// ═══ SAVE ═══
// localStorage save/load.
const SK='first_layer_save';
function doSave(G){try{localStorage.setItem(SK,JSON.stringify({gold:G.gold,rep:G.rep,day:G.day,makerName:G.makerName,shopName:G.shopName,upg:G.upg,emp:G.emp,stk:G.stk,cons:G.cons,orders:G.orders,ss:G.ss,stats:G.stats,lang:G.lang}));const e=document.getElementById('sv');e.style.opacity='1';setTimeout(()=>e.style.opacity='0',1400);}catch(e){}}
function loadSave(){try{const r=localStorage.getItem(SK);return r?JSON.parse(r):null;}catch(e){return null;}}

// ═══ GAME STATE ═══
// Single global G. All gameplay reads/writes go through here.
const G={gold:500,rep:50,day:1,lang:'es',makerName:'',shopName:'',phase:'day',stress:0,orders:[],printers:[],upg:{},emp:{},stk:{pla:{eco:3,std:0,pro:0},petg:{eco:0,std:0,pro:0},resin:{basic:0,std:0,pro:0},parts:3},cons:{coffee:1,bar:1,cleaner:0},ss:0,cObj:null,stats:{earn:0,ord:0,fix:0,pwr:0},dayEarn:0,dayOrd:0,dayCli:0,dayPrints:0,nightDone:0,nFixes:0,block:false,stab:'up',pActive:false,pType:null,pTimer:0,pMax:0,upsLeft:0,
  get pCount(){return this.upg.unlock4?4:this.upg.unlock3?3:this.upg.unlock2?2:1;},
  get sMult(){return 1+(this.upg.speed1?0.3:0)+(this.upg.speed2?0.3:0);},
  get pMult(){return 1+(this.upg.qual?0.25:0)+(this.emp.caro2?0.15:0);},
  // Mate / Energy
  energy:100, mateActive:false, mateTimer:0,
  mateCount:3, // mates disponibles por dia
  // Mercado de filamento
  market:{pla:{base:75,cur:75,trend:0},petg:{base:100,cur:100,trend:0},resin:{base:140,cur:140,trend:0},parts:{base:55,cur:55,trend:0}}
};
function ensureStockShape(){
  const defs={pla:'std',petg:'std',resin:'std'};
  Object.keys(defs).forEach(k=>{
    if(typeof G.stk[k]==='number')G.stk[k]={[defs[k]]:G.stk[k]};
    if(!G.stk[k])G.stk[k]={};
    (FILAMENTS[k]||[]).forEach(f=>{if(G.stk[k][f.id]===undefined)G.stk[k][f.id]=0;});
  });
  if(typeof G.stk.parts!=='number')G.stk.parts=Number(G.stk.parts||0);
}
function ensureConsumables(){
  if(!G.cons)G.cons={};
  const base={coffee:1,bar:1,cleaner:0};
  Object.keys(base).forEach(k=>{if(G.cons[k]===undefined)G.cons[k]=base[k];});
}
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
function repPriceMult(){return Phaser.Math.Clamp(.78+(G.rep||0)*.0044,.78,1.24);}
function repPatienceMult(){return Phaser.Math.Clamp(.82+(G.rep||0)*.0036,.82,1.18);}
function shopDisplayName(){return (G.shopName||'Print Shop').trim()||'Print Shop';}
function makerDisplayName(){return (G.makerName||'Maker').trim()||'Maker';}
function spendFilament(mat,id,units){if(!G.stk[mat]||!G.stk[mat][id]||G.stk[mat][id]<units)return false;G.stk[mat][id]-=units;return true;}
(()=>{const s=loadSave();if(s){['gold','rep','day','makerName','shopName','upg','emp','stk','cons','orders','ss','stats','lang'].forEach(k=>{if(s[k]!==undefined)G[k]=s[k];});}if(G.day>3){G.day=1;G.orders=[];G.ss=0;}ensureStockShape();ensureConsumables();if(!Array.isArray(G.orders))G.orders=[];G.printers=[];G.phase='day';G.stress=0;G.block=false;G.pActive=false;G.pType=null;})();

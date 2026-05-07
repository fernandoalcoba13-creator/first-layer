// ═══ SAVE ═══
// localStorage save/load. Save key: kmorra_ps3
const SK='kmorra_ps3';
function doSave(G){try{localStorage.setItem(SK,JSON.stringify({gold:G.gold,rep:G.rep,day:G.day,upg:G.upg,emp:G.emp,stk:G.stk,ss:G.ss,stats:G.stats}));const e=document.getElementById('sv');e.style.opacity='1';setTimeout(()=>e.style.opacity='0',1400);}catch(e){}}
function loadSave(){try{const r=localStorage.getItem(SK);return r?JSON.parse(r):null;}catch(e){return null;}}

// ═══ GAME STATE ═══
// Single global G. All gameplay reads/writes go through here.
const G={gold:500,rep:50,day:1,phase:'day',stress:0,orders:[],printers:[],upg:{},emp:{},stk:{pla:6,petg:3,resin:2,parts:3},ss:0,cObj:null,stats:{earn:0,ord:0,fix:0,pwr:0},dayEarn:0,dayOrd:0,dayCli:0,nFix:0,block:false,stab:'up',pActive:false,pType:null,pTimer:0,pMax:0,upsLeft:0,
  get pCount(){return this.upg.unlock4?4:this.upg.unlock3?3:this.upg.unlock2?2:1;},
  get sMult(){return 1+(this.upg.speed1?0.3:0)+(this.upg.speed2?0.3:0);},
  get pMult(){return 1+(this.upg.qual?0.25:0)+(this.emp.caro2?0.15:0);},
  // Mate / Energy
  energy:100, mateActive:false, mateTimer:0,
  mateCount:3, // mates disponibles por dia
  // Mercado de filamento
  market:{pla:{base:75,cur:75,trend:0},petg:{base:100,cur:100,trend:0},resin:{base:140,cur:140,trend:0},parts:{base:55,cur:55,trend:0}}
};
(()=>{const s=loadSave();if(s){['gold','rep','day','upg','emp','stk','ss','stats'].forEach(k=>{if(s[k]!==undefined)G[k]=s[k];});G.orders=[];G.printers=[];G.phase='day';G.stress=0;G.block=false;G.pActive=false;G.pType=null;}})();

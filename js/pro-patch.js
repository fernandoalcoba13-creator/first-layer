// ═══ PRO PATCH v6 ═══
// Non-invasive UI layer: title screen, side risk panel, pulse warnings.
// Wraps showNotif to refresh proPanel on every notification.
(function(){
  const oldNotif=window.showNotif;
  if(typeof oldNotif==='function'){
    window.showNotif=function(msg,type){
      oldNotif(msg,type);
      try{ updateProPanel(); }catch(e){}
    }
  }
  window.updateProPanel=function(){
    const title=document.getElementById('proTitle'), txt=document.getElementById('proText'), risk=document.getElementById('proRisk'), tip=document.getElementById('proTip'), list=document.getElementById('objList');
    if(!txt||!risk||!tip||typeof G==='undefined')return;
    const broken=(G.printers||[]).filter(p=>p.broken).length;
    const queue=(G.orders||[]).length;
    const loaded=(G.printers||[]).filter(p=>p.busy||p.order).length;
    const activePrinters=(G.printers||[]).filter(p=>!p.locked&&!p.broken).length;
    const printed=(G.dayPrints||0)+(G.nightDone||0);
    const material=matStock('pla')+matStock('petg')+matStock('tpu')+matStock('resin');
    const riskVal=Math.min(100,Math.round((G.stress||0)*.55+broken*18+queue*4+(G.pActive?25:0)));
    risk.style.width=riskVal+'%';
    const repBoost=Math.round((repPriceMult()-1)*100);
    const maker=(G.makerName||G.shopName)?makerDisplayName()+' / '+shopDisplayName()+' · ':'';
    if(title){
      const b=BETA_DAYS[G.day]||{};
      title.textContent=(G.phase==='night'?'NOCHE ':'DIA ')+G.day+(b.title?' - '+b.title:'');
    }
    if(G.phase==='night'){
      txt.textContent=maker+tr('nightActive')+': '+queue+' '+tr('orders')+' / '+broken+' '+tr('failures')+'. REP '+G.rep+' ('+(repBoost>=0?'+':'')+repBoost+'% $)';
      tip.textContent=G.pActive?'⚡ '+tr('runBreaker'):tr('inspectPrinters');
    }else{
      txt.textContent=maker+tr('dayDyn')+' '+G.day+': $'+G.gold+' · REP '+G.rep+' ('+(repBoost>=0?'+':'')+repBoost+'% $) · '+tr('queue')+' '+queue+'.';
      tip.textContent=G.energy<35?'🧉 '+tr('drinkMate'):tr('buyCheap');
    }
    if(list){
      const es=G.lang!=='en';
      const dayTasks=G.day===1
        ?[
          {txt:es?'Aceptar 3 pedidos':'Accept 3 orders',done:(G.dayOrd||0)>=3},
          {txt:es?'Comprar PLA Basic para imprimir':'Buy PLA Basic to print',done:!!G.dayBoughtPlaBasic||(G.stk&&G.stk.pla&&G.stk.pla.eco||0)>0||!!G.dayUsedPlaBasic},
          {txt:es?'Cargar un trabajo en P1':'Load one job into P1',done:loaded>=1||(G.dayPrints||0)>=1},
          {txt:es?'Cobrar 2 trabajos':'Cash out 2 jobs',done:(G.dayPrints||0)>=2},
          {txt:es?'Dejar 1 trabajo para la noche':'Leave 1 job for night',done:(G.dayOrd||0)>=3&&(G.orders||[]).length>=1}
        ]
        :G.day===2
        ?[
          {txt:es?'Aceptar cuatro pedidos':'Accept four orders',done:(G.dayOrd||0)>=4},
          {txt:es?'Cargar al menos tres trabajos':'Load at least three jobs',done:loaded>=3},
          {txt:es?'Comprar material para no frenar la cola':'Buy material so the queue does not stop',done:material>=2},
          {txt:es?'Llegar con reputacion estable':'Reach night with stable reputation',done:(G.rep||0)>=45}
        ]
        :[
          {txt:es?'Comprar la segunda impresora':'Buy the second printer',done:G.pCount>=2},
          {txt:es?'Cargar dos impresoras con trabajos':'Load two printers with jobs',done:loaded>=2},
          {txt:es?'Guardar repuestos para fallas fuertes':'Keep spares for serious failures',done:(G.stk&&G.stk.parts||0)>=2},
          {txt:es?'Dejar cola suficiente para producir':'Leave enough queue to produce',done:(G.orders||[]).length>=2}
        ];
      const nightTasks=G.day===1
        ?[
          {txt:es?'Resolver la boquilla obstruida':'Fix the clogged nozzle',done:(G.nFixes||0)>=1},
          {txt:es?'Terminar el primer trabajo':'Finish the first job',done:printed>=1},
          {txt:es?'Cobrar hasta llegar a $300':'Cash out until you reach $300',done:(G.nightDone||0)>=1&&(G.gold||0)>=300}
        ]
        :G.day===2
        ?[
          {txt:es?'Asignar trabajos a impresoras libres':'Assign jobs to free printers',done:loaded>=1},
          {txt:es?'Superar el corte de luz':'Survive the outage',done:(G.stats&&G.stats.pwr||0)>=1},
          {txt:es?'Reparar la falla de adhesion':'Fix the adhesion failure',done:(G.nFixes||0)>=1},
          {txt:es?'Terminar tres trabajos':'Finish three jobs',done:printed>=3}
        ]
        :[
          {txt:es?'Mantener dos impresoras sanas':'Keep two printers healthy',done:activePrinters>=2},
          {txt:es?'Reparar dos fallas':'Repair two failures',done:(G.nFixes||0)>=2},
          {txt:es?'Sobrevivir al corte prolongado':'Survive the long outage',done:(G.stats&&G.stats.pwr||0)>=1},
          {txt:es?'Terminar dos trabajos':'Finish two jobs',done:printed>=2}
        ];
      const tasks=G.phase==='night'?nightTasks:dayTasks;
      list.innerHTML=tasks.map(t=>
        '<div class="objRow '+(t.done?'done':'')+'"><span>'+(t.done?'✓':'□')+'</span><b>'+t.txt+'</b><em>'+(t.done?'OK':'')+'</em></div>'
      ).join('');
    }
    const tag=document.getElementById('ptag');
    if(tag) tag.classList.toggle('pulseWarn',G.pActive||broken>0||G.stress>70);
  };
  setInterval(()=>{try{updateProPanel()}catch(e){}},700);
})();

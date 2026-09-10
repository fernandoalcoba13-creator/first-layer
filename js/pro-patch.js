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
    try{renderRepHUD();}catch(e){}
    const broken=(G.printers||[]).filter(p=>p.broken).length;
    const queue=(G.orders||[]).length;
    const loaded=(G.printers||[]).filter(p=>p.busy||p.order).length;
    const activePrinters=(G.printers||[]).filter(p=>!p.locked&&!p.broken).length;
    const printed=(G.dayPrints||0)+(G.nightDone||0);
    const material=matStock('pla')+matStock('petg')+matStock('tpu')+matStock('resin');
    const riskVal=Math.min(100,Math.round((G.stress||0)*.55+broken*18+queue*4+(G.pActive?25:0)));
    risk.style.width=riskVal+'%';
    const repBoost=Math.round((repPriceMult()-1)*100);
    const patBoost=Math.round((repPatienceMult()-1)*100);
    const stnd=(typeof repStanding==='function')?repStanding():{key:'norm'};
    const stName=(stnd.key==='good'?'⭐ ':stnd.key==='bad'?'⚠️ ':'')+tr(stnd.key==='good'?'repGood':stnd.key==='bad'?'repBad':'repNorm');
    const maker=(G.makerName||G.shopName)?makerDisplayName()+' / '+shopDisplayName()+' · ':'';
    if(title){
      const b=BETA_DAYS[G.day]||{};
      title.textContent=(G.phase==='night'?'NOCHE ':'DIA ')+G.day+(b.title?' - '+b.title:'');
    }
    if(G.phase==='night'){
      txt.textContent=maker+tr('nightActive')+': '+queue+' '+tr('orders')+' / '+broken+' '+tr('failures')+'. '+stName+' REP '+G.rep+' ('+(repBoost>=0?'+':'')+repBoost+'% $ / '+(patBoost>=0?'+':'')+patBoost+'% ⏱)';
      tip.textContent=G.pActive?'⚡ '+tr('runBreaker'):tr('inspectPrinters');
    }else{
      txt.textContent=maker+tr('dayDyn')+' '+G.day+': $'+G.gold+' · '+stName+' REP '+G.rep+' ('+(repBoost>=0?'+':'')+repBoost+'% $ / '+(patBoost>=0?'+':'')+patBoost+'% ⏱) · '+tr('queue')+' '+queue+'.';
      tip.textContent=G.energy<35?'🧉 '+tr('drinkMate'):tr('buyCheap');
    }
    if(list){
      const tasks=betaObjectives(G.phase==='night'?'night':'day');
      list.innerHTML=tasks.map(t=>
        '<div class="objRow '+(t.done?'done':'')+'"><span>'+(t.done?'✓':'□')+'</span><b>'+t.txt+'</b><em>'+(t.done?'OK':'')+'</em></div>'
      ).join('');
    }
    const tag=document.getElementById('ptag');
    if(tag) tag.classList.toggle('pulseWarn',G.pActive||broken>0||G.stress>70);
  };
  setInterval(()=>{try{updateProPanel()}catch(e){}},700);
})();

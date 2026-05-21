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
    const txt=document.getElementById('proText'), risk=document.getElementById('proRisk'), tip=document.getElementById('proTip');
    if(!txt||!risk||!tip||!window.G)return;
    const broken=(G.printers||[]).filter(p=>p.broken).length;
    const queue=(G.orders||[]).length;
    const riskVal=Math.min(100,Math.round((G.stress||0)*.55+broken*18+queue*4+(G.pActive?25:0)));
    risk.style.width=riskVal+'%';
    if(G.phase==='night'){
      txt.textContent=tr('nightActive')+': '+queue+' '+tr('orders')+' / '+broken+' '+tr('failures')+' / $'+G.gold+' '+tr('box')+'.';
      tip.textContent=G.pActive?'⚡ '+tr('runBreaker'):tr('inspectPrinters');
    }else{
      txt.textContent=tr('dayDyn')+' '+G.day+': $'+G.gold+' '+tr('box')+' · REP '+G.rep+' · '+tr('queue')+' '+queue+'.';
      tip.textContent=G.energy<35?'🧉 '+tr('drinkMate'):tr('buyCheap');
    }
    const tag=document.getElementById('ptag');
    if(tag) tag.classList.toggle('pulseWarn',G.pActive||broken>0||G.stress>70);
  };
  setInterval(()=>{try{updateProPanel()}catch(e){}},700);
})();

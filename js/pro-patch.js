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
    const txt=document.getElementById('proText'), risk=document.getElementById('proRisk'), tip=document.getElementById('proTip'), list=document.getElementById('objList');
    if(!txt||!risk||!tip||!window.G)return;
    const broken=(G.printers||[]).filter(p=>p.broken).length;
    const queue=(G.orders||[]).length;
    const loaded=(G.printers||[]).filter(p=>p.busy||p.order).length;
    const activePrinters=(G.printers||[]).filter(p=>!p.locked&&!p.broken).length;
    const printed=(G.dayPrints||0)+(G.nightDone||0);
    const material=matStock('pla')+matStock('petg')+matStock('resin');
    const riskVal=Math.min(100,Math.round((G.stress||0)*.55+broken*18+queue*4+(G.pActive?25:0)));
    risk.style.width=riskVal+'%';
    const repBoost=Math.round((repPriceMult()-1)*100);
    const maker=G.makerName?G.makerName+' · ':'';
    if(G.phase==='night'){
      txt.textContent=maker+tr('nightActive')+': '+queue+' '+tr('orders')+' / '+broken+' '+tr('failures')+'. REP '+G.rep+' ('+(repBoost>=0?'+':'')+repBoost+'% $)';
      tip.textContent=G.pActive?'⚡ '+tr('runBreaker'):tr('inspectPrinters');
    }else{
      txt.textContent=maker+tr('dayDyn')+' '+G.day+': $'+G.gold+' · REP '+G.rep+' ('+(repBoost>=0?'+':'')+repBoost+'% $) · '+tr('queue')+' '+queue+'.';
      tip.textContent=G.energy<35?'🧉 '+tr('drinkMate'):tr('buyCheap');
    }
    if(list){
      const rows=G.day===1
        ?[
          [tr('objAccept'),G.dayOrd||0,2],
          [tr('objLoad'),printed+loaded,1],
          [tr('objEarn'),G.dayEarn||0,300,'$']
        ]
        :G.day===2
        ?[
          [tr('objAccept'),G.dayOrd||0,4],
          [tr('objLoad'),printed+loaded,3],
          [tr('objStock'),material,2]
        ]
        :[
          [tr('objPrinter2'),G.pCount>=2?1:0,1],
          [tr('objActive2'),activePrinters,2],
          [tr('objPrint2'),printed,2]
        ];
      list.innerHTML=rows.map(r=>{
        const done=r[1]>=r[2],pre=r[3]||'',val=pre+r[1]+'/'+pre+r[2];
        return '<div class="objRow '+(done?'done':'')+'"><span>'+(done?'✓':'□')+'</span><b>'+r[0]+'</b><em>'+val+'</em></div>';
      }).join('');
    }
    const tag=document.getElementById('ptag');
    if(tag) tag.classList.toggle('pulseWarn',G.pActive||broken>0||G.stress>70);
  };
  setInterval(()=>{try{updateProPanel()}catch(e){}},700);
})();

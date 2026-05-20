const TXT={
  es:{
    save:'Guardar',menu:'Menu',currentShift:'TURNO ACTUAL',
    proText:'Atende clientes, compra stock barato y prepara la noche.',
    proTip:'TIP: si hay urgentes, priorizalos antes del cierre.',
    day:'DIA',night:'NOCHE',scale:'ESCALA',
    dayDesc:'Atende clientes, negocia pedidos y carga trabajo para la noche.',
    nightDesc:'Supervisa impresoras, repara fallas y sobrevivi cortes de luz.',
    scaleDesc:'Compra upgrades, empleados, stock y mas impresoras para crecer.',
    move:'Mover',interact:'Interactuar',closePause:'Cerrar / pausa',acceptOrder:'Aceptar pedido',
    negotiate:'Negociar',reject:'Rechazar',repair:'Reparar',mate:'Mate',
    continue:'CONTINUAR',reset:'BORRAR PARTIDA',
    objective:'Objetivo: hacer crecer tu print shop sin fundirte ni quemar las maquinas.',
    keyEsc:'Esc menu',keyPick:'1-6 elegir',keyAccept:'A aceptar',keyNeg:'N negociar',keyReject:'R rechazar',keyMate:'I inventario',keyRepair:'O tienda',
    cash:'Caja',printers:'Impresoras',stock:'Stock',team:'Equipo',
    ready:'LISTO',locked:'BLOQUEADO',buy:'COMPRAR',noMoney:'SIN FONDOS',
    upSub:'Compra mejoras permanentes para sobrevivir mas noches.',
    empSub:'Contrata ayuda: pagas sueldo cada noche, pero te alivian el turno.',
    stkSub:'Compra materiales al precio del mercado de hoy.',
    needs:'Requiere ',installed:'Instalado',hired:'Contratado',
    salary:'Sueldo',partsName:'Repuestos nozzle',partsDesc:'Picos, racores y piezas para reparar.',
    tier:'Gama',risk:'Riesgo',quickStock:'Compra rapida: calidad estandar. En tienda tenes todas las gamas.',
    material:'Material',filament:'Filamento',difficulty:'Dificultad',withoutStock:'sin stock',
    usableStock:'No hay stock usable para ',missing:'Falta '
    ,nightActive:'Noche activa',orders:'pedidos',failures:'fallas',box:'caja',
    runBreaker:'Corre al tablero electrico.',inspectPrinters:'Inspecciona impresoras antes de acelerar.',
    dayDyn:'Dia',queue:'cola',drinkMate:'Toma mate o baja ritmo.',buyCheap:'Compra stock cuando el mercado este barato.'
  },
  en:{
    save:'Save',menu:'Menu',currentShift:'CURRENT SHIFT',
    proText:'Serve clients, buy cheap stock, and prepare the night shift.',
    proTip:'TIP: prioritize urgent jobs before closing.',
    day:'DAY',night:'NIGHT',scale:'SCALE',
    dayDesc:'Serve clients, negotiate orders, and queue night work.',
    nightDesc:'Watch printers, fix failures, and survive outages.',
    scaleDesc:'Buy upgrades, staff, stock, and more printers to grow.',
    move:'Move',interact:'Interact',closePause:'Close / pause',acceptOrder:'Accept order',
    negotiate:'Negotiate',reject:'Reject',repair:'Repair',mate:'Mate',
    continue:'CONTINUE',reset:'DELETE SAVE',
    objective:'Goal: grow your print shop without going broke or burning machines.',
    keyEsc:'Esc menu',keyPick:'1-6 pick',keyAccept:'A accept',keyNeg:'N bargain',keyReject:'R reject',keyMate:'I inventory',keyRepair:'O shop',
    cash:'Cash',printers:'Printers',stock:'Stock',team:'Team',
    ready:'READY',locked:'LOCKED',buy:'BUY',noMoney:'NO CASH',
    upSub:'Buy permanent upgrades to survive longer nights.',
    empSub:'Hire help: nightly wages, less pressure.',
    stkSub:'Buy materials at today market price.',
    needs:'Needs ',installed:'Installed',hired:'Hired',
    salary:'Wage',partsName:'Nozzle spares',partsDesc:'Nozzles, fittings, and repair parts.',
    tier:'Tier',risk:'Risk',quickStock:'Quick buy: standard quality. Shop has every tier.',
    material:'Material',filament:'Filament',difficulty:'Difficulty',withoutStock:'no stock',
    usableStock:'No usable stock for ',missing:'Missing ',
    nightActive:'Night shift',orders:'orders',failures:'failures',box:'cash',
    runBreaker:'Run to the breaker panel.',inspectPrinters:'Inspect printers before rushing.',
    dayDyn:'Day',queue:'queue',drinkMate:'Drink mate or slow down.',buyCheap:'Buy stock when the market is cheap.'
  }
};
function tr(k){return (TXT[G.lang]&&TXT[G.lang][k])||TXT.es[k]||k;}
function filDesc(f){return G.lang==='en'?(f.deEn||f.de):f.de;}
function filTier(f){return G.lang==='en'?(f.tierEn||f.tier):f.tier;}
function setLang(lang){
  G.lang=lang==='en'?'en':'es';
  applyLang();
  doSave(G);
  if(isShown&&isShown('shop'))G.tab(G.stab);
}
function applyLang(){
  document.documentElement.lang=G.lang;
  const set=(id,txt)=>{const el=document.getElementById(id);if(el)el.textContent=txt;};
  set('proTitle','📋 '+tr('currentShift'));
  set('proText',tr('proText'));
  set('proTip',tr('proTip'));
  set('btnSave','💾 '+tr('save'));
  set('btnMenu','? '+tr('menu'));
  set('tsDay','☀️ '+tr('day'));
  set('tsNight','🌙 '+tr('night'));
  set('tsScale','📈 '+tr('scale'));
  set('tsDayDesc',tr('dayDesc'));
  set('tsNightDesc',tr('nightDesc'));
  set('tsScaleDesc',tr('scaleDesc'));
  set('ctlMove',tr('move'));
  set('ctlInteract',tr('interact'));
  set('ctlEsc',tr('closePause'));
  set('ctlAccept',tr('acceptOrder'));
  set('ctlNeg',tr('negotiate'));
  set('ctlReject',tr('reject'));
  set('ctlRepair',tr('repair'));
  set('ctlMate',tr('mate'));
  set('btnContinue','▶ '+tr('continue'));
  set('btnReset',tr('reset'));
  set('tsObjective',tr('objective'));
  const kh=document.querySelectorAll('#keyHelp span');
  [tr('keyEsc'),tr('keyPick'),tr('keyAccept'),tr('keyNeg'),tr('keyReject'),tr('keyMate'),tr('keyRepair')].forEach((v,i)=>{if(kh[i])kh[i].textContent=v;});
  document.querySelectorAll('.langBtn').forEach(b=>b.classList.toggle('on',b.dataset.lang===G.lang));
}

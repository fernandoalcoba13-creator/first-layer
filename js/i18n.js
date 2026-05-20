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
    usableStock:'No hay stock usable para ',missing:'Falta ',
    inventory:'Inventario',materialsTab:'Materiales',ordersTab:'Pedidos',consumablesTab:'Consumibles',
    coffee:'Cafe de turno',bar:'Barrita cereal',cleaner:'Limpia pico',
    use:'Usar',missingMaterial:'falta material',noQueuedOrders:'Sin pedidos en cola.',
    consHint:'Cafe recupera energia. La barrita baja estres. Limpia pico resuelve boquilla tapada o blob durante la noche.'
    ,nightActive:'Noche activa',orders:'pedidos',failures:'fallas',box:'caja',
    runBreaker:'Corre al tablero electrico.',inspectPrinters:'Inspecciona impresoras antes de acelerar.',
    dayDyn:'Dia',queue:'cola',drinkMate:'Toma mate o baja ritmo.',buyCheap:'Compra stock cuando el mercado este barato.',
    close:'Cerrar',ok:'OK',accept:'Aceptar',bargain:'Negociar',decline:'Rechazar',urgent:'URGENTE',
    noWaitingClients:'No hay clientes esperando.',mood:'Mood',free:'Libres',broken:'Rotas',queued:'Pedidos en cola',
    manualNightHint:'Podés cargar trabajos de día sin fallas. A la noche aparecen los riesgos.',
    lockedToday:'Disponible más adelante',
    stockTitle:'Stock',mateBuy:'Mate',boardTitle:'Tablero Electrico',goShop:'Ir a Tienda',
    solar:'Solar',immune:'INMUNE',basic:'Basico',none:'NO',parts:'Repuestos',
    noFunds:'Sin fondos',noSpares:'Sin repuestos',almostFullEnergy:'Energia casi llena. Guardalo.',
    noMate:'Sin mate. Compra en tienda ($80).',alreadyTurbo:'Ya estas en turbo!',
    enoughEnergy:'Energia suficiente, guarda el mate.',mateTaken:'Mate tomado! +40 energia. Ritmo arriba 30s',normalPace:'Ritmo normal.',
    cheapPla:'PLA barato hoy!',expensivePla:'PLA caro hoy',useStock:'Usa lo que tenes.',stockUp:'Stockeate!',
    dayClosed:'Dia {day} cerrado',clientsServed:'Clientes atendidos',lostRejected:'Se fueron o rechazaste',
    noLostClients:'Sin clientes perdidos',nightOrders:'Pedidos para la noche',urgentOrders:'Urgentes',
    noUrgent:'Sin urgentes en cola',queueValue:'Valor en cola',paidOnFinish:'Se cobra al terminar impresiones',
    reputation:'Reputacion',finalStress:'Estres final',
    goodShift:'Turno prolijo. La noche define si esa cola se convierte en plata.',
    spicyShift:'Turno picante. Varios clientes quedaron en el camino.',
    bigQueue:'Buen volumen. Las impresoras van a transpirar esta noche.',
    slowDay:'Dia flojo. Sin pedidos, la noche va a ser tranquila pero seca.',
    prepNight:'Prepara repuestos y mira las maquinas de cerca. Cada pedido terminado suma caja y reputacion.',
    noReadyOrders:'No hay pedidos listos. Usa la proxima manana para comprar stock barato y aceptar encargos simples.',
    nightTitle:'NOCHE',nightQueue:'{queue} pedidos en cola.\nVigila impresoras y cortes de luz.',
    dayStartLog:'Dia {day} - Atende clientes y carga pedidos para la noche.',
    orderReady:'listo para imprimir',missingOrder:'falta {mat} x{units}',queueCount:'Cola',
    lucasAccepted:'Lucas acepto',customerLeft:'se fue',printerTitle:'Impresoras',
    choosePrinterJob:'Elegi una impresora libre y carga un trabajo con E.',noOrdersToPrint:'Sin pedidos en cola para imprimir.',
    assignHint:'WASD | E=asignar/inspeccionar',jobLoaded:'Ese trabajo ya esta cargado.',
    loadPrinter:'Cargar P{n}',loadPrinterDesc:'Elegi que trabajo imprimir en esta maquina.\nSi falta material, queda en cola hasta comprar stock.',
    dayLoadPrinterDesc:'Durante el día imprime sin fallas. El riesgo aparece de noche.',
    noPendingJobs:'No hay trabajos pendientes.',brokenPrinter:'rota. Reparala primero.',
    prints:'imprime',loaded:'cargada',withMat:'con',noWorkTonight:'Sin trabajo esta noche.',
    lightBack:'Luz volvio automaticamente.',breakerRestored:'Tablero restablecido!',
    breakerOrder:'Levanta los disyuntores en orden (1->{num})',orderFromTo:'Orden: del 1 al {num}',
    waitReturn:'Espera que vuelva...',runToBreaker:'Corre al tablero -> E',powerLogWait:'Espera...',powerLogRun:'Corre al tablero!',
    inspectPrinter:'Inspeccionar impresora',chooseJob:'Elegir trabajo para imprimir',loadJob:'Cargar trabajo',
    savedManual:'Guardado manual',shopTitle:'TIENDA',inventoryShort:'INV',counter:'Mostrador',
    upgradesTab:'Upgrades',employeesTab:'Empleados',stockTab:'Stock',startNight:'Arrancar la noche',objectiveLabel:'Objetivo',
    cost:'Costo',autoRepair:'Rodrigo repara solo',nozzleMini:'Minijuego: limpiar pico',ignore:'Ignorar',cleanNozzle:'Limpia pico',
    nozzleTitle:'Limpiar pico',nozzleDesc:'Espera la zona verde y limpia el nozzle.',nozzleTemp:'Temperatura del pico',
    clean:'Limpiar',goodCleans:'Limpiezas buenas',greenZone:'Zona verde',perfectClean:'Limpieza perfecta',scratchNozzle:'Rayaste el nozzle. -tiempo',
    nozzleFailed:'El pico quedo obstruido. La impresora queda fuera.',nowBreaker:'Ahora el {num}',completed:'Completado!',wrongOrder:'Orden incorrecto. Empeza de nuevo.',
    energy:'energia',stress:'estres',saveForNozzle:'Guardalo para boquilla tapada o blob.',nozzleCleaned:'Pico limpio sin gastar repuesto.',
    bedMini:'Minijuego: adherir cama',bedTitle:'Ajustar cama',bedDesc:'Toca las esquinas en el orden indicado para recuperar la primera capa.',bedFail:'La pieza se despego. La impresora queda fuera.'
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
    inventory:'Inventory',materialsTab:'Materials',ordersTab:'Orders',consumablesTab:'Consumables',
    coffee:'Shift coffee',bar:'Cereal bar',cleaner:'Nozzle wipe',
    use:'Use',missingMaterial:'missing material',noQueuedOrders:'No queued orders.',
    consHint:'Coffee restores energy. Cereal bars reduce stress. Nozzle wipes solve clogs or blobs during night shift.',
    nightActive:'Night shift',orders:'orders',failures:'failures',box:'cash',
    runBreaker:'Run to the breaker panel.',inspectPrinters:'Inspect printers before rushing.',
    dayDyn:'Day',queue:'queue',drinkMate:'Drink mate or slow down.',buyCheap:'Buy stock when the market is cheap.',
    close:'Close',ok:'OK',accept:'Accept',bargain:'Bargain',decline:'Reject',urgent:'URGENT',
    noWaitingClients:'No clients waiting.',mood:'Mood',free:'Free',broken:'Broken',queued:'Queued orders',
    manualNightHint:'You can load day jobs without failures. Night brings the risks.',
    lockedToday:'Available later',
    stockTitle:'Stock',mateBuy:'Mate',boardTitle:'Breaker Panel',goShop:'Go to Shop',
    solar:'Solar',immune:'IMMUNE',basic:'Basic',none:'NO',parts:'Spares',
    noFunds:'No cash',noSpares:'No spares',almostFullEnergy:'Energy almost full. Save it.',
    noMate:'No mate left. Buy more in the shop ($80).',alreadyTurbo:'Already in turbo!',
    enoughEnergy:'Energy is high enough. Save the mate.',mateTaken:'Mate taken! +40 energy. Pace up for 30s',normalPace:'Normal pace.',
    cheapPla:'PLA is cheap today!',expensivePla:'PLA is expensive today',useStock:'Use what you have.',stockUp:'Stock up!',
    dayClosed:'Day {day} closed',clientsServed:'Clients served',lostRejected:'Left or rejected',
    noLostClients:'No lost clients',nightOrders:'Night orders',urgentOrders:'Urgent',
    noUrgent:'No urgent jobs queued',queueValue:'Queue value',paidOnFinish:'Paid when prints finish',
    reputation:'Reputation',finalStress:'Final stress',
    goodShift:'Clean shift. The night decides if that queue turns into cash.',
    spicyShift:'Rough shift. Several clients slipped away.',
    bigQueue:'Good volume. The printers will sweat tonight.',
    slowDay:'Slow day. No jobs means a quiet but dry night.',
    prepNight:'Prepare spares and watch the machines closely. Finished jobs add cash and reputation.',
    noReadyOrders:'No ready jobs. Use the next morning to buy cheap stock and accept simple orders.',
    nightTitle:'NIGHT',nightQueue:'{queue} jobs queued.\nWatch printers and power outages.',
    dayStartLog:'Day {day} - Serve clients and queue work for the night.',
    orderReady:'ready to print',missingOrder:'missing {mat} x{units}',queueCount:'Queue',
    lucasAccepted:'Lucas accepted',customerLeft:'left',printerTitle:'Printers',
    choosePrinterJob:'Choose a free printer and load a job with E.',noOrdersToPrint:'No queued jobs to print.',
    assignHint:'WASD | E=assign/inspect',jobLoaded:'That job is already loaded.',
    loadPrinter:'Load P{n}',loadPrinterDesc:'Choose which job to print on this machine.\nIf material is missing, it stays queued until you buy stock.',
    dayLoadPrinterDesc:'Day prints do not fail. The risk starts at night.',
    noPendingJobs:'No pending jobs.',brokenPrinter:'is broken. Repair it first.',
    prints:'prints',loaded:'loaded',withMat:'with',noWorkTonight:'No work tonight.',
    lightBack:'Power came back automatically.',breakerRestored:'Breaker panel restored!',
    breakerOrder:'Raise the breakers in order (1->{num})',orderFromTo:'Order: 1 to {num}',
    waitReturn:'Wait for power...',runToBreaker:'Run to breaker -> E',powerLogWait:'Wait...',powerLogRun:'Run to the breaker!',
    inspectPrinter:'Inspect printer',chooseJob:'Choose job to print',loadJob:'Load job',
    savedManual:'Manual save',shopTitle:'SHOP',inventoryShort:'INV',counter:'Counter',
    upgradesTab:'Upgrades',employeesTab:'Staff',stockTab:'Stock',startNight:'Start night',objectiveLabel:'Goal',
    cost:'Cost',autoRepair:'Rodrigo fixes it',nozzleMini:'Mini-game: clean nozzle',ignore:'Ignore',cleanNozzle:'Nozzle wipe',
    nozzleTitle:'Clean nozzle',nozzleDesc:'Wait for the green zone and clean the nozzle.',nozzleTemp:'Nozzle temperature',
    clean:'Clean',goodCleans:'Good cleans',greenZone:'Green zone',perfectClean:'Perfect clean',scratchNozzle:'You scratched the nozzle. -time',
    nozzleFailed:'The nozzle stayed clogged. The printer is out.',nowBreaker:'Now {num}',completed:'Completed!',wrongOrder:'Wrong order. Start again.',
    energy:'energy',stress:'stress',saveForNozzle:'Save it for a clogged nozzle or blob.',nozzleCleaned:'Nozzle cleaned without spending a spare.',
    bedMini:'Mini-game: bed adhesion',bedTitle:'Adjust bed',bedDesc:'Tap the corners in order to recover the first layer.',bedFail:'The part lifted. The printer is out.'
  }
};
function tr(k){return (TXT[G.lang]&&TXT[G.lang][k])||TXT.es[k]||k;}
function trf(k,vars){return tr(k).replace(/\{(\w+)\}/g,(_,v)=>vars&&vars[v]!==undefined?vars[v]:'');}
const CL_EN_LINES={
  marcos:['Send it whenever you can.','Can we add my logo?'],
  sofi:['I need it for tomorrow!','Do you have nicer colors?'],
  diego:['Tolerance plus/minus 0.1mm.','What material do you recommend?'],
  valeria:['Corporate presentation.','Volume discount?'],
  nico:['Just like in the game.','You are a legend!'],
  laura:['I designed this myself.','I love the process.'],
  juli:['Can I film you?','Tag me!'],
  tomas:['For a scale model.','I have 10 more parts.'],
  ramiro:['Hurry, match day!','Can it be ready by 5?'],
  pablo:['I study FDM.','Interesting.'],
  meli:['Someone recommended you.','Nice workshop!'],
  caro:['What filaments do you have?','Any color works.']
};
const MOOD_EN={Apurada:'Rushed','Técnico':'Technical',Corporativa:'Corporate',Creativa:'Creative',Influencer:'Influencer',Constructor:'Builder',Urgente:'Urgent',Académico:'Academic',Casual:'Casual',Curiosa:'Curious'};
const TAG_EN={flexible:'flexible','apuro estetico':'rush finish','tolerancia fina':'tight tolerance',corporativo:'corporate','fan art':'fan art',creativo:'creative',viral:'viral',maqueta:'scale model','contra reloj':'against the clock',academico:'academic',simple:'simple',curiosa:'curious',normal:'normal'};
const STORY_EN={
  1:{ti:'🖨️ Day 1 - Opening Day',tx:'KMORRA Print Shop opens.\nToday is basic: eco PLA, a few clients, and a tutorial night.',ob:'Earn $300'},
  2:{ti:'⏱️ Day 2 - First Pressure',tx:'More jobs arrive and the first outage hits.\nAccept work, but check stock before printing.',ob:'Accept 4 orders'},
  3:{ti:'⚡ Day 3 - Breaking Point',tx:'Tonight gets heavy.\nBuy another printer to maximize production and survive with 2 machines running.',ob:'Survive with 2 printers working'}
};
const NE_EN={
  jam:{ti:'FILAMENT JAM',de:'Extruder on {P} jammed.',fx:'Cold pull'},
  therm:{ti:'THERMAL FAULT',de:'Temperature out of range on {P}.',fx:'Cool down'},
  bed:{ti:'BED ADHESION FAIL',de:'First layer lifted on {P}.',fx:'Reprint'},
  run:{ti:'OUT OF FILAMENT',de:'Spool on {P} ran out.',fx:'Reload'},
  clog:{ti:'CLOGGED NOZZLE',de:'Nozzle on {P} is burnt.',fx:'Replace'},
  warp:{ti:'SEVERE WARPING',de:'Part on {P} contracted.',fx:'Re-enclose'},
  blob:{ti:'NOZZLE BLOB',de:'Over-extrusion on {P}.',fx:'Clean'},
  layer:{ti:'LAYER SHIFTING',de:'Toolhead on {P} lost position.',fx:'Calibrate'},
  motor:{ti:'BURNT MOTOR',de:'Stepper on {P} overheated.',fx:'Replace part'},
  spag:{ti:'SPAGHETTI PRINT',de:'{P} printed in mid-air.',fx:'Retry'},
  humid:{ti:'WET FILAMENT',de:'Filament absorbed moisture on {P}.',fx:'Dry'}
};
const PE_EN={
  micro:{ti:'⚡ MICRO OUTAGE',de:'Short dip. Wait it out.'},
  norm:{ti:'⚡ POWER OUTAGE',de:'Neighborhood outage.\nRestore the breaker panel.'},
  long:{ti:'⚡ LONG OUTAGE',de:'Extended outage.\nFull breaker reset.'}
};
function clLine(cl){const lines=G.lang==='en'&&CL_EN_LINES[cl.id];return lines?lines[Math.floor(Math.random()*lines.length)]:cl.d[Math.floor(Math.random()*cl.d.length)];}
function moodName(m){return G.lang==='en'?(MOOD_EN[m]||m):m;}
function tagName(t){return G.lang==='en'?(TAG_EN[t]||t):t;}
function storyText(s){return G.lang==='en'&&STORY_EN[s.day]?STORY_EN[s.day]:s;}
function evText(ev){return G.lang==='en'&&NE_EN[ev.id]?{...ev,...NE_EN[ev.id]}:ev;}
function powerText(ev){return G.lang==='en'&&PE_EN[ev.id]?{...ev,...PE_EN[ev.id]}:ev;}
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
  set('shopSub',G.stab==='emp'?tr('empSub'):G.stab==='stk'?tr('stkSub'):tr('upSub'));
  set('deStart','▶ '+tr('startNight'));
  set('tsObjective',tr('objective'));
  const st=document.querySelectorAll('#shop .st');
  [tr('upgradesTab'),tr('employeesTab'),tr('stockTab')].forEach((v,i)=>{if(st[i])st[i].textContent=v;});
  const kh=document.querySelectorAll('#keyHelp span');
  [tr('keyEsc'),tr('keyPick'),tr('keyAccept'),tr('keyNeg'),tr('keyReject'),tr('keyMate'),tr('keyRepair')].forEach((v,i)=>{if(kh[i])kh[i].textContent=v;});
  document.querySelectorAll('.langBtn').forEach(b=>b.classList.toggle('on',b.dataset.lang===G.lang));
}

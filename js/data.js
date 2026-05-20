// ═══ DATA ═══
// Static game data. Globals: CL (clients), PR (products), NE (night events / failures),
// PE (power events / outages), UPG (upgrades), EMP (employees), STORY (story beats).
const CL=[
  {id:'marcos',n:'Marcos',e:'😎',c:0x4466ff,m:'Chill',pat:26,gr:.9,d:['Dale, mandámelo cuando puedas.','¿Le ponemos mi logo?'],ac:'Buena onda.',rf:'Okey.',dn:'¡Quedó épico!'},
  {id:'sofi',n:'Sofi',e:'🌸',c:0xff66aa,m:'Apurada',pat:13,gr:1.15,d:['¡Lo necesito para mañana!','¿Tenés colores más lindos?'],ac:'Perfecto.',rf:'Me dejás mal...',dn:'¡Por fin!'},
  {id:'diego',n:'Diego',e:'🔧',c:0x44aaff,m:'Técnico',pat:22,gr:1.05,d:['Tolerancia ±0.1mm.','¿Qué material recomendás?'],ac:'No me falles.',rf:'Me decepcionás.',dn:'Exacto.'},
  {id:'valeria',n:'Valeria',e:'💼',c:0xffaa44,m:'Corporativa',pat:18,gr:1.2,d:['Presentación corporativa.','¿Descuento por volumen?'],ac:'Excelente.',rf:'Buscaré otra opción.',dn:'Impecable.'},
  {id:'nico',n:'Nico',e:'🎮',c:0x44ff88,m:'Gamer',pat:24,gr:.85,d:['Igual que en el juego.','¡Sos un crack!'],ac:'¡Lo más!',rf:'Ugh...',dn:'¡ÉPICO!'},
  {id:'laura',n:'Laura',e:'🎨',c:0xff44ff,m:'Creativa',pat:21,gr:.95,d:['Diseñé esto yo misma.','Me encanta el proceso.'],ac:'Qué bueno.',rf:'Qué lástima.',dn:'¡Hermosa!'},
  {id:'juli',n:'Juli',e:'🌟',c:0xffff44,m:'Influencer',pat:11,gr:1.3,d:['¿Puedo filmarte?','¡Etiquetame!'],ac:'¡Divino!',rf:'Busco otro...',dn:'¡Ya lo subo!'},
  {id:'tomas',n:'Tomás',e:'🏗️',c:0xff8844,m:'Constructor',pat:20,gr:1.1,d:['Para maqueta.','Tengo 10 piezas más.'],ac:'Trabajo confirmado.',rf:'Gracias igual.',dn:'A escala.'},
  {id:'ramiro',n:'Ramiro',e:'⚽',c:0x88ff44,m:'Urgente',pat:9,gr:1.4,d:['¡Apurate, partido!','¿Para las 5?'],ac:'¡Te debo una!',rf:'No me hagas esto.',dn:'¡A tiempo!'},
  {id:'pablo',n:'Pablo',e:'📚',c:0xaaaaff,m:'Académico',pat:28,gr:.9,d:['Estudio FDM.','Interesante.'],ac:'Tomo nota.',rf:'Entendido.',dn:'¿Me explicás?'},
  {id:'meli',n:'Meli',e:'🐱',c:0xee88ff,m:'Casual',pat:19,gr:1.0,d:['Me recomendaron.','¡Lindo taller!'],ac:'Primera vez.',rf:'Okey.',dn:'¡Bonito!'},
  {id:'caro',n:'Caro',e:'🌺',c:0xff6688,m:'Curiosa',pat:22,gr:.95,d:['¿Qué filamentos tenés?','Cualquier color.'],ac:'Qué lindo.',rf:'Qué pena.',dn:'¡Me encantó!'},
];
const PR=[
  {n:'Funko Pop',e:'🎭',t:5,p:150,cat:'fig',c:0xff7eb3},
  {n:'Miniatura',e:'🏰',t:4,p:100,cat:'fig',c:0x5bc8fa},
  {n:'Porta cel',e:'📱',t:2,p:65,cat:'util',c:0x4dff91},
  {n:'Figura anime',e:'⚔️',t:6,p:220,cat:'fig',c:0x9d7fe3},
  {n:'Llavero',e:'🗝️',t:1,p:38,cat:'util',c:0xffe566},
  {n:'Busto',e:'🗿',t:7,p:300,cat:'art',c:0xffb347},
  {n:'Mascota 3D',e:'🐶',t:4,p:180,cat:'fig',c:0xff9ecd},
  {n:'Logo',e:'🏷️',t:2,p:110,cat:'util',c:0x7effd4},
  {n:'Pieza RC',e:'⚙️',t:3,p:140,cat:'util',c:0xa0e0ff},
  {n:'Joyería',e:'💍',t:3,p:200,cat:'art',c:0xffd4e8},
  {n:'Cosplay',e:'🛡️',t:8,p:380,cat:'art',c:0xccccff},
];
const FILAMENTS={
  pla:[
    {id:'eco',n:'K-PLA Barrio',brand:'Eco tipo Grilon',q:1,base:55,risk:.08,clog:.18,rep:-1,de:'Barato y rendidor, pero ensucia mas el pico.'},
    {id:'std',n:'Morratek PLA+',brand:'PLA+ tipo Printalot',q:2,base:78,risk:.02,clog:.06,rep:0,de:'Calidad pareja para trabajos comunes.'},
    {id:'pro',n:'ProtoLux Silk',brand:'Silk tipo Hellbot',q:3,base:112,risk:-.03,clog:.02,rep:1,de:'Mejor terminacion, menos fallas, mas caro.'}
  ],
  petg:[
    {id:'eco',n:'PET-G Workline',brand:'PETG economico',q:1,base:85,risk:.07,clog:.12,rep:-1,de:'Fuerte pero irregular; pide nozzle limpio.'},
    {id:'std',n:'Morratek PETG+',brand:'PETG tipo Printalot',q:2,base:115,risk:.025,clog:.05,rep:0,de:'Buen balance para piezas funcionales.'},
    {id:'pro',n:'FiberMax Tough',brand:'Tecnico tipo Prusament',q:3,base:155,risk:-.025,clog:.015,rep:1,de:'Estable para tolerancias finas.'}
  ],
  resin:[
    {id:'basic',n:'K-Resin Basic',brand:'Resina estandar',q:1,base:120,risk:.05,clog:.03,rep:-1,de:'Sirve para volumen, mas postproceso.'},
    {id:'std',n:'MorraRes Detail',brand:'Resina detalle',q:2,base:155,risk:.015,clog:.01,rep:0,de:'Buen detalle y menos rechazos.'},
    {id:'pro',n:'CrystalForge Pro',brand:'Resina premium',q:3,base:205,risk:-.02,clog:0,rep:1,de:'Para bustos, joyeria y clientes exigentes.'}
  ]
};
const NE=[
  {id:'jam',ic:'⚙️',ti:'ATASCO FILAMENTO',de:'Extrusor de {P} trabó.',fx:'🔧 Cold Pull',g:0,pts:1,rp:5},
  {id:'therm',ic:'🌡️',ti:'FALLO TÉRMICO',de:'Temp fuera de rango en {P}.',fx:'❄️ Enfriar',g:40,pts:0,rp:8},
  {id:'bed',ic:'📐',ti:'FALLA ADHESIÓN',de:'Primera capa despegada en {P}.',fx:'🖨️ Reimprimir',g:25,pts:0,rp:4},
  {id:'run',ic:'🧵',ti:'SIN FILAMENTO',de:'Bobina de {P} terminada.',fx:'🧵 Recargar',g:70,pts:0,rp:3},
  {id:'clog',ic:'🚫',ti:'NOZZLE OBSTRUIDO',de:'Nozzle de {P} carbonizado.',fx:'🔩 Reemplazar',g:0,pts:1,rp:6},
  {id:'warp',ic:'🌀',ti:'WARPING SEVERO',de:'ABS de {P} se contrajo.',fx:'♨️ Re-enclosure',g:30,pts:0,rp:5},
  {id:'blob',ic:'💧',ti:'BLOB EN NOZZLE',de:'Over-extrusion en {P}.',fx:'🧹 Limpiar',g:15,pts:0,rp:3},
  {id:'layer',ic:'🔀',ti:'LAYER SHIFTING',de:'Cabezal de {P} perdió posición.',fx:'⚙️ Calibrar',g:0,pts:0,rp:7},
  {id:'motor',ic:'⚡',ti:'MOTOR QUEMADO',de:'Stepper de {P} sobrecalentó.',fx:'🔩 Repuesto',g:80,pts:2,rp:12},
  {id:'spag',ic:'🍝',ti:'SPAGHETTI PRINT',de:'{P} imprimió en el aire.',fx:'🖨️ Relicar',g:20,pts:0,rp:4},
  {id:'humid',ic:'💦',ti:'FILAMENTO HÚMEDO',de:'PLA absorbió humedad en {P}.',fx:'🔥 Secar',g:0,pts:0,rp:3},
];
const PE=[
  {id:'micro',ti:'⚡ MICROCORTE',de:'Bajón breve. Esperá.',dur:4000,pen:.1},
  {id:'norm',ti:'⚡ CORTE DE LUZ',de:'Corte en el barrio.\nRestablecé el tablero.',dur:18000,pen:.4},
  {id:'long',ti:'⚡ CORTE PROLONGADO',de:'Corte extendido.\nReset completo del tablero.',dur:35000,pen:.7},
];
const UPG=[
  {id:'speed1',n:'Perfil velocidad',de:'+30% velocidad',co:300,ic:'⚡'},
  {id:'speed2',n:'Aceleración máx',de:'+60% velocidad total',co:600,ic:'🚀',req:'speed1'},
  {id:'qual',n:'Calibración fina',de:'+25% precio piezas',co:350,ic:'✨'},
  {id:'ams',n:'AMS Multicolor',de:'+50% precio fig/arte',co:900,ic:'🌈',req:'unlock2'},
  {id:'cool',n:'Sistema cooling',de:'-45% fallas térmicas',co:450,ic:'❄️'},
  {id:'abed',n:'Auto-bed leveling',de:'-40% fallas cama',co:380,ic:'🎯'},
  {id:'enc',n:'Enclosure cerrado',de:'Elimina warping',co:500,ic:'📦'},
  {id:'klip',n:'Klipper firmware',de:'-70% layer shifts',co:700,ic:'💻'},
  {id:'dry',n:'Drybox automática',de:'Elimina humedad',co:250,ic:'🔥'},
  {id:'prot',n:'Protector tensión',de:'Microcortes sin daño',co:120,ic:'🔌'},
  {id:'ups1',n:'UPS básico 500W',de:'3 min autonomía',co:300,ic:'🔋'},
  {id:'ups2',n:'UPS industrial 2kW',de:'10 min autonomía',co:600,ic:'🔋',req:'ups1'},
  {id:'gen',n:'Generador nafta',de:'Cortes normales=0 daño',co:900,ic:'⛽',req:'ups1'},
  {id:'solar',n:'Panel solar',de:'Inmunidad total a cortes',co:1500,ic:'☀️',req:'gen'},
  {id:'ig',n:'Instagram Reels',de:'+3 clientes/día',co:400,ic:'📸'},
  {id:'unlock2',n:'2da impresora',de:'Desbloquea Bambu P2',co:400,ic:'🖨️'},
  {id:'unlock3',n:'3ra impresora',de:'Desbloquea Bambu P3',co:750,ic:'🖨️',req:'unlock2'},
  {id:'unlock4',n:'4ta impresora',de:'Desbloquea Bambu P4',co:1400,ic:'🖨️',req:'unlock3'},
];
const EMP=[
  {id:'lucas',n:'Lucas (Estudiante)',de:'Atiende 1 cliente solo/turno',co:200,sal:50,ic:'👦'},
  {id:'rodri',n:'Rodrigo (Técnico)',de:'Repara fallas básicas solo',co:350,sal:80,ic:'👨‍🔧'},
  {id:'caro2',n:'Caro (Diseñadora)',de:'+15% precio todos los pedidos',co:500,sal:100,ic:'👩‍💻'},
  {id:'juli2',n:'Juli (Community)',de:'+5 clientes/semana',co:400,sal:90,ic:'📱'},
  {id:'diego2',n:'Diego (Técnico Full)',de:'Supervisa noche solo',co:800,sal:150,ic:'🔧'},
];
const STORY=[
  {day:1,ti:'🖨️ Día 1 — El comienzo',tx:'Arrancás con una Bambu X1C y $500.\nKMORRA Print Shop abre sus puertas.',ob:'Ganá $300 hoy'},
  {day:3,ti:'🌙 Día 3 — Primera noche difícil',tx:'Esta noche habrá fallas y cortes de luz.\nComprá repuestos antes de dormir.',ob:'Reparar todas las fallas'},
  {day:5,ti:'📸 Día 5 — Explosión en redes',tx:'Juli publicó un reel del taller.\n¡El doble de clientes hoy!',ob:'Atendé 8 clientes'},
  {day:7,ti:'🏆 Semana 1 completada',tx:'¡Sobreviviste la primera semana!\nTu reputación creció.',ob:'Llegá a $2000 en caja'},
];

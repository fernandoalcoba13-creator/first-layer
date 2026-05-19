// ═══ DRAW HELPERS ═══
// Procedural drawing functions used during prototype phase.
// Will be progressively retired as Mati delivers sprite assets.
const PRINTER_ASSET='maquina3d';
const PRINTER_SHEET='assets/printers/maquina3d.png';
function setupPrinterAnims(scene){
  if(!scene.textures.exists(PRINTER_ASSET)||scene.anims.exists('printer_idle'))return;
  const fr=n=>({key:PRINTER_ASSET,frame:n});
  scene.anims.create({key:'printer_idle',frames:[fr(0),fr(1),fr(2),fr(3)],frameRate:3,repeat:-1});
  scene.anims.create({key:'printer_working',frames:[4,5,6,7,8,9,10,11,12].map(fr),frameRate:8,repeat:-1});
  scene.anims.create({key:'printer_fail',frames:[fr(13),fr(14)],frameRate:4,repeat:-1});
  scene.anims.create({key:'printer_out_filament',frames:[fr(15),fr(16)],frameRate:3,repeat:-1});
}
function loadPrinterAssetsAsync(scene,onReady){
  if(scene.textures.exists(PRINTER_ASSET)){setupPrinterAnims(scene);if(onReady)onReady();return;}
  if(G._printerAssetCallbacks){G._printerAssetCallbacks.push(onReady);return;}
  G._printerAssetCallbacks=[onReady];
  scene.load.once('complete',()=>{
    if(scene.textures.exists(PRINTER_ASSET))setupPrinterAnims(scene);
    (G._printerAssetCallbacks||[]).forEach(cb=>{if(cb)cb();});
    G._printerAssetCallbacks=null;
  });
  scene.load.once('loaderror',file=>{
    if(file&&file.key===PRINTER_ASSET)console.warn('Printer sprite failed to load, using procedural fallback.');
  });
  scene.load.spritesheet(PRINTER_ASSET,PRINTER_SHEET,{frameWidth:26,frameHeight:34});
  scene.load.start();
}
function createPrinterSprite(scene,x,y){
  if(!scene.textures.exists(PRINTER_ASSET))return null;
  setupPrinterAnims(scene);
  const sp=scene.add.sprite(x,y+40,PRINTER_ASSET,0).setOrigin(.5,1).setScale(2.45).setDepth(3);
  sp.play('printer_idle');
  return sp;
}
function setPrinterSpriteState(sp,p){
  if(!sp)return;
  let key='printer_idle';
  if(p&&p.broken)key='printer_fail';
  else if(p&&p._ev&&p._ev.id==='run')key='printer_out_filament';
  else if(p&&p._ev)key='printer_fail';
  else if(p&&p.busy&&!p._pau)key='printer_working';
  if(sp.anims&&sp.anims.currentAnim&&sp.anims.currentAnim.key===key)return;
  sp.play(key,true);
}
function drawPlayer(g,light,tired){
  g.clear();
  g.fillStyle(0x000000,.3);g.fillEllipse(0,20,28,8);
  g.fillStyle(0x1a0808);g.fillRect(-11,16,10,5);g.fillRect(1,16,10,5);
  g.fillStyle(tired?0xaa4415:0xdd6820);g.fillRect(-12,-6,24,14);
  g.fillStyle(0xffb347);g.fillRect(-5,-6,10,5);
  g.fillStyle(0x2a1a5a);g.fillRect(-10,6,9,12);g.fillRect(1,6,9,12);
  g.fillStyle(0xe8c090);g.fillRect(-15,-5,5,8);g.fillRect(10,-5,5,8);
  g.fillStyle(0xd4a870);g.fillRect(-17,6,6,5);g.fillRect(11,6,6,5);
  g.fillStyle(0xe8c090);g.fillRect(-9,-22,18,16);
  g.fillStyle(0xd4a870);g.fillRect(-11,-18,3,7);g.fillRect(8,-18,3,7);
  g.fillStyle(0x2a1408);g.fillRect(-10,-24,20,6);
  g.fillStyle(0x1a1020);g.fillRect(-6,-17,3,4);g.fillRect(3,-17,3,4);
  g.lineStyle(1.5,0x5bc8fa,.9);g.strokeRect(-7,-18,5,5);g.strokeRect(2,-18,5,5);g.lineBetween(-2,-16,2,-16);
  g.fillStyle(0xd4a870);g.fillRect(-1,-13,2,3);
  g.fillStyle(tired?0x665544:0xaa6040);g.fillRect(-3,-9,7,2);
  if(light){g.fillStyle(0xddcc88);g.fillRect(13,3,9,5);g.fillStyle(0xffffff,.35);g.fillTriangle(22,2,22,10,40,6);}
}
function drawPrinter(g,busy,broken,prog,col){
  g.clear();
  const bc=broken?0x2a0808:busy?0x0e1a28:0x141228;
  const ec=broken?0xff3333:busy?0x5bc8fa:0x2a2050;
  g.fillStyle(0x070512);g.fillRect(-36,30,16,10);g.fillRect(20,30,16,10);
  g.fillStyle(bc);g.fillRect(-42,-68,84,100);
  g.lineStyle(2,ec);g.strokeRect(-42,-68,84,100);
  g.lineStyle(1,0x0a0810,.5);g.lineBetween(-42,-40,42,-40);
  g.fillStyle(0x0a0810);g.fillRect(-42,-74,84,8);g.lineStyle(1.5,ec);g.strokeRect(-42,-74,84,8);
  g.fillStyle(0x04060a);g.fillRect(-32,-56,46,28);g.lineStyle(1,ec,.5);g.strokeRect(-32,-56,46,28);
  if(busy&&!broken){g.fillStyle(col,.6);g.fillRect(-30,-54,42,10);g.fillStyle(0x000000,.6);g.fillRect(-30,-42,42,12);g.fillStyle(col,.9);g.fillRect(-30,-42,Math.round(42*prog),12);}
  else if(broken){g.fillStyle(0xff3333,.8);g.fillRect(-30,-54,42,10);g.fillStyle(0xff3333,.4);g.fillRect(-30,-42,42,12);}
  const lc=broken?0xff3333:busy?0x4dff91:0x1a1830;
  for(let i=0;i<6;i++){g.fillStyle(lc,broken?1:busy?(i%2?1:.4):.2);g.fillCircle(-30+i*12,-62,4);}
  g.fillStyle(0x1a1830);g.fillRect(-8,-80,16,14);g.lineStyle(1.5,0x5bc8fa,.4);g.strokeRect(-8,-80,16,14);
  g.fillStyle(0xff4d00,.7);g.fillRect(-28,18,56,4);
  g.fillStyle(busy?0x4dff91:broken?0xff3333:0x1a1830);g.fillCircle(34,-12,6);
}
function drawClient(g,cl,idx){
  g.clear();
  g.fillStyle(0x000000,.25);g.fillEllipse(0,20,22,7);
  g.fillStyle(0x1a1020);g.fillRect(-8,14,8,5);g.fillRect(0,14,8,5);
  const pc=[0x222266,0x662222,0x226622,0x664422,0x442266,0x226666,0x662266];
  g.fillStyle(pc[idx%7]);g.fillRect(-8,6,7,10);g.fillRect(1,6,7,10);
  g.fillStyle(cl.c);g.fillRect(-10,-4,20,12);
  g.fillStyle(0xe8c090);g.fillRect(-13,-3,5,8);g.fillRect(8,-3,5,8);
  g.fillStyle(0xe8c090);g.fillRect(-7,-18,14,14);
  g.fillStyle(0xd4a870);g.fillRect(-9,-14,3,5);g.fillRect(6,-14,3,5);
  const hc=[0x1a0808,0x2a1a00,0x3a0808,0x0a0a1a,0xddaa44,0x1a1a1a,0xaa6644];
  g.fillStyle(hc[idx%7]);g.fillRect(-8,-22,16,6);
  g.fillStyle(0x1a1020);g.fillRect(-4,-14,3,3);g.fillRect(1,-14,3,3);
  g.fillStyle(0xaa6040);g.fillRect(-3,-9,6,2);
}
function drawBG(g,W,H,night){
  g.clear();
  if(night){
    g.fillStyle(0x060410);g.fillRect(0,0,W,H);
    g.fillStyle(0x08071a);g.fillRect(0,H*.58,W,H*.42);
    g.fillStyle(0x09081a);g.fillRect(0,32,W,H*.54);
    g.fillStyle(0x100e20);g.fillRect(0,H*.58,W,4);
    g.fillStyle(0x070818);g.fillRect(W*.06,H*.08,90,60);
    for(let i=0;i<20;i++){g.fillStyle(0xffffff,Math.random()*.8+.1);g.fillCircle(W*.06+4+Math.random()*82,H*.08+4+Math.random()*52,Math.random()>.7?2:1);}
    g.lineStyle(2,0x1a1828);g.strokeRect(W*.06,H*.08,90,60);
  } else {
    g.fillStyle(0x0a0818);g.fillRect(0,0,W,32);
    for(let x=100;x<W;x+=130){g.fillStyle(0xffeecc,.07);g.fillTriangle(x,32,x-40,H*.6,x+40,H*.6);g.fillStyle(0x2a2040);g.fillRect(x-25,28,50,6);g.fillStyle(0xffeedd,.9);g.fillRect(x-22,32,44,4);}
    g.fillStyle(0x100e1e);g.fillRect(0,32,W,H*.54);
    g.fillStyle(0x1e1a30);g.fillRect(0,H*.58,W,4);
    g.fillStyle(0x12101e);g.fillRect(0,H*.58,W,H*.42);
    g.fillStyle(0x1e1830);g.fillRect(W*.12,H*.08,70,50);
    g.fillStyle(0xff4d00,.7);g.fillRect(W*.12+4,H*.08+4,62,8);
    g.fillStyle(0x5bc8fa,.5);g.fillRect(W*.12+4,H*.08+14,62,28);
  }
}

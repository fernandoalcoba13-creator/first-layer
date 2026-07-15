// ═══ DRAW HELPERS ═══
// Procedural drawing functions used during prototype phase.
// Will be progressively retired as Mati delivers sprite assets.
const PRINTER_ASSET='maquina3d';
const PRINTER_SHEET='assets/printers/maquina3d_lvl1.png';
const PRINTER_WORKING_ASSET='maquina3d_working';
const PRINTER_WORKING_SHEET='assets/printers/maquina3d_lvl1_working.png';
const PRINTER_SHEET_DATA='data:image/png;base64,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';
const PRINTER_BROKEN_ASSET='maquina3d_broken';
const PRINTER_FILAMENT_ASSET='maquina3d_filament';
const PLAYER_DOWN='player_walk_s';
const PLAYER_LEFT='player_walk_a';
const PLAYER_RIGHT='player_walk_d';
const PLAYER_UP='player_walk_w';
const ENV_BG_ASSET='env_fondo';
const ENV_BG_PATH='assets/environment/fondo.png';
const DAY_ROOM_W=413;
const DAY_ROOM_H=270;
const DAY_ROOM_LAYERS=[
  {key:'day_room_floor',src:'assets/environment/day/day-floor.png',depth:-30},
  {key:'day_room_props',src:'assets/environment/day/day-props.png',depth:1},
  {key:'day_room_counter',src:'assets/environment/day/day-counter.png',depth:'counter'},
  {key:'day_room_grass',src:'assets/environment/day/day-grass.png',depth:9000},
  {key:'day_room_glass',src:'assets/environment/day/day-glass.png',depth:9100},
  {key:'day_room_lights',src:'assets/environment/day/day-lights.png',depth:9200}
];
const ENV_PROP_ASSETS=[
  ['prop_toolbox','assets/environment/props/toolbox.png'],
  ['prop_box_1','assets/environment/props/box_1.png'],
  ['prop_box_2','assets/environment/props/box_2.png'],
  ['prop_box_3','assets/environment/props/box_3.png'],
  ['prop_box_4','assets/environment/props/box_4.png'],
  ['prop_electricity','assets/environment/props/electricity.png'],
  ['prop_poster_idea','assets/environment/props/poster_idea.png'],
  ['prop_filament_yellow','assets/environment/props/filament_yellow.png'],
  ['prop_filament_blue','assets/environment/props/filament_blue.png'],
  ['prop_filament_cyan','assets/environment/props/filament_cyan.png'],
  ['prop_filament_orange','assets/environment/props/filament_orange.png'],
  ['prop_filament_red','assets/environment/props/filament_red.png'],
  ['prop_filament_pink','assets/environment/props/filament_pink.png'],
  ['prop_filament_green','assets/environment/props/filament_green.png'],
  ['prop_filament_violet','assets/environment/props/filament_violet.png'],
  ['prop_workbench_1','assets/environment/props/workbench_1.png'],
  ['prop_workbench_2','assets/environment/props/workbench_2.png'],
  ['prop_shelf_1','assets/environment/props/shelf_1.png'],
  ['prop_shelf_2','assets/environment/props/shelf_2.png'],
  ['prop_shelf_3','assets/environment/props/shelf_3.png'],
  ['prop_shelf_4','assets/environment/props/shelf_4.png'],
  ['prop_shelf_4_1','assets/environment/props/shelf_4_1.png'],
  ['prop_shelf_4_2','assets/environment/props/shelf_4_2.png'],
  ['prop_shelf_5','assets/environment/props/shelf_5.png'],
  ['prop_shelf_6','assets/environment/props/shelf_6.png'],
  ['prop_shelf_7','assets/environment/props/shelf_7.png'],
  ['prop_shelf_8','assets/environment/props/shelf_8.png']
];
const CLIENT_ASSETS=[
  {key:'client_personaje1',src:'assets/characters/clients/personaje1.png'},
  {key:'client_personaje2',src:'assets/characters/clients/personaje2.png'},
  {key:'client_personaje4',src:'assets/characters/clients/personaje4.png'},
  {key:'client_personaje3',src:'assets/characters/clients/personaje3.png'},
  {key:'client_personaje5',src:'assets/characters/clients/personaje5.png'}
];
const CLIENT_SPRITE_MAP={
  marcos:'client_personaje1',sofi:'client_personaje2',diego:'client_personaje4',
  valeria:'client_personaje3',nico:'client_personaje5',laura:'client_personaje2',
  juli:'client_personaje3',tomas:'client_personaje1',ramiro:'client_personaje4',
  pablo:'client_personaje1',meli:'client_personaje2',caro:'client_personaje3'
};
const CLIENT_SPRITE_SCALE=2;
function addSheetFromImage(scene,key,src,fw,fh,cb){
  if(scene.textures.exists(key)){if(cb)cb();return;}
  const img=new Image();
  img.onload=()=>{if(!scene.textures.exists(key)){scene.textures.addSpriteSheet(key,img,{frameWidth:fw,frameHeight:fh});scene.textures.get(key)._flFrames=Math.max(1,Math.floor(img.width/fw)*Math.floor(img.height/fh));}if(cb)cb();};
  img.onerror=()=>{console.warn('Sprite failed to load: '+key);if(cb)cb();};
  img.src=src;
}
function addImageFromImage(scene,key,src,cb){
  if(scene.textures.exists(key)){if(cb)cb();return;}
  const img=new Image();
  img.onload=()=>{if(!scene.textures.exists(key))scene.textures.addImage(key,img);if(cb)cb();};
  img.onerror=()=>{console.warn('Image failed to load: '+key);if(cb)cb();};
  img.src=src;
}
function loadEnvironmentPropsAsync(scene,onReady){
  const items=ENV_PROP_ASSETS.filter(a=>!scene.textures.exists(a[0]));
  if(!items.length){if(onReady)onReady();return;}
  let left=items.length;
  const done=()=>{left--;if(left<=0&&onReady)onReady();};
  items.forEach(a=>addImageFromImage(scene,a[0],a[1],done));
}
function loadDayRoomLayersAsync(scene,onReady){
  const items=DAY_ROOM_LAYERS.filter(a=>!scene.textures.exists(a.key));
  if(!items.length){if(onReady)onReady();return;}
  let left=items.length;
  const done=()=>{left--;if(left<=0&&onReady)onReady();};
  items.forEach(a=>addImageFromImage(scene,a.key,a.src,done));
}
function applyDayRoomLayers(scene,g,W,H){
  const add=()=>{
    if(scene.dayRoomLayers||!scene.textures.exists('day_room_floor'))return;
    if(g)g.setVisible(false);
    const scale=Math.min(W/DAY_ROOM_W,H/DAY_ROOM_H);
    const ox=Math.round((W-DAY_ROOM_W*scale)/2),oy=18;
    scene.roomLayout={scale,ox,oy,w:DAY_ROOM_W,h:DAY_ROOM_H};
    scene.dayRoomLayers=DAY_ROOM_LAYERS.map(layer=>{
      if(!scene.textures.exists(layer.key))return null;
      const depth=layer.depth==='counter'?oy+174*scale:layer.depth;
      return scene.add.image(ox,oy,layer.key).setOrigin(0,0).setScale(scale).setDepth(depth);
    }).filter(Boolean);
  };
  loadDayRoomLayersAsync(scene,add);
}
function addEnvSprite(scene,key,x,y,scale,depth){
  if(!scene.textures.exists(key))return null;
  return scene.add.image(x,y,key).setOrigin(.5,1).setScale(scale||3).setDepth(depth||2);
}
function addRoomWindowMood(scene,night){
  if(!scene.room)return null;
  const r=scene.room(),g=scene.add.graphics().setDepth(-19);
  const x=r.ox+153*r.s,y=r.oy+22*r.s,w=109*r.s,h=19*r.s;
  g.fillStyle(night?0x080a1d:0x63d6e7,1).fillRoundedRect(x,y,w,h,2*r.s);
  g.lineStyle(Math.max(1,r.s),0x18202e,.75).strokeRoundedRect(x,y,w,h,2*r.s);
  if(night){
    g.fillStyle(0xffffff,.75);
    [[18,6],[35,12],[73,5],[94,13]].forEach(p=>g.fillCircle(x+p[0]*r.s,y+p[1]*r.s,Math.max(1,r.s*.55)));
  }else{
    g.fillStyle(0xe8ffff,.88);
    [[24,11,18,3],[50,8,23,3],[82,12,29,4]].forEach(p=>g.fillEllipse(x+p[0]*r.s,y+p[1]*r.s,p[2]*r.s,p[3]*r.s));
  }
  return g;
}
function setupPrinterAnims(scene){
  if(!scene.textures.exists(PRINTER_ASSET)||scene.anims.exists('printer_idle'))return;
  const fr=n=>({key:PRINTER_ASSET,frame:n});
  const wk=n=>({key:scene.textures.exists(PRINTER_WORKING_ASSET)?PRINTER_WORKING_ASSET:PRINTER_ASSET,frame:n});
  const fail=n=>({key:scene.textures.exists(PRINTER_BROKEN_ASSET)?PRINTER_BROKEN_ASSET:PRINTER_ASSET,frame:n});
  const out=n=>({key:scene.textures.exists(PRINTER_FILAMENT_ASSET)?PRINTER_FILAMENT_ASSET:PRINTER_ASSET,frame:n});
  scene.anims.create({key:'printer_idle',frames:[fr(0)],frameRate:1,repeat:-1});
  scene.anims.create({key:'printer_working',frames:[0,1,2,3,4,5].map(wk),frameRate:8,repeat:-1});
  scene.anims.create({key:'printer_fail',frames:[8,9,10,11,12,13,14,15,16,17,18,19,20].map(fail),frameRate:7,repeat:-1});
  scene.anims.create({key:'printer_out_filament',frames:[8,9,10,11,12,13,14,15,16,17,18,19,20].map(out),frameRate:7,repeat:-1});
}
function loadPrinterAssetsAsync(scene,onReady){
  if(scene.textures.exists(PRINTER_ASSET)){setupPrinterAnims(scene);if(onReady)onReady();return;}
  if(G._printerAssetCallbacks){G._printerAssetCallbacks.push(onReady);return;}
  G._printerAssetCallbacks=[onReady];
  const img=new Image();
  img.onload=()=>{
    if(!scene.textures.exists(PRINTER_ASSET)){
      scene.textures.addSpriteSheet(PRINTER_ASSET,img,{frameWidth:26,frameHeight:34});
    }
    let left=3;
    const done=()=>{left--;if(left<=0){setupPrinterAnims(scene);(G._printerAssetCallbacks||[]).forEach(cb=>{if(cb)cb();});G._printerAssetCallbacks=null;}};
    addSheetFromImage(scene,PRINTER_WORKING_ASSET,PRINTER_WORKING_SHEET,26,34,done);
    addSheetFromImage(scene,PRINTER_BROKEN_ASSET,'assets/printers/BROKENMACHINE.png',26,34,done);
    addSheetFromImage(scene,PRINTER_FILAMENT_ASSET,'assets/printers/MACHINEFILAMENT.png',26,34,done);
  };
  img.onerror=()=>console.warn('Printer sprite failed to load, using procedural fallback.');
  img.src=PRINTER_SHEET;
}
function setupPlayerAnims(scene){
  if(!scene.textures.exists(PLAYER_DOWN)||scene.anims.exists('player_walk_down'))return;
  scene.anims.create({key:'player_walk_down',frames:scene.anims.generateFrameNumbers(PLAYER_DOWN,{start:0,end:9}),frameRate:8,repeat:-1});
  scene.anims.create({key:'player_walk_left',frames:scene.anims.generateFrameNumbers(PLAYER_LEFT,{start:0,end:9}),frameRate:8,repeat:-1});
  scene.anims.create({key:'player_walk_right',frames:scene.anims.generateFrameNumbers(PLAYER_RIGHT,{start:0,end:9}),frameRate:8,repeat:-1});
  scene.anims.create({key:'player_walk_up',frames:scene.anims.generateFrameNumbers(PLAYER_UP,{start:0,end:9}),frameRate:8,repeat:-1});
}
function loadPlayerAssetsAsync(scene,onReady){
  if(scene.textures.exists(PLAYER_DOWN)){setupPlayerAnims(scene);if(onReady)onReady();return;}
  let left=4;
  const done=()=>{left--;if(left<=0){setupPlayerAnims(scene);if(onReady)onReady();}};
  addSheetFromImage(scene,PLAYER_DOWN,'assets/characters/player/walkS.png',50,50,done);
  addSheetFromImage(scene,PLAYER_LEFT,'assets/characters/player/walkA.png',50,50,done);
  addSheetFromImage(scene,PLAYER_RIGHT,'assets/characters/player/walkD.png',50,50,done);
  addSheetFromImage(scene,PLAYER_UP,'assets/characters/player/walkw.png',50,50,done);
}
function createPlayerSprite(scene,parent,night){
  if(!scene.textures.exists(PLAYER_DOWN))return null;
  setupPlayerAnims(scene);
  const sp=scene.add.sprite(0,24,PLAYER_DOWN,0).setOrigin(.5,1).setScale(2.1).setDepth(6);
  parent.add(sp);return sp;
}
function setPlayerSpriteState(sp,vx,vy,lastDir){
  if(!sp)return lastDir||'down';
  let dir=lastDir||'down';
  if(Math.abs(vx)>Math.abs(vy)&&vx<0)dir='left';
  else if(Math.abs(vx)>Math.abs(vy)&&vx>0)dir='right';
  else if(vy<0)dir='up';
  else if(vy>0)dir='down';
  const moving=!!(vx||vy),key='player_walk_'+dir;
  const idleTex={down:PLAYER_DOWN,left:PLAYER_LEFT,right:PLAYER_RIGHT,up:PLAYER_UP}[dir]||PLAYER_DOWN;
  if(!moving){
    if(sp.anims)sp.anims.stop();
    if(sp.texture.key!==idleTex||sp.frame.name!==0)sp.setTexture(idleTex,0);
    return dir;
  }
  if(sp.anims&&(!sp.anims.currentAnim||sp.anims.currentAnim.key!==key))sp.play(key,true);
  else if(sp.anims)sp.anims.resume();
  return dir;
}
function loadClientAssetsAsync(scene,onReady){
  const items=CLIENT_ASSETS.filter(a=>!scene.textures.exists(a.key));
  if(!items.length){setupClientAnims(scene);if(onReady)onReady();return;}
  let left=items.length;
  const done=()=>{left--;if(left<=0){setupClientAnims(scene);if(onReady)onReady();}};
  items.forEach(a=>addSheetFromImage(scene,a.key,a.src,25,40,done));
}
function setupClientAnims(scene){
  CLIENT_ASSETS.forEach(a=>{
    if(!scene.textures.exists(a.key))return;
    const tex=scene.textures.get(a.key),frames=tex._flFrames||1,key=a.key+'_walk';
    if(frames>1&&!scene.anims.exists(key)){
      scene.anims.create({key,frames:scene.anims.generateFrameNumbers(a.key,{start:0,end:frames-1}),frameRate:8,repeat:-1});
    }
  });
}
function createClientSprite(scene,cl,idx){
  const asset=CLIENT_ASSETS[idx%CLIENT_ASSETS.length];
  const key=CLIENT_SPRITE_MAP[cl.id]||(asset&&asset.key);
  if(!key||!scene.textures.exists(key))return null;
  setupClientAnims(scene);
  const sp=scene.add.sprite(0,24,key,0).setOrigin(.5,1).setScale(CLIENT_SPRITE_SCALE);
  const anim=key+'_walk';
  if(scene.anims.exists(anim))sp.play(anim);
  return sp;
}
function createPrinterSprite(scene,x,y){
  if(!scene.textures.exists(PRINTER_ASSET))return null;
  setupPrinterAnims(scene);
  const sp=scene.add.sprite(x,y,PRINTER_ASSET,0).setOrigin(.5,1).setScale(3).setDepth(3);
  return sp;
}
function setPrinterSpriteState(sp,p){
  if(!sp)return;
  sp.clearTint();
  let key=null;
  if(p&&p._ev&&p._ev.id==='run')key='printer_out_filament';
  else if(p&&p._ev)key='printer_fail';
  else if(p&&p.busy&&!p._pau)key='printer_working';
  else if(p&&p.broken)key='printer_fail';
  if(key==='printer_fail')sp.setTint(0xff6b6b);
  if(key==='printer_out_filament')sp.setTint(0xffd166);
  if(!key){if(sp.anims)sp.anims.stop();sp.setTexture(PRINTER_ASSET,0);return;}
  if(sp.anims&&sp.anims.currentAnim&&sp.anims.currentAnim.key===key&&sp.anims.isPlaying)return;
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
function applyRoomBackground(scene,g,W,H,night){
  const add=()=>{
    if(!scene.textures.exists(ENV_BG_ASSET))return;
    if(g)g.setVisible(false);
    const tex=scene.textures.get(ENV_BG_ASSET).getSourceImage();
    const scale=Math.min(W/tex.width,H/tex.height);
    const ox=(W-tex.width*scale)/2;
    const oy=8;
    scene.roomLayout={scale,ox,oy,w:tex.width,h:tex.height};
    const bg=scene.add.image(Math.round(ox+tex.width*scale/2),oy,ENV_BG_ASSET).setOrigin(.5,0).setScale(scale).setDepth(-20);
    if(night)bg.setTint(0x5f638a).setAlpha(.55);
    return bg;
  };
  if(scene.textures.exists(ENV_BG_ASSET))return add();
  const img=new Image();
  img.onload=()=>{if(!scene.textures.exists(ENV_BG_ASSET))scene.textures.addImage(ENV_BG_ASSET,img);add();};
  img.onerror=()=>console.warn('Environment background failed to load: '+ENV_BG_PATH);
  img.src=ENV_BG_PATH;
  return null;
}

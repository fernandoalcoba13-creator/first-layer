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
const NIGHT_ROOM_W=420;
const NIGHT_ROOM_H=270;
const NIGHT_ROOM_LAYERS=[
  {key:'night_room_floor_v2',src:'assets/environment/workshop-v2/floor.png',depth:-30},
  {key:'night_room_objects_v2',src:'assets/environment/workshop-v2/objects.png',depth:1},
  {key:'night_room_lights_v2',src:'assets/environment/workshop-v2/lights-on.png',depth:9200},
  {key:'night_room_lights_off_v2',src:'assets/environment/workshop-v2/lights-off.png',depth:9190,hidden:true}
];
const NIGHT_ROOM_OBJECT_VARIANTS=[
  {key:'night_room_objects_v2',src:'assets/environment/workshop-v2/objects.png'},
  {key:'night_room_objects_p1_v2',src:'assets/environment/workshop-v2/objects-p1.png'},
  {key:'night_room_objects_p2_v2',src:'assets/environment/workshop-v2/objects-p2.png'},
  {key:'night_room_objects_p3_v2',src:'assets/environment/workshop-v2/objects-p3.png'}
];
function workshopLayout(W,H,roomW,roomH,top){
  const panel=document.getElementById('proPanel');
  const panelVisible=panel&&getComputedStyle(panel).display!=='none';
  const safeLeft=panelVisible?Math.ceil(panel.getBoundingClientRect().right+10):0;
  const availableW=Math.max(1,W-safeLeft);
  const scale=Math.min(availableW/roomW,H/roomH);
  return {s:scale,scale,ox:safeLeft+(availableW-roomW*scale)/2,oy:top,w:roomW,h:roomH};
}
const DAY_WALK_MASK_PATH='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAaQAAAEOCAYAAADGy2O9AAAAAXNSR0IArs4c6QAABQtJREFUeJzt3UFy4jAAAEF5K///svfKZSuBDWgkdd8pVIF4kC1b1xjjHgAw2Z/ZAwCAIUgAVAgSAAmCBECCIAGQIEgAJAgSAAmCBECCIAGQIEgAJAgSAAmCBECCIAGQIEgAJAgSAAmCBECCIAGQIEgAJAgSAAmCBECCIAGQIEgAJAgSAAmCBECCIAGQIEgAJAgSAAmCBECCIAGQIEgAJAgSAAmCBECCIAGQIEgAJAgSAAmCBECCIAGQIEgAJAgSAAmCBECCIAGQIEgAJAgSAAmCBECCIAGQIEgAJAgSAAmCBECCIAGQIEgAJAgSAAmCBECCIAGQIEgAJAgSAAmCBECCIAGQIEgAJAgSAAmCBECCIAGQIEgAJAgSAAmCBECCIAGQIEgAJAgSAAmCBECCIAGQIEgAJAgSAAmCBECCIAGQIEgAJAgSAAmCBECCIAGQIEgAJAgSAAmCBECCIAGQIEgAJAgSAAmCBECCIAGQIEgAJAgSAAmCBECCIAGQIEgAJAgSAAmCBECCIAGQIEgAJAgSAAmCBEDC17MvuO/7PSPZyHVds4cAsBwzJAASBAmABEECIEGQAEgQJAASBAmABEECIEGQAEgQJAASBAmABEECIEGQAEh4OkgeHPo9D6AFeN41xnjr0dPBGeA8r0xent5+4lmPgxInAP7l7UF69OrpPiED2N8SixpctwLY3xJBAmB/ggRAgiABkCBIACQIEgAJggRAgiABkCBIACQIEgAJggRAwjJB8vgggL0tEyQA1vDqBOKjT/sGYL7qGSczJICDVGM0BAmACkECIEGQAEgQJAASBAmABEECIEGQAEgQJAASBAmABEECIEGQAEgQJAASBAmABEECIEGQAEiwQR9Zn9i35b7vt78H8DNmSCR9ahOx8mZlcBpBAiBBkABIECQAEgQJgARBAiBBkABIcB8S01hyDTwSJKYoxag0lle4uZddOGXHx60egBp/T3YhSAAkCBIACYIEQIIgwQZcR2IHVtnBJv4nSlbqUWCGBJhhkSBIwBiiRIAgAZAgSAAkCBIACYIEQIIgAZAgSAAkCBIACYIEQIIgAZAgSAAkCBIACYIEjOGJ30eoP6/Q9hMAC6jH5DeYIQHEnRCjIUgAVCwVpFN+JQCcaLlrSKtFyYVigJ9Zaoa0otUCCjCLIAGQIEgAJAgSAAmCBECCIAGQIEh8nKXwPT4TCgSJKRwAO3wWVCx3Yyz7cCAEHpkhAZAgSAAkCBIACYIEQIIgAZAgSAAkCNIH2IIC4HvXGMPNIItyHw/s76QftGZICzvpiwonOu1/XJAASBAkABIECYAEQQIgQZAASBAkgKDTVtgNQQLoOTFGQ5AAqBAkABIECYAEQQIgQZAAQk5d0DDGGF+zBwDwW04+mO9AkIDlCdEenLIDIEGQgKWZHe1DkABIECQAEgQJgARBAiBBkABIECQAEgQJgARBAiBBkABIECQAEgQJgARBAiBBkABIECQAEgQJgARBAiBBkABIECQAEgQJgARBAiBBkABIECQAEgQJgARBAiBBkABIECQAEgQJgARBAiBBkABIEKTFXdc1ewgwje//Xq4xxj17EABghgRAgiABkCBIACQIEgAJggRAgiABkCBIACQIEgAJggRAgiABkPAXKHI2d/E3Y2oAAAAASUVORK5CYII=';
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
    const mounted=scene.dayRoomLayers&&scene.dayRoomLayers.some(layer=>layer&&layer.active);
    if(mounted||!scene.textures.exists('day_room_floor'))return;
    scene.dayRoomLayers=null;
    if(g)g.setVisible(false);
    const layout=workshopLayout(W,H,DAY_ROOM_W,DAY_ROOM_H,18);
    const scale=layout.scale,ox=Math.round(layout.ox),oy=layout.oy;
    scene.roomLayout={scale,ox,oy,w:DAY_ROOM_W,h:DAY_ROOM_H};
    scene.dayRoomLayers=DAY_ROOM_LAYERS.map(layer=>{
      if(!scene.textures.exists(layer.key))return null;
      const depth=layer.depth==='counter'?oy+174*scale:layer.depth;
      const image=scene.add.image(ox,oy,layer.key).setOrigin(0,0).setScale(scale).setDepth(depth);
      if(layer.hidden)image.setVisible(false);
      return image;
    }).filter(Boolean);
  };
  loadDayRoomLayersAsync(scene,add);
}
function loadNightRoomLayersAsync(scene,onReady){
  const assets=NIGHT_ROOM_LAYERS.concat(NIGHT_ROOM_OBJECT_VARIANTS.slice(1));
  const items=assets.filter(a=>!scene.textures.exists(a.key));
  if(!items.length){if(onReady)onReady();return;}
  let left=items.length;
  const done=()=>{left--;if(left<=0&&onReady)onReady();};
  items.forEach(a=>addImageFromImage(scene,a.key,a.src,done));
}
function applyNightRoomLayers(scene,g,W,H){
  const add=()=>{
    const mounted=scene.nightRoomLayers&&scene.nightRoomLayers.some(layer=>layer&&layer.active);
    if(mounted||!scene.textures.exists('night_room_floor_v2'))return;
    scene.nightRoomLayers=null;
    if(g)g.setVisible(false);
    const layout=workshopLayout(W,H,NIGHT_ROOM_W,NIGHT_ROOM_H,8);
    const scale=layout.scale,ox=Math.round(layout.ox),oy=layout.oy;
    scene.roomLayout={scale,ox,oy,w:NIGHT_ROOM_W,h:NIGHT_ROOM_H};
    // Use pre-cleaned PNGs instead of copying a local image into a canvas. Chrome
    // blocks that canvas upload under file:// and used to leave the night black.
    const unlockedCount=Math.max(
      (G.printers||[]).filter(p=>!p.locked).length,
      Math.min(3,G.pCount)
    );
    const objectsKey=NIGHT_ROOM_OBJECT_VARIANTS[Math.min(3,unlockedCount)].key;
    scene.nightRoomLayers=NIGHT_ROOM_LAYERS.map(layer=>{
      if(!scene.textures.exists(layer.key))return null;
      const textureKey=layer.key==='night_room_objects_v2'?objectsKey:layer.key;
      const image=scene.add.image(ox,oy,textureKey).setOrigin(0,0).setScale(scale).setDepth(layer.depth);
      if(layer.hidden)image.setVisible(false);
      if(layer.key==='night_room_floor_v2'||layer.key==='night_room_objects_v2')image.setTint(0x747b9e).setAlpha(.82);
      else image.setTint(0x9ba5c9).setAlpha(.72);
      return image;
    }).filter(Boolean);
  };
  loadNightRoomLayersAsync(scene,add);
}
function loadDayWalkMask(scene,onReady){
  if(scene.dayWalkMask){if(onReady)onReady();return;}
  const img=new Image();
  img.onload=()=>{
    try{
      const canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
      scene.dayWalkMask={w:img.width,h:img.height,data:ctx.getImageData(0,0,img.width,img.height).data};
    }catch(error){console.warn('Walk mask could not be read.',error);}
    if(onReady)onReady();
  };
  img.onerror=()=>{console.warn('Walk mask failed to load.');if(onReady)onReady();};
  img.src=DAY_WALK_MASK_PATH;
}
function dayWalkMaskAllows(scene,x,y){
  const mask=scene.dayWalkMask;if(!mask)return null;
  const room=scene.room(),lx=Math.round((x-room.ox)/room.s),ly=Math.round((y-room.oy)/room.s);
  if(lx<0||ly<0||lx>=mask.w||ly>=mask.h)return false;
  const i=(ly*mask.w+lx)*4;
  return mask.data[i]>200&&mask.data[i+1]>200&&mask.data[i+2]>200;
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
// ═══ ACCIONES DEL PERSONAJE (tomar algo / reparar) ═══
// El personaje de Mati sólo tiene ciclos de caminata, así que la acción se arma por código:
// se le suma el objeto (taza o llave) al contenedor del jugador y se anima con tweens.
// Si algún día llegan frames dibujados, alcanza con reemplazar esto.
function drawMug(g,hot){
  g.clear();
  const body=hot?0x3a2a18:0x2e2438;
  g.fillStyle(0x111018,1).fillRect(-5,-7,11,12);            // contorno
  g.fillStyle(body,1).fillRect(-4,-6,9,10);                 // cuerpo
  g.fillStyle(hot?0x6b4a1c:0x4a3a5e,1).fillRect(-4,-6,9,2); // borde superior
  g.fillStyle(0x8a5a2a,1).fillRect(-3,-4,7,3);              // bebida
  g.fillStyle(0x111018,1).fillRect(5,-4,3,2).fillRect(7,-4,2,6).fillRect(5,1,3,2); // asa
}
function drawWrench(g){
  g.clear();
  g.fillStyle(0x111018,1).fillRect(-2,-11,5,20);            // contorno mango
  g.fillStyle(0xb8c0d8,1).fillRect(-1,-10,3,18);            // mango
  g.fillStyle(0xe8eefc,1).fillRect(-1,-10,1,18);            // brillo
  g.fillStyle(0x111018,1).fillRect(-5,-14,11,5);            // contorno boca
  g.fillStyle(0xb8c0d8,1).fillRect(-4,-13,9,3);             // boca
  g.fillStyle(0x0b0a12,1).fillRect(-2,-13,3,2);             // hueco de la boca
}
// Lanza la acción sobre el jugador de la escena. kind: 'drink' | 'repair'
function playerActionFacing(scene,kind){
  const previous=scene.pDir||'down';
  if(kind==='drink')return {dir:'down',side:previous==='left'?-1:1,restore:previous};
  let side=previous==='left'?-1:1,best=Infinity;
  (scene.pObjs||[]).forEach(po=>{
    if(!po||typeof po.px!=='number')return;
    const d=Math.abs(po.px-scene.player.x);
    if(d<best){best=d;side=po.px<scene.player.x?-1:1;}
  });
  const dir=side<0?'left':'right';
  return {dir,side,restore:dir};
}
function setPlayerActionIdle(scene,dir){
  if(scene.pSp){
    if(scene.pSp.anims)scene.pSp.anims.stop();
    const tex={down:PLAYER_DOWN,left:PLAYER_LEFT,right:PLAYER_RIGHT,up:PLAYER_UP}[dir]||PLAYER_DOWN;
    scene.pSp.setTexture(tex,0);
  }else if(scene.player){
    scene.player.scaleX=dir==='left'?-1:1;
  }
}
function playerActionAnchors(scene,side){
  const sp=scene.pSp&&scene.pSp.visible?scene.pSp:null;
  if(!sp)return {handX:side*10,handY:-18,mouthX:side*6,mouthY:-46,toolY:-23};
  const sx=Math.abs(sp.scaleX||1),sy=Math.abs(sp.scaleY||1);
  // Los frames del jugador son de 50 px. La mano estÃ¡ cerca de y=31 y la boca
  // cerca de y=17; convertir esos puntos a coordenadas del container evita que
  // los props queden en el pecho al cambiar la escala de la escena.
  return {
    handX:side*5.5*sx,
    handY:sp.y-(50-31)*sy,
    mouthX:side*2.5*sx,
    mouthY:sp.y-(50-17)*sy,
    toolY:sp.y-(50-29)*sy
  };
}
function playPlayerAction(scene,kind){
  if(!scene||!scene.player||!scene.add)return null;
  const cont=scene.player,body=scene.pSp||scene.pGr;
  if(scene._actBusy)return null;                            // no encimar dos acciones
  scene._actBusy=true;
  const facing=playerActionFacing(scene,kind),dir=facing.side;
  const anchor=playerActionAnchors(scene,dir);
  scene.pDir=facing.dir;
  setPlayerActionIdle(scene,facing.dir);
  const prop=scene.add.graphics(),hand=scene.add.graphics();
  hand.fillStyle(0xe8c090,1).fillRect(-3,-3,6,6);
  cont.add([hand,prop]);
  const base={x:body?body.x:0,y:body?body.y:0,angle:body?body.angle:0,
    scaleX:body?body.scaleX:1,scaleY:body?body.scaleY:1};
  const particles=[];
  let ended=false;
  const finish=()=>{
    if(ended)return;                                        // idempotente: puede llegar por tween o por red de seguridad
    ended=true;
    scene._actBusy=false;
    // Matar los tweens antes de resetear: si no, uno a medio camino vuelve a torcer al personaje.
    if(scene.tweens){if(body)scene.tweens.killTweensOf(body);scene.tweens.killTweensOf(prop);scene.tweens.killTweensOf(hand);}
    if(prop&&prop.destroy)prop.destroy();
    if(hand&&hand.destroy)hand.destroy();
    particles.forEach(p=>{if(p&&p.active)p.destroy();});
    if(body){body.setPosition(base.x,base.y).setAngle(base.angle).setScale(base.scaleX,base.scaleY).setAlpha(1);}
    scene.pDir=facing.restore;
    setPlayerActionIdle(scene,facing.restore);
  };
  // Red de seguridad: si la cadena de tweens se corta (cambio de escena, pausa, lo que sea),
  // igual se limpia el objeto y se libera la acción. Si no, no volvería a dispararse nunca.
  scene.time.delayedCall(kind==='drink'?1700:1900,finish);
  if(scene.events)scene.events.once('shutdown',finish);

  if(kind==='drink'){
    drawMug(prop,true);
    const cupStartX=anchor.handX+dir*5,cupStartY=anchor.handY+4;
    const cupMouthX=anchor.mouthX,cupMouthY=anchor.mouthY+9;
    prop.setPosition(cupStartX,cupStartY).setScale(1.45);
    hand.setPosition(anchor.handX,anchor.handY+5);
    // la taza sube a la cara, se queda un toque y baja
    scene.tweens.add({targets:prop,x:cupMouthX,y:cupMouthY,duration:280,ease:'Sine.easeOut'});
    scene.tweens.add({targets:hand,x:cupMouthX+dir*7,y:cupMouthY+7,duration:280,ease:'Sine.easeOut',
      onComplete:()=>{
        if(body)scene.tweens.add({targets:body,y:base.y+2,angle:dir*-3,duration:120,yoyo:true,repeat:2,hold:90});
        scene.tweens.add({targets:prop,angle:dir*-30,duration:130,yoyo:true,repeat:2,hold:100,
          onComplete:()=>{
            scene.tweens.add({targets:prop,x:cupStartX,y:cupStartY,alpha:0,duration:220,onComplete:finish});
            scene.tweens.add({targets:hand,x:anchor.handX,y:anchor.handY+5,alpha:0,duration:220});
          }});
      }});
    // vapor
    for(let i=0;i<6;i++){
      scene.time.delayedCall(170+i*145,()=>{
        if(!cont.active)return;
        const s=scene.add.circle(cont.x+cupMouthX+Phaser.Math.Between(-2,2),cont.y+anchor.mouthY-3,Phaser.Math.Between(1,2),0xffffff,.65).setDepth(cont.depth+1);
        particles.push(s);
        scene.tweens.add({targets:s,x:s.x+Phaser.Math.Between(-5,5),y:s.y-20,alpha:0,duration:620,onComplete:()=>s.destroy()});
      });
    }
    return prop;
  }

  // reparar: la llave gira de un lado al otro y saltan chispas
  drawWrench(prop);
  prop.setPosition(dir*17,anchor.toolY).setScale(1.35).setAngle(dir*-30);
  hand.setPosition(anchor.handX,anchor.handY);
  scene.tweens.add({targets:prop,angle:dir*28,duration:150,yoyo:true,repeat:4,ease:'Sine.easeInOut',
    onComplete:()=>scene.tweens.add({targets:prop,alpha:0,duration:180,onComplete:finish})});
  // El bamboleo va por ángulo: la Y del sprite la reescribe el rebote de caminar en cada frame.
  scene.tweens.add({targets:hand,x:dir*14,y:anchor.toolY,duration:150,yoyo:true,repeat:4,ease:'Sine.easeInOut'});
  if(body)scene.tweens.add({targets:body,x:base.x+dir*2,angle:dir*2,duration:150,yoyo:true,repeat:4,ease:'Sine.easeInOut'});
  for(let i=0;i<8;i++){
    scene.time.delayedCall(100+i*105,()=>{
      if(!cont.active)return;
      const sp=scene.add.rectangle(cont.x+dir*20+Phaser.Math.Between(-4,4),cont.y-20+Phaser.Math.Between(-4,4),3,3,i%2?0xffb347:0x5bc8fa,.95).setDepth(cont.depth+1);
      particles.push(sp);
      scene.tweens.add({targets:sp,x:sp.x+dir*Phaser.Math.Between(4,14),y:sp.y+Phaser.Math.Between(6,16),alpha:0,duration:420,onComplete:()=>sp.destroy()});
    });
  }
  return prop;
}
// Busca la escena activa (día o noche) y dispara la acción ahí.
function playerAction(kind){
  if(typeof game==='undefined'||!game.scene)return;
  const sc=['Day','Night'].map(k=>game.scene.getScene(k)).find(s=>s&&s.scene.isActive()&&s.player);
  if(sc)playPlayerAction(sc,kind);
}
// ═══ BENCHY: la pieza que sale de la impresora ═══
// El clásico barquito de test, revelado de abajo hacia arriba según el progreso.
const BENCHY_ASSET='benchy';
const BENCHY_PATH='assets/printers/benchy.png';
function loadBenchyAsync(scene,onReady){addImageFromImage(scene,BENCHY_ASSET,BENCHY_PATH,onReady);}
function createBenchySprite(scene,x,y,scale){
  if(!scene.textures.exists(BENCHY_ASSET))return null;
  return scene.add.image(x,y,BENCHY_ASSET).setOrigin(.5,1).setScale(scale||1.3).setVisible(false);
}
// Recorta el sprite dejando ver sólo la parte ya "impresa", desde la base hacia arriba.
function updateBenchySprite(sp,prog,col){
  if(!sp)return false;
  const pr=Math.max(0,Math.min(1,prog||0));
  if(pr<=0){sp.setVisible(false);return true;}
  const w=sp.frame.realWidth,h=sp.frame.realHeight;
  const shown=Math.max(1,Math.round(h*pr));
  sp.setVisible(true);
  sp.setCrop(0,h-shown,w,shown);
  if(col)sp.setTint(col);
  return true;
}
// La pieza que se está imprimiendo, creciendo capa por capa sobre la cama.
// Se dibuja fila por fila (1px = 1 capa) con líneas cada 3 capas y la capa nueva
// resaltada arriba, para que se vea cómo sube el objeto mientras la impresora trabaja.
function drawPrintObject(g,prog,col,scale){
  if(!g)return;
  g.clear();
  const pr=Math.max(0,Math.min(1,prog||0));
  if(pr<=0)return;
  const s=scale||1,baseY=-20*s,maxH=Math.round(16*s),wMax=14*s;
  const h=Math.max(1,Math.round(maxH*pr));
  for(let i=0;i<h;i++){
    const t=i/Math.max(1,maxH-1);
    const w=Math.max(2,Math.round(wMax*(.62+.38*Math.sin(Math.PI*(.18+.72*t)))));
    const y=baseY-1-i;
    if(i===h-1){g.fillStyle(0xffffff,.85);g.fillRect(-w/2,y,w,Math.max(1,s*.6));}
    else{
      g.fillStyle(col,1);g.fillRect(-w/2,y,w,Math.max(1,s*.6));
      if(i%3===0){g.fillStyle(0x000000,.2);g.fillRect(-w/2,y,w,Math.max(1,s*.4));}
    }
  }
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

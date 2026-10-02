// Phaser animation contract checks using actual sheet dimensions, not a renderer.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');

function host(){
  const textures=new Map(),animations=new Map(),requests=[],warnings=[];
  const scene={textures:{exists:k=>textures.has(k),get:k=>textures.get(k),
    addSpriteSheet(key,img,config){
      const count=Math.floor(img.width/config.frameWidth)*Math.floor(img.height/config.frameHeight);
      textures.set(key,{_flFrames:count,has:n=>Number.isInteger(n)&&n>=0&&n<count});
    }},anims:{exists:k=>animations.has(k),get:k=>animations.get(k),create(config){
      assert.ok(!animations.has(config.key),'no duplicate animation keys');
      for(const f of config.frames)assert.ok(textures.get(f.key)?.has(f.frame),config.key+' references a missing frame');
      animations.set(config.key,config);
    }}};
  const G={phase:'night',lang:'es',block:false,menuOpen:false,sMult:1};
  const context={G,console:{warn:m=>warnings.push(m)},Image:class{set src(src){this.source=src;requests.push(this);}}};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root,'js/i18n.js'),'utf8'),context);
  vm.runInContext(fs.readFileSync(path.join(root,'js/draw.js'),'utf8'),context);
  const api=vm.runInContext('({PRINTER_SHEETS,setupPrinterAnims,loadPrinterAssetsAsync,setPrinterSpriteState,setPlayerSpriteState,printerStatus,createPrinterLabel,updatePrinterLabel,tr})',context);
  function complete(img,fail=false){
    if(fail){img.onerror();return;}
    const bytes=fs.readFileSync(path.join(root,img.source));
    assert.equal(bytes.toString('ascii',1,4),'PNG');
    img.width=bytes.readUInt32BE(16);img.height=bytes.readUInt32BE(20);
    assert.equal(img.width%26,0);assert.equal(img.height%34,0);img.onload();
  }
  function load(){api.loadPrinterAssetsAsync(scene,()=>{});while(requests.length)complete(requests.shift());}
  function sprite(){
    const sp={scene,x:190,y:120,scaleX:3,scaleY:3,originX:.5,originY:1,depth:3,
      texture:{key:'maquina3d'},frame:{name:0},plays:0,tint:null,
      clearTint(){this.tint=null;return this;},setTint(c){this.tint=c;return this;},
      setTexture(k,n){assert.ok(textures.get(k)?.has(n));this.texture={key:k};this.frame={name:n};return this;},
      play(config){
        if(typeof config==='string')config={key:config};
        const a=animations.get(config.key);assert.ok(a,config.key);
        this.plays++;this.anims.currentAnim=a;this.anims.index=config.startFrame||0;
        this.anims.isPlaying=true;this.anims.isPaused=false;
        const f=a.frames[this.anims.index];assert.ok(f);this.setTexture(f.key,f.frame);return this;
      }};
    sp.anims={currentAnim:null,isPlaying:false,isPaused:false,index:0,timeScale:1,
      stop(){this.isPlaying=false;},
      pause(){if(!this.isPaused){this.wasPlaying=this.isPlaying;this.isPlaying=false;this.isPaused=true;}},
      resume(){if(this.isPaused){this.isPaused=false;this.isPlaying=this.wasPlaying;}},
      step(){if(this.isPlaying){this.index=(this.index+1)%this.currentAnim.frames.length;const f=this.currentAnim.frames[this.index];sp.setTexture(f.key,f.frame);}}
    };
    return sp;
  }
  function label(scale=3){
    const labelScene={add:{text(x,y,text,style){return {x,y,text,style,updates:0,
      setOrigin(x,y){this.originX=x;this.originY=y;return this;},
      setText(value){this.text=value;this.updates++;return this;},
      setColor(value){this.style.color=value;return this;},
      setBackgroundColor(value){this.style.backgroundColor=value;return this;}
    };}}};
    return api.createPrinterLabel(labelScene,100,200,scale);
  }
  return {...api,G,scene,textures,animations,requests,warnings,complete,load,sprite,label};
}

const tests=[];const test=(name,fn)=>tests.push([name,fn]);
test('all printer animations use only frames present in their source PNGs',()=>{
  const h=host();h.load();h.setupPrinterAnims(h.scene);
  assert.equal(h.animations.size,9);
  assert.equal(h.animations.get('printer_working_0').frames.length,30);
  assert.equal(h.animations.get('printer_working_1').frames.length,32);
  assert.equal(h.animations.get('printer_working_2').frames.length,7);
  assert.equal(h.animations.get('printer_fail_0').frames.length,6);
  assert.equal(h.animations.get('printer_out_filament_0').frames.length,6);
  assert.equal(h.animations.get('printer_out_filament_1').frames.length,8);
  assert.equal(h.warnings.length,0);
});
test('loading sheets out of order does not permanently register idle fallback frames',()=>{
  const h=host();let ready=0;
  h.loadPrinterAssetsAsync(h.scene,()=>ready++);
  h.complete(h.requests.shift());h.setupPrinterAnims(h.scene);
  assert.ok(!h.animations.has('printer_working_0'));
  h.loadPrinterAssetsAsync(h.scene,()=>ready++);
  while(h.requests.length)h.complete(h.requests.pop());
  assert.equal(ready,2);assert.equal(h.G._printerAssetCallbacks,null);
  assert.equal(h.animations.get('printer_working_0').frames.length,30);
});
test('failed sheet load releases callbacks and can retry without duplicating animations',()=>{
  const h=host();let ready=0;h.loadPrinterAssetsAsync(h.scene,()=>ready++);
  while(h.requests.length){const img=h.requests.shift();h.complete(img,img.source.includes('lvl1_working'));}
  assert.equal(ready,1);assert.equal(h.G._printerAssetCallbacks,null);
  assert.ok(!h.animations.has('printer_working_0'));
  h.load();assert.equal(h.animations.get('printer_working_0').frames.length,30);
});
test('models retain their identity through idle, print, failure and missing filament',()=>{
  const h=host();h.load();
  for(const id of [0,1,2]){
    const sp=h.sprite(),p={id,busy:true,broken:false,_pau:false,progress:.42};
    h.setPrinterSpriteState(sp,p);assert.equal(sp.anims.currentAnim.key,'printer_working_'+id);
    const base=['maquina3d','printer_standard','printer_enclosed'][id];
    p.broken=true;h.setPrinterSpriteState(sp,p);assert.equal(sp.tint,0xff8585);
    assert.equal(sp.anims.currentAnim.key,'printer_fail_'+id);
    assert.equal(sp.anims.isPlaying,true);
    p.broken=false;p._ev={id:'run'};h.setPrinterSpriteState(sp,p);assert.equal(sp.tint,0xffd166);
    assert.equal(sp.anims.currentAnim.key,'printer_out_filament_'+id);
    assert.equal(sp.anims.isPlaying,true);
    p._ev=null;p.busy=false;h.setPrinterSpriteState(sp,p);
    assert.equal(sp.texture.key,base);assert.equal(sp.tint,null);assert.equal(sp.anims.isPlaying,false);
  }
});
test('pause and overlay block freeze the current frame and resume without restarting',()=>{
  const h=host();h.load();const sp=h.sprite(),p={id:1,busy:true,_pau:false,progress:.35};
  h.setPrinterSpriteState(sp,p);sp.anims.step();const frame=sp.frame.name;
  for(const owner of ['printer','overlay']){
    if(owner==='printer')p._pau=true;else h.G.block=true;
    for(let i=0;i<5;i++){h.setPrinterSpriteState(sp,p);sp.anims.step();}
    assert.equal(sp.frame.name,frame);assert.equal(sp.plays,1);assert.equal(sp.anims.isPaused,true);
    p._pau=false;h.G.block=false;h.setPrinterSpriteState(sp,p);
    assert.equal(sp.anims.isPlaying,true);assert.equal(sp.plays,1);
  }
});
test('repeated updates vary visual cadence without changing printer state or placement',()=>{
  const h=host();h.load();const p={id:1,busy:true,progress:.4,order:{time:30,pay:250}},sp=h.sprite();
  const saved=JSON.stringify(p),geometry=JSON.stringify([sp.x,sp.y,sp.scaleX,sp.scaleY,sp.originX,sp.originY,sp.depth]);
  h.G.sMult=4;
  for(let i=0;i<100;i++)h.setPrinterSpriteState(sp,p);
  assert.equal(sp.plays,1);assert.ok(Math.abs(sp.anims.timeScale-1.575)<1e-9);
  assert.equal(JSON.stringify(p),saved);
  assert.equal(JSON.stringify([sp.x,sp.y,sp.scaleX,sp.scaleY,sp.originX,sp.originY,sp.depth]),geometry);
});
test('missing upgraded art uses the initial model without requesting missing animations',()=>{
  const h=host();h.load();h.textures.delete('printer_standard');
  const sp=h.sprite();h.setPrinterSpriteState(sp,{id:1,busy:true});
  assert.equal(sp.anims.currentAnim.key,'printer_working_0');
});
test('a failed model clears a prior pause before starting the next job',()=>{
  const h=host();h.load();const sp=h.sprite(),p={id:0,busy:true,_pau:false};
  h.setPrinterSpriteState(sp,p);sp.anims.step();
  p._pau=true;h.setPrinterSpriteState(sp,p);assert.equal(sp.anims.isPaused,true);
  p.broken=true;h.setPrinterSpriteState(sp,p);
  assert.equal(sp.anims.isPaused,false);assert.equal(sp.anims.isPlaying,true);
  assert.equal(sp.anims.currentAnim.key,'printer_fail_0');
  p.broken=false;p._pau=false;h.setPrinterSpriteState(sp,p);
  assert.equal(sp.plays,3);assert.equal(sp.frame.name,0);
});
test('new sheets preserve the measured export dimensions, frame duration and file contents',()=>{
  const h=host();h.load();
  const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'printer-sheets.json'),'utf8'));
  for(const sheet of manifest.sheets){
    const bytes=fs.readFileSync(path.join(root,sheet.path));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),sheet.pngSHA256.toLowerCase());
    assert.equal(bytes.readUInt32BE(16),sheet.frames*26);
    assert.equal(bytes.readUInt32BE(20),34);
    assert.equal(bytes[25],6,'RGBA export retains transparency');
    const anim=h.animations.get(sheet.animation);
    assert.equal(anim.frames.length,sheet.frames);assert.equal(anim.frameRate,1000/sheet.durationMs);
    assert.equal(anim.repeat,-1);
    assert.deepEqual(Array.from(anim.frames,f=>f.frame),Array.from({length:sheet.frames},(_,i)=>i));
  }
});
test('full work cycles visit every frame and wrap without restarting or changing geometry',()=>{
  const h=host();h.load();
  for(const id of [0,1]){
    const p={id,busy:true,progress:.63,order:{time:120,pay:100}},sp=h.sprite();
    const saved=JSON.stringify(p),geometry=JSON.stringify([sp.x,sp.y,sp.scaleX,sp.scaleY,sp.originX,sp.originY,sp.depth]);
    h.setPrinterSpriteState(sp,p);const start=sp.frame.name,seen=new Set(),count=id===0?30:32;
    for(let i=0;i<count;i++){seen.add(sp.frame.name);sp.anims.step();h.setPrinterSpriteState(sp,p);}
    assert.equal(seen.size,count);assert.equal(sp.frame.name,start);assert.equal(sp.plays,1);
    assert.equal(JSON.stringify(p),saved);
    assert.equal(JSON.stringify([sp.x,sp.y,sp.scaleX,sp.scaleY,sp.originX,sp.originY,sp.depth]),geometry);
  }
});
test('missing new fault art retains the same static printer and retries safely',()=>{
  const h=host();h.loadPrinterAssetsAsync(h.scene,()=>{});
  while(h.requests.length){const img=h.requests.shift();h.complete(img,/printer_lvl[12]_(broken|filament)/.test(img.source));}
  for(const id of [0,1]){
    const sp=h.sprite(),p={id,busy:true,_pau:true};
    h.setPrinterSpriteState(sp,p);assert.equal(sp.anims.isPaused,true);
    p._ev={id:'run'};h.setPrinterSpriteState(sp,p);
    assert.equal(sp.texture.key,id===0?'maquina3d':'printer_standard');
    assert.equal(sp.tint,0xffd166);assert.equal(sp.anims.isPlaying,false);assert.equal(sp.anims.isPaused,false);
    p._ev=null;p._pau=false;h.setPrinterSpriteState(sp,p);
    assert.equal(sp.anims.currentAnim.key,'printer_working_'+id);assert.equal(sp.anims.isPlaying,true);
  }
  h.load();assert.equal(h.animations.size,9);assert.equal(h.G._printerAssetCallbacks,null);
});
test('repaired and refilled printers resume work across repeated event cycles without touching saved progress',()=>{
  const h=host();h.load();
  for(const id of [0,1]){
    const sp=h.sprite(),p={id,busy:true,broken:false,_pau:false,progress:.42};
    for(let i=0;i<8;i++){
      p._ev={id:i%2?'run':'clog'};p._pau=true;
      h.setPrinterSpriteState(sp,p);assert.equal(sp.anims.currentAnim.key,'printer_'+(i%2?'out_filament':'fail')+'_'+id);
      sp.anims.step();p._ev=null;p._pau=false;h.setPrinterSpriteState(sp,p);
      assert.equal(sp.anims.currentAnim.key,'printer_working_'+id);assert.equal(sp.anims.isPaused,false);
      assert.equal(p.progress,.42);
    }
    p.busy=false;h.setPrinterSpriteState(sp,p);assert.equal(sp.anims.isPlaying,false);assert.equal(sp.tint,null);
  }
});
test('walking resumes after idle even though Phaser keeps the stopped animation reference',()=>{
  const h=host();h.load();const sp=h.sprite();
  h.textures.set('player_walk_s',{has:()=>true});
  h.animations.set('player_walk_down',{key:'player_walk_down',frames:[{key:'player_walk_s',frame:0},{key:'player_walk_s',frame:1}]});
  h.setPlayerSpriteState(sp,0,1,'down');h.setPlayerSpriteState(sp,0,0,'down');
  assert.equal(sp.anims.isPlaying,false);
  h.setPlayerSpriteState(sp,0,1,'down');assert.equal(sp.anims.isPlaying,true);assert.equal(sp.plays,2);
});
test('printer status describes the actual blocker and never invents a manual cashout',()=>{
  const h=host(),p={id:0,busy:true,progress:.9999};
  assert.equal(h.printerStatus(p).state,'printing');assert.equal(h.printerStatus(p).percent,99);
  h.G.block=true;assert.equal(h.printerStatus(p).state,'paused');
  p._ev={id:'run'};assert.equal(h.printerStatus(p).state,'refill');
  p.broken=true;assert.equal(h.printerStatus(p).state,'repair');
  p.locked=true;assert.equal(h.printerStatus(p).state,'locked');
  p.locked=false;p.broken=false;p._ev=null;p._pau=true;h.G.pActive=true;
  assert.equal(h.printerStatus(p).state,'power');
  h.G.upsLeft=20;assert.equal(h.printerStatus(p).state,'paused');
  h.G.block=false;p._pau=false;assert.equal(h.printerStatus(p).state,'printing');
  p.busy=false;p.order=null;p.progress=0;
  assert.equal(h.printerStatus(p).state,'idle');assert.equal(h.printerStatus(p).percent,null);
});
test('day-one reserved job is identified as night work without changing its progress or timing',()=>{
  const h=host(),p={id:0,busy:true,progress:.12,_dayPrintMs:999999};
  h.G.phase='day';h.G.day=1;const before=JSON.stringify(p);
  assert.equal(h.printerStatus(p).state,'night');assert.equal(h.printerStatus(p).percent,null);
  h.G.phase='night';assert.equal(h.printerStatus(p).state,'printing');assert.equal(h.printerStatus(p).percent,12);
  assert.equal(JSON.stringify(p),before);
  h.G.phase='day';p._dayPrintMs=24000;assert.equal(h.printerStatus(p).state,'printing');
});
test('progress labels use bounded completed percentages and hide stale idle progress',()=>{
  const h=host();
  for(const [progress,percent] of [[-.5,0],[0,0],[.427,42],[.999,99],[1,100],[1.1,100],[NaN,0],[Infinity,0]]){
    const p={id:0,busy:true,progress};assert.equal(h.printerStatus(p).percent,percent);
    p.busy=false;assert.equal(h.printerStatus(p).percent,null);
  }
});
test('status labels translate in both directions, keep fixed bounds and fit their text budget',()=>{
  const h=host();
  const states=[{}, {busy:true}, {busy:true,_pau:true}, {broken:true}, {_ev:{id:'run'}},
    {busy:true,_pau:true,power:true}, {locked:true}, {busy:true,_dayPrintMs:999999,night:true}];
  for(const scale of [.8,1,2.55,3.57]){
    const label=h.label(scale),bounds=JSON.stringify([label.x,label.y,label.style.fixedWidth,label.style.fixedHeight,label.style.fontSize]);
    for(const lang of ['es','en','es'])for(const state of states){
      h.G.lang=lang;h.G.pActive=!!state.power;h.G.phase=state.night?'day':'night';h.G.day=1;
      const p={id:0,progress:.99,...state};h.updatePrinterLabel(label,p,false);
      if(label._printerCompact)assert.equal(label.text,'P1');
      else assert.ok(label.text.endsWith(h.tr(h.printerStatus(p).key)));
      for(const line of label.text.split('\n'))assert.ok(line.length*8+8<=label.style.fixedWidth,'text exceeds conservative monospaced budget');
      assert.equal(JSON.stringify([label.x,label.y,label.style.fixedWidth,label.style.fixedHeight,label.style.fontSize]),bounds);
    }
  }
});
test('stable state labels do not redraw each frame or change game state when highlighted',()=>{
  const h=host(),label=h.label(),p={id:1,busy:true,progress:.421,order:{time:45,pay:90}};
  const saved=JSON.stringify([h.G,p]);
  for(let i=0;i<300;i++)h.updatePrinterLabel(label,p,false);
  assert.equal(label.updates,1);
  h.updatePrinterLabel(label,p,true);assert.equal(label.updates,2);assert.equal(label.style.backgroundColor,'#294c40');
  assert.equal(JSON.stringify([h.G,p]),saved);
  h.G.block=true;h.updatePrinterLabel(label,p,true);
  assert.equal(label.style.backgroundColor,'#141a1c');assert.match(label.text,/PAUSA$/);
  h.G.block=false;p.progress=.429;h.updatePrinterLabel(label,p,false);const updates=label.updates;
  p.progress=.4299;h.updatePrinterLabel(label,p,false);assert.equal(label.updates,updates);
  p.progress=.43;h.updatePrinterLabel(label,p,false);assert.equal(label.updates,updates+1);
});
test('every status colour remains readable against normal and selected label backgrounds',()=>{
  const h=host(),label=h.label();
  const luminance=hex=>{
    const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);
    return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
  };
  for(const state of [{},{busy:true},{busy:true,_pau:true},{broken:true},{_ev:{id:'run'}},{locked:true}]){
    for(const selected of [false,true]){
      h.updatePrinterLabel(label,{id:0,...state},selected);
      const contrast=(luminance(label.style.color)+.05)/(luminance(label.style.backgroundColor)+.05);
      assert.ok(contrast>=4.5,'insufficient label contrast: '+contrast);
    }
  }
});
let failed=0;
for(const [name,fn] of tests){try{fn();console.log('PASS '+name);}catch(e){failed++;console.error('FAIL '+name+'\n'+e.stack);}}
console.log(`${tests.length-failed}/${tests.length} sprite contract tests passed. Real Phaser rendering still requires manual QA.`);
process.exitCode=failed?1:0;

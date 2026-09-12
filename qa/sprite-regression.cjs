// Phaser animation contract checks using actual sheet dimensions, not a renderer.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
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
  const G={phase:'night',block:false,menuOpen:false,sMult:1};
  const context={G,console:{warn:m=>warnings.push(m)},Image:class{set src(src){this.source=src;requests.push(this);}}};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root,'js/draw.js'),'utf8'),context);
  const api=vm.runInContext('({PRINTER_SHEETS,setupPrinterAnims,loadPrinterAssetsAsync,setPrinterSpriteState,setPlayerSpriteState})',context);
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
  return {...api,G,scene,textures,animations,requests,warnings,complete,load,sprite};
}

const tests=[];const test=(name,fn)=>tests.push([name,fn]);
test('all printer animations use only frames present in their source PNGs',()=>{
  const h=host();h.load();h.setupPrinterAnims(h.scene);
  assert.equal(h.animations.size,6);
  assert.equal(h.animations.get('printer_working_0').frames.length,6);
  assert.equal(h.animations.get('printer_working_1').frames.length,8);
  assert.equal(h.animations.get('printer_working_2').frames.length,7);
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
  assert.equal(h.animations.get('printer_working_0').frames.length,6);
});
test('failed sheet load releases callbacks and can retry without duplicating animations',()=>{
  const h=host();let ready=0;h.loadPrinterAssetsAsync(h.scene,()=>ready++);
  while(h.requests.length){const img=h.requests.shift();h.complete(img,img.source.includes('lvl1_working'));}
  assert.equal(ready,1);assert.equal(h.G._printerAssetCallbacks,null);
  assert.ok(!h.animations.has('printer_working_0'));
  h.load();assert.equal(h.animations.get('printer_working_0').frames.length,6);
});
test('models retain their identity through idle, print, failure and missing filament',()=>{
  const h=host();h.load();
  for(const id of [0,1,2]){
    const sp=h.sprite(),p={id,busy:true,broken:false,_pau:false,progress:.42};
    h.setPrinterSpriteState(sp,p);assert.equal(sp.anims.currentAnim.key,'printer_working_'+id);
    const base=['maquina3d','printer_standard','printer_enclosed'][id];
    p.broken=true;h.setPrinterSpriteState(sp,p);assert.equal(sp.tint,0xff8585);
    if(id===0){assert.equal(sp.texture.key,base);assert.equal(sp.anims.isPlaying,false);}
    else assert.equal(sp.anims.currentAnim.key,'printer_fail_'+id);
    p.broken=false;p._ev={id:'run'};h.setPrinterSpriteState(sp,p);assert.equal(sp.tint,0xffd166);
    if(id<2)assert.equal(sp.texture.key,base);
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
test('an idle or failed model clears a prior pause before starting the next job',()=>{
  const h=host();h.load();const sp=h.sprite(),p={id:0,busy:true,_pau:false};
  h.setPrinterSpriteState(sp,p);sp.anims.step();
  p._pau=true;h.setPrinterSpriteState(sp,p);assert.equal(sp.anims.isPaused,true);
  p.broken=true;h.setPrinterSpriteState(sp,p);
  assert.equal(sp.anims.isPaused,false);assert.equal(sp.anims.isPlaying,false);
  p.broken=false;p._pau=false;h.setPrinterSpriteState(sp,p);
  assert.equal(sp.plays,2);assert.equal(sp.frame.name,0);
});
test('walking resumes after idle even though Phaser keeps the stopped animation reference',()=>{
  const h=host();h.load();const sp=h.sprite();
  h.textures.set('player_walk_s',{has:()=>true});
  h.animations.set('player_walk_down',{key:'player_walk_down',frames:[{key:'player_walk_s',frame:0},{key:'player_walk_s',frame:1}]});
  h.setPlayerSpriteState(sp,0,1,'down');h.setPlayerSpriteState(sp,0,0,'down');
  assert.equal(sp.anims.isPlaying,false);
  h.setPlayerSpriteState(sp,0,1,'down');assert.equal(sp.anims.isPlaying,true);assert.equal(sp.plays,2);
});
let failed=0;
for(const [name,fn] of tests){try{fn();console.log('PASS '+name);}catch(e){failed++;console.error('FAIL '+name+'\n'+e.stack);}}
console.log(`${tests.length-failed}/${tests.length} sprite contract tests passed. Real Phaser rendering still requires manual QA.`);
process.exitCode=failed?1:0;

// Logic regression host. This does NOT render Phaser or replace browser QA.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="(js\/[^"?]+)(?:\?[^" ]*)?"/g)].map(m => m[1]);

class Clock {
  constructor() { this.now = 0; this.next = 0; this.jobs = new Map(); }
  add(fn, delay = 0, repeat = false) {
    const id = ++this.next;
    this.jobs.set(id, { fn, at: this.now + Math.max(1, delay), delay, repeat });
    return id;
  }
  advance(ms) {
    const end = this.now + ms;
    for (let turns = 0; turns < 10000; turns++) {
      const job = [...this.jobs].filter(([,j]) => j.at <= end).sort((a,b) => a[1].at-b[1].at)[0];
      if (!job) { this.now = end; return; }
      const [id,j] = job;
      this.now = j.at;
      if (j.repeat) j.at += Math.max(1,j.delay); else this.jobs.delete(id);
      j.fn();
    }
    throw new Error('Unbounded timer loop');
  }
}

function host(saved = null, width = 1366, height = 768, options = {}) {
  const clock = new Clock(), elements = new Map(), storage = new Map(), messages = [];
  const documentEvents=new EventEmitter();
  if (saved) storage.set('first_layer_save', JSON.stringify(saved));
  const modalIds = ['dlg','shop','sto','evp','miniGame','bkg','dayEnd','betaEnd'];
  function element(id = '') {
    const classes = new Set();
    const el = {
      id, style: { display: modalIds.includes(id) ? 'none' : 'block' }, dataset: {},
      childNodes: [{ nodeValue: '' }], children: [], textContent: '', innerHTML: '',
      value: '', active: true, disabled: false, tagName: 'DIV', tabIndex: 0,
      classList: { add: (...v) => v.forEach(x => classes.add(x)), remove: (...v) => v.forEach(x => classes.delete(x)), contains: v => classes.has(v), toggle: (v,on) => on ? classes.add(v) : classes.delete(v) },
      appendChild(c) { c.parentNode = el; el.children.push(c); if(c.id)elements.set(c.id,c); },
      prepend(c) { el.appendChild(c); }, remove() {}, replaceChildren() { el.children=[]; },
      removeChild(c) { el.children=el.children.filter(x=>x!==c); },
      replaceChild(a,b) { elements.set(b.id,a); a.parentNode=el; },
      cloneNode() { return element(id); }, setAttribute() {}, getAttribute() { return ''; },
      focus() { document.activeElement=el; }, addEventListener() {},
      querySelectorAll() { return []; }, querySelector() { return null; }, animate() {},
      getBoundingClientRect() { return {right:284,left:12,top:82,width:272,height:400}; }
    };
    return el;
  }
  for (const m of html.matchAll(/\bid="([^"]+)"/g)) elements.set(m[1],element(m[1]));
  const document = {
    activeElement: null, documentElement: element('html'), body: element('body'),
    getElementById: id => elements.get(id) || null, createElement: () => element(),
    querySelectorAll: () => [], querySelector: () => null, addEventListener:(name,fn)=>documentEvents.on(name,fn)
  };
  for(const el of elements.values()) el.parentNode=document.body;
  function drawable(x=0,y=0) {
    const node={x,y,visible:true,active:true,scaleX:1,scaleY:1,angle:0,alpha:1,
      anims:{play(){},pause(){},resume(){},stop(){},isPlaying:false},
      setPosition(x,y){this.x=x;this.y=y;return this;},
      setVisible(v){this.visible=v;return this;},
      setScale(x,y=x){this.scaleX=x;this.scaleY=y;return this;},
      setAngle(v){this.angle=v;return this;},
      setText(v){this.text=v;return this;}, destroy(){this.active=false;}, add(){return this;}
    };
    return node;
  }
  // Keep drawing chains inert without swallowing calls to gameplay methods.
  function graphic(x,y) {
    const obj=drawable(x,y);
    const chain=new Proxy(obj,{get:(target,k)=>{
      const v=Reflect.get(target,k);
      if(k in target)return typeof v==='function'?v.bind(chain):v;
      return ()=>chain;
    }});
    return chain;
  }
  const sceneMap={};
  class Scene {
    constructor(config) {
      this.key=config.key; this.events=new EventEmitter(); this.sys={isActive:()=>!this.paused};
      this.scale={width,height}; this.cameras={main:{flash(){},shake(){},setZoom(){},centerOn(){}}};
      this.time={now:0,delayedCall:(delay,fn)=>clock.add(fn,delay),addEvent:o=>clock.add(o.callback,o.delay,o.repeat===-1)};
      this.add=new Proxy({},{get:()=> (x,y)=>graphic(x,y)});
      this.textures={exists:()=>false}; this.anims={exists:()=>false};
      this.tweens={add:()=>({stop(){},remove(){}}),killTweensOf(){}};
      this.input=new EventEmitter(); this.input.keyboard=new EventEmitter();
      this.input.keyboard.addKeys=keys=>Object.fromEntries(Object.keys(keys).map(k=>[k,{isDown:false}]));
      this.scene={pause:()=>{this.paused=true;},stop:()=>{this.events.emit('shutdown');},start:key=>{this.nextScene=key;}};
      sceneMap[config.key]=this;
    }
  }
  class Rectangle { constructor(x,y,width,height){Object.assign(this,{x,y,width,height});} }
  const math=Object.create(Math); let seed=513;
  math.random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  const context={
    console:{log(){},warn:(...args)=>messages.push(args.join(' ')),error:(...args)=>messages.push(args.join(' '))},
    Math:math,performance:{now:()=>clock.now},document,innerWidth:width,innerHeight:height,
    localStorage:{getItem:k=>{if(options.denyStorage)throw Error('Storage denied');return storage.get(k)||null;},setItem:(k,v)=>{if(options.denyStorage)throw Error('Storage denied');storage.set(k,v);},removeItem:k=>{if(options.denyStorage)throw Error('Storage denied');storage.delete(k);}},
    getComputedStyle:el=>el.style,addEventListener(){},location:{reload(){}},confirm:()=>true,
    setTimeout:(fn,ms)=>clock.add(fn,ms),clearTimeout:id=>clock.jobs.delete(id),
    setInterval:(fn,ms)=>clock.add(fn,ms,true),clearInterval:id=>clock.jobs.delete(id),
    Image:class {}, Audio:class { play(){return Promise.resolve();} pause(){} },
    Phaser:{CANVAS:1,Scale:{RESIZE:1,CENTER_BOTH:1},Scene,
      Game:class {constructor(config){this.config=config;this.scene={getScene:key=>sceneMap[key],pause:key=>{if(sceneMap[key])sceneMap[key].paused=true;},resume:key=>{if(sceneMap[key])sceneMap[key].paused=false;}};for(const S of config.scene)new S();}},
      Math:{Clamp:(n,a,b)=>Math.max(a,Math.min(b,n)),Between:(a,b)=>a,Distance:{Between:(x,y,a,b)=>Math.hypot(x-a,y-b)}},
      Geom:{Rectangle,Intersects:{RectangleToRectangle:(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y}},
      Utils:{Array:{Shuffle:a=>a}}
    }
  };
  context.window=context;
  vm.createContext(context);
  for(const file of scripts) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
  const api=vm.runInContext('({G,game,BETA_DAYS,SK,doSave,setSaveCheckpoint,buildSaveCheckpoint,prepareOrderMaterial})',context);
  function start(phase,day=1) {
    api.G.day=day; api.G.menuOpen=false;elements.get('titleScreen').style.display='none';
    const scene=sceneMap[phase==='night'?'Night':'Day'];
    scene.create();return scene;
  }
  const key=(value,repeat=false)=>documentEvents.emit('keydown',{key:value,repeat,target:document.body,preventDefault(){}});
  return {...api,context,sceneMap,elements,storage,clock,messages,start,key,run:code=>vm.runInContext(code,context)};
}

const tests=[];
function test(name,fn){tests.push([name,fn]);}
function loadedJob(h,time=1.2) {
  const o={pr:{e:'',n:'Test',c:0xffffff,t:time},material:'pla',units:1,time,pay:100,diff:1,risk:.1,filament:{id:'eco',n:'PLA Basic',rep:-1}};
  h.G.orders.push(o);
  const p={id:0,locked:false,busy:true,broken:false,order:o,progress:0,_ev:null,_pau:false};
  h.G.printers=[p];return p;
}

test('all classic scripts parse and keep their dependency order',()=>{
  assert.deepEqual(scripts,['js/audio.js','js/data.js','js/state.js','js/i18n.js','js/draw.js','js/ui.js','js/g-methods.js','js/pro-patch.js','js/scenes/DayScene.js','js/scenes/NightScene.js','js/main.js']);
  for(const file of scripts)execFileSync(process.execPath,['--check',path.join(root,file)]);
});
test('referenced local asset paths exist with exact case',()=>{
  const sources=[html,fs.readFileSync(path.join(root,'styles.css'),'utf8'),...scripts.map(f=>fs.readFileSync(path.join(root,f),'utf8'))].join('\n');
  const refs=new Set([...sources.matchAll(/assets\/[A-Za-z0-9_./ -]+\.(?:png|jpg|jpeg|webp|mp3|wav|json)/g)].map(m=>m[0]));
  for(const ref of refs){let dir=root;for(const part of ref.split('/')){assert.ok(fs.readdirSync(dir).includes(part),ref);dir=path.join(dir,part);}}
});
test('Day and Night boot for days 1, 2, 3 at both desktop sizes (mock rendering)',()=>{
  for(const [w,h] of [[1366,768],[1920,1080]]){
    const env=host(null,w,h);
    for(let day=1;day<=3;day++){
      env.start('day',day);assert.equal(env.G.phase,'day');
      const ns=env.start('night',day);assert.equal(env.G.phase,'night');assert.equal(ns.pObjs.length,1);
    }
    assert.deepEqual(env.messages,[]);
  }
});
test('v2 save resumes the shift checkpoint and preserves order identity',()=>{
  const h=host();h.start('day');const p=loadedJob(h);h.G.gold=345;
  h.setSaveCheckpoint(h.G,'night');h.G.gold=999;h.doSave(h.G);
  const restored=host(JSON.parse(h.storage.get(h.SK)));
  assert.equal(restored.G.resumePhase,'night');assert.equal(restored.G.gold,345);
  assert.equal(restored.G.printers[0].order,restored.G.orders[0]);
  assert.equal(restored.G.printers[0].order.pay,p.order.pay);
});
test('material is consumed only once for an already prepared order',()=>{
  const h=host();h.G.stk.pla.eco=3;
  const o={material:'pla',units:2,diff:1,risk:.1};
  assert.equal(h.prepareOrderMaterial(o),true);assert.equal(h.G.stk.pla.eco,1);
  assert.equal(h.prepareOrderMaterial(o),true);assert.equal(h.G.stk.pla.eco,1);
});
test('opening dialogue blocks the day and closing it respects another overlay',()=>{
  const h=host(),ds=h.start('day');
  ds.oDlg('Test','','',[]);assert.equal(h.G.block,true);
  h.elements.get('sto').style.display='block';h.run('cDlg()');assert.equal(h.G.block,true);
  h.G.cSto();assert.equal(h.G.block,false);
});
test('forced failure waits for the shop and does not replace another event',()=>{
  const h=host();loadedJob(h);const ns=h.start('night');
  h.elements.get('shop').style.display='block';h.G.block=true;
  h.clock.advance(45000);assert.equal(ns.aEv,null);
  h.G.cShop();h.clock.advance(4000);
  const first=ns.aEv;assert.ok(first);
  h.clock.advance(10000);assert.equal(ns.aEv,first);
});
test('night clock and printing pause while a modal is open',()=>{
  const h=host();const p=loadedJob(h);const ns=h.start('night');
  h.G.block=true;ns.update(0,1000);
  assert.equal(p.progress,0);assert.equal(ns.el,0);
});
test('last fast print receives every mandatory failure before being paid',()=>{
  for(const day of [1,2,3]){
    const h=host();const p=loadedJob(h);const ns=h.start('night',day);
    for(const expected of h.BETA_DAYS[day].forcedFails){
      p.progress=1;ns.completePrint(p);
      assert.ok(ns.aEv,'missing '+expected.id+' on night '+day);
      assert.equal(ns.aEv.id,expected.id);assert.equal(ns.done,0);
      h.G.nFix();
    }
    ns.completePrint(p);assert.equal(ns.done,1);assert.equal(h.G.orders.length,0);
    ns.completePrint(p);assert.equal(ns.done,1);
  }
});
test('second failure stays blocked until first repair ends',()=>{
  const h=host();loadedJob(h);const ns=h.start('night',3);
  const second={...h.G.orders[0]};h.G.orders.push(second);
  h.G.printers.push({...h.G.printers[0],id:1,order:second});
  ns.trigEv('clog',true,0);const first=ns.aEv;
  ns.trigEv('bed',true,1);assert.equal(ns.aEv,first);
  h.G.nFix();h.clock.advance(4000);assert.equal(ns.aEv.id,'bed');
});
test('a resolved script does not fire again at its scheduled time',()=>{
  const h=host();const p=loadedJob(h);const ns=h.start('night');
  p.progress=1;ns.completePrint(p);h.G.nFix();ns.completePrint(p);
  h.clock.advance(20000);assert.equal(ns.aEv,null);assert.equal(h.G.nFixes,1);
});
test('active failure prevents night closure even when numeric counters pass',()=>{
  const h=host();const p=loadedJob(h);const ns=h.start('night');
  ns.trigEv('clog',true,0);h.G.nFixes=1;h.G.nightDone=1;p.busy=false;
  assert.equal(ns.nightObjectiveReady(),false);
});
test('repair during an outage does not resume an unpowered printer',()=>{
  const h=host();const p=loadedJob(h);const ns=h.start('night');
  ns.trigEv('clog',true,0);h.G.pActive=true;h.G.upsLeft=0;h.G.nFix();
  assert.equal(p._pau,true);h.G.nFix();assert.equal(h.G.nFixes,1);
});
test('stale minigame success cannot complete a replacement attempt',()=>{
  const h=host();loadedJob(h);const ns=h.start('night');ns.trigEv('clog',true,0);
  const old={ev:ns.aEv,type:'nozzle'},current={ev:ns.aEv,type:'nozzle'};
  h.G._mini=current;h.G.winNozzleMini(old);assert.equal(h.G._mini,current);
  assert.equal(h.G.nFixes,0);
});
test('a retired night callback cannot open an event in the next night',()=>{
  const h=host();loadedJob(h);const ns=h.start('night');ns.events.emit('shutdown');
  // Reuse the same Phaser scene instance, as Day 2 does.
  h.G.printers[0]._pau=false;h.start('night',3);h.clock.advance(9500);
  assert.equal(ns.aEv,null,'Night 1 nozzle timer leaked into Night 2');
});
test('menu pause and close restore input without unlocking a story panel',()=>{
  const h=host();h.start('day');h.run('openGameMenu()');assert.equal(h.G.block,true);
  h.run('closeGameMenu()');assert.equal(h.G.block,false);
  h.G.showSto('Story','Text');h.run('openGameMenu(); closeGameMenu()');
  assert.equal(h.G.block,true);h.G.cSto();assert.equal(h.G.block,false);
});
test('scheduled day arrivals wait until the dialogue closes',()=>{
  const h=host(),ds=h.start('day');h.clock.jobs.clear();ds.oDlg('Test','','',[]);
  ds.spawn();assert.equal(h.G.dayCli,0);
  h.run('cDlg()');h.clock.advance(800);assert.equal(h.G.dayCli,1);
});
test('micro-outage waits during a modal and restores power only once',()=>{
  const h=host();const p=loadedJob(h),ns=h.start('night',2);
  ns.trigPwr('micro');assert.equal(p._pau,true);
  h.G.block=true;ns.update(0,5000);assert.equal(h.G.pActive,true);
  h.G.block=false;ns.update(0,4100);assert.equal(h.G.pActive,false);assert.equal(p._pau,false);
  const count=h.G.breakerFixes;ns.resPwr(true);assert.equal(h.G.breakerFixes,count);
});
test('winning and losing nozzle/bed attempts preserve the owning failure',()=>{
  for(const type of ['nozzle','bed']){
    const h=host();const p=loadedJob(h),ns=h.start('night',type==='bed'?2:1);
    ns.trigEv(type==='bed'?'bed':'clog',true,0);
    for(let attempt=0;attempt<2;attempt++){
      h.G._mini={type,ev:ns.aEv,tick:h.clock.add(()=>{},250,true)};
      h.G.failNozzleMini();assert.ok(p._ev);assert.equal(h.G.nFixes,0);assert.equal(h.G.block,true);
    }
    h.G.gold=0;h.G.stk.parts=0;
    const m={type,ev:ns.aEv,tick:h.clock.add(()=>{},250,true)};h.G._mini=m;
    h.G.winNozzleMini(m);assert.equal(p._ev,null);assert.equal(h.G.nFixes,1);assert.equal(h.G.block,false);
    h.G.winNozzleMini(m);assert.equal(h.G.nFixes,1);
  }
});
test('money and assignments survive every shift checkpoint across the beta',()=>{
  for(const day of [1,2,3])for(const phase of ['day','night']){
    const h=host();h.start('day',day);loadedJob(h);h.G.gold=200+day;
    h.setSaveCheckpoint(h.G,phase);
    const restored=host(JSON.parse(h.storage.get(h.SK)));
    restored.start(phase,day);
    assert.equal(restored.G.phase,phase);assert.equal(restored.G.gold,200+day);
    assert.equal(restored.G.orders.length,1);
    if(phase==='night')assert.equal(restored.G.printers[0].order,restored.G.orders[0]);
  }
});
test('legacy stock save remains loadable',()=>{
  const h=host({day:2,gold:220,stk:{pla:3,petg:2,resin:0,tpu:0,parts:1},orders:[]});
  assert.equal(h.G.gold,220);assert.equal(h.G.stk.pla.std,3);assert.equal(h.G.stk.petg.std,2);
  h.start('day',2);assert.equal(h.G.phase,'day');
});
test('day cannot close before objectives and transitions once when ready',()=>{
  const h=host(),ds=h.start('day');h.clock.jobs.clear();ds.endDay();assert.equal(h.G.phase,'day');
  loadedJob(h);Object.assign(h.G,{dayOrd:3,dayPrints:2,dayBoughtPlaBasic:true});
  ds.endDay();assert.equal(h.G.phase,'transition');assert.equal(h.elements.get('dayEnd').style.display,'flex');
  h.G.continueToNight();h.G.continueToNight();h.clock.advance(5000);
  assert.equal(ds.nextScene,'Night');assert.equal(h.G._dayCloseCb,null);
});
test('completed third night opens beta ending without creating day four',()=>{
  const h=host();const p=loadedJob(h),ns=h.start('night',3);h.clock.jobs.clear();
  for(let i=0;i<2;i++){ns.completePrint(p);h.G.nFix();}
  ns.completePrint(p);h.G.upg.unlock2=true;h.G.syncPrinters();
  h.G.dayPrints=2;h.G.breakerFixes=1;
  ns.endNight();assert.equal(h.G.phase,'transition');h.clock.advance(5000);
  assert.equal(h.G.day,3);assert.equal(ns.nextScene,undefined);
  assert.equal(h.elements.get('betaEnd').style.display,'flex');
});

test('night breaker has a walkable route and E/click dispatch the same single action',()=>{
  for(const [w,h] of [[1366,768],[1920,1080]]){
    const env=host(null,w,h),ns=env.start('night',2);ns.trigPwr('norm');
    // Flood the real foot hitboxes from spawn, without crossing any solid.
    const start=[205,235],queue=[start],seen=new Set([start.join(',')]);
    for(let i=0;i<queue.length;i++)for(const [dx,dy] of [[2,0],[-2,0],[0,2],[0,-2]]){
      const [x,y]=[queue[i][0]+dx,queue[i][1]+dy],key=x+','+y;
      const p=ns.rp(x,y);
      if(x<12||x>408||y<106||y>244||seen.has(key)||ns.hitsSolid(p.x,p.y))continue;
      seen.add(key);queue.push([x,y]);
    }
    assert.ok(seen.has('55,117'),'breaker is unreachable');
    for(const t of ns.interactionTargets())assert.ok(!ns.hitsSolid(t.access.x,t.access.y),t.type+' access inside furniture');
    Object.assign(ns.player,ns.breakerAccess);
    ns.input.keyboard.emit('keydown-E',{repeat:false});
    assert.equal(env.elements.get('bkg').style.display,'block');const sequence=env.G._bkOrd;
    ns.input.emit('pointerdown',{worldX:ns.tZone.x,worldY:ns.tZone.y});
    assert.equal(env.G._bkOrd,sequence,'second activation replaced live round');
    env.elements.get('bkg').style.display='none';env.G.block=false;
    ns.input.emit('pointerdown',{worldX:ns.tZone.x,worldY:ns.tZone.y});
    assert.equal(env.elements.get('bkg').style.display,'block');assert.equal(env.G._bkRounds,1);
    env.elements.get('bkg').style.display='none';env.G.block=false;
    ns.input.keyboard.emit('keydown-E',{repeat:true});assert.equal(env.G.block,false);
    const wall=ns.rp(194,115);assert.ok(ns.hitsSolid(wall.x,wall.y));
  }
});

test('client cap recovers only missing mandatory work, one offer at a time',()=>{
  for(const day of [1,2,3]){
    const h=host(),ds=h.start('day',day);h.clock.jobs.clear();
    h.G.dayCli=h.BETA_DAYS[day].maxClients;h.G.dayOrd=4;h.G.dayPrints=4;
    ds.spawn();assert.equal(ds.clients.length,1);ds.spawn();assert.equal(ds.clients.length,1);
    const c=ds.clients[0];ds.acceptOrd(c,'man');
    if(day===3){ds.spawn();ds.acceptOrd(ds.clients[0],'man');}
    const count=h.G.dayCli;ds.spawn();assert.equal(h.G.dayCli,count,'normal cap was removed');
    assert.equal(ds.needsRecoveryClient(),false);
    h.G.orders=[];ds.spawn();assert.equal(ds.clients.length,1);
    ds.leaveClient(ds.clients[0],true);ds.spawn();assert.equal(ds.clients.length,1,'declining recovery must not lock the run');
  }
});
test('every visible task uses the exact day/night gate predicates in both languages',()=>{
  for(const lang of ['es','en'])for(const day of [1,2,3])for(const phase of ['day','night']){
    const h=host(),sc=h.start(phase,day);h.G.lang=lang;
    for(const ready of [false,true]){
      if(ready){
        Object.assign(h.G,{dayOrd:4,dayPrints:4,dayBoughtPlaBasic:true,dayBoughtMaterial:1,nightDone:2,nFixes:2,breakerFixes:1});
        h.G.upg.unlock2=true;h.G.syncPrinters();
        if(phase==='day'){loadedJob(h);h.G.orders.push({...h.G.orders[0]});}
        else sc.forcedFails.forEach(e=>{e.triggered=true;e.resolved=true;});
      }
      h.run('updateProPanel()');
      const tasks=h.run('betaObjectives()');
      assert.equal(phase==='day'?sc.dayObjectiveReady():sc.nightObjectiveReady(),tasks.every(t=>t.done));
      for(const task of tasks)assert.ok(h.elements.get('objList').innerHTML.includes('<b>'+task.txt+'</b>'));
    }
  }
});
test('day three must retain two spares to close',()=>{
  const h=host(),ds=h.start('day',3);loadedJob(h);h.G.orders.push({...h.G.orders[0]});
  h.G.dayOrd=4;h.G.dayPrints=2;h.G.stk.parts=1;
  assert.equal(ds.dayObjectiveReady(),false);h.G.stk.parts=2;assert.equal(ds.dayObjectiveReady(),true);
});
test('night two assignment remains complete after cashout',()=>{
  const h=host();const p=loadedJob(h),ns=h.start('night',2);
  const assigned=()=>h.run("betaObjectives('night').find(t=>t.id==='assign').done");
  assert.equal(assigned(),true);ns.completePrint(p);h.G.nFix();ns.completePrint(p);
  assert.equal(p.order,null);assert.equal(assigned(),true);
});
test('acceptance never counts unearned money and day cashout is idempotent',()=>{
  const h=host(),ds=h.start('day',2);ds.spawn();const c=ds.clients[0],pay=c.pay;
  ds.acceptOrd(c,'man');assert.equal(h.G.dayEarn,0);
  const o=h.G.orders[0],p=h.G.printers[0];o.filament={rep:0};p.busy=true;p.order=o;
  ds.completePrint(p);assert.equal(h.G.dayEarn,pay);ds.completePrint(p);assert.equal(h.G.dayEarn,pay);
});

test('no-money no-material run can buy only essential stock on explicit credit',()=>{
  const h=host(),ds=h.start('day');ds.spawn();ds.acceptOrd(ds.clients[0],'man');h.G.gold=0;
  const cost=h.run("getFilPrice('pla','eco')"),o=h.G.orders[0];
  h.context.confirm=()=>false;h.G.bStk('pla',cost,'eco');assert.equal(h.G.gold,0);assert.equal(h.G.stk.pla.eco,0);
  h.context.confirm=()=>true;h.G.bStk('pla',cost,'eco');
  assert.equal(h.G.gold,-cost-Math.ceil(cost*.1));assert.equal(h.G.dayBoughtPlaBasic,true);
  assert.equal(ds.assignOrderToPrinter(h.G.printers[0],o),true);
  const debt=h.G.gold;h.G.buyConsumable('coffee');assert.equal(h.G.gold,debt);
  ds.completePrint(h.G.printers[0]);assert.equal(h.G.gold,debt+o.pay);
});
test('credit stops at required material and is unavailable while another job can pay',()=>{
  const h=host(),ds=h.start('day',2);ds.spawn();ds.acceptOrd(ds.clients[0],'man');
  const o=h.G.orders[0];o.material='pla';o.units=2;h.G.stk.pla.eco=0;h.G.gold=0;
  const cost=h.run("getFilPrice('pla','eco')");
  h.G.bStk('pla',cost,'eco');h.G.bStk('pla',cost,'eco');assert.equal(h.G.stk.pla.eco,2);
  const debt=h.G.gold;h.G.bStk('pla',cost,'eco');h.G.bStk('pla',1,'std');
  assert.equal(h.G.gold,debt);assert.equal(h.G.stk.pla.std,0);
  assert.equal(h.run('betaCanEarn()'),true);
});
test('night three can finance P2 after all income is exhausted, not beforehand',()=>{
  const h=host();const p=loadedJob(h),ns=h.start('night',3);h.G.gold=0;
  h.G._bUpg('unlock2');assert.equal(h.G.upg.unlock2,undefined);
  for(let i=0;i<2;i++){ns.completePrint(p);h.G.nFix();}ns.completePrint(p);h.G.gold=0;
  h.G._bUpg('unlock2');assert.equal(h.G.upg.unlock2,true);assert.equal(h.G.gold,-440);
  h.G._bUpg('unlock2');assert.equal(h.G.gold,-440);
  h.setSaveCheckpoint(h.G,'night');const restored=host(JSON.parse(h.storage.get(h.SK)));
  assert.equal(restored.G.gold,-440);assert.equal(restored.G.upg.unlock2,true);
});
test('mandatory spares can recover with no income and stop at two',()=>{
  const h=host();h.start('day',3);h.G.gold=0;h.G.stk.parts=0;h.G.orders=[];
  const cost=h.G.market.parts.cur;
  h.G.bStk('parts',cost,'');h.G.bStk('parts',cost,'');const debt=h.G.gold;
  h.G.bStk('parts',cost,'');assert.equal(h.G.stk.parts,2);assert.equal(h.G.gold,debt);
});
test('broken printer recovery is idempotent and preserves an active blackout',()=>{
  const h=host();loadedJob(h);const ns=h.start('night',3);h.G.gold=0;
  const p=h.G.printers[0];p.broken=true;p.busy=false;h.G.pActive=true;h.G.upsLeft=0;
  ns.repairBrokenPrinter(0);assert.equal(p.broken,false);assert.equal(p._pau,true);
  const debt=h.G.gold;ns.repairBrokenPrinter(0);assert.equal(h.G.gold,debt);
});

function finishThirdNight(h){
  const p=loadedJob(h),ns=h.start('night',3);h.clock.jobs.clear();
  for(let i=0;i<2;i++){ns.completePrint(p);h.G.nFix();}ns.completePrint(p);
  h.G.upg.unlock2=true;h.G.syncPrinters();h.G.dayPrints=2;h.G.breakerFixes=1;
  ns.endNight();h.clock.advance(5000);return ns;
}
test('beta result survives reload and boots into the ending, without a new night',()=>{
  const h=host();finishThirdNight(h);
  const saved=JSON.parse(h.storage.get(h.SK));assert.ok(saved.checkpoint.betaResult);assert.equal(saved.version,2);
  const restored=host(saved),ns=restored.start('night',3);
  assert.equal(restored.G.phase,'complete');assert.equal(restored.G.day,3);
  assert.equal(restored.elements.get('betaEnd').style.display,'flex');
  assert.equal(ns.pObjs,undefined,'completed save must not restart printing');
  assert.deepEqual(JSON.parse(JSON.stringify(restored.G.betaResult)),JSON.parse(JSON.stringify(h.G.betaResult)));
});
test('back to menu preserves completed save; continue reopens final; reset needs confirmation',()=>{
  const h=host();finishThirdNight(h);const saved=h.storage.get(h.SK);let reloads=0;
  h.context.location.reload=()=>reloads++;
  h.G.betaToMenu();assert.equal(h.storage.get(h.SK),saved);assert.equal(h.G.menuOpen,true);
  assert.equal(h.elements.get('betaEnd').style.display,'none');
  h.run('closeGameMenu()');assert.equal(h.G.phase,'complete');assert.equal(h.elements.get('betaEnd').style.display,'flex');
  h.context.confirm=()=>false;h.G.confirmReset();assert.equal(h.storage.get(h.SK),saved);assert.equal(reloads,0);
  h.context.confirm=()=>true;h.G.confirmReset();assert.equal(h.storage.has(h.SK),false);assert.equal(reloads,1);
  const fresh=host();assert.equal(fresh.G.day,1);assert.equal(fresh.G.betaResult,null);
});
test('final labels localize and show recorded statistics, never accepted orders as completions',()=>{
  const h=host();finishThirdNight(h);h.G.stats.ord=900;
  for(const lang of ['es','en']){
    h.G.lang=lang;h.G.showBetaEnd();
    assert.equal(h.elements.get('beTitle').textContent,lang==='es'?'FIN DE LA BETA':'END OF THE BETA');
    assert.ok(!h.elements.get('beTease').textContent.includes('900'));
    assert.equal(h.elements.get('beWishlist').style.display,'none');
  }
});
test('null and malformed save fields do not crash scenes or lose valid order references',()=>{
  const order={pr:{n:'Valid',t:2},material:'pla',units:1,pay:100};
  const h=host({version:2,checkpoint:{day:2,phase:'night',gold:120,stk:null,cons:42,upg:null,emp:[],stats:null,market:{pla:null},orders:[null,order],printers:[{id:0,busy:true,orderIndex:1},null]}});
  assert.equal(h.G.gold,120);assert.equal(h.G.orders.length,1);assert.equal(h.G.printers[0].order,h.G.orders[0]);
  h.start('night',2);assert.equal(h.G.phase,'night');assert.deepEqual(h.messages,[]);
});
test('legacy empty night reopens that day instead of leaving impossible missions',()=>{
  const h=host({version:2,checkpoint:{day:2,phase:'night',gold:77,orders:[],stk:{pla:4,parts:2}}});
  assert.equal(h.G.resumePhase,'day');h.start('day',2);
  assert.equal(h.G.day,2);assert.equal(h.G.gold,77);assert.equal(h.G.stk.pla.std,4);
});
test('denied storage cannot crash music, scenes, final or reset',()=>{
  const h=host(null,1366,768,{denyStorage:true});h.run('BGM.toggle()');h.start('day');
  assert.equal(h.doSave(h.G),false);finishThirdNight(h);
  assert.ok(h.elements.get('beSaveWarning').textContent);h.G.confirmReset();assert.deepEqual(h.messages,[]);
});
test('clean night layers and interactive anchors match the measured artwork in every night and resolution',()=>{
  const spec=JSON.parse(fs.readFileSync(path.join(root,'qa/night-room-art.json'),'utf8'));
  for(const [width,height] of [[1366,768],[1920,1080]]){
    for(const day of [1,2,3]){
      for(const count of [1,2,3]){
        const h=host(null,width,height),ns=h.sceneMap.Night;
        if(count>1)h.G.upg['unlock'+count]=true;
        ns.textures.exists=key=>key.startsWith('night_room_');
        const image=(x,y,key)=>({x,y,active:true,texture:{key},
          setOrigin(){return this;},setScale(s){this.scale=s;return this;},setDepth(){return this;},
          setVisible(){return this;},setTint(){return this;},setAlpha(){return this;},
          setTexture(key){this.texture={key};return this;}
        });
        ns.add=new Proxy(ns.add,{get:(target,key)=>key==='image'?image:target[key]});
        h.start('night',day);
        const variant=h.run('NIGHT_ROOM_OBJECT_VARIANTS['+count+']');
        assert.equal(variant.src,spec.outputs[count-1]);
        assert.equal(ns.nightObjectsLayer.texture.key,variant.key);
        assert.equal(ns.pObjs.length,count);
        assert.equal(ns.nightRoomLayers.filter(layer=>layer===ns.nightObjectsLayer).length,1);
        const room=ns.room();
        ns.pObjs.forEach((po,index)=>{
          const [x,y]=spec.printers[index].anchor;
          assert.ok(Math.abs(po.px-(room.ox+x*room.s))<1e-8);
          assert.ok(Math.abs(po.py-(room.oy+y*room.s))<1e-8);
          assert.equal(po.ct.x,po.px);assert.equal(po.ct.y,po.py);
        });
        ns.ensureUnlockedPrinterVisuals();
        assert.equal(ns.pObjs.length,count);assert.equal(ns.nightObjectsLayer.texture.key,variant.key);
        assert.deepEqual(h.messages,[]);
      }
    }
  }
});
test('printer labels follow day and night state, overlays and automatic payment without stale job text',()=>{
  const h=host(),ds=h.start('day');
  assert.match(ds.pGfx[0].lt.text,/LIBRE$/);
  const p=loadedJob(h,20);p.progress=.427;ds.updatePrinterVisual(0);
  assert.equal(ds.pGfx[0].lt.text,'P1 42%\nIMPRIME');
  h.G.block=true;const saved=JSON.stringify(p);ds.update(0,500);
  assert.equal(ds.pGfx[0].lt.text,'P1 42%\nPAUSA');assert.equal(JSON.stringify(p),saved);
  h.G.block=false;const ns=h.start('night',2);ns.refreshPrinterLabels();
  assert.equal(ns.pObjs[0].lb.text,'P1 42%\nIMPRIME');
  p._ev={id:'run'};p._pau=true;ns.refreshPrinterLabels();assert.match(ns.pObjs[0].lb.text,/RECARGA$/);
  p._ev=null;p._pau=false;h.G.lang='en';ns.refreshPrinterLabels();assert.match(ns.pObjs[0].lb.text,/PRINT$/);
  ns.forcedFails=[];p.progress=1;ns.completePrint(p);ns.refreshPrinterLabels();
  assert.equal(p.order,null);assert.equal(ns.pObjs[0].lb.text,'P1\nIDLE');
});
test('unlocking P2 refreshes the existing clean object layer without replacing an asset',()=>{
  const h=host(),ns=h.start('night',3);let texture=null;
  ns.textures.exists=key=>key===h.run('NIGHT_ROOM_OBJECT_VARIANTS[2].key');
  ns.nightObjectsLayer={active:true,setTexture:key=>texture=key};
  h.G.upg.unlock2=true;h.G.syncPrinters();ns.ensureUnlockedPrinterVisuals();
  assert.equal(texture,h.run('NIGHT_ROOM_OBJECT_VARIANTS[2].key'));assert.equal(ns.pObjs.length,2);
});

test('scripted campaign completes all six shifts with actual orders, purchases and gates',()=>{
  for(const overspend of [false,true])for(const [w,height] of [[1366,768],[1920,1080]]){
    const h=host(null,w,height);
    function wasteCash(){if(overspend)for(let i=0;i<100&&h.G.gold>=45;i++)h.G.buyConsumable('coffee');}
    function buy(mat,id){h.G.bStk(mat,h.run(`getFilPrice('${mat}','${id}')`),id);}
    function printOne(scene){
      const candidates=h.G.orders.map(o=>{
        const f=h.run(`cheapestBetaFilament('${o.material}')`);
        return {o,f,cost:o.filament?0:Math.max(0,o.units-h.run(`matStock('${o.material}')`))*h.run(`getFilPrice('${o.material}','${f.id}')`)};
      }).sort((a,b)=>a.cost-b.cost);
      const {o,f}=candidates[0];
      for(let tries=0;!o.filament&&h.run(`matStock('${o.material}')`)<o.units&&tries<50;tries++){
        const before=h.G.gold;buy(o.material,f.id);assert.notEqual(h.G.gold,before,'essential purchase could not progress');
      }
      const p=h.G.printers[0];assert.equal(scene.assignOrderToPrinter(p,o),true);
      // Invoke completion/result callbacks, not a claim of played mini-game input.
      for(let attempts=0;p.order&&attempts<5;attempts++){
        scene.completePrint(p);if(scene.aEv)h.G.nFix();
      }
      assert.equal(p.order,null);wasteCash();
    }
    for(let day=1;day<=3;day++){
      const ds=h.start('day',day);h.clock.jobs.clear();wasteCash();
      const needs=h.run('betaDayNeeds()');
      for(let i=0;i<needs.accept;i++){ds.spawn();assert.ok(ds.clients[0]);ds.acceptOrd(ds.clients[0],'man');}
      if(day===1)buy('pla','eco');
      if(day===2){const o=h.G.orders[0],f=h.run(`cheapestBetaFilament('${o.material}')`);buy(o.material,f.id);}
      for(let i=0;i<needs.produce;i++)printOne(ds);
      assert.equal(ds.dayObjectiveReady(),true,'day '+day+' could not close');
      h.clock.jobs.clear();ds.endDay();h.G.continueToNight();h.clock.advance(5000);
      assert.equal(ds.nextScene,'Night');
      const ns=h.start('night',day);h.clock.jobs.clear();
      if(day>1){ns.trigPwr(day===2?'norm':'long');ns.resPwr(true);}
      while(h.G.orders.length)printOne(ns);
      if(day===3)h.G._bUpg('unlock2');
      assert.equal(ns.nightObjectiveReady(),true,'night '+day+' could not close');
      h.clock.jobs.clear();ns.endNight();h.clock.advance(5000);
      if(day<3)assert.equal(h.G.day,day+1);
    }
    assert.equal(h.G.phase,'complete');assert.equal(h.G.day,3);assert.ok(h.G.betaResult);
    assert.deepEqual(h.messages,[]);
  }
});

test('job trapped on a broken printer is not counted as available income',()=>{
  const h=host();loadedJob(h);h.G.upg.unlock2=true;const ns=h.start('night',3);
  h.G.printers[0].broken=true;h.G.gold=0;
  assert.equal(h.run('betaCanEarn()'),false);ns.repairBrokenPrinter(0);
  assert.equal(h.G.printers[0].broken,false);assert.ok(h.G.gold<0);
});
test('old jobs using a locked material can buy only its entry grade',()=>{
  const h=host();const p=loadedJob(h);p.order.filament=null;p.order.material='resin';
  const ns=h.start('night',2);h.G.gold=0;
  assert.equal(h.run("betaShopAllows('resin','basic')"),true);
  assert.equal(h.run("betaShopAllows('resin','std')"),false);
  h.G.bStk('resin',0,'basic');assert.equal(h.prepareOrderMaterial(p.order),true);
  assert.equal(h.run("betaShopAllows('resin','basic')"),false);
  ns.completePrint(p);h.G.nFix();ns.completePrint(p);assert.equal(h.G.orders.length,0);
});

test('insufficient legacy night quota reopens day with valid jobs intact',()=>{
  const o={pr:{n:'Old job',t:2},material:'pla',units:1,pay:100};
  const h=host({version:2,checkpoint:{day:2,phase:'night',dayPrints:0,gold:50,orders:[o],printers:[]}});
  assert.equal(h.G.resumePhase,'day');assert.equal(h.G.orders.length,1);assert.equal(h.G.gold,50);
});
test('old assignments on locked printers return to queue without losing prepaid material',()=>{
  const o={pr:{n:'Old job',t:2},material:'pla',units:1,pay:100,filament:{id:'eco',rep:0}};
  const h=host({version:2,checkpoint:{day:2,phase:'night',dayPrints:2,orders:[o],printers:[{}, {id:8,orderIndex:0,busy:true}]}});
  const ns=h.start('night',2);assert.equal(h.G.printers[1].order,null);
  assert.equal(ns.assignOrderToPrinter(h.G.printers[0],h.G.orders[0]),true);
});
test('legacy power protection satisfies its task without demanding an impossible outage',()=>{
  for(const [day,upgrade] of [[2,'ups2'],[3,'gen'],[3,'solar']]){
    const h=host();h.G.upg[upgrade]=true;h.start('night',day);
    assert.equal(h.run("betaObjectives('night').find(t=>t.id==='power').done"),true);
  }
});

test('nozzle cannot start a second timer for the same attempt',()=>{
  const h=host();loadedJob(h);const ns=h.start('night');h.clock.jobs.clear();ns.trigEv('clog',true,0);
  h.G.startNozzleMini();const first=h.G._mini;h.G.startNozzleMini();
  assert.equal(h.G._mini,first);h.clock.advance(250);assert.equal(first.time,35750);
});
test('nozzle last valid hold wins once at the deadline',()=>{
  const h=host();loadedJob(h);const ns=h.start('night');h.clock.jobs.clear();ns.trigEv('clog',true,0);
  h.G.startNozzleMini();const m=h.G._mini;
  Object.assign(m,{phase:'filament',hits:2,hold:1000,power:76,time:250});
  h.clock.advance(500);
  assert.equal(h.G.nFixes,1);assert.equal(ns.aEv,null);assert.equal(h.G._mini,null);
});
test('nozzle can be completed through timed input handlers and can retry after timeout',()=>{
  const h=host();loadedJob(h);const ns=h.start('night');h.clock.jobs.clear();ns.trigEv('clog',true,0);
  h.G.startNozzleMini();h.clock.advance(36500);assert.equal(h.G._mini,null);assert.equal(ns.aEv._fails,1);
  h.G.startNozzleMini();const m=h.G._mini;
  // Input-only controller: fill to the safe zone, then tap as pressure decays.
  for(let i=0;h.G._mini&&i<180;i++){
    if(!m.done){
      for(let taps=0;m.power<74&&taps<12;taps++)h.key(m.phase==='needle'?'Alt':' ');
      assert.ok(m.power>=74,'timed input must raise pressure');
    }
    h.clock.advance(250);
  }
  assert.equal(h.G._mini,null);assert.equal(h.G.nFixes,1);assert.equal(ns.aEv,null);
  h.key('Alt');h.clock.advance(1000);assert.equal(h.G.nFixes,1);
});
test('bed rhythm can be won with timed arrow handlers on nights two and three',()=>{
  for(const day of [2,3]){
    const h=host();loadedJob(h);const ns=h.start('night',day);h.clock.jobs.clear();ns.trigEv('bed',true,day===2?0:1);
    h.G.startBedMini();const m=h.G._mini;
    for(let i=0;h.G._mini&&i<2200;i++){
      h.clock.advance(16);
      if(h.G._mini&&!m.done)for(const note of [...m.notes])if(Math.abs(h.clock.now-note.hitTime)<=16)h.key(['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'][note.dir]);
    }
    assert.equal(h.G._mini,null);assert.equal(h.G.nFixes,1);assert.equal(m.hits,m.needHits);
  }
});
test('bed misses, early taps and retry preserve the original failure',()=>{
  const h=host();loadedJob(h);const ns=h.start('night',2);h.clock.jobs.clear();ns.trigEv('bed',true,0);
  const ev=ns.aEv;h.G.startBedMini();const m=h.G._mini;
  h.key('ArrowUp');assert.equal(m.time,m.max-500);
  h.key('ArrowUp',true);assert.equal(m.time,m.max-500,'key repeat should not double-penalize');
  h.clock.advance(30000);assert.equal(h.G._mini,null);assert.equal(ns.aEv,ev);assert.equal(ev._fails,1);
  h.G.startBedMini();assert.equal(h.G._mini.ev,ev);assert.equal(h.G._mini.hits,0);
});
test('breaker keyboard sequences recover after errors and finish both long-outage rounds',()=>{
  for(const type of ['norm','long']){
    const h=host();loadedJob(h);const ns=h.start('night',3);h.clock.jobs.clear();ns.trigPwr(type);ns.openBk();
    // Only supply the dynamic button nodes used by _bk; no rendered UI is claimed.
    for(let i=0;i<4;i++)h.elements.set('bk'+i,h.context.document.createElement('button'));
    h.key('2');assert.equal(h.G._bkBusy,true);h.clock.advance(500);assert.equal(h.G._bkNext,0);
    const rounds=type==='long'?2:1;
    for(let round=0;round<rounds;round++){
      for(let i=0;i<4;i++){
        const seq=h.G._bkOrd[i]+1;h.key(String(seq));h.key(String(seq));
        h.clock.advance(650);assert.equal(h.G._bkNext,i+1);
      }
      h.clock.advance(round+1<rounds?700:750);
    }
    assert.equal(h.G.pActive,false);assert.equal(h.G.breakerFixes,1);assert.equal(h.G.block,false);
    h.G._bk(0);assert.equal(h.G.breakerFixes,1);
  }
});

test('menu and global shortcuts cannot dismiss or replace active night minigames',()=>{
  for(const type of ['clog','bed','breaker']){
    const h=host();loadedJob(h);const ns=h.start('night',type==='clog'?1:2);h.clock.jobs.clear();
    if(type==='breaker'){ns.trigPwr('norm');ns.openBk();}
    else{
      ns.trigEv(type,true,0);h.run('openGameMenu()');h.key('Escape');
      assert.equal(h.elements.get('evp').style.display,'block');
      if(type==='clog')h.G.startNozzleMini();else h.G.startBedMini();
    }
    const mini=h.G._mini,sequence=h.G._bkOrd,saved=h.storage.get(h.SK);
    h.run('openGameMenu()');for(const key of ['Escape','h','o','i','q'])h.key(key);
    assert.equal(h.G.menuOpen,false);assert.equal(h.G.block,true);assert.equal(h.G._mini,mini);
    assert.equal(h.G._bkOrd,sequence);assert.equal(h.storage.get(h.SK),saved);
    assert.equal(h.elements.get(type==='breaker'?'bkg':'miniGame').style.display,type==='breaker'?'block':'flex');
    assert.equal(h.elements.get('shop').style.display,'none');assert.equal(h.elements.get('sto').style.display,'none');
  }
});
test('saving during each night minigame reloads a clean shift checkpoint',()=>{
  for(const [day,type] of [[1,'clog'],[2,'bed'],[3,'breaker']]){
    const h=host();const p=loadedJob(h);h.G.dayPrints=2;
    const ns=h.start('night',day),savedBefore=JSON.parse(h.storage.get(h.SK));h.clock.jobs.clear();
    if(type==='breaker'){ns.trigPwr('long');ns.openBk();}
    else{ns.trigEv(type,true,0);if(type==='clog')h.G.startNozzleMini();else h.G.startBedMini();}
    h.G.gold=123;p.progress=.67;assert.equal(h.doSave(h.G),true);
    const saved=JSON.parse(h.storage.get(h.SK));assert.deepEqual(saved.checkpoint,savedBefore.checkpoint);
    const restored=host(saved);assert.equal(restored.G.resumePhase,'night');restored.start('night',day);
    assert.equal(restored.G.day,day);assert.equal(restored.G.block,false);assert.equal(restored.G.pActive,false);
    assert.ok(!restored.G._mini);assert.equal(restored.G.gold,savedBefore.checkpoint.gold);
    assert.equal(restored.G.printers[0].order,restored.G.orders[0]);
    assert.equal(restored.G.printers[0].progress,0);assert.equal(restored.G.printers[0]._pau,false);
    assert.equal(restored.G.printers[0]._ev,null);assert.deepEqual(restored.messages,[]);
  }
});
test('night shutdown retires minigame timers and pending breaker actions',()=>{
  for(const type of ['clog','bed','breaker']){
    const h=host();loadedJob(h);const ns=h.start('night',type==='clog'?1:2);h.clock.jobs.clear();
    if(type==='breaker'){
      ns.trigPwr('norm');ns.openBk();h.elements.set('bk0',h.context.document.createElement('button'));
      h.G._bk(0);assert.equal(h.G._bkBusy,true);
    }else{ns.trigEv(type,true,0);if(type==='clog')h.G.startNozzleMini();else h.G.startBedMini();}
    const mini=h.G._mini;
    ns.events.emit('shutdown');h.G.phase='day';
    if(mini){assert.equal(h.clock.jobs.has(mini.tick),false);assert.equal(h.G._mini,null);}
    h.clock.advance(40000);
    assert.equal(h.G.nFixes,0);assert.equal(h.G.breakerFixes,0);
    if(type==='breaker')assert.equal(h.G._bkNext,0,'retired action must not advance a round');
    assert.deepEqual(h.messages,[]);
  }
});
for(const input of ['keyboard','button'])test('manual save via '+input+' reports storage failure honestly and recovers',()=>{
  const buttonHandler=html.match(/<button\b[^>]*\bid="btnSave"[^>]*\bonclick="([^"]+)"/)[1];
  for(const lang of ['es','en']){
    const options={},h=host(null,1366,768,options);h.start('day');h.G.lang=lang;
    const previous=h.storage.get(h.SK),notices=[];h.context.showNotif=(...args)=>notices.push(args);
    const save=()=>input==='keyboard'?h.key('q'):h.run(buttonHandler);
    options.denyStorage=true;save();
    assert.equal(h.G.saveUnavailable,true);assert.equal(h.storage.get(h.SK),previous);
    assert.deepEqual(notices,[[h.run("tr('storageUnavailable')"),'error']]);
    options.denyStorage=false;notices.length=0;h.G.gold=99;save();
    assert.equal(h.G.saveUnavailable,false);
    assert.deepEqual(notices,[[h.run("tr('savedManual')"),'success']]);
    assert.deepEqual(JSON.parse(h.storage.get(h.SK)).checkpoint,JSON.parse(previous).checkpoint);
  }
});
test('cancelled or storage-denied reset preserves the live minigame and existing save',()=>{
  const options={},h=host(null,1366,768,options);loadedJob(h);const ns=h.start('night');h.clock.jobs.clear();
  ns.trigEv('clog',true,0);h.G.startNozzleMini();const mini=h.G._mini,saved=h.storage.get(h.SK);
  let reloads=0;h.context.location.reload=()=>reloads++;
  h.context.confirm=()=>false;h.G.confirmReset();
  assert.equal(reloads,0);assert.equal(h.storage.get(h.SK),saved);assert.equal(h.G._mini,mini);
  options.denyStorage=true;h.context.confirm=()=>true;h.G.confirmReset();
  assert.equal(reloads,0);assert.equal(h.storage.get(h.SK),saved);assert.equal(h.G._mini,mini);
  assert.equal(h.G.block,true);h.clock.advance(250);assert.equal(mini.time,35750);
});

test('day counter has a closed L joint and an open rear and side approach',()=>{
  for(const [w,h] of [[1366,768],[1920,1080]])for(const day of [1,2,3]){
    const env=host(null,w,h),ds=env.start('day',day);
    for(const [x,y] of [[154,152],[166,140],[90,169]]){
      const p=ds.rp(x,y);assert.equal(ds.hitsSolid(p.x,p.y),true,'counter must block '+x+','+y);
    }
    for(const [x,y] of [[154,110],[120,150],[173,140],[90,181]]){
      const p=ds.rp(x,y);assert.equal(ds.hitsSolid(p.x,p.y),false,'counter access must stay open '+x+','+y);
    }
  }
});
test('room solids match measured props instead of blocking their former positions',()=>{
  const checks={
    day:{solid:[[22,105],[48,105],[89,105],[236,102],[297,119],[375,119],[230,211]],free:[[35,135],[71,136],[294,140],[383,140],[250,210],[234,240]]},
    night:{solid:[[27,179],[107,124],[200,125],[394,202],[372,202],[250,203],[49,240],[340,240]],free:[[27,115],[335,175],[385,136],[338,224],[49,178]]}
  };
  for(const [w,h] of [[1366,768],[1920,1080]])for(const phase of ['day','night']){
    const env=host(null,w,h),scene=env.start(phase);
    assert.equal(scene.hitsSolid(scene.player.x,scene.player.y),false,'spawn inside solid');
    for(const kind of ['solid','free'])for(const [x,y] of checks[phase][kind]){
      const p=scene.rp(x,y);assert.equal(scene.hitsSolid(p.x,p.y),kind==='solid',phase+' '+kind+' '+x+','+y);
    }
  }
});
test('large movement deltas stop at furniture instead of tunneling through it',()=>{
  for(const [w,h] of [[1366,768],[1920,1080]])for(const phase of ['day','night']){
    const env=host(null,w,h),scene=env.start(phase),s=scene.room().s;
    const cases=phase==='day'
      ?[{from:[90,200],delta:[0,-140],axis:'y',min:178,max:180},{from:[90,140],delta:[0,80],axis:'y',min:153,max:155},{from:[180,140],delta:[-100,0],axis:'x',min:172,max:174}]
      :[{from:[202,230],delta:[0,-90],axis:'y',min:208.5,max:210.5},{from:[202,165],delta:[0,75],axis:'y',min:178,max:180},{from:[275,198],delta:[-145,0],axis:'x',min:260.5,max:262.5}];
    for(const c of cases){
      const p=scene.rp(...c.from);scene.player.setPosition(p.x,p.y);
      scene.movePlayer(c.delta[0]*s,c.delta[1]*s);
      const origin=c.axis==='x'?scene.room().ox:scene.room().oy,value=(scene.player[c.axis]-origin)/s;
      assert.ok(value>=c.min-1e-7&&value<=c.max+1e-7,phase+' '+c.axis+' stopped at '+value);
      assert.equal(scene.hitsSolid(scene.player.x,scene.player.y),false);
    }
  }
});
test('player can follow safe routes behind the day desk and around night workstations',()=>{
  const routes={
    day:[[184,110],[120,110],[120,150],[55,150],[120,150],[120,110],[184,110],[184,190],[90,190],[90,181]],
    night:[[270,235],[270,139],[155,139],[55,139],[55,117],[55,139],[140,139],[140,169],[203,169],[270,169],[270,223],[93,223]]
  };
  for(const [w,h] of [[1366,768],[1920,1080]])for(const phase of ['day','night'])for(const day of [1,2,3]){
    const env=host(null,w,h),scene=env.start(phase,day),step=scene.room().s;
    for(const [x,y] of routes[phase]){
      const target=scene.rp(x,y);
      for(let i=0;i<500&&(Math.abs(scene.player.x-target.x)>1e-7||Math.abs(scene.player.y-target.y)>1e-7);i++){
        scene.movePlayer(Math.max(-step,Math.min(step,target.x-scene.player.x)),Math.max(-step,Math.min(step,target.y-scene.player.y)));
        assert.equal(scene.hitsSolid(scene.player.x,scene.player.y),false,'route entered a solid');
      }
      assert.ok(Math.abs(scene.player.x-target.x)<1e-7&&Math.abs(scene.player.y-target.y)<1e-7,phase+' route blocked at '+x+','+y);
    }
  }
});
test('day PC is reachable from behind the counter at both scales and ignores repeated E',()=>{
  for(const [w,h] of [[1366,768],[1920,1080]]){
    const env=host(null,w,h),ds=env.start('day');env.clock.jobs.clear();
    const p=ds.rp(55,150);ds.player.setPosition(p.x,p.y);ds.update(0,0);
    assert.equal(ds.near&&ds.near.type,'shop');ds.input.keyboard.emit('keydown-E',{repeat:false});
    assert.equal(env.elements.get('shop').style.display,'block');env.G.cShop();
    ds.input.keyboard.emit('keydown-E',{repeat:true});assert.equal(env.elements.get('shop').style.display,'none');
    const pc=ds.IA.find(it=>it.type==='shop');ds.input.emit('pointerdown',{worldX:pc.x,worldY:pc.y});
    assert.equal(env.elements.get('shop').style.display,'block');assert.equal(env.G.stab,'up');
  }
});

test('movement slides along furniture and stays within room limits even with extreme deltas',()=>{
  for(const [w,h] of [[1366,768],[1920,1080]])for(const phase of ['day','night']){
    const env=host(null,w,h),scene=env.start(phase),r=scene.room();
    const start=phase==='day'?[173,125]:[47,140],p=scene.rp(...start);
    scene.player.setPosition(p.x,p.y);scene.movePlayer(-30*r.s,30*r.s);
    assert.ok(Math.abs(scene.player.y-scene.rp(0,start[1]+30).y)<1e-7,'blocked axis must not prevent sliding');
    assert.ok((scene.player.x-r.ox)/r.s>=(phase==='day'?172:45.5)-1e-7);
    for(const [dx,dy] of [[50000,50000],[-50000,-50000]]){
      scene.movePlayer(dx,dy);
      assert.equal(scene.hitsSolid(scene.player.x,scene.player.y),false);
      const x=(scene.player.x-r.ox)/r.s,y=(scene.player.y-r.oy)/r.s;
      assert.ok(x>=12-1e-7&&x<=(phase==='day'?401:408)+1e-7);
      assert.ok(y>=(phase==='day'?102:106)-1e-7&&y<=244+1e-7);
    }
  }
});

// Deterministic action timing/geometry only. No renderer, easing or Phaser lifecycle emulation.
function actionHarness(phase='day',scale=2.6,sprite=true){
  const h=host(),scene=h.start(phase),nodes=[],tweens=new Map();
  h.clock.jobs.clear();
  function node(type,x=0,y=0){
    const n={type,x,y,angle:0,scaleX:1,scaleY:1,alpha:1,originX:.5,originY:1,
      active:true,visible:true,depth:0,list:[],texture:{key:'player_down'},frame:{name:0},
      anims:{stop(){},resume(){}},
      play(key){this.anims.currentAnim={key};return this;},
      add(items){for(const c of [items].flat()){this.list.push(c);c.parentContainer=this;}return this;},
      setPosition(x,y){this.x=x;this.y=y;return this;},
      setScale(x,y=x){this.scaleX=x;this.scaleY=y;return this;},
      setAngle(a){this.angle=a;return this;},setAlpha(a){this.alpha=a;return this;},
      setOrigin(x,y=x){this.originX=x;this.originY=y;return this;},
      setDepth(d){this.depth=d;return this;},
      setTexture(key,frame){assert.ok(this.active,'do not restore a destroyed sprite');this.texture={key};this.frame={name:frame};return this;},
      destroy(fromScene=false){
        // Phaser's flag means scene shutdown, not recursive child destruction.
        assert.ok(!fromScene||!this.parentContainer,'attached effect must use destroy(), not destroy(true)');
        this.active=false;if(this.type==='container')for(const c of [...this.list])c.destroy();
        if(this.parentContainer)this.parentContainer.list=this.parentContainer.list.filter(c=>c!==this);},
      clear(){return this;},fillStyle(){return this;},fillRect(){return this;},
      lineStyle(){return this;},lineBetween(){return this;}
    };
    nodes.push(n);return n;
  }
  scene.add={
    graphics:()=>node('graphics'),container:(x,y)=>node('container',x,y),
    sprite:(x,y)=>node('sprite',x,y),
    rectangle:(x,y)=>node('particle',x,y),circle:(x,y)=>node('particle',x,y)
  };
  scene.time.delayedCall=(ms,fn)=>{const id=h.clock.add(fn,ms);return {remove:()=>h.clock.jobs.delete(id)};};
  scene.tweens={
    add(cfg){
      const targets=[cfg.targets].flat(),duration=cfg.duration||1,hold=cfg.hold||0;
      const cycle=duration*(cfg.yoyo?2:1)+hold,total=cycle*((cfg.repeat||0)+1);
      const began=h.clock.now,props=['x','y','angle','alpha'].filter(k=>typeof cfg[k]==='number');
      const initial=targets.map(t=>Object.fromEntries(props.map(k=>[k,t[k]])));
      let tick,done;
      const tween={stop(){h.clock.jobs.delete(tick);h.clock.jobs.delete(done);tweens.delete(tween);},remove(){this.stop();}};
      function sample(end=false){
        const t=end?cycle:((h.clock.now-began)%cycle);
        let f=t<=duration?t/duration:cfg.yoyo?(t<=duration+hold?1:1-(t-duration-hold)/duration):1;
        if(end)f=cfg.yoyo?0:1;
        targets.forEach((target,i)=>{for(const k of props)target[k]=initial[i][k]+(cfg[k]-initial[i][k])*f;});
        if(cfg.onUpdate)cfg.onUpdate(tween);
      }
      tick=h.clock.add(()=>sample(),10,true);
      done=h.clock.add(()=>{sample(true);tween.stop();if(cfg.onComplete)cfg.onComplete();},total);
      tweens.set(tween,targets);return tween;
    },
    killTweensOf(target){for(const [t,targets] of tweens)if(targets.includes(target))t.stop();}
  };
  scene.player=node('container',600,500);
  scene.pSp=sprite?node('sprite').setScale(scale):null;
  scene.pGr=sprite?null:node('graphics');
  scene.player.add(scene.pSp||scene.pGr);scene.pDir='left';
  scene.scene.isActive=()=>true;
  const other=h.sceneMap[phase==='day'?'Night':'Day'];other.scene.isActive=()=>false;
  scene.pObjs=[{px:scene.player.x+40,py:scene.player.y-20}];
  h.context.actionScene=scene;
  function world(n,x=0,y=0){
    const a=n.angle*Math.PI/180,px=x*n.scaleX,py=y*n.scaleY;
    const p={x:n.x+px*Math.cos(a)-py*Math.sin(a),y:n.y+px*Math.sin(a)+py*Math.cos(a)};
    return n.parentContainer?world(n.parentContainer,p.x,p.y):p;
  }
  return {...h,scene,nodes,tweens,node,world,play:kind=>h.run("playPlayerAction(actionScene,'"+kind+"')")};
}

test('player sprite starts at its movement baseline without a 24px jump',()=>{
  const a=actionHarness();a.scene.textures.exists=()=>true;a.scene.anims.exists=()=>true;
  const sp=a.run('createPlayerSprite(actionScene,actionScene.player,false)');
  assert.equal(sp.y,0);assert.equal(sp.originY,1);
});

test('action anchors follow sprite origins/scales and the actual procedural fallback',()=>{
  for(const scale of [2.6,2.45]){
    const a=actionHarness('day',scale);a.scene.pDir='down';
    a.scene.pSp.setPosition(3,-2);
    const anchor=a.run('playerActionAnchors(actionScene,1)');
    assert.equal(anchor.mouthX,3);assert.equal(anchor.mouthY,-2-33*scale);
    assert.equal(anchor.handX,3+8*scale);
    a.scene.pSp.setOrigin(0,0);
    const shifted=a.run('playerActionAnchors(actionScene,-1)');
    assert.equal(shifted.mouthX,3+25*scale);assert.equal(shifted.mouthY,-2+17*scale);
  }
  const a=actionHarness('day',1,false),fallback=a.run('playerActionAnchors(actionScene,-1)');
  assert.equal(fallback.mouthY,-9);assert.equal(fallback.handY,9);
});

test('cup rim stays at the mouth during every sip and its hand shares the pivot',()=>{
  for(const [phase,scale] of [['day',2.6],['night',2.45]])for(const side of ['left','right']){
    const a=actionHarness(phase,scale);a.scene.pDir=side;
    const prop=a.play('drink'),rig=prop.parentContainer;
    assert.notEqual(rig,a.scene.player,'cup and hand need their own pivot');
    assert.equal(rig.list.length,2);
    const mouth=a.world(a.scene.pSp,0,-33);
    a.clock.advance(280);
    for(let i=0;i<35;i++){
      a.clock.advance(20);
      const rim=a.world(prop,.5,-7);
      assert.ok(Math.hypot(rim.x-mouth.x,rim.y-mouth.y)<1e-7,'rim drifts away when tilting');
      assert.equal(a.scene.pSp.angle,0);assert.equal(a.scene.pSp.y,0);
    }
    a.clock.advance(1000);
    assert.equal(a.scene.pDir,side);assert.equal(a.scene._actBusy,false);
  }
});

test('repair keeps the grip connected and emits sparks at the moving tool, not the feet',()=>{
  const a=actionHarness('night',2.45),prop=a.play('repair'),rig=prop.parentContainer;
  assert.notEqual(rig,a.scene.player);
  const hand=rig.list.find(n=>n!==prop),unit=2.45*.6;
  let tip;
  const rectangle=a.scene.add.rectangle;
  a.scene.add.rectangle=(x,y)=>{tip=a.world(prop,0,-12);return rectangle(x,y);};
  // Compare at creation, before another tween update at the same timestamp.
  a.clock.advance(300);
  const spark=a.nodes.find(n=>n.type==='particle');
  assert.ok(spark,'repair emits feedback');
  assert.ok(Math.hypot(spark.x-tip.x,spark.y-tip.y)<1e-7);
  const grip=a.world(prop,0,4),wrist=a.world(hand);
  assert.ok(Math.hypot(grip.x-wrist.x,grip.y-wrist.y)<1e-7);
  assert.ok(spark.y<a.scene.player.y-10*unit);
  assert.equal(a.scene.pSp.x,0);assert.equal(a.scene.pSp.y,0);
});

test('finished actions remove their timers, effects and shutdown listeners across repeats',()=>{
  const a=actionHarness(),before=a.scene.events.listenerCount('shutdown');
  for(let i=0;i<14;i++){
    const action=i%2?'repair':'drink',prop=a.play(action);
    assert.ok(prop);assert.equal(a.play(action),null);
    a.clock.advance(2000);
    assert.equal(a.scene._actBusy,false);
    assert.equal(a.scene.events.listenerCount('shutdown'),before);
    assert.equal(a.clock.jobs.size,0);assert.equal(a.tweens.size,0);
    assert.equal(a.scene.player.list.length,1);
    assert.ok(a.nodes.filter(n=>n.type==='particle').every(n=>!n.active));
  }
});

test('shutdown cancels pending effects and does not restore destroyed player objects',()=>{
  for(const kind of ['drink','repair']){
    const a=actionHarness();a.play(kind);a.clock.advance(100);
    a.scene.player.destroy(true);a.scene.events.emit('shutdown');
    const count=a.nodes.length;
    a.clock.advance(2200);
    assert.equal(a.nodes.length,count,'no effects may be created after shutdown');
    assert.equal(a.scene._actBusy,false);assert.equal(a.clock.jobs.size,0);
    assert.equal(a.tweens.size,0);
  }
});

test('action timeout releases input if tweens stop, including missing sprite fallback',()=>{
  for(const kind of ['drink','repair'])for(const sprite of [true,false]){
    const a=actionHarness('day',2.6,sprite);a.scene.player.scaleX=sprite?1:-1;
    a.scene.tweens.add=()=>({stop(){},remove(){}});
    a.play(kind);a.clock.advance(2000);
    assert.equal(a.scene._actBusy,false);assert.equal(a.scene.player.list.length,1);
    assert.equal(a.clock.jobs.size,0);
    assert.ok(a.nodes.filter(n=>n.type==='particle').every(n=>!n.active));
  }
});

test('drink feedback changes no checkpoint or economy beyond the existing energy reward',()=>{
  for(const phase of ['day','night']){
    const a=actionHarness(phase,phase==='day'?2.6:2.45);
    a.G.energy=40;a.G.gold=321;
    const checkpoint=JSON.stringify(a.G._checkpoint),save=a.storage.get(a.SK);
    assert.ok(a.G._checkpoint);
    a.run("startTurbo(30000,25,'Cafe')");
    assert.equal(a.scene._actBusy,true);assert.equal(a.G.energy,65);
    a.clock.advance(2000);
    assert.equal(a.G.gold,321);assert.equal(a.G.energy,65);
    assert.equal(JSON.stringify(a.G._checkpoint),checkpoint);assert.equal(a.storage.get(a.SK),save);
    assert.equal(a.scene._actBusy,false);
  }
});

test('successful repair triggers one action without repeating costs or clearing blackout pause',()=>{
  const a=actionHarness('night',2.45),p=loadedJob(a);
  a.G.gold=250;a.G.stk.parts=3;a.G.pActive=true;a.G.upsLeft=0;
  const ev={printer:p,g:25,pts:1,ti:'Test repair'};
  p._ev=ev;p._pau=true;a.scene.aEv=ev;a.scene.juice=()=>{};
  const fixes=a.G.stats.fix;
  a.G.nFix();assert.equal(a.scene._actBusy,true);
  assert.equal(a.G.gold,225);assert.equal(a.G.stk.parts,2);
  assert.equal(p._pau,true);assert.equal(a.G.stats.fix,fixes+1);
  a.G.nFix();a.clock.advance(2000);
  assert.equal(a.G.gold,225);assert.equal(a.G.stk.parts,2);
  assert.equal(a.G.stats.fix,fixes+1);assert.equal(a.scene._actBusy,false);
});

test('saving during either player action reloads the same shift without an animation lock',()=>{
  for(const phase of ['day','night'])for(const kind of ['drink','repair']){
    const a=actionHarness(phase);if(phase==='night')loadedJob(a);
    a.setSaveCheckpoint(a.G,phase);
    const checkpoint=JSON.stringify(a.G._checkpoint);
    a.play(kind);a.clock.advance(100);a.doSave(a.G);
    assert.equal(JSON.stringify(a.G._checkpoint),checkpoint);
    const restored=host(JSON.parse(a.storage.get(a.SK)));
    assert.equal(restored.G.resumePhase,phase);
    const scene=restored.start(phase);
    assert.equal(scene._actBusy,false);assert.equal(restored.G.phase,phase);
  }
});

test('using coffee from inventory returns keyboard movement in both scenes',()=>{
  for(const phase of ['day','night']){
    const a=actionHarness(phase,phase==='day'?2.6:2.45),scene=a.scene;
    scene.pObjs=[];
    const start=scene.rp(270,200);scene.player.setPosition(start.x,start.y);
    a.G.energy=40;a.G.cons.coffee=2;a.G.showInventory('cons');
    assert.equal(a.G.block,true);
    a.G.useConsumable('coffee');
    assert.equal(a.elements.get('sto').style.display,'none');assert.equal(a.G.block,false);
    assert.equal(scene._actBusy,true);assert.equal(a.G.cons.coffee,1);
    scene.keys.d.isDown=true;scene.update(0,16);
    assert.equal(scene.player.x,start.x);
    a.clock.advance(2000);scene.update(2000,16);
    assert.equal(scene._actBusy,false);assert.ok(scene.player.x>start.x);
    assert.equal(a.G.cons.coffee,1);
  }
});

test('action input is released before effect cleanup and cannot unlock another overlay',()=>{
  for(const kind of ['drink','repair']){
    const a=actionHarness(),prop=a.play(kind),rig=prop.parentContainer;
    const destroy=rig.destroy;
    rig.destroy=function(fromScene){
      assert.equal(a.scene._actBusy,false,'visual cleanup must not own the input release');
      assert.notEqual(fromScene,true);
      return destroy.call(this,fromScene);
    };
    a.G.block=true;a.elements.get('shop').style.display='block';
    a.clock.advance(2000);
    assert.equal(a.scene._actBusy,false);assert.equal(a.G.block,true);
    assert.equal(a.elements.get('shop').style.display,'block');
    assert.equal(a.play(kind)!==null,true);
    a.clock.advance(2000);
  }
});

test('persistent panel labels follow ES and EN in both directions',()=>{
  const h=host();
  const expected={
    en:{shopTitle:'🔧 SHOP',stoContinue:'▶ CONTINUE',deK:'SHIFT CLOSED',energyLabel:'🧉 ENERGY',mhot:'⚡ TURBO ACTIVE'},
    es:{shopTitle:'🔧 TIENDA',stoContinue:'▶ CONTINUAR',deK:'CIERRE DE TURNO',energyLabel:'🧉 ENERGÍA',mhot:'⚡ TURBO ACTIVO'}
  };
  for(const lang of ['en','es','en']){
    h.run(`setLang('${lang}')`);
    for(const [id,text] of Object.entries(expected[lang])){
      assert.ok(h.elements.has(id),`missing panel label ${id}`);
      assert.equal(h.elements.get(id).textContent,text,id);
    }
  }
});

test('shop close control has a translated name without changing close actions',()=>{
  const h=host(),button=h.elements.get('shopClose');
  assert.ok(button,'shop close control needs a stable id');
  const attributes=new Map();button.setAttribute=(k,v)=>attributes.set(k,v);
  for(const [lang,label] of [['en','Close'],['es','Cerrar']]){
    h.run(`setLang('${lang}')`);
    assert.equal(attributes.get('aria-label'),label);assert.equal(button.title,label);
  }
  for(const [id,action] of [['shopClose','G.cShop()'],['stoContinue','G.cSto()']]){
    const tag=html.match(new RegExp('<button\\b[^>]*\\bid="'+id+'"[^>]*>'));
    assert.ok(tag,id);assert.ok(tag[0].includes('onclick="'+action+'"'),id+' action unchanged');
  }
});

test('language changes keep inventory and shop help aligned with their keyboard actions',()=>{
  const h=host(),help=Array.from({length:7},()=>({textContent:''}));
  h.start('day');
  const query=h.context.document.querySelectorAll;
  h.context.document.querySelectorAll=selector=>selector==='#keyHelp span'?help:query(selector);
  for(const [lang,lastTwo] of [['en',['I inventory','O shop']],['es',['I inventario','O tienda']]]){
    h.run(`setLang('${lang}')`);
    assert.deepEqual(help.slice(-2).map(el=>el.textContent),lastTwo);
    h.key('i');assert.equal(h.run("isShown('sto')"),true);assert.equal(h.G.block,true);
    h.key('Escape');assert.equal(h.G.block,false);
    h.key('o');assert.equal(h.run("isShown('shop')"),true);assert.equal(h.G.block,true);
    h.key('Escape');assert.equal(h.G.block,false);
  }
});

test('translated UI survives save/reload without altering either shift checkpoint',()=>{
  for(const phase of ['day','night']){
    const h=host();
    if(phase==='night'){loadedJob(h);h.G.dayPrints=2;}
    h.start(phase,2);h.setSaveCheckpoint(h.G,phase);
    const checkpoint=JSON.stringify(h.G._checkpoint);
    const before=JSON.stringify({gold:h.G.gold,orders:h.G.orders,stock:h.G.stk});
    h.run("setLang('en')");
    assert.equal(JSON.stringify(h.G._checkpoint),checkpoint);
    assert.equal(JSON.stringify({gold:h.G.gold,orders:h.G.orders,stock:h.G.stk}),before);
    assert.equal(h.G.block,false);assert.equal(h.G.phase,phase);
    const restored=host(JSON.parse(h.storage.get(h.SK)));
    assert.equal(restored.G.lang,'en');assert.equal(restored.G.resumePhase,phase);assert.equal(restored.G.day,2);
    assert.ok(restored.elements.has('stoContinue'));
    assert.equal(restored.elements.get('stoContinue').textContent,'▶ CONTINUE');
    restored.start(phase,2);assert.equal(restored.G.block,false);
  }
});

test('blocked scene updates freeze visuals without advancing clocks, jobs or input',()=>{
  for(const phase of ['day','night']){
    const h=host();loadedJob(h);const scene=h.start(phase),calls=[];
    const p=h.G.printers[0],sp={};
    if(phase==='day')scene.pGfx=[{sp}];else scene.pObjs=[{spr:sp}];
    h.context.setPrinterSpriteState=(sprite,printer)=>calls.push({sprite,printer});
    const before=JSON.stringify({timer:scene.timer,progress:p.progress,energy:h.G.energy,x:scene.player.x,y:scene.player.y});
    h.G.block=true;scene.update(0,1500);
    assert.equal(calls.length,1);assert.equal(calls[0].sprite,sp);assert.equal(calls[0].printer,p);
    assert.equal(JSON.stringify({timer:scene.timer,progress:p.progress,energy:h.G.energy,x:scene.player.x,y:scene.player.y}),before);
    assert.equal(h.G.block,true);
  }
});

let failed=0;
for(const [name,fn] of tests){try{fn();console.log('PASS '+name);}catch(e){failed++;console.error('FAIL '+name+'\n'+e.stack);}}
console.log(`${tests.length-failed}/${tests.length} passed. Logic only; real rendering/audio/file:// QA remains mandatory.`);
process.exitCode=failed?1:0;

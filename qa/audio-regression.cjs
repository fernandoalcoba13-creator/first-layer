// Media API contract tests with controllable promises. No browser or audible playback.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const flush=()=>new Promise(resolve=>setImmediate(resolve));

function audioHost(options={}){
  const listeners=new Map(),tracks=[],contexts=[],storage=new Map(),classes=new Set(),attributes=new Map();
  const button={textContent:'',title:'',classList:{toggle(k,v){v?classes.add(k):classes.delete(k);}},
    setAttribute(k,v){attributes.set(k,String(v));}};
  const backend={play:'resolve',constructError:false,resume:'resolve'};
  const document={documentElement:{},getElementById:id=>id==='musicBtn'?button:null,querySelectorAll:()=>[],
    addEventListener(name,fn,opts){if(!listeners.has(name))listeners.set(name,[]);listeners.get(name).push({fn,once:opts&&opts.once});}};
  const emit=(name,event={})=>{
    const handlers=listeners.get(name)||[];
    for(const h of [...handlers]){
      if(h.once)handlers.splice(handlers.indexOf(h),1);
      h.fn(event);
    }
  };
  const deferred=()=>{
    let resolve,reject;const promise=new Promise((ok,no)=>{resolve=ok;reject=no;});
    return {promise,resolve,reject};
  };
  class Audio{
    constructor(src){
      if(backend.constructError)throw Error('Audio unavailable');
      Object.assign(this,{src,paused:true,currentTime:0,playCalls:0,pauseCalls:0,requests:[]});
      tracks.push(this);
    }
    play(){
      this.playCalls++;
      if(backend.play==='throw')throw Error('Playback failed');
      if(backend.play==='reject'){this.paused=true;return Promise.reject(Error('NotAllowedError'));}
      this.paused=false;
      if(backend.play==='undefined')return;
      if(backend.play==='pending'){const d=deferred();this.requests.push(d);return d.promise;}
      return Promise.resolve();
    }
    pause(){this.paused=true;this.pauseCalls++;}
  }
  class AudioContext{
    constructor(){this.state='suspended';this.resumeCalls=0;this.currentTime=0;this.destination={};contexts.push(this);}
    resume(){
      this.resumeCalls++;
      if(backend.resume==='reject')return Promise.reject(Error('Resume denied'));
      this.state='running';return Promise.resolve();
    }
    createOscillator(){return {frequency:{},connect(){},start(){},stop(){}};}
    createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}};}
  }
  const G={lang:'es',phase:'day',gold:500,block:false,_checkpoint:{day:1,phase:'day'}};
  const context={console,document,G,Audio,AudioContext,doSave(){},isShown:()=>false,
    localStorage:{getItem(k){if(options.denyStorage)throw Error('Storage denied');return storage.get(k)||null;},
      setItem(k,v){if(options.denyStorage)throw Error('Storage denied');storage.set(k,v);}}};
  context.window=context;
  vm.createContext(context);
  for(const file of ['js/audio.js','js/i18n.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
  const {BGM,SFX}=vm.runInContext('({BGM,SFX})',context);
  return {BGM,SFX,G,tracks,contexts,backend,button,attributes,classes,storage,emit,run:code=>vm.runInContext(code,context)};
}

const tests=[];
function test(name,fn){tests.push([name,fn]);}

test('day and night remain exclusive and reuse the existing two tracks',async()=>{
  const h=audioHost(),b=h.BGM;
  b.playDay();await flush();const day=b.day;day.currentTime=12;
  b.playNight();await flush();const night=b.night;
  assert.equal(day.paused,true);assert.equal(night.paused,false);
  assert.equal(night.playbackRate,.82);assert.equal(night.volume,.22);
  b.playDay();await flush();
  assert.equal(night.paused,true);assert.equal(day.paused,false);assert.equal(day.currentTime,12);
  assert.equal(h.tracks.length,2);
});

test('keyboard input retries a rejected start after an earlier menu pointer gesture',async()=>{
  const h=audioHost();h.emit('pointerdown');
  h.backend.play='reject';h.BGM.playDay();await flush();
  h.backend.play='resolve';h.emit('keydown',{key:'Enter',repeat:false});await flush();
  assert.equal(h.BGM.day.paused,false);assert.equal(h.BGM.day.playCalls,2);
});

test('a later pointer gesture can retry instead of consuming the sole recovery attempt',async()=>{
  const h=audioHost();h.emit('pointerdown');
  h.backend.play='reject';h.BGM.playNight();await flush();
  h.emit('pointerdown');await flush();
  h.backend.play='resolve';h.emit('pointerdown');await flush();
  assert.equal(h.BGM.night.paused,false);assert.equal(h.BGM.night.playCalls,3);
});

test('held keys and repeated clicks do not duplicate pending or running playback',async()=>{
  const h=audioHost();h.backend.play='pending';h.BGM.playDay();
  const day=h.BGM.day;
  for(let i=0;i<10;i++){h.emit('pointerdown');h.emit('keydown',{key:'d',repeat:true});}
  assert.equal(day.playCalls,1);
  day.requests[0].resolve();await flush();
  for(let i=0;i<10;i++)h.emit('keydown',{key:'e',repeat:false});
  assert.equal(day.playCalls,1);
});

test('mute survives pending playback, phase changes and future gestures',async()=>{
  const h=audioHost();h.backend.play='pending';h.BGM.playDay();
  const day=h.BGM.day;h.BGM.toggle();
  day.requests[0].resolve();await flush();
  h.BGM.playNight();h.emit('pointerdown');h.emit('keydown',{key:'Enter'});
  assert.equal(h.BGM.on,false);assert.equal(day.paused,true);
  assert.equal(h.BGM.night,null);assert.equal(h.storage.get('first_layer_music'),'off');
  h.backend.play='resolve';h.BGM.toggle();await flush();
  assert.equal(day.paused,true);assert.equal(h.BGM.night.paused,false);
});

test('an old play result cannot clear the new pending attempt after mute/unmute',async()=>{
  const h=audioHost();h.backend.play='pending';h.BGM.playDay();
  const day=h.BGM.day;h.BGM.toggle();h.BGM.toggle();
  assert.equal(day.requests.length,2);
  const current=day._flPlayPending;
  day.requests[0].reject(Error('Aborted old request'));await flush();
  assert.equal(day._flPlayPending,current);
  day.requests[1].resolve();await flush();
  assert.equal(day._flPlayPending,null);assert.equal(day.paused,false);
});

test('stop cancels both tracks and subsequent gestures do not restart them',async()=>{
  const h=audioHost();h.BGM.playDay();h.BGM.playNight();await flush();
  h.BGM.day.currentTime=25;h.BGM.night.currentTime=9;h.BGM.stop();
  h.emit('pointerdown');h.emit('keydown',{key:'Enter'});await flush();
  assert.equal(h.BGM.phase,null);assert.equal(h.BGM.day.currentTime,0);assert.equal(h.BGM.night.currentTime,0);
  assert.equal(h.BGM.day.paused,true);assert.equal(h.BGM.night.paused,true);
});

test('missing Audio, sync playback failures and legacy return values do not break callers',async()=>{
  const h=audioHost();h.backend.constructError=true;
  assert.doesNotThrow(()=>h.BGM.playDay());assert.doesNotThrow(()=>h.BGM.playNight());
  h.backend.constructError=false;h.backend.play='throw';
  assert.doesNotThrow(()=>h.BGM.playDay());
  h.backend.play='undefined';assert.doesNotThrow(()=>h.emit('pointerdown'));
  await flush();assert.equal(h.BGM.day.paused,false);
});

test('a suspended effects context resumes on a gesture without creating extra contexts',async()=>{
  const h=audioHost();h.SFX.step();assert.equal(h.contexts.length,1);
  const context=h.contexts[0];assert.equal(context.state,'suspended');
  h.emit('keydown',{key:'e',repeat:false});await flush();
  assert.equal(context.state,'running');assert.equal(context.resumeCalls,1);
  h.emit('pointerdown');h.SFX.coin();await flush();assert.equal(h.contexts.length,1);
});

test('a rejected context resume is handled and can retry on the next gesture',async()=>{
  const h=audioHost();h.SFX.step();h.backend.resume='reject';
  h.emit('pointerdown');await flush();h.backend.resume='resolve';
  h.emit('keydown',{key:'Enter'});await flush();
  assert.equal(h.contexts[0].state,'running');assert.equal(h.contexts[0].resumeCalls,2);
});

test('ES/EN music label and accessible toggle state update without toggling playback',async()=>{
  const h=audioHost();h.BGM.playDay();await flush();
  h.run("setLang('en')");
  assert.match(h.button.textContent,/Music ON/);assert.equal(h.attributes.get('aria-pressed'),'true');
  const calls=h.BGM.day.playCalls;h.BGM.toggle();h.run("setLang('es')");
  assert.match(h.button.textContent,/M.sica OFF/);assert.equal(h.attributes.get('aria-pressed'),'false');
  assert.equal(h.BGM.day.playCalls,calls);
});

test('denied preferences storage does not change gameplay state or crash audio controls',async()=>{
  const h=audioHost({denyStorage:true}),before=JSON.stringify(h.G);
  h.BGM.playDay();h.BGM.toggle();h.BGM.playNight();h.BGM.toggle();await flush();
  assert.equal(JSON.stringify(h.G),before);assert.equal(h.BGM.night.paused,false);
});

(async()=>{
  let failed=0;
  for(const [name,fn] of tests){try{await fn();console.log('PASS '+name);}catch(e){failed++;console.error('FAIL '+name+'\n'+e.stack);}}
  console.log(`${tests.length-failed}/${tests.length} audio API tests passed. Browser playback and listening QA remain required.`);
  process.exitCode=failed?1:0;
})();

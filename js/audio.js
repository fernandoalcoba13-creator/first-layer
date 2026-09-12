// ═══ AUDIO ═══
// Web Audio oscillator-based SFX. Global: SFX
const SFX={_c:null,_g(){if(!this._c)this._c=new(window.AudioContext||window.webkitAudioContext)();},
unlock(){
  const c=this._c;if(!c||c.state!=='suspended'||this._resuming)return;
  this._resuming=true;
  const done=()=>{this._resuming=false;};
  try{const p=c.resume();if(p&&p.then)p.then(done,done);else done();}catch(e){done();}
},
_t(f,t,d,v=.12,dl=0){try{this._g();const o=this._c.createOscillator(),g=this._c.createGain();o.connect(g);g.connect(this._c.destination);o.type=t;o.frequency.value=f;g.gain.setValueAtTime(v,this._c.currentTime+dl);g.gain.exponentialRampToValueAtTime(.001,this._c.currentTime+dl+d);o.start(this._c.currentTime+dl);o.stop(this._c.currentTime+dl+d);}catch(e){}},
coin(){this._t(880,'square',.05,.1);this._t(1320,'square',.08,.1,.06);},
ok(){[440,550,660].forEach((f,i)=>this._t(f,'square',.08,.09,i*.06));},
err(){this._t(220,'sawtooth',.18,.12);this._t(160,'sawtooth',.22,.12,.1);},
fix(){[660,880,1100].forEach((f,i)=>this._t(f,'square',.09,.1,i*.08));},
hero(){[392,523,659,784,1047].forEach((f,i)=>this._t(f,'square',.12,.14,i*.055));this._t(1320,'triangle',.22,.08,.22);},
step(){this._t(110,'square',.025,.03);},
pwr(){this._t(400,'sawtooth',.05,.2);this._t(200,'sawtooth',.3,.15,.05);this._t(100,'sawtooth',.5,.1,.2);},
pwrOn(){[220,330,440,660].forEach((f,i)=>this._t(f,'square',.1,.1,i*.12));},
clk(){this._t(800,'square',.04,.15);},
alm(){this._t(880,'square',.1,.18);this._t(660,'square',.1,.18,.15);},
up(){[523,659,784,1047].forEach((f,i)=>this._t(f,'square',.14,.12,i*.1));}};
var BGM={
  on:(()=>{try{return localStorage.getItem('first_layer_music')!=='off';}catch(e){return true;}})(),
  phase:null,
  day:null,
  night:null,
  _btn(){return document.getElementById('musicBtn');},
  _syncBtn(){
    const b=this._btn();if(!b)return;
    const en=typeof G!=='undefined'&&G.lang==='en',label=en?'Music':'Música';
    b.textContent='♪ '+label+' '+(this.on?'ON':'OFF');b.classList.toggle('off',!this.on);
    b.setAttribute('aria-pressed',String(this.on));b.setAttribute('aria-label',label);
    b.title=this.on?(en?'Mute music':'Silenciar música'):(en?'Enable music':'Activar música');
  },
  // Day track plus a slower provisional night mix of the same licensed asset.
  daySrc:'assets/audio/day-theme.mp3',
  // Provisional night mix. Replace only this path when the final track arrives.
  nightSrc:'assets/audio/day-theme.mp3',
  _day(){if(!this.daySrc)return null;if(!this.day){this.day=new Audio(this.daySrc);this.day.loop=true;this.day.volume=.38;}return this.day;},
  _night(){if(!this.nightSrc)return null;if(!this.night){this.night=new Audio(this.nightSrc);this.night.loop=true;this.night.volume=.22;this.night.playbackRate=.82;}return this.night;},
  _pause(a,reset=false){
    if(!a)return;
    a._flPlayPending=null;
    try{a.pause();if(reset)a.currentTime=0;}catch(e){}
  },
  _resume(){
    if(!this.on||(this.phase!=='day'&&this.phase!=='night'))return;
    let a,request;
    try{
      a=this.phase==='day'?this._day():this._night();
      if(!a||a._flPlayPending||a.paused===false)return;
      request={};a._flPlayPending=request;
      // A muted or replaced request must not clear the next play attempt.
      const settled=()=>{if(a._flPlayPending===request)a._flPlayPending=null;};
      const p=a.play();
      if(p&&p.then)p.then(()=>{
        settled();if(!this.on||this[this.phase]!==a)this._pause(a);
      },settled);
      else settled();
    }catch(e){if(a&&a._flPlayPending===request)a._flPlayPending=null;}
  },
  playDay(){
    this.phase='day';this._syncBtn();
    this._pause(this.night);this._resume();
  },
  playNight(){
    this.phase='night';this._syncBtn();
    this._pause(this.day);this._resume();
  },
  stop(){this._pause(this.day,true);this._pause(this.night,true);this.phase=null;this._syncBtn();},
  toggle(){
    this.on=!this.on;try{localStorage.setItem('first_layer_music',this.on?'on':'off');}catch(e){}this._syncBtn();
    if(this.on)this._resume();
    else{this._pause(this.day);this._pause(this.night);}
  }
};
function unlockGameAudio(e){
  if(e&&e.repeat)return;
  SFX.unlock();
  // Let the music button apply the user's choice before requesting playback.
  if(e&&e.target&&e.target.closest&&e.target.closest('#musicBtn'))return;
  BGM._resume();
}
document.addEventListener('pointerdown',unlockGameAudio,{capture:true});
document.addEventListener('keydown',unlockGameAudio,{capture:true});
document.addEventListener('DOMContentLoaded',()=>BGM._syncBtn());

// ═══ AUDIO ═══
// Web Audio oscillator-based SFX. Global: SFX
const SFX={_c:null,_g(){if(!this._c)this._c=new(window.AudioContext||window.webkitAudioContext)();},
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
  on:localStorage.getItem('first_layer_music')!=='off',
  phase:null,
  day:null,
  night:null,
  _btn(){return document.getElementById('musicBtn');},
  _syncBtn(){const b=this._btn();if(!b)return;b.textContent=this.on?'♪ Música ON':'♪ Música OFF';b.classList.toggle('off',!this.on);},
  // El tema de día ya existe y suena. Para la noche: cuando tengas el .mp3, dejalo en
  // assets/audio/night-theme.mp3 y completá nightSrc acá. Mientras esté vacío NO se crea
  // ningún Audio ni se hace request — así no quedan 404 en la beta.
  daySrc:'assets/audio/day-theme.mp3',
  nightSrc:'', // 'assets/audio/night-theme.mp3'
  _day(){if(!this.daySrc)return null;if(!this.day){this.day=new Audio(this.daySrc);this.day.loop=true;this.day.volume=.38;}return this.day;},
  _night(){if(!this.nightSrc)return null;if(!this.night){this.night=new Audio(this.nightSrc);this.night.loop=true;this.night.volume=.32;}return this.night;},
  playDay(){
    this.phase='day';this._syncBtn();
    if(this.night)this.night.pause();
    if(!this.on)return;
    const a=this._day();if(a)a.play().catch(()=>{});
  },
  playNight(){
    this.phase='night';this._syncBtn();
    if(this.day)this.day.pause();
    if(!this.on)return;
    const a=this._night();if(a)a.play().catch(()=>{});
  },
  stop(){if(this.day){this.day.pause();this.day.currentTime=0;}if(this.night){this.night.pause();this.night.currentTime=0;}this.phase=null;this._syncBtn();},
  toggle(){
    this.on=!this.on;localStorage.setItem('first_layer_music',this.on?'on':'off');this._syncBtn();
    if(this.on){if(this.phase==='day')this.playDay();else if(this.phase==='night')this.playNight();}
    else{if(this.day)this.day.pause();if(this.night)this.night.pause();}
  }
};
document.addEventListener('pointerdown',()=>{if(BGM.on){if(BGM.phase==='day')BGM.playDay();else if(BGM.phase==='night')BGM.playNight();}},{once:true});
document.addEventListener('DOMContentLoaded',()=>BGM._syncBtn());

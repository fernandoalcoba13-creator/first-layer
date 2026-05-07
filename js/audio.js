// ═══ AUDIO ═══
// Web Audio oscillator-based SFX. Global: SFX
const SFX={_c:null,_g(){if(!this._c)this._c=new(window.AudioContext||window.webkitAudioContext)();},
_t(f,t,d,v=.12,dl=0){try{this._g();const o=this._c.createOscillator(),g=this._c.createGain();o.connect(g);g.connect(this._c.destination);o.type=t;o.frequency.value=f;g.gain.setValueAtTime(v,this._c.currentTime+dl);g.gain.exponentialRampToValueAtTime(.001,this._c.currentTime+dl+d);o.start(this._c.currentTime+dl);o.stop(this._c.currentTime+dl+d);}catch(e){}},
coin(){this._t(880,'square',.05,.1);this._t(1320,'square',.08,.1,.06);},
ok(){[440,550,660].forEach((f,i)=>this._t(f,'square',.08,.09,i*.06));},
err(){this._t(220,'sawtooth',.18,.12);this._t(160,'sawtooth',.22,.12,.1);},
fix(){[660,880,1100].forEach((f,i)=>this._t(f,'square',.09,.1,i*.08));},
step(){this._t(110,'square',.025,.03);},
pwr(){this._t(400,'sawtooth',.05,.2);this._t(200,'sawtooth',.3,.15,.05);this._t(100,'sawtooth',.5,.1,.2);},
pwrOn(){[220,330,440,660].forEach((f,i)=>this._t(f,'square',.1,.1,i*.12));},
clk(){this._t(800,'square',.04,.15);},
alm(){this._t(880,'square',.1,.18);this._t(660,'square',.1,.18,.15);},
up(){[523,659,784,1047].forEach((f,i)=>this._t(f,'square',.14,.12,i*.1));}};

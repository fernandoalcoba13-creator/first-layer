// ═══ BOOT ═══
// Phaser.Game instantiation. Last script to load.
const game=new Phaser.Game({
  type:Phaser.CANVAS,
  width:window.innerWidth,
  height:window.innerHeight,
  backgroundColor:'#07060f',
  scene:G.resumePhase==='night'?[NightScene,DayScene]:[DayScene,NightScene],
  loader:{imageLoadType:'HTMLImageElement'},
  scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},
  render:{pixelArt:true,antialias:false}
});

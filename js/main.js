// ═══ BOOT ═══
// Phaser.Game instantiation. Last script to load.
const game=new Phaser.Game({
  type:Phaser.AUTO,
  width:Math.min(window.innerWidth,940),
  height:Math.min(window.innerHeight,610),
  backgroundColor:'#07060f',
  scene:[DayScene,NightScene],
  scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
  render:{pixelArt:false,antialias:true}
});

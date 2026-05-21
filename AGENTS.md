# First Layer — Print Shop Management Game

## What this project is

First Layer is a 2D pixel art print shop management game inspired by Dave the Diver. The player runs a 3D printing shop: takes orders during the day, manages prints and failures during the night.

The game is in **Spanish** (UI, dialogs, story). Code/comments in English when possible.

## Team

- **Fernando** — design, code, integration (works with Claude Code)
- **Mati** — art (Aseprite + Crocotile 3D, delivers PNG + JSON atlases)

No backend developer. Solutions stay simple. Goal is to ship on **itch.io** first, then **Steam**.

## Tech stack

- HTML5 + CSS + vanilla JavaScript
- Phaser 3 loaded via CDN (no npm dependencies for the game itself)
- localStorage for save state
- No build system, no bundler, no transpiler — open `index.html` and it runs

## Project structure

```
first-layer/
├── index.html              Entry point — HTML structure + link CSS + scripts in order
├── styles.css              All UI styles (HUD, dialogs, title screen, pro panel)
├── js/
│   ├── audio.js            SFX (Web Audio oscillators) — global SFX
│   ├── data.js             Static data: CL, PR, NE, PE, UPG, EMP, STORY
│   ├── state.js            G state object + save/load + IIFE that applies save
│   ├── draw.js             Procedural drawPlayer/drawPrinter/drawClient/drawBG
│   ├── ui.js               showNotif, sLog, sHint, doTrans, shakeUI, market, mate, cDlg
│   ├── g-methods.js        G.bStk, G.nFix, G._bk, G.openShop, G.tab, G.showSto…
│   ├── pro-patch.js        v6 visual layer (proPanel, title screen, pulseWarn)
│   ├── main.js             Phaser.Game boot — last script to load
│   └── scenes/
│       ├── DayScene.js
│       └── NightScene.js
├── assets/
│   ├── characters/         player/, clients/, employees/
│   ├── printers/
│   ├── environment/        tiles/, props/, backgrounds/
│   ├── ui/                 icons/, panels/, buttons/
│   └── references/
├── CLAUDE.md               This file
├── README.md
└── .gitignore
```

## Script load order (do NOT reorder without checking)

```
1.  Phaser CDN
2.  js/audio.js              defines SFX
3.  js/data.js               defines CL, PR, NE, PE, UPG, EMP, STORY
4.  js/state.js              defines doSave, loadSave, G (uses CL/etc indirectly via save)
5.  js/draw.js               defines drawPlayer/Printer/Client/BG
6.  js/ui.js                 defines showNotif, sLog, sHint, market, mate, cDlg, doTrans, resetGame; attaches G.tomarMate
7.  js/g-methods.js          attaches G.bStk, G.nFix, G.openShop, G.tab, etc. (uses showNotif from ui.js)
8.  js/pro-patch.js          wraps showNotif, defines updateProPanel
9.  js/scenes/DayScene.js    class DayScene
10. js/scenes/NightScene.js  class NightScene
11. js/main.js               new Phaser.Game(...)
```

## Globals (must remain available across modules)

`G`, `SFX`, `CL`, `PR`, `NE`, `PE`, `UPG`, `EMP`, `STORY`, `game` (Phaser instance), `doSave`, `loadSave`, `showNotif`, `sLog`, `sHint`, `cDlg`, `doTrans`, `shakeUI`, `tickMate`, `updateMarket`, `getPrice`, `updateMateHUD`, plus drawing helpers. The HTML uses inline `onclick="G.foo()"` etc., so all these must be on `window`.

## Coding conventions

- Single global object `G` holds game state
- Save key: `first_layer_save` in localStorage
- Phaser scenes: `DayScene`, `NightScene`
- UI in HTML/CSS (overlay), game world in Phaser canvas
- Procedural graphics in `js/draw.js` will be progressively retired as sprite assets arrive

## Asset pipeline (when Mati delivers art)

1. Mati exports from Aseprite: `personaje.png` + `personaje.json` (Hash format, By rows, Tagged)
2. Files dropped into `assets/characters/clients/` (or wherever fits)
3. In scene `preload()`: `this.load.aseprite('marcos', 'assets/characters/clients/marcos.png', 'assets/characters/clients/marcos.json')`
4. In scene `create()`: `const sprite = this.add.sprite(x, y, 'marcos')`
5. Animations defined by Aseprite tags carry over: `sprite.play('walk')`, `sprite.play('idle')`

## Things to NOT do

- Don't introduce build tools (webpack, vite, esbuild). Keep it vanilla.
- Don't add npm dependencies for game logic. Phaser via CDN is enough.
- Don't break the localStorage save format without writing a migration.
- Don't redesign systems that already work. Progress > perfection.
- Don't suggest switching engines (Unity, Godot, Unreal). The decision is final: stay in Phaser.
- Don't convert to ES modules (`import`/`export`) — would break "open `index.html` and it runs".

## How I want help from Claude Code

- Direct, concrete code edits — show me what you're changing and why
- Honest pushback when something I'm proposing is a bad idea
- When refactoring, preserve exact behavior unless I ask otherwise
- When integrating new sprites, follow the asset pipeline above
- Spanish for any new in-game strings; English for code, variable names, comments
- Keep solutions simple — this is a 2-person indie, not an enterprise app
- Act as technical game designer + gameplay programmer, not enterprise consultant

## Definition of done for the prototype phase

- [x] Project split into `index.html` + `js/*` + `assets/`
- [ ] Pipeline test: one client (Marcos) integrated as sprite, working with all 5 animations
- [ ] Procedural `drawClient` retired in favor of sprites for at least 3 clients
- [ ] Player character replaced with sprite
- [ ] At least 1 printer replaced with sprite (idle + working)
- [ ] All current behavior preserved (economy, save/load, mate system, story beats)

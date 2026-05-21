# First Layer

2D pixel art game sobre gestionar un taller de impresión 3D. Inspirado en Dave the Diver: el jugador atiende clientes de día, supervisa impresoras y resuelve fallas de noche.

## Stack

- HTML5 + CSS + JavaScript vanilla
- Phaser 3 vía CDN
- localStorage para saves
- Sin build system, sin npm, sin bundlers

## Cómo correr

**Opción 1 — Doble click:**
Abrí `index.html` en cualquier navegador moderno.

**Opción 2 — Servidor local (recomendado para evitar problemas de CORS con futuros assets):**

```bash
# Python 3
python -m http.server 8000

# Node (sin instalar nada)
npx serve .

# PHP
php -S localhost:8000
```

Después abrí `http://localhost:8000`.

## Controles

- **WASD / Flechas** — mover
- **E** — interactuar (mostrador, tienda, stock, tablero, impresoras)
- **Click en 🧉** — tomar mate (turbo 30s)
- **Esc / H** — abrir/cerrar pantalla de título

## Estructura

```
first-layer/
├── index.html              Entry point
├── styles.css              UI styles
├── js/
│   ├── audio.js            SFX (Web Audio)
│   ├── data.js             CL, PR, NE, PE, UPG, EMP, STORY
│   ├── state.js            G + save/load
│   ├── draw.js             Procedural drawing helpers
│   ├── ui.js               Notifs, log, market, mate, transitions
│   ├── g-methods.js        Methods on G (shop, fix, breakers, story)
│   ├── pro-patch.js        v6 visual layer
│   ├── main.js             Phaser.Game boot
│   └── scenes/
│       ├── DayScene.js
│       └── NightScene.js
└── assets/
    ├── characters/         player, clients, employees
    ├── printers/
    ├── environment/        tiles, props, backgrounds
    ├── ui/                 icons, panels, buttons
    └── references/
```

Los scripts en `index.html` se cargan en un orden específico de dependencias. **No reordenar** sin verificar.

## Equipo

- **Fernando** — diseño, código, integración
- **Mati** — pixel art (Aseprite + Crocotile 3D)

## Licencia

MIT (TBD)

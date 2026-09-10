# noware — Hardware Playground

Live: https://aircube-explorer.vercel.app

Interactive PCB explorer and browser-based behavioral simulator, built from the actual [hyperchi/AirCube](https://github.com/hyperchi/AirCube) KiCad design.

## Use

- Search or click components to inspect positions, pad numbers, and nets.
- Highlight a net, flip the board, toggle traces/copper fills/labels, zoom, and drag to pan.
- Adjust TVOC, simulated true CO₂ (Pro), brightness, and power. Presets provide quick scenarios.
- Simulation settings persist in this browser. Export a scenario as JSON.
- Download original KiCad board and schematic files from the footer.

## Scope and provenance

The rendered board is **AirCube v1.1 Base**, extracted from upstream commit `bd857275c1f02efbec6942a96e433bde9d4d417e`: 52 footprints including mechanical/graphic items, 301 routed tracks, 53 vias, and 47 net entries. The source PCB does not contain the Pro sensors shown in the supplied schematic photographs. Pro inputs are virtual; switching model does not alter board geometry.

The renderer uses original pad positions/rotations, routing, vias, footprint linework, filled copper polygons, and edge cuts. It simplifies component body rendering and does not render custom footprint graphics/text or 3D STEP models. It is an explorer, not a PCB editor; changes do not modify manufacturing files.

`src/simulation.js` ports the TVOC and CO₂ threshold interpolation and worst-source selection from upstream `firmware/main/main.c`. Target hue follows the green-to-red firmware curve. Manual brightness is a visual approximation. This does **not** execute ESP32 firmware, solve electrical circuits, emulate sensor dynamics/warm-up, reproduce automatic ambient-light dimming or LED transition timing, or connect to live hardware. No AI credentials or backend are required. Scenario settings stay in browser local storage unless downloaded.

## Development

Requires Node 20.19+ or 22.12+ and Python 3 for regenerating board data.

```sh
npm ci
npm run dev
npm test
npm run build
python3 scripts/extract.py
node scripts/browser-check.mjs
```

The browser check requires Chrome and a running dev server. Set `TEST_URL` to check a deployed site. Vercel uses `npm run build` and serves `dist`.

## Attribution

Original AirCube hardware and firmware by [StuckAtPrototype](https://github.com/StuckAtPrototype/AirCube), obtained through hyperchi/AirCube. Original source files retain their upstream content. The extracted data, renderer, and JavaScript simulation port are additions for this explorer. Distributed under Apache-2.0; see LICENSE.

Production is deployed with the Vercel CLI. Automatic GitHub deployments are not connected: Vercel rejected the repository connection with the current integration access. To redeploy manually, run `npx vercel@latest --prod`.

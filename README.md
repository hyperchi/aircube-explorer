# noware — Hardware Playground

Primary domain: https://noware.so

Direct GCP access while DNS caches update: https://noware-1010426969452.us-central1.run.app

GCP project: `noware-hardware`. Cloud Run is deployed at https://noware-1010426969452.us-central1.run.app. Cloudflare routing is configured and the zone is active. The dedicated Google OAuth client is configured on Cloud Run. Cloudflare Universal SSL is active and HTTPS/login-page checks pass at its current IPs. Some local DNS caches still resolve the old Namecheap parking address. Real-account sign-in and logout remain to be verified. Hosting is exclusively Google Cloud Run with Cloudflare routing. See [hosting setup](infrastructure/README.md).

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

`src/simulation.js` ports the TVOC and CO₂ threshold interpolation and worst-source selection from upstream `firmware/main/main.c`. Target hue follows the green-to-red firmware curve. Manual brightness is a visual approximation. This does **not** execute ESP32 firmware, solve electrical circuits, emulate sensor dynamics/warm-up, reproduce automatic ambient-light dimming or LED transition timing, or connect to live hardware. No AI credentials are required. Production sign-in uses a small server authentication endpoint. Scenario settings stay in browser local storage unless downloaded.

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

The browser check requires Chrome and a running dev server. Set `TEST_URL` to check a deployed site. Cloud Run runs `node server.js` from the Dockerfile.

## Attribution

Original AirCube hardware and firmware by [StuckAtPrototype](https://github.com/StuckAtPrototype/AirCube), obtained through hyperchi/AirCube. Original source files retain their upstream content. The extracted data, renderer, and JavaScript simulation port are additions for this explorer. Distributed under Apache-2.0; see LICENSE.

Deploy using `./infrastructure/deploy-gcp.sh`; deploy Cloudflare routing with `npx wrangler@latest deploy --config infrastructure/wrangler.jsonc`.

## Noso Google sign-in

Production routes are protected by the Express server on Cloud Run, including board JSON, bundles, and source downloads. Only the login page, login script, favicon, authentication endpoint, and health endpoint are public. The API verifies Google's RS256 signature, issuer, audience, freshness, email verification, exact `hd=noso.so`, and a browser-bound login nonce. Merely entering an email address never grants access.

Verified identities receive a signed HttpOnly, Secure, SameSite=Lax cookie lasting exactly 30 days (2,592,000 seconds). Expiry is fixed at sign-in, not extended by page visits. Sign out clears this browser's session. Changing `SESSION_SECRET` invalidates all sessions. Workspace membership is checked at sign-in; removing a Workspace account does not revoke an existing 30-day session immediately.

Required server-only Cloud Run environment variables:

- `GOOGLE_CLIENT_ID`: OAuth web client in the dedicated noware project.
- `SESSION_SECRET`: independently generated random secret, at least 32 characters.
- `APP_ORIGIN`: `https://noware.so`.
- `ADDITIONAL_AUTH_ORIGINS`: `https://noware-1010426969452.us-central1.run.app` (legacy OAuth allowlist; browser visits to the direct GCP URL now redirect to the canonical domain).

Google Auth Platform lists both `https://noware.so` and `https://noware-1010426969452.us-central1.run.app` under the client's **Authorized JavaScript origins**. No redirect URI or Google client secret is needed for this GIS callback flow. The browser receives only the public client ID and a short-lived nonce.

`npm run dev` is for local UI development without the authentication server. Run `npm run build && npm start` to exercise the server locally. The existing public source repository remains public. Run `node scripts/auth-browser-check.mjs` to check production authentication; a real Noso account must complete the final sign-in check.

## Branding and canonical URLs

The login and explorer use the visual language of noso.so: Inter, white grid backgrounds, neutral borders, square controls and blue accents. `public/favicon.ico` is the exact favicon served by noso.so (downloaded from its declared S3 icon URL).

`/login` serves sign-in; `/login.html` permanently redirects there. Direct `*.run.app` requests redirect to `https://noware.so` with the path and query preserved, except `/api/health`. The Cloudflare worker overwrites `X-Noware-Public-Host` so forwarded requests avoid a redirect loop. This header only controls URL redirects, never authentication. Deploy the worker before the server when changing this routing.

# Dedicated noware hosting

Target project: `noware-hardware` (display name **noware**), separate from GTM.

The Node server and all app files run in Google Cloud Run. A small Cloudflare Worker forwards `noware.so` requests to the Cloud Run TLS origin without caching authenticated responses. It contains no sign-in or simulation implementation. This avoids a paid Google load balancer and leaves Cloudflare handling the custom-domain certificate.

Runtime configuration:
- `APP_ORIGIN=https://noware.so`
- `GOOGLE_CLIENT_ID`: a web OAuth client created in the new noware project, with `https://noware.so` in Authorized JavaScript origins.
- `SESSION_SECRET`: a new random secret in the noware project's Secret Manager.

Use a dedicated `noware-runtime` service account with accessor permission only on its session secret. Deploy the Dockerfile to Cloud Run with min instances 0 and a small maximum. `PORT` is supplied by Cloud Run. The app checks Google Workspace membership in `noso.so`; HTTP access to Cloud Run must reach that application login gate.

The service is deployed at `https://noware-1010426969452.us-central1.run.app`. Health endpoint: `/api/health`. Cloudflare route `noware.so/*` is deployed. The apex DNS record must be proxied (orange cloud); the Worker intercepts it and forwards to Cloud Run.

After deployment, set the actual Cloud Run URL in `wrangler.jsonc`, then deploy with `npx wrangler@latest deploy --config infrastructure/wrangler.jsonc`.

Cloudflare zone `31e0af31d6981634c0773920a2c60795` is active. Nameservers: `anita.ns.cloudflare.com`, `wilson.ns.cloudflare.com`.

Hosting is GCP and Cloudflare only. Verify the custom domain, Google sign-in, 30-day cookie, logout, and unauthenticated blocking of the board and downloads before considering the setup complete.

## Verified runtime configuration (September 10, 2026)

Latest revision: `noware-00004-zfb`. Public OAuth client ID: `1010426969452-fshg4587ckka7sms7i9lfgrf8kvnh5qv.apps.googleusercontent.com`; internal audience, `https://noware.so` JavaScript origin, created in `noware-hardware`. The client ID is configured in Cloud Run. Session secret remains a Secret Manager reference.

Cloud Run health, unauthenticated redirects, and public auth config were verified. Google sign-in button rendered without GSI errors in a browser test mapping noware.so requests directly to Cloud Run; this validates the Google origin registration but does not validate Cloudflare TLS or actual user sign-in. Cloudflare's dashboard reports Universal SSL **Pending Validation (TXT)** and says it handles validation automatically. Once TLS is active, run `node scripts/auth-browser-check.mjs` and perform a real Noso sign-in.

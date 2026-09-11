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

Latest revision: `noware-00007-fvz`. Public OAuth client ID: `1010426969452-fshg4587ckka7sms7i9lfgrf8kvnh5qv.apps.googleusercontent.com`; internal audience, `https://noware.so` JavaScript origin, created in `noware-hardware`. The client ID is configured in Cloud Run. Session secret remains a Secret Manager reference.

Cloud Run health, unauthenticated redirects, and public auth config were verified. Google sign-in button rendered without GSI errors in a browser test mapping noware.so requests directly to Cloud Run; this validates the Google origin registration but does not validate Cloudflare TLS or actual user sign-in. Cloudflare Universal SSL is now **Active**, expiring 2026-12-09. Live HTTPS and Google-button checks through the real Cloudflare endpoint pass. If local DNS is stale, run `TEST_RESOLVE_IP=104.21.51.204 node scripts/auth-browser-check.mjs`. This only overrides DNS to Cloudflare's actual IP; it does not bypass TLS or application routing. A real Noso sign-in and logout still need to be verified.

Direct GCP access is also enabled at `https://noware-1010426969452.us-central1.run.app`. It is registered on the same Google OAuth client and explicitly whitelisted through `ADDITIONAL_AUTH_ORIGINS`. This avoids stale custom-domain DNS caches while retaining all Noso account restrictions. Both the direct GCP page and the real Cloudflare endpoint passed the browser auth-gate/button/mobile-layout checks. Actual account sign-in remains to be checked by a Noso user.

## GitHub deployment

`.github/workflows/deploy-gcp.yml` deploys on pushes to `main`, or from **Actions → Deploy noware to GCP → Run workflow** (main branch). Pull requests run validation only. Every deployment requires a successful Node 22 production build and test run, builds the Dockerfile on GitHub, pushes a commit-tagged container to `noware-images` in us-central1, and deploys its immutable digest. A final smoke check verifies health, canonical routing, and protected assets. Existing Cloud Run runtime identity, secrets, environment, scale limits and public ingress are preserved.

Authentication uses GitHub OIDC and Google Workload Identity Federation; there is no service-account JSON key or exported login secret. Pool `github-actions`, provider `github`, deployment account `noware-github@noware-hardware.iam.gserviceaccount.com`. The provider restricts tokens by numeric repository ID 1364957698, numeric owner ID 9628522, main ref, the exact workflow path, and push/manual events. The deployment service account has Artifact Registry Writer on `noware-images`, Cloud Run Developer on service `noware`, Service Account User on `noware-runtime`, and Service Usage Consumer on the dedicated project. It has no direct Secret Manager access.

Repository Actions variables (already configured): `GCP_PROJECT_ID`, `GCP_REGION`, `CLOUD_RUN_SERVICE`, `ARTIFACT_REPOSITORY`, `GCP_DEPLOY_SERVICE_ACCOUNT`, `GCP_WORKLOAD_IDENTITY_PROVIDER`. These identifiers are configuration, not secret credentials. Temporary credentials produced by the auth action are excluded from Git/Docker/gcloud uploads and cleaned up by the action.

Workflow actions are pinned to commit SHAs. Deployments are serialized for each branch. A failed post-deploy check fails the run and does not automatically roll back. Cloudflare routing is managed separately; application deployment does not need Cloudflare credentials. Previous images/revisions remain available for rollback.

import { createRemoteJWKSet, jwtVerify, SignJWT } from 'jose';
import { randomBytes } from 'node:crypto';
import { createSession, readSession, sessionCookie, clearSessionCookie, getCookie, SESSION_COOKIE } from '../lib/session.js';
import { ALLOWED_DOMAIN, isNosoIdentity } from '../lib/auth-policy.js';
const googleKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const NONCE_COOKIE = '__Host-noware-challenge';
const clearNonce = `${NONCE_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const action = new URL(req.url, 'https://localhost').searchParams.get('action');
  const config = {secret: process.env.SESSION_SECRET, domain: ALLOWED_DOMAIN};
  const origin = process.env.APP_ORIGIN || 'https://aircube-explorer.vercel.app';
  if (req.method === 'POST' && req.headers.origin !== origin) return res.status(403).json({error: 'Request origin not allowed.'});
  if (action === 'logout' && req.method === 'POST') {
    res.setHeader('Set-Cookie', [clearSessionCookie(), clearNonce]);
    return res.status(200).json({ok: true});
  }
  if (!config.secret || config.secret.length < 32 || !process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).json({error: 'Google sign-in is being configured. Please try again later.'});
  }
  const signingKey = new TextEncoder().encode(config.secret);
  if (action === 'config' && req.method === 'GET') {
    const nonce = randomBytes(24).toString('base64url');
    const challenge = await new SignJWT({nonce}).setProtectedHeader({alg:'HS256'})
      .setIssuer('noware-login').setAudience('noware-login').setIssuedAt().setExpirationTime('10m').sign(signingKey);
    res.setHeader('Set-Cookie', `${NONCE_COOKIE}=${challenge}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=600`);
    return res.status(200).json({clientId:process.env.GOOGLE_CLIENT_ID, domain:ALLOWED_DOMAIN, nonce});
  }
  if (action === 'session' && req.method === 'GET') {
    const session = await readSession(getCookie(req.headers.cookie, SESSION_COOKIE), config);
    return session ? res.status(200).json(session) : res.status(401).json({error:'Sign-in required.'});
  }
  if (action === 'login' && req.method === 'POST') {
    if (!req.headers['content-type']?.startsWith('application/json')) return res.status(415).json({error:'JSON required.'});
    try {
      const credential = req.body?.credential;
      if (typeof credential !== 'string' || credential.length > 16000) throw new Error('Invalid credential');
      const {payload:challenge} = await jwtVerify(getCookie(req.headers.cookie, NONCE_COOKIE), signingKey, {
        algorithms:['HS256'], issuer:'noware-login', audience:'noware-login',
      });
      const {payload} = await jwtVerify(credential, googleKeys, {
        algorithms:['RS256'], issuer:['https://accounts.google.com','accounts.google.com'], audience:process.env.GOOGLE_CLIENT_ID,
        requiredClaims:['exp','iat','sub','email','email_verified','hd','nonce'], maxTokenAge:'10m',
      });
      if (!challenge.nonce || payload.nonce !== challenge.nonce) throw new Error('Invalid challenge');
      if (!isNosoIdentity(payload)) return res.status(403).json({error:'Please use your @noso.so Google Workspace account.'});
      const token = await createSession({email:payload.email,sub:payload.sub}, config);
      res.setHeader('Set-Cookie', [sessionCookie(token), clearNonce]);
      return res.status(200).json({ok:true});
    } catch {
      return res.status(401).json({error:'Sign-in could not be verified. Reload this page and try again.'});
    }
  }
  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({error:'Method not allowed.'});
}

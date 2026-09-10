import { SignJWT, jwtVerify } from 'jose';

export const SESSION_SECONDS = 30 * 24 * 60 * 60;
export const SESSION_COOKIE = '__Host-noware-session';
const issuer = 'noware';
const audience = 'noware-web';
function key(secret) {
  if (!secret || secret.length < 32) throw new Error('A strong session secret is required');
  return new TextEncoder().encode(secret);
}
export function allowedEmail(email, domain) {
  return typeof email === 'string' && typeof domain === 'string' &&
    /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain) &&
    email.toLowerCase().split('@').length === 2 &&
    email.toLowerCase().split('@')[1] === domain.toLowerCase();
}
// Call only after the identity provider has verified email ownership.
export async function createSession({ email, sub }, { secret, domain, now = Date.now() }) {
  if (!sub || !allowedEmail(email, domain)) throw new Error('Account is not allowed');
  const issued = Math.floor(now / 1000);
  return new SignJWT({ email: email.toLowerCase() })
    .setProtectedHeader({ alg: 'HS256' }).setSubject(sub)
    .setIssuer(issuer).setAudience(audience).setIssuedAt(issued)
    .setExpirationTime(issued + SESSION_SECONDS).sign(key(secret));
}
export async function readSession(token, { secret, domain, now = Date.now() }) {
  try {
    const { payload } = await jwtVerify(token, key(secret), {
      algorithms: ['HS256'], issuer, audience, currentDate: new Date(now),
    });
    if (!payload.sub || !allowedEmail(payload.email, domain) ||
      !Number.isInteger(payload.iat) || !Number.isInteger(payload.exp) ||
      payload.iat > Math.floor(now / 1000) || payload.exp - payload.iat > SESSION_SECONDS) return null;
    return { sub: payload.sub, email: payload.email };
  } catch { return null; }
}
export function sessionCookie(token) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_SECONDS}`;
}
export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
export function getCookie(header, name) {
  return (header || '').split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='))?.slice(name.length+1) || '';
}

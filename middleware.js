import { next } from '@vercel/functions';
import { readSession, getCookie, SESSION_COOKIE } from './lib/session.js';
import { ALLOWED_DOMAIN } from './lib/auth-policy.js';

export default async function middleware(request) {
  const url = new URL(request.url);
  if (['/login.html', '/login.js', '/api/auth'].includes(url.pathname)) return next();
  const session = await readSession(getCookie(request.headers.get('cookie'), SESSION_COOKIE), {
    secret: process.env.SESSION_SECRET, domain: ALLOWED_DOMAIN,
  });
  if (!session) {
    return new Response(null, {status: 303, headers: {
      Location: new URL('/login.html', request.url).toString(),
      'Cache-Control': 'private, no-store',
    }});
  }
  return next({headers: {'Cache-Control': 'private, no-store'}});
}

export const ALLOWED_DOMAIN = 'noso.so';
const GUEST_EMAILS = new Set(['shanshan0343@gmail.com']);
export const isAllowedGuest = email => typeof email === 'string' && GUEST_EMAILS.has(email.toLowerCase());
export function isNosoIdentity(payload) {
  return payload?.email_verified === true &&
    typeof payload?.sub === 'string' && payload.sub.length > 0 &&
    (isAllowedGuest(payload.email) || (payload.hd === ALLOWED_DOMAIN &&
      typeof payload.email === 'string' && /^[^@]+@noso\.so$/i.test(payload.email)));
}

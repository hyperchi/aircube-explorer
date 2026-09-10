export const ALLOWED_DOMAIN = 'noso.so';
export function isNosoIdentity(payload) {
  return payload?.email_verified === true && payload?.hd === ALLOWED_DOMAIN &&
    typeof payload?.sub === 'string' && payload.sub.length > 0 &&
    typeof payload?.email === 'string' && /^[^@]+@noso\.so$/i.test(payload.email);
}

const encoder = new TextEncoder();
export function base64url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
export function equal(left: string, right: string) {
  const length = Math.max(left.length, right.length);
  let result = left.length ^ right.length;
  for (let i = 0; i < length; i++) result |= (left.charCodeAt(i) || 0) ^ (right.charCodeAt(i) || 0);
  return result === 0;
}
export async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}
export function randomSecret() {
  return base64url(crypto.getRandomValues(new Uint8Array(32)));
}
export async function passwordDigest(password: string, salt: string, pepper: string) {
  // The Cloudflare secret is a server-only pepper; a database export alone
  // must not be enough to test password guesses. Keep it when migrating accounts.
  const key = await crypto.subtle.importKey("raw", encoder.encode(await sign(password, pepper)), "PBKDF2", false, ["deriveBits"]);
  // Workers' Web Crypto PBKDF2 implementation supports up to 100,000 iterations.
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", iterations: 100000, salt: encoder.encode(salt) }, key, 256);
  return base64url(new Uint8Array(bits));
}

/**
 * RFC 4122 UUID v4 using `crypto.getRandomValues()`.
 *
 * Do not use `crypto.randomUUID()` in browser code — it is a secure-context
 * API (HTTPS/localhost only) and throws on plain HTTP (AAP-76806).
 * `getRandomValues()` is available in non-secure contexts.
 */
export function generateUUID(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

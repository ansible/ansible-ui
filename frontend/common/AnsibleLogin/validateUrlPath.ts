/**
 * Validate that a string is a safe relative URL path.
 *
 * Uses the native URL API to parse and validate the path, which correctly
 * handles all valid URL characters (including '+' used in OAuth2 scopes).
 *
 * Rejects:
 * - Absolute URLs (https://example.com)
 * - Protocol-relative URLs (//example.com)
 * - Protocol attacks (javascript:, data:)
 * - Relative paths without leading slash (foo/bar)
 */
export function validateUrlPath(str: string | null): string | null {
  if (!str?.startsWith('/') || str.startsWith('//') || str.startsWith('/\\')) {
    return null;
  }

  try {
    const url = new URL(str, 'http://localhost');
    if (url.origin !== 'http://localhost') {
      return null;
    }
    return str;
  } catch {
    return null;
  }
}

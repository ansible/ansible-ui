/**
 * Read a nested property using dot-separated paths (e.g. `foo.bar`).
 * Replaces the `get-value` dependency for react-hook-form field names.
 */
export function getByPath(object: object, path: string): unknown {
  if (!path) return undefined;
  const segments = path.split('.');
  let current: unknown = object;
  for (const segment of segments) {
    if (current == null || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

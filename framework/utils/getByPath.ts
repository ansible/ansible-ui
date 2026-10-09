/**
 * Read a nested property using dot-separated paths (e.g. `foo.bar`).
 * Replaces the `get-value` dependency for react-hook-form field names.
 */
export function getByPath(object: object, path: string): unknown {
  if (!path) return undefined;
  if (
    typeof object === 'object' &&
    object !== null &&
    Object.prototype.hasOwnProperty.call(object, path)
  ) {
    return (object as Record<string, unknown>)[path];
  }
  const segments = path.split('.');
  let current: unknown = object;
  for (let index = 0; index < segments.length; index++) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    const record = current as Record<string, unknown>;
    const segment = segments[index];
    if (Object.prototype.hasOwnProperty.call(record, segment)) {
      current = record[segment];
      continue;
    }
    const remainingPath = segments.slice(index).join('.');
    return Object.prototype.hasOwnProperty.call(record, remainingPath)
      ? record[remainingPath]
      : undefined;
  }
  return current;
}

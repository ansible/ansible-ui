/**
 * Converts a given string path with segments separated by slashes (`/`)
 * into a dot-separated (`.`) path. Empty segments are filtered out.
 *
 * This is useful for converting URL paths into object paths,
 * which can be used to access nested properties with `set-value` or `get-value`.
 *
 * @param path - The input string path to be converted.
 * @returns The dot-separated path as a string.
 *
 * @example
 * ```typescript
 * dotPath('a/b/c'); // Returns 'a.b.c'
 * dotPath('/a//b/c/'); // Returns 'a.b.c'
 * ```
 */
export function dotPath(path: string): string {
  return path.split('/').filter(Boolean).join('.');
}

/**
 * Extracts the pathname from a given URL object and processes it using the `dotPath` function.
 *
 * @param url - The URL object from which the pathname will be extracted.
 * @returns The processed pathname as a string.
 */
export function dotPathname(url: URL): string {
  return dotPath(url.pathname);
}

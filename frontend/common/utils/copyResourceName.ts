/**
 * Copy/duplicate resource names must satisfy CleanTextMixin Tier 1
 * (django-ansible-base validate_resource_name):
 *   ^[\p{L}\p{N}_][\p{L}\p{N}\p{M}_ .@\-]{0,511}\Z
 *
 * Keep the historical `{name} @ …` marker (`@` is allowed) but use hyphens
 * in the timestamp. Colons in `HH:MM:SS` are not in the allowlist.
 */

/** Current ` @ HH-MM-SS` suffix, or the legacy ` @ HH:MM:SS` suffix. */
const COPY_NAME_SUFFIX_RE = / @ (?:[01]\d|2[0-3])[-:][0-5]\d[-:][0-5]\d$/;

function formatCopyTimestamp(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}-${minutes}-${seconds}`;
}

export function getCopyResourceName(name: string, now: Date = new Date()): string {
  return `${name} @ ${formatCopyTimestamp(now)}`;
}

export function hasCopyNamePattern(name?: string): boolean {
  return typeof name === 'string' && COPY_NAME_SUFFIX_RE.test(name);
}

export function getCopySourceName(name: string): string {
  return name.replace(COPY_NAME_SUFFIX_RE, '');
}

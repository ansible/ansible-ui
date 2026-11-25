/**
 * Helpers for the job template Limit field.
 *
 * Limit is an Ansible host pattern string, not a structured list. Only comma-separated
 * tokens that look like explicit host or group names can be edited with checkboxes.
 * Wildcards, exclusions, unions, intersections, ranges, regular expressions, and IPv6
 * addresses are left unchanged.
 */

export type LimitToken = { kind: 'simple'; name: string } | { kind: 'advanced'; raw: string };

const ADVANCED_PATTERN_CHARS = /[*?[\]!~:&:]/;

export function uniqueNames(names: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const name of names) {
    if (!seen.has(name)) {
      seen.add(name);
      unique.push(name);
    }
  }
  return unique;
}

export function isSimpleInventoryName(token: string): boolean {
  if (!token) return false;
  if (token.toLowerCase() === 'all') return false;
  if (ADVANCED_PATTERN_CHARS.test(token)) return false;
  return true;
}

export function parseLimitTokens(limit: string | undefined | null): LimitToken[] {
  const raw = limit ?? '';
  if (!raw.trim()) return [];

  const tokens: LimitToken[] = [];
  for (const part of raw.split(',')) {
    const token = part.trim();
    if (!token) continue;
    if (isSimpleInventoryName(token)) {
      tokens.push({ kind: 'simple', name: token });
    } else {
      tokens.push({ kind: 'advanced', raw: token });
    }
  }
  return tokens;
}

export function getSimpleLimitNames(limit: string | undefined | null): string[] {
  return uniqueNames(
    parseLimitTokens(limit)
      .filter((token): token is { kind: 'simple'; name: string } => token.kind === 'simple')
      .map((token) => token.name)
  );
}

export function hasAdvancedLimitPatterns(limit: string | undefined | null): boolean {
  return parseLimitTokens(limit).some((token) => token.kind === 'advanced');
}

function sameNameSet(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const rightSet = new Set(right);
  return left.every((name) => rightSet.has(name));
}

/**
 * Rebuild Limit after the picker applies.
 *
 * Matched simple names follow the checkboxes. Advanced patterns stay as typed.
 * Simple names that were not found in the current inventory stay unless the user
 * explicitly removed them in the picker. If the matched checkbox set is unchanged
 * and no unmatched names were removed, the original string is returned as-is.
 */
export function applyLimitSelection(
  currentLimit: string | undefined | null,
  selectedNames: string[],
  matchedNames: string[],
  removedUnmatchedNames: string[] = []
): string {
  const original = currentLimit ?? '';
  const selected = uniqueNames(selectedNames);
  const matchedSet = new Set(matchedNames);
  const removedUnmatched = new Set(removedUnmatchedNames);
  const tokens = parseLimitTokens(original);
  const originalMatched = uniqueNames(
    tokens
      .filter((token): token is { kind: 'simple'; name: string } => token.kind === 'simple')
      .map((token) => token.name)
      .filter((name) => matchedSet.has(name))
  );

  if (sameNameSet(selected, originalMatched) && removedUnmatched.size === 0) {
    return original;
  }

  const selectedSet = new Set(selected);
  const kept: string[] = [];
  const keptSimple = new Set<string>();

  for (const token of tokens) {
    if (token.kind === 'advanced') {
      kept.push(token.raw);
      continue;
    }
    if (removedUnmatched.has(token.name)) {
      continue;
    }
    if (matchedSet.has(token.name)) {
      if (selectedSet.has(token.name) && !keptSimple.has(token.name)) {
        kept.push(token.name);
        keptSimple.add(token.name);
      }
      continue;
    }
    if (!keptSimple.has(token.name)) {
      kept.push(token.name);
      keptSimple.add(token.name);
    }
  }

  for (const name of selected) {
    if (!keptSimple.has(name) && !removedUnmatched.has(name)) {
      kept.push(name);
      keptSimple.add(name);
    }
  }

  return kept.join(',');
}

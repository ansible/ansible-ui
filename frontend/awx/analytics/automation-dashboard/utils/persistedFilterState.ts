import { IFilterState } from '@ansible/ansible-ui-framework';
import { IDashboardFilterSet } from '../types';

/**
 * sessionStorage key prefixes under which the Automation Dashboard persists its
 * toolbar state, so switching to another tab (Leaderboards) and back does not
 * reset the filters or the selected filter set. Session-scoped on purpose: the
 * memory is cleared when the browser session ends.
 *
 * The active user's id is appended to the prefix so that logging out and back in
 * as a different user (same browser tab, so sessionStorage survives) does not
 * leak the previous user's filters.
 */
const FILTER_STATE_KEY_PREFIX = 'awx-automation-dashboard-filter-state';
const FILTER_SET_KEY_PREFIX = 'awx-automation-dashboard-filter-set';

/** sessionStorage key holding the persisted filter state for a given user. */
export function dashboardFilterStateKey(userId: number): string {
  return `${FILTER_STATE_KEY_PREFIX}:${userId}`;
}

/** sessionStorage key holding the persisted selected filter set for a given user. */
export function dashboardFilterSetKey(userId: number): string {
  return `${FILTER_SET_KEY_PREFIX}:${userId}`;
}

/**
 * Type guard for the {@link IFilterState} shape: a plain object whose every value
 * is an array of strings. Used to validate untrusted JSON before trusting it as
 * filter state (sessionStorage payloads, saved filter sets).
 */
export function isFilterStateShape(value: unknown): value is IFilterState {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.values(value as Record<string, unknown>).every(
      (entry) => Array.isArray(entry) && entry.every((item) => typeof item === 'string')
    )
  );
}

/**
 * Reads the filter state persisted for `userId`. Returns `undefined` when nothing
 * is stored, the payload is unparsable or malformed, or every filter is empty —
 * callers should then fall back to their own defaults.
 */
export function readPersistedFilterState(userId: number): Record<string, string[]> | undefined {
  try {
    const raw = sessionStorage.getItem(dashboardFilterStateKey(userId));
    if (!raw) return undefined;
    const parsed: unknown = JSON.parse(raw);
    if (!isFilterStateShape(parsed)) return undefined;
    const activeEntries = Object.entries(parsed).filter(
      (entry): entry is [string, string[]] => !!entry[1] && entry[1].length > 0
    );
    return activeEntries.length > 0 ? Object.fromEntries(activeEntries) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Persists the filter state for `userId` so it survives tab switches within the
 * session. Best-effort: sessionStorage can be unavailable (private browsing) or
 * full, in which case the write is silently skipped.
 */
export function writePersistedFilterState(
  filterState: IFilterState | undefined,
  userId: number
): void {
  if (!filterState) return;
  try {
    sessionStorage.setItem(dashboardFilterStateKey(userId), JSON.stringify(filterState));
  } catch {
    // sessionStorage unavailable or quota exceeded — persistence is optional
  }
}

/** Type guard for the {@link IDashboardFilterSet} shape used when reading untrusted JSON. */
export function isDashboardFilterSetShape(value: unknown): value is IDashboardFilterSet {
  if (value === null || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.name === 'string' &&
    typeof candidate.filters === 'string' &&
    typeof candidate.is_default === 'boolean'
  );
}

/**
 * Reads the selected filter set (the "Select report" dropdown value) persisted
 * for `userId`. Returns `undefined` when nothing is stored or the payload is
 * malformed.
 */
export function readPersistedFilterSet(userId: number): IDashboardFilterSet | undefined {
  try {
    const raw = sessionStorage.getItem(dashboardFilterSetKey(userId));
    if (!raw) return undefined;
    const parsed: unknown = JSON.parse(raw);
    return isDashboardFilterSetShape(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Persists the selected filter set for `userId` so the dropdown keeps its
 * selection after a tab switch. Passing `undefined` clears the stored selection.
 * Best-effort.
 */
export function writePersistedFilterSet(
  filterSet: IDashboardFilterSet | undefined,
  userId: number
): void {
  try {
    if (filterSet) {
      sessionStorage.setItem(dashboardFilterSetKey(userId), JSON.stringify(filterSet));
    } else {
      sessionStorage.removeItem(dashboardFilterSetKey(userId));
    }
  } catch {
    // sessionStorage unavailable or quota exceeded — persistence is optional
  }
}

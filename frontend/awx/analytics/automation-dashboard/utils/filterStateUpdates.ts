import { IFilterState } from '@ansible/ansible-ui-framework';

/**
 * Builds the custom period values `['custom', from?, to?]`.
 *
 * While there is a "to", an empty "from" is kept as `''` so the end date survives clearing the
 * start date (the "to" picker becomes read-only instead). Without a "to", an empty "from" is
 * dropped.
 */
export function toCustomPeriodValues(
  customValue: string,
  from: string | undefined,
  to: string | undefined
): string[] {
  if (to) return [customValue, from ?? '', to];
  return from ? [customValue, from] : [customValue];
}

/**
 * Removes one value of a filter; drops the filter key when no values are left. The selection
 * changes, so it is no longer the one "Select all" made.
 */
export function removeFilterValue(
  filterState: IFilterState,
  key: string,
  value: string
): IFilterState {
  const values = (filterState[key] ?? []).filter((v) => v !== value);
  const next = { ...filterState };
  delete next[allSelectedKey(key)];
  if (values.length === 0) delete next[key];
  else next[key] = values;
  return next;
}

/** Removes all values of a filter (and the "Select all" it was made by). */
export function removeFilter(filterState: IFilterState, key: string): IFilterState {
  const next = { ...filterState };
  delete next[key];
  delete next[allSelectedKey(key)];
  return next;
}

/** The options a "Select all" selected, and the search it was made for ('' without one). */
export interface AllSelectedScope {
  search: string;
  values: string[];
}

/**
 * The filter state key that tells a filter's selection was made by "Select all": it holds the
 * search (URI-encoded, so it has no comma that the query string would split it at) and a
 * fingerprint of the selection. Being part of the filter state, it is kept in the URL, the
 * session and saved reports; the API requests leave it out, as it is no toolbar filter.
 */
export function allSelectedKey(key: string) {
  return `${key}__all`;
}

/**
 * A short fingerprint of a selection, independent of its order: the count and an FNV-1a hash of
 * the sorted values. It tells whether the selection is still the one "Select all" made without
 * keeping a second copy of a selection of thousands of values.
 */
export function getSelectionFingerprint(values: readonly string[]) {
  let hash = 0x811c9dc5;
  // Sorted by code units, not by locale: a saved report is opened in other locales too.
  for (const value of [...values].sort((a, b) => (a < b ? -1 : Number(a > b)))) {
    // Per code point, so a character outside the BMP counts once.
    for (const character of value) {
      hash = Math.imul(hash ^ (character.codePointAt(0) ?? 0), 0x01000193);
    }
    // A separator, so ['ab', 'c'] and ['a', 'bc'] differ.
    hash = Math.imul(hash ^ 0x2c, 0x01000193);
  }
  return `${values.length}-${(hash >>> 0).toString(16)}`;
}

/**
 * Sets the values of a filter with `setter`; an empty selection drops the filter key, as
 * removing the last chip does. `allSelected` is set when "Select all" selected its options: the
 * selection is marked as made by it (for its search) while it is exactly those options. Any
 * other change drops the mark.
 */
export function selectFilterValues(
  filterState: IFilterState,
  key: string,
  setter: (values: string[] | undefined) => string[] | undefined,
  allSelected?: AllSelectedScope
): IFilterState {
  const values = setter(filterState[key] ?? []);
  if (!values?.length) return removeFilter(filterState, key);
  const next = { ...filterState, [key]: values };
  delete next[allSelectedKey(key)];
  if (allSelected) {
    const fingerprint = getSelectionFingerprint(values);
    if (fingerprint === getSelectionFingerprint(allSelected.values)) {
      next[allSelectedKey(key)] = [encodeURIComponent(allSelected.search), fingerprint];
    }
  }
  return next;
}

/**
 * The search of the "Select all" that made the filter's selection ('' without a search), while
 * the selection is still exactly the options it selected; otherwise `undefined`. `mark` is the
 * filter state value under `allSelectedKey`.
 */
export function getAllSelectedSearch(values: string[] | undefined, mark: string[] | undefined) {
  const [search, fingerprint] = mark ?? [];
  if (!values?.length || search === undefined || fingerprint === undefined) return undefined;
  if (getSelectionFingerprint(values) !== fingerprint) return undefined;
  try {
    return decodeURIComponent(search);
  } catch {
    // A malformed value, e.g. from an edited URL.
    return undefined;
  }
}

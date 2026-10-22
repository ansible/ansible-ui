import { FilterSelection, normalizeSelection } from './filterSelection';

/** What the toggle of the filter select tells about the selection. */
export type SelectionSummary =
  | { kind: 'none' }
  | { kind: 'all' }
  | { kind: 'allExcept'; count: number }
  | { kind: 'allWithExclusions' }
  | { kind: 'matching' }
  | { kind: 'custom' }
  | { kind: 'count'; count: number };

/** Summarizes the selection for the toggle of the filter select. */
export function getSelectionSummary(selection: FilterSelection): SelectionSummary {
  const { selectAll, ids, search, excluded, excludedSearch } = normalizeSelection(selection);
  const hasExclusions = excluded.length > 0 || excludedSearch.length > 0;
  if (selectAll) {
    if (!hasExclusions) return { kind: 'all' };
    if (excludedSearch.length === 0) return { kind: 'allExcept', count: excluded.length };
    return { kind: 'allWithExclusions' };
  }
  if (search.length > 0) {
    return ids.length === 0 && !hasExclusions ? { kind: 'matching' } : { kind: 'custom' };
  }
  if (ids.length === 0) return { kind: 'none' };
  // An excluded search term may deselect some of the IDs: their count is not known.
  if (excludedSearch.length > 0) return { kind: 'custom' };
  return { kind: 'count', count: ids.length };
}

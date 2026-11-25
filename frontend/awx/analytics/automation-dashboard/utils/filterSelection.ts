import { IFilterState, IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';

/**
 * The selection of a template, label, organization or project filter, described the way the
 * report API takes it instead of as a list of every selected ID:
 *
 *   (every item if `selectAll`  ∪  `ids`  ∪  matches(`search`))  \  (`excluded` ∪ matches(`excludedSearch`))
 *
 * The exclusions apply last, also to explicitly selected IDs. "Every item" is no filter on the
 * field, so it also covers the historical runs of deleted items. The search terms match the
 * names the way the filter options do (a case-insensitive "contains"), and are resolved on the
 * server on every request.
 */
export interface FilterSelection {
  selectAll: boolean;
  /** Explicitly selected IDs. */
  ids: string[];
  /** Search terms (trimmed) whose matches are selected. */
  search: string[];
  /** Explicitly deselected IDs. */
  excluded: string[];
  /** Search terms (trimmed) whose matches are deselected. */
  excludedSearch: string[];
}

export const EMPTY_SELECTION: FilterSelection = {
  selectAll: false,
  ids: [],
  search: [],
  excluded: [],
  excludedSearch: [],
};

/** An option of a filter: its value (the ID) and its name. */
export interface SelectionOption {
  value: string;
  label: string;
}

/**
 * What a change of the selection needs to know: the known name of an ID (`undefined` when it
 * is not known), and every option matching a search term (`undefined` when the load was
 * cancelled or failed).
 */
export interface SelectionDeps {
  getLabel: (value: string) => string | undefined;
  loadMatching: (search: string) => Promise<SelectionOption[] | undefined>;
}

/**
 * The filter state keys of a filter's selection. They are the report API parameter names (the
 * filter key is the API field), so the page URL and saved reports hold the selection the way it
 * is sent. The explicit IDs keep the filter key, as before.
 */
export function selectionStateKeys(key: string) {
  return {
    ids: key,
    selectAll: `select_all_${key}`,
    search: `search_${key}`,
    excluded: `excluded_${key}`,
    excludedSearch: `excluded_search_${key}`,
  };
}

/** The "Select all" mark of an earlier version; it is dropped when the selection changes. */
function legacyAllSelectedKey(key: string) {
  return `${key}__all`;
}

/** Every filter state key that belongs to the filter's selection. */
export function getSelectionStateKeys(key: string) {
  return [...Object.values(selectionStateKeys(key)), legacyAllSelectedKey(key)];
}

/**
 * The search terms of the filter state: they are kept URI-encoded, as the page URL joins and
 * splits a filter's values at commas. Malformed values (e.g. from an edited URL) are dropped.
 */
function decodeTerms(values: string[] | undefined) {
  const terms: string[] = [];
  for (const value of values ?? []) {
    try {
      const term = decodeURIComponent(value).trim();
      if (term) terms.push(term);
    } catch {
      // A malformed value, e.g. from an edited URL.
    }
  }
  return terms;
}

/** The selection of the filter `key`, read from the filter state. */
export function readSelection(filterState: IFilterState, key: string): FilterSelection {
  const keys = selectionStateKeys(key);
  // The IDs of the options are numbers; other values (e.g. from an edited URL) are dropped, so
  // the select and the chips show what the report request sends.
  const toIds = (values: string[] | undefined) => (values ?? []).filter((v) => /^\d+$/.test(v));
  return normalizeSelection({
    selectAll: filterState[keys.selectAll]?.[0] === 'true',
    ids: toIds(filterState[keys.ids]),
    search: decodeTerms(filterState[keys.search]),
    excluded: toIds(filterState[keys.excluded]),
    excludedSearch: decodeTerms(filterState[keys.excludedSearch]),
  });
}

/** The filter state with the selection of the filter `key`; an empty selection drops its keys. */
export function writeSelection(
  filterState: IFilterState,
  key: string,
  selection: FilterSelection
): IFilterState {
  const next = { ...filterState };
  for (const stateKey of getSelectionStateKeys(key)) delete next[stateKey];
  const normalized = normalizeSelection(selection);
  const keys = selectionStateKeys(key);
  const set = (stateKey: string, values: string[]) => {
    if (values.length > 0) next[stateKey] = values;
  };
  if (normalized.selectAll) next[keys.selectAll] = ['true'];
  set(keys.ids, normalized.ids);
  set(keys.search, normalized.search.map(encodeURIComponent));
  set(keys.excluded, normalized.excluded);
  set(keys.excludedSearch, normalized.excludedSearch.map(encodeURIComponent));
  return next;
}

/**
 * The filter state with the selections of the filters `keys` written back as they are read:
 * values that select nothing (e.g. an exclusion without a selection, a value that is no ID, the
 * mark of an earlier version) are dropped.
 */
export function normalizeSelectionState(filterState: IFilterState, keys: string[]): IFilterState {
  return keys.reduce(
    (state, key) => writeSelection(state, key, readSelection(state, key)),
    filterState
  );
}

/** The keys of the filters whose state is a selection (the async multi-select filters). */
export function getSelectionFilterKeys(toolbarFilters: IToolbarFilter[] | undefined) {
  return (toolbarFilters ?? [])
    .filter((filter) => filter.type === ToolbarFilterType.AsyncMultiSelect)
    .map((filter) => filter.key);
}

/** Whether nothing is selected: the filter is not active then. */
export function isSelectionEmpty(selection: FilterSelection) {
  return !selection.selectAll && selection.ids.length === 0 && selection.search.length === 0;
}

function unique(values: string[]) {
  return [...new Set(values)];
}

/** Lower-case, so the terms compare the way they match: case-insensitively. */
function fold(text: string) {
  return text.trim().toLowerCase();
}

/** Whether every match of `narrower` also matches `wider` (`narrower` contains `wider`). */
function isSubsumedBy(narrower: string, wider: string) {
  return fold(narrower).includes(fold(wider));
}

/**
 * Whether a name matches a search term the way the filter options do: a case-insensitive
 * "contains" of the trimmed term; an empty term matches every name.
 */
export function labelMatchesSearch(label: string, search: string) {
  return label.toLowerCase().includes(fold(search));
}

/** Whether the name of the ID is known and matches the search term. */
function isKnownMatch(id: string, search: string, getLabel: SelectionDeps['getLabel']) {
  const label = getLabel(id);
  return label !== undefined && labelMatchesSearch(label, search);
}

/** Drops search terms another one covers: they add nothing. */
function withoutSubsumedTerms(terms: string[]) {
  const folded = unique(terms.map((term) => term.trim()).filter(Boolean));
  return folded.filter(
    (term, index) =>
      !folded.some(
        (other, otherIndex) =>
          otherIndex !== index &&
          isSubsumedBy(term, other) &&
          // Of two terms that cover each other (same but for the case), the first one stays.
          (!isSubsumedBy(other, term) || otherIndex < index)
      )
  );
}

/**
 * The selection without what changes nothing: duplicates, terms other terms cover, explicit IDs
 * and terms under "every item", and exclusions when nothing is selected.
 */
export function normalizeSelection(selection: FilterSelection): FilterSelection {
  const excluded = unique(selection.excluded);
  const excludedSet = new Set(excluded);
  const result: FilterSelection = {
    selectAll: selection.selectAll,
    ids: selection.selectAll ? [] : unique(selection.ids).filter((id) => !excludedSet.has(id)),
    search: selection.selectAll ? [] : withoutSubsumedTerms(selection.search),
    excluded,
    excludedSearch: withoutSubsumedTerms(selection.excludedSearch),
  };
  // Only "every item" and the search terms select options that are not listed, so only they
  // need excluded IDs: explicitly selected IDs are simply not listed. An excluded search term
  // also deselects explicit IDs (e.g. ones whose name is not known), so it stays while there are
  // any.
  if (!result.selectAll && result.search.length === 0) {
    result.excluded = [];
    if (result.ids.length === 0) result.excludedSearch = [];
  }
  return result;
}

/**
 * Returns whether an option is selected (it needs its name for the search terms). The IDs are
 * looked up in sets, so checking many options against a large selection stays linear.
 */
export function createSelectionMatcher(selection: FilterSelection) {
  const ids = new Set(selection.ids);
  const excluded = new Set(selection.excluded);
  // Folded once, not for every option.
  const search = selection.search.map(fold);
  const excludedSearch = selection.excludedSearch.map(fold);
  return (option: SelectionOption) => {
    const label = option.label.toLowerCase();
    const isIncluded =
      selection.selectAll || ids.has(option.value) || search.some((term) => label.includes(term));
    if (!isIncluded) return false;
    return !excluded.has(option.value) && !excludedSearch.some((term) => label.includes(term));
  };
}

/** Whether two normalized selections are the same, regardless of the order of their values. */
export function isSameSelection(a: FilterSelection, b: FilterSelection) {
  const sameValues = (x: string[], y: string[]) => {
    if (x.length !== y.length) return false;
    const values = new Set(x);
    return y.every((value) => values.has(value));
  };
  return (
    a.selectAll === b.selectAll &&
    sameValues(a.ids, b.ids) &&
    sameValues(a.search, b.search) &&
    sameValues(a.excluded, b.excluded) &&
    sameValues(a.excludedSearch, b.excludedSearch)
  );
}

/** Whether the option is selected; see `createSelectionMatcher` for checking many options. */
export function isOptionSelected(selection: FilterSelection, option: SelectionOption) {
  return createSelectionMatcher(selection)(option);
}

/**
 * Turns the excluded search terms into the IDs they exclude, except the ones `keep` selects
 * again: a term excludes its matches after everything else, so an option matching it can only
 * be selected once it is listed instead. Resolves with `undefined` if a load was cancelled.
 */
async function expandExcludedSearch(
  selection: FilterSelection,
  terms: string[],
  deps: SelectionDeps,
  keep: (option: SelectionOption) => boolean
): Promise<FilterSelection | undefined> {
  let result = selection;
  // One after the other: a filter select runs one bulk load at a time.
  for (const term of terms) {
    const matches = await deps.loadMatching(term);
    if (!matches) return undefined;
    result = {
      ...result,
      excludedSearch: result.excludedSearch.filter((excludedTerm) => excludedTerm !== term),
      excluded: [
        ...result.excluded,
        ...matches.filter((option) => !keep(option)).map((option) => option.value),
      ],
    };
  }
  return result;
}

/** "Select all" without a search: every item, also the ones that are not loaded. */
export function selectEvery(): FilterSelection {
  return { ...EMPTY_SELECTION, selectAll: true };
}

/**
 * Selects or deselects one option without loading anything; `undefined` when an excluded search
 * term blocks selecting it, so its matches must be loaded (see `setOptionSelected`).
 */
export function trySetOptionSelected(
  selection: FilterSelection,
  option: SelectionOption,
  selected: boolean
): FilterSelection | undefined {
  const { value } = option;
  if (!selected) {
    const next = { ...selection, ids: selection.ids.filter((id) => id !== value) };
    if (isOptionSelected(next, option)) next.excluded = [...next.excluded, value];
    return normalizeSelection(next);
  }
  if (selection.excludedSearch.some((term) => labelMatchesSearch(option.label, term))) {
    return undefined;
  }
  return withOptionSelected(
    { ...selection, excluded: selection.excluded.filter((id) => id !== value) },
    option
  );
}

/** The selection with the option selected, once nothing excludes it any more. */
function withOptionSelected(selection: FilterSelection, option: SelectionOption) {
  if (isOptionSelected(selection, option)) return normalizeSelection(selection);
  return normalizeSelection({ ...selection, ids: [...selection.ids, option.value] });
}

/** Selects or deselects one option. Resolves with `undefined` if a needed load was cancelled. */
export async function setOptionSelected(
  selection: FilterSelection,
  option: SelectionOption,
  selected: boolean,
  deps: SelectionDeps
): Promise<FilterSelection | undefined> {
  const withoutLoad = trySetOptionSelected(selection, option, selected);
  if (withoutLoad) return withoutLoad;
  const { value } = option;
  const blockingTerms = selection.excludedSearch.filter((term) =>
    labelMatchesSearch(option.label, term)
  );
  const expanded = await expandExcludedSearch(
    { ...selection, excluded: selection.excluded.filter((id) => id !== value) },
    blockingTerms,
    deps,
    (match) => match.value === value
  );
  return expanded && withOptionSelected(expanded, option);
}

/** The selection with the search term, unless "every item" or another term covers it. */
function withSearchTerm(selection: FilterSelection, term: string) {
  if (selection.selectAll || selection.search.some((selected) => isSubsumedBy(term, selected))) {
    return normalizeSelection(selection);
  }
  return normalizeSelection({ ...selection, search: [...selection.search, term] });
}

/** The selection without the excluded terms whose matches are all matches of `term`. */
function withoutSubsumedExclusions(selection: FilterSelection, term: string): FilterSelection {
  return {
    ...selection,
    excludedSearch: selection.excludedSearch.filter((excluded) => !isSubsumedBy(excluded, term)),
  };
}

/**
 * Selects every option matching `search` without loading anything; `undefined` when the matches
 * must be loaded (see `selectMatching`): an excluded ID has no known name, or other excluded
 * terms remain.
 */
export function trySelectMatching(
  selection: FilterSelection,
  search: string,
  getLabel: SelectionDeps['getLabel']
): FilterSelection | undefined {
  const term = search.trim();
  if (!term) return selectEvery();
  const next = withoutSubsumedExclusions(selection, term);
  if (next.excludedSearch.length > 0 || next.excluded.some((id) => getLabel(id) === undefined)) {
    return undefined;
  }
  return withSearchTerm(
    { ...next, excluded: next.excluded.filter((id) => !isKnownMatch(id, term, getLabel)) },
    term
  );
}

/**
 * Selects every option matching `search`, keeping the rest of the selection. The exclusions that
 * would still hold some of its matches are dropped; for that the matches are loaded when the
 * names of the excluded IDs are not known, or when other excluded search terms remain. Resolves
 * with `undefined` if a needed load was cancelled.
 */
export async function selectMatching(
  selection: FilterSelection,
  search: string,
  deps: SelectionDeps
): Promise<FilterSelection | undefined> {
  const withoutLoad = trySelectMatching(selection, search, deps.getLabel);
  if (withoutLoad) return withoutLoad;
  const term = search.trim();
  const matches = await deps.loadMatching(term);
  if (!matches) return undefined;
  const matchValues = new Set(matches.map((option) => option.value));
  const next = withoutSubsumedExclusions(selection, term);
  next.excluded = next.excluded.filter((id) => !matchValues.has(id));
  // Only the excluded terms that share matches with the search must be listed instead.
  const overlapping = next.excludedSearch.filter((excluded) =>
    matches.some((option) => labelMatchesSearch(option.label, excluded))
  );
  const expanded = await expandExcludedSearch(next, overlapping, deps, (option) =>
    matchValues.has(option.value)
  );
  return expanded && withSearchTerm(expanded, term);
}

/** Deselects every option matching `search`, keeping the rest of the selection. */
export function deselectMatching(
  selection: FilterSelection,
  search: string,
  getLabel: SelectionDeps['getLabel']
): FilterSelection {
  const term = search.trim();
  if (!term) return EMPTY_SELECTION;
  const next: FilterSelection = {
    ...selection,
    // Terms whose matches are all deselected now select nothing.
    search: selection.search.filter((selected) => !isSubsumedBy(selected, term)),
    ids: selection.ids.filter((id) => !isKnownMatch(id, term, getLabel)),
  };
  // Matches of the search may still be selected by "every item", another term or an ID whose
  // name is not known: the search is excluded then.
  const mayStillSelectMatches =
    next.selectAll || next.search.length > 0 || next.ids.some((id) => getLabel(id) === undefined);
  if (
    mayStillSelectMatches &&
    !next.excludedSearch.some((excluded) => isSubsumedBy(term, excluded))
  ) {
    next.excludedSearch = [...next.excludedSearch, term];
    // Excluded IDs that match the search are excluded by it now.
    next.excluded = next.excluded.filter((id) => !isKnownMatch(id, term, getLabel));
  }
  return normalizeSelection(next);
}

/** The scope of the bulk checkbox: see `getScopeState`. */
export interface SelectionScope {
  /** The search; the scope is every option without one. */
  search: string;
  /** The loaded options of the scope. */
  options: SelectionOption[];
  /** Whether `options` are every option of the scope. */
  isEveryOptionLoaded: boolean;
  getLabel: SelectionDeps['getLabel'];
  /** The matcher of the selection, when the caller has one (see `createSelectionMatcher`). */
  isSelected?: (option: SelectionOption) => boolean;
}

/**
 * Whether every, some or none of the options in the scope of the bulk checkbox are selected:
 * every option without a search, the options matching it with one.
 */
export function getScopeState(
  selection: FilterSelection,
  scope: SelectionScope
): 'all' | 'some' | 'none' {
  const { options, isEveryOptionLoaded, getLabel } = scope;
  if (isSelectionEmpty(selection)) return 'none';
  const term = scope.search.trim();
  const isSelected = scope.isSelected ?? createSelectionMatcher(selection);
  const isEveryLoadedSelected = options.length > 0 && options.every(isSelected);
  if (isEveryOptionLoaded && isEveryLoadedSelected) return 'all';
  // Every option of the scope is loaded and none of them is selected (e.g. all excluded).
  if (isEveryOptionLoaded && !options.some(isSelected)) {
    return 'none';
  }
  if (!term) {
    const hasExclusions = selection.excluded.length > 0 || selection.excludedSearch.length > 0;
    return selection.selectAll && !hasExclusions ? 'all' : 'some';
  }
  // Every match of the search is excluded by an excluded term (the exclusions apply last).
  if (selection.excludedSearch.some((excluded) => isSubsumedBy(term, excluded))) return 'none';
  const isCovered =
    selection.selectAll || selection.search.some((selected) => isSubsumedBy(term, selected));
  // An excluded ID of an unknown name, or an excluded term, may exclude matches not loaded.
  const mayExcludeMatches =
    selection.excludedSearch.length > 0 ||
    selection.excluded.some((id) => {
      const label = getLabel(id);
      return label === undefined || labelMatchesSearch(label, term);
    });
  if (isCovered && isEveryLoadedSelected && !mayExcludeMatches) return 'all';
  if (isCovered || options.some(isSelected)) return 'some';
  return 'none';
}

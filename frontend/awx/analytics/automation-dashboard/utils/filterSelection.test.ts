import { describe, expect, it, vi } from 'vitest';
import {
  deselectMatching,
  EMPTY_SELECTION,
  FilterSelection,
  getScopeState,
  getSelectionStateKeys,
  isOptionSelected,
  isSameSelection,
  isSelectionEmpty,
  labelMatchesSearch,
  normalizeSelection,
  normalizeSelectionState,
  readSelection,
  selectEvery,
  selectionStateKeys,
  selectMatching,
  SelectionDeps,
  SelectionOption,
  setOptionSelected,
  writeSelection,
} from './filterSelection';

const OPTIONS: SelectionOption[] = [
  { value: '1', label: 'Deploy prod' },
  { value: '2', label: 'Deploy test' },
  { value: '3', label: 'Backup prod' },
  { value: '4', label: 'Cleanup' },
];
const [, deployTest, backupProd, cleanup] = OPTIONS;

function selection(overrides: Partial<FilterSelection> = {}): FilterSelection {
  return { ...EMPTY_SELECTION, ...overrides };
}

/** Deps that know every option's name and load the matches of a search from `OPTIONS`. */
function makeDeps(overrides: Partial<SelectionDeps> = {}) {
  const loadMatching = vi.fn((search: string) =>
    Promise.resolve(OPTIONS.filter((option) => labelMatchesSearch(option.label, search)))
  );
  const deps: SelectionDeps = {
    getLabel: (value) => OPTIONS.find((option) => option.value === value)?.label,
    loadMatching,
    ...overrides,
  };
  return { deps, loadMatching: deps.loadMatching as typeof loadMatching };
}

/** The values of `OPTIONS` the selection selects. */
function selectedValues(value: FilterSelection) {
  return OPTIONS.filter((option) => isOptionSelected(value, option)).map((option) => option.value);
}

describe('filter state', () => {
  it('uses the report API parameter names as filter state keys', () => {
    expect(selectionStateKeys('template')).toEqual({
      ids: 'template',
      selectAll: 'select_all_template',
      search: 'search_template',
      excluded: 'excluded_template',
      excludedSearch: 'excluded_search_template',
    });
    expect(getSelectionStateKeys('label')).toContain('label__all');
  });

  it('writes and reads a selection, with search terms URI-encoded', () => {
    const value = selection({ search: ['a,b'], excluded: ['3'], excludedSearch: ['x y'] });
    const state = writeSelection({ period: ['last_7_days'] }, 'template', value);

    expect(state).toEqual({
      period: ['last_7_days'],
      search_template: ['a%2Cb'],
      excluded_template: ['3'],
      excluded_search_template: ['x%20y'],
    });
    expect(readSelection(state, 'template')).toEqual(value);
  });

  it('drops every key of the filter (also the earlier "Select all" mark) for an empty selection', () => {
    const state = {
      template: ['1'],
      template__all: ['', '1-abc'],
      select_all_template: ['true'],
      label: ['5'],
    };

    expect(writeSelection(state, 'template', EMPTY_SELECTION)).toEqual({ label: ['5'] });
  });

  it('drops values that are no ID, e.g. from an edited URL', () => {
    expect(
      readSelection({ template: ['abc', '5', ''], excluded_template: ['x'] }, 'template')
    ).toEqual(selection({ ids: ['5'] }));
  });

  it('drops the values of the filters that select nothing', () => {
    expect(
      normalizeSelectionState(
        {
          period: ['last_7_days'],
          excluded_template: ['1'],
          template__all: ['', 'x'],
          label: ['a'],
        },
        ['template', 'label']
      )
    ).toEqual({ period: ['last_7_days'] });
  });

  it('reads "select all" and ignores malformed search terms', () => {
    const state = { select_all_template: ['true'], excluded_search_template: ['%E0%A4%A', 'ok'] };

    expect(readSelection(state, 'template')).toEqual(
      selection({ selectAll: true, excludedSearch: ['ok'] })
    );
  });
});

describe('normalizeSelection', () => {
  it('drops IDs and terms under "select all", and duplicates', () => {
    expect(
      normalizeSelection(
        selection({ selectAll: true, ids: ['1'], search: ['a'], excluded: ['2', '2'] })
      )
    ).toEqual(selection({ selectAll: true, excluded: ['2'] }));
  });

  it('drops excluded IDs when only explicit IDs are selected, but keeps excluded terms', () => {
    expect(
      normalizeSelection(selection({ ids: ['1', '2'], excluded: ['2'], excludedSearch: ['x'] }))
    ).toEqual(selection({ ids: ['1'], excludedSearch: ['x'] }));
    expect(normalizeSelection(selection({ excludedSearch: ['x'] }))).toEqual(EMPTY_SELECTION);
  });

  it('drops search terms covered by another term', () => {
    expect(normalizeSelection(selection({ search: ['prod', 'Deploy prod', 'PROD'] }))).toEqual(
      selection({ search: ['prod'] })
    );
  });

  it('treats a selection without anything selected as empty', () => {
    expect(isSelectionEmpty(selection({ excluded: ['1'] }))).toBe(true);
    expect(isSelectionEmpty(selection({ search: ['a'] }))).toBe(false);
  });
});

describe('isSameSelection', () => {
  it('compares the values regardless of their order', () => {
    expect(isSameSelection(selection({ ids: ['1', '2'] }), selection({ ids: ['2', '1'] }))).toBe(
      true
    );
    expect(isSameSelection(selection({ ids: ['1'] }), selection({ ids: ['1', '2'] }))).toBe(false);
    expect(isSameSelection(selectEvery(), EMPTY_SELECTION)).toBe(false);
  });
});

describe('isOptionSelected', () => {
  it('applies the exclusions after everything else, also to explicit IDs', () => {
    const value = selection({ ids: ['4'], search: ['prod'], excludedSearch: ['backup', 'clean'] });

    expect(selectedValues(value)).toEqual(['1']);
  });
});

describe('setOptionSelected', () => {
  it('selects and deselects explicit IDs', async () => {
    const { deps } = makeDeps();
    const selected = await setOptionSelected(EMPTY_SELECTION, cleanup, true, deps);
    expect(selected).toEqual(selection({ ids: ['4'] }));

    expect(await setOptionSelected(selected!, cleanup, false, deps)).toEqual(EMPTY_SELECTION);
  });

  it('excludes an option that "select all" or a search term selects, and selects it again', async () => {
    const { deps, loadMatching } = makeDeps();
    const deselected = await setOptionSelected(selectEvery(), deployTest, false, deps);
    expect(deselected).toEqual(selection({ selectAll: true, excluded: ['2'] }));

    expect(await setOptionSelected(deselected!, deployTest, true, deps)).toEqual(selectEvery());
    expect(loadMatching).not.toHaveBeenCalled();
  });

  it('lists the matches of an excluded term instead to select one of them', async () => {
    const { deps, loadMatching } = makeDeps();
    const value = selection({ selectAll: true, excludedSearch: ['prod'] });

    const next = await setOptionSelected(value, backupProd, true, deps);

    expect(loadMatching).toHaveBeenCalledWith('prod');
    expect(next).toEqual(selection({ selectAll: true, excluded: ['1'] }));
  });

  it('resolves with undefined when the load is cancelled', async () => {
    const { deps } = makeDeps({ loadMatching: () => Promise.resolve(undefined) });
    const value = selection({ selectAll: true, excludedSearch: ['prod'] });

    expect(await setOptionSelected(value, backupProd, true, deps)).toBeUndefined();
  });
});

describe('selectMatching', () => {
  it('adds the search to the selection without loading its matches', async () => {
    const { deps, loadMatching } = makeDeps();

    const next = await selectMatching(selection({ ids: ['4'] }), ' prod ', deps);

    expect(next).toEqual(selection({ ids: ['4'], search: ['prod'] }));
    expect(selectedValues(next!)).toEqual(['1', '3', '4']);
    expect(loadMatching).not.toHaveBeenCalled();
  });

  it('selects every option without a search', async () => {
    const { deps } = makeDeps();
    expect(await selectMatching(selection({ ids: ['1'] }), '  ', deps)).toEqual(selectEvery());
  });

  it('drops excluded IDs of known names that match the search', async () => {
    const { deps, loadMatching } = makeDeps();
    const value = selection({ selectAll: true, excluded: ['1', '2'] });

    expect(await selectMatching(value, 'prod', deps)).toEqual(
      selection({ selectAll: true, excluded: ['2'] })
    );
    expect(loadMatching).not.toHaveBeenCalled();
  });

  it('loads the matches when an excluded ID has no known name', async () => {
    const { deps, loadMatching } = makeDeps({ getLabel: () => undefined });
    const value = selection({ selectAll: true, excluded: ['1', '2'] });

    expect(await selectMatching(value, 'prod', deps)).toEqual(
      selection({ selectAll: true, excluded: ['2'] })
    );
    expect(loadMatching).toHaveBeenCalledWith('prod');
  });

  it('drops an excluded term whose matches all match the search', async () => {
    const { deps, loadMatching } = makeDeps();
    const value = selection({ selectAll: true, excludedSearch: ['deploy prod'] });

    expect(await selectMatching(value, 'prod', deps)).toEqual(selectEvery());
    expect(loadMatching).not.toHaveBeenCalled();
  });

  it('lists the other matches of an excluded term that shares matches with the search', async () => {
    const { deps } = makeDeps();
    const value = selection({ selectAll: true, excludedSearch: ['deploy'] });

    const next = await selectMatching(value, 'prod', deps);

    expect(next).toEqual(selection({ selectAll: true, excluded: ['2'] }));
    expect(selectedValues(next!)).toEqual(['1', '3', '4']);
  });

  it('keeps an excluded term that shares no matches with the search', async () => {
    const { deps } = makeDeps();
    const value = selection({ search: ['deploy'], excludedSearch: ['test'] });

    expect(await selectMatching(value, 'cleanup', deps)).toEqual(
      selection({ search: ['deploy', 'cleanup'], excludedSearch: ['test'] })
    );
  });
});

describe('deselectMatching', () => {
  const getLabel = makeDeps().deps.getLabel;

  it('excludes the search from "select all"', () => {
    expect(deselectMatching(selectEvery(), 'prod', getLabel)).toEqual(
      selection({ selectAll: true, excludedSearch: ['prod'] })
    );
  });

  it('removes the search terms and IDs it covers', () => {
    const value = selection({ ids: ['1', '4'], search: ['deploy prod'] });

    expect(deselectMatching(value, 'prod', getLabel)).toEqual(selection({ ids: ['4'] }));
  });

  it('excludes the search while an ID of an unknown name may match it', () => {
    expect(deselectMatching(selection({ ids: ['9'] }), 'prod', () => undefined)).toEqual(
      selection({ ids: ['9'], excludedSearch: ['prod'] })
    );
    expect(
      deselectMatching(selection({ ids: ['9'], search: ['a'] }), 'prod', () => undefined)
    ).toEqual(selection({ ids: ['9'], search: ['a'], excludedSearch: ['prod'] }));
  });

  it('replaces excluded IDs and terms the search covers', () => {
    const value = selection({
      selectAll: true,
      excluded: ['1', '4'],
      excludedSearch: ['backup prod'],
    });

    expect(deselectMatching(value, 'prod', getLabel)).toEqual(
      selection({ selectAll: true, excluded: ['4'], excludedSearch: ['prod'] })
    );
  });

  it('clears the selection without a search', () => {
    expect(deselectMatching(selectEvery(), '', getLabel)).toEqual(EMPTY_SELECTION);
  });
});

describe('getScopeState', () => {
  const getLabel = makeDeps().deps.getLabel;
  const scope = (search: string, isEveryOptionLoaded = false) => ({
    search,
    options: OPTIONS.filter((option) => labelMatchesSearch(option.label, search)),
    isEveryOptionLoaded,
    getLabel,
  });

  it('is "all" without a search only for "select all" without exclusions', () => {
    expect(getScopeState(selectEvery(), scope(''))).toBe('all');
    expect(getScopeState(selection({ selectAll: true, excluded: ['9'] }), scope(''))).toBe('some');
    expect(getScopeState(selection({ ids: ['1'] }), scope(''))).toBe('some');
    expect(getScopeState(EMPTY_SELECTION, scope(''))).toBe('none');
  });

  it('is "all" when every option is loaded and selected', () => {
    expect(getScopeState(selection({ ids: ['1', '2', '3', '4'] }), scope('', true))).toBe('all');
  });

  it('is "all" for a search a selected term covers', () => {
    expect(getScopeState(selection({ search: ['prod'] }), scope('deploy prod'))).toBe('all');
    expect(getScopeState(selection({ search: ['prod'] }), scope('deploy'))).toBe('some');
    expect(getScopeState(selection({ search: ['prod'] }), scope('cleanup'))).toBe('none');
  });

  it('is "none" when every option of the scope is loaded and none is selected', () => {
    // The excluded terms exclude every loaded match, but none of them covers the search.
    const value = selection({ selectAll: true, excludedSearch: ['deploy', 'backup'] });
    expect(getScopeState(value, scope('prod', true))).toBe('none');
    expect(getScopeState(value, scope('prod'))).toBe('some');
  });

  it('is "none" when an excluded term covers every match of the search', () => {
    expect(
      getScopeState(selection({ selectAll: true, excludedSearch: ['dep'] }), scope('deploy'))
    ).toBe('none');
    expect(
      getScopeState(selection({ ids: ['1'], excludedSearch: ['dep'] }), scope('deploy prod'))
    ).toBe('none');
  });

  it('is "some" when an exclusion may hold matches that are not loaded', () => {
    expect(
      getScopeState(selection({ selectAll: true, excludedSearch: ['zzz'] }), scope('prod'))
    ).toBe('some');
    expect(
      getScopeState(selection({ selectAll: true, excluded: ['9'] }), {
        ...scope('prod'),
        getLabel: () => undefined,
      })
    ).toBe('some');
    expect(getScopeState(selection({ selectAll: true, excluded: ['4'] }), scope('prod'))).toBe(
      'all'
    );
  });
});

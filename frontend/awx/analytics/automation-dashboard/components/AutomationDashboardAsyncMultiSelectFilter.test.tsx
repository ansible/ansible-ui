import { PageAsyncQueryErrorText } from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSelectOptions';
import { PageSelectOption } from '@ansible/ansible-ui-framework/PageInputs/PageSelectOption';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dispatch, SetStateAction, useCallback, useMemo, useRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { IFilterState } from '@ansible/ansible-ui-framework';
import { BULK_PAGE_SIZE } from '../common/useAutomationDashboardAsyncOptions';
import { FilterSelection, readSelection, writeSelection } from '../utils/filterSelection';
import {
  AutomationDashboardAsyncMultiSelectFilter,
  SelectionChange,
} from './AutomationDashboardAsyncMultiSelectFilter';
import {
  allTestValues,
  createTestQueryOptions,
  TEST_MATCH_LABEL,
  TEST_PAGE_SIZE,
  TEST_SEARCH,
  testOptions,
} from './asyncMultiSelect.testUtils';

const PLACEHOLDER = 'Select template';
const ALL_SELECTED = 'All selected';
const ALL_MATCHING = 'All matching';
const SELECT_ALL = 'Select all';
const DESELECT_ALL = 'Deselect all';
const SELECT_ALL_MATCHING = 'Select all matching';
const DESELECT_ALL_MATCHING = 'Deselect all matching';
const REQUEST_FAILED = 'Request failed';
const LOADING = 'Loading...';
const SEARCH_INPUT = 'Search input';
const LOAD_MORE = 'Load more';
const [firstOption, secondOption, firstMatch] = testOptions;

/** The filter state key of the filter, as `FilterGroup` uses it. */
const FILTER_KEY = 'template';

interface RenderFilterOptions {
  initialState?: IFilterState;
  queryOptions?: ReturnType<typeof createTestQueryOptions>;
  queryErrorText?: PageAsyncQueryErrorText;
}

function renderFilter(options: RenderFilterOptions = {}) {
  const queryOptions = options.queryOptions ?? createTestQueryOptions();
  const initialState = options.initialState ?? {};
  let latestState = initialState;
  let setLatestState: Dispatch<SetStateAction<IFilterState>> = () => {};
  let resetFilters = () => {};
  /** Owns the filter state and the known labels like `FilterGroup`, with the same updates. */
  function StatefulFilter() {
    const [filterState, setFilterState] = useState(initialState);
    const [resetKey, setResetKey] = useState(0);
    const labelsRef = useRef(new Map<string, string>());
    latestState = filterState;
    setLatestState = setFilterState;
    resetFilters = () => {
      setFilterState({});
      setResetKey((key) => key + 1);
    };
    const serialized = JSON.stringify(readSelection(filterState, FILTER_KEY));
    const current = useMemo(() => JSON.parse(serialized) as FilterSelection, [serialized]);
    const onOptionsLoaded = useCallback((loaded: PageSelectOption<string>[]) => {
      for (const option of loaded) labelsRef.current.set(option.value, option.label);
    }, []);
    const getLabel = useCallback((value: string) => labelsRef.current.get(value), []);
    const onSelectionChange = useCallback(
      (change: SelectionChange) =>
        setFilterState((prev) =>
          writeSelection(
            prev,
            FILTER_KEY,
            typeof change === 'function' ? change(readSelection(prev, FILTER_KEY)) : change
          )
        ),
      []
    );
    return (
      <AutomationDashboardAsyncMultiSelectFilter
        id="filter"
        placeholder={PLACEHOLDER}
        selection={current}
        onSelectionChange={onSelectionChange}
        getLabel={getLabel}
        onOptionsLoaded={onOptionsLoaded}
        queryOptions={queryOptions}
        queryErrorText={options.queryErrorText}
        resetKey={resetKey}
      />
    );
  }
  render(<StatefulFilter />);
  return {
    queryOptions,
    getSelection: () => readSelection(latestState, FILTER_KEY),
    getFilterState: () => latestState,
    /** Changes the filter state from outside the select, as removing a toolbar chip does. */
    setFilterState: (state: IFilterState) => act(() => setLatestState(state)),
    /** Clears the selection as "Clear all filters" or loading a saved report does. */
    resetFilters: () => act(() => resetFilters()),
    user: userEvent.setup(),
  };
}

/** Makes the following queries wait until the returned function is called. */
function holdQueries(queryOptions: ReturnType<typeof createTestQueryOptions>) {
  const pagedQuery = queryOptions.getMockImplementation()!;
  let releaseQueries = () => {};
  const queriesReleased = new Promise<void>((resolve) => (releaseQueries = resolve));
  queryOptions.mockImplementation(async (query) => {
    await queriesReleased;
    return pagedQuery(query);
  });
  return releaseQueries;
}

/** Whether a bulk load (every option of a search) was queried. */
function bulkQueries(queryOptions: ReturnType<typeof createTestQueryOptions>) {
  return queryOptions.mock.calls.filter(([query]) => query.pageSize === BULK_PAGE_SIZE);
}

function getToggle() {
  return screen.getByTestId('filter');
}

async function openFilter(user: ReturnType<typeof userEvent.setup>) {
  await user.click(getToggle());
  await screen.findByLabelText(firstOption.label);
}

async function closeFilter(user: ReturnType<typeof userEvent.setup>) {
  await user.click(getToggle());
  await waitFor(() => expect(getToggle()).toHaveAttribute('aria-expanded', 'false'));
}

async function search(user: ReturnType<typeof userEvent.setup>, text: string) {
  await user.click(screen.getByLabelText(SEARCH_INPUT));
  await user.paste(text);
  // The search is debounced (200 ms) before the options are queried again; the bulk selector is
  // enabled again once the queried options are loaded.
  await waitFor(
    () => {
      expect(screen.queryByLabelText(firstOption.label)).not.toBeInTheDocument();
      expect(getBulkCheckbox()).toBeEnabled();
    },
    { timeout: 3000 }
  );
}

async function clearSearch(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByLabelText('Reset'));
  await screen.findByLabelText(firstOption.label, undefined, { timeout: 3000 });
}

/** The bulk checkbox, whatever its label ("Select all", "Deselect all matching", ...) is. */
function getBulkCheckbox() {
  return document.getElementsByName('filter-bulk-select-checkbox')[0];
}

/** "Select all" with every match of `TEST_SEARCH` excluded by the search term. */
const ALL_BUT_TEST_STATE: IFilterState = {
  select_all_template: ['true'],
  excluded_search_template: [TEST_SEARCH],
};

// Integration tests with the whole select menu: the longer flows (several menu interactions) get
// more time than the default 5 seconds for slower, parallel CI runs.
describe('AutomationDashboardAsyncMultiSelectFilter', { timeout: 15000 }, () => {
  it('"Select all" selects every option without loading them', async () => {
    const { user, getFilterState, queryOptions } = renderFilter();
    await openFilter(user);

    await user.click(screen.getByLabelText(SELECT_ALL));

    expect(getFilterState()).toEqual({ select_all_template: ['true'] });
    expect(bulkQueries(queryOptions)).toHaveLength(0);
    expect(getToggle()).toHaveTextContent(ALL_SELECTED);
    expect(screen.getByLabelText(firstOption.label)).toBeChecked();
    expect(screen.getByLabelText(DESELECT_ALL)).toBeChecked();
  });

  it('"Deselect all" clears the selection', async () => {
    const { user, getFilterState } = renderFilter({
      initialState: { select_all_template: ['true'] },
    });
    await openFilter(user);

    await user.click(screen.getByLabelText(DESELECT_ALL));

    expect(getFilterState()).toEqual({});
    expect(getToggle()).toHaveTextContent(PLACEHOLDER);
  });

  it('"Select all matching" adds the search to the selection, also after it is cleared', async () => {
    const { user, getFilterState, queryOptions } = renderFilter({
      initialState: { template: [firstOption.value] },
    });
    await openFilter(user);
    await search(user, TEST_SEARCH);

    await user.click(screen.getByLabelText(SELECT_ALL_MATCHING));

    expect(getFilterState()).toEqual({
      template: [firstOption.value],
      search_template: [TEST_SEARCH],
    });
    expect(bulkQueries(queryOptions)).toHaveLength(0);
    expect(screen.getByLabelText(DESELECT_ALL_MATCHING)).toBeChecked();
    await clearSearch(user);
    expect(getToggle()).toHaveTextContent('Custom selection');
    expect(screen.getByLabelText(firstMatch.label)).toBeChecked();
    expect(screen.getByLabelText(firstOption.label)).toBeChecked();
    expect(screen.getByLabelText(secondOption.label)).not.toBeChecked();
  });

  it('"Deselect all matching" removes the search from the selection again', async () => {
    const { user, getFilterState } = renderFilter({
      initialState: { search_template: [TEST_SEARCH] },
    });
    await openFilter(user);
    expect(getToggle()).toHaveTextContent(ALL_MATCHING);
    await search(user, TEST_SEARCH);

    await user.click(screen.getByLabelText(DESELECT_ALL_MATCHING));

    expect(getFilterState()).toEqual({});
  });

  it('"Deselect all matching" excludes the search from "Select all"', async () => {
    const { user, getFilterState } = renderFilter({
      initialState: { select_all_template: ['true'] },
    });
    await openFilter(user);
    await search(user, TEST_SEARCH);

    await user.click(screen.getByLabelText(DESELECT_ALL_MATCHING));

    expect(getFilterState()).toEqual(ALL_BUT_TEST_STATE);
    expect(getToggle()).toHaveTextContent('All with exclusions');
    expect(screen.getByLabelText(SELECT_ALL_MATCHING)).not.toBeChecked();
  });

  it('excludes an option deselected after "Select all" and selects it again', async () => {
    const { user, getFilterState } = renderFilter({
      initialState: { select_all_template: ['true'] },
    });
    await openFilter(user);

    await user.click(screen.getByLabelText(secondOption.label));

    await waitFor(() =>
      expect(getFilterState()).toEqual({
        select_all_template: ['true'],
        excluded_template: [secondOption.value],
      })
    );
    expect(getToggle()).toHaveTextContent('All except 1');
    expect(screen.getByLabelText(SELECT_ALL)).toBePartiallyChecked();

    await user.click(screen.getByLabelText(secondOption.label));

    await waitFor(() => expect(getFilterState()).toEqual({ select_all_template: ['true'] }));
  });

  it('selects and deselects single options', async () => {
    const { user, getFilterState } = renderFilter();
    await openFilter(user);

    await user.click(screen.getByLabelText(secondOption.label));
    await waitFor(() => expect(getFilterState()).toEqual({ template: [secondOption.value] }));
    expect(getToggle()).toHaveTextContent('1 selected');

    await user.click(screen.getByLabelText(secondOption.label));
    await waitFor(() => expect(getFilterState()).toEqual({}));
  });

  it('lists the matches of an excluded search to select one of them', async () => {
    const { user, getFilterState, queryOptions } = renderFilter({
      initialState: ALL_BUT_TEST_STATE,
    });
    await openFilter(user);
    expect(screen.getByLabelText(firstMatch.label)).not.toBeChecked();

    await user.click(screen.getByLabelText(firstMatch.label));

    await waitFor(() =>
      expect(getFilterState()).toEqual({
        select_all_template: ['true'],
        excluded_template: ['7', '12'],
      })
    );
    expect(bulkQueries(queryOptions)).toEqual([[expect.objectContaining({ search: TEST_SEARCH })]]);
    expect(screen.getByLabelText(firstMatch.label)).toBeChecked();
  });

  it('completes a change that loads after the select closes and shows a spinner meanwhile', async () => {
    const { user, getSelection, queryOptions } = renderFilter({
      initialState: ALL_BUT_TEST_STATE,
    });
    await openFilter(user);
    const releaseQueries = holdQueries(queryOptions);

    await user.click(screen.getByLabelText(firstMatch.label));
    await closeFilter(user);
    expect(within(getToggle()).getByLabelText(LOADING)).toBeInTheDocument();
    releaseQueries();

    await waitFor(() => expect(getSelection().excluded).toEqual(['7', '12']));
    expect(getToggle()).toHaveTextContent('All except 2');
  });

  it('keeps the focus in the menu while a change loads and disables the select meanwhile', async () => {
    const { user, getSelection, queryOptions } = renderFilter({
      initialState: ALL_BUT_TEST_STATE,
    });
    await openFilter(user);
    const releaseQueries = holdQueries(queryOptions);

    await user.click(screen.getByLabelText(firstMatch.label));

    expect(document.getElementById('filter-select')).toHaveFocus();
    expect(screen.getByLabelText(firstOption.label)).toBeDisabled();
    expect(getBulkCheckbox()).toBeDisabled();
    expect(screen.getByLabelText(SEARCH_INPUT)).toBeDisabled();
    expect(screen.getByText(LOAD_MORE).closest('button')).toBeDisabled();
    releaseQueries();

    await waitFor(() => expect(getSelection().excluded).toEqual(['7', '12']));
    expect(screen.getByLabelText(firstOption.label)).toBeEnabled();
  });

  it('cancels a change that loads when the selection changes meanwhile', async () => {
    const { user, getFilterState, setFilterState, queryOptions } = renderFilter({
      initialState: ALL_BUT_TEST_STATE,
    });
    await openFilter(user);
    const releaseQueries = holdQueries(queryOptions);

    await user.click(screen.getByLabelText(firstMatch.label));
    // A removed chip.
    setFilterState({ select_all_template: ['true'] });
    releaseQueries();

    await waitFor(() => expect(getBulkCheckbox()).toBeEnabled());
    expect(getFilterState()).toEqual({ select_all_template: ['true'] });
  });

  it('cancels a change that loads when the filters are reset meanwhile', async () => {
    const { user, getFilterState, resetFilters, queryOptions } = renderFilter({
      initialState: ALL_BUT_TEST_STATE,
    });
    await openFilter(user);
    const releaseQueries = holdQueries(queryOptions);

    await user.click(screen.getByLabelText(firstMatch.label));
    await closeFilter(user);
    resetFilters();
    releaseQueries();

    await waitFor(() =>
      expect(within(getToggle()).queryByLabelText(LOADING)).not.toBeInTheDocument()
    );
    expect(getFilterState()).toEqual({});
    expect(getToggle()).toHaveTextContent(PLACEHOLDER);
  });

  it('shows a failed load of a change in the menu and keeps the selection', async () => {
    const { user, getFilterState, queryOptions } = renderFilter({
      initialState: ALL_BUT_TEST_STATE,
      queryErrorText: 'Failed to load options.',
    });
    await openFilter(user);
    queryOptions.mockRejectedValueOnce(new Error(REQUEST_FAILED));

    await user.click(screen.getByLabelText(firstMatch.label));

    expect(await screen.findByText('Failed to load options.')).toBeInTheDocument();
    expect(getFilterState()).toEqual(ALL_BUT_TEST_STATE);
  });

  it('tells that not every option could be loaded instead of the query error text', async () => {
    const { user, getFilterState, queryOptions } = renderFilter({
      initialState: ALL_BUT_TEST_STATE,
      queryErrorText: 'Failed to load options.',
    });
    await openFilter(user);
    // The bulk load gets the same page again: it stops with options missing.
    queryOptions.mockResolvedValue({ options: testOptions.slice(0, 5), remaining: 9, next: 2 });

    await user.click(screen.getByLabelText(firstMatch.label));

    expect(await screen.findByText('Not every option could be loaded.')).toBeInTheDocument();
    expect(screen.queryByText('Failed to load options.')).not.toBeInTheDocument();
    expect(getFilterState()).toEqual(ALL_BUT_TEST_STATE);
  });

  it('disables "Select all matching" when no option matches the search and keeps the selection', async () => {
    const { user, getFilterState, queryOptions } = renderFilter({
      initialState: { template: [firstOption.value] },
    });
    await openFilter(user);
    await user.click(screen.getByLabelText(SEARCH_INPUT));
    await user.paste('no match');
    // The search is debounced (200 ms) before it is queried; the checkbox stays disabled after.
    await waitFor(
      () =>
        expect(queryOptions).toHaveBeenCalledWith(expect.objectContaining({ search: 'no match' })),
      { timeout: 3000 }
    );
    await screen.findByText('No results found');

    expect(screen.getByLabelText(SELECT_ALL_MATCHING)).toBeDisabled();
    expect(getFilterState()).toEqual({ template: [firstOption.value] });
  });

  it('shows "Select all" partially checked while not every selected option is loaded', async () => {
    const { user } = renderFilter({ initialState: { template: allTestValues.slice(0, 10) } });
    await openFilter(user);

    expect(screen.getByLabelText(SELECT_ALL)).toBePartiallyChecked();
    expect(screen.getByLabelText(`${TEST_MATCH_LABEL} 3`)).toBeChecked();
  });

  it('loads the first page when opened and more with "Load more"', async () => {
    const { user } = renderFilter();
    await openFilter(user);

    expect(
      screen.getByText(`Loaded ${TEST_PAGE_SIZE} of ${allTestValues.length}`)
    ).toBeInTheDocument();

    await user.click(screen.getByText(LOAD_MORE));

    await screen.findByLabelText(testOptions[13].label);
    expect(screen.queryByText(LOAD_MORE)).not.toBeInTheDocument();
  });

  it('shows "Loading X of Y" while "Load more" fetches more options', async () => {
    const { user, queryOptions } = renderFilter();
    await openFilter(user);
    const releaseQueries = holdQueries(queryOptions);

    await user.click(screen.getByText(LOAD_MORE));

    expect(
      screen.getByText(`Loading ${TEST_PAGE_SIZE} of ${allTestValues.length}`)
    ).toBeInTheDocument();
    releaseQueries();
    await screen.findByLabelText(testOptions[13].label);
  });

  it('disables the bulk selector until the typed search is queried', async () => {
    const { user } = renderFilter();
    await openFilter(user);
    // Fake timers hold the search debounce, so the check does not depend on the test speed.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    // Testing Library ends each user-event call on a zero timeout that it advances only through a
    // `jest` global; user-event advances its own timers between keystrokes, by less than the
    // debounce.
    vi.stubGlobal('jest', { advanceTimersByTime: vi.advanceTimersByTime });
    try {
      await userEvent
        .setup({ advanceTimers: vi.advanceTimersByTime })
        .type(screen.getByLabelText(SEARCH_INPUT), TEST_SEARCH);

      expect(getBulkCheckbox()).toBeDisabled();
      act(() => {
        vi.advanceTimersByTime(200);
      });
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
    await waitFor(() => expect(getBulkCheckbox()).toBeEnabled());
  });

  it('does not query the previous search when the select is reopened right away', async () => {
    const { user, queryOptions } = renderFilter();
    await openFilter(user);
    await search(user, TEST_SEARCH);

    await closeFilter(user);
    queryOptions.mockClear();
    // Reopened before the cleared search would pass the 200 ms debounce.
    await user.click(getToggle());
    await screen.findByLabelText(firstOption.label);
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(queryOptions).toHaveBeenCalledTimes(1);
    expect(queryOptions).toHaveBeenCalledWith(expect.objectContaining({ search: '' }));
    expect(screen.getByLabelText(SEARCH_INPUT)).toHaveValue('');
  });

  it('treats a search of only spaces as no search', async () => {
    const { user, queryOptions } = renderFilter();
    await openFilter(user);
    queryOptions.mockClear();

    await user.click(screen.getByLabelText(SEARCH_INPUT));
    await user.paste('  ');
    // Longer than the search debounce.
    await act(() => new Promise((resolve) => setTimeout(resolve, 300)));

    expect(queryOptions).not.toHaveBeenCalled();
    expect(screen.getByLabelText(SELECT_ALL)).toBeEnabled();
    expect(screen.getByLabelText(firstOption.label)).toBeInTheDocument();
  });

  it('queries the text typed on the closed toggle right away', async () => {
    const { user, queryOptions } = renderFilter();
    getToggle().focus();

    await user.keyboard('T');
    // "T" matches the "Test job" options only.
    await screen.findByLabelText(testOptions[2].label);
    // Longer than the search debounce.
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(queryOptions).toHaveBeenCalledTimes(1);
    expect(queryOptions).toHaveBeenCalledWith(expect.objectContaining({ search: 'T' }));
  });

  it('keeps the select open while using the bulk selector', async () => {
    const { user } = renderFilter();
    await openFilter(user);

    await user.click(screen.getByLabelText(SELECT_ALL));

    expect(getToggle()).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows a failed "Load more" in the open select and keeps the loaded options', async () => {
    const { user, queryOptions } = renderFilter({ queryErrorText: 'Failed to load options.' });
    await openFilter(user);
    queryOptions.mockRejectedValueOnce(new Error(REQUEST_FAILED));

    await user.click(screen.getByText(LOAD_MORE));

    expect(await screen.findByText('Failed to load options.')).toBeInTheDocument();
    expect(getToggle()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByLabelText(firstOption.label)).toBeInTheDocument();
  });

  it('shows a failed first page in the menu and loads it again with "Retry"', async () => {
    const queryOptions = createTestQueryOptions();
    queryOptions.mockRejectedValueOnce(new Error(REQUEST_FAILED));
    const { user } = renderFilter({ queryOptions, queryErrorText: 'Failed to load options.' });

    await user.click(getToggle());
    expect(await screen.findByText('Failed to load options.')).toBeInTheDocument();
    expect(getToggle()).toHaveClass('pf-m-danger');
    expect(screen.queryByText('No results found')).not.toBeInTheDocument();

    await user.click(screen.getByText('Retry'));

    expect(await screen.findByLabelText(firstOption.label)).toBeInTheDocument();
    expect(queryOptions).toHaveBeenCalledTimes(2);
  });

  it('closes the select after a failed first page and starts again without the search', async () => {
    const { user, queryOptions } = renderFilter();
    await openFilter(user);
    queryOptions.mockRejectedValueOnce(new Error(REQUEST_FAILED));
    await user.click(screen.getByLabelText(SEARCH_INPUT));
    await user.paste(TEST_SEARCH);
    expect(await screen.findByText('Error loading options')).toBeInTheDocument();

    await closeFilter(user);
    await openFilter(user);

    expect(screen.getByLabelText(SEARCH_INPUT)).toHaveValue('');
    expect(screen.queryByText('Error loading options')).not.toBeInTheDocument();
  });

  it('clears a failed "Load more" when another search loads', async () => {
    const { user, queryOptions } = renderFilter({ queryErrorText: 'Failed to load options.' });
    await openFilter(user);
    queryOptions.mockRejectedValueOnce(new Error(REQUEST_FAILED));
    await user.click(screen.getByText(LOAD_MORE));
    expect(await screen.findByText('Failed to load options.')).toBeInTheDocument();

    await search(user, TEST_SEARCH);

    expect(screen.queryByText('Failed to load options.')).not.toBeInTheDocument();
  });

  it('shows the error text from a function and a default text', async () => {
    const queryOptions = createTestQueryOptions();
    queryOptions.mockRejectedValue(new Error(REQUEST_FAILED));
    const queryErrorText = vi.fn((error: Error) => `Failed: ${error.message}`);
    const { user } = renderFilter({ queryOptions, queryErrorText });

    await user.click(getToggle());

    expect(await screen.findByText('Failed: Request failed')).toBeInTheDocument();
  });

  it('shows the default error text without queryErrorText', async () => {
    const queryOptions = createTestQueryOptions();
    queryOptions.mockRejectedValue(new Error(REQUEST_FAILED));
    const { user } = renderFilter({ queryOptions });

    await user.click(getToggle());

    expect(await screen.findByText('Error loading options')).toBeInTheDocument();
  });
});

import { PageAsyncQueryErrorText } from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSelectOptions';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dispatch, SetStateAction, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { IFilterState } from '@ansible/ansible-ui-framework';
import { BULK_PAGE_SIZE } from '../common/useAutomationDashboardAsyncOptions';
import {
  allSelectedKey,
  getAllSelectedSearch,
  selectFilterValues,
} from '../utils/filterStateUpdates';
import { AutomationDashboardAsyncMultiSelectFilter } from './AutomationDashboardAsyncMultiSelectFilter';
import {
  allTestValues,
  createTestQueryOptions,
  sortValues,
  TEST_MATCH_LABEL,
  TEST_MATCH_VALUES,
  TEST_PAGE_SIZE,
  TEST_SEARCH,
  testOptions,
} from './asyncMultiSelect.testUtils';

const PLACEHOLDER = 'Select template';
const ALL_SELECTED = 'All selected';
const ALL_TEST_MATCHING = `All ${TEST_MATCH_VALUES.length} matching`;
const SELECT_ALL = 'Select all';
const SELECT_ALL_MATCHING = 'Select all matching';
const DESELECT_ALL_MATCHING = 'Deselect all matching';
const REQUEST_FAILED = 'Request failed';
const LOADING = 'Loading...';
const SEARCH_INPUT = 'Search input';
const LOAD_MORE = 'Load more';
const [firstOption] = testOptions;

interface RenderFilterOptions {
  initialValues?: string[];
  queryOptions?: ReturnType<typeof createTestQueryOptions>;
  queryErrorText?: PageAsyncQueryErrorText;
}

/** The filter state key of the filter, as `FilterGroup` uses it. */
const FILTER_KEY = 'template';

/** The filter state with the filter's values replaced, as removing a toolbar chip sets it. */
function withValues(filterState: IFilterState, values: string[] | undefined) {
  return selectFilterValues(filterState, FILTER_KEY, () => values);
}

function renderFilter(options: RenderFilterOptions = {}) {
  const queryOptions = options.queryOptions ?? createTestQueryOptions();
  const initialState: IFilterState = options.initialValues
    ? { [FILTER_KEY]: options.initialValues }
    : {};
  let latestState = initialState;
  let setLatestState: Dispatch<SetStateAction<IFilterState>> = () => {};
  let resetFilters = () => {};
  let remountFilter = () => {};
  /** Owns the filter state like `FilterGroup`, with the same updates. */
  function StatefulFilter() {
    const [filterState, setFilterState] = useState(initialState);
    const [resetKey, setResetKey] = useState(0);
    const [mountKey, setMountKey] = useState(0);
    latestState = filterState;
    setLatestState = setFilterState;
    resetFilters = () => {
      setFilterState({});
      setResetKey((key) => key + 1);
    };
    remountFilter = () => setMountKey((key) => key + 1);
    const values = filterState[FILTER_KEY];
    return (
      <AutomationDashboardAsyncMultiSelectFilter
        key={mountKey}
        id="filter"
        placeholder={PLACEHOLDER}
        values={values}
        onSelect={(setter, allSelected) =>
          setFilterState((prev) => selectFilterValues(prev, FILTER_KEY, setter, allSelected))
        }
        allSelectedSearch={getAllSelectedSearch(values, filterState[allSelectedKey(FILTER_KEY)])}
        queryOptions={queryOptions}
        queryErrorText={options.queryErrorText}
        resetKey={resetKey}
      />
    );
  }
  render(<StatefulFilter />);
  return {
    queryOptions,
    getValues: () => sortValues(latestState[FILTER_KEY]),
    getFilterState: () => latestState,
    /** Changes the selection from outside the select, as removing a toolbar chip does. */
    setValues: (values: string[] | undefined) =>
      act(() => setLatestState((prev) => withValues(prev, values))),
    /** Clears the selection as "Clear all filters" or loading a saved report does. */
    resetFilters: () => act(() => resetFilters()),
    /** Mounts the filter again, as selecting another filter and this one again does. */
    remountFilter: () => act(() => remountFilter()),
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

/** A search that matches 11 options: one more than the first page, with the same first option. */
const OPTION_SEARCH = 'Option';
const optionMatchValues = sortValues(
  testOptions.filter((option) => option.label.includes(OPTION_SEARCH)).map((option) => option.value)
);

/** Searches `OPTION_SEARCH`; its first page shows the same first option as no search. */
async function searchOption(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByLabelText(SEARCH_INPUT));
  await user.paste(OPTION_SEARCH);
  await screen.findByText(`Loaded ${TEST_PAGE_SIZE} of ${optionMatchValues.length}`, undefined, {
    timeout: 3000,
  });
  await waitFor(() => expect(getBulkCheckbox()).toBeEnabled());
}

/** The bulk checkbox, whatever its label ("Select all", "Deselect all matching", ...) is. */
function getBulkCheckbox() {
  return document.getElementsByName('filter-bulk-select-checkbox')[0];
}

// Integration tests with the whole select menu: the longer flows (several menu interactions) get
// more time than the default 5 seconds for slower, parallel CI runs.
describe('AutomationDashboardAsyncMultiSelectFilter', { timeout: 15000 }, () => {
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

  it('"Select all" without a search loads every page and selects every option', async () => {
    const { user, getValues, queryOptions } = renderFilter();
    await openFilter(user);

    await user.click(screen.getByLabelText(SELECT_ALL));

    await waitFor(() => expect(getValues()).toEqual(allTestValues));
    expect(getToggle()).toHaveTextContent(ALL_SELECTED);
    expect(queryOptions).toHaveBeenLastCalledWith(
      expect.objectContaining({ pageSize: BULK_PAGE_SIZE })
    );
  });

  it('"Select all matching" selects the matching options and shows "All N matching"', async () => {
    const { user, getValues } = renderFilter();
    await openFilter(user);
    await search(user, TEST_SEARCH);

    await user.click(screen.getByLabelText(SELECT_ALL_MATCHING));

    await waitFor(() => expect(getValues()).toEqual(TEST_MATCH_VALUES));
    expect(getToggle()).toHaveTextContent(ALL_TEST_MATCHING);
  });

  it('keeps "All N matching" after the search of "Select all matching" is cleared', async () => {
    const { user, getValues } = renderFilter();
    await openFilter(user);
    await search(user, TEST_SEARCH);
    await user.click(screen.getByLabelText(SELECT_ALL_MATCHING));
    await waitFor(() => expect(getValues()).toEqual(TEST_MATCH_VALUES));

    await user.click(screen.getByLabelText('Reset'));
    await screen.findByLabelText(firstOption.label);
    expect(getToggle()).toHaveTextContent(ALL_TEST_MATCHING);
    await closeFilter(user);

    expect(getToggle()).toHaveTextContent(ALL_TEST_MATCHING);
  });

  it('keeps "All N matching" in the filter state, so it outlives the select', async () => {
    const { user, getValues, getFilterState, remountFilter } = renderFilter();
    await openFilter(user);
    await search(user, TEST_SEARCH);
    await user.click(screen.getByLabelText(SELECT_ALL_MATCHING));
    await waitFor(() => expect(getValues()).toEqual(TEST_MATCH_VALUES));
    await closeFilter(user);

    // E.g. another filter was selected and this one again, or the page was reloaded.
    remountFilter();

    expect(getToggle()).toHaveTextContent(ALL_TEST_MATCHING);
    expect(getFilterState()[allSelectedKey(FILTER_KEY)]?.[0]).toBe(TEST_SEARCH);
  });

  it('drops "All N matching" when a value is removed from outside the select', async () => {
    const { user, getValues, getFilterState, setValues } = renderFilter();
    await openFilter(user);
    await search(user, TEST_SEARCH);
    await user.click(screen.getByLabelText(SELECT_ALL_MATCHING));
    await waitFor(() => expect(getValues()).toEqual(TEST_MATCH_VALUES));

    // A removed chip.
    setValues(TEST_MATCH_VALUES.slice(1));

    expect(getToggle()).toHaveTextContent(`${TEST_MATCH_VALUES.length - 1} selected`);
    expect(getFilterState()[allSelectedKey(FILTER_KEY)]).toBeUndefined();
  });

  it('knows every match is selected when the search of "Select all matching" is searched again', async () => {
    // "Option" matches 11 options: one more than the first page, so they are not all loaded.
    const { user } = renderFilter();
    await openFilter(user);
    await searchOption(user);
    await user.click(screen.getByLabelText(SELECT_ALL_MATCHING));
    await waitFor(() => expect(screen.getByLabelText(DESELECT_ALL_MATCHING)).toBeChecked());
    await closeFilter(user);

    await openFilter(user);
    await searchOption(user);

    expect(screen.getByLabelText(DESELECT_ALL_MATCHING)).toBeChecked();
  });

  it('shows the count again once the selection changes after "Select all"', async () => {
    const { user } = renderFilter();
    await openFilter(user);
    await user.click(screen.getByLabelText(SELECT_ALL));
    await waitFor(() => expect(getToggle()).toHaveTextContent(ALL_SELECTED));

    await user.click(screen.getByText(firstOption.label));

    expect(getToggle()).toHaveTextContent(`${allTestValues.length - 1} selected`);
  });

  it('selects all with the bulk checkbox while nothing is selected', async () => {
    const { user, getValues } = renderFilter();
    await openFilter(user);

    await user.click(screen.getByLabelText(SELECT_ALL));

    await waitFor(() => expect(getValues()).toEqual(allTestValues));
  });

  it('disables "Select all" when no option matches the search and keeps the selection', async () => {
    const { user, getValues, queryOptions } = renderFilter({ initialValues: [firstOption.value] });
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
    expect(getValues()).toEqual([firstOption.value]);
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

  it('cancels "Select all" when the selection changes while it loads', async () => {
    const { user, getValues, setValues, queryOptions } = renderFilter({
      initialValues: [firstOption.value, '2'],
    });
    await openFilter(user);
    const releaseQueries = holdQueries(queryOptions);

    await user.click(screen.getByLabelText(SELECT_ALL));
    // A removed chip.
    setValues([firstOption.value]);
    releaseQueries();

    await waitFor(() => expect(getBulkCheckbox()).toBeEnabled());
    expect(getValues()).toEqual([firstOption.value]);
  });

  it('still cancels a bulk action after a cancelled one resolved late', async () => {
    const { user, getValues, setValues, queryOptions } = renderFilter({
      initialValues: [firstOption.value, '2'],
    });
    await openFilter(user);
    const releaseFirst = holdQueries(queryOptions);
    await user.click(screen.getByLabelText(SELECT_ALL));
    // A removed chip cancels the first "Select all"; its query is still running.
    setValues([firstOption.value]);
    await waitFor(() => expect(getBulkCheckbox()).toBeEnabled());

    const releaseSecond = holdQueries(queryOptions);
    await user.click(screen.getByLabelText(SELECT_ALL));
    releaseFirst();
    // Another removed chip, after the cancelled action resolved.
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
    setValues([]);
    releaseSecond();

    await waitFor(() => expect(getBulkCheckbox()).toBeEnabled());
    expect(getValues()).toEqual([]);
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

  it('cancels "Select all" when the selection is cleared while it loads', async () => {
    const { user, getValues, setValues, queryOptions } = renderFilter({
      initialValues: [firstOption.value],
    });
    await openFilter(user);
    const releaseQueries = holdQueries(queryOptions);

    await user.click(screen.getByLabelText(SELECT_ALL));
    await closeFilter(user);
    // "Clear all filters".
    setValues(undefined);
    releaseQueries();

    await waitFor(() =>
      expect(within(getToggle()).queryByLabelText(LOADING)).not.toBeInTheDocument()
    );
    expect(getValues()).toEqual([]);
    expect(getToggle()).toHaveTextContent(PLACEHOLDER);
  });

  it('keeps the focus in the menu while "Select all" loads and gives it back afterwards', async () => {
    const { user, getValues, queryOptions } = renderFilter();
    await openFilter(user);
    const releaseQueries = holdQueries(queryOptions);

    await user.click(screen.getByLabelText(SELECT_ALL));
    expect(document.getElementById('filter-select')).toHaveFocus();
    releaseQueries();

    await waitFor(() => expect(getValues()).toEqual(allTestValues));
    expect(getBulkCheckbox()).toHaveFocus();
  });

  it('cancels "Select all" on an empty filter when the filters are reset while it loads', async () => {
    const { user, getValues, resetFilters, queryOptions } = renderFilter();
    await openFilter(user);
    const releaseQueries = holdQueries(queryOptions);

    await user.click(screen.getByLabelText(SELECT_ALL));
    await closeFilter(user);
    // "Clear all filters" leaves the empty selection unchanged.
    resetFilters();
    releaseQueries();

    await waitFor(() =>
      expect(within(getToggle()).queryByLabelText(LOADING)).not.toBeInTheDocument()
    );
    expect(getValues()).toEqual([]);
    expect(getToggle()).toHaveTextContent(PLACEHOLDER);
  });

  it('shows a failed "Select all matching" in the open select and keeps the search', async () => {
    const { user, getValues, queryOptions } = renderFilter({
      queryErrorText: 'Failed to load options.',
    });
    await openFilter(user);
    await searchOption(user);
    queryOptions.mockRejectedValueOnce(new Error(REQUEST_FAILED));

    await user.click(screen.getByLabelText(SELECT_ALL_MATCHING));

    expect(await screen.findByText('Failed to load options.')).toBeInTheDocument();
    expect(getToggle()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByLabelText(SEARCH_INPUT)).toHaveValue(OPTION_SEARCH);
    expect(screen.getByLabelText(firstOption.label)).toBeInTheDocument();
    expect(getValues()).toEqual([]);
  });

  it('tells that not every option could be loaded instead of the query error text', async () => {
    const { user, getValues, queryOptions } = renderFilter({
      queryErrorText: 'Failed to load options.',
    });
    await openFilter(user);
    // The bulk load gets the same page again: it stops with options missing.
    queryOptions.mockResolvedValue({ options: testOptions.slice(0, 5), remaining: 9, next: 2 });

    await user.click(screen.getByLabelText(SELECT_ALL));

    expect(await screen.findByText('Not every option could be loaded.')).toBeInTheDocument();
    expect(screen.queryByText('Failed to load options.')).not.toBeInTheDocument();
    expect(getValues()).toEqual([]);
  });

  it('does not show every option as selected when the loaded pages miss options', async () => {
    const queryOptions = createTestQueryOptions();
    // "Load more" gets option 2 again and never option 3: the pages overlap.
    queryOptions.mockImplementation(({ next }) =>
      Promise.resolve(
        Number(next ?? 1) === 1
          ? { options: [testOptions[0], testOptions[1]], remaining: 1, next: 2 }
          : { options: [testOptions[1]], remaining: 0, next: 3 }
      )
    );
    const { user } = renderFilter({
      queryOptions,
      initialValues: [testOptions[0].value, testOptions[1].value],
    });
    await openFilter(user);

    await user.click(screen.getByText(LOAD_MORE));
    await waitFor(() => expect(screen.queryByText(LOAD_MORE)).not.toBeInTheDocument());

    expect(screen.getByLabelText(SELECT_ALL)).toBePartiallyChecked();
  });

  it('keeps every match selected with "Select all matching" when not every match is loaded', async () => {
    // The matches are selected, but not by "Select all matching" (e.g. by a saved report).
    const { user, getValues } = renderFilter({ initialValues: optionMatchValues });
    await openFilter(user);
    await searchOption(user);
    expect(screen.getByLabelText(SELECT_ALL_MATCHING)).toBePartiallyChecked();

    await user.click(screen.getByLabelText(SELECT_ALL_MATCHING));

    await waitFor(() => expect(screen.getByLabelText(DESELECT_ALL_MATCHING)).toBeChecked());
    expect(getValues()).toEqual(optionMatchValues);
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

  it('adds the matches with the checkbox while searching and removes them again', async () => {
    const { user, getValues } = renderFilter({ initialValues: [firstOption.value] });
    await openFilter(user);
    await search(user, TEST_SEARCH);

    await user.click(screen.getByLabelText(SELECT_ALL_MATCHING));
    await waitFor(() =>
      expect(getValues()).toEqual(sortValues([firstOption.value, ...TEST_MATCH_VALUES]))
    );

    await user.click(await screen.findByLabelText(DESELECT_ALL_MATCHING));
    await waitFor(() => expect(getValues()).toEqual([firstOption.value]));
  });

  it('does not show "All N matching" for matches selected again by hand after removing them', async () => {
    const { user, getValues } = renderFilter();
    await openFilter(user);
    await search(user, TEST_SEARCH);
    await user.click(screen.getByLabelText(SELECT_ALL_MATCHING));
    await waitFor(() => expect(getToggle()).toHaveTextContent(ALL_TEST_MATCHING));
    await user.click(await screen.findByLabelText(DESELECT_ALL_MATCHING));
    await waitFor(() => expect(getValues()).toEqual([]));

    for (const value of TEST_MATCH_VALUES) {
      await user.click(screen.getByLabelText(`${TEST_MATCH_LABEL} ${value}`));
    }

    await waitFor(() => expect(getValues()).toEqual(TEST_MATCH_VALUES));
    expect(getToggle()).toHaveTextContent(`${TEST_MATCH_VALUES.length} selected`);
  });

  it('completes "Select all" after the select closes and shows a spinner meanwhile', async () => {
    const { user, getValues, queryOptions } = renderFilter({ initialValues: [firstOption.value] });
    await openFilter(user);
    const releaseQueries = holdQueries(queryOptions);

    await user.click(screen.getByLabelText(SELECT_ALL));
    await closeFilter(user);
    expect(within(getToggle()).getByLabelText(LOADING)).toBeInTheDocument();
    releaseQueries();

    await waitFor(() => expect(getValues()).toEqual(allTestValues));
    expect(getToggle()).toHaveTextContent(ALL_SELECTED);
  });

  it('shows a bulk action that failed after the select closed on the toggle and in the menu', async () => {
    const { user, getValues, queryOptions } = renderFilter({
      initialValues: [firstOption.value],
      queryErrorText: 'Failed to load options.',
    });
    await openFilter(user);
    let rejectQuery = (_error: Error) => {};
    queryOptions.mockImplementationOnce(
      () => new Promise((_resolve, reject) => (rejectQuery = reject))
    );

    await user.click(screen.getByLabelText(SELECT_ALL));
    await closeFilter(user);
    act(() => rejectQuery(new Error(REQUEST_FAILED)));

    await waitFor(() => expect(getToggle()).toHaveClass('pf-m-danger'));
    await user.click(getToggle());
    expect(await screen.findByText('Failed to load options.')).toBeInTheDocument();
    expect(getValues()).toEqual([firstOption.value]);
  });

  it('disables "Load more" and shows "Loading X of Y" while a bulk action loads', async () => {
    const { user, queryOptions } = renderFilter();
    await openFilter(user);
    const releaseQueries = holdQueries(queryOptions);

    await user.click(screen.getByLabelText(SELECT_ALL));

    expect(screen.getByText(LOAD_MORE).closest('button')).toBeDisabled();
    expect(
      screen.getByText(`Loading ${TEST_PAGE_SIZE} of ${allTestValues.length}`)
    ).toBeInTheDocument();
    releaseQueries();
    await waitFor(() => expect(screen.queryByText(LOAD_MORE)).not.toBeInTheDocument());
  });

  it('disables the options and the bulk selector while "Select all" loads', async () => {
    const { user, getValues, queryOptions } = renderFilter();
    await openFilter(user);
    const pagedQuery = queryOptions.getMockImplementation()!;
    let releaseQuery = () => {};
    const queryReleased = new Promise<void>((resolve) => (releaseQuery = resolve));
    queryOptions.mockImplementationOnce(async (query) => {
      await queryReleased;
      return pagedQuery(query);
    });

    await user.click(screen.getByLabelText(SELECT_ALL));

    expect(screen.getByLabelText(firstOption.label)).toBeDisabled();
    expect(getBulkCheckbox()).toBeDisabled();
    expect(screen.getByLabelText(SEARCH_INPUT)).toBeDisabled();
    releaseQuery();
    await waitFor(() => expect(getValues()).toEqual(allTestValues));
    expect(screen.getByLabelText(firstOption.label)).toBeEnabled();
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

  it('shows every option the server matched for the search', async () => {
    // The fake API matches the label case-sensitively, so a label without the search text in
    // it can only come from the server's own matching.
    const queryOptions = createTestQueryOptions();
    const pagedQuery = queryOptions.getMockImplementation()!;
    queryOptions.mockImplementation(async (query) => {
      const result = await pagedQuery(query);
      return query.search
        ? { ...result, options: [...result.options, { label: 'Matched by id', value: '99' }] }
        : result;
    });
    const { user, getValues } = renderFilter({ queryOptions });
    await openFilter(user);
    await search(user, TEST_SEARCH);

    expect(screen.getByLabelText('Matched by id')).toBeInTheDocument();
    await user.click(screen.getByLabelText(SELECT_ALL_MATCHING));
    await waitFor(() => expect(getValues()).toEqual(sortValues([...TEST_MATCH_VALUES, '99'])));
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

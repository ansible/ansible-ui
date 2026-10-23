import { PageAsyncQueryErrorText } from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSelectOptions';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BULK_PAGE_SIZE } from '../common/useAutomationDashboardAsyncOptions';
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
const ALL_MATCHING = 'All matching';
const BULK_SELECTION = 'Bulk selection';
const INVERT_SELECTION = 'Invert selection';
const SELECT_ALL = 'Select all';
const SELECT_ALL_MATCHING = 'Select all matching';
const DESELECT_ALL_MATCHING = 'Deselect all matching';
const REQUEST_FAILED = 'Request failed';
const LOADING = 'Loading...';
const [firstOption] = testOptions;

interface RenderFilterOptions {
  initialValues?: string[];
  queryOptions?: ReturnType<typeof createTestQueryOptions>;
  queryErrorText?: PageAsyncQueryErrorText;
}

function renderFilter(options: RenderFilterOptions = {}) {
  const queryOptions = options.queryOptions ?? createTestQueryOptions();
  let latestValues = options.initialValues;
  let setLatestValues: (values: string[] | undefined) => void = () => {};
  let resetFilters = () => {};
  function StatefulFilter() {
    const [values, setValues] = useState(options.initialValues);
    const [resetKey, setResetKey] = useState(0);
    latestValues = values;
    setLatestValues = setValues;
    resetFilters = () => {
      setValues(undefined);
      setResetKey((key) => key + 1);
    };
    return (
      <AutomationDashboardAsyncMultiSelectFilter
        id="filter"
        placeholder={PLACEHOLDER}
        values={values}
        onSelect={(setter) => setValues((previous) => setter(previous))}
        queryOptions={queryOptions}
        queryErrorText={options.queryErrorText}
        resetKey={resetKey}
      />
    );
  }
  render(<StatefulFilter />);
  return {
    queryOptions,
    getValues: () => sortValues(latestValues),
    /** Changes the selection from outside the select, as removing a toolbar chip does. */
    setValues: (values: string[] | undefined) => act(() => setLatestValues(values)),
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
  await user.click(screen.getByLabelText('Search input'));
  await user.paste(text);
  // The search is debounced (200 ms) before the options are queried again; the bulk selector is
  // enabled again once the queried options are loaded.
  await waitFor(
    () => {
      expect(screen.queryByLabelText(firstOption.label)).not.toBeInTheDocument();
      expect(screen.getByLabelText(BULK_SELECTION)).toBeEnabled();
    },
    { timeout: 3000 }
  );
}

async function runBulkAction(user: ReturnType<typeof userEvent.setup>, item: string) {
  await user.click(screen.getByLabelText(BULK_SELECTION));
  await user.click(screen.getByText(item));
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

    await user.click(screen.getByText('Load more'));

    await screen.findByLabelText(testOptions[13].label);
    expect(screen.queryByText('Load more')).not.toBeInTheDocument();
  });

  it('"Select all" without a search loads every page and selects every option', async () => {
    const { user, getValues, queryOptions } = renderFilter();
    await openFilter(user);

    await runBulkAction(user, SELECT_ALL);

    await waitFor(() => expect(getValues()).toEqual(allTestValues));
    expect(getToggle()).toHaveTextContent(ALL_MATCHING);
    expect(queryOptions).toHaveBeenLastCalledWith(
      expect.objectContaining({ pageSize: BULK_PAGE_SIZE })
    );
  });

  it('"Select all" with a search selects only the matching options, replacing the selection', async () => {
    const { user, getValues } = renderFilter({ initialValues: [firstOption.value] });
    await openFilter(user);
    await search(user, TEST_SEARCH);

    await runBulkAction(user, SELECT_ALL);

    await waitFor(() => expect(getValues()).toEqual(TEST_MATCH_VALUES));
    expect(getToggle()).toHaveTextContent(ALL_MATCHING);
  });

  it('shows the count instead of "All matching" once the search of "Select all" changes', async () => {
    const { user, getValues } = renderFilter();
    await openFilter(user);
    await search(user, TEST_SEARCH);
    await runBulkAction(user, SELECT_ALL);
    await waitFor(() => expect(getValues()).toEqual(TEST_MATCH_VALUES));
    expect(getToggle()).toHaveTextContent(ALL_MATCHING);

    await closeFilter(user);

    expect(getToggle()).toHaveTextContent(`${TEST_MATCH_VALUES.length} selected`);
  });

  it('shows the count again once the selection changes after "Select all"', async () => {
    const { user } = renderFilter();
    await openFilter(user);
    await runBulkAction(user, SELECT_ALL);
    await waitFor(() => expect(getToggle()).toHaveTextContent(ALL_MATCHING));

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
    const { user, getValues } = renderFilter({ initialValues: [firstOption.value] });
    await openFilter(user);
    await search(user, 'no match');
    await screen.findByText('No results found');

    await user.click(screen.getByLabelText(BULK_SELECTION));

    expect(screen.getByRole('menuitem', { name: SELECT_ALL })).toBeDisabled();
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
        .type(screen.getByLabelText('Search input'), TEST_SEARCH);

      expect(screen.getByLabelText(BULK_SELECTION)).toBeDisabled();
      act(() => {
        vi.advanceTimersByTime(200);
      });
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
    await waitFor(() => expect(screen.getByLabelText(BULK_SELECTION)).toBeEnabled());
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
    expect(screen.getByLabelText('Search input')).toHaveValue('');
  });

  it('"Invert selection" inverts every option regardless of the search', async () => {
    const { user, getValues } = renderFilter();
    await openFilter(user);
    await search(user, TEST_SEARCH);
    await runBulkAction(user, SELECT_ALL);
    await waitFor(() => expect(getValues()).toEqual(TEST_MATCH_VALUES));

    await runBulkAction(user, INVERT_SELECTION);

    await waitFor(() =>
      expect(getValues()).toEqual(
        allTestValues.filter((value) => !TEST_MATCH_VALUES.includes(value))
      )
    );
    expect(getToggle()).toHaveTextContent(
      `${allTestValues.length - TEST_MATCH_VALUES.length} selected`
    );
    expect(screen.getAllByLabelText(/Test job/)).toHaveLength(TEST_MATCH_VALUES.length);
  });

  it('"Invert selection" loads the remaining options when not every unloaded option is selected', async () => {
    const lastValue = allTestValues[allTestValues.length - 1];
    const { user, getValues, queryOptions } = renderFilter({
      initialValues: [firstOption.value, lastValue],
    });
    await openFilter(user);
    queryOptions.mockClear();

    await runBulkAction(user, INVERT_SELECTION);

    await waitFor(() =>
      expect(getValues()).toEqual(
        allTestValues.filter((value) => value !== firstOption.value && value !== lastValue)
      )
    );
    expect(queryOptions).toHaveBeenCalled();
  });

  // Selected values that are not options (e.g. deleted ones) must not stand in for unselected
  // options that are not loaded.
  it('"Invert selection" selects the unselected options that are not loaded', async () => {
    const { user, getValues } = renderFilter({ initialValues: ['12', '13', '14', '999'] });
    await openFilter(user);

    await runBulkAction(user, INVERT_SELECTION);

    await waitFor(() => expect(getValues()).toEqual(allTestValues.slice(0, 11)));
  });

  it('cancels "Invert selection" when the selection changes while it loads', async () => {
    const { user, getValues, setValues, queryOptions } = renderFilter({
      initialValues: [firstOption.value, '2'],
    });
    await openFilter(user);
    const releaseQueries = holdQueries(queryOptions);

    await runBulkAction(user, INVERT_SELECTION);
    // A removed chip.
    setValues([firstOption.value]);
    releaseQueries();

    await waitFor(() => expect(screen.getByLabelText(BULK_SELECTION)).toBeEnabled());
    expect(getValues()).toEqual([firstOption.value]);
  });

  it('still cancels a bulk action after a cancelled one resolved late', async () => {
    const { user, getValues, setValues, queryOptions } = renderFilter({
      initialValues: [firstOption.value, '2'],
    });
    await openFilter(user);
    const releaseInvert = holdQueries(queryOptions);
    await runBulkAction(user, INVERT_SELECTION);
    // A removed chip cancels "Invert selection"; its query is still running.
    setValues([firstOption.value]);
    await waitFor(() => expect(screen.getByLabelText(BULK_SELECTION)).toBeEnabled());

    const releaseSelectAll = holdQueries(queryOptions);
    await runBulkAction(user, SELECT_ALL);
    releaseInvert();
    // Another removed chip, after the cancelled action resolved.
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
    setValues([]);
    releaseSelectAll();

    await waitFor(() => expect(screen.getByLabelText(BULK_SELECTION)).toBeEnabled());
    expect(getValues()).toEqual([]);
  });

  it('treats a search of only spaces as no search', async () => {
    const { user, queryOptions } = renderFilter();
    await openFilter(user);
    queryOptions.mockClear();

    await user.click(screen.getByLabelText('Search input'));
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

    await runBulkAction(user, SELECT_ALL);
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

  it('keeps the focus in the menu while "Invert selection" loads and gives it back afterwards', async () => {
    const { user, getValues, queryOptions } = renderFilter();
    await openFilter(user);
    const releaseQueries = holdQueries(queryOptions);

    await runBulkAction(user, INVERT_SELECTION);
    expect(document.getElementById('filter-select')).toHaveFocus();
    releaseQueries();

    await waitFor(() => expect(getValues()).toEqual(allTestValues));
    expect(screen.getByLabelText(BULK_SELECTION)).toHaveFocus();
  });

  it('cancels "Select all" on an empty filter when the filters are reset while it loads', async () => {
    const { user, getValues, resetFilters, queryOptions } = renderFilter();
    await openFilter(user);
    const releaseQueries = holdQueries(queryOptions);

    await runBulkAction(user, SELECT_ALL);
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

  it('"Invert selection" with a search loads every option only once while the select is open', async () => {
    const { user, getValues, queryOptions } = renderFilter();
    await openFilter(user);
    await search(user, TEST_SEARCH);
    await runBulkAction(user, INVERT_SELECTION);
    await waitFor(() => expect(getValues()).toEqual(allTestValues));
    queryOptions.mockClear();

    await runBulkAction(user, INVERT_SELECTION);

    await waitFor(() => expect(getValues()).toEqual([]));
    expect(queryOptions).not.toHaveBeenCalled();
  });

  it('shows a failed "Invert selection" in the open select and keeps the search', async () => {
    const { user, getValues, queryOptions } = renderFilter({
      queryErrorText: 'Failed to load options.',
    });
    await openFilter(user);
    await search(user, TEST_SEARCH);
    // "Invert selection" with a search queries every option without the search.
    queryOptions.mockRejectedValueOnce(new Error(REQUEST_FAILED));

    await runBulkAction(user, INVERT_SELECTION);

    expect(await screen.findByText('Failed to load options.')).toBeInTheDocument();
    expect(getToggle()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByLabelText('Search input')).toHaveValue(TEST_SEARCH);
    expect(screen.getAllByLabelText(/Test job/)).toHaveLength(TEST_MATCH_VALUES.length);
    expect(getValues()).toEqual([]);
  });

  it('tells that not every option could be loaded instead of the query error text', async () => {
    const { user, getValues, queryOptions } = renderFilter({
      queryErrorText: 'Failed to load options.',
    });
    await openFilter(user);
    // The bulk load gets the same page again: it stops with options missing.
    queryOptions.mockResolvedValue({ options: testOptions.slice(0, 5), remaining: 9, next: 2 });

    await runBulkAction(user, INVERT_SELECTION);

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

    await user.click(screen.getByText('Load more'));
    await waitFor(() => expect(screen.queryByText('Load more')).not.toBeInTheDocument());

    expect(screen.getByLabelText('Select none')).toBePartiallyChecked();
  });

  it('keeps every match selected with "Select all matching" when not every match is loaded', async () => {
    // "Option" matches 11 options: one more than the first page.
    const optionMatches = testOptions.filter((option) => option.label.includes('Option'));
    const matchValues = sortValues(optionMatches.map((option) => option.value));
    const { user, getValues } = renderFilter();
    /** Searches "Option": its first page shows the same first option as no search. */
    const searchOption = async () => {
      await user.click(screen.getByLabelText('Search input'));
      await user.paste('Option');
      await screen.findByText(`Loaded ${TEST_PAGE_SIZE} of ${optionMatches.length}`, undefined, {
        timeout: 3000,
      });
      await waitFor(() => expect(screen.getByLabelText(BULK_SELECTION)).toBeEnabled());
    };
    await openFilter(user);
    await searchOption();
    await runBulkAction(user, SELECT_ALL);
    await waitFor(() => expect(getValues()).toEqual(matchValues));
    await closeFilter(user);
    await openFilter(user);
    await searchOption();
    expect(screen.getByLabelText(SELECT_ALL_MATCHING)).toBePartiallyChecked();

    await user.click(screen.getByLabelText(SELECT_ALL_MATCHING));

    await waitFor(() => expect(screen.getByLabelText(DESELECT_ALL_MATCHING)).toBeChecked());
    expect(getValues()).toEqual(matchValues);
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

  it('does not show "All matching" for matches selected again by hand after removing them', async () => {
    const { user, getValues } = renderFilter();
    await openFilter(user);
    await search(user, TEST_SEARCH);
    await user.click(screen.getByLabelText(SELECT_ALL_MATCHING));
    await waitFor(() => expect(getToggle()).toHaveTextContent(ALL_MATCHING));
    await user.click(await screen.findByLabelText(DESELECT_ALL_MATCHING));
    await waitFor(() => expect(getValues()).toEqual([]));

    for (const value of TEST_MATCH_VALUES) {
      await user.click(screen.getByLabelText(`${TEST_MATCH_LABEL} ${value}`));
    }

    await waitFor(() => expect(getValues()).toEqual(TEST_MATCH_VALUES));
    expect(getToggle()).toHaveTextContent(`${TEST_MATCH_VALUES.length} selected`);
  });

  it('completes "Invert selection" after the select closes and shows a spinner meanwhile', async () => {
    const { user, getValues, queryOptions } = renderFilter({ initialValues: [firstOption.value] });
    await openFilter(user);
    const releaseQueries = holdQueries(queryOptions);

    await runBulkAction(user, INVERT_SELECTION);
    await closeFilter(user);
    expect(within(getToggle()).getByLabelText(LOADING)).toBeInTheDocument();
    releaseQueries();

    await waitFor(() => expect(getValues()).toEqual(allTestValues.slice(1)));
    expect(getToggle()).toHaveTextContent(`${allTestValues.length - 1} selected`);
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

    await runBulkAction(user, INVERT_SELECTION);
    await closeFilter(user);
    act(() => rejectQuery(new Error(REQUEST_FAILED)));

    await waitFor(() => expect(getToggle()).toHaveClass('pf-m-danger'));
    await user.click(getToggle());
    expect(await screen.findByText('Failed to load options.')).toBeInTheDocument();
    expect(getValues()).toEqual([firstOption.value]);
  });

  it('disables "Load more" while a bulk action loads', async () => {
    const { user, queryOptions } = renderFilter();
    await openFilter(user);
    const releaseQueries = holdQueries(queryOptions);

    await runBulkAction(user, INVERT_SELECTION);

    expect(screen.getByText('Load more').closest('button')).toBeDisabled();
    releaseQueries();
    await waitFor(() => expect(screen.queryByText('Load more')).not.toBeInTheDocument());
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
    expect(screen.getByLabelText(BULK_SELECTION)).toBeDisabled();
    expect(screen.getByLabelText('Search input')).toBeDisabled();
    releaseQuery();
    await waitFor(() => expect(getValues()).toEqual(allTestValues));
    expect(screen.getByLabelText(firstOption.label)).toBeEnabled();
  });

  it('keeps the select open while using the bulk selector', async () => {
    const { user } = renderFilter();
    await openFilter(user);

    await runBulkAction(user, SELECT_ALL);

    expect(getToggle()).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows a failed "Load more" in the open select and keeps the loaded options', async () => {
    const { user, queryOptions } = renderFilter({ queryErrorText: 'Failed to load options.' });
    await openFilter(user);
    queryOptions.mockRejectedValueOnce(new Error(REQUEST_FAILED));

    await user.click(screen.getByText('Load more'));

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
    await user.click(screen.getByLabelText('Search input'));
    await user.paste(TEST_SEARCH);
    expect(await screen.findByText('Error loading options')).toBeInTheDocument();

    await closeFilter(user);
    await openFilter(user);

    expect(screen.getByLabelText('Search input')).toHaveValue('');
    expect(screen.queryByText('Error loading options')).not.toBeInTheDocument();
  });

  it('clears a failed "Load more" when another search loads', async () => {
    const { user, queryOptions } = renderFilter({ queryErrorText: 'Failed to load options.' });
    await openFilter(user);
    queryOptions.mockRejectedValueOnce(new Error(REQUEST_FAILED));
    await user.click(screen.getByText('Load more'));
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
    await runBulkAction(user, SELECT_ALL);
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

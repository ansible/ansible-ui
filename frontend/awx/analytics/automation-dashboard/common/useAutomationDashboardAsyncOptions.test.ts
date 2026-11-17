import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  allTestValues,
  createTestQueryOptions,
  sortValues,
  TEST_MATCH_VALUES,
  TEST_PAGE_SIZE,
  TEST_SEARCH,
} from '../components/asyncMultiSelect.testUtils';
import {
  BULK_PAGE_SIZE,
  useAutomationDashboardAsyncOptions,
} from './useAutomationDashboardAsyncOptions';

const BULK_FAILED = 'Bulk failed';
/** What a load that has not resolved yet holds. */
const NOT_RESOLVED = 'not resolved';
const INCOMPLETE = 'Not every option could be loaded.';

type HookProps = { search: string; isOpen: boolean };

/** An open select without a search, the default of `renderAsyncOptions`. */
const OPEN_WITHOUT_SEARCH: HookProps = { search: '', isOpen: true };

function renderAsyncOptions(
  queryOptions = createTestQueryOptions(),
  initialProps: HookProps = OPEN_WITHOUT_SEARCH
) {
  const hook = renderHook(
    ({ search, isOpen }: HookProps) =>
      useAutomationDashboardAsyncOptions(queryOptions, search, isOpen),
    { initialProps }
  );
  return { ...hook, queryOptions };
}

async function renderFirstPage(search = '') {
  const rendered = renderAsyncOptions(createTestQueryOptions(), { search, isOpen: true });
  await waitFor(() => expect(rendered.result.current.loading).toBe(false));
  return rendered;
}

/** An option labelled by its value. */
function option(value: string) {
  return { label: `Option ${value}`, value };
}

/** The option values in numeric order (the hook sorts the options by label). */
function values(options: { value: string }[] | undefined) {
  return sortValues(options?.map((option) => option.value));
}

describe('useAutomationDashboardAsyncOptions', () => {
  it('does not query while the select is closed', () => {
    const { result, queryOptions } = renderAsyncOptions(createTestQueryOptions(), {
      search: '',
      isOpen: false,
    });

    expect(queryOptions).not.toHaveBeenCalled();
    expect(result.current.options).toEqual([]);
  });

  it('loads the first page when the select opens', async () => {
    const { result } = await renderFirstPage();

    expect(result.current.options).toHaveLength(TEST_PAGE_SIZE);
    expect(result.current.total).toBe(allTestValues.length);
    expect(result.current.allLoaded).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('loads the next page with loadMore', async () => {
    const { result } = await renderFirstPage();

    act(() => result.current.loadMore());

    await waitFor(() => expect(result.current.allLoaded).toBe(true));
    expect(values(result.current.options)).toEqual(allTestValues);
  });

  it('queries again with the search when the search changes', async () => {
    const { result, rerender, queryOptions } = await renderFirstPage();

    rerender({ search: TEST_SEARCH, isOpen: true });

    await waitFor(() => expect(values(result.current.options)).toEqual(TEST_MATCH_VALUES));
    expect(queryOptions).toHaveBeenLastCalledWith(expect.objectContaining({ search: TEST_SEARCH }));
    expect(result.current.allLoaded).toBe(true);
  });

  it('loadAll loads the remaining pages and flags loadingAll meanwhile', async () => {
    const queryOptions = createTestQueryOptions(20);
    const { result } = renderAsyncOptions(queryOptions);
    await waitFor(() => expect(result.current.options).toHaveLength(TEST_PAGE_SIZE));

    let loadAll: Promise<unknown> = Promise.resolve();
    act(() => {
      loadAll = result.current.loadAll();
    });
    expect(result.current.loadingAll).toBe(true);

    let loaded: unknown;
    await act(async () => {
      loaded = await loadAll;
    });
    expect(values(loaded as { value: string }[])).toEqual(allTestValues);
    expect(result.current.loadingAll).toBe(false);
    expect(result.current.allLoaded).toBe(true);
  });

  it('loadAll queries again from the first page with the bulk page size', async () => {
    const { result, queryOptions } = await renderFirstPage();
    queryOptions.mockClear();

    await act(async () => {
      await result.current.loadAll();
    });

    expect(queryOptions).toHaveBeenCalledTimes(1);
    expect(queryOptions).toHaveBeenCalledWith(
      expect.objectContaining({ next: undefined, pageSize: BULK_PAGE_SIZE })
    );
    expect(values(result.current.options)).toEqual(allTestValues);
  });

  it('loadAll does not query when every option is loaded', async () => {
    const { result, queryOptions } = await renderFirstPage(TEST_SEARCH);
    queryOptions.mockClear();

    let loaded: unknown;
    await act(async () => {
      loaded = await result.current.loadAll();
    });

    expect(queryOptions).not.toHaveBeenCalled();
    expect(values(loaded as { value: string }[])).toEqual(TEST_MATCH_VALUES);
  });

  it('clears the error of a failed bulk load when a bulk load uses the loaded options', async () => {
    const { result, queryOptions } = await renderFirstPage();
    queryOptions.mockRejectedValueOnce(new Error(BULK_FAILED));
    await act(async () => {
      await result.current.loadAll();
    });
    expect(result.current.bulkError?.message).toBe(BULK_FAILED);
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.allLoaded).toBe(true));
    queryOptions.mockClear();

    let loaded: unknown;
    await act(async () => {
      loaded = await result.current.loadAll();
    });

    expect(queryOptions).not.toHaveBeenCalled();
    expect(values(loaded as { value: string }[])).toEqual(allTestValues);
    expect(result.current.bulkError).toBeUndefined();
  });

  it('stops paging when a page is empty although the API reports remaining options, as a partial load', async () => {
    const queryOptions = vi
      .fn()
      .mockResolvedValueOnce({ options: [{ label: 'First', value: '1' }], remaining: 5, next: 2 })
      .mockResolvedValue({ options: [], remaining: 5, next: 3 });
    const { result } = renderAsyncOptions(queryOptions);
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.loadAll();
    });

    expect(queryOptions).toHaveBeenCalledTimes(2);
    // Fewer options than the API reported: a bulk action must not use them.
    expect(result.current.bulkError?.message).toBe(INCOMPLETE);
    expect(result.current.allLoaded).toBe(false);
  });

  it('keeps "Load more" after an empty page the API reports more options for', async () => {
    const queryOptions = vi
      .fn()
      .mockResolvedValueOnce({ options: [option('1')], remaining: 2, next: 2 })
      .mockResolvedValueOnce({ options: [], remaining: 1, next: 3 })
      .mockResolvedValueOnce({ options: [option('3')], remaining: 0, next: 4 });
    const { result } = renderAsyncOptions(queryOptions);
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.loadMore());
    await waitFor(() => expect(queryOptions).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.loading).toBe(false));
    // The later pages stay reachable.
    expect(result.current.allLoaded).toBe(false);
    expect(result.current.total).toBe(2);

    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.allLoaded).toBe(true));
    expect(queryOptions).toHaveBeenLastCalledWith(expect.objectContaining({ next: 3 }));
    expect(values(result.current.options)).toEqual(['1', '3']);
  });

  it('reports a load as partial when its pages hold fewer options than the API reported', async () => {
    // The pages overlap (e.g. ordered by names that are not unique): option 2 comes twice.
    const queryOptions = vi.fn(({ next }: { next?: number | string }) =>
      Promise.resolve(
        Number(next ?? 1) === 1
          ? { options: [option('1'), option('2')], remaining: 2, next: 2 }
          : { options: [option('2'), option('3')], remaining: 0, next: 3 }
      )
    );
    const { result } = renderAsyncOptions(queryOptions);
    await waitFor(() => expect(result.current.loading).toBe(false));

    let loaded: unknown = NOT_RESOLVED;
    await act(async () => {
      loaded = await result.current.loadAll();
    });

    expect(loaded).toBeUndefined();
    expect(result.current.bulkError?.message).toBe(INCOMPLETE);
  });

  it('loads every option again for a bulk action when the pages loaded with "Load more" overlap', async () => {
    // "Load more" gets option 2 again and never option 3: the pages miss an option.
    const queryOptions = vi.fn(
      ({ next, pageSize }: { next?: number | string; pageSize?: number }) => {
        if (pageSize) {
          return Promise.resolve({
            options: [option('1'), option('2'), option('3')],
            remaining: 0,
            next: 2,
          });
        }
        if (Number(next ?? 1) === 1) {
          return Promise.resolve({ options: [option('1'), option('2')], remaining: 1, next: 2 });
        }
        return Promise.resolve({ options: [option('2')], remaining: 0, next: 3 });
      }
    );
    const { result } = renderAsyncOptions(queryOptions);
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.allLoaded).toBe(true));
    // No more pages, but not every option: the selection state of every option is not known.
    expect(result.current.isComplete).toBe(false);
    queryOptions.mockClear();

    let loaded: unknown;
    await act(async () => {
      loaded = await result.current.loadAll();
    });

    expect(queryOptions).toHaveBeenCalledWith(
      expect.objectContaining({ pageSize: BULK_PAGE_SIZE })
    );
    expect(values(loaded as { value: string }[])).toEqual(['1', '2', '3']);
    expect(result.current.isComplete).toBe(true);
  });

  it('shows the labels of a bulk load over the ones loaded before (e.g. a renamed option)', async () => {
    const queryOptions = vi.fn(({ pageSize }: { pageSize?: number }) =>
      Promise.resolve(
        pageSize
          ? { options: [{ label: 'New name', value: '1' }, option('2')], remaining: 0, next: 2 }
          : { options: [{ label: 'Old name', value: '1' }], remaining: 1, next: 2 }
      )
    );
    const { result } = renderAsyncOptions(queryOptions);
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.loadAll();
    });

    expect(result.current.options.find((loaded) => loaded.value === '1')?.label).toBe('New name');
  });

  it('stops paging when the API repeats a page and reports the partial load as an error', async () => {
    const page = { options: [{ label: 'First', value: '1' }], remaining: 5, next: 2 };
    const queryOptions = vi.fn().mockResolvedValue(page);
    const { result } = renderAsyncOptions(queryOptions);
    await waitFor(() => expect(result.current.loading).toBe(false));
    queryOptions.mockClear();

    let loaded: unknown = NOT_RESOLVED;
    await act(async () => {
      loaded = await result.current.loadAll();
    });

    // The first page is new to this load; the repeated second one ends it.
    expect(queryOptions).toHaveBeenCalledTimes(2);
    expect(loaded).toBeUndefined();
    expect(result.current.bulkError?.message).toBe(INCOMPLETE);
    expect(result.current.loadingAll).toBe(false);

    // "Load more" continues with the cursor of the default page size.
    queryOptions.mockClear();
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(queryOptions).toHaveBeenCalledWith(
      expect.objectContaining({ next: 2, pageSize: undefined })
    );
  });

  it('keeps the options when "Load more" fails and reports the error as loadMoreError', async () => {
    const { result, queryOptions } = await renderFirstPage();
    queryOptions.mockRejectedValueOnce(new Error('More failed'));

    act(() => result.current.loadMore());

    await waitFor(() => expect(result.current.loadMoreError?.message).toBe('More failed'));
    expect(result.current.error).toBeUndefined();
    expect(result.current.options).toHaveLength(TEST_PAGE_SIZE);
  });

  it('sets the error when the query fails and clears it on reload', async () => {
    const queryOptions = createTestQueryOptions();
    queryOptions.mockRejectedValueOnce(new Error('Request failed'));
    const { result } = renderAsyncOptions(queryOptions);

    await waitFor(() => expect(result.current.error?.message).toBe('Request failed'));
    expect(result.current.loading).toBe(false);

    act(() => result.current.reload());

    await waitFor(() => expect(result.current.options).toHaveLength(TEST_PAGE_SIZE));
    expect(result.current.error).toBeUndefined();
  });

  it('wraps a non-Error failure in an Error', async () => {
    const queryOptions = createTestQueryOptions();
    queryOptions.mockRejectedValueOnce('failed');
    const { result } = renderAsyncOptions(queryOptions);

    await waitFor(() => expect(result.current.error?.message).toBe('Unknown error'));
  });

  it('drops the shown options when the select closes, so it opens without the old ones', async () => {
    const { result, rerender } = await renderFirstPage(TEST_SEARCH);
    expect(values(result.current.options)).toEqual(TEST_MATCH_VALUES);

    rerender({ search: '', isOpen: false });

    expect(result.current.options).toEqual([]);
    expect(result.current.search).toBeUndefined();

    rerender({ search: '', isOpen: true });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.options).toHaveLength(TEST_PAGE_SIZE);
  });

  it('completes loadAll after the select closes', async () => {
    const queryOptions = createTestQueryOptions(20);
    const { result, rerender } = renderAsyncOptions(queryOptions);
    await waitFor(() => expect(result.current.loading).toBe(false));

    let loaded: Promise<unknown> = Promise.resolve();
    act(() => {
      loaded = result.current.loadAll();
    });
    expect(result.current.loadingAll).toBe(true);
    rerender({ search: '', isOpen: false });

    let loadedOptions: unknown;
    await act(async () => {
      loadedOptions = await loaded;
    });
    expect(values(loadedOptions as { value: string }[])).toEqual(allTestValues);
    expect(result.current.loadingAll).toBe(false);
  });

  it('keeps every option of a bulk load that finished before a running "Load more"', async () => {
    const pagedQuery = createTestQueryOptions().getMockImplementation()!;
    const queryOptions = vi.fn(async (query: Parameters<typeof pagedQuery>[0]) => {
      // "Load more" (the second page with the default page size) answers last.
      if (query.next && !query.pageSize) await new Promise((resolve) => setTimeout(resolve, 100));
      return pagedQuery(query);
    });
    const { result } = renderAsyncOptions(queryOptions);
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.loadMore());
    await act(async () => {
      await result.current.loadAll();
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(values(result.current.options)).toEqual(allTestValues);
    expect(result.current.allLoaded).toBe(true);
  });

  it('reports only the newly loaded options', async () => {
    const onOptionsLoaded = vi.fn();
    const queryOptions = createTestQueryOptions();
    const { result } = renderHook(() =>
      useAutomationDashboardAsyncOptions(queryOptions, '', true, onOptionsLoaded)
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(onOptionsLoaded).toHaveBeenLastCalledWith(expect.any(Array));
    expect(onOptionsLoaded.mock.lastCall?.[0]).toHaveLength(TEST_PAGE_SIZE);

    act(() => result.current.loadMore());

    await waitFor(() => expect(result.current.allLoaded).toBe(true));
    expect(onOptionsLoaded.mock.lastCall?.[0]).toHaveLength(allTestValues.length - TEST_PAGE_SIZE);
  });

  it('cancelBulk aborts the running bulk load', async () => {
    const queryOptions = createTestQueryOptions(50);
    const { result } = renderAsyncOptions(queryOptions);
    await waitFor(() => expect(result.current.loading).toBe(false));

    let loaded: Promise<unknown> = Promise.resolve();
    act(() => {
      loaded = result.current.loadAll();
    });
    act(() => result.current.cancelBulk());

    expect(result.current.loadingAll).toBe(false);
    await act(async () => {
      expect(await loaded).toBeUndefined();
    });
    expect(result.current.allLoaded).toBe(false);
  });

  it('clears the error of the first page when the select closes', async () => {
    const queryOptions = createTestQueryOptions();
    queryOptions.mockRejectedValueOnce(new Error('Request failed'));
    const { result, rerender } = renderAsyncOptions(queryOptions);
    await waitFor(() => expect(result.current.error?.message).toBe('Request failed'));

    rerender({ search: '', isOpen: false });

    expect(result.current.error).toBeUndefined();
  });

  it('aborts the bulk load when it unmounts', () => {
    const queryOptions = createTestQueryOptions(50);
    const { result, unmount } = renderAsyncOptions(queryOptions);
    act(() => void result.current.loadAll());
    const bulkQuery = queryOptions.mock.calls.find(([query]) => query.pageSize === BULK_PAGE_SIZE);

    unmount();

    expect(bulkQuery?.[0].signal.aborted).toBe(true);
  });

  it('calls the latest queryOptions it was given', async () => {
    const first = createTestQueryOptions();
    const latest = createTestQueryOptions();
    const { result, rerender } = renderHook(
      ({ queryOptions }) => useAutomationDashboardAsyncOptions(queryOptions, '', true),
      { initialProps: { queryOptions: first } }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    rerender({ queryOptions: latest });
    act(() => result.current.loadMore());

    await waitFor(() => expect(result.current.allLoaded).toBe(true));
    expect(latest).toHaveBeenCalled();
    expect(first).toHaveBeenCalledTimes(1);
  });

  it('loadAll queries the current search although the options of another search are loaded', async () => {
    const { result, rerender, queryOptions } = await renderFirstPage();
    await act(async () => {
      await result.current.loadAll();
    });
    // The search changes while the select is closed, so no reset load runs.
    rerender({ search: TEST_SEARCH, isOpen: false });
    queryOptions.mockClear();

    let loaded: unknown;
    await act(async () => {
      loaded = await result.current.loadAll();
    });

    expect(queryOptions).toHaveBeenCalledWith(expect.objectContaining({ search: TEST_SEARCH }));
    expect(values(loaded as { value: string }[])).toEqual(TEST_MATCH_VALUES);
  });

  it('keeps the options when loadAll fails and reports the error as bulkError', async () => {
    const { result, queryOptions } = await renderFirstPage();
    queryOptions.mockRejectedValueOnce(new Error(BULK_FAILED));

    await act(async () => {
      await result.current.loadAll();
    });

    expect(result.current.bulkError?.message).toBe(BULK_FAILED);
    expect(result.current.error).toBeUndefined();
    expect(result.current.options).toHaveLength(TEST_PAGE_SIZE);
  });

  it('aborts the running query when the select closes', () => {
    const queryOptions = createTestQueryOptions(50);
    const { rerender } = renderAsyncOptions(queryOptions);
    const [{ signal }] = queryOptions.mock.calls[0];

    rerender({ search: '', isOpen: false });

    expect(signal.aborted).toBe(true);
  });
});

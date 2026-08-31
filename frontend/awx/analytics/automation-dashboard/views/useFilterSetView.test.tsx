/* eslint-disable i18next/no-literal-string */
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { metricsAPI } from '../../../common/api/metrics-utils';
import type { IDashboardFilterSet } from '../types';
import { useFilterSetView } from './useFilterSetView';
import { dashboardFilterSetKey } from '../utils/persistedFilterState';

const USER_ID = 42;

const { mockUseAwxActiveUser } = vi.hoisted(() => ({
  mockUseAwxActiveUser: vi.fn(() => ({ activeAwxUser: { id: USER_ID } })),
}));

vi.mock('../../../common/useAwxActiveUser', () => ({
  useAwxActiveUser: mockUseAwxActiveUser,
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const filterSetA: IDashboardFilterSet = {
  id: 1,
  name: 'Report A',
  filters: '{"period":["last_7_days"]}',
  is_default: false,
};

const filterSetB: IDashboardFilterSet = {
  id: 2,
  name: 'Report B',
  filters: '{"period":["last_30_days"]}',
  is_default: true,
};

const pageResponse = (results: IDashboardFilterSet[], next: string | null = null) => ({
  count: results.length,
  next,
  previous: null,
  results,
});

// ─── MSW server ───────────────────────────────────────────────────────────────

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
beforeEach(() => {
  mockUseAwxActiveUser.mockReturnValue({ activeAwxUser: { id: USER_ID } });
});
afterEach(() => {
  server.resetHandlers();
  sessionStorage.clear();
  vi.clearAllMocks();
});
afterAll(() => server.close());

// ─── Tests ────────────────────────────────────────────────────────────────────

function queryOpts(
  search = ''
): Parameters<ReturnType<typeof useFilterSetView>['queryOptions']>[0] {
  return { signal: new AbortController().signal, next: undefined, search };
}

describe('useFilterSetView', () => {
  describe('initial state', () => {
    test('should start with undefined value and empty filterSets', () => {
      const { result } = renderHook(() => useFilterSetView());

      expect(result.current.value).toBeUndefined();
      expect(result.current.version).toBe(0);
      expect(result.current.filterSets).toEqual([]);
      expect(result.current.selectedFilterSet).toBeUndefined();
    });

    test('should expose required functions', () => {
      const { result } = renderHook(() => useFilterSetView());

      expect(result.current.setValue).toBeTypeOf('function');
      expect(result.current.queryOptions).toBeTypeOf('function');
      expect(result.current.setSelectedFilterSet).toBeTypeOf('function');
      expect(result.current.removeFilterSet).toBeTypeOf('function');
      expect(result.current.upsertFilterSet).toBeTypeOf('function');
    });
  });

  describe('session persistence', () => {
    test('should restore the selected filter set persisted earlier in the session', () => {
      sessionStorage.setItem(dashboardFilterSetKey(USER_ID), JSON.stringify(filterSetA));

      const { result } = renderHook(() => useFilterSetView());

      expect(result.current.value).toBe('1');
      expect(result.current.selectedFilterSet).toEqual(filterSetA);
      expect(result.current.filterSets).toContainEqual(filterSetA);
    });

    test('should persist the selection so a remounted hook restores it', () => {
      const first = renderHook(() => useFilterSetView());
      act(() => {
        first.result.current.setSelectedFilterSet(filterSetB);
      });
      first.unmount();

      const second = renderHook(() => useFilterSetView());

      expect(second.result.current.selectedFilterSet).toEqual(filterSetB);
      expect(second.result.current.value).toBe('2');
    });

    test('should clear the persisted selection when deselected', () => {
      sessionStorage.setItem(dashboardFilterSetKey(USER_ID), JSON.stringify(filterSetA));

      const { result } = renderHook(() => useFilterSetView());
      act(() => {
        result.current.setSelectedFilterSet(undefined);
      });

      expect(sessionStorage.getItem(dashboardFilterSetKey(USER_ID))).toBeNull();
    });

    test('should not restore a selection persisted by a different user', () => {
      const OTHER_USER_ID = 7;
      sessionStorage.setItem(dashboardFilterSetKey(OTHER_USER_ID), JSON.stringify(filterSetA));

      const { result } = renderHook(() => useFilterSetView());

      expect(result.current.value).toBeUndefined();
      expect(result.current.selectedFilterSet).toBeUndefined();
    });

    test('should re-seed from the new user when the active user changes mid-session', () => {
      const OTHER_USER_ID = 7;
      sessionStorage.setItem(dashboardFilterSetKey(USER_ID), JSON.stringify(filterSetA));
      sessionStorage.setItem(dashboardFilterSetKey(OTHER_USER_ID), JSON.stringify(filterSetB));

      const { result, rerender } = renderHook(() => useFilterSetView());
      expect(result.current.selectedFilterSet).toEqual(filterSetA);

      mockUseAwxActiveUser.mockReturnValue({ activeAwxUser: { id: OTHER_USER_ID } });
      rerender();

      expect(result.current.selectedFilterSet).toEqual(filterSetB);
      expect(result.current.value).toBe('2');
    });
  });

  describe('setSelectedFilterSet', () => {
    test('should update selectedFilterSet', () => {
      const { result } = renderHook(() => useFilterSetView());

      act(() => {
        result.current.setSelectedFilterSet(filterSetA);
      });

      expect(result.current.selectedFilterSet).toEqual(filterSetA);
    });

    test('should clear selectedFilterSet when set to undefined', () => {
      const { result } = renderHook(() => useFilterSetView());

      act(() => {
        result.current.setSelectedFilterSet(filterSetA);
      });
      act(() => {
        result.current.setSelectedFilterSet(undefined);
      });

      expect(result.current.selectedFilterSet).toBeUndefined();
    });
  });

  describe('upsertFilterSet', () => {
    test('should add a new filter set and set value to its id', () => {
      const { result } = renderHook(() => useFilterSetView());

      act(() => {
        result.current.upsertFilterSet(filterSetA);
      });

      expect(result.current.filterSets).toContainEqual(filterSetA);
      expect(result.current.value).toBe('1');
    });

    test('should increment version on every upsert to force remount', () => {
      const { result } = renderHook(() => useFilterSetView());
      const initialVersion = result.current.version;

      act(() => {
        result.current.upsertFilterSet(filterSetA);
      });

      expect(result.current.version).toBe(initialVersion + 1);
    });

    test('should update an existing filter set by id', () => {
      const { result } = renderHook(() => useFilterSetView());

      act(() => {
        result.current.upsertFilterSet(filterSetA);
      });

      const updated: IDashboardFilterSet = { ...filterSetA, name: 'Report A – Updated' };
      act(() => {
        result.current.upsertFilterSet(updated);
      });

      expect(result.current.filterSets).toHaveLength(1);
      expect(result.current.filterSets[0].name).toBe('Report A – Updated');
    });

    test('should accumulate multiple distinct filter sets', () => {
      const { result } = renderHook(() => useFilterSetView());

      act(() => {
        result.current.upsertFilterSet(filterSetA);
      });
      act(() => {
        result.current.upsertFilterSet(filterSetB);
      });

      expect(result.current.filterSets).toHaveLength(2);
    });
  });

  describe('removeFilterSet', () => {
    test('should remove the filter set and reset value and selectedFilterSet', () => {
      const { result } = renderHook(() => useFilterSetView());

      act(() => {
        result.current.upsertFilterSet(filterSetA);
        result.current.setSelectedFilterSet(filterSetA);
      });

      act(() => {
        result.current.removeFilterSet(filterSetA);
      });

      expect(result.current.filterSets).not.toContainEqual(filterSetA);
      expect(result.current.value).toBeUndefined();
      expect(result.current.selectedFilterSet).toBeUndefined();
    });

    test('should not affect other filter sets when removing one', () => {
      const { result } = renderHook(() => useFilterSetView());

      act(() => {
        result.current.upsertFilterSet(filterSetA);
        result.current.upsertFilterSet(filterSetB);
      });
      act(() => {
        result.current.removeFilterSet(filterSetA);
      });

      expect(result.current.filterSets).toHaveLength(1);
      expect(result.current.filterSets[0]).toEqual(filterSetB);
    });
  });

  describe('queryOptions', () => {
    test('should fetch options from the API and return them', async () => {
      server.use(
        http.get(metricsAPI`/dashboard_reports/filter_sets/`, () =>
          HttpResponse.json(pageResponse([filterSetA, filterSetB]))
        )
      );

      const { result } = renderHook(() => useFilterSetView());

      let options: Awaited<ReturnType<typeof result.current.queryOptions>>;
      await act(async () => {
        options = await result.current.queryOptions(queryOpts());
      });

      expect(options!.options).toEqual([
        { label: 'Report A', value: '1' },
        { label: 'Report B', value: '2' },
      ]);
      expect(options!.remaining).toBe(0);
    });

    test('should merge fetched results into filterSets cache', async () => {
      server.use(
        http.get(metricsAPI`/dashboard_reports/filter_sets/`, () =>
          HttpResponse.json(pageResponse([filterSetA]))
        )
      );

      const { result } = renderHook(() => useFilterSetView());

      await act(async () => {
        await result.current.queryOptions(queryOpts());
      });

      await waitFor(() => {
        expect(result.current.filterSets).toContainEqual(filterSetA);
      });
    });

    test('should not add duplicate entries to the filterSets cache', async () => {
      server.use(
        http.get(metricsAPI`/dashboard_reports/filter_sets/`, () =>
          HttpResponse.json(pageResponse([filterSetA]))
        )
      );

      const { result } = renderHook(() => useFilterSetView());

      // Two sequential calls — React must flush state between them
      await act(async () => {
        await result.current.queryOptions(queryOpts());
      });
      await act(async () => {
        await result.current.queryOptions(queryOpts());
      });

      expect(result.current.filterSets.filter((f) => f.id === filterSetA.id)).toHaveLength(1);
    });

    test('should refresh a stale seeded copy with the fetched server data', async () => {
      sessionStorage.setItem(dashboardFilterSetKey(USER_ID), JSON.stringify(filterSetA));
      const renamed: IDashboardFilterSet = {
        ...filterSetA,
        name: 'Report A (renamed)',
        filters: '{"period":["last_90_days"]}',
      };
      server.use(
        http.get(metricsAPI`/dashboard_reports/filter_sets/`, () =>
          HttpResponse.json(pageResponse([renamed]))
        )
      );

      const { result } = renderHook(() => useFilterSetView());
      expect(result.current.filterSets).toContainEqual(filterSetA);

      await act(async () => {
        await result.current.queryOptions(queryOpts());
      });

      await waitFor(() => {
        expect(result.current.filterSets).toContainEqual(renamed);
      });
      expect(result.current.filterSets).not.toContainEqual(filterSetA);
      expect(result.current.selectedFilterSet).toEqual(renamed);
    });

    test('should leave the cache untouched when the fetched data is identical', async () => {
      server.use(
        http.get(metricsAPI`/dashboard_reports/filter_sets/`, () =>
          HttpResponse.json(pageResponse([filterSetA]))
        )
      );

      const { result } = renderHook(() => useFilterSetView());

      await act(async () => {
        await result.current.queryOptions(queryOpts());
      });
      const afterFirst = result.current.filterSets;

      await act(async () => {
        await result.current.queryOptions(queryOpts());
      });

      expect(result.current.filterSets).toBe(afterFirst);
    });

    test('should include next page token when more pages exist', async () => {
      server.use(
        http.get(metricsAPI`/dashboard_reports/filter_sets/`, () =>
          HttpResponse.json({ ...pageResponse([filterSetA], 'page2'), count: 15 })
        )
      );

      const { result } = renderHook(() => useFilterSetView());

      let options: Awaited<ReturnType<typeof result.current.queryOptions>>;
      await act(async () => {
        options = await result.current.queryOptions(queryOpts());
      });

      expect(options!.next).toBe('2');
      expect(options!.remaining).toBeGreaterThan(0);
    });

    test('should pass the search parameter to the API', async () => {
      let capturedUrl = '';
      server.use(
        http.get(metricsAPI`/dashboard_reports/filter_sets/`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json(pageResponse([]));
        })
      );

      const { result } = renderHook(() => useFilterSetView());

      await act(async () => {
        await result.current.queryOptions(queryOpts('my report'));
      });

      expect(new URL(capturedUrl).searchParams.get('search')).toBe('my report');
    });
  });
});

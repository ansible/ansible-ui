/* eslint-disable i18next/no-literal-string */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { fillFilters, getQueryString, useAnalyticsView } from './useAnalyticsView';

type AnalyticsLegendResponse = {
  meta: { count: number; legend: { id: number }[] };
};

const legendFromResponse = (data: AnalyticsLegendResponse) => data.meta.legend;
const countFromResponse = (data: AnalyticsLegendResponse) => data.meta.count;

const mockSetPage = vi.fn();
const mockPostRequest =
  vi.fn<(url: string, payload?: unknown) => Promise<AnalyticsLegendResponse>>();
const mockRequestGet = vi.fn<(url: string) => Promise<AnalyticsLegendResponse>>();

const mockUseView = vi.fn(() => ({
  page: 2,
  perPage: 5,
  sort: 'name',
  sortDirection: 'desc' as const,
  filterState: { org_id: ['1'] },
  setPage: mockSetPage,
  setPerPage: vi.fn(),
  setSort: vi.fn(),
  setSortDirection: vi.fn(),
  setFilterState: vi.fn(),
  clearAllFilters: vi.fn(),
}));

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    useView: (...args: unknown[]) => mockUseView(...args) as ReturnType<typeof mockUseView>,
    useSelected: vi.fn(() => ({
      selected: [],
      select: vi.fn(),
      unselect: vi.fn(),
      selectAll: vi.fn(),
      unselectAll: vi.fn(),
      isSelected: vi.fn(),
    })),
  };
});

vi.mock('@ansible/common-ui/crud/Data', () => ({
  postRequest: (url: string, payload?: unknown) => mockPostRequest(url, payload),
  requestGet: (url: string) => mockRequestGet(url),
}));

vi.mock('./AnalyticsReportBuilder/AnalyticsReportBuilder', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('./AnalyticsReportBuilder/AnalyticsReportBuilder')>();
  return {
    ...actual,
    computeMainFilterKeys: vi.fn(() => [{ key: 'org_id', value: 'org_id' }]),
  };
});

describe('getQueryString', () => {
  it('encodes query parameters', () => {
    expect(getQueryString({ foo: 'bar baz', empty: '' })).toBe('foo=bar%20baz&empty=');
  });

  it('returns empty string for empty params', () => {
    expect(getQueryString({})).toBe('');
  });
});

describe('fillFilters', () => {
  it('copies single-select filter values into payload', () => {
    const payload: Record<string, unknown> = {};
    fillFilters(payload, { status: ['successful'] }, [
      { key: 'status', type: ToolbarFilterType.MultiSelect, label: 'Status', query: 'status' },
    ]);
    expect(payload.status).toBe('successful');
  });

  it('appends multi-value filters to array payload fields', () => {
    const payload: Record<string, string[]> = { org_id: [] };
    fillFilters(payload, { org_id: ['1', '2'] }, [
      { key: 'org_id', type: ToolbarFilterType.MultiSelect, label: 'Org', query: 'org_id' },
    ]);
    expect(payload.org_id).toEqual(['1', '2']);
  });

  it('skips empty filter values', () => {
    const payload: Record<string, unknown> = { status: 'failed' };
    fillFilters(payload, { status: [] }, [
      { key: 'status', type: ToolbarFilterType.MultiSelect, label: 'Status', query: 'status' },
    ]);
    expect(payload.status).toBe('failed');
  });
});

describe('useAnalyticsView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseView.mockReturnValue({
      page: 1,
      perPage: 10,
      sort: 'runs',
      sortDirection: 'asc' as const,
      filterState: {},
      setPage: mockSetPage,
      setPerPage: vi.fn(),
      setSort: vi.fn(),
      setSortDirection: vi.fn(),
      setFilterState: vi.fn(),
      clearAllFilters: vi.fn(),
    });
    mockPostRequest.mockResolvedValue({
      meta: { count: 2, legend: [{ id: 1 }, { id: 2 }] },
    });
  });

  it('loads data with POST and maps items', async () => {
    const { result } = renderHook(() =>
      useAnalyticsView({
        url: '/analytics/report/test/',
        keyFn: (item: { id: number }) => item.id,
        requestMethod: 'post',
        getItems: legendFromResponse,
        getItemsCount: countFromResponse,
        payload: { limit: '10' },
      })
    );

    await waitFor(() => expect(result.current.pageItems).toHaveLength(2));
    expect(result.current.itemCount).toBe(2);
    expect(mockPostRequest).toHaveBeenCalled();
    expect(String(mockPostRequest.mock.calls[0]?.[0])).toContain('offset=0');
  });

  it('uses GET when requestMethod is get', async () => {
    mockRequestGet.mockResolvedValue({
      meta: { count: 1, legend: [{ id: 3 }] },
    });

    const { result } = renderHook(() =>
      useAnalyticsView({
        url: '/analytics/report/test/',
        keyFn: (item: { id: number }) => item.id,
        requestMethod: 'get',
        getItems: legendFromResponse,
        getItemsCount: countFromResponse,
      })
    );

    await waitFor(() => expect(result.current.pageItems).toHaveLength(1));
    expect(mockRequestGet).toHaveBeenCalled();
  });

  it('resets page when a 404 occurs on later pages', async () => {
    mockUseView.mockReturnValue({
      page: 3,
      perPage: 10,
      sort: undefined,
      sortDirection: 'asc' as const,
      filterState: {},
      setPage: mockSetPage,
      setPerPage: vi.fn(),
      setSort: vi.fn(),
      setSortDirection: vi.fn(),
      setFilterState: vi.fn(),
      clearAllFilters: vi.fn(),
    });
    mockPostRequest.mockRejectedValue(
      new RequestError('missing', undefined, 404, undefined, undefined)
    );

    renderHook(() =>
      useAnalyticsView({
        url: '/analytics/report/test/',
        keyFn: (item: { id: number }) => item.id,
        requestMethod: 'post',
        getItems: legendFromResponse,
        getItemsCount: countFromResponse,
      })
    );

    await waitFor(() => expect(mockSetPage).toHaveBeenCalledWith(1));
  });

  it('does not fetch when disableLoading is true', async () => {
    renderHook(() =>
      useAnalyticsView({
        url: '/analytics/report/test/',
        keyFn: (item: { id: number }) => item.id,
        requestMethod: 'post',
        disableLoading: true,
        getItems: () => [],
        getItemsCount: () => 0,
      })
    );

    await act(async () => {
      await Promise.resolve();
    });
    expect(mockPostRequest).not.toHaveBeenCalled();
  });

  it('applies builder filter keys and sort query parameters', async () => {
    mockUseView.mockReturnValue({
      page: 1,
      perPage: 10,
      sort: 'custom_sort',
      sortDirection: 'asc' as const,
      filterState: {},
      setPage: mockSetPage,
      setPerPage: vi.fn(),
      setSort: vi.fn(),
      setSortDirection: vi.fn(),
      setFilterState: vi.fn(),
      clearAllFilters: vi.fn(),
    });

    renderHook(() =>
      useAnalyticsView({
        url: '/analytics/report/test/',
        keyFn: (item: { id: number }) => item.id,
        requestMethod: 'post',
        sortableColumns: ['custom_sort'],
        queryParams: { reportName: 'demo' },
        getItems: () => [],
        getItemsCount: () => 0,
        builderProps: {
          defaultDataParams: { org_id: ['keep'] },
          processDataRequestPayload: vi.fn(),
        } as never,
      })
    );

    await waitFor(() => expect(mockPostRequest).toHaveBeenCalled());
    const requestUrl = String(mockPostRequest.mock.calls.at(-1)?.[0]);
    expect(requestUrl).toContain('sort_by=custom_sort:asc');
    expect(requestUrl).toContain('reportName=demo');
  });
});

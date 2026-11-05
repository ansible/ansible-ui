import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToolbarFilterType, type IToolbarFilter } from '@ansible/ansible-ui-framework';
import { fillFilters, getQueryString, useAnalyticsView } from './useAnalyticsView';

type AnalyticsLegendResponse = {
  meta: { count: number; legend: { id: number }[] };
};

type MockUseViewReturn = {
  page: number;
  perPage: number;
  sort: string | undefined;
  sortDirection: 'asc' | 'desc';
  filterState: Record<string, string[]>;
  setPage: ReturnType<typeof vi.fn>;
  setPerPage: ReturnType<typeof vi.fn>;
  setSort: ReturnType<typeof vi.fn>;
  setSortDirection: ReturnType<typeof vi.fn>;
  setFilterState: ReturnType<typeof vi.fn>;
  clearAllFilters: ReturnType<typeof vi.fn>;
};

const reportPath = '/analytics/report/test/';
const legendFromResponse = (data: AnalyticsLegendResponse) => data.meta.legend;
const countFromResponse = (data: AnalyticsLegendResponse) => data.meta.count;

const mockSetPage = vi.fn();
const postRequestUrls: string[] = [];
const getRequestUrls: string[] = [];

const defaultPostResponse: AnalyticsLegendResponse = {
  meta: { count: 2, legend: [{ id: 1 }, { id: 2 }] },
};

const mockUseView = vi.fn(
  (): MockUseViewReturn => ({
    page: 2,
    perPage: 5,
    sort: 'name',
    sortDirection: 'desc',
    filterState: { org_id: ['1'] },
    setPage: mockSetPage,
    setPerPage: vi.fn(),
    setSort: vi.fn(),
    setSortDirection: vi.fn(),
    setFilterState: vi.fn(),
    clearAllFilters: vi.fn(),
  })
);

const server = setupServer(
  http.post(
    ({ request }) => new URL(request.url).pathname.startsWith(reportPath),
    ({ request }) => {
      postRequestUrls.push(request.url);
      return HttpResponse.json(defaultPostResponse);
    }
  ),
  http.get(
    ({ request }) => new URL(request.url).pathname.startsWith(reportPath),
    ({ request }) => {
      getRequestUrls.push(request.url);
      return HttpResponse.json({ meta: { count: 1, legend: [{ id: 3 }] } });
    }
  )
);

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    useView: () => mockUseView(),
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

vi.mock('./AnalyticsReportBuilder/AnalyticsReportBuilder', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('./AnalyticsReportBuilder/AnalyticsReportBuilder')>();
  return {
    ...actual,
    computeMainFilterKeys: vi.fn(() => [{ key: 'org_id', value: 'org_id' }]),
  };
});

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  postRequestUrls.length = 0;
  getRequestUrls.length = 0;
});
afterAll(() => server.close());

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
    const filters = [
      { key: 'status', type: ToolbarFilterType.MultiSelect, label: 'Status', query: 'status' },
    ] as IToolbarFilter[];
    fillFilters(payload, { status: ['successful'] }, filters);
    expect(payload.status).toBe('successful');
  });

  it('appends multi-value filters to array payload fields', () => {
    const payload: Record<string, string[]> = { org_id: [] };
    const filters = [
      { key: 'org_id', type: ToolbarFilterType.MultiSelect, label: 'Org', query: 'org_id' },
    ] as IToolbarFilter[];
    fillFilters(payload, { org_id: ['1', '2'] }, filters);
    expect(payload.org_id).toEqual(['1', '2']);
  });

  it('skips empty filter values', () => {
    const payload: Record<string, unknown> = { status: 'failed' };
    const filters = [
      { key: 'status', type: ToolbarFilterType.MultiSelect, label: 'Status', query: 'status' },
    ] as IToolbarFilter[];
    fillFilters(payload, { status: [] }, filters);
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
      sortDirection: 'asc',
      filterState: { org_id: [] },
      setPage: mockSetPage,
      setPerPage: vi.fn(),
      setSort: vi.fn(),
      setSortDirection: vi.fn(),
      setFilterState: vi.fn(),
      clearAllFilters: vi.fn(),
    });
  });

  it('loads data with POST and maps items', async () => {
    const { result } = renderHook(() =>
      useAnalyticsView({
        url: reportPath,
        keyFn: (item: { id: number }) => item.id,
        requestMethod: 'post',
        getItems: legendFromResponse,
        getItemsCount: countFromResponse,
        payload: { limit: '10' },
      })
    );

    await waitFor(() => expect(result.current.pageItems).toHaveLength(2));
    expect(result.current.itemCount).toBe(2);
    expect(postRequestUrls.length).toBeGreaterThan(0);
    expect(postRequestUrls[0]).toContain('offset=0');
  });

  it('uses GET when requestMethod is get', async () => {
    const { result } = renderHook(() =>
      useAnalyticsView({
        url: reportPath,
        keyFn: (item: { id: number }) => item.id,
        requestMethod: 'get',
        getItems: legendFromResponse,
        getItemsCount: countFromResponse,
      })
    );

    await waitFor(() => expect(result.current.pageItems).toHaveLength(1));
    expect(getRequestUrls.length).toBeGreaterThan(0);
  });

  it('resets page when a 404 occurs on later pages', async () => {
    mockUseView.mockReturnValue({
      page: 3,
      perPage: 10,
      sort: 'runs',
      sortDirection: 'desc',
      filterState: { org_id: [] },
      setPage: mockSetPage,
      setPerPage: vi.fn(),
      setSort: vi.fn(),
      setSortDirection: vi.fn(),
      setFilterState: vi.fn(),
      clearAllFilters: vi.fn(),
    });
    server.use(
      http.post(
        ({ request }) => new URL(request.url).pathname.startsWith(reportPath),
        () => HttpResponse.json({ detail: 'missing' }, { status: 404 })
      )
    );

    renderHook(() =>
      useAnalyticsView({
        url: reportPath,
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
        url: reportPath,
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
    expect(postRequestUrls).toHaveLength(0);
  });

  it('applies builder filter keys and sort query parameters', async () => {
    mockUseView.mockReturnValue({
      page: 1,
      perPage: 10,
      sort: 'custom_sort',
      sortDirection: 'asc',
      filterState: { org_id: [] },
      setPage: mockSetPage,
      setPerPage: vi.fn(),
      setSort: vi.fn(),
      setSortDirection: vi.fn(),
      setFilterState: vi.fn(),
      clearAllFilters: vi.fn(),
    });

    renderHook(() =>
      useAnalyticsView({
        url: reportPath,
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

    await waitFor(() => expect(postRequestUrls.length).toBeGreaterThan(0));
    const requestUrl = postRequestUrls.at(-1) ?? '';
    expect(requestUrl).toContain('sort_by=custom_sort:asc');
    expect(requestUrl).toContain('reportName=demo');
  });
});

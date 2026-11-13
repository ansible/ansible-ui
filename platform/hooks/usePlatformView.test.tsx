/* eslint-disable i18next/no-literal-string */
import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getQueryString, usePlatformView } from './usePlatformView';

const {
  mockSetPage,
  mockMutate,
  mockSelectItems,
  mockUnselectItems,
  viewState,
  swrState,
  capturedUseViewOptions,
  capturedSwrKeys,
} = vi.hoisted(() => {
  const mockSetPage = vi.fn();
  const mockMutate = vi.fn().mockResolvedValue(undefined);
  const mockSelectItems = vi.fn();
  const mockUnselectItems = vi.fn();
  const capturedUseViewOptions: unknown[] = [];
  const capturedSwrKeys: unknown[] = [];
  const viewState = {
    page: 1,
    perPage: 10,
    sort: 'name',
    sortDirection: 'asc' as 'asc' | 'desc',
    filterState: {} as Record<string, string[]>,
    setPage: mockSetPage,
    setPerPage: vi.fn(),
    setSort: vi.fn(),
    setSortDirection: vi.fn(),
    setFilterState: vi.fn(),
    clearAllFilters: vi.fn(),
  };
  const swrState = {
    data: {
      count: 2,
      results: [
        { id: 1, name: 'one' },
        { id: 2, name: 'two' },
      ],
      next: '/api/gateway/v1/users/?page=2',
    } as
      | {
          count: number;
          results: { id: number; name: string }[];
          next?: string;
        }
      | undefined,
    error: undefined as Error | undefined,
  };
  return {
    mockSetPage,
    mockMutate,
    mockSelectItems,
    mockUnselectItems,
    viewState,
    swrState,
    capturedUseViewOptions,
    capturedSwrKeys,
  };
});

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useView: vi.fn((options: unknown) => {
      capturedUseViewOptions.push(options);
      return viewState;
    }),
    useSelected: vi.fn(() => ({
      selectedItems: [],
      selectItems: mockSelectItems,
      unselectItems: mockUnselectItems,
      selectItem: vi.fn(),
      unselectItem: vi.fn(),
      isSelected: vi.fn(() => false),
      unselectAll: vi.fn(),
      allSelected: false,
    })),
  };
});

vi.mock('@ansible/common-ui/crud/Data', () => ({
  getItemKey: (item: { id: number | string }) => String(item.id),
  useFetcher: () => vi.fn(),
}));

vi.mock('swr', () => ({
  default: vi.fn((key: unknown) => {
    capturedSwrKeys.push(key);
    if (typeof key === 'string' && key === swrState.data?.next) {
      return { data: undefined, error: undefined, mutate: vi.fn() };
    }
    return {
      data: swrState.data,
      error: swrState.error,
      mutate: mockMutate,
    };
  }),
}));

describe('getQueryString', () => {
  test('should encode scalar query parameters', () => {
    expect(getQueryString({ name: 'ansible', page: '2' })).toBe('name=ansible&page=2');
  });

  test('should encode array query parameters as repeated keys', () => {
    expect(getQueryString({ tags: ['a', 'b'] })).toBe('tags=a&tags=b');
  });
});

describe('usePlatformView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedUseViewOptions.length = 0;
    capturedSwrKeys.length = 0;
    viewState.page = 1;
    viewState.sort = 'name';
    viewState.sortDirection = 'asc';
    viewState.filterState = {};
    swrState.data = {
      count: 2,
      results: [
        { id: 1, name: 'one' },
        { id: 2, name: 'two' },
      ],
      next: '/api/gateway/v1/users/?page=2',
    };
    swrState.error = undefined;
  });

  test('should request list data with paging and ascending sort', () => {
    const { result } = renderHook(() =>
      usePlatformView<{ id: number; name: string }>({
        url: '/api/gateway/v1/users/',
        queryParams: { role: 'admin' },
      })
    );

    const listUrl = capturedSwrKeys.find(
      (key) => typeof key === 'string' && key.startsWith('/api/gateway/v1/users/')
    );
    expect(listUrl).toBe('/api/gateway/v1/users/?role=admin&order_by=name&page=1&page_size=10');
    expect(result.current.pageItems).toHaveLength(2);
    expect(result.current.itemCount).toBe(2);
  });

  test('should use descending order_by when sort direction is desc', () => {
    viewState.sortDirection = 'desc';

    renderHook(() =>
      usePlatformView<{ id: number }>({
        url: '/api/gateway/v1/teams/',
      })
    );

    const listUrl = capturedSwrKeys.find(
      (key) => typeof key === 'string' && key.includes('/teams/')
    );
    expect(listUrl).toContain('order_by=-name');
  });

  test('should apply toolbar filters with multiple values as or__ query params', () => {
    const toolbarFilters: IToolbarFilter[] = [
      {
        key: 'status',
        query: 'status',
        type: ToolbarFilterType.MultiSelect,
        label: 'Status',
        placeholder: 'Filter by status',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'pending', label: 'Pending' },
        ],
      },
    ];
    viewState.filterState = { status: ['active', 'pending'] };

    renderHook(() =>
      usePlatformView<{ id: number }>({
        url: '/api/gateway/v1/users/',
        toolbarFilters,
      })
    );

    const listUrl = capturedSwrKeys.find(
      (key) => typeof key === 'string' && key.includes('/users/')
    ) as string;
    expect(listUrl).toContain('or__status=active');
    expect(listUrl).toContain('or__status=pending');
  });

  test('should split comma-separated filter values and encode a single toolbar filter value', () => {
    const toolbarFilters: IToolbarFilter[] = [
      {
        key: 'name',
        query: 'name__icontains',
        type: ToolbarFilterType.SingleText,
        comparison: 'contains',
        label: 'Name',
      },
    ];
    viewState.filterState = { name: ['foo, bar ,foo'] };

    renderHook(() =>
      usePlatformView<{ id: number }>({
        url: '/api/gateway/v1/users/',
        toolbarFilters,
      })
    );

    const listUrl = capturedSwrKeys.find(
      (key) => typeof key === 'string' && key.includes('/users/')
    ) as string;
    expect(listUrl).toContain('or__name__icontains=foo');
    expect(listUrl).toContain('or__name__icontains=bar');
  });

  test('should derive default sort from table columns', () => {
    renderHook(() =>
      usePlatformView<{ id: number; username: string }>({
        url: '/api/gateway/v1/users/',
        tableColumns: [
          {
            header: 'Username',
            sort: 'username',
            defaultSort: true,
            defaultSortDirection: 'desc',
            cell: () => null,
          },
          { header: 'ID', sort: 'id', cell: () => null },
        ],
      })
    );

    expect(capturedUseViewOptions[0]).toEqual(
      expect.objectContaining({
        defaultValues: { sort: 'username', sortDirection: 'desc' },
      })
    );
  });

  test('should clear a stale 404 error by returning to page 1', () => {
    viewState.page = 3;
    swrState.error = new RequestError('Not Found', undefined, 404, {}, {});
    swrState.data = undefined;

    const { result } = renderHook(() =>
      usePlatformView<{ id: number }>({
        url: '/api/gateway/v1/users/',
      })
    );

    expect(mockSetPage).toHaveBeenCalledWith(1);
    expect((result.current as { error?: Error }).error).toBeUndefined();
  });

  test('should refresh selection state and revalidate the list', async () => {
    const { result } = renderHook(() =>
      usePlatformView<{ id: number; name: string }>({
        url: '/api/gateway/v1/users/',
      })
    );

    act(() => {
      result.current.selectItemsAndRefresh([{ id: 1, name: 'one' }]);
    });

    expect(mockSelectItems).toHaveBeenCalledWith([{ id: 1, name: 'one' }]);
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
    expect(result.current.refreshing).toBe(false);
  });

  test('should unselect items and refresh the view', async () => {
    const { result } = renderHook(() =>
      usePlatformView<{ id: number; name: string }>({
        url: '/api/gateway/v1/users/',
      })
    );

    act(() => {
      result.current.unselectItemsAndRefresh([{ id: 2, name: 'two' }]);
    });

    expect(mockUnselectItems).toHaveBeenCalledWith([{ id: 2, name: 'two' }]);
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
  });
});

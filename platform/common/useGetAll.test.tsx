import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGetAll } from './useGetAll';

const { useSWRInfiniteMock, useGetRequestMock } = vi.hoisted(() => ({
  useSWRInfiniteMock: vi.fn(),
  useGetRequestMock: vi.fn(),
}));

vi.mock('swr/infinite', () => ({
  default: useSWRInfiniteMock,
}));

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGetRequest: useGetRequestMock,
}));

describe('useGetAll', () => {
  beforeEach(() => {
    useSWRInfiniteMock.mockReset();
    useGetRequestMock.mockReset();
    useGetRequestMock.mockReturnValue(vi.fn());
    useSWRInfiniteMock.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    });
  });

  it('appends query parameters with ? when the URL has no query string', () => {
    renderHook(() => useGetAll('/items/', 25));

    const getKey = useSWRInfiniteMock.mock.calls[0][0] as (
      page: number,
      previous: IGetItemResponse<unknown> | null
    ) => string | null;
    expect(getKey(0, null)).toBe('/items/?order_by=name&page=1&page_size=25');
  });

  it('appends query parameters with & when the URL already has a query string', () => {
    renderHook(() => useGetAll('/items/?organization=42', 25));

    const getKey = useSWRInfiniteMock.mock.calls[0][0] as (
      page: number,
      previous: IGetItemResponse<unknown> | null
    ) => string | null;
    expect(getKey(0, null)).toBe('/items/?organization=42&order_by=name&page=1&page_size=25');
  });

  it('stops requesting pages after a page without a next link', () => {
    renderHook(() => useGetAll('/items/'));

    const getKey = useSWRInfiniteMock.mock.calls[0][0] as (
      page: number,
      previous: IGetItemResponse<unknown> | null
    ) => string | null;
    expect(getKey(1, { count: 1, next: null, previous: null, results: [] })).toBeNull();
  });

  it('omits ordering when order_by is null', () => {
    renderHook(() => useGetAll('/role_team_assignments/?object_id=42', 200, null));

    const getKey = useSWRInfiniteMock.mock.calls[0][0] as (
      page: number,
      previous: IGetItemResponse<unknown> | null
    ) => string | null;
    expect(getKey(0, null)).toBe('/role_team_assignments/?object_id=42&page=1&page_size=200');
  });

  it('skips fetching when the URL is undefined', () => {
    renderHook(() => useGetAll(undefined));

    const getKey = useSWRInfiniteMock.mock.calls[0][0] as (
      page: number,
      previous: IGetItemResponse<unknown> | null
    ) => string | null;
    expect(getKey(0, null)).toBeNull();
    expect(useSWRInfiniteMock.mock.calls[0][2]).toEqual({ initialSize: 0 });
  });
});

type IGetItemResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

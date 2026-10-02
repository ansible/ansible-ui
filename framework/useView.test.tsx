/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useView } from './useView';

const mockLocation = vi.hoisted(() => {
  const state: { location?: Location } = { location: undefined };
  const update = vi.fn((url?: string | URL | null) => {
    window.history.replaceState(null, '', url);
    state.location = window.location;
  });
  return { state, update };
});

vi.mock('./components/useWindowLocation', () => ({
  useWindowLocation: () => ({ location: mockLocation.state.location, update: mockLocation.update }),
}));

function setLocation(search: string) {
  window.history.replaceState(null, '', `/test${search}`);
}

function currentParams() {
  return new URLSearchParams(window.location.search);
}

describe('useView', () => {
  beforeEach(() => {
    setLocation('');
    mockLocation.state.location = window.location;
    mockLocation.update.mockClear();
  });

  it('handles an unavailable window location', () => {
    mockLocation.state.location = undefined;
    const { result } = renderHook(() => useView({}));

    expect(result.current.page).toEqual(1);
    expect(mockLocation.update).toHaveBeenCalledWith('?page=1&perPage=10&sort=');
  });

  it('seeds page, perPage and sort into the query string', () => {
    renderHook(() => useView({}));
    const params = currentParams();
    expect(params.get('page')).toEqual('1');
    expect(params.get('perPage')).toEqual('10');
    expect(params.get('sort')).toEqual('');
  });

  it('reads initial state from the query string', () => {
    setLocation('?page=3&perPage=50&sort=-name');
    const { result } = renderHook(() => useView({}));
    expect(result.current.page).toEqual(3);
    expect(result.current.perPage).toEqual(50);
    expect(result.current.sort).toEqual('name');
    expect(result.current.sortDirection).toEqual('desc');
  });

  it('writes state changes back to the query string', () => {
    const { result } = renderHook(() => useView({}));
    act(() => result.current.setPage(4));
    act(() => result.current.setPerPage(25));
    act(() => result.current.setSort('name'));
    const params = currentParams();
    expect(params.get('page')).toEqual('4');
    expect(params.get('perPage')).toEqual('25');
    expect(params.get('sort')).toEqual('name');
  });

  it('preserves unrelated query string keys', () => {
    setLocation('?keep=yes');
    const { result } = renderHook(() => useView({}));
    act(() => result.current.setPage(2));
    const params = currentParams();
    expect(params.get('keep')).toEqual('yes');
    expect(params.get('page')).toEqual('2');
  });

  it('does not touch the query string when disableQueryString is set', () => {
    setLocation('?page=7');
    const { result } = renderHook(() => useView({ disableQueryString: true }));
    expect(result.current.page).toEqual(1);
    act(() => result.current.setPage(5));
    expect(result.current.page).toEqual(5);
    expect(currentParams().get('page')).toEqual('7');
  });

  it('applies default values', () => {
    const { result } = renderHook(() =>
      useView({ defaultValues: { sort: 'name', sortDirection: 'desc' } })
    );
    expect(result.current.sort).toEqual('name');
    expect(result.current.sortDirection).toEqual('desc');
  });

  it('clears all filters', () => {
    const { result } = renderHook(() =>
      useView({ defaultValues: { filterState: { name: ['a'] } } })
    );
    expect(result.current.filterState).toEqual({ name: ['a'] });
    act(() => result.current.clearAllFilters());
    expect(result.current.filterState).toEqual({});
  });
});

/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useURLSearchParams } from './useURLSearchParams';

function setLocation(url: string) {
  window.history.replaceState(null, '', url);
}

describe('useURLSearchParams', () => {
  beforeEach(() => {
    setLocation('/test');
  });

  it('reads the current query string', () => {
    setLocation('/test?page=3&sort=name');
    const { result } = renderHook(() => useURLSearchParams());
    const [params] = result.current;
    expect(params.get('page')).toEqual('3');
    expect(params.get('sort')).toEqual('name');
  });

  it('writes params back to the query string', () => {
    const { result } = renderHook(() => useURLSearchParams());
    act(() => result.current[1](new URLSearchParams({ page: '2' })));
    expect(window.location.search).toEqual('?page=2');
  });

  it('drops the question mark when the last param is removed', () => {
    setLocation('/test?page=2');
    const { result } = renderHook(() => useURLSearchParams());
    act(() => result.current[1](new URLSearchParams()));
    expect(window.location.search).toEqual('');
    expect(window.location.pathname).toEqual('/test');
  });

  it('skips the update when the search string is unchanged', () => {
    setLocation('/test?page=2');
    const { result } = renderHook(() => useURLSearchParams());
    const before = window.history.length;
    act(() => result.current[1](new URLSearchParams({ page: '2' })));
    expect(window.location.search).toEqual('?page=2');
    expect(window.history.length).toEqual(before);
  });

  it('does not touch the query string after navigating away', () => {
    const { result } = renderHook(() => useURLSearchParams());

    // Navigate to a different page and let the hook observe it, so its captured
    // pathname no longer matches the current one.
    act(() => {
      window.history.replaceState(null, '', '/somewhere-else');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    act(() => result.current[1](new URLSearchParams({ page: '9' })));
    expect(window.location.pathname).toEqual('/somewhere-else');
    expect(window.location.search).toEqual('');
  });
});

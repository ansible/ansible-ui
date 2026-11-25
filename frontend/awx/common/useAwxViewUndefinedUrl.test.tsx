import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AwxHost } from '../interfaces/AwxHost';
import { useAwxView } from './useAwxView';

const mocks = vi.hoisted(() => ({ fetcher: vi.fn() }));

vi.mock('@ansible/common-ui/crud/Data', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@ansible/common-ui/crud/Data')>()),
  useFetcher: () => mocks.fetcher,
}));

vi.mock('./useAwxConfig', () => ({
  useAwxConfigState: () => ({ serviceDown: false, serviceDownStatusCode: undefined }),
}));

afterEach(() => {
  mocks.fetcher.mockClear();
  vi.unstubAllGlobals();
});

describe('useAwxView URL handling', () => {
  it('does not fetch or expose a URL when the base URL is undefined', () => {
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn() });

    const { result } = renderHook(() =>
      useAwxView<AwxHost>({ url: undefined, disableQueryString: true })
    );

    expect(result.current.listUrl).toBe('');
    expect(result.current.pageItems).toBeUndefined();
    expect(mocks.fetcher).not.toHaveBeenCalled();
  });

  it('fetches when a base URL is available', async () => {
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn() });
    mocks.fetcher.mockResolvedValueOnce({ count: 0, results: [] });

    const { result } = renderHook(() =>
      useAwxView<AwxHost>({ url: '/api/v2/hosts/', disableQueryString: true })
    );

    await waitFor(() => expect(mocks.fetcher).toHaveBeenCalled());
    expect(result.current.listUrl).toContain('/api/v2/hosts/');
  });
});

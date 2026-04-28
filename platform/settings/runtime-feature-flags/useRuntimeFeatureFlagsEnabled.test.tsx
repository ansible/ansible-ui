import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SWRConfig } from 'swr';
import { useRuntimeFeatureFlagsEnabled } from './useRuntimeFeatureFlagsEnabled';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>{children}</SWRConfig>
  );
}

describe('useRuntimeFeatureFlagsEnabled', () => {
  it('should return true when RUNTIME_FEATURE_FLAGS is true', async () => {
    server.use(
      http.get('/api/gateway/v1/settings/feature_flags/', () =>
        HttpResponse.json({
          RUNTIME_FEATURE_FLAGS: true,
        })
      )
    );

    const { result } = renderHook(() => useRuntimeFeatureFlagsEnabled(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.isEnabled).toBe(true);
  });

  it('should return false when RUNTIME_FEATURE_FLAGS is false', async () => {
    server.use(
      http.get('/api/gateway/v1/settings/feature_flags/', () =>
        HttpResponse.json({
          RUNTIME_FEATURE_FLAGS: false,
        })
      )
    );

    const { result } = renderHook(() => useRuntimeFeatureFlagsEnabled(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.isEnabled).toBe(false);
  });

  it('should return false on API error', async () => {
    server.use(http.get('/api/gateway/v1/settings/feature_flags/', () => HttpResponse.error()));

    const { result } = renderHook(() => useRuntimeFeatureFlagsEnabled(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.isEnabled).toBe(false);
  });
});

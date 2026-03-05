import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { gatewayAPI } from '../utils/gateway-api-utils';
import { PlatformActiveUserProvider, usePlatformActiveUser } from './PlatformActiveUserProvider';

const mockUser = {
  count: 1,
  results: [
    {
      id: 1,
      username: 'admin',
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@example.com',
      is_superuser: true,
    },
  ],
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig
    value={{
      dedupingInterval: 0,
      provider: () => new Map(),
      shouldRetryOnError: false,
    }}
  >
    <PlatformActiveUserProvider>{children}</PlatformActiveUserProvider>
  </SWRConfig>
);

describe('usePlatformActiveUser', () => {
  test('should provide the active user when API succeeds', async () => {
    server.use(
      http.get(gatewayAPI`/me/`, () => {
        return HttpResponse.json(mockUser);
      })
    );

    const { result } = renderHook(() => usePlatformActiveUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.activePlatformUser).toBeDefined();
    });

    expect(result.current.activePlatformUser?.username).toBe('admin');
  });

  test('should set active user to null when API returns an error', async () => {
    server.use(
      http.get(gatewayAPI`/me/`, () => {
        return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 });
      })
    );

    const { result } = renderHook(() => usePlatformActiveUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.activePlatformUser).toBeNull();
    });
  });

  test('should set active user to null when API returns empty results', async () => {
    server.use(
      http.get(gatewayAPI`/me/`, () => {
        return HttpResponse.json({ count: 0, results: [] });
      })
    );

    const { result } = renderHook(() => usePlatformActiveUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.activePlatformUser).toBeNull();
    });
  });

  test('should provide a working refresh function', async () => {
    let callCount = 0;
    server.use(
      http.get(gatewayAPI`/me/`, () => {
        callCount++;
        return HttpResponse.json({
          count: 1,
          results: [{ ...mockUser.results[0], username: `admin-${callCount}` }],
        });
      })
    );

    const { result } = renderHook(() => usePlatformActiveUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.activePlatformUser).toBeDefined();
    });

    expect(result.current.refreshActivePlatformUser).toBeDefined();
    result.current.refreshActivePlatformUser?.();

    await waitFor(() => {
      expect(result.current.activePlatformUser?.username).toBe('admin-2');
    });
  });
});

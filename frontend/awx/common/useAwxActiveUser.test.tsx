import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { awxAPI } from './api/awx-utils';
import {
  AwxActiveUserProvider,
  AwxActiveUserProviderInternal,
  useAwxActiveUser,
} from './useAwxActiveUser';

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
    <AwxActiveUserProviderInternal>{children}</AwxActiveUserProviderInternal>
  </SWRConfig>
);

describe('useAwxActiveUser', () => {
  test('should provide the active user when API succeeds', async () => {
    server.use(
      http.get(awxAPI`/me/`, () => {
        return HttpResponse.json(mockUser);
      })
    );

    const { result } = renderHook(() => useAwxActiveUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.activeAwxUser).toBeDefined();
    });

    expect(result.current.activeAwxUser?.username).toBe('admin');
    expect(result.current.activeAwxUser?.is_superuser).toBe(true);
  });

  test('should set active user to null when API returns an error', async () => {
    server.use(
      http.get(awxAPI`/me/`, () => {
        return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 });
      })
    );

    const { result } = renderHook(() => useAwxActiveUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.activeAwxUser).toBeNull();
    });
  });

  test('should set active user to null when API returns empty results', async () => {
    server.use(
      http.get(awxAPI`/me/`, () => {
        return HttpResponse.json({ count: 0, results: [] });
      })
    );

    const { result } = renderHook(() => useAwxActiveUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.activeAwxUser).toBeNull();
    });
  });

  test('should provide a working refresh function', async () => {
    let callCount = 0;
    server.use(
      http.get(awxAPI`/me/`, () => {
        callCount++;
        return HttpResponse.json({
          count: 1,
          results: [{ ...mockUser.results[0], username: `admin-${callCount}` }],
        });
      })
    );

    const { result } = renderHook(() => useAwxActiveUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.activeAwxUser).toBeDefined();
    });

    expect(result.current.refreshActiveAwxUser).toBeDefined();
    result.current.refreshActiveAwxUser?.();

    await waitFor(() => {
      expect(result.current.activeAwxUser?.username).toBe('admin-2');
    });
  });
});

describe('AwxActiveUserProvider', () => {
  test('should render empty context when disabled', () => {
    const disabledWrapper = ({ children }: { children: ReactNode }) => (
      <SWRConfig
        value={{
          dedupingInterval: 0,
          provider: () => new Map(),
          shouldRetryOnError: false,
        }}
      >
        <AwxActiveUserProvider disabled>{children}</AwxActiveUserProvider>
      </SWRConfig>
    );

    const { result } = renderHook(() => useAwxActiveUser(), { wrapper: disabledWrapper });

    expect(result.current.activeAwxUser).toBeUndefined();
    expect(result.current.refreshActiveAwxUser).toBeUndefined();
  });
});

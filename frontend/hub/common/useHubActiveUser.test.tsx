import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { hubAPI } from './api/formatPath';
import {
  HubActiveUserProvider,
  HubActiveUserProviderInternal,
  useHubActiveUser,
} from './useHubActiveUser';

const mockUser = {
  id: 1,
  username: 'admin',
  first_name: 'Admin',
  last_name: 'User',
  email: 'admin@example.com',
  is_superuser: true,
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
    <HubActiveUserProviderInternal>{children}</HubActiveUserProviderInternal>
  </SWRConfig>
);

describe('useHubActiveUser', () => {
  test('should provide the active user when API succeeds', async () => {
    server.use(
      http.get(hubAPI`/_ui/v1/me/`, () => {
        return HttpResponse.json(mockUser);
      })
    );

    const { result } = renderHook(() => useHubActiveUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.activeHubUser).toBeDefined();
    });

    expect(result.current.activeHubUser?.username).toBe('admin');
  });

  test('should set active user to null when API returns an error', async () => {
    server.use(
      http.get(hubAPI`/_ui/v1/me/`, () => {
        return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 });
      })
    );

    const { result } = renderHook(() => useHubActiveUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.activeHubUser).toBeNull();
    });
  });

  test('should provide a working refresh function', async () => {
    let callCount = 0;
    server.use(
      http.get(hubAPI`/_ui/v1/me/`, () => {
        callCount++;
        return HttpResponse.json({ ...mockUser, username: `admin-${callCount}` });
      })
    );

    const { result } = renderHook(() => useHubActiveUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.activeHubUser).toBeDefined();
    });

    expect(result.current.refreshActiveHubUser).toBeDefined();
    result.current.refreshActiveHubUser?.();

    await waitFor(() => {
      expect(result.current.activeHubUser?.username).toBe('admin-2');
    });
  });
});

describe('HubActiveUserProvider', () => {
  test('should render empty context when disabled', () => {
    const disabledWrapper = ({ children }: { children: ReactNode }) => (
      <SWRConfig
        value={{
          dedupingInterval: 0,
          provider: () => new Map(),
          shouldRetryOnError: false,
        }}
      >
        <HubActiveUserProvider disabled>{children}</HubActiveUserProvider>
      </SWRConfig>
    );

    const { result } = renderHook(() => useHubActiveUser(), { wrapper: disabledWrapper });

    expect(result.current.activeHubUser).toBeUndefined();
    expect(result.current.refreshActiveHubUser).toBeUndefined();
  });
});

import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { edaAPI } from './eda-utils';
import {
  EdaActiveUserProvider,
  EdaActiveUserProviderInternal,
  useEdaActiveUser,
} from './useEdaActiveUser';

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
    <EdaActiveUserProviderInternal>{children}</EdaActiveUserProviderInternal>
  </SWRConfig>
);

describe('useEdaActiveUser', () => {
  test('should provide the active user when API succeeds', async () => {
    server.use(
      http.get(edaAPI`/users/me/`, () => {
        return HttpResponse.json(mockUser);
      })
    );

    const { result } = renderHook(() => useEdaActiveUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.activeEdaUser).toBeDefined();
    });

    expect(result.current.activeEdaUser?.username).toBe('admin');
  });

  test('should set active user to null when API returns an error', async () => {
    server.use(
      http.get(edaAPI`/users/me/`, () => {
        return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 });
      })
    );

    const { result } = renderHook(() => useEdaActiveUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.activeEdaUser).toBeNull();
    });
  });

  test('should provide a working refresh function', async () => {
    let callCount = 0;
    server.use(
      http.get(edaAPI`/users/me/`, () => {
        callCount++;
        return HttpResponse.json({ ...mockUser, username: `admin-${callCount}` });
      })
    );

    const { result } = renderHook(() => useEdaActiveUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.activeEdaUser).toBeDefined();
    });

    expect(result.current.refreshActiveEdaUser).toBeDefined();
    result.current.refreshActiveEdaUser?.();

    await waitFor(() => {
      expect(result.current.activeEdaUser?.username).toBe('admin-2');
    });
  });
});

describe('EdaActiveUserProvider', () => {
  test('should render empty context when disabled', () => {
    const disabledWrapper = ({ children }: { children: ReactNode }) => (
      <SWRConfig
        value={{
          dedupingInterval: 0,
          provider: () => new Map(),
          shouldRetryOnError: false,
        }}
      >
        <EdaActiveUserProvider disabled>{children}</EdaActiveUserProvider>
      </SWRConfig>
    );

    const { result } = renderHook(() => useEdaActiveUser(), { wrapper: disabledWrapper });

    expect(result.current.activeEdaUser).toBeUndefined();
    expect(result.current.refreshActiveEdaUser).toBeUndefined();
  });
});

import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useGetPlatformUsers } from './useGetPlatformUsers';

const platformUser = {
  id: 4,
  username: 'alice',
  url: '/users/4/',
  created: '',
  modified: '',
};

const server = setupServer(http.get(gatewayAPI`/users/4/`, () => HttpResponse.json(platformUser)));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useGetPlatformUsers', () => {
  it('returns platform user from gateway API', async () => {
    const { result } = renderHook(() => useGetPlatformUsers(4));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.platformUser).toEqual(platformUser);
    expect(result.current.error).toBeUndefined();
  });
});

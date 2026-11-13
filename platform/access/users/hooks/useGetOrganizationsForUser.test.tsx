import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useGetOrganizationsForUser } from './useGetOrganizationsForUser';

const organizations = {
  count: 2,
  results: [
    { id: 1, name: 'Org A' },
    { id: 2, name: 'Org B' },
  ],
};

const server = setupServer(
  http.get(gatewayAPI`/users/5/organizations/`, () => HttpResponse.json(organizations))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useGetOrganizationsForUser', () => {
  it('exposes organization ids from the gateway API', async () => {
    const { result } = renderHook(() => useGetOrganizationsForUser(5));

    await waitFor(() => {
      expect(result.current.orgIds).toEqual([1, 2]);
    });
  });

  it('computes added and removed organization ids', async () => {
    const { result } = renderHook(() => useGetOrganizationsForUser(5));

    await waitFor(() => {
      expect(result.current.orgIds.length).toBe(2);
    });

    const { addedOrganizationIds, removedOrganizationIds } =
      result.current.getAddedAndRemovedOrganizationIds([2, 3]);

    expect(addedOrganizationIds).toEqual([3]);
    expect(removedOrganizationIds).toEqual([1]);
  });

  it('treats all ids as added when user has no organizations yet', async () => {
    server.use(
      http.get(gatewayAPI`/users/5/organizations/`, () =>
        HttpResponse.json({ count: 0, results: [] })
      )
    );

    const { result } = renderHook(() => useGetOrganizationsForUser(5));

    await waitFor(() => {
      expect(result.current.orgIds).toEqual([]);
    });

    const diff = result.current.getAddedAndRemovedOrganizationIds([7, 8]);
    expect(diff.addedOrganizationIds).toEqual([7, 8]);
    expect(diff.removedOrganizationIds).toEqual([]);
  });
});

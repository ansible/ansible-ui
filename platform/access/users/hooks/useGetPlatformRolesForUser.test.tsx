import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useGetPlatformRolesForUser } from './useGetPlatformRolesForUser';

const roleDefinitions = {
  count: 2,
  results: [
    {
      id: 10,
      name: 'Admin',
      url: '/roles/10/',
      related: { team_assignments: '', user_assignments: '' },
      summary_fields: {},
      permissions: [],
      content_type: null,
      created: '',
      modified: '',
      description: '',
      managed: false,
      created_by: null,
      modified_by: null,
    },
    {
      id: 11,
      name: 'Member',
      url: '/roles/11/',
      related: { team_assignments: '', user_assignments: '' },
      summary_fields: {},
      permissions: [],
      content_type: null,
      created: '',
      modified: '',
      description: '',
      managed: false,
      created_by: null,
      modified_by: null,
    },
  ],
};

const assignments = {
  count: 1,
  results: [
    {
      id: 100,
      role_definition: 10,
      user: 3,
      content_type: 'shared.organization',
      object_id: 9,
    },
  ],
};

const server = setupServer(
  http.get(gatewayAPI`/role_user_assignments/`, () => HttpResponse.json(assignments)),
  http.get(gatewayAPI`/role_definitions/`, () => HttpResponse.json(roleDefinitions))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useGetPlatformRolesForUser', () => {
  it('returns selected roles once assignments and definitions load', async () => {
    const { result } = renderHook(() =>
      useGetPlatformRolesForUser('shared.organization', '9', '3')
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.selectedRoles).toHaveLength(1);
    expect(result.current.selectedRoles[0]).toMatchObject({
      id: 10,
      name: 'Admin',
      roleAssignmentId: 100,
    });
  });

  it('returns empty selection when user has no role assignments', async () => {
    server.use(
      http.get(gatewayAPI`/role_user_assignments/`, () =>
        HttpResponse.json({ count: 0, results: [] })
      )
    );

    const { result } = renderHook(() =>
      useGetPlatformRolesForUser('shared.organization', '9', '3')
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.selectedRoles).toEqual([]);
  });
});

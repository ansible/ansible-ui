import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { Authenticator, AuthenticatorTypeEnum } from '../../../interfaces/Authenticator';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useProcessAutoMigrationUsersRequest } from './useProcessAutoMigrationUsersRequest';

const legacyAuth: Authenticator = {
  id: 10,
  name: 'legacy',
  auto_migrate_users_to: null,
  url: '/auth/10/',
  created: '',
  modified: '',
  related: {},
  enabled: true,
  create_objects: false,
  remove_users: false,
  configuration: {},
  type: 'ansible_base.authentication.authenticator_plugins.legacy' as AuthenticatorTypeEnum,
  order: 1,
  slug: 'legacy',
  summary_fields: {
    auto_migrate_users_to: { name: '', id: 0 },
    created_by: {} as Authenticator['summary_fields']['created_by'],
    modified_by: {} as Authenticator['summary_fields']['modified_by'],
  },
};

const standardAuth: Authenticator = {
  ...legacyAuth,
  id: 11,
  name: 'ldap',
  type: AuthenticatorTypeEnum.LDAP,
  slug: 'ldap',
};

const linkedAuth: Authenticator = {
  ...standardAuth,
  id: 20,
  name: 'saml',
  type: AuthenticatorTypeEnum.SAML,
  slug: 'saml',
};

const patchSpy = vi.fn();

const server = setupServer(
  http.get(gatewayAPI`/authenticators/`, ({ request }) => {
    const url = new URL(request.url);
    const target = url.searchParams.get('auto_migrate_users_to');
    if (target === '10') {
      return HttpResponse.json({ count: 1, results: [linkedAuth] });
    }
    if (target === '11') {
      return HttpResponse.json({ count: 0, results: [] });
    }
    return HttpResponse.json({ count: 0, results: [] });
  }),
  http.patch(gatewayAPI`/authenticators/:id/`, async ({ request, params }) => {
    patchSpy({ id: params.id, body: await request.json() });
    return HttpResponse.json({});
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  patchSpy.mockClear();
});
afterAll(() => server.close());

describe('useProcessAutoMigrationUsersRequest', () => {
  test('patches legacy authenticator when adding migration targets', async () => {
    server.use(
      http.get(gatewayAPI`/authenticators/`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('auto_migrate_users_to') === '10') {
          return HttpResponse.json({ count: 0, results: [] });
        }
        return HttpResponse.json({ count: 0, results: [] });
      })
    );

    const { result } = renderHook(() => useProcessAutoMigrationUsersRequest());

    await result.current(legacyAuth, [linkedAuth]);

    await waitFor(() => {
      expect(patchSpy).toHaveBeenCalled();
    });
    expect(patchSpy).toHaveBeenCalledWith({
      id: '10',
      body: { auto_migrate_users_to: 20 },
    });
  });

  test('patches removed authenticators for non-legacy type', async () => {
    const removed: Authenticator = { ...linkedAuth, id: 99, auto_migrate_users_to: 11 };
    server.use(
      http.get(gatewayAPI`/authenticators/`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('auto_migrate_users_to') === '11') {
          return HttpResponse.json({ count: 1, results: [removed] });
        }
        return HttpResponse.json({ count: 0, results: [] });
      })
    );

    const { result } = renderHook(() => useProcessAutoMigrationUsersRequest());

    await result.current(standardAuth, []);

    await waitFor(() => {
      expect(patchSpy).toHaveBeenCalledWith({
        id: '99',
        body: { auto_migrate_users_to: null },
      });
    });
  });

  test('returns early when updated authenticator is undefined', async () => {
    const { result } = renderHook(() => useProcessAutoMigrationUsersRequest());

    await result.current(undefined as unknown as Authenticator, null);

    expect(patchSpy).not.toHaveBeenCalled();
  });
});

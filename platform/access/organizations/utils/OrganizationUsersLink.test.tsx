/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { OrganizationUsersLink } from './OrganizationUsersLink';

const mockGetPageUrl = vi.fn((route: PlatformRoute, options?: { params?: { id: string } }) => {
  if (route === PlatformRoute.OrganizationUsers) {
    return `/access/organizations/${options?.params?.id}/users`;
  }
  return '/fallback';
});

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => mockGetPageUrl,
  };
});

describe('OrganizationUsersLink', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => {
    server.resetHandlers();
    mockGetPageUrl.mockClear();
  });
  afterAll(() => server.close());

  test('renders a link when organizationId is provided without organizations lookup', () => {
    render(
      <MemoryRouter>
        <OrganizationUsersLink organizationName="Acme Org" organizationId={42} />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: 'Acme Org' });
    expect(link).toHaveAttribute('href', '/access/organizations/42/users');
    expect(mockGetPageUrl).toHaveBeenCalledWith(PlatformRoute.OrganizationUsers, {
      params: { id: '42' },
    });
  });

  test('renders a link when organization is resolved by name lookup', async () => {
    server.use(
      http.get(gatewayAPI`/organizations/`, ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('name') === 'Acme Org') {
          return HttpResponse.json({
            count: 1,
            results: [{ id: 99, name: 'Acme Org' }],
          });
        }
        return HttpResponse.json({ count: 0, results: [] });
      })
    );

    render(
      <MemoryRouter>
        <OrganizationUsersLink organizationName="Acme Org" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Acme Org' })).toHaveAttribute(
        'href',
        '/access/organizations/99/users'
      );
    });
  });

  test('renders plain text when organization cannot be resolved', async () => {
    server.use(
      http.get(gatewayAPI`/organizations/`, () => HttpResponse.json({ count: 0, results: [] }))
    );

    render(
      <MemoryRouter>
        <OrganizationUsersLink organizationName="Missing Org" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Missing Org' })).not.toBeInTheDocument();
      expect(screen.getByText('Missing Org')).toBeInTheDocument();
    });
  });
});

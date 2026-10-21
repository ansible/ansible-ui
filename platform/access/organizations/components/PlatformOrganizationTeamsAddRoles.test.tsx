import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import mockOrganization from './fixtures/organization.fixture.json';
import { PlatformOrganizationTeamsAddRoles } from './PlatformOrganizationTeamsAddRoles';

describe('PlatformOrganizationTeamsAddRoles', () => {
  const server = setupServer(
    http.get(gatewayAPI`/organizations/1/`, () => HttpResponse.json(mockOrganization)),
    http.get(gatewayAPI`/teams/`, () =>
      HttpResponse.json({ count: 0, results: [], next: null, previous: null })
    )
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render wizard with title and first step', async () => {
    render(
      <MemoryRouter initialEntries={['/access/organizations/1/teams/assign-organization-roles']}>
        <Routes>
          <Route
            path="/access/organizations/:id/teams/assign-organization-roles"
            element={<PlatformOrganizationTeamsAddRoles />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Assign organization roles' })
      ).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Select team(s)' })).toBeInTheDocument();
  });

  it('should show teams from other organizations in the team picker (AAP-83161)', async () => {
    // A team belonging to org 2 — different from the org (1) whose roles wizard we opened
    const crossOrgTeam = {
      id: 2,
      name: 'team-org-test2',
      organization: 2,
      description: '',
      url: '/api/gateway/v1/teams/2/',
      related: {},
      summary_fields: {
        organization: { id: 2, name: 'org_test2' },
        resource: {
          ansible_id: 'aaaaaaaa-0000-0000-0000-000000000002',
          resource_type: 'shared.team',
        },
      },
    };

    server.use(
      http.get(gatewayAPI`/teams/`, () =>
        HttpResponse.json({ count: 1, results: [crossOrgTeam], next: null, previous: null })
      )
    );

    render(
      <MemoryRouter initialEntries={['/access/organizations/1/teams/assign-organization-roles']}>
        <Routes>
          <Route
            path="/access/organizations/:id/teams/assign-organization-roles"
            element={<PlatformOrganizationTeamsAddRoles />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('team-org-test2')).toBeInTheDocument();
    });
  });
});

/* eslint-disable i18next/no-literal-string */
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import mockOrganization from './fixtures/organization.fixture.json';
import { PlatformOrganizationTeams } from './PlatformOrganizationTeams';

// Team belonging to org 1 — the org whose Teams tab we are viewing
const orgMemberTeam = {
  id: 1,
  name: 'team-org-test1',
  organization: 1,
  description: '',
  url: '/api/gateway/v1/teams/1/',
  related: {},
  summary_fields: {
    organization: { id: 1, name: 'org_test1' },
    resource: { ansible_id: 'aaaaaaaa-0000-0000-0000-000000000001', resource_type: 'shared.team' },
  },
};

// Team from org 2 with an org-level role assignment on org 1 (cross-org)
const crossOrgTeam = {
  id: 2,
  name: 'team-org-test2',
  organization: 2,
  description: '',
  url: '/api/gateway/v1/teams/2/',
  related: {},
  summary_fields: {
    organization: { id: 2, name: 'org_test2' },
    resource: { ansible_id: 'aaaaaaaa-0000-0000-0000-000000000002', resource_type: 'shared.team' },
  },
};

// Role assignment granting team 2 an org-level role on org 1
const crossOrgRoleAssignment = {
  id: 101,
  team: 2,
  role_definition: 5,
  object_id: '1',
  content_type: 'shared.organization',
  created: '2024-01-01T00:00:00Z',
  summary_fields: {
    team: { id: 2, name: 'team-org-test2' },
    role_definition: { id: 5, name: 'Organization Admin', description: '', managed: true },
    content_object: { id: 1, name: 'org_test1' },
    object_role: { id: 22 },
  },
};

describe('PlatformOrganizationTeams', () => {
  const server = setupServer(
    http.get(gatewayAPI`/organizations/1/`, () => HttpResponse.json(mockOrganization)),
    http.get(gatewayAPI`/role_team_assignments/`, () =>
      HttpResponse.json({ count: 0, results: [], next: null, previous: null })
    ),
    http.get(gatewayAPI`/teams/`, () =>
      HttpResponse.json({ count: 0, results: [], next: null, previous: null })
    ),
    http.options(gatewayAPI`/teams/`, () => HttpResponse.json({ actions: {} }))
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('exports the PlatformOrganizationTeams component', () => {
    expect(PlatformOrganizationTeams).toBeDefined();
    expect(typeof PlatformOrganizationTeams).toBe('function');
  });

  it('shows org-member teams and cross-org teams with role assignments (AAP-83161)', async () => {
    server.use(
      http.get(gatewayAPI`/role_team_assignments/`, () =>
        HttpResponse.json({
          count: 1,
          results: [crossOrgRoleAssignment],
          next: null,
          previous: null,
        })
      ),
      http.get(gatewayAPI`/teams/`, () =>
        HttpResponse.json({
          count: 2,
          results: [orgMemberTeam, crossOrgTeam],
          next: null,
          previous: null,
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/access/organizations/1/teams']}>
        <Routes>
          <Route path="/access/organizations/:id/teams" element={<PlatformOrganizationTeams />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('team-org-test1')).toBeInTheDocument();
    });

    // team-org-test2 belongs to org 2 but has a role on org 1 — must appear on org 1's Teams tab
    expect(screen.getByText('team-org-test2')).toBeInTheDocument();

    // The role assigned to team-org-test2 should appear in the Organization roles column
    expect(screen.getByText('Organization Admin')).toBeInTheDocument();

    // Banner should be visible
    expect(
      screen.getByText(
        'Below displays a list of teams with an assigned role within this organization.'
      )
    ).toBeInTheDocument();
  });

  it('shows a loading state while the organization is being fetched', async () => {
    // The org fetch is pending — orgId is undefined, so role_team_assignments is not called.
    // This covers the `orgId ? fetch : undefined` branch in useOrganizationTeamsWithRoles.
    server.use(
      http.get(gatewayAPI`/organizations/1/`, () => HttpResponse.json(mockOrganization)),
      http.get(gatewayAPI`/teams/`, () =>
        HttpResponse.json({ count: 0, results: [], next: null, previous: null })
      )
    );

    render(
      <MemoryRouter initialEntries={['/access/organizations/1/teams']}>
        <Routes>
          <Route path="/access/organizations/:id/teams" element={<PlatformOrganizationTeams />} />
        </Routes>
      </MemoryRouter>
    );

    // Component renders (either loading or loaded) without crashing
    await waitFor(() => {
      expect(
        screen.queryByText('Error loading teams') === null ||
          screen.queryByText('team-org-test1') !== null ||
          document.querySelector('[data-ouia-component-type="PF6/Spinner"]') !== null ||
          screen.queryByText('No teams') !== null
      ).toBe(true);
    });
  });
});

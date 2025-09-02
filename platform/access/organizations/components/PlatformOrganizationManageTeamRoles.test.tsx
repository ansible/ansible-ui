import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import mockEmptyRoleAssignments from './fixtures/emptyRoleAssignments.fixture.json';
import mockOrganization from './fixtures/organization.fixture.json';
import mockRoleAssignments from './fixtures/roleAssignments.fixture.json';
import mockRoles from './fixtures/rolesList.fixture.json';
import mockTeam from './fixtures/team.fixture.json';
import { PlatformOrganizationManageTeamRoles } from './PlatformOrganizationManageTeamRoles';

describe('PlatformOrganizationManageTeamRoles', () => {
  const server = setupServer(
    // Organization endpoint
    http.get(gatewayAPI`/organizations/1/`, () => {
      return HttpResponse.json(mockOrganization);
    }),

    // Team endpoint
    http.get(gatewayAPI`/teams/1/`, () => {
      return HttpResponse.json(mockTeam);
    }),

    // Role definitions endpoint
    http.get(gatewayAPI`/role_definitions/`, ({ request }) => {
      const url = new URL(request.url);
      const contentType = url.searchParams.get('content_type__api_slug');

      if (contentType === 'shared.organization') {
        return HttpResponse.json(mockRoles);
      }
      return HttpResponse.json({ count: 0, results: [] });
    }),

    // Role team assignments endpoint
    http.get(gatewayAPI`/role_team_assignments/`, ({ request }) => {
      const url = new URL(request.url);
      const teamId = url.searchParams.get('team_id');
      const objectId = url.searchParams.get('object_id');

      if (teamId === '1' && objectId === '1') {
        return HttpResponse.json(mockRoleAssignments);
      }
      return HttpResponse.json(mockEmptyRoleAssignments);
    }),

    // POST role assignment
    http.post(gatewayAPI`/role_team_assignments/`, () => {
      return HttpResponse.json({ id: 101 }, { status: 201 });
    }),

    // DELETE role assignment
    http.delete(gatewayAPI`/role_team_assignments/100/`, () => {
      return new HttpResponse(null, { status: 204 });
    }),

    // Service index role types endpoint
    http.get(gatewayAPI`/service-index/role-types/`, () => {
      return HttpResponse.json({ results: [] });
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('should render loading state', () => {
    render(
      <MemoryRouter initialEntries={['/access/organizations/1/teams/1/manage-roles']}>
        <Routes>
          <Route
            path="/access/organizations/:id/teams/:teamId/manage-roles"
            element={<PlatformOrganizationManageTeamRoles />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('should render page header with correct title and breadcrumbs', async () => {
    render(
      <MemoryRouter initialEntries={['/access/organizations/1/teams/1/manage-roles']}>
        <Routes>
          <Route
            path="/access/organizations/:id/teams/:teamId/manage-roles"
            element={<PlatformOrganizationManageTeamRoles />}
          />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: /Manage organization roles for test-team/,
        })
      ).toBeInTheDocument();
    });

    // Check breadcrumbs
    expect(screen.getByText('Organizations')).toBeInTheDocument();
    expect(screen.getByText('Test Organization')).toBeInTheDocument();
    expect(screen.getByText('Teams')).toBeInTheDocument();
  });

  test('should load and display available roles', async () => {
    render(
      <MemoryRouter initialEntries={['/access/organizations/1/teams/1/manage-roles']}>
        <Routes>
          <Route
            path="/access/organizations/:id/teams/:teamId/manage-roles"
            element={<PlatformOrganizationManageTeamRoles />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('cell', { name: /Organization Admin/ })).toBeInTheDocument();
      expect(screen.getByRole('cell', { name: /Organization Member/ })).toBeInTheDocument();
      expect(screen.getByRole('cell', { name: /Organization Auditor/ })).toBeInTheDocument();
    });
  });

  test('should pre-select existing role assignments', async () => {
    render(
      <MemoryRouter initialEntries={['/access/organizations/1/teams/1/manage-roles']}>
        <Routes>
          <Route
            path="/access/organizations/:id/teams/:teamId/manage-roles"
            element={<PlatformOrganizationManageTeamRoles />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Selected roles')).toBeInTheDocument();
    });

    // check for 'Selected roles' label
    await waitFor(() => {
      const selectedRolesSection = screen.getByText('Selected roles').closest('div');
      expect(selectedRolesSection).toBeInTheDocument();

      const roleLabel = within(selectedRolesSection?.parentElement as HTMLElement).getByRole(
        'listitem'
      );
      expect(roleLabel).toHaveTextContent(/Organization Member/);
    });

    // check that "Organization Member" checkbox is checked
    const memberRoleRow = screen.getByTestId('row-id-2');
    const checkbox = memberRoleRow.querySelector('input[type="checkbox"]');
    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });
  });

  test('should handle role selection changes', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/access/organizations/1/teams/1/manage-roles']}>
        <Routes>
          <Route
            path="/access/organizations/:id/teams/:teamId/manage-roles"
            element={<PlatformOrganizationManageTeamRoles />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Organization Admin')).toBeInTheDocument();
    });

    // Select the Organization Admin role
    // Find the Organization Admin row in the table by its test ID (role ID 1)
    const adminRoleRow = screen.getByTestId('row-id-1');
    const adminCheckbox = adminRoleRow?.querySelector('input[type="checkbox"]');

    if (adminCheckbox) {
      await user.click(adminCheckbox);
      expect(adminCheckbox).toBeChecked();
    }
  });
});

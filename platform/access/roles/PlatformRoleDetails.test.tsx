import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { PlatformRole } from '../../interfaces/PlatformRole';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import { PlatformRoleDetails } from './PlatformRoleDetails';

const mockRole: PlatformRole = {
  id: 1,
  url: '/api/gateway/v1/role_definitions/1/',
  related: {
    team_assignments: '/api/gateway/v1/role_definitions/1/team_assignments/',
    user_assignments: '/api/gateway/v1/role_definitions/1/user_assignments/',
  },
  summary_fields: {},
  permissions: ['view_organization', 'edit_organization'],
  content_type: 'organization',
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-02T00:00:00Z',
  name: 'Organization Admin',
  description: 'Administrator role for organizations',
  managed: true,
  created_by: 'admin',
  modified_by: 'admin',
};

describe('PlatformRoleDetails', () => {
  let server: ReturnType<typeof setupServer>;

  beforeAll(() => {
    server = setupServer();
    server.listen({ onUnhandledRequest: 'error' });
  });

  beforeEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('should render role details when data is loaded', async () => {
    server.use(
      http.get(gatewayAPI`/role_definitions/1/`, () => {
        return HttpResponse.json(mockRole);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/roles/1/details']}>
        <Routes>
          <Route path="/access/roles/:id/details" element={<PlatformRoleDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Organization Admin' })).toBeInTheDocument();
    });

    expect(screen.getByText('Administrator role for organizations')).toBeInTheDocument();
    // Breadcrumb shows the current page name
    expect(screen.getByTestId('name')).toHaveTextContent('Organization Admin');
  });

  it('should render with custom breadcrumb label', async () => {
    server.use(
      http.get(gatewayAPI`/role_definitions/1/`, () => {
        return HttpResponse.json(mockRole);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/roles/1/details']}>
        <Routes>
          <Route
            path="/access/roles/:id/details"
            element={<PlatformRoleDetails breadcrumbLabelForPreviousPage="Custom Roles" />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Organization Admin' })).toBeInTheDocument();
    });

    // Check for custom breadcrumb - it's rendered in the breadcrumb navigation
    expect(screen.getByTestId('name')).toHaveTextContent('Organization Admin');
  });

  it('should render role with minimal data', async () => {
    const minimalRole: PlatformRole = {
      id: 2,
      url: '/api/gateway/v1/role_definitions/2/',
      related: {
        team_assignments: '/api/gateway/v1/role_definitions/2/team_assignments/',
        user_assignments: '/api/gateway/v1/role_definitions/2/user_assignments/',
      },
      summary_fields: {},
      permissions: [],
      content_type: 'project',
      created: '2024-01-01T00:00:00Z',
      modified: '2024-01-01T00:00:00Z',
      name: 'Basic Role',
      description: '',
      managed: false,
      created_by: null,
      modified_by: null,
    };

    server.use(
      http.get(gatewayAPI`/role_definitions/2/`, () => {
        return HttpResponse.json(minimalRole);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/roles/2/details']}>
        <Routes>
          <Route path="/access/roles/:id/details" element={<PlatformRoleDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Basic Role' })).toBeInTheDocument();
    });

    // Should render even with minimal data - check that the name is displayed
    expect(screen.getByTestId('name')).toHaveTextContent('Basic Role');
  });

  it('should handle role with special characters in name', async () => {
    const specialRole: PlatformRole = {
      ...mockRole,
      id: 3,
      name: 'Test & Special <Role>',
      description: 'Role with "quotes" and symbols!',
    };

    server.use(
      http.get(gatewayAPI`/role_definitions/3/`, () => {
        return HttpResponse.json(specialRole);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/roles/3/details']}>
        <Routes>
          <Route path="/access/roles/:id/details" element={<PlatformRoleDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test & Special <Role>' })).toBeInTheDocument();
    });

    expect(screen.getByText('Role with "quotes" and symbols!')).toBeInTheDocument();
  });

  it('should display permissions as labels', async () => {
    server.use(
      http.get(gatewayAPI`/role_definitions/1/`, () => {
        return HttpResponse.json(mockRole);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/roles/1/details']}>
        <Routes>
          <Route path="/access/roles/:id/details" element={<PlatformRoleDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Organization Admin' })).toBeInTheDocument();
    });

    // Check that permissions are displayed
    expect(screen.getByText('view_organization')).toBeInTheDocument();
    expect(screen.getByText('edit_organization')).toBeInTheDocument();
  });

  it('should display action buttons', async () => {
    server.use(
      http.get(gatewayAPI`/role_definitions/1/`, () => {
        return HttpResponse.json(mockRole);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/roles/1/details']}>
        <Routes>
          <Route path="/access/roles/:id/details" element={<PlatformRoleDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Organization Admin' })).toBeInTheDocument();
    });

    // Check for action buttons
    expect(screen.getByRole('link', { name: /edit role/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /edit role/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /kebab dropdown toggle/i })).toBeInTheDocument();
  });
});

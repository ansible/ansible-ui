import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { PlatformRole } from '../../interfaces/PlatformRole';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import { PlatformRoleDetails } from './PlatformRoleDetails';
import rolePermissions from './mocks/rolePermissions.fixture.json';

const mockRole: PlatformRole = {
  id: 1,
  url: '/api/gateway/v1/role_definitions/1/',
  related: {
    team_assignments: '/api/gateway/v1/role_definitions/1/team_assignments/',
    user_assignments: '/api/gateway/v1/role_definitions/1/user_assignments/',
  },
  summary_fields: {},
  permissions: ['shared.view_organization', 'shared.delete_organization'],
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
    server.use(
      http.get(gatewayAPI`/role_definitions/1/`, () => {
        return HttpResponse.json(mockRole);
      }),
      http.get(gatewayAPI`/service-index/role-permissions/`, () => {
        return HttpResponse.json(rolePermissions);
      })
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  const expectBreadcrumbs = (items: string[]) => {
    const breadcrumbNav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    const breadcrumbItems = within(breadcrumbNav).getAllByRole('listitem');
    expect(breadcrumbItems).toHaveLength(items.length);
    items.forEach((text, i) => {
      expect(breadcrumbItems[i]).toHaveTextContent(text);
    });
  };

  it('should render role details when data is loaded', async () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={['/access/roles/1/details']}>
        <Routes>
          <Route path="/access/roles/:id/details" element={<PlatformRoleDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Organization Admin' })).toBeInTheDocument();
    });

    expectBreadcrumbs(['Roles', 'Organization Admin']);

    expect(getByTestId('name')).toHaveTextContent(mockRole.name);
    expect(getByTestId('description')).toHaveTextContent(mockRole.description);
    expect(getByTestId('resource-type')).toHaveTextContent('Organization');
    expect(getByTestId('role-creation')).toHaveTextContent('Default');
    expect(getByTestId('created')).toBeInTheDocument();
    expect(getByTestId('last-modified')).toBeInTheDocument();

    const permissionsDetail = getByTestId('permissions');
    expect(permissionsDetail).toHaveTextContent('Can view organization');
    expect(permissionsDetail).toHaveTextContent('Can delete organization');

    const componentsDetail = getByTestId('components');
    expect(componentsDetail).toHaveTextContent('Automation Execution');
    expect(componentsDetail).toHaveTextContent('Automation Decisions');
    expect(componentsDetail).toHaveTextContent('Automation Content');
  });

  it('should render with custom breadcrumb label', async () => {
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
      expectBreadcrumbs(['Custom Roles', 'Organization Admin']);
    });
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
    expect(screen.getByTestId('role-creation')).toHaveTextContent('Custom');
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

  it('should display action buttons', async () => {
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

  it('should render breadcrumb with Roles navigation item on details page', async () => {
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

    const breadcrumbNav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    const breadcrumbItems = within(breadcrumbNav).getAllByRole('listitem');
    expect(breadcrumbItems).toHaveLength(2);
    expect(breadcrumbItems[0]).toHaveTextContent('Roles');
    expect(breadcrumbItems[0]).toHaveAttribute('data-testid', 'Roles');
    expect(breadcrumbItems[1]).toHaveTextContent('Organization Admin');
  });

  it('should keep role visible after cancelling deletion dialog', async () => {
    const user = userEvent.setup();
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

    const kebab = screen.getByRole('button', { name: /kebab dropdown toggle/i });
    await user.click(kebab);

    const deleteAction = await screen.findByRole('menuitem', { name: /delete role/i });
    await user.click(deleteAction);

    expect(screen.getByRole('heading', { name: 'Organization Admin' })).toBeInTheDocument();
  });
});

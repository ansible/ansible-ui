import { render, waitFor, within, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { gatewayAPI } from '../../utils/gateway-api-utils';

import roleDefinition from './mocks/roleDefinition.fixture.json';
import rolePermissions from './mocks/rolePermissions.fixture.json';
import roleTypes from './mocks/roleTypes.fixture.json';
import { CreatePlatformRole, EditPlatformRole } from './PlatformRoleForm';

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
}

describe('PlatformRoleForm', () => {
  const server = setupServer(
    http.get(gatewayAPI`/role_definitions/1/*`, () => {
      return HttpResponse.json(roleDefinition);
    }),
    http.get(gatewayAPI`/service-index/role-types/*`, () => {
      return HttpResponse.json(roleTypes);
    }),
    http.get(gatewayAPI`/service-index/role-permissions/*`, () => {
      return HttpResponse.json(rolePermissions);
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterAll(() => {
    vi.restoreAllMocks();
    server.close();
  });

  afterEach(() => {
    server.resetHandlers();
    vi.restoreAllMocks();
  });

  const expectBreadcrumbs = (items: string[]) => {
    const breadcrumbNav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    const breadcrumbItems = within(breadcrumbNav).getAllByRole('listitem');
    expect(breadcrumbItems).toHaveLength(items.length);
    items.forEach((text, i) => {
      expect(breadcrumbItems[i]).toHaveTextContent(text);
    });
  };

  describe('CreatePlatformRole', () => {
    test('should render the create role form', () => {
      const { getByRole } = render(
        <MemoryRouter initialEntries={['/access/roles/create']}>
          <Routes>
            <Route path={'/access/roles/create'} element={<CreatePlatformRole />} />
          </Routes>
        </MemoryRouter>
      );

      expect(getByRole('button', { name: 'Create role' })).toBeInTheDocument();
    });

    test('should display title and default breadcrumbs', () => {
      const { getByRole } = render(
        <MemoryRouter initialEntries={['/access/roles/create']}>
          <Routes>
            <Route path={'/access/roles/create'} element={<CreatePlatformRole />} />
          </Routes>
        </MemoryRouter>
      );

      expect(getByRole('heading', { name: 'Create role' })).toBeInTheDocument();
      expectBreadcrumbs(['Roles', 'Create role']);
    });

    test('should display custom breadcrumb label', () => {
      render(
        <MemoryRouter initialEntries={['/access/roles/create']}>
          <Routes>
            <Route
              path={'/access/roles/create'}
              element={<CreatePlatformRole breadcrumbLabelForPreviousPage="FOO PAGE" />}
            />
          </Routes>
        </MemoryRouter>
      );

      expectBreadcrumbs(['FOO PAGE', 'Create role']);
    });
  });

  describe('EditPlatformRole', () => {
    test('should render the edit role form', async () => {
      const { getByRole } = render(
        <MemoryRouter initialEntries={['/access/roles/1/edit']}>
          <Routes>
            <Route path={'/access/roles/:id/edit'} element={<EditPlatformRole />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(getByRole('button', { name: 'Save role' })).toBeInTheDocument();
      });
    });

    test('should display title and default breadcrumbs', async () => {
      const { getByRole } = render(
        <MemoryRouter initialEntries={['/access/roles/1/edit']}>
          <Routes>
            <Route path={'/access/roles/:id/edit'} element={<EditPlatformRole />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(getByRole('heading')).toHaveTextContent('Edit');
      });
      expectBreadcrumbs(['Roles', 'Edit']);
    });

    test('should display custom breadcrumb label', () => {
      server.use(
        http.get(gatewayAPI`/role_definitions/123/`, () => {
          return HttpResponse.json({});
        })
      );
      render(
        <MemoryRouter initialEntries={['/access/roles/123/edit']}>
          <Routes>
            <Route
              path={'/access/roles/:id/edit'}
              element={<EditPlatformRole breadcrumbLabelForPreviousPage="FOO PAGE" />}
            />
          </Routes>
        </MemoryRouter>
      );

      expectBreadcrumbs(['FOO PAGE', 'Edit Role']);
    });

    test('should disable the resource type field in edit role form', async () => {
      const user = userEvent.setup();
      const { findByRole } = render(
        <MemoryRouter initialEntries={['/access/roles/1/edit']}>
          <Routes>
            <Route path={'/access/roles/:id/edit'} element={<EditPlatformRole />} />
          </Routes>
        </MemoryRouter>
      );

      const resourceTypeButton = await findByRole('button', { name: 'Resource type' });
      expect(resourceTypeButton).toBeDisabled();

      await user.click(resourceTypeButton);
      expect(await findByRole('tooltip')).toHaveTextContent('The resource type cannot be edited.');
    });

    test('should display the role fields pre-populated', async () => {
      const { getByRole, findByText } = render(
        <MemoryRouter initialEntries={['/access/roles/1/edit']}>
          <Routes>
            <Route path={'/access/roles/:id/edit'} element={<EditPlatformRole />} />
          </Routes>
        </MemoryRouter>
      );

      expect(getByRole('textbox', { name: 'Name' })).toHaveValue('Demo role');
      expect(getByRole('textbox', { name: 'Description' })).toHaveValue('This is a demo role');
      expect(await findByText('Rulebook Activation')).toBeInTheDocument();
      expect(await findByText('Can view activation')).toBeInTheDocument();
      expect(await findByText('Can restart an activation')).toBeInTheDocument();
    });
  });

  describe('Permission Selection Validation', () => {
    test('should show permissions only after selecting resource type', async () => {
      const user = userEvent.setup();

      const { findByRole, getByText, queryByRole } = render(
        <MemoryRouter initialEntries={['/access/roles/create']}>
          <Routes>
            <Route path={'/access/roles/create'} element={<CreatePlatformRole />} />
          </Routes>
        </MemoryRouter>
      );

      expect(queryByRole('button', { name: 'Permissions' })).not.toBeInTheDocument();

      const resourceTypeButton = await findByRole('button', { name: 'Resource type' });
      await user.click(resourceTypeButton);

      const organizationOption = getByText('Organization');
      await user.click(organizationOption);

      const permissionsButton = await findByRole(
        'button',
        { name: 'Permissions' },
        { timeout: 10000 }
      );
      expect(permissionsButton).toBeInTheDocument();
    }, 15000);

    test('should update resource type when option is selected', async () => {
      const user = userEvent.setup();

      const { findByRole, getByText } = render(
        <MemoryRouter initialEntries={['/access/roles/create']}>
          <Routes>
            <Route path={'/access/roles/create'} element={<CreatePlatformRole />} />
          </Routes>
        </MemoryRouter>
      );

      const resourceTypeButton = await findByRole('button', { name: 'Resource type' });
      await user.click(resourceTypeButton);
      await user.click(getByText('Organization'));
      expect(resourceTypeButton).toHaveTextContent('Organization');
    });

    test('should reset permissions when changing resource type', async () => {
      const user = userEvent.setup();
      const { findByRole, getByText, getByLabelText, getByRole, queryByText } = render(
        <MemoryRouter initialEntries={['/access/roles/create']}>
          <Routes>
            <Route path={'/access/roles/create'} element={<CreatePlatformRole />} />
          </Routes>
        </MemoryRouter>
      );

      // Select initial resource type
      const resourceTypeButton = getByRole('button', { name: 'Resource type' });
      await user.click(resourceTypeButton);
      await user.click(getByText('Organization'));

      await waitFor(() => {
        expect(resourceTypeButton).toHaveTextContent('Organization');
      });

      // Select permissions
      const permissionsButton = await findByRole(
        'button',
        { name: 'Permissions' },
        { timeout: 10000 }
      );
      expect(permissionsButton).toHaveTextContent('Select permissions');
      await user.click(permissionsButton);
      await user.click(getByLabelText('Audit organization'));

      // Close permissions dropdown
      await user.click(document.body);

      await waitFor(() => {
        expect(permissionsButton).toHaveTextContent('Audit organization');
      });
      expect(queryByText('Select permissions')).not.toBeInTheDocument();

      // Change resource type
      await user.click(resourceTypeButton);
      await user.click(getByText('System'));

      await waitFor(() => {
        expect(resourceTypeButton).toHaveTextContent('System');
      });

      // Verify reset permissions
      await waitFor(() => {
        expect(permissionsButton).toHaveTextContent('Select permissions');
      });
      expect(queryByText('Audit organization')).not.toBeInTheDocument();
    }, 15000);

    test('should allow selecting multiple permissions for a resource type', async () => {
      const user = userEvent.setup();
      const { findByRole, getByText, getByRole } = render(
        <MemoryRouter initialEntries={['/access/roles/create']}>
          <Routes>
            <Route path={'/access/roles/create'} element={<CreatePlatformRole />} />
          </Routes>
        </MemoryRouter>
      );

      await user.click(getByRole('button', { name: 'Resource type' }));
      await user.click(getByText('Organization'));

      const permissionsButton = await findByRole(
        'button',
        { name: 'Permissions' },
        { timeout: 10000 }
      );

      await user.click(permissionsButton);
      await user.click(getByText('Audit organization'));
      await user.click(getByText('Can view organization'));

      await waitFor(() => {
        expect(permissionsButton).toHaveTextContent('Audit organization');
        expect(permissionsButton).toHaveTextContent('Can view organization');
      });
    }, 15000);
  });

  describe('Cancel Navigation', () => {
    test('should navigate away from create form when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/access/roles', '/access/roles/create']}>
          <Routes>
            <Route path="/access/roles" element={<LocationDisplay />} />
            <Route path="/access/roles/create" element={<CreatePlatformRole />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: 'Create role' })).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(screen.getByTestId('location-display')).toHaveTextContent('/access/roles');
      });
    });

    test('should navigate away from edit form when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/access/roles/1/details', '/access/roles/1/edit']}>
          <Routes>
            <Route path="/access/roles/:id/details" element={<LocationDisplay />} />
            <Route path="/access/roles/:id/edit" element={<EditPlatformRole />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Save role' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(screen.getByTestId('location-display')).toHaveTextContent('/access/roles/1/details');
      });
    });
  });
});

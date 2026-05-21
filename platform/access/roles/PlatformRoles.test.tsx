import { render, renderHook, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import roleTypes from './mocks/roleTypes.fixture.json';
import rolePermissions from './mocks/rolePermissions.fixture.json';
import { PlatformRoles } from './PlatformRoles';
import { usePlatformRolesFilters } from './hooks/usePlatformRolesFilters';

const mockBulkConfirmation = vi.fn();
vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useBulkConfirmation: () => mockBulkConfirmation,
  };
});
vi.mock('@ansible/platform-ui/main/PlatformActiveUserProvider', () => ({
  usePlatformActiveUser: () => ({
    activePlatformUser: {
      is_superuser: true,
      id: 1,
      username: 'admin',
    },
  }),
}));

const mockRoles: Record<
  string,
  {
    id: number;
    name: string;
    description?: string;
    managed?: boolean;
    permissions?: string[];
    content_type?: string;
  }[]
> = {
  awx: [
    {
      id: 20,
      name: 'AWX Admin',
      managed: true,
    },
    {
      id: 12,
      name: 'AWX Credential Admin',
      description: 'Has all permissions to a single credential',
      managed: true,
      content_type: 'awx.credential',
      permissions: [
        'awx.change_credential',
        'awx.delete_credential',
        'awx.use_credential',
        'awx.view_credential',
      ],
    },
    {
      id: 123,
      name: 'Custom Role',
      managed: false,
    },
  ],
  eda: [
    {
      id: 70,
      name: 'EDA Project Admin',
    },
    {
      id: 71,
      name: 'EDA Credential Admin',
      description: 'Has all permissions to EDA credentials',
      managed: true,
      content_type: 'eda.edacredential',
      permissions: [
        'eda.change_edacredential',
        'eda.delete_edacredential',
        'eda.view_edacredential',
      ],
    },
  ],
  galaxy: [
    {
      id: 48,
      name: 'Galaxy Admin',
    },
  ],
  shared: [
    {
      id: 32,
      name: 'Platform Auditor',
      description: 'Has view permissions to all objects',
    },
  ],
};

const ALL_ROLES = [...mockRoles.awx, ...mockRoles.eda, ...mockRoles.galaxy, ...mockRoles.shared];

const waitForTableToLoad = async () => {
  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
};

describe('PlatformRoles', () => {
  let server: ReturnType<typeof setupServer>;
  let currentApiUrl = '';

  const getDataRowCount = () => {
    const allRows = screen.getAllByRole('row');
    const dataRows = allRows.filter(
      (row) => within(row).queryAllByRole('columnheader').length === 0
    );
    return dataRows.length;
  };

  const openComponentFilter = async (user: ReturnType<typeof userEvent.setup>) => {
    const filterButton = screen.getByTestId('filter');
    await user.click(filterButton);

    const componentOption = await screen.findByRole('option', { name: 'Component' });
    await user.click(componentOption);
  };

  const chooseComponent = async (
    user: ReturnType<typeof userEvent.setup>,
    componentName: string
  ) => {
    const filterComponentButton = screen.queryByRole('button', { name: 'Select component' });
    if (filterComponentButton) {
      await user.click(filterComponentButton);
    }

    const checkbox = await screen.findByRole('checkbox', { name: componentName });
    await user.click(checkbox);
  };

  const expectRolesVisible = (roleNames: string[]) => {
    roleNames.forEach((name) => {
      expect(screen.getByRole('cell', { name })).toBeInTheDocument();
    });
  };

  const expectRolesHidden = (roleNames: string[]) => {
    roleNames.forEach((name) => {
      expect(screen.queryByRole('cell', { name })).not.toBeInTheDocument();
    });
  };

  const setupTest = () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PlatformRoles />
      </MemoryRouter>
    );
    return { user };
  };

  beforeAll(() => {
    server = setupServer();
    server.listen({ onUnhandledRequest: 'error' });
  });

  beforeEach(() => {
    currentApiUrl = '';
    server.use(
      http.get('/api/gateway/v1/role_definitions/', ({ request }) => {
        const url = new URL(request.url);
        currentApiUrl = url.toString();

        const componentFilter = url.searchParams.get('permissions__content_type__service');
        const orComponentFilters = url.searchParams.getAll(
          'or__permissions__content_type__service'
        );
        const resourceTypeFilter = url.searchParams.get('content_type__api_slug');

        // Handle resource type filtering (for testing duplicate label bug fix)
        if (resourceTypeFilter) {
          const filteredRoles = ALL_ROLES.filter(
            (role) => role.content_type === resourceTypeFilter
          );
          return HttpResponse.json({ count: filteredRoles.length, results: filteredRoles });
        }

        if (orComponentFilters.length > 0) {
          const combinedRoles = [...mockRoles.awx, ...mockRoles.shared];
          return HttpResponse.json({ count: combinedRoles.length, results: combinedRoles });
        }

        const roles = mockRoles[componentFilter as keyof typeof mockRoles] || ALL_ROLES;
        return HttpResponse.json({ count: roles.length, results: roles });
      }),
      http.get('/api/gateway/v1/service-index/role-types/', () => HttpResponse.json(roleTypes)),
      http.get('/api/gateway/v1/service-index/role-permissions/', () =>
        HttpResponse.json(rolePermissions as Record<string, unknown>)
      )
    );
  });

  afterEach(() => {
    window.history.replaceState({}, '', window.location.pathname);
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('should render loading state', () => {
    render(
      <MemoryRouter>
        <PlatformRoles />
      </MemoryRouter>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render page header with correct title', async () => {
    render(
      <MemoryRouter>
        <PlatformRoles />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: /Roles/ })).toBeInTheDocument();
        expect(
          screen.getByText(
            /A role represents set of actions that a team or user may perform on a resource or set of resources/
          )
        ).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  }, 15000);

  it('should display table columns headers', () => {
    const { getByRole } = render(
      <MemoryRouter>
        <PlatformRoles />
      </MemoryRouter>
    );

    expect(getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Description' })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Components' })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Resource type' })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Role creation' })).toBeInTheDocument();
  });

  it('should load and display all available roles', async () => {
    render(
      <MemoryRouter>
        <PlatformRoles />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(getDataRowCount()).toBe(ALL_ROLES.length);
      },
      { timeout: 10000 }
    );

    expectRolesVisible([
      'AWX Admin',
      'AWX Credential Admin',
      'EDA Project Admin',
      'Galaxy Admin',
      'Platform Auditor',
    ]);

    const awxRow = screen.getByRole('row', { name: /AWX Credential Admin/ });

    expect(within(awxRow).getByTestId('name-column-cell')).toHaveTextContent(
      'AWX Credential Admin'
    );
    expect(within(awxRow).getByTestId('description-column-cell')).toHaveTextContent(
      'Has all permissions to a single credential'
    );
    expect(within(awxRow).getByTestId('components-column-cell')).toHaveTextContent(
      'Automation Execution'
    );
    expect(within(awxRow).getByTestId('resource-type-column-cell')).toHaveTextContent('Credential');
    expect(within(awxRow).getByTestId('role-creation-column-cell')).toHaveTextContent('Default');
  }, 15000);

  it('filters by AWX component', async () => {
    const { user } = setupTest();

    await waitFor(
      () => {
        expect(getDataRowCount()).toBe(ALL_ROLES.length);
      },
      { timeout: 10000 }
    );

    await openComponentFilter(user);
    await chooseComponent(user, 'Automation Execution');
    await waitFor(
      () => {
        expect(currentApiUrl).toContain('permissions__content_type__service=awx');
        expect(getDataRowCount()).toBe(mockRoles.awx.length);
      },
      { timeout: 10000 }
    );
    expectRolesVisible(['AWX Admin', 'AWX Credential Admin']);
    expectRolesHidden(['EDA Project Admin', 'Galaxy Admin', 'Platform Auditor']);
  }, 15000);

  it('filters by EDA component', async () => {
    const { user } = setupTest();

    await waitFor(
      () => {
        expect(getDataRowCount()).toBe(ALL_ROLES.length);
      },
      { timeout: 10000 }
    );

    await openComponentFilter(user);
    await chooseComponent(user, 'Automation Decisions');
    await waitFor(
      () => {
        expect(currentApiUrl).toContain('permissions__content_type__service=eda');
        expect(getDataRowCount()).toBe(mockRoles.eda.length);
      },
      { timeout: 10000 }
    );
    expectRolesVisible(['EDA Project Admin']);
    expectRolesHidden(['AWX Admin', 'AWX Credential Admin', 'Galaxy Admin', 'Platform Auditor']);
  }, 15000);

  it('filters by Galaxy component', async () => {
    const { user } = setupTest();

    await waitFor(
      () => {
        expect(getDataRowCount()).toBe(ALL_ROLES.length);
      },
      { timeout: 10000 }
    );

    await openComponentFilter(user);
    await chooseComponent(user, 'Automation Content');
    await waitFor(
      () => {
        expect(currentApiUrl).toContain('permissions__content_type__service=galaxy');
        expect(getDataRowCount()).toBe(mockRoles.galaxy.length);
      },
      { timeout: 10000 }
    );
    expectRolesVisible(['Galaxy Admin']);
    expectRolesHidden([
      'EDA Project Admin',
      'AWX Admin',
      'AWX Credential Admin',
      'Platform Auditor',
    ]);
  }, 15000);

  it('filters by Shared component', async () => {
    const { user } = setupTest();

    await waitFor(
      () => {
        expect(getDataRowCount()).toBe(ALL_ROLES.length);
      },
      { timeout: 10000 }
    );

    await openComponentFilter(user);
    await chooseComponent(user, 'Multiple Components');
    await waitFor(
      () => {
        expect(currentApiUrl).toContain('permissions__content_type__service=shared');
        expect(getDataRowCount()).toBe(mockRoles.shared.length);
      },
      { timeout: 10000 }
    );
    expectRolesVisible(['Platform Auditor']);
    expectRolesHidden(['AWX Admin', 'AWX Credential Admin', 'EDA Project Admin', 'Galaxy Admin']);
  }, 15000);

  it('supports multi-component selection', async () => {
    const { user } = setupTest();

    await waitFor(
      () => {
        expect(getDataRowCount()).toBe(ALL_ROLES.length);
      },
      { timeout: 10000 }
    );

    await openComponentFilter(user);
    await chooseComponent(user, 'Multiple Components');
    await chooseComponent(user, 'Automation Execution');
    await waitFor(
      () => {
        expect(currentApiUrl).toContain(
          'or__permissions__content_type__service=shared&or__permissions__content_type__service=awx'
        );
        expect(getDataRowCount()).toBe(mockRoles.awx.length + mockRoles.shared.length);
      },
      { timeout: 10000 }
    );
    expectRolesVisible(['Platform Auditor', 'AWX Admin', 'AWX Credential Admin']);
    expectRolesHidden(['EDA Project Admin', 'Galaxy Admin']);
  }, 15000);

  it('should include key property in resource type filter options to handle duplicate labels', () => {
    // This test verifies the fix where selecting "Credential" from AWX
    // was incorrectly filtering by EDA Credential due to duplicate label matching
    const mockResourceTypes = [
      { name: 'credential', value: 'awx.credential', service: 'awx' },
      { name: 'edacredential', value: 'eda.edacredential', service: 'eda' },
    ];

    const { result } = renderHook(() => usePlatformRolesFilters(mockResourceTypes));
    const filters = result.current;

    // Find the resource type filter
    const resourceTypeFilter = filters.find((f) => f.key === 'resource_type');
    expect(resourceTypeFilter).toBeDefined();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    const options = (resourceTypeFilter as any)?.options as Array<{
      key: string;
      value: string;
      label: string;
    }>;

    // Both credentials should have the same label "Credential" but different keys
    const awxCredOption = options?.find((o) => o.value === 'awx.credential');
    const edaCredOption = options?.find((o) => o.value === 'eda.edacredential');

    expect(awxCredOption).toBeDefined();
    expect(edaCredOption).toBeDefined();
    expect(awxCredOption?.label).toBe('Credential');
    expect(edaCredOption?.label).toBe('Credential');

    // The fix: both options must have unique 'key' properties
    // to prevent the MultiSelect component from incorrectly matching by label
    expect(awxCredOption?.key).toBe('awx.credential');
    expect(edaCredOption?.key).toBe('eda.edacredential');
    expect(awxCredOption?.key).not.toBe(edaCredOption?.key);
  });

  it('should enable custom role row actions (edit/delete)', async () => {
    const { user } = setupTest();
    await waitForTableToLoad();
    const roleRow = screen.getByRole('row', { name: /Custom Role/ });

    // Custom role should be editable
    const editAction = within(roleRow).getByRole('link', { name: 'Edit role' });
    expect(editAction).toBeEnabled();

    const kebabButton = within(roleRow).getByRole('button', { name: 'kebab dropdown toggle' });
    await user.click(kebabButton);
    await waitFor(
      () => {
        expect(kebabButton).toHaveAttribute('aria-expanded', 'true');
      },
      { timeout: 10000 }
    );

    // Custom role should be deletable
    const deleteAction = await screen.findByRole(
      'menuitem',
      {
        name: 'Delete role',
      },
      { timeout: 10000 }
    );
    expect(deleteAction).toBeEnabled();
  }, 15000);

  it('should disable managed/built-in roles row actions (edit/delete)', async () => {
    const { user } = setupTest();
    await waitForTableToLoad();
    const roleRow = screen.getByRole('row', { name: /AWX Admin/ });

    // Managed role should not be editable
    const editAction = within(roleRow).getByRole('link', { name: 'Edit role' });
    expect(editAction).toBeInTheDocument();
    expect(editAction).toHaveAttribute('aria-disabled', 'true');

    const kebabButton = within(roleRow).getByRole('button', { name: 'kebab dropdown toggle' });
    await user.click(kebabButton);
    await waitFor(
      () => {
        expect(kebabButton).toHaveAttribute('aria-expanded', 'true');
      },
      { timeout: 10000 }
    );

    // Managed role should not be deletable
    const deleteOption = await screen.findByRole(
      'menuitem',
      {
        name: 'Delete role',
      },
      { timeout: 10000 }
    );
    await user.click(deleteOption);
    expect(deleteOption).toBeInTheDocument();
    expect(deleteOption).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('Built-in roles cannot be deleted.')).toBeInTheDocument();
  }, 15000);

  it('should disable bulk delete when no roles are selected', async () => {
    const { user } = setupTest();
    await waitForTableToLoad();
    await user.click(screen.getByRole('button', { name: 'toolbar actions' }));

    const bulkDeleteButton = await screen.findByRole('menuitem', {
      name: 'Delete selected roles',
    });
    await user.click(bulkDeleteButton);
    expect(bulkDeleteButton).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('Select at least one item from the list')).toBeInTheDocument();
  });

  it('should call bulk confirmation when clicking delete role', async () => {
    const { user } = setupTest();
    await waitForTableToLoad();
    const roleRow = screen.getByRole('row', { name: /Custom Role/ });
    const kebabButton = within(roleRow).getByRole('button', { name: 'kebab dropdown toggle' });

    await user.click(kebabButton);
    await waitFor(
      () => {
        expect(kebabButton).toHaveAttribute('aria-expanded', 'true');
      },
      { timeout: 10000 }
    );

    const deleteOption = await screen.findByText('Delete role', {}, { timeout: 10000 });
    await user.click(deleteOption);

    await waitFor(
      () => {
        expect(mockBulkConfirmation).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Permanently delete roles',
            items: [{ id: 123, name: 'Custom Role', managed: false }],
          })
        );
      },
      { timeout: 10000 }
    );
  }, 15000);

  it('should render empty state when no roles are found', async () => {
    server.use(
      http.get('/api/gateway/v1/role_definitions/', () =>
        HttpResponse.json({ count: 0, results: [] })
      )
    );

    render(
      <MemoryRouter>
        <PlatformRoles />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No roles found')).toBeInTheDocument();
    });
  });

  it('should render error state when there is an error', async () => {
    server.use(http.get('/api/gateway/v1/role_definitions/', () => HttpResponse.error()));

    render(
      <MemoryRouter>
        <PlatformRoles />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading roles')).toBeInTheDocument();
    });
  });

  it('should pass correct item count to bulk delete confirmation', async () => {
    const { user } = setupTest();
    await waitForTableToLoad();

    const customRoleRow = screen.getByRole('row', { name: /Custom Role/ });
    await user.click(within(customRoleRow).getByRole('checkbox'));

    await user.click(screen.getByRole('button', { name: 'toolbar actions' }));
    const deleteButton = await screen.findByRole('menuitem', { name: 'Delete selected roles' });
    await user.click(deleteButton);

    await waitFor(
      () => {
        expect(mockBulkConfirmation).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Permanently delete roles',
            items: [expect.objectContaining({ name: 'Custom Role' })],
          })
        );
      },
      { timeout: 10000 }
    );
  }, 15000);
});

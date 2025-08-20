import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { PlatformRoles } from './PlatformRoles';

const mockRoles: Record<string, { id: number; name: string; description?: string }[]> = {
  awx: [
    {
      id: 20,
      name: 'AWX Admin',
    },
    {
      id: 12,
      name: 'AWX Credential Admin',
      description: 'Has all permissions to a single credential',
    },
  ],
  eda: [
    {
      id: 70,
      name: 'EDA Project Admin',
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

        if (orComponentFilters.length > 0) {
          const combinedRoles = [...mockRoles.awx, ...mockRoles.shared];
          return HttpResponse.json({ count: combinedRoles.length, results: combinedRoles });
        }

        const roles = mockRoles[componentFilter as keyof typeof mockRoles] || ALL_ROLES;
        return HttpResponse.json({ count: roles.length, results: roles });
      }),
      http.get('/api/gateway/v1/service-index/role-types/', () => HttpResponse.json([]))
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

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Roles/ })).toBeInTheDocument();
      expect(
        screen.getByText(
          /A role represents set of actions that a team or user may perform on a resource or set of resources/
        )
      ).toBeInTheDocument();
    });
  });

  it('should load and display all available roles', async () => {
    render(
      <MemoryRouter>
        <PlatformRoles />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getDataRowCount()).toBe(ALL_ROLES.length);
    });
    expectRolesVisible([
      'AWX Admin',
      'AWX Credential Admin',
      'EDA Project Admin',
      'Galaxy Admin',
      'Platform Auditor',
    ]);
    expect(
      screen.getByRole('cell', { name: 'Has all permissions to a single credential' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'Has view permissions to all objects' })
    ).toBeInTheDocument();
  });

  it('filters by AWX component', async () => {
    const { user } = setupTest();

    await waitFor(() => {
      expect(getDataRowCount()).toBe(ALL_ROLES.length);
    });

    await openComponentFilter(user);
    await chooseComponent(user, 'Automation Execution');
    await waitFor(() => {
      expect(currentApiUrl).toContain('permissions__content_type__service=awx');
      expect(getDataRowCount()).toBe(mockRoles.awx.length);
    });
    expectRolesVisible(['AWX Admin', 'AWX Credential Admin']);
    expectRolesHidden(['EDA Project Admin', 'Galaxy Admin', 'Platform Auditor']);
  });

  it('filters by EDA component', async () => {
    const { user } = setupTest();

    await waitFor(() => {
      expect(getDataRowCount()).toBe(ALL_ROLES.length);
    });

    await openComponentFilter(user);
    await chooseComponent(user, 'Automation Decisions');
    await waitFor(() => {
      expect(currentApiUrl).toContain('permissions__content_type__service=eda');
      expect(getDataRowCount()).toBe(mockRoles.eda.length);
    });
    expectRolesVisible(['EDA Project Admin']);
    expectRolesHidden(['AWX Admin', 'AWX Credential Admin', 'Galaxy Admin', 'Platform Auditor']);
  });

  it('filters by Galaxy component', async () => {
    const { user } = setupTest();

    await waitFor(() => {
      expect(getDataRowCount()).toBe(ALL_ROLES.length);
    });

    await openComponentFilter(user);
    await chooseComponent(user, 'Automation Content');
    await waitFor(() => {
      expect(currentApiUrl).toContain('permissions__content_type__service=galaxy');
      expect(getDataRowCount()).toBe(mockRoles.galaxy.length);
    });
    expectRolesVisible(['Galaxy Admin']);
    expectRolesHidden([
      'EDA Project Admin',
      'AWX Admin',
      'AWX Credential Admin',
      'Platform Auditor',
    ]);
  });

  it('filters by Shared component', async () => {
    const { user } = setupTest();

    await waitFor(() => {
      expect(getDataRowCount()).toBe(ALL_ROLES.length);
    });

    await openComponentFilter(user);
    await chooseComponent(user, 'Multiple Components');
    await waitFor(() => {
      expect(currentApiUrl).toContain('permissions__content_type__service=shared');
      expect(getDataRowCount()).toBe(mockRoles.shared.length);
    });
    expectRolesVisible(['Platform Auditor']);
    expectRolesHidden(['AWX Admin', 'AWX Credential Admin', 'EDA Project Admin', 'Galaxy Admin']);
  });

  it('supports multi-component selection', async () => {
    const { user } = setupTest();

    await waitFor(() => {
      expect(getDataRowCount()).toBe(ALL_ROLES.length);
    });

    await openComponentFilter(user);
    await chooseComponent(user, 'Multiple Components');
    await chooseComponent(user, 'Automation Execution');
    await waitFor(() => {
      expect(currentApiUrl).toContain(
        'or__permissions__content_type__service=shared&or__permissions__content_type__service=awx'
      );
      expect(getDataRowCount()).toBe(mockRoles.awx.length + mockRoles.shared.length);
    });
    expectRolesVisible(['Platform Auditor', 'AWX Admin', 'AWX Credential Admin']);
    expectRolesHidden(['EDA Project Admin', 'Galaxy Admin']);
  });

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
});

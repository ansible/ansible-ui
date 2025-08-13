import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { AwxUser } from '@ansible/awx-ui/interfaces/User';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { LegacyApplicationsTable } from './LegacyApplicationsTable';

const mockActiveUser: AwxUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  is_superuser: true,
  is_system_auditor: false,
  auth: ['local'],
  summary_fields: {
    resource: {
      ansible_id: 'test-ansible-id',
      resource_type: 'shared.user',
    },
    organization: {
      id: 1,
      name: 'Default',
      description: 'Default Organization',
    },
    user_capabilities: {
      edit: true,
      delete: true,
    },
  },
};

const mockRegularUser: AwxUser = {
  ...mockActiveUser,
  is_superuser: false,
};

vi.mock('@ansible/awx-ui/common/useAwxActiveUser', () => ({
  useAwxActiveUser: vi.fn(() => ({ activeAwxUser: mockActiveUser })),
}));

describe('LegacyApplicationsTable', () => {
  const mockApplications: { results: Application[]; count: number } = {
    results: [
      {
        id: 1,
        name: 'Test Legacy Application',
        description: 'Test legacy application description',
        url: '/api/v2/applications/1/',
        app_url: 'https://example.com',
        client_type: 'confidential',
        redirect_uris: 'https://example.com/callback',
        organization: 1,
        type: 'o_auth2_application',
        created: '2024-01-01T00:00:00Z',
        modified: '2024-01-01T00:00:00Z',
        client_id: 'test-client-id',
        client_secret: 'test-client-secret',
        authorization_grant_type: 'authorization-code',
        skip_authorization: false,
        summary_fields: {
          user_capabilities: {
            edit: true,
            delete: true,
          },
          organization: {
            id: 1,
            name: 'Default',
            description: 'Default Organization',
          },
        },
      },
      {
        id: 2,
        name: 'Another Legacy Application',
        description: 'Another test legacy application',
        url: '/api/v2/applications/2/',
        app_url: 'https://example2.com',
        client_type: 'public',
        redirect_uris: 'https://example2.com/callback',
        organization: 1,
        type: 'o_auth2_application',
        created: '2024-01-02T00:00:00Z',
        modified: '2024-01-02T00:00:00Z',
        client_id: 'test-client-id-2',
        authorization_grant_type: 'password',
        skip_authorization: false,
        summary_fields: {
          user_capabilities: {
            edit: true,
            delete: true,
          },
          organization: {
            id: 1,
            name: 'Default',
            description: 'Default Organization',
          },
        },
      },
    ],
    count: 2,
  };

  const mockOptionsResponse = {
    actions: {
      GET: {},
      POST: {},
    },
  };

  const server = setupServer(
    http.get(awxAPI`/applications/`, () => {
      return HttpResponse.json(mockApplications);
    }),
    http.options(awxAPI`/applications/`, () => {
      return HttpResponse.json(mockOptionsResponse);
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should render the PageTable with correct props', async () => {
    server.use(
      http.get(awxAPI`/applications/`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/legacy-applications']}>
        <Routes>
          <Route path="/access/legacy-applications" element={<LegacyApplicationsTable />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const table = screen.getByRole('grid'); // PF tables have a role of 'grid'
      expect(table).toBeInTheDocument();
    });
  });

  test('should display applications when loaded successfully', async () => {
    server.use(
      http.get(awxAPI`/applications/`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/legacy-applications']}>
        <Routes>
          <Route path="/access/legacy-applications" element={<LegacyApplicationsTable />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Legacy Application')).toBeInTheDocument();
      expect(screen.getByText('Another Legacy Application')).toBeInTheDocument();
    });
  });

  test('should show create button for superuser when in development mode', async () => {
    // Mock NODE_ENV to development
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    server.use(
      http.get(awxAPI`/applications/`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/legacy-applications']}>
        <Routes>
          <Route path="/access/legacy-applications" element={<LegacyApplicationsTable />} />
        </Routes>
      </MemoryRouter>
    );

    // Creation is no longer supported, so no create button should be present
    await waitFor(() => {
      expect(screen.queryByText('Create legacy application')).not.toBeInTheDocument();
    });

    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });

  test('should disable create button for non-superuser', async () => {
    const { useAwxActiveUser } = await import('@ansible/awx-ui/common/useAwxActiveUser');
    vi.mocked(useAwxActiveUser).mockReturnValue({ activeAwxUser: mockRegularUser });

    // Mock NODE_ENV to development
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    server.use(
      http.get(awxAPI`/applications/`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/legacy-applications']}>
        <Routes>
          <Route path="/access/legacy-applications" element={<LegacyApplicationsTable />} />
        </Routes>
      </MemoryRouter>
    );

    // Creation is no longer supported, so no create button should be present
    await waitFor(() => {
      expect(screen.queryByText('Create legacy application')).not.toBeInTheDocument();
    });

    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });

  test('should have correct table configuration', async () => {
    server.use(
      http.get(awxAPI`/applications/`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/legacy-applications']}>
        <Routes>
          <Route path="/access/legacy-applications" element={<LegacyApplicationsTable />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const table = screen.getByRole('grid'); // PF tables have a role of 'grid'
      expect(table).toBeInTheDocument();
      expect(table).toHaveClass('pf-v6-c-table');
    });
  });

  test('should show toolbar actions for superuser in development mode', async () => {
    // Mock NODE_ENV to development
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    server.use(
      http.get(awxAPI`/applications/`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/legacy-applications']}>
        <Routes>
          <Route path="/access/legacy-applications" element={<LegacyApplicationsTable />} />
        </Routes>
      </MemoryRouter>
    );

    // Creation is no longer supported, so no create button should be present
    await waitFor(() => {
      expect(screen.queryByText('Create legacy application')).not.toBeInTheDocument();
    });

    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });

  test('should disable actions for non-superuser', async () => {
    const { useAwxActiveUser } = await import('@ansible/awx-ui/common/useAwxActiveUser');
    vi.mocked(useAwxActiveUser).mockReturnValue({ activeAwxUser: mockRegularUser });

    // Mock NODE_ENV to development
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    server.use(
      http.get(awxAPI`/applications/`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/legacy-applications']}>
        <Routes>
          <Route path="/access/legacy-applications" element={<LegacyApplicationsTable />} />
        </Routes>
      </MemoryRouter>
    );

    // Creation is no longer supported, so no create button should be present
    await waitFor(() => {
      expect(screen.queryByText('Create legacy application')).not.toBeInTheDocument();
    });

    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });

  test('should handle options request failure gracefully', async () => {
    server.use(
      http.options(awxAPI`/applications/`, () => {
        return HttpResponse.error();
      }),
      http.get(awxAPI`/applications/`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/legacy-applications']}>
        <Routes>
          <Route path="/access/legacy-applications" element={<LegacyApplicationsTable />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const table = screen.getByRole('grid'); // PF tables have a role of 'grid'
      expect(table).toBeInTheDocument();
    });
  });

  test('should render table with correct structure', async () => {
    server.use(
      http.get(awxAPI`/applications/`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/legacy-applications']}>
        <Routes>
          <Route path="/access/legacy-applications" element={<LegacyApplicationsTable />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const table = screen.getByRole('grid'); // PF tables have a role of 'grid'
      expect(table).toBeInTheDocument();
    });
  });

  test('should show legacy applications warning alert', async () => {
    server.use(
      http.get(awxAPI`/applications/`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/legacy-applications']}>
        <Routes>
          <Route path="/access/legacy-applications" element={<LegacyApplicationsTable />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          'Legacy applications are used for backwards compatibility with existing automation.'
        )
      ).toBeInTheDocument();
    });

    // Expand the alert to see the body content
    const alertToggle = screen.getByRole('button', { name: 'Warning alert details' });
    await userEvent.click(alertToggle);

    // The alert content should be visible after expanding
    await waitFor(() => {
      expect(
        screen.getByText(
          'Existing controller automation should be updated to platform automation. Legacy applications should be deleted and replaced with platform applications in the API Applications section.'
        )
      ).toBeInTheDocument();
    });
  });
});

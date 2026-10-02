import { Application } from '@ansible/awx-ui/interfaces/Application';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { resetTestSwrCache, SwrTestWrapper } from '../../../framework/test-utils/swrTestWrapper';
import { PlatformUser } from '../../interfaces/PlatformUser';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import { OAuthApplicationsTable } from './OAuthApplicationsTable';

const mockActiveUser: PlatformUser = {
  id: 1,
  url: '/api/gateway/v1/users/1/',
  created: '2024-01-01T00:00:00Z',
  created_by: 'admin',
  modified: '2024-01-01T00:00:00Z',
  modified_by: 'admin',
  related: {},
  username: 'testuser',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  is_superuser: true,
  is_platform_auditor: false,
  last_login_map_results: [],
  last_login: '2024-01-01T00:00:00Z',
  managed: false,
  summary_fields: {
    modified_by: {
      id: 1,
      username: 'admin',
      first_name: 'Admin',
      last_name: 'User',
    },
    created_by: {
      id: 1,
      username: 'admin',
      first_name: 'Admin',
      last_name: 'User',
    },
    resource: {
      ansible_id: 'test-ansible-id',
      resource_type: 'shared.user',
    },
  },
};

const mockRegularUser: PlatformUser = {
  ...mockActiveUser,
  is_superuser: false,
};

vi.mock('../../main/PlatformActiveUserProvider', () => ({
  usePlatformActiveUser: vi.fn(() => ({ activePlatformUser: mockActiveUser })),
}));

describe('OAuthApplicationsTable', () => {
  const mockApplications: { results: Application[]; count: number } = {
    results: [
      {
        id: 1,
        name: 'Test OAuth Application',
        description: 'Test OAuth application description',
        url: '/api/gateway/v1/applications/1/',
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
        pkce_required: true,
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
        name: 'Another OAuth Application',
        description: 'Another test OAuth application',
        url: '/api/gateway/v1/applications/2/',
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
        pkce_required: true,
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
    http.get(gatewayAPI`/applications/`, () => {
      return HttpResponse.json(mockApplications);
    }),
    http.options(gatewayAPI`/applications/`, () => {
      return HttpResponse.json(mockOptionsResponse);
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());

  beforeEach(() => {
    server.resetHandlers();
    resetTestSwrCache();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function renderTable() {
    return render(
      <SwrTestWrapper>
        <MemoryRouter initialEntries={['/access/oauth-applications']}>
          <Routes>
            <Route path="/access/oauth-applications" element={<OAuthApplicationsTable />} />
          </Routes>
        </MemoryRouter>
      </SwrTestWrapper>
    );
  }

  test('should render the PageTable with correct props', async () => {
    server.use(
      http.get(gatewayAPI`/applications/`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    renderTable();

    await waitFor(() => {
      const table = screen.getByRole('grid');
      expect(table).toBeInTheDocument();
    });
  });

  test('should display applications when loaded successfully', async () => {
    server.use(
      http.get(gatewayAPI`/applications/`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    renderTable();

    await waitFor(() => {
      expect(screen.getByText('Test OAuth Application')).toBeInTheDocument();
      expect(screen.getByText('Another OAuth Application')).toBeInTheDocument();
    });
  });

  test('should display empty state when no applications exist', async () => {
    server.use(
      http.get(gatewayAPI`/applications/`, () => {
        return HttpResponse.json({ results: [], count: 0 });
      })
    );

    renderTable();

    await waitFor(() => {
      expect(screen.getByText('No OAuth applications found')).toBeInTheDocument();
    });
  });

  test('should display error state when API call fails', async () => {
    server.use(
      http.get(gatewayAPI`/applications/`, () => {
        return HttpResponse.error();
      })
    );

    renderTable();

    await waitFor(() => {
      expect(screen.getByText('Error loading OAuth applications')).toBeInTheDocument();
    });
  });

  test('should show create button for superuser when creation is allowed', async () => {
    server.use(
      http.get(gatewayAPI`/applications/`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    renderTable();

    await waitFor(() => {
      expect(screen.getByText('Create OAuth application')).toBeInTheDocument();
    });
  });

  test('should disable create button for non-superuser', async () => {
    const { usePlatformActiveUser } = await import('../../main/PlatformActiveUserProvider');
    vi.mocked(usePlatformActiveUser).mockReturnValue({ activePlatformUser: mockRegularUser });

    server.use(
      http.get(gatewayAPI`/applications/`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    renderTable();

    await waitFor(() => {
      const createButton = screen.getByRole('link', { name: 'Create OAuth application' });
      expect(createButton).toHaveAttribute('aria-disabled', 'true');
    });
  });

  test('should show different empty state for non-superuser', async () => {
    const { usePlatformActiveUser } = await import('../../main/PlatformActiveUserProvider');
    vi.mocked(usePlatformActiveUser).mockReturnValue({ activePlatformUser: mockRegularUser });

    server.use(
      http.get(gatewayAPI`/applications/`, () => {
        return HttpResponse.json({ results: [], count: 0 });
      })
    );

    renderTable();

    await waitFor(() => {
      expect(screen.getByText('No OAuth applications found')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Please contact your organization administrator if there is an issue with your access.'
        )
      ).toBeInTheDocument();
      expect(screen.queryByText('Create OAuth application')).not.toBeInTheDocument();
    });
  });

  test('should show loading state while options are loading', () => {
    server.use(
      http.options(gatewayAPI`/applications/`, async () => {
        await new Promise(() => {});
      })
    );

    renderTable();

    expect(document.querySelector('.pf-v6-c-skeleton')).toBeInTheDocument();
  });

  test('should have correct table configuration', async () => {
    server.use(
      http.get(gatewayAPI`/applications/`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    renderTable();

    await waitFor(() => {
      const table = screen.getByRole('grid');
      expect(table).toBeInTheDocument();
      expect(table).toHaveClass('pf-v6-c-table');
    });
  });

  test('should show toolbar actions for superuser', async () => {
    server.use(
      http.get(gatewayAPI`/applications/`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    renderTable();

    await waitFor(() => {
      expect(screen.getByText('Create OAuth application')).toBeInTheDocument();
    });
  });

  test('should disable actions for non-superuser', async () => {
    const { usePlatformActiveUser } = await import('../../main/PlatformActiveUserProvider');
    vi.mocked(usePlatformActiveUser).mockReturnValue({ activePlatformUser: mockRegularUser });

    server.use(
      http.get(gatewayAPI`/applications/`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    renderTable();

    await waitFor(() => {
      const createButton = screen.getByRole('link', { name: 'Create OAuth application' });
      expect(createButton).toHaveAttribute('aria-disabled', 'true');
    });
  });

  test('should handle options request failure gracefully', async () => {
    server.use(
      http.options(gatewayAPI`/applications/`, () => {
        return HttpResponse.error();
      }),
      http.get(gatewayAPI`/applications/`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    renderTable();

    await waitFor(() => {
      const table = screen.getByRole('grid');
      expect(table).toBeInTheDocument();
    });
  });

  test('should render table with correct structure', async () => {
    server.use(
      http.get(gatewayAPI`/applications/`, () => {
        return HttpResponse.json(mockApplications);
      })
    );

    renderTable();

    await waitFor(() => {
      const table = screen.getByRole('grid');
      expect(table).toBeInTheDocument();
    });
  });
});

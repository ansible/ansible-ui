import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { PlatformUser } from '../../interfaces/PlatformUser';
import { Token } from '../../interfaces/Token';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import { ApiTokenPage } from './ApiTokenPage';

// Mock the ApiTokenDetails component
vi.mock('./ApiTokenDetails', () => ({
  ApiTokenDetails: vi.fn(() => <div data-testid="api-token-details" />),
}));

// Mock hooks
vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () =>
      vi.fn(
        (route: string, params?: Record<string, unknown>) =>
          `/mock-url/${route}/${JSON.stringify(params)}`
      ),
  };
});

vi.mock('./hooks/useApiTokenRowActions', () => ({
  useApiTokenRowActions: vi.fn(() => [
    {
      type: 'Button',
      selection: 'single',
      variant: 'primary',
      isPinned: true,
      icon: 'Edit',
      label: 'Edit token',
      onClick: vi.fn(),
    },
    {
      type: 'Button',
      selection: 'single',
      variant: 'secondary',
      icon: 'Trash',
      label: 'Delete token',
      onClick: vi.fn(),
    },
  ]),
}));

describe('ApiTokenPage', () => {
  const mockToken: Token = {
    id: 1,
    type: 'o_auth2_access_token',
    url: '/api/v2/tokens/1/',
    token: 'test-token-1',
    description: 'Test token description',
    created: '2024-01-01T00:00:00Z',
    modified: '2024-01-01T00:00:00Z',
    user: 1,
    application: 1,
    scope: 'read',
    expires: '2024-12-31T00:00:00Z',
    last_used: null,
    summary_fields: {
      user: {
        id: 1,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
      },
      application: {
        id: 1,
        name: 'Test Application',
      },
    },
  };

  const mockUser: PlatformUser = {
    id: 1,
    url: '/api/v2/users/1/',
    created: '2024-01-01T00:00:00Z',
    created_by: 'admin',
    modified: '2024-01-01T00:00:00Z',
    modified_by: 'admin',
    related: {},
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
        resource_type: 'user',
      },
    },
    username: 'testuser',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    is_superuser: false,
    is_platform_auditor: false,
    last_login_map_results: [],
    last_login: '2024-01-01T00:00:00Z',
    managed: false,
  };

  const server = setupServer(
    http.get(gatewayAPI`/tokens/1/`, () => {
      return HttpResponse.json(mockToken);
    }),
    http.get(gatewayAPI`/users/1/`, () => {
      return HttpResponse.json(mockUser);
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('should render token page with title and details', async () => {
    render(
      <MemoryRouter initialEntries={['/access/api-tokens/1']}>
        <Routes>
          <Route path="/access/api-tokens/:tokenid" element={<ApiTokenPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test token description' })).toBeInTheDocument();
      expect(screen.getByTestId('api-token-details')).toBeInTheDocument();
    });
  });

  test('should render token page with application name when no description', async () => {
    const tokenWithoutDescription = {
      ...mockToken,
      id: 2,
      description: '',
    };

    server.use(
      http.get(gatewayAPI`/tokens/2/`, () => {
        return HttpResponse.json(tokenWithoutDescription);
      }),
      http.get(gatewayAPI`/users/1/`, () => {
        return HttpResponse.json(mockUser);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/api-tokens/2']}>
        <Routes>
          <Route path="/access/api-tokens/:tokenid" element={<ApiTokenPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Application' })).toBeInTheDocument();
    });
  });

  test('should render token page with personal access token fallback', async () => {
    const tokenWithoutDescOrApp = {
      ...mockToken,
      id: 3,
      description: '',
      summary_fields: {
        ...mockToken.summary_fields,
        application: {
          id: 1,
          name: '',
        },
      },
    };

    server.use(
      http.get(gatewayAPI`/tokens/3/`, () => {
        return HttpResponse.json(tokenWithoutDescOrApp);
      }),
      http.get(gatewayAPI`/users/1/`, () => {
        return HttpResponse.json(mockUser);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/api-tokens/3']}>
        <Routes>
          <Route path="/access/api-tokens/:tokenid" element={<ApiTokenPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Personal access token' })).toBeInTheDocument();
    });
  });

  test('should render with user-specific breadcrumbs', async () => {
    render(
      <MemoryRouter initialEntries={['/access/users/1/api-tokens/1']}>
        <Routes>
          <Route path="/access/users/:id/api-tokens/:tokenid" element={<ApiTokenPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test token description' })).toBeInTheDocument();
      expect(screen.getByTestId('api-token-details')).toBeInTheDocument();
    });
  });

  test('should render with global token breadcrumbs', async () => {
    render(
      <MemoryRouter initialEntries={['/access/api-tokens/1']}>
        <Routes>
          <Route path="/access/api-tokens/:tokenid" element={<ApiTokenPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test token description' })).toBeInTheDocument();
      expect(screen.getByTestId('api-token-details')).toBeInTheDocument();
    });
  });

  test('should show loading state when token is loading', () => {
    server.use(
      http.get(gatewayAPI`/tokens/999/`, () => {
        return new Promise(() => {}); // Never resolves
      }),
      http.get(gatewayAPI`/users/1/`, () => {
        return HttpResponse.json(mockUser);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/api-tokens/999']}>
        <Routes>
          <Route path="/access/api-tokens/:tokenid" element={<ApiTokenPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('should render page actions in header', async () => {
    render(
      <MemoryRouter initialEntries={['/access/api-tokens/1']}>
        <Routes>
          <Route path="/access/api-tokens/:tokenid" element={<ApiTokenPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test token description' })).toBeInTheDocument();
      // Actions are rendered by PageActions component
      expect(screen.getByTestId('api-token-details')).toBeInTheDocument();
    });
  });

  test('should handle missing user when user id is provided', async () => {
    server.use(
      http.get(gatewayAPI`/users/2/`, () => {
        return HttpResponse.json({ message: 'User not found' }, { status: 404 });
      }),
      http.get(gatewayAPI`/tokens/1/`, () => {
        return HttpResponse.json(mockToken);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/users/2/api-tokens/1']}>
        <Routes>
          <Route path="/access/users/:id/api-tokens/:tokenid" element={<ApiTokenPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test token description' })).toBeInTheDocument();
      expect(screen.getByTestId('api-token-details')).toBeInTheDocument();
    });
  });
});

import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { Token } from '@ansible/awx-ui/interfaces/Token';
import { AwxUser } from '@ansible/awx-ui/interfaces/User';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { LegacyTokenPage } from './LegacyTokenPage';

// Mock the LegacyTokenDetails component
vi.mock('./LegacyTokenDetails', () => ({
  LegacyTokenDetails: vi.fn(() => <div data-testid="legacy-token-details" />),
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

vi.mock('./hooks/useLegacyTokenRowActions', () => ({
  useLegacyTokenRowActions: vi.fn(() => [
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

describe('LegacyTokenPage', () => {
  const mockToken: Token = {
    id: 1,
    type: 'Access Token',
    url: '/api/v2/tokens/1/',
    token: 'legacy-token-1',
    description: 'Legacy test token description',
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
        name: 'Legacy Test Application',
      },
    },
  };

  const mockUser: AwxUser = {
    id: 1,
    url: '/api/v2/users/1/',
    created: '2024-01-01T00:00:00Z',
    modified: '2024-01-01T00:00:00Z',
    related: {},
    summary_fields: {
      resource: {
        ansible_id: 'test-ansible-id',
        resource_type: 'shared.user',
      },
      organization: {
        id: 1,
        name: 'Test Organization',
        description: 'Test Organization Description',
      },
      user_capabilities: {
        edit: true,
        delete: true,
      },
    },
    username: 'testuser',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    is_superuser: false,
    is_system_auditor: false,
    last_login: '2024-01-01T00:00:00Z',
    auth: ['test-auth'],
  };

  const server = setupServer(
    http.get(awxAPI`/tokens/1`, () => {
      return HttpResponse.json(mockToken);
    }),
    http.get(awxAPI`/users/1/`, () => {
      return HttpResponse.json(mockUser);
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('should render token page with title and details', async () => {
    render(
      <MemoryRouter initialEntries={['/access/legacy-tokens/1']}>
        <Routes>
          <Route path="/access/legacy-tokens/:tokenid" element={<LegacyTokenPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Legacy test token description' })
      ).toBeInTheDocument();
      expect(screen.getByTestId('legacy-token-details')).toBeInTheDocument();
    });
  });

  test('should render token page with application name when no description', async () => {
    const tokenWithoutDescription = {
      ...mockToken,
      id: 2,
      description: '',
    };

    server.use(
      http.get(awxAPI`/tokens/2`, () => {
        return HttpResponse.json(tokenWithoutDescription);
      }),
      http.get(awxAPI`/users/1/`, () => {
        return HttpResponse.json(mockUser);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/legacy-tokens/2']}>
        <Routes>
          <Route path="/access/legacy-tokens/:tokenid" element={<LegacyTokenPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Legacy Test Application' })).toBeInTheDocument();
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
      http.get(awxAPI`/tokens/3`, () => {
        return HttpResponse.json(tokenWithoutDescOrApp);
      }),
      http.get(awxAPI`/users/1/`, () => {
        return HttpResponse.json(mockUser);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/legacy-tokens/3']}>
        <Routes>
          <Route path="/access/legacy-tokens/:tokenid" element={<LegacyTokenPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Personal access token' })).toBeInTheDocument();
    });
  });

  test('should render with user-specific breadcrumbs', async () => {
    render(
      <MemoryRouter initialEntries={['/access/users/1/legacy-tokens/1']}>
        <Routes>
          <Route path="/access/users/:id/legacy-tokens/:tokenid" element={<LegacyTokenPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Legacy test token description' })
      ).toBeInTheDocument();
      expect(screen.getByTestId('legacy-token-details')).toBeInTheDocument();
    });
  });

  test('should render with global token breadcrumbs', async () => {
    render(
      <MemoryRouter initialEntries={['/access/legacy-tokens/1']}>
        <Routes>
          <Route path="/access/legacy-tokens/:tokenid" element={<LegacyTokenPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Legacy test token description' })
      ).toBeInTheDocument();
      expect(screen.getByTestId('legacy-token-details')).toBeInTheDocument();
    });
  });

  test('should show loading state when token is loading', () => {
    server.use(
      http.get(awxAPI`/tokens/999`, () => {
        return new Promise(() => {}); // Never resolves
      }),
      http.get(awxAPI`/users/1/`, () => {
        return HttpResponse.json(mockUser);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/legacy-tokens/999']}>
        <Routes>
          <Route path="/access/legacy-tokens/:tokenid" element={<LegacyTokenPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('should render page actions in header', async () => {
    render(
      <MemoryRouter initialEntries={['/access/legacy-tokens/1']}>
        <Routes>
          <Route path="/access/legacy-tokens/:tokenid" element={<LegacyTokenPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Legacy test token description' })
      ).toBeInTheDocument();
      expect(screen.getByTestId('legacy-token-details')).toBeInTheDocument();
    });
  });

  test('should handle missing user when user id is provided', async () => {
    server.use(
      http.get(awxAPI`/users/2/`, () => {
        return HttpResponse.json({ message: 'User not found' }, { status: 404 });
      }),
      http.get(awxAPI`/tokens/1`, () => {
        return HttpResponse.json(mockToken);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/users/2/legacy-tokens/1']}>
        <Routes>
          <Route path="/access/users/:id/legacy-tokens/:tokenid" element={<LegacyTokenPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Legacy test token description' })
      ).toBeInTheDocument();
      expect(screen.getByTestId('legacy-token-details')).toBeInTheDocument();
    });
  });
});

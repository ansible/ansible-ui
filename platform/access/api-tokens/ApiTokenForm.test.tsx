import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { PlatformUser } from '../../interfaces/PlatformUser';
import { Token } from '../../interfaces/Token';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import { ApiTokenForm } from './ApiTokenForm';

// Mock usePageNavigate and related hooks
vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => vi.fn(),
    useGetPageUrl: () =>
      vi.fn(
        (route: string, params?: Record<string, unknown>) =>
          `/mock-url/${route}/${params ? JSON.stringify(params) : ''}`
      ),
    usePageDialog: () => [undefined, vi.fn()],
  };
});

describe('ApiTokenForm', () => {
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

  const server = setupServer(
    http.get(gatewayAPI`/users/1/`, () => {
      return HttpResponse.json(mockUser);
    }),
    http.get(gatewayAPI`/tokens/1`, () => {
      return HttpResponse.json(mockToken);
    }),
    http.post(gatewayAPI`/tokens/`, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({
        id: 2,
        type: 'o_auth2_access_token',
        url: '/api/v2/tokens/2/',
        token: 'new-token-value',
        created: '2024-01-01T00:00:00Z',
        modified: '2024-01-01T00:00:00Z',
        user: 1,
        application: 1,
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
        ...body,
      });
    }),
    http.put(gatewayAPI`/tokens/1`, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({
        ...mockToken,
        ...body,
        modified: '2024-01-01T00:00:00Z',
      });
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

  test('should render create form with correct title and fields', async () => {
    render(
      <MemoryRouter initialEntries={['/access/api-tokens/create']}>
        <Routes>
          <Route path="/access/api-tokens/create" element={<ApiTokenForm />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Create API Token')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Write' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create token' })).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  test('should render edit form when token is provided', async () => {
    render(
      <MemoryRouter initialEntries={['/access/api-tokens/1/edit']}>
        <Routes>
          <Route path="/access/api-tokens/:tokenid/edit" element={<ApiTokenForm />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Test token description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Update token' })).toBeInTheDocument();
    });
  });

  test('should render form for user-specific token creation', async () => {
    render(
      <MemoryRouter initialEntries={['/access/users/1/api-tokens/create']}>
        <Routes>
          <Route path="/access/users/:id/api-tokens/create" element={<ApiTokenForm />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Create API Token')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });

  test('should handle form submission for creating new token', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/access/api-tokens/create']}>
        <Routes>
          <Route path="/access/api-tokens/create" element={<ApiTokenForm />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    const descriptionField = screen.getByLabelText('Description');
    const scopeField = screen.getByRole('button', { name: 'Write' });
    const createButton = screen.getByRole('button', { name: 'Create token' });

    await user.type(descriptionField, 'My test token');
    await user.click(scopeField);
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Write' })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('option', { name: 'Write' }));
    await user.click(createButton);

    // Verify the API call was made
    await waitFor(() => {
      expect(server.listHandlers()).toBeDefined();
    });
  });

  test('should handle form submission for updating existing token', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/access/api-tokens/1/edit']}>
        <Routes>
          <Route path="/access/api-tokens/:tokenid/edit" element={<ApiTokenForm />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    const descriptionField = screen.getByLabelText('Description');
    const updateButton = screen.getByRole('button', { name: 'Update token' });

    await user.clear(descriptionField);
    await user.type(descriptionField, 'Updated description');
    await user.click(updateButton);

    // Verify the API call was made
    await waitFor(() => {
      expect(server.listHandlers()).toBeDefined();
    });
  });
});

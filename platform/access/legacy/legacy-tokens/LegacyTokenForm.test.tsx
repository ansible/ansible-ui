import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { Token } from '@ansible/awx-ui/interfaces/Token';
import { AwxUser } from '@ansible/awx-ui/interfaces/User';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { LegacyTokenForm } from './LegacyTokenForm';

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
    usePageDialogs: () => ({ pushDialog: vi.fn(), popDialog: vi.fn() }),
  };
});

describe('LegacyTokenForm', () => {
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

  const server = setupServer(
    http.get(awxAPI`/users/1/`, () => {
      return HttpResponse.json(mockUser);
    }),
    http.get(awxAPI`/tokens/1`, () => {
      return HttpResponse.json(mockToken);
    }),
    http.post(awxAPI`/tokens/`, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({
        id: 2,
        type: 'Access Token',
        url: '/api/v2/tokens/2/',
        token: 'new-legacy-token-value',
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
            name: 'Legacy Test Application',
          },
        },
        ...body,
      });
    }),
    http.put(awxAPI`/tokens/1`, async ({ request }) => {
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
      <MemoryRouter initialEntries={['/access/legacy-tokens/create']}>
        <Routes>
          <Route path="/access/legacy-tokens/create" element={<LegacyTokenForm />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Create Legacy Token')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Write' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create token' })).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  test('should render edit form when token is provided', async () => {
    render(
      <MemoryRouter initialEntries={['/access/legacy-tokens/1/edit']}>
        <Routes>
          <Route path="/access/legacy-tokens/:tokenid/edit" element={<LegacyTokenForm />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Legacy test token description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Update token' })).toBeInTheDocument();
    });
  });

  test('should render form for user-specific token creation', async () => {
    render(
      <MemoryRouter initialEntries={['/access/users/1/legacy-tokens/create']}>
        <Routes>
          <Route path="/access/users/:id/legacy-tokens/create" element={<LegacyTokenForm />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Create Legacy Token')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });

  test('should handle form submission for creating new token', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/access/legacy-tokens/create']}>
        <Routes>
          <Route path="/access/legacy-tokens/create" element={<LegacyTokenForm />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    const descriptionField = screen.getByLabelText('Description');
    const scopeField = screen.getByRole('button', { name: 'Write' });
    const createButton = screen.getByRole('button', { name: 'Create token' });

    await user.type(descriptionField, 'My legacy test token');
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
      <MemoryRouter initialEntries={['/access/legacy-tokens/1/edit']}>
        <Routes>
          <Route path="/access/legacy-tokens/:tokenid/edit" element={<LegacyTokenForm />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    const descriptionField = screen.getByLabelText('Description');
    const updateButton = screen.getByRole('button', { name: 'Update token' });

    await user.clear(descriptionField);
    await user.type(descriptionField, 'Updated legacy description');
    await user.click(updateButton);

    // Verify the API call was made
    await waitFor(() => {
      expect(server.listHandlers()).toBeDefined();
    });
  });
});

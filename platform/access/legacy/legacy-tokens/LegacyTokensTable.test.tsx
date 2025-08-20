import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { Token } from '@ansible/awx-ui/interfaces/Token';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { LegacyTokensTable } from './LegacyTokensTable';

const mockActiveUser = {
  id: 1,
  username: 'testuser',
  first_name: 'Test',
  last_name: 'User',
  is_superuser: false,
  is_system_auditor: false,
  summary_fields: {
    resource: {
      ansible_id: 'test-ansible-id',
      resource_type: 'shared.user' as const,
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
  auth: ['test-auth'],
};

const mockSuperUser = {
  ...mockActiveUser,
  is_superuser: true,
};

const mockAuditorUser = {
  ...mockActiveUser,
  is_system_auditor: true,
};

vi.mock('@ansible/awx-ui/common/useAwxActiveUser', () => ({
  useAwxActiveUser: vi.fn(() => ({ activeAwxUser: mockActiveUser })),
}));

describe('LegacyTokensTable', () => {
  const mockTokens: { results: Token[]; count: number } = {
    results: [
      {
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
      },
      {
        id: 2,
        type: 'Access Token',
        url: '/api/v2/tokens/2/',
        token: 'legacy-token-2',
        description: 'Another legacy test token',
        created: '2024-01-02T00:00:00Z',
        modified: '2024-01-02T00:00:00Z',
        user: 1,
        application: 2,
        scope: 'write',
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
            id: 2,
            name: 'Legacy Test Application 2',
          },
        },
      },
    ],
    count: 2,
  };

  const server = setupServer(
    http.get(awxAPI`/tokens/`, () => {
      return HttpResponse.json(mockTokens);
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
      http.get(awxAPI`/tokens/`, () => {
        return HttpResponse.json(mockTokens);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/legacy-tokens']}>
        <Routes>
          <Route path="/access/legacy-tokens" element={<LegacyTokensTable />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const table = screen.getByRole('grid'); // PF tables have a role of 'grid'
      expect(table).toBeInTheDocument();
    });
  });

  test('should render warning alert about legacy tokens', async () => {
    server.use(
      http.get(awxAPI`/tokens/`, () => {
        return HttpResponse.json(mockTokens);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/legacy-tokens']}>
        <Routes>
          <Route path="/access/legacy-tokens" element={<LegacyTokensTable />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          'Legacy tokens are used for backwards compatibility with existing automation.'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          name: /Warning alert: Legacy tokens are used for backwards compatibility with existing automation/,
        })
      ).toBeInTheDocument();
    });
  });

  test('should render with user-specific tokens when id param is provided', async () => {
    server.use(
      http.get(awxAPI`/tokens/`, () => {
        return HttpResponse.json(mockTokens);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/users/1/legacy-tokens']}>
        <Routes>
          <Route path="/access/users/:id/legacy-tokens" element={<LegacyTokensTable />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const table = screen.getByRole('grid'); // PF tables have a role of 'grid'
      expect(table).toBeInTheDocument();
      expect(
        screen.getByText(
          'Legacy tokens are used for backwards compatibility with existing automation.'
        )
      ).toBeInTheDocument();
    });
  });

  test('should render with application-specific tokens when applicationId param is provided', async () => {
    server.use(
      http.get(awxAPI`/tokens/`, () => {
        return HttpResponse.json(mockTokens);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/applications/1/legacy-tokens']}>
        <Routes>
          <Route
            path="/access/applications/:applicationId/legacy-tokens"
            element={<LegacyTokensTable />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const table = screen.getByRole('grid'); // PF tables have a role of 'grid'
      expect(table).toBeInTheDocument();
      expect(
        screen.getByText(
          'Legacy tokens are used for backwards compatibility with existing automation.'
        )
      ).toBeInTheDocument();
    });
  });

  test('should display empty state when no tokens exist', async () => {
    server.use(
      http.get(awxAPI`/tokens/`, () => {
        return HttpResponse.json({ results: [], count: 0 });
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/legacy-tokens']}>
        <Routes>
          <Route path="/access/legacy-tokens" element={<LegacyTokensTable />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const table = screen.getByRole('grid'); // PF tables have a role of 'grid'
      expect(table).toBeInTheDocument();
      expect(table.querySelectorAll('tbody tr[data-row-index]')).toHaveLength(0);
    });
  });

  test('should display error state when API call fails', async () => {
    server.use(
      http.get(awxAPI`/tokens/`, () => {
        return HttpResponse.error();
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/legacy-tokens']}>
        <Routes>
          <Route path="/access/legacy-tokens" element={<LegacyTokensTable />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading legacy tokens')).toBeInTheDocument();
    });
  });

  test('should have correct table configuration', async () => {
    server.use(
      http.get(awxAPI`/tokens/`, () => {
        return HttpResponse.json(mockTokens);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/legacy-tokens']}>
        <Routes>
          <Route path="/access/legacy-tokens" element={<LegacyTokensTable />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const table = screen.getByRole('grid'); // PF tables have a role of 'grid'
      expect(table).toBeInTheDocument();
      expect(table).toHaveClass('pf-v6-c-table');
    });
  });

  test('should restrict tokens to current user for regular users', async () => {
    const { useAwxActiveUser } = await import('@ansible/awx-ui/common/useAwxActiveUser');
    vi.mocked(useAwxActiveUser).mockReturnValue({ activeAwxUser: mockActiveUser });

    server.use(
      http.get(awxAPI`/tokens/`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('user')).toBe('1');
        return HttpResponse.json(mockTokens);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/legacy-tokens']}>
        <Routes>
          <Route path="/access/legacy-tokens" element={<LegacyTokensTable />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const table = screen.getByRole('grid'); // PF tables have a role of 'grid'
      expect(table).toBeInTheDocument();
    });
  });

  test('should allow all tokens for superuser', async () => {
    const { useAwxActiveUser } = await import('@ansible/awx-ui/common/useAwxActiveUser');
    vi.mocked(useAwxActiveUser).mockReturnValue({ activeAwxUser: mockSuperUser });

    server.use(
      http.get(awxAPI`/tokens/`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('user')).toBeNull();
        return HttpResponse.json(mockTokens);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/legacy-tokens']}>
        <Routes>
          <Route path="/access/legacy-tokens" element={<LegacyTokensTable />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const table = screen.getByRole('grid'); // PF tables have a role of 'grid'
      expect(table).toBeInTheDocument();
    });
  });

  test('should allow all tokens for system auditor', async () => {
    const { useAwxActiveUser } = await import('@ansible/awx-ui/common/useAwxActiveUser');
    vi.mocked(useAwxActiveUser).mockReturnValue({ activeAwxUser: mockAuditorUser });

    server.use(
      http.get(awxAPI`/tokens/`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('user')).toBeNull();
        return HttpResponse.json(mockTokens);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/legacy-tokens']}>
        <Routes>
          <Route path="/access/legacy-tokens" element={<LegacyTokensTable />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const table = screen.getByRole('grid'); // PF tables have a role of 'grid'
      expect(table).toBeInTheDocument();
    });
  });

  test('should filter by user when id param is provided', async () => {
    server.use(
      http.get(awxAPI`/tokens/`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('user')).toBe('2');
        return HttpResponse.json(mockTokens);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/users/2/legacy-tokens']}>
        <Routes>
          <Route path="/access/users/:id/legacy-tokens" element={<LegacyTokensTable />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const table = screen.getByRole('grid'); // PF tables have a role of 'grid'
      expect(table).toBeInTheDocument();
    });
  });

  test('should filter by application when applicationId param is provided', async () => {
    server.use(
      http.get(awxAPI`/tokens/`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('application')).toBe('3');
        return HttpResponse.json(mockTokens);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/applications/3/legacy-tokens']}>
        <Routes>
          <Route
            path="/access/applications/:applicationId/legacy-tokens"
            element={<LegacyTokensTable />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const table = screen.getByRole('grid'); // PF tables have a role of 'grid'
      expect(table).toBeInTheDocument();
    });
  });
});

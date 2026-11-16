import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Token } from '../../interfaces/Token';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import { ApiTokensTable } from './ApiTokensTable';

const mockUsePlatformActiveUser = vi.hoisted(() =>
  vi.fn(() => ({
    activePlatformUser: {
      id: 1,
      is_superuser: true,
      is_platform_auditor: false,
    },
  }))
);

vi.mock('../../main/PlatformActiveUserProvider', () => ({
  usePlatformActiveUser: () => mockUsePlatformActiveUser(),
}));

describe('ApiTokensTable', () => {
  const mockTokens: { results: Token[]; count: number } = {
    results: [
      {
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
      },
      {
        id: 2,
        type: 'o_auth2_access_token',
        url: '/api/v2/tokens/2/',
        token: 'test-token-2',
        description: 'Another test token',
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
            name: 'Test Application 2',
          },
        },
      },
    ],
    count: 2,
  };

  const server = setupServer(
    http.get(gatewayAPI`/tokens/`, () => {
      return HttpResponse.json(mockTokens);
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());

  beforeEach(() => {
    server.resetHandlers();
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: {
        id: 1,
        is_superuser: true,
        is_platform_auditor: false,
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the PageTable with correct props', async () => {
    render(
      <MemoryRouter initialEntries={['/access/api-tokens']}>
        <Routes>
          <Route path="/access/api-tokens" element={<ApiTokensTable />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the table to render (either with data or empty state)
    await waitFor(() => {
      const table = screen.getByRole('grid'); // PF tables have a role of 'grid'
      expect(table).toBeInTheDocument();
    });
  });

  it('should render with user-specific tokens when id param is provided', async () => {
    render(
      <MemoryRouter initialEntries={['/access/users/1/api-tokens']}>
        <Routes>
          <Route path="/access/users/:id/api-tokens" element={<ApiTokensTable />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the table to render (either with data or empty state)
    await waitFor(() => {
      const table = screen.getByRole('grid'); // PF tables have a role of 'grid'
      expect(table).toBeInTheDocument();
    });
  });

  it('should display empty state when no tokens exist', async () => {
    server.use(
      http.get(gatewayAPI`/tokens/`, () => {
        return HttpResponse.json({ results: [], count: 0 });
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/api-tokens']}>
        <Routes>
          <Route path="/access/api-tokens" element={<ApiTokensTable />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      // In empty state, should show the empty state message
      expect(screen.getByText('There are currently no API tokens.')).toBeInTheDocument();

      // The table should not be present in empty state
      expect(screen.queryByRole('grid')).not.toBeInTheDocument(); // PF tables have a role of 'grid'
    });
  });

  it('should display error state when API call fails', async () => {
    server.use(
      http.get(gatewayAPI`/tokens/`, () => {
        return HttpResponse.error();
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/api-tokens']}>
        <Routes>
          <Route path="/access/api-tokens" element={<ApiTokensTable />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      // In error state, we should see the error message text
      expect(screen.getByText('Error loading API tokens')).toBeInTheDocument();

      // The error state should display an empty state with retry button
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });
  });

  it('should have correct table configuration', async () => {
    render(
      <MemoryRouter initialEntries={['/access/api-tokens']}>
        <Routes>
          <Route path="/access/api-tokens" element={<ApiTokensTable />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the component to load and render
    await waitFor(() => {
      const table = screen.getByRole('grid'); // PF tables have a role of 'grid'
      expect(table).toBeInTheDocument();
      expect(table).toHaveClass('pf-v6-c-table');
    });
  });

  it('should render token rows after data loads', async () => {
    render(
      <MemoryRouter initialEntries={['/access/api-tokens']}>
        <Routes>
          <Route path="/access/api-tokens" element={<ApiTokensTable />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test token description')).toBeInTheDocument();
      expect(screen.getByText('Another test token')).toBeInTheDocument();
    });
  });

  it('should filter by application when opened from application tokens tab', async () => {
    let capturedUrl = '';
    server.use(
      http.get(gatewayAPI`/tokens/`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(mockTokens);
      })
    );

    render(
      <MemoryRouter initialEntries={['/access/applications/3/tokens']}>
        <Routes>
          <Route path="/access/applications/:applicationId/tokens" element={<ApiTokensTable />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument();
      expect(new URL(capturedUrl).searchParams.get('application')).toBe('3');
    });
  });

  it.each([
    ['superuser', { id: 99, is_superuser: true, is_platform_auditor: false }, null],
    ['platform auditor', { id: 99, is_superuser: false, is_platform_auditor: true }, null],
    ['regular user', { id: 42, is_superuser: false, is_platform_auditor: false }, '42'],
  ] as const)(
    'should scope global token list for %s',
    async (_role, activeUser, expectedUserQuery) => {
      let capturedUrl = '';
      server.use(
        http.get(gatewayAPI`/tokens/`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json(mockTokens);
        })
      );
      mockUsePlatformActiveUser.mockReturnValue({ activePlatformUser: activeUser });

      render(
        <MemoryRouter initialEntries={['/access/api-tokens']}>
          <Routes>
            <Route path="/access/api-tokens" element={<ApiTokensTable />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
        expect(new URL(capturedUrl).searchParams.get('user')).toBe(expectedUserQuery);
      });
    }
  );
});

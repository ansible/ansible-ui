import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { PlatformRoute } from '../main/PlatformRoutes';
import { PlatformResource } from './PlatformResource';

// PlatformResource uses i18next's t() directly; vitest.setup only mocks react-i18next.
vi.mock('i18next', () => ({
  t: (key: string) => key,
}));

const mockGetPageUrl = vi.fn((route: PlatformRoute, options?: { params?: { id: number } }) => {
  if (route === PlatformRoute.UserDetails) {
    return `/access/users/${options?.params?.id}/details`;
  }
  if (route === PlatformRoute.OrganizationDetails) {
    return `/access/organizations/${options?.params?.id}/details`;
  }
  if (route === PlatformRoute.TeamDetails) {
    return `/access/teams/${options?.params?.id}/details`;
  }
  return '/fallback';
});

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => mockGetPageUrl,
  };
});

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function isGatewayUserLookup(request: Request) {
  const url = new URL(request.url);
  return (
    url.pathname.endsWith('/users/') &&
    url.searchParams.get('resource__ansible_id') === 'ansible-user-id'
  );
}

function wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter initialEntries={['/resources/shared.user/ansible-user-id']}>
      <Routes>
        <Route path="/resources/:resource_type/:ansible_id" element={children} />
        <Route path="/access/users/:id/details" element={<div>User details</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PlatformResource', () => {
  test('should show a loading state while the gateway lookup is pending', () => {
    server.use(
      http.get(
        ({ request }) => isGatewayUserLookup(request),
        () => new Promise(() => {})
      )
    );
    render(<PlatformResource />, { wrapper });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('should render the error state when the gateway lookup fails', async () => {
    server.use(
      http.get(
        ({ request }) => isGatewayUserLookup(request),
        () => HttpResponse.json({ detail: 'boom' }, { status: 500 })
      )
    );
    render(<PlatformResource />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  test('should render not found when the gateway returns no unique match', async () => {
    server.use(
      http.get(
        ({ request }) => isGatewayUserLookup(request),
        () => HttpResponse.json({ count: 0, results: [] })
      )
    );
    render(<PlatformResource />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Resource Not Found')).toBeInTheDocument();
    });
  });

  test('should navigate to the platform user details route for a shared user resource', async () => {
    server.use(
      http.get(
        ({ request }) => isGatewayUserLookup(request),
        () => HttpResponse.json({ count: 1, results: [{ id: 42 }] })
      )
    );
    render(<PlatformResource />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('User details')).toBeInTheDocument();
    });
    expect(mockGetPageUrl).toHaveBeenCalledWith(PlatformRoute.UserDetails, {
      params: { id: 42 },
    });
  });

  test('should navigate to the organization details route for a shared organization resource', async () => {
    server.use(
      http.get(
        ({ request }) => {
          const url = new URL(request.url);
          return (
            url.pathname.endsWith('/organizations/') &&
            url.searchParams.get('resource__ansible_id') === 'org-id'
          );
        },
        () => HttpResponse.json({ count: 1, results: [{ id: 9 }] })
      )
    );

    render(<PlatformResource />, {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={['/resources/shared.organization/org-id']}>
          <Routes>
            <Route path="/resources/:resource_type/:ansible_id" element={children} />
            <Route
              path="/access/organizations/:id/details"
              element={<div>Organization details</div>}
            />
          </Routes>
        </MemoryRouter>
      ),
    });

    await waitFor(() => {
      expect(screen.getByText('Organization details')).toBeInTheDocument();
    });
    expect(mockGetPageUrl).toHaveBeenCalledWith(PlatformRoute.OrganizationDetails, {
      params: { id: 9 },
    });
  });

  test('should render not found when multiple gateway matches are returned', async () => {
    server.use(
      http.get(
        ({ request }) => isGatewayUserLookup(request),
        () => HttpResponse.json({ count: 2, results: [{ id: 1 }, { id: 2 }] })
      )
    );
    render(<PlatformResource />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Resource Not Found')).toBeInTheDocument();
    });
  });

  test('should render not found for an unsupported resource type', async () => {
    render(<PlatformResource />, {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={['/resources/unknown.type/ansible-id']}>
          <Routes>
            <Route path="/resources/:resource_type/:ansible_id" element={children} />
          </Routes>
        </MemoryRouter>
      ),
    });

    await waitFor(() => {
      expect(screen.getByText('Resource Not Found')).toBeInTheDocument();
    });
  });
});

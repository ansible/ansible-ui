import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { EditPlatformUser } from './PlatformUserForm';

type UseGetPlatformUsersResult = {
  platformUser?: PlatformUser;
  isLoading: boolean;
  error?: Error;
};

const { mockUseGetPlatformUsers } = vi.hoisted(() => ({
  mockUseGetPlatformUsers: vi.fn<(userId: number) => UseGetPlatformUsersResult>(),
}));

vi.mock('../hooks/useGetPlatformUsers', () => ({
  useGetPlatformUsers: (userId: number): UseGetPlatformUsersResult =>
    mockUseGetPlatformUsers(userId),
}));

vi.mock('../hooks/useGetOrganizationsForUser', () => ({
  useGetOrganizationsForUser: () => ({
    orgIds: [],
    getAddedAndRemovedOrganizationIds: () => ({
      addedOrganizationIds: [],
      removedOrganizationIds: [],
    }),
  }),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    LoadingPage: () => <div data-testid="loading-page">loading</div>,
  };
});

const server = setupServer(
  http.options(gatewayAPI`/users/`, () =>
    HttpResponse.json({
      actions: {
        GET: true,
        PUT: true,
        PATCH: true,
      },
    })
  ),
  http.get(gatewayAPI`/role_definitions/`, ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get('name');
    if (name === 'Platform Auditor') {
      return HttpResponse.json({ count: 1, results: [{ id: 500 }] });
    }
    if (name === 'Organization Member') {
      return HttpResponse.json({ count: 1, results: [{ id: 600 }] });
    }
    return HttpResponse.json({ count: 0, results: [] });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('EditPlatformUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading while user or role definitions load', () => {
    mockUseGetPlatformUsers.mockReturnValue({
      platformUser: undefined,
      isLoading: true,
    });

    render(
      <MemoryRouter initialEntries={['/users/7/edit']}>
        <Routes>
          <Route path="/users/:id/edit" element={<EditPlatformUser />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('loading-page')).toBeInTheDocument();
  });

  it('renders edit form when user and dependencies are ready', async () => {
    mockUseGetPlatformUsers.mockReturnValue({
      platformUser: {
        id: 7,
        url: gatewayAPI`/users/7/`,
        username: 'edit-me',
        email: 'e@x.com',
        first_name: 'Ed',
        last_name: 'It',
        is_superuser: false,
        is_platform_auditor: false,
        created: '',
        created_by: '',
        modified: '',
        modified_by: '',
        related: {},
        summary_fields: {
          modified_by: { id: 1, username: 'm', first_name: '', last_name: '' },
          created_by: { id: 1, username: 'c', first_name: '', last_name: '' },
          resource: { ansible_id: 'x', resource_type: 'user' },
        },
        last_login_map_results: [],
        managed: false,
      },
      isLoading: false,
    });

    server.use(
      http.get(gatewayAPI`/users/7/organizations/`, () =>
        HttpResponse.json({ count: 0, results: [] })
      )
    );

    render(
      <MemoryRouter initialEntries={['/users/7/edit']}>
        <Routes>
          <Route path="/users/:id/edit" element={<EditPlatformUser />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /edit edit-me/i })).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/Username/i)).toHaveValue('edit-me');
  });

  it('renders PageNotFound when user is missing', async () => {
    mockUseGetPlatformUsers.mockReturnValue({
      platformUser: undefined,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={['/users/99/edit']}>
        <Routes>
          <Route path="/users/:id/edit" element={<EditPlatformUser />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/not found/i)).toBeInTheDocument();
    });
  });
});

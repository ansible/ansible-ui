/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RemoteManageUsers } from './RemoteManageUser';

vi.mock('@ansible/common-ui/access/components/ManageResourceRoles', () => ({
  ManageResourceRoles: () => <div data-testid="manage-resource-roles">Manage roles</div>,
}));

const mockRemote = {
  pulp_href: '/pulp/api/v3/remotes/ansible/collection/12345678-1234-1234-1234-123456789abc/',
  name: 'test-remote',
  url: 'https://galaxy.example.com',
};

const mockUseGet =
  vi.fn<
    (url?: string) => { data?: unknown; error?: Error; isLoading: boolean; refresh: () => void }
  >();
vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: (url?: string) => mockUseGet(url),
}));

describe('RemoteManageUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGet.mockImplementation((url?: string) => {
      if (url?.includes('/users/')) {
        return {
          data: {
            results: [{ id: 1, username: 'demo-user', first_name: 'Demo', last_name: 'User' }],
          },
          error: undefined,
          isLoading: false,
          refresh: vi.fn(),
        };
      }
      return {
        data: mockRemote,
        error: undefined,
        isLoading: false,
        refresh: vi.fn(),
      };
    });
  });

  it('renders manage roles page for remote user', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/remotes/test-remote/user-access/galaxy.collectionremote/12345678-1234-1234-1234-123456789abc/1/manage',
        ]}
      >
        <Routes>
          <Route
            path="/remotes/:id/user-access/:resource_type/:resource_id/:user_id/manage"
            element={<RemoteManageUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('manage-resource-roles')).toBeInTheDocument();
    });
    expect(
      screen.getByRole('heading', {
        name: 'Manage roles directly assigned to demo-user for test-remote',
      })
    ).toBeInTheDocument();
  });
});

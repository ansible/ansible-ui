/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RepositoryManageUsers } from './RepositoryManageUser';

vi.mock('@ansible/common-ui/access/components/ManageResourceRoles', () => ({
  ManageResourceRoles: () => <div data-testid="manage-resource-roles">Manage roles</div>,
}));

const mockRepository = {
  name: 'test-repo',
  description: '',
  pulp_href: '/pulp/api/v3/repositories/ansible/ansible/12345678-1234-1234-1234-123456789abc/',
  pulp_created: '2026-01-01T00:00:00Z',
  pulp_labels: {},
  private: false,
  retain_repo_versions: 1,
  remote: null,
  gpgkey: null,
  last_sync_task: {
    state: 'completed',
    task_id: '1',
    started_at: '2026-01-01T00:00:00Z',
    finished_at: '2026-01-01T00:00:00Z',
  },
  last_synced_metadata_time: null,
  latest_version_href: '',
  versions_href: '',
};

const mockUseGet =
  vi.fn<
    (url?: string) => { data?: unknown; error?: Error; isLoading: boolean; refresh: () => void }
  >();
vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: (url?: string) => mockUseGet(url),
}));

describe('RepositoryManageUsers', () => {
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
        data: { results: [mockRepository] },
        error: undefined,
        isLoading: false,
        refresh: vi.fn(),
      };
    });
  });

  it('renders manage roles page for user', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/repositories/test-repo/user-access/galaxy.ansiblerepository/12345678-1234-1234-1234-123456789abc/1/manage',
        ]}
      >
        <Routes>
          <Route
            path="/repositories/:id/user-access/:resource_type/:resource_id/:user_id/manage"
            element={<RepositoryManageUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('manage-resource-roles')).toBeInTheDocument();
    });
    expect(
      screen.getByRole('heading', {
        name: 'Manage roles directly assigned to demo-user for test-repo',
      })
    ).toBeInTheDocument();
  });
});

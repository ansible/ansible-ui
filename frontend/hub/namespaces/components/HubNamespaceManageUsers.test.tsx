import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@ansible/common-ui/access/components/ManageResourceRoles', () => ({
  ManageResourceRoles: () => <div data-testid="manage-resource-roles">Manage roles</div>,
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useParams: () => ({
      id: 'demo-ns',
      resource_id: 'res-1',
      resource_type: 'galaxy.namespace',
      user_id: '1',
    }),
  };
});

const mockNamespace = { name: 'demo-ns', metadata: { pulp_href: '/pulp/href' } };
const mockUsers = {
  count: 1,
  next: null,
  previous: null,
  results: [{ id: 1, username: 'hub-user', first_name: 'Hub', last_name: 'User' }],
};

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: vi.fn((url: string | undefined) => {
    if (url?.includes('_ui/v1/namespaces')) {
      return { data: mockNamespace, error: undefined, refresh: vi.fn(), isLoading: false };
    }
    if (url?.includes('/users')) {
      return { data: mockUsers, error: undefined, refresh: vi.fn(), isLoading: false };
    }
    return { data: undefined, error: undefined, refresh: vi.fn(), isLoading: true };
  }),
}));

import { HubNamespaceManageUsers } from './HubNamespaceManageUsers';

describe('HubNamespaceManageUsers', () => {
  it('renders manage roles page for a user', () => {
    render(
      <MemoryRouter
        initialEntries={['/namespaces/demo-ns/res-1/user-access/galaxy.namespace/1/manage']}
      >
        <Routes>
          <Route
            path="/namespaces/:id/:resource_id/user-access/:resource_type/:user_id/manage"
            element={<HubNamespaceManageUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('manage-resource-roles')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Manage roles directly assigned to hub-user for demo-ns',
      })
    ).toBeInTheDocument();
  });
});

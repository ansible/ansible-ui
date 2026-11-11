import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@ansible/common-ui/access/components/ManageResourceRoles', () => ({
  ManageResourceRoles: () => <div data-testid="manage-resource-roles">Manage roles</div>,
}));

const mockInstanceGroup = { id: 5, name: 'default', type: 'instance_group' };
const mockUsers = {
  count: 1,
  next: null,
  previous: null,
  results: [{ id: 9, username: 'ig-user', first_name: 'IG', last_name: 'User' }],
};

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: vi.fn((url: string | undefined) => {
    if (url?.includes('instance_groups')) {
      return { data: mockInstanceGroup, error: undefined, refresh: vi.fn(), isLoading: false };
    }
    if (url?.includes('/users')) {
      return { data: mockUsers, error: undefined, refresh: vi.fn(), isLoading: false };
    }
    return { data: undefined, error: undefined, refresh: vi.fn(), isLoading: true };
  }),
}));

import { InstanceGroupManageUsers } from './InstanceGroupManageUsers';

describe('InstanceGroupManageUsers', () => {
  it('renders manage roles page for a user', () => {
    render(
      <MemoryRouter initialEntries={['/instance-groups/5/user-access/awx.instance_group/9/manage']}>
        <Routes>
          <Route
            path="/instance-groups/:resource_id/user-access/:resource_type/:user_id/manage"
            element={<InstanceGroupManageUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('manage-resource-roles')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Manage roles directly assigned to ig-user for default',
      })
    ).toBeInTheDocument();
  });
});

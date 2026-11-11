import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@ansible/common-ui/access/components/ManageResourceRoles', () => ({
  ManageResourceRoles: () => <div data-testid="manage-resource-roles">Manage roles</div>,
}));

const mockInventory = { id: 12, name: 'Prod Inventory', type: 'inventory' };
const mockUsers = {
  count: 1,
  next: null,
  previous: null,
  results: [{ id: 6, username: 'inv-user', first_name: 'Inv', last_name: 'User' }],
};

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: vi.fn((url: string | undefined) => {
    if (url?.includes('/inventories/')) {
      return { data: mockInventory, error: undefined, refresh: vi.fn(), isLoading: false };
    }
    if (url?.includes('/users')) {
      return { data: mockUsers, error: undefined, refresh: vi.fn(), isLoading: false };
    }
    return { data: undefined, error: undefined, refresh: vi.fn(), isLoading: true };
  }),
}));

import { InventoryManageUsers } from './InventoryManageUsers';

describe('InventoryManageUsers', () => {
  it('renders manage roles page for a user', () => {
    render(
      <MemoryRouter initialEntries={['/inventories/12/user-access/awx.inventory/6/manage']}>
        <Routes>
          <Route
            path="/inventories/:resource_id/user-access/:resource_type/:user_id/manage"
            element={<InventoryManageUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('manage-resource-roles')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Manage roles directly assigned to inv-user for Prod Inventory',
      })
    ).toBeInTheDocument();
  });
});

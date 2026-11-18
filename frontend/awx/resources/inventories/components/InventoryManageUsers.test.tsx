import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { InventoryManageUsers } from './InventoryManageUsers';

vi.mock('../../../../common/access/components/ManageResourceRoles', () => ({
  ManageResourceRoles: () => <div data-testid="manage-resource-roles">Manage roles</div>,
}));

const server = setupServer(
  http.get(awxAPI`/inventories/12/`, () =>
    HttpResponse.json({ id: 12, name: 'Prod Inventory', type: 'inventory' })
  ),
  http.get('*/api/gateway/v1/users/*', () =>
    HttpResponse.json({
      results: [{ id: 6, username: 'inv-user', first_name: 'Inv', last_name: 'User' }],
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InventoryManageUsers', () => {
  it('renders manage roles page for a user', async () => {
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

    await waitFor(() => {
      expect(screen.getByTestId('manage-resource-roles')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          name: 'Manage roles directly assigned to inv-user for Prod Inventory',
        })
      ).toBeInTheDocument();
    });
  });

  it('shows loading page until inventory and user data are available', () => {
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

    expect(document.querySelector('.pf-v6-c-spinner')).toBeInTheDocument();
  });
});

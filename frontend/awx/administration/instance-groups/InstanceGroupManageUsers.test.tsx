import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { InstanceGroupManageUsers } from './InstanceGroupManageUsers';

vi.mock('../../../common/access/components/ManageResourceRoles', () => ({
  ManageResourceRoles: () => <div data-testid="manage-resource-roles">Manage roles</div>,
}));

const server = setupServer(
  http.get(awxAPI`/instance_groups/5/`, () =>
    HttpResponse.json({ id: 5, name: 'default', type: 'instance_group' })
  ),
  http.get('*/api/gateway/v1/users/*', () =>
    HttpResponse.json({
      results: [{ id: 9, username: 'ig-user', first_name: 'IG', last_name: 'User' }],
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InstanceGroupManageUsers', () => {
  it('renders manage roles page for a user', async () => {
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

    await waitFor(() => {
      expect(screen.getByTestId('manage-resource-roles')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          name: 'Manage roles directly assigned to ig-user for default',
        })
      ).toBeInTheDocument();
    });
  });

  it('shows loading page until instance group and user data are available', () => {
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

    expect(document.querySelector('.pf-v6-c-spinner')).toBeInTheDocument();
  });
});

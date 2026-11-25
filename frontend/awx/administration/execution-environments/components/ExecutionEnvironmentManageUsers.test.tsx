import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { ExecutionEnvironmentManageUsers } from './ExecutionEnvironmentManageUsers';

vi.mock('../../../../common/access/components/ManageResourceRoles', () => ({
  ManageResourceRoles: () => <div data-testid="manage-resource-roles">Manage roles</div>,
}));

const server = setupServer(
  http.get(awxAPI`/execution_environments/11/`, () =>
    HttpResponse.json({ id: 11, name: 'ee-minimal', type: 'execution_environment' })
  ),
  http.get('*/api/gateway/v1/users/*', () =>
    HttpResponse.json({
      results: [{ id: 3, username: 'ee-user', first_name: 'EE', last_name: 'User' }],
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ExecutionEnvironmentManageUsers', () => {
  it('renders manage roles page for a user', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/execution-environments/11/user-access/awx.execution_environment/3/manage',
        ]}
      >
        <Routes>
          <Route
            path="/execution-environments/:resource_id/user-access/:resource_type/:user_id/manage"
            element={<ExecutionEnvironmentManageUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('manage-resource-roles')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          name: 'Manage roles directly assigned to ee-user for ee-minimal',
        })
      ).toBeInTheDocument();
    });
  });

  it('shows loading page until execution environment and user data are available', () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/execution-environments/11/user-access/awx.execution_environment/3/manage',
        ]}
      >
        <Routes>
          <Route
            path="/execution-environments/:resource_id/user-access/:resource_type/:user_id/manage"
            element={<ExecutionEnvironmentManageUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(document.querySelector('.pf-v6-c-spinner')).toBeInTheDocument();
  });
});

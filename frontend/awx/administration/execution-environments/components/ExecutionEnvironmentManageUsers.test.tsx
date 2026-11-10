/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@ansible/common-ui/access/components/ManageResourceRoles', () => ({
  ManageResourceRoles: () => <div data-testid="manage-resource-roles">Manage roles</div>,
}));

const mockExecutionEnvironment = {
  id: 11,
  name: 'ee-minimal',
  type: 'execution_environment',
};
const mockUsers = {
  count: 1,
  next: null,
  previous: null,
  results: [{ id: 3, username: 'ee-user', first_name: 'EE', last_name: 'User' }],
};

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: vi.fn((url: string | undefined) => {
    if (url?.includes('execution_environments')) {
      return {
        data: mockExecutionEnvironment,
        error: undefined,
        refresh: vi.fn(),
        isLoading: false,
      };
    }
    if (url?.includes('/users')) {
      return { data: mockUsers, error: undefined, refresh: vi.fn(), isLoading: false };
    }
    return { data: undefined, error: undefined, refresh: vi.fn(), isLoading: true };
  }),
}));

import { ExecutionEnvironmentManageUsers } from './ExecutionEnvironmentManageUsers';

describe('ExecutionEnvironmentManageUsers', () => {
  it('renders manage roles page for a user', () => {
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

    expect(screen.getByTestId('manage-resource-roles')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Manage roles directly assigned to ee-user for ee-minimal',
      })
    ).toBeInTheDocument();
  });
});

/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { mockExecutionEnvironment } from '../test/mockExecutionEnvironment';

vi.mock('@ansible/common-ui/access/components/ManageResourceRoles', () => ({
  ManageResourceRoles: () => <div data-testid="manage-resource-roles">Manage roles</div>,
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useParams: () => ({
      id: 'test-execution-environment',
      resource_id: 'namespace-uuid-1',
      resource_type: 'galaxy.containernamespace',
      user_id: '1',
    }),
  };
});

const mockUsers = {
  count: 1,
  next: null,
  previous: null,
  results: [{ id: 1, username: 'demo-user', first_name: 'Demo', last_name: 'User' }],
};

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: vi.fn((url: string | undefined) => {
    if (url?.includes('execution-environments/repositories')) {
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

import { useGet } from '@ansible/common-ui/crud/useGet';

import { ExecutionEnvironmentManageUsers } from './ExecutionEnvironmentManageUser';

describe('ExecutionEnvironmentManageUsers', () => {
  it('renders manage roles page for a user', () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/execution-environments/test-execution-environment/namespace-uuid-1/user-access/galaxy.containernamespace/1/manage',
        ]}
      >
        <Routes>
          <Route
            path="/execution-environments/:id/:resource_id/user-access/:resource_type/:user_id/manage"
            element={<ExecutionEnvironmentManageUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('manage-resource-roles')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Manage roles directly assigned to demo-user for test-execution-environment',
      })
    ).toBeInTheDocument();
  });

  it('shows loading page while users are loading', () => {
    vi.mocked(useGet).mockImplementation((url: string | undefined) => {
      if (url?.includes('execution-environments/repositories')) {
        return {
          data: mockExecutionEnvironment,
          error: undefined,
          refresh: vi.fn(),
          isLoading: false,
        };
      }
      return { data: undefined, error: undefined, refresh: vi.fn(), isLoading: true };
    });

    render(
      <MemoryRouter
        initialEntries={[
          '/execution-environments/test-execution-environment/namespace-uuid-1/user-access/galaxy.containernamespace/1/manage',
        ]}
      >
        <Routes>
          <Route
            path="/execution-environments/:id/:resource_id/user-access/:resource_type/:user_id/manage"
            element={<ExecutionEnvironmentManageUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error when execution environment request fails', () => {
    vi.mocked(useGet).mockImplementation((url: string | undefined) => {
      if (url?.includes('execution-environments/repositories')) {
        return {
          data: undefined,
          error: new Error('Load failed'),
          refresh: vi.fn(),
          isLoading: false,
        };
      }
      return { data: mockUsers, error: undefined, refresh: vi.fn(), isLoading: false };
    });

    render(
      <MemoryRouter
        initialEntries={[
          '/execution-environments/test-execution-environment/namespace-uuid-1/user-access/galaxy.containernamespace/1/manage',
        ]}
      >
        <Routes>
          <Route
            path="/execution-environments/:id/:resource_id/user-access/:resource_type/:user_id/manage"
            element={<ExecutionEnvironmentManageUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /Refresh/i })).toBeInTheDocument();
  });
});

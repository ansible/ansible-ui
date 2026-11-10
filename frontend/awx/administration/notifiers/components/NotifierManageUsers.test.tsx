/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@ansible/common-ui/access/components/ManageResourceRoles', () => ({
  ManageResourceRoles: () => <div data-testid="manage-resource-roles">Manage roles</div>,
}));

const mockNotifier = { id: 7, name: 'Test Notifier', type: 'notification_template' };
const mockUsers = {
  count: 1,
  next: null,
  previous: null,
  results: [{ id: 1, username: 'demo-user', first_name: 'Demo', last_name: 'User' }],
};

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: vi.fn((url: string | undefined) => {
    if (url?.includes('notification_templates')) {
      return { data: mockNotifier, error: undefined, refresh: vi.fn(), isLoading: false };
    }
    if (url?.includes('/users')) {
      return { data: mockUsers, error: undefined, refresh: vi.fn(), isLoading: false };
    }
    return { data: undefined, error: undefined, refresh: vi.fn(), isLoading: true };
  }),
}));

import { useGet } from '@ansible/common-ui/crud/useGet';
import { NotifierManageUsers } from './NotifierManageUsers';

describe('NotifierManageUsers', () => {
  it('renders manage roles page for a user', () => {
    render(
      <MemoryRouter initialEntries={['/notifiers/7/user-access/awx.notification/1/manage']}>
        <Routes>
          <Route
            path="/notifiers/:resource_id/user-access/:resource_type/:user_id/manage"
            element={<NotifierManageUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('manage-resource-roles')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Manage roles directly assigned to demo-user for Test Notifier',
      })
    ).toBeInTheDocument();
  });

  it('shows loading page while notifier data is loading', () => {
    vi.mocked(useGet).mockImplementation((url: string | undefined) => {
      if (url?.includes('notification_templates')) {
        return { data: undefined, error: undefined, refresh: vi.fn(), isLoading: true };
      }
      return { data: mockUsers, error: undefined, refresh: vi.fn(), isLoading: false };
    });

    render(
      <MemoryRouter initialEntries={['/notifiers/7/user-access/awx.notification/1/manage']}>
        <Routes>
          <Route
            path="/notifiers/:resource_id/user-access/:resource_type/:user_id/manage"
            element={<NotifierManageUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});

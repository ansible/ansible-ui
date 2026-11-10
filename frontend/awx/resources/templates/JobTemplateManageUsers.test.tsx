/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@ansible/common-ui/access/components/ManageResourceRoles', () => ({
  ManageResourceRoles: () => <div data-testid="manage-resource-roles">Manage roles</div>,
}));

const mockJobTemplate = { id: 3, name: 'Demo Job Template', type: 'job_template' };
const mockUsers = {
  count: 1,
  next: null,
  previous: null,
  results: [{ id: 2, username: 'jt-user', first_name: 'JT', last_name: 'User' }],
};

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: vi.fn((url: string | undefined) => {
    if (url?.includes('job_templates')) {
      return { data: mockJobTemplate, error: undefined, refresh: vi.fn(), isLoading: false };
    }
    if (url?.includes('/users')) {
      return { data: mockUsers, error: undefined, refresh: vi.fn(), isLoading: false };
    }
    return { data: undefined, error: undefined, refresh: vi.fn(), isLoading: true };
  }),
}));

import { JobTemplateManageUsers } from './JobTemplateManageUsers';

describe('JobTemplateManageUsers', () => {
  it('renders manage roles page for a user', () => {
    render(
      <MemoryRouter
        initialEntries={['/templates/job_template/3/user-access/awx.job_template/2/manage']}
      >
        <Routes>
          <Route
            path="/templates/job_template/:resource_id/user-access/:resource_type/:user_id/manage"
            element={<JobTemplateManageUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('manage-resource-roles')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Manage roles directly assigned to jt-user for Demo Job Template',
      })
    ).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@ansible/common-ui/access/components/ManageResourceRoles', () => ({
  ManageResourceRoles: () => <div data-testid="manage-resource-roles">Manage roles</div>,
}));

const mockTemplate = { id: 8, name: 'Workflow Demo', type: 'workflow_job_template' };
const mockUsers = {
  count: 1,
  next: null,
  previous: null,
  results: [{ id: 4, username: 'wf-user', first_name: 'WF', last_name: 'User' }],
};

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: vi.fn((url: string | undefined) => {
    if (url?.includes('workflow_job_templates')) {
      return { data: mockTemplate, error: undefined, refresh: vi.fn(), isLoading: false };
    }
    if (url?.includes('/users')) {
      return { data: mockUsers, error: undefined, refresh: vi.fn(), isLoading: false };
    }
    return { data: undefined, error: undefined, refresh: vi.fn(), isLoading: true };
  }),
}));

import { WorkflowJobTemplateManageUsers } from './WorkflowJobTemplateManageUsers';

describe('WorkflowJobTemplateManageUsers', () => {
  it('renders manage roles page for a user', () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/templates/workflow_job_template/8/user-access/awx.workflow_job_template/4/manage',
        ]}
      >
        <Routes>
          <Route
            path="/templates/workflow_job_template/:resource_id/user-access/:resource_type/:user_id/manage"
            element={<WorkflowJobTemplateManageUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('manage-resource-roles')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Manage roles directly assigned to wf-user for Workflow Demo',
      })
    ).toBeInTheDocument();
  });
});

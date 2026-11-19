import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { WorkflowJobTemplateManageUsers } from './WorkflowJobTemplateManageUsers';

vi.mock('../../../common/access/components/ManageResourceRoles', () => ({
  ManageResourceRoles: () => <div data-testid="manage-resource-roles">Manage roles</div>,
}));

const server = setupServer(
  http.get(awxAPI`/workflow_job_templates/8/`, () =>
    HttpResponse.json({ id: 8, name: 'Workflow Demo', type: 'workflow_job_template' })
  ),
  http.get('*/api/gateway/v1/users/*', () =>
    HttpResponse.json({
      results: [{ id: 4, username: 'wf-user', first_name: 'WF', last_name: 'User' }],
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('WorkflowJobTemplateManageUsers', () => {
  it('renders manage roles page for a user', async () => {
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

    await waitFor(() => {
      expect(screen.getByTestId('manage-resource-roles')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          name: 'Manage roles directly assigned to wf-user for Workflow Demo',
        })
      ).toBeInTheDocument();
    });
  });

  it('shows loading page until workflow job template and user data are available', () => {
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

    expect(document.querySelector('.pf-v6-c-spinner')).toBeInTheDocument();
  });
});

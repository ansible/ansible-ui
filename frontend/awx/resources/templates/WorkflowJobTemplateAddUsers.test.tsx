import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { WorkflowJobTemplateAddUsers } from './WorkflowJobTemplateAddUsers';

import {
  awxPageWizardCapture,
  awxPageWizardProgressDialog,
  createAwxRoleAssignmentPostHandler,
  installAwxBulkActionDialogMock,
} from '../../common/test/mockAwxPageWizard';

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  const { createAwxPageWizardFrameworkMock } = await import('../../common/test/mockAwxPageWizard');
  return createAwxPageWizardFrameworkMock(actual);
});

const gatewayRoleAssignmentPosts: unknown[] = [];

vi.mock('../../common/useAwxBulkActionDialog', () => ({
  useAwxBulkActionDialog: () => awxPageWizardProgressDialog,
}));

const mockWorkflowJobTemplate = {
  id: 1,
  name: 'Test Workflow Template',
  type: 'workflow_job_template',
  summary_fields: { user_capabilities: {} },
};

const server = setupServer(
  http.get(
    ({ request }) =>
      request.url.includes('/workflow_job_templates/') && request.url.includes('/1/'),
    () => HttpResponse.json(mockWorkflowJobTemplate)
  ),
  http.options(
    ({ request }) => request.url.includes('/users/') && !request.url.includes('role_user'),
    () => HttpResponse.json({ actions: { GET: {} } })
  ),
  http.get(
    ({ request }) => request.url.includes('/users/') && !request.url.includes('role_user'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  ),
  http.options(awxAPI`/role_definitions/`, () => HttpResponse.json({ actions: { GET: {} } })),
  http.get(awxAPI`/role_definitions/`, () =>
    HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  ),
  createAwxRoleAssignmentPostHandler(gatewayRoleAssignmentPosts, 'role_user_assignments')
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  awxPageWizardProgressDialog.mockClear();
  gatewayRoleAssignmentPosts.length = 0;
});
afterAll(() => server.close());

describe('WorkflowJobTemplateAddUsers', () => {
  it('validates users step and submits awx role assignments', async () => {
    installAwxBulkActionDialogMock();

    render(
      <MemoryRouter initialEntries={['/templates/workflow-job-template/1/user-access/add']}>
        <Routes>
          <Route
            path="/templates/workflow-job-template/:id/user-access/add"
            element={<WorkflowJobTemplateAddUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('wizard-capture')).toBeInTheDocument();
    });

    const usersStep = awxPageWizardCapture.steps.find((step) => step.id === 'users');
    expect(() => {
      if (!usersStep || !('validate' in usersStep) || !usersStep.validate) {
        throw new Error('expected users step');
      }
      void usersStep.validate({}, {});
    }).toThrow(/Select at least one user/);

    if (!awxPageWizardCapture.onSubmit) {
      throw new Error('expected onSubmit');
    }
    await awxPageWizardCapture.onSubmit({
      users: [{ id: 2, username: 'user2' }],
      awxRoles: [{ id: 3, name: 'Admin' }],
    });

    await waitFor(() => {
      expect(gatewayRoleAssignmentPosts).toHaveLength(1);
    });
    expect(gatewayRoleAssignmentPosts[0]).toMatchObject({
      user: 2,
      role_definition: 3,
      content_type: 'workflowjobtemplate',
      object_id: 1,
    });

    expect(awxPageWizardProgressDialog).toHaveBeenCalled();
  });

  it('validates awx roles step', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/workflow-job-template/1/user-access/add']}>
        <Routes>
          <Route
            path="/templates/workflow-job-template/:id/user-access/add"
            element={<WorkflowJobTemplateAddUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('wizard-capture')).toBeInTheDocument();
    });

    const rolesStep = awxPageWizardCapture.steps.find((step) => step.id === 'roles');
    expect(() => {
      if (!rolesStep || !('validate' in rolesStep) || !rolesStep.validate) {
        throw new Error('expected roles step');
      }
      void rolesStep.validate({}, {});
    }).toThrow(/Select at least one role/);
  });
});

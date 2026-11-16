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
} from '../../common/test/mockAwxPageWizard';

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  const { createAwxPageWizardFrameworkMock } = await import('../../common/test/mockAwxPageWizard');
  return createAwxPageWizardFrameworkMock(actual);
});

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
  http.post(awxAPI`/role_user_assignments/`, () => HttpResponse.json({}))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  awxPageWizardProgressDialog.mockClear();
});
afterAll(() => server.close());

describe('WorkflowJobTemplateAddUsers', () => {
  it('validates users step and submits awx role assignments', async () => {
    awxPageWizardProgressDialog.mockImplementation(
      (options: {
        items: unknown[];
        actionFn: (item: unknown) => void;
        onComplete: () => void;
      }) => {
        const item = options.items[0];
        if (item) {
          void options.actionFn(item);
        }
        options.onComplete();
      }
    );

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

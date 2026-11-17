import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { WorkflowJobTemplateAssignTeams } from './WorkflowJobTemplateAssignTeams';

import {
  awxPageWizardCapture,
  awxPageWizardProgressDialog,
  createGatewayRoleAssignmentPostHandler,
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
  http.get(
    ({ request }) => request.url.includes('/api/gateway/v1/teams'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  ),
  createGatewayRoleAssignmentPostHandler(gatewayRoleAssignmentPosts, 'role_team_assignments')
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  awxPageWizardProgressDialog.mockClear();
  gatewayRoleAssignmentPosts.length = 0;
});
afterAll(() => server.close());

describe('WorkflowJobTemplateAssignTeams', () => {
  it('validates teams step and submits platform role assignments', async () => {
    installAwxBulkActionDialogMock();

    render(
      <MemoryRouter initialEntries={['/templates/workflow-job-template/1/team-access/assign']}>
        <Routes>
          <Route
            path="/templates/workflow-job-template/:id/team-access/assign"
            element={<WorkflowJobTemplateAssignTeams />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('wizard-capture')).toBeInTheDocument();
    });

    const teamsStep = awxPageWizardCapture.steps.find((step) => step.id === 'teams');
    expect(() => {
      if (!teamsStep || !('validate' in teamsStep) || !teamsStep.validate) {
        throw new Error('expected teams step');
      }
      void teamsStep.validate({}, {});
    }).toThrow(/Select at least one team/);

    if (!awxPageWizardCapture.onSubmit) {
      throw new Error('expected onSubmit');
    }
    await awxPageWizardCapture.onSubmit({
      teams: [{ id: 2, name: 'Ops' }],
      platformRoles: [{ id: 3, name: 'Admin' }],
    });

    await waitFor(() => {
      expect(gatewayRoleAssignmentPosts).toHaveLength(1);
    });
    expect(gatewayRoleAssignmentPosts[0]).toMatchObject({
      team: 2,
      role_definition: 3,
      content_type: 'awx.workflowjobtemplate',
      object_id: 1,
    });

    expect(awxPageWizardProgressDialog).toHaveBeenCalled();
  });

  it('validates platform roles step', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/workflow-job-template/1/team-access/assign']}>
        <Routes>
          <Route
            path="/templates/workflow-job-template/:id/team-access/assign"
            element={<WorkflowJobTemplateAssignTeams />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('wizard-capture')).toBeInTheDocument();
    });

    const rolesStep = awxPageWizardCapture.steps.find((step) => step.id === 'platformRoles');
    expect(() => {
      if (!rolesStep || !('validate' in rolesStep) || !rolesStep.validate) {
        throw new Error('expected roles step');
      }
      void rolesStep.validate({}, {});
    }).toThrow(/Select at least one role/);
  });
});

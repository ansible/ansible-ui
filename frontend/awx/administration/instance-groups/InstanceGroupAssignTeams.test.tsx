import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { InstanceGroupAssignTeams } from './InstanceGroupAssignTeams';

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

const mockInstanceGroup = {
  id: 1,
  name: 'Test Instance Group',
  is_container_group: false,
  summary_fields: { user_capabilities: {} },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/instance_groups/') && request.url.includes('/1/'),
    () => HttpResponse.json(mockInstanceGroup)
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

describe('InstanceGroupAssignTeams', () => {
  it('validates teams step and submits platform role assignments', async () => {
    installAwxBulkActionDialogMock();

    render(
      <MemoryRouter initialEntries={['/instance-groups/1/instance-groups/teams/assign-teams']}>
        <Routes>
          <Route
            path="/instance-groups/:id/instance-groups/teams/assign-teams"
            element={<InstanceGroupAssignTeams />}
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
      platformRoles: [{ id: 3, name: 'Use' }],
    });

    await waitFor(() => {
      expect(gatewayRoleAssignmentPosts).toHaveLength(1);
    });
    expect(gatewayRoleAssignmentPosts[0]).toMatchObject({
      team: 2,
      role_definition: 3,
      content_type: 'awx.instancegroup',
      object_id: 1,
    });

    expect(awxPageWizardProgressDialog).toHaveBeenCalled();
  });

  it('validates platform roles step', async () => {
    render(
      <MemoryRouter initialEntries={['/instance-groups/1/instance-groups/teams/assign-teams']}>
        <Routes>
          <Route
            path="/instance-groups/:id/instance-groups/teams/assign-teams"
            element={<InstanceGroupAssignTeams />}
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

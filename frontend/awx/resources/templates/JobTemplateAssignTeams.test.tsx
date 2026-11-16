import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { JobTemplateAssignTeams } from './JobTemplateAssignTeams';

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

const mockJobTemplate = {
  id: 1,
  name: 'Test Job Template',
  type: 'job_template',
  job_type: 'run',
  summary_fields: { user_capabilities: {} },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/job_templates/') && request.url.includes('/1/'),
    () => HttpResponse.json(mockJobTemplate)
  ),
  http.get(
    ({ request }) => request.url.includes('/api/gateway/v1/teams'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  ),
  http.post(
    ({ request }) => request.url.includes('role_team_assignments'),
    () => HttpResponse.json({})
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  awxPageWizardProgressDialog.mockClear();
});
afterAll(() => server.close());

describe('JobTemplateAssignTeams', () => {
  it('validates teams step and submits platform role assignments', async () => {
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
      <MemoryRouter initialEntries={['/templates/job-template/1/team-access/assign']}>
        <Routes>
          <Route
            path="/templates/job-template/:id/team-access/assign"
            element={<JobTemplateAssignTeams />}
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
      platformRoles: [{ id: 3, name: 'Execute' }],
    });

    expect(awxPageWizardProgressDialog).toHaveBeenCalled();
  });

  it('validates platform roles step', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/job-template/1/team-access/assign']}>
        <Routes>
          <Route
            path="/templates/job-template/:id/team-access/assign"
            element={<JobTemplateAssignTeams />}
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

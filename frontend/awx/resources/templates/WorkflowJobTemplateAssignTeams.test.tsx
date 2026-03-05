import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { WorkflowJobTemplateAssignTeams } from './WorkflowJobTemplateAssignTeams';

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
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('WorkflowJobTemplateAssignTeams', () => {
  it('should render wizard with Select team(s) step', { timeout: 15000 }, async () => {
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

    await waitFor(
      () => {
        expect(screen.getByTestId('wizard')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { WorkflowJobTemplateAddUsers } from './WorkflowJobTemplateAddUsers';

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
    ({ request }) => request.url.includes('/users/') && !request.url.includes('role_user'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  ),
  http.get(
    ({ request }) => request.url.includes('/role_definitions'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('WorkflowJobTemplateAddUsers', () => {
  it('should render wizard with Select user(s) step', { timeout: 15000 }, async () => {
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

    await waitFor(
      () => {
        expect(screen.getByTestId('wizard')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { testWorkflowJobTemplateFixture } from './workflowJobTemplateDetails.fixture';
import { WorkflowJobTemplatePage } from './WorkflowJobTemplatePage';

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('workflow_job_templates') && request.url.includes('/1'),
    () => HttpResponse.json(testWorkflowJobTemplateFixture)
  ),
  http.get(
    ({ request }) => request.url.includes('organizations'),
    () => HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('WorkflowJobTemplatePage', () => {
  it('should render template page with template name', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/workflow-job-template/1']}>
        <Routes>
          <Route
            path="/templates/workflow-job-template/:id"
            element={<WorkflowJobTemplatePage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('Test Workflow Job Template')).toBeInTheDocument();
    });
  });
});

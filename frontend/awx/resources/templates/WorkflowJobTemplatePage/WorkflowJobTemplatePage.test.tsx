import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';
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

function renderWorkflowJobTemplatePage() {
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter initialEntries={['/templates/workflow-job-template/1']}>
        <Routes>
          <Route
            path="/templates/workflow-job-template/:id"
            element={<WorkflowJobTemplatePage />}
          />
        </Routes>
      </MemoryRouter>
    </SWRConfig>
  );
}

describe('WorkflowJobTemplatePage', () => {
  it('should render template page with template name', async () => {
    renderWorkflowJobTemplatePage();

    await waitFor(() => {
      expect(screen.getByTestId('Test Workflow Job Template')).toBeInTheDocument();
    });
  });

  it('should show notifications tab when user has notification access', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('organizations'),
        () =>
          HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [{ id: 1, name: 'Default' }],
          })
      )
    );

    renderWorkflowJobTemplatePage();

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Notifications' })).toBeInTheDocument();
    });
  });

  it('should show notification access errors', async () => {
    server.use(
      http.get(
        ({ request }) => request.url.includes('organizations'),
        () => HttpResponse.json({ detail: 'Failed to load organizations' }, { status: 500 })
      )
    );

    renderWorkflowJobTemplatePage();

    await waitFor(() => {
      expect(screen.getByText('Internal Server Error')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { JobPage } from './JobPage';

vi.mock('./WorkflowOutput/WorkflowOutputNode', () => ({
  jobPaths: {
    project_update: 'project',
    inventory_update: 'inventory',
    job: 'playbook',
    ad_hoc_command: 'command',
    system_job: 'management',
    workflow_job: 'workflow',
  },
}));

const mockJob = {
  id: 1,
  name: 'Test Job',
  type: 'job',
  status: 'successful',
  summary_fields: { user_capabilities: { delete: true, start: true } },
  related: { stdout: '/api/v2/jobs/1/stdout/' },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/jobs/') && request.url.includes('/1/'),
    () => HttpResponse.json(mockJob)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('JobPage', () => {
  it('should display job name in page header', async () => {
    render(
      <MemoryRouter initialEntries={['/jobs/playbook/1']}>
        <Routes>
          <Route path="/jobs/:job_type/:id" element={<JobPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Test Job');
    });
  });
});

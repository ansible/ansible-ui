import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { Job } from '../../interfaces/Job';
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

const runningWorkflowJob = {
  id: 1,
  type: 'workflow_job',
  url: '/api/v2/workflow_jobs/1/',
  name: 'Running Workflow Job',
  status: 'running',
  summary_fields: {
    user_capabilities: { delete: true, start: true },
    workflow_job_template: { id: 1, name: 'Demo Workflow', description: '' },
    unified_job_template: {
      id: 1,
      name: 'Demo Workflow',
      description: '',
      unified_job_type: 'workflow_job',
    },
    created_by: { id: 1, username: 'admin', first_name: '', last_name: '' },
    labels: { count: 0, results: [] },
  } as Job['summary_fields'],
  related: {
    cancel: '/api/v2/workflow_jobs/1/cancel/',
    relaunch: '/api/v2/workflow_jobs/1/relaunch/',
    notifications: '/api/v2/workflow_jobs/1/notifications/',
  } as Job['related'],
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  started: '2024-01-01T00:00:00Z',
  finished: null,
  elapsed: 0,
  failed: false,
  launched_by: { id: 1, name: 'admin', type: 'user', url: '/api/v2/users/1/' },
  playbook_counts: { play_count: 0, task_count: 0 },
  host_status_counts: {},
} as unknown as Job;

const finishedWorkflowJob = {
  id: 2,
  type: 'workflow_job',
  url: '/api/v2/workflow_jobs/2/',
  name: 'Finished Workflow Job',
  status: 'successful',
  summary_fields: {
    user_capabilities: { delete: true, start: true },
    workflow_job_template: { id: 1, name: 'Demo Workflow', description: '' },
    unified_job_template: {
      id: 1,
      name: 'Demo Workflow',
      description: '',
      unified_job_type: 'workflow_job',
    },
    created_by: { id: 1, username: 'admin', first_name: '', last_name: '' },
    labels: { count: 0, results: [] },
  } as Job['summary_fields'],
  related: {
    cancel: '/api/v2/workflow_jobs/2/cancel/',
    relaunch: '/api/v2/workflow_jobs/2/relaunch/',
    notifications: '/api/v2/workflow_jobs/2/notifications/',
    stdout: '/api/v2/workflow_jobs/2/stdout/',
  } as Job['related'],
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  started: '2024-01-01T00:00:00Z',
  finished: '2024-01-01T00:01:00Z',
  elapsed: 60,
  failed: false,
  launched_by: { id: 1, name: 'admin', type: 'user', url: '/api/v2/users/1/' },
  playbook_counts: { play_count: 1, task_count: 2 },
  host_status_counts: {},
} as unknown as Job;

const server = setupServer(
  http.options('*', () => HttpResponse.json({})),
  http.get(awxAPI`/workflow_jobs/1/`, () => HttpResponse.json(runningWorkflowJob)),
  http.get(awxAPI`/workflow_jobs/2/`, () => HttpResponse.json(finishedWorkflowJob))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('JobHeader', () => {
  it('should show relaunch and cancel buttons visible on running job', async () => {
    render(
      <MemoryRouter initialEntries={['/jobs/workflow/1/details']}>
        <Routes>
          <Route path="/jobs/:job_type/:id/*" element={<JobPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /Relaunch job/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Cancel job/i })).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it('should disable delete button on running job', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/jobs/workflow/1/details']}>
        <Routes>
          <Route path="/jobs/:job_type/:id/*" element={<JobPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Running Workflow Job' })).toBeInTheDocument();
    });

    const actionsToggle = screen.getByRole('button', {
      name: /kebab dropdown toggle|dropdown toggle/i,
    });
    await user.click(actionsToggle);

    const deleteButton = await screen.findByRole('menuitem', { name: /Delete job/i });
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveAttribute('aria-disabled', 'true');
  });

  it('should enable delete button on finished job', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/jobs/workflow/2/details']}>
        <Routes>
          <Route path="/jobs/:job_type/:id/*" element={<JobPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Finished Workflow Job' })).toBeInTheDocument();
    });

    const actionsToggle = screen.getByRole('button', {
      name: /kebab dropdown toggle|dropdown toggle/i,
    });
    await user.click(actionsToggle);

    const deleteButton = await screen.findByRole('menuitem', { name: /Delete job/i });
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toBeEnabled();
  });

  it('should disable cancel button on finished job', async () => {
    render(
      <MemoryRouter initialEntries={['/jobs/workflow/2/details']}>
        <Routes>
          <Route path="/jobs/:job_type/:id/*" element={<JobPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Finished Workflow Job' })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Cancel job/i });
    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton).toHaveAttribute('aria-disabled', 'true');
  });
});

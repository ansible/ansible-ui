/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { pulpAPI } from '../../common/api/formatPath';
import { TaskDetails } from './TaskDetails';

const taskId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const parentId = '11111111-2222-3333-4444-555555555555';
const childId = '66666666-7777-8888-9999-000000000000';

const baseTask = {
  pulp_href: `/pulp/api/v3/tasks/${taskId}/`,
  pulp_created: '2024-01-01T00:00:00.000000Z',
  created_by: 'admin',
  started_at: '2024-01-01T00:00:00.000000Z',
  finished_at: '2024-01-01T00:01:00.000000Z',
  state: 'completed' as const,
  worker: 'worker-1',
  logging_cid: 'cid-1',
  task_group: '',
  parent_task: '',
  child_tasks: [] as string[],
  progress_reports: [] as Record<string, unknown>[],
  created_resources: [],
  reserved_resources_record: [] as string[],
};

describe('TaskDetails', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  function renderTaskDetails(id = taskId) {
    render(
      <MemoryRouter initialEntries={[`/tasks/${id}`]}>
        <Routes>
          <Route path="/tasks/:id" element={<TaskDetails />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it('renders task detail with translated name', async () => {
    server.use(
      http.get(pulpAPI`/tasks/${taskId}/`, () =>
        HttpResponse.json({
          ...baseTask,
          name: 'pulpcore.tasking.tasks.base.general_create',
        })
      )
    );

    renderTaskDetails();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'pulpcore: General create' })).toBeInTheDocument();
    });
    expect(screen.getByText('Task detail')).toBeInTheDocument();
    expect(screen.getByText('pulpcore.tasking.tasks.base.general_create')).toBeInTheDocument();
  });

  it('renders parent and child task links', async () => {
    server.use(
      http.get(pulpAPI`/tasks/${taskId}/`, () =>
        HttpResponse.json({
          ...baseTask,
          name: 'pulp_ansible.app.tasks.copy.copy_content',
          parent_task: `/pulp/api/v3/tasks/${parentId}/`,
          child_tasks: [`/pulp/api/v3/tasks/${childId}/`],
        })
      ),
      http.get(pulpAPI`/tasks/${parentId}/`, () =>
        HttpResponse.json({
          ...baseTask,
          pulp_href: `/pulp/api/v3/tasks/${parentId}/`,
          name: 'pulpcore.tasking.tasks.base.general_delete',
        })
      ),
      http.get(pulpAPI`/tasks/${childId}/`, () =>
        HttpResponse.json({
          ...baseTask,
          pulp_href: `/pulp/api/v3/tasks/${childId}/`,
          name: 'pulpcore.tasking.tasks.base.general_update',
        })
      )
    );

    renderTaskDetails();

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'pulpcore: General delete' })).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: 'pulpcore: General update' })).toBeInTheDocument();
  });

  it('renders progress reports', async () => {
    server.use(
      http.get(pulpAPI`/tasks/${taskId}/`, () =>
        HttpResponse.json({
          ...baseTask,
          name: 'pulp_ansible.app.tasks.collections.sync',
          progress_reports: [{ message: 'Syncing collections', state: 'running', done: 1 }],
        })
      )
    );

    renderTaskDetails();

    await waitFor(() => {
      expect(screen.getByText('Syncing collections')).toBeInTheDocument();
    });
    expect(screen.getByText('Progress messages')).toBeInTheDocument();
  });

  it('renders error message when task failed', async () => {
    server.use(
      http.get(pulpAPI`/tasks/${taskId}/`, () =>
        HttpResponse.json({
          ...baseTask,
          name: 'pulp_ansible.app.tasks.collections.sync',
          state: 'failed',
          error: {
            code: '500',
            description: 'Task failed',
            traceback: 'Traceback line 1',
          },
        })
      )
    );

    renderTaskDetails();

    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
    expect(screen.getByText('Task failed')).toBeInTheDocument();
    expect(screen.getByText('Traceback line 1')).toBeInTheDocument();
  });

  it('renders error state on API failure', async () => {
    server.use(
      http.get(pulpAPI`/tasks/${taskId}/`, () =>
        HttpResponse.json({ detail: 'Not found' }, { status: 404 })
      )
    );

    renderTaskDetails();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    });
  });

  it('renders reserved resources and empty progress state', async () => {
    const REPO_UUID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    const resourceUrl = `/api/galaxy/pulp/api/v3/repositories/ansible/ansible/${REPO_UUID}/`;
    server.use(
      http.get(pulpAPI`/tasks/${taskId}/`, () =>
        HttpResponse.json({
          ...baseTask,
          name: 'pulp_ansible.app.tasks.collections.sync',
          task_group: '/pulp/api/v3/task-groups/group-1/',
          progress_reports: [],
          reserved_resources_record: [resourceUrl],
        })
      ),
      http.get(pulpAPI`/repositories/ansible/ansible/${REPO_UUID}/`, () =>
        HttpResponse.json({ name: 'published' })
      ),
      http.get(resourceUrl, () => HttpResponse.json({ name: 'published' }))
    );

    renderTaskDetails();

    await waitFor(() => {
      expect(screen.getByText('Reserve resources')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('published')).toBeInTheDocument();
    });
    expect(screen.getByText('/pulp/api/v3/task-groups/group-1/')).toBeInTheDocument();
    expect(screen.getAllByText('There is no progress message.').length).toBeGreaterThan(0);
  });

  it('renders translated galaxy task name in heading', async () => {
    server.use(
      http.get(pulpAPI`/tasks/${taskId}/`, () =>
        HttpResponse.json({
          ...baseTask,
          name: 'galaxy_ng.app.tasks.import_and_auto_approve',
        })
      )
    );

    renderTaskDetails();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Import and auto approve' })).toBeInTheDocument();
    });
  });
});

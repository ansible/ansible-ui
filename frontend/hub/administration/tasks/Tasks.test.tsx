/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { pulpAPI } from '../../common/api/formatPath';
import { Tasks } from './Tasks';

// Mock useHubContext
vi.mock('../../common/useHubContext', () => ({
  useHubContext: () => ({
    hasPermission: () => true,
  }),
}));

const mockTasksResponse = {
  count: 2,
  results: [
    {
      name: 'pulp_ansible.app.tasks.copy.move_collection',
      pulp_href: '/api/galaxy/pulp/api/v3/tasks/123/',
      pulp_created: '2024-01-01T00:00:00.000000Z',
      created_by: 'admin',
      started_at: '2024-01-01T00:00:00.000000Z',
      finished_at: '2024-01-01T00:01:00.000000Z',
      state: 'completed' as const,
      worker: 'worker-1',
      logging_cid: 'cid-1',
      task_group: '',
      parent_task: '',
      child_tasks: [],
      progress_reports: [],
      created_resources: [],
      reserved_resources_record: [],
    },
    {
      name: 'galaxy_ng.app.tasks.namespaces._create_pulp_namespace',
      pulp_href: '/api/galaxy/pulp/api/v3/tasks/456/',
      pulp_created: '2024-01-02T00:00:00.000000Z',
      created_by: 'admin',
      started_at: '2024-01-02T00:00:00.000000Z',
      finished_at: null,
      state: 'running' as const,
      worker: 'worker-2',
      logging_cid: 'cid-2',
      task_group: '',
      parent_task: '',
      child_tasks: [],
      progress_reports: [],
      created_resources: [],
      reserved_resources_record: [],
    },
  ],
};

const mockEmptyResponse = {
  count: 0,
  results: [],
};

describe('Tasks Component', () => {
  let server: ReturnType<typeof setupServer>;

  beforeAll(() => {
    server = setupServer();
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('Page Structure', () => {
    beforeEach(() => {
      server.use(http.get(pulpAPI`/tasks/`, () => HttpResponse.json(mockTasksResponse)));
    });

    it('should render page title and description', async () => {
      render(
        <MemoryRouter>
          <Tasks />
        </MemoryRouter>
      );

      expect(await screen.findByRole('heading', { name: 'Task Management' })).toBeInTheDocument();
      expect(
        screen.getByText(
          'Task management facilitates organizing, scheduling, and monitoring automation tasks for efficient workflow management.'
        )
      ).toBeInTheDocument();
    });

    it('should render correct column headers', async () => {
      render(
        <MemoryRouter>
          <Tasks />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Task Management' });

      expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    });
  });

  describe('Tasks Rendering', () => {
    beforeEach(() => {
      server.use(http.get(pulpAPI`/tasks/`, () => HttpResponse.json(mockTasksResponse)));
    });

    it('should render tasks from API response', async () => {
      render(
        <MemoryRouter>
          <Tasks />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Task Management' });

      expect(
        await screen.findByText('pulp_ansible.app.tasks.copy.move_collection')
      ).toBeInTheDocument();
      expect(
        screen.getByText('galaxy_ng.app.tasks.namespaces._create_pulp_namespace')
      ).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    beforeEach(() => {
      server.use(http.get(pulpAPI`/tasks/`, () => HttpResponse.json(mockEmptyResponse)));
    });

    it('should show empty state when no tasks exist', async () => {
      render(
        <MemoryRouter>
          <Tasks />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Task Management' });

      await waitFor(() => {
        expect(screen.getByText('No tasks yet')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should render unauthorized state for 403 error', async () => {
      server.use(
        http.get(pulpAPI`/tasks/`, () =>
          HttpResponse.json({ detail: 'Forbidden' }, { status: 403 })
        )
      );

      render(
        <MemoryRouter>
          <Tasks />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('You do not have access to Task Management')).toBeInTheDocument();
      });
    });

    it('should render error state for non-403 errors', async () => {
      server.use(
        http.get(pulpAPI`/tasks/`, () =>
          HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
        )
      );

      render(
        <MemoryRouter>
          <Tasks />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Task Management' });

      await waitFor(() => {
        expect(screen.getByText('Error loading tasks')).toBeInTheDocument();
      });
    });
  });

  describe('Stop Action', () => {
    beforeEach(() => {
      server.use(http.get(pulpAPI`/tasks/`, () => HttpResponse.json(mockTasksResponse)));
    });

    it('should disable stop action for completed tasks', async () => {
      render(
        <MemoryRouter>
          <Tasks />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('pulp_ansible.app.tasks.copy.move_collection')).toBeInTheDocument();
      });

      const completedRow = screen
        .getByText('pulp_ansible.app.tasks.copy.move_collection')
        .closest('tr');
      expect(completedRow).toBeInTheDocument();

      const stopButton = within(completedRow as HTMLElement).getByTestId('stop-task');
      expect(stopButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('should enable stop action for running tasks', async () => {
      render(
        <MemoryRouter>
          <Tasks />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(
          screen.getByText('galaxy_ng.app.tasks.namespaces._create_pulp_namespace')
        ).toBeInTheDocument();
      });

      const runningRow = screen
        .getByText('galaxy_ng.app.tasks.namespaces._create_pulp_namespace')
        .closest('tr');
      expect(runningRow).toBeInTheDocument();

      const stopButton = within(runningRow as HTMLElement).getByTestId('stop-task');
      expect(stopButton).not.toHaveAttribute('aria-disabled', 'true');
    });
  });
});

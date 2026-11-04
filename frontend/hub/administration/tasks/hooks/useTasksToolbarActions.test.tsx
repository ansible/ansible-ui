/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { pulpAPI } from '../../../common/api/formatPath';
import { Task } from '../Task';
import { useStopTasks, useTasksToolbarActions } from './useTasksToolbarActions';

let capturedConfig: {
  title?: string;
  items?: Task[];
  keyFn?: (task: Task) => string | undefined;
  isItemNonActionable?: (task: Task) => string;
  actionFn?: (task: Task) => Promise<unknown>;
} = {};

vi.mock('../../../common/useHubBulkConfirmation', () => ({
  useHubBulkConfirmation: () => (config: typeof capturedConfig) => {
    capturedConfig = config;
  },
}));

vi.mock('./useTasksColumns', () => ({
  useTasksColumns: () => [{ header: 'Name', cell: () => null }],
}));

const TASK_UUID = 'cccccccc-dddd-eeee-ffff-000000000001';

const mockTask: Task = {
  pulp_href: `/pulp/api/v3/tasks/${TASK_UUID}/`,
  name: 'pulpcore.tasking.tasks.base.general_create',
  state: 'running',
  pulp_created: '2024-01-01T00:00:00Z',
  started_at: '2024-01-01T00:00:00Z',
  finished_at: '',
  created_by: 'admin',
  worker: 'worker-1',
  logging_cid: '',
  task_group: '',
  parent_task: '',
  child_tasks: [],
  progress_reports: [],
  created_resources: [],
  reserved_resources_record: [],
};

const mockTask2: Task = {
  ...mockTask,
  pulp_href: `/pulp/api/v3/tasks/${TASK_UUID}-2/`,
  name: 'pulpcore.tasking.tasks.base.general_update',
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  capturedConfig = {};
});
afterAll(() => server.close());

describe('useTasksToolbarActions', () => {
  it('returns Stop tasks toolbar action', () => {
    const { result } = renderHook(() => useTasksToolbarActions(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const stopAction = result.current.find(
      (action) => 'label' in action && action.label === 'Stop tasks'
    );
    expect(stopAction).toBeDefined();
    expect(stopAction && 'isDanger' in stopAction && stopAction.isDanger).toBe(true);
  });

  it('delegates toolbar click to stop tasks confirmation', () => {
    const { result } = renderHook(() => useTasksToolbarActions(vi.fn()), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const stopAction = result.current[0];
    act(() => {
      if (stopAction && 'onClick' in stopAction) {
        (stopAction.onClick as (items: Task[]) => unknown)([mockTask]);
      }
    });

    expect(capturedConfig.title).toContain('Stop running/waiting task');
  });
});

describe('useStopTasks', () => {
  beforeEach(() => {
    capturedConfig = {};
  });

  it('opens bulk confirmation for running tasks', () => {
    const { result } = renderHook(() => useStopTasks(vi.fn()), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current([mockTask2, mockTask]);
    });

    expect(capturedConfig.title).toContain('Stop running/waiting task');
    expect(capturedConfig.items?.map((item) => item.pulp_href)).toContain(mockTask.pulp_href);
    expect(capturedConfig.keyFn?.(mockTask)).toBe(mockTask.name);
  });

  it('marks completed tasks as non-actionable', () => {
    const { result } = renderHook(() => useStopTasks(vi.fn()), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current([mockTask]);
    });

    const completedTask = { ...mockTask, state: 'completed' as const };
    expect(capturedConfig.isItemNonActionable?.(completedTask)).toContain('running or waiting');
    expect(capturedConfig.isItemNonActionable?.(mockTask)).toBe('');
  });

  it('cancels running task via PATCH', async () => {
    server.use(
      http.patch(pulpAPI`/tasks/${TASK_UUID}/`, () => HttpResponse.json({ state: 'canceled' }))
    );

    const { result } = renderHook(() => useStopTasks(vi.fn()), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current([mockTask]);
    });

    await act(async () => {
      await capturedConfig.actionFn?.(mockTask);
    });
  });
});

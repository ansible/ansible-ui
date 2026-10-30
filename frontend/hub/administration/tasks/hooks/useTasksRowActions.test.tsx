/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Task } from '../Task';
import { useTasksRowActions } from './useTasksRowActions';

const mockStopTasks = vi.fn();

vi.mock('./useTasksToolbarActions', () => ({
  useStopTasks: () => mockStopTasks,
}));

const mockTask: Task = {
  pulp_href: '/pulp/api/v3/tasks/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/',
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

function getAction(actions: ReturnType<typeof useTasksRowActions>, label: string) {
  return actions.find((action) => 'label' in action && action.label === label);
}

describe('useTasksRowActions', () => {
  it('returns a pinned, danger Stop task action', () => {
    const { result } = renderHook(() => useTasksRowActions(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const stopAction = getAction(result.current, 'Stop task');
    expect(stopAction).toBeDefined();
    expect(stopAction && 'isPinned' in stopAction && stopAction.isPinned).toBe(true);
    expect(stopAction && 'isDanger' in stopAction && stopAction.isDanger).toBe(true);
  });

  it('calls useStopTasks with the clicked task', () => {
    const { result } = renderHook(() => useTasksRowActions(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const stopAction = getAction(result.current, 'Stop task');
    act(() => {
      if (stopAction && 'onClick' in stopAction) {
        (stopAction.onClick as (task: Task) => unknown)(mockTask);
      }
    });

    expect(mockStopTasks).toHaveBeenCalledWith([mockTask]);
  });

  it('disables action for non-stoppable tasks and enables it for running/waiting tasks', () => {
    const { result } = renderHook(() => useTasksRowActions(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const stopAction = getAction(result.current, 'Stop task');
    const isDisabled =
      stopAction && 'isDisabled' in stopAction
        ? (stopAction.isDisabled as (item: Task) => string | undefined)
        : undefined;

    expect(isDisabled?.(mockTask)).toBe('');
    expect(isDisabled?.({ ...mockTask, state: 'completed' })).toBeTruthy();
  });
});

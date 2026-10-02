/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useDeleteProjects } from './useDeleteProjects';
import { useCancelProjects } from './useCancelProjects';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { Project } from '../../../interfaces/Project';

vi.mock('../../../common/useAwxBulkConfirmation');
vi.mock('@ansible/common-ui/crud/Data');
vi.mock('@ansible/common-ui/crud/usePostRequest', () => ({
  usePostRequest: vi.fn(() => vi.fn().mockResolvedValue(undefined)),
}));
vi.mock('./useProjectsColumns', () => ({
  useProjectsColumns: vi.fn(() => []),
}));
vi.mock('@ansible/common-ui/columns', () => ({
  useNameColumn: vi.fn(() => ({ header: 'Name' })),
}));

function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    name: 'Project A',
    description: '',
    type: 'project',
    base_dir: '/var/lib/awx/projects',
    scm_type: 'git',
    status: 'successful',
    summary_fields: {
      created_by: { id: 1, username: 'admin' },
      modified_by: { id: 1, username: 'admin' },
      credential: { id: 1, name: 'cred', description: '' },
      organization: { id: 1, name: 'Default', description: '' },
      signature_validation_credential: { id: 0, name: '', description: '' },
      default_environment: { id: 1, name: 'EE', description: '', image: '' },
      current_job: { id: 1, status: 'successful' },
      last_job: { id: 1, status: 'successful' },
      user_capabilities: { edit: true, delete: true, start: true, schedule: true, copy: true },
      current_update: { id: 100 },
    },
    related: {
      created_by: '',
      modified_by: '',
      teams: '',
      playbooks: '',
      inventory_files: '',
      update: '',
      project_updates: '',
      scm_inventory_sources: '',
      schedules: '',
      activity_stream: '',
      notification_templates_started: '',
      notification_templates_success: '',
      notification_templates_error: '',
      access_list: '',
      object_roles: '',
      copy: '',
      organization: 1,
    },
    ...overrides,
  } as Project;
}

describe('useDeleteProjects', () => {
  const mockBulkAction = vi.fn();
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockBulkAction);
  });

  test('should return a delete function', () => {
    const { result } = renderHook(() => useDeleteProjects(mockOnComplete));

    expect(typeof result.current).toBe('function');
  });

  test('should call bulkAction with correct title', () => {
    const projects = [createMockProject(), createMockProject({ id: 2, name: 'Project B' })];
    const { result } = renderHook(() => useDeleteProjects(mockOnComplete));

    result.current(projects);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.title).toMatch(/permanently delete projects/i);
  });

  test('should call bulkAction with correct confirm text including count', () => {
    const projects = [createMockProject(), createMockProject({ id: 2, name: 'Project B' })];
    const { result } = renderHook(() => useDeleteProjects(mockOnComplete));

    result.current(projects);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.confirmText).toContain('2');
  });

  test('should sort projects by name', () => {
    const projects = [
      createMockProject({ id: 1, name: 'Zebra Project' }),
      createMockProject({ id: 2, name: 'Alpha Project' }),
    ];
    const { result } = renderHook(() => useDeleteProjects(mockOnComplete));

    result.current(projects);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.items[0].name).toBe('Alpha Project');
    expect(callArgs.items[1].name).toBe('Zebra Project');
  });

  test('should mark as danger', () => {
    const { result } = renderHook(() => useDeleteProjects(mockOnComplete));

    result.current([createMockProject()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.isDanger).toBe(true);
  });

  test('should pass onComplete callback', () => {
    const { result } = renderHook(() => useDeleteProjects(mockOnComplete));

    result.current([createMockProject()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.onComplete).toBe(mockOnComplete);
  });

  test('should provide actionFn that calls requestDelete with correct URL', async () => {
    const { requestDelete } = await import('@ansible/common-ui/crud/Data');
    vi.mocked(requestDelete).mockResolvedValue(undefined);
    const { result } = renderHook(() => useDeleteProjects(mockOnComplete));

    result.current([createMockProject({ id: 42 })]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    const signal = new AbortController().signal;
    await callArgs.actionFn(createMockProject({ id: 42 }), signal);

    expect(requestDelete).toHaveBeenCalledWith(expect.stringContaining('/projects/42/'), signal);
  });
});

describe('useCancelProjects', () => {
  const mockBulkAction = vi.fn();
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockBulkAction);
  });

  test('should return a cancel function', () => {
    const { result } = renderHook(() => useCancelProjects(mockOnComplete));

    expect(typeof result.current).toBe('function');
  });

  test('should call bulkAction with correct title', () => {
    const projects = [createMockProject({ status: 'running' })];
    const { result } = renderHook(() => useCancelProjects(mockOnComplete));

    result.current(projects);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.title).toMatch(/cancel project sync/i);
  });

  test('should include alertPrompts for non-running projects', () => {
    const projects = [
      createMockProject({ id: 1, name: 'Running', status: 'running' }),
      createMockProject({ id: 2, name: 'Successful', status: 'successful' }),
    ];
    const { result } = renderHook(() => useCancelProjects(mockOnComplete));

    result.current(projects);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.alertPrompts).toBeDefined();
    expect(callArgs.alertPrompts.length).toBeGreaterThan(0);
  });

  test('should include alertPrompts for projects without start permission', () => {
    const projects = [
      createMockProject({
        id: 1,
        name: 'No Permission',
        status: 'running',
        summary_fields: {
          ...createMockProject().summary_fields,
          user_capabilities: { edit: true, delete: true, start: false, schedule: true, copy: true },
        },
      }),
    ];
    const { result } = renderHook(() => useCancelProjects(mockOnComplete));

    result.current(projects);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.alertPrompts).toBeDefined();
    expect(callArgs.alertPrompts.length).toBeGreaterThan(0);
  });

  test('should not include alertPrompts when all projects are running and cancellable', () => {
    const projects = [
      createMockProject({ id: 1, name: 'Running 1', status: 'running' }),
      createMockProject({ id: 2, name: 'Running 2', status: 'pending' }),
    ];
    const { result } = renderHook(() => useCancelProjects(mockOnComplete));

    result.current(projects);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.alertPrompts).toBeUndefined();
  });

  test('should provide isItemNonActionable that returns reason for non-running project', () => {
    const projects = [createMockProject({ status: 'successful' })];
    const { result } = renderHook(() => useCancelProjects(mockOnComplete));

    result.current(projects);

    const callArgs = mockBulkAction.mock.calls[0][0];
    const reason = callArgs.isItemNonActionable(createMockProject({ status: 'successful' }));
    expect(reason).toMatch(/cannot be canceled/i);
  });

  test('should provide isItemNonActionable that returns empty for running project', () => {
    const projects = [createMockProject({ status: 'running' })];
    const { result } = renderHook(() => useCancelProjects(mockOnComplete));

    result.current(projects);

    const callArgs = mockBulkAction.mock.calls[0][0];
    const reason = callArgs.isItemNonActionable(createMockProject({ status: 'running' }));
    expect(reason).toBe('');
  });

  test('should provide actionFn that posts cancel to current_update endpoint', async () => {
    const mockPostRequest = vi.fn().mockResolvedValue(undefined);
    const { usePostRequest } = await import('@ansible/common-ui/crud/usePostRequest');
    vi.mocked(usePostRequest).mockReturnValue(mockPostRequest);

    const { result } = renderHook(() => useCancelProjects(mockOnComplete));

    const project = createMockProject({ status: 'running' });
    result.current([project]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    await callArgs.actionFn(project);

    expect(mockPostRequest).toHaveBeenCalledWith(
      expect.stringContaining('/project_updates/100/cancel/'),
      {}
    );
  });

  test('should pass onComplete to bulkAction', () => {
    const { result } = renderHook(() => useCancelProjects(mockOnComplete));

    result.current([createMockProject({ status: 'running' })]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.onComplete).toBe(mockOnComplete);
  });

  test('should handle projects with pending status as running', () => {
    const projects = [createMockProject({ status: 'pending' })];
    const { result } = renderHook(() => useCancelProjects(mockOnComplete));

    result.current(projects);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.alertPrompts).toBeUndefined();
  });

  test('should handle projects with waiting status as running', () => {
    const projects = [createMockProject({ status: 'waiting' })];
    const { result } = renderHook(() => useCancelProjects(mockOnComplete));

    result.current(projects);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.alertPrompts).toBeUndefined();
  });
});

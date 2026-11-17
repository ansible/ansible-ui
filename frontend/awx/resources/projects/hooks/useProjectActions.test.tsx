import {
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Project } from '../../../interfaces/Project';
import { useCancelProjects } from './useCancelProjects';
import { useDeleteProjects } from './useDeleteProjects';
import { useProjectActions } from './useProjectActions';

vi.mock('./useDeleteProjects');
vi.mock('./useCancelProjects');
vi.mock('@ansible/common-ui/crud/usePostRequest', () => ({
  usePostRequest: vi.fn(),
}));
vi.mock('@ansible/ansible-ui-framework', async () => ({
  ...(await vi.importActual('@ansible/ansible-ui-framework')),
  usePageNavigate: vi.fn(),
}));

function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    name: 'Demo',
    scm_type: 'git',
    status: 'successful',
    summary_fields: {
      user_capabilities: { edit: true, delete: true, copy: true, start: true },
    },
    ...overrides,
  } as Project;
}

describe('useProjectActions', () => {
  const mockPageNavigate = vi.fn();
  const mockDeleteProjects = vi.fn();
  const mockCancelProjects = vi.fn();
  const mockPostRequest = vi.fn().mockResolvedValue(undefined);
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePageNavigate).mockReturnValue(mockPageNavigate);
    vi.mocked(useDeleteProjects).mockReturnValue(mockDeleteProjects);
    vi.mocked(useCancelProjects).mockReturnValue(mockCancelProjects);
    vi.mocked(usePostRequest).mockReturnValue(mockPostRequest);
  });

  test('returns cancel, sync, edit, duplicate, separator, and delete actions', () => {
    const { result } = renderHook(() => useProjectActions(mockOnComplete));

    expect(result.current).toHaveLength(6);
    expect(result.current[2]).toMatchObject({
      type: PageActionType.Button,
      label: 'Edit project',
      selection: PageActionSelection.Single,
    });
    expect(result.current[5]).toMatchObject({
      type: PageActionType.Button,
      label: 'Delete project',
      isDanger: true,
    });
  });

  test('edit navigates to project edit route', () => {
    const { result } = renderHook(() => useProjectActions(mockOnComplete));
    const project = createMockProject({ id: 8 });
    const editAction = result.current[2];
    if ('onClick' in editAction && typeof editAction.onClick === 'function') {
      (editAction.onClick as (p: Project) => void)(project);
    }
    expect(mockPageNavigate).toHaveBeenCalledWith('awx-edit-project', { params: { id: 8 } });
  });

  test('delete passes project to delete hook', () => {
    const { result } = renderHook(() => useProjectActions(mockOnComplete));
    const project = createMockProject();
    const deleteAction = result.current[5];
    if ('onClick' in deleteAction && typeof deleteAction.onClick === 'function') {
      (deleteAction.onClick as (p: Project) => void)(project);
    }
    expect(mockDeleteProjects).toHaveBeenCalledWith([project]);
  });

  test('cancel sync hidden while project is not running', () => {
    const { result } = renderHook(() => useProjectActions(mockOnComplete));
    const project = createMockProject({ status: 'successful' });
    const cancelAction = result.current[0];
    if ('isHidden' in cancelAction && typeof cancelAction.isHidden === 'function') {
      expect((cancelAction.isHidden as (p: Project) => boolean)(project)).toBe(true);
    }
  });

  test('sync visible when project is not syncing and has scm type', () => {
    const { result } = renderHook(() => useProjectActions(mockOnComplete));
    const project = createMockProject({ status: 'successful', scm_type: 'git' });
    const syncAction = result.current[1];
    if ('isHidden' in syncAction && typeof syncAction.isHidden === 'function') {
      expect((syncAction.isHidden as (p: Project) => boolean)(project)).toBe(false);
    }
  });

  test('sync disabled for manual projects', () => {
    const { result } = renderHook(() => useProjectActions(mockOnComplete));
    const project = createMockProject({ scm_type: '', status: 'successful' });
    const syncAction = result.current[1];
    if ('isDisabled' in syncAction && typeof syncAction.isDisabled === 'function') {
      const reason = (syncAction.isDisabled as (p: Project) => string)(project);
      expect(reason).toMatch(/Cannot sync project/i);
    }
  });

  test('sync posts project update endpoint', () => {
    const { result } = renderHook(() => useProjectActions(mockOnComplete));
    const project = createMockProject({ id: 4, status: 'successful' });
    const syncAction = result.current[1];
    if ('onClick' in syncAction && typeof syncAction.onClick === 'function') {
      (syncAction.onClick as (p: Project) => void)(project);
    }
    expect(mockPostRequest).toHaveBeenCalledWith(expect.stringContaining('/projects/4/update/'), {
      id: 4,
    });
  });

  test('cancel sync shown when project is running', () => {
    const { result } = renderHook(() => useProjectActions(mockOnComplete));
    const project = createMockProject({ status: 'running' });
    const cancelAction = result.current[0];
    if ('isHidden' in cancelAction && typeof cancelAction.isHidden === 'function') {
      expect((cancelAction.isHidden as (p: Project) => boolean)(project)).toBe(false);
    }
  });
});

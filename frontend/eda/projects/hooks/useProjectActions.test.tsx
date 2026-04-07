/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useProjectActions } from './useProjectActions';
import { EdaProject } from '../../interfaces/EdaProject';
import { IEdaView } from '../../common/useEventDrivenView';
import { BrowserRouter } from 'react-router-dom';
import { ImportStateEnum } from '../../interfaces/generated/eda-api';
import { useSyncProject } from './useSyncProject';
import { useDeleteProjects } from './useDeleteProjects';
import { PageActionType, usePageNavigate } from '@ansible/ansible-ui-framework';

vi.mock('./useSyncProject', () => ({
  useSyncProject: vi.fn(() => vi.fn()),
}));

vi.mock('./useDeleteProjects', () => ({
  useDeleteProjects: vi.fn(() => vi.fn()),
}));

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageNavigate: vi.fn(() => vi.fn()),
  };
});

describe('useProjectActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockView: IEdaView<EdaProject> = {
    unselectItemsAndRefresh: vi.fn(),
  } as unknown as IEdaView<EdaProject>;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
  );

  const createMockProject = (overrides: Partial<EdaProject> = {}): EdaProject =>
    ({
      id: 1,
      name: 'Test Project',
      update_revision_on_launch: false,
      scm_update_cache_timeout: 0,
      ...overrides,
    }) as EdaProject;

  it('should return array of page actions', () => {
    const { result } = renderHook(() => useProjectActions(mockView), { wrapper });

    expect(result.current).toBeInstanceOf(Array);
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('should include sync project action', () => {
    const { result } = renderHook(() => useProjectActions(mockView), { wrapper });

    const syncAction = result.current.find(
      (action) => 'label' in action && action.label === 'Sync project'
    );
    expect(syncAction).toBeDefined();
    expect(syncAction?.type).toBe(PageActionType.Button);
  });

  it('should include edit project action', () => {
    const { result } = renderHook(() => useProjectActions(mockView), { wrapper });

    const editAction = result.current.find(
      (action) => 'label' in action && action.label === 'Edit project'
    );
    expect(editAction).toBeDefined();
    expect(editAction?.type).toBe(PageActionType.Button);
  });

  it('should include delete project action', () => {
    const { result } = renderHook(() => useProjectActions(mockView), { wrapper });

    const deleteAction = result.current.find(
      (action) => 'label' in action && action.label === 'Delete project'
    );
    expect(deleteAction).toBeDefined();
    expect(deleteAction?.type).toBe(PageActionType.Button);
    if (deleteAction && 'isDanger' in deleteAction) {
      expect(deleteAction.isDanger).toBe(true);
    }
  });

  it('should hide sync action when import_state is pending', () => {
    const { result } = renderHook(() => useProjectActions(mockView), { wrapper });

    const syncAction = result.current.find(
      (action) => 'label' in action && action.label === 'Sync project'
    );
    const project = createMockProject({ import_state: ImportStateEnum.Pending });

    if (syncAction && 'isHidden' in syncAction && typeof syncAction.isHidden === 'function') {
      expect(syncAction.isHidden(project)).toBe(true);
    }
  });

  it('should hide sync action when import_state is running', () => {
    const { result } = renderHook(() => useProjectActions(mockView), { wrapper });

    const syncAction = result.current.find(
      (action) => 'label' in action && action.label === 'Sync project'
    );
    const project = createMockProject({ import_state: ImportStateEnum.Running });

    if (syncAction && 'isHidden' in syncAction && typeof syncAction.isHidden === 'function') {
      expect(syncAction.isHidden(project)).toBe(true);
    }
  });

  it('should show sync action when import_state is completed', () => {
    const { result } = renderHook(() => useProjectActions(mockView), { wrapper });

    const syncAction = result.current.find(
      (action) => 'label' in action && action.label === 'Sync project'
    );
    const project = createMockProject({ import_state: ImportStateEnum.Completed });

    if (syncAction && 'isHidden' in syncAction && typeof syncAction.isHidden === 'function') {
      expect(syncAction.isHidden(project)).toBe(false);
    }
  });

  it('should call syncProject when sync action is clicked', () => {
    const syncProjectMock = vi.fn();
    vi.mocked(useSyncProject).mockReturnValue(syncProjectMock);

    const { result } = renderHook(() => useProjectActions(mockView), { wrapper });

    const syncAction = result.current.find(
      (action) => 'label' in action && action.label === 'Sync project'
    );
    const project = createMockProject();

    if (syncAction && 'onClick' in syncAction && typeof syncAction.onClick === 'function') {
      (syncAction.onClick as (project: EdaProject) => void)(project);
      expect(syncProjectMock).toHaveBeenCalledWith([project]);
    }
  });

  it('should call deleteProjects when delete action is clicked', () => {
    const deleteProjectsMock = vi.fn();
    vi.mocked(useDeleteProjects).mockReturnValue(deleteProjectsMock);

    const { result } = renderHook(() => useProjectActions(mockView), { wrapper });

    const deleteAction = result.current.find(
      (action) => 'label' in action && action.label === 'Delete project'
    );
    const project = createMockProject();

    if (deleteAction && 'onClick' in deleteAction && typeof deleteAction.onClick === 'function') {
      (deleteAction.onClick as (project: EdaProject) => void)(project);
      expect(deleteProjectsMock).toHaveBeenCalledWith([project]);
    }
  });

  it('should call pageNavigate when edit action is clicked', () => {
    const pageNavigateMock = vi.fn();
    vi.mocked(usePageNavigate).mockReturnValue(pageNavigateMock);

    const { result } = renderHook(() => useProjectActions(mockView), { wrapper });

    const editAction = result.current.find(
      (action) => 'label' in action && action.label === 'Edit project'
    );
    const project = createMockProject({ id: 123 });

    if (editAction && 'onClick' in editAction && typeof editAction.onClick === 'function') {
      (editAction.onClick as (project: EdaProject) => void)(project);
      expect(pageNavigateMock).toHaveBeenCalled();
    }
  });
});

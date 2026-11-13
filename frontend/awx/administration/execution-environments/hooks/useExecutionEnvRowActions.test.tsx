import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IPageAction, PageActionType, usePageNavigate } from '@ansible/ansible-ui-framework';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { useExecutionEnvRowActions } from './useExecutionEnvRowActions';
import { useDeleteExecutionEnvironments } from './useDeleteExecutionEnvironments';

vi.mock('./useDeleteExecutionEnvironments');
vi.mock('@ansible/common-ui/crud/usePostRequest', () => ({
  usePostRequest: vi.fn(() => vi.fn().mockResolvedValue({ id: 2, name: 'copy' })),
}));
vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageNavigate: vi.fn(),
    usePageAlertToaster: vi.fn(() => ({
      addAlert: vi.fn(),
      replaceAlert: vi.fn(),
    })),
  };
});

function createExecutionEnvironment(
  overrides: Partial<ExecutionEnvironment> = {}
): ExecutionEnvironment {
  return {
    id: 1,
    name: 'EE',
    managed: false,
    summary_fields: {
      user_capabilities: { edit: true, delete: true, copy: true },
    },
    ...overrides,
  } as ExecutionEnvironment;
}

function getActionByLabel(actions: ReturnType<typeof useExecutionEnvRowActions>, label: string) {
  return actions.find((action) => 'label' in action && action.label === label);
}

function getButtonActionByLabel(
  actions: IPageAction<ExecutionEnvironment>[],
  label: string
): Extract<IPageAction<ExecutionEnvironment>, { type: PageActionType.Button }> | undefined {
  return actions.find(
    (
      action
    ): action is Extract<IPageAction<ExecutionEnvironment>, { type: PageActionType.Button }> =>
      action.type === PageActionType.Button && 'label' in action && action.label === label
  );
}

describe('useExecutionEnvRowActions', () => {
  const mockNavigate = vi.fn();
  const mockDelete = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnCopy = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePageNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useDeleteExecutionEnvironments).mockReturnValue(mockDelete);
    vi.mocked(usePostRequest).mockReturnValue(
      vi.fn().mockResolvedValue({ id: 2, name: 'EE copy' })
    );
  });

  it('exposes edit, duplicate, and delete row actions', () => {
    const { result } = renderHook(() =>
      useExecutionEnvRowActions({ onDelete: mockOnDelete, onCopy: mockOnCopy })
    );

    expect(getActionByLabel(result.current, 'Edit execution environment')).toMatchObject({
      type: PageActionType.Button,
    });
    expect(getActionByLabel(result.current, 'Duplicate execution environment')).toBeDefined();
    expect(getActionByLabel(result.current, 'Delete execution environment')).toMatchObject({
      isDanger: true,
    });
  });

  it('navigates to edit on edit click', () => {
    const ee = createExecutionEnvironment();
    const { result } = renderHook(() =>
      useExecutionEnvRowActions({ onDelete: mockOnDelete, onCopy: mockOnCopy })
    );

    const editAction = getButtonActionByLabel(result.current, 'Edit execution environment');
    if (editAction && 'onClick' in editAction && typeof editAction.onClick === 'function') {
      (editAction.onClick as (item: ExecutionEnvironment) => void)(ee);
    }

    expect(mockNavigate).toHaveBeenCalled();
  });

  it('hides delete for managed execution environments', () => {
    const { result } = renderHook(() =>
      useExecutionEnvRowActions({ onDelete: mockOnDelete, onCopy: mockOnCopy })
    );

    const managed = createExecutionEnvironment({ managed: true });

    const hiddenAction = getButtonActionByLabel(result.current, 'Delete execution environment');
    if (hiddenAction && 'isHidden' in hiddenAction && typeof hiddenAction.isHidden === 'function') {
      expect(
        (hiddenAction.isHidden as (item: ExecutionEnvironment) => boolean | undefined)(managed)
      ).toBe(true);
    } else {
      throw new Error('expected delete action with isHidden');
    }
  });
});

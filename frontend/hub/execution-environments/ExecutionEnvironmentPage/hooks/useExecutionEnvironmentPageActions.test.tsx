/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { mockExecutionEnvironment } from '../../test/mockExecutionEnvironment';
import { useExecutionEnvironmentPageActions } from './useExecutionEnvironmentPageActions';

const mockNavigate = vi.fn();
const mockDelete = vi.fn();
const mockSign = vi.fn();
const mockSync = vi.fn();
let signOnComplete: (() => void) | undefined;
let syncOnComplete: (() => void) | undefined;

vi.mock('../../../common/utils/canSign', () => ({
  useCanSignEE: () => true,
}));

vi.mock('../../../common/useHubBulkConfirmation', () => ({
  useHubBulkConfirmation: () => vi.fn(),
}));

vi.mock('../../hooks/useExecutionEnvironmentsActions', () => ({
  useDeleteExecutionEnvironments: () => mockDelete,
  useSignExecutionEnvironments: (onComplete?: () => void) => {
    signOnComplete = onComplete;
    return mockSign;
  },
  useSyncExecutionEnvironments: (onComplete?: () => void) => {
    syncOnComplete = onComplete;
    return mockSync;
  },
}));

vi.mock('../../hooks/useController', () => ({
  useController: () => ({
    type: 'button',
    label: 'Use in Controller',
    onClick: vi.fn(),
  }),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => mockNavigate,
  };
});

function getAction(actions: ReturnType<typeof useExecutionEnvironmentPageActions>, label: string) {
  return actions.find((action) => 'label' in action && action.label === label);
}

function clickAction(action: ReturnType<typeof getAction>, item: typeof mockExecutionEnvironment) {
  if (action && 'onClick' in action) {
    (action.onClick as (item: typeof mockExecutionEnvironment) => unknown)(item);
  }
}

describe('useExecutionEnvironmentPageActions', () => {
  it('returns edit, sync, sign, controller, and delete actions', () => {
    const refresh = vi.fn();
    const { result } = renderHook(() => useExecutionEnvironmentPageActions({ refresh }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(getAction(result.current, 'Edit execution environment')).toBeDefined();
    expect(getAction(result.current, 'Sync execution environment')).toBeDefined();
    expect(getAction(result.current, 'Sign execution environment')).toBeDefined();
    expect(getAction(result.current, 'Use in Controller')).toBeDefined();
    expect(getAction(result.current, 'Delete execution environment')).toBeDefined();
  });

  it('navigates to edit route when edit is clicked', () => {
    const { result } = renderHook(() => useExecutionEnvironmentPageActions({}), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const edit = getAction(result.current, 'Edit execution environment');
    act(() => {
      clickAction(edit, mockExecutionEnvironment);
    });

    expect(mockNavigate).toHaveBeenCalled();
  });

  it('hides sync when EE has no remote', () => {
    const localEE = {
      ...mockExecutionEnvironment,
      pulp: {
        ...mockExecutionEnvironment.pulp!,
        repository: {
          ...mockExecutionEnvironment.pulp!.repository!,
          remote: undefined,
        },
      },
    };
    const { result } = renderHook(() => useExecutionEnvironmentPageActions({}), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const sync = getAction(result.current, 'Sync execution environment');
    const isHidden = sync && 'isHidden' in sync ? sync.isHidden : undefined;
    expect(isHidden?.(localEE)).toBe(true);
    expect(isHidden?.(mockExecutionEnvironment)).toBe(false);
  });

  it('disables sync while a sync task is running', () => {
    const syncingEE = {
      ...mockExecutionEnvironment,
      pulp: {
        ...mockExecutionEnvironment.pulp!,
        repository: {
          ...mockExecutionEnvironment.pulp!.repository!,
          remote: {
            ...mockExecutionEnvironment.pulp!.repository!.remote!,
            last_sync_task: { state: 'running' },
          },
        },
      },
    };
    const { result } = renderHook(() => useExecutionEnvironmentPageActions({}), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const sync = getAction(result.current, 'Sync execution environment');
    const isDisabled = sync && 'isDisabled' in sync ? sync.isDisabled : undefined;
    const disabledReason =
      typeof isDisabled === 'function'
        ? (isDisabled as (item: typeof mockExecutionEnvironment) => string | undefined)(syncingEE)
        : isDisabled;
    expect(disabledReason).toBe('Sync is already running.');
  });

  it('invokes bulk sign, sync, and delete handlers', () => {
    const { result } = renderHook(() => useExecutionEnvironmentPageActions({}), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      clickAction(
        getAction(result.current, 'Sign execution environment'),
        mockExecutionEnvironment
      );
      clickAction(
        getAction(result.current, 'Sync execution environment'),
        mockExecutionEnvironment
      );
      clickAction(
        getAction(result.current, 'Delete execution environment'),
        mockExecutionEnvironment
      );
    });

    expect(mockSign).toHaveBeenCalledWith([mockExecutionEnvironment]);
    expect(mockSync).toHaveBeenCalledWith([mockExecutionEnvironment]);
    expect(mockDelete).toHaveBeenCalledWith([mockExecutionEnvironment]);
  });

  it('wires refresh into sign and sync bulk action factories', () => {
    const refresh = vi.fn();
    const { result } = renderHook(() => useExecutionEnvironmentPageActions({ refresh }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      clickAction(
        getAction(result.current, 'Sign execution environment'),
        mockExecutionEnvironment
      );
      clickAction(
        getAction(result.current, 'Sync execution environment'),
        mockExecutionEnvironment
      );
    });

    expect(mockSign).toHaveBeenCalled();
    expect(mockSync).toHaveBeenCalled();
    signOnComplete?.();
    syncOnComplete?.();
    expect(refresh).toHaveBeenCalledTimes(2);
  });
});

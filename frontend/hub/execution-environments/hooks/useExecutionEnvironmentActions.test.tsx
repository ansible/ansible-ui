/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ExecutionEnvironment } from '../ExecutionEnvironment';
import { mockExecutionEnvironment } from '../test/mockExecutionEnvironment';
import { useExecutionEnvironmentActions } from './useExecutionEnvironmentActions';

const mockNavigate = vi.fn();
const mockDelete = vi.fn();
const mockSign = vi.fn();
const mockSync = vi.fn();

vi.mock('../../common/utils/canSign', () => ({
  useCanSignEE: () => true,
}));

vi.mock('../../common/useHubBulkConfirmation', () => ({
  useHubBulkConfirmation: () => vi.fn(),
}));

vi.mock('./useExecutionEnvironmentsActions', () => ({
  useDeleteExecutionEnvironments: () => mockDelete,
  useSignExecutionEnvironments: () => mockSign,
  useSyncExecutionEnvironments: () => mockSync,
}));

vi.mock('./useController', () => ({
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

function getAction(actions: ReturnType<typeof useExecutionEnvironmentActions>, label: string) {
  return actions.find((action) => 'label' in action && action.label === label);
}

function clickAction(action: ReturnType<typeof getAction>, item: ExecutionEnvironment) {
  if (action && 'onClick' in action) {
    (action.onClick as (item: ExecutionEnvironment) => unknown)(item);
  }
}

describe('useExecutionEnvironmentActions', () => {
  it('returns row actions including edit, sync, sign, and delete', () => {
    const { result } = renderHook(() => useExecutionEnvironmentActions(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(getAction(result.current, 'Edit execution environment')).toBeDefined();
    expect(getAction(result.current, 'Sync execution environment')).toBeDefined();
    expect(getAction(result.current, 'Sign execution environment')).toBeDefined();
    expect(getAction(result.current, 'Delete execution environment')).toBeDefined();
  });

  it('navigates to edit and invokes bulk handlers', () => {
    const { result } = renderHook(() => useExecutionEnvironmentActions(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      for (const label of [
        'Edit execution environment',
        'Sync execution environment',
        'Sign execution environment',
        'Delete execution environment',
      ]) {
        clickAction(getAction(result.current, label), mockExecutionEnvironment);
      }
    });

    expect(mockNavigate).toHaveBeenCalled();
    expect(mockSync).toHaveBeenCalledWith([mockExecutionEnvironment]);
    expect(mockSign).toHaveBeenCalledWith([mockExecutionEnvironment]);
    expect(mockDelete).toHaveBeenCalledWith([mockExecutionEnvironment]);
  });

  it('hides sync when remote is missing', () => {
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
    const { result } = renderHook(() => useExecutionEnvironmentActions(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const sync = getAction(result.current, 'Sync execution environment');
    const isHidden = sync && 'isHidden' in sync ? sync.isHidden : undefined;
    expect(isHidden?.(localEE)).toBe(true);
  });
});

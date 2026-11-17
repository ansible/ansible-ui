import {
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { renderHook } from '@testing-library/react';
import { useParams } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { InventorySource } from '../../../interfaces/InventorySource';
import { useCancelIventoryUpdate } from './useCancelInventoryUpdate';
import { useDeleteInventorySources } from './useDeleteInventorySources';
import { useInventorySourceActions } from './useInventorySourceActions';

vi.mock('./useDeleteInventorySources');
vi.mock('./useCancelInventoryUpdate');
vi.mock('@ansible/common-ui/crud/usePostRequest', () => ({
  usePostRequest: vi.fn(),
}));
vi.mock('../../../common/useAwxActiveUser');
vi.mock('@ansible/ansible-ui-framework', async () => ({
  ...(await vi.importActual('@ansible/ansible-ui-framework')),
  usePageNavigate: vi.fn(),
}));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

function createMockInventorySource(overrides: Partial<InventorySource> = {}): InventorySource {
  return {
    id: 1,
    name: 'Source A',
    inventory: 10,
    status: 'successful',
    type: 'inventory_source',
    summary_fields: {
      user_capabilities: { edit: true, delete: true, start: true, schedule: true },
      last_job: { id: 49, status: 'successful' },
      current_job: { id: 50, status: '' },
    },
    ...overrides,
  } as InventorySource;
}

describe('useInventorySourceActions', () => {
  const mockPageNavigate = vi.fn();
  const mockDeleteSources = vi.fn();
  const mockCancelUpdate = vi.fn();
  const mockPostRequest = vi.fn().mockResolvedValue(undefined);
  const mockOnDeleted = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePageNavigate).mockReturnValue(mockPageNavigate);
    vi.mocked(useDeleteInventorySources).mockReturnValue(mockDeleteSources);
    vi.mocked(useCancelIventoryUpdate).mockReturnValue(mockCancelUpdate);
    vi.mocked(usePostRequest).mockReturnValue(mockPostRequest);
    vi.mocked(useAwxActiveUser).mockReturnValue({
      activeAwxUser: { is_system_auditor: false },
    } as never);
    vi.mocked(useParams).mockReturnValue({ inventory_type: 'inventory' });
  });

  test('returns edit, separator, sync, cancel, and delete actions', () => {
    const { result } = renderHook(() =>
      useInventorySourceActions({
        onInventorySourcesDeleted: mockOnDeleted,
        onInvUpdateCanceled: mockOnCancel,
      })
    );

    expect(result.current.length).toBeGreaterThanOrEqual(5);
    expect(result.current[0]).toMatchObject({
      type: PageActionType.Button,
      label: 'Edit inventory source',
      selection: PageActionSelection.Single,
    });
    const deleteAction = result.current[result.current.length - 1];
    expect(deleteAction).toMatchObject({
      type: PageActionType.Button,
      label: 'Delete inventory source',
      isDanger: true,
    });
  });

  test('edit navigates with inventory and source ids', () => {
    const { result } = renderHook(() =>
      useInventorySourceActions({
        onInventorySourcesDeleted: mockOnDeleted,
        onInvUpdateCanceled: mockOnCancel,
      })
    );
    const source = createMockInventorySource({ id: 7, inventory: 3 });
    const editAction = result.current[0];
    if ('onClick' in editAction && typeof editAction.onClick === 'function') {
      (editAction.onClick as (s: InventorySource) => void)(source);
    }
    expect(mockPageNavigate).toHaveBeenCalledWith('awx-edit-inventory-source', {
      params: { id: 3, inventory_type: 'inventory', source_id: 7 },
    });
  });

  test('sync hidden when job is running', () => {
    const { result } = renderHook(() =>
      useInventorySourceActions({
        onInventorySourcesDeleted: mockOnDeleted,
        onInvUpdateCanceled: mockOnCancel,
      })
    );
    const source = createMockInventorySource({
      summary_fields: {
        user_capabilities: { edit: true, delete: true, start: true, schedule: true },
        current_job: { id: 1, status: 'running' },
      },
    } as Partial<InventorySource>);
    const syncAction = result.current[2];
    if ('isHidden' in syncAction && typeof syncAction.isHidden === 'function') {
      expect((syncAction.isHidden as (s: InventorySource) => boolean)(source)).toBe(true);
    }
  });

  test('cancel update visible when job is running', () => {
    const { result } = renderHook(() =>
      useInventorySourceActions({
        onInventorySourcesDeleted: mockOnDeleted,
        onInvUpdateCanceled: mockOnCancel,
      })
    );
    const source = createMockInventorySource({
      summary_fields: {
        user_capabilities: { edit: true, delete: true, start: true, schedule: true },
        current_job: { id: 1, status: 'running' },
      },
    } as Partial<InventorySource>);
    const cancelAction = result.current[3];
    if ('isHidden' in cancelAction && typeof cancelAction.isHidden === 'function') {
      expect((cancelAction.isHidden as (s: InventorySource) => boolean)(source)).toBe(false);
    }
  });

  test('delete disabled when source status is running', () => {
    const { result } = renderHook(() =>
      useInventorySourceActions({
        onInventorySourcesDeleted: mockOnDeleted,
        onInvUpdateCanceled: mockOnCancel,
      })
    );
    const deleteAction = result.current[result.current.length - 1];
    const running = createMockInventorySource({ status: 'running' });
    if ('isDisabled' in deleteAction && typeof deleteAction.isDisabled === 'function') {
      const reason = (deleteAction.isDisabled as (s: InventorySource) => string)(running);
      expect(reason).toMatch(/currently running/i);
    }
  });

  test('sync posts update endpoint', () => {
    const { result } = renderHook(() =>
      useInventorySourceActions({
        onInventorySourcesDeleted: mockOnDeleted,
        onInvUpdateCanceled: mockOnCancel,
      })
    );
    const source = createMockInventorySource({ id: 15 });
    const syncAction = result.current[2];
    if ('onClick' in syncAction && typeof syncAction.onClick === 'function') {
      (syncAction.onClick as (s: InventorySource) => void)(source);
    }
    expect(mockPostRequest).toHaveBeenCalledWith(
      expect.stringContaining('/inventory_sources/15/update/'),
      {}
    );
  });
});

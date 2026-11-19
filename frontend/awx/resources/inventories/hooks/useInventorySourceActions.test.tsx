import {
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { renderHook } from '@testing-library/react';
import { useParams } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const alertMocks = vi.hoisted(() => ({ addAlert: vi.fn() }));
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
  usePageAlertToaster: () => ({ addAlert: alertMocks.addAlert }),
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

  function renderActions() {
    return renderHook(() =>
      useInventorySourceActions({
        onInventorySourcesDeleted: mockOnDeleted,
        onInvUpdateCanceled: mockOnCancel,
      })
    );
  }

  function button(actions: ReturnType<typeof useInventorySourceActions>, label: string) {
    return actions.find(
      (action) =>
        action.type === PageActionType.Button && 'label' in action && action.label === label
    );
  }

  test('hides sync and cancel based on permissions and the latest job status', () => {
    const { result } = renderActions();
    const sync = button(result.current, 'Sync inventory source');
    const cancel = button(result.current, 'Cancel inventory update');
    const edit = button(result.current, 'Edit inventory source');
    const remove = button(result.current, 'Delete inventory source');
    const capabilities = { edit: true, delete: true, start: true, schedule: true };

    const noJob = createMockInventorySource({
      summary_fields: { user_capabilities: capabilities },
    } as Partial<InventorySource>);
    expect(
      sync && 'isHidden' in sync && typeof sync.isHidden === 'function'
        ? (sync.isHidden as (item: InventorySource) => boolean)(noJob)
        : true
    ).toBe(false);
    expect(
      cancel && 'isHidden' in cancel && typeof cancel.isHidden === 'function'
        ? (cancel.isHidden as (item: InventorySource) => boolean)(noJob)
        : false
    ).toBe(true);

    const lastRunning = createMockInventorySource({
      summary_fields: {
        user_capabilities: capabilities,
        last_job: { id: 2, status: 'pending' },
      },
    } as Partial<InventorySource>);
    expect(
      sync && 'isHidden' in sync && typeof sync.isHidden === 'function'
        ? (sync.isHidden as (item: InventorySource) => boolean)(lastRunning)
        : false
    ).toBe(true);
    expect(
      cancel && 'isHidden' in cancel && typeof cancel.isHidden === 'function'
        ? (cancel.isHidden as (item: InventorySource) => boolean)(lastRunning)
        : true
    ).toBe(false);

    const lastSuccessful = createMockInventorySource({
      summary_fields: {
        user_capabilities: { ...capabilities, start: false, edit: false, delete: false },
        last_job: { id: 3, status: 'successful' },
      },
    } as Partial<InventorySource>);
    expect(
      sync && 'isHidden' in sync && typeof sync.isHidden === 'function'
        ? (sync.isHidden as (item: InventorySource) => boolean)(lastSuccessful)
        : false
    ).toBe(true);
    expect(
      sync && 'isDisabled' in sync && typeof sync.isDisabled === 'function'
        ? (sync.isDisabled as (item: InventorySource) => string)(lastSuccessful)
        : ''
    ).toMatch(/insufficient permission/);
    expect(
      edit && 'isDisabled' in edit && typeof edit.isDisabled === 'function'
        ? (edit.isDisabled as (item: InventorySource) => string)(lastSuccessful)
        : ''
    ).toMatch(/insufficient permission/);
    expect(
      edit && 'isDisabled' in edit && typeof edit.isDisabled === 'function'
        ? (edit.isDisabled as (item: InventorySource) => string)(noJob)
        : 'x'
    ).toBe('');
    expect(
      remove && 'isDisabled' in remove && typeof remove.isDisabled === 'function'
        ? (remove.isDisabled as (item: InventorySource) => string)(lastSuccessful)
        : ''
    ).toMatch(/insufficient permission/);
    expect(
      remove && 'isDisabled' in remove && typeof remove.isDisabled === 'function'
        ? (remove.isDisabled as (item: InventorySource) => string)(noJob)
        : 'x'
    ).toBe('');
  });

  test('allows a system auditor to delete a source they cannot otherwise delete', () => {
    vi.mocked(useAwxActiveUser).mockReturnValue({
      activeAwxUser: { is_system_auditor: true },
    } as never);
    const { result } = renderActions();
    const remove = button(result.current, 'Delete inventory source');
    const source = createMockInventorySource({
      summary_fields: {
        user_capabilities: { edit: true, delete: false, start: true, schedule: true },
      },
    } as Partial<InventorySource>);
    expect(
      remove && 'isDisabled' in remove && typeof remove.isDisabled === 'function'
        ? (remove.isDisabled as (item: InventorySource) => string)(source)
        : 'x'
    ).toBe('');
  });

  test('cancels and deletes through the row actions', () => {
    const { result } = renderActions();
    const source = createMockInventorySource();
    const cancel = button(result.current, 'Cancel inventory update');
    const remove = button(result.current, 'Delete inventory source');
    if (cancel && 'onClick' in cancel && typeof cancel.onClick === 'function') {
      (cancel.onClick as (item: InventorySource) => void)(source);
    }
    if (remove && 'onClick' in remove && typeof remove.onClick === 'function') {
      (remove.onClick as (item: InventorySource) => void)(source);
    }
    expect(mockCancelUpdate).toHaveBeenCalledWith([source]);
    expect(mockDeleteSources).toHaveBeenCalledWith([source]);
  });

  test('alerts when the inventory source sync fails', async () => {
    mockPostRequest.mockRejectedValueOnce(new Error('boom'));
    const { result } = renderActions();
    const source = createMockInventorySource({ id: 15 });
    const sync = button(result.current, 'Sync inventory source');
    if (sync && 'onClick' in sync && typeof sync.onClick === 'function') {
      await (sync.onClick as (item: InventorySource) => Promise<void>)(source);
    }
    expect(alertMocks.addAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'danger',
        title: 'Failed to update inventory source',
        children: 'boom',
      })
    );

    mockPostRequest.mockRejectedValueOnce('nope');
    if (sync && 'onClick' in sync && typeof sync.onClick === 'function') {
      await (sync.onClick as (item: InventorySource) => Promise<void>)(source);
    }
    expect(alertMocks.addAlert).toHaveBeenCalledWith(expect.objectContaining({ children: false }));
  });
});

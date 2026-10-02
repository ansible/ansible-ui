/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useDeleteInventories } from './useDeleteInventories';
import { useDeleteInventorySources } from './useDeleteInventorySources';
import { useCopyInventory } from './useCopyInventory';
import { useCancelIventoryUpdate } from './useCancelInventoryUpdate';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { Inventory } from '../../../interfaces/Inventory';
import { InventorySource } from '../../../interfaces/InventorySource';

vi.mock('../../../common/useAwxBulkConfirmation');
vi.mock('@ansible/common-ui/crud/Data');
vi.mock('@ansible/common-ui/crud/usePostRequest', () => ({
  usePostRequest: vi.fn(() => vi.fn().mockResolvedValue(undefined)),
}));
const mockAddAlert = vi.fn();
const mockReplaceAlert = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    usePageAlertToaster: vi.fn(() => ({
      addAlert: mockAddAlert,
      replaceAlert: mockReplaceAlert,
    })),
  };
});
vi.mock('./useInventoriesColumns', () => ({
  useInventoriesColumns: vi.fn(() => []),
}));
vi.mock('./useInventorySourceColumns', () => ({
  useInventorySourceColumns: vi.fn(() => []),
}));
vi.mock('@ansible/common-ui/columns', () => ({
  useNameColumn: vi.fn(() => ({ header: 'Name' })),
}));

function createMockInventory(overrides: Partial<Inventory> = {}): Inventory {
  return {
    id: 1,
    name: 'Inventory A',
    type: 'inventory',
    summary_fields: {
      user_capabilities: { edit: true, delete: true, copy: true },
    },
    ...overrides,
  } as Inventory;
}

function createMockInventorySource(overrides: Partial<InventorySource> = {}): InventorySource {
  return {
    id: 1,
    name: 'Source A',
    type: 'inventory_source',
    summary_fields: {
      user_capabilities: { edit: true, delete: true, start: true, schedule: true },
      current_job: { id: 50, status: 'running' },
      last_job: { id: 49, status: 'successful' },
    },
    ...overrides,
  } as InventorySource;
}

describe('useDeleteInventories', () => {
  const mockBulkAction = vi.fn();
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockBulkAction);
  });

  test('should return a delete function', () => {
    const { result } = renderHook(() => useDeleteInventories(mockOnComplete));

    expect(typeof result.current).toBe('function');
  });

  test('should call bulkAction with correct title', () => {
    const inventories = [
      createMockInventory(),
      createMockInventory({ id: 2, name: 'Inventory B' }),
    ];
    const { result } = renderHook(() => useDeleteInventories(mockOnComplete));

    result.current(inventories);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.title).toMatch(/permanently delete inventories/i);
  });

  test('should mark as danger', () => {
    const { result } = renderHook(() => useDeleteInventories(mockOnComplete));

    result.current([createMockInventory()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.isDanger).toBe(true);
  });

  test('should pass onComplete callback', () => {
    const { result } = renderHook(() => useDeleteInventories(mockOnComplete));

    result.current([createMockInventory()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.onComplete).toBe(mockOnComplete);
  });

  test('should include alertPrompts for undeletable inventories', () => {
    const inventories = [
      createMockInventory({ id: 1, name: 'Deletable' }),
      createMockInventory({
        id: 2,
        name: 'Undeletable',
        summary_fields: { user_capabilities: { edit: true, delete: false, copy: true } },
      } as Partial<Inventory>),
    ];
    const { result } = renderHook(() => useDeleteInventories(mockOnComplete));

    result.current(inventories);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.alertPrompts).toBeDefined();
    expect(callArgs.alertPrompts.length).toBeGreaterThan(0);
  });

  test('should not include alertPrompts when all are deletable', () => {
    const inventories = [createMockInventory(), createMockInventory({ id: 2, name: 'B' })];
    const { result } = renderHook(() => useDeleteInventories(mockOnComplete));

    result.current(inventories);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.alertPrompts).toBeUndefined();
  });

  test('should provide isItemNonActionable that returns reason for undeletable', () => {
    const { result } = renderHook(() => useDeleteInventories(mockOnComplete));

    result.current([createMockInventory()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    const undeletable = createMockInventory({
      summary_fields: { user_capabilities: { edit: true, delete: false, copy: true } },
    } as Partial<Inventory>);
    const reason = callArgs.isItemNonActionable(undeletable);
    expect(reason).toMatch(/cannot be deleted/i);
  });

  test('should provide isItemNonActionable that returns undefined for deletable', () => {
    const { result } = renderHook(() => useDeleteInventories(mockOnComplete));

    result.current([createMockInventory()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    const reason = callArgs.isItemNonActionable(createMockInventory());
    expect(reason).toBeUndefined();
  });

  test('should provide actionFn that calls requestDelete with correct URL', async () => {
    const { requestDelete } = await import('@ansible/common-ui/crud/Data');
    vi.mocked(requestDelete).mockResolvedValue(undefined);
    const { result } = renderHook(() => useDeleteInventories(mockOnComplete));

    result.current([createMockInventory({ id: 77 })]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    const signal = new AbortController().signal;
    await callArgs.actionFn(createMockInventory({ id: 77 }), signal);

    expect(requestDelete).toHaveBeenCalledWith(expect.stringContaining('/inventories/77/'), signal);
  });

  test('should sort inventories by name', () => {
    const inventories = [
      createMockInventory({ id: 1, name: 'Zulu' }),
      createMockInventory({ id: 2, name: 'Alpha' }),
    ];
    const { result } = renderHook(() => useDeleteInventories(mockOnComplete));

    result.current(inventories);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.items[0].name).toBe('Alpha');
    expect(callArgs.items[1].name).toBe('Zulu');
  });
});

describe('useDeleteInventorySources', () => {
  const mockBulkAction = vi.fn();
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockBulkAction);
  });

  test('should return a delete function', () => {
    const { result } = renderHook(() => useDeleteInventorySources(mockOnComplete));

    expect(typeof result.current).toBe('function');
  });

  test('should call bulkAction with correct title', () => {
    const sources = [createMockInventorySource()];
    const { result } = renderHook(() => useDeleteInventorySources(mockOnComplete));

    result.current(sources);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.title).toMatch(/permanently delete inventory source/i);
  });

  test('should mark as danger', () => {
    const { result } = renderHook(() => useDeleteInventorySources(mockOnComplete));

    result.current([createMockInventorySource()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.isDanger).toBe(true);
  });

  test('should include alertPrompts for undeletable sources', () => {
    const sources = [
      createMockInventorySource({
        id: 2,
        name: 'Undeletable',
        summary_fields: {
          user_capabilities: { edit: true, delete: false, start: true, schedule: true },
          current_job: { id: 50, status: 'running' },
          last_job: { id: 49, status: 'successful' },
        },
      } as Partial<InventorySource>),
    ];
    const { result } = renderHook(() => useDeleteInventorySources(mockOnComplete));

    result.current(sources);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.alertPrompts).toBeDefined();
  });

  test('should provide isItemNonActionable', () => {
    const { result } = renderHook(() => useDeleteInventorySources(mockOnComplete));

    result.current([createMockInventorySource()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    const undeletable = createMockInventorySource({
      summary_fields: {
        user_capabilities: { edit: true, delete: false, start: true, schedule: true },
        current_job: { id: 50, status: 'running' },
        last_job: { id: 49, status: 'successful' },
      },
    } as Partial<InventorySource>);
    const reason = callArgs.isItemNonActionable(undeletable);
    expect(reason).toMatch(/cannot be deleted/i);
  });

  test('should provide actionFn with correct URL', async () => {
    const { requestDelete } = await import('@ansible/common-ui/crud/Data');
    vi.mocked(requestDelete).mockResolvedValue(undefined);
    const { result } = renderHook(() => useDeleteInventorySources(mockOnComplete));

    result.current([createMockInventorySource({ id: 33 })]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    const signal = new AbortController().signal;
    await callArgs.actionFn(createMockInventorySource({ id: 33 }), signal);

    expect(requestDelete).toHaveBeenCalledWith(
      expect.stringContaining('/inventory_sources/33/'),
      signal
    );
  });
});

describe('useCopyInventory', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return a copy function', () => {
    const { result } = renderHook(() => useCopyInventory(mockOnComplete));

    expect(typeof result.current).toBe('function');
  });

  test('should post to inventories copy endpoint', async () => {
    const mockPostRequest = vi.fn().mockResolvedValue(undefined);
    const { usePostRequest } = await import('@ansible/common-ui/crud/usePostRequest');
    vi.mocked(usePostRequest).mockReturnValue(mockPostRequest);

    const { result } = renderHook(() => useCopyInventory(mockOnComplete));

    result.current(createMockInventory({ id: 12, name: 'My Inv' }));

    expect(mockPostRequest).toHaveBeenCalledWith(
      expect.stringContaining('/inventories/12/copy/'),
      expect.objectContaining({ name: expect.stringContaining('My Inv') })
    );
  });

  test('should add success alert on successful copy', async () => {
    const mockPostRequest = vi.fn().mockResolvedValue(undefined);
    const { usePostRequest } = await import('@ansible/common-ui/crud/usePostRequest');
    vi.mocked(usePostRequest).mockReturnValue(mockPostRequest);

    const { result } = renderHook(() => useCopyInventory(mockOnComplete));

    result.current(createMockInventory({ id: 1, name: 'Test' }));

    await vi.waitFor(() => {
      expect(mockAddAlert).toHaveBeenCalledWith(expect.objectContaining({ variant: 'success' }));
    });
  });

  test('should replace alert with danger on failure', async () => {
    const mockPostRequest = vi.fn().mockRejectedValue(new Error('Copy failed'));
    const { usePostRequest } = await import('@ansible/common-ui/crud/usePostRequest');
    vi.mocked(usePostRequest).mockReturnValue(mockPostRequest);

    const { result } = renderHook(() => useCopyInventory(mockOnComplete));

    result.current(createMockInventory({ id: 1, name: 'Test' }));

    await vi.waitFor(() => {
      expect(mockReplaceAlert).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ variant: 'danger' })
      );
    });
  });

  test('should call onComplete after successful copy', async () => {
    const mockPostRequest = vi.fn().mockResolvedValue(undefined);
    const { usePostRequest } = await import('@ansible/common-ui/crud/usePostRequest');
    vi.mocked(usePostRequest).mockReturnValue(mockPostRequest);

    const { result } = renderHook(() => useCopyInventory(mockOnComplete));

    result.current(createMockInventory({ id: 1, name: 'Test' }));

    await vi.waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });

  test('should call onComplete after failed copy', async () => {
    const mockPostRequest = vi.fn().mockRejectedValue(new Error('fail'));
    const { usePostRequest } = await import('@ansible/common-ui/crud/usePostRequest');
    vi.mocked(usePostRequest).mockReturnValue(mockPostRequest);

    const { result } = renderHook(() => useCopyInventory(mockOnComplete));

    result.current(createMockInventory({ id: 1, name: 'Test' }));

    await vi.waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });
});

describe('useCancelIventoryUpdate', () => {
  const mockBulkAction = vi.fn();
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockBulkAction);
  });

  test('should return a cancel function', () => {
    const { result } = renderHook(() => useCancelIventoryUpdate(mockOnComplete));

    expect(typeof result.current).toBe('function');
  });

  test('should call bulkAction with correct title', () => {
    const sources = [createMockInventorySource()];
    const { result } = renderHook(() => useCancelIventoryUpdate(mockOnComplete));

    result.current(sources);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.title).toMatch(/cancel inventory update/i);
  });

  test('should mark as danger', () => {
    const { result } = renderHook(() => useCancelIventoryUpdate(mockOnComplete));

    result.current([createMockInventorySource()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.isDanger).toBe(true);
  });

  test('should pass onComplete', () => {
    const { result } = renderHook(() => useCancelIventoryUpdate(mockOnComplete));

    result.current([createMockInventorySource()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.onComplete).toBe(mockOnComplete);
  });

  test('should provide actionFn that posts cancel to current_job endpoint', async () => {
    const mockPostRequest = vi.fn().mockResolvedValue(undefined);
    const { usePostRequest } = await import('@ansible/common-ui/crud/usePostRequest');
    vi.mocked(usePostRequest).mockReturnValue(mockPostRequest);

    const { result } = renderHook(() => useCancelIventoryUpdate(mockOnComplete));
    const source = createMockInventorySource({
      summary_fields: {
        user_capabilities: { edit: true, delete: true, start: true, schedule: true },
        current_job: { id: 50, status: 'running' },
        last_job: { id: 49, status: 'successful' },
      },
    } as Partial<InventorySource>);

    result.current([source]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    const signal = new AbortController().signal;
    await callArgs.actionFn(source, signal);

    expect(mockPostRequest).toHaveBeenCalledWith(
      expect.stringContaining('/inventory_updates/50/cancel/'),
      signal
    );
  });

  test('should fall back to last_job if no current_job', async () => {
    const mockPostRequest = vi.fn().mockResolvedValue(undefined);
    const { usePostRequest } = await import('@ansible/common-ui/crud/usePostRequest');
    vi.mocked(usePostRequest).mockReturnValue(mockPostRequest);

    const { result } = renderHook(() => useCancelIventoryUpdate(mockOnComplete));
    const source = createMockInventorySource({
      summary_fields: {
        user_capabilities: { edit: true, delete: true, start: true, schedule: true },
        last_job: { id: 99, status: 'running' },
      },
    } as unknown as Partial<InventorySource>);

    result.current([source]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    const signal = new AbortController().signal;
    await callArgs.actionFn(source, signal);

    expect(mockPostRequest).toHaveBeenCalledWith(
      expect.stringContaining('/inventory_updates/99/cancel/'),
      signal
    );
  });

  test('should sort sources by name', () => {
    const sources = [
      createMockInventorySource({ id: 1, name: 'Zulu' }),
      createMockInventorySource({ id: 2, name: 'Alpha' }),
    ];
    const { result } = renderHook(() => useCancelIventoryUpdate(mockOnComplete));

    result.current(sources);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.items[0].name).toBe('Alpha');
    expect(callArgs.items[1].name).toBe('Zulu');
  });
});

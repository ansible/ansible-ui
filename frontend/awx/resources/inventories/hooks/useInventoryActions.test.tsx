import {
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import { useParams } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { InventoryWithSource } from '../InventoryPage/InventoryDetails';
import { useCopyInventory } from './useCopyInventory';
import { useDeleteInventories } from './useDeleteInventories';
import { useInventoryActions } from './useInventoryActions';
import { Inventory } from '../../../interfaces/Inventory';

vi.mock('./useDeleteInventories');
vi.mock('./useCopyInventory');
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

function createMockInventory(overrides: Partial<Inventory> = {}): Inventory {
  return {
    id: 1,
    name: 'Inventory A',
    kind: '',
    type: 'inventory',
    has_inventory_sources: false,
    summary_fields: {
      user_capabilities: { edit: true, delete: true, copy: true },
    },
    ...overrides,
  } as Inventory;
}

function createInventoryWithSource(
  overrides: Partial<InventoryWithSource> = {}
): InventoryWithSource {
  return {
    ...createMockInventory(),
    source: {
      id: 5,
      summary_fields: {
        user_capabilities: { start: true },
        last_job: { status: 'successful', id: 1 },
      },
    },
    ...overrides,
  } as InventoryWithSource;
}

describe('useInventoryActions', () => {
  const mockPageNavigate = vi.fn();
  const mockDeleteInventories = vi.fn();
  const mockCopyInventory = vi.fn();
  const mockOnDeleted = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePageNavigate).mockReturnValue(mockPageNavigate);
    vi.mocked(useDeleteInventories).mockReturnValue(mockDeleteInventories);
    vi.mocked(useCopyInventory).mockReturnValue(mockCopyInventory);
    vi.mocked(useParams).mockReturnValue({ inventory_type: 'inventory' });
  });

  test('returns edit, duplicate, sync, cancel, separator, and delete actions', () => {
    const { result } = renderHook(() =>
      useInventoryActions({
        onInventoriesDeleted: mockOnDeleted,
        detail: false,
      })
    );

    expect(result.current).toHaveLength(6);
    expect(result.current[0]).toMatchObject({
      type: PageActionType.Button,
      label: 'Edit inventory',
      selection: PageActionSelection.Single,
    });
    expect(result.current[4]).toMatchObject({ type: PageActionType.Seperator });
    expect(result.current[5]).toMatchObject({
      type: PageActionType.Button,
      label: 'Delete inventory',
      isDanger: true,
    });
  });

  test('wires delete and copy hooks with callbacks', () => {
    const onCopied = vi.fn();
    renderHook(() =>
      useInventoryActions({
        onInventoriesDeleted: mockOnDeleted,
        onInventoryCopied: onCopied,
        detail: false,
      })
    );

    expect(useDeleteInventories).toHaveBeenCalledWith(mockOnDeleted);
    expect(useCopyInventory).toHaveBeenCalledWith(onCopied);
  });

  test('edit navigates with inventory kind mapped to route param', () => {
    const { result } = renderHook(() =>
      useInventoryActions({ onInventoriesDeleted: mockOnDeleted, detail: false })
    );
    const inventory = createMockInventory({ id: 9, kind: 'smart' });
    const editAction = result.current[0];
    if ('onClick' in editAction && typeof editAction.onClick === 'function') {
      (editAction.onClick as (inv: Inventory) => void)(inventory);
    }
    expect(mockPageNavigate).toHaveBeenCalledWith('awx-edit-inventory', {
      params: { inventory_type: 'smart_inventory', id: 9 },
    });
  });

  test('duplicate invokes copy when permitted', () => {
    const { result } = renderHook(() =>
      useInventoryActions({ onInventoriesDeleted: mockOnDeleted, detail: false })
    );
    const inventory = createMockInventory();
    const duplicateAction = result.current[1];
    if ('onClick' in duplicateAction && typeof duplicateAction.onClick === 'function') {
      (duplicateAction.onClick as (inv: Inventory) => void)(inventory);
    }
    expect(mockCopyInventory).toHaveBeenCalledWith(inventory);
  });

  test('duplicate is disabled when inventory has sources', () => {
    const { result } = renderHook(() =>
      useInventoryActions({ onInventoriesDeleted: mockOnDeleted, detail: false })
    );
    const duplicateAction = result.current[1];
    const withSources = createMockInventory({ has_inventory_sources: true });
    if ('isDisabled' in duplicateAction && typeof duplicateAction.isDisabled === 'function') {
      const reason = (duplicateAction.isDisabled as (inv: Inventory) => string)(withSources);
      expect(reason).toMatch(/cannot be duplicated/i);
    }
  });

  test('delete invokes bulk delete with single inventory', () => {
    const { result } = renderHook(() =>
      useInventoryActions({ onInventoriesDeleted: mockOnDeleted, detail: false })
    );
    const inventory = createMockInventory({ id: 3 });
    const deleteAction = result.current[5];
    if ('onClick' in deleteAction && typeof deleteAction.onClick === 'function') {
      (deleteAction.onClick as (inv: Inventory) => void)(inventory);
    }
    expect(mockDeleteInventories).toHaveBeenCalledWith([inventory]);
  });

  test('sync action hidden outside constructed inventory detail', () => {
    const { result } = renderHook(() =>
      useInventoryActions({ onInventoriesDeleted: mockOnDeleted, detail: true })
    );
    const syncAction = result.current[2];
    const inventory = createInventoryWithSource();
    if ('isHidden' in syncAction && typeof syncAction.isHidden === 'function') {
      expect((syncAction.isHidden as (inv: InventoryWithSource) => boolean)(inventory)).toBe(true);
    }
  });

  test('sync action visible on constructed inventory detail when job not running', () => {
    vi.mocked(useParams).mockReturnValue({ inventory_type: 'constructed_inventory' });
    const { result } = renderHook(() =>
      useInventoryActions({ onInventoriesDeleted: mockOnDeleted, detail: true })
    );
    const syncAction = result.current[2];
    const inventory = createInventoryWithSource({
      source: {
        id: 5,
        summary_fields: {
          user_capabilities: { start: true },
          last_job: { status: 'successful', id: 1 },
        },
      },
    } as Partial<InventoryWithSource>);
    if ('isHidden' in syncAction && typeof syncAction.isHidden === 'function') {
      expect((syncAction.isHidden as (inv: InventoryWithSource) => boolean)(inventory)).toBe(false);
    }
  });
});

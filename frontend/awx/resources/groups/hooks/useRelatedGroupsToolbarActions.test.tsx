import {
  PageActionSelection,
  PageActionType,
  usePageDialog,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { renderHook } from '@testing-library/react';
import { useParams } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { IAwxView } from '../../../common/useAwxView';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { useDisassociateGroups } from './useDisassociateGroups';
import { useRelatedGroupsToolbarActions } from './useRelatedGroupsToolbarActions';

const mockRunCommandAction = {
  type: PageActionType.Button,
  label: 'Run command',
  selection: PageActionSelection.None,
};

vi.mock('../../inventories/hooks/useInventoriesGroupsToolbarActions', () => ({
  useRunCommandAction: vi.fn(() => mockRunCommandAction),
}));
vi.mock('./useDisassociateGroups');
vi.mock('@ansible/common-ui/crud/useOptions');
vi.mock('@ansible/common-ui/crud/usePostRequest', () => ({
  usePostRequest: vi.fn(() => vi.fn().mockResolvedValue(undefined)),
}));
vi.mock('@ansible/ansible-ui-framework', async () => ({
  ...(await vi.importActual('@ansible/ansible-ui-framework')),
  usePageNavigate: vi.fn(),
  usePageDialog: vi.fn(),
}));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

function createMockView(selectedCount = 0): IAwxView<InventoryGroup> {
  return {
    selectedItems: selectedCount > 0 ? ([{ id: 1, name: 'g1' }] as InventoryGroup[]) : [],
    refresh: vi.fn(),
    unselectItemsAndRefresh: vi.fn(),
  } as unknown as IAwxView<InventoryGroup>;
}

describe('useRelatedGroupsToolbarActions', () => {
  const mockPageNavigate = vi.fn();
  const mockSetDialog = vi.fn();
  const mockDisassociate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePageNavigate).mockReturnValue(mockPageNavigate);
    vi.mocked(usePageDialog).mockReturnValue([undefined, mockSetDialog]);
    vi.mocked(useDisassociateGroups).mockReturnValue(mockDisassociate);
    vi.mocked(useOptions).mockReturnValue({ data: { actions: { POST: {} } } } as never);
    vi.mocked(useParams).mockReturnValue({
      id: '1',
      inventory_type: 'inventory',
      group_id: '2',
    });
  });

  test('includes add group, run command, and disassociate for inventory', () => {
    const { result } = renderHook(() => useRelatedGroupsToolbarActions(createMockView(1)));

    expect(result.current[0]).toMatchObject({
      type: PageActionType.Dropdown,
      label: 'Add group',
    });
    expect(result.current[1]).toBe(mockRunCommandAction);
    const disassociate = result.current.find(
      (a) => 'label' in a && a.label === 'Disassociate groups'
    );
    expect(disassociate).toBeDefined();
  });

  test('omits add and disassociate for constructed inventory', () => {
    vi.mocked(useParams).mockReturnValue({
      id: '1',
      inventory_type: 'constructed_inventory',
      group_id: '2',
    });
    const { result } = renderHook(() => useRelatedGroupsToolbarActions(createMockView()));

    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toBe(mockRunCommandAction);
  });

  test('add existing opens group select dialog', () => {
    const { result } = renderHook(() => useRelatedGroupsToolbarActions(createMockView()));
    const dropdown = result.current[0];
    if ('actions' in dropdown && Array.isArray(dropdown.actions)) {
      const addExisting = dropdown.actions[0];
      if ('onClick' in addExisting && typeof addExisting.onClick === 'function') {
        (addExisting.onClick as () => void)();
      }
    }
    expect(mockSetDialog).toHaveBeenCalled();
  });

  test('create group navigates to related groups create', () => {
    const { result } = renderHook(() => useRelatedGroupsToolbarActions(createMockView()));
    const dropdown = result.current[0];
    if ('actions' in dropdown && Array.isArray(dropdown.actions)) {
      const createAction = dropdown.actions[1];
      if ('onClick' in createAction && typeof createAction.onClick === 'function') {
        (createAction.onClick as () => void)();
      }
    }
    expect(mockPageNavigate).toHaveBeenCalledWith('awx-inventory-group-related-groups-create', {
      params: { inventory_type: 'inventory', id: '1', group_id: '2' },
    });
  });
});

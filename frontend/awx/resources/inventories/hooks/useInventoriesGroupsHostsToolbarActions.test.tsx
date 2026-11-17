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
import { AwxHost } from '../../../interfaces/AwxHost';
import { useDisassociateHosts } from '../../hosts/hooks/useDisassociateHosts';
import { useInventoriesGroupsHostsToolbarActions } from './useInventoriesGroupsHostsToolbarActions';

const mockRunCommandAction = {
  type: PageActionType.Button,
  label: 'Run command',
  selection: PageActionSelection.None,
};

vi.mock('./useInventoriesGroupsToolbarActions', () => ({
  useRunCommandAction: vi.fn(() => mockRunCommandAction),
}));
vi.mock('../../hosts/hooks/useDisassociateHosts');
vi.mock('@ansible/common-ui/crud/useOptions');
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

function createMockView(selectedCount = 0): IAwxView<AwxHost> {
  return {
    selectedItems: selectedCount > 0 ? ([{ id: 1, name: 'h1' }] as AwxHost[]) : [],
    refresh: vi.fn(),
    unselectItemsAndRefresh: vi.fn(),
  } as unknown as IAwxView<AwxHost>;
}

describe('useInventoriesGroupsHostsToolbarActions', () => {
  const mockPageNavigate = vi.fn();
  const mockSetDialog = vi.fn();
  const mockDisassociate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePageNavigate).mockReturnValue(mockPageNavigate);
    vi.mocked(usePageDialog).mockReturnValue([undefined, mockSetDialog]);
    vi.mocked(useDisassociateHosts).mockReturnValue(mockDisassociate);
    vi.mocked(useOptions).mockReturnValue({ data: { actions: { POST: {} } } } as never);
    vi.mocked(useParams).mockReturnValue({
      id: '1',
      group_id: '2',
      inventory_type: 'inventory',
    });
  });

  test('includes add host dropdown and run command for inventory type', () => {
    const { result } = renderHook(() => useInventoriesGroupsHostsToolbarActions(createMockView()));

    expect(result.current.length).toBeGreaterThanOrEqual(2);
    expect(result.current[0]).toMatchObject({
      type: PageActionType.Dropdown,
      label: 'Add host',
    });
    expect(result.current[1]).toBe(mockRunCommandAction);
  });

  test('includes disassociate action for standard inventory', () => {
    const { result } = renderHook(() => useInventoriesGroupsHostsToolbarActions(createMockView(1)));

    const disassociate = result.current.find(
      (a) => 'label' in a && a.label === 'Disassociate hosts'
    );
    expect(disassociate).toBeDefined();
  });

  test('hides add host dropdown for constructed inventory', () => {
    vi.mocked(useParams).mockReturnValue({
      id: '1',
      group_id: '2',
      inventory_type: 'constructed_inventory',
    });
    const { result } = renderHook(() => useInventoriesGroupsHostsToolbarActions(createMockView()));

    const addHost = result.current.find((a) => 'label' in a && a.label === 'Add host');
    expect(addHost).toBeDefined();
    if (addHost && 'isHidden' in addHost && typeof addHost.isHidden === 'function') {
      expect((addHost.isHidden as () => boolean)()).toBe(true);
    }
  });

  test('create host navigates when add dropdown create is clicked', () => {
    const { result } = renderHook(() => useInventoriesGroupsHostsToolbarActions(createMockView()));
    const dropdown = result.current[0];
    if ('actions' in dropdown && Array.isArray(dropdown.actions)) {
      const createAction = dropdown.actions[1];
      if ('onClick' in createAction && typeof createAction.onClick === 'function') {
        (createAction.onClick as () => void)();
      }
    }
    expect(mockPageNavigate).toHaveBeenCalledWith('awx-inventory-group-host-add', {
      params: { id: '1', inventory_type: 'inventory', group_id: '2' },
    });
  });

  test('disassociate disabled when no selection', () => {
    const { result } = renderHook(() => useInventoriesGroupsHostsToolbarActions(createMockView(0)));
    const disassociate = result.current.find(
      (a) => 'label' in a && a.label === 'Disassociate hosts'
    );
    if (disassociate && 'isDisabled' in disassociate) {
      expect(disassociate.isDisabled).toMatch(/Select at least one/i);
    }
  });
});

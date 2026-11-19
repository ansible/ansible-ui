import {
  PageActionSelection,
  PageActionType,
  usePageDialog,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { useParams } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { IAwxView } from '../../../common/useAwxView';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { useDisassociateGroups } from './useDisassociateGroups';
import { useRelatedGroupsToolbarActions } from './useRelatedGroupsToolbarActions';

const alertMocks = vi.hoisted(() => ({ addAlert: vi.fn() }));

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
vi.mock('@ansible/ansible-ui-framework', async () => ({
  ...(await vi.importActual('@ansible/ansible-ui-framework')),
  usePageNavigate: vi.fn(),
  usePageDialog: vi.fn(),
  usePageAlertToaster: () => ({ addAlert: alertMocks.addAlert }),
}));

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
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

  test('posts selected groups, reports failures, and disassociates the selection', async () => {
    const posted: number[] = [];
    server.use(
      http.post(awxAPI`/groups/2/children/`, async ({ request }) => {
        const body = (await request.json()) as { id: number };
        posted.push(body.id);
        if (body.id === 4) {
          return HttpResponse.json({ detail: 'denied' }, { status: 400 });
        }
        return HttpResponse.json({ id: body.id }, { status: 201 });
      })
    );
    const view = createMockView(1);
    const { result } = renderHook(() => useRelatedGroupsToolbarActions(view));
    const dropdown = result.current[0];
    if ('actions' in dropdown && Array.isArray(dropdown.actions)) {
      const createGroup = dropdown.actions[1];
      if ('isHidden' in createGroup && typeof createGroup.isHidden === 'function') {
        expect((createGroup.isHidden as () => boolean)()).toBe(false);
      }
      if ('isDisabled' in createGroup && typeof createGroup.isDisabled === 'function') {
        expect((createGroup.isDisabled as () => string | undefined)()).toBeUndefined();
      }
    }

    const dialog = mockSetDialog.mock.calls[0]?.[0] as {
      props: { onSelectedGroups: (groups: InventoryGroup[]) => Promise<void> };
    };
    expect(dialog).toBeUndefined();

    const addExisting =
      'actions' in dropdown && Array.isArray(dropdown.actions) ? dropdown.actions[0] : undefined;
    if (addExisting && 'onClick' in addExisting && typeof addExisting.onClick === 'function') {
      (addExisting.onClick as () => void)();
    }
    const opened = mockSetDialog.mock.calls.at(-1)?.[0] as {
      props: { onSelectedGroups: (groups: InventoryGroup[]) => Promise<void> };
    };
    await opened.props.onSelectedGroups([
      { id: 3, name: 'east' } as InventoryGroup,
      { id: 4, name: 'west' } as InventoryGroup,
    ]);

    await waitFor(() => expect(posted).toEqual([3, 4]));
    expect(view.refresh).toHaveBeenCalled();
    expect(alertMocks.addAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'danger',
        title: 'Failed to add west to related groups',
      })
    );
    expect(mockSetDialog).toHaveBeenCalledWith(undefined);

    const disassociate = result.current.find(
      (action) => 'label' in action && action.label === 'Disassociate groups'
    );
    if (disassociate && 'onClick' in disassociate && typeof disassociate.onClick === 'function') {
      (disassociate.onClick as (items: InventoryGroup[]) => void)(view.selectedItems);
    }
    expect(mockDisassociate).toHaveBeenCalledWith(view.selectedItems);
  });

  test('disables create group without permission and requires a selection to disassociate', () => {
    vi.mocked(useOptions).mockReturnValue({ data: { actions: {} } } as never);
    const { result } = renderHook(() => useRelatedGroupsToolbarActions(createMockView(0)));
    const dropdown = result.current[0];
    if ('actions' in dropdown && Array.isArray(dropdown.actions)) {
      const createGroup = dropdown.actions[1];
      if ('isDisabled' in createGroup && typeof createGroup.isDisabled === 'function') {
        expect((createGroup.isDisabled as () => string)()).toMatch(/do not have permission/i);
      }
    }
    const disassociate = result.current.find(
      (action) => 'label' in action && action.label === 'Disassociate groups'
    );
    expect(disassociate && 'isDisabled' in disassociate ? disassociate.isDisabled : '').toMatch(
      /Select at least one/i
    );
  });
});

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
import { useRelatedGroupsEmptyStateActions } from './useRelatedGroupsEmptyStateActions';

vi.mock('@ansible/common-ui/crud/useOptions');
vi.mock('@ansible/common-ui/crud/Data', () => ({
  postRequest: vi.fn().mockResolvedValue(undefined),
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

function createMockView(): IAwxView<InventoryGroup> {
  return {
    refresh: vi.fn(),
  } as unknown as IAwxView<InventoryGroup>;
}

describe('useRelatedGroupsEmptyStateActions', () => {
  const mockPageNavigate = vi.fn();
  const mockSetDialog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePageNavigate).mockReturnValue(mockPageNavigate);
    vi.mocked(usePageDialog).mockReturnValue([undefined, mockSetDialog]);
    vi.mocked(useOptions).mockReturnValue({ data: { actions: { POST: {} } } } as never);
    vi.mocked(useParams).mockReturnValue({
      id: '1',
      inventory_type: 'inventory',
      group_id: '2',
    });
  });

  test('returns add existing and create actions for standard inventory', () => {
    const { result } = renderHook(() => useRelatedGroupsEmptyStateActions(createMockView()));

    expect(result.current).toHaveLength(2);
    expect(result.current[0]).toMatchObject({
      type: PageActionType.Button,
      label: 'Add existing group',
      selection: PageActionSelection.None,
    });
    expect(result.current[1]).toMatchObject({
      type: PageActionType.Button,
      label: 'Create group',
    });
  });

  test('returns empty array for constructed inventory', () => {
    vi.mocked(useParams).mockReturnValue({
      id: '1',
      inventory_type: 'constructed_inventory',
      group_id: '2',
    });
    const { result } = renderHook(() => useRelatedGroupsEmptyStateActions(createMockView()));

    expect(result.current).toEqual([]);
  });

  test('add existing opens dialog', () => {
    const { result } = renderHook(() => useRelatedGroupsEmptyStateActions(createMockView()));
    const addAction = result.current[0];
    if ('onClick' in addAction && typeof addAction.onClick === 'function') {
      (addAction.onClick as () => void)();
    }
    expect(mockSetDialog).toHaveBeenCalled();
  });

  test('create navigates to related groups create route', () => {
    const { result } = renderHook(() => useRelatedGroupsEmptyStateActions(createMockView()));
    const createAction = result.current[1];
    if ('onClick' in createAction && typeof createAction.onClick === 'function') {
      (createAction.onClick as () => void)();
    }
    expect(mockPageNavigate).toHaveBeenCalledWith('awx-inventory-group-related-groups-create', {
      params: { inventory_type: 'inventory', id: '1', group_id: '2' },
    });
  });
});

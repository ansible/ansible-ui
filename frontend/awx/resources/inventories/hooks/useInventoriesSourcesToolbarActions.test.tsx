import {
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { renderHook } from '@testing-library/react';
import { useParams } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { IAwxView } from '../../../common/useAwxView';
import { InventorySource } from '../../../interfaces/InventorySource';
import { useDeleteSources } from '../../sources/hooks/useDeleteSources';
import { useInventoriesSourcesToolbarActions } from './useInventoriesSourcesToolbarActions';

vi.mock('../../sources/hooks/useDeleteSources');
vi.mock('@ansible/common-ui/crud/useOptions');
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

function createMockSource(overrides: Partial<InventorySource> = {}): InventorySource {
  return {
    id: 1,
    name: 'Source',
    summary_fields: {
      user_capabilities: { start: true, delete: true, edit: true, schedule: true },
    },
    ...overrides,
  } as InventorySource;
}

function createMockView(
  pageItems: InventorySource[] = [createMockSource()]
): IAwxView<InventorySource> {
  return {
    pageItems,
    selectedItems: pageItems,
    refresh: vi.fn().mockResolvedValue(undefined),
    unselectItemsAndRefresh: vi.fn(),
  } as unknown as IAwxView<InventorySource>;
}

describe('useInventoriesSourcesToolbarActions', () => {
  const mockPageNavigate = vi.fn();
  const mockDeleteSources = vi.fn();
  const mockPostRequest = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePageNavigate).mockReturnValue(mockPageNavigate);
    vi.mocked(useDeleteSources).mockReturnValue(mockDeleteSources);
    vi.mocked(usePostRequest).mockReturnValue(mockPostRequest);
    vi.mocked(useOptions).mockReturnValue({ data: { actions: { POST: {} } } } as never);
    vi.mocked(useAwxActiveUser).mockReturnValue({
      activeAwxUser: { is_system_auditor: false },
    } as never);
    vi.mocked(useParams).mockReturnValue({ id: '5', inventory_type: 'inventory' });
  });

  test('returns create, delete, and sync all toolbar actions', () => {
    const { result } = renderHook(() => useInventoriesSourcesToolbarActions(createMockView(), '5'));

    expect(result.current).toHaveLength(4);
    expect(result.current[0]).toMatchObject({
      type: PageActionType.Button,
      label: 'Create source',
      selection: PageActionSelection.None,
    });
    expect(result.current[2]).toMatchObject({
      type: PageActionType.Button,
      label: 'Delete sources',
      isDanger: true,
    });
    expect(result.current[3]).toMatchObject({
      type: PageActionType.Button,
      label: 'Sync inventory sources',
    });
  });

  test('create navigates to add source route', () => {
    const { result } = renderHook(() => useInventoriesSourcesToolbarActions(createMockView(), '5'));
    const createAction = result.current[0];
    if ('onClick' in createAction && typeof createAction.onClick === 'function') {
      (createAction.onClick as () => void)();
    }
    expect(mockPageNavigate).toHaveBeenCalledWith('awx-inventory-sources-add', {
      params: { inventory_type: 'inventory', id: '5' },
    });
  });

  test('sync all disabled when no page items', () => {
    const { result } = renderHook(() =>
      useInventoriesSourcesToolbarActions(createMockView([]), '5')
    );
    const syncAction = result.current[3];
    if ('isDisabled' in syncAction) {
      const disabled =
        typeof syncAction.isDisabled === 'function'
          ? (syncAction.isDisabled as () => string | undefined)()
          : syncAction.isDisabled;
      expect(disabled).toMatch(/no inventory sources/i);
    }
  });

  test('sync all posts bulk update endpoint', async () => {
    const view = createMockView();
    const { result } = renderHook(() => useInventoriesSourcesToolbarActions(view, '5'));
    const syncAction = result.current[3];
    if ('onClick' in syncAction && typeof syncAction.onClick === 'function') {
      (syncAction.onClick as () => void)();
    }
    await vi.waitFor(() => {
      expect(mockPostRequest).toHaveBeenCalledWith(
        expect.stringContaining('/inventories/5/update_inventory_sources/'),
        {}
      );
    });
  });

  test('create disabled without POST permission', () => {
    vi.mocked(useOptions).mockReturnValue({ data: { actions: {} } } as never);
    const { result } = renderHook(() => useInventoriesSourcesToolbarActions(createMockView(), '5'));
    const createAction = result.current[0];
    if ('isDisabled' in createAction) {
      const disabled =
        typeof createAction.isDisabled === 'function'
          ? (createAction.isDisabled as () => string | undefined)()
          : createAction.isDisabled;
      expect(disabled).toMatch(/permission/i);
    }
  });
});

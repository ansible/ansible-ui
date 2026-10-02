import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useCredentialToolbarActions } from './useCredentialToolbarActions';
import { useDeleteCredentials } from './useDeleteCredentials';
import { usePageNavigate, PageActionType } from '@ansible/ansible-ui-framework';

vi.mock('./useDeleteCredentials');
vi.mock('@ansible/ansible-ui-framework', async () => ({
  ...(await vi.importActual('@ansible/ansible-ui-framework')),
  usePageNavigate: vi.fn(),
}));

describe('useCredentialToolbarActions', () => {
  const mockView = {
    unselectItemsAndRefresh: vi.fn(),
    selectItemsAndRefresh: vi.fn(),
    selectedItems: [],
    selectItem: vi.fn(),
    unselectItem: vi.fn(),
    selectItems: vi.fn(),
    unselectItems: vi.fn(),
    selectAll: vi.fn(),
    unselectAll: vi.fn(),
    allSelected: false,
    isSelected: vi.fn(),
    itemCount: 0,
    pageItems: [],
    refresh: vi.fn(),
    error: undefined,
    page: 1,
    setPage: vi.fn(),
    perPage: 10,
    setPerPage: vi.fn(),
    sort: 'name',
    setSort: vi.fn(),
    sortDirection: 'asc' as const,
    setSortDirection: vi.fn(),
    filterState: {},
    setFilterState: vi.fn(),
    clearAllFilters: vi.fn(),
    keyFn: (item: { id: number }) => item.id,
    limitFiltersToOneOrOperation: true as const,
    updateItem: vi.fn(),
    upsertItem: vi.fn(),
    listUrl: '',
  };

  const mockPageNavigate = vi.fn();
  const mockDeleteCredentials = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePageNavigate).mockReturnValue(mockPageNavigate);
    vi.mocked(useDeleteCredentials).mockReturnValue(mockDeleteCredentials);
  });

  test('returns toolbar actions array with create and delete actions', () => {
    const { result } = renderHook(() => useCredentialToolbarActions(mockView));

    expect(result.current).toHaveLength(3);
    expect(result.current[0]).toMatchObject({
      type: PageActionType.Button,
      label: 'Create credential',
      variant: 'primary',
      isPinned: true,
    });
    expect(result.current[2]).toMatchObject({
      type: PageActionType.Button,
      label: 'Delete credentials',
      isDanger: true,
    });
  });

  test('delete action triggers delete credentials function', () => {
    const { result } = renderHook(() => useCredentialToolbarActions(mockView));

    const deleteAction = result.current[2];
    if ('onClick' in deleteAction && typeof deleteAction.onClick === 'function') {
      (deleteAction.onClick as (items: never[]) => void)([]);
    }

    expect(mockDeleteCredentials).toHaveBeenCalled();
  });

  test('delete action is marked as danger action', () => {
    const { result } = renderHook(() => useCredentialToolbarActions(mockView));

    const deleteAction = result.current[2];
    if ('isDanger' in deleteAction) {
      expect(deleteAction.isDanger).toBe(true);
    }
  });

  test('create action is pinned to toolbar', () => {
    const { result } = renderHook(() => useCredentialToolbarActions(mockView));

    const createAction = result.current[0];
    if ('isPinned' in createAction) {
      expect(createAction.isPinned).toBe(true);
    }
  });
});

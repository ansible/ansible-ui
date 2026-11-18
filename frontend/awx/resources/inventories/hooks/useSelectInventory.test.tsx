import type { ReactElement } from 'react';
import { render, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { Inventory } from '../../../interfaces/Inventory';
import { useSelectInventory } from './useSelectInventory';

const mockSetDialog = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageDialog: vi.fn(() => [undefined, mockSetDialog]),
  };
});

vi.mock('./useInventoriesFilters', () => ({
  useInventoriesFilters: vi.fn(() => [{ key: 'name', label: 'Name' }]),
}));

vi.mock('./useInventoriesColumns', () => ({
  useInventoriesColumns: vi.fn(() => [{ header: 'Name', sort: 'name' }]),
}));

const mockUseAwxView = vi.fn(() => ({
  page: 1,
  perPage: 10,
  pageItems: [],
  selectedItems: [],
  itemCount: 0,
  error: undefined,
  refresh: vi.fn(),
}));

vi.mock('../../../common/useAwxView', () => ({
  useAwxView: (options?: unknown) => mockUseAwxView(options),
}));

describe('useSelectInventory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a callable function', () => {
    const { result } = renderHook(() => useSelectInventory());

    expect(typeof result.current).toBe('function');
  });

  it('should call setDialog when the returned function is invoked', () => {
    const { result } = renderHook(() => useSelectInventory());
    const onSelect = vi.fn();

    result.current(onSelect);

    expect(mockSetDialog).toHaveBeenCalledTimes(1);
  });

  it('should open a dialog with the correct title', () => {
    const { result } = renderHook(() => useSelectInventory());
    const onSelect = vi.fn();

    result.current(onSelect);

    const dialogElement = mockSetDialog.mock.calls[0][0] as ReactElement<{
      title: string;
    }>;
    expect(dialogElement.props.title).toBe('Select inventory');
  });

  it('should pass the onSelect callback to the dialog', () => {
    const { result } = renderHook(() => useSelectInventory());
    const onSelect = vi.fn();

    result.current(onSelect);

    const dialogElement = mockSetDialog.mock.calls[0][0] as ReactElement<{
      onSelect: (inventory: Inventory) => void;
    }>;
    expect(dialogElement.props.onSelect).toBe(onSelect);
  });

  it('should return a stable function reference across renders', () => {
    const { result, rerender } = renderHook(() => useSelectInventory());
    const firstRef = result.current;

    rerender();

    expect(result.current).toBe(firstRef);
  });

  it('should pass a SelectInventory component as the dialog', () => {
    const { result } = renderHook(() => useSelectInventory());
    const onSelect = vi.fn();

    result.current(onSelect);

    const dialogElement = mockSetDialog.mock.calls[0][0] as ReactElement;
    expect(dialogElement).toBeTruthy();
    expect((dialogElement.type as { name?: string }).name).toBe('SelectInventory');
  });

  it('invokes parent onSelect when dialog reports an inventory choice', () => {
    const { result } = renderHook(() => useSelectInventory());
    const onSelect = vi.fn();
    const inventory = { id: 4, name: 'Prod' } as Inventory;

    result.current(onSelect);

    const dialogElement = mockSetDialog.mock.calls[0][0] as ReactElement<{
      onSelect: (inventory: Inventory) => void;
    }>;
    dialogElement.props.onSelect(inventory);
    expect(onSelect).toHaveBeenCalledWith(inventory);
  });

  it('should forward different onSelect callbacks on subsequent calls', () => {
    const { result } = renderHook(() => useSelectInventory());
    const onSelectFirst = vi.fn();
    const onSelectSecond = vi.fn();

    result.current(onSelectFirst);
    result.current(onSelectSecond);

    const firstDialog = mockSetDialog.mock.calls[0][0] as ReactElement<{
      onSelect: (inventory: Inventory) => void;
    }>;
    const secondDialog = mockSetDialog.mock.calls[1][0] as ReactElement<{
      onSelect: (inventory: Inventory) => void;
    }>;
    expect(firstDialog.props.onSelect).toBe(onSelectFirst);
    expect(secondDialog.props.onSelect).toBe(onSelectSecond);
  });

  it('wires SelectInventory dialog to the inventories list view', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useSelectInventory());

    result.current(onSelect);

    const dialogElement = mockSetDialog.mock.calls[0][0] as ReactElement;
    render(dialogElement);

    expect(mockUseAwxView).toHaveBeenCalledWith(
      expect.objectContaining({
        url: awxAPI`/inventories/`,
        disableQueryString: true,
      })
    );
  });
});

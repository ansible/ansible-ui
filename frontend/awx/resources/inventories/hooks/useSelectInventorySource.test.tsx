import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSelectInventorySource } from './useSelectInventorySource';
import { InventorySource } from '../../../interfaces/InventorySource';

const mockSetDialog = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageDialog: vi.fn(() => [undefined, mockSetDialog]),
  };
});

vi.mock('./useInventorySourceColumns', () => ({
  useInventorySourceColumns: vi.fn(() => [{ header: 'Name', sort: 'name' }]),
}));

vi.mock('./useInventorySourceFilters', () => ({
  useInventorySourceFilters: vi.fn(() => [{ key: 'name', label: 'Name' }]),
}));

vi.mock('../../../common/useAwxView', () => ({
  useAwxView: vi.fn(() => ({
    pageItems: [],
    itemCount: 0,
    error: undefined,
    refresh: vi.fn(),
  })),
}));

describe('useSelectInventorySource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a callable function', () => {
    const { result } = renderHook(() => useSelectInventorySource());

    expect(typeof result.current).toBe('function');
  });

  it('should call setDialog when the returned function is invoked', () => {
    const { result } = renderHook(() => useSelectInventorySource());
    const onSelect = vi.fn();

    result.current(onSelect);

    expect(mockSetDialog).toHaveBeenCalledTimes(1);
  });

  it('should open a dialog with the correct title', () => {
    const { result } = renderHook(() => useSelectInventorySource());
    const onSelect = vi.fn();

    result.current(onSelect);

    const dialogElement = mockSetDialog.mock.calls[0][0] as React.ReactElement<{
      title: string;
    }>;
    expect(dialogElement.props.title).toBe('Select inventory source');
  });

  it('should pass the onSelect callback to the dialog', () => {
    const { result } = renderHook(() => useSelectInventorySource());
    const onSelect = vi.fn();

    result.current(onSelect);

    const dialogElement = mockSetDialog.mock.calls[0][0] as React.ReactElement<{
      onSelect: (source: InventorySource) => void;
    }>;
    expect(dialogElement.props.onSelect).toBe(onSelect);
  });

  it('should pass inventoryId to the dialog when provided', () => {
    const { result } = renderHook(() => useSelectInventorySource(42));
    const onSelect = vi.fn();

    result.current(onSelect);

    const dialogElement = mockSetDialog.mock.calls[0][0] as React.ReactElement<{
      inventoryId?: number;
    }>;
    expect(dialogElement.props.inventoryId).toBe(42);
  });

  it('should not pass inventoryId when not provided', () => {
    const { result } = renderHook(() => useSelectInventorySource());
    const onSelect = vi.fn();

    result.current(onSelect);

    const dialogElement = mockSetDialog.mock.calls[0][0] as React.ReactElement<{
      inventoryId?: number;
    }>;
    expect(dialogElement.props.inventoryId).toBeUndefined();
  });

  it('should return a stable function reference across renders', () => {
    const { result, rerender } = renderHook(() => useSelectInventorySource(10));
    const firstRef = result.current;

    rerender();

    expect(result.current).toBe(firstRef);
  });

  it('should pass a SelectInventorySource component as the dialog', () => {
    const { result } = renderHook(() => useSelectInventorySource());
    const onSelect = vi.fn();

    result.current(onSelect);

    const dialogElement = mockSetDialog.mock.calls[0][0] as React.ReactElement;
    expect(dialogElement).toBeTruthy();
    expect((dialogElement.type as { name?: string }).name).toBe('SelectInventorySource');
  });

  it('should forward different onSelect callbacks on subsequent calls', () => {
    const { result } = renderHook(() => useSelectInventorySource());
    const onSelectFirst = vi.fn();
    const onSelectSecond = vi.fn();

    result.current(onSelectFirst);
    result.current(onSelectSecond);

    const firstDialog = mockSetDialog.mock.calls[0][0] as React.ReactElement<{
      onSelect: (source: InventorySource) => void;
    }>;
    const secondDialog = mockSetDialog.mock.calls[1][0] as React.ReactElement<{
      onSelect: (source: InventorySource) => void;
    }>;
    expect(firstDialog.props.onSelect).toBe(onSelectFirst);
    expect(secondDialog.props.onSelect).toBe(onSelectSecond);
  });

  it('should produce a new function reference when inventoryId changes', () => {
    const { result, rerender } = renderHook(
      ({ id }: { id?: number }) => useSelectInventorySource(id),
      { initialProps: { id: 1 } }
    );
    const firstRef = result.current;

    rerender({ id: 2 });

    expect(result.current).not.toBe(firstRef);
  });
});

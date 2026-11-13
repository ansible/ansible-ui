import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useManageItems } from './useManagedItems';

const setDialog = vi.fn();

vi.mock('../PageDialogs/PageDialog', () => ({
  usePageDialog: () => [undefined, setDialog],
}));

type Item = { id: string; name: string };

describe('useManageItems', () => {
  beforeEach(() => {
    localStorage.clear();
    setDialog.mockReset();
  });

  it('opens a manage items modal and persists selection state', () => {
    const items: Item[] = [
      { id: '1', name: 'One' },
      { id: '2', name: 'Two' },
    ];

    const { result } = renderHook(() =>
      useManageItems({
        id: 'test-columns',
        title: 'Manage items',
        keyFn: (item) => item.id,
        items,
        columns: [{ header: 'Name', cell: (item) => item.name }],
        saveFn: (item) => ({ name: item.name }),
        loadFn: (item, state) => {
          if (state && typeof state === 'object' && 'name' in state) {
            item.name = String((state as { name: string }).name);
          }
        },
      })
    );

    act(() => {
      result.current.openManageItems();
    });
    expect(setDialog).toHaveBeenCalled();

    const stored = localStorage.getItem('test-columns');
    expect(stored).toBeNull();
    expect(result.current.managedItems).toHaveLength(2);
  });

  it('restores ordering and enabled flags from localStorage', () => {
    localStorage.setItem(
      'prefs',
      JSON.stringify([
        { key: '2', enabled: true, state: { name: 'Beta' } },
        { key: '1', enabled: false, state: { name: 'Alpha' } },
      ])
    );

    const items: Item[] = [
      { id: '1', name: 'Alpha' },
      { id: '2', name: 'Beta' },
    ];

    const { result } = renderHook(() =>
      useManageItems({
        id: 'prefs',
        title: 'Prefs',
        keyFn: (item) => item.id,
        items,
        columns: [{ header: 'Name', cell: (item) => item.name }],
        loadFn: (item, state) => {
          if (state && typeof state === 'object' && 'name' in state) {
            item.name = String((state as { name: string }).name);
          }
        },
      })
    );

    expect(result.current.managedItems.map((item) => item.id)).toEqual(['2']);
  });

  it('applies modal changes and persists state', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const items: Item[] = [
      { id: '1', name: 'One' },
      { id: '2', name: 'Two' },
    ];

    const { result } = renderHook(() =>
      useManageItems({
        id: 'apply-items',
        title: 'Manage items',
        keyFn: (item) => item.id,
        items,
        columns: [{ header: 'Name', cell: (item) => item.name }],
        onSubmit,
      })
    );

    act(() => {
      result.current.openManageItems();
    });

    const modal = setDialog.mock.calls[0]?.[0] as import('react').ReactElement;
    render(modal);
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onSubmit).toHaveBeenCalled();
    expect(localStorage.getItem('apply-items')).toBeTruthy();
  });
});

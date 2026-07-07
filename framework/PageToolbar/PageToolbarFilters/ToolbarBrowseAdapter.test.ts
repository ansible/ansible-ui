import { describe, expect, it, vi } from 'vitest';
import { multiSelectBrowseAdapter } from './ToolbarAsyncMultiSelectFilter';
import { singleSelectBrowseAdapter } from './ToolbarAsyncSingleSelectFilter';

interface TestItem {
  id: string;
  name: string;
}

describe('multiSelectBrowseAdapter', () => {
  it('should call selectFn, map items via keyFn', () => {
    const selectFn = vi.fn((onSelect: (items: TestItem[]) => void) => {
      onSelect([
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ]);
    });
    const keyFn = (item: TestItem) => item.id;
    const objectFn = (name: string) => ({ id: name, name });

    const adapter = multiSelectBrowseAdapter(selectFn, keyFn, objectFn);
    const onSelect = vi.fn();
    adapter(onSelect);

    expect(selectFn).toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledWith(['1', '2']);
  });

  it('should use customOnSelect when provided', () => {
    const selectFn = vi.fn((onSelect: (items: TestItem[]) => void) => {
      onSelect([{ id: '1', name: 'Item 1' }]);
    });
    const keyFn = (item: TestItem) => item.id;
    const objectFn = (name: string) => ({ id: name, name });
    const customOnSelect = vi.fn();

    const adapter = multiSelectBrowseAdapter(selectFn, keyFn, objectFn, customOnSelect);
    const onSelect = vi.fn();
    adapter(onSelect);

    expect(customOnSelect).toHaveBeenCalledWith([{ id: '1', name: 'Item 1' }]);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should map defaultSelections through objectFn', () => {
    const selectFn = vi.fn();
    const keyFn = (item: TestItem) => item.id;
    const objectFn = vi.fn((name: string) => ({ id: name, name }));

    const adapter = multiSelectBrowseAdapter(selectFn, keyFn, objectFn);
    const onSelect = vi.fn();
    adapter(onSelect, ['sel1', 'sel2']);

    expect(objectFn).toHaveBeenCalledWith('sel1');
    expect(objectFn).toHaveBeenCalledWith('sel2');
    expect(selectFn).toHaveBeenCalledWith(expect.any(Function), [
      { id: 'sel1', name: 'sel1' },
      { id: 'sel2', name: 'sel2' },
    ]);
  });
});

describe('singleSelectBrowseAdapter', () => {
  it('should call selectFn, map item via keyFn', () => {
    const selectFn = vi.fn((onSelect: (item: TestItem) => void) => {
      onSelect({ id: '42', name: 'Test' });
    });
    const keyFn = (item: TestItem) => item.id;
    const objectFn = (name: string) => ({ id: name, name });

    const adapter = singleSelectBrowseAdapter(selectFn, keyFn, objectFn);
    const onSelect = vi.fn();
    adapter(onSelect);

    expect(selectFn).toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledWith('42');
  });

  it('should use customOnSelect when provided', () => {
    const selectFn = vi.fn((onSelect: (item: TestItem) => void) => {
      onSelect({ id: '5', name: 'Five' });
    });
    const keyFn = (item: TestItem) => item.id;
    const objectFn = (name: string) => ({ id: name, name });
    const customOnSelect = vi.fn();

    const adapter = singleSelectBrowseAdapter(selectFn, keyFn, objectFn, customOnSelect);
    const onSelect = vi.fn();
    adapter(onSelect);

    expect(customOnSelect).toHaveBeenCalledWith({ id: '5', name: 'Five' });
    expect(onSelect).not.toHaveBeenCalled();
  });
});

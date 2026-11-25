import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { moveReorderItem, ReorderItems } from './ReorderItems';

type Item = { id: string | number; name?: string };

const createProps = <T extends Item>(items: T[]) => ({
  columns: [{ header: 'ID', cell: (item: T) => String(item.id) }],
  items,
  setItems: vi.fn(),
  keyFn: (item: T) => item.id,
  isSelected: () => false,
  selectItem: vi.fn(),
  unselectItem: vi.fn(),
  allSelected: false,
  selectAll: vi.fn(),
  unselectAll: vi.fn(),
});

const setTableBounds = () =>
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    top: 0,
    right: 100,
    bottom: 100,
    left: 0,
    toJSON: () => ({}),
  });

const fireDragWithCoordinates = (
  element: Element,
  type: 'drop' | 'dragleave',
  clientX: number,
  clientY: number
) => {
  fireEvent(element, new MouseEvent(type, { bubbles: true, cancelable: true, clientX, clientY }));
};

const getRequiredElement = <T extends Element>(element: T | null): T => {
  if (!element) throw new Error('Expected an element to exist');
  return element;
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('moveReorderItem', () => {
  it('moves an item to the target index', () => {
    const items = [{ id: 'first' }, { id: 'second' }];
    const reordered = moveReorderItem(items, 'first', 1, (item) => item.id);

    expect(reordered).toEqual([{ id: 'second' }, { id: 'first' }]);
  });

  it('returns the original array when the item is already at the target index', () => {
    const items = [{ id: 'first' }, { id: 'second' }];
    const reordered = moveReorderItem(items, 'first', 0, (item) => item.id);

    expect(reordered).toEqual(items);
  });

  it('returns the original array when the item is not found', () => {
    const items = [{ id: 'first' }, { id: 'second' }];
    const reordered = moveReorderItem(items, 'missing', 1, (item) => item.id);

    expect(reordered).toBe(items);
  });

  it('does not insert an unavailable item after removing it', () => {
    const items = [undefined];
    const reordered = moveReorderItem(items, 'missing', 1, () => 'missing');

    expect(reordered).toEqual([]);
  });

  it('moves falsy items instead of treating them as missing', () => {
    const items = [0, 1];
    const reordered = moveReorderItem(items, 0, 1, (item) => item);

    expect(reordered).toEqual([1, 0]);
  });
});

describe('ReorderItems', () => {
  it('moves a dragged item to the target row', () => {
    const items = [{ id: 'first' }, { id: 'second' }];
    const setItems = vi.fn();
    const { container } = render(
      <ReorderItems
        columns={[{ header: 'ID', cell: (item) => item.id }]}
        items={items}
        setItems={setItems}
        keyFn={(item) => item.id}
        isSelected={() => false}
        selectItem={vi.fn()}
        unselectItem={vi.fn()}
        allSelected={false}
        selectAll={vi.fn()}
        unselectAll={vi.fn()}
      />
    );
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      top: 0,
      right: 100,
      bottom: 100,
      left: 0,
      toJSON: () => ({}),
    });

    const rows = container.querySelectorAll('tbody tr');
    const dataTransfer = { effectAllowed: '' };
    // Narrow exception: fireEvent is needed for native drag events because
    // userEvent cannot provide DataTransfer and pointer coordinates.
    fireEvent.dragStart(rows[0], { dataTransfer });
    fireEvent.dragOver(rows[1], { clientX: 50, clientY: 50 });

    expect(setItems).toHaveBeenCalledWith([items[1], items[0]]);
  });

  it('moves rows whose keys are numeric, including zero', () => {
    const items = [{ id: 0 }, { id: 1 }];
    const setItems = vi.fn();
    const { container } = render(
      <ReorderItems
        columns={[{ header: 'ID', cell: (item) => item.id }]}
        items={items}
        setItems={setItems}
        keyFn={(item) => item.id}
        isSelected={() => false}
        selectItem={vi.fn()}
        unselectItem={vi.fn()}
        allSelected={false}
        selectAll={vi.fn()}
        unselectAll={vi.fn()}
      />
    );
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      top: 0,
      right: 100,
      bottom: 100,
      left: 0,
      toJSON: () => ({}),
    });

    const rows = container.querySelectorAll('tbody tr');
    const dataTransfer = { effectAllowed: '' };
    fireEvent.dragStart(rows[0], { dataTransfer });
    fireEvent.dragOver(rows[1], { clientX: 50, clientY: 50 });

    expect(setItems).toHaveBeenCalledWith([items[1], items[0]]);
  });

  it('hides the header row when requested', () => {
    render(<ReorderItems {...createProps([{ id: 'first' }])} hideColumnHeaders />);

    expect(screen.queryByRole('columnheader')).not.toBeInTheDocument();
  });

  it('updates the row when a cell changes its item', async () => {
    const user = userEvent.setup();
    const items = [{ id: 'first', name: 'Before' }];
    const setItems = vi.fn();

    render(
      <ReorderItems
        {...createProps(items)}
        columns={[
          {
            header: 'Name',
            cell: (item, setItem) => (
              <button onClick={() => setItem({ ...item, name: 'After' })}>Update item</button>
            ),
          },
        ]}
        setItems={setItems}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Update item' }));

    expect(setItems).toHaveBeenCalledWith([{ id: 'first', name: 'After' }]);
  });

  it('routes header selection to the select-all callback', async () => {
    const user = userEvent.setup();
    const props = createProps([{ id: 'first' }]);

    render(<ReorderItems {...props} isSelectableWithCheckbox />);
    await user.click(screen.getAllByRole('checkbox')[0]);

    expect(props.selectAll).toHaveBeenCalledOnce();
  });

  it('routes header deselection to the unselect-all callback', async () => {
    const user = userEvent.setup();
    const props = { ...createProps([{ id: 'first' }]), allSelected: true };

    render(<ReorderItems {...props} isSelectableWithCheckbox />);
    await user.click(screen.getAllByRole('checkbox')[0]);

    expect(props.unselectAll).toHaveBeenCalledOnce();
  });

  it('routes row selection changes to the matching callbacks', async () => {
    const user = userEvent.setup();
    const items = [{ id: 'first' }];
    const props = createProps(items);

    render(<ReorderItems {...props} isSelectableWithCheckbox />);
    await user.click(screen.getAllByRole('checkbox')[1]);

    expect(props.selectItem).toHaveBeenCalledWith(items[0]);
  });

  it('routes row deselection to the unselect callback', async () => {
    const user = userEvent.setup();
    const items = [{ id: 'first' }];
    const props = { ...createProps(items), isSelected: () => true };

    render(<ReorderItems {...props} isSelectableWithCheckbox />);
    await user.click(screen.getAllByRole('checkbox')[1]);

    expect(props.unselectItem).toHaveBeenCalledWith(items[0]);
  });

  it('ignores drag-over events without a target row or on the dragged row', () => {
    const items = [{ id: 'first' }, { id: 'second' }];
    const props = createProps(items);
    const { container } = render(<ReorderItems {...props} />);
    setTableBounds();

    const rows = container.querySelectorAll('tbody tr');
    const dataTransfer = { effectAllowed: '' };
    fireEvent.dragStart(rows[0], { dataTransfer });
    fireEvent.dragOver(getRequiredElement(container.querySelector('tbody')), {
      clientX: 50,
      clientY: 50,
    });
    fireEvent.dragOver(rows[0], { clientX: 50, clientY: 50 });

    expect(props.setItems).not.toHaveBeenCalled();
  });

  it('does not move a row when a drag-over happens before drag start', () => {
    const items = [{ id: 'first' }, { id: 'second' }];
    const props = createProps(items);
    const { container } = render(<ReorderItems {...props} />);
    setTableBounds();

    const rows = container.querySelectorAll('tbody tr');
    fireEvent.dragOver(rows[1], { clientX: 50, clientY: 50 });

    expect(props.setItems).not.toHaveBeenCalled();
  });

  it.each([
    { clientX: -1, clientY: 50 },
    { clientX: 150, clientY: 50 },
    { clientX: 50, clientY: -1 },
    { clientX: 50, clientY: 150 },
  ])('clears the pressed state after a drop outside the table', ({ clientX, clientY }) => {
    const items = [{ id: 'first' }, { id: 'second' }];
    const { container } = render(<ReorderItems {...createProps(items)} />);
    setTableBounds();

    const rows = container.querySelectorAll('tbody tr');
    const dataTransfer = { effectAllowed: '' };
    fireEvent.dragStart(rows[0], { dataTransfer });
    fireDragWithCoordinates(rows[0], 'drop', clientX, clientY);

    expect(rows[0]).toHaveAttribute('aria-pressed', 'false');
  });

  it('keeps the drag active when a drop stays within the table', () => {
    const items = [{ id: 'first' }, { id: 'second' }];
    const { container } = render(<ReorderItems {...createProps(items)} />);
    setTableBounds();

    const row = getRequiredElement(container.querySelector('tbody tr'));
    fireEvent.dragStart(row, { dataTransfer: { effectAllowed: '' } });
    fireDragWithCoordinates(row, 'drop', 50, 50);

    expect(row).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps the pressed state while the pointer leaves and re-enters', () => {
    const items = [{ id: 'first' }, { id: 'second' }];
    const { container } = render(<ReorderItems {...createProps(items)} />);
    setTableBounds();

    const row = getRequiredElement(container.querySelector('tbody tr'));
    const tbody = getRequiredElement(container.querySelector('tbody'));
    fireEvent.dragStart(row, { dataTransfer: { effectAllowed: '' } });
    fireDragWithCoordinates(tbody, 'dragleave', -1, 50);
    expect(row).toHaveAttribute('aria-pressed', 'true');

    fireDragWithCoordinates(tbody, 'dragleave', 50, 50);

    expect(row).toHaveAttribute('aria-pressed', 'true');
  });

  it('clears the pressed state when a drag ends', () => {
    const items = [{ id: 'first' }, { id: 'second' }];
    const { container } = render(<ReorderItems {...createProps(items)} />);

    const rows = container.querySelectorAll('tbody tr');
    const dataTransfer = { effectAllowed: '' };
    fireEvent.dragStart(rows[0], { dataTransfer });
    fireEvent.dragEnd(rows[0], { dataTransfer });

    expect(rows[0]).toHaveAttribute('aria-pressed', 'false');
  });
});

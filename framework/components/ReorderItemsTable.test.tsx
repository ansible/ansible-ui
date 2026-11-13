import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ReorderItems } from './ReorderItems';

type Item = { id: string; name: string };

function Wrapper() {
  const [items, setItems] = useState<Item[]>([
    { id: 'a', name: 'Alpha' },
    { id: 'b', name: 'Beta' },
  ]);
  const [selected, setSelected] = useState<Item[]>([]);

  return (
    <ReorderItems
      columns={[
        {
          header: 'Name',
          cell: (item) => item.name,
        },
      ]}
      items={items}
      setItems={setItems}
      keyFn={(item) => item.id}
      isSelected={(item) => selected.includes(item)}
      selectItem={(item) => setSelected((prev) => [...prev, item])}
      unselectItem={(item) => setSelected((prev) => prev.filter((i) => i.id !== item.id))}
      allSelected={selected.length === items.length}
      selectAll={() => setSelected(items)}
      unselectAll={() => setSelected([])}
      isSelectableWithCheckbox
    />
  );
}

describe('ReorderItems', () => {
  it('renders draggable rows and updates a cell value', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByLabelText('Table with draggable rows')).toBeInTheDocument();

    const rowCheckbox = screen.getAllByRole('checkbox')[1];
    await user.click(rowCheckbox);
    expect(rowCheckbox).toBeChecked();
  });

  it('selects all rows from the header checkbox', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);

    const headerCheckbox = screen.getAllByRole('checkbox')[0];
    await user.click(headerCheckbox);
    const rowCheckboxes = screen.getAllByRole('checkbox').slice(1);
    rowCheckboxes.forEach((checkbox) => {
      expect(checkbox).toBeChecked();
    });
  });

  it('handles drag-and-drop interactions between rows', () => {
    const setItems = vi.fn();
    render(
      <ReorderItems
        columns={[
          {
            header: 'Name',
            cell: (item: Item, setItem) => (
              <button type="button" onClick={() => setItem({ ...item, name: 'Updated' })}>
                {item.name}
              </button>
            ),
          },
        ]}
        items={[
          { id: 'a', name: 'Alpha' },
          { id: 'b', name: 'Beta' },
        ]}
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

    const source = screen.getByText('Alpha').closest('tr') as HTMLTableRowElement;
    const target = screen.getByText('Beta').closest('tr') as HTMLTableRowElement;
    const body = target.parentElement as HTMLTableSectionElement;

    Object.defineProperty(body, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ x: 0, y: 0, width: 400, height: 200 }),
    });

    fireEvent.dragStart(source, {
      dataTransfer: { effectAllowed: 'move', setData: vi.fn(), getData: vi.fn() },
    });

    Object.defineProperty(target, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ x: 0, y: 30, width: 400, height: 30 }),
    });

    fireEvent.dragOver(target, { clientX: 10, clientY: 40 });
    fireEvent.dragEnd(source);
    fireEvent.drop(target, { clientX: 0, clientY: 0 });

    fireEvent.click(screen.getByRole('button', { name: 'Alpha' }));
    expect(setItems).toHaveBeenCalled();
  });

  it('clears drag state on drag end', () => {
    const setItems = vi.fn();
    render(
      <ReorderItems
        columns={[{ header: 'Name', cell: (item: Item) => item.name }]}
        items={[{ id: 'a', name: 'Alpha' }]}
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

    const row = screen.getByText('Alpha').closest('tr') as HTMLTableRowElement;
    row.dispatchEvent(new Event('dragend', { bubbles: true }));
    expect(row.getAttribute('aria-pressed')).toBe('false');
  });
});

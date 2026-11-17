import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BulkSelector } from './BulkSelector';

type Row = { id: string };

const pageItems: Row[] = [{ id: '1' }, { id: '2' }];

describe('BulkSelector', () => {
  it('selects all page items when the header checkbox is toggled', async () => {
    const user = userEvent.setup();
    const selectItems = vi.fn();

    render(
      <BulkSelector
        itemCount={2}
        pageItems={pageItems}
        selectedItems={[]}
        selectItems={selectItems}
        keyFn={(item) => item.id}
      />
    );

    await user.click(screen.getByTestId('select-all'));
    expect(selectItems).toHaveBeenCalledWith(pageItems);
  });

  it('clears all selections when every page item is selected', async () => {
    const user = userEvent.setup();
    const unselectAll = vi.fn();

    render(
      <BulkSelector
        itemCount={2}
        pageItems={pageItems}
        selectedItems={pageItems}
        unselectAll={unselectAll}
        keyFn={(item) => item.id}
      />
    );

    await user.click(screen.getByTestId('select-all'));
    expect(unselectAll).toHaveBeenCalledOnce();
  });

  it('shows select-none when items are already selected', async () => {
    const user = userEvent.setup();
    const unselectAll = vi.fn();

    render(
      <BulkSelector
        itemCount={2}
        pageItems={pageItems}
        selectedItems={[{ id: '1' }]}
        selectItems={vi.fn()}
        unselectAll={unselectAll}
        keyFn={(item) => item.id}
      />
    );

    const menuButtons = screen.getAllByRole('button');
    const dropdownToggle = menuButtons.find(
      (button) => button.getAttribute('aria-expanded') !== null
    );
    await user.click(dropdownToggle!);
    await user.click(screen.getByRole('menuitem', { name: 'Select none' }));
    expect(unselectAll).toHaveBeenCalledOnce();
  });

  it('computes disableBulkSelector when max selections would be exceeded', () => {
    render(
      <BulkSelector
        itemCount={3}
        pageItems={[{ id: '1' }, { id: '2' }, { id: '3' }]}
        selectedItems={[{ id: '9' }]}
        maxSelections={2}
        keyFn={(item) => item.id}
      />
    );

    const dropdown = screen
      .getByTestId('select-all')
      .closest('.pf-v6-c-menu-toggle') as HTMLElement;
    expect(dropdown.className).toContain('pf-m-disabled');
  });

  it('shows the compact selected count on small screens', () => {
    window.innerWidth = 400;
    window.dispatchEvent(new Event('resize'));

    render(
      <BulkSelector
        itemCount={2}
        pageItems={pageItems}
        selectedItems={pageItems}
        keyFn={(item) => item.id}
      />
    );

    const toggle = screen.getByTestId('select-all').closest('.pf-v6-c-menu-toggle') as HTMLElement;
    expect(within(toggle).getByText('2')).toBeInTheDocument();
  });
});

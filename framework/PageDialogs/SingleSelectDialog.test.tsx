import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { IView } from '../useView';
import { ISelected } from '../PageTable/useTableItems';
import { PageDialogProvider } from './PageDialog';
import { SingleSelectDialog } from './SingleSelectDialog';

vi.mock('../PageTable/PageTable', () => ({ PageTable: () => null }));

describe('SingleSelectDialog', () => {
  it('passes the selected item to the confirmation callback', async () => {
    const item = { id: 'item-1' };
    const onSelect = vi.fn();
    const view = {
      selectedItems: [item],
      pageItems: [item],
    } as unknown as IView & ISelected<typeof item> & { pageItems: (typeof item)[] | undefined };

    render(
      <PageDialogProvider>
        <SingleSelectDialog
          title="Select item"
          view={view}
          tableColumns={[]}
          toolbarFilters={[]}
          onSelect={onSelect}
          confirmText="Confirm"
        />
      </PageDialogProvider>
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onSelect).toHaveBeenCalledWith(item);
  });

  it('does not select an empty first array entry', async () => {
    const onSelect = vi.fn();
    const view = {
      selectedItems: [undefined],
      pageItems: [],
    } as unknown as IView & ISelected<{ id: string }> & { pageItems: { id: string }[] };

    render(
      <PageDialogProvider>
        <SingleSelectDialog
          title="Select item"
          view={view}
          tableColumns={[]}
          toolbarFilters={[]}
          onSelect={onSelect}
          confirmText="Confirm"
        />
      </PageDialogProvider>
    );

    await userEvent.setup().click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onSelect).not.toHaveBeenCalled();
  });
});

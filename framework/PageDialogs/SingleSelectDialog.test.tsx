import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { IView } from '../useView';
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
    } as unknown as IView & { selectedItems: (typeof item)[]; pageItems: (typeof item)[] };

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

    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onSelect).toHaveBeenCalledWith(item);
  });
});

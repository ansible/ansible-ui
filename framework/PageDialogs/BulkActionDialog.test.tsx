/* eslint-disable i18next/no-literal-string */
import { describe, expect, it, vi } from 'vitest';
import { BulkActionDialog, BulkActionDialogProps, useBulkActionDialog } from './BulkActionDialog';

interface Item {
  id: number;
  name: string;
}

describe('BulkActionDialog', () => {
  it('exports the BulkActionDialog component', () => {
    expect(BulkActionDialog).toBeDefined();
    expect(typeof BulkActionDialog).toBe('function');
  });

  it('exports the useBulkActionDialog hook', () => {
    expect(useBulkActionDialog).toBeDefined();
    expect(typeof useBulkActionDialog).toBe('function');
  });

  it('BulkActionDialogProps interface is correctly typed', () => {
    const actionFn = vi.fn();
    const onClose = vi.fn();
    const keyFn = (item: Item) => item.id;

    const props: BulkActionDialogProps<Item> = {
      title: 'Test Title',
      items: [{ id: 1, name: 'Item 1' }],
      keyFn,
      actionFn,
      onClose,
      actionColumns: [{ header: 'Name', cell: (item) => item.name }],
      processingText: 'Processing...',
    };

    expect(props.title).toBe('Test Title');
    expect(props.items).toHaveLength(1);
    expect(props.keyFn).toBe(keyFn);
    expect(props.actionFn).toBe(actionFn);
    expect(props.onClose).toBe(onClose);
    expect(props.actionColumns).toHaveLength(1);
    expect(props.processingText).toBe('Processing...');
  });
});

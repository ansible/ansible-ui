import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { FrameworkTranslationsProvider } from '../useFrameworkTranslations';
import { BulkActionDialog, BulkActionDialogProps, useBulkActionDialog } from './BulkActionDialog';
import { PageDialogProvider } from './PageDialog';

vi.mock('@patternfly/react-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-core')>();
  return {
    ...actual,
    Modal: ({
      children,
      'aria-label': ariaLabel,
    }: {
      children: React.ReactNode;
      'aria-label': string;
    }) => (
      <dialog open aria-label={ariaLabel}>
        {children}
      </dialog>
    ),
  };
});

interface Item {
  id: number;
  name: string;
}

const keyFn = (item: Item) => item.id;
const actionColumns = [{ header: 'Name', cell: (item: Item) => item.name }];

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <FrameworkTranslationsProvider>
      <PageDialogProvider>{children}</PageDialogProvider>
    </FrameworkTranslationsProvider>
  );
}

function renderDialog(overrides: Partial<BulkActionDialogProps<Item>> = {}) {
  const props: BulkActionDialogProps<Item> = {
    title: 'Delete items',
    items: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ],
    keyFn,
    actionColumns,
    actionFn: vi.fn().mockResolvedValue(undefined),
    processingText: 'Deleting...',
    ...overrides,
  };

  return render(
    <Wrapper>
      <BulkActionDialog<Item> {...props} />
    </Wrapper>
  );
}

describe('BulkActionDialog', () => {
  it('should export the BulkActionDialog component', () => {
    expect(BulkActionDialog).toBeDefined();
    expect(typeof BulkActionDialog).toBe('function');
  });

  it('should export the useBulkActionDialog hook', () => {
    expect(useBulkActionDialog).toBeDefined();
    expect(typeof useBulkActionDialog).toBe('function');
  });

  it('BulkActionDialogProps interface is correctly typed', () => {
    const actionFn = vi.fn();
    const onClose = vi.fn();

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

  it('should render the dialog with title and items', () => {
    renderDialog();

    expect(screen.getByText('Delete items')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should show Success status when all actions succeed', async () => {
    const actionFn = vi.fn().mockResolvedValue(undefined);
    renderDialog({ actionFn });

    await waitFor(() => {
      const elements = screen.getAllByText('Success');
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should show error message and Retry button when an action fails', async () => {
    const actionFn = vi.fn().mockImplementation((item: Item) => {
      if (item.id === 1) return Promise.reject(new Error('Conflict: resource is in use'));
      return Promise.resolve(undefined);
    });

    renderDialog({ actionFn });

    await waitFor(() => {
      expect(screen.getByText('Conflict: resource is in use')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('should show Unknown error when rejection is not an Error instance', async () => {
    const actionFn = vi.fn().mockRejectedValue('string error');

    renderDialog({ items: [{ id: 1, name: 'Item 1' }], actionFn });

    await waitFor(() => {
      expect(screen.getByText('Unknown error')).toBeInTheDocument();
    });
  });

  it('should use a custom error adapter to parse error messages', async () => {
    const customErrorAdapter = vi.fn().mockReturnValue({
      genericErrors: [{ message: 'Custom parsed error' }],
      fieldErrors: [],
    });
    const actionFn = vi.fn().mockRejectedValue(new Error('raw error'));

    renderDialog({
      items: [{ id: 1, name: 'Item 1' }],
      actionFn,
      errorAdapter: customErrorAdapter,
    });

    await waitFor(() => {
      expect(customErrorAdapter).toHaveBeenCalled();
      expect(screen.getByText('Custom parsed error')).toBeInTheDocument();
    });
  });

  it('should show Cancel button while processing', async () => {
    const actionFn = vi.fn().mockImplementation(() => new Promise<void>(() => {}));

    renderDialog({ items: [{ id: 1, name: 'Item 1' }], actionFn });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
  });

  it('should call onClose with failure status when actions fail', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const actionFn = vi.fn().mockRejectedValue(new Error('fail'));

    renderDialog({ items: [{ id: 1, name: 'Item 1' }], actionFn, onClose });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledWith(
      'failures',
      expect.anything(),
      expect.anything(),
      expect.anything()
    );
  });

  it('should render progress bar', async () => {
    renderDialog();

    await waitFor(() => {
      expect(screen.getByTestId('progress')).toBeInTheDocument();
    });
  });
});

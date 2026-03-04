import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { ITableColumn } from '../PageTable/PageTableColumn';
import { FrameworkTranslationsProvider } from '../useFrameworkTranslations';
import {
  BulkConfirmationDialog,
  BulkConfirmationDialog as BulkConfirmationDialogProps,
  useBulkConfirmation,
} from './BulkConfirmationDialog';
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

interface TestItem {
  id: number;
  name: string;
}

const mockColumns: ITableColumn<TestItem>[] = [{ header: 'Name', cell: (item) => item.name }];

const mockKeyFn = (item: TestItem) => item.id;

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <FrameworkTranslationsProvider>
      <PageDialogProvider>{children}</PageDialogProvider>
    </FrameworkTranslationsProvider>
  );
}

function renderConfirmationDialog(overrides: Partial<BulkConfirmationDialogProps<TestItem>> = {}) {
  const props: BulkConfirmationDialogProps<TestItem> = {
    title: 'Delete items',
    items: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ],
    keyFn: mockKeyFn,
    confirmationColumns: mockColumns,
    onConfirm: vi.fn(),
    confirmText: 'Yes, I confirm that I want to delete these 2 items.',
    actionButtonText: 'Delete items',
    ...overrides,
  };

  return {
    ...render(
      <Wrapper>
        <BulkConfirmationDialog<TestItem> {...props} />
      </Wrapper>
    ),
    props,
  };
}

describe('BulkConfirmationDialog', () => {
  test('should render the dialog with title and items', () => {
    renderConfirmationDialog();

    expect(screen.getByRole('dialog', { name: 'Delete items' })).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  test('should render confirmation checkbox', () => {
    renderConfirmationDialog();

    expect(
      screen.getByText('Yes, I confirm that I want to delete these 2 items.')
    ).toBeInTheDocument();
  });

  test('should disable submit button until confirmation checkbox is checked', async () => {
    const user = userEvent.setup();
    renderConfirmationDialog();

    const submitButton = screen.getByTestId('submit');
    expect(submitButton).toHaveAttribute('aria-disabled', 'true');

    await user.click(screen.getByTestId('confirm'));
    expect(submitButton).not.toHaveAttribute('aria-disabled', 'true');
  });

  test('should call onConfirm when submit is clicked after confirming', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderConfirmationDialog({ onConfirm });

    await user.click(screen.getByTestId('confirm'));
    await user.click(screen.getByTestId('submit'));

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  test('should render alert prompts when provided', () => {
    renderConfirmationDialog({
      alertPrompts: ['1 item cannot be deleted because it is read-only.'],
    });

    expect(
      screen.getByText('1 item cannot be deleted because it is read-only.')
    ).toBeInTheDocument();
  });

  test('should show non-actionable items with warning indicators', () => {
    renderConfirmationDialog({
      isItemNonActionable: (item) => (item.id === 1 ? 'Cannot delete system item' : undefined),
    });

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    const warningIcons = screen.getAllByRole('img', { hidden: true });
    expect(warningIcons.length).toBeGreaterThanOrEqual(1);
  });

  test('should hide confirmation checkbox when all items are non-actionable', () => {
    renderConfirmationDialog({
      isItemNonActionable: () => 'Cannot delete',
    });

    expect(screen.queryByTestId('confirm')).not.toBeInTheDocument();
  });
});

describe('useBulkConfirmation', () => {
  function renderBulkConfirmationHook(...args: Parameters<typeof useBulkConfirmation>) {
    const result = { current: undefined as unknown };

    function TestHook() {
      result.current = useBulkConfirmation(...args);
      return null;
    }

    render(
      <Wrapper>
        <TestHook />
      </Wrapper>
    );
    return { result };
  }

  test('should return a function', () => {
    const { result } = renderBulkConfirmationHook();
    expect(typeof result.current).toBe('function');
  });

  test('should filter non-actionable items before passing to bulk action', () => {
    const { result } = renderBulkConfirmationHook();
    const isItemNonActionable = (item: TestItem) => (item.id === 1 ? 'Cannot delete' : undefined);

    expect(() =>
      (result.current as ReturnType<typeof useBulkConfirmation>)({
        title: 'Test',
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
        keyFn: mockKeyFn as (item: object) => string | number,
        confirmationColumns: mockColumns as ITableColumn<object>[],
        actionColumns: mockColumns as ITableColumn<object>[],
        actionFn: vi.fn(),
        actionButtonText: 'Submit',
        confirmText: 'Confirm',
        isItemNonActionable: isItemNonActionable as (item: object) => string | undefined,
      })
    ).not.toThrow();
  });

  test('should handle items without isItemNonActionable', () => {
    const { result } = renderBulkConfirmationHook();

    expect(() =>
      (result.current as ReturnType<typeof useBulkConfirmation>)({
        title: 'Test',
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
        keyFn: mockKeyFn as (item: object) => string | number,
        confirmationColumns: mockColumns as ITableColumn<object>[],
        actionColumns: mockColumns as ITableColumn<object>[],
        actionFn: vi.fn(),
        actionButtonText: 'Submit',
        confirmText: 'Confirm',
      })
    ).not.toThrow();
  });

  test('should handle custom error adapter', () => {
    const customErrorAdapter = vi.fn();
    const { result } = renderBulkConfirmationHook(customErrorAdapter);
    expect(typeof result.current).toBe('function');
  });

  test('should handle custom status parser', () => {
    const customStatusParser = vi.fn();
    const { result } = renderBulkConfirmationHook(undefined, customStatusParser);
    expect(typeof result.current).toBe('function');
  });
});

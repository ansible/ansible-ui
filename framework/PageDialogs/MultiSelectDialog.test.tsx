/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { IToolbarFilter } from '../PageToolbar/PageToolbarFilter';
import { ITableColumn } from '../PageTable/PageTableColumn';
import { MultiSelectDialog } from './MultiSelectDialog';

const mockSetDialog = vi.fn();

vi.mock('./PageDialog', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./PageDialog')>();
  return {
    ...actual,
    usePageDialog: () => [undefined, mockSetDialog] as const,
  };
});

vi.mock('../PageTable/PageMultiSelectList', () => ({
  PageMultiSelectList: () => <div data-testid="multi-select-list" />,
}));

interface TestItem {
  id: number;
  name: string;
}

const tableColumns: ITableColumn<TestItem>[] = [
  { header: 'Name', card: 'name', cell: (item) => item.name, value: (item) => item.name },
];

const toolbarFilters: IToolbarFilter[] = [];

function buildView(overrides: Partial<MultiSelectDialogProps['view']> = {}) {
  return {
    page: 1,
    setPage: vi.fn(),
    perPage: 10,
    setPerPage: vi.fn(),
    sort: 'name',
    setSort: vi.fn(),
    sortDirection: 'asc' as const,
    setSortDirection: vi.fn(),
    filterState: {},
    setFilterState: vi.fn(),
    clearAllFilters: vi.fn(),
    selectedItems: [{ id: 1, name: 'One' }],
    selectItem: vi.fn(),
    selectItems: vi.fn(),
    unselectItem: vi.fn(),
    unselectItems: vi.fn(),
    isSelected: vi.fn(() => false),
    selectAll: vi.fn(),
    unselectAll: vi.fn(),
    allSelected: false,
    keyFn: (item: TestItem) => item.id,
    pageItems: [{ id: 1, name: 'One' }],
    itemCount: 1,
    ...overrides,
  };
}

type MultiSelectDialogProps = Parameters<typeof MultiSelectDialog<TestItem>>[0];

describe('MultiSelectDialog', () => {
  it('confirms selection and closes the dialog', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClose = vi.fn();

    render(
      <MultiSelectDialog
        title="Pick items"
        description="Choose one or more"
        view={buildView()}
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        onSelect={onSelect}
        onClose={onClose}
        confirmText="Apply"
        cancelText="Dismiss"
      />
    );

    expect(screen.getByTestId('multi-select-list')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onClose).toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledWith([{ id: 1, name: 'One' }]);
    expect(mockSetDialog).not.toHaveBeenCalled();
  });

  it('closes via cancel and uses default dialog dismiss', async () => {
    const user = userEvent.setup();

    render(
      <MultiSelectDialog
        title="Pick items"
        view={buildView({ selectedItems: [] })}
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        onSelect={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockSetDialog).toHaveBeenCalledWith(undefined);
  });

  it('disables confirm when nothing is selected and zero selections are not allowed', () => {
    render(
      <MultiSelectDialog
        title="Pick items"
        view={buildView({ selectedItems: [] })}
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('allows confirming with zero selections when enabled', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <MultiSelectDialog
        title="Pick items"
        view={buildView({ selectedItems: [] })}
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        onSelect={onSelect}
        allowZeroSelections
      />
    );

    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onSelect).toHaveBeenCalledWith([]);
  });
});

/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { PageDialogProvider } from './PageDialog';
import { IView } from '../useView';
import { ISelected } from '../PageTable/useTableItems';
import { SelectDialog } from './useSelectDialog';
import { ITableColumn } from '../PageTable/PageTableColumn';
import { IToolbarFilter, ToolbarFilterType } from '../PageToolbar/PageToolbarFilter';

type SelectDialogView = IView &
  ISelected<TestItem> & { itemCount?: number; pageItems: TestItem[] | undefined };

vi.mock('focus-trap', () => ({
  createFocusTrap: () => ({
    activate: vi.fn(),
    deactivate: vi.fn(),
    pause: vi.fn(),
    unpause: vi.fn(),
  }),
}));

interface TestItem {
  id: number;
  name: string;
  description: string;
}

const testItems: TestItem[] = [
  { id: 1, name: 'Item One', description: 'First item' },
  { id: 2, name: 'Item Two', description: 'Second item' },
  { id: 3, name: 'Item Three', description: 'Third item' },
];

const tableColumns: ITableColumn<TestItem>[] = [
  { header: 'Name', cell: (item) => item.name, card: 'name', list: 'name' },
  { header: 'Description', cell: (item) => item.description },
];

const toolbarFilters: IToolbarFilter[] = [
  {
    key: 'name',
    label: 'Name',
    type: ToolbarFilterType.SingleText,
    query: 'name',
    comparison: 'contains',
  },
];

function createMockView(selectedItems: TestItem[] = []): SelectDialogView {
  return {
    pageItems: testItems,
    itemCount: testItems.length,
    page: 1,
    perPage: 10,
    setPage: vi.fn(),
    setPerPage: vi.fn(),
    sort: undefined,
    setSort: vi.fn(),
    sortDirection: undefined,
    setSortDirection: vi.fn(),
    filterState: {},
    setFilterState: vi.fn(),
    clearAllFilters: vi.fn(),
    keyFn: (item: TestItem) => item.id,
    selectedItems,
    isSelected: (item: TestItem) => selectedItems.some((i) => i.id === item.id),
    selectItem: vi.fn(),
    unselectItem: vi.fn(),
    selectItems: vi.fn(),
    unselectAll: vi.fn(),
    allSelected: false,
    selectAll: vi.fn(),
  } as unknown as SelectDialogView;
}

describe('SelectDialog', () => {
  beforeAll(() => {
    const portalRoot = document.createElement('div');
    portalRoot.setAttribute('id', 'portal-root');
    document.body.appendChild(portalRoot);
  });

  afterAll(() => {
    const portalRoot = document.getElementById('portal-root');
    portalRoot?.remove();
  });

  it('should render the dialog with title', () => {
    const view = createMockView();
    render(
      <PageDialogProvider>
        <SelectDialog<TestItem, false>
          title="Select Items"
          open={true}
          setOpen={vi.fn()}
          onSelect={vi.fn()}
          view={view}
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          confirm="Confirm"
          cancel="Cancel"
          selected="Selected"
          keyFn={(item) => item.id}
        />
      </PageDialogProvider>
    );

    expect(screen.getByText('Select Items')).toBeInTheDocument();
  });

  it('should display confirm and cancel buttons', () => {
    const view = createMockView();
    render(
      <PageDialogProvider>
        <SelectDialog<TestItem, false>
          title="Select Items"
          open={true}
          setOpen={vi.fn()}
          onSelect={vi.fn()}
          view={view}
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          confirm="Confirm"
          cancel="Cancel"
          selected="Selected"
          keyFn={(item) => item.id}
        />
      </PageDialogProvider>
    );

    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should show "None" message when nothing is selected', () => {
    const view = createMockView([]);
    render(
      <PageDialogProvider>
        <SelectDialog<TestItem, false>
          title="Select Items"
          open={true}
          setOpen={vi.fn()}
          onSelect={vi.fn()}
          view={view}
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          confirm="Confirm"
          cancel="Cancel"
          selected="Selected"
          keyFn={(item) => item.id}
        />
      </PageDialogProvider>
    );

    expect(screen.getByText(/None/)).toBeInTheDocument();
  });

  it('should disable confirm button when no items are selected', () => {
    const view = createMockView([]);
    render(
      <PageDialogProvider>
        <SelectDialog<TestItem, false>
          title="Select Items"
          open={true}
          setOpen={vi.fn()}
          onSelect={vi.fn()}
          view={view}
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          confirm="Confirm"
          cancel="Cancel"
          selected="Selected"
          keyFn={(item) => item.id}
        />
      </PageDialogProvider>
    );

    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('should close the dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    const setOpen = vi.fn();
    const view = createMockView([]);

    render(
      <PageDialogProvider>
        <SelectDialog<TestItem, false>
          title="Select Items"
          open={true}
          setOpen={setOpen}
          onSelect={vi.fn()}
          view={view}
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          confirm="Confirm"
          cancel="Cancel"
          selected="Selected"
          keyFn={(item) => item.id}
        />
      </PageDialogProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it('should call onSelect with selected item and close on confirm', async () => {
    const user = userEvent.setup();
    const setOpen = vi.fn();
    const onSelect = vi.fn();
    const selectedItem = testItems[0];
    const view = createMockView([selectedItem]);

    render(
      <PageDialogProvider>
        <SelectDialog<TestItem, false>
          title="Select Items"
          open={true}
          setOpen={setOpen}
          onSelect={onSelect}
          view={view}
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          confirm="Confirm"
          cancel="Cancel"
          selected="Selected"
          keyFn={(item) => item.id}
        />
      </PageDialogProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith(selectedItem);
      expect(setOpen).toHaveBeenCalledWith(false);
    });
  });

  it('should display selected items as chips', () => {
    const selectedItems = [testItems[0], testItems[1]];
    const view = createMockView(selectedItems);

    render(
      <PageDialogProvider>
        <SelectDialog<TestItem, true>
          title="Select Items"
          open={true}
          isMultiple={true}
          setOpen={vi.fn()}
          onSelect={vi.fn()}
          view={view}
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          confirm="Confirm"
          cancel="Cancel"
          selected="Selected"
          keyFn={(item) => item.id}
        />
      </PageDialogProvider>
    );

    const itemOneElements = screen.getAllByText('Item One');
    const itemTwoElements = screen.getAllByText('Item Two');
    expect(itemOneElements.length).toBeGreaterThanOrEqual(2);
    expect(itemTwoElements.length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText(/None/)).not.toBeInTheDocument();
  });

  it('should call onSelect with all items in multiple mode', async () => {
    const user = userEvent.setup();
    const setOpen = vi.fn();
    const onSelect = vi.fn();
    const selectedItems = [testItems[0], testItems[1]];
    const view = createMockView(selectedItems);

    render(
      <PageDialogProvider>
        <SelectDialog<TestItem, true>
          title="Select Items"
          open={true}
          isMultiple={true}
          setOpen={setOpen}
          onSelect={onSelect}
          view={view}
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          confirm="Confirm"
          cancel="Cancel"
          selected="Selected"
          keyFn={(item) => item.id}
        />
      </PageDialogProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith(selectedItems);
      expect(setOpen).toHaveBeenCalledWith(false);
    });
  });

  it('should display the selected label', () => {
    const view = createMockView([]);
    render(
      <PageDialogProvider>
        <SelectDialog<TestItem, false>
          title="Select Items"
          open={true}
          setOpen={vi.fn()}
          onSelect={vi.fn()}
          view={view}
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          confirm="Confirm"
          cancel="Cancel"
          selected="Selected"
          keyFn={(item) => item.id}
        />
      </PageDialogProvider>
    );

    expect(screen.getByText('Selected')).toBeInTheDocument();
  });

  it('should not render when open is false', () => {
    const view = createMockView([]);
    render(
      <PageDialogProvider>
        <SelectDialog<TestItem, false>
          title="Select Items"
          open={false}
          setOpen={vi.fn()}
          onSelect={vi.fn()}
          view={view}
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          confirm="Confirm"
          cancel="Cancel"
          selected="Selected"
          keyFn={(item) => item.id}
        />
      </PageDialogProvider>
    );

    expect(screen.queryByText('Select Items')).not.toBeInTheDocument();
  });

  it('should show skeleton when itemCount is undefined', () => {
    const view = createMockView([]);
    const loadingView = { ...view, itemCount: undefined } as unknown as SelectDialogView;

    render(
      <PageDialogProvider>
        <SelectDialog<TestItem, false>
          title="Select Items"
          open={true}
          setOpen={vi.fn()}
          onSelect={vi.fn()}
          view={loadingView}
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          confirm="Confirm"
          cancel="Cancel"
          selected="Selected"
          keyFn={(item) => item.id}
        />
      </PageDialogProvider>
    );

    expect(screen.getByText('Select Items')).toBeInTheDocument();
  });

  it('should call unselectItem when chip is clicked', async () => {
    const user = userEvent.setup();
    const unselectItem = vi.fn();
    const selectedItems = [testItems[0]];
    const view = {
      ...createMockView(selectedItems),
      unselectItem,
    } as unknown as SelectDialogView;

    render(
      <PageDialogProvider>
        <SelectDialog<TestItem, false>
          title="Select Items"
          open={true}
          setOpen={vi.fn()}
          onSelect={vi.fn()}
          view={view}
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          confirm="Confirm"
          cancel="Cancel"
          selected="Selected"
          keyFn={(item) => item.id}
        />
      </PageDialogProvider>
    );

    const chipButtons = screen.getAllByRole('button', { name: /close/i });
    const chipClose = chipButtons.find(
      (btn) => btn.closest('[class*="label"]') || btn.closest('[class*="chip"]')
    );
    if (chipClose) {
      await user.click(chipClose);
      expect(unselectItem).toHaveBeenCalledWith(testItems[0]);
    }
  });
});

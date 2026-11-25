import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PageActionSelection, PageActionType, type IPageAction } from '../PageActions/PageAction';
import { PageToolbar } from './PageToolbar';
import { ToolbarFilterType, type IToolbarFilter } from './PageToolbarFilter';

vi.mock('../components/useBreakPoint', () => ({ useBreakpoint: () => true }));

type Item = { id: string };
const keyFn = (item: Item) => item.id;
const multipleAction: IPageAction<Item> = {
  type: PageActionType.Button,
  selection: PageActionSelection.Multiple,
  label: 'Run for selected items',
  onClick: vi.fn(),
};
const ordinaryAction: IPageAction<Item> = {
  type: PageActionType.Button,
  selection: PageActionSelection.None,
  label: 'Create item',
  onClick: vi.fn(),
};
const separatorAction: IPageAction<Item> = { type: PageActionType.Seperator };
const activeTextFilter: IToolbarFilter = {
  type: ToolbarFilterType.SingleText,
  key: 'name',
  label: 'Name',
  query: 'name__icontains',
  comparison: 'contains',
};

describe('PageToolbar selection visibility', () => {
  it('shows a skeleton while the item count is loading', () => {
    const { container } = render(<PageToolbar keyFn={keyFn} showSelect />);

    expect(container.querySelector('.pf-v6-c-skeleton')).toBeInTheDocument();
  });

  it('uses the explicit clear filters callback when filters are reset', async () => {
    const clearAllFilters = vi.fn();

    render(
      <PageToolbar
        keyFn={keyFn}
        itemCount={1}
        toolbarFilters={[activeTextFilter]}
        filterState={{ name: ['alice'] }}
        clearAllFilters={clearAllFilters}
        setFilterState={vi.fn()}
      />
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Clear all filters' }));

    expect(clearAllFilters).toHaveBeenCalledOnce();
  });

  it('clears filter state when no explicit clear filters callback is provided', async () => {
    const setFilterState = vi.fn();

    render(
      <PageToolbar
        keyFn={keyFn}
        itemCount={1}
        toolbarFilters={[activeTextFilter]}
        filterState={{ name: ['alice'] }}
        setFilterState={setFilterState}
      />
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Clear all filters' }));

    expect(setFilterState).toHaveBeenCalledWith({});
  });

  it('shows the selector for multiple-selection actions when items are supplied', () => {
    render(
      <PageToolbar
        keyFn={keyFn}
        itemCount={1}
        selectedItems={[]}
        toolbarActions={[multipleAction]}
      />
    );

    expect(screen.getByTestId('select-all')).toBeInTheDocument();
  });

  it('does not show the selector without selected items', () => {
    render(<PageToolbar keyFn={keyFn} itemCount={1} toolbarActions={[multipleAction]} />);

    expect(screen.queryByTestId('select-all')).not.toBeInTheDocument();
  });

  it('does not show the selector for actions without a multiple selection', () => {
    render(
      <PageToolbar
        keyFn={keyFn}
        itemCount={1}
        selectedItems={[]}
        toolbarActions={[ordinaryAction, separatorAction]}
      />
    );

    expect(screen.queryByTestId('select-all')).not.toBeInTheDocument();
  });

  it('shows the selector when explicitly requested', () => {
    render(
      <PageToolbar
        keyFn={keyFn}
        itemCount={1}
        selectedItems={[]}
        showSelect
        toolbarActions={[ordinaryAction]}
      />
    );

    expect(screen.getByTestId('select-all')).toBeInTheDocument();
  });
});

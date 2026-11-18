/* eslint-disable i18next/no-literal-string */
import { idKeyFn } from '@ansible/common-ui/utils/nameKeyFn';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PageToolbar } from './PageToolbar';
import {
  IFilterState,
  IToolbarFilter,
  PageToolbarFilters,
  ToolbarFilterType,
} from './PageToolbarFilter';
import { IToolbarSingleSelectFilter } from './PageToolbarFilters/ToolbarSingleSelectFilter';
import {
  IToolbarMultiTextFilter,
  IToolbarSearchFilter,
} from './PageToolbarFilters/ToolbarTextFilter';

vi.mock('../components/useBreakPoint', () => ({
  useBreakpoint: () => false,
}));

function FiltersHarness(
  props: Readonly<{
    toolbarFilters: IToolbarFilter[];
    initialFilterState?: IFilterState;
    limitFiltersToOneOrOperation?: boolean;
  }>
) {
  const [filterState, setFilterState] = useState<IFilterState>(props.initialFilterState ?? {});
  return (
    <>
      <PageToolbarFilters
        toolbarFilters={props.toolbarFilters}
        filterState={filterState}
        setFilterState={setFilterState}
        limitFiltersToOneOrOperation={props.limitFiltersToOneOrOperation}
      />
      <pre data-testid="filter-state">{JSON.stringify(filterState)}</pre>
    </>
  );
}

function createSingleSelectFilter(isPinned?: boolean): IToolbarSingleSelectFilter {
  return {
    type: ToolbarFilterType.SingleSelect,
    key: 'status',
    query: 'status',
    label: 'Status',
    options: [
      { value: '1', label: 'Running' },
      { value: '2', label: 'Failed' },
    ],
    placeholder: 'Filter by status',
    isPinned,
  };
}

function createMultiTextFilter(key: string, isPinned?: boolean): IToolbarMultiTextFilter {
  return {
    type: ToolbarFilterType.MultiText,
    key,
    query: key,
    label: `Tags ${key}`,
    placeholder: `Filter by ${key}`,
    comparison: 'contains',
    isPinned,
  };
}

describe('PageToolbarFilters', () => {
  it('renders nothing when filters are missing or empty', () => {
    const { container, rerender } = render(<FiltersHarness toolbarFilters={[]} />);
    expect(container.querySelector('[data-testid="text-input"]')).not.toBeInTheDocument();

    rerender(
      <PageToolbarFilters toolbarFilters={undefined} filterState={{}} setFilterState={vi.fn()} />
    );
    expect(container.querySelector('[data-testid="text-input"]')).not.toBeInTheDocument();
  });

  it('adds multi-text filter values from the filter input', async () => {
    const user = userEvent.setup();
    render(<FiltersHarness toolbarFilters={[createMultiTextFilter('tags', true)]} />);

    const input = screen.getByPlaceholderText('Filter by tags');
    await user.type(input, 'alpha{Enter}');

    await waitFor(() => {
      expect(screen.getByTestId('filter-state')).toHaveTextContent('alpha');
    });
  });

  it('switches between grouped filters in the toolbar selector', async () => {
    const user = userEvent.setup();
    const statusFilter = createSingleSelectFilter();
    const tagsFilter = createMultiTextFilter('tags');

    render(<FiltersHarness toolbarFilters={[statusFilter, tagsFilter]} />);

    expect(screen.getByText('Filter by status')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Status' }));
    await user.click(screen.getByRole('option', { name: 'Tags tags' }));
    expect(screen.getByPlaceholderText('Filter by tags')).toBeInTheDocument();
  });

  it('downgrades multi-text input when another filter already uses OR semantics', () => {
    render(
      <FiltersHarness
        toolbarFilters={[createMultiTextFilter('mt1', true), createMultiTextFilter('mt2', true)]}
        limitFiltersToOneOrOperation
        initialFilterState={{ mt1: ['a', 'b'] }}
      />
    );

    expect(screen.getByPlaceholderText('Filter by mt2')).toBeInTheDocument();
  });

  it('updates single-text filter state as the user types', async () => {
    const user = userEvent.setup();
    const filter: IToolbarFilter = {
      type: ToolbarFilterType.SingleText,
      key: 'name',
      query: 'name',
      label: 'Name',
      placeholder: 'Filter by name',
      comparison: 'contains',
      isPinned: true,
    };

    render(<FiltersHarness toolbarFilters={[filter]} />);
    await user.type(screen.getByPlaceholderText('Filter by name'), 'host');

    await waitFor(() => {
      expect(screen.getByTestId('filter-state')).toHaveTextContent('host');
    });
  });

  it('applies search filter values', async () => {
    const user = userEvent.setup();
    const filter: IToolbarSearchFilter = {
      type: ToolbarFilterType.Search,
      key: 'search',
      query: 'search',
      label: 'Search',
      placeholder: 'Search resources',
      isPinned: true,
    };

    render(<FiltersHarness toolbarFilters={[filter]} />);
    await user.type(screen.getByPlaceholderText('Search resources'), 'abc');

    await waitFor(() => {
      expect(screen.getByTestId('filter-state')).toHaveTextContent('abc');
    });
  });
});

describe('PageToolbarFilters with PageToolbar', () => {
  function PageToolbarFiltersHarness(props: {
    toolbarFilters: IToolbarFilter[];
    initialFilterState?: IFilterState;
  }) {
    const [filterState, setFilterState] = useState<IFilterState>(props.initialFilterState ?? {});
    return (
      <>
        <PageToolbar
          keyFn={idKeyFn}
          itemCount={1}
          page={1}
          perPage={10}
          toolbarFilters={props.toolbarFilters}
          filterState={filterState}
          setFilterState={setFilterState}
          disablePagination
          clearAllFilters={() => setFilterState({})}
        />
        <pre data-testid="filter-state">{JSON.stringify(filterState)}</pre>
      </>
    );
  }

  it('removes a multi-select chip label from filter state', async () => {
    const user = userEvent.setup();
    const filter: IToolbarFilter = {
      type: ToolbarFilterType.MultiSelect,
      key: 'ms1',
      query: 'ms1',
      label: 'Multi-Select',
      options: [
        { value: '1', label: 'Option 1' },
        { value: '2', label: 'Option 2' },
      ],
      placeholder: 'Filter by ms1',
    };

    render(
      <PageToolbarFiltersHarness
        toolbarFilters={[filter]}
        initialFilterState={{ ms1: ['1', '2'] }}
      />
    );

    const dismissButtons = screen.getAllByRole('button', { name: /close/i });
    await user.click(dismissButtons[0]);

    await waitFor(() => {
      const state = JSON.parse(
        screen.getByTestId('filter-state').textContent ?? '{}'
      ) as IFilterState;
      expect(state.ms1).toEqual(['2']);
    });
  });
});

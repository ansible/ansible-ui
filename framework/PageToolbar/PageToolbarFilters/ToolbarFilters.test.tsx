/* eslint-disable i18next/no-literal-string */
import { idKeyFn } from '@ansible/common-ui/utils/nameKeyFn';
import { PageSection } from '@patternfly/react-core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { PageToolbar } from '../PageToolbar';
import {
  IFilterState,
  IToolbarFilter,
  PageToolbarFiltersProps,
  ToolbarFilterType,
} from '../PageToolbarFilter';
import { IToolbarDateRangeFilter } from './ToolbarDateRangeFilter';
import { IToolbarMultiSelectFilter } from './ToolbarMultiSelectFilter';
import { IToolbarSingleSelectFilter } from './ToolbarSingleSelectFilter';
import { IToolbarMultiTextFilter, IToolbarSingleTextFilter } from './ToolbarTextFilter';

function ToolbarFiltersTest(
  props: Omit<PageToolbarFiltersProps, 'filterState' | 'setFilterState'>
) {
  const [filterState, setFilterState] = useState<IFilterState>({});
  const clearAllFilters = () => setFilterState((_filters) => ({}));
  return (
    <>
      <PageToolbar
        keyFn={idKeyFn}
        itemCount={1}
        page={1}
        perPage={10}
        {...props}
        filterState={filterState}
        setFilterState={setFilterState}
        disablePagination
        clearAllFilters={clearAllFilters}
      />
      <PageSection hasBodyWrapper={false}>
        Filter State:
        <pre data-testid="filter-state">{JSON.stringify(filterState, undefined, '  ')}</pre>
      </PageSection>
    </>
  );
}

function createSingleTextFilter(
  index: number,
  options?: { isPinned?: boolean; isRequired?: boolean }
): IToolbarSingleTextFilter {
  return {
    type: ToolbarFilterType.SingleText,
    key: `st${index}`,
    query: `st${index}`,
    label: `Single-Text ${index}`,
    placeholder: `Filter by st${index}`,
    comparison: 'contains',
    ...options,
  };
}

function createMultiTextFilter(
  index: number,
  options?: { isPinned?: boolean; isRequired?: boolean }
): IToolbarMultiTextFilter {
  return {
    type: ToolbarFilterType.MultiText,
    key: `mt${index}`,
    query: `mt${index}`,
    label: `Multi-Text ${index}`,
    placeholder: `Filter by mt${index}`,
    comparison: 'contains',
    ...options,
  };
}

function createSingleSelectFilter(
  index: number,
  options?: { isPinned?: boolean; isRequired?: boolean }
): IToolbarSingleSelectFilter {
  return {
    type: ToolbarFilterType.SingleSelect,
    key: `ss${index}`,
    query: `ss${index}`,
    label: `Single-Select ${index}`,
    options: [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
      { value: '3', label: 'Option 3' },
    ],
    placeholder: `Filter by ss${index}`,
    ...options,
  };
}

function createMultiSelectFilter(
  index: number,
  options?: { isPinned?: boolean; isRequired?: boolean }
): IToolbarMultiSelectFilter {
  return {
    type: ToolbarFilterType.MultiSelect,
    key: `ms${index}`,
    query: `ms${index}`,
    label: `Multi-Select ${index}`,
    options: [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
      { value: '3', label: 'Option 3' },
    ],
    placeholder: `Filter by ms${index}`,
    ...options,
  };
}

const dateRangeFilter: IToolbarDateRangeFilter = {
  type: ToolbarFilterType.DateRange,
  key: 'date',
  query: 'date',
  label: 'Date Range',
  options: [
    { value: 'last7days', label: 'Last 7 days' },
    { value: 'last30days', label: 'Last 30 days' },
    { value: 'last90days', label: 'Last 90 days' },
    { value: '', label: 'Custom', isCustom: true },
  ],
  placeholder: 'Filter by date range',
  isPinned: true,
  isRequired: true,
  defaultValue: 'last7days',
};

describe('PageToolbarFilters', () => {
  it('should render pinned items', () => {
    const singleTextFilter1 = createSingleTextFilter(1);
    const singleTextFilter2 = createSingleTextFilter(2, { isPinned: true });
    const multiTextFilter1 = createMultiTextFilter(1);
    const multiTextFilter2 = createMultiTextFilter(2, { isPinned: true });
    const singleSelectFilter1 = createSingleSelectFilter(1);
    const singleSelectFilter2 = createSingleSelectFilter(2, { isPinned: true });
    const multiSelectFilter1 = createMultiSelectFilter(1);
    const multiSelectFilter2 = createMultiSelectFilter(2, { isPinned: true });

    const toolbarFilters: IToolbarFilter[] = [
      singleTextFilter1,
      singleTextFilter2,
      multiTextFilter1,
      multiTextFilter2,
      singleSelectFilter1,
      singleSelectFilter2,
      multiSelectFilter1,
      multiSelectFilter2,
      dateRangeFilter,
    ];

    render(<ToolbarFiltersTest toolbarFilters={toolbarFilters} />);

    // Pinned text filters should show their inputs
    expect(screen.getByPlaceholderText('Filter by st2')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Filter by mt2')).toBeInTheDocument();

    // Pinned select filters should show their placeholders
    expect(screen.getByText('Filter by ss2')).toBeInTheDocument();
    expect(screen.getByText('Filter by ms2')).toBeInTheDocument();

    // Date range filter with default value
    expect(screen.getByText('Last 7 days')).toBeInTheDocument();
  });

  it('should allow typing in text filter', async () => {
    const user = userEvent.setup();
    const singleTextFilter = createSingleTextFilter(1, { isPinned: true });

    render(<ToolbarFiltersTest toolbarFilters={[singleTextFilter]} />);

    const input = screen.getByPlaceholderText('Filter by st1');
    await user.type(input, 'test value');

    expect(input).toHaveValue('test value');
  });

  it('should show apply button for single text filter', async () => {
    const user = userEvent.setup();
    const multiTextFilter = createMultiTextFilter(1, { isPinned: true });

    render(<ToolbarFiltersTest toolbarFilters={[multiTextFilter]} />);

    const input = screen.getByPlaceholderText('Filter by mt1');
    await user.type(input, 'test');

    expect(screen.getByRole('button', { name: 'apply filter' })).toBeInTheDocument();
  });

  it('should render single grouped filter directly without selector', () => {
    const filter = createSingleTextFilter(1);

    render(<ToolbarFiltersTest toolbarFilters={[filter]} />);

    expect(screen.getByPlaceholderText('Filter by st1')).toBeInTheDocument();
  });

  it('should render filter key selector for multiple grouped filters', () => {
    const filter1 = createSingleTextFilter(1);
    const filter2 = createSingleTextFilter(2);

    render(<ToolbarFiltersTest toolbarFilters={[filter1, filter2]} />);

    expect(screen.getByPlaceholderText('Filter by st1')).toBeInTheDocument();
  });

  it('should render single select filter', () => {
    const filter = createSingleSelectFilter(1, { isPinned: true });

    render(<ToolbarFiltersTest toolbarFilters={[filter]} />);

    expect(screen.getByText('Filter by ss1')).toBeInTheDocument();
  });

  it('should add filter chip on multi-text Enter', async () => {
    const user = userEvent.setup();
    const filter = createMultiTextFilter(1, { isPinned: true });

    render(<ToolbarFiltersTest toolbarFilters={[filter]} />);

    const input = screen.getByPlaceholderText('Filter by mt1');
    await user.type(input, 'value1{Enter}');

    const filterState = screen.getByTestId('filter-state');
    expect(filterState.textContent).toContain('value1');
  });

  it('should not render chips for pinned SingleSelect filter', () => {
    const filter = createSingleSelectFilter(1, { isPinned: true });

    render(<ToolbarFiltersTest toolbarFilters={[filter]} />);

    expect(screen.queryByRole('group', { name: 'Single-Select 1' })).not.toBeInTheDocument();
  });

  it('should not render chips for pinned DateRange filter', () => {
    render(<ToolbarFiltersTest toolbarFilters={[dateRangeFilter]} />);

    expect(screen.queryByRole('group', { name: 'Date Range' })).not.toBeInTheDocument();
  });

  it('should render empty when no toolbar filters', () => {
    const { container } = render(<ToolbarFiltersTest toolbarFilters={[]} />);

    expect(container.querySelector('[data-testid="text-input"]')).not.toBeInTheDocument();
  });

  it('should render empty when toolbar filters is undefined', () => {
    const { container } = render(<ToolbarFiltersTest toolbarFilters={undefined} />);

    expect(container.querySelector('[data-testid="text-input"]')).not.toBeInTheDocument();
  });

  it('should hide label for pinned single-select with no value', () => {
    const filter = createSingleSelectFilter(1, { isPinned: true });

    render(<ToolbarFiltersTest toolbarFilters={[filter]} />);

    expect(screen.queryByText('Single-Select 1')).not.toBeInTheDocument();
  });

  it('should render label for single non-pinned filter', () => {
    const filter = createSingleTextFilter(1);

    render(<ToolbarFiltersTest toolbarFilters={[filter]} />);

    expect(screen.getByText('Single-Text 1')).toBeInTheDocument();
  });

  it('should render both grouped and pinned filters', () => {
    const grouped = createSingleTextFilter(1);
    const pinned = createSingleTextFilter(2, { isPinned: true });

    render(<ToolbarFiltersTest toolbarFilters={[grouped, pinned]} />);

    expect(screen.getByPlaceholderText('Filter by st1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Filter by st2')).toBeInTheDocument();
  });

  it('should render multi-select filter', () => {
    const filter = createMultiSelectFilter(1, { isPinned: true });

    render(<ToolbarFiltersTest toolbarFilters={[filter]} />);

    expect(screen.getByText('Filter by ms1')).toBeInTheDocument();
  });

  it('should render date range filter with required default', () => {
    render(<ToolbarFiltersTest toolbarFilters={[dateRangeFilter]} />);

    expect(screen.getByText('Last 7 days')).toBeInTheDocument();
  });
});

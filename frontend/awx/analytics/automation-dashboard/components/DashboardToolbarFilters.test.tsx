/* eslint-disable i18next/no-literal-string */
import {
  IFilterState,
  IToolbarDateRangeFilter,
  IToolbarFilter,
  ToolbarFilterType,
} from '@ansible/ansible-ui-framework';
import { Toolbar, ToolbarContent } from '@patternfly/react-core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DashboardToolbarFilters } from './DashboardToolbarFilters';

function asyncFilter(key: string, label: string): IToolbarFilter {
  return {
    type: ToolbarFilterType.AsyncMultiSelect,
    key,
    label,
    query: key,
    placeholder: `Select ${label}`,
    queryOptions: vi.fn().mockResolvedValue({ options: [], remaining: 0, next: '' }),
    queryLabel: (value: string) => `${label} ${value}`,
  };
}

const templateFilter = asyncFilter('template', 'Template');
const projectFilter = asyncFilter('project', 'Project');

const periodFilter: IToolbarDateRangeFilter = {
  type: ToolbarFilterType.DateRange,
  key: 'period',
  label: 'Period',
  query: 'period',
  placeholder: 'Filter by period',
  isRequired: true,
  defaultValue: 'last_7_days',
  options: [
    { label: 'Last 7 days', value: 'last_7_days' },
    { label: 'Custom', value: 'custom', isCustom: true },
  ],
};

interface RenderFiltersProps {
  toolbarFilters?: IToolbarFilter[];
  periodFilter?: IToolbarDateRangeFilter;
  initialFilterState: IFilterState;
}

/** Owns filterState like the dashboard view does and reports every change. */
function StatefulFilters(
  props: Readonly<RenderFiltersProps & { onChange: (filterState: IFilterState) => void }>
) {
  const { toolbarFilters, periodFilter, initialFilterState, onChange } = props;
  const [filterState, setFilterState] = useState<IFilterState>(initialFilterState);
  onChange(filterState);
  return (
    <Toolbar clearAllFilters={() => setFilterState({})}>
      <ToolbarContent>
        <DashboardToolbarFilters
          toolbarFilters={toolbarFilters}
          periodFilter={periodFilter}
          filterState={filterState}
          setFilterState={setFilterState}
        />
      </ToolbarContent>
    </Toolbar>
  );
}

function renderFilters(props: RenderFiltersProps) {
  let latest = props.initialFilterState;
  render(<StatefulFilters {...props} onChange={(filterState) => (latest = filterState)} />);
  return { getFilterState: () => latest };
}

describe('DashboardToolbarFilters', () => {
  it('renders the filter selector, the selected filter input and the period control', () => {
    renderFilters({
      toolbarFilters: [templateFilter, projectFilter],
      periodFilter,
      initialFilterState: { period: ['last_7_days'] },
    });

    expect(screen.getByRole('button', { name: 'Template' })).toBeInTheDocument();
    expect(screen.getByText('Select Template')).toBeInTheDocument();
    expect(screen.getByTestId('automation-dashboard-period-filter')).toBeInTheDocument();
  });

  it('renders only the period control when there are no other filters', () => {
    renderFilters({ periodFilter, initialFilterState: { period: ['last_7_days'] } });

    expect(screen.getByTestId('automation-dashboard-period-filter')).toBeInTheDocument();
    expect(screen.queryByText('Select Template')).not.toBeInTheDocument();
  });

  it('adds the values picked in the filter input to filterState', async () => {
    const user = userEvent.setup();
    const filterWithOptions: IToolbarFilter = {
      ...templateFilter,
      queryOptions: vi.fn().mockResolvedValue({
        options: [
          { label: 'Template A', value: '1' },
          { label: 'Template B', value: '2' },
        ],
        remaining: 0,
        next: '',
      }),
    } as IToolbarFilter;
    const { getFilterState } = renderFilters({
      toolbarFilters: [filterWithOptions],
      initialFilterState: { period: ['last_7_days'] },
    });

    await user.click(screen.getByText('Select Template'));
    await user.click(await screen.findByText('Template A'));
    expect(getFilterState()).toEqual({ period: ['last_7_days'], template: ['1'] });

    await user.click(screen.getByText('Template B'));
    expect(getFilterState()).toEqual({ period: ['last_7_days'], template: ['1', '2'] });
  });

  it('switches the filter input when another filter is selected', async () => {
    const user = userEvent.setup();
    renderFilters({
      toolbarFilters: [templateFilter, projectFilter],
      initialFilterState: {},
    });

    await user.click(screen.getByRole('button', { name: 'Template' }));
    await user.click(screen.getByRole('option', { name: 'Project' }));

    expect(screen.getByText('Select Project')).toBeInTheDocument();
  });

  it('shows the label instead of a selector when there is a single filter', () => {
    renderFilters({ toolbarFilters: [templateFilter], initialFilterState: {} });

    expect(screen.getByText('Template')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Template' })).not.toBeInTheDocument();
  });

  it('renders chips for selected values but not for the period', () => {
    renderFilters({
      toolbarFilters: [templateFilter],
      periodFilter,
      initialFilterState: { period: ['last_7_days'], template: ['1', '2'] },
    });

    // PatternFly renders the chip group twice (toolbar + collapsed toggle-group content).
    expect(screen.getAllByRole('button', { name: 'Close Template 1' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Close Template 2' }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: 'Close Last 7 days' })).not.toBeInTheDocument();
  });

  it('shows the number of selected values in the filter input, as the framework does', () => {
    renderFilters({
      toolbarFilters: [templateFilter],
      initialFilterState: { template: ['1'] },
    });

    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });

  it('shows the count for several selected values', () => {
    renderFilters({
      toolbarFilters: [templateFilter],
      initialFilterState: { template: ['1', '2', '3'] },
    });

    expect(screen.getByText('3 selected')).toBeInTheDocument();
  });

  it('removes a value when its chip is closed', async () => {
    const user = userEvent.setup();
    const { getFilterState } = renderFilters({
      toolbarFilters: [templateFilter],
      initialFilterState: { period: ['last_7_days'], template: ['1', '2'] },
    });

    await user.click(screen.getAllByRole('button', { name: 'Close Template 1' })[0]);

    expect(getFilterState()).toEqual({ period: ['last_7_days'], template: ['2'] });
  });

  it('drops the filter key when its last chip is closed', async () => {
    const user = userEvent.setup();
    const { getFilterState } = renderFilters({
      toolbarFilters: [templateFilter],
      initialFilterState: { period: ['last_7_days'], template: ['1'] },
    });

    await user.click(screen.getAllByRole('button', { name: 'Close Template 1' })[0]);

    // The multi-select may write back an empty list (as with the framework filters); an empty
    // filter is ignored by the query string and the default-state check either way.
    expect(getFilterState().period).toEqual(['last_7_days']);
    expect(getFilterState().template ?? []).toEqual([]);
  });

  it('removes all values of a filter when its chip group is closed', async () => {
    const user = userEvent.setup();
    const { getFilterState } = renderFilters({
      toolbarFilters: [templateFilter],
      initialFilterState: { period: ['last_7_days'], template: ['1', '2'] },
    });

    await user.click(screen.getAllByRole('button', { name: /Close label group/ })[0]);

    expect(getFilterState().period).toEqual(['last_7_days']);
    expect(getFilterState().template ?? []).toEqual([]);
  });

  it('ignores filter types the dashboard does not use', () => {
    const searchFilter: IToolbarFilter = {
      type: ToolbarFilterType.Search,
      key: 'name',
      label: 'Name',
      query: 'name',
    };
    renderFilters({ toolbarFilters: [searchFilter], periodFilter, initialFilterState: {} });

    expect(screen.queryByText('Name')).not.toBeInTheDocument();
    expect(screen.getByTestId('automation-dashboard-period-filter')).toBeInTheDocument();
  });

  it('renders nothing without filters or a period filter', () => {
    renderFilters({ toolbarFilters: [], initialFilterState: {} });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('applies the PatternFly breakpoint classes that drive the responsive layout', () => {
    renderFilters({
      toolbarFilters: [templateFilter, projectFilter],
      periodFilter,
      initialFilterState: { period: ['last_7_days'] },
    });

    // The "Filter" label is only shown in the collapsed (below `md`) panel.
    expect(screen.getByText('Filter')).toHaveClass('pf-v6-u-hidden-on-md');
    // Between `md` and `lg` the toggle group spans the toolbar and wraps, so the period can take
    // its own row; from `lg` up it is auto width again.
    expect(screen.getByTestId('automation-dashboard-filters')).toHaveClass(
      'pf-m-wrap',
      'pf-v6-u-w-100-on-md',
      'pf-v6-u-w-auto-on-lg'
    );
  });
});

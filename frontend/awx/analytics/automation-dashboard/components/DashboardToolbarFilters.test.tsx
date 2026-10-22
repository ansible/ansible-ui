/* eslint-disable i18next/no-literal-string */
import {
  IFilterState,
  IToolbarDateRangeFilter,
  ToolbarFilterType,
} from '@ansible/ansible-ui-framework';
import { Toolbar, ToolbarContent } from '@patternfly/react-core';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { useState } from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PageAsyncSelectQueryResult } from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSelectOptions';
import { metricsAPI } from '../../../common/api/metrics-utils';
import type { AutomationDashboardAsyncFilter } from '../common/useAutomationDashboardAsyncOptions';
import { useAutomationDashboardToolbarFilters } from '../common/useAutomationDashboardToolbarFilters';
import { allSelectedKey, selectFilterValues } from '../utils/filterStateUpdates';
import { DashboardToolbarFilters } from './DashboardToolbarFilters';

type AsyncQueryResult = PageAsyncSelectQueryResult<string>;

const TEMPLATE_A = 'Template A';
const SELECT_TEMPLATE = 'Select Template';
const SELECT_ALL = 'Select all';
const FILTER_INPUT_TEST_ID = 'filter-input';

function asyncFilter(key: string, label: string): AutomationDashboardAsyncFilter {
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

/** Query options with two pages: "Template A" (1), then "Template B" (2). */
function createTwoPageQueryOptions() {
  return vi.fn(
    ({ next }: { next?: number | string }): Promise<AsyncQueryResult> =>
      Promise.resolve(
        Number(next ?? 1) === 1
          ? { options: [{ label: TEMPLATE_A, value: '1' }], remaining: 1, next: 2 }
          : { options: [{ label: 'Template B', value: '2' }], remaining: 0, next: 3 }
      )
  );
}

interface RenderFiltersProps {
  toolbarFilters?: AutomationDashboardAsyncFilter[];
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

/**
 * Finds an option in the open filter select: the close button of its chip is named by the same
 * text, so a query on the whole screen would find both.
 */
async function findOption(label: string) {
  const menu = await waitFor(() => {
    const element = document.getElementById(`${FILTER_INPUT_TEST_ID}-select`);
    expect(element).not.toBeNull();
    return element!;
  });
  return within(menu).findByLabelText(label);
}

function renderFilters(props: RenderFiltersProps) {
  let latest = props.initialFilterState;
  render(<StatefulFilters {...props} onChange={(filterState) => (latest = filterState)} />);
  return { getFilterState: () => latest };
}

// Some tests open the filter select and pick options: they get more time than the default
// 5 seconds for slower, parallel CI runs, as in AutomationDashboardAsyncMultiSelectFilter.test.
describe('DashboardToolbarFilters', { timeout: 15000 }, () => {
  it('renders the filter selector, the selected filter input and the period control', () => {
    renderFilters({
      toolbarFilters: [templateFilter, projectFilter],
      periodFilter,
      initialFilterState: { period: ['last_7_days'] },
    });

    expect(screen.getByRole('button', { name: 'Template' })).toBeInTheDocument();
    expect(screen.getByText(SELECT_TEMPLATE)).toBeInTheDocument();
    expect(screen.getByTestId('automation-dashboard-period-filter')).toBeInTheDocument();
  });

  it('keeps "Select all" in filterState and shows "All selected"', async () => {
    const user = userEvent.setup();
    const { getFilterState } = renderFilters({
      toolbarFilters: [{ ...templateFilter, queryOptions: createTwoPageQueryOptions() }],
      initialFilterState: { period: ['last_7_days'] },
    });
    await user.click(screen.getByText(SELECT_TEMPLATE));
    await screen.findByLabelText(TEMPLATE_A);

    await user.click(screen.getByLabelText(SELECT_ALL));

    await waitFor(() => expect(getFilterState().template).toEqual(['1', '2']));
    expect(getFilterState()[allSelectedKey('template')]?.[0]).toBe('');
    expect(screen.getByTestId(FILTER_INPUT_TEST_ID)).toHaveTextContent('All selected');
  });

  it('shows "All N matching" restored from filterState, e.g. a saved report or the URL', () => {
    const filterState = selectFilterValues(
      { period: ['last_7_days'] },
      'template',
      () => ['1', '2'],
      { search: 'Template', values: ['1', '2'] }
    );

    renderFilters({
      toolbarFilters: [templateFilter, projectFilter],
      initialFilterState: filterState,
    });

    expect(screen.getByTestId(FILTER_INPUT_TEST_ID)).toHaveTextContent('All 2 matching');
  });

  it('renders only the period control when there are no other filters', () => {
    renderFilters({ periodFilter, initialFilterState: { period: ['last_7_days'] } });

    expect(screen.getByTestId('automation-dashboard-period-filter')).toBeInTheDocument();
    expect(screen.queryByText(SELECT_TEMPLATE)).not.toBeInTheDocument();
  });

  it('adds the values picked in the filter input to filterState', async () => {
    const user = userEvent.setup();
    const filterWithOptions: AutomationDashboardAsyncFilter = {
      ...templateFilter,
      queryOptions: vi.fn().mockResolvedValue({
        options: [
          { label: TEMPLATE_A, value: '1' },
          { label: 'Template B', value: '2' },
        ],
        remaining: 0,
        next: '',
      }),
    } as AutomationDashboardAsyncFilter;
    const { getFilterState } = renderFilters({
      toolbarFilters: [filterWithOptions],
      initialFilterState: { period: ['last_7_days'] },
    });

    await user.click(screen.getByText(SELECT_TEMPLATE));
    await user.click(await screen.findByLabelText(TEMPLATE_A));
    expect(getFilterState()).toEqual({ period: ['last_7_days'], template: ['1'] });

    await user.click(screen.getByLabelText('Template B'));
    expect(getFilterState()).toEqual({ period: ['last_7_days'], template: ['1', '2'] });
  });

  it('drops the filter key when the last value is deselected in the filter input', async () => {
    const user = userEvent.setup();
    const filterWithOptions: AutomationDashboardAsyncFilter = {
      ...templateFilter,
      queryOptions: vi.fn().mockResolvedValue({
        options: [{ label: TEMPLATE_A, value: '1' }],
        remaining: 0,
        next: '',
      }),
    } as AutomationDashboardAsyncFilter;
    const { getFilterState } = renderFilters({
      toolbarFilters: [filterWithOptions],
      initialFilterState: { period: ['last_7_days'], template: ['1'] },
    });

    await user.click(screen.getByText('1 selected'));
    await user.click(await findOption(TEMPLATE_A));

    expect(getFilterState()).toEqual({ period: ['last_7_days'] });
  });

  it('updates the labels of options loaded again and keeps the others', async () => {
    const user = userEvent.setup();
    const queryLabel = vi.fn((value: string) => `Queried ${value}`);
    // Template 1 is renamed; template 2 is not on the first page any more.
    const queryOptions = vi
      .fn()
      .mockResolvedValueOnce({
        options: [
          { label: 'Old name', value: '1' },
          { label: 'Second', value: '2' },
        ],
        remaining: 0,
        next: '',
      })
      .mockResolvedValue({ options: [{ label: 'New name', value: '1' }], remaining: 0, next: '' });
    renderFilters({
      toolbarFilters: [{ ...templateFilter, queryLabel, queryOptions }],
      initialFilterState: { period: ['last_7_days'], template: ['1', '2'] },
    });
    await user.click(screen.getByText('2 selected'));
    await findOption('Old name');
    queryLabel.mockClear();

    await user.click(screen.getByText('2 selected'));
    await user.click(screen.getByText('2 selected'));
    await findOption('New name');

    expect(screen.getAllByRole('button', { name: 'Close New name' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Close Second' }).length).toBeGreaterThan(0);
    expect(queryLabel).not.toHaveBeenCalledWith('2');
  });

  it('disables the filter selector while a bulk action loads', async () => {
    const user = userEvent.setup();
    let resolveBulk = () => {};
    const queryOptions = vi.fn(async (query: { pageSize?: number }): Promise<AsyncQueryResult> => {
      if (query.pageSize) await new Promise<void>((resolve) => (resolveBulk = resolve));
      // The first page has more options; the bulk load gets every option in one page.
      const remaining = query.pageSize ? 0 : 5;
      return { options: [{ label: TEMPLATE_A, value: '1' }], remaining, next: 2 };
    });
    renderFilters({
      toolbarFilters: [{ ...templateFilter, queryOptions }, projectFilter],
      initialFilterState: { period: ['last_7_days'] },
    });
    await user.click(screen.getByText(SELECT_TEMPLATE));
    await screen.findByLabelText(TEMPLATE_A);

    await user.click(screen.getByLabelText(SELECT_ALL));

    expect(screen.getByRole('button', { name: 'Template' })).toBeDisabled();
    act(() => resolveBulk());
    // Longer than the default 1 second, for slower, parallel CI runs.
    await waitFor(() => expect(screen.getByRole('button', { name: 'Template' })).toBeEnabled(), {
      timeout: 5000,
    });
  });

  it('keeps the focus of the filter selector on the filter input while a bulk action loads', async () => {
    const user = userEvent.setup();
    let resolveBulk = () => {};
    const queryOptions = vi.fn(async (query: { pageSize?: number }): Promise<AsyncQueryResult> => {
      if (query.pageSize) await new Promise<void>((resolve) => (resolveBulk = resolve));
      const remaining = query.pageSize ? 0 : 5;
      return { options: [{ label: TEMPLATE_A, value: '1' }], remaining, next: 2 };
    });
    renderFilters({
      toolbarFilters: [{ ...templateFilter, queryOptions }, projectFilter],
      initialFilterState: { period: ['last_7_days'] },
    });
    await user.click(screen.getByText(SELECT_TEMPLATE));
    await screen.findByLabelText(TEMPLATE_A);
    const selector = document.getElementById('filter')!;
    selector.focus();

    // A click that does not move the focus (as in Safari, or a control that cancels the
    // mousedown): the selector has it when the bulk action starts.
    const selectAll = screen.getByLabelText(SELECT_ALL);
    selectAll.addEventListener('mousedown', (event) => event.preventDefault());
    await user.click(selectAll);

    await waitFor(() => expect(selector).toBeDisabled());
    expect(document.getElementById(FILTER_INPUT_TEST_ID)).toHaveFocus();
    act(() => resolveBulk());
    await waitFor(() => expect(selector).toBeEnabled(), { timeout: 5000 });
    expect(selector).toHaveFocus();
  });

  it('names the close button of a chip whose label is an element, e.g. one that loads it', async () => {
    const user = userEvent.setup();
    const { getFilterState } = renderFilters({
      toolbarFilters: [
        { ...templateFilter, queryLabel: (value: string) => <strong>Loaded {value}</strong> },
      ],
      initialFilterState: { period: ['last_7_days'], template: ['1', '2'] },
    });

    const closeButton = await screen.findByRole('button', { name: 'Close Loaded 1' });
    expect(screen.queryByRole('button', { name: /object Object/ })).not.toBeInTheDocument();
    await user.click(closeButton);

    expect(getFilterState()).toEqual({ period: ['last_7_days'], template: ['2'] });
  });

  it('queries the chip label of a loaded option without a name', async () => {
    const user = userEvent.setup();
    const filterWithOptions: AutomationDashboardAsyncFilter = {
      ...templateFilter,
      queryLabel: (value: string) => `Queried ${value}`,
      queryOptions: vi.fn().mockResolvedValue({
        options: [{ label: '', value: '1' }],
        remaining: 0,
        next: '',
      }),
    } as AutomationDashboardAsyncFilter;
    renderFilters({
      toolbarFilters: [filterWithOptions],
      initialFilterState: { period: ['last_7_days'], template: ['1'] },
    });

    await user.click(screen.getByText('1 selected'));
    // The option without a name is loaded: its checkbox has no accessible name.
    await screen.findByRole('checkbox', { name: '' });

    expect(screen.getAllByRole('button', { name: 'Close Queried 1' }).length).toBeGreaterThan(0);
  });

  it('shows the labels of the loaded options in the chips instead of querying them', async () => {
    const user = userEvent.setup();
    const queryLabel = vi.fn((value: string) => `Queried ${value}`);
    const filterWithOptions: AutomationDashboardAsyncFilter = {
      ...templateFilter,
      queryLabel,
      queryOptions: vi.fn().mockResolvedValue({
        options: [{ label: TEMPLATE_A, value: '1' }],
        remaining: 0,
        next: '',
      }),
    } as AutomationDashboardAsyncFilter;
    renderFilters({
      toolbarFilters: [filterWithOptions],
      initialFilterState: { period: ['last_7_days'], template: ['9'] },
    });
    // A value that is not loaded yet gets its label from queryLabel.
    expect(screen.getAllByRole('button', { name: 'Close Queried 9' }).length).toBeGreaterThan(0);

    await user.click(screen.getByText('1 selected'));
    await user.click(await findOption(TEMPLATE_A));

    expect(screen.getAllByRole('button', { name: 'Close Template A' }).length).toBeGreaterThan(0);
    expect(queryLabel).not.toHaveBeenCalledWith('1');
  });

  it('does not re-render the chips for loaded options that are not selected', async () => {
    const user = userEvent.setup();
    const queryLabel = vi.fn((value: string) => `Queried ${value}`);
    const queryOptions = createTwoPageQueryOptions();
    renderFilters({
      toolbarFilters: [{ ...templateFilter, queryLabel, queryOptions }],
      initialFilterState: { period: ['last_7_days'], template: ['9'] },
    });
    await user.click(screen.getByText('1 selected'));
    await screen.findByLabelText(TEMPLATE_A);
    queryLabel.mockClear();

    await user.click(screen.getByText('Load more'));
    await screen.findByLabelText('Template B');

    // The chip of the selected value queries its label on every render of the chips.
    expect(queryLabel).not.toHaveBeenCalled();
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

  it('ignores filters of other types passed without their type', () => {
    const searchFilter = {
      type: ToolbarFilterType.Search,
      key: 'name',
      label: 'Name',
      query: 'name',
    } as unknown as AutomationDashboardAsyncFilter;
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

/** The dashboard's template filter, whose chips load the names of values it has not loaded. */
function TemplateFilters(props: Readonly<{ initialFilterState: IFilterState }>) {
  const toolbarFilters = useAutomationDashboardToolbarFilters({ filterableFields: ['template'] });
  return (
    <StatefulFilters
      toolbarFilters={toolbarFilters}
      initialFilterState={props.initialFilterState}
      onChange={() => undefined}
    />
  );
}

// The chip labels of a restored selection (a reload, a saved report) come from the API, not from
// the select, which has loaded no options yet.
describe('DashboardToolbarFilters restored selection', () => {
  const templateNames: Record<string, string> = { '101': 'Deploy app', '102': 'Backup db' };
  const server = setupServer(
    http.get(metricsAPI`/dashboard_reports/templates/:id/`, ({ params }) => {
      const id = String(params.id);
      const name = templateNames[id];
      return name
        ? HttpResponse.json({ id: Number(id), name })
        : HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('shows the template names instead of their ids', async () => {
    render(<TemplateFilters initialFilterState={{ template: ['101', '102'] }} />);

    expect(await screen.findByText('Deploy app')).toBeInTheDocument();
    expect(await screen.findByText('Backup db')).toBeInTheDocument();
    expect(screen.queryByText('101')).not.toBeInTheDocument();
    expect(screen.queryByText('102')).not.toBeInTheDocument();
  });

  it('shows the id of a template that no longer exists', async () => {
    render(<TemplateFilters initialFilterState={{ template: ['101', '999'] }} />);

    expect(await screen.findByText('Deploy app')).toBeInTheDocument();
    expect(await screen.findByText('999')).toBeInTheDocument();
  });
});

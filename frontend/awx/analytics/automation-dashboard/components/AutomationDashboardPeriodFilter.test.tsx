/* eslint-disable i18next/no-literal-string */
import {
  IFilterState,
  IToolbarDateRangeFilter,
  ToolbarFilterType,
} from '@ansible/ansible-ui-framework';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AutomationDashboardPeriodFilter } from './AutomationDashboardPeriodFilter';

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
    { label: 'Last 30 days', value: 'last_30_days' },
    { label: 'Custom', value: 'custom', isCustom: true },
  ],
};

/** Owns filterState like the dashboard view does; exposes it so tests can assert the source of truth. */
function StatefulPeriodFilter(props: {
  initialFilterState: IFilterState;
  onChange?: (filterState: IFilterState) => void;
}) {
  const [filterState, setFilterState] = useState<IFilterState>(props.initialFilterState);
  props.onChange?.(filterState);
  return (
    <AutomationDashboardPeriodFilter
      filter={periodFilter}
      filterState={filterState}
      setFilterState={setFilterState}
    />
  );
}

function renderStateful(initialFilterState: IFilterState) {
  let latest: IFilterState = initialFilterState;
  render(
    <StatefulPeriodFilter
      initialFilterState={initialFilterState}
      onChange={(filterState) => (latest = filterState)}
    />
  );
  return { getFilterState: () => latest };
}

/** Applies the last SetStateAction passed to a mocked setFilterState to `prev`. */
function lastUpdate(setFilterState: ReturnType<typeof vi.fn>, prev: IFilterState): IFilterState {
  const action = setFilterState.mock.calls.at(-1)?.[0] as (prev: IFilterState) => IFilterState;
  return action(prev);
}

// These tests open the period select four times; under a loaded CI runner that can exceed the 5s default.
const SLOW_SELECT_TIMEOUT = 15_000;

describe('AutomationDashboardPeriodFilter', () => {
  it('renders the label and the selected preset', () => {
    renderStateful({ period: ['last_30_days'] });

    expect(screen.getByRole('group', { name: 'Period' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Last 30 days' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Start date')).not.toBeInTheDocument();
  });

  it('selects a preset and keeps the other filters', async () => {
    const user = userEvent.setup();
    const { getFilterState } = renderStateful({ period: ['last_7_days'], template: ['1'] });

    await user.click(screen.getByRole('button', { name: 'Last 7 days' }));
    await user.click(screen.getByRole('option', { name: 'Last 30 days' }));

    expect(getFilterState()).toEqual({ period: ['last_30_days'], template: ['1'] });
  });

  it('falls back to the default value when the period is missing', () => {
    const { getFilterState } = renderStateful({});

    expect(getFilterState()).toEqual({ period: ['last_7_days'] });
  });

  it('resets to the default value when the selection is cleared', async () => {
    const user = userEvent.setup();
    const { getFilterState } = renderStateful({ period: ['last_30_days'] });

    await user.click(screen.getByTestId('reset'));

    expect(getFilterState()).toEqual({ period: ['last_7_days'] });
  });

  it('does nothing when the selection is cleared and there is no default value', async () => {
    const user = userEvent.setup();
    const setFilterState = vi.fn();
    render(
      <AutomationDashboardPeriodFilter
        filter={{ ...periodFilter, defaultValue: undefined, isRequired: false }}
        filterState={{ period: ['last_30_days'] }}
        setFilterState={setFilterState}
      />
    );

    await user.click(screen.getByTestId('reset'));

    expect(setFilterState).not.toHaveBeenCalled();
  });

  it('renders without a placeholder', () => {
    render(
      <AutomationDashboardPeriodFilter
        filter={{ ...periodFilter, placeholder: undefined }}
        filterState={{ period: ['last_7_days'] }}
        setFilterState={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Last 7 days' })).toBeInTheDocument();
  });

  it('shows the custom range present in filterState on mount', () => {
    renderStateful({ period: ['custom', '2024-01-01', '2024-01-31'] });

    expect(screen.getByLabelText('Start date')).toHaveValue('2024-01-01');
    expect(screen.getByLabelText('End date')).toHaveValue('2024-01-31');
  });

  it('shows a custom range set externally after mount (saved report loaded)', () => {
    const setFilterState = vi.fn();
    const { rerender } = render(
      <AutomationDashboardPeriodFilter
        filter={periodFilter}
        filterState={{ period: ['last_7_days'] }}
        setFilterState={setFilterState}
      />
    );
    expect(screen.queryByLabelText('Start date')).not.toBeInTheDocument();

    rerender(
      <AutomationDashboardPeriodFilter
        filter={periodFilter}
        filterState={{ period: ['custom', '2024-02-01', '2024-02-15'] }}
        setFilterState={setFilterState}
      />
    );
    expect(screen.getByLabelText('Start date')).toHaveValue('2024-02-01');
    expect(screen.getByLabelText('End date')).toHaveValue('2024-02-15');

    rerender(
      <AutomationDashboardPeriodFilter
        filter={periodFilter}
        filterState={{ period: ['custom', '2024-03-01', '2024-03-10'] }}
        setFilterState={setFilterState}
      />
    );
    expect(screen.getByLabelText('Start date')).toHaveValue('2024-03-01');
    expect(screen.getByLabelText('End date')).toHaveValue('2024-03-10');
    expect(setFilterState).not.toHaveBeenCalled();
  });

  it('selects Custom with no dates the first time it is chosen', async () => {
    const user = userEvent.setup();
    const { getFilterState } = renderStateful({ period: ['last_7_days'] });

    await user.click(screen.getByRole('button', { name: 'Last 7 days' }));
    await user.click(screen.getByRole('option', { name: 'Custom' }));

    expect(getFilterState()).toEqual({ period: ['custom'] });
    expect(screen.getByLabelText('Start date')).toHaveValue('');
    expect(screen.getByLabelText('End date')).toHaveValue('');
    expect(screen.getByLabelText('End date')).toBeDisabled();
  });

  it('writes typed start and end dates to filterState', async () => {
    const user = userEvent.setup();
    const { getFilterState } = renderStateful({ period: ['custom'] });

    await user.click(screen.getByLabelText('Start date'));
    await user.paste('2024-01-01');
    expect(getFilterState()).toEqual({ period: ['custom', '2024-01-01'] });

    await user.click(screen.getByLabelText('End date'));
    await user.paste('2024-01-31');
    expect(getFilterState()).toEqual({ period: ['custom', '2024-01-01', '2024-01-31'] });
  });

  it('keeps the end date when the start date is changed', async () => {
    const user = userEvent.setup();
    const setFilterState = vi.fn();
    render(
      <AutomationDashboardPeriodFilter
        filter={periodFilter}
        filterState={{ period: ['custom', '2024-01-01', '2024-01-31'] }}
        setFilterState={setFilterState}
      />
    );

    await user.clear(screen.getByLabelText('Start date'));
    await user.click(screen.getByLabelText('Start date'));
    await user.paste('2024-01-05');

    expect(lastUpdate(setFilterState, {})).toEqual({
      period: ['custom', '2024-01-05', '2024-01-31'],
    });
  });

  it('keeps the end date with an empty start date when the start date is cleared', async () => {
    const user = userEvent.setup();
    const { getFilterState } = renderStateful({ period: ['custom', '2024-01-01', '2024-01-31'] });

    await user.clear(screen.getByLabelText('Start date'));

    expect(getFilterState()).toEqual({ period: ['custom', '', '2024-01-31'] });
    expect(screen.getByLabelText('End date')).toHaveValue('2024-01-31');
    expect(screen.getByLabelText('End date')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Clear end date' })).not.toBeInTheDocument();
  });

  it('drops the start date when it is cleared and there is no end date', async () => {
    const user = userEvent.setup();
    const { getFilterState } = renderStateful({ period: ['custom', '2024-01-01'] });

    await user.clear(screen.getByLabelText('Start date'));

    expect(getFilterState()).toEqual({ period: ['custom'] });
  });

  it('clears only the end date with the clear button', async () => {
    const user = userEvent.setup();
    const { getFilterState } = renderStateful({ period: ['custom', '2024-01-01', '2024-01-31'] });

    await user.click(screen.getByRole('button', { name: 'Clear end date' }));

    expect(getFilterState()).toEqual({ period: ['custom', '2024-01-01'] });
    expect(screen.queryByRole('button', { name: 'Clear end date' })).not.toBeInTheDocument();
  });

  it(
    'restores the last custom range when switching to a preset and back to Custom',
    async () => {
      const user = userEvent.setup();
      const { getFilterState } = renderStateful({ period: ['custom', '2024-01-01', '2024-01-31'] });

      await user.click(screen.getByRole('button', { name: 'Custom' }));
      await user.click(screen.getByRole('option', { name: 'Last 7 days' }));
      expect(getFilterState()).toEqual({ period: ['last_7_days'] });
      expect(screen.queryByLabelText('Start date')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Last 7 days' }));
      await user.click(screen.getByRole('option', { name: 'Custom' }));

      expect(getFilterState()).toEqual({ period: ['custom', '2024-01-01', '2024-01-31'] });
      expect(screen.getByLabelText('Start date')).toHaveValue('2024-01-01');
      expect(screen.getByLabelText('End date')).toHaveValue('2024-01-31');
    },
    SLOW_SELECT_TIMEOUT
  );

  it(
    'restores only the start date when the remembered range is partial',
    async () => {
      const user = userEvent.setup();
      const { getFilterState } = renderStateful({ period: ['custom', '2024-01-01'] });

      await user.click(screen.getByRole('button', { name: 'Custom' }));
      await user.click(screen.getByRole('option', { name: 'Last 30 days' }));
      await user.click(screen.getByRole('button', { name: 'Last 30 days' }));
      await user.click(screen.getByRole('option', { name: 'Custom' }));

      expect(getFilterState()).toEqual({ period: ['custom', '2024-01-01'] });
    },
    SLOW_SELECT_TIMEOUT
  );

  it('applies the PatternFly breakpoint layout classes', () => {
    renderStateful({ period: ['custom', '2024-01-01', '2024-01-31'] });

    // Below `lg` the whole period takes its own row; from `lg` up it is auto width again.
    const period = screen.getByTestId('automation-dashboard-period-filter');
    expect(period).toHaveClass('pf-v6-u-w-100-on-md', 'pf-v6-u-w-auto-on-lg');
    // Below `md` the dropdown and the date range are stacked; from `md` up they share a row.
    expect(screen.getByTestId('automation-dashboard-period-layout')).toHaveClass(
      'pf-v6-l-flex',
      'pf-m-column',
      'pf-m-row-on-md'
    );
    expect(screen.getByTestId('automation-dashboard-period-date-range')).toHaveClass('pf-m-wrap');
  });
});

describe('AutomationDashboardPeriodFilter in a timezone east of UTC', () => {
  const originalTz = process.env.TZ;
  beforeAll(() => {
    process.env.TZ = 'Europe/Ljubljana';
  });
  afterAll(() => {
    process.env.TZ = originalTz;
  });

  it('accepts a same-day range without a validation error', async () => {
    const user = userEvent.setup();
    renderStateful({ period: ['custom', '2024-01-10', '2024-01-10'] });

    await user.click(screen.getByLabelText('End date'));
    await user.tab();

    expect(
      screen.queryByText('The "to" date must be after the "from" date')
    ).not.toBeInTheDocument();
  });

  it('still rejects an end date before the start date', async () => {
    const user = userEvent.setup();
    renderStateful({ period: ['custom', '2024-01-10', '2024-01-09'] });

    await user.click(screen.getByLabelText('End date'));
    await user.tab();

    expect(screen.getByText('The "to" date must be after the "from" date')).toBeInTheDocument();
  });
});

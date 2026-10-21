/* eslint-disable i18next/no-literal-string */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DateRange, ToolbarDateRangeFilter } from './ToolbarDateRangeFilter';

const defaultOptions = [
  { label: 'Last 7 days', value: 'last7days' },
  { label: 'Last 30 days', value: 'last30days' },
  { label: 'Custom', value: 'custom', isCustom: true },
];

describe('ToolbarDateRangeFilter', () => {
  it('should render preset options in select', async () => {
    const user = userEvent.setup();

    render(
      <ToolbarDateRangeFilter
        placeholder="Select range"
        options={defaultOptions}
        setFilterValues={vi.fn()}
      />
    );

    await user.click(screen.getByText('Select range'));

    expect(screen.getByText('Last 7 days')).toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('should call setFilterValues when preset selected', async () => {
    const user = userEvent.setup();
    const setFilterValues = vi.fn();

    render(
      <ToolbarDateRangeFilter
        placeholder="Select range"
        options={defaultOptions}
        setFilterValues={setFilterValues}
      />
    );

    await user.click(screen.getByText('Select range'));
    await user.click(screen.getByText('Last 7 days'));

    expect(setFilterValues).toHaveBeenCalled();
    const setterFn = setFilterValues.mock.calls[0][0] as () => string[];
    expect(setterFn()).toEqual(['last7days']);
  });

  it('should auto-select defaultValue when isRequired and no selection', () => {
    const setFilterValues = vi.fn();

    render(
      <ToolbarDateRangeFilter
        placeholder="Select range"
        options={defaultOptions}
        setFilterValues={setFilterValues}
        isRequired={true}
        defaultValue="last30days"
      />
    );

    expect(setFilterValues).toHaveBeenCalled();
    const setterFn = setFilterValues.mock.calls[0][0] as () => string[];
    expect(setterFn()).toEqual(['last30days']);
  });

  it('should render DateRange pickers when custom option selected', () => {
    render(
      <ToolbarDateRangeFilter
        placeholder="Select range"
        options={defaultOptions}
        filterValues={['custom']}
        setFilterValues={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Start date')).toBeInTheDocument();
    expect(screen.getByLabelText('End date')).toBeInTheDocument();
  });

  it('should use the first option as the required default when defaultValue is not set', () => {
    const setFilterValues = vi.fn();

    render(
      <ToolbarDateRangeFilter
        placeholder="Select range"
        options={defaultOptions}
        setFilterValues={setFilterValues}
        isRequired={true}
      />
    );

    const setterFn = setFilterValues.mock.calls[0][0] as () => string[];
    expect(setterFn()).toEqual(['last7days']);
  });

  it('should not set a required default when there are no options', () => {
    const setFilterValues = vi.fn();

    render(
      <ToolbarDateRangeFilter
        placeholder="Select range"
        options={[]}
        setFilterValues={setFilterValues}
        isRequired={true}
      />
    );

    expect(setFilterValues).not.toHaveBeenCalled();
  });

  it('should persist the initial custom range in filterValues', () => {
    const setFilterValues = vi.fn();

    render(
      <ToolbarDateRangeFilter
        placeholder="Select range"
        options={defaultOptions}
        filterValues={['custom', '2024-01-01', '2024-01-31']}
        setFilterValues={setFilterValues}
      />
    );

    const setterFn = setFilterValues.mock.calls[0][0] as () => string[];
    expect(setterFn()).toEqual(['custom', '2024-01-01', '2024-01-31']);
  });

  it('should update filterValues when the custom dates change', async () => {
    const user = userEvent.setup();
    const setFilterValues = vi.fn();

    render(
      <ToolbarDateRangeFilter
        placeholder="Select range"
        options={defaultOptions}
        filterValues={['custom']}
        setFilterValues={setFilterValues}
      />
    );

    await user.type(screen.getByLabelText('Start date'), '2024-01-01');

    await waitFor(() => {
      const setterFn = setFilterValues.mock.calls.at(-1)?.[0] as () => string[];
      expect(setterFn()).toEqual(['custom', '2024-01-01']);
    });

    await user.type(screen.getByLabelText('End date'), '2024-01-31');

    await waitFor(() => {
      const setterFn = setFilterValues.mock.calls.at(-1)?.[0] as () => string[];
      expect(setterFn()).toEqual(['custom', '2024-01-01', '2024-01-31']);
    });
  });
});

describe('DateRange validator', () => {
  const validationMessage = 'The "to" date must be after the "from" date';

  function renderDateRange(from?: string, to = '2024-01-02') {
    render(<DateRange from={from} to={to} setFrom={vi.fn()} setTo={vi.fn()} />);
    return screen.getByLabelText('End date');
  }

  it('should reject an end date before the start date', () => {
    const endDate = renderDateRange('2024-01-03');

    fireEvent.blur(endDate);

    expect(screen.getByText(validationMessage)).toBeInTheDocument();
  });

  it.each(['2024-01-02', '2024-01-01'])(
    'should allow an end date equal to or after the start date (%s)',
    (from) => {
      const endDate = renderDateRange(from);

      fireEvent.blur(endDate);

      expect(screen.queryByText(validationMessage)).not.toBeInTheDocument();
    }
  );

  it('should disable the end date when the start date is invalid', () => {
    expect(renderDateRange('invalid-date')).toBeDisabled();
  });

  it('should skip ordering validation when there is no start date', () => {
    const endDate = renderDateRange();

    fireEvent.blur(endDate);

    expect(endDate).toBeDisabled();
    expect(screen.queryByText(validationMessage)).not.toBeInTheDocument();
  });

  it('should call setFrom and setTo when their date values change', async () => {
    const setFrom = vi.fn();
    const setTo = vi.fn();

    render(<DateRange from="2024-01-01" setFrom={setFrom} setTo={setTo} />);

    const user = userEvent.setup();
    await user.clear(screen.getByLabelText('Start date'));
    await user.type(screen.getByLabelText('Start date'), '2024-01-05');
    await user.type(screen.getByLabelText('End date'), '2024-01-31');

    expect(setFrom).toHaveBeenLastCalledWith('2024-01-05');
    expect(setTo).toHaveBeenLastCalledWith('2024-01-31');
  });

  it('should clear the end date when the clear button is clicked', async () => {
    const user = userEvent.setup();
    const setTo = vi.fn();

    render(<DateRange from="2024-01-01" to="2024-01-31" setFrom={vi.fn()} setTo={setTo} />);

    await user.click(screen.getByRole('button', { name: '' }));

    expect(setTo).toHaveBeenCalledWith(undefined);
  });
});

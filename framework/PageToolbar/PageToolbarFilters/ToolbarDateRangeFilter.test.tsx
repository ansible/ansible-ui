/* eslint-disable i18next/no-literal-string */
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  ToolbarDateRangeFilter,
  type IToolbarDateRangeFilterProps,
} from './ToolbarDateRangeFilter';

/** Stateful wrapper — real components own filterValues in state, unlike the vi.fn() mock used elsewhere in this file. */
function StatefulToolbarDateRangeFilter(
  props: Omit<IToolbarDateRangeFilterProps, 'filterValues' | 'setFilterValues'> & {
    initialFilterValues?: string[];
  }
) {
  const { initialFilterValues, ...rest } = props;
  const [filterValues, setFilterValues] = useState<string[] | undefined>(initialFilterValues);
  return (
    <ToolbarDateRangeFilter
      {...rest}
      filterValues={filterValues}
      setFilterValues={(setter) => setFilterValues((prev) => setter(prev))}
    />
  );
}

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

  it('should reset to defaultValue when X clicked and defaultValue is set', async () => {
    const user = userEvent.setup();
    const setFilterValues = vi.fn();

    render(
      <ToolbarDateRangeFilter
        placeholder="Select range"
        options={defaultOptions}
        filterValues={['last7days']}
        setFilterValues={setFilterValues}
        defaultValue="last7days"
      />
    );

    await user.click(screen.getByTestId('reset'));

    expect(setFilterValues).toHaveBeenCalled();
    const setterFn = setFilterValues.mock.calls[0][0] as () => string[];
    expect(setterFn()).toEqual(['last7days']);
  });

  it('should do nothing when X clicked and no defaultValue is set', async () => {
    const user = userEvent.setup();
    const setFilterValues = vi.fn();

    render(
      <ToolbarDateRangeFilter
        placeholder="Select range"
        options={defaultOptions}
        filterValues={['last7days']}
        setFilterValues={setFilterValues}
      />
    );

    await user.click(screen.getByTestId('reset'));

    expect(setFilterValues).not.toHaveBeenCalled();
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

  it('should show the start and end date already present in filterValues on mount', () => {
    render(
      <ToolbarDateRangeFilter
        placeholder="Select range"
        options={defaultOptions}
        filterValues={['custom', '2024-01-01', '2024-01-31']}
        setFilterValues={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Start date')).toHaveValue('2024-01-01');
    expect(screen.getByLabelText('End date')).toHaveValue('2024-01-31');
  });

  it('should show the current custom range after filterValues is set externally post-mount', () => {
    const { rerender } = render(
      <ToolbarDateRangeFilter
        placeholder="Select range"
        options={defaultOptions}
        filterValues={['last7days']}
        setFilterValues={vi.fn()}
      />
    );

    expect(screen.queryByLabelText('Start date')).not.toBeInTheDocument();

    // Simulates loading a saved report whose filters set a custom range on an
    // already-mounted toolbar — the date pickers must pick up the new values.
    rerender(
      <ToolbarDateRangeFilter
        placeholder="Select range"
        options={defaultOptions}
        filterValues={['custom', '2024-02-01', '2024-02-15']}
        setFilterValues={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Start date')).toHaveValue('2024-02-01');
    expect(screen.getByLabelText('End date')).toHaveValue('2024-02-15');
  });

  it('should update the displayed range when filterValues changes to a different custom range', () => {
    const { rerender } = render(
      <ToolbarDateRangeFilter
        placeholder="Select range"
        options={defaultOptions}
        filterValues={['custom', '2024-01-01', '2024-01-31']}
        setFilterValues={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Start date')).toHaveValue('2024-01-01');

    rerender(
      <ToolbarDateRangeFilter
        placeholder="Select range"
        options={defaultOptions}
        filterValues={['custom', '2024-03-01', '2024-03-10']}
        setFilterValues={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Start date')).toHaveValue('2024-03-01');
    expect(screen.getByLabelText('End date')).toHaveValue('2024-03-10');
  });

  it('should call setFilterValues with the start date when it is entered', () => {
    const setFilterValues = vi.fn();
    render(
      <ToolbarDateRangeFilter
        placeholder="Select range"
        options={defaultOptions}
        filterValues={['custom']}
        setFilterValues={setFilterValues}
      />
    );

    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2024-01-01' } });

    const setterFn = setFilterValues.mock.calls.at(-1)?.[0] as () => string[];
    expect(setterFn()).toEqual(['custom', '2024-01-01']);
  });

  it('should call setFilterValues with both dates when the end date is entered after the start date', () => {
    const setFilterValues = vi.fn();
    render(
      <ToolbarDateRangeFilter
        placeholder="Select range"
        options={defaultOptions}
        filterValues={['custom', '2024-01-01']}
        setFilterValues={setFilterValues}
      />
    );

    fireEvent.change(screen.getByLabelText('End date'), { target: { value: '2024-01-31' } });

    const setterFn = setFilterValues.mock.calls.at(-1)?.[0] as () => string[];
    expect(setterFn()).toEqual(['custom', '2024-01-01', '2024-01-31']);
  });

  it('should preserve the existing end date when the start date is changed', () => {
    const setFilterValues = vi.fn();
    render(
      <ToolbarDateRangeFilter
        placeholder="Select range"
        options={defaultOptions}
        filterValues={['custom', '2024-01-01', '2024-01-31']}
        setFilterValues={setFilterValues}
      />
    );

    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2024-01-05' } });

    const setterFn = setFilterValues.mock.calls.at(-1)?.[0] as () => string[];
    expect(setterFn()).toEqual(['custom', '2024-01-05', '2024-01-31']);
  });

  it('should drop the start date but keep the end date when the start date is cleared', () => {
    const setFilterValues = vi.fn();
    render(
      <ToolbarDateRangeFilter
        placeholder="Select range"
        options={defaultOptions}
        filterValues={['custom', '2024-01-01', '2024-01-31']}
        setFilterValues={setFilterValues}
      />
    );

    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '' } });

    const setterFn = setFilterValues.mock.calls.at(-1)?.[0] as () => string[];
    expect(setterFn()).toEqual(['custom', '', '2024-01-31']);
  });

  it('should drop both dates when the start date is cleared and there was no end date', () => {
    const setFilterValues = vi.fn();
    render(
      <ToolbarDateRangeFilter
        placeholder="Select range"
        options={defaultOptions}
        filterValues={['custom', '2024-01-01']}
        setFilterValues={setFilterValues}
      />
    );

    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '' } });

    const setterFn = setFilterValues.mock.calls.at(-1)?.[0] as () => string[];
    expect(setterFn()).toEqual(['custom']);
  });

  it('should make the end date field read-only but keep showing its value when the start date is cleared', () => {
    render(
      <StatefulToolbarDateRangeFilter
        placeholder="Select range"
        options={defaultOptions}
        initialFilterValues={['custom', '2024-01-01', '2024-01-31']}
      />
    );

    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '' } });

    expect(screen.getByLabelText('End date')).toHaveValue('2024-01-31');
    expect(screen.getByLabelText('End date')).toBeDisabled();
  });

  it('should clear only the end date when the reset button next to it is clicked', async () => {
    const user = userEvent.setup();
    const setFilterValues = vi.fn();
    render(
      <ToolbarDateRangeFilter
        placeholder="Select range"
        options={defaultOptions}
        filterValues={['custom', '2024-01-01', '2024-01-31']}
        setFilterValues={setFilterValues}
      />
    );

    await user.click(screen.getByTestId('toolbar-date-picker-clear-end-date'));

    const setterFn = setFilterValues.mock.calls.at(-1)?.[0] as () => string[];
    expect(setterFn()).toEqual(['custom', '2024-01-01']);
  });

  it('should restore the previously entered custom range when switching to a preset and back to Custom', async () => {
    const user = userEvent.setup();
    render(
      <StatefulToolbarDateRangeFilter
        placeholder="Select range"
        options={defaultOptions}
        initialFilterValues={['custom']}
      />
    );

    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('End date'), { target: { value: '2024-01-31' } });
    expect(screen.getByLabelText('Start date')).toHaveValue('2024-01-01');
    expect(screen.getByLabelText('End date')).toHaveValue('2024-01-31');

    // Switch away to a preset — the date pickers disappear.
    await user.click(screen.getByRole('button', { name: 'Custom' }));
    await user.click(screen.getByRole('option', { name: 'Last 7 days' }));
    expect(screen.queryByLabelText('Start date')).not.toBeInTheDocument();

    // Switch back to Custom — the previously entered dates should reappear.
    await user.click(screen.getByRole('button', { name: 'Last 7 days' }));
    await user.click(screen.getByRole('option', { name: 'Custom' }));

    expect(screen.getByLabelText('Start date')).toHaveValue('2024-01-01');
    expect(screen.getByLabelText('End date')).toHaveValue('2024-01-31');
  });

  it('should select Custom with no dates pre-filled the first time it is chosen', async () => {
    const user = userEvent.setup();
    render(
      <StatefulToolbarDateRangeFilter
        placeholder="Select range"
        options={defaultOptions}
        initialFilterValues={['last7days']}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Last 7 days' }));
    await user.click(screen.getByRole('option', { name: 'Custom' }));

    expect(screen.getByLabelText('Start date')).toHaveValue('');
    expect(screen.getByLabelText('End date')).toHaveValue('');
  });

  it('should restore only the start date when switching back to Custom with a partial remembered range', async () => {
    const user = userEvent.setup();
    render(
      <StatefulToolbarDateRangeFilter
        placeholder="Select range"
        options={defaultOptions}
        initialFilterValues={['custom']}
      />
    );

    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2024-01-01' } });
    expect(screen.getByLabelText('End date')).toHaveValue('');

    await user.click(screen.getByRole('button', { name: 'Custom' }));
    await user.click(screen.getByRole('option', { name: 'Last 7 days' }));

    await user.click(screen.getByRole('button', { name: 'Last 7 days' }));
    await user.click(screen.getByRole('option', { name: 'Custom' }));

    expect(screen.getByLabelText('Start date')).toHaveValue('2024-01-01');
    expect(screen.getByLabelText('End date')).toHaveValue('');
  });
});

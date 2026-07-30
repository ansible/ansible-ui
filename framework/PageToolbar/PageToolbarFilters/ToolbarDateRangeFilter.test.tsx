/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ToolbarDateRangeFilter } from './ToolbarDateRangeFilter';

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
});

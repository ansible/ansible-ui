import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  AutomationDashboardBulkSelect,
  AutomationDashboardBulkSelectProps,
} from './AutomationDashboardBulkSelect';
import { testOptions } from './asyncMultiSelect.testUtils';

const visibleOptions = testOptions.slice(0, 3);
const visibleValues = visibleOptions.map((option) => option.value);

const SELECT_ALL = 'Select all';
const DESELECT_ALL = 'Deselect all';
const SELECT_ALL_MATCHING = 'Select all matching';
const DESELECT_ALL_MATCHING = 'Deselect all matching';

/** Renders the bulk checkbox; `values` are the selected values (its `selectedValues`). */
function renderBulkSelect(
  props: Partial<Omit<AutomationDashboardBulkSelectProps, 'selectedValues'>> & {
    values?: string[];
  } = {}
) {
  const { values, ...rest } = props;
  const onAction = vi.fn();
  render(
    <AutomationDashboardBulkSelect
      id="bulk"
      selectedValues={new Set(values)}
      visibleOptions={visibleOptions}
      onAction={onAction}
      {...rest}
    />
  );
  return { onAction, user: userEvent.setup() };
}

function getCheckbox(name: string) {
  return screen.getByLabelText(name);
}

describe('AutomationDashboardBulkSelect', () => {
  it('renders only the checkbox, without a menu', () => {
    renderBulkSelect();

    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('selects all with an unchecked checkbox while nothing is selected', async () => {
    const { onAction, user } = renderBulkSelect({ values: undefined });

    expect(getCheckbox(SELECT_ALL)).not.toBeChecked();
    await user.click(getCheckbox(SELECT_ALL));

    expect(onAction).toHaveBeenCalledWith('all');
  });

  it('deselects all with a checked checkbox when every option is loaded and selected', async () => {
    const { onAction, user } = renderBulkSelect({
      values: visibleValues,
      isEveryOptionLoaded: true,
    });

    expect(getCheckbox(DESELECT_ALL)).toBeChecked();
    await user.click(getCheckbox(DESELECT_ALL));

    expect(onAction).toHaveBeenCalledWith('none');
  });

  it('selects all with a partially checked checkbox for a partial selection', async () => {
    const { onAction, user } = renderBulkSelect({ values: [visibleValues[0]] });

    expect(getCheckbox(SELECT_ALL)).toBePartiallyChecked();
    await user.click(getCheckbox(SELECT_ALL));

    expect(onAction).toHaveBeenCalledWith('all');
  });

  it('shows a partially checked "Select all" while not every option is loaded', () => {
    // As many values as options are selected, but one of them is of a deleted option.
    renderBulkSelect({ values: [...visibleValues, 'deleted'] });

    expect(getCheckbox(SELECT_ALL)).toBePartiallyChecked();
  });

  it('shows a partially checked checkbox when only options that are not loaded are selected', () => {
    // Without a search every option is in scope, also the ones not loaded yet.
    renderBulkSelect({ values: ['not-loaded'] });

    expect(getCheckbox(SELECT_ALL)).toBePartiallyChecked();
  });

  it('deselects all when the selection is the one "Select all" made, also before every option is loaded', async () => {
    const { onAction, user } = renderBulkSelect({ values: visibleValues, isScopeSelected: true });

    expect(getCheckbox(DESELECT_ALL)).toBeChecked();
    await user.click(getCheckbox(DESELECT_ALL));

    expect(onAction).toHaveBeenCalledWith('none');
  });

  it('selects all when a loaded option is not selected although the scope was selected', () => {
    // E.g. an option created after "Select all".
    renderBulkSelect({ values: visibleValues.slice(1), isScopeSelected: true });

    expect(getCheckbox(SELECT_ALL)).toBePartiallyChecked();
  });

  it('selects the options matching the search while searching', async () => {
    const { onAction, user } = renderBulkSelect({
      values: ['not-visible'],
      isSearching: true,
    });

    expect(getCheckbox(SELECT_ALL_MATCHING)).not.toBeChecked();
    await user.click(getCheckbox(SELECT_ALL_MATCHING));

    expect(onAction).toHaveBeenCalledWith('selectMatching');
  });

  it('selects (never deselects) with a partially checked "Select all matching"', async () => {
    // Every loaded match is selected, but not every match is loaded.
    const { onAction, user } = renderBulkSelect({ values: visibleValues, isSearching: true });

    expect(getCheckbox(SELECT_ALL_MATCHING)).toBePartiallyChecked();
    await user.click(getCheckbox(SELECT_ALL_MATCHING));

    expect(onAction).toHaveBeenCalledWith('selectMatching');
  });

  it.each([
    ['every match is loaded and selected', { isEveryOptionLoaded: true }],
    ['the matches were selected by "Select all matching"', { isScopeSelected: true }],
  ])('offers "Deselect all matching" when %s', async (_, scopeProps) => {
    const { onAction, user } = renderBulkSelect({
      values: visibleValues,
      isSearching: true,
      ...scopeProps,
    });

    expect(getCheckbox(DESELECT_ALL_MATCHING)).toBeChecked();
    await user.click(getCheckbox(DESELECT_ALL_MATCHING));

    expect(onAction).toHaveBeenCalledWith('deselectMatching');
  });

  it('keeps the checkbox controlled when it becomes partially checked', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const props = { id: 'bulk', visibleOptions, onAction: vi.fn() };
    const { rerender } = render(
      <AutomationDashboardBulkSelect {...props} selectedValues={new Set()} />
    );

    rerender(
      <AutomationDashboardBulkSelect {...props} selectedValues={new Set([visibleValues[0]])} />
    );

    expect(getCheckbox(SELECT_ALL)).toBePartiallyChecked();
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('disables the checkbox while no option is visible', () => {
    renderBulkSelect({ visibleOptions: [], values: visibleValues });

    expect(getCheckbox(SELECT_ALL)).toBeDisabled();
  });

  it('disables the checkbox', () => {
    renderBulkSelect({ isDisabled: true });

    expect(getCheckbox(SELECT_ALL)).toBeDisabled();
  });
});

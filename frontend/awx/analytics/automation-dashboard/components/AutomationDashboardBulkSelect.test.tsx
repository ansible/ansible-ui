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

const BULK_SELECTION = 'Bulk selection';
const SELECT_ALL = 'Select all';
const SELECT_NONE = 'Select none';
const INVERT_SELECTION = 'Invert selection';
const SELECT_ALL_MATCHING = 'Select all matching';

/** Renders the bulk selector; `values` are the selected values (its `selectedValues`). */
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

function getMenuToggle() {
  return screen.getByLabelText(BULK_SELECTION);
}

describe('AutomationDashboardBulkSelect', () => {
  it('shows an unchecked "Select all" checkbox while nothing is selected', () => {
    renderBulkSelect({ values: undefined });

    expect(getCheckbox(SELECT_ALL)).not.toBeChecked();
  });

  it('shows a checked "Select none" checkbox when every option is loaded and selected', () => {
    renderBulkSelect({ values: visibleValues, isEveryOptionLoaded: true });

    expect(getCheckbox(SELECT_NONE)).toBeChecked();
  });

  it('shows a partially checked checkbox while not every option is loaded', () => {
    // As many values as options are selected, but one of them is of a deleted option.
    renderBulkSelect({ values: [...visibleValues, 'deleted'] });

    expect(getCheckbox(SELECT_NONE)).toBePartiallyChecked();
  });

  it('selects the options matching the search with the checkbox while searching', async () => {
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

  it('offers "Deselect all matching" when every match is loaded and selected', async () => {
    const { onAction, user } = renderBulkSelect({
      values: visibleValues,
      isSearching: true,
      isEveryOptionLoaded: true,
    });

    expect(getCheckbox('Deselect all matching')).toBeChecked();
    await user.click(getCheckbox('Deselect all matching'));

    expect(onAction).toHaveBeenCalledWith('deselectMatching');
  });

  it('shows a partially checked checkbox for a partial selection', () => {
    renderBulkSelect({ values: [visibleValues[0]] });

    expect(getCheckbox(SELECT_NONE)).toBePartiallyChecked();
  });

  it('shows a partially checked checkbox when only values outside the visible options are selected', () => {
    renderBulkSelect({ values: ['not-visible'] });

    expect(getCheckbox(SELECT_NONE)).toBePartiallyChecked();
  });

  it('selects all with the checkbox while nothing is selected', async () => {
    const { onAction, user } = renderBulkSelect();

    await user.click(getCheckbox(SELECT_ALL));

    expect(onAction).toHaveBeenCalledWith('all');
  });

  it('clears the selection with the checkbox when something is selected', async () => {
    const { onAction, user } = renderBulkSelect({ values: [visibleValues[0]] });

    await user.click(getCheckbox(SELECT_NONE));

    expect(onAction).toHaveBeenCalledWith('none');
  });

  it.each([
    [SELECT_ALL, 'all'],
    [SELECT_NONE, 'none'],
    [INVERT_SELECTION, 'invert'],
  ])('runs "%s" from the menu and closes it', async (item, action) => {
    const { onAction, user } = renderBulkSelect({ values: [visibleValues[0]] });

    await user.click(getMenuToggle());
    await user.click(screen.getByText(item));

    expect(onAction).toHaveBeenCalledWith(action);
    expect(getMenuToggle()).toHaveAttribute('aria-expanded', 'false');
  });

  it('disables "Select none" while nothing is selected', async () => {
    const { user } = renderBulkSelect();

    await user.click(getMenuToggle());

    expect(screen.getByRole('menuitem', { name: SELECT_NONE })).toBeDisabled();
  });

  it('closes the menu with Escape and focuses the menu toggle', async () => {
    const { user } = renderBulkSelect();
    await user.click(getMenuToggle());

    await user.keyboard('{Escape}');

    expect(getMenuToggle()).toHaveAttribute('aria-expanded', 'false');
    expect(getMenuToggle()).toHaveFocus();
  });

  it('stops Escape before the document, so a surrounding select menu stays open', async () => {
    const { user } = renderBulkSelect();
    const onDocumentKeyDown = vi.fn();
    document.addEventListener('keydown', onDocumentKeyDown);
    await user.click(getMenuToggle());

    await user.keyboard('{Escape}');
    document.removeEventListener('keydown', onDocumentKeyDown);

    expect(onDocumentKeyDown).not.toHaveBeenCalled();
  });

  it('disables "Select all" while no option is visible', async () => {
    const { user } = renderBulkSelect({ visibleOptions: [] });

    expect(getCheckbox(SELECT_ALL)).toBeDisabled();
    await user.click(getMenuToggle());
    expect(screen.getByRole('menuitem', { name: SELECT_ALL })).toBeDisabled();
  });

  it('keeps "Select none" on the checkbox while no option is visible', () => {
    renderBulkSelect({ visibleOptions: [], values: visibleValues });

    expect(getCheckbox(SELECT_NONE)).toBeEnabled();
  });

  it('closes the menu when it is disabled', async () => {
    const onAction = vi.fn();
    const { rerender } = render(
      <AutomationDashboardBulkSelect
        id="bulk"
        selectedValues={new Set()}
        visibleOptions={visibleOptions}
        onAction={onAction}
      />
    );
    await userEvent.setup().click(getMenuToggle());
    expect(getMenuToggle()).toHaveAttribute('aria-expanded', 'true');

    rerender(
      <AutomationDashboardBulkSelect
        id="bulk"
        selectedValues={new Set()}
        visibleOptions={visibleOptions}
        onAction={onAction}
        isDisabled
      />
    );

    expect(getMenuToggle()).toHaveAttribute('aria-expanded', 'false');
  });

  it('disables the checkbox and the menu toggle', () => {
    renderBulkSelect({ isDisabled: true });

    expect(getCheckbox(SELECT_ALL)).toBeDisabled();
    expect(getMenuToggle()).toBeDisabled();
  });
});

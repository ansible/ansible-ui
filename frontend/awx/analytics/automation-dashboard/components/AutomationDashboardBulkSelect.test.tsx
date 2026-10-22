import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  AutomationDashboardBulkSelect,
  AutomationDashboardBulkSelectProps,
} from './AutomationDashboardBulkSelect';

const SELECT_ALL = 'Select all';
const DESELECT_ALL = 'Deselect all';
const SELECT_ALL_MATCHING = 'Select all matching';
const DESELECT_ALL_MATCHING = 'Deselect all matching';

function renderBulkSelect(props: Partial<AutomationDashboardBulkSelectProps> = {}) {
  const onAction = vi.fn();
  render(
    <AutomationDashboardBulkSelect
      id="bulk"
      scopeState="none"
      hasOptions
      onAction={onAction}
      {...props}
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

  it.each([
    ['none', false, SELECT_ALL, 'all'],
    ['some', null, SELECT_ALL, 'all'],
    ['all', true, DESELECT_ALL, 'none'],
  ] as const)(
    'without a search, for "%s" selected, is checked: %s and offers "%s"',
    async (scopeState, isChecked, label, action) => {
      const { onAction, user } = renderBulkSelect({ scopeState });

      const checkbox = getCheckbox(label);
      if (isChecked === null) expect(checkbox).toBePartiallyChecked();
      else if (isChecked) expect(checkbox).toBeChecked();
      else expect(checkbox).not.toBeChecked();
      await user.click(checkbox);

      expect(onAction).toHaveBeenCalledWith(action);
    }
  );

  it.each([
    ['none', SELECT_ALL_MATCHING, 'selectMatching'],
    // A partial selection selects the rest of the matches; it never deselects.
    ['some', SELECT_ALL_MATCHING, 'selectMatching'],
    ['all', DESELECT_ALL_MATCHING, 'deselectMatching'],
  ] as const)(
    'with a search, for "%s" selected, offers "%s"',
    async (scopeState, label, action) => {
      const { onAction, user } = renderBulkSelect({ scopeState, isSearching: true });

      await user.click(getCheckbox(label));

      expect(onAction).toHaveBeenCalledWith(action);
    }
  );

  it('keeps the checkbox controlled when it becomes partially checked', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const props = { id: 'bulk', hasOptions: true, onAction: vi.fn() };
    const { rerender } = render(<AutomationDashboardBulkSelect {...props} scopeState="none" />);

    rerender(<AutomationDashboardBulkSelect {...props} scopeState="some" />);

    expect(getCheckbox(SELECT_ALL)).toBePartiallyChecked();
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('disables the checkbox while the scope has no options', () => {
    renderBulkSelect({ hasOptions: false, scopeState: 'some' });

    expect(getCheckbox(SELECT_ALL)).toBeDisabled();
  });

  it('disables the checkbox', () => {
    renderBulkSelect({ isDisabled: true });

    expect(getCheckbox(SELECT_ALL)).toBeDisabled();
  });
});

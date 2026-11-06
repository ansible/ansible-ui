import { PageSelectOption } from '@ansible/ansible-ui-framework/PageInputs/PageSelectOption';
import { MenuToggleCheckbox } from '@patternfly/react-core';
import { useMemo } from 'react';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

/**
 * What the bulk selection checkbox does: without a search "all" selects every option and "none"
 * clears the selection; with a search "selectMatching" adds every option matching the search to
 * the selection and "deselectMatching" removes them, keeping the rest of the selection.
 */
export type AutomationDashboardBulkSelectAction =
  | 'all'
  | 'none'
  | 'selectMatching'
  | 'deselectMatching';

export interface AutomationDashboardBulkSelectProps {
  id: string;
  /** The selected values (the set the select already has, not built again here). */
  selectedValues: ReadonlySet<string>;
  /** The loaded options matching the current search; the checkbox state is based on them. */
  visibleOptions: PageSelectOption<string>[];
  /** Whether a search is active: the checkbox then acts on the options matching it. */
  isSearching?: boolean;
  /** Whether every option matching the search (every option without one) is loaded. */
  isEveryOptionLoaded?: boolean;
  /**
   * Whether every option of the scope is known to be selected without being loaded, e.g. the
   * selection is still the one "Select all" made for this search.
   */
  isScopeSelected?: boolean;
  /** Disables the control, e.g. while options are loading. */
  isDisabled?: boolean;
  onAction: (action: AutomationDashboardBulkSelectAction) => void;
}

/**
 * The bulk selection checkbox (the PatternFly bulk select checkbox, which renders the partially
 * checked state as `indeterminate`; its `id` is the input's `name`). Without a search it selects every option, or clears the selection
 * when every option is selected; with a search it does the same for the options matching it and
 * keeps the rest of the selection. It is checked only when every option of that scope is known
 * to be selected, and partially checked for a partial or not fully known selection.
 */
export function AutomationDashboardBulkSelect(props: Readonly<AutomationDashboardBulkSelectProps>) {
  const { t } = useTranslation();
  const { id, selectedValues, visibleOptions, isSearching, isEveryOptionLoaded } = props;
  const { isScopeSelected, isDisabled, onAction } = props;

  // Memoized: it scans every visible option, which can be many after a bulk load.
  const checkbox = useMemo(
    () =>
      getCheckboxState(t, {
        selectedValues,
        visibleOptions,
        isSearching,
        isEveryOptionLoaded,
        isScopeSelected,
      }),
    [t, selectedValues, visibleOptions, isSearching, isEveryOptionLoaded, isScopeSelected]
  );

  return (
    <MenuToggleCheckbox
      id={`${id}-checkbox`}
      aria-label={checkbox.label}
      isChecked={checkbox.isChecked}
      isDisabled={isDisabled || !checkbox.isEnabled}
      onChange={() => onAction(checkbox.action)}
      data-testid="select-all"
    />
  );
}

/**
 * The state of the bulk selection checkbox for the scope: every option without a search, the
 * options matching it with one. The action is the one the label names: it only deselects when
 * every option of the scope is known to be selected.
 */
function getCheckboxState(
  t: TFunction,
  props: Pick<
    AutomationDashboardBulkSelectProps,
    'selectedValues' | 'visibleOptions' | 'isSearching' | 'isEveryOptionLoaded' | 'isScopeSelected'
  >
): {
  isChecked: boolean | null;
  label: string;
  action: AutomationDashboardBulkSelectAction;
  isEnabled: boolean;
} {
  const { selectedValues, visibleOptions, isSearching } = props;
  const hasSelection = selectedValues.size > 0;
  // "Select all" selects the visible options' scope, so it needs some.
  const canSelectAll = visibleOptions.length > 0;
  const selectedVisibleCount = visibleOptions.filter((option) =>
    selectedValues.has(option.value)
  ).length;
  // The loaded options may be only the first pages: every option of the scope is known to be
  // selected only when all of them are loaded, or when the selection is the one "Select all"
  // made (the selected values may also hold values of deleted options, so their count tells
  // nothing).
  const isEverySelected =
    canSelectAll &&
    selectedVisibleCount === visibleOptions.length &&
    (!!props.isEveryOptionLoaded || !!props.isScopeSelected);
  // Without a search the scope is every option, so any selection is part of it (also one of
  // options that are not loaded); with a search, only the selected matches are.
  const hasScopeSelection = isSearching ? selectedVisibleCount > 0 : hasSelection;
  const isChecked = hasScopeSelection ? isEverySelected || null : false;

  if (isSearching) {
    return {
      isChecked,
      label: isEverySelected ? t('Deselect all matching') : t('Select all matching'),
      action: isEverySelected ? 'deselectMatching' : 'selectMatching',
      isEnabled: canSelectAll,
    };
  }
  return {
    isChecked,
    label: isEverySelected ? t('Deselect all') : t('Select all'),
    action: isEverySelected ? 'none' : 'all',
    isEnabled: canSelectAll,
  };
}

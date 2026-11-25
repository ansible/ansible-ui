import { MenuToggleCheckbox } from '@patternfly/react-core';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

/**
 * What the bulk selection checkbox does: without a search "all" selects every option (also the
 * ones that are not loaded) and "none" clears the selection; with a search "selectMatching" adds
 * every option matching the search to the selection and "deselectMatching" removes them, keeping
 * the rest of the selection.
 */
export type AutomationDashboardBulkSelectAction =
  | 'all'
  | 'none'
  | 'selectMatching'
  | 'deselectMatching';

/** Whether every, some or none of the options in the scope of the checkbox are selected. */
export type AutomationDashboardBulkSelectScopeState = 'all' | 'some' | 'none';

export interface AutomationDashboardBulkSelectProps {
  id: string;
  /**
   * Whether every, some or none of the options in the scope are selected: every option without
   * a search, the options matching it with one.
   */
  scopeState: AutomationDashboardBulkSelectScopeState;
  /** Whether a search is active: the checkbox then acts on the options matching it. */
  isSearching?: boolean;
  /** Whether the scope has options; without any there is nothing to select. */
  hasOptions: boolean;
  /** Disables the control, e.g. while options are loading. */
  isDisabled?: boolean;
  onAction: (action: AutomationDashboardBulkSelectAction) => void;
}

/**
 * The bulk selection checkbox (the PatternFly bulk select checkbox, which renders the partially
 * checked state as `indeterminate`; its `id` is the input's `name`). Without a search it selects
 * every option, or clears the selection when every option is selected; with a search it does the
 * same for the options matching it and keeps the rest of the selection. It is checked only when
 * every option of that scope is known to be selected, and partially checked for a partial or not
 * fully known selection.
 */
export function AutomationDashboardBulkSelect(props: Readonly<AutomationDashboardBulkSelectProps>) {
  const { t } = useTranslation();
  const { id, scopeState, isSearching, hasOptions, isDisabled, onAction } = props;
  const checkbox = getCheckboxState(t, scopeState, !!isSearching);

  return (
    <MenuToggleCheckbox
      id={`${id}-checkbox`}
      aria-label={checkbox.label}
      isChecked={checkbox.isChecked}
      isDisabled={isDisabled || !hasOptions}
      onChange={() => onAction(checkbox.action)}
      data-testid="select-all"
    />
  );
}

/**
 * The state of the bulk selection checkbox. The action is the one the label names: it only
 * deselects when every option of the scope is known to be selected.
 */
function getCheckboxState(
  t: TFunction,
  scopeState: AutomationDashboardBulkSelectScopeState,
  isSearching: boolean
): { isChecked: boolean | null; label: string; action: AutomationDashboardBulkSelectAction } {
  const isEverySelected = scopeState === 'all';
  const isChecked = scopeState === 'some' ? null : isEverySelected;
  if (isSearching) {
    return {
      isChecked,
      label: isEverySelected ? t('Deselect all matching') : t('Select all matching'),
      action: isEverySelected ? 'deselectMatching' : 'selectMatching',
    };
  }
  return {
    isChecked,
    label: isEverySelected ? t('Deselect all') : t('Select all'),
    action: isEverySelected ? 'none' : 'all',
  };
}

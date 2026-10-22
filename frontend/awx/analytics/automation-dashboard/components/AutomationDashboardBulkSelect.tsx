import { PageSelectOption } from '@ansible/ansible-ui-framework/PageInputs/PageSelectOption';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleCheckbox,
} from '@patternfly/react-core';
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

/**
 * What a bulk selection action does: the menu items "all", "none" and "invert", and the
 * checkbox while searching: "selectMatching" adds every option matching the search to the
 * selection and "deselectMatching" removes them, keeping the rest of the selection.
 */
export type AutomationDashboardBulkSelectAction =
  | 'all'
  | 'none'
  | 'invert'
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
  /** Disables the control, e.g. while options are loading. */
  isDisabled?: boolean;
  onAction: (action: AutomationDashboardBulkSelectAction) => void;
}

/**
 * PatternFly bulk selector: a split button with a checkbox and a menu ("Select all",
 * "Select none", "Invert selection"). Without a search the checkbox selects all while nothing is
 * selected and clears the selection otherwise; with a search it selects or deselects the options
 * matching it and keeps the rest of the selection. It is checked only when every option of that
 * scope is known to be selected (all of them loaded), and partially checked for a partial or not
 * fully known selection.
 */
export function AutomationDashboardBulkSelect(props: Readonly<AutomationDashboardBulkSelectProps>) {
  const { t } = useTranslation();
  const { id, selectedValues, visibleOptions, isSearching, isEveryOptionLoaded, isDisabled } =
    props;
  const { onAction } = props;
  const [isOpen, setIsOpen] = useState(false);
  // An open menu closes when the control is disabled (e.g. a search starts loading), so no
  // action can start while the options load.
  useEffect(() => {
    if (isDisabled) setIsOpen(false);
  }, [isDisabled]);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const toggleButtonId = `${id}-toggle`;
  const hasSelection = selectedValues.size > 0;
  // "Select all" selects the matching options, so it needs some.
  const canSelectAll = visibleOptions.length > 0;

  // Memoized: it scans every visible option, which can be many after a bulk load, and the
  // selector also re-renders for its own menu.
  const checkbox = useMemo(
    () =>
      getCheckboxState(t, {
        selectedValues,
        visibleOptions,
        isSearching,
        isEveryOptionLoaded,
        hasSelection,
        canSelectAll,
      }),
    [
      t,
      selectedValues,
      visibleOptions,
      isSearching,
      isEveryOptionLoaded,
      hasSelection,
      canSelectAll,
    ]
  );
  const isCheckboxDisabled = isDisabled || !checkbox.isEnabled;

  // Escape closes only this menu (the innermost one), not the select menu around it, so the
  // event is stopped before it reaches the document listeners of both menus.
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !isOpen) return;
    event.stopPropagation();
    setIsOpen(false);
    // With split button items the toggle ref is the wrapper; focus the toggle button itself.
    document.getElementById(toggleButtonId)?.focus();
  };

  return (
    <Dropdown
      // The menu's id, e.g. to tell whether it has the focus.
      id={`${id}-menu`}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSelect={(_event, value) => {
        setIsOpen(false);
        onAction(value as AutomationDashboardBulkSelectAction);
      }}
      // Rendered in the body so the (possibly short) select menu does not clip it. Clicks in it
      // are stopped so the select does not treat them as outside clicks and close.
      popperProps={{ appendTo: () => document.body }}
      onClick={(event) => event.stopPropagation()}
      // The menu is in the body, so its key events do not reach the toggle's handler.
      onKeyDown={onKeyDown}
      toggle={{
        toggleRef,
        toggleNode: (
          <MenuToggle
            ref={toggleRef}
            id={toggleButtonId}
            aria-label={t('Bulk selection')}
            isExpanded={isOpen}
            isDisabled={isDisabled}
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={onKeyDown}
            splitButtonItems={[
              <MenuToggleCheckbox
                key="bulk-select-checkbox"
                id={`${id}-checkbox`}
                aria-label={checkbox.label}
                isChecked={checkbox.isChecked}
                isDisabled={isCheckboxDisabled}
                onChange={() => onAction(checkbox.action)}
                data-testid="select-all"
              />,
            ]}
          />
        ),
      }}
    >
      <DropdownList>
        <DropdownItem value="all" key="all" isDisabled={!canSelectAll}>
          {t('Select all')}
        </DropdownItem>
        <DropdownItem value="none" key="none" isDisabled={!hasSelection}>
          {t('Select none')}
        </DropdownItem>
        <DropdownItem value="invert" key="invert">
          {t('Invert selection')}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
}

/**
 * The checkbox of the bulk selector. Without a search it selects all while nothing is selected
 * and clears the selection otherwise; with a search it selects or deselects the matches.
 */
function getCheckboxState(
  t: TFunction,
  props: Pick<
    AutomationDashboardBulkSelectProps,
    'selectedValues' | 'visibleOptions' | 'isSearching' | 'isEveryOptionLoaded'
  > & { hasSelection: boolean; canSelectAll: boolean }
): {
  isChecked: boolean | null;
  label: string;
  action: AutomationDashboardBulkSelectAction;
  isEnabled: boolean;
} {
  const { selectedValues, visibleOptions, isSearching, isEveryOptionLoaded } = props;
  const { hasSelection, canSelectAll } = props;
  const selectedVisibleCount = visibleOptions.filter((option) =>
    selectedValues.has(option.value)
  ).length;
  // The loaded options may be only the first pages: every option of the scope is known to be
  // selected only when all of them are loaded (the selected values may also hold values of
  // deleted options, so their count tells nothing).
  const isEverySelected =
    canSelectAll && selectedVisibleCount === visibleOptions.length && !!isEveryOptionLoaded;

  if (isSearching) {
    // The action is the one the label names: it only deselects when every match is known to be
    // selected.
    return {
      isChecked: selectedVisibleCount === 0 ? false : isEverySelected || null,
      label: isEverySelected ? t('Deselect all matching') : t('Select all matching'),
      action: isEverySelected ? 'deselectMatching' : 'selectMatching',
      isEnabled: canSelectAll,
    };
  }
  return {
    isChecked: hasSelection ? isEverySelected || null : false,
    label: hasSelection ? t('Select none') : t('Select all'),
    action: hasSelection ? 'none' : 'all',
    isEnabled: hasSelection || canSelectAll,
  };
}

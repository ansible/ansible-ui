import { Scrollable } from '@ansible/ansible-ui-framework';
import { getID } from '@ansible/ansible-ui-framework/hooks/useID';
import { PageSelectOption } from '@ansible/ansible-ui-framework/PageInputs/PageSelectOption';
import {
  Badge,
  Flex,
  Bullseye,
  Divider,
  MenuFooter,
  MenuSearch,
  MenuSearchInput,
  MenuToggle,
  MenuToggleElement,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  Spinner,
} from '@patternfly/react-core';
import {
  KeyboardEvent,
  ReactNode,
  Ref,
  RefObject,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useAutomationDashboardProgressiveOptions } from '../common/useAutomationDashboardProgressiveOptions';
import {
  AutomationDashboardBulkSelect,
  AutomationDashboardBulkSelectAction,
} from './AutomationDashboardBulkSelect';

export interface AutomationDashboardMultiSelectProps {
  /** The ID of the select; the IDs of its parts (search, bulk selector) are based on it. */
  id: string;
  /** The placeholder to show when no values are selected. */
  placeholder: ReactNode;
  /**
   * The name of the filter, e.g. "Template". The toggle's accessible name is this name and the
   * selection state, as the toggle itself only shows the state.
   */
  label?: string;
  /** The selected values. */
  values: string[] | undefined;
  /** The function to set the selected values. */
  onSelect: (setter: (currentValues: string[] | undefined) => string[] | undefined) => void;
  /**
   * "all" selects every option; "selectMatching" adds the options matching the search and
   * "deselectMatching" removes them, keeping the rest. All of them load the options first.
   */
  onSelectMatching: (mode: Exclude<AutomationDashboardBulkSelectAction, 'none'>) => void;
  /**
   * The (trimmed) search of the "Select all" that made the current selection, '' without a
   * search. The toggle then shows "All selected" or "All N matching" instead of the count, also
   * after the search changed, and the bulk checkbox knows every option of that search is
   * selected.
   */
  allSelectedSearch?: string;
  /** The options to select from. */
  options: PageSelectOption<string>[];
  /** The footer to show at the bottom of the dropdown. */
  footer?: ReactNode;
  /** Indicates if the select is open. */
  open: boolean;
  /** The function to set the open state. */
  setOpen: (open: boolean) => void;
  /** The text in the search input. */
  searchValue: string;
  /**
   * The text the options are filtered by here (defaults to `searchValue`). An async select whose
   * options are the server's matches for the search filters them only while a typed search is
   * not queried yet.
   */
  localFilter?: string;
  /** The function to set the search value. */
  setSearchValue: (searchValue: string) => void;
  /** Shows a loading spinner in the dropdown while there are no options yet. */
  isLoading?: boolean;
  /**
   * Disables the options, the search and the bulk selector while a bulk action loads the
   * remaining options; the toggle shows a spinner then, also while the menu is closed.
   */
  isSelectingAll?: boolean;
  /** Whether every option for the search is loaded. */
  isEveryOptionLoaded?: boolean;
  /** Shows the toggle in the danger status, e.g. when a bulk action failed while closed. */
  hasError?: boolean;
}

/** Whether a key pressed on the toggle types a character (Space activates the toggle). */
function isTypeaheadKey(event: KeyboardEvent<HTMLElement>) {
  if (event.ctrlKey || event.metaKey || event.altKey) return false;
  return event.key.length === 1 && event.key !== ' ';
}

/** The first focusable option in the menu list. */
const FIRST_OPTION_SELECTOR = 'li button:not(:disabled),li input:not(:disabled)';

/**
 * The elements Tab moves between in the menu, in order: the bulk selector, the search, the
 * option list (one stop, the arrow keys move in it) and the footer buttons.
 */
function getMenuTabStops(menu: HTMLElement) {
  const stops: HTMLElement[] = [];
  let hasListStop = false;
  for (const element of menu.querySelectorAll<HTMLElement>(
    'button:not(:disabled),input:not(:disabled)'
  )) {
    const isOption = !!element.closest('li');
    if (isOption && hasListStop) continue;
    hasListStop ||= isOption;
    stops.push(element);
  }
  return stops;
}

/** Compares labels case-insensitively; one collator is faster than `localeCompare` per pair. */
const labelCollator = new Intl.Collator(undefined, { sensitivity: 'accent' });

/** The options matching the search, sorted by label. */
function getVisibleOptions(options: PageSelectOption<string>[], searchValue: string) {
  return options
    .filter((option) => optionMatchesSearch(option, searchValue))
    .sort((a, b) => labelCollator.compare(a.label, b.label));
}

/**
 * The bulk checkbox, the search and the options are disabled while a bulk action loads, so the
 * focus of the started control would drop to the page. The menu keeps the focus meanwhile and
 * gives it back to the bulk checkbox afterwards; for this the menu is focusable by script
 * (`tabIndex={-1}`).
 */
function useKeepFocusWhileBulkLoading(
  menuRef: RefObject<HTMLDivElement>,
  bulkSelectId: string,
  isSelectingAll: boolean | undefined
) {
  const focusReturnRef = useRef<HTMLElement | null>();
  useLayoutEffect(() => {
    const menu = menuRef.current;
    const active = document.activeElement;
    if (isSelectingAll) {
      // A disabled control cannot keep the focus.
      const isFocusLost =
        !active ||
        active === document.body ||
        (!!menu?.contains(active) && active.matches(':disabled'));
      if (!menu || !isFocusLost) return;
      // The PatternFly bulk checkbox gets its `id` as the input `name`; found by name, not by a
      // CSS selector, so any id works (e.g. one with a colon).
      focusReturnRef.current = document.getElementsByName(`${bulkSelectId}-checkbox`)[0];
      menu.focus();
      return;
    }
    const focusReturn = focusReturnRef.current;
    focusReturnRef.current = undefined;
    if (focusReturn && menu && active === menu) focusReturn.focus();
  }, [menuRef, isSelectingAll, bulkSelectId]);
}

/** The selection state the toggle shows, and its badge. */
function getToggleState(
  t: TFunction,
  state: Pick<AutomationDashboardMultiSelectProps, 'isSelectingAll' | 'allSelectedSearch'>,
  selectedCount: number
): { toggleState: string; toggleBadge: ReactNode } {
  // A bulk action may still be loading after the menu closed.
  if (state.isSelectingAll) {
    const toggleState = t('Loading...');
    return { toggleState, toggleBadge: <Spinner size="sm" aria-label={toggleState} /> };
  }
  if (selectedCount === 0) return { toggleState: t('None selected'), toggleBadge: null };
  const toggleState = getSelectedState(t, state.allSelectedSearch, selectedCount);
  return { toggleState, toggleBadge: <Badge>{toggleState}</Badge> };
}

/** The selection state: "All selected" / "All N matching" after "Select all", else "N selected". */
function getSelectedState(t: TFunction, allSelectedSearch: string | undefined, count: number) {
  if (allSelectedSearch === undefined) return t('{{count}} selected', { count });
  if (allSelectedSearch === '') return t('All selected');
  return t('All {{count}} matching', { count });
}

/** The DOM id of an option; with the value it stays unique when labels are the same. */
function getOptionDomId(option: PageSelectOption<string>) {
  return `${getID(option)}-${option.value}`;
}

/**
 * Whether the option is shown for the search value: a case-insensitive label match of the
 * trimmed search, as the dashboard API trims the search before matching the name.
 */
export function optionMatchesSearch(option: PageSelectOption<string>, searchValue: string) {
  const search = searchValue.trim().toLowerCase();
  return search === '' || option.label.toLowerCase().includes(search);
}

/**
 * Dashboard multi-select used by `AutomationDashboardAsyncMultiSelectFilter`, based on the
 * framework `PageMultiSelect`: a search with a "Select all" / "Deselect all" checkbox, the
 * options with checkboxes and an optional footer. The toggle shows "N selected" ("All selected"
 * or "All N matching" after "Select all"); the selected values are shown as the toolbar chips.
 */
export function AutomationDashboardMultiSelect(
  props: Readonly<AutomationDashboardMultiSelectProps>
) {
  const { t } = useTranslation();
  const {
    id,
    placeholder,
    values,
    onSelect,
    options,
    open,
    setOpen,
    searchValue,
    setSearchValue,
    onSelectMatching,
    isSelectingAll,
    hasError,
  } = props;
  const selectListRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const bulkSelectId = `${id}-bulk-select`;

  useKeepFocusWhileBulkLoading(selectListRef, bulkSelectId, isSelectingAll);

  // The selected values are shown as the toolbar chips; the toggle only shows their count.
  const localFilter = props.localFilter ?? searchValue;
  const selectedCount = values?.length ?? 0;
  const selectedValues = useMemo(() => new Set(values), [values]);

  const { toggleState, toggleBadge } = getToggleState(t, props, selectedCount);
  const toggleLabel = props.label
    ? t('{{label}}: {{state}}', { label: props.label, state: toggleState })
    : undefined;

  // Opening the menu with the keyboard focuses the search (Shift+Tab reaches the bulk checkbox);
  // typing a character on the closed toggle also starts the search with it.
  const onToggleKeyboardOpen = (search?: string) => {
    setOpen(true);
    if (search !== undefined) setSearchValue(search);
    setTimeout(() => searchRef.current?.focus(), 1);
  };
  const renderToggle = (toggleRef: Ref<MenuToggleElement>) => (
    <AutomationDashboardMultiSelectToggle
      toggleRef={toggleRef}
      id={id}
      open={open}
      setOpen={setOpen}
      hasError={hasError}
      badge={toggleBadge}
      ariaLabel={toggleLabel}
      isSelectingAll={isSelectingAll}
      onKeyboardOpen={onToggleKeyboardOpen}
    >
      {selectedCount === 0 && !isSelectingAll && <Placeholder>{placeholder}</Placeholder>}
    </AutomationDashboardMultiSelectToggle>
  );

  // Toggles the clicked option; `itemValue` is the `SelectOption` value (the option value).
  const onSelectHandler = useCallback(
    (_: unknown, itemValue: string | number | undefined) => {
      if (typeof itemValue !== 'string') return;
      onSelect((previousValues = []) =>
        previousValues.includes(itemValue)
          ? previousValues.filter((value) => value !== itemValue)
          : [...previousValues, itemValue]
      );
    },
    [onSelect]
  );

  const visibleOptions = useMemo(
    () => getVisibleOptions(options, localFilter),
    [options, localFilter]
  );
  // Thousands of options may be loaded: they are rendered in batches (a new search or opening
  // the select starts with the first one again).
  const progressive = useAutomationDashboardProgressiveOptions(
    visibleOptions,
    // The typed text, not `localFilter`: that one stays '' when a queried search is cleared.
    `${open}:${searchValue}`,
    selectListRef
  );

  // Tab and Shift+Tab move between the parts of the menu; past the first or the last one the
  // menu closes and the toggle gets the focus, as a Tab in a PatternFly select does.
  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    progressive.onKeyDown(event);
    const menu = selectListRef.current;
    if (event.key !== 'Tab' || !menu) return;
    const stops = getMenuTabStops(menu);
    const active = document.activeElement;
    const activeList = active?.closest('li') ? active.closest('ul') : null;
    // The menu itself has the focus while a bulk action loads: it comes before the first stop.
    const index = stops.findIndex(
      (stop) => stop === active || (!!activeList && stop.closest('ul') === activeList)
    );
    if (index === -1 && active !== menu) return;
    event.preventDefault();
    event.stopPropagation();
    const next = stops[index + (event.shiftKey ? -1 : 1)];
    if (next) {
      next.focus();
      return;
    }
    setOpen(false);
    document.getElementById(id)?.focus();
  };

  return (
    <Select
      id={`${id}-select`}
      onKeyDown={onMenuKeyDown}
      selected={values}
      onSelect={onSelectHandler}
      isOpen={open}
      onOpenChange={setOpen}
      toggle={renderToggle}
      popperProps={{
        appendTo: () => document.body,
        preventOverflow: true,
        enableFlip: true,
      }}
      innerRef={selectListRef}
      tabIndex={-1}
    >
      <MenuSearch>
        <Flex flexWrap={{ default: 'nowrap' }} alignItems={{ default: 'alignItemsCenter' }}>
          <AutomationDashboardBulkSelect
            id={bulkSelectId}
            selectedValues={selectedValues}
            visibleOptions={visibleOptions}
            isSearching={searchValue.trim() !== ''}
            isEveryOptionLoaded={props.isEveryOptionLoaded}
            isScopeSelected={props.allSelectedSearch === searchValue.trim()}
            isDisabled={props.isLoading || isSelectingAll}
            onAction={(action) =>
              action === 'none' ? onSelect(() => []) : onSelectMatching(action)
            }
          />
          <MenuSearchInput data-testid="search-input">
            <SearchInput
              id={`${id}-search`}
              ref={searchRef}
              value={searchValue}
              // Typing would start a new search, which aborts the running bulk load.
              isDisabled={isSelectingAll}
              onChange={(_, value: string) => setSearchValue(value)}
              onClear={(event) => {
                event.stopPropagation();
                setSearchValue('');
              }}
              resultsCount={
                visibleOptions.length !== options.length
                  ? `${visibleOptions.length} / ${options.length}`
                  : undefined
              }
              onKeyDown={(event) => {
                // Arrow down moves the focus from the search to the first option (Tab: see
                // `onMenuKeyDown`).
                if (event.key !== 'ArrowDown') return;
                event.preventDefault();
                event.stopPropagation();
                selectListRef.current?.querySelector<HTMLElement>(FIRST_OPTION_SELECTOR)?.focus();
              }}
            />
          </MenuSearchInput>
        </Flex>
      </MenuSearch>
      <Divider />
      {visibleOptions.length === 0 && props.isLoading && (
        <SpinnerBullseye>
          <Spinner size="lg" />
        </SpinnerBullseye>
      )}
      {/* An error is shown in the footer instead. */}
      {visibleOptions.length === 0 && !props.isLoading && !hasError && (
        <SelectOption isDisabled key="no result">
          {t('No results found')}
        </SelectOption>
      )}
      {visibleOptions.length > 0 && (
        <ScrollableStyled onScroll={progressive.onScroll}>
          <AutomationDashboardMultiSelectList
            options={progressive.renderedOptions}
            setSize={visibleOptions.length}
            selectedValues={selectedValues}
            isDisabled={isSelectingAll}
          />
        </ScrollableStyled>
      )}
      {props.footer && <MenuFooter>{props.footer}</MenuFooter>}
    </Select>
  );
}

/**
 * The toggle of the dashboard multi-select (PatternFly passes its ref). It shows the selection
 * state. Enter or Space on it while it is closed calls `onKeyboardOpen`, and typing a character
 * calls it with the key (not while a bulk action runs: the search is disabled then, so Enter and
 * Space only open the menu).
 */
function AutomationDashboardMultiSelectToggle(
  props: Readonly<{
    toggleRef: Ref<MenuToggleElement>;
    id: string;
    open: boolean;
    setOpen: (open: boolean) => void;
    hasError?: boolean;
    badge: ReactNode;
    ariaLabel?: string;
    isSelectingAll?: boolean;
    onKeyboardOpen: (search?: string) => void;
    children?: ReactNode;
  }>
) {
  const { id, open, setOpen, isSelectingAll, onKeyboardOpen } = props;
  return (
    <MenuToggleStyled
      id={id}
      ref={props.toggleRef}
      onClick={() => setOpen(!open)}
      isExpanded={open}
      status={props.hasError ? 'danger' : undefined}
      badge={props.badge}
      onKeyDown={(event) => {
        // Not while the menu is open: the search has the text then, and Enter or Space closes it.
        if (open || isSelectingAll) return;
        const isActivation = event.key === 'Enter' || event.key === ' ';
        if (!isActivation && !isTypeaheadKey(event)) return;
        event.preventDefault();
        onKeyboardOpen(isActivation ? undefined : event.key);
      }}
      data-testid={id}
      aria-label={props.ariaLabel}
      isFullWidth
    >
      {props.children}
    </MenuToggleStyled>
  );
}

/**
 * The rendered options (a batch of `setSize` options): each tells its position and the count of
 * all options, so a screen reader announces the full list, not only the rendered part.
 */
function AutomationDashboardMultiSelectList(
  props: Readonly<{
    options: PageSelectOption<string>[];
    setSize: number;
    selectedValues: Set<string>;
    isDisabled?: boolean;
  }>
) {
  return (
    <SelectList>
      {props.options.map((option, index) => (
        <SelectOption
          id={getOptionDomId(option)}
          key={option.value}
          value={option.value}
          aria-setsize={props.setSize}
          aria-posinset={index + 1}
          hasCheckbox
          isDisabled={props.isDisabled}
          isSelected={props.selectedValues.has(option.value)}
          data-testid={getID(option)}
        >
          {option.label}
        </SelectOption>
      ))}
    </SelectList>
  );
}

const ScrollableStyled = styled(Scrollable)`
  max-height: 40vh;
`;

const MenuToggleStyled = styled(MenuToggle)`
  padding-top: 4px;
  padding-bottom: 4px;
  min-height: 37px;
`;

const Placeholder = styled.span`
  opacity: 0.7;
`;

const SpinnerBullseye = styled(Bullseye)`
  padding: 16px;
`;

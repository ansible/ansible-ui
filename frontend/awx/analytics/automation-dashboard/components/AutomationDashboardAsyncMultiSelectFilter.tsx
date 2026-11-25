import { useDebounce } from '@ansible/ansible-ui-framework/hooks/useDebounce';
import { PageAsyncQueryErrorText } from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSelectOptions';
import { PageSelectOption } from '@ansible/ansible-ui-framework/PageInputs/PageSelectOption';
import {
  ActionList,
  ActionListItem,
  Button,
  Flex,
  FlexItem,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import { MouseEvent, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AutomationDashboardAsyncOptionsFn,
  IncompleteOptionsError,
  useAutomationDashboardAsyncOptions,
} from '../common/useAutomationDashboardAsyncOptions';
import {
  deselectMatching,
  EMPTY_SELECTION,
  FilterSelection,
  isSameSelection,
  selectEvery,
  selectMatching,
  SelectionDeps,
  setOptionSelected,
  trySelectMatching,
  trySetOptionSelected,
} from '../utils/filterSelection';
import { AutomationDashboardBulkSelectAction } from './AutomationDashboardBulkSelect';
import { AutomationDashboardMultiSelect } from './AutomationDashboardMultiSelect';

/** A new selection, or a function that computes it from the current one. */
export type SelectionChange = FilterSelection | ((current: FilterSelection) => FilterSelection);

export interface AutomationDashboardAsyncMultiSelectFilterProps {
  /** The ID of the select; the IDs of its parts (search, bulk selector) are based on it. */
  id: string;
  /** The placeholder to show when no values are selected. */
  placeholder: ReactNode;
  /** The name of the filter, e.g. "Template", for the toggle's accessible name. */
  label?: string;
  /** The selection (see `FilterSelection`). */
  selection: FilterSelection;
  /**
   * Sets the selection; a function computes it from the current selection, so changes made one
   * after another before a re-render all apply.
   */
  onSelectionChange: (change: SelectionChange) => void;
  /** The known name of a value, e.g. of an excluded one; see `SelectionDeps`. */
  getLabel: SelectionDeps['getLabel'];
  /** The function to query for options. */
  queryOptions: AutomationDashboardAsyncOptionsFn;
  /** The text to show if the query fails. */
  queryErrorText?: PageAsyncQueryErrorText;
  /** Called with the options whenever options are loaded, e.g. to show their labels in chips. */
  onOptionsLoaded?: (options: PageSelectOption<string>[]) => void;
  /**
   * Called when a change of the selection starts or stops loading the options it needs, also
   * while the select is closed.
   */
  onBulkLoadingChange?: (isLoading: boolean) => void;
  /**
   * Changes when the filters are replaced as a whole ("Clear all filters", a saved report). It
   * cancels a change of the selection that is still loading, also when the selection stays the
   * same (e.g. empty).
   */
  resetKey?: number;
}

/**
 * Dashboard async multi-select for the template, label, organization and project filters, based
 * on the framework `PageAsyncMultiSelect`. Options are loaded page by page. The selection is
 * described (every option, the matches of a search, explicit and excluded values; see
 * `FilterSelection`), so the bulk checkbox does not load the options it selects; only a change
 * that an excluded search term blocks loads the options it needs. The toggle summarizes the
 * selection; its parts are shown as the toolbar chips. Load errors are shown in the menu, so the
 * select can always be closed.
 */
export function AutomationDashboardAsyncMultiSelectFilter(
  props: Readonly<AutomationDashboardAsyncMultiSelectFilterProps>
) {
  const { selection, onSelectionChange, getLabel, queryErrorText, onOptionsLoaded } = props;
  const { onBulkLoadingChange, resetKey } = props;
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  /**
   * The text in the search input; `searchValue` follows it debounced and trimmed (as the API
   * trims it, so a search of only spaces is no search) and is queried.
   */
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const setDebouncedSearch = useDebounce((search: string) => setSearchValue(search.trim()), 200);
  const setSearch = useCallback(
    (search: string) => {
      setInputValue(search);
      // Typing on the closed toggle opens the select with the typed text: it is queried right
      // away, instead of the first page without a search and then the text.
      if (open) {
        setDebouncedSearch(search);
      } else {
        setDebouncedSearch.clear();
        setSearchValue(search.trim());
      }
    },
    [open, setDebouncedSearch]
  );
  // A closed select starts the next time without a search, so a pending search is dropped:
  // reopening within the debounce must not query the old search.
  useEffect(() => {
    if (open) return;
    setDebouncedSearch.clear();
    setInputValue('');
    setSearchValue('');
  }, [open, setDebouncedSearch]);

  const {
    options,
    loading,
    loadingAll,
    allLoaded,
    isComplete,
    total,
    search: loadedSearch,
    error,
    loadMoreError,
    bulkError,
    loadMore,
    reload,
    loadMatching,
    cancelBulk,
  } = useAutomationDashboardAsyncOptions(props.queryOptions, searchValue, open, onOptionsLoaded);
  // The bulk actions use `searchValue` and the options loaded for it, so they wait until it has
  // caught up with the input and its load has started.
  const isSearchPending =
    inputValue.trim() !== searchValue || (open && loadedSearch !== searchValue);

  // The shown options are the server's matches for `loadedSearch`; only while the typed text
  // is not queried yet are they filtered here by it.
  const localFilter = inputValue.trim() === loadedSearch ? '' : inputValue;

  const startBulkAction = useBulkActionGuard(selection, resetKey, cancelBulk);

  useEffect(() => {
    onBulkLoadingChange?.(loadingAll);
  }, [loadingAll, onBulkLoadingChange]);
  useEffect(() => () => onBulkLoadingChange?.(false), [onBulkLoadingChange]);

  // A partial bulk load tells so, unlike a failed query.
  const getErrorText = (loadError: Error) => {
    if (loadError instanceof IncompleteOptionsError) return loadError.message;
    return typeof queryErrorText === 'function'
      ? queryErrorText(loadError)
      : (queryErrorText ?? t('Error loading options'));
  };

  // A change that needs to load options (see `FilterSelection`) sets the selection when they
  // are loaded, also if the select closed meanwhile; a selection change while they load cancels
  // it (see `useBulkActionGuard`). Other changes are set right away, computed from the current
  // selection.
  const changeSelection = useCallback(
    (change: (deps: SelectionDeps) => Promise<FilterSelection | undefined>) => {
      const isRunningAction = startBulkAction();
      const startSelection = selection;
      void change({ getLabel, loadMatching }).then((next) => {
        if (!isRunningAction() || !next) return;
        // Also when a newer change (e.g. a removed chip) is not rendered yet, so the guard has
        // not seen it: the result of the old selection must not overwrite it.
        onSelectionChange((current) => (isSameSelection(current, startSelection) ? next : current));
      });
    },
    [getLabel, loadMatching, onSelectionChange, selection, startBulkAction]
  );

  // Without a search the checkbox selects every option ("all") or clears the selection
  // ("none"); with a search it adds the options matching it to the selection
  // ("selectMatching") or removes them ("deselectMatching").
  const onBulkAction = useCallback(
    (action: AutomationDashboardBulkSelectAction) => {
      if (action === 'all') onSelectionChange(selectEvery());
      else if (action === 'none') onSelectionChange(EMPTY_SELECTION);
      else if (action === 'deselectMatching') {
        onSelectionChange((current) => deselectMatching(current, searchValue, getLabel));
      } else if (trySelectMatching(selection, searchValue, getLabel)) {
        onSelectionChange(
          (current) => trySelectMatching(current, searchValue, getLabel) ?? current
        );
      } else changeSelection((deps) => selectMatching(selection, searchValue, deps));
    },
    [changeSelection, getLabel, onSelectionChange, searchValue, selection]
  );

  const onToggleOption = useCallback(
    (option: PageSelectOption<string>, selected: boolean) => {
      if (trySetOptionSelected(selection, option, selected)) {
        onSelectionChange((current) => trySetOptionSelected(current, option, selected) ?? current);
      } else changeSelection((deps) => setOptionSelected(selection, option, selected, deps));
    },
    [changeSelection, onSelectionChange, selection]
  );

  const footerError = error ?? bulkError ?? loadMoreError;

  return (
    <AutomationDashboardMultiSelect
      id={props.id}
      placeholder={props.placeholder}
      label={props.label}
      options={options}
      selection={selection}
      getLabel={getLabel}
      onToggleOption={onToggleOption}
      onBulkAction={onBulkAction}
      footer={
        footerError || !allLoaded ? (
          <>
            {footerError && (
              <ErrorFooter
                text={getErrorText(footerError)}
                // A failed first page has no options: it is loaded again with "Retry".
                onRetry={error ? withoutPropagation(reload) : undefined}
              />
            )}
            {!error && !allLoaded && (
              <LoadMoreFooter
                loading={loading}
                // A bulk load fetches the remaining options as well.
                isFetching={loading || loadingAll}
                // A bulk load replaces the shown options; "Load more" would overwrite them.
                isDisabled={loadingAll}
                loadedCount={options.length}
                total={total}
                onLoadMore={withoutPropagation(loadMore)}
              />
            )}
          </>
        ) : undefined
      }
      open={open}
      setOpen={setOpen}
      searchValue={inputValue}
      localFilter={localFilter}
      setSearchValue={setSearch}
      isLoading={loading || isSearchPending}
      isSelectingAll={loadingAll}
      // Only a complete list tells whether every option is selected.
      isEveryOptionLoaded={isComplete}
      hasError={!!footerError}
    />
  );
}

/**
 * Tracks the running change of the selection that loads options, and returns the function that
 * starts one. It is cancelled (with `cancelBulk`) when the selection changes meanwhile (a removed
 * chip) or the filters are replaced (`resetKey`: "Clear all filters", a saved report, also when
 * they leave this selection unchanged), as the user's latest change wins over the one that is
 * still loading. The started function tells whether the change is still the running one; each
 * change is its own object, so a cancelled change that resolves late cannot touch a newer one.
 */
function useBulkActionGuard(
  selection: FilterSelection,
  resetKey: number | undefined,
  cancelBulk: () => void
) {
  const bulkActionRef = useRef<{ startSelection: FilterSelection; startResetKey?: number }>();
  useEffect(() => {
    const action = bulkActionRef.current;
    if (!action || isUnchangedSince(action, selection, resetKey)) return;
    bulkActionRef.current = undefined;
    cancelBulk();
  }, [cancelBulk, selection, resetKey]);
  return useCallback(() => {
    // A newer change replaces the running one: its load is not needed any more.
    if (bulkActionRef.current) cancelBulk();
    const action = { startSelection: selection, startResetKey: resetKey };
    bulkActionRef.current = action;
    return () => {
      if (bulkActionRef.current !== action) return false;
      bulkActionRef.current = undefined;
      return true;
    };
  }, [cancelBulk, selection, resetKey]);
}

/** Whether the selection and the filters are still the ones the change started with. */
function isUnchangedSince(
  action: { startSelection: FilterSelection; startResetKey?: number },
  selection: FilterSelection,
  resetKey: number | undefined
) {
  return action.startResetKey === resetKey && isSameSelection(action.startSelection, selection);
}

/** Runs `action` without letting the click toggle the select menu. */
function withoutPropagation(action: () => void) {
  return (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    action();
  };
}

/** A load error in the dropdown footer, with "Retry" when the first page failed. */
function ErrorFooter(props: Readonly<{ text: string; onRetry?: (event: MouseEvent) => void }>) {
  const { t } = useTranslation();
  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }}>
      <FlexItem grow={{ default: 'grow' }}>
        <HelperText>
          <HelperTextItem variant="error">{props.text}</HelperTextItem>
        </HelperText>
      </FlexItem>
      {props.onRetry && (
        <FlexItem>
          <Button variant="link" isInline onClick={props.onRetry}>
            {t('Retry')}
          </Button>
        </FlexItem>
      )}
    </Flex>
  );
}

/**
 * The dropdown footer while not every option is loaded: "Load more" and the count, "Loading X of
 * Y" while more options are fetched and "Loaded X of Y" otherwise.
 */
function LoadMoreFooter(
  props: Readonly<{
    loading: boolean;
    /** More options are being fetched ("Load more" or a bulk load). */
    isFetching: boolean;
    isDisabled?: boolean;
    loadedCount: number;
    total: number;
    onLoadMore: (event: MouseEvent) => void;
  }>
) {
  const { t } = useTranslation();
  const { loading, loadedCount, total } = props;
  return (
    <Flex>
      <FlexItem grow={{ default: 'grow' }}>
        <ActionList>
          <ActionListItem>
            <Button
              id="load-more"
              isLoading={loading}
              onClick={props.onLoadMore}
              isDisabled={loading || props.isDisabled}
            >
              {loading ? t('Loading...') : t('Load more')}
            </Button>
          </ActionListItem>
        </ActionList>
      </FlexItem>
      {total !== 0 && (
        <FlexItem>
          {props.isFetching
            ? t('Loading {{count}} of {{total}}', { count: loadedCount, total })
            : t('Loaded {{count}} of {{total}}', { count: loadedCount, total })}
        </FlexItem>
      )}
    </Flex>
  );
}

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
import { AllSelectedScope } from '../utils/filterStateUpdates';
import { AutomationDashboardBulkSelectAction } from './AutomationDashboardBulkSelect';
import {
  AutomationDashboardMultiSelect,
  AutomationDashboardMultiSelectProps,
} from './AutomationDashboardMultiSelect';

export interface AutomationDashboardAsyncMultiSelectFilterProps {
  /** The ID of the select; the IDs of its parts (search, bulk selector) are based on it. */
  id: string;
  /** The placeholder to show when no values are selected. */
  placeholder: ReactNode;
  /** The name of the filter, e.g. "Template", for the toggle's accessible name. */
  label?: string;
  /** The selected values. */
  values: string[] | undefined;
  /**
   * The function to set the selected values; "Select all" also passes the options it selected
   * and its search, so the selection is known to be made by it.
   */
  onSelect: (
    setter: Parameters<AutomationDashboardMultiSelectProps['onSelect']>[0],
    allSelected?: AllSelectedScope
  ) => void;
  /**
   * The search of the "Select all" that made the selection ('' without a search), while the
   * selection is still the one it made: the toggle shows "All selected" / "All N matching".
   */
  allSelectedSearch?: string;
  /** The function to query for options. */
  queryOptions: AutomationDashboardAsyncOptionsFn;
  /** The text to show if the query fails. */
  queryErrorText?: PageAsyncQueryErrorText;
  /** Called with the options whenever options are loaded, e.g. to show their labels in chips. */
  onOptionsLoaded?: (options: PageSelectOption<string>[]) => void;
  /** Called when a bulk action starts or stops loading, also while the select is closed. */
  onBulkLoadingChange?: (isLoading: boolean) => void;
  /**
   * Changes when the filters are replaced as a whole ("Clear all filters", a saved report). It
   * cancels a running bulk action also when the selection stays the same (e.g. empty).
   */
  resetKey?: number;
}

/**
 * Dashboard async multi-select for the template, label, organization and project filters, based
 * on the framework `PageAsyncMultiSelect`. Options are loaded page by page; the bulk checkbox
 * loads the remaining pages for the search first. The toggle shows "N selected" ("All selected"
 * or "All N matching" after "Select all"); the selected values are shown as the toolbar chips. Load errors are shown in the menu, so the select can always be closed.
 */
export function AutomationDashboardAsyncMultiSelectFilter(
  props: Readonly<AutomationDashboardAsyncMultiSelectFilterProps>
) {
  const { values, onSelect, queryErrorText, onOptionsLoaded, onBulkLoadingChange, resetKey } =
    props;
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
    loadAll,
    cancelBulk,
  } = useAutomationDashboardAsyncOptions(props.queryOptions, searchValue, open, onOptionsLoaded);
  // The bulk actions use `searchValue` and the options loaded for it, so they wait until it has
  // caught up with the input and its load has started.
  const isSearchPending =
    inputValue.trim() !== searchValue || (open && loadedSearch !== searchValue);

  // The shown options are the server's matches for `loadedSearch`; only while the typed text
  // is not queried yet are they filtered here by it.
  const localFilter = inputValue.trim() === loadedSearch ? '' : inputValue;

  const startBulkAction = useBulkActionGuard(values, resetKey, cancelBulk);

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

  // Without a search the checkbox selects every option ("all", replacing the selection); with a
  // search it adds the options matching it to the selection ("selectMatching") or removes them
  // ("deselectMatching"). The selection is set when the options are loaded, also if the select
  // closed meanwhile; a selection change while they load cancels it (see `useBulkActionGuard`).
  const onSelectMatching = useCallback(
    (mode: Exclude<AutomationDashboardBulkSelectAction, 'none'>) => {
      const isRunningAction = startBulkAction();
      const search = searchValue;
      // The loaded options are the server's matches for the search.
      void loadAll().then((loadedOptions) => {
        if (!isRunningAction() || !loadedOptions) return;
        const matching = loadedOptions.map((option) => option.value);
        // Nothing matches: keep the selection instead of clearing it.
        if (matching.length === 0) return;
        onSelect(
          (currentValues) => selectionWithMatching(mode, matching, currentValues),
          // "All matching" is the selection made by selecting the matches, not by removing them.
          mode === 'deselectMatching' ? undefined : { values: matching, search }
        );
      });
    },
    [loadAll, onSelect, searchValue, startBulkAction]
  );

  const footerError = error ?? bulkError ?? loadMoreError;

  return (
    <AutomationDashboardMultiSelect
      id={props.id}
      placeholder={props.placeholder}
      label={props.label}
      options={options}
      values={values}
      onSelect={onSelect}
      onSelectMatching={onSelectMatching}
      allSelectedSearch={props.allSelectedSearch}
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
 * Tracks the running bulk action and returns the function that starts one. The bulk action is
 * cancelled (with `cancelBulk`) when the selection changes meanwhile (a removed chip) or the
 * filters are replaced (`resetKey`: "Clear all filters", a saved report, also when they leave
 * this selection unchanged), as the user's latest change wins over the action that is still
 * loading. The started function tells whether the action is still the running one; each action
 * is its own object, so a cancelled action that resolves late cannot touch a newer one.
 */
function useBulkActionGuard(
  values: string[] | undefined,
  resetKey: number | undefined,
  cancelBulk: () => void
) {
  const bulkActionRef = useRef<{ startValues: string[]; startResetKey?: number }>();
  useEffect(() => {
    const action = bulkActionRef.current;
    if (
      !action ||
      (action.startResetKey === resetKey && hasSameValues(values, action.startValues))
    ) {
      return;
    }
    bulkActionRef.current = undefined;
    cancelBulk();
  }, [cancelBulk, values, resetKey]);
  return useCallback(() => {
    const action = { startValues: values ?? [], startResetKey: resetKey };
    bulkActionRef.current = action;
    return () => {
      if (bulkActionRef.current !== action) return false;
      bulkActionRef.current = undefined;
      return true;
    };
  }, [values, resetKey]);
}

/**
 * The selection after a bulk action on the options matching the search: "all" selects exactly
 * them, "selectMatching" adds them and "deselectMatching" removes them, keeping the rest.
 */
function selectionWithMatching(
  mode: Exclude<AutomationDashboardBulkSelectAction, 'none'>,
  matching: string[],
  currentValues: string[] = []
) {
  if (mode === 'all') return matching;
  if (mode === 'deselectMatching') {
    const matchingSet = new Set(matching);
    return currentValues.filter((value) => !matchingSet.has(value));
  }
  const current = new Set(currentValues);
  return [...currentValues, ...matching.filter((value) => !current.has(value))];
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

/** Whether both selections contain the same values (no selection counts as empty). */
function hasSameValues(values: string[] | undefined, otherValues: string[]) {
  if ((values?.length ?? 0) !== otherValues.length) return false;
  const other = new Set(otherValues);
  return (values ?? []).every((value) => other.has(value));
}

import {
  IFilterState,
  IToolbarDateRangeFilter,
  ToolbarFilterType,
} from '@ansible/ansible-ui-framework';
import { PageSelectOption } from '@ansible/ansible-ui-framework/PageInputs/PageSelectOption';
import { PageSingleSelect } from '@ansible/ansible-ui-framework/PageInputs/PageSingleSelect';
import { PageToolbarToggleGroup } from '@ansible/ansible-ui-framework/PageToolbar/PageToolbarToggleGroup';
import { Flex, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { AutomationDashboardAsyncFilter } from '../common/useAutomationDashboardAsyncOptions';
import {
  AllSelectedScope,
  allSelectedKey,
  getAllSelectedSearch,
  removeFilter,
  removeFilterValue,
  selectFilterValues,
} from '../utils/filterStateUpdates';
import { AutomationDashboardAsyncMultiSelectFilter } from './AutomationDashboardAsyncMultiSelectFilter';
import { AutomationDashboardPeriodFilter } from './AutomationDashboardPeriodFilter';
import { DashboardToolbarFilterLabels } from './DashboardToolbarFilterLabels';
import { useKeepFocusWhileDisabled } from '../common/useKeepFocusWhileDisabled';

/** The ids of the filter selector's toggle and of the selected filter's input (its toggle). */
const FILTER_SELECTOR_ID = 'filter';
const FILTER_INPUT_ID = 'filter-input';

export interface DashboardToolbarFiltersProps {
  /** The filters selectable in the filter group. */
  toolbarFilters?: AutomationDashboardAsyncFilter[];
  /** The period filter, rendered by the dashboard-local period control. */
  periodFilter?: IToolbarDateRangeFilter;
  filterState: IFilterState;
  setFilterState: Dispatch<SetStateAction<IFilterState>>;
  /**
   * Changes when the filter state is replaced as a whole ("Clear all filters", a saved report);
   * cancels a running bulk action of the filter select.
   */
  filterResetCount?: number;
}

/**
 * Whether the filter can be rendered by the dashboard async multi-select. The types allow only
 * those filters; this also skips another filter passed without its type (e.g. through a cast),
 * which has no `queryOptions` and would throw when its select opens.
 */
function isAsyncMultiSelectFilter(filter: AutomationDashboardAsyncFilter) {
  return (
    (filter.type as ToolbarFilterType) === ToolbarFilterType.AsyncMultiSelect &&
    typeof filter.queryOptions === 'function'
  );
}

/**
 * Dashboard version of the framework `PageToolbarFilters`: the filter group, the period control
 * and the filter chips share one toggle group, so below the `md` breakpoint they all collapse
 * behind the filter toggle.
 */
export function DashboardToolbarFilters(props: Readonly<DashboardToolbarFiltersProps>) {
  const { periodFilter, filterState, setFilterState } = props;
  const { t } = useTranslation();
  const filters = (props.toolbarFilters ?? []).filter(isAsyncMultiSelectFilter);
  const [firstFilter] = filters;
  // The chips show the labels of the options the select loaded; other values (e.g. restored
  // after a reload) query their label with `queryLabel`. Options loaded again update their
  // label (e.g. a renamed one); the labels of options that are not loaded again stay until the
  // page is reloaded, so the chips never query labels the select already loaded.
  // The labels are kept in maps that are updated in place, re-rendering the chips on a change:
  // copying a filter's labels for every loaded page would be quadratic with many options. The
  // chips are re-rendered only when a label of a selected value changed, not for every page
  // (a value selected later re-renders them with the filter state anyway).
  const knownLabelsRef = useRef(new Map<string, Map<string, string>>());
  const [, rerenderChips] = useReducer((count: number) => count + 1, 0);
  const filterStateRef = useRef(filterState);
  filterStateRef.current = filterState;
  const getSelectedSet = useSelectedSetCache();
  const addKnownLabels = useCallback(
    (key: string, options: PageSelectOption<string>[]) => {
      let labels = knownLabelsRef.current.get(key);
      if (!labels) {
        labels = new Map();
        knownLabelsRef.current.set(key, labels);
      }
      const selected = getSelectedSet(filterStateRef.current[key]);
      let hasSelectedLabelChanged = false;
      for (const option of options) {
        if (labels.get(option.value) === option.label) continue;
        labels.set(option.value, option.label);
        hasSelectedLabelChanged ||= selected.has(option.value);
      }
      if (hasSelectedLabelChanged) rerenderChips();
    },
    [getSelectedSet]
  );

  if (filters.length === 0 && !periodFilter) return null;

  return (
    <PageToolbarToggleGroup
      toggleIcon={<FilterIcon />}
      breakpoint="md"
      id="filters"
      data-testid="automation-dashboard-filters"
      // PatternFly breakpoint utilities: between `md` and `lg` the group spans the toolbar and
      // wraps, so the period (full width there) gets its own row; from `lg` up it is auto again.
      className="pf-m-wrap pf-v6-u-w-100-on-md pf-v6-u-w-auto-on-lg"
      style={{ minWidth: 0, maxWidth: '100%', alignItems: 'stretch' }}
    >
      {/* Only shown in the collapsed (below `md`) filter panel. The PatternFly utility class is
          used because the toggle group sets `display` on its items, which overrides the
          ToolbarItem `visibility` prop. */}
      <ToolbarItem variant="label" className="pf-v6-u-hidden-on-md">
        {t('Filter')}
      </ToolbarItem>
      {firstFilter && (
        <FilterGroup
          filters={filters}
          defaultFilter={firstFilter}
          filterState={filterState}
          setFilterState={setFilterState}
          filterResetCount={props.filterResetCount}
          onOptionsLoaded={addKnownLabels}
        />
      )}
      {periodFilter && (
        <AutomationDashboardPeriodFilter
          filter={periodFilter}
          filterState={filterState}
          setFilterState={setFilterState}
        />
      )}
      {filters.map((filter) => (
        // Only the chips; the inputs are rendered above.
        <DashboardToolbarFilterLabels
          key={filter.key}
          categoryKey={filter.key}
          categoryName={filter.label}
          labels={(filterState[filter.key] ?? []).map((value) => ({
            key: value,
            // An empty label (an option without a name) falls back to queryLabel.
            node: knownLabelsRef.current.get(filter.key)?.get(value) || filter.queryLabel(value),
          }))}
          onDelete={(value) => setFilterState((prev) => removeFilterValue(prev, filter.key, value))}
          onDeleteAll={() => setFilterState((prev) => removeFilter(prev, filter.key))}
        />
      ))}
    </PageToolbarToggleGroup>
  );
}

/**
 * Returns the selected values as a set, built again only when the selection (array) changes, so
 * checking every loaded page against a large selection does not rebuild it each time.
 */
function useSelectedSetCache() {
  const cacheRef = useRef<{ values?: string[]; set: Set<string> }>({ set: new Set() });
  return useCallback((values: string[] | undefined) => {
    if (cacheRef.current.values !== values) cacheRef.current = { values, set: new Set(values) };
    return cacheRef.current.set;
  }, []);
}

/** The filter selector plus the input of the selected filter (a single filter shows its label instead). */
function FilterGroup(
  props: Readonly<{
    filters: AutomationDashboardAsyncFilter[];
    /** The filter shown until another one is selected. */
    defaultFilter: AutomationDashboardAsyncFilter;
    filterState: IFilterState;
    setFilterState: Dispatch<SetStateAction<IFilterState>>;
    filterResetCount?: number;
    /** Called with the options the selected filter loaded. */
    onOptionsLoaded: (key: string, options: PageSelectOption<string>[]) => void;
  }>
) {
  const { filters, defaultFilter, filterState, setFilterState, onOptionsLoaded } = props;
  const { t } = useTranslation();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  // Another filter remounts the input, which would abort a running bulk action.
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  // The filter selector is disabled meanwhile: its focus is kept on the filter input's toggle.
  useKeepFocusWhileDisabled(isBulkLoading, FILTER_SELECTOR_ID, FILTER_INPUT_ID);
  const selectedFilter = filters.find((filter) => filter.key === selectedKey) ?? defaultFilter;
  const filterKey = selectedFilter.key;
  // Stable, so the select's callbacks that depend on it (e.g. the bulk actions) are too.
  const onSelect = useCallback(
    (
      setter: (values: string[] | undefined) => string[] | undefined,
      allSelected?: AllSelectedScope
    ) => setFilterState((prev) => selectFilterValues(prev, filterKey, setter, allSelected)),
    [setFilterState, filterKey]
  );
  // Kept in the filter state, so "All selected" / "All N matching" outlives the select (another
  // filter, a reload, a saved report). Memoized: it hashes the whole selection.
  const values = filterState[filterKey];
  const allSelectedMark = filterState[allSelectedKey(filterKey)];
  const allSelectedSearch = useMemo(
    () => getAllSelectedSearch(values, allSelectedMark),
    [values, allSelectedMark]
  );
  const onSelectedOptionsLoaded = useCallback(
    (options: PageSelectOption<string>[]) => onOptionsLoaded(filterKey, options),
    [onOptionsLoaded, filterKey]
  );

  const input = (
    <AutomationDashboardAsyncMultiSelectFilter
      key={selectedFilter.key}
      id={FILTER_INPUT_ID}
      values={values}
      onSelect={onSelect}
      allSelectedSearch={allSelectedSearch}
      placeholder={selectedFilter.placeholder ?? ''}
      label={selectedFilter.label}
      queryOptions={selectedFilter.queryOptions}
      queryErrorText={selectedFilter.queryErrorText}
      onOptionsLoaded={onSelectedOptionsLoaded}
      onBulkLoadingChange={setIsBulkLoading}
      resetKey={props.filterResetCount}
    />
  );

  if (filters.length === 1) {
    return (
      <ToolbarItem>
        <Flex
          flexWrap={{ default: 'nowrap' }}
          alignItems={{ default: 'alignItemsCenter' }}
          gap={{ default: 'gapSm' }}
        >
          <span className="pf-v6-u-text-nowrap">{selectedFilter.label}</span>
          {input}
        </Flex>
      </ToolbarItem>
    );
  }

  return (
    <ToolbarGroup variant="filter-group">
      <ToolbarItem>
        <PageSingleSelect
          id={FILTER_SELECTOR_ID}
          value={selectedFilter.key}
          onSelect={setSelectedKey}
          icon={<FilterIcon />}
          options={filters.map((filter) => ({ label: filter.label, value: filter.key }))}
          placeholder=""
          disableSortOptions
          isRequired
          disableMaxDropdownWidth
          isDisabled={
            isBulkLoading
              ? t('The filter can be changed once the selection is updated.')
              : undefined
          }
        />
      </ToolbarItem>
      <ToolbarItem>{input}</ToolbarItem>
    </ToolbarGroup>
  );
}

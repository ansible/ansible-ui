import {
  IFilterState,
  IToolbarAsyncMultiSelectFilter,
  IToolbarDateRangeFilter,
  IToolbarFilter,
  ToolbarFilterType,
} from '@ansible/ansible-ui-framework';
import { PageAsyncMultiSelect } from '@ansible/ansible-ui-framework/PageInputs/PageAsyncMultiSelect';
import { PageSingleSelect } from '@ansible/ansible-ui-framework/PageInputs/PageSingleSelect';
import { PageToolbarToggleGroup } from '@ansible/ansible-ui-framework/PageToolbar/PageToolbarToggleGroup';
import { Flex, ToolbarFilter, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getToolbarLabelValue, removeFilter, removeFilterValue } from '../utils/filterStateUpdates';
import { AutomationDashboardPeriodFilter } from './AutomationDashboardPeriodFilter';

export interface DashboardToolbarFiltersProps {
  /** Filters selectable in the filter group; only async multi-select filters are rendered. */
  toolbarFilters?: IToolbarFilter[];
  /** The period filter, rendered by the dashboard-local period control. */
  periodFilter?: IToolbarDateRangeFilter;
  filterState: IFilterState;
  setFilterState: Dispatch<SetStateAction<IFilterState>>;
}

function isAsyncMultiSelectFilter(
  filter: IToolbarFilter
): filter is IToolbarAsyncMultiSelectFilter {
  return filter.type === ToolbarFilterType.AsyncMultiSelect;
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
      style={{ minWidth: 0, maxWidth: '100%' }}
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
        <ToolbarFilter
          key={filter.key}
          categoryName={filter.label}
          labels={(filterState[filter.key] ?? []).map((value) => ({
            key: value,
            node: filter.queryLabel(value),
          }))}
          deleteLabel={(_category, label) => {
            const value = getToolbarLabelValue(label);
            setFilterState((prev) => removeFilterValue(prev, filter.key, value));
          }}
          deleteLabelGroup={() => setFilterState((prev) => removeFilter(prev, filter.key))}
          // Only used for the chips; the inputs are rendered above.
          showToolbarItem={false}
        >
          <></>
        </ToolbarFilter>
      ))}
    </PageToolbarToggleGroup>
  );
}

/** The filter selector plus the input of the selected filter (a single filter shows its label instead). */
function FilterGroup(
  props: Readonly<{
    filters: IToolbarAsyncMultiSelectFilter[];
    /** The filter shown until another one is selected. */
    defaultFilter: IToolbarAsyncMultiSelectFilter;
    filterState: IFilterState;
    setFilterState: Dispatch<SetStateAction<IFilterState>>;
  }>
) {
  const { filters, defaultFilter, filterState, setFilterState } = props;
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const selectedFilter = filters.find((filter) => filter.key === selectedKey) ?? defaultFilter;

  const input = (
    <PageAsyncMultiSelect<string>
      key={selectedFilter.key}
      id="filter-input"
      values={filterState[selectedFilter.key]}
      onSelect={(setter) =>
        setFilterState((prev) => ({
          ...prev,
          [selectedFilter.key]: setter(prev[selectedFilter.key] ?? []),
        }))
      }
      placeholder={selectedFilter.placeholder ?? ''}
      queryOptions={selectedFilter.queryOptions}
      queryErrorText={selectedFilter.queryErrorText}
      queryPlaceholder={selectedFilter.queryPlaceholder}
      queryLabel={selectedFilter.queryLabel}
      disableSortOptions={selectedFilter.disableSortOptions}
      disableMaxDropdownWidth
      // As in the framework filters: the toggle shows "N selected"; the values are the chips.
      variant="count"
      disableClearSelection
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
          id="filter"
          value={selectedFilter.key}
          onSelect={setSelectedKey}
          icon={<FilterIcon />}
          options={filters.map((filter) => ({ label: filter.label, value: filter.key }))}
          placeholder=""
          disableSortOptions
          isRequired
          disableMaxDropdownWidth
        />
      </ToolbarItem>
      <ToolbarItem>{input}</ToolbarItem>
    </ToolbarGroup>
  );
}

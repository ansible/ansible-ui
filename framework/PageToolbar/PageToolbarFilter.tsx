import { Button, ToolbarFilter, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { PageAsyncMultiSelect } from '../PageInputs/PageAsyncMultiSelect';
import { PageAsyncSingleSelect } from '../PageInputs/PageAsyncSingleSelect';
import { PageMultiSelect } from '../PageInputs/PageMultiSelect';
import { PageSingleSelect, PageSingleSelectContext } from '../PageInputs/PageSingleSelect';
import { useBreakpoint } from '../components/useBreakPoint';
import { useFrameworkTranslations } from '../useFrameworkTranslations';
import { IToolbarAsyncMultiSelectFilter } from './PageToolbarFilters/ToolbarAsyncMultiSelectFilter';
import { IToolbarAsyncSingleSelectFilter } from './PageToolbarFilters/ToolbarAsyncSingleSelectFilter';
import {
  IToolbarDateRangeFilter,
  ToolbarDateRangeFilter,
} from './PageToolbarFilters/ToolbarDateRangeFilter';
import { IToolbarMultiSelectFilter } from './PageToolbarFilters/ToolbarMultiSelectFilter';
import { IToolbarSingleSelectFilter } from './PageToolbarFilters/ToolbarSingleSelectFilter';
import {
  IToolbarMultiTextFilter,
  IToolbarSingleTextFilter,
  ToolbarSingleTextFilter,
  ToolbarTextMultiFilter,
} from './PageToolbarFilters/ToolbarTextFilter';
import { PageToolbarToggleGroup } from './PageToolbarToggleGroup';

/** Represents the types of filters that can be used in the toolbar */
export enum ToolbarFilterType {
  SingleText,
  MultiText,
  SingleSelect,
  MultiSelect,
  DateRange,
  AsyncSingleSelect,
  AsyncMultiSelect,
}

/** An IToolbarFilter represents a filter that can be used in the toolbar */
export type IToolbarFilter =
  | IToolbarSingleTextFilter
  | IToolbarMultiTextFilter
  | IToolbarDateRangeFilter
  | IToolbarSingleSelectFilter
  | IToolbarMultiSelectFilter
  | IToolbarAsyncSingleSelectFilter
  | IToolbarAsyncMultiSelectFilter;

/** Represents the state of the toolbar filters. i.e. What is currently selected for filters. */
export type IFilterState = Record<string, string[] | undefined>;

/** The props for the PageToolbarFilters component */
export type PageToolbarFiltersProps = {
  toolbarFilters?: IToolbarFilter[];
  filterState: IFilterState;
  setFilterState: Dispatch<SetStateAction<IFilterState>>;

  /**
   * Limits the filters so that only one filter can be set to an OR operation.
   *
   * Example: AWX can either have an OR on type or status but not both.
   * So once one has 2 selections, the other becomes a single select.
   */
  limitFiltersToOneOrOperation?: boolean;
};

/** A ToolbarItem that renders the toolbar filters passed in as props */
function FiltersToolbarItem(props: PageToolbarFiltersProps) {
  const { toolbarFilters, filterState, setFilterState } = props;

  const [selectedFilterKey, setSeletedFilterKey] = useState<string | null>(() =>
    toolbarFilters ? (toolbarFilters?.length > 0 ? toolbarFilters[0].key : '') : ''
  );

  const selectedFilter = toolbarFilters?.find((filter) => filter.key === selectedFilterKey);

  if (!selectedFilter) return <></>;
  if (!toolbarFilters) return <></>;
  if (toolbarFilters.length === 0) return <></>;

  let showLabel = toolbarFilters.length === 1;
  if (toolbarFilters.length >= 1) {
    if (
      toolbarFilters[0].type === ToolbarFilterType.SingleSelect &&
      toolbarFilters[0].isPinned &&
      (filterState[toolbarFilters[0].key] === undefined ||
        filterState[toolbarFilters[0].key]?.length === 0)
    ) {
      // Do not show the label if the pinned filter does not have a value
      showLabel = false;
    }
  }

  return (
    <>
      {toolbarFilters.length === 1 ? (
        <ToolbarItem>
          {showLabel && (
            <div style={{ marginTop: 6, marginRight: 6, whiteSpace: 'nowrap' }}>
              {toolbarFilters[0].label}
            </div>
          )}
          <ToolbarFilterComponent
            id="filter-input"
            filter={selectedFilter}
            filterState={filterState}
            setFilterState={setFilterState}
            data-cy={selectedFilter}
            limitFiltersToOneOrOperation={props.limitFiltersToOneOrOperation}
          />
        </ToolbarItem>
      ) : (
        <ToolbarItem>
          <PageSingleSelect
            id="filter"
            value={selectedFilterKey}
            onSelect={setSeletedFilterKey}
            icon={<FilterIcon />}
            options={toolbarFilters.map((filter) => ({
              label: filter.label,
              value: filter.key,
            }))}
            placeholder=""
            data-cy={selectedFilter}
            disableSortOptions
            isRequired
          />
          <ToolbarFilterComponent
            id="filter-input"
            filter={selectedFilter}
            filterState={filterState}
            setFilterState={setFilterState}
            data-cy={selectedFilter}
            limitFiltersToOneOrOperation={props.limitFiltersToOneOrOperation}
          />
        </ToolbarItem>
      )}
    </>
  );
}

/** A ToolbarToggleGroup that renders the toolbar filters passed in as props */
export function PageToolbarFilters(props: PageToolbarFiltersProps) {
  const { toolbarFilters, setFilterState, filterState } = props;

  const [translations] = useFrameworkTranslations();

  // When the screen is small, show the filter label in the expanded filter section
  const showFilterLabel = !useBreakpoint('md');

  if (!toolbarFilters) return <></>;
  if (toolbarFilters.length === 0) return <></>;

  // Grouped filters are filters that can be switched between using a filter selector
  const groupedFilters = toolbarFilters.filter((filter) => {
    return !filter.isPinned;
  });

  // Pinned filters are filters that are shown outside of the filter selector
  const pinnedFilters = toolbarFilters.filter((filter) => {
    return !!filter.isPinned;
  });

  return (
    <PageToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="md" id="filters">
      <ToolbarGroup variant="button-group" style={{ flexWrap: 'wrap', gap: 8 }}>
        {showFilterLabel && <ToolbarItem variant="label">{translations.filter}</ToolbarItem>}
        <FiltersToolbarItem
          toolbarFilters={groupedFilters}
          setFilterState={setFilterState}
          filterState={filterState}
          limitFiltersToOneOrOperation={props.limitFiltersToOneOrOperation}
        />
        {pinnedFilters?.map((filter) => (
          <FiltersToolbarItem
            key={filter.key}
            toolbarFilters={[filter]}
            setFilterState={setFilterState}
            filterState={filterState}
            limitFiltersToOneOrOperation={props.limitFiltersToOneOrOperation}
          />
        ))}

        {toolbarFilters?.map((filter) => {
          // Render the filter chips
          const values = filterState?.[filter.key] || [];

          // If the filter is pinned and is a single select filter, don't render the chip
          // this is because the value of the single select filter is already shown in the filter component
          if (filter.isPinned && filter.type === ToolbarFilterType.SingleSelect) return null;
          if (filter.isPinned && filter.type === ToolbarFilterType.DateRange) return null;

          return (
            <ToolbarFilter
              key={filter.label}
              categoryName={filter.label}
              chips={[
                ...values.map((value) => {
                  switch (filter.type) {
                    case ToolbarFilterType.SingleSelect:
                    case ToolbarFilterType.MultiSelect:
                    case ToolbarFilterType.DateRange:
                      return (
                        filter.options?.find((o) => {
                          return o.value === value;
                        })?.label ?? value
                      );
                    case ToolbarFilterType.AsyncSingleSelect:
                    case ToolbarFilterType.AsyncMultiSelect:
                      return { key: value, node: filter.queryLabel(value) };
                    default:
                      return value;
                  }
                }),
              ]}
              deleteChip={(_group, value) => {
                setFilterState?.((filters) => {
                  const newState = { ...filters };
                  value = typeof value === 'string' ? value : value.key;
                  switch (filter.type) {
                    case ToolbarFilterType.SingleSelect:
                    case ToolbarFilterType.MultiSelect:
                    case ToolbarFilterType.DateRange:
                      // The value is a label, we need to get the real value from the option
                      value = filter.options.find((o) => o.label === value)?.value ?? value;
                      break;
                  }
                  let values = filters[filter.key];
                  if (values) {
                    values = values.filter((v) => v !== value);
                    if (values.length === 0) {
                      delete newState[filter.key];
                    } else {
                      newState[filter.key] = values;
                    }
                  }
                  return newState;
                });
              }}
              deleteChipGroup={() => {
                setFilterState?.((filters) => {
                  const newState = { ...filters };
                  delete newState[filter.key];
                  return newState;
                });
              }}
              // We hide this item because this is only used for the filter chips
              showToolbarItem={false}
            >
              <></>
            </ToolbarFilter>
          );
        })}
      </ToolbarGroup>
    </PageToolbarToggleGroup>
  );
}

/** The ToolbarFilter component takes in a IToolbarFilter and renders the proper subcomponent for that filter type. */
function ToolbarFilterComponent(props: {
  id?: string;
  filter: IToolbarFilter;
  filterState: IFilterState;
  setFilterState: Dispatch<SetStateAction<IFilterState>>;
  limitFiltersToOneOrOperation?: boolean;
}): JSX.Element {
  const { filter, filterState, setFilterState } = props;

  const filterValues = filterState?.[filter.key];

  const setFilterValues = useCallback(
    (setter: (prevValues: string[] | undefined) => string[] | undefined) => {
      setFilterState((filters) => {
        const newFilters = { ...filters };
        const filterValues = newFilters[filter.key] ?? [];
        newFilters[filter.key] = setter(filterValues);
        return newFilters;
      });
    },
    [filter.key, setFilterState]
  );

  const addFilter = useCallback(
    (value: string) => {
      setFilterState((filters) => {
        const newFilters = { ...filters };
        const filterValues = newFilters[filter.key] ?? [];
        newFilters[filter.key] = [...filterValues, value];
        return newFilters;
      });
    },
    [filter.key, setFilterState]
  );

  let isHasOrFilter = false;
  if (filterState) {
    for (const key in filterState) {
      if (key === filter.key) continue;
      const filterValues = filterState[key];
      if (filterValues && filterValues?.length >= 2) {
        isHasOrFilter = true;
        break;
      }
    }
  }

  switch (filter.type) {
    case ToolbarFilterType.SingleText:
      return (
        <ToolbarSingleTextFilter
          key={filter.key}
          id={props.id ?? filter.key}
          placeholder={filter.placeholder}
          comparison={filter.comparison}
          setValue={(value) => setFilterValues(() => (value ? [value] : []))}
          value={filterValues && filterValues?.length > 0 ? filterValues[0] : ''}
          hasKey={!!filterState?.[filter.key]}
        />
      );

    case ToolbarFilterType.MultiText:
      if (isHasOrFilter && props.limitFiltersToOneOrOperation) {
        return (
          <ToolbarSingleTextFilter
            key={filter.key}
            id={props.id ?? filter.key}
            placeholder={filter.placeholder}
            comparison={filter.comparison}
            setValue={(value) => setFilterValues(() => (value ? [value] : []))}
            value={filterValues && filterValues?.length > 0 ? filterValues[0] : ''}
            hasKey={!!filterState?.[filter.key]}
          />
        );
      }
      return (
        <ToolbarTextMultiFilter
          key={filter.key}
          id={props.id ?? filter.key}
          addFilter={addFilter}
          placeholder={filter.placeholder}
          comparison={filter.comparison}
        />
      );

    case ToolbarFilterType.SingleSelect:
      return (
        <PageSingleSelect
          key={filter.key}
          id={props.id ?? filter.key}
          placeholder={filter.placeholder}
          value={filterValues && filterValues?.length > 0 ? filterValues[0] : ''}
          onSelect={(item) => setFilterValues(() => [item!])}
          options={filter.options}
          isRequired={filter.isRequired}
          disableSortOptions={filter.disableSortOptions}
        />
      );

    case ToolbarFilterType.AsyncSingleSelect:
      return (
        <PageAsyncSingleSelect<string>
          key={filter.key}
          id={props.id ?? filter.key}
          value={filterValues && filterValues?.length > 0 ? filterValues[0] : ''}
          onSelect={(item) => setFilterValues(() => [item!])}
          placeholder={filter.placeholder || ''}
          queryOptions={filter.queryOptions}
          queryErrorText={filter.queryErrorText}
          queryPlaceholder={filter.queryPlaceholder}
          isRequired={filter.isRequired}
          footer={
            filter.openBrowse ? (
              <PageSingleSelectContext.Consumer>
                {(context) => (
                  <Button
                    variant="link"
                    onClick={() => {
                      // close the menu before opening browse modal
                      context.setOpen(false);
                      filter.openBrowse?.(
                        (selection) => setFilterValues(() => [selection]),
                        filterValues && filterValues.length > 0 ? filterValues[0] : undefined
                      );
                    }}
                  >
                    Browse
                  </Button>
                )}
              </PageSingleSelectContext.Consumer>
            ) : undefined
          }
          queryLabel={filter.queryLabel}
          disableSortOptions={filter.disableSortOptions}
        />
      );

    case ToolbarFilterType.AsyncMultiSelect:
      if (isHasOrFilter && props.limitFiltersToOneOrOperation) {
        return (
          <PageAsyncSingleSelect<string>
            key={filter.key}
            id={props.id ?? filter.key}
            value={filterValues && filterValues?.length > 0 ? filterValues[0] : ''}
            onSelect={(item) => setFilterValues(() => [item!])}
            placeholder={filter.placeholder || ''}
            queryOptions={filter.queryOptions}
            queryErrorText={filter.queryErrorText}
            queryPlaceholder={filter.queryPlaceholder}
            isRequired={filter.isRequired}
            footer={
              filter.openBrowse ? (
                <Button
                  variant="link"
                  onClick={() => {
                    filter.openBrowse?.(
                      (selection) => setFilterValues(() => [selection.length ? selection[0] : '']),
                      filterValues && filterValues.length > 0 ? filterValues : undefined
                    );
                  }}
                >
                  Browse
                </Button>
              ) : undefined
            }
            queryLabel={filter.queryLabel}
            disableSortOptions={filter.disableSortOptions}
          />
        );
      }
      return (
        <PageAsyncMultiSelect<string>
          key={filter.key}
          id={props.id ?? filter.key}
          values={filterValues}
          onSelect={setFilterValues}
          placeholder={filter.placeholder || ''}
          queryOptions={filter.queryOptions}
          queryErrorText={filter.queryErrorText}
          queryPlaceholder={filter.queryPlaceholder}
          footer={
            filter.openBrowse ? (
              <Button
                variant="link"
                onClick={() => {
                  filter.openBrowse?.(
                    (selection) => setFilterValues(() => selection),
                    filterValues
                  );
                }}
              >
                Browse
              </Button>
            ) : undefined
          }
          variant="count"
          disableClearSelection
          queryLabel={filter.queryLabel}
          disableSortOptions={filter.disableSortOptions}
        />
      );

    case ToolbarFilterType.MultiSelect:
      if (isHasOrFilter && props.limitFiltersToOneOrOperation) {
        return (
          <PageSingleSelect
            key={filter.key}
            id={props.id ?? filter.key}
            placeholder={filter.placeholder}
            value={filterValues && filterValues?.length > 0 ? filterValues[0] : ''}
            onSelect={(item) => setFilterValues(() => [item!])}
            options={filter.options}
            disableSortOptions={filter.disableSortOptions}
          />
        );
      }
      return (
        <PageMultiSelect<string>
          key={filter.key}
          id={props.id ?? filter.key}
          placeholder={filter.placeholder}
          values={filterValues}
          onSelect={setFilterValues}
          options={filter.options}
          variant="count"
          disableClearSelection
          disableSortOptions={filter.disableSortOptions}
        />
      );

    case ToolbarFilterType.DateRange:
      return (
        <ToolbarDateRangeFilter
          key={filter.key}
          id={props.id ?? filter.key}
          label={filter.label}
          placeholder={filter.placeholder ?? ''}
          filterValues={filterValues}
          setFilterValues={setFilterValues}
          options={filter.options}
          isRequired={filter.isRequired}
          defaultValue={filter.defaultValue}
        />
      );
  }
}

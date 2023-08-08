import {
  SelectVariant,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
  Button,
} from '@patternfly/react-core';

import { FilterIcon } from '@patternfly/react-icons';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { PageSingleSelect } from '../../PageInputs/PageSingleSelect';
import { useBreakpoint } from '../../components/useBreakPoint';
import { useFrameworkTranslations } from '../../useFrameworkTranslations';
import {
  IToolbarDateRangeFilter,
  ToolbarDateRangeFilter,
} from './PageToolbarFilterTypes/ToolbarDateRangeFilter';
import {
  IToolbarMultiSelectFilter,
  IToolbarSingleSelectFilter,
  IToolbarAsyncMultiSelectFilter,
  IToolbarAsyncSingleSelectFilter,
  ToolbarSelectFilter,
  ToolbarAsyncSelectFilter,
} from './PageToolbarFilterTypes/ToolbarSelectFilter';
import { IToolbarTextFilter, ToolbarTextFilter } from './PageToolbarFilterTypes/ToolbarTextFilter';

/** Represents the types of filters that can be used in the toolbar */
export enum ToolbarFilterType {
  Text = 'text',
  SingleSelect = 'singleselect',
  MultiSelect = 'multiselect',
  DateRange = 'daterange',
  AsyncSingleSelect = 'asyncsingleselect',
  AsyncMultiSelect = 'asyncmultiselect',
}

/** An IToolbarFilter represents a filter that can be used in the toolbar */
export type IToolbarFilter =
  | IToolbarTextFilter
  | IToolbarSingleSelectFilter
  | IToolbarMultiSelectFilter
  | IToolbarDateRangeFilter
  | IToolbarAsyncMultiSelectFilter
  | IToolbarAsyncSingleSelectFilter;

/** Represents the state of the toolbar filters. i.e. What is currently selected for filters. */
export type IFilterState = Record<string, string[] | undefined>;

/** The props for the PageToolbarFilters component */
export type PageToolbarFiltersProps = {
  toolbarFilters?: IToolbarFilter[];
  filterState: IFilterState;
  setFilterState: Dispatch<SetStateAction<IFilterState>>;
};

/** A ToolbarItem that renders the toolbar filters passed in as props */
function FiltersToolbarItem(props: PageToolbarFiltersProps) {
  const { toolbarFilters, filterState, setFilterState } = props;

  const [selectedFilterKey, setSeletedFilterKey] = useState(() =>
    toolbarFilters ? (toolbarFilters?.length > 0 ? toolbarFilters[0].key : '') : ''
  );

  const selectedFilter = toolbarFilters?.find((filter) => filter.key === selectedFilterKey);

  if (!selectedFilter) return <></>;
  if (!toolbarFilters) return <></>;
  if (toolbarFilters.length === 0) return <></>;

  let showLabel = toolbarFilters.length === 1;
  if (toolbarFilters.length >= 1) {
    if (toolbarFilters[0].type === ToolbarFilterType.MultiSelect && toolbarFilters[0].isPinned) {
      // Do not show the label if the pinned filter is a multiselect
      showLabel = false;
    } else if (
      toolbarFilters[0].type === ToolbarFilterType.SingleSelect &&
      toolbarFilters[0].isPinned &&
      (filterState[toolbarFilters[0].key] == undefined ||
        filterState[toolbarFilters[0].key]?.length === 0)
    ) {
      // Do not show the label if the pinned filter does not have a value
      showLabel = false;
    }
  }

  return (
    <>
      {toolbarFilters.length === 1 ? (
        <>
          <ToolbarItem>
            {showLabel && (
              <div style={{ marginTop: 6, marginRight: 6, whiteSpace: 'nowrap' }}>
                {toolbarFilters[0].label}
              </div>
            )}
            <ToolbarFilterComponent
              id="filter-input"
              filter={selectedFilter}
              addFilter={(value: string) => {
                setFilterState?.((filters) => {
                  let values = filters?.[selectedFilterKey];
                  if (!values) values = [];
                  if (!values.includes(value)) values.push(value);
                  return { ...filters, [selectedFilterKey]: values };
                });
              }}
              removeFilter={(value: string) => {
                setFilterState?.((filters) => {
                  let values = filters?.[selectedFilterKey];
                  if (!values) values = [];
                  values = values.filter((v) => v !== value);
                  return { ...filters, [selectedFilterKey]: values };
                });
              }}
              setFilterState={setFilterState}
              values={filterState?.[selectedFilterKey] ?? []}
            />
          </ToolbarItem>
        </>
      ) : (
        <ToolbarItem>
          <PageSingleSelect
            id="filter"
            value={selectedFilterKey}
            onSelect={setSeletedFilterKey}
            icon={<FilterIcon />}
            options={toolbarFilters.map((filter) => ({
              label: filter.label,
              // description: filter.description,
              value: filter.key,
            }))}
            placeholder=""
          />
          <ToolbarFilterComponent
            id="filter-input"
            filter={selectedFilter}
            addFilter={(value: string) => {
              setFilterState?.((filters) => {
                let values = filters?.[selectedFilterKey];
                if (!values) values = [];
                if (!values.includes(value)) values.push(value);
                return { ...filters, [selectedFilterKey]: values };
              });
            }}
            removeFilter={(value: string) => {
              setFilterState?.((filters) => {
                let values = filters?.[selectedFilterKey];
                if (!values) values = [];
                values = values.filter((v) => v !== value);
                return { ...filters, [selectedFilterKey]: values };
              });
            }}
            setFilterState={setFilterState}
            values={filterState?.[selectedFilterKey] ?? []}
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
    <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="md">
      <ToolbarGroup variant="filter-group" style={{ flexWrap: 'wrap', gap: 16 }}>
        {showFilterLabel && <ToolbarItem variant="label">{translations.filter}</ToolbarItem>}
        <FiltersToolbarItem
          toolbarFilters={groupedFilters}
          setFilterState={setFilterState}
          filterState={filterState}
        />
        {pinnedFilters?.map((filter) => (
          <FiltersToolbarItem
            key={filter.key}
            toolbarFilters={[filter]}
            setFilterState={setFilterState}
            filterState={filterState}
          />
        ))}

        {toolbarFilters?.map((filter) => {
          // Render the filter chips
          const values = filterState?.[filter.key] || [];

          // If the filter is pinned and is a single select filter, don't render the chip
          // this is because the value of the single select filter is already shown in the filter component
          if (filter.isPinned && filter.type === ToolbarFilterType.SingleSelect) return <></>;
          if (filter.isPinned && filter.type === ToolbarFilterType.DateRange) return <></>;

          return (
            <ToolbarFilter
              key={filter.label}
              categoryName={filter.label}
              chips={values.map((value) => {
                return 'options' in filter
                  ? filter.options.find((o) => o.value === value)?.label ?? value
                  : value;
              })}
              deleteChip={(_group, value) => {
                setFilterState?.((filters) => {
                  const newState = { ...filters };
                  value = typeof value === 'string' ? value : value.key;
                  if ('options' in filter) {
                    value = filter.options.find((o) => o.label === value)?.value ?? value;
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
    </ToolbarToggleGroup>
  );
}

/** The ToolbarFilter component takes in a IToolbarFilter and renders the proper subcomponent for that filter type. */
function ToolbarFilterComponent(props: {
  id?: string;
  filter: IToolbarFilter;
  values: string[];
  addFilter: (value: string) => void;
  removeFilter: (value: string) => void;
  setFilterState: Dispatch<SetStateAction<IFilterState>>;
}): JSX.Element {
  const { filter, values, addFilter, removeFilter, setFilterState } = props;
  const setValues = useCallback(
    (values: string[]) => {
      setFilterState((filters) => {
        return { ...filters, [filter.key]: values };
      });
    },
    [filter.key, setFilterState]
  );

  switch (filter.type) {
    case ToolbarFilterType.Text:
      return (
        <ToolbarTextFilter
          id={props.id ?? filter.key}
          addFilter={addFilter}
          placeholder={filter.placeholder}
          comparison={filter.comparison}
        />
      );

    case ToolbarFilterType.AsyncSingleSelect:
      return (
        <ToolbarAsyncSelectFilter
          id={props.id ?? filter.key}
          values={values}
          addFilter={addFilter}
          removeFilter={removeFilter}
          options={filter.options}
          placeholder={filter.placeholder}
          variant={SelectVariant.typeahead}
          hasSearch={filter.hasSearch}
          label={filter.isPinned ? filter.label : undefined} // when a multi select filter is pinned, we want to show the label in the select
          openAsyncSelector={() => {
            filter.openSelectDialog((selection) => {
              // remove existing values
              for (const val of values) {
                removeFilter(val);
              }
              const key = filter.selectionToString(selection);
              addFilter(key);
            }, filter.defaultSelection);
          }}
        />
      );

    case ToolbarFilterType.AsyncMultiSelect:
      return (
        <ToolbarAsyncSelectFilter
          id={props.id ?? filter.key}
          values={values}
          addFilter={addFilter}
          removeFilter={removeFilter}
          options={filter.options}
          placeholder={filter.placeholder}
          variant={SelectVariant.typeaheadMulti}
          hasSearch={filter.hasSearch}
          label={filter.isPinned ? filter.label : undefined} // when a multi select filter is pinned, we want to show the label in the select
          openAsyncSelector={() => {
            filter.openSelectDialog((selections) => {
              // remove existing values
              for (const val of values) {
                removeFilter(val);
              }

              for (const selection of selections) {
                const key = filter.selectionToString(selection);
                addFilter(key);
              }
            }, filter.defaultSelection);
          }}
        />
      );

    case ToolbarFilterType.SingleSelect:
      return (
        <ToolbarSelectFilter
          id={props.id ?? filter.key}
          values={values}
          addFilter={addFilter}
          removeFilter={removeFilter}
          options={filter.options}
          placeholder={filter.placeholder}
          variant={SelectVariant.single}
          hasSearch={filter.hasSearch}
          onSearchTextChange={filter.onSearchTextChange}
          hasClear={filter.isPinned}
          isRequired={filter.isRequired}
          defaultValue={filter.defaultValue}
        />
      );

    case ToolbarFilterType.MultiSelect:
      return (
        <ToolbarSelectFilter
          id={props.id ?? filter.key}
          values={values}
          addFilter={addFilter}
          removeFilter={removeFilter}
          options={filter.options}
          placeholder={filter.placeholder}
          variant={SelectVariant.checkbox}
          hasSearch={filter.hasSearch}
          onSearchTextChange={filter.onSearchTextChange}
          label={filter.isPinned ? filter.label : undefined} // when a multi select filter is pinned, we want to show the label in the select
        />
      );

    case ToolbarFilterType.DateRange:
      return (
        <ToolbarDateRangeFilter
          id={props.id ?? filter.key}
          label={filter.label}
          placeholder={filter.placeholder ?? ''}
          values={values}
          setValues={setValues}
          options={filter.options}
          isRequired={filter.isRequired}
          defaultValue={filter.defaultValue}
        />
      );
  }
}

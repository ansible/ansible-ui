import {
  InputGroup,
  InputGroupText,
  SelectOption,
  SelectVariant,
  Split,
  SplitItem,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import { Dispatch, SetStateAction, useState } from 'react';
import { FormGroupSelect } from '../../PageForm/Inputs/FormGroupSelect';
import { useBreakpoint } from '../../components/useBreakPoint';
import { useFrameworkTranslations } from '../../useFrameworkTranslations';
import {
  IToolbarDateRangeFilter,
  ToolbarDateRangeFilter,
} from './PageToolbarFilterTypes/ToolbarDateRangeFilter';
import {
  IToolbarMultiSelectFilter,
  IToolbarSingleSelectFilter,
  ToolbarSelectFilter,
} from './PageToolbarFilterTypes/ToolbarSelectFilter';
import { IToolbarTextFilter, ToolbarTextFilter } from './PageToolbarFilterTypes/ToolbarTextFilter';

/** Represents the types of filters that can be used in the toolbar */
export enum ToolbarFilterType {
  Text = 'text',
  SingleSelect = 'singleselect',
  MultiSelect = 'multiselect',
  DateRange = 'daterange',
}

/** An IToolbarFilter represents a filter that can be used in the toolbar */
export type IToolbarFilter =
  | IToolbarTextFilter
  | IToolbarSingleSelectFilter
  | IToolbarMultiSelectFilter
  | IToolbarDateRangeFilter;

/** Represents the state of the toolbar filters. i.e. What is currently selected for filters. */
export type IFilterState = Record<string, string[]>;

/** The props for the PageToolbarFilters component */
export type PageToolbarFiltersProps = {
  toolbarFilters?: IToolbarFilter[];
  filterState: IFilterState;
  setFilterState?: Dispatch<SetStateAction<IFilterState>>;
};

/** A ToolbarItem that renders the toolbar filters passed in as props */
function FiltersToolbarItem(props: PageToolbarFiltersProps) {
  const { toolbarFilters, filterState: filters, setFilterState: setFilters } = props;

  const [selectedFilterKey, setSeletedFilterKey] = useState(() =>
    toolbarFilters ? (toolbarFilters?.length > 0 ? toolbarFilters[0].key : '') : ''
  );

  const selectedFilter = toolbarFilters?.find((filter) => filter.key === selectedFilterKey);

  if (!selectedFilter) return <></>;
  if (!toolbarFilters) return <></>;
  if (toolbarFilters.length === 0) return <></>;

  let showLabel = toolbarFilters.length === 1;
  if (toolbarFilters[0].type === ToolbarFilterType.MultiSelect && toolbarFilters[0].isPinned) {
    // Do not show the label if the pinned filter is a multiselect
    showLabel = false;
  } else if (
    toolbarFilters[0].type === ToolbarFilterType.SingleSelect &&
    toolbarFilters[0].isPinned &&
    (filters[toolbarFilters[0].key] == undefined || filters[toolbarFilters[0].key].length === 0)
  ) {
    // Do not show the label if the pinned filter does not have a value
    showLabel = false;
  }

  return (
    <ToolbarItem>
      <Split style={{ zIndex: 400 }}>
        <SplitItem>
          <InputGroup>
            {toolbarFilters.length === 1 ? (
              <>
                {showLabel && (
                  <InputGroupText style={{ border: 0, padding: '6px 6px', color: 'inherit' }}>
                    {toolbarFilters[0].label}
                  </InputGroupText>
                )}
              </>
            ) : (
              <FormGroupSelect
                id="filter"
                onSelect={(_, v) => setSeletedFilterKey(v.toString())}
                value={selectedFilterKey}
                placeholderText=""
                selectedIcon={<FilterIcon />}
              >
                {toolbarFilters.map((filter) => (
                  <SelectOption key={filter.key} value={filter.key}>
                    {filter.label}
                  </SelectOption>
                ))}
              </FormGroupSelect>
            )}
          </InputGroup>
        </SplitItem>
        <SplitItem isFilled>
          <ToolbarFilterComponent
            id="filter-input"
            filter={selectedFilter}
            addFilter={(value: string) => {
              setFilters?.((filters) => {
                let values = filters?.[selectedFilterKey];
                if (!values) values = [];
                if (!values.includes(value)) values.push(value);
                return { ...filters, [selectedFilterKey]: values };
              });
            }}
            removeFilter={(value: string) => {
              setFilters?.((filters) => {
                let values = filters?.[selectedFilterKey];
                if (!values) values = [];
                values = values.filter((v) => v !== value);
                return { ...filters, [selectedFilterKey]: values };
              });
            }}
            values={filters?.[selectedFilterKey] ?? []}
          />
        </SplitItem>
      </Split>
    </ToolbarItem>
  );
}

/** A ToolbarToggleGroup that renders the toolbar filters passed in as props */
export function PageToolbarFilters(props: PageToolbarFiltersProps) {
  const { toolbarFilters, setFilterState: setFilters, filterState: filterState } = props;

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
          setFilterState={setFilters}
          filterState={filterState}
        />
        {pinnedFilters?.map((filter) => (
          <FiltersToolbarItem
            key={filter.key}
            toolbarFilters={[filter]}
            setFilterState={setFilters}
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
                setFilters?.((filters) => {
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
                setFilters?.((filters) => {
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
}): JSX.Element {
  const { filter, values, addFilter, removeFilter } = props;
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
          placeholder={filter.placeholder}
          value={values.length > 0 ? values[0] : ''}
          setValue={(value) => {
            for (const value of values) {
              removeFilter(value);
            }
            addFilter(value);
          }}
          options={filter.options}
          isRequired={filter.isRequired}
          defaultValue={filter.defaultValue}
        />
      );
  }
}

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
import { IToolbarDateFilter } from './PageToolbarFilterTypes/ToolbarDateFilter';
import {
  IToolbarMultiSelectFilter,
  IToolbarSingleSelectFilter,
  ToolbarSelectFilter,
} from './PageToolbarFilterTypes/ToolbarSelectFilter';
import { IToolbarTextFilter, ToolbarTextFilter } from './PageToolbarFilterTypes/ToolbarTextFilter';

export enum ToolbarFilterType {
  Text = 'text',
  SingleSelect = 'singleselect',
  MultiSelect = 'multiselect',
  Date = 'date',
}

export type IToolbarFilter =
  | IToolbarTextFilter
  | IToolbarSingleSelectFilter
  | IToolbarMultiSelectFilter
  | IToolbarDateFilter;

export type IFilterState = Record<string, string[] | undefined>;

export type PageToolbarFiltersProps = {
  toolbarFilters?: IToolbarFilter[];
  filters?: Record<string, string[]>;
  setFilters?: Dispatch<SetStateAction<Record<string, string[]>>>;
};

function ToolbarContent(props: PageToolbarFiltersProps) {
  const { toolbarFilters, filters, setFilters } = props;

  const [selectedFilter, setSeletedFilter] = useState(() =>
    toolbarFilters ? (toolbarFilters?.length > 0 ? toolbarFilters[0].key : '') : ''
  );

  if (!toolbarFilters) return <></>;
  if (toolbarFilters.length === 0) return <></>;
  return (
    <>
      <ToolbarItem>
        <Split style={{ zIndex: 400 }}>
          <SplitItem>
            <InputGroup>
              {toolbarFilters.length === 1 ? (
                <>
                  {toolbarFilters[0].type === ToolbarFilterType.MultiSelect &&
                  toolbarFilters[0].isPinned ? (
                    <></> // When a multi-select filter is pinned, it's label is shown in the select dropdown
                  ) : (
                    <InputGroupText style={{ border: 0, padding: '6px 6px', color: 'inherit' }}>
                      {toolbarFilters[0].label}
                    </InputGroupText>
                  )}
                </>
              ) : (
                <FormGroupSelect
                  id="filter"
                  onSelect={(_, v) => setSeletedFilter(v.toString())}
                  value={selectedFilter}
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
            <ToolbarFilterInput
              id="filter-input"
              filter={toolbarFilters.find((filter) => filter.key === selectedFilter)}
              addFilter={(value: string) => {
                setFilters?.((filters) => {
                  let values = filters?.[selectedFilter];
                  if (!values) values = [];
                  if (!values.includes(value)) values.push(value);
                  return { ...filters, [selectedFilter]: values };
                });
              }}
              removeFilter={(value: string) => {
                setFilters?.((filters) => {
                  let values = filters?.[selectedFilter];
                  if (!values) values = [];
                  values = values.filter((v) => v !== value);
                  return { ...filters, [selectedFilter]: values };
                });
              }}
              values={filters?.[selectedFilter] ?? []}
            />
          </SplitItem>
        </Split>
      </ToolbarItem>
    </>
  );
}

export function PageToolbarFilters(props: PageToolbarFiltersProps) {
  const { toolbarFilters, setFilters, filters } = props;

  const [translations] = useFrameworkTranslations();

  const showFilterLabel = !useBreakpoint('md');

  if (!toolbarFilters) return <></>;
  if (toolbarFilters.length === 0) return <></>;
  const groupedFilters = toolbarFilters.filter((filter) => {
    return !filter.isPinned;
  });
  const pinnedFilters = toolbarFilters.filter((filter) => {
    return !!filter.isPinned;
  });

  return (
    <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="md">
      <ToolbarGroup variant="filter-group" style={{ flexWrap: 'wrap', gap: 16 }}>
        {showFilterLabel && <ToolbarItem variant="label">{translations.filter}</ToolbarItem>}
        <ToolbarContent {...{ toolbarFilters: groupedFilters, setFilters, filters }} />
        {pinnedFilters?.map((filter) => (
          <ToolbarContent key={filter.key} {...{ toolbarFilters: [filter], setFilters, filters }} />
        ))}

        {toolbarFilters?.map((filter) => {
          const values = filters?.[filter.key] || [];
          if (filter.isPinned && filter.type === ToolbarFilterType.SingleSelect) return <></>;
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

function ToolbarFilterInput(props: {
  id?: string;
  filter?: IToolbarFilter;
  values: string[];
  addFilter: (value: string) => void;
  removeFilter: (value: string) => void;
}) {
  const { filter, values, addFilter, removeFilter } = props;
  switch (filter?.type) {
    case ToolbarFilterType.Text:
      return (
        <ToolbarTextFilter
          {...props}
          comparison={filter.comparison}
          placeholder={filter.placeholder}
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
  }

  return <></>;
}

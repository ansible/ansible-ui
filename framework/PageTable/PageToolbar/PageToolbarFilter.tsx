import {
  InputGroup,
  InputGroupText,
  SelectOption,
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
import { ToolbarTextFilter, IToolbarTextFilter } from './PageToolbarFilterTypes/ToolbarTextFilter';
import {
  ToolbarSelectFilter,
  IToolbarSelectFilter,
} from './PageToolbarFilterTypes/ToolbarSelectFilter';
import { IToolbarDateFilter } from './PageToolbarFilterTypes/ToolbarDateFilter';
import { useFrameworkTranslations } from '../../useFrameworkTranslations';

export type IToolbarFilter = IToolbarTextFilter | IToolbarSelectFilter | IToolbarDateFilter;

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
                  <InputGroupText
                    style={{
                      border: 0,
                      paddingLeft: 12,
                      paddingRight: 2,
                      color: 'inherit',
                      borderRadius: '4px 0px 0px 4px',
                    }}
                  >
                    <FilterIcon />
                  </InputGroupText>
                  <InputGroupText style={{ border: 0, padding: '6px 8px', color: 'inherit' }}>
                    {toolbarFilters[0].label}
                  </InputGroupText>
                </>
              ) : (
                <>
                  <InputGroupText
                    style={{
                      border: 0,
                      paddingLeft: 12,
                      paddingRight: 12,
                      color: 'inherit',
                      borderRadius: '4px 0px 0px 4px',
                    }}
                  >
                    <FilterIcon />
                  </InputGroupText>
                  <FormGroupSelect
                    id="filter"
                    onSelect={(_, v) => setSeletedFilter(v.toString())}
                    value={selectedFilter}
                    placeholderText=""
                  >
                    {toolbarFilters.map((filter) => (
                      <SelectOption key={filter.key} value={filter.key}>
                        {filter.label}
                      </SelectOption>
                    ))}
                  </FormGroupSelect>
                </>
              )}
            </InputGroup>
          </SplitItem>
          <SplitItem isFilled>
            <ToolbarFilterInput
              id="filter-input"
              filter={toolbarFilters.find((filter) => filter.key === selectedFilter)}
              addFilter={(value: string) => {
                let values = filters?.[selectedFilter];
                if (!values) values = [];
                if (!values.includes(value)) values.push(value);
                setFilters?.({ ...filters, [selectedFilter]: values });
              }}
              removeFilter={(value: string) => {
                let values = filters?.[selectedFilter];
                if (!values) values = [];
                values = values.filter((v) => v !== value);
                setFilters?.({ ...filters, [selectedFilter]: values });
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
      <ToolbarGroup variant="filter-group">
        {showFilterLabel && <ToolbarItem variant="label">{translations.filter}</ToolbarItem>}
        <ToolbarContent {...{ toolbarFilters: groupedFilters, setFilters, filters }} />
        <ToolbarContent {...{ toolbarFilters: pinnedFilters, setFilters, filters }} />
        {toolbarFilters?.map((filter) => {
          const values = filters?.[filter.key] || [];
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
                  //TODO bug here where value is actually select filter option label... need to map
                  const newState = { ...filters };
                  value = typeof value === 'string' ? value : value.key;
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
  addFilter: (value: string) => void;
  values: string[];
  removeFilter: (value: string) => void;
}) {
  const { filter } = props;
  switch (filter?.type) {
    case 'string':
      return (
        <ToolbarTextFilter
          {...props}
          comparison={filter.comparison}
          placeholder={filter.placeholder}
        />
      );
    case 'select':
      return (
        <ToolbarSelectFilter {...props} options={filter.options} placeholder={filter.placeholder} hasSearch={filter.hasSearch}/>
      );
  }
  return <></>;
}

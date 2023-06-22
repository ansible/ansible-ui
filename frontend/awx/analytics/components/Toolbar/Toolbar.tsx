import React, { FunctionComponent } from 'react';
import { ToolbarToggleGroup } from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';

import { optionsForCategories } from './constants';
import { FilterCategoriesGroup, SortByGroup } from './Groups';
import { ApiOptionsType, AttributeType, SetValues } from './types';
import { ToolbarDateFilterWithOptions } from '../../../../../framework/PageTable/PageToolbar/PageToolbarFilterTypes/ToolbarDateFilterWithOptions';

interface Props {
  categories: ApiOptionsType;
  // Todo: update to use the QueryParams type after known
  filters: Record<string, AttributeType>;
  defaultSelected?: string;
  setFilters: SetValues;
}

const FilterableToolbarItem: FunctionComponent<Props> = ({
  categories,
  filters,
  defaultSelected = '',
  setFilters: setQueryParams,
}) => {
  const { quick_date_range, sort_options, granularity, ...restCategories } = categories;

  // Sets name attribute as a dropdown if it has predefined values
  if (Object.keys(categories).includes('name')) {
    categories.name[0].value !== null
      ? (optionsForCategories.name.type = 'select')
      : (optionsForCategories.name.type = 'text');
  }

  // Filter out elements which are not in the option object and in defaultParams
  const filterCategories = Object.keys(restCategories)
    .filter(
      (key) => Object.keys(optionsForCategories).includes(key) && Object.keys(filters).includes(key)
    )
    .reduce((obj: ApiOptionsType, key) => {
      obj[key] = restCategories[key];
      return obj;
    }, {});

  const setFilters = (key: string | undefined, value: AttributeType | undefined) => {
    setQueryParams(key, value);
  };
  // TODO make sure this is fixed on API once UI is ready
  const quickDateRangeModified = quick_date_range?.map(
    (item: { key: string; value: AttributeType }) => {
      return { value: item.key, label: item.value.toString() };
    }
  );
  const granularityModified = granularity?.map((item: { key: string; value: AttributeType }) => {
    return { value: item.key, label: item.value.toString() };
  });

  return (
    <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
      {Object.keys(filterCategories).length > 0 && (
        <FilterCategoriesGroup
          filterCategories={filterCategories}
          defaultSelected={defaultSelected}
          filters={filters}
          setFilters={setFilters}
        />
      )}
      {(quick_date_range || granularity) && (
        <ToolbarDateFilterWithOptions
          filters={filters}
          values={{ quick_date_range: quickDateRangeModified, granularity: granularityModified }}
          setFilters={setFilters}
        />
      )}
      {sort_options && (
        <SortByGroup filters={filters} setFilters={setFilters} sort_options={sort_options} />
      )}
    </ToolbarToggleGroup>
  );
};

export default FilterableToolbarItem;

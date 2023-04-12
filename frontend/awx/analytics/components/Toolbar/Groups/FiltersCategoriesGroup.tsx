import React, { FunctionComponent, useState } from 'react';
import { SelectOptionProps, ToolbarGroup } from '@patternfly/react-core';

import CategoryDropdown from './CategoryDropdown';
import ToolbarInput from './ToolbarInput';
import { optionsForCategories } from '../constants';
import { SetValues, AttributeType } from '../types';

interface Props {
  filterCategories: Record<string, SelectOptionProps[]>;
  defaultSelected: string;
  filters: Record<string, AttributeType>;
  setFilters: SetValues;
}

const FilterCategoriesGroup: FunctionComponent<Props> = ({
  filterCategories,
  defaultSelected,
  filters,
  setFilters,
}) => {
  const [currentCategory, setCurrentCategory] = useState(
    defaultSelected || Object.keys(filterCategories)[0]
  );

  return (
    <ToolbarGroup variant="filter-group">
      <CategoryDropdown
        categoryKey="category_selector"
        selected={currentCategory}
        setSelected={setCurrentCategory}
        categories={Object.keys(filterCategories).map((el) => ({
          key: el,
          name: optionsForCategories[el].name,
        }))}
      />
      {Object.keys(filterCategories).map((key) => (
        <ToolbarInput
          key={key}
          categoryKey={key}
          value={filters[key]}
          selectOptions={filterCategories[key]}
          isVisible={currentCategory === key}
          setValue={(value) => setFilters(key, value)}
        />
      ))}
    </ToolbarGroup>
  );
};

export default FilterCategoriesGroup;

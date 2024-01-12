import { ToolbarGroup } from '@patternfly/react-core';
import { SelectOptionProps } from '@patternfly/react-core/deprecated';
import { FunctionComponent, useState } from 'react';
import { optionsForCategories } from '../constants';
import { AttributeType, SetValues } from '../types';
import { CategoryDropdown } from './CategoryDropdown';
import { ToolbarInput } from './ToolbarInput';

interface Props {
  filterCategories: Record<string, SelectOptionProps[]>;
  defaultSelected: string;
  filters: Record<string, AttributeType>;
  setFilters: SetValues;
}

export const FilterCategoriesGroup: FunctionComponent<Props> = ({
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

import React, { FunctionComponent } from 'react';
import {
  ToolbarGroup,
  Button,
  SelectOptionProps,
  ButtonVariant,
  ToolbarGroupVariant,
  ToolbarItem,
} from '@patternfly/react-core';
import { SortAmountDownIcon, SortAmountUpIcon } from '@patternfly/react-icons';

import ToolbarInput from './ToolbarInput';
import { SetValues, AttributeType } from '../types';

interface Props {
  filters: Record<string, AttributeType>;
  setFilters: SetValues;
  sort_options: SelectOptionProps[];
}

const SortByGroup: FunctionComponent<Props> = ({
  filters,
  setFilters,
  sort_options,
}) => (
  <ToolbarGroup variant={ToolbarGroupVariant['filter-group']}>
    <ToolbarItem>
      <ToolbarInput
        categoryKey="sort_options"
        value={filters.sort_options}
        selectOptions={sort_options}
        setValue={(value) => setFilters('sort_options', value as string)}
      />
    </ToolbarItem>
    <ToolbarItem data-cy={'sort'}>
      <Button
        variant={ButtonVariant.control}
        data-cy={filters.sort_order === 'asc' ? 'desc' : 'asc'}
        onClick={() =>
          setFilters(
            'sort_order',
            filters.sort_order === 'asc' ? 'desc' : 'asc'
          )
        }
      >
        {filters.sort_order === 'asc' && <SortAmountUpIcon />}
        {filters.sort_order === 'desc' && <SortAmountDownIcon />}
      </Button>
    </ToolbarItem>
  </ToolbarGroup>
);

export default SortByGroup;

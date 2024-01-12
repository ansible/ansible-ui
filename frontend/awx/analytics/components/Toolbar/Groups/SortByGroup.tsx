import {
  Button,
  ButtonVariant,
  ToolbarGroup,
  ToolbarGroupVariant,
  ToolbarItem,
} from '@patternfly/react-core';
import { SelectOptionProps } from '@patternfly/react-core/deprecated';
import { SortAmountDownIcon, SortAmountUpIcon } from '@patternfly/react-icons';
import { FunctionComponent } from 'react';
import { AttributeType, SetValues } from '../types';
import { ToolbarInput } from './ToolbarInput';

interface Props {
  filters: Record<string, AttributeType>;
  setFilters: SetValues;
  sort_options: SelectOptionProps[];
}

export const SortByGroup: FunctionComponent<Props> = ({ filters, setFilters, sort_options }) => (
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
        onClick={() => setFilters('sort_order', filters.sort_order === 'asc' ? 'desc' : 'asc')}
      >
        {filters.sort_order === 'asc' && <SortAmountUpIcon />}
        {filters.sort_order === 'desc' && <SortAmountDownIcon />}
      </Button>
    </ToolbarItem>
  </ToolbarGroup>
);

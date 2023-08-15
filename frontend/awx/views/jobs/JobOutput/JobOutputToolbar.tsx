import { Toolbar, ToolbarContent } from '@patternfly/react-core';
import { Dispatch, SetStateAction } from 'react';
import { IToolbarFilter } from '../../../../../framework';
import {
  IFilterState,
  PageToolbarFilters,
} from '../../../../../framework/PageToolbar/PageToolbarFilter';

interface IJobOutputToolbarProps {
  toolbarFilters: IToolbarFilter[];
  filterState: IFilterState;
  setFilterState: Dispatch<SetStateAction<IFilterState>>;
}

export function JobOutputToolbar(props: IJobOutputToolbarProps) {
  const { toolbarFilters, filterState, setFilterState } = props;

  return (
    <Toolbar clearAllFilters={() => setFilterState({})}>
      <ToolbarContent>
        <PageToolbarFilters
          toolbarFilters={toolbarFilters}
          filterState={filterState}
          setFilterState={setFilterState}
        />
      </ToolbarContent>
    </Toolbar>
  );
}

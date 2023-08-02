import { Toolbar, ToolbarContent } from '@patternfly/react-core';
import { Dispatch, SetStateAction } from 'react';
import { IToolbarFilter } from '../../../../../framework';
import { PageToolbarFilters } from '../../../../../framework/PageTable/PageToolbar/PageToolbarFilter';

interface IJobOutputToolbarProps {
  toolbarFilters: IToolbarFilter[];
  filterState: Record<string, string[]>;
  setFilterState: Dispatch<SetStateAction<Record<string, string[]>>>;
}

export function JobOutputToolbar(props: IJobOutputToolbarProps) {
  const { toolbarFilters, filterState: filters, setFilterState: setFilters } = props;

  return (
    <Toolbar clearAllFilters={() => setFilters({})}>
      <ToolbarContent>
        <PageToolbarFilters
          toolbarFilters={toolbarFilters}
          filterState={filters}
          setFilterState={setFilters}
        />
      </ToolbarContent>
    </Toolbar>
  );
}

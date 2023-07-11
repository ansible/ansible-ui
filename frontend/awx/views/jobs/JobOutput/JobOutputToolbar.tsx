import { Toolbar, ToolbarContent } from '@patternfly/react-core';
import { IToolbarFilter } from '../../../../../framework';
import {
  FilterState,
  PageToolbarFilters,
  SetFilterState,
} from '../../../../../framework/PageTable/PageToolbar/PageToolbarFilter';

interface IJobOutputToolbarProps {
  toolbarFilters: IToolbarFilter[];
  filters: FilterState;
  setFilters: SetFilterState;
}

export function JobOutputToolbar(props: IJobOutputToolbarProps) {
  const { toolbarFilters, filters, setFilters } = props;

  return (
    <Toolbar clearAllFilters={() => setFilters(() => ({}))}>
      <ToolbarContent>
        <PageToolbarFilters
          toolbarFilters={toolbarFilters}
          filters={filters}
          setFilters={setFilters}
        />
      </ToolbarContent>
    </Toolbar>
  );
}

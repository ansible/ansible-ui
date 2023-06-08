import { Dispatch, SetStateAction } from 'react';
import { Toolbar, ToolbarContent } from '@patternfly/react-core';
import { PageToolbarFilters } from '../../../../../framework/PageTable/PageToolbar/PageToolbarFilter';
import { IToolbarFilter } from '../../../../../framework';

interface IJobOutputToolbarProps {
  toolbarFilters: IToolbarFilter[];
  filters: Record<string, string[]>;
  setFilters: Dispatch<SetStateAction<Record<string, string[]>>>;
}

export function JobOutputToolbar(props: IJobOutputToolbarProps) {
  const { toolbarFilters, filters, setFilters } = props;

  return (
    <Toolbar clearAllFilters={() => setFilters({})}>
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

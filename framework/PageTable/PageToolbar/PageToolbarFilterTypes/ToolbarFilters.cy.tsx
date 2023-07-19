/* eslint-disable i18next/no-literal-string */
import { PageSection } from '@patternfly/react-core';
import { useState } from 'react';
import { idKeyFn } from '../../../../frontend/hub/api';
import { PageTableToolbar } from '../PageToolbar';
import { IToolbarFilter, PageToolbarFiltersProps, ToolbarFilterType } from '../PageToolbarFilter';
import { IToolbarMultiSelectFilter, IToolbarSingleSelectFilter } from './ToolbarSelectFilter';

function ToolbarFiltersTest(props: Omit<PageToolbarFiltersProps, 'filterState'>) {
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const clearAllFilters = () =>
    setFilters((_filters) => ({
      // date: filters.date
    }));
  return (
    <>
      <PageTableToolbar
        keyFn={idKeyFn}
        itemCount={1}
        page={1}
        perPage={10}
        filters={filters}
        setFilters={setFilters}
        {...props}
        disablePagination
        clearAllFilters={clearAllFilters}
      />
      <PageSection>
        Filter State:
        <pre>{JSON.stringify(filters, undefined, '  ')}</pre>
      </PageSection>
    </>
  );
}

const stateFilter: IToolbarSingleSelectFilter = {
  type: ToolbarFilterType.SingleSelect,
  key: 'state',
  query: 'state',
  label: 'State',
  options: [
    { label: 'Online', value: 'online' },
    { label: 'Offline', value: 'offline' },
  ],
  placeholder: 'Filter by state',
};

const dateFilter: IToolbarSingleSelectFilter = {
  type: ToolbarFilterType.SingleSelect,
  key: 'server',
  query: 'server',
  label: 'Server',
  options: [
    { label: 'My Server 1', value: 'server1' },
    { label: 'My Server 2', value: 'server2' },
    { label: 'My Server 3', value: 'server3' },
    { label: 'My Server 4', value: 'server4' },
  ],
  placeholder: 'Filter by server',
  isPinned: true,
  isRequired: true,
};

const roleFilter: IToolbarSingleSelectFilter = {
  type: ToolbarFilterType.SingleSelect,
  key: 'role',
  query: 'role',
  label: 'Role',
  options: [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' },
  ],
  placeholder: 'Filter by role',
  isPinned: true,
};

const namespaceFilter: IToolbarMultiSelectFilter = {
  type: ToolbarFilterType.MultiSelect,
  key: 'namespace',
  query: 'namespace',
  label: 'Namespace',
  options: [
    { value: '1', label: 'Namespace 1' },
    { value: '2', label: 'Namespace 2' },
    { value: '3', label: 'Namespace 3' },
  ],
  placeholder: 'Filter by namespace',
};

const statusFilter: IToolbarMultiSelectFilter = {
  type: ToolbarFilterType.MultiSelect,
  key: 'multiselectpinned',
  query: 'multiselectpinned',
  label: 'Status',
  options: [
    { value: 'running', label: 'Running' },
    { value: 'failed', label: 'Failed' },
    { value: 'pending', label: 'Pending' },
  ],
  placeholder: 'Filter by status',
  isPinned: true,
};

const toolbarFilters: IToolbarFilter[] = [
  namespaceFilter,
  stateFilter,
  statusFilter,
  roleFilter,
  dateFilter,
];

describe('PageToolbarFilters', () => {
  it('should render pinned items', () => {
    cy.mount(<ToolbarFiltersTest toolbarFilters={toolbarFilters} />);
    cy.contains('Filter by namespace');
    cy.contains('Filter by status');
    cy.contains('Filter by role');
    cy.contains('My Server 1');
  });
});
